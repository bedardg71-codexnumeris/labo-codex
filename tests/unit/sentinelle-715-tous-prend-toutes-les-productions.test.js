import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #715 (21 sept. 2026) — sous `methodeSelection: 'tous'`, la note prend TOUTES les
// productions évaluées, dans les DEUX chemins. Avant : le chemin riche
// (`_selectionnerArtefactsLegacy`, profil-etudiant-actions.js) coupait à `nombreARetenir` dans
// l'ordre de stockage (76,75), l'instance (pratique-pan-standards.js, case 'tous') prenait tout
// (77,32). #394 avait réuni les deux systèmes sur « meilleurs » et « récents », pas sur « tous ».
//
// Le corpus reprend les nombres du banc de l'audit du 16 sept. (A2b) : 4 « à retenir »,
// 5 évaluations valides (85, 60, 78, 70, 78), une autre en brouillon (A8, hors note, #706), une
// terminale à 82, pondérations 60/40. Moyenne des 5 = 74,2 → 74,2 × 0,6 + 82 × 0,4 = 77,32.
// A2b juge les mêmes nombres par `simulerIndices` et par l'export, sur le moteur de l'assistant.
//
// Le harnais est celui de la sentinelle #394 : la chaîne complète sur un même faux window.

const DA = '1234567';
const NOTES = { A1: 85, A2: 60, A3: 78, A4: 70, A5: 78 };

function corpus(methodeSelection, ordre, notes = NOTES) {
    const productions = [
        { id: 'PF', type: 'portfolio', ponderation: 60, titre: 'Portfolio' },
        { id: 'TERM', type: 'terminale', ponderation: 40, numero: 7, titre: 'Analyse finale' }
    ];
    for (let i = 1; i <= 8; i++) productions.push({ id: 'A' + i, type: 'artefact-portfolio', numero: i, titre: 'Artefact ' + i });
    const valide = (pid) => ({
        etudiantDA: DA, productionId: pid, noteFinale: notes[pid], ponderationCouverte: 100, verrouillee: true,
        dateEvaluation: '2026-02-0' + pid.slice(1), remplaceeParId: null
    });
    return {
        productions,
        evaluationsSauvegardees: [
            ...ordre.map(valide),
            // Brouillon non verrouillé : nommé au récit, jamais compté (#706).
            { etudiantDA: DA, productionId: 'A8', noteFinale: 0, ponderationCouverte: 50, verrouillee: false, remplaceeParId: null },
            { etudiantDA: DA, productionId: 'TERM', noteFinale: 82, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null }
        ],
        groupeEtudiants: [{ da: DA, nom: 'Test', prenom: 'Étudiant' }],
        pratiquesConfigurables: [{
            id: 'standards',
            nom: 'STD de test',
            configuration: {
                type: 'standards',
                portfolio: { nombreTotal: 6, nombreARetenir: 4, minimumCompletion: 2, methodeSelection }
            }
        }]
    };
}

function chargerChaine(store) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; }
    };
    const cle = (k) => k;
    const obtenirDonneesSelonMode = (k) => (k in store ? store[k] : null);

    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    const ponts = {
        db, cle, obtenirDonneesSelonMode,
        estEtudiantExclu: () => false,
        obtenirTypePratiqueActive: () => 'standards',
        obtenirPratiqueActiveGroupeCours: () => 'standards',
        obtenirPratiqueParId: (...a) => win.obtenirPratiqueParId(...a),
        obtenirConfigPratiqueActive: (...a) => win.obtenirConfigPratiqueActive(...a),
        calculerDetailsNoteFinale: (...a) => win.calculerDetailsNoteFinale(...a)
    };
    chargerScript('js/pratiques/pratique-pan-standards.js', ponts, win);
    chargerScript('js/portfolio.js', ponts, win);
    chargerScript('js/profil-etudiant-actions.js', ponts, win);
    return win;
}

function lesDeuxChemins(methodeSelection, ordre, notes) {
    const win = chargerChaine(corpus(methodeSelection, ordre, notes));
    const riche = win.calculerDetailsNoteFinale(DA);
    const instance = win.obtenirPratiqueParId('standards').calculerPerformance(DA);
    return { riche, instance };
}

// Trois ordres de stockage. Sous l'ancienne coupe (les 4 premiers stockés), chacun donnait une
// note DIFFÉRENTE : c'est ce qui fait qu'un ordre seul ne jugerait rien.
const ORDRES = {
    // 4 premiers = 85, 60, 78, 70 → 73,25 → 76,75 (la valeur que A2b figeait)
    'par numéro': ['A1', 'A2', 'A3', 'A4', 'A5'],
    // 4 premiers = 60, 70, 78, 78 → 71,5 → 75,7
    'les plus faibles d\'abord': ['A2', 'A4', 'A3', 'A5', 'A1'],
    // 4 premiers = 85, 78, 78, 70 → 77,75 → 79,45
    'les plus fortes d\'abord': ['A1', 'A5', 'A3', 'A4', 'A2']
};

