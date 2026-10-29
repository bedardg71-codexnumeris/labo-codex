import { describe, it, expect } from 'vitest';
import { chargerCodex } from './_helpers/charger-codex.js';

/**
 * Retouche de #1182 (29 oct. 2026) — la fusion voyait 127 conflits qui n'existaient pas.
 *
 * Le cas de Grégoire : le Mac fusionne le codex de l'iPad ; les deux fichiers écrits une minute
 * avant ne diffèrent que sur 6 éléments, la fusion en annonçait 127. Les données d'ici viennent
 * d'IndexedDB, qui garde une propriété `undefined` (evaluation-jetons.js pose
 * `dateModification: undefined`) et une Date en objet ; l'autre côté vient du JSON du codex, qui
 * retire la première et écrit la seconde en chaîne. `_jsonStable` comparait sans suivre le JSON :
 * le même élément différait de lui-même.
 *
 * Break-test : l'ancienne `_jsonStable` remise, les cas « identiques » rougissent. Noms fictifs.
 */

const T = 'a2031';
const EVALS = T + '_evaluationsSauvegardees';
const ANNOTS = T + '_annotationsTravaux';
const CHRONO = T + '_chronoEvaluations';

const Codex = chargerCodex().Codex;

/** Ce que l'autre codex porte : les mêmes données, passées par le JSON du codex. */
const parLeJson = (donnees) => JSON.parse(JSON.stringify(donnees));

const evaluation = (id, extra = {}) => ({
    id, etudiantDA: '9000001', etudiantNom: 'Alix Fictif', productionId: 'PROD_5',
    productionNom: 'Artefact inventé', noteFinale: 70, ...extra
});

describe('Retouche #1182 — comparer comme le codex écrit', () => {
    it('une propriété undefined ici, absente là-bas : le même élément, aucun conflit', () => {
        const ici = { [EVALS]: [evaluation('EV_1', { dateModification: undefined }), evaluation('EV_2')] };
        const labas = parLeJson(ici);
        labas[EVALS].push(evaluation('EV_3'));                 // la liste diffère : comparaison par id
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([]);
        expect(analyse.ajouts[EVALS].map((e) => e.id)).toEqual(['EV_3']);
    });

    it('une Date ici, sa chaîne là-bas : le même élément, aucun conflit', () => {
        const ici = { [ANNOTS]: [{ id: 'AN_1', fichierId: 'FT_1', creeLe: new Date('2031-09-01T10:00:00Z'), pages: [] }] };
        const labas = parLeJson(ici);
        labas[ANNOTS].push({ id: 'AN_2', fichierId: 'FT_2', pages: [] });
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([]);
        expect(analyse.ajouts[ANNOTS].map((e) => e.id)).toEqual(['AN_2']);
    });

    it('undefined en profondeur et dans une liste (null en JSON) : identiques', () => {
        const ici = { [EVALS]: [evaluation('EV_1', { detail: { a: undefined, b: [1, undefined, 3] } })] };
        const labas = parLeJson(ici);
        labas[EVALS].push(evaluation('EV_2'));
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([]);
        expect(analyse.ajouts[EVALS].map((e) => e.id)).toEqual(['EV_2']);
    });

    it('une clé qui n\'est pas une liste à id : identique, pas un conflit de clé', () => {
        const ici = { preferencesInventees: { theme: 'clair', depuis: new Date('2031-09-01T10:00:00Z'), vide: undefined } };
        // L'autre appareil a écrit ses propriétés dans un autre ordre : le JSON brut diffère,
        // c'est `_jsonStable` qui juge.
        const labas = { preferencesInventees: { depuis: '2031-09-01T10:00:00.000Z', theme: 'clair' } };
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([]);
        expect(analyse.identiques).toBe(1);
    });

    it('le chronomètre (union par contenu) : une mesure déjà ici ne revient pas', () => {
        const ici = { [CHRONO]: [{ date: '2031-09-01T10:00:00.000Z', duree: 300, note: undefined }] };
        const labas = parLeJson(ici);
        labas[CHRONO].push({ date: '2031-09-02T10:00:00.000Z', duree: 200 });
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.parContenu[CHRONO]).toEqual({ ajouts: 1 });
    });

    it('une vraie différence reste un conflit', () => {
        const ici = { [EVALS]: [evaluation('EV_1', { dateModification: undefined }), evaluation('EV_2')] };
        const labas = parLeJson(ici);
        labas[EVALS][1].noteFinale = 85;
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([{ cle: EVALS, id: 'EV_2' }]);
    });

    it('null n\'est pas absent : une propriété null d\'un seul côté reste une différence', () => {
        const ici = { [EVALS]: [evaluation('EV_1', { remarque: null })] };
        const labas = { [EVALS]: [evaluation('EV_1')] };
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([{ cle: EVALS, id: 'EV_1' }]);
    });
});
