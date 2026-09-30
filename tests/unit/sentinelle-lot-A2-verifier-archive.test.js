import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// SENTINELLE DU LOT A2 (CHANTIER DES ARCHIVES) — VÉRIFIER UNE ARCHIVE
// =====================================================================
//
// Consigne du 30 sept. 2026 (16 h 24) : dans Réglages › Données › Archives, un bouton
// « Vérifier ». L'application relit l'archive, copie par copie, dans les deux modes (le dossier
// de Chrome/Edge, le fichier .zip de Safari), et dit ce qu'elle a trouvé. Le résultat est retenu
// dans la liste locale, avec de quoi savoir que c'est CETTE archive ; un nouvel archivage du
// même groupe le remet à « non vérifiée ». Une archive d'avant les empreintes est « à refaire ».
//
// CE QUE CE BANC JUGE (§ 4 de la consigne) :
//   (a) une archive saine → vérifiée, dans les deux modes ; l'archive du mode fichier est celle
//       que le VRAI `Reserve.verserGroupeCours` produit (FichierSortant.assemblerZip) ;
//   (b) une copie tronquée, une copie altérée d'un octet à taille égale, une copie absente, un
//       fichier en trop, un donnees.json altéré, une fiche non couverte → chacune dite, aucune ne
//       passe pour « vérifiée », dans les deux modes ;
//   (c) une archive d'avant 1.171.1 → « à refaire », avec compte et taille ;
//   (d) l'état retenu survit à une relecture du stockage ; un nouvel archivage le remet à zéro ;
//       le fichier d'une AUTRE archive n'est pas jugé ;
//   (e) le fichier n'est jamais lu en entier (ni JSZip.loadAsync, ni arrayBuffer() du tout) ;
//       chaque tranche lue est au plus de la taille d'une entrée ;
//   (f) les mots acceptés par Grégoire (16 h 26) sont ceux que l'usager lit ;
//   (g) le dossier choisi dans Chrome est gardé le temps de la page, l'écran le voit, et le
//       mauvais niveau (« trimestres ») est refusé.
//
// CE QU'IL NE JUGE PAS : le pic de mémoire à 607 Mo (banc WebKit, demande de relecture), ni le
// vrai sélecteur de fichier de Safari ou de Chrome (spec WebKit et porte terrain).
//
// TÉMOINS : chaque invariant a le sien, par mutation de l'archive ou du stockage. Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };

const TRIMESTRE = 'a2026';
const GC = 'GC_A2';
const DOSSIER = 'a2026-601-101-gr00007';
const CLE_REGISTRE = '_manifesteReserve';
const MO = 1024 * 1024;

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

// Quatre copies, toutes présentes (une archive saine se vérifie) ; une plus grosse que la tranche
// de CRC du rédacteur (4 Mo) ; une citée deux fois ; une d'un autre groupe, qui ne part pas.
const COPIES = {
    FT_a2_a: octets(70 * 1024, 11),
    FT_a2_photo: octets(33 * 1024 + 7, 12),
    FT_a2_grosse: octets(5 * MO + 123, 13),
    FT_a2_vide: new Uint8Array(0),
    FT_a2_autre_groupe: octets(2048, 16)
};
const NOM_DE = { FT_a2_a: 'FT_a2_a.pdf', FT_a2_photo: 'FT_a2_photo.jpeg', FT_a2_grosse: 'FT_a2_grosse.pdf', FT_a2_vide: 'FT_a2_vide.png' };
const fiche = (id, nom, da) => ({ id, nomFichier: nom, etudiantDA: da, productionId: 'P1', groupeCoursId: GC, tailleFichier: COPIES[id].length });
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
        fiche('FT_a2_a', 'copie-fictive-a.pdf', '0000001'),
        fiche('FT_a2_photo', 'photo-fictive.JPEG', '0000002'),
        fiche('FT_a2_grosse', 'grosse-copie-fictive.pdf', '0000002'),
        fiche('FT_a2_vide', 'vide.png', '0000001'),
        fiche('FT_a2_a', 'copie-fictive-a.pdf', '0000001'),
        { id: 'FT_a2_autre_groupe', nomFichier: 'autre.pdf', etudiantDA: '0000003', productionId: 'P1', groupeCoursId: 'GC_AUTRE', tailleFichier: 2048 }
    ]
};

const magasinDuCorpus = () => {
    const blobs = new Map(Object.entries(COPIES).map(([id, u]) => [id, new Blob([u])]));
    return { recupererBlob: async (id) => (blobs.has(id) ? blobs.get(id) : null) };
};

