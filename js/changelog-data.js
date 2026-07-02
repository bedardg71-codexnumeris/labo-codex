/**
 * changelog-data.js — Données structurées du changelog + rendu HTML
 *
 * Convention : 1 entrée par version majeure. Depuis 1.0.0 (3 juin 2026),
 * versionnage sémantique (SemVer MAJEUR.MINEUR.CORRECTIF) ; avant, schéma
 * « Beta XX » (95, 96, 97, 98, 99).
 * Pas de dates. Max 6-8 items orientés utilisateur.
 * Couleurs : vert (features), bleu (améliorations).
 */
(function() {
    'use strict';

    var CHANGELOG = [
        {
            version: '1.27',
            couleur: 'vert',
            titre: 'Suppression de trimestre et corrections d’import',
            items: [
                'Tu peux maintenant supprimer définitivement un trimestre inutile (tests, essais) depuis la gestion des trimestres : confirmation forte en retapant son nom, export de sauvegarde automatique avant l’effacement, et le trimestre actif reste toujours protégé.',
                'Page Calendrier scolaire : les trois indicateurs (semaines scolaires, jours de cours, congés avec reprise) rejoignent la carte « Légende », remontée en tête de page — une seule carte au lieu de quatre.',
                'Import de travaux : le sélecteur global « Production » n’écrase plus une correction faite sur un fichier précis via « Modifier », et l’interface explique la différence entre les deux.',
                'Correction : évaluer une production sans fichier importé n’affiche plus le document d’une autre production.',
                'Correction : les captures de progression automatiques ne créent plus de captures pour les jours où seul un autre groupe a cours, et recapturer une même séance ne crée plus de doublon.'
            ]
        },
        {
            version: '1.26',
            couleur: 'bleu',
            titre: 'Retour du comparateur de pratiques',
            items: [
                'Le comparateur de pratiques est de nouveau accessible en tout temps, dans le Labo sous « Exploration des pratiques » : compare 2 ou 3 pratiques (ou maquettes) côte à côte sur des profils-types tirés de ton échelle, sans passer par le mode démonstration.',
                'Quand une pratique n’est pas encore complète, sa colonne affiche « — non constructible » au lieu d’un 0 trompeur ; les pratiques abouties construisent la note normalement.',
                'Dériver une maquette te dépose directement sur l’arbre d’exploration (plus d’ouverture du formulaire de configuration) ; copier une maquette conserve fidèlement sa configuration.'
            ]
        },
        {
            version: '1.25',
            couleur: 'bleu',
            titre: 'Données plus fiables et modèles isolés par trimestre',
            items: [
                'Fiabilité renforcée : tes saisies, notes et corrections sont maintenant enregistrées de façon durable, même après un rechargement complet de la page — fini les retours en arrière inattendus après un rafraîchissement.',
                'Chaque trimestre conserve ses propres grilles et échelles d’évaluation : les modifier dans un trimestre n’altère plus celles des autres, et changer de trimestre n’affecte pas tes modèles.',
                'Correction : quand une même évaluation existe en double avec une note identique, elle n’est plus comptée deux fois dans le calcul de la note finale.'
            ]
        },
        {
            version: '1.21',
            couleur: 'vert',
            titre: 'Import de pratiques de notation d’un autre trimestre',
            items: [
                'Tu peux maintenant importer une pratique de notation depuis un autre trimestre : elle est copiée dans le trimestre courant et l’originale reste intacte. Un avertissement te signale si son échelle ou ses grilles ne sont pas reprises automatiquement.',
                'Correction : au désarchivage d’un trimestre, les copies de modèles (grilles, échelles, pratiques) ne sont plus dupliquées.'
            ]
        },
        {
            version: '1.20',
            couleur: 'vert',
            titre: 'Note différée, export des résultats et bibliothèques complètes',
            items: [
                'Nouvelle option « Masquer les notes par travail » (Réglages › Préférences) : la note chiffrée de chaque travail est remplacée par un repère « note différée » dans la liste, le profil et le portfolio, pour que ta rétroaction passe d’abord. Les niveaux et la note finale de session restent visibles ; aucun calcul n’est modifié.',
                'Export CSV des résultats finaux du groupe (Suivi › Suivi du groupe) : une ligne par étudiant·e avec la note finale et la pratique en vigueur, pour tes archives.',
                'Tes gabarits, modèles par défaut et exemples par discipline (échelles, grilles, pratiques) réapparaissent dans les bibliothèques — ils étaient masqués à tort.',
                'Au comparateur, une note qui ne peut pas être construite affiche « — non constructible » au lieu d’un 0 trompeur.',
                'Correction : à l’import des travaux, la production choisie (ou détectée d’après le nom du fichier) n’est plus perdue après un rechargement.',
                'Des info-bulles d’aide ont été ajoutées aux outils du Labo (tirage au sort, questions flash) et à la saisie des présences.',
                'Attribution Creative Commons : sans enseignant·e identifié·e, le matériel n’est plus signé d’un nom ni de coordonnées par défaut (mention « Inconnu »).'
            ]
        },
        {
            version: '1.19',
            couleur: 'vert',
            titre: 'Comparateur de pratiques refondu en « banc de décision »',
            items: [
                'Le comparateur génère des profils-types fictifs à partir de TON échelle de performance (autant de profils que de niveaux, plus un parcours irrégulier) — plus besoin du mode démonstration pour l’utiliser.',
                'Compare 2 ou 3 pratiques (ou maquettes) côte à côte sur les mêmes parcours : seules les règles de chaque pratique changent.',
                'Le tableau montre d’abord COMMENT chaque pratique construit la note (pondération, reprises, nombre de productions comptées, méthode de sélection…), puis le résultat sur chaque profil.',
                'Un lien par colonne ouvre le formulaire de la pratique pour l’ajuster ; tu peux aussi comparer sur les données réelles de ton groupe actif.',
                'En dénotation, la colonne rappelle que la note finale est un jugement — pas un calcul — et la pratique peut désormais s’appuyer sur une grille et une échelle pour la rétroaction.',
                'Le menu « Exploration des pratiques » parle maintenant de « maquettes » : crée une maquette, dérive-la une fois, puis adopte-la quand elle te convient (correction au passage de l’erreur « Pratique introuvable » au moment de jeter une maquette).'
            ]
        },
        {
            version: '1.18',
            couleur: 'bleu',
            titre: 'Des fenêtres claires à la place des popups du navigateur',
            items: [
                'Les confirmations, les saisies (nom de codex, de configuration…) et les messages d’information des bibliothèques (productions, planification, pratiques) et du menu Codex s’affichent maintenant dans des fenêtres intégrées à Labo Codex — au style de l’app, en mode clair comme sombre — au lieu des popups gris du navigateur.',
                'Les suppressions définitives sont signalées par un bouton rouge distinct ; Échap annule, Entrée confirme.',
                'Correction : « Dupliquer » et « Dériver une variante » d’une pratique sont de nouveau opérationnels (ils restaient sans effet sur les pratiques créées par l’assistant).',
                'Correction : en plein écran de la carte mentale d’alignement, l’en-tête de l’app ne chevauche plus la carte.'
            ]
        },
        {
            version: '1.14',
            couleur: 'bleu',
            titre: 'Ouverture de codex plus sûre (surtout iPad)',
            items: [
                'Avant d’ouvrir un codex, Labo Codex vérifie qu’il reste assez d’espace : si l’appareil est presque plein, l’ouverture est refusée avec un message clair (combien il faut libérer, où, comment) plutôt que d’échouer à mi-chemin.',
                'En cas d’import incomplet (espace qui se remplit en cours de route, fichier abîmé), tu obtiens un bilan honnête « Import terminé — incomplet » qui dit ce qui manque et quoi faire, au lieu d’un « Codex chargé ! » trompeur.',
                'Rappel utile après l’ouverture : le fichier ZIP d’origine reste dans Fichiers — tu peux le supprimer pour récupérer de l’espace.'
            ]
        },
        {
            version: '1.11',
            couleur: 'vert',
            titre: 'Importe les ressources partagées par tes collègues',
            items: [
                'Tu reçois un fichier .lcz ? Importe-le par le bouton « Importer un partage (.lcz) » de tes bibliothèques, ou par Réglages › Données › « Partage entre collègues » (glisser-déposer accepté).',
                'Avant d’accepter, Labo Codex vérifie tout : structure du fichier, signature de la personne qui l’a créé, continuité de sa clé — puis te présente une prévisualisation (contenu, auteur·e, licence).',
                'Au premier import d’une personne, sa clé de signature est mémorisée. Si un fichier ultérieur se présente sous son nom avec une autre clé, une alerte bloquante te demande de confirmer par un autre canal avant de continuer.',
                'Les items importés restent à part, en lecture seule, dans la section « Partagés par des collègues » de chaque bibliothèque — rien n’est mélangé à tes documents.',
                '« Dupliquer vers mes documents » crée ta copie modifiable : une grille vient avec ses cartouches, une production avec sa grille. L’attribution d’origine est conservée.',
                '« Retirer » (Réglages › Données) supprime un package importé sans toucher tes propres documents.',
                'Pour éviter la confusion, les anciens boutons d’export/import par fichier sont renommés « … (JSON) ».',
                'Correction (iPad surtout) : après « Codex chargé », le rechargement pouvait repartir « sans codex actif » — l’app attend maintenant la fin des écritures avant de proposer le rechargement.',
                'Correction : défaire un jeton de reprise est maintenant un geste clair (décocher = supprimer la reprise et restaurer l’originale, avec confirmation) ; supprimer une évaluation de reprise restaure l’originale même si le lien était abîmé.',
                'Correction : le menu Codex pouvait afficher « Aucun codex actif » au démarrage alors que tes données étaient bien chargées — l’indicateur attend maintenant que le stockage soit prêt.'
            ]
        },
        {
            version: '1.10',
            couleur: 'vert',
            titre: 'Partage tes ressources avec des collègues (.lcz)',
            items: [
                'Nouveau dans le menu ⋮ de tes bibliothèques (grilles, échelles, cartouches, productions, pratiques) : « Exporter pour partager » génère un fichier .lcz (Labo Codex Zip) à transmettre par courriel ou USB.',
                'Le fichier embarque ce qu’il faut pour fonctionner chez l’autre personne : une grille part avec ses cartouches, une production avec sa grille.',
                'Chaque fichier est signé avec ta clé personnelle (créée automatiquement, elle ne quitte jamais ta machine) : la personne qui l’importera pourra vérifier qu’il vient bien de toi et qu’il n’a pas été modifié en chemin.',
                'Le contenu est publié sous licence CC BY-NC-SA 4.0, avec ton attribution — une fenêtre de confirmation te récapitule tout avant l’export.',
                'Le fichier .lcz ne s’ouvre pas au double-clic, c’est normal : il est destiné à être importé dans Labo Codex.'
            ]
        },
        {
            version: '1.6',
            couleur: 'vert',
            titre: 'Des dossiers dans toutes tes bibliothèques',
            items: [
                'Les « Mes dossiers » arrivent aussi dans les bibliothèques de grilles, d’échelles et de productions : crée tes propres dossiers pour ranger ce que tu veux, comme pour les pratiques.',
                'Chaque dossier regroupe ses éléments dans un menu compact ; choisis-en un et ajoute-le à ta barre latérale. Ce qui n’est pas rangé reste sous « Non classées ».',
                'Classe, déplace d’un dossier à l’autre ou sors un élément en un geste — il est toujours rangé à un seul endroit.',
                'Les anciens filtres par discipline (et par pratique pour les échelles) laissent la place à tes dossiers, plus souples.',
                'Les cartouches restent organisées par grille : c’est leur classement naturel, on n’y touche pas.',
                'Comme pour les pratiques, le classement n’organise que l’affichage — il ne modifie jamais tes contenus.',
                'Correction : dans un cours à deux groupes, le taux d’assiduité comptait à tort les séances de l’autre groupe — il reflète maintenant uniquement les séances du groupe de chaque étudiant·e.'
            ]
        },
        {
            version: '1.5',
            couleur: 'vert',
            titre: 'Ranger tes pratiques dans des dossiers',
            items: [
                'Crée tes propres dossiers (« Mes dossiers ») pour classer tes pratiques de notation dans la bibliothèque — tes essais, tes hypothèses, les pratiques reçues de collègues — et t’y retrouver.',
                'Chaque dossier regroupe ses pratiques dans un menu compact : choisis-en une et ajoute-la à ta barre latérale. Ce qui n’est pas rangé reste sous « Non classées ».',
                'Classe, déplace d’un dossier à l’autre ou sors une pratique en un geste. Une pratique est rangée à un seul endroit.',
                'La zone « Mes dossiers » se replie pour gagner de l’espace.',
                'Le classement n’organise que l’affichage : il ne modifie jamais tes pratiques.'
            ]
        },
        {
            version: '1.4',
            couleur: 'vert',
            titre: 'Soutenir le projet + correctifs',
            items: [
'Nouveau bouton « Soutenir Labo Codex » dans l’en-tête (le cœur, à côté du bouton bug) : une fenêtre réunit les façons de contribuer — communauté de pratique, blogue, abonnement de soutien, offrir un abonnement, don. Tu peux aussi nous écrire à labo@codexnumeris.org (commentaire ou demande de présentation).',
                'Le rappel de sauvegarde n’apparaît plus que lorsque tu as de vraies données à protéger (évaluations enregistrées ou travaux importés) — jamais sur une page vide ni en mode démonstration.',
                'Le bandeau de mise à jour ne réapparaît plus en boucle après un rechargement : il ne s’affiche désormais que lors d’une vraie mise à jour déployée pendant que tu travailles.',
                'Assistant de pratique : l’indicateur d’étapes ne s’emballe plus dans le parcours « Je ne suis pas certain·e ».',
                'Correction : certaines icônes du menu mobile (Visite guidée, Assistance, Aide) ne s’affichaient pas sur iPhone.'
            ]
        },
        {
            version: '1.3',
            couleur: 'vert',
            titre: 'Dénotation : une famille de pratique complète',
            items: [
                'Nouvelle famille « Dénotation » : la note finale est un jugement que tu poses, gardé par la confirmation que chaque cible d’apprentissage est atteinte — sortir de la logique du cumul tout en restant certificatif.',
                'Création dans l’assistant (voie rapide → Dénotation) : tu définis tes cibles d’apprentissage et une suggestion statistique d’ancrage (mode, médiane ou moyenne).',
                'Saisie dans le profil étudiant (section « Jugement ») : coche les cibles atteintes, lis la suggestion comme repère, saisis la note et une justification ; une garde t’indique quand la note ne peut pas encore certifier la réussite.',
                'Assistant de pratique : « Je ne suis pas certain·e » ne repose plus la même question — deux questions sur ce que tu fais concrètement (comment tu corriges, ce qu’il advient d’une reprise) suffisent à déduire ta famille.'
            ]
        },
        {
            version: '1.2',
            couleur: 'vert',
            titre: 'Comparateur de pratiques et assistant repensé',
            items: [
                'Comparateur de pratiques : une nouvelle section du Labo met plusieurs pratiques de notation en regard sur des profils-types — pour voir la maîtrise atteinte derrière chaque note, sans en faire un palmarès. Export CSV.',
                'Assistant de pratique repensé : partir d’un modèle existant (copié fidèlement) ou décrire sa pratique ; voie rapide pour les familles connues (sommative, standards, spécifications).',
                'Reprises configurables et garde-fous pédagogiques dans l’assistant : limiter les reprises, alerte au-delà de 15 objectifs.',
                'Récapitulatif enrichi : un exemple chiffré d’ordre de grandeur, et le rappel que ta pratique active n’est pas modifiée.',
                'La famille Dénotation est reconnue à l’édition (création à venir).',
                'Corrections : le titre des fenêtres d’aide est annoncé aux lecteurs d’écran ; icônes de suppression plus lisibles.'
            ]
        },
        {
            version: '1.1',
            couleur: 'vert',
            titre: 'Guides pédagogiques intégrés',
            items: [
                'Trois guides pédagogiques consultables directement dans l’app : taxonomie SOLO (5 pages), Micro-données ACP (3 pages) et modèle RàI (4 pages).',
                'Accessibles depuis Labo → Outils d’observation (bouton « Guide » de chaque carte), depuis la palette d’annotation (catégorie Compréhension, bouton « ? ») et depuis le module Interventions.',
                'Signalés aussi là où le concept apparaît : bannière d’accueil, étape « Labo » de la visite guidée, popups d’aide et fiches du glossaire.',
                'Navigation au clavier (flèches gauche/droite, Échap pour fermer) et points de page cliquables.',
                'La catégorie « Compréhension » (tampons SOLO) de la palette d’annotation suit désormais la préférence « Taxonomie SOLO » des Outils d’observation, comme la catégorie « Action » suit l’observation des actions.',
                'Références académiques citées : Biggs et Collis (1982) pour SOLO, Desrochers (2021) pour la RàI.'
            ]
        },
        {
            version: '1.0',
            couleur: 'vert',
            titre: 'Lancement public',
            items: [
                'Planification\u00a0: carte mentale d\u2019objectifs, alignement p\u00e9dagogique et organisateur de le\u00e7on.',
                '\u00c9valuation\u00a0: grilles de crit\u00e8res, \u00e9chelles de performance et grilles descriptives, calcul automatique.',
                'Annotation des copies au stylet, avec r\u00e9troactions visuelles et cartouches de commentaires.',
                'Suivi du groupe\u00a0: pr\u00e9sences et remises semaine apr\u00e8s semaine, signaux pr\u00e9coces avant la note.',
                'D\u00e9veloppement des habilet\u00e9s\u00a0: trajectoires A-C-P, d\u00e9pistage SOLO et interventions R\u00e0I.',
                'Pratique de notation \u00e0 ta main\u00a0: sommative, par standards ou par sp\u00e9cifications, configur\u00e9e pas \u00e0 pas par un assistant.',
                'Partage entre coll\u00e8gues sous licence Creative Commons \u2014 100\u00a0% hors ligne, donn\u00e9es locales, sans compte.',
                'Version b\u00eata publique, en \u00e9volution\u00a0: un pli\u00a0? Le bouton \u00ab\u00a0Signaler un bug\u00a0\u00bb va droit au d\u00e9veloppeur.'
            ]
        },
        {
            version: 'Beta 99',
            couleur: 'vert',
            titre: 'Consolidation',
            items: [
                'Ent\u00eate repens\u00e9e\u00a0: identit\u00e9 de l\u2019app, contexte de travail (s\u00e9lecteur de groupe-cours) et navigation en zones distinctes. Boutons utilitaires regroup\u00e9s en deux clusters (Bug\u00a0/\u00a0Anonymisation\u00a0/\u00a0Th\u00e8me, puis Aide\u00a0/\u00a0R\u00e9glages) s\u00e9par\u00e9s par une ligne verticale. Navigation primaire (7\u00a0boutons) coll\u00e9e en haut au scroll.',
                'Adaptation iPad et iPhone\u00a0: en dessous de 1024\u00a0px, les boutons de navigation deviennent des menus d\u00e9roulants natifs et les 5\u00a0boutons utilitaires sont regroup\u00e9s dans un menu \u00ab\u00a0\u22ef\u00a0\u00bb. Correction des chevauchements visuels sur iPhone.',
                'Mode d\u00e9monstration refondu\u00a0: les donn\u00e9es d\u00e9mo sont d\u00e9sormais permanentes et disponibles dans des s\u00e9lecteurs \u00e0 deux sections (\u00ab\u00a0Mes documents\u00a0\u00bb / \u00ab\u00a0D\u00e9mo\u00a0\u00bb). Active ou d\u00e9sactive le mode sans risque pour tes vraies donn\u00e9es.',
                'Duplication CC\u00a0: tout item d\u00e9mo (grille, \u00e9chelle, cartouche, production, pratique, groupe-cours) peut \u00eatre dupliqu\u00e9 pour servir de mod\u00e8le \u00e0 tes propres documents. L\u2019attribution \u00ab\u00a0Inspir\u00e9 de\u00a0\u00bb est conserv\u00e9e dans les m\u00e9tadonn\u00e9es.',
                'Nouvelle observation \u2014 Actions RLO (Rep\u00e9rage, Liaison, Ouverture)\u00a0: tampons cognitifs pos\u00e9s sur les productions, agr\u00e9g\u00e9s dans chaque \u00e9valuation, visualis\u00e9s en courbe d\u2019\u00e9volution par production et exportables en recherche anonymis\u00e9e (gestes cognitifs et en difficult\u00e9 avec ratios).',
                'Profil \u00e9tudiant \u2014 onglets \u00ab\u00a0Crit\u00e8res / Forces et d\u00e9fis / Gestes cognitifs\u00a0\u00bb dans \u00ab\u00a0D\u00e9veloppement des habilet\u00e9s\u00a0\u00bb pour r\u00e9duire le d\u00e9filement vertical ; bloc \u00ab\u00a0Consolidation\u00a0\u00bb rapatri\u00e9 ici (portrait par crit\u00e8re\u00a0: consolid\u00e9 / fragile / non consolid\u00e9).',
                'R\u00e9glages r\u00e9organis\u00e9s\u00a0: l\u2019onglet \u00ab\u00a0Outils d\u2019observation\u00a0\u00bb regroupe les 6 outils d\u2019observation (SOLO, Actions RLO, Micro donn\u00e9es ACP, graphiques d\u2019\u00e9volution, D\u00e9veloppement des habilet\u00e9s, unit\u00e9 d\u2019assiduit\u00e9). Chaque case nomme maintenant l\u2019\u00e9cran qu\u2019elle affecte.',
                'Indice E (Engagement) enti\u00e8rement retir\u00e9 du code, de l\u2019affichage et de l\u2019export. La pratique p\u00e9dagogique reste, l\u2019ancien indice dispara\u00eet.',
                'Nouveau\u00a0: Rythme de travail \u2014 statistiques de dur\u00e9e par activit\u00e9, estimation de la charge et planning hebdomadaire.',
                'Travaux\u00a0: tri par titre / type / date d\u2019\u00e9ch\u00e9ance, import 250\u00a0dpi par d\u00e9faut (200\u2013300 configurable), gestion de 68+ fichiers sans crash, previews instantan\u00e9es.',
                'Fiabilit\u00e9\u00a0: erreurs de fran\u00e7ais et crit\u00e8res algorithmiques sauvegard\u00e9s imm\u00e9diatement au changement d\u2019\u00e9l\u00e8ve.',
                'Interventions R\u00e0I\u00a0: formulaire unifi\u00e9, crit\u00e8res cibl\u00e9s depuis le d\u00e9pistage, objectif mesurable, bilan avant/apr\u00e8s.',
                'Num\u00e9rotation des semaines align\u00e9e sur le calendrier officiel de la D\u00c9\u00a0: les permutations (gr\u00e8ve, EUF, f\u00e9ri\u00e9s d\u00e9plac\u00e9s) sont maintenant prises en compte. Nouveau champ \u00ab\u00a0Type d\u2019\u00e9v\u00e9nement\u00a0\u00bb (Institutionnel\u00a0/ Personnel) qui distingue les annulations coll\u00e8ge des absences personnelles\u00a0; les absences personnelles ne d\u00e9calent plus la num\u00e9rotation des semaines. Les num\u00e9ros de semaine s\u2019affichent aussi sur les jours ouvrables hors horaire du groupe.',
                'S\u00e9curit\u00e9 \u2014 nouveau r\u00e9glage \u00ab\u00a0M\u00e9moriser le dossier Travaux et les Archives entre les sessions\u00a0\u00bb (R\u00e9glages > Pr\u00e9f\u00e9rences > S\u00e9curit\u00e9, d\u00e9sactiv\u00e9 par d\u00e9faut). Quand d\u00e9sactiv\u00e9, l\u2019app demande \u00e0 chaque d\u00e9marrage l\u2019acc\u00e8s au dossier \u2014 plus s\u00fbr face \u00e0 un script malveillant qui s\u2019ex\u00e9cuterait pendant une session.',
                'Confirmation avant chaque export\u00a0: une nouvelle fen\u00eatre liste les fichiers du Codex / archive / configuration / tampons avant le t\u00e9l\u00e9chargement. Tu peux v\u00e9rifier qu\u2019aucun fichier inattendu ne s\u2019est gliss\u00e9 dans l\u2019envoi avant de confirmer.',
                'V\u00e9rification d\u2019int\u00e9grit\u00e9 \u2014 chaque ressource partag\u00e9e (grille, \u00e9chelle, cartouche, pratique, production, tampon) est scell\u00e9e \u00e0 l\u2019export avec une empreinte SHA-256. \u00c0 l\u2019import, l\u2019app v\u00e9rifie la signature et alerte si une ressource a \u00e9t\u00e9 modifi\u00e9e en transit.',
                'Page d\u2019accueil \u2014 invitation \u00e0 rejoindre la Communaut\u00e9 de pratique Labo Codex h\u00e9berg\u00e9e par l\u2019AQPC. L\u2019application reste publiquement accessible, sans date de fermeture.'
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
                'Corr\u00e9lations longitudinales et impact des jetons\u00a0: deux graphiques d\u2019analyse (maintenant dans Labo \u203a \u00c9tudes).',
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
                'Assistant de configuration\u00a0: d\u00e9tecte automatiquement ton type de pratique de notation.',
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
