import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⚠ SIX ESSAIS QUI NE PEUVENT PAS JUGER SUR LINUX — 2 septembre 2026.
// Run GitHub 33671445284 (commit 5f6eb365) : 233 passés, 6 échoués en 32 min 35,
// chacun rouge deux fois sur deux (retries: 1) — des échecs francs, pas de
// l'instabilité. Cinq d'entre eux étaient DÉJÀ nommés rouges le 18 août dans
// l'en-tête de .github/workflows/tests.yml, pour la même cause : glisser-déposer
// et mise en page du planificateur sous WebKit LINUX, qui n'est pas le Safari de
// macOS. Les 239 passent sur la machine de Grégoire.
//
// ⮕ PAR TITRE, PAS PAR FICHIER. Les cinq fichiers portent 17 essais ; six sont
//   rouges, onze sont verts et mesurent quelque chose sur Linux. Une exclusion
//   par fichier les aurait sacrifiés — le cliquet l'a attrapé avant la CI.
// ⮕ L'exclusion est CONDITIONNÉE à une variable que SEULE la CI pose
//   (PW_EXCLURE_WEBKIT_LINUX=1, étape Playwright de tests.yml). Sans elle,
//   `npm run test:int` lance les 239, sans rien à taper : sur macOS, ces essais
//   sont les seuls à mesurer ce qu'ils mesurent, et ils y restent.
// ⛔ Cette liste ne grandit pas en silence : le cliquet
//   tests/unit/sentinelle-ci-paths-ignore.test.js (bloc 3) la verrouille
//   nommément, vérifie que chaque titre existe encore dans son fichier, et
//   exige que le job CI DISE le compte.
// ⏳ Ce qui reste ouvert, inscrit : ces gestes de pointeur se comportent-ils
//   vraiment autrement sous WebKit Linux, ou les specs présument-elles une
//   géométrie de macOS ? Personne ne l'a mesuré. Ces six gestes ne sont plus
//   jugés automatiquement nulle part ; leur filet est la passe locale sur macOS.
export const EXCLUS_WEBKIT_LINUX = [
    { fichier: 'bandeau-non-modal-508.spec.js',   titre: '#508 — les clics traversent le bandeau, sauf sur son bouton' },
    { fichier: 'planif-alignement.spec.js',       titre: '⚠ un bloc glissé près d’un autre COLLE, et un guide dit pourquoi' },
    { fichier: 'planif-drag-pointer-148.spec.js', titre: 'CAS D — un drag souris déplace un nœud libre' },
    { fichier: 'planif-drag-pointer-148.spec.js', titre: 'CAS B — tirer une évaluation HORS de sa leçon la détache (le geste du terrain)' },
    { fichier: 'planif-toolbar.spec.js',          titre: 'planificateur — il CADRE la carte, il ne la filtre plus ; palettes commandées par la barre' },
    { fichier: 'portes-relais-cadre.spec.js',     titre: '#371 · Semaines spéciales : empilées, la borne de fin de planification est atteignable' }
];

const echapper = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Un motif par essai : le fichier ET le titre exact — jamais un titre seul. */
export const MOTIFS_EXCLUS_WEBKIT_LINUX = EXCLUS_WEBKIT_LINUX.map(
    (e) => new RegExp(echapper(e.fichier) + '.*' + echapper(e.titre))
);

export default defineConfig({
    testDir: './integration',
    testMatch: '**/*.spec.js',
    grepInvert: process.env.PW_EXCLURE_WEBKIT_LINUX === '1' ? MOTIFS_EXCLUS_WEBKIT_LINUX : undefined,
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
