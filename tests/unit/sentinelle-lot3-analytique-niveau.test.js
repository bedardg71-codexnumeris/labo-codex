/**
 * LOT 3 · LE CHIFFRE TROUVE SON NIVEAU, ET LE NIVEAU OUVRE LA CARTOUCHE (consigne du
 * 3 septembre 2026, lots des trois types de grille ; consigne du jour du 4 septembre au soir,
 * avec l'exigence ajoutée par la relecture croisée du lot 2 : un critère analytique ENTRE dans
 * `evaluation.criteres[]` en base).
 *
 * Arrêté par Grégoire : la chaîne est points → pourcentage → niveau (par les bornes de
 * l'échelle) → cartouche, et chaque maillon existe déjà ; ce que l'élève lit d'un critère
 * analytique, c'est la note chiffrée, rien d'autre.
 *
 *   A — LE « FINI QUAND » : 24 sur 30 → 80 % → le niveau où tombe 80 % (M) entre dans
 *       l'évaluation en cours, et la cartouche attachée à `critereId_M` s'ouvre — sans
 *       qu'un niveau ait été choisi nulle part ;
 *   B — le niveau suit les points : vidés, il part ; changés, il change ; bornes inclusives ;
 *       ZÉRO point → « I », jamais « 0 » (réservé à l'intégrité académique) ; une échelle
 *       à trous ne déduit rien et retire un niveau périmé — mais les points comptent ;
 *   C — LA BASE : les trois collecteurs de `criteres[]` (enregistrement, modification,
 *       auto-save) font entrer le critère analytique AVEC ses points ET son niveau déduit ;
 *       la source des points reste `pointsAnalytiques` ;
 *   D — CE QUE L'ÉLÈVE LIT : le PDF de synthèse imprime « 24 / 30 » à la place de l'échelle
 *       du critère, et le commentaire de cartouche choisi par le niveau ; l'en-tête de la
 *       rétroaction copiée dit « 24 / 30 » ; l'aperçu enseignant aussi ;
 *   E — rien ne bouge pour les autres : un critère holistique ou algorithmique entre en base
 *       comme avant ; sans points, un critère analytique garde le niveau qu'il porterait ;
 *   F — témoins de source.
 *
 * ⚠ Sur le patron des sentinelles du lot 2 et #674 : modules réels chargés dans le bac à
 * sable, fonctions publiques appelées telles quelles. Aucune donnée réelle lue ni écrite.
 */
import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

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

// Miroir de la règle unique de `js/echelles.js` (#525/#527).
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

// La grille du « fini quand » : un holistique au menu, un analytique en points.
const GRILLE = {
    id: 'G3', nom: 'Contenu 70 · Langue 30',
    criteres: [
        { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique', description: 'Le fond.' },
        { id: 'c2', nom: 'Langue', ponderation: 30, type: 'analytique', description: 'Imposé à 30 par la politique.' }
    ]
};
// Échelle à plages : c'est par elles que le chiffre trouve son niveau.
const ECHELLE = {
    id: 'E3', nom: 'IDME témoin',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
        { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' },
        { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
    ]
};
// La cartouche : une rétroaction préparée par niveau, pour chaque critère.
const CARTOUCHE = {
    id: 'CT3', nom: 'Cartouche témoin', grilleId: 'G3',
    commentaires: {
        c1_M: 'Ton propos est solide.', c1_E: 'Ton propos est remarquable.',
        c2_I: 'La langue nuit à la lecture.', c2_D: 'La langue se travaille encore.',
        c2_M: 'Ta langue est maîtrisée.', c2_E: 'Ta langue est irréprochable.'
    }
};

function ecranEvaluation() {
    return {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: '1234567' }),
        selectProduction1: elementDom({ value: 'P3' }),
        selectGrille1: elementDom({ value: 'G3' }),
        selectEchelle1: elementDom({ value: 'E3' }),
        selectCartoucheEval: elementDom({ value: 'CT3' }),
        remiseProduction1: elementDom({ value: 'remis' }),
        statutIntegrite: elementDom({ value: 'recevable' }),
        notesIntegrite: elementDom({ value: '' }),
        retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(),
        afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        // La palette : le champ de points de Langue, le menu de Contenu, les divs de commentaire.
        eval_pts_c2: elementDom({ max: '30' }), eval_c1: elementDom(),
        comm_c1: elementDom({ textContent: 'Sélectionne un niveau' }),
        comm_c2: elementDom({ textContent: 'Saisis les points' }),
        // Le bilan (retouche du 4 sept.) : ses trois vues et son conteneur.
        vueRetroGenerale: elementDom(), vueRetroSpecifique: elementDom(), vueRetroBilan: elementDom(),
        contenuRetroBilan: elementDom({ innerHTML: '' })
    };
}

/**
 * Le bac à sable : calcul, palette (chargement), rétroaction, enregistrement et modification
 * dans le MÊME contexte — la chaîne réelle de « je tape 24 » à « c'est en base ».
 */
