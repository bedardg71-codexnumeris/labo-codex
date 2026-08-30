/* ===============================
   WORKER: DECODAGE HEIC
   Décode un HEIC/HEIF en JPEG, hors du thread principal.

   Pourquoi un worker : le décodage d'une photo d'iPhone (3024 x 4032) prend
   ~2,5 s de calcul. Sur le thread principal, l'interface serait figée d'autant
   à chaque fichier, et une classe entière de remises HEIC gèlerait l'import
   pendant des minutes.

   ⚠ CE CHEMIN N'EST PAS TOUJOURS DISPONIBLE, ET IL N'EN EXISTE PAS D'AUTRE.
   Ouverte en `file://` (double-clic sur index.html), la page a l'origine `null`
   et Chrome refuse de construire un Worker — « SecurityError », mesuré le
   30 août 2026. Aucun repli : le décodage en thread principal et le blob worker
   (même bundle embarqué) lèvent `EvalError` sous la CSP du projet, le glue
   emscripten évaluant une chaîne. `js/heic-decodeur.js` le DIT alors, par
   `decodagePossible()`, au lieu de laisser passer un fichier muet en 0 x 0.

   Pourquoi libheif et pas heic2any : heic2any réclame `document` puis `window`
   tel qu'il se charge par importScripts — deux échecs mesurés le 30 août. Il ne
   peut donc pas tourner ici. Et il décode le même fichier quatre fois plus
   lentement (8,5-11 s contre 2,5 s), ce qui a suffi à trancher.

   PROTOCOLE
   - reçoit  { id, buffer }        buffer = ArrayBuffer du HEIC (transféré)
   - renvoie { id, ok: true, jpeg, largeur, hauteur }
   - renvoie { id, ok: false, erreur }
   =============================== */

/* global libheif */

'use strict';

// JETON ANTI-CACHE A LA MAIN (#597). Un fichier charge par importScripts depuis
// un worker n'apparait NULLE PART dans index.html : ni release.mjs, ni la
// sentinelle anti-cache, ni le hook pre-commit ne le voient. Sans ce ?v=, une
// mise a jour serait servie depuis le cache sans que rien ne le signale. Il
// porte le jour du BUILD, comme les jetons d'index.html.
importScripts('../libs/libheif-bundle.js?v=20260830a');

let _module = null;

// 0.85 : au-dessus de la qualité d'import (0.80), parce que ce JPEG sera
// recompressé en aval par compresserImageSiNecessaire. Compresser deux fois au
// même niveau cumule les pertes.
const QUALITE_JPEG = 0.85;

/**
 * Instancie le module WASM (une seule fois pour la vie du worker).
 * @returns {Promise<Object>} Le module libheif prêt à l'emploi
 */
async function obtenirModule() {
    if (!_module) {
        // Le bundle expose soit l'objet, soit une fabrique asynchrone.
        _module = (typeof libheif === 'function') ? await libheif() : libheif;
    }
    return _module;
}

/**
 * Décode un HEIC/HEIF en pixels bruts.
 * @param {Object} lib - Le module libheif instancié
 * @param {Uint8Array} octets - Le contenu du fichier
 * @returns {Promise<{donneesImage: ImageData, largeur: number, hauteur: number}>}
 */
async function decoderVersImageData(lib, octets) {
    const images = new lib.HeifDecoder().decode(octets);

    if (!images || images.length === 0) {
        throw new Error('aucune image dans le conteneur HEIC');
    }

    // Un HEIC peut contenir plusieurs images (rafale, Live Photo). La remise
    // d'un travail est une photo : on prend la première, image principale du
    // conteneur.
    const image = images[0];
    const largeur = image.get_width();
    const hauteur = image.get_height();

    if (!largeur || !hauteur) {
        throw new Error('dimensions nulles apres decodage');
    }

    const donneesImage = new ImageData(largeur, hauteur);

    await new Promise(function(resoudre, rejeter) {
        image.display(donneesImage, function(resultat) {
            if (resultat) {
                resoudre();
            } else {
                rejeter(new Error('libheif n\'a pas pu rendre l\'image'));
            }
        });
    });

    return { donneesImage: donneesImage, largeur: largeur, hauteur: hauteur };
}

self.onmessage = async function(evenement) {
    const donnees = evenement.data || {};
    const id = donnees.id;

    try {
        const lib = await obtenirModule();
        const decode = await decoderVersImageData(lib, new Uint8Array(donnees.buffer));

        const canevas = new OffscreenCanvas(decode.largeur, decode.hauteur);
        const contexte = canevas.getContext('2d');
        contexte.putImageData(decode.donneesImage, 0, 0);

        const jpeg = await canevas.convertToBlob({
            type: 'image/jpeg',
            quality: QUALITE_JPEG
        });

        self.postMessage({
            id: id,
            ok: true,
            jpeg: jpeg,
            largeur: decode.largeur,
            hauteur: decode.hauteur
        });
    } catch (erreur) {
        self.postMessage({
            id: id,
            ok: false,
            erreur: String((erreur && erreur.message) || erreur)
        });
    }
};
