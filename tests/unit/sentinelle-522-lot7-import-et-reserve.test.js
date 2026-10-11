import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 7 (11 oct. 2026) — LES ONZE DERNIERS GESTES EN COURSE.
//
// Remesuré par `scripts/mesurer-522.py ""` avant le lot : 21 sites en course ; onze sont des
// gestes de l'usager, convertis ici à `db.modifier`, au patron des lots précédents :
//   import-export.js — `_ajouterCopiesImportees` ×2 (fusion des listes, statut « present » au
//     retour), `_restaurerBlobsDepuisZip` (statut « manquant »), `executerImportSelectif` ×4
//     (élèves, présences, notes, annotations) ;
//   Réserve — `ReserveCopies.retirer` (la marque « aux archives »), `_retirer` d'E2 et `retirer`
//     d'E3 (le registre `trimestres`), `faireRevenir` (statut « present » au retour).
// Après : 10 sites, les drapeaux de démarrage déjà classés au lot 4.
//
// La conversion ne change que la sérialisation : quand chaque site écrit, et quoi, reste tel
// quel. Les bancs de la Réserve qui jugent l'ORDRE au journal (E3 b, 1028) restent verts.
//
// ⚠ Deux cas de comportement, pas onze, et c'est dit : les autres gestes demandent un montage
// complet (FileReader, archive, magasin) ; ils sont gardés par le cliquet C et par leurs bancs
// voisins, dont le faux `db` reçoit `modifier` au contrat réel.
// ⚠⚠ Banc : chemin IndexedDB rétabli ET clone structuré (faux-vert de #522, lots 1 et 4).
// Chaque cas est une PAIRE D'EFFETS INDÉPENDANTS, chacun asserté. Noms fictifs.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

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
    const requete = (faire) => {
        const req = {};
        Promise.resolve().then(() => { req.result = faire(); if (req.onsuccess) req.onsuccess(); });
        return req;
    };
    return {
        transaction() {
            const tx = {};
            const store = {
                get: (key) => requete(() => (disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined)),
                put(record) {
                    const req = {};
                    const fige = cloner(record.value);
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => { disque.set(record.key, fige); if (tx.oncomplete) tx.oncomplete(); }, 0);
                    });
                    return req;
                },
                delete(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => { disque.delete(key); if (tx.oncomplete) tx.oncomplete(); }, 0);
                    });
                    return req;
                },
                getAll: () => requete(() => [...disque].map(([key, value]) => ({ key, value: cloner(value) })))
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
const parId = (liste, id) => (liste || []).find((x) => x.id === id);

