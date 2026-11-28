# Textes à relire – numériser un devis ministériel dans « Apporter mon matériel »

> Écrit par Claude Code le 28 novembre 2026, refait à 9 h 00 (Toronto) après le correctif de 8 h 08 (« numériser ne touche aucun cours »), mis à jour à 10 h 20 après le second amendement de 10 h 03, puis à 10 h 40 pour le lot « créer un cours à partir d'un devis rangé » (textes 51 à 70, neufs, à relire).
> **État** : les textes 1 à 39 sont acceptés par Grégoire tels quels, sauf 14, 17, 19 et 28, retouchés par lui (posés ci-dessous, mot pour mot). Les textes 40 à 50 sont neufs, à relire. Règle à tenir : l'application parle d'elle à la troisième personne, et un texte ne laisse pas entendre que l'erreur vient de l'enseignant·e.
> Ce sont des MOTS DE TRAVAIL : ils sont sur la branche `claude/devis-ministeriel-8vylul`, pas en ligne. Corrige-les d'un bloc ; chaque texte porte un numéro pour que tu puisses répondre « 7 : … ».
> Vocabulaire du devis gardé tel quel : « compétence », « éléments de la compétence », « critères de performance », « contexte de réalisation », « activités d'apprentissage ».
> Où ils vivent dans le code : l'entrée de l'accueil dans `index.html` (textes 1 à 3) ; le texte 39 dans `js/codex.js` ; le texte 40 dans `index.html` ; tous les autres dans la table `T`, en tête de `js/materiel-devis.js`.

## A. L'accueil d'« Apporter mon matériel »

1. **Titre de l'entrée** : « Tes devis ministériels »
2. **Phrase sous le titre** : « Colle le devis d’une compétence, copié du PDF du ministère. L’application y lit le numéro de la compétence, son énoncé, ses éléments et leurs critères de performance, puis le range parmi tes devis. Aucun cours n’est touché : tu y puiseras en créant un cours. »
3. **Bouton** : « Numériser un devis »
4. **Titre de la liste, quand au moins un devis est rangé** : « Tes devis rangés »
5. **Une rangée de la liste** : « **4EF0** Analyser des textes littéraires. 6 éléments, 17 critères de performance », et son bouton « Rouvrir » (lu « Rouvrir le devis 4EF0 »)

## B. Coller

