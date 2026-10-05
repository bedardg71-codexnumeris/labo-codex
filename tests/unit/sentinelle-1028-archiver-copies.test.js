import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE DE #1028 — ARCHIVER LES COPIES D'UN TRIMESTRE CLOS (ses données restent)
// =====================================================================
//
// Consigne de Cowork du 5 oct. 2026 (9 h 02), décisions 1 à 6 et point 4 de « ce que tu fais ».
// L'espace fictif d'E3 : un trimestre clos (h2032 : deux groupes, quatre copies dont une à la
// corbeille, des vignettes), un trimestre en cours (a2032) et des réglages.
//
// CE QUE CE BANC JUGE :
//   (a) l'aller-retour : archiver, vérifier, ARCHIVER LES COPIES (les fichiers et leurs vignettes
//       partent, rien d'autre), faire évoluer les données du trimestre, FAIRE REVENIR → chaque
//       fichier égal à l'avant, la marque levée, rien d'autre n'a changé ;
//   (b) E3 sur un trimestre dont les copies sont aux archives : il passe, et lève la marque ;
//   (c) E1 refuse tant que des copies sont aux archives, et l'archive d'un groupe aussi ;
//   (d) une copie différente ou absente de l'archive → rien retiré ;
//   (e) un arrêt au milieu, l'état lisible (marquée mais encore là = pas « aux archives »), la reprise ;
//   (f) la copie d'un·e étudiant·e supprimé·e reste ;
//   (g) les témoins : une copie retirée que l'archive n'a pas ; la relecture du contenu
//       neutralisée ; une clé `<trimestre>_*` retirée ; E1 qui archive sans les copies parties.
//
// CE QU'IL NE JUGE PAS : le vrai menu, la vraie `db`, les lecteurs du fichier d'une copie, la
// largeur d'iPad, la mémoire (tests/integration/1028-archiver-copies.spec.js). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };

const TRIM = 'h2032';
const DOSSIER = 'h2032-trimestre';
const MODULE = 'js/reserve-copies.js';
const CLE_MARQUE = '_copiesAuxArchives';

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
const VIGNETTES_H = ['thumbnail_FT_h1', 'thumbnail_FT_hc'];

