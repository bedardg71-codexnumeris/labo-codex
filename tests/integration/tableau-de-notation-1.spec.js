import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// TABLEAU DE NOTATION, LOT 1 (9 nov. 2026) — plan : `plans de travail/PLAN-2026-11-09-tableau-de-notation.md`.
// Dans Évaluation › Liste, une seconde vue des mêmes évaluations : élèves en lignes, productions en colonnes, la note
// au bout. Au toucher ou au clavier, on saisit un niveau (standards) ou « acceptable / non acceptable » (spécifications),
// SANS grille ; une copie évaluée avec une grille s'y lit et s'ouvre au toucher. Ce banc suit le geste jusqu'aux données,
// puis jusqu'à la Liste et au formulaire Évaluer. Noms fictifs. Écrit et éprouvé sous Chromium (session cloud) ;
// le verdict WebKit se prend sur le Mac.

const T = 'atn';
const patternsAttendus = [/version\.json/i, /Cross origin requests/i, /Not allowed to load local resource/i, /favicon/i, /ERR_FILE_NOT_FOUND/i];

function amorcer({ T, famille, evaluations }) {
    // security-ok: fixtures littérales du banc, aucune source externe.
    const coursId = 'cours-tn';
    const niveaux = [
        { code: 'PS', nom: 'Préstructurel', min: 0, max: 39.99, valeurCalcul: 0, couleur: 'var(--gris-moyen)' },
        { code: 'I', nom: 'Incomplet', min: 40, max: 64.99, valeurCalcul: 40, couleur: 'var(--niveau-attention-critique)' },
        { code: 'D', nom: 'Développement', min: 65, max: 74.99, valeurCalcul: 65, couleur: 'var(--niveau-attention-modere)' },
        { code: 'M', nom: 'Maîtrise', min: 75, max: 84.99, valeurCalcul: 75, couleur: 'var(--niveau-attention-minimal)' },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: 'var(--niveau-attention-nul)' }
    ];
    const std = { id: 'std-tn', nom: 'Standards fictifs', type: 'standards',
        configuration: { type: 'standards', echelleId: 'E_TN', notesFinales: false,
            portfolio: { actif: true, utiliser: true, methodeSelection: 'recents', nombreARetenir: 3, minimumCompletion: 1 } } };
    const spe = { id: 'spe-tn', nom: 'Spécifications fictives', type: 'specifications',
        configuration: { type: 'specifications', seuilAcceptable: 75, typesTravaux: [{ id: 'ex', nom: 'Exercices' }, { id: 'pr', nom: 'Projets' }],
            forfaits: [{ id: 1, lettre: 'Excellence', note: 90, travaux: { ex: 4, pr: 2 } }, { id: 2, lettre: 'Bien', note: 80, travaux: { ex: 3, pr: 2 } },
                { id: 3, lettre: 'Réussite', note: 65, travaux: { ex: 2, pr: 1 } }, { id: 4, lettre: 'Sous la réussite', note: 50, travaux: {} }] } };
    const pratique = famille === 'SPE' ? spe : std;
    const eleves = [['Albatros', 'Ada'], ['Baobab', 'Bruno'], ['Cormoran', 'Chloé'], ['Dahlia', 'Dario']];
    const productions = famille === 'SPE'
        ? [['EX1', 'Exercice 1', 'ex', '2026-09-11'], ['EX2', 'Exercice 2', 'ex', '2026-09-25'], ['EX3', 'Exercice 3', 'ex', '2026-10-09'],
            ['EX4', 'Exercice 4', 'ex', '2026-11-06'], ['PR1', 'Projet 1', 'pr', '2026-10-23'], ['PR2', 'Projet 2', 'pr', '2026-12-04']]
        : [['P1', 'Production 1', 'artefact-portfolio', '2026-09-11'], ['P2', 'Production 2', 'artefact-portfolio', '2026-09-25'],
            ['P3', 'Production 3', 'artefact-portfolio', '2026-10-09'], ['P4', 'Production 4', 'artefact-portfolio', '2026-10-23'],
            ['P5', 'Production 5', 'artefact-portfolio', '2026-11-06']];
    window.db.setSync('backupNePlusRappeler', 'true');   // le rappel du codex ne couvre pas le banc
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC_TN', trimestreId: T, coursId, groupeNum: '01', pratiqueId: pratique.id, actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', eleves.map(([nom, prenom], i) => ({ da: '99900' + (10 + i), nom, prenom, groupe: '01', coursId, groupeCoursId: 'GC_TN' })));
    window.db.setSync(T + '_pratiquesConfigurables', [pratique]);
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E_TN', nom: 'IDME fictive', niveaux }]);
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G_X', nom: 'Grille fictive', type: 'holistique', criteres: [{ id: 'c', nom: 'Critère', ponderation: 100, type: 'holistique' }] }]);
    window.db.setSync(T + '_productions', productions.map(([id, titre, type, date], i) => ({ id, titre, type, numero: i + 1, dateEcheance: date, ponderation: 10, coursId, groupeCoursId: 'GC_TN' })));
    window.db.setSync(T + '_evaluationsSauvegardees', evaluations);
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_TN' });
    window.db.setSync('groupeCoursActif', { id: 'GC_TN', trimestreId: T });
    ['overlay-backup-reminder', 'transition-bandeau'].forEach((id) => { const n = document.getElementById(id); if (n) n.remove(); });
}

