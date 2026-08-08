# Plan — le graphe accueille l'enseignement, puis la durée descend dans les nœuds

> **Écrit le 8 août 2026, AVANT de coder, à la demande de Grégoire.**
> Motif explicite : *« Je crains la compression de la conversation en cours de
> codage. »* Ce document est le **filet**. Il porte le contexte, les décisions
> prises et — surtout — **ce qui a été écarté et pourquoi**. Une instance qui
> reprend ce chantier avec un contexte tronqué doit pouvoir s'y fier sans
> rouvrir une seule discussion déjà close.
>
> Point de départ : **1.55.0**, commit `637f03b1`, branche
> `claude/rituel-de-debut-rbirt5`, arbre propre, Vitest 1792/1792.

---

## 0. Comment lire ce document

Trois sections sont **non négociables** pour qui reprend :

- Le **§2 — décisions actées** : elles ont été discutées, elles sont tranchées,
  on ne les rouvre pas.
- Le **§3 — ce qui a été ÉCARTÉ** : chaque entrée dit *pourquoi*. Ce sont
  autant de pistes qui paraissent bonnes à première vue et qui ont déjà été
  instruites. Les rouvrir serait refaire le travail d'hier.
- Le **§4 — faits vérifiés au code** : relevés à la lecture des sources le
  8 août, avec numéros de ligne ou noms de fonction. Ne pas les re-déduire.

---

## 1. D'où vient ce chantier

Grégoire a présenté onze idées d'amélioration du module Alignement. L'audit a
montré qu'elles ne formaient pas onze tâches mais **deux** : un chantier
« faire descendre l'Inspecteur dans les nœuds », et une tâche documentaire
indépendante.

Puis une question de fond a émergé, qui a déplacé la file : *« L'enseignement
d'une connaissance a une durée. Où la mettre ? Il n'y a pas de nœud
"enseignement". »*

