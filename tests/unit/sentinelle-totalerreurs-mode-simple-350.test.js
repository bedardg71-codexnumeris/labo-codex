import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #350 — Codes algorithmiques sauvegardés mais mode « catégories d'erreurs » NON
// activé → le critère FR-algo affichait 0 erreur au lieu du nombre stocké (totalErreurs),
// ce qui gonflait la note recalculée (cas terrain : 76,6 → 88 %).
//
// Le correctif a DEUX volets :
//   1. Détection automatique (evaluation-chargement.js ~859-863) : si l'évaluation
//      porte des codes sauvegardés, on force le mode catégorisation à l'affichage,
//      même quand modalites.activerCategorisationErreurs === false.
//   2. Restauration / préservation de totalErreurs : calculerNoteAlgorithmiqueAvecCategories
//      (evaluation-calcul.js ~318-335) ré-écrit codes + mots + totalErreurs dans
//      donneesAlgorithmiques au lieu de laisser tomber totalErreurs à 0 ; et la
//      restauration (evaluation.js ~1372) relit `donnees.totalErreurs` à défaut de
//      `donnees.erreurs`.
//
// Cette sentinelle VERROUILLE l'invariant central : tant que des codes existent,
// totalErreurs reflète leur nombre (≠ 0). Si totalErreurs retombait à 0 alors que
// des codes sont présents, la note gonflerait — c'est précisément le bug.
//
// On charge evaluation-calcul.js dans un sandbox Node (faux DOM à registre d'ids +
// globaux injectés) et on exerce la VRAIE fonction exportée, plutôt que de tester
// une copie de la logique.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// ── Sandbox : faux document à registre d'éléments par id ──────────────────────
function faireFauxElement(valeurInitiale = '') {
    return {
        value: valeurInitiale,
        textContent: '',
        style: {},
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } }
    };
}

function chargerCalcul(elements, evaluationEnCours, dbStub) {
    const code = readFileSync(path.join(racine, 'js/evaluation-calcul.js'), 'utf8');

    const fauxDocument = {
        getElementById(id) { return elements[id] || null; },
        addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }
    };
    const fauxWindow = {};
    // #1137 (22 oct. 2026) : les registres de formules et d'énoncés disent leurs nombres par le module
    // des nombres affichés, chargé avant eux par index.html. Le VRAI, d'abord.
    new Function('window', '"use strict";\n' + readFileSync(path.join(racine, 'js/note-pourcentage.js'), 'utf8'))(fauxWindow);
    // genererRetroaction reste dans le résidu ; ici on stube pour ne pas crasher.
    fauxWindow.genererRetroaction = () => {};

    // #667 — le calcul lit désormais sa formule dans le registre. On charge le
    // VRAI registre dans le même faux window, pas un stub : un stub testerait
    // une formule inventée pour le test, alors que l'invariant #350 porte sur
    // ce que la vraie chaîne de calcul écrit dans donneesAlgorithmiques.
    const codeFormules = readFileSync(path.join(racine, 'js/evaluation-formules.js'), 'utf8');
    new Function('window', '"use strict";\n' + codeFormules)(fauxWindow);

    // #581 — même raison, même geste : la RÉTROACTION du critère vient
    // désormais du registre d'énoncés, comme la formule vient du registre de
    // formules depuis #667. Le VRAI registre, pas un stub : l'invariant #350
    // porte sur ce que la vraie chaîne écrit dans `donneesAlgorithmiques`, et
    // ce que la rétroaction dit en fait partie.
    const codeEnonces = readFileSync(path.join(racine, 'js/evaluation-enonces.js'), 'utf8');
    new Function('window', '"use strict";\n' + codeEnonces)(fauxWindow);

    // Globaux bare-access consommés par le module :
    //   evaluationEnCours (let global), db.getSync, cle(), console
    const cle = (k) => k; // identité : trimestre non pertinent pour cet invariant
    const noms = ['window', 'document', 'console', 'evaluationEnCours', 'db', 'cle', 'formaterNombre'];
    const valeurs = [fauxWindow, fauxDocument, console, evaluationEnCours, dbStub, cle, fauxWindow.formaterNombre];   // #1137

    const fn = new Function(...noms, '"use strict";\n' + code);
    fn(...valeurs);
    return fauxWindow;
}

// db stub minimal : catalogues vides → chemins non-nominaux dégradent proprement.
const dbVide = { getSync: (_k, parDefaut) => parDefaut };

