import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

// =====================================================================
// SENTINELLE #988, LOT J0 — LE FICHIER DU CODEX EST ASSEMBLÉ SANS COPIER LES COPIES
// =====================================================================
//
// Vécu le 30 sept. 2026 (iPad, Safari 27, 1.170.0, codex réel de 1,33 Go) : la page est
// rechargée pendant « Compression du ZIP… », avant toute écriture. Mesuré sous WebKit
// (plans de travail/MESURE-2026-09-30-lot-J0-codex-memoire.md) : confier les copies à
// JSZip prenait en mémoire cinq fois la taille du codex et posait le fichier entier une
// fois de plus sur le disque. Depuis le lot, `_assemblerCodexZip` range les copies telles
// quelles (STORE), par référence ; seuls les textes passent par JSZip.
//
// CE QUE CE BANC JUGE : LE CONTENU.
//   (a) un codex produit APRÈS le lot et un codex au format d'AVANT (1.170.0, écrit ici
//       par un rédacteur de référence figé) portent les mêmes entrées, octet pour octet,
//       et restituent les mêmes données et les mêmes copies dans une base vide (empreintes) ;
//   (b) le fichier d'après est un ZIP que JSZip relit en VÉRIFIANT les CRC ;
//   (c) la Défense K et l'aperçu voient toujours les copies ;
//   (d) une copie n'est lue que par tranches, jamais en entier (l'invariant de mémoire) ;
//   (e) les bornes du format (4 Go, 65 535 entrées) sont refusées, pas écrites fausses.
//
// CE QU'IL NE JUGE PAS : le pic de mémoire ni le disque (Node n'est pas WebKit : voir le
// fichier de mesure), ni le partage de l'iPad (porte terrain).
//
// TÉMOINS : chaque invariant a le sien, par mutation de la source EN MÉMOIRE ; une
// mutation qui ne remplace rien est refusée (« Témoin inerte »). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const consoleSandbox = {
    log: () => {}, warn: () => {}, info: () => {}, debug: () => {},
    error: (...a) => console.error(...a)
};

class FauxFileReader {
    readAsArrayBuffer(blob) {
        blob.arrayBuffer().then(
            (buf) => { this.result = buf; if (this.onload) this.onload(); },
            () => { if (this.onerror) this.onerror(); }
        );
    }
}

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

/** Magasin de copies : ce que `travauxStockage` offre au trajet du codex. */
function creerMagasin(initial = {}) {
    const blobs = new Map(Object.entries(initial));
    return {
        _blobs: blobs,
        recupererBlob: async (id) => (blobs.has(id) ? blobs.get(id) : null),
        stockerBlob: async (id, blob) => { blobs.set(id, blob); }
    };
}

function monterCodex(db, options = {}) {
    const win = {
        addEventListener: () => {}, removeEventListener: () => {},
        afficherProgression: () => {}, majProgression: options.majProgression || (() => {}), masquerProgression: () => {},
        trimestreActif: 'a2026'
    };
    if (options.validation) win.SecuriteExportValidation = options.validation;
    if (options.apercu) win.SecuriteExportPreview = options.apercu;
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
    const brut = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');
    const code = options.muter ? options.muter(brut) : brut;
    if (options.muter && code === brut) throw new Error('Témoin inerte : la mutation de js/codex.js n\'a rien remplacé.');
    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
        'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator',
        '"use strict";\n' + code
    );
    fn(win, doc, consoleSandbox, stockage(), stockage(), db,
        options.magasin, JSZip, FauxFileReader, (cb) => setTimeout(cb, 0),
        { confirmerAction: async () => true, demanderSaisie: async () => null },
        undefined, (cb) => setTimeout(cb, 0), { userAgent: 'BacASable/988-J0 (Node; test)' });
    return win.Codex;
}

/** Octets déterministes, incompressibles en pratique (comme un PDF ou une image). */
function octets(taille, graine) {
    const u = new Uint8Array(taille);
    let x = (graine * 2654435761) >>> 0;
    for (let i = 0; i < taille; i++) {
        x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
        u[i] = x & 0xFF;
    }
    return u;
}

