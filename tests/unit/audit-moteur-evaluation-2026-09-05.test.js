/**
 * AUDIT DU MOTEUR D'ÉVALUATION — banc d'exécution des mesures (5 septembre 2026)
 *
 * Rapport : Rapports/AUDIT-moteur-evaluation-2026-09-05.md. Cadré par
 * Rapports/prompts-audit/PROMPT-AUDIT-moteur-evaluation-2026-09-05.md.
 *
 * Ce fichier ne juge pas et ne corrige rien : il charge les modules RÉELS de js/ dans le bac à
 * sable (patron des sentinelles #674, lot 2, lot 3), appelle les fonctions publiques telles
 * quelles, et FIGE ce qu'elles rendent au 5 septembre 2026 (HEAD 7a40949b, 1.120.0). Chaque
 * `it` porte une mesure du rapport (A1, B1…) ; les `expect` sont les valeurs OBTENUES, pas les
 * valeurs souhaitées — si l'un rougit, c'est que le comportement mesuré a changé, et le
 * constat correspondant du rapport est à remesurer.
 *
 * ↻ LE MÊME JOUR, 15 h 30 — Grégoire a arbitré : A-1 (#697), D-2 (#698) et G-2 (#699) sont
 * corrigés dans ce lot. Les mesures A1/A2/A5, D2/D3/D4 et G2/G3 portent désormais les valeurs
 * D'APRÈS, et la valeur d'avant en commentaire ; les sentinelles #697, #698, #699 tiennent le
 * comportement corrigé. Les autres mesures (B, C, D1, D5, E, F, H) sont inchangées : inscrites.
 *
 * Aucune donnée réelle lue ni écrite. Rien dans js/.
 */
import { describe, it, expect, afterAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const MESURES = {};
function noter(cle, valeur) { MESURES[cle] = valeur; return valeur; }
afterAll(() => { console.log('AUDIT-MESURES ' + JSON.stringify(MESURES, null, 1)); });

function classList(initial) {
    const s = new Set(initial || []);
    return {
        add(c) { s.add(c); }, remove(c) { s.delete(c); },
        contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; }
    };
}
function elementDom(init) {
    return Object.assign({
        value: '', textContent: '', innerHTML: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {},
        dispatchEvent() { return true; }
    }, init || {});
}
// Miroir de la règle unique de `js/echelles.js` (#525/#527).
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

// Échelle à bornes ENTIÈRES — la forme des quatre échelles par défaut de `echelles.js`
// (l. 3036-3039 : 0-59, 60-74, 75-89, 90-100). Les valeurs ponctuelles sont choisies pour
// que deux critères à 50/50 tombent dans les TROUS : E+I = 74,5 ; E+M = 89,5 ; D+I = 59,5.
const ECHELLE = { id: 'E1', nom: 'IDME témoin', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 54, couleur: '#a00' },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#a80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 84, couleur: '#0a0' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#00a' }
] };
// L'échelle des sentinelles #674 (I 40 · D 65 · M 82 · E 95), pour les mesures d'arrondi.
const ECHELLE_674 = { id: 'E1', nom: 'IDME 674', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
] };
const GRILLE_50_50 = { id: 'G2', nom: 'Grille 50/50', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 50 }, { id: 'c2', nom: 'Langue', ponderation: 50 } ] };
const GRILLE_50_30_20 = { id: 'G1', nom: 'Grille 50/30/20', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 50 }, { id: 'c2', nom: 'Organisation', ponderation: 30 }, { id: 'c3', nom: 'Langue', ponderation: 20 } ] };
const GRILLE_50_30 = { id: 'G3', nom: 'Grille 50/30 (somme 80)', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 50 }, { id: 'c2', nom: 'Langue', ponderation: 30 } ] };
const GRILLE_ALGO = { id: 'GA', nom: 'Contenu 80 · Français 20', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 },
    { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', sousCriteres: [
        { id: 'SC1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' },
        { id: 'SC4', code: '4', nom: 'Accord GN', ponderation: 1.5, retroaction: '' } ] } ] };
// Le même critère algorithmique, en mode SIMPLE (sans sous-critère) : `_forcerRecalculAlgorithmiqueAvantSauvegarde`
// choisit le mode par la présence de sous-critères, et le banc rend les deux jeux de champs.
const GRILLE_ALGO_SIMPLE = { id: 'GS', nom: 'Contenu 80 · Français 20 (simple)', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 },
    { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' } ] };
// Lot 1 : le type déclaré à la grille, un critère SANS type écrit (d'avant le chantier).
const GRILLE_DECLAREE_ANALYTIQUE = { id: 'GD', nom: 'Déclarée analytique', type: 'analytique', criteres: [
    { id: 'k', nom: 'Rédaction', ponderation: 30 },
    { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique' } ] };

function champsAlgo(id) {
    const e = {};
    ['eval_erreurs_', 'eval_mots_', 'eval_categories_', 'total_erreurs_', 'mots_formule_', 'total_erreurs_simple_',
     'mots_simple_', 'note_algo_', 'pct_algo_', 'niveau_algo_', 'cat_dominante_', 'formule_algo_', 'resultat_algo_',
     'retroaction_cat_', 'comm_', 'eval_', 'eval_pts_'].forEach((p) => { e[p + id] = elementDom(); });
    return e;
}
function ecranCalcul(echelleId) {
    return { noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }), selectEchelle1: elementDom({ value: echelleId }) };
}
function documentDe(ecran) {
    return { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
}
function baseDe({ grille, echelles, evaluations = [] }) {
    const base = { test_grillesTemplates: [grille], test_echellesTemplates: echelles, test_pratiquesConfigurables: [], test_evaluationsSauvegardees: evaluations };
    base['test_cartouches_' + grille.id] = [];
    return base;
}
function dbDe(base) {
    return { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} };
}
function ecDe(grille, { criteres = {}, points = {}, algo = {}, echelleId = 'E1', idModification } = {}) {
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId, cartoucheId: '',
        criteres: Object.assign({}, criteres), donneesAlgorithmiques: JSON.parse(JSON.stringify(algo)), pointsAnalytiques: Object.assign({}, points) };
    if (idModification) ec.idModification = idModification;
    return ec;
}

/** Bac à sable « moteur seul » : les trois registres (formules, énoncés, projection) + le calcul. */
function monterMoteur({ grille, echelles = [ECHELLE], echelleId = 'E1', ec, ecranExtra = {} }) {
    const ecran = Object.assign(ecranCalcul(echelleId), ecranExtra);
    const base = baseDe({ grille, echelles });
    const win = { addEventListener() {}, removeEventListener() {}, genererRetroaction() {} };
    const globaux = { document: documentDe(ecran), evaluationEnCours: ec, db: dbDe(base), cle: (k) => 'test_' + k,
        valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s) };
    chargerScript('js/evaluation-formules.js', globaux, win);
    chargerScript('js/evaluation-enonces.js', globaux, win);
    chargerScript('js/evaluation-projection.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    return { win, ecran, ec, base };
}

function ecranChaine(grille) {
    const e = Object.assign(ecranCalcul('E1'), {
        selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }),
        selectGrille1: elementDom({ value: grille.id }), selectCartoucheEval: elementDom({ value: '' }),
        remiseProduction1: elementDom({ value: 'remis' }), statutIntegrite: elementDom({ value: 'recevable' }),
        notesIntegrite: elementDom({ value: '' }), retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(),
        afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        contenuRetroBilan: elementDom(), vueRetroGenerale: elementDom(), vueRetroSpecifique: elementDom(), vueRetroBilan: elementDom()
    });
    grille.criteres.forEach((c) => Object.assign(e, champsAlgo(c.id)));
    return e;
}

