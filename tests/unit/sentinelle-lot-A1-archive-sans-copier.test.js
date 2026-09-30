import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE DU LOT A1 (CHANTIER DES ARCHIVES) — UNE ARCHIVE FABRIQUÉE COMME LE CODEX
// =====================================================================
//
// Mesuré le 30 sept. 2026 sous WebKit (plans de travail/MESURE-2026-09-30-archives.md § 2) :
// « Archiver… » sur le plus gros groupe réel (205 copies, 607 Mo) prenait 3,4 Go de mémoire
// et posait 0,6 Go sur le disque avant d'écrire, libérait l'adresse du fichier aussitôt, et
// annonçait « Groupe archivé » sans savoir si le fichier était arrivé. Depuis le lot :
//   - en mode fichier (Safari), les copies ne passent plus par JSZip : l'archive est
//     assemblée par `FichierSortant.assemblerZip` (la pièce du lot J0, sortie de codex.js) ;
//   - l'archive porte une empreinte SHA-256 par copie (`meta.integrite.travaux_sha256`),
//     dans les deux modes (fichier et dossier) ;
//   - l'adresse du fichier n'est libérée qu'après cinq minutes, et l'archive n'entre au
//     registre qu'après le « Il y est » de l'usager (le parcours du codex téléchargé).
//
// CE QUE CE BANC JUGE :
//   (a) le format n'a pas bougé : mêmes entrées, mêmes octets qu'une archive au format de
//       1.171.0 (rédacteur de référence figé), relue par JSZip en VÉRIFIANT les CRC ;
//   (b) chaque empreinte portée égale l'empreinte recalculée de la copie, dans les deux modes ;
//   (c) la Défense K et l'aperçu voient toujours les copies, dans l'ordre d'avant ;
//   (d) une copie à la fois : jamais confiée à JSZip, son tampon rendu avant la suivante ;
//   (e) sans confirmation, rien au registre et pas de « Groupe archivé » ; l'adresse du
//       fichier n'est pas libérée aussitôt ; le mode dossier ne gagne que l'empreinte.
//
// CE QU'IL NE JUGE PAS : le pic de mémoire ni le disque (Node n'est pas WebKit : voir la
// demande de relecture du lot), ni ce que fait Safari du téléchargement (porte terrain).
//
// TÉMOINS : chaque invariant a le sien, par mutation des sources EN MÉMOIRE ; une mutation
// qui ne remplace rien est refusée (« Témoin inerte »). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const consoleSandbox = {
    log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {}
};

/** Node 20 (le runner) n'a pas `ArrayBuffer.prototype.transfer` : les bancs qui en dépendent sautent. */
const TRANSFERT = typeof ArrayBuffer.prototype.transfer === 'function';

const TRIMESTRE = 'a2026';
const GC = 'GC_A1';
const DOSSIER = 'a2026-601-101-gr00007';
const BASE = 'trimestres/' + DOSSIER + '/';
const CLE_REGISTRE = '_manifesteReserve';

function creerDb(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        _map: map,
        get: async (k, def = null) => (map.has(k) ? map.get(k) : def),
        set: async (k, v) => { map.set(k, v); },
        keys: async () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); }
    };
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
const MO = 1024 * 1024;

// Une copie plus grosse que deux tranches de CRC (4 Mo) ; une copie vide ; un nom sans
// extension ; une extension en majuscules ; une fiche sans fichier (« manquante ») ; la même
// copie citée deux fois ; et une copie d'un AUTRE groupe, qui ne doit pas partir.
const COPIES = {
    FT_a1_a: octets(70 * 1024, 1),
    FT_a1_photo: octets(33 * 1024 + 7, 2),
    FT_a1_grosse: octets(9 * MO + 123, 3),
    FT_a1_vide: new Uint8Array(0),
    FT_a1_sansext: octets(512, 5),
    FT_a1_autre_groupe: octets(2048, 6)
};
const NOM_DE = {
    FT_a1_a: 'FT_a1_a.pdf', FT_a1_photo: 'FT_a1_photo.jpeg', FT_a1_grosse: 'FT_a1_grosse.pdf',
    FT_a1_vide: 'FT_a1_vide.png', FT_a1_sansext: 'FT_a1_sansext.bin'
};
const CORPUS = {
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }],
    a2026_groupesCours: [
        { id: GC, coursId: 'C1', groupeNum: '7', nom: 'A2026-601-101-MQ-00007' },
        { id: 'GC_AUTRE', coursId: 'C1', groupeNum: '8', nom: 'A2026-601-101-MQ-00008' }
    ],
    a2026_groupeEtudiants: [
        { da: '0000001', nom: 'Élève fictif Un', groupe: '7' },
        { da: '0000002', nom: 'Élève fictive Deux', groupe: '7' },
        { da: '0000003', nom: 'Élève fictif Trois', groupe: '8' }
    ],
    a2026_productions: [{ id: 'P1', titre: 'Production fictive' }],
    a2026_fichiersTravaux: [
        { id: 'FT_a1_a', nomFichier: 'copie-fictive-a.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_photo', nomFichier: 'photo-fictive.JPEG', etudiantDA: '0000002', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_grosse', nomFichier: 'grosse-copie-fictive.pdf', etudiantDA: '0000002', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_vide', nomFichier: 'vide.png', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_sansext', nomFichier: 'sansextension', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_partie', nomFichier: 'partie.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_a', nomFichier: 'copie-fictive-a.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: GC },
        { id: 'FT_a1_autre_groupe', nomFichier: 'autre.pdf', etudiantDA: '0000003', productionId: 'P1', groupeCoursId: 'GC_AUTRE' }
    ]
};
// L'ordre que la Défense K et l'aperçu recevaient avant le lot : les copies sous leur dossier.
const NOMS_ATTENDUS = [
    'trimestres/', BASE, BASE + 'donnees.json', BASE + 'travaux/',
    BASE + 'travaux/FT_a1_a.pdf', BASE + 'travaux/FT_a1_photo.jpeg', BASE + 'travaux/FT_a1_grosse.pdf',
    BASE + 'travaux/FT_a1_vide.png', BASE + 'travaux/FT_a1_sansext.bin',
    BASE + 'meta.json', BASE + 'manifeste-archives-patch.json', 'manifeste-archives.json'
];

