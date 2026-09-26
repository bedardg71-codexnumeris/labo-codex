import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #959 (26 sept. 2026) — une évaluation « IA » ouverte depuis sa copie, puis enregistrée,
// repassait à « recevable » et perdait ses notes d'intégrité : le chargeur du chemin de la copie
// (`verifierEtChargerEvaluationExistante`) ne restaurait pas le statut d'intégrité, et
// « Enregistrer » (`_lireChampsDOMMod`) relit l'écran.
//
// MESURE (§ 3.1 de la consigne) : chaque champ que « Enregistrer » relit, semé à une valeur non
// par défaut, ouvert par la copie, enregistré. Semis et séquence d'ouverture : ceux des specs
// #699 / #882 ; un critère analytique (points) et un algorithmique (erreurs, mots) en plus.
// Noms fictifs.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    return erreurs;
}

async function viderLeStockage(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
}

const NOTES = 'Passages repris mot pour mot d\'un corrigé en ligne';
const RETRO = 'Rétroaction propre à cette copie.';

// L'évaluation semée : chaque champ relu par « Enregistrer » porte une valeur que l'écran vierge
// n'a pas. L'échelle E959B n'est PAS celle de la production (E959) ; le statut de remise
// « annote » n'est pas « importe », que pose `preRemplirEvaluation`.
const EVALUATION = {
    id: 'EV959', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin', groupe: '00007', groupeCoursId: 'GC1',
    productionId: 'P959', productionNom: 'Portrait témoin', grilleId: 'G959', grilleNom: 'Grille témoin mixte',
    echelleId: 'E959B', cartoucheId: '', statutRemise: 'annote', statutIntegrite: 'ia', notesIntegrite: NOTES,
    dateEvaluation: '2026-09-04T10:00:00.000Z', verrouillee: false,
    optionsAffichage: { description: true, objectif: true, tache: true, adresse: false, contexte: true, affichageNote: 'complet' },
    criteres: [
        { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', retroaction: '', ponderation: 50 },
        { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'M', retroaction: '', ponderation: 30, points: 24 },
        { critereId: 'c3', critereNom: 'Français écrit', niveauSelectionne: '', retroaction: '', ponderation: 20 }
    ],
    noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', retroactionFinale: RETRO,
    donneesAlgorithmiques: { c3: { erreurs: 7, mots: 460 } }, pointsAnalytiques: { c2: 24 }
};

async function semer(page, { anonymisation = false } = {}) {
    await viderLeStockage(page);
    await page.waitForFunction(() => typeof window.demarrerEvaluationDepuisFichier === 'function' && typeof window.db !== 'undefined');
    await page.evaluate(async ({ evaluation, anonymisation }) => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('groupeEtudiants'), [
            { da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' },
            { da: '7654321', prenom: 'Berthe', nom: 'Voisine', groupe: '00007', groupeCoursId: 'GC1' }
        ]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G959', nom: 'Grille témoin mixte', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50, description: 'Le fond.' },
            { id: 'c2', nom: 'Structure', ponderation: 30, type: 'analytique', description: 'La structure.' },
            { id: 'c3', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', facteurNormalisation: 500, description: 'La langue.' }
        ] }]);
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('echellesTemplates'), [
            { id: 'E959', nom: 'IDME témoin', niveaux },
            { id: 'E959B', nom: 'IDME témoin bis', niveaux }
        ]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('productions'), [{ id: 'P959', titre: 'Portrait témoin', grilleId: 'G959', echelleId: 'E959', groupeCoursId: 'GC1' }]);
        window.db.setSync(k('evaluationsSauvegardees'), [evaluation]);
        if (anonymisation) await window.changerMode('anonymisation');
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
    }, { evaluation: EVALUATION, anonymisation });
}

// Le trajet de la copie : `demarrerEvaluationDepuisFichier`, puis `preRemplirEvaluation` rejoué
// (statut « importe » posé d'abord, comme dans travaux-ui.js), puis le choix de la production.
async function ouvrirParLaCopie(page, da = '1234567') {
    await page.evaluate((da) => {
        window.demarrerEvaluationDepuisFichier({ id: 'F' + da, etudiantDA: da, productionId: 'P959', nomFichier: 'copie.pdf' });
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = da;
        window.chargerEvaluationsEtudiant();
        const selR = document.getElementById('remiseProduction1');
        selR.value = 'importe';
        window.changerStatutRemise(1);
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P959';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
    }, da);
    if (da === '1234567') await attendreChargement(page, { options: true });
}

// Le témoin : « Modifier » dans la Liste des évaluations.
async function ouvrirParLaListe(page) {
    await page.evaluate(() => window.modifierEvaluation('EV959'));
    await attendreChargement(page);
}

