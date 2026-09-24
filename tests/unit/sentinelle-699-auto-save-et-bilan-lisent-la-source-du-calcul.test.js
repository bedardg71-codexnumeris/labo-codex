/**
 * #699 · L'AUTO-SAVE ET LE BILAN LISENT LA SOURCE DU CALCUL (G-2 de l'audit du moteur, 5 sept. 2026)
 *
 * #646 : `evaluationEnCours` désigne DEUX emplacements — le `let` de config.js (le nom nu), que
 * `niveauSelectionne` écrit et que `calculerNote` lit, et `window.evaluationEnCours`, que le flux
 * Travaux crée à part. À la réouverture d'une évaluation, les deux portent les mêmes niveaux ;
 * le premier changement les fait diverger. L'auto-save (`_debouncerAutoSave`) prenait son
 * instantané sur `window` : il écrivait la note NEUVE (95) avec les critères ANCIENS (c3 = I).
 * Le bilan lisait `window` : il nommait encore l'ancien défi. Mesuré au banc (G2, G3) et sous
 * WebKit dans le flux réel (`tests/integration/evaluation-699-auto-save-lit-la-source-du-calcul.spec.js`).
 *
 * LA RÈGLE : un seul état vivant (`etatVivantEvaluationEnCours`, evaluation-calcul.js), le nu
 * l'emportant EN BLOC (un niveau retiré du nu ne resurgit pas de `window`), pour la porte,
 * l'auto-save et le bilan. La réunification des deux emplacements reste #646, inscrite.
 *
 * Ce banc reproduit les deux emplacements en donnant au bac à sable DEUX objets distincts : le
 * nom nu (paramètre `evaluationEnCours`) et `window.evaluationEnCours`. Aucune donnée réelle.
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
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 } ] };
const GRILLE = { id: 'G1', nom: 'Grille 50/30/20', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 50 }, { id: 'c2', nom: 'Organisation', ponderation: 30 }, { id: 'c3', nom: 'Langue', ponderation: 20 } ] };
const EV1 = () => ({ id: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1', noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: false,
    criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 }, { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 },
        { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', ponderation: 20 }] });
const ec = (criteres, extra) => Object.assign({ etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1', cartoucheId: '', criteres: Object.assign({}, criteres),
    donneesAlgorithmiques: {}, pointsAnalytiques: {} }, extra || {});

/** L'état après réouverture : `window` porte les niveaux enregistrés et `idModification` ; le nu porte les niveaux rejoués. */
function monter({ nu, fenetre, evaluations = [EV1()] }) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(), porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }), selectGrille1: elementDom({ value: 'G1' }),
        selectEchelle1: elementDom({ value: 'E1' }), selectCartoucheEval: elementDom({ value: '' }), remiseProduction1: elementDom({ value: 'remis' }),
        statutIntegrite: elementDom({ value: 'recevable' }), notesIntegrite: elementDom({ value: '' }), retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(), afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        eval_c1: elementDom(), eval_c2: elementDom(), eval_c3: elementDom(), comm_c1: elementDom(), comm_c2: elementDom(), comm_c3: elementDom(),
        contenuRetroBilan: elementDom(), vueRetroGenerale: elementDom(), vueRetroSpecifique: elementDom(), vueRetroBilan: elementDom()
    };
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const base = { test_grillesTemplates: [GRILLE], test_echellesTemplates: [ECHELLE], test_pratiquesConfigurables: [], test_evaluationsSauvegardees: evaluations, test_cartouches_G1: [] };
    const ecritures = [], minuteries = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: fenetre, majBadgesApresEvaluation() {}, genererRetroaction() {} };
    const globaux = {
        document, evaluationEnCours: nu, cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }] : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }]
            : k === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(evaluations)) : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null, afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false, obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: (fn) => { minuteries.push(fn); return minuteries.length; }, clearTimeout() {}, genererRetroaction() {}, calculerNote: () => win.calculerNote(), mettreAJourCompteurMots() {},
        niveauDuCodeDansEchelle: (code) => ({ I: { code: 'I', nom: 'Insuffisant', rang: 0 }, D: { code: 'D', nom: 'En développement', rang: 1 }, M: { code: 'M', nom: 'Maîtrisé', rang: 2 }, E: { code: 'E', nom: 'Étendu', rang: 3 } })[code] || null,
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
    chargerScript('js/synthese-retroaction-data.js', globaux, win);
    chargerScript('js/evaluation-retroaction.js', globaux, win);
    return { win, ecran, ecritures, minuteries };
}
const ev1Ecrite = (ecritures) => { const e = ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop(); return e ? e.v.find((v) => v.id === 'EV1') : null; };
const c3De = (ev) => (ev.criteres.find((c) => c.critereId === 'c3') || {}).niveauSelectionne;

