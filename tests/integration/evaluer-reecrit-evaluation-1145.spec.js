import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1145 (23 oct. 2026) — PASSER EN MODE ÉVALUER RÉÉCRIVAIT UNE ÉVALUATION, SANS « ENREGISTRER ».
//
// Vécu par Grégoire (1.216.1, Chrome, 17 h 11) : l'évaluation d'une copie de l'Artefact 5 réécrite à
// la seconde du clic sur « Évaluer » (`dateModification` 17:11:14.278, `heureModification` inchangée,
// aucune entrée de journal). Le chemin : `basculerMode('evaluer')` → `preRemplirEvaluation`, +150 ms →
// `chargerEvaluationsEtudiant` → `_flusherAutoSave`. Ce flush rejouait `window._pendingAutoSaveSnapshot`,
// que RIEN NE VIDAIT quand l'enregistrement automatique était déjà parti (le minuteur) ni quand il avait
// été annulé (« Modifier », `nouvelleEvaluation`) : le dernier instantané pris, parfois des heures plus
// tôt, réécrivait sa copie au passage suivant par le mode Évaluer — ses niveaux, sa grille, et la note,
// la rétroaction et la cartouche que l'écran portait à ce moment-là.
// Le banc : une copie évaluée, un niveau posé (l'enregistrement automatique part, c'est voulu), Annoter,
// une évaluation changée entre-temps dans la base, puis Évaluer. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't1145';

async function monter(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate(({ png, T }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1145';
        const crit = [
            { id: 'c1', nom: 'Structure', ponderation: 50, type: 'holistique' },
            { id: 'c2', nom: 'Contenu', ponderation: 50, type: 'holistique' }
        ];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1145', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TESTA1145', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GC1145' }
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p1145', titre: 'Plan', type: 'travail', ponderation: 60, grilleId: 'G1145', echelleId: 'E1145', groupeCoursId: 'GC1145' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G1145', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E1145', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVA1145', etudiantDA: 'TESTA1145', productionId: 'p1145', groupeCoursId: 'GC1145', coursId,
            grilleId: 'G1145', echelleId: 'E1145', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', dateModification: '2026-10-15T08:00:00.000Z', heureModification: '04 h 00',
            noteFinale: 80, niveauFinal: 'M', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 50, retroaction: '' },
                { critereId: 'c2', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 50, retroaction: '' }
            ],
            donneesAlgorithmiques: {}, retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {}
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FTA1145', etudiantDA: 'TESTA1145', productionId: 'p1145', coursId, groupeCoursId: 'GC1145',
            nomFichier: 'FICTIF_TESTA1145_Plan.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1145' });
        window.db.setSync('groupeCoursActif', { id: 'GC1145', trimestreId: T });
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FTA1145' ? copie : original.apply(this, arguments); };
    }, { png: PNG, T });
    return erreurs;
}

const stock = (page) => page.evaluate((T) => {
    const e = window.db.getSync(T + '_evaluationsSauvegardees', []).find(x => x.id === 'EVA1145');
    return { niveaux: e.criteres.map(c => c.critereId + '=' + c.niveauSelectionne).join(','), dateModification: e.dateModification };
}, T);

async function attendreCopie(page) {
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.etudiantDA === 'TESTA1145'
        && !!window.evaluationEnCours.idModification, null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('#1145 · après l\'enregistrement automatique, Annoter puis Évaluer n\'écrit rien dans l\'évaluation', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FTA1145"]'), null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FTA1145'));
    await page.waitForFunction(() => (window.travauxVisionneuse.getFichierActuel() || {}).id === 'FTA1145', null, { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await attendreCopie(page);

    // Le geste : « Structure » passe à D. L'enregistrement automatique l'écrit 1,5 s plus tard — voulu.
    await page.evaluate(() => {
        const s = document.getElementById('eval_c1');
        s.value = 'D';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(2500);
    expect.soft((await stock(page)).niveaux, 'l\'enregistrement automatique a écrit le geste').toBe('c1=D,c2=M');

    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForTimeout(800);
    // Entre-temps, l'évaluation change dans la base (un autre écran, un import) : « Structure » à E.
    await page.evaluate((T) => {
        const evals = window.db.getSync(T + '_evaluationsSauvegardees', []);
        const e = evals.find(x => x.id === 'EVA1145');
        e.criteres[0].niveauSelectionne = 'E';
        e.dateModification = '2026-10-23T21:00:00.000Z';
        window.db.setSync(T + '_evaluationsSauvegardees', evals);
    }, T);
    const avant = await stock(page);

    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForTimeout(1000);   // l'écriture de #1145 partait à +150 ms
    const apres = await stock(page);
    // AVANT LE CORRECTIF : { niveaux: 'c1=D,c2=M', dateModification: <l'instant du clic> } — l'instantané rejoué.
    expect.soft(apres, 'Évaluer n\'a rien écrit').toEqual(avant);
    expect(sansBruit(erreurs)).toEqual([]);
});
