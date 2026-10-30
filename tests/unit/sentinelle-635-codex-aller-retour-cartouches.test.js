import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE #635 — LE CODEX EST L'INSTRUMENT DE SAUVEGARDE DE S5 (#623)
// =====================================================================
//
// POURQUOI CE FICHIER EXISTE
// Le plan et le rapport Z1 exigent tous deux une « sauvegarde préalable PAR
// COPIE obligatoire » avant S5 (namespacement des cartouches par trimestre),
// qui SUPPRIME les clés nues après copie. Personne n'avait établi AVEC QUOI
// la faire. Mesuré le 31 août 2026 :
//
//   - `exporterConfigurationComplete()` (import-export.js:3215) NE PEUT PAS
//     servir : il ramasse les cartouches par `key.startsWith('cartouches_')`
//     (:3239 — clés NUES seules, donc ZÉRO après migration, en silence),
//     il FILTRE par `filtrerRessourcesNonDemo` (:3224-3226, :3242), et il lit
//     le reste par `cle(...)` (:3217-3220), donc le seul trimestre ACTIF.
//   - `actionFusionner` (codex.js:3075) non plus : il REFUSE d'emblée quand
//     aucun codex n'est actif (:3078-3081). Sur base vide, inapplicable.
//   - Reste `genererCodex` (codex.js:285) → `chargerCodex` (codex.js:513).
//
// Ce fichier transforme « plausible par lecture » en « mesuré par exécution ».
// Il EXÉCUTE le trajet complet — génération d'un vrai ZIP JSZip, puis
// restauration dans une base vide — et asserte que les `cartouches_*` en
// reviennent, nues ET namespacées.
//
// ---------------------------------------------------------------------
// CE QUE CE BANC PROUVE, ET CE QU'IL NE PROUVE PAS  (à lire avant d'y croire)
// ---------------------------------------------------------------------
// ⚠ Node n'a PAS d'IndexedDB. Le `db` de ce banc est une Map synchrone
//   habillée en API asynchrone. Conséquence : toute COURSE d'écriture y est
//   invisible — deux écritures concurrentes s'y ordonnent toujours, ce qui
//   n'est pas vrai dans Safari.
//
//   IL PROUVE  : la fidélité du trajet de DONNÉES. Ce qui entre dans le ZIP,
//                ce qui en ressort, et sous quelle clé.
//   IL NE PROUVE RIEN SUR : (1) la concurrence — aucune course d'écriture
//                n'est observable ici ; (2) le RENDU — la barre latérale des
//                cartouches et la matrice sont du DOM, Vitest ne les voit pas
//                (Playwright/WebKit ou test manuel consigné) ; (3) le QUOTA —
//                le pré-vol `evaluerPrevolStockage` rend « inconnu » faute de
//                `navigator.storage.estimate()`, donc le chemin de refus n'est
//                jamais emprunté ici ; (4) les BLOBS de travaux — le banc ne
//                monte pas `travauxStockage`, le trajet des fichiers joints
//                n'est pas exercé ; (5) les DÉLAIS — `setTimeout` est injecté
//                sans son délai (codex.js:843 tempo 800 ms d'affichage), ce qui
//                fait tomber ce fichier de ~9 s à ~1 s. L'ORDRE des opérations
//                est intact (tout est `await`é en séquence), mais rien ici ne
//                dit ce que voit un utilisateur pendant l'attente.
//
//   Un vert ici n'autorise donc PAS à déclarer la migration S5 réversible.
//   Il autorise à dire : le Codex rapporte les cartouches dans une base vide.
//
// ---------------------------------------------------------------------
// LES DEUX LIMITES, ASSERTÉES COMME LIMITES ET NON SUBIES
// ---------------------------------------------------------------------
// C1 — `chargerCodex` ne fait AUCUN `clear` : il écrit clé par clé (:636).
//      Sur une base peuplée c'est une UNION, pas une restauration. Ce qui
//      interdit de présenter le Codex comme une ANNULATION de migration :
//      les clés nues supprimées par S5 reviendraient, mais les clés
//      namespacées créées par S5 resteraient là, à côté.
// C2 — les `cartouches_*` sont classées bibliothèque partagée
//      (`_estBiblioPartagee`, codex.js:504) et passent par
//      `verifierUniciteIds` à l'import (codex.js:632-633). Un ZIP portant deux
//      cartouches de même id à contenu DIVERGENT voit la seconde RENOMMÉE
//      (import-export.js:231, mutation de `item.id` en place) ; à contenu
//      IDENTIQUE, la copie est ÉCARTÉE (:227). Le fichier ne se restaure donc
//      pas à l'identique de lui-même.
//      ⚠ Les deux sont des comportements CONNUS et VOULUS (#292, #454), pas
//      des régressions. Ils sont verrouillés ici pour que personne ne les
//      « corrige » sans le décider, et pour que personne ne présente
//      l'aller-retour comme une identité.
//
// ---------------------------------------------------------------------
// TÉMOINS
// ---------------------------------------------------------------------
// Chaque affirmation porte son propre témoin (`monterCodex(..., { muter })`),
// qui rejoue le MÊME cas sur une source transformée EN MÉMOIRE et asserte que
// l'invariant TOMBE. `monterSource` refuse une mutation qui n'a rien remplacé
// (« Témoin inerte ») : sans cette garde, un `replace` dont la chaîne cible a
// été reformulée dans le dépôt rendrait le témoin tautologique et vert pour
// toujours. Le premier `describe` vérifie que cette garde fonctionne.
// La source du dépôt n'est JAMAIS modifiée : la mutation vit dans une chaîne.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Console des sandboxes : `warn` et `log` sont attendus et bruyants (pré-vol
 * sans verdict, preview de purge, journal de `verifierUniciteIds`). On les
 * tait pour garder la sortie lisible — mais JAMAIS `error` : une erreur
 * avalée est exactement ce qu'une sentinelle ne doit pas produire.
 */
