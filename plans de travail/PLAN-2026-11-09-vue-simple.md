# Vue simple : plan de codage, révisé (9 nov. 2026, 17 h 38)

> Révision par Cowork (coordination) du plan écrit le même jour dans le Projet. Rien ici n'est une mesure du code de la navigation. Ce que Cowork a mesuré aujourd'hui porte sur le tableau de notation (branche `lot/tableau-de-notation-1-bis`, captures et rapport) et sur l'ébauche (toile « Vue réduite : ébauches », lue à 17 h 20). Les passages changés ou ajoutés sont marqués **(révisé)** ou **(ajouté)**.

## Pourquoi (révisé)

**Le besoin, formulé à la rencontre de la communauté de pratique du 9 nov. au matin** : les enseignants qui appliquent une pratique alternative de notation veulent passer de résultats non sommatifs à une note chiffrée finale, et la plupart sont rebutés par les tableurs.

**Le constat de Grégoire** : une centaine de personnes sont entrées dans Labo Codex ; personne d'autre que lui ne s'en sert. L'application est chronophage, complexe, et fait plus que ce qu'on lui demande.

**La réponse** : revenir à ce qui a fait naître Labo Codex en 2024, un outil qui convertit des résultats en note. La vue simple n'a qu'une fonction : gérer une pratique alternative de notation. La vue étendue donne accès à tout le reste. Deux modes d'utilisation, novice et expert.

Principe : alléger, pas ajouter ; masquer, jamais retirer.

**Ce que ce choix coûte, et qu'on assume (ajouté)** : une seconde surface permanente. Tout écran, tout message et tout parcours d'assistance à venir devra dire dans quelle vue il paraît. Ce n'est pas une expérience qu'on résorbe : c'est la porte d'entrée de l'application.

## Arrêté par Grégoire (9 nov.)

- **Deux vues : « Vue simple » et « Vue étendue ».** La bascule vit dans le menu en haut à droite, pas dans l'en-tête.
- **Le menu en vue simple (révisé, 17 h 25)** ne porte qu'une ligne : « Vue étendue ». « Assistance » en est retirée pour la première version : la vue simple n'a pas de parcours d'assistance (voir plus bas). La bascule reste dans le menu, pas dans l'en-tête.
- **Le menu en vue étendue** reste celui de l'esquisse 73 (Assistance, Aide, Signaler, Soutenir, Réglages), puis, sous un filet, « Vue simple ».
- **La règle de la vue simple (révisé, 17 h 20) : elle ne nomme rien qui n'existe pas dans les données de l'utilisateur.** Elle remplace « aucune référence à la vue étendue », qui butait sur le tableau : une case évaluée avec une grille s'y affiche, et la toucher ouvre l'évaluation. Ces cases n'existent que chez quelqu'un qui a des grilles. Un novice ne voit donc aucun mot de la vue étendue ; Grégoire, en vue simple, voit ses grilles sans contradiction. La règle lit les données, pas l'histoire de qui les a créées : celui qui a ouvert le codex d'un collègue a des grilles.
- **La règle vaut aussi pour les textes fixes (ajouté, 17 h 20).** Au tableau, la légende « Point : évaluée avec une grille » ne paraît que s'il existe une case évaluée avec une grille. La phrase « … il n'a pas de critères : il ne donne ni forces, ni défis, ni rétroaction par critère. » se masque quand l'utilisateur n'a aucune grille.
- **Titre de l'accueil simple : « Ta notation alternative ».**
- **Le design est celui de l'application**, pas celui des premières ébauches.
- **Le novice nomme ses productions depuis le tableau (ajouté, 16 h 51)**, par « + Production » : pas de carte à part. L'accueil garde ses quatre cartes.
- **Autorisation de toucher à `js/config.js` et `js/navigation.js` pour ce lot (17 h 26)**, bornée : la session n'y ajoute que le masquage selon la vue, et un banc prouve que la navigation de la vue étendue est identique avant et après. Rien d'autre n'y change.
- **En vue simple, le bouton de l'en-tête s'appelle « Sauvegarder » (ajouté, 17 h 21)**, pas « Codex » : il dit le geste, pas le nom de l'objet. Même place, même point d'état. En vue étendue, il reste « Codex ».

## Décidé par Claude (à contester si la mesure dit mieux)

