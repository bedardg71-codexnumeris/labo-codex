import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 28 oct. 2026 — DES STANDARDS SANS PORTFOLIO, LOT 1, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-lot-1.md`, § 3, et sa retouche, R2).
// Retouche R2 : une cause propre à l'étudiant·e n'est pas une erreur de configuration. CHIM-6 (laboratoires et examens,
// l'Examen 2 typé « Évaluation terminale », seule la terminale évaluée) et GREG-3 (six artefacts, aucun évalué) gardent la
// carte de la note, sans note, la phrase du mot neuf 2 à la place du nombre ; ni l'alerte ni « Réglages de la pratique ».
// Une erreur de configuration (la terminale sans pondération) garde l'alerte et le bouton.
// L'unitaire (sentinelle-standards-sans-portfolio) juge la chaîne ; ici, qu'elle s'affiche. Noms fictifs.

const T = 'tstd1028';
const DA = '1028601';
const TEMOIN = '1028602';
const TERMINALE_SEULE = 'Seule l\'évaluation terminale a une note. En standards, la note du cours s\'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule.';
const AUCUN_ARTEFACT = 'Aucun artefact du portfolio n\'est encore évalué.';

const CHIMIE = [['L1', 'Laboratoire 1', 'laboratoire', 15], ['L2', 'Laboratoire 2', 'laboratoire', 15], ['L3', 'Laboratoire 3', 'laboratoire', 15],
    ['X1', 'Examen 1', 'examen', 25], ['X2', 'Examen 2', 'terminale', 30]];
const GREG = [['PF', 'Portfolio', 'portfolio', 60]].concat([1, 2, 3, 4, 5, 6].map(i => ['A' + i, 'Artefact ' + i, 'artefact-portfolio', 0]))
    .concat([['T1', 'Analyse finale', 'terminale', 40]]);

async function ouvrirProfil(page, { productions, evaluations }) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.afficherProfilComplet === 'function'
        && typeof window.calculerDetailsNoteFinale === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, DA, TEMOIN, productions, evaluations }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-std1028';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'CHM101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD1028', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1028', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC_STD1028' },
            { da: TEMOIN, nom: 'Témoin', prenom: 'Autre', groupe: '01', coursId, groupeCoursId: 'GC_STD1028' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-1028', nom: 'Standards fictifs', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            dansBibliotheque: true, configuration: { approcheEvaluation: 'par-artefacts', portfolio: { utiliser: true, nombreARetenir: 3, methodeSelection: 'tous', minimumCompletion: 3 } } }]);
        window.db.setSync(T + '_productions', productions.map(([id, titre, type, ponderation], i) => Object.assign(
            { id, titre, description: titre, type, numero: i + 1, groupeCoursId: 'GC_STD1028' }, ponderation === null ? {} : { ponderation })));
        window.db.setSync(T + '_evaluationsSauvegardees', evaluations.map(([da, productionId, noteFinale], i) => ({ id: 'E' + i, etudiantDA: da, productionId,
            noteFinale, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100, groupeCoursId: 'GC_STD1028', coursId, statutRemise: 'evalue',
            statutIntegrite: 'recevable', criteres: [], dateEvaluation: '2026-10-20T12:00:00.000Z' })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'CHM101', groupe: '01', _groupeCoursId: 'GC_STD1028' });
        window.db.setSync('groupeCoursActif', { id: 'GC_STD1028', trimestreId: T });
        window.afficherSection('etudiants');
        window.afficherProfilComplet(DA);
    }, { T, DA, TEMOIN, productions, evaluations });
    return page.locator('#contenuProfilEtudiant .note-finale-section');
}

for (const [cas, productions, evaluations, phrase] of [
    ['CHIM-6 · seule la terminale évaluée', CHIMIE, [[DA, 'X2', 85], [TEMOIN, 'L1', 70], [TEMOIN, 'X2', 80]], TERMINALE_SEULE],
    ['GREG-3 · aucun artefact évalué', GREG, [[TEMOIN, 'A1', 70], [TEMOIN, 'T1', 80]], AUCUN_ARTEFACT]]) {
    test(cas + ' : la carte de la note, sans note, la phrase à la place du nombre ; ni alerte ni réglages', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        const carte = await ouvrirProfil(page, { productions, evaluations });
        await expect(carte.locator('.note-finale-resultat .note-finale-non-evalue')).toHaveText(phrase);
        await expect(carte.locator('.note-finale-titre')).toContainText('Note provisoire de session');
        await expect(carte.locator('.alerte-attention')).toHaveCount(0);
        await expect(carte.locator('.lien-reglages')).toHaveCount(0);
        await expect(carte.locator('.note-finale-total')).toHaveCount(0);
        expect(erreurs).toEqual([]);
    });
}

test('une erreur de configuration (la terminale sans pondération) garde l\'alerte et le bouton des réglages', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const sansPoids = CHIMIE.map(p => (p[0] === 'X2' ? [p[0], p[1], p[2], null] : p));
    const carte = await ouvrirProfil(page, { productions: sansPoids, evaluations: [[TEMOIN, 'L1', 70]] });
    await expect(carte.locator('.alerte-attention')).toContainText('Note finale non calculable.');
    await expect(carte.locator('.lien-reglages')).toHaveText('Réglages de la pratique');
    expect(erreurs).toEqual([]);
});
