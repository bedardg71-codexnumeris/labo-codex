# AUDIT — SRPNF codé en dur

**Date** : 26 août 2026 · **Base** : `main` 1.99.7
**Question de Grégoire** : « mes critères personnels (SRPNF) sont-ils codés en dur dans l'aide à
l'utilisateur ? »
**Règle de référence** : SRPNF, ELLAC et PAN-Standards sont des concepts de **couche 2, configurables**
— jamais en dur dans le code ni le design system.

---

## Réponse courte

**Oui, dans l'aide — deux endroits.** Mais l'audit a trouvé plus grave : les cinq critères sont en dur
**dans l'interface et dans le calcul**, et le mécanisme qui les alimente ne peut fonctionner que pour
la grille de Grégoire.

| | Où | Gravité |
|---|---|---|
| **A1** | Aide : le popup du profil définit les 5 critères | moyen |
| **A2** | Aide : le glossaire les présente comme un terme de l'app, **avec leurs pondérations** | moyen |
| **B1** | Interface : la liste des 5 barres est un tableau littéral | **majeur** |
| **B2** | Interface : les 5 noms sont un objet littéral | majeur |
| **C1** | Calcul : une **expression régulière** cherche les 5 noms dans le TEXTE des rétroactions | **bloquant pour tout autre utilisateur** |

---

## A · Dans l'aide (la question posée)

### A1 — le popup `profil-etudiant-indicateurs`

`js/accompagnement-contenu-popup.js:612` : une liste intitulée « Barres SRPNF (habiletés) » définit
les cinq critères comme s'ils étaient la structure de l'application :

> S (Structure) — Organisation logique du travail.
> R (Rigueur) — Précision méthodologique et respect des consignes.
> P (Plausibilité) — Cohérence du raisonnement et des arguments.
> N (Nuance) — Profondeur de l'analyse et prise en compte de la complexité.
> F (Français) — Qualité de la langue écrite.

Un·e enseignant·e de chimie qui ouvre cette aide lit la définition de critères qu'il n'a pas.

### A2 — le glossaire d'`index.html` (ligne 14037)

> **SRPNF (Critères)** — Grille d'évaluation en 5 critères : Structure (15 %), Rigueur (20 %),
> Plausibilité (10 %), Nuance (25 %), Français (30 %).

⚠ Le glossaire est censé définir le **vocabulaire de l'application**. SRPNF y figure comme un terme du
logiciel, **avec les pondérations personnelles de Grégoire**. Ce sont des valeurs métier en dur dans
une définition.

Six autres mentions décrivent des écrans par ces critères : « Attribution notes SRPNF » (11820),
« Performance SRPNF » (12779), « Scores par critère SRPNF » (13047), « Grille de critères SRPNF »
(13943).

### A3 — ce qui est CORRECT, et qui montre la bonne forme

Ligne 10260 : « **L'exemple qui suit (SRPNF)** illustre une grille de critères inspirée du modèle
ELLAC (ellac.ca), développé pour l'enseignement de la lecture littéraire au collégial. »

⮕ Cadré comme un **exemple**, attribué à sa source, situé dans sa discipline. C'est exactement ce
qu'il faut faire — et cela prouve que la distinction est tenable, puisqu'elle est déjà tenue ici.

---

## B · Dans l'interface — au-delà de la question

### B1 — la liste des barres est un tableau littéral

`js/profil-etudiant-sections-affichage.js:3686` :

```js
const barresHTML = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais']
    .map(cle => _genererBarreCritereSRPNF(cle, contexte))
```

Le bloc « Forces et défis » du profil affiche donc **toujours ces cinq barres**, quelle que soit la
grille de l'utilisateur. Elles ne sont pas dérivées de ses critères : elles sont écrites là.

### B2 — les noms sont un objet littéral

`js/profil-etudiant-sections-affichage.js:3639` :

```js
const noms = { structure: 'Structure', rigueur: 'Rigueur', plausibilite: 'Plausibilité',
               nuance: 'Nuance', francais: 'Français' };
return noms[cle] || cle;
```

Le repli `|| cle` afficherait la clé brute — un aveu que le cas « autre critère » a été entrevu sans
être traité.

---

## C · Dans le calcul — le point bloquant

`js/profil-etudiant-calculs.js:922` :

```js
const regexCritere = /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi;
```

Les scores par critère ne sont pas lus dans les données structurées : ils sont **extraits du TEXTE de
la rétroaction** par une expression régulière, puis ventilés par une cascade de `if / else if`
nominale (`nomCritere === 'STRUCTURE'`, `=== 'RIGUEUR'`…).

Trois conséquences, dans l'ordre de gravité :

1. **Les noms des cinq critères sont dans la regex.** Une grille « Méthode / Résultats / Discussion »
   ne produit aucun score : les cinq barres restent vides, sans message.
2. **Les niveaux IDME aussi** : `([IDME])`. Une échelle A-B-C-D ne matche rien — alors que les
   libellés IDME sont censés être entièrement configurables par l'utilisateur.
3. **Le mécanisme lui-même est fragile** : on relit de la prose pour retrouver une donnée qui a été
   écrite structurée quelque part. Toute reformulation d'un libellé de rétroaction casse le calcul,
   en silence.

⮕ **Pour tout utilisateur qui n'est pas Grégoire, le bloc « Forces et défis » du profil étudiant est
muet.** Ce n'est pas une question d'aide : c'est une fonctionnalité qui ne s'adresse qu'à une seule
grille.

---

## Ce que je n'ai pas fait

1. **Rien n'est corrigé.** L'audit s'arrête au constat, comme le veut la règle du projet.
2. **Je n'ai pas vérifié au navigateur** ce que voit réellement un utilisateur avec une autre grille :
   les barres sont-elles vides, à zéro, ou absentes ? Le code suggère « vides », ce n'est pas mesuré.
3. **`js/interventions.js`, `js/evaluation.js`, `js/pratiques/*`** portent aussi des mentions SRPNF
   (4, 4 et 12) que je n'ai pas dépouillées une par une — le périmètre demandé était l'aide.
4. **Les 4 mentions de `styles.css`** sont des commentaires de section, sans effet.
