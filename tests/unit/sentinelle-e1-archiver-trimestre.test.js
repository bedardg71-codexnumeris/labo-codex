import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE D'E1 (#1022) — ARCHIVER UN TRIMESTRE CLOS ENTIER
// =====================================================================
//
// Plan du 4 oct. 2026 (« emprunter et rendre un trimestre », approuvé par Grégoire à 16 h 27),
// consigne de Cowork de 16 h 27, point 2 : l'archive d'un trimestre clos emporte toutes ses clés
// `<trimestre>_*`, les séances vivantes `seancesCompletes_gc_<id>` de ses groupes, tous les
// fichiers de ses copies (corbeille comprise), une empreinte par fichier et une par clé.
// AUCUNE clé globale ni d'un autre trimestre n'entre dans donnees.json. Rien n'est écrit dans
// les données : seule la liste des archives gagne une entrée.
//
// CE QUE CE BANC JUGE, sur un trimestre fictif clos (deux groupes, un doubleur, quatre copies
// dont une à la corbeille, deux séances vivantes) à côté d'un autre trimestre et de clés globales :
//   (a) le contenu exact de l'archive (clés et fichiers), et rien d'un autre trimestre ;
//   (b) chaque empreinte (fichier, clé, donnees.json) égale l'empreinte recalculée ;
//   (c) le manifeste (meta.json) : version, trimestre, date, liste des clés ; « pour mémoire » hors des données ;
//   (d) « Vérifier » la dit intacte, puis abîmée après un octet altéré (copie, puis donnée) ;
//   (e) rien d'écrit dans les données ; refusé hors d'un trimestre clos ;
//   (f) le mode dossier (Chrome) range le même contenu ;
//   (g) les témoins : une clé globale qui entre, une copie de la corbeille oubliée → rouge.
//
// CE QU'IL NE JUGE PAS : la mémoire (WebKit, demande de relecture § 4), le vrai menu ni la vraie
// fenêtre (tests/integration/e1-archiver-trimestre.spec.js). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };
const sha = (u8) => createHash('sha256').update(u8).digest('hex');
const shaTexte = (s) => sha(Buffer.from(s, 'utf8'));

const TRIM = 'h2032';
const DOSSIER = 'h2032-trimestre';
const BASE = 'trimestres/' + DOSSIER + '/';
const CLE_REGISTRE = '_manifesteReserve';

function octets(taille, graine) {
    const u = new Uint8Array(taille);
    let x = (graine * 2654435761) >>> 0;
    for (let i = 0; i < taille; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; u[i] = x & 0xFF; }
    return u;
}

const COPIES = {
    FT_h1: octets(40 * 1024, 1),       // groupe 1
    FT_h2: octets(25 * 1024 + 3, 2),   // groupe 2
    FT_h3: octets(3 * 1024, 3),        // groupe 2, le doubleur
    FT_hc: octets(12 * 1024, 4),       // groupe 1, À LA CORBEILLE
    FT_a1: octets(8 * 1024, 5)         // l'AUTRE trimestre : ne part pas
};
const FICHIERS_ATTENDUS = ['FT_h1.pdf', 'FT_h2.jpg', 'FT_h3.pdf', 'FT_hc.pdf'];

