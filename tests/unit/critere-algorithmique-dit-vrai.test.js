/**
 * LE CRITÈRE ALGORITHMIQUE FAIT CE QUE SON ÉCRAN DIT (21 oct. 2026).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-21-critere-algorithmique-dit-vrai.md ; mesure :
 * plans de travail/MESURE-2026-10-21-critere-algorithmique.md (les numéros de constat sont les siens).
 *
 * Ce que ce banc verrouille :
 *   S — LA SOMME PONDÉRÉE DES CODES POSÉS (constat 4, décision de Grégoire, 8 h 38) : chaque code pèse la
 *       pondération de son sous-critère (0,5 et 1) ; un sous-critère de poids 0 n'est pas un code ; en repli,
 *       chaque code pèse 1.
 *   C — LE CALCUL : la formule reçoit la somme pondérée ; le nombre brut reste (champ, évaluation enregistrée,
 *       décompte) ; une saisie à la main reste brute ; tous les poids à 1, l'évaluation est celle d'hier.
 *   M — CE QUE L'ÉLÈVE LIT (8 h 39) : « 5 erreurs (3,5 une fois pondérées) » ; singulier sous 2 ; rien quand
 *       les nombres sont égaux ; la même parenthèse dans la ligne du PDF.
 *   L — LES LIBELLÉS (constat 7) : « (30 points) » sur une grille en points ; « Niveau de l’échelle « X » »,
 *       ou « Niveau ».
 *
 * Break-tests (faits le 21 oct.) : voir la demande de relecture du lot.
 * Grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const echapperHtml = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    return (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) ? p : null;
}
const ECHELLE = { id: 'E1', nom: 'IDME fictive', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 54 }, { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 84 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }] };

/** Le critère algorithmique fictif : trois sous-critères, poids 1, 0,5 et 0 ; codes tirés des sous-critères. */
const sousCriteres = (poidsPonctuation = 0.5) => [
    { id: 'SC0', code: '0', nom: 'Aucune erreur', ponderation: 0, retroaction: '' },
    { id: 'SC1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' },
    { id: 'SC3', code: '3', nom: 'Ponctuation', ponderation: poidsPonctuation, retroaction: '' }];