function monter({ niveaux = {}, points = {}, echelle = ECHELLE, modification = false, cartouche = true, enBase = null, sansGrille = false } = {}) {
    const ecran = ecranEvaluation();
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const ec = {
        etudiantDA: '1234567', productionId: 'P3', grilleId: 'G3', echelleId: 'E3',
        cartoucheId: cartouche ? 'CT3' : '',
        criteres: Object.assign({}, niveaux), donneesAlgorithmiques: {},
        pointsAnalytiques: Object.assign({}, points),
        idModification: modification ? 'EV1' : undefined
    };
    const base = {
        test_grillesTemplates: sansGrille ? [] : [GRILLE],
        test_echellesTemplates: [echelle],
        test_cartouches_G3: [CARTOUCHE],
        test_pratiquesConfigurables: [],
        test_evaluationsSauvegardees: modification
            ? [{ id: 'EV1', etudiantDA: '1234567', productionId: 'P3', grilleId: 'G3', noteFinale: 42, niveauFinal: 'M', verrouillee: false, criteres: [] }]
            : []
    };
    const ecritures = [];
    const refus = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {} };
    const globaux = {
        document,
        evaluationEnCours: ec,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k,
        valeurNumeriqueDuNiveau,
        echapperHtml: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'NEUF',
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }]
            : k === 'productions' ? [{ id: 'P3', titre: 'Prod' }]
            : k === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase || [])) : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        // Les lecteurs d'échelle du bilan (`profil-etudiant-calculs.js`, #555/#575) : nom et rang
        // d'un code, et sa zone. Miroir de l'échelle témoin, I sous la suffisance, D entre les deux.
        niveauDuCodeDansEchelle: (code) => { const i = ['I', 'D', 'M', 'E'].indexOf(code); return i === -1 ? null : { code, nom: ECHELLE.niveaux[i].nom, rang: i + 1 }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'signale', M: 'acquis', E: 'acquis' })[code] || null,
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {},
        pluriel: (n, s, p) => (n > 1 ? p : s),
        // Les appels NUS d'un sous-module à l'autre (`calculerNote()`, `genererRetroaction(1)`
        // dans evaluation-chargement.js) : dans la page, ce sont des globaux de script ; ici,
        // des délégués vers le `window` partagé, résolus à l'appel.
        calculerNote: (...a) => win.calculerNote(...a),
        genererRetroaction: (...a) => win.genererRetroaction(...a)
    };
    // #939 — la règle du commentaire d'un critère (`commentaireDuCritere`), le vrai module.
    chargerScript('js/synthese-retroaction-data.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-chargement.js', globaux, win);
    chargerScript('js/evaluation-retroaction.js', globaux, win);
    chargerScript('js/evaluation-sauvegarde.js', globaux, win);
    chargerScript('js/evaluation.js', globaux, win);
    return { win, ecran, ec, ecritures, refus };
}

function evaluationEcrite(ecritures, id) {
    const e = ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop();
    if (!e) return null;
    return e.v.find((ev) => ev.id === id) || null;
}

/** Taper des points dans le champ de Langue, par le handler réel (`pointsSaisis`). */
function taper(win, ecran, valeur) {
    ecran.eval_pts_c2.value = valeur;
    win.pointsSaisis('c2', ecran.eval_pts_c2);
}

/* ------------------------------------------------------------------ A — le fini quand */

describe('lot 3 · A — le « fini quand » : 24 sur 30 trouve son niveau, et la cartouche s\'ouvre', () => {
    it('A.a 24 sur 30 → 80 % → M entre dans l\'évaluation en cours, sans qu\'aucun niveau ait été choisi', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '24');
        expect(ec.pointsAnalytiques.c2).toBe(24);
        expect(ec.criteres.c2, 'le niveau déduit, sous le même nom que les niveaux choisis au menu').toBe('M');
        expect(ecran.noteProduction1.textContent).toBe('80\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('M');
    });

    it('A.b la rétroaction de cartouche attachée à M apparaît — dans le div du critère ET dans le texte généré', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '24');
        expect(ecran.comm_c2.textContent, 'la clé critereId_niveau s\'est formée').toBe('Ta langue est maîtrisée.');
        expect(ecran.retroactionFinale1.value).toContain('Ta langue est maîtrisée.');
        expect(ecran.retroactionFinale1.value).toContain('Ton propos est solide.');
    });

    it('A.c le niveau déduit est le bon niveau : 15 sur 30 (50 %) → I, 20 sur 30 (66,7 %) → D, 27 sur 30 (90 %) → E', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '15'); expect(ec.criteres.c2).toBe('I'); expect(ecran.comm_c2.textContent).toBe('La langue nuit à la lecture.');
        taper(win, ecran, '20'); expect(ec.criteres.c2).toBe('D'); expect(ecran.comm_c2.textContent).toBe('La langue se travaille encore.');
        taper(win, ecran, '27'); expect(ec.criteres.c2).toBe('E'); expect(ecran.comm_c2.textContent).toBe('Ta langue est irréprochable.');
    });

    it('A.d la ligne à copier-coller garde LES POINTS (décision du lot 3 : la donnée saisie), pas le niveau déduit', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '24');
        expect(ecran.criteresCopier.textContent).toBe('M\t24');
    });

    it('A.e la fonction pure : `niveauDeduitDesPoints` rend le code par les bornes de l\'échelle', () => {
        const { win } = monter({});
        const langue = GRILLE.criteres[1];
        expect(win.niveauDeduitDesPoints(langue, 24, ECHELLE.niveaux)).toBe('M');
        expect(win.niveauDeduitDesPoints(langue, 0, ECHELLE.niveaux)).toBe('I');
        expect(win.niveauDeduitDesPoints(langue, 30, ECHELLE.niveaux)).toBe('E');
        expect(win.niveauDeduitDesPoints(langue, undefined, ECHELLE.niveaux)).toBeUndefined();
        expect(win.niveauDeduitDesPoints(langue, 24, null)).toBeUndefined();
        expect(win.niveauDeduitDesPoints({ id: 'z', ponderation: 0, type: 'analytique' }, 0, ECHELLE.niveaux), 'pondération nulle : rien').toBeUndefined();
    });
});

/* -------------------------------------------------------------- B — le niveau suit les points */

