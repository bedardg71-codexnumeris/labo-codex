/* ===============================
   MODULE : FICHIER SORTANT
   Date : 30 septembre 2026 (lot A1 du chantier des archives)

   Vocation
     Ce qu'un fichier qui SORT de l'application a en commun, qu'il soit un codex
     (codex.js) ou une archive (reserve.js) : son assemblage sans faire passer les
     copies par la mémoire, son téléchargement, et la règle qui veut que ce soit
     l'usager qui dise si le fichier téléchargé est là.

     Ces pièces sont nées dans codex.js (lots G et J0, #988). Elles sont ici pour
     que reserve.js les emploie sans dépendre de codex.js (SPEC-RESERVE-V1) et
     sans les recopier.

   Dépendances
     - JSZip : seulement par l'objet que l'appelant passe à `assemblerZip`
     - ui-dialogues.js (window.uiDialogues.confirmerAction)
     - taille-fichier.js (window.TailleFichier.dire : la limite du format ZIP, dite)

   API : window.FichierSortant
     - assemblerZip(zipTextes, copies, surProgression) → Promise<Blob>
     - entreesDuZip(zipTextes, copies, dossierDesCopies) → { forEach }
     - telecharger(blob, nomFichier) → { methode, strategie }
     - confirmerTelechargement(nomFichier, taille) → Promise<boolean>
   La taille dite à l'usager : window.TailleFichier (taille-fichier.js, #993).
   =============================== */