- **Vue par défaut (révisé).** Simple quand l'application est vide sur cet appareil ; étendue dès qu'elle porte des données. Ensuite, le choix de l'utilisateur prime et reste sur l'appareil. **« Vide » veut dire : aucun groupe avec au moins un élève, dans aucun trimestre. Le mode démo ne compte pas comme des données. Un codex ouvert ou importé compte.** À confirmer par la mesure de ce que le code sait reconnaître.
- **La sauvegarde et le thème restent dans l'en-tête de la vue simple.** Les données ne vivent que dans le navigateur : un novice qui ne verrait plus la sauvegarde risquerait de tout perdre.
- **Basculer ne touche à aucune donnée.** On masque des entrées ; on ne supprime, ne convertit ni ne déplace rien.
- **Ordre des lots : voir « Calendrier », arrêté par Grégoire à 17 h 30.** La vue simple reste la coquille de l'« entrée allégée » (lot 2 du tableau de notation) et repose sur le lot 1 du tableau.
- **Pas de parcours d'assistance en vue simple, pour la première version (17 h 25, décision de Grégoire sur recommandation de Cowork).** L'accueil est déjà un parcours : quatre cartes numérotées, de la liste à la note. Le parcours 9 écrit les 8 et 9 nov. (« Mettre en place ta notation alternative », onze bulles) reste tel quel et reste celui de la vue étendue : il guide une évaluation avec une grille (fiche de la pratique, groupe-cours actif, « Actions › Évaluer », Dossier PDF) et ne peut pas servir au novice. La « seconde porte » prévue serait en fait un autre parcours, avec ses bulles à écrire et à valider : on ne l'écrit qu'après avoir vu où de vrais utilisateurs bloquent, et seulement à ces endroits. Les parcours « Découvrir » et « Mettre ta classe en place » restent ceux de la vue étendue.

## Le parcours à rendre possible, en gestes (révisé)

1. Un nouvel arrivant ouvre l'application : vue simple, accueil à quatre cartes.
2. Il colle sa liste d'élèves (DA, nom, prénom) ; trimestre, cours et groupe se créent en coulisse.
3. Il choisit un modèle (standards ou spécifications) et la règle qui construit la note.
4. **Il nomme ses productions depuis le tableau (ajouté)**, par « + Production » : une ligne par production, un nom et une date, rien d'autre. Chacune devient une colonne. Le plan d'origine sautait ce geste ; or le tableau du lot 1 ne montre que les productions qui existent et qui entrent dans la note. **Un tableau sans colonne ne reste pas muet** : il dit quoi faire et montre « + Production ».
5. Il inscrit ses résultats au tableau.
6. Il voit la note de chaque élève et exporte le CSV.
7. **Il sauvegarde (ajouté)** : le bouton « Sauvegarder » lui explique que ses données restent dans ce navigateur, et lui remet un fichier.
8. Il passe à la vue étendue : il y retrouve sa classe, sa pratique et ses résultats, sans perte ni doublon.
9. Il revient à la vue simple : idem.

## Le passage vers la vue étendue (ajouté)

C'est le moment où la porte d'entrée tient sa promesse ou la trahit. Le novice arrive dans la vue étendue avec un trimestre né en coulisse : pas d'horaire, pas de calendrier, pas de grille, des productions sans consigne.

- **À mesurer avant de coder** : ce que chaque section de la vue étendue affiche devant un tel trimestre (Accueil, Cadre, Conception, Évaluation, Suivi, présences, dépistage). Une liste, section par section : tient, vide sans explication, ou erreur.
- **La règle** : aucune section ne montre une erreur ni un écran vide muet. Une section à qui il manque une information dit laquelle, et où la donner.
- **Ce que le trimestre né en coulisse contient** se décide par cette mesure : le minimum pour que rien ne casse, et rien d'inventé qui ressemblerait à une donnée de l'enseignant (pas de faux horaire).
- **L'hypothèse à ne pas confondre avec le besoin** : la communauté a demandé la vue simple. Que ses usagers passent ensuite à la vue étendue est une hypothèse de Grégoire. Le lot rend ce passage sûr ; il ne dépend pas de lui pour être utile.

## À mesurer au code (Claude Code)

- Où la navigation est définie et comment masquer des sections sans les retirer. `js/config.js` et `js/navigation.js` sont des zones protégées : autorisées pour ce lot, dans la borne dite plus haut.
- Comment reconnaître une application vide sur l'appareil (voir la définition plus haut).
- **La liste des mots à chercher sur un parcours de novice (révisé).** La règle se prouve sur des données de novice (une liste, une pratique, des productions nommées au tableau, des résultats sans grille) : aucun écran atteignable n'y dit horaire, congé, calendrier, grille, critère, cartouche, annotation, présence, dépistage, portfolio, artefact, codex (hors de la phrase qui l'introduit). Liste à compléter par la mesure et à faire valider par Grégoire. Cas réel du 9 nov. : le tableau disait « Aucun artefact du portfolio n'est encore évalué. », remplacé par « Aucune production n'est encore évaluée. ».
- Tout ce qu'un utilisateur en vue simple peut atteindre par un chemin détourné (lien direct, bouton commun, parcours d'assistance, message venu du code partagé) : chaque écran atteignable tient sans ces mots.
- **Ce que le bouton de sauvegarde ouvre aujourd'hui (ajouté)** : un panneau ou un export direct, et où la phrase d'introduction peut s'afficher. Ce que le point d'état veut dire, et s'il se comprend sans légende.
- **Ce que « + Production » crée (ajouté)** : la production la plus légère que le reste du code accepte, et ce que la vue étendue (Conception) en montre ensuite.
- Plusieurs groupes : en vue simple, un sélecteur de groupe doit exister sur Résultats et Note finale. Il est absent des ébauches.
- Un utilisateur qui a des données de la vue étendue et passe en vue simple : proposé, il y voit ses groupes dont la pratique est par standards ou par spécifications ; pour les autres, un mot dit pourquoi.
- **Le sélecteur de trimestre (ajouté)** : sur les captures du tableau, l'en-tête montre « Sélectionne un trimestre ». En vue simple, le trimestre naît en coulisse : dire ce que devient ce sélecteur.
- **L'iPad à la verticale (ajouté)** : à 820 px, le tableau du lot 1 coupait des colonnes sans le montrer (corrigé par relais le 9 nov.). Les quatre écrans de la vue simple se jugent à 1180 et à 820 px.

