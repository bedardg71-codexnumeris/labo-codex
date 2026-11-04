// #1224 (4 nov. 2026) — les rouges restent jusqu'à « OK » et s'empilent. Relecture neuve : un import
// qui refuse beaucoup de fichiers pose un rouge par élève ; la pile ne doit pas sortir de l'écran.
// Ce que l'essai garde, sur l'iPad debout (820 × 1180) : quinze rouges et le vert du bilan tiennent
// dans la hauteur de l'écran, la pile défile à la molette posée sur un message, et le dernier « OK »
// se touche une fois la pile défilée.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

test('#1224 · quinze rouges et un vert : la pile reste dans l\'écran et défile', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto(indexHtml);
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        for (let i = 1; i <= 15; i++) notifications.erreur('Jeton non appliqué', 'Élève ' + i + ' : aucune évaluation d’origine trouvée.');
        notifications.succes('13 fichier(s) importé(s)');
    });
    await page.waitForTimeout(400);
    const avant = await page.evaluate(() => {
        const p = document.getElementById('notifications-pile');
        const r = p.getBoundingClientRect();
        return { bas: r.bottom, hauteurEcran: window.innerHeight, defile: p.scrollHeight > p.clientHeight, n: p.children.length };
    });
    expect(avant.n).toBe(16);
    expect(avant.bas, 'la pile s\'arrête au bas de l\'écran').toBeLessThanOrEqual(avant.hauteurEcran);
    expect(avant.defile, 'la pile défile').toBe(true);

    await page.locator('#notifications-pile .notification-erreur').first().hover();
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.getElementById('notifications-pile').scrollTop)).toBeGreaterThan(0);

    const dernierOk = page.locator('#notifications-pile .notification-ok').last();
    await dernierOk.click();
    await page.waitForTimeout(400);
    expect(await page.locator('#notifications-pile .notification-erreur').count()).toBe(14);
});
