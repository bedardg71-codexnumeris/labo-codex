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

> **✅ LIVRÉ (6 août, 1.39.0).** Le verrou `peutContenir` est levé : une
> séquence peut contenir des séquences (glisser sur le canevas, comme une
> leçon). L'étendue temporelle, la palette Navigation (indentation), la Vue
> calendrier et les exports TXT/TSV/MD suivent la hiérarchie — chaque
> sous-séquence apparaît UNE fois, sous son parent, jamais dupliquée à la
> racine. Dans les documents plats (TXT/TSV), une sous-séquence est titrée
> par son chemin (« Parent › Enfant ») ; le Markdown garde le titre nu pour
> que l'aller-retour d'import ne pollue pas les titres — l'imbrication n'y
> survit pas, c'est assumé (format de bootstrap, 2 niveaux).

**Décision.** Le regroupement au-dessus de la séquence sera une **séquence
contenant des séquences** — l'imbrication, pas le lien.

**Raison retenue : la simplicité.** Plutôt que d'introduire un type de nœud
supplémentaire (« module », « étape », « thème »), on rend le conteneur
existant récursif. Un seul concept, appliqué à deux échelles.

**▣ GÉNÉRAL — le nom appartient à l'utilisateur.** *Module*, *étape*, *thème*,
*bloc* : ce ne sont que des noms. La structure est la même. L'enseignant nomme
ses regroupements comme sa discipline le demande.

**◈ Types renommables par l'utilisateur (piste précisée le 6 août).** Séquence
*et* leçon devraient à terme être renommables. Les usages observés :

| Type | Noms possibles selon l'enseignant |
|------|-----------------------------------|
| **Séquence** | module, étape, thème, bloc, **cours** |
| **Leçon** | séance, cours, période, rencontre |

> *« Mon cours a 4 heures, mais est divisé en deux séances. Je pourrais appeler
> ça un cours. »*

**⚠ Collision à prévoir : le mot « cours » est déjà pris.** Dans l'application,
`cours` désigne l'entité ministérielle (601-101) dans la hiérarchie
`TRIMESTRE > COURS > GROUPE` — clé `coursId`, présente dans Réglages,
Construction, Évaluations. Un utilisateur qui renommerait « séquence » en
« cours » créerait une **homonymie** entre son vocabulaire et celui de
l'application (« le cours actif », « les productions du cours »).

Ce n'est pas rédhibitoire — le nom choisi n'aurait d'effet que dans le module
Alignement — mais l'aide contextuelle et les messages devront être écrits en
conséquence, et la porte de renommage devrait le signaler.

### ✅ Cours ≠ leçon — la distinction qui ferme la collision

Précision du 6 août, et elle tranche la question du paragraphe précédent :

> **Le cours**, c'est l'objet **disciplinaire** inscrit au programme (601-101).
> **La leçon**, c'est ce qui est **délivré en classe**.

Les deux mots ne sont donc pas interchangeables, et « cours » ne devrait
**pas** être proposé comme renommage de *leçon* : ce serait effacer une
distinction que l'enseignant tient pour importante. L'application, qui réserve
déjà `cours` à l'entité ministérielle, est alignée sur cette lecture.

**▣ GÉNÉRAL.** *Ce qui est au programme n'est pas ce qui se passe en classe.*
C'est précisément l'écart que l'alignement pédagogique cherche à rendre
visible — d'où l'importance de ne pas le dissoudre dans le vocabulaire.

### La granularité complète (décrite le 6 août)

```
Ensembles          modules, étapes — séquences de séquences (§5.2)
  └─ Séquence      regroupement, renommable
      └─ Leçon     ce qui est délivré en classe ; porte les objectifs
          └─ Période   unité courte, 50 / 55 / 60 min selon le collège
              └─ Activités
```

**Ce qui existe déjà.** La durée d'une période est **paramétrable par
trimestre** (`dureePeriode`, défaut 55 min, SSOT du domaine horaire —
`horaire.js:285`). Les charges s'affichent en périodes, jamais en minutes
converties à la main. La préoccupation « chaque collège a sa durée » est donc
déjà couverte, y compris l'usage courant qui confond *période* et *heure*.

### ✅ TRANCHÉ (6 août) — la période MESURE, elle ne contient pas

Pas de niveau hiérarchique « période ». On n'y touche pas.

> *« Un enseignant se garde toujours une marge de manœuvre de toute façon. Les
> activités à l'intérieur des leçons peuvent parfois déborder non seulement sur
> la période ou la séance, mais même sur la leçon suivante. »*

**▣ GÉNÉRAL — la raison est pédagogique, pas technique.** Le temps
d'enseignement **déborde par nature**. Une structure qui enfermerait les
activités dans des périodes étanches modéliserait un cours qui n'existe pas, et
obligerait l'enseignant à mentir à l'outil dès la première semaine. La période
reste donc une **unité de mesure** : elle compte le temps, elle ne le
cloisonne pas.

**◈ Ce que cette souplesse ouvre — piste forte.** Si le contenu n'est pas
scellé dans des cases, il devient **déplaçable**. L'enseignant pourrait alors
absorber les aléas du trimestre — retards, avances, absences — en déplaçant du
contenu *dans* une leçon ou *entre* les leçons, et voir son calendrier se
réorganiser.

C'est une fonction que ni la conception ni le monitorage ne couvrent
aujourd'hui : la **réparation en cours de route**. Elle prolonge naturellement
le planificateur (§6 quater) et mérite d'être gardée en vue — c'est peut-être
là que le module devient indispensable plutôt qu'utile.

**◈ OUVERT (rappel) — séance et leçon sont-elles la même chose ?** « Les
séances peuvent être une leçon » laisse entendre que non toujours. Le cas de
Grégoire : 1 cours hebdomadaire = 4 périodes = 2 séances. Si une leçon peut
s'étendre sur deux séances, ou une séance porter deux leçons, la comptabilité
du temps et le sommaire changent de sens (§5.3).

### ▣ GÉNÉRAL — ce qui ne se renomme pas : la structure

Le nom est libre ; **le rapport entre les niveaux ne l'est pas**.

> *« Ce qui est important, c'est l'organisation logique, le rapport entre la
> séquence, qui est un ensemble, et la leçon, qui est un cours précis avec une
> durée. »*

Cette distinction est déjà inscrite dans le code (`peutContenir()`), et c'est
elle qui survit à n'importe quel vocabulaire :

| Niveau | Ce qu'il peut contenir | Nature |
|--------|------------------------|--------|
| **Séquence** | des leçons, et rien d'autre | pur **regroupement** |
| **Leçon** | activités, soutien, révision, connaissances, évaluations | **plancher pédagogique** — le niveau où le contenu vit |

Autrement dit : **la leçon est le niveau terminal de l'organisation**, celui qui
porte une durée et un contenu enseignable ; la séquence ne fait que rassembler.
Quand la séquence deviendra récursive (§5.2), elle pourra contenir des
séquences — mais la leçon, elle, restera terminale.

C'est cette invariance qui autorise le renommage sans risque : on laisse
changer l'étiquette parce que l'outil raisonne sur la **structure**.

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

### 5.3 ✅ RÉPONDU PAR L'USAGE (6 août, soir) — non : une leçon peut s'étaler
### sur plusieurs séances