const CORPUS = {
    trimestres: [{ id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' }, { id: 'a2032', nom: 'Automne 2032', actif: true }],
    trimestreActif: 'a2032',
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif', trimestreId: 'h2032' }],
    profilEnseignant: { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' },
    h2032_groupesCours: [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }],
    h2032_groupeEtudiants: [
        { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
        { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
        { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
    ],
    h2032_evaluationsSauvegardees: [{ id: 'EV1', etudiantDA: '0000001', note: 80 }, { id: 'EV2', etudiantDA: '0000009', note: 55 }],
    h2032_annotationsTravaux: [{ id: 'AN1', fichierId: 'FT_h1', pages: { 1: [{ type: 'trait' }] } }],
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
    a2032_fichiersTravaux: [{ id: 'FT_a1', nomFichier: 'a.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_A1' }]
};

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
            journal.push('remove:' + k); map.delete(k);
        },
        keys: async () => [...map.keys()],
        keysSync: () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); },
        removeSync: (k) => { map.delete(k); },
        flush: async () => {}
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
        async supprimerThumbnail(id) { await db.remove('thumbnail_' + id); }
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
        VERSION_MAJEURE: '1.185.0-banc', db, travauxStockage: magasin,
        dasElevesEcartes: options.ecartes ? () => new Set(options.ecartes) : () => new Set(),
        uiDialogues: {
            confirmerAction: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message, bouton: o.texteConfirmer }); return options.confirmer !== false; },
            demanderAction: async () => null,
            informer: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message }); }
        },
        JSZip
    };
    const notifications = {};
    for (const type of ['succes', 'erreur', 'info', 'warning']) notifications[type] = (titre, message) => journal.notifications.push({ type, titre, message });
    monterFichierSortant(win, { document: doc, setTimeout: fauxSetTimeout, URL: FauxURL });
    const fichiers = ['js/reserve.js', 'js/reserve-verifier.js', 'js/reserve-trimestre.js', 'js/reserve-emprunter.js',
        'js/reserve-renvoyer.js', 'js/reserve-revenir.js', MODULE];
    let mordu = false;
    for (const fichier of fichiers) {
        const brut = readFileSync(path.join(racine, fichier), 'utf8');
        const mutation = options.muter && options.muter[fichier];
        const code = mutation ? mutation(brut) : brut;
        if (mutation && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans ' + fichier);
        if (mutation) mordu = true;
        new Function(
            'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
            'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
            '"use strict";\n' + code
        )(win, doc, consoleSandbox, db, notifications, JSZip, (cb) => setTimeout(cb, 0),
            fauxSetTimeout, { userAgent: 'BacASable/1028 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    }
    if (options.muter && !mordu) throw new Error('Témoin inerte : aucun fichier muté');
    return { win, journal, db, magasin };
}

async function archiverEtVerifier(banc) {
    const r = await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
    const zip = banc.journal.telechargements.at(-1).blob;
    const RV = banc.win.ReserveVerifier;
    const rapport = await RV.verifierArchive(RV.sourceFichier(zip), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
    expect(rapport.etat).toBe('verifiee');
    RV.retenirResultat(DOSSIER, rapport);
    banc.zip = zip;
    return r;
}

async function preparer(o = {}) {
    const db = o.db || creerDb(o.corpus);
    const magasin = creerMagasin(db, o.copies);
    const banc = monter(db, magasin, { muter: o.muter, ecartes: o.ecartes });
    await archiverEtVerifier(banc);
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

function sauf(p, exclues) {
    const cles = {};
    for (const k of Object.keys(p.cles)) if (!exclues.includes(k)) cles[k] = p.cles[k];
    return cles;
}

async function archiverCopies(banc, fichier = banc.zip) {
    return banc.win.ReserveCopies.archiverCopies(banc.win.ReserveVerifier.sourceFichier(fichier), TRIM);
}

async function faireRevenir(banc, fichier = banc.zip) {
    const entree = Object.assign({ dossier: DOSSIER }, banc.win.Reserve.lireManifesteLocal().archives[DOSSIER]);
    return banc.win.ReserveRevenir.faireRevenir(banc.win.ReserveVerifier.sourceFichier(fichier), entree);
}

async function copieAlteree(blob, id, octetsNeufs) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const n = Object.keys(zip.files).find((x) => x.includes('/travaux/' + id + '.'));
    zip.file(n, octetsNeufs);
    return new Blob([await zip.generateAsync({ type: 'uint8array' })]);
}

/**
 * L'aller-retour (a), rendu comme une liste de défauts plutôt qu'en assertions : les témoins
 * la rejouent sous mutation et exigent qu'elle en trouve.
 */
async function allerRetour(banc) {
    const defauts = [];
    const avant = await photo(banc);
    const r = await archiverCopies(banc);
    if (r.comparaison.etat !== 'identique' || !r.bilan || r.bilan.etat !== 'fait') { defauts.push('geste : ' + r.comparaison.etat + '/' + (r.bilan && r.bilan.etat)); return defauts; }
    const apres = await photo(banc);
    for (const id of COPIES_H) if (apres.copies[id] !== undefined) defauts.push('copie restée : ' + id);
    if (apres.copies.FT_a1 !== avant.copies.FT_a1) defauts.push('copie de l\'autre trimestre touchée');
    for (const k of VIGNETTES_H) if (apres.cles[k] !== undefined) defauts.push('vignette restée : ' + k);
    // Rien d'autre : toutes les clés égales, hors vignettes retirées et la marque posée.
    const autresAvant = sauf(avant, VIGNETTES_H);
    const autresApres = sauf(apres, VIGNETTES_H.concat([CLE_MARQUE]));
    if (JSON.stringify(autresApres) !== JSON.stringify(autresAvant)) {
        const k = Object.keys({ ...autresAvant, ...autresApres }).filter((x) => autresAvant[x] !== autresApres[x]);
        defauts.push('autre clé changée : ' + k.join(', '));
    }
    const marque = JSON.parse(apres.cles[CLE_MARQUE] || '{}');
    if (JSON.stringify(Object.keys((marque[TRIM] || {}).ids || {}).sort()) !== JSON.stringify(COPIES_H.slice().sort())) defauts.push('marque : ' + apres.cles[CLE_MARQUE]);

    // Les données du trimestre évoluent (elles restent dans l'application).
    banc.db._map.get('h2032_evaluationsSauvegardees')[0].note = 85;
    banc.db._map.set('h2032_notesRapport', { '0000002': 'Texte fictif revu' });
    const avantRetour = await photo(banc);

    const b = await faireRevenir(banc);
    if (b.etat !== 'fait') defauts.push('retour : ' + b.etat);
    const retour = await photo(banc);
    for (const id of COPIES_H) if (retour.copies[id] !== avant.copies[id]) defauts.push('copie revenue différente : ' + id);
    if (retour.cles[CLE_MARQUE] !== undefined) defauts.push('marque non levée');
    const sansMarque = sauf(avantRetour, [CLE_MARQUE]);
    if (JSON.stringify(sauf(retour, [])) !== JSON.stringify(sansMarque)) defauts.push('le retour a changé une clé');
    return defauts;
}

describe('#1028 · le banc est sain', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        const db = creerDb();
        expect(() => monter(db, creerMagasin(db), { muter: { [MODULE]: (s) => s } })).toThrow(/Témoin inerte/);
    });
});

describe('#1028 · (a) l\'aller-retour : archiver les copies, faire évoluer les données, faire revenir', () => {
    it('les fichiers et leurs vignettes partent, rien d\'autre ; ils reviennent égaux à l\'avant ; la marque est levée', async () => {
        const banc = await preparer();
        expect(await allerRetour(banc)).toEqual([]);
    });

    it('l\'ordre : la marque d\'abord, puis chaque fichier et sa vignette', async () => {
        const banc = await preparer();
        await archiverCopies(banc);
        const j = banc.db.journal;
        expect(j[0]).toBe('set:' + CLE_MARQUE);
        expect(j.filter((x) => x.startsWith('retrait-copie:')).length).toBe(4);
        expect(j.filter((x) => !x.startsWith('retrait-copie:') && !x.startsWith('remove:thumbnail_') && x !== 'set:' + CLE_MARQUE)).toEqual([]);
    });

    it('la marque dit « aux archives » ; une copie qui n\'est pas du trimestre ne l\'est pas', async () => {
        const banc = await preparer();
        await archiverCopies(banc);
        const RC = banc.win.ReserveCopies;
        for (const id of COPIES_H) expect(RC.estAuxArchives(id)).toBe(true);
        expect(RC.estAuxArchives('FT_a1')).toBe(false);
        expect(RC.trimestreDeLaCopie('FT_hc')).toBe(TRIM);
        expect(RC.idsDansDonnees({ [CLE_MARQUE]: banc.db._map.get(CLE_MARQUE) })).toEqual({ FT_h1: true, FT_h2: true, FT_h3: true, FT_hc: true });
    });

    it('la fenêtre et le bilan (mots provisoires)', async () => {
        const banc = await preparer();
        const RC = banc.win.ReserveCopies;
        const res = await RC.comparer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        const f = RC.fenetreIdentique(res);
        expect(f.titre).toBe('Archiver les copies de Hiver 2032 ?');
        expect(f.message.split('\n')[0]).toBe('4 copies quitteront l\'application, environ 80,0 Ko.');
        expect(f.texteConfirmer).toBe('Archiver les copies');
        const bilan = await RC.retirer(res);
        expect(RC.compteRendu(res, bilan)).toEqual({
            titre: 'Les copies de Hiver 2032 sont aux archives',
            message: '4 copies retirées, environ 80,0 Ko libérés. Ses données restent dans l\'application.\n' +
                'Pour les faire revenir : Réglages › Données › Archives, ligne de Hiver 2032, « Faire revenir ».'
        });
    });

    it('relancé quand tout est parti : « rien à archiver », rien écrit', async () => {
        const banc = await preparer();
        await archiverCopies(banc);
        banc.db.journal.length = 0;
        const r = await archiverCopies(banc);
        expect(r.comparaison).toMatchObject({ etat: 'refus', motif: 'rien' });
        expect(banc.db.journal).toEqual([]);
    });
});

describe('#1028 · (b) E3 sur un trimestre dont les copies sont aux archives', () => {
    it('E3 le trouve identique, le renvoie, et lève la marque ; E2 le ramène avec ses copies', async () => {
        const banc = await preparer();
        const avant = await photo(banc);
        await archiverCopies(banc);
        const r = await banc.win.ReserveRenvoyer.renvoyer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        expect(r.comparaison.etat).toBe('identique');
        expect(r.bilan.etat).toBe('fait');
        expect(banc.db._map.has(CLE_MARQUE)).toBe(false);
        const entree = Object.assign({ dossier: DOSSIER }, banc.win.Reserve.lireManifesteLocal().archives[DOSSIER]);
        const e2 = await banc.win.ReserveEmprunter.emprunter(banc.win.ReserveVerifier.sourceFichier(banc.zip), entree);
        expect(e2.etat).toBe('fait');
        const retour = await photo(banc);
        for (const id of COPIES_H) expect([id, retour.copies[id]]).toEqual([id, avant.copies[id]]);
    });
});

describe('#1028 · (c) aucune nouvelle archive sans les copies parties', () => {
    it('E1 refuse tant que des copies sont aux archives ; rien n\'est téléchargé ; après le retour, il archive', async () => {
        const banc = await preparer();
        await archiverCopies(banc);
        const n = banc.journal.telechargements.length;
        const r = await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        expect(r).toEqual({ succes: false, refus: 'copiesAuxArchives' });
        expect(banc.journal.telechargements.length).toBe(n);
        await faireRevenir(banc);
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        expect(banc.journal.telechargements.length).toBe(n + 1);
    });

    it('le refus d\'E1 se dit à l\'usager (mots provisoires)', async () => {
        const banc = await preparer();
        await archiverCopies(banc);
        banc.journal.fenetres.length = 0;
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM);
        expect(banc.journal.fenetres).toEqual([{
            titre: 'Archive non écrite',
            message: '4 copies de Hiver 2032 sont aux archives : une nouvelle archive ne les contiendrait pas.\n' +
                'Fais-les revenir d\'abord (Réglages › Données › Archives, « Faire revenir »), puis archive de nouveau.'
        }]);
    });

    it('l\'archive d\'un groupe du trimestre refuse aussi', async () => {
        const banc = await preparer();
        await archiverCopies(banc);
        const n = banc.journal.telechargements.length;
        const r = await banc.win.Reserve.verserGroupeCours(TRIM, 'GC_H1');
        expect(r).toBeNull();
        expect(banc.journal.telechargements.length).toBe(n);
    });

    it('une marque dont les fichiers sont revenus par un autre chemin ne bloque pas : elle est levée', async () => {
        const banc = await preparer();
        const avant = new Map(banc.magasin._blobs);
        await archiverCopies(banc);
        for (const id of COPIES_H) banc.magasin._blobs.set(id, avant.get(id));
        const n = banc.journal.telechargements.length;
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        expect(banc.journal.telechargements.length).toBe(n + 1);
        expect(banc.db._map.has(CLE_MARQUE)).toBe(false);
    });
});