describe('lot 3 · B — le niveau suit les points, et seulement eux', () => {
    it('B.a le champ VIDÉ retire les points ET le niveau déduit : Langue redevient hors note, nommée', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '24');
        expect(ec.criteres.c2).toBe('M');
        taper(win, ecran, '');
        expect(ec.pointsAnalytiques.c2).toBeUndefined();
        expect(ec.criteres.c2, 'aucune cartouche ne s\'ouvre sur un chiffre qui n\'y est plus').toBeUndefined();
        expect(ecran.noteProduction1.textContent).toBe('--');
        expect(ecran.porteeNote1.textContent).toContain('Langue');
        expect(win.porteeCalculeeCourante.incomplete).toBe(true);
    });

    it('B.b les bornes sont INCLUSIVES, comme pour le niveau général : 22,5 sur 30 = 75 % → M ; 22,2 → 74 % → D', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '22.5'); expect(ec.criteres.c2).toBe('M');
        taper(win, ecran, '22.2'); expect(ec.criteres.c2).toBe('D');
    });

    it('B.c ZÉRO point → « I », jamais « 0 » : le niveau non recevable ne se déduit pas d\'un chiffre (règle de l\'algorithmique)', () => {
        const echelle = { id: 'E3', nom: 'avec 0', niveaux: [{ code: '0', nom: 'Non recevable', min: 0, max: 0, valeurCalcul: 0 }].concat(ECHELLE.niveaux) };
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' }, echelle });
        taper(win, ecran, '0');
        expect(ec.criteres.c2).toBe('I');
        expect(ecran.comm_c2.textContent).toBe('La langue nuit à la lecture.');
        // …et ZÉRO point compte dans la note (lot 2) : 0,8 × 70 + 0 = 56,0 %.
        expect(ecran.noteProduction1.textContent).toBe('56\u00A0%');
    });

    it('B.d une échelle À TROUS — ↻ #701 : le niveau LE PLUS PROCHE (règle unique des trois chemins) ; le niveau périmé ne reste pas, les points comptent seuls', () => {
        const trouee = { id: 'E3', nom: 'trouée', niveaux: [
            { code: 'I', nom: 'I', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'M', nom: 'M', min: 85, max: 100, valeurCalcul: 90 }
        ] };
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' }, echelle: trouee });
        taper(win, ecran, '10'); expect(ec.criteres.c2).toBe('I');
        taper(win, ecran, '24');   // 80 % : entre 54 et 85, aucune plage — milieu de M (92,5) à 12,5, milieu de I (27) à 53
        expect(ec.criteres.c2, 'un « I » périmé n\'ouvrirait plus la bonne cartouche ; avant #701 : undefined').toBe('M');
        expect(ecran.noteProduction1.textContent, 'la note compte les points sans niveau : 0,9 × 70 + 24').toBe('87\u00A0%');
        expect(win.porteeCalculeeCourante.incomplete).toBe(false);
    });

    it('B.e le niveau se REDÉDUIT à chaque calcul : changer l\'échelle sous les mêmes points change le niveau', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '24');
        expect(ec.criteres.c2).toBe('M');
        // Une échelle où 80 % est « E » : le même chiffre trouve un autre niveau.
        ec.echelleId = 'E3';
        win.calculerNote();   // même échelle : stable
        expect(ec.criteres.c2).toBe('M');
    });
});

/* ------------------------------------------------------------------- C — la base */

describe('lot 3 · C — la base : les trois collecteurs font entrer le critère analytique avec ses points ET son niveau', () => {
    const ENTREE_LANGUE = { critereId: 'c2', critereNom: 'Langue', niveauSelectionne: 'M', points: 24, ponderation: 30, retroaction: 'Ta langue est maîtrisée.' };

    it('C.a ENREGISTREMENT (`sauvegarderEvaluation`) : criteres[] porte Contenu (M) et Langue (M, 24 points) ; la source reste `pointsAnalytiques`', () => {
        const { win, ecran, ecritures, refus } = monter({ niveaux: {} });
        ecran.eval_c1.value = 'M'; win.niveauSelectionne('c1');
        taper(win, ecran, '24');
        win.sauvegarderEvaluation();
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EVAL_NEUF');
        expect(ev).not.toBeNull();
        expect(ev.criteres).toHaveLength(2);
        expect(ev.criteres[0]).toMatchObject({ critereId: 'c1', niveauSelectionne: 'M', ponderation: 70 });
        expect(ev.criteres[0].points, 'un critère holistique n\'a pas de points').toBeUndefined();
        expect(ev.criteres[1]).toMatchObject(ENTREE_LANGUE);
        expect(ev.pointsAnalytiques).toEqual({ c2: 24 });
        expect(ev.noteFinale).toBe(80);
        expect(ev.ponderationCouverte).toBe(100);
    });

    it('C.b MODIFICATION (`sauvegarderEvaluationModifiee`) : même entrée', () => {
        const { win, ecran, ecritures, refus } = monter({ niveaux: {}, modification: true });
        ecran.eval_c1.value = 'E'; win.niveauSelectionne('c1');
        taper(win, ecran, '24');
        win.sauvegarderEvaluationModifiee();
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EV1');
        expect(ev).not.toBeNull();
        expect(ev.criteres.map((c) => c.critereId)).toEqual(['c1', 'c2']);
        expect(ev.criteres[1]).toMatchObject(ENTREE_LANGUE);
        expect(ev.pointsAnalytiques).toEqual({ c2: 24 });
        expect(ev.noteFinale).toBe(90.5);
    });

    it('C.c AUTO-SAVE (`_autoSauvegarderCriteres`) : même entrée, note avec sa portée', () => {
        const { win, ecran, ecritures } = monter({ niveaux: {} });
        ecran.eval_c1.value = 'M'; win.niveauSelectionne('c1');
        taper(win, ecran, '24');
        win._autoSauvegarderCriteres(null);
        const ev = evaluationEcrite(ecritures, 'EVAL_NEUF');   // `genererIdUnique('EVAL_')`, comme la création
        expect(ev).not.toBeNull();
        expect(ev.criteres[1]).toMatchObject(ENTREE_LANGUE);
        expect(ev.pointsAnalytiques).toEqual({ c2: 24 });
        expect(ev.verrouillee).toBe(false);
    });

    it('C.d la base relit le même pourcentage que l\'écran, avec le niveau maintenant présent dans criteres[] (les points l\'emportent)', () => {
        const { win, ecran, ecritures } = monter({ niveaux: {} });
        ecran.eval_c1.value = 'M'; win.niveauSelectionne('c1');
        taper(win, ecran, '25');   // 83,3 % → M, mais la valeur doit être 83,3, pas la ponctuelle 80 de M
        win.sauvegarderEvaluation();
        const ev = evaluationEcrite(ecritures, 'EVAL_NEUF');
        expect(ev.criteres[1].niveauSelectionne).toBe('M');
        const portee = win.porteeDepuisEvaluation(ev, GRILLE, ECHELLE.niveaux);
        const langue = portee.criteresComptes.find((c) => c.critere.id === 'c2');
        expect(langue.valeur).toBeCloseTo(83.333, 2);
        expect(portee.ponderationCouverte).toBe(100);
    });
});

