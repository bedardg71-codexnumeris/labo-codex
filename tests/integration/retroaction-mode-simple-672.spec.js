import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #672 — LE MODE SIMPLE N'ÉCRIT JAMAIS SA RÉTROACTION DANS LE DIV.
//
// LE DÉFAUT. `comm_<critereId>` est un `<div>` (evaluation-chargement.js:1028 et :1194).
// Le mode SIMPLE lui écrit `champCommentaire.value = …` (evaluation-calcul.js:630) :
// `.value` sur un `<div>` pose une propriété JS parasite et laisse `textContent` intact.
// Le mode CATÉGORIES écrit `commDiv.textContent = …` (evaluation-calcul.js:517 et :526)
// sur le MÊME élément. **C'est cette asymétrie que la spec mesure** : deux modes, un
// seul élément, un seul accès correct.
//
// CE QUE ÇA COÛTE. Trois collecteurs de sauvegarde lisent `commDiv.textContent`
// (`evaluation-chargement.js:1376`, `evaluation.js:1742`, `evaluation-sauvegarde.js:189`).
// En mode simple, ils persistent donc l'AMORCE du gabarit sous `criteres[].retroaction`,
// à chaque enregistrement. Le PDF remis à l'élève l'imprime — cette moitié-là du défaut
// est verrouillée par `tests/unit/sentinelle-672-retroaction-mode-simple.test.js`.
//
// POURQUOI WEBKIT ET PAS VITEST. Le banc Node n'a pas de DOM : ses éléments sont des
// objets écrits à la main, où `.value` et `textContent` sont indépendants PAR
// CONSTRUCTION DU STUB. Un test écrit là-bas serait vert ou rouge selon le stub, sans
// jamais toucher à la sémantique réelle d'un `<div>`. Seul un vrai moteur en juge.
//
// ⚠ CE QUE CETTE SPEC DOIT SAVOIR SUR `evaluationEnCours` (repris de #645) :
// `js/config.js:173` déclare `let evaluationEnCours`. Un `let` de premier niveau ne crée
// AUCUNE propriété sur `window` : le montage affecte le NOM NU, sinon le module de calcul
// ne voit rien. Le témoin d'état initial vérifie que ce décor a pris.
//
// BREAK-TESTS (le rouge d'abord, sur la SOURCE EN MÉMOIRE, jamais sur le fichier de js/) :
//   1. remettre `champCommentaire.value = retroactionGenerique` → « le div du mode simple
//      porte la rétroaction » rougit SEUL ; le témoin catégories reste vert, ce qui prouve
//      que la mesure sait voir une écriture correcte.
//   2. remplacer l'écriture du mode CATÉGORIES par `.value` → le témoin rougit, et c'est
//      lui qui interdit de conclure « la lecture de textContent ne marche pas ».

