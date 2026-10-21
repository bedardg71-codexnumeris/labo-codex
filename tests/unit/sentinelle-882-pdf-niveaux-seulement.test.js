import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #882 (16 sept. 2026, 9 h 09) — « J'ai caché la case "niveau de performance" pour n'afficher
// que le niveau pas la note chiffrée. Malgré tout, lorsque j'exporte le format PDF de la
// rétroaction, la note chiffrée est affichée (et on montre l'algorithme de calcul). »
//
// Le choix « Note chiffrée / Niveau de performance » est enregistré dans l'évaluation
// (`optionsAffichage.affichageNote`, 'complet' | 'lettre'). Le PDF de synthèse ne le lisait
// pas : la rangée « Note provisoire » imprimait les % par artefact, le calcul et la note finale.
//
// Décision de Grégoire (16 sept.) : garder le bloc, NIVEAUX SEULEMENT — artefacts retenus,
// obligatoires et à venir restent, avec leur niveau ; ni pourcentage, ni calcul, ni note finale.

const PRODUCTIONS = [
    { id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'A7', titre: 'Artefact 7', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'A9', titre: 'Artefact 9', type: 'artefact-portfolio', categorie: 'obligatoire' },
    { id: 'A10', titre: 'Artefact 10', type: 'artefact-portfolio', categorie: 'obligatoire' }
];

const EVALUATIONS = [
    { id: 'E1', etudiantDA: '111', productionId: 'A1', niveauFinal: 'D', noteFinale: 68.5 },
    { id: 'E9', etudiantDA: '111', productionId: 'A9', niveauFinal: 'M', noteFinale: 81.25 }
];

function charger(pratique) {
    const winData = chargerScript('js/synthese-retroaction-data.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirEchelleResolue: () => null,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : k === 'evaluationsSauvegardees' ? EVALUATIONS : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        obtenirConfigPratiqueActive: () => pratique,
        calculerDetailsNoteFinale: () => ({
            portfolio: {
                methodeSelection: 'hybride',
                moyenne: 68.5,
                nombreEvalues: 2,
                artefactsRetenus: [
                    { productionId: 'A1', niveau: 'D', note: 68.5 },
                    { productionId: 'A9', niveau: 'M', note: 81.25 }
                ]
            }
        })
    });
    const winRendu = chargerScript('js/synthese-retroaction-rendu.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null) },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s)
    });
    return { data: winData.syntheseRetroactionData, rendu: winRendu.syntheseRetroactionRendu };
}

const PRATIQUE_HYBRIDE = {
    configuration: {
        categories: { selection: { ponderation: 65 }, obligatoires: { ponderation: 35 } }
    }
};

function evaluation(affichageNote) {
    return {
        id: 'E1', etudiantDA: '111', productionId: 'A1', grilleId: 'G1', echelleId: 'ECH',
        niveauFinal: 'D', noteFinale: 68.5,
        criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 100 }],
        optionsAffichage: affichageNote ? { affichageNote } : undefined
    };
}

// Le texte de la rangée « Note provisoire » seulement : le reste du PDF a ses propres chiffres
// (pondérations des critères sous leur nom), hors de ce correctif.
function rangeeNote(html) {
    const i = html.indexOf('Note provisoire');
    expect(i, 'rangée « Note provisoire » absente').toBeGreaterThan(-1);
    return html.slice(i).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
}

describe('#882 — « Niveau de performance » : le PDF ne montre que des niveaux', () => {

    it('niveaux seulement : aucune note, aucune moyenne, aucune pondération dans le bilan', () => {
        const { data } = charger(PRATIQUE_HYBRIDE);
        const note = data.construireFeedback(evaluation('lettre'), { id: 'F1' }, null).bilan.note;
        expect(note.niveauxSeulement).toBe(true);
        expect(note.moyenne).toBeNull();
        expect(note.ponderationSelection).toBeNull();
        expect(note.ponderationObligatoires).toBeNull();
        expect(note.selection.map(a => [a.titre, a.niveau, a.note])).toEqual([['Artefact 1', 'D', null]]);
        expect(note.obligatoires.map(o => [o.titre, o.niveau, o.note]))
            .toEqual([['Artefact 9', 'M', null], ['Artefact 10', null, null]]);
    });

    it('le rendu garde le bloc et ses niveaux, sans %, sans calcul, sans note finale', () => {
        const { data, rendu } = charger(PRATIQUE_HYBRIDE);
        const texte = rangeeNote(rendu.rendreSyntheseHTML(data.construireFeedback(evaluation('lettre'), { id: 'F1' }, null)));
        expect(texte).toContain('Artefact 1 (D)');
        expect(texte).toContain('Artefact 9 (M)');
        expect(texte).toContain('Artefact 10 (non remis)');
        expect(texte).not.toMatch(/\d\s*%/);
        expect(texte).not.toMatch(/pts|Note finale/);
    });

    it('notes FINALES : un obligatoire non remis ne fait pas réapparaître de calcul (« 0 % »)', () => {
        // En fin de session, le rendu compte un obligatoire non remis comme 0. Aucun calcul ne se
        // reforme pour autant : sans pondération (retirée par le module data), il n'y en a pas.
        const { data, rendu } = charger({ configuration: Object.assign({ notesFinales: true }, PRATIQUE_HYBRIDE.configuration) });
        const html = rendu.rendreSyntheseHTML(data.construireFeedback(evaluation('lettre'), { id: 'F1' }, null));
        const i = html.indexOf('Note finale');
        expect(i, 'rangée « Note finale » absente').toBeGreaterThan(-1);
        const texte = html.slice(i).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
        expect(texte).toContain('Artefact 9 (M)');
        expect(texte).not.toMatch(/\d\s*%|pts/);
    });

    it('note chiffrée (défaut) : le bloc reste celui d\'avant, avec calcul et note finale', () => {
        const { data, rendu } = charger(PRATIQUE_HYBRIDE);
        const texte = rangeeNote(rendu.rendreSyntheseHTML(data.construireFeedback(evaluation('complet'), { id: 'F1' }, null)));
        expect(texte).toContain('Artefact 1 (D, 68,5\u00A0%)');
        expect(texte).toMatch(/Note finale = 44,5\u00A0pts \+ 28,4\u00A0pts = 68,5\u00A0%/);   // 21 oct. 2026 : une phrase, une norme
        expect(texte).toMatch(/68,5\u00A0%\s+65\u00A0% =\s+44,5\u00A0pts/);   // « … = 68.5 % × 65 % = 44.5 pts », balises et entités retirées
    });

    it('sans choix enregistré, la pratique active décide (même priorité que l\'aperçu)', () => {
        const { data } = charger(Object.assign({ affichageNote: 'lettre' }, PRATIQUE_HYBRIDE));
        expect(data.construireFeedback(evaluation(null), { id: 'F1' }, null).bilan.note.niveauxSeulement).toBe(true);
        // …et le choix enregistré l'emporte sur la pratique.
        expect(data.construireFeedback(evaluation('complet'), { id: 'F1' }, null).bilan.note.niveauxSeulement).toBeUndefined();
    });
});
