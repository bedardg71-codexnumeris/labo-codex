# Audit du module « profil de l'élève » — 15 septembre 2026

> **Pourquoi cet audit.** Deux rapports testeurs le même matin (#866 à 10 h 06, #867 à
> 12 h 16), sur le même écran. Le profil est la zone la plus remuée des six dernières
> semaines : **58 commits**, dont 32 sur `sections-affichage.js` et 27 sur `calculs.js`.
> Demandé par Grégoire le 15 sept. après la livraison de 1.141.1.
>
> **Périmètre** : 7 fichiers, 9 828 lignes, 106 fonctions exportées sur `window`.
> 79 fichiers de test nomment le module.
>
> **Méthode** : chercher les FAMILLES des deux bugs vécus, pas relire 9 828 lignes au
> hasard. Trois axes : l'état partagé (#867), les promesses de l'interface (#866), la
> source des nombres (#732).
>
> ⚠ **Règle de sortie** (CLAUDE.md) : cet audit n'est terminé que lorsque **chaque
> constat porte ici même sa disposition** — *inscrit* (n°), *refusé* (motif), ou
> *périmé*. Mesuré le 1er sept. : sur 51 rapports d'audit, 22 sans suite.
>
> **Rien n'est corrigé pendant l'audit.** Les correctifs sont des décisions séparées.

---

## Axe 1 — L'état partagé du module

La famille de #867 : une variable de module écrite par une fonction, lue par une autre
qui ne vérifie rien.

**Le recensement.** Le module ne porte que **six** états de module, dont trois qui
voyagent hors de lui :

| État | Fichier | Écrivains | Lecteurs hors module |
|---|---|---|---|
| `profilActuelDA` (+ jumeau `window`) | `sections-affichage.js:1873` | **1**, gardé depuis #867 | 5 fichiers, tous avec `if (window.profilActuelDA)` |
| `sectionProfilActive` | `sections-affichage.js:1880` | 1 (`changerSectionProfil`) | aucun |
| `window.etudiantsListeCache` | `sections-affichage.js:2257` | 1 | `modes.js` (garde `|| []`) |
| `_confidentielDaActuel` | `confidentiel.js:30` | 2 (ouvrir / fermer) | aucun — privé |
| `_notesEnAttente`, `_timerNotes` | `rapport.js:421-422` | 3 | aucun — privés |

### A-1 · L'état pivot est sain depuis ce matin — rien à faire
Un seul site d'écriture, gardé par `if (eleve)` (#867), et **tous** les lecteurs hors
module vérifient avant de lire. Le motif de #867 n'a pas d'autre occurrence : le seul
site au schéma « une fonction efface, une autre lit » était celui corrigé.
⮕ **Disposition : périmé** (le constat est réglé par 1.141.1).

### A-2 · L'en-tête du fichier annonce un compte faux
`sections-affichage.js:9` et `:24` disent « lu 24× hors module ». Le compte réel est de
**20 lignes**, réparties sur 5 fichiers. Les numéros de ligne cités (« L52 », « L53 »)
sont eux aussi périmés : l'état vit aux lignes 1873-1874.
⮕ **Disposition : commenté et oublié** (niveau 3) — aucune conséquence observable ; un
chiffre dans un commentaire n'est lu par personne à l'exécution.

### A-3 · Le volet confidentiel touche 19 éléments sans garde ni `try`
`confidentiel.js` accède à 19 identifiants littéraux en chaîne
(`document.getElementById('…').checked`, `.value`), **sans `?.`, sans garde, sans
`try`** — le fichier ne contient aucun `try`. Si un seul identifiant disparaissait
d'`index.html`, `sauvegarderConfidentiel` lèverait **avant** son `db.setSync` : rien
d'enregistré, et aucun message à l'écran.
**Mesuré** : les 19 existent tous aujourd'hui (964 identifiants dans `index.html`,
467 posés par des gabarits JS ; témoin de la mesure : un identifiant inventé ressort
bien comme absent).
⮕ **Disposition : commenté et oublié** (niveau 3) — un risque, pas un symptôme. À
requalifier si un jour un identifiant `confidentiel-*` est renommé.

### A-4 · « Évaluer » depuis le profil ne présélectionne rien — MESURÉ
`evaluerProduction(da, productionId)` (`actions.js:123`) annonce en commentaire
« Naviguer vers Évaluations **avec présélection** de l'élève et de la production », puis
cherche `select-eleve-evaluation` et `select-production-evaluation`. **Ces deux
identifiants n'existent nulle part** — ni dans `index.html`, ni dans un gabarit JS. Les
vrais s'appellent `selectEtudiantEval` et `selectProduction1`.

Les gardes `if (selectEleve)` évitent le plantage : **l'échec est entièrement
silencieux.**

**Mesure au navigateur (WebKit, 15 sept.)** — clic sur « Évaluer » depuis un profil :
```
sectionActive       : "section-evaluations"   ← la navigation marche
selectEtudiantEval  : ""                      ← vide
selectProduction1   : ""                      ← vide
select-eleve-evaluation / select-production-evaluation : absents du DOM
```

**Ce que Grégoire vit** : il clique « Évaluer » sur un artefact précis d'un élève
précis, arrive sur le formulaire d'évaluation, et doit **resélectionner l'élève et la
production à la main**. Cinq boutons du profil mènent ici (`sections-affichage.js:628,
659, 734, 3093, 3106`), plus un chemin depuis `liste-evaluations.js:1343`.
⮕ **Disposition : INSCRIT — #868.** Symptôme silencieux sur un geste courant.

⚠ **RECTIFIÉ le 15 sept., 15 h (session suivante, levée de la réserve de la fiche)** : le
symptôme est confirmé, **la cause écrite ci-dessus ne l'est pas**. La fonction aux deux
identifiants inexistants est morte : `evaluation.js` (chargé après) écrase
`window.evaluerProduction` avec une version aux BONS identifiants. Celle-ci échoue quand
même, parce que `selectEtudiantEval` n'a aucune option tant qu'aucun fichier n'est ouvert
dans la visionneuse. Détail et réparation désignée : fiche #868 du BACKLOG.
**Leçon de méthode** : `grep` d'un identifiant dans le fichier qui l'appelle ne dit pas
QUELLE définition répond ; `String(window.X)` au navigateur, si.

### A-5 · Quatre fonctions exportées que rien n'appelle
Appelants réels, commentaires et lignes d'export exclus (témoin de la mesure :
`calculerTousLesIndices` ressort dans 9 fichiers) :

