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

**◈ OUVERT — à trancher tôt, car tout le reste en dépend.**

Trois notions se recouvrent partiellement, et le cas de Grégoire les tend :

| Notion | Définition du cadre théorique | Proposition de Grégoire (A2026) |
|--------|-------------------------------|--------------------------------|
| **Séquence** | Groupe de leçons vers un **objectif commun** (unité *logique*) | **Une semaine** (unité *temporelle*) |
| **Séance** | Rencontre physique héritée du calendrier | 2 par semaine, 2 périodes chacune |
| **Leçon** | Unité d'enseignement à structure interne | ◈ rapport à la séance non tranché |

Deux questions en découlent :

1. **La séquence est-elle temporelle ou logique ?** Si « séquence = semaine »,
   le conteneur devient un calendrier et perd sa fonction de regroupement par
   intention. Un apprentissage qui s'étend sur trois semaines n'aurait alors
   plus de contenant propre. À l'inverse, l'ancrage temporel rend le budget de
   temps immédiatement lisible. **Les deux lectures sont défendables** — mais
   elles produisent des cartes très différentes.

2. **Une leçon = une séance ?** Si oui, 30 leçons, chacune de 2 périodes. Si
   non (plusieurs leçons courtes dans une séance, ou une leçon à cheval sur
   deux séances), la comptabilité du temps (jauge de la palette Navigation,
   1.29.0) et le sommaire changent de sens.

**▣ GÉNÉRAL en germe.** Quelle que soit la réponse, la méthode générale devra
énoncer que **l'enseignant choisit ce que la séquence signifie pour lui**, et
que l'outil doit rendre ce choix explicite plutôt que le supposer.

---

## 6. Journal des frictions

Chaque friction rencontrée pendant l'alignement réel est consignée ici :
date, geste empêché, décision prise. Une friction n'est pas un bug à
contourner — c'est le signal qui dicte le prochain outil à construire.

| Date | Geste voulu | Ce qui s'est passé | Décision / suite |
|------|-------------|--------------------|------------------|
| _(à remplir au fil de la session)_ | | | |

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