/* -------------------------------------------------------- D — ce que l'élève lit */

/** Le PDF de l'élève : données (`synthese-retroaction-data.js`) puis rendu. */
function monterPdf() {
    const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
    const base = { test_grillesTemplates: [GRILLE], test_cartouches_G3: [CARTOUCHE] };
    const communs = {
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
        obtenirEchelleResolue: () => ECHELLE,
        obtenirDonneesSelonMode: () => [],
        // Les lecteurs d'échelle du bilan du PDF (mêmes stubs que le bilan de l'app) — retouche §6.
        niveauDuCodeDansEchelle: (code) => { const i = ['I', 'D', 'M', 'E'].indexOf(code); return i === -1 ? null : { code, nom: ECHELLE.niveaux[i].nom, rang: i + 1 }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'signale', M: 'acquis', E: 'acquis' })[code] || null,
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

// Ce que le lot 3 écrit en base : Langue avec ses points, son niveau déduit et sa rétroaction.
const EVAL_LOT3 = {
    id: 'EV3', etudiantDA: '111', grilleId: 'G3', echelleId: 'E3', cartoucheId: 'CT3',
    noteFinale: 80, niveauFinal: 'M', ponderationCouverte: 100,
    pointsAnalytiques: { c2: 24 },
    criteres: [
        { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 70, retroaction: 'Ton propos est solide.' },
        { critereId: 'c2', critereNom: 'Langue', niveauSelectionne: 'M', points: 24, ponderation: 30, retroaction: 'Ta langue est maîtrisée.' }
    ]
};

describe('lot 3 · D — ce que l\'élève lit d\'un critère analytique : le chiffre, rien d\'autre', () => {
    it('D.a le PDF de synthèse porte les points du critère analytique, et son commentaire de cartouche', () => {
        const pdf = monterPdf();
        const fb = pdf.feedback(EVAL_LOT3);
        const langue = fb.criteria.find((c) => c.key === 'c2');
        const contenu = fb.criteria.find((c) => c.key === 'c1');
        expect(langue.points).toBe(24);
        expect(langue.weight).toBe(30);
        expect(langue.comment).toBe('Ta langue est maîtrisée.');
        expect(contenu.points, 'un critère holistique n\'en a pas').toBeNull();
    });

    it('D.b le rendu imprime « 24 / 30 » à la place de la rangée de l\'échelle — et l\'échelle reste pour le critère holistique', () => {
        const pdf = monterPdf();
        const page = pdf.html(pdf.feedback(EVAL_LOT3));
        expect(page).toContain('24 / 30');
        // La rangée d'échelle d'un critère est faite de cases « flex: 1; height: 18px » portant chaque code.
        const cases = (page.match(/flex: 1; height: 18px;[^>]*>[IDME]<\/div>/g) || []).length;
        expect(cases, 'quatre cases pour Contenu, aucune pour Langue').toBe(4);
        // Sous le nom de Langue, pas de « 30% » : le maximum EST le poids, déjà dit par « / 30 ».
        expect(page).not.toContain('30%');
        expect(page).toContain('70\u00A0%');
        expect(page).toContain('Ta langue est maîtrisée.');
    });

    it('D.c une évaluation d\'AVANT le lot (critères sans `points`) se rend exactement comme avant', () => {
        const pdf = monterPdf();
        const avant = JSON.parse(JSON.stringify(EVAL_LOT3));
        delete avant.criteres[1].points; delete avant.pointsAnalytiques;
        const page = pdf.html(pdf.feedback(avant));
        expect(page).not.toContain('24 / 30');
        expect((page.match(/flex: 1; height: 18px;[^>]*>[IDME]<\/div>/g) || []).length).toBe(8);
        expect(page).toContain('30\u00A0%');
    });

    it('D.e la porte que la consigne nomme : sans niveau, la clé `critereId_niveau` ne se forme pas et le commentaire reste vide EN SILENCE ; le niveau déduit la referme', () => {
        const pdf = monterPdf();
        // Une copie auto-enregistrée avant que la cartouche n'ait rempli le div : `retroaction` porte
        // l'amorce du lot 2 — la garde #672 l'écarte, et le commentaire ne peut venir QUE de la clé.
        const parLaCle = JSON.parse(JSON.stringify(EVAL_LOT3));
        parLaCle.criteres[1].retroaction = 'Saisis les points';
        const langue = pdf.feedback(parLaCle).criteria.find((c) => c.key === 'c2');
        expect(langue.comment, 'la clé c2_M ouvre la cartouche').toBe('Ta langue est maîtrisée.');
        // Le contre-témoin : le même critère SANS niveau (ce que le lot 2 écrivait) — silence.
        const sansNiveau = JSON.parse(JSON.stringify(parLaCle));
        sansNiveau.criteres[1].niveauSelectionne = '';
        const muette = pdf.feedback(sansNiveau).criteria.find((c) => c.key === 'c2');
        expect(muette.comment).toBe('');
        expect(muette.points, 'et le chiffre, lui, s\'imprime quand même').toBe(24);
    });

    it('D.d l\'en-tête de la rétroaction générée dit « 24 / 30 », pas le niveau ; le holistique garde son niveau', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' } });
        taper(win, ecran, '24');
        const texte = ecran.retroactionFinale1.value;
        expect(texte).toContain('Critère 2 (Langue) — 24 / 30');
        expect(texte).not.toContain('(Langue) — M');
        expect(texte).toContain('Critère 1 (Contenu) — M');
    });
});