const grilleAlgo = (poids) => ({ id: 'GA', nom: 'Grille fictive', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 },
    { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', codesDepuisSousCriteres: true, sousCriteres: sousCriteres(poids) }] });

function champsAlgo(id) {
    const e = {};
    ['eval_erreurs_', 'eval_mots_', 'eval_categories_', 'total_erreurs_', 'mots_formule_', 'total_erreurs_simple_', 'mots_simple_', 'note_algo_', 'pct_algo_',
        'niveau_algo_', 'cat_dominante_', 'formule_algo_', 'resultat_algo_', 'retroaction_cat_', 'comm_', 'eval_'].forEach((p) => { e[p + id] = elementDom(); });
    return e;
}

/** Le calcul de l'évaluation (le harnais du #698), avec le registre des phrases et celui des formules. */
function monterCalcul(grille = grilleAlgo()) {
    const ecran = Object.assign({
        noteProduction1: elementDom(), niveauProduction1: elementDom(), porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEchelle1: elementDom({ value: 'E1' }), eval_c1: elementDom(), comm_c1: elementDom()
    }, champsAlgo('a1'));
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId: 'E1', criteres: { c1: 'M' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    const base = { test_grillesTemplates: [grille], test_echellesTemplates: [ECHELLE], test_pratiquesConfigurables: [] };
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, genererRetroaction() {} };
    const globaux = {
        document, evaluationEnCours: ec, cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} }, setTimeout: () => 0, clearTimeout() {},
        calculerNote: () => win.calculerNote()
    };
    chargerScript('js/evaluation-formules.js', globaux, win);
    chargerScript('js/evaluation-enonces.js', globaux, win);
    chargerScript('js/evaluation-projection.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    return { win, ecran, ec };
}

/** Les codes posés dans Annoter, versés au champ comme `mettreAJourCompteursErreurs` le fait. */
function annoter(h, brut, pondere, mots) {
    h.win.poserErreursDuChamp(h.ecran.eval_erreurs_a1, brut, pondere);
    h.ecran.eval_mots_a1.value = String(mots);
    h.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
}

/** Annoter (travaux-outils.js) et la liste des codes (codes-annotation.js), sur la vraie règle. */
function monterAnnoter() {
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-enonces.js', {}, win);   // le registre du critère algorithmique (#581)
    chargerScript('js/codes-annotation.js', { db: { getSync: () => null } }, win);
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    chargerScript('js/travaux-outils.js', { db: { ready: false, getSync: () => null, setSync() {} }, Image: ImageStub }, win);
    return win;
}

/* ======================================================= S — LA SOMME PONDÉRÉE */

describe('critère algorithmique · S — le poids des codes posés', () => {
    it('S.a sous une grille activée : chaque code pèse son sous-critère (1 et 0,5) ; le poids 0 n’est pas un code', () => {
        const win = monterAnnoter();
        const g = grilleAlgo(0.5);
        expect(win.codesAnnotation.listeCodes(g).map((c) => [c.id, c.poids])).toEqual([['errfr_1', 1], ['errfr_3', 0.5]]);
        // 3 de syntaxe, 4 de ponctuation : 7 erreurs, 5 une fois pondérées.
        expect(win.travauxOutils.sommePondereeErreurs({ errfr_1: 3, errfr_3: 4 }, g)).toBe(5);
        // Des poids de 0,1 ne laissent pas de traîne flottante.
        const dixieme = grilleAlgo(0.1);
        expect(win.travauxOutils.sommePondereeErreurs({ errfr_3: 3 }, dixieme)).toBe(0.3);
    });

    it('S.b en repli (grille sans le geste), et pour un code que la grille ne connaît plus : chaque code pèse 1, comme hier', () => {
        const win = monterAnnoter();
        expect(win.travauxOutils.sommePondereeErreurs({ errfr_1: 3, errfr_3: 4 }, null)).toBe(7);
        const sansGeste = grilleAlgo(0.5);
        delete sansGeste.criteres[1].codesDepuisSousCriteres;
        expect(win.travauxOutils.sommePondereeErreurs({ errfr_1: 3, errfr_3: 4 }, sansGeste)).toBe(7);
        expect(win.travauxOutils.sommePondereeErreurs({ errfr_1: 3, errfr_0: 2 }, grilleAlgo(0.5))).toBe(5);   // errfr_0 : inconnu, 1
    });
});

/* ======================================================= C — LE CALCUL */

describe('critère algorithmique · C — la formule reçoit la somme pondérée, l’élève lit le nombre brut', () => {
    it('C.a 5 erreurs, 3,5 une fois pondérées, 400 mots : la note est celle de 3,5 ; le brut reste ; la somme est enregistrée', () => {
        const h = monterCalcul();
        annoter(h, 5, 3.5, 400);
        const attendu = h.win.formulesAlgo.calculer({ type: 'algorithmique', facteurNormalisation: 500 }, { ponderation: 20, erreurs: 3.5, mots: 400 });
        const brut = h.win.formulesAlgo.calculer({ type: 'algorithmique', facteurNormalisation: 500 }, { ponderation: 20, erreurs: 5, mots: 400 });
        expect(attendu.note).not.toBe(brut.note);
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ erreurs: 5, sommePonderee: 3.5, mots: 400, noteCalculee: attendu.note, pourcentage: attendu.pctBorne });
        expect(h.ecran.eval_erreurs_a1.value).toBe(5);
        expect(h.ecran.total_erreurs_simple_a1.textContent).toBe(5);
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).toContain('5 erreurs de français (3,5 une fois pondérées) pour 400 mots.');
    });

    it('C.b une saisie à la main, sans code posé, reste un nombre brut : la somme ne vaut que pour son nombre', () => {
        const h = monterCalcul();
        annoter(h, 5, 3.5, 400);
        h.ecran.eval_erreurs_a1.value = '6';   // l'enseignant·e corrige le nombre au clavier
        h.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        const brut = h.win.formulesAlgo.calculer({ type: 'algorithmique', facteurNormalisation: 500 }, { ponderation: 20, erreurs: 6, mots: 400 });
        expect(h.ec.donneesAlgorithmiques.a1.noteCalculee).toBe(brut.note);
        expect(h.ec.donneesAlgorithmiques.a1).not.toHaveProperty('sommePonderee');
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).not.toContain('pondérée');
    });

    it('C.c tous les poids à 1 : l’évaluation enregistrée est celle d’hier, à l’octet près', () => {
        const avec = monterCalcul(grilleAlgo(1));
        annoter(avec, 5, 5, 400);
        const hier = monterCalcul(grilleAlgo(1));
        hier.ecran.eval_erreurs_a1.value = '5';
        hier.ecran.eval_mots_a1.value = '400';
        hier.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        expect(JSON.stringify(avec.ec.donneesAlgorithmiques.a1)).toBe(JSON.stringify(hier.ec.donneesAlgorithmiques.a1));
        expect(avec.ec.donneesAlgorithmiques.a1.retroaction.startsWith('Ta rédaction contient 5 erreurs de français pour 400 mots.')).toBe(true);
        expect(avec.ecran.eval_erreurs_a1.dataset).not.toHaveProperty('sommePonderee');
    });

    it('C.d le champ vidé (copie suivante) perd sa somme : un 5 tapé ensuite reste brut', () => {
        const h = monterCalcul();
        annoter(h, 5, 3.5, 400);
        h.win.poserErreursDuChamp(h.ecran.eval_erreurs_a1, '');
        h.ecran.eval_erreurs_a1.value = '5';
        expect(h.win.erreursPourLaFormule(h.ecran.eval_erreurs_a1, 5)).toBe(5);
    });

    it('C.e une évaluation rouverte rend sa somme au champ : la note recalculée est la même', () => {
        const h = monterCalcul();
        annoter(h, 5, 3.5, 400);
        const enregistree = JSON.parse(JSON.stringify(h.ec.donneesAlgorithmiques.a1));
        const r = monterCalcul();
        r.win.poserErreursDuChamp(r.ecran.eval_erreurs_a1, enregistree.erreurs, enregistree.sommePonderee, { enregistree: true });   // le chargement
        annoter(r, 5, 3.5, 400);   // Annoter reverse les mêmes codes
        r.ecran.eval_mots_a1.value = String(enregistree.mots);
        r.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500);
        expect(r.ec.donneesAlgorithmiques.a1.noteCalculee).toBe(enregistree.noteCalculee);
    });
});

