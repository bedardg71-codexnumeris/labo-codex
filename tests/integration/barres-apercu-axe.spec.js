import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LES BARRES DE L'APERÇU (décisions de Grégoire du 30 oct. 2026), dans un vrai WebKit, sur le pack de démo :
// le voile gardé, l'axe de A et de C au choix (proportionnel par défaut), P toujours proportionnel, et rien
// d'écrit dans les réglages sans geste.

async function demo(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.PACK_DEMARRAGE, null, { timeout: 30000 });
    await page.evaluate(() => db.setSync('backupNePlusRappeler', 'true'));
    await page.evaluate(() => window.activerModeDemo());
    await page.waitForFunction(() => window.estEnModeDemo && window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
}

// La navigation recharge le panneau 100 ms plus tard (`navigation.js`), ce qui écraserait un champ tapé trop tôt :
// les exemples sont vidés d'abord, et leur retour dit que le rechargement a eu lieu.
const allerAuReglage = async (page) => {
    await page.evaluate(() => {
        document.querySelectorAll('[data-exemple-axe]').forEach((n) => { n.textContent = ''; });
        naviguerVers('labo', 'accompagnement');
    });
    await expect(page.locator('[data-exemple-axe] .barre-exemple')).toHaveCount(2);
};
const choisirAxe = (page, id) => page.evaluate((cible) => {
    const choix = document.getElementById(cible);
    choix.checked = true;
    choix.dispatchEvent(new Event('change', { bubbles: true }));
}, id);
// Les barres du rendu précédent sont retirées d'abord : on ne lit que celles que ce retour à l'Aperçu a dessinées.
const allerALApercu = async (page) => {
    await page.evaluate(() => {
        document.querySelectorAll('.distribution-container').forEach((n) => n.remove());
        naviguerVers('suivi', 'groupe');
    });
    await expect(page.locator('.distribution-container .barre-indicateur')).toHaveCount(3);
};
const LIRE_BARRES = () => [...document.querySelectorAll('.distribution-container')].slice(0, 3).map((c) => ({
    fond: c.querySelector('.barre-indicateur').style.background,
    voile: c.querySelectorAll('.barre-indicateur-overlay').length,
    graduations: [...c.querySelectorAll('.barre-graduation')].map((g) => g.textContent.replace(/ /g, ' ')),
    cassure: c.querySelector('.barre-graduation-cassure')?.textContent.replace(/ /g, ' ') ?? null
}));
const axeEnregistre = (page) => page.evaluate(() => (db.getSync('preferencesUtilisateur', {}) || {}).axeBarresApercu ?? null);

test('sans choix : proportionnel, voile gardé, rien sous les barres, et un changement sur une case voisine n’écrit pas le défaut', async ({ page }) => {
    await demo(page);
    await allerALApercu(page);
    const barres = await page.evaluate(LIRE_BARRES);
    expect(barres.map((b) => b.voile)).toEqual([1, 1, 1]);
    expect(barres.flatMap((b) => b.graduations)).toEqual([]);
    expect(barres[0].fond).toContain('78.57');
    expect(barres[2].fond).toContain('50%');

    await allerAuReglage(page);
    await expect(page.locator('#v2-axe-barres-proportionnel')).toBeChecked();
    await expect(page.locator('[data-exemple-axe="proportionnel"] .barre-exemple-point')).toHaveCount(20);
    await expect(page.locator('[data-exemple-axe="deuxSegments"] .barre-graduation-cassure')).toHaveText(/^85/);
    expect(await axeEnregistre(page)).toBeNull();

    // `sauvegarderPreferencesV2` écrit tout le panneau à chaque changement : la case voisine passe bien, le choix non.
    await page.locator('#v2-pref-graphiques').dispatchEvent('change');
    await expect.poll(() => page.evaluate(() => 'afficherGraphiques' in (db.getSync('preferencesUtilisateur', {}) || {}))).toBe(true);
    expect(await axeEnregistre(page)).toBeNull();
});

test('deux segments : le geste s’enregistre, A et C cassent au seuil le plus bas, P ne bouge pas, et le choix se défait', async ({ page }) => {
    await demo(page);
    await allerAuReglage(page);
    await choisirAxe(page, 'v2-axe-barres-deux-segments');
    await expect.poll(() => axeEnregistre(page)).toBe('deuxSegments');

    await allerALApercu(page);
    let barres = await page.evaluate(LIRE_BARRES);
    expect(barres[0].cassure).toBe('85 %');
    expect(barres[1].cassure).toBe('85 %');
    expect(barres[0].graduations).toEqual(['30 %', '85 %', '90 %', '95 %', '100 %']);
    expect(barres[0].fond).toContain('25%');
    expect(barres[2].graduations).toEqual([]);
    expect(barres[2].fond).toContain('50%');
    expect(barres.map((b) => b.voile)).toEqual([1, 1, 1]);

    // Le seuil est lu à sa source : changer le champ déplace la cassure, dans l'exemple et sur l'Aperçu.
    await allerAuReglage(page);
    await page.locator('#v2-seuil-fragile').fill('80');
    await page.locator('#v2-seuil-fragile').dispatchEvent('change');
    await expect(page.locator('[data-exemple-axe="deuxSegments"] .barre-graduation-cassure')).toHaveText(/^80/);
    await allerALApercu(page);
    barres = await page.evaluate(LIRE_BARRES);
    expect(barres[0].cassure).toBe('80 %');

    await allerAuReglage(page);
    await choisirAxe(page, 'v2-axe-barres-proportionnel');
    await expect.poll(() => axeEnregistre(page)).toBe('proportionnel');
    await allerALApercu(page);
    barres = await page.evaluate(LIRE_BARRES);
    expect(barres.flatMap((b) => b.graduations)).toEqual([]);
});
