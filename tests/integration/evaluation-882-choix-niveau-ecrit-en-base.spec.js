import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #882 (16 septembre 2026) — « J'ai caché la case "niveau de performance" pour n'afficher que le
// niveau […]. On dirait que le bouton radio ne fonctionne pas. »
//
// DEUX MOITIÉS. (1) Le PDF de synthèse ignorait le choix : sentinelle Vitest #882. (2) Le choix
// n'arrivait pas en base : le bouton radio ne faisait que régénérer le texte, et l'auto-save
// d'une évaluation EXISTANTE ne recopiait pas `optionsAffichage`. Seul « Enregistrer » l'écrivait,
// et le PDF relisait donc « Note chiffrée ». Ce banc prouve la moitié (2) dans l'application.
//
// Semis et séquence d'ouverture : ceux de la spec #699 (copie déjà évaluée, rouverte).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

test('#882 · rouvrir une évaluation, choisir « Niveau de performance » : le choix est écrit en base', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.demarrerEvaluationDepuisFichier === 'function' && typeof window.db !== 'undefined');

    const prep = await page.evaluate(() => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync('trimestreActif', 'a2026');
        // security-ok: fixture littérale du banc.
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G699', nom: 'Grille témoin 50/30/20', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50, description: 'Le fond.' },
            { id: 'c2', nom: 'Organisation', ponderation: 30, description: 'La structure.' },
            { id: 'c3', nom: 'Langue', ponderation: 20, description: 'La forme.' }
        ] }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E699', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('productions'), [{ id: 'P699', titre: 'Portrait témoin', grilleId: 'G699', echelleId: 'E699', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('evaluationsSauvegardees'), [{
            id: 'EV699', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin', groupe: '00007', groupeCoursId: 'GC1',
            productionId: 'P699', productionNom: 'Portrait témoin', grilleId: 'G699', grilleNom: 'Grille témoin 50/30/20',
            echelleId: 'E699', cartoucheId: '', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-09-04T10:00:00.000Z', verrouillee: false,
            // `adresse: false` — LE TÉMOIN (20 sept. 2026) : la case « Adresse » est cochée par défaut, seule la restauration
            // différée des options de CETTE évaluation peut la décocher.
            optionsAffichage: { description: true, objectif: true, tache: true, adresse: false, contexte: true, affichageNote: 'complet' },
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', retroaction: '', ponderation: 50 },
                { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', retroaction: '', ponderation: 30 },
                { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', retroaction: '', ponderation: 20 }
            ],
            noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', retroactionFinale: '',
            donneesAlgorithmiques: {}, pointsAnalytiques: {}
        }]);

        // 2. La séquence de travaux-ui.js à l'ouverture d'une copie pour évaluation.
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        const fichier = { id: 'F699', etudiantDA: '1234567', productionId: 'P699', nomFichier: 'copie.pdf' };
        return { prodEff: window.demarrerEvaluationDepuisFichier(fichier) };
    });
    expect(prep.prodEff).toBe('P699');

    // `preRemplirEvaluation` rejoué, puis les écouteurs de `travaux-ui.js` (attacherEvenementsMemorisation).
    await page.evaluate(() => {
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P699';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV699'
        && (document.getElementById('eval_c3') || {}).value === 'I'
        && document.getElementById('affichageNoteComplet1').checked
        && window._autoSaveSuspendu === false, null, { timeout: 10000 });
    // La restauration des options de l'évaluation est DIFFÉRÉE (setTimeout de 350 ms dans
    // `verifierEtChargerEvaluationExistante`) : cliquer avant la ferait recocher « Note chiffrée ».
    // Témoin de sa fin : la case « Adresse », cochée par défaut, décochée par elle seule (semis).
    // ⚠ 20 sept. 2026 — AVANT, le témoin était un enveloppement de `genererRetroaction` posé ICI, donc à poser
    // entre la levée de la suspension (500 ms) et la restauration (650 ms). Le Mac tenait dans ces 150 ms ;
    // le runner GitHub non : enveloppement posé trop tard, compteur resté à 0, rouge sur chaque run depuis
    // la naissance de la spec (mesuré : 400 ms de retard sur le Mac donnent la même erreur, à la ligne près).
    await page.waitForFunction(() => document.getElementById('afficherAdresse1').checked === false, null, { timeout: 10000 });
    await page.evaluate(() => window.attacherEvenementsMemorisation());

    // LE GESTE : « Niveau de performance », comme à la souris (el.click() émet `change`).
    await page.evaluate(() => document.getElementById('affichageNoteLettre1').click());

    // AVANT le correctif : rien n'armait l'auto-save, et rien ne recopiait le choix — cette attente expirait.
    await page.waitForFunction(() => {
        const ev = (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699');
        return ev && ev.optionsAffichage && ev.optionsAffichage.affichageNote === 'lettre';
    }, null, { timeout: 6000 });

    const base = await page.evaluate(() => (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699'));
    // Le reste de l'évaluation est intact : l'auto-save n'a rien réécrit d'autre de travers.
    expect(base).toMatchObject({ noteFinale: 84, niveauFinal: 'M', verrouillee: false });
    expect(base.optionsAffichage).toEqual({ description: true, objectif: true, tache: true, adresse: false, contexte: true, affichageNote: 'lettre' });

    // Les cases d'affichage vivent dans le même objet : décocher « Contexte » s'écrit aussi.
    await page.evaluate(() => document.getElementById('afficherContexte1').click());
    await page.waitForFunction(() => {
        const ev = (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699');
        return ev && ev.optionsAffichage && ev.optionsAffichage.contexte === false;
    }, null, { timeout: 6000 });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