const sha = (u8) => createHash('sha256').update(u8).digest('hex');
const shaBlob = async (blob) => sha(Buffer.from(await blob.arrayBuffer()));

const MO = 1024 * 1024;

// Deux trimestres ; une copie plus grosse que deux tranches de CRC (4 Mo) ; une copie
// vide ; un nom sans extension ; une copie « exportée » (sans blob) ; et la même copie
// citée par les deux trimestres (le même nom d'entrée déposé deux fois).
const COPIES = {
    FT_j0_a: octets(70 * 1024, 1),
    FT_j0_photo: octets(33 * 1024 + 7, 2),
    FT_j0_grosse: octets(9 * MO + 123, 3),
    FT_j0_vide: new Uint8Array(0),
    FT_j0_sansext: octets(512, 5)
};
const CORPUS = {
    a2026_groupeEtudiants: [{ da: '0000001', nom: 'Élève fictif Un' }, { da: '0000002', nom: 'Élève fictive Deux' }],
    a2026_retroactions: { P1: 'Rétroaction fictive : la structure est claire, la rigueur à préciser.' },
    a2026_fichiersTravaux: [
        { id: 'FT_j0_a', nomFichier: 'copie-fictive-a.pdf', etudiantDA: '0000001', productionId: 'P1' },
        { id: 'FT_j0_photo', nomFichier: 'photo-fictive.jpeg', etudiantDA: '0000002', productionId: 'P1' },
        { id: 'FT_j0_grosse', nomFichier: 'grosse-copie-fictive.pdf', etudiantDA: '0000002', productionId: 'P2' },
        { id: 'FT_j0_vide', nomFichier: 'vide.png', etudiantDA: '0000001', productionId: 'P2' },
        { id: 'FT_j0_sansext', nomFichier: 'sansextension', etudiantDA: '0000001', productionId: 'P3' },
        { id: 'FT_j0_partie', nomFichier: 'partie.pdf', etudiantDA: '0000001', productionId: 'P3', blobStatut: 'exporte' }
    ],
    h2026_fichiersTravaux: [
        { id: 'FT_j0_a', nomFichier: 'copie-fictive-a.pdf', etudiantDA: '0000001', productionId: 'P1' }
    ]
};
const NOMS_ATTENDUS = [
    'donnees.json', 'travaux/',
    'travaux/FT_j0_a.pdf', 'travaux/FT_j0_photo.jpeg', 'travaux/FT_j0_grosse.pdf',
    'travaux/FT_j0_vide.png', 'travaux/FT_j0_sansext.bin',
    'codex-manifeste.json'
];

const magasinDuCorpus = (Classe = Blob) =>
    creerMagasin(Object.fromEntries(Object.entries(COPIES).map(([id, u]) => [id, new Classe([u])])));

/**
 * RÉDACTEUR DE RÉFÉRENCE, FIGÉ : le fichier tel que 1.170.0 l'écrivait (`genererCodex`
 * au commit 0502e0f8) : tout confié à JSZip, DEFLATE niveau 6, manifeste en dernier.
 * Ne pas le « mettre à jour » : il est l'AVANT auquel l'APRÈS se compare.
 */
async function ecrireComme1170(donnees, manifeste, magasin) {
    const zip = new JSZip();
    zip.file('donnees.json', JSON.stringify(donnees, null, 0));
    const dossier = zip.folder('travaux');
    let fichiers = [];
    Object.keys(donnees).filter((c) => c.includes('fichiersTravaux')).forEach((c) => { fichiers = fichiers.concat(donnees[c]); });
    for (const f of fichiers) {
        const blob = await magasin.recupererBlob(f.id);
        if (!blob) continue;
        const nf = f.nomFichier || '';
        const ext = nf.indexOf('.') !== -1 ? nf.split('.').pop() : 'bin';
        dossier.file(f.id + '.' + ext, new Uint8Array(await blob.arrayBuffer()));
    }
    zip.file('codex-manifeste.json', JSON.stringify(manifeste, null, 2));
    const u8 = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    return new Blob([u8], { type: 'application/zip' });
}

