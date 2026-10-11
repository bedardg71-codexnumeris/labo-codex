import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #599 (30 août 2026) — LES BIBLIOTHÈQUES PARTAGÉES.
//
// #522 lot 4 avait fermé le CONTRAT DU HELPER `BibliothequeUI` — les cinq
// familles dupliquent par `modifierListe(mutateur)`. Mais la ligne du rapport
// d'audit « bibliothèques (`CLE_BIBLIOTHEQUE*`, 5 constantes) — 14 sites » ne
// décrivait QUE les appelants du helper. Les écritures DIRECTES du magasin
// partagé n'y étaient pas : **20 sites, neuf fichiers**, mesurés le 30 août.
//
// ⮕ TROIS GESTES × CINQ FAMILLES, tous en lecture-modification-écriture :
// `ajouterXALaBibliotheque`, `retirerXDeLaBibliotheque`, `confirmerImportX`.
// Plus `mettreAJourConfigurationPratique`, le versement one-shot des huit
// échelles collègues, et les trois `creer*SPESiInexistante`.
//
// ⮕ ET LES TROIS CRÉATIONS SPE PORTAIENT LE DÉFAUT D'`assurerGrilleDeDepart`
// (corrigé au lot 2c) : elles vérifiaient l'existence HORS file, donc deux
// appels concurrents au démarrage semaient DEUX gabarits.
//
// ⚠ CE QUI REND CES SITES PARTICULIERS : les cinq familles écrivent dans un
// magasin par famille, mais chacun est écrit depuis PLUSIEURS modules — l'ajout
// depuis la fiche, le retrait depuis le modal, l'import depuis un fichier, le
// semis SPE au démarrage. La course y est donc inter-modules, pas locale.
//
// ⚠⚠ LE BANC : chemin IndexedDB rétabli ET clone structuré.

/* ------------------------------------------------------------------ harnais */

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        transaction() {
            const store = {
                get(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined;
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                },
                put(record) {
                    const req = {};
                    const fige = cloner(record.value);
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => {
                            disque.set(record.key, fige);
                            if (tx.oncomplete) tx.oncomplete();
                        }, 0);
                    });
                    return req;
                },
                getAll() {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = [...disque].map(([key, value]) => ({ key, value: cloner(value) }));
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                }
            };
            const tx = { objectStore: () => store };
            return tx;
        }
    };
}

async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

async function monterBiblioGrilles() {
    const db = await monterDb();
    const win = chargerScript('js/grilles-bibliotheque.js', {
        db,
        obtenirProfilAuteurActifSync: () => ({ auteur_original: 'banc' }),
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] }
    });
    for (const f of ['ajouterGrilleALaBibliotheque', 'retirerGrilleDeLaBibliotheque']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const CLE = 'bibliothequeGrilles';
const GRILLE = (id, nom) => ({ id, nom, criteres: [{ id: 'CR_1', nom: 'Critère' }] });

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#599 · A — deux gestes en rafale sur le MÊME magasin partagé', () => {

    it('A.a deux ajouts concurrents d\'items DIFFÉRENTS survivent tous les deux', async () => {
        const { db, win } = await monterBiblioGrilles();
        await db.set(CLE, []);   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.ajouterGrilleALaBibliotheque(GRILLE('G_A', 'Grille A')),
            win.ajouterGrilleALaBibliotheque(GRILLE('G_B', 'Grille B'))
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'les deux grilles sont là').toHaveLength(2);
        expect(liste.map((g) => g.id).sort()).toEqual(['G_A', 'G_B']);
    });

    it('A.b un ajout et un retrait concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterBiblioGrilles();
        await db.set(CLE, [GRILLE('G_X', 'À retirer')]);   // security-ok: littéral de banc

        await Promise.all([
            win.ajouterGrilleALaBibliotheque(GRILLE('G_A', 'Grille A')),
            win.retirerGrilleDeLaBibliotheque('G_X')
        ]);

        const liste = await db.get(CLE);
        expect(liste.map((g) => g.id), 'l\'ajout tient et le retrait aussi').toEqual(['G_A']);
    });

    it('A.c deux ajouts concurrents du MÊME item n\'en gardent qu\'un', async () => {
        // La présence était vérifiée HORS file : les deux passaient, et la
        // bibliothèque partagée gardait un doublon que rien ne signalait.
        const { db, win } = await monterBiblioGrilles();
        await db.set(CLE, []);   // security-ok: littéral de banc, aucune source externe

        const [a, b] = await Promise.all([
            win.ajouterGrilleALaBibliotheque(GRILLE('G_A', 'Grille A')),
            win.ajouterGrilleALaBibliotheque(GRILLE('G_A', 'Grille A'))
        ]);

        expect(await db.get(CLE), 'un seul exemplaire').toHaveLength(1);
        expect([a, b].filter(Boolean), 'un seul ajout annonce un succès').toHaveLength(1);
    });

    it('A.d deux retraits concurrents d\'items DIFFÉRENTS retirent les deux', async () => {
        const { db, win } = await monterBiblioGrilles();
        await db.set(CLE, [GRILLE('G_A', 'A'), GRILLE('G_B', 'B'), GRILLE('G_C', 'C')]);   // security-ok: littéral de banc

        await Promise.all([
            win.retirerGrilleDeLaBibliotheque('G_A'),
            win.retirerGrilleDeLaBibliotheque('G_C')
        ]);

        expect((await db.get(CLE)).map((g) => g.id), 'seul B reste').toEqual(['G_B']);
    });
});

