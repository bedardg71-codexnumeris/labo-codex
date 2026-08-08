# Carte d'alignement — audit des exports, intégration des productions, et décisions

> **Écrit le 8 août 2026 au soir, à la demande de Grégoire, AVANT de coder.**
> Même rôle que `PLAN-alignement-noeuds-et-duree-2026-08-08.md` : servir de
> **filet contre la compression**. Il porte l'audit relevé au code, les
> décisions déjà prises, et celles qui attendent — présentées en choix arrêtés
> avec recommandation explicite.
>
> État de départ : **1.57.0**, commit `5945f69e`, branche
> `claude/rituel-de-debut-rbirt5`, Vitest 1832/1832.

---

## 0. Décision déjà prise

**L'onglet « Alignement pédagogique » devient « Carte d'alignement ».** (D0,
tranchée par Grégoire le 8 août.)

Le critère qui l'a fait pencher vient des six onglets voisins de Conception :

> Alignement pédagogique · **Plan de la leçon** · **Productions étudiantes** ·
> **Grilles de critères** · **Échelles de performance** ·
> **Cartouches de rétroaction** · **Pratiques de notation**

Six nomment un **objet de travail**. Un seul nommait une **théorie**.
« Carte d'alignement » nomme l'objet comme ses voisines, garde l'intention en
qualificatif — et surtout **c'est déjà le mot de l'application** : la première
page du guide intégré s'intitule *« Construis ta carte d'alignement »*, et tout
le code dit « la carte », « les cartes », `planif-liste-cartes`.

⚠ **Procédure** : `js/config.js` est en **zone protégée** (CLAUDE.md, « NE
JAMAIS MODIFIER sans autorisation »). La demande de Grégoire vaut autorisation,
consignée ici. Vérifié : `noms_stables.json` protège le **nom de la constante**
`configurationsOnglets` (ligne 10), **pas la valeur des libellés** — le
changement est donc licite sans toucher au registre.

⮕ **Ruissellement à prévoir** : `js/config.js:40`, `index.html:4146` (commentaire
de section), `index.html:4152` (titre affiché), `index.html:11700` (guide
« Navigation : Conception → … »), `index.html:14090` (glossaire ELLAC),
les infobulles, et `METHODE-ALIGNEMENT.md`. C'est le périmètre de **#419**.

---

## 1. Audit des outils d'import/export — relevé au code le 8 août

### 1.1 Inventaire réel : SIX générateurs, pas deux

L'audit a trouvé plus d'outils que le panneau n'en montre.

| Où | Outil | Fonction |
|---|---|---|
| Panneau « Plan de la leçon », bouton 📄 | Export **Texte** | `genererPlanTexte()` — `planification-carte.js:5122` |
| Panneau, bouton 📊 | Export **TSV** | `genererPlanTSV()` — `planification-carte.js:5240` |
| Panneau, bouton « Exporter / Importer » (`org-btn-export`) | Export **TXT** ×2 audiences | `genererExportTXT(estEleve)` — `organisateur.js:1084` |
| Idem | Export **Markdown** ×2 audiences | `genererExportMD(estEleve)` — `organisateur.js:1211` |
| Idem | Import **Markdown** | `parserPlanMD` / `importerPlanDepuisMD` — `organisateur.js:1373` / `:1477` |
| Menu Actions (hors panneau) | Export/Import **carte JSON**, Import **inter-trimestre** | `exporterCarte()`, `reprendreCarte()` |

**Deux familles de générateurs qui ne se connaissent pas** : celle de
`planification-carte.js` (Texte, TSV) et celle d'`organisateur.js` (TXT, MD).
Elles produisent des documents concurrents à partir des mêmes données.

### 1.2 ⚠⚠ Le point le plus important : il y a des DONNÉES dans la page

L'Organisateur écrit, **pour chaque activité d'une leçon** :

```
planification_seances[cleNote].activites[actId] = { retroaction, productionId }
```

(`planification-carte.js:4937` `sauvegarderChoixActivite`, lu en
`organisateur.js:633` et `:726`.)

C'est un stockage **distinct** de `metadata.retroaction` et
`metadata.productionId`, portés par le nœud **Évaluation** et écrits par
l'Inspecteur (`planification-carte.js:2120`, `:2156`).

