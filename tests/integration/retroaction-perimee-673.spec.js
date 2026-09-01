import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #673 — UN CALCUL REDEVENU INAPPLICABLE N'EMPORTE QUE LE TEXTE DE LA MACHINE.
//
// LE DÉFAUT. Quand la saisie redevient incalculable (le nombre de mots effacé), les deux
// chemins de remise à zéro nettoient note, pourcentage et niveau — et laissent le div
// `comm_<critereId>` porter la rétroaction de la saisie PRÉCÉDENTE. L'écran dit « -- »,
// le div dit « Ta rédaction contient 7 erreurs… », et les trois collecteurs persistent
// CE texte. Une amorce se reconnaît ; un compte d'erreurs périmé est plausible.
//
// LA RÈGLE, tranchée par Grégoire le 1er septembre 2026 : n'effacer QUE ce que le code a
// lui-même écrit — le dernier texte engendré, ou l'une des trois amorces. Tout le reste
// est du texte de l'enseignant·e et ne se touche pas. C'est la discipline du script de
// réparation de la veille : correspondance EXACTE avec du contenu machine, jamais une
// ressemblance.
//
// ⚠ CE QUE CETTE SPEC DOIT MESURER, ET DANS CET ORDRE. Les deux moitiés de la règle
// comptent autant : « ça efface » sans « ça préserve » livrerait un nettoyeur qui
// détruit le texte de Grégoire, et le test serait vert.
//
// BREAK-TESTS (le rouge d'abord, sur la SOURCE EN MÉMOIRE, jamais sur le fichier de js/) :
//   1. retirer l'appel de nettoyage → « le texte engendré périmé est effacé » rougit seul ;
//      le cas « personnalisé » reste vert, ce qui prouve qu'il ne dépend pas du nettoyage.
//   2. rendre le nettoyage INCONDITIONNEL → « le commentaire personnalisé survit » rougit
//      seul. C'est LA mutation à tuer : c'est la faute que la règle interdit.
//   3. comparer par `includes` au lieu de l'égalité → « la phrase engendrée AUGMENTÉE à la
//      main survit » rougit seul. C'est le cas d'usage le plus réaliste : l'enseignant·e
//      garde la phrase de la machine et ajoute la sienne à la suite.
//   4. n'effacer que le div, sans vider `donneesAlgorithmiques[id].retroaction` → « la
//      rétroaction périmée quitte AUSSI donneesAlgorithmiques » rougit seul. C'est la
//      mutation qui distingue un nettoyage réel d'un nettoyage cosmétique.
//   5. retirer l'appel de `_resetAffichageAlgoCategories` → le cas CATÉGORIES rougit seul.
//   6. retirer l'export `estAmorceDeSaisie` de synthese-retroaction-data.js → le cas de
//      l'amorce rougit seul (le prédicat devient indisponible, donc rien n'est classé,
//      donc rien n'est effacé — le repli sûr, mais qui ne fait plus son travail).
//
// ⚠ LES SIX ONT ÉTÉ JOUÉES LE 1er SEPTEMBRE 2026, ET LA 5e A D'ABORD SURVÉCU.
// Le cas CATÉGORIES n'assertait alors que la moitié « préserve » : retirer l'appel ne
// faisait rougir personne. Une assertion vraie qui ne tue aucune mutation ne verrouille
// rien. C'est la SENTINELLE qui a été corrigée — la moitié « efface » ajoutée — pas le
// code. La 3e (`includes`) a fait mieux encore : elle a révélé le cas d'usage
// « je garde la phrase engendrée et j'ajoute la mienne à la suite », que personne
// n'avait prévu en posant la règle. Un break-test n'a pas seulement vérifié le code :
// il a instruit la spécification.

