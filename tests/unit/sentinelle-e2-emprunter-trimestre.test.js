import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE D'E2 (#1023) — EMPRUNTER UN TRIMESTRE DEPUIS SON ARCHIVE VÉRIFIÉE
// =====================================================================
//
// Consigne de Cowork du 4 oct. 2026 (19 h 06), points 2 à 6 et point 4 de « ce que tu fais ».
// Le trajet complet, sur un espace fictif : un trimestre clos (h2032 : deux groupes, un doubleur,
// quatre copies dont une à la corbeille, deux séances vivantes), un trimestre en cours (a2032,
// avec le même doubleur) et des réglages. On ARCHIVE h2032 (E1), on le VÉRIFIE, on le SUPPRIME
// comme `supprimerTrimestre` (ses clés et son entrée partent ; ses séances vivantes et les
// fichiers de ses copies RESTENT, mesure du 4 oct.), l'espace ÉVOLUE (une élève ajoutée à a2032,
// le profil changé), puis on EMPRUNTE.
//
// CE QUE CE BANC JUGE :
//   (a) le trimestre revient entier et clos ; RIEN d'autre n'a changé (toutes les clés hors du
//       trimestre, et tous les fichiers, comparés avant et après) ; le registre est écrit EN
//       DERNIER, les fichiers EN PREMIER ;
//   (b) les refus de la décision 2 (déjà là, débris, séance ou copie différente) et de la
//       décision 3 (l'archive a changé depuis sa vérification) n'écrivent RIEN ;
//   (c) une clé globale glissée dans une archive pourtant vérifiée n'entre jamais ;
//   (d) un échec provoqué au milieu ne laisse que ce qu'il y avait avant ;
//   (e) les témoins (mutations du module) : une clé globale réécrite, le registre écrit avant
//       les clés, une empreinte non recomparée (meta.json, donnees.json, une copie) → rouge.
//
// CE QU'IL NE JUGE PAS : le vrai bouton, la vraie fenêtre, la vraie `db` (garde #340), la largeur
// d'iPad et la mémoire (tests/integration/e2-emprunter-trimestre.spec.js). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };

const TRIM = 'h2032';
const DOSSIER = 'h2032-trimestre';
const MODULE = 'js/reserve-emprunter.js';

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
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif', trimestreId: 'h2032' }],
    listeCours: [{ id: 'C1', codeCours: '601-101-MQ' }],
    enseignants: [{ id: 'E1', nom: 'Enseignant fictif' }],
    profilEnseignant: { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' },
    registreLongitudinal: { '0000009': { nom: 'Élève fictif Doubleur' } },
    bibliothequeGrilles: [{ id: 'G1' }],
    _codex_etat: { actif: true },
    h2032_groupesCours: [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }],
    h2032_groupeEtudiants: [
        { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
        { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
        { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
    ],
    h2032_evaluationsSauvegardees: [{ id: 'EV1', etudiantDA: '0000001', note: 80 }, { id: 'EV2', etudiantDA: '0000009', note: 55 }],
    h2032_productions: [{ id: 'P1', titre: 'Production fictive', coursId: 'C1' }, { id: 'P2', titre: 'Autre production', coursId: 'C1' }],
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
    a2032_groupesCours: [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }],
    a2032_groupeEtudiants: [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }],
    a2032_fichiersTravaux: [{ id: 'FT_a1', nomFichier: 'a.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_A1' }],
    seancesCompletes_gc_GC_A1: [{ id: 'SA' }]
};
const CLES_H = Object.keys(CORPUS).filter((k) => k.startsWith('h2032_'));
const SEANCES_H = ['seancesCompletes_gc_GC_H1', 'seancesCompletes_gc_GC_H2'];

/** Une `db` en mémoire, qui consigne l'ordre de ses écritures. `echouer(cle)` : une écriture refusée. */
function creerDb(initial = CORPUS) {
    const map = new Map(Object.entries(structuredClone(initial)));
    const journal = [];
    const db = {
        _map: map, journal, echouer: null,
        get: async (k, def = null) => (map.has(k) ? structuredClone(map.get(k)) : def),
        set: async (k, v) => {
            if (db.echouer && db.echouer(k)) throw Object.assign(new Error('QuotaExceededError (banc)'), { name: 'QuotaExceededError' });
            journal.push('set:' + k); map.set(k, structuredClone(v));
        },
        remove: async (k) => { journal.push('remove:' + k); map.delete(k); },
        keys: async () => [...map.keys()],
        keysSync: () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); },
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

