/**
 * #674 · LES DEUX PORTES — le refus va au LIVRABLE, jamais à la saisie
 *
 * La forme tranchée le 1er septembre 2026 : la portée de la note voyage avec elle, et
 * chaque consommateur décide pour lui-même. Deux portes refusent franchement :
 *   · l'ENREGISTREMENT (`sauvegarderEvaluation`, `sauvegarderEvaluationModifiee`),
 *     sur le patron de `_validerReferencesSauv` : dit pourquoi, rend `false`, sort ;
 *   · le PDF de l'élève (`construireFeedback` → rendu) : refuse de CONCLURE — pas de
 *     bandeau « Niveau général » — et NOMME ce qui manque.
 * Et une non-porte, qui compte autant : l'AUTO-SAVE continue d'écrire pendant la saisie
 * (une évaluation en cours est forcément incomplète), mais il écrit la note AVEC sa
 * portée — sans quoi la portée manquerait précisément sur la majorité des évaluations.
 *
 * ⮕ CHEMINS RÉELS : les modules sont chargés dans le bac à sable et les fonctions
 * publiques appelées telles quelles, avec `calculerNote()` réelle derrière la porte.
 * Le second témoin, souvent oublié : une évaluation COMPLÈTE s'enregistre et s'exporte
 * SANS UN MOT DE PLUS. Un correctif qui avertit tout le monde n'avertit personne.
 *
 * ⚠ Aucune donnée réelle lue ni écrite.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

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
        value: '', textContent: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {}
    }, init || {});
}

// Miroir de la règle unique de `js/echelles.js` (#525/#527).
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

const GRILLE = {
    id: 'G1', nom: 'Grille témoin 50/30/20',
    criteres: [
        { id: 'c1', nom: 'Contenu', ponderation: 50 },
        { id: 'c2', nom: 'Organisation', ponderation: 30 },
        { id: 'c3', nom: 'Langue', ponderation: 20 }
    ]
};
const ECHELLE = {
    id: 'E1', nom: 'IDME témoin',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
        { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#00aa00' },
        { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
    ]
};
const ECHELLE_MUETTE = {
    id: 'E1', nom: 'Chimie organique (copie muette)',
    niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82 }
    ]
};

const COMPLET = { c1: 'E', c2: 'E', c3: 'I' };      // 84,0 % (M)
const INCOMPLET = { c1: 'E', c2: 'E', c3: '' };     // renormalisé à 95,0 % avant #674

function ecranEvaluation() {
    return {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: '1234567' }),
        selectProduction1: elementDom({ value: 'P1' }),
        selectGrille1: elementDom({ value: 'G1' }),
        selectEchelle1: elementDom({ value: 'E1' }),
        selectCartoucheEval: elementDom({ value: 'C1' }),
        remiseProduction1: elementDom({ value: 'remis' }),
        statutIntegrite: elementDom({ value: 'recevable' }),
        notesIntegrite: elementDom({ value: '' }),
        retroactionFinale1: elementDom({ value: 'Bien.' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(),
        afficherAdresse1: elementDom(), afficherContexte1: elementDom()
    };
}

/**
 * Monte l'écran d'évaluation avec le calcul (`evaluation-calcul.js`), l'enregistrement
 * (`evaluation-sauvegarde.js`) et la modification (`evaluation.js`) dans le MÊME bac à
 * sable, et capture ce qui est écrit et ce qui est refusé.
 */