const MONTER = `() => {
    const trim = (typeof obtenirTrimestreId === 'function' && obtenirTrimestreId()) || '';
    const cleG = trim ? trim + '_grillesTemplates' : 'grillesTemplates';
    const cleE = trim ? trim + '_echellesTemplates' : 'echellesTemplates';

    const crit = (id, nom) => ({
        id, nom, type: 'algorithmique', ponderation: 20,
        facteurNormalisation: 500, description: 'Mode simple.'
    });

    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(cleG, [{
        id: 'GR_673', nom: 'Grille 673', dansBibliotheque: true,
        criteres: [
            crit('CR_MACHINE', 'Français écrit — texte machine'),
            crit('CR_PERSO',   'Français écrit — texte personnalisé'),
            crit('CR_AJOUT',   'Français écrit — la phrase engendrée AUGMENTÉE à la main'),
            crit('CR_AMORCE',  'Français écrit — amorce jamais calculée')
        ]
    }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(cleE, [{ id: 'ECH_IDME', nom: '0-IDME', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0,  max: 59 },
        { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100 }
    ] }]);

    // ⚠ NOM NU — un \`let\` de premier niveau ne crée aucune propriété sur window (#645).
    evaluationEnCours = {
        etudiantDA: 'DA-673', productionId: 'PROD-673',
        grilleId: 'GR_673', echelleId: 'ECH_IDME', cartoucheId: '',
        criteres: {}, donneesAlgorithmiques: {}, statutRemise: 'evalue'
    };

    const selE = document.getElementById('selectEchelle1');
    if (selE) selE.innerHTML = '<option value="ECH_IDME">0-IDME</option>';
    const selG = document.getElementById('selectGrille1');
    if (selG) selG.innerHTML = '<option value="GR_673">Grille 673</option>';

    afficherCriteresDepuisGrille('GR_673', 'ECH_IDME');

    const frapper = (id, erreurs, mots) => {
        document.getElementById('eval_erreurs_' + id).value = String(erreurs);
        document.getElementById('eval_mots_' + id).value = String(mots);
        document.getElementById('eval_erreurs_' + id)
            .dispatchEvent(new Event('input', { bubbles: true }));
    };

    // PREMIÈRE FRAPPE : les deux premiers critères reçoivent un vrai calcul.
    frapper('CR_MACHINE', 7, 460);
    frapper('CR_PERSO',   7, 460);
    frapper('CR_AJOUT',   7, 460);
    // CR_AMORCE n'est jamais calculé : son div garde l'amorce du gabarit.

    const engendre = (evaluationEnCours.donneesAlgorithmiques.CR_MACHINE || {}).retroaction || null;
    const divApresCalcul = document.getElementById('comm_CR_MACHINE').textContent;

    // L'enseignant·e réécrit le commentaire du second critère à la main.
    const TEXTE_PERSO = 'Reprends la conclusion : elle répète l’introduction.';
    document.getElementById('comm_CR_PERSO').textContent = TEXTE_PERSO;

    // CAS RÉEL, et le plus piégeux : elle GARDE la phrase engendrée et ajoute la sienne
    // à la suite. Le div CONTIENT alors le texte machine sans lui être égal. Une
    // comparaison relâchée (includes) détruirait l'ajout ; l'égalité l'épargne.
    const AJOUT = ' Continue comme ça, la progression est nette.';
    document.getElementById('comm_CR_AJOUT').textContent =
        document.getElementById('comm_CR_AJOUT').textContent + AJOUT;

    // SECONDE FRAPPE : le nombre de mots est effacé → le calcul redevient inapplicable.
    const viderMots = (id) => {
        document.getElementById('eval_mots_' + id).value = '';
        document.getElementById('eval_erreurs_' + id)
            .dispatchEvent(new Event('input', { bubbles: true }));
    };
    viderMots('CR_MACHINE');
    viderMots('CR_PERSO');
    viderMots('CR_AJOUT');
    viderMots('CR_AMORCE');

    const dom = (id) => { const e = document.getElementById(id); return e ? e.textContent : null; };
    return {
        engendre: engendre,
        divApresCalcul: divApresCalcul,
        textePerso: TEXTE_PERSO,
        divMachine: dom('comm_CR_MACHINE'),
        divPerso:   dom('comm_CR_PERSO'),
        divAjout:   dom('comm_CR_AJOUT'),
        ajout: AJOUT,
        divAmorce:  dom('comm_CR_AMORCE'),
        // ATTENTION — LE TEXTE PÉRIMÉ VIT À DEUX ENDROITS. Vider le div sans vider la
        // mémoire ne retire rien : la cascade du PDF (#672) prend la rétroaction de
        // donneesAlgorithmiques en repli dès que criteres[].retroaction est vide. Le
        // texte périmé reviendrait par la porte de derrière, et le test serait vert.
        // (Aucun accent grave ici : ce commentaire vit DANS un gabarit.)
        memoApresReset: (evaluationEnCours.donneesAlgorithmiques || {}).CR_MACHINE || null,
        // Témoin que la remise à zéro a bien eu lieu : l'écran ne montre plus de note.
        noteAffichee: dom('note_algo_CR_MACHINE')
    };
}`;

