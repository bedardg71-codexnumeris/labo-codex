import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 28 oct. 2026 — LA NOTE SUIT LES DÉCISIONS DE GRÉGOIRE (#1152, trou 2), dans l'application réelle.
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs.md`, § 2.
//   1. E4 : une reprise accordée en sommative, par `appliquerJetonReprise` (originale gardée) : la note ne bouge pas
//      avant la réévaluation (86 ; avant le correctif : 90, la Dissertation sortait), puis la reprise la remplace (92).
//   2. E7 : l'export, par le bouton réel, d'une pratique sans « Notes finalisées » : « provisoire » ; cochée : « final ».
// Noms fictifs.

const T = 'tn1028';
const DA = '1028101';

const MONTER = `({ T, DA, notesFinales }) => {
    const coursId = 'cours-n1028';
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('trimestreActif', T);
    window.trimestreActif = T;
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC103', titre: 'Cours fictif' }]);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC103', groupe: '01', _groupeCoursId: 'GCN1028' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GCN1028', trimestreId: T });
    window.db.setSync(T + '_groupesCours', [{ id: 'GCN1028', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'som-n1028', actif: true }]);
    window.db.setSync(window.cle('pratiquesConfigurables'), [{ id: 'som-n1028', nom: 'Sommative témoin', type: 'sommative',   // security-ok: fixture littérale du banc
        calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: notesFinales ? { notesFinales: true } : {} }]);
    window.db.setSync(window.cle('groupeEtudiants'), [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GCN1028' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(window.cle('productions'), [   // security-ok: fixture littérale du banc
        { id: 'P1', titre: 'Dissertation fictive', type: 'travail', ponderation: 40, groupeCoursId: 'GCN1028' },
        { id: 'P2', titre: 'Examen fictif', type: 'examen', ponderation: 60, groupeCoursId: 'GCN1028' }]);
    const copie = (id, productionId, note) => ({ id, etudiantDA: DA, productionId, groupeCoursId: 'GCN1028', statutRemise: 'evalue',
        statutIntegrite: 'recevable', dateEvaluation: '2026-10-20T08:00:00.000Z', noteFinale: note, niveauFinal: 'M', verrouillee: true,
        ponderationCouverte: 100, criteres: [], retroactionFinale: 'Rétroaction fictive.' });
    window.db.setSync(window.cle('evaluationsSauvegardees'), [copie('EVN1', 'P1', 80), copie('EVN2', 'P2', 90)]);   // security-ok: fixture littérale du banc
    window.calculerEtStockerIndicesCP();
}`;

async function ouvrir(page, notesFinales) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (dl) => { dl.accept().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.appliquerJetonReprise === 'function'
        && typeof window.calculerEtStockerIndicesCP === 'function' && typeof window.simulerIndices === 'function', null, { timeout: 20000 });
    await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T, DA, notesFinales }) + ')');
    return erreurs;
}
const lireNote = (page) => page.evaluate((da) => {
    window.calculerEtStockerIndicesCP();
    const actuel = ((window.db.getSync(window.cle('indicesCP'), {}) || {})[da] || {}).actuel || null;
    return { P: actuel ? actuel.P : null, sim: window.simulerIndices(da, 'som-n1028').P };
}, DA);

test('E4 · sommative : une reprise accordée ne sort pas la Dissertation de la note avant sa réévaluation (86), puis la remplace (92)', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page, false);
    expect(await lireNote(page), 'avant la reprise : (80 × 40 + 90 × 60) / 100').toEqual({ P: 86, sim: 86 });

    const reprise = await page.evaluate(async () => {
        const r = await window.appliquerJetonReprise('EVN1', true, { silencieux: true });
        return r ? { id: r.id, verrouillee: r.verrouillee } : null;
    });
    expect(reprise, 'la reprise est créée, déverrouillée').toMatchObject({ verrouillee: false });
    const enBase = await page.evaluate(() => (window.db.getSync(window.cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EVN1'));
    expect(enBase.remplaceeParId, 'l\'originale est gardée, marquée').toBe(reprise.id);
    const pendant = await lireNote(page);
    console.log('N1028 · pendant la fenêtre :', JSON.stringify(pendant));
    expect(pendant, 'E4 : l\'originale compte jusqu\'à la réévaluation (avant le correctif : 90)').toEqual({ P: 86, sim: 86 });

    // La réévaluation : la reprise reçoit sa note et se verrouille (ce que fait l'enseignant·e au formulaire).
    await page.evaluate((id) => {
        const k = window.cle('evaluationsSauvegardees');
        const l = window.db.getSync(k, []);
        const r = l.find(e => e.id === id);
        Object.assign(r, { noteFinale: 95, niveauFinal: 'E', verrouillee: true });
        window.db.setSync(k, l);
    }, reprise.id);
    expect(await lireNote(page), 'la reprise réévaluée remplace l\'originale : (95 × 40 + 90 × 60) / 100').toEqual({ P: 92, sim: 92 });
    expect(erreurs).toEqual([]);
});

for (const [notesFinales, statut] of [[false, 'provisoire'], [true, 'final']]) {
    test(`E7 · l'export par le bouton réel : « Notes finalisées » ${notesFinales ? 'cochée' : 'non cochée'} → « ${statut} »`, async ({ page }) => {
        test.setTimeout(60000);
        const erreurs = await ouvrir(page, notesFinales);
        await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
        const [dl] = await Promise.all([
            page.waitForEvent('download', { timeout: 8000 }),
            page.evaluate(() => document.querySelector('button[data-action="exporterSyntheseResultatsCSV"]').click())
        ]);
        const csv = readFileSync(await dl.path(), 'utf8');
        const ligne = csv.split(/\r?\n/).find(l => l.startsWith(DA));
        console.log('N1028 · export :', ligne);
        expect(ligne).toContain(',86,' + statut + ',');
        expect(erreurs).toEqual([]);
    });
}
