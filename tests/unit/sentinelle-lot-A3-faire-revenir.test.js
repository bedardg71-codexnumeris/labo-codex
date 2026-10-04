import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE DU LOT A3 (CHANTIER DES ARCHIVES) — FAIRE REVENIR DES COPIES (#1000)
// =====================================================================
//
// Consigne de Cowork du 4 oct. 2026 (12 h 19) : depuis une archive vérifiée dans ce navigateur,
// « Faire revenir » remet le fichier de chaque copie sous sa fiche. Il ne remplace rien et
// n'efface rien ; l'empreinte de chaque copie est recomparée AU MOMENT DU GESTE.
//
// CE QUE CE BANC JUGE (point 4 de la consigne), sur une archive du VRAI rédacteur (lot A1),
// vérifiée par le VRAI vérificateur (lot A2) :
//   (a) chaque cas du point 2 : revenue, déjà là, changée, sans fiche, élève supprimé, abîmée ;
//       une fiche « manquant » redevient présente (#997), par le geste seulement ;
//   (b) les octets revenus sont ceux de l'archive ; rien d'autre n'a bougé dans l'espace
//       (toutes les clés, le magasin des copies) ;
//   (c) le geste est refusé pour une archive non vérifiée, d'une autre archive, ou changée depuis
//       sa vérification ; il ne lit jamais le fichier entier ;
//   (d) le mode dossier (Chrome, Edge) rend aussi ;
//   (e) les mots provisoires sont ceux que l'usager lit.
//
// TÉMOINS (mutations de la source, démontrées rouges ici même) : la recomparaison de l'empreinte
// de l'archive retirée ; le cas « empreinte différente » qui remplace ; la recomparaison de la
// copie du navigateur retirée ; la garde des élèves supprimés ; la garde « vérifiée » ; la garde
// « changée depuis la vérification ».
//
// CE QU'IL NE JUGE PAS : le vrai bouton, la vraie fenêtre, le codex, l'iPad (spec WebKit
// lot-a3-faire-revenir.spec.js) ; le pic de mémoire (mesure de la demande de relecture).
// Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };

const TRIMESTRE = 'a2026';
const GC = 'GC_A3';
const DOSSIER = 'a2026-601-101-gr00007';
const CLE_REGISTRE = '_manifesteReserve';
const CLE_FT = TRIMESTRE + '_fichiersTravaux';

function creerDb(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        _map: map,
        get: async (k, def = null) => (map.has(k) ? structuredClone(map.get(k)) : def),
        set: async (k, v) => { map.set(k, structuredClone(v)); },
        keys: async () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); }
    };
}

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

// Huit copies, une par cas ; toutes présentes à l'archivage.
const IDS = ['FT_r1', 'FT_r2', 'FT_r3', 'FT_c4', 'FT_d5', 'FT_s6', 'FT_a7', 'FT_ok8'];
const COPIES = Object.fromEntries(IDS.map((id, i) => [id, octets(20000 + i * 3001, 31 + i)]));
const fiche = (id, i) => ({
    id, nomFichier: 'copie-fictive-' + (i + 1) + '.pdf', typeMIME: 'application/pdf',
    etudiantDA: '000000' + (i + 1), productionId: 'P1', groupeCoursId: GC,
    tailleFichier: COPIES[id].length, blobStatut: 'present'
});
const CORPUS = {
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }],
    a2026_groupesCours: [{ id: GC, coursId: 'C1', groupeNum: '7', nom: 'A2026-601-101-MQ-00007' }],
    a2026_groupeEtudiants: IDS.map((id, i) => ({ da: '000000' + (i + 1), nom: 'Élève fictif ' + (i + 1), groupe: '7' })),
    a2026_productions: [{ id: 'P1', titre: 'Production fictive' }],
    a2026_fichiersTravaux: IDS.map(fiche)
};

/** Le magasin des copies, en mémoire, avec le journal de ses écritures. */
function creerMagasin() {
    const blobs = new Map(Object.entries(COPIES).map(([id, u]) => [id, new Blob([u])]));
    const ecritures = [];
    return {
        _blobs: blobs, _ecritures: ecritures,
        recupererBlob: async (id) => (blobs.has(id) ? blobs.get(id) : null),
        stockerBlob: async (id, blob) => { ecritures.push(id); blobs.set(id, blob); }
    };
}

