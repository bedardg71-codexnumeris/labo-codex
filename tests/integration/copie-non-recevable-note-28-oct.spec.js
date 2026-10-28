import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 28 oct. 2026 — UNE COPIE NON RECEVABLE VAUT CE QUE LA RÈGLE DIT, DANS LE CALCUL (sommative, de bout en bout).
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-28-copie-non-recevable-note.md`, § 3. Le scénario de la mesure
// du lot 2c (`DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-retouche.md`, § 2) : une copie évaluée E et M sur deux critères
// à 50 % (87,5), ouverte par « Modifier », passée à « Non recevable (Plagiat) », puis verrouillée.
//   · l'écran : les critères gardent E et M (le bloc qui visait des menus introuvables est retiré) ; l'avis s'affiche ;
//   · la base : la copie garde 87,5, verrouillée, « plagiat » ;
//   · le calcul : P = (0 × 40 + 95 × 60) / 100 = 57 (avant le correctif : (87,5 × 40 + 95 × 60) / 100 = 92) ;
//   · ce que voient l'enseignant et l'élève (la Liste, le PDF) est MESURÉ et journalisé, pas changé (§ 2.4).
// Noms fictifs.

const T = 't1028';

const MONTER = `({ T }) => {
    const coursId = 'cours-1028';
    const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 59, valeurCalcul: 40 }, { code: 'D', nom: 'en Développement', min: 60, max: 74, valeurCalcul: 60 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }];
    // security-ok: fixtures littérales du banc, aucune source externe.
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC102', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC1028', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: '1028001', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC1028' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_productions', [   // security-ok: fixture littérale du banc
        { id: 'P1', titre: 'Dissertation fictive', type: 'travail', ponderation: 40, grilleId: 'G1028', echelleId: 'E1028', groupeCoursId: 'GC1028' },
        { id: 'P2', titre: 'Examen fictif', type: 'examen', ponderation: 60, grilleId: 'G1028', echelleId: 'E1028', groupeCoursId: 'GC1028' }]);
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G1028', nom: 'Grille témoin', criteres: [{ id: 'c1', nom: 'Analyse', ponderation: 50 }, { id: 'c2', nom: 'Structure', ponderation: 50 }] }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E1028', nom: 'IDME', niveaux }]);   // security-ok: fixture littérale du banc
    const copie = (id, productionId, n1, n2, note, verrouillee) => ({
        id, etudiantDA: '1028001', productionId, groupeCoursId: 'GC1028', grilleId: 'G1028', echelleId: 'E1028',
        statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-20T08:00:00.000Z', noteFinale: note, niveauFinal: 'M', verrouillee,
        ponderationCouverte: 100,
        criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: n1, ponderation: 50, retroaction: '' },
                   { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: n2, ponderation: 50, retroaction: '' }],
        retroactionFinale: 'Rétroaction fictive.' });
    window.db.setSync(T + '_evaluationsSauvegardees', [copie('EV1', 'P1', 'E', 'M', 87.5, false), copie('EV2', 'P2', 'E', 'E', 95, true)]);   // security-ok: fixture littérale du banc
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC102', groupe: '01', _groupeCoursId: 'GC1028' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GC1028', trimestreId: T });
    window._pdf1028 = [];
    window._feedback1028 = [];
    window.jspdf.jsPDF.API.save = function (nom) { window._pdf1028.push(nom); return this; };
    const construire = window.syntheseRetroactionData.construireFeedback;
    window.syntheseRetroactionData.construireFeedback = function (evaluation) {
        const f = construire.apply(this, arguments);
        window._feedback1028.push({ noteFinale: evaluation.noteFinale, niveauFinal: evaluation.niveauFinal, statutIntegrite: evaluation.statutIntegrite });
        return f;
    };
}`;

const copieEnBase = (page) => page.evaluate((t) => (window.db.getSync(t + '_evaluationsSauvegardees', []) || []).find(e => e.id === 'EV1'), T);

async function attendreRepos(page) {
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV1', null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours && window._autoSaveSuspendu !== true, null, { timeout: 10000 });
}

test('sommative · « Non recevable (Plagiat) » puis verrouillée : les critères gardent E et M, la copie garde 87,5, P vaut 57', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.modifierEvaluation === 'function'
        && window.syntheseRetroactionData && window.travauxExportPDF && window.jspdf && typeof window.calculerEtStockerIndicesCP === 'function', null, { timeout: 20000 });
    await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T }) + ')');

    await page.evaluate(() => { window.afficherSection('evaluations'); window.modifierEvaluation('EV1'); });
    await attendreRepos(page);
    expect(await page.evaluate(() => window.noteCalculeeCourante), 'la copie se calcule à 87,5').toBe(87.5);

    // « Intégrité académique » → « Non recevable (Plagiat) », par le geste de l'écran.
    await page.evaluate(() => {
        const s = document.getElementById('statutIntegrite');
        s.value = 'plagiat';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(2500);
    const apresStatut = await page.evaluate(() => {
        const menu = (id) => { const el = document.getElementById('eval_' + id); return el ? { valeur: el.value, desactive: el.disabled } : null; };
        const avis = document.getElementById('message-non-recevable');
        return { c1: menu('c1'), c2: menu('c2'), avis: avis ? avis.textContent.replace(/\s+/g, ' ').trim() : null, courante: window.noteCalculeeCourante };
    });
    // eslint-disable-next-line no-console
    console.log('1028 · après « Plagiat » :', JSON.stringify(apresStatut));
    expect([apresStatut.c1, apresStatut.c2], 'les critères gardent l’évaluation, allumés').toEqual([{ valeur: 'E', desactive: false }, { valeur: 'M', desactive: false }]);
    expect(apresStatut.avis).toContain('Travail non recevable');
    expect(apresStatut.courante).toBe(87.5);

    // Verrouiller.
    await page.evaluate(() => window.basculerVerrouillageEvaluationCourante());
    await page.waitForTimeout(2500);
    const base = await copieEnBase(page);
    expect({ statut: base.statutIntegrite, verrouillee: base.verrouillee, note: base.noteFinale }, 'la base garde la note calculée').toEqual({ statut: 'plagiat', verrouillee: true, note: 87.5 });

    // Le calcul : la règle se lit au statut.
    const calcul = await page.evaluate(() => {
        window.calculerEtStockerIndicesCP();
        const indices = window.db.getSync(cle('indicesCP'), {}) || {};
        const actuel = indices['1028001'] && indices['1028001'].actuel;
        return { P: actuel ? actuel.P : null, sim: window.simulerIndices('1028001', 'sommative').P };
    });
    // eslint-disable-next-line no-console
    console.log('1028 · calcul :', JSON.stringify(calcul));
    expect(calcul).toEqual({ P: 57, sim: 57 });

    // Ce que voient l'enseignant et l'élève — MESURÉ (§ 2.4), journalisé pour la demande de relecture.
    await page.evaluate(() => { window.afficherSousSection('evaluations-liste'); if (typeof window.initialiserListeEvaluations === 'function') window.initialiserListeEvaluations(); });
    await page.waitForTimeout(2000);
    const liste = await page.evaluate(() => {
        const tr = document.querySelector('tr[data-evaluation-id="EV1"]');
        return tr ? Array.from(tr.querySelectorAll('td')).map(td => td.textContent.replace(/\s+/g, ' ').trim()) : null;
    });
    // eslint-disable-next-line no-console
    console.log('1028 · la Liste (ligne EV1) :', JSON.stringify(liste));
    expect(liste, 'la ligne de la copie se voit').not.toBeNull();

    await page.evaluate(() => window.modifierEvaluation('EV1'));
    await attendreRepos(page);
    const ecran = await page.evaluate(() => {
        const t = (id) => { const el = document.getElementById(id); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
        return { note: t('noteProduction1'), niveau: t('niveauProduction1'), ligneRemise: t('noteRemise1') };
    });
    // eslint-disable-next-line no-console
    console.log('1028 · le formulaire, verrouillée :', JSON.stringify(ecran));

    await page.evaluate(() => window.travauxExportPDF.exporterDossierComplet('1028001', 'P1'));
    await expect.poll(() => page.evaluate(() => window._pdf1028.length)).toBe(1);
    const pdf = await page.evaluate(() => window._feedback1028[window._feedback1028.length - 1]);
    // eslint-disable-next-line no-console
    console.log('1028 · le PDF de l’élève :', JSON.stringify(pdf));
    expect(pdf.statutIntegrite).toBe('plagiat');

    expect(await copieEnBase(page), 'rien n’a réécrit la copie').toEqual(base);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});
