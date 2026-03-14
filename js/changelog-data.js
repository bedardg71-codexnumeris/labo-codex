/**
 * changelog-data.js — Données structurées du changelog + rendu HTML
 *
 * Convention : 1 entrée par version majeure (Beta 95, 96, 97, 98).
 * Pas de dates. Max 6-8 items orientés utilisateur.
 * Couleurs : vert (features), bleu (améliorations).
 */
(function() {
    'use strict';

    var CHANGELOG = [
        {
            version: 'Beta 98',
            couleur: 'vert',
            titre: 'Annotation avanc\u00e9e et classeur USB',
            items: [
                'R\u00e9troactions personnalisables\u00a0: tampons, codes d\u2019erreur, ic\u00f4nes et couleurs modifiables par l\u2019enseignant.',
                'Outils d\u2019annotation enrichis\u00a0: ligne, vague, duplication, s\u00e9lection et formes.',
                'Corbeille pour les fichiers supprim\u00e9s (restauration possible pendant 30\u00a0jours).',
                'Classeur USB pour transporter tes donn\u00e9es entre appareils.',
                'Barre d\u2019outils compacte et visionneuse redessin\u00e9e.'
            ]
        },
        {
            version: 'Beta 97',
            couleur: 'vert',
            titre: 'Planification, parcours et travaux',
            items: [
                'Nouvel onglet Planification\u00a0: carte mentale, alignement p\u00e9dagogique, clonage, verbes d\u2019Anderson.',
                'Parcours d\u2019apprentissage guid\u00e9 (2\u00a0modes\u00a0: \u00e9tape par \u00e9tape ou exploration).',
                'Module Travaux\u00a0: import, annotation au stylet, \u00e9valuation c\u00f4te \u00e0 c\u00f4te, export PDF.',
                'Wizard de configuration\u00a0: d\u00e9tecte automatiquement ton type de pratique de notation.',
                'Suivi d\u2019\u00e9tudiants color\u00e9s au tableau de bord (jusqu\u2019\u00e0 5\u00a0\u00e9l\u00e8ves).',
                'Aide contextuelle compl\u00e8te (100\u00a0% des sections document\u00e9es).'
            ]
        },
        {
            version: 'Beta 96',
            couleur: 'bleu',
            titre: 'Graphiques et synchronisation',
            items: [
                'Graphiques spaghetti (trajectoires A\u2011C\u2011P) et courbes de distribution.',
                'Bo\u00eete \u00e0 outils\u00a0: tirage au sort et questions flash.',
                'Synchronisation MacBook \u2194 iPad fiable.',
                'Gestion des ressources (nettoyage des \u00e9l\u00e9ments inutilis\u00e9s).'
            ]
        },
        {
            version: 'Beta 95',
            couleur: 'bleu',
            titre: 'Architecture groupe-cours',
            items: [
                'Architecture modulaire\u00a0: cours, enseignant, horaire et groupe-cours s\u00e9par\u00e9s.',
                'Gestion multi-trimestres avec donn\u00e9es isol\u00e9es.',
                'Saisie des pr\u00e9sences en p\u00e9riodes (fractions possibles).',
                'Export PDF des grilles descriptives.'
            ]
        }
    ];

    /**
     * Génère le HTML complet du changelog à partir du tableau CHANGELOG.
     * @returns {string} HTML des entrées changelog
     */
    function genererChangelogHTML() {
        var html = '';
        for (var i = 0; i < CHANGELOG.length; i++) {
            var entry = CHANGELOG[i];
            var titreSuffix = entry.titre ? ' \u2014 ' + entry.titre : '';
            html += '<div class="changelog-entry changelog-entry--' + entry.couleur + '">';
            html += '<strong class="changelog-title">' + entry.version + titreSuffix + '</strong>';
            html += '<ul class="changelog-list">';
            for (var j = 0; j < entry.items.length; j++) {
                html += '<li>' + entry.items[j] + '</li>';
            }
            html += '</ul>';
            html += '</div>';
        }
        return html;
    }

    // Export global
    window.CHANGELOG = CHANGELOG;
    window.genererChangelogHTML = genererChangelogHTML;
})();
