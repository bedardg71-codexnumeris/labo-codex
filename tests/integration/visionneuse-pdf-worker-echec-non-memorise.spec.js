import { test, expect } from '@playwright/test';
import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// LE WORKER PDF QUI NE CHARGE PAS UNE FOIS NE CONDAMNE PLUS L'ONGLET.
//
// Rapport de bug de Grégoire, 17 septembre 2026, 12 h 02 (en ligne, Chrome, Mac, onglet ouvert depuis
// au moins 9 h 35) : « Je n'ai pas accès aux documents pdf. » Console : « Setting up fake worker
// failed: Cannot load script at: …/libs/pdf.worker.min.js », trois fois, pour trois copies. Un
// rechargement de la page a tout rétabli (confirmé par Grégoire).
//
// CE QUI SE PASSAIT. PDF.js crée un Worker PAR document : il redemandait `libs/pdf.worker.min.js` au
// serveur à chaque copie (libs/ est revalidé). Qu'une seule de ces requêtes échoue — session
// Cloudflare Access expirée, réseau coupé — et PDF.js tente son repli (« fake worker »), qui échoue
// aussi, puis MÉMORISE cet échec (`_setupFakeWorkerGlobal` garde la promesse rejetée) : plus aucun PDF
// ne s'ouvre jusqu'au rechargement. Le correctif charge le worker par `fetch` AVANT tout
// `getDocument`, n'appelle pas PDF.js s'il ne vient pas, et le sert ensuite depuis une URL blob.
//
// POURQUOI AU NAVIGATEUR, ET POURQUOI UN SERVEUR. Trois choses qu'un banc Vitest ne voit pas : la
// mémorisation est DANS pdf.min.js, le Worker blob doit passer la CSP servie (`worker-src 'self'
// blob:`) sous WebKit, et sur `file://` le correctif se met hors jeu (fetch y est refusé). Cette spec
// sert donc le dépôt par HTTP, sur un port éphémère. ROUGE avant le correctif : le deuxième essai
// échoue alors que le worker est de nouveau servi.
//
// Aucun `page.click` ni `waitForTimeout` : le chemin public `ouvrirDepuisBlob` est appelé, et on
// attend sa promesse.

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.woff2': 'font/woff2' };

// Le serveur ne rend QUE ce que l'application charge — et tout cela figure dans la liste OBSERVABLE
// de tests.yml (sentinelle-ci-paths-ignore) : une régression de ces chemins déclenche bien Playwright.
const DOSSIERS_SERVIS = ['js/', 'css/', 'icons/', 'img/', 'libs/'];
const FICHIERS_SERVIS = ['index.html', 'styles.css', 'version.js', 'version.json', 'noms_stables.json'];
const estServi = (relatif) => FICHIERS_SERVIS.includes(relatif) || DOSSIERS_SERVIS.some((d) => relatif.startsWith(d));

let serveur;
let origine;

test.beforeAll(async () => {
    serveur = http.createServer((req, res) => {
        const relatif = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
        const fichier = path.join(racineProjet, relatif);
        if (!estServi(relatif) || !fichier.startsWith(racineProjet + path.sep) || !fs.existsSync(fichier) || fs.statSync(fichier).isDirectory()) {
            res.writeHead(404); res.end(); return;
        }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(fichier)] || 'application/octet-stream' });
        fs.createReadStream(fichier).pipe(res);
    });
    await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
    origine = `http://127.0.0.1:${serveur.address().port}`;
});

test.afterAll(async () => { await new Promise((ok) => serveur.close(ok)); });

// Un PDF d'une page, le plus petit que PDF.js accepte (il reconstruit la table xref au besoin).
const PDF_MINIMAL = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n'
    + '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n'
    + '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n'
    + 'trailer<</Root 1 0 R>>\n%%EOF';

// Ouvre le PDF minimal par le chemin public et rend ce que la visionneuse en dit.
async function ouvrirPDF(page) {
    return page.evaluate(async (source) => {
        if (!window.__canevasBanc) {
            window.__canevasBanc = document.createElement('canvas');
            document.body.appendChild(window.__canevasBanc);
            window.travauxVisionneuse.setContext({ canvasDocument: window.__canevasBanc });
        }
        const blob = new Blob([source], { type: 'application/pdf' });
        await window.travauxVisionneuse.ouvrirDepuisBlob(blob, { id: 'banc', typeMIME: 'application/pdf', nomFichier: 'banc.pdf' });
        return {
            pages: window.travauxVisionneuse.getNombrePagesTotal(),
            ouvert: !!window.travauxVisionneuse.getPdfDocument(),
            workerSrc: String(window.pdfjsLib.GlobalWorkerOptions.workerSrc)
        };
    }, PDF_MINIMAL);
}

test('Worker PDF · un échec de chargement n\'est pas mémorisé : la copie suivante s\'ouvre sans recharger la page', async ({ page }) => {
    const consoleErreurs = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErreurs.push(msg.text()); });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    // Le worker est refusé tant que `refuser` est vrai — la session expirée, vue du navigateur.
    let refuser = true;
    let demandes = 0;
    await page.route('**/libs/pdf.worker.min.js*', (route) => {
        demandes += 1;
        return refuser ? route.abort('failed') : route.continue();
    });

    await page.goto(origine + '/index.html');
    await page.waitForFunction(() => window.travauxVisionneuse && typeof window.travauxVisionneuse.ouvrirDepuisBlob === 'function'
        && typeof window.pdfjsLib !== 'undefined');
    await page.evaluate(() => window.travauxVisionneuse.initialiser());

    // 1. Worker refusé : la copie ne s'ouvre pas, et c'est le LECTEUR qui est nommé, pas la copie.
    //    (`expect.soft` : sur le code d'avant, l'essai doit aller jusqu'à l'étape 2 et y rougir aussi.)
    const pendantLaPanne = await ouvrirPDF(page);
    expect(pendantLaPanne.ouvert).toBe(false);
    expect.soft(consoleErreurs.some((m) => /Worker PDF\.js non charg/.test(m))).toBe(true);
    // PDF.js n'a pas été appelé : c'est ce qui l'empêche de mémoriser l'échec.
    expect.soft(consoleErreurs.some((m) => /fake worker/i.test(m))).toBe(false);

    // 2. Le worker est de nouveau servi. MÊME page, aucun rechargement.
    refuser = false;
    const apresLaPanne = await ouvrirPDF(page);
    expect(apresLaPanne.ouvert).toBe(true);
    expect(apresLaPanne.pages).toBe(1);
    // Le Worker blob a passé la CSP servie par index.html, sous WebKit.
    expect(apresLaPanne.workerSrc.startsWith('blob:')).toBe(true);

    // 3. Une fois chargé, le worker ne redemande plus rien au serveur : une nouvelle panne ne
    //    touche plus l'ouverture des copies.
    refuser = true;
    const demandesAvant = demandes;
    const secondePanne = await ouvrirPDF(page);
    expect(secondePanne.ouvert).toBe(true);
    expect(demandes).toBe(demandesAvant);
});
