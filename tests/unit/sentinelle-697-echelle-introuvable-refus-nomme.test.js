/**
 * #697 · UNE ÉCHELLE QUI NE SE RÉSOUT PAS N'ÉCRIT PLUS « 0 » (A-1 de l'audit du moteur, 5 sept. 2026)
 *
 * LE DÉFAUT, mesuré au banc de l'audit (A1, A2, A5) : quand `echelleId` ne se trouvait ni dans
 * `echellesTemplates` ni dans une pratique, `calculerNote` sortait tôt (écran « -- »,
 * `noteCalculeeCourante = null`), la porte #674 ne testait que `portee.incomplete` — une portée
 * NULLE passait — et les trois sites d'écriture posaient leur repli `: 0` : un zéro verrouillé,
 * sans portée, et en modification par-dessus une vraie note (84 → 0). L'auto-save de création
 * écrivait le même zéro, non verrouillé. La liste affichait « - » ; la note du cours comptait 0.
 *
 * LA RÈGLE : la porte refuse quand `noteCalculeeCourante === null`, en nommant l'échelle ; rien
 * n'est écrit (un brouillon porterait le même zéro). L'auto-save ne CRÉE rien sans échelle
 * résolue ; une existante garde sa note. Une seule résolution, `resoudreEchelleEvaluation`,
 * pour le calcul, la porte et l'auto-save.
 *
 * Patron : le banc `audit-moteur-evaluation-2026-09-05.test.js` (modules réels, faux DOM).
 * Aucune donnée réelle lue ni écrite.
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
const COMPLET = { c1: 'E', c2: 'E', c3: 'I' };   // 84 (M)
const EV1 = () => ({ id: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1', noteFinale: 84, ponderationCouverte: 100,
    niveauFinal: 'M', verrouillee: false, criteres: [
        { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
        { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 },
        { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', ponderation: 20 } ] });

function monter({ niveaux = COMPLET, echelles = [], echelleId = 'E1', pratiques = [], evaluations = [], idModification } = {}) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(), porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }), selectGrille1: elementDom({ value: 'G1' }),
        selectEchelle1: elementDom({ value: echelleId }), selectCartoucheEval: elementDom({ value: '' }), remiseProduction1: elementDom({ value: 'remis' }),
        statutIntegrite: elementDom({ value: 'recevable' }), notesIntegrite: elementDom({ value: '' }), retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(), afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        eval_c1: elementDom(), eval_c2: elementDom(), eval_c3: elementDom(), comm_c1: elementDom(), comm_c2: elementDom(), comm_c3: elementDom()
    };
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId, cartoucheId: '', criteres: Object.assign({}, niveaux), donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    if (idModification) ec.idModification = idModification;
    const base = { test_grillesTemplates: [GRILLE], test_echellesTemplates: echelles, test_pratiquesConfigurables: pratiques, test_evaluationsSauvegardees: evaluations, test_cartouches_G1: [] };
    const ecritures = [], refus = [], minuteries = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {}, genererRetroaction() {} };
    const globaux = {
        document, evaluationEnCours: ec, cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }] : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }]
            : k === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(evaluations)) : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null, afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false, obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: (fn) => { minuteries.push(fn); return minuteries.length; }, clearTimeout() {}, genererRetroaction() {}, calculerNote: () => win.calculerNote(), mettreAJourCompteurMots() {}
    };
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-chargement.js', globaux, win);
    chargerScript('js/evaluation-sauvegarde.js', globaux, win);
    chargerScript('js/evaluation.js', globaux, win);
    return { win, ecran, ec, ecritures, refus, minuteries };
}
const ecrits = (ecritures) => ecritures.filter((x) => x.k === 'evaluationsSauvegardees');

describe('#697 · la porte refuse une échelle qui ne se résout pas, et le dit', () => {
    it('A · CRÉATION, échelle absente du trimestre : refus « Échelle introuvable » qui nomme l\'identifiant ; RIEN n\'est écrit', () => {
        const { win, ecran, ecritures, refus } = monter({ echelles: [] });
        win.sauvegarderEvaluation();
        expect(ecran.noteProduction1.textContent).toBe('--');
        expect(win.noteCalculeeCourante).toBeNull();
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);
        expect(refus[0].details).toContain('« E1 »');
        expect(refus[0].details).toContain('n\'existe plus dans ce trimestre');
        expect(ecrits(ecritures)).toHaveLength(0);
    });
    it('B · MODIFICATION d\'une évaluation à 84 dont l\'échelle a disparu : refus nommé, l\'existante N\'EST PAS réécrite (avant : 84 → 0, verrouillée)', () => {
        const { win, ecritures, refus } = monter({ echelles: [], evaluations: [EV1()], idModification: 'EV1' });
        win.sauvegarderEvaluationModifiee();
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);
        expect(ecrits(ecritures)).toHaveLength(0);
    });
    it('C · une échelle de pratique (`pratique-<id>`) dont la pratique a disparu : même refus, l\'identifiant nommé', () => {
        const { win, ecritures, refus } = monter({ echelles: [ECHELLE], echelleId: 'pratique-SPE_X', pratiques: [] });
        win.sauvegarderEvaluation();
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);
        expect(refus[0].details).toContain('« pratique-SPE_X »');
        expect(ecrits(ecritures)).toHaveLength(0);
    });
    it('D · aucune échelle choisie du tout : refus qui le dit, sans identifiant fantôme', () => {
        const { win, ecritures, refus } = monter({ echelles: [ECHELLE], echelleId: '' });
        win.sauvegarderEvaluation();
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);
        expect(refus[0].details).toContain('Aucune échelle de performance');
        expect(refus[0].details).not.toContain('«');
        expect(ecrits(ecritures)).toHaveLength(0);
    });
    it('E · la porte juge l\'échelle AVANT la portée : incomplète ET sans échelle → « Échelle introuvable », et aucun brouillon (un brouillon porterait le même zéro)', () => {
        const { win, ecritures, refus } = monter({ echelles: [], niveaux: { c1: 'E', c2: 'E', c3: '' } });
        win.sauvegarderEvaluation();
        expect(refus.map((r) => r.titre)).toEqual(['Échelle introuvable']);
        expect(ecrits(ecritures)).toHaveLength(0);
    });
    it('F · témoin — avec son échelle, la même évaluation s\'enregistre : 84, portée 100, verrouillée, pas un mot de plus', () => {
        const { win, ecritures, refus } = monter({ echelles: [ECHELLE] });
        win.sauvegarderEvaluation();
        expect(refus).toEqual([]);
        const ev = ecrits(ecritures).pop().v.find((e) => e.id === 'EVAL_NEUF');
        expect(ev).toMatchObject({ noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: true });
    });
    it('G · témoin — une échelle de pratique qui EXISTE se résout comme avant (Beta 92)', () => {
        const pratiques = [{ id: 'SPE_X', config: { echelle: { niveaux: ECHELLE.niveaux } } }];
        const { win, ecritures, refus } = monter({ echelles: [], echelleId: 'pratique-SPE_X', pratiques });
        win.sauvegarderEvaluation();
        expect(refus).toEqual([]);
        expect(ecrits(ecritures).pop().v.find((e) => e.id === 'EVAL_NEUF')).toMatchObject({ noteFinale: 84, echelleId: 'pratique-SPE_X' });
    });
});

describe('#697 · l\'auto-save ne crée rien sans échelle résolue ; une existante garde sa note', () => {
    it('H · CRÉATION par l\'auto-save (niveau choisi, minuterie écoulée), échelle absente : aucune écriture (avant : « 0 », portée nulle, non verrouillé)', () => {
        const { win, ecran, ecritures, minuteries } = monter({ echelles: [], niveaux: { c1: 'E', c2: 'E' } });
        ecran.eval_c3.value = 'I';
        win.niveauSelectionne('c3');
        expect(minuteries).toHaveLength(1);
        minuteries[0]();
        expect(ecrits(ecritures)).toHaveLength(0);
    });
    it('I · MISE À JOUR par l\'auto-save d\'une existante, échelle absente : ses critères suivent, sa note reste 84 (#572), sa portée reste 100', () => {
        const { win, ecran, ecritures, minuteries } = monter({ echelles: [], evaluations: [EV1()], idModification: 'EV1' });
        ecran.eval_c3.value = 'E';
        win.niveauSelectionne('c3');
        minuteries[0]();
        const ev = ecrits(ecritures).pop().v.find((e) => e.id === 'EV1');
        expect(ev).toMatchObject({ noteFinale: 84, ponderationCouverte: 100 });
        expect(ev.criteres.find((c) => c.critereId === 'c3').niveauSelectionne).toBe('E');
    });
    it('J · témoin — avec l\'échelle, la création par l\'auto-save écrit le brouillon comme avant (#674 : la note avec sa portée)', () => {
        const { win, ecran, ecritures, minuteries } = monter({ echelles: [ECHELLE], niveaux: { c1: 'E', c2: 'E' } });
        ecran.eval_c3.value = 'I';
        win.niveauSelectionne('c3');
        minuteries[0]();
        const ev = ecrits(ecritures).pop().v.find((e) => e.id === 'EVAL_NEUF');
        expect(ev).toMatchObject({ noteFinale: 84, ponderationCouverte: 100, verrouillee: false });
    });
});

describe('#697 · une seule résolution d\'échelle', () => {
    it('K · `resoudreEchelleEvaluation` : échelle du trimestre, échelle de pratique, absente, vide', () => {
        const pratiques = [{ id: 'SPE_X', config: { echelle: { niveaux: ECHELLE.niveaux, type: 'niveaux' } } }];
        const { win } = monter({ echelles: [ECHELLE], pratiques });
        expect(win.resoudreEchelleEvaluation('E1')).toMatchObject({ id: 'E1' });
        expect(win.resoudreEchelleEvaluation('pratique-SPE_X')).toMatchObject({ id: 'pratique-SPE_X', type: 'niveaux' });
        expect(win.resoudreEchelleEvaluation('pratique-SPE_X').niveaux).toHaveLength(4);
        expect(win.resoudreEchelleEvaluation('E_ABSENTE')).toBeNull();
        expect(win.resoudreEchelleEvaluation('pratique-ABSENTE')).toBeNull();
        expect(win.resoudreEchelleEvaluation('')).toBeNull();
        expect(win.resoudreEchelleEvaluation(undefined)).toBeNull();
    });
});
