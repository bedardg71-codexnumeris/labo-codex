import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #597, seconde passe (30 août 2026) — le HEIC échouait EN SILENCE.
//
// La première passe a livré un décodeur qui fonctionne : mesuré au navigateur,
// application SERVIE en http, les deux remises de Exemple converties en
// 3024 x 4032. Mais l'application de Grégoire s'ouvre par DOUBLE-CLIC, et dans
// ce mode le décodage n'a aucun chemin. Mesuré le 30 août, Chrome, banc isolé :
//   - worker classique, app servie, CSP du projet   → décodage 3024 x 4032 ;
//   - worker classique, page en `file://`           → SecurityError, origine null ;
//   - thread principal, CSP + 'wasm-unsafe-eval'    → EvalError (glue emscripten) ;
//   - blob worker + importScripts d'un file://      → « failed to load » ;
//   - blob worker + bundle EMBARQUÉ dans le blob    → EvalError : un blob worker
//     HÉRITE de la CSP du document, contrairement à un worker chargé par URL
//     same-origin.
// Aucun contournement ne tient sous la règle « zéro eval() ».
//
// Conséquence pour l'utilisateur, avant cette passe : un HEIC traversait la file
// et s'affichait « Dimensions inconnues » — le rendu d'un fichier corrompu. Le
// format restait pourtant annoncé accepté dans les textes d'interface.
//
// Ce que cette sentinelle verrouille : l'application DIT ce qu'elle ne peut pas
// faire, au lieu de le laisser deviner. Le cas 1 est COMPORTEMENTAL (le module
// est exécuté avec un faux `window`) ; les autres sont statiques.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. dans `decodagePossible`, rendre `true` sans regarder le protocole → cas 1.
//   2. retirer l'appel à `marquerHeicNonDecodable` dans `planifierThumbnail` → cas 2.
//   3. remettre « HEIC » en dur dans le texte de la zone de dépôt → cas 3.
//   4. retirer `decodagePossible` de l'API publique du décodeur → cas 4.
//   5. retirer le `title` porteur de `heicRaison` sur la résolution → cas 5.

function sansCommentaires(txt) {
    return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function lire(relatif) {
    return readFileSync(path.join(racineProjet, relatif), 'utf-8');
}

/**
 * Exécute js/heic-decodeur.js avec un faux `window`, pour interroger le
 * comportement réel plutôt que la forme du code.
 * @param {string} protocole - 'file:' ou 'http:'
 * @returns {Object} L'objet HeicDecodeur exposé
 */
function chargerDecodeur(protocole) {
    const faux = { location: { protocol: protocole } };
    const Worker = function() {};
    const OffscreenCanvas = function() {};
    // eslint-disable-next-line no-new-func
    new Function('window', 'Worker', 'OffscreenCanvas', 'console', lire('js/heic-decodeur.js'))(
        faux, Worker, OffscreenCanvas, { warn() {}, error() {} }
    );
    return faux.HeicDecodeur;
}

describe('#597 — l\'application dit ce qu\'elle ne peut pas décoder', () => {

    const importJs = sansCommentaires(lire('js/travaux-import.js'));
    const uiJs = sansCommentaires(lire('js/travaux-ui.js'));
    const decodeurJs = sansCommentaires(lire('js/heic-decodeur.js'));
    const aideJs = sansCommentaires(lire('js/accompagnement-contenu-popup.js'));

    it('cas 1 — decodagePossible() est FAUX en file:// et VRAI quand l\'app est servie', () => {
        // Le coeur du correctif : c'est le protocole qui décide, parce que c'est
        // lui qui décide de la construction du Worker (mesuré).
        expect(chargerDecodeur('file:').decodagePossible()).toBe(false);
        expect(chargerDecodeur('http:').decodagePossible()).toBe(true);
        expect(chargerDecodeur('https:').decodagePossible()).toBe(true);
    });

    it('cas 2 — l\'entrée dans la file marque le HEIC non décodable, sans attendre la miniature', () => {
        // Sans ce marquage en amont, l'impossibilité ne se découvre qu'au moment
        // de la miniature, et le fichier s'affiche comme un fichier corrompu.
        expect(importJs).toMatch(/function planifierThumbnail\([^)]*\)\s*\{\s*marquerHeicNonDecodable\(/);
        // Le marquage pose une RAISON, pas seulement un drapeau.
        expect(importJs).toMatch(/heicRaison\s*=/);
        // Et il est REFAIT dans genererThumbnailQueue : `reattacherBlobs` (session
        // restaurée) l'appelle sans passer par planifierThumbnail, et les deux
        // champs ne survivent pas au round-trip sessionStorage.
        const corpsQueue = importJs.split('async function genererThumbnailQueue')[1] || '';
        expect(corpsQueue.slice(0, 600)).toMatch(/marquerHeicNonDecodable\(fichierPrepare\)/);
    });

    it('cas 3 — aucun texte d\'interface n\'annonce le HEIC en dur', () => {
        // Les libellés passent par formatsAcceptesLibelle(), qui n'annonce le
        // format que là où il est réellement lisible.
        expect(uiJs).toMatch(/function formatsAcceptesLibelle\(\)/);
        expect(aideJs).toMatch(/function formatsAcceptesLibelle\(\)/);
        // Les deux textes appellent le helper au lieu d'écrire la liste.
        expect(uiJs).toMatch(/\$\{formatsAcceptesLibelle\(\)\} — ou clique pour parcourir/);
        expect(aideJs).toMatch(/'Dépose tes fichiers \(' \+ formatsAcceptesLibelle\(\)/);
        // « HEIC » ne subsiste QUE dans le helper : une occurrence par fichier,
        // celle du retour conditionnel. Une seconde signalerait un texte figé.
        const occurrences = (txt) => (txt.match(/PDF, JPEG, PNG, HEIC/g) || []).length;
        expect(occurrences(uiJs)).toBe(1);
        expect(occurrences(aideJs)).toBe(1);
        // Le texte d'aide d'index.html ne l'annonce plus non plus.
        expect(lire('index.html')).not.toMatch(/Formats acceptés<\/strong> : PDF, JPEG, PNG, HEIC/);
    });

    it('cas 4 — decodagePossible est exposé, sinon l\'interface ne peut pas le consulter', () => {
        expect(decodeurJs).toMatch(/decodagePossible:\s*decodagePossible/);
    });

    it('cas 5 — la raison de l\'échec est rendue visible, échappée', () => {
        // Un « HEIC non décodé » qui ne dit pas POURQUOI laisse Grégoire chercher
        // la panne ailleurs — c'est exactement ce qui s'est produit.
        expect(uiJs).toMatch(/heicRaison\s*\?\s*` title="\$\{echapperHtml\(f\.heicRaison\)\}"`/);
        expect(uiJs).toMatch(/'HEIC non décodé'/);
    });
});
