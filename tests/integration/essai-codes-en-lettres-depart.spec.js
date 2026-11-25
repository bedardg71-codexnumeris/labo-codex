import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { attendreApplication } from './harness/attendre-application.js';
import { indexHtml } from './harness/classe-de-banc.js';
import { DOSSIER_DES_DEPARTS } from '../departs-de-parcours/departs.js';
import { FICHIER_ESSAI, NOM_ESSAI, CODES } from '../departs-de-parcours/essai-codes-en-lettres.js';

// =======================================================================
// ⚠ ESSAI SEULEMENT — LE FICHIER D'ESSAI DES CODES EN LETTRES S'OUVRE, UN CODE SE POSE, LE PDF SE PRODUIT
// (24 nov. 2026, suite, point 4 ; retour d'essai de 19 h 30, défaut 2)
// =======================================================================
// À RETIRER AVANT LA FUSION, avec le fichier, sa fabrique (tests/departs-de-parcours/essai-codes-en-lettres.spec.js) et
// sa section de departs.html. Les gestes de Grégoire, dans l'aperçu :
//   1. un espace vide (témoin : aucun trimestre, aucun codex actif) ;
//   2. « Codex », « Ouvrir un codex », le fichier, « Recharger » (le geste de l'iPad, comme codex-de-depart-2026-11-20) ;
//   3. Évaluation › Liste, la ligne de la copie fictive, son menu d'actions, « Annoter » ;
//   4. la palette Codes montre les dix-sept codes ; toucher un code, puis la copie, pose le code ;
//   5. (le PDF) « Annoter ▾ », « Évaluer », « Verrouiller » ; l'onglet « Exporter » ; « Export Léa », la production,
//      « Exporter pour Léa » : un PDF se télécharge, la copie et sa page de synthèse portent les pastilles.
// Ce banc lit le fichier COMMIS dans departs/ (DEPARTS_DOSSIER pour un autre dossier) : c'est ce que Grégoire télécharge.
// Break-test (25 nov.) : le fichier d'avant le retour d'essai, sans évaluation, fait rougir l'essai du PDF (« Aucune
// évaluation trouvée ») ; un codex privé de sa copie fait rougir les deux.

const fermerLeRappel = (page) => page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });

/** Les gestes 1 à 3 : un espace vide, le fichier ouvert, la copie fictive en Annoter. */
async function ouvrirLaCopieDuFichier(page) {
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

    // Évaluation › Liste : la ligne de la copie fictive, « Annoter ».
    await fermerLeRappel(page);
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    const menu = page.locator('select.eval-actions-select:has(option[value^="annoter|"])').first();
    await expect(menu, 'la copie fictive est dans la liste, avec « Annoter »').toBeVisible();
    const valeur = await menu.evaluate((s) => s.querySelector('option[value^="annoter|"]').value);
    await menu.selectOption(valeur);
    await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 15000 });
    await expect(page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item')).toHaveCount(CODES.length, { timeout: 15000 });
    await expect.poll(() => page.evaluate(() => (document.getElementById('travaux-canvas-annotation') || {}).width || 0)).toBeGreaterThan(100);
    await fermerLeRappel(page);
}

/** Toucher un code dans la palette, puis la copie (fx : fraction de sa largeur). */
async function poser(page, code, fx) {
    await page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item[data-param="errfr_' + code + '"]').click();
    const point = await page.evaluate((fx) => {
        const c = document.getElementById('travaux-canvas-annotation');
        c.scrollIntoView({ block: 'center' });
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width * fx, y: r.top + r.height * 0.3 };
    }, fx);
    await page.mouse.click(point.x, point.y);   // le clic qu'on éprouve : poser un code
}

const posees = (page) => page.evaluate(() => {
    const a = window.travauxAnnotation.getAnnotationCourante();
    return a && a.pages ? Object.values(a.pages).flatMap((p) => p.shapes || []).map((f) => f.type) : [];
});