// Fin du chargement : l'id posé, l'auto-save rendu, les points et le critère algorithmique à
// l'écran ; par la copie, la restauration différée des options faite (témoin : « Adresse »
// décochée — « Modifier » coche tout par défaut, choix du 24 fév. 2026).
async function attendreChargement(page, { options = false } = {}) {
    await page.waitForFunction(({ options }) => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV959'
        && window._autoSaveSuspendu !== true
        && (document.getElementById('eval_pts_c2') || {}).value === '24'
        && (document.getElementById('eval_erreurs_c3') || {}).value === '7'
        && (!options || document.getElementById('afficherAdresse1').checked === false), { options }, { timeout: 10000 });
    await page.waitForTimeout(600);
}

async function enregistrer(page) {
    await page.evaluate(() => window.sauvegarderEvaluationModifiee());
    await page.waitForTimeout(600);
    return page.evaluate(() => (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV959'));
}

// Chaque champ relu par `_lireChampsDOMMod`, plus ce que la consigne soupçonne (§ 2) : points,
// données algorithmiques. `cartoucheId` et `optionsAffichage` ont leurs bancs (#946, #882).
// ⚠ `retroactionFinale` n'y est pas : les DEUX chemins la régénèrent depuis les critères à
// l'ouverture (mesuré le 26 sept. 2026, Liste comprise) — ce n'est pas #959.
function champs(base) {
    return {
        echelleId: base.echelleId,
        statutRemise: base.statutRemise,
        statutIntegrite: base.statutIntegrite,
        notesIntegrite: base.notesIntegrite,
        pointsAnalytiques: base.pointsAnalytiques,
        donneesAlgoC3: base.donneesAlgorithmiques && base.donneesAlgorithmiques.c3
            ? { erreurs: base.donneesAlgorithmiques.c3.erreurs, mots: base.donneesAlgorithmiques.c3.mots } : null,
        niveauC1: (base.criteres.find(c => c.critereId === 'c1') || {}).niveauSelectionne
    };
}

const ATTENDU = {
    echelleId: 'E959B', statutRemise: 'annote', statutIntegrite: 'ia', notesIntegrite: NOTES,
    pointsAnalytiques: { c2: 24 }, donneesAlgoC3: { erreurs: 7, mots: 460 }, niveauC1: 'E'
};

test('#959 · ouverte par la copie puis enregistrée : l\'évaluation garde chaque champ qu\'« Enregistrer » relit', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page);
    await ouvrirParLaCopie(page);
    const base = await enregistrer(page);
    for (const [cle, valeur] of Object.entries(ATTENDU)) expect.soft(champs(base)[cle], cle).toEqual(valeur);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#959 · témoin : ouverte par « Modifier » (Liste) puis enregistrée, elle garde les mêmes champs', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page);
    await ouvrirParLaListe(page);
    const base = await enregistrer(page);
    for (const [cle, valeur] of Object.entries(ATTENDU)) expect.soft(champs(base)[cle], cle).toEqual(valeur);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#959 · en anonymisation, par la copie : notes d\'intégrité masquées à l\'écran, réécrites telles quelles', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    await semer(page, { anonymisation: true });
    await ouvrirParLaCopie(page);
    const champ = await page.evaluate(() => {
        const c = document.getElementById('notesIntegrite');
        return { statut: document.getElementById('statutIntegrite').value, valeur: c.value, desactive: c.disabled,
            placeholder: c.placeholder, visible: !document.getElementById('divNotesIntegrite').classList.contains('u-hide') };
    });
    expect(champ).toEqual({ statut: 'ia', valeur: '', desactive: true, placeholder: 'Masqué en anonymisation', visible: true });
    const base = await enregistrer(page);
    expect(base.statutIntegrite).toBe('ia');
    expect(base.notesIntegrite).toBe(NOTES);
});

// Le cas voisin : le chargeur pose maintenant « IA » à l'écran. L'élève suivant, sans évaluation,
// ne doit pas en hériter (aucun geste ne remettait le menu à « recevable »).
test('#959 · la copie d\'un élève sans évaluation, ouverte juste après une « IA », repart à « recevable »', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await semer(page);
    await ouvrirParLaCopie(page);
    expect(await page.evaluate(() => document.getElementById('statutIntegrite').value), 'témoin : « IA » posé').toBe('ia');
    await ouvrirParLaCopie(page, '7654321');
    await page.waitForFunction(() => document.getElementById('selectEtudiantEval').value === '7654321'
        && window.evaluationEnCours && !window.evaluationEnCours.idModification, null, { timeout: 10000 });
    await page.waitForTimeout(1200);
    const ecran = await page.evaluate(() => ({
        statut: document.getElementById('statutIntegrite').value,
        notes: document.getElementById('notesIntegrite').value,
        visible: !document.getElementById('divNotesIntegrite').classList.contains('u-hide')
    }));
    expect(ecran).toEqual({ statut: 'recevable', notes: '', visible: false });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
