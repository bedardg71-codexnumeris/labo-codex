import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #339 (15 oct. 2026) — LE ZÉRO FANTÔME D'UNE TERMINALE MARQUÉE « OBLIGATOIRE ».
//
// L'écran des catégories (pratiques-gestion.js) laisse cocher la terminale parmi les obligatoires. Sa copie
// n'entre jamais dans le pool du portfolio (`_filtrerEvaluationsArtefactsValides` l'écarte : elle a sa
// propre pondération). En notes FINALES, le dénominateur des obligatoires comptait pourtant toutes les
// productions marquées : la terminale y entrait comme une obligatoire non remise, un zéro pour une copie
// remise. Mesuré par Cowork sur la démo (configuration S1) : DEMO007, 85,53 en provisoire, 66,65 en final.
// Banc de ce lot (pack démo, terminale cochée) : les 10 élèves remontaient en final, aucune baisse.
//
// Ce que la sentinelle garde : en final, la terminale ne compte pas parmi les obligatoires ; une VRAIE
// obligatoire non remise y compte toujours pour zéro (la règle du wizard, inchangée).

const PRODUCTIONS = [
    { id: 'S1', titre: 'Artefact 1', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'S2', titre: 'Artefact 2', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'O1', titre: 'Artefact 3', type: 'artefact-portfolio', categorie: 'obligatoire' },
    { id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60 },
    { id: 'T', titre: 'Évaluation terminale', type: 'terminale', ponderation: 40 }
];

const EVAL = (id, productionId, note) => ({
    id, etudiantDA: '111', productionId, noteFinale: note, niveauFinal: 'M', verrouillee: true, statutIntegrite: 'recevable'
});

function monter({ finales, terminaleObligatoire, obligatoireNonRemise = false }) {
    const productions = PRODUCTIONS.map(p => (p.id === 'T' && terminaleObligatoire ? Object.assign({}, p, { categorie: 'obligatoire' }) : p));
    if (obligatoireNonRemise) productions.push({ id: 'O2', titre: 'Artefact 4', type: 'artefact-portfolio', categorie: 'obligatoire' });
    const evaluations = [EVAL('E1', 'S1', 80), EVAL('E2', 'S2', 70), EVAL('E3', 'O1', 90), EVAL('E4', 'T', 85)];
    const config = {
        notesFinales: finales,
        portfolio: { methodeSelection: 'meilleurs', nombreARetenir: 2, minimumCompletion: 3, reglesConformite: { actif: false } },
        categories: { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } }
    };
    const store = { test_evaluationsSauvegardees: evaluations, test_productions: productions, test_pratiquesConfigurables: [] };
    const globaux = {
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync() {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (k) => store['test_' + k] || [],
        obtenirTypePratiqueActive: () => 'standards',
        obtenirPratiqueActiveGroupeCours: () => 'P1',
        designerPratiqueActive: () => ({ etat: 'ok', idBrut: 'P1', id: 'P1', donnees: null, famille: 'standards' }),
        obtenirConfigPratiqueActive: () => config,
        obtenirConfigCategories: () => config.categories
    };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/entites/production-diagnostique.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: function () {} }, globaux), win);
    chargerScript('js/profil-etudiant-actions.js', globaux, win);
    return win.calculerDetailsNoteFinale('111');
}

// Sélection : les 2 meilleures (80, 70) → 75 ; obligatoires : O1 → 90. Portfolio : 75 × 65 % + 90 × 35 % = 80,25.
// Note : 80,25 × 60 % + 85 × 40 % = 82,15.
const NOTE_JUSTE = 82.15;

describe('#339 — une terminale marquée « obligatoire » ne compte pas pour zéro en notes finales', () => {

    it('FINALE, terminale cochée obligatoire : la note est celle du provisoire (82,15), pas 72,7', () => {
        const d = monter({ finales: true, terminaleObligatoire: true });
        expect(d.noteFinale).toBeCloseTo(NOTE_JUSTE, 6);
    });

    it('PROVISOIRE, terminale cochée obligatoire : 82,15 (inchangé par le lot)', () => {
        expect(monter({ finales: false, terminaleObligatoire: true }).noteFinale).toBeCloseTo(NOTE_JUSTE, 6);
    });

    it('TÉMOIN — terminale non cochée : 82,15 en final comme en provisoire', () => {
        expect(monter({ finales: true, terminaleObligatoire: false }).noteFinale).toBeCloseTo(NOTE_JUSTE, 6);
    });

    it('TÉMOIN — une VRAIE obligatoire non remise compte toujours pour zéro en final (90 / 2 = 45)', () => {
        // Portfolio : 75 × 65 % + 45 × 35 % = 64,5 ; note : 64,5 × 60 % + 85 × 40 % = 72,7.
        const d = monter({ finales: true, terminaleObligatoire: true, obligatoireNonRemise: true });
        expect(d.noteFinale).toBeCloseTo(72.7, 6);
    });
});