function monterEnregistrement({ niveaux, echelle = ECHELLE, modification = false }) {
    const ecran = ecranEvaluation();
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const ec = {
        etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1',
        criteres: Object.assign({}, niveaux), donneesAlgorithmiques: {},
        idModification: modification ? 'EV1' : undefined
    };
    const base = {
        test_grillesTemplates: [GRILLE],
        test_echellesTemplates: [echelle],
        test_pratiquesConfigurables: [],
        test_evaluationsSauvegardees: modification
            ? [{ id: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', noteFinale: 42, niveauFinal: 'M', verrouillee: false, criteres: [] }]
            : []
    };
    const ecritures = [];
    const refus = [];
    const succes = [];
    const win = {
        addEventListener() {}, removeEventListener() {},
        evaluationEnCours: ec,
        majBadgesApresEvaluation() {}
    };
    const globaux = {
        document,
        evaluationEnCours: ec,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k,
        valeurNumeriqueDuNiveau,
        echapperHtml: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'NEUF',
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }]
            : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }] : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: {
            succes(m) { succes.push(m); },
            erreur(t, m) { refus.push({ titre: t, details: m }); },
            info() {}, warning() {}
        },
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {}
    };
    chargerScript('js/evaluation-calcul.js', globaux, win);
    // L'auto-save vit dans evaluation-chargement.js : c'est lui que la porte appelle
    // pour écrire le brouillon quand elle refuse.
    chargerScript('js/evaluation-chargement.js', globaux, win);
    chargerScript('js/evaluation-sauvegarde.js', globaux, win);
    chargerScript('js/evaluation.js', globaux, win);
    return { win, ecran, ec, ecritures, refus, succes };
}

function evaluationEcrite(ecritures, id) {
    const e = ecritures.find((x) => x.k === 'evaluationsSauvegardees');
    if (!e) return null;
    return e.v.find((ev) => ev.id === id) || null;
}

/** Ce qu'un refus a le droit d'écrire : un BROUILLON (non verrouillé), jamais une conclusion. */
function seulUnBrouillon(ecritures) {
    const ecrits = ecritures.filter((x) => x.k === 'evaluationsSauvegardees');
    expect(ecrits, 'le refus doit écrire le brouillon, une fois').toHaveLength(1);
    expect(ecrits[0].v.every((ev) => ev.verrouillee !== true), 'aucune évaluation verrouillée ne doit sortir d\'un refus').toBe(true);
    return ecrits[0].v;
}

