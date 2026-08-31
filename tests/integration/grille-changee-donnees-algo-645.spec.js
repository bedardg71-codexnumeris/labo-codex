import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #645 — CHANGER DE GRILLE NE PERD PLUS LA SAISIE ALGORITHMIQUE,
// ET LE CHEMIN SANS CARTOUCHE SAIT AFFICHER SON RÉSULTAT.
//
// LE DÉFAUT, tel que Grégoire l'a rencontré le 31 août 2026 : après avoir annoté une
// copie, il crée une grille « français seul » et bascule dessus. Le nombre d'erreurs
// repart à zéro, et la ligne de résultat reste à « -- erreurs sur -- mots ».
//
// DEUX CAUSES DISTINCTES, et il fallait les deux pour produire ce qu'il a vu.
//
// (1) LA SAISIE NE VOYAGE PAS. `chargerGrilleSelectionnee` reporte les NIVEAUX d'une
//     grille à l'autre, par ID puis par NOM de critère — la logique existe déjà, elle
//     est là pour survivre à un changement de grille. `donneesAlgorithmiques` n'était
//     pas du voyage : le critère algorithmique renaît les champs vides.
//     ⚠ Ce n'est pas cosmétique : la sauvegarde persiste ce que portent les champs.
//     Une saisie non réaffichée est une saisie que le prochain enregistrement écrase
//     par du vide.
//
// (2) LA LIGNE DE RÉSULTAT ÉTAIT MORTE SUR CE CHEMIN. Deux fonctions rendent le même
//     critère algorithmique. Celle qui passe par une cartouche (`cartoucheSelectionnee`)
//     émet six `<span>` porteurs d'id que le calcul vient renseigner. Celle qui rend
//     SANS cartouche (`afficherCriteresDepuisGrille` — le cas de Grégoire, dont le
//     sélecteur affichait « — Choisir une cartouche — ») écrivait « -- erreurs sur
//     -- mots » en TEXTE FIGÉ. Le calcul tournait et cherchait des éléments qui
//     n'existaient pas : ses gardes le faisaient renoncer en silence.
//     ⮕ Mesuré avant d'être corrigé : `#eval_erreurs_<id>` existe sur ce chemin,
//     `#total_erreurs_simple_<id>` non.
//
// ⚠ CE QUE CE TEST DOIT SAVOIR SUR `evaluationEnCours`, sinon il ne mesure rien.
// `js/config.js:173` déclare `let evaluationEnCours` : un `let` de premier niveau ne
// crée AUCUNE propriété sur `window`. Écrire `window.evaluationEnCours = {...}` crée
// un SECOND emplacement que `chargerGrilleSelectionnee` ne lit pas — elle lit le nom
// nu (constat #646, non refermé). Le montage affecte donc le NOM NU. C'est du décor,
// pas une prise de position sur #646.
// ⮕ Et le TÉMOIN d'état initial vérifie que ce décor a pris : il exige que
// `donneesAlgorithmiques` ait été RÉÉCRIT par le calcul après la frappe simulée. Or
// `calculerNoteAlgorithmiqueSimple` sort à sa première ligne si le nom nu est vide
// (`evaluation-calcul.js:96`). Témoin vert = l'assignation a bien atteint la liaison
// que lit le module de calcul. Témoin rouge = c'est le banc, pas le code.

