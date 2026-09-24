import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

/**
 * #939 · LE COMMENTAIRE D'UN CRITÈRE EST LE MÊME DANS LE PDF ET DANS LE TEXTE COPIÉ VERS LÉA.
 *
 * Décision de Grégoire (24 sept. 2026) : le commentaire qui fait foi est celui qui est enregistré
 * avec l'évaluation ; une cartouche retouchée plus tard ne change pas une copie déjà évaluée. Le
 * texte copié suit la même règle que le PDF.
 *
 * Mesuré sur 28d66162 :
 *   · le PDF (`construireCriteres`) lisait le commentaire enregistré → l'algorithmique gelé → la
 *     cartouche ;
 *   · le texte copié (`_rendreCommentairesCriteres`) lisait l'algorithmique → la cartouche VIVANTE
 *     → « [Non défini] » en clair ; jamais le commentaire de la copie ;
 *   · à la réouverture, `niveauSelectionne` remplissait `comm_<critereId>` depuis la cartouche
 *     VIVANTE, et le prochain enregistrement écrasait le commentaire d'alors ;
 *   · l'écran écrivait « [Non défini] » dans `comm_`, que les collecteurs enregistraient : le PDF
 *     l'imprimait aussi.
 *
 * ⮕ Une seule règle, `syntheseRetroactionData.commentaireDuCritere`, lue par le PDF, le texte
 * copié et l'écran. Modules RÉELS : synthese-retroaction-data, evaluation-calcul,
 * evaluation-chargement, evaluation-retroaction, evaluation-sauvegarde, evaluation.
 * Noms fictifs (règle 6).
 */

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
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {},
        dispatchEvent() { return true; }
    }, init || {});
}

function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

const DA = '2000001';
const AMORCE_ALGO = 'Saisissez les erreurs et le nombre de mots';
const ALGO_GELE = 'ALGO-GELÉ : ta rédaction contient 12 erreurs pour 600 mots.';

const GRILLE = {
    id: 'G9', nom: 'Grille témoin #939',
    criteres: [
        { id: 'h1', nom: 'Structure', ponderation: 30, type: 'holistique' },
        { id: 'h2', nom: 'Rigueur', ponderation: 30, type: 'holistique' },
        { id: 'h3', nom: 'Nuance', ponderation: 20, type: 'holistique' },
        { id: 'a4', nom: 'Langue', ponderation: 20, type: 'algorithmique' }
    ]
};
const ECHELLE = {
    id: 'E9', nom: 'IDME témoin',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
        { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
    ]
};
// La cartouche d'AUJOURD'HUI : retouchée après l'évaluation (h1_M), toujours sans rien pour h2_D.
const CARTOUCHE = {
    id: 'CT9', nom: 'Cartouche témoin', grilleId: 'G9', contexte: '',
    commentaires: {
        h1_M: 'RETOUCHÉE h1_M : la cartouche d\'aujourd\'hui.',
        h1_E: 'VIVANTE h1_E : ta structure est remarquable.',
        h3_M: 'VIVANTE h3_M : ta nuance est maîtrisée.'
    }
};
// L'évaluation enregistrée, telle que les collecteurs l'ont écrite avant ce lot.
function evaluationEnregistree(surcharge = {}) {
    return Object.assign({
        id: 'EV9', etudiantDA: DA, productionId: 'P9', grilleId: 'G9', echelleId: 'E9', cartoucheId: 'CT9',
        dateEvaluation: '2026-09-15T08:00:00', noteFinale: 70, niveauFinal: 'D', verrouillee: false, statutRemise: 'evalue',
        criteres: [
            { critereId: 'h1', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 30, retroaction: 'ENREGISTRÉ h1_M : ton propos tient, d\'un bout à l\'autre.' },
            { critereId: 'h2', critereNom: 'Rigueur', niveauSelectionne: 'D', ponderation: 30, retroaction: '[Non défini]' },
            { critereId: 'h3', critereNom: 'Nuance', niveauSelectionne: 'M', ponderation: 20, retroaction: 'Sélectionne un niveau' },
            { critereId: 'a4', critereNom: 'Langue', niveauSelectionne: 'D', ponderation: 20, retroaction: AMORCE_ALGO }
        ],
        donneesAlgorithmiques: { a4: { erreurs: 12, mots: 600, noteCalculee: 70, pourcentage: 70, niveau: 'D', retroaction: ALGO_GELE } }
    }, surcharge);
}