/** dasElevesEcartes, la VRAIE (import-export.js), extraite telle quelle. */
function chargerDasElevesEcartes() {
    const source = readFileSync(path.join(racine, 'js/import-export.js'), 'utf8');
    const m = source.match(/function dasElevesEcartes\([\s\S]*?\n}\n/);
    if (!m) throw new Error('dasElevesEcartes introuvable dans import-export.js');
    return new Function(m[0] + '\nreturn dasElevesEcartes;')();
}

function fauxDossier(nom) {
    const enfants = new Map();
    const fichiers = new Map();
    const absent = () => Object.assign(new Error('absent'), { name: 'NotFoundError' });
    const poignee = (n) => ({
        kind: 'file', name: n,
        async createWritable() {
            let contenu;
            return {
                async write(x) { contenu = x; },
                async close() { fichiers.set(n, contenu instanceof Blob ? contenu : new Blob([contenu])); },
                async abort() {}
            };
        },
        async getFile() { return fichiers.get(n); }
    });
    return {
        kind: 'directory', name: nom, _enfants: enfants, _fichiers: fichiers,
        async queryPermission() { return 'granted'; },
        async requestPermission() { return 'granted'; },
        async getDirectoryHandle(n, o) {
            if (!enfants.has(n)) { if (!o || !o.create) throw absent(); enfants.set(n, fauxDossier(n)); }
            return enfants.get(n);
        },
        async getFileHandle(n, o) {
            if (!fichiers.has(n)) { if (!o || !o.create) throw absent(); fichiers.set(n, new Blob([])); }
            return poignee(n);
        },
        async *entries() {
            for (const n of enfants.keys()) yield [n, enfants.get(n)];
            for (const n of fichiers.keys()) yield [n, poignee(n)];
        }
    };
}

