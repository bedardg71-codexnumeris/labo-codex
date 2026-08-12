/**
 * changelog-data.js — Données structurées du changelog + rendu HTML
 *
 * Convention : 1 entrée par version MINEURE (cf. CLAUDE.md). Depuis 1.0.0
 * (3 juin 2026), versionnage sémantique (SemVer MAJEUR.MINEUR.CORRECTIF) ;
 * avant, schéma « Beta XX » (95, 96, 97, 98, 99).
 * Pas de dates. Max 6-8 items orientés utilisateur.
 * Couleurs : vert (features), bleu (améliorations), orange (corrections).
 *
 * ⚠ EXCEPTION ASSUMÉE — l'entrée 1.48 (décision Grégoire, 7 août 2026).
 * Elle CONSOLIDE le chantier alignement 1.32 → 1.48. Ce n'est pas un oubli à
 * réparer en la découpant : ces seize versions mineures ont vécu sur une
 * branche non mergée et ont été déployées d'un seul coup. Du point de vue de
 * l'utilisateur, qui passait de 1.31 à 1.48, elles sont UNE livraison — et
 * seize entrées auraient décrit un historique de développement qu'il n'a
 * jamais vécu. La règle « 1 entrée par mineure » vaut pour le rythme normal,
 * où chaque mineure est déployée seule.
 */
