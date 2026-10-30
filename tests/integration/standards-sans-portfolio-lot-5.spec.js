import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');

// 30 oct. 2026 — DES STANDARDS SANS PORTFOLIO, LOT 5, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-5.md`, § 4). L'assistant et la fiche de la pratique :
// « productions » pour la chimie (aucun « Artefact »), « artefacts » pour la pratique de Grégoire ; les champs morts partis.
// L'unitaire (sentinelle-standards-sans-portfolio, section I) juge chaque libellé, le récit et les champs ; ici, l'écran. Noms fictifs.

const T = 'tstd1029d';
const DA = '1029701';
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');   // la forme de bareme-2
const LOT_5 = lire('plans de travail/TEXTES-2026-10-29-standards-lot-5.md');
const citations = (n) => LOT_5.split(/^## /m).find(s => s.startsWith(n + '.')).split('\n').filter(l => l.startsWith('> ') && !l.startsWith('> **')).map(l => l.slice(2).trim());

const CHIMIE = [['L1', 'Laboratoire 1', 'laboratoire', 15], ['L2', 'Laboratoire 2', 'laboratoire', 15], ['L3', 'Laboratoire 3', 'laboratoire', 15],
    ['X1', 'Examen 1', 'examen', 25], ['X2', 'Examen 2', 'examen', 30]];
const NOTES_CHIMIE = [[DA, 'L1', 70], [DA, 'L2', 80], [DA, 'L3', 90], [DA, 'X1', 60], [DA, 'X2', 85]];
const GREG = [['PF', 'Portfolio', 'portfolio', 60]].concat([1, 2, 3, 4, 5, 6].map(i => ['A' + i, 'Artefact ' + i, 'artefact-portfolio', 0]))
    .concat([['T1', 'Analyse finale', 'terminale', 40]]);

async function poser(page, { productions, evaluations, methodeSelection }) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.chargerPratiquePourModif === 'function'
        && typeof window.afficherProfilComplet === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, DA, productions, evaluations, methodeSelection }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-std1029d';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'CHM101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD1029D', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1029d', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC_STD1029D' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-1029d', nom: 'Standards fictifs', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            dansBibliotheque: true, configuration: { approcheEvaluation: 'par-artefacts', portfolio: { utiliser: true, nombreARetenir: 3, methodeSelection, minimumCompletion: 3 } } }]);
        window.db.setSync(T + '_productions', productions.map(([id, titre, type, ponderation], i) => (
            { id, titre, description: titre, type, numero: i + 1, groupeCoursId: 'GC_STD1029D', ponderation })));
        window.db.setSync(T + '_evaluationsSauvegardees', evaluations.map(([da, productionId, noteFinale], i) => ({ id: 'E' + i, etudiantDA: da, productionId,
            noteFinale, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, groupeCoursId: 'GC_STD1029D', coursId, statutRemise: 'evalue',
            statutIntegrite: 'recevable', criteres: [], dateEvaluation: '2026-10-20T12:00:00.000Z' })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'CHM101', groupe: '01', _groupeCoursId: 'GC_STD1029D' });
        window.db.setSync('groupeCoursActif', { id: 'GC_STD1029D', trimestreId: T });
    }, { T, DA, productions, evaluations, methodeSelection });
}

async function ouvrirPratique(page) {
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    // L'initialisation différée de la sous-section (navigation.js) remplit le menu PUIS referme la fiche : on attend sa
    // trace (l'option de la pratique au menu), puis on ouvre la pratique comme l'enseignant·e, par le menu (#1147).
    await expect(page.locator('#menuPratiques option[value="std-1029d"]')).toHaveCount(1);
    await page.locator('#menuPratiques').selectOption('std-1029d');
    await expect(page.locator('#conteneurEditionPratique')).toBeVisible();
}

async function ouvrirAssistant(page, etape) {
    await page.evaluate((etape) => {
        window.ouvrirWizardV2();
        window.wizardState.reponses = { typePratique: 'standards', approcheEvaluation: 'par-artefacts' };
        window.wizardState.etapeActuelle = etape;
        window.wizardState.historique = [];
        window.afficherEtapeWizardV2(etape);
    }, etape);
}

test('CHIM · aucun « Artefact » : l\'assistant et la fiche disent « productions »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await poser(page, { productions: CHIMIE, evaluations: NOTES_CHIMIE, methodeSelection: 'meilleurs' });

    await ouvrirAssistant(page, 'approche-evaluation');
    await expect(page.locator('.wizard-v2-card-title').filter({ hasText: citations(1)[0] })).toBeVisible();
    await expect(page.getByText(citations(1)[2])).toBeVisible();
    await ouvrirAssistant(page, 'config-portfolio');
    await expect(page.locator('#wizard-v2-description')).toHaveText(citations(2)[1]);
    await expect(page.locator('label').filter({ hasText: 'Nombre de productions retenues pour la note finale' })).toBeVisible();
    await expect(page.getByText('Utiliser un portfolio ?')).toHaveCount(0);
    await expect(page.getByText('Nombre d\'artefacts à soumettre')).toHaveCount(0);
    await page.evaluate(() => window.fermerWizardV2 && window.fermerWizardV2());

    await ouvrirPratique(page);
    await expect(page.locator('#mat-portfolio-selection')).toHaveValue('meilleurs');
    await expect(page.locator('#mat-portfolio-selection option[value="meilleurs"]')).toHaveText(citations(3)[0]);
    await expect(page.locator('label[for="mat-portfolio-nombre"]')).toHaveText('Productions pour la note finale');
    await expect(page.locator('label[for="mat-portfolio-minimum"]')).toHaveText(citations(6)[1]);
    await expect(page.locator('#mat-portfolio-total')).toHaveCount(0);
    expect(erreurs).toEqual([]);
});

test('GREG · six artefacts : la fiche et l\'assistant gardent leurs mots', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await poser(page, { productions: GREG, evaluations: [[DA, 'A1', 60], [DA, 'T1', 82]], methodeSelection: 'meilleurs' });

    await ouvrirPratique(page);
    await expect(page.locator('#mat-portfolio-selection')).toHaveValue('meilleurs');
    await expect(page.locator('#mat-portfolio-selection option[value="meilleurs"]')).toHaveText('N meilleurs artefacts');
    await expect(page.locator('label[for="mat-portfolio-nombre"]')).toHaveText('Artefacts pour la note finale');
    await expect(page.locator('label[for="mat-portfolio-minimum"]')).toHaveText(citations(6)[0]);

    await ouvrirAssistant(page, 'approche-evaluation');
    await expect(page.locator('.wizard-v2-card-title').filter({ hasText: 'Par artefacts (portfolio)' })).toBeVisible();
    expect(erreurs).toEqual([]);
});
