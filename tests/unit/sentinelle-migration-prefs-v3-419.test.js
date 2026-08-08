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
