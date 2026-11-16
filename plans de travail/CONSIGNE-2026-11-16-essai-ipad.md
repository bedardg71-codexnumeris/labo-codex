# Consigne — corrections de l'essai de Grégoire sur l'iPad (16 nov. 2026, 12 h 27 à 13 h 13)

> Relais de Cowork, reçu le 16 nov. 2026 (13 h 20), recopié tel quel. Branche `lot/deux-temps-modeles` (`bfd4789f8`,
> PR n° 23). La sentinelle `tests/unit/sentinelle-parcours-je-regarde-2026-11-16.test.js` relit dans ce fichier les
> mots que ce relais change (parties B.2, B.3, B.4, B.6 et B.7).

Pour Claude Code, à relayer — corrections de l'essai de Grégoire sur l'iPad (16 nov., 12 h 27 à 13 h 13), sur lot/deux-temps-modeles (bfd4789f8, PR n° 23)

À ne commencer qu'une fois la démo dans le menu en ligne et son rapport remis. Arbre ../labo-codex-deux-temps. Même règle que ce matin : un passage de tests à la fois, rien en arrière-plan, la charge et la mémoire relevées avant chaque passage.

Grégoire a fait les neuf gestes, l'iPad couché (1180 × 820). Ce qui tient : aucune bulle ne lui a paru trop longue ; la section encadrée et la bulle à côté (« c'est plus clair ») ; la page qui défile (« ça a bougé ») ; les quatre listes de la bulle 5 visibles en paysage. Tes décisions 3.1, 3.2 et 3.3 sont acceptées.

A. UN DÉFAUT
« Découvrir » s'est joué sur le deuxième groupe (601-999-DM · gr. 00002, monté la veille par « Je regarde »), parce que c'est lui qui était choisi dans l'en-tête. La bulle 2 nommait Suricate Loyal, absent de la liste. À corriger : à son ouverture et à chaque reprise, « Découvrir » choisit lui-même le premier groupe de la démo (601-101 · gr. 0demo). Banc avec un deuxième groupe présent et actif ; break-test.

B. LES RETOUCHES DÉCIDÉES PAR GRÉGOIRE
1. Le triangle du compteur est trop petit. Prends le triangle des sections de l'application, à sa taille habituelle ; tout le bloc « n sur N » réagit au doigt.
2. « Découvrir », bulle 2. Les deux premières lignes de la liste deviennent : « Pose le doigt sur le point à l'écart : son nom apparaît » puis « C'est Suricate Loyal. Son assiduité est de 84 % ; celle des autres, de 93 % ou plus ». Le reste ne change pas. À vérifier : sur sa capture de 12 h 42, les étiquettes de la liste ne montraient que les noms, sans « A 84 % », alors que la consigne dit « Touche son « A 84 % » ». Si l'indice n'est pas visible à cette étape, rends-le visible ; ne change pas la consigne sans le dire.
3. La fin de tous les parcours. « Objectif atteint : … » n'est plus une ligne de liste : en gras, entre deux filets, comme l'objectif de la première bulle. Puis « Chaque parcours a son objectif. C'est toi qui choisis la suite. » en ligne simple, juste au-dessus des boutons. « Pour revoir une étape… » reste en petit.
4. « Découvrir », bulle 8 : retire la ligne « Tout repose ici : ton trimestre, tes cours, tes groupes ». Mesure : la bulle doit tenir à 1180 × 820 sans défiler. Vérifie aussi la page derrière : sur sa capture, la section ouverte était « Cours et services » en « Mode modification », alors que la bulle dit l'onglet « Trimestre ».
5. « Je regarde », avant « Remplir » : une seule flèche, de la bulle vers le nom encadré de la section. Après « Remplir », elle s'efface et laisse la place aux flèches des champs. Le cadre reste.
6. « Je regarde », bulle 6 : la consigne nomme le groupe, tel que la liste de l'en-tête l'affiche : « Choisis dans l'en-tête le groupe que tu viens de créer : « 601-999-DM · gr. 00002 » ».
7. Dans la première bulle de chaque parcours, en petit et en gris sous les lignes : « Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir. »

C. CE QUE J'AI VU SUR SES CAPTURES ET QUE JE TE DEMANDE DE CORRIGER
8. En paysage, la bulle ne couvre pas ce dont elle parle. À la bulle 8 de « Je regarde », elle couvre le bout droit de la bande « Assiduité », là où sont les sept points des personnes présentes : on voit les trois points à l'écart, pas le groupe dont ils s'écartent. Les dix points doivent être visibles dans les deux orientations. À la bulle 1 de « Découvrir », elle couvre le nom de la bande, et la seconde flèche finit au milieu de la bande, où il n'y a pas de point : elle doit montrer les points.
9. Bulle 8 de « Je regarde » : un « ; » rejeté en début de ligne (« …étudiant·es / ; la bande… »). Pose l'espace insécable, et vérifie les autres bulles.

D. À VÉRIFIER ET À ME DIRE, SANS RIEN CHANGER
- Sa capture de 12 h 59, juste après « Remettre la démo à neuf » : la bulle « Un cours » est encore dans son état d'avant (bouton « Remplir ») alors que les champs sont déjà remplis et que trois flèches les montrent. Le formulaire garde-t-il ses valeurs après la remise à neuf ?
- Sous « Complétion » et « Performance » du groupe neuf : « 1 évaluation en attente » et « 3 évaluations en attente ». D'où viennent-elles ?
- « Voir le parcours suivant », à la fin de « Découvrir », quand le modèle est déjà fait : il a ouvert la bulle 6, puis le parcours s'est joué en visite. Dis ce qui se passe exactement et si un novice peut s'y perdre.

HORS DE CE RELAIS : « Nous faisons », « Évaluer une première production », les six autres parcours. Pas de fusion ni de release.

CE QUE J'ATTENDS : Vitest complet ; les bancs des deux parcours en portrait et en paysage ; un break-test pour le défaut et pour la règle 8 ; les hauteurs des seize bulles dans les deux orientations. Push de la branche. Rapport court : le commit, le build de l'aperçu, tes réponses aux trois points du D, ce que tu as supposé. Une porte très courte pour Grégoire : seulement ce qui a changé.
