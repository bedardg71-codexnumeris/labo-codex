import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE T2 DU CHANTIER DU DÉMO — LE CODEX N'EMPORTE PAS LE DÉMO
// =====================================================================
//
// Décision G1 de Grégoire (6 oct. 2026) : le codex n'emporte ni les clés `demo_*`, ni les
// fichiers que portent `demo_fichiersTravaux`, `demo_corbeilleFichiers` et
// `demo_annotationsTravaux`, ni leurs vignettes `thumbnail_<id>` (constat C4 de
// Rapports/AUDIT-2026-10-05-chantier-demo.md). Le démo se réinstalle depuis l'application.
// Corollaire : ouvrir un codex (ou en fusionner un) ne touche plus le démo installé.
//
// CE QUE CE BANC JUGE, par le vrai `genererCodex` / `chargerCodex` de js/codex.js :
//   (a) écrire : une copie réelle et des copies du démo côte à côte ; le codex porte la
//       réelle, pas celles du démo, ni leurs vignettes ; le manifeste ne les cite pas ;
//   (b) un id commun à une liste réelle et à une liste du démo reste à la copie réelle ;
//   (c) ouvrir un codex d'avant G1 qui porte le démo : rien du démo n'est écrit, le démo
//       installé reste tel quel, ses fichiers ne sont pas comptés perdus, et le plan de
//       purge ne range pas les fichiers du démo installé parmi les résidus ;
//   (d) fusionner : le démo n'est ni écrit, ni supprimé, ni compté ; ses fichiers ne sont
//       pas proposés à l'import.
// TÉMOINS : une mutation par filtre, en mémoire ; une mutation inerte est refusée.
// Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log() {}, warn() {}, info() {}, debug() {}, error() {} };

class FauxFileReader {
    readAsArrayBuffer(blob) {
        blob.arrayBuffer().then(
            (buf) => { this.result = buf; if (this.onload) this.onload(); },
            () => { if (this.onerror) this.onerror(); }
        );
    }
}

function creerDb(initial = {}, blobIds = []) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        _map: map,
        ready: true,
        init: async () => {},
        get: async (k, def = null) => (map.has(k) ? map.get(k) : def),
        set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); },
        keys: async () => [...map.keys()],
        listBlobIds: async () => blobIds.slice(),
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); },
        syncToLocalStorageCache: async () => {},
        flush: async () => {}
    };
}

function creerMagasin(initial = {}) {
    const blobs = new Map(Object.entries(initial));
    return {
        _blobs: blobs,
        recupererBlob: async (id) => (blobs.has(id) ? blobs.get(id) : null),
        stockerBlob: async (id, blob) => { blobs.set(id, blob); }
    };
}

function monterCodex(db, magasin, muter) {
    const win = {
        addEventListener() {}, removeEventListener() {},
        afficherProgression() {}, majProgression() {}, masquerProgression() {},
        trimestreActif: 'h2026'
    };
    const doc = {
        readyState: 'loading',
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({
            setAttribute() {}, appendChild() {}, addEventListener() {}, style: {},
            classList: { add() {}, remove() {}, contains() { return false; } }
        }),
        body: { addEventListener() {}, appendChild() {} },
        documentElement: { addEventListener() {} }
    };
    const stockage = () => ({
        _d: {},
        getItem(k) { return this._d[k] ?? null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    });
    monterFichierSortant(win, { document: doc });
    const brut = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans js/codex.js.');
    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
        'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator',
        '"use strict";\n' + code
    );
    fn(win, doc, consoleSandbox, stockage(), stockage(), db,
        magasin, JSZip, FauxFileReader, (cb) => setTimeout(cb, 0),
        { confirmerAction: async () => true, demanderSaisie: async () => null, informer: async () => {} },
        undefined, (cb) => setTimeout(cb, 0), { userAgent: 'BacASable/T2 (Node; test)' });
    return win.Codex;
}

const pdf = (n) => new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, n])]);

