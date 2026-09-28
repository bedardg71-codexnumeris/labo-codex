import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #966 — « LE GUIDE DIT CE QUE FAIT LA CARTE », à l'écran.
//
// Le guide s'ouvre, compte neuf pages, et la page 8 rend la légende des
// pastilles d'évaluation avec les classes de la carte (mêmes symboles, mêmes
// couleurs). Avec CAPTURES_966=<dossier>, l'essai dépose une capture de chaque
// page modifiée (1, 2, 4, 6, 8) : c'est ce que Grégoire relit.

async function ouvrirCarte(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
}

test.describe('#966 · le guide de la carte', () => {
    test('neuf pages ; la page 8 montre la légende des pastilles d’évaluation', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 1000 });
        await ouvrirCarte(page);
        await page.evaluate(() => window.planificationCarte.ouvrirGuide());
        const guide = page.locator('.planif-guide').first();
        await expect(guide).toBeVisible();
        await expect(guide.locator('.planif-guide-page-num')).toHaveText('Page 1 / 9');
        await expect(guide.locator('.planif-guide-titre')).toHaveText('Construis ta carte d’alignement');

        const dossier = process.env.CAPTURES_966;
        const modifiees = [1, 2, 4, 6, 8];
        for (let p = 1; p <= 9; p++) {
            // Clic porté sur le bouton : en mode capture, le panneau agrandi le
            // pousse hors de l'écran.
            if (p > 1) await guide.locator('.planif-guide-btn-next').dispatchEvent('click');
            await expect(guide.locator('.planif-guide-page-num')).toHaveText('Page ' + p + ' / 9');
            if (dossier && modifiees.includes(p)) {
                // Pour la CAPTURE seulement : le guide vit dans un panneau à
                // défilement interne, recouvert en partie par l'en-tête de
                // l'application. On le sort en plein cadre, sans hauteur maximale.
                await page.evaluate(() => {
                    const g = document.querySelector('.planif-guide');
                    let cadre = document.getElementById('cadre-capture-966');
                    if (!cadre) {
                        cadre = document.createElement('div');
                        cadre.id = 'cadre-capture-966';
                        cadre.style.cssText = 'position:fixed;top:0;left:0;width:420px;background:#fff;z-index:2147483647;';
                        document.body.appendChild(cadre);
                    }
                    if (g.parentNode !== cadre) cadre.appendChild(g);
                    for (const el of [g, ...g.querySelectorAll('*')]) {
                        el.style.maxHeight = 'none';
                        el.style.overflow = 'visible';
                    }
                });
                await guide.screenshot({ path: path.join(dossier, `966-page-${p}.png`) });
            }
            if (p === 8) {
                const corps = guide.locator('.planif-guide-corps');
                await expect(corps.locator('.planif-eval-pastille')).toHaveCount(5);   // « ? » depuis le 28 sept.
                await expect(corps.locator('.planif-eval-pastille--incertain')).toHaveText('?');
                await expect(corps.locator('.planif-eval-pastille--nonEnseigne')).toHaveText('✕');
                await expect(corps).not.toContainText('se vérifie par');
            }
        }
    });
});
