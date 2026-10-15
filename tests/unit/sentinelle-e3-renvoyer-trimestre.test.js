import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE D'E3 (#1024) — RENVOYER UN TRIMESTRE AUX ARCHIVES
// =====================================================================
//
// Consigne de Cowork du 5 oct. 2026 (4 h 36), décisions 1 à 6 et point 4 de « ce que tu fais ».
// Un espace fictif : un trimestre clos (h2032 : deux groupes, un doubleur, quatre copies dont une
// à la corbeille, deux séances vivantes, des vignettes), un trimestre en cours (a2032, avec le
// même doubleur) et des réglages, plus deux clés globales qui PORTENT l'id du trimestre sans
// son préfixe (`snapshot_h2032_…`, `tableCorrespondance_h2032` : l'archive ne les garde pas).
//
// CE QUE CE BANC JUGE :
//   (a) l'aller-retour : archiver, vérifier, RENVOYER, faire évoluer l'espace, FAIRE REVENIR →
//       toutes les clés et tous les fichiers du trimestre égaux à l'avant-renvoi, et rien d'autre
//       n'a changé à aucune étape (hors du registre `trimestres`) ;
//   (b) l'ordre : registre d'abord, fichiers et vignettes, séances, clés EN DERNIER ;
//   (c) le cas « consulté » : une clé changée et une née depuis → refus, rien retiré ; archiver
//       de nouveau, vérifier, renvoyer → passe ; l'aller-retour suivant rend la version consultée ;
//   (d) les refus (décision 1, l'archive) et les différences de copies : rien retiré ;
//   (e) un arrêt provoqué au milieu, puis la reprise ; et « Faire revenir » depuis ce qui reste ;
//   (f) le mode dossier (décision 3) : ré-archiver met de côté la copie de l'archive précédente ;
//   (g) les témoins : une clé globale retirée, une copie retirée que l'archive n'a pas, la
//       comparaison neutralisée → rouge.
//
// CE QU'IL NE JUGE PAS : le vrai menu, la vraie fenêtre, la vraie `db`, la largeur d'iPad, la
// mémoire (tests/integration/e3-renvoyer-trimestre.spec.js). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };

const TRIM = 'h2032';
const DOSSIER = 'h2032-trimestre';
const MODULE = 'js/reserve-renvoyer.js';

function octets(taille, graine) {
    const u = new Uint8Array(taille);
    let x = (graine * 2654435761) >>> 0;
    for (let i = 0; i < taille; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; u[i] = x & 0xFF; }
    return u;
}

const COPIES = {
    FT_h1: octets(40 * 1024, 1),
    FT_h2: octets(25 * 1024 + 3, 2),
    FT_h3: octets(3 * 1024, 3),
    FT_hc: octets(12 * 1024, 4),   // à la corbeille
    FT_a1: octets(8 * 1024, 5)     // l'autre trimestre
};
const COPIES_H = ['FT_h1', 'FT_h2', 'FT_h3', 'FT_hc'];