describe('#674 · porte 1 — l\'enregistrement refuse ce qui ne porte pas sur toute la grille', () => {
    // ⚠ Un refus qui n'écrivait RIEN laissait la copie sans aucune évaluation en base :
    // `sauvegarderEvaluation` annule l'auto-save en attente avant d'arriver à la porte.
    // Mesuré par Grégoire le 2 septembre 2026 à 17 h 53 (badge « Importé », export Léa
    // « aucune évaluation trouvée »). Le refus écrit donc le brouillon, et le dit.
    it('création INCOMPLÈTE (Langue sans niveau) → refus nommé, et le BROUILLON est conservé (note 95 sur 80 %, non verrouillé)', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: INCOMPLET });
        win.sauvegarderEvaluation();
        expect(refus).toHaveLength(1);
        expect(refus[0].titre).toBe('Évaluation incomplète');
        expect(refus[0].details).toContain('Langue (20 %)');
        expect(refus[0].details).toContain('80 % de la grille');
        expect(refus[0].details).toContain('l\'évaluation n\'est pas enregistrée');
        const brouillon = seulUnBrouillon(ecritures).find((ev) => ev.id === 'EVAL_NEUF');
        expect(brouillon, 'le brouillon doit exister : la copie reste exportable').toBeTruthy();
        expect(brouillon).toMatchObject({ noteFinale: 95, ponderationCouverte: 80, verrouillee: false, niveauFinal: '--' });
    });

    it('création COMPLÈTE → écrite, note 84 AVEC sa portée 100, et pas un mot de plus', () => {
        const { win, ecritures, refus, succes } = monterEnregistrement({ niveaux: COMPLET });
        win.sauvegarderEvaluation();
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EVAL_NEUF');
        expect(ev, 'le chemin de création doit aboutir').not.toBeNull();
        expect(ev.noteFinale).toBe(84);
        expect(ev.ponderationCouverte).toBe(100);
        expect(ev.niveauFinal).toBe('M');
        expect(succes.length).toBeGreaterThan(0);
    });

    it('création sur une échelle MUETTE (niveaux sans valeurCalcul) → refus nommé, motif dit, brouillon « 0 sur 0 % » conservé', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: { c1: 'M', c2: 'M', c3: 'M' }, echelle: ECHELLE_MUETTE });
        win.sauvegarderEvaluation();
        expect(refus).toHaveLength(1);
        expect(refus[0].details).toContain('valeur');
        expect(refus[0].details).toContain('Contenu (M)');
        expect(refus[0].details).toContain('Échelles de performance');
        const brouillon = seulUnBrouillon(ecritures).find((ev) => ev.id === 'EVAL_NEUF');
        expect(brouillon).toMatchObject({ noteFinale: 0, ponderationCouverte: 0, verrouillee: false });
    });

    it('témoin — une évaluation VIDE (aucun niveau : jeton de délai seul) s\'enregistre, portée 0 déclarée', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: {} });
        win.sauvegarderEvaluation();
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EVAL_NEUF');
        expect(ev).not.toBeNull();
        expect(ev.noteFinale).toBe(0);
        expect(ev.ponderationCouverte).toBe(0);
    });

    it('modification INCOMPLÈTE → refus nommé ; l\'existante est mise à jour en BROUILLON, jamais verrouillée', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: INCOMPLET, modification: true });
        win.sauvegarderEvaluationModifiee();
        expect(refus).toHaveLength(1);
        expect(refus[0].titre).toBe('Évaluation incomplète');
        expect(refus[0].details).toContain('Langue (20 %)');
        const ev = seulUnBrouillon(ecritures).find((x) => x.id === 'EV1');
        expect(ev).toBeTruthy();
        expect(ev).toMatchObject({ noteFinale: 95, ponderationCouverte: 80, verrouillee: false });
    });

    it('modification COMPLÈTE → réécrite, note 84 AVEC sa portée 100, verrouillée', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: COMPLET, modification: true });
        win.sauvegarderEvaluationModifiee();
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EV1');
        expect(ev, 'le chemin de modification doit aboutir').not.toBeNull();
        expect(ev.noteFinale).toBe(84);
        expect(ev.ponderationCouverte).toBe(100);
        expect(ev.verrouillee).toBe(true);
    });

    it('la porte recalcule AVANT de juger : une portée périmée sur `window` ne fait pas passer un incomplet', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: INCOMPLET });
        // Une portée « complète » laissée par une évaluation précédente…
        win.porteeCalculeeCourante = { ponderationCouverte: 100, ponderationGrille: 100, criteresHorsNote: [], commencee: true, incomplete: false };
        win.sauvegarderEvaluation();
        // …ne compte pas : la porte a rappelé calculerNote() et jugé l'état réel.
        expect(refus).toHaveLength(1);
        seulUnBrouillon(ecritures);
    });

    it('témoin du brouillon — sans auto-save chargé, le refus ne peut rien conserver et reste un refus (rien n\'est écrit)', () => {
        const { win, ecritures, refus } = monterEnregistrement({ niveaux: INCOMPLET });
        delete win._autoSauvegarderCriteres;
        win.sauvegarderEvaluation();
        expect(refus).toHaveLength(1);
        expect(ecritures.filter((x) => x.k === 'evaluationsSauvegardees')).toEqual([]);
    });
});

/** Le chemin de l'auto-save (`evaluation-chargement.js`), seul dans son bac à sable. */
function monterAutoSave({ existante }) {
    const ecran = ecranEvaluation();
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const base = {
        grillesTemplates: [GRILLE],
        evaluationsSauvegardees: existante
            ? [{ id: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', noteFinale: 42, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: false, criteres: [] }]
            : []
    };
    const ecritures = [];
    const refus = [];
    const win = chargerScript('js/evaluation-chargement.js', {
        document,
        db: { get: async () => null, getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), set: async () => {}, setSync() {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'AUTO',
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }]
            : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }] : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null
    }, { addEventListener() {}, removeEventListener() {} });
    win.evaluationEnCours = {
        etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1',
        criteres: { c1: 'E', c2: 'E' }, donneesAlgorithmiques: {}
    };
    return { win, ecritures, refus };
}

