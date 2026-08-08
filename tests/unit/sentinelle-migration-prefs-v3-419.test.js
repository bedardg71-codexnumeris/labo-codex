import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #419 — « DÉJÀ MIGRÉ » NE PEUT PAS SE RÉDUIRE À « LA CLÉ EXISTE ».
//
// ORIGINE — constat terrain du 8 août 2026, le jour même où cette migration a
// enfin tourné. #414 avait révélé que `migrerPreferencesV3` n'avait JAMAIS
// été exécutée (écouteur `db-ready` posé sur `document`, alors que l'événement
// est émis sur `window`). Une fois branchée, le dump des préférences de
// Grégoire montrait `grilleReferenceDepistage: ''`.
//
// LE PIÈGE. La migration sautait la copie dès que la clé EXISTAIT côté V3
// (`if (entree.cible in prefs) continue`) — donc y compris quand elle ne
// contenait qu'un espace réservé vide. Puis `nettoyerLegacy()` purgeait la
// source. Enchaînement complet : la vraie valeur est écartée, PUIS effacée,
// pendant que le magasin d'arrivée reste vide. Aucune erreur, aucune trace.
//
// ⚠ Ce que la migration protège légitimement, c'est un choix DÉLIBÉRÉ de
// l'utilisateur fait après une migration partielle. `false` et `0` en sont :
// ils doivent rester intouchables. `''`, `null` et `undefined` n'en sont pas.
// D'où un test explicite de ces trois valeurs plutôt qu'un test de véracité,
// qui aurait écrasé les `false` — l'erreur symétrique, et plus grave encore
// (elle toucherait TOUS les réglages désactivés volontairement).
//
// La sentinelle est COMPORTEMENTALE : elle fait tourner la vraie migration
// sur un magasin de laboratoire. Un grep de source ne verrait pas la
// différence entre les deux conditions.

// ⚠ Le laboratoire modélise le NAMESPACING, et ce détail est le cœur du test.
// `modalitesEvaluation` est namespacée par trimestre : les données vivent sous
// `a2026_modalitesEvaluation`, et la clé BRUTE n'existe pas. C'est exactement
// la forme du terrain — et la raison pour laquelle la migration ne voyait
// jamais rien à migrer tout en purgeant, elle, la clé namespacée.
// Un laboratoire qui exposerait la même donnée sous les deux clés rendrait
// l'asymétrie INVISIBLE : le test serait vert sans rien prouver.
function laboratoire(prefsV3, modalites) {
    const CLE_NAMESPACEE = 'a2026_modalitesEvaluation';
    const store = {
        preferencesUtilisateur: prefsV3,
        [CLE_NAMESPACEE]: modalites,
        preferencesAffichage: {}
        // Pas de clé brute `modalitesEvaluation` : elle n'existe pas en vrai.
    };
    const db = {
        getSync: (cle, def) => (cle in store ? store[cle] : def),
        setSync: (cle, val) => { store[cle] = val; },
        removeSync: (cle) => { delete store[cle]; },
        get: async (cle, def) => (cle in store ? store[cle] : def),
        set: async () => {}
    };
    // Module propriétaire (SSOT #328 Lot 1) : il applique le namespace.
    // La migration doit lire ET purger par ce chemin — pas l'un puis l'autre.
    const fauxWindow = {
        modalitesEvaluation: {
            lire: () => store[CLE_NAMESPACEE],
            modifier: (fn) => { fn(store[CLE_NAMESPACEE]); }
        }
    };
    const win = chargerScript('js/preferences.js', { db }, fauxWindow);
    return { win, store, modalitesActives: () => store[CLE_NAMESPACEE] };
}

