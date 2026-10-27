# Consigne – Les calculs, lot 4b : « Retoucher ce calcul » et « Composer ton propre calcul », pour la note (étape 4 du plan du 21 oct.)

> Écrite par Cowork le mardi 27 octobre 2026 à 07 h 32 (Toronto, mesuré par `date`), sur `main` = `3b5159de` (lot 4a accepté : `VERDICT-RELECTURE-2026-10-27-calculs-4a.md`). Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 4. Ébauche validée par Grégoire le 26 oct. à 21 h 10 : `EBAUCHE-2026-10-26-calculs.html`.
> **L'ébauche fait foi pour ce que l'enseignant·e voit.** Relis dans son script `composeur`, `ouvrirComposeur`, `carteCalcul` (la branche `def.perso` et « Retoucher ce calcul »), `calculDeLaNote`, `calculParId`, `retirerCalcul`, `calculLu`, `ERREURS_CALCUL`, et le rendu de l'étape `note` (la liste des cartes, puis le composeur).
> **Découpage décidé par Cowork** : l'étape 4 passe en trois lots. 4a est fait. **4b (ce lot)** : retoucher un calcul tout fait, ou composer le sien, pour qu'il donne la note. **4c (consigne à venir)** : « Ce calcul sert » et un calcul qui sert aux phrases et aux tables (la palette, le menu « Selon »).
> **Ce lot part après celui de la note remise** (`CONSIGNE-LOT-2026-10-27-note-remise-copie-verrouillee.md`), commité et relu : 4b rend les changements de calcul plus fréquents, et une copie verrouillée doit déjà montrer la note que l'étudiant·e a reçue.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Les documents non commités de Cowork ne sont pas un obstacle.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, le plan (ses lignes modifiées), le verdict de relecture du lot de la note remise.

## 1. Les principes

1. **Une note enregistrée garde sa valeur**, et un critère sans calcul composé calcule exactement ce qu'il calcule depuis 4a (son banc d'équivalence reste vert ; le relevé du lot 3a aussi).
2. **Une seule source** : un calcul composé s'évalue par l'évaluateur de 4a, comme les trois tout faits. Ni `eval`, ni `new Function`.
3. **Jamais une note devinée.** Un calcul qui donnait la note et qu'on ne retrouve plus ne donne aucune note : jamais le repli silencieux vers le modèle historique.
4. **Aucune discipline dans `js/`** ; banc dans les deux disciplines fictives. Les mots d'écran : ceux de l'ébauche ; présent pour ce que le critère fait, conditionnel pour la copie fictive ; « étudiant·e ».

## 2. Ce que l'enseignant·e voit, en gestes (l'ébauche fait foi)

