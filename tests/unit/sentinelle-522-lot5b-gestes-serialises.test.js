import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 5b (10 oct. 2026) — LE RESTE DU LOT 5 : LES GESTES DE L'USAGER.
//
// Remesuré par `scripts/mesurer-522.py ""` (⚠ sans argument, le script ne filtre que les clés du
// lot 3 — son en-tête dit « tout le dépôt ») : 30 sites en course, pas 22. Neuf sont des gestes
// de l'usager, convertis ici à `db.modifier`, au patron des lots 1 à 4 :
//   cours.js — retirer, ajouter, importer, déposer (partagerCours) un cours ;
//   cartouches.js — copier une cartouche depuis un autre trimestre ;
//   cc-license.js — enregistrer les métadonnées d'une ressource ;
//   snapshots.js — capturer une séance ;
//   reserve-ouvrir.js — réimporter des tampons ;
//   codex.js — fusionner les copies d'un codex (`_fusionnerTravaux`).
// Deux sites de la fiche ne sont plus en course (devenus synchrones, R3) : la suppression
// définitive de `donnees-v2.js` et la migration d'évaluations d'`echelles.js`. Rien à convertir.
//
// ⚠ Quatre cas de comportement, pas neuf, et c'est dit : l'import de cours passe par un
// FileReader, la capture de séance, le réimport et la fusion de codex demandent un montage
// complet. Ces cinq-là sont gardés par le cliquet C seulement (la capture garde aussi son banc
// de dédoublonnage, sentinelle-snapshots-phantom-dedup-116).
//
// ⚠⚠ Banc : chemin IndexedDB rétabli ET clone structuré (faux-vert de #522, lots 1 et 4).
// Chaque cas est une PAIRE D'EFFETS INDÉPENDANTS, chacun asserté (leçon du lot 3a).

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ------------------------------------------------------------------ harnais */

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? ls[k] : null),
        setItem: (k, v) => { ls[k] = String(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        transaction() {
            const tx = {};
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
                        setTimeout(() => { disque.set(record.key, fige); if (tx.oncomplete) tx.oncomplete(); }, 0);
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
            tx.objectStore = () => store;
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

const silencieux = { succes() {}, erreur() {}, info() {}, avertissement() {} };

async function monterCours(globaux = {}) {
    const db = await monterDb();
    const win = chargerScript('js/cours.js', Object.assign({
        db,
        cle: (k) => 'a2026_' + k,
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
        BibliothequeUI: { fermerModal() {} },
        notifications: silencieux,
        alert: () => {}, confirm: () => true,
        echapperHtml: (t) => String(t == null ? '' : t)
    }, globaux));
    for (const f of ['retirerCoursDeBibliotheque', 'ajouterCoursIndividuel', 'partagerCours']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const COURS = () => ([
    { id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature', dansBibliotheque: true, actif: false },
    { id: 'C2', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire', dansBibliotheque: false, actif: false }
]);
const parId = (liste, id) => liste.find((x) => x.id === id);

/* --------------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 5b · A — deux gestes rapprochés gardent LEURS DEUX effets', () => {

    it('A.a retirer un cours et en ajouter un autre, en rafale : les deux tiennent', async () => {
        const { db, win } = await monterCours();
        await db.set('cours', COURS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.retirerCoursDeBibliotheque('C1'), win.ajouterCoursIndividuel('C2')]);

        const liste = await db.get('cours');
        expect(parId(liste, 'C1').dansBibliotheque, 'le retrait tient').toBe(false);
        expect(parId(liste, 'C2').dansBibliotheque, 'l\'ajout tient').toBe(true);
    });

    it('A.b déposer un cours : ce qui s\'enregistre PENDANT la question des métadonnées reste', async () => {
        let winRef = null;
        const { db, win } = await monterCours({
            ouvrirModalBibliothequeCours: async () => {},
            // La question est à l'écran : un autre geste s'enregistre pendant ce temps.
            demanderMetadonneesEnrichies: async () => {
                await winRef.ajouterCoursIndividuel('C2');
                return { licence: 'CC BY-NC-SA 4.0', auteur_original: 'Prof Fictif' };
            }
        });
        winRef = win;
        await db.set('cours', COURS());   // security-ok: littéral de banc, aucune source externe

        await win.partagerCours('C1');

        const liste = await db.get('cours');
        expect(parId(liste, 'C1').metadata_cc, 'le dépôt tient').toMatchObject({ licence: 'CC BY-NC-SA 4.0' });
        expect(parId(liste, 'C1').dansBibliotheque).toBe(false);
        expect(parId(liste, 'C2').dansBibliotheque, 'l\'ajout fait pendant la question tient').toBe(true);
    });

    it('A.c copier deux cartouches d\'un autre trimestre dans la même grille, en rafale : les deux sont là', async () => {
        const db = await monterDb();
        const winId = chargerScript('js/identite-item.js');
        let n = 0;
        const win = chargerScript('js/cartouches.js', {
            db,
            cle: (k) => (k.startsWith('cartouches_') ? k : 'h2026_' + k),
            genererIdUnique: (p) => p + (++n),
            BibliothequeUI: { forgerInspireDe: () => ({}), obtenirAuteurActif: () => 'Prof Fictif' },
            memeIdentite: winId.memeIdentite,
            ajouterAvecGardeIdentite: winId.ajouterAvecGardeIdentite,
            notifications: silencieux,
            echapperHtml: (t) => String(t == null ? '' : t),
            alert: () => {}, confirm: () => true
        });
        const grille = { id: 'G1', nom: 'Grille fictive', criteres: [{ id: 'K1', nom: 'Structure' }] };
        await db.set('h2026_grillesTemplates', [grille]);   // security-ok: littéral de banc, aucune source externe
        await db.set('cartouches_G1', []);                  // security-ok: littéral de banc, aucune source externe
        const cartouche = (id, nom) => ({ id, nom, grilleId: 'G1', criteres: [{ id: 'K1', nom: 'Structure' }], commentaires: {} });

        const [r1, r2] = await Promise.all([
            win.copierCartoucheDepuisTrimestre('a2025', grille, cartouche('CA', 'Lecture fictive')),
            win.copierCartoucheDepuisTrimestre('a2025', grille, cartouche('CB', 'Écriture fictive'))
        ]);

        expect(r1.ajoutee && r2.ajoutee, 'les deux copies se disent faites').toBe(true);
        const noms = (await db.get('cartouches_G1')).map((c) => c.nom).sort();
        expect(noms, 'les deux copies sont rangées').toEqual(['Lecture fictive', 'Écriture fictive'].sort());
    });

    it('A.d enregistrer les métadonnées d\'une ressource pendant qu\'une autre s\'enregistre : les deux tiennent', async () => {
        const db = await monterDb();
        const champs = { editMetaAuteur: 'Prof Fictif', editMetaInstitution: 'Cégep Fictif', editMetaDiscipline: 'Français', editMetaDescription: 'Grille de banc' };
        const modal = { dataset: { type: 'grille', id: 'G1', cle: 'h2026_grillesTemplates' }, classList: { add() {}, remove() {} } };
        const win = chargerScript('js/cc-license.js', {
            db,
            cle: (k) => 'h2026_' + k,
            document: {
                getElementById: (id) => (id === 'modalEditionMetadonnees' ? modal : (id in champs ? { value: champs[id] } : null)),
                querySelector: () => null, querySelectorAll: () => [], addEventListener() {}
            },
            notifications: silencieux,
            alert: () => {},
            echapperHtml: (t) => String(t == null ? '' : t)
        });
        if (typeof win.sauvegarderMetadonnees !== 'function') throw new Error('sauvegarderMetadonnees absent du sandbox');
        await db.set('h2026_grillesTemplates', [{ id: 'G1', nom: 'Grille un' }, { id: 'G2', nom: 'Grille deux' }]);   // security-ok: littéral de banc

        // L'autre écrivain entre dans la file en PREMIER : sinon l'ancien code écrirait avant
        // que l'autre modification n'existe, et la course n'aurait rien à écraser.
        await Promise.all([
            db.modifier('h2026_grillesTemplates', (l) => { l.find((g) => g.id === 'G2').nom = 'Grille deux, renommée'; return l; }, []),
            win.sauvegarderMetadonnees()
        ]);

        const liste = await db.get('h2026_grillesTemplates');
        expect(parId(liste, 'G1').metadata.auteur_original, 'les métadonnées tiennent').toBe('Prof Fictif');
        expect(parId(liste, 'G2').nom, 'l\'autre enregistrement tient').toBe('Grille deux, renommée');
    });
});

/* ------------------------------------------------------------- B — les refus */

describe('#522 lot 5b · B — le geste impossible n\'écrit rien', () => {
    it('B.a retirer, ajouter ou déposer un cours introuvable laisse la liste intacte', async () => {
        const { db, win } = await monterCours({ demanderMetadonneesEnrichies: async () => ({ licence: 'CC BY' }) });
        await db.set('cours', COURS());   // security-ok: littéral de banc, aucune source externe
        await win.retirerCoursDeBibliotheque('C9');
        await win.ajouterCoursIndividuel('C9');
        await win.partagerCours('C9');
        expect(JSON.stringify(await db.get('cours'))).toBe(JSON.stringify(COURS()));
    });
});

/* ------------------------------------------- C — le cliquet : les neuf sites */

/** Le corps d'une fonction nommée, par appariement d'accolades. */
function corps(fichier, nom) {
    const src = readFileSync(path.join(RACINE, fichier), 'utf8');
    const m = new RegExp('function\\s+' + nom.replace('$', '\\$') + '\\s*\\(').exec(src);
    if (!m) throw new Error(nom + ' introuvable dans ' + fichier);
    // Le corps, pas un paramètre par défaut (`options = {}`) : l'accolade qui suit « ) ».
    const ouvrante = /\)\s*\{/.exec(src.slice(m.index));
    let i = m.index + ouvrante.index + ouvrante[0].length - 1, prof = 0;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '{') prof++;
        else if (src[j] === '}' && --prof === 0) return src.slice(i, j + 1);
    }
    throw new Error('corps non borné : ' + nom);
}

describe('#522 lot 5b · C — les neuf gestes lisent et écrivent DANS la file de leur clé', () => {
    const SITES = [
        ['js/cours.js', 'retirerCoursDeBibliotheque', "'cours'"],
        ['js/cours.js', 'ajouterCoursIndividuel', "'cours'"],
        ['js/cours.js', 'importerCoursSimple', "'cours'"],
        ['js/cours.js', 'partagerCours', "'cours'"],
        ['js/cartouches.js', 'copierCartoucheDepuisTrimestre', 'cleDest'],
        ['js/cc-license.js', 'sauvegarderMetadonnees', 'cleStockage'],
        ['js/snapshots.js', 'capturerSnapshotSeance', 'cleSnapshots()'],
        ['js/reserve-ouvrir.js', 'appliquerReimport', "'tamponsPersonnalises'"],
        ['js/codex.js', '_fusionnerTravaux', 'cleFT']
    ];
    for (const [fichier, nom, cleExpr] of SITES) {
        it(`${fichier} · ${nom} : db.modifier(${cleExpr}), aucun db.set(${cleExpr})`, () => {
            const c = corps(fichier, nom);
            const esc = cleExpr.replace(/[()]/g, '\\$&');
            expect(c).toMatch(new RegExp('db\\.modifier\\(' + esc));
            expect(c).not.toMatch(new RegExp('db\\.set\\(' + esc));
        });
    }

    it('partagerCours lit HORS file pour poser la question, et relit DANS la file pour écrire', () => {
        const c = corps('js/cours.js', 'partagerCours');
        expect(c.indexOf('demanderMetadonneesEnrichies')).toBeLessThan(c.indexOf("db.modifier('cours'"));
    });
});