/** Un dossier du disque, en mémoire : ce que le mode dossier (Chrome, Edge) écrit ET relit. */
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
const dossierArchive = (racineFaux) => racineFaux._enfants.get('trimestres')._enfants.get(DOSSIER);
const travauxDe = (racineFaux) => dossierArchive(racineFaux)._enfants.get('travaux')._fichiers;

/** Le dossier en mémoire → un ZIP au format de l'archive (textes DEFLATE, copies STORE), comme le rédacteur. */
async function zipDepuisDossier(racineFaux) {
    const zip = new JSZip();
    const marcher = async (d, chemin) => {
        for (const [n, sous] of d._enfants) await marcher(sous, chemin + n + '/');
        for (const [n, blob] of d._fichiers) {
            const u8 = new Uint8Array(await blob.arrayBuffer());
            const texte = /\.json$/.test(n);
            zip.file(chemin + n, u8, texte ? { compression: 'DEFLATE' } : { compression: 'STORE' });
        }
    };
    await marcher(racineFaux, '');
    return new Blob([await zip.generateAsync({ type: 'uint8array' })], { type: 'application/zip' });
}

/**
 * Monte fichier-sortant.js, reserve.js et reserve-verifier.js dans un même bac à sable.
 * `journal` consigne ce que l'usager verrait ; `options.dossier` donne le mode dossier.
 */
function monter(db, options = {}) {
    const journal = { notifications: [], fenetres: [], telechargements: [], selecteurs: 0, progression: [] };
    const adresses = new Map();
    const FauxURL = {
        createObjectURL(blob) { const u = 'blob:banc/' + (adresses.size + 1); adresses.set(u, blob); return u; },
        revokeObjectURL() {}
    };
    const fauxSetTimeout = (cb, delai) => ((delai || 0) >= 60000 ? 0 : setTimeout(cb, 0));
    const doc = {
        readyState: 'loading', getElementById: () => null,
        createElement: () => ({ click() { journal.telechargements.push({ nom: this.download, blob: adresses.get(this.href) }); } }),
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    const win = {
        addEventListener: () => {}, dispatchEvent: () => {},
        afficherProgression: (t) => journal.progression.push({ titre: t }),
        majProgression: (p, d, s) => journal.progression.push({ p, d, s }),
        masquerProgression: () => {},
        VERSION_MAJEURE: '1.172.0-banc', db,
        travauxStockage: options.magasin || magasinDuCorpus(),
        uiDialogues: {
            confirmerAction: async () => true,
            demanderAction: async () => null,
            informer: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message }); }
        },
        // (e) Le fichier n'est jamais confié à JSZip : le rédacteur (reserve.js) garde le vrai JSZip pour
        // ÉCRIRE ses textes ; `loadAsync`, qui lit un fichier entier, est un piège.
        JSZip: Object.assign(function JSZipBanc() { return new JSZip(); }, {
            loadAsync: () => { throw new Error('JSZip.loadAsync appelé : le fichier entier serait lu'); }
        })
    };
    if (options.dossier) {
        win.showDirectoryPicker = async () => { journal.selecteurs++; return typeof options.dossier === 'function' ? options.dossier() : options.dossier; };
    }
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
            fauxSetTimeout, { userAgent: 'BacASable/lot-A2 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    };
    charger('js/reserve.js');
    charger('js/reserve-verifier.js');
    const registre = () => (db.getSync(CLE_REGISTRE, null) || { archives: {} }).archives;
    return { win, reserve: win.Reserve, verifier: win.ReserveVerifier, journal, registre, db };
}

/** Archive le groupe du corpus en mode fichier (Safari) : rend le ZIP du vrai rédacteur, et le banc. */
async function archiverEnFichier(options = {}) {
    const db = options.db || creerDb(CORPUS);
    const banc = monter(db, options);
    const rendu = await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
    expect(rendu && rendu.succes).toBe(true);
    const blob = banc.journal.telechargements[banc.journal.telechargements.length - 1].blob;
    return Object.assign(banc, { rendu, blob });
}

/** Archive le groupe du corpus en mode dossier (Chrome, Edge) : rend le dossier écrit, et le banc. */
async function archiverEnDossier(options = {}) {
    const db = options.db || creerDb(CORPUS);
    const dossier = options.dossier || fauxDossier('Archives_LaboCodex');
    const banc = monter(db, Object.assign({}, options, { dossier }));
    const rendu = await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
    expect(rendu && rendu.succes).toBe(true);
    expect(rendu.mode).toBe('fsapi');
    return Object.assign(banc, { rendu, dossier });
}