const CORPUS = {
    // Le registre des trimestres : h2032 clos, a2032 en cours.
    trimestres: [{ id: 'h2032', nom: 'Hiver 2032', archive: true }, { id: 'a2032', nom: 'Automne 2032', actif: true }],
    // Clés globales : AUCUNE ne doit entrer dans donnees.json.
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif', trimestreId: 'h2032' }],
    listeCours: [{ id: 'C1', codeCours: '601-101-MQ' }],
    enseignants: [{ id: 'E1', nom: 'Enseignant fictif' }],
    profilEnseignant: { nom: 'Enseignant fictif' },
    registreLongitudinal: { '0000009': { nom: 'Élève fictif Doubleur' } },
    bibliothequeGrilles: [{ id: 'G1' }],
    cartouches_G1: { c: 1 },
    fichiersModelisation: [{ id: 'FM_1' }],
    _codex_etat: { actif: true },
    // Le trimestre clos.
    h2032_groupesCours: [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }],
    h2032_groupeEtudiants: [
        { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
        { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
        { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
    ],
    h2032_evaluationsSauvegardees: [{ id: 'EV1', etudiantDA: '0000001', note: 80 }, { id: 'EV2', etudiantDA: '0000009', note: 55 }],
    h2032_presences: { '0000001': [1], '0000009': [0] },
    h2032_notesRapport: { '0000002': 'Texte fictif — accents, « guillemets » et   séparateur' },
    h2032_productions: [{ id: 'P1', titre: 'Production fictive' }],
    h2032_snapshots_GC_H1: [{ s: 1 }],
    h2032_fichiersTravaux: [
        { id: 'FT_h1', nomFichier: 'copie-une.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1', tailleFichier: COPIES.FT_h1.length },
        { id: 'FT_h2', nomFichier: 'photo.JPG', etudiantDA: '0000002', groupeCoursId: 'GC_H2', tailleFichier: COPIES.FT_h2.length },
        { id: 'FT_h3', nomFichier: 'copie-doubleur.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_H2', tailleFichier: COPIES.FT_h3.length }
    ],
    h2032_corbeilleFichiers: [
        { id: 'FT_hc', nomFichier: 'jetee.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1', tailleFichier: COPIES.FT_hc.length, dateSuppression: '2032-03-01T00:00:00.000Z' }
    ],
    seancesCompletes_gc_GC_H1: [{ id: 'S1' }],
    seancesCompletes_gc_GC_H2: [{ id: 'S2' }],
    // L'autre trimestre, avec le doubleur : rien ne part.
    a2032_groupesCours: [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }],
    a2032_groupeEtudiants: [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }],
    a2032_fichiersTravaux: [{ id: 'FT_a1', nomFichier: 'a.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_A1' }],
    seancesCompletes_gc_GC_A1: [{ id: 'SA' }],
    // Un nom qui commence comme le trimestre sans en être.
    h2032x_bruit: [1]
};
const CLES_ATTENDUES = Object.keys(CORPUS).filter((k) => k.startsWith('h2032_'))
    .concat(['seancesCompletes_gc_GC_H1', 'seancesCompletes_gc_GC_H2']).sort();

function creerDb(initial = CORPUS) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        _map: map,
        get: async (k, def = null) => (map.has(k) ? structuredClone(map.get(k)) : def),
        set: async (k, v) => { map.set(k, v); },
        keys: async () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); }
    };
}

const magasin = () => ({ recupererBlob: async (id) => (COPIES[id] ? new Blob([COPIES[id]]) : null) });

/** Un dossier du disque, en mémoire (mode Chrome) : écrit et relu. */
function fauxDossier(nom) {
    const enfants = new Map();
    const fichiers = new Map();
    const absent = () => Object.assign(new Error('absent'), { name: 'NotFoundError' });
    return {
        name: nom, kind: 'directory', _enfants: enfants, _fichiers: fichiers,
        async getDirectoryHandle(n, o) {
            if (!enfants.has(n)) { if (!o || !o.create) throw absent(); enfants.set(n, fauxDossier(n)); }
            return enfants.get(n);
        },
        async getFileHandle(n, o) {
            if (!fichiers.has(n)) { if (!o || !o.create) throw absent(); fichiers.set(n, new Blob([])); }
            return {
                kind: 'file',
                async createWritable() { let c; return { async write(x) { c = x; }, async close() { fichiers.set(n, c instanceof Blob ? c : new Blob([c])); }, async abort() {} }; },
                async getFile() { return fichiers.get(n); }
            };
        },
        async *entries() { for (const [n] of fichiers) yield [n, await this.getFileHandle(n)]; },
        async queryPermission() { return 'granted'; },
        async requestPermission() { return 'granted'; }
    };
}

