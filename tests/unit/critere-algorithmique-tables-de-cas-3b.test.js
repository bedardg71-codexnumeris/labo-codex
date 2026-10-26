// LA TABLE DE CAS, LOT 3b (26 octobre 2026) — les tables que l'enseignant·e ajoute : « si la valeur est…, ce texte ».
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3b.md` (§ 7, la preuve exigée) ;
// ébauche validée `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html` (`casParDefaut`, `casChoisi`, `libelleCas`,
// `regleSurCas`) ; le registre `js/tables-cas-algo.js`.
//
//   A. LA LECTURE : une table lisible entre telle quelle ; une table illisible est écartée, jamais devinée ; les bornes
//      de taille (10 tables, 40 cas, 5 000 caractères) ;
//   B. LE CHOIX D'UN CAS, pour chaque valeur et chaque genre (« Sans valeur », « 0 », bornes inclusives, « Au-delà »,
//      l'égalité de codes d'un critère neuf et d'un existant, « Aucun code ») ;
//   C. LA PHRASE DES DEUX MODES (simple, Catégories), avec et sans tables : sans table, ou sans texte atteint,
//      identique à l'octet à la phrase calculée sans le registre ; un texte vide n'ajoute rien, pas même une espace ;
//   D. LE TRANSPORT : export → import et partage → réception, la table intacte ; une table illisible écartée à
//      l'import, refusée au partage ;
//   E. LES GESTES : ajouter, changer de valeur (remplace ; « La part » refusée sans limite), ajouter et retirer un
//      cas, la borne (virgule, refus), le texte (un code ajouté après la table) ; retirer la dernière table retire
//      le champ ;
//   F. L'ATELIER : la simulation (le texte du cas après les paliers, sa source), « Voir ce que l'étudiant·e lirait
//      dans ce cas », la chaîne et le résumé, la palette d'une zone de table, la phrase qui revient dans « Ce que
//      l'application choisit sans toi ».
//
// Deux disciplines fictives, celles de l'ébauche : « erreurs » sur « mots », « unités manquantes » sur « calculs ».
// BREAK-TESTS (26 oct. 2026, chacun restauré, `shasum` identique avant/après) : listés en fin de fichier.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Les registres, le miroir, la palette et l'atelier dans UN même window (ils se lisent par `window`).
const win = {};
['js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js', 'js/codes-annotation.js', 'js/tables-cas-algo.js',
    'js/palette-algo.js', 'js/miroir-algo.js', 'js/atelier-algo.js'].forEach((f) => chargerScript(f, {}, win));
const T = win.tablesCasAlgo, P = win.projectionAlgo, A = win.atelierAlgo, PA = win.paletteAlgo, M = win.miroirAlgo;

const SC = [{ id: 's1', code: '1', nom: 'Unité absente', ponderation: 1 }, { id: 's2', code: '2', nom: 'Unité erronée', ponderation: 1 },
    { id: 's3', code: '3', nom: 'Chiffres significatifs', ponderation: 1 }];
const CALCULS = {
    id: 'CC', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
    noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
    sousCriteres: SC, modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 2 }, modeleProjection: 'aucune', paramsProjection: {}
};
const MOTS = {
    id: 'CM', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
    noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } },
    sousCriteres: SC.map((s, i) => ({ ...s, nom: ['Syntaxe', 'Ponctuation', 'Lexique'][i] })),
    modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 }, modeleProjection: 'aucune', paramsProjection: {}
};
/** Le même critère, d'avant : sans aucune marque. */
const existant = (c) => { const x = clone(c); delete x.nomsAttendus; delete x.codesSousCriteresSeulement; x.codesDepuisSousCriteres = true; return x; };
/** Un critère dont la limite est fixée et réglée. */
const avecLimite = (c, l, t) => { const x = P.fixerLimite(clone(c)); Object.assign(x.paramsProjection, { motsReference: l, erreursTolerees: t }); return x; };
/** Une table écrite à la main (ce qu'un fichier porte). */
const table = (id, selon, cas) => ({ id, selon, cas });
const cas = (genre, x) => Object.assign({ genre, texte: '' }, x || {});

/* ============================================================ A — LA LECTURE */

describe('tables de cas 3b · A — ce qui entre est relu ; une table illisible est écartée, pas devinée', () => {
    const lisible = table('t1', 'erreurs', [cas('zero', { texte: 'Aucune.' }), cas('max', { borne: 2, texte: 'Peu.' }), cas('audela', { texte: 'Beaucoup.' })]);

    it('A.a une table lisible entre telle quelle ; un critère sans le champ n’en a aucune', () => {
        expect(T.assainir([clone(lisible)])).toEqual([lisible]);
        expect(T.lire({ ...clone(CALCULS), tablesCas: [clone(lisible)] })).toEqual([lisible]);
        expect(T.lire(clone(CALCULS))).toEqual([]);
        expect(T.aDesTables(clone(CALCULS))).toBe(false);
    });

    it('A.b une valeur, un genre inconnus, une borne illisible, un code impossible, un texte qui n’est pas du texte : la table part', () => {
        const illisibles = [
            table('t2', 'longueur', [cas('audela')]),                                   // valeur inconnue
            table('t3', 'erreurs', [cas('environ', { borne: 2 })]),                     // genre inconnu
            table('t4', 'erreurs', [cas('max', { borne: '2' })]),                       // borne en texte : pas devinée
            table('t5', 'erreurs', [cas('max', { borne: NaN })]),
            table('t6', 'erreurs', [cas('max')]),                                       // borne absente
            table('t7', 'code', [cas('code', { code: 'a"b' }), cas('aucun')]),          // code impossible
            table('t8', 'code', [cas('zero')]),                                         // un genre chiffré sous le code
            table('t9', 'erreurs', [cas('code', { code: '1' })]),                       // un genre du code sous un compte
            table('t10', 'erreurs', [{ genre: 'audela', texte: 7 }]),                   // un texte qui n'est pas du texte
            table('t 11', 'erreurs', [cas('audela')]),                                  // identifiant impossible
            table('t12', 'erreurs', []),                                                // aucun cas
            'table', null, [cas('audela')]
        ];
        expect(T.assainir(illisibles.concat([clone(lisible)]))).toEqual([lisible]);
        expect(T.assainir('pas une liste')).toEqual([]);
    });

    it('A.c un identifiant déjà vu part ; au-delà de dix tables, rien n’entre ; une table de plus de 40 cas part ; un texte s’arrête à 5 000', () => {
        const onze = Array.from({ length: 11 }, (_, i) => table('t' + i, 'erreurs', [cas('audela')]));
        expect(T.assainir(onze).map((t) => t.id)).toEqual(['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9']);
        expect(T.assainir([table('t1', 'erreurs', [cas('audela')]), table('t1', 'mots', [cas('audela')])]).map((t) => t.selon)).toEqual(['erreurs']);
        const quarante = (n) => table('t1', 'erreurs', Array.from({ length: n }, (_, i) => cas('max', { borne: i })));
        expect(T.assainir([quarante(40)])).toHaveLength(1);
        expect(T.assainir([quarante(41)])).toEqual([]);
        const long = T.assainir([table('t1', 'erreurs', [cas('audela', { texte: 'x'.repeat(5003) })])]);
        expect(long[0].cas[0].texte).toHaveLength(5000);
    });

    it('A.d le partage ne devine rien non plus : la raison du refus (`refusStructure`)', () => {
        expect(T.refusStructure([clone(lisible)])).toBeNull();
        expect(T.refusStructure([table('t1', 'erreurs', [cas('max', { borne: '2' })])])).toBe('table 1 illisible');
        expect(T.refusStructure([clone(lisible), clone(lisible)])).toBe('identifiant de table en double (t1)');
        expect(T.refusStructure([table('t1', 'erreurs', [cas('audela', { texte: 'x'.repeat(5001) })])])).toBe('table 1 : texte > 5000 caractères');
        expect(T.refusStructure({})).toBe('les tables doivent être une liste');
    });
});

/* ============================================================ B — LE CHOIX D'UN CAS */

describe('tables de cas 3b · B — le cas choisi, pour chaque valeur et chaque genre', () => {
    const choisi = (critere, selon, copie) => {
        const c = clone(critere);
        const t = { id: 't1', selon, cas: T.casParDefaut(selon, c) };
        return T.libelleCas(t, T.indexDeCle(t, T.casChoisi(t, T.valeurs(c, copie))), c) || null;
    };

    it('B.a le compte : « 0 », puis la première borne qui le contient (inclusive), puis « au-delà »', () => {
        expect(T.casParDefaut('erreurs', CALCULS).map((c) => [c.genre, c.borne])).toEqual([['zero', undefined], ['max', 2], ['audela', undefined]]);
        expect([0, 1, 2, 3, 40].map((n) => choisi(CALCULS, 'erreurs', { erreurs: n, mots: 10 }))).toEqual(['0', 'jusqu’à 2', 'jusqu’à 2', 'au-delà de 2', 'au-delà de 2']);
    });

    it('B.b l’étendue : sans « 0 » par défaut, une étendue nulle tombe dans la première borne ; une étendue absente n’atteint rien', () => {
        expect([0, 10, 11].map((m) => choisi(MOTS, 'mots', { erreurs: 1, mots: m }))).toEqual(['jusqu’à 10', 'jusqu’à 10', 'au-delà de 10']);
        expect(choisi(MOTS, 'mots', { erreurs: 1, mots: null })).toBeNull();
    });

    it('B.c la note, sur la pondération et bornée : « sans valeur » sans note, « 0 », la borne, au-delà', () => {
        // Pénalité fixe de 2 points : 0 erreur = 20/20, 5 = 10/20, 6 = 8/20, 10 et plus = 0/20 (bornée).
        expect([0, 5, 6, 10, 30].map((n) => choisi(CALCULS, 'note', { erreurs: n, erreursFormule: n, mots: 3 })))
            .toEqual(['au-delà de 10 / 20', 'jusqu’à 10 / 20', 'jusqu’à 10 / 20', '0 / 20', '0 / 20']);
        const sansPonderation = { ...clone(CALCULS), ponderation: 0 };
        expect(choisi(sansPonderation, 'note', { erreurs: 2, mots: 3 })).toBe('sans valeur');
        // La note passée par l'évaluation prime sur le calcul (c'est la sienne qui est retenue).
        expect(choisi(CALCULS, 'note', { erreurs: 0, mots: 3, note: 0 })).toBe('0 / 20');
        // La somme pondérée fait la note (la formule la reçoit), pas le compte brut.
        expect(choisi(CALCULS, 'note', { erreurs: 6, erreursFormule: 4, mots: 3 })).toBe('au-delà de 10 / 20');
    });

    it('B.d la part de la limite : « sans valeur » sans limite ; 0 ; 50 % inclus ; 100 % inclus ; au-delà', () => {
        expect(choisi(MOTS, 'part', { erreurs: 3, mots: 300 })).toBe('sans valeur');
        const L = avecLimite(MOTS, 300, 6);   // la limite : 6 erreurs pour 300 mots (1 à chaque 50)
        expect([[0, 300], [3, 300], [4, 300], [6, 300], [7, 300]].map(([n, m]) => choisi(L, 'part', { erreurs: n, mots: m })))
            .toEqual(['0 %', 'jusqu’à 50 %', 'jusqu’à 100 %', 'jusqu’à 100 %', 'au-delà de 100 %']);
        expect(choisi(L, 'part', { erreurs: 3, mots: 0 })).toBe('sans valeur');   // rien à rapporter
    });

    it('B.e la moyenne, arrondie comme {moyenne} : « sans valeur » sans occurrence, la borne inclusive, au-delà', () => {
        expect([[0, 100], [1, 5], [2, 9], [1, 6], [3, 0]].map(([n, m]) => choisi(MOTS, 'moyenne', { erreurs: n, mots: m })))
            .toEqual(['sans valeur', 'jusqu’à 5', 'jusqu’à 5', 'au-delà de 5', 'sans valeur']);
        // Avec une limite, la même valeur que le bloc {moyenne} de la projection.
        const L = avecLimite(MOTS, 300, 6);
        expect(T.valeurs(L, { erreurs: 3, mots: 100 }).moyenne).toBe(Number(P.calculer(L, { erreurs: 3, mots: 100 }).jetons.moyenne));
    });

    it('B.f le code : le plus fréquent ; à égalité, le premier de la liste (neuf), le premier à atteindre (existant) ; « aucun code »', () => {
        const poses = ['errfr_3', 'errfr_1', 'errfr_3', 'errfr_1'];
        expect(T.casParDefaut('code', CALCULS).map((c) => c.code || c.genre)).toEqual(['1', '2', '3', 'aucun']);
        expect(choisi(CALCULS, 'code', { erreurs: 4, mots: 3, poses })).toBe('code 1');
        expect(choisi(existant(CALCULS), 'code', { erreurs: 4, mots: 3, poses })).toBe('code 3');
        expect(choisi(CALCULS, 'code', { erreurs: 3, mots: 3, poses: ['errfr_2', 'errfr_2', 'errfr_1'] })).toBe('code 2');
        expect(choisi(CALCULS, 'code', { erreurs: 3, mots: 3 })).toBe('aucun code');   // un compte tapé, sans code posé
        expect(choisi(CALCULS, 'code', { erreurs: 3, mots: 3, code: '2' })).toBe('code 2');   // le code passé par l'évaluation
    });

    it('B.g une table sans « au-delà » ne choisit rien au-delà de sa dernière borne ; « toute autre valeur » sans borne', () => {
        const t = table('t1', 'erreurs', [cas('max', { borne: 2 })]);
        expect(T.casChoisi(t, T.valeurs(CALCULS, { erreurs: 3, mots: 1 }))).toBeNull();
        const seule = table('t1', 'erreurs', [cas('audela')]);
        expect(T.libelleCas(seule, 0, CALCULS)).toBe('toute autre valeur');
    });
});

/* ============================================================ C — LA PHRASE DES DEUX MODES */

function classList(initial) {
    const s = new Set(initial || []);
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; } };
}
function elementDom(init) {
    return Object.assign({ value: '', textContent: '', innerHTML: '', checked: false, style: {}, dataset: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {}, dispatchEvent() { return true; } }, init || {});
}
const ECHELLE = { id: 'E1', nom: 'IDME fictive', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 54 }, { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 84 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }] };
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    return (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) ? p : null;
}
/** La grille de l'évaluation : un critère analytique, puis le critère algorithmique `algo` (id a1). */
const grilleAvec = (algo) => ({ id: 'GA', nom: 'Grille fictive', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 80 }, Object.assign(clone(algo), { id: 'a1', ponderation: 20 })] });

/** Le calcul de l'évaluation (le harnais de `critere-algorithmique-dit-vrai`), avec ou sans le registre des tables. */
function monterCalcul(grille, { tables = true, poses = [] } = {}) {
    const ecran = { noteProduction1: elementDom(), niveauProduction1: elementDom(), porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEchelle1: elementDom({ value: 'E1' }), eval_c1: elementDom(), comm_c1: elementDom() };
    ['eval_erreurs_', 'eval_mots_', 'eval_categories_', 'total_erreurs_', 'mots_formule_', 'total_erreurs_simple_', 'mots_simple_', 'note_algo_', 'pct_algo_',
        'niveau_algo_', 'cat_dominante_', 'formule_algo_', 'resultat_algo_', 'retroaction_cat_', 'comm_', 'eval_'].forEach((p) => { ecran[p + 'a1'] = elementDom(); });
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId: 'E1', criteres: { c1: 'M' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    const base = { test_grillesTemplates: [grille], test_echellesTemplates: [ECHELLE], test_pratiquesConfigurables: [] };
    const w = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, genererRetroaction() {},
        // Annoter : la copie ouverte est celle de l'évaluation (#1142), ses codes posés dans l'ordre.
        travauxAnnotation: { getAnnotationCourante: () => ({ fichierId: 'F1', pages: { p1: { shapes: poses.map((type) => ({ type })) } } }) },
        travauxStockage: { obtenirFichierParId: () => ({ id: 'F1', etudiantDA: '1234567', productionId: 'P1' }) } };
    const globaux = {
        document, evaluationEnCours: ec, cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml,
        db: { getSync: (k, d) => (k in base ? clone(base[k]) : d), setSync() {}, get: async () => null, set: async () => {} },
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} }, setTimeout: () => 0, clearTimeout() {},
        calculerNote: () => w.calculerNote()
    };
    ['js/evaluation-formules.js', 'js/evaluation-enonces.js', 'js/evaluation-projection.js', 'js/codes-annotation.js']
        .concat(tables ? ['js/tables-cas-algo.js'] : []).concat(['js/evaluation-calcul.js'])
        .forEach((f) => chargerScript(f, globaux, w));
    return {
        w, ecran, ec,
        simple(n, m) { ecran.eval_erreurs_a1.value = String(n); ecran.eval_mots_a1.value = String(m); w.calculerNoteAlgorithmiqueSimple('a1', 20, 500); return ecran.comm_a1.textContent; },
        categories(codes, m) { ecran.eval_categories_a1.value = codes; ecran.eval_mots_a1.value = String(m); w.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1'); return ecran.comm_a1.textContent; }
    };
}

/** Le critère des mots, une limite (6 erreurs pour 300 mots), des sous-critères codes ; et ses tables. */
const MOTS_LIMITE = () => { const c = avecLimite(MOTS, 300, 6); c.paramsProjection.nomServiceAide = 'Service fictif'; return c; };
const TABLES = () => [
    table('t1', 'note', [cas('vide', { texte: 'Pas de note.' }), cas('zero', { texte: 'Note nulle.' }), cas('max', { borne: 10, texte: 'Sous la moitié.' }),
        cas('audela', { texte: 'Note à {moyenne} mots par erreur, {erreurs}{points} sur {mots}.' })]),
    table('t2', 'code', [cas('code', { code: '1', texte: 'Revois ta syntaxe.' }), cas('code', { code: '2', texte: '' }), cas('code', { code: '3', texte: 'Ton lexique, d’abord.' }),
        cas('aucun', { texte: '' })])
];

describe('tables de cas 3b · C — la phrase sous le critère, dans les deux modes', () => {
    it('C.a sans table : la phrase d’hier, à l’octet, dans les deux modes (le registre chargé ou non)', () => {
        const g = grilleAvec(MOTS_LIMITE());
        for (const [n, m] of [[0, 300], [3, 300], [7, 300], [2, 0]]) {
            expect(monterCalcul(g).simple(n, m)).toBe(monterCalcul(g, { tables: false }).simple(n, m));
        }
        for (const [codes, m] of [['1;3;3', 300], ['', 300], ['2;2;2;2;1;1;1', 120]]) {
            expect(monterCalcul(g).categories(codes, m)).toBe(monterCalcul(g, { tables: false }).categories(codes, m));
        }
    });

    it('C.b mode simple : le texte du cas atteint de chaque table, après la projection, dans l’ordre des tables, ses blocs remplis', () => {
        const avant = grilleAvec(MOTS_LIMITE());
        const apres = grilleAvec(Object.assign(MOTS_LIMITE(), { tablesCas: TABLES() }));
        const poses = ['errfr_3', 'errfr_1', 'errfr_3'];
        const hier = monterCalcul(avant, { poses }).simple(3, 300);
        const phrase = monterCalcul(apres, { poses }).simple(3, 300);
        // 3 erreurs sur 300 mots, pénalité normalisée sur 500 : 15/20 ; le code 3 deux fois.
        expect(phrase).toBe(hier + ' Note à 100 mots par erreur, 3 sur 300. Ton lexique, d’abord.');
        // Enregistrée avec la phrase : le PDF et « Copier tout » la reprennent sans autre geste.
        const h = monterCalcul(apres, { poses });
        h.simple(3, 300);
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).toBe(phrase);
    });

    it('C.c un cas atteint sans texte n’ajoute rien, pas même une espace ; aucun code posé : « Aucun code » (vide)', () => {
        const apres = grilleAvec(Object.assign(MOTS_LIMITE(), { tablesCas: TABLES() }));
        const hier = monterCalcul(grilleAvec(MOTS_LIMITE())).simple(3, 300);
        expect(monterCalcul(apres, { poses: [] }).simple(3, 300)).toBe(hier + ' Note à 100 mots par erreur, 3 sur 300.');
        expect(monterCalcul(apres, { poses: ['errfr_2', 'errfr_2'] }).simple(2, 300)).not.toMatch(/\s$|\s\s/);
    });

    it('C.d les codes ne vont qu’au premier critère algorithmique (#1132) : un second lit « Aucun code »', () => {
        const g = grilleAvec(Object.assign(MOTS_LIMITE(), { tablesCas: TABLES() }));
        g.criteres.splice(1, 0, Object.assign(clone(CALCULS), { id: 'a0', ponderation: 0 }));
        const phrase = monterCalcul(g, { poses: ['errfr_1', 'errfr_1'] }).simple(2, 300);
        expect(phrase).not.toContain('Revois ta syntaxe.');
    });

    it('C.e mode Catégories : les tables après la projection, avant l’observation du code dominant ; la note et le code de la saisie', () => {
        const critere = Object.assign(MOTS_LIMITE(), { tablesCas: TABLES() });
        critere.sousCriteres[2].retroaction = 'Observation du lexique.';
        const hier = monterCalcul(grilleAvec(Object.assign(clone(critere), { tablesCas: undefined })), { tables: false }).categories('1;3;3', 300);
        const phrase = monterCalcul(grilleAvec(critere)).categories('1;3;3', 300);
        expect(hier.endsWith(' Observation du lexique.')).toBe(true);
        expect(phrase).toBe(hier.replace(' Observation du lexique.', ' Note à 100 mots par erreur, 3 sur 300. Ton lexique, d’abord. Observation du lexique.'));
    });

    it('C.f la note qu’une table lit est celle que l’évaluation retient (bornée, sur la pondération)', () => {
        const critere = Object.assign(MOTS_LIMITE(), { tablesCas: [TABLES()[0]] });
        // 40 erreurs sur 300 mots : la note touche le plancher, 0/20.
        expect(monterCalcul(grilleAvec(critere)).simple(40, 300)).toMatch(/ Note nulle\.$/);
    });
});

/* ============================================================ D — LE TRANSPORT */

describe('tables de cas 3b · D — la donnée voyage : export, import, partage', () => {
    const grilleFictive = () => {
        const g = grilleAvec(Object.assign(MOTS_LIMITE(), { tablesCas: TABLES() }));
        g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
        return g;
    };

    it('D.a export → import (fichier, bibliothèque) : les tables intactes ; une illisible écartée ; un critère sans table, sans le champ', () => {
        const wie = chargerScript('js/tables-cas-algo.js');
        chargerScript('js/import-export.js', {}, wie);
        const g = grilleFictive();
        const importee = wie.assainirObjet(clone(g), wie.SCHEMAS_IMPORT.grille);
        expect(importee.criteres[1].tablesCas).toEqual(g.criteres[1].tablesCas);
        expect(importee.criteres[0]).not.toHaveProperty('tablesCas');
        const abime = clone(g);
        abime.criteres[1].tablesCas[0].cas[2].borne = 'dix';
        abime.criteres[1].tablesCas[1].cas[0].texte = '<b>Revois</b> ta syntaxe.';
        const relue = wie.assainirObjet(abime, wie.SCHEMAS_IMPORT.grille);
        expect(relue.criteres[1].tablesCas.map((t) => t.id)).toEqual(['t2']);
        expect(relue.criteres[1].tablesCas[0].cas[0].texte).toBe('Revois ta syntaxe.');   // les balises retirées, comme tout texte importé
        const toutAbime = clone(g);
        toutAbime.criteres[1].tablesCas = [{ id: 't1', selon: 'inconnue', cas: [] }];
        expect(wie.assainirObjet(toutAbime, wie.SCHEMAS_IMPORT.grille).criteres[1]).not.toHaveProperty('tablesCas');
    });

    it('D.b partage → réception : les tables intactes ; une table illisible fait refuser le paquet, avec sa raison', () => {
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/tables-cas-algo.js');
        chargerScript('js/partage-schemas.js', {}, wp);
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        chargerScript('js/partage-import.js', { db: dbP }, wp);
        const g = grilleFictive();
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        const verdict = wp.partageValidation.validerPackage(clone(paquet));
        expect(verdict.erreurs).toEqual([]);
        const recue = wp.partageImport.prefixerEntites(verdict.packageNettoye, 'IMP_banc').parType.grille[0];
        expect(recue.criteres[1].tablesCas).toEqual(g.criteres[1].tablesCas);
        const abime = clone(paquet);
        abime.entites.grilles[0].criteres[1].tablesCas[0].selon = 'longueur';
        const refus = wp.partageValidation.validerPackage(abime);
        expect(refus.valide).toBe(false);
        expect(refus.erreurs.map((e) => e.message)).toContain('tables de cas : table 1 illisible');
        const inconnu = clone(paquet);
        inconnu.entites.grilles[0].criteres[1].tablesCas[0].couleur = 'rouge';
        expect(wp.partageValidation.validerPackage(inconnu).valide).toBe(false);
    });
});

/* ============================================================ E — LES GESTES */

describe('tables de cas 3b · E — les gestes de l’enseignant·e, sur le critère', () => {
    it('E.a « + Ajouter une table de cas » : selon le compte, vide ; dix au plus ; le champ n’existe qu’avec une table', () => {
        const c = clone(CALCULS);
        expect(c).not.toHaveProperty('tablesCas');
        expect(T.ajouterTable(c)).toBe('t1');
        expect(c.tablesCas).toEqual([{ id: 't1', selon: 'erreurs', cas: T.casParDefaut('erreurs', c) }]);
        expect(c.tablesCas[0].cas.every((x) => x.texte === '')).toBe(true);
        for (let i = 2; i <= 10; i++) expect(T.ajouterTable(c)).toBe('t' + i);
        expect(T.ajouterTable(c)).toBe(false);
        for (let i = 1; i <= 10; i++) T.retirerTable(c, 't' + i);
        expect(c).not.toHaveProperty('tablesCas');
    });

    it('E.b changer de valeur remplace les cas ; « La part de la limite » est refusée sans limite fixée', () => {
        const c = clone(CALCULS);
        T.ajouterTable(c);
        T.ecrireTexte(c, 't1', '0', 'Rien.');
        expect(T.changerSelon(c, 't1', 'part')).toBe(false);
        expect(c.tablesCas[0].cas[0].texte).toBe('Rien.');
        expect(T.changerSelon(c, 't1', 'code')).toBe(true);
        expect(c.tablesCas[0]).toEqual({ id: 't1', selon: 'code', cas: T.casParDefaut('code', c) });
        const L = avecLimite(CALCULS, 10, 2);
        T.ajouterTable(L);
        expect(T.changerSelon(L, 't1', 'part')).toBe(true);
        expect(T.changerSelon(L, 't1', 'longueur')).toBe(false);
    });

    it('E.c « + Ajouter un cas » : une borne au-dessus de la dernière, avant « Au-delà » ; « Retirer ce cas » : une borne seulement ; 40 au plus', () => {
        const c = clone(MOTS);
        T.ajouterTable(c);
        T.changerSelon(c, 't1', 'moyenne');
        expect(T.ajouterCas(c, 't1')).toBe(true);
        expect(c.tablesCas[0].cas.map((x) => x.genre + (x.borne === undefined ? '' : x.borne))).toEqual(['vide', 'max5', 'max10', 'audela']);
        expect(T.retirerCas(c, 't1', '0')).toBe(false);   // « Sans valeur » ne se retire pas
        expect(T.retirerCas(c, 't1', '1')).toBe(true);
        expect(c.tablesCas[0].cas.map((x) => x.genre + (x.borne === undefined ? '' : x.borne))).toEqual(['vide', 'max10', 'audela']);
        while (c.tablesCas[0].cas.length < 40) T.ajouterCas(c, 't1');
        expect(T.ajouterCas(c, 't1')).toBe(false);
        T.changerSelon(c, 't1', 'code');
        expect(T.ajouterCas(c, 't1')).toBe(false);   // pas de borne sous le code
    });

    it('E.d la borne : virgule ou point ; illisible ou sous 0, refusée, rien n’est écrit', () => {
        const c = clone(CALCULS);
        T.ajouterTable(c);
        expect(T.ecrireBorne(c, 't1', '1', '2,5')).toBe(true);
        expect(c.tablesCas[0].cas[1].borne).toBe(2.5);
        const avant = JSON.stringify(c);
        for (const x of ['', 'deux', '-1', '3 erreurs']) expect(T.ecrireBorne(c, 't1', '1', x)).toBe(false);
        expect(T.ecrireBorne(c, 't1', '0', '4')).toBe(false);   // « 0 » n'a pas de borne
        expect(JSON.stringify(c)).toBe(avant);
    });

    it('E.e le texte : 5 000 caractères au plus ; un code ajouté à la liste après la table reçoit sa rangée, à sa place', () => {
        const c = clone(CALCULS);
        T.ajouterTable(c);
        T.changerSelon(c, 't1', 'code');
        T.ecrireTexte(c, 't1', 'code:1', 'x'.repeat(5100));
        expect(c.tablesCas[0].cas[0].texte).toHaveLength(5000);
        c.sousCriteres = SC.slice(0, 1).concat([{ id: 's4', code: '4', nom: 'Arrondi', ponderation: 1 }], SC.slice(1));
        expect(T.rangees(c.tablesCas[0], c).map((r) => [r.cle, r.index])).toEqual([['code:1', 0], ['code:4', -1], ['code:2', 1], ['code:3', 2], ['aucun', 3]]);
        expect(T.ecrireTexte(c, 't1', 'code:4', 'Arrondis.')).toBe(true);
        expect(c.tablesCas[0].cas.map((x) => x.code || x.genre)).toEqual(['1', '4', '2', '3', 'aucun']);
        expect(T.ecrireTexte(c, 't1', 'code:9', 'Inconnu.')).toBe(false);
    });

    it('E.f un texte écrit se lit : `aDesTextes` (ce que « Retirer cette table » demande avant d’effacer)', () => {
        const c = clone(CALCULS);
        T.ajouterTable(c);
        expect(T.aDesTextes(T.lire(c)[0])).toBe(false);
        T.ecrireTexte(c, 't1', '2', '  ');
        expect(T.aDesTextes(T.lire(c)[0])).toBe(false);
        T.ecrireTexte(c, 't1', '2', 'Beaucoup.');
        expect(T.aDesTextes(T.lire(c)[0])).toBe(true);
    });
});

/* ============================================================ F — L'ATELIER */

describe('tables de cas 3b · F — la simulation, la chaîne, la palette', () => {
    const critere = () => Object.assign(clone(CALCULS), { tablesCas: [table('t1', 'erreurs', [cas('zero', { texte: 'Aucune {nomErreurs}.' }),
        cas('max', { borne: 2, texte: 'Peu : {erreurs} {nomErreurs}.' }), cas('audela', { texte: '' })])] });

    it('F.a la simulation passe par le calcul de l’évaluation : le texte du cas atteint, après les paliers, avec sa source', () => {
        const c = critere();
        const copie = { cle: null, erreurs: 2, erreursFormule: 2, mots: 3, codes: [] };
        const essai = M.essayer(c, copie);
        expect(essai.tables.texte).toBe('Peu : 2 unités manquantes.');
        expect(essai.eleve.endsWith(' Peu : 2 unités manquantes.')).toBe(true);
        const lec = A.lecture(c, copie);
        expect(lec.pdf[lec.pdf.length - 1]).toMatchObject({ source: 'table', libelle: 'jusqu’à 2', zone: { tableCas: 't1', cas: '1' } });
        expect(A.TEXTES.sources.table('jusqu’à 2')).toBe('Table · jusqu’à 2');
        expect(lec.casAtteints).toEqual({ t1: '1' });
        // Un cas atteint sans texte : la table ne dit rien, mais le cas est marqué.
        expect(A.lecture(c, Object.assign({}, copie, { erreurs: 5, erreursFormule: 5 })).casAtteints).toEqual({ t1: '2' });
    });

    it('F.b « Voir ce que l’étudiant·e lirait dans ce cas » règle une copie qui l’atteint, ou dit qu’aucune ne le peut', () => {
        const c = critere();
        const depart = { cle: null, erreurs: 7, erreursFormule: 7, mots: 3, codes: [] };
        expect(A.copiePourCas(c, depart, 't1', '0').copie).toMatchObject({ erreurs: 0, mots: 3 });
        expect(A.copiePourCas(c, depart, 't1', '1').copie).toMatchObject({ erreurs: 1, mots: 3 });   // le premier compte qui l'atteint
        expect(A.copiePourCas(c, depart, 't1', '2').copie).toMatchObject({ erreurs: 3 });
        const code = A.copiePourCas(c, depart, 't1', 'code:2');
        expect(code).toMatchObject({ code: '2', copie: { erreurs: 3, poses: ['errfr_2', 'errfr_2', 'errfr_2'] } });
        expect(A.copiePourCas(c, depart, 't1', 'aucun')).toMatchObject({ code: null, copie: { erreurs: 0, codes: [] } });
        // Une borne que rien n'atteint : une table sans « 0 » dont la première borne est 0, puis « au-delà de 0 » ; « 0 » n'existe pas.
        const sansZero = Object.assign(clone(CALCULS), { tablesCas: [table('t1', 'note', [cas('max', { borne: 30 }), cas('audela')])] });
        expect(A.copiePourCas(sansZero, depart, 't1', '1')).toEqual({ copie: null, raison: 'impossible' });
        // Le geste règle un cas de la table du code, et la simulation le choisit.
        const cc = Object.assign(clone(CALCULS), { tablesCas: [table('t1', 'code', T.casParDefaut('code', CALCULS))] });
        expect(M.essayer(cc, A.copiePourCas(cc, depart, 't1', 'code:3').copie).tables.atteints).toEqual({ t1: 'code:3' });
    });

    it('F.c la chaîne compte les tables (les paliers en sont une) ; le résumé les nomme', () => {
        const sans = A.etapes(clone(CALCULS)).filter((e) => e.id === 'paliers')[0];
        expect([sans.info, sans.resume]).toEqual(['0 table', 'Aucune limite, aucun palier']);
        const une = A.etapes(critere()).filter((e) => e.id === 'paliers')[0];
        expect([une.info, une.resume]).toEqual(['1 table', 'Aucune limite, aucun palier · une table selon le compte des unités manquantes']);
        const L = avecLimite(critere(), 10, 2);
        T.ajouterTable(L);
        T.changerSelon(L, 't2', 'note');
        const deux = A.etapes(L).filter((e) => e.id === 'paliers')[0];
        expect([deux.info, deux.resume]).toEqual(['3 tables', 'Paliers selon la limite fixée · une table selon le compte des unités manquantes · une table selon la note du critère']);
    });

    it('F.d une zone de table offre les blocs des paliers et la somme pondérée ; elle se nomme par sa table et son cas', () => {
        const c = critere();
        const offerts = PA.reperesDeZone(c, { tableCas: 't1', cas: '1' }).map((r) => r.jeton);
        expect(offerts).toEqual(P.listerReperes().map((r) => r.jeton).concat(['{points}']));
        // Sans limite, la palette porte quand même ces blocs : la zone de la table les offre.
        expect(PA.blocs(c).map((b) => b.jeton)).toEqual(expect.arrayContaining(['{moyenne}', '{palier}', '{points}']));
        expect(PA.blocs(clone(CALCULS)).map((b) => b.jeton)).not.toContain('{moyenne}');
        expect(PA.nomDeZone({ tableCas: 't1', cas: '1' }, c)).toBe('Table selon le compte des unités manquantes, cas jusqu’à 2');
        expect(A.etapeDeZone({ tableCas: 't1', cas: '1' })).toBe('paliers');
        expect(A.cleDeZone({ tableCas: 't1', cas: 'code:3' })).toBe('table:t1:code:3');
    });

    it('F.e les mots : la phrase retirée au lot 3a revient ; le menu « Selon » dit les noms du critère ; ni « élève » ni futur', () => {
        expect(A.TEXTES.choix.frequentTexte(true)).toMatch(/ Pour lui écrire un texte par code, ajoute une table selon « Le code le plus fréquent »\.$/);
        expect(T.SELONS.map((s) => T.libelleSelon(s, CALCULS))).toEqual(['Le compte des unités manquantes', 'Le compte des calculs', 'La note du critère',
            'La part de la limite', 'La moyenne de calculs par unité manquante', 'Le code le plus fréquent']);
        const mots = JSON.stringify(A.TEXTES.tables) + Object.values(A.TEXTES.tables).filter((f) => typeof f === 'function').map((f) => f('x')).join(' ')
            + JSON.stringify(T.TEXTES);
        expect(mots).not.toMatch(/élève/);
        expect(mots).not.toMatch(/\b(lira|liras|verra|sera|ajoutera)\b/);
    });
});

/* BREAK-TESTS (26 oct. 2026) — chaque défaut introduit dans le code, le banc lancé, le défaut retiré (`sha1` identique) ;
 * tous rouges :
 *   · `_contient` : une borne non inclusive (`<`)                                  → B, 7 cas rouges ;
 *   · `_contient` : une valeur absente choisit « 0 » au lieu de « Sans valeur »    → B ;
 *   · `ajouterALaPhrase` : un texte vide ajoute une espace                          → C.a, C.c, C.f ;
 *   · `_casLisible` : une borne en texte acceptée (devinée)                          → A.b, A.d, D.a ;
 *   · `codeLePlusFrequent` : la liste ignorée (l'égalité d'un critère neuf)          → B.f ;
 *   · `ajouterTable` : sans la borne de dix tables                                   → E.a ;
 *   · `import-export.js` : `tablesCas` non déclaré au schéma                         → D.a ;
 *   · `partage-schemas.js` : `tablesCas` non déclaré                                 → D.b ;
 *   · `partage-validation.js` : aucun refus de structure                             → D.b ;
 *   · `evaluation-calcul.js` : le mode Catégories sans les tables                    → C.e ;
 *   · `evaluation-calcul.js` : le code de la copie oublié (mode simple)              → C.b ;
 *   · `miroir-algo.js` : la simulation sans les tables                               → F.a ;
 *   · `palette-algo.js` : la zone d'une table n'offre rien                           → F.d ;
 *   · `atelier-algo.js` : la chaîne ne compte pas les tables                         → F.c ;
 * et, dans WebKit (`critere-algorithmique-tables-de-cas-3b.spec.js`) : « Retirer cette table » sans demander (le test
 * « mots · ») ; la phrase du mode simple sans les tables (« une vraie copie évaluée »).
 */