6. **Titre de l'écran** : « Numériser un devis ministériel »
7. **Introduction** : « Colle ici le devis d’une compétence : tu verras ce qui a été lu, tu corrigeras au besoin, puis tu le rangeras parmi tes devis. Il ne touche aucun cours : c’est à la création d’un cours que tu viendras y puiser. Rien ne s’enregistre avant ton accord. »
8. **Bouton de sortie** (sur tous les écrans du devis) : « Revenir à l’accueil »
9. **Étiquette de la zone** : « Colle ton devis ici »
10. **La consigne de copie** : « Dans le PDF du ministère, sélectionne tout le devis de la compétence, toutes ses pages comprises, copie-le d’un seul geste, puis colle-le (⌘ V). »
11. **Bouton principal** : « Lire mon devis »
12. **Bouton secondaire** : « Composer le devis à la main » (ouvre la même feuille, vide ; ajout de Claude Code, à retirer si tu n'en veux pas)

## C. Les messages

13. **Zone vide** : « Il n’y a rien à lire. Copie ton devis dans le PDF du ministère, puis colle-le dans la zone. »
14. **Rien de reconnaissable dans le collage** : « L’application n’a rien reconnu d’un devis dans ce que tu as collé : ni « Code : », ni « Énoncé de la compétence », ni élément numéroté. Vérifie que tu as copié le devis en entier, ou compose-le à la main. »
15. **Pas de numéro au moment de ranger** : « Donne le numéro de la compétence avant de ranger ce devis : c’est par lui qu’il se retrouve. »
16. **Un devis rouvert reçoit le numéro d'un autre devis rangé** : « Un autre devis rangé porte déjà ce numéro. Corrige le numéro, ou rouvre l’autre devis depuis l’accueil. »
17. **Quitter une lecture non rangée** (question du navigateur, sur « Revenir à l’accueil » et « Coller un autre devis ») : « Ta lecture corrigée n’est pas rangée : elle sera perdue. Continuer ? »
18. **L'écriture a échoué** : « Le devis n’a pas pu être rangé. Rien n’a changé ; essaie de nouveau. »

## D. La lecture et sa correction

19. **Titre** : « Voici ce que l’application a lu » (et « Ton devis rangé » quand on rouvre un devis)
20. **Consigne** : « Compare avec ton devis. Retouche un texte en écrivant dedans. Pour une ligne mal rangée, choisis où elle va dans son menu « Déplacer ». Rien n’est enregistré tant que tu n’as pas rangé le devis. »
21. **Ligne de compte** : « Lu : 6 éléments, 17 critères de performance »
22. **Intitulés de la feuille** : « Numéro de la compétence », « Énoncé de la compétence », « Contexte de réalisation », « Éléments de la compétence », « Critères de performance », « Activités d’apprentissage »
23. **Les cinq champs des activités d'apprentissage** : « Discipline », « Pondération », « Unités », « Heures ou périodes », « Précisions », et leur phrase : « Quand le devis les porte (en formation générale). Laisse vide ce qu’il ne dit pas. »
24. **Zones vides** : « Aucune ligne. Ce devis n’a peut-être pas de contexte de réalisation. » · « Aucun élément lu. » · « Aucun critère de performance sous cet élément. »
25. **Boutons d'ajout** : « Ajouter une ligne au contexte » · « Ajouter un critère » · « Ajouter un élément »
26. **Boutons d'un élément** : « ↑ » (lu « Monter l’élément 3 ») · « ↓ » (lu « Descendre l’élément 3 ») · « Retirer cet élément »
27. **Le menu d'une ligne** : « Déplacer… », avec deux groupes, « Cette ligne seulement » et « Cette ligne et les suivantes », et ces destinations : « Vers le contexte de réalisation » · « Sous l’élément 2 : Saisir le sens d’un message lu. » · « Retirer (mettre de côté) » · « En faire un élément » (pour une ligne mise de côté)
28. **Le tiroir du bas** : « Lignes mises de côté (15) », et sa phrase : « Ce qui ne fait pas partie de la compétence (pied de page, en-tête) ou que tu as retiré. Rien de ceci ne sera rangé. Une ligne mise de côté à tort se replace par son menu « Déplacer ». »
29. **Ce que l'écran annonce après un geste** (ligne discrète, lue par un lecteur d'écran) : « 7 lignes déplacées vers le contexte de réalisation. » · « 3 lignes déplacées vers l’élément 1. » · « 1 ligne déplacée vers les lignes mises de côté. » · « Ligne devenue l’élément 5. » · « Élément 2 retiré : son texte et ses critères sont mis de côté. » · « Élément monté. » · « Élément descendu. » · « Dernier geste annulé. »
30. **Boutons du pied** : « Ranger ce devis » · « Annuler le dernier geste » · « Coller un autre devis »

## E. Un devis du même numéro est déjà rangé

31. **Titre** : « Un devis de ce numéro est déjà rangé »
32. **Phrase** : « Si tu acceptes, ce que tu apportes remplace le devis déjà rangé. Tes autres devis et tes cours ne changent pas. »
33. **Les deux colonnes** : « Le devis déjà rangé » · « Ce que tu apportes » ; une rubrique vide dit « Rien »
34. **Boutons** : « Remplacer le devis déjà rangé » · « Revenir à ma lecture »

## F. La confirmation

