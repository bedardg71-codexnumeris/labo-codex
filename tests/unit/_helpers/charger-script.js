import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..', '..');

/**
 * Charge un script .js du projet (qui est une IIFE écrivant sur `window`)
 * dans un sandbox Node minimal et retourne le faux `window` peuplé.
 *
 * Pré-requis : le script ne doit pas avoir d'effet de bord top-level qui
 * réfère à un global non stubbé (db, JSZip, fetch). Les fonctions retournées
 * peuvent en référer dans leur corps : ce sera évalué à l'appel, pas au
 * chargement. Pour les tests qui appellent ces fonctions, il faut soit :
 * - rester sur des fonctions pures (cas Défense I tests B + C),
 * - soit injecter les dépendances via le paramètre `globaux`.
 *
 * @param {string} cheminRelatifProjet - ex. 'js/import-export.js'
 * @param {object} globaux - globaux additionnels (ex. { JSZip })
 * @returns {object} un objet window-like contenant les exports
 */
export function chargerScript(cheminRelatifProjet, globaux = {}) {
    const chemin = path.join(racineProjet, cheminRelatifProjet);
    const code = readFileSync(chemin, 'utf8');

    const fauxWindow = {};
    const fauxDocument = {
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

    // Stubs de stockage pour les scripts qui restaurent une file d'attente
    // au top-level (ex. travaux-import.js sessionStorage). Implémentation
    // « map en mémoire » suffisante pour que les opérations passent sans
    // erreur — les tests qui veulent réellement tester du stockage doivent
    // injecter une implémentation via `globaux`.
    const fauxStorage = () => ({
        _data: {},
        getItem(k) { return this._data[k] != null ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    });

    // `Function` n'a accès qu'à ses paramètres + globaux Node : pas de leak
    // depuis le scope du test. Les `var window`/`let window` à l'intérieur
    // du script projet (s'il y en avait) écraseraient le paramètre — il
    // n'y en a pas dans nos cibles, c'est sûr.
    const noms = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(globaux)];
    const valeurs = [fauxWindow, fauxDocument, console, fauxStorage(), fauxStorage(), ...Object.values(globaux)];

    const fn = new Function(...noms, '"use strict";\n' + code);
    fn(...valeurs);

    return fauxWindow;
}
