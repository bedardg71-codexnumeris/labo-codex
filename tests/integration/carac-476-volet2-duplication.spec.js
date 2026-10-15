/**
 * ⚠ RÉALIGNÉ LE 26 AOÛT 2026 — LA COLLISION DE DEUX CHANTIERS PARALLÈLES.
 *
 * Ce banc a été écrit le 24 août contre des `alert()`. Le MÊME JOUR, sur une AUTRE
 * branche, le chantier « une seule forme de confirmation après sauvegarde »
 * (c7bfacd9) remplaçait ces alertes par des notifications. Les deux branches ne
 * se sont rencontrées qu'à la fusion du 26 : cinq assertions attendaient encore
 * ['alert', '… dupliquée avec succès'] là où le code produit ['succes',
 * '… dupliquée !'].
 *
 * ⮕ Ce n'est pas le code qui a régressé, c'est le banc qui figeait un état périmé.
 * Vérifié en rejouant les mêmes specs sur le commit d'avant la fusion. Les
 * assertions sont donc alignées sur la forme retenue, jamais l'inverse.
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// BANC DE CARACTÉRISATION — #476 volet 2 · CE QUE LES `dupliquer*` FONT
// AUJOURD'HUI, MESURÉ AVANT DE LES FUSIONNER.
//
// ▣ POURQUOI CE BANC EXISTE. Le volet 2 fusionne les fonctions `dupliquer*`
// des cinq familles de bibliothèque. Le relevé d'ouverture (24 août 2026) a
// mesuré que sur les 24 fonctions du périmètre, DEUX SEULEMENT étaient
// exécutées par un test : `dupliquerPratique` (sentinelle-468) et
// `dupliquerPratiqueBibliotheque` (import-pratiques-inter-trimestre-briqueC).
// Les 22 autres n'avaient AUCUNE couverture comportementale.
//
// Les sentinelles des Lots 1-6 de #476 couvrent l'IDENTITÉ et le NOMMAGE des
// copies (`ajouterAvecGardeIdentite`, `nommerCopie`, `forgerInspireDe`) — pas
// la mécanique propre à chaque fonction. Deux d'entre elles sont même des
// GREPS SUR LE TEXTE SOURCE qui, après fusion, passeraient vertes sans plus
// rien vérifier (sentinelle-476-garde-identite.test.js:162 découpe les blocs
// `function dupliquer*` : plus de blocs, boucle vide, test vacant).
//
// Sans ce banc, « refactor sans changement de comportement » serait une
// AFFIRMATION. Avec lui, c'est une MESURE.
//
// ▣ CE QUE LE BANC FIGE. Pour chaque fonction : l'objet réellement écrit en
// stockage (identité, nom, auteur, provenance, drapeaux, sous-objets), le
// nombre d'éléments dans la collection, ce que l'utilisateur est informé
// (alert / notification / silence), la valeur de retour, et l'intégrité de la
// source. C'est l'OBSERVABLE — ce qui change pour Grégoire si la fusion dérape.
//
// ▣ POURQUOI EN NAVIGATEUR ET PAS EN VITEST. Les fonctions de rafraîchissement
// (`afficherListeGrilles`, `chargerGrillePourModif`…) sont INTERNES à l'IIFE de
// leur module : elles ne sont pas surchargeables depuis un test. Un banc Node
// devrait les neutraliser par un artifice ; ici elles s'exécutent pour de vrai
// contre le vrai DOM d'index.html. Seuls `prompt`, `alert` et `notifications`
// sont interceptés — ce sont des globaux d'autres fichiers, donc des coutures
// légitimes, et ce sont précisément les sorties qu'on veut lire.
//
// ▣ CE QUE LE BANC EST DEVENU (24 août 2026, après l'arbitrage). Il a d'abord
// figé le comportement TEL QU'IL ÉTAIT, écarts compris, pour que la fusion des
// Lots C et D puisse se prouver sans changement. Grégoire a ensuite tranché les
// onze décisions de
// `plans de travail/ARBITRAGE-2026-08-24-476-volet2-duplications.md` :
// neuf écarts sur dix sont déclarés DÉFAUTS, et l'orientation retenue est la
// CONVERGENCE DÉLIBÉRÉE. Les attentes ci-dessous décrivent donc désormais le
// comportement VOULU, et chaque endroit converge porte un commentaire
// « ✅ CONVERGÉ (Dn) » qui dit ce que c'était AVANT — la trace de l'ancien
// comportement est le seul moyen de reconnaître une régression qui reviendrait.
//
// ⚠ ORDRE D'ÉCRITURE, ET IL COMPTE. Les attentes neuves ont été écrites AVANT
// le code, et vues ROUGES. Converger en lançant le code puis en ajustant les
// attentes à ce qu'il produit serait une tautologie : le test ne prouverait plus
// que « le code fait ce que le code fait ».
//
// ⏸ SEULE DÉCISION NON APPLIQUÉE : D6 (identifiants de critères partagés entre
// une grille et sa copie) part en INSTRUCTION SÉPARÉE — il faut d'abord mesurer
// ce que ça produit dans le module Évaluation. Le banc continue donc de figer
// le comportement actuel sur ce point, sans le bénir.
//
// ▣ ATTENTION AU LANCEMENT. La config du dépôt cible WebKit — Safari est la
// cible de production, et c'est bien sous WebKit que ce banc doit faire foi :
//     cd tests && npx playwright test integration/carac-476-volet2-duplication.spec.js
// Le banc a été MIS AU POINT sur Chromium, seul navigateur présent dans le
// conteneur de la session du 24 août, via une config hors dépôt (non versionnée,
// pour ne pas affaiblir la cible WebKit du dépôt). Le passage WebKit — et le
// passage iPad — restent donc une PORTE TERRAIN DUE : tant qu'ils n'ont pas eu
// lieu, ce banc atteste d'un comportement Chromium, pas du comportement de
// production.
//
// ▣ BREAK-TESTS (faits le 24 août 2026, un par famille, tous restaurés). Une
// caractérisation qui ne peut pas rougir ne caractérise rien :
//  · grilles     — forcer `isDemo: false` dans dupliquerGrilleDepuisSidebar ;
//  · échelles    — remplacer `nommerCopie` par une concaténation nue ;
//  · cartouches  — ajouter `delete nouveauCartouche.metadata_cc` ;
//  · productions — remplacer la concaténation nue par `nommerCopie` ;
//  · pratiques   — retirer `delete nouvellePratique.estGabarit` (ligne 1007 —
//    attention, ce fichier en contient DEUX occurrences ; muter la mauvaise
//    laisse le banc vert et fait croire à tort qu'il ne surveille rien).
//
// ▣ UNE LEÇON DU BREAK-TEST, INSCRITE ICI POUR LA FUSION. Un premier jeu
// d'assertions sur les noms de copie s'est révélé NON DISCRIMINANT : sur une
// première copie, `nommerCopie` et `${nom} (copie)` rendent le même texte. Il a
// fallu le bloc « CO-24 · la chaîne des copies » (deux duplications d'affilée)
// pour que la différence devienne observable. Toute assertion de nom ajoutée
// ici doit passer par une chaîne d'au moins deux maillons.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

/**
 * Exécute une fonction de duplication sur une collection amorcée, et rend la
 * trace observable.
 *
 * @param {object} page
 * @param {object} spec
 * @param {string} [spec.cleNom]    - nom logique passé à `window.cle()`
 * @param {string} [spec.cleBrute]   - clé littérale (cartouches : `cartouches_<grilleId>`)
 * @param {Array}  [spec.amorces]    - paires [clé brute, valeur] amorcées en plus
 * @param {object|Array} spec.source - l'item (ou les items) amorcés
 * @param {[string, Array]} spec.appel - [nom de la fonction globale, arguments]
 * @param {[string, Array]} [spec.avant] - appel préalable (pose l'état d'éditeur
 *        des variantes « Active », qui lisent une variable interne au module)
 * @param {number} [spec.attendreMs] - laisse retomber une écriture non attendue
 */