35. **Titre** : « Ton devis est rangé »
36. **Phrase** : « Le devis 4EF0 est rangé parmi tes devis, avec 6 éléments et 17 critères de performance, et son contexte de réalisation. Aucun cours n’a changé : tu y puiseras en créant un cours. » (« et son contexte de réalisation » ne paraît que s'il y en a un)
37. **Boutons** : « Numériser un autre devis » · « Revenir à l’accueil »
38. **Le témoin commun** dit « Enregistré » ; le geste qu'il nomme en cas d'échec : « Ranger le devis »

## G. Ailleurs dans l'application

39. **Dans la fenêtre de fusion d'un codex** (quand deux appareils ont des devis différents), la réserve se nomme : « tes devis ministériels », réglée dans « Conception › Apporter mon matériel », et une de ses entrées s'appelle « devis ».

## H. Second amendement (28 nov., 10 h 03) : mots de travail neufs

40. **Bouton dans l'en-tête de l'étiquetage d'une grille** : « Mes devis ministériels »
41. **Bouton de sortie des écrans du devis, quand une grille est en brouillon dans l'étiquetage** : « Revenir à mon étiquetage » (à la place de « Revenir à l’accueil » ; les mêmes mots que le bouton déjà validé de la confirmation d'une grille)
42. **Sous « Tes devis rangés », dans la démonstration** : « Tu es dans la démonstration : les devis que tu ranges ici restent dans la démonstration. »
43. **Bouton sous la liste des devis rangés** : « Exporter mes devis », et sa phrase : « Un fichier à passer à un·e collègue, qui l’ouvre par « Importer » : il ne porte que tes devis. » (ajout de Claude Code : sans lui, rien ne produit un fichier qui ne porte que les devis)
44. **Dans la fenêtre de l'import par cases, le titre de la section** : « Devis ministériels », suivi de « Les devis numérisés que porte ce fichier »
45. **Une rangée de cette section** : « **01FB** Traduire un matériau musical. 2 éléments, 8 critères de performance », suivie de son état : « nouveau » ou « déjà rangé chez toi, identique : rien à importer »
46. **Quand le code est déjà rangé avec un autre contenu** : « Un devis de ce numéro est déjà rangé chez toi, et son contenu diffère. Compare les deux ; il ne sera remplacé que si tu coches cette case. »
47. **Le volet de comparaison** : « Comparer les deux devis », avec les colonnes « Ton devis rangé » et « Le devis du fichier »
48. **Sous la section** : « Un devis importé se range parmi tes devis. Aucun cours n’est touché. »
49. **Dans le message de fin de l'import** (la ligne s'ajoute aux autres) : « 1 devis ministériel(s) » (la forme « (s) » est celle des autres lignes de ce message, que je n'ai pas touchées)
50. **Le nom du fichier exporté** : `devis-ministeriels-2026-11-28.json`

## I. Créer un cours à partir d'un devis rangé (lot du 28 nov., 10 h 05) : mots de travail neufs

Tous dans la table `T`, en tête de `js/cours-devis.js`. Ils paraissent dans Cadre › « Cours et services », sur la fiche d'un cours.

51. **Le nom de la liste des devis** : « Devis ministériel »
52. **Son option par défaut** : « Aucun (tout remplir à la main) »
53. **Une option de la liste** : « 4EF0 – Analyser des textes littéraires. »
54. **Sous la liste** : « Choisis un devis rangé : l’application proposera ses valeurs, que tu confirmeras une à une. »
55. **Quand aucun devis n'est rangé** (à la place de la liste) : « Aucun devis ministériel n’est rangé. Si tu en numérises un dans Conception › Mon matériel, l’application proposera ici ses valeurs. »
56. **Titre des propositions** : « Ce que le devis propose »
57. **Leur consigne** : « Rien n’est écrit dans le cours tant que tu n’as pas confirmé. « Autre » te laisse le champ pour reformuler ou écrire ta propre valeur. »
58. **Les noms des propositions** : « N° de la compétence », « Compétence », « Pondération », « Heures d’enseignement », « Éléments de compétence » (les mêmes que les libellés de la fiche)
59. **Les deux gestes d'une proposition** : « Confirmer » · « Autre »
60. **L'état d'une proposition** : « À confirmer » · « Confirmé » · « Autre : à écrire dans le champ »
61. **Titre des repères** : « Repères du devis »
62. **Le repère de la discipline** : « Discipline, d’après le devis : **Français, langue d’enseignement et littérature** Choisis la discipline dans le menu. »
63. **Le repère des heures** (quand le devis ne donne pas un nombre seul) : « Heures ou périodes, d’après le devis : **…** »
64. **Le repère de la pondération** (quand le devis n'écrit aucune pondération « n-n-n ») : « Pondération, d’après le devis : **…** »
65. **Les gestes sur un élément** : « Garder » · « Reformuler » · « Retirer »
66. **L'état d'un élément** : « À confirmer » · « Gardé » · « Reformulé » · « Retiré » · « Ajouté »
67. **Ajouter** : le bouton « Ajouter un élément » ; le champ vide dit « Nouvel élément »
68. **Le bilan, sous les propositions** : « 3 propositions sont restées sans réponse : elles ne seront pas écrites dans le cours. » · « 1 proposition est restée sans réponse : elle ne sera pas écrite dans le cours. » · « Toutes les propositions ont reçu une réponse. »
69. **Sur la fiche d'un cours créé à partir d'un devis** : « Ce cours a été créé à partir du devis 4EF0. » suivi du lien « Voir le devis 4EF0 dans « Apporter mon matériel » »
70. **Quand ce devis n'est plus rangé sur l'appareil** : « Ce cours a été créé à partir du devis 4EF0, qui n’est pas rangé sur cet appareil. »