/** Un ZIP tel que l'usager le désigne : un Blob qui refuse d'être lu en entier et note ses tranches. */
function fichierSurveille(blob) {
    const tranches = [];
    const surveiller = (b) => new Proxy(b, {
        get(cible, prop) {
            if (prop === 'arrayBuffer') return () => { throw new Error('arrayBuffer() sur le fichier entier'); };
            if (prop === 'stream') return () => { throw new Error('stream() sur le fichier entier'); };
            if (prop === 'slice') return (a, z) => { const t = cible.slice(a, z); tranches.push(t.size); return t; };
            const v = cible[prop];
            return typeof v === 'function' ? v.bind(cible) : v;
        }
    });
    return { fichier: surveiller(blob), tranches };
}

const verifierFichier = (banc, blob, dossier = DOSSIER) =>
    banc.verifier.verifierArchive(banc.verifier.sourceFichier(blob), banc.registre()[dossier] || null, dossier);
const verifierDossier = (banc, racineFaux, dossier = DOSSIER) =>
    banc.verifier.verifierArchive(banc.verifier.sourceDossier(racineFaux, dossier), banc.registre()[dossier] || null, dossier);

/** Les mêmes mutations, appliquées au dossier en mémoire ; le ZIP en est tiré ensuite. */
const MUTATIONS = {
    tronquee: (r) => { const t = travauxDe(r); const u = new Uint8Array(COPIES.FT_a2_grosse.slice(0, 3 * MO)); t.set('FT_a2_grosse.pdf', new Blob([u])); },
    alteree: (r) => { const t = travauxDe(r); const u = new Uint8Array(COPIES.FT_a2_a); u[1234] ^= 0x01; t.set('FT_a2_a.pdf', new Blob([u])); },
    absente: (r) => { travauxDe(r).delete('FT_a2_photo.jpeg'); },
    enTrop: (r) => { travauxDe(r).set('FT_intrus.pdf', new Blob([octets(100, 99)])); },
    donneesAlterees: async (r) => {
        const f = dossierArchive(r)._fichiers;
        const texte = await f.get('donnees.json').text();
        f.set('donnees.json', new Blob([texte.replace('Élève fictif Un', 'Élève fictif Un modifié')]));
    },
    sansEmpreintes: async (r) => {
        const f = dossierArchive(r)._fichiers;
        const meta = JSON.parse(await f.get('meta.json').text());
        delete meta.integrite.travaux_sha256;
        meta.application_version = '1.170.2';
        f.set('meta.json', new Blob([JSON.stringify(meta, null, 2)]));
    }
};
const nonCouverte = (banc) => {
    const fiches = banc.db.getSync(TRIMESTRE + '_fichiersTravaux').slice();
    fiches.push({ id: 'FT_a2_neuve', nomFichier: 'neuve.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: GC, tailleFichier: 10 });
    banc.db.setSync(TRIMESTRE + '_fichiersTravaux', fiches);
};

describe('lot A2 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monter(creerDb({}), { muter: { 'js/reserve-verifier.js': (s) => s.replace('CHAINE_ABSENTE_DU_LOT_A2', 'x') } })).toThrow(/Témoin inerte/);
    });
    it('les deux modes produisent la même archive : mêmes empreintes déclarées, égales à celles des copies', async () => {
        const f = await archiverEnFichier();
        const d = await archiverEnDossier();
        // (le lecteur du ZIP se juge plus bas ; ici on lit avec JSZip, côté banc)
        const zip = await JSZip.loadAsync(await f.blob.arrayBuffer());
        const metaF = JSON.parse(await zip.file('trimestres/' + DOSSIER + '/meta.json').async('string'));
        const metaD = JSON.parse(await dossierArchive(d.dossier)._fichiers.get('meta.json').text());
        expect(metaF.integrite.travaux_sha256).toEqual(metaD.integrite.travaux_sha256);
        for (const id of Object.keys(NOM_DE)) expect(metaF.integrite.travaux_sha256[NOM_DE[id]]).toBe(sha(COPIES[id]));
    }, 30000);
});