(function() {
    'use strict';

    var CHANGELOG = [
        {
            version: '1.79',
            couleur: 'vert',
            titre: 'Les repères « séance 2 » peuvent quitter les titres',
            items: [
                'Quand une leçon porte son rang de séance dans le modèle, l’outil de nettoyage des titres propose enfin de retirer le « séance 2 » écrit à la main — ce qu’il refusait de faire jusqu’ici, faute d’endroit où ranger l’information.',
                'Trois conditions, et aucune n’est facultative : le titre annonce un rang, la leçon en porte un, et les deux concordent. Si ta leçon n’a pas de rang posé, le titre reste intact — l’application ne devine jamais un rang à partir de ce que tu as écrit.',
                'Deux rangs qui se contredisent restent intacts aussi : toi seul sais lequel fait foi.',
                'Dans les gabarits d’export, « nom d’usine » devient « nom générique ».'
            ]
        },
        {
            version: '1.78',
            couleur: 'vert',
            titre: 'Le travail hors classe ne compte plus dans le temps de classe',
            items: [
                'Dans l’Inspecteur, une activité ou une évaluation peut être marquée « Travail hors classe » : une lecture à faire à la maison, un artefact à remettre entre deux séances.',
                'Ce temps-là SORT du total de la leçon. Le compteur de l’en-tête et la jauge du planificateur ne disent plus que du temps de classe — c’est ce qui permet de décider quoi couper.',
                'Un nœud marqué hors classe n’a plus de champ Durée : la question ne se pose pas, plutôt que d’être grisée.',
                'Dans le gabarit Calendrier, ces éléments remplissent la colonne « Travail personnel » — et ils quittent les colonnes Contenu et Évaluations, pour ne jamais apparaître deux fois sur la même ligne.',
                'Le Calendrier exporté en Markdown sort désormais en sections (« ### Semaine 3 », puis les champs) et non plus en tableau : coller un tableau Markdown dans Pages ne produisait pas un tableau, seulement des barres verticales.',
                'Dans l’éditeur de gabarits, une colonne qui ne peut rien afficher dans la présentation choisie est signalée sur place — plutôt que de sortir vide sans explication.'
            ]
        },
        {
            version: '1.77',
            couleur: 'vert',
            titre: 'Des gabarits d’export, et un calendrier qui se date tout seul',
            items: [
                'Nouveau gabarit « Calendrier » : une ligne par rencontre, avec la semaine, la séance (A, B…), la date, le contenu et les évaluations. C’est le déroulement que tu tiens à la main, produit par l’application.',
                'La date n’est jamais saisie : elle se déduit de la semaine de la leçon, de son rang dans la semaine et de l’horaire du groupe. Déplace une leçon, corrige un congé — la date suit.',
                'Quand un cours a plusieurs groupes, l’export demande lequel avant de dater. Avec un seul groupe, il ne demande rien.',
                'Tu peux créer tes propres gabarits : duplique-en un, choisis les colonnes, mets-les dans l’ordre voulu, renomme-les pour coller aux exigences de ton département.',
                'Les tableaux s’exportent aussi en Markdown — celui qui se colle dans Pages ou Word en gardant sa forme de tableau.',
                '⚠ Le niveau « Personnalisé » est remplacé par les gabarits. Ton réglage existant est converti automatiquement en un gabarit nommé « Mon export personnalisé » : rien n’est perdu, tu peux le renommer.'
            ]
        },
        {
            version: '1.76',
            couleur: 'vert',
            titre: 'Une leçon peut dire à quelle séance de la semaine elle a lieu',
            items: [
                'Dans la Carte d’alignement, l’en-tête d’un bloc Leçon porte un nouveau sélecteur, juste à côté de celui de la semaine : A, B, C ou D — la première, la deuxième, la troisième rencontre de cette semaine-là.',
                'Jusqu’ici, cette information ne pouvait vivre que dans le titre de la leçon, écrite à la main. L’application ne pouvait ni la lire ni la retirer sans te faire perdre ce que tu avais noté.',
                'Les séquences n’ont pas ce sélecteur, et c’est voulu : une séquence s’étend sur plusieurs semaines, elle n’a pas de rang à l’intérieur d’une semaine.',
                '⚠ Les exports ne montrent pas encore la séance : c’est la prochaine étape. Ce que tu poses maintenant sera repris tel quel.'
            ]
        },
        {
            version: '1.75',
            couleur: 'orange',
            titre: 'Réimporter un codex n’ajoute plus de doublons',
            items: [
                'Quand tu réimportes un codex que tu as déjà importé, l’application reconnaît maintenant ce qui est déjà là et ne le recopie plus. Avant, chaque import ajoutait une couche : cartouches, grilles, échelles, productions et pratiques se dédoublaient en silence.',
                'Un cas plus sournois est bouché aussi : une grille identique recevait un nouvel identifiant, et ses cartouches partaient dans un magasin que plus rien ne consultait. Rien ne semblait avoir changé à l’écran, mais l’espace se remplissait.',
                '⚠ Rien n’est jamais écrasé : si deux éléments portent le même identifiant mais un contenu réellement différent, les DEUX sont conservés, et la console le signale.',
                'Deux ressources qui portent le même nom restent deux ressources : le rapprochement se fait sur le contenu, jamais sur le titre.',
                'Le message de fin d’import annonce désormais ce qui est réellement entré, pas ce qui a été reçu.'
            ]
        },
        {
            version: '1.74',
            couleur: 'vert',
            titre: 'Les blocs de la Carte d’alignement s’alignent entre eux',
            items: [
                'Guides magnétiques : en glissant un bloc, il colle sur les bords, les centres et les milieux des blocs voisins, et une ligne pointillée montre sur quoi il s’aligne. Elle disparaît dès que tu relâches.',
                'Six commandes d’alignement — à gauche, au centre, à droite, en haut, au milieu, en bas — dans une petite barre qui apparaît d’elle-même dès que deux blocs sont sélectionnés.',
                'Une leçon alignée emmène ses activités : elle ne se détache jamais de son contenu.',
                'Un seul ⌘Z défait un alignement complet.',
                'Tout fonctionne au doigt sur iPad : les boutons font 44 px et l’aimant tient compte du zoom, pour ne pas happer la carte entière quand tu es en vue d’ensemble.',
                'Loupe : cliquer directement dans la carte t’y emmène — avant, seul un clic dans le cadre de la loupe fonctionnait. Et le pointeur devient un petit rectangle aux proportions de la loupe, qui montre la zone que tu vas examiner.'
            ]
        },
        {
            version: '1.73',
            couleur: 'vert',
            titre: 'Lire une grande carte sans changer de zoom : « Tout voir » et la loupe',
            items: [
                'Nouveau bouton « Tout voir » dans la barre d’outils de la Carte d’alignement : il ajuste le zoom pour que la carte ENTIÈRE tienne à l’écran, blocs isolés compris. « Recentrer » (⌘1) ne touchait jamais au zoom — les deux commandes coexistent.',
                'Nouvelle loupe : active-la (bouton, ou touche L), promène le pointeur ou le doigt, et lis à l’échelle normale sans que la carte bouge. Clique — ou tape « Aller ici » — et la carte s’y rend. La loupe s’éteint, le clavier est libre pour écrire.',
                'Les deux ensemble servent à se déplacer : prendre du recul, repérer la zone, lire à la loupe, sauter à l’endroit voulu.',
                'La loupe fonctionne au doigt sur iPad, et glisser en mode loupe ne déplace aucun bloc.',
                'Le zoom arrière descend désormais plus bas que 25 % — une grande carte ne tenait pas à l’écran à cette limite.'
            ]
        },
        {
            version: '1.72',
            couleur: 'vert',
            titre: 'Dupliquer plusieurs blocs d’un coup dans la Carte d’alignement',
            items: [
                '⌘D duplique désormais TOUS les blocs sélectionnés, et plus seulement le dernier. Sélectionne-en cinq, appuie une fois : tu obtiens cinq copies, déjà sélectionnées pour que tu puisses les glisser où tu veux dans la foulée.',
                'Un seul ⌘Z défait la duplication entière — pas copie par copie.',
                'Si tu sélectionnes une leçon ET l’une de ses activités, l’activité n’est pas copiée deux fois : la copie de la leçon emporte déjà son contenu.'
            ]
        },
        {
            version: '1.71',
            couleur: 'orange',
            titre: 'Le bouton Supprimer d’un groupe-cours réapparaît',
            items: [
                'Le bouton « Supprimer » d’un groupe-cours restait invisible quand tu arrivais sur la section : l’application restaurait bien ton groupe actif et ouvrait son formulaire, mais la commande de suppression ne s’affichait pas. Elle n’apparaissait qu’après avoir rouvert le menu déroulant.'
            ]
        },
        {
            version: '1.69',
            couleur: 'orange',
            titre: 'L’assistant ne propose plus « Par objectifs »',
            items: [
                'L’étape « Approche d’évaluation » de l’assistant de pratique n’offrait encore que deux choix, dont « Par objectifs d’apprentissage » — un paradigme retiré de l’application en 1.63, moteur compris. L’assistant promettait donc quelque chose que plus rien ne calculait. La carte disparaît.',
                'L’étape reste, avec sa seule approche réelle déjà cochée : elle dit ce sur quoi PAN-Standards s’appuie au lieu de le décider en coulisse.',
                'Une pratique enregistrée autrefois « par objectifs » s’ouvre maintenant sur le portfolio, sans rien perdre : sa configuration n’est ni effacée ni réécrite tant que tu ne sauvegardes pas toi-même.'
            ]
        },
        {
            version: '1.68',
            couleur: 'vert',
            titre: 'Relier une activité à un objectif, au tracé',
            items: [
                'Tu peux maintenant tracer un lien depuis une activité, un exposé ou une évaluation et le déposer sur la ligne d’un objectif de sa leçon : la case « objectifs servis » se coche toute seule. Les cases de l’Inspecteur restent là — c’est le même geste, par un autre chemin.',
                'Si le dépôt ne peut pas aboutir (bloc d’une autre leçon, type qui ne sert pas d’objectif), l’application te le dit au lieu de ne rien faire.',
                'Les pastilles des objectifs (!, ⚠, ✓) ont enfin une légende : dans l’Inspecteur de la leçon et dans la page 5 du guide. Leur sens ne vivait que dans une infobulle au survol — invisible sur iPad.'
            ]
        },
        {
            version: '1.67',
            couleur: 'orange',
            titre: 'Changer de trimestre ne laisse plus rien derri\u00e8re',
            items: [
                'Le groupe-cours que tu avais laiss\u00e9 actif dans un trimestre est bien celui qui revient quand tu y retournes. Avant, l\u2019application reprenait le premier de la liste \u2014 ton groupe actif pouvait changer sans que rien ne le signale, et les \u00e9crans de suivi suivaient.',
                'La barre de progression du Cadre et le s\u00e9lecteur des groupes-cours se mettent \u00e0 jour imm\u00e9diatement : ils affichaient encore les chiffres et les groupes du trimestre que tu venais de quitter.',
                'Correction : une fiche d\u2019\u00e9tudiant\u00b7e sans nom (import incomplet) emp\u00eachait l\u2019affichage de la liste enti\u00e8re et faisait \u00e9chouer le tirage au sort, sans message.',
                'Correction : ta biblioth\u00e8que de cours accumulait des exemplaires identiques du m\u00eame cours \u00e0 chaque import \u2014 la m\u00eame fiche pouvait appara\u00eetre deux ou trois fois dans le s\u00e9lecteur. Les imports n\u2019en ajoutent plus.'
            ]
        },
        {
            version: '1.66',
            couleur: 'vert',
            titre: 'Carte d\u2019alignement \u2014 utilisable au doigt',
            items: [
                'Un double-tap sur un bloc ouvre l\u2019Inspecteur sur iPad. Le double-clic n\u2019y fonctionnait pas : la dur\u00e9e, la semaine, les objectifs servis et la r\u00e9troaction formative n\u2019\u00e9taient atteignables que par le bouton \u00ab Inspecteur \u00bb.',
                'Les boutons Inspecteur, Raccourcis, Guide et Biblioth\u00e8que passent du bas de la palette \u00e0 la barre d\u2019outils \u2014 ils y sont toujours visibles, m\u00eame sur un \u00e9cran court.',
                'Les six familles de la palette \u00ab N\u0153uds \u00bb se replient d\u2019un toucher sur leur titre. Ton choix est m\u00e9moris\u00e9.',
                'La corbeille quitte la palette : elle appara\u00eet au bas de la carte d\u00e8s que tu commences \u00e0 d\u00e9placer un bloc, et dispara\u00eet ensuite.'
            ]
        },
        {
            version: '1.65',
            couleur: 'orange',
            titre: 'Carte d’alignement — la durée s’affiche, les objectifs se réordonnent',
            items: [
                'La durée d’un bloc est maintenant visible dès que tu le poses. Elle n’apparaissait qu’après un rechargement de la page — sur les Exposés comme sur les cinq étapes d’enseignement explicite.',
                'Même correctif pour une Leçon qu’on vient de créer : son total Σ, son sélecteur de semaine, son badge 🎯 et sa poignée de redimensionnement sont là tout de suite.',
                'Deux nouvelles flèches ▲▼ sur chaque objectif de leçon : change leur ordre sans les retaper. Les liens entre un objectif et les activités qui le servent suivent le déplacement.',
                'Un titre collé depuis une autre application prend la typographie de la carte au lieu de garder la sienne.',
                'Les cinq étapes d’enseignement explicite partagent une seule couleur sarcelle : la famille se repère d’un coup d’œil.',
                'Le bandeau « Présentement en développement actif » est retiré de l’en-tête du module.',
                'Correction : les onglets de Conception (Productions, Grilles, Échelles, Cartouches, Pratiques) affichaient une page vide — ils s’affichent de nouveau.'
            ]
        },
        {
            version: '1.64',
            couleur: 'bleu',
            titre: 'Les réglages d’une pratique s’appliquent partout, tout de suite',
            items: [
                'Les écrans de suivi (profil, aperçu du groupe, liste des étudiant·es) lisent maintenant la configuration de ta pratique directement à sa source. Avant, ils lisaient une copie figée au moment où tu avais appliqué la pratique : modifier le nombre d’artefacts à retenir changeait la note du profil, mais pas les autres écrans, qui restaient sur l’ancienne valeur sans rien signaler.',
                'Ménage interne : cette copie figée n’est plus entretenue nulle part, et l’ancien mécanisme de migration qui s’exécutait à chaque démarrage est retiré.'
            ]
        },
        // (1.62 n'a jamais été déployée — consolidée dans 1.63, même précédent
        //  que l'entrée 1.48 : l'utilisateur ne verra qu'UNE livraison.)
        {
            version: '1.63',
            couleur: 'orange',
            titre: 'Une seule question sur la construction de la note',
            items: [
                'Dans les réglages d’une pratique PAN-Standards, le champ « Comment construis-tu la note finale ? » disparaît : il posait la même question que « Mode de sélection », avec d’autres mots, et les deux réponses pouvaient se contredire. Une seule commande reste.',
                'Chaque mode de sélection affiche une courte explication de ce qu’il fait.',
                'Le mode « Par objectifs (4 modes de calcul) » est retiré de l’application. Il n’a jamais pu calculer une note — le lien entre productions et objectifs qu’il supposait n’a jamais existé — et son panneau de réglages ne s’était jamais affiché. Les quatre gabarits du catalogue qui l’illustraient partent avec lui.',
                'Une pratique enregistrée avec ce mode s’ouvre désormais sur son mode de sélection réel, sans rien perdre : sa configuration n’est ni effacée ni réécrite.'
            ]
        },
        {
            version: '1.61',
            couleur: 'bleu',
            titre: 'L’onglet s’appelle « Carte d’alignement »',
            items: [
                'L’onglet « Alignement pédagogique » devient « Carte d’alignement ». Les six autres onglets de Conception nomment un objet de travail ; celui-là nommait une théorie — et « carte d’alignement » était déjà le mot employé partout ailleurs dans l’application.',
                'Le guide de la carte gagne une étape : « Ce que la leçon vise ». Elle explique où saisir l’objectif d’une leçon (le badge 🎯 de son en-tête) et comment cocher, sur chaque activité, les objectifs qu’elle sert.',
                'Le manuel décrit à nouveau l’application réelle : l’aide, les info-bulles, le glossaire et la visite guidée ne renvoient plus à des pages ni à des commandes retirées cet été.',
                'La zone « Enseignement explicite » de la palette a maintenant son info-bulle, comme les cinq autres.'
            ]
        },
        {
            version: '1.60',
            couleur: 'vert',
            titre: 'Une corbeille dans la palette — supprimer au doigt',
            items: [
                'Nouvelle corbeille au bas de la palette « Nœuds » : glisse un bloc dessus pour le supprimer. Sur iPad, c’était le geste qui manquait — la suppression exigeait jusqu’ici un clavier, ou trois touchers en passant par l’Inspecteur.',
                'La corbeille apparaît dès que tu commences à déplacer un bloc, et devient rouge quand le doigt la survole : tu vois ce qui va se passer avant de relâcher.',
                'Un bloc supprimé par erreur revient avec le bouton « Annuler » de la barre d’outils — le message te le rappelle au moment de la suppression.'
            ]
        },
        {
            version: '1.59',
            couleur: 'bleu',
            titre: 'Les guides se ressemblent enfin',
            items: [
                'Tous les guides — celui de la carte d’alignement comme les guides SOLO, ACP, RàI, sommative et modalités — partagent désormais la même présentation : une seule taille de texte, les mêmes encadrés, la même mise en page.',
                'Correction : dans le guide de la carte, certains paragraphes s’affichaient beaucoup plus gros que les listes, et le texte du guide était trop petit pour être lu confortablement.',
                'Correction : les pictogrammes de badge (✓, !, ⚠) n’apparaissaient pas dans le guide — ils sont maintenant affichés en toutes lettres.',
                'La dernière page du guide décrit le nouvel export du plan (menu Actions, trois niveaux, personnalisation) au lieu de l’ancienne page « Plan de la leçon » qui n’existe plus.',
                'La page sur les activités mentionne maintenant l’Exposé et les cinq étapes de l’enseignement explicite.'
            ]
        },
        {
            version: '1.58',
            couleur: 'vert',
            titre: 'L’export du plan se règle à ta façon',
            items: [
                'Nouveau niveau « Personnalisé » dans « Exporter le plan… » : coche les contenus que tu veux voir (objectifs, activités, évaluations, durées, rétroactions, connaissances, liens, détail des productions) et choisis l’ordre des sections — pour te conformer au gabarit de ton département.',
                'Un aperçu VIVANT montre le document pendant que tu règles : chaque case cochée ou section déplacée se reflète immédiatement, dans le format de ton choix.',
                'Ton réglage est mémorisé : le niveau « Personnalisé » du menu d’export le réutilise tel quel, et tu peux repartir d’un des trois niveaux de base en un clic.',
                'Correction : le tableau TSV n’a plus deux colonnes de semaine — une seule, qui porte l’étendue sur la ligne de séquence et le numéro sur la ligne de leçon.'
            ]
        },
        {
            version: '1.57',
            couleur: 'vert',
            titre: 'La Carte exporte ton plan — et la page « Plan de la leçon » tire sa révérence',
            items: [
                'Nouveau menu « Exporter le plan… » dans les Actions de la carte : trois niveaux (Plan de cours, En classe, Preuve d’alignement) croisés avec trois formats (texte, tableau collable, Markdown). Neuf documents, un seul geste — Copier ou Télécharger.',
                'Le niveau « Plan de cours » donne le sommaire collable : séquences, semaines, leçons et évaluations avec leur pondération. « En classe » ajoute les objectifs, les activités, les durées et les rétroactions. « Preuve d’alignement » montre tout : connaissances, liens verbalisés, objectifs servis, grilles.',
                'Les documents disent enfin « Leçon » (plus jamais « Séance » pour une leçon), les durées sont les totaux réels de la carte — fini le double comptage — et TOUS les objectifs sortent, plus seulement le premier.',
                'La rétroaction formative se pose maintenant sur les activités, directement dans l’Inspecteur. Le sélecteur du nœud Évaluation reste et se clarifie : « Rétroaction sur le rendu » — deux notions, deux libellés.',
                'Correction : les sélecteurs Rétroaction et Production du nœud Évaluation ne sauvegardaient plus rien — ils réagissent de nouveau.',
                'La page « Plan de la leçon » est retirée : tout ce qu’elle faisait vit désormais dans la carte. Tes rétroactions déjà posées y sont transportées automatiquement au démarrage.',
                'Reprendre une carte d’un autre trimestre ne transporte plus de références mortes vers des productions qui n’existent pas dans le trimestre d’arrivée.'
            ]
        },
        {
            version: '1.56',
            couleur: 'vert',
            titre: 'Carte d’alignement : l’enseignant y entre, et le temps s’y compte',
            items: [
                'Nouveau nœud « Exposé », en tête de la famille « Déroulement » (l’ancienne « Mise en action »). Il te donne enfin un bloc pour dire « j’enseigne » : ton temps de parole se pose dans la leçon, porte une durée, et compte dans le total.',
                'Correction : les cinq nœuds d’enseignement explicite (Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture) ne pouvaient être reliés à AUCUNE connaissance ni à aucune évaluation — le lien était refusé. Ils avaient une couleur et une place, mais aucune relation. « Cette connaissance procédurale s’acquiert par cette modélisation » se trace maintenant, et le verbe s’écrit tout seul.',
                'La durée estimée se saisit directement dans l’en-tête du bloc, sur la carte — plus besoin d’ouvrir l’Inspecteur ni de la faire apparaître. L’évaluation en porte une elle aussi : elle occupe du temps de classe comme le reste.',
                'Les leçons et les séquences affichent un compteur « Σ » : le total de ce qu’elles contiennent, mis à jour pendant que tu tapes. Une activité de 20 min ajoutée à une leçon fait monter le total de la leçon ET celui de sa séquence.',
                'Cliquer une leçon dans le planificateur ne remplace plus la carte par une fiche en lecture seule : la carte se déplace jusqu’à l’élément et le sélectionne, pour que tu l’édites sur place au lieu de le relire.',
                'La carte montre désormais TOUT, tout le temps. Ouvrir une séquence ne masque plus les autres, et les séquences ne se replient plus en pastille résumée. Le bouton « Vue globale » disparaît — il n’y a plus de vue à quitter pour y revenir.',
                'Deux boutons dans la barre d’outils, « Nœuds » et « Planificateur », affichent ou masquent chaque palette. Ton choix est mémorisé d’une séance à l’autre.',
                'Un objectif de leçon saisi dans l’ancienne fiche de lecture n’était plus jamais réaffiché : ces textes sont récupérés et remis dans les objectifs de la leçon, sans doublon.',
                'Sur iPad, la carte répond enfin au doigt : déplacer un bloc, sortir une évaluation d’une leçon, tracer un lien — tout ce qui exigeait une souris. Le badge 🎯 d’une leçon sans objectif redevient repérable, et la semaine changée dans l’Inspecteur se reflète immédiatement sur le bloc.'
            ]
        },
        {
            version: '1.55',
            couleur: 'orange',
            titre: 'Des réglages qui ne se perdent plus au démarrage',
            items: [
                'Tes préférences sont de nouveau reprises au démarrage. Certains réglages faits il y a plusieurs mois n’étaient plus relus et l’application repartait de ses valeurs par défaut : ils peuvent réapparaître à ce premier lancement.',
                'La section Données affiche enfin ses compteurs et ses statistiques de captures au chargement.',
                'La case « Données démo » ne se décoche plus toute seule quand tu recharges la page.',
                'Tes raccourcis d’annotation ne sont plus remplacés par les raccourcis par défaut au démarrage.',
                'La liste des grilles et ta grille de référence pour le dépistage se rechargent correctement à l’ouverture.',
                'Après une mise à jour, ton navigateur ne peut plus servir d’anciennes versions des fichiers : les corrections arrivent du premier coup.'
            ]
        },
        {
            version: '1.54',
            couleur: 'vert',
            titre: 'Alignement : l’enseignement explicite entre dans la carte',
            items: [
                'Cinq nouveaux nœuds dans la palette — Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture. Tu les glisses dans une leçon comme des activités : ils portent une durée, se relient aux connaissances et servent les objectifs. Le dégradé de leur couleur suit le transfert de responsabilité de la méthode.',
                'Les étapes à cocher du Plan de la leçon sont retirées : la méthode se construit maintenant dans la carte, au même endroit que le reste de ta leçon.',
                'Les sections de la palette parlent ton vocabulaire : Intention curriculaire, Types de connaissances, Mise en action, Preuve de réussite, Organisation — une ligne au lieu de deux, plus de place pour les nœuds.'
            ]
        },
        {
            version: '1.53',
            couleur: 'vert',
            titre: 'Alignement : la réserve « Non planifié » au choix',
            items: [
                'Un bouton dans la barre du planificateur place la réserve « Non planifié » sous la grille (comme avant) ou EN COLONNE à sa gauche. En colonne, elle ne défile plus avec la grille : tu y puises une pastille et tu la déposes dans n’importe quelle semaine sans la perdre de vue.',
                'Passer en colonne élargit la palette au minimum nécessaire si elle est trop étroite — sinon la grille n’aurait plus la place d’aligner deux pastilles et la colonne coûterait plus qu’elle ne rapporte. Revenir à la disposition du bas ne rétrécit rien : ta largeur reste la tienne.',
                'Le choix est mémorisé.'
            ]
        },
        {
            version: '1.52',
            couleur: 'vert',
            titre: 'Alignement : le planificateur en pastilles',
            items: [
                'Les leçons et les séquences ne s’étirent plus sur toute la largeur de leur rangée : elles épousent leur contenu, comme des pastilles. Une semaine chargée se lit d’un coup d’œil au lieu de défiler, et il en tient plusieurs par ligne.',
                'Actions → « Nettoyer les repères de semaine… » : maintenant que la semaine se choisit dans le bloc, les « Sem. 11 – » écrits dans tes titres font double emploi. L’outil te les montre un par un, avec l’avant et l’après, et rien ne part sans ton clic.',
                'Il refuse de trancher à ta place : si le titre annonce une semaine différente de celle qui est posée, il te le signale sans rien toucher. Si retirer le repère ne laissait rien de lisible, il te laisse réécrire le titre toi-même. Et il ne touche jamais aux repères de séance — la séance n’a pas encore sa place dans le modèle.'
            ]
        },
        {
            version: '1.51',
            couleur: 'vert',
            titre: 'Alignement : la semaine se choisit dans le bloc',
            items: [
                'Un sélecteur de semaine apparaît à côté du type, dans chaque leçon et chaque séquence. Plus besoin d’écrire « Sem. 11 » dans tes titres : le bloc se place tout seul dans le planificateur. Sur une séquence, choisir une semaine DÉPLACE tout le bloc — ses leçons suivent en gardant leurs écarts.',
                'Le sélecteur et le glisser dans la grille sont deux façons de faire le même geste : ce que tu changes d’un côté se voit immédiatement de l’autre.',
                'Le planificateur ne répète plus le nom d’une séquence sur chacune de ses leçons quand elle est déjà affichée dans la même semaine. Il le garde pour les leçons qui s’affichent loin de leur séquence, où le repère sert vraiment.'
            ]
        },
        {
            version: '1.50',
            couleur: 'orange',
            titre: 'Alignement : les notes de leçon cessent de se mélanger',
            items: [
                'Les Objectif et Notes des vues leçon appartiennent désormais à LEUR carte et à LEUR trimestre. Ils étaient partagés : deux cartes pouvaient afficher la même note sans que tu l’aies écrite deux fois, et la démo écrivait au même endroit que tes vraies sessions. Tes notes existantes sont réparties automatiquement au premier démarrage — chaque carte garde exactement ce qu’elle affichait, rien n’est perdu.',
                'Supprimer une leçon efface aussi ses notes. Elles survivaient au nœud, et une leçon créée plus tard pouvait hériter des notes d’une leçon disparue.'
            ]
        },
        {
            version: '1.49',
            couleur: 'vert',
            titre: 'Alignement : reprendre ta carte d’une session à l’autre',
            items: [
                'À la rentrée, un planificateur vide te propose de reprendre la carte du même cours de la session précédente — en un clic, sans fouiller la liste des trimestres. La carte d’origine reste intacte : tu peux retoucher la copie sans toucher au plan de la session déjà donnée.',
                'Actions → « Importer d’un autre trimestre… » remonte en tête les cartes qui portent le même cours, sous « Même cours ». Le reste de la liste ne bouge pas.'
            ]
        },
        {
            version: '1.48',
            couleur: 'vert',
            titre: 'Alignement pédagogique : le planificateur',
            items: [
                'Un planificateur en grille remplace le sommaire et la Vue calendrier : une rangée par semaine, tirée directement de ton Cadre du trimestre — plus rien à ressaisir. Les leçons d’une même semaine s’affichent côte à côte, et tu déplaces ton contenu d’une semaine à l’autre en le glissant. Ce qui n’est pas encore placé attend en pied de grille, dans « Non planifié ».',
                'La semaine appartient maintenant à la leçon, et non plus à la séquence qui pouvait la contredire : l’étendue d’une séquence se calcule à partir des leçons qu’elle contient. Une leçon ancrée hors du cadre de ton trimestre retombe dans « Non planifié » au lieu de disparaître.',
                'Les objectifs d’une leçon s’écrivent et se voient directement dans la carte, au pluriel, avec des boutons pour en ajouter ou en retirer. Reformuler un objectif ne le remplace pas : ses liens survivent à la retouche.',
                'Chaque objectif indique s’il est servi par une activité et vérifié par une évaluation — tu coches les nœuds concernés dans l’inspecteur, et une pastille par objectif montre ce qui reste à couvrir.',
                'Une séquence peut contenir des séquences : tu regroupes à l’échelle que ta discipline demande — module, étape, thème — sans nouveau type de nœud à apprendre.',
                'Le déplacement a été repensé : saisir un bloc déplace ce bloc, ⌘+glisser en fait une copie, et « Dans la leçon » range un nœud depuis l’inspecteur sans aucun geste de glisser. Un conteneur se duplique avec tout son contenu.',
                'Les blocs et la palette se redimensionnent — à la souris comme au doigt sur iPad, avec retour à la taille automatique par double-clic.',
                'Une carte peut être rattachée à son cours, pour la retrouver d’une session à l’autre. Le cours s’affiche à côté du nom de la carte.'
            ]
        },
        {
            version: '1.31',
            couleur: 'vert',
            titre: 'Trimestre : journées sans cours unifiées',
            items: [
                'Une seule carte « Journées sans cours » remplace les deux listes d’événements — congés, fériés et journées personnelles au même endroit, tes données existantes migrent toutes seules.',
                'Nouvelle nature « Férié (collège fermé) » : la fête du Travail n’est plus étiquetée « Institutionnel ».',
                'Avertissements de cohérence sur les bornes du trimestre : une remise de notes avant la fin du trimestre ou une semaine à moitié saisie est signalée — rien n’est bloqué.',
                'Les libellés de reprise disent maintenant « Reprise le [date] (horaire du lundi) » : fini l’ambiguïté sur le jour.',
                'Les champs des semaines spéciales ne se chevauchent plus, et les deux compteurs de semaines/jours de cours affichent enfin le même calcul partout.',
                'La numérotation des semaines suit la règle officielle du cégep : des paquets de 5 jours de cours effectifs, qui s’étirent autour des fériés et enjambent les pauses — elle ne peut plus reculer ni inventer une 17e semaine.'
            ]
        },
        {
            version: '1.30',
            couleur: 'vert',
            titre: 'Alignement : importer une carte d’un autre trimestre',
            items: [
                'Actions → « Importer d’un autre trimestre… » : copie une carte mentale d’un trimestre vers le trimestre actif sans sortir de l’application — comme pour les grilles et les productions. La carte d’origine reste intacte, et les notes de séance des leçons suivent la copie.'
            ]
        },
        {
            version: '1.29',
            couleur: 'vert',
            titre: 'Alignement pédagogique : comptabilité du temps',
            items: [
                'Estime la durée de tes activités (en minutes) dans la carte mentale : la durée d’une leçon se calcule toute seule (somme de ses activités) et s’affiche en périodes dans le sommaire — selon la « Durée d’une période » réglée dans Cadre › Horaire, jamais une valeur fixe.',
                'Jauge de temps au pied de la palette Navigation : total planifié en périodes et en heures, comparé aux heures d’enseignement (RREC) du cours — indicatif et jamais bloquant, les imprévus de session font partie de la vraie vie.',
                'La vue globale affiche la durée totale de chaque séquence à côté de son nombre de leçons.'
            ]
        },
        {
            version: '1.28',
            couleur: 'bleu',
            titre: 'Alignement pédagogique : navigation repensée',
            items: [
                'Nouvelle palette « Navigation » dans la carte mentale : un sommaire montre d’un coup d’œil toute la hiérarchie Vue globale › séquences › leçons — un clic ouvre directement la séquence ou la leçon voulue. La palette se déplace et se réduit comme celle des nœuds.',
                'La barre d’outils de la carte est simplifiée : les carrousels de séquences et de leçons, les compteurs et leurs flèches sont remplacés par le sommaire ; le titre de la carte (en double avec le sélecteur) cède sa place — renomme ta carte via Actions → « Renommer cette carte ».',
                'Nouveau bouton « Recentrer » (◎, aussi ⌘1) : ramène la vue sur le contenu — sur la séquence ouverte s’il y en a une. Il remplace les zooms pleine largeur/hauteur peu utilisés.',
                'Le plein écran de la carte est maintenant vraiment plein écran : le titre de section et la navigation de l’application s’effacent, comme dans la page Annoter.',
                'Nouveau raccourci : ⌥ (Mac) / Alt (Windows) + glisser un bloc en crée un doublon prêt à déposer — et l’aide-mémoire des raccourcis de la palette est complété (⌘D y manquait).'
            ]
        },
        {
            version: '1.27',
            couleur: 'vert',
            titre: 'Suppression de trimestre et corrections d’import',
            items: [
                'Tu peux maintenant supprimer définitivement un trimestre inutile (tests, essais) depuis la gestion des trimestres : confirmation forte en retapant son nom, export de sauvegarde automatique avant l’effacement, et le trimestre actif reste toujours protégé.',
                'Page Calendrier scolaire : les trois indicateurs (semaines scolaires, jours de cours, congés avec reprise) rejoignent la carte « Légende », remontée en tête de page — une seule carte au lieu de quatre. Sur écran étroit, les mois s’empilent maintenant au lieu de déborder à droite.',
                'Réglages du trimestre : les boutons disent maintenant « Créer » ou « Enregistrer » selon le contexte, et le trimestre ne se sauvegarde plus qu’au clic sur « Enregistrer » — fini l’enregistrement silencieux à chaque champ. Le contenu de la page ne déborde plus à droite sur portable.',
                'Import de travaux : le sélecteur global « Production » n’écrase plus une correction faite sur un fichier précis via « Modifier », et l’interface explique la différence entre les deux.',
                'Correction : évaluer une production sans fichier importé n’affiche plus le document d’une autre production.',
                'Correction : les captures de progression automatiques ne créent plus de captures pour les jours où seul un autre groupe a cours, et recapturer une même séance ne crée plus de doublon.',
                'Consultation d’un trimestre archivé : tu peux de nouveau passer d’un·e élève à l’autre dans une évaluation verrouillée (la navigation reste en lecture seule).',
                'Accessibilité : le popup d’aide « Conseil » est maintenant annoncé correctement par les lecteurs d’écran et rend le focus au bouton qui l’a ouvert.'
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