describe('#350 · totalErreurs préservé quand des codes algorithmiques existent', () => {
    let elements, evaluationEnCours, win;

    beforeEach(() => {
        // Éléments DOM minimaux référencés par le bloc de préservation.
        elements = {
            'eval_categories_C1': faireFauxElement(''),
            'eval_mots_C1': faireFauxElement(''),
            'total_erreurs_C1': faireFauxElement(),
            'mots_formule_C1': faireFauxElement(),
            'note_algo_C1': faireFauxElement(),
            'pct_algo_C1': faireFauxElement(),
            'niveau_algo_C1': faireFauxElement(),
            'cat_dominante_C1': faireFauxElement()
        };
        evaluationEnCours = { criteres: {}, donneesAlgorithmiques: {} };
        win = null;
    });

    it('CAS DU BUG : codes saisis (mode simple, pas de mots) → totalErreurs = nb de codes, jamais 0', () => {
        // 5 codes d'erreurs sauvegardés. Mots vides (0) → on traverse le bloc de
        // préservation #110v3 (ligne 325-335), celui-là même qui doit conserver
        // totalErreurs plutôt que le laisser tomber à 0.
        elements['eval_categories_C1'].value = '1;4;6;1;4';
        elements['eval_mots_C1'].value = '';
        win = chargerCalcul(elements, evaluationEnCours, dbVide);

        win.calculerNoteAlgorithmiqueAvecCategories('C1', 30, 500, 'C1');

        const stock = evaluationEnCours.donneesAlgorithmiques['C1'];
        expect(stock).toBeDefined();
        // Invariant central : totalErreurs reflète les 5 codes — PAS 0.
        expect(stock.totalErreurs).toBe(5);
        expect(stock.totalErreurs).not.toBe(0);
        expect(stock.codes).toEqual(['1', '4', '6', '1', '4']);
        // L'affichage du résumé ne ment pas non plus.
        expect(elements['total_erreurs_C1'].textContent).toBe(5);
    });

    it('CAS DU BUG (variante) : codes ET mots présents → totalErreurs persiste au nombre de codes', () => {
        // Même intention, chemin nominal possible : peu importe la branche prise,
        // donneesAlgorithmiques.totalErreurs doit valoir le nombre de codes saisis.
        elements['eval_categories_C1'].value = '2;2;7';
        elements['eval_mots_C1'].value = '500';
        win = chargerCalcul(elements, evaluationEnCours, dbVide);

        win.calculerNoteAlgorithmiqueAvecCategories('C1', 30, 500, 'C1');

        const stock = evaluationEnCours.donneesAlgorithmiques['C1'];
        expect(stock).toBeDefined();
        expect(stock.totalErreurs).toBe(3);
        expect(stock.totalErreurs).not.toBe(0);
    });

    it('CAS TÉMOIN : aucun code saisi → totalErreurs = 0 (comportement légitime, pas un faux positif)', () => {
        // Sans code, totalErreurs DOIT valoir 0 : la sentinelle ne fige pas une
        // valeur arbitraire, elle suit fidèlement la présence de codes.
        elements['eval_categories_C1'].value = '';
        elements['eval_mots_C1'].value = '500';
        win = chargerCalcul(elements, evaluationEnCours, dbVide);

        win.calculerNoteAlgorithmiqueAvecCategories('C1', 30, 500, 'C1');

        const stock = evaluationEnCours.donneesAlgorithmiques['C1'];
        expect(stock).toBeDefined();
        expect(stock.totalErreurs).toBe(0);
        expect(stock.codes).toEqual([]);
    });
});

// ── Volet 1 du correctif : détection automatique du mode catégories ───────────
// Le bloc est inline dans le .map() HTML de evaluation-chargement.js (non extrait
// en fonction pure) → on verrouille sa PRÉSENCE par assertion de source. Sans lui,
// une éval à codes sauvegardés mais flag absent retomberait en mode simple (= le bug).
describe('#350 · détection automatique du mode catégorisation (volet 1)', () => {
    const srcChargement = readFileSync(path.join(racine, 'js/evaluation-chargement.js'), 'utf8');

    it('force le mode catégories quand des codes sont sauvegardés, même flag absent', () => {
        // La détection lit donneesAlgorithmiques[...].codes et relève categorisationActive.
        // #1034 — la détection lit d'abord le pivot `window` d'une évaluation en modification
        // (« Modifier » ne pose que lui), puis la liaison nue.
        expect(srcChargement).toMatch(/\(pivotModif \|\| evaluationEnCours\)\?\.donneesAlgorithmiques\?\.\[critere\.id\]\?\.codes/);
        expect(srcChargement).toContain('categorisationActive = true');
    });

    it('restaure totalErreurs en repli de erreurs (compat anciennes évals, volet 2)', () => {
        const srcEval = readFileSync(path.join(racine, 'js/evaluation.js'), 'utf8');
        // nbErreurs = donnees.erreurs ?? donnees.totalErreurs — sans ce repli,
        // une éval « mode catégories » (qui ne porte que totalErreurs) afficherait 0.
        expect(srcEval).toMatch(/donnees\.erreurs\s*!==\s*undefined\s*\?\s*donnees\.erreurs\s*:\s*donnees\.totalErreurs/);
    });
});
