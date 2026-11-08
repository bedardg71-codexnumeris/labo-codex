import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// #1086 (8 nov. 2026) — l'aide sur les indices C et P suit la case « Consignes transmises », qui décide de ce
// qui y entre : avec un groupe-cours, elle est sur la ligne de la case et quitte la date. L'écran seulement :
// la règle `.aide-contextuelle-active .btn-aide-contextuelle` (display !important) l'emportait sur `u-hide`,
// et le banc unitaire (sentinelle-494, U1.e) ne voit pas le style calculé. Pack démo, noms fictifs.
// Break-test (8 nov.) : la règle `.btn-aide-contextuelle.u-hide` de css/accompagnement.css neutralisée → ROUGE.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('une seule aide « C et P » visible : sur la ligne de la case, pas à la date', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('file://' + path.join(racine, 'index.html'));
    await attendreApplication(page);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => { const r = indexedDB.deleteDatabase('LaboCodexDB'); r.onsuccess = r.onerror = r.onblocked = () => res(); setTimeout(res, 1500); });
    });
    await page.reload();
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    const id = await page.evaluate(() => (obtenirDonneesSelonMode('productions') || []).find((p) => p.type !== 'portfolio').id);
    await page.evaluate(async (id) => { await chargerProductionPourModif(id); }, id);
    await expect(page.locator('.echeance-simple-ligne .btn-aide-contextuelle[data-aide="echeance-indices"]')).toBeVisible();
    await expect(page.locator('#aideEcheanceIndicesDate')).toBeHidden();
    await expect(page.locator('[data-aide="echeance-indices"]:visible')).toHaveCount(1);
});