async function caracteriser(page, spec) {
    return page.evaluate(async ({ cleNom, cleBrute, source, appel, avant, attendreMs, amorces }) => {
        const cle = cleBrute || window.cle(cleNom);
        for (const [k, v] of (amorces || [])) {
            await db.set(k, v);
            try { db.memoryCache.set(k, JSON.parse(JSON.stringify(v))); } catch (e) { /* cache best-effort */ }
        }
        const sources = Array.isArray(source) ? source : [source];
        const idsSources = sources.map((s) => s.id);
        await db.set(cle, JSON.parse(JSON.stringify(sources)));
        // Les pratiques lisent par `db.getSync` : le cache mémoire doit voir l'amorce.
        try { db.memoryCache.set(cle, JSON.parse(JSON.stringify(sources))); } catch (e) { /* cache best-effort */ }

        // Coutures : les trois sorties utilisateur, toutes globales d'autres
        // fichiers, donc réellement surchargeables (les modules sont des IIFE).
        const msgs = [];
        window.alert = (m) => msgs.push(['alert', String(m)]);
        window.confirm = () => true;
        window.prompt = (q, defaut) => { msgs.push(['prompt-defaut', String(defaut)]); return 'NOM CHOISI'; };
        window.notifications = {
            succes: (m) => msgs.push(['succes', String(m)]),
            erreur: (m) => msgs.push(['erreur', String(m)]),
            info: () => {},
            avertissement: () => {}
        };

        if (avant) { try { await window[avant[0]](...avant[1]); } catch (e) { /* état d'éditeur best-effort */ } }
        msgs.length = 0;

        let retour, erreur = null;
        try {
            retour = await window[appel[0]](...appel[1]);
        } catch (e) {
            erreur = String(e && e.message ? e.message : e).slice(0, 300);
        }
        // Les variantes « Active » synchrones lancent une async sans l'attendre.
        if (attendreMs) await new Promise((r) => setTimeout(r, attendreMs));

        const apres = (await db.get(cle)) || [];
        const copie = apres.find((x) => !idsSources.includes(x.id)) || null;
        const resteSource = apres.find((x) => x.id === idsSources[0]) || null;

        const resume = (o) => o && ({
            prefixeId: String(o.id).split('_')[0],
            idNeuf: !idsSources.includes(o.id),
            nom: o.nom,
            titre: o.titre,
            auteur: o.auteur,
            isDemo: o.isDemo,
            inspireDe: o.inspireDe ? Object.keys(o.inspireDe).sort() : null,
            inspireDeNom: o.inspireDe ? o.inspireDe.nom : null,
            baseSur: o.baseSur,
            dansBibliotheque: o.dansBibliotheque,
            verrouille: o.verrouille,
            aDateCreation: typeof o.dateCreation === 'string',
            metadata_cc: o.metadata_cc === undefined ? 'absent' : 'present',
            estGabarit: o.estGabarit,
            activite: o.activiteApprentissage,
            description: o.description,
            aConfig: o.config !== undefined,
            aConfiguration: o.configuration !== undefined,
            criteresIds: o.criteres ? o.criteres.map((c) => c.id) : undefined,
            niveauxNb: o.niveaux ? o.niveaux.length : undefined,
            commentairesCles: o.commentaires ? Object.keys(o.commentaires).sort() : undefined
        });

        return {
            n: apres.length,
            erreur,
            retourType: retour === undefined ? 'undefined' : (retour === null ? 'null' : typeof retour),
            msgs,
            copie: resume(copie),
            sourceIntacte: resume(resteSource)
        };
    }, spec);
}

/** Amorce commune : une source « riche » pour voir ce qui survit à la copie. */
const GRILLE_SOURCE = {
    id: 'GR_SRC',
    nom: 'Grille source',
    criteres: [{ id: 'CR_1', nom: 'Critère 1' }, { id: 'CR_2', nom: 'Critère 2' }],
    auteur: 'Alice',
    isDemo: true,
    verrouille: true,
    dansBibliotheque: true,
    metadata_cc: { licence: 'CC BY' }
};

