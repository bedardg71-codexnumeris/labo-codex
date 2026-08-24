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
// ▣ CE QUE LE BANC N'EST PAS. Il ne dit pas ce que le comportement DEVRAIT
// être. Plusieurs valeurs figées ici sont discutables et sont signalées par un
// commentaire « ⚠ ÉCART » : le banc les fige quand même, parce que le mandat du
// volet 2 est un refactor PUR. Les corriger est un chantier distinct, à décider
// par Grégoire — pas un effet de bord de la fusion.
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

test.beforeEach(async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
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
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom']);
        expect(r.copie.dansBibliotheque).toBe(true);
        // ⚠ ÉCART ASSUMÉ — objet RECONSTRUIT champ par champ, pas étalé : tout
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
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom']);
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

    test('dupliquerGrilleDepuisSidebar — copie brute : garde l\'auteur ET le drapeau démo de la source', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'grillesTemplates', source: GRILLE_SOURCE,
            appel: ['dupliquerGrilleDepuisSidebar', ['GR_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.copie.nom).toBe('Grille source (copie)');
        expect(r.copie.verrouille).toBe(false);             // seul champ forcé
        // ⚠ ÉCART ASSUMÉ, ET C'EST LE PLUS GROS DU LOT. Cette voie ne pose NI
        // auteur, NI isDemo, NI inspireDe, et ne retire PAS metadata_cc : la
        // copie d'un exemple de démo reste marquée démo et attribuée à son
        // auteur d'origine. Les quatre autres voies de la famille font l'inverse.
        // Figé tel quel — le volet 2 est un refactor pur. À porter au BACKLOG.
        expect(r.copie.auteur).toBe('Alice');
        expect(r.copie.isDemo).toBe(true);
        expect(r.copie.inspireDe).toBeNull();
        expect(r.copie.metadata_cc).toBe('present');
        expect(r.copie.criteresIds).toEqual(['CR_1', 'CR_2']);
        expect(r.msgs).toEqual([['alert', 'Grille "Grille source (copie)" dupliquée avec succès']]);
    });

    test('dupliquerGrilleActive — relais NON-async : rend avant que l\'écriture soit faite', async ({ page }) => {
        // ⚠ ÉCART ASSUMÉ. `dupliquerGrilleActive` est la seule des 22 déclarée
        // `function` et non `async function` : elle lance
        // `dupliquerGrilleDepuisSidebar` sans `await`. Son homologue
        // `dupliquerEchelleActive` attend. Un appelant qui croit pouvoir
        // enchaîner sur son retour lit un état d'AVANT l'écriture.
        //
        // On fige le fait STRUCTUREL (la valeur rendue n'est pas thenable), pas
        // l'issue de la course : asserter « la copie n'est pas encore écrite »
        // serait un test à bascule, vert ou rouge selon la vitesse de la machine.
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

        expect(nature.grilleThenable).toBe(false);   // ne rend rien d'attendable
        expect(nature.echelleThenable).toBe(true);   // son homologue, si

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

    test('dupliquerEchelleDepuisSidebar — copie brute : garde l\'auteur ET le drapeau démo', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'echellesTemplates', source: ECHELLE_SOURCE,
            appel: ['dupliquerEchelleDepuisSidebar', ['ECH_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.copie.nom).toBe('Echelle source (copie)');
        expect(r.copie.verrouille).toBe(false);
        // ⚠ ÉCART ASSUMÉ — strictement le même que côté grilles : ni auteur, ni
        // isDemo, ni inspireDe, et metadata_cc conservé. Deux familles, un seul
        // et même angle mort : c'est la voie « barre latérale » qui est en retard.
        expect(r.copie.auteur).toBe('Alice');
        expect(r.copie.isDemo).toBe(true);
        expect(r.copie.inspireDe).toBeNull();
        expect(r.copie.metadata_cc).toBe('present');
        expect(r.copie.aDateCreation).toBe(false);
        expect(r.msgs).toEqual([['alert', 'Échelle "Echelle source (copie)" dupliquée avec succès']]);
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
        expect(r.msgs).toEqual([['alert', 'Échelle "Echelle source (copie)" dupliquée avec succès']]);
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
        // ⚠ ÉCART ASSUMÉ — cette voie ne supprime ni `metadata_cc` ni
        // `auteurOriginal`, là où `dupliquerCartoucheBibliotheque` le fait. Une
        // copie faite par ce chemin garde donc la licence de partage de la source.
        expect(r.copie.metadata_cc).toBe('present');
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
        // Hérite du profil de `dupliquerCartouche` : metadata_cc CONSERVÉ.
        expect(avecEtat.copie.metadata_cc).toBe('present');
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
    test('dupliquerProduction — ne touche PAS au titre, suffixe l\'activité et la description', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerProduction', ['PROD_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // ⚠ ÉCART ASSUMÉ, LE PLUS SURPRENANT DE LA FAMILLE. Le `titre` — le champ
        // que l'utilisateur voit — reste IDENTIQUE à celui de la source. Ce sont
        // `activiteApprentissage` et `description` qui reçoivent « (copie) », et
        // la description est ÉCRASÉE par l'activité au passage.
        expect(r.copie.titre).toBe('Prod source');
        expect(r.copie.activite).toBe('Activite (copie)');
        expect(r.copie.description).toBe('Activite (copie)');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom']);  // construit à la main
        expect(r.copie.verrouille).toBe(false);
        expect(r.copie.metadata_cc).toBe('present');
        expect(r.copie.aDateCreation).toBe(false);
        expect(r.msgs).toEqual([['alert', 'Production "Activite (copie)" dupliquée avec succès']]);
    });

    test('dupliquerProductionBibliotheque — suffixe le titre par CONCATÉNATION, pas par nommerCopie', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerProductionBibliotheque', ['PROD_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        // ⚠ ÉCART ASSUMÉ — CO-24 ENCORE VIVANT ICI. `${production.titre} (copie)`
        // est une concaténation nue : dupliquer une copie rend « X (copie) (copie) ».
        // Le reste du projet passe par `nommerCopie`, qui normalise le suffixe.
        expect(r.copie.titre).toBe('Prod source (copie)');
        expect(r.copie.activite).toBe('Activite');       // intactes, contrairement à dupliquerProduction
        expect(r.copie.description).toBe('Desc');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom']);
        expect(r.copie.dansBibliotheque).toBe(true);
        expect(r.copie.aDateCreation).toBe(true);
        expect(r.copie.metadata_cc).toBe('absent');
        expect(r.copie.verrouille).toBe(true);
    });

    test('dupliquerEtEditerProduction — forkerItem POSE un champ `nom` que les productions n\'ont pas', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            appel: ['dupliquerEtEditerProduction', ['PROD_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        expect(r.msgs).toEqual([]);
        // ⚠ ÉCART ASSUMÉ — `forkerItem` écrit `copie.nom = nommerCopie(nom || titre)`.
        // Comme une production n'a pas de `nom`, la copie en reçoit un qui n'existait
        // pas sur la source : deux champs de nom coexistent désormais sur la copie.
        expect(r.copie.nom).toBe('Prod source (copie)');
        expect(r.sourceIntacte.nom).toBeUndefined();
        // Et le `titre` est réécrit juste après, par concaténation nue (CO-24).
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
    test('dupliquerPratique — invite « Copie de pratique », RETOURNE un id, alerte', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            appel: ['dupliquerPratique', ['pratique_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // ⚠ ÉCART ASSUMÉ — la seule des 22 dont l'invite ne propose PAS le nom
        // de la source : elle propose la constante « Copie de pratique ». Elle
        // ne consulte donc pas `nommerCopie` du tout.
        expect(r.msgs[0]).toEqual(['prompt-defaut', 'Copie de pratique']);
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
        expect(r.msgs.some(([k, m]) => k === 'alert' && m.includes('NOM CHOISI'))).toBe(true);
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

    test('dupliquerEtEditerPratique — forkerItem : CONSERVE estGabarit, contrairement à sa voisine', async ({ page }) => {
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
        // ⚠ ÉCART ASSUMÉ — `forkerItem` ne connaît pas `estGabarit` : la copie
        // reste marquée gabarit, là où `dupliquerPratiqueBibliotheque` le retire
        // explicitement. Deux « dupliquer » voisins, deux natures de copie.
        expect(r.copie.estGabarit).toBe(true);
    });

    test('dupliquerPratiqueMateriel — clone profond, notification, nom par CONCATÉNATION', async ({ page }) => {
        const r = await caracteriser(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            appel: ['dupliquerPratiqueMateriel', ['pratique_SRC']]
        });

        expect(r.erreur).toBeNull();
        expect(r.n).toBe(2);
        // ⚠ ÉCART ASSUMÉ — CO-24 vivant ici aussi : `${original.nom} (copie)`.
        // Comme pour les productions, `pratiques-gestion.js` n'est pas dans la
        // liste des fichiers surveillés par la sentinelle CO-24.
        expect(r.copie.nom).toBe('Pratique source (copie)');
        expect(r.copie.auteur).toBe('Inconnu');
        expect(r.copie.isDemo).toBe(false);
        expect(r.copie.inspireDe).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(r.copie.aDateCreation).toBe(true);
        // Ni suppression de metadata_cc, ni de estGabarit : clone brut + retouches.
        expect(r.copie.estGabarit).toBe(true);
        expect(r.copie.metadata_cc).toBe('present');
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

    test('productions · dupliquerProductionBibliotheque EMPILE encore — CO-24 vivant', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'productions', source: PRODUCTION_SOURCE,
            fonction: 'dupliquerProductionBibliotheque', champNom: 'titre'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Prod source (copie)');
        // ⚠ ÉCART ASSUMÉ — la concaténation nue `${titre} (copie)` empile. C'est
        // exactement le reproche de CO-24, resté vivant sur cette famille parce
        // que la sentinelle du Lot 5 ne lit pas ce fichier. Figé, pas corrigé :
        // le volet 2 est un refactor pur.
        expect(r.second).toBe('Prod source (copie) (copie)');
    });

    test('pratiques · dupliquerPratiqueMateriel EMPILE encore — CO-24 vivant', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            fonction: 'dupliquerPratiqueMateriel', champNom: 'nom'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Pratique source (copie)');
        expect(r.second).toBe('Pratique source (copie) (copie)');
    });

    test('pratiques · dupliquerPratiqueBibliotheque EMPILE encore — CO-24 vivant', async ({ page }) => {
        const r = await chaineDeCopies(page, {
            cleNom: 'pratiquesConfigurables', source: PRATIQUE_SOURCE,
            fonction: 'dupliquerPratiqueBibliotheque', champNom: 'nom'
        });
        expect(r.nombre).toBe(3);
        expect(r.premier).toBe('Pratique source (copie)');
        expect(r.second).toBe('Pratique source (copie) (copie)');
    });
});