| Fonction | Fichier | Appelants |
|---|---|---|
| `obtenirCouleurNiveauIDME` | `helpers.js` | aucun |
| `genererBadgePratiqueProfil` | `helpers.js` | aucun |
| `genererBadgePatternProfil` | `helpers.js` | aucun |
| `viderRapport` | `rapport.js` | aucun — et le bouton `btn-copier-rapport-<da>` qu'elle cherche n'existe pas non plus |

⮕ **Disposition : INSCRIT — #869** (retrait groupé, zéro-dette). Pas de correction
isolée : le retrait de code mort fait rougir les preuves textuelles des sentinelles
(leçon de #520), il demande sa propre passe.

---

## Axe 2 — Les promesses de l'interface

La famille de #866 : un élément qui annonce quelque chose que le code ne fait pas.

### B-1 · Les champs de saisie tiennent tous leur promesse — rien à faire
Recensement des champs produits par le module ou servis par lui : le textarea des notes
confidentielles, les 15 champs du modal `modalConfidentiel`, les 6 cases « Sections à
inclure » du rapport, les deux zones de texte du rapport, le sélecteur d'élève, et
5 cases de filtrage des graphiques.

Confrontation champ par champ du modal confidentiel — *rempli à l'ouverture ?* puis
*lu à l'enregistrement ?* :

> 15 champs, **15 cohérents**. Le seul « ni rempli ni enregistré » par le chemin
> ordinaire, `confidentiel-services-adaptes`, l'est par une autre voie (`etudiant.sa`,
> `confidentiel.js:105-109`) et porte `disabled = true` : c'est la décision D.1 de #752,
> et la case se montre non modifiable. Promesse tenue.

Les deux zones du rapport ont été remises d'aplomb ce matin par #866 (l'une annonce
qu'elle ne retient rien, l'autre retient).
⮕ **Disposition : périmé.**

### B-2 · Les 48 gestes du module mènent tous à une fonction qui existe
Chaque `data-action`, `data-on-change` et `data-on-input` produit par les 7 fichiers a
été résolu contre les 1 820 fonctions posées sur `window` par l'application.
**48 examinés, 0 orphelin** (témoin de la mesure : un nom inventé ressort bien comme
introuvable). La classe de #824 — un `case` appelant une fonction définie nulle part —
n'a pas d'autre occurrence ici.
⮕ **Disposition : périmé.**

### B-3 · Six classes CSS que le module pose et qui ne sont définies nulle part
Mesure sur `styles.css` + `css/accompagnement.css` + les `<style>` d'`index.html`
(témoins : `.profil-carte` → 3 définitions, `.controle-form` → 17) :

