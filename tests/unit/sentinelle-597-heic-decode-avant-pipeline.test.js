import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche, suitDansLaFonction } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #597 (30 août 2026) — les remises HEIC ne s'affichaient nulle part.
//
// Mesuré pendant un import réel (601-101, 49 fichiers) : deux remises .HEIC
// entraient dans la file, passaient la validation par magic bytes, et
// ressortaient sans miniature, sans dimensions et NON ANNOTABLES. Les 5 PDF et
// les 42 JPEG de la même file étaient intacts — la panne était propre au HEIC.
//
// Cause : `heic` n'existait dans le dépôt QUE dans les listes de formats
// acceptés, jamais dans un traitement. Tout le pipeline image repose sur
// `new Image()`, donc sur le décodage natif du navigateur. Témoin mesuré le
// 30 août sur Chrome 151 : `<img>` sur un blob HEIC déclenche `onerror`.
// L'application annonçait dans quatre textes d'interface un format qu'elle ne
// savait lire que sur Safari.
//
// Second défaut, de la même passe : `travaux-ui.js` affichait le libellé
// « PDF » dès que les dimensions manquaient. Un HEIC non décodé s'affichait
// donc comme un PDF — c'est ce libellé qui a fait porter le premier diagnostic
// sur la prévisualisation PDF, laquelle fonctionnait.
//
// Portée : sentinelle STATIQUE. La conversion réelle exige un Worker,
// OffscreenCanvas et le WASM de libheif, dont Node ne dispose pas ; la mesure
// de bout en bout a été faite au navigateur (deux fichiers de Bourdages convertis
// en 3024x4032, affichés dans un <img>, break-test à deux mutations). Ce que
// cette sentinelle verrouille, ce sont les invariants sans lesquels le défaut
// revient en silence.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer l'appel à `convertirSiHeic` dans `genererThumbnailQueue` → cas 1.
//   2. retirer celui d'`importerFichier` → cas 2 (le filet disparaît).
//   3. rendre `convertirSiHeic` non idempotente (retirer la garde
//      `heicConverti`) → cas 3.
//   4. remettre `: 'PDF'` en repli inconditionnel dans travaux-ui.js → cas 6.
//   5. déplacer la balise `heic-decodeur.js` APRÈS `travaux-import.js` → cas 7.
//   6. introduire un `document.` dans le worker → cas 8.