describe('#419 · migration V3 — un espace réservé vide n’est pas un choix', () => {
    it('⭐ V3 contient une chaîne VIDE : la valeur legacy est adoptée, pas écartée', () => {
        // Le cas exact du terrain : grilleReferenceDepistage: '' côté V3,
        // une vraie grille côté legacy. Avant #419, la copie était sautée
        // puis la source purgée — la grille disparaissait des deux côtés.
        const { win, store } = laboratoire(
            { grilleReferenceDepistage: '' },
            { grilleReferenceDepistage: 'GRILLE_LITTERATURE_01' }
        );

        win.migrerPreferencesV3();

        expect(
            store.preferencesUtilisateur.grilleReferenceDepistage,
            'la valeur legacy a été écartée au profit d’un espace réservé vide, puis purgée'
        ).toBe('GRILLE_LITTERATURE_01');
    });

    it('V3 contient null : même traitement', () => {
        const { win, store } = laboratoire(
            { grilleReferenceDepistage: null },
            { grilleReferenceDepistage: 'GRILLE_X' }
        );
        win.migrerPreferencesV3();
        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('GRILLE_X');
    });

    it('⭐ V3 contient `false` : c’est un CHOIX, il est préservé', () => {
        // L'erreur symétrique, et la plus coûteuse : corriger #419 par un
        // simple test de véracité écraserait tous les réglages que
        // l'utilisateur a délibérément désactivés.
        const { win, store } = laboratoire(
            { activerRai: false },
            { activerRai: true }
        );
        win.migrerPreferencesV3();
        expect(
            store.preferencesUtilisateur.activerRai,
            'un `false` délibéré a été écrasé par la valeur legacy'
        ).toBe(false);
    });

    it('V3 contient `0` : c’est un choix aussi', () => {
        const { win, store } = laboratoire(
            { fenetrePatterns: 0 },
            { fenetrePatterns: 5 }
        );
        win.migrerPreferencesV3();
        expect(store.preferencesUtilisateur.fenetrePatterns).toBe(0);
    });

    it('V3 ne contient pas la clé : la valeur legacy est adoptée (comportement d’origine)', () => {
        const { win, store } = laboratoire(
            {},
            { activerRai: true }
        );
        win.migrerPreferencesV3();
        expect(store.preferencesUtilisateur.activerRai).toBe(true);
    });

    it('legacy vide ET V3 vide : rien n’est inventé', () => {
        // Ne pas remplacer un espace réservé par un autre : le champ doit
        // rester tel quel, et `obtenirPreference` retombera sur DEFAUTS.
        const { win, store } = laboratoire(
            { grilleReferenceDepistage: '' },
            { grilleReferenceDepistage: '' }
        );
        win.migrerPreferencesV3();
        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('');
    });

    it('le legacy est purgé APRÈS que la valeur a été mise à l’abri', () => {
        // L'ordre est ce qui rend la perte possible : purger une source dont
        // le contenu n'a pas été recueilli, c'est l'effacer.
        const { win, store, modalitesActives } = laboratoire(
            { grilleReferenceDepistage: '' },
            { grilleReferenceDepistage: 'GRILLE_Y', activerRai: true }
        );

        win.migrerPreferencesV3();

        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('GRILLE_Y');
        expect(modalitesActives().grilleReferenceDepistage, 'legacy non purgé').toBeUndefined();
        expect(store.preferencesAffichage, 'la clé legacy entière doit disparaître').toBeUndefined();
    });
});

