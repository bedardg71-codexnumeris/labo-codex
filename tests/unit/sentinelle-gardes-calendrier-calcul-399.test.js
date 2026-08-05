import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #399 — lot de gardes calendrier/calcul (rapport L6+L7+L8 +
// approfondissement #393). Quatre gardes, chacune adossée à la sonde chiffrée
// du rapport d'audit :
//  L8 (décision D4) : une reprise saisie un SAMEDI est honorée comme jour de
//      cours (numeroJour compté, PAS de numeroSemaine propre — la numérotation
//      « paquet de 5 » ne compte que les jours ouvrables du collège) ;
//  replis en dur : cadre vide → 0 entrée (avant : 124 entrées fantômes 2025,
//      dont 82 « cours ») et clé purgée ;
//  L6 : pondérations 0/0 → erreur de configuration, jamais un NaN stocké ;
//  L7 : la note 0 compte dans le repli calculerPerformancePAN
//      ([0, 80, 60] → 0,467 — le filtre truthy rendait 0,70).

// --- L8 + replis : générateur de calendrier ---------------------------------
function chargerTrimestre(store) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async () => null, set: async () => {}
    };
    return chargerScript('js/trimestre.js', { db, cle: (k) => k });
}

describe('#399 · L8 — la reprise du samedi est honorée (décision D4)', () => {
    function genererAvecRepriseSamedi() {
        const store = {
            cadreCalendrier: { dateDebut: '2026-09-01', finCours: '2026-09-30', finTrimestre: '2026-10-02' },
            journeesSansCours: [{
                id: 'E1', dateEvenement: '2026-09-07', description: 'Congé',
                categorie: 'institutionnel', horaireReprise: 'Horaire du lundi',
                dateReprise: '2026-09-12' // un SAMEDI
            }],
            horaires: [], horaireHebdo: null
        };
        const win = chargerTrimestre(store);
        return win.genererCalendrierComplet();
    }

    it('le samedi de reprise devient un jour de cours : statut reprise + numeroJour compté', () => {
        const cal = genererAvecRepriseSamedi();
        const samedi = cal['2026-09-12'];
        // Avant D4 : { statut: 'weekend' } — la séance n'existait nulle part.
        expect(samedi.statut).toBe('reprise');
        expect(samedi.numeroJour).toBeGreaterThan(0);
        expect(samedi.jourRemplace).toBe('Lundi');
    });

    it('mais il ne porte PAS de numeroSemaine propre (hors « paquet de 5 »)', () => {
        const cal = genererAvecRepriseSamedi();
        expect(cal['2026-09-12'].numeroSemaine).toBeUndefined();
    });

    it('les autres samedis restent des weekends (préséance inversée pour les reprises seulement)', () => {
        const cal = genererAvecRepriseSamedi();
        expect(cal['2026-09-05'].statut).toBe('weekend');
        expect(cal['2026-09-19'].statut).toBe('weekend');
    });

    it('une reprise en semaine garde son comportement (statut reprise + numeroSemaine du paquet)', () => {
        const store = {
            cadreCalendrier: { dateDebut: '2026-09-01', finCours: '2026-09-30', finTrimestre: '2026-10-02' },
            journeesSansCours: [{
                id: 'E1', dateEvenement: '2026-09-07', description: 'Congé',
                categorie: 'institutionnel', horaireReprise: 'Horaire du lundi',
                dateReprise: '2026-09-10' // un JEUDI
            }],
            horaires: [], horaireHebdo: null
        };
        const win = chargerTrimestre(store);
        const cal = win.genererCalendrierComplet();
        expect(cal['2026-09-10'].statut).toBe('reprise');
        expect(cal['2026-09-10'].numeroSemaine).toBeGreaterThan(0);
    });
});

