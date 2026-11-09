/**
 * SENTINELLE — 9 nov. 2026 · LE PDF DE L'ÉLÈVE DIT « ÉVALUATION », PLUS « COPIE »
 *
 * Lot « Production plutôt que copie », étape 2. Décision de Grégoire (9 nov. 2026,
 * 10 h 14 à 10 h 17, en Cowork) sur les deux seules lignes du relevé qui s'impriment
 * sur le PDF de rétroaction que reçoivent ses étudiant·es (drapeau ÉL, entrées 448
 * et 449 du relevé de la nuit) :
 *   « Cette copie n'a pas de niveau général » → « Cette évaluation n'a pas de niveau général »
 *   « Note de la copie : »                     → « Note : »
 * Règle : l'étudiant·e produit, l'enseignant·e évalue ; la note et le niveau sont
 * ceux de l'évaluation. Seul le mot change : l'apostrophe typographique (’) et la
 * suite de la phrase (« : Langue (20 %) reste à évaluer. ») restent ceux de #674.
 *
 * ⮕ CHEMINS RÉELS : `synthese-retroaction-data.js` puis `synthese-retroaction-rendu.js`
 * chargés dans le bac à sable, comme la porte 2 de #674 ; c'est le HTML du PDF qui est
 * lu, pas la source.
 *
 * BREAK-TEST (9 nov. 2026) : avant le changement du rendu, les trois essais « dit »
 * rougissent (ancien texte présent, nouveau absent) ; les témoins restent verts.
 *
 * ⚠ Aucune donnée réelle : grille et évaluations fictives.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Même lecture que la porte 2 de #674 : la valeur d'un niveau est sa `valeurCalcul`.
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

const GRILLE = {
    id: 'G1', nom: 'Grille témoin 50/30/20',
    criteres: [
        { id: 'CR_1750000000000_1_aabbccddeeff', nom: 'Contenu', ponderation: 50 },
        { id: 'CR_1750000000000_2_aabbccddeeff', nom: 'Organisation', ponderation: 30 },
        { id: 'CR_1750000000000_3_aabbccddeeff', nom: 'Langue', ponderation: 20 }
    ]
};
const ECHELLE = {
    id: 'E1', nom: 'IDME',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 55, couleur: '#c0392b' },
        { code: 'D', nom: 'Développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#e67e22' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 80, couleur: '#27ae60' },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 95, couleur: '#2980b9' }
    ]
};
// Une évaluation d'avant #674, incomplète : « Langue » était dans la grille ce jour-là.
const EVAL_INCOMPLETE = {
    id: 'EV1', etudiantDA: '111', grilleId: 'G1', echelleId: 'E1', dateEvaluation: '2026-08-25T14:00:00.000Z',
    noteFinale: 95, niveauFinal: 'E',
    criteres: [
        { critereId: 'CR_1750000000000_1_aabbccddeeff', critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
        { critereId: 'CR_1750000000000_2_aabbccddeeff', critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 }
    ]
};

function monterPdf() {
    const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
    const base = { test_grillesTemplates: [GRILLE] };
    const communs = {
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
        obtenirEchelleResolue: () => ECHELLE,
        obtenirDonneesSelonMode: () => [],
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        porteeDepuisEvaluation: calcul.porteeDepuisEvaluation,
        texteCriteresHorsNote: calcul.texteCriteresHorsNote
    };
    const data = chargerScript('js/synthese-retroaction-data.js', communs);
    const rendu = chargerScript('js/synthese-retroaction-rendu.js', communs);
    return {
        feedback: (evaluation) => data.syntheseRetroactionData.construireFeedback(evaluation, { id: 'F1' }, null),
        html: (feedback) => rendu.syntheseRetroactionRendu.rendreSyntheseHTML(feedback)
    };
}

describe('PDF de l\'élève — « évaluation », plus « copie » (décision de Grégoire, 9 nov. 2026)', () => {
    it('une évaluation incomplète dit « Cette évaluation n’a pas de niveau général », la suite de #674 intacte', () => {
        const { feedback, html } = monterPdf();
        const page = html(feedback(EVAL_INCOMPLETE));
        expect(page).toContain('Cette évaluation n’a pas de niveau général : Langue (20 %) reste à évaluer.');
        expect(page).not.toContain('Cette copie');
    });

    it('sans liste à nommer, la phrase s\'arrête au premier membre : « Cette évaluation n’a pas de niveau général. »', () => {
        const { feedback, html } = monterPdf();
        const fb = feedback(EVAL_INCOMPLETE);
        const page = html(Object.assign({}, fb, { portee: Object.assign({}, fb.portee, { criteresHorsNote: [] }) }));
        expect(page).toContain('Cette évaluation n’a pas de niveau général.');
        expect(page).not.toContain('Cette copie');
    });

    it('une évaluation en points dit « Note : 74 % », sans « de la copie »', () => {
        const { feedback, html } = monterPdf();
        const fb = feedback(EVAL_INCOMPLETE);
        const enPoints = Object.assign({}, fb, { portee: null, overall: { code: '', label: '', enPoints: true, note: 74 } });
        const page = html(enPoints);
        expect(page).toMatch(/Note : 74 ?\s?%/);
        expect(page).not.toContain('Note de la copie');
        expect(page).not.toContain('Note de l’évaluation');
        expect(page).not.toContain('Note de l\'évaluation');
    });

    it('témoin de source : aucun « copie » ne reste dans une chaîne du rendu du PDF', () => {
        const src = readFileSync(path.join(racine, 'js/synthese-retroaction-rendu.js'), 'utf8');
        // Les commentaires peuvent dire « copie » (l'historique) ; les chaînes, non.
        const sansCommentaires = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
        expect(sansCommentaires).not.toMatch(/['"`][^'"`\n]*\bcopies?\b[^'"`\n]*['"`]/i);
        expect(src).toContain("const TEXTE_PORTEE_INCOMPLETE = 'Cette évaluation n’a pas de niveau général';");
        expect(src).toContain("esc('Note : ' + formaterNotePourcentage(o.note))");
    });
});