// --- L'ASYMÉTRIE LECTURE/PURGE -------------------------------------------
//
// Trouvée le 8 août en lisant le dump de Grégoire : ses vraies valeurs
// vivaient dans `a2024/a2025/h2026_modalitesEvaluation`, tandis que la
// migration lisait la clé BRUTE `modalitesEvaluation` — inexistante. Elle ne
// migrait donc jamais rien, pendant que `nettoyerLegacy()` purgeait, lui, par
// le module propriétaire, c'est-à-dire la clé namespacée du trimestre actif.
//
// Une migration qui efface une clé qu'elle n'a jamais lue. Grégoire n'a été
// épargné que par un hasard : son trimestre actif n'a pas de clé
// `modalitesEvaluation`, donc la purge n'a rien trouvé à supprimer.
describe('#419 · la migration lit par le MÊME chemin qu’elle purge', () => {
    it('⭐ elle voit les valeurs derrière le module propriétaire (clé namespacée)', () => {
        // Avant le correctif : `safeGet('modalitesEvaluation')` rendait {} —
        // zéro champ migré — et la purge effaçait quand même la source.
        const { win, store } = laboratoire(
            {},
            { activerRai: true, grilleReferenceDepistage: 'GRILLE_Z' }
        );

        const rapport = win.migrerPreferencesV3();

        expect(
            store.preferencesUtilisateur.grilleReferenceDepistage,
            'la migration lit encore la clé brute : elle ne voit pas les données namespacées'
        ).toBe('GRILLE_Z');
        expect(store.preferencesUtilisateur.activerRai).toBe(true);
        expect(rapport.champsMigres).toBeGreaterThan(0);
    });

    it('⭐ rien n’est purgé tant que rien n’a été recueilli', () => {
        // Le scénario du changement de trimestre : le drapeau est DÉJÀ posé,
        // donc la migration ne repasse pas — mais `nettoyerLegacy()` tourne à
        // chaque démarrage et purgeait le trimestre nouvellement actif.
        const { win, store, modalitesActives } = laboratoire(
            {}, // magasin V3 vide : rien n'est à l'abri
            { activerRai: true, grilleReferenceDepistage: 'GRILLE_W' }
        );
        store.migrationPrefs_v3_done = true; // migration déjà « faite »

        win.migrerPreferencesV3();

        expect(
            modalitesActives().grilleReferenceDepistage,
            'purge d’une valeur que rien n’a recueillie : elle est perdue'
        ).toBe('GRILLE_W');
        expect(modalitesActives().activerRai).toBe(true);
    });

    it('la clé preferencesAffichage survit tant qu’elle porte du non-recueilli', () => {
        const { win, store } = laboratoire({}, {});
        store.preferencesAffichage = { modeClair: true };
        store.migrationPrefs_v3_done = true;

        win.migrerPreferencesV3();

        expect(
            store.preferencesAffichage,
            'clé supprimée alors que modeClair n’était pas dans le magasin V3'
        ).toBeDefined();
    });
});

// =======================================================================
// #429 — L'ENRICHISSEMENT : la migration ne lisait que le trimestre ACTIF
// =======================================================================
// Constaté au contrôle terrain du 8 août, sur le dump de Grégoire : V3 portait
// `grilleReferenceDepistage: ''` et `fenetrePatterns: 3` (défauts), pendant que
// a2024/a2025/h2026 portaient la grille réelle et `4`. Cause : le trimestre
// ACTIF (A2026, créé après le 16 avril) n'a pas de `modalitesEvaluation` — la
// migration lit par le module propriétaire, donc par LA clé du trimestre actif,
// et n'a rien trouvé. L'enrichissement balaie TOUS les trimestres, du plus
// récent au plus ancien, en LECTURE SEULE, et ne comble que les DÉFAUTS.

function laboratoireEnrichissement(prefsV3, trimestres, cles) {
    const store = Object.assign({
        preferencesUtilisateur: prefsV3,
        trimestres: trimestres
    }, cles);
    const db = {
        getSync: (cle, def) => (cle in store ? store[cle] : def),
        setSync: (cle, val) => { store[cle] = val; },
        removeSync: (cle) => { delete store[cle]; },
        get: async (cle, def) => (cle in store ? store[cle] : def),
        set: async () => {}
    };
    const win = chargerScript('js/preferences.js', { db }, {});
    return { win, store };
}