- **« Retoucher ce calcul »**, sur la carte du calcul tout fait choisi : ouvre le composeur, prérempli : le nom « Mon calcul, d'après « Pénalité fixe » » (le nom du calcul retouché), ses blocs, son réglage devenu un nombre, ses choix « vaut 0 ». Le calcul tout fait reste offert tel quel.
- **« Composer ton propre calcul (fonction avancée) »**, replié sous les cartes : la phrase « Comme dans un tableur… » ; « Nom du calcul » (l'exemple grisé « ex. : taux pour 100 » suivi du pluriel de l'étendue) ; la zone « Note = », ses pastilles ou « Vide : touche une donnée, un nombre ou une opération. » ; les groupes « Données » (Pondération du critère, Compte des X, Compte pondéré des X, Compte des Y), « Nombre » et « Poser ce nombre », « Opérations » (+ − × ÷ ( ), avec leurs noms pour les lecteurs d'écran) ; « Retirer le dernier », « Tout effacer » ; la ligne « Sur la copie fictive : … » ; « Quand une donnée de la copie vaut 0 » ; « Garder ce calcul » et « Annuler » ; les messages « Donne un nom à ton calcul. » et ceux de `ERREURS_CALCUL`.
- **« Ce calcul sert »** : pas dans ce lot ; un calcul composé sert à la note (4c ajoute l'autre choix).
- **Garder** : le calcul prend sa carte après les trois, avec le texte « Ton calcul. », et il est choisi pour la note ; « Calcul « X » gardé : il donne maintenant la note. » Sa carte : son réglage n'existe pas (ses nombres sont dans ses blocs), ses pastilles, sa ligne sur la copie fictive, ses choix « vaut 0 », « Modifier ce calcul » (le composeur rouvert, « Garder les changements ») et « Retirer ce calcul ».
- **La chaîne d'étapes** : l'info et le résumé portent le nom du calcul (« « X », sur 20 »).

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **La donnée : `critere.calculs`**, absente tant qu'aucun calcul n'est gardé. `[{ id, nom, sert: 'note', jetons, cas }]` ; `sert` s'écrit dès ce lot pour que 4c n'ait rien à migrer. Les jetons d'un calcul composé : des données (`ponderation`, `compte`, `comptePondere`, `etendue`), des nombres, les quatre opérations, les parenthèses ; **pas de réglage** (`t:'p'`) : « Retoucher » change le réglage en nombre, comme l'ébauche. Un identifiant (`calc1`, `calc2`…) ne change plus une fois écrit et **ne se réemploie pas** dans le critère. Bornes : 10 calculs par critère, 60 jetons par calcul, 80 caractères pour le nom, des nombres finis.
2. **La note : `modeleFormule = 'perso:<id>'`**, résolu par `normaliser` dans `critere.calculs`. Calcul introuvable ou illisible : `applicable: false`, `raison: 'calcul-introuvable'`, et le gabarit le dit : « Le calcul qui donnait la note est introuvable dans cette grille : choisis un calcul. » **Aucun repli** vers `penalite_normalisee` pour un identifiant `perso:`. `paramsFormule` reste intact : revenir au calcul tout fait retrouve son réglage.
3. **Le calcul** : l'évaluateur de 4a ; la note ramenée à la pondération par le haut, pas relevée à 0 (la règle de 4a, verdict § 3.1) ; le pourcentage borné. Les choix « vaut 0 » d'un calcul composé vivent dans son `cas` : les quatre choix, jamais « Calculer normalement » pour une donnée par laquelle on divise ; au départ, « Aucune note » pour une donnée qui divise, « Calculer normalement » sinon.
4. **`compte` se branche** : les appelants passent le compte brut (le nombre que l'étudiant·e lit) à côté du compte pondéré, dans les deux modes. Mesure-le ; les trois calculs tout faits n'en lisent toujours rien.
5. **Garder** n'est possible qu'avec un nom (espaces retirés) et un calcul qui s'évalue sur une copie d'essai où chaque donnée vaut 1 ; une division par le nombre 0 est refusée. Rien ne s'écrit dans la grille avant « Garder » : le brouillon vit en mémoire, par critère, comme l'état de l'atelier.
6. **Retirer** : le calcul qui donne la note ne se retire pas : « Ce calcul donne la note : choisis d'abord un autre calcul. » (l'ébauche repassait en silence à la pénalité fixe, ce qui changerait les notes à venir sans geste). Un autre calcul se retire après confirmation : « Retirer le calcul « X » ? Ses blocs seront perdus. »
7. **L'équivalence de « Retoucher »** : la copie gardée sans changement redonne la note du calcul tout fait, sur la grille de valeurs du banc de 4a (1e-9, même niveau).

## 4. Le transport (à mesurer comme au lot 4a)

`calculs` voyage avec le critère : import (le schéma du critère, `js/import-export.js`, à côté de `casZero`) ; partage (`js/partage-schemas.js` et `js/partage-validation.js`, une règle `refusCalculs` comme `refusCasZero`) ; export, codex, archives, copie de grille, bibliothèque (`grep` : chacun copie le critère entier). Un calcul illisible est écarté à l'import, jamais deviné ; s'il donnait la note, le critère n'a plus de note jusqu'à ce que l'enseignant·e en choisisse un (§ 3.2). Au partage, la structure illisible est refusée.

## 5. Où

`js/evaluation-formules.js` ; `js/grilles.js` (`rendreBlocFormuleAlgo`, ses gestionnaires) ; `js/main.js` (le dispatcher) ; `js/atelier-algo.js` (`_etapeNote`, l'état par critère) ; `js/miroir-algo.js` ; `js/evaluation-calcul.js` (le compte brut) ; `js/import-export.js` ; `js/partage-schemas.js`, `js/partage-validation.js` ; `styles.css` (le composeur de l'ébauche, ramené au `design-system.html`) ; `index.html` (jetons).

## 6. Pièges connus

1. **Le stock** : le banc d'équivalence de 4a et le relevé du lot 3a restent verts.
2. **La note remise** : après « Garder » d'un calcul qui change la note, une copie verrouillée montre la note remise et sa ligne (le lot précédent). Un essai le vérifie.
3. **Le redessin** : poser un bloc, taper le nom ou un nombre ne fait perdre ni le brouillon, ni l'ouverture du composeur, ni le focus, ni le défilement.
4. **L'iPad** : des cibles d'au moins 44 px ; « Poser ce nombre » accepte la virgule (« 2,5 »).
5. Règles 1, 2 et 4 de `CLAUDE.md` : le nom d'un calcul est un texte de l'enseignant·e (`textContent` ou `echapperHtml`), et un nom importé, une donnée étrangère ; aucun gestionnaire en ligne ; aucun `console.log`. Aucun nom d'élève réel.
6. Deux critères algorithmiques dans une grille : chacun ses calculs.

## 7. Preuve exigée

- **Vitest** : `assainir` et `refusCalculs` (jetons, clés, bornes, identifiants) ; la résolution de `perso:`, et un calcul introuvable sans note ni repli ; l'équivalence de « Retoucher » ; les choix « vaut 0 » d'un calcul composé ; le compte brut ; les messages de « Garder » ; « Retirer » refusé pour le calcul de la note ; l'aller-retour import et partage. Break-test pour chacun.
- **Playwright (WebKit)** : « Retoucher ce calcul », changer un nombre, « Garder » : la copie fictive suit, puis **une vraie copie évaluée** (codes posés dans Annoter) porte la nouvelle note ; composer de zéro « Pondération du critère − Compte pondéré des X × 3 », le garder ; les refus (incomplet, parenthèse, division par 0, sans nom) ; « Retirer » refusé, puis confirmé pour un autre calcul ; la copie verrouillée après un changement de calcul ; 1 440, 1 180, 820 et 700 px.
- **Captures** : le composeur ouvert et une carte de calcul composé, 1 440 et 820 px, clair et sombre, les deux disciplines.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord.

## 8. Ce qui n'entre pas

« Ce calcul sert » et un calcul pour les phrases ou les tables (4c) ; des fonctions (minimum, « si ») ; un calcul qui en lit un autre ; l'Aide.

## 9. Clôture

- Le plan du 21 oct. : la ligne de l'étape 4 dit « 4b fait », avec ses commits.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-calculs-4b.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