Cette question a mené à un **bug** dans la livraison de la veille (#415), qui
passe désormais devant le reste.

---

## 2. Décisions actées par Grégoire (ne pas rouvrir)

| # | Décision | Motif |
|---|---|---|
| D1 | **L'Inspecteur est CONSERVÉ**, pas supprimé | Revirement assumé de Grégoire. Il ne doit contenir que du **complémentaire** : « ajouter des informations, non pas répéter des informations en lecture seule ». |
| D2 | **Abandonner la durée sur les 4 types de connaissances** | Double comptage dans le rollup (voir §3.1). |
| D3 | **Taxonomie hybride assumée et documentée** | Les 4 d'Anderson & Krathwohl + « Conditionnelle » (Tardif). ⚠ L'étiquette de la famille doit changer dans le code ET dans `METHODE-ALIGNEMENT.md` : l'hybride se défend, l'attribution fausse non. |
| D4 | **Formative / Certificative** | Contre ma recommandation (« sommative », déjà employé ailleurs). Choix de Grégoire. **Hypothèse posée et non contredite** : le mot *cohabite* avec SOM, il ne le remplace pas — la carte dit l'intention pédagogique, le moteur de notation dit le calcul. Deux modules, deux vocabulaires. |
| D5 | **Scinder le niveau cognitif** | Le *choix* descend dans l'en-tête du nœud ; la *description du niveau et la banque de verbes* restent dans l'Inspecteur. ⚠ Travail caché en §5.2. |
| D6 | **Input de durée toujours visible** dans l'en-tête | Cohérent avec la décision F1 (rendre la fonction visible plutôt que devinable), contre l'option « `—` qui devient un input au clic ». |
| D7 | **Ajouter un nœud « Exposé »** | Voir §3.5 : décision prise, puis remise en cause par un texte externe, puis **reconfirmée par Grégoire** — c'est la version finale. |
| D8 | **Nommer le nœud « Exposé »** et **renommer la famille « Mise en action » → « Déroulement »** | « Exposé » = terme consacré au cégep. « Enseignement » entrerait en collision visuelle avec la famille « Enseignement explicite » juste en dessous. « Mise en action » est tourné vers l'élève : avec un Exposé dedans, le nom ment sur un de ses membres. |
| D9 | **Exposé se place EN TÊTE de sa famille**, avant Activité | C'est souvent ce qui ouvre le déroulement. |
| D10 | **Le lot « graphe » passe DEVANT le lot « durée »** | Il remet en état ce qui a été livré hier, et évite de repasser deux fois dans les mêmes fichiers. |

---

## 3. Ce qui a été ÉCARTÉ — et pourquoi

> ⚠ **Section la plus importante contre la compression.** Chacune de ces pistes
> a l'air raisonnable si on la redécouvre à froid. Elles ont toutes été
> instruites et refusées pour une raison précise.

### 3.1 Durée sur les nœuds de connaissance — REFUSÉ

Deux motifs, le second découvert après le premier et plus décisif :

1. **Double comptage.** `dureeRollupNoeud` additionne *tous* les descendants
   d'une leçon. Une connaissance porteuse de durée serait comptée **en plus**
   de l'activité qui l'enseigne. Le compteur afficherait un total faux, sans
   rien pour le signaler.
2. **Le clonage.** `propagerModification(id, 'metadata', …)` recopie la
   metadata **entière** vers toutes les instances clonées d'une feuille. Or une
   connaissance est précisément ce qu'on réutilise d'une leçon à l'autre :
   « la métaphore » clonée dans trois leçons partagerait **une seule durée**.
   Impossible de dire « 20 min en semaine 2, 5 min de rappel en semaine 7 ».
   Le code connaît déjà ce piège — le commentaire de
   `dupliquerConteneurEnProfondeur` note que « la metadata propagée
   embarquerait la semaine ».

**Règle générale qui en sort, et qui arbitre tout ce chantier :**

> **Une minute de classe appartient à exactement un nœud.**

### 3.2 Ajouter `evaluation` à `TYPES_ACTIVITE` — REFUSÉ

C'était mon idée initiale pour donner une durée à l'évaluation. Elle est
mauvaise : `TYPES_ACTIVITE` alimente `normaliserType()`, qui alimente la
résolution des verbes de liens. Y mettre `evaluation` ferait retomber
`normaliserType('evaluation')` sur `'activite'` et changerait la disponibilité
des verbes horizontaux pour les paires non couvertes (relier deux évaluations
offrirait soudain « complète / conduit à », qui ne donne rien aujourd'hui).

**À la place** : une liste séparée `TYPES_AVEC_DUREE`. Deux prédicats
différents — *« est une tâche d'apprentissage »* et *« consomme du temps de
classe »*. Une évaluation occupe une période sans être une activité.

Le code a déjà tranché un cas identique et le dit : les cinq types
d'enseignement explicite ne sont **pas** dans `TYPES_AVEC_NIVEAU_COGNITIF`,
« et c'est délibéré […] Ce n'est donc pas un "triplet en dur" à rabattre sur
`TYPES_ACTIVITE` ».

### 3.3 Supprimer l'Inspecteur — REFUSÉ (D1)

Six champs n'existent **que** là : Description, Objectifs servis (#403),
Production, « Dans la leçon », Préalable, et la banque de verbes. Deux d'entre
eux (**Objectifs servis** et **« Dans la leçon »**) ont été construits *pour
l'iPad*, où il n'y a ni ⌘ ni glisser de nœud. Les supprimer aurait produit une
régression **invisible depuis un MacBook**.

### 3.4 Durée sur le lien `connaissance → activité` — ÉCARTÉ

Élégant sur le papier (le temps vit dans la relation d'acquisition), mais un
lien n'est pas un moment de classe, il n'entre dans aucun rollup, et rien ne
l'affiche.

### 3.5 « Les nœuds d'enseignement explicite suffisent » — ÉCARTÉ PAR GRÉGOIRE

Un texte externe (Gemini) affirmait que l'enseignement du déclaratif se fait
« souvent […] lors de la phase d'ouverture ou d'amorce », et que la
modélisation porte surtout sur le procédural. J'en avais conclu que les minutes
d'enseignement avaient déjà leurs propriétaires (Ouverture, Modélisation) et
que le nœud « Exposé » était inutile.

**Sur-lecture de ma part** : le texte disait « souvent », j'en ai tiré
« toujours ». Grégoire a corrigé : *« Il n'est pas vrai de dire que
l'enseignement de connaissances déclaratives ne se fait qu'en ouverture de
leçon. »* Enseigner un savoir déclaratif se fait **à tout moment** d'une leçon.

⮕ **Exposé est rétabli (D7)**, et il n'est pas un substitut aux nœuds
d'enseignement explicite mais leur **complément** : qui pratique l'EE utilise
Ouverture et Modélisation ; qui expose hors méthode pose un Exposé. Les deux
familles cohabitent sans se recouvrir.

### 3.6 Écrire à la main les paires de verbes manquantes — ÉCARTÉ

Il en manque ~50 (voir §4.1). Les écrire serait de l'empilement, et il faudrait
recommencer au prochain type. Le repli sur la famille (§5.1) les couvre toutes
en trois lignes.

### 3.7 « Renommer séance » — INTERDIT

Rappel du §3 de `SESSION.md` : prémisse fausse, rejetée à raison par Grégoire,
vérification au code à l'appui. Les §1 et §7 de
`Rapports/AUDIT-vocabulaire-seance-2026-08-07.md` sont **périmés**.

---

## 4. Faits vérifiés au code le 8 août (ne pas re-déduire)

### 4.1 ⚠ BUG — les cinq nœuds d'enseignement explicite sont absents du graphe

`grep` sur `VERBES_AUTO` : **zéro paire** impliquant `ouverture`,
`modelisation`, `pratique-guidee`, `pratique-autonome`, `cloture`.

`VERBES_HORIZONTAUX` ne contient que trois entrées :
`connaissance>connaissance`, `activite>activite`, `idee-maitresse>idee-maitresse`.
**Pas de `connaissance>activite`.**

Donc, dans `resoudreVerbe(sourceId, cibleId)` :

1. `VERBES_AUTO['conceptuelle>modelisation']` → absent
2. repli horizontal : `normaliserType` donne `connaissance>activite` → absent
3. → `null` → `afficherToastLien("Ce lien n'est pas possible entre Conceptuelle et Modélisation.")`

**Conséquence réelle** : on ne peut relier aucune connaissance à aucun des cinq
nœuds livrés le 7 août (1.54.0), ni aucun d'eux à une évaluation. Ils ne se
relient qu'entre eux et aux trois nœuds de mise en action, par le repli
`activite>activite`. **Ils sont décoratifs au sens strict.**

C'est un bug de #415 : les cinq types sont entrés dans `TYPES`,
`TYPES_ACTIVITE`, `TYPES_SERVANTS_OBJECTIF` et la palette — **jamais dans le
graphe**.

### 4.2 Les paires que possède `activite` (le gabarit à répliquer)

- 4 connaissances → `activite` : `s_acquiert_par`
- `activite` → 4 connaissances : `s_acquiert_par` + `inverser: true`
- `activite` → `evaluation` : `se_verifie_par`
- `evaluation` → `activite` : `se_verifie_par` + `inverser: true`

`resoudreVerbe` cherche `VERBES_AUTO` avec les types **BRUTS d'abord**, puis
retombe sur `normaliserType` pour la table horizontale seulement.

### 4.3 Ce que porte l'Inspecteur aujourd'hui (`ouvrirPanneau`)

| Élément | Sort ? | Destination |
|---|---|---|
| Pastille + libellé du type | oui | rien (répétition de l'en-tête du nœud) |
| Titre (input) | oui | rien (`.planif-noeud-titre` est `contenteditable`) |
| **Description** (textarea) | **non** | reste — seul texte long du modèle |
| Durée estimée (`TYPES_ACTIVITE`) | oui | en-tête du nœud |
| Durée « somme des activités » (leçon) | oui | rien — lecture seule répétée, remplacée par le compteur |
| Semaine (input number) | oui | rien — le `S11` du nœud existe depuis #410 |
| Semaines dérivées (séquence) | oui | rien — lecture seule répétée |
| **« Dans la leçon »** | **non** | reste — ⚠ seul chemin **tactile** pour reparenter (friction F7 bis) |
| **Objectifs servis** (#403) | **non** | reste — ⚠ geste iPad ; l'objectif n'est pas un nœud, rien à viser |
| **Préalable** (4 connaissances) | **non** | reste — seul endroit où le poser |
| Rétroaction (évaluation) | oui | en-tête du nœud |
| **Production** (évaluation) | **non** | reste — attache au codex, liste groupée avec pondérations |
| Niveau cognitif (le **choix**) | oui | en-tête du nœud (D5) |
| **Description du niveau + banque de verbes** | **non** | reste (D5) |
| **Instances de clone** (🧬) | **non** | reste — filiation invisible sur le canevas |
| Cloner · Supprimer | non | restent — ⌘D et Suppr n'existent pas sur iPad |

### 4.4 L'en-tête d'un nœud aujourd'hui

- **Feuille** : le seul libellé du type. Rien d'autre. Il y a de la place.
- **Conteneur** (leçon/séquence) : libellé + `selecteurSemaineHTML(n)` + badge 🎯
  (leçon seulement).

⮕ **Le patron « contrôle actif dans l'en-tête » est déjà éprouvé** :
`selecteurSemaineHTML` pose un `<select>` dans `.planif-noeud-entete`, et
`.planif-badge-objectif` intercepte le `mousedown` pour ne pas déclencher le
glisser du nœud. Les lots ci-dessous ne défrichent rien.

### 4.5 Le chemin d'écriture de la durée

`recalcDuree()` : écrit `meta.duree`, purge `meta.periodes` et
`meta.minutesParPeriode` (doublons hérités), puis appelle
**`propagerModification(id, 'metadata', …)`** et `mettreAJourPlanificateur()`.

⚠ La propagation aux clones **doit être préservée** au déplacement.

### 4.6 `dureeRollupNoeud` existe déjà et récurse

Il alimente déjà le planificateur. Le point 9 de Grégoire (compteur dans
l'en-tête) est donc du **pur affichage** — aucun calcul neuf, aucune nouvelle
source de vérité.

---

## 5. Lot A — le graphe accueille l'enseignement

**Intention** : rendre reliables les nœuds d'enseignement, et ajouter l'Exposé.
Corrige #415, prépare le lot B.

### 5.1 Le repli sur la famille (le cœur)

Dans `resoudreVerbe`, entre l'étape 1 (verbe vertical brut) et l'étape 2
(verbes horizontaux), insérer un **repli sur la famille** :

```
VERBES_AUTO[src.type + '>' + normaliserType(cbl.type)]
VERBES_AUTO[normaliserType(src.type) + '>' + cbl.type]
```

Effet : `conceptuelle>modelisation` retombe sur `conceptuelle>activite`
(`s_acquiert_par`) ; `modelisation>evaluation` retombe sur `activite>evaluation`
(`se_verifie_par`). Les ~50 paires manquantes sont couvertes, et le prochain
nœud de la famille sera relié sans qu'on y pense.

⚠ **Vérifier au break-test qu'aucune paire existante ne change de verbe** — le
repli ne doit s'appliquer qu'en l'absence de correspondance brute.

### 5.2 Le nœud « Exposé »

- `TYPES` : `'expose': { label: 'Exposé', couleur: 'var(--planif-couleur-expose)' }`
- `TYPES_ACTIVITE` : ajouter `'expose'` — il hérite ainsi de la durée, du
  rollup, de `TYPES_SERVANTS_OBJECTIF`, et des verbes par le repli §5.1
- `TYPES_AVEC_NIVEAU_COGNITIF` : **à trancher**. Un exposé est-il une tâche
  d'apprentissage qui porte un niveau cognitif ? Par défaut je **l'ajoute**
  (comme Activité/Soutien/Révision) ; si ça se discute, le retirer est trivial.
- `styles.css` : variable de couleur, deux modes
- `index.html` : bouton de palette, **en tête de la famille** (D9)
- Renommage de la famille « Mise en action » → « **Déroulement** » (D8) :
  palette, `docs/refonte-textes/infobulles-T9-planification-alignement.md`,
  `infobulles-T10-…`, et le guide intégré `GUIDE_PAGES` si le terme y figure

### 5.3 Sentinelle du lot A — cas obligatoires

1. Un lien `conceptuelle → modelisation` se crée avec `s_acquiert_par`
   *(comportement, pas lecture de source)*
2. Un lien `modelisation → evaluation` se crée avec `se_verifie_par`
3. Les paires brutes existantes gardent **exactement** leur verbe (non-régression)
4. `expose` est dans `TYPES_ACTIVITE` → durée + rollup + objectifs servis
5. La palette ne contient plus « Mise en action »
6. Un lien impossible reste impossible (le repli n'ouvre pas tout)

**Break-tests exigés** : retirer le repli → 1 et 2 rougissent. Faire du repli un
remplacement plutôt qu'un secours → 3 rougit. Retirer `expose` de
`TYPES_ACTIVITE` → 4 rougit.

---

## 6. Lot B — la durée descend dans les en-têtes

**Intention** : ton point 9 (compteur), tes points 6 et 8 (durée), et le
premier tiers du ménage de l'Inspecteur.

| Étape | Détail |
|---|---|
| B1 | `TYPES_AVEC_DUREE = TYPES_ACTIVITE.concat(['evaluation'])` — **10 types** après le lot A. Commenter le non-rabattement (§3.2). |
| B2 | `dureeControleHTML(n)` — calqué sur `selecteurSemaineHTML(n)`. ⚠ **Coercition `parseInt` obligatoire** (§7.2). |
| B3 | `compteurDureeHTML(n)` — leçon et séquence, via `dureeRollupNoeud` + `formaterPeriodes`. Affichage pur. |
| B4 | `reconstruireDOM` — B2 dans l'en-tête des feuilles concernées, B3 dans celui des conteneurs |
| B5 | `attacherEvenements` — `mousedown` → `stopPropagation` (sinon le nœud part en glisser) ; `focus` → `enregistrerPourUndo` ; `input` → écriture + **`propagerModification`** (§4.5) + remontée du compteur |
| B6 | `ouvrirPanneau` — retirer « Durée estimée » et « Durée (somme des activités) » |
| B7 | `styles.css` — deux modes, cible ≥ 44 px sous `@media (hover: none)` |

**Le travail caché du lot B** : le compteur doit se rafraîchir **en direct** en
remontant la chaîne activité → leçon → séquence. C'est la seule logique neuve,
et c'est là que doit porter le break-test principal : *casser la remontée doit
faire rougir*.

---

## 7. Pièges déjà payés — ne pas y retomber

### 7.1 Les deux formes de faux-vert (7 et 8 août)

1. **Une assertion peut être satisfaite par autre chose que ce qu'elle croit
   vérifier.** Le 8 août, deux assertions centrales lisaient la source
   (« la fonction appelle-t-elle `naviguerVers` ? ») et **sont restées vertes
   quand l'appel a été mis en commentaire** — le texte cherché vivait dans le
   commentaire. ⮕ **Pour tout invariant de comportement, monter le module dans
   le bac à sable et observer l'effet**, pas lire le fichier.
2. **Une sentinelle peut couvrir le GESTE sans couvrir ce que le geste
   EMPORTE.** Assertion sur `etat.selection` seule ne couvrait pas
   `deselectionnerTout()` : une multi-sélection survivait au clic.

### 7.2 ⚠ Un invariant de SÉCURITÉ voyage avec le champ de durée

`tests/unit/sentinelle-inspecteur-duree-coercition.test.js` verrouille que
`meta.duree` passe par `parseInt` **avant** injection dans un attribut
`value=`. Motif : la durée peut venir d'un **import** (bibliothèque
d'alignements, import inter-trimestre), et la CSP ne protège pas l'injection
d'attributs.

⮕ Déplacer le champ déplace le risque. La sentinelle vise l'Inspecteur : elle
**deviendrait verte pour rien**. Elle doit être **réorientée, pas supprimée**,
et break-testée.

### 7.3 L'ordre d'attache des listeners dans `ouvrirPanneau`

Tout `extra.innerHTML +=` ultérieur re-sérialise le conteneur et **tue les
listeners posés avant lui**. C'est pourquoi « Dans la leçon » et « Objectifs
servis » sont attachés en **fin** de `ouvrirPanneau`. Ne pas défaire cet ordre.

### 7.4 Le cache-busting

Tout fichier modifié doit voir son `?v=` bumpé dans `index.html`, sinon le
navigateur sert l'ancienne version (classe #364, friction F5). ⚠ `release.mjs`
ne le fait **pas** encore — c'est l'objet de #417.

---

## 8. Ce qui reste ouvert après ces deux lots

| Item | Contenu |
|---|---|
| **Lot C** | Rétroaction + niveau cognitif (D5) + formative/certificative (D4) dans les en-têtes |
| **Lot D** | Ménage final de l'Inspecteur : pastille, titre, semaine, semaines dérivées ; ⚠ **rebrancher la banque de verbes sur `.planif-noeud-titre`** — elle vise `#planif-panneau-titre` et deviendrait muette sans bruit |
| **Lot E** | Connaissance « Conditionnelle » (D3) + déplacement de « Préalable » |
| **Lot F** | Largeur des nœuds — **mesurée** après C et D, pas devinée. Attention au plancher de 520 px de la palette. |
| **#419** | Conformité documentaire sur **trois** surfaces : le guide intégré `GUIDE_PAGES` (le vrai manuel), les infobulles (20 entrées `planif-` + 2 fichiers `refonte-textes`), et `METHODE-ALIGNEMENT.md` §4 — relevé « au code le 6 août, version 1.31.22 », soit **24 versions en arrière**, et déjà faux (son tableau ignore les 5 nœuds EE et décrit la vue Leçon supprimée le 7 août). |
| **Question ouverte** | L'enseignant qui ne pratique pas l'enseignement explicite. Partiellement réglé par l'Exposé. À laisser en question, pas en chantier. |
| **F10** | À consigner au journal des frictions de `METHODE-ALIGNEMENT.md` : « planifier une leçon, c'est aussi budgéter le temps de parole du prof » — le modèle était bâti autour de ce que l'**élève** fait. |

---

## 9. Rappel de méthode pour qui reprend

- **Rituel de fin obligatoire** avant de clore : `/fin-de-session`, dont le §4
  break-test. Faire **ROUGIR** chaque sentinelle avant de lui faire confiance.
- Un lot n'est fini que quand ce qu'il remplace est **retiré** (zéro-dette).
- Avant tout commit touchant un module sensible : `cd tests && npm test`.
- Version : `node scripts/release.mjs minor` (nouveauté sans rupture de format
  de données). `major` exige l'accord explicite de Grégoire.