/** Ouvre un fichier avec JSZip EN VÉRIFIANT LES CRC, et rend nom → empreinte du contenu. */
async function empreintesDuFichier(blob) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer(), { checkCRC32: true });
    const out = {};
    for (const nom of Object.keys(zip.files)) {
        out[nom] = zip.files[nom].dir ? '(dossier)' : sha(await zip.files[nom].async('uint8array'));
    }
    return { zip, empreintes: out };
}

/**
 * Le même juge, mais qui rend des MOTS : « ouvert » ou le message du refus. Une assertion
 * ratée n'emporte ainsi jamais un fichier entier dans son message (mesuré : le rapporteur
 * de Vitest s'y étouffe, « Invalid array length »).
 */
async function verdictDOuverture(blob) {
    try { await empreintesDuFichier(blob); return 'ouvert'; } catch (e) { return String(e && e.message); }
}

/** La clôture du fichier (ses 22 derniers octets) : comptes et position du répertoire. */
async function cloture(blob) {
    const u8 = new Uint8Array(await blob.slice(blob.size - 22).arrayBuffer());
    const v = new DataView(u8.buffer);
    return {
        signature: v.getUint32(0, true).toString(16),
        entreesIci: v.getUint16(8, true), entreesTotal: v.getUint16(10, true),
        finDuRepertoire: v.getUint32(12, true) + v.getUint32(16, true)
    };
}

/** Restaure un fichier dans une base et un magasin VIDES ; rend leurs empreintes. */
async function restaurer(blob) {
    const base = creerDb({});
    const magasin = creerMagasin({});
    const codex = monterCodex(base, { magasin });
    blob.name = 'codex-du-banc.zip';
    const bilan = await codex.charger(blob);
    const copies = {};
    for (const [id, b] of magasin._blobs) copies[id] = await shaBlob(b);
    const donnees = {};
    for (const [k, v] of base._map) if (!k.startsWith('_codex_')) donnees[k] = v;
    return { bilan, copies, donnees: sha(JSON.stringify(donnees, Object.keys(donnees).sort())), brut: donnees };
}

async function produire(options = {}) {
    const magasin = options.magasin || magasinDuCorpus();
    const codex = monterCodex(creerDb(CORPUS), Object.assign({ magasin }, options));
    const resultat = await codex.generer({});
    return { resultat, magasin, codex };
}

describe('#988 lot J0 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monterCodex(creerDb({}), { muter: (s) => s.replace('CHAINE_ABSENTE_DE_CODEX_J0', 'x') })).toThrow(/Témoin inerte/);
    });
});