/* ------------------------------------------------------ E — rien ne bouge pour les autres */

describe('lot 3 · E — rien ne bouge pour un critère holistique, algorithmique, ou analytique sans points', () => {
    it('E.a sans points, un critère analytique GARDE le niveau qu\'il porterait (lot 2) : rien n\'est écrit ni retiré', () => {
        const { win, ec } = monter({ niveaux: { c1: 'M', c2: 'D' }, points: {} });
        win.calculerNote();
        expect(ec.criteres.c2).toBe('D');
        // 0,8 × 70 + 0,65 × 30 = 75,5
        expect(win.noteCalculeeCourante).toBeCloseTo(75.5, 5);
    });

    it('E.b des points posés sur un critère NON analytique ne déduisent rien : son niveau choisi reste', () => {
        const { win, ec } = monter({ niveaux: { c1: 'E', c2: 'D' }, points: { c1: 3 } });
        win.calculerNote();
        expect(ec.criteres.c1).toBe('E');
        expect(ec.criteres.c2).toBe('D');
    });

    it('E.c la grille 50/30/20 de la sentinelle #674, sans critère analytique : 84,0 % (M), identique, `criteres` intouché', () => {
        const grille674 = { id: 'G3', nom: '50/30/20', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50 }, { id: 'c2', nom: 'Organisation', ponderation: 30 }, { id: 'c3', nom: 'Langue', ponderation: 20 }
        ] };
        const echelle674 = { id: 'E3', nom: 'IDME', niveaux: [
            { code: 'I', nom: 'I', min: 0, max: 54, valeurCalcul: 40 }, { code: 'D', nom: 'D', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'M', min: 75, max: 89, valeurCalcul: 82 }, { code: 'E', nom: 'E', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        const ecran = ecranEvaluation();
        const ec = { grilleId: 'G3', echelleId: 'E3', criteres: { c1: 'E', c2: 'E', c3: 'I' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} };
        const base = { test_grillesTemplates: [grille674], test_echellesTemplates: [echelle674], test_pratiquesConfigurables: [] };
        const win = chargerScript('js/evaluation-calcul.js', {
            document: { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [] },
            evaluationEnCours: ec,
            db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d) },
            cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau
        }, { addEventListener() {}, removeEventListener() {} });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('84\u00A0%');
        expect(ec.criteres).toEqual({ c1: 'E', c2: 'E', c3: 'I' });
    });

    it('E.d un critère algorithmique entre en base comme avant : niveau, pas de `points`', () => {
        const { win, ecran, ecritures, refus } = monter({ niveaux: { c1: 'M', c2: 'D' } });
        win.sauvegarderEvaluation();
        expect(refus).toEqual([]);
        const ev = evaluationEcrite(ecritures, 'EVAL_NEUF');
        expect(ev.criteres.map((c) => c.critereId + ':' + c.niveauSelectionne)).toEqual(['c1:M', 'c2:D']);
        expect(ev.criteres.some((c) => 'points' in c)).toBe(false);
        expect(ecran.noteProduction1.textContent).toBe('75,5\u00A0%');
    });
});

/* ------------------------- H — le PDF de l'élève : son bilan et sa légende (seconde retouche, §6) */

// Une grille ENTIÈREMENT analytique, sur le modèle de l'« Analyse littéraire » de Grégoire.
const GRILLE_ANALYTIQUE = {
    id: 'G3', nom: 'Analyse littéraire', type: 'analytique',
    criteres: [
        { id: 'a1', nom: 'Sujet amené', ponderation: 50, type: 'analytique' },
        { id: 'a2', nom: 'Sujet posé', ponderation: 30, type: 'analytique' },
        { id: 'a3', nom: 'Sujet divisé', ponderation: 20, type: 'analytique', description: 'Pertinent et clair' }
    ]
};
// 50 / 50 → E (acquis : la force) ; 20 / 30 → D (signalé) ; 8 / 20 → I (priorité).
const EVAL_ANALYTIQUE = {
    id: 'EV4', etudiantDA: '111', grilleId: 'G3', echelleId: 'E3',
    noteFinale: 78, niveauFinal: 'M', ponderationCouverte: 100,
    pointsAnalytiques: { a1: 50, a2: 20, a3: 8 },
    criteres: [
        { critereId: 'a1', critereNom: 'Sujet amené', niveauSelectionne: 'E', points: 50, ponderation: 50, retroaction: '' },
        { critereId: 'a2', critereNom: 'Sujet posé', niveauSelectionne: 'D', points: 20, ponderation: 30, retroaction: '' },
        { critereId: 'a3', critereNom: 'Sujet divisé', niveauSelectionne: 'I', points: 8, ponderation: 20, retroaction: '' }
    ]
};