/**
 * Bac à sable « chaîne complète » : calcul + palette/auto-save (chargement) + enregistrement
 * (sauvegarde) + modification (evaluation.js), et le bilan sur demande. `nu` est ce que le
 * nom nu `evaluationEnCours` désigne (le `let` de config.js) ; `fenetre` est
 * `window.evaluationEnCours`. Les deux sont le MÊME objet sauf quand le banc reproduit #646.
 */
function monterChaine({ grille, echelles = [ECHELLE], nu, fenetre = null, evaluations = [], retro = false }) {
    const ecran = ecranChaine(grille);
    const base = baseDe({ grille, echelles, evaluations });
    const ecritures = [], refus = [], succes = [], minuteries = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: fenetre || nu, majBadgesApresEvaluation() {}, genererRetroaction() {} };
    const globaux = {
        document: documentDe(ecran), evaluationEnCours: nu, db: dbDe(base), cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau,
        echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }]
            : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }]
            : k === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(base.test_evaluationsSauvegardees)) : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes(m) { succes.push(m); }, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: (fn) => { minuteries.push(fn); return minuteries.length; }, clearTimeout() {},
        genererRetroaction() {}, calculerNote: () => win.calculerNote(), mettreAJourCompteurMots() {},
        niveauDuCodeDansEchelle: (code) => ({ I: { code: 'I', nom: 'Insuffisant', rang: 0 }, D: { code: 'D', nom: 'En développement', rang: 1 },
            M: { code: 'M', nom: 'Maîtrisé', rang: 2 }, E: { code: 'E', nom: 'Étendu', rang: 3 } })[code] || null,
        zoneDuNiveau: (code) => (code === 'I' || code === 'D') ? 'priorite' : (code === 'M' || code === 'E') ? 'acquis' : null
    };
    chargerScript('js/evaluation-formules.js', globaux, win);
    chargerScript('js/evaluation-enonces.js', globaux, win);
    chargerScript('js/evaluation-projection.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-chargement.js', globaux, win);
    chargerScript('js/evaluation-sauvegarde.js', globaux, win);
    chargerScript('js/evaluation.js', globaux, win);
    // #940 — le bilan lit sa règle (ligne d'un critère, récurrences, historique) dans le vrai module.
    if (retro) chargerScript('js/synthese-retroaction-data.js', globaux, win);
    if (retro) chargerScript('js/evaluation-retroaction.js', globaux, win);
    return { win, ecran, ecritures, refus, succes, minuteries, base };
}
function derniereEcriture(ecritures, id) {
    const e = ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop();
    if (!e) return null;
    return e.v.find((ev) => ev.id === id) || null;
}
const EV1 = (grille, extra) => Object.assign({ id: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId: 'E1',
    noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: false,
    criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
        { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 },
        { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', ponderation: 20 }] }, extra || {});

/* ======================================================================================
   A · LES SITES D'ÉCRITURE — une échelle non résolue
   ====================================================================================== */
describe('A · sites d\'écriture — l\'échelle de l\'évaluation n\'est pas dans echellesTemplates', () => {
    it('A1 · CRÉATION sur une échelle absente — ↻ corrigé #697 : refus nommé, rien d\'écrit (avant : « 0 » verrouillé, sans portée, aucun refus)', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' } });
        const { win, ecran, ecritures, refus } = monterChaine({ grille: GRILLE_50_30_20, echelles: [], nu });
        win.sauvegarderEvaluation();
        const ecrit = derniereEcriture(ecritures, 'EVAL_NEUF');
        noter('A1', { refus: refus.map((r) => r.titre), ecranNote: ecran.noteProduction1.textContent,
            noteCalculee: win.noteCalculeeCourante, portee: win.porteeCalculeeCourante,
            ecrit: ecrit && { noteFinale: ecrit.noteFinale, ponderationCouverte: ecrit.ponderationCouverte, niveauFinal: ecrit.niveauFinal, verrouillee: ecrit.verrouillee, echelleId: ecrit.echelleId } });
        expect(win.noteCalculeeCourante).toBeNull();
        expect(win.porteeCalculeeCourante).toBeNull();
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);   // avant #697 : []
        expect(ecrit).toBeNull();                                              // avant #697 : { noteFinale: 0, ponderationCouverte: null, niveauFinal: '--', verrouillee: true }
    });
    it('A2 · MODIFICATION d\'une évaluation à 84 sur une échelle disparue — ↻ corrigé #697 : refus nommé, l\'existante n\'est pas touchée (avant : réécrite à 0, verrouillée)', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' }, idModification: 'EV1' });
        const { win, ecritures, refus } = monterChaine({ grille: GRILLE_50_30_20, echelles: [], nu, evaluations: [EV1(GRILLE_50_30_20)] });
        win.sauvegarderEvaluationModifiee();
        const ecrit = derniereEcriture(ecritures, 'EV1');
        noter('A2', { refus: refus.map((r) => r.titre), ecrit: ecrit && { noteFinale: ecrit.noteFinale, ponderationCouverte: ecrit.ponderationCouverte, niveauFinal: ecrit.niveauFinal, verrouillee: ecrit.verrouillee } });
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);   // avant #697 : []
        expect(ecritures).toHaveLength(0);                                     // avant #697 : EV1 réécrite { noteFinale: 0, ponderationCouverte: null, verrouillee: true }
    });
    it('A3 · témoin — la même évaluation avec son échelle : 84 écrit, portée 100, aucun refus', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' } });
        const { win, ecritures, refus } = monterChaine({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], nu });
        win.sauvegarderEvaluation();
        const ecrit = derniereEcriture(ecritures, 'EVAL_NEUF');
        expect(refus).toHaveLength(0);
        expect(ecrit).toMatchObject({ noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: true });
    });
    it('A5 · AUTO-SAVE (création) sur une échelle absente — ↻ corrigé #697 : rien n\'est créé (avant : « 0 », portée nulle, non verrouillé, que SOM lisait — H2)', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E' } });
        const { win, ecran, ecritures, minuteries } = monterChaine({ grille: GRILLE_50_30_20, echelles: [], nu });
        ecran.eval_c3.value = 'I';
        win.niveauSelectionne('c3');
        minuteries[0]();
        const ecrit = derniereEcriture(ecritures, 'EVAL_NEUF');
        noter('A5', { ecrit: ecrit && { noteFinale: ecrit.noteFinale, ponderationCouverte: ecrit.ponderationCouverte, niveauFinal: ecrit.niveauFinal, verrouillee: ecrit.verrouillee, nbCriteres: ecrit.criteres.length } });
        expect(ecrit).toBeNull();   // avant #697 : { noteFinale: 0, ponderationCouverte: null, niveauFinal: '--', verrouillee: false }, 3 critères
    });
    it('A4 · le contexte : la liste des évaluations affiche « - » pour une note à 0 (liste-evaluations.js:946)', () => {
        // Reproduction littérale de l'expression de la liste, pour dire ce que l'enseignant·e VERRAIT.
        const afficher = (noteFinale) => noteFinale != null && noteFinale !== 0 ? `${(Math.round(noteFinale * 10) / 10)}%` : '-';
        noter('A4', { pourZero: afficher(0), pour84: afficher(84) });
        expect(afficher(0)).toBe('-');
    });
});