/** Monte fichier-sortant.js, reserve.js, reserve-verifier.js et reserve-revenir.js dans un même bac à sable. */
function monter(db, options = {}) {
    const journal = { notifications: [], fenetres: [], confirmations: [], telechargements: [], selecteurs: 0 };
    const adresses = new Map();
    const FauxURL = {
        createObjectURL(blob) { const u = 'blob:banc/' + (adresses.size + 1); adresses.set(u, blob); return u; },
        revokeObjectURL() {}
    };
    const fauxSetTimeout = (cb, delai) => ((delai || 0) >= 60000 ? 0 : setTimeout(cb, 0));
    const doc = {
        readyState: 'loading', getElementById: () => null,
        createElement: () => ({
            style: {}, addEventListener() {},
            click() { if (this.href) journal.telechargements.push({ nom: this.download, blob: adresses.get(this.href) }); else journal.selecteurs++; }
        }),
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    const magasin = options.magasin || creerMagasin();
    const win = {
        addEventListener: () => {}, dispatchEvent: () => {},
        afficherProgression: () => {}, majProgression: () => {}, masquerProgression: () => {},
        VERSION_MAJEURE: '1.180.0-banc', db,
        travauxStockage: magasin,
        dasElevesEcartes: chargerDasElevesEcartes(),
        signalerEcritureUsager: (c) => { journal.signaux = (journal.signaux || []).concat(c); },
        uiDialogues: {
            confirmerAction: async (o) => { journal.confirmations.push(o); return options.confirmer !== false; },
            demanderAction: async () => null,
            informer: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message }); }
        },
        JSZip: Object.assign(function JSZipBanc() { return new JSZip(); }, {
            loadAsync: () => { throw new Error('JSZip.loadAsync appelé : le fichier entier serait lu'); }
        })
    };
    if (options.dossier) win.showDirectoryPicker = async () => options.dossier;
    const notifications = {};
    for (const type of ['succes', 'erreur', 'info', 'warning']) notifications[type] = (titre, message) => journal.notifications.push({ type, titre, message });

    monterFichierSortant(win, { document: doc, setTimeout: fauxSetTimeout, URL: FauxURL });
    const charger = (fichier) => {
        const brut = readFileSync(path.join(racine, fichier), 'utf8');
        const code = options.muter && options.muter[fichier] ? options.muter[fichier](brut) : brut;
        if (options.muter && options.muter[fichier] && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans ' + fichier);
        new Function(
            'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
            'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
            '"use strict";\n' + code
        )(win, doc, consoleSandbox, db, notifications, win.JSZip, (cb) => setTimeout(cb, 0),
            fauxSetTimeout, { userAgent: 'BacASable/lot-A3 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    };
    charger('js/reserve.js');
    charger('js/reserve-verifier.js');
    charger('js/reserve-revenir.js');
    const registre = () => (db.getSync(CLE_REGISTRE, null) || { archives: {} }).archives;
    return { win, reserve: win.Reserve, verifier: win.ReserveVerifier, revenir: win.ReserveRevenir, journal, registre, db, magasin };
}

/** Un ZIP tel que l'usager le désigne : un Blob qui refuse d'être lu en entier. */
function fichierSurveille(blob) {
    const surveiller = (b) => new Proxy(b, {
        get(cible, prop) {
            if (prop === 'arrayBuffer') return () => { throw new Error('arrayBuffer() sur le fichier entier'); };
            if (prop === 'stream') return () => { throw new Error('stream() sur le fichier entier'); };
            const v = cible[prop];
            return typeof v === 'function' ? v.bind(cible) : v;
        }
    });
    return surveiller(blob);
}

/** Altère un octet de la copie `id` À L'INTÉRIEUR du ZIP (rangée telle quelle) : l'archive est abîmée. */
async function abimerDansLeZip(blob, id) {
    const u8 = new Uint8Array(await blob.arrayBuffer());
    const debut = COPIES[id].subarray(0, 64);
    let pos = -1;
    for (let i = 0; i <= u8.length - debut.length && pos < 0; i++) {
        let ok = true;
        for (let j = 0; j < debut.length; j++) if (u8[i + j] !== debut[j]) { ok = false; break; }
        if (ok) pos = i;
    }
    if (pos < 0) throw new Error('copie introuvable dans le ZIP');
    u8[pos + 1000] ^= 0xFF;
    return new Blob([u8], { type: 'application/zip' });
}

const instantane = (db) => JSON.stringify([...db._map.entries()].filter(([k]) => k !== CLE_FT).sort());
const octetsDuMagasin = async (magasin, id) => new Uint8Array(await magasin._blobs.get(id).arrayBuffer());

/**
 * Le scénario de la consigne : archiver (mode fichier), vérifier, puis préparer chaque cas, puis
 * faire revenir. Rend tout ce qu'il faut pour juger.
 */
async function scenario(options = {}) {
    const db = creerDb(CORPUS);
    const banc = monter(db, options);
    const rendu = await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
    expect(rendu && rendu.succes).toBe(true);
    const zipSain = banc.journal.telechargements[banc.journal.telechargements.length - 1].blob;
    const verif = await banc.verifier.verifierArchive(banc.verifier.sourceFichier(zipSain), banc.registre()[DOSSIER], DOSSIER);
    expect(verif.etat).toBe('verifiee');
    banc.verifier.retenirResultat(DOSSIER, verif);

    // Les cas, préparés au banc seulement.
    const m = banc.magasin._blobs;
    m.delete('FT_r1');                                                    // revient
    m.delete('FT_r2');                                                    // revient, fiche « manquant »
    m.set('FT_c4', new Blob([octets(COPIES.FT_c4.length, 999)]));         // changée depuis l'archive
    m.delete('FT_d5');                                                    // élève supprimé
    m.delete('FT_s6');                                                    // sans fiche
    m.delete('FT_a7');                                                    // abîmée dans l'archive
    const liste = db.getSync(CLE_FT).map((f) => ({ ...f }));
    liste.find((f) => f.id === 'FT_r2').blobStatut = 'manquant';
    liste.find((f) => f.id === 'FT_r3').blobStatut = 'manquant';           // #997 : fichier là, fiche « manquant »
    db.setSync(CLE_FT, liste.filter((f) => f.id !== 'FT_s6'));
    db.setSync(TRIMESTRE + '_groupeEtudiants', db.getSync(TRIMESTRE + '_groupeEtudiants').filter((e) => e.da !== '0000005'));
    db.setSync(TRIMESTRE + '_elevesDesinscrits', [{ da: '0000005', date: '2026-10-02' }]);
    const zip = await abimerDansLeZip(zipSain, 'FT_a7');
    const c4Avant = await octetsDuMagasin(banc.magasin, 'FT_c4');

    const avant = instantane(db);
    const listeAvant = structuredClone(db.getSync(CLE_FT));
    banc.magasin._ecritures.length = 0;
    const entree = Object.assign({ dossier: DOSSIER }, options.entree ? options.entree(banc.registre()[DOSSIER]) : banc.registre()[DOSSIER]);
    const bilan = await banc.revenir.faireRevenir(banc.verifier.sourceFichier(fichierSurveille(zip)), entree);
    return { banc, db, bilan, avant, listeAvant, c4Avant };
}

describe('Lot A3 — faire revenir les copies d\'une archive vérifiée', () => {
    it('(a) chaque cas donne ce qu\'il doit', async () => {
        const { bilan } = await scenario();
        expect(bilan.etat).toBe('fait');
        expect(bilan.total).toBe(8);
        expect(bilan.revenues.sort()).toEqual(['FT_r1', 'FT_r2']);
        expect(bilan.dejaLa.sort()).toEqual(['FT_ok8', 'FT_r3']);
        expect(bilan.changees).toEqual(['FT_c4']);
        expect(bilan.sansFiche).toEqual(['FT_s6']);
        expect(bilan.supprimes).toEqual(['FT_d5']);
        expect(bilan.abimees).toEqual(['FT_a7']);
        expect(bilan.nonEcrites).toEqual([]);
        expect(bilan.fichesRemises).toBe(2);
    });

    it('(b) les octets revenus sont ceux de l\'archive ; seuls r1 et r2 sont écrits ; la copie changée reste telle quelle', async () => {
        const { banc, c4Avant } = await scenario();
        expect(banc.magasin._ecritures.sort()).toEqual(['FT_r1', 'FT_r2']);
        for (const id of ['FT_r1', 'FT_r2']) expect(sha(await octetsDuMagasin(banc.magasin, id))).toBe(sha(COPIES[id]));
        expect(sha(await octetsDuMagasin(banc.magasin, 'FT_c4'))).toBe(sha(c4Avant));
        for (const id of ['FT_d5', 'FT_s6', 'FT_a7']) expect(banc.magasin._blobs.has(id)).toBe(false);
    });

    it('(b) rien d\'autre n\'a bougé dans l\'espace : seules les fiches r2 et r3 passent de « manquant » à « present »', async () => {
        const { db, avant, listeAvant, banc } = await scenario();
        expect(instantane(db)).toBe(avant);
        const apres = db.getSync(CLE_FT);
        expect(apres.length).toBe(listeAvant.length);
        apres.forEach((f, i) => {
            const attendu = ['FT_r2', 'FT_r3'].includes(f.id) ? { ...listeAvant[i], blobStatut: 'present' } : listeAvant[i];
            expect(f).toEqual(attendu);
        });
        expect(banc.journal.signaux).toEqual([CLE_FT]);
    });

    it('(c) refusé pour une archive d\'un autre uuid, ou changée depuis la vérification : rien n\'est écrit', async () => {
        const autre = await scenario({ entree: (e) => ({ ...e, uuid: 'autre-uuid' }) });
        expect(autre.bilan).toMatchObject({ etat: 'refus', motif: 'autreArchive' });
        expect(autre.banc.magasin._ecritures).toEqual([]);
        expect(instantane(autre.db)).toBe(autre.avant);

        const changee = await scenario({ entree: (e) => ({ ...e, verification: { ...e.verification, meta_sha256: '0'.repeat(64) } }) });
        expect(changee.bilan).toMatchObject({ etat: 'refus', motif: 'changeeDepuis' });
        expect(changee.banc.magasin._ecritures).toEqual([]);
    });

    it('(c) le bouton d\'une archive non vérifiée refuse, sans ouvrir de sélecteur', async () => {
        const db = creerDb(CORPUS);
        const banc = monter(db);
        await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER]).verifiee).toBe(false);
        banc.revenir.actionFaireRevenir(DOSSIER);
        await new Promise((r) => setTimeout(r, 0));
        expect(banc.journal.selecteurs).toBe(0);
        expect(banc.journal.fenetres).toEqual([{ titre: banc.revenir.MOTS.refus.titre, message: banc.revenir.MOTS.refus.nonVerifiee }]);
    });

    it('(d) le mode dossier rend aussi, octet pour octet', async () => {
        const db = creerDb(CORPUS);
        const dossier = fauxDossier('Archives_LaboCodex');
        const banc = monter(db, { dossier });
        const rendu = await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        expect(rendu.mode).toBe('fsapi');
        const verif = await banc.verifier.verifierArchive(banc.verifier.sourceDossier(dossier, DOSSIER), banc.registre()[DOSSIER], DOSSIER);
        expect(verif.etat).toBe('verifiee');
        banc.verifier.retenirResultat(DOSSIER, verif);
        banc.magasin._blobs.delete('FT_r1');
        banc.magasin._ecritures.length = 0;
        const bilan = await banc.revenir.faireRevenir(banc.verifier.sourceDossier(dossier, DOSSIER), banc.registre()[DOSSIER]);
        expect(bilan.revenues).toEqual(['FT_r1']);
        expect(bilan.dejaLa.length).toBe(7);
        expect(sha(await octetsDuMagasin(banc.magasin, 'FT_r1'))).toBe(sha(COPIES.FT_r1));
    });

    it('(e) le bilan dit l\'archive abîmée EN TÊTE, puis les nombres, avec les mots provisoires', async () => {
        const { banc, bilan } = await scenario();
        const cr = banc.revenir.compteRendu(bilan);
        expect(cr.titre).toBe('Copies revenues, archive abîmée');
        expect(cr.message.split('\n')).toEqual([
            '1 copie de l\'archive est abîmée : elle n\'est pas revenue. Vérifie de nouveau cette archive.',
            '',
            '2 copies revenues',
            '2 copies déjà là',
            '1 copie changée depuis l\'archive, laissée telle quelle',
            '1 copie sans fiche dans l\'application',
            '1 copie d\'un élève supprimé'
        ]);
    });
});