/** Rouvre la copie : même chemin que la page (`niveauSelectionne` pour chaque niveau restauré). */
function rouvrir({ enBase = [evaluationEnregistree()], idModification = 'EV9', niveaux = { h1: 'M', h2: 'D', h3: 'M' } } = {}) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: DA }), selectProduction1: elementDom({ value: 'P9' }),
        selectGrille1: elementDom({ value: 'G9' }), selectEchelle1: elementDom({ value: 'E9' }),
        selectCartoucheEval: elementDom({ value: 'CT9' }),
        remiseProduction1: elementDom({ value: 'remis' }), statutIntegrite: elementDom({ value: 'recevable' }),
        notesIntegrite: elementDom({ value: '' }), retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(),
        afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        eval_h1: elementDom(), eval_h2: elementDom(), eval_h3: elementDom(),
        // Le gabarit pose ses amorces ; `a4` garde la sienne, son texte est l'algorithmique.
        comm_h1: elementDom({ textContent: 'Sélectionne un niveau' }),
        comm_h2: elementDom({ textContent: 'Sélectionne un niveau' }),
        comm_h3: elementDom({ textContent: 'Sélectionne un niveau' }),
        comm_a4: elementDom({ textContent: '\n                ' + AMORCE_ALGO + '\n            ' }),
        vueRetroGenerale: elementDom(), vueRetroSpecifique: elementDom(), vueRetroBilan: elementDom(),
        contenuRetroBilan: elementDom({ innerHTML: '' })
    };
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const ec = {
        etudiantDA: DA, productionId: 'P9', grilleId: 'G9', echelleId: 'E9', cartoucheId: 'CT9',
        criteres: { a4: 'D' },
        donneesAlgorithmiques: { a4: JSON.parse(JSON.stringify(evaluationEnregistree().donneesAlgorithmiques.a4)) },
        pointsAnalytiques: {}, idModification
    };
    const base = {
        test_grillesTemplates: [GRILLE], test_echellesTemplates: [ECHELLE], test_cartouches_G9: [CARTOUCHE],
        test_pratiquesConfigurables: [], test_evaluationsSauvegardees: enBase
    };
    const lire = (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null));
    const ecritures = [];
    const refus = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {} };
    const globaux = {
        document, evaluationEnCours: ec,
        db: { getSync: lire, setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau,
        echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        obtenirTrimestreActif: () => ({}),
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: DA, prenom: 'Élève', nom: 'Fictif', groupe: '01' }]
            : k === 'productions' ? [{ id: 'P9', titre: 'Analyse témoin' }]
            : k === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase)) : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        niveauDuCodeDansEchelle: (code) => { const i = ['I', 'D', 'M', 'E'].indexOf(code); return i === -1 ? null : { code, nom: ECHELLE.niveaux[i].nom, rang: i + 1 }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'signale', M: 'acquis', E: 'acquis' })[code] || null,
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {},
        pluriel: (n, s, p) => (n > 1 ? p : s),
        calculerNote: (...a) => win.calculerNote(...a),
        genererRetroaction: (...a) => win.genererRetroaction(...a)
    };
    chargerScript('js/synthese-retroaction-data.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-chargement.js', globaux, win);
    chargerScript('js/evaluation-retroaction.js', globaux, win);
    chargerScript('js/evaluation-sauvegarde.js', globaux, win);
    chargerScript('js/evaluation.js', globaux, win);

    for (const [critereId, niveau] of Object.entries(niveaux)) {
        ecran[`eval_${critereId}`].value = niveau;
        win.niveauSelectionne(critereId);
    }
    win.genererRetroaction(1);
    return { win, ecran, ec, ecritures, refus };
}

