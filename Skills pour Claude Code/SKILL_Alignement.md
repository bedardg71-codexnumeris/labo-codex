---
name: alignement
description: >
  Module Alignement de l'application Labo Codex (affiché « Alignement
  pédagogique », fichiers et clés `planification*`). Outil de carte mentale
  interactive qui aide les enseignants du collégial à planifier leur
  enseignement en rendant visible l'alignement pédagogique (objectifs →
  activités → évaluations). Couvre le macro (organisation des séquences sur le
  trimestre de 15 semaines) et le micro (structure des leçons et activités).
  Utiliser ce skill pour tout travail touchant à la carte mentale, à la
  planification des leçons, à la conception pédagogique, au design curriculaire,
  à l'organisation des séquences d'enseignement, ou au module Alignement.
  Pour le cadre théorique (ELLAC, SOLO, PAN, cartouches), voir
  SKILL_Ecosysteme_classe.md. Pour l'architecture technique et les autres
  modules, voir SKILL_labo_codex.md.
---

# Module Alignement — Labo Codex

> **Nommage.** Le module est **affiché « Carte d'alignement »** depuis le
> 9 août 2026 (#426 ; il s'appelait « Alignement pédagogique » avant — les six
> onglets voisins de Conception nomment un objet de travail, pas une théorie).
> Source : `js/config.js`, section `{ id: 'carte', label: "Carte d'alignement" }`.
> Son code historique porte le préfixe `planification*` : `js/planification.js`
> (orchestration), `js/planification-carte.js` (éditeur de carte mentale, le
> gros du module), `js/planification-donnees.js` (couche stockage),
> `js/planification-bibliotheque.js` (bibliothèque partagée). Le présent skill
> dit « module Alignement » pour l'expérience utilisateur et « code
> `planification*` » pour les fichiers. Les deux désignent la même chose.

## 1. Vision et principes

### Ce que ce module fait

Le module Alignement est un **outil de conception**, pas un formulaire à
remplir. Il offre à l'enseignant une carte mentale interactive où il organise
ses idées, relie ses objectifs à ses activités et à ses évaluations, et construit
progressivement la structure de son cours sur 15 semaines.

L'outil est en soi pédagogique : il enseigne la méthode de planification en même
temps qu'il aide à planifier.

### Principes directeurs

1. **Outil de conception, pas grille du produit final.** La carte mentale
   accompagne le processus de réflexion. L'enseignant peut commencer par
   n'importe quel point d'entrée (objectifs, activités, évaluations) et
   construire itérativement.

2. **L'esprit, pas la lettre.** Le cadre théorique (Bissonnette, Gauthier,
   Direct Instruction) fournit des catégories et une logique, mais ne doit pas
   devenir un carcan. L'enseignant reste libre de sa démarche.

3. **Alignement pédagogique rendu visible.** Les liens entre nœuds de la carte
   *sont* l'alignement curriculaire. Ce n'est pas une vérification après coup,
   c'est un résultat naturel du processus de conception.

4. **Du macro au micro.** Le module couvre deux échelles :
   - **Macro** : organisation des séquences dans le trimestre de 15 semaines
   - **Micro** : structure des leçons et activités dans les séances

5. **Module autonome, données partagées.** Le module Alignement est souverain
   dans son domaine. Il *lit* les données des autres modules (calendrier,
   horaire, productions, critères) mais ne les modifie pas (principe Single
   Source of Truth).

6. **Public cible : enseignants novices et intermédiaires.** L'outil guide
   sans imposer, explique le jargon, propose des exemples concrets.

---

## 2. Cadre théorique adapté au collégial

Le cadre s'inspire des stratégies de design curriculaire du Direct Instruction
(Bissonnette et Gauthier, 2012), adaptées au contexte collégial québécois.
Ce cadre n'est pas un dogme — il fournit des catégories utiles et une logique
de planification validée par la recherche, tout en laissant place à d'autres
approches pédagogiques.

### Les catégories de la carte mentale

Ces catégories correspondent aux types de nœuds que l'application propose.
Elles sont regroupées en trois niveaux :

**Niveau QUOI (le curriculum à organiser) :**

