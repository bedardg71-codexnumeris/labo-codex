/**
 * #1226, suite (entrée 10 sexies de la file, décision de Grégoire du 4 nov. 2026, 10 h 23) — en mode
 * Habiletés, une copie non recevable (plagiat, IA) laisse « un point vide », comme « -- » dans la liste.
 *
 * Ce que l'essai garde : dans « Trajectoires par production », mode Habiletés, la copie plagiée ou « IA »
 * n'a pas de point (ses niveaux enregistrés ne se tracent pas) et n'entre pas dans la médiane ; case
 * « Sans jetons » cochée, l'original plagié d'une reprise non plus. Dans le graphique des critères du
 * profil, sa colonne reste, son point est vide. Rien n'est écrit.
 *
 *   cd tests && npx vitest run unit/habiletes-non-recevable-1226.test.js
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const CANVAS = 'graphique-trajectoires-production';
const E_ABC = { id: 'EABC', nom: 'Trois paliers', seuilMaitrise: 'B', niveaux: [
    { code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#aa0000' },
    { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: 70, couleur: '#00aa00' },
    { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 90, couleur: '#0000aa' }
] };

function fabriqueChart(configs) {
    const Chart = function (c, config) { configs.push(config); this.destroy = () => {}; };
    Chart.getChart = () => null;
    return Chart;
}
const contexte = () => new Proxy({ measureText: () => ({ width: 40 }) }, {
    get(cible, cle) { return cle in cible ? cible[cle] : () => {}; },
    set() { return true; }
});

const ev = (id, da, pid, niveau, extra) => Object.assign({
    id, etudiantDA: da, productionId: pid, coursId: 'GC1', echelleId: 'EABC', dateEvaluation: '2026-02-03T12:00:00.000Z', noteFinale: 70,
    criteres: [{ critereId: 'c1', critereNom: 'Structure', ponderation: 100, niveauSelectionne: niveau }]
}, extra || {});
const plagiat = (id, da, pid, niveau, extra) => ev(id, da, pid, niveau, Object.assign({ statutIntegrite: 'plagiat' }, extra || {}));

function monterBac(evaluations) {
    const store = storeBase();
    store.test_productions = [{ id: 'P1', titre: 'Un', nom: 'Un', dateEcheance: '2026-02-03' }, { id: 'P2', titre: 'Deux', nom: 'Deux', dateEcheance: '2026-02-10' }];
    store.test_echellesTemplates = [E_ABC];
    store.test_evaluationsSauvegardees = evaluations;
    const avant = JSON.stringify(evaluations);
    const configs = [];
    const b = monter(store, {
        elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: contexte }) },
        globaux: { Chart: fabriqueChart(configs), obtenirTermeProduction: (f) => (f === 'pluriel' ? 'Productions' : 'production'), obtenirInterventionsEtudiant: () => [], toggleDisplay() {} },
        modules: ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js',
            { chemin: 'js/graphiques-progression.js', internes: ['obtenirDonneesCriteres'] }],
        objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
    });
    return { b, configs, intact: () => JSON.stringify(store.test_evaluationsSauvegardees) === avant };
}

function trajectoires(evaluations, options) {
    const { b, configs, intact } = monterBac(evaluations);
    b.win.creerGraphiqueTrajectoiresProduction(CANVAS, Object.assign({ mesure: 'habiletes' }, options));
    const datasets = configs[0].data.datasets;
    return {
        courbe: (da) => (datasets.find((d) => d.da === da) || {}).data,
        mediane: (datasets.find((d) => d.label === 'Structure (médiane)') || {}).data,
        intact: intact()
    };
}

describe('#1226, suite · Trajectoires, mode Habiletés : une copie non recevable laisse un point vide', () => {
    it('une copie plagiée et une copie « IA » n\'ont pas de point ; une copie recevable garde le sien', () => {
        const r = trajectoires([
            plagiat('X1', '2000001', 'P1', 'C'),
            ev('X2', '2000001', 'P2', 'C', { statutIntegrite: 'ia', dateEvaluation: '2026-02-10T12:00:00.000Z' }),
            ev('Y1', '2000002', 'P1', 'B'),
            ev('Y2', '2000002', 'P2', 'A', { dateEvaluation: '2026-02-10T12:00:00.000Z' })
        ], { daSurbrillance: 'TOUS' });
        expect(r.courbe('2000001')).toBeUndefined();   // aucun point : pas de courbe
        expect(r.courbe('2000002')).toEqual([0.7, 0.5]);
        expect(r.intact).toBe(true);
    });

    it('la médiane du groupe ne compte pas la copie non recevable', () => {
        const r = trajectoires([
            plagiat('X1', '2000001', 'P1', 'C'),
            ev('Y1', '2000002', 'P1', 'B'),
            ev('Z1', '2000003', 'P1', 'B')
        ], { daSurbrillance: 'TOUS' });
        expect(r.mediane[0]).toBeCloseTo(0.7);   // 0,7 · 0,7 ; 0,9 de la copie plagiée en dehors
    });

    it('case « Sans jetons » cochée : l\'original plagié d\'une reprise laisse un point vide', () => {
        const evals = [
            plagiat('O1', '2000001', 'P1', 'C', { remplaceeParId: 'R1', archivee: true }),
            ev('R1', '2000001', 'P1', 'B', { repriseDeId: 'O1', jetonRepriseApplique: true, dateEvaluation: '2026-02-20T12:00:00.000Z' }),
            ev('E2', '2000001', 'P2', 'A', { dateEvaluation: '2026-02-10T12:00:00.000Z' })
        ];
        const { b, configs } = monterBac(evals);
        b.win.creerGraphiqueTrajectoiresProduction(CANVAS, { mesure: 'habiletes', daSurbrillance: '2000001', sansJetons: true });
        expect(configs[0].data.datasets.find((d) => d.label === 'Structure').data).toEqual([null, 0.5]);
        const { b: b2, configs: c2 } = monterBac(evals);
        b2.win.creerGraphiqueTrajectoiresProduction(CANVAS, { mesure: 'habiletes', daSurbrillance: '2000001' });
        expect(c2[0].data.datasets.find((d) => d.label === 'Structure').data).toEqual([0.7, 0.5]);
    });
});

describe('#1226, suite · Profil, graphique des critères : la colonne reste, le point est vide', () => {
    it('une copie plagiée garde sa production sur l\'axe, sans valeur ; les autres gardent les leurs', () => {
        const { b, intact } = monterBac([
            ev('E1', '2000001', 'P1', 'B', { dateEvaluation: '2026-02-01' }),
            plagiat('E2', '2000001', 'P2', 'C', { dateEvaluation: '2026-03-01' })
        ]);
        const d = b.interne['graphiques-progression.js'].obtenirDonneesCriteres('2000001');
        expect(d.labels).toEqual(['Un', 'Deux']);
        expect(d.criteres.Structure).toEqual([70, null]);
        expect(d.sansValeurConvertible).toEqual({ evaluations: 0, points: 0 });   // un point vide n'est pas « sans valeur convertible »
        expect(intact()).toBe(true);
    });
});