> **La preuve est une capture, pas un raisonnement.** Le planificateur de
> Grégoire, au soir du 6 août, affichait « Sem. 1 séance 1 » en rangée 1 et
> « Sem. 1 séance 2 » en rangée 2 — **deux séances de la même semaine, que la
> grille a forcées dans deux semaines différentes**. Et le repère « séance N »
> était écrit dans le TITRE.
>
> **▣ GÉNÉRAL — le motif de F3, à nouveau.** *Un repère écrit dans un titre est
> le symptôme d'un concept qui manque au modèle.* L'enseignant compense dans le
> texte ce que l'outil ne sait pas représenter. C'est la deuxième fois de la
> journée que ce signal apparaît (la semaine en F3, la séance ici) : c'est
> maintenant un **test de diagnostic** à appliquer systématiquement.

**Demande de Grégoire (6 août, soir)** : ajouter un type **Séance**, et pouvoir
disposer les séances d'une même semaine **côte à côte** dans la rangée.

**⚠ Ce que ça rouvre.** Ce n'est pas un ajout local :

- **§5.3 elle-même**, laissée ouverte le matin — l'usage y répond : **non**,
  leçon ≠ séance.
- **D3 du plan de la grille** (« l'ancrage temporel appartient à la LEÇON ») :
  si la séance existe, c'est ELLE qui atterrit dans une semaine.

**La généralisation qui réconcilie tout (à valider).** D3 ne se contredit pas,
il se **généralise** : *l'ancrage appartient au plus petit conteneur planifié*.
Une séance porte sa semaine ; une leçon qui a des séances **dérive** d'elles ;
une leçon sans séance garde la sienne, comme aujourd'hui. La dérivation
d'étendue étant **déjà récursive** (lot 1), le modèle ne coûte presque rien —
et l'exigence reste progressive (§6 quinquies) : qui n'a pas besoin de séances
n'en voit jamais.

Granularité qui en résulterait :

```
Ensembles          modules, étapes — séquences de séquences (§5.2)
  └─ Séquence      regroupement LOGIQUE, renommable
      └─ Leçon     unité LOGIQUE ; porte les objectifs
          └─ Séance    créneau de LIVRAISON ; porte la semaine   ← NOUVEAU
              └─ Période   mesure, ne contient pas
                  └─ Activités
```

### ✅ Ce qui distingue vraiment une séance d'une leçon (précisé le 6 août, tard)

> *« La séance est davantage contrainte par l'horaire que la leçon. Si un
> enseignant donne son contenu en un seul bloc de 4 h le lundi, la question de
> la séance ne se pose pas. S'il donne le même contenu en deux séances, le
> lundi suivi du mardi, ce n'est pas la même chose. »*

**▣ GÉNÉRAL.** *La leçon est libre, la séance est contrainte par l'horaire.*
C'est la distinction logique/logistique du §6 quater, appliquée un cran plus
bas — et non une différence de nom ou de taille.

Conséquence immédiate : **le bouton radio « leçon / séance » ne tient pas.**
Ce n'est pas une propriété du bloc, c'est le rapport entre le bloc et
l'horaire. (Idée examinée puis écartée le 6 août au soir.)

### ✅ Le modèle retenu (6 août, tard) — scinder une leçon en séances

**Le geste** (proposition de Grégoire) : on scinde une leçon, et des
compartiments apparaissent à l'intérieur pour y répartir le contenu des deux
jours. La disposition — horizontale ou verticale — est **indifférente** :

> *« Ce qui est important ici, c'est la hiérarchie et le lien entre les
> éléments, peu importe leur nom ou leur disposition dans l'espace. »*

**La séance est un VRAI NŒUD, pas un rendu.** ⚠ Ce point a été **renversé en
cours de discussion**, et le renversement mérite d'être conservé : des
compartiments de simple affichage (une étiquette `créneau` sur chaque activité)
avaient d'abord été recommandés pour leur réversibilité. La division du travail
énoncée ensuite par Grégoire (voir §6 quater, ▣ GÉNÉRAL) les disqualifie : si
le canevas existe pour exposer **la hiérarchie et les liens**, une séance qui
n'est qu'un rendu est structurellement **invisible** — elle ne contient rien au
sens du modèle, rien ne peut s'y rattacher. Elle doit donc être un conteneur
réel, enfant de la leçon.

Répartition qui en découle, parallèle à ce que fait déjà la leçon :

| | Où ça vit | Qui s'en occupe |
|---|---|---|
| **La séance** (conteneur de contenu) | hiérarchie, canevas | structure |
| **Son créneau** (lundi, mardi) | horaire, calendrier | planificateur |

*Exactement comme la leçon : elle vit dans le canevas, elle reçoit sa semaine
dans la grille. La séance ne fait qu'ajouter un cran.*

**◈ Piste complémentaire — l'occupation** (examinée le même soir, non tranchée).
Plutôt qu'un type ou un lien : *combien de créneaux de sa semaine ce bloc
occupe-t-il ?* Une leçon donnée en deux séances est alors **un** bloc qui
occupe deux créneaux — le besoin de « lier les séances sœurs » disparaît, comme
une cellule fusionnée. Cette piste décrit la vue **grille** ; la scission en
compartiments décrit la vue **canevas**. Les deux sont la même donnée vue de
deux endroits, elles ne se concurrencent pas.

**Les créneaux existent DÉJÀ, à ne pas ressaisir.** Vérifié au code le 6 août :
`horaires` porte `seances: [{ jour, heureDebut, heureFin, nombrePeriodes }]`,
et `ancrageLeconPourDates()` (organisateur.js) résout déjà une leçon vers sa
date réelle en appariant son **rang dans la semaine** au nième créneau de
l'horaire du groupe. Le concept est à moitié implémenté sans avoir été nommé.
→ Ce serait **D5 un cran plus bas** : *les créneaux d'une semaine dérivent de
l'horaire, jamais ressaisis.* Avec la nuance du §6 : **le nombre de créneaux
appartient au cours** (4 h en 2 blocs vaut pour tous les groupes), **le jour
appartient au groupe**.

**Ce que la scission apporte au-delà de la disposition** : la comptabilité du
temps **par créneau**. La jauge somme aujourd'hui toute la leçon ; scindée,
elle dirait « lundi : 1,8 pér. / mardi : 2,2 pér. » — c'est-à-dire exactement
les « débordements » que Grégoire cherchait à voir. La scission ne range pas
seulement le contenu : elle rend le débordement **visible**.

**⚠ Le coût réel, à traiter dans le plan** : scinder devient une opération sur
les données (les activités existantes descendent dans la séance 1), dé-scinder
doit les remonter. **Les deux sens doivent être sans perte** — c'est le test du
modèle, et il est testable. La mécanique existe : le parcours de sous-arbre
avec reparentage est celui de `dupliquerConteneurEnProfondeur()` (1.45.0).

**L'exigence reste progressive** (§6 quinquies) :

> *« Un enseignant pourrait organiser son contenu en leçons hebdomadaires même
> si son horaire est en blocs 2 × 2 h, et ne pas se soucier des débordements. »*

Qui ne scinde jamais ne voit jamais la notion.

**◈ Collision de vocabulaire à revoir** : §5.2 listait « séance » parmi les
renommages possibles de *Leçon*. Si Séance devient un type distinct, cette
piste de renommage doit être révisée — on ne peut pas offrir de renommer
« Leçon » en « Séance » si les deux coexistent.
→ ⚠ **Aggravé le même soir** : l'horaire emploie DÉJÀ le mot pour tout autre
chose. Voir « L'épreuve de la seconde discipline », point 5, ci-dessous.

### ✅ L'ÉPREUVE DE LA SECONDE DISCIPLINE (6 août, fin de journée) — la chimie

> *« On parle de mes cours de littérature ici, mais la question des séances se
> pose aussi pour les cours de chimie par exemple, avec les cours théoriques et
> les labos… »* — Grégoire

**▣ GÉNÉRAL — un modèle validé sur une seule discipline n'est pas validé.**
Ce n'est pas le cas qui a inspiré le modèle qui l'éprouve, c'est le second.
Tout §5.3 ci-dessus a été raisonné sur le 601-101 : deux séances **de même
nature**, séparées par l'horaire. La chimie fournit le contre-cas, et il tient
— mais il déplace trois choses.

#### 1. Deux chemins vers une leçon multi-séances, pas un seul

| | Point de départ | Geste | Exemple |
|---|---|---|---|
| **Scission** (descendante) | une leçon déjà écrite | l'horaire la coupe | littérature : lundi + mardi |
| **Composition** (ascendante) | deux moments distincts | ils forment une leçon | chimie : théorie + labo |

§5.3 ne décrivait que la **scission**. Les deux chemins doivent aboutir à la
**même structure** — sinon on aura deux modèles de séance qui divergent. En
chimie, personne ne « scinde » : le labo existe d'abord, et c'est le lien avec
la théorie qui se construit ensuite.

#### 2. La séance peut être hétérogène — ce qui **tranche définitivement** le « vrai nœud »

En littérature, les deux séances d'une leçon sont interchangeables par nature :
même local, même type de travail, seule l'horloge les sépare. En chimie, non —
la théorie et le labo diffèrent par le **local**, la **durée**, la **nature du
travail**, parfois l'**effectif**.

C'est l'argument qui clôt le renversement consigné plus haut : un compartiment
de simple rendu ne peut porter ni un local, ni une nature, ni ses propres
activités d'un autre genre. **Un fragment d'affichage n'a pas d'identité ; une
séance de labo en a une.**

#### 3. Vérifié au code — l'horaire en sait plus qu'on ne croyait

Structure réelle (`horaire.js`, `confirmerSeances()`), plus riche que ce qui
était noté ci-dessus :

```
Séance = { id, lettre: 'A'…'F', groupe, jour, debut,
            nombrePeriodes, duree, local, verrouille }
```

Donc le **local** — ce qui distingue justement 2309 du laboratoire — est
**déjà saisi**, et les créneaux sont **déjà nommés** (A, B…). → **D5 encore un
cran plus bas** : la nature d'une séance est en grande partie **dérivable** de
l'horaire, elle ne doit pas être redemandée. Ce qui reste à l'enseignant, c'est
ce que l'horaire ne peut pas savoir : que la séance B *poursuit* la séance A.

#### ⚠ 4. Ce que la chimie ouvre et qu'on ne sait PAS traiter — le sous-groupe

Un labo se donne souvent en **demi-groupe** : une moitié le lundi, l'autre le
mercredi, **même contenu, étudiants différents**. La séance d'horaire porte
déjà un champ `groupe`, donc la donnée existe — mais le modèle du §6 ne couvre
pas ce cas : il pose *« la semaine est commune, le jour appartient au groupe »*,
c'est-à-dire **une** planification par groupe-cours. Ici, **un seul groupe-cours
a deux créneaux pour le même contenu**. Ce n'est ni la leçon scindée (contenus
différents, mêmes étudiants) ni le multi-groupes (contenus identiques, groupes
distincts) : c'est un troisième cas.