// ▣ ÉTANCHÉITÉ — LA LEÇON DU 24 AOÛT, PAYÉE COMPTANT.
// Tous les specs ouvrent le MÊME index.html en `file://` et partagent donc le
// localStorage de cette origine (c'est pourquoi playwright.config.js impose
// `workers: 1`). Une première version de ce banc amorçait `grillesTemplates`,
// `echellesTemplates`, `cartouches_GR_X`, `productions` et
// `pratiquesConfigurables` sans jamais nettoyer : la suite complète est passée
// 84/84 une fois, puis a rendu 10 rouges à l'exécution suivante — dans des
// specs sans aucun rapport (comparateur #326, bascule de trimestre CT-05…).
// Un banc qui laisse ses fixtures derrière lui ne casse pas ses propres tests :
// il casse ceux des autres, par intermittence, et l'enquête part dans le décor.
// D'où le nettoyage ci-dessous, qui court APRÈS CHAQUE CAS, y compris en échec.
const CLES_TOUCHEES = [
    'grillesTemplates', 'echellesTemplates', 'productions', 'pratiquesConfigurables'
];

test.beforeEach(async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
});

test.afterEach(async ({ page }) => {
    await page.evaluate(async (clesLogiques) => {
        const aRetirer = [];
        for (const nom of clesLogiques) aRetirer.push(window.cle(nom), nom);
        // Les cartouches sont namespacées par grille porteuse, pas par `cle()`.
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('cartouches_') !== -1) aRetirer.push(k);
        }
        for (const k of aRetirer) {
            try { localStorage.removeItem(k); } catch (e) { /* rien à retirer */ }
            try { db.memoryCache.delete(k); } catch (e) { /* cache absent */ }
        }
    }, CLES_TOUCHEES).catch(() => { /* page déjà fermée : rien à nettoyer */ });
});

/* ================================================================== */
/* FAMILLE GRILLES — 5 fonctions                                       */
/* ================================================================== */