test('#673 · calcul inapplicable : le texte de la machine part, celui de l’enseignant·e reste', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const etat = await page.evaluate('(' + MONTER + ')()');
    console.log('#673 →', JSON.stringify(etat, null, 2));

    // ── TÉMOINS ──────────────────────────────────────────────────────────────
    // Sans eux, un vert ne distinguerait pas « la règle s'applique » de « rien n'a
    // jamais été calculé », ni de « la remise à zéro n'a pas eu lieu ».
    expect(etat.engendre, 'TÉMOIN : la première frappe a bien engendré une rétroaction')
        .toContain('Ta rédaction contient 7 erreurs de français pour 460 mots.');
    expect(etat.divApresCalcul, 'TÉMOIN : et cette rétroaction était bien dans le div avant la seconde frappe')
        .toContain('Ta rédaction contient 7 erreurs');
    expect(etat.noteAffichee, 'TÉMOIN : la seconde frappe a bien déclenché la remise à zéro')
        .toBe('--');

    // ── CE QUI EST JUGÉ — les deux moitiés de la règle ───────────────────────
    expect(etat.divMachine.trim(), 'le texte ENGENDRÉ devenu périmé est effacé : il ne doit pas partir en base')
        .toBe('');
    expect(etat.divPerso, 'le commentaire écrit à la main SURVIT — c’est la moitié qui protège le travail de l’enseignant·e')
        .toContain('Reprends la conclusion');
    expect(etat.divAjout, 'la phrase engendrée AUGMENTÉE à la main survit : elle CONTIENT le texte machine sans lui être égale')
        .toContain('Continue comme ça, la progression est nette.');
    expect(etat.divAmorce.trim(), 'une amorce jamais calculée est du texte machine, elle aussi effaçable')
        .toBe('');

    // La seconde moitié du même geste : le texte périmé ne doit plus être en mémoire
    // non plus, sinon la cascade du PDF le ressert en repli.
    expect(etat.memoApresReset, 'TÉMOIN : la mémoire du critère existe toujours après la remise à zéro')
        .not.toBe(null);
    expect(etat.memoApresReset.erreurs, 'TÉMOIN : et elle porte bien la nouvelle saisie')
        .toBe(7);
    expect(String(etat.memoApresReset.retroaction || ''), 'la rétroaction périmée quitte AUSSI donneesAlgorithmiques')
        .toBe('');
});

// ─────────────────────────────────────────────────────────────────────────────
// LE SECOND SITE D'APPEL — la remise à zéro du mode CATÉGORIES.
//
// La règle a deux points d'application : `_viderResultatAlgoSimple` (couvert par le cas
// ci-dessus) et `_resetAffichageAlgoCategories`. Ce second cas est le seul témoin de
// celui-ci : sans lui, retirer l'appel du mode catégories ne ferait rougir personne.
//
// ⚠ CE QUE LA MESURE A ÉCARTÉ, et qui vaut d'être dit. J'ai d'abord visé la branche
// `codeDominant === null` de `calculerNoteAlgorithmiqueAvecCategories`, qui écrase le div
// SANS CONDITION. Mesuré : `_trouverCodeDominant` ne rend `null` que sur une liste VIDE,
// et une liste vide donne `totalErreurs === 0`, déjà intercepté par la garde du dessus
// qui sort par `return`. **La branche est inatteignable.** Un test qui la viserait
// mesurerait du code mort ; l'écrasement inconditionnel n'a jamais détruit le texte de
// personne parce qu'il ne s'exécute pas.
//
// ⚠ Ce chemin n'existe QUE sur le rendu AVEC cartouche : `afficherCriteresDepuisGrille`
// n'a aucune branche catégories (mesuré au #672). Le décor passe donc par
// `cartoucheSelectionnee`, et la modalité globale reste au mode simple — c'est
// `donneesAlgorithmiques[id].codes` qui force les catégories sur ce critère seul.

