#!/usr/bin/env node
/**
 * #992 — FABRIQUER UN CODEX FICTIF D'ENVIRON 1 GO, POUR MESURER SON OUVERTURE.
 *
 * POURQUOI. L'ouverture d'un codex (« Ouvrir un codex… ») lit le fichier entier en mémoire
 * (`validerCodex`, `_lireCommeArrayBuffer`, js/codex.js) et n'a jamais été mesurée à grande
 * taille, ni sur le Mac ni sur l'iPad (BACKLOG #992). Ce script fabrique le fichier de la mesure.
 * Porte terrain : `plans de travail/PORTES-TERRAIN-2026-11-09-ouverture-codex-1go.md`.
 *
 * AUCUNE DONNÉE RÉELLE. Le script n'ouvre ni ne lit rien de l'application : tout est inventé.
 * Noms manifestement fictifs (« Élève FICTIF-001 »), DA en 99xxxxx, trimestre `a2099` (aucun
 * trimestre réel ne porte ce préfixe), copies faites d'octets aléatoires sous une page qui dit
 * « COPIE FICTIVE ». Une seule clé globale, le drapeau de la migration #684 (voir plus bas) :
 * ouvert par erreur dans un espace réel, le fichier AJOUTERAIT un trimestre a2099 et ses copies,
 * il ne remplacerait aucune donnée existante (l'ouverture n'efface rien d'elle-même : la purge de
 * l'espace précédent n'est qu'un aperçu en console). Le menu Codex prendrait son nom, cependant.
 *
 * CE QU'IL IMITE (composition du codex réel du 29 sept. 2026, mesurée en lecture seule,
 * `plans de travail/MESURE-2026-09-30-lot-J0-codex-memoire.md` § 2) :
 *   · des copies PDF (368 des 500 copies réelles, 95 % du poids), médiane 1,35 Mo, plus grosse
 *     23,6 Mo, incompressibles (octets aléatoires), RANGÉES sans compression comme le fait
 *     `FichierSortant.assemblerZip` ;
 *   · un `donnees.json` d'environ 2 % du fichier (26,3 Mo pour 1,33 Go au réel), compressé ;
 *     il porte des vignettes `thumbnail_<id>` (≈ 38 % des copies, 4 à 25 K caractères) ;
 *   · l'ordre des entrées : donnees.json, travaux/, codex-manifeste.json, puis les copies.
 * CE QU'IL N'IMITE PAS : les photos JPEG et HEIC (3 % du poids réel) ; la variété des clés d'un
 * vrai trimestre (évaluations, présences…), remplacée par du remplissage de même poids.
 *
 * CE QUI EST FIXE D'UNE FOIS SUR L'AUTRE : le nombre de copies et leurs tailles (graine fixe),
 * donc le nombre de fichiers attendu à l'ouverture. Seuls les octets aléatoires changent.
 *
 * USAGE (une seule commande, dans l'app Terminal du Mac ; Node seul, aucune dépendance)
 *   node scripts/fabriquer-codex-fictif.mjs [--taille 1000] [--sortie chemin/du/fichier.zip]
 *     --taille : taille visée du fichier, en Mo (millions d'octets). Défaut : 1000.
 *     --sortie : défaut, Téléchargements (~/Downloads), sinon le dossier courant.
 *
 * Limites du format (pas de ZIP64, comme l'application) : moins de 4 Go et de 65 535 entrées.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { randomFillSync } from 'node:crypto';

const MO = 1000 * 1000;
const TRIMESTRE = 'a2099';
const GRAINE = 992;
const LISTES_DE_FICHIERS = ['fichiersTravaux', 'corbeilleFichiers', 'fichiersModelisation'];

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function option(nom, defaut) {
    const i = args.indexOf(nom);
    return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : defaut;
}
const tailleMo = Number(option('--taille', '1000'));
if (!Number.isFinite(tailleMo) || tailleMo < 5 || tailleMo > 4000) {
    console.error('--taille doit être un nombre de Mo entre 5 et 4000.');
    process.exit(1);
}
const nomParDefaut = `CODEX-FICTIF-mesure-992-${tailleMo}Mo.zip`;
// Téléchargements plutôt que le Bureau : sur un Mac dont le Bureau est synchronisé par iCloud,
// le fichier d'un gigaoctet partirait dans le nuage.
const telechargements = path.join(os.homedir(), 'Downloads');
const sortie = path.resolve(option('--sortie', path.join(fs.existsSync(telechargements) ? telechargements : process.cwd(), nomParDefaut)));

// ---------------------------------------------------------------------------
// Hasard reproductible pour les TAILLES (mulberry32) ; les octets, eux, viennent de crypto.
// ---------------------------------------------------------------------------
function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const hasard = mulberry32(GRAINE);
function normale() {
    const u = Math.max(hasard(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * hasard());
}
const pad = (n, l) => String(n).padStart(l, '0');

// ---------------------------------------------------------------------------
// CRC-32 (celui du ZIP et du PNG) : zlib.crc32 quand Node l'a, sinon une table.
// ---------------------------------------------------------------------------
let tableCrc = null;
function crc32(octets, crc = 0) {
    if (typeof zlib.crc32 === 'function') return zlib.crc32(octets, crc);
    if (!tableCrc) {
        tableCrc = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            tableCrc[n] = c >>> 0;
        }
    }
    let c = (crc ^ 0xFFFFFFFF) >>> 0;
    for (let i = 0; i < octets.length; i++) c = tableCrc[(c ^ octets[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

// ---------------------------------------------------------------------------
// Une copie : un vrai PDF d'une page (« COPIE FICTIVE »), alourdi d'un flux d'octets
// aléatoires que rien n'affiche. Lisible par un lecteur de PDF ; incompressible.
// ---------------------------------------------------------------------------
function fabriquerPdf(numero, tailleVisee) {
    const texte = `BT /F1 28 Tf 72 700 Td (COPIE FICTIVE) Tj 0 -40 Td /F1 16 Tf (Mesure 992, copie ${pad(numero, 4)}) Tj 0 -24 Td (Aucune donnee reelle.) Tj ET`;
    const objets = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
        `<< /Length ${texte.length} >>\nstream\n${texte}\nendstream`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ];
    let tete = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const decalages = [];
    objets.forEach((o, i) => { decalages.push(Buffer.byteLength(tete, 'latin1')); tete += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    decalages.push(Buffer.byteLength(tete, 'latin1'));
    const finFlux = '\nendstream\nendobj\n';
    // La longueur du flux et la position de la table se disent en chiffres : leur nombre de
    // chiffres change la taille du fichier. Trois passes suffisent pour tomber juste.
    let remplissage = Math.max(0, tailleVisee - Buffer.byteLength(tete, 'latin1') - 300);
    let enTeteFlux = '';
    let queue = '';
    for (let passe = 0; passe < 4; passe++) {
        enTeteFlux = `6 0 obj\n<< /Length ${remplissage} >>\nstream\n`;
        const debutXref = Buffer.byteLength(tete + enTeteFlux, 'latin1') + remplissage + finFlux.length;
        queue = finFlux + 'xref\n0 7\n0000000000 65535 f \n';
        decalages.forEach((d) => { queue += `${pad(d, 10)} 00000 n \n`; });
        queue += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${debutXref}\n%%EOF\n`;
        const total = Buffer.byteLength(tete + enTeteFlux + queue, 'latin1') + remplissage;
        if (total === tailleVisee || remplissage + (tailleVisee - total) < 0) break;
        remplissage += tailleVisee - total;
    }
    const octets = Buffer.allocUnsafe(Buffer.byteLength(tete + enTeteFlux, 'latin1') + remplissage + Buffer.byteLength(queue, 'latin1'));
    let p = octets.write(tete + enTeteFlux, 0, 'latin1');
    randomFillSync(octets, p, remplissage);
    p += remplissage;
    octets.write(queue, p, 'latin1');
    return octets;
}

// ---------------------------------------------------------------------------
// Une vignette : un vrai PNG gris de 64 × 64, alourdi d'un bloc annexe (« fiLl ») que les
// lecteurs ignorent. Rendue comme l'application les garde : une adresse data: en base64.
// ---------------------------------------------------------------------------
function blocPng(type, donnees) {
    const longueur = Buffer.alloc(4); longueur.writeUInt32BE(donnees.length);
    const typeEtDonnees = Buffer.concat([Buffer.from(type, 'latin1'), donnees]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(typeEtDonnees));
    return Buffer.concat([longueur, typeEtDonnees, crc]);
}
function fabriquerVignette(caracteresVises) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(64, 0); ihdr.writeUInt32BE(64, 4);
    ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;   // 8 bits, gris
    const lignes = Buffer.alloc(64 * 65, 0xC8);
    for (let y = 0; y < 64; y++) lignes[y * 65] = 0;                       // filtre « aucun »
    const base = [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), blocPng('IHDR', ihdr), blocPng('IDAT', zlib.deflateSync(lignes))];
    const octetsVises = Math.floor(caracteresVises * 3 / 4);
    const dejaLa = base.reduce((s, b) => s + b.length, 0) + 12 + 12;      // + IEND + en-tête du bloc
    const bourre = Buffer.allocUnsafe(Math.max(0, octetsVises - dejaLa));
    randomFillSync(bourre);
    const png = Buffer.concat([...base, blocPng('fiLl', bourre), blocPng('IEND', Buffer.alloc(0))]);
    return 'data:image/png;base64,' + png.toString('base64');
}

// ---------------------------------------------------------------------------
// Le contenu : élèves, productions, copies, vignettes, remplissage.
// ---------------------------------------------------------------------------
const NB_ELEVES = 70;
const NB_PRODUCTIONS = 8;
const eleves = Array.from({ length: NB_ELEVES }, (_, i) => ({
    da: '99' + pad(i + 1, 5),
    nom: 'FICTIF-' + pad(i + 1, 3),
    prenom: 'Élève',
    groupe: i < NB_ELEVES / 2 ? '09901' : '09902'
}));
const productions = Array.from({ length: NB_PRODUCTIONS }, (_, i) => ({
    id: 'PROD_fictif992_' + (i + 1),
    titre: 'Production fictive ' + (i + 1) + ' (mesure 992)',
    description: 'Aucune donnée réelle.'
}));

const octetsJsonVises = Math.round(tailleMo * MO * 0.02);              // ≈ 2 % du fichier, comme au réel
const octetsCopiesVises = tailleMo * MO - Math.round(octetsJsonVises / 2.8);   // le JSON se compresse ≈ 2,8 fois
const tailles = [];
let somme = 0;
while (somme < octetsCopiesVises) {
    const t = Math.round(Math.min(23.6 * MO, Math.max(60 * 1000, 1.35 * MO * Math.exp(normale()))));
    const reste = octetsCopiesVises - somme;
    const ti = reste < 60 * 1000 ? Math.max(reste, 2000) : Math.min(t, reste);
    tailles.push(ti);
    somme += ti;
}
if (tailles.length + 3 >= 0xFFFF) { console.error('Trop de copies pour le format ZIP.'); process.exit(1); }

const fiches = tailles.map((taille, i) => {
    const eleve = eleves[i % NB_ELEVES];
    return {
        id: 'FT_fictif992_' + pad(i + 1, 4),
        nomFichier: 'copie-fictive-' + pad(i + 1, 4) + '.pdf',
        typeMIME: 'application/pdf',
        taille,
        etudiantDA: eleve.da,
        productionId: productions[Math.floor(i / NB_ELEVES) % NB_PRODUCTIONS].id,
        blobStatut: 'present',
        dateImport: '2099-09-15T12:00:00.000Z'
    };
});

const donnees = {};
// La seule clé globale, et elle ne change rien : l'ouverture d'un codex qui n'a pas ce drapeau
// le RETIRE de l'espace (`_drapeau684SuitLeCodex`, js/codex.js), ce qui relancerait la migration
// des noms du matériel de départ au démarrage suivant (js/main.js, #684). Le porter évite qu'une
// ouverture par erreur dans un espace réel y réveille cette migration.
donnees['migration_noms_materiel_depart_684_20261015_done'] = '2026-11-09';
donnees[TRIMESTRE + '_groupeEtudiants'] = eleves;
donnees[TRIMESTRE + '_productions'] = productions;
donnees[TRIMESTRE + '_fichiersTravaux'] = fiches;
let octetsJson = 0;
fiches.forEach((f, i) => {
    if (hasard() < 0.38) {
        const v = fabriquerVignette(4000 + Math.floor(hasard() * 21000));
        donnees['thumbnail_' + f.id] = v;
        octetsJson += v.length;
    }
});
// Remplissage : des enregistrements qui se compressent comme du vrai JSON (≈ 3 fois), répartis
// sur une vingtaine de clés, comme le banc du lot J0.
const MOTS = ['fictif', 'mesure', 'critere', 'niveau', 'commentaire', 'reprise', 'production', 'seance', 'presence', 'echelle', 'grille', 'retroaction'];
const nbClesRemplissage = 20;
const parCle = Math.max(0, (octetsJsonVises - octetsJson) / nbClesRemplissage);
for (let k = 1; k <= nbClesRemplissage && parCle > 0; k++) {
    const enregistrements = [];
    let poids = 0;
    while (poids < parCle) {
        const e = {
            id: 'R' + Math.floor(hasard() * 1e12).toString(36),
            da: eleves[Math.floor(hasard() * NB_ELEVES)].da,
            note: Math.round(hasard() * 1000) / 10,
            texte: Array.from({ length: 12 }, () => MOTS[Math.floor(hasard() * MOTS.length)]).join(' ')
        };
        poids += JSON.stringify(e).length + 1;
        enregistrements.push(e);
    }
    donnees[TRIMESTRE + '_remplissageMesure992_' + pad(k, 2)] = enregistrements;
}

const json = Buffer.from(JSON.stringify(donnees), 'utf8');
const totalCopies = tailles.reduce((s, t) => s + t, 0);
const manifeste = {
    formatVersion: 1,
    appVersion: 'FICTIF (mesure 992)',
    nom: `FICTIF mesure 992 (${tailleMo} Mo)`,
    auteur: 'Personne fictive',
    dateCreation: new Date().toISOString(),
    dateDerniereModification: new Date().toISOString(),
    appareil: 'Script de fabrication',
    navigateur: 'aucun',
    userAgent: 'scripts/fabriquer-codex-fictif.mjs',
    trimestre: TRIMESTRE,
    contenu: {
        cles: Object.keys(donnees),
        nombreFichiersTravaux: fiches.length,
        tailleTotaleOctets: json.length + totalCopies,
        listesDeFichiers: LISTES_DE_FICHIERS.slice()
    },
    fictif: 'Codex fabriqué pour la mesure #992 : aucune donnée réelle. Ne pas ouvrir à app.codexnumeris.org.'
};

// ---------------------------------------------------------------------------
// L'écriture du ZIP, entrée par entrée, sans tout garder en mémoire.
// ---------------------------------------------------------------------------
const d = new Date();
const heureDos = (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1);
const dateDos = ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate();

fs.mkdirSync(path.dirname(sortie), { recursive: true });
const temporaire = sortie + '.partiel';
const fd = fs.openSync(temporaire, 'w');
let position = 0;
const repertoire = [];
function ecrire(buffer) { fs.writeSync(fd, buffer, 0, buffer.length, position); position += buffer.length; }

function ajouterEntree(nom, contenu, { compresser = false, dossier = false } = {}) {
    const nomOctets = Buffer.from(nom, 'utf8');
    const crc = dossier ? 0 : crc32(contenu);
    const donneesZip = dossier ? Buffer.alloc(0) : (compresser ? zlib.deflateRawSync(contenu, { level: 6 }) : contenu);
    const methode = compresser ? 8 : 0;
    const versionRequise = compresser ? 20 : 10;
    if (position + 30 + nomOctets.length + donneesZip.length > 0xFFFFFFFF) {
        throw new Error('Le fichier dépasserait la limite du format ZIP (4 Go).');
    }
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(versionRequise, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(methode, 8); local.writeUInt16LE(heureDos, 10); local.writeUInt16LE(dateDos, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(donneesZip.length, 18); local.writeUInt32LE(dossier ? 0 : contenu.length, 22);
    local.writeUInt16LE(nomOctets.length, 26); local.writeUInt16LE(0, 28);
    repertoire.push({ nomOctets, crc, methode, versionRequise, compresse: donneesZip.length, brut: dossier ? 0 : contenu.length, decalage: position, dossier });
    ecrire(local); ecrire(nomOctets); if (donneesZip.length) ecrire(donneesZip);
}

const debut = Date.now();
try {
    ajouterEntree('donnees.json', json, { compresser: true });
    ajouterEntree('travaux/', null, { dossier: true });
    ajouterEntree('codex-manifeste.json', Buffer.from(JSON.stringify(manifeste, null, 2), 'utf8'), { compresser: true });
    let fait = 0;
    fiches.forEach((f, i) => {
        ajouterEntree('travaux/' + f.id + '.pdf', fabriquerPdf(i + 1, f.taille));
        fait += f.taille;
        if (i % 25 === 0) process.stdout.write(`\r  copies : ${i + 1}/${fiches.length} (${Math.round(fait / MO)} Mo)   `);
    });
    process.stdout.write(`\r  copies : ${fiches.length}/${fiches.length} (${Math.round(fait / MO)} Mo)   \n`);

    const debutRepertoire = position;
    repertoire.forEach((e) => {
        const c = Buffer.alloc(46);
        c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(e.versionRequise, 6); c.writeUInt16LE(0, 8);
        c.writeUInt16LE(e.methode, 10); c.writeUInt16LE(heureDos, 12); c.writeUInt16LE(dateDos, 14);
        c.writeUInt32LE(e.crc, 16); c.writeUInt32LE(e.compresse, 20); c.writeUInt32LE(e.brut, 24);
        c.writeUInt16LE(e.nomOctets.length, 28); c.writeUInt16LE(0, 30); c.writeUInt16LE(0, 32);
        c.writeUInt16LE(0, 34); c.writeUInt16LE(0, 36); c.writeUInt32LE(e.dossier ? 0x10 : 0, 38); c.writeUInt32LE(e.decalage, 42);
        ecrire(c); ecrire(e.nomOctets);
    });
    const fin = Buffer.alloc(22);
    fin.writeUInt32LE(0x06054b50, 0);
    fin.writeUInt16LE(repertoire.length, 8); fin.writeUInt16LE(repertoire.length, 10);
    fin.writeUInt32LE(position - debutRepertoire, 12); fin.writeUInt32LE(debutRepertoire, 16);
    if (position + 22 > 0xFFFFFFFF) throw new Error('Le fichier dépasserait la limite du format ZIP (4 Go).');
    ecrire(fin);
    fs.closeSync(fd);
    fs.renameSync(temporaire, sortie);
} catch (e) {
    try { fs.closeSync(fd); } catch (_) { /* déjà fermé */ }
    try { fs.unlinkSync(temporaire); } catch (_) { /* rien à retirer */ }
    console.error('Échec : ' + (e.message || e));
    process.exit(1);
}

const taille = fs.statSync(sortie).size;
process.stdout.write([
    '',
    '==== CODEX FICTIF #992 : FABRIQUÉ ====',
    `Fichier        : ${sortie}`,
    `Taille         : ${(taille / MO).toFixed(1)} Mo (${taille} octets)`,
    `Copies         : ${fiches.length} (fichiers attendus à l'ouverture : ${fiches.length})`,
    `Clés           : ${Object.keys(donnees).length} (dont ${Object.keys(donnees).filter((k) => k.startsWith('thumbnail_')).length} vignettes)`,
    `donnees.json   : ${(json.length / MO).toFixed(1)} Mo avant compression`,
    `Durée          : ${((Date.now() - debut) / 1000).toFixed(1)} s`,
    'Aucune donnée réelle. À ouvrir SEULEMENT à l\'adresse de test de la porte terrain, jamais à app.codexnumeris.org.',
    ''
].join('\n'));
