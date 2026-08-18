// #456 — Config CHROMIUM pour les sessions cloud (18 août 2026).
//
// La cause générale de #456 : WebKit n'existe pas dans les conteneurs, donc
// aucune session cloud n'a jamais lancé les specs — elles ont dérivé en
// silence pendant que Vitest restait vert. Les conteneurs ont un Chromium
// (`/opt/pw-browsers/chromium`) : cette config permet d'y lancer la suite,
//     npx playwright test -c playwright.chromium.config.js
// et c'est elle qui a permis de reproduire puis réparer 5 des 6 rouges.
//
// ⚠ Elle ne REMPLACE rien : la cible de production reste Safari WebKit
// (playwright.config.js, lancée sur le Mac), et la baseline de
// `scripts/verifier-playwright.mjs` ne se réécrit QUE depuis une passe
// WebKit réelle. Un vert Chromium est un indice, pas un verdict Safari.
//
// ⚠⚠ OUTIL DE REPRODUCTION CIBLÉE, PAS DE SUITE VERTE (mesuré 18 août) :
// lancée en entier, ~la moitié des specs rougissent en Chromium — beaucoup
// exigent zéro erreur console et leurs motifs d'« erreurs attendues »
// (`patternsAttendus`) sont rédigés pour les formulations de WEBKIT
// (« Cross origin requests are only supported… ») ; Chromium formule les
// mêmes refus autrement, et le filtre ne les reconnaît pas. Lancer un
// FICHIER à la fois sur la spec qu'on diagnostique.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './integration',
    testMatch: '**/*.spec.js',
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: { trace: 'off' },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: { executablePath: '/opt/pw-browsers/chromium' }
            }
        }
    ]
});
