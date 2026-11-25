import { test, expect } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirCopie, attendre, pointCanevas } from './harness/banc-copie-annotation.js';

// =====================================================================
// LE JEU DE TAMPONS FOURNI : « OPÉRATIONS », AU NAVIGATEUR (25 nov. 2026)
// =====================================================================
// Ce que le banc Vitest (tests/unit/sentinelle-jeu-fourni-operations-2026-11-25.test.js) ne voit pas : les six dessins
// de Grégoire se DESSINENT-ils ? Ils sont en traits (`fill="none"`, `stroke="currentColor"`) là où les dessins d'avant
// étaient des formes pleines noires : un rendu qui sortirait vide ou invisible ne se lit qu'aux pixels.
//   · dans la fenêtre « Tampons et rétroactions » d'un espace neuf ;
//   · dans la palette d'Annoter ;
//   · sur une copie (le canevas d'annotation) ;
//   · dans le PDF exporté (la fonction qui y dessine les annotations).
// POURQUOI UN SERVEUR : en `file://`, une image de tampon dessinée sur un canevas le rend illisible (« The operation
// is insecure »). Servie par HTTP, comme en ligne, l'image est de la même origine et les pixels se comptent.
// JEU_FOURNI_CAPTURES=<dossier> : les captures de la fenêtre et de la palette, à 1180 × 820 et 820 × 1180.

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const DOSSIERS_SERVIS = ['js/', 'css/', 'icons/', 'img/', 'libs/', 'autocollants/'];
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

const OPERATIONS = [
    ['action-reperage', 'Identification', 'Tu identifies un élément, le nommes correctement, le restitues avec exactitude.'],
    ['action-liaison', 'Relation', 'Tu relies des éléments entre eux.'],
    ['action-ouverture', 'Déduction', 'Tu appliques une idée générale à un cas particulier du texte.'],
    ['action-interpretation', 'Interprétation', "Tu fais une inférence ou tu expliques l'effet ou le sens que produit un élément."],
    ['action-comparaison', 'Comparaison', 'Tu rapproches deux éléments pour en dégager les ressemblances et les différences.'],
    ['action-induction', 'Induction', 'Tu tires une idée générale de plusieurs exemples.']
];
const MANQUES = ['action-incertain', 'action-incomplet', 'action-inexact'];
const IDS = OPERATIONS.map((t) => t[0]);
const FENETRE = '#modal-retro-observations';
const CAPTURES = process.env.JEU_FOURNI_CAPTURES || '';
const FORMATS = [[1180, 820], [820, 1180]];

async function capturer(page, nom, viser) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    const avant = page.viewportSize();
    for (const [l, h] of FORMATS) {
        await page.setViewportSize({ width: l, height: h });
        if (viser) await viser();
        await attendre(page, 200);
        await page.screenshot({ path: path.join(CAPTURES, `${nom}-${l}x${h}-clair.png`) });
    }
    await page.setViewportSize(avant);
}

/** L'application en mode clair (les captures et les pixels sombres comptés sur fond blanc). */
const modeClair = (page) => page.evaluate(() => document.body.classList.add('mode-clair'));

/** Les pixels dessinés (opaques) d'un tampon, par la fonction qui dessine les annotations dans le PDF exporté. */
const pixelsPDF = (page, id) => page.evaluate(async (id) => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 200;
    const ctx = c.getContext('2d');
    const page1 = { strokes: [], shapes: [], textAnnotations: [], stickers: [{ autocollantId: id, x: 0.25, y: 0.25, width: 0.5, height: 0.5 }] };
    await window.travauxExportPDF.dessinerAnnotationsSurCtx(ctx, 200, 200, page1, 1);
    const d = ctx.getImageData(0, 0, 200, 200).data;
    let n = 0, somme = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 100) { n++; somme = (somme * 31 + i) % 1000000007; }
    return { n, empreinte: somme };
}, id);

/** Les pixels du canevas d'annotation de la copie qui portent un dessin (opaques). */
const pixelsCopie = (page) => page.evaluate(() => {
    const c = document.getElementById('travaux-canvas-annotation');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++;
    return n;
});

