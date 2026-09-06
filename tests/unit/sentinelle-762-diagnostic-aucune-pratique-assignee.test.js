import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #762 — LE DIAGNOSTIC « NOTE NON CALCULABLE » DIT « AUCUNE PRATIQUE ASSIGNÉE »
// QUAND C'EST LE CAS, PAS « INTROUVABLE DANS LA BIBLIOTHÈQUE ».
//
// Rapport de Grégoire, 6 septembre 2026, 7 h 48 (BUG_grégoire_2026-09-06_07-48-42) : dans la
// page des productions d'un élève, « La pratique assignée à ce groupe-cours est introuvable dans
// la bibliothèque (supprimée, ou assignation vers un identifiant obsolète) » — alors que sa
// PAN-STD est bien dans la bibliothèque. Ses données (console) : `groupesCours[0].pratiqueId`
// est `null`. `obtenirPratiqueActiveGroupeCours` (modes.js) ne rend jamais null : sans
// `pratiqueId`, elle rend le repli « sommative », que le diagnostic cherchait ensuite dans la
// bibliothèque — d'où « introuvable », et une consigne (« Réassigne… ») qui ne pouvait pas
// résoudre le vrai manque. L'audit du 5 septembre l'avait mesuré (constat A-1, #710).
//
// ⮕ Le diagnostic lit la SOURCE DE VÉRITÉ (`groupesCours[].pratiqueId` du groupe-cours actif) :
// un groupe-cours sans pratique se dit « aucune pratique assignée », et dit où l'assigner.
// Harnais : le patron de `diagnostic-denotation-DEN4.test.js` (module réel `profil-etudiant-actions.js`).

let store = {};
const db = {
    getSync: (k, def) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (def !== undefined ? def : null)),
    setSync: () => {}
};
let pratiqueActiveSelonModes = null;
const globaux = {
    db,
    cle: (k) => 'test_' + k,
    // Ce que modes.js rend AUJOURD'HUI pour un groupe-cours sans pratique : le repli.
    obtenirPratiqueActiveGroupeCours: () => pratiqueActiveSelonModes,
    normaliserIdPratique: (t) => t,
    notifications: { erreur: () => {}, succes: () => {} },
    echapperHtml: (s) => String(s == null ? '' : s)
};
const win = chargerScript('js/profil-etudiant-actions.js', globaux);
const diag = win._diagnostiquerNoteNonCalculable;

const PAN_STD = { id: 'pratique_1787056354696_6_21166f8ca720', nom: 'PAN-SDT-Litt A26', type: 'standards',
    calcul_note: { methode: 'conversion_niveaux' }, configuration: { echelleId: 'ECH_1' } };

describe('#762 · un groupe-cours sans pratique assignée est dit tel quel', () => {

    it('groupe-cours actif SANS pratiqueId (les données de Grégoire) : « aucune pratique … assignée », jamais « introuvable »', () => {
        store = {
            groupeCoursActif: { id: 'GC_1786388814118_2_3068cb8e2a5b' },
            test_groupesCours: [{ id: 'GC_1786388814118_2_3068cb8e2a5b', groupeNum: '00007', coursId: 'h2026-601-101-MQ-00001', pratiqueId: null }],
            test_pratiquesConfigurables: [PAN_STD]
        };
        pratiqueActiveSelonModes = 'sommative';   // le repli de modes.js
        const msg = diag();
        expect(msg).toMatch(/[Aa]ucune pratique de notation n'est assignée/);
        expect(msg).not.toContain('introuvable');
        // Et la consigne nomme le geste qui assigne (le bouton de Conception › Pratiques).
        expect(msg).toContain('Appliquer au cours actif');
    });

    it('groupe-cours actif AVEC une pratique assignée mais absente de la bibliothèque : « introuvable » reste juste', () => {
        store = {
            groupeCoursActif: { id: 'GC_1' },
            test_groupesCours: [{ id: 'GC_1', groupeNum: '00001', pratiqueId: 'pratique_supprimee' }],
            test_pratiquesConfigurables: [PAN_STD]
        };
        pratiqueActiveSelonModes = 'pratique_supprimee';
        expect(diag()).toContain('introuvable dans la bibliothèque');
    });

    it('groupe-cours actif AVEC la PAN-STD assignée mais sans portfolio : le message « portfolio » reste (non-régression)', () => {
        store = {
            groupeCoursActif: { id: 'GC_1' },
            test_groupesCours: [{ id: 'GC_1', groupeNum: '00001', pratiqueId: PAN_STD.id }],
            test_pratiquesConfigurables: [PAN_STD]
        };
        pratiqueActiveSelonModes = PAN_STD.id;
        expect(diag()).toContain('portfolio');
    });

    it('aucun groupe-cours actif : « aucune pratique … assignée » aussi (rien ne peut porter l\'assignation)', () => {
        store = { test_pratiquesConfigurables: [PAN_STD] };
        pratiqueActiveSelonModes = 'sommative';
        expect(diag()).toMatch(/[Aa]ucune pratique de notation n'est assignée/);
    });
});