/* ======================================================================================
   B · LA RÉSOLUTION DE L'ÉCHELLE — les trous entre bornes entières
   ====================================================================================== */
describe('B · l\'échelle — un pourcentage qui tombe entre deux bornes entières', () => {
    function niveauGlobalPour(niveaux) {
        const ec = ecDe(GRILLE_50_50, { criteres: niveaux });
        const { win, ecran } = monterMoteur({ grille: GRILLE_50_50, ec });
        win.calculerNote();
        return { note: ecran.noteProduction1.textContent, niveau: ecran.niveauProduction1.textContent, brut: win.noteCalculeeCourante };
    }
    it('B1 · le NIVEAU GLOBAL : 74,5 → M (M commence à 75), 89,5 → E, 59,5 → D — ↻ #701 : mêmes niveaux, mais par l\'ARRONDI à l\'entier (75, 90, 60), plus par le repli « le plus proche »', () => {
        const r = noter('B1', { '74.5': niveauGlobalPour({ c1: 'E', c2: 'I' }), '89.5': niveauGlobalPour({ c1: 'E', c2: 'M' }), '59.5': niveauGlobalPour({ c1: 'D', c2: 'I' }) });
        expect(r['74.5']).toMatchObject({ note: '74,5\u00A0%', niveau: 'M' });
        expect(r['89.5']).toMatchObject({ note: '89,5\u00A0%', niveau: 'E' });
        expect(r['59.5']).toMatchObject({ note: '59,5\u00A0%', niveau: 'D' });
    });
    it('B2 · le même 74,5 % sur un critère ALGORITHMIQUE — ↻ corrigé #701/#702 : M, comme le niveau global (avant : « -- », et « -- » entrait dans evaluationEnCours.criteres)', () => {
        const ec = ecDe(GRILLE_ALGO, { criteres: { c1: 'M' } });
        const { win, ecran } = monterMoteur({ grille: GRILLE_ALGO, ec, ecranExtra: champsAlgo('a1') });
        ecran.eval_erreurs_a1.value = '51'; ecran.eval_mots_a1.value = '5000';   // 20 − 51/5000×500 = 14,9 → 74,5 %
        win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        noter('B2', { niveauAlgo: ecran.niveau_algo_a1.textContent, pctAlgo: ecran.pct_algo_a1.textContent, critereEnCours: ec.criteres.a1,
            noteGlobale: ecran.noteProduction1.textContent, niveauGlobal: ecran.niveauProduction1.textContent, ligneACopier: ecran.criteresCopier.textContent });
        expect(ecran.pct_algo_a1.textContent).toBe('74.5');
        expect(ecran.niveau_algo_a1.textContent).toBe('M');      // avant #701 : '--'
        expect(ec.criteres.a1).toBe('M');                        // avant #702 : '--', que les collecteurs écrivaient en base (`if (niveau)` : « -- » est vrai)
        expect(ecran.noteProduction1.textContent).toBe('82,1\u00A0%'); // 0,8×84 + 0,2×74,5 — le critère COMPTE, par son pourcentage exact : l'arrondi ne touche pas la note
        expect(ecran.criteresCopier.textContent).toBe('M\tM');   // avant : 'M\t--'
    });
    it('B3 · le même 74,5 % sur un critère ANALYTIQUE — ↻ corrigé #701 : M, une seule règle pour les trois chemins (avant : undefined, trois règles pour un trou)', () => {
        const { win } = monterMoteur({ grille: GRILLE_50_50, ec: ecDe(GRILLE_50_50) });
        const r = noter('B3', { deduit: win.niveauDeduitDesPoints({ id: 'k', ponderation: 30, type: 'analytique' }, 22.35, ECHELLE.niveaux) });
        expect(r.deduit).toBe('M');   // avant #701 : undefined
    });
    it('B5 · l\'ENREGISTREMENT du critère algorithmique à 74,5 % — ↻ corrigé #702 : niveauSelectionne M (avant : « -- » en base), et la note compte toujours 82,1', () => {
        const nu = ecDe(GRILLE_ALGO_SIMPLE, { criteres: { c1: 'M' } });
        const { win, ecran, ecritures, refus } = monterChaine({ grille: GRILLE_ALGO_SIMPLE, nu });
        ecran.eval_erreurs_a1.value = '51'; ecran.eval_mots_a1.value = '5000';
        win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        win.sauvegarderEvaluation();
        const ecrit = derniereEcriture(ecritures, 'EVAL_NEUF');
        const r = noter('B5', { refus: refus.map((x) => x.titre), noteFinale: ecrit && ecrit.noteFinale, niveauFinal: ecrit && ecrit.niveauFinal,
            a1: ecrit && ecrit.criteres.find((c) => c.critereId === 'a1'), algo: ecrit && ecrit.donneesAlgorithmiques.a1 });
        expect(refus).toHaveLength(0);
        expect(r.a1).toMatchObject({ niveauSelectionne: 'M', ponderation: 20 });   // avant #702 : '--'
        expect(r.algo.niveau).toBe('M');                                           // avant #702 : '--'
        expect(r.algo.pourcentage).toBeCloseTo(74.5, 10);   // stocké 74.49999999999999 : le bruit flottant de 20 − 51/5000×500 voyage en base
        expect(r.noteFinale).toBeCloseTo(82.1, 10);
        expect(r.niveauFinal).toBe('M');
    });
    it('B4 · témoin — un pourcentage DANS une plage : 89,0 → M, 90,0 → E (aucun repli)', () => {
        const echelle = JSON.parse(JSON.stringify(ECHELLE)); echelle.niveaux[2].valeurCalcul = 83; // E+M = 89,0
        const ec = ecDe(GRILLE_50_50, { criteres: { c1: 'E', c2: 'M' } });
        const { win, ecran } = monterMoteur({ grille: GRILLE_50_50, echelles: [echelle], ec });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('89\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('M');
    });
});

/* ======================================================================================
   C · LES TROIS TYPES — le type déclaré à la grille n'est pas lu par le calcul
   ====================================================================================== */
describe('C · les types — grille DÉCLARÉE analytique, critère sans type écrit', () => {
    it('C1 · les points saisis sur le critère sans type sont IGNORÉS : hors note « sans-niveau », note retenue', () => {
        const ec = ecDe(GRILLE_DECLAREE_ANALYTIQUE, { criteres: { c1: 'M' }, points: { k: 24 } });
        const { win, ecran } = monterMoteur({ grille: GRILLE_DECLAREE_ANALYTIQUE, ec });
        win.calculerNote();
        const r = noter('C1', { note: ecran.noteProduction1.textContent, hors: win.porteeCalculeeCourante.criteresHorsNote, portee: ecran.porteeNote1.textContent });
        expect(r.note).toBe('--');
        expect(r.hors).toEqual([{ critereId: 'k', nom: 'Rédaction', ponderation: 30, motif: 'sans-niveau', niveau: '' }]);
    });
    it('C2 · avec un niveau au menu, le même critère compte comme HOLISTIQUE (84 = M), pas par ses points (80)', () => {
        const ec = ecDe(GRILLE_DECLAREE_ANALYTIQUE, { criteres: { c1: 'M', k: 'M' }, points: { k: 24 } });
        const { win, ecran } = monterMoteur({ grille: GRILLE_DECLAREE_ANALYTIQUE, ec });
        win.calculerNote();
        const r = noter('C2', { note: ecran.noteProduction1.textContent, brut: win.noteCalculeeCourante });
        expect(r.brut).toBe(84);           // 0,7×84 + 0,3×84 ; avec les points ce serait 0,7×84 + 0,3×80 = 82,8
    });
    it('C3 · témoin — le même critère AVEC `type: analytique` écrit compte ses points : 82,8', () => {
        const grille = JSON.parse(JSON.stringify(GRILLE_DECLAREE_ANALYTIQUE)); grille.criteres[0].type = 'analytique';
        const ec = ecDe(grille, { criteres: { c1: 'M' }, points: { k: 24 } });
        const { win } = monterMoteur({ grille, ec });
        win.calculerNote();
        expect(win.noteCalculeeCourante).toBeCloseTo(82.8, 10);
        expect(ec.criteres.k).toBe('M');   // lot 3 : 80 % → M, niveau déduit
    });
});

/* ======================================================================================
   D · LE CRITÈRE ALGORITHMIQUE
   ====================================================================================== */
describe('D · le critère algorithmique — copie sans code, codes effacés, mots effacés', () => {
    function monterAlgo() {
        const ec = ecDe(GRILLE_ALGO, { criteres: { c1: 'M' } });
        return Object.assign(monterMoteur({ grille: GRILLE_ALGO, ec, ecranExtra: champsAlgo('a1') }), { ec });
    }
    it('D1 · copie sans aucun code (500 mots) — ↻ corrigé #704 : mode CATÉGORIES 100 % (E) comme le mode SIMPLE (avant : critère sans niveau, note retenue)', () => {
        const cat = monterAlgo();
        cat.ecran.eval_categories_a1.value = ''; cat.ecran.eval_mots_a1.value = '500';
        cat.win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1');
        cat.win.calculerNote();
        const simple = monterAlgo();
        simple.ecran.eval_erreurs_a1.value = '0'; simple.ecran.eval_mots_a1.value = '500';
        simple.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        const r = noter('D1', {
            categories: { niveauAlgo: cat.ecran.niveau_algo_a1.textContent, critere: cat.ec.criteres.a1, note: cat.ecran.noteProduction1.textContent, hors: cat.win.porteeCalculeeCourante.criteresHorsNote.map((c) => c.critereId + ':' + c.motif) },
            simple: { niveauAlgo: simple.ecran.niveau_algo_a1.textContent, pct: simple.ecran.pct_algo_a1.textContent, note: simple.ecran.noteProduction1.textContent }
        });
        expect(r.categories.note).toBe('87,2\u00A0%');   // avant #704 : '--'
        expect(r.categories.hors).toEqual([]);      // avant #704 : ['a1:sans-niveau']
        expect(r.categories.niveauAlgo).toBe('E');
        expect(r.simple).toEqual({ niveauAlgo: 'E', pct: '100.0', note: '87,2\u00A0%' });   // 0,8×84 + 0,2×100
    });
    it('D2 · mode CATÉGORIES : les codes « 1;4 » donnent 87,5 % ; EFFACÉS — ↻ #698 puis #704 : un résultat NEUF, aucune erreur = 100 % (E), 87,2 % (avant #698 : 87,5 et M restaient ; entre #698 et #704 : sans niveau, note retenue)', () => {
        const { win, ecran, ec } = monterAlgo();
        ecran.eval_categories_a1.value = '1;4'; ecran.eval_mots_a1.value = '500';
        win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1');
        const avant = { pct: ec.donneesAlgorithmiques.a1.pourcentage, critere: ec.criteres.a1, note: ecran.noteProduction1.textContent, niveauAlgo: ecran.niveau_algo_a1.textContent };
        ecran.eval_categories_a1.value = '';
        win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1');
        const apresReset = { pct: ec.donneesAlgorithmiques.a1.pourcentage, critere: ec.criteres.a1, niveauAlgo: ecran.niveau_algo_a1.textContent, codes: ec.donneesAlgorithmiques.a1.codes };
        win.calculerNote();   // n'importe quel geste qui recalcule ensuite (un autre critère, l'enregistrement…)
        const r = noter('D2', { avant, apresReset, noteApres: ecran.noteProduction1.textContent, porteeApres: win.porteeCalculeeCourante.ponderationCouverte });
        expect(avant).toMatchObject({ pct: 87.5, critere: 'M', note: '84,7\u00A0%' });   // 0,8×84 + 0,2×87,5
        expect(apresReset).toEqual({ pct: 100, critere: 'E', niveauAlgo: 'E', codes: [] });   // avant #698 : pct 87.5, critere 'M' ; avant #704 : undefined, undefined, '--'
        expect(r.noteApres).toBe('87,2\u00A0%');   // avant #698 : '84.7 %' ; avant #704 : '--'
        expect(r.porteeApres).toBe(100);      // avant #704 : 80
    });
    it('D3 · mode SIMPLE : 4 erreurs / 500 mots = 80 % ; le nombre de mots EFFACÉ — ↻ corrigé #698 : le résultat part et la note se retient (avant : 80 et M restaient, 83,2 % inchangé)', () => {
        const { win, ecran, ec } = monterAlgo();
        ecran.eval_erreurs_a1.value = '4'; ecran.eval_mots_a1.value = '500';
        win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        const avant = { pct: ec.donneesAlgorithmiques.a1.pourcentage, note: ecran.noteProduction1.textContent };
        ecran.eval_mots_a1.value = '';
        win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        const apres = { pct: ec.donneesAlgorithmiques.a1.pourcentage, mots: ec.donneesAlgorithmiques.a1.mots, critere: ec.criteres.a1, niveauAlgo: ecran.niveau_algo_a1.textContent };
        win.calculerNote();
        const r = noter('D3', { avant, apres, noteApres: ecran.noteProduction1.textContent });
        expect(avant).toEqual({ pct: 80, note: '83,2\u00A0%' });
        expect(apres).toEqual({ pct: undefined, mots: 0, critere: undefined, niveauAlgo: '--' });   // avant #698 : pct 80, critere 'M'
        expect(r.noteApres).toBe('--');   // avant #698 : '83.2 %'
    });
    it('D4 · l\'ENREGISTREMENT après effacement des codes — ↻ #698 puis #704 : copie sans faute, enregistrée à 87,2 sur 100 % (avant #698 : 84,7 persisté avec 87,5 en mémoire ; avant #704 : refus « incomplète »)', () => {
        const nu = ecDe(GRILLE_ALGO, { criteres: { c1: 'M' } });
        const { win, ecran, ecritures, refus } = monterChaine({ grille: GRILLE_ALGO, nu });
        ecran.eval_categories_a1.value = '1;4'; ecran.eval_mots_a1.value = '500';
        win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1');
        ecran.eval_categories_a1.value = '';
        win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1');
        win.sauvegarderEvaluation();
        const ecrit = derniereEcriture(ecritures, 'EVAL_NEUF');
        const r = noter('D4', { refus: refus.map((x) => x.titre), noteFinale: ecrit && ecrit.noteFinale, ponderationCouverte: ecrit && ecrit.ponderationCouverte,
            a1: ecrit && ecrit.criteres.find((c) => c.critereId === 'a1'), algo: ecrit && ecrit.donneesAlgorithmiques.a1 });
        expect(refus.map((x) => x.titre)).toEqual([]);                           // avant #704 : ['Évaluation incomplète']
        expect(ecrit).toMatchObject({ ponderationCouverte: 100, verrouillee: true });
        expect(ecrit.noteFinale).toBeCloseTo(87.2, 10);                          // 0,8×84 + 0,2×100 ; avant #698 : 84.7 périmé
        expect(r.a1).toMatchObject({ niveauSelectionne: 'E' });                  // avant #698 : 'M' périmé ; avant #704 : absent
        expect(r.algo).toMatchObject({ codes: [], mots: 500, totalErreurs: 0, pourcentage: 100, noteCalculee: 20, niveau: 'E' });   // rien des 87.5 / 17.5 / 'M' d'avant
    });
    it('D5 · le facteur de normalisation par DÉFAUT est 500 dans les trois sources du code (registre, palette, recalcul avant sauvegarde)', () => {
        const { win } = monterMoteur({ grille: GRILLE_ALGO, ec: ecDe(GRILLE_ALGO) });
        const r = noter('D5', { registre: win.formulesAlgo.normaliser({}).params.facteurNormalisation });
        expect(r.registre).toBe(500);
    });
});

/* ======================================================================================
   E · PONDÉRATION ET PORTÉE
   ====================================================================================== */
describe('E · pondération et portée', () => {
    it('E1 · grille dont la somme fait 80 (#483 ouvert) : la note est ramenée à 100 et la portée se dit COMPLÈTE (80 sur 80)', () => {
        const ec = ecDe(GRILLE_50_30, { criteres: { c1: 'E', c2: 'I' } });
        const { win, ecran } = monterMoteur({ grille: GRILLE_50_30, ec });
        win.calculerNote();
        const r = noter('E1', { note: ecran.noteProduction1.textContent, brut: win.noteCalculeeCourante, portee: { couverte: win.porteeCalculeeCourante.ponderationCouverte, grille: win.porteeCalculeeCourante.ponderationGrille, incomplete: win.porteeCalculeeCourante.incomplete } });
        expect(r.brut).toBeCloseTo((0.5 * 95 + 0.3 * 54) / 0.8, 10);   // 79,625
        expect(r.portee).toEqual({ couverte: 80, grille: 80, incomplete: false });
    });
    it('E2 · grille RÉÉDITÉE après coup (un 4e critère ajouté) — ↻ corrigé #705 : les TROIS cas concluent, l\'évaluation se juge contre les critères qu\'elle portait, et c4 est rendu à part comme « non couvert » (avant : incomplète sans déclaration, et incomplète à 100 sur 110)', () => {
        const { win } = monterMoteur({ grille: GRILLE_50_30_20, ec: ecDe(GRILLE_50_30_20) });
        const grilleReeditee = { id: 'G1', criteres: GRILLE_50_30_20.criteres.map((c) => Object.assign({}, c, { ponderation: { c1: 40, c2: 30, c3: 20 }[c.id] })).concat([{ id: 'c4', nom: 'Sources', ponderation: 10 }]) };
        const sansDeclaration = EV1(GRILLE_50_30_20); delete sansDeclaration.ponderationCouverte;
        const p1 = win.porteeDepuisEvaluation(sansDeclaration, grilleReeditee, ECHELLE_674.niveaux);
        const p2 = win.porteeDepuisEvaluation(EV1(GRILLE_50_30_20, { verrouillee: true }), grilleReeditee, ECHELLE_674.niveaux);
        const grilleGonflee = { id: 'G1', criteres: GRILLE_50_30_20.criteres.concat([{ id: 'c4', nom: 'Sources', ponderation: 10 }]) };
        const p3 = win.porteeDepuisEvaluation(EV1(GRILLE_50_30_20, { verrouillee: true }), grilleGonflee, ECHELLE_674.niveaux);
        // Témoin : un BROUILLON qui déclare sa portée garde la règle d'avant — l'absence y veut dire « pas encore de niveau ».
        const p4 = win.porteeDepuisEvaluation(EV1(GRILLE_50_30_20, { verrouillee: false }), grilleGonflee, ECHELLE_674.niveaux);
        const r = noter('E2', {
            sansDeclaration: { incomplete: p1.incomplete, couverte: p1.ponderationCouverte, grille: p1.ponderationGrille, hors: p1.criteresHorsNote.map((c) => c.critereId), nonCouverts: p1.criteresNonCouverts.map((c) => c.critereId) },
            avecDeclaration100_grille100: { incomplete: p2.incomplete, couverte: p2.ponderationCouverte, grille: p2.ponderationGrille, hors: p2.criteresHorsNote.map((c) => c.critereId), nonCouverts: p2.criteresNonCouverts.map((c) => c.critereId) },
            avecDeclaration100_grille110: { incomplete: p3.incomplete, couverte: p3.ponderationCouverte, grille: p3.ponderationGrille, nonCouverts: p3.criteresNonCouverts.map((c) => c.critereId) }
        });
        // La « grille » est désormais celle des critères PORTÉS (pondérations courantes) : 40+30+20 = 90, puis 50+30+20 = 100.
        expect(r.sansDeclaration).toEqual({ incomplete: false, couverte: 90, grille: 90, hors: [], nonCouverts: ['c4'] });              // avant #705 : incomplète, 90 sur 100, hors [c4]
        expect(r.avecDeclaration100_grille100).toEqual({ incomplete: false, couverte: 100, grille: 90, hors: [], nonCouverts: ['c4'] }); // avant #705 : hors [c4], grille 100
        expect(r.avecDeclaration100_grille110).toEqual({ incomplete: false, couverte: 100, grille: 100, nonCouverts: ['c4'] });          // avant #705 : incomplète, 100 sur 110
        expect({ incomplete: p4.incomplete, grille: p4.ponderationGrille, nonCouverts: p4.criteresNonCouverts }).toEqual({ incomplete: true, grille: 110, nonCouverts: [] });
    });
    it('E3 · une évaluation VIDE sur une grille (aucun niveau) n\'est pas incomplète : 0 est écrit avec portée 0, verrouillé — le cas « changer de grille puis enregistrer »', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: {} });
        const { win, ecran, ecritures, refus } = monterChaine({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], nu });
        win.sauvegarderEvaluation();
        const ecrit = derniereEcriture(ecritures, 'EVAL_NEUF');
        const r = noter('E3', { refus: refus.map((x) => x.titre), ecran: ecran.noteProduction1.textContent, ecrit: ecrit && { noteFinale: ecrit.noteFinale, ponderationCouverte: ecrit.ponderationCouverte, verrouillee: ecrit.verrouillee, niveauFinal: ecrit.niveauFinal } });
        expect(refus).toHaveLength(0);
        expect(r.ecran).toBe('0\u00A0%');
        expect(r.ecrit).toEqual({ noteFinale: 0, ponderationCouverte: 0, verrouillee: true, niveauFinal: '--' });
    });
});