test.describe('#476 volet 2 · caractérisation — grilles', () => {
    test('dupliquerGrille — invite, RECONSTRUIT l\'objet, régénère les ID de critères', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            appel: ['dupliquerGrille', ['GR_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // L'invite propose le nom de copie normalisé (CO-24), puis le test répond.
        expect(r.msgs[0]).toEqual(['prompt-defaut', 'Grille source (copie)']);
        expect(r.copie.nom).toBe('NOM CHOISI');
        expect(r.copie.prefixeId).toBe('GRILLE');
        expect(r.copie.auteur).toBe('Inconnu');            // profil CC absent → repli
        expect(r.copie.isDemo).toBe(false);
        // ✅ CONVERGÉ (D5) — provenance complète, `sourceId` compris. AVANT :
        // trois clés construites à la main, sans `sourceId` : on ne pouvait pas
        // dire de QUELLE grille homonyme venait la copie.
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        // ⚠ ÉCART CONSERVÉ — objet RECONSTRUIT champ par champ, pas étalé : tout
        // ce qui n'est pas listé dans la fonction est PERDU. `verrouille: true`
        // et `metadata_cc` de la source ne passent pas.
        expect(r.copie.verrouille).toBeUndefined();
        expect(r.copie.metadata_cc).toBe('absent');
        // Les ID de critères sont RÉGÉNÉRÉS ici — seule des cinq à le faire.
        expect(r.copie.criteresIds).toHaveLength(2);
        expect(r.copie.criteresIds[0]).not.toBe('CR_1');
        expect(r.copie.criteresIds[1]).not.toBe('CR_2');
        expect(r.msgs.some(([k, m]) => k === 'succes' && m.includes('NOM CHOISI'))).toBe(true);
        expect(r.sourceIntacte.criteresIds).toEqual(['CR_1', 'CR_2']);
    });

    test('dupliquerGrilleBibliotheque — sans invite, étale la source, retire les métadonnées de partage', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            appel: ['dupliquerGrilleBibliotheque', ['GR_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);                         // aucune sortie utilisateur
        expect(r.copie.nom).toBe('Grille source (copie)');  // nommerCopie, pas d'invite
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        // ✅ CONVERGÉ (D5) — provenance complète, `sourceId` compris.
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');         // supprimé explicitement
        // Étalement : `verrouille` de la source SURVIT (contrairement à dupliquerGrille).
        expect(r.copie.verrouille).toBe(true);
        // Les ID de critères sont CONSERVÉS (copie superficielle du tableau).
        expect(r.copie.criteresIds).toEqual(['CR_1', 'CR_2']);
    });

    test('dupliquerEtEditerGrille — passe par forkerItem : inspireDe porte sourceId', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            appel: ['dupliquerEtEditerGrille', ['GR_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        expect(r.copie.nom).toBe('Grille source (copie)');
        expect(r.copie.isDemo).toBe(false);
        // forgerInspireDe ajoute `sourceId` — la seule des cinq voies à le poser.
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);              // clone profond intégral
        expect(r.copie.criteresIds).toEqual(['CR_1', 'CR_2']);
    });

    test('dupliquerGrilleDepuisSidebar — la copie devient TIENNE : attribuée, éditable, tracée', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            appel: ['dupliquerGrilleDepuisSidebar', ['GR_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.copie.nom).toBe('Grille source (copie)');
        expect(r.copie.verrouille).toBe(false);
        // ✅ CONVERGÉ (D1 + D4 + D5) — LE PLUS GROS DÉFAUT DU LOT, CORRIGÉ.
        // AVANT : cette voie ne posait NI auteur, NI isDemo, NI inspireDe, et ne
        // retirait PAS metadata_cc. Conséquence mesurée : `estItemDemo` rend vrai
        // sur `isDemo === true` OU sur l'auteur `Demo Labo Codex` — la copie
        // gardait LES DEUX, et `appliquerModeLectureSeuleDemo` désactivait alors
        // tous ses champs. Dupliquer un exemple depuis la barre latérale rendait
        // une copie QU'ON NE POUVAIT TOUJOURS PAS MODIFIER, soit exactement ce que
        // le geste est censé débloquer.
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.criteresIds).toEqual(['CR_1', 'CR_2']);
        expect(r.msgs).toEqual([['succes', 'Grille "Grille source (copie)" dupliquée !']]);
    });

    test('dupliquerGrilleActive — attend son écriture, comme son homologue échelles', async ({ page }) => {
        // ✅ CONVERGÉ (D10). AVANT : seule des 22 déclarée `function` et non
        // `async function`, elle lançait `dupliquerGrilleDepuisSidebar` sans
        // `await` et rendait la main avant l'écriture. Un appelant qui enchaînait
        // sur son retour lisait un état d'AVANT la copie.
        //
        // On vérifie le fait STRUCTUREL (la valeur rendue est attendable), pas
        // l'issue d'une course : asserter « la copie est déjà écrite » serait un
        // test à bascule, vert ou rouge selon la vitesse de la machine.
        const nature = await page.evaluate(async () => {
            const cle = window.cle('grillesTemplates');
            await db.set(cle, [{ id: 'GR_SRC', nom: 'Grille source', criteres: [] }]);
            window.alert = () => {};
            await window.chargerGrillePourModif('GR_SRC');
            const rGrille = window.dupliquerGrilleActive();
            const rEchelle = window.dupliquerEchelleActive();
            const estThenable = (v) => !!v && typeof v.then === 'function';
            if (estThenable(rEchelle)) { try { await rEchelle; } catch (e) { /* sans état */ } }
            return { grilleThenable: estThenable(rGrille), echelleThenable: estThenable(rEchelle) };
        });

        expect(nature.grilleThenable).toBe(true);    // rend désormais un attendable
        expect(nature.echelleThenable).toBe(true);   // son homologue, déjà

        // L'écriture finit bien par avoir lieu — c'est le fond du comportement.
        const apres = await caracteriser(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            avant: ['chargerGrillePourModif', ['GR_SRC']],
            appel: ['dupliquerGrilleActive', []],
            attendreMs: 500
        });
        expect(apres.n).toBe(2);
        expect(apres.copie.nom).toBe('Grille source (copie)');
        expect(apres.copie.verrouille).toBe(false);   // via DepuisSidebar
    });
});

/* ================================================================== */
/* FAMILLE ÉCHELLES — 5 fonctions                                      */
/* ================================================================== */

const ECHELLE_SOURCE = {
    id: 'ECH_SRC',
    nom: 'Echelle source',
    niveaux: [{ code: 'A' }, { code: 'B' }],
    config: { seuil: 1 },
    auteur: 'Alice',
    isDemo: true,
    verrouille: true,
    dansBibliotheque: true,
    metadata_cc: { licence: 'CC BY' }
};

test.describe('#476 volet 2 · caractérisation — échelles', () => {
    test('dupliquerEchelle — invite, RECONSTRUIT l\'objet, mais pose inspireDe via forgerInspireDe', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            appel: ['dupliquerEchelle', ['ECH_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs[0]).toEqual(['prompt-defaut', 'Echelle source (copie)']);
        expect(r.copie.nom).toBe('NOM CHOISI');
        expect(r.copie.prefixeId).toBe('ECH');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        // ⚠ DIVERGENCE AVEC SA JUMELLE `dupliquerGrille` : celle-ci passe par
        // `BibliothequeUI.forgerInspireDe` (4 clés, dont `sourceId`), là où
        // `dupliquerGrille` construit l'objet à la main (3 clés). Même rôle,
        // deux traces de provenance différentes.
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        // Objet reconstruit : `verrouille` et `metadata_cc` de la source sont perdus.
        expect(r.copie.verrouille).toBeUndefined();
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.niveauxNb).toBe(2);
        expect(r.msgs.some(([k, m]) => k === 'succes' && m.includes('NOM CHOISI'))).toBe(true);
    });

    test('dupliquerEchelleBibliotheque — sans invite, étale la source, retire les métadonnées de partage', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            appel: ['dupliquerEchelleBibliotheque', ['ECH_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        expect(r.copie.nom).toBe('Echelle source (copie)');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);       // étalement : survit
        expect(r.copie.niveauxNb).toBe(2);
    });

    test('dupliquerEtEditerEchelle — forkerItem : même sortie que la voie bibliothèque, en silence', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            appel: ['dupliquerEtEditerEchelle', ['ECH_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        expect(r.copie.nom).toBe('Echelle source (copie)');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);
        expect(r.copie.niveauxNb).toBe(2);
    });

    test('dupliquerEchelleDepuisSidebar — la copie devient TIENNE : attribuée, éditable, tracée', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            appel: ['dupliquerEchelleDepuisSidebar', ['ECH_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.copie.nom).toBe('Echelle source (copie)');
        expect(r.copie.verrouille).toBe(false);
        // ✅ CONVERGÉ (D1 + D4 + D5) — même correctif que côté grilles : c'était
        // le même angle mort, sur la même voie « barre latérale ».
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.msgs).toEqual([['succes', 'Échelle "Echelle source (copie)" dupliquée !']]);
    });

    test('dupliquerEchelleActive — relais qui ATTEND, contrairement à son homologue grilles', async ({ page }) => {
        // Le contraste est le fait à retenir : `dupliquerEchelleActive` est
        // `async` et fait `await dupliquerEchelleDepuisSidebar(...)`, quand
        // `dupliquerGrilleActive` est synchrone et n'attend pas. Sans attente
        // supplémentaire, l'écriture est déjà visible ici.
        const r = await caracteriser(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            avant: ['chargerEchellePourModif', ['ECH_SRC']],
            appel: ['dupliquerEchelleActive', []]
        });

        expect(r.n).toBe(2);
        expect(r.copie.nom).toBe('Echelle source (copie)');
        expect(r.copie.verrouille).toBe(false);
        expect(r.msgs).toEqual([['succes', 'Échelle "Echelle source (copie)" dupliquée !']]);
    });
});

/* ================================================================== */
/* FAMILLE CARTOUCHES — 4 fonctions                                    */
/* ================================================================== */

// Les cartouches sont la seule famille dont la clé est PARAMÉTRÉE par la
// grille porteuse : `cartouches_<grilleId>`, sans passer par `window.cle()`.
// C'est la contrainte structurante pour la fusion — le descripteur de famille
// devra accepter une clé calculée, pas seulement un nom constant.
const GRILLE_PORTEUSE = { id: 'GR_X', nom: 'Grille porteuse', criteres: [{ id: 'CR_1', nom: 'C1' }] };
const CARTOUCHE_SOURCE = {
    id: 'CART_SRC',
    nom: 'Cartouche source',
    commentaires: { CR_1: 'un commentaire' },
    auteur: 'Alice',
    isDemo: true,
    verrouille: true,
    dansBibliotheque: true,
    metadata_cc: { licence: 'CC BY' }
};
const AMORCE_CARTOUCHES = () => [['grillesTemplates', [GRILLE_PORTEUSE]]];

test.describe('#476 volet 2 · caractérisation — cartouches', () => {
    test('dupliquerCartouche — étale, force verrouille, mais NE retire PAS metadata_cc', async ({ page }) => {
        const r = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            appel: ['dupliquerCartouche', ['CART_SRC', 'GR_X']]
        });

        expect(r.n).toBe(2);
        expect(r.copie.nom).toBe('Cartouche source (copie)');
        expect(r.copie.prefixeId).toBe('CART');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.verrouille).toBe(false);        // forcé, comme DepuisSidebar
        expect(r.copie.commentairesCles).toEqual(['CR_1']);
        // ✅ CONVERGÉ (D4). AVANT : cette voie ne supprimait ni `metadata_cc` ni
        // `auteurOriginal` — la copie gardait la licence de partage de la source
        // et se présentait encore comme le document du collègue.
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.aDateCreation).toBe(false);      // pas de dateCreation posée
        expect(r.msgs).toEqual([]);
    });

    test('dupliquerCartoucheBibliotheque — la voie complète : dateCreation posée, metadata_cc retiré', async ({ page }) => {
        const r = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            appel: ['dupliquerCartoucheBibliotheque', ['CART_SRC', 'GR_X']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        expect(r.copie.nom).toBe('Cartouche source (copie)');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);          // étalement, non forcé
        expect(r.copie.commentairesCles).toEqual(['CR_1']);
    });

    test('dupliquerEtEditerCartouche — forkerItem, sur la grille de la cartouche EN COURS', async ({ page }) => {
        // Particularité : cette voie ne reçoit pas la grille en argument, elle
        // la lit dans l'état d'éditeur (`cartoucheActuel.grilleId`). Sans
        // cartouche active, elle alerte et sort — c'est ce que le premier volet
        // du test vérifie, avant de poser l'état pour le second.
        const sansEtat = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            appel: ['dupliquerEtEditerCartouche', ['CART_SRC']]
        });
        expect(sansEtat.n).toBe(1);
        expect(sansEtat.msgs).toEqual([['alert', 'Grille introuvable pour cette cartouche']]);

        const avecEtat = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            avant: ['chargerCartouchePourModif', ['CART_SRC', 'GR_X']],
            appel: ['dupliquerEtEditerCartouche', ['CART_SRC']]
        });
        expect(avecEtat.n).toBe(2);
        expect(avecEtat.copie.nom).toBe('Cartouche source (copie)');
        expect(avecEtat.copie.isDemo).toBe(false);
        expect(avecEtat.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(avecEtat.copie.metadata_cc).toBe('absent');
        expect(avecEtat.copie.verrouille).toBe(true);
        expect(avecEtat.copie.aDateCreation).toBe(true);
    });

    test('dupliquerCartoucheActive — délègue à dupliquerCartouche, ou alerte sans état', async ({ page }) => {
        const sansEtat = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            appel: ['dupliquerCartoucheActive', []]
        });
        expect(sansEtat.n).toBe(1);
        expect(sansEtat.msgs).toEqual([['alert', 'Aucune cartouche à dupliquer']]);

        const avecEtat = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            avant: ['chargerCartouchePourModif', ['CART_SRC', 'GR_X']],
            appel: ['dupliquerCartoucheActive', []]
        });
        expect(avecEtat.n).toBe(2);
        // Hérite du profil de `dupliquerCartouche`, désormais convergé (D4).
        expect(avecEtat.copie.metadata_cc).toBe('absent');
        expect(avecEtat.copie.verrouille).toBe(false);
    });
});