describe('lot 3 · H — le PDF de l\'élève : son bilan nomme un critère analytique par son chiffre, et sa légende disparaît quand aucun critère ne lit l\'échelle (seconde retouche, décision de Grégoire)', () => {
    function pageAnalytique() {
        const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
        const base = { test_grillesTemplates: [GRILLE_ANALYTIQUE] };
        const communs = {
            db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
            cle: (k) => 'test_' + k,
            echapperHtml: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
            obtenirEchelleResolue: () => ECHELLE,
            obtenirDonneesSelonMode: () => [],
            niveauDuCodeDansEchelle: (code) => { const i = ['I', 'D', 'M', 'E'].indexOf(code); return i === -1 ? null : { code, nom: ECHELLE.niveaux[i].nom, rang: i + 1 }; },
            zoneDuNiveau: (code) => ({ I: 'priorite', D: 'signale', M: 'acquis', E: 'acquis' })[code] || null,
            obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
            obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
            travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] },
            obtenirPreference: () => null,
            porteeDepuisEvaluation: calcul.porteeDepuisEvaluation, texteCriteresHorsNote: calcul.texteCriteresHorsNote
        };
        const data = chargerScript('js/synthese-retroaction-data.js', communs);
        const rendu = chargerScript('js/synthese-retroaction-rendu.js', communs);
        const fb = data.syntheseRetroactionData.construireFeedback(EVAL_ANALYTIQUE, { id: 'F4' }, null);
        return { fb, page: rendu.syntheseRetroactionRendu.rendreSyntheseHTML(fb) };
    }

    // #940 (24 sept. 2026) — forme de Grégoire : « Nom (niveau) : définition », la définition telle qu'écrite.
    it('H.a « Présentement, il faut se concentrer sur » : « Sujet divisé (8 / 20) : Pertinent et clair », pas « Insuffisant »', () => {
        const { fb, page } = pageAnalytique();
        expect(fb.bilan.concentration.priorites).toEqual(['Sujet divisé (8 / 20) : Pertinent et clair']);
        expect(page).toContain('Sujet divisé (8 / 20) : Pertinent et clair');
        expect(page).not.toContain('Sujet divisé (Insuffisant)');
    });

    it('H.b « Acquis en développement, à consolider » : « Sujet posé (20 / 30) »', () => {
        const { fb, page } = pageAnalytique();
        expect(fb.bilan.concentration.signales).toEqual(['Sujet posé (20 / 30)']);
        expect(page).toContain('Sujet posé (20 / 30)');
        expect(page).not.toContain('Sujet posé (En développement)');
    });

    it('H.c « Ta force : Sujet amené (50 / 50) »', () => {
        const { fb, page } = pageAnalytique();
        expect(fb.bilan.recurrents.force).toBe('Ta force : Sujet amené (50 / 50)');
        expect(page).toContain('Ta force : Sujet amené (50 / 50)');
        expect(page).not.toContain('Sujet amené (Étendu)');
    });

    it('H.d la légende « I · D · M · E » disparaît de « Rétroaction par critère » quand aucun critère ne lit l\'échelle — et reste sur une grille mixte', () => {
        const { page } = pageAnalytique();
        // La légende : une pastille de couleur, le code en gras, puis le libellé.
        expect(page).not.toMatch(/<\/b> Insuffisant/);
        expect(page).not.toMatch(/<\/b> Étendu/);
        expect(page).toContain('Rétroaction par critère');
        // Témoin : la grille mixte du lot 3 (Contenu holistique) garde sa légende.
        const mixte = monterPdf().html(monterPdf().feedback(EVAL_LOT3));
        expect(mixte).toMatch(/<\/b> Insuffisant/);
        expect(mixte).toMatch(/<\/b> Étendu/);
    });

    it('H.e sans points (critère holistique), le bilan du PDF garde le libellé du niveau, comme avant', () => {
        const pdf = monterPdf();
        const avecDefi = JSON.parse(JSON.stringify(EVAL_LOT3));
        avecDefi.criteres[0].niveauSelectionne = 'I';   // Contenu (holistique) en priorité
        const fb = pdf.feedback(avecDefi);
        expect(fb.bilan.concentration.priorites).toEqual(['Contenu (Insuffisant) : Le fond.']);   // #940
        expect(fb.bilan.recurrents.force).toBe('Ta force : Langue (24 / 30)');
    });
});

/* ------------------------------------------------- G — le bilan dit le chiffre (retouche) */

/** Le bilan tel que l'élève le reçoit : `basculerVueRetroaction('bilan')` rend dans `#contenuRetroBilan`. */
function bilan(win, ecran) {
    win.basculerVueRetroaction('bilan');
    return String(ecran.contenuRetroBilan.innerHTML || '');
}

