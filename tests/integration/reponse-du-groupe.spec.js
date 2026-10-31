import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA RÉPONSE DU GROUPE (décisions de Grégoire des 30 et 31 oct. 2026), dans un vrai WebKit, sur le pack de démo :
// éteinte, rien sous la barre RàI ; le réglage dans l'ordre décidé ; activée, la carte de l'Aperçu décrit le même groupe.

async function demo(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.PACK_DEMARRAGE, null, { timeout: 30000 });
    await page.evaluate(() => db.setSync('backupNePlusRappeler', 'true'));
    await page.evaluate(() => window.activerModeDemo());
    await page.waitForFunction(() => window.estEnModeDemo && window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
}

// La navigation recharge le panneau 100 ms plus tard (`navigation.js`) : les exemples de l'axe, vidés d'abord, disent qu'il a eu lieu.
const allerAuReglage = async (page) => {
    await page.evaluate(() => {
        document.querySelectorAll('[data-exemple-axe]').forEach((n) => { n.textContent = ''; });
        naviguerVers('labo', 'accompagnement');
    });
    await expect(page.locator('[data-exemple-axe] .barre-exemple')).toHaveCount(2);
};
const allerALApercu = async (page) => {
    await page.evaluate(() => {
        document.querySelectorAll('.barre-rai-container').forEach((n) => n.remove());
        naviguerVers('suivi', 'groupe');
    });
    await expect(page.locator('.barre-rai-container')).toHaveCount(1);
};
const preference = (page) => page.evaluate(() => (db.getSync('preferencesUtilisateur', {}) || {}).afficherReponseDuGroupe ?? null);
const normal = (t) => t.replace(/\s+/g, ' ').trim();

test('éteinte : aucune lecture du groupe sur l\'Aperçu, et rien d\'écrit sans geste', async ({ page }) => {
    await demo(page);
    await allerALApercu(page);
    await expect(page.locator('[data-reponse-groupe]')).toHaveCount(0);
    const sous = normal(await page.locator('.barre-rai-container').innerText());
    expect(sous).not.toMatch(/enseignement universel|La moyenne du groupe|repère de la RàI/);
    await allerAuReglage(page);
    await expect(page.locator('#v2-pref-reponse-groupe')).not.toBeChecked();
    await page.locator('#v2-pref-graphiques').dispatchEvent('change');
    await expect.poll(() => page.evaluate(() => 'afficherGraphiques' in (db.getSync('preferencesUtilisateur', {}) || {}))).toBe(true);
    expect(await preference(page)).toBeNull();
});

test('le réglage : voir d\'abord, activer ensuite, et la carte décrit le même groupe que le réglage', async ({ page }) => {
    await demo(page);
    await allerAuReglage(page);

    await expect(page.locator('#v2-seuils-donnent')).toBeHidden();
    await expect(page.locator('#v2-pref-reponse-groupe')).toBeDisabled();

    await page.locator('#v2-voir-seuils').click();
    await expect(page.locator('#v2-seuils-donnent')).toBeVisible();
    await expect(page.locator('.seuils-donnent-niveau')).toHaveCount(3);
    await expect(page.locator('#v2-seuils-donnent')).toContainText('Sensibilité de ton seuil');
    await expect(page.locator('#v2-seuils-donnent')).toContainText('D\'où viennent les niveaux 2 et 3');
    const niveaux = normal(await page.locator('.seuils-donnent-niveaux').innerText());
    expect(niveaux).toContain('Niveau 2 · Préventif');
    const part1 = (await page.locator('.seuils-donnent-niveau').first().innerText()).match(/(\d+)\s%/)[1];

    await page.evaluate(() => {
        const c = document.getElementById('v2-pref-reponse-groupe');
        c.checked = true;
        c.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(() => preference(page)).toBe(true);

    await allerALApercu(page);
    const carte = page.locator('[data-reponse-groupe]');
    await expect(carte).toHaveCount(1);
    await expect(carte.locator('.reponse-groupe-barre')).toHaveCount(2);
    const texte = normal(await carte.innerText());
    expect(texte).toContain(`${part1} % de ton groupe est au niveau 1.`);
    expect(texte).toContain('Le repère 80-15-5 est une heuristique de la RàI');
    const dessous = await page.evaluate(() => {
        const carte = document.querySelector('[data-reponse-groupe]');
        const barre = document.querySelector('.barre-rai');
        return barre.compareDocumentPosition(carte) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(dessous).toBeTruthy();

    // Déjà activée, la case reste accessible à l'ouverture du panneau : elle doit pouvoir s'éteindre sans autre geste.
    await allerAuReglage(page);
    await expect(page.locator('#v2-pref-reponse-groupe')).toBeChecked();
    await expect(page.locator('#v2-pref-reponse-groupe')).toBeEnabled();
    await page.evaluate(() => {
        const c = document.getElementById('v2-pref-reponse-groupe');
        c.checked = false;
        c.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(() => preference(page)).toBe(false);
    await allerALApercu(page);
    await expect(page.locator('[data-reponse-groupe]')).toHaveCount(0);
});

test('l\'Aide lit le seuil à sa source', async ({ page }) => {
    await demo(page);
    const lu = await page.evaluate(() => {
        window.remplirAideSeuilsDeDepart();
        return document.querySelector('#accordeon-aide-rai [data-seuil-reponse-groupe]').textContent;
    });
    expect(lu.replace(/\s/g, ' ')).toBe(`${await page.evaluate(() => window.SEUIL_NIVEAU_1_REPONSE_DU_GROUPE)} %`);
});