test('le fichier d’essai s’ouvre dans un espace vide, la copie s’annote, un code de quatre caractères se pose', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirLaCopieDuFichier(page);
    expect(await page.locator('#travaux-palette-erreurs-fr .travaux-errfr-numero').allTextContents()).toEqual(CODES);
    await poser(page, 'QRST', 0.5);
    await expect.poll(() => posees(page)).toEqual(['errfr_QRST']);
});

test('le PDF se produit par les gestes : Évaluer, Verrouiller, Exporter pour Léa ; la copie et la synthèse portent les pastilles', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirLaCopieDuFichier(page);
    await poser(page, 'K-A', 0.3);
    await poser(page, 'QRST', 0.5);
    await poser(page, 'W-12', 0.7);
    await expect.poll(() => posees(page)).toEqual(['errfr_K-A', 'errfr_QRST', 'errfr_W-12']);

    // « Annoter ▾ », « Évaluer » : l'évaluation commencée du fichier (300 mots) ; les erreurs suivent les trois codes.
    await page.click('#travaux-btn-actions');
    await page.click('#travaux-btn-evaluer');
    await expect(page.locator('input[id^="eval_mots_"]').first(), 'les mots du fichier').toHaveValue('300');
    await expect(page.locator('input[id^="eval_erreurs_"]').first(), 'les erreurs suivent les codes posés').toHaveValue('3');
    await fermerLeRappel(page);
    await page.click('#btnVerrouillerEvaluation');
    await expect.poll(() => page.evaluate(() => (obtenirDonneesSelonMode('evaluationsSauvegardees') || []).map((e) => !!e.verrouillee))).toEqual([true]);

    // L'onglet « Exporter », « Export Léa » : la production, puis « Exporter pour Léa ».
    await fermerLeRappel(page);
    await page.locator('#sous-navigation [data-sous-onglet="evaluations-exporter"]').click();   // l'onglet « Exporter » de la barre d'Évaluation
    await expect(page.locator('#travaux-archivage-lea-production')).toBeVisible();
    const production = await page.locator('#travaux-archivage-lea-production option').evaluateAll((os) => os.map((o) => o.value).find(Boolean));
    await page.selectOption('#travaux-archivage-lea-production', production);
    await expect(page.locator('#travaux-lea-compteur')).toHaveText('1 PDF pour 1 étudiant·e');
    const telechargement = page.waitForEvent('download', { timeout: 90000 });
    await page.locator('[data-action="travauxUI.lancerExportLea"]').click();
    const pdf = await telechargement;
    expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);
    const b64 = fs.readFileSync(await pdf.path()).toString('base64');

    // Le PDF, relu par pdf.js : deux pages (la copie, la synthèse), le rouge exact de la pastille « K-A » (#c62828)
    // sur chacune. La copie fictive porte des annotations manuscrites magenta : ce rouge-là n'y est pas (témoin).
    const r = await page.evaluate(async (b64) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const doc = await pdfjsLib.getDocument({ data: octets }).promise;
        const rouges = [];
        for (let i = 1; i <= doc.numPages; i++) {
            const pg = await doc.getPage(i);
            const v = pg.getViewport({ scale: 1 });
            const c = document.createElement('canvas'); c.width = v.width; c.height = v.height;
            await pg.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
            const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
            let n = 0;
            for (let k = 0; k < d.length; k += 4) if (Math.abs(d[k] - 198) < 20 && Math.abs(d[k + 1] - 40) < 20 && Math.abs(d[k + 2] - 40) < 20) n++;
            rouges.push(n);
        }
        return { pages: doc.numPages, rouges };
    }, b64);
    console.log('PDF →', JSON.stringify(r));
    expect(r.pages, 'la copie et sa page de synthèse').toBe(2);
    expect(r.rouges[0], 'la pastille « K-A » sur la copie').toBeGreaterThan(30);
    expect(r.rouges[1], 'la pastille « K-A » sur la page de synthèse').toBeGreaterThan(30);
});
