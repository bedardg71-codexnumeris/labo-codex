# Cadrage — le front Évaluations, et ce qui reste codé en dur

> Établi le **1er septembre 2026** depuis Cowork, à la demande de Grégoire, par
> deux balayages en lecture seule du dépôt (audits, backlog, code d'aujourd'hui à
> `634a9e23`). **Rien n'a été modifié.**
>
> **Le critère, dans ses mots** : « je veux que l'application fonctionne, qu'il
> n'y ait pas d'erreurs, et que rien ne soit codé en dur » — *codé en dur*
> voulant dire : sa pratique d'enseignant de littérature gravée dans le code que
> d'autres disciplines utiliseront.
>
> Échéance : de nouveaux enseignants arrivent, les chroniques Labo sont publiées.
>
> **↻ TROIS CORRECTIONS PAR MESURE — 1er septembre 2026, début d'après-midi, session Claude Code
> (`kuekatsheu`), pendant le Lot A.** Ce document était juste sur l'essentiel ; ces trois points-ci ne
> l'étaient pas, et ils ont été corrigés **en vérifiant le code**, pas en relisant le texte : le compte
> du §4 (17 → 16, #599 retiré), le nombre d'emplacements de #440 au §2, et le compte du résidu `0,7125`.
> **Deux corrections de plus se sont ajoutées en cours de route**, au §4 : le compte de départ (179 → 177,
> un gabarit en bloc de code comptait pour un item) et le nombre de lignes sans `#NNN` (quatre → deux).
> Chacune est marquée ↻ à sa place. Les autres constats ont tenu à la vérification.

---

## 1. LA NOUVELLE QUI CHANGE LE PLAN

**L'audit de l'onglet Évaluations du 25 août est déjà traité.** Ses 21 constats
(#556 à #572) ont été vérifiés un à un dans le code d'aujourd'hui : **19 sont
réglés**, avec preuve lue et non supposée.

⮕ Grégoire croyait « s'en aller vers l'évaluation ». Le front est en réalité
derrière lui. Ce qui reste sur cet onglet ne vient pas de cet audit.

Ce qui n'est pas réglé, précisément :
- **#560, deuxième défaut** — le garde des modes est posé, mais la **portée** des
  suppressions ne l'est pas. Supprimer un fichier ou vider la corbeille emporte
  **toutes** les évaluations du couple (DA, production) : les originales, les
  reprises, et l'évaluation active d'un fichier réimporté. **Règle métier en
  attente de Grégoire, pas travail de code.**
- **#568 / #572** — deux portes terrain jamais franchies : le rendu réel des
  cibles tactiles sur iPad Safari, et la hiérarchie h2/h3 des quatre sous-onglets.
  Rien ne s'établit statiquement ; **seul Grégoire peut les rendre.**

Et trois items sont **nés** du chantier plutôt que d'y être réglés : #587, #595,
#596 — tous de la dette invisible à l'usage.

---

## 2. CE QUI RESTE VRAIMENT CODÉ EN DUR

⚠ **Deux énoncés du backlog mentent, et une session les rouvrirait sur la
mauvaise cible.** À réécrire avant toute reprise.

### #440 — À FERMER : il décrit un état qui n'existe plus

Le SRPNF en dur dans l'affichage des diagnostics a été **réglé par #529** le
26 août. `profil-etudiant-diagnostics.js:85` lit désormais
`criteresDeLaGrillePourAffichage()`, qui dérive les critères de la grille de
référence de l'utilisateur. ↻ **La fiche #440 nommait TROIS emplacements, pas deux listes** — et les
trois ont été vérifiés le 1er septembre : (1) la liste littérale de `:85`, partie ; (2) celle des barres
graduées (~`:433`), partie ; (3) **un REGEX**, pas une liste — celui d'`identifierDefiSpecifique`, qui
n'existe plus qu'en commentaire historique (`profil-etudiant-calculs.js:1655`).

*Résidu réel au même endroit, mais d'une autre nature* : le seuil **0,7125**
↻ écrit en clair **CINQ fois dans DEUX fichiers** —
`profil-etudiant-diagnostics.js:71/79/99/100` (quatre) **et**
`profil-etudiant-sections-affichage.js:4259` (une). ↻ Le second fichier était
abrégé ici en `sections-affichage.js` : ce nom n'existe pas dans `js/`.
Plus l'échelle de couleurs 0,85 / 0,75 / 0,65. **Suivi en #677** depuis le 1er septembre. Ce
n'est pas de la littérature — ce sont des **constantes pédagogiques non
réglables**. Autre item, autre énoncé.

### #581 — À RÉÉCRIRE : plus étroit que le défaut restant

Le chantier **#668** a sorti la *projection* du moteur. Mais le texte qui la
précède, lui, n'est passé par aucun registre :

> « **Ta rédaction contient N erreurs de français pour M mots.** »
> `evaluation-calcul.js:502` et `:680` — sort pour **tout** critère
> algorithmique, quelle que soit la discipline.

Six variantes de la même famille vivent ailleurs :
`evaluation-retroaction.js:478` « Erreurs de français (N) » · `:785` « la qualité
du français écrit est à travailler en priorité » · `:854` et
`synthese-retroaction-data.js:728` « Concentre-toi sur la qualité du français » ·
`:837` « Français : N erreurs » · **`synthese-retroaction-rendu.js:510`
« Français écrit · 2 catégories les plus fréquentes »**.

⮕ **Ce dernier est imprimé dans le PDF remis à l'élève.** Un enseignant de chimie
qui compte des erreurs voit son critère **rebaptisé « français » dans la copie de
son élève**. C'est le défaut qui illustre le mieux le critère de Grégoire.

Hors périmètre mais du même énoncé : `js/pratiques/pratique-sommative.js:642-649`
sert « Services adaptés (SA) » et « Centre d'aide (CAF) » comme ressources de
dépistage à tout le monde.

### #539 — OUVERT, et c'est une décision de conception

`profil-etudiant-confidentiel.js:115, 242, 311` lit et écrit
`confidentiel-portrait-plausibilite`, `portraitPlausibilite` (plus Structure,
Rigueur, Nuance, Français). Ce sont des **clés de données**, pas des libellés : un
enseignant d'une autre discipline voit un portrait à cinq champs figés qui ne
correspondent à aucun de ses critères, et un renommage **casserait les portraits
déjà saisis**. Migrer les clés, ou rendre le volet générique à N champs ? Non
tranché.

### Trois littéraux que personne n'avait inscrits

- `evaluation.js:3050/3074` — `copierCriteresSRPN` / `copierCriteresSRPNF`,
  « copie les **4 premiers** critères », notification « SRPNF copiés ».
  **Aucun appelant dans le dépôt** : code mort qui suppose une grille à cinq
  critères dont le cinquième est le français.
- `evaluation-chargement.js:1116-1121` et `evaluation.js:1130` — replis IDME en
  dur, avec **deux libellés divergents pour `I`** (« Incomplet » / « Insuffisant »).
  Chemin de repli, pas nominal.
- `evaluation-calcul.js:992`, `evaluation-chargement.js:924` et `:1128` — trois
  `critere.facteurNormalisation || 500` subsistent **hors** du registre #667.
  Même valeur que son défaut déclaré, donc sans effet visible aujourd'hui.

### ⚠ Ce qu'il ne faut PAS compter comme codé en dur

`travaux-outils.js:557-568` — les dix codes d'erreurs de français. Noms,
couleurs, ordre, raccourcis et textes de rétroaction sont **tous réglables**
(`enregistrerRetroErreursFr`, `personnalisationErreursFr`, `ordreErreursFr`). Ce
qui ne l'est pas : leur **nombre**, fixé à dix, et les en-têtes qui disent
« français » par-dessus quel que soit le renommage.

### Ce que #667 / #668 a déjà retiré — à ne pas recompter

`js/evaluation-formules.js` (la formule, sept lieux de vérité ramenés à un) et
`js/evaluation-projection.js` (les cinq verdicts, les quatre seuils, le nom du
service d'aide). Le gabarit neuf livré aux nouveaux utilisateurs ne porte **aucun
nom d'établissement**. Restent dus : **#668 lots 5b et 6** (le PDF).

---

## 3. LES DEUX SEULS BUGS VISIBLES À L'USAGE

1. **#560 résiduel** — la portée des suppressions (voir §1). Décision de Grégoire.
2. **#651** — depuis la Liste, « annoter » ouvre la page **sans aucune palette**
   quand on vient du mode Évaluer. Retour terrain de Grégoire, avec capture ;
   cause lue, jamais mesurée, **aucun commit correctif**.

*(#674 — un critère sans niveau fait monter la note en silence — est de la
prévention : la sonde du 1er septembre donne zéro écart sur le corpus réel.)*

---

## 4. LE BACKLOG N'EST PAS À JOUR, ET IL DÉCOURAGE POUR RIEN

179 cases `- [ ]`. Vérifiées une à une contre les commits et les plans :

↻ **Le compte de départ était 177, pas 179** (mesuré le 1er septembre, hors blocs de code : le gabarit
« Pour ajouter un item » en fin de fichier porte un `- [ ]` que tout `grep` naïf compte). Après le Lot A :
**159**.

| | |
|---|---|
| **LIVRÉ, case à retourner** | ↻ **16** — #508, #540, #597, #603, #604, #605, #623, #635, #636, #638, #640, #644, #645, #650, #665, #671 |
| **PARTIEL** (une part livrée, une part nommée) | **21** |
| **RÉELLEMENT OUVERT** | **140 lignes** |

⚠ **#427 est en double** (lignes 5880 et 5931). ↻ **Traité le 1er septembre** : l'entrée d'origine du
8 août, barrée mais à case ouverte, a été cochée **pour le compte seulement** — le refermage reste dû et
il est suivi par l'entrée vivante. Son corps est conservé (dont les trois placeholders `[À COMPLÉTER]`
de `DEPLOY.md`).
⚠ Quatre lignes ouvertes ne portent aucun `#NNN`. ↻ **Il y en avait DEUX**, pas quatre : la troisième
était le gabarit d'inscription, **à l'intérieur d'un bloc de code** — un faux positif de motif, pas un
item. Les deux vraies ont reçu **#675** (anti-cache) et **#676** (CI).
⚠ Les ✅ des items #581-#592 marquent des **arbitrages** du 28 août, **pas des livraisons** — ne pas les
lire comme faits.

↻ **#599 A ÉTÉ RETIRÉ DE CETTE LISTE le 1er septembre** : aucun commit ne le nomme, et le mot « LIVRÉ »
de sa fiche désigne le **lot 4 de #522** — or l'item existe précisément pour dire que ce lot n'a fermé QUE
le contrat du helper, les 20 sites en course restant intacts. La raison est inscrite dans sa fiche.

⮕ **Premier geste, mécanique** : retourner les 16 cases. Toute priorisation faite
avant celle-là porte sur une liste plus lourde que la réalité. ↻ **Fait le 1er septembre** :
177 → 159 cases ouvertes (hors blocs de code), toutes porteuses d'un `#NNN`.

---

## 5. CE QUI EST DÛ PAR GRÉGOIRE, ET QUE PERSONNE D'AUTRE NE PEUT RENDRE

- La **règle métier de #560** : que doit emporter la suppression d'un fichier ?
- Les **portes terrain** jamais relevées : #568 (cibles tactiles iPad), #572
  (hiérarchie des titres), #660 / #661 (zoom, iPad).
- **#598 volet B** — la balance des blancs, après avoir regardé ses images.
- Le **nom du service d'aide** pendant la transition CAF → Passerelle +.
- Le facteur de normalisation **500 → 600** sur *Grille-1 FR-ALGO seul A26*.

---

## 6. CE QUE CE CADRAGE NE COUVRE PAS

Le **premier lancement à froid** — compte neuf, magasins vides, écrans sans
données — n'a été audité par personne en août. Grégoire juge que ce volet est
couvert par ailleurs (chroniques Labo, système d'aide, accompagnement, données de
démonstration). C'est **sa décision** ; elle est notée ici pour qu'aucune session
ne la reprenne comme un oubli.