describe('lot A2 · (a) une archive saine est vérifiée, dans les deux modes', () => {
    it('mode fichier : le ZIP du vrai rédacteur → « vérifiée », 4 copies sur 4, données concordantes, couverture entière', async () => {
        const banc = await archiverEnFichier();
        const rapport = await verifierFichier(banc, banc.blob);
        expect(rapport.etat).toBe('verifiee');
        expect(rapport.total).toBe(4);
        expect(rapport.verifiees).toBe(4);
        expect(rapport.problemes).toEqual([]);
        expect(rapport.enTrop).toEqual([]);
        expect(rapport.nonCouvertes).toEqual([]);
        expect(rapport.couvertureMesuree).toBe(true);
        expect(rapport.donneesConcordent).toBe(true);
        expect(rapport.uuid).toBe(banc.rendu.uuid);
        expect(rapport.meta_sha256).toMatch(/^[0-9a-f]{64}$/);
    }, 30000);

    it('mode dossier : le dossier écrit par le vrai rédacteur → « vérifiée »', async () => {
        const banc = await archiverEnDossier();
        const rapport = await verifierDossier(banc, banc.dossier);
        expect(rapport.etat).toBe('verifiee');
        expect(rapport.total).toBe(4);
        expect(rapport.verifiees).toBe(4);
        expect(rapport.donneesConcordent).toBe(true);
        expect(rapport.couvertureMesuree).toBe(true);
    }, 30000);

    it('le ZIP tiré du dossier (textes DEFLATE, copies STORE) se vérifie aussi en mode fichier', async () => {
        const banc = await archiverEnDossier();
        const rapport = await verifierFichier(banc, await zipDepuisDossier(banc.dossier));
        expect(rapport.etat).toBe('verifiee');
        expect(rapport.verifiees).toBe(4);
    }, 30000);
});

describe('lot A2 · (b) chaque défaut est dit, et aucun ne passe pour « vérifiée »', () => {
    const cas = [
        ['une copie tronquée', 'tronquee', (r) => r.problemes.map((p) => p.type + ':' + p.nom), ['tronquee:FT_a2_grosse.pdf']],
        ['une copie altérée d\'un octet, à taille égale', 'alteree', (r) => r.problemes.map((p) => p.type + ':' + p.nom), ['alteree:FT_a2_a.pdf']],
        ['une copie absente', 'absente', (r) => r.problemes.map((p) => p.type + ':' + p.nom), ['absente:FT_a2_photo.jpeg']],
        ['un fichier en trop', 'enTrop', (r) => r.enTrop, ['FT_intrus.pdf']],
        ['un donnees.json altéré', 'donneesAlterees', (r) => r.donneesConcordent, false]
    ];
    for (const [nom, mutation, lire, attendu] of cas) {
        it('mode dossier : ' + nom, async () => {
            const banc = await archiverEnDossier();
            await MUTATIONS[mutation](banc.dossier);
            const rapport = await verifierDossier(banc, banc.dossier);
            expect(lire(rapport)).toEqual(attendu);
            expect(rapport.etat).toBe('incomplete');
            expect(rapport.verifiees).toBe(mutation === 'donneesAlterees' || mutation === 'enTrop' ? 4 : 3);
        }, 30000);
        it('mode fichier : ' + nom, async () => {
            const banc = await archiverEnDossier();
            await MUTATIONS[mutation](banc.dossier);
            const rapport = await verifierFichier(banc, await zipDepuisDossier(banc.dossier));
            expect(lire(rapport)).toEqual(attendu);
            expect(rapport.etat).toBe('incomplete');
        }, 30000);
    }

    it('mode dossier : une fiche non couverte (ajoutée au groupe après l\'archivage)', async () => {
        const banc = await archiverEnDossier();
        nonCouverte(banc);
        const rapport = await verifierDossier(banc, banc.dossier);
        expect(rapport.nonCouvertes).toEqual(['FT_a2_neuve']);
        expect(rapport.verifiees).toBe(4);
        expect(rapport.etat).toBe('incomplete');
    }, 30000);
    it('mode fichier : une fiche non couverte', async () => {
        const banc = await archiverEnFichier();
        nonCouverte(banc);
        const rapport = await verifierFichier(banc, banc.blob);
        expect(rapport.nonCouvertes).toEqual(['FT_a2_neuve']);
        expect(rapport.etat).toBe('incomplete');
    }, 30000);

    it('la couverture se mesure sur les fiches d\'AUJOURD\'HUI, pas sur celles de l\'archive : une fiche retirée de l\'application ne manque à rien', async () => {
        const banc = await archiverEnDossier();
        banc.db.setSync(TRIMESTRE + '_fichiersTravaux', banc.db.getSync(TRIMESTRE + '_fichiersTravaux').filter((f) => f.id !== 'FT_a2_vide'));
        const rapport = await verifierDossier(banc, banc.dossier);
        expect(rapport.nonCouvertes).toEqual([]);
        expect(rapport.etat).toBe('verifiee');
    }, 30000);

    it('le groupe n\'est plus dans l\'application : la couverture est dite « non mesurée », l\'archive n\'est pas vérifiée', async () => {
        const banc = await archiverEnDossier();
        banc.db.setSync(TRIMESTRE + '_groupesCours', []);
        const rapport = await verifierDossier(banc, banc.dossier);
        expect(rapport.couvertureMesuree).toBe(false);
        expect(rapport.etat).toBe('verifiee');
    }, 30000);

    it('un ZIP coupé (le répertoire central manque) est dit illisible, pas « vérifié »', async () => {
        const banc = await archiverEnFichier();
        const coupe = banc.blob.slice(0, banc.blob.size - 2000);
        await expect(verifierFichier(banc, coupe)).rejects.toThrow(/ZIP|répertoire/);
    }, 30000);

    it('un ZIP dont le répertoire pointe hors du fichier est refusé', async () => {
        const banc = await archiverEnFichier();
        const u8 = new Uint8Array(await banc.blob.arrayBuffer());
        // Le début du répertoire central (clôture + 16) est repoussé au-delà du fichier.
        const v = new DataView(u8.buffer);
        v.setUint32(u8.length - 22 + 16, u8.length + 100, true);
        await expect(verifierFichier(banc, new Blob([u8]))).rejects.toThrow(/répertoire/);
    }, 30000);

    it('une entrée au nom suspect (../) est refusée avant toute lecture', async () => {
        const banc = await archiverEnDossier();
        const zip = new JSZip();
        zip.file('trimestres/' + DOSSIER + '/meta.json', await dossierArchive(banc.dossier)._fichiers.get('meta.json').text());
        zip.file('../evasion.txt', 'x');
        const blob = new Blob([await zip.generateAsync({ type: 'uint8array' })]);
        await expect(verifierFichier(banc, blob)).rejects.toThrow(/suspecte/);
    }, 30000);
});

