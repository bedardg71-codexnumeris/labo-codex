// #1224 (4 nov. 2026) — les rouges restent jusqu'à « OK » et s'empilent. Relecture neuve : un import
// qui refuse beaucoup de fichiers pose un rouge par élève ; la pile ne doit pas sortir de l'écran.
// Ce que l'essai garde, sur l'iPad debout (820 × 1180) : quinze rouges et le vert du bilan tiennent
// dans la hauteur de l'écran, la pile défile à la molette posée sur un message, et le dernier « OK »
// se touche une fois la pile défilée.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

test('#1224 · quinze rouges et un vert : la pile reste dans l\'écran et défile', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto(indexHtml);
    await attendreApplication(page);
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

// Verdict rouge du 4 nov. (palette-retroaction-compacte:309) : rangé sous un autre message, un vert
// descendait sur la bande de la palette Rétroaction et prenait le toucher de l'onglet. Ce que l'essai
// garde, au doigt (iPad couché) : un vert, qui n'a rien à toucher, laisse passer le doigt jusqu'au
// bouton qu'il couvre ; un rouge le garde (son « OK »).
test.describe('au doigt', () => {
    test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });

    test('#1224 · un vert laisse passer le doigt jusqu\'au bouton qu\'il couvre ; un rouge le garde', async ({ page }) => {
        await page.goto(indexHtml);
        await page.waitForFunction(() => window.notifications && typeof window.notifications.succes === 'function');
        const pose = () => page.waitForFunction(() => {
            const n = [...document.querySelectorAll('#notifications-pile > *')];
            return n.length > 0 && n.every((e) => e.getAnimations().length === 0);
        });
        // Un bouton témoin sous le dernier message posé, juste sous le plan de la pile (11000) : au-dessus de l'en-tête.
        const temoinSousLeDernier = () => page.evaluate(() => {
            document.getElementById('temoin-1224')?.remove();
            const r = document.querySelector('#notifications-pile > :last-child .notification-texte').getBoundingClientRect();
            const b = document.createElement('button');
            b.id = 'temoin-1224';
            b.style.cssText = `position:fixed;z-index:10999;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
            window.__touches1224 = 0;
            b.addEventListener('click', () => { window.__touches1224 += 1; });
            document.body.appendChild(b);
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });

        await page.evaluate(() => { notifications.succes('Premier message fictif'); notifications.succes('Second message fictif'); });
        await pose();
        const sousLeVert = await temoinSousLeDernier();
        await page.touchscreen.tap(sousLeVert.x, sousLeVert.y);
        await expect.poll(() => page.evaluate(() => window.__touches1224), 'le vert laisse passer le doigt').toBe(1);

        await page.evaluate(() => notifications.erreur('Rouge fictif', 'Détail fictif.'));
        await pose();
        const sousLeRouge = await temoinSousLeDernier();
        await page.touchscreen.tap(sousLeRouge.x, sousLeRouge.y);
        expect(await page.evaluate(() => window.__touches1224), 'le rouge garde le doigt').toBe(0);
        await expect(page.locator('#notifications-pile .notification-erreur')).toHaveCount(1);
    });
});