// L'espace de Grégoire, fictif : un trimestre réel et le démo installé, côte à côte.
const ESPACE = {
    h2026_productions: [{ id: 'P1', titre: 'Production fictive' }],
    h2026_fichiersTravaux: [{ id: 'FT_reel_1', nomFichier: 'copie-fictive.pdf', etudiantDA: '0000001', productionId: 'P1' }],
    thumbnail_FT_reel_1: 'data:image/png;base64,UkVFTA==',
    demo_productions: [{ id: 'PD1', titre: 'Production du démo' }],
    demo_fichiersTravaux: [{ id: 'FT_demo_1', nomFichier: 'copie-demo.pdf', etudiantDA: '9000001', productionId: 'PD1' }],
    demo_corbeilleFichiers: [{ id: 'FT_demo_2', nomFichier: 'jetee-demo.pdf', etudiantDA: '9000002', productionId: 'PD1' }],
    demo_annotationsTravaux: [{ id: 'AN_demo_1', fichierId: 'FT_demo_3' }],
    thumbnail_FT_demo_1: 'data:image/png;base64,REVNTzE=',
    thumbnail_FT_demo_2: 'data:image/png;base64,REVNTzI=',
    thumbnail_FT_demo_3: 'data:image/png;base64,REVNTzM=',
    preferencesAffichage: { theme: 'clair' }
};
const magasinDeLEspace = () => creerMagasin({
    FT_reel_1: pdf(1), FT_demo_1: pdf(2), FT_demo_2: pdf(3), FT_demo_3: pdf(4)
});

async function ecrire(espace, muter) {
    const codex = monterCodex(creerDb(espace), magasinDeLEspace(), muter);
    const resultat = await codex.generer({});
    const zip = await JSZip.loadAsync(await resultat.blob.arrayBuffer());
    const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
    const manifeste = JSON.parse(await zip.file('codex-manifeste.json').async('string'));
    const entrees = Object.keys(zip.files).filter((n) => !zip.files[n].dir).sort();
    return { donnees, manifeste, entrees };
}

describe('T2 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monterCodex(creerDb({}), creerMagasin(), (s) => s.replace('CHAINE_ABSENTE_T2', 'x'))).toThrow(/Témoin inerte/);
    });
});

describe('T2 · (a) écrire : le codex porte la copie réelle, pas celles du démo', () => {
    it('ni clé demo_*, ni fichier du démo, ni vignette du démo ; le réel est entier', async () => {
        const { donnees, manifeste, entrees } = await ecrire(ESPACE);
        expect(Object.keys(donnees).sort()).toEqual(['h2026_fichiersTravaux', 'h2026_productions', 'preferencesAffichage', 'thumbnail_FT_reel_1']);
        expect(entrees).toEqual(['codex-manifeste.json', 'donnees.json', 'travaux/FT_reel_1.pdf']);
        expect(manifeste.contenu.cles.filter((c) => /demo/i.test(c))).toEqual([]);
        expect(manifeste.contenu.nombreFichiersTravaux).toBe(1);
    });

    it('break-test : sans le retrait, le démo entre dans le codex (rouge attendu)', async () => {
        const { donnees, entrees } = await ecrire(ESPACE, (s) => s.replace(
            'const partDuDemo = _partDuDemo(donnees);', 'const partDuDemo = { cles: {}, ids: {} };'));
        expect(Object.keys(donnees)).toContain('demo_fichiersTravaux');
        expect(entrees).toContain('travaux/FT_demo_1.pdf');
    });

    it('break-test : sans la sélection des vignettes, celles du démo voyagent (rouge attendu)', async () => {
        const { donnees } = await ecrire(ESPACE, (s) => s.replace(
            "if (Object.prototype.hasOwnProperty.call(donnees, 'thumbnail_' + id)) cles['thumbnail_' + id] = true;", ''));
        expect(Object.keys(donnees)).toEqual(expect.arrayContaining(['thumbnail_FT_demo_1', 'thumbnail_FT_demo_2', 'thumbnail_FT_demo_3']));
    });
});

