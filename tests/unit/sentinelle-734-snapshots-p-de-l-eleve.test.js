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
 *
 * ↻ LOT N2 (#716, 22 sept. 2026) — le repli est retiré : le P historique est la note du cours, calculée sur les
 * évaluations de l'élève échues à la date (sentinelle-716, moteur réel). Ce banc garde la PLOMBERIE de snapshots.js
 * sous des bouchons : la note bouchée moyenne TOUT ce qu'on lui injecte, sans filtrer par élève — c'est donc le
 * filtre de snapshots.js, et lui seul, qui rend deux P différents. Break-test : retirer `e.etudiantDA !== da` du
 * filtre des échues → 71 pour l'assidu comme pour l'absent (la moyenne des quatre copies dues).
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
// Dus au 16 mars : P1, P2. Assidu 60, 70 → 65 ; Absent 85, 70 → 77,5 → 78 ; l'autre 70 ; Silence : rien.
// Sans filtre par élève : (60 + 70 + 85 + 70 + 70) / 5 = 71 pour tout le monde.
const EVALUATIONS = [ev('E1', ASSIDU, 'P1', 'I', 60), ev('E2', ASSIDU, 'P2', 'D', 70), ev('E3', ABSENT, 'P1', 'E', 85), ev('E4', ABSENT, 'P2', 'D', 70), ev('E5', AUTRE, 'P1', 'D', 70),
    ev('E6', ASSIDU, 'P3', 'M', 80)];   // due le 1er avril : hors du 16 mars

function monter(enPlus = {}) {
    const store = { test_evaluationsSauvegardees: EVALUATIONS, test_productions: PRODUCTIONS, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' } };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? store[k] : null), set: async () => {}, useIndexedDB: false, memoryCache: new Map() };
    const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
    chargerPredicatsCopie(win);
    // Le contexte de simulation (modes.js) et la note du cours (portfolio.js), bouchés : la note moyenne les
    // `noteFinale` de TOUT ce qui est injecté, sans filtre par élève ni par date — le travail de snapshots.js.
    let contexte = null;
    const appels = [];
    chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
        obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(store['test_' + String(k).replace(/^test_/, '')] || [])),
        calculerAssiduite: () => ({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        resoudrePratiqueActive: () => ({ etat: 'ok', pratique: { obtenirCode: () => 'SOM' } }),
        definirContexteSimulation: (d) => { contexte = d; }, effacerContexteSimulation: () => { contexte = null; },
        calculerNoteDuCours: (da) => {
            appels.push({ da, provisoire: contexte && contexte.noteProvisoire });
            const l = contexte.evaluationsSauvegardees;
            return l.length ? l.reduce((s, e) => s + e.noteFinale, 0) / l.length / 100 : null;
        },
        arrondirIndiceSurCent: (x) => Math.round(Math.round(x * 100 * 1e6) / 1e6),
        obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}), obtenirEtudiantsCoursActif: () => [], estEtudiantExclu: () => false,
        notifications: { succes() {}, erreur() {}, info() {} }, ...enPlus }, win);
    win.__appels = appels;
    win.__contexte = () => contexte;
    return win;
}

describe('#734 · le P historique est celui de l\'élève (plomberie de snapshots.js, #716)', () => {
    it('deux élèves, deux P : l\'assidu 65, l\'absent 78 — sans le filtre par élève, 71 pour les deux', () => {
        const win = monter();
        const a = win.calculerIndicesHistoriques(ASSIDU, '2026-03-16');
        const b = win.calculerIndicesHistoriques(ABSENT, '2026-03-16');
        expect([a.P, b.P]).toEqual([65, 78]);
        expect(win.__appels.every(x => x.provisoire === true)).toBe(true);   // décision 1A : la note historique est provisoire
        expect(win.__contexte()).toBeNull();                                  // le contexte est rendu
    });
    it('l\'élève sans évaluation échue n\'a pas de P (null), et la note n\'est même pas calculée', () => {
        const win = monter();
        expect(win.calculerIndicesHistoriques(SILENCE, '2026-03-16').P).toBeNull();
        expect(win.__appels).toEqual([]);
    });
    it('C reste par élève et par échéance : l\'assidu 2 remises sur 2 dues au 16 mars, la dissertation d\'avril n\'y est pas', () => {
        const a = monter().calculerIndicesHistoriques(ASSIDU, '2026-03-16');
        expect(a.C).toBe(100);
        expect(a.A).toBe(100);
    });

    // LOT N1a (21 sept. 2026, #710) — décision de Grégoire : sans pratique assignée, aucune note. Tarir n'est pas
    // réparer : les snapshots déjà écrits gardent leur P. Depuis N2 (#716), la résolution est `resoudrePratiqueActive`.
    it('N1a · sans pratique assignée (ou id introuvable, ou illisible), AUCUN P n\'est écrit, même avec des évaluations — C et A restent', () => {
        for (const etat of ['aucune', 'introuvable', 'illisible']) {
            const win = monter({ resoudrePratiqueActive: () => ({ etat, pratique: null }) });
            const a = win.calculerIndicesHistoriques(ASSIDU, '2026-03-16');
            expect(a.P, etat).toBeNull();
            expect([a.C, a.A], etat).toEqual([100, 100]);
            expect(win.__appels, etat).toEqual([]);
        }
    });
    it('N2 · décision 2A : une dénotation n\'a pas de P historique', () => {
        const win = monter({ resoudrePratiqueActive: () => ({ etat: 'ok', pratique: { obtenirCode: () => 'DEN' } }) });
        expect(win.calculerIndicesHistoriques(ASSIDU, '2026-03-16').P).toBeNull();
        expect(win.__appels).toEqual([]);
    });
});
