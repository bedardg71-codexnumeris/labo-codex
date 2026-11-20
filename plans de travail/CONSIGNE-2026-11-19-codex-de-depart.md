> Consigne de la branche d'essai `apercu/essai-parcours` (20 nov. 2026) : copie mot pour mot du mandat remis par
> Cowork le 19 nov. 2026 à 20 h 30, « Pour Claude Code, à relayer ». Cette branche ne se fusionne jamais vers `main`.

Pour Claude Code, à relayer — Codex de départ pour l'essai des cinq parcours (Cowork, 19 nov. 2026, 20 h 30)

BUT
Grégoire doit essayer sur l'iPad les cinq parcours codés ce soir (« Nous faisons » des parcours 2, 4, 6 et 5 ; « Je regarde » du parcours 5). En pratique guidée, chaque parcours suppose ce que les précédents ont laissé : dans un aperçu à base vide, il devrait tout refaire avant chaque essai. On veut qu'il ouvre l'aperçu, ouvre un fichier, lance le parcours.

CE QUI EST DEMANDÉ
1. Écris d'abord la consigne dans le dépôt : plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md.

2. Une branche d'essai, apercu/essai-parcours, depuis origin/lot/nous-faisons-donnees (e259204e), dans laquelle tu fusionnes origin/lot/je-regarde-cours (a28b133e). PARCOURS_OUVERTS y porte decouvrir, classe, evaluer, recevoir, monter, donnees. Cette branche ne sera JAMAIS fusionnée vers main : dis-le en tête de sa PR (« ESSAI, ne jamais fusionner »). N'ajoute aucun commit aux branches de lot. Si la fusion n'est pas triviale (autre chose que BACKLOG.md, les jetons de cache d'index.html et PARCOURS_OUVERTS), arrête-toi là, dis ce qui se heurte, et fais les points 3 à 6 séparément sur deux branches d'essai, une par aperçu.

3. Au passage, puisque la fusion réunit le moteur de la session A et le parcours 5 : mesure si les bulles de « Monter ton cours » prennent bien la flèche devant chaque geste et la parenthèse hors du gras. Réponse au rapport ; ne corrige rien dans les textes.

4. Un script sous tests/ (durable, il resservira pour les parcours 7, 8 et 9) qui fabrique un codex de départ par parcours, à partir des aides des bancs (classe-de-banc.js : mettreLaClasseEnPlace et ce qui existe pour la suite). Chaque codex s'arrête exactement là où le parcours commence, avec tout ce que les parcours précédents auraient laissé :
   - départ du parcours 4, « Recevoir les productions » : la classe en place et une production prête à recevoir (grille, échelle, cartouche) ;
   - départ du parcours 5, « Monter ton cours », « Nous faisons » : ce que sa première bulle suppose (à mesurer dans le code du parcours) ;
   - départ du parcours 6, « Mettre tes données à l'abri » : un espace qui a quelque chose à mettre à l'abri ;
   - le parcours 2 part d'un espace vide : pas de fichier, mais dis au rapport comment Grégoire remet l'aperçu à vide entre deux essais.
   Mesure, pour chaque parcours, ce que son code exige vraiment au départ, et ajuste la liste : c'est toi qui tranches le contenu de chaque fichier, et tu le dis au rapport en une ligne par fichier.
   Les noms des étudiant·es, du cours et de l'enseignant·e sont manifestement fictifs (ceux de la démo conviennent). Aucun nom réel, aucune donnée de Grégoire.

5. « Je regarde » du parcours 5 se joue dans la démo et son refus dit de commencer par la Modélisation d'« Évaluer une première production ». Mesure ce qu'il faut pour le lancer directement dans l'aperçu d'essai, et le chemin le plus court pour Grégoire. Si un codex ne peut pas porter cet état, dis-le et propose le geste le plus court ; n'ajoute pas de porte dérobée dans l'application.

6. Dans l'aperçu d'essai seulement : une page departs.html à la racine, qui nomme chaque fichier par le parcours qu'il prépare, en mots d'utilisateur (« Départ : Recevoir les productions »), avec un lien pour le télécharger. Mesure ensuite le geste d'ouverture sur l'iPad en toucher simulé (Chromium, portrait et paysage) : de la page departs.html jusqu'à la première bulle du parcours, combien de touchers, et où ça accroche. Si l'ouverture d'un codex dans une base vide demande plus de cinq ou six touchers, dis-le et propose plus court, sans le coder.

7. Un banc par fichier : le codex s'ouvre dans une base vide, le parcours visé se lance, sa première bulle paraît sans refus. Avec break-test (un codex tronqué fait rougir le banc). Vitest complet et Chromium sur ce qui est touché.

LIMITES
Ni fusion vers main, ni release, ni retouche des textes des bulles. Rien dans main, sauf l'entrée de RELAIS.md. Les bancs laissés rouges par les sessions A et B restent tels quels : ne les corrige pas ici, nomme seulement ceux qui gênent un codex de départ.

RAPPORT
plans de travail/RAPPORT-2026-11-19-codex-de-depart.md, en français. En tête, pour Grégoire, en gestes d'utilisateur : l'adresse de l'aperçu d'essai, puis pour chaque parcours « ouvre tel fichier, lance tel parcours ». Ensuite : ce que tu as supposé, ce que tu as mesuré (points 3, 5 et 6), ce qui reste à décider. Les identifiants seulement entre parenthèses, en fin de ligne.