/* --------------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 7 · A — deux écrivains rapprochés gardent LEURS DEUX effets', () => {
    it('A.a la restauration d\'un import marque « manquant » pendant qu\'une copie s\'ajoute : les deux tiennent', async () => {
        const db = await monterDb();
        const win = chargerScript('js/import-export.js', {
            db, cle: (k) => 'h2026_' + k,
            document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
            travauxStockage: { stockerBlob: async () => {}, recupererBlob: async () => null },
            notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
            echapperHtml: (t) => String(t == null ? '' : t)
        });
        if (typeof win._restaurerBlobsDepuisZip !== 'function') throw new Error('_restaurerBlobsDepuisZip absent du sandbox');
        const CLE = 'h2026_fichiersTravaux';
        await db.set(CLE, [{ id: 'FT_1', etudiantDA: '9000001', blobStatut: 'present' }]);   // security-ok: littéral de banc

        // L'autre écrivain entre dans la file en PREMIER (patron du lot 5b, A.d).
        await Promise.all([
            db.modifier(CLE, (l) => l.concat([{ id: 'FT_2', etudiantDA: '9000002', blobStatut: 'present' }]), []),
            win._restaurerBlobsDepuisZip({ _zipTravaux: { file: () => [] }, [CLE]: [{ id: 'FT_1', etudiantDA: '9000001', blobStatut: 'present' }] })
        ]);

        const liste = await db.get(CLE);
        expect(parId(liste, 'FT_1').blobStatut, 'le marquage « manquant » tient').toBe('manquant');
        expect(parId(liste, 'FT_2'), 'la copie ajoutée pendant ce temps tient').toBeTruthy();
    });

    it('A.b la marque « aux archives » s\'écrit pendant qu\'un autre trimestre est marqué : les deux tiennent', async () => {
        const db = await monterDb();
        // Le module lit `window.db` et `window.travauxStockage` : ils sont posés sur la fenêtre du bac.
        const win = chargerScript('js/reserve-copies.js', { notifications: { succes() {}, erreur() {}, info() {} } }, {
            addEventListener() {}, db,
            travauxStockage: { supprimerBlob: async () => {}, recupererBlob: async () => null, supprimerThumbnail: async () => {} }
        });
        if (!win.ReserveCopies || typeof win.ReserveCopies.retirer !== 'function') throw new Error('ReserveCopies.retirer absent du sandbox');
        const res = { etat: 'identique', trimestre: 'a2025', nom: 'Automne 2025', entree: { dossier: 'DOSSIER_FICTIF', uuid: 'U1' },
            aRetirer: { copies: ['FT_A'], vignettes: [] }, tailles: { FT_A: 10 } };

        const [bilan] = await Promise.all([
            win.ReserveCopies.retirer(res),
            db.modifier('_copiesAuxArchives', (m) => Object.assign({}, m || {}, { h2025: { ids: { FT_H: true } } }), null)
        ]);

        const marque = await db.get('_copiesAuxArchives');
        expect(bilan.etat).toBe('fait');
        expect(marque.a2025 && marque.a2025.ids.FT_A, 'la marque du geste tient').toBe(true);
        expect(marque.h2025 && marque.h2025.ids.FT_H, 'l\'autre marque tient').toBe(true);
    });
});

/* ------------------------------------------- C — le cliquet : les onze sites */

function corps(fichier, nom) {
    const src = readFileSync(path.join(RACINE, fichier), 'utf8');
    const m = new RegExp('function\\s+' + nom.replace('$', '\\$') + '\\s*\\(').exec(src);
    if (!m) throw new Error(nom + ' introuvable dans ' + fichier);
    const ouvrante = /\)\s*\{/.exec(src.slice(m.index));
    let i = m.index + ouvrante.index + ouvrante[0].length - 1, prof = 0;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '{') prof++;
        else if (src[j] === '}' && --prof === 0) return src.slice(i, j + 1);
    }
    throw new Error('corps non borné : ' + nom);
}

describe('#522 lot 7 · C — les onze gestes lisent et écrivent DANS la file de leur clé', () => {
    const SITES = [
        ['js/import-export.js', '_ajouterCopiesImportees', 'cleFT', 2],
        ['js/import-export.js', '_restaurerBlobsDepuisZip', 'cleFT', 1],
        ['js/import-export.js', 'executerImportSelectif', 'cleEtu', 1],
        ['js/import-export.js', 'executerImportSelectif', 'clePres', 1],
        ['js/import-export.js', 'executerImportSelectif', 'cleEval', 1],
        ['js/import-export.js', 'executerImportSelectif', 'cleAT', 1],
        ['js/reserve-copies.js', 'retirer', 'CLE', 1],
        ['js/reserve-emprunter.js', '_retirer', "'trimestres'", 1],
        ['js/reserve-renvoyer.js', 'retirer', "'trimestres'", 1],
        ['js/reserve-revenir.js', 'faireRevenir', 'cleFT', 1]
    ];
    for (const [fichier, nom, cleExpr, n] of SITES) {
        it(`${fichier} · ${nom} : ${n} × db.modifier(${cleExpr}), aucun db.set(${cleExpr})`, () => {
            const c = corps(fichier, nom);
            expect((c.match(new RegExp('db\\.modifier\\(' + cleExpr + ',', 'g')) || []).length).toBe(n);
            expect(c).not.toMatch(new RegExp('db\\.set\\(' + cleExpr + ','));
        });
    }
});
