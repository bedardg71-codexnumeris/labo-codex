# Consigne du jour – audit en lecture seule : ce qui ne marche qu'avec la pratique de Grégoire

> Écrite le 21 septembre 2026, 11 h 06 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (#715, #723, poussée en 1.152.2) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-715-723-tous-et-arrondi.md` (déplacée par Cowork, à commiter avec ce lot).

## 0 · Le critère, et pourquoi maintenant

Le critère est celui de Grégoire du 1er sept. : « que rien ne soit codé en dur » – **sa pratique d'enseignant de littérature gravée dans un code que d'autres disciplines utiliseront**. La cohorte arrive avec d'autres critères, d'autres cours, d'autres pratiques.
Le 21 sept. à 10 h 40, il a dit : « je croyais qu'on avait retiré tout ce qui est codé en dur ». Le travail a été fait en partie (audit du 26 août, `Rapports/AUDIT-srpnf-code-en-dur-2026-08-26.md` ; cadrage du 1er sept., `plans de travail/CADRAGE-2026-09-01-front-evaluations-et-code-en-dur.md` ; chantiers #529, #667, #668). **Cet audit dit ce qui en reste aujourd'hui, mesuré.**

## 1 · Règles du lot

- **Lecture seule.** Aucune ligne de `js/`, `index.html`, `styles.css` ne change. **Aucune release.** Tu peux écrire des bancs jetables (hors du dépôt, ou retirés avant le commit) et le rapport.
- **Aucune fiche inscrite au backlog par ce lot** : le rapport PROPOSE ; Grégoire dispose. Chaque constat porte une disposition proposée (voir §4).
- Condition de départ : `git log --oneline -1 origin/main` porte **1.152.2** (`1defd61c` ou un commit de journal après). Aucune autre session n'écrit.

## 2 · Trois questions, dans cet ordre

**A. Ce que le 1er septembre disait encore en dur – est-ce toujours là ?** Pour chaque point du §2 du cadrage du 1er sept. (le seuil 0,7125 et l'échelle 0,85 / 0,75 / 0,65, #677 ; le texte « erreurs de français » et ses six variantes, #581, dont celle **imprimée dans le PDF de l'élève** ; le portrait confidentiel à cinq champs, #539 ; `copierCriteresSRPN(F)` ; les replis IDME à deux libellés de I ; les trois `facteurNormalisation || 500` ; les ressources « SA » / « CAF » de `pratique-sommative.js`) : **présent / retiré / déplacé**, avec la ligne et la commande qui le montre.

**B. Ce que Cowork a vu ce matin, et que personne n'a classé** :
- la normalisation `startsWith('francais') → 'francais'` (`profil-etudiant-calculs.js` ×2, `profil-etudiant-sections-affichage.js`, `profil-etudiant-helpers.js`, `interventions.js` ×3) et `NOM_CRITERE_LANGUE = 'francais'` (`pratiques/pratique-pan-standards.js`) : **que devient un critère de langue qui s'appelle autrement** (« Qualité de la langue », « Langue », « Communication ») ? Joue-le sur le vrai code : une grille à cinq critères aux noms d'une autre discipline, à travers le dépistage, les interventions, le profil et la note Standards.
- la liste `['structure','rigueur','plausibilite','nuance','francais']` (`profil-etudiant-helpers.js` ≈ l. 941) et la liste `srpnf…` d'`init-inline.js` ≈ l. 571 : qui les lit, pour quoi.
- « Grégoire » (≈ 111 fichiers de `js/`), « Bédard » (≈ 20), « 601-101 » (≈ 19), « EUF » (≈ 11) : **commentaire, ou valeur qui atteint l'écran, les données ou un calcul ?** Un compte par catégorie suffit ; ne liste que ce qui atteint l'écran, les données ou un calcul.

**C. Le balayage large** : tout autre littéral qui suppose **une discipline, un cours, un établissement, une grille ou une échelle précise** (noms de critères, codes de cours, noms de collèges ou de services, seuils pédagogiques non réglables, textes d'élève qui nomment une matière). Cherche par le contenu (`grep -rn` sur des symboles et des mots), pas par nom de fichier. **Exclus** : le pack de démonstration et ses gabarits (ils ont le droit d'être la pratique de Grégoire, s'ils se présentent comme un exemple), `changelog-data.js`, les tests.

## 3 · Chaque trace se classe en une de quatre familles

1. **Commentaire / trace d'histoire** – sans effet.
2. **Valeur par défaut réglable** – la pratique de Grégoire sert de départ, l'utilisateur·rice peut la changer à l'écran (dis où).
3. **Code qui ne marche bien qu'avec la pratique de Grégoire** – un·e collègue d'une autre discipline obtient un calcul faux, un écran vide ou un mot qui ne correspond pas à son critère. **Prouve-le** par un banc jetable qui rejoue le cas d'un·e collègue (critères renommés, autre cours), pas par la lecture seule.
4. **Mots qui nomment la littérature ou le français à un·e élève d'une autre discipline** (PDF, rétroaction, profil) – famille à part : les mots des élèves remontent à Grégoire.

## 4 · Le livrable

`Rapports/AUDIT-code-en-dur-2026-09-21.md`, écrit pour Grégoire **en gestes d'utilisateur** (« un·e collègue de chimie qui… »), les numéros en fin de ligne :
- en tête, **dix lignes au plus** : combien de traces par famille, et les familles 3 et 4 nommées une par une ;
- pour chaque constat des familles 3 et 4 : ce qu'un·e collègue voit, la preuve (commande ou banc, et son résultat), l'ampleur (fichiers, sites), le coût estimé (rapide / intermédiaire / laborieux), et une **disposition proposée** : *à corriger avant que la cohorte l'atteigne* / *inscrire* / *refuser (motif)* / *doublon de #NNN* (`grep` les deux registres avant d'écrire « inscrire ») ;
- **ce qui a été retiré depuis le 26 août**, en une liste courte : c'est la réponse à « je croyais qu'on avait retiré » – ce qui l'a été, ce qui ne l'a pas été ;
- ce que l'audit n'a pas pu mesurer, dit comme tel.

Commite le rapport, cette consigne et son archive. **Pas de push sans le mot de Grégoire** (docs seulement : pas de verdict Playwright requis). Cowork relira le rapport avant qu'il ne te revienne.

## 5 · Ce que Grégoire verra

Rien à l'écran. Un rapport qui dit, famille par famille, ce qui dans l'application ne marche qu'avec sa pratique, ce qui a déjà été retiré, et ce qu'il faudrait corriger avant que la cohorte le rencontre.
