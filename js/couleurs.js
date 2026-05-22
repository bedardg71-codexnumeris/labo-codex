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
        idme,
        graphiques,
        correlations
    });
})();

/**
 * STYLE_GRAPHIQUE — Style Chart.js uniformisé pour tous les graphiques du projet (#246).
 *
 * Pris comme référence : `js/correlations-longitudinales.js` (fond transparent, tooltip noir
 * cornerRadius 6, grille subtile, texte adaptatif mode clair/sombre).
 *
 * Usage :
 *   tooltip: { ...STYLE_GRAPHIQUE.tooltip, callbacks: { ... } }
 *   const couleurs = STYLE_GRAPHIQUE.couleurs(); // détecte le mode courant
 *   scales: { x: { ticks: { color: couleurs.texte }, grid: { color: couleurs.grille } } }
 */
const STYLE_GRAPHIQUE = Object.freeze({
    tooltip: Object.freeze({
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        padding: 10
    }),
    /** Retourne les couleurs grille/texte selon le mode courant (clair/sombre). */
    couleurs: function() {
        var estClair = document.body && document.body.classList.contains('mode-clair');
        return {
            texte:       estClair ? '#333' : '#b0c4d0',
            grille:      estClair ? 'rgba(3, 46, 92, 0.08)' : 'rgba(106, 172, 184, 0.08)',
            grilleForte: estClair ? 'rgba(3, 46, 92, 0.20)' : 'rgba(106, 172, 184, 0.20)'
        };
    }
});
window.STYLE_GRAPHIQUE = STYLE_GRAPHIQUE;