**Deux vérités pour les deux mêmes notions**, sur deux porteurs différents
(l'activité d'un côté, l'évaluation de l'autre). L'export Markdown lit le
premier ; l'Inspecteur écrit le second.

⮕ **Supprimer la page emporterait ces rattachements sans que rien ne le
signale.** C'est le motif n°1 pour ne pas supprimer tout de suite.

### 1.3 ⚠ L'import Markdown écrit dans le champ MORT

`organisateur.js:1558` et `:1588` posent `metadata.objectif` — la **chaîne
singulière legacy**, celle-là même trouvée le matin du 8 août dans la vue leçon
supprimée, et que `migrerObjectifsVersMetadata()` remplace par
`metadata.objectifs` (liste).

Rattrapé de justesse par la branche « format 2 » de cette migration — mais elle
ne tourne qu'au **chargement de carte** (`planification-carte.js:3988`). Donc
**un objectif importé n'apparaît qu'après un rechargement**. Même défaut, second
endroit, et cette fois la migration masque le symptôme au lieu de le révéler.

### 1.4 ⚠ Vocabulaire périmé : les exports disent « SÉANCE » pour une leçon

`genererPlanTexte` émet `┌ SÉANCE : <titre de la leçon>`.
`genererPlanTSV` a une colonne `Séance` et écrit `Séance` en type.

Or la distinction a été tranchée les 6-7 août : une **séance** est une
occurrence de l'horaire (`seancesHoraire`, affichée « Séance A/B »), une
**leçon** est une unité logique qui peut s'étaler sur plusieurs séances. C'est
le document remis aux collègues qui contredit le modèle.

### 1.5 ⚠ Les exports ignorent le rollup — et peuvent compter DOUBLE

Les quatre générateurs lisent `lecon.metadata.duree`. Or une leçon est un
**conteneur** : sa durée est un rollup (`dureeRollupNoeud`), jamais un champ
propre — c'est la décision du 4 août, et depuis le 8 août la carte affiche ce Σ
dans l'en-tête.

Pire, dans `genererPlanTexte` :

```
if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;   // la LEÇON
... puis, pour chaque enfant :
if (cd.metadata && cd.metadata.duree) dureeSeq += cd.metadata.duree;   // ses ACTIVITÉS
```

Une leçon portant une durée héritée d'avant le 4 août serait **comptée deux
fois** dans le total de séquence. Et le chiffre de l'export divergerait du Σ
affiché sur la carte.

### 1.6 Les objectifs sont mal servis

- **Texte et TSV** : aucun objectif, nulle part.
- **Markdown et TXT** : un seul (`objectifDeLeconParId` rend le **premier**),
  avec un repli élégant sur les idées maîtresses ancêtres quand il n'y en a pas.

Or le code affirme lui-même qu'« une leçon a TOUJOURS plusieurs objectifs »
(constat de Grégoire, 6 août). Depuis #403, chaque objectif porte un id et peut
être **servi** par une activité — rien de tout cela ne sort.

### 1.7 L'import Markdown est LOSSY par construction

`parserPlanMD` ne reconnaît que `[Séquence]`, `[Leçon]`, `**Objectif**` et
`**Évaluation**`. `importerPlanDepuisMD` ne crée que des **séquences** et des
**leçons**.

Il ne crée **ni activités, ni exposés, ni connaissances, ni nœuds
d'enseignement explicite, ni liens, ni objectifs multiples**. Un aller-retour
export → import perd tout ce qui fait l'alignement.

Ce n'est pas une régression de nos changements — c'est la nature de l'outil.
Mais elle s'aggrave : **18 types aujourd'hui, dont 6 ajoutés en deux jours.**

### 1.8 ✔ Ce qui résiste très bien

Les exports passent par `carte.obtenirLabelNoeud(enf)` et non par une liste de
types en dur. **L'Exposé et les cinq nœuds d'enseignement explicite y
apparaissent donc DÉJÀ correctement, sans une ligne de code.** C'est le
dividende du rabattement sur les familles.

### 1.9 ⚠ TROUVAILLE — l'axe de profondeur EXISTE DÉJÀ, à moitié construit

`genererExportTXT(estEleve)` et `genererExportMD(estEleve)` portent un booléen
d'**audience**, et l'en-tête du document le dit en toutes lettres :