| Classe | Posée par | Ce qu'elle devait faire |
|---|---|---|
| `.u-flex-between-mb20` | `sections-affichage.js:1992` | le `<h2>` du titre de CHAQUE section du profil — alignement titre / icône d'aide |
| `.u-flex-between-mb15` | `sections-affichage.js:548`, `diagnostics.js:165` | même famille |
| `.profil-texte-petit-gris` | `sections-affichage.js:800` | texte secondaire |
| `.u-text-center-gris` | `sections-affichage.js:2750` | texte centré gris |
| `.travaux-badge-annote` | `sections-affichage.js:4343` | badge « annoté » d'un travail |
| `.note-presence-editable` | `confidentiel.js:184` | zone de note de présence éditable |

C'est la classe de #612 et #865 : une mise en forme demandée qui ne s'applique pas. Les
noms suivent la convention des utilitaires (`u-*`), donc l'intention est lisible ; seule
la règle manque.
⮕ **Disposition : INSCRIT — #870.** ⚠ La conséquence VISIBLE reste à mesurer : certaines
sont peut-être compensées par le style du parent. La mesure avant/après dans Chrome se
fait au moment du correctif, comme pour #787 — pas ici.

### B-4 · Cinq cases de filtrage des graphiques ne gardent pas leur état
`checked` est écrit en dur dans le gabarit (`sections-affichage.js:3232, 3243, 3248,
3253, 3633`). Comme le profil est reconstruit en entier à chaque changement de
sous-section, décocher « Assiduité (A) » pour lire les deux autres courbes, aller voir
« Travaux soumis » et revenir remet tout coché.
⮕ **Disposition : commenté et oublié** (niveau 3). Aucun symptôme signalé ; ce sont des
filtres de lecture momentanés, pas un contenu. À requalifier si Grégoire le vit.

---

## Axe 3 — Une seule source par nombre

La famille de #732 : deux nombres affichés ensemble qui ne sortent pas du même calcul.
C'est la classe la plus coûteuse — un rapport quitte l'application et part vers un tiers.

**Le recensement.** Les pourcentages sont sains : `calculerTousLesIndices` est appelée
**13 fois** dans le module et reste la seule source de A, C et P. Aucun recalcul
concurrent d'indice. Le problème n'est pas là : il est dans les **fractions affichées à
côté** des pourcentages, qui, elles, ne viennent pas du même endroit.

### C-1 · Assiduité : le pourcentage et la fraction ne concordent pas — MESURÉ
`obtenirDetailsAssiduite` (`sections-affichage.js:1661-1662`) arrondit les deux périodes :
```js
const periodesPresentes = Math.round(detailsSommatif.periodesPresentes || 0);
const periodesOffertes   = Math.round(detailsSommatif.periodesOffertes  || 0);
```
Or `indice` a été calculé par `indices.js` sur les valeurs **non arrondies**
(`A = Σ periodesPresentes / Σ periodesOffertes`, `indices.js:139`). Les deux sortent du
même objet, mais l'un est arrondi et l'autre non.

**Le cas est réel** : la saisie des présences accepte les demi-périodes
(`saisie-presences.js:1357`, `step="0.5"`, et « parseFloat pour supporter les fractions
(1.5, etc.) ») — un retard produit une présence partielle.

**Mesure (banc, 15 sept.)** — 22,5 périodes présentes sur 25 :
```
Affiché : « Assiduité : 90% (23 / 25 périodes) »
Or 23 / 25 = 92 %.                        écart : 2 points
```
Quatre sites affichent ce couple : le rapport (`rapport.js:99` — **celui qui sort de
l'application**), et trois panneaux d'explication de l'indice A
(`sections-affichage.js:536, 555, 4068`).

### C-2 · Complétion : deux comptages différents — MESURÉ SUR LE PACK DÉMO
Le pourcentage `indices.C` vient de `pratique.calculerCompletion(da)`
(`portfolio.js:673`) — propre à la famille de pratique. La fraction affichée à côté,
elle, est **recomptée sur place** par le rapport (`rapport.js:68-79`) : productions
évaluables, non facultatives, déjà évaluées pour au moins un élève.

#732 (5 sept.) avait aligné ce comptage sur `obtenirIdsProductionsEvaluables` — un vrai
progrès — mais **pas sur `pratique.calculerCompletion`**. Le commentaire du code dit que
« les trois nombres viennent de `calculerTousLesIndices` » : c'est exact pour les
pourcentages, inexact pour la fraction.

**Mesure (pack démo, WebKit, 15 sept.)** — 10 élèves, dénominateur du rapport = 9 :
```
1 élève sur 10 diverge.
DEMO015 : C = 80 %, fraction affichée « 7 / 9 » → 7/9 = 78 %.   écart : 2 points
```

⮕ **Disposition pour C-1 et C-2 : INSCRIT — #871** (un seul item, deux volets : c'est la
même famille et le même geste de réparation — faire dire au rapport des nombres qui
concordent).
⚠ **Ce que #871 ne doit PAS faire sans décision de Grégoire** : choisir *lequel* des deux
nombres a raison est une question **pédagogique**, pas technique. Faut-il arrondir la
fraction pour qu'elle colle au pourcentage, afficher les demi-périodes telles quelles
(« 22,5 / 25 »), ou recalculer le pourcentage depuis la fraction ? Ce que ces nombres
veulent dire à un élève lui revient.

