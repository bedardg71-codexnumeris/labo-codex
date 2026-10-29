import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 29 oct. 2026 — DES STANDARDS SANS PORTFOLIO, LOT 2, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-2.md`, § 3). Le panneau « Engagement » du profil
// (cartes Complétion et Performance) parle des productions de la note : pour la chimie (laboratoires et examens pondérés,
// « Tous », aucun « Artefact »), les remises et les retenues sont les productions évaluées (avant : « 0 … remis », aucune
// retenue) ; pour la pratique de Grégoire (six artefacts, une terminale), rien ne change. L'unitaire
// (sentinelle-standards-sans-portfolio, section F) juge chaque lecteur ; ici, que le panneau l'affiche. Noms fictifs.

const T = 'tstd1029';
const DA = '1029601';
const TEMOIN = '1029602';

const CHIMIE = [['L1', 'Laboratoire 1', 'laboratoire', 15], ['L2', 'Laboratoire 2', 'laboratoire', 15], ['L3', 'Laboratoire 3', 'laboratoire', 15],
    ['X1', 'Examen 1', 'examen', 25], ['X2', 'Examen 2', 'examen', 30]];
const GREG = [['PF', 'Portfolio', 'portfolio', 60]].concat([1, 2, 3, 4, 5, 6].map(i => ['A' + i, 'Artefact ' + i, 'artefact-portfolio', 0]))
    .concat([['T1', 'Analyse finale', 'terminale', 40]]);

async function panneauEngagement(page, { productions, evaluations, methodeSelection }) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.afficherProfilComplet === 'function'
        && typeof window.changerSectionProfil === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, DA, TEMOIN, productions, evaluations, methodeSelection }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-std1029';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'CHM101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD1029', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1029', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC_STD1029' },
            { da: TEMOIN, nom: 'Témoin', prenom: 'Autre', groupe: '01', coursId, groupeCoursId: 'GC_STD1029' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-1029', nom: 'Standards fictifs', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            dansBibliotheque: true, configuration: { approcheEvaluation: 'par-artefacts', portfolio: { utiliser: true, nombreARetenir: 3, methodeSelection, minimumCompletion: 3 } } }]);
        window.db.setSync(T + '_productions', productions.map(([id, titre, type, ponderation], i) => (
            { id, titre, description: titre, type, numero: i + 1, groupeCoursId: 'GC_STD1029', ponderation })));
        window.db.setSync(T + '_evaluationsSauvegardees', evaluations.map(([da, productionId, noteFinale], i) => ({ id: 'E' + i, etudiantDA: da, productionId,
            noteFinale, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, groupeCoursId: 'GC_STD1029', coursId, statutRemise: 'evalue',
            statutIntegrite: 'recevable', criteres: [], dateEvaluation: '2026-10-20T12:00:00.000Z' })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'CHM101', groupe: '01', _groupeCoursId: 'GC_STD1029' });
        window.db.setSync('groupeCoursActif', { id: 'GC_STD1029', trimestreId: T });
        window.afficherSection('etudiants');
        window.afficherProfilComplet(DA);
        window.changerSectionProfil('mobilisation');
    }, { T, DA, TEMOIN, productions, evaluations, methodeSelection });
    return page.locator('#contenuProfilEtudiant');
}
const ids = (locator) => locator.evaluateAll(els => els.map(e => e.getAttribute('data-param2')).sort());

test('CHIM-1 · laboratoires et examens, « Tous » : la carte Complétion et la carte Performance nomment les productions de la note', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    // L3 et X2 pas encore remis par l'élève ; le témoin les a, pour que les productions soient « données ».
    const evaluations = [[DA, 'L1', 70], [DA, 'L2', 80], [DA, 'X1', 60], [TEMOIN, 'L3', 75], [TEMOIN, 'X2', 70]];
    const panneau = await panneauEngagement(page, { productions: CHIMIE, evaluations, methodeSelection: 'tous' });
    await expect(panneau.locator('.badge-completion-remis')).toHaveCount(3);
    expect(await ids(panneau.locator('.badge-completion-remis'))).toEqual(['L1', 'L2', 'X1']);
    await expect(panneau.locator('.badge-artefact')).toHaveCount(3);
    expect(await ids(panneau.locator('.badge-artefact'))).toEqual(['L1', 'L2', 'X1']);
    expect(erreurs).toEqual([]);
});

test('GREG · six artefacts et une terminale, « 3 meilleurs » : comme avant (A1 à A5 remis, A3, A4, A5 retenus)', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const evaluations = [[DA, 'A1', 60], [DA, 'A2', 70], [DA, 'A3', 88], [DA, 'A4', 92], [DA, 'A5', 75], [TEMOIN, 'A6', 80], [TEMOIN, 'T1', 82]];
    const panneau = await panneauEngagement(page, { productions: GREG, evaluations, methodeSelection: 'meilleurs' });
    await expect(panneau.locator('.badge-completion-remis')).toHaveCount(5);
    expect(await ids(panneau.locator('.badge-completion-remis'))).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);
    await expect(panneau.locator('.badge-artefact')).toHaveCount(3);
    expect(await ids(panneau.locator('.badge-artefact'))).toEqual(['A3', 'A4', 'A5']);
    expect(erreurs).toEqual([]);
});
