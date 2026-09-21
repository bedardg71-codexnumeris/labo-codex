/**
 * SENTINELLE #734 — LE P HISTORIQUE D'UN SNAPSHOT EST CELUI DE L'ÉLÈVE, PAS LA MOYENNE DU GROUPE.
 *
 * Audit de l'onglet Suivi, 5 septembre 2026, constat G-2 (Rapports/AUDIT-onglet-suivi-2026-09-05.md).
 * Dans `calculerIndicesHistoriques` (snapshots.js), quand la pratique ne rend pas de P historique (la
 * sommative lit `e.da` / `e.note`, champs absents — #716 ; SPE et DEN n'ont pas la méthode), le repli
 * moyennait les niveaux des évaluations filtrées par production, statut, note et échéance — JAMAIS par
 * `etudiantDA` : toutes celles du groupe dues à cette date. Les courbes P individuelles de « Développement
 * des habiletés » et le spaghetti du groupe montraient le même nombre pour tous les élèves d'un cours
 * sommatif. Le filtre par élève est ajouté ; le repli entier (les tables IDME en dur, la sommative qui
 * lit les mauvais champs) reste #716. Tarir n'est pas réparer : les snapshots déjà écrits gardent leur 67.
 *
 * Break-test attendu : retirer `if (e.etudiantDA !== da) return false;` → les deux élèves reviennent au même 67.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

const ASSIDU = '2000001', ABSENT = '2000002', SILENCE = '2000003', AUTRE = '2000004';
const PRODUCTIONS = [
    { id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-02-01' }, { id: 'P2', titre: 'Analyse 2', type: 'travail', dateEcheance: '2026-03-01' },
    { id: 'P3', titre: 'Dissertation', type: 'travail', dateEcheance: '2026-04-01' }
];
const ev = (id, da, prod, niveau, note) => ({ id, etudiantDA: da, productionId: prod, niveauFinal: niveau, noteFinale: note, verrouillee: true, ponderationCouverte: 100, dateEvaluation: '2026-03-10' });
// Dus au 16 mars : P1, P2. Assidu I, D → (40 + 65) / 2 = 52,5 → 53 ; Absent E, D → (100 + 65) / 2 = 82,5 → 83 ; l'autre D (65) ; Silence : rien.
// Sans filtre par élève (avant) : (40 + 65 + 100 + 65 + 65) / 5 = 67 pour tout le monde.
const EVALUATIONS = [ev('E1', ASSIDU, 'P1', 'I', 60), ev('E2', ASSIDU, 'P2', 'D', 70), ev('E3', ABSENT, 'P1', 'E', 85), ev('E4', ABSENT, 'P2', 'D', 70), ev('E5', AUTRE, 'P1', 'D', 70),
    ev('E6', ASSIDU, 'P3', 'M', 80)];   // due le 1er avril : hors du 16 mars

function monter(enPlus = {}) {
    const store = { test_evaluationsSauvegardees: EVALUATIONS, test_productions: PRODUCTIONS, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' } };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? store[k] : null), set: async () => {}, useIndexedDB: false, memoryCache: new Map() };
    const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
    chargerPredicatsCopie(win);
    chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
        obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(store['test_' + String(k).replace(/^test_/, '')] || [])),
        calculerAssiduite: () => ({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        // La pratique ne sait pas rendre de P historique (le cas de la sommative aujourd'hui, #716) : le repli prend la main.
        obtenirPratiqueActuelle: () => ({ calculerPerformanceHistorique: () => null }),
        obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}), obtenirEtudiantsCoursActif: () => [], estEtudiantExclu: () => false,
        notifications: { succes() {}, erreur() {}, info() {} }, ...enPlus }, win);
    return win;
}

describe('#734 · le P historique du repli est celui de l\'élève', () => {
    it('deux élèves, deux P : l\'assidu 53, l\'absent 83 — avant, 67 pour les deux (la moyenne du groupe)', () => {
        const win = monter();
        const a = win.calculerIndicesHistoriques(ASSIDU, '2026-03-16');
        const b = win.calculerIndicesHistoriques(ABSENT, '2026-03-16');
        expect([a.P, b.P]).toEqual([53, 83]);
        expect(a.P).not.toBe(b.P);
    });
    it('l\'élève sans évaluation n\'a pas de P (null), pas celui des autres', () => {
        expect(monter().calculerIndicesHistoriques(SILENCE, '2026-03-16').P).toBeNull();
    });
    it('C reste par élève et par échéance : l\'assidu 2 remises sur 2 dues au 16 mars, la dissertation d\'avril n\'y est pas', () => {
        const a = monter().calculerIndicesHistoriques(ASSIDU, '2026-03-16');
        expect(a.C).toBe(100);
        expect(a.A).toBe(100);
    });

    // LOT N1a (21 sept. 2026, #710) — décision de Grégoire : sans pratique assignée, aucune note. Le snapshot
    // hebdomadaire s'écrit au démarrage : avant ce lot, il y rangeait un P tiré d'une pratique « standards »
    // fabriquée, puis de la table I/D/M/E en dur. Tarir n'est pas réparer : les snapshots déjà écrits gardent le leur.
    it('N1a · sans pratique assignée (ou id introuvable), AUCUN P n\'est écrit, même avec des évaluations — C et A restent', () => {
        for (const etat of ['aucune', 'introuvable']) {
            const a = monter({ designerPratiqueActive: () => ({ etat }) }).calculerIndicesHistoriques(ASSIDU, '2026-03-16');
            expect(a.P, etat).toBeNull();
            expect([a.C, a.A], etat).toEqual([100, 100]);
        }
    });
    it('N1a · témoin : avec une pratique assignée, le P historique ne bouge pas (53, comme avant le lot)', () => {
        expect(monter({ designerPratiqueActive: () => ({ etat: 'ok' }) }).calculerIndicesHistoriques(ASSIDU, '2026-03-16').P).toBe(53);
    });
});
