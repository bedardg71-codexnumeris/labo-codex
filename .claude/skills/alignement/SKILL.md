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
  le skill `ecosysteme-classe`. Pour l'architecture technique et les autres
  modules, voir le skill `labo-codex`.
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

### ⚠⚠ Le cadre ci-dessus et les TYPES implémentés ne coïncident pas

Constat du 16 août 2026, en relisant ce skill après un chantier sur les types.
Les trois tableaux décrivent le cadre **théorique** ; l'application implémente un
sous-ensemble, sous d'autres noms. Une session qui prend ces tableaux pour la
liste des types de nœuds se trompe. Correspondance réelle :

| Catégorie du cadre | Type de nœud | État |
|---|---|---|
| Compétence | `competence` | ✅ |
| Idées maîtresses | `idee-maitresse` | ✅ |
| Connaissances **D/P/C** | `factuelle` `conceptuelle` `procedurale` `metacognitive` | ⚠ **taxonomie différente** — l'app suit Anderson & Krathwohl (4 catégories), le cadre ci-dessus suit déclaratif/procédural/conditionnel (3) |
| Connaissances préalables | *(aucun type)* — case « Préalable » de l'Inspecteur | ⚠ modificateur, plus une couleur depuis le 16 août |
| Stratégies cognitives | *(aucun type)* | ❌ **jamais implémenté** |
| Dispositifs de soutien | `soutien` | ✅ (renommé) |
| Révision et réutilisation | `revision` | ✅ (renommé) |
| Séquences · Leçons · Activités | `sequence` `lecon` `activite` | ✅ |
| Séances | *(aucun type)* — héritées du calendrier | ✅ par conception |
| — | `expose` | ⚠ **absent du cadre** (ajouté le 8 août : le temps de parole du prof) |
| — | `evaluation` | ⚠ **absent du cadre**, alors que c'est le pivot de la vérification |
| — | les 5 phases d'enseignement explicite | ⚠ absentes du cadre (ajoutées le 7 août) |

⏳ **Trois questions ouvertes, à trancher avec Grégoire — ce ne sont pas des bugs :**
1. Le cadre parle de connaissances **D/P/C**, l'app propose **Anderson**. Lequel
   fait foi ? (Le §5 « Parcours suggéré » dit encore « (D/P/C) ».)
2. Les **stratégies cognitives** n'ont jamais eu de type de nœud. Manque à
   combler, ou catégorie à retirer du cadre ?
3. **Exposé**, **Évaluation** et les cinq phases existent dans l'app sans figurer
   au cadre. Le cadre doit-il les accueillir ?

⮕ Tant que ces trois points ne sont pas tranchés, **le code fait foi pour les
types de nœuds** ; ce cadre reste la référence pédagogique, pas le schéma de
données.

### L'alignement comme réseau de liens

Les liens entre nœuds sont typés :

> ⚠⚠ **CE TABLEAU A ÉTÉ FAUX PENDANT DES MOIS — corrigé le 16 août 2026.**
> Il listait sept identifiants (`vise`, `mobilise`, `prerequis_de`, `evalue_par`,
> `soutenu_par`, `revise_dans`, `sequence_avant`) dont **aucun** n'existait plus
> dans `TYPES_LIENS` : tous avaient été renommés, et ne survivent que dans
> `MIGRATION_VERBES` / `VERBES_COMPAT`, qui migrent les vieilles cartes. Une
> session qui s'y fiait écrivait des identifiants morts.
> ⮕ La source de vérité est `TYPES_LIENS` dans `js/planification-carte.js`.

| Type de lien | Signification | Exemple |
|--------------|---------------|---------|
| `se_decline_en` | La compétence se décline en | Compétence → Idée maîtresse |
| `se_concretise_dans` | L'idée maîtresse se concrétise dans | Idée maîtresse → Séquence / Leçon |
| `s_acquiert_par` | La connaissance s'acquiert par | Connaissance → Activité |
| `se_reactive_dans` | La connaissance se réactive dans | Connaissance → Ouverture / Révision |
| `se_verifie_par` | L'objectif se vérifie par | Idée maîtresse / Connaissance → Évaluation |
| `s_appuie_sur` | S'appuie sur (préalable) | Conn. nouvelle → Conn. préalable |
| `complete` | Complète (horizontal) | Connaissance ↔ Connaissance |
| `conduit_a` | Conduit à (horizontal) | Activité ↔ Activité |
| `est_mobilise_par` | Est mobilisé par (horizontal) | Connaissance ↔ Connaissance |