describe('#988 lot J0 · (a) avant et après : mêmes entrées, mêmes données restituées', () => {

    it('le fichier d\'après et le fichier au format 1.170.0 portent les mêmes entrées, octet pour octet', async () => {
        const { resultat, magasin } = await produire();
        const avant = await ecrireComme1170(resultat.donnees, resultat.manifeste, magasin);

        const apres = await empreintesDuFichier(resultat.blob);
        const reference = await empreintesDuFichier(avant);

        expect(Object.keys(apres.empreintes).sort()).toEqual([...NOMS_ATTENDUS].sort());
        expect(apres.empreintes).toEqual(reference.empreintes);
        // Et ce contenu est bien celui des sources, pas seulement « le même des deux côtés ».
        expect(apres.empreintes['travaux/FT_j0_grosse.pdf']).toBe(sha(COPIES.FT_j0_grosse));
        expect(apres.empreintes['travaux/FT_j0_vide.png']).toBe(sha(new Uint8Array(0)));
        expect(JSON.parse(await apres.zip.file('donnees.json').async('string'))).toEqual(CORPUS);
    }, 30000);

    it('les deux fichiers restituent les mêmes données et les mêmes copies dans une base vide', async () => {
        const { resultat, magasin } = await produire();
        const avant = await ecrireComme1170(resultat.donnees, resultat.manifeste, magasin);

        const depuisApres = await restaurer(resultat.blob);
        const depuisAvant = await restaurer(avant);

        expect(depuisApres.bilan.stats.incomplet).toBe(false);
        expect(depuisApres.donnees).toBe(depuisAvant.donnees);
        expect(depuisApres.copies).toEqual(depuisAvant.copies);
        // Les cinq copies reviennent, avec leur contenu d'origine.
        expect(Object.keys(depuisApres.copies).sort()).toEqual(Object.keys(COPIES).sort());
        for (const id of Object.keys(COPIES)) expect(depuisApres.copies[id]).toBe(sha(COPIES[id]));
        expect(depuisApres.brut.a2026_groupeEtudiants).toEqual(CORPUS.a2026_groupeEtudiants);
    }, 30000);

    it('le manifeste compte comme avant : six dépôts (la copie citée deux fois compte deux fois), une seule entrée', async () => {
        const { resultat } = await produire();
        expect(resultat.manifeste.contenu.nombreFichiersTravaux).toBe(6);
        const { empreintes } = await empreintesDuFichier(resultat.blob);
        expect(Object.keys(empreintes).filter((n) => n === 'travaux/FT_j0_a.pdf')).toHaveLength(1);
    }, 30000);

    it('une copie stockée en tampon d\'octets, pas en Blob, part quand même (JSZip l\'acceptait)', async () => {
        const magasin = magasinDuCorpus();
        magasin._blobs.set('FT_j0_photo', COPIES.FT_j0_photo);            // Uint8Array
        magasin._blobs.set('FT_j0_sansext', COPIES.FT_j0_sansext.buffer);  // ArrayBuffer
        const { resultat } = await produire({ magasin });
        const { empreintes } = await empreintesDuFichier(resultat.blob);
        expect(empreintes['travaux/FT_j0_photo.jpeg']).toBe(sha(COPIES.FT_j0_photo));
        expect(empreintes['travaux/FT_j0_sansext.bin']).toBe(sha(COPIES.FT_j0_sansext));
    }, 30000);

    it('TÉMOIN — sans l\'enveloppe, une copie en tampon d\'octets donne un fichier qui ne s\'ouvre plus', async () => {
        const magasin = magasinDuCorpus();
        magasin._blobs.set('FT_j0_photo', COPIES.FT_j0_photo);
        const verdict = await produire({
            magasin, muter: (s) => s.replace('if (!(blob instanceof Blob)) blob = new Blob([blob]);', '')
        }).then(({ resultat }) => verdictDOuverture(resultat.blob), (e) => 'génération refusée : ' + e.message);
        expect(verdict).not.toBe('ouvert');
    }, 30000);

    it('TÉMOIN — un CRC qui ne se poursuit pas d\'une tranche à l\'autre : le fichier est refusé à la relecture', async () => {
        const { resultat } = await produire({
            muter: (s) => s.replace('crc = _crc32(new Uint8Array(tampon), crc);', 'crc = _crc32(new Uint8Array(tampon), 0);')
        });
        expect(await verdictDOuverture(resultat.blob)).toMatch(/Corrupted zip : CRC32 mismatch/);
    }, 30000);

    it('TÉMOIN — une position d\'entrée fausse d\'un octet : le fichier ne s\'ouvre plus', async () => {
        const { resultat } = await produire({
            muter: (s) => s.replace('w.setUint32(42, position, true);', 'w.setUint32(42, position + 1, true);')
        });
        expect(await verdictDOuverture(resultat.blob)).toMatch(/Corrupted zip/);
    }, 30000);

    it('la clôture du fichier compte toutes les entrées et tombe juste', async () => {
        // JSZip tolère un compte faux (mesuré : il ouvre quand même) ; d'autres lecteurs
        // non. Le compte se juge donc ici, sur les octets.
        const { resultat } = await produire();
        expect(await cloture(resultat.blob)).toEqual({
            signature: '6054b50', entreesIci: NOMS_ATTENDUS.length, entreesTotal: NOMS_ATTENDUS.length,
            finDuRepertoire: resultat.blob.size - 22
        });
    }, 30000);

    it('TÉMOIN — un compte d\'entrées qui oublie les copies est vu à la clôture', async () => {
        const { resultat } = await produire({
            muter: (s) => s.replace('x.setUint16(10, nbTextes + copies.length, true);', 'x.setUint16(10, nbTextes, true);')
        });
        expect((await cloture(resultat.blob)).entreesTotal).toBe(3);
    }, 30000);

    it('TÉMOIN — sans la règle « le dernier dépôt l\'emporte », la copie citée deux fois fait deux entrées', async () => {
        const { resultat } = await produire({
            muter: (s) => s.replace('if (Object.prototype.hasOwnProperty.call(rangDeLaCopie, nomEntree)) {', 'if (false) {')
        });
        // JSZip ne garde qu'un nom : le doublon se lit à la clôture, par le compte.
        expect((await cloture(resultat.blob)).entreesTotal).toBe(NOMS_ATTENDUS.length + 1);
    }, 30000);
});

