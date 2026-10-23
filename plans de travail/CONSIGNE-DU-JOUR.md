# Consigne du jour – #1144 : la cartouche qui remplace les critères de la grille (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 13 h 27 (Toronto, mesuré par `date`), sur `main` à `56f7be93` (release 1.216.0, non poussée). Elle remplace la consigne de 10 h 52 (verdict et mise en ligne de la 1.216.0), **non exécutée** : Grégoire fait passer ce bug avant le verdict. Archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-verdict-1.216.0-reporte.md`.
> Rapport : `Retours des testeurs/gregoire/BUG__grégoire__2026-10-23_12-43-45.txt` et sa capture (`.png` du même nom). Gravité : BLOQUANT. Testeur sur la 1.215.0.

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Un commit de docs seul, fichiers nommés un par un : cette consigne, ses deux archives (`_ancienne-CONSIGNE-DU-JOUR-2026-10-23-nouvelles-et-version-1.216.md`, `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-verdict-1.216.0-reporte.md`), `DEMANDE-RELECTURE-2026-10-23-version-1.216.0.md`, `VERDICT-RELECTURE-2026-10-23-version-1.216.0.md` (acceptée) et la ligne de l'étape 2b du plan `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`. La 1.216.0 n'a plus à rester le dernier commit : la release jugée sera celle qui suit #1144. Pas `.claude/worktrees/`.

## Le symptôme (Grégoire, 12 h 43)

Annoter › Évaluer. La grille choisie est « G5H Complète (refonte A26) », cinq critères. L'écran en montre quatre, chacun « (? %) », sans Français écrit ; au chargement, les cinq apparaissent une fraction de seconde, puis quatre. Changer de grille vide la cartouche ; reposer la cartouche « remet la grille à quatre ».

## Ce que Cowork a mesuré (ses données, Chrome, lecture seule, 13 h 05 à 13 h 20)

- **`CART_1787608995681_2_e95ea44399c7`**, « Plan de rédaction (refonte A26) » : rangée sous `a2026_cartouches_GRILLE_1786485818256_b_604f98f2ac5b` (G5H), champ `grilleId` = G5H, mais ses quatre critères portent les ids de « G4H Sans français (refonte A26) » (`GRILLE_1786485818258_18_eadb34d179bb`, critères `CR17592642064900.*`). 20 commentaires. `dateModification` 2026-09-30T20:12:31Z. Née le 24 août, à la milliseconde près avec la grille `GRILLE_1787608995679_1_8f192e2b5974`, aujourd'hui absente, dont la cartouche « Plan de rédaction A26 » porte aussi les ids de G4H.
- **`CART_1787606727936_2_6a0ac3830223`**, « Rédaction (refonte A26) » : sous « G5M français algo. (refonte A26) » (`GRILLE_1787606727933_1_3fc929b433e1`). Français écrit correspond (`CR1759529555936`) ; les quatre autres portent les ids d'une grille absente (`CR1759529438502`… de `GRILLE1759529438501`). 25 commentaires. `dateModification` 2026-09-30T20:13:53Z. Aucune évaluation ne l'emploie.
- Une seule évaluation emploie la première : Artefact 5, sous G5H, créée aujourd'hui à 16:35:49Z, vide (aucun critère, note 0, non verrouillée). **Ne pas y toucher.**
- Les noms des critères sont identiques d'une grille à l'autre : Structure, Rigueur, Plausibilité, Nuance.
- Beaucoup de clés `cartouches_` pointent des grilles absentes (anciennes orphelines) : hors lot.

## La cause à l'écran (lue dans le code)

`cartoucheSelectionnee()` (`js/evaluation-chargement.js`, vers la ligne 1114) rend **`cartouche.criteres`** et cherche chacun dans la grille : un critère de la cartouche absent de la grille sort « (? %) », un critère de la grille absent de la cartouche disparaît. `afficherCriteresDepuisGrille()` rend, lui, la grille : d'où cinq critères, puis quatre quand la cartouche est posée. La grille n'a jamais changé. La règle est déjà écrite au-dessus de `MESSAGE_ATTENTE_CRITERES` : la grille dit QUOI évaluer, la cartouche AVEC QUELS COMMENTAIRES.

## 1. L'écran

- Les critères affichés sont **toujours ceux de la grille** ; la cartouche ne fournit que ses commentaires, par id de critère. Pas de correspondance par nom à la lecture : elle masquerait le prochain décalage.
- Un critère de la grille que la cartouche ne couvre pas reste évaluable, et l'écran le dit en une ligne (texte lu par l'enseignant ; skill `design-interface`). Mesure ce que la rétroaction de l'élève fait aujourd'hui quand un commentaire manque, et garde-le : **aucune prose nouvelle pour l'élève** dans ce lot.
- Banc : une grille de cinq critères, une cartouche de quatre aux ids d'une autre grille. Cinq critères à l'écran, pondérations lisibles, aucun « (? %) », la ligne qui nomme le critère non couvert. Break-test.

## 2. La source

Trouve le geste qui range une cartouche sous une grille sans remapper ses critères. Indices : les deux cartouches ont été modifiées le 30 sept. entre 16 h 12 et 16 h 14 (Toronto), pendant la refonte A26 ; la première porte le `grilleId` de G5H et les critères de la grille où elle est née. `deplacerCartouchesVersAutreGrille` (`js/grilles.js`, l. 2769) remappe par id puis par nom : cherche ailleurs (`copierCartoucheDepuisTrimestre`, les duplications de grille, l'import, le partage, tout chemin qui écrit dans `cartouches_<id>` une cartouche venue d'une autre grille). Trouvé : tarir, avec un test. Pas trouvé après une recherche ciblée : dis-le et inscris-le (issue 2), sans deviner.

## 3. Le stock (accord de Grégoire, 13 h 25)

Grégoire accepte de rattacher les commentaires de ces deux cartouches aux critères de leur grille, **par le nom**.

- Une fonction de console sur le modèle de `ComptesErreurs` (`js/comptes-erreurs-stock.js`) : `await CartouchesDecalees.verifier()` liste les cartouches du trimestre actif dont un critère n'est pas dans leur grille, et **n'écrit rien** ; `{ reparer: true }` n'écrit que celles qu'elle a listées, et exige un Codex à jour, comme `ComptesErreurs` : c'est la copie de l'état d'avant.
- Le rattachement réutilise la correspondance de `deplacerCartouchesVersAutreGrille` (id, puis nom ; clés de commentaires reconnues par préfixe, jamais découpées). **Extrais-la en une fonction pure partagée** par les deux chemins plutôt que de la recopier.
- Ce qui ne trouve aucun critère reste listé, jamais jeté.
- Attendu sur ses données : deux cartouches. « Plan de rédaction (refonte A26) » : quatre critères rattachés à ceux de G5H, Français écrit sans commentaire (Grégoire les écrira). « Rédaction (refonte A26) » : quatre rattachés à G5M, Français écrit intact.
- Vitest sur la fonction pure, break-test.

## 4. Clôture

- #1144 dans `SUIVI-BUGS.md`, avec sa phrase en français.
- **Pas de release** : elle suivra la relecture de Cowork et les Nouvelles validées par Grégoire (Cowork les propose). **Ni verdict complet ni push.**
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-23-1144-cartouche-criteres.md`.
- Termine par le geste à vérifier à l'écran, et par la phrase qui dira à Grégoire comment lancer `CartouchesDecalees.verifier()` une fois la version chargée.