describe('lot A2 · (c) une archive d\'avant les empreintes est « à refaire »', () => {
    it('mode dossier : sans travaux_sha256 → « a_refaire », le compte et la taille des copies donnés, aucune copie jugée', async () => {
        const banc = await archiverEnDossier();
        await MUTATIONS.sansEmpreintes(banc.dossier);
        const rapport = await verifierDossier(banc, banc.dossier);
        expect(rapport.etat).toBe('a_refaire');
        expect(rapport.nombreFichiers).toBe(4);
        expect(rapport.tailleFichiers).toBe(Object.keys(NOM_DE).reduce((s, id) => s + COPIES[id].length, 0));
        expect(rapport.total).toBe(0);
        expect(rapport.verifiees).toBe(0);
    }, 30000);
    it('mode fichier : le même, et un ZIP tout en DEFLATE (comme 1.171.0) se lit', async () => {
        const banc = await archiverEnDossier();
        await MUTATIONS.sansEmpreintes(banc.dossier);
        const zip = new JSZip();
        const marcher = async (d, chemin) => {
            for (const [n, sous] of d._enfants) await marcher(sous, chemin + n + '/');
            for (const [n, blob] of d._fichiers) zip.file(chemin + n, new Uint8Array(await blob.arrayBuffer()));
        };
        await marcher(banc.dossier, '');
        const blob = new Blob([await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })]);
        const rapport = await verifierFichier(banc, blob);
        expect(rapport.etat).toBe('a_refaire');
        expect(rapport.nombreFichiers).toBe(4);
        const cr = banc.verifier.compteRendu(rapport);
        expect(cr.titre).toBe('Archive à refaire');
        expect(cr.message).toContain('4 copies');
    }, 30000);
    it('l\'état « à refaire » est retenu, et la liste dit « Non vérifiée »', async () => {
        const banc = await archiverEnDossier();
        await MUTATIONS.sansEmpreintes(banc.dossier);
        const rapport = await verifierDossier(banc, banc.dossier);
        banc.verifier.retenirResultat(DOSSIER, rapport);
        expect(banc.registre()[DOSSIER].verification.etat).toBe('a_refaire');
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER])).toMatchObject({ verifiee: false, texte: 'Non vérifiée' });
    }, 30000);
});