describe('#988 lot J0 · (b) la forme du fichier', () => {

    it('les copies sont rangées telles quelles, les textes compressés ; le fichier est un application/zip', async () => {
        const { resultat } = await produire();
        const { zip } = await empreintesDuFichier(resultat.blob);
        expect(resultat.blob.type).toBe('application/zip');
        const grosse = zip.files['travaux/FT_j0_grosse.pdf']._data;
        expect(grosse.compressedSize).toBe(COPIES.FT_j0_grosse.length);
        expect(grosse.uncompressedSize).toBe(COPIES.FT_j0_grosse.length);
        const donnees = zip.files['donnees.json']._data;
        expect(donnees.compressedSize).toBeLessThan(donnees.uncompressedSize);
    }, 30000);

    it('un nom hors de l\'ASCII est relu tel quel (drapeau UTF-8)', async () => {
        const codex = monterCodex(creerDb({}), {});
        const textes = new JSZip();
        textes.file('donnees.json', '{}');
        const blob = await codex._assemblerCodexZip(textes, [
            { nom: 'travaux/copie-élève-fictif.pdf', blob: new Blob([octets(1000, 9)]) }
        ]);
        const { empreintes } = await empreintesDuFichier(blob);
        expect(empreintes['travaux/copie-élève-fictif.pdf']).toBe(sha(octets(1000, 9)));
    });

    it('la progression va jusqu\'à 100 et ne recule jamais', async () => {
        const vus = [];
        const { resultat } = await produire({ majProgression: (pct, etape) => { if (etape === 'Compression du ZIP…') vus.push(pct); } });
        expect(resultat.blob.size).toBeGreaterThan(9 * MO);
        expect(vus.length).toBeGreaterThan(3);
        expect([...vus].sort((a, b) => a - b)).toEqual(vus);
        expect(vus[0]).toBe(70);
        expect(vus[vus.length - 1]).toBe(98);
    }, 30000);
});