/** Monte fichier-sortant, reserve, reserve-verifier, reserve-trimestre. `muter` : { fichier: fn }. */
function monter(db, options = {}) {
    const journal = { notifications: [], fenetres: [], telechargements: [] };
    const adresses = new Map();
    const FauxURL = { createObjectURL(b) { const u = 'blob:banc/' + (adresses.size + 1); adresses.set(u, b); return u; }, revokeObjectURL() {} };
    const fauxSetTimeout = (cb, delai) => ((delai || 0) >= 60000 ? 0 : setTimeout(cb, 0));
    const doc = {
        readyState: 'loading', getElementById: () => null,
        createElement: () => ({ click() { journal.telechargements.push({ nom: this.download, blob: adresses.get(this.href) }); } }),
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    const win = {
        addEventListener: () => {}, dispatchEvent: () => {},
        afficherProgression: () => {}, majProgression: () => {}, masquerProgression: () => {},
        VERSION_MAJEURE: '1.182.0-banc', db, travauxStockage: magasin(),
        uiDialogues: {
            confirmerAction: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message, bouton: o.texteConfirmer }); return options.confirmer !== false; },
            demanderAction: async () => null,
            informer: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message }); }
        },
        JSZip
    };
    if (options.dossier) win.showDirectoryPicker = async () => options.dossier;
    const notifications = {};
    for (const type of ['succes', 'erreur', 'info', 'warning']) notifications[type] = (titre, message) => journal.notifications.push({ type, titre, message });
    monterFichierSortant(win, { document: doc, setTimeout: fauxSetTimeout, URL: FauxURL });
    for (const fichier of ['js/reserve.js', 'js/reserve-verifier.js', 'js/reserve-trimestre.js']) {
        const brut = readFileSync(path.join(racine, fichier), 'utf8');
        const mutation = options.muter && options.muter[fichier];
        const code = mutation ? mutation(brut) : brut;
        if (mutation && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans ' + fichier);
        new Function(
            'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
            'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
            '"use strict";\n' + code
        )(win, doc, consoleSandbox, db, notifications, JSZip, (cb) => setTimeout(cb, 0),
            fauxSetTimeout, { userAgent: 'BacASable/E1 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    }
    return { win, journal, db };
}

/** Archive h2032 en mode fichier ; rend le ZIP, son contenu lu par JSZip (CRC vérifiés) et le banc. */
async function archiver(options = {}) {
    const db = options.db || creerDb();
    const banc = monter(db, options);
    const rendu = await banc.win.ReserveTrimestre.archiverTrimestre(options.trimestre || TRIM);
    const dernier = banc.journal.telechargements[banc.journal.telechargements.length - 1];
    return Object.assign(banc, { rendu, blob: dernier ? dernier.blob : null });
}

async function lire(blob) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer(), { checkCRC32: true });
    const texte = async (n) => zip.file(n).async('string');
    const travaux = {};
    for (const n of Object.keys(zip.files)) {
        if (n.startsWith(BASE + 'travaux/') && !zip.files[n].dir) travaux[n.slice((BASE + 'travaux/').length)] = await zip.file(n).async('uint8array');
    }
    const donneesTexte = await texte(BASE + 'donnees.json');
    return { zip, donneesTexte, donnees: JSON.parse(donneesTexte), meta: JSON.parse(await texte(BASE + 'meta.json')), travaux };
}

/** Ce que l'archive DOIT être (point 2 de la consigne) : la liste de ses écarts, vide si elle est juste. */
function ecarts(a) {
    const e = [];
    const cles = Object.keys(a.donnees).sort();
    for (const k of cles) if (!CLES_ATTENDUES.includes(k)) e.push('clé en trop : ' + k);
    for (const k of CLES_ATTENDUES) if (!cles.includes(k)) e.push('clé absente : ' + k);
    const noms = Object.keys(a.travaux).sort();
    for (const n of noms) if (!FICHIERS_ATTENDUS.includes(n)) e.push('fichier en trop : ' + n);
    for (const n of FICHIERS_ATTENDUS) if (!noms.includes(n)) e.push('fichier absent : ' + n);
    return e;
}

describe('E1 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monter(creerDb(), { muter: { 'js/reserve-trimestre.js': (s) => s.replace('CHAINE_ABSENTE_E1', 'x') } })).toThrow(/Témoin inerte/);
    });
});