describe('lot A2 · (d) l\'état retenu survit, et un nouvel archivage le remet à zéro', () => {
    it('avant toute vérification, la liste dit « Non vérifiée »', async () => {
        const banc = await archiverEnFichier();
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER])).toMatchObject({ verifiee: false, texte: 'Non vérifiée' });
    }, 30000);

    it('retenu dans la liste locale : état, date, version, nombre de copies, uuid, empreinte du meta.json ; relu depuis le stockage par un banc neuf', async () => {
        const banc = await archiverEnFichier();
        const rapport = await verifierFichier(banc, banc.blob);
        const v = banc.verifier.retenirResultat(DOSSIER, rapport);
        expect(v).toMatchObject({ etat: 'verifiee', version_app: '1.172.0-banc', nombre_copies: 4, uuid: banc.rendu.uuid, meta_sha256: rapport.meta_sha256 });
        expect(v.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        // Rien d'autre n'a bougé dans l'entrée ni ailleurs.
        expect(banc.registre()[DOSSIER].uuid).toBe(banc.rendu.uuid);
        expect(banc.db.getSync(TRIMESTRE + '_fichiersTravaux').length).toBe(6);
        // Un rechargement : un banc neuf sur le même stockage.
        const autre = monter(banc.db);
        const etat = autre.verifier.etatVerification(autre.registre()[DOSSIER]);
        expect(etat.verifiee).toBe(true);
        expect(etat.texte).toMatch(/^Vérifiée le \d{1,2} \S+ \d{4}$/);
    }, 30000);

    it('mode fichier : un nouvel archivage du même groupe (« Il y est ») remet l\'entrée à « Non vérifiée »', async () => {
        const banc = await archiverEnFichier();
        banc.verifier.retenirResultat(DOSSIER, await verifierFichier(banc, banc.blob));
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER]).verifiee).toBe(true);
        const rendu2 = await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        expect(rendu2.succes).toBe(true);
        expect(rendu2.uuid).not.toBe(banc.rendu.uuid);
        expect(banc.registre()[DOSSIER].verification).toBeUndefined();
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER])).toMatchObject({ verifiee: false, texte: 'Non vérifiée' });
    }, 30000);

    it('mode dossier : le même', async () => {
        const banc = await archiverEnDossier();
        banc.verifier.retenirResultat(DOSSIER, await verifierDossier(banc, banc.dossier));
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER]).verifiee).toBe(true);
        await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        expect(banc.registre()[DOSSIER].verification).toBeUndefined();
    }, 30000);

    it('une vérification qui porte l\'uuid d\'une autre archive ne vaut pas pour la ligne', async () => {
        const banc = await archiverEnFichier();
        const entree = Object.assign({}, banc.registre()[DOSSIER], { uuid: 'autre-uuid' });
        banc.verifier.retenirResultat(DOSSIER, await verifierFichier(banc, banc.blob));
        const v = banc.registre()[DOSSIER].verification;
        expect(banc.verifier.etatVerification(Object.assign({}, entree, { verification: v })).verifiee).toBe(false);
    }, 30000);

    it('le fichier d\'une AUTRE archive (autre uuid) n\'est pas jugé ni retenu : « autre_archive »', async () => {
        const banc = await archiverEnFichier();
        const rendu2 = await banc.reserve.verserGroupeCours(TRIMESTRE, GC); // nouvelle archive, nouvel uuid listé
        expect(rendu2.uuid).not.toBe(banc.rendu.uuid);
        const rapport = await verifierFichier(banc, banc.blob); // l'ancien fichier
        expect(rapport.etat).toBe('autre_archive');
        expect(rapport.total).toBe(0);
        const cr = banc.verifier.compteRendu(rapport);
        expect(cr.titre).toBe('Ce n\'est pas cette archive');
        // Par le geste complet : la fenêtre le dit, et RIEN n'est retenu sur la ligne (mutation M20, 30 sept.).
        await banc.verifier.executer(DOSSIER, banc.registre()[DOSSIER], banc.verifier.sourceFichier(banc.blob));
        expect(banc.journal.fenetres.map((f) => f.titre)).toEqual(['Ce n\'est pas cette archive']);
        expect(banc.registre()[DOSSIER].verification).toBeUndefined();
    }, 30000);

    it('le geste complet (executer) : progression « N copies sur M », fenêtre « Archive vérifiée », état retenu', async () => {
        const banc = await archiverEnFichier();
        banc.journal.progression.length = 0; // la barre de l'archivage n'est pas jugée ici
        const rapport = await banc.verifier.executer(DOSSIER, banc.registre()[DOSSIER], banc.verifier.sourceFichier(banc.blob));
        expect(rapport.etat).toBe('verifiee');
        expect(banc.journal.progression[0]).toEqual({ titre: 'Vérification de l\'archive…' });
        expect(banc.journal.progression.some((p) => p.s === '4 copies sur 4')).toBe(true);
        expect(banc.journal.fenetres).toEqual([{ titre: 'Archive vérifiée', message: 'Les 4 copies sont présentes et intactes, et les données concordent.' }]);
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER]).verifiee).toBe(true);
    }, 30000);

    it('le geste complet sur une archive incomplète : fenêtre « Archive incomplète », état retenu « incomplete »', async () => {
        const banc = await archiverEnDossier();
        await MUTATIONS.alteree(banc.dossier);
        await MUTATIONS.absente(banc.dossier);
        await banc.verifier.executer(DOSSIER, banc.registre()[DOSSIER], banc.verifier.sourceDossier(banc.dossier, DOSSIER));
        expect(banc.journal.fenetres[0].titre).toBe('Archive incomplète');
        expect(banc.journal.fenetres[0].message.split('\n')[0]).toBe('2 copies sur 4 manquent ou ne concordent pas. Archive de nouveau ce groupe.');
        expect(banc.journal.fenetres[0].message).toContain('1 absentes');
        expect(banc.journal.fenetres[0].message).toContain('1 altérées');
        expect(banc.registre()[DOSSIER].verification.etat).toBe('incomplete');
        expect(banc.verifier.etatVerification(banc.registre()[DOSSIER]).texte).toBe('Non vérifiée');
    }, 30000);

    it('le geste complet sur un fichier illisible : notification d\'erreur, rien retenu', async () => {
        const banc = await archiverEnFichier();
        const rapport = await banc.verifier.executer(DOSSIER, banc.registre()[DOSSIER], banc.verifier.sourceFichier(new Blob([octets(5000, 7)])));
        expect(rapport).toBeNull();
        expect(banc.journal.notifications.filter((n) => n.type === 'erreur').map((n) => n.titre)).toEqual(['Archive illisible']);
        expect(banc.registre()[DOSSIER].verification).toBeUndefined();
    }, 30000);
});