/* ================================================================== */
/* FAMILLE PRODUCTIONS — 4 fonctions                                   */
/* ================================================================== */

// Les productions sont la famille la plus hétérogène : leur champ de nom est
// `titre`, pas `nom`, et TROIS des quatre voies concatènent « (copie) » à la
// main au lieu de passer par `nommerCopie`. C'est le défaut CO-24 — que le
// Lot 5 a corrigé partout AILLEURS. La sentinelle CO-24
// (sentinelle-476-garde-identite.test.js:236) ne vérifie en effet que
// grilles.js, echelles.js, cartouches.js et bibliotheque-ui.js : les deux
// fichiers de productions ne sont pas dans sa liste.
const PRODUCTION_SOURCE = {
    id: 'PROD_SRC',
    titre: 'Prod source',
    activiteApprentissage: 'Activite',
    description: 'Desc',
    auteur: 'Alice',
    isDemo: true,
    verrouille: true,
    dansBibliotheque: true,
    metadata_cc: { licence: 'CC BY' }
};

test.describe('#476 volet 2 · caractérisation — productions', () => {
    test('dupliquerProduction — renomme le TITRE et laisse activité et description intactes', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerProduction', ['PROD_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // ✅ CONVERGÉ (D2 + D4 + D5) — LE PLUS SURPRENANT DE LA FAMILLE, CORRIGÉ.
        // AVANT : le `titre` — le champ que l'utilisateur VOIT dans sa liste —
        // restait IDENTIQUE à celui de la source, si bien que rien ne distinguait
        // la copie de l'originale. Ce sont `activiteApprentissage` et
        // `description` qui recevaient « (copie) », et la description était
        // ÉCRASÉE par l'activité au passage : un texte perdu sans avertissement.
        expect(r.copie.titre).toBe('Prod source (copie)');
        expect(r.copie.activite).toBe('Activite');
        expect(r.copie.description).toBe('Desc');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        // #489 (15 oct. 2026) : le verrou d'une production entière est retiré, la copie ne porte plus le champ.
        expect(r.copie.verrouille).toBeUndefined();
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.aDateCreation).toBe(false);
        // ⚠ Le message nomme l'ACTIVITÉ d'apprentissage, pas le titre : c'est le
        // libellé courant d'une production à l'écran. Le titre, lui, reçoit bien
        // « (copie) » — c'est ce que vérifient les assertions au-dessus.
        expect(r.msgs).toEqual([['succes', 'Production "Activite" dupliquée !']]);
    });

    test('dupliquerProductionBibliotheque — suffixe le titre par nommerCopie', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerProductionBibliotheque', ['PROD_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        // ✅ CONVERGÉ (D3 + D5). AVANT : `${production.titre} (copie)`, une
        // concaténation nue — dupliquer une copie rendait « X (copie) (copie) ».
        // C'est CO-24, réputé clos et pourtant vivant ici, faute que la sentinelle
        // du Lot 5 lise ce fichier. La chaîne de deux maillons plus bas est ce qui
        // rend la correction observable.
        expect(r.copie.titre).toBe('Prod source (copie)');
        expect(r.copie.activite).toBe('Activite');
        expect(r.copie.description).toBe('Desc');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);
    });

    test('dupliquerEtEditerProduction — nomme par `titre` seul, sans inventer de champ `nom`', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerEtEditerProduction', ['PROD_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        // ✅ CONVERGÉ (D9). AVANT : `forkerItem` écrivait
        // `copie.nom = nommerCopie(nom || titre)` ; une production n'ayant pas de
        // `nom`, la copie en recevait un qui n'existait pas sur la source — deux
        // champs de nom sur la copie, un seul sur l'originale.
        expect(r.copie.nom).toBeUndefined();
        expect(r.sourceIntacte.nom).toBeUndefined();
        // ✅ CONVERGÉ — le `titre` passe par `nommerCopie`, plus par concaténation.
        // ⚠ CE POINT ÉTEND D3, QUI NE NOMMAIT PAS CETTE FONCTION : la même
        // concaténation nue vivait ici. La corriger relève du principe de D3 et de
        // l'orientation « convergence » (D0), mais Grégoire ne l'a pas arbitrée
        // nommément — à signaler plutôt qu'à faire passer pour acquis.
        expect(r.copie.titre).toBe('Prod source (copie)');
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);
    });

    test('dupliquerProductionActive — sans production en édition, alerte et ne fait rien', async ({ page }) => {
        // `productionEnEdition` est un ID (pas un objet) interne au module. Le
        // banc fige ici le seul comportement atteignable sans état d'éditeur —
        // et c'est le cas qui compte : la garde ne doit pas disparaître à la fusion.
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerProductionActive', []]
        });

        expect(r.n).toBe(1);
        expect(r.copie).toBeNull();
        expect(r.msgs).toEqual([['alert', 'Aucune production en cours d\'édition']]);
    });
});