const magasinDuCorpus = (Classe = Blob) => {
    const blobs = new Map(Object.entries(COPIES).map(([id, u]) => [id, new Classe([u])]));
    return { _blobs: blobs, recupererBlob: async (id) => (blobs.has(id) ? blobs.get(id) : null) };
};

/** Un dossier du disque, en mémoire : ce que le mode dossier (Chrome, Edge) reçoit. */
function fauxDossier(nom, ecritures, chemin = '') {
    const enfants = new Map();
    const fichiers = new Map();
    const absent = () => Object.assign(new Error('absent'), { name: 'NotFoundError' });
    return {
        name: nom, _enfants: enfants, _fichiers: fichiers,
        async getDirectoryHandle(n, o) {
            if (!enfants.has(n)) { if (!o || !o.create) throw absent(); enfants.set(n, fauxDossier(n, ecritures, chemin + n + '/')); }
            return enfants.get(n);
        },
        async getFileHandle(n, o) {
            if (!fichiers.has(n)) { if (!o || !o.create) throw absent(); fichiers.set(n, null); }
            return {
                async createWritable() {
                    let contenu;
                    return { async write(x) { contenu = x; }, async close() { fichiers.set(n, contenu); ecritures.push(chemin + n); }, async abort() {} };
                },
                async getFile() { const c = fichiers.get(n); return { text: async () => (typeof c === 'string' ? c : c.text()) }; }
            };
        }
    };
}

/**
 * Monte `js/fichier-sortant.js` puis `js/reserve.js` dans un bac à sable. `journal` consigne
 * ce que l'usager verrait : notifications, fenêtres, téléchargements, adresses libérées.
 */
function monterReserve(db, options = {}) {
    const journal = { notifications: [], fenetres: [], telechargements: [], liberations: [], differes: [], ecritures: [] };
    const reponses = Object.assign({ confirmer: [], action: [] }, options.reponses);
    const registre = () => Object.keys((db.getSync(CLE_REGISTRE, null) || {}).archives || {});
    const succes = () => journal.notifications.filter((n) => n.type === 'succes').length;

    const adresses = new Map();
    const FauxURL = {
        createObjectURL(blob) { const u = 'blob:banc/' + (adresses.size + 1); adresses.set(u, blob); return u; },
        revokeObjectURL(u) { journal.liberations.push(u); }
    };
    // Une minuterie longue (la libération de l'adresse) est consignée, pas exécutée.
    const fauxSetTimeout = (cb, delai) => {
        if ((delai || 0) >= 60000) { journal.differes.push({ cb, delai }); return 0; }
        return setTimeout(cb, 0);
    };
    const doc = {
        readyState: 'loading',
        getElementById: () => null,
        createElement: () => ({
            click() {
                journal.telechargements.push({
                    nom: this.download, blob: adresses.get(this.href),
                    adresseDejaLiberee: journal.liberations.includes(this.href)
                });
            }
        }),
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    const win = {
        addEventListener: () => {}, dispatchEvent: () => {},
        afficherProgression: () => {}, majProgression: options.majProgression || (() => {}), masquerProgression: () => {},
        VERSION_MAJEURE: '1.171.0',
        db,
        travauxStockage: options.magasin || magasinDuCorpus(),
        uiDialogues: {
            confirmerAction: async (o) => {
                journal.fenetres.push({ fenetre: o.titre, message: o.message, boutons: [o.texteConfirmer, o.texteAnnuler], registre: registre(), succes: succes(), telechargements: journal.telechargements.length, liberations: journal.liberations.length });
                return reponses.confirmer.length ? reponses.confirmer.shift() : true;
            },
            demanderAction: async (o) => {
                journal.fenetres.push({ fenetre: o.titre, message: o.message, boutons: o.actions.map((a) => a.texte), registre: registre(), succes: succes() });
                return reponses.action.length ? reponses.action.shift() : null;
            }
        }
    };
    if (options.validation) win.SecuriteExportValidation = options.validation;
    if (options.apercu) win.SecuriteExportPreview = options.apercu;
    if (options.dossier) win.showDirectoryPicker = async () => options.dossier;
    const notifications = {};
    for (const type of ['succes', 'erreur', 'info']) notifications[type] = (titre, message) => journal.notifications.push({ type, titre, message });

    const sortant = monterFichierSortant(win, { document: doc, muter: options.muter, setTimeout: fauxSetTimeout, URL: FauxURL });
    const brut = readFileSync(path.join(racine, 'js/reserve.js'), 'utf8');
    const code = options.muter ? options.muter(brut) : brut;
    if (options.muter && code === brut && !sortant.mute) {
        throw new Error('Témoin inerte : la mutation n\'a rien remplacé, ni dans js/reserve.js ni dans js/fichier-sortant.js.');
    }
    new Function(
        'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
        'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
        '"use strict";\n' + code
    )(win, doc, consoleSandbox, db, notifications, JSZip, (cb) => setTimeout(cb, 0),
        fauxSetTimeout, { userAgent: 'BacASable/lot-A1 (Node; test)', platform: 'banc' },
        { getItem: () => null }, 'crypto' in options ? options.crypto : globalThis.crypto,
        class { constructor(type) { this.type = type; } });
    return { reserve: win.Reserve, journal, registre };
}

/** Archive le groupe du corpus ; rend ce que l'usager a vu et le fichier parti. */
async function produire(options = {}) {
    const db = options.db || creerDb(CORPUS);
    const monte = monterReserve(db, options);
    const rendu = await monte.reserve.verserGroupeCours(TRIMESTRE, GC);
    const dernier = monte.journal.telechargements[monte.journal.telechargements.length - 1];
    return Object.assign(monte, { rendu, db, blob: dernier ? dernier.blob : null });
}

/** Ouvre une archive avec JSZip EN VÉRIFIANT LES CRC ; rend nom → empreinte, et ses textes. */
async function lireArchive(blob) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer(), { checkCRC32: true });
    const empreintes = {};
    for (const nom of Object.keys(zip.files)) {
        empreintes[nom] = zip.files[nom].dir ? '(dossier)' : sha(await zip.files[nom].async('uint8array'));
    }
    const texte = async (nom) => JSON.parse(await zip.file(nom).async('string'));
    return {
        zip, empreintes,
        donnees: await texte(BASE + 'donnees.json'), meta: await texte(BASE + 'meta.json'),
        patch: await texte(BASE + 'manifeste-archives-patch.json'), manifeste: await texte('manifeste-archives.json')
    };
}