**À nommer, pas à résoudre ce soir.** Mais il doit être écrit dans le plan de la
séance comme un cas à ne pas **rendre impossible** — c'est le rôle du §6 pour
les groupes, et la même prudence s'applique.

#### ⚠ 5. La collision de vocabulaire devient bloquante

Ce n'était qu'une note de bas de page au §5.2 (« séance » parmi les renommages
possibles de *Leçon*). C'est maintenant un problème dur : **l'application appelle
déjà « séance » le créneau hebdomadaire récurrent** (`horaire.js`,
`afficherSeancesExistantes`, `genererSeancesCompletes`, clés de données). Si le
module Alignement introduit une « séance » pédagogique, **deux séances
différentes coexistent dans la même application** — exactement le genre
d'ambiguïté que la doctrine zéro-dette interdit.

**Piste à peser au plan** : renommer l'objet de l'horaire en **créneau** — mot
déjà employé par le tableau du §5.3 ci-dessus, et plus juste (un jour, une
heure, un local, un groupe : c'est un créneau, pas un événement pédagogique).
⚠ Renommage inter-modules → **audit des call-sites AVANT d'annoncer un
périmètre** (rappel du 6 août : 26 sites trouvés là où le plan en annonçait 12).

##### ✅ AUDIT FAIT (7 août) — et il corrige la piste

→ `Rapports/AUDIT-vocabulaire-seance-2026-08-07.md`

L'audit demandé ci-dessus a été exécuté. Il rapporte trois choses, dont une
qui **déplace la question** :

1. **Le mot porte déjà DEUX concepts, pas un.** `seancesHoraire` = le créneau
   récurrent, sans date (`{lettre, jour, debut, duree, local, groupe}`) ;
   `seancesCompletes` = son **occurrence datée**, dérivée en croisant l'horaire
   et le calendrier. La séance pédagogique du §5.3 serait la **troisième**.
   → Renommer l'horaire en « créneau » laisse l'occurrence s'appeler « séance »,
   et c'est elle qui ressemble le plus à la séance pédagogique. La collision se
   **déplacerait** au lieu de disparaître.
2. **≈ 2470 occurrences**, 113 identifiants distincts, 3 clés de stockage. Cent
   fois l'ordre de grandeur du chantier de la veille. Renommer les clés = une
   migration sur les données réelles — la seule contrainte dure de `CLAUDE.md`.
3. **L'interface est presque épargnée** : les 64 occurrences d'`index.html` sont
   toutes des identifiants, **aucun libellé visible**. Le vocabulaire que
   l'enseignant lit tient en quelques dizaines de chaînes générées en JS.

**▣ GÉNÉRAL en germe.** *Le vocabulaire que voit l'utilisateur et le vocabulaire
du code sont deux chantiers, pas un.* Le premier se corrige en une session et
c'est celui qui bloque ; le second est une dette de lisibilité qui peut attendre
et se payer par tranches. Les confondre transforme une décision de mots en
migration de données.

**◈ Reste à trancher (Grégoire)** : quel mot pour la séance pédagogique. Le
choix commande le reste — lui donner « séance » force à renommer l'occurrence,
lui donner un autre mot laisse le code tranquille mais impose un terme que
personne n'emploie en salle des profs. ⚠ Si la séance pédagogique existe, la
piste du §5.2 « renommer *Leçon* en *Séance* » devient incohérente et doit
sortir de la liste des renommages proposés.

#### 6. La comptabilité du temps y gagne encore

En littérature, deux créneaux équivalents rendent le débordement léger. Un
cours à 2 h de théorie + 3 h de labo a des capacités **non interchangeables** :
du contenu de labo ne « déborde » pas dans la théorie. La jauge par créneau
(§5.3 ci-dessus) passe donc de confort à **nécessité** dès la seconde discipline.

---

### ◈ OUVERT — deux vues du planificateur (hauteur / largeur)

Proposition de Grégoire, même soir : offrir **deux dispositions** du
planificateur — la verticale actuelle, ou une disposition « en largeur » à deux
colonnes — **l'utilisateur choisissant selon l'espace dont il dispose à
l'écran**.

**▣ GÉNÉRAL.** *Quand un compromis d'affichage dépend de l'écran de
l'utilisateur, le lui offrir vaut mieux que de trancher à sa place.* (Le même
soir, une disposition à deux colonnes IMPOSÉE avait été écartée précisément
parce qu'elle resserrait des titres déjà tronqués — le choix lève l'objection.)

