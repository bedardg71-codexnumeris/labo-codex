import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1010 (4 oct. 2026) — LE SIGNAL AU DÉBUT DE L'ÉVALUATION, DANS LA VRAIE PAGE.
//
// Décision de Grégoire (1er oct.) : la case « Consignes transmises » décochée pour le groupe de l'élève, l'écran
// d'évaluation le signale ; pas de coche automatique. Le bandeau est posé par `ecrireLabelsIdentite`, que tous les
// chemins d'ouverture traversent ; ce banc en prend deux : « Évaluer » sans copie (`evaluerProduction`, celui de la
// Liste) et la flèche « élève suivant ».
//
// ⚠ LE PACK DÉMO N'A NI COPIE NI `echeancesParGroupe` : le banc pose lui-même l'entrée du groupe-cours de la démo.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const PROD = 'PROD1759719880034';   // « Artefact 1 », évaluée pour les dix élèves de la démo

test('évaluation · case « Consignes transmises » décochée : le bandeau le dit, son bouton la coche, et il part', async ({ page }) => {
    test.setTimeout(180000);
    page.setDefaultTimeout(15000);
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss(); });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const gcId = await page.evaluate(async () => {
        await window.activerModeDemo();
        await new Promise((r) => setTimeout(r, 1500));
        return window.syntheseRetroactionData.groupeCoursIdDeLEleve('DEMO004');
    });
    expect(gcId).toBeTruthy();

    const poserEcheances = (echeances) => page.evaluate(({ PROD, echeances }) => {
        const productions = obtenirDonneesSelonMode('productions');
        productions.find(p => p.id === PROD).echeancesParGroupe = echeances;
        sauvegarderDonneesSelonMode('productions', productions);
    }, { PROD, echeances });
    const lireEntree = () => page.evaluate(({ PROD, gcId }) =>
        obtenirDonneesSelonMode('productions').find(p => p.id === PROD).echeancesParGroupe[gcId], { PROD, gcId });
    const evaluer = async (da) => {
        await page.evaluate(({ da, PROD }) => evaluerProduction(da, PROD), { da, PROD });
        // L'en-tête écrit l'élève : le chemin d'ouverture est passé par `ecrireLabelsIdentite`.
        await expect(page.locator('#travaux-eval-label-etudiant')).not.toHaveText('—');
        await expect(page.locator('#travaux-eval-label-production')).toHaveText('Artefact 1');
        await page.waitForTimeout(300);
    };
    const bandeau = page.locator('#travaux-eval-signal-consignes');

    // (1) Case décochée pour le groupe de l'élève : le bandeau paraît, à chaque ouverture.
    await poserEcheances({ [gcId]: { assignee: false, date: '2025-09-22' } });
    await evaluer('DEMO004');
    await expect(bandeau).toBeVisible();
    await expect(page.locator('#travaux-eval-signal-consignes-texte')).toHaveText(
        'Les consignes de «\u00a0Artefact 1\u00a0» ne semblent pas avoir été transmises à ce groupe\u00a0: la case «\u00a0Consignes transmises\u00a0» est décochée. '
        + 'Tant qu\u2019elle l\u2019est, cette production n\u2019apparaît pas au calendrier et ses copies ne comptent pas dans les courbes de progression.');
    await expect(page.locator('#travaux-eval-signal-consignes-btn')).toHaveText('Cocher «\u00a0Consignes transmises\u00a0»');
    // Il ne nomme personne.
    const texte = await page.locator('#travaux-eval-signal-consignes-texte').textContent();
    const noms = await page.evaluate(() => obtenirDonneesSelonMode('groupeEtudiants').flatMap(e => [e.nom, e.prenom]).filter(Boolean));
    expect(noms.filter(n => texte.includes(n))).toEqual([]);
    // iPad, 768 px : le bandeau tient dans sa colonne, le bouton dans le bandeau.
    const mise = await page.evaluate(() => {
        const b = document.getElementById('travaux-eval-signal-consignes');
        const btn = document.getElementById('travaux-eval-signal-consignes-btn');
        const rb = b.getBoundingClientRect(), rbtn = btn.getBoundingClientRect(), rp = b.parentElement.getBoundingClientRect();
        return { deborde: b.scrollWidth > b.clientWidth + 1, dansParent: rb.left >= rp.left - 1 && rb.right <= rp.right + 1,
            boutonDedans: rbtn.left >= rb.left - 1 && rbtn.right <= rb.right + 1, dansEcran: rb.right <= window.innerWidth + 1,
            hauteurBouton: Math.round(rbtn.height) };
    });
    expect(mise).toMatchObject({ deborde: false, dansParent: true, boutonDedans: true, dansEcran: true });

    // Flèche « élève suivant » : autre chemin, même groupe, le bandeau reste.
    const avant = await page.locator('#travaux-eval-label-etudiant').textContent();
    await page.evaluate(() => naviguerEtudiantSuivant());
    await expect(page.locator('#travaux-eval-label-etudiant')).not.toHaveText(avant);
    await expect(bandeau).toBeVisible();

    // (2) Le bouton coche la case de CE groupe-cours (la date reste), et le bandeau part.
    await page.locator('#travaux-eval-signal-consignes-btn').click();
    await expect(bandeau).toBeHidden();
    expect(await lireEntree()).toEqual({ assignee: true, date: '2025-09-22' });

    // (3) Case cochée : aucun bandeau à l'ouverture suivante.
    await evaluer('DEMO006');
    await expect(bandeau).toBeHidden();

    // (4) Un AUTRE groupe de la même production a la case décochée ; celui de l'élève est coché : aucun bandeau.
    await poserEcheances({ [gcId]: { assignee: true, date: '2025-09-22' }, GC_AUTRE_GROUPE: { assignee: false, date: '2025-09-22' } });
    await evaluer('DEMO007');
    await expect(bandeau).toBeHidden();
    // Témoin : la même ouverture, la case de SON groupe décochée, fait paraître le bandeau (sinon (3) et (4) ne prouveraient rien).
    await poserEcheances({ [gcId]: { assignee: false, date: '2025-09-22' }, GC_AUTRE_GROUPE: { assignee: true, date: '2025-09-22' } });
    await evaluer('DEMO007');
    await expect(bandeau).toBeVisible();

    expect(dialogues).toEqual([]);
});