/** Le même juge, mais qui rend des MOTS : une assertion ratée n'emporte jamais un fichier entier. */
async function verdictDOuverture(blob) {
    try { await lireArchive(blob); return 'ouvert'; } catch (e) { return String(e && e.message); }
}

/** La clôture du fichier (ses 22 derniers octets) : le compte des entrées. */
async function entreesALaCloture(blob) {
    const u8 = new Uint8Array(await blob.slice(blob.size - 22).arrayBuffer());
    return new DataView(u8.buffer).getUint16(10, true);
}

/**
 * RÉDACTEUR DE RÉFÉRENCE, FIGÉ : le fichier tel que 1.171.0 l'écrivait (`verserGroupeCours`,
 * mode ZIP, au commit e92f2001) : tout confié à JSZip, DEFLATE niveau 6.
 * Ne pas le « mettre à jour » : il est l'AVANT auquel l'APRÈS se compare.
 */
async function ecrireComme1171(donnees, meta, patch, manifeste, magasin) {
    const zip = new JSZip();
    const base = zip.folder('trimestres').folder(DOSSIER);
    base.file('donnees.json', JSON.stringify(donnees, null, 0));
    const travaux = base.folder('travaux');
    for (const f of donnees[TRIMESTRE + '_fichiersTravaux']) {
        const blob = await magasin.recupererBlob(f.id);
        if (!blob) continue;
        const morceaux = String(f.nomFichier || '').split('.');
        const ext = morceaux.length < 2 ? 'bin' : (morceaux.pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin');
        travaux.file(f.id + '.' + ext, new Uint8Array(await blob.arrayBuffer()));
    }
    base.file('meta.json', JSON.stringify(meta, null, 2));
    base.file('manifeste-archives-patch.json', JSON.stringify(patch, null, 2));
    zip.file('manifeste-archives.json', JSON.stringify(manifeste, null, 2));
    const u8 = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    return new Blob([u8], { type: 'application/zip' });
}

/** Les champs de `meta.json` en 1.171.0, figés : un lecteur d'avant ne connaît que ceux-là. */
const CHAMPS_META_1171 = ['appareil', 'application_version', 'contenu', 'cours', 'date_archive', 'dossier', 'groupe',
    'integrite', 'mode_archive', 'notes', 'source', 'statut', 'trimestre', 'uuid'];
const CHAMPS_INTEGRITE_1171 = ['algorithme', 'date_calcul', 'donnees_json_sha256'];

describe('lot A1 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monterReserve(creerDb({}), { muter: (s) => s.replace('CHAINE_ABSENTE_DU_LOT_A1', 'x') })).toThrow(/Témoin inerte/);
    });
});

