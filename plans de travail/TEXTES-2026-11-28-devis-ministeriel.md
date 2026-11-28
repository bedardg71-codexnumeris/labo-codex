# Textes à relire – le devis ministériel dans « Apporter mon matériel »

> Écrit par Claude Code le 28 novembre 2026 à 8 h 31 (Toronto, mesuré par `date`), sur le mandat du 28 nov., 8 h 02.
> Ce sont des MOTS DE TRAVAIL : ils sont sur la branche `claude/devis-ministeriel-8vylul`, pas en ligne. Corrige-les d'un bloc ; chaque texte porte un numéro pour que tu puisses répondre « 7 : … ».
> Vocabulaire du devis gardé tel quel : « compétence », « éléments de la compétence », « critères de performance », « contexte de réalisation ».
> Où ils vivent dans le code : l'entrée de l'accueil dans `index.html` (textes 1 à 3) ; tous les autres dans la table `T`, en tête de `js/materiel-devis.js`.

## A. L'accueil d'« Apporter mon matériel » (geste 1)

1. **Titre de l'entrée** : « Le devis ministériel de ton cours »
2. **Phrase sous le titre** : « Colle le devis de la compétence, copié du PDF du ministère. L’application y lit le numéro de la compétence, son énoncé, ses éléments et leurs critères de performance, puis les range dans la fiche de ton cours. »
3. **Bouton** : « Apporter le devis de mon cours »

## B. Choisir le cours et coller (gestes 2 et 3)

4. **Titre de l'écran** : « Le devis de ton cours »
5. **Introduction** : « Le devis ministériel décrit la compétence de ton cours. Colle-le ici : tu verras ce qui a été lu, tu corrigeras au besoin, puis tu le rangeras dans la fiche de ton cours. Rien ne s’enregistre avant ton accord. »
6. **Bouton de sortie** (sur tous les écrans du devis) : « Revenir à l’accueil »
7. **Étiquette du menu des cours** : « À quel cours ce devis se rattache-t-il ? »
8. **Première ligne du menu** : « Choisis un cours »
9. **Aucun cours dans l'application** : « Tu n’as pas encore de cours. Crée d’abord sa fiche dans Réglages, puis reviens coller son devis. »
10. **Le cours choisi porte déjà une compétence** : « La fiche de ce cours porte déjà une compétence. » suivi du lien « Voir et corriger ce que la fiche porte »
11. **Étiquette de la zone** : « Colle ton devis ici »
12. **La consigne de copie** : « Dans le PDF du ministère, sélectionne tout le devis de la compétence, toutes ses pages comprises, copie-le d’un seul geste, puis colle-le (⌘ V). »
13. **Bouton principal** : « Lire mon devis »
14. **Bouton secondaire** : « Composer le devis à la main » (ouvre la même feuille, vide ; ajout de Claude Code, à retirer si tu n'en veux pas)

## C. Les messages

15. **Aucun cours choisi** : « Choisis d’abord le cours auquel ce devis se rattache. »
16. **Zone vide** : « Il n’y a rien à lire. Copie ton devis dans le PDF du ministère, puis colle-le dans la zone. »
17. **Rien de reconnaissable dans le collage** : « Je n’ai rien reconnu d’un devis dans ce que tu as collé : ni « Code : », ni « Énoncé de la compétence », ni élément numéroté. Vérifie que tu as copié le devis en entier, ou compose-le à la main. »
18. **Rien à ranger** : « Il n’y a rien à ranger : ni numéro, ni énoncé, ni élément. »
19. **Quitter une lecture non rangée** (question du navigateur, sur « Revenir à l’accueil » et « Coller un autre devis ») : « Ce devis n’est pas rangé dans la fiche du cours : ce que tu as lu et corrigé sera perdu. Continuer ? »
20. **L'écriture a échoué** : « Le devis n’a pas pu être rangé dans la fiche. Rien n’a changé ; essaie de nouveau. »
21. **La fiche a disparu entre-temps** : « Cette fiche de cours n’existe plus. Reviens à l’accueil et choisis un autre cours. »

## D. La lecture et sa correction (gestes 4 et 5)

22. **Titre** : « Voici ce que j’ai lu » (et « Ce que la fiche porte » quand on revoit un devis déjà rangé)
23. **Consigne** : « Compare avec ton devis. Retouche un texte en écrivant dedans. Pour une ligne mal rangée, choisis où elle va dans son menu « Déplacer ». Rien n’est enregistré tant que tu n’as pas rangé le devis dans la fiche. »
24. **Ligne du cours** : « Pour le cours **601-101-MQ - …** · 6 éléments, 17 critères de performance »
25. **Intitulés de la feuille** : « Numéro de la compétence », « Énoncé de la compétence », « Contexte de réalisation », « Éléments de la compétence », « Critères de performance »
26. **Zones vides** : « Aucune ligne. Ce devis n’a peut-être pas de contexte de réalisation. » · « Aucun élément lu. » · « Aucun critère de performance sous cet élément. »
27. **Boutons d'ajout** : « Ajouter une ligne au contexte » · « Ajouter un critère » · « Ajouter un élément »
28. **Boutons d'un élément** : « ↑ » (lu « Monter l’élément 3 ») · « ↓ » (lu « Descendre l’élément 3 ») · « Retirer cet élément »
29. **Le menu d'une ligne** : « Déplacer… », avec deux groupes, « Cette ligne seulement » et « Cette ligne et les suivantes », et ces destinations : « Vers le contexte de réalisation » · « Sous l’élément 2 : Saisir le sens d’un message lu. » · « Retirer (mettre de côté) » · « En faire un élément » (pour une ligne mise de côté)
30. **Le tiroir du bas** : « Lignes mises de côté (15) », et sa phrase : « Ce qui ne fait pas partie de la compétence (pied de page, activités d’apprentissage) ou que tu as retiré. Rien de ceci n’ira dans la fiche. Une ligne mise de côté par erreur se replace par son menu « Déplacer ». »
31. **Ce que l'écran annonce après un geste** (ligne discrète, lue par un lecteur d'écran) : « 7 lignes déplacées vers le contexte de réalisation. » · « 3 lignes déplacées vers l’élément 1. » · « 1 ligne déplacée vers les lignes mises de côté. » · « Ligne devenue l’élément 5. » · « Élément 2 retiré : son texte et ses critères sont mis de côté. » · « Élément monté. » · « Élément descendu. » · « Dernier geste annulé. »
32. **Boutons du pied** : « Ranger ce devis dans la fiche du cours » · « Annuler le dernier geste » · « Coller un autre devis »