/** Le magasin des copies, en mémoire, qui consigne ses écritures dans le journal de la db. */
function creerMagasin(db, initial = COPIES) {
    const blobs = new Map(Object.entries(initial).map(([id, u8]) => [id, new Blob([u8])]));
    return {
        _blobs: blobs,
        echouer: null,
        recupererBlob: async (id) => blobs.get(id) || null,
        async stockerBlob(id, blob) {
            if (this.echouer && this.echouer(id)) throw Object.assign(new Error('QuotaExceededError (banc)'), { name: 'QuotaExceededError' });
            db.journal.push('copie:' + id); blobs.set(id, blob);
        },
        supprimerBlob: async (id) => { db.journal.push('retrait-copie:' + id); blobs.delete(id); }
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
        VERSION_MAJEURE: '1.183.0-banc', db, travauxStockage: magasin,
        dasElevesEcartes: (trace, etudiants) => {
            const inscrits = new Set((etudiants || []).map((e) => String(e.da)));
            return new Set((trace || []).filter((t) => t && t.da && !inscrits.has(String(t.da))).map((t) => String(t.da)));
        },
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
    for (const fichier of ['js/reserve.js', 'js/reserve-verifier.js', 'js/reserve-trimestre.js', MODULE]) {
        const brut = readFileSync(path.join(racine, fichier), 'utf8');
        const mutation = options.muter && options.muter[fichier];
        const code = mutation ? mutation(brut) : brut;
        if (mutation && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans ' + fichier);
        new Function(
            'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
            'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
            '"use strict";\n' + code
        )(win, doc, consoleSandbox, db, notifications, JSZip, (cb) => setTimeout(cb, 0),
            fauxSetTimeout, { userAgent: 'BacASable/E2 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    }
    return { win, journal, db, magasin };
}

/** Comme `supprimerTrimestre` : les clés qui portent l'id et l'entrée du registre ; ni séances ni fichiers. */
function supprimer(db, id) {
    for (const k of [...db._map.keys()]) if (k !== 'trimestres' && (k === id || k.startsWith(id + '_') || k.includes(id))) db._map.delete(k);
    db._map.set('trimestres', db._map.get('trimestres').filter((t) => t.id !== id));
}

/** La vie continue : une élève ajoutée à a2032, le profil changé. */
function evoluer(db) {
    db._map.get('a2032_groupeEtudiants').push({ da: '0000077', nom: 'Élève fictive Nouvelle', groupe: '1' });
    db._map.set('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'apres@exemple.test' });
}

/**
 * Le trajet jusqu'à l'emprunt : archiver (E1), vérifier, supprimer, évoluer.
 * @param {Object} o - { fichiersPartis, seancesParties, muter, alterer(blob) → blob }
 */
async function preparer(o = {}) {
    const db = creerDb();
    const magasin = creerMagasin(db);
    const banc = monter(db, magasin, { muter: o.muter });
    await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
    const zip = banc.journal.telechargements.at(-1).blob;
    const RV = banc.win.ReserveVerifier;
    const rapport = await RV.verifierArchive(RV.sourceFichier(zip), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
    expect(rapport.etat).toBe('verifiee');
    RV.retenirResultat(DOSSIER, rapport);
    supprimer(db, TRIM);
    if (o.fichiersPartis !== false) COPIES_H.forEach((id) => magasin._blobs.delete(id));
    if (o.seancesParties) SEANCES_H.forEach((k) => db._map.delete(k));
    evoluer(db);
    db.journal.length = 0;
    return Object.assign(banc, { zip, RV });
}

function entree(banc) {
    return Object.assign({ dossier: DOSSIER }, banc.win.Reserve.lireManifesteLocal().archives[DOSSIER]);
}

async function photo(banc) {
    const cles = {};
    for (const [k, v] of banc.db._map) cles[k] = JSON.stringify(v);
    const copies = {};
    for (const [id, b] of banc.magasin._blobs) copies[id] = Buffer.from(await b.arrayBuffer()).toString('base64');
    return { cles, copies };
}

async function emprunter(banc, fichier = banc.zip) {
    return banc.win.ReserveEmprunter.emprunter(banc.RV.sourceFichier(fichier), entree(banc));
}

/** Reconstruit le ZIP avec un texte changé. */
async function remplacer(blob, nom, changer) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const chemin = 'trimestres/' + DOSSIER + '/' + nom;
    const f = zip.file(chemin);
    if (typeof changer === 'function') zip.file(chemin, changer(f ? await f.async(nom.endsWith('.json') ? 'string' : 'uint8array') : null));
    return new Blob([await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })]);
}

describe('E2 · le banc est sain', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monter(creerDb(), creerMagasin(creerDb()), { muter: { [MODULE]: (s) => s } })).toThrow(/Témoin inerte/);
    });
    it('après la suppression, le trimestre n\'est plus là ; ses séances vivantes restent (mesure du 4 oct.)', async () => {
        const banc = await preparer();
        expect([...banc.db._map.keys()].filter((k) => k.startsWith('h2032'))).toEqual([]);
        expect(banc.db._map.get('trimestres').map((t) => t.id)).toEqual(['a2032']);
        expect(SEANCES_H.every((k) => banc.db._map.has(k))).toBe(true);
    });
});