describe('lot A1 · (a) le format ne bouge pas', () => {

    it('l\'archive du lot et l\'archive au format 1.171.0 portent les mêmes entrées, octet pour octet', async () => {
        const { blob, rendu } = await produire();
        expect(rendu.succes).toBe(true);
        const apres = await lireArchive(blob);
        const avant = await lireArchive(await ecrireComme1171(apres.donnees, apres.meta, apres.patch, apres.manifeste, magasinDuCorpus()));

        expect(Object.keys(apres.empreintes).sort()).toEqual([...NOMS_ATTENDUS].sort());
        expect(apres.empreintes).toEqual(avant.empreintes);
        // Et ce contenu est bien celui des sources, pas seulement « le même des deux côtés ».
        for (const id of Object.keys(NOM_DE)) expect(apres.empreintes[BASE + 'travaux/' + NOM_DE[id]]).toBe(sha(COPIES[id]));
        expect(apres.donnees[TRIMESTRE + '_fichiersTravaux'].map((f) => f.id)).toEqual(
            ['FT_a1_a', 'FT_a1_photo', 'FT_a1_grosse', 'FT_a1_vide', 'FT_a1_sansext', 'FT_a1_partie', 'FT_a1_a']);
        expect(apres.donnees[TRIMESTRE + '_groupeEtudiants'].map((e) => e.da)).toEqual(['0000001', '0000002']);
    }, 30000);

    it('la copie d\'un autre groupe ne part pas', async () => {
        const { blob } = await produire();
        const { empreintes } = await lireArchive(blob);
        expect(Object.keys(empreintes).filter((n) => /autre_groupe/.test(n))).toEqual([]);
    }, 30000);

    it('meta.json : les champs de 1.171.0, plus le seul champ `integrite.travaux_sha256`', async () => {
        const { blob } = await produire();
        const { meta, patch } = await lireArchive(blob);
        expect(Object.keys(meta).sort()).toEqual(CHAMPS_META_1171);
        expect(Object.keys(meta.integrite).sort()).toEqual([...CHAMPS_INTEGRITE_1171, 'travaux_sha256'].sort());
        // Les comptes comme avant : six dépôts (la copie citée deux fois compte deux fois), une manquante.
        expect(meta.contenu.nombre_fichiers_travaux).toBe(6);
        expect(meta.contenu.nombre_fichiers_manquants).toBe(1);
        expect(meta.mode_archive).toBe('zip');
        expect(patch.patch.nombre_fichiers_travaux).toBe(6);
        expect(patch.patch).not.toHaveProperty('travaux_sha256');
    }, 30000);

    it('les copies sont rangées telles quelles, les textes compressés ; la clôture compte toutes les entrées', async () => {
        const { blob } = await produire();
        const { zip } = await lireArchive(blob);
        expect(blob.type).toBe('application/zip');
        const grosse = zip.files[BASE + 'travaux/FT_a1_grosse.pdf']._data;
        expect(grosse.compressedSize).toBe(COPIES.FT_a1_grosse.length);
        const donnees = zip.files[BASE + 'donnees.json']._data;
        expect(donnees.compressedSize).toBeLessThan(donnees.uncompressedSize);
        expect(await entreesALaCloture(blob)).toBe(NOMS_ATTENDUS.length);
    }, 30000);

    it('TÉMOIN — sans la règle « le dernier dépôt l\'emporte », la copie citée deux fois fait deux entrées', async () => {
        const { blob } = await produire({
            muter: (s) => s.replace('if (Object.prototype.hasOwnProperty.call(rangDeLaCopie, nomEntree)) {', 'if (false) {')
        });
        expect(await entreesALaCloture(blob)).toBe(NOMS_ATTENDUS.length + 1);
    }, 30000);

    it('une copie stockée en tampon d\'octets, pas en Blob, part quand même (JSZip l\'acceptait)', async () => {
        const magasin = magasinDuCorpus();
        magasin._blobs.set('FT_a1_photo', COPIES.FT_a1_photo);             // Uint8Array
        magasin._blobs.set('FT_a1_sansext', COPIES.FT_a1_sansext.buffer);  // ArrayBuffer
        const { blob } = await produire({ magasin });
        const { empreintes, meta } = await lireArchive(blob);
        expect(empreintes[BASE + 'travaux/FT_a1_photo.jpeg']).toBe(sha(COPIES.FT_a1_photo));
        expect(empreintes[BASE + 'travaux/FT_a1_sansext.bin']).toBe(sha(COPIES.FT_a1_sansext));
        expect(meta.integrite.travaux_sha256['FT_a1_photo.jpeg']).toBe(sha(COPIES.FT_a1_photo));
    }, 30000);

    it('TÉMOIN — sans l\'enveloppe, une copie en tampon d\'octets fait échouer l\'archivage', async () => {
        const magasin = magasinDuCorpus();
        magasin._blobs.set('FT_a1_photo', COPIES.FT_a1_photo);
        const verdict = await produire({
            magasin, muter: (s) => s.replace('if (!(blob instanceof Blob)) blob = new Blob([blob]);', '')
        }).then((r) => (r.blob ? verdictDOuverture(r.blob) : 'aucun fichier'), (e) => 'archivage refusé : ' + e.message);
        expect(verdict).not.toBe('ouvert');
    }, 30000);
});

