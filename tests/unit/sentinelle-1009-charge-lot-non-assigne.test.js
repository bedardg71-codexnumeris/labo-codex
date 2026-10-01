import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Retour testeur (Grégoire, 1er oct. 2026, 1.172.0) — #1009.
//
// « J'ai 6 copies évaluées et je n'ai pas d'estimation pour le reste de mon
// groupe. » Mesuré dans ses données, en lecture seule : la production en
// cours porte `echeancesParGroupe[gc] = { assignee: false, date }` — la case
// « Consignes transmises » est restée décochée — alors que 26 copies sont
// importées et 6 évaluées. `estimerCharge` écartait tout lot non assigné :
// la ligne entière disparaissait de « Estimation de la charge », et avec elle
// la planification des heures.
//
// Règle verrouillée ici : la charge se mesure aux copies EN MAIN. La case
// d'assignation ne décide pas de l'affichage ; un lot sans copie ni
// évaluation reste absent, assigné ou non.

const GC_A = 'GC_fictif_A';
const GC_B = 'GC_fictif_B';
const ACTIVITE = 'Tracer une carte mentale (texte fictif)';
const DUREE_S = 404;   // 6:44, la moyenne du cas vécu

function daFictif(i) {
    return '90000' + String(i).padStart(2, '0');
}

function evaluation(productionId, i, gcId) {
    return {
        id: 'EVAL_' + productionId + '_' + i,
        etudiantDA: daFictif(i),
        productionId,
        groupeCoursId: gcId,
        criteres: [{ critereId: 'CR1', niveauSelectionne: 'M' }],
        dureeEvaluation: DUREE_S,
        dateCreation: '2026-09-30T13:00:00.000Z'
    };
}

function fichier(productionId, i, gcId) {
    return { id: 'F_' + productionId + '_' + i, etudiantDA: daFictif(i), productionId, groupeCoursId: gcId };
}

function serie(n, fabrique) {
    return Array.from({ length: n }, (_, i) => fabrique(i + 1));
}

function monterRythme(store) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; }
    };
    const win = chargerScript('js/rythme.js', {
        db,
        cle: (k) => `a2026_${k}`,
        obtenirDonneesSelonMode: (k) => store[`a2026_${k}`] || [],
        echapperHtml: (t) => String(t ?? ''),
        MutationObserver: class { observe() {} disconnect() {} },
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {}, body: {} }
    });
    return win.Rythme;
}

// Le trajet de l'écran : durées → statistiques par activité → charge.
function estimer(store) {
    const rythme = monterRythme(store);
    const statsMap = {};
    rythme.calculerStatsParActivite(rythme.collecterDurees()).forEach((s) => { statsMap[s.activite] = s; });
    return rythme.estimerCharge(statsMap);
}

function production(id, titre, echeancesParGroupe) {
    return { id, titre, activiteApprentissage: ACTIVITE, echeancesParGroupe };
}

describe('#1009 · estimation de la charge d\'un lot non assigné', () => {
    it('le cas vécu : case décochée, 26 copies importées, 6 évaluées → la ligne existe, 20 restantes', () => {
        const estimations = estimer({
            a2026_groupesCours: [{ id: GC_A, groupeNum: '00007' }],
            a2026_productions: [production('PROD_3', 'Artefact 3', { [GC_A]: { assignee: false, date: '2026-09-29' } })],
            a2026_fichiersTravaux: serie(26, (i) => fichier('PROD_3', i, GC_A)),
            a2026_evaluationsSauvegardees: serie(6, (i) => evaluation('PROD_3', i, GC_A))
        });

        expect(estimations).toHaveLength(1);
        const lot = estimations[0];
        expect(lot.productionId).toBe('PROD_3');
        expect(lot.gcId).toBe(GC_A);
        expect(lot.copiesFaites).toBe(6);
        expect(lot.copiesRestantes).toBe(20);
        expect(lot.dateRemise).toBe('2026-09-29');
        // 20 copies × 6:44 × marge par défaut 1,25 = 2 h 48 min 20 s
        expect(lot.tempsEstimeMs).toBe(20 * DUREE_S * 1000 * 1.25);
    });

    it('un lot non assigné SANS copie ni évaluation reste absent', () => {
        // Même activité que le lot évalué : les statistiques existent, seul
        // l'état du lot décide.
        const estimations = estimer({
            a2026_groupesCours: [{ id: GC_A, groupeNum: '00007' }],
            a2026_productions: [
                production('PROD_3', 'Artefact 3', { [GC_A]: { assignee: true, date: '2026-09-29' } }),
                production('PROD_4', 'Artefact 4', { [GC_A]: { assignee: false, date: '2026-10-09' } })
            ],
            a2026_fichiersTravaux: serie(26, (i) => fichier('PROD_3', i, GC_A)),
            a2026_evaluationsSauvegardees: serie(6, (i) => evaluation('PROD_3', i, GC_A))
        });

        expect(estimations.map((e) => e.productionId)).toEqual(['PROD_3']);
    });

    it('deux groupes : celui qui n\'a pas reçu le travail n\'apparaît pas, l\'autre oui', () => {
        const estimations = estimer({
            a2026_groupesCours: [{ id: GC_A, groupeNum: '00007' }, { id: GC_B, groupeNum: '00008' }],
            a2026_productions: [production('PROD_3', 'Artefact 3', {
                [GC_A]: { assignee: true, date: '2026-09-29' },
                [GC_B]: { assignee: false, date: null }
            })],
            a2026_fichiersTravaux: serie(10, (i) => fichier('PROD_3', i, GC_A)),
            a2026_evaluationsSauvegardees: serie(4, (i) => evaluation('PROD_3', i, GC_A))
        });

        expect(estimations).toHaveLength(1);
        expect(estimations[0].gcId).toBe(GC_A);
        expect(estimations[0].copiesRestantes).toBe(6);
    });
});
