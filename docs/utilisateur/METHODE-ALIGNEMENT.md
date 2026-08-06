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
| **F1** | 6 août | Trouver et poser l'objectif d'une leçon | Introuvable « de façon rapide et intuitive ». Diagnostic §4.1 bis : 3 emplacements, aucun dans la carte ; le badge 🎯 n'apparaît qu'une fois l'objectif saisi → aucune affordance au départ. | ◈ À concevoir : rendre l'objectif visible **sur le nœud leçon** dans la carte, et saisissable sans quitter la carte. |
| **F2** | 6 août | Regrouper plusieurs séquences sous un grand thème | Impossible : `peutContenir()` n'autorise que séquence → leçon. | ✅ Tranché : voie A, séquences de séquences (§5.2). À livrer **après** F1. |

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

**◈ OUVERT** — décision à confirmer avant implémentation.

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
