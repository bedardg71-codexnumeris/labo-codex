import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// #729 — UNE INTERVENTION APRÈS LA DERNIÈRE SÉANCE N'A PAS DE COURBE (11 oct. 2026)
// =====================================================================
// `idxDebut` restait à 0 quand aucun snapshot n'était à sa date ou après : la courbe partait
// du tout début du trimestre, comme si l'intervention avait précédé toutes les séances.
// Harnais repris de sentinelle-241 (mêmes snapshots fictifs, trois séances de septembre).

const DATES = ['2026-09-01', '2026-09-08', '2026-09-15'];
const EVALS = [
    { id: 'O1', etudiantDA: '1000001', productionId: 'P1', noteFinale: 50, remplaceeParId: 'R1' },
    { id: 'R1', etudiantDA: '1000001', productionId: 'P1', noteFinale: 80, repriseDeId: 'O1', jetonRepriseApplique: true },
    { id: 'E2', etudiantDA: '1000002', productionId: 'P1', noteFinale: 60 },
    { id: 'E3', etudiantDA: '1000003', productionId: 'P1', noteFinale: 70 }
];
const PRODS = [{ id: 'P1', titre: 'Analyse', dateEcheance: '2026-09-08' }];
const etu = (da, P) => ({ da, A: 90, C: 100, P });
const SNAPSHOTS = [
    { dateSeance: DATES[0], etudiants: [etu('1000001', 50), etu('1000002', 60), etu('1000003', 70)] },
    { dateSeance: DATES[1], etudiants: [etu('1000001', 80), etu('1000002', 60), etu('1000003', 70)] },
    { dateSeance: DATES[2], etudiants: [etu('1000001', 80), etu('1000002', 60), etu('1000003', 70)] }
];

function globaux() {
    return {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(k === 'productions' ? PRODS : (k === 'evaluationsSauvegardees' ? EVALS : []))),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || '' }),
        obtenirIdContexteActif: () => 'GC1',
        COULEURS: { correlations: {}, indices: { A: '#1', C: '#2', P: '#3' } },
        COULEURS_INDICES: { P: '#3' },
        calculerCorrelationPearson: () => null
    };
}

function monter(interventions) {
    const win = {
        LaboCodexData: {
            lireSnapshotsHebdomadaires: () => JSON.parse(JSON.stringify(SNAPSHOTS)),
            lireInterventions: () => interventions,
            modeConsultation: () => 'actif'
        }
    };
    const g = globaux();
    chargerScript('js/impact-jetons.js', g, win);
    chargerScript('js/correlations-longitudinales.js', g, win);
    return win;
}

describe('#729 · la courbe d\'une intervention commence à sa séance', () => {
    const intervention = (date) => ({ id: 'I1', date, titre: 'Atelier', etudiants: ['1000001', '1000002'], niveauRai: 2 });
    const courbe = (date) => monter([intervention(date)]).calculerCorrelationsLongitudinales()
        .interventionsCourbes.find((c) => c.titre === 'Atelier');

    it('A · après la dernière séance : aucun point', () => {
        expect(courbe('2026-09-20').moyP).toEqual([null, null, null]);
    });
    it('B · à la deuxième séance : la courbe part de là', () => {
        expect(courbe('2026-09-08').moyP).toEqual([null, 70, 70]);
    });
    it('C · avant la première séance : la courbe part du début', () => {
        expect(courbe('2026-08-25').moyP).toEqual([55, 70, 70]);
    });
});
