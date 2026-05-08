import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    testDir: './integration',
    testMatch: '**/*.spec.js',
    fullyParallel: false,
    reporter: 'list',
    use: {
        // Cible production : Safari WebKit. Les tests ouvrent index.html en file://
        // via page.goto(`file://${chemin}`) — pas de baseURL pour éviter les ambiguïtés.
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ]
});