describe('critère algorithmique · K — le stock : une évaluation enregistrée avant les poids garde sa note', () => {
    const noteDe = (erreurs) => chargerScript('js/evaluation-formules.js').formulesAlgo
        .calculer({ type: 'algorithmique', facteurNormalisation: 500 }, { ponderation: 20, erreurs, mots: 400 }).note;

    it('K.a rouverte sans somme pondérée, la copie reçoit ses mêmes codes : la note reste celle du nombre brut', () => {
        for (const ordre of ['chargement puis Annoter', 'Annoter puis chargement']) {
            const h = monterCalcul();
            const charger = () => h.win.poserErreursDuChamp(h.ecran.eval_erreurs_a1, 5, undefined, { enregistree: true });
            if (ordre === 'chargement puis Annoter') { charger(); annoter(h, 5, 3.5, 400); }
            else { annoter(h, 5, 3.5, 400); charger(); h.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500); }
            expect(h.ec.donneesAlgorithmiques.a1.noteCalculee, ordre).toBe(noteDe(5));
            expect(h.ec.donneesAlgorithmiques.a1, ordre).not.toHaveProperty('sommePonderee');
        }
    });

    it('K.b un code ajouté est un geste : le poids s’applique, et il reste appliqué', () => {
        const h = monterCalcul();
        h.win.poserErreursDuChamp(h.ecran.eval_erreurs_a1, 5, undefined, { enregistree: true });
        annoter(h, 6, 4, 400);
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ erreurs: 6, sommePonderee: 4, noteCalculee: noteDe(4) });
        annoter(h, 5, 3.5, 400);   // le code retiré : 5 de nouveau, pondéré cette fois
        expect(h.ec.donneesAlgorithmiques.a1.noteCalculee).toBe(noteDe(3.5));
    });
});

/* ======================================================= M — CE QUE L'ÉLÈVE LIT */

