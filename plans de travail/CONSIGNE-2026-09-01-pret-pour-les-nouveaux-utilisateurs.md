# Consigne — rendre l'application présentable aux nouveaux utilisateurs

> Écrite le **1er septembre 2026** depuis Cowork, avec Grégoire.
> **Lis d'abord `plans de travail/CADRAGE-2026-09-01-front-evaluations-et-code-en-dur.md`.**
> Il porte les mesures ; cette consigne ne porte que l'ordre et les critères d'arrêt.
> Les constats du cadrage ont été **lus dans le code**, pas supposés — ne les re-dérive pas.

**Le critère de Grégoire, dans ses mots** : « je veux que l'application fonctionne,
qu'il n'y ait pas d'erreurs, et que rien ne soit codé en dur ». *Codé en dur* =
sa pratique d'enseignant de littérature gravée dans le code que d'autres
disciplines utiliseront.

⚠ **Ceci vient APRÈS le #668 Lot 4 en cours.** Ne l'ouvre pas avant qu'il soit
livré et poussé.

⮕ **Une seule décision principale par session.** Les lots ci-dessous sont dans
l'ordre où ils devraient être pris, pas dans un ordre obligé.

---

## LOT A — Réconcilier le backlog (aucun code, à faire en premier)

Le fichier affiche 179 cases ouvertes ; **17 sont fausses**. Tant qu'elles y sont,
toute priorisation porte sur un fardeau plus lourd que le réel, et c'est
décourageant pour rien.

1. **Retourner ces 17 cases** — la preuve (commit + trace écrite) est au §4 du
   cadrage : `#508 #540 #597 #599 #603 #604 #605 #623 #635 #636 #638 #640 #644
   #645 #650 #665 #671`.
   ⚠ Vérifie chacune toi-même avant de cocher. Une case retournée à tort est plus
   coûteuse qu'une case oubliée.
2. **#427 est en double** — lignes 5880 et 5931 (la seconde est barrée). Fusionner.
3. **Quatre lignes ouvertes ne portent aucun `#NNN`** (3176, 5623, 5628, 7099) :
   leur allouer un identifiant ou les rattacher à leur parent.
4. ⚠ **Les ✅ des items #581 à #592 marquent des ARBITRAGES du 28 août, pas des
   livraisons.** Ne pas les lire comme faits.

**Deux énoncés à réécrire avant qu'une session les rouvre sur la mauvaise cible :**

- **#440 — à FERMER.** Le SRPNF en dur dans les diagnostics a été réglé par #529
  le 26 août (`profil-etudiant-diagnostics.js:85` lit
  `criteresDeLaGrillePourAffichage()`). L'énoncé décrit un état disparu.
  ⮕ Ouvrir à la place un item pour le **résidu réel** : le seuil `0,7125` écrit
  en clair quatre fois et l'échelle 0,85 / 0,75 / 0,65. Ce sont des **constantes
  pédagogiques non réglables**, pas de la littérature.
- **#581 — à ÉLARGIR.** Voir le Lot B : le défaut est bien plus large que « la
  rétroaction parle de l'EUF et du CAF », que #668 a déjà traité.

**Fini quand** : `git diff` ne montre que `BACKLOG.md`, et le décompte des cases
ouvertes correspond à ce que la mesure dit.

---

## LOT B — Le mot « français » imprimé dans le PDF d'un élève de chimie

C'est le défaut qui illustre le mieux le critère de Grégoire, et il n'était décrit
nulle part.

**Sept littéraux, deux natures — ne pas les traiter pareil :**

**(1) Des en-têtes et libellés**, qui devraient porter le **nom du critère tel
qu'il est dans la grille** :
- `synthese-retroaction-rendu.js:510` — « **Français écrit** · 2 catégories les
  plus fréquentes » ⚠ **imprimé dans le PDF remis à l'élève** ;
- `evaluation-retroaction.js:478` — « Erreurs de français (N) » ;
- `synthese-retroaction-data.js:837` — « Français : N erreurs ».

⮕ Mécanique : le nom du critère est déjà disponible dans la grille. Aucun registre
à créer.

