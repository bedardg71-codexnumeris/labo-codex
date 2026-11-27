/**
 * #1190 (décision de Grégoire, 27 nov. 2026) — la phrase sous la bande P de l'Aperçu ne nomme plus aucun niveau.
 * Elle lisait les codes M, E, D, PS et I écrits en dur : chez quelqu'un dont l'échelle porte d'autres niveaux, elle se
 * taisait. Elle range maintenant chaque étudiant·e par rapport aux deux repères de l'échelle, le seuil minimal de
 * réussite et le seuil de maîtrise, lus à la même source que les pastilles et la bande : `reperesPerformance`
 * (js/contexte-qualification.js, chargé ici en VRAI par `monter`). Les conditions (les patterns) ne changent pas.
 *
 *   cd tests && npx vitest run unit/apercu-phrase-performance-seuils-1190.test.js
 *
 * Break-test (27 nov. 2026) : sur le code d'avant (codes M, E, D, PS, I), les cas A, B et C rendent une phrase vide :
 * 4 rouges sur 6. Réponse attendue de la fonction : rouge, puis vert une fois le correctif posé.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, echelleAReperes, globauxEchelle, copieSurEchelle } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';

// Le vrai `pluriel` (trimestre-v2-etudiants.js), pas une copie.
const vraiPluriel = chargerScript('js/trimestre-v2-etudiants.js', {}).pluriel;

// Aucun niveau ne s'appelle M, E, D, PS ni I. Seuil minimal de réussite : N2 (50) ; seuil de maîtrise : N3 (70).
const ECHELLE = echelleAReperes({ id: 'E_1190', plages: [['N1', 0, 49], ['N2', 50, 69], ['N3', 70, 89], ['N4', 90, 100]], suffisance: 'N2', maitrise: 'N3' });

function banc(echelle, patterns) {
    const store = storeBase();
    store.test_echellesTemplates = [echelle];
    store.test_evaluationsSauvegardees = [copieSurEchelle(echelle)];
    store.test_indicesPatternsRaI = patterns;
    const b = monter(store, {
        modules: ['js/contexte-qualification.js', { chemin: 'js/tableau-bord-apercu.js', internes: ['genererInterpretationPerformance'] }],
        globaux: { ...globauxEchelle(echelle), formaterPourcentage: (v) => v + ' %' }
    });
    b.win.pluriel = vraiPluriel;
    return (etudiants) => b.interne['tableau-bord-apercu.js'].genererInterpretationPerformance(etudiants, b.win.reperesPerformance());
}

// 8 étudiant·es : 3 à la maîtrise ou au-dessus, 2 entre les deux seuils, 3 sous le seuil minimal.
const GROUPE = [
    { da: 'm1', valeur: 0.70 }, { da: 'm2', valeur: 0.85 }, { da: 'm3', valeur: 0.95 },
    { da: 'e1', valeur: 0.50 }, { da: 'e2', valeur: 0.65 },
    { da: 's1', valeur: 0.10 }, { da: 's2', valeur: 0.30 }, { da: 's3', valeur: 0.49 }
];

describe('#1190 · la phrase sous la bande P se range sur les deux seuils de l\'échelle', () => {
    it('A — une échelle sans M, E, D ni I rend les trois phrases', () => {
        const interpreter = banc(ECHELLE, { e1: { pattern: 'Stable' }, e2: { pattern: 'Stable' }, s1: { pattern: 'Stable' }, s2: { pattern: 'Difficulté persistante' }, s3: { pattern: 'Difficulté persistante' } });
        expect(interpreter(GROUPE)).toBe(
            '3 étudiant·es (38 %) ont atteint ou dépassé le seuil de maîtrise. '
            + '2 étudiant·es entre le seuil minimal de réussite et le seuil de maîtrise montrent une progression favorable et pourraient atteindre la maîtrise prochainement. '
            + 'Parmi les 3 étudiant·es sous le seuil minimal de réussite, 1 montre des signes de progrès.');
    });

    it('B — sous le seuil minimal, sans signe de progrès : l\'accompagnement intensif', () => {
        const interpreter = banc(ECHELLE, { s1: { pattern: 'Difficulté persistante' }, s2: { pattern: 'Difficulté persistante' }, s3: { pattern: 'Difficulté persistante' } });
        expect(interpreter(GROUPE)).toContain('3 étudiant·es sous le seuil minimal de réussite nécessitent un accompagnement intensif');
    });

    it('C — un·e seul·e : les verbes s\'accordent, comme avant (#1208)', () => {
        const interpreter = banc(ECHELLE, { e: { pattern: 'Stable' }, s: { pattern: 'Difficulté persistante' } });
        const msg = interpreter([{ da: 'm', valeur: 0.70 }, { da: 'e', valeur: 0.60 }, { da: 's', valeur: 0.20 }]);
        expect(msg).toContain('1 étudiant·e (33 %) a atteint ou dépassé le seuil de maîtrise');
        expect(msg).toContain('1 étudiant·e entre le seuil minimal de réussite et le seuil de maîtrise montre une progression favorable et pourrait atteindre la maîtrise prochainement');
        expect(msg).toContain('1 étudiant·e sous le seuil minimal de réussite nécessite un accompagnement intensif');
    });

    it('D — les bornes sont celles de l\'échelle : 70 % est à la maîtrise, 69 % entre les deux, 49 % sous le seuil minimal', () => {
        const interpreter = banc(ECHELLE, { e: { pattern: 'Stable' }, s: { pattern: 'Stable' } });
        const msg = interpreter([{ da: 'm', valeur: 0.70 }, { da: 'e', valeur: 0.69 }, { da: 's', valeur: 0.49 }]);
        expect(msg).toContain('1 étudiant·e (33 %) a atteint');
        expect(msg).toContain('1 étudiant·e entre le seuil minimal');
        expect(msg).toContain('Parmi les 1 étudiant·e sous le seuil minimal de réussite, 1 montre des signes de progrès');
    });

    it('E — une échelle sans seuil de maîtrise : seule la phrase du seuil minimal se dit (rien n\'est deviné)', () => {
        const sansMaitrise = { ...ECHELLE, seuilMaitrise: undefined };
        delete sansMaitrise.seuilMaitrise;
        const interpreter = banc(sansMaitrise, { e1: { pattern: 'Stable' }, e2: { pattern: 'Stable' } });
        const msg = interpreter(GROUPE);
        expect(msg).toBe('3 étudiant·es sous le seuil minimal de réussite nécessitent un accompagnement intensif.');
    });

    it('F — une échelle sans seuil minimal de réussite : seule la phrase de la maîtrise se dit', () => {
        const sansSuffisance = { ...ECHELLE };
        delete sansSuffisance.seuilSuffisance;
        const interpreter = banc(sansSuffisance, { e1: { pattern: 'Stable' }, s1: { pattern: 'Stable' } });
        expect(interpreter(GROUPE)).toBe('3 étudiant·es (38 %) ont atteint ou dépassé le seuil de maîtrise.');
    });
});