| Catégorie | Description | Exemple 601-101-MQ |
|-----------|-------------|---------------------|
| **Compétence** | Énoncé ministériel, éléments et critères de performance | 4EF0 : Analyser des textes littéraires |
| **Idées maîtresses** | Concepts-parapluies qui organisent le contenu | Postures de lecture (ELLAC), structures de texte |
| **Connaissances** | Déclaratives (quoi), procédurales (comment), conditionnelles (quand) | Marqueurs de relation (D), rédiger un plan (P), choisir la posture appropriée (C) |
| **Connaissances préalables** | Savoirs requis avant un nouvel apprentissage | Phrase/proposition, unités de sens |

**Niveau COMMENT (les stratégies d'enseignement) :**

| Catégorie | Description | Exemple 601-101-MQ |
|-----------|-------------|---------------------|
| **Stratégies cognitives** | Démarches explicites enseignées aux élèves | 20 stratégies de lecture, stratégies d'écriture |
| **Dispositifs de soutien** | Étayage, outils structurants, retrait graduel | Référentiels, schémas, pratique guidée → autonome |
| **Révision et réutilisation** | Occasions de pratique suffisantes, réparties, cumulatives, variées | Rappels en début de séance, exercices de transfert |

**Niveau QUAND (l'organisation temporelle) :**

| Catégorie | Description | Exemple 601-101-MQ |
|-----------|-------------|---------------------|
| **Séquences** | Groupes de leçons vers un objectif commun | Phase 1 : Fondations (sem. 1-5, artefacts 1-4) |
| **Séances** | Rencontres physiques (héritées du calendrier) | Lundi 10h-12h, local D-123 |
| **Leçons** | Unités d'enseignement avec structure interne | Leçon : Repérer les marqueurs de relation |
| **Activités** | Actions concrètes dans une leçon | Modelage (10 min), pratique guidée (15 min) |

### L'alignement comme réseau de liens

Les liens entre nœuds sont typés :

| Type de lien | Signification | Exemple |
|--------------|---------------|---------|
| `vise` | L'activité vise cet objectif | Leçon → Élément de compétence |
| `mobilise` | L'activité mobilise cette connaissance | Activité → Connaissance procédurale |
| `prerequis_de` | Cette connaissance est prérequise à | Conn. préalable → Conn. nouvelle |
| `evalue_par` | Cet objectif est évalué par | Élément de compétence → Production |
| `soutenu_par` | Cet apprentissage est soutenu par | Stratégie → Dispositif de soutien |
| `revise_dans` | Cette connaissance est révisée dans | Connaissance → Activité de révision |
| `sequence_avant` | Cette séquence précède | Séquence A → Séquence B |

L'application peut vérifier la cohérence de l'alignement en analysant ce réseau :
un élément de compétence sans production liée signale un trou dans l'évaluation ;
une connaissance sans activité de révision signale un risque d'oubli.

---

## 3. Architecture du module

### Position dans la hiérarchie

```
TRIMESTRE (Réglages)
    ├─ COURS (Réglages)
    │   ├─ GROUPE (Réglages)
    │   │   ├─ ÉTUDIANTS
    │   │   ├─ PRODUCTIONS (Construction)
    │   │   └─ ÉVALUATIONS (Évaluations)
    │   │
    │   └─ ALIGNEMENT
    │       ├─ Carte mentale du cours (nœuds + liens)
    │       ├─ Séquences (types de nœuds)
    │       ├─ Leçons (types de nœuds)
    │       └─ Activités (types de nœuds)
```

Conceptuellement, le plan de cours est rattaché au **cours**, pas au groupe :
un même plan s'applique potentiellement à plusieurs groupes.

### Données lues (lecture seule)

| Source | Données | Clé de stockage |
|--------|---------|-----------------|
| Réglages | Calendrier 15 semaines, horaire, séances | `{trimestreId}_calendrier`, `{trimestreId}_horaire` |
| Construction | Productions (artefacts) | `{trimestreId}_productions` |
| Construction | Grilles de critères | `{trimestreId}_grillesTemplates` (namespacée depuis #358, 28 juin 2026 — via `cle()`) |
| Construction | Échelles de performance | `{trimestreId}_echellesTemplates` (idem #358) |
| Construction | Pratique de notation | `{trimestreId}_modalitesEvaluation` (namespacée depuis le 24 mai 2026 — via `cle()`) |

### Données propres (écriture)

Le module stocke **une seule clé** par trimestre, via `db.getSync/setSync` et la
fonction `cle()` (voir `js/planification-donnees.js`, constante `CLE_DONNEES`) :

| Donnée | Clé de stockage | Namespace |
|--------|-----------------|-----------|
| Toutes les cartes du trimestre | `{trimestreId}_planification_mindmap` | Par trimestre |

> **Important.** Il n'existe PAS de clés séparées pour les séquences ou les
> leçons. Séquences, leçons et activités sont des **types de nœuds à l'intérieur
> de la carte mentale**, donc stockés dans la même clé. Structure du document :
> ```
> {
>   index: { active: 'carte_1', compteurCartes: 1, cartes: [ { id, nom, dateCreation } ] },
>   cartes: { carte_1: { compteur, compteurLiens, noeuds: [...], liens: [...] }, ... }
> }
> ```
> Un trimestre peut contenir plusieurs cartes ; `index.active` désigne la carte
> affichée. Une migration one-shot (`migrerDonneesProto`) convertit l'ancien
> format prototype `proto_cm_*` du localStorage vers ce format namespacé.

### Patron de conception

Le module suit le patron **Bibliothèque + Assemblage** de l'application :

- **Bibliothèque** : `js/planification-bibliotheque.js`. Cartes/alignements
  réutilisables, partagés entre cours/trimestres. `importerDepuisBibliotheque`
  deep-clone une carte de la bibliothèque vers le trimestre actif ;
  `exporterCartePourBibliotheque` fait l'inverse.
- **Assemblage** : la carte mentale du cours est un assemblage spécifique pour
  un cours donné dans un trimestre donné.

---

## 4. Structure d'une leçon

La structure interne d'une leçon (nœud de type leçon dans la carte) s'inspire de
l'enseignement explicite, mais reste adaptable. Les phases ne sont pas
obligatoires — l'enseignant peut en ajouter, en retirer, ou en modifier l'ordre.

### Phases suggérées

| Phase | Rôle | Durée type | Enseignant | Élèves |
|-------|------|------------|------------|--------|
| **Ouverture** | Lancer | 5 min | Capter l'attention, objectif, préalables, justification | Écoute active |
| **Modelage** | Démontrer | 10 min | Verbaliser sa pensée (« je fais »), exemples, vérifier | Observer les processus |
| **Pratique guidée** | Accompagner | 15 min | Guider, questionner, circuler, rétroaction (« nous faisons ») | Pratiquer avec soutien |
| **Pratique autonome** | Consolider | 15 min | Superviser, vérifier la fluidité (« vous faites ») | Pratiquer seul |
| **Objectivation** | Clore | 5 min | Synthétiser (Quoi ? Quand ? Comment ?), annoncer la suite | Consolider |

> **Note sur le modèle de données.** Le stockage réel d'une leçon est celui d'un
> **nœud de la carte** (`noeuds[]` : id, type, position, contenu, liens vers
> d'autres nœuds), pas une structure dédiée `LECON_xxx` avec un tableau `phases`
> figé. La grille de phases ci-dessus est un **guide pédagogique** pour ce qu'un
> nœud-leçon peut contenir, pas un schéma imposé par le code. Avant d'ajouter des
> champs au modèle, lire la forme effective des nœuds dans
> `js/planification-carte.js` et `js/planification-donnees.js`.

---

## 5. Flux de travail de l'enseignant

L'enseignant n'est pas obligé de suivre un ordre linéaire. La carte mentale
accueille tous les chemins de pensée. Voici un parcours typique :

### Parcours suggéré (planification à rebours)

1. **Poser la compétence** — Importer ou saisir la compétence ministérielle
   (ex. 4EF0) avec ses éléments et critères de performance

2. **Identifier les idées maîtresses** — Quels concepts-parapluies organisent
   tout l'enseignement ?

3. **Décliner les connaissances** — Pour chaque idée maîtresse, quelles
   connaissances (D/P/C) ? Quels préalables ?

4. **Esquisser les séquences** — Regrouper les apprentissages en séquences
   progressives (simple → complexe) sur les 15 semaines

5. **Détailler les leçons** — Pour chaque séquence, quelles leçons ? Quelles
   phases, activités, dispositifs de soutien ?

6. **Placer les évaluations** — Relier les productions existantes (de
   Construction) aux séquences et vérifier l'alignement

7. **Planifier la révision** — Répartir les occasions de révision de façon
   suffisante, cumulative et variée

8. **Vérifier l'alignement** — L'application signale les incohérences

### Se retrouver dans une grande carte (navigation)

Une carte de cours réelle dépasse largement l'écran : celle du 601-101 de
Grégoire tient entière à 25 % de zoom, taille à laquelle elle est illisible.
Quatre outils travaillent ENSEMBLE, et il faut les penser comme un tout —
prendre du recul, repérer, lire, atterrir :

| Outil | Ce qu'il fait | Où |
|-------|---------------|-----|
| **Recentrer** (⌘1) | défile jusqu'au contenu, SANS toucher au zoom | barre d'outils |
| **Tout voir** | ajuste le zoom pour que la carte entière tienne (plafonné à 100 %) | barre d'outils |
| **Loupe** (L) | grossit une zone sous le pointeur sans changer le zoom de la carte ; c'est une VUE, on n'y écrit pas | barre d'outils |
| **Recherche** | trouve les blocs par mot-clé, les allume sur le canevas, les liste | barre d'outils |
| **Planificateur** | navigue par semaine / séquence / leçon | palette flottante |

**La recherche** (`chercherDansCarte`, 15 août 2026) fouille quatre gisements
de texte : le **titre**, la **description** (Inspecteur), les **objectifs** des
leçons, et le **libellé du type de bloc**. Ce dernier est un arbitrage explicite
de Grégoire — il permet « montre-moi toutes les évaluations » — et il est
bruyant par nature, d'où l'étiquette « où » portée par chaque résultat : une
correspondance de type ne doit pas se lire comme une correspondance de contenu.

Trois points à connaître avant d'y toucher :

- **Le repli des accents passe par une table d'index**, pas par un
  `normalize('NFD')` global. Motif : on cherche dans le texte replié mais on
  AFFICHE un extrait découpé dans le texte d'origine ; sans table, la fenêtre
  glisse d'une lettre par accent rencontré avant la trouvaille. Et un accent
  peut arriver DÉJÀ SÉPARÉ de sa lettre (forme décomposée de macOS, celle de
  Grégoire), auquel cas aucune égalité de longueur ne tient.
- **Le halo des blocs trouvés porte deux liserés**, un clair et un sombre,
  autour de l'ambre. Le fond du canevas est choisi par l'enseignant parmi douze
  teintes, indépendamment du mode clair/sombre : aucune couleur fixe ne
  contraste contre les douze. Mesure du 15 août — ambre seul, 7 cas sur 24 sous
  le seuil WCAG de 3:1, jusqu'à 1,19:1 sur « Brume ». Ne pas « simplifier ».
- **Les halos survivent à `reconstruireDOM`** parce que la recherche est
  RECALCULÉE à la fin de celle-ci. Re-poser les anciens halos laisserait un
  bloc supprimé listé comme trouvé.

### Les règles des liens (15 août 2026)

Deux règles, posées sur retour terrain de Grégoire.

**1. Un lien contourne, il ne traverse pas.** Le tracé se décide en trois
étages, dans cet ordre — et l'ordre est le fond de l'affaire :

| Étage | Ce qu'il fait | Quand |
|-------|---------------|-------|
| **Choix des ports** | essaie les 16 combinaisons et garde celle qui ne traverse rien | toujours ; règle la majorité des cas seul |
| **Déviation** | ajoute un ou deux points de passage à côté de l'obstruction | seulement si aucune combinaison n'est libre |
| **Moins mauvais** | garde le tracé qui traverse le moins | si même la déviation ne dégage pas |

Trois points à connaître avant d'y toucher :

- **Les conteneurs ancêtres ne sont PAS des obstacles.** Un lien d'un bloc de
  la leçon A vers un bloc de la leçon B doit sortir du cadre de A et entrer
  dans celui de B. Les compter rendrait tout tracé impossible.
- **L'obstruction s'ACCUMULE d'un essai à l'autre.** Contourner les seuls blocs
  traversés fait atterrir sur leurs voisins ; la boîte grossit jusqu'à couvrir
  l'obstruction entière. Et il faut **deux** points de passage (les coins) pour
  contourner une boîte large : un seul, posé au milieu, replonge dedans.
- **Le libellé se pose SUR la courbe**, pas au milieu géométrique des deux
  extrémités — ce point n'appartient pas au tracé, et le libellé atterrissait
  sur des blocs sans rapport.

⚙ **Le contournement est un RÉGLAGE** (Actions ▸ « Liens : contourner les
blocs »), actif par défaut. Le décocher redonne le tracé direct : ports choisis
sur le seul axe dominant, une courbe, libellé au milieu géométrique — et aucun
obstacle calculé, d'où `traversees: null` et non `0` (non mesuré n'est pas
« aucune »). Les deux chemins sont VIVANTS et éprouvés : ce n'est pas un repli
de compatibilité, c'est un choix d'affichage. La préférence est lue **une fois**
et gardée en mémoire — `calculerTraceLien` tourne pour chaque lien à chaque
redessin, l'interroger dedans paierait un accès au stockage par lien et par
image pendant un glisser.

**2. On RÉACTIVE, on n'acquiert pas.** Une connaissance reliée à une
**Ouverture** ou à une **Révision** prend « se réactive dans » et non
« s'acquiert par » : l'Ouverture rappelle les concepts de la leçon précédente,
la Révision les réutilise — ni l'une ni l'autre ne les enseigne. Les quatre
autres étapes d'enseignement explicite (Modélisation, Pratique guidée, Pratique
autonome, Clôture) gardent « s'acquiert par » : c'est là que la connaissance se
construit. La liste vit dans `TYPES_REACTIVATION`.

⚠ **La règle est consultée APRÈS la table brute et AVANT le repli sur la
famille** (`normaliserType`), qui écraserait l'Ouverture en « activité ». Et il
a fallu **retirer** les huit paires `connaissance ↔ révision` de `VERBES_AUTO`
pour que la règle serve : la table brute gagne toujours, donc les y laisser
aurait rendu le changement sans effet — le genre de correctif qui a l'air fait
et ne fait rien. Les deux paires `révision ↔ évaluation` restent : une révision
se vérifie bien par une évaluation.

⚠ **Les liens DÉJÀ ENREGISTRÉS gardent le verbe qu'ils portaient.** Le verbe
automatique s'applique à la CRÉATION d'un lien, pas rétroactivement. Un lien
posé avant le 15 août entre une connaissance et une Ouverture affiche donc
encore « s'acquiert par » — il se corrige d'un clic dans le menu du lien.

⚠ **Le menu d'un lien offre TOUS les verbes**, sous ceux qu'il suggère. Avant,
une résolution « verticale » n'en offrait qu'un : quand ce verbe unique était le
mauvais, l'utilisateur n'avait aucun moyen de le corriger. Un défaut de la table
devenait une impasse — c'est ce qui rendait le cas de l'Ouverture insoluble.

### Vérifications automatiques

L'application peut signaler :

- Élément de compétence sans production liée (trou dans l'évaluation)
- Connaissance sans activité de révision (risque d'oubli)
- Séquences sans progression logique (complexité non croissante)
- Révision concentrée en fin de trimestre (mal répartie)
- Temps planifié incohérent avec les heures disponibles
- Productions placées avant les séquences d'apprentissage correspondantes

---

## 6. Intégration avec le monitoring

Le module Alignement crée un pont entre la conception (en amont) et le
suivi (en cours de trimestre) :

| Alignement (amont) | Monitoring (en cours) | Lien |
|-----------------------|----------------------|------|
| Séquence planifiée sem. 3-5 | Indices A-C-P à la sem. 4 | Savoir *quoi* observer et *pourquoi* |
| Objectif : marqueurs de relation | Critère SRPNF « Structure » | Le critère évalue ce qui a été enseigné |
| Révision planifiée sem. 7 | Blocage émergent détecté sem. 6 | La révision est déjà prévue |
| Production planifiée sem. 8 | Indice C (Complétion) | Anticiper le rythme de production |

---

## 7. Contraintes techniques

Voir `CLAUDE.md` (vanilla JS ES6+, stockage hybride localStorage/IndexedDB,
hors-ligne, CSP, Single Source of Truth, namespacing par trimestre, modules
protégés). Spécificité du module : l'éditeur de carte mentale est implémenté en
vanilla JS, sans bibliothèque externe (voir `js/planification-carte.js`).

---

## 8. Échelle IDME et critères SRPNF

I/D/M/E et S/R/P/N/F sont définis dans `SKILL_Ecosysteme_classe.md`
(propriétaire désigné par `CLAUDE.md`). S'y reporter pour les seuils, la
validation empirique et les cartouches.

---

## 9. Coordination avec les autres skills

| Skill | Rôle | Quand le consulter |
|-------|------|--------------------|
| `SKILL_Ecosysteme_classe.md` | Cadre pédagogique : ELLAC, SOLO, PAN, cartouches, manuel élève | Cohérence des catégories avec le cadre théorique |
| `SKILL_labo_codex.md` | Architecture technique, modules, indices A-C-P-E, pratiques de notation | Intégration technique du module, clés de stockage, principes SSOT |