describe('E2 · (a) le trimestre revient entier et clos ; rien d\'autre n\'a changé', () => {
    it('fichiers partis : les quatre copies reviennent, les clés sont celles d\'avant, le registre gagne h2032 clos', async () => {
        const banc = await preparer();
        const avant = await photo(banc);
        const bilan = await emprunter(banc);
        expect(bilan).toMatchObject({ etat: 'fait', registre: true, nom: 'Hiver 2032' });
        expect(bilan.revenues.sort()).toEqual(COPIES_H);
        expect(bilan.seancesDejaLa).toEqual(SEANCES_H);
        for (const k of CLES_H) expect(banc.db._map.get(k)).toEqual(CORPUS[k]);
        for (const id of COPIES_H) expect(new Uint8Array(await banc.magasin._blobs.get(id).arrayBuffer())).toEqual(COPIES[id]);
        const registre = banc.db._map.get('trimestres');
        expect(registre[0]).toEqual(CORPUS.trimestres[1]);
        expect(registre[1]).toEqual({ id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' });

        // Rien d'autre : chaque clé hors du trimestre (sauf le registre), chaque fichier d'avant.
        const apres = await photo(banc);
        for (const k of Object.keys(avant.cles)) if (k !== 'trimestres') expect(apres.cles[k]).toBe(avant.cles[k]);
        const neuves = Object.keys(apres.cles).filter((k) => !(k in avant.cles));
        expect(neuves.sort()).toEqual(CLES_H.sort());
        for (const id of Object.keys(avant.copies)) expect(apres.copies[id]).toBe(avant.copies[id]);
        expect(apres.cles.profilEnseignant).toContain('apres@');
        expect(JSON.parse(apres.cles.a2032_groupeEtudiants)).toHaveLength(2);
    });

    it('l\'ordre : les fichiers d\'abord, puis les clés, le registre EN DERNIER ; aucune autre écriture', async () => {
        const banc = await preparer();
        await emprunter(banc);
        const j = banc.db.journal;
        const premiereCle = j.findIndex((x) => x.startsWith('set:'));
        expect(j.slice(0, premiereCle).every((x) => x.startsWith('copie:'))).toBe(true);
        expect(j.at(-1)).toBe('set:trimestres');
        expect(j.filter((x) => x.startsWith('set:')).map((x) => x.slice(4)).sort()).toEqual(CLES_H.concat(['trimestres']).sort());
        expect(j.some((x) => x.startsWith('remove:') || x.startsWith('retrait-copie:'))).toBe(false);
    });

    it('fichiers restés dans le navigateur (E0) et séances parties : copies « déjà là », séances réécrites', async () => {
        const banc = await preparer({ fichiersPartis: false, seancesParties: true });
        const bilan = await emprunter(banc);
        expect(bilan.etat).toBe('fait');
        expect(bilan.revenues).toEqual([]);
        expect(bilan.dejaLa.sort()).toEqual(COPIES_H);
        expect(bilan.seancesDejaLa).toEqual([]);
        for (const k of SEANCES_H) expect(banc.db._map.get(k)).toEqual(CORPUS[k]);
        expect(banc.db.journal.some((x) => x.startsWith('copie:'))).toBe(false);
    });

    it('la copie d\'un·e étudiant·e supprimé·e reste dans l\'archive (règle de « Faire revenir ») ; sa fiche revient', async () => {
        const db = creerDb(Object.assign(structuredClone(CORPUS), {
            h2032_elevesDesinscrits: [{ da: '0000002', date: '2032-02-01' }],
            h2032_groupeEtudiants: CORPUS.h2032_groupeEtudiants.filter((e) => e.da !== '0000002')
        }));
        const magasin = creerMagasin(db);
        const banc = monter(db, magasin);
        await banc.win.ReserveTrimestre.archiverTrimestre(TRIM, { sansConfirmation: true });
        const zip = banc.journal.telechargements.at(-1).blob;
        const RV = banc.win.ReserveVerifier;
        RV.retenirResultat(DOSSIER, await RV.verifierArchive(RV.sourceFichier(zip), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER));
        supprimer(db, TRIM);
        COPIES_H.forEach((id) => magasin._blobs.delete(id));
        const bilan = await banc.win.ReserveEmprunter.emprunter(RV.sourceFichier(zip), Object.assign({ dossier: DOSSIER }, banc.win.Reserve.lireManifesteLocal().archives[DOSSIER]));
        expect(bilan.etat).toBe('fait');
        expect(bilan.supprimes).toEqual(['FT_h2']);
        expect(magasin._blobs.has('FT_h2')).toBe(false);
        expect(db._map.get('h2032_fichiersTravaux').map((f) => f.id)).toContain('FT_h2');
    });

    it('le compte rendu dit le nom, les copies revenues, et où trouver le trimestre', async () => {
        const banc = await preparer();
        const cr = banc.win.ReserveEmprunter.compteRendu(await emprunter(banc));
        expect(cr.titre).toBe('Trimestre revenu');
        expect(cr.message).toContain('Hiver 2032 est revenu, clos');
        expect(cr.message).toContain('4 copies revenues');
    });
});

describe('E2 · les mots (acceptés par Grégoire le 4 oct. : « Faire revenir »)', () => {
    it('aucun « emprunt », « emprunter » ni « emprunté » dans un texte que l\'usager lit', () => {
        const { win } = monter(creerDb(), creerMagasin(creerDb()));
        const RE = win.ReserveEmprunter;
        const textes = [RE.MOTS.bouton, RE.MOTS.infobulle, RE.MOTS.enCours, RE.MOTS.fenetre.titre('Hiver 2032'),
            RE.MOTS.fenetre.texte({ nom: 'Hiver 2032', etudiants: 2, copies: 3 }), RE.MOTS.fenetre.confirmer];
        const bilans = [{ etat: 'fait', nom: 'Hiver 2032', revenues: ['a', 'b'], dejaLa: ['c'], supprimes: ['d'], sansFichier: ['e'] }];
        for (const motif of Object.keys(RE.MOTS.refus).filter((k) => k !== 'titre')) bilans.push({ etat: 'refus', motif, nom: 'Hiver 2032' });
        for (const motif of ['copieAbimee', 'nonEcrite', 'apparu']) {
            bilans.push({ etat: 'echec', motif, nom: 'Hiver 2032', resteEcrit: null });
            bilans.push({ etat: 'echec', motif, nom: 'Hiver 2032', resteEcrit: { cles: 2, copies: 1 } });
        }
        for (const b of bilans) { const cr = RE.compteRendu(b); textes.push(cr.titre, cr.message); }
        expect(textes.filter((t) => !t)).toEqual([]);
        expect(textes.filter((t) => /emprunt/i.test(t))).toEqual([]);
        expect(RE.MOTS.bouton).toBe('Faire revenir');
        expect(RE.MOTS.fenetre.titre('Hiver 2026')).toBe('Faire revenir Hiver 2026 ?');
        expect(RE.compteRendu(bilans[0]).titre).toBe('Trimestre revenu');
        expect(RE.compteRendu({ etat: 'refus', motif: 'dejaLa', nom: 'Hiver 2026' })).toEqual({
            titre: 'Impossible de faire revenir le trimestre',
            message: 'Hiver 2026 est déjà dans l\'application : ouvre-le depuis la bibliothèque des trimestres. Rien n\'a été écrit.'
        });
    });
});

describe('E2 · le marqueur de la garde #340 ne vit que le temps des clés', () => {
    it('posé à chaque écriture d\'une clé du trimestre, absent pendant les copies et le registre, retiré après', async () => {
        const banc = await preparer();
        const vus = [];
        const set = banc.db.set;
        banc.db.set = async (k, v) => { vus.push([k, banc.win.ReserveEmprunter.trimestreEnCours()]); return set(k, v); };
        const stocker = banc.magasin.stockerBlob;
        banc.magasin.stockerBlob = async function(id, b) { vus.push(['copie:' + id, banc.win.ReserveEmprunter.trimestreEnCours()]); return stocker.call(this, id, b); };
        expect((await emprunter(banc)).etat).toBe('fait');
        for (const [k, marque] of vus) expect([k, marque]).toEqual([k, k.startsWith('h2032_') ? 'h2032' : null]);
        expect(banc.win.ReserveEmprunter.trimestreEnCours()).toBe(null);
    });

    it('retiré aussi quand l\'écriture d\'une clé échoue', async () => {
        const banc = await preparer();
        banc.db.echouer = (k) => k === [...CLES_H].sort()[1];
        expect((await emprunter(banc)).etat).toBe('echec');
        expect(banc.win.ReserveEmprunter.trimestreEnCours()).toBe(null);
    });
});

describe('E2 · (b) les refus n\'écrivent RIEN', () => {
    async function refuse(banc, motif, fichier) {
        const avant = await photo(banc);
        const bilan = await emprunter(banc, fichier);
        expect(bilan).toMatchObject({ etat: 'refus', motif });
        expect(await photo(banc)).toEqual(avant);
        expect(banc.db.journal).toEqual([]);
        return bilan;
    }

    it('déjà au registre : « déjà là »', async () => {
        const banc = await preparer();
        banc.db._map.get('trimestres').push({ id: 'h2032', nom: 'Hiver 2032', archive: true });
        const bilan = await refuse(banc, 'dejaLa');
        expect(banc.win.ReserveEmprunter.compteRendu(bilan).message).toBe('Hiver 2032 est déjà dans l\'application : ouvre-le depuis la bibliothèque des trimestres. Rien n\'a été écrit.');
        expect(banc.win.ReserveEmprunter.refusDejaLaImmediat(TRIM)).toBe('dejaLa');
    });

    it('une seule clé h2032_* sans entrée au registre, que l\'archive n\'a pas : « débris »', async () => {
        const banc = await preparer();
        banc.db._map.set('h2032_presences', {});
        await refuse(banc, 'debris');
        // E3 (#1024) : le débris se juge contre l'archive, plus avant le sélecteur de fichier.
        expect(banc.win.ReserveEmprunter.refusDejaLaImmediat(TRIM)).toBe(null);
    });

    it('E3 : une clé h2032_* restée d\'un renvoi interrompu, mais DIFFÉRENTE de l\'archive : « débris »', async () => {
        const banc = await preparer();
        banc.db._map.set('h2032_productions', [{ id: 'P1', titre: 'Changée depuis', coursId: 'C1' }]);
        await refuse(banc, 'debris');
    });

    it('E3 : des clés h2032_* restées d\'un renvoi interrompu, IDENTIQUES à l\'archive : laissées, le reste revient', async () => {
        const banc = await preparer();
        banc.db._map.set('h2032_productions', structuredClone(CORPUS.h2032_productions));
        banc.db._map.set('h2032_groupesCours', structuredClone(CORPUS.h2032_groupesCours));
        const bilan = await emprunter(banc);
        expect(bilan.etat).toBe('fait');
        expect(bilan.clesDejaLa).toEqual(['h2032_groupesCours', 'h2032_productions']);
        expect(banc.db.journal).not.toContain('set:h2032_productions');
        for (const k of CLES_H) expect(banc.db._map.get(k)).toEqual(CORPUS[k]);
    });

    it('une clé voisine (h2032x_…) n\'est pas un débris', async () => {
        const banc = await preparer();
        banc.db._map.set('h2032x_bruit', [1]);
        expect((await emprunter(banc)).etat).toBe('fait');
    });

    it('une séance vivante restée, mais différente : « ne concorde pas »', async () => {
        const banc = await preparer();
        banc.db._map.set('seancesCompletes_gc_GC_H2', [{ id: 'S2', modifiee: true }]);
        await refuse(banc, 'differe');
    });

    it('une copie restée dans le navigateur, mais différente : « ne concorde pas »', async () => {
        const banc = await preparer({ fichiersPartis: false });
        banc.magasin._blobs.set('FT_h3', new Blob([octets(3 * 1024, 99)]));
        await refuse(banc, 'differe');
    });

    it('une archive non vérifiée dans ce navigateur', async () => {
        const banc = await preparer();
        const m = banc.win.Reserve.lireManifesteLocal();
        banc.win.Reserve.upsertEntreeManifeste(DOSSIER, Object.assign({}, m.archives[DOSSIER], { verification: undefined }));
        await refuse(banc, 'nonVerifiee');
    });

    it('meta.json changé depuis la vérification', async () => {
        const banc = await preparer();
        await refuse(banc, 'changeeDepuis', await remplacer(banc.zip, 'meta.json', (t) => t.replace('"notes"', '"notes_"')));
    });

    it('donnees.json changé depuis la vérification (une note)', async () => {
        const banc = await preparer();
        await refuse(banc, 'changeeDepuis', await remplacer(banc.zip, 'donnees.json', (t) => t.replace('"note":80', '"note":81')));
    });

    it('l\'archive d\'un groupe-cours n\'est pas celle d\'un trimestre', async () => {
        const banc = await preparer();
        const e = Object.assign(entree(banc), { type_archive: undefined });
        const avant = await photo(banc);
        expect((await banc.win.ReserveEmprunter.emprunter(banc.RV.sourceFichier(banc.zip), e)).motif).toBe('pasUnTrimestre');
        expect(await photo(banc)).toEqual(avant);
    });
});

/**
 * Une archive VÉRIFIÉE qui porte une clé globale : donnees.json et ses empreintes refaits de
 * façon cohérente (une archive fabriquée ailleurs), puis vérifiée. Seule la règle « à sa place »
 * l'arrête.
 */
async function archiveAvecCleGlobale(banc, cle = 'profilEnseignant', valeur = { nom: 'Profil glissé' }) {
    const zip = await JSZip.loadAsync(await banc.zip.arrayBuffer());
    const base = 'trimestres/' + DOSSIER + '/';
    const donnees = JSON.parse(await zip.file(base + 'donnees.json').async('string'));
    const meta = JSON.parse(await zip.file(base + 'meta.json').async('string'));
    donnees[cle] = valeur;
    const texte = JSON.stringify(donnees);
    const sha = async (s) => Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))).toString('hex');
    meta.integrite.cles_sha256[cle] = await sha(JSON.stringify(valeur));
    meta.integrite.donnees_json_sha256 = await sha(texte);
    zip.file(base + 'donnees.json', texte);
    zip.file(base + 'meta.json', JSON.stringify(meta, null, 2));
    const blob = new Blob([await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })]);
    const rapport = await banc.RV.verifierArchive(banc.RV.sourceFichier(blob), banc.win.Reserve.lireManifesteLocal().archives[DOSSIER], DOSSIER);
    expect(rapport.etat).toBe('verifiee');
    banc.RV.retenirResultat(DOSSIER, rapport);
    return blob;
}