/* ======================================================================================
   F · CE QUE L'ÉLÈVE LIT — les nombres
   ====================================================================================== */
describe('F · les nombres — la valeur brute stockée depuis #572', () => {
    it('F1 · cinq combinaisons de la grille 50/30/20 : AUCUN bruit flottant dans la valeur stockée (brut = écran = liste)', () => {
        const combos = { 'M,M,E': { c1: 'M', c2: 'M', c3: 'E' }, 'E,M,D': { c1: 'E', c2: 'M', c3: 'D' }, 'M,D,I': { c1: 'M', c2: 'D', c3: 'I' }, 'E,E,I': { c1: 'E', c2: 'E', c3: 'I' }, 'M,E,D': { c1: 'M', c2: 'E', c3: 'D' } };
        const r = {};
        Object.entries(combos).forEach(([k, niveaux]) => {
            const ec = ecDe(GRILLE_50_30_20, { criteres: niveaux });
            const { win, ecran } = monterMoteur({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], ec });
            win.calculerNote();
            r[k] = { brut: String(win.noteCalculeeCourante), ecran: ecran.noteProduction1.textContent, liste: `${Math.round(win.noteCalculeeCourante * 10) / 10}%` };
        });
        noter('F1', r);
        const bruites = Object.values(r).filter((x) => x.brut.length > 6);
        expect(bruites).toHaveLength(0);   // mesuré : 84.6 · 85.1 · 68.5 · 84 · 82.5, sans « …0000001 »
    });
});