describe('critère algorithmique · M — « 5 erreurs (3,5 une fois pondérées) »', () => {
    const M = chargerScript('js/evaluation-enonces.js').enoncesAlgo.mentionPonderee;

    it('M.a la parenthèse, virgule décimale, avec son espace de tête ; singulier sous 2 ; rien quand les nombres sont égaux', () => {
        expect(M(5, 3.5)).toBe(' (3,5 une fois pondérées)');
        expect(M(2, 1.5)).toBe(' (1,5 une fois pondérée)');
        expect(M(4, 2)).toBe(' (2 une fois pondérées)');
        expect(M(3, 0.25)).toBe(' (0,25 une fois pondérée)');
        expect(M(5, 5)).toBe('');
        expect(M(5, 5.0000001)).toBe('');
        expect(M(5, undefined)).toBe('');
        expect(M(5, null)).toBe('');
        expect(M(0, 0)).toBe('');
    });

    it('M.b la ligne du PDF : « 5 erreurs (3,5 une fois pondérées) sur 400 mots » ; sans somme, celle d’hier', () => {
        const win = { enoncesAlgo: chargerScript('js/evaluation-enonces.js').enoncesAlgo };
        chargerScript('js/synthese-retroaction-rendu.js', { echapperHtml }, win);
        const base = {
            course: { code: '601-101' }, artefact: { title: 'Dissertation fictive', corrected: '2026-10-21' }, student: { firstName: 'A', lastName: 'B', da: '111' },
            scale: [{ code: 'M', label: 'Maîtrisé', color: '#1565c0' }], overall: { code: 'M', label: 'Maîtrisé', color: '#1565c0' },
            trajectory: [], errors: [], tokens: [], objectives: []
        };
        const critere = (algo) => ({ name: 'Français écrit', code: 'M', weight: 20, comment: '', algo: Object.assign({ mots: 400, noteCalculee: 16.5, pourcentage: 82.5, ponderation: 20 }, algo) });
        const pondere = win.syntheseRetroactionRendu.rendreSyntheseHTML(Object.assign({}, base, { criteria: [critere({ erreurs: 5, sommePonderee: 3.5 })] }));
        expect(pondere).toContain('5 erreurs (3,5 une fois pondérées) sur 400 mots &rarr;');
        const hier = win.syntheseRetroactionRendu.rendreSyntheseHTML(Object.assign({}, base, { criteria: [critere({ erreurs: 5, sommePonderee: null })] }));
        expect(hier).toContain('5 erreurs sur 400 mots &rarr;');
        expect(hier).not.toContain('pondérée');
    });
});

/* ======================================================= L — LES LIBELLÉS */

describe('critère algorithmique · L — les libellés disent la grille et l’échelle', () => {
    function monterLibelles() {
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/gabarits-utils.js', {}, win);
        const fauxDoc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => elementDom() };
        const g = chargerScript('js/grilles.js', { db: { getSync: () => null, get: async () => null }, document: fauxDoc, cle: (k) => k, echapperHtml,
            notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null });
        win.texteDePonderation = g.texteDePonderation;
        chargerScript('js/evaluation-chargement.js', { db: { getSync: () => null }, document: fauxDoc, cle: (k) => k, echapperHtml }, win);
        return win;
    }

    it('L.a « (30 points) » sur une grille en points ; « (30%) » sur toute autre grille', () => {
        const win = monterLibelles();
        const enPoints = { criteres: [{ type: 'analytique', ponderation: 30 }, { type: 'analytique', ponderation: 70 }] };
        expect(win.libellePonderationEval(30, enPoints)).toBe('30 points');
        expect(win.libellePonderationEval(1, enPoints)).toBe('1 point');
        expect(win.libellePonderationEval(30, grilleAlgo())).toBe('30%');
        expect(win.libellePonderationEval('?', enPoints)).toBe('?%');
    });

    it('L.b « Niveau de l’échelle « X » », ou « Niveau » sans échelle nommée — plus « Niveau IDME » partout', () => {
        const win = monterLibelles();
        expect(win.libelleNiveauEval(ECHELLE)).toBe('Niveau de l’échelle « IDME fictive »');
        expect(win.libelleNiveauEval({ id: 'pratique-x', niveaux: [] })).toBe('Niveau');
        expect(win.libelleNiveauEval(null)).toBe('Niveau');
    });
});