describe('lot A1 · (b) une empreinte par copie, dans les deux modes', () => {

    it('mode fichier : chaque empreinte portée égale l\'empreinte recalculée de la copie dans l\'archive', async () => {
        const { blob } = await produire();
        const { meta, empreintes } = await lireArchive(blob);
        const portees = meta.integrite.travaux_sha256;
        expect(Object.keys(portees).sort()).toEqual(Object.values(NOM_DE).sort());
        for (const nom of Object.keys(portees)) {
            expect(portees[nom]).toMatch(/^[0-9a-f]{64}$/);
            expect(portees[nom]).toBe(empreintes[BASE + 'travaux/' + nom]);
        }
        // La copie vide a la sienne (l'empreinte du vide), pas un trou.
        expect(portees['FT_a1_vide.png']).toBe(sha(new Uint8Array(0)));
    }, 30000);

    it('mode dossier : meta.json porte les mêmes empreintes, égales à celles des fichiers écrits ; il est écrit en dernier', async () => {
        const ecritures = [];
        const racineDisque = fauxDossier('Archives', ecritures);
        const { rendu, journal, registre } = await produire({ dossier: racineDisque });
        expect(rendu.mode).toBe('fsapi');

        const dossier = racineDisque._enfants.get('trimestres')._enfants.get(DOSSIER);
        const meta = JSON.parse(dossier._fichiers.get('meta.json'));
        const ecrits = dossier._enfants.get('travaux')._fichiers;
        expect([...ecrits.keys()].sort()).toEqual(Object.values(NOM_DE).sort());
        expect(Object.keys(meta.integrite.travaux_sha256).sort()).toEqual(Object.values(NOM_DE).sort());
        for (const [nom, contenu] of ecrits) {
            expect(meta.integrite.travaux_sha256[nom]).toBe(sha(Buffer.from(await contenu.arrayBuffer())));
        }
        expect(meta.mode_archive).toBe('fsapi');
        // meta.json reste la sentinelle de complétude : dernier du dossier, avant le manifeste de la racine.
        expect(ecritures.slice(-2)).toEqual([BASE + 'meta.json', 'manifeste-archives.json']);
        expect(ecritures[0]).toBe(BASE + 'donnees.json');

        // « Rien d'autre » : ni fenêtre de confirmation, ni téléchargement ; inscrit et annoncé comme avant.
        expect(journal.fenetres).toEqual([]);
        expect(journal.telechargements).toEqual([]);
        expect(registre()).toEqual([DOSSIER]);
        expect(journal.notifications.map((n) => n.type + ' : ' + n.titre)).toEqual(['succes : Groupe archivé']);
    }, 30000);

    it('TÉMOIN — une empreinte calculée autrement n\'égale plus celle de la copie', async () => {
        const { blob } = await produire({ muter: (s) => s.replace("crypto.subtle.digest('SHA-256', tampon)", "crypto.subtle.digest('SHA-1', tampon)") });
        const { meta, empreintes } = await lireArchive(blob);
        expect(meta.integrite.travaux_sha256['FT_a1_a.pdf']).not.toBe(empreintes[BASE + 'travaux/FT_a1_a.pdf']);
    }, 30000);

    it('TÉMOIN — des empreintes calculées mais pas rangées : meta.json ne les porte plus', async () => {
        const { blob } = await produire({ muter: (s) => s.replace('travaux_sha256: empreintesCopies', 'travaux_sha256: null') });
        expect((await lireArchive(blob)).meta.integrite.travaux_sha256).toBeNull();
    }, 30000);

    it('sans `crypto.subtle`, l\'archive part quand même, et dit qu\'elle n\'a pas d\'empreinte (null)', async () => {
        const { blob, rendu } = await produire({ crypto: {} });
        expect(rendu.succes).toBe(true);
        const { meta, empreintes } = await lireArchive(blob);
        expect(meta.integrite.travaux_sha256).toBeNull();
        expect(meta.integrite.donnees_json_sha256).toBeNull();
        expect(empreintes[BASE + 'travaux/FT_a1_grosse.pdf']).toBe(sha(COPIES.FT_a1_grosse));
    }, 30000);

    it('une copie présente mais illisible fait échouer l\'archivage : elle n\'est pas comptée « manquante »', async () => {
        const magasin = magasinDuCorpus();
        magasin._blobs.set('FT_a1_photo', new (class extends Blob { arrayBuffer() { return Promise.reject(new Error('lecture refusée par le banc')); } })([COPIES.FT_a1_photo]));
        const monte = monterReserve(creerDb(CORPUS), { magasin });
        await expect(monte.reserve.verserGroupeCours(TRIMESTRE, GC)).rejects.toThrow(/lecture refusée par le banc/);
        expect(monte.journal.telechargements).toEqual([]);
        expect(monte.registre()).toEqual([]);
        expect(monte.journal.notifications.map((n) => n.type + ' : ' + n.titre)).toEqual(['erreur : Groupe non archivé']);
    }, 30000);
});

