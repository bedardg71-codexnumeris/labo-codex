/**
 * #698 · EFFACER LES CODES OU LES MOTS TARIT LA MÉMOIRE DU CRITÈRE ALGORITHMIQUE
 * (D-2 de l'audit du moteur, 5 septembre 2026)
 *
 * LE DÉFAUT, mesuré au banc de l'audit (D2, D3, D4) : les deux réinitialisations
 * (`_viderResultatAlgoSimple`, et la garde `mots === 0 || totalErreurs === 0` du mode catégories)
 * fusionnaient la saisie neuve SUR l'ancien objet de `donneesAlgorithmiques` : `pourcentage`,
 * `noteCalculee`, `niveau`, `sommePonderee` survivaient ; `evaluationEnCours.criteres[critereId]`
 * gardait le niveau ; `calculerNote` n'était pas rappelée. L'écran du critère disait « -- », la
 * note ne bougeait pas (84,7 %), et l'enregistrement — dont le recalcul rejouait la même garde —
 * persistait « 0 erreur → 17,50/20 (87,5 %) », que le PDF de l'élève imprime tel quel.
 *
 * LA RÈGLE : la saisie reste (erreurs, mots, codes, totalErreurs — fix #110 v3), le RÉSULTAT
 * part, le niveau posé par le calcul part (un niveau choisi à la main au menu reste), et la
 * note se recalcule tout de suite : le critère redevient « sans niveau », la porte #674 retient.
 *
 * ↻ #704 (19 sept. 2026, décision de Grégoire du 17) — ZÉRO ERREUR DONNE LA NOTE COMPLÈTE dans
 * les deux modes : en mode catégories, des codes effacés ne sont plus « pas de résultat » mais
 * « aucune erreur ». Ce que #698 protège tient toujours — AUCUN RÉSULTAT PÉRIMÉ ne survit — et se
 * lit maintenant de deux façons : codes effacés → un résultat NEUF (100 %, jamais l'ancien
 * 87,5) ; mots effacés → le résultat part (essais A, B, E réancrés sur les mots ; A bis neuf).
 *
 * Patron : le banc `audit-moteur-evaluation-2026-09-05.test.js`. Aucune donnée réelle.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function classList(initial) {
    const s = new Set(initial || []);
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; } };
}
function elementDom(init) {
    return Object.assign({ value: '', textContent: '', innerHTML: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {}, dispatchEvent() { return true; } }, init || {});
}
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}
const ECHELLE = { id: 'E1', nom: 'IDME témoin', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 54 }, { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 84 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 } ] };
// Contenu 80 (holistique) · Français écrit 20 (algorithmique, deux sous-critères 1 et 1,5).
const GRILLE = { id: 'GA', nom: 'Contenu 80 · Français 20', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 },
    { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', sousCriteres: [
        { id: 'SC1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' }, { id: 'SC4', code: '4', nom: 'Accord GN', ponderation: 1.5, retroaction: '' } ] } ] };
const GRILLE_SIMPLE = { id: 'GS', nom: 'Contenu 80 · Français 20 (simple)', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 }, { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' } ] };

function champsAlgo(id) {
    const e = {};
    ['eval_erreurs_', 'eval_mots_', 'eval_categories_', 'total_erreurs_', 'mots_formule_', 'total_erreurs_simple_', 'mots_simple_', 'note_algo_', 'pct_algo_',
     'niveau_algo_', 'cat_dominante_', 'formule_algo_', 'resultat_algo_', 'retroaction_cat_', 'comm_', 'eval_'].forEach((p) => { e[p + id] = elementDom(); });
    return e;
}
function monter({ grille = GRILLE, chaine = false } = {}) {
    const ecran = Object.assign({
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(), porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEchelle1: elementDom({ value: 'E1' }), selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }),
        selectGrille1: elementDom({ value: grille.id }), selectCartoucheEval: elementDom({ value: '' }), remiseProduction1: elementDom({ value: 'remis' }),
        statutIntegrite: elementDom({ value: 'recevable' }), notesIntegrite: elementDom({ value: '' }), retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(), afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        eval_c1: elementDom(), comm_c1: elementDom()
    }, champsAlgo('a1'));
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId: 'E1', cartoucheId: '', criteres: { c1: 'M' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    const base = { test_grillesTemplates: [grille], test_echellesTemplates: [ECHELLE], test_pratiquesConfigurables: [], test_evaluationsSauvegardees: [] };
    base['test_cartouches_' + grille.id] = [];
    const ecritures = [], refus = [], retro = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {}, genererRetroaction(n) { retro.push(n); } };
    const globaux = {
        document, evaluationEnCours: ec, cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }] : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }] : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null, afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false, obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {}, genererRetroaction() {}, calculerNote: () => win.calculerNote(), mettreAJourCompteurMots() {}
    };
    chargerScript('js/evaluation-formules.js', globaux, win);
    chargerScript('js/evaluation-enonces.js', globaux, win);
    chargerScript('js/evaluation-projection.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    if (chaine) {
        chargerScript('js/evaluation-chargement.js', globaux, win);
        chargerScript('js/evaluation-sauvegarde.js', globaux, win);
        chargerScript('js/evaluation.js', globaux, win);
    }
    return { win, ecran, ec, ecritures, refus, retro };
}
const categories = (h, codes, mots) => { h.ecran.eval_categories_a1.value = codes; h.ecran.eval_mots_a1.value = mots; h.win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1'); };
const simple = (h, erreurs, mots) => { h.ecran.eval_erreurs_a1.value = erreurs; h.ecran.eval_mots_a1.value = mots; h.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500); };

describe('#698 · effacer tarit la mémoire — mode CATÉGORIES', () => {
    it('A · « 1;4 » sur 500 mots : 87,5 % (M), note 84,7 % — puis mots EFFACÉS : le résultat part, la saisie reste, le critère est sans niveau, la note se retient', () => {
        const h = monter();
        categories(h, '1;4', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ pourcentage: 87.5, niveau: 'M', sommePonderee: 2.5 });
        expect(h.ec.criteres.a1).toBe('M');
        expect(h.ecran.noteProduction1.textContent).toBe('84,7\u00A0%');
        categories(h, '1;4', '');
        expect(h.ec.donneesAlgorithmiques.a1).toEqual({ codes: ['1', '4'], mots: 0, totalErreurs: 2 });   // #110 v3 : la saisie reste
        expect(h.ec.criteres.a1).toBeUndefined();
        expect(h.ecran.niveau_algo_a1.textContent).toBe('--');
        expect(h.ecran.noteProduction1.textContent).toBe('--');
        expect(h.win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 80, incomplete: true });
        expect(h.win.porteeCalculeeCourante.criteresHorsNote.map((c) => c.critereId + ':' + c.motif)).toEqual(['a1:sans-niveau']);
        expect(h.ecran.porteeNote1.textContent).toContain('Français écrit (20 %)');
    });
    it('A bis · #704 — codes EFFACÉS sur 500 mots : aucune erreur, donc un résultat NEUF (100 %, E, note 87,2 %) ; rien de l\'ancien 87,5 ne survit', () => {
        const h = monter();
        categories(h, '1;4', '500');
        categories(h, '', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ codes: [], mots: 500, totalErreurs: 0, sommePonderee: 0, noteCalculee: 20, pourcentage: 100, niveau: 'E' });
        expect(h.ec.criteres.a1).toBe('E');
        expect(h.ecran.niveau_algo_a1.textContent).toBe('E');
        expect(h.ecran.cat_dominante_a1.textContent).toBe('--');
        expect(h.ecran.noteProduction1.textContent).toBe('87,2\u00A0%');   // 0,8×84 + 0,2×100
        expect(h.win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 100, incomplete: false });
    });
    it('B · la rétroaction engendrée part aussi (#673 tient) et la rétroaction générale est régénérée', () => {
        const h = monter();
        categories(h, '1;4', '500');
        expect(h.ecran.comm_a1.textContent).not.toBe('');
        const avant = h.retro.length;
        categories(h, '1;4', '');
        expect(h.ecran.comm_a1.textContent).toBe('');
        expect(h.retro.length).toBeGreaterThan(avant);
    });
    it('B bis · #704 — codes effacés : la rétroaction est RÉÉCRITE pour zéro erreur (l\'énoncé du gabarit), jamais l\'amorce « Saisissez les codes… »', () => {
        const h = monter();
        categories(h, '1;4', '500');
        categories(h, '', '500');
        expect(h.ecran.comm_a1.textContent).toContain('0 erreur');
        expect(h.ecran.comm_a1.textContent).not.toContain('Saisissez');
        expect(h.ec.donneesAlgorithmiques.a1.retroaction).toBe(h.ecran.comm_a1.textContent);
    });
    it('C · un niveau choisi À LA MAIN au menu du critère (reprise ciblée) survit à l\'effacement, et compte — #704 ne le remplace pas par 100 %', () => {
        const h = monter();
        categories(h, '1;4', '500');
        h.ecran.eval_a1.value = 'D'; h.ec.criteres.a1 = 'D';   // le geste de `niveauSelectionne` sur le menu du critère
        categories(h, '', '500');
        expect(h.ec.criteres.a1).toBe('D');
        expect(h.ec.donneesAlgorithmiques.a1.pourcentage).toBeUndefined();
        expect(h.win.noteCalculeeCourante).toBeCloseTo(0.8 * 84 + 0.2 * 65, 10);   // 80,2 : D vaut 65
    });
    it('D · le nombre de mots EFFACÉ en mode catégories : même règle', () => {
        const h = monter();
        categories(h, '1;4', '500');
        categories(h, '1;4', '');
        expect(h.ec.donneesAlgorithmiques.a1).toEqual({ codes: ['1', '4'], mots: 0, totalErreurs: 2 });
        expect(h.ec.criteres.a1).toBeUndefined();
        expect(h.ecran.noteProduction1.textContent).toBe('--');
    });
    it('E · l\'ENREGISTREMENT après effacement des MOTS : la porte refuse « incomplète » et le brouillon ne porte AUCUN résultat périmé (avant : 84,7 persisté, 87,5 en mémoire, M en base)', () => {
        const h = monter({ chaine: true });
        categories(h, '1;4', '500');
        categories(h, '1;4', '');
        h.win.sauvegarderEvaluation();
        expect(h.refus.map((r) => r.titre)).toEqual(['Évaluation incomplète']);
        const ev = h.ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop().v.find((e) => e.id === 'EVAL_NEUF');
        expect(ev).toMatchObject({ noteFinale: 84, ponderationCouverte: 80, verrouillee: false });
        expect(ev.criteres.map((c) => c.critereId)).toEqual(['c1']);
        expect(ev.donneesAlgorithmiques.a1).toEqual({ codes: ['1', '4'], mots: 0, totalErreurs: 2 });
    });
    it('E bis · #704 — l\'ENREGISTREMENT d\'une copie sans faute (codes effacés, 500 mots) : aucun refus, 87,2 sur 100 %, le critère entre avec son niveau E', () => {
        const h = monter({ chaine: true });
        categories(h, '1;4', '500');
        categories(h, '', '500');
        h.win.sauvegarderEvaluation();
        expect(h.refus).toEqual([]);
        const ev = h.ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop().v.find((e) => e.id === 'EVAL_NEUF');
        expect(ev).toMatchObject({ ponderationCouverte: 100, verrouillee: true });
        expect(ev.noteFinale).toBeCloseTo(87.2, 10);
        expect(ev.criteres.map((c) => c.critereId + ':' + c.niveauSelectionne)).toEqual(['c1:M', 'a1:E']);
    });
    it('F · témoin — un calcul valide est inchangé : 87,5 (M), 84,7 %, formule affichée, dominante nommée', () => {
        const h = monter();
        categories(h, '1;4;1', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ totalErreurs: 3, sommePonderee: 3.5, pourcentage: 82.5, niveau: 'M' });
        expect(h.ecran.cat_dominante_a1.textContent).toContain('Syntaxe');
        expect(h.ecran.noteProduction1.textContent).toBe('83,7\u00A0%');   // 0,8×84 + 0,2×82,5
    });
});

describe('#698 · effacer tarit la mémoire — mode SIMPLE', () => {
    it('G · 4 erreurs / 500 mots : 80 % (M), note 83,2 % — puis mots EFFACÉS : le résultat part, erreurs et mots restent, la note se retient', () => {
        const h = monter({ grille: GRILLE_SIMPLE });
        simple(h, '4', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ erreurs: 4, mots: 500, pourcentage: 80, niveau: 'M' });
        expect(h.ecran.noteProduction1.textContent).toBe('83,2\u00A0%');
        simple(h, '4', '');
        expect(h.ec.donneesAlgorithmiques.a1).toEqual({ erreurs: 4, mots: 0 });
        expect(h.ec.criteres.a1).toBeUndefined();
        expect(h.ecran.niveau_algo_a1.textContent).toBe('--');
        expect(h.ecran.noteProduction1.textContent).toBe('--');
    });
    it('H · une formule non applicable (pondération absente) vide de la même façon', () => {
        const h = monter({ grille: GRILLE_SIMPLE });
        simple(h, '4', '500');
        h.ecran.eval_erreurs_a1.value = '4'; h.ecran.eval_mots_a1.value = '500';
        h.win.calculerNoteAlgorithmiqueSimple('a1', 0, 500);   // pondération 0 → `formulesAlgo.calculer` : non applicable
        expect(h.ec.donneesAlgorithmiques.a1.pourcentage).toBeUndefined();
        expect(h.ec.criteres.a1).toBeUndefined();
    });
    it('I · l\'ENREGISTREMENT en mode simple après mots effacés : refus « incomplète », brouillon sans résultat périmé', () => {
        const h = monter({ grille: GRILLE_SIMPLE, chaine: true });
        simple(h, '4', '500');
        simple(h, '4', '');
        h.win.sauvegarderEvaluation();
        expect(h.refus.map((r) => r.titre)).toEqual(['Évaluation incomplète']);
        const ev = h.ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop().v.find((e) => e.id === 'EVAL_NEUF');
        expect(ev.donneesAlgorithmiques.a1).toEqual({ erreurs: 4, mots: 0 });
        expect(ev.criteres.map((c) => c.critereId)).toEqual(['c1']);
    });
    it('J · témoin — 0 erreur sur 500 mots reste 100 % (E) : ce n\'est pas un effacement', () => {
        const h = monter({ grille: GRILLE_SIMPLE });
        simple(h, '0', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ pourcentage: 100, niveau: 'E' });
        expect(h.ecran.noteProduction1.textContent).toBe('87,2\u00A0%');
    });
});