async function poser(page, id, fx, fy) {
    await page.evaluate((i) => window.travauxOutils.setAutocollantActif(i), id);
    const p = await pointCanevas(page, fx, fy);
    await page.mouse.click(p.x, p.y);
    await attendre(page, 300);
}

test.describe('Le jeu fourni « Opérations » se dessine partout (un espace neuf)', () => {
    test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1180, height: 820 }); });

    test('la fenêtre « Tampons et rétroactions » : « Opérations », six tampons, leur nom, leur phrase, leur image chargée ; les trois manques sous « Observations »', async ({ page }) => {
        const suivi = await ouvrirCopie(page, origine + '/index.html');
        await modeClair(page);
        await page.evaluate(() => window.travauxOutils.ouvrirEditionRetroObservations());
        const f = page.locator(FENETRE);
        await expect(f).toBeVisible();
        await expect(f.locator('input[data-cat-id="action"]')).toHaveValue('Opérations');
        const liste = f.locator('#travaux-retro-obs-liste-action .travaux-retro-draggable');
        await expect(liste).toHaveCount(6);
        expect(await liste.evaluateAll((rs) => rs.map((r) => [r.dataset.obsId, r.querySelector('input[data-nom-id]').value, r.querySelector('textarea[data-retro-id]').value])))
            .toEqual(OPERATIONS);
        // Chaque image est chargée, et c'est bien le dessin de ce tampon.
        const images = await liste.evaluateAll((rs) => rs.map((r) => { const i = r.querySelector('img'); return [i.complete && i.naturalWidth > 0, new URL(i.src).pathname]; }));
        expect(images).toEqual(['identification', 'relation', 'deduction', 'interpretation', 'comparaison', 'induction'].map((n) => [true, `/autocollants/operations/${n}.svg`]));
        // Les trois manques : sous « Observations », à la suite, inchangés.
        const obs = await f.locator('#travaux-retro-obs-liste-observations .travaux-retro-draggable').evaluateAll((rs) => rs.map((r) => [r.dataset.obsId, r.querySelector('input[data-nom-id]').value]));
        expect(obs).toHaveLength(16);
        expect(obs.slice(-3)).toEqual([['action-incertain', 'Incertain'], ['action-incomplet', 'Incomplet'], ['action-inexact', 'Inexact']]);
        await capturer(page, 'fenetre-tampons-espace-neuf', () => f.locator('input[data-cat-id="action"]').scrollIntoViewIfNeeded());
        // Ouvrir la fenêtre n'a rien rangé : le jeu fourni se lit.
        expect(await page.evaluate(() => ['nomsCategoriesTampons', 'personnalisationObservations', 'retroactionsObservations', 'categoriesObservation'].map((k) => window.db.getSync(k, null))))
            .toEqual([null, null, null, null]);
        expect(suivi.erreurs).toEqual([]);
    });

    test('un espace qui avait enregistré ses phrases AVANT les trois tampons neufs : la fenêtre montre leur phrase fournie, pas un champ vide ; une phrase vidée exprès reste vide', async ({ page }) => {
        await ouvrirCopie(page, origine + '/index.html');
        await page.evaluate(() => window.db.setSync('retroactionsObservations', { 'action-reperage': 'Ma phrase fictive.', 'action-liaison': '' }));
        await page.evaluate(() => window.travauxOutils.ouvrirEditionRetroObservations());
        const texte = (id) => page.locator(`${FENETRE} textarea[data-retro-id="${id}"]`);
        await expect(texte('action-reperage')).toHaveValue('Ma phrase fictive.');
        await expect(texte('action-liaison'), 'vidée exprès : reste vide').toHaveValue('');
        for (const [id, , phrase] of OPERATIONS.slice(3)) await expect(texte(id)).toHaveValue(phrase);
        await expect(texte('action-ouverture'), 'jamais rangée : la phrase fournie').toHaveValue(OPERATIONS[2][2]);
    });

    test('la palette d’Annoter : « Opérations » et ses six tuiles, images chargées et visibles, quand la préférence « Observation des actions » est allumée', async ({ page }) => {
        const suivi = await ouvrirCopie(page, origine + '/index.html');
        await modeClair(page);
        const tuile = (id) => page.locator(`.travaux-autocollant-item[data-param="${id}"]`).first();
        // MESURÉ : dans un espace neuf, la préférence est éteinte et la palette ne montre pas la catégorie.
        await expect(tuile('action-reperage')).toHaveCount(0);
        for (const id of MANQUES) await expect(tuile(id), 'les trois manques, eux, sont sous « Observations » : visibles sans la préférence').toHaveCount(1);
        await page.evaluate(() => { window.definirPreference('activerActionsRLO', true); window.travauxOutils.rechargerTamponsPersonnalises(); });
        for (const [id, nom] of OPERATIONS) {
            await expect(tuile(id)).toHaveCount(1);
            await expect(tuile(id).locator('.travaux-autocollant-nom')).toHaveText(nom);
            const img = tuile(id).locator('img');
            expect(await img.evaluate((i) => i.complete && i.naturalWidth > 0), nom).toBe(true);
            const boite = await img.boundingBox();
            expect(Math.min(boite.width, boite.height), nom).toBeGreaterThanOrEqual(20);
        }
        await expect(page.locator('.travaux-autocollants-label', { hasText: 'Opérations' }).first()).toBeVisible();
        await capturer(page, 'palette-annoter', () => tuile('action-reperage').scrollIntoViewIfNeeded());
        expect(suivi.erreurs).toEqual([]);
    });

    test('sur une copie : chacun des six tampons, puis un manque, laisse un dessin sur le canevas', async ({ page }) => {
        const suivi = await ouvrirCopie(page, origine + '/index.html');
        await modeClair(page);
        expect(await pixelsCopie(page), 'témoin : le canevas est vide et lisible').toBe(0);
        let avant = 0;
        const gains = [];
        for (const [k, id] of IDS.concat('action-incertain').entries()) {
            await poser(page, id, 0.15 + 0.11 * k, 0.3);
            await expect.poll(() => pixelsCopie(page), { timeout: 5000 }).toBeGreaterThan(avant + 30);
            const apres = await pixelsCopie(page);
            gains.push(apres - avant);
            avant = apres;
        }
        const poses = await page.evaluate(() => Object.values(window.travauxAnnotation.getAnnotationCourante().pages)[0].stickers.map((s) => s.autocollantId));
        expect(poses).toEqual(IDS.concat('action-incertain'));
        expect(gains.every((g) => g > 30), JSON.stringify(gains)).toBe(true);
        if (CAPTURES) await capturer(page, 'copie-six-tampons-et-un-manque', async () => { await pointCanevas(page, 0.5, 0.3); });
        expect(suivi.erreurs).toEqual([]);
    });

    test('dans le PDF exporté : les six dessins et les trois manques se dessinent, et les six dessins diffèrent', async ({ page }) => {
        await ouvrirCopie(page, origine + '/index.html');
        await page.waitForFunction((ids) => ids.every((id) => { const i = window.travauxOutils.getImageAutocollant(id); return i && i.complete && i.naturalWidth > 0; }), IDS.concat(MANQUES));
        expect((await pixelsPDF(page, 'tampon-qui-n-existe-pas')).n, 'témoin : sans image, rien n’est dessiné').toBe(0);
        const mesures = {};
        for (const id of IDS.concat(MANQUES)) {
            mesures[id] = await pixelsPDF(page, id);
            // Rendu dans 100 × 100. Le cercle commun aux six dessins (rayon 37,5, trait 8) couvre à lui seul ~1 900 px ;
            // les trois manques sont des formes pleines d'avant (mesuré : 1 423 px pour le plus léger).
            expect(mesures[id].n, id).toBeGreaterThan(IDS.includes(id) ? 1900 : 1000);
        }
        expect(new Set(IDS.map((id) => mesures[id].empreinte)).size, 'six dessins distincts').toBe(6);
    });
});