// Bruno a une copie évaluée AVEC une grille en Production 2 (standards).
const COPIE_GRILLE = { id: 'EG1', etudiantDA: '9990011', productionId: 'P2', grilleId: 'G_X', grilleNom: 'Grille fictive', echelleId: 'E_TN', noteFinale: 75, niveauFinal: 'M',
    verrouillee: true, statutRemise: 'evalue', statutIntegrite: 'recevable', criteres: [{ critereId: 'c', critereNom: 'Critère', niveauSelectionne: 'M', ponderation: 100 }],
    dateEvaluation: '2026-09-26T12:00:00.000Z', coursId: 'cours-tn', groupeCoursId: 'GC_TN' };

async function monter(page, famille, evaluations = []) {
    const erreurs = [];
    const garder = (m) => { if (!patternsAttendus.some((re) => re.test(m))) erreurs.push(m); };
    page.on('console', (m) => { if (m.type() === 'error') garder(`console.error: ${m.text()}`); });
    page.on('pageerror', (e) => garder(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(amorcer, { T, famille, evaluations });
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    await page.evaluate(() => window.TableauNotation.afficher());
    await expect(page.locator('#tableau-notation-hote .tn-tableau')).toBeVisible();
    return erreurs;
}

const kase = (page, rangee, colonne) => page.locator(`#tableau-notation-hote tbody tr:nth-child(${rangee}) td.tn-cellule:nth-of-type(${colonne}) .tn-case`);
const note = (page, rangee) => page.locator(`#tableau-notation-hote tbody tr:nth-child(${rangee}) .tn-note-valeur`);
const copies = (page) => page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []), T);
const sansGrilleDe = async (page, da, pid) => (await copies(page)).find((e) => e.etudiantDA === da && e.productionId === pid && e.sansGrille);