const MONTER = `() => {
    const trim = (typeof obtenirTrimestreId === 'function' && obtenirTrimestreId()) || '';
    const cleG = trim ? trim + '_grillesTemplates' : 'grillesTemplates';
    const cleE = trim ? trim + '_echellesTemplates' : 'echellesTemplates';
    const cleM = trim ? trim + '_modalitesEvaluation' : 'modalitesEvaluation';
    const cleC = trim ? trim + '_cartouches_GR_672' : 'cartouches_GR_672';

    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(cleG, [{
        id: 'GR_672', nom: 'Grille 672', dansBibliotheque: true,
        criteres: [
            {
                id: 'CR_SIMPLE', nom: 'Français écrit', type: 'algorithmique',
                ponderation: 20, facteurNormalisation: 500,
                description: 'Rendu en mode SIMPLE.'
            },
            {
                id: 'CR_CATEG', nom: 'Français écrit détaillé', type: 'algorithmique',
                ponderation: 20, facteurNormalisation: 500,
                description: 'Rendu en mode CATÉGORIES — le témoin de la mesure.',
                sousCriteres: [
                    { code: '1', nom: 'Orthographe', ponderation: 1 },
                    { code: '4', nom: 'Syntaxe', ponderation: 1 },
                    { code: '6', nom: 'Ponctuation', ponderation: 1 }
                ]
            }
        ]
    }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(cleE, [{ id: 'ECH_IDME', nom: '0-IDME (5 niveaux)', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0,  max: 59 },
        { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100 }
    ] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(cleC, [{ id: 'CART_672', nom: 'Cartouche 672',
        criteres: [{ id: 'CR_SIMPLE' }, { id: 'CR_CATEG' }],
        niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }]
    }]);
    // La modalité GLOBALE reste au mode simple : c'est elle qui décide du mode,
    // pas la présence de sous-critères sur le critère (evaluation-chargement.js:926).
    db.setSync(cleM, { activerCategorisationErreurs: false });

    // ⚠ NOM NU — voir l'en-tête.
    // \`donneesAlgorithmiques.CR_CATEG.codes\` force le mode CATÉGORIES pour CE critère
    // seul (détection automatique, evaluation-chargement.js:931) : c'est ce qui permet
    // d'avoir les DEUX modes dans un même rendu, donc de les comparer à décor égal.
    evaluationEnCours = {
        etudiantDA: 'DA-672', productionId: 'PROD-672',
        grilleId: 'GR_672', echelleId: 'ECH_IDME', cartoucheId: '',
        criteres: {},
        donneesAlgorithmiques: { CR_CATEG: { codes: ['1'] } },
        statutRemise: 'evalue'
    };

    const selE = document.getElementById('selectEchelle1');
    if (selE) selE.innerHTML = '<option value="ECH_IDME">0-IDME</option>';
    const remise = document.getElementById('remiseProduction1');
    if (remise) remise.innerHTML = '<option value="recu">Reçu</option>';
    const selC = document.getElementById('selectCartoucheEval');
    selC.innerHTML = '<option value="CART_672">Cartouche 672</option>';
    selC.value = 'CART_672';

    cartoucheSelectionnee();

    const present = (id) => !!document.getElementById(id);
    if (!present('eval_erreurs_CR_SIMPLE') || !present('eval_categories_CR_CATEG')) {
        return { decorIncomplet: {
            champSimple: present('eval_erreurs_CR_SIMPLE'),
            champCateg: present('eval_categories_CR_CATEG')
        } };
    }

    // Mode SIMPLE : 7 erreurs sur 460 mots.
    document.getElementById('eval_erreurs_CR_SIMPLE').value = '7';
    document.getElementById('eval_mots_CR_SIMPLE').value = '460';
    document.getElementById('eval_erreurs_CR_SIMPLE').dispatchEvent(new Event('input', { bubbles: true }));

    // Mode CATÉGORIES : trois codes sur 460 mots.
    document.getElementById('eval_categories_CR_CATEG').value = '1;4;6';
    document.getElementById('eval_mots_CR_CATEG').value = '460';
    document.getElementById('eval_categories_CR_CATEG').dispatchEvent(new Event('input', { bubbles: true }));

    const dom = (id) => { const e = document.getElementById(id); return e ? e.textContent : null; };
    const memo = (id) => (evaluationEnCours.donneesAlgorithmiques || {})[id] || null;
    return {
        decorIncomplet: null,
        // Le div, tel qu'un collecteur de sauvegarde le lit.
        divSimple:   dom('comm_CR_SIMPLE'),
        divCateg:    dom('comm_CR_CATEG'),
        // La rétroaction que le calcul a réellement produite, prise à sa source.
        memoSimple:  memo('CR_SIMPLE'),
        memoCateg:   memo('CR_CATEG'),
        // La balise du div : le fait qui explique tout le reste.
        baliseSimple: (document.getElementById('comm_CR_SIMPLE') || {}).tagName || null
    };
}`;

test('#672 · mode simple : le div de rétroaction porte la rétroaction, pas l’amorce de saisie', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const etat = await page.evaluate('(' + MONTER + ')()');
    console.log('#672 →', JSON.stringify(etat, null, 2));

    // Le décor AVANT les témoins : un rendu incomplet doit se dire comme tel,
    // et non se déguiser en défaut du code.
    expect(etat.decorIncomplet, 'DÉCOR : les deux interfaces sont rendues (simple ET catégories)')
        .toBe(null);

    // ── TÉMOINS ──────────────────────────────────────────────────────────────
    // Sans eux, un rouge ne distinguerait pas « le div n'est pas écrit » de
    // « le calcul n'a jamais tourné » ni de « la mesure ne sait pas lire un div ».
    expect(etat.baliseSimple, 'TÉMOIN : comm_<critereId> est bien un DIV — c’est ce qui rend `.value` inopérant')
        .toBe('DIV');
    expect(etat.memoSimple, 'TÉMOIN : le calcul du mode simple a tourné et a produit sa rétroaction')
        .toEqual(expect.objectContaining({ erreurs: 7, mots: 460 }));
    expect(etat.memoSimple.retroaction, 'TÉMOIN : et cette rétroaction est la bonne')
        .toContain('Ta rédaction contient 7 erreurs de français pour 460 mots.');
    expect(etat.divCateg, 'TÉMOIN : le mode CATÉGORIES écrit bien dans le même div — la mesure sait voir une écriture réussie')
        .toContain('Ta rédaction contient');

    // ── CE QUI EST JUGÉ ──────────────────────────────────────────────────────
    expect(etat.divSimple, 'l’élève ne doit jamais lire une consigne de saisie à la place de sa rétroaction')
        .not.toContain('Saisissez');
    expect(etat.divSimple, 'le div du mode simple porte la rétroaction calculée — c’est lui que les trois collecteurs persistent')
        .toContain('Ta rédaction contient 7 erreurs de français pour 460 mots.');
});
