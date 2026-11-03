import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1126 (3 nov. 2026) — AU MAC, LE CHAMP « NOM DU CRITÈRE » EST ASSEZ LARGE.
// Capture de Grégoire du 20 oct., 13 h 54 : à 1 440 px, « Partie A : compréhension – » était
// coupé. Le gabarit de la rangée (`2fr 140px 90px 150px 3fr`, en style en ligne) donnait plus à
// la Description qu'au Nom, et la règle #1095 ne joue qu'à 1 180 px ou moins. Nom fictif.

const NOM = 'Partie A : compréhension – lecture fictive';

async function ouvrirGrillesDeCriteres(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false), null, { timeout: 20000 });
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await expect(page.locator('[data-action="creerNouvelleGrille"]')).toBeVisible();
}

test.use({ viewport: { width: 1440, height: 900 } });

test('#1126 — à 1 440 px, le nom d\'un critère tient dans son champ, plus large que la description', async ({ page }) => {
    await ouvrirGrillesDeCriteres(page);
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    const rangee = page.locator('#listeCriteres .critere-rangee').first();
    const nom = rangee.locator('input[data-champ="nom"]');
    await nom.fill(NOM);
    const m = await rangee.evaluate((r) => {
        const champ = r.querySelector('input[data-champ="nom"]');
        const blocs = [...r.children];
        return {
            visible: champ.clientWidth, contenu: champ.scrollWidth,
            nom: blocs[0].getBoundingClientRect().width,
            description: blocs[blocs.length - 1].getBoundingClientRect().width,
            enLigne: r.getAttribute('style') || ''
        };
    });
    expect(m.contenu, `le nom déborde : ${m.contenu} px pour ${m.visible} px visibles`).toBeLessThanOrEqual(m.visible);
    expect(m.nom, 'le Nom passe devant la Description').toBeGreaterThan(m.description);
    expect(m.enLigne, 'le gabarit vit dans styles.css, pas en style en ligne').not.toMatch(/grid-template-columns/);
});
