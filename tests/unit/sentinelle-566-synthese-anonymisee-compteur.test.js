import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #566 (29 août 2026) — LA SYNTHÈSE ANONYMISE, LE COMPTEUR DIT VRAI.
//
// Constat B13 : le modal de révision anonymisait les rétroactions, la synthèse
// rasterisée jamais (un prénom tapé sortait dans le PDF en mode anonymisé) ; et
// le compteur de l'export Léa refaisait la sélection sans résoudre les fichiers,
// comptant des évaluations que l'export ignorait ensuite en silence.
//
//   A — le commentaire libre d'un critère passe par `anonymiserTexteRetroaction`
//       (et reste intact quand l'anonymiseur rend le texte tel quel) ;
//   B — `selectionnerEvaluationsLea` : une évaluation sans fichier résolu est
//       comptée dans `sansFichier`, pas dans `fichiers` ; la reprise prime ;
//   C — cliquets : l'export et le compteur lisent la MÊME sélection.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/* ------------------------------------------------------------------ A */

function chargerSynthese(anonymiseur) {
    const stubs = {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirEchelleResolue: () => ({ niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89, couleur: '#0a0' }] }),
        obtenirDonneesSelonMode: () => [],
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'H2026' }),
        obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null
    };
    if (anonymiseur) stubs.anonymiserTexteRetroaction = anonymiseur;
    return chargerScript('js/synthese-retroaction-data.js', stubs);
}
const EVAL = {
    id: 'EV1', etudiantDA: '111', grilleId: 'G1', echelleId: 'E1', niveauFinal: 'M',
    criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: 'M', ponderation: 50, retroaction: 'Bonjour Marie, ton analyse tient.' }]
};

describe('#566 · A — le commentaire libre de la synthèse passe par l\'anonymiseur', () => {
    it('en mode anonymisé (anonymiseur actif), le prénom ne sort pas', () => {
        const appels = [];
        const win = chargerSynthese((texte, da) => { appels.push([texte, da]); return String(texte).replace(/Marie/g, 'Élève 7'); });
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL, { id: 'F1' }, null);
        const commentaires = JSON.stringify(fb);
        expect(commentaires).not.toContain('Marie');
        expect(commentaires).toContain('Élève 7');
        expect(appels.some(a => a[0] === 'Bonjour Marie, ton analyse tient.' && a[1] === '111')).toBe(true);
    });

    it('hors mode anonymisé (anonymiseur transparent), le texte est intact', () => {
        const win = chargerSynthese((t) => t);
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL, { id: 'F1' }, null);
        expect(JSON.stringify(fb)).toContain('Bonjour Marie, ton analyse tient.');
    });
});

/* ------------------------------------------------------------------ B */

function chargerArchivage({ fichiers, evaluations, resoudre }) {
    const win = chargerScript('js/travaux-archivage.js', {
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? evaluations : []),
        sauvegarderDonneesSelonMode: () => true,
        obtenirTrimestreActif: () => null,
        travauxStockage: { obtenirFichiersGroupeActif: () => fichiers, obtenirFichiersAffiches: () => fichiers /* #1013 */ },
        travauxResolution: { trouverFichierPourEvaluation: resoudre },
        travauxExportPDF: {},
        alert: () => {}, JSZip: function () {}
    }, { addEventListener: () => {}, removeEventListener: () => {} });
    return win.travauxArchivage;
}

describe('#566 · B — la sélection Léa distingue ce qui donnera un PDF de ce qui n\'en donnera pas', () => {
    const fichiers = [{ id: 'F1', etudiantDA: '111', productionId: 'P1' }, { id: 'F2', etudiantDA: '222', productionId: 'P9' }];
    const evaluations = [
        { id: 'E1', etudiantDA: '111', productionId: 'P1' },                       // fichier résolu
        { id: 'E2', etudiantDA: '222', productionId: 'P1' },                       // pas de fichier pour P1
        { id: 'E3', etudiantDA: '111', productionId: 'P1', repriseDeId: 'E1' },    // reprise : prime sur E1
        { id: 'E4', etudiantDA: '333', productionId: 'P1' }                        // hors groupe actif
    ];
    const resoudre = (e) => (e.etudiantDA === '111' ? fichiers[0] : null);

    it('un élève sans fichier est dans sansFichier, pas dans fichiers ; la reprise l\'emporte', () => {
        const sel = chargerArchivage({ fichiers, evaluations, resoudre }).selectionnerEvaluationsLea('P1', null, false);
        expect(sel.evaluations.map(e => e.id).sort()).toEqual(['E2', 'E3']);
        expect(sel.fichiers.map(f => f.id)).toEqual(['F1']);
        expect(sel.sansFichier.map(e => e.id)).toEqual(['E2']);
    });

    it('filtre par élève et par reprises seulement', () => {
        const a = chargerArchivage({ fichiers, evaluations, resoudre });
        expect(a.selectionnerEvaluationsLea('P1', '222', false).sansFichier.map(e => e.id)).toEqual(['E2']);
        expect(a.selectionnerEvaluationsLea('P1', null, true).evaluations.map(e => e.id)).toEqual(['E3']);
    });
});

/* ------------------------------------------------------------------ C */

describe('#566 · C — cliquets : export et compteur lisent la même sélection', () => {
    it('exporterPourLea ne refait pas la sélection ; le compteur interroge selectionnerEvaluationsLea', () => {
        const archivage = nettoyer(readFileSync(path.join(racineProjet, 'js', 'travaux-archivage.js'), 'utf8'));
        const i = archivage.indexOf('async function exporterPourLea(');
        const corps = archivage.slice(i, archivage.indexOf('\n    }\n', i));
        expect(corps).toContain('selectionnerEvaluationsLea(productionId, da, reprisesSeulement)');
        expect(corps).not.toContain("obtenirDonneesSelonMode('evaluationsSauvegardees')");

        const ui = nettoyer(readFileSync(path.join(racineProjet, 'js', 'travaux-ui.js'), 'utf8'));
        const j = ui.indexOf('function mettreAJourCompteurLea(');
        const compteur = ui.slice(j, ui.indexOf('\n    }\n', j));
        expect(compteur).toContain('travauxArchivage.selectionnerEvaluationsLea(productionId, da, reprisesSeulement)');
        expect(compteur).not.toContain("obtenirDonneesSelonMode('evaluationsSauvegardees')");
        expect(compteur).toContain('sansFichier');
    });
});
