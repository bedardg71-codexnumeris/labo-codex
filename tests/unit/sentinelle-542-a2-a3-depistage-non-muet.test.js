import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 1 — A2 et A3 : le dépistage cesse de rendre un verdict
// rassurant quand il n'a rien pu calculer.
//
// ── A2 · L'ÉCHELLE D'UNE PRATIQUE CONFIGURABLE ÉTAIT INVISIBLE ──────────────
//
// Une évaluation produite sous une pratique configurable enregistre
// `echelleId = 'pratique-<id>'` (`evaluation-chargement.js:251`). Son échelle ne
// vit PAS dans `echellesTemplates` : elle est embarquée dans
// `pratiquesConfigurables[].config.echelle`. `obtenirTableConversionNiveaux` ne
// lisait que le premier gisement et rendait `null`.
//
// Conséquence à l'écran, et c'est le point : AUCUN message. Tous les scores
// valaient `null`, donc aucun défi n'était détecté, donc le pattern rendu était
// « Stable » et le RàI se calculait sur P seul. Un élève en difficulté sur tous
// ses critères ressortait « Stable ».
//
// Le chemin de résolution EXISTAIT DÉJÀ, mot pour mot, dans
// `evaluation-calcul.js:526`. Le dépistage lisait simplement l'autre moitié du
// monde. Le correctif converge, il n'invente rien.
//
// ── A3 · ET QUAND ÇA ÉCHOUE, L'ÉCRAN DOIT LE DIRE ──────────────────────────
//
// #529 a tranché, à raison, que la conversion ne DEVINE pas l'échelle quand
// plusieurs existent. Ce choix n'est pas rouvert. Ce qui l'est, c'est son
// silence : `diagnostiquerConversionNiveaux` rend de quoi afficher un message
// dans la carte RàI, plutôt qu'un `console.warn` que personne ne voit.
//
// ── POURQUOI CETTE SENTINELLE EXISTE ───────────────────────────────────────
//
// Les défauts A1 (#541) et A4 (#542) ont survécu à des milliers de tests verts
// parce que rien n'appelait les fonctions fautives. Un test d'existence n'est
// pas un test de comportement.

let win;
let echellesEnBase = [];
let pratiquesEnBase = [];
let evaluationsEnBase = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return echellesEnBase;
                if (k === 'test_pratiquesConfigurables') return pratiquesEnBase;
                return defaut !== undefined ? defaut : null;
            },
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) =>
            (quoi === 'evaluationsSauvegardees' ? evaluationsEnBase : []),
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.70,
        chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);
});

// L'échelle telle qu'une pratique configurable la porte : embarquée dans
// `config.echelle`, jamais dans `echellesTemplates`.
function pratiqueAvecEchelle(id, niveaux) {
    return [{ id: id, nom: 'Pratique ' + id, config: { nom: 'Pratique ' + id, echelle: { type: 'niveaux', niveaux: niveaux } } }];
}

const NIVEAUX_ABCD = [
    { code: 'A', nom: 'Excellent', valeurCalcul: 95 },
    { code: 'B', nom: 'Bien', valeurCalcul: 80 },
    { code: 'C', nom: 'Passable', valeurCalcul: 65 },
    { code: 'D', nom: 'Échec', valeurCalcul: 40 }
];

describe('#542 A2 · une échelle embarquée dans une pratique se convertit comme les autres', () => {

    it('`pratique-<id>` résout l\'échelle de la pratique — le cas qui rendait le profil MUET', () => {
        echellesEnBase = [];
        pratiquesEnBase = pratiqueAvecEchelle('litterature-h26', NIVEAUX_ABCD);

        const table = win.obtenirTableConversionNiveaux('pratique-litterature-h26');

        // AVANT le correctif : `null`, parce que `echellesTemplates` est vide et
        // que la fonction s'arrêtait là. C'est CE `null` qui produisait
        // « Stable » sans un mot.
        expect(table).not.toBeNull();
        expect(table).toEqual({ A: 0.95, B: 0.80, C: 0.65, D: 0.40 });
    });

    it('elle est trouvée même quand des échelles « templates » coexistent', () => {
        echellesEnBase = [{ id: 'ECH_AUTRE', nom: 'Autre', niveaux: [{ code: 'X', valeurCalcul: 50 }] }];
        pratiquesEnBase = pratiqueAvecEchelle('p1', NIVEAUX_ABCD);

        expect(win.obtenirTableConversionNiveaux('pratique-p1')).toEqual({ A: 0.95, B: 0.80, C: 0.65, D: 0.40 });
        // …et le gisement classique continue de répondre pour son propre id.
        expect(win.obtenirTableConversionNiveaux('ECH_AUTRE')).toEqual({ X: 0.50 });
    });

    it('une pratique disparue rend `null`, JAMAIS une valeur inventée', () => {
        // La règle de #529 tient : en l'absence d'échelle exploitable, on rend
        // `null` et l'appelant le dit. Aucun repli fabriqué ne revient par la
        // porte d'à côté.
        echellesEnBase = [];
        pratiquesEnBase = [];
        expect(win.obtenirTableConversionNiveaux('pratique-disparue')).toBeNull();

        pratiquesEnBase = [{ id: 'sans-echelle', config: { nom: 'Sans échelle' } }];
        expect(win.obtenirTableConversionNiveaux('pratique-sans-echelle')).toBeNull();

        pratiquesEnBase = pratiqueAvecEchelle('vide', []);
        expect(win.obtenirTableConversionNiveaux('pratique-vide')).toBeNull();
    });

    it('un niveau sans valeur ponctuelle reste HORS table — le jugement suspendu', () => {
        // §3-C4 du plan : un niveau sans valeur ponctuelle ne produit pas de
        // note et sort du calcul. Le chemin « pratique » doit se comporter comme
        // le chemin « template », sinon les deux divergent — c'est exactement ce
        // que #529 a eu à défaire.
        echellesEnBase = [];
        pratiquesEnBase = pratiqueAvecEchelle('p2', [
            { code: '0', nom: 'Non recevable', valeurCalcul: '' },
            { code: 'M', nom: 'Maîtrisé', valeurCalcul: 75 }
        ]);
        const table = win.obtenirTableConversionNiveaux('pratique-p2');
        expect(table).toEqual({ M: 0.75 });
        expect(table['0']).toBeUndefined();
    });

    it('un niveau à 0 EST dans la table : zéro est une valeur, pas une absence', () => {
        echellesEnBase = [];
        pratiquesEnBase = pratiqueAvecEchelle('p3', [
            { code: '0', nom: 'Non recevable', valeurCalcul: 0 },
            { code: 'M', nom: 'Maîtrisé', valeurCalcul: 75 }
        ]);
        const table = win.obtenirTableConversionNiveaux('pratique-p3');
        expect(table['0']).toBe(0);
        expect(win.convertirNiveauEnScore('0', table)).toBe(0);
    });
});