describe('#715 · sous « tous », la note prend toutes les productions évaluées — dans les deux chemins', () => {
    for (const [nom, ordre] of Object.entries(ORDRES)) {
        it(`stockage « ${nom} » : 77,32 au chemin riche ET à l'instance`, () => {
            const { riche, instance } = lesDeuxChemins('tous', ordre);
            expect(riche.erreur).toBeNull();
            expect(riche.noteFinale).toBeCloseTo(77.32, 6);
            expect(instance).toBeCloseTo(0.7732, 6);
        });
    }

    it('le chemin riche RETIENT les cinq valides (le brouillon reste dehors), et n\'en écarte aucune', () => {
        const { riche } = lesDeuxChemins('tous', ORDRES['par numéro']);
        expect(riche.portfolio.nombreRetenus).toBe(5);
        expect(riche.portfolio.nombreEvalues).toBe(5);
        expect(riche.portfolio.artefactsRetenus.map(a => a.productionId).sort()).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);
        const horsSelection = riche.recit.resultats.filter(r => /hors des/.test(r.detail || ''));
        expect(horsSelection).toEqual([]);
    });
});

// Relecture croisée de Cowork (21 sept. 2026, 10 h 37) : tous les jeux ci-dessus ont CINQ valides pour N = 4 — une coupe à
// N + 1 y prend tout, par hasard, et sa mutation restait VERTE (152 / 152). Ici, SEPT valides (N + 3), la plus faible
// stockée en dernier : toute coupe qui reviendrait sous « tous », quelle que soit sa borne (N, N + 1, `nombreTotal` = 6),
// l'écarte et change la note.
describe('#715 · sous « tous », AUCUNE borne ne coupe : sept valides pour N = 4 et nombreTotal = 6', () => {
    const SEPT = { A1: 85, A2: 60, A3: 78, A4: 70, A5: 78, A6: 90, A7: 40 };
    const ORDRE = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'];   // la plus faible (40) en dernier
    // (85+60+78+70+78+90+40)/7 = 501/7 = 71,5714… → × 0,6 + 82 × 0,4 = 75,742857…
    const ATTENDU = (501 / 7) * 0.6 + 82 * 0.4;

    it('la note est la moyenne des SEPT, au chemin riche ET à l\'instance (coupe à 5 : 77,32 ; à 6 : 78,9)', () => {
        const { riche, instance } = lesDeuxChemins('tous', ORDRE, SEPT);
        expect(riche.noteFinale).toBeCloseTo(ATTENDU, 6);
        expect(instance).toBeCloseTo(ATTENDU / 100, 6);
        expect(riche.portfolio.nombreRetenus).toBe(7);
        expect(riche.portfolio.artefactsRetenus.map(a => a.productionId)).toContain('A7');
    });

    it('témoin : sous « meilleurs », le même jeu écarte bien la plus faible (les 4 meilleures : 90, 85, 78, 78 → 82,45)', () => {
        const { riche, instance } = lesDeuxChemins('meilleurs', ORDRE, SEPT);
        expect(riche.noteFinale).toBeCloseTo(82.75 * 0.6 + 32.8, 6);
        expect(instance).toBeCloseTo((82.75 * 0.6 + 32.8) / 100, 6);
        expect(riche.portfolio.artefactsRetenus.map(a => a.productionId)).not.toContain('A7');
    });
});

describe('#715 · non-régression — les modes qui trient coupent toujours à N, quel que soit le stockage', () => {
    for (const [nom, ordre] of Object.entries(ORDRES)) {
        it(`« meilleurs », stockage « ${nom} » : les 4 meilleures (85, 78, 78, 70) → 79,45`, () => {
            const { riche, instance } = lesDeuxChemins('meilleurs', ordre);
            expect(riche.noteFinale).toBeCloseTo(79.45, 6);
            expect(riche.portfolio.nombreRetenus).toBe(4);
            expect(instance).toBeCloseTo(0.7945, 6);
        });

        it(`« récents », stockage « ${nom} » : les 4 plus récentes par numéro (A5, A4, A3, A2) → 75,7`, () => {
            const { riche, instance } = lesDeuxChemins('recents', ordre);
            expect(riche.noteFinale).toBeCloseTo(75.7, 6);
            expect(riche.portfolio.artefactsRetenus.map(a => a.productionId).sort()).toEqual(['A2', 'A3', 'A4', 'A5']);
            expect(instance).toBeCloseTo(0.757, 6);
        });
    }
});
