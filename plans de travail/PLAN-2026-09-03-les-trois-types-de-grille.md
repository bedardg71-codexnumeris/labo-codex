# Plan de travail — les trois types de grille reçoivent leur comportement

> **Écrit le 3 septembre 2026 au soir, par Cowork, avec Grégoire.**
> ⛔ **CE N'EST PAS UNE CONSIGNE.** C'est le découpage d'un chantier en lots exécutables, chacun
> vérifiable à l'écran. **Une consigne s'écrit à partir d'UN lot, pas du plan entier.**
> Application au moment de l'écriture : **1.113.0**, build `0903-0906` — **8 lots commités, non
> poussés.**
>
> **Source des décisions** :
> `plans de travail/SEANCE-A-FROID-2026-09-03-les-trois-types-de-grille.md` — **lis-le d'abord**,
> il porte les motifs et les mots de Grégoire. Ce plan-ci ne porte que la séquence.
>
> ⚠ **REMESURE TOUT** (règle 1). Les lignes citées ont été relevées en lecture seule.

---

## Ce qui est ARRÊTÉ — et qu'aucun lot ne rouvre

1. **Le type monte à la GRILLE.** Il est le défaut de ses critères. **Un critère peut
   déroger** — motif mesuré : la politique départementale de Grégoire impose 20 % pour le
   français, alors que sa pratique est ailleurs.
2. **« Mixte » est un CONSTAT, pas une case.** Une grille est mixte parce qu'elle l'est devenue.
3. **L'analytique** = des critères, des points, un total, un seuil. **Le maximum de points EST
   le poids du critère.**
4. **Ce que l'élève lit d'un critère analytique : la note chiffrée, rien d'autre.**
5. **La chaîne** : points → pourcentage → niveau (par les bornes de l'échelle **de la grille**)
   → cartouche. ▣ **Chaque maillon existe déjà.**
6. **L'écran** : la palette d'évaluation actuelle, avec **un champ chiffré** au lieu du menu de
   niveaux. Le total et le pourcentage sont **déjà** en bas de cette palette.
7. **Pas de champ de justification** pour un critère qui déroge. *Un champ que personne ne lira
   est un coût pur.*
8. **Aucune grille analytique n'existe chez Grégoire** ⮕ **rien à protéger de son côté.**
   ⚠ **Mais des utilisateurs en place pourraient en avoir, et ce nombre n'est pas mesurable.**

---

## ⛔ HORS PÉRIMÈTRE — nommé pour que ça n'y entre pas

- **Le total libre** (25, 130…) ramené à 100 %. ▣ **Décidé : bonne forme, PAS ce chantier** — ça
  touche le calcul de TOUTES les grilles, holistiques comprises, donc des notes déjà remises.
  ⮕ **L'analytique naît en exigeant 100**, comme le reste de l'application.
- **Les sections** (Introduction · Développement · Conclusion) — un étage de plus dans les données.
- **Le critère répété par occurrence** (« Paragraphes 1 · 2 »).
- **Les seuils indicatifs en marge** (42 passable, 49 bien…).
- **Les éléments observables** comme structure. ▣ Retirés de la définition par Grégoire : *aide
  au jugement*, pas structure.
- **L'écran de la grille analytique dans le PDF de l'élève au-delà du chiffre.**

⚠ **Si un lot commence à toucher l'un de ces six points, il a débordé. Arrête et dis-le.**

---

# LOT 1 · Le type monte à la grille

**Ce que l'utilisateur y gagne** : il choisit une manière d'évaluer **en créant sa grille**, au
lieu de la redire à chaque critère.

### À faire
- **`grille.type`** : un champ neuf. ▣ **Mesuré : il n'existe pas** — `grep "grille\.type" js/`
  rend **0**, contre **17** pour `critere.type` (le témoin dit que le motif trouve ce qui existe).
- **Le type de la grille devient le DÉFAUT** d'un critère neuf.
- **Le menu du critère reste**, pour la dérogation.
- **Le badge** — déjà livré aujourd'hui (ALGO · HOLIS · ANALY · MIXTE, déduit des critères).
  ⮕ **Vérifie qu'il continue de dire vrai** quand la grille porte un type : **le badge dit
  toujours ce qui EST, pas ce qui est déclaré.**

### ⛔ Ce qui ne doit pas bouger
**Aucune grille existante ne porte de type.** ⮕ **Elle se déduit de ses critères, en lecture ;
on n'écrit rien dans ses données.** ⚠ **Une grille sans `grille.type` doit fonctionner
exactement comme aujourd'hui.** *Tarir n'est pas réparer.*

### Fini quand
Grégoire crée une grille, choisit « Analytique », ajoute trois critères — **les trois sont
analytiques sans qu'il ait rien coché**. Il en passe un en algorithmique : le badge de la grille
devient **MIXTE**.

---

# LOT 2 · L'analytique se saisit en points

**Ce que l'utilisateur y gagne** : il remplit sa grille comme sur papier — un chiffre par
critère, un total en bas.

### À faire
- **Dans la palette d'évaluation**, un critère analytique rend **un champ numérique** (0 → sa
  pondération) au lieu du menu de niveaux. ▣ **Le point de branchement est mesuré** :
  `js/evaluation-chargement.js` vers la l. 1039 — `<select … data-on-change="niveauSelectionne">`
  pour le cas standard, et un bloc distinct plus haut pour l'algorithmique. **C'est le même
  endroit : une troisième branche.**