const consoleSandbox = {
    log: () => {}, warn: () => {}, info: () => {}, debug: () => {},
    error: (...a) => console.error(...a)
};

/**
 * `setTimeout` sans le délai. Le trajet est entièrement séquentiel (`await`),
 * donc l'ordre est préservé ; seules les tempos d'affichage sautent.
 */
const setTimeoutRapide = (cb) => setTimeout(cb, 0);

/** FileReader minimal — `_lireCommeArrayBuffer` (codex.js:2425) en dépend. */
class FauxFileReader {
    readAsArrayBuffer(blob) {
        blob.arrayBuffer().then(
            (buf) => { this.result = buf; if (this.onload) this.onload(); },
            () => { if (this.onerror) this.onerror(); }
        );
    }
}

/**
 * Magasin en mémoire. Les valeurs entrent et sortent PAR RÉFÉRENCE, comme
 * `db.js` en mode memoryCache : un clonage de complaisance masquerait une
 * mutation en place (c'est justement ce que C2 fait, et qu'on veut voir).
 * Les fixtures sont donc clonées à l'ENTRÉE (`creerDb`), jamais ici.
 */
function creerDb(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        _map: map,
        ready: true,
        init: async () => {},
        get: async (k, def = null) => (map.has(k) ? map.get(k) : def),
        set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); },
        keys: async () => [...map.keys()],
        listBlobIds: async () => [],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); },
        syncToLocalStorageCache: async () => {},
        flush: async () => {}
    };
}

/** Fabrique d'ids déterministe — la vraie (main.js:33) est aléatoire. */
function fabriqueIds() {
    let n = 0;
    return function (prefix) { n += 1; return (prefix || '') + 'REGENERE' + n; };
}

/**
 * Monte un script du dépôt dans un sandbox, en appliquant `muter` à sa SOURCE.
 * `muter` doit rendre une chaîne DIFFÉRENTE : sinon le témoin ne témoigne de
 * rien et on le dit tout de suite.
 */
function monterSource(cheminRelatif, noms, valeurs, muter = null) {
    const brut = readFileSync(path.join(racine, cheminRelatif), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) {
        throw new Error('Témoin inerte : la mutation de ' + cheminRelatif + ' n\'a rien remplacé.');
    }
    const fn = new Function(...noms, '"use strict";\n' + code);
    fn(...valeurs);
}