## Preuve exigée

- Playwright (Chromium) : la bascule aller-retour n'écrit rien dans les données (compte et empreinte avant et après) ; le parcours 1 à 9 avec des données fictives ; la recherche des mots de la liste dans chaque écran atteignable en vue simple, sur des données de novice.
- **Playwright (ajouté)** : en vue simple, aucun parcours d'assistance ne se lance ni ne se propose, et le menu ne porte que « Vue étendue ».
- **Playwright (ajouté)** : avec des données qui contiennent une grille, la légende du point et la phrase sur les critères paraissent ; sans grille, elles ne paraissent pas.
- **Playwright (ajouté)** : après le parcours, chaque section de la vue étendue s'ouvre sur le trimestre né en coulisse sans erreur en console et sans écran vide muet.
- **Banc (ajouté)** : la navigation de la vue étendue (entrées, ordre, sous-sections) est identique avant et après le lot.
- Vitest pour la règle de la vue par défaut, y compris le mode démo et le codex importé.
- À faire par Grégoire : l'iPad et Safari.

## Calendrier (arrêté par Grégoire, 9 nov., 17 h 28 à 17 h 30)

- **On termine les parcours d'assistance, puis on enchaîne avec la vue simple.** Les parcours et le tableau de notation (lot 1) passent au groupe 3 des verdicts.
- **Vendredi 27 novembre** : Grégoire présente la vue simple à une communauté de pratique sur les pratiques alternatives de notation.
- **Le 10 ou le 11 novembre (Grégoire, 17 h 32)** : la vue simple est produite. Pour le tenir, une session cloud « Vue simple » a été lancée le 9 nov. à 17 h 36 sur `lot/vue-simple`, partie de `lot/tableau-de-notation-1-bis`, en parallèle des parcours. Visé : une branche avec des captures à juger le 11 ; la mise en ligne dépend en plus d'un verdict sur le Mac.
- **Avant le 27** : de vrais utilisateurs l'ont essayée. À rebours (proposé par Cowork) : en ligne au plus tard le vendredi 20 novembre, pour laisser une semaine d'essai et de corrections.
- **Les crédits ne sont plus une contrainte** (forfait changé le 9 nov.) : la mesure du code, en lecture seule, peut tourner en parallèle des parcours.
- **Supposé par Cowork, à confirmer** : le groupe 4 (copie non recevable, production plutôt que copie, deux liens) passe après la vue simple, sauf si son verdict trouve une place sans la retarder.

## Comment on saura que ça répond au besoin (révisé, 17 h 28)

Le constat de départ est un chiffre d'usage : une centaine d'entrées, un seul usager. La mesure du lot est de même nature, et elle ne se lit pas dans un banc : **d'ici au 27 novembre, de vrais utilisateurs entrent un vrai groupe dans la vue simple et sortent leurs notes, sans l'aide de Grégoire.** Là où il doit expliquer un écran, il faudra un mot ou une bulle. Qui ils sont et combien : à Grégoire.

## Les mots

- Validés : « Vue simple », « Vue étendue », « Ta notation alternative », « Sauvegarder » (le bouton, en vue simple).
- Proposés : la navigation simple (Accueil, Classe, Pratique, Résultats, Note finale), le texte des quatre cartes, « Quatre étapes, de ta liste d'élèves à ta note finale. », les sous-lignes du menu « Toutes les fonctions » et « Ta notation seulement ».
- **Validée (17 h 23)**, mot pour mot, la phrase qui introduit le mot « codex » à l'ouverture du bouton : « Tes données restent dans ce navigateur. Enregistre-les dans un fichier, ton codex, pour ne pas les perdre et pour les rouvrir ailleurs. »
- **À proposer (ajouté)** : la phrase du tableau sans colonne.

## N'entre pas

Le changement de nom et d'adresse ; l'import CSV des résultats (lot 3 du tableau) ; tout effacement de données.

## En attente de Grégoire

- **Les essayeurs d'avant le 27 novembre** : qui, et combien.
- **Le groupe 4** : après la vue simple (supposé), ou avant.
