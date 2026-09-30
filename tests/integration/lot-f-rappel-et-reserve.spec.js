import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT F DE L'ENREGISTREMENT (D4, D0) — LE RAPPEL MÈNE À LA COPIE DE SECOURS ;
// UNE ARCHIVE ANNULÉE N'EST PLUS LISTÉE (29 sept. 2026)
// =======================================================================
//
// (1) Retiré au lot I (#985, D8) : le rappel ne mène plus à la copie de secours, mais au
//     codex. Son banc : lot-i-rappel-mene-au-codex.spec.js.
// (2) Codex › Archiver sous Safari (mode ZIP, pas d'accès direct au disque) : l'archive était
//     inscrite à la liste AVANT l'aperçu ; un aperçu annulé la laissait listée sans fichier.
//     Elle n'est inscrite qu'après le téléchargement.
//
// Pack démo, noms fictifs. Aucun fichier n'est écrit (aperçu annulé, ou téléchargement
// intercepté par le navigateur de test).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

async function demarrerDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
}

test.describe('Lot F — rappel de la copie de secours, et archive annulée', () => {
    test.setTimeout(120000);

    test('(2) Codex › Archiver en mode ZIP : un aperçu annulé ne laisse aucune archive dans la liste', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        const avant = await page.evaluate(() => Object.keys(Reserve.lireManifesteLocal().archives));
        const gc = await page.evaluate(() => Reserve.listerGroupesVersables()[0]);
        expect(gc && gc.id).toBeTruthy();

        // Aperçu annulé : ni archive listée, ni message de réussite.
        await page.evaluate(() => { window.SecuriteExportPreview.previewZipEtConfirmer = async () => false; });
        const rendu = await page.evaluate((id) => Reserve.verserGroupeCours(obtenirTrimestreId(), id), gc.id);
        expect(rendu).toBeNull();
        expect(await page.evaluate(() => Object.keys(Reserve.lireManifesteLocal().archives))).toEqual(avant);
        expect(await page.evaluate(() => Object.keys(db.getSync('_manifesteReserve', { archives: {} }).archives || {}))).toEqual(avant);

        // Aperçu accepté : le fichier part, PUIS l'archive est listée, avec « Groupe archivé ».
        await page.evaluate(() => { window.SecuriteExportPreview.previewZipEtConfirmer = async () => true; });
        const telechargement = page.waitForEvent('download', { timeout: 30000 });
        await page.evaluate((id) => Reserve.verserGroupeCours(obtenirTrimestreId(), id), gc.id);
        await telechargement;
        const apres = await page.evaluate(() => Object.keys(Reserve.lireManifesteLocal().archives));
        expect(apres.length).toBe(avant.length + 1);
        await expect(page.locator('.notification-avec-icone').filter({ hasText: 'Groupe archivé' }).first()).toBeVisible();
        expect(erreurs).toEqual([]);
    });
});
