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

describe('codex.js — bilan d\'import incomplet (#334 session B ; porté par la fenêtre de rechargement depuis #1012)', () => {

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
        // Un mélange de causes : les mots de #334, sous le titre d'avant (#1012).
        expect(bilan.titre).toBe('Recharger la page');
        expect(bilan.message).toContain('Import incomplet : 5 fichiers sur 12');
        expect(bilan.message).toContain('120 clés');
        expect(bilan.message).toContain('2 refusés faute d\'espace');
        expect(bilan.message).toContain('1 en erreur technique');
        expect(bilan.message).toContain('1 au format non reconnu');
        expect(bilan.message).toContain('1 absent du ZIP');
        // Du quota est en cause → le conseil de ré-import doit apparaître.
        expect(bilan.message).toContain('rouvre le même ZIP');
        expect(bilan.message.endsWith('\n\nRecharger la page pour appliquer les données ?')).toBe(true);
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
        expect(bilan.titre).toBe('Recharger la page');
        expect(bilan.message).toContain('Import incomplet : 1 fichier sur 10 n\'a pas été restauré.');
        // Témoin de l'absence : la phrase existe bien dans le cas voisin (essai suivant).
        expect(bilan.message).not.toContain('rouvre le même ZIP');
        expect(bilan.message).not.toContain('faute d\'espace');
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
        expect(bilan.titre).toBe('Recharger la page');
        expect(bilan.message).toContain('1 en erreur technique');
        expect(bilan.message).toContain('rouvre le même ZIP');
    });

    // #1012 — les mots acceptés par Grégoire le 1er oct. 2026 (12 h 40), pour le seul cas
    // où toutes les copies manquantes ont été refusées faute d'espace. Tenus en entier.
    it('faute d\'espace seulement → les mots de Grégoire, au pluriel', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 1014,
            nbBlobs: 330,
            nbBlobsAttendus: 397,
            blobsEchecs: Array.from({ length: 67 }, (_, i) => ({ id: 'FT_' + i, raison: 'quota' })),
            blobsRefusesMagic: [],
            blobsAbsentsDuZip: []
        });
        expect(bilan).toEqual({
            titre: 'Codex ouvert, mais incomplet',
            message: '67 copies sur 397 n\'ont pas pu revenir, faute d\'espace. Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.'
                + '\n\nPour retrouver ces copies : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.'
                + '\n\nRecharger la page pour appliquer les données ?'
        });
    });

    it('faute d\'espace seulement, une seule copie → accord au singulier', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 10,
            nbBlobs: 2,
            nbBlobsAttendus: 3,
            blobsEchecs: [{ id: 'FT_z', raison: 'quota' }],
            blobsRefusesMagic: [],
            blobsAbsentsDuZip: []
        });
        expect(bilan).toEqual({
            titre: 'Codex ouvert, mais incomplet',
            message: '1 copie sur 3 n\'a pas pu revenir, faute d\'espace. Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.'
                + '\n\nPour retrouver cette copie : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.'
                + '\n\nRecharger la page pour appliquer les données ?'
        });
    });

    it('faute d\'espace ET une autre cause → pas les mots de Grégoire (ils ne couvrent pas le mélange)', () => {
        const bilan = win.Codex.construireBilanImport({
            nbCles: 10,
            nbBlobs: 1,
            nbBlobsAttendus: 3,
            blobsEchecs: [{ id: 'FT_q', raison: 'quota' }],
            blobsRefusesMagic: [],
            blobsAbsentsDuZip: ['FT_a']
        });
        expect(bilan.titre).toBe('Recharger la page');
        expect(bilan.message).toContain('Import incomplet : 2 fichiers sur 3');
        expect(bilan.message).not.toContain('n\'ont pas pu revenir');
    });
});