const CORPUS = {
    trimestres: [{ id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' }, { id: 'a2032', nom: 'Automne 2032', actif: true }],
    trimestreActif: 'a2032',
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif', trimestreId: 'h2032' }],
    infoCours: { coursId: 'C1' },
    profilEnseignant: { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' },
    registreLongitudinal: { '0000009': { nom: 'Élève fictif Doubleur', trimestres: ['h2032', 'a2032'] } },
    groupeCoursActif: { id: 'GC_A1', trimestreId: 'a2032' },
    seancesCompletes_C1: [{ id: 'SC' }],
    snapshot_h2032_1900000000000: { sauvegarde: true },
    tableCorrespondance_h2032: { '0000001': 'A' },
    h2032_groupesCours: [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }],
    h2032_groupeEtudiants: [
        { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
        { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
        { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
    ],
    h2032_evaluationsSauvegardees: [{ id: 'EV1', etudiantDA: '0000001', note: 80 }, { id: 'EV2', etudiantDA: '0000009', note: 55 }],
    h2032_productions: [{ id: 'P1', titre: 'Production fictive', coursId: 'C1' }],
    h2032_notesRapport: { '0000002': 'Texte fictif — accents, « guillemets »' },
    h2032_fichiersTravaux: [
        { id: 'FT_h1', nomFichier: 'copie-une.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1', tailleFichier: COPIES.FT_h1.length, typeMIME: 'application/pdf' },
        { id: 'FT_h2', nomFichier: 'photo.JPG', etudiantDA: '0000002', groupeCoursId: 'GC_H2', tailleFichier: COPIES.FT_h2.length, typeMIME: 'image/jpeg' },
        { id: 'FT_h3', nomFichier: 'copie-doubleur.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_H2', tailleFichier: COPIES.FT_h3.length }
    ],
    h2032_corbeilleFichiers: [
        { id: 'FT_hc', nomFichier: 'jetee.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1', tailleFichier: COPIES.FT_hc.length }
    ],
    seancesCompletes_gc_GC_H1: [{ id: 'S1' }],
    seancesCompletes_gc_GC_H2: [{ id: 'S2' }],
    thumbnail_FT_h1: 'data:image/png;base64,AAAA',
    thumbnail_FT_hc: 'data:image/png;base64,BBBB',
    thumbnail_FT_a1: 'data:image/png;base64,CCCC',
    a2032_groupesCours: [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }],
    a2032_groupeEtudiants: [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }],
    a2032_fichiersTravaux: [{ id: 'FT_a1', nomFichier: 'a.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_A1' }],
    seancesCompletes_gc_GC_A1: [{ id: 'SA' }],
    h2032x_bruit: [1]
};
const CLES_H = Object.keys(CORPUS).filter((k) => k.startsWith('h2032_'));
const SEANCES_H = ['seancesCompletes_gc_GC_H1', 'seancesCompletes_gc_GC_H2'];
const VIGNETTES_H = ['thumbnail_FT_h1', 'thumbnail_FT_hc'];

/** Une `db` en mémoire, qui consigne l'ordre de ses écritures. `echouer(op, cle)` : refusée. */
function creerDb(initial = CORPUS) {
    const map = new Map(Object.entries(structuredClone(initial)));
    const journal = [];
    const db = {
        _map: map, journal, echouer: null,
        get: async (k, def = null) => (map.has(k) ? structuredClone(map.get(k)) : def),
        set: async (k, v) => {
            if (db.echouer && db.echouer('set', k)) throw Object.assign(new Error('QuotaExceededError (banc)'), { name: 'QuotaExceededError' });
            journal.push('set:' + k); map.set(k, structuredClone(v));
        },
        remove: async (k) => {
            if (db.echouer && db.echouer('remove', k)) throw new Error('retrait refusé (banc)');
            journal.push('remove:' + k); map.delete(k); db.cacheMemoire.delete(k);
        },
        keys: async () => [...map.keys()],
        keysSync: () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : (db.cacheMemoire.has(k) ? db.cacheMemoire.get(k) : def)),
        setSync: (k, v) => { map.set(k, v); },
        // Le cache mémoire de la vraie `db` : `remove` le vide depuis #845 (db.js).
        cacheMemoire: new Map(),
        removeSync: (k) => { db.cacheMemoire.delete(k); map.delete(k); },
        flush: async () => {}
    };
    // #522 lot 7 : le contrat de la vraie `db.modifier` (lire, muter, écrire si défini), par le get
    // et le set de ce faux : le journal et les refus simulés voient l'écriture comme avant.
    db.modifier = async (k, mutateur, def = null) => {
        const r = await mutateur(await db.get(k, def));
        if (r === undefined) return undefined;
        await db.set(k, r);
        return r;
    };
    return db;
}

function creerMagasin(db, initial = COPIES) {
    const blobs = new Map(Object.entries(initial).map(([id, u8]) => [id, new Blob([u8])]));
    return {
        _blobs: blobs,
        echouer: null,
        recupererBlob: async (id) => blobs.get(id) || null,
        async stockerBlob(id, blob) { db.journal.push('copie:' + id); blobs.set(id, blob); },
        async supprimerBlob(id) {
            if (this.echouer && this.echouer(id)) throw new Error('retrait de copie refusé (banc)');
            db.journal.push('retrait-copie:' + id); blobs.delete(id);
        },
        async supprimerThumbnail(id) { await db.remove('thumbnail_' + id); }  // comme la vraie : db.remove
    };
}

/** Un dossier du disque, en mémoire (mode Chrome), avec retrait d'une entrée. */
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
                kind: 'file', name: n,
                async createWritable() { let c; return { async write(x) { c = x; }, async close() { fichiers.set(n, c instanceof Blob ? c : new Blob([c])); }, async abort() {} }; },
                async getFile() { return fichiers.get(n); }
            };
        },
        async removeEntry(n) { if (!fichiers.delete(n)) throw absent(); },
        async *entries() { for (const [n] of [...fichiers]) yield [n, await this.getFileHandle(n)]; },
        async queryPermission() { return 'granted'; },
        async requestPermission() { return 'granted'; }
    };
}

