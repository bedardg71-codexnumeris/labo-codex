import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Loader custom — `chargerScript()` (helper partagé) ne suffit pas pour
// codex.js : le module s'auto-initialise au chargement et accède à `db.*`
// + `window.addEventListener('beforeunload', ...)`. On évite le crash en
// mettant `document.readyState = 'loading'` (l'init est reportée à un
// DOMContentLoaded qui ne viendra jamais dans la sandbox) et en stubbant
// `db` avec les méthodes minimales.
function chargerCodex() {
    const code = readFileSync(path.join(racineProjet, 'js/codex.js'), 'utf8');

    const fauxWindow = {
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    const fauxDocument = {
        readyState: 'loading',          // ← empêche l'auto-init synchrone
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => null,
        createElement: () => ({
            setAttribute: () => {},
            appendChild: () => {},
            addEventListener: () => {},
            style: {},
            classList: { add: () => {}, remove: () => {}, contains: () => false }
        }),
        body: { addEventListener: () => {}, appendChild: () => {} },
        documentElement: { addEventListener: () => {} }
    };
    const db = {
        ready: true,
        init: async () => {},
        get: async () => null,
        set: async () => {},
        remove: async () => {},
        keys: async () => [],
        getSync: () => null,
        setSync: () => {}
    };
    const fauxStorage = () => ({
        _data: {},
        getItem(k) { return this._data[k] != null ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    });

    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
        '"use strict";\n' + code
    );
    fn(fauxWindow, fauxDocument, console, fauxStorage(), fauxStorage(), db);

    return fauxWindow;
}

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