/** Sandbox `js/import-export.js` — on n'en veut que verifierUniciteIds. */
function monterImportExport(muter = null) {
    const win = { addEventListener: () => {}, removeEventListener: () => {} };
    const doc = {
        readyState: 'loading',
        addEventListener: () => {}, removeEventListener: () => {},
        querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({
            setAttribute() {}, appendChild() {}, addEventListener() {}, style: {},
            classList: { add() {}, remove() {}, contains() { return false; } }
        }),
        body: { addEventListener: () => {}, appendChild: () => {} },
        documentElement: { addEventListener: () => {} }
    };
    const stockage = () => ({
        _d: {},
        getItem(k) { return this._d[k] ?? null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    });
    monterSource(
        'js/import-export.js',
        ['window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
            'genererIdUnique', 'JSZip', 'setTimeout'],
        [win, doc, consoleSandbox, stockage(), stockage(), creerDb({}), fabriqueIds(),
            JSZip, setTimeoutRapide],
        muter
    );
    return win;
}

/**
 * Sandbox `js/codex.js`, avec les bare globals que le trajet consomme.
 * `document.readyState = 'loading'` reporte l'auto-init à un DOMContentLoaded
 * qui ne viendra jamais — même ruse que `_helpers/charger-codex.js`.
 */
function monterCodex(db, options = {}) {
    const win = {
        addEventListener: () => {}, removeEventListener: () => {},
        // Capturés par `var _afficherProgression = window.afficherProgression`
        // (codex.js:1306) AU CHARGEMENT : les poser après serait sans effet.
        afficherProgression: () => {}, majProgression: () => {}, masquerProgression: () => {},
        trimestreActif: 'h2026'
    };
    if (options.verifierUniciteIds) win.verifierUniciteIds = options.verifierUniciteIds;

    const doc = {
        readyState: 'loading',
        addEventListener: () => {}, removeEventListener: () => {},
        querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({
            setAttribute() {}, appendChild() {}, addEventListener() {}, style: {},
            classList: { add() {}, remove() {}, contains() { return false; } }
        }),
        body: { addEventListener: () => {}, appendChild: () => {} },
        documentElement: { addEventListener: () => {} }
    };
    const stockage = () => ({
        _d: {},
        getItem(k) { return this._d[k] ?? null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    });

    // Lot A1 (30 sept. 2026) : `genererCodex` assemble par `window.FichierSortant`.
    monterFichierSortant(win, { document: doc });

    monterSource(
        'js/codex.js',
        ['window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
            'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
            'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator'],
        [win, doc, consoleSandbox, stockage(), stockage(), db,
            undefined, JSZip, FauxFileReader, (cb) => setTimeout(cb, 0),
            { confirmerAction: async () => true, demanderSaisie: async () => null },
            options.validerZipSecurite, setTimeoutRapide,
            // `navigator` (2 sept. 2026) — `_identifierAppareil` (codex.js:394) lit
            // `navigator.userAgent` sur le trajet. Ce global manquait au bac à sable :
            // le test passait en l'EMPRUNTANT à Node 24 (qui l'expose), et rougissait
            // sur le runner GitHub sous Node 20 (qui ne l'a pas) — huit runs de suite.
            // Reproduit ici même avec `--no-experimental-global-navigator`. Le seul
            // membre consommé est `userAgent` ; `storage`, `share`, `clipboard`
            // restent absents, et leurs gardes `if (navigator.storage && …)` tiennent.
            { userAgent: 'BacASable/635 (Node; test)' }],
        options.muter || null
    );
    return win.Codex;
}

/** Le ZIP rendu par `generer` n'est pas un File : `chargerCodex` lit `.name`. */
function enFichier(blob, nom = 'codex-de-test.zip') {
    blob.name = nom;
    return blob;
}

// Corpus : les deux formes de clé coexistent, c'est tout l'enjeu de S5.
// `a2025_*` est un trimestre NON actif ; `window.trimestreActif` vaut 'h2026'.
const CORPUS = {
    h2026_grillesTemplates: [{ id: 'G1', nom: 'Grille de test' }],
    cartouches_G1: [
        { id: 'CART_nue_1', texte: 'clé nue, première' },
        { id: 'CART_nue_2', texte: 'clé nue, seconde' }
    ],
    h2026_cartouches_G1: [{ id: 'CART_h_1', texte: 'namespacée, trimestre actif' }],
    a2025_cartouches_G9: [{ id: 'CART_a_1', texte: 'namespacée, trimestre DORMANT' }]
};

/** Aller : génère un ZIP depuis `corpus`. Retour : le restaure dans `cible`. */
async function allerRetour(corpus, cible, options = {}) {
    const source = monterCodex(creerDb(corpus));
    const zip = await source.generer({ silencieux: true });
    const arrivee = monterCodex(cible, options);
    const bilan = await arrivee.charger(enFichier(zip.blob));
    return { manifeste: zip.manifeste, bilan };
}

describe('sentinelle #635 · le harnais lui-même', () => {

    it('une mutation qui ne mord pas est REFUSÉE — un témoin inerte n\'est pas un témoin', () => {
        // Sans cette garde, un `replace` dont la chaîne cible a été reformulée
        // dans le dépôt rendrait tous les témoins ci-dessous tautologiques :
        // ils compareraient le code intact à lui-même et resteraient verts
        // pour toujours. C'est la panne silencieuse qui guette ce fichier.
        expect(() => monterCodex(creerDb({}), {
            muter: (src) => src.replace('CHAINE_QUI_N_EXISTE_PAS_DANS_CODEX', 'x')
        })).toThrow(/Témoin inerte/);
    });

});

describe('sentinelle #635 · le trajet nominal — les cartouches reviennent dans une base VIDE', () => {

    it('les clés cartouches NUES et NAMESPACÉES reviennent toutes, avec leur contenu', async () => {
        const cible = creerDb({});
        const { bilan } = await allerRetour(CORPUS, cible);

        // Le critère du backlog #635, mot pour mot : « produire un fichier,
        // puis démontrer qu'on peut en restaurer les cartouches_* dans une
        // base vide ».
        expect(cible._map.get('cartouches_G1')).toEqual(CORPUS.cartouches_G1);
        expect(cible._map.get('h2026_cartouches_G1')).toEqual(CORPUS.h2026_cartouches_G1);
        expect(cible._map.get('a2025_cartouches_G9')).toEqual(CORPUS.a2025_cartouches_G9);
        expect(bilan.stats.incomplet).toBe(false);
    }, 15000);

    it('l\'ALLER ne filtre ni par trimestre ni par heuristique — c\'est ce qui le distingue d\'exporterConfigurationComplete', async () => {
        // `exporterConfigurationComplete` perdrait a2025_* (lu par `cle(...)`,
        // trimestre actif seul) et pourrait perdre n'importe quoi que
        // `filtrerRessourcesNonDemo` juge « démo ou importé ».
        // `genererCodex` (:304-305) ne retient qu'un seul critère : le préfixe
        // `_codex_`.
        //
        // ⚠ On ouvre le ZIP, on ne lit PAS le manifeste. Mesuré le 31 août :
        // `manifeste.contenu.cles` est bâti sur `toutesLesCles` (codex.js:397),
        // AVANT le filtrage qui remplit `donnees` — il décrit donc la base, pas
        // le fichier. Asserter dessus laissait passer une mutation du filtre de
        // collecte (témoin R1 vert à tort). Seul `donnees.json` dit ce qui est
        // réellement parti.
        const source = monterCodex(creerDb(CORPUS));
        const { blob } = await source.generer({ silencieux: true });

        const zip = await JSZip.loadAsync(await blob.arrayBuffer());
        const emportees = JSON.parse(await zip.file('donnees.json').async('string'));

        expect(Object.keys(emportees)).toEqual(
            expect.arrayContaining([
                'cartouches_G1', 'h2026_cartouches_G1', 'a2025_cartouches_G9'
            ])
        );
        // Le trimestre DORMANT part avec son contenu, pas seulement son nom.
        expect(emportees.a2025_cartouches_G9).toEqual(CORPUS.a2025_cartouches_G9);
        // Et rien du codex lui-même n'a fui dans le fichier.
        expect(Object.keys(emportees).filter((c) => c.startsWith('_codex_'))).toEqual([]);
    }, 15000);

    it('TÉMOIN — un ALLER qui laisserait les cartouches nues derrière lui fait ROUGIR le cas nominal', async () => {
        const cible = creerDb({});
        const source = monterCodex(creerDb(CORPUS), {
            // Mutation du filtre de collecte de genererCodex (:305).
            muter: (src) => src.replace(
                "return !c.startsWith('_codex_');",
                "return !c.startsWith('_codex_') && !c.startsWith('cartouches_');"
            )
        });
        const zip = await source.generer({ silencieux: true });
        const arrivee = monterCodex(cible);
        await arrivee.charger(enFichier(zip.blob));

        expect(cible._map.has('cartouches_G1')).toBe(false);
        // Le namespacé passe encore : la mutation vise bien la forme NUE,
        // et l'assertion nominale porte bien sur les deux.
        expect(cible._map.get('h2026_cartouches_G1')).toEqual(CORPUS.h2026_cartouches_G1);
    }, 15000);

    it('TÉMOIN — un RETOUR qui n\'écrirait pas les cartouches fait ROUGIR le cas nominal', async () => {
        const cible = creerDb({});
        const source = monterCodex(creerDb(CORPUS));
        const zip = await source.generer({ silencieux: true });
        const arrivee = monterCodex(cible, {
            // Mutation du filtre d'écriture de chargerCodex (`_entreeEcriteALOuverture` depuis #1184).
            muter: (src) => src.replace(
                "return !entree[0].startsWith('_');",
                "return !entree[0].startsWith('_') && entree[0].indexOf('cartouches_') === -1;"
            )
        });
        await arrivee.charger(enFichier(zip.blob));

        expect(cible._map.has('cartouches_G1')).toBe(false);
        expect(cible._map.has('h2026_cartouches_G1')).toBe(false);
        // La grille, elle, est bien revenue : la mutation n'a pas cassé le
        // trajet entier, seulement les cartouches. Sans cette ligne, un
        // chargement totalement en panne passerait pour un témoin valide.
        expect(cible._map.get('h2026_grillesTemplates')).toEqual(CORPUS.h2026_grillesTemplates);
    }, 15000);

});

describe('sentinelle #635 · C1 — chargerCodex UNIT, il ne RESTAURE pas', () => {

    it('une clé locale absente du ZIP SURVIT au chargement — donc ce n\'est pas une annulation de migration', async () => {
        // Comportement CONNU et voulu : `chargerCodex` n'appelle aucun clear,
        // il écrit clé par clé (:636). C'est ce qui interdit de présenter le
        // Codex comme un « défaire » de S5 : rejouer une sauvegarde d'avant
        // migration ramènerait les clés nues SANS retirer les namespacées.
        const cible = creerDb({
            cartouches_G7: [{ id: 'CART_locale', texte: 'jamais partie dans le ZIP' }],
            h2026_cartouches_G1: [{ id: 'CART_locale_2', texte: 'sera ÉCRASÉE, elle' }]
        });
        await allerRetour(CORPUS, cible);

        // Absente du ZIP → intacte. C'est la limite.
        expect(cible._map.get('cartouches_G7')).toEqual([
            { id: 'CART_locale', texte: 'jamais partie dans le ZIP' }
        ]);
        // Présente dans le ZIP → remplacée, pas fusionnée.
        expect(cible._map.get('h2026_cartouches_G1')).toEqual(CORPUS.h2026_cartouches_G1);
    }, 15000);

    it('TÉMOIN — un chargerCodex qui viderait la base d\'abord ferait ROUGIR C1', async () => {
        const cible = creerDb({
            cartouches_G7: [{ id: 'CART_locale', texte: 'jamais partie dans le ZIP' }]
        });
        const source = monterCodex(creerDb(CORPUS));
        const zip = await source.generer({ silencieux: true });
        const arrivee = monterCodex(cible, {
            muter: (src) => src.replace(
                "    var entreesData = Object.entries(donnees).filter(",
                "    for (const _k of await db.keys()) { await db.remove(_k); }\n"
                + "    var entreesData = Object.entries(donnees).filter("
            )
        });
        await arrivee.charger(enFichier(zip.blob));

        expect(cible._map.has('cartouches_G7')).toBe(false);
        // Et le ZIP, lui, est bien arrivé : le témoin isole l'effacement.
        expect(cible._map.get('cartouches_G1')).toEqual(CORPUS.cartouches_G1);
    }, 15000);

});

describe('sentinelle #635 · C2 — le fichier ne se restaure pas à l\'identique de lui-même', () => {

    // Le filet #292 : `_estBiblioPartagee` (codex.js:504) range `cartouches_*`
    // parmi les bibliothèques partagées, donc `verifierUniciteIds` s'applique
    // à la RESTAURATION (codex.js:632-633). Il compare les entrées du ZIP ENTRE
    // ELLES — jamais à la base : `premiersParId` est une Map créée vide à
    // chaque appel (import-export.js:209). C2 mord donc même sur base vide,
    // et ne s'effondre PAS dans C1.

    const ZIP_AVEC_DOUBLONS = {
        h2026_grillesTemplates: [{ id: 'G1', nom: 'Grille de test' }],
        cartouches_G1: [
            { id: 'CART_A', texte: 'original' },
            { id: 'CART_A', texte: 'original' },              // identique → écarté
            { id: 'CART_B', texte: 'original B' },
            { id: 'CART_B', texte: 'DIVERGENT' }              // divergent → renommé
        ]
    };

    it('un doublon IDENTIQUE est écarté et un doublon DIVERGENT est renommé (comportement voulu, #454)', async () => {
        const cible = creerDb({});
        const impExp = monterImportExport();
        expect(typeof impExp.verifierUniciteIds).toBe('function');

        await allerRetour(ZIP_AVEC_DOUBLONS, cible, {
            verifierUniciteIds: impExp.verifierUniciteIds
        });

        const restaurees = cible._map.get('cartouches_G1');
        // 4 partis, 3 revenus : la copie à l'identique a été ÉCARTÉE.
        expect(restaurees).toHaveLength(3);
        expect(restaurees.filter((c) => c.id === 'CART_A')).toHaveLength(1);

        // Le divergent est là, mais SOUS UN AUTRE ID : le contenu survit,
        // l'identifiant non. C'est exactement ce qui interdit de dire
        // « l'aller-retour est une identité ».
        const textes = restaurees.map((c) => c.texte).sort();
        expect(textes).toEqual(['DIVERGENT', 'original', 'original B']);
        const idsB = restaurees.filter((c) => c.texte === 'DIVERGENT').map((c) => c.id);
        expect(idsB).toHaveLength(1);
        expect(idsB[0]).not.toBe('CART_B');
    }, 15000);

    it('le filet ne s\'applique PAS quand verifierUniciteIds n\'est pas chargé — le trajet est alors bit-à-bit', async () => {
        // Contre-épreuve : sans le filet (codex.js:632 teste
        // `typeof window.verifierUniciteIds === 'function'`), les quatre
        // entrées reviennent telles quelles. Cela prouve que l'écart mesuré
        // ci-dessus vient BIEN du filet, et pas du ZIP ni du banc.
        const cible = creerDb({});
        await allerRetour(ZIP_AVEC_DOUBLONS, cible); // pas de verifierUniciteIds

        expect(cible._map.get('cartouches_G1')).toEqual(ZIP_AVEC_DOUBLONS.cartouches_G1);
    }, 15000);

    it('TÉMOIN — muter le côté GAUCHE du && de #454 change le sort du doublon identique', async () => {
        // `if (sigPremier !== null && sigPremier === sigItem)`
        // (import-export.js:226). Gauche neutralisé : plus aucun écart n'est
        // reconnu comme « la même chose », le doublon identique est RENOMMÉ
        // au lieu d'être écarté. Les 4 entrées reviennent.
        const cible = creerDb({});
        const impExp = monterImportExport((src) => src.replace(
            'if (sigPremier !== null && sigPremier === sigItem) {',
            'if (false && sigPremier === sigItem) {'
        ));
        await allerRetour(ZIP_AVEC_DOUBLONS, cible, {
            verifierUniciteIds: impExp.verifierUniciteIds
        });

        const restaurees = cible._map.get('cartouches_G1');
        expect(restaurees).toHaveLength(4);
        expect(restaurees.filter((c) => c.id === 'CART_A')).toHaveLength(1);
    }, 15000);

    it('TÉMOIN — muter le côté DROIT du && de #454 change le sort du doublon divergent', async () => {
        // Droit forcé à vrai : tout doublon devient « la même chose », donc le
        // DIVERGENT est écarté au lieu d'être renommé — une PERTE de contenu.
        // C'est la moitié du && que le premier témoin ne pouvait pas atteindre.
        const cible = creerDb({});
        const impExp = monterImportExport((src) => src.replace(
            'if (sigPremier !== null && sigPremier === sigItem) {',
            'if (sigPremier !== null && true) {'
        ));
        await allerRetour(ZIP_AVEC_DOUBLONS, cible, {
            verifierUniciteIds: impExp.verifierUniciteIds
        });

        const restaurees = cible._map.get('cartouches_G1');
        expect(restaurees).toHaveLength(2);
        expect(restaurees.map((c) => c.texte).sort()).toEqual(['original', 'original B']);
    }, 15000);

});
