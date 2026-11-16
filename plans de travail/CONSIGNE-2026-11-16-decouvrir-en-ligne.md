# Consigne — « Découvrir » seul en ligne, l'interrupteur d'« Apporter mon matériel » éteint par défaut (16 nov. 2026)

> Relais de Cowork, reçu le 16 nov. 2026 (demande de Grégoire, 15 h 48), recopié tel quel. Suite du relais de 13 h 20
> (`CONSIGNE-2026-11-16-essai-ipad.md`), dans la même session, arbre `../labo-codex-deux-temps`.

Pour Claude Code, à relayer — suite du relais de 13 h 20 : « Découvrir » en ligne le plus tôt possible, et l'interrupteur d'« Apporter mon matériel » éteint par défaut

Demande de Grégoire, 16 nov., 15 h 48. À faire dans la même session que les corrections du relais de 13 h 20, arbre ../labo-codex-deux-temps, une fois ces corrections faites. La branche reprend d'abord main (baddec78f : la 1.248.3, la baseline, les fiches 36 et 37). Un passage de tests à la fois, rien en arrière-plan.

A. « DÉCOUVRIR » SEUL EN LIGNE
1. Le verrou PARCOURS_OUVERTS ne sait que tout ou rien : fais-le ouvrir « Découvrir » seul. Les autres parcours restent fermés, « À venir » dans le panneau « Assistance », y compris « Mettre ta classe en place ».
2. « Découvrir » part avec le défaut corrigé (il choisit lui-même le premier groupe de la démo) et les retouches du relais de 13 h 20 qui le touchent. Le moteur de la branche vient sur main avec lui.
3. Tant que les autres sont fermés, sa dernière bulle n'offre que « Explorer la démo par moi-même » et « Terminer ». Pas de « Voir le parcours suivant ».
4. Aucun chemin ne doit mener à un parcours fermé : vérifie les entrées (panneau, porte de l'accueil, reprise, fin de parcours) et couvre-les d'un essai avec break-test.
5. La phrase de la carte « À propos » sur les parcours à venir reste telle quelle.

B. L'INTERRUPTEUR « M'accompagner pour étiqueter ma grille » (js/materiel-aide.js)
1. Nouvelle règle : éteint à la première arrivée dans la page ; ensuite il garde l'état où la personne l'a laissé. La règle du 12 nov. (ouvert à chaque arrivée tant qu'aucune grille n'est créée) est retirée, pas empilée : retire aussi ce qui ne sert plus qu'à elle (grilleCreee, le cas navigator.webdriver) si plus rien ne le lit.
2. Seul un geste de la personne sur l'interrupteur compte comme un choix. Stock : dis dans ton rapport ce que retrouve quelqu'un qui a déjà laboCodex.aideMateriel chez lui, selon ce que la clé contient. N'écris rien dans le stockage pour le réparer.
3. Pendant un parcours, rien ne change : l'interrupteur ne se montre pas.
4. Réaligne l'en-tête du fichier et les bancs de la page ; break-test sur la nouvelle règle.

C. LA MISE EN LIGNE
Une seule release pour A et B (choisis patch ou minor selon le skill release-et-changelog, pas de major). Fusion --no-ff dans main, verdict complet sur le Mac en morceaux AVANT le push, comme pour la 1.248.3. Hors fenêtre, à la demande de Grégoire. Puis vérifie le déploiement, écris RELAIS.md.

Lignes proposées pour les Nouvelles, en attente de l'accord de Grégoire (Cowork te le confirme) :
- « Le parcours « Découvrir » est de retour : huit bulles te font visiter la démo. »
- « Dans « Apporter mon matériel », l'interrupteur « M'accompagner pour étiqueter ma grille » est maintenant éteint à ton arrivée. Allume-le quand tu veux être guidé·e. »

Arrête-toi et rapporte si un rouge hors du lot apparaît au verdict, ou si ouvrir « Découvrir » seul demande de toucher js/config.js ou js/navigation.js.
