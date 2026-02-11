/**
 * changelog-data.js — Données structurées du changelog + rendu HTML
 *
 * Ajouter une entrée = ajouter un objet au tableau CHANGELOG.
 * Couleurs : vert (features), bleu (améliorations), orange (corrections),
 *            rose (retours testeurs), violet (corrections ciblées).
 */
(function() {
    'use strict';

    var CHANGELOG = [
        {
            version: 'Beta 97.4',
            date: '11 février',
            couleur: 'bleu',
            titre: 'Corrections et améliorations',
            items: [
                '<strong>Nouvel onglet Dépistage</strong> : Les paramètres de dépistage (configuration des patterns, seuils de détection, seuils d\u2019interprétation) ont leur propre onglet dans Réglages, séparé des Préférences d\u2019affichage.',
                '<strong>Notification toast</strong> : La notification de mise à jour s\u2019affiche maintenant en haut à droite (au lieu d\u2019un bandeau pleine largeur en bas).',
                '<strong>Bouton Confidentiel corrigé</strong> : Le modal s\u2019ouvre correctement depuis la page Accompagnement du profil étudiant.',
                '<strong>Nouveau type d\u2019intervention MIO</strong> : «\u00a0Message écrit (MIO) à un groupe ciblé\u00a0» disponible dans les interventions. N\u2019affecte pas les présences.',
                '<strong>Verrouillage des présences</strong> : Le contrôle de verrouillage est de retour, intégré dans la barre de statistiques (Présents/Absents/Total).',
                '<strong>Double tooltip corrigé</strong> : Le bouton Aide n\u2019affiche plus deux tooltips superposés.',
            ]
        },
        {
            version: 'Beta 97.4',
            date: '10 février',
            couleur: 'orange',
            titre: 'Bibliothèques et indicateurs',
            items: [
                '<strong>Suppression complète</strong> : Le bouton «\u00a0Supprimer\u00a0» dans les bibliothèques (grilles, échelles, productions, cartouches) retire maintenant l\u2019élément des deux stores (local + partagé). Plus de fantômes qui réapparaissent.',
                '<strong>Supprimer depuis «\u00a0Disponibles\u00a0»</strong> : Nouveau bouton «\u00a0Supprimer\u00a0» dans la section 2 des bibliothèques pour faire le ménage directement depuis la liste des éléments disponibles.',
                '<strong>Ajouter à la bibliothèque</strong> : Nouveaux boutons «\u00a0Ajouter mes grilles/échelles à la bibliothèque\u00a0» pour partager ses éléments, comme c\u2019était déjà possible pour les productions.',
                '<strong>Indicateurs 🚧</strong> : Les sous-sections en développement actif affichent un emoji 🚧 pulsant sur leur onglet. Visible dans Construction de la note, Planification et Aide.',
                '<strong>Notification de mise à jour</strong> : Un bandeau vert discret apparaît automatiquement quand une nouvelle version est déployée, sans avoir à recharger la page. Vérification toutes les 5\u00a0minutes.'
            ]
        },
        {
            version: 'Beta 97.4',
            date: '8 février',
            couleur: 'bleu',
            titre: 'Démo et expérience utilisateur',
            items: [
                '<strong>Thème sarcelle en démo</strong> : L\'interface bascule automatiquement vers la palette sarcelle du mode Assisté quand les données de démonstration sont actives. Retour au bleu normal en quittant.',
                '<strong>Patterns d\'apprentissage corrigés</strong> : La répartition des patterns (Stable, Défi, Blocage) s\'affiche maintenant correctement en mode démo.',
                '<strong>Page d\'accueil enrichie</strong> : La carte du groupe est remplacée par une invitation à explorer la démo. Nouveau lien codexnumeris.org en pied de page.',
                '<strong>Nettoyage démo robuste</strong> : Quitter la démo nettoie désormais les deux couches de stockage (localStorage + IndexedDB), éliminant les résidus après rechargement.',
                '<strong>Dropdown corrigé</strong> : La section «\u00a0Cours (tous groupes)\u00a0» est masquée en mode démo. Le contexte affiche «\u00a0Données de démonstration\u00a0» au lieu de «\u00a0Démonstration 2025\u00a0».'
            ]
        },
        {
            version: 'Beta 97.4',
            date: '8 février',
            couleur: 'vert',
            titre: 'Alignement pédagogique',
            items: [
                '<strong>Clonage 🧬</strong> : Dupliquer un élément en clone partagé (titre et description synchronisés, badges agrégés).',
                '<strong>Verbes refondus</strong> : 5 verbes verticaux automatiques + 2 horizontaux au choix (complète, conduit à). Migration automatique.',
                '<strong>Évaluations</strong> : Nouveau type rose/magenta, insérable dans les leçons, champs rétroaction/production au panneau.',
                '<strong>Carte d\'aide</strong> : Flottante, déplaçable, redimensionnable. Bouton «\u00a0?\u00a0» pour l\'afficher/masquer.',
                '<strong>Onglet renommé</strong> : «\u00a0Carte mentale\u00a0» → «\u00a0Alignement pédagogique\u00a0».'
            ]
        },
        {
            version: 'Beta 97.3',
            date: '7 février',
            couleur: 'vert',
            titre: 'Planification',
            items: [
                '<strong>Nouvel onglet Planification</strong> : Carte mentale intégrée pour organiser visuellement compétences, séquences, leçons et activités. Deux zones : Objectifs &amp; Savoirs (gauche) et Organisation &amp; Activités (droite).',
                '<strong>10 types de nœuds</strong> : Compétence, idée maîtresse, connaissance, préalable, stratégie, séquence, leçon, activité, soutien, révision — chacun avec sa couleur distinctive.',
                '<strong>Panneau Séances</strong> : Vue calendrier latérale pour planifier la répartition des séquences et leçons sur les semaines du trimestre. Export texte et TSV.',
                '<strong>Multi-cartes</strong> : Créez plusieurs cartes, renommez-les, importez/exportez en JSON.',
                '<strong>Glisser-déposer</strong> : Créez des nœuds en glissant depuis la palette, reliez-les par clic, sélectionnez par rectangle, multi-sélection avec ⌘+clic.'
            ]
        },
        {
            version: 'Beta 97.3',
            date: '7 février',
            couleur: 'bleu',
            titre: 'Annotation et évaluation',
            items: [
                '<strong>Zoom adaptatif</strong> : Deux nouveaux modes «\u00a0Pleine largeur\u00a0» et «\u00a0Pleine hauteur\u00a0» remplacent les boutons +/− pour un affichage optimal du document.',
                '<strong>Épaisseur relative</strong> : Le trait d\u2019annotation s\u2019adapte automatiquement à la résolution de l\u2019image. Un trait de 3px aura la même épaisseur visuelle sur une image 500px ou 3000px. Le slider affiche la valeur en pixels réels.',
                '<strong>Bouton Évaluer</strong> : Depuis l\u2019annotation d\u2019un travail, accédez directement au formulaire d\u2019évaluation avec l\u2019étudiant et la production pré-remplis.',
                '<strong>Dossier PDF complet</strong> : Nouveau bouton «\u00a0Dossier PDF\u00a0» dans la liste des évaluations — génère un PDF unique contenant le travail annoté + la grille remplie + la rétroaction.',
                '<strong>Sélection et édition</strong> : Nouvel outil Sélection pour déplacer, redimensionner et supprimer les annotations existantes (traits, formes, texte, autocollants).',
                '<strong>Interface harmonisée</strong> : Boutons de la toolbar colorés selon le design system, flèches de pagination, zéro couleur hardcodée dans le module Travaux.',
                '<strong>5 correctifs</strong> : Export PDF des annotations sur fichiers PDF (#112), fontSize exponentielle (#113), sélection fantôme (#114), EXPORT_SCALE (#115), listeners accumulés (#116), Backspace dans formulaires (#117).'
            ]
        },
        {
            version: 'Beta 97.2',
            date: '6 février',
            couleur: 'bleu',
            titre: 'Démo et accueil',
            items: [
                '<strong>Nouveau système de démo</strong> : La démo est désormais une route isolée (et non plus un mode). Entrez et sortez librement via un bouton dédié, vos données réelles sont préservées.',
                '<strong>Pack démo 20\u00a0étudiants</strong> : Données réelles A2025 anonymisées — 20\u00a0étudiants, 200\u00a0évaluations, 627\u00a0présences, 11\u00a0productions, 3\u00a0grilles de critères.',
                '<strong>Page d\u2019accueil permanente</strong> : Nouvel écran d\u2019accueil par défaut avec deux états — premier lancement (créer un cours ou explorer la démo) et retour (4\u00a0cartes par intention). Mode expert dans Réglages pour court-circuiter vers le tableau de bord.',
                '<strong>Guidage contextuel</strong> : En mode démo, chaque section affiche un encart explicatif décrivant ce que vous voyez (16\u00a0encarts couvrant toutes les sous-sections).',
                '<strong>Bandeau démo</strong> : Barre verte fixe en bas de l\u2019écran en mode démo avec bouton «\u00a0Quitter la démo\u00a0».'
            ]
        },
        {
            version: 'Beta 97.1',
            date: '6 février',
            couleur: 'bleu',
            titre: 'Interface',
            items: [
                '<strong>Bulles en-tête</strong> : Nouveau mouvement hélicoïdal — oscillation sinusoïdale autour d\'un axe de dérive horizontal (parallaxe conservée)',
                '<strong>Tableau de bord</strong> : Titres renommés — « État des lieux » (Vue d\'ensemble), « Observer » (Indicateurs ACPE), « Intervenir » (Indicateurs d\'apprentissage), « Développement du groupe » et « Développement individuel »',
                '<strong>Qualité CSS</strong> : 475+ couleurs hex → variables CSS dans 40+ fichiers (#74). 171 styles inline retirés dans index.html (#75). 38 <code>!important</code> retirés sur 75 dans styles.css (#80) — spécificité corrigée à la source.',
                '<strong>Qualité JS</strong> : 3 fonctions <code>formaterDate</code> canoniques centralisées dans main.js (#68). 136 patterns défensifs <code>typeof cle</code> nettoyés dans 24 fichiers (#73). Design System synchronisé (#84).',
                '<strong>Module Travaux — Panneau rétractable</strong> : La sidebar de fichiers se replie automatiquement en mode annotation pour maximiser l\'espace de travail. Un onglet latéral permet de la réouvrir au besoin.',
                '<strong>Module Travaux — Tampons de rétroaction</strong> : 12 autocollants visuels (3 qualité + 9 diagnostic) à poser directement sur le travail annoté. Popup flottante, pose au clic, gomme et annuler/rétablir inclus.',
                '<strong>Module Travaux — Export PDF</strong> : Génère un PDF unique contenant les pages annotées (traits, formes, autocollants aplatis) + une page de synthèse avec les critères, niveaux, rétroaction et note finale.',
                '<strong>Module Travaux — Révision avant export</strong> : Écran intermédiaire affichant un résumé des annotations et un aperçu des cartouches de rétroaction avant la génération du PDF.'
            ]
        },
        {
            version: 'Beta 97',
            date: '6 février',
            couleur: 'vert',
            titre: 'Module Travaux',
            items: [
                '<strong>Nouvel onglet Travaux</strong> : Gestion complète des travaux étudiants directement dans Monitorage (import, annotation, archivage)',
                '<strong>Import de fichiers</strong> : Glissez vos PDF et images dans la zone de dépôt. Détection automatique du DA étudiant dans le nom du fichier. Association manuelle possible via dropdown.',
                '<strong>Visionneuse intégrée</strong> : Ouvrez vos PDF et images directement dans l\'application. Navigation entre les pages, zoom avant/arrière, ajustement automatique à la fenêtre.',
                '<strong>Annotation au stylet</strong> : Annotez directement sur les travaux avec le stylo, le surligneur, la gomme, des formes (cercle, flèche, rectangle) et des symboles (crochet, croix). Support Apple Pencil avec sensibilité à la pression et rejet de la paume.',
                '<strong>Annuler/Rétablir</strong> : Ctrl+Z / Ctrl+Maj+Z pour annuler ou rétablir vos annotations (jusqu\'à 50 niveaux). Sauvegarde automatique.',
                '<strong>Voir le travail depuis Évaluations</strong> : Bouton « Voir le travail » dans la page d\'évaluation pour afficher le document côte à côte avec la grille de critères.',
                '<strong>Travaux dans le Profil étudiant</strong> : Nouvelle section « Travaux soumis » avec grille de miniatures et export ZIP par étudiant.',
                '<strong>Archivage ZIP</strong> : Exportez les travaux par étudiant, par production ou pour le semestre complet. Inclut les versions annotées.',
                '<strong>Stockage sur disque (Mac)</strong> : Option File System Access API pour stocker les fichiers sur votre disque au lieu d\'IndexedDB. Recommandé sur Mac pour les gros volumes.'
            ]
        },
        {
            version: 'Beta 97',
            date: '6 février',
            couleur: 'orange',
            titre: '35 correctifs',
            items: [
                '<strong>Fiabilité des données</strong> : Correction de 5 bugs critiques (clés de stockage incohérentes, collisions d\'ID, calcul d\'assiduité, format de présences)',
                '<strong>Calculs corrigés</strong> : Taux de complétion, tendances, mode « récents-meilleurs », statistiques d\'archive — tous recalculent correctement',
                '<strong>Multi-trimestre</strong> : Namespacing renforcé dans ~20 fichiers — les données restent bien isolées par trimestre',
                '<strong>Stabilité</strong> : Erreurs silencieuses remplacées par des diagnostics, éléments DOM manquants protégés, race conditions corrigées',
                '<strong>Design system</strong> : Couleurs et ombres harmonisées avec la palette « Nuit Élégante »'
            ]
        },
        {
            version: 'Beta 96.2',
            date: '4 février',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Notes de présences dans Confidentiel</strong> : Les notes saisies dans la page Présences sont maintenant visibles et éditables dans le modal Confidentiel du profil étudiant (Accompagnement > 🔒 Confidentiel)',
                '<strong>Nouveau module Gestion des ressources</strong> : Outil dans Réglages > Données > Maintenance pour auditer et nettoyer les ressources accumulées',
                '<strong>5 types de ressources</strong> : Pratiques de notation, Grilles de critères, Cartouches de rétroaction, Échelles de performance, Productions',
                '<strong>Interface simplifiée</strong> : Dropdown unique avec compteurs (ex: "Pratiques de notation (12)") au lieu de 5 accordéons',
                '<strong>Informations détaillées</strong> : Chaque ressource affiche son statut (Sidebar/Masquée) et son usage (cours, évaluations)',
                '<strong>Suppression définitive</strong> : Bouton pour supprimer les ressources non utilisées avec vérification des dépendances'
            ]
        },
        {
            version: 'Beta 96.2',
            date: '1er février',
            couleur: 'rose',
            titre: 'Corrections testeurs',
            items: [
                '<strong>Modal de bienvenue</strong> : Les nouveaux utilisateurs sont accueillis avec un choix : configuration guidée ou exploration libre',
                '<strong>Animation bulles</strong> : Effet 3D et parallaxe dans l\'en-tete (grandes=proches rapides, petites=loin lentes)',
                '<strong>Suppression grilles corrigée</strong> : Le bouton supprimer dans la barre latérale fonctionne à nouveau',
                '<strong>Import productions corrigé</strong> : Les productions namespacées sont maintenant détectées et importées',
                '<strong>Horaires par trimestre</strong> : Les horaires sont maintenant isolés par trimestre (aperçu présences fonctionnel)',
                '<strong>Cours A2025 corrigé</strong> : Les nouveaux cours sont créés dans le bon trimestre',
                '<strong>Section Trimestre responsive</strong> : Affichage correct sur iPad (dates et boutons visibles)',
                '<strong>Export horodaté</strong> : Les sauvegardes incluent maintenant l\'heure (YYYY-MM-DD-HH-MM-SS)',
                '<strong>Supprimer pratiques hors-bibliothèque</strong> : Nouveau bouton pour supprimer les pratiques non utilisées'
            ]
        },
        {
            version: 'Beta 96.2',
            date: '31 janvier PM',
            couleur: 'violet',
            titre: 'Correction registre pratiques',
            items: [
                '<strong>Pratiques configurables corrigées</strong> : Les pratiques créées via l\'assistant (wizard) sont maintenant correctement chargées depuis le registre',
                '<strong>Normalisation des formats</strong> : Fusion automatique des champs racine + config interne pour compatibilité totale',
                '<strong>Chargement échelles par ID</strong> : Les pratiques référençant une échelle par ID la chargent maintenant depuis la bibliothèque'
            ]
        },
        {
            version: 'Beta 96.2',
            date: '31 janvier AM',
            couleur: 'vert',
            titre: 'Synchronisation multi-appareils',
            items: [
                '<strong>Import données personnelles corrigé</strong> : L\'import sur un nouvel appareil (iPad, nouveau PC) fonctionne maintenant. Cochez "C\'est ma propre sauvegarde" et les cases Étudiants/Présences/Notes se cochent automatiquement.',
                '<strong>Préservation des IDs</strong> : Les pratiques, grilles, échelles et productions conservent leurs IDs originaux lors de l\'import (plus de références cassées)',
                '<strong>Import données calendrier</strong> : Les bornes du trimestre, horaires et événements sont maintenant importés correctement',
                '<strong>Synchronisation MacBook / iPad</strong> : Export sur un appareil, import sur l\'autre - toutes les données sont transférées fidèlement'
            ]
        },
        {
            version: 'Beta 96.2',
            date: '30 janvier',
            couleur: 'orange',
            titre: 'Correction critique Export/Import',
            items: [
                '<strong>Export complet depuis IndexedDB</strong> : La "Sauvegarde complète" exporte maintenant TOUTES les données, y compris celles stockées uniquement dans IndexedDB (groupes-cours, horaires, données volumineuses)',
                '<strong>Import groupe-cours et horaires</strong> : L\'import reconnaît maintenant les clés <code>*_groupesCours</code>, <code>*_horaires</code> et <code>enseignants</code>',
                '<strong>Affichage "Structure du trimestre"</strong> : Nouvelle section dans le modal d\'import pour visualiser les groupes-cours et horaires avant importation',
                '<strong>Correction UTF-16 Safari</strong> : Le bouton "Envoyer par courriel" des rapports de bug fonctionne maintenant sur Safari/iPad',
                '<strong>Archivage local des rapports</strong> : Les rapports de bug sont sauvegardés localement (max 50)'
            ]
        },
        {
            version: 'Beta 96.1',
            date: '28 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Boîte à outils - Tirage au sort</strong> : Nouvelle section avec un outil pour tirer des étudiants au hasard (animation roulette, mode avec/sans remise, exclusions manuelles, persistance)',
                '<strong>Questions Flash</strong> : Deuxième outil pour tirer des questions au hasard, avec organisation par catégories, filtre par catégorie, et gestion complète (ajout, modification, suppression, changement de catégorie)',
                '<strong>Icône Réglages</strong> : Le texte "Réglages" remplacé par une icône d\'engrenage dans la navigation principale',
                '<strong>Animation 3D des points (Tableau de bord)</strong> : Les points blancs dans les barres oscillent avec un effet de rotation 3D (désactivable dans Préférences > Expérience visuelle)',
                '<strong>Modal Confidentiel (Profil étudiant)</strong> : Nouveau bouton dans la section Accompagnement pour saisir des informations sensibles (ÉPGC, cours antérieur, services adaptés, défis particuliers, notes personnelles)',
                '<strong>Corrélations significatives uniquement</strong> : Les messages de corrélation A/P et C/P ne s\'affichent que si r >= 0.5 (modérée ou plus)',
                '<strong>Anonymisation des groupes</strong> : En mode Anonymisation, les numéros de groupe sont remplacés par des lettres (00001 = Gr. A)',
                '<strong>Graphique Trajectoire amélioré</strong> : La courbe de l\'élève sélectionné apparaît au premier plan',
                '<strong>Bouton Supprimer dans les bibliothèques</strong> : Suppression définitive des éléments avec confirmation et vérification des dépendances',
                '<strong>Bouton Dupliquer dans les bibliothèques</strong> : Créez rapidement une copie d\'un élément existant',
                '<strong>Isolation des templates archivés</strong> : Supprimer un template en H2026 n\'affecte plus les trimestres archivés'
            ]
        },
        {
            version: 'Beta 96',
            date: '25 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Uniformisation des graphiques</strong> : Tous les graphiques adoptent le même look et comportement cohérent',
                '<strong>Échelle Y dynamique</strong> : Les graphiques s\'adaptent automatiquement aux données (fini l\'échelle fixe 0-100%)',
                '<strong>Zones IDME dynamiques</strong> : Les zones colorées (Insuffisant, Développement, Maîtrisé, Étendu) utilisent votre échelle personnalisée partout',
                '<strong>Étiquettes de zones centrées</strong> : Les noms des zones s\'affichent au centre du graphique avec des couleurs saturées pour une meilleure lisibilité',
                '<strong>Survol interactif</strong> : Survolez une courbe pour la mettre en évidence (les autres s\'atténuent), le nom s\'affiche au bout de la courbe',
                '<strong>Verrouillage au clic</strong> : Cliquez sur une courbe ou son nom pour la verrouiller, cliquez ailleurs pour déverrouiller',
                '<strong>Points uniformisés</strong> : Tous les points des graphiques et barres ACEP ont le même style (blanc avec contour bleu pâle, noir au survol)',
                '<strong>Distribution ACPE</strong> : Nouveau graphique montrant la répartition des indices A, C, P, E avec des courbes de densité (style Gauss)'
            ]
        },
        {
            version: 'Beta 95.7',
            date: '23 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Mode Anonymisé corrigé</strong> : La liste des étudiants s\'affiche maintenant correctement en mode anonymisation (le filtrage par groupe utilisait le groupe anonymisé "AN.00001" au lieu du groupe réel)',
                '<strong>Filtrage présences par groupe-cours</strong> : Les présences sont maintenant correctement isolées par groupe-cours (plus de contamination entre groupes)',
                '<strong>Calcul moyenne A corrigé</strong> : Chaque groupe affiche sa propre moyenne d\'assiduité (pas celle d\'un autre groupe)',
                '<strong>Dropdown trimestre synchronisé</strong> : Le sélecteur de trimestre affiche maintenant le bon trimestre actif',
                '<strong>Nettoyage doublons trimestres</strong> : Les entrées en double sont automatiquement détectées et supprimées',
                '<strong>Mode Demo clarifié</strong> : Le trimestre Démonstration n\'apparaît plus en Mode Normal (visible uniquement en Mode Assisté)'
            ]
        },
        {
            version: 'Beta 95.7',
            date: '22 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Saisie présences améliorée</strong> : Input numérique remplace le dropdown (permet fractions: 1.5, 2.5...), affichage X/Y pér.',
                '<strong>Calcul assiduité corrigé</strong> : Formule en périodes (2/2 = 100%, pas 92%). Étudiants absents affichent 0% (pas tiret)',
                '<strong>Moyenne A du groupe</strong> : Affichée dans l\'entête de la liste des étudiants et sur la barre Assiduité du tableau de bord',
                '<strong>Points individuels</strong> : La barre Assiduité du tableau de bord affiche maintenant les 28 points (distribution visible)',
                '<strong>Calendrier synchronisé</strong> : L\'horaire du trimestre actif est maintenant correctement reconnu par le calendrier',
                '<strong>Affichage nom pratique</strong> : L\'entête affiche le nom de la pratique au lieu de son ID technique'
            ]
        },
        {
            version: 'Beta 95.7',
            date: '21 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Export PDF grilles descriptives</strong> : Génère un PDF de ta grille avec les rétroactions (grille + échelle + cartouche). Options : orientation, taille police, pied de page personnalisable (enseignant, cours, licence CC)',
                '<strong>Autocomplétion programmes</strong> : Tapez le code (200, 300, 420...) pour voir les programmes officiels',
                '<strong>Dropdowns discipline complets</strong> : Liste complète (~120 disciplines) pour les 48 cégeps du Québec',
                '<strong>Option Hybride portfolio</strong> : Nouveau mode "N meilleures + Obligatoires" disponible dans Primo et Mode Expert',
                '<strong>Persistance Primo → Expert</strong> : Les valeurs configurées (artefacts, construction note, échelle) persistent correctement',
                '<strong>Boutons uniformisés</strong> : Tous les modals respectent le Design System v7 (Annuler orange, Confirmer vert)'
            ]
        },
        {
            version: 'Beta 95.6',
            date: '19 janvier',
            couleur: 'bleu',
            titre: 'Améliorations',
            items: [
                '<strong>Boutons 😎 d\'aide</strong> : En Mode Assisté, des boutons apparaissent pour expliquer chaque section (14 thèmes couverts)',
                '<strong>Ordre de configuration clarifié</strong> : Échelles → Pratiques → Grilles → Productions (chaque élément dépend du précédent)',
                '<strong>Design System v7</strong> : Harmonisation des styles (border-radius, box-shadow) selon la charte graphique',
                '<strong>Diverses corrections d\'affichage</strong> :<ul style="margin: 4px 0 0 0; padding-left: 16px;"><li><strong>Tiret "—" au lieu de "0%"</strong> : La liste des étudiants affiche maintenant un tiret quand aucune donnée n\'est saisie</li><li><strong>Barres "En attente"</strong> : Les barres de distribution indiquent "En attente de données" au lieu de 0%</li><li><strong>Dropdown synchronisé</strong> : Le sélecteur d\'étudiant se met à jour lors du changement de groupe-cours</li><li><strong>Calendrier corrigé</strong> : L\'horaire affiché correspond au groupe-cours actif</li></ul>'
            ]
        },
        {
            version: 'Beta 95.5',
            date: '10 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Catégories Sélection/Obligatoires</strong> : Nouveau design avec deux cartes et checkboxes pour classer tes productions (N meilleures vs toujours comptées)',
                '<strong>Métadonnées uniformisées</strong> : Panneau cohérent pour tous les éléments avec titre dynamique',
                '<strong>Traçabilité contributeurs CC</strong> : Les contributeurs sont automatiquement ajoutés lors des modifications',
                '<strong>Wizard Primo amélioré</strong> : Champs Prénom/Nom séparés, pré-remplissage auto, dropdown disciplines'
            ]
        },
        {
            version: 'Beta 95.5',
            date: '18 janvier',
            couleur: 'orange',
            titre: 'Corrections testeurs',
            items: [
                '<strong>Création d\'horaire</strong> : Le bouton fonctionne à nouveau (merci Jordan)',
                '<strong>Export des données</strong> : Le bouton d\'export répond correctement (merci Jordan)',
                '<strong>Import CSV Omnivox</strong> : Détection intelligente des colonnes (SA, Nom, etc.) quelle que soit leur position (merci Jordan)',
                '<strong>Encodage fichiers</strong> : Support automatique Windows-1252 pour les accents (é, è, ê, etc.)',
                '<strong>Rapport de bug amélioré</strong> : Stack trace complet, historique des clics, contexte section, bouton 📸 capture d\'écran'
            ]
        },
        {
            version: 'Beta 95.3',
            date: '9 janvier',
            couleur: 'bleu',
            titre: '',
            items: [
                '<strong>Modal bibliothèque groupe-cours</strong> : Bouton 📚 pour voir, activer ou supprimer tes groupes-cours',
                '<strong>Synthèses intelligentes</strong> : Chaque accordéon affiche un résumé calculé (nb étudiants, heures/sem, etc.)',
                '<strong>Import depuis trimestre précédent</strong> : Réutilise tes échelles, grilles et productions',
                '<strong>Audit module évaluation</strong> : 3 problèmes critiques corrigés'
            ]
        },
        {
            version: 'Beta 95.2',
            date: '6-8 janvier',
            couleur: 'bleu',
            titre: 'Architecture modulaire',
            items: [
                '<strong>Toggles séparés</strong> : Cours, Enseignant·e, Horaire et Groupe-cours sont des entités indépendantes',
                '<strong>Profil auteur</strong> : Source unique pour les métadonnées CC',
                '<strong>Assemblage flexible</strong> : Combine cours + enseignant·e + horaire + pratique',
                '<strong>Migration automatique</strong> : Tes données existantes sont converties'
            ]
        },
        {
            version: 'Beta 95.1',
            date: '1-5 janvier',
            couleur: 'orange',
            titre: 'Corrections testeurs',
            items: [
                '<strong>Périodes au lieu d\'heures</strong> : Format horaire dynamique selon le nombre de périodes (merci Olivier)',
                '<strong>Finalisation Primo</strong> : L\'interface se met à jour après la configuration (merci Olivier)',
                '<strong>Sauvegarde des grilles</strong> : Les nouvelles grilles s\'ajoutent à la bibliothèque (merci Bruno)',
                '<strong>Heures non piles</strong> : Entrée d\'heures comme 8h55 dans Primo (merci Bruno)',
                '<strong>Import/Export amélioré</strong> : Import sélectif, protection des données (merci Bruno, Grégoire)'
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
            var titreSuffix = entry.titre ? ' - ' + entry.titre : '';
            html += '<div class="changelog-entry changelog-entry--' + entry.couleur + '">';
            html += '<strong class="changelog-title">' + entry.version + ' (' + entry.date + ')' + titreSuffix + ' :</strong>';
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
