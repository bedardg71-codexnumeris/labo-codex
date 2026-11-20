Pour Claude Code (relais de Cowork, 20 nov. 2026, 18 h 30) : une MESURE EN LECTURE SEULE, puis un plan. Le moteur par objectifs.

Avant de commencer : si une autre session travaille déjà sur cette machine, prends un arbre à part (git worktree add) et dis-le en tête du rapport. Aucun fichier de js/, d'index.html ni de styles.css ne change. Copie d'abord ce relais tel quel dans `plans de travail/CONSIGNE-2026-11-20-moteur-par-objectifs-mesure.md`.

POURQUOI. Trois membres de la communauté de pratique, qui notent par standards, ont dit séparément la même chose à Grégoire : ils veulent garder le meilleur niveau par objectif, et l'application ne le fait pas. Ne les nomme nulle part dans le dépôt : écris « un collègue ». Leurs cas, qui servent de bancs :
- Cas A : 8 objectifs, une échelle à 5 niveaux. Un test porte sur un seul objectif. Un examen de reprise porte sur plusieurs objectifs, et l'élève choisit lesquels il reprend. La reprise est une nouvelle évaluation ; seul le meilleur niveau est gardé, objectif par objectif.
- Cas B : 10 cibles à pondération égale (10 % chacune). Pour 7 d'entre elles, une seule production établit le niveau. Pour les 3 autres, le niveau vient d'observations et de conversations croisées, sans production. La note du cours vient des niveaux retenus.
- Cas C : comme le cas A, avec en plus des sous-objectifs. À garder en vue, pas à concevoir.

DÉCIDÉ PAR GRÉGOIRE (20 nov., 18 h 10 à 18 h 18).
- Une cible est un objectif d'un ensemble d'objectifs, rattaché au cours. Ce n'est pas un critère de grille.
- Le moteur de sa propre pratique ne change pas. Le nouveau vit à côté, comme une pratique de plus.
- Le noyau, en quatre gestes d'enseignant·e, dans cet ordre : (1) je dis quelles cibles compte mon cours ; (2) j'inscris un niveau pour un·e étudiant·e sur une cible, autant de fois que je veux, à partir d'une production ou sans production ; (3) je vois, pour chaque étudiant·e, le niveau retenu par cible, le meilleur ; (4) la note du cours se calcule à partir des niveaux retenus, à pondération égale pour commencer.
- Viendront ensuite, hors de ce plan : une pondération propre à chaque cible ; un double seuil (60 % au sommaire, plus une moyenne de 60 % sur un sous-ensemble de cibles) ; de brèves notes qualitatives par cible ; d'autres règles de retenue (le plus récent, le jugement, une autre mesure de tendance centrale).

DÉCIDÉ PAR COWORK. Chaque inscription d'un niveau est gardée et datée ; aucune n'écrase la précédente (règle de Grégoire du 20 sept. : rien d'effacé de façon irréversible). Le « meilleur » se lit au calcul, il ne s'écrit pas.

CE QUE COWORK A LU (main = e31a8556, sans rien jouer ; à confirmer ou à corriger). Le calcul part d'un résultat par étudiant·e et par production, et retient des productions entières. Un mode « Par objectifs (4 modes de calcul) » a été retiré à la 1.63, parce que le lien production → objectif qu'il supposait n'existait pas (`js/changelog-data.js` vers l. 2610 ; `js/objectifs.js` l. 762 à 768). Restent : les ensembles d'objectifs (`js/objectifs.js`, `objectifsTemplates`) ; `evaluation.metadata.objectifsServis` (`js/planification-carte.js` l. 276) ; `production.objectif` (PDF, rétroaction) ; la reprise ciblée sur un critère avec jeton (`js/evaluation-calcul.js`) ; un gabarit « [STD] Grille par objectifs » (`js/gabarits-utils.js` l. 201). Le tableau de notation accepte un résultat sans grille (`plans de travail/PLAN-2026-11-09-tableau-de-notation.md`). Ton plan du 28 oct. (`plans de travail/PLAN-2026-10-28-standards-sans-portfolio.md`) est le modèle de ce qu'on attend ici.

CE QU'IL FAUT MESURER.
1. Ce qui existe. La forme d'un ensemble d'objectifs et à quoi il se rattache aujourd'hui (cours, pratique, rien) ; qui écrit et qui lit `objectifsServis` et `production.objectif` ; ce qu'il reste du mode retiré dans les pratiques enregistrées et dans le catalogue ; comment la reprise ciblée range ses valeurs.
2. Geste 1. Où une pratique désignerait son ensemble d'objectifs ; ce qu'il faut pour ajouter une pratique au registre à côté des quatre existantes, assistant compris.
3. Geste 2, le plus lourd. Où ranger un niveau par étudiant·e et par cible : dans l'évaluation, ou dans une collection à part. Compare les deux et tranche, avec ta raison. Dis comment chaque forme porte : une production qui renseigne une seule cible ; une production qui en renseigne plusieurs, au choix de l'étudiant·e (cas A) ; un niveau inscrit sans production (cas B). Liste tous les lecteurs d'évaluations qui devraient tolérer la nouvelle forme, et ce qui voyage dans le codex (import, export, rétrocompatibilité).
4. Geste 3. Comment ordonner les niveaux d'une échelle pour dire « le meilleur » ; où ce tableau par étudiant·e pourrait vivre sans entrée de navigation neuve.
5. Geste 4. Le passage du niveau à la note par l'échelle ; tous les lecteurs de la note finale à garder cohérents (profil, comparateur, captures, PDF, export des résultats finaux, dépistage, liste des étudiant·es).
6. L'invariant. Nomme les sentinelles qui épinglent les notes des pratiques actuelles, dont celle de Grégoire, et dis ce qui manque pour que ce chantier ne puisse en déplacer aucune.
7. La place des couches. Sans les concevoir, dis si la forme que tu retiens laisse entrer : un poids par cible, un sous-ensemble de cibles, une note brève par inscription, une autre règle de retenue, des sous-objectifs.

UN BANC JETABLE, hors de la suite, retiré avant le commit : une fonction pure qui prend des inscriptions et rend le niveau retenu par cible et la note, jouée sur le cas A et le cas B avec des données fictives. Des noms manifestement fictifs ; aucun nom réel.

CE QUE TU RENDS : `plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md`. Une vue d'ensemble de dix lignes ; la mesure, avec fichier et ligne ; ce qui est mesuré séparé de ce qui est lu ou inféré ; puis les lots. Chaque lot est UN geste d'enseignant·e : ce que l'utilisateur voit, le geste dans le code, sa sentinelle, les notes qui changent (aucune ne doit changer pour une pratique existante). Les mots que l'enseignant·e ou l'étudiant·e lirait (« cible », « objectif », « standard », « niveau retenu ») : propose-les dans une liste à part, n'en arrête aucun. Les questions de didactique : liste-les à part, avec ta recommandation, sans les trancher.

LIVRAISON. Une branche à toi, `lot/moteur-par-objectifs-plan`, partie de main ; elle ne porte que la consigne et le plan. Aucune fusion. Si le hook refuse le push pour une raison hors de ce mandat, ne contourne pas et dis-le.

RAPPORT : un bloc de code de quinze lignes au plus, pour la conversation du Projet. Le commit ; la forme retenue pour le geste 2 et pourquoi ; ce que Cowork avait mal lu ; le nombre de lots et leur ordre ; ce que le banc a rendu sur les cas A et B ; les questions qui remontent à Grégoire.
