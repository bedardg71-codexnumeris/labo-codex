/**
 * couleurs.js — Source unique de couleurs pour les graphiques Chart.js et le JS
 *
 * Lit les variables CSS du design system (styles.css) au chargement.
 * Les graphiques et modules JS utilisent COULEURS.indices, COULEURS.pratiques, etc.
 * au lieu de définir leurs propres palettes hex en dur.
 *
 * Avantage : les couleurs suivent automatiquement le mode sombre/clair
 * si les variables CSS changent entre modes.
 */

const COULEURS = (() => {
    'use strict';

    function lireCSS(prop) {
        return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
    }

    // Indices A-C-P — alignés sur les variables CSS des pratiques
    // Mapping : A→STD (bleu), C→SOM (orange), P→SPE (vert)
    const indices = {
        A: lireCSS('--std-bleu')   || '#0277bd',
        C: lireCSS('--som-orange') || '#ff6f00',
        P: lireCSS('--spe-vert')   || '#22c55e'
    };

    // Pratiques de notation (SOM/STD/SPE/DEN)
    const pratiques = {
        SOM: lireCSS('--som-orange') || '#ff6f00',
        STD: lireCSS('--std-bleu')   || '#0277bd',
        SPE: lireCSS('--spe-vert')   || '#22c55e',
        DEN: lireCSS('--den-violet') || '#8b5cf6'
    };

    // Niveaux de risque RàI
    const risque = {
        nul:       lireCSS('--risque-nul')       || '#6aacb8',
        minimal:   lireCSS('--risque-minimal')    || '#34c759',
        faible:    lireCSS('--risque-faible')     || '#7ae8a0',
        modere:    lireCSS('--risque-modere')     || '#ffc107',
        eleve:     lireCSS('--risque-eleve')      || '#fd7e14',
        tresEleve: lireCSS('--risque-tres-eleve') || '#e84057',
        critique:  lireCSS('--risque-critique')   || '#a02030'
    };

    // Niveaux IDME
    const idme = {
        E: lireCSS('--idme-etendu')        || '#64B5F6',
        M: lireCSS('--idme-maitrise')      || '#8BC34A',
        D: lireCSS('--idme-developpement') || '#FFEB3B',
        R: lireCSS('--idme-reussite')      || '#FF9800',
        I: lireCSS('--idme-insuffisant')   || '#F44336'
    };

    // Options Chart.js — couleurs de fond, grille, texte
    const graphiques = {
        fond:   'transparent',
        grille: lireCSS('--bordure-subtile') || 'rgba(255,255,255,0.1)',
        texte:  lireCSS('--texte-principal') || '#e0e0e0'
    };

    // Corrélations r(X,P) — dérivées des indices (même palette, cohérence)
    const correlations = {
        AP: indices.A,
        CP: indices.C
    };

    return Object.freeze({
        indices,
        pratiques,
        risque,
        idme,
        graphiques,
        correlations
    });
})();
