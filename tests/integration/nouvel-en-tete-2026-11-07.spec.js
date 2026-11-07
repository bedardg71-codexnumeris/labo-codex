import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « Le nouvel en-tête » (7 nov. 2026) — données de la démo. Le jugement visuel est celui de
// Grégoire, sur capture ; ici, la géométrie que la consigne chiffre et le libellé du groupe.

async function ouvrirDemo(page, largeur) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 20000 });
    await page.evaluate(async () => { await window.activerModeDemo(); });
}

test('bureau (1440) : trois zones sur une ligne, groupe centré sur la page, en-tête ≈ 216 px', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirDemo(page, 1440);
    await expect(page.locator('#groupe-affichage-principal')).toHaveText('601-101 · gr. 0demo');
    const g = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const groupe = r('.groupe-selecteur'), logo = r('.entete-logo img'), bloc = r('.entete-bloc'), nav = r('.navigation-principale');
        return { centre: (groupe.left + groupe.right) / 2, memeLigne: groupe.top < logo.bottom && groupe.top < bloc.bottom,
            logoH: logo.height, bas: nav.bottom, options: [...document.querySelectorAll('#selectGroupeCoursHeader option')].map(o => o.textContent) };
    });
    expect(Math.abs(g.centre - 720)).toBeLessThan(1);
    expect(g.memeLigne).toBe(true);
    expect(g.logoH).toBe(96);
    expect(g.bas).toBeGreaterThan(205);
    expect(g.bas).toBeLessThan(226);
    // le nom de l'enseignant·e de la démo (Primo Primavera) n'est plus dans le libellé
    expect(g.options.join(' ')).not.toContain('Primo');
    expect(erreurs).toEqual([]);
});

test('iPad portrait (820) : le groupe descend dans la bande pâle, sous le logo, au-dessus de la navigation', async ({ page }) => {
    await ouvrirDemo(page, 820);
    const g = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        return { groupe: r('.groupe-selecteur'), logo: r('.entete-logo img'), nav: r('.navigation-principale'), scroll: document.documentElement.scrollWidth };
    });
    expect(g.groupe.top).toBeGreaterThan(g.logo.bottom);
    expect(g.groupe.bottom).toBeLessThanOrEqual(g.nav.top);
    expect(g.scroll).toBe(820);
});

test('iPhone (390) : logo seul, bloc à droite visible, pas de défilement horizontal', async ({ page }) => {
    await ouvrirDemo(page, 390);
    const g = await page.evaluate(() => ({
        logo: document.querySelector('.entete-logo img').currentSrc,
        bloc: document.querySelector('.entete-bloc').getBoundingClientRect(),
        scroll: document.documentElement.scrollWidth
    }));
    expect(g.logo).toMatch(/labo-codex-logo-blanc\.svg$/);
    expect(g.bloc.right).toBeLessThanOrEqual(390);
    expect(g.bloc.width).toBeGreaterThan(0);
    expect(g.scroll).toBe(390);
});
