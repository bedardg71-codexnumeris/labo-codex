import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Test trivial de validation du setup Playwright + WebKit. À conserver —
// sert de canari pour vérifier que le navigateur charge index.html en file://
// avant de lancer les tests d'isolation sandbox/CSP.
test('charge index.html en WebKit headless', async ({ page }) => {
    await page.goto(indexHtml);
    await expect(page).toHaveTitle(/Labo Codex/);
});