describe('lot A2 · (e) le fichier n\'est jamais lu en entier', () => {
    it('mode fichier : ni arrayBuffer() ni stream() sur le fichier ; chaque tranche lue est au plus une entrée (la plus grosse copie), jamais le fichier', async () => {
        const banc = await archiverEnFichier();
        const { fichier, tranches } = fichierSurveille(banc.blob);
        const rapport = await verifierFichier(banc, fichier);
        expect(rapport.etat).toBe('verifiee');
        expect(tranches.length).toBeGreaterThan(4);
        expect(Math.max(...tranches)).toBe(COPIES.FT_a2_grosse.length);
        expect(Math.max(...tranches)).toBeLessThan(banc.blob.size);
        // Témoin de la mesure : la somme des tranches est proche du fichier (chaque octet lu une fois, plus la queue).
        expect(tranches.reduce((s, t) => s + t, 0)).toBeLessThan(banc.blob.size + 70000);
    }, 30000);

    it('le répertoire central se lit par une tranche de fin, et JSZip n\'est pas appelé', async () => {
        const banc = await archiverEnFichier();
        const entrees = await banc.verifier.lireRepertoireZip(banc.blob);
        expect(entrees.map((e) => e.nom)).toContain('trimestres/' + DOSSIER + '/travaux/FT_a2_grosse.pdf');
        expect(entrees.find((e) => /FT_a2_grosse/.test(e.nom))).toMatchObject({ methode: 0, tailleReelle: COPIES.FT_a2_grosse.length });
        expect(entrees.find((e) => /meta\.json/.test(e.nom)).methode).toBe(8);
    }, 30000);

    it('témoin : une lecture du fichier entier serait vue par le banc ; et reserve-verifier.js ne nomme jamais JSZip', async () => {
        const banc = await archiverEnFichier();
        const { fichier } = fichierSurveille(banc.blob);
        expect(() => banc.win.JSZip.loadAsync(fichier)).toThrow(/entier/);
        expect(() => fichier.arrayBuffer()).toThrow(/entier/);
        const source = readFileSync(path.join(racine, 'js/reserve-verifier.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
        expect(source).not.toMatch(/JSZip/);
    }, 30000);
});

describe('lot A2 · (f) les mots acceptés par Grégoire (30 sept., 16 h 26), en un seul endroit', () => {
    it('ReserveVerifier.MOTS porte les mots du § 3, et reserve-reglages.js n\'en recopie aucun', () => {
        const banc = monter(creerDb({}));
        const M = banc.verifier.MOTS;
        expect(M.bouton).toBe('Vérifier');
        expect(M.enCours).toBe('Vérification de l\'archive…');
        expect(M.compte(3, 205)).toBe('3 copies sur 205');
        expect(M.reussite.titre).toBe('Archive vérifiée');
        expect(M.reussite.texte(205)).toBe('Les 205 copies sont présentes et intactes, et les données concordent.');
        expect(M.echec.titre).toBe('Archive incomplète');
        expect(M.echec.texte(2, 205)).toBe('2 copies sur 205 manquent ou ne concordent pas. Archive de nouveau ce groupe.');
        expect(M.sansEmpreintes.titre).toBe('Archive à refaire');
        expect(M.sansEmpreintes.texte).toBe('Cette archive date d\'avant les empreintes : elle ne peut pas être vérifiée copie par copie. Archive de nouveau ce groupe.');
        expect(M.liste.verifiee('30 septembre 2026')).toBe('Vérifiée le 30 septembre 2026');
        expect(M.liste.nonVerifiee).toBe('Non vérifiée');
        const reglages = readFileSync(path.join(racine, 'js/reserve-reglages.js'), 'utf8');
        for (const mot of ['Archive vérifiée', 'Archive incomplète', 'Archive à refaire', 'Non vérifiée', 'Vérifiée le', '>Vérifier<', '\'Vérifier\'']) {
            expect(reglages).not.toContain(mot);
        }
        expect(reglages).toContain('RV.MOTS.bouton');
        expect(reglages).toContain('ReserveVerifier.actionVerifier');
    });
});

describe('lot A2 · (g) le dossier choisi dans Chrome (trouvailles de la porte du lot A1)', () => {
    it('deux archivages dans la même page ne demandent le dossier qu\'une fois, et le statut voit le dossier lié', async () => {
        const banc = await archiverEnDossier();
        expect(banc.journal.selecteurs).toBe(1);
        const statut = await banc.reserve.statutHandle();
        expect(statut.handle).toBe(banc.dossier);
        expect(statut.nom).toBe('Archives_LaboCodex');
        expect(statut.persiste).toBe(false); // la préférence D-03 reste refusée par défaut
        await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        expect(banc.journal.selecteurs).toBe(1);
        // « Vérifier » emploie le même dossier, sans redemander.
        const handle = await banc.reserve.obtenirHandle();
        expect(handle).toBe(banc.dossier);
        expect(banc.journal.selecteurs).toBe(1);
    }, 30000);

    it('« Effacer la liaison » oublie aussi le dossier de la page', async () => {
        const banc = await archiverEnDossier();
        await banc.reserve.effacerLiaisonFSAPI();
        expect((await banc.reserve.statutHandle()).handle).toBeNull();
        await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
        expect(banc.journal.selecteurs).toBe(2);
    }, 30000);

    it('le mauvais niveau (« trimestres », « travaux », ou le dossier d\'une archive) est refusé : l\'usager est prévenu, rien n\'est archivé, aucun ZIP ne part', async () => {
        for (const mauvais of [fauxDossier('trimestres'), fauxDossier('travaux')]) {
            const banc = monter(creerDb(CORPUS), { dossier: mauvais });
            const rendu = await banc.reserve.verserGroupeCours(TRIMESTRE, GC);
            expect(rendu).toBeNull();
            expect(banc.journal.notifications.map((n) => n.type + ':' + n.titre)).toEqual(['erreur:Dossier à choisir de nouveau']);
            expect(banc.journal.telechargements).toEqual([]);
            expect(Object.keys(banc.registre())).toEqual([]);
        }
        const archive = fauxDossier('a2026-601-101-gr00007');
        await (await archive.getFileHandle('meta.json', { create: true })).createWritable().then((w) => w.close());
        const banc = monter(creerDb(CORPUS), { dossier: archive });
        expect(await banc.reserve.verserGroupeCours(TRIMESTRE, GC)).toBeNull();
        expect(banc.journal.notifications[0].titre).toBe('Dossier à choisir de nouveau');
        // Un dossier vide au bon niveau est accepté.
        const bon = await archiverEnDossier({ dossier: fauxDossier('Mes archives') });
        expect(bon.rendu.succes).toBe(true);
    }, 30000);
});