/* ================================================================== */
/* FAMILLE PRATIQUES — 4 fonctions                                     */
/* ================================================================== */

// Les pratiques sont la famille la plus éloignée du patron commun :
//  · lecture par `db.getSync` (localStorage synchrone), pas `await db.get` ;
//  · `dupliquerPratique` écrit par `PratiqueManager.sauvegarderPratique`, pas
//    par `db.set`, et RETOURNE l'id de la copie ;
//  · elle porte toute la logique canonique #326 (`construireConfigComplete`,
//    dualité `.config` / `.configuration`, `estMaquette` en opt-in).
// C'est la famille à fusionner EN DERNIER, si elle doit l'être.
const PRATIQUE_SOURCE = {
    id: 'pratique_SRC',
    nom: 'Pratique source',
    description: 'une description',
    type: 'standards',
    calcul_note: { methode: 'moyenne_ponderee' },
    configuration: { seuil: 3 },
    config: {
        id: 'pratique_SRC', nom: 'Pratique source', type: 'standards',
        calcul_note: { methode: 'moyenne_ponderee' }, configuration: { seuil: 3 }
    },
    auteur: 'Alice',
    isDemo: true,
    dansBibliotheque: true,
    estGabarit: true,
    metadata_cc: { licence: 'CC BY' }
};