describe('E2 · (c) une clé globale n\'entre jamais', () => {
    it('glissée dans une archive vérifiée : refus entier, le profil d\'aujourd\'hui reste', async () => {
        const banc = await preparer();
        const blob = await archiveAvecCleGlobale(banc);
        const avant = await photo(banc);
        const bilan = await emprunter(banc, blob);
        expect(bilan).toMatchObject({ etat: 'refus', motif: 'changeeDepuis' });
        expect(await photo(banc)).toEqual(avant);
        expect(banc.db._map.get('profilEnseignant').courriel).toBe('apres@exemple.test');
    });

    it('une clé globale ABSENTE de l\'espace (une bibliothèque) : refus entier, elle n\'est pas créée', async () => {
        const banc = await preparer();
        const blob = await archiveAvecCleGlobale(banc, 'bibliothequeEchelles', [{ id: 'X' }]);
        const avant = await photo(banc);
        expect(await emprunter(banc, blob)).toMatchObject({ etat: 'refus', motif: 'changeeDepuis' });
        expect(await photo(banc)).toEqual(avant);
    });
});

describe('E2 · (d) un échec en cours de route ne laisse que ce qu\'il y avait avant', () => {
    async function echoue(banc, motif, fichier) {
        const avant = await photo(banc);
        const bilan = await emprunter(banc, fichier);
        expect(bilan).toMatchObject({ etat: 'echec', motif, resteEcrit: null });
        expect(await photo(banc)).toEqual(avant);
        return bilan;
    }

    it('l\'espace refuse la troisième clé : les deux premières et les quatre copies sont retirées', async () => {
        const banc = await preparer();
        const triees = [...CLES_H].sort();
        banc.db.echouer = (k) => k === triees[2];
        const bilan = await echoue(banc, 'nonEcrite');
        expect(bilan.retire).toEqual({ cles: 3, copies: 4, registre: false });
        const j = banc.db.journal;
        // Ordre inverse : les clés, de la dernière écrite à la première, puis les copies.
        expect(j.filter((x) => x.startsWith('remove:'))).toEqual([triees[2], triees[1], triees[0]].map((k) => 'remove:' + k));
        expect(j.indexOf('remove:' + triees[0])).toBeLessThan(j.findIndex((x) => x.startsWith('retrait-copie:')));
    });

    it('l\'espace refuse le registre : toutes les clés et les copies sont retirées ; les séances restées ne sont pas touchées', async () => {
        const banc = await preparer();
        banc.db.echouer = (k) => k === 'trimestres';
        const bilan = await echoue(banc, 'nonEcrite');
        expect(bilan.retire).toMatchObject({ cles: CLES_H.length, copies: 4 });
        expect(banc.db.journal.some((x) => SEANCES_H.some((s) => x.endsWith(s)))).toBe(false);
    });

    it('l\'espace refuse une copie : rien ne reste', async () => {
        const banc = await preparer();
        banc.magasin.echouer = (id) => id === 'FT_h3';
        await echoue(banc, 'nonEcrite');
    });

    it('une copie de l\'archive altérée après la vérification : « copie abîmée », ce qui était écrit est retiré', async () => {
        const banc = await preparer();
        const nom = 'travaux/FT_hc.pdf';
        const blob = await remplacer(banc.zip, nom, (u8) => { const c = new Uint8Array(u8); c[100] ^= 0xFF; return c; });
        const bilan = await echoue(banc, 'copieAbimee', blob);
        expect(banc.win.ReserveEmprunter.compteRendu(bilan).message).toContain('l\'application est comme avant');
    });

    it('une copie absente de l\'archive : « copie abîmée »', async () => {
        const banc = await preparer();
        const zip = await JSZip.loadAsync(await banc.zip.arrayBuffer());
        zip.remove('trimestres/' + DOSSIER + '/travaux/FT_h3.pdf');
        await echoue(banc, 'copieAbimee', new Blob([await zip.generateAsync({ type: 'uint8array' })]));
    });
});