describe('#1028 · (d) une copie différente ou absente de l\'archive : rien retiré', () => {
    it('une copie modifiée dans l\'application depuis l\'archive', async () => {
        const banc = await preparer();
        banc.magasin._blobs.set('FT_h2', new Blob([octets(25 * 1024 + 3, 99)]));
        const avant = await photo(banc);
        const r = await archiverCopies(banc);
        expect(r.comparaison.etat).toBe('different');
        expect(r.bilan).toBeNull();
        expect(await photo(banc)).toEqual(avant);
        expect(banc.win.ReserveCopies.compteRendu(r.comparaison).message.split('\n').slice(0, 1)).toEqual(['Rien n\'a été retiré.']);
    });

    it('une copie ajoutée depuis l\'archive', async () => {
        const banc = await preparer();
        banc.db._map.get('h2032_fichiersTravaux').push({ id: 'FT_h9', nomFichier: 'neuve.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1' });
        banc.magasin._blobs.set('FT_h9', new Blob([octets(2048, 9)]));
        const avant = await photo(banc);
        const r = await archiverCopies(banc);
        expect(r.comparaison.etat).toBe('different');
        expect(r.comparaison.differences).toEqual([{ type: 'copieAbsente', id: 'FT_h9' }]);
        expect(await photo(banc)).toEqual(avant);
    });

    it('les données changées depuis l\'archive n\'empêchent rien (elles restent)', async () => {
        const banc = await preparer();
        banc.db._map.set('h2032_notesRapport', { '0000002': 'Texte fictif revu' });
        const r = await archiverCopies(banc);
        expect(r.bilan.etat).toBe('fait');
        expect(banc.db._map.get('h2032_notesRapport')).toEqual({ '0000002': 'Texte fictif revu' });
    });

    it('une copie de l\'archive altérée après « Vérifier » : refus, rien retiré', async () => {
        const banc = await preparer();
        const avant = await photo(banc);
        const r = await archiverCopies(banc, await copieAlteree(banc.zip, 'FT_h2', octets(25 * 1024 + 3, 77)));
        expect(r.comparaison).toMatchObject({ etat: 'refus', motif: 'changeeDepuis' });
        expect(await photo(banc)).toEqual(avant);
    });

    it('les refus d\'avant l\'archive : trimestre actif, sans archive vérifiée, absent', async () => {
        const banc = await preparer();
        const RC = banc.win.ReserveCopies;
        expect(RC.refusImmediat('a2032')).toBe('pasClos');
        expect(RC.refusImmediat('h2099')).toBe('pasDansLApplication');
        const manifeste = banc.win.Reserve.lireManifesteLocal();
        delete manifeste.archives[DOSSIER].verification;
        banc.db._map.set('_manifesteReserve', manifeste);
        expect(RC.refusImmediat(TRIM)).toBe('nonVerifiee');
    });
});

