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
    window.db.setSync(T + '_groupeEtudiants', eleves.map(([nom, prenom], i) => ({ da: '99900' + (10 + i), nom, prenom, groupe: '01', coursId, groupeCoursId: 'GC_TN' })));   // security-ok: fixture fictive du banc
    window.db.setSync(T + '_pratiquesConfigurables', [pratique]);   // security-ok: fixture fictive du banc
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E_TN', nom: 'IDME fictive', niveaux }]);   // security-ok: fixture fictive du banc
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G_X', nom: 'Grille fictive', type: 'holistique', criteres: [{ id: 'c', nom: 'Critère', ponderation: 100, type: 'holistique' }] }]);   // security-ok: fixture fictive du banc
    window.db.setSync(T + '_productions', productions.map(([id, titre, type, date], i) => ({ id, titre, type, numero: i + 1, dateEcheance: date, ponderation: 10, coursId, groupeCoursId: 'GC_TN' })));   // security-ok: fixture fictive du banc
    window.db.setSync(T + '_evaluationsSauvegardees', evaluations);
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_TN' });   // security-ok: fixture fictive du banc
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
        await expect(page.getByText('Cette production a été évaluée au tableau de notation (Évaluation › Liste). C\'est là que tu changes son résultat.')).toBeVisible({ timeout: 15000 });
        // « Verrouiller » n'a rien à verrouiller ici : masqué (Cowork, 9 nov.) ; il revient pour une évaluation à grille.
        await expect(page.locator('#btnVerrouillerEvaluation')).toBeHidden();
        await expect(page.locator('#selectGrille1')).toBeDisabled();
        // L'enregistrement automatique n'a rien d'armé : ni minuteur ni instantané en attente.
        await page.waitForFunction(() => !window._timerAutoSave && !window._pendingAutoSaveSnapshot, null, { timeout: 10000 });
        expect(await sansGrilleDe(page, '9990010', 'P1')).toEqual(avant);
        await page.evaluate(() => window.modifierEvaluationParId('EG1'));
        await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EG1', null, { timeout: 15000 });
        await expect(page.locator('#btnVerrouillerEvaluation')).toBeVisible();
        expect(erreurs).toEqual([]);
    });
});

