import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
// SENTINELLE T4 DU CHANTIER DU DÉMO — RIEN DU DÉMO N'ENTRE DANS LE DOSSIER RÉEL
// =====================================================================
//
// Rapports/AUDIT-2026-10-05-chantier-demo.md : avec un dossier sur disque branché (FSAPI),
// `stockerBlob` écrivait la copie DANS ce dossier, celui des vraies copies de l'enseignant.
// En démo, les copies du démo y entraient. Décision technique de Cowork (relecture de 1.186.6) :
// en démo, le dossier n'est jamais lu ni écrit ; les copies passent par IndexedDB seulement
// (un refus d'import bloquait la présentation : aucune interface ne débranche le dossier).
//
// CE QUE CE BANC JUGE, par le vrai js/travaux-stockage.js :
//   (a) en démo, dossier branché : la copie s'écrit en IndexedDB, se relit, se supprime, et le
//       dossier reste intact (ni écrit, ni lu, ni vidé) ;
//   (b) hors démo, dossier branché : la copie entre dans le dossier, comme avant ;
//   (c) en démo, sans dossier : IndexedDB, comme avant.
// TÉMOINS : une mutation par clause de la condition ; une mutation inerte est refusée. Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleMuette = { log() {}, warn() {}, info() {}, debug() {}, error() {} };

function fauxDossier() {
    const fichiers = new Map();
    const dossier = {
        _fichiers: fichiers,
        _lus: [],
        getDirectoryHandle: async () => dossier,
        removeEntry: async (nom) => { fichiers.delete(nom); },
        getFileHandle: async (nom) => ({
            createWritable: async () => ({ write: async (b) => { fichiers.set(nom, b); }, close: async () => {} }),
            getFile: async () => { dossier._lus.push(nom); return fichiers.get(nom); }
        })
    };
    return dossier;
}

function monterStockage({ demo, dossier, muter }) {
    const brut = readFileSync(path.join(racine, 'js/travaux-stockage.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans js/travaux-stockage.js.');
    const blobsIdb = new Map();
    const win = {
        estEnModeDemo: () => demo,
        showDirectoryPicker: dossier ? async () => dossier : undefined
    };
    const db = {
        storeBlob: async (r) => { blobsIdb.set(r.id, r.blob); },
        getBlob: async (id) => (blobsIdb.has(id) ? { blob: blobsIdb.get(id) } : null),
        deleteBlob: async (id) => { blobsIdb.delete(id); },
        getSync: (k, d) => d, setSync() {}, get: async (k, d) => d, set: async () => {}
    };
    const nav = { storage: { getDirectory: async () => ({}) } };
    new Function('window', 'db', 'console', 'navigator', 'notifications', 'cle', 'indexedDB', code)(
        win, db, consoleMuette, nav, { erreur() {}, warning() {} }, (k) => (demo ? 'demo_' : 'h2026_') + k, undefined);
    return { stockage: win.travauxStockage, blobsIdb };
}

const copie = () => new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])]);

describe('T4 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monterStockage({ demo: true, muter: (s) => s.replace('CHAINE_ABSENTE_T4', 'x') })).toThrow(/Témoin inerte/);
    });
});

describe('T4 · en démo, le dossier sur disque n\'est jamais touché', () => {
    it('(a) en démo, dossier branché : écrite, relue et supprimée en IndexedDB ; le dossier intact', async () => {
        const dossier = fauxDossier();
        dossier._fichiers.set('FT_reel_1', copie());   // une vraie copie, déjà là
        const { stockage, blobsIdb } = monterStockage({ demo: true, dossier });
        expect(await stockage.configurerRepertoireFSAPI()).toBe(true);
        await stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1');
        expect([...blobsIdb.keys()]).toEqual(['FT_demo_1']);
        expect(await stockage.recupererBlob('FT_demo_1')).toBeInstanceOf(Blob);
        expect(await stockage.recupererBlob('FT_reel_1')).toBeNull();   // le dossier n'est pas lu
        await stockage.supprimerBlob('FT_reel_1');                       // ni vidé
        await stockage.supprimerBlob('FT_demo_1');
        expect(blobsIdb.size).toBe(0);
        expect([...dossier._fichiers.keys()]).toEqual(['FT_reel_1']);
        expect(dossier._lus).toEqual([]);
    });

    it('(b) hors démo, dossier branché : la copie entre dans le dossier et s\'y relit', async () => {
        const dossier = fauxDossier();
        const { stockage, blobsIdb } = monterStockage({ demo: false, dossier });
        await stockage.configurerRepertoireFSAPI();
        await stockage.stockerBlob('FT_reel_1', copie(), '0000001', 'P1');
        expect([...dossier._fichiers.keys()]).toEqual(['FT_reel_1']);
        expect(await stockage.recupererBlob('FT_reel_1')).toBeInstanceOf(Blob);
        expect(blobsIdb.size).toBe(0);
    });

    it('(c) en démo, sans dossier : la copie va en IndexedDB comme avant', async () => {
        const { stockage, blobsIdb } = monterStockage({ demo: true, dossier: null });
        await stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1');
        expect([...blobsIdb.keys()]).toEqual(['FT_demo_1']);
    });

    it('break-test : sans la condition de mode, la copie du démo entre dans le dossier réel (rouge attendu)', async () => {
        const dossier = fauxDossier();
        const { stockage, blobsIdb } = monterStockage({ demo: true, dossier, muter: (s) => s.replace(
            "return fsapiActif && !(typeof window.estEnModeDemo === 'function' && window.estEnModeDemo());",
            'return fsapiActif;') });
        await stockage.configurerRepertoireFSAPI();
        await stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1');
        expect([...dossier._fichiers.keys()]).toEqual(['FT_demo_1']);
        expect(blobsIdb.size).toBe(0);
    });

    it('break-test : sans la clause du dossier, hors démo la copie va en IndexedDB (rouge attendu)', async () => {
        const dossier = fauxDossier();
        const { stockage, blobsIdb } = monterStockage({ demo: false, dossier, muter: (s) => s.replace(
            "return fsapiActif && !(typeof window.estEnModeDemo", "return false && !(typeof window.estEnModeDemo") });
        await stockage.configurerRepertoireFSAPI();
        await stockage.stockerBlob('FT_reel_1', copie(), '0000001', 'P1');
        expect(dossier._fichiers.size).toBe(0);
        expect([...blobsIdb.keys()]).toEqual(['FT_reel_1']);
    });

    for (const fn of ['recupererBlob', 'supprimerBlob']) {
        it(`break-test : ${fn} qui relit fsapiActif seul touche le dossier en démo (rouge attendu)`, async () => {
            const dossier = fauxDossier();
            dossier._fichiers.set('FT_reel_1', copie());
            const appel = fn === 'recupererBlob' ? 'return await recupererBlobFSAPI(id);' : 'await supprimerBlobFSAPI(id);';
            const { stockage } = monterStockage({ demo: true, dossier, muter: (s) => s.replace(
                `if (dossierEnJeu()) {   // jamais en démo (T4)\n            ${appel}`, `if (fsapiActif) {\n            ${appel}`) });
            await stockage.configurerRepertoireFSAPI();
            await stockage[fn]('FT_reel_1');
            if (fn === 'recupererBlob') expect(dossier._lus).toEqual(['FT_reel_1']);
            else expect(dossier._fichiers.size).toBe(0);
        });
    }
});