describe('#1028 · (e) un arrêt au milieu, puis la reprise', () => {
    it('le retrait de la deuxième copie refusé : arrêt ; la marque couvre tout, mais une copie encore là n\'est pas « aux archives » ; reprise → fait', async () => {
        const banc = await preparer();
        const avant = await photo(banc);
        let n = 0;
        banc.magasin.echouer = () => ++n === 2;
        const r = await archiverCopies(banc);
        expect(r.bilan).toMatchObject({ etat: 'interrompu', copies: 1, reste: 3 });
        expect(banc.win.ReserveCopies.compteRendu(r.comparaison, r.bilan).titre).toBe('Archivage des copies inachevé');
        // Les copies encore là ne sont pas « parties » : seule la retirée l'est.
        expect(await banc.win.ReserveCopies.copiesParties(TRIM)).toEqual(['FT_h1']);
        banc.magasin.echouer = null;
        const reprise = await archiverCopies(banc);
        expect(reprise.bilan).toMatchObject({ etat: 'fait', copies: 3 });
        for (const id of COPIES_H) expect(banc.magasin._blobs.has(id)).toBe(false);
        // Et le retour rend tout.
        await faireRevenir(banc);
        const retour = await photo(banc);
        for (const id of COPIES_H) expect([id, retour.copies[id]]).toEqual([id, avant.copies[id]]);
    });

    it('la marque refusée (espace plein) : rien retiré', async () => {
        const banc = await preparer();
        banc.db.echouer = (op, k) => op === 'set' && k === CLE_MARQUE;
        const avant = await photo(banc);
        const r = await archiverCopies(banc);
        expect(r.bilan.etat).toBe('interrompu');
        expect((await photo(banc)).copies).toEqual(avant.copies);
    });
});