Anciens identifiants (`vise`, `mobilise`, `prerequis_de`, `evalue_par`,
`soutenu_par`, `revise_dans`, `sequence_avant`, `developpe`, `requiert`) :
**legacy uniquement**, migrés au chargement. Ne jamais en écrire de nouveaux.

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

> ⚠ **DEUX NOMS SUR CINQ NE SONT PAS CEUX DE L'APPLICATION** — aligné le 16 août
> 2026. Le tableau disait « Modelage » et « Objectivation » ; l'application dit
> **Modélisation** et **Clôture** depuis leur entrée dans `TYPES` le 7 août, et
> ce sont ces libellés que Grégoire lit dans le menu de l'en-tête. Les noms de
> la littérature sont conservés entre parenthèses : ils restent justes, ils ne
> sont simplement pas ce qui s'affiche. Source : `PHASES_EE` + `TYPES`.

| Phase (app) | Rôle | Durée type | Enseignant | Élèves |
|-------|------|------------|------------|--------|
| **Ouverture** | Lancer | 5 min | Capter l'attention, objectif, préalables, justification | Écoute active |
| **Modélisation** *(modelage)* | Démontrer | 10 min | Verbaliser sa pensée (« je fais »), exemples, vérifier | Observer les processus |
| **Pratique guidée** | Accompagner | 15 min | Guider, questionner, circuler, rétroaction (« nous faisons ») | Pratiquer avec soutien |
| **Pratique autonome** | Consolider | 15 min | Superviser, vérifier la fluidité (« vous faites ») | Pratiquer seul |
| **Clôture** *(objectivation)* | Clore | 5 min | Synthétiser (Quoi ? Quand ? Comment ?), annoncer la suite | Consolider |

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

▣ **Les liens DÉJÀ ENREGISTRÉS sont basculés au chargement de la carte**
(15 août 2026, demande de Grégoire). Le verbe automatique ne joue qu'à la
CRÉATION d'un lien : sans cette bascule, une carte porterait deux verbes pour la
même relation selon la date où chaque lien a été tracé. La bascule vit dans la
boucle de migration de `chargerCarte`, avec les autres.

Trois bornes, et elles sont testées :

- **elle ne touche QUE** les liens portant aujourd'hui « s'acquiert par » ET
  dont le couple résout maintenant « se réactive dans » ;
- **elle ne touche PAS à la direction**, même quand la résolution la dirait
  inversée : retourner une flèche qu'il a posée est une transformation d'un
  autre ordre que corriger un libellé, et elle se verrait moins ;
- **elle se DIT** — compte + liste des liens en console, et un toast à l'écran.
  Une réécriture silencieuse de ses données est interdite, même étroite.

Idempotente par construction : après passage le verbe n'est plus « s'acquiert
par », donc rien ne rebascule et plus rien n'est annoncé.

⚠ **Le menu d'un lien offre TOUS les verbes**, sous ceux qu'il suggère. Avant,
une résolution « verticale » n'en offrait qu'un : quand ce verbe unique était le
mauvais, l'utilisateur n'avait aucun moyen de le corriger. Un défaut de la table
devenait une impasse — c'est ce qui rendait le cas de l'Ouverture insoluble.

### Les types de blocs sont PERMUTABLES dans leur famille (16 août 2026)

Demande de Grégoire, généralisant deux décisions qu'il avait déjà prises pour
l'enseignement explicite (le sélecteur d'en-tête du 15 août, la couleur unique
du 9 août). **Le nom du type, dans l'en-tête d'un bloc, est un menu.**

| Famille | Membres permutables | Jeton de couleur |
|---|---|---|
| Intention curriculaire | Compétence, Idée maîtresse | `--planif-couleur-intention` |
| Connaissances | Factuelle, Conceptuelle, Procédurale, Métacognitive | `--planif-couleur-connaissance` |
| Déroulement | Exposé, Activité, Soutien, Révision | `--planif-couleur-deroulement` |
| Enseignement explicite | les cinq phases | `--planif-couleur-enseignement-explicite` |
| Organisation | Séquence, Leçon — **PAS permutables** | `--planif-couleur-organisation` |
| Vérification | Évaluation (seule) | `--planif-couleur-verification` |

▣ **CE QUI AUTORISE LA PERMUTATION, et il faut le revérifier avant d'élargir une
famille** : `TYPES_AVEC_DUREE`, `TYPES_HORS_CLASSE`, `TYPES_AVEC_NIVEAU_COGNITIF`,
`TYPES_SERVANTS_OBJECTIF`, `TYPES_PREALABLE` et la règle de parent légal
répondent toutes **uniformément** à l'intérieur de chaque famille. Une sentinelle
l'exige : un type ajouté sans ses frères ferait perdre une durée en silence.

