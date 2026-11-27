import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace } from './harness/classe-de-banc.js';

// =======================================================================
// LOT « ÉVALUATION » DU 27 NOV. 2026, À L'ÉCRAN : #598 VOLET B ET #1271
// =======================================================================
//
// Évaluation › Préparer, étape « Optimisation », sur la page réelle.
//  · #598 volet B : la case « Balance des blancs » est posée sur la ligne de « Rés. max. »,
//    cochée au départ ; décochée, la vignette « Aperçu » montre l'image sans la balance, et
//    l'import ne l'applique pas ; elle reste décochée après « Annuler tout » (comme « Rés. max. »).
//  · #1271 : la production choisie en haut tombe après « Annuler tout » : au dépôt suivant, le
//    menu revient à « — Choisir une production — » et le nom porté par le fichier propose la
//    production.
// La logique est tenue par tests/unit/balance-du-lot-598-volet-b.test.js et
// tests/unit/production-du-lot-1271.test.js. Données manifestement fictives (règle 6) : la classe
// du banc (classe-de-banc.js), deux productions « Journal 3 » et « Journal 4 ».

const PRODUCTIONS = [
    { id: 'PROD_journal3', titre: 'Journal 3' },
    { id: 'PROD_journal4', titre: 'Journal 4' }
];

/** Dépose une page jaunie (la balance des blancs la blanchit) au nom de Léa. */
async function deposer(page, nom, da, production) {
    const dt = await page.evaluateHandle(async ([n, d, p]) => {
        const t = new DataTransfer();
        const c = document.createElement('canvas');
        c.width = 300; c.height = 390;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#e8d8a0'; ctx.fillRect(0, 0, 300, 390);
        ctx.fillStyle = '#302010'; ctx.font = 'bold 30px sans-serif';
        ctx.fillText(n, 20, 80);
        const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
        t.items.add(new File([blob], `${n}_${d}_${p}_Remis_le_2026-11-20_09h46m45s.png`, { type: 'image/png', lastModified: Date.UTC(2026, 10, 20, 14) }));
        return t;
    }, [nom, da, production]);
    await page.dispatchEvent('#travaux-drop-zone', 'drop', { dataTransfer: dt });
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(1);
}

/** La couleur moyenne de la vignette « Aperçu » du premier fichier, une fois rendue dans sa version `cle` (« bal » ou « raw »). */
async function couleurApercu(page, cle) {
    // La cellule montre d'abord la miniature brute ; l'aperçu traité la remplace un peu plus tard.
    await page.waitForFunction((k) => {
        const f = travauxImport.obtenirFileDAttente()[0];
        const img = document.querySelector('#pipeline-preview-0 img');
        return f && f._previewCache && f._previewCache[k] && img && img.src === f._previewCache[k] && img.complete && img.naturalWidth > 0;
    }, cle);
    return page.evaluate(() => {
        const img = document.querySelector('#pipeline-preview-0 img');
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < d.length; k += 4) { r += d[k]; g += d[k + 1]; b += d[k + 2]; }
        const n = d.length / 4;
        return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
    });
}

test('Optimisation : la case « Balance des blancs » vaut pour le lot ; la production choisie tombe avec « Annuler tout »', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirEspaceVide(page, 1180);
    await mettreLaClasseEnPlace(page);
    await page.evaluate((productions) => {
        const gc = db.getSync('groupeCoursActif', null);
        db.setSync(cle('productions'), productions.map((p) => Object.assign({ type: 'travail', ponderation: 50, coursId: gc && gc.coursId, dansBibliotheque: true }, p))); // security-ok: fixture
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        afficherSection('evaluations');
        afficherSousSection('evaluations-importer');
    }, PRODUCTIONS);
    await page.waitForFunction(() => !!document.getElementById('travaux-drop-zone'));

    // A. La case, cochée au départ, sur la ligne de « Rés. max. ».
    await deposer(page, 'Cormoran_Cleo', '2390003', 'Journal_3');
    const caseLot = page.locator('#pipeline-opt-balance-lot');
    await expect(caseLot).toBeVisible();
    await expect(caseLot).toBeChecked();
    const ligne = page.locator('.pipeline-reglages-ligne');
    await expect(ligne.locator('#pipeline-opt-dpi')).toHaveCount(1);
    await expect(ligne.locator('#pipeline-opt-balance-lot')).toHaveCount(1);
    await expect(ligne.locator('label', { has: caseLot })).toHaveText('Balance des blancs');
    const boite = await ligne.locator('label', { has: caseLot }).boundingBox();
    expect(boite.height, 'la cible tactile de l\'iPad : 44 px').toBeGreaterThanOrEqual(44);

    // B. Décochée : la vignette « Aperçu » perd la balance ; recochée : elle la retrouve.
    const avec = await couleurApercu(page, 'bal');
    await caseLot.uncheck();
    const sans = await couleurApercu(page, 'raw');
    expect(avec.b - sans.b, 'la balance blanchit la page jaunie : plus de bleu avec elle').toBeGreaterThan(20);
    expect(await page.evaluate(() => travauxUI.balanceActiveePour(travauxImport.obtenirFileDAttente()[0]))).toBe(false);
    await caseLot.check();
    expect((await couleurApercu(page, 'bal')).b).toBe(avec.b);
    await caseLot.uncheck();
    await couleurApercu(page, 'raw');

    // C. #1271 : choisir une production pour le lot, puis « Annuler tout ».
    await page.selectOption('#pipeline-select-production', 'PROD_journal4');
    await expect.poll(() => page.evaluate(() => travauxImport.getProductionGlobale())).toBe('PROD_journal4');
    await page.click('[data-action="travauxUI.annulerImport"]');
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(0);
    expect(await page.evaluate(() => travauxImport.getProductionGlobale())).toBe('');

    // D. Le dépôt suivant : le menu revient au choix vide, le nom du fichier propose « Journal 3 » ;
    //    la case est restée décochée (retenue comme « Rés. max. »).
    await deposer(page, 'Alpaga_Alix', '2390001', 'Journal_3');
    await expect(page.locator('#pipeline-select-production')).toHaveValue('');
    expect(await page.evaluate(() => travauxImport.obtenirFileDAttente()[0].productionId)).toBe('PROD_journal3');
    await expect(page.locator('#pipeline-opt-balance-lot')).not.toBeChecked();

    // E. L'import, case décochée : la balance automatique n'est pas appelée.
    const appels = await page.evaluate(async () => {
        let n = 0;
        const vraie = travauxPreparation.autoBalanceBlancs;
        travauxPreparation.autoBalanceBlancs = async (b) => { n++; return vraie(b); };
        try { await travauxUI._executerImportPipeline(); } finally { travauxPreparation.autoBalanceBlancs = vraie; }
        return n;
    });
    expect(appels).toBe(0);
    await expect.poll(() => page.evaluate(() => travauxStockage.obtenirFichiersGroupeActif().length)).toBe(1);

    expect(erreurs).toEqual([]);
});