describe('#1028 · (f) la copie d\'un·e étudiant·e supprimé·e reste', () => {
    it('elle n\'est pas retirée, la fenêtre le dit', async () => {
        const banc = await preparer({ ecartes: ['0000002'] });
        const RC = banc.win.ReserveCopies;
        const res = await RC.comparer(banc.win.ReserveVerifier.sourceFichier(banc.zip), TRIM);
        expect(res.laissees).toBe(1);
        expect(res.aRetirer.copies).not.toContain('FT_h2');
        expect(RC.fenetreIdentique(res).message.split('\n').at(-1)).toBe('1 copie d\'un·e étudiant·e supprimé·e reste dans l\'application.');
        await RC.retirer(res);
        expect(banc.magasin._blobs.has('FT_h2')).toBe(true);
    });
});

describe('#1028 · (g) les témoins', () => {
    it('TÉMOIN — une copie que l\'archive n\'a pas est retirée : l\'aller-retour la perd', async () => {
        const banc = await preparer({ muter: { [MODULE]: (s) => s.replace(
            "res.differences.push({ type: 'copieAbsente', id: f.id });", 'res.aRetirer.copies.push(f.id);') } });
        banc.db._map.get('h2032_fichiersTravaux').push({ id: 'FT_h9', nomFichier: 'neuve.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1' });
        banc.magasin._blobs.set('FT_h9', new Blob([octets(2048, 9)]));
        const r = await archiverCopies(banc);
        expect(r.bilan && r.bilan.etat).toBe('fait');
        await faireRevenir(banc);
        expect(banc.magasin._blobs.has('FT_h9')).toBe(false); // perdue : le vrai code l'aurait refusée
    });

    it('TÉMOIN — la relecture du contenu de l\'archive neutralisée : la copie altérée passe', async () => {
        const banc = await preparer({ muter: { 'js/reserve-renvoyer.js': (s) => s.replace(
            "if (empreinteArchive !== empreintesCopies[nomsArchive[q]]) return { motif: 'changeeDepuis' };", '') } });
        const r = await archiverCopies(banc, await copieAlteree(banc.zip, 'FT_h2', octets(25 * 1024 + 3, 77)));
        expect(r.bilan && r.bilan.etat).toBe('fait');
    });

    it('TÉMOIN — une clé `<trimestre>_*` retirée avec les copies : l\'aller-retour le voit', async () => {
        const banc = await preparer({ muter: { [MODULE]: (s) => s.replace(
            'await _retirerVignette(id);\n            delete vignettes[id];',
            'await _retirerVignette(id);\n            delete vignettes[id];\n            await window.db.remove(trimestre + \'_notesRapport\');') } });
        const defauts = await allerRetour(banc);
        expect(defauts.some((d) => d.includes('h2032_notesRapport'))).toBe(true);
    });

    it('TÉMOIN — E1 qui archive sans les copies parties : une archive sans elles s\'écrit', async () => {
        const banc = await preparer({ muter: { 'js/reserve-trimestre.js': (s) => s.replace(
            'if (window.ReserveCopies && window.ReserveCopies.idsMarques(trimestre).length &&', 'if (false &&') } });
        await archiverCopies(banc);
        const n = banc.journal.telechargements.length;
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        expect(banc.journal.telechargements.length).toBe(n + 1);
        const zip = await JSZip.loadAsync(await banc.journal.telechargements.at(-1).blob.arrayBuffer());
        expect(Object.keys(zip.files).filter((x) => x.includes('/travaux/FT_'))).toEqual([]);
    });
});