describe('#399 · replis en dur retirés — cadre vide ⇒ 0 entrée, clé purgée', () => {
    it('cadre vide → {} (avant : 124 entrées fantômes 2025) et calendrierComplet purgé', () => {
        const store = {
            cadreCalendrier: {},
            journeesSansCours: [],
            horaires: [], horaireHebdo: null,
            calendrierComplet: { '2025-09-01': { statut: 'cours' } } // résidu fantôme
        };
        const win = chargerTrimestre(store);
        const cal = win.genererCalendrierComplet();
        expect(Object.keys(cal).length).toBe(0);
        expect(Object.keys(store.calendrierComplet).length).toBe(0); // purge
    });

    it('borne partielle (dateDebut seule) → 0 entrée aussi (la garde vit)', () => {
        const store = {
            cadreCalendrier: { dateDebut: '2026-09-01' },
            journeesSansCours: [], horaires: [], horaireHebdo: null
        };
        const win = chargerTrimestre(store);
        expect(Object.keys(win.genererCalendrierComplet()).length).toBe(0);
    });
});

// --- L6 : NaN 0/0 -----------------------------------------------------------
describe('#399 · L6 — pondérations 0/0 : erreur de configuration, jamais NaN', () => {
    it('portfolio 0 % + terminale 0 % → erreur non nulle et noteFinale null', () => {
        const store = {
            pratiquesConfigurables: [{
                id: 'standards', nom: 'STD',
                configuration: { type: 'standards', portfolio: { nombreARetenir: 3, minimumCompletion: 1, methodeSelection: 'meilleurs' } }
            }]
        };
        const db = {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: () => {}, get: async () => null, set: async () => {}
        };
        const cle = (k) => k;
        const productions = [
            { id: 'PF', type: 'portfolio', ponderation: 0 },
            { id: 'A1', type: 'artefact-portfolio' },
            { id: 'TERM', type: 'terminale', ponderation: 0 }
        ];
        const evals = [
            { etudiantDA: '1234567', productionId: 'A1', noteFinale: 80, remplaceeParId: null },
            { etudiantDA: '1234567', productionId: 'TERM', noteFinale: 90, remplaceeParId: null }
        ];
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
        chargerScript('js/profil-etudiant-actions.js', {
            db, cle,
            obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : (k === 'evaluationsSauvegardees' ? evals : [])),
            obtenirTypePratiqueActive: () => 'standards',
            obtenirPratiqueActiveGroupeCours: () => 'standards',
            obtenirConfigPratiqueActive: () => store.pratiquesConfigurables[0].configuration,
            obtenirPratiqueParId: () => ({ obtenirCode: () => 'STD' })
        }, win);

        const d = win.calculerDetailsNoteFinale('1234567');
        // Avant : noteFinale = NaN traversait la garde (erreur == null) et se stockait.
        expect(d.erreur).toMatch(/[Pp]ondérations nulles/);
        expect(d.noteFinale).toBeNull();
        expect(Number.isNaN(d.noteFinale)).toBe(false);
    });
});

// --- L7 : note 0 dans le repli ---------------------------------------------
describe('#399 · L7 — la note 0 compte dans le repli calculerPerformancePAN', () => {
    it('sonde du rapport : [0, 80, 60] → 0,467 (avant : 0,70, le zéro disparaissait)', () => {
        const evals = [
            { etudiantDA: '1234567', productionId: 'P1', noteFinale: 0 },
            { etudiantDA: '1234567', productionId: 'P2', noteFinale: 80 },
            { etudiantDA: '1234567', productionId: 'P3', noteFinale: 60 }
        ];
        const win = chargerScript('js/indices.js', {
            db: { getSync: (_k, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? evals : (k === 'portfoliosEleves' ? {} : []))
        });
        expect(win.calculerPerformancePAN('1234567')).toBeCloseTo(0.4667, 3);
    });

    it('null et undefined restent exclus (seul le 0 réintègre le corpus)', () => {
        const evals = [
            { etudiantDA: '1234567', productionId: 'P1', noteFinale: null },
            { etudiantDA: '1234567', productionId: 'P2', noteFinale: undefined },
            { etudiantDA: '1234567', productionId: 'P3', noteFinale: 60 }
        ];
        const win = chargerScript('js/indices.js', {
            db: { getSync: (_k, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? evals : (k === 'portfoliosEleves' ? {} : []))
        });
        expect(win.calculerPerformancePAN('1234567')).toBeCloseTo(0.60, 5);
    });
});