describe('lot A1 · (c) la Défense K et l\'aperçu voient toujours les copies', () => {

    function espion() {
        const vus = { validation: null, apercu: null };
        const lister = (entrees) => { const noms = []; entrees.forEach((chemin) => noms.push(chemin)); return noms; };
        return {
            vus,
            validation: { validerExportReserve: (entrees) => { vus.validation = lister(entrees); } },
            apercu: { previewZipEtConfirmer: async (entrees, libelle) => { vus.apercu = lister(entrees); vus.libelle = libelle; return true; } }
        };
    }

    it('les deux reçoivent toutes les entrées, dans l\'ordre d\'avant le lot', async () => {
        const e = espion();
        await produire({ validation: e.validation, apercu: e.apercu });
        expect(e.vus.validation).toEqual(NOMS_ATTENDUS);
        expect(e.vus.apercu).toEqual(NOMS_ATTENDUS);
        expect(e.vus.libelle).toBe('archive');
    }, 30000);

    it('la vraie Défense K accepte l\'archive du corpus, et refuse une copie au nom hors liste avant toute écriture', async () => {
        const win = {};
        new Function('window', readFileSync(path.join(racine, 'js/securite-export-validation.js'), 'utf8'))(win);
        const accepte = await produire({ validation: win.SecuriteExportValidation });
        expect(accepte.rendu.succes).toBe(true);

        const corpus = structuredClone(CORPUS);
        corpus.a2026_fichiersTravaux = [{ id: 'FT_a1/../evasion', nomFichier: 'x.pdf', groupeCoursId: GC }];
        const magasin = magasinDuCorpus();
        magasin._blobs.set('FT_a1/../evasion', new Blob([octets(10, 1)]));
        const monte = monterReserve(creerDb(corpus), { magasin, validation: win.SecuriteExportValidation });
        await expect(monte.reserve.verserGroupeCours(TRIMESTRE, GC)).rejects.toThrow(/Sécurité K.*hors whitelist/s);
        expect(monte.journal.telechargements).toEqual([]);
        expect(monte.registre()).toEqual([]);
    }, 30000);

    it('TÉMOIN — une liste qui tairait les copies : la Défense K ne les verrait plus', async () => {
        const e = espion();
        await produire({
            validation: e.validation, apercu: e.apercu,
            muter: (s) => s.replace('copies.forEach(function(copie) { rappel(copie.nom, { dir: false }); });', '')
        });
        expect(e.vus.validation).toEqual(NOMS_ATTENDUS.filter((n) => !/travaux\/FT_/.test(n)));
    }, 30000);

    it('un aperçu refusé : ni fichier, ni registre, ni message (rendu null, comme avant)', async () => {
        const { rendu, journal, registre } = await produire({ apercu: { previewZipEtConfirmer: async () => false } });
        expect(rendu).toBeNull();
        expect(journal.telechargements).toEqual([]);
        expect(journal.fenetres).toEqual([]);
        expect(journal.notifications).toEqual([]);
        expect(registre()).toEqual([]);
    }, 30000);
});

