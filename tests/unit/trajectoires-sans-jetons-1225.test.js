/**
 * #1225 (entrée 10 quater de la file, 3 nov. 2026) — « Trajectoires par production » : la case
 * « Sans jetons » montre le groupe avec les notes d'origine aux productions reprises.
 *
 * Ce que l'essai garde : case cochée, chaque courbe prend la note de la copie d'origine (une
 * reprise de reprise remonte jusqu'à la première copie) ; la médiane suit ; un original supprimé
 * laisse un trou, compté sous le graphique ; décochée, rien ne change. Rien n'est écrit.
 *
 *   cd tests && npx vitest run unit/trajectoires-sans-jetons-1225.test.js
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const CANVAS = 'graphique-trajectoires-production';
const MODULES = ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js',
    { chemin: 'js/graphiques-progression.js', internes: [] }];

function fabriqueChart(configs) {
    const Chart = function (c, config) { configs.push(config); this.destroy = () => {}; };
    Chart.getChart = () => null;
    return Chart;
}
const contexte = () => new Proxy({ measureText: () => ({ width: 40 }) }, {
    get(cible, cle) { return cle in cible ? cible[cle] : () => {}; },
    set() { return true; }
});

const ev = (id, da, pid, note, extra) => Object.assign({
    id, etudiantDA: da, productionId: pid, coursId: 'GC1', dateEvaluation: '2026-02-03T12:00:00.000Z', noteFinale: note,
    criteres: [{ critereId: 'c1', critereNom: 'Structure', ponderation: 100, niveauSelectionne: 'B' }]
}, extra || {});

// Alice : P1 repris une fois (55 → 80). Bruno : P2 repris deux fois (60 → 70 → 85).
// Chloé : P1 repris, original supprimé (pratique « supprimer l'originale »).
function evaluations(extra) {
    return [...(extra || []),
        ev('E1', '2000001', 'P1', 55, { remplaceeParId: 'R1', archivee: true }),
        ev('R1', '2000001', 'P1', 80, { repriseDeId: 'E1', jetonRepriseApplique: true, dateEvaluation: '2026-02-20T12:00:00.000Z' }),
        ev('E2', '2000001', 'P2', 72, { dateEvaluation: '2026-02-10T12:00:00.000Z' }),
        ev('E3', '2000002', 'P1', 90),
        ev('E4', '2000002', 'P2', 60, { remplaceeParId: 'R2', archivee: true, dateEvaluation: '2026-02-10T12:00:00.000Z' }),
        ev('R2', '2000002', 'P2', 70, { repriseDeId: 'E4', remplaceeParId: 'R3', archivee: true, jetonRepriseApplique: true, dateEvaluation: '2026-02-20T12:00:00.000Z' }),
        ev('R3', '2000002', 'P2', 85, { repriseDeId: 'R2', jetonRepriseApplique: true, dateEvaluation: '2026-02-27T12:00:00.000Z' }),
        ev('R4', '2000003', 'P1', 75, { repriseDeId: 'E_SUPPRIMEE', jetonRepriseApplique: true, dateEvaluation: '2026-02-20T12:00:00.000Z' }),
        ev('E6', '2000003', 'P2', 50, { dateEvaluation: '2026-02-10T12:00:00.000Z' })
    ];
}

function rendre(options, cases, extra) {
    const store = storeBase();
    store.test_productions = [{ id: 'P1', titre: 'Un', dateEcheance: '2026-02-03' }, { id: 'P2', titre: 'Deux', dateEcheance: '2026-02-10' }];
    store.test_evaluationsSauvegardees = evaluations(extra);
    if (extra) {   // #1226 : deux élèves fictifs de plus dans le groupe actif
        store.test_groupeEtudiants.push(
            { da: '2000005', nom: 'Essai', prenom: 'Élise', groupe: '01', coursId: 'GC1', statut: 'actif' },
            { da: '2000006', nom: 'Témoin', prenom: 'Félix', groupe: '01', coursId: 'GC1', statut: 'actif' });
    }
    const avant = JSON.stringify(store.test_evaluationsSauvegardees);
    const configs = [];
    const b = monter(store, {
        elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: contexte }) },
        globaux: { Chart: fabriqueChart(configs), obtenirTermeProduction: (f) => (f === 'pluriel' ? 'Productions' : 'production'), obtenirInterventionsEtudiant: () => [], toggleDisplay() {} },
        modules: MODULES, objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
    });
    if (cases) {
        // Le chemin de l'écran : la case lue par rafraichirGraphiqueTrajectoires.
        b.document.getElementById('trajectoires-toggle-sans-jetons').checked = cases.sansJetons;
        b.document.getElementById('trajectoires-toggle-mediane').checked = true;
        b.win.rafraichirGraphiqueTrajectoires();
    } else {
        b.win.creerGraphiqueTrajectoiresProduction(CANVAS, options);
    }
    const datasets = configs[0].data.datasets;
    const courbe = (da) => (datasets.find((d) => d.da === da) || {}).data;
    const mediane = (datasets.find((d) => d.label === 'Médiane du groupe') || {}).data;
    return { courbe, mediane, note: b.elements['trajectoires-note-conversion'], intact: JSON.stringify(store.test_evaluationsSauvegardees) === avant };
}

describe('#1225 · « Sans jetons » : la note d\'origine aux productions reprises', () => {
    it('décochée : les courbes portent les notes des reprises, comme avant', () => {
        const r = rendre({ mesure: 'noteFinale', afficherMediane: true });
        expect(r.courbe('2000001')).toEqual([0.80, 0.72]);
        expect(r.courbe('2000002')).toEqual([0.90, 0.85]);
        expect(r.courbe('2000003')).toEqual([0.75, 0.50]);
    });

    it('cochée : la note de la copie d\'origine, une reprise de reprise remontant jusqu\'à la première copie', () => {
        const r = rendre({ mesure: 'noteFinale', afficherMediane: true, sansJetons: true });
        expect(r.courbe('2000001')).toEqual([0.55, 0.72]);
        expect(r.courbe('2000002')).toEqual([0.90, 0.60]);
    });

    it('cochée : la médiane suit les notes d\'origine', () => {
        const avec = rendre({ mesure: 'noteFinale', afficherMediane: true });
        const sans = rendre({ mesure: 'noteFinale', afficherMediane: true, sansJetons: true });
        expect(avec.mediane[1]).toBeCloseTo(0.72);   // 0,50 · 0,72 · 0,85
        expect(sans.mediane[1]).toBeCloseTo(0.60);   // 0,50 · 0,60 · 0,72
    });

    it('cochée : un original supprimé laisse un trou, et la note sous le graphique le compte', () => {
        const r = rendre({ mesure: 'noteFinale', afficherMediane: true, sansJetons: true });
        expect(r.courbe('2000003')).toEqual([null, 0.50]);
        expect(r.note.hidden).toBe(false);
        expect(r.note.textContent).toBe('1 note d’origine introuvable (original supprimé) : son point reste vide');
    });

    it('décochée : la note sous le graphique reste cachée', () => {
        const r = rendre({ mesure: 'noteFinale' });
        expect(r.note.hidden).toBe(true);
    });

    it('la case de l\'écran : cochée puis décochée, rafraichirGraphiqueTrajectoires passe d\'une note à l\'autre', () => {
        expect(rendre(null, { sansJetons: true }).courbe('2000001')).toEqual([0.55, 0.72]);
        expect(rendre(null, { sansJetons: false }).courbe('2000001')).toEqual([0.80, 0.72]);
    });

    it('rien n\'est écrit dans les évaluations', () => {
        expect(rendre({ mesure: 'noteFinale', afficherMediane: true, sansJetons: true }).intact).toBe(true);
    });
});

// #1226 (entrée 10 quinquies, décision de Grégoire du 3 nov. 2026, 17 h 57) : « à 0, comme la note ».
describe('#1226 · une copie non recevable se trace à 0', () => {
    const plagiat = (id, da, pid, note, extra) => ev(id, da, pid, note, Object.assign({ statutIntegrite: 'plagiat' }, extra || {}));

    it('case décochée : une copie plagiée (note enregistrée 88) se trace à 0, une copie « IA » aussi', () => {
        const r = rendre({ mesure: 'noteFinale' }, null, [
            plagiat('X1', '2000006', 'P1', 88),
            ev('X2', '2000006', 'P2', 77, { statutIntegrite: 'ia', dateEvaluation: '2026-02-10T12:00:00.000Z' })
        ]);
        expect(r.courbe('2000006')).toEqual([0, 0]);
    });

    it('case cochée : l\'original plagié d\'une reprise ressort à 0, pas à sa note enregistrée', () => {
        const r = rendre({ mesure: 'noteFinale', sansJetons: true }, null, [
            plagiat('O5', '2000005', 'P1', 64, { remplaceeParId: 'R5', archivee: true }),
            ev('R5', '2000005', 'P1', 82, { repriseDeId: 'O5', jetonRepriseApplique: true, dateEvaluation: '2026-02-20T12:00:00.000Z' })
        ]);
        expect(r.courbe('2000005')).toEqual([0, null]);
        expect(rendre({ mesure: 'noteFinale' }, null, [
            plagiat('O5', '2000005', 'P1', 64, { remplaceeParId: 'R5', archivee: true }),
            ev('R5', '2000005', 'P1', 82, { repriseDeId: 'O5', jetonRepriseApplique: true, dateEvaluation: '2026-02-20T12:00:00.000Z' })
        ]).courbe('2000005')).toEqual([0.82, null]);
    });

    it('la médiane compte la copie non recevable à 0', () => {
        const r = rendre({ mesure: 'noteFinale', afficherMediane: true }, null, [plagiat('X1', '2000006', 'P1', 88)]);
        expect(r.mediane[0]).toBeCloseTo(0.775);   // 0 · 0,75 · 0,80 · 0,90
    });
});
