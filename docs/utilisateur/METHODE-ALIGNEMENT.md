# Méthode d'alignement pédagogique — document vivant

> **Statut** : v0 — amorce du 6 août 2026. Ce document se construit **pendant**
> que Grégoire aligne son cours 601-101 (A2026) dans le module Alignement.
> Il n'est pas un mode d'emploi rédigé d'avance : c'est la **trace d'une
> démarche réelle**, progressivement généralisée.
>
> **Double objectif** :
> 1. Décrire fidèlement comment un enseignant aligne réellement son cours.
> 2. En extraire une **organisation générale** proposable aux prochains
>    utilisateurs — sans jamais prétendre que ce soit la seule.

---

## 0. Convention de lecture : général vs particulier

Chaque section distingue deux plans. La distinction est **la valeur centrale**
de ce document : sans elle, on transformerait les choix d'un enseignant en
prescriptions pour tous.

| Marque | Sens |
|--------|------|
| **▣ GÉNÉRAL** | Ce qui vaut (ou devrait valoir) pour tout enseignant qui aligne un cours. Candidat à devenir instruction. |
| **▢ PARTICULIER** | Les choix propres à Grégoire / 601-101 / A2026. Illustratif, jamais prescriptif. |
| **◈ OUVERT** | Question non tranchée. À résoudre par l'usage, pas par déduction. |

**Règle de promotion.** Un élément passe de ▢ à ▣ seulement quand on peut
énoncer *pourquoi* il vaudrait pour un autre enseignant, d'une autre
discipline. Tant qu'on ne sait pas le dire, il reste particulier.

---

## 1. Le cadre matériel : compter avant de concevoir

**▣ GÉNÉRAL.** Avant de poser le moindre contenu, l'enseignant établit son
**cadre matériel** — le contenant fini dans lequel tout devra entrer :

- Combien de semaines ?
- Combien de séances par semaine, de quelle durée ?
- Donc : combien d'unités d'enseignement au total ?

Ce comptage n'est pas administratif. Il fixe le **budget de temps**, qui est
la contrainte la plus dure de la conception : on peut toujours ajouter une
idée, jamais une semaine.

> **Vocabulaire.** *Période* et *heure* sont couramment confondus dans le
> milieu collégial, alors qu'une période ne fait pas exactement 60 minutes.
> L'application connaît la durée réelle d'une période (`obtenirDureePeriode()`)
> et affiche les charges en périodes — jamais en minutes converties à la main.

**▢ PARTICULIER (Grégoire, A2026).**

| Élément | Valeur |
|---------|--------|
| Cours | 601-101 « Écriture et littérature » |
| Groupes | 1 |
| Trimestre | 15 semaines |
| Séances/semaine | 2, de 2 périodes chacune |
| Charge hebdomadaire | 4 périodes |
| **Total** | **30 séances / 60 périodes** |
| Carte mentale | « Écriture et littérature A26 » |

État du trimestre à l'amorce : **incomplet et assumé** — pas de liste
d'étudiants, pas d'horaire ; un cours assigné et du contenu.

**▣ GÉNÉRAL — enseignement tiré de ce cas.** L'alignement **ne requiert pas**
un trimestre complet. Il précède la logistique : on peut concevoir sans
connaître ses étudiants ni ses plages horaires. C'est un point à dire
explicitement aux nouveaux utilisateurs, qui pourraient croire devoir tout
remplir avant de commencer.

---

## 2. La source de la conception : ni page blanche, ni copie

**▢ PARTICULIER.** Grégoire ne conçoit pas *ex nihilo*. Sa matière première :

1. ses **expériences antérieures** du même cours (601-101 déjà donné) ;
2. ses **observations du trimestre précédent** (H26) — ce qui a fonctionné,
   ce qui a bloqué, ce que le monitorage a révélé ;
3. ses **idées nouvelles** pour l'automne.

**▣ GÉNÉRAL.** La conception d'un cours est presque toujours une **révision
informée**, pas une création. La méthode doit donc accueillir trois entrées :
le déjà-fait, l'observé, le voulu. Un outil qui n'offre que la page blanche
rate le cas le plus fréquent.

