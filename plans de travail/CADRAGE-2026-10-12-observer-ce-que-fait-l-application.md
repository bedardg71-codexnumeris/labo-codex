# Cadrage : observer ce que fait réellement l'application

## But
Décrire ce que Labo Codex fait réellement, indépendamment de ce que Grégoire voulait qu'elle fasse (principe de Stafford Beer : la finalité d'un système, c'est ce qu'il fait). Le danger visé est le biais de confirmation : voir dans le résultat ce qu'on souhaite y voir. Chantier en lecture seule : il ne modifie pas l'application.

## Trois temps, sur le modèle du pré-enregistrement

### Temps 1 : sceller les intentions
Un analyste autorisé à tout lire (CLAUDE.md, OBJECTIF-COHORTE-1.md, plans de travail, documentation ; BACKLOG, SESSION et RELAIS par recherches ciblées seulement) rédige, geste d'utilisateur par geste, ce que l'application est censée faire. Pour chaque geste : ce qui est censé changer dans les données ; ce qui est censé en sortir (écran, fichier, calcul). Il ajoute ce qui est censé se produire sans geste (au chargement d'une page, à intervalle). Grégoire corrige ce texte. Une fois corrigé, il est scellé : rangé dans « plans de travail/observation/1-intentions-scellees.md », il n'est plus modifié et n'est relu qu'au temps 3. Grégoire ne voit aucun résultat du temps 2 avant d'avoir corrigé ce texte.
L'analyste du temps 1 ne lit pas le code.

### Temps 2 : observer à l'aveugle
Préparation, par une session distincte de celle qui analysera :
- copier le code de l'application dans un dépôt GitHub privé distinct, sans historique git (Grégoire pousse) ;
- retirer tous les commentaires (JS, HTML, CSS) et vérifier par recherche qu'il n'en reste aucun ;
- retirer CLAUDE.md, PROTOCOLE.md, tous les fichiers .md, plans de travail, BACKLOG, SESSION, RELAIS et toute documentation ; neutraliser le contenu du changelog affiché si c'est possible sans casser l'application, sinon le signaler ;
- vérifier qu'aucune donnée réelle d'étudiant·e ne s'y trouve ;
- vérifier que la copie fonctionne (l'application s'ouvre, les gestes de base répondent) ;
- les noms de fonctions, de variables et les textes d'écran restent tels quels (limite assumée).
Isolement de l'analyste : la session d'analyse s'ouvre sur la copie aveugle seulement, dans le nuage, sans accès au dépôt principal, sans instructions ni mémoire de l'utilisateur (CLAUDE.md utilisateur, mémoire automatique, skills, plugins). La session de préparation vérifie et documente comment obtenir cet isolement ; si elle ne peut pas le garantir, elle le dit au lieu de le supposer.
Consigne neutre donnée à l'analyste : décrire ce que fait ce programme, sans description préalable de l'application ni de son but.
Méthode de l'analyste :
1. Inventaire tiré du code, pas d'une liste fournie : chaque écouteur d'événement, chaque élément cliquable ou saisissable, chaque minuterie, tout ce qui s'exécute au chargement.
2. Pour chaque élément, en faisant tourner l'application avec des données fictives (noms manifestement fictifs) : données lues ; données écrites (clés de stockage et champs, avant et après) ; sorties (changements à l'écran, fichiers produits, valeurs calculées) ; communications réseau éventuelles.
3. Aucune affirmation sur l'intention, rien au conditionnel. Chaque affirmation porte sa source : « observé à l'exécution » ou « lu dans le code ». Les textes d'écran sont traités comme des sorties (ce que l'application affiche), jamais comme une description de ce qu'elle fait.
4. Découper par écran ou par module, avec des sous-agents en lecture seule.
Le résultat est copié dans « plans de travail/observation/2-observation-aveugle.md » seulement après le scellement du temps 1.

### Temps 3 : comparer sans interpréter
Un analyste qui ne lit que les deux textes les met côte à côte et classe chaque écart : fait sans être prévu ; prévu mais pas fait ; fait autrement. Il n'interprète pas et ne propose aucun correctif. Résultat dans « plans de travail/observation/3-ecarts.md ». L'interprétation revient à Grégoire.

## Limites assumées
- Aveuglement partiel : noms et textes d'écran restent visibles.
- L'analyste arrive avec ses propres attentes sur ce que fait une application pédagogique.
- La préparation est faite par une session qui connaît les intentions ; elle choisit ce qu'elle retire.
- L'exhaustivité est impossible : certains comportements n'apparaissent qu'avec certaines données.

## Ordre
Le temps 1 et la préparation du temps 2 peuvent se faire en parallèle (lecture seule, aucun fichier commun). L'analyse du temps 2 commence quand la copie aveugle est prête. Le temps 3 attend les deux.