/* ======================================================================================
   G · ROUVRIR, MODIFIER, RÉENREGISTRER — et #646, les deux emplacements
   ====================================================================================== */
describe('G · rouvrir / modifier / réenregistrer', () => {
    it('G1 · rouvrir sans rien changer et réenregistrer : la note réécrite est IDENTIQUE au flottant près (68,5)', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'M', c2: 'D', c3: 'I' }, idModification: 'EV1' });
        const existante = EV1(GRILLE_50_30_20, { noteFinale: 68.5, niveauFinal: 'D', criteres: [
            { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 50 }, { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'D', ponderation: 30 }, { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', ponderation: 20 }] });
        const { win, ecritures } = monterChaine({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], nu, evaluations: [existante] });
        win.sauvegarderEvaluationModifiee();
        const ecrit = derniereEcriture(ecritures, 'EV1');
        noter('G1', { avant: 68.5, apres: ecrit.noteFinale, niveau: ecrit.niveauFinal, verrouillee: ecrit.verrouillee });
        expect(ecrit.noteFinale).toBe(68.5);
        expect(ecrit.verrouillee).toBe(true);
    });
    it('G2 · #646 — un niveau changé après réouverture — ↻ corrigé #699 : l\'auto-save écrit la note ET le critère neufs (avant : 95 avec c3 = I)', () => {
        // Le flux réel après `verifierEtChargerEvaluationExistante` : `window.evaluationEnCours.criteres`
        // porte les niveaux ENREGISTRÉS ; les selects rejoués par `change` ont écrit les mêmes dans le
        // nom nu. L'enseignant·e change ensuite c3 (I → E) : `niveauSelectionne` écrit le nu.
        const fenetre = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' }, idModification: 'EV1' });
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' } });
        const { win, ecran, ecritures, minuteries } = monterChaine({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], nu, fenetre, evaluations: [EV1(GRILLE_50_30_20)] });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');                    // écrit le NU, recalcule, arme l'auto-save avec un instantané de WINDOW
        expect(minuteries).toHaveLength(1);
        minuteries[0]();                                // 1,5 s plus tard
        const ecrit = derniereEcriture(ecritures, 'EV1');
        const r = noter('G2', { nu: nu.criteres, fenetre: fenetre.criteres, noteCalculee: win.noteCalculeeCourante, ecranNote: ecran.noteProduction1.textContent,
            ecrit: ecrit && { noteFinale: ecrit.noteFinale, ponderationCouverte: ecrit.ponderationCouverte, niveauFinal: ecrit.niveauFinal, c3: (ecrit.criteres.find((c) => c.critereId === 'c3') || {}).niveauSelectionne, verrouillee: ecrit.verrouillee } });
        expect(nu.criteres.c3).toBe('E');
        expect(fenetre.criteres.c3).toBe('I');   // les deux emplacements divergent toujours (#646, inscrit) …
        expect(r.ecrit).toMatchObject({ noteFinale: 95, niveauFinal: 'E', c3: 'E', ponderationCouverte: 100 });   // … mais l'écriture lit le nu. Avant #699 : c3 'I'
    });
    it('G3 · #646 — le BILAN après le même changement — ↻ corrigé #699 : il lit la même source que le calcul (avant : « Langue (Insuffisant) » restait le défi)', () => {
        const fenetre = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' }, idModification: 'EV1' });
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' } });
        const { win, ecran } = monterChaine({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], nu, fenetre, evaluations: [EV1(GRILLE_50_30_20)], retro: true });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');
        let erreur = null;
        try { win.basculerVueRetroaction('bilan'); } catch (e) { erreur = e.message; }
        const html = ecran.contenuRetroBilan.innerHTML;
        const r = noter('G3', { erreur, nommeLangueEnDefi: /Langue \(Insuffisant\)/.test(html), extrait: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 400) });
        expect(erreur).toBeNull();
        expect(ecran.niveauProduction1.textContent).toBe('E');   // l'écran du calcul (nu) dit E…
        expect(r.nommeLangueEnDefi).toBe(false);                 // …et le bilan aussi. Avant #699 : true (il lisait window, c3 = I)
    });
    it('G4 · #646 témoin — quand les deux noms désignent le MÊME objet, l\'auto-save écrit note et critères cohérents', () => {
        const nu = ecDe(GRILLE_50_30_20, { criteres: { c1: 'E', c2: 'E', c3: 'I' }, idModification: 'EV1' });
        const { win, ecran, ecritures, minuteries } = monterChaine({ grille: GRILLE_50_30_20, echelles: [ECHELLE_674], nu, evaluations: [EV1(GRILLE_50_30_20)] });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');
        minuteries[0]();
        const ecrit = derniereEcriture(ecritures, 'EV1');
        expect(ecrit).toMatchObject({ noteFinale: 95 });
        expect(ecrit.criteres.find((c) => c.critereId === 'c3').niveauSelectionne).toBe('E');
    });
});

