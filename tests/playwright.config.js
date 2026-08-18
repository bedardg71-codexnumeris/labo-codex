import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    testDir: './integration',
    testMatch: '**/*.spec.js',
    fullyParallel: false,
    // Un seul worker : tous les specs ouvrent le MÊME index.html en file:// et
    // partagent donc le localStorage de l'origine file://. Plusieurs workers
    // écrivant les mêmes clés globales (grillesTemplates, echellesTemplates…)
    // se polluent → échecs non déterministes. Sans `workers`, Playwright lance
    // ≈ CPU/2 workers malgré fullyParallel:false (qui ne sérialise QUE dans un
    // worker). workers:1 garantit l'isolation séquentielle. Les suites sont rapides.
    workers: 1,
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
