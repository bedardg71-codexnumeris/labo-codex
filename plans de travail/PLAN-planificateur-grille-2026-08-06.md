# PLAN — Planificateur en grille temporelle (fusion Navigation × Vue calendrier)

> **Écrit le 6 août 2026**, en fin de session d'alignement du 601-101.
> **À exécuter plus tard** — rien n'est commencé côté code.
> Référence conceptuelle : `docs/utilisateur/METHODE-ALIGNEMENT.md` §6 quater.

---

## 1. Ce qu'on construit, en une phrase

Une **grille temporelle** — une colonne, une rangée par semaine du trimestre —
qui remplace à la fois la palette « Navigation » et la « Vue calendrier », et
dans laquelle on **déplace verticalement** séquences et leçons.

Inspiration explicite : la palette **« Ordre de composition » de Keynote**
(rangées numérotées, glisser vertical, élément sélectionné visible).

---

## 2. Pourquoi ce chantier n'est pas comme les précédents

Tout ce qui a été livré le 6 août était **additif, local, réversible**, et
dicté par une friction précise. Celui-ci est **soustractif et structurel** : il
supprime une vue, en déplace une autre, touche deux modules couplés, et n'est
déclenché par aucun empêchement — Grégoire peut travailler sans lui.

D'où ce plan écrit. La méthode « friction → correctif » a atteint sa limite.

---

## 3. Décisions déjà prises (ne pas re-litiger)

| # | Décision | Prise le |
|---|----------|----------|
| D1 | **L'ordre devient une donnée explicite** (option B), et cesse d'être déduit de la position verticale sur le canevas | 6 août |
| D2 | **Forme = grille temporelle**, pas arbre. Une rangée par semaine, numérotées à gauche | 6 août |
| D3 | **L'ancrage appartient à la LEÇON.** Les niveaux supérieurs dérivent leur étendue de leurs leçons | 6 août |
| D4 | **Ce qui se déplace dans la grille** : leçons, séquences, ensembles. Le contenu (activités, connaissances, évaluations) reste dans le canevas | 6 août |
| D5 | **Les rangées dérivent du cadre du trimestre**, jamais reconfigurées ici | 6 août |
| D6 | La grille vit dans un **panneau du module Alignement**, pas dans un onglet séparé | 6 août |
| D7 | La grille se construit au niveau du **cours** (le patron), jamais du groupe | 6 août |

### Le point de départ factuel (vérifié au code le 6 août)

- **Aucun ordre stocké.** `obtenirSequencesCarte()` trie par `a.y - b.y`
  (`planification-carte.js`) — la position verticale décide de l'ordre.
- **Deux vues, deux ordres.** La palette suit l'ordre spatial, la Vue calendrier
  trie par `metadata.semaineDebut` qui retombe sur son repli `999` pour toutes.
  Constat terrain : la palette commence par « Sem. 10 », la Vue calendrier par
  « Sem. 1 ».
- **Le cadre du trimestre a déjà les rangées** : `nombreSemaines`,
  `semainePlanificationDebut/Fin`, `semaineExamensDebut/Fin`
  (`trimestre-v2-init.js:285-288`).
- **La Vue calendrier est du post-traitement DOM** : elle recycle
  `genererSeancesHTML()` puis retire des éléments (`organisateur.js`,
  `rafraichirCalendrier`). Elle doit être **réécrite**, pas déplacée.
- **La carte n'est rattachée à aucun cours.** `planification-donnees.js` indexe
  par trimestre seulement — pas un `coursId`.

---

## ✅ ÉTAT AU 6 AOÛT AU SOIR

**Q1 à Q4 tranchées** (+ une Q5 apparue à l'audit), **lot 1 LIVRÉ en 1.38.0.**
Détail des décisions et de leurs conséquences : `docs/utilisateur/METHODE-ALIGNEMENT.md`
§ « LIVRÉ (6 août, 1.38.0) ». Prochaine étape : **séquences de séquences**, puis lot 2.

| # | Décision |
|---|----------|
| Q1+Q2 | Zone « non planifié » unique en pied de grille |
| Q3 | Non — indicateur, pas déplacement du bloc sur le canevas |
| Q4 | Séquences de séquences **après le lot 1, avant le lot 2** |
| Q5 | Les deux champs de l'inspecteur de séquence **retirés dans le lot 1** |

**⚠ L'audit des call-sites a trouvé 26 sites, pas les « ~12 » annoncés au §5** :
12 de plus dans `planification-carte.js` (exports TXT/TSV/MD, sélecteurs,
Vue calendrier) et une sentinelle existante (`sentinelle-echappement-audit-386`)
qui verrouillait les deux champs supprimés. Compter les call-sites d'une
structure partagée **avant** d'annoncer un périmètre : le plan sous-estimait de
moitié.

---

## 4. Questions à trancher AVANT le lot 1

| # | Question | Pourquoi ça bloque |
|---|----------|--------------------|
| Q1 | Une **séquence vide** (0 leçon) n'a aucune position dérivée. Ancrage propre, ou zone « non planifié » en pied de grille ? | Le 601-101 en a une (« Sem. 9 – ») : le cas se présentera au premier essai |
| Q2 | Une leçon **sans semaine assignée** : où l'afficher ? Même zone « non planifié » ? | Toutes les leçons existantes sont dans ce cas à la migration |
| Q3 | Déplacer une leçon dans la grille **repositionne-t-il le bloc sur le canevas** ? | Si non, l'ordre logique et la disposition spatiale divergent visiblement |
| Q4 | Les **séquences de séquences** (tranchées, non livrées) : avant ou après ce chantier ? | Construire la grille sur 3 niveaux fixes puis la rendre récursive = la refaire |

**Recommandation sur Q4** : livrer les séquences de séquences **avant** le lot 2.
Le lot 1 (modèle de données) en est indépendant.

**Recommandation sur Q3** : **non**. La position sur une carte mentale et
l'ordre chronologique sont deux choses différentes — c'est le fondement même de
D1. Mais le dire explicitement à l'usage (un indicateur, pas un déplacement).

---

## 5. Découpage en lots

Chaque lot est **livrable et validable séparément**. Aucun ne laisse l'outil
dans un état intermédiaire inutilisable.

### ✅ Lot 1 — L'ordre devient une donnée *(socle, invisible)* — LIVRÉ 1.38.0

- `metadata.semaine` sur les leçons (entier, ou absent = non planifié).
- Fonction de dérivation : étendue d'une séquence = min/max des semaines de ses
  leçons ; récursif pour les ensembles.
- Migration one-shot idempotente : **ne rien deviner**. Les numéros de semaine
  vivant aujourd'hui dans les titres (« Sem. 3 - … ») ne doivent PAS être
  extraits par expression régulière — trop fragile, et ce serait interpréter à
  la place de l'enseignant. Tout part « non planifié », Grégoire assigne.
- Le tri par position `y` reste en place tant que le lot 2 n'est pas livré.
- **Sentinelle** : dérivation d'étendue (leçons dispersées, séquence vide,
  imbrication), migration idempotente, aucune extraction depuis les titres.

