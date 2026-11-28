# Textes à relire – numériser un devis ministériel dans « Apporter mon matériel »

> Écrit par Claude Code le 28 novembre 2026, refait à 9 h 00 (Toronto) après le correctif de 8 h 08 (« numériser ne touche aucun cours »).
> Ce sont des MOTS DE TRAVAIL : ils sont sur la branche `claude/devis-ministeriel-8vylul`, pas en ligne. Corrige-les d'un bloc ; chaque texte porte un numéro pour que tu puisses répondre « 7 : … ».
> Vocabulaire du devis gardé tel quel : « compétence », « éléments de la compétence », « critères de performance », « contexte de réalisation », « activités d'apprentissage ».
> Où ils vivent dans le code : l'entrée de l'accueil dans `index.html` (textes 1 à 3) ; le texte 39 dans `js/codex.js` ; tous les autres dans la table `T`, en tête de `js/materiel-devis.js`.

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
14. **Rien de reconnaissable dans le collage** : « Je n’ai rien reconnu d’un devis dans ce que tu as collé : ni « Code : », ni « Énoncé de la compétence », ni élément numéroté. Vérifie que tu as copié le devis en entier, ou compose-le à la main. »
15. **Pas de numéro au moment de ranger** : « Donne le numéro de la compétence avant de ranger ce devis : c’est par lui qu’il se retrouve. »
16. **Un devis rouvert reçoit le numéro d'un autre devis rangé** : « Un autre devis rangé porte déjà ce numéro. Corrige le numéro, ou rouvre l’autre devis depuis l’accueil. »
17. **Quitter une lecture non rangée** (question du navigateur, sur « Revenir à l’accueil » et « Coller un autre devis ») : « Ce que tu as lu et corrigé n’est pas rangé : ce sera perdu. Continuer ? »
18. **L'écriture a échoué** : « Le devis n’a pas pu être rangé. Rien n’a changé ; essaie de nouveau. »

## D. La lecture et sa correction

19. **Titre** : « Voici ce que j’ai lu » (et « Ton devis rangé » quand on rouvre un devis)
20. **Consigne** : « Compare avec ton devis. Retouche un texte en écrivant dedans. Pour une ligne mal rangée, choisis où elle va dans son menu « Déplacer ». Rien n’est enregistré tant que tu n’as pas rangé le devis. »
21. **Ligne de compte** : « Lu : 6 éléments, 17 critères de performance »
22. **Intitulés de la feuille** : « Numéro de la compétence », « Énoncé de la compétence », « Contexte de réalisation », « Éléments de la compétence », « Critères de performance », « Activités d’apprentissage »
23. **Les cinq champs des activités d'apprentissage** : « Discipline », « Pondération », « Unités », « Heures ou périodes », « Précisions », et leur phrase : « Quand le devis les porte (en formation générale). Laisse vide ce qu’il ne dit pas. »
24. **Zones vides** : « Aucune ligne. Ce devis n’a peut-être pas de contexte de réalisation. » · « Aucun élément lu. » · « Aucun critère de performance sous cet élément. »
25. **Boutons d'ajout** : « Ajouter une ligne au contexte » · « Ajouter un critère » · « Ajouter un élément »
26. **Boutons d'un élément** : « ↑ » (lu « Monter l’élément 3 ») · « ↓ » (lu « Descendre l’élément 3 ») · « Retirer cet élément »
27. **Le menu d'une ligne** : « Déplacer… », avec deux groupes, « Cette ligne seulement » et « Cette ligne et les suivantes », et ces destinations : « Vers le contexte de réalisation » · « Sous l’élément 2 : Saisir le sens d’un message lu. » · « Retirer (mettre de côté) » · « En faire un élément » (pour une ligne mise de côté)
28. **Le tiroir du bas** : « Lignes mises de côté (15) », et sa phrase : « Ce qui ne fait pas partie de la compétence (pied de page, activités d’apprentissage) ou que tu as retiré. Rien de ceci ne sera rangé. Une ligne mise de côté par erreur se replace par son menu « Déplacer ». »
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

## Une question sur les mots

Le texte 28 dit que les activités d'apprentissage vont de côté. Ce n'est plus tout à fait vrai : la discipline, la pondération, les unités, les heures et les précisions sont maintenant lues dans leurs champs quand leur libellé porte sa valeur. Je propose : « Ce qui ne fait pas partie de la compétence (pied de page, en-tête) ou que tu as retiré. […] ». À toi de dire.
