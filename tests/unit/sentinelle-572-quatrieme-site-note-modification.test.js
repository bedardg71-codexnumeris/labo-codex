/**
 * #572 · LE QUATRIÈME SITE — la note d'une évaluation MODIFIÉE se réécrit depuis l'écran
 *
 * #572 (29 août 2026) a déclaré : « LA VALEUR CALCULÉE EST LA SOURCE, l'écran n'en est que
 * l'affichage. » Elle a compté trois sites `parseFloat(...noteProduction1)` et en a corrigé
 * trois. Il y en avait QUATRE : `js/evaluation.js`, `_lireChampsDOMMod`, appelée une seule
 * fois par `sauvegarderEvaluationModifiee` — le chemin qui enregistre la MODIFICATION d'une
 * évaluation existante. Mesuré par Cowork le 2 septembre 2026, rejoué deux fois.
 *
 * ⮕ CE FICHIER REPRODUIT D'ABORD, sur le chemin réel (pas sur une lecture de source) : on
 * charge `js/evaluation.js` dans le bac à sable, on pose une évaluation existante en base,
 * on met l'écran dans un état donné, on appelle `sauvegarderEvaluationModifiee()`, et on
 * regarde ce que `sauvegarderDonneesSelonMode` reçoit. Deux effets, lus dans le code et
 * jamais exécutés avant ce jour :
 *   1. L'ARRONDI — l'écran affiche `toFixed(1)` ; relire l'écran stocke `79,5` pour `79,46`.
 *   2. LE ZÉRO — si l'écran affiche « -- » (rendu différé, #321), `parseFloat` rend NaN et
 *      `|| 0` écrit 0 par-dessus une vraie note.
 * Le second est celui qui départage « arrondi bénin » et « zéro qui remplace une note ».
 *
 * ⚠ TARIR N'EST PAS RÉPARER : les évaluations déjà enregistrées avec une note arrondie ou à
 * zéro gardent ce qu'elles portent. Ce test ne lit ni n'écrit aucune donnée réelle.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function elementDom(init) {
    return Object.assign({
        value: '', textContent: '', checked: false, style: {},
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } },
        querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, remove() {}, setAttribute() {}, addEventListener() {}
    }, init || {});
}

/** Monte le bac à sable : une évaluation existante EV1, un écran, et la capture des écritures. */
function monter({ affichageNote, noteCalculee }) {
    const ecran = {
        noteProduction1: elementDom({ textContent: affichageNote }),
        niveauProduction1: elementDom({ textContent: 'D' }),
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
    const document = {
        getElementById: (id) => ecran[id] || elementDom(),
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const base = {
        test_evaluationsSauvegardees: [{ id: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1',
            noteFinale: 42, niveauFinal: 'M', verrouillee: false, criteres: [] }],
        test_grillesTemplates: [{ id: 'G1', nom: 'Grille', criteres: [] }]
    };
    const ecritures = [];
    const win = {
        addEventListener() {}, removeEventListener() {},
        noteCalculeeCourante: noteCalculee,
        evaluationEnCours: { idModification: 'EV1', etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', criteres: {}, donneesAlgorithmiques: {} },
        sauvegarderEvaluation() { throw new Error('chemin de CRÉATION pris — le test vise la MODIFICATION'); },
        majBadgesApresEvaluation() {},
        // #652 — posée par evaluation-chargement.js, que ce banc ne charge pas ; l'évaluation n'a aucun critère.
        criteresHorsGrille: () => [],
        _annulerAutoSaveEnAttente() {}   // #1145 — même origine
    };
    chargerScript('js/evaluation.js', {
        document,
        // `_collecterCriteresMod` lit `evaluationEnCours` comme global NU, pas `window.` :
        // le bac à sable doit le fournir en paramètre, sinon ReferenceError.
        evaluationEnCours: win.evaluationEnCours,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }]
            : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }] : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { throw new Error('refus inattendu : ' + t + ' — ' + m); }, info() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {}
    }, win);
    return { win, ecritures };
}

function noteEcrite(ecritures) {
    const e = ecritures.find((x) => x.k === 'evaluationsSauvegardees');
    expect(e, 'aucune écriture dans evaluationsSauvegardees — le chemin n\'a pas abouti').toBeDefined();
    return e.v.find((ev) => ev.id === 'EV1').noteFinale;
}

describe('#572 · quatrième site — la note d\'une évaluation modifiée vient de la valeur calculée', () => {
    it('effet 1 — l\'ARRONDI : 79,46 calculé, écran « 79.5 % » → 79,46 doit être stocké, pas 79,5', () => {
        const { win, ecritures } = monter({ affichageNote: '79.5 %', noteCalculee: 79.46 });
        win.sauvegarderEvaluationModifiee();
        expect(noteEcrite(ecritures)).toBe(79.46);
    });

    it('effet 2 — le ZÉRO : écran « -- » (rendu différé, #321) et 79,46 calculé → 79,46, jamais 0', () => {
        const { win, ecritures } = monter({ affichageNote: '--', noteCalculee: 79.46 });
        win.sauvegarderEvaluationModifiee();
        expect(noteEcrite(ecritures)).toBe(79.46);
    });

    it('témoin — le chemin ABOUTIT bien : il pose verrouillee:true et garde l\'id', () => {
        const { win, ecritures } = monter({ affichageNote: '79.5 %', noteCalculee: 79.46 });
        win.sauvegarderEvaluationModifiee();
        const ev = ecritures.find((x) => x.k === 'evaluationsSauvegardees').v.find((e) => e.id === 'EV1');
        expect(ev.verrouillee).toBe(true);
        expect(ev.niveauFinal).toBe('D');
    });
});
