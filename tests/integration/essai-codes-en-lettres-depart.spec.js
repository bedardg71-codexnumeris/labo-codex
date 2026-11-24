import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { attendreApplication } from './harness/attendre-application.js';
import { indexHtml } from './harness/classe-de-banc.js';
import { DOSSIER_DES_DEPARTS } from '../departs-de-parcours/departs.js';
import { FICHIER_ESSAI, NOM_ESSAI, CODES } from '../departs-de-parcours/essai-codes-en-lettres.js';

// =======================================================================
// ⚠ ESSAI SEULEMENT — LE FICHIER D'ESSAI DES CODES EN LETTRES S'OUVRE, ET UN CODE SE POSE (24 nov. 2026, suite, point 4)
// =======================================================================
// À RETIRER AVANT LA FUSION, avec le fichier, sa fabrique (tests/departs-de-parcours/essai-codes-en-lettres.spec.js) et
// sa section de departs.html. Les gestes de Grégoire, dans l'aperçu :
//   1. un espace vide (témoin : aucun trimestre, aucun codex actif) ;
//   2. « Codex », « Ouvrir un codex », le fichier, « Recharger » (le geste de l'iPad, comme codex-de-depart-2026-11-20) ;
//   3. Évaluations › la liste, la ligne de la copie fictive, son menu d'actions, « Annoter » ;
//   4. la palette Codes montre les dix-sept codes ; toucher « QRST », puis la copie, pose un code.
// Ce banc lit le fichier COMMIS dans departs/ (DEPARTS_DOSSIER pour un autre dossier) : c'est ce que Grégoire télécharge.

test('le fichier d’essai s’ouvre dans un espace vide, la copie s’annote, un code de quatre caractères se pose', async ({ page }) => {
    test.setTimeout(120000);
    const fichier = path.join(DOSSIER_DES_DEPARTS, FICHIER_ESSAI);
    expect(fs.existsSync(fichier), `${FICHIER_ESSAI} est dans ${DOSSIER_DES_DEPARTS}`).toBe(true);
    page.on('dialog', (x) => x.accept().catch(() => {}));
    page.setDefaultTimeout(20000);
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await attendreApplication(page);
    expect(await page.evaluate(() => ({
        trimestres: (window.enumererTrimestres ? window.enumererTrimestres() : []).filter((x) => x && x.id !== 'demo').length,
        codexActif: Codex.etat().actif === true
    })), 'témoin : un espace vide').toEqual({ trimestres: 0, codexActif: false });

    // « Codex », « Ouvrir un codex », le fichier, « Recharger ».
    await page.evaluate(() => { delete window.showOpenFilePicker; });
    await page.click('#btn-codex');
    const choix = page.waitForEvent('filechooser');
    await page.locator('#codex-menu [data-action="Codex.actionOuvrir"]:visible').click();
    await (await choix).setFiles(fichier);
    const recharger = page.locator('#overlay-ui-dialogue').getByRole('button', { name: 'Recharger', exact: true });
    await expect(recharger, 'l’ouverture propose de recharger').toBeVisible({ timeout: 30000 });
    await Promise.all([page.waitForEvent('load'), recharger.click()]);
    await attendreApplication(page);
    expect(await page.evaluate(() => ({ actif: Codex.etat().actif, nom: Codex.etat().nom }))).toEqual({ actif: true, nom: NOM_ESSAI });

    // Évaluations › la liste : la ligne de la copie fictive, « Annoter ».
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    const menu = page.locator('select.eval-actions-select:has(option[value^="annoter|"])').first();
    await expect(menu, 'la copie fictive est dans la liste, avec « Annoter »').toBeVisible();
    const valeur = await menu.evaluate((s) => s.querySelector('option[value^="annoter|"]').value);
    await menu.selectOption(valeur);
    await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 15000 });

    // La palette Codes : les dix-sept codes, dans l'ordre de la grille.
    await expect(page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item')).toHaveCount(CODES.length, { timeout: 15000 });
    expect(await page.locator('#travaux-palette-erreurs-fr .travaux-errfr-numero').allTextContents()).toEqual(CODES);
    // La copie est chargée : le calque d'annotation a une taille.
    await expect.poll(() => page.evaluate(() => (document.getElementById('travaux-canvas-annotation') || {}).width || 0)).toBeGreaterThan(100);

    // Toucher « QRST », puis la copie : un code se pose.
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    await page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item[data-param="errfr_QRST"]').click();
    const point = await page.evaluate(() => {
        const c = document.getElementById('travaux-canvas-annotation');
        c.scrollIntoView({ block: 'center' });
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.3 };
    });
    await page.mouse.click(point.x, point.y);   // le clic qu'on éprouve : poser un code
    await expect.poll(() => page.evaluate(() => {
        const a = window.travauxAnnotation.getAnnotationCourante();
        return a && a.pages ? Object.values(a.pages).flatMap((p) => p.shapes || []).map((f) => f.type) : [];
    })).toEqual(['errfr_QRST']);
});