describe('#988 lot J0 · (c) la Défense K et l\'aperçu voient toujours les copies', () => {

    function espion() {
        const vus = { validation: null, apercu: null };
        const lister = (entrees) => { const noms = []; entrees.forEach((chemin) => noms.push(chemin)); return noms; };
        return {
            vus,
            validation: { validerExportCodex: (entrees) => { vus.validation = lister(entrees); } },
            apercu: { previewZipEtConfirmer: async (entrees) => { vus.apercu = lister(entrees); return true; } }
        };
    }

    it('les deux reçoivent toutes les entrées, dans l\'ordre d\'avant le lot', async () => {
        const e = espion();
        await produire({ validation: e.validation, apercu: e.apercu });
        expect(e.vus.validation).toEqual(NOMS_ATTENDUS);
        expect(e.vus.apercu).toEqual(NOMS_ATTENDUS);
    }, 30000);

    it('la vraie Défense K refuse toujours une copie au nom hors liste, avant toute écriture', async () => {
        const win = {};
        new Function('window', readFileSync(path.join(racine, 'js/securite-export-validation.js'), 'utf8'))(win);
        const base = creerDb({ a2026_fichiersTravaux: [{ id: 'FT_j0/../evasion', nomFichier: 'x.pdf' }] });
        const magasin = creerMagasin({ 'FT_j0/../evasion': new Blob([octets(10, 1)]) });
        const codex = monterCodex(base, { magasin, validation: win.SecuriteExportValidation });
        await expect(codex.generer({})).rejects.toThrow(/Sécurité K.*hors whitelist/s);
    });

    it('TÉMOIN — une liste qui tairait les copies : la Défense K ne les verrait plus', async () => {
        const e = espion();
        await produire({
            validation: e.validation, apercu: e.apercu,
            muter: (s) => s.replace('copies.forEach(function(copie) { rappel(copie.nom, { dir: false }); });', '')
        });
        expect(e.vus.validation).toEqual(['donnees.json', 'travaux/', 'codex-manifeste.json']);
    }, 30000);
});

describe('#988 lot J0 · (d) une copie n\'est lue que par tranches', () => {

    /** Un Blob qui consigne comment on le lit. */
    function classeEspionne(journal) {
        return class BlobEspion extends Blob {
            arrayBuffer() { journal.push({ lecture: 'entier', octets: this.size }); return super.arrayBuffer(); }
            text() { journal.push({ lecture: 'entier', octets: this.size }); return super.text(); }
            stream() { journal.push({ lecture: 'entier', octets: this.size }); return super.stream(); }
            slice(debut, fin) { journal.push({ lecture: 'tranche', octets: Math.min(fin, this.size) - debut }); return super.slice(debut, fin); }
        };
    }

    it('aucune lecture entière ; aucune tranche de plus de 4 Mo ; JSZip ne reçoit aucune copie', async () => {
        const journal = [];
        const Espion = classeEspionne(journal);
        const deposes = [];
        const fileOriginal = JSZip.prototype.file;
        JSZip.prototype.file = function (nom, contenu) {
            if (arguments.length > 1) deposes.push({ nom, estBlob: contenu instanceof Blob });
            return fileOriginal.apply(this, arguments);
        };
        let resultat;
        try {
            ({ resultat } = await produire({ magasin: magasinDuCorpus(Espion) }));
        } finally {
            JSZip.prototype.file = fileOriginal;
        }
        expect(journal.filter((l) => l.lecture === 'entier')).toEqual([]);
        const tranches = journal.filter((l) => l.lecture === 'tranche');
        expect(Math.max(...tranches.map((l) => l.octets))).toBe(4 * MO);
        // La grosse copie (9 Mo et des poussières) : trois tranches.
        expect(tranches.filter((l) => l.octets === 4 * MO)).toHaveLength(2);
        expect(deposes.filter((d) => d.estBlob)).toEqual([]);
        expect(deposes.map((d) => d.nom)).toEqual(['donnees.json', 'codex-manifeste.json']);
        // Et le fichier est juste.
        const { empreintes } = await empreintesDuFichier(resultat.blob);
        expect(empreintes['travaux/FT_j0_grosse.pdf']).toBe(sha(COPIES.FT_j0_grosse));
    }, 30000);

    it('TÉMOIN — une copie lue d\'un seul coup pour son CRC est vue par l\'espion', async () => {
        const journal = [];
        await produire({
            magasin: magasinDuCorpus(classeEspionne(journal)),
            muter: (s) => s.replace('var TRANCHE_CRC_OCTETS = 4 * 1024 * 1024;', 'var TRANCHE_CRC_OCTETS = 64 * 1024 * 1024;')
        });
        const tranches = journal.filter((l) => l.lecture === 'tranche');
        expect(Math.max(...tranches.map((l) => l.octets))).toBe(COPIES.FT_j0_grosse.length);
    }, 30000);

    it('TÉMOIN — des copies reconfiées à JSZip sont vues au dépôt', async () => {
        const deposes = [];
        const fileOriginal = JSZip.prototype.file;
        JSZip.prototype.file = function (nom, contenu) {
            if (arguments.length > 1) deposes.push({ nom, estBlob: contenu instanceof Blob });
            return fileOriginal.apply(this, arguments);
        };
        // Node n'a pas de FileReader, et JSZip en veut un pour lire un Blob : on lui en
        // prête un le temps du témoin (sinon ses promesses rejetées restent sans preneur).
        globalThis.FileReader = class {
            readAsArrayBuffer(blob) { blob.arrayBuffer().then((buf) => { this.result = buf; this.onload({ target: this }); }); }
        };
        try {
            await produire({
                muter: (s) => s.replace('copies.push({ nom: nomEntree, blob: blob });', 'copies.push({ nom: nomEntree, blob: blob }); zip.file(nomEntree, blob);')
            });
        } finally {
            JSZip.prototype.file = fileOriginal;
            delete globalThis.FileReader;
        }
        expect(deposes.filter((d) => d.estBlob).length).toBeGreaterThan(0);
    }, 30000);
});