describe('#699 · après réouverture, un niveau changé : l\'auto-save écrit ce que le calcul a lu', () => {
    it('A · c3 I → E dans le nu (window garde I) : l\'auto-save écrit noteFinale 95 ET c3 = E (avant : 95 avec c3 = I)', () => {
        const fenetre = ec({ c1: 'E', c2: 'E', c3: 'I' }, { idModification: 'EV1' });
        const nu = ec({ c1: 'E', c2: 'E', c3: 'I' });
        const { win, ecran, ecritures, minuteries } = monter({ nu, fenetre });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');
        expect(nu.criteres.c3).toBe('E');
        expect(fenetre.criteres.c3).toBe('I');   // les deux emplacements divergent toujours : c'est #646, inscrit
        minuteries[0]();
        const ev = ev1Ecrite(ecritures);
        expect(ev).toMatchObject({ noteFinale: 95, niveauFinal: 'E', ponderationCouverte: 100, verrouillee: false });
        expect(c3De(ev)).toBe('E');
    });
    it('B · un niveau RETIRÉ du nu ne resurgit pas de window : l\'auto-save écrit deux critères et la portée 80 (une fusion clé par clé l\'aurait ramené)', () => {
        const fenetre = ec({ c1: 'E', c2: 'E', c3: 'I' }, { idModification: 'EV1' });
        const nu = ec({ c1: 'E', c2: 'E', c3: 'I' });
        const { win, ecran, ecritures, minuteries } = monter({ nu, fenetre });
        ecran.eval_c3.value = '';
        win.niveauSelectionne('c3');   // vide le niveau dans le nu ('' : pas de niveau)
        minuteries[0]();
        const ev = ev1Ecrite(ecritures);
        expect(ev.criteres.map((c) => c.critereId)).toEqual(['c1', 'c2']);
        expect(ev).toMatchObject({ noteFinale: 95, ponderationCouverte: 80 });
    });
    it('C · l\'instantané porte les identifiants (élève, production, grille, échelle, idModification) là où ils sont', () => {
        const fenetre = ec({ c1: 'E' }, { idModification: 'EV1' });
        const nu = ec({ c1: 'E', c2: 'D' });
        const { win } = monter({ nu, fenetre });
        expect(win.etatVivantEvaluationEnCours()).toMatchObject({ etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1', idModification: 'EV1', criteres: { c1: 'E', c2: 'D' } });
    });
    it('D · les données algorithmiques gardent le repli sur window quand le nu n\'en a aucune (la réouverture les y pose en premier)', () => {
        const fenetre = ec({ c1: 'E' }, { donneesAlgorithmiques: { a1: { erreurs: 3, mots: 500, pourcentage: 70 } } });
        const nu = ec({ c1: 'E' });
        const { win } = monter({ nu, fenetre });
        expect(win.etatVivantEvaluationEnCours().donneesAlgorithmiques).toEqual({ a1: { erreurs: 3, mots: 500, pourcentage: 70 } });
    });
    it('E · témoin — quand les deux noms désignent le MÊME objet, rien ne change', () => {
        const seul = ec({ c1: 'E', c2: 'E', c3: 'I' }, { idModification: 'EV1' });
        const { win, ecran, ecritures, minuteries } = monter({ nu: seul, fenetre: seul });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');
        minuteries[0]();
        const ev = ev1Ecrite(ecritures);
        expect(ev.noteFinale).toBe(95);
        expect(c3De(ev)).toBe('E');
    });
});

describe('#699 · le bilan lit la même source', () => {
    it('F · après c3 I → E dans le nu, le bilan ne nomme plus « Langue (Insuffisant) » comme défi ; il dit tout acquis (avant : il lisait window)', () => {
        const fenetre = ec({ c1: 'E', c2: 'E', c3: 'I' }, { idModification: 'EV1' });
        const nu = ec({ c1: 'E', c2: 'E', c3: 'I' });
        const { win, ecran } = monter({ nu, fenetre });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');
        win.basculerVueRetroaction('bilan');
        const html = ecran.contenuRetroBilan.innerHTML;
        expect(html).not.toContain('Langue (Insuffisant)');
        expect(html).not.toContain('Aucun critère n\'est encore évalué');
    });
    it('G · témoin — avant tout changement (les deux emplacements égaux), le bilan nomme Langue (Insuffisant) comme défi', () => {
        const fenetre = ec({ c1: 'E', c2: 'E', c3: 'I' }, { idModification: 'EV1' });
        const nu = ec({ c1: 'E', c2: 'E', c3: 'I' });
        const { win, ecran } = monter({ nu, fenetre });
        win.basculerVueRetroaction('bilan');
        expect(ecran.contenuRetroBilan.innerHTML).toContain('Langue (Insuffisant)');
    });
});