describe('#429 · l’enrichissement V3 depuis les trimestres', () => {
    const TRIMS = [
        { id: 'a2024', dateCreation: '2024-08-15' },
        { id: 'h2026', dateCreation: '2026-01-10' }
    ];

    it('récupère un champ resté au DÉFAUT — le cas réel du terrain (grille + fenêtre)', () => {
        const { win, store } = laboratoireEnrichissement(
            { grilleReferenceDepistage: '', fenetrePatterns: 3 },
            TRIMS,
            { h2026_modalitesEvaluation: { grilleReferenceDepistage: 'GRILLE_REELLE', fenetrePatterns: 4 } }
        );
        const rapport = win.enrichirPrefsV3DepuisTrimestres();

        expect(rapport.champsRecuperes).toBe(2);
        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('GRILLE_REELLE');
        expect(store.preferencesUtilisateur.fenetrePatterns).toBe(4);
    });

    it('ne touche JAMAIS une valeur qui n’est plus au défaut', () => {
        // Une valeur posée — par la migration ou par la main de l'utilisateur —
        // est intouchable : l'enrichissement comble, il ne corrige pas.
        const { win, store } = laboratoireEnrichissement(
            { grilleReferenceDepistage: 'CHOIX_RECENT' },
            TRIMS,
            { h2026_modalitesEvaluation: { grilleReferenceDepistage: 'VIEILLE_GRILLE' } }
        );
        win.enrichirPrefsV3DepuisTrimestres();

        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('CHOIX_RECENT');
    });

    it('le trimestre le plus RÉCENT gagne (dateCreation, pas l’ordre du tableau)', () => {
        // Le tableau liste a2024 APRÈS h2026 exprès : un tri absent ou inversé
        // adopterait la vieille valeur.
        const { win, store } = laboratoireEnrichissement(
            { grilleReferenceDepistage: '' },
            [
                { id: 'h2026', dateCreation: '2026-01-10' },
                { id: 'a2024', dateCreation: '2024-08-15' }
            ].reverse(),
            {
                a2024_modalitesEvaluation: { grilleReferenceDepistage: 'VIEILLE' },
                h2026_modalitesEvaluation: { grilleReferenceDepistage: 'RECENTE' }
            }
        );
        win.enrichirPrefsV3DepuisTrimestres();

        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('RECENTE');
    });

    it('ONE-SHOT : vider un champ APRÈS l’enrichissement est un choix qui tient', () => {
        // Sans drapeau, l'utilisateur qui vide sa grille de référence la
        // verrait revenir de a2024 à chaque démarrage.
        const { win, store } = laboratoireEnrichissement(
            { grilleReferenceDepistage: '' },
            TRIMS,
            { h2026_modalitesEvaluation: { grilleReferenceDepistage: 'GRILLE_REELLE' } }
        );
        win.enrichirPrefsV3DepuisTrimestres();
        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('GRILLE_REELLE');

        // L'utilisateur vide la grille (choix délibéré), puis l'app redémarre.
        store.preferencesUtilisateur.grilleReferenceDepistage = '';
        const rapport2 = win.enrichirPrefsV3DepuisTrimestres();

        expect(rapport2.champsRecuperes).toBe(0);
        expect(store.preferencesUtilisateur.grilleReferenceDepistage).toBe('');
    });

    it('LECTURE SEULE : les clés de trimestre ne sont ni modifiées ni purgées', () => {
        // L'asymétrie lecture/purge a fait #419 — le correctif de son dégât ne
        // doit pas la recréer. Les vieilles clés restent intactes : c'est
        // nettoyerLegacy (bornée au trimestre actif) qui décide des purges.
        const source = { grilleReferenceDepistage: 'GRILLE_REELLE', fenetrePatterns: 4, autreChamp: 'x' };
        const { win, store } = laboratoireEnrichissement(
            {},
            TRIMS,
            { h2026_modalitesEvaluation: source }
        );
        win.enrichirPrefsV3DepuisTrimestres();

        expect(store.h2026_modalitesEvaluation).toBe(source);
        expect(store.h2026_modalitesEvaluation).toEqual(
            { grilleReferenceDepistage: 'GRILLE_REELLE', fenetrePatterns: 4, autreChamp: 'x' }
        );
    });
});