describe('#988 lot J0 · (e) les bornes du format sont refusées, pas écrites fausses', () => {

    /** Un Blob qui se DIT énorme : la garde doit répondre avant toute lecture. */
    function blobQuiSeDit(taille, journal) {
        return new (class extends Blob {
            get size() { return taille; }
            slice() { journal.push('lu'); return super.slice(0, 0); }
        })([]);
    }

    it('une copie de plus de 4 Go : refus, sans l\'avoir lue', async () => {
        const codex = monterCodex(creerDb({}), {});
        const textes = new JSZip(); textes.file('donnees.json', '{}');
        const journal = [];
        await expect(codex._assemblerCodexZip(textes, [{ nom: 'travaux/FT_j0_enorme.pdf', blob: blobQuiSeDit(0x100000000, journal) }]))
            .rejects.toThrow(/dépasse ce que le format ZIP peut contenir \(4 Go\)/);
        expect(journal).toEqual([]);
    });

    it('un total de plus de 4 Go, aucune copie ne l\'étant seule : refus, sans en avoir lu aucune', async () => {
        const codex = monterCodex(creerDb({}), {});
        const textes = new JSZip(); textes.file('donnees.json', '{}');
        const journal = [];
        const copies = [
            { nom: 'travaux/FT_j0_p.pdf', blob: blobQuiSeDit(0x80000000, journal) },
            { nom: 'travaux/FT_j0_q.pdf', blob: blobQuiSeDit(0x7FFFFF00, journal) }
        ];
        await expect(codex._assemblerCodexZip(textes, copies)).rejects.toThrow(/4 Go/);
        expect(journal).toEqual([]);
    });

    it('plus de 65 535 entrées : refus', async () => {
        const codex = monterCodex(creerDb({}), {});
        const textes = new JSZip(); textes.file('donnees.json', '{}');
        const vide = new Blob([]);
        const copies = Array.from({ length: 65535 }, (_, i) => ({ nom: 'travaux/FT_j0_' + i + '.pdf', blob: vide }));
        await expect(codex._assemblerCodexZip(textes, copies)).rejects.toThrow(/trop de fichiers pour le format ZIP \(65536\)/);
    });

    it('TÉMOIN — sans la garde de taille, la copie énorme serait lue', async () => {
        const codex = monterCodex(creerDb({}), {
            muter: (s) => s.replace('if (tailleFinale > LIMITE_ZIP_OCTETS) {', 'if (false) {')
        });
        const textes = new JSZip(); textes.file('donnees.json', '{}');
        const journal = [];
        await codex._assemblerCodexZip(textes, [{ nom: 'travaux/FT_j0_enorme.pdf', blob: blobQuiSeDit(0x100000000, journal) }]).catch(() => {});
        expect(journal.length).toBeGreaterThan(0);
    });
});
