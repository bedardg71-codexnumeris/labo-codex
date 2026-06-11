import { describe, it, expect, beforeAll } from 'vitest';
import { chargerCodex } from './_helpers/charger-codex.js';

/**
 * Skeleton de tests pour js/codex.js — préparation pour l'ultrareview
 * du 12 mai 2026 (PR #16, branche review/codex-2026-05-12).
 *
 * Catégories anticipées (cf. description PR #16) :
 *   - Sécurité : échappement HTML, validation imports ZIP/JSON
 *   - Rétrocompat : format du manifeste codex (rétrocompat-breaking si modifié)
 *   - Code mort / IIFE structure / exports window.*
 *   - FSAPI : auto-save Chrome/Edge vs fallback download (sprint #239)
 *   - Comparer vs Fusionner : sérialisation rapport (sprint #243)
 *
 * Convention : 1 test Vitest par bug fixé. Couvrir le comportement attendu,
 * pas le bug spécifique (cf. SESSION.md du 13 mai 2026 §85-90).
 */

let win;
beforeAll(() => {
    win = chargerCodex();
});

describe('codex.js — sanity load', () => {

    it('charge sans erreur et expose window.Codex', () => {
        expect(win.Codex).toBeDefined();
        expect(typeof win.Codex).toBe('object');
    });

    it('expose les actions attendues du menu Codex', () => {
        const actions = [
            'actionOuvrir',
            'actionEnregistrer',
            'actionEnregistrerSous',
            'actionNouveau',
            'actionDetails',
            'actionRenommer',
            'actionFusionner',
            'actionComparer',
            'actionExporterSelection',
            'actionFermer'
        ];
        for (const nom of actions) {
            expect(typeof win.Codex[nom]).toBe('function');
        }
    });

    it('expose l\'état et le marqueur de modification', () => {
        expect(typeof win.Codex.etat).toBe('function');
        expect(typeof win.Codex.marquerModification).toBe('function');
    });

    it('expose les helpers de la modale Comparer (#243)', () => {
        expect(typeof win.Codex.fermerModalComparer).toBe('function');
        expect(typeof win.Codex.copierRapportComparaison).toBe('function');
        expect(typeof win.Codex.telechargerRapportComparaison).toBe('function');
    });

});

// ====================================================================
// TESTS À AJOUTER QUAND LES FINDINGS DE L'ULTRAREVIEW ARRIVENT
// ====================================================================
//
// describe('codex.js — sécurité', () => {
//     it.todo('échappe les balises HTML dans les noms importés du manifeste');
//     it.todo('validerCodex rejette un ZIP avec un manifeste manquant');
//     it.todo('lireCodexExterne rejette un manifeste à version non supportée');
// });
//
// describe('codex.js — rétrocompat manifeste', () => {
//     it.todo('FORMAT_VERSION reste à 1 (changement = breaking pour codex existants)');
//     it.todo('NOM_MANIFESTE_ANCIEN ("classeur-manifeste.json") accepté à l\'import');
// });
//
// describe('codex.js — fusion 3-way', () => {
//     it.todo('_analyserFusion détecte les conflits sur valeurs scalaires divergentes');
//     it.todo('_analyserFusionTravaux gère un travail supprimé localement et modifié externe');
// });
//
// describe('codex.js — comparaison (#243)', () => {
//     it.todo('_construireRapportComparaison produit toutes les catégories attendues');
// });
//
// describe('codex.js — FSAPI (#239)', () => {
//     it.todo('_peutPartagerFichier détecte correctement le support navigator.share');
// });

describe('codex.js — bilan d\'import incomplet (#334 session B)', () => {

    it('expose construireBilanImport (fonction pure)', () => {
        expect(typeof win.Codex.construireBilanImport).toBe('function');
    });

    it('compose titre et causes pour un mélange quota + erreur technique', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 120,
            nbBlobs: 7,
            nbBlobsAttendus: 12,
            blobsEchecs: [
                { id: 'FT_a', raison: 'quota' },
                { id: 'FT_b', raison: 'quota' },
                { id: 'FT_c', raison: 'erreur' }
            ],
            blobsRefusesMagic: ['FT_d'],
            blobsAbsentsDuZip: ['FT_e']
        });
        expect(bilan.titre).toContain('5 fichiers sur 12');
        expect(bilan.details).toContain('120 clés');
        expect(bilan.details).toContain('2 refusés faute d\'espace');
        expect(bilan.details).toContain('1 en erreur technique');
        expect(bilan.details).toContain('1 au format non reconnu');
        expect(bilan.details).toContain('1 absent du ZIP');
        // Du quota est en cause → le conseil de ré-import doit apparaître.
        expect(bilan.details).toContain('rouvre le même ZIP');
    });

    it('singulier correct et pas de conseil de ré-import si la cause n\'est pas corrigeable ainsi', () => {
        // Un blob refusé aux magic bytes ne sera pas plus accepté au 2e essai :
        // promettre « rouvre le même ZIP » serait un message menteur.
        const bilan = win.Codex.construireBilanImport({
            nbCles: 50,
            nbBlobs: 9,
            nbBlobsAttendus: 10,
            blobsEchecs: [],
            blobsRefusesMagic: ['FT_x'],
            blobsAbsentsDuZip: []
        });
        expect(bilan.titre).toContain('1 fichier sur 10');
        expect(bilan.titre).toContain('n\'a pas été restauré');
        expect(bilan.details).not.toContain('rouvre le même ZIP');
    });

    it('erreur technique seule → conseil de ré-import présent', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 10,
            nbBlobs: 1,
            nbBlobsAttendus: 2,
            blobsEchecs: [{ id: 'FT_y', raison: 'erreur' }],
            blobsRefusesMagic: [],
            blobsAbsentsDuZip: []
        });
        expect(bilan.details).toContain('1 en erreur technique');
        expect(bilan.details).toContain('rouvre le même ZIP');
    });
});