describe('lot A1 · (d) une copie à la fois, jamais confiée à JSZip', () => {

    /** Un Blob qui consigne comment on le lit, et garde les tampons rendus par une lecture entière. */
    function classeEspionne(journal) {
        return class BlobEspion extends Blob {
            arrayBuffer() {
                // Combien de tampons de lectures entières précédentes sont encore tenus ?
                const tenus = journal.tampons.filter((t) => t.byteLength > 0).length;
                journal.lectures.push({ lecture: 'entier', octets: this.size, tenus });
                return super.arrayBuffer().then((t) => { journal.tampons.push(t); return t; });
            }
            text() { journal.lectures.push({ lecture: 'texte', octets: this.size }); return super.text(); }
            stream() { journal.lectures.push({ lecture: 'flux', octets: this.size }); return super.stream(); }
            slice(debut, fin) { journal.lectures.push({ lecture: 'tranche', octets: Math.min(fin, this.size) - debut }); return super.slice(debut, fin); }
        };
    }

    /** Remplace `JSZip.prototype.file` le temps d'un geste ; rend ce qui a été déposé. */
    async function avecDepotsEspionnes(geste) {
        const deposes = [];
        const fileOriginal = JSZip.prototype.file;
        JSZip.prototype.file = function (nom, contenu) {
            if (arguments.length > 1) deposes.push({ nom, estBlob: contenu instanceof Blob });
            return fileOriginal.apply(this, arguments);
        };
        try { await geste(); } finally { JSZip.prototype.file = fileOriginal; }
        return deposes;
    }

    it('JSZip ne reçoit aucune copie ; une lecture entière par copie (l\'empreinte) ; aucune tranche de plus de 4 Mo', async () => {
        const journal = { lectures: [], tampons: [] };
        let blob;
        const deposes = await avecDepotsEspionnes(async () => {
            ({ blob } = await produire({ magasin: magasinDuCorpus(classeEspionne(journal)) }));
        });
        expect(deposes.filter((d) => d.estBlob)).toEqual([]);
        expect(deposes.map((d) => d.nom)).toEqual(['donnees.json', 'meta.json', 'manifeste-archives-patch.json', 'manifeste-archives.json']);
        // Six dépôts (la copie citée deux fois est lue deux fois) : six lectures entières, pas une de plus.
        expect(journal.lectures.filter((l) => l.lecture === 'entier')).toHaveLength(6);
        expect(journal.lectures.filter((l) => l.lecture === 'texte' || l.lecture === 'flux')).toEqual([]);
        const tranches = journal.lectures.filter((l) => l.lecture === 'tranche');
        expect(Math.max(...tranches.map((l) => l.octets))).toBe(4 * MO);
        expect((await lireArchive(blob)).empreintes[BASE + 'travaux/FT_a1_grosse.pdf']).toBe(sha(COPIES.FT_a1_grosse));
    }, 30000);

    it.skipIf(!TRANSFERT)('le tampon d\'une copie est rendu avant que la suivante soit lue', async () => {
        const journal = { lectures: [], tampons: [] };
        await produire({ magasin: magasinDuCorpus(classeEspionne(journal)) });
        const entieres = journal.lectures.filter((l) => l.lecture === 'entier');
        expect(entieres.map((l) => l.tenus)).toEqual([0, 0, 0, 0, 0, 0]);
        expect(journal.tampons.filter((t) => t.byteLength > 0)).toEqual([]);
    }, 30000);

    it.skipIf(!TRANSFERT)('TÉMOIN — des tampons laissés au ramasse-miettes sont vus : ils s\'empilent', async () => {
        const journal = { lectures: [], tampons: [] };
        await produire({
            magasin: magasinDuCorpus(classeEspionne(journal)),
            muter: (s) => s.replace("    // Rendre le tampon tout de suite : laissés au ramasse-miettes, ils s'empilent (lot J0).\n    if (typeof tampon.transfer === 'function') tampon.transfer(0);", '')
        });
        const entieres = journal.lectures.filter((l) => l.lecture === 'entier');
        expect(Math.max(...entieres.map((l) => l.tenus))).toBeGreaterThan(1);
    }, 30000);

    it.skipIf(!TRANSFERT)('TÉMOIN — des empreintes lancées sans s\'attendre : plusieurs copies sont tenues à la fois', async () => {
        const journal = { lectures: [], tampons: [] };
        const corpus = structuredClone(CORPUS);
        // Trois copies non vides d'affilée : sans attente, leurs tampons se chevauchent.
        corpus.a2026_fichiersTravaux = corpus.a2026_fichiersTravaux.filter((f) => ['FT_a1_grosse', 'FT_a1_a', 'FT_a1_photo'].includes(f.id));
        await produire({
            db: creerDb(corpus), magasin: magasinDuCorpus(classeEspionne(journal)),
            muter: (s) => s.replace("empreintes[f.id + '.' + ext] = await _empreinteDeLaCopie(blob);", "empreintes[f.id + '.' + ext] = 'x'; _empreinteDeLaCopie(blob); await new Promise(function(r) { setTimeout(r, 0); });")
        });
        const entieres = journal.lectures.filter((l) => l.lecture === 'entier');
        expect(Math.max(...entieres.map((l) => l.tenus))).toBeGreaterThan(0);
    }, 30000);

    it('TÉMOIN — des copies reconfiées à JSZip sont vues au dépôt', async () => {
        // Node n'a pas de FileReader, et JSZip en veut un pour lire un Blob : on lui en
        // prête un le temps du témoin (sinon ses promesses rejetées restent sans preneur).
        globalThis.FileReader = class {
            readAsArrayBuffer(blob) { blob.arrayBuffer().then((buf) => { this.result = buf; this.onload({ target: this }); }); }
        };
        let deposes;
        try {
            deposes = await avecDepotsEspionnes(() => produire({
                muter: (s) => s.replace('copies.push({ nom: nomEntree, blob: entree2.blob });', "copies.push({ nom: nomEntree, blob: entree2.blob }); dossierBase.file('doublon-' + entree2.id, entree2.blob);")
            }));
        } finally {
            delete globalThis.FileReader;
        }
        expect(deposes.filter((d) => d.estBlob).length).toBeGreaterThan(0);
    }, 30000);
});