describe('lot 3 · G — le bilan nomme un critère analytique par son chiffre, jamais par le nom du niveau déduit (décision de Grégoire, 4 sept.)', () => {
    it('G.a un défi analytique : « Langue (12 / 30) », et le holistique garde le nom de son niveau', () => {
        // 12 sur 30 = 40 % → I (priorité) ; Contenu à M (acquis) devient la force.
        const { win, ecran } = monter({ niveaux: { c1: 'M', c2: 'I' }, points: { c2: 12 } });
        const html = bilan(win, ecran);
        expect(html).toContain('Langue (12 / 30) : Imposé à 30 par la politique.');   // #940
        expect(html).not.toContain('Insuffisant');
        expect(html).toContain('Ta force : Contenu (Maîtrisé)');
    });

    it('G.b un acquis en développement analytique : « - Langue (20 / 30) »', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M', c2: 'D' }, points: { c2: 20 } });
        const html = bilan(win, ecran);
        expect(html).toContain('Acquis en développement');
        expect(html).toContain('- Langue (20 / 30)');
        expect(html).not.toContain('En développement');
    });

    it('G.c la force analytique : « Ta force : Langue (27 / 30) »', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'D', c2: 'E' }, points: { c2: 27 } });
        const html = bilan(win, ecran);
        expect(html).toContain('Ta force : Langue (27 / 30)');
        expect(html).not.toContain('Étendu');
        expect(html).toContain('- Contenu (En développement)');
    });

    it('G.d copie rouverte SANS sa grille : le bilan relit `criteres[]` en base — points et poids ENREGISTRÉS, chiffre identique', () => {
        const enBase = [{ id: 'EV1', etudiantDA: '1234567', productionId: 'P3', grilleId: 'G3', echelleId: 'E3', noteFinale: 68, niveauFinal: 'D',
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 70 },
                { critereId: 'c2', critereNom: 'Langue', niveauSelectionne: 'I', points: 12, ponderation: 30 }
            ] }];
        const { win, ecran } = monter({ niveaux: { c1: 'M', c2: 'I' }, points: {}, enBase, sansGrille: true, modification: true });
        const html = bilan(win, ecran);
        expect(html).toContain('- Langue (12 / 30)');
        expect(html).not.toContain('Insuffisant');
        expect(html).toContain('Ta force : Contenu (Maîtrisé)');
    });

    it('G.e sans points, un critère analytique se nomme par son niveau, comme avant', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M', c2: 'I' }, points: {} });
        const html = bilan(win, ecran);
        expect(html).toContain('Langue (Insuffisant)');   // #940
        expect(html).not.toContain(' / ');
    });
});

/* ------------------------ I — la réouverture d'une copie (troisième retouche, §7) */

/**
 * `evaluation.js` seul, comme la sentinelle #572 : la palette y est un `document` où l'on pose
 * les éléments rendus (ou non). L'horloge est simulée : l'attente sonde toutes les 100 ms.
 */
function monterReouverture(elementsRendus) {
    const ecran = {};
    elementsRendus.forEach((id) => { ecran[id] = elementDom(); });
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: null };
    chargerScript('js/evaluation.js', {
        document, evaluationEnCours: null,
        db: { getSync: (k, d) => d, setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [], sauvegarderDonneesSelonMode: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0
    }, win);
    return win;
}

const EVAL_PREMIER_ANALYTIQUE = { criteres: [
    { critereId: 'a1', critereNom: 'Sujet amené', niveauSelectionne: 'E', points: 50, ponderation: 50 },
    { critereId: 'a2', critereNom: 'Sujet posé', niveauSelectionne: 'D', points: 20, ponderation: 30 }
] };
const EVAL_PREMIER_HOLISTIQUE = { criteres: [
    { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 70 },
    { critereId: 'c2', critereNom: 'Langue', niveauSelectionne: 'M', points: 24, ponderation: 30 }
] };

describe('lot 3 · I — rouvrir une copie dont le PREMIER critère est analytique (régression trouvée par Grégoire à l\'écran, 4 sept.)', () => {
    it('I.a l\'attente se résout sur le CHAMP DE POINTS du premier critère — rouge avant la retouche (elle n\'attendait qu\'un menu, 3 s, rejet)', async () => {
        vi.useFakeTimers();
        try {
            const win = monterReouverture(['eval_pts_a1', 'eval_pts_a2']);
            const attente = win._attendreSaisiePremierCritereModif(EVAL_PREMIER_ANALYTIQUE);
            await vi.advanceTimersByTimeAsync(100);
            await expect(attente).resolves.toBe(true);
        } finally { vi.useRealTimers(); }
    });

    it('I.b …et toujours sur le MENU d\'un premier critère holistique, comme avant', async () => {
        vi.useFakeTimers();
        try {
            const win = monterReouverture(['eval_c1', 'eval_pts_c2']);
            const attente = win._attendreSaisiePremierCritereModif(EVAL_PREMIER_HOLISTIQUE);
            await vi.advanceTimersByTimeAsync(100);
            await expect(attente).resolves.toBe(true);
        } finally { vi.useRealTimers(); }
    });

    it('I.c rien de rendu → rejet après 3 secondes, et le message ne parle plus de « selects »', async () => {
        vi.useFakeTimers();
        const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const win = monterReouverture([]);
            const attente = win._attendreSaisiePremierCritereModif(EVAL_PREMIER_ANALYTIQUE);
            const verdict = attente.then(() => 'résolue', (e) => e.message);
            await vi.advanceTimersByTimeAsync(3000);
            const message = await verdict;
            expect(message).toContain('ne sont pas rendus');
            expect(message).not.toContain('selects');
        } finally { silence.mockRestore(); vi.useRealTimers(); }
    });

    it('I.d sans critère : `false`, pas une erreur (inchangé)', async () => {
        const win = monterReouverture([]);
        await expect(win._attendreSaisiePremierCritereModif({ criteres: [] })).resolves.toBe(false);
    });

    it('I.e témoins de source : l\'étape 10 ne cherche pas de menu pour un critère à points ; les points passent sur `window` à la réouverture', () => {
        const src = source('js/evaluation.js');
        expect(src).toContain("if (typeof critere.points === 'number') return;\n        const selectId = `eval_${critere.critereId}`;");
        expect(src).toMatch(/criteres: \{\},\n(?:\s*\/\/.*\n)*\s*pointsAnalytiques: \(evaluation\.pointsAnalytiques && typeof evaluation\.pointsAnalytiques === 'object'\)/);
        expect(src).not.toContain('attendreSelectsCriteres = (evaluation) =>');
        expect(src).toContain('await _chargerValeursEtAlgoModif(evaluation, _attendreSaisiePremierCritereModif);');
    });
});

