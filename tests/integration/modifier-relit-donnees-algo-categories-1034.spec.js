import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1034 — « MODIFIER » RELIT LE NOMBRE D'ERREURS ET LES CODES D'UN CRITÈRE ALGORITHMIQUE.
//
// Mesuré par Grégoire le 6 oct. 2026 (BUG_grégoire_2026-10-06_15-34-54, démo) : l'Évaluation
// terminale de Marie Curie vaut 83,3 % (M) dans la Liste ; rouverte depuis sa copie, le
// formulaire affiche 86,3 % (E) et « 0 erreur de français pour 729 mots ». Le pack porte
// pourtant ses données au format des codes : `{ codes, mots, totalErreurs }`, sans `erreurs`.
//
// DEUX CAUSES, sur le chemin « Modifier » seul (`modifierEvaluation`) :
//   (1) `_initEvaluationEnCoursPourModif` ne posait pas `donneesAlgorithmiques` : au rendu
//       du critère, la détection des codes (`evaluation-chargement.js`) ne voyait rien, et le
//       critère naissait en mode simple, sans champ pour les codes ;
//   (2) `_restaurerDonneesAlgorithmiquesModif` ne lisait que `erreurs`, sans le repli sur
//       `totalErreurs` que son jumeau (`verifierEtChargerEvaluationExistante`) a déjà.
// Le champ des erreurs restait vide, le calcul comptait 0 erreur, et le premier geste qui arme
// l'auto-save écrivait la note fausse et perdait les codes.
// Noms fictifs.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't1034';
const CODES = ['1', '3', '1'];

async function monter(page, { donnees }) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.modifierEvaluation === 'function');
    await page.evaluate(({ png, T, donnees }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1034';
        const crit = [
            { id: 'c1', nom: 'Contenu', ponderation: 80, type: 'holistique' },
            { id: 'c2', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: 'nombre d\'erreurs / nombre de mots',
                categoriesErreurs: [
                    { code: '0', retroaction: 'CODE 0' }, { code: '1', retroaction: 'CODE 1' },
                    { code: '3', retroaction: 'CODE 3' }
                ] }
        ];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1034', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TEST1034', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC1034' }]);
        window.db.setSync(T + '_productions', [
            { id: 'p1034', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G1034', echelleId: 'E1034', cartoucheId: 'CT1034', groupeCoursId: 'GC1034' }
        ]);
        // Une cartouche, comme l'évaluation de Curie : c'est le rendu par cartouche (`cartoucheSelectionnee`)
        // qui fait naître le mode des codes. Le rendu sans cartouche n'en a pas (hors de ce lot).
        const commentaires = {};
        ['I', 'D', 'M', 'E'].forEach((n) => { commentaires['c1_' + n] = 'CARTOUCHE c1_' + n; commentaires['c2_' + n] = 'CARTOUCHE c2_' + n; });
        window.db.setSync(T + '_cartouches_G1034', [{ id: 'CT1034', nom: 'Cartouche témoin', grilleId: 'G1034', contexte: '',
            criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Français écrit' }], commentaires }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G1034', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E1034', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EV1034', etudiantDA: 'TEST1034', productionId: 'p1034', groupeCoursId: 'GC1034',
            grilleId: 'G1034', echelleId: 'E1034', cartoucheId: 'CT1034', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 80, retroaction: '' },
                { critereId: 'c2', critereNom: 'Français écrit', niveauSelectionne: 'M', ponderation: 20, retroaction: '' }
            ],
            donneesAlgorithmiques: { c2: donnees },
            retroactionFinale: '',
            retroactionReecrite: false
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT1034', etudiantDA: 'TEST1034', productionId: 'p1034', coursId, groupeCoursId: 'GC1034',
            nomFichier: 'FICTIF_TEST1034_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1034' });
        window.db.setSync('groupeCoursActif', { id: 'GC1034', trimestreId: T });
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT1034' ? copie : original.apply(this, arguments); };
    }, { png: PNG, T, donnees });
    return erreurs;
}

async function ouvrir(page, chemin) {
    if (chemin === 'copie') await page.evaluate(() => window.evaluerProduction('TEST1034', 'p1034'));
    else await page.evaluate(() => window.modifierEvaluation('EV1034'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV1034', null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
}

const champs = (page) => page.evaluate(() => {
    const v = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
    return { categories: v('eval_categories_c2'), erreurs: v('eval_erreurs_c2'), mots: v('eval_mots_c2') };
});
const base = (page) => page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV1034'), T);

// L'auto-save armé comme par un geste, puis attendu : c'est lui qui écrivait la note fausse.
async function gesteEtAutoSave(page) {
    await page.evaluate(() => window._debouncerAutoSave());
    await page.waitForTimeout(2500);
}

for (const chemin of ['liste', 'copie']) {
    test(`#1034 · par ${chemin === 'copie' ? 'la copie' : 'la Liste'}, données au format des codes : les codes reviennent, et un geste les garde en base`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page, { donnees: { codes: CODES, mots: 500, totalErreurs: 3, sommePonderee: 3 } });
        await ouvrir(page, chemin);
        const c = await champs(page);
        expect.soft(c.categories, 'le champ des codes existe et les porte').toBe(CODES.join(';'));
        expect.soft(c.mots, 'le nombre de mots').toBe('500');
        await gesteEtAutoSave(page);
        const b = await base(page);
        expect.soft(b.donneesAlgorithmiques.c2.codes, 'les codes en base après un geste').toEqual(CODES);
        expect(b.donneesAlgorithmiques.c2.totalErreurs ?? b.donneesAlgorithmiques.c2.erreurs, 'le nombre d\'erreurs en base').toBe(3);
        expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
    });
}

test('#1034 · par la Liste, totalErreurs seul (ni codes ni erreurs) : le champ des erreurs le relit', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page, { donnees: { mots: 500, totalErreurs: 3 } });
    await ouvrir(page, 'liste');
    const c = await champs(page);
    expect.soft(c.erreurs, 'le nombre d\'erreurs relu').toBe('3');
    await gesteEtAutoSave(page);
    const d = (await base(page)).donneesAlgorithmiques.c2;
    expect(d.erreurs ?? d.totalErreurs, 'pas de 0 écrit en base').toBe(3);
});
