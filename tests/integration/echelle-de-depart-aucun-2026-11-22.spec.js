import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// =====================================================================
// « 0 – AUCUN » EN TÊTE DE L'ÉCHELLE DE DÉPART D'UN TRIMESTRE NEUF (22 nov. 2026)
// =====================================================================
//
// Décision de Grégoire (22 nov., 12 h 27 ; consigne CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 1) :
// l'« Échelle de départ (IDME) » devient identique à la sienne. Le premier niveau est « 0 – Aucun », le non recevable,
// bâti comme le « 0 » de l'échelle « IDME et niv 0 » de la démo (aucun pourcentage ne le donne) ; « I » commence à 0 %.
// La « Cartouche de départ » suit (B5) : sa colonne « 0 » dit « L'évaluation n'est pas possible. ».
// AUCUN CALCUL N'EST MODIFIÉ : le code « 0 » garde partout son sens de non recevable ; le stock garde « PS »
// (echelle-depart-prestructurel-1152.spec.js).
//
// Le VRAI semis d'un trimestre neuf, puis :
//   · le menu d'un critère offre « 0 - Aucun » en tête ; un pourcentage, même 0, ne le donne jamais : 30 % donne « I »
//     (la conséquence acceptée : valeur 40 au lieu du 0 de « PS ») ;
//   · une copie dont l'enseignant·e met chaque critère à « 0 » vaut 0 % et montre, critère par critère, le commentaire
//     de la colonne « 0 » de la Cartouche de départ.
// Données FICTIVES.

const T = 'a2026';
const DA = '2211001';

const MONTER = `async ({ T, DA }) => {
    window.db.setSync('trimestres', [{ id: T, nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('trimestreActif', T);
    window.trimestreActif = T;
    ['echellesTemplates', 'grillesTemplates'].forEach((k) => window.db.setSync(T + '_' + k, []));   // security-ok: fixture littérale du banc
    await window.assurerGrilleDeDepart();
    await window.assurerEchelleIdmeDeDepart();
    await window.assurerCartoucheDeDepart();
    const coursId = 'cours-2211';
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC2211', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC2211' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_productions', [{ id: 'P2211', titre: 'Travail fictif', type: 'travail', ponderation: 100,
        grilleId: 'GRILLE_GENERIQUE', echelleId: 'ECHELLE_IDME_DEPART', cartoucheId: 'CART_GENERIQUE', groupeCoursId: 'GC2211' }]);   // security-ok: fixture littérale du banc
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC2211' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GC2211', trimestreId: T });
    const echelle = window.db.getSync(T + '_echellesTemplates', []).find((e) => e.id === 'ECHELLE_IDME_DEPART');
    const cartouche = window.db.getSync(T + '_cartouches_GRILLE_GENERIQUE', []).find((c) => c.id === 'CART_GENERIQUE');
    return {
        niveaux: echelle.niveaux.map((n) => [n.code, n.nom, n.min, n.max, n.valeurCalcul]),
        description: echelle.description,
        colonnes: cartouche.niveaux.map((n) => n.code)
    };
}`;

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.assurerEchelleIdmeDeDepart === 'function'
        && typeof window.niveauDuPourcentage === 'function', null, { timeout: 20000 });
    const r = await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T, DA }) + ')');
    return { erreurs, ...r };
}

test('0 – Aucun · le semis d\'un trimestre neuf : « 0 » en tête, « I » dès 0 %, la cartouche suit ; aucun pourcentage ne donne « 0 »', async ({ page }) => {
    const { erreurs, niveaux, description, colonnes } = await monter(page);
    expect(niveaux).toEqual([['0', 'Aucun', 0, 0, 0], ['I', 'Incomplet', 0, 64.99, 40], ['D', 'Développement', 65, 74.99, 65],
        ['M', 'Maîtrise', 75, 84.99, 75], ['E', 'Étendu', 85, 100, 100]]);
    expect(description).toMatch(/^Cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu\. /);
    expect(colonnes).toEqual(['0', 'I', 'D', 'M', 'E']);
    const deductions = await page.evaluate((T) => {
        const n = window.db.getSync(T + '_echellesTemplates', []).find((e) => e.id === 'ECHELLE_IDME_DEPART').niveaux;
        // Les chemins algorithmique et analytique : `sansNiveauZero`, comme dans evaluation-calcul.js.
        return [0, 30, 39.4, 64, 65].map((p) => window.niveauDuPourcentage(p, n, { sansNiveauZero: true }));
    }, T);
    expect(deductions, '0 %, 30 %, 39,4 %, 64 % donnent « I » ; 65 % donne « D » (le pourcentage est arrondi à l\'entier, règle inchangée)').toEqual(['I', 'I', 'I', 'I', 'D']);
    expect(erreurs).toEqual([]);
});

test('0 – Aucun · à l\'évaluation, chaque critère à « 0 » : 0 %, et le commentaire de la colonne « 0 » de la Cartouche de départ', async ({ page }) => {
    const { erreurs } = await monter(page);
    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', []).find((g) => g.id === 'GRILLE_GENERIQUE');
        evaluationEnCours = { grilleId: grille.id, echelleId: 'ECHELLE_IDME_DEPART', cartoucheId: 'CART_GENERIQUE', criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = 'ECHELLE_IDME_DEPART';
        window.afficherCriteresDepuisGrille(grille.id, 'ECHELLE_IDME_DEPART');
        const menu = [...document.querySelectorAll('#listeCriteresGrille1 select')][0];
        grille.criteres.forEach((c) => { document.getElementById('eval_' + c.id).value = '0'; window.niveauSelectionne(c.id); });
        window.calculerNote();
        return {
            options: menu ? [...menu.options].map((o) => o.textContent.trim()).filter(Boolean) : null,
            note: document.getElementById('noteProduction1').textContent.replace(/\s+/g, ' '),
            courante: window.noteCalculeeCourante,
            commentaires: grille.criteres.map((c) => document.getElementById('comm_' + c.id).textContent.trim())
        };
    });
    expect(r.options.slice(-5), 'le menu du critère : « 0 - Aucun » en tête des cinq niveaux').toEqual(
        ['0 - Aucun', 'I - Incomplet', 'D - Développement', 'M - Maîtrise', 'E - Étendu']);
    expect(r.courante, 'valeur ponctuelle 0').toBe(0);
    expect(r.note).toBe('0 %');
    expect(r.commentaires).toEqual(r.commentaires.map(() => 'L\'évaluation n\'est pas possible.'));
    expect(erreurs).toEqual([]);
});