describe('E1 · (a) ce que l\'archive d\'un trimestre emporte, exactement', () => {
    it('toutes les clés h2032_*, les deux séances vivantes, les quatre copies (dont la corbeille) ; rien d\'autre', async () => {
        const { rendu, blob } = await archiver();
        expect(rendu).toMatchObject({ succes: true, dossier: DOSSIER, mode: 'zip' });
        const a = await lire(blob);
        expect(ecarts(a)).toEqual([]);
        // Les valeurs entières, sans filtre de groupe ni d'élève (le doubleur, les deux groupes).
        for (const k of CLES_ATTENDUES) expect(a.donnees[k]).toEqual(CORPUS[k]);
        for (const n of FICHIERS_ATTENDUS) expect(sha(a.travaux[n])).toBe(sha(COPIES[n.split('.')[0]]));
    });

    it('aucune clé globale, aucune clé d\'un autre trimestre, aucun préfixe voisin', async () => {
        const a = await lire((await archiver()).blob);
        const cles = Object.keys(a.donnees);
        expect(cles.filter((k) => !k.startsWith('h2032_') && !/^seancesCompletes_gc_GC_H[12]$/.test(k))).toEqual([]);
        for (const g of ['cours', 'listeCours', 'enseignants', 'profilEnseignant', 'trimestres', 'registreLongitudinal',
            'bibliothequeGrilles', 'cartouches_G1', 'fichiersModelisation', '_codex_etat', 'h2032x_bruit', 'seancesCompletes_gc_GC_A1']) {
            expect(cles).not.toContain(g);
        }
        expect(cles.some((k) => k.startsWith('a2032'))).toBe(false);
        expect(Object.keys(a.travaux)).not.toContain('FT_a1.pdf');
    });
});

describe('E1 · (b) chaque empreinte est juste', () => {
    it('par fichier, par clé, et celle de donnees.json', async () => {
        const { meta, donneesTexte, travaux } = await lire((await archiver()).blob);
        const integ = meta.integrite;
        expect(Object.keys(integ.travaux_sha256).sort()).toEqual([...FICHIERS_ATTENDUS].sort());
        for (const n of FICHIERS_ATTENDUS) expect(integ.travaux_sha256[n]).toBe(sha(travaux[n]));
        expect(Object.keys(integ.cles_sha256).sort()).toEqual(CLES_ATTENDUES);
        for (const k of CLES_ATTENDUES) expect(integ.cles_sha256[k]).toBe(shaTexte(JSON.stringify(CORPUS[k])));
        expect(integ.donnees_json_sha256).toBe(shaTexte(donneesTexte));
    });
});

describe('E1 · (c) le manifeste', () => {
    it('meta.json dit la version, le trimestre, la date, la liste des clés, les comptes ; « pour mémoire » vit hors des données', async () => {
        const { meta, donnees } = await lire((await archiver()).blob);
        expect(meta).toMatchObject({
            type_archive: 'trimestre', trimestre: TRIM, nom_trimestre: 'Hiver 2032', dossier: DOSSIER,
            application_version: '1.182.0-banc', mode_archive: 'zip'
        });
        expect(meta.date_archive).toMatch(/^\d{4}-\d\d-\d\dT/);
        expect([...meta.contenu.cles].sort()).toEqual(CLES_ATTENDUES);
        expect(meta.contenu).toMatchObject({
            nombre_etudiants: 3, nombre_groupes: 2, nombre_cles: CLES_ATTENDUES.length,
            nombre_fichiers_travaux: 4, nombre_fichiers_corbeille: 1, nombre_fichiers_manquants: 0,
            seances_vivantes: ['seancesCompletes_gc_GC_H1', 'seancesCompletes_gc_GC_H2']
        });
        expect(meta.pour_memoire.cours).toEqual([{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        expect(meta.pour_memoire.trimestre).toMatchObject({ id: 'h2032', archive: true });
        expect(Object.keys(donnees)).not.toContain('pour_memoire');
    });
});

/** Vérifie un ZIP par le vrai module, l'entrée de la liste en main. */
async function verifier(banc, fichier) {
    const RV = banc.win.ReserveVerifier;
    const entree = banc.win.Reserve.lireManifesteLocal().archives[DOSSIER];
    const rapport = await RV.verifierArchive(RV.sourceFichier(fichier), entree, DOSSIER);
    return { rapport, cr: RV.compteRendu(rapport) };
}

/** Reconstruit le ZIP avec un texte changé (meta.json intact : c'est la même archive). */
async function remplacerTexte(blob, nom, changer) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    zip.file(nom, changer(await zip.file(nom).async('string')));
    return new Blob([await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })]);
}