```
'Document contractuel (étudiant·e)'  |  'Document pédagogique (enseignant·e)'
```

La garde `if (!estEleve)` (`organisateur.js:1194` et `:1325`) retire les
activités et leurs durées de la version étudiante.

⮕ **Ce que Grégoire demande n'est donc pas une capacité neuve : c'est la
généralisation d'une capacité qui existe — dans la page qu'on s'apprête à
supprimer.** Un booléen à deux valeurs devient un niveau à trois. C'est une
raison de plus de **porter avant de supprimer**.

---

## 2. Intégration des productions étudiantes — état et directions

### 2.1 Ce qui existe

« Productions étudiantes » est **déjà un onglet voisin** (`conception/productions`).
Il ne s'agit pas de créer un concept mais de relier deux modules.

`chargerProductions()` (`planification-carte.js:4890`) lit
`window.cle('productions')`, filtre `estActive`, et rend
`{id, nom, type, ponderation, grilleId, dateEcheance}` — l'échéance étant
résolue **par groupe** via `obtenirEcheanceEffective`.

Le nœud Évaluation porte `metadata.productionId` : une **référence par id**,
jamais une copie. C'est le bon patron SSOT.

### 2.2 ⚠ PRÉALABLE — `productionId` ne survit pas à la reprise inter-trimestre

Vérifié au code (`planification-donnees.js:486-492`) : la reprise d'une carte
recopie son contenu, metadata comprise. Et pour le **cours**, elle applique un
contrôle de vivacité explicite, commenté ainsi :

> « On ne recopie que si le cours EXISTE encore : un id mort vaut moins que le
> cours actif posé par défaut à la création. »

Mais `cours` est une collection **globale**, alors que `productions` est
**namespacée par trimestre** (`window.cle('productions')`). Et **aucun contrôle
équivalent n'existe pour `productionId`**.

⮕ Reprendre le 601-101 d'H2026 pour A2026 emporte donc des **références mortes,
en silence**. Même classe que #407. **À corriger avant d'appuyer davantage sur
ce lien** — sinon on bâtit sur une attache qui casse à chaque rentrée.

### 2.3 Quatre directions, de la moins chère à la plus profonde

| # | Direction | Ce qu'elle apporte | Coût |
|---|---|---|---|
| **D** | **Nommer les deux trous** | Une production qu'aucun nœud ne référence = *évalué mais non planifié*. Un nœud Évaluation sans production = *planifié mais jamais évalué*. Les badges font déjà ce geste pour les liens. | faible |
| **C** | **L'échéance ancre l'évaluation** | La semaine d'un nœud Évaluation **dérive** de la `dateEcheance` de sa production au lieu d'être posée à la main. Même mouvement que D3 : une saisie, tout le reste dérive. | moyen |
| **B** | **Le poids évaluatif dans la carte** | Part de la note rattachée à chaque séquence (`ponderation`). Une séquence longuement enseignée valant 5 % est un désalignement visible d'un coup d'œil. | moyen |
| **A** | **Fermer la boucle** | La production porte une `grilleId` ; l'évaluation est reliée à des connaissances par « se vérifie par ». Demander : *les critères de la grille couvrent-ils ces connaissances ?* C'est la vérification que le module promet par son nom. | élevé |

---

## 3. Décisions à trancher — choix arrêtés et recommandations

> ✅ **TRANCHÉES le 8 août 2026 en fin de soirée** (arbitrage demandé par
> Grégoire). Verdict et amendements : **§3bis, juste en dessous** — à lire
> AVANT les options, qui restent ci-dessous comme pièces du dossier.

> Chaque décision est présentée avec ses options et **une recommandation
> explicite**. Répondre par le numéro de l'option suffit.

---

### D1 — Que fait-on des données de l'Organisateur avant de supprimer la page ?

*(Voir §1.2 : `planification_seances[...].activites` porte rétroaction et
production, sur des ACTIVITÉS, en parallèle du nœud Évaluation.)*

