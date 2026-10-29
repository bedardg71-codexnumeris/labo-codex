import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');

// 29 oct. 2026 — DES STANDARDS SANS PORTFOLIO, LOT 4, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-4.md`, § 3). Dans la pratique, sous la
// « Construction de la note », la liste « Productions qui comptent dans la note » (TEXTES, lus dans le fichier) : pour la
// chimie (laboratoires et examens, « Tous », aucun « Artefact »), elle paraît, toutes cochées ; décocher le Laboratoire 1
// change la note du profil (77 → 78,75, affichée « 78,8 % »). Pour la pratique de Grégoire (six artefacts), elle ne paraît pas. L'unitaire
// (sentinelle-standards-sans-portfolio, section H) juge le pool et chaque lecteur ; ici, l'écran. Noms fictifs.

const T = 'tstd1029c';
const DA = '1029701';
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');   // la forme de bareme-2
const [TITRE, AIDE] = lire('plans de travail/TEXTES-2026-10-29-standards-lot-4.md')
    .split('\n').filter(l => l.startsWith('> ') && !l.startsWith('> Proposés')).map(l => l.slice(2).trim());

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
        const coursId = 'cours-std1029c';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'CHM101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD1029C', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1029c', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC_STD1029C' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-1029c', nom: 'Standards fictifs', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            dansBibliotheque: true, configuration: { approcheEvaluation: 'par-artefacts', portfolio: { utiliser: true, nombreARetenir: 3, methodeSelection, minimumCompletion: 3 } } }]);
        window.db.setSync(T + '_productions', productions.map(([id, titre, type, ponderation], i) => (
            { id, titre, description: titre, type, numero: i + 1, groupeCoursId: 'GC_STD1029C', ponderation })));
        window.db.setSync(T + '_evaluationsSauvegardees', evaluations.map(([da, productionId, noteFinale], i) => ({ id: 'E' + i, etudiantDA: da, productionId,
            noteFinale, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, groupeCoursId: 'GC_STD1029C', coursId, statutRemise: 'evalue',
            statutIntegrite: 'recevable', criteres: [], dateEvaluation: '2026-10-20T12:00:00.000Z' })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'CHM101', groupe: '01', _groupeCoursId: 'GC_STD1029C' });
        window.db.setSync('groupeCoursActif', { id: 'GC_STD1029C', trimestreId: T });
    }, { T, DA, productions, evaluations, methodeSelection });
}

async function ouvrirPratique(page) {
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    // L'initialisation différée de la sous-section (navigation.js) remplit le menu PUIS referme la fiche : on attend sa
    // trace (l'option de la pratique au menu), puis on ouvre la pratique comme l'enseignant·e, par le menu (#1147).
    await expect(page.locator('#menuPratiques option[value="std-1029c"]')).toHaveCount(1);
    await page.locator('#menuPratiques').selectOption('std-1029c');
    await expect(page.locator('#conteneurEditionPratique')).toBeVisible();
}

async function noteDuProfil(page) {
    await page.evaluate((DA) => { window.afficherSection('etudiants'); window.afficherProfilComplet(DA); }, DA);
    return page.locator('#contenuProfilEtudiant .note-finale-section .note-finale-total');
}

test('CHIM-1 · sans « Artefact » : la liste paraît, toutes cochées ; décocher le Laboratoire 1 change la note du profil', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await poser(page, { productions: CHIMIE, evaluations: NOTES_CHIMIE, methodeSelection: 'tous' });
    await expect(await noteDuProfil(page)).toHaveText(/^\s*77(,0)?\s%\s*$/);

    await ouvrirPratique(page);
    const bloc = page.locator('#mat-productions-comptees');
    await expect(bloc).toBeVisible();
    await expect(bloc.locator('p').nth(0)).toHaveText(TITRE);
    await expect(bloc.locator('p').nth(1)).toHaveText(AIDE);
    const cases = bloc.locator('input[type="checkbox"]');
    await expect(cases).toHaveCount(5);
    for (let i = 0; i < 5; i++) await expect(cases.nth(i)).toBeChecked();

    await bloc.locator('input[data-prod-id="L1"]').click();
    await expect(bloc.locator('input[data-prod-id="L1"]')).not.toBeChecked();
    await page.waitForFunction((T) => {
        const p = (window.db.getSync(T + '_pratiquesConfigurables', []) || [])[0];
        return JSON.stringify(p && p.configuration.productionsExclues) === '["L1"]';
    }, T);

    await expect(await noteDuProfil(page)).toHaveText(/^\s*78,8\s%\s*$/);   // 78,75, affichée à une décimale
    expect(erreurs).toEqual([]);
});

test('GREG · six artefacts : la liste ne paraît pas', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await poser(page, { productions: GREG, evaluations: [[DA, 'A1', 60], [DA, 'T1', 82]], methodeSelection: 'meilleurs' });
    await ouvrirPratique(page);
    // La liste se décide après la lecture des productions : on attend que le formulaire soit rempli.
    await expect(page.locator('#mat-portfolio-selection')).toHaveValue('meilleurs');
    await expect(page.locator('#mat-config-pan-standards')).toBeVisible();
    await expect(page.locator('#mat-productions-comptees')).toBeHidden();
    await expect(page.locator('#mat-productions-comptees input[type="checkbox"]')).toHaveCount(0);
    expect(erreurs).toEqual([]);
});