**◈ OUVERT.** Quel outillage pour l'entrée « observations du trimestre
précédent » ? L'import inter-trimestre des cartes (1.30.0) couvre le
« déjà-fait ». Le lien entre ce que le monitorage a révélé en H26 et ce qu'on
décide de changer en A26 n'est, lui, **pas outillé du tout**. C'est un candidat
sérieux — la boucle conception → suivi → reconception est précisément la
promesse du produit (skill Alignement, §6).

---

## 3. La démarche : par l'objectif de leçon

**▢ PARTICULIER — la démarche annoncée par Grégoire, en 4 temps :**

1. **Donner un objectif à chaque leçon.**
2. **Enchaîner** les objectifs, et poser les **activités** qui permettent de
   les atteindre.
3. Placer les **connaissances requises** par ces activités.
4. Placer les **évaluations** qui vérifient l'atteinte des objectifs.

**▣ GÉNÉRAL — ce que cette démarche a de remarquable.**

Ce n'est **ni** la planification descendante (compétence → idées maîtresses →
connaissances → leçons), **ni** une planification à rebours pure (partir de
l'évaluation finale). C'est une **entrée par le milieu** : l'unité de départ
est la **leçon** — l'objet que l'enseignant manipule réellement quand il
enseigne.

L'ordre des opérations révèle une logique cohérente :

| Temps | Question posée | Nature du geste |
|-------|----------------|-----------------|
| 1 | *Où veut-on arriver, séance par séance ?* | Poser les **intentions** |
| 2 | *Dans quel ordre, et par quoi y arrive-t-on ?* | Poser la **progression** et les **moyens** |
| 3 | *Que faut-il savoir pour que ça marche ?* | Poser les **conditions** |
| 4 | *Comment sait-on que c'est atteint ?* | Poser les **preuves** |

Autrement dit : **intentions → moyens → conditions → preuves**. Les
connaissances arrivent en position 3, *après* les activités — elles sont
déduites de ce que l'activité exige, non listées a priori comme un programme
de contenus. C'est un renversement notable par rapport au réflexe courant
(« quelle matière dois-je couvrir ? »).

### 3.1 L'objectif de leçon est un maillon, pas une étiquette

**▣ GÉNÉRAL — précision décisive apportée le 6 août.** Poser un objectif par
leçon n'est pas un geste de documentation. Les objectifs de leçon forment une
**chaîne convergente** : chacun prépare le suivant, et tous tendent vers
l'objectif terminal du cours — la compétence du trimestre.

> *« Je dois pouvoir disposer dans ma carte mentale mes différents objectifs
> afin de les aligner globalement les uns avec les autres vers l'objectif
> final, qui est la compétence du trimestre. »*

C'est **la définition opérationnelle de l'alignement** dans cette méthode, et
elle rejoint le principe 3 du module : les liens entre nœuds *sont*
l'alignement. La question à poser à toute leçon devient : **en quoi cet
objectif rapproche-t-il de la compétence terminale ?** Une leçon dont on ne
sait pas répondre est une leçon à revoir.

**Conséquence pour l'outil.** L'objectif ne peut pas être une propriété
enfouie qu'on consulte une leçon à la fois : il faut voir **plusieurs
objectifs ensemble** pour juger de leur enchaînement. D'où le besoin de les
afficher sur la carte (§4.1 bis) — c'est le seul endroit où la convergence est
visible d'un coup d'œil.

**▢ PARTICULIER (601-101, A2026).** Compétence terminale visée :
**être capable de rédiger une analyse littéraire en bonne et due forme.**

**◈ OUVERT — à vérifier par l'usage.** Cette démarche tiendra-t-elle telle
quelle ? Hypothèses de dérive à surveiller :
- Le temps 1 (30 objectifs d'affilée) pourrait s'avérer épuisant hors contexte.
- Les temps 2 et 3 pourraient fusionner en pratique.
- Un aller-retour vers le temps 1 est probable dès que le temps 4 révèle des
  objectifs non évaluables.

Ces dérives ne seront **pas des échecs** : ce sont les données du chantier.

---

## 4. État de l'outil face à cette démarche

Relevé au code le 6 août 2026 (version 1.31.22), pour situer où l'outil
soutient la démarche et où il ne la soutient pas encore.

### 4.1 Ce qui existe

**Types de nœuds** (`planification-carte.js`, `TYPES`) :

| Famille | Types disponibles |
|---------|-------------------|
| Objectifs | Compétence, Idée maîtresse |
| Connaissances (Anderson & Krathwohl) | Factuelle, Conceptuelle, Procédurale, Métacognitive |
| Conteneurs | **Séquence**, **Leçon** |
| Activités | Activité, Soutien, Révision |
| Évaluation | Évaluation |

**Deux notions d'objectif de leçon coexistent déjà** — point directement
pertinent pour le temps 1 de la démarche :

- **Objectif dérivé** (organisateur de leçon) : calculé en remontant les liens
  jusqu'aux idées maîtresses ancêtres, et formulé automatiquement
  « Au terme de la leçon, l'étudiant·e sera capable de… ».
- **Objectif personnalisé** (vue Leçon) : champ de texte libre, éditable,
  signalé par un badge 🎯 sur le nœud.

**◈ OUVERT — décision de méthode.** Ces deux objectifs ne sont **pas
articulés** : l'un est déduit de la structure, l'autre est saisi à la main, et
rien ne les confronte. Or la démarche de Grégoire commence par le second
(saisir l'objectif) alors que l'outil privilégie le premier (le déduire).
Faut-il : les garder indépendants ? Faire du personnalisé un *raffinement* du
dérivé ? Signaler leur divergence comme un défaut d'alignement ? À trancher
par l'usage, pas d'avance.

### 4.1 bis — Diagnostic : pourquoi l'objectif est introuvable

Constat de Grégoire (6 août) : *« J'ai cherché à quel endroit était l'objectif
des leçons, et je ne le trouve pas de façon rapide et intuitive. »*

Vérification au code : le constat est **structurel**, pas un manque d'habitude.
L'objectif de leçon existe à **trois endroits distincts, dont aucun n'est la
carte elle-même**.

| # | Emplacement | Contenu | Problème d'accès |
|---|-------------|---------|------------------|
| 1 | **Vue leçon** (niveau 3 de la carte) | Objectif personnalisé, texte libre éditable | `ouvrirLecon()` fait `zoneTravail.style.display = 'none'` → **la carte disparaît**. On ne peut jamais voir l'objectif *et* la carte ensemble. |
| 2 | **Organisateur** (autre sous-onglet) | Objectif *dérivé* des idées maîtresses, formulé automatiquement | Hors de la carte ; accès par deux menus déroulants (séquence, puis leçon). |
| 3 | **Badge 🎯** sur le nœud | Rien — signale la seule *présence* d'un objectif | **N'apparaît que si l'objectif existe déjà** (condition `_seancesDOM[n.id].objectifPersonnalise`). |

**La cause racine est le point 3** : le seul indice visuel de l'existence de la
fonctionnalité n'apparaît **qu'après** l'avoir utilisée. Une leçon sans
objectif n'offre **aucune affordance** — rien n'indique qu'un champ objectif
existe. C'est un cercle : pour découvrir la fonction, il faut déjà s'en être
servi.

**▣ GÉNÉRAL — principe candidat.** *Ce qui structure la conception doit être
visible sur l'objet conçu, pas dans une vue qui le remplace.* L'objectif est
la boussole de la leçon : il doit être lisible au moment où l'on dispose les
connaissances, les activités et les évaluations — donc **dans** la carte, pas
à côté.

**Besoin exprimé (6 août)** : voir l'objectif de chaque leçon **directement
dans la carte mentale**, pour organiser l'ensemble en le gardant à l'œil ; puis
en entrant dans la leçon, disposer connaissances / activités / évaluations
**orientées par cet objectif**.

### 4.2 ⚠ Risque à connaître AVANT toute saisie massive

L'objectif personnalisé, les notes de leçon et les rétroactions d'activité
sont stockés dans la clé **`planification_seances`**, qui présente deux
défauts connus et non corrigés :

1. **Clé non namespacée.** Elle est absente du registre `CLES_NAMESPACEES`, donc
   `cle()` la retourne **nue** : elle est **partagée entre tous les trimestres
   et avec le mode démo** (constat adverse du 4 août 2026, item BACKLOG #367).
2. **Dictionnaire plat indexé par id de leçon**, alors que les ids de leçon ne
   sont uniques **que par carte** (rouge n°4 de l'audit qualité du 5 août) →
   deux leçons de deux cartes différentes peuvent partager un id et
   **s'écraser mutuellement**.

**Conséquence pratique pour la démarche** : le temps 1 (saisir 30 objectifs de
leçon) investit précisément dans la structure la plus fragile du module. La
décision de migration (#367, jumelée à la clé composite `carteId+leconId`)
devrait être prise **avant** que la saisie représente un travail coûteux à
perdre.

### 4.3 Verbes de liens disponibles

Les liens sont typés et, pour la plupart des couples, **le verbe est déduit
automatiquement** du type des deux nœuds reliés (`VERBES_AUTO`) :

| Verbe | Couple typique |
|-------|----------------|
| se décline en | Compétence → Idée maîtresse |
| se concrétise dans | Idée maîtresse → Leçon / Séquence |
| s'acquiert par | Connaissance → Activité / Soutien / Révision |
| se vérifie par | Idée maîtresse, Connaissance ou Activité → Évaluation |
| s'appuie sur / complète / conduit à / est mobilisé(e) par | Liens horizontaux (connaissance↔connaissance, activité↔activité) |

> **Note de maintenance.** Ces verbes **ne correspondent pas** à ceux
> documentés dans `SKILL_Alignement.md` §2 (`vise`, `mobilise`, `prerequis_de`,
> `evalue_par`, `soutenu_par`, `revise_dans`, `sequence_avant`). Le skill est
> **périmé** sur ce point ; le code fait foi. À corriger dans le skill.

### Dette de documentation à reprendre plus tard

`SKILL_Alignement.md` devra être remis à jour **à la fin du chantier**, pas au
fil de l'eau — les concepts bougent encore. Écarts relevés à ce jour :

| # | Écart | Référence |
|---|-------|-----------|
| D1 | Verbes de liens documentés ≠ verbes du code | §4.3 ci-dessus |
| D2 | Hiérarchie décrite à 3 niveaux ; devient récursive (séquences de séquences) | §5.2 |
| D3 | La séquence y est définie sans son plancher pratique (la semaine) | §5.1 |
| D4 | L'objectif de leçon n'y figure pas comme concept central | §3.1 |
| D5 | Structure de leçon présentée en « phases » (Ouverture → Objectivation) sans lien avec le modèle de données réel | skill §4 |

**◈ OUVERT.** Le temps 2 de la démarche demande d'**enchaîner les objectifs**
(leçon → leçon, dans l'ordre). Aucun verbe de séquencement temporel n'existe
aujourd'hui entre leçons — l'ordre est **spatial** (position x puis y dans le
sommaire). Est-ce suffisant, ou faut-il un lien explicite de progression ?

---

## 5. Séquence, séance, leçon : la question de vocabulaire

### 5.1 ✅ TRANCHÉ (6 août) — la séquence est logique, pas temporelle

**▣ GÉNÉRAL.** La séquence est une unité **logique** : un groupe de leçons
tendues vers un objectif commun. Sa taille **plancher** est en pratique la
semaine ; elle n'a pas de plafond.

Formulation retenue : *l'unité de séquence la plus petite est probablement la
semaine, mais une séquence peut s'étendre sur plusieurs semaines.*

Ceci confirme le cadre théorique et écarte l'équation « séquence = semaine »
comme règle. La semaine reste un **repère de grandeur**, pas une définition.

**▢ PARTICULIER (601-101, A2026).**

| Séquence envisagée | Étendue |
|--------------------|---------|
| Introduction | ~1 semaine |
| Bases de l'analyse littéraire | **plusieurs séquences**, plusieurs semaines |

### 5.2 ✅ TRANCHÉ (6 août) — voie A : des séquences de séquences

**Décision.** Le regroupement au-dessus de la séquence sera une **séquence
contenant des séquences** — l'imbrication, pas le lien.

**Raison retenue : la simplicité.** Plutôt que d'introduire un type de nœud
supplémentaire (« module », « étape », « thème »), on rend le conteneur
existant récursif. Un seul concept, appliqué à deux échelles.

**▣ GÉNÉRAL — le nom appartient à l'utilisateur.** *Module*, *étape*, *thème*,
*bloc* : ce ne sont que des noms. La structure est la même. L'enseignant nomme
ses regroupements comme sa discipline le demande.

**◈ OUVERT — renommer « Séquence » en « Ensemble » ?** Piste évoquée : appeler
le type *ensemble* (neutre quant à l'échelle) et laisser l'utilisateur inscrire
son propre vocabulaire. À évaluer plus tard — c'est un changement de
vocabulaire global (UI, skills, documentation) qui ne doit pas précéder
l'usage.

**Définition qui, elle, est stable :**

> **Une séquence est un ensemble de leçons.** Un regroupement de séquences
> reste une séquence — seule l'échelle change.

**État de l'outil.** La hiérarchie est aujourd'hui **strictement à trois
niveaux** :

```
Séquence  ⊃  Leçon  ⊃  Activités / Soutien / Révision / Évaluation
```

`peutContenir()` (planification-carte.js:1969) autorise **uniquement**
`séquence → leçon`.

**Coût à prévoir (honnête).** Passer à une profondeur variable touche tout ce
qui suppose trois niveaux fixes : le sommaire de la palette Navigation, la
navigation `vue globale → séquence → leçon`, `naviguerNiveauLecon()` qui
cherche **la** séquence parente, la jauge de temps et le cumul des durées.
Ce n'est pas un blocage, mais ce n'est pas une ligne de code non plus.

**Voie B, écartée pour l'instant** (conservée ici pour mémoire) : relier une
**Idée maîtresse** à plusieurs séquences par le lien « se concrétise dans »,
déjà outillé. Elle chapeaute sans contenir — le regroupement y reste abstrait.
Les deux voies ne s'excluent pas à terme.

### 5.3 ◈ OUVERT — une leçon = une séance ?

Si oui : 30 leçons de 2 périodes. Sinon (plusieurs leçons courtes dans une
séance, ou une leçon à cheval sur deux séances), la comptabilité du temps
(jauge de la palette Navigation, 1.29.0) et le sommaire changent de sens.

**▣ GÉNÉRAL en germe.** L'enseignant choisit ce que la séquence signifie pour
lui ; l'outil doit rendre ce choix explicite plutôt que le supposer.

---

## 6. Journal des frictions

Chaque friction rencontrée pendant l'alignement réel est consignée ici :
date, geste empêché, décision prise. Une friction n'est pas un bug à
contourner — c'est le signal qui dicte le prochain outil à construire.

| # | Date | Geste voulu | Ce qui s'est passé | Décision / suite |
|---|------|-------------|--------------------|------------------|
| **F1** | 6 août | Trouver et poser l'objectif d'une leçon | Introuvable « de façon rapide et intuitive ». Diagnostic §4.1 bis : 3 emplacements, aucun dans la carte ; le badge 🎯 n'apparaît qu'une fois l'objectif saisi → aucune affordance au départ. | ✅ **LIVRÉ (1.32.0)** — objectif dans le bloc leçon, badge-bascule toujours présent, stockage sur le nœud. |
| **F2** | 6 août | Regrouper plusieurs séquences sous un grand thème | Impossible : `peutContenir()` n'autorise que séquence → leçon. | ✅ Tranché : voie A, séquences de séquences (§5.2). À livrer **après** F1. |
| **F3** | 6 août | Voir ses séquences dans l'ordre du trimestre | Vue calendrier : **Sem. 1 → Sem. 15 → Sem. 9**. Le numéro de semaine est dans le titre, pas dans `metadata.semaineDebut` → tri inopérant. | ◈ Chantier planificateur (§6 quater). Préalable : faire du temps une **donnée**. |
| **F4** | 6 août | Replier un objectif sans perdre le reste | Les badges d'alignement (crochets) disparaissaient au repli. | ✅ Corrigé (1.33.1) — ordre d'appel : reconstruire le DOM **puis** reposer les badges. |
| **F5** | 6 août | Voir le travail livré dans son Chrome local | Rien ne changeait : `?v=` figés (cache), puis branche `main` au lieu de la branche de travail. | ✅ Cache-busting systématisé. **▣ Leçon générale** : sur ce projet, tout fichier modifié doit voir son `?v=` bumpé — sinon le navigateur sert l'ancienne version (classe #364). |

---

## 6 bis. Où doit vivre l'objectif de leçon ? (proposition d'architecture)

**Constat.** L'objectif personnalisé est aujourd'hui stocké dans
`planification_seances[leconId].objectifPersonnalise` — la clé **nue, non
namespacée, à dictionnaire plat** décrite au §4.2. Or les autres propriétés
structurantes d'un nœud (`duree`, `niveauCognitif`, `prealable`,
`semaineDebut`/`semaineFin`, `productionId`) vivent dans **`noeud.metadata`**,
donc à l'intérieur de `planification_mindmap` — la clé propre du module,
correctement namespacée par trimestre.

**Proposition : déplacer l'objectif vers `noeud.metadata.objectif`.**

| Gain | Détail |
|------|--------|
| **Sort de la clé fragile** | Plus de partage entre trimestres ni avec la démo pour la donnée la plus centrale de la méthode. |
| **Suit les copies et imports** | L'import inter-trimestre (1.30.0) copie les nœuds avec leurs metadata. Aujourd'hui `copierSeancesLecons()` est un **no-op** tant que #367 n'est pas livré — l'objectif ne suit donc pas proprement. |
| **Disponible au rendu** | Le nœud connaît son objectif sans lecture d'une seconde clé (`_seancesDOM`), ce qui simplifie l'affichage sur la carte. |
| **Zéro-dette** | Retire un usage de la clé problématique au lieu d'en ajouter un. |

**Ce que ça ne règle pas.** #367 reste ouvert pour les **notes de leçon** et les
**rétroactions d'activité**, qui continuent de vivre dans
`planification_seances`. La proposition réduit l'exposition, elle ne la
supprime pas.

**À prévoir.** Une migration one-shot idempotente (patron #358) pour ne pas
perdre les objectifs déjà saisis.

**✅ CONFIRMÉ ET LIVRÉ (6 août, 1.32.0).** L'objectif vit sur le nœud
(`metadata.objectif`). Migration one-shot idempotente depuis l'ancienne clé,
avec deux gardes contre la perte :

- l'ancienne source n'est retirée **qu'après** une sauvegarde réussie ;
- rien n'est migré s'il n'y a **pas de carte active** — `sauvegarder()` sort
  silencieusement dans ce cas, et purger malgré tout aurait effacé des
  objectifs sans rien avoir persisté. *(Trou trouvé en écrivant la sentinelle,
  pas en écrivant le code.)*

Les **notes de leçon** et les **rétroactions d'activité** restent dans
`planification_seances` : #367 demeure ouvert pour elles.

---

## 6 ter. Design retenu pour F1 — l'objectif dans le bloc leçon

**Décision (6 août).** L'objectif s'affiche **dans le bloc leçon lui-même**, en
en-tête à deux sections :

1. une section qui **identifie le bloc** (le mot « Leçon » + son titre) ;
2. juste en dessous, une section **« Objectif »**, considérée comme faisant
   partie de l'en-tête.

**L'objectif est du texte simple.** Pas de connecteurs, pas de ports de liaison
sur cette zone — décision de simplicité assumée, révisable à l'usage.

### Structure actuelle du bloc conteneur

Relevé au code (planification-carte.js:2412-2425). La moitié du design
**existe déjà** :

```
.planif-noeud
  ├─ .planif-noeud-entete   « Leçon »          ← section 1, existe
  ├─ .planif-noeud-titre    titre éditable      ← section 1, existe
  ├─ .planif-noeud-zone     « N éléments »      ← accueille les enfants
  └─ 4 ports de liaison
```

### Structure cible

```
┌──────────────────────────────┐
│ Leçon                        │  ← .planif-noeud-entete      (existe)
│ Titre de la leçon            │  ← .planif-noeud-titre       (existe)
├──────────────────────────────┤
│ Objectif : …                 │  ← .planif-noeud-objectif    (À CRÉER)
├──────────────────────────────┤
│ 5 éléments                   │  ← .planif-noeud-zone        (existe)
└──────────────────────────────┘
```

Une seule ligne à insérer, entre le titre et la zone des enfants.

### Ce que le code rend facile

**Aucun conflit entre saisie et déplacement.** Le gestionnaire de `mousedown`
(planification-carte.js:2707) exclut déjà tout élément éditable du drag :

```js
if (e.target.classList.contains('planif-noeud-port') || e.target.isContentEditable) return;
```

La garde est générique : une nouvelle zone `contenteditable` en hérite sans
modification.

### Conséquences en cascade (zéro-dette)

| Élément | Sort |
|---------|------|
| **Badge 🎯** | **PROMU EN BASCULE** — voir ci-dessous. (Première intention : le retirer. Meilleure idée retenue le 6 août.) |
| **Champ Objectif de la vue leçon** (niveau 3) | **CONSERVÉ**, mais doit lire et écrire **la même source** que la carte. Aucune duplication de donnée. |
| **Objectif dérivé** (Organisateur) | Inchangé pour l'instant. Son articulation avec l'objectif saisi reste ◈ ouverte (§4.1). |

### ✅ Le badge devient la bascule (décision du 6 août)

Plutôt que de retirer le badge 🎯, on lui donne un rôle : **il déplie et replie
l'objectif** sous la leçon.

| État du badge | Signification | Clic |
|---------------|---------------|------|
| **Coloré** | La leçon a un objectif | Déplie / replie l'objectif |
| **Grisé** | La leçon n'a pas encore d'objectif | Déplie la zone, vide et prête à la saisie |

**▣ GÉNÉRAL — pourquoi cette solution est bonne.** Elle résout **trois
problèmes d'un seul geste** :

1. **La densité** (§ ci-dessous) — chacun choisit ce qu'il déplie ; la carte
   ne se noie pas.
2. **L'affordance**, cause racine de F1 — le badge est **toujours présent**,
   même sans objectif. Grisé, il dit : *ici, un objectif peut être posé.* Le
   cercle « pour découvrir la fonction, il faut déjà s'en être servi » est
   rompu.
3. **La lisibilité replié** — l'objectif existe et se voit d'un coup d'œil,
   sans occuper d'espace.

**▣ GÉNÉRAL — principe qui s'en dégage.** *Un indicateur d'état gagne à
devenir la commande de ce qu'il indique.* Signaler qu'une information existe
sans offrir de l'ouvrir crée une impasse ; l'inverse fait d'un badge passif
une porte d'entrée.

### ◈ OUVERT — questions restantes sur la bascule

- **Portée.** La bascule est **par leçon**. Or juger l'enchaînement (§3.1)
  suppose de voir plusieurs objectifs ensemble → une commande « tout déplier /
  tout replier » sera peut-être nécessaire dans la barre. À voir à l'usage.
- **Persistance.** L'état plié/déplié survit-il au rechargement ? Deux
  options : état de session (tout replié au démarrage) ou état mémorisé par
  leçon. À trancher.

### La question de la densité (largement désamorcée)

Le besoin du §3.1 est de voir **plusieurs objectifs ensemble** ; un objectif
rédigé occupe une à deux lignes, et pouvait noyer la carte. La bascule règle
l'essentiel : le texte s'affiche **en entier** quand on le demande, et
disparaît sinon. Ni troncature, ni survol à inventer.

À noter : en **vue globale compacte**, les séquences sont résumées et les
leçons n'apparaissent pas — la question ne se pose qu'au niveau séquence.

---

## 6 quater. Deux vues complémentaires : logique et logistique

**▣ GÉNÉRAL — distinction posée le 6 août.** Concevoir un cours mobilise deux
raisonnements qui ne se mélangent pas bien :

| Vue | Question | Objets |
|-----|----------|--------|
| **Alignement pédagogique** | *Qu'est-ce qui s'enseigne, dans quel ordre logique, et comment le vérifie-t-on ?* | Objectifs, connaissances, activités, évaluations, liens |
| **Planificateur** (« Vue calendrier ») | *Quand cela tombe-t-il dans le trimestre réel ?* | Semaines, dates, ancrage au calendrier officiel |

L'une organise la **progression** ; l'autre l'**ancre dans le temps**. Un
enseignant a besoin des deux, mais les tenir séparées évite de confondre
« ce qui vient logiquement après » et « ce qui tombe la semaine suivante ».

### État réel constaté au code (6 août 2026)

Deux faits qui renversent l'intuition de départ :

1. **La « Vue calendrier » n'est pas un planificateur.** C'est une vue
   **dérivée, en lecture**, qui réutilise le rendu de la carte
   (`genererSeancesHTML()`) puis le **découpe en post-traitement DOM** :
   retirer les flèches d'alignement, ajouter les dates, ajouter des boutons.
   En faire un vrai planificateur suppose de la **réécrire**, pas de
   l'étendre — un rendu recyclé puis rogné ne supporte pas le glisser-déposer.

2. **L'ancrage temporel est déjà saisi… dans l'alignement.** Les séquences
   portent `metadata.semaineDebut` / `semaineFin`, saisis dans l'inspecteur de
   la carte, et l'Organisateur ne fait que les **lire** (tri des séquences,
   en-têtes « Sem. 3–5 », exports).

3. **Mais personne ne les remplit — et ça se voit.** Dans la Vue calendrier
   réelle du 601-101 (capture du 6 août), les séquences s'affichent dans
   l'ordre **Sem. 1 → Sem. 15 → Sem. 9**. Le tri par `semaineDebut`
   (`organisateur.js:1621`) retombe sur sa valeur de repli `999` pour toutes,
   parce que le numéro de semaine vit dans le **titre**, en texte libre, pas
   dans la métadonnée prévue pour lui. Même chose pour les leçons, nommées
   « Séance 1 (2 périodes) » — position et durée écrites à la main.

**▣ GÉNÉRAL — ce que cette observation démontre.** Un repère écrit dans un
titre est **invisible pour l'outil** : il ne peut ni trier, ni compter, ni
avertir. Tant que la semaine reste du texte, le planificateur ne peut rien en
faire. Faire du temps une **donnée** est donc le préalable au chantier, pas
une de ses fonctionnalités.

### ◈ LA décision structurante : qui possède l'ancrage temporel ?

La proposition (« c'est dans le planificateur que les semaines s'organisent ;
l'alignement les affiche si on le souhaite ») **renverse la propriété
actuelle**. C'est une question de Single Source of Truth, pas d'interface :

| | Aujourd'hui | Proposé |
|---|---|---|
| **Écrit** la semaine | Inspecteur de la carte | Planificateur |
| **Lit** la semaine | Organisateur, exports | Carte (affichage optionnel), exports |

Tant qu'elle n'est pas tranchée, tout champ temporel ajouté à la carte est de
la dette à défaire. **À trancher avant de coder l'un ou l'autre.**

**▣ GÉNÉRAL — principe candidat.** *Le lieu où une donnée se saisit doit être
celui où la question se pose.* « En quelle semaine ? » est une question de
logistique : elle appartient au planificateur. L'alignement l'affiche parce
que c'est utile, pas parce qu'il la possède.

### Numérotation

Deux repères distincts, à ne pas confondre :

- **Numéro de semaine** — position dans le trimestre (1 à 15). Relève du
  planificateur.
- **Numéro de leçon** (`1/30`, `2/30`…) — position dans la progression.
  Déductible du nombre de leçons ; **calculé, jamais saisi**.

Une numérotation qui se maintient seule au glisser-déposer est un acquis du
projet (cf. le paquet-de-5 du calendrier, #368) : ne pas la faire ressaisir.

### ◈ Ordre des chantiers — recommandation

**Séquentiel, pas parallèle**, pour trois raisons vérifiées :

1. Le planificateur manipule des séquences ; or la hiérarchie doit encore
   devenir **récursive** (§5.2, tranché non livré). Le bâtir avant, c'est le
   refaire après.
2. La « Vue calendrier » est du post-traitement du rendu de la carte : deux
   chantiers de front sur des fichiers déjà couplés multiplient les
   régressions.
3. Ce n'est pas un bloqueur : nommer ses séquences « Sem. 1 », « Sem. 11 » à
   la main fonctionne. Le planificateur est un **confort**, l'alignement une
   **condition**.

**Mais observation parallèle.** Chaque besoin « planificateur » qui surgit
pendant l'alignement se note au journal des frictions. Quand le chantier
s'ouvrira, son cahier des charges viendra de l'usage réel — pas d'une
anticipation.

---

## 7. Vers l'instruction générale

Section à écrire **en dernier**, quand la démarche aura été éprouvée. Elle
contiendra la proposition d'organisation générale destinée aux nouveaux
utilisateurs, avec la garantie explicite que chacun développera la sienne.

Squelette pressenti (à confirmer ou infirmer par l'usage) :

1. Établir son cadre matériel (compter le temps disponible).
2. Choisir son point d'entrée — et savoir qu'il y en a plusieurs.
3. Poser les intentions.
4. Poser les moyens et la progression.
5. Poser les conditions.
6. Poser les preuves.
7. Laisser l'outil signaler les trous d'alignement.