test.describe('Tableau de notation · la reprise (relecture neuve)', () => {
    test('un résultat sans grille n\'a pas de reprise, et « Modifier l\'évaluation » ne le déverrouille pas', async ({ page }) => {
        const erreurs = await monter(page, 'STD');
        await kase(page, 1, 1).focus();
        await page.keyboard.press('m');
        const copie = await sansGrilleDe(page, '9990010', 'P1');
        const reprise = await page.evaluate((id) => window.appliquerJetonReprise(id), copie.id);
        expect(reprise).toBeNull();
        expect((await copies(page)).filter((e) => e.etudiantDA === '9990010' && e.productionId === 'P1')).toHaveLength(1);
        await page.evaluate((id) => window.modifierEvaluationRemplacee(id), copie.id);
        expect(await sansGrilleDe(page, '9990010', 'P1')).toMatchObject({ verrouillee: true });
        expect(await page.evaluate(() => window._snapshotAvantModifRemplacee)).toBeUndefined();
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

// CONSIGNE DU LOT ET PRÉCISIONS DE COWORK (9 nov. 2026, 15 h), reçues après la première passe : ce que le lot n'éprouvait pas.
test.describe('Tableau de notation · la consigne', () => {
    /** Compte et empreinte des évaluations FAITES AVEC UNE GRILLE : le tableau n'y écrit jamais. */
    const empreinteAGrille = (page) => page.evaluate((T) => {
        const aGrille = window.db.getSync(T + '_evaluationsSauvegardees', []).filter((e) => e.grilleId);
        return { compte: aGrille.length, empreinte: JSON.stringify(aGrille) };
    }, T);
    // Chloé : une originale (I) remplacée par sa reprise réévaluée (E), en Production 2.
    const ORIGINALE = Object.assign({}, COPIE_GRILLE, { id: 'EG-O', etudiantDA: '9990012', noteFinale: 40, niveauFinal: 'I', remplaceeParId: 'EG-R', archivee: true,
        dateEvaluation: '2026-10-25T12:00:00.000Z' });   // plus récente que sa reprise : seul « remplacée » décide, pas la date (break-test)
    const REPRISE = Object.assign({}, COPIE_GRILLE, { id: 'EG-R', etudiantDA: '9990012', noteFinale: 100, niveauFinal: 'E', repriseDeId: 'EG-O', jetonRepriseApplique: true,
        dateEvaluation: '2026-10-20T12:00:00.000Z' });

    test('aucun écrit dans les évaluations à grille (compte et empreinte), recharger retrouve tout, la reprise remplace l\'originale', async ({ page }) => {
        const erreurs = await monter(page, 'STD', [COPIE_GRILLE, ORIGINALE, REPRISE]);
        const avant = await empreinteAGrille(page);
        expect(avant.compte).toBe(3);

        // La case de Chloé montre la reprise (E), pas l'originale (I) ; la toucher ouvrirait la reprise.
        await expect(kase(page, 3, 2)).toHaveText('E');
        await expect(kase(page, 3, 2)).toHaveAttribute('data-evaluation', 'EG-R');
        await expect(note(page, 3)).toHaveText('100');

        // Remplir trois cases d'Ada, voir la note changer.
        await expect(note(page, 1)).toHaveText('–');
        const saisir = async (col, lettre) => { await kase(page, 1, col).focus(); await page.keyboard.press(lettre); };
        await saisir(1, 'm');
        await expect(note(page, 1)).toHaveText('75');
        await saisir(3, 'e'); await saisir(4, 'd');
        await expect(note(page, 1)).toHaveText('80');   // (75 + 100 + 65) / 3
        // Une case à grille, touchée au clavier : rien ne s'écrit (le refus de l'écriture pure est au banc A5).
        await kase(page, 2, 2).focus();
        await page.keyboard.press('e');
        await page.keyboard.press('Backspace');
        expect(await empreinteAGrille(page)).toEqual(avant);

        // Recharger : tout est retrouvé.
        await page.evaluate(() => window.db.flush());
        await page.reload();
        await attendreApplication(page);
        await page.evaluate((T) => { window.trimestreActif = T; }, T);
        await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); window.TableauNotation.afficher(); });
        await expect(kase(page, 1, 1)).toHaveText('M');
        await expect(kase(page, 1, 3)).toHaveText('E');
        await expect(kase(page, 1, 4)).toHaveText('D');
        await expect(note(page, 1)).toHaveText('80');
        await expect(kase(page, 3, 2)).toHaveText('E');
        expect(await empreinteAGrille(page)).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    test('« Exporter pour Léa » et « Dossier PDF » ne prennent pas un résultat saisi au tableau, même verrouillé', async ({ page }) => {
        const erreurs = await monter(page, 'STD', [COPIE_GRILLE]);
        await kase(page, 1, 2).focus();
        await page.keyboard.press('m');
        expect(await sansGrilleDe(page, '9990010', 'P2')).toMatchObject({ verrouillee: true, noteFinale: 75 });
        // Léa : la copie à grille de Bruno part ; le résultat d'Ada, verrouillé lui aussi, n'est ni retenu ni « laissé de côté ».
        const lea = await page.evaluate(() => {
            const s = window.travauxArchivage.selectionnerEvaluationsLea('P2', null, false);
            return { retenues: s.evaluations.map((e) => e.id), nonVerrouillees: s.nonVerrouillees.length };
        });
        expect(lea).toEqual({ retenues: ['EG1'], nonVerrouillees: 0 });
        // La Liste : « Dossier PDF » sur la copie à grille, pas sur le résultat sans grille.
        await page.locator('#tn-vue-liste').click();
        const options = (nom) => page.locator('#corps-tableau-evaluations tr').filter({ hasText: nom }).filter({ hasText: 'Production 2' }).locator('select option').allTextContents();
        await expect(page.locator('#corps-tableau-evaluations tr').filter({ hasText: 'Albatros' }).filter({ hasText: 'Production 2' })).toContainText('Évalué');
        expect(await options('Baobab')).toContain('Dossier PDF');
        expect(await options('Albatros')).not.toContain('Dossier PDF');
        // Et « Dossier PDF », appelé quand même pour Ada, ne trouve rien à imprimer : il le dit, sans produire de PDF.
        expect(erreurs).toEqual([]);
        await page.evaluate(() => window.travauxExportPDF.exporterDossierComplet('9990010', 'P2'));
        expect(erreurs).toEqual(['dialogue: Aucune copie ni évaluation enregistrée pour cet·te étudiant·e et cette production.']);
        // Relecture neuve : si une copie importée accompagne le résultat, elle reste à remettre (Léa la prend, la Liste offre le PDF).
        await page.evaluate((T) => {
            window.db.setSync(T + '_fichiersTravaux', [{ id: 'FT-ADA', etudiantDA: '9990010', productionId: 'P2', coursId: 'cours-tn', groupeCoursId: 'GC_TN',
                nomFichier: 'FICTIF_Ada_Production2.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1, stockage: 'indexeddb', thumbnailDataUrl: '',
                dateImport: '2026-11-01T12:00:00.000Z', dateModification: '2026-11-01T12:00:00.000Z', source: 'import-local', importePar: 'single', statut: 'present' }]);   // security-ok: fixture fictive du banc
        }, T);
        const avecCopie = await page.evaluate(() => window.travauxArchivage.selectionnerEvaluationsLea('P2', null, false).evaluations.map((e) => e.etudiantDA).sort());
        expect(avecCopie).toEqual(['9990010', '9990011']);
        await page.evaluate(() => window.initialiserListeEvaluations());
        await expect.poll(() => options('Albatros')).toContain('Dossier PDF');
    });

    test('l\'échelle de la production passe avant celle de la pratique ; l\'en-tête renvoie aux réglages et reprend le bouton d\'export', async ({ page }) => {
        const erreurs = await monter(page, 'STD');
        // Production 3 reçoit sa propre échelle (deux niveaux, d'autres valeurs).
        await page.evaluate((T) => {
            const echelles = window.db.getSync(T + '_echellesTemplates', []);
            echelles.push({ id: 'E_P3', nom: 'Échelle de la production', niveaux: [
                { code: 'R', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#a02030' },
                { code: 'A', nom: 'Atteint', min: 60, max: 100, valeurCalcul: 90, couleur: '#34c759' }] });
            window.db.setSync(T + '_echellesTemplates', echelles);   // security-ok: fixture fictive du banc
            const productions = window.db.getSync(T + '_productions', []);
            productions.find((p) => p.id === 'P3').echelleId = 'E_P3';
            window.db.setSync(T + '_productions', productions);   // security-ok: fixture fictive du banc
            window.TableauNotation.afficher();
        }, T);
        await expect(page.locator('#tableau-notation-hote thead th').nth(3)).toContainText('Échelle de la production');
        await kase(page, 1, 3).click();
        await expect(kase(page, 1, 3)).toHaveText('R');
        await kase(page, 1, 3).click();
        await expect(kase(page, 1, 3)).toHaveText('A');
        expect(await sansGrilleDe(page, '9990010', 'P3')).toMatchObject({ niveauFinal: 'A', noteFinale: 90, echelleId: 'E_P3' });
        // Un niveau saisi AVANT que la production reçoive son échelle (M, sous celle de la pratique) : un toucher repart du
        // premier niveau de la colonne, il n'efface pas le résultat (relecture neuve) ; la case le nomme d'ici là.
        await page.evaluate((T) => {
            const evals = window.db.getSync(T + '_evaluationsSauvegardees', []);
            evals.push({ id: 'SG-AVANT', etudiantDA: '9990011', productionId: 'P3', sansGrille: true, grilleId: null, criteres: [], niveauFinal: 'M', noteFinale: 75,
                echelleId: 'E_TN', verrouillee: true, statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-01T12:00:00.000Z' });
            window.db.setSync(T + '_evaluationsSauvegardees', evals);   // security-ok: fixture fictive du banc
            window.TableauNotation.afficher();
        }, T);
        await expect(kase(page, 2, 3)).toHaveText('M');
        await expect(kase(page, 2, 3)).toHaveAttribute('aria-label', /Maîtrise/);
        await kase(page, 2, 3).click();
        await expect(kase(page, 2, 3)).toHaveText('R');
        expect(await sansGrilleDe(page, '9990011', 'P3')).toMatchObject({ id: 'SG-AVANT', niveauFinal: 'R', noteFinale: 50, echelleId: 'E_P3' });
        // Une autre colonne garde l'échelle de la pratique.
        await kase(page, 1, 1).click();
        await expect(kase(page, 1, 1)).toHaveText('PS');
        expect(await sansGrilleDe(page, '9990010', 'P1')).toMatchObject({ echelleId: 'E_TN', noteFinale: 0 });

        await expect(page.locator('#tableau-notation-hote .tn-bandeau button[data-action="exporterSyntheseResultatsCSV"]')).toHaveText('Exporter la synthèse (CSV)');
        const lien = page.locator('#tableau-notation-hote .tn-reglages');
        await expect(lien).toHaveText('Réglages de la pratique');
        await expect(lien).toHaveAttribute('data-action', 'ouvrirReglagesPratique');
        await expect(lien).toHaveAttribute('data-param', 'std-tn');
        expect(erreurs).toEqual([]);
    });

    test('une copie non recevable dit « -- » et son libellé, jamais son niveau ; elle s\'ouvre, elle ne se modifie pas', async ({ page }) => {
        const plagiat = Object.assign({}, COPIE_GRILLE, { id: 'EG-NR', statutIntegrite: 'plagiat' });
        const erreurs = await monter(page, 'STD', [plagiat]);
        const c = kase(page, 2, 2);
        await expect(c).toHaveText('--');
        await expect(c).toHaveAttribute('aria-label', /Non recevable \(Plagiat\)/);
        await expect(c).not.toHaveAttribute('aria-label', /Maîtrise/);
        await expect(c).toHaveAttribute('data-evaluation', 'EG-NR');
        await expect(c).toHaveClass(/tn-case--contour/);
        await expect(note(page, 2)).toHaveText('–');   // en standards, elle sort des productions retenues
        expect(erreurs).toEqual([]);
    });

    // Décision de Grégoire (9 nov., 15 h 38) : « Annuler » et ⌘Z défont le dernier geste fait au tableau, quel qu'il soit.
    test('« Annuler » et ⌘Z : le toucher de trop ne fait pas perdre un résultat ; une évaluation à grille n\'est jamais touchée', async ({ page }) => {
        const erreurs = await monter(page, 'STD', [COPIE_GRILLE]);
        const empreinte = await empreinteAGrille(page);
        const annuler = page.locator('#tableau-notation-hote #tn-annuler');
        await expect(annuler).toHaveText('Annuler');
        await expect(annuler).toBeDisabled();
        const raccourci = process.platform === 'darwin' ? 'Meta+z' : 'Control+z';

        // E (le dernier niveau), puis le toucher de trop : la case se vide, la note part.
        await kase(page, 1, 1).focus();
        await page.keyboard.press('e');
        const saisi = await sansGrilleDe(page, '9990010', 'P1');
        await expect(note(page, 1)).toHaveText('100');
        await kase(page, 1, 1).click();
        await expect(kase(page, 1, 1)).toHaveText('+');
        expect(await sansGrilleDe(page, '9990010', 'P1')).toBeUndefined();
        // Le bouton : le résultat revient, le même, et la note avec lui.
        await expect(annuler).toBeEnabled();
        await annuler.click();
        await expect(kase(page, 1, 1)).toHaveText('E');
        await expect(note(page, 1)).toHaveText('100');
        expect(await sansGrilleDe(page, '9990010', 'P1')).toEqual(saisi);
        await expect(page.locator('#tableau-notation-hote #tn-annuler')).toBeDisabled();   // un seul niveau

        // Un niveau changé (E → M au clavier), défait au clavier.
        await kase(page, 1, 1).focus();
        await page.keyboard.press('m');
        await expect(kase(page, 1, 1)).toHaveText('M');
        await page.keyboard.press(raccourci);
        await expect(kase(page, 1, 1)).toHaveText('E');
        expect(await sansGrilleDe(page, '9990010', 'P1')).toEqual(saisi);
        // Une case remplie par erreur, défaite : elle redevient vide et la copie part.
        await kase(page, 1, 3).click();
        await expect(kase(page, 1, 3)).toHaveText('PS');
        await page.keyboard.press(raccourci);
        await expect(kase(page, 1, 3)).toHaveText('+');
        expect(await sansGrilleDe(page, '9990010', 'P3')).toBeUndefined();
        // Sans geste à défaire, le raccourci ne fait rien ; les évaluations à grille n'ont jamais bougé.
        await page.keyboard.press(raccourci);
        expect(await sansGrilleDe(page, '9990010', 'P1')).toEqual(saisi);
        expect(await empreinteAGrille(page)).toEqual(empreinte);
        expect(erreurs).toEqual([]);
    });

    test('une échelle modifiée après la saisie : un signe sur la case, la note écrite ne bouge pas', async ({ page }) => {
        const erreurs = await monter(page, 'STD');
        await kase(page, 1, 1).focus();
        await page.keyboard.press('m');
        await expect(kase(page, 1, 1)).not.toHaveClass(/tn-case--valeur-changee/);
        const ligneDuSigne = page.locator('#tableau-notation-hote .tn-legende-signe');
        await expect(ligneDuSigne).toHaveCount(0);   // aucune case marquée : la légende ne parle pas du signe
        await page.evaluate((T) => {
            const echelles = window.db.getSync(T + '_echellesTemplates', []);
            echelles[0].niveaux.find((n) => n.code === 'M').valeurCalcul = 80;
            window.db.setSync(T + '_echellesTemplates', echelles);   // security-ok: fixture fictive du banc
            window.TableauNotation.afficher();
        }, T);
        const c = kase(page, 1, 1);
        await expect(c).toHaveClass(/tn-case--valeur-changee/);
        await expect(c).toHaveAttribute('title', 'L’échelle a changé depuis la saisie : ce résultat compte encore pour 75. Ressaisis le niveau pour prendre la valeur d’aujourd’hui.');
        await expect(c).toHaveAttribute('aria-label', /compte encore pour 75\. Ressaisis le niveau pour prendre la valeur d’aujourd’hui\.$/);
        // Le raccourci du poste (Cowork, 9 nov., 16 h 21) : ⌘Z sur Mac et iPad, Ctrl+Z ailleurs. Le banc tourne sous Linux
        // (la CI) et sur le Mac (le verdict local, groupe 3) : il lit le poste du navigateur et exige le raccourci qui va.
        const surMac = await page.evaluate(() => /Mac|iPhone|iPad|iPod/i.test(navigator.platform + ' ' + navigator.userAgent));
        const [attendu, autre] = surMac ? ['⌘Z', 'Ctrl+Z'] : ['Ctrl+Z', '⌘'];
        await expect(page.locator('#tableau-notation-hote .tn-legende-aide')).toContainText(attendu + ' annule le dernier geste.');
        await expect(page.locator('#tableau-notation-hote .tn-legende-aide')).not.toContainText(autre);
        await expect(note(page, 1)).toHaveText('75');
        // Une case porte le signe : la légende le nomme, visible sans survol (l'iPad).
        await expect(ligneDuSigne).toBeVisible();
        await expect(ligneDuSigne).toHaveText('≠ : l’échelle a changé depuis la saisie. Ressaisis le niveau pour prendre la valeur d’aujourd’hui.');
        expect(await sansGrilleDe(page, '9990010', 'P1')).toMatchObject({ niveauFinal: 'M', noteFinale: 75 });
        // Ressaisir le niveau (E, puis M) écrit la valeur d'aujourd'hui : le signe part.
        await c.focus();
        await page.keyboard.press('e');
        await page.keyboard.press('m');
        await expect(kase(page, 1, 1)).not.toHaveClass(/tn-case--valeur-changee/);
        await expect(ligneDuSigne).toHaveCount(0);   // plus aucune case marquée : la ligne part
        expect(await sansGrilleDe(page, '9990010', 'P1')).toMatchObject({ noteFinale: 80 });
        expect(erreurs).toEqual([]);
    });

    test('sans note, la case dit la cause en clair (pas seulement en bulle) : aucun forfait atteint, aucun palier d\'échec', async ({ page }) => {
        const erreurs = await monter(page, 'SPE');
        await page.evaluate((T) => {
            const pratiques = window.db.getSync(T + '_pratiquesConfigurables', []);
            pratiques[0].configuration.forfaits = pratiques[0].configuration.forfaits.filter((f) => Object.keys(f.travaux).length > 0);
            window.db.setSync(T + '_pratiquesConfigurables', pratiques);   // security-ok: fixture fictive du banc
            window.TableauNotation.afficher();
        }, T);
        await kase(page, 1, 1).focus();
        await page.keyboard.press('a');
        await expect(note(page, 1)).toHaveText('–');
        await expect(page.locator('#tableau-notation-hote tbody tr:nth-child(1) .tn-note-detail')).toHaveText('Ta pratique ne dit pas quelle note donner quand aucun forfait n\'est atteint.');
        expect(erreurs).toEqual([]);
    });
});

// LE DÉBORDEMENT À 820 PX (décision de Grégoire, 9 nov. 2026, 16 h 18, après lecture des captures par Cowork) : le tableau
// coupait des colonnes sans que rien ne le montre. Le signe : un bord estompé contre la colonne fixée, du côté où il reste
// des colonnes ; il disparaît au bout du défilement. Un titre de colonne ne se tronque jamais au milieu.
test.describe('Tableau de notation · le débordement à 820 px', () => {
    /** Ce que l'écran dit du débordement : les classes du cadre, l'opacité des deux bords, la bande visible entre les colonnes fixées. */
    const etat = (page) => page.evaluate(() => {
        const cadre = document.querySelector('#tableau-notation-hote .tn-cadre');
        const zone = cadre.querySelector('.tn-defilement');
        const z = zone.getBoundingClientRect();
        const l = (sel) => zone.querySelector(sel).getBoundingClientRect();
        return {
            bordGauche: Number(getComputedStyle(cadre, '::before').opacity), bordDroit: Number(getComputedStyle(cadre, '::after').opacity),
            largeurBord: parseFloat(getComputedStyle(cadre, '::after').width), fondBord: getComputedStyle(cadre, '::after').backgroundImage,
            defilement: Math.round(zone.scrollLeft), reste: Math.round(zone.scrollWidth - zone.clientWidth - zone.scrollLeft),
            debut: z.left + l('.tn-col-eleve').width, fin: z.right - l('.tn-col-note').width,
            nomsFixes: Math.round(l('.tn-col-eleve').left - z.left), noteFixee: Math.round(z.right - l('.tn-col-note').right),
            debordeX: getComputedStyle(zone).overflowX
        };
    });
    const dansLaBande = async (page, locator) => {
        const e = await etat(page);
        const b = await locator.boundingBox();
        return b.x >= e.debut - 1 && b.x + b.width <= e.fin + 1;
    };
    const allerAuBout = (page) => page.evaluate(() => { const z = document.querySelector('#tableau-notation-hote .tn-defilement'); z.scrollLeft = z.scrollWidth; });

    test('standards : un bord estompé du côté où il reste des colonnes, qui disparaît au bout ; les flèches amènent la case dans la vue', async ({ page }) => {
        await page.setViewportSize({ width: 820, height: 1180 });
        const erreurs = await monter(page, 'STD');
        // Au début : il reste des colonnes à droite, aucune à gauche. Les noms et la note sont fixés (mesuré, pas refait).
        await expect.poll(async () => (await etat(page)).bordDroit).toBe(1);   // le bord paraît en fondu (120 ms)
        let e = await etat(page);
        expect(e.reste).toBeGreaterThan(1);
        // `nomsFixes` et `noteFixee` : l'écart au bord de la zone, soit son filet d'un pixel.
        expect(e).toMatchObject({ bordDroit: 1, bordGauche: 0, defilement: 0, nomsFixes: 1, noteFixee: 1, debordeX: 'auto' });
        expect(e.largeurBord).toBeGreaterThanOrEqual(24);
        expect(e.fondBord).toContain('linear-gradient');
        expect(await dansLaBande(page, kase(page, 1, 5))).toBe(false);   // Production 5 est hors de la vue
        // Au clavier : quatre fois la flèche droite ; la case active est entière entre les deux colonnes fixées.
        await kase(page, 1, 1).focus();
        for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
        await expect(kase(page, 1, 5)).toBeFocused();
        expect(await dansLaBande(page, kase(page, 1, 5))).toBe(true);
        // Une saisie dans cette colonne ne ramène pas le tableau à gauche.
        await page.keyboard.press('m');
        await expect(kase(page, 1, 5)).toHaveText('M');
        expect(await dansLaBande(page, kase(page, 1, 5))).toBe(true);
        // Au bout du défilement : plus rien à droite, le bord droit s'efface ; il en reste à gauche. Les colonnes fixées n'ont pas bougé.
        await allerAuBout(page);
        await expect.poll(async () => (await etat(page)).bordDroit).toBe(0);
        await expect.poll(async () => (await etat(page)).bordGauche).toBe(1);
        expect(await etat(page)).toMatchObject({ reste: 0, nomsFixes: 1, noteFixee: 1 });
        // Retour au clavier : la première colonne revient entière, et le bord gauche s'efface.
        await kase(page, 1, 5).focus();
        for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft');
        expect(await dansLaBande(page, kase(page, 1, 1))).toBe(true);
        await expect.poll(async () => (await etat(page)).bordGauche).toBe(0);
        // Le doigt : la zone défile d'elle-même, et une case ne retient pas le glissement (`manipulation` laisse passer le défilement).
        expect(await kase(page, 1, 1).evaluate((n) => getComputedStyle(n).touchAction)).toBe('manipulation');
        expect(erreurs).toEqual([]);
    });

    test('à 1180 px, rien ne déborde : aucun bord estompé', async ({ page }) => {
        await page.setViewportSize({ width: 1180, height: 820 });
        await monter(page, 'STD');
        expect(await etat(page)).toMatchObject({ reste: 0, bordDroit: 0, bordGauche: 0 });
    });

    test('spécifications : les compteurs par type sont dans la zone qui défile, pas masqués', async ({ page }) => {
        await page.setViewportSize({ width: 820, height: 1180 });
        const erreurs = await monter(page, 'SPE');
        const compteur = page.locator('#tableau-notation-hote tbody tr:nth-child(1) .tn-compte');
        await expect(compteur).toHaveCount(2);
        await expect.poll(async () => (await etat(page)).bordDroit).toBe(1);
        expect(await dansLaBande(page, compteur.last())).toBe(false);   // au début, hors de la vue
        expect(await compteur.last().evaluate((n) => getComputedStyle(n).display)).toBe('table-cell');
        await allerAuBout(page);
        await expect.poll(() => dansLaBande(page, compteur.last())).toBe(true);
        await expect.poll(() => dansLaBande(page, compteur.first())).toBe(true);
        await expect.poll(async () => (await etat(page)).bordDroit).toBe(0);
        expect(erreurs).toEqual([]);
    });

    test('un titre de colonne ne se tronque jamais : entier dans sa colonne, sur deux lignes s\'il est long', async ({ page }) => {
        await page.setViewportSize({ width: 820, height: 1180 });
        const erreurs = await monter(page, 'STD');
        await page.evaluate((T) => {
            const productions = window.db.getSync(T + '_productions', []);
            productions.find((p) => p.id === 'P2').titre = 'Analyse comparée de deux extraits';
            window.db.setSync(T + '_productions', productions);   // security-ok: fixture fictive du banc
            window.TableauNotation.afficher();
        }, T);
        const titres = await page.evaluate(() => Array.from(document.querySelectorAll('#tableau-notation-hote th.tn-col-production')).map((th) => {
            const t = th.querySelector('.tn-production-titre');
            const rt = t.getBoundingClientRect(), rh = th.getBoundingClientRect();
            const st = getComputedStyle(t), sh = getComputedStyle(th);
            return { texte: t.textContent, deborde: t.scrollWidth > t.clientWidth + 1 || th.scrollWidth > th.clientWidth + 1,
                dansSaColonne: rt.left >= rh.left - 0.5 && rt.right <= rh.right + 0.5, coupe: [st.overflow, st.whiteSpace, sh.overflow, sh.whiteSpace].join(' '),
                lignes: Math.round(rt.height / parseFloat(st.lineHeight)), largeur: Math.round(rh.width) };
        }));
        expect(titres.map((t) => t.texte)).toEqual(['Production 1', 'Analyse comparée de deux extraits', 'Production 3', 'Production 4', 'Production 5']);
        for (const t of titres) {
            expect(t.deborde, t.texte).toBe(false);
            expect(t.dansSaColonne, t.texte).toBe(true);
            expect(t.coupe, t.texte).not.toMatch(/hidden|clip|ellipsis|nowrap/);
        }
        expect(titres[1].lignes).toBeGreaterThanOrEqual(2);   // le titre long passe à la ligne
        expect(titres[1].largeur).toBeLessThanOrEqual(130);   // sans élargir sa colonne outre mesure
        // Une colonne amenée dans la vue au clavier montre son titre en entier, entre les deux colonnes fixées.
        await kase(page, 1, 1).focus();
        for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');
        expect(await dansLaBande(page, page.locator('#tableau-notation-hote th.tn-col-production').nth(2).locator('.tn-production-titre'))).toBe(true);
        expect(erreurs).toEqual([]);
    });
});

// CAPTURES — Chromium, 1180 et 820 px, standards et spécifications, noms fictifs. Le dossier de sortie vient de la variable
// CAPTURES (un chemin absolu) : une spec ne nomme pas un chemin que la CI n'observe pas.
test.describe('Tableau de notation · captures', () => {
    test.skip(!process.env.CAPTURES, 'captures à la demande (CAPTURES=<dossier>)');
    const dossier = process.env.CAPTURES || '';   // un chemin absolu
    const PLAN = {
        STD: [['e', 'm', 'm', 'd', 'e'], ['i', null, 'd', 'm', null], ['m', null, 'e', 'e', 'm'], [null, null, null, null, null]],
        SPE: [['a', 'a', 'a', 'a', 'a', 'a'], ['a', 'n', 'a', null, 'a', null], ['a', 'a', 'a', null, 'n', null], [null, null, null, null, null, null]]
    };
    // Le signe « ≠ » de l'échelle modifiée, à 1180 px, la souris sur la case. ⚠ L'infobulle est celle du navigateur
    // (attribut `title`) : une capture sans écran ne la dessine pas. Son texte est exigé par l'essai « une échelle modifiée ».
    for (const mode of ['sombre', 'clair']) {
        test(`le signe de l'échelle modifiée, 1180, ${mode}`, async ({ page }) => {
            await page.setViewportSize({ width: 1180, height: 820 });
            await monter(page, 'STD');
            await page.evaluate((clair) => window.definirTheme(clair), mode === 'clair');
            for (const [col, lettre] of [[1, 'm'], [2, 'e'], [3, 'm'], [4, 'd']]) { await kase(page, 1, col).focus(); await page.keyboard.press(lettre); }
            await page.evaluate((T) => {
                const echelles = window.db.getSync(T + '_echellesTemplates', []);
                echelles[0].niveaux.find((n) => n.code === 'M').valeurCalcul = 80;
                window.db.setSync(T + '_echellesTemplates', echelles);   // security-ok: fixture fictive du banc
                window.TableauNotation.afficher();
            }, T);
            await expect(kase(page, 1, 3)).toHaveClass(/tn-case--valeur-changee/);
            // Le message d'accueil de l'espace prêt arrive après coup : on l'attend, puis on le sort du cadre avec le témoin.
            await page.getByText('Ton espace de travail est prêt').waitFor({ timeout: 8000 }).catch(() => {});
            await page.evaluate(() => document.querySelectorAll('body *').forEach((n) => {
                if (getComputedStyle(n).position === 'fixed' && /espace de travail est prêt|^Enregistré$/.test((n.textContent || '').trim().slice(0, 400)) && !n.closest('header')) n.style.display = 'none';
            }));
            await kase(page, 1, 3).hover();
            await expect(page.locator('#tableau-notation-hote .tn-legende-signe')).toBeVisible();
            // Le tableau ET sa légende (la ligne du signe « ≠ »).
            const haut = await page.locator('#tableau-notation-hote .tn-cadre').boundingBox();
            const bas = await page.locator('#tableau-notation-hote .tn-legende').boundingBox();
            await page.screenshot({ path: path.join(dossier, `echelle-modifiee-1180-${mode}.png`), fullPage: true,
                clip: { x: haut.x - 8, y: haut.y - 8, width: haut.width + 16, height: (bas.y + bas.height) - haut.y + 16 } });
        });
    }
    for (const famille of ['STD', 'SPE']) {
        for (const [mode, largeur, hauteur] of [['sombre', 1180, 820], ['clair', 1180, 820], ['sombre', 820, 1180], ['clair', 820, 1180]]) {
            test(`${famille === 'STD' ? 'standards' : 'specifications'}, ${largeur}, ${mode}`, async ({ page }) => {
                await page.setViewportSize({ width: largeur, height: hauteur });
                const grille = famille === 'STD'
                    ? [COPIE_GRILLE, Object.assign({}, COPIE_GRILLE, { id: 'EG-O', etudiantDA: '9990012', noteFinale: 40, niveauFinal: 'I', remplaceeParId: 'EG-R' }),
                        Object.assign({}, COPIE_GRILLE, { id: 'EG-R', etudiantDA: '9990012', noteFinale: 100, niveauFinal: 'E', repriseDeId: 'EG-O', jetonRepriseApplique: true, dateEvaluation: '2026-10-20T12:00:00.000Z' })]
                    : [];
                await monter(page, famille, grille);
                await page.evaluate((clair) => { window.definirTheme(clair); window.TableauNotation.afficher(); }, mode === 'clair');
                for (let r = 0; r < PLAN[famille].length; r++) {
                    for (let c = 0; c < PLAN[famille][r].length; c++) {
                        const lettre = PLAN[famille][r][c];
                        if (!lettre || (await kase(page, r + 1, c + 1).getAttribute('data-evaluation'))) continue;
                        await kase(page, r + 1, c + 1).focus();
                        await page.keyboard.press(lettre);
                    }
                }
                await page.locator('#tableau-notation-hote .tn-titre').focus();
                // Ce qui flotte par-dessus le tableau (le message d'accueil de l'espace prêt, le témoin « Enregistré ») sort du cadre.
                const flottants = await page.evaluate(() => {
                    const noms = [];
                    document.querySelectorAll('body *').forEach((n) => {
                        const st = getComputedStyle(n);
                        if (st.position === 'fixed' && n.offsetParent === null && n.getBoundingClientRect().width > 0 && !n.closest('header') && n.tagName !== 'HEADER'
                            && /espace de travail est prêt|^Enregistré$/.test((n.textContent || '').trim().slice(0, 400))) { noms.push(n.className || n.id); n.style.display = 'none'; }
                    });
                    return noms;
                });
                expect(flottants.length).toBeGreaterThan(0);
                const nom = `${famille === 'STD' ? 'standards' : 'specifications'}-${largeur}-${mode}`;
                if (largeur !== 820) { await page.screenshot({ path: path.join(dossier, nom + '.png'), fullPage: true }); return; }
                // À 820 px, les colonnes débordent : une capture au début du défilement, une à la fin.
                const zone = page.locator('#tableau-notation-hote .tn-defilement');
                await zone.evaluate((z) => { z.scrollLeft = 0; });
                await page.waitForFunction(() => getComputedStyle(document.querySelector('#tableau-notation-hote .tn-cadre'), '::after').opacity === '1');
                await page.screenshot({ path: path.join(dossier, nom + '-debut.png'), fullPage: true });
                await zone.evaluate((z) => { z.scrollLeft = z.scrollWidth; });
                await page.waitForFunction(() => getComputedStyle(document.querySelector('#tableau-notation-hote .tn-cadre'), '::after').opacity === '0'
                    && getComputedStyle(document.querySelector('#tableau-notation-hote .tn-cadre'), '::before').opacity === '1');
                await page.screenshot({ path: path.join(dossier, nom + '-fin.png'), fullPage: true });
            });
        }
    }
});
