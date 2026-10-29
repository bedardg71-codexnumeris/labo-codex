import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 29 oct. 2026 — LE GUIDAGE DE LA DÉMO (consigne `plans de travail/CONSIGNE-LOT-2026-10-29-guidage-demo.md`, § 2).
// La démo s'ouvre sur Suivi › Suivi du groupe (demo-activation.js, `naviguerVers('suivi', 'groupe')`). Avant, cet écran
// n'avait aucune bulle : la sienne vivait sous la clé `apercu-contenu`, l'identifiant d'aucune sous-section. Elle est
// maintenant sous `suivi-groupe`, et s'affiche par l'appel de navigation.js (`afficherGuidageDemo`), qui n'a pas changé.
// L'unitaire (sentinelle-guidage-demo-2026-10-29) juge les textes ; ici, que la bulle paraît. Données de la démo.

test('la démo activée, Suivi du groupe montre la bulle « Suivi du groupe »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 20000 });
    await page.evaluate(async () => { await window.activerModeDemo(); });
    const bulle = page.locator('#suivi-groupe > #guidage-demo-encart');
    await expect(bulle).toBeVisible();
    await expect(bulle.locator('strong')).toHaveText('Suivi du groupe');
    await expect(bulle).toContainText('des 10 étudiant·es de la démo');
    expect(erreurs).toEqual([]);
});