### Lot 2 — La grille en lecture *(remplace les deux vues)*

- Panneau dans le module Alignement (patron `rendrePaletteFlottante` existant).
- Rangées dérivées du cadre ; semaines spéciales étiquetées.
- Contenu de chaque rangée : séquences et leçons ancrées à cette semaine.
- Niveau de détail réglable (replier/déplier le contenu des leçons) — c'est ce
  qui préserve les **deux** intentions : se déplacer vite *et* lire le déroulé.
- Zone « non planifié » selon Q1/Q2.
- Clic = naviguer vers l'élément dans le canevas (comportement actuel de la
  palette, conservé).
- **Zéro-dette** : la Vue calendrier de l'onglet « Plan de la leçon » est
  RETIRÉE dans le même lot (l'Organisateur, lui, reste — objectif dérivé,
  enseignement explicite, rétroactions).
- **Sentinelle** : rangées dérivées et non redemandées, ordre unique, plus
  aucune trace de l'ancien post-traitement DOM.

### Lot 3 — Le déplacement

- Glisser vertical d'une leçon d'une semaine à l'autre → écrit `metadata.semaine`.
- Glisser d'une séquence → déplace ses leçons en bloc, en conservant leurs
  écarts relatifs.
- Cibles tactiles iPad (rappel : 44 px recommandés).
- **Sentinelle** : conservation des écarts au déplacement de groupe, bornes
  (pas de semaine 0 ni au-delà du cadre), annulation.

### Hors périmètre (nommé pour ne pas déraper)

- La déclinaison **par groupe** (§ ci-dessous).
- Le rattachement carte → cours.
- L'export repensé qui remplacera les boutons « Copier » retirés en 1.36.0.
- Les liens objectif → activité.

---

## 6. La suite, à ne pas construire maintenant

**Un alignement, N planifications.** Un enseignant a plusieurs groupes ; la même
séance a lieu le lundi pour l'un, le mardi pour l'autre.

| Niveau | Rattaché à | Ce qu'il porte |
|--------|-----------|----------------|
| Alignement (patron) | le **cours** | progression, objectifs, assignation aux **semaines** |
| Planification (instance) | le **groupe-cours** | **dates réelles** dérivées de l'horaire, écarts propres au groupe |

*La semaine est commune, le jour appartient au groupe.* C'est le patron
Bibliothèque + Assemblage du projet, et la doctrine du skill Alignement §3 —
laquelle **n'est pas implémentée** : la carte n'a aucun `coursId`.

C'est précisément pourquoi **D7** existe : construire la grille au niveau du
cours, même avec un seul groupe, laisse la porte ouverte sans migration. Même
raisonnement que les identifiants d'objectifs livrés en 1.34.0.

---

## 7. Rappels de méthode pour l'exécution

- **Un lot = un commit = une release.** `node scripts/release.mjs` depuis la
  **racine** (trois échecs silencieux le 6 août pour l'avoir lancé depuis
  `tests/`).
- **Cache-busting obligatoire** sur tout fichier touché (`?v=` dans
  `index.html`) — sinon le navigateur sert l'ancienne version et le travail
  paraît sans effet (classe #364, rencontrée deux fois le 6 août).
- **Sentinelle break-testée** par lot : faire ROUGIR avant de faire confiance.
  Deux break-tests du 6 août n'ont pas rougi au premier essai — l'un par
  mutation mal recopiée, l'autre par assertion trop faible. Vérifier que la
  mutation touche bien la cible.
- **Auditer les call-sites** avant de changer une structure partagée. Trois
  régressions du 6 août viennent de là : 8 sites d'`organisateur.js` laissés
  sur l'ancienne clé, badges effacés par un mauvais ordre d'appel, et une
  constante de hauteur devenue fausse.