const MONTER_CATEGORIES = `() => {
    const trim = (typeof obtenirTrimestreId === 'function' && obtenirTrimestreId()) || '';
    const k = (n) => trim ? trim + '_' + n : n;

    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(k('grillesTemplates'), [{
        id: 'GR_673C', nom: 'Grille 673 catégories', dansBibliotheque: true,
        criteres: ['CR_CAT', 'CR_CATM'].map((id) => ({
            id, nom: 'Français écrit détaillé ' + id, type: 'algorithmique',
            ponderation: 20, facteurNormalisation: 500, description: 'Mode catégories.',
            sousCriteres: [
                { code: '1', nom: 'Orthographe', ponderation: 1 },
                { code: '4', nom: 'Syntaxe', ponderation: 1 }
            ]
        }))
    }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('echellesTemplates'), [{ id: 'ECH_IDME', nom: '0-IDME', niveaux: [
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }
    ] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('cartouches_GR_673C'), [{ id: 'CART_673C', nom: 'Cartouche 673C',
        criteres: [{ id: 'CR_CAT' }, { id: 'CR_CATM' }],
        niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }]
    }]);
    db.setSync(k('modalitesEvaluation'), { activerCategorisationErreurs: false });

    evaluationEnCours = {
        etudiantDA: 'DA-673C', productionId: 'PROD-673C',
        grilleId: 'GR_673C', echelleId: 'ECH_IDME', cartoucheId: '',
        criteres: {},
        // Force le mode catégories sur les DEUX critères.
        donneesAlgorithmiques: { CR_CAT: { codes: ['1'] }, CR_CATM: { codes: ['1'] } },
        statutRemise: 'evalue'
    };

    const selE = document.getElementById('selectEchelle1');
    if (selE) selE.innerHTML = '<option value="ECH_IDME">0-IDME</option>';
    const remise = document.getElementById('remiseProduction1');
    if (remise) remise.innerHTML = '<option value="recu">Reçu</option>';
    const selC = document.getElementById('selectCartoucheEval');
    selC.innerHTML = '<option value="CART_673C">Cartouche 673C</option>';
    selC.value = 'CART_673C';
    cartoucheSelectionnee();

    if (!document.getElementById('eval_categories_CR_CAT') || !document.getElementById('eval_categories_CR_CATM')) {
        return { decorIncomplet: true };
    }

    const frapper = (id, codes, mots) => {
        document.getElementById('eval_categories_' + id).value = codes;
        document.getElementById('eval_mots_' + id).value = String(mots);
        document.getElementById('eval_categories_' + id)
            .dispatchEvent(new Event('input', { bubbles: true }));
    };

    // PREMIÈRE FRAPPE sur les DEUX : un vrai calcul, donc une rétroaction engendrée.
    frapper('CR_CAT',  '1;1;4', 460);
    frapper('CR_CATM', '1;1;4', 460);
    const engendre = (evaluationEnCours.donneesAlgorithmiques.CR_CATM || {}).retroaction || null;
    const divApresCalcul = document.getElementById('comm_CR_CATM').textContent;

    // L'enseignante remplace le texte du PREMIER par le sien. Le second garde le texte
    // de la machine — c'est lui qui prouve que la remise à zéro efface pour de vrai.
    const TEXTE_PERSO = 'Ton paragraphe de développement tient bien.';
    document.getElementById('comm_CR_CAT').textContent = TEXTE_PERSO;

    // SECONDE FRAPPE : le nombre de mots est effacé — passage par
    // _resetAffichageAlgoCategories, le second point d'application de la règle.
    frapper('CR_CAT',  '1;1;4', 0);
    frapper('CR_CATM', '1;1;4', 0);

    const dom = (id) => { const e = document.getElementById(id); return e ? e.textContent : null; };
    return {
        decorIncomplet: false,
        textePerso: TEXTE_PERSO,
        engendre: engendre,
        divApresCalcul: divApresCalcul,
        divPerso:   dom('comm_CR_CAT'),
        divMachine: dom('comm_CR_CATM'),
        memoMachine: (evaluationEnCours.donneesAlgorithmiques || {}).CR_CATM || null,
        noteAffichee: dom('note_algo_CR_CAT')
    };
}`;

test('#673 · mode catégories : la remise à zéro épargne le commentaire écrit à la main', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const etat = await page.evaluate('(' + MONTER_CATEGORIES + ')()');
    console.log('#673 catégories →', JSON.stringify(etat, null, 2));

    expect(etat.decorIncomplet, 'DÉCOR : l’interface catégories est bien rendue').toBe(false);
    expect(etat.engendre, 'TÉMOIN : la première frappe a bien engendré une rétroaction')
        .toContain('Ta rédaction contient 3 erreurs');
    expect(etat.divApresCalcul, 'TÉMOIN : et elle était bien dans le div avant la seconde frappe')
        .toContain('Ta rédaction contient 3 erreurs');
    expect(etat.noteAffichee, 'TÉMOIN : la seconde frappe a bien déclenché la remise à zéro').toBe('--');

    expect(etat.divPerso, 'le commentaire écrit à la main survit à la remise à zéro du mode catégories')
        .toContain('Ton paragraphe de développement tient bien.');
    // La moitié « efface » : sans elle, retirer l'appel du mode catégories ne ferait
    // rougir personne — mutation survivante, donc règle non verrouillée sur ce site.
    expect(String(etat.divMachine || '').trim(), 'et le texte ENGENDRÉ, lui, est bien effacé sur ce même chemin')
        .toBe('');
    expect(String((etat.memoMachine || {}).retroaction || ''), 'la rétroaction périmée quitte aussi la mémoire, en mode catégories')
        .toBe('');
});