function sansCommentaires(txt) {
    return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function lire(relatif) {
    return readFileSync(path.join(racineProjet, relatif), 'utf-8');
}

describe('#597 — le HEIC est converti avant d\'entrer dans le pipeline', () => {

    const importJs = sansCommentaires(lire('js/travaux-import.js'));
    const uiJs = sansCommentaires(lire('js/travaux-ui.js'));
    const decodeurJs = sansCommentaires(lire('js/heic-decodeur.js'));
    const workerJs = sansCommentaires(lire('js/heic-worker.js'));
    const indexHtml = lire('index.html');

    it('cas 1 — la génération de miniature convertit le HEIC AVANT tout le reste', () => {
        const corps = importJs.slice(importJs.indexOf('async function genererThumbnailQueue'));
        const posConversion = corps.indexOf('convertirSiHeic');
        const posMiniature = corps.indexOf('genererMiniatureImage');

        expect(posConversion).toBeGreaterThan(-1);
        expect(posMiniature).toBeGreaterThan(-1);
        // L'ordre EST l'invariant : convertir après avoir tenté la miniature ne
        // servirait à rien, la miniature aurait déjà échoué.
        expect(posConversion).toBeLessThan(posMiniature);
    });

    it('cas 2 — l\'import garde un filet : il reconvertit si la file ne l\'a pas fait', () => {
        const corps = importJs.slice(
            importJs.indexOf('async function importerFichier'),
            importJs.indexOf('const metadonnees')
        );
        expect(corps).toContain('convertirSiHeic');
        // Le filet doit précéder la validation du contenu : c'est un JPEG, pas
        // un HEIC, que le reste de la fonction doit voir.
        expect(corps.indexOf('convertirSiHeic')).toBeLessThan(corps.indexOf('validerMagicBytes'));
    });

    it('cas 3 — convertirSiHeic est idempotente (garde sur heicConverti)', () => {
        const corps = tranche(importJs, 'async function convertirSiHeic', 'async function genererThumbnailQueue');
        expect(corps).toMatch(/if\s*\(![^)]*\|\|\s*fichierPrepare\.heicConverti\)\s*return false/);
    });

    it('cas 4 — le blob HEIC est remplacé PARTOUT, fichierOriginal compris', () => {
        const corps = tranche(importJs, 'async function convertirSiHeic', 'async function genererThumbnailQueue');
        // `fichierOriginal` alimente l'aperçu « Originaux », qui fait un <img>
        // direct : l'oublier laisse la colonne de gauche vide.
        expect(corps).toContain('fichierPrepare.fichierOriginal = resultat.blob');
        expect(corps).toContain('fichierPrepare.fichier = resultat.blob');
        expect(corps).toContain("fichierPrepare.typeMIME = 'image/jpeg'");
    });

    it('cas 5 — le nom archivé perd son extension .HEIC, le nom de la file la garde', () => {
        // Deux exigences opposées, et c'est le piège : le nom de la FILE est la
        // clé de correspondance de reattacherBlobs (l'utilisateur re-dépose un
        // .HEIC) ; le nom ARCHIVÉ voyage dans l'export et doit dire .jpg.
        const corpsConversion = tranche(importJs, 'async function convertirSiHeic', 'async function genererThumbnailQueue');
        expect(corpsConversion).not.toContain('fichierPrepare.nomFichier =');

        const corpsMeta = importJs.slice(importJs.indexOf('const metadonnees'));
        expect(corpsMeta).toContain('renommerEnJpg');
        expect(suitDansLaFonction(decodeurJs, /renommerEnJpg/, /\.jpg/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('cas 6 — le libellé ne dit plus « PDF » quand les dimensions manquent', () => {
        const posLibelle = uiJs.indexOf("if (f.largeurOriginale && f.hauteurOriginale) {");
        expect(posLibelle).toBeGreaterThan(-1);
        const extrait = uiJs.slice(posLibelle, posLibelle + 500);

        // Un repli inconditionnel sur 'PDF' est exactement ce qui a fait
        // diagnostiquer une panne de PDF sur un fichier HEIC.
        expect(extrait).toMatch(/f\.estPDF/);
        expect(extrait).toContain('Dimensions inconnues');
        // Un décodage échoué le DIT, il ne laisse pas une vignette muette.
        expect(extrait).toContain('HEIC non décodé');
        expect(extrait).toContain('f.heicEchec');
    });

    it('cas 7 — le décodeur est chargé AVANT travaux-import.js', () => {
        const posDecodeur = indexHtml.indexOf('js/heic-decodeur.js');
        const posImport = indexHtml.indexOf('js/travaux-import.js');
        expect(posDecodeur).toBeGreaterThan(-1);
        expect(posImport).toBeGreaterThan(-1);
        expect(posDecodeur).toBeLessThan(posImport);
    });

    it('cas 8 — le worker ne touche pas au DOM', () => {
        // C'est la raison même du choix de libheif contre heic2any : ce dernier
        // réclame `document` puis `window` et ne peut donc PAS tourner en
        // worker — mesuré le 30 août, deux échecs d'importScripts. Un `document.`
        // qui apparaîtrait ici casserait le worker au chargement.
        expect(workerJs).not.toMatch(/\bdocument\./);
        expect(workerJs).not.toMatch(/\bwindow\./);
        expect(workerJs).toContain('OffscreenCanvas');
    });

    it('cas 9 — la conversion sort du thread principal', () => {
        // #825 (11 sept. 2026) : le jeton n'est plus figé à la main, c'est le
        // build courant — `/js/*` est servi immuable, une URL figée aurait
        // laissé un worker périmé un an chez tout le monde.
        expect(decodeurJs).toMatch(/new Worker\('js\/heic-worker\.js\?v=' \+ jetonAntiCache\(\)\)/);
        // Une promesse sans minuterie reste pendante pour toujours si le worker
        // meurt : la file d'import ne se terminerait jamais.
        expect(decodeurJs).toMatch(/setTimeout\(/);
        expect(decodeurJs).toMatch(/onerror\s*=/);
    });

    it('cas 11 — les deux chemins invisibles des filets portent un jeton', () => {
        // TROU DE FILET, inscrit dans #597 : un fichier chargé par `importScripts`
        // ou par `new Worker` n'apparaît dans AUCUNE balise <script> d'index.html.
        // Ni release.mjs, ni la sentinelle anti-cache, ni le hook pré-commit ne le
        // voient : une mise à jour serait servie depuis le cache en silence.
        // Depuis #825, le worker (dans `js/`, servi immuable) prend le BUILD
        // courant comme jeton ; le bundle libheif (dans `libs/`, revalidé, hors
        // périmètre de #825) garde son jeton à la main.
        expect(decodeurJs).toMatch(/heic-worker\.js\?v=' \+ jetonAntiCache\(\)/);
        expect(decodeurJs).toMatch(/window\.__VERSION__/);
        expect(workerJs).toMatch(/libheif-bundle\.js\?v=\d{8}/);
    });

    it('cas 12 — le worker refusé est DIT, et aucun repli mort ne subsiste', () => {
        // Mesuré le 30 août 2026 : en `file://` Chrome refuse le Worker
        // (origine `null`), et sur le thread principal les DEUX builds de
        // libheif violent la CSP du projet — le WASM comme l'asm.js évaluent
        // une chaîne, et `'wasm-unsafe-eval'` ne suffit pas. Seul
        // `'unsafe-eval'` les débloquerait, ce qu'interdisent les règles non
        // négociables. Un repli thread principal a donc été écrit puis RETIRÉ :
        // du code qui ne peut jamais réussir est du code mort.
        expect(decodeurJs).not.toContain('convertirSurThreadPrincipal');
        expect(decodeurJs).not.toContain('_promesseBundle');

        // Et l'échec doit être EXPLICITE, pas silencieux.
        const corps = decodeurJs.slice(decodeurJs.indexOf('async function convertirEnJpeg'));
        expect(corps).toMatch(/throw new Error\(/);
        // NB : ne pas assertionner sur « file:// » — `sansCommentaires` coupe à
        // partir de `//`, y compris à l'intérieur d'une chaîne.
        expect(corps).toContain('Web Worker');
        expect(corps).toContain('depuis le disque');

        // La CSP du dépôt reste sans `unsafe-eval`.
        const indexBrut = readFileSync(path.join(racineProjet, 'index.html'), 'utf-8');
        const csp = tranche(indexBrut, 'Content-Security-Policy', 400);
        expect(csp).not.toContain("'unsafe-eval'");
    });

    it('cas 10 — la bibliothèque libheif est présente et suivie', () => {
        const chemin = path.join(racineProjet, 'libs', 'libheif-bundle.js');
        const contenu = readFileSync(chemin, 'utf-8');
        expect(contenu.length).toBeGreaterThan(500000);
        // Le WASM est embarqué en base64 : aucun second fichier à servir, donc
        // le décodage fonctionne hors ligne comme le reste de l'application.
        expect(contenu).toContain('base64');
        expect(workerJs).toMatch(/importScripts\('\.\.\/libs\/libheif-bundle\.js\?v=\d{8}[a-z]?'\)/);
    });
});