describe('E1 · (d) « Vérifier » l\'archive d\'un trimestre', () => {
    it('intacte : vérifiée, copies ET clés, couverture du trimestre mesurée (travail et corbeille)', async () => {
        const banc = await archiver();
        const { rapport, cr } = await verifier(banc, banc.blob);
        expect(rapport).toMatchObject({ etat: 'verifiee', trimestreEntier: true, total: 4, verifiees: 4, totalCles: CLES_ATTENDUES.length, clesVerifiees: CLES_ATTENDUES.length, couvertureMesuree: true });
        expect(rapport.nonCouvertes).toEqual([]);
        expect(cr).toEqual({ titre: 'Archive vérifiée', message: 'Les 4 copies et les données du trimestre sont présentes et intactes.' });
    });

    it('un octet altéré dans une copie (la corbeille) : incomplète, « 1 copie altérée »', async () => {
        const banc = await archiver();
        const u8 = new Uint8Array(await banc.blob.arrayBuffer());
        const nom = Buffer.from('travaux/FT_hc.pdf');
        const i = Buffer.from(u8).indexOf(nom) + nom.length + 200; // dans les octets rangés tels quels
        u8[i] ^= 0x01;
        const { rapport, cr } = await verifier(banc, new Blob([u8]));
        expect(rapport.etat).toBe('incomplete');
        expect(rapport.problemes).toEqual([{ nom: 'FT_hc.pdf', type: 'alteree' }]);
        expect(cr.message).toContain('1 copies sur 4 manquent ou ne concordent pas. Archive de nouveau ce trimestre.');
        expect(cr.message).toContain('1 copie altérée');
    });

    it('une donnée altérée : incomplète, « 1 clé altérée » et l\'empreinte des données ne concorde plus', async () => {
        const banc = await archiver();
        const abime = await remplacerTexte(banc.blob, BASE + 'donnees.json', (t) => t.replace('"note":55', '"note":56'));
        const { rapport, cr } = await verifier(banc, abime);
        expect(rapport.etat).toBe('incomplete');
        expect(rapport.clesProblemes).toEqual([{ nom: 'h2032_evaluationsSauvegardees', type: 'alteree' }]);
        expect(rapport.donneesConcordent).toBe(false);
        expect(cr.message).toContain('1 donnée du trimestre altérée');
    });

    it('une clé glissée dans les données : incomplète, « 1 clé en trop »', async () => {
        const banc = await archiver();
        const abime = await remplacerTexte(banc.blob, BASE + 'donnees.json', (t) => t.replace(/^\{/, '{"cours":[],'));
        const { rapport, cr } = await verifier(banc, abime);
        expect(rapport.clesEnTrop).toEqual(['cours']);
        expect(cr.message).toContain('1 donnée en trop dans l\'archive');
    });

    it('une archive de trimestre sans empreintes de clés : à refaire', async () => {
        const banc = await archiver();
        const abime = await remplacerTexte(banc.blob, BASE + 'meta.json', (t) => { const m = JSON.parse(t); delete m.integrite.cles_sha256; return JSON.stringify(m); });
        const { rapport } = await verifier(banc, abime);
        expect(rapport.etat).toBe('a_refaire');
    });

    it('une fiche du trimestre née après l\'archive : non couverte', async () => {
        const banc = await archiver();
        banc.db.setSync('h2032_corbeilleFichiers', CORPUS.h2032_corbeilleFichiers.concat([{ id: 'FT_neuve', groupeCoursId: 'GC_H1' }]));
        const { rapport, cr } = await verifier(banc, banc.blob);
        expect(rapport.nonCouvertes).toEqual(['FT_neuve']);
        expect(cr.message).toContain('1 fiche du trimestre sans copie dans l\'archive');
    });

    it('l\'archive d\'un groupe se vérifie comme avant (mots du lot A2)', async () => {
        const banc = monter(creerDb());
        const RV = banc.win.ReserveVerifier;
        expect(RV.MOTS.reussite.texte(3)).toBe('Les 3 copies sont présentes et intactes, et les données concordent.');
        expect(RV.compteRendu({ etat: 'verifiee', total: 3, trimestreEntier: false }).message).toBe('Les 3 copies sont présentes et intactes, et les données concordent.');
    });
});

describe('E1 · (e) rien n\'est écrit dans les données ; refusé hors d\'un trimestre clos', () => {
    it('après l\'archive, chaque clé est identique, et seule la liste des archives gagne une entrée', async () => {
        const banc = await archiver();
        const apres = Object.fromEntries(banc.db._map);
        const cleListe = apres[CLE_REGISTRE];
        delete apres[CLE_REGISTRE];
        expect(apres).toEqual(CORPUS);
        expect(Object.keys(cleListe.archives)).toEqual([DOSSIER]);
        expect(cleListe.archives[DOSSIER]).toMatchObject({ type_archive: 'trimestre', trimestre: TRIM, nombre_fichiers_travaux: 4 });
    });

    it('le message de fin dit « étudiant·es » (mots acceptés par Grégoire le 4 oct.)', async () => {
        const banc = await archiver();
        expect(banc.journal.notifications.filter((n) => n.type === 'succes')).toEqual([
            { type: 'succes', titre: 'Trimestre archivé : fichier téléchargé', message: expect.stringMatching(/^3 étudiant·es, 4 copie\(s\) \(.+\)$/) }
        ]);
    });

    it('un trimestre en cours : refusé, rien téléchargé, rien inscrit', async () => {
        const banc = await archiver({ trimestre: 'a2032' });
        expect(banc.rendu).toMatchObject({ succes: false });
        expect(banc.journal.telechargements).toEqual([]);
        expect(banc.db.getSync(CLE_REGISTRE, null)).toBeNull();
        expect(banc.journal.notifications).toEqual([{ type: 'erreur', titre: 'Trimestre non archivé', message: 'Seul un trimestre clos peut être archivé. Clos-le d\'abord.' }]);
    });

    it('la confirmation dit ce qui part ; annulée, rien n\'est fait', async () => {
        const banc = await archiver({ confirmer: false });
        expect(banc.rendu).toBeNull();
        expect(banc.journal.telechargements).toEqual([]);
        expect(banc.journal.fenetres[0]).toEqual({
            titre: 'Archiver Hiver 2032 ?',
            message: 'L\'archive emporte tout le trimestre : 3 étudiant·es, 2 groupes, 4 copies (dont 1 à la corbeille), environ 81,9 Ko.\nRien n\'est retiré de l\'application : le trimestre reste là, clos.',
            bouton: 'Archiver'
        });
    });
});

describe('E1 · (f) le mode dossier (Chrome) range le même contenu', () => {
    it('trimestres/h2032-trimestre/ : donnees.json, meta.json, les quatre copies ; « Vérifier » par le dossier la dit intacte', async () => {
        const dossier = fauxDossier('Archives_LaboCodex');
        const banc = await archiver({ dossier });
        expect(banc.rendu).toMatchObject({ succes: true, mode: 'fsapi' });
        const d = dossier._enfants.get('trimestres')._enfants.get(DOSSIER);
        const donnees = JSON.parse(await d._fichiers.get('donnees.json').text());
        const travaux = {};
        for (const [n, b] of d._enfants.get('travaux')._fichiers) travaux[n] = new Uint8Array(await b.arrayBuffer());
        expect(ecarts({ donnees, travaux })).toEqual([]);
        const RV = banc.win.ReserveVerifier;
        const entree = banc.win.Reserve.lireManifesteLocal().archives[DOSSIER];
        const rapport = await RV.verifierArchive(RV.sourceDossier(dossier, DOSSIER), entree, DOSSIER);
        expect(rapport.etat).toBe('verifiee');
    });
});

describe('E1 · (g) témoins : le banc rougit quand l\'archive ment', () => {
    it('une clé globale qui entre (« cours ») : écart', async () => {
        const banc = await archiver({ muter: { 'js/reserve-trimestre.js': (s) => s.replace("cles = cles.concat(seances).sort();", "cles = cles.concat(seances).concat(['cours']).sort();") } });
        expect(ecarts(await lire(banc.blob))).toEqual(['clé en trop : cours']);
    });

    it('une copie de la corbeille oubliée : écart, et « Vérifier » dit la fiche non couverte', async () => {
        const banc = await archiver({ muter: { 'js/reserve-trimestre.js': (s) => s.replace(
            "    ['fichiersTravaux', 'corbeilleFichiers'].forEach(function(liste) {\n        var v = donnees[trimestre + '_' + liste];",
            "    ['fichiersTravaux'].forEach(function(liste) {\n        var v = donnees[trimestre + '_' + liste];") } });
        expect(ecarts(await lire(banc.blob))).toEqual(['fichier absent : FT_hc.pdf']);
        const { rapport } = await verifier(banc, banc.blob);
        expect(rapport.etat).toBe('incomplete');
        expect(rapport.nonCouvertes).toEqual(['FT_hc']);
    });

    it('une séance vivante oubliée : écart', async () => {
        const banc = await archiver({ muter: { 'js/reserve-trimestre.js': (s) => s.replace("cles = cles.concat(seances).sort();", 'cles = cles.sort();') } });
        expect(ecarts(await lire(banc.blob))).toEqual(['clé absente : seancesCompletes_gc_GC_H1', 'clé absente : seancesCompletes_gc_GC_H2']);
    });

    it('la vérification qui ne compare plus les clés : la donnée altérée passerait', async () => {
        const banc0 = await archiver();
        const abime = await remplacerTexte(banc0.blob, BASE + 'donnees.json', (t) => t.replace('"note":55', '"note":56'));
        const banc = monter(banc0.db, { muter: { 'js/reserve-verifier.js': (s) => s.replace(
            "else rapport.clesProblemes.push({ nom: cle, type: 'alteree' });", 'else rapport.clesVerifiees++;') } });
        const RV = banc.win.ReserveVerifier;
        const entree = banc.win.Reserve.lireManifesteLocal().archives[DOSSIER];
        const rapport = await RV.verifierArchive(RV.sourceFichier(abime), entree, DOSSIER);
        expect(rapport.clesProblemes).toEqual([]); // le témoin : sans la comparaison, rien ne le dit
    });
});

describe('#1006 · les trois boutons « Exporter les données » sont retirés, avec leur fonction (4 oct. 2026)', () => {
    // Mesuré le 4 oct. : la liste qui les portait n'avait pas de conteneur dans la page. E1 fait ce
    // que ce fichier promettait. Un retour de l'un de ces noms rougit ici.
    const fichiers = ['index.html', 'js/trimestres.js', 'js/trimestre-v2-liste.js', 'js/trimestre-v2-init.js'];
    it.each(['exporterTrimestreArchive', 'afficherListeTrimestreGestion', 'listeTrimestreGestion', 'afficherTrimestreCibleExport', 'archive-trimestre'])('« %s » n\'apparaît plus', (nom) => {
        for (const f of fichiers) expect(readFileSync(path.join(racine, f), 'utf8')).not.toContain(nom);
    });
});