test.describe('#476 volet 2 · caractérisation — pratiques', () => {
    test('dupliquerPratique — l\'invite propose le nom de la source, RETOURNE un id, confirme', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            appel: ['dupliquerPratique', ['pratique_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // ✅ CONVERGÉ (D8). AVANT : la seule des 22 dont l'invite ne proposait PAS
        // le nom de la source — elle proposait la constante « Copie de pratique »,
        // qui ne dit pas de quoi c'est la copie, et ne consultait pas `nommerCopie`.
        expect(r.msgs[0]).toEqual(['prompt-defaut', 'Pratique source (copie)']);
        expect(r.copie.nom).toBe('NOM CHOISI');
        expect(r.copie.prefixeId).toBe('pratique');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        // Forme canonique #326 : config exécutable ET configuration au top-level.
        expect(r.copie.aConfig).toBe(true);
        expect(r.copie.aConfiguration).toBe(true);
        // Objet reconstruit champ par champ : estGabarit et metadata_cc tombent.
        expect(r.copie.estGabarit).toBeUndefined();
        expect(r.copie.metadata_cc).toBe('absent');
        // Seule des 22 à rendre une valeur exploitable : l'id de la copie.
        expect(r.retourType).toBe('string');
        expect(r.msgs.some(([k, m]) => k === 'succes' && m.includes('NOM CHOISI'))).toBe(true);
    });

    test('dupliquerPratiqueBibliotheque — clone profond, retire estGabarit, RETOURNE la copie', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            appel: ['dupliquerPratiqueBibliotheque', ['pratique_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        expect(r.copie.nom).toBe('Pratique source (copie)');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.estGabarit).toBeUndefined();     // « ce n'est plus un gabarit »
        expect(r.retourType).toBe('object');            // parité copierPratiqueDepuisTrimestre
    });

    test('dupliquerEtEditerPratique — la copie cesse d\'être un gabarit, comme sa voisine', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            appel: ['dupliquerEtEditerPratique', ['pratique_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        expect(r.copie.nom).toBe('Pratique source (copie)');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.metadata_cc).toBe('absent');
        // ✅ CONVERGÉ (D7). AVANT : `forkerItem` ne connaissait pas `estGabarit`,
        // si bien que la copie restait marquée gabarit là où
        // `dupliquerPratiqueBibliotheque` le retirait. Deux « dupliquer » voisins
        // rendaient deux natures de copie. Verdict de Grégoire : c'est le
        // comportement bibliothèque qui fait foi.
        expect(r.copie.estGabarit).toBeUndefined();
    });

    test('dupliquerPratiqueMateriel — clone profond, notification, nom par nommerCopie', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            appel: ['dupliquerPratiqueMateriel', ['pratique_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // ✅ CONVERGÉ (D3) — `nommerCopie` remplace la concaténation nue
        // `${original.nom} (copie)`. Comme pour les productions,
        // `pratiques-gestion.js` n'était pas dans la liste surveillée par la
        // sentinelle CO-24, d'où l'oubli.
        expect(r.copie.nom).toBe('Pratique source (copie)');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.aDateCreation).toBe(true);
        // ✅ CONVERGÉ (D4 + D7) — AVANT : ni `metadata_cc` ni `estGabarit` n'étaient
        // retirés, la copie gardant la licence de la source et sa nature de gabarit.
        expect(r.copie.estGabarit).toBeUndefined();
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.msgs).toEqual([['succes', 'Pratique dupliquée']]);
    });
});

/* ================================================================== */
/* CO-24 — LA CHAÎNE DES COPIES, LÀ OÙ ELLE S'EMPILE ENCORE            */
/* ================================================================== */

// Une SEULE duplication ne distingue pas `nommerCopie` d'une concaténation nue :
// les deux rendent « X (copie) ». La différence n'apparaît qu'au DEUXIÈME
// maillon — `nommerCopie` normalise (« X (copie 2) »), la concaténation empile
// (« X (copie) (copie) »). Les assertions ci-dessus, prises seules, ne
// verrouillaient donc rien sur ce point : ce bloc est ce qui les rend
// discriminantes, et il fige quelles voies sont encore à la traîne.
//
// Le Lot 5 de #476 a câblé `nommerCopie` — mais sa sentinelle
// (sentinelle-476-garde-identite.test.js:236) ne surveille que grilles.js,
// echelles.js, cartouches.js et bibliotheque-ui.js. `productions-liste.js`,
// `productions-bibliotheque-ui.js` et `pratiques-gestion.js` n'y sont pas.

/** Duplique la source, puis duplique la copie ; rend les deux noms obtenus. */
async function chaineDeCopies(page, { cleNom, source, fonction, champNom, args = [] }) {
    return page.evaluate(async ({ cleNom, source, fonction, champNom, args }) => {
        const cle = window.cle(cleNom);
        await db.set(cle, [JSON.parse(JSON.stringify(source))]);
        try { db.memoryCache.set(cle, [JSON.parse(JSON.stringify(source))]); } catch (e) { /* best-effort */ }
        window.alert = () => {}; window.confirm = () => true;
        window.prompt = (q, d) => d;   // on ACCEPTE le nom proposé : c'est lui qu'on mesure
        window.notifications = { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} };

        await window[fonction](source.id, ...args);
        let liste = (await db.get(cle)) || [];
        const premiere = liste.find((x) => x.id !== source.id);
        if (!premiere) return { erreur: 'première copie absente' };

        try { db.memoryCache.set(cle, JSON.parse(JSON.stringify(liste))); } catch (e) { /* best-effort */ }
        await window[fonction](premiere.id, ...args);
        liste = (await db.get(cle)) || [];
        const seconde = liste.find((x) => x.id !== source.id && x.id !== premiere.id);

        return {
            nombre: liste.length,
            premier: premiere[champNom],
            second: seconde ? seconde[champNom] : null
        };
    }, { cleNom, source, fonction, champNom, args });
}

test.describe('#476 volet 2 · caractérisation — CO-24, la chaîne des copies', () => {
    test('grilles · dupliquerGrilleBibliotheque NORMALISE le suffixe (nommerCopie câblé)', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            fonction: 'dupliquerGrilleBibliotheque', champNom: 'nom'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Grille source (copie)');
        expect(r.second).toBe('Grille source (copie 2)');   // pas « (copie) (copie) »
    });

    test('échelles · dupliquerEchelleBibliotheque NORMALISE le suffixe', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            fonction: 'dupliquerEchelleBibliotheque', champNom: 'nom'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Echelle source (copie)');
        expect(r.second).toBe('Echelle source (copie 2)');
    });

    test('productions · dupliquerProductionBibliotheque NORMALISE désormais le suffixe', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            fonction: 'dupliquerProductionBibliotheque', champNom: 'titre'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Prod source (copie)');
        // ✅ CONVERGÉ (D3). AVANT : « Prod source (copie) (copie) » — la
        // concaténation nue empilait, exactement le reproche de CO-24.
        expect(r.second).toBe('Prod source (copie 2)');
    });

    test('pratiques · dupliquerPratiqueMateriel NORMALISE désormais le suffixe', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            fonction: 'dupliquerPratiqueMateriel', champNom: 'nom'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Pratique source (copie)');
        // ✅ CONVERGÉ (D3). AVANT : « Pratique source (copie) (copie) ».
        expect(r.second).toBe('Pratique source (copie 2)');
    });

    test('pratiques · dupliquerPratiqueBibliotheque NORMALISE désormais le suffixe', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            fonction: 'dupliquerPratiqueBibliotheque', champNom: 'nom'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Pratique source (copie)');
        // ✅ CONVERGÉ (D3). AVANT : « Pratique source (copie) (copie) ».
        expect(r.second).toBe('Pratique source (copie 2)');
    });
});

/* ================================================================== */
/* SOURCE ABSENTE — CE QUE L'UTILISATEUR ENTEND QUAND RIEN N'EXISTE    */
/* ================================================================== */

// Ajouté APRÈS la fusion des deux moteurs (#476 volet 2, Lots C et D) : le
// chemin « source introuvable » avait été refactorisé sans être couvert. Le
// message d'absence n'est pas un détail — il diffère d'une famille à l'autre
// (quatre `alert`, un `notifications.erreur`), et rien ne le verrouillait.
// Une fusion qui uniformiserait ces messages par inadvertance passerait
// inaperçue.