describe('lot A1 · (e) l\'écriture : l\'adresse reste, et c\'est l\'usager qui confirme', () => {

    const CINQ_MINUTES = 5 * 60 * 1000;

    it('« Il y est » : la fenêtre est posée APRÈS le téléchargement, AVANT tout registre et tout message de réussite', async () => {
        const { rendu, journal, registre } = await produire({ reponses: { confirmer: [true] } });
        expect(journal.fenetres).toHaveLength(1);
        const fenetre = journal.fenetres[0];
        expect(fenetre.fenetre).toBe('Téléchargement lancé');
        expect(fenetre.boutons).toEqual(['Il y est', 'Il n\'y est pas']);
        expect(fenetre.message).toContain('archive-' + DOSSIER + '-');
        expect(fenetre.message).toMatch(/\(environ 9 Mo\)/);
        // Au moment où la fenêtre se pose : le fichier est parti, rien n'est inscrit, rien n'est annoncé.
        expect(fenetre.telechargements).toBe(1);
        expect(fenetre.registre).toEqual([]);
        expect(fenetre.succes).toBe(0);
        // Après le « Il y est » : inscrit, annoncé.
        expect(rendu.succes).toBe(true);
        expect(registre()).toEqual([DOSSIER]);
        expect(journal.notifications.map((n) => n.type + ' : ' + n.titre)).toEqual(['succes : Groupe archivé : fichier téléchargé']);
        expect(journal.telechargements).toHaveLength(1);
        expect(journal.telechargements[0].nom).toMatch(new RegExp('^archive-' + DOSSIER + '-\\d{4}-\\d{2}-\\d{2}\\.zip$'));
    }, 30000);

    it('« Il n\'y est pas », puis la fenêtre refermée : rien au registre, l\'écran ne dit pas « archivé »', async () => {
        const { rendu, journal, registre, db } = await produire({ reponses: { confirmer: [false], action: [null] } });
        expect(rendu.succes).toBe(false);
        expect(rendu.nonConfirme).toBe(true);
        expect(registre()).toEqual([]);
        expect(db.getSync(CLE_REGISTRE, null)).toBeNull();
        expect(journal.notifications).toEqual([]);
        expect(journal.fenetres.map((f) => f.fenetre)).toEqual(['Téléchargement lancé', 'Groupe non archivé']);
        expect(journal.fenetres[1].boutons).toEqual(['Réessayer']);
        expect(journal.fenetres[1].message).toBe('Le fichier (environ 9 Mo) n\'a pas été enregistré. Tes données restent dans l\'application.');
        // Aucun des mots vus ne dit « archivé » comme un fait accompli.
        expect(journal.fenetres.map((f) => f.fenetre + ' ' + f.message).join(' ')).not.toMatch(/Groupe archivé|archive prête/i);
    }, 30000);

    it('« Il n\'y est pas », « Réessayer », « Il y est » : le même fichier repart, puis l\'archive est inscrite', async () => {
        const { rendu, journal, registre } = await produire({ reponses: { confirmer: [false, true], action: ['reessayer'] } });
        expect(rendu.succes).toBe(true);
        expect(journal.telechargements).toHaveLength(2);
        expect(journal.telechargements[1].blob).toBe(journal.telechargements[0].blob);
        expect(journal.fenetres.map((f) => f.fenetre)).toEqual(['Téléchargement lancé', 'Groupe non archivé', 'Téléchargement lancé']);
        expect(journal.fenetres[2].registre).toEqual([]);
        expect(registre()).toEqual([DOSSIER]);
    }, 30000);

    it('le fichier confirmé est celui que le registre décrit, et il s\'ouvre', async () => {
        const { blob, db } = await produire();
        const { meta } = await lireArchive(blob);
        const entree = db.getSync(CLE_REGISTRE).archives[DOSSIER];
        expect(entree.uuid).toBe(meta.uuid);
        expect(entree.nombre_fichiers_travaux).toBe(6);
    }, 30000);

    it('l\'adresse du fichier n\'est pas libérée aussitôt : seulement après cinq minutes', async () => {
        const { journal } = await produire();
        expect(journal.liberations).toEqual([]);
        expect(journal.fenetres[0].liberations).toBe(0);
        expect(journal.telechargements[0].adresseDejaLiberee).toBe(false);
        expect(journal.differes.map((d) => d.delai)).toEqual([CINQ_MINUTES]);
        // Et c'est bien cette minuterie qui la libère.
        journal.differes[0].cb();
        expect(journal.liberations).toEqual(['blob:banc/1']);
    }, 30000);

    it('TÉMOIN — une adresse libérée aussitôt est vue avant même la fenêtre', async () => {
        const { journal } = await produire({
            muter: (s) => s.replace('setTimeout(function() { URL.revokeObjectURL(url); }, DELAI_LIBERATION_URL_MS);', 'URL.revokeObjectURL(url);')
        });
        expect(journal.fenetres[0].liberations).toBe(1);
        expect(journal.differes).toEqual([]);
    }, 30000);

    it('TÉMOIN — une réponse qu\'on n\'écouterait pas : « Il n\'y est pas » inscrirait quand même l\'archive', async () => {
        const { registre, journal } = await produire({
            reponses: { confirmer: [false], action: [null] },
            muter: (s) => s.replace('if (await window.FichierSortant.confirmerTelechargement(nomFichier, tailleDite)) break;',
                'await window.FichierSortant.confirmerTelechargement(nomFichier, tailleDite); break;')
        });
        expect(registre()).toEqual([DOSSIER]);
        expect(journal.notifications.map((n) => n.type)).toEqual(['succes']);
    }, 30000);

    it('TÉMOIN — une archive inscrite dès le téléchargement est vue par la fenêtre', async () => {
        const { journal } = await produire({
            muter: (s) => s.replace('var tailleDite = window.FichierSortant.tailleEnviron(zipBlob.size);',
                'var tailleDite = window.FichierSortant.tailleEnviron(zipBlob.size); _upsertEntreeManifesteLocal(dossier, patch.patch);')
        });
        expect(journal.fenetres[0].registre).toEqual([DOSSIER]);
    }, 30000);

    it('TÉMOIN — une réussite annoncée d\'office est vue par la fenêtre', async () => {
        const { journal } = await produire({
            muter: (s) => s.replace('var tailleDite = window.FichierSortant.tailleEnviron(zipBlob.size);',
                "var tailleDite = window.FichierSortant.tailleEnviron(zipBlob.size); notifications.succes('Groupe archivé : fichier téléchargé', '');")
        });
        expect(journal.fenetres[0].succes).toBe(1);
    }, 30000);
});