describe('E2 · (e) les témoins : chaque mutation rougit le banc', () => {
    async function avecMutation(muter, scenario) {
        const banc = await preparer({ muter: { [MODULE]: muter } });
        return scenario(banc);
    }

    const SANS_PLACE = (s) => s.replace("if (cle.indexOf(prefixe) !== 0 && !seancesPermises[cle]) return refus('changeeDepuis');", '');

    it('une clé globale écrite (la règle « à sa place » retirée) : la bibliothèque glissée est créée', async () => {
        const glissee = await avecMutation(SANS_PLACE, async (banc) => {
            await emprunter(banc, await archiveAvecCleGlobale(banc, 'bibliothequeEchelles', [{ id: 'X' }]));
            return banc.db._map.get('bibliothequeEchelles');
        });
        expect(glissee).toEqual([{ id: 'X' }]); // le banc (c) aurait rougi
    });

    it('sans la règle « à sa place », une clé globale DÉJÀ là et différente est encore arrêtée (« ne concorde pas »)', async () => {
        const bilan = await avecMutation(SANS_PLACE, async (banc) => emprunter(banc, await archiveAvecCleGlobale(banc)));
        expect(bilan).toMatchObject({ etat: 'refus', motif: 'differe' });
    });

    it('le registre écrit avant les clés : l\'ordre du journal le dit', async () => {
        const journal = await avecMutation(
            (s) => {
                const debut2 = s.indexOf('        // 2. Les clés du trimestre');
                const debut3 = s.indexOf('        // 3. EN DERNIER');
                const fin3 = s.indexOf('        if (typeof window.db.flush', debut3);
                if (debut2 < 0 || debut3 < 0 || fin3 < 0) return s;
                return s.slice(0, debut2) + s.slice(debut3, fin3) + s.slice(debut2, debut3) + s.slice(fin3);
            },
            async (banc) => { await emprunter(banc); return banc.db.journal; }
        );
        expect(journal.at(-1)).not.toBe('set:trimestres'); // le banc (a) « registre EN DERNIER » aurait rougi
    });

    it('l\'empreinte de meta.json non recomparée : l\'archive changée passe', async () => {
        const etat = await avecMutation(
            (s) => s.replace("if ((await RV.sha256Texte(metaTexte)) !== entree.verification.meta_sha256) return refus('changeeDepuis');", ''),
            async (banc) => (await emprunter(banc, await remplacer(banc.zip, 'meta.json', (t) => t.replace('"notes"', '"notes_"')))).etat
        );
        expect(etat).toBe('fait');
    });

    // Les données ont TROIS verrous : l'empreinte de donnees.json, celle de chaque clé avant
    // l'écriture, et la relecture de chaque clé écrite, comparée à l'empreinte de l'archive.
    const SANS_EMPREINTE_FICHIER = (s) => s.replace("if (donneesTexte == null || (await RV.sha256Texte(donneesTexte)) !== integrite.donnees_json_sha256) return refus('changeeDepuis');",
        "if (donneesTexte == null) return refus('changeeDepuis');");
    const SANS_EMPREINTE_CLE = (s) => s.replace("if ((await RV.sha256Texte(JSON.stringify(donnees[cle]))) !== empreintesCles[cle]) return refus('changeeDepuis');", '');
    const SANS_RELECTURE = (s) => s.replace("if ((await RV.sha256Texte(JSON.stringify(relue))) !== empreintesCles[cleE]) throw new Abandon('nonEcrite');", '');
    const noteApres = async (banc) => {
        await emprunter(banc, await remplacer(banc.zip, 'donnees.json', (t) => t.replace('"note":80', '"note":81')));
        const ev = banc.db._map.get('h2032_evaluationsSauvegardees');
        return ev ? ev[0].note : null;
    };

    it('les empreintes des données non recomparées (les trois verrous) : la note changée entre', async () => {
        expect(await avecMutation((s) => SANS_RELECTURE(SANS_EMPREINTE_CLE(SANS_EMPREINTE_FICHIER(s))), noteApres)).toBe(81);
    });

    it('un seul verrou retiré : les autres arrêtent encore la note changée', async () => {
        for (const m of [SANS_EMPREINTE_FICHIER, SANS_EMPREINTE_CLE, SANS_RELECTURE]) expect(await avecMutation(m, noteApres)).toBe(null);
    });

    it('l\'empreinte d\'une copie non recomparée : la copie altérée entre', async () => {
        const octetsEntres = await avecMutation(
            (s) => s.replace("if (empreinte !== empreintesCopies[a.nom]) throw new Abandon('copieAbimee');", ''),
            async (banc) => {
                const blob = await remplacer(banc.zip, 'travaux/FT_hc.pdf', (u8) => { const c = new Uint8Array(u8); c[100] ^= 0xFF; return c; });
                await emprunter(banc, blob);
                const b = banc.magasin._blobs.get('FT_hc');
                return b ? new Uint8Array(await b.arrayBuffer()) : null;
            }
        );
        expect(octetsEntres).not.toBeNull();
        expect(octetsEntres[100]).toBe(COPIES.FT_hc[100] ^ 0xFF);
    });
});