// ---------------------------------------------------------------------
// TÉMOINS : chaque garde retirée de la source fait rougir son invariant.
// ---------------------------------------------------------------------
const muterRevenir = (de, vers) => ({ muter: { 'js/reserve-revenir.js': (s) => s.replace(de, vers) } });

describe('Lot A3 — témoins (mutations démontrées rouges)', () => {
    it('M1 — sans la recomparaison de l\'empreinte de l\'archive, la copie abîmée est écrite', async () => {
        const { banc, bilan } = await scenario(muterRevenir(
            'if (empreinteArchive !== empreintes[nom]) { bilan.abimees.push(id); continue; }', ''));
        expect(bilan.abimees).toEqual([]);
        expect(banc.magasin._ecritures).toContain('FT_a7');
    });

    it('M2 — le cas « empreinte différente » qui remplace : la copie changée est écrasée', async () => {
        const { banc, c4Avant } = await scenario(muterRevenir(
            'bilan.changees.push(id);',
            'bilan.changees.push(id); await window.travauxStockage.stockerBlob(id, new Blob([(await source.lireCopie(nom)).octets]), \'\', \'\');'));
        expect(banc.magasin._ecritures).toContain('FT_c4');
        expect(sha(await octetsDuMagasin(banc.magasin, 'FT_c4'))).not.toBe(sha(c4Avant));
    });

    it('M3 — sans la recomparaison de la copie du navigateur, la copie changée se dit « déjà là »', async () => {
        const { bilan } = await scenario(muterRevenir('if (empreinteIci === empreintes[nom]) {', 'if (true) {'));
        expect(bilan.changees).toEqual([]);
        expect(bilan.dejaLa).toContain('FT_c4');
    });

    it('M4 — sans la garde des élèves supprimés, la copie de l\'élève supprimé revient', async () => {
        const { banc } = await scenario(muterRevenir('supprimes.has(String(fiche.etudiantDA))', 'false'));
        expect(banc.magasin._ecritures).toContain('FT_d5');
    });

    it('M5 — sans la garde « changée depuis la vérification », le geste écrit quand même', async () => {
        const { bilan, banc } = await scenario(Object.assign(
            muterRevenir('if (v.meta_sha256 && (await RV.sha256Texte(metaTexte)) !== v.meta_sha256) {', 'if (false) {'),
            { entree: (e) => ({ ...e, verification: { ...e.verification, meta_sha256: '0'.repeat(64) } }) }));
        expect(bilan.etat).toBe('fait');
        expect(banc.magasin._ecritures.length).toBeGreaterThan(0);
    });

    it('M6 — sans la garde « vérifiée » du bouton, une archive non vérifiée ouvre le sélecteur', async () => {
        const db = creerDb(CORPUS);
        const banc = monter(db, muterRevenir('if (!RV.etatVerification(entree).verifiee) {', 'if (false) {'));
        await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        banc.revenir.actionFaireRevenir(DOSSIER);
        await new Promise((r) => setTimeout(r, 0));
        expect(banc.journal.selecteurs).toBe(1);
    });
});