/** Le commentaire qu'un bloc « Critère n (Nom) — X » porte dans le texte copié ('' : l'en-tête seul). */
function commentaireCopie(texte, nom) {
    const m = texte.match(new RegExp(`Critère \\d+ \\(${nom}\\) — [^\\n]*(?:\\n|$)`));
    if (!m) return null;
    const suite = texte.slice(m.index + m[0].length);
    if (suite === '' || suite.startsWith('\n')) return '';   // l'en-tête seul
    const fin = suite.indexOf('\n\n');
    return fin === -1 ? suite : suite.slice(0, fin);
}

/** Ce que le PDF imprime pour la même évaluation (le vrai `construireFeedback`). */
function commentairesDuPdf(win, evaluation) {
    const fb = win.syntheseRetroactionData.construireFeedback(evaluation, null, null);
    return Object.fromEntries(fb.criteria.map((c) => [c.name, c.comment || '']));
}

describe('#939 · la règle unique `commentaireDuCritere`', () => {
    const { win } = rouvrir();
    const regle = win.syntheseRetroactionData.commentaireDuCritere;

    it('enregistré → algorithmique → cartouche → rien, dans cet ordre', () => {
        const cartouche = { commentaires: { x_M: 'CARTOUCHE' } };
        expect(regle({ enregistre: 'ENREG', algorithmique: 'ALGO', cartouche, critereId: 'x', niveau: 'M' })).toBe('ENREG');
        expect(regle({ enregistre: '', algorithmique: 'ALGO', cartouche, critereId: 'x', niveau: 'M' })).toBe('ALGO');
        expect(regle({ enregistre: '', algorithmique: '', cartouche, critereId: 'x', niveau: 'M' })).toBe('CARTOUCHE');
        expect(regle({ enregistre: '', algorithmique: '', cartouche, critereId: 'x', niveau: 'D' })).toBe('');
        expect(regle({ critereId: 'x', niveau: 'M' })).toBe('');
    });

    it('une amorce ou « [Non défini] » n\'est pas un commentaire, même entourée des blancs du gabarit', () => {
        const cartouche = { commentaires: { x_M: 'CARTOUCHE' } };
        for (const t of ['Sélectionne un niveau', '\n    ' + AMORCE_ALGO + '\n  ', '[Non défini]', '  [Non défini] ']) {
            expect(regle({ enregistre: t, cartouche, critereId: 'x', niveau: 'M' }), JSON.stringify(t)).toBe('CARTOUCHE');
        }
        expect(regle({ enregistre: '[Non défini]', critereId: 'x', niveau: 'M' })).toBe('');
    });
});