describe('#674 · non-porte — l\'auto-save écrit pendant la saisie, la note AVEC sa portée', () => {
    it('création par l\'auto-save d\'une évaluation INCOMPLÈTE : aucun refus, noteFinale 95 et ponderationCouverte 80', () => {
        const { win, ecritures, refus } = monterAutoSave({ existante: false });
        // Ce que calculerNote() vient de publier pour « c1 E, c2 E, c3 sans niveau ».
        win.noteCalculeeCourante = 95;
        win.porteeCalculeeCourante = { ponderationCouverte: 80, ponderationGrille: 100, criteresHorsNote: [{ critereId: 'c3', nom: 'Langue', ponderation: 20, motif: 'sans-niveau', niveau: '' }], commencee: true, incomplete: true };
        win._autoSauvegarderCriteres(null);
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EVAL_AUTO');
        expect(ev, 'l\'auto-save doit CRÉER l\'évaluation').not.toBeNull();
        expect(ev.noteFinale).toBe(95);
        expect(ev.ponderationCouverte).toBe(80);
        expect(ev.verrouillee).toBe(false);
    });

    it('mise à jour par l\'auto-save d\'une évaluation existante : la portée est réécrite avec la note', () => {
        const { win, ecritures, refus } = monterAutoSave({ existante: true });
        win.noteCalculeeCourante = 95;
        win.porteeCalculeeCourante = { ponderationCouverte: 80, ponderationGrille: 100, criteresHorsNote: [], commencee: true, incomplete: true };
        win._autoSauvegarderCriteres(null);
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EV1');
        expect(ev).not.toBeNull();
        expect(ev.noteFinale).toBe(95);
        expect(ev.ponderationCouverte).toBe(80);
    });

    it('témoin — sans portée publiée (calculerNote jamais passée), l\'existante garde sa déclaration, la neuve n\'en invente pas', () => {
        const { win, ecritures } = monterAutoSave({ existante: true });
        win.noteCalculeeCourante = 95;
        win.porteeCalculeeCourante = null;
        win._autoSauvegarderCriteres(null);
        expect(evaluationEcrite(ecritures, 'EV1').ponderationCouverte).toBe(100);

        const neuf = monterAutoSave({ existante: false });
        neuf.win.noteCalculeeCourante = 95;
        neuf.win.porteeCalculeeCourante = null;
        neuf.win._autoSauvegarderCriteres(null);
        expect(evaluationEcrite(neuf.ecritures, 'EVAL_AUTO').ponderationCouverte).toBeNull();
    });
});

/** Le PDF de l'élève : données (`synthese-retroaction-data.js`) puis rendu. */
function monterPdf({ echelle = ECHELLE, grille = GRILLE } = {}) {
    const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
    const base = { test_grillesTemplates: [grille] };
    const communs = {
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
        obtenirEchelleResolue: () => echelle,
        obtenirDonneesSelonMode: () => [],
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        porteeDepuisEvaluation: calcul.porteeDepuisEvaluation,
        texteCriteresHorsNote: calcul.texteCriteresHorsNote
    };
    const data = chargerScript('js/synthese-retroaction-data.js', communs);
    const rendu = chargerScript('js/synthese-retroaction-rendu.js', communs);
    return {
        feedback: (evaluation) => data.syntheseRetroactionData.construireFeedback(evaluation, { id: 'F1' }, null),
        html: (feedback) => rendu.syntheseRetroactionRendu.rendreSyntheseHTML(feedback)
    };
}