/* ------------------------------------------------------------- F — témoins de source */

describe('lot 3 · F — témoins de source', () => {
    it('F.a les TROIS collecteurs de criteres[] portent les points sous la condition du type, et ce sont bien eux qui écrivent `niveauSelectionne`', () => {
        for (const f of ['js/evaluation-sauvegarde.js', 'js/evaluation.js', 'js/evaluation-chargement.js']) {
            const src = source(f);
            expect(src, f).toMatch(/type === 'analytique' && typeof pts === 'number' && !isNaN\(pts\)\) entree\.points = pts;/);
            // #941 lot S1 — sans échelle, un critère à points entre sans niveau déduit : `|| ''`.
            expect(src, f).toContain("niveauSelectionne: niveau || '',");
        }
    });

    it('F.b une seule façon d\'ouvrir la cartouche : `_afficherCommentaireCritere`, appelée par le menu ET par les points', () => {
        const src = source('js/evaluation-chargement.js');
        expect((src.match(/^\s+_afficherCommentaireCritere\(critereId, /gm) || []).length, 'deux appels : niveauSelectionne et pointsSaisis').toBe(2);
        expect(src).toMatch(/^function _afficherCommentaireCritere\(critereId, niveau\)/m);
        // #939 — la clé `critereId_niveau` se construit dans la règle partagée, que l'écran lit.
        expect(src).toContain('window.syntheseRetroactionData.commentaireDuCritere({ enregistre, cartouche, critereId, niveau })');
    });

    it('F.c la déduction est appelée par `calculerNote` AVANT la portée, et la boucle n\'a pas bougé', () => {
        const calcul = source('js/evaluation-calcul.js');
        const iDeduction = calcul.indexOf('_deduireNiveauxAnalytiques(grille, niveaux);');
        const iPortee = calcul.indexOf('const portee = calculerPortee(\n        grille.criteres,');
        expect(iDeduction).toBeGreaterThan(0);
        expect(iPortee).toBeGreaterThan(iDeduction);
        expect(calcul).toContain("portee.criteresComptes.forEach(({ critere, niveau, valeur }) => {\n        const ponderation = (critere.ponderation || 0) / 100;\n        noteTotal += valeur * ponderation;\n        ponderationTotal += ponderation;");
        // Le niveau « 0 » ne se déduit jamais d'un chiffre.
        // ↻ #701 — par l'option de la règle unique, plus par une copie du filtre.
        expect(calcul).toMatch(/function niveauDeduitDesPoints[\s\S]*?niveauDuPourcentage\(pct, niveaux, \{ sansNiveauZero: true \}\);\n\}/);
    });

    it('F.d la restauration de la palette et le report au changement de grille passent par le chemin de la frappe', () => {
        const src = source('js/evaluation-chargement.js');
        expect(src).toContain('pointsSaisis(critereId, champ);\n            niveauxRestaures++;');
        expect(src).toContain("inputPts.dispatchEvent(new Event('input', { bubbles: true }));");
    });

    it('F.e le chiffre est ce que l\'élève lit : synthèse (données + rendu), rétroaction copiée, aperçu enseignant', () => {
        expect(source('js/synthese-retroaction-data.js')).toContain('points:  points,');
        expect(source('js/synthese-retroaction-data.js')).toContain("'Saisis les points'");
        expect(source('js/synthese-retroaction-rendu.js')).toContain('${esc(formaterNombre(critere.points))} / ${esc(formaterNombre(critere.weight))}');   // ↻ #1137 (22 oct.) : le formateur du module   // 21 oct. 2026 : la virgule du PDF de l'élève
        expect(source('js/evaluation-retroaction.js')).toContain('? `${ptsAnalytiques} / ${critere.ponderation}` : niveau;');
        expect(source('js/travaux-export-pdf.js')).toContain('? `${c.points} / ${c.ponderation}` : (c.niveauSelectionne || \'—\');');
        // Seconde retouche (§6) : le bilan du PDF, trois sites, une lecture ; et la légende conditionnée.
        const data = source('js/synthese-retroaction-data.js');
        // #940 — priorités et signalés partagent une seule ligne (`ligneCritereATravailler`) : deux sites.
        expect((data.match(/lectureNiveauCritere\(echelle, (d|meilleur)\)/g) || []).length, 'ligne d\'un critère à travailler, force').toBe(2);
        expect(data).not.toMatch(/libelleNiveau\(echelle, [a-z]+\.niveauSelectionne\)/);
        // ↻ 28 oct. 2026 : et pas de légende pour une copie non recevable (sentinelle-copie-non-recevable-affichage-28-oct).
        expect(source('js/synthese-retroaction-rendu.js')).toContain("criteres.some(c => typeof c.points !== 'number')) ? renderLegende(ctx) : ''");
        // Retouche du 4 sept. : les trois rendus du bilan passent par la même lecture, et plus aucun n'appelle `_nomBilan` sur un critère.
        const retro = source('js/evaluation-retroaction.js');
        // #940 — défis et signalés passent par `_ligneCritereBilan` : deux sites, une lecture.
        expect((retro.match(/(?<!function )_lectureNiveauBilan\(niveauDe, (d|c|meilleur)\)[,;]/g) || []).length, "ligne d'un critère à travailler, force").toBe(2);
        expect(retro).not.toMatch(/_nomBilan\(niveauDe, [a-z]+\.niveauSelectionne\)/);
    });
});
