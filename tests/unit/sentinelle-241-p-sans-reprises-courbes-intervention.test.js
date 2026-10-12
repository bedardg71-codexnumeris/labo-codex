import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #241 (lot 11, 11 oct. 2026) — « P SANS REPRISES » SUR LES COURBES D'INTERVENTION.
// Une reprise relève P après coup ; sur la courbe d'un groupe ciblé, elle se lit comme l'effet de
// l'intervention. Chaque courbe (et le contrôle) porte maintenant `moyPSansReprises`, par le MÊME
// calcul que le profil individuel (`deltasReprisesParSeance`, extrait de `genererPSansReprises`).
// Modules RÉELS : impact-jetons.js, correlations-longitudinales.js.
// Break-tests : `ecart` à 0 dans `moyennesPDuGroupe` → A rougit ; `ecartVu` toujours vrai → B rougit.

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

function monter() {
    const win = {
        LaboCodexData: {
            lireSnapshotsHebdomadaires: () => JSON.parse(JSON.stringify(SNAPSHOTS)),
            lireInterventions: () => [{ id: 'I1', date: DATES[0], titre: 'Atelier', etudiants: ['1000001', '1000002'], niveauRai: 2 }],
            modeConsultation: () => 'actif'
        }
    };
    const g = globaux();
    chargerScript('js/impact-jetons.js', g, win);
    chargerScript('js/correlations-longitudinales.js', g, win);
    return win;
}

describe('#241 · les courbes d\'intervention portent « P sans reprises »', () => {
    const r = monter().calculerCorrelationsLongitudinales();
    const atelier = r.interventionsCourbes.find(c => c.titre === 'Atelier');
    const controle = r.interventionsCourbes.find(c => c.niveauRai === 0);

    it('A · le groupe ciblé : P monte avec la reprise, P sans reprises ne monte pas', () => {
        expect(atelier.moyP).toEqual([55, 70, 70]);
        // L'élève 1 : 80 − (80 − 50) / 1 évaluation active = 50, dès la séance de l'échéance.
        expect(atelier.moyPSansReprises).toEqual([55, 55, 55]);
    });

    it('B · aucune reprise dans le groupe contrôle : pas de seconde courbe', () => {
        expect(controle.moyP).toEqual([70, 70, 70]);
        expect(controle.moyPSansReprises).toBeNull();
    });
});

describe('#241 · la courbe du profil individuel ne change pas', () => {
    // Harnais AVANT/APRÈS joué le 11 oct. 2026 contre le code d'avant l'extraction : courbes identiques.
    it('genererPSansReprises : null avant la première reprise, P moins son écart ensuite', () => {
        expect(monter().genererPSansReprises('1000001', SNAPSHOTS, [0.5, 0.8, 0.8])).toEqual([null, 0.5, 0.5]);
    });
});
