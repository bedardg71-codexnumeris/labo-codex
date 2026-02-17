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
            version: 'Beta 97.8',
            date: '17 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Refonte de l\u2019interface de la carte mentale',
            items: [
                '<strong>Toolbar unifi\u00e9e</strong> : Barre d\u2019outils unique avec s\u00e9lecteur de carte, titre centr\u00e9 auto-dimensionn\u00e9 et contr\u00f4les de zoom.',
                '<strong>Plein \u00e9cran</strong> : La carte mentale occupe d\u00e9sormais toute la surface disponible (padding et bordures retir\u00e9s).',
                '<strong>Palette Raccourcis \uD83D\uDECE\uFE0F</strong> : Nouveau panneau flottant listant les raccourcis clavier, accessible depuis la palette \u00c9l\u00e9ments.',
                '<strong>Panneau Inspecteur \uD83D\uDD0E</strong> : Le panneau de propri\u00e9t\u00e9s est renomm\u00e9 \u00ab\u00a0Inspecteur\u00a0\u00bb, accessible via le bouton \uD83D\uDD0E ou un double-clic sur un n\u0153ud.',
                '<strong>Guide repliant</strong> : Boutons \u2212/+ pour replier et d\u00e9plier le guide sans le fermer. Police uniform\u00e9e \u00e0 10.5px.',
                '<strong>Titres uniformis\u00e9s</strong> : Tous les panneaux (INSPECTEUR, GUIDE, RACCOURCIS, \u00c9L\u00c9MENTS) partagent le m\u00eame style de titre en majuscules.',
                '<strong>Carte d\u00e9mo</strong> : Exemple d\u2019alignement p\u00e9dagogique complet \u00ab\u00a0\u00c9criture et litt\u00e9rature\u00a0\u00bb int\u00e9gr\u00e9 au mode d\u00e9monstration (14\u00a0n\u0153uds, 14\u00a0liens).',
                '<strong>Guide badges</strong> : Description des badges corrig\u00e9e\u00a0: symboles \u2713/!/\u26A0 au lieu de couleurs. R\u00e9f\u00e9rences \u00ab\u00a0Inspecteur\u00a0\u00bb ajout\u00e9es.'
            ]
        },
        {
            version: 'Beta 97.8',
            date: '16 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Coh\u00e9rence visuelle modes clair et sombre',
            items: [
                '<strong>Audit complet</strong> : ~60 couleurs hardcod\u00e9es remplac\u00e9es par des variables CSS dans 10\u00a0fichiers (styles.css, index.html, 7\u00a0fichiers JS).',
                '<strong>Cartes info p\u00e9dagogiques</strong> : Les cartes Note, Conseil et P\u00e9dagogique s\u2019adaptent d\u00e9sormais au mode clair et sombre.',
                '<strong>Badges pattern</strong> : Les 5\u00a0badges d\u2019apprentissage (blocage critique, \u00e9mergent, d\u00e9fi, stable, progression) utilisent des variables th\u00e9m\u00e9es.',
                '<strong>Calendrier</strong> : Couleurs de texte et bordures des jours (weekend, examens, cong\u00e9, reprise) th\u00e9m\u00e9es.',
                '<strong>Jetons profil</strong> : Les sections reprise (violet) et d\u00e9lai (orange) du profil \u00e9tudiant respectent le th\u00e8me actif.',
                '<strong>Gabarit violet</strong> : Nouvelle variable <code>--gabarit-couleur</code> pour les \u00e9l\u00e9ments de type gabarit dans les \u00e9chelles et la biblioth\u00e8que.'
            ]
        },
        {
            version: 'Beta 97.8',
            date: '16 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Normalisation des emojis et guide ind\u00e9pendant',
            items: [
                '<strong>Guide d\u00e9tach\u00e9 \uD83D\uDCD4</strong> : Le guide d\u2019utilisation de la carte mentale est d\u00e9sormais un panneau flottant ind\u00e9pendant, accessible via le bouton \uD83D\uDCD4.',
                '<strong>Conventions emojis</strong> : \uD83D\uDCD4\u00a0guidage, \uD83D\uDCDA\u00a0biblioth\u00e8ques, \uD83D\uDD12/\uD83D\uDD13\u00a0verrouillage, \uD83E\uDD4B\u00a0assistants de cr\u00e9ation \u2014 normalis\u00e9s dans toute l\u2019application.',
                '<strong>Accents corrig\u00e9s</strong> : Caract\u00e8res accentu\u00e9s manquants dans la page Archivage de Construction de la note.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Alignement du mode clair sur le design system',
            items: [
                '<strong>Fond de page</strong> : Fond bleu satur\u00e9 (#d4e6f5) pour que les sections blanches ressortent par contraste.',
                '<strong>Cartes et sections blanches</strong> : Toutes les cartes passent en fond blanc (#ffffff) conform\u00e9ment au design system.',
                '<strong>Ombres bleut\u00e9es</strong> : Ombres double couche rgba(3,46,92,...) au lieu de noir.',
                '<strong>Navigation principale et secondaire</strong> : Boutons bleu principal solide (#032e5c) au lieu du glassmorphisme teal.',
                '<strong>En-t\u00eates de section</strong> : D\u00e9grad\u00e9 bleu principal \u2192 bleu fonc\u00e9 (#032e5c \u2192 #0f1e3a), rempla\u00e7ant le sarcelle #244858. Titres blancs.',
                '<strong>Boutons</strong> : Modifier (violet #4a3a6a), Annuler (orange #d97706), Supprimer (rouge sombre #8a2a2a).',
                '<strong>En-t\u00eates Outils</strong> : Questions Flash et Tirage au sort ont d\u00e9sormais un bandeau d\u00e9grad\u00e9 comme les autres sections.',
                '<strong>Cartes d\u2019accueil</strong> : Les 8 cartes de t\u00e2ches passent en fond blanc avec ombres bleut\u00e9es.',
                '<strong>Bulles anim\u00e9es</strong> : Blanches sur l\u2019en-t\u00eate bleu en mode clair.',
                '<strong>Carte mentale</strong> : Fond blanc, palette des \u00e9l\u00e9ments en bleu p\u00e2le (#e8f2fd).'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'rose',
            titre: 'Corrections signal\u00e9es par les testeurs',
            items: [
                '<strong>Bug import (#Bruno)</strong> : Le bouton \u00ab\u00a0Choisir un fichier\u00a0\u00bb dans R\u00e9glages \u2192 Donn\u00e9es \u2192 Importer ne fonctionnait pas (<code>ouvrirModalImport is not defined</code>). La fonction existait mais n\u2019\u00e9tait pas export\u00e9e. Corrig\u00e9.',
                '<strong>Lisibilit\u00e9 \u00ab\u00a0Voir aussi\u00a0\u00bb</strong> : Les boutons de liens dans les fen\u00eatres d\u2019aide contextuelle \u00e9taient illisibles (texte fonc\u00e9 sur fond fonc\u00e9). Contraste corrig\u00e9.',
                '<strong>Badge retir\u00e9</strong> : Le badge \u00ab\u00a0D\u00e9veloppement actif\u00a0\u00bb dans Annoter des travaux a \u00e9t\u00e9 retir\u00e9.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Assistance \u00e0 l\u2019annotation et \u00e0 l\u2019\u00e9valuation',
            items: [
                '<strong>Jalon \u2469\u20de Annoter des travaux</strong> : Nouveau jalon dans le parcours d\u2019apprentissage (chapitre Enseigner). D\u00e9tection automatique quand un fichier est import\u00e9.',
                '<strong>Panneau \u00e9tat z\u00e9ro</strong> : Quand aucun fichier n\u2019est import\u00e9, un guide en 3\u00a0\u00e9tapes explique comment d\u00e9marrer l\u2019annotation.',
                '<strong>Bulles de d\u00e9couverte</strong> : Nouveau micro-composant pour afficher un conseil contextuel \u00e0 c\u00f4t\u00e9 d\u2019un \u00e9l\u00e9ment (utilis\u00e9 \u00e0 la premi\u00e8re ouverture de fichier).',
                '<strong>Aide contextuelle enrichie</strong> : Nouvelles entr\u00e9es pour l\u2019annotation (formats, nommage, autocollants) et l\u2019\u00e9valuation (pr\u00e9requis, liens).'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Harmonisation des emojis et assistants conditionnels',
            items: [
                '<strong>Tour guid\u00e9 \uD83D\uDDFA\uFE0F</strong> : L\u2019ic\u00f4ne du tour guid\u00e9 passe de \uD83D\uDD26 \u00e0 \uD83D\uDDFA\uFE0F dans l\u2019ensemble de l\u2019application (8\u00a0fichiers).',
                '<strong>Donn\u00e9es d\u00e9mo \uD83D\uDEB8</strong> : L\u2019ic\u00f4ne des donn\u00e9es de d\u00e9monstration passe de \uD83D\uDDFA\uFE0F \u00e0 \uD83D\uDEB8 pour \u00e9viter la confusion avec le tour guid\u00e9.',
                '<strong>Assistants conditionnels</strong> : La banni\u00e8re \u00ab\u00a0Assistant de cr\u00e9ation de mat\u00e9riel\u00a0\u00bb (Construction) est d\u00e9sormais masqu\u00e9e quand le tour guid\u00e9 est d\u00e9sactiv\u00e9.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Coh\u00e9rence iconographique et organisation de l\u2019accueil',
            items: [
                '<strong>S\u00e9paration tour guid\u00e9 \uD83D\uDD26</strong> : L\u2019ic\u00f4ne du tour guid\u00e9 est d\u00e9sormais \uD83D\uDD26 (distinct du mode d\u00e9couverte \uD83E\uDDED). Syst\u00e8me d\u2019ic\u00f4nes finalis\u00e9\u00a0: \uD83D\uDDFA\uFE0F\u00a0explicite, \uD83E\uDDED\u00a0d\u00e9couverte, \uD83D\uDD26\u00a0tour guid\u00e9, \uD83D\uDCCD\u00a0aide contextuelle, \uD83D\uDCAC\u00a0info-bulles, \uD83D\uDCCC\u00a0conseils p\u00e9dagogiques, \uD83C\uDF93\u00a0autonome.',
                '<strong>Boutons d\u2019aide contextuelle \uD83D\uDCCD</strong> : Toutes les ic\u00f4nes \uD83E\uDDED utilis\u00e9es pour l\u2019aide contextuelle sont remplac\u00e9es par \uD83D\uDCCD dans 9\u00a0fichiers.',
                '<strong>Parcours repliable</strong> : Le panneau \u00ab\u00a0Ton parcours\u00a0\u00bb est d\u00e9sormais un accord\u00e9on repliable, comme \u00ab\u00a0D\u00e9couvrir\u00a0\u00bb. Bouton de changement de mode dans l\u2019en-t\u00eate.',
                '<strong>Barre utilitaire compacte</strong> : \u00ab\u00a0\uD83D\uDCBE\u00a0Sauvegarder\u00a0\u00bb et \u00ab\u00a0\u2709\uFE0F\u00a0Nouvelles\u00a0\u00bb sont d\u00e9plac\u00e9s vers une barre compacte sous les 8\u00a0cartes p\u00e9dagogiques.',
                '<strong>Tutoiement unifi\u00e9</strong> : Toutes les cartes de l\u2019accueil sont reformul\u00e9es au \u00ab\u00a0tu\u00a0\u00bb.',
                '<strong>Assistant int\u00e9gr\u00e9 au parcours</strong> : Le chapitre \u00ab\u00a0Construire\u00a0\u00bb affiche un bouton \u00ab\u00a0\uD83D\uDEE0\uFE0F\u00a0Lancer l\u2019assistant\u00a0\u00bb quand il n\u2019est pas compl\u00e9t\u00e9.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Point d\u2019entr\u00e9e visible du parcours sur l\u2019accueil',
            items: [
                '<strong>Panneau CTA sur l\u2019accueil</strong> : Quand le parcours n\u2019est pas initialis\u00e9, un panneau \u00ab\u00a0Commence ton parcours\u00a0\u00bb est affich\u00e9 avec les deux boutons de choix de mode (\uD83D\uDDFA\uFE0F\u00a0\u00c9tape par \u00e9tape / \uD83E\uDDED\u00a0Par exploration).',
                '<strong>Hero adaptatif</strong> : Le titre de la page d\u2019accueil s\u2019adapte \u00e0 l\u2019\u00e9tat du parcours\u00a0: \u00ab\u00a0Bienvenue\u00a0! Par o\u00f9 commencer\u00a0?\u00a0\u00bb avant le choix, \u00ab\u00a0Que souhaitez-vous faire\u00a0?\u00a0\u00bb apr\u00e8s.',
                '<strong>Parcours toujours visible</strong> : Le panneau parcours est d\u00e9sormais affich\u00e9 en permanence sur l\u2019accueil (CTA ou progression), sans condition pr\u00e9alable.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Parcours d\u2019apprentissage \u2014 Phases\u00a03 \u00e0 5',
            items: [
                '<strong>Mode d\u00e9couverte</strong> : Indicateur \uD83E\uDDED compact et cliquable dans l\u2019en-t\u00eate, rappel discret apr\u00e8s chargement de la d\u00e9mo, pulse visuel sur l\u2019indicateur quand un jalon est compl\u00e9t\u00e9.',
                '<strong>Certification d\u2019autonomie</strong> : Nettoyage propre de tous les m\u00e9canismes actifs (guidage, suggestions, notifications) lors du passage en mode autonome. Panneau d\u2019accueil compact avec date et bouton \u00ab\u00a0Relancer\u00a0\u00bb.',
                '<strong>Pr\u00e9f\u00e9rences parcours</strong> : Nouvelle carte dans R\u00e9glages \u2192 Pr\u00e9f\u00e9rences pour changer de mode (\uD83D\uDDFA\uFE0F\u00a0explicite / \uD83E\uDDED\u00a0d\u00e9couverte / \uD83C\uDF93\u00a0autonome), voir la progression par chapitre et r\u00e9initialiser le parcours.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Parcours d\u2019apprentissage \u2014 Phase\u00a02 orchestration',
            items: [
                '<strong>Guidage en mode explicite</strong> : Le guidage de configuration (5\u00a0\u00e9tapes) se d\u00e9clenche aussi quand le parcours est en mode \uD83D\uDDFA\uFE0F\u00a0\u00c9tape par \u00e9tape, plus seulement en Mode\u00a0Assist\u00e9.',
                '<strong>Primo recommand\u00e9</strong> : En mode explicite, l\u2019accueil Primo affiche un bandeau \u00ab\u00a0\uD83D\uDCCD\u00a0Recommand\u00e9\u00a0\u00bb pointant vers le module qui correspond au jalon en cours.',
                '<strong>Tutoriel parcours</strong> : Le tutoriel interactif (7\u00a0\u00e9tapes) se d\u00e9clenche automatiquement au jalon \u2469\u00a0<em>Prendre les pr\u00e9sences</em> en mode explicite.',
                '<strong>Suggestions proactives</strong> : En mode explicite, une barre flottante propose l\u2019\u00e9tape suivante avec bouton d\u2019action. Cooldown de 60\u00a0s, auto-fermeture \u00e0 10\u00a0s.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '15 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Parcours d\u2019apprentissage unifi\u00e9',
            items: [
                '<strong>Deux modes d\u2019apprentissage</strong> : Au premier lancement, l\u2019utilisateur choisit entre \uD83D\uDDFA\uFE0F\u00a0<em>\u00c9tape par \u00e9tape</em> (enseignement explicite) et \uD83E\uDDED\u00a0<em>Par exploration</em> (apprentissage par d\u00e9couverte). Le choix orchestre tous les m\u00e9canismes d\u2019aide existants.',
                '<strong>12 jalons en 4 chapitres</strong> : Configurer (\u2460\u2461\u2462), Construire (\u2463\u2464\u2465\u2466), Planifier (\u2467\u2468, optionnel), Enseigner (\u2469\u246A\u246B). Chaque jalon est d\u00e9tect\u00e9 automatiquement.',
                '<strong>Panneau de parcours</strong> : Affich\u00e9 sur la page d\u2019accueil, montre la progression avec barre visuelle, chapitres et jalons cliquables.',
                '<strong>Certification d\u2019autonomie</strong> : Quand les chapitres essentiels sont compl\u00e9t\u00e9s, un modal \uD83E\uDDED confirme que l\u2019utilisateur ma\u00eetrise les bases et peut naviguer seul.',
                '<strong>Conteneurs visuels</strong> : Les formulaires Productions, Grilles, \u00c9chelles et Cartouches sont envelopp\u00e9s dans un panneau arrondi (<code>.panneau-formulaire</code>) pour une meilleure coh\u00e9sion visuelle.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '14 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Carte mentale \u2014 Taxonomie d\u2019Anderson',
            items: [
                '<strong>Types de connaissances (Anderson)</strong> : Les 3 anciens types (Information, Strat\u00e9gie, Condition) sont remplac\u00e9s par les 4 types d\u2019Anderson\u00a0: <em>Factuelle</em>, <em>Conceptuelle</em>, <em>Proc\u00e9durale</em> et <em>M\u00e9tacognitive</em>. Couleurs distinctes dans la famille orange.',
                '<strong>Migration automatique</strong> : Les cartes existantes sont migr\u00e9es silencieusement au chargement (Information \u2192 Factuelle, Strat\u00e9gie \u2192 Proc\u00e9durale, Condition \u2192 Proc\u00e9durale). Liens et badges pr\u00e9serv\u00e9s.',
                '<strong>Banque de verbes cognitifs</strong> : 6 niveaux (M\u00e9moriser, Comprendre, Appliquer, Analyser, \u00c9valuer, Cr\u00e9er) avec 10 verbes chacun. S\u00e9lecteur dans le panneau de propri\u00e9t\u00e9s pour comp\u00e9tences, id\u00e9es ma\u00eetresses, activit\u00e9s et \u00e9valuations.',
                '<strong>Verbes cliquables</strong> : Cliquer sur un verbe l\u2019ins\u00e8re au d\u00e9but du titre du n\u0153ud. Description du niveau affich\u00e9e en aide contextuelle.',
                '<strong>Badge cognitif sur le canevas</strong> : Un indicateur discret affiche le niveau cognitif s\u00e9lectionn\u00e9 dans le coin du n\u0153ud.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '14 f\u00e9vrier',
            couleur: 'bleu',
            titre: 'Simplification de la page d\u2019accueil',
            items: [
                '<strong>Nouvel ordre des cartes</strong> : Planifier \u2192 Configurer pratique \u2192 Pr\u00e9sences \u2192 Annoter \u2192 \u00c9valuer. La configuration de la pratique de notation est maintenant en 2e position.',
                '<strong>Textes simplifi\u00e9s</strong> : \u00ab\u00a0Configurer ma pratique de notation\u00a0\u00bb, \u00ab\u00a0Derni\u00e8res nouvelles\u00a0\u00bb, descriptions all\u00e9g\u00e9es.'
            ]
        },
        {
            version: 'Beta 97.7',
            date: '14 f\u00e9vrier',
            couleur: 'vert',
            titre: 'Refonte du wizard de configuration des pratiques',
            items: [
                '<strong>Classification comportementale</strong> : Le wizard ne demande plus de choisir entre Sommative / PAN-Standards / PAN-Sp\u00e9cifications. Il pose des questions concr\u00e8tes sur votre m\u00e9thode de notation et d\u00e9duit automatiquement le type de pratique. Score : 12/12 enseignants correctement classifi\u00e9s (vs 1/12 avant).',
                '<strong>Questions guid\u00e9es</strong> : Comment calculez-vous la note finale ? Utilisez-vous des r\u00e8gles sp\u00e9ciales ? Combien d\u2019\u00e9valuations pr\u00e9voyez-vous ? Quels sont vos seuils personnels ?',
                '<strong>Variantes automatiques</strong> : Le moteur d\u00e9tecte les variantes (remplacement progressif, verrou, portfolio, plafonnement, N meilleurs, objectifs pond\u00e9r\u00e9s, comptage, seuils critiques).',
                '<strong>Calcul par sp\u00e9cifications</strong> : La m\u00e9thode de calcul PAN-Sp\u00e9cifications (fran\u00e7ois) est d\u00e9sormais impl\u00e9ment\u00e9e \u2014 v\u00e9rifie les sp\u00e9cifications satisfaites et retourne la note du forfait le plus \u00e9lev\u00e9.',
                '<strong>Double verrou</strong> : La m\u00e9thode de plafonnement par verrou (Marie-H\u00e9l\u00e8ne) est impl\u00e9ment\u00e9e \u2014 plafonne la note finale si l\u2019\u00e9valuation verrouill\u00e9e est sous le seuil.',
                '<strong>Remplacement progressif</strong> : La m\u00e9thode de remplacement (Jordan) est impl\u00e9ment\u00e9e \u2014 pour chaque paire, utilise max(initiale, finale) si la note finale est sup\u00e9rieure.',
                '<strong>Configuration enrichie</strong> : Le wizard capture d\u00e9sormais les r\u00e8gles sp\u00e9ciales, le nombre d\u2019objectifs, les param\u00e8tres de verrou/plafonnement, et les reprises.',
                '<strong>Grille de base</strong> : Quand aucune grille de crit\u00e8res n\u2019existe, le wizard propose d\u2019en cr\u00e9er une automatiquement (4\u00a0crit\u00e8res g\u00e9n\u00e9riques \u00e0 25\u00a0%). Modifiable ult\u00e9rieurement.',
                '<strong>Diagnostic au r\u00e9capitulatif</strong> : Le r\u00e9capitulatif affiche d\u00e9sormais un badge color\u00e9 (SOM / PAN / SPE) avec une explication p\u00e9dagogique du type de notation identifi\u00e9.',
                '<strong>Nom modifiable</strong> : Le nom de la pratique peut \u00eatre ajust\u00e9 au r\u00e9capitulatif, apr\u00e8s avoir vu le type diagnostiqu\u00e9.'
            ]
        },
        {
            version: 'Beta 97.6',
            date: '13 f\u00e9vrier',
            couleur: 'orange',
            titre: 'Correction wizard pratique',
            items: [
                '<strong>Bug #68 — Bouton Précédent invisible</strong> : Le bouton «\u00a0← Précédent\u00a0» du wizard de création de pratique ne s\u2019affichait jamais (style inline prioritaire sur la classe CSS). Corrigé.'
            ]
        },
        {
            version: 'Beta 97.6',
            date: '13 f\u00e9vrier',
            couleur: 'rose',
            titre: 'Corrections bugs testeurs (\u00c9lise)',
            items: [
                '<strong>Bug #64 \u2014 Sauvegardes impossibles dans R\u00e9glages</strong> : Les fonctions de notification (<code>afficherNotificationSucces</code> / <code>afficherNotificationErreur</code>) n\u2019\u00e9taient pas accessibles depuis le module Trimestre, ce qui faisait planter silencieusement toutes les sauvegardes (enseignant, horaire, groupe-cours). Corrig\u00e9.',
                '<strong>Bug #65 \u2014 Erreur tooltips</strong> : Le survol de certains \u00e9l\u00e9ments (n\u0153uds texte) provoquait une erreur console. Corrig\u00e9.',
                '<strong>Bug #66 \u2014 0 \u00e9tudiants affich\u00e9s</strong> : Les \u00e9tudiants import\u00e9s sans champ <code>groupe</code> \u00e9taient filtr\u00e9s silencieusement. Ils sont d\u00e9sormais inclus automatiquement.',
                '<strong>Bug #67 \u2014 Cours actif incorrect dans rapport</strong> : Le rapport de bug affichait \u00ab\u00a0undefined\u00a0\u00bb au lieu du cours actif. Corrig\u00e9.'
            ]
        },
        {
            version: 'Beta 97.6',
            date: '13 f\u00e9vrier',
            couleur: 'orange',
            titre: 'S\u00e9curisation des donn\u00e9es personnelles',
            items: [
                '<strong>Anti-XSS</strong> : Toutes les donn\u00e9es provenant de la base ou d\u2019un import sont d\u00e9sormais \u00e9chapp\u00e9es (<code>echapperHtml()</code>) avant insertion dans l\u2019interface. Prot\u00e8ge contre les fichiers JSON malveillants.',
                '<strong>Validation des imports</strong> : Les ressources import\u00e9es (grilles, \u00e9chelles, pratiques, productions) sont assainies par un sch\u00e9ma (whitelist de propri\u00e9t\u00e9s, troncature des cha\u00eenes, retrait des balises HTML). Limite de 10\u00a0Mo par fichier.',
                '<strong>Exports s\u00e9curis\u00e9s</strong> : Un avertissement s\u2019affiche quand l\u2019export contient des donn\u00e9es personnelles. Le fichier porte le pr\u00e9fixe <code>CONFIDENTIEL</code>. Les noms d\u2019\u00e9tudiants sont retir\u00e9s des snapshots export\u00e9s (seul le DA est conserv\u00e9).',
                '<strong>Isolation par groupe</strong> : Les snapshots ne se cr\u00e9ent plus sans groupe actif. Le fallback dangereux vers tous les groupes du cours a \u00e9t\u00e9 remplac\u00e9 par un tableau vide.',
                '<strong>Nettoyage d\u00e9mo complet</strong> : Toutes les cl\u00e9s <code>demo_*</code> (y compris les snapshots avec suffixe groupe-cours) sont d\u00e9sormais supprim\u00e9es lors de la sortie du mode d\u00e9mo.'
            ]
        },
        {
            version: 'Beta 97.5',
            date: '13 février',
            couleur: 'vert',
            titre: 'Suivi d\u2019\u00e9tudiants au tableau de bord',
            items: [
                '<strong>Suivi d\u2019\u00e9tudiants</strong> : Nouveau panneau dans la section Observer pour tracker jusqu\u2019\u00e0\u00a05\u00a0\u00e9tudiants simultan\u00e9ment. Chaque \u00e9tudiant suivi re\u00e7oit une couleur distincte de la palette Oc\u00e9an (danger, laiton, succ\u00e8s, sarcelle, alerte).',
                '<strong>Points color\u00e9s</strong> : Les points blancs des \u00e9tudiants suivis deviennent des billes 3D color\u00e9es dans toutes les barres gradu\u00e9es (A, C, P, E, Patterns, R\u00e0I).',
                '<strong>Lien point \u2194 badge</strong> : Cliquer un point sur une barre surligne la badge correspondante dans le panneau de suivi.',
                '<strong>Nettoyage automatique</strong> : Les entr\u00e9es de suivi obsol\u00e8tes (d\u2019un autre groupe) sont retir\u00e9es automatiquement lors du changement de groupe.',
                '<strong>Compatibilit\u00e9</strong> : Fonctionne en mode anonymisation (\u00e9l\u00e8ve anonymis\u00e9, matching par DA) et en mode archive (lecture seule).'
            ]
        },
        {
            version: 'Beta 97.5',
            date: '12 février',
            couleur: 'bleu',
            titre: 'Tour guide & accueil enrichi',
            items: [
                '<strong>Tour guide 🧭</strong> : Le personnage Primo\u00a0😎 est remplac\u00e9 par un syst\u00e8me de tour guide\u00a0🧭. L\u2019emoji, les textes utilisateur et les r\u00e9f\u00e9rences \u00e0 Primo sont mis \u00e0 jour dans toute l\u2019interface (index.html + 14\u00a0fichiers JS).',
                '<strong>Activation par checkbox</strong> : Le tour guide s\u2019active depuis la page d\u2019accueil. La pr\u00e9f\u00e9rence persiste (IndexedDB) et les ic\u00f4nes\u00a0🧭 apparaissent/disparaissent en temps r\u00e9el.',
                '<strong>estModeAssiste() fonctionnel</strong> : La fonction lit d\u00e9sormais la pr\u00e9f\u00e9rence <code>tourGuide</code> au lieu de retourner <code>false</code>. Nouvelle fonction <code>definirTourGuide()</code> synchronise checkboxes, classe CSS et \u00e9v\u00e9nement.',
                '<strong>Accueil \u00e9largi (10\u00a0cartes)</strong> : Deux nouvelles cartes\u00a0: \u00ab\u00a0\uD83C\uDFAF\u00a0Construire la note\u00a0\u00bb (ouvre le wizard) et \u00ab\u00a0\uD83D\uDEDF\u00a0Pr\u00e9parer des interventions\u00a0\u00bb (ouvre la planification R\u00e0I). Grille pass\u00e9e \u00e0 5\u00a0colonnes, conteneur \u00e9largi \u00e0 1200\u00a0px.',
                '<strong>Glossaire et aide</strong> : Entr\u00e9e \u00ab\u00a0Primo (Assistant\u00a0😎)\u00a0\u00bb remplac\u00e9e par \u00ab\u00a0Tour guide (🧭)\u00a0\u00bb avec d\u00e9finition mise \u00e0 jour.'
            ]
        },
        {
            version: 'Beta 97.5',
            date: '11 février',
            couleur: 'sarcelle',
            titre: 'Retouches visuelles Océan & Boussole',
            items: [
                '<strong>Dégradés fidèles à la maquette</strong> : En-tête avec gradient 4\u00a0stops atmosphérique. Cartes et conteneurs avec radial-gradient volumétrique (spot lumineux en haut-gauche). Surfaces enrichies conformes au design system C4.',
                '<strong>En-têtes de section uniformes</strong> : Les barres dégradées dans les accordéons, titres de cartes et en-têtes de panneaux sont remplacées par un fond uni #244858 pour un rendu plus propre.',
                '<strong>Navigation épurée</strong> : Fonds des barres de navigation principale, secondaire et bandeau groupe-cours rendus transparents. Séparateurs retirés entre l\u2019en-tête et les sections. Les boutons glassmorphism flottent sur le gradient du conteneur.',
                '<strong>Contraste amélioré</strong> : Textes de la Boîte à outils (Questions Flash, Tirage au sort), badges, compteurs et selects corrigés pour lisibilité sur fond sombre.',
                '<strong>Accueil harmonisé</strong> : Les 10\u00a0cartes d\u2019actions utilisent un fond océan profond (#0c1a22) uniforme.',
                '<strong>Nouveautés adaptées</strong> : Les cartes du changelog adoptent le thème sombre avec surfaces unies.'
            ]
        },
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
                '<strong>Boutons 📍 d\'aide</strong> : Des boutons apparaissent pour expliquer chaque section (14 thèmes couverts)',
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
