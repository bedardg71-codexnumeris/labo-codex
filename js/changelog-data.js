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
            version: 'Beta 99',
            couleur: 'vert',
            titre: 'Consolidation, observation et bien-\u00eatre',
            items: [
                'Nouvelle observation \u2014 Actions RLO (Rep\u00e9rage, Liaison, Ouverture)\u00a0: tampons cognitifs pos\u00e9s sur les productions, agr\u00e9g\u00e9s dans chaque \u00e9valuation, visualis\u00e9s en courbe d\u2019\u00e9volution par production et exportables en recherche anonymis\u00e9e (gestes cognitifs et en difficult\u00e9 avec ratios).',
                'Profil \u00e9tudiant \u2014 onglets \u00ab\u00a0Crit\u00e8res / Forces et d\u00e9fis / Gestes cognitifs\u00a0\u00bb dans \u00ab\u00a0D\u00e9veloppement des habilet\u00e9s\u00a0\u00bb pour r\u00e9duire le d\u00e9filement vertical ; bloc \u00ab\u00a0Consolidation\u00a0\u00bb rapatri\u00e9 ici (portrait par crit\u00e8re\u00a0: consolid\u00e9 / fragile / non consolid\u00e9).',
                'R\u00e9glages r\u00e9organis\u00e9s\u00a0: l\u2019onglet \u00ab\u00a0Accompagnement\u00a0\u00bb regroupe les 6 outils d\u2019observation (SOLO, Actions RLO, Micro donn\u00e9es ACP, graphiques d\u2019\u00e9volution, D\u00e9veloppement des habilet\u00e9s, unit\u00e9 d\u2019assiduit\u00e9). Chaque case nomme maintenant l\u2019\u00e9cran qu\u2019elle affecte.',
                'Indice E (Engagement) enti\u00e8rement retir\u00e9 du code, de l\u2019affichage et de l\u2019export. La pratique p\u00e9dagogique reste, l\u2019ancien indice dispara\u00eet.',
                'Nouveau\u00a0: Rythme de travail \u2014 statistiques de dur\u00e9e par activit\u00e9, estimation de la charge et planning hebdomadaire.',
                'Travaux\u00a0: tri par titre / type / date d\u2019\u00e9ch\u00e9ance, import 250\u00a0dpi par d\u00e9faut (200\u2013300 configurable), gestion de 68+ fichiers sans crash, previews instantan\u00e9es.',
                'Fiabilit\u00e9\u00a0: erreurs de fran\u00e7ais et crit\u00e8res algorithmiques sauvegard\u00e9s imm\u00e9diatement au changement d\u2019\u00e9l\u00e8ve.',
                'Navigation r\u00e9organis\u00e9e\u00a0: Aper\u00e7u, Structure, Contexte, Suivi, \u00c9valuations \u2014 plus intuitif. Aide enrichie et repens\u00e9e pour les novices.',
                'Interventions R\u00e0I\u00a0: formulaire unifi\u00e9, crit\u00e8res cibl\u00e9s depuis le d\u00e9pistage, objectif mesurable, bilan avant/apr\u00e8s.'
            ]
        },
        {
            version: 'Beta 98',
            couleur: 'vert',
            titre: 'S\u00e9curit\u00e9 renforc\u00e9e et codex USB',
            items: [
                'S\u00e9curit\u00e9\u00a0: politique CSP active, z\u00e9ro script inline, protection XSS sur les donn\u00e9es utilisateur.',
                'Validation des imports\u00a0: v\u00e9rification taille ZIP, signatures images/PDF, protection path traversal.',
                'R\u00e9troactions personnalisables\u00a0: tampons, codes d\u2019erreur, ic\u00f4nes et couleurs modifiables par l\u2019enseignant.',
                'Biblioth\u00e8que de tampons\u00a0: partage, export et import de collections par cat\u00e9gorie.',
                'Outils d\u2019annotation enrichis\u00a0: ligne, vague, duplication, s\u00e9lection et formes.',
                'Codex USB pour transporter tes donn\u00e9es entre appareils.',
                'Corr\u00e9lations longitudinales et impact des jetons\u00a0: deux graphiques d\u2019analyse (maintenant dans Suivi \u203a Labo).',
                'Console all\u00e9g\u00e9e\u00a0: 2600+ messages de debug retir\u00e9s pour une exp\u00e9rience plus propre.'
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