**(2) Des phrases engendrées**, qui demandent le **même geste que #667 et #668** —
un modèle de texte réglable depuis le gabarit, pas une chaîne dans le moteur :
- `evaluation-calcul.js:502` et `:680` — « **Ta rédaction contient N erreurs de
  français pour M mots.** » Sort pour TOUT critère algorithmique, toutes
  disciplines confondues. ⚠ « rédaction » est aussi faux que « français » pour qui
  compte autre chose.
- `evaluation-retroaction.js:785` — « la qualité du français écrit est à
  travailler en priorité » ;
- `evaluation-retroaction.js:854` et `synthese-retroaction-data.js:728` —
  « Concentre-toi sur la qualité du français ».

⮕ Réutilise le patron de `js/evaluation-projection.js` : registre pur, testable en
Node, migration à la lecture reproduisant le texte d'aujourd'hui **au caractère
près**, schémas FERMÉS pour le transport. Ne réinvente rien.

⚠ **Leçon du 31 août, à ne pas réapprendre** : changer une phrase engendrée ne
change QUE les évaluations à venir. Les anciennes portent leur texte gelé dans
`donneesAlgorithmiques[id].retroaction`. Ne propose aucune régénération de masse :
elle écraserait le paragraphe de catégorie dominante.

**Hors périmètre de ce lot, même famille** :
`js/pratiques/pratique-sommative.js:642-649` sert « Services adaptés (SA) » et
« Centre d'aide (CAF) » à tout le monde. Item séparé.

**Fini quand** : un critère algorithmique nommé autrement que « Français écrit »
produit un PDF où le mot « français » n'apparaît nulle part, sauf si l'utilisateur
l'a écrit lui-même.

---

## LOT C — #651, « annoter » ouvre sans palette

Retour terrain de Grégoire, avec capture. Cause lue, **jamais mesurée**, aucun
commit correctif. Depuis la Liste, en venant du mode Évaluer, la page d'annotation
s'ouvre sans aucune palette.

**Mesure avant de corriger.** C'est le seul bug d'usage du parcours d'évaluation
qui reste, et il touche le geste le plus fréquent de Grégoire.

---

## LOT D — ⛔ BLOQUÉ sur une décision de Grégoire : #560 résiduel

Le garde des modes est posé ; la **portée** des suppressions ne l'est pas.
Supprimer un fichier ou vider la corbeille emporte **toutes** les évaluations du
couple (DA, production) : les originales, les reprises, et l'évaluation active
d'un fichier réimporté.

**Ne code rien ici.** Pose-lui la question : que doit emporter la suppression d'un
fichier ? C'est une règle métier d'évaluation, pas un choix technique.

---

## LOT E — Finir #668

Lot 4 en cours. Restent **5b** (sentinelles du branchement) et **6** (le bloc dans
le PDF), ce dernier ⛔ **bloqué** sur la décision du doublon — voir §3 Lot 6 de
`plans de travail/CONSIGNE-projection-euf-parametrable.md`. Le **Lot 3b** (repli
des paliers) est du confort, sans échéance.

---

## CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

- La **règle métier de #560** (Lot D).
- Les **portes terrain** jamais relevées : #568 (cibles tactiles iPad), #572
  (hiérarchie des titres), #660 / #661 (zoom, iPad).
- **#598 volet B** — la balance des blancs, après avoir regardé ses images.
- Le **nom du service d'aide** pendant la transition CAF → Passerelle +.
- Le facteur de normalisation **500 → 600** sur *Grille-1 FR-ALGO seul A26*,
  ⚠ entre deux évaluations, jamais au milieu d'une correction.

---

## CE QUI N'EST PAS DANS CE CHANTIER

- **Le premier lancement à froid** (compte neuf, écrans vides). Grégoire juge ce
  volet couvert par les chroniques Labo, le système d'aide, l'accompagnement et
  les données de démonstration. **C'est sa décision**, notée ici pour qu'aucune
  session ne la reprenne comme un oubli.
- **Les notes d'A2025 et d'H2026.** Décision pédagogique définitive de Grégoire :
  on n'y revient pas. N'inscris aucun item qui y invite.
- **La dette invisible à l'usage** — #522/#599, #520, #596, #585 à #592, #616 à
  #618, #624, #627 à #629, #656 à #664. Réelle, mais elle n'a pas d'échéance et
  aucun nouvel utilisateur ne la rencontrera.
