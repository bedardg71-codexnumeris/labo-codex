import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { attendreApplication } from './harness/attendre-application.js';
import { indexHtml, ouvrirPanneau, bulle } from './harness/classe-de-banc.js';
import { DEPARTS, DOSSIER_DES_DEPARTS, nomDuCodex } from '../departs-de-parcours/departs.js';

// =======================================================================
// CHAQUE CODEX DE DÉPART S'OUVRE, ET SON PARCOURS PART (20 nov. 2026, branche d'essai `apercu/essai-parcours`)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md, point 7. Un essai par fichier de departs/ (fabriqués par
// tests/departs-de-parcours/fabriquer-codex-de-depart.spec.js) :
//   1. un espace vide (témoin : aucun trimestre, aucun codex actif) ;
//   2. le fichier ouvert par le geste de l'iPad : « Codex » dans l'en-tête, « Ouvrir un codex », le champ de fichier
//      (Safari n'a pas `showOpenFilePicker` : le banc le retire, Chromium le prendrait sinon), puis « Recharger » ;
//   3. le panneau « Assistance », le bouton « Nous faisons » du parcours visé ;
//   4. sa première bulle paraît (« 1 sur N », son titre), sans refus dans le panneau.
// Les parcours sont ceux que la branche ouvre (`PARCOURS_OUVERTS`) : le harnais ne les rouvre pas ici.
// Break-tests (20 nov., au rapport) : un codex sans ses productions (ou sans trimestre), un fichier coupé en deux, et
// « monter » retiré de `PARCOURS_OUVERTS` font rougir l'essai.
// Ce banc lit les fichiers COMMIS (DEPARTS_DOSSIER pour un autre dossier) : c'est ce que Grégoire télécharge.

const item = (page, id) => page.locator(`#panneau-assistance [data-parcours="${id}"]`);

async function espaceVide(page) {
    page.setDefaultTimeout(20000);
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    // `parcoursFermes` : le banc juge les parcours que l'aperçu ouvre VRAIMENT (`PARCOURS_OUVERTS`), pas ceux que le
    // harnais rouvre en mémoire (attendre-application.js).
    await attendreApplication(page, { parcoursFermes: true });
    const t = await page.evaluate(() => ({
        trimestres: (window.enumererTrimestres ? window.enumererTrimestres() : []).filter((x) => x && x.id !== 'demo').length,
        codexActif: Codex.etat().actif === true
    }));
    expect(t, 'témoin : un espace vide').toEqual({ trimestres: 0, codexActif: false });
}

/** Le geste de l'iPad : « Codex », « Ouvrir un codex », le fichier, puis « Recharger ». */
async function ouvrirLeCodex(page, fichier) {
    await page.evaluate(() => { delete window.showOpenFilePicker; });
    await page.click('#btn-codex');
    const choix = page.waitForEvent('filechooser');
    await page.locator('#codex-menu [data-action="Codex.actionOuvrir"]:visible').click();
    await (await choix).setFiles(fichier);
    const recharger = page.locator('#overlay-ui-dialogue').getByRole('button', { name: 'Recharger', exact: true });
    await expect(recharger, 'l’ouverture propose de recharger').toBeVisible({ timeout: 30000 });
    await Promise.all([page.waitForEvent('load'), recharger.click()]);
    await attendreApplication(page, { parcoursFermes: true });
}

for (const d of DEPARTS) {
    test(`« Départ : ${d.titre} » s'ouvre dans un espace vide, et le parcours part de sa première bulle`, async ({ page }) => {
        test.setTimeout(120000);
        const fichier = path.join(DOSSIER_DES_DEPARTS, d.fichier);
        expect(fs.existsSync(fichier), `${d.fichier} est dans ${DOSSIER_DES_DEPARTS}`).toBe(true);
        page.on('dialog', (x) => x.accept().catch(() => {}));

        await espaceVide(page);
        await ouvrirLeCodex(page, fichier);
        expect(await page.evaluate(() => ({ actif: Codex.etat().actif, nom: Codex.etat().nom })), 'le codex ouvert')
            .toEqual({ actif: true, nom: nomDuCodex(d) });

        await ouvrirPanneau(page);
        await item(page, d.parcours).locator('.assistance-parcours-bouton').click();
        // La bulle, ou le refus dit sous le bouton : le premier des deux qui paraît, nommé.
        await expect.poll(() => page.evaluate((id) => {
            const r = document.querySelector(`#panneau-assistance [data-parcours="${id}"] .assistance-parcours-refus`);
            if (r && r.textContent.trim()) return 'refus : ' + r.textContent.trim();
            const b = document.querySelector('#parcours-bulle .parcours-bulle-rang');
            return b ? 'bulle' : 'rien encore';
        }, d.parcours), { message: `${d.parcours} : la première bulle, sans refus`, timeout: 20000 }).toBe('bulle');
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur ' + d.premiereBulle.total);
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(d.premiereBulle.titre);
    });
}
