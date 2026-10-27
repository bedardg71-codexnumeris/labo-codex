// #1173 — UNE COPIE VERROUILLÉE AFFICHE LA NOTE REMISE (27 octobre 2026).
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-27-note-remise-copie-verrouillee.md` ; décision de
// Grégoire du 27 oct. à 7 h 28, textes compris.
//
//   A. LA LIGNE (pure, `ligneNoteRemise`) : rien quand les deux notes s'affichent pareil — égales, ou
//      égales à l'arrondi près (la précision affichée) ; rien sans note ; sinon la phrase de Grégoire,
//      les deux nombres au format de l'application (`formaterNotePourcentage`) ;
//   B. QUELLE COPIE (`evaluationRemiseAffichee`) : l'évaluation enregistrée de la copie ouverte, trouvée
//      comme l'auto-save la trouve, seulement verrouillée et avec une note.
// L'écran, les deux chemins d'ouverture, le stockage et le PDF : `note-remise-1173.spec.js` (WebKit).
//
// BREAK-TESTS (faits le 27 octobre 2026, chacun restauré) :
//   · la comparaison sur les nombres bruts (`remise === actuelle`) au lieu de l'affichage → A.c rougit ;
//   · la garde « travail en cours » retirée → B.c rougit ;
//   · la garde `verrouillee !== true` retirée → B.b rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const NB = ' ';

function harnais(evaluations, ecran) {
    const store = { test_evaluationsSauvegardees: evaluations || [] };
    const valeurs = ecran || {};
    const globaux = {
        db: { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {} },
        cle: (k) => 'test_' + k,
        document: { getElementById: (id) => (id in valeurs ? { value: valeurs[id] } : null) },
        evaluationEnCours: null
    };
    const win = chargerScript('js/note-pourcentage.js', globaux);
    chargerScript('js/evaluation-calcul.js', Object.assign({}, globaux, {
        formaterNotePourcentage: win.formaterNotePourcentage,
        formaterNombre: win.formaterNombre
    }), win);
    return win;
}

const LA_COPIE = { selectEtudiantEval: '1000001', selectProduction1: 'P1' };
const evaluation = (extra) => Object.assign({
    id: 'E1', etudiantDA: '1000001', productionId: 'P1', noteFinale: 70, niveauFinal: 'D', verrouillee: true
}, extra);

describe('#1173 A — la ligne sous la note remise', () => {
    const { ligneNoteRemise } = harnais();

    it('A.a deux notes égales : aucune ligne', () => {
        expect(ligneNoteRemise(70, 70)).toBe('');
    });

    it('A.b deux notes différentes : la phrase de Grégoire, les deux nombres au format de l\'application', () => {
        expect(ligneNoteRemise(70, 85)).toBe('Note remise : 70' + NB + '%. Avec le calcul actuel de la grille, elle serait de 85'
            + NB + '%. Déverrouille l\'évaluation pour l\'appliquer.');
        expect(ligneNoteRemise(72.25, 80.5)).toBe('Note remise : 72,3' + NB + '%. Avec le calcul actuel de la grille, elle serait de 80,5'
            + NB + '%. Déverrouille l\'évaluation pour l\'appliquer.');
    });

    it('A.c égales à l\'arrondi près : aucune ligne ; un dixième d\'écart affiché : la ligne', () => {
        expect(ligneNoteRemise(70.04, 69.96)).toBe('');
        expect(ligneNoteRemise(70, 70.000000001)).toBe('');
        expect(ligneNoteRemise(70.04, 70.06)).toContain('elle serait de 70,1' + NB + '%');
    });

    it('A.d sans note, d\'un côté ou de l\'autre : aucune ligne', () => {
        [null, undefined, NaN, '', true].forEach(v => {
            expect(ligneNoteRemise(v, 85)).toBe('');
            expect(ligneNoteRemise(70, v)).toBe('');
        });
    });
});

describe('#1173 B — la copie dont la note est remise', () => {
    it('B.a la copie ouverte, verrouillée, avec une note : son évaluation enregistrée', () => {
        const win = harnais([evaluation()], LA_COPIE);
        expect(win.evaluationRemiseAffichee()).toMatchObject({ id: 'E1', noteFinale: 70 });
    });

    it('B.b déverrouillée : aucune (elle suit le calcul actuel)', () => {
        const win = harnais([evaluation({ verrouillee: false })], LA_COPIE);
        expect(win.evaluationRemiseAffichee()).toBeNull();
    });

    it('B.c sans note : « Incomplet ; travail en cours », note nulle ou absente', () => {
        [{ travailEnCours: true }, { noteFinale: null }, { noteFinale: undefined }].forEach(extra => {
            expect(harnais([evaluation(extra)], LA_COPIE).evaluationRemiseAffichee()).toBeNull();
        });
    });

    it('B.d une autre copie, ou une évaluation remplacée : aucune', () => {
        expect(harnais([evaluation({ etudiantDA: '1000002' })], LA_COPIE).evaluationRemiseAffichee()).toBeNull();
        expect(harnais([evaluation({ remplaceeParId: 'E2' })], LA_COPIE).evaluationRemiseAffichee()).toBeNull();
        expect(harnais([evaluation()], {}).evaluationRemiseAffichee()).toBeNull();
    });
});