// ↻ #705 (19 sept. 2026) — « chaque évaluation se juge contre SA grille » : un critère que
// l'évaluation ne porte pas n'est plus, d'office, un critère qui manque — il peut avoir été
// ajouté depuis. Ce que #674 protège (95 sur 80 % de la grille ne conclut pas) tient là où la
// DATE le prouve : l'identifiant d'un critère porte l'instant de sa création
// (`genererIdUnique('CR_')`). Ces montages sont donc DATÉS : les trois critères sont nés le
// 15 juin 2025, l'évaluation est du 25 août 2026 — « Langue » était dans la grille ce jour-là.
const NE_AVANT = (n) => 'CR_1750000000000_' + n + '_aabbccddeeff';
const GRILLE_DATEE = {
    id: 'G1', nom: 'Grille témoin 50/30/20',
    criteres: [
        { id: NE_AVANT(1), nom: 'Contenu', ponderation: 50 },
        { id: NE_AVANT(2), nom: 'Organisation', ponderation: 30 },
        { id: NE_AVANT(3), nom: 'Langue', ponderation: 20 }
    ]
};
const EVAL_INCOMPLETE_AVANT_LOT = {
    id: 'EV1', etudiantDA: '111', grilleId: 'G1', echelleId: 'E1', dateEvaluation: '2026-08-25T14:00:00.000Z',
    noteFinale: 95, niveauFinal: 'E',   // ce que le défaut écrivait : 95 (E) sur 80 % de la grille
    criteres: [
        { critereId: NE_AVANT(1), critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
        { critereId: NE_AVANT(2), critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 }
    ]
};
const EVAL_COMPLETE = {
    id: 'EV2', etudiantDA: '111', grilleId: 'G1', echelleId: 'E1',
    noteFinale: 84, niveauFinal: 'M', ponderationCouverte: 100,
    criteres: [
        { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
        { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 },
        { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', ponderation: 20 }
    ]
};

describe('#674 · porte 2 — le PDF de l\'élève refuse de conclure et nomme ce qui manque', () => {
    it('une évaluation d\'AVANT ce lot, incomplète (rétroactif) : la portée est relue, le critère nommé', () => {
        const { feedback } = monterPdf({ grille: GRILLE_DATEE });
        const fb = feedback(EVAL_INCOMPLETE_AVANT_LOT);
        expect(fb.portee).toMatchObject({ incomplete: true, commencee: true, ponderationCouverte: 80, ponderationGrille: 100 });
        expect(fb.portee.criteresHorsNote).toEqual([{ critereId: NE_AVANT(3), nom: 'Langue', ponderation: 20, motif: 'sans-niveau', niveau: '' }]);
        expect(fb.portee.texte).toBe('sans niveau : Langue (20 %)');
    });

    // Les mots de l'élève, arrêtés par Grégoire le 2 septembre 2026 (option C) :
    // « Cette copie n’a pas de niveau général : Langue (20 %) reste à évaluer. »
    it('…et le rendu REFUSE DE CONCLURE : pas de bandeau « E », les mots de l\'élève nomment Langue (20 %)', () => {
        const { feedback, html } = monterPdf({ grille: GRILLE_DATEE });
        const page = html(feedback(EVAL_INCOMPLETE_AVANT_LOT));
        expect(page).toContain('Cette copie n’a pas de niveau général : Langue (20 %) reste à évaluer.');
        // Le bandeau coloré du niveau global (44 px, code seul) n'est PAS rendu.
        expect(page).not.toMatch(/font-size: 44px[^>]*>E</);
        expect(page).not.toContain('Niveau général · Étendu');
    });

    it('la copie MUETTE d\'avant ce lot (note 0, niveau « -- ») : conclusion refusée, les trois nommés au pluriel', () => {
        const { feedback, html } = monterPdf({ echelle: ECHELLE_MUETTE });
        const ev = {
            id: 'EV3', etudiantDA: '111', grilleId: 'G1', echelleId: 'E1', noteFinale: 0, niveauFinal: '--',
            criteres: GRILLE.criteres.map((c) => ({ critereId: c.id, critereNom: c.nom, niveauSelectionne: 'M', ponderation: c.ponderation }))
        };
        const fb = feedback(ev);
        expect(fb.portee.incomplete).toBe(true);
        expect(fb.portee.criteresHorsNote.map((c) => c.motif)).toEqual(['niveau-sans-valeur', 'niveau-sans-valeur', 'niveau-sans-valeur']);
        const page = html(fb);
        expect(page).toContain('Cette copie n’a pas de niveau général : Contenu (M), Organisation (M), Langue (M) restent à évaluer.');
    });

    it('sans liste (niveau général jamais établi, rien à nommer) : la phrase s\'arrête au premier membre', () => {
        const { feedback, html } = monterPdf();
        const fb = feedback(EVAL_COMPLETE);
        // Une copie commencée, déclarée complète, mais dont aucun niveau général n'a été établi.
        const sansConclusion = Object.assign({}, fb, { overall: { code: '', label: '', color: '#767169' } });
        const page = html(sansConclusion);
        expect(page).toContain('Cette copie n’a pas de niveau général.');
        expect(page).not.toContain('à évaluer');
    });

    it('témoin — une évaluation COMPLÈTE s\'exporte SANS UN MOT DE PLUS : bandeau « M », rien d\'autre', () => {
        const { feedback, html } = monterPdf();
        const fb = feedback(EVAL_COMPLETE);
        expect(fb.portee).toMatchObject({ incomplete: false, ponderationCouverte: 100 });
        const page = html(fb);
        expect(page).not.toContain('n’a pas de niveau général');
        expect(page).not.toContain('à évaluer');
        expect(page).toContain('Niveau général · Maîtrisé');
    });

    it('le nom de la grille est imprimé dans l\'en-tête (demande de Grégoire, 2 sept. 2026), échappé, et gravé si la grille a disparu', () => {
        const { feedback, html } = monterPdf();
        const fb = feedback(EVAL_COMPLETE);
        expect(fb.grille).toEqual({ nom: 'Grille témoin 50/30/20' });
        expect(html(fb)).toContain('grille Grille témoin 50/30/20');
        // Grille disparue : le nom gravé sur l'évaluation prend le relais.
        const orpheline = Object.assign({}, EVAL_COMPLETE, { grilleId: 'G_DISPARUE', grilleNom: 'Grille <gravée>' });
        const fb2 = feedback(orpheline);
        expect(fb2.grille.nom).toBe('Grille <gravée>');
        expect(html(fb2)).toContain('grille Grille &lt;gravée&gt;');
        expect(html(fb2)).not.toContain('<gravée>');
    });

    it('les noms de critères passent par l\'échappement (règle 1) : un « < » ne sort pas nu dans la page', () => {
        const { feedback, html } = monterPdf();
        const ev = JSON.parse(JSON.stringify(EVAL_INCOMPLETE_AVANT_LOT));
        // La grille lue est la fixture : on renomme le critère manquant via l'évaluation ? Non — le nom
        // vient de la GRILLE. On injecte donc une grille au nom piégé par une seconde monture.
        const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
        const grillePiegee = { id: 'G1', nom: 'G', criteres: [
            { id: NE_AVANT(1), nom: 'Contenu', ponderation: 50 }, { id: NE_AVANT(2), nom: 'Organisation', ponderation: 30 },
            { id: NE_AVANT(3), nom: '<img src=x onerror=alert(1)>', ponderation: 20 }
        ] };
        const rendu = chargerScript('js/synthese-retroaction-rendu.js', {
            echapperHtml: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
        });
        const p = calcul.porteeDepuisEvaluation(ev, grillePiegee, ECHELLE.niveaux);
        const fb = Object.assign({}, feedback(ev), { portee: { incomplete: true, commencee: true, ponderationCouverte: 80, ponderationGrille: 100, criteresHorsNote: p.criteresHorsNote, texte: '' } });
        const page = rendu.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
        expect(page).not.toContain('<img src=x');
        expect(page).toContain('&lt;img src=x');
    });
});
