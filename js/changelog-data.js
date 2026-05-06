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
            titre: 'Consolidation',
            items: [
                'Mode d\u00e9monstration refondu\u00a0: les donn\u00e9es d\u00e9mo sont d\u00e9sormais permanentes et disponibles dans des s\u00e9lecteurs \u00e0 deux sections (\u00ab\u00a0Mes documents\u00a0\u00bb / \u00ab\u00a0D\u00e9mo\u00a0\u00bb). Active ou d\u00e9sactive le mode sans risque pour tes vraies donn\u00e9es.',
                'Duplication CC\u00a0: tout item d\u00e9mo (grille, \u00e9chelle, cartouche, production, pratique, groupe-cours) peut \u00eatre dupliqu\u00e9 pour servir de mod\u00e8le \u00e0 tes propres documents. L\u2019attribution \u00ab\u00a0Inspir\u00e9 de\u00a0\u00bb est conserv\u00e9e dans les m\u00e9tadonn\u00e9es.',
                'Nouvelle observation \u2014 Actions RLO (Rep\u00e9rage, Liaison, Ouverture)\u00a0: tampons cognitifs pos\u00e9s sur les productions, agr\u00e9g\u00e9s dans chaque \u00e9valuation, visualis\u00e9s en courbe d\u2019\u00e9volution par production et exportables en recherche anonymis\u00e9e (gestes cognitifs et en difficult\u00e9 avec ratios).',
                'Profil \u00e9tudiant \u2014 onglets \u00ab\u00a0Crit\u00e8res / Forces et d\u00e9fis / Gestes cognitifs\u00a0\u00bb dans \u00ab\u00a0D\u00e9veloppement des habilet\u00e9s\u00a0\u00bb pour r\u00e9duire le d\u00e9filement vertical ; bloc \u00ab\u00a0Consolidation\u00a0\u00bb rapatri\u00e9 ici (portrait par crit\u00e8re\u00a0: consolid\u00e9 / fragile / non consolid\u00e9).',
                'R\u00e9glages r\u00e9organis\u00e9s\u00a0: l\u2019onglet \u00ab\u00a0Accompagnement\u00a0\u00bb regroupe les 6 outils d\u2019observation (SOLO, Actions RLO, Micro donn\u00e9es ACP, graphiques d\u2019\u00e9volution, D\u00e9veloppement des habilet\u00e9s, unit\u00e9 d\u2019assiduit\u00e9). Chaque case nomme maintenant l\u2019\u00e9cran qu\u2019elle affecte.',
                'Indice E (Engagement) enti\u00e8rement retir\u00e9 du code, de l\u2019affichage et de l\u2019export. La pratique p\u00e9dagogique reste, l\u2019ancien indice dispara\u00eet.',
                'Nouveau\u00a0: Rythme de travail \u2014 statistiques de dur\u00e9e par activit\u00e9, estimation de la charge et planning hebdomadaire.',
                'Travaux\u00a0: tri par titre / type / date d\u2019\u00e9ch\u00e9ance, import 250\u00a0dpi par d\u00e9faut (200\u2013300 configurable), gestion de 68+ fichiers sans crash, previews instantan\u00e9es.',
                'Fiabilit\u00e9\u00a0: erreurs de fran\u00e7ais et crit\u00e8res algorithmiques sauvegard\u00e9s imm\u00e9diatement au changement d\u2019\u00e9l\u00e8ve.',
                'Interventions R\u00e0I\u00a0: formulaire unifi\u00e9, crit\u00e8res cibl\u00e9s depuis le d\u00e9pistage, objectif mesurable, bilan avant/apr\u00e8s.',
                'Num\u00e9rotation des semaines align\u00e9e sur le calendrier officiel de la D\u00c9\u00a0: les permutations (gr\u00e8ve, EUF, f\u00e9ri\u00e9s d\u00e9plac\u00e9s) sont maintenant prises en compte. Nouveau champ \u00ab\u00a0Type d\u2019\u00e9v\u00e9nement\u00a0\u00bb (Institutionnel\u00a0/ Personnel) qui distingue les annulations coll\u00e8ge des absences personnelles\u00a0; les absences personnelles ne d\u00e9calent plus la num\u00e9rotation des semaines. Les num\u00e9ros de semaine s\u2019affichent aussi sur les jours ouvrables hors horaire du groupe.',
                'S\u00e9curit\u00e9 \u2014 nouveau r\u00e9glage \u00ab\u00a0M\u00e9moriser le dossier Travaux et la R\u00e9serve entre les sessions\u00a0\u00bb (R\u00e9glages > Pr\u00e9f\u00e9rences > S\u00e9curit\u00e9, d\u00e9sactiv\u00e9 par d\u00e9faut). Quand d\u00e9sactiv\u00e9, l\u2019app demande \u00e0 chaque d\u00e9marrage l\u2019acc\u00e8s au dossier \u2014 plus s\u00fbr face \u00e0 un script malveillant qui s\u2019ex\u00e9cuterait pendant une session.',
                'Confirmation avant chaque export\u00a0: une nouvelle fen\u00eatre liste les fichiers du Codex / archive / configuration / tampons avant le t\u00e9l\u00e9chargement. Tu peux v\u00e9rifier qu\u2019aucun fichier inattendu ne s\u2019est gliss\u00e9 dans l\u2019envoi avant de confirmer.',
                'V\u00e9rification d\u2019int\u00e9grit\u00e9 \u2014 chaque ressource partag\u00e9e (grille, \u00e9chelle, cartouche, pratique, production, tampon) est scell\u00e9e \u00e0 l\u2019export avec une empreinte SHA-256. \u00c0 l\u2019import, l\u2019app v\u00e9rifie la signature et alerte si une ressource a \u00e9t\u00e9 modifi\u00e9e en transit.'
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