- **Le total et le pourcentage** : ▣ **déjà rendus en bas de la palette** (« Note chiffrée · 45 %
  · Niveau »). ⮕ **Vérifie qu'ils se remplissent depuis les points**, sans nouvel écran.
- **`calculerNote()`** (`js/evaluation-calcul.js:1061`) doit sommer les points d'un critère
  analytique. ⚠ **Il travaille aujourd'hui sur `valeurCalcul` et les bornes des niveaux** — la
  branche analytique n'y passe pas.

### ⛔ Ce qui ne doit pas bouger
**Un critère holistique et un critère algorithmique se calculent exactement comme avant.**
▣ **Témoin exigé** : les sentinelles existantes du calcul passent **sans être modifiées**. **Si
tu dois en toucher une, tu as changé un comportement — arrête et dis-le.**

### Fini quand
Grégoire ouvre une copie, saisit **24** sur un critère qui pèse **30**, et lit **80 %** en bas de
la palette. Un second critère holistique dans la même grille continue de se choisir au menu, et
le total tient compte des deux.

---

# LOT 3 · Le chiffre trouve son niveau, et le niveau ouvre la cartouche

**Ce que l'utilisateur y gagne** : sa rétroaction préparée s'attache à une note chiffrée, comme
elle s'attache déjà à un niveau.

### À faire
- **Le pourcentage d'un critère analytique trouve son niveau** par les bornes de l'échelle de la
  grille. ▣ **Le mécanisme existe** : `pourcentage >= n.min && pourcentage <= n.max`, **cinq
  sites** dans `js/evaluation-calcul.js`. `js/echelles.js:3854` l'énonce comme règle du
  système — *« note chiffrée → CODE »*.
- **La cartouche s'ouvre.** ⚠ **Elle est indexée par `critereId_niveau`** — mesuré :
  `cleCart = critereId && niveau ? … : null`. ⮕ **Sans niveau, la clé ne se forme pas et le
  commentaire reste vide EN SILENCE.** **Le niveau déduit referme cette porte.**

### ⛔ Ce qui ne doit pas bouger
**L'élève ne voit que le chiffre.** ▣ Décision de Grégoire. ⮕ **Le niveau déduit sert à
l'enseignant et à la cartouche ; il ne s'ajoute pas au PDF de l'élève sans qu'il le demande.**

### Fini quand
Grégoire attache une rétroaction de cartouche à un niveau, saisit une note chiffrée qui tombe
dans ce niveau, et **la rétroaction apparaît** — sans qu'il ait choisi de niveau nulle part.

---

## L'ordre, et pourquoi

**1 → 2 → 3.** Chacun se vérifie à l'écran, seul.

▣ **Le lot 1 ne casse rien** : il ajoute un défaut. **Le lot 2 est le cœur** — c'est lui qui fait
exister l'analytique. **Le lot 3 est un gain**, pas une condition : sans lui, l'analytique
fonctionne et l'élève voit son chiffre.

⛔ **UN LOT PAR SÉANCE, et Grégoire regarde entre chacun** (`PROTOCOLE.md`, règle 6, forme 4).
⚠ **Le lot 2 touche `calculerNote()`, qui produit les notes de ses élèves.** ⮕ **Relecture
croisée de Cowork obligatoire** (règle 2) : *ça ne se reprend pas.*

---

## ▣ LE TEXTE EXÉCUTABLE DES TROIS LOTS

`CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md` — écrit le 3 septembre au soir, **à
l'intention de Claude Code**. Il porte, lot par lot, ce qu'il y a à faire, le hors-périmètre, les
pièges connus et le « fini quand ».

⚠ **Le lot 1 y porte des mesures datées ; les lots 2 et 3 portent les questions à mesurer, pas
leurs réponses.** C'est délibéré : un chiffre relevé aujourd'hui et lu dans trois jours serait un
souvenir présenté comme une mesure.
⮕ **Ce plan-ci reste la séquence ; ce fichier-là est le texte qu'on exécute.**

---

## ⏳ CE QUI VIENT APRÈS LES TROIS LOTS — et qui n'entre pas ici

**Les collections de paramètres** — `CADRAGE-2026-09-03-collections-de-parametres.md`, écrit le
3 septembre au soir. Enregistrer un jeu de paliers sous un nom (« EUF ») et le retrouver dans le
menu de projection d'une grille neuve, au lieu de repartir des défauts à chaque fois.

⛔ **CE N'EST PAS UN QUATRIÈME LOT DE CE PLAN.** Ce plan-ci donne aux **types de grille** le
comportement qu'on leur promet ; celui-là rend **réutilisable** un réglage de critère
algorithmique. Deux chantiers, deux fichiers — les mêler ferait déborder les deux.
⚠ **Un point y reste ouvert, et il est pour Grégoire** : une collection corrigée doit-elle
changer ce qu'un élève a déjà lu ? La recommandation est dans le cadrage.

---

## Ce que ce plan ne dit pas

⛔ **Aucun effort n'est estimé** — aucun n'a été mesuré.
⚠ **Le §B de la séance à froid reste entier** : les trois types ne sont toujours pas décrits sur
les mêmes axes dans la documentation de l'application. **Ce plan livre le comportement ; il
n'écrit pas l'aide.**
▣ **Et la posture tient** : *ce chantier reproduit la pratique de Grégoire, bien documentée. Le
14 septembre dira où elle force un collègue de chimie ou de philosophie à plier la sienne.*