## E. La fiche est déjà remplie (geste 6)

33. **Titre** : « La fiche de ce cours porte déjà une compétence »
34. **Phrase** : « Si tu acceptes, ce que tu apportes remplace ce que la fiche porte. Rien d’autre ne change dans la fiche. »
35. **Les deux colonnes** : « Ce que la fiche porte » · « Ce que tu apportes » ; une rubrique vide dit « Rien »
36. **Boutons** : « Remplacer ce que la fiche porte » · « Revenir à ma lecture »

## F. La confirmation

37. **Titre** : « Le devis est rangé dans la fiche du cours »
38. **Phrase** : « La fiche de « 601-101-MQ - … » porte maintenant la compétence 4EF0, avec 6 éléments et 17 critères de performance, et son contexte de réalisation. Rien d’autre n’a changé dans l’application. » (« et son contexte de réalisation » ne paraît que s'il y en a un)
39. **Boutons** : « Apporter le devis d’un autre cours » · « Revenir à l’accueil »
40. **Le témoin commun** dit « Enregistré » ; le geste qu'il nomme en cas d'échec : « Ranger le devis »

## Une question de fond sur les mots

Les éléments se rangent dans la fiche numérotés (« 1. Reconnaître le propos du texte. »), comme dans le devis. L'exemple du champ « Éléments de compétence » de la fiche les montre avec des puces (« • Reconnaître… »). Si tu préfères les puces ou rien du tout, c'est une ligne à changer (`versFiche`, `js/devis-lecture.js`).