**◈ À préciser avant de coder** : « vue en largeur » = la file « Non planifié »
en colonne À CÔTÉ de la grille, ou les **semaines** déroulées horizontalement ?
Les deux lectures sont plausibles et le travail n'est pas du tout le même.

**Déblocage bon marché identifié, indépendant de tout ça** : afficher **côte à
côte** les éléments d'une même semaine dans leur rangée. C'est du rendu, pas de
la structure — aucun type, aucune migration — et ça répond déjà à la moitié
visible de la friction.

---

### 5.3 bis — l'analyse d'origine (6 août matin), conservée

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
| **F6** | 6 août | Poser une activité « sur » une leçon | Créée à côté du geste : seule la position du **curseur** décidait de l'adoption. Curseur à 10 px du bord → bloc orphelin, à cheval sur la leçon, qui ne s'ajuste pas — et semble « coincé ». | ✅ **LIVRÉ (1.40.0)** — filet de **recouvrement** : un bloc posé majoritairement (> 50 %) sur un conteneur qui accepte son type lui appartient, curseur ou pas. **▣ GÉNÉRAL en germe** : le geste de l'utilisateur, c'est le bloc qu'il tient, pas le pixel de son curseur. |
| **F7** | 6 août | Sortir une activité d'une leçon vers une autre | Impossible en un geste : glisser l'enfant déplaçait tout le groupe ; le mode individuel (double-clic) ne savait que **détacher**, pas déménager. | ✅ **LIVRÉ (1.40.0)** — déménagement direct (l'enfant glissé se dépose dans l'autre conteneur, surligné au survol) + **⌘+glisser** pour saisir un bloc seul sans double-clic (proposition Grégoire, calquée sur ⌥+glisser qui clone ; ⌘+clic immobile reste la multi-sélection). |
| **F9** | 6 août | Cloner une leçon « prototype » pour la remplir ensuite (patron du modèle Keynote) | Refusé : « Les conteneurs ne peuvent pas être clonés ». Raison réelle : « cloner » = INSTANCE LIÉE (miroir vivant), sans réponse simple pour les enfants d'un conteneur. Mais le besoin était une COPIE. | ✅ **LIVRÉ (1.45.0)** — les conteneurs se **dupliquent** (copie indépendante en profondeur : nouveaux ids, objectifs re-identifiés, liens internes recréés, liens externes non copiés — la copie n'est pas encore alignée). Mêmes gestes (⌘D, ⌥+glisser, bouton « Dupliquer »). **▣ GÉNÉRAL** : même geste, deux sémantiques nommées — l'instance (feuille) et la copie (conteneur) ; c'est le nom dans l'inspecteur qui porte la différence. **Suite ouverte** : la bibliothèque de modèles (§6 sexies). |
| **F8** | 6 août | « Le geste n'est pas intuitif » — verdict terrain sur F7 | Les remèdes de F7 (⌘+glisser, double-clic) restaient des RITUELS : le canevas faisait l'inverse de Keynote/Figma/Miro, où saisir un objet déplace CET objet. | ✅ **LIVRÉ (1.42.0), décision Grégoire** — **inversion du modèle** : glisser une feuille la déplace SEULE (et la dépose où on la relâche) ; glisser le CADRE d'une leçon/séquence déplace le groupe. Double-clic = inspecteur, rien d'autre. ⌘+glisser et le « mode individuel » sont RETIRÉS (zéro-dette : livrés le matin, retirés le soir — c'est le développement piloté par la pratique qui marche). **▣ GÉNÉRAL** : *la manipulation directe suit les conventions que l'utilisateur apporte* — un canevas qui exige un rituel pour le geste le plus fréquent est mal inversé. |
| **F7 bis** | 6 août | Même geste **sans clavier ni souris** (iPad) | ⌘ n'existe pas au tactile, et le glisser des nœuds du canevas est de toute façon souris-seulement (porte ouverte du relais). Le double-clic, lui, ouvre l'inspecteur partout. | ✅ **LIVRÉ (1.41.0)** — sélecteur « **Dans la leçon** » dans l'inspecteur de tout bloc qu'une leçon peut contenir : choisir la leçon d'accueil (ou « Aucune » = bloc libre), sans geste. **▣ GÉNÉRAL** : tout geste de manipulation directe doit avoir un équivalent **déclaratif** — le geste est rapide, le déclaratif est universel. Piège d'implémentation consigné : un listener posé dans le gabarit meurt au `innerHTML +=` suivant ; l'attache vit en fin de `ouvrirPanneau`. |

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

### ✅ Structure de l'en-tête — précisée le 6 août

Recentrage explicite : la date et le numéro de semaine sont **secondaires**.
L'objet du chantier est la **cohérence du contenu** — que connaissances,
activités, évaluations et objectifs se répondent.

```
┌──────────────────────────────────┐
│ LEÇON                            │  ← 1. type du bloc
│  • Objectif A                    │  ← 2. LES objectifs (pluriel)
│  • Objectif B                    │
├──────────────────────────────────┤
│ [connaissances, activités,       │  ← 3. contenu, inchangé
│  évaluations… tel qu'aujourd'hui]│
└──────────────────────────────────┘
```

**✅ LIVRÉ (1.34.0, complété en 1.35.0).** Objectifs au pluriel, stockés en
liste d'objets porteurs d'un id ; migration depuis les deux formats antérieurs.
Saisie : une ligne par objectif, avec **boutons `+` et `−` sur chaque ligne**
(1.35.0) doublés des raccourcis Entrée / Retour arrière.

**▣ GÉNÉRAL — la leçon de F1, réappliquée.** Les raccourcis clavier ne se
voient pas : livrés seuls, ils reproduisaient le défaut du badge 🎯 d'avant F1
— une commande que seul connaît celui qui la connaît déjà. Les boutons rendent
l'action visible ; les raccourcis restent pour qui va vite. *Une commande
invisible n'existe pas.*

**✅ RÉSOLU — type ≠ titre.** Nuance clarifiée le 6 août : le **type** du bloc
(« Leçon ») reste en haut de l'en-tête ; c'est le **titre** qui est décalé sous
l'en-tête. Le titre n'est donc **pas supprimé** — ses quatre usages hors du bloc
(sommaire de la palette, vue calendrier, menus de l'Organisateur, exports) sont
préservés, et aucun repli n'est nécessaire.

**▣ GÉNÉRAL — la distinction vaut d'être nommée.** *Le type dit ce qu'est le
bloc ; le titre dit lequel c'est.* Le premier est structurel et non modifiable,
le second est une information libre. Les confondre conduit à croire qu'on peut
supprimer l'un en gardant l'autre.

### ✅ TRANCHÉ (6 août, soir) — relier les objectifs aux activités ET aux évaluations

**Design décidé par Grégoire (BACKLOG #403), à construire après le lot 2 :**
même philosophie que les idées maîtresses — l'application vérifie la
**structure**, jamais le contenu : elle prend pour acquis la compétence et
l'expertise de l'enseignant.

- **Le lien vit sur le nœud servant** : `metadata.objectifsServis = [id…]`
  sur l'activité et sur l'évaluation. Pas de nouveau type de nœud — le
  modèle A ci-dessous gagne, complété d'un registre côté servant.
- **Saisie déclarative** dans l'inspecteur (cases à cocher), objectifs de
  SA leçon. Fonctionne sur iPad (F7 bis).
- **Vérifié = servi par ≥ 1 activité, ET vérifié par une évaluation** —
  en direct (évaluation formative, orale, in situ : un nœud évaluation à
  rétroaction orale coche très bien ça) **ou** en transitif (une des
  activités qui le servent est reliée à une évaluation) — le patron exact
  des idées maîtresses.
- **Pastille par objectif, grise = invitation** (§6 quinquies).

*Analyse d'origine (6 août, matin) conservée ci-dessous :*

Idée : un lien d'**apparence distincte** entre un objectif et les activités qui
le servent, permettant de vérifier que **chaque objectif est couvert**.

C'est de l'alignement au sens fort du module (principe 3 : les liens *sont*
l'alignement) et la contrepartie exacte du §3.1 : si l'objectif est un maillon,
il doit pouvoir se raccorder. Cela rouvre — assumé — la décision « objectif =
texte simple, sans connecteurs ».

**Le point dur : un objectif reliable cesse d'être du texte.** Il devient une
**entité identifiable**. Deux modèles possibles :

| Modèle | Forme | Ce que ça donne | Ce que ça coûte |
|--------|-------|-----------------|-----------------|
| **A — liste dans le nœud** | `metadata.objectifs = [{id, texte}]` | Léger ; rendu dans l'en-tête tel que décrit | Les liens actuels vont de **nœud à nœud** : relier un sous-élément demande un second système de liens |
| **B — objectif = type de nœud** | Nœud enfant de la leçon, rendu *inline* dans l'en-tête | Liens, vérifications et badges fonctionnent **nativement** | Rendu spécial à écrire (ancrages de liaison sur chaque ligne) |

**Recommandation appliquée en 1.34.0 : ne pas trancher, mais ne pas se fermer
la porte.** Le pluriel est livré en texte, mais stocké en **liste d'objets
porteurs d'un id**, jamais en tableau de chaînes. Mieux : corriger la
formulation d'un objectif **conserve son id** — un lien qui le viserait
survivrait donc à une retouche. Le surcoût était nul ; la migration future est
évitée.

### La forme d'un objectif — ce que révèle la pratique réelle

Extrait d'un Keynote de leçon du 601-101 (semaine 1b) :

> **À la fin de cette séquence, tu seras en mesure de :**
> 1. **Appliquer** des techniques d'annotation d'un texte
> 2. **Appliquer** des stratégies de lecture
> 3. **Pratiquer** des postures de lecture
> 4. **Identifier** des émotions et des thèmes
> 5. **Formuler** une hypothèse d'objectif de communication

Trois enseignements :

1. **Le préambule est commun**, l'objectif ne le répète pas. Ce qui se saisit
   est le **verbe + son complément**, pas la phrase entière. (Le placeholder de
   l'outil dit donc « Sera en mesure de… ».)
2. **Le verbe porte le sens** — il est en gras dans le Keynote. C'est lui qui
   dit ce que l'étudiant devra *faire*.
3. **Une leçon en aligne quatre ou cinq.** Le pluriel n'est pas un cas limite,
   c'est la norme.

### ◈ Convergence inattendue : les verbes et les niveaux cognitifs

Le module embarque déjà `NIVEAUX_COGNITIFS` (taxonomie de Bloom révisée :
Mémoriser, Comprendre, Appliquer, Analyser, Évaluer, Créer) **et** une
`BANQUE_VERBES` de dix verbes par niveau. Or les verbes du Keynote y figurent
déjà :

| Verbe employé | Niveau correspondant | Dans la banque ? |
|---------------|----------------------|------------------|
| **Appliquer** | Appliquer | oui |
| **Identifier** | Mémoriser | oui |
| **Formuler** | Créer | oui |
| **Pratiquer** | (proche d'Appliquer) | non — synonyme |

**La pratique de l'enseignant et l'outil parlent déjà le même langage, sans le
savoir.** Deux conséquences possibles, à explorer :

- un objectif pourrait porter un **niveau cognitif**, déduit de son verbe ;
- l'alignement deviendrait vérifiable **en profondeur** : une activité de
  niveau « Mémoriser » ne sert pas un objectif de niveau « Analyser ».

À noter : `TYPES_AVEC_NIVEAU_COGNITIF` couvre compétence, idée maîtresse,
activité, soutien, révision et évaluation — **pas** la leçon. C'est cohérent :
le niveau appartiendrait à l'**objectif**, pas à la leçon qui les rassemble.

### ✅ TRANCHÉ (6 août) — les objectifs vivent au niveau de la LEÇON, un point

Le « séquence » du Keynote était le mot courant, pas le terme de l'outil.

> *« C'est peut-être tout simplement moi qui, au fil du temps, ai changé
> l'usage des mots "séquences" et "leçons". »*

**▣ GÉNÉRAL — observation de méthode.** Le vocabulaire d'un enseignant
**dérive** au fil des années : les mêmes mots ne désignent plus les mêmes
choses. C'est un argument de plus pour laisser l'utilisateur **nommer ses
regroupements** (§5.2) plutôt que de lui imposer un lexique, et pour que
l'outil s'appuie sur la **structure** (ce qui contient quoi) plutôt que sur les
étiquettes.

C'est aussi un rappel pour ce document : ce qui est écrit ici est daté. Un
terme employé aujourd'hui n'aura pas forcément le même sens dans deux
trimestres — d'où l'utilité de consigner *quand* chaque décision a été prise.

**◈ Piste reportée — les supra-objectifs.** Des « grands objectifs » attachés à
une séquence, un module ou une étape restent envisageables **plus tard**. Ils
formeraient l'étage supérieur de la chaîne de convergence (§3.1) et
rejoindraient naturellement les séquences de séquences (§5.2). Rien à
construire aujourd'hui : le besoin n'est pas apparu à l'usage.

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

### ✅ TRANCHÉ (6 août, tard) — LA division du travail entre les deux vues

Énoncé par Grégoire en fin de journée, après une journée entière passée à
décider au cas par cas :

> *« Le planificateur sert seulement à disposer le tout dans le temps en
> fonction de l'horaire et du calendrier (et éventuellement des groupes-cours,
> c'est l'étape suivante dans l'organisation). Le canevas existe pour exposer
> les liens entre les éléments, c'est pour ça que c'est une carte mentale. »*

> **▣ GÉNÉRAL — la règle de décision.**
> **Le canevas expose les LIENS. Le planificateur dispose dans le TEMPS.**
> Devant toute fonctionnalité nouvelle, la question devient : *est-ce que ça
> montre une relation entre des éléments, ou est-ce que ça place quelque chose
> dans le temps ?* La réponse désigne la vue — et interdit les hybrides.

**Ce principe était déjà à l'œuvre, il lui manquait d'être écrit.** Il justifie
rétroactivement trois décisions prises le même jour, chacune tranchée alors au
cas par cas :

| Décision | Ce que le principe en dit |
|---|---|
| **Q3** — déplacer dans la grille ne bouge pas le bloc sur le canevas | Deux vues, deux rôles : l'ordre chronologique n'est pas la position logique |
| **D4** — seuls leçons et séquences se déplacent dans la grille ; le contenu reste au canevas | Le contenu porte des liens → canevas. Les conteneurs se placent dans le temps → grille |
| **Retrait de la Vue calendrier** (lot 2) | C'était précisément un **hybride** : un rendu de carte mentale rogné pour faire du calendrier — les deux à moitié |

**Corollaire de conception** : un élément peut légitimement exister dans les
deux vues, mais pour des raisons différentes — la leçon vit dans le canevas
(elle porte objectifs et liens) et reçoit sa semaine dans la grille. Ce n'est
pas une duplication : c'est la même chose regardée sous ses deux angles.

**◈ L'étape suivante, nommée ici** : les **groupes-cours**. Le planificateur
dispose aujourd'hui dans l'horaire et le calendrier ; il disposera ensuite par
groupe (§6, « un alignement, N planifications » — la semaine est commune, le
jour appartient au groupe).

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

### ◈ Où vit le planificateur ? (précision du 6 août)

Pas dans un onglet séparé : **un panneau coulissant à l'intérieur du module
Alignement**, visible en même temps que la carte.

> *« Ce sont deux perspectives différentes et complémentaires sur le même
> trimestre. »*

**▣ GÉNÉRAL.** Deux perspectives sur un même objet gagnent à être
**co-visibles**. Les séparer en onglets force l'enseignant à tenir l'une de
mémoire pendant qu'il regarde l'autre — précisément ce qu'un outil de
conception devrait lui épargner. (Le module a déjà le patron : la palette
Navigation est un panneau flottant, déplaçable et réductible.)

Report assumé : à traiter après le cœur de l'alignement.

### ◈ Fusionner la palette Navigation et le planificateur ?

Proposition du 6 août, appuyée sur deux captures du 601-101. Le rapprochement
est justifié : **les deux vues affichent le même arbre**.

| | Palette Navigation | Vue calendrier |
|---|---|---|
| Contenu | séquences › leçons | séquences › leçons › **contenus** |
| Profondeur | 2 niveaux + compteur | 3 niveaux |
| Rôle | **se déplacer** (clic = aller à) | **lire le déroulé** |
| Emplacement | palette flottante, dans Alignement | autre onglet |

La Vue calendrier est donc une Navigation **avec un niveau de plus**.

**⚠ La preuve que le doublon coûte déjà quelque chose.** Les deux vues
affichent les mêmes séquences **dans des ordres différents** : la Navigation
suit l'ordre **spatial** (position sur la carte, x puis y), la Vue calendrier
suit `semaineDebut` — qui retombe sur son repli `999` pour toutes (F3). Sur les
captures : Navigation commence par « Sem. 10 », Vue calendrier par « Sem. 1 ».

Deux lectures du même plan qui ne s'accordent pas sur l'ordre, c'est une source
de confusion permanente. **Une seule source de rendu = un seul ordre.**

**Ce que la fusion doit préserver** — les deux intentions sont réelles et ne
doivent pas être sacrifiées l'une à l'autre : se **déplacer** vite (arbre
compact, clic pour naviguer) et **lire** le déroulé (contenu déplié). La
réponse naturelle est un **niveau de détail réglable** : replier/déplier le
contenu des leçons dans un arbre unique.

### ✅ TRANCHÉ (6 août) — ce qu'on déplace, et où

Dans le planificateur fusionné, **seules les leçons et les niveaux supérieurs
sont déplaçables**. Les cellules — activités, connaissances, évaluations — se
traitent dans la carte d'alignement.

**▣ GÉNÉRAL — la règle de partage qui en découle.** Elle prolonge exactement la
distinction logique / logistique du §6 quater :

| Vue | Ce qu'on y déplace | Geste |
|-----|--------------------|-------|
| **Planificateur** | leçons, séquences, ensembles | les situer **dans le temps** |
| **Alignement** | activités, connaissances, évaluations | **composer** l'intérieur d'une leçon |

Autrement dit : *on déplace dans le temps ce qui a une place dans le
calendrier, et on compose dans la carte ce qui a une place dans une leçon.* La
leçon est la charnière — le plancher pédagogique (§5.2) est aussi la plus
petite unité déplaçable.

Cette règle donne du même coup sa forme à la « réparation en cours de route »
(§ ci-dessus) : absorber un retard, c'est déplacer des **leçons**, jamais des
activités isolées.

**⚠ Piège technique, déjà relevé (§ ci-dessus).** La Vue calendrier ne se
déplace pas telle quelle : elle recycle le rendu de la carte
(`genererSeancesHTML()`) puis le **découpe en post-traitement DOM**. La fusion
suppose de **réécrire** ce rendu, pas de le transplanter.

### ◈ Retirer les boutons « Copier » du planificateur ?

Ils servent à copier le contenu vers un plan de cours ou un calendrier, en
attendant un export repensé.

**✅ RETIRÉS (1.36.0).** Le cas « ils ne servent plus » s'applique : Grégoire
est à ce jour le seul utilisateur de l'application et ne s'en sert pas. Retrait
complet — boutons, fonctions d'extraction devenues mortes, CSS. L'export
Markdown de la modale, lui, est intact : c'est une autre fonction.

### ◈ Poignée de redimensionnement des blocs

Proposition : une poignée au coin inférieur droit, comme les palettes
d'Annoter/Évaluer.

**⚠ Ce patron n'existe pas encore.** Les palettes du module Alignement sont
**déplaçables et réductibles**, pas redimensionnables ; les poignées
d'Annoter/Évaluer agissent sur un canevas d'annotation, pas sur un panneau. Il
y a donc du neuf à écrire.

**⚠ Conflit de fond avec la disposition automatique.** Les blocs conteneurs
sont **calculés** : `reLayoutConteneur` fixe leur largeur et leur hauteur à
partir de leurs enfants. Une taille posée à la main serait **écrasée au
prochain ajout d'enfant**. Trois façons de résoudre, à trancher avant de coder :

| Option | Principe | Effet |
|--------|----------|-------|
| **A** | Poignée sur les **feuilles seulement** (activités, connaissances, évaluations) | Aucun conflit ; les conteneurs restent calculés |
| **B** | La poignée fixe une **largeur minimale**, la hauteur reste calculée | Compromis ; règle le cas des titres longs |
| **C** | La poignée bascule le bloc en **mode manuel** | Le plus libre ; exige un retour explicite à l'automatique, sinon le bloc cesse de suivre son contenu |

**✅ LIVRÉ — A puis B (1.36.0, complété en 1.37.0).** Deux comportements selon
la nature du bloc :

| Bloc | Ce que règle la poignée | Ce qui reste calculé |
|------|-------------------------|----------------------|
| **Feuille** (activité, connaissance, évaluation) | largeur **et** hauteur | rien |
| **Conteneur** (leçon, séquence) | une largeur **plancher** | la hauteur, et la largeur au-delà du plancher |

**▣ GÉNÉRAL — pourquoi un plancher et non une largeur figée.** Le conteneur
doit pouvoir continuer de grandir quand son contenu l'exige. Un plancher
exprime « au moins cette largeur » sans reprendre à l'outil la responsabilité
de contenir les enfants : *l'utilisateur fixe un minimum, l'automatique garde
la main sur le reste.* C'est ce qui permet d'ouvrir le geste aux conteneurs
sans rouvrir le conflit qui les en excluait.

Conséquence technique : sur un conteneur, la largeur est posée en **métadonnée**
(`largeurMin`), jamais en style inline — la disposition l'écraserait au passage
suivant.

Précautions communes : deltas divisés par le **zoom** de la carte (sans quoi la
poignée dérive du curseur hors 100 %), taille minimale, et **double-clic pour
rendre la main à l'automatique** — sans retour possible, un bloc retaillé
cesserait définitivement de suivre son contenu.

**▢ Ce qui a fait basculer A → B.** L'option A avait été retenue sur mon
analyse ; le terrain l'a corrigée en une capture. Le besoin réel était
d'élargir une **leçon** dont le titre courait sur deux lignes — or les leçons
sont des conteneurs, précisément ce que A excluait. *Une option choisie sur
raisonnement, invalidée par le premier usage réel.*

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

### ✅ La forme du planificateur (6 août) — une grille temporelle

Décision : **pas un arbre, une grille**. Une colonne, une rangée par semaine,
numérotées à gauche — l'inspiration explicite est la palette **« Ordre de
composition » de Keynote**.

```
  1 │ Sem. 1 (introduction)      ▸ 2 leçons
  2 │ Sem. 2                     ▸ …
  …
 16 │ Semaine de planification
 17 │ Semaine d'examens
```

**▣ GÉNÉRAL — ce que la grille résout que l'arbre ne résolvait pas.** Un arbre
*affiche* un ordre ; une grille **assigne une position**. La semaine cesse
d'être un mot écrit dans un titre pour devenir une **coordonnée** — c'est le
préalable identifié en F3. Le tri devient une conséquence de la structure au
lieu d'un calcul fragile.

**Ce qui se déplace** : séquences et leçons, verticalement. Le contenu
(activités, connaissances, évaluations) reste dans le canevas — règle de
partage du §6 quater.

**⚠ Les rangées ne se configurent pas ici.** Le cadre du trimestre stocke déjà
`nombreSemaines`, `semainePlanificationDebut/Fin` et `semaineExamensDebut/Fin`
(`trimestre-v2-init.js:285-288`). La grille doit les **dériver**, jamais les
redemander — sinon deux sources de vérité pour la même chose, et 15 rangées
d'un côté contre 17 de l'autre.

### ✅ L'ancrage temporel appartient à la LEÇON (6 août)

> *« L'unité est la leçon. Par-dessus on peut indiquer séances, séquences,
> séquences de séquences, etc. »*

Chaque leçon porte sa semaine ; les niveaux supérieurs **dérivent** leur
étendue de leurs leçons (de la première à la dernière). Aucune contradiction
possible — une séquence ne peut pas annoncer la semaine 3 pendant qu'une de ses
leçons vit en semaine 5.

Cohérent avec tout le reste : la leçon est le plancher pédagogique, la plus
petite unité déplaçable, et maintenant le porteur de l'ancrage. **Un seul
concept fait les trois.**

**◈ Reste à couvrir** : une séquence encore vide (le « Sem. 9 – » du 601-101
n'a aucune leçon) n'aurait alors aucune position. Il lui faut un ancrage propre
ou une zone « non planifié ».

### ✅ LIVRÉ (6 août, 1.38.0) — le lot 1 : l'ordre devient une donnée

Le socle est en place. `metadata.semaine` vit sur la leçon ; les niveaux
supérieurs dérivent leur étendue, récursivement. Le couple
`semaineDebut` / `semaineFin` de la séquence est **retiré**, y compris ses
deux champs de l'inspecteur — remplacés par une ligne en lecture seule
(« Semaines (dérivées des leçons) »).

**▣ GÉNÉRAL — ce que l'ablation démontre.** Tant que la séquence *pouvait*
porter sa propre semaine, deux vérités coexistaient et rien n'empêchait
qu'elles divergent. En retirant le champ, la contradiction devient
**structurellement impossible** au lieu d'être seulement déconseillée. Une
règle qu'on doit rappeler dans une doc est une règle que le modèle devrait
porter à sa place.

**Les quatre questions du plan, tranchées le 6 août :**

| # | Question | Décision |
|---|----------|----------|
| Q1+Q2 | Séquence vide, leçon sans semaine | **Zone « non planifié »** en pied de grille, une seule et même zone |
| Q3 | Le déplacement dans la grille bouge-t-il le bloc sur le canevas ? | **Non** — un indicateur, pas un déplacement. La position sur une carte mentale et l'ordre chronologique sont deux choses différentes |
| Q4 | Séquences de séquences avant ou après ? | **Après le lot 1, avant le lot 2** — la dérivation est déjà récursive, mais la grille en lecture ne doit pas être écrite pour trois niveaux fixes |
| Q5 | Les deux champs de l'inspecteur de séquence | **Retirés dans le lot 1**, dérivation partout |

**⚠ Ce que la migration ne fait PAS, et pourquoi.** Elle ne reporte aucune
semaine : ni celle qu'une séquence portait, ni celles écrites dans les titres
(« Sem. 3 - … »). Tout repart non planifié.

> **▣ GÉNÉRAL — principe candidat.** *Un outil qui devine produit des données
> indiscernables de celles que l'utilisateur a saisies.* Une répartition
> inventée aurait l'exacte apparence d'un choix pédagogique. Mieux vaut une
> case vide, qui se voit, qu'un ancrage faux, qui ne se voit pas.

**Effet de bord assumé sur le format Markdown.** Le marqueur de semaine a suivi
le modèle : il est passé de la ligne de séquence à celle de la leçon
(`### Accueil [Leçon | 1h50 | Sem. 1]`). Le marqueur de séquence garde une
étendue « Sem. 3–5 » parce qu'elle se lit bien dans un plan de cours, mais elle
est **dérivée et informative** — l'import ne la relit plus.

**Portes laissées ouvertes.** Les bornes hautes (« pas au-delà du cadre ») ne
sont pas posées : elles appartiennent au lot 3, et surtout la dérivation des
rangées depuis le cadre du trimestre reste à vérifier — `calendrier-vue.js`
qualifie `nombreSemaines` de champ « inexistant » dont le repli est calculé,
alors que le plan le donne pour acquis (`trimestre-v2-init.js:285-288`). **À
trancher au lot 2**, avant de construire les rangées dessus.

### ◈ Plusieurs groupes : un alignement, N planifications

Piste ouverte le 6 août, **à ne pas construire maintenant** :

> *« Une séance pourrait avoir lieu un lundi pour un groupe et la même séance
> un mardi pour un autre groupe. […] On pourra décliner plusieurs
> planifications, une pour chaque groupe. »*

**▣ GÉNÉRAL — c'est le patron Bibliothèque + Assemblage du projet**, et c'est
déjà la position doctrinale du module : *« le plan de cours est rattaché au
cours, pas au groupe : un même plan s'applique potentiellement à plusieurs
groupes »* (skill Alignement §3).

| Niveau | Rattaché à | Ce qu'il porte |
|--------|-----------|----------------|
| **Alignement** (patron) | le **cours** | progression, objectifs, assignation aux **semaines** |
| **Planification** (instance) | le **groupe-cours** | **dates réelles** dérivées de l'horaire, écarts propres au groupe |

Autrement dit : *la semaine est commune, le jour appartient au groupe.* Quand un
groupe prend du retard, c'est **son** instance qui diverge — la « réparation en
cours de route » devient elle aussi propre au groupe.

**⚠ Point dur relevé au code : la carte n'est rattachée à AUCUN cours.**
`planification-donnees.js` indexe les cartes par trimestre
(`{ index: { active, compteurCartes, cartes: [] }, cartes: {…} }`) — pas un seul
`coursId`. La doctrine du skill n'est donc **pas** implémentée. Décliner par
groupe suppose d'abord que la carte sache à quel cours elle appartient.

**Conséquence pour le chantier en cours** : construire la grille au niveau du
**cours** (le patron), jamais du groupe. Ce qui, aujourd'hui, revient à la
construire telle quelle — mais en gardant la porte ouverte, comme pour les
identifiants d'objectifs.

---

## 6 quinquies. ▣ GÉNÉRAL — l'exigence est progressive (6 août, discussion)

Formulation de Grégoire, en fin de journée d'alignement :

> *« Il est simple et peut en même temps être complexe si l'utilisateur le
> souhaite. Un enseignant pourrait créer des leçons avec juste des activités
> s'il le voulait, sans même avoir d'objectifs. C'est ce que font la plupart
> des enseignants dans mon département. Par contre, quelqu'un qui veut
> vraiment aligner ses cours peut y ajouter des objectifs et des idées
> maîtresses et l'application vérifie l'alignement. »*

**Le principe** : l'outil n'impose pas l'alignement, il le **rend visible** ;
l'exigence est progressive et appartient à l'enseignant. Concrètement : les
badges signalent (« ! » gris, ⚠ orange), ils ne bloquent jamais — un badge
gris est une invitation, pas une erreur. L'usage minimal (séquences → leçons
→ activités) est un outil complet.

**Ce que la vérification fait, précisément** : des connexions typées,
orientées et **transitives** (une idée maîtresse atteint sa compétence
directement *ou via une autre idée* ; le ⚠ remonte la chaîne jusqu'à
« aucune évaluation ne vérifie cette compétence »). Ce qu'elle ne fait
pas : juger la **pertinence** d'un lien — aucune reconnaissance sémantique.
Le moteur sémantique est l'enseignant ; l'outil rend la structure visible
pour que ce jugement puisse s'exercer, il ne prétend pas l'exercer.

**◈ Rappel de périmètre** : les objectifs de leçon ne sont PAS encore dans
la boucle de vérification (la chaîne passe par compétence / idées
maîtresses). C'est la piste des liens objectif → activité (§6 ter) — les
identifiants sont prêts depuis 1.34.0.

---

## 6 sexies. ◈ OUVERT — réutiliser : du prototype à la bibliothèque de modèles

**État : idée consignée le 6 août au soir, volontairement NON tranchée.**
Décision de Grégoire : *« On laisse mûrir, c'est plus sage »* — l'usage réel
dira si le besoin est intra-carte (déjà couvert) ou inter-cartes. Ce qui suit
est le design instruit ce soir-là, pour qu'il ne s'évanouisse pas avec la
discussion.

### Ce qui est déjà livré (1.45.0)

La **duplication d'un conteneur** : ⌘D, ⌥+glisser ou le bouton « Dupliquer »
de l'inspecteur créent une copie indépendante en profondeur d'une leçon ou
d'une séquence — le patron « prototype » de Keynote, **à l'intérieur d'une
carte**. Ce que ça ne fait pas : réutiliser un modèle d'une carte à l'autre,
d'un cours à l'autre, ou d'un trimestre au suivant.

### L'idée de Grégoire

> *« La question des modèles de leçons reprend un peu le même principe que les
> bibliothèques et les productions qu'on y met dedans. Il y a déjà une
> bibliothèque de cartes. On pourrait peut-être y ajouter, dans cette
> bibliothèque de cartes, une bibliothèque de leçons. »*

**▣ GÉNÉRAL — pourquoi c'est juste.** Un besoin de réutilisation qui ressemble
à un besoin déjà résolu ailleurs dans l'outil doit emprunter le **même patron**
plutôt qu'en inventer un. L'utilisateur y retrouve des gestes qu'il connaît, et
le code y retrouve des modules déjà éprouvés.

### Vérifications au code (6 août)

- `bibliothequeAlignements` : clé **non namespacée**, partagée entre tous les
  trimestres. Forme d'une entrée :
  `{ nom, dateCreation, donnees: { compteur, compteurLiens, noeuds, liens } }`.
- **Un modèle de leçon a exactement cette forme** — c'est le même objet,
  restreint à un **sous-arbre** au lieu de la carte entière.
- Le moteur existe : `dupliquerConteneurEnProfondeur()` parcourt déjà un
  sous-arbre, régénère les ids, recopie les objectifs avec de **nouveaux**
  identifiants et recrée les liens **internes** en ignorant les externes.
  Exporter et estampiller sont ces deux moitiés, séparées par un stockage.
- **Nuance qui renforce l'idée** : le patron canonique (`cours`, `enseignants`,
  `horaires`) fonctionne par **référence par id** — l'assemblage ne copie pas.
  Mais `importerDepuisBibliotheque()` **clone en profondeur**, délibérément.
  Une bibliothèque de leçons suivrait donc la variante **carte** du patron
  (copie à l'usage), pas la variante *cours* (référence) — et c'est
  précisément la sémantique qu'un modèle exige.

### ⚠ Le piège identifié

**Ne pas** mettre cartes et leçons dans la même collection avec un champ
`type`. `SKILL_integrite_globaux.md` est catégorique : *ne jamais filtrer par
flag, toujours par identité de la source*. Donc **deux clés**
(`bibliothequeAlignements` + une nouvelle `bibliothequeLecons`) et **une seule
modale** à deux sections — l'unité est dans l'interface, pas dans le tableau.

### Ce qui viendrait presque gratuitement

- **Répertoires** : `repertoires-bibliotheque.js` est entièrement générique,
  paramétré par un nom de bibliothèque (`biblio`) — classer les modèles en
  dossiers ne demanderait aucun code de rangement.
- **Modale** : `bibliotheque-ui.js` est générique.
- **Partage** : `exporterAlignementJSON` / `importerAlignementFichier` existent
  déjà — les modèles deviendraient échangeables entre collègues.

### Ce qu'un modèle ne doit PAS emporter

- Sa **semaine** : un modèle n'est pas ancré dans un trimestre (règle neuve).
- Ses **liens externes** : il n'est pas aligné tant qu'il n'est pas posé
  (règle déjà appliquée par la duplication de 1.45.0).

### Questions restées ouvertes

- **Leçons seulement, ou conteneurs** (leçons *et* séquences) ? La
  sérialisation est identique ; une séquence-type semble au moins aussi utile.
  Penchant : « Modèles » tout court, acceptant les deux.
- **Création** : « Enregistrer comme modèle » depuis l'inspecteur d'une leçon
  existante — on modélise depuis le réel, jamais dans un éditeur à part.
- **Vignette** : un rendu miniature fidèle est coûteux et fragile ; une carte
  nommée avec résumé (« Atelier lecture · 3 activités · 2 pér. ») donnerait
  l'essentiel de la valeur.

### Le signal qui déclencherait le chantier

Se surprendre à vouloir un modèle **d'un cours à l'autre** ou **d'un trimestre
au suivant**. Tant que le besoin reste dans une seule carte, la duplication
suffit et la bibliothèque serait du confort.

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
