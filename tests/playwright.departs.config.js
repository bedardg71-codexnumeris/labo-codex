// LA FABRIQUE DES CODEX DE DÉPART (20 nov. 2026) — pas une suite de bancs : elle écrit des fichiers.
// plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md, point 4 ; le mode d'emploi : departs-de-parcours/departs.js.
//     cd tests && npm run departs
// Sur le Mac : WebKit, comme la suite. Dans une session cloud (pas de WebKit) : Chromium, par son chemin,
//     PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium npm run departs
// Le fichier fabriqué est le même qu'un « Mettre à jour le codex » : le navigateur qui l'écrit ne change que le
// manifeste (appareil, navigateur).
import { defineConfig, devices } from '@playwright/test';

const chromium = process.env.PLAYWRIGHT_CHROMIUM;

export default defineConfig({
    testDir: './departs-de-parcours',
    testMatch: '**/*.spec.js',
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: { trace: 'off' },
    projects: [chromium
        ? { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: chromium } } }
        : { name: 'webkit', use: { ...devices['Desktop Safari'] } }]
});