(function() {
'use strict';

/* ===============================
   ASSEMBLAGE DU FICHIER (lot J0, #988)
   =============================== */

// Sur l'iPad, la page mourait pendant « Compression du ZIP… » (codex réel de 1,33 Go,
// 30 sept. 2026). Mesuré sous WebKit : confier les copies à JSZip prenait en mémoire cinq
// fois la taille du codex, et posait le fichier entier une fois de plus sur le disque avant
// toute écriture. Les copies (PDF, images) sont déjà compressées : DEFLATE n'y gagnait que
// 3,4 %. Elles sont donc rangées telles quelles (STORE), et par RÉFÉRENCE : le Blob rendu
// pointe vers les copies du stockage, il ne les recopie pas. Seuls les textes (données,
// manifeste) passent encore par JSZip. Le fichier reste un ZIP ordinaire, lu comme avant.
// Mesures : plans de travail/MESURE-2026-09-30-lot-J0-codex-memoire.md (le codex),
// plans de travail/MESURE-2026-09-30-archives.md § 2 (l'archive, même mur).

/** Sans ZIP64, ni une entrée ni le fichier ne dépassent 4 Go, ni 65 535 entrées. */
var LIMITE_ZIP_OCTETS = 0xFFFFFFFF;
var LIMITE_ZIP_ENTREES = 0xFFFF;
/** Une copie est lue par tranches pour son CRC : la mémoire prise est celle d'une tranche. */
var TRANCHE_CRC_OCTETS = 4 * 1024 * 1024;

var _tableCrc32 = null;

/** CRC-32 (celui du format ZIP) d'une suite d'octets, à la suite de `crc` (0 au départ). */
function _crc32(octets, crc) {
    if (!_tableCrc32) {
        _tableCrc32 = new Uint32Array(256);
        for (var n = 0; n < 256; n++) {
            var c = n;
            for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            _tableCrc32[n] = c >>> 0;
        }
    }
    var table = _tableCrc32;
    var etat = (crc ^ 0xFFFFFFFF) >>> 0;
    for (var i = 0; i < octets.length; i++) {
        etat = table[(etat ^ octets[i]) & 0xFF] ^ (etat >>> 8);
    }
    return (etat ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Ce que le fichier contiendra, sous la forme que lisent la Défense K et l'aperçu
 * (`forEach(chemin, entree)`), dans l'ordre d'avant le lot J0 : les copies sous leur dossier.
 * @param {JSZip} zipTextes
 * @param {Array<{nom: string, blob: Blob}>} copies
 * @param {string} dossierDesCopies - le chemin du dossier des copies, barre finale comprise
 */
function entreesDuZip(zipTextes, copies, dossierDesCopies) {
    return {
        forEach: function(rappel) {
            zipTextes.forEach(function(chemin, entree) {
                rappel(chemin, entree);
                if (chemin === dossierDesCopies) {
                    copies.forEach(function(copie) { rappel(copie.nom, { dir: false }); });
                }
            });
        }
    };
}

/**
 * Assemble le fichier : les entrées de `zipTextes` compressées par JSZip, puis les copies
 * rangées telles quelles, par référence (voir l'en-tête de la section).
 * @param {JSZip} zipTextes - données, manifeste, dossier des copies
 * @param {Array<{nom: string, blob: Blob}>} copies
 * @param {function(number): void} [surProgression] - pourcentage de 0 à 100
 * @returns {Promise<Blob>}
 */
async function assemblerZip(zipTextes, copies, surProgression) {
    var textes = await zipTextes.generateAsync(
        { type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } }
    );
    // Le ZIP de JSZip finit par son répertoire central puis 22 octets de clôture (sans
    // commentaire). On le rouvre là : ses entrées restent en tête du fichier, à leurs
    // positions ; son répertoire est repris tel quel, suivi de celui des copies.
    var vue = new DataView(textes.buffer, textes.byteOffset, textes.byteLength);
    var cloture = textes.length - 22;
    if (cloture < 0 || vue.getUint32(cloture, true) !== 0x06054b50) {
        throw new Error('Assemblage du fichier : clôture du ZIP des textes introuvable.');
    }
    var nbTextes = vue.getUint16(cloture + 10, true);
    var tailleRepertoire = vue.getUint32(cloture + 12, true);
    var debutRepertoire = vue.getUint32(cloture + 16, true);
    if (debutRepertoire + tailleRepertoire !== cloture) {
        throw new Error('Assemblage du fichier : répertoire du ZIP des textes inattendu.');
    }
    if (nbTextes + copies.length > LIMITE_ZIP_ENTREES) {
        throw new Error('Il y a trop de fichiers pour le format ZIP (' + (nbTextes + copies.length) + ').');
    }

    // Les bornes du format se jugent AVANT de lire une seule copie : tout est déjà connu
    // (30 octets d'entrée et 46 de fiche par copie, son nom deux fois, son contenu une fois).
    var encodeur = new TextEncoder();
    var noms = [];
    var octetsTotal = 0;
    var tailleFinale = textes.length;
    for (var t = 0; t < copies.length; t++) {
        noms.push(encodeur.encode(copies[t].nom));
        octetsTotal += copies[t].blob.size;
        tailleFinale += 30 + 46 + 2 * noms[t].length + copies[t].blob.size;
    }
    if (tailleFinale > LIMITE_ZIP_OCTETS) {
        throw new Error('Le fichier dépasse ce que le format ZIP peut contenir (' +
            window.TailleFichier.dire(LIMITE_ZIP_OCTETS, { decimales: 0 }) + ').');
    }

    var morceaux = [textes.subarray(0, debutRepertoire)];
    var repertoire = [textes.subarray(debutRepertoire, cloture)];
    var position = debutRepertoire;
    // Heure et date au format DOS, en temps universel comme le fait JSZip.
    var d = new Date();
    var heureDos = (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1);
    var dateDos = ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate();

    var octetsLus = 0;

    for (var i = 0; i < copies.length; i++) {
        var blob = copies[i].blob;
        var nom = noms[i];
        var taille = blob.size;
        var crc = 0;
        for (var o = 0; o < taille; o += TRANCHE_CRC_OCTETS) {
            var tampon = await blob.slice(o, o + TRANCHE_CRC_OCTETS).arrayBuffer();
            crc = _crc32(new Uint8Array(tampon), crc);
            octetsLus += tampon.byteLength;
            // Rendre la tranche tout de suite : laissées au ramasse-miettes, elles
            // s'empilaient (mesuré : jusqu'à 1,2 Go pour 2,4 Go de copies).
            if (typeof tampon.transfer === 'function') tampon.transfer(0);
            if (surProgression) surProgression(octetsTotal ? (octetsLus / octetsTotal) * 100 : 100);
        }
        // Drapeau 0x0800 : nom en UTF-8, s'il sort de l'ASCII.
        var drapeaux = copies[i].nom.length === nom.length ? 0 : 0x0800;

        var enTete = new Uint8Array(30 + nom.length);
        var v = new DataView(enTete.buffer);
        v.setUint32(0, 0x04034b50, true);   // entrée locale
        v.setUint16(4, 10, true);           // version requise : 1.0 (STORE)
        v.setUint16(6, drapeaux, true);
        v.setUint16(8, 0, true);            // méthode : STORE
        v.setUint16(10, heureDos, true);
        v.setUint16(12, dateDos, true);
        v.setUint32(14, crc, true);
        v.setUint32(18, taille, true);      // taille rangée
        v.setUint32(22, taille, true);      // taille réelle
        v.setUint16(26, nom.length, true);
        v.setUint16(28, 0, true);
        enTete.set(nom, 30);

        var fiche = new Uint8Array(46 + nom.length);
        var w = new DataView(fiche.buffer);
        w.setUint32(0, 0x02014b50, true);   // fiche du répertoire central
        w.setUint16(4, 0x0014, true);       // produit par : DOS, 2.0 (comme JSZip)
        w.setUint16(6, 10, true);
        w.setUint16(8, drapeaux, true);
        w.setUint16(10, 0, true);
        w.setUint16(12, heureDos, true);
        w.setUint16(14, dateDos, true);
        w.setUint32(16, crc, true);
        w.setUint32(20, taille, true);
        w.setUint32(24, taille, true);
        w.setUint16(28, nom.length, true);
        w.setUint32(42, position, true);    // où commence l'entrée locale
        fiche.set(nom, 46);

        // Lu seulement à l'écriture du fichier : une copie retirée du stockage entre-temps ferait échouer l'écriture.
        morceaux.push(enTete, blob);        // le Blob lui-même : une référence, pas une lecture
        repertoire.push(fiche);
        position += enTete.length + taille;
        tailleRepertoire += fiche.length;
    }

    var fin = new Uint8Array(22);
    var x = new DataView(fin.buffer);
    x.setUint32(0, 0x06054b50, true);
    x.setUint16(8, nbTextes + copies.length, true);
    x.setUint16(10, nbTextes + copies.length, true);
    x.setUint32(12, tailleRepertoire, true);
    x.setUint32(16, position, true);

    if (surProgression) surProgression(100);
    return new Blob(morceaux.concat(repertoire, [fin]), { type: 'application/zip' });
}

/* ===============================
   TÉLÉCHARGEMENT DIRECT (lot G, #988)
   =============================== */

/**
 * Délai avant de libérer l'URL d'un téléchargement direct. Libérée tout de suite, Safari
 * pouvait ne plus rien avoir à écrire pour un gros fichier (un codex d'environ 1 Go). Cinq
 * minutes : un délai long, choisi plutôt que `pagehide` pour que la mémoire du fichier ne
 * reste pas prise toute la séance.
 */
var DELAI_LIBERATION_URL_MS = 5 * 60 * 1000;

/**
 * Téléchargement par un lien. Rend `download` : le téléchargement est LANCÉ ;
 * l'application ne peut pas savoir s'il s'est terminé (voir `confirmerTelechargement`).
 */
function telecharger(blob, nomFichier) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, DELAI_LIBERATION_URL_MS);
    return { methode: 'download', strategie: 'téléchargement direct' };
}

/**
 * Règle du téléchargement direct (#988) : l'application ne peut pas savoir s'il s'est
 * terminé ; c'est l'usager qui le dit. « Il y est » → true ; sinon, l'appelant ne pose rien.
 * Mots acceptés par Grégoire pour le codex (lot G, 29 sept. 2026).
 */
async function confirmerTelechargement(nomFichier, taille) {
    return await window.uiDialogues.confirmerAction({
        titre: 'Téléchargement lancé',
        message: 'L\'application ne peut pas savoir si le téléchargement s\'est terminé. ' +
                 'Attends qu\'il le soit, puis vérifie que le fichier « ' + nomFichier + ' » (' + taille + ') ' +
                 'se trouve dans tes Téléchargements.',
        texteConfirmer: 'Il y est',
        texteAnnuler: 'Il n\'y est pas'
    }) === true;
}

window.FichierSortant = {
    assemblerZip: assemblerZip,
    entreesDuZip: entreesDuZip,
    telecharger: telecharger,
    confirmerTelechargement: confirmerTelechargement
};

})();