⚠ **Une seule table n'est pas uniforme** : `normaliserType`, qui résout les
verbes. D'où `signalerVerbesDevenusInexacts` — le verbe n'est jamais réécrit,
mais la divergence est DITE (verdict 3.4 de Grégoire). Voir la règle 2 ci-dessus.

⚠ **Séquence et Leçon n'ont pas de famille**, et ce n'est pas un oubli : une
leçon porte une semaine, un rang de séance et des objectifs qu'une séquence n'a
pas. Les permuter les orphelinerait.

### La visée d'une évaluation — un MODIFICATEUR, pas un type

`metadata.visee` vaut `'formative'`, `'certificative'`, ou est **absent**
(= « pas encore choisi »). Trois états en mémoire, deux entrées au menu.

⚠⚠ **NE JAMAIS transformer ça en deux types.** `evaluation` est le seul type qui
porte `metadata.productionId`, le pont vers les vraies productions du Codex.
Mesuré : la moisson de `main.js` cherche « le nœud Évaluation unique de la
leçon », `planification-export.js` classe ses sections par `type === 'evaluation'`,
et `evaluerObjectif` coche par lui. Deux types nommés autrement tuent les trois,
**en silence**.

⚠ **L'absence n'est pas « certificative ».** `viseeChoisie()` rend `null` tant que
rien n'est posé, et `obtenirLabelNoeud` écrit alors « Évaluation » tout court :
le plan de cours ne doit affirmer que ce que l'enseignant a choisi. `viseeEvaluation()`,
elle, rend toujours une valeur — c'est ce que le menu AFFICHE. Ne pas confondre
les deux lectures. (Le golden master des exports #416 est ce qui a démasqué la
première version, qui labellisait tout « certificative ».)

### Copie et clone — deux gestes, une règle

Distinction posée par Grégoire le 16 août : « une COPIE est indépendante de
l'originale ; un CLONE en est dépendant ». Jusque-là, **tous** les gestes
rendaient un clone sur une feuille, sous des noms qui laissaient croire à une
copie.

> **Sans ⇧ → copie indépendante · avec ⇧ → clone lié.**
> `⌥ glisser` / `⌘D` copient ; `⇧⌥ glisser` / `⇧⌘D` clonent.

- Porte unique : `dupliquerNoeud(noeudId, silencieux, lie)`. **`lie` est faux par
  défaut** — un appelant oublié fera une copie, l'issue inoffensive.
- Un **conteneur** produit toujours une copie indépendante, enfants compris
  (`dupliquerConteneurEnProfondeur` remet `cloneSourceId: null` sur chaque
  enfant — couture testée).
- `detacherDeLaFamille(ids)` libère un clone déjà créé (Actions ▸ Détacher). Sur
  l'**original**, la famille se dissout : il ne peut pas partir en laissant ses
  clones pointés vers lui. Détacher **arrête les propagations futures, il ne
  défait pas les passées.**
- ⚠ `e.key` vaut `'D'` **majuscule** quand ⇧ est enfoncée. Sans ce test, `⇧⌘D`
  est muet.

⚠ **Conséquence sur le §2 de ce skill.** Les « connaissances préalables » y
figurent comme catégorie du cadre théorique. Depuis le 16 août elles n'ont **plus
de couleur propre** sur la carte (`--planif-couleur-prerequis` retiré, décision
de Grégoire) : l'état reste dit dans l'Inspecteur et dans les exports, mais un
préalable ne se distingue plus à l'œil. Il a par ailleurs tranché « on ne retire
pas » la fonction elle-même. ⏳ **Le cadre théorique et l'affichage divergent
donc ici — à réconcilier avec lui.**

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

I/D/M/E et S/R/P/N/F sont définis dans le skill `ecosysteme-classe`
(propriétaire désigné par `CLAUDE.md`). S'y reporter pour les seuils, la
validation empirique et les cartouches.

---

## 9. Coordination avec les autres skills

| Skill | Rôle | Quand le consulter |
|-------|------|--------------------|
| le skill `ecosysteme-classe` | Cadre pédagogique : ELLAC, SOLO, PAN, cartouches, manuel élève | Cohérence des catégories avec le cadre théorique |
| le skill `labo-codex` | Architecture technique, modules, indices A-C-P-E, pratiques de notation | Intégration technique du module, clés de stockage, principes SSOT |
