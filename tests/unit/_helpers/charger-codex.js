import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monterFichierSortant } from './monter-fichier-sortant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..', '..');

// Loader custom — `chargerScript()` (helper partagé) ne suffit pas pour
// codex.js : le module s'auto-initialise au chargement et accède à `db.*`
// + `window.addEventListener('beforeunload', ...)`. On évite le crash en
// mettant `document.readyState = 'loading'` (l'init est reportée à un
// DOMContentLoaded qui ne viendra jamais dans la sandbox) et en stubbant
// `db` avec les méthodes minimales.
// Extrait de codex.test.js le 11 juin 2026 (#334 session A) pour être
// partagé avec sentinelle-prevol-stockage-2026-06.test.js.
// #614 : `_fusionnerTravaux` et le chemin « ouvrir » consomment deux globaux
// que la sandbox ne fournissait pas — `travauxStockage` (bare) et
// `window.travauxImport`. Ils sont injectables par `globaux`, et valent
// `undefined` quand on ne les passe pas : `typeof travauxStockage` répond
// alors toujours 'undefined', donc les appels existants ne changent pas.
export function chargerCodex(dbOverride = null, globaux = {}) {
    const code = readFileSync(path.join(racineProjet, 'js/codex.js'), 'utf8');

    const fauxWindow = {
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    if (globaux.travauxImport) fauxWindow.travauxImport = globaux.travauxImport;
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
    const db = dbOverride || {
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

    // Lot A1 (30 sept. 2026) : l'assemblage et le téléchargement du fichier vivent dans
    // js/fichier-sortant.js, que `genererCodex` appelle par `window.FichierSortant`.
    monterFichierSortant(fauxWindow, { document: fauxDocument });

    const fn = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
        'travauxStockage',
        '"use strict";\n' + code
    );
    fn(fauxWindow, fauxDocument, console, fauxStorage(), fauxStorage(), db,
       globaux.travauxStockage);

    return fauxWindow;
}