test.describe('#476 volet 2 · caractérisation — source absente', () => {
    const CAS = [
        ['dupliquerGrilleBibliotheque',     'grillesTemplates',       GRILLE_SOURCE,     [],       ['alert', 'Grille introuvable']],
        ['dupliquerEchelleBibliotheque',    'echellesTemplates',      ECHELLE_SOURCE,    [],       ['alert', 'Échelle introuvable']],
        ['dupliquerProductionBibliotheque', 'productions',            PRODUCTION_SOURCE, [],       ['erreur', 'Production introuvable']],
        ['dupliquerPratiqueBibliotheque',   'pratiquesConfigurables', PRATIQUE_SOURCE,   [],       ['alert', 'Pratique introuvable']]
    ];

    for (const [fonction, cleNom, source, extra, attendu] of CAS) {
        test(`${fonction} — dit l'absence et n'écrit rien`, async ({ page }) => {
            const r = await caracteriser(page, {
                cleNom, source,
                appel: [fonction, ['ID_QUI_N_EXISTE_PAS', ...extra]]
            });
            expect(r.erreur).toBeNull();
            expect(r.n).toBe(1);                 // la collection n'a pas bougé
            expect(r.copie).toBeNull();
            expect(r.msgs).toEqual([attendu]);
        });
    }

    test('dupliquerCartoucheBibliotheque — dit l\'absence et n\'écrit rien', async ({ page }) => {
        const r = await caracteriser(page, {
            cleBrute: 'cartouches_GR_X', amorces: AMORCE_CARTOUCHES(),
            source: CARTOUCHE_SOURCE,
            appel: ['dupliquerCartoucheBibliotheque', ['ID_QUI_N_EXISTE_PAS', 'GR_X']]
        });
        expect(r.erreur).toBeNull();
        expect(r.n).toBe(1);
        expect(r.copie).toBeNull();
        expect(r.msgs).toEqual([['alert', 'Cartouche introuvable']]);
    });
});

/* ================================================================== */
/* LE RENDU, ET PAS SEULEMENT LA DONNÉE                                */
/* ================================================================== */

// ▣ POURQUOI CE BLOC EXISTE — ET IL REMPLACE DU TRAVAIL HUMAIN.
// Tout le reste du banc vérifie la DONNÉE écrite : `isDemo` à false, l'auteur
// réattribué. Mais ce que Grégoire vit, lui, c'est un FORMULAIRE : ses champs
// sont-ils grisés, oui ou non ? Entre la donnée et l'écran il y a
// `estItemDemo` (qui rend vrai sur `isDemo === true` OU sur l'auteur
// « Demo Labo Codex ») puis `appliquerModeLectureSeuleDemo`, qui pose
// `disabled` sur tous les `input`/`select`/`textarea` du conteneur.
//
// C'était le seul point de la porte terrain du 24 août que la machine ne
// couvrait pas — et j'avais donc demandé à Grégoire de le vérifier à la main,
// avec 23 autres portes dont 19 étaient déjà mesurées ici. Il l'a dit :
// « je suis complètement découragé par les portes terrain nombreuses ».
// La règle qu'on en tire, et qui vaut pour la suite : UNE PORTE N'EXISTE QUE SI
// AUCUNE MACHINE NE PEUT RÉPONDRE. Quand une porte est automatisable, l'écrire
// ici coûte une heure une fois, au lieu de dix minutes à Grégoire à chaque cycle.
//
// Ce que ce bloc ne remplace PAS : le rendu sous WebKit, le doigt sur l'iPad, et
// le corpus réel. Ces trois-là restent à lui — et ils sont peu nombreux.

test.describe('#476 volet 2 · le formulaire de la copie est réellement éditable', () => {
    const GRILLE_DEMO = {
        id: 'GR_DEMO', nom: 'Grille de démonstration',
        criteres: [{ id: 'CR_D1', nom: 'Critère démo' }],
        auteur: 'Demo Labo Codex', isDemo: true, dansBibliotheque: true
    };

    test('grilles — la source démo est verrouillée, sa copie ne l\'est plus', async ({ page }) => {
        const r = await page.evaluate(async (source) => {
            const cle = window.cle('grillesTemplates');
            await db.set(cle, [JSON.parse(JSON.stringify(source))]);
            window.alert = () => {}; window.confirm = () => true;
            window.notifications = { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} };

            const lireEtat = () => {
                const c = document.getElementById('conteneurEditionGrille');
                if (!c) return { conteneur: false };
                const champs = c.querySelectorAll('input, select, textarea');
                return {
                    conteneur: true,
                    nbChamps: champs.length,
                    tousDesactives: champs.length > 0 && Array.from(champs).every((x) => x.disabled),
                    aucunDesactive: Array.from(champs).every((x) => !x.disabled),
                    bandeau: !!c.querySelector('.bandeau-demo-readonly'),
                    classeLectureSeule: c.classList.contains('demo-readonly')
                };
            };

            // 1) la SOURCE démo, chargée en édition : verrouillée (c'est voulu)
            await window.chargerGrillePourModif('GR_DEMO');
            const avant = lireEtat();

            // 2) on la duplique depuis la barre latérale, puis on charge LA COPIE
            await window.dupliquerGrilleDepuisSidebar('GR_DEMO');
            const liste = (await db.get(cle)) || [];
            const copie = liste.find((g) => g.id !== 'GR_DEMO');
            if (!copie) return { copieAbsente: true };
            await window.chargerGrillePourModif(copie.id);
            const apres = lireEtat();

            return { avant, apres, copieAuteur: copie.auteur, copieIsDemo: copie.isDemo };
        }, GRILLE_DEMO);

        expect(r.copieAbsente).toBeUndefined();
        expect(r.avant.conteneur).toBe(true);
        expect(r.avant.nbChamps).toBeGreaterThan(0);

        // La source démo EST verrouillée — sinon le test ne prouverait rien :
        // un formulaire éditable des deux côtés ne dirait pas que la copie l'est
        // DEVENUE. C'est le témoin qui donne son sens à l'assertion suivante.
        expect(r.avant.tousDesactives, 'la source démo devrait être en lecture seule').toBe(true);
        expect(r.avant.classeLectureSeule).toBe(true);

        // Et la copie, elle, s'ouvre MODIFIABLE. C'est le correctif D1, vu à
        // l'écran et non plus seulement dans le stockage.
        expect(r.apres.aucunDesactive, 'la copie doit être éditable').toBe(true);
        expect(r.apres.bandeau, 'la copie ne doit plus porter le bandeau « exemple »').toBe(false);
        expect(r.apres.classeLectureSeule).toBe(false);

        // Et la donnée qui commande ce rendu, pour lier les deux niveaux.
        expect(r.copieIsDemo).toBe(false);
        expect(r.copieAuteur).not.toBe('Demo Labo Codex');
    });
});