### C-3 · Un retard court peut s'arrondir à zéro période
`sections-affichage.js:1707` : `Math.round(presenceEleve.heures * 60 / dureePeriodeMin)`.
Sur une période de 50 min, une présence de 20 min donne 0,4 → **0**. Ce calcul ne sert
qu'à la liste des absences affichée dans le panneau de détail, pas à l'indice.
⮕ **Disposition : commenté et oublié** (niveau 3) — aucun symptôme signalé, et l'indice
lui-même n'en dépend pas.

---

## Synthèse — ce que cet audit a trouvé

| # | Constat | Où | Disposition |
|---|---|---|---|
| A-1 | L'état pivot est sain (1 écrivain gardé, tous les lecteurs vérifient) | `sections-affichage.js` | périmé (réglé par 1.141.1) |
| A-2 | L'en-tête annonce « lu 24× » ; le compte réel est 20, et les lignes citées sont périmées | `sections-affichage.js:9,24` | commenté, niveau 3 |
| A-3 | 19 éléments touchés sans garde ni `try` ; tous existent aujourd'hui | `confidentiel.js` | commenté, niveau 3 |
| **A-4** | **« Évaluer » depuis le profil ne présélectionne rien — deux identifiants inexistants** | `actions.js:130,140` | **INSCRIT #868** |
| **A-5** | **4 fonctions exportées que rien n'appelle** | `helpers.js`, `rapport.js` | **INSCRIT #869** |
| B-1 | Les 15 champs du volet confidentiel sont cohérents | `confidentiel.js` | périmé |
| B-2 | Les 48 gestes du module mènent tous à une fonction existante | tout le module | périmé |
| **B-3** | **6 classes CSS posées et définies nulle part** | 4 fichiers | **INSCRIT #870** |
| B-4 | 5 cases de filtrage des graphiques ne gardent pas leur état | `sections-affichage.js` | commenté, niveau 3 |
| **C-1** | **Assiduité : le % et la fraction se contredisent (arrondi)** | `sections-affichage.js:1661` | **INSCRIT #871** |
| **C-2** | **Complétion : deux comptages, 1 élève sur 10 diverge au pack démo** | `rapport.js:68-79` | **INSCRIT #871** |
| C-3 | Un retard de 20 min s'arrondit à 0 période dans la liste des absences | `sections-affichage.js:1707` | commenté, niveau 3 |

**Onze constats, quatre inscrits, cinq classés niveau 3, trois périmés** — aucun constat
n'est laissé sans disposition.

### Ce qui n'a PAS été audité
Les 2 246 lignes de `calculs.js` (les algorithmes de dépistage et de patterns) ne sont
entrées dans cet audit que par la question « d'où vient ce nombre ». La justesse
pédagogique des calculs eux-mêmes — ce que SOLO mesure, ce qu'un pattern signifie — ne
relève pas d'une relecture de code.

### Ce que l'audit dit du module
Le module n'est pas en mauvais état. Ses états partagés sont peu nombreux et bien tenus,
ses gestes résolvent tous, ses champs de saisie tiennent leurs promesses. Les défauts
trouvés sont d'une seule espèce : **du code qui annonce ce qu'il ne fait pas** — une
présélection qui n'a jamais eu lieu, six mises en forme qui ne s'appliquent pas, un
commentaire qui affirme une source unique là où il y a deux comptages. Rien de tout cela
ne lève d'erreur ; c'est pourquoi rien ne l'avait signalé.

### Reproduire les mesures
Toutes les mesures de cet audit portent leur témoin (une valeur connue qui doit sortir
non nulle). ⚠ Une première mesure des classes CSS a donné « zéro définition partout », y
compris pour des classes vivantes : sous zsh, `grep -c "\.classe\b"` ne se comporte pas
comme attendu. Sans témoin, l'audit aurait conclu que **toutes** les classes du module
étaient fantômes. Les mesures fiables sont en Python, dans l'historique de la session.