function monter(db, magasin, options = {}) {
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
        VERSION_MAJEURE: '1.184.0-banc', db, travauxStockage: magasin,
        dasElevesEcartes: () => new Set(),
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
    for (const fichier of ['js/reserve.js', 'js/reserve-verifier.js', 'js/reserve-trimestre.js', 'js/reserve-emprunter.js', MODULE]) {
        const brut = readFileSync(path.join(racine, fichier), 'utf8');
        const mutation = options.muter && options.muter[fichier];
        const code = mutation ? mutation(brut) : brut;
        if (mutation && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans ' + fichier);
        new Function(
            'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
            'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
            '"use strict";\n' + code
        )(win, doc, consoleSandbox, db, notifications, JSZip, (cb) => setTimeout(cb, 0),
            fauxSetTimeout, { userAgent: 'BacASable/E3 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    }
    return { win, journal, db, magasin };
}

/** Archive h2032 (mode fichier), le vérifie, retient la vérification ; rend le ZIP. */
async function archiverEtVerifier(banc, sansFichier) {
    await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
    const zip = banc.journal.telechargements.at(-1).blob;
    const RV = banc.win.ReserveVerifier;
    const rapport = await RV.verifierArchive(RV.sourceFichier(zip), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
    // #1027 (corrigée dans ce lot) : une fiche sans fichier à l'archivage, déclarée par
    // `nombre_fichiers_manquants`, n'est plus « non couverte » ; l'archive est vérifiée d'elle-même.
    if (sansFichier) expect(rapport.manquantesALArchivage).toEqual(['FT_h3']);
    expect(rapport.nonCouvertes).toEqual([]);
    expect(rapport.etat).toBe('verifiee');
    RV.retenirResultat(DOSSIER, rapport);
    banc.zip = zip;
    return zip;
}

async function preparer(o = {}) {
    const db = o.db || creerDb(o.corpus);
    const magasin = creerMagasin(db, o.copies);
    const banc = monter(db, magasin, { muter: o.muter });
    await archiverEtVerifier(banc, o.sansFichier);
    db.journal.length = 0;
    return banc;
}

async function photo(banc) {
    const cles = {};
    for (const [k, v] of banc.db._map) cles[k] = JSON.stringify(v);
    const copies = {};
    for (const [id, b] of banc.magasin._blobs) copies[id] = Buffer.from(await b.arrayBuffer()).toString('base64');
    return { cles, copies };
}

function sansTrimestre(p) {
    const cles = {};
    for (const k of Object.keys(p.cles)) if (!k.startsWith('h2032_') && !SEANCES_H.includes(k) && !VIGNETTES_H.includes(k) && k !== 'trimestres') cles[k] = p.cles[k];
    const copies = {};
    for (const id of Object.keys(p.copies)) if (!COPIES_H.includes(id)) copies[id] = p.copies[id];
    return { cles, copies };
}

async function renvoyer(banc, fichier = banc.zip) {
    return banc.win.ReserveRenvoyer.renvoyer(banc.win.ReserveVerifier.sourceFichier(fichier), TRIM);
}

async function faireRevenir(banc, fichier = banc.zip) {
    const entree = Object.assign({ dossier: DOSSIER }, banc.win.Reserve.lireManifesteLocal().archives[DOSSIER]);
    return banc.win.ReserveEmprunter.emprunter(banc.win.ReserveVerifier.sourceFichier(fichier), entree);
}

async function sansCopie(blob, id) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    for (const n of Object.keys(zip.files)) if (n.includes('/travaux/' + id + '.')) zip.remove(n);
    return new Blob([await zip.generateAsync({ type: 'uint8array' })]);
}

describe('E3 · le banc est sain', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        const db = creerDb();
        expect(() => monter(db, creerMagasin(db), { muter: { [MODULE]: (s) => s } })).toThrow(/Témoin inerte/);
    });
});

describe('E3 · (a) l\'aller-retour : renvoyer, faire évoluer l\'espace, faire revenir', () => {
    it('le trimestre part entier (clés, séances, copies, vignettes, registre) ; rien d\'autre ne bouge ; il revient égal à l\'avant-renvoi', async () => {
        const banc = await preparer();
        const avantRenvoi = await photo(banc);

        const r = await renvoyer(banc);
        expect(r.comparaison.etat).toBe('identique');
        expect(r.bilan).toMatchObject({ etat: 'fait', copies: 4, cles: CLES_H.length + SEANCES_H.length });
        const apresRenvoi = await photo(banc);
        expect(Object.keys(apresRenvoi.cles).filter((k) => k.startsWith('h2032_'))).toEqual([]);
        for (const k of SEANCES_H.concat(VIGNETTES_H)) expect(apresRenvoi.cles[k]).toBeUndefined();
        for (const id of COPIES_H) expect(apresRenvoi.copies[id]).toBeUndefined();
        expect(JSON.parse(apresRenvoi.cles.trimestres)).toEqual([CORPUS.trimestres[1]]);
        // Rien d'autre : toutes les clés globales (y compris celles qui portent l'id du trimestre
        // sans son préfixe, que l'archive ne garde pas) et la copie de l'autre trimestre.
        expect(sansTrimestre(apresRenvoi)).toEqual(sansTrimestre(avantRenvoi));
        expect(apresRenvoi.cles.snapshot_h2032_1900000000000).toBeDefined();
        expect(apresRenvoi.cles.tableCorrespondance_h2032).toBeDefined();
        expect(apresRenvoi.cles.thumbnail_FT_a1).toBeDefined();

        // L'espace évolue.
        banc.db._map.get('a2032_groupeEtudiants').push({ da: '0000077', nom: 'Élève fictive Nouvelle', groupe: '1' });
        banc.db._map.set('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'apres@exemple.test' });
        const avantRetour = await photo(banc);

        const bilan = await faireRevenir(banc);
        expect(bilan.etat).toBe('fait');
        const apresRetour = await photo(banc);
        for (const k of CLES_H.concat(SEANCES_H)) expect([k, apresRetour.cles[k]]).toEqual([k, avantRenvoi.cles[k]]);
        for (const id of COPIES_H) expect([id, apresRetour.copies[id]]).toEqual([id, avantRenvoi.copies[id]]);
        expect(JSON.parse(apresRetour.cles.trimestres)).toEqual([CORPUS.trimestres[1], { id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' }]);
        expect(sansTrimestre(apresRetour)).toEqual(sansTrimestre(avantRetour));
    });

    it('le compte rendu, la fenêtre : nom, étudiant·es, copies, taille, dates ; le bilan dit comment le faire revenir', async () => {
        const banc = await preparer();
        const res = await banc.win.ReserveRenvoyer.comparer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        const f = banc.win.ReserveRenvoyer.fenetreIdentique(res);
        expect(f.titre).toBe('Renvoyer Hiver 2032 aux archives ?');
        const jour = new Date(banc.win.Reserve.lireManifesteLocal().archives[DOSSIER].verification.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
        expect(f.message).toBe('Hiver 2032 quittera l\'application : 3 étudiant·es, 4 copies, environ 81,9 Ko.\n' +
            'Son archive, vérifiée le ' + jour + ', le garde tel quel : « Faire revenir » le ramènera.\n' +
            'Garde bien cette archive : c\'est elle qui le conserve.\n' +
            'Les autres trimestres, les cours et les réglages ne sont pas touchés.');
        expect(f.texteConfirmer).toBe('Renvoyer aux archives');
        const bilan = await banc.win.ReserveRenvoyer.retirer(res);
        const cr = banc.win.ReserveRenvoyer.compteRendu(res, bilan);
        expect(cr).toEqual({
            titre: 'Hiver 2032 est renvoyé aux archives',
            message: 'Il n\'est plus dans l\'application ; son archive le garde.\n' +
                'Pour le faire revenir : Réglages › Données › Archives, « Faire revenir ».\n' +
                '4 copies retirées. Ton prochain codex sera plus léger d\'environ 81,9 Ko.'
        });
    });
});

describe('E3 · les mots tranchés par Grégoire (5 oct.)', () => {
    it('« Terminer le renvoi », jamais « finir de renvoyer », dans un texte que l\'usager lit ; la fenêtre de reprise', () => {
        const db = creerDb();
        const RR = monter(db, creerMagasin(db)).win.ReserveRenvoyer;
        const textes = [RR.MOTS.reprise.bouton, RR.MOTS.reprise.infobulle, RR.MOTS.reprise.titre('Hiver 2032'),
            RR.MOTS.reprise.texte({ nom: 'Hiver 2032' }), RR.MOTS.interrompu.texte({ nom: 'Hiver 2032' })];
        for (const t of textes) expect(t.toLowerCase()).not.toContain('finir de renvoyer');
        expect(RR.MOTS.reprise.titre('Hiver 2032')).toBe('Terminer le renvoi de Hiver 2032 ?');
        expect(RR.MOTS.reprise.texte({ nom: 'Hiver 2032' })).toBe('Une partie de Hiver 2032 est restée dans l\'application, identique à son archive. Elle sera retirée ; l\'archive garde tout.');
        expect(RR.MOTS.refus.sansEmpreintes).toBe('Cette archive est trop ancienne pour un renvoi. Archive le trimestre de nouveau.');
    });

    // #993 (15 oct. 2026) : la fonction unique est TailleFichier.dire (taille-fichier.js), pour
    // toute l'application ; ici, en base 1000 (Node ne se dit pas Windows).
    it('la virgule décimale, une seule fonction pour tout l\'écran des archives', () => {
        const db = creerDb();
        const banc = monter(db, creerMagasin(db));
        const T = banc.win.TailleFichier;
        expect(T.dire(1.08e9)).toBe('1,08 Go');
        expect(T.dire(80000)).toBe('80,0 Ko');
        expect(T.dire(512)).toBe('512 o');
        expect(banc.win.Reserve.formaterTaille).toBeUndefined();
        for (const f of ['js/reserve.js', 'js/reserve-trimestre.js', 'js/reserve-verifier.js', 'js/reserve-reglages.js', 'js/reserve-renvoyer.js']) {
            expect([f, /toFixed\(/.test(readFileSync(path.join(racine, f), 'utf8'))]).toEqual([f, false]);
        }
    });
});

describe('E3 · (a bis) le cache mémoire de la vraie `db`', () => {
    it('une clé tenue par le cache mémoire (trop grosse pour localStorage) part quand même ; le renvoi n\'est pas dit inachevé', async () => {
        const banc = await preparer();
        // Mesuré le 5 oct. (394 copies) : `db.remove` laissait la clé au cache mémoire (#845).
        for (const k of ['h2032_fichiersTravaux', 'thumbnail_FT_h1']) banc.db.cacheMemoire.set(k, banc.db._map.get(k));
        const r = await renvoyer(banc);
        expect(r.bilan.etat).toBe('fait');
        expect(banc.db.getSync('h2032_fichiersTravaux')).toBe(null);
        expect(banc.db.getSync('thumbnail_FT_h1')).toBe(null);
        expect(banc.win.ReserveRenvoyer.estInacheve(TRIM)).toBe(false);
    });
});

describe('E3 · (b) l\'ordre du retrait', () => {
    it('registre d\'abord ; fichiers et vignettes ; séances ; clés du trimestre EN DERNIER ; aucune écriture hors de ces retraits', async () => {
        const banc = await preparer();
        await renvoyer(banc);
        const j = banc.db.journal;
        expect(j[0]).toBe('set:trimestres');
        expect(j.filter((x) => x.startsWith('set:'))).toEqual(['set:trimestres']);
        const derniereCopie = j.map((x) => x.startsWith('retrait-copie:')).lastIndexOf(true);
        const premiereSeance = j.findIndex((x) => x.startsWith('remove:seancesCompletes_gc_'));
        const premiereCle = j.findIndex((x) => x.startsWith('remove:h2032_'));
        expect(derniereCopie).toBeLessThan(premiereSeance);
        expect(premiereSeance).toBeLessThan(premiereCle);
        expect(j.slice(premiereCle).every((x) => x.startsWith('remove:h2032_'))).toBe(true);
        // Une vignette passe deux fois (le cache de travauxStockage, puis la clé) : dédoublonné.
        const retirees = [...new Set(j.filter((x) => x.startsWith('remove:')).map((x) => x.slice(7)))].sort();
        expect(retirees).toEqual(CLES_H.concat(SEANCES_H, VIGNETTES_H).sort());
    });
});

describe('E3 · (c) le cas « consulté »', () => {
    it('revenu, activé (une clé changée, une née) : refus, rien retiré ; archivé de nouveau et vérifié : passe ; le retour suivant rend la version consultée', async () => {
        const banc = await preparer();
        expect((await renvoyer(banc)).bilan.etat).toBe('fait');
        expect((await faireRevenir(banc)).etat).toBe('fait');
        // Ce que l'activation écrit (mesure d'E2, point 8) : une clé changée, une clé née.
        banc.db._map.set('h2032_productions', [{ id: 'P1', titre: 'Production fictive', coursId: 'C1', indices: { c: 70 } }]);
        banc.db._map.set('h2032_interventions', []);
        banc.db.journal.length = 0;
        const avant = await photo(banc);

        const r = await renvoyer(banc);
        expect(r.comparaison.etat).toBe('different');
        expect(r.bilan).toBe(null);
        expect(await photo(banc)).toEqual(avant);
        expect(banc.db.journal).toEqual([]);
        const cr = banc.win.ReserveRenvoyer.compteRendu(r.comparaison);
        expect(cr.titre).toBe('Hiver 2032 a changé depuis son archive');
        const jourArchive = new Date(r.comparaison.entree.date_archive).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
        expect(cr.message).toBe('Rien n\'a été retiré.\n' +
            'Depuis son archive du ' + jourArchive + ' : 1 donnée modifiée, 1 donnée ajoutée.\n' +
            'C\'est normal si tu l\'as consulté : l\'application recalcule certaines données à l\'ouverture.\n' +
            'Pour le renvoyer : archive-le de nouveau, vérifie la nouvelle archive, puis renvoie-le.');

        await archiverEtVerifier(banc);
        const consulte = await photo(banc);
        expect((await renvoyer(banc)).bilan.etat).toBe('fait');
        expect((await faireRevenir(banc)).etat).toBe('fait');
        const ensuite = await photo(banc);
        expect(ensuite.cles.h2032_productions).toBe(consulte.cles.h2032_productions);
        expect(ensuite.cles.h2032_interventions).toBe('[]');
    });

    it('la fenêtre « différent » propose d\'archiver de nouveau, et le bouton lance l\'archive', async () => {
        const banc = await preparer();
        banc.db._map.set('h2032_interventions', []);
        let archive = null;
        banc.win.ReserveTrimestre.actionArchiver = (t) => { archive = t; };
        await banc.win.ReserveRenvoyer.executer(TRIM, banc.win.ReserveVerifier.sourceFichier(banc.zip));
        expect(banc.journal.fenetres.at(-1).bouton).toBe('Archiver de nouveau');
        expect(archive).toBe(TRIM);
    });
});

describe('E3 · (d) les refus : rien retiré', () => {
    async function refuse(banc, motif, fichier) {
        const avant = await photo(banc);
        const r = await renvoyer(banc, fichier);
        expect(r.comparaison).toMatchObject({ etat: 'refus', motif });
        expect(await photo(banc)).toEqual(avant);
        expect(banc.db.journal).toEqual([]);
        return r;
    }

    it('le trimestre actif', async () => {
        const banc = await preparer();
        banc.db._map.set('trimestreActif', 'h2032');
        await refuse(banc, 'actif');
    });
    it('un trimestre en cours (non clos)', async () => {
        const banc = await preparer();
        banc.db._map.get('trimestres')[0].archive = false;
        await refuse(banc, 'pasClos');
        expect(banc.win.ReserveRenvoyer.refusImmediat('a2032')).toBe('pasClos');
    });
    it('sans archive à la liste', async () => {
        const db = creerDb();
        const banc = monter(db, creerMagasin(db));
        expect(banc.win.ReserveRenvoyer.refusImmediat(TRIM)).toBe('sansArchive');
    });
    it('une archive non vérifiée', async () => {
        const banc = await preparer();
        const m = banc.win.Reserve.lireManifesteLocal();
        banc.win.Reserve.upsertEntreeManifeste(DOSSIER, Object.assign({}, m.archives[DOSSIER], { verification: undefined }));
        await refuse(banc, 'nonVerifiee');
    });
    it('meta.json changé depuis la vérification', async () => {
        const banc = await preparer();
        const zip = await JSZip.loadAsync(await banc.zip.arrayBuffer());
        const n = 'trimestres/' + DOSSIER + '/meta.json';
        zip.file(n, (await zip.file(n).async('string')).replace('"notes"', '"notes_"'));
        await refuse(banc, 'changeeDepuis', new Blob([await zip.generateAsync({ type: 'uint8array' })]));
    });
    it('une copie promise par l\'archive en est absente', async () => {
        const banc = await preparer();
        const r = await refuse(banc, 'copiesAbsentes', await sansCopie(banc.zip, 'FT_h2'));
        expect(banc.win.ReserveRenvoyer.compteRendu(r.comparaison).message).toBe('Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n\'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau.');
    });
    it('une copie différente de l\'archive : différence, rien retiré', async () => {
        const banc = await preparer();
        banc.magasin._blobs.set('FT_h3', new Blob([octets(3 * 1024, 99)]));
        const avant = await photo(banc);
        const r = await renvoyer(banc);
        expect(r.comparaison.differences).toEqual([{ type: 'copieDifferente', id: 'FT_h3' }]);
        expect(await photo(banc)).toEqual(avant);
    });
    it('une copie que l\'archive n\'a pas (sa fiche y était, le fichier manquait) : différence, rien retiré', async () => {
        const copies = Object.assign({}, COPIES);
        delete copies.FT_h3;
        const banc = await preparer({ copies, sansFichier: true });
        banc.magasin._blobs.set('FT_h3', new Blob([COPIES.FT_h3]));
        const avant = await photo(banc);
        const r = await renvoyer(banc);
        expect(r.comparaison.differences).toEqual([{ type: 'copieAbsente', id: 'FT_h3' }]);
        expect(await photo(banc)).toEqual(avant);
        expect(banc.win.ReserveRenvoyer.compteRendu(r.comparaison).message).toContain(' : 1 copie ajoutée.');
    });
    it('une clé née entre la comparaison et le retrait : rien retiré', async () => {
        const banc = await preparer();
        const res = await banc.win.ReserveRenvoyer.comparer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        banc.db._map.set('h2032_presences', {});
        const avant = await photo(banc);
        expect((await banc.win.ReserveRenvoyer.retirer(res)).etat).toBe('different');
        expect(await photo(banc)).toEqual(avant);
    });
    it('une clé changée entre la comparaison et le retrait : rien retiré', async () => {
        const banc = await preparer();
        const res = await banc.win.ReserveRenvoyer.comparer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        banc.db._map.set('h2032_notesRapport', { '0000002': 'changé' });
        const avant = await photo(banc);
        expect((await banc.win.ReserveRenvoyer.retirer(res)).etat).toBe('different');
        expect(await photo(banc)).toEqual(avant);
    });
});

describe('E3 · correction 1 (verdict) : le contenu des copies de l\'archive est relu au renvoi', () => {
    /** Le ZIP d'origine, une copie de l'archive remplacée par d'autres octets (meta.json intact). */
    async function copieAlteree(blob, id, octetsNeufs) {
        const zip = await JSZip.loadAsync(await blob.arrayBuffer());
        const n = Object.keys(zip.files).find((x) => x.includes('/travaux/' + id + '.'));
        zip.file(n, octetsNeufs);
        return new Blob([await zip.generateAsync({ type: 'uint8array' })]);
    }

    it('une copie de l\'archive altérée après « Vérifier » (même nom, même meta.json) : refus, rien retiré', async () => {
        const banc = await preparer();
        const alteree = await copieAlteree(banc.zip, 'FT_h2', octets(25 * 1024 + 3, 77));
        const avant = await photo(banc);
        const r = await renvoyer(banc, alteree);
        expect(r.comparaison).toMatchObject({ etat: 'refus', motif: 'changeeDepuis' });
        expect(await photo(banc)).toEqual(avant);
        expect(banc.db.journal).toEqual([]);
        expect(banc.win.ReserveRenvoyer.compteRendu(r.comparaison).message).toBe('Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n\'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau.');
    });

    it('tronquée : refus aussi ; et en reprise, une copie que l\'application n\'a plus est relue elle aussi', async () => {
        const banc = await preparer();
        expect((await renvoyer(banc, await copieAlteree(banc.zip, 'FT_h1', COPIES.FT_h1.slice(0, 1000)))).comparaison.motif).toBe('changeeDepuis');
        // Une reprise : FT_hc est déjà partie de l'application, son exemplaire d'archive est abîmé.
        let n = 0;
        banc.magasin.echouer = () => ++n === 2;
        expect((await renvoyer(banc)).bilan.etat).toBe('interrompu');
        banc.magasin.echouer = null;
        const avant = await photo(banc);
        const r = await renvoyer(banc, await copieAlteree(banc.zip, 'FT_h1', octets(40 * 1024, 55)));
        expect(banc.magasin._blobs.has('FT_h1')).toBe(false); // partie au premier passage
        expect(r.comparaison.motif).toBe('changeeDepuis');
        expect(await photo(banc)).toEqual(avant);
    });

    it('TÉMOIN — la relecture du contenu neutralisée : la copie altérée passe, le trimestre part', async () => {
        const banc = await preparer({ muter: { [MODULE]: (s) => s.replace(
            "if (empreinteArchive !== empreintesCopies[nomsArchive[q]]) return { motif: 'changeeDepuis' };", '') } });
        const r = await renvoyer(banc, await copieAlteree(banc.zip, 'FT_h2', octets(25 * 1024 + 3, 77)));
        expect(r.bilan && r.bilan.etat).toBe('fait'); // le premier essai aurait rougi
    });
});

describe('E3 · correction 2 (verdict) : une clé du trimestre qui vaut null', () => {
    function corpusAvecVide() { return Object.assign(structuredClone(CORPUS), { h2032_presencesVides: null }); }

    it('se renvoie, la clé vide part avec les autres, rien ne reste « inachevé » ; « Faire revenir » rend le reste', async () => {
        const banc = await preparer({ corpus: corpusAvecVide() });
        const r = await renvoyer(banc);
        expect(r.comparaison.etat).toBe('identique');
        expect(r.bilan.etat).toBe('fait');
        expect(banc.db._map.has('h2032_presencesVides')).toBe(false);
        expect(banc.win.ReserveRenvoyer.estInacheve(TRIM)).toBe(false);
        expect((await faireRevenir(banc)).etat).toBe('fait');
    });

    it('une clé vide restée après un renvoi interrompu n\'empêche ni la reprise ni « Faire revenir »', async () => {
        const banc = await preparer({ corpus: corpusAvecVide() });
        banc.db.echouer = (op, k) => op === 'remove' && k === 'h2032_notesRapport';
        expect((await renvoyer(banc)).bilan.etat).toBe('interrompu');
        banc.db.echouer = null;
        expect((await faireRevenir(banc)).etat).toBe('fait');
    });

    it('TÉMOIN — le traitement de la clé vide retiré : le renvoi est refusé (« née depuis »)', async () => {
        const banc = await preparer({ corpus: corpusAvecVide(), muter: { [MODULE]: (s) => s.replace(
            "            if (cle.indexOf(prefixe) === 0) res.aRetirer.cles.push(cle); else res.aRetirer.seances.push(cle);\n            continue;",
            "            continue;") } });
        const r = await renvoyer(banc);
        expect(r.bilan && r.bilan.etat).toBe('different'); // le premier essai aurait rougi
    });
});

describe('E3 · correction 3 (verdict) : #1027, une fiche sans fichier à l\'archivage', () => {
    function sansH3() { const c = Object.assign({}, COPIES); delete c.FT_h3; return c; }

    it('l\'archive est « vérifiée », le trimestre se renvoie, puis revient (la fiche sans copie dans l\'archive)', async () => {
        const banc = await preparer({ copies: sansH3(), sansFichier: true });
        const r = await renvoyer(banc);
        expect(r.bilan.etat).toBe('fait');
        const bilan = await faireRevenir(banc);
        expect(bilan.etat).toBe('fait');
        expect(bilan.sansFichier).toEqual(['FT_h3']);
        expect(banc.db._map.get('h2032_fichiersTravaux').map((f) => f.id)).toContain('FT_h3');
    });

    it('un compte déclaré qui ne concorde pas : l\'ancienne règle, la fiche reste non couverte', async () => {
        const db = creerDb();
        const magasin = creerMagasin(db, sansH3());
        const banc = monter(db, magasin);
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        const zip = await JSZip.loadAsync(await banc.journal.telechargements.at(-1).blob.arrayBuffer());
        const n = 'trimestres/' + DOSSIER + '/meta.json';
        zip.file(n, (await zip.file(n).async('string')).replace('"nombre_fichiers_manquants": 1', '"nombre_fichiers_manquants": 0'));
        const RV = banc.win.ReserveVerifier;
        const rapport = await RV.verifierArchive(RV.sourceFichier(new Blob([await zip.generateAsync({ type: 'uint8array' })])), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
        expect(rapport.nonCouvertes).toEqual(['FT_h3']);
        expect(rapport.etat).toBe('incomplete');
    });

    it('TÉMOIN — l\'ancienne règle remise : l\'archive n\'est plus vérifiée', async () => {
        const db = creerDb();
        const banc = monter(db, creerMagasin(db, sansH3()), { muter: { 'js/reserve-verifier.js': (s) => s.replace(
            "if (!idsArchive[f.id] && !manquantesALArchivage[f.id]) rapport.nonCouvertes.push(f.id);",
            "if (!idsArchive[f.id]) rapport.nonCouvertes.push(f.id);") } });
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        const RV = banc.win.ReserveVerifier;
        const rapport = await RV.verifierArchive(RV.sourceFichier(banc.journal.telechargements.at(-1).blob), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
        expect(rapport.etat).toBe('incomplete'); // le premier essai aurait rougi
    });
});

describe('E3 · (e) un arrêt au milieu, puis la reprise', () => {
    it('arrêté à la deuxième copie : le registre est parti, le reste est là et le dit ; relancé, il achève', async () => {
        const banc = await preparer();
        const avantRenvoi = await photo(banc);
        let n = 0;
        banc.magasin.echouer = () => ++n === 2;
        const r = await renvoyer(banc);
        expect(r.bilan.etat).toBe('interrompu');
        expect(r.bilan.reste).toEqual({ cles: CLES_H.length + SEANCES_H.length, copies: 3, registre: false });
        const RR = banc.win.ReserveRenvoyer;
        expect(RR.estInacheve(TRIM)).toBe(true);
        expect(RR.refusImmediat(TRIM)).toBe(null);
        const cr = RR.compteRendu(r.comparaison, r.bilan);
        expect(cr.titre).toBe('Renvoi inachevé');
        expect(cr.message).toBe('Le renvoi de Hiver 2032 s\'est arrêté en cours de route. Rien n\'est perdu : son archive garde tout.\n' +
            'Pour finir : Réglages › Données › Archives, ligne de Hiver 2032, « Terminer le renvoi ».\n' +
            'Pour annuler : « Faire revenir », au même endroit.');

        banc.magasin.echouer = null;
        const suite = await renvoyer(banc);
        expect(suite.comparaison).toMatchObject({ etat: 'identique', reprise: true });
        expect(RR.fenetreIdentique(suite.comparaison).texteConfirmer).toBe('Terminer le renvoi');
        expect(suite.bilan.etat).toBe('fait');
        const fin = await photo(banc);
        expect(Object.keys(fin.cles).filter((k) => k.startsWith('h2032_'))).toEqual([]);
        expect(COPIES_H.filter((id) => fin.copies[id])).toEqual([]);
        expect(sansTrimestre(fin)).toEqual(sansTrimestre(avantRenvoi));
        expect(RR.estInacheve(TRIM)).toBe(false);
        expect(RR.refusImmediat(TRIM)).toBe('rien');
    });

    it('arrêté au milieu des clés : « Faire revenir » ramène le trimestre entier depuis ce qui reste', async () => {
        const banc = await preparer();
        const avantRenvoi = await photo(banc);
        banc.db.echouer = (op, k) => op === 'remove' && k === 'h2032_notesRapport';
        expect((await renvoyer(banc)).bilan.etat).toBe('interrompu');
        banc.db.echouer = null;
        const bilan = await faireRevenir(banc);
        expect(bilan.etat).toBe('fait');
        expect(bilan.clesDejaLa.length).toBeGreaterThan(0);
        const p = await photo(banc);
        for (const k of CLES_H.concat(SEANCES_H)) expect([k, p.cles[k]]).toEqual([k, avantRenvoi.cles[k]]);
        for (const id of COPIES_H) expect([id, p.copies[id]]).toEqual([id, avantRenvoi.copies[id]]);
    });
});

describe('E3 · (f) le mode dossier : ré-archiver met de côté, n\'efface pas', () => {
    it('une copie retirée depuis la première archive passe dans hors-archive-<date>/ ; « Vérifier » dit l\'archive intacte', async () => {
        const dossier = fauxDossier('Archives_LaboCodex');
        const db = creerDb();
        const magasin = creerMagasin(db);
        const banc = monter(db, magasin, { dossier });
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        // La copie à la corbeille est supprimée pour de bon, puis on archive de nouveau.
        db._map.set('h2032_corbeilleFichiers', []);
        magasin._blobs.delete('FT_hc');
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        const d = dossier._enfants.get('trimestres')._enfants.get(DOSSIER);
        expect([...d._enfants.get('travaux')._fichiers.keys()].sort()).toEqual(['FT_h1.pdf', 'FT_h2.jpg', 'FT_h3.pdf']);
        const cote = [...d._enfants.keys()].filter((n) => n.startsWith('hors-archive-'));
        expect(cote).toHaveLength(1);
        const mis = d._enfants.get(cote[0])._fichiers.get('FT_hc.pdf');
        expect(new Uint8Array(await mis.arrayBuffer())).toEqual(COPIES.FT_hc);
        const RV = banc.win.ReserveVerifier;
        const rapport = await RV.verifierArchive(RV.sourceDossier(dossier, DOSSIER), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
        expect(rapport.enTrop).toEqual([]);
        expect(rapport.etat).toBe('verifiee');
    });

    it('TÉMOIN — sans la mise de côté, « Vérifier » la dit « en trop » (la note d\'E1)', async () => {
        const dossier = fauxDossier('Archives_LaboCodex');
        const db = creerDb();
        const magasin = creerMagasin(db);
        const banc = monter(db, magasin, { dossier, muter: { 'js/reserve-trimestre.js': (s) => s.replace('mettreDeCote: true,', 'mettreDeCote: false,') } });
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        db._map.set('h2032_corbeilleFichiers', []);
        magasin._blobs.delete('FT_hc');
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        const RV = banc.win.ReserveVerifier;
        const rapport = await RV.verifierArchive(RV.sourceDossier(dossier, DOSSIER), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
        expect(rapport.enTrop).toEqual(['FT_hc.pdf']);
    });
});

describe('E3 · (g) témoins : le banc rougit', () => {
    it('une clé globale retirée (la règle « porte l\'id » de supprimerTrimestre) : l\'aller-retour ne passe plus', async () => {
        const banc = await preparer({
            muter: { [MODULE]: (s) => s.replace(
                "presentes.forEach(function(k) { if (typeof k === 'string' && k.indexOf(prefixe) === 0) aComparer.push(k); });",
                "presentes.forEach(function(k) { if (typeof k === 'string' && k !== 'trimestres' && k.indexOf(trimestre) !== -1) aComparer.push(k); });"
            ) }
        });
        const avant = await photo(banc);
        const r = await renvoyer(banc);
        // Rouge par l'une ou l'autre voie : refusé (« né depuis »), ou une clé globale partie.
        const apres = await photo(banc);
        const ok = !!r.bilan && r.bilan.etat === 'fait' && JSON.stringify(sansTrimestre(apres)) === JSON.stringify(sansTrimestre(avant));
        expect(ok).toBe(false);
    });

    it('une copie retirée alors que l\'archive ne l\'a pas : la copie disparaît', async () => {
        const copies = Object.assign({}, COPIES);
        delete copies.FT_h3;
        const banc = await preparer({
            copies, sansFichier: true,
            muter: { [MODULE]: (s) => s.replace(
                "res.differences.push({ type: 'copieAbsente', id: id });",
                "res.aRetirer.copies.push(id);"
            ) }
        });
        banc.magasin._blobs.set('FT_h3', new Blob([COPIES.FT_h3]));
        await renvoyer(banc);
        expect(banc.magasin._blobs.has('FT_h3')).toBe(false);
    });

    it('la comparaison neutralisée : une copie DIFFÉRENTE de l\'archive est retirée (perdue)', async () => {
        const banc = await preparer({
            muter: { [MODULE]: (s) => s.replace(
                "res.etat = res.differences.length ? 'different' : 'identique';",
                "res.etat = 'identique'; res.differences.forEach(function(d) { if (d.id) res.aRetirer.copies.push(d.id); });"
            ) }
        });
        banc.magasin._blobs.set('FT_h3', new Blob([octets(3 * 1024, 99)]));
        const r = await renvoyer(banc);
        expect(r.bilan.etat).toBe('fait');
        expect(banc.magasin._blobs.has('FT_h3')).toBe(false); // le banc (d) aurait rougi
    });

    it('la comparaison neutralisée : une clé changée est encore arrêtée par la recomparaison d\'avant le retrait', async () => {
        const banc = await preparer({
            muter: { [MODULE]: (s) => s.replace(
                "res.etat = res.differences.length ? 'different' : 'identique';",
                "res.etat = 'identique'; res.differences.forEach(function(d) { if (d.cle) res.aRetirer.cles.push(d.cle); });"
            ) }
        });
        banc.db._map.set('h2032_productions', [{ id: 'P1', titre: 'Consultée', coursId: 'C1' }]);
        const r = await renvoyer(banc);
        expect(r.bilan.etat).toBe('different');
        expect(banc.db._map.has('h2032_productions')).toBe(true);
    });

    it('la recomparaison d\'avant le retrait neutralisée : une clé changée entre-temps est retirée (perdue)', async () => {
        const banc = await preparer({
            muter: { [MODULE]: (s) => s.replace("if (nouvelles.length || changees.length) {", "if (false) {") }
        });
        const res = await banc.win.ReserveRenvoyer.comparer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        banc.db._map.set('h2032_notesRapport', { '0000002': 'changé' });
        expect((await banc.win.ReserveRenvoyer.retirer(res)).etat).toBe('fait');
        expect(banc.db._map.has('h2032_notesRapport')).toBe(false); // le banc (d) aurait rougi
    });
});