describe('T2 · (b) un id commun reste à la copie réelle', () => {
    const PARTAGE = {
        h2026_fichiersTravaux: [{ id: 'FT_commun', nomFichier: 'commune.pdf', etudiantDA: '0000001', productionId: 'P1' }],
        demo_fichiersTravaux: [{ id: 'FT_commun', nomFichier: 'commune.pdf', etudiantDA: '9000001', productionId: 'PD1' }],
        thumbnail_FT_commun: 'data:image/png;base64,Q09NTVVO'
    };

    it('la vignette et le fichier d\'un id que porte aussi une liste réelle voyagent', () => {
        const part = monterCodex(creerDb({}), creerMagasin())._partDuDemo(PARTAGE);
        expect(part.ids).toEqual({});
        expect(Object.keys(part.cles)).toEqual(['demo_fichiersTravaux']);
    });

    it('break-test : sans la priorité au réel, la vignette réelle est retirée (rouge attendu)', () => {
        const part = monterCodex(creerDb({}), creerMagasin(), (s) => s.replace('        if (idsReels[id]) return;\n', ''))._partDuDemo(PARTAGE);
        expect(part.cles.thumbnail_FT_commun).toBe(true);
    });
});

// Un codex d'avant G1 : il porte le démo d'un autre jour, dont une copie sans fichier dans le ZIP.
async function codexDAvantG1() {
    const donnees = {
        h2026_productions: [{ id: 'P1', titre: 'Production fictive' }],
        h2026_fichiersTravaux: [{ id: 'FT_reel_1', nomFichier: 'copie-fictive.pdf', etudiantDA: '0000001', productionId: 'P1' }],
        thumbnail_FT_reel_1: 'data:image/png;base64,UkVFTA==',
        demo_productions: [{ id: 'PD_ancien', titre: 'Démo d\'un autre jour' }],
        demo_fichiersTravaux: [
            { id: 'FT_demo_ancien', nomFichier: 'ancienne-demo.pdf', etudiantDA: '9000009', productionId: 'PD_ancien' },
            { id: 'FT_demo_absent', nomFichier: 'absente.pdf', etudiantDA: '9000009', productionId: 'PD_ancien' }
        ],
        thumbnail_FT_demo_ancien: 'data:image/png;base64,QU5DSUVO'
    };
    const zip = new JSZip();
    zip.file('donnees.json', JSON.stringify(donnees));
    zip.folder('travaux');
    zip.file('travaux/FT_reel_1.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 1]));
    zip.file('travaux/FT_demo_ancien.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 9]));
    zip.file('codex-manifeste.json', JSON.stringify({
        formatVersion: '1.0', appVersion: '1.186.5', nom: 'Codex fictif', dateCreation: '2026-10-01T00:00:00.000Z',
        contenu: { cles: Object.keys(donnees), nombreFichiersTravaux: 2, listesDeFichiers: ['fichiersTravaux', 'corbeilleFichiers', 'fichiersModelisation'] }
    }));
    const u8 = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Blob([u8], { type: 'application/zip' });
    blob.name = 'codex-fictif.zip';
    return blob;
}

const DEMO_INSTALLE = {
    demo_productions: [{ id: 'PD1', titre: 'Production du démo' }],
    demo_fichiersTravaux: [{ id: 'FT_demo_1', nomFichier: 'copie-demo.pdf', etudiantDA: '9000001', productionId: 'PD1' }],
    thumbnail_FT_demo_1: 'data:image/png;base64,REVNTzE='
};

async function ouvrir(muter) {
    const base = creerDb(DEMO_INSTALLE, ['FT_demo_1']);
    const magasin = creerMagasin({ FT_demo_1: pdf(2) });
    const codex = monterCodex(base, magasin, muter);
    const { stats } = await codex.charger(await codexDAvantG1());
    return { base, magasin, stats, plan: base._map.get('_codex_planPurge336') || null };
}

describe('T2 · (c) ouvrir un codex d\'avant G1 ne touche pas le démo installé', () => {
    it('le démo installé reste tel quel ; rien du démo du codex n\'est écrit ni compté perdu', async () => {
        const { base, magasin, stats, plan } = await ouvrir();
        expect(base._map.get('demo_productions')).toEqual(DEMO_INSTALLE.demo_productions);
        expect(base._map.get('demo_fichiersTravaux')).toEqual(DEMO_INSTALLE.demo_fichiersTravaux);
        expect(base._map.has('thumbnail_FT_demo_ancien')).toBe(false);
        expect([...magasin._blobs.keys()].sort()).toEqual(['FT_demo_1', 'FT_reel_1']);
        expect(stats.nbBlobsAttendus).toBe(1);
        expect(stats.incomplet).toBe(false);
        // Le réel, lui, est ouvert.
        expect(base._map.get('h2026_productions')).toEqual([{ id: 'P1', titre: 'Production fictive' }]);
        expect(plan === null || plan.plan.blobsOrphelins.indexOf('FT_demo_1') === -1).toBe(true);
    });

    it('break-test : sans le retrait à l\'ouverture, le démo du codex écrase l\'installé (rouge attendu)', async () => {
        const { base, stats } = await ouvrir((s) => s.replace(
            'const donnees = _sansLeDemo(JSON.parse(jsonStr));', 'const donnees = JSON.parse(jsonStr);'));
        expect(base._map.get('demo_productions')).toEqual([{ id: 'PD_ancien', titre: 'Démo d\'un autre jour' }]);
        expect(stats.incomplet).toBe(true);
    });

    it('break-test : sans la protection, le fichier du démo installé devient un résidu (rouge attendu)', async () => {
        const { plan } = await ouvrir((s) => s.replace(
            '&& !(idsDuDemoInstalle && idsDuDemoInstalle[id])', ''));
        expect(plan.plan.blobsOrphelins).toContain('FT_demo_1');
    });
});

describe('T2 · (d) fusionner : le démo n\'est ni écrit, ni supprimé, ni compté', () => {
    const local = { h2026_productions: [1], demo_productions: [{ id: 'PD1' }], demo_fichiersTravaux: [{ id: 'FT_demo_1' }], thumbnail_FT_demo_1: 'x' };
    const externe = { h2026_productions: [1] };
    const ancetre = { cles: { h2026_productions: 'h', demo_productions: 'h', demo_fichiersTravaux: 'h', thumbnail_FT_demo_1: 'h' } };

    const touche = (a) => [].concat(a.ajouteesLocal, a.ajouteesExterne, a.modifieesLocal, a.modifieesExterne,
        a.supprimeesLocal, a.supprimeesExterne, a.conflits.map((c) => c.cle || c));

    it('l\'analyse ignore les clés et les vignettes du démo', async () => {
        const analyse = await monterCodex(creerDb({}), creerMagasin())._analyserFusion(local, externe, ancetre);
        expect(touche(analyse).filter((c) => /demo/i.test(String(c)))).toEqual([]);
    });

    it('break-test : sans le saut, le démo local est donné supprimé par l\'externe (rouge attendu)', async () => {
        const analyse = await monterCodex(creerDb({}), creerMagasin(), (s) => s.replace(
            '        if (_estCleDuDemo(cle) || horsFusion[cle]) continue;\n', ''))._analyserFusion(local, externe, ancetre);
        expect(touche(analyse).filter((c) => /demo/i.test(String(c))).length).toBeGreaterThan(0);
    });

    it('lire un codex externe d\'avant G1 : ni ses clés du démo, ni ses fichiers du démo', async () => {
        const externeLu = await monterCodex(creerDb({}), creerMagasin()).lireExterne(await codexDAvantG1());
        expect(Object.keys(externeLu.donnees).filter((c) => /demo/i.test(c))).toEqual([]);
        expect(externeLu.travauxListe).toEqual(['travaux/FT_reel_1.pdf']);
    });

    it('break-test : sans le filtre des chemins, le fichier du démo est proposé (rouge attendu)', async () => {
        const externeLu = await monterCodex(creerDb({}), creerMagasin(), (s) => s.replace(
            '            if (partDuDemo.ids[point > 0 ? nom.slice(0, point) : nom]) return;\n', '')).lireExterne(await codexDAvantG1());
        expect(externeLu.travauxListe).toContain('travaux/FT_demo_ancien.pdf');
    });
});