describe('#939 · une copie rouverte : le texte copié dit ce que dit le PDF', () => {

    it('TÉMOIN : le décor atteint la cascade — la cartouche vivante sert là où rien n\'est enregistré', () => {
        const { ecran } = rouvrir();
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Nuance')).toBe(CARTOUCHE.commentaires.h3_M);
    });

    it('cartouche retouchée APRÈS l\'évaluation → le texte copié garde le commentaire enregistré', () => {
        const { ecran } = rouvrir();
        const texte = ecran.retroactionFinale1.value;
        expect(commentaireCopie(texte, 'Structure'), 'avant : la cartouche d\'aujourd\'hui').toBe(evaluationEnregistree().criteres[0].retroaction);
        expect(texte).not.toContain('RETOUCHÉE');
        // Et l'écran le porte dans le div que les collecteurs enregistrent.
        expect(ecran.comm_h1.textContent).toBe(evaluationEnregistree().criteres[0].retroaction);
    });

    it('rien nulle part (« [Non défini] » en stock, rien dans la cartouche) → l\'en-tête seul, jamais « [Non défini] »', () => {
        const { ecran } = rouvrir();
        const texte = ecran.retroactionFinale1.value;
        expect(texte).toContain('Critère 2 (Rigueur) — D\n\nCritère 3');
        expect(texte).not.toContain('[Non défini]');
        expect(ecran.comm_h2.textContent).toBe('');
    });

    it('amorce de saisie en stock → la cartouche, pas l\'amorce', () => {
        const { ecran } = rouvrir();
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Nuance')).toBe(CARTOUCHE.commentaires.h3_M);
        expect(ecran.retroactionFinale1.value).not.toContain('Sélectionne un niveau');
    });

    it('critère algorithmique → le texte gelé', () => {
        const { ecran } = rouvrir();
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Langue')).toBe(ALGO_GELE);
        expect(ecran.retroactionFinale1.value).not.toContain('Saisissez');
    });

    it('le PDF rend la même chose sur les mêmes cas, critère par critère', () => {
        const { win, ecran } = rouvrir();
        const pdf = commentairesDuPdf(win, evaluationEnregistree());
        const texte = ecran.retroactionFinale1.value;
        expect(pdf).toEqual({
            Structure: evaluationEnregistree().criteres[0].retroaction,
            Rigueur: '',
            Nuance: CARTOUCHE.commentaires.h3_M,
            Langue: ALGO_GELE
        });
        for (const nom of Object.keys(pdf)) expect(commentaireCopie(texte, nom), nom).toBe(pdf[nom]);
    });

    it('un niveau CHANGÉ à la réouverture → la cartouche au nouveau niveau (le commentaire enregistré était celui de l\'ancien)', () => {
        const { win, ecran } = rouvrir();
        ecran.eval_h1.value = 'E';
        win.niveauSelectionne('h1');
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Structure')).toBe(CARTOUCHE.commentaires.h1_E);
    });

    it('SANS identifiant (le chargeur restaure les niveaux avant de poser `idModification`) → le commentaire enregistré quand même', () => {
        const { ecran } = rouvrir({ idModification: null });
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Structure')).toBe(evaluationEnregistree().criteres[0].retroaction);
    });

    it('sans identifiant, une évaluation REMPLACÉE (reprise) n\'est pas lue', () => {
        const { ecran } = rouvrir({ idModification: null, enBase: [evaluationEnregistree({ remplaceeParId: 'EV10' })] });
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Structure')).toBe(CARTOUCHE.commentaires.h1_M);
    });

    it('l\'évaluation d\'un AUTRE élève n\'est jamais lue, même si l\'identifiant traîne', () => {
        const { ecran } = rouvrir({ enBase: [evaluationEnregistree({ etudiantDA: '2000999' })] });
        expect(commentaireCopie(ecran.retroactionFinale1.value, 'Structure')).toBe(CARTOUCHE.commentaires.h1_M);
    });
});

describe('#939 · après l\'enregistrement, la base garde le commentaire d\'alors', () => {

    it('`sauvegarderEvaluationModifiee` : h1 garde son commentaire enregistré, h2 n\'enregistre plus « [Non défini] »', () => {
        const { win, ecritures, refus } = rouvrir();
        win.sauvegarderEvaluationModifiee();
        expect(refus).toEqual([]);
        const ev = ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop().v.find((e) => e.id === 'EV9');
        const par = Object.fromEntries(ev.criteres.map((c) => [c.critereId, c.retroaction]));
        expect(par.h1, 'avant : la cartouche retouchée écrasait le commentaire d\'alors').toBe(evaluationEnregistree().criteres[0].retroaction);
        expect(par.h2).toBe('');
        expect(par.h3).toBe(CARTOUCHE.commentaires.h3_M);
        // Et le PDF de ce qui vient d'être écrit dit la même chose que le texte copié.
        const pdf = commentairesDuPdf(win, ev);
        expect(pdf.Structure).toBe(evaluationEnregistree().criteres[0].retroaction);
        expect(pdf.Rigueur).toBe('');
    });
});
