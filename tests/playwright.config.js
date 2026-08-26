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
    // #534 (26 août 2026) — un dépassement de délai isolé ne doit pas refuser un
    // push légitime. Mesuré ce jour-là : `page.goto` sur index.html coûte 400 à
    // 700 ms en régime normal, et deux specs ont dépassé 30 000 ms — un facteur
    // quarante, un blocage franc, non reproduit au run suivant (164 passés).
    // Elles ont bloqué le push de #533. Or un refus injustifié est ce qui apprend
    // à taper `--no-verify` : la garde se perd par ses faux refus, pas par ses
    // vrais.
    //
    // ⚠ Un seul essai de reprise, pas davantage. Playwright compte à part les
    // tests « flaky » (verts au second essai) : l'instabilité reste VISIBLE, elle
    // n'est pas absorbée. Monter ce chiffre reviendrait à acheter du vert.
    retries: 1,
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
