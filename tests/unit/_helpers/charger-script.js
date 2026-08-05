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
 * @param {object|null} fauxWindowExistant - sandbox `window` réutilisé pour
 *   enchaîner plusieurs sous-modules (refactor étape 3 productions.js, 16 mai 2026).
 *   Si fourni, les nouveaux exports y sont ajoutés au lieu de créer un sandbox vide.
 * @returns {object} un objet window-like contenant les exports
 */
export function chargerScript(cheminRelatifProjet, globaux = {}, fauxWindowExistant = null) {
    const chemin = path.join(racineProjet, cheminRelatifProjet);
    const code = readFileSync(chemin, 'utf8');

    const fauxWindow = fauxWindowExistant || {};
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
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false }
        }),
        body: {
            addEventListener: () => {}, appendChild: () => {},
            // modes.js pose un attribut data-mode sur <body> au chargement
            setAttribute: () => {}, getAttribute: () => null,
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false },
            style: {}
        },
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
    // Un `document` fourni dans `globaux` REMPLACE le stub par défaut
    // (sentinelle #344 : capturer le innerHTML injecté par le rendu).
    // Idem pour `localStorage` (sentinelle #374 : la migration de fusion
    // énumère les clés via key(i)/length, absents du stub par défaut).
    const { document: documentOverride, localStorage: localStorageOverride, ...autresGlobaux } = globaux;
    const noms = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autresGlobaux)];
    const valeurs = [fauxWindow, documentOverride || fauxDocument, console, localStorageOverride || fauxStorage(), fauxStorage(), ...Object.values(autresGlobaux)];

    const fn = new Function(...noms, '"use strict";\n' + code);
    fn(...valeurs);

    return fauxWindow;
}