/* ======================================================================================
   H · LA FRONTIÈRE AVEC LA PRATIQUE DE NOTATION — ce que `pratiques/` LIT
   ====================================================================================== */
describe('H · pratiques/ — SOM lit noteFinale sans lire ponderationCouverte ni verrouillee', () => {
    function sommative(evaluations) {
        const store = { productions: [{ id: 'P1', ponderation: 40 }, { id: 'P2', ponderation: 60 }], evaluationsSauvegardees: evaluations };
        const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} };
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });
        chargerScript('js/pratiques/pratique-sommative.js', { db, cle: (k) => k }, win);
        return win.obtenirPratiqueParId('sommative');
    }
    const DA = '1234567';
    it('H1 · un BROUILLON retenu par #674 (95 sur 80 %, non verrouillé) — ↻ corrigé #706 : n\'entre PLUS dans la note du cours (avant : comptait 95 → 0,906)', () => {
        const p = sommative([
            { etudiantDA: DA, productionId: 'P1', noteFinale: 84, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null },
            { etudiantDA: DA, productionId: 'P2', noteFinale: 95, ponderationCouverte: 80, verrouillee: false, remplaceeParId: null }
        ]);
        const r = noter('H1', { indiceP: p.calculerPerformance(DA) });
        expect(r.indiceP).toBeCloseTo(0.84, 10);   // avant #706 : (84×40 + 95×60)/100/100 = 0,906
    });
    it('H2 · un « 0 » écrit avec portée 0 (évaluation vide, ou échelle disparue → A1) — ↻ corrigé #706 : écarté (avant : entrait comme un ZÉRO, 84 devenait 33,6)', () => {
        const p = sommative([
            { etudiantDA: DA, productionId: 'P1', noteFinale: 84, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null },
            { etudiantDA: DA, productionId: 'P2', noteFinale: 0, ponderationCouverte: 0, verrouillee: true, remplaceeParId: null }
        ]);
        const r = noter('H2', { indiceP: p.calculerPerformance(DA) });
        expect(r.indiceP).toBeCloseTo(0.84, 10);   // avant #706 : 0,336
    });
    it('H4 · PAN-Standards et PAN-Spécifications : chargement et lecture sur le même jeu (mesure de faisabilité, résultat consigné)', () => {
        const store = { productions: [{ id: 'P1', ponderation: 40, typeTravail: 'artefact' }, { id: 'P2', ponderation: 60, typeTravail: 'artefact' }], modalitesEvaluation: {}, groupesCours: [],
            evaluationsSauvegardees: [
                { etudiantDA: DA, productionId: 'P1', noteFinale: 84, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null, niveauFinal: 'M' },
                { etudiantDA: DA, productionId: 'P2', noteFinale: 95, ponderationCouverte: 80, verrouillee: false, remplaceeParId: null, niveauFinal: '--' } ] };
        const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} };
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });
        const r = {};
        ['pratique-pan-standards', 'pratique-pan-specifications'].forEach((m) => {
            try { chargerScript('js/pratiques/' + m + '.js', { db, cle: (k) => k }, win); r[m] = 'chargé'; } catch (e) { r[m] = 'échec chargement : ' + e.message; }
        });
        ['pan-standards', 'pan-specifications'].forEach((id) => {
            try { const p = win.obtenirPratiqueParId(id); r[id] = p ? String(p.calculerPerformance(DA)) : 'introuvable au registre'; } catch (e) { r[id] = 'échec appel : ' + e.message; }
        });
        noter('H4', r);
        expect(Object.keys(r).length).toBe(4);
    });
    it('H3 · témoin — la même copie à noteFinale null est ignorée : 84 seul → 0,84', () => {
        const p = sommative([
            { etudiantDA: DA, productionId: 'P1', noteFinale: 84, remplaceeParId: null },
            { etudiantDA: DA, productionId: 'P2', noteFinale: null, remplaceeParId: null }
        ]);
        expect(p.calculerPerformance(DA)).toBeCloseTo(0.84, 10);
    });
});