describe('#542 A3 · le dépistage dit ce qu\'il n\'a pas pu calculer', () => {

    beforeAll(() => {
        echellesEnBase = [];
        pratiquesEnBase = [];
        evaluationsEnBase = [];
    });

    it('silence total quand tout est convertible — aucun encadré parasite', () => {
        echellesEnBase = [{ id: 'ECH_1', nom: 'IDME', niveaux: NIVEAUX_ABCD }];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: 'ECH_1', retroactionFinale: 'x', criteres: [] }
        ];
        expect(win.diagnostiquerConversionNiveaux('111')).toBeNull();
    });

    it('aucune évaluation : rien à signaler (ce n\'est pas un aveuglement)', () => {
        evaluationsEnBase = [];
        expect(win.diagnostiquerConversionNiveaux('111')).toBeNull();
    });

    it('une échelle de pratique disparue est SIGNALÉE, et nommée', () => {
        echellesEnBase = [];
        pratiquesEnBase = [];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: 'pratique-fantome', retroactionFinale: 'x', criteres: [] }
        ];
        const diag = win.diagnostiquerConversionNiveaux('111');
        expect(diag).not.toBeNull();
        expect(diag.nonConverties).toBe(1);
        expect(diag.raisons.pratiqueIntrouvable).toBe(1);
        expect(diag.message).toMatch(/pratique qui n'existe plus/);
    });

    it('une évaluation sans echelleId + plusieurs échelles = signalée (le choix de #529, sans son silence)', () => {
        echellesEnBase = [
            { id: 'ECH_1', nom: 'A', niveaux: [{ code: 'M', valeurCalcul: 75 }] },
            { id: 'ECH_2', nom: 'B', niveaux: [{ code: 'M', valeurCalcul: 80 }] }
        ];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: '', retroactionFinale: 'x', criteres: [] }
        ];
        const diag = win.diagnostiquerConversionNiveaux('111');
        expect(diag.raisons.echelleNonDesignee).toBe(1);
        expect(diag.message).toMatch(/aucune échelle/);
    });

    it('une évaluation sans echelleId mais UNE seule échelle reste silencieuse — pas d\'ambiguïté', () => {
        echellesEnBase = [{ id: 'ECH_1', nom: 'A', niveaux: [{ code: 'M', valeurCalcul: 75 }] }];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: '', retroactionFinale: 'x', criteres: [] }
        ];
        expect(win.diagnostiquerConversionNiveaux('111')).toBeNull();
    });

    it('le message distingue « toutes » de « certaines » — la nuance qui change la lecture', () => {
        echellesEnBase = [{ id: 'ECH_1', nom: 'A', niveaux: [{ code: 'M', valeurCalcul: 75 }] }];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: 'ECH_1', retroactionFinale: 'x', criteres: [] },
            { etudiantDA: '111', echelleId: 'ECH_DISPARUE', retroactionFinale: 'x', criteres: [] }
        ];
        let diag = win.diagnostiquerConversionNiveaux('111');
        expect(diag.total).toBe(2);
        expect(diag.nonConverties).toBe(1);
        expect(diag.message).toMatch(/calculé sur les autres seulement/);

        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: 'ECH_DISPARUE', retroactionFinale: 'x', criteres: [] }
        ];
        diag = win.diagnostiquerConversionNiveaux('111');
        expect(diag.message).toMatch(/Aucune des 1 évaluations/);
        expect(diag.message).toMatch(/ne les lis pas comme un portrait/);
    });

    it('une évaluation REMPLACÉE ne compte pas — elle porte l\'état d\'avant une reprise', () => {
        echellesEnBase = [{ id: 'ECH_1', nom: 'A', niveaux: [{ code: 'M', valeurCalcul: 75 }] }];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: 'ECH_DISPARUE', retroactionFinale: 'x', criteres: [], remplaceeParId: 'EVAL_9' }
        ];
        expect(win.diagnostiquerConversionNiveaux('111')).toBeNull();
    });

    it('le diagnostic ne concerne QUE l\'élève demandé', () => {
        echellesEnBase = [{ id: 'ECH_1', nom: 'A', niveaux: [{ code: 'M', valeurCalcul: 75 }] }];
        evaluationsEnBase = [
            { etudiantDA: '111', echelleId: 'ECH_1', retroactionFinale: 'x', criteres: [] },
            { etudiantDA: '222', echelleId: 'ECH_DISPARUE', retroactionFinale: 'x', criteres: [] }
        ];
        expect(win.diagnostiquerConversionNiveaux('111')).toBeNull();
        expect(win.diagnostiquerConversionNiveaux('222')).not.toBeNull();
    });
});