**Option 1 — Inventorier d'abord, décider ensuite. ★ RECOMMANDÉE**
Écrire un relevé en lecture seule sur tes trimestres réels : combien de leçons,
combien d'activités, combien de rattachements non vides. Si c'est zéro, on
supprime net et le reste de la décision tombe. Si ce n'est pas zéro, on
migre — et on saura vers quoi.
*Pourquoi : c'est la contrainte de préservation des données de CLAUDE.md, et
c'est trente minutes contre un risque de perte silencieuse. On ne décide pas
d'une migration avant de savoir s'il y a quelque chose à migrer.*

**Option 2 — Migrer d'office vers le nœud.**
Porter `{retroaction, productionId}` de l'activité vers son nœud, sans relevé
préalable. Plus rapide, mais on écrit une migration peut-être inutile — et si la
clé est vide, on a ajouté du code mort au moment où on prétend en retirer.

**Option 3 — Supprimer sans regarder.**
Défendable seulement si tu sais déjà n'avoir jamais utilisé ces sélecteurs.
Je ne le recommande pas : la clé est alimentée depuis un panneau que tu as
utilisé, et rien ne signalerait la perte.

---

### D2 — Où vivent les rétroactions et les productions, après ?

*(Le double stockage du §1.2 doit se résoudre dans un sens ou dans l'autre.)*

**Option 1 — Sur le nœud, dans `metadata`. ★ RECOMMANDÉE**
Une seule vérité, portée par le nœud, comme la durée, la semaine et les
objectifs depuis les chantiers du 6-8 août. La clé `planification_seances` cesse
d'être un second modèle de données parallèle à la carte.
*Pourquoi : c'est la direction que tout le module a prise en trois jours — la
donnée vit sur le nœud, et `planification_seances` a déjà été vidé de ses notes
(#367) et de son objectif personnalisé (F1). Ce serait la dernière poche.*

**Option 2 — Garder la clé des séances comme porteur.**
Cohérent avec l'existant, mais maintient deux modèles et deux chemins
d'écriture — exactement ce que le principe zéro-dette refuse.

⚠ Une nuance à trancher **dans les deux cas** : aujourd'hui la rétroaction est
posée sur une **activité** (Organisateur) et sur une **évaluation** (Inspecteur).
Sur quel type doit-elle vivre ? Ma lecture : sur **l'évaluation**, parce qu'une
rétroaction porte sur un travail rendu, pas sur un moment de classe. Mais tu es
mieux placé pour le dire.

---

### D3 — L'ordre entre suppression de la page et portage des exports

**Option 1 — Porter d'abord, supprimer ensuite. ★ RECOMMANDÉE**
Les exports multi-niveaux vivent dans la Carte d'alignement, avec le vocabulaire
corrigé et la profondeur en paramètre. **Puis** la page disparaît.
*Pourquoi : l'axe de profondeur existe déjà dans cette page (§1.9). Supprimer
d'abord, ce serait jeter une capacité à moitié construite pour la rebâtir
ensuite — et la règle du projet est de retirer ce qu'on REMPLACE, pas ce qu'on
compte remplacer.*

**Option 2 — Supprimer d'abord, reconstruire ensuite.**
L'écran se simplifie plus vite, mais on perd temporairement les quatre
générateurs de la page, dont les deux niveaux d'audience.

---

### D4 — Combien de niveaux d'export, et lesquels ?

**Option 1 — Trois niveaux. ★ RECOMMANDÉE**

| Niveau | Contenu | Pour qui |
|---|---|---|
| **Sommaire** | Séquences, semaines, titres de leçons, évaluations avec pondération. Ni durées, ni activités, ni liens. | Le plan de cours |
| **Déroulement** | + tous les objectifs · + exposés et activités avec durées · + Σ par leçon et par séquence · + rétroaction | Toi, en classe |
| **Alignement** | + connaissances · + liens verbalisés · + objectifs servis (#403) · + productions rattachées avec grille et pondération | La preuve d'alignement |

*Pourquoi trois : ce sont trois publics réels et trois usages distincts, et le
niveau intermédiaire est celui que tu utiliseras le plus. Deux ne suffisent pas
— c'est déjà ce qu'a l'Organisateur, et il manque le sommaire.*

**Option 2 — Deux niveaux** (étudiant / enseignant), en gardant l'axe existant.
Moins de travail, mais on n'obtient pas le sommaire collable dans un plan de
cours, qui est précisément ce que tu as demandé.

**Option 3 — Quatre niveaux ou plus.** Je le déconseille : au-delà de trois, le
choix devient lui-même une friction, et les niveaux intermédiaires se
ressemblent.

---

### D5 — Profondeur et format : un axe ou deux ?

**Option 1 — Deux axes orthogonaux, un seul générateur. ★ RECOMMANDÉE**
La **profondeur** (3 niveaux) et le **format** (texte, tableau, Markdown) sont
indépendants. Un générateur unique prend la profondeur en paramètre ; le format
n'est qu'une mise en forme finale.
*Pourquoi : aujourd'hui les deux sont confondus — le Texte donne un niveau, le
TSV un autre, et il existe six générateurs qui se recopient. Les croiser
naïvement en donnerait neuf. Le paramètre les ramène à un.*

**Option 2 — Une liste plate de documents prédéfinis.**
Plus simple à expliquer, mais c'est l'empilement actuel sous un autre nom.

---

### D6 — Dans quel ordre attaquer l'intégration des productions ?

**Option 1 — Le préalable, puis D → C → B → A. ★ RECOMMANDÉE**
D'abord le contrôle de vivacité de `productionId` à la reprise inter-trimestre
(§2.2), qui est un **correctif**, pas une fonctionnalité. Puis les deux trous
nommés (D), l'ancrage par l'échéance (C), le poids évaluatif (B), et la
couverture des critères (A) en dernier.
*Pourquoi : D est le moins cher et le plus parlant — il utilise le geste des
badges que tu connais déjà. Et A dépend des grilles, donc d'un autre module :
le garder pour la fin évite de coupler deux chantiers.*

**Option 2 — Attaquer par A**, la vérification de couverture des critères.
C'est la plus belle promesse du module, mais la plus chère, et elle suppose
que le rattachement production ↔ évaluation soit déjà fiable — ce qu'il n'est
pas encore (§2.2).

**Option 3 — Ne rien faire ce cycle** et rester sur le rattachement actuel.
Défendable si les portes terrain et #414 passent devant.

---

## 3bis. ✅ ARBITRAGE — les six décisions tranchées (8 août 2026, fin de soirée)

> Grégoire a demandé de trancher. **Les six recommandations ★ sont retenues.**
> Mais l'arbitrage n'a pas été un tampon : chaque décision a été **revérifiée au
> code**, et cette relecture a produit **trois amendements** qui changent l'ordre
> des travaux. Ils sont signalés ⮕ **AMENDEMENT**.
>
> Autorité : ces choix sont un arbitrage technique, pas un décret. **D2b est le
> seul point réellement pédagogique** — il est signalé comme tel, et c'est celui
> sur lequel un veto de Grégoire est le plus attendu.
>
> ⮕ **ET LE VETO EST TOMBÉ, le soir même** : « les rétroactions sont formatives,
> sur les activités ». D2b était fausse. Voir la section D2b ci-dessous — la
> correction ouvre du travail **non prévu** (une capacité absente de la Carte),
> et invalide une phrase de cet arbitrage (« si D1 rend zéro, D2b tombe »).
> ▣ *Le point qui avait été signalé comme le plus fragile est celui qui a cassé.
> Le signalement valait donc quelque chose — mais signaler n'est pas vérifier.*

| # | Tranché | Amendement |
|---|---|---|
| **D1** | **Option 1** — inventorier d'abord | ⮕ le relevé est **écrit et livré**, la décision est exécutable ce soir |
| **D2** | **Option 1** — la donnée vit sur le nœud | ⮕ **contrainte d'ordre neuve** : APRÈS D3/D4/D5, jamais avant |
| **D2b** | ❌ **VETO** — sur l'**ACTIVITÉ** (formative) | ⮕ révèle une **CAPACITÉ** manquante, pas des données |
| **D3** | **Option 1** — porter, puis supprimer | — |
| **D4** | **Option 1** — trois niveaux | — |
| **D5** | **Option 1** — deux axes, un générateur | — |
| **D6** | **Option 1** — le préalable, puis D→C→B→A | ⮕ le préalable couvre **deux chemins**, pas un |

---

### D1 → Option 1, et le relevé est livré

Trancher « inventorier d'abord » sans fournir l'inventaire, c'est déplacer la
décision d'un cran, pas la prendre. ⮕ **AMENDEMENT** : le relevé existe —
`plans de travail/inventaire-D1-activites-organisateur.js`. Lecture seule, à
coller en console, **balaie tous les trimestres** (la clé est namespacée depuis
#367 et un rattachement peut dormir dans un trimestre inactif).

Il compte séparément les rétroactions **posées sciemment** — `'aucune'` est la
valeur par défaut du sélecteur et n'est pas un rattachement — et signale au
passage les **références mortes**, ce qui instruit D6 gratuitement.

⚠ Un piège évité en l'écrivant, qui vaut d'être noté : `trimestres.js:717` lit
les productions avec un **repli sur la clé nue**. Un relevé qui l'ignorerait
déclarerait mortes toutes les références d'un trimestre dont les productions
n'ont pas migré — un faux massacre. *Lire par un chemin et juger par un autre,
c'est exactement le défaut de #419.* Le repli est donc dans le script.

### D2 → Option 1 (le nœud), MAIS pas tout de suite

La destination est la bonne : une seule vérité portée par le nœud, comme la
durée, la semaine et les objectifs depuis les chantiers du 6-8 août.

⮕ **AMENDEMENT — contrainte d'ordre que l'audit ne dit pas.** Vérifié au code :
`metadata.productionId` et `metadata.retroaction` ne sont lus par **personne**
hors de l'Inspecteur qui les écrit (`planification-carte.js:2120`, `:2156` — et
c'est tout). Pendant que `activites[].productionId`, lui, **est lu par les
exports** (`organisateur.js:633`, `:726`).

*Migrer maintenant, ce serait déplacer la donnée du seul porteur qui a des
lecteurs vers un porteur qui n'en a aucun* — les exports iraient silencieusement
au blanc. **D2 ne peut donc s'exécuter qu'APRÈS D3/D4/D5**, quand les exports
portés lisent le nœud. Même famille que l'archive de #409 : un porteur sans
lecteur n'est pas une source de vérité, c'est une copie morte.

### D2b → ❌ ~~sur l'ÉVALUATION~~ · **VETO DE GRÉGOIRE, 8 août au soir**

> « Les rétroactions sont formatives, sur les activités. »

⮕ **La rétroaction vit sur l'ACTIVITÉ.** La proposition était fausse et le veto
la corrige.

**Où était l'erreur, parce qu'elle est réutilisable.** L'argument avancé
s'appuyait sur `ponderation`, `grilleId` et `dateEcheance` — trois attributs de
la **production**. Ils plaident effectivement pour que le rattachement
`productionId` vive sur l'évaluation. Mais ils ne disent **rien** de la
rétroaction, qui est une autre notion : *l'argument a été transféré d'un
rattachement à l'autre parce qu'ils voyageaient dans le même objet
`{retroaction, productionId}`.* La cohabitation de deux champs dans une
structure n'est pas un argument sur leur nature.

⮕ **Les deux rattachements se séparent donc, avec deux porteurs distincts :**

| Rattachement | Porteur | Pourquoi |
|---|---|---|
| `retroaction` | le nœud **ACTIVITÉ** | formative — elle porte sur le travail *pendant* qu'il se fait |
| `productionId` | le nœud **ÉVALUATION** | sommative — la production porte grille, pondération, échéance |

---

### ⚠⚠ CE QUE LE VETO RÉVÈLE — ce n'est pas de la donnée, c'est une CAPACITÉ

Vérification faite après le veto, et c'est la conséquence la plus lourde de tout
l'audit :

```js
if (donnees.type === 'evaluation') {          // planification-carte.js:2110
    var retros = [['aucune','Aucune'], ['orale','Orale'], …];
```

**L'Inspecteur ne propose la rétroaction que sur un nœud Évaluation.** Sur une
activité, il n'y a pas de champ. ⮕ **Aujourd'hui, poser une rétroaction
formative sur une activité n'est possible QUE depuis l'Organisateur — la page
qu'on s'apprête à supprimer.**

⮕ **Supprimer la page ne ferait donc pas perdre des données : ça ferait perdre
le seul endroit où le geste que Grégoire décrit est possible.** C'est un cran
au-dessus de la trouvaille §1.2.

⮕ **CORRECTION D'UNE ERREUR DE L'ARBITRAGE INITIAL** : il y était écrit « si le
relevé D1 rend zéro, D2 et D2b tombent ». **C'est faux.** Un relevé à zéro dirait
seulement qu'il n'y a rien à *migrer* ; la **capacité**, elle, doit être portée
dans tous les cas. D1 tranche l'existence de données, pas celle du besoin.

⮕ **Travail neuf, non prévu, requis AVANT la suppression** : ajouter le sélecteur
de rétroaction aux types d'activité dans l'Inspecteur (`TYPES_ACTIVITE`), et
écrire dans `metadata.retroaction` du nœud activité.

### ⚠ Dette adjacente relevée au passage (zéro-dette : à fondre dans le portage)

- **`sauvegarderChoixActivite` est DUPLIQUÉE VERBATIM** — `organisateur.js:1643`
  **et** `planification-carte.js:4937`. Deux fonctions homonymes, même corps,
  qui écrivent la même clé. Une seule doit survivre au portage.
- **La liste d'options `retros` est en dur à TROIS endroits** —
  `organisateur.js:742`, `planification-carte.js:2111` et `:5041`. Elle devient
  une constante unique quand le sélecteur gagne les activités, sinon le prochain
  ajout d'option se fera à deux endroits sur trois.

### 📐 QUESTION OUVERTE que le veto soulève — à trancher par Grégoire

Si toute rétroaction est formative et vit sur l'activité, **que devient le
sélecteur de rétroaction du nœud Évaluation** ? Deux lectures :

1. **Il est de trop** — il a été posé là par défaut, et le geste réel est
   ailleurs. On le retire en même temps (zéro-dette).
2. **Il garde un sens distinct** — la rétroaction *sur le rendu* (sommative,
   « comment je remets le travail commenté »), différente de la formative.
   Les deux coexistent alors, avec deux libellés qui les distinguent.

⮕ Non tranché ici **volontairement** : c'est exactement le terrain où
l'arbitrage vient de se tromper une fois.

### D3, D4, D5 → Options 1, sans réserve

**D3** est directement la règle du projet : « tout nouveau chantier RETIRE ce
qu'il remplace » — ce qu'on *remplace*, pas ce qu'on *compte* remplacer.
Supprimer d'abord, ce serait retirer une capacité (l'axe d'audience du §1.9)
pour la rebâtir après.

**D4** — trois niveaux : Sommaire (le plan de cours), Déroulement (toi, en
classe), Alignement (la preuve). Deux ne donnent pas le sommaire collable, qui
est précisément la demande.

**D5** — la profondeur et le format sont orthogonaux. C'est la décision la plus
rentable des six : **six générateurs qui se recopient deviennent un**, et les
croiser naïvement en donnerait neuf. Les défauts §1.4 (« SÉANCE » pour une
leçon) et §1.5 (double comptage de durée) se corrigent alors **une fois**, pas
six. ⮕ Corollaire : D5 avant D4 dans l'exécution — le générateur unique d'abord,
les trois niveaux comme paramètre ensuite.

### D6 → Option 1, et le préalable est plus large qu'annoncé

⮕ **AMENDEMENT.** L'audit pose le préalable sur `metadata.productionId`. La
vérification en donne **deux, pas un** :

1. `planification-donnees.js` — `productionId` y a **zéro occurrence**. La
   reprise recopie la metadata en bloc, sans le contrôle de vivacité qu'elle
   applique pourtant au cours (`:486-492`, commenté « un id mort vaut moins que
   le cours actif »).
2. `copierSeancesLecons` — deep-copy de l'entrée de séance **entière**, donc
   `.activites[].productionId` avec. Second chemin, même trou, non relevé.

⮕ Un correctif qui ne traiterait que le premier laisserait la moitié du trou
ouvert. Et il est **daté** : `productions` est namespacée par trimestre, donc
le trou s'ouvre **à chaque rentrée** — reprendre le 601-101 d'H2026 pour A2026
emporte des références mortes en silence. À faire avant d'appuyer davantage sur
ce lien.

---

### Ordre d'exécution qui découle de l'arbitrage

Le §4 ci-dessous reste juste, avec **deux inflexions** :

1. **D1** — passer le relevé (5 min, chez Grégoire). *Si zéro : D2 et D2b
   tombent, et l'étape 5 se simplifie.*
2. Corriger l'import Markdown qui écrit dans le champ mort (§1.3).
3. Corriger la vivacité de `productionId` — **les deux chemins** (D6 préalable).
4. Porter les exports : **le générateur unique d'abord (D5)**, les trois niveaux
   ensuite (D4), vocabulaire « leçon » rétabli, durées par `dureeRollupNoeud`,
   objectifs au pluriel.
5. **Puis** migrer les rattachements vers le nœud (D2) — *pas avant, sous peine
   d'exports blancs.* ⮕ **Étape élargie par le veto D2b** : ajouter d'abord le
   sélecteur de rétroaction aux **types d'activité** dans l'Inspecteur (il est
   aujourd'hui réservé à `evaluation`), puis migrer `retroaction` vers le nœud
   ACTIVITÉ et `productionId` vers le nœud ÉVALUATION — deux porteurs, pas un.
   Fondre au passage la duplication de `sauvegarderChoixActivite` et les trois
   copies de `retros`.
6. **Puis** supprimer la page — *jamais avant l'étape 5, sous peine de retirer
   le seul endroit où une rétroaction formative se pose.*
7. **Puis** les productions : D → C → B → A (D6).

⮕ **#416 est clos par cet arbitrage** : ses trois questions 📐 sont répondues
par D4 (le périmètre « présentable » = le niveau **Sommaire**) et D5 (format et
profondeur séparés).

---

## 4. Ce que l'audit conclut sur l'ordre général

**Ne pas supprimer le « Plan de la leçon » maintenant.** L'ordre qui découle des
recommandations ci-dessus :

1. **Inventorier** `planification_seances[...].activites` (D1) — lecture seule.
2. **Corriger** l'écriture dans le champ mort à l'import Markdown (§1.3).
3. **Corriger** le contrôle de vivacité de `productionId` (§2.2).
4. **Porter** les exports dans la Carte d'alignement : profondeur en paramètre,
   vocabulaire « leçon » rétabli, durées passées par `dureeRollupNoeud`,
   objectifs au pluriel (D3, D4, D5).
5. **Puis** supprimer la page, avec ce qu'elle contient encore.
6. **Puis** l'intégration des productions (D6).

⮕ **#416 est instruit par cet audit** : l'export vit dans la carte, il
**remplace** les exports existants au lieu de s'empiler, et le périmètre
« présentable » se règle par le niveau. Les trois questions 📐 de cet item
peuvent être closes.

⚠ **Rappel de priorité, hors chantier Alignement** : **#414** (les 14 écouteurs
`db-ready`) reste le seul reliquat qui porte un **risque de données**, et il
n'est toujours pas entamé après deux jours. Les portes terrain accumulées
(iPad, largeur des nœuds, carte dépliée) sont dues elles aussi.

---

## 5. Ce qui a été vérifié au code, et où

Pour qu'une instance reprenant ce document n'ait rien à re-fouiller.

| Fait | Emplacement |
|---|---|
| Double stockage rétroaction/production | `planification-carte.js:4937`, `organisateur.js:633` et `:726` |
| Écriture dans le champ mort à l'import MD | `organisateur.js:1558`, `:1588` |
| Migration des objectifs, déclenchement | `planification-carte.js:3988` |
| « SÉANCE » dans les exports | `planification-carte.js:5188` (Texte), `:5252` et `:5295` (TSV) |
| Double comptage de durée possible | `planification-carte.js` — boucle de `genererPlanTexte` |
| Axe d'audience existant | `organisateur.js:1084`, `:1109`, `:1194`, `:1211`, `:1325` |
| Parseur MD : types reconnus | `organisateur.js:1373` (`parserPlanMD`) |
| Import MD : ce qui est créé | `organisateur.js:1477` (`importerPlanDepuisMD`) |
| `chargerProductions` et son filtre `estActive` | `planification-carte.js:4890` |
| Contrôle de vivacité de `coursId` (et son absence pour `productionId`) | `planification-donnees.js:486-492` |
| Libellés d'onglets | `js/config.js:39-47` |
| Protection de `configurationsOnglets` | `noms_stables.json:10` |
| Nouveaux types traversant les exports sans code | `carte.obtenirLabelNoeud(enf)` dans les quatre générateurs |