/* ------------------------------------------------------------ B — les refus */

describe('#599 · B — le geste impossible REFUSE, et le dit', () => {

    it('B.a retirer un absent rend false et n\'écrit rien', async () => {
        const { db, win } = await monterBiblioGrilles();
        const depart = [GRILLE('G_A', 'A')];
        await db.set(CLE, depart);   // security-ok: littéral de banc

        const rendu = await win.retirerGrilleDeLaBibliotheque('G_FANTOME');

        expect(rendu, 'le contrat rend false').toBe(false);
        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(depart));
    });

    it('B.b ajouter un déjà présent rend false et n\'écrit rien', async () => {
        const { db, win } = await monterBiblioGrilles();
        await db.set(CLE, [GRILLE('G_A', 'A')]);   // security-ok: littéral de banc
        const avant = JSON.stringify(await db.get(CLE));

        const rendu = await win.ajouterGrilleALaBibliotheque(GRILLE('G_A', 'A bis'));

        expect(rendu, 'le contrat rend false').toBe(false);
        expect(JSON.stringify(await db.get(CLE)), 'rien réécrit').toBe(avant);
    });
});

/* --------------------------------------------------- C — le cliquet de #599 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

// Les neuf fichiers qui écrivent un magasin partagé, et le compte attendu.
const PAR_LA_FILE = {
    'js/grilles-bibliotheque.js': 2,
    // ↻ 3 → 2 le 1er septembre 2026 : le versement des huit échelles
    // « disciplinaires » (`migrerEchellesColleguesVersBibliotheque`) est RETIRÉ —
    // ses niveaux n'avaient pas de `valeurCalcul` et rendaient 0,0 % sans un mot.
    // Le site perdu écrivait bien par la file ; c'est l'écriture qui a disparu,
    // pas sa sérialisation. Ce cliquet a fait son travail : il a vu le compte
    // bouger.
    'js/echelles-bibliotheque.js': 2,
    'js/cartouches-bibliotheque.js': 2,
    'js/productions-bibliotheque.js': 2,
    'js/pratiques-bibliotheque.js': 3,
    // ⚰ Retiré le 1er septembre 2026 avec `js/spe-specifications.js` (#681) :
    // 1009 lignes, 24 symboles exposés, ZÉRO consommateur vivant. Les 3 sites
    // qu'il portait écrivaient correctement par la file — c'est le fichier qui
    // est parti, pas sa discipline.
    'js/grilles.js': 1,
    'js/echelles.js': 1,
    'js/cartouches.js': 1,
    'js/pratiques-gestion.js': 1,
    'js/productions-import-export.js': 1
};

const ECRITURE_DIRECTE = /db\.set(Sync)?\(\s*(CLE_BIBLIOTHEQUE[A-Z_]*)\s*,/g;

describe('#599 · C — la course ne peut pas se rouvrir en silence', () => {

    it('C.a plus AUCUNE écriture directe sur un magasin partagé', () => {
        for (const f of Object.keys(PAR_LA_FILE)) {
            const trouvees = lire(f).match(ECRITURE_DIRECTE) || [];
            expect(trouvees.length, `${f} : ${trouvees.join(', ')}`).toBe(0);
        }
    });

    it('C.b chaque fichier écrit par la file, au compte attendu', () => {
        let total = 0;
        for (const [f, attendu] of Object.entries(PAR_LA_FILE)) {
            const n = (lire(f).match(/db\.modifier\(\s*CLE_BIBLIOTHEQUE[A-Z_]*\s*,/g) || []).length;
            expect(n, `${f} : écritures par la file`).toBe(attendu);
            total += n;
        }
        // ↻ 20 → 19 le 1er septembre 2026, même cause : un site retiré avec le
        // versement des huit échelles disciplinaires.
        // ↻ 19 → 16 le 1er septembre 2026 : `js/spe-specifications.js` retiré (#681)
        // emportait ses 3 sites.
        expect(total, 'les seize sites de #599').toBe(16);
    });

    // ⚠ CE CLIQUET A ÉTÉ REFAIT APRÈS UN BREAK-TEST QUI A REFUSÉ DE ROUGIR.
    // La première version cherchait un `.find(` dans une tranche de 2500
    // caractères après l'en-tête de la fonction : en retirant le test de
    // présence de `creerEchelleSPESiInexistante`, elle trouvait celui de la
    // fonction SUIVANTE et passait au vert. Un cliquet qui ne rougit pas sur la
    // violation qu'il prétend garder est pire qu'un cliquet absent, parce qu'il
    // rassure. On borne donc chaque corps à SA fonction, et on exige le refus
    // À L'INTÉRIEUR du mutateur.
    function corpsDeLaFonction(src, nom) {
        const debut = src.indexOf('function ' + nom + '(');
        if (debut === -1) return null;
        const ouvrante = src.indexOf('{', debut);
        let profondeur = 0;
        for (let i = ouvrante; i < src.length; i++) {
            if (src[i] === '{') profondeur++;
            else if (src[i] === '}') {
                profondeur--;
                if (profondeur === 0) return src.slice(debut, i + 1);
            }
        }
        return null;
    }

    // ⚰ « C.c les trois créations SPE vérifient la présence DANS le mutateur » est
    // RETIRÉ le 1er septembre 2026 : `js/spe-specifications.js` n'existe plus
    // (#681). Le test n'est pas réaligné sur un autre fichier — il gardait CES
    // trois fonctions-là, elles sont parties, et un test qui survit à son sujet
    // devient un vert qui n'exclut rien. C.d ci-dessous garde la même discipline
    // sur les cinq « ajouter » qui, eux, existent toujours.

    it('C.d les cinq « ajouter » vérifient la présence DANS le mutateur', () => {
        const cas = {
            'js/grilles-bibliotheque.js': 'ajouterGrilleALaBibliotheque',
            'js/echelles-bibliotheque.js': 'ajouterEchelleALaBibliotheque',
            'js/cartouches-bibliotheque.js': 'ajouterCartoucheALaBibliotheque',
            'js/productions-bibliotheque.js': 'ajouterALaBibliotheque',
            'js/pratiques-bibliotheque.js': 'ajouterPratiqueALaBibliotheque'
        };
        for (const [f, nom] of Object.entries(cas)) {
            const src = lire(f);
            const debut = src.indexOf('function ' + nom + '(');
            expect(debut, `${nom} : introuvable`).toBeGreaterThan(-1);
            const corps = src.slice(debut, debut + 2500);
            const posFile = corps.indexOf('db.modifier(');
            const posTest = corps.indexOf('.some(');
            expect(posFile, `${nom} : la file est absente`).toBeGreaterThan(-1);
            expect(posTest, `${nom} : le test de présence précède la file`).toBeGreaterThan(posFile);
        }
    });
});
