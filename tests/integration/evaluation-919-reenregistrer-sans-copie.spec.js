import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// PORTE #919 (18 septembre 2026) — RÉENREGISTRER UNE ÉVALUATION DANS UN TRIMESTRE SANS AUCUNE COPIE.
//
// Rapport de Grégoire, 18 sept. 2026, 13 h 56 (1.146.1), trimestre A2024 : trois « Maximum call stack size
// exceeded » sous `sauvegarderEvaluation`, à 13 h 49, 13 h 50 et 13 h 51. Mesuré : sur une page où aucune copie
// n'a été ouverte, seul le `let evaluationEnCours` de config.js est posé ; `window.evaluationEnCours` reste
// undefined. « Enregistrer » par-dessus une évaluation existante passait par `_basculerEnModificationActiveSauv`,
// qui ne posait l'id que si le pivot window existait : `sauvegarderEvaluationModifiee` renvoyait alors à
// `sauvegarderEvaluation`, qui revenait à la bascule. Pile débordée, RIEN d'écrit, aucun message.
//
// Le banc fait le geste vécu : page fraîche, « Évaluer » depuis la liste, un niveau changé, le VRAI bouton
// « Enregistrer ». Aucun `page.click` : `el.click()` et `change` sur le vrai <select>.

const T = 't919';

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.evaluerProduction === 'function'
        && typeof window.executerActionEval === 'function' && typeof window.sauvegarderEvaluation === 'function');
    await page.evaluate((T) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-919';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre sans copie', annee: 2024, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_919', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TEST919', nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_919' }]);
        window.db.setSync(T + '_productions', [{ id: 'p919', titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G919', echelleId: 'E919', groupeCoursId: 'GC_919' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G919', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 100, type: 'holistique' }] }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E919', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'M', nom: 'Maîtrisé', min: 55, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }] }]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVAL919', etudiantDA: 'TEST919', productionId: 'p919', grilleId: 'G919', echelleId: 'E919', cartoucheId: '',
            groupeCoursId: 'GC_919', coursId, statutRemise: 'remis', statutIntegrite: 'recevable',
            criteres: [{ critereId: 'c1', niveauSelectionne: 'M' }], noteFinale: 80,
            dateEvaluation: '2024-10-20T12:00:00.000Z', verrouillee: false
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_919' });
        window.db.setSync('groupeCoursActif', { id: 'GC_919', trimestreId: T });
    }, T);
    return erreurs;
}

test('#919 · page fraîche, sans copie : « Enregistrer » par-dessus une évaluation existante écrit le nouveau niveau', async ({ page }) => {
    const erreurs = await monter(page);

    await page.evaluate(() => window.executerActionEval({ value: 'evaluer|TEST919|p919' }));
    await page.waitForFunction(() => (document.getElementById('selectEtudiantEval') || {}).value === 'TEST919'
        && (document.getElementById('eval_c1') || {}).value === 'M', null, { timeout: 10000 });

    // La prémisse du bug, mesurée et non supposée : aucune copie ouverte, donc aucun pivot window.
    expect(await page.evaluate(() => window.evaluationEnCours === undefined)).toBe(true);

    await page.evaluate(() => {
        const niveau = document.getElementById('eval_c1');
        niveau.value = 'E';
        niveau.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('btnVerrouillerEvaluation').click();
    });
    await page.waitForFunction((T) => {
        const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find((x) => x.id === 'EVAL919');
        return !!e && (e.criteres || []).some((c) => c.critereId === 'c1' && c.niveauSelectionne === 'E');
    }, T, { timeout: 10000 }).catch(() => {});

    const stock = await page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', [])
        .map((e) => ({ id: e.id, da: e.etudiantDA, c1: ((e.criteres || []).find((c) => c.critereId === 'c1') || {}).niveauSelectionne })), T);

    expect(erreurs, 'aucune erreur de page, aucun dialogue').toEqual([]);
    expect(stock, 'la même évaluation, modifiée sur place : ni perdue, ni doublée').toEqual([{ id: 'EVAL919', da: 'TEST919', c1: 'E' }]);
});