const MONTER = `() => {
    const trim = (typeof obtenirTrimestreId === 'function' && obtenirTrimestreId()) || '';
    const cleG = trim ? trim + '_grillesTemplates' : 'grillesTemplates';
    const cleE = trim ? trim + '_echellesTemplates' : 'echellesTemplates';

    const crit = (id) => ({
        id, nom: 'Français écrit', type: 'algorithmique',
        ponderation: 20, facteurNormalisation: 500,
        description: 'Respect des normes de la langue française écrite.'
    });

    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(cleG, [
        { id: 'GR_AVANT', nom: 'Grille complète', criteres: [crit('CR_FR_AVANT')], dansBibliotheque: true },
        { id: 'GR_APRES', nom: 'Grille-1 FR-ALGO seul', criteres: [crit('CR_FR_APRES')], dansBibliotheque: true }
    ]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(cleE, [{ id: 'ECH_IDME', nom: '0-IDME (5 niveaux)', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0,  max: 59 },
        { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100 }
    ] }]);

    // ⚠ AFFECTATION AU NOM NU — voir l'en-tête. Un « window.evaluationEnCours = … »
    // ne serait PAS vu par chargerGrilleSelectionnee.
    evaluationEnCours = {
        etudiantDA: 'DA-TEST', productionId: 'PROD-TEST',
        grilleId: 'GR_AVANT', echelleId: 'ECH_IDME', cartoucheId: '',
        criteres: {},
        donneesAlgorithmiques: { CR_FR_AVANT: { erreurs: 7, mots: 460 } },
        statutRemise: 'evalue'
    };

    // Décor minimal : le select de grille doit porter la valeur cible, et
    // l'échelle doit être lisible par le rendu.
    const selG = document.getElementById('selectGrille1');
    selG.innerHTML = '<option value="GR_AVANT">Grille complète</option><option value="GR_APRES">Grille-1 FR-ALGO seul</option>';
    const selE = document.getElementById('selectEchelle1');
    if (selE) selE.innerHTML = '<option value="ECH_IDME">0-IDME</option>';

    // État de départ : la grille AVANT est rendue, avec sa saisie à l'écran.
    afficherCriteresDepuisGrille('GR_AVANT', 'ECH_IDME');
    document.getElementById('eval_erreurs_CR_FR_AVANT').value = '7';
    document.getElementById('eval_mots_CR_FR_AVANT').value = '460';
    document.getElementById('eval_erreurs_CR_FR_AVANT').dispatchEvent(new Event('input', { bubbles: true }));

    return {
        champErreursAvant: document.getElementById('eval_erreurs_CR_FR_AVANT').value,
        champMotsAvant: document.getElementById('eval_mots_CR_FR_AVANT').value,
        // Réécrit par le calcul lui-même : c'est ce qui prouve que la frappe simulée
        // a bien traversé calculerNoteAlgorithmiqueSimple, donc que le décor a pris.
        memoireAvant: (evaluationEnCours.donneesAlgorithmiques || {}).CR_FR_AVANT || null
    };
}`;

const BASCULER = `() => {
    document.getElementById('selectGrille1').value = 'GR_APRES';
    chargerGrilleSelectionnee();
    return true;
}`;

const LIRE = `() => {
    const v = (id) => { const e = document.getElementById(id); return e ? (e.value !== undefined ? e.value : e.textContent) : null; };
    return {
        champErreurs: v('eval_erreurs_CR_FR_APRES'),
        champMots: v('eval_mots_CR_FR_APRES'),
        resumeErreurs: (document.getElementById('total_erreurs_simple_CR_FR_APRES') || {}).textContent,
        resumeMots: (document.getElementById('mots_simple_CR_FR_APRES') || {}).textContent,
        enMemoire: (evaluationEnCours.donneesAlgorithmiques || {}).CR_FR_APRES || null
    };
}`;

test('#645 · changement de grille : la saisie algorithmique suit le critère de même nom', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    // TÉMOIN D'ÉTAT INITIAL : sans lui, un « rien après bascule » ne distinguerait
    // pas « la bascule a perdu la saisie » de « la saisie n'a jamais été là ».
    const avant = await page.evaluate('(' + MONTER + ')()');
    console.log('AVANT BASCULE →', JSON.stringify(avant));
    expect(avant.champErreursAvant, 'TÉMOIN : la saisie est bien à l\'écran AVANT la bascule').toBe('7');
    expect(avant.champMotsAvant, 'TÉMOIN : et le nombre de mots aussi').toBe('460');
    expect(avant.memoireAvant, 'TÉMOIN : le calcul a tourné — donc le décor a atteint la liaison lue par evaluation-calcul.js')
        .toEqual(expect.objectContaining({ erreurs: 7, mots: 460 }));

    await page.evaluate('(' + BASCULER + ')()');
    await page.waitForTimeout(400);

    const apres = await page.evaluate('(' + LIRE + ')()');
    console.log('APRÈS BASCULE →', JSON.stringify(apres));

    expect(apres.champErreurs, 'le nombre d\'erreurs suit le critère de même nom').toBe('7');
    expect(apres.champMots, 'le nombre de mots aussi').toBe('460');
    expect(apres.resumeErreurs, 'et le calcul est relancé : plus de « -- »').toBe('7');
    expect(apres.resumeMots).toBe('460');
    expect(apres.enMemoire, 'la donnée est réindexée sous le NOUVEL id de critère').toEqual(
        expect.objectContaining({ erreurs: 7, mots: 460 })
    );
});