test.describe('Tableau de notation · standards', () => {
    test('toucher une case fait le tour des niveaux et écrit un résultat sans grille ; la note suit, comme à l\'export', async ({ page }) => {
        const erreurs = await monter(page, 'STD', [COPIE_GRILLE]);
        await expect(page.locator('#tableau-notation-hote .tn-case')).toHaveCount(4 * 5);
        await expect(page.locator('#carte-liste-evaluations > #conteneur-tableau-evaluations')).toBeHidden();
        for (let i = 0; i < 4; i++) await kase(page, 1, 1).click();   // '' → PS → I → D → M
        await expect(kase(page, 1, 1)).toHaveText('M');
        expect(await sansGrilleDe(page, '9990010', 'P1')).toMatchObject({ sansGrille: true, grilleId: null, criteres: [], niveauFinal: 'M', noteFinale: 75, echelleId: 'E_TN', verrouillee: true });
        await expect(note(page, 1)).toHaveText('75');
        const sim = await page.evaluate(() => Math.round(window.simulerIndices('9990010', 'std-tn').P));
        expect(sim).toBe(75);
        expect(erreurs).toEqual([]);
    });

    test('au clavier : la lettre du niveau, Retour arrière pour vider (la copie part), les flèches pour se déplacer', async ({ page }) => {
        const erreurs = await monter(page, 'STD');
        await kase(page, 3, 1).focus();
        await page.keyboard.press('e');
        await expect(kase(page, 3, 1)).toHaveText('E');
        await expect(kase(page, 3, 1)).toBeFocused();
        await page.keyboard.press('ArrowRight');
        await expect(kase(page, 3, 2)).toBeFocused();
        await page.keyboard.press('d');
        await expect(note(page, 3)).toHaveText('83');   // (100 + 65) / 2 = 82,5 → 83
        await page.keyboard.press('Backspace');
        expect(await sansGrilleDe(page, '9990012', 'P2')).toBeUndefined();
        await expect(kase(page, 3, 2)).toHaveText('+');
        await page.keyboard.press('ArrowDown');
        await expect(kase(page, 4, 2)).toBeFocused();
        expect(erreurs).toEqual([]);
    });

    test('plein, contour : quatre résultats, la pratique retient les trois plus récents', async ({ page }) => {
        const erreurs = await monter(page, 'STD');
        const saisir = async (col, lettre) => { await kase(page, 1, col).focus(); await page.keyboard.press(lettre); };
        await saisir(1, 'e'); await saisir(2, 'i'); await saisir(3, 'm'); await saisir(4, 'd');
        await expect(kase(page, 1, 1)).toHaveClass(/tn-case--contour/);
        for (const col of [2, 3, 4]) await expect(kase(page, 1, col)).toHaveClass(/tn-case--plein/);
        await expect(note(page, 1)).toHaveText('60');   // (40 + 75 + 65) / 3
        expect(erreurs).toEqual([]);
    });

    test('une copie évaluée avec une grille se lit au tableau, ne s\'y modifie pas, et s\'ouvre au toucher', async ({ page }) => {
        const erreurs = await monter(page, 'STD', [COPIE_GRILLE]);
        const c = kase(page, 2, 2);
        await expect(c).toHaveText('M');
        await expect(c).toHaveClass(/tn-case--grille/);
        await c.focus();
        await page.keyboard.press('e');   // le clavier ne la change pas
        expect((await copies(page)).find((e) => e.id === 'EG1')).toMatchObject({ niveauFinal: 'M', noteFinale: 75, grilleId: 'G_X' });
        await c.click();
        await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EG1', null, { timeout: 15000 });
        expect((await copies(page)).filter((e) => e.etudiantDA === '9990011' && e.productionId === 'P2')).toHaveLength(1);
        expect(erreurs).toEqual([]);
    });

    test('retour à la Liste : la copie saisie au tableau y est « Évalué », avec son niveau', async ({ page }) => {
        const erreurs = await monter(page, 'STD');
        await kase(page, 1, 1).focus();
        await page.keyboard.press('m');
        await page.locator('#tn-vue-liste').click();
        await expect(page.locator('#tableau-notation-hote')).toBeHidden();
        const ligne = page.locator('#corps-tableau-evaluations tr').filter({ hasText: 'Albatros' }).filter({ hasText: 'Production 1' });
        await expect(ligne).toHaveCount(1);
        await expect(ligne).toContainText('Évalué');
        await expect(ligne).toContainText('M');
        expect(erreurs).toEqual([]);
    });

    test('le formulaire Évaluer ne charge pas un résultat sans grille : il le dit, et le résultat reste intact', async ({ page }) => {
        const erreurs = await monter(page, 'STD', [COPIE_GRILLE]);
        await kase(page, 1, 1).focus();
        await page.keyboard.press('m');
        const avant = await sansGrilleDe(page, '9990010', 'P1');
        // Le geste : dans Évaluer, choisir l'élève dont la copie a été notée au tableau (Bruno d'abord, sans copie en P1).
        await page.evaluate(() => window.evaluerProduction('9990011', 'P1'));
        await page.waitForFunction(() => !window._evaluerSansCopieEnCours && !window._modifierEvaluationEnCours
            && document.getElementById('selectEtudiantEval').value === '9990011', null, { timeout: 15000 });
        await page.evaluate(() => {
            const s = document.getElementById('selectEtudiantEval');
            s.value = '9990010';
            s.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await expect(page.getByText('Cette copie a été notée au tableau de notation')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#selectGrille1')).toBeDisabled();
        // L'enregistrement automatique n'a rien d'armé : ni minuteur ni instantané en attente.
        await page.waitForFunction(() => !window._timerAutoSave && !window._pendingAutoSaveSnapshot, null, { timeout: 10000 });
        expect(await sansGrilleDe(page, '9990010', 'P1')).toEqual(avant);
        expect(erreurs).toEqual([]);
    });
});

test.describe('Tableau de notation · spécifications', () => {
    test('acceptable, non acceptable : les comptes par type et le forfait suivent', async ({ page }) => {
        const erreurs = await monter(page, 'SPE');
        const juger = async (rangee, col, lettre) => { await kase(page, rangee, col).focus(); await page.keyboard.press(lettre); };
        await juger(1, 1, 'a'); await juger(1, 2, 'a'); await juger(1, 5, 'a');
        await expect(note(page, 1)).toHaveText('65');
        await expect(page.locator('#tableau-notation-hote tbody tr:nth-child(1) .tn-note-detail')).toHaveText('Réussite');
        await expect(page.locator('#tableau-notation-hote tbody tr:nth-child(1) .tn-compte').first()).toHaveText('2 / 4');
        await juger(2, 1, 'n');
        expect(await sansGrilleDe(page, '9990011', 'EX1')).toMatchObject({ acceptable: false, noteFinale: null, sansGrille: true });
        await expect(kase(page, 2, 1)).toHaveText('✗');
        await expect(note(page, 2)).toHaveText('50');
        await expect(page.locator('#tableau-notation-hote .tn-bandeau .badge-type-pratique')).toHaveText('SPE');
        await page.locator('#tn-vue-liste').click();
        const ligne = page.locator('#corps-tableau-evaluations tr').filter({ hasText: 'Baobab' }).filter({ hasText: 'Exercice 1' });
        await expect(ligne).toContainText('Non acceptable');
        expect(erreurs).toEqual([]);
    });
});
