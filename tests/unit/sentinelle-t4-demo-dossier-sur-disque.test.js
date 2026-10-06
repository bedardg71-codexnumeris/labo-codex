import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
// SENTINELLE T4 DU CHANTIER DU DÉMO — RIEN DU DÉMO N'ENTRE DANS LE DOSSIER RÉEL
// =====================================================================
//
// Rapports/AUDIT-2026-10-05-chantier-demo.md : avec un dossier sur disque branché (FSAPI),
// `stockerBlob` écrit la copie DANS ce dossier, celui des vraies copies de l'enseignant.
// En démo, les copies du démo y entraient. Choix (6 oct. 2026) : refuser, plutôt qu'écrire en
// IndexedDB seulement — la lecture passe elle aussi par le dossier quand il est branché.
//
// CE QUE CE BANC JUGE, par le vrai js/travaux-stockage.js et le vrai `importerTous` :
//   (a) en démo, dossier branché : `stockerBlob` refuse et le dossier reste vide ;
//   (b) hors démo, dossier branché : la copie entre dans le dossier (le refus ne déborde pas) ;
//   (c) en démo, sans dossier : la copie va en IndexedDB comme avant ;
//   (d) `importerTous` refuse avant tout fichier, avec un seul avis.
// TÉMOINS : une mutation par garde ; une mutation inerte est refusée. Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleMuette = { log() {}, warn() {}, info() {}, debug() {}, error() {} };

function fauxDossier() {
    const fichiers = new Map();
    const dossier = {
        _fichiers: fichiers,
        getDirectoryHandle: async () => dossier,
        getFileHandle: async (nom) => ({
            createWritable: async () => ({ write: async (b) => { fichiers.set(nom, b); }, close: async () => {} }),
            getFile: async () => fichiers.get(nom)
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

describe('T4 · stockerBlob', () => {
    it('(a) en démo, dossier branché : refus, le dossier reste vide', async () => {
        const dossier = fauxDossier();
        const { stockage, blobsIdb } = monterStockage({ demo: true, dossier });
        expect(await stockage.configurerRepertoireFSAPI()).toBe(true);
        await expect(stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1')).rejects.toThrow(/Quitte la démo/);
        expect(dossier._fichiers.size).toBe(0);
        expect(blobsIdb.size).toBe(0);
    });

    it('(b) hors démo, dossier branché : la copie entre dans le dossier', async () => {
        const dossier = fauxDossier();
        const { stockage } = monterStockage({ demo: false, dossier });
        await stockage.configurerRepertoireFSAPI();
        await stockage.stockerBlob('FT_reel_1', copie(), '0000001', 'P1');
        expect([...dossier._fichiers.keys()]).toEqual(['FT_reel_1']);
    });

    it('(c) en démo, sans dossier : la copie va en IndexedDB comme avant', async () => {
        const { stockage, blobsIdb } = monterStockage({ demo: true, dossier: null });
        await stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1');
        expect([...blobsIdb.keys()]).toEqual(['FT_demo_1']);
    });

    it('break-test : sans la garde, la copie du démo entre dans le dossier réel (rouge attendu)', async () => {
        const dossier = fauxDossier();
        const { stockage } = monterStockage({ demo: true, dossier, muter: (s) => s.replace(
            'if (refusDuDemoSurDisque()) {\n            const refus', 'if (false) {\n            const refus') });
        await stockage.configurerRepertoireFSAPI();
        await stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1');
        expect([...dossier._fichiers.keys()]).toEqual(['FT_demo_1']);
    });

    it('break-test : sans la clause du dossier, le démo sans dossier est refusé lui aussi (rouge attendu)', async () => {
        const { stockage } = monterStockage({ demo: true, dossier: null, muter: (s) => s.replace(
            'return fsapiActif && typeof window.estEnModeDemo', 'return typeof window.estEnModeDemo') });
        await expect(stockage.stockerBlob('FT_demo_1', copie(), '9000001', 'PD1')).rejects.toThrow(/Quitte la démo/);
    });
});

describe('T4 · importerTous refuse avant tout fichier, avec un seul avis', () => {
    const source = readFileSync(path.join(racine, 'js/travaux-import.js'), 'utf8');
    const debut = source.indexOf('async function importerTous(');
    const corps = source.slice(debut, source.indexOf('function purgerFichiersImportes(', debut));

    it('le refus précède la levée de importEnCours et la boucle', () => {
        const refus = corps.indexOf('travauxStockage.refusDuDemoSurDisque()');
        expect(refus).toBeGreaterThan(-1);
        expect(refus).toBeLessThan(corps.indexOf('importEnCours = true'));
        expect(corps.slice(refus, corps.indexOf('importEnCours = true'))).toMatch(/notifications\.warning\([^;]*AVIS_DEMO_DOSSIER\);\s*return \{[^}]*refuse: true/);
    });

    it('les deux écrans d\'import se taisent après le refus (pas de « 0 importé »)', () => {
        const ui = readFileSync(path.join(racine, 'js/travaux-ui.js'), 'utf8');
        expect(ui.match(/if \(resultat\.refuse\)/g)).toHaveLength(2);
    });
});
