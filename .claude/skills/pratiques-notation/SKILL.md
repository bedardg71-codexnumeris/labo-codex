---
name: pratiques-notation
description: >
  Utiliser ce skill pour tout travail TECHNIQUE sur les pratiques de notation de
  Labo Codex : moteur de calcul de la note, résolution d'une pratique, simulation
  et comparaison (#307 / Comparateur), familles SOM/STD/SPE/DEN, configs
  exécutables, badges et représentations. Déclencher dès qu'un chantier touche
  `js/pratiques/`, `calculerDetailsNoteFinale`, `simulerIndices`,
  `obtenirPratiqueParId`, `pratiquesConfigurables`, ou le calcul de l'indice P.
  Pour l'APERÇU des familles et l'architecture générale : le skill `labo-codex` §5.
  Ce skill ancre aussi le moteur dans la pratique et la recherche documentées (§2 bis)
  et signale les écarts entre le code et ce que la recherche propose — il ne se limite
  pas à décrire l'app. Pour l'instanciation de référence de Grégoire : le skill `ecosysteme-classe`.
  Pour l'assistant de configuration : voir BACKLOG #317 (livré) / #319 (refonte).
---

# SKILL : Pratiques de notation — Architecture et moteur de calcul

> **Dernière mise à jour** : 3 juillet 2026 (#363 — journal #326 complété jusqu'à la
> réactivation 1.26.0 ; corps établi par lecture de code le 5 juin 2026, lot C0 ;
> §2 bis ajouté le même jour — ancrage recherche/pratique).
> **Nature** : volet **technique**, mais **pas un simple miroir du code**. Le §2 bis ancre
> chaque famille dans la pratique et la recherche documentées (corpus GfG + CoP-PAN) et
> nomme les **écarts** entre le code et ce que la recherche propose. La doctrine de l'outil
> est **pluraliste** (SOM/STD/SPE/DEN, sans hiérarchie) ; le skill `ecosysteme-classe` décrit
> UNE instanciation (la pratique STD de Grégoire), pas la doctrine.
> **Avertissement** : ce skill repère les fonctions par **nom** (retrouvable par grep),
> pas par numéro de ligne (les `fichier:NNN` dérivaient à chaque édition du code). Toujours
> `grep` le nom dans le fichier indiqué au moment de coder.

---

## 1. Périmètre

**Couvre** : comment une note finale est calculée selon la pratique active ; comment
une pratique est résolue depuis un identifiant ; les deux systèmes de calcul coexistants ;
la simulation lecture seule (`simulerIndices`) ; les représentations (badges, codes,
couleurs) ; les pièges vérifiés.

**Ne couvre pas** : la pédagogie des pratiques (le skill `ecosysteme-classe`), l'aperçu
descriptif des familles (le skill `labo-codex` §5), l'assistant/wizard de configuration
(`wizard-pratique-v2.js` ; bugs #131-#135 livrés en #317, refonte #319), les indices
A et C (cf. `indices.js`, `portfolio.js`).

---

## 2. Les quatre familles et leur identité canonique

| Code | Id canonique | Couleur (var CSS) | Famille | Calcul de la note | Fichier instance | État |
|------|--------------|-------------------|---------|-------------------|------------------|------|
| SOM | `sommative` | `--som-orange` | Sommative | Moyenne pondérée des évaluations | `pratique-sommative.js` | actif |
| STD | `standards` | `--std-bleu` | PAN | Portfolio (sélection de N) + terminale | `pratique-pan-standards.js` | actif |
| SPE | `specifications` | `--spe-vert` | PAN | Bundles tout-ou-rien par palier | `pratique-pan-specifications.js` | actif |
| DEN | `denotation` | `--den-violet` | PAN (PRÉN académiquement, voir §2 bis) | Note finale = jugement SAISI, gardé par l'atteinte des cibles (voir §8) | `denotation-jugements.js` + `denotation-saisie-ui.js` ; moteur dans `pratique-configurable.js` | **actif (couche 2, #318)** |

**Identifiants canoniques neutres (Session A, mai 2026)** : un seul id par pratique, sans
préfixe `pan-`. « PAN » est un **libellé de famille**, plus un préfixe technique ni un
jeton de calcul (décision 29 mai 2026). `PRATIQUE_DEFAUT = 'standards'`.

**Normalisation legacy → canonique** (`normaliserIdPratique`, `pratique-registre.js`,
idempotente). Table `TABLE_NORMALISATION_PRATIQUE` (même fichier) :

```
alternative, pan-maitrise, pan-maitrise-json, pan-standards, pan-objectifs → standards
pan-specifications → specifications
pan-denotation     → denotation
```

⚠️ **`pan-objectifs` a été foldé dans `standards`** (Session C Lot 4, PR #27, 5 juin 2026) :
l'instance séparée `pratique-pan-objectifs.js` (645 l.) a été **supprimée**. La variante
« par-objectifs » vit désormais dans Standards. Toute doc qui liste encore ce fichier est
périmée (c'est le cas du skill `labo-codex` §5.2 au 5 juin).

---

## 2 bis. Ce que la recherche et la pratique décrivent — et où le code s'en écarte

> Cette section ancre le moteur dans la pratique documentée (corpus GfG + CoP-PAN, archivé
> hors dépôt — synthèse inlinée ici pour rester accessible). **Elle n'est pas décorative** :
> chaque « écart » signale un endroit où le code *simplifie* ou *diffère* de ce que la
> recherche propose. À lire avant tout chantier qui étend une famille (#318 DEN, raffinement
> SPE) ou qui compare les familles (Comparateur). **Posture de l'outil : pluraliste — aucune
> famille n'est « la bonne » ; ne jamais générer de microcopy qui en hiérarchise.**

**SOM — Sommative (moyenne pondérée)**
- *Recherche / pratique* : pratique de référence **remise en question**, pas un neutre. Blum
  (2020) documente son incohérence et son incommensurabilité ; la moyenne « verrouille » la
  performance précoce et pénalise qui apprend lentement (Clark, *Midterm grades*). Un point
  n'est pas une unité de progrès (Talbert).
- *Code Labo Codex* : moyenne pondérée des évaluations actives, `production.ponderation || 1`.
- *Écart / vigilance* : SOM compte **chaque performance une fois, au moment où elle a eu
  lieu** — c'est la « question » que le Comparateur doit rendre lisible (E1), à opposer aux
  reprises des PAN. Ne jamais présenter SOM comme l'étalon objectif.

**STD — Standards (par standards / par objectifs)**
- *Recherche / pratique* : un standard = description claire et observable d'une action
  démontrant l'apprentissage (Clark, *Standards or specifications?*). « Atteindre » un
  standard suppose souvent **plusieurs démonstrations dans le temps** (Clark en exige deux),
  pas une sélection ponctuelle. Garde-fou : ~15 standards / 15 semaines (*Whoops*).
- *Code Labo Codex* : sélection de N artefacts (méthode configurée) + note terminale,
  conversion de niveaux IDME.
- *Écart / vigilance* : l'app raisonne **sélection d'artefacts**, la recherche raisonne
  **suivi par standard**. Le récit de calcul du Comparateur (E2) doit montrer le *sort de
  chaque démonstration*, pas seulement « les N meilleurs ».

**SPE — Spécifications**
- *Recherche / pratique* : une spécification décrit le **produit réussi entier**, jugé sur
  une **liste de critères essentiels en tout-ou-rien** (Nilson ; Clark). La note finale se
  construit par **forfaits/bundles** (« pour un A, réussir N travaux de type X »). Les
  **jetons** (Talbert, *Care and feeding of tokens*) gèrent les exceptions sans casser le système.
- *Code Labo Codex* : `seuilAcceptable` numérique (défaut 60) + `tableBundles`. Le code
  annonce lui-même « sera raffiné avec vraies spécifications ».
- *Écart / vigilance* : l'acceptabilité réelle est une **liste de spécifications satisfaites**,
  pas un seuil de note ; l'app **approxime** par `noteFinale >= seuil`. Structure forfaits
  fidèle ; acceptabilité par-travail = l'approximation à connaître avant d'interpréter un résultat.

**DEN — Dénotation (*ungrading*)**
- *Recherche / pratique* : **pas** un « jugement global qualitatif » flottant. Définition
  opératoire (Talbert, *media guide*) : aucune marque sur les travaux, rétroaction, portfolio,
  reprise/resoumission, **note finale toujours attribuée**, de façon collaborative. La CoP
  (Poulin-Lamarre & Langlois, Cégep de Sherbrooke) décrit **trois scénarios** de composition
  de la note finale, tous certificatifs et conformes au **RREC (60+/59-)**, fondés sur la
  *qualité* des productions liées à des **cibles d'apprentissage** — donc sur des standards/specs
  sous-jacents qui **doivent rester explicites** (Clark ; cf. #343 : les critères d'évaluation
  sont toujours explicités — grille/échelle de rétroaction —, jamais implicites, même si la note
  finale reste un jugement et non une conversion de niveaux). Talon d'Achille documenté (Dyer) :
  biais implicite sur l'attribution **holistique** de la note finale.
- *⚠️ Taxonomie (acté 6 juin)* : académiquement, DEN = **PRÉN** (pratique de réduction ou
  d'élimination de la notation — Girouard-Gagné et al., 2024), que la recherche **distingue**
  des **PAN** (qui renouvellent la notation : STD/SPE/maîtrise/contrat). Labo Codex **garde le
  badge famille « PAN »** pour l'UI (simplicité, suit le billet CoP qui fond la dénotation
  comme 3e famille PAN) — **mais c'est une approximation assumée**. Ne pas la prendre pour la
  réalité conceptuelle. (À documenter aussi : commentaire registre près de `denotation` ;
  guide PAN utilisateur.)
- *Code Labo Codex* : **implémenté** (couche 2, #318, juin 2026). La note finale est un
  **jugement saisi** par l'enseignant, gardé par l'atteinte des cibles. **Détail technique
  complet au §8** (collection `jugementsDenotation` SSOT, moteur `_calculerPerformanceDenotation`,
  garde par cible → 59, helper `suggererNoteHolistique`, création assistant). Conception :
  `plans de travail/NOTE-COWORK-modele-DEN.md`.
- *Principe pédagogique* : DEN abandonne la fonction de **tri** de la note, garde la
  **certification** (RREC). **Jamais « pas de chiffre ».** Trois modes ancrés sur la gradation
  Girouard-Gagné (différée, réduite, éliminée) ; seul **éliminée** est livré (modes différée/réduite
  à venir, voir §8). Garde-fou Dyer + santé mentale (Girouard-Gagné : certains étudiants
  déstabilisés par l'absence de repères) : traces + critères explicites obligatoires ; ne pas
  vendre DEN comme un bien universel. Sources : Girouard-Gagné et al. (2024), billet CoP
  dénotation (Poulin-Lamarre & Langlois), Blum (2020), Dyer.

**Transversal — les familles ne sont pas étanches**
- *Recherche* : standards et spécifications se **combinent** dans une même classe (Clark) ;
  la plupart des PAN, y compris l'ungrading, reposent sur des standards/specs sous-jacents.
- *Code* : une pratique = **une** famille exclusive.
- *Écart connu* : hybridation absente (audit assistant, critère B4). Ne pas prendre le modèle
  de données pour la réalité pédagogique.

**Transversal — reprises sans pénalité (4ᵉ pilier)**
- *Recherche* : « sans pénalité » signifie au sens strict **retenir la meilleure** tentative
  (Talbert, *Heart of the loop*) ; la **récence** (dernier essai) est une variante délibérée
  et défendable, pas l'équivalent par défaut. Limites oui, illimité non (*Reasonable
  reassessments*, *Whoops*).
- *Code* : STD retient « le dernier essai non remplacé » → **récence**.
- *Vigilance* : c'est une **décision pédagogique**, pas un détail technique — la nommer comme
  telle, et la rendre visible dans le récit de calcul du Comparateur.

---

## 3. Trois niveaux de « pratique » — à NE PAS confondre (piège majeur)

| Niveau | Où | Schéma | Rôle |
|--------|-----|--------|------|
| **(a) Codée en dur** | Registre `pratiquesEnregistrees` (Map) | Instance JS `IPratique` | Familles de base : `sommative`, `standards`, `specifications`, `test`. Enregistrées au boot (`enregistrerPratique('sommative', …)` etc.) |
| **(b) Configurable** | Storage `pratiquesConfigurables` | **`{ id, nom, configuration }`** — schéma **exécutable** | Les pratiques créées par l'utilisateur. **C'est ce que le moteur consomme.** |
| **(c) Gabarit prédéfini** | `pratiques-predefines.js` (`window.PRATIQUES_PREDEFINES`) | `{ echelle, structure_evaluations, calcul_note, … }` — schéma **descriptif** | Modèles **pédagogiques** présentés à l'utilisateur. **NON exécutables tels quels.** |

**Le piège** : les gabarits (c) ressemblent à des configs mais leur schéma descriptif n'est
**pas** celui que lit le moteur (b). Pour rendre un gabarit calculable, il faut produire un
objet `pratiquesConfigurables` au schéma (b) — pas copier le gabarit.

---

## 4. Résolution : `obtenirPratiqueParId(id)`

`obtenirPratiqueParId` (`pratique-registre.js`, exposé `window.obtenirPratiqueParId`). Ordre :

1. **Normalise** l'id (`normaliserIdPratique`) — un id legacy non migré résout quand même.
2. Cherche dans le **registre** (codées en dur).
3. Sinon, cherche dans **`pratiquesConfigurables`** → `construireConfigComplete` → `new PratiqueConfigurable(config)`.
4. `null` si introuvable.

La **famille** d'une pratique configurable dérive du champ **`configuration.type`** (Session B) ;
`instance.obtenirCode()` rend `SOM`/`STD`/`SPE`/`DEN`.

---

## 5. Le schéma exécutable des configs

```
pratiquesConfigurables = [ { id, nom, configuration: { … } } ]
```

`obtenirConfigPratiqueActive(pratiqueId)` (fn `obtenirConfigPratiqueActive`, `portfolio.js`)
renvoie `configuration`. Sans `pratiqueId`, repli sur la pratique active du groupe-cours.

**STD** (lu par `_obtenirConfigPortfolioCalcul`, `profil-etudiant-actions.js`) :
```js
configuration: {
  type: 'standards',
  portfolio: { nombreARetenir, minimumCompletion, methodeSelection, reglesConformite },
  notesFinales: true,        // mode finale → règle « obligatoires non remises = 0 »
  categories: { actif, selection:{…}, obligatoires:{…} }   // optionnel : mode hybride
}
```
`methodeSelection` ∈ `meilleurs` | `recents` | `recents-meilleurs` | `tous` (`derniers`→`recents`).

**SPE** (lu par `pratique-pan-specifications.js`) :
```js
configuration: {
  type: 'specifications',
  typesTravaux: [ { id, nom, seuilAcceptable } ],          // id mappé à production.type
  tableBundles: [ { noteFixe, requis: { typeId: nb } }, … ] // palier plancher : requis null
}
```
⚠ **Ce que l'application ÉCRIT n'est pas cette forme** (#708, audit du 16 sept., relu le 11 oct. 2026) :
l'éditeur et le gabarit « Modèle simple » écrivent `forfaits: [ { lettre, note, travaux: { typeId: n } } ]`
et `seuilAcceptable` ; `pratique-pan-specifications.js` traduit `forfaits` → `tableBundles` **à la lecture**.
L'assistant n'écrit pas les types de travaux (constat A-3) : ils se règlent au formulaire.

**Source canonique** : depuis la **Phase G2-a (24 mai 2026)**, la config portfolio est lue
**uniquement** depuis `pratiquesConfigurables`. Plus de fallback sur
`modalitesEvaluation.configPAN.portfolio` (qui driftait à l'édition wizard).

**Champs d'enveloppe pour l'Exploration (axe D / #326, D-0 livré)** : l'enveloppe
`{id, nom, auteur, description, config}` porte désormais deux champs pour l'axe D :
- `inspireDe.sourceId` (dans le sous-schéma `inspireDe`) — id de la pratique source,
  posé par `BibliothequeUI.forgerInspireDe` (donc sur **toute** copie forkée, transversal
  grilles/échelles/cartouches/pratiques). Sert l'arbre de filiation **et** l'attribution CC.
  **Jamais effacé** (invariant CC, SPEC §3.1) ; optionnel (filiations legacy sans id ignorées).
  Validé à l'import par `SCHEMA_INSPIRE_DE` (`import-export.js`).
- `estMaquette` (booléen, transitoire ; **R1 : renommé depuis `estEssai`**) — maquette vs
  pratique aboutie (SPEC §3.2). Posé **opt-in** par `dupliquerPratique(id, {estMaquette:true})` ;
  la duplication ordinaire (bouton « Dupliquer ») ne le pose **pas**. Le filtre `estMaquette ≠ true`
  masque les maquettes de la sidebar/bibliothèque (helpers `BibliothequeUI.estMaquette`/
  `filtrerParMaquette`). Basculé à `false` à l'**adoption** (`adopterMaquette`). Migration boot
  one-shot `estEssai`→`estMaquette` (`main.js`, flag `migration_estEssai_to_estMaquette_done`,
  supprime l'ancien champ — pas d'alias).

---

## 6. Les DEUX systèmes de calcul de la note (crucial)

Deux chemins coexistent — c'est la source de la plupart des surprises.

| | Chemin procédural | Instances IPratique |
|---|---|---|
| **Fonction** | `calculerDetailsNoteFinale(da, pratiqueId)` | `pratique.calculerPerformance(da)` |
| **Lieu** | fn `calculerDetailsNoteFinale`, `profil-etudiant-actions.js` | chaque `js/pratiques/pratique-*.js` |
| **Familles** | **STD uniquement** (garde `if (!estFamilleStandards) return null`) | toutes (chacune la sienne) |
| **Sortie** | décomposition `{ portfolio, terminal, noteFinale, … }` 0-100 | indice 0-1 |
| **Usage** | note « riche » du profil (portfolio à note construite) | indice P, snapshots, simulation |

**Pourquoi la garde STD** : seul Standards a un « détail de note finale portfolio »
(sélection d'artefacts + terminale). SOM/SPE/DEN n'en ont pas → `calculerDetailsNoteFinale`
les rejette et le code retombe sur leur `calculerPerformance`.

**Conséquence pratique** : pour une note **comparable entre familles**, ne pas appeler
`calculerDetailsNoteFinale` directement (il ne répond que pour STD) — passer par
`simulerIndices` (§7), dont le champ `P` unifie les familles.

---

## 7. `simulerIndices(da, pratiqueId)` — la porte lecture seule (#307)

fn `simulerIndices` (`portfolio.js`, exposé `window.simulerIndices`, Lot 5). Miroir **sans effet de bord**
de `calculerEtStockerIndicesCP` pour un étudiant et **une pratique demandée**.

```
retour : { pratique, C, P, noteFinale, details }
```
- **`P` (0-100) = métrique commune** : `noteFinale/100` quand STD calcule, sinon
  `calculerPerformance × 100` (fallback pour SOM/SPE).
  ⚠️ La comparabilité numérique de `P` est une **commodité de calcul, pas une équivalence
  pédagogique** : des pratiques différentes mesurent des choses différentes (cf. §2 bis). Le
  Comparateur doit l'encadrer (E1-E3), jamais la présenter comme un classement (« palmarès de
  générosité »).
- **`noteFinale`** = note STD construite, ou `null` (fallback) pour les autres familles.
- **Lecture seule absolue** : n'écrit jamais `indicesCP`, ne change pas la pratique active
  du groupe-cours. Param absent ⇒ comportement historique strictement inchangé (parité
  avec la pratique active : mêmes C et P que `calculerEtStockerIndicesCP`).

C'est la **brique d'appel** du **Comparateur de pratiques** (§12) : simuler/comparer
plusieurs pratiques sur les mêmes artefacts sans toucher aux données du trimestre.

---

## 7 bis. L'ÉCHELLE : deux conversions inverses, deux champs obligatoires

**Précision de Grégoire, 26 août 2026** — elle ne figurait nulle part dans ce skill, alors qu'elle
commande la lecture de tout niveau d'échelle.

Un niveau porte **deux** informations numériques, et elles servent des sens opposés :

| | Champ | Sens | Sert à |
|---|---|---|---|
| **La plage** | `min` / `max` | note chiffrée **→ CODE** | les **pratiques alternatives** : la note finale d'un·e élève sur une production EST un code, déterminé par la plage dans laquelle tombe la note chiffrée — laquelle reste cachée |
| **La valeur ponctuelle** | `valeurCalcul` | CODE **→ note chiffrée** | la **notation sommative**, et toute conversion en chiffre exigée par la certification (RREC) |

⮕ **L'une ne se déduit PAS de l'autre.** Le code a longtemps replié `valeurCalcul` sur
`(min + max) / 2` quand elle manquait : c'est un **arbitrage pédagogique fabriqué par le code**.
« Maîtrise » de 75 à 89 vaudrait 82, alors que l'enseignant·e voudrait peut-être 80, ou 85. Le projet
interdit les fallbacks arbitraires sur les valeurs métier — celui-ci en était un.

⮕ **Les deux sont donc obligatoires depuis #526** : astérisque à l'écran et refus réel à l'écriture
(`refusChampNiveau`, `echelles.js`).

⮕ **Et le repli est RETIRÉ (#527)** — mesuré avant, pas supposé : les échelles réelles de Grégoire
(« aucun de mes niveaux n'a pas de valeur ponctuelle, j'ai travaillé tout l'hiver avec »), le pack de
démarrage (9 niveaux, 9 avec `valeurCalcul`) et les échelles semées par le code en portent toutes
une. Il ne servait à personne et ne pouvait que fabriquer une note fausse le jour où une valeur
manquerait vraiment. **Sans valeur ponctuelle, un niveau est désormais NON CALCULABLE** :
`evaluation-calcul.js` exclut le critère du total, pondération comprise, et `consolidation.js` saute
le niveau. Jamais un zéro, jamais un chiffre inventé.

⚠ **Le zéro est une valeur, pas une absence.** `valeurCalcul: 0` est légitime (échelles « IDME et
niv 0 ») : toute lecture doit employer `!= null`, jamais un OU-logique. Un `0 || x` rend `x` — c'est
le défaut #525, qui donnait 29,5 au lieu de 0 sur un niveau 0 de plage 0-59.

⮕ **Lecture unique** : `valeurNumeriqueDuNiveau(niveau)` (`echelles.js`), consommée par
`evaluation-calcul.js` et `consolidation.js`. Elle rend `null` — jamais `NaN`, jamais un zéro
inventé — quand il n'y a ni valeur ni bornes exploitables.

---

## 7 ter. Le BARÈME d'un critère analytique : il décrit les points, il ne les calcule pas

**#1120, livré du 20 au 27 oct. 2026** (plan : `plans de travail/PLAN-2026-10-19-bareme.md`). Un critère analytique se
note en points (son maximum est sa pondération). Son **barème** dit ce que valent ces points : des **tranches**
`{ id, nom, pointsMin, pointsMax, texte }`. L'échelle reste l'instrument des holistiques : avec une échelle, on choisit un
niveau et l'échelle donne la note ; avec un barème, on donne des points et le barème dit à quoi ils correspondent.

| | Où | Règle |
|---|---|---|
| **Lecture unique** | `js/bareme.js` : `tranchesDuCritere`, `trancheDesPoints`, `lectureDesPoints`, `valeursOffertes`, `texteAtteint` | `bareme`, sinon l'ancien `descripteurs.parNiveau` sans `echelleId`, lu sans rien écrire |
| **Invariant 1** | `evaluation-calcul.js`, `profil-etudiant-calculs.js` ne nomment pas `bareme` | ni la note, ni P, ni le Comparateur, ni l'export, ni le dépistage : tous lisent `pointsAnalytiques` ; sentinelles `bareme-1-editeur.test.js` (I) et `bareme-3-evaluer.test.js` (I) |
| **À l'évaluation** | `evaluation-chargement.js`, `_saisiePointsHtml` | les tranches guident la saisie ; une valeur touchée entre par l'événement `input` du champ, comme une frappe ; **seuls les points s'enregistrent** |
| **Ce que l'élève lit** | `synthese-retroaction-data.js` (PDF), `evaluation-retroaction.js` (bilan) | dans le bloc du critère : le chiffre, dessous le TEXTE de la tranche atteinte, sans son nom, puis la cartouche ; hors barème, le chiffre seul ; les lignes du bilan (« Présentement », « Ta force »), le chiffre seul (décision de Grégoire, 27 oct.) |

⚠ **Le zéro est une valeur** ; une tranche sans points est `null`, pas 0 (« à compléter ») et n'est jamais choisie.
⚠ **Deux tranches du stock qui se chevauchent** (« 3-4 », « 4-5 ») : `trancheDesPoints` rend la PREMIÈRE dans l'ordre écrit.
⚠ **Le texte du PDF vient du barème ACTUEL** : aucune donnée du barème n'est gardée sur la copie ; un barème réécrit après
la remise change le texte d'un PDF refait plus tard (la note, elle, ne bouge pas). Seul `retroactionFinale`, le texte
déjà engendré et enregistré avec la copie, garde la phrase du moment.

## 8. Calcul par famille (résumé technique)

- **SOM** (fn `calculerPerformance`, `pratique-sommative.js`) : moyenne pondérée de **toutes** les évaluations
  actives de l'étudiant (`!remplaceeParId`, note non nulle), pondérée par
  `production.ponderation || 1`. Indice = moyenne / 100.
- **STD** (`calculerDetailsNoteFinale`) : sélectionne `nombreARetenir` artefacts (méthode
  configurée) parmi les `type === 'artefact-portfolio'`, moyenne le portfolio, agrège avec
  la terminale selon pondérations. Reprises = le dernier essai non remplacé est retenu.
- **SPE** (fn `calculerPerformance`, `pratique-pan-specifications.js`) : compte les travaux **acceptables** par type
  (`_estTravailAcceptable` = `noteFinale >= seuilAcceptable`, défaut 60), puis trouve le
  palier le plus élevé dont **tous** les `requis` sont satisfaits (logique tout-ou-rien).
- **DEN** (couche 2, #318, juin 2026) : la note finale est un **jugement SAISI** par
  l'enseignant, pas un calcul sur les artefacts. `calcul_note.methode = 'jugement_global'`.
  - **Stockage** : collection `jugementsDenotation` (namespacée), propriétaire =
    `pratiques/denotation-jugements.js` (SSOT) ; `{ [pratiqueId]: { [da]: { ciblesAtteintes,
    noteFinale, justification, date } } }`. Écrite par l'UI de saisie du profil
    (`denotation-saisie-ui.js`, section « Jugement »), **lue seulement** par le calcul.
  - **Moteur** : `_calculerPerformanceDenotation` (`pratique-configurable.js`), branché par
    **court-circuit en tête de `calculerPerformance`** (la note ne dépend pas d'`indicesCP`).
    Garde « cibles atteintes » **par cible** (DEN-B) : une cible non confirmée plafonne à
    **59** (RREC échec), jamais ≥ 60 ; toutes confirmées → la note saisie. Pas de saisie →
    `null` (non calculable, jamais un zéro). **RREC : toujours un chiffre dès qu'il y a saisie.**
  - **Suggestion** : helper pur partagé `window.suggererNoteHolistique(niveauxParObjectif,
    methode)` (extrait de `_calculerModeHolistique`, parité STD golden master) — **ancrage**
    affiché à la saisie (« l'algorithme propose, le jugement tranche »), jamais la valeur finale.
  - **Création** : assistant, voie rapide → carte « Dénotation » → étape `config-denotation`
    (cibles une par ligne → ids stables ; méthode de suggestion ; mode `eliminee` seul offert).
  - **Échelle + grille OPTIONNELLES (#343 (b), 17 juin 2026)** : DEN peut porter `configuration.echelleId`/
    `grilleId` pour la **rétroaction formative** — les critères doivent rester **explicites** (cf. §2 bis).
    Elles **n'entrent PAS dans le calcul** (note = jugement saisi ; `valider()` n'exige pas d'échelle pour
    `jugement_global`). Le wizard (`config-denotation`) les expose en selects `required:false` ; round-trip
    d'édition restauré (branche `denotation` de `chargerPratiqueExistante`). R3 (`construction-attributs.js`)
    affiche l'échelle/grille DEN au lieu de « s.o. ».
  - **Non simulable** (DEN-E) : la note étant un jugement, `simulerIndices` ne produit pas de
    nombre comparable (P=0/noteFinale=null) → **diffable** dans l'Exploration des pratiques
    (axe D), pas une colonne note. Pas de note DEN dans le pack démo.
  - **Récit de calcul** (#333 Lot 1, 15 juin 2026) : `PratiqueConfigurable.decrireCalcul(da)`
    (gardé `jugement_global`, sinon `null`) produit le `RecitCalcul` `{famille, pratiqueNom,
    resultats, synthese}` décrivant le **jugement** (note gardée, sort de chaque cible
    confirmée/non confirmée, `synthese.justification`), **parité** via
    `_calculerPerformanceDenotation`, lecture seule. Comble le seul trou du **récit unifié** de
    `simulerIndices` (SOM/SPE l'avaient via leur `decrireCalcul`, STD via
    `calculerDetailsNoteFinale.recit` ; DEN rendait `recit=null`). Aucune saisie → `null`
    (« note non encore arrêtée », jamais un zéro). Test :
    `tests/unit/decrire-calcul-denotation-333.test.js`.
  - **Taxonomie / principe pédagogique** : badge UI « PAN » mais DEN = **PRÉN** ; certification
    sans tri, jamais « pas de chiffre », garde-fous Dyer + santé mentale → **voir §2 bis** (pas de redite).
  - Reste hors premier jet : mode **réduite** (réussi/échoué + différenciation) ; couche 1
    « note différée » (#321) ; câblage DEN dans le chemin **procédural** `calculerDetailsNoteFinale`
    (la note de jugement transite par l'instance `calculerPerformance`, pas par le portfolio).

---

## 9. Note « non calculable » : diagnostic

`_diagnostiquerNoteNonCalculable()` (fn `_diagnostiquerNoteNonCalculable`, `profil-etudiant-actions.js`, #128) rend un message
**précis** selon la cause réelle, jamais un générique :
1. aucune pratique assignée au groupe-cours ;
2. pratique assignée introuvable en bibliothèque (id obsolète, supprimée) ;
3. pratique Sommative ou Spécifications (non branchée au calcul « détail » du profil) ;
4. **DEN (#318)** : la note est un jugement à SAISIR (section « Jugement » du profil), pas une config à corriger — le message oriente vers la saisie ;
5. STD mais config portfolio incomplète.

Quand on conçoit une vue multi-pratiques, diagnostiquer **par cellule/colonne** (une
pratique non calculable n'empêche pas les autres de calculer).

---

## 10. Pièges vérifiés (gotchas)

- **`calculerDetailsNoteFinale` ne répond que pour STD** (`return null` sinon). Ne pas s'en
  servir comme calcul universel.
- **SOM pondère `production.ponderation || 1`** : une production à pondération **0** reçoit
  donc le poids **1** (et non 0). Vérifier les pondérations avant d'interpréter un écart.
- **`_identifierProductionTerminale` cherche `type === 'terminale'`** (fn `_identifierProductionTerminale`, `profil-etudiant-actions.js`) — une
  production `type: 'travail'` n'est **pas** vue comme terminale par STD (elle serait ignorée).
- **Config portfolio = `pratiquesConfigurables` seulement** (Phase G2-a) ; ne pas relire
  `configPAN.portfolio`.
- **SPE acceptabilité = seuil simple** (`noteFinale >= seuil`) — le code annonce « sera
  raffiné avec vraies spécifications » ; aujourd'hui ça dérive des notes existantes.
- **Schéma `pratiquesConfigurables` ≠ `{id, nom, configuration}` seul** :
  `PratiqueConfigurable.valider()` exige `id`, `nom`, `calcul_note` **à la racine** ; et
  `echelle` (racine) si `calcul_note.methode ∈ {conversion_niveaux, pan_par_objectif}`.
  `construireConfigComplete` lit bien `configuration.{type,portfolio,seuils,objectifs}`.
  ⚠ **PÉRIMÉ depuis #762** : sans `calcul_note`, la méthode se déduit **de la famille**
  (`METHODE_PAR_FAMILLE` : sommative → `moyenne_ponderee`, specifications → `specifications`,
  denotation → `jugement_global`, standards → `conversion_niveaux`). Seule une standards sans échelle reste
  refusée (« Champ obligatoire manquant : echelle »). Relu le 11 oct. 2026.
- **`_lireIndiceStocke` rend `null`** (pratique-configurable.js) quand le cache `indicesCP` est
  vide (#709), quand l'entrée est non constructible (1.142.24), ou quand elle a été calculée pour
  une autre pratique. Un `null` y veut dire « non calculable », jamais zéro.
- **SPE configurable délègue à `PratiquePanSpecifications`** (depuis 6 juin 2026) :
  `PratiqueConfigurable.calculerPerformance` cas `'specifications'` instancie une
  `PanSpecifications` jetable, la configure avec `this.config.configuration`
  (`typesTravaux`/`tableBundles`) et lui délègue le calcul par paliers. Sans cette
  délégation (état antérieur), une SPE configurable retombait sur `indicesCP.actuel.PAN.P`
  (faux — pas un calcul tout-ou-rien). `jugement_global` (DEN) garde le repli PAN.
  Sentinelle : `tests/unit/sentinelle-spe-configurable-delegation-2026-06-06.test.js`.
- **SOM configurable : seul le VERROU s'applique (#897, 17 sept. 2026, 1.142.25).** L'assistant écrit les règles
  spéciales sous `configuration.conditions_speciales` ; `construireConfigComplete` les renvoie sous
  `calcul_note.conditions_speciales` (une pratique qui porte déjà les siennes les garde), et
  `_appliquerVerrousSommatifs` plafonne la moyenne de `PratiqueSommative` quand la copie de l'évaluation
  nommée (comparée au TITRE de la production, sans casse) est sous le seuil. ⚠ `calculerNoteFinale` et ses
  méthodes (`calculerMoyennePonderee`, `calculerParRemplacementProgression`, `appliquerPlafonnement`…) n'ont
  AUCUN appelant : ne pas en déduire que « le moteur applique » quoi que ce soit — l'audit du 16 sept. s'y est
  trompé. Plafonnement (condition en texte libre), remplacement (nombre de paires sans identités) et reprises
  (déclaratif) restent des promesses : #903.
- **Gabarits prédéfinis ≠ configs exécutables** (§3).
- **Adopter un modèle Standards SANS échelle DEMANDE l'échelle** (#898, 1.142.31, tranché par Grégoire). DEUX gestes
  vivants y mènent, et les deux appellent `demanderEchelleAdoption` (`pratiques-bibliotheque.js`) AVANT d'écrire : la
  branche `_modeleAdopte` de `creerPratiqueV2` (assistant, « Partir d'un modèle ») et `ajouterPratiqueALaSelection`
  (bouton « Ajouter » de la bibliothèque). On ne devine JAMAIS l'échelle, même s'il n'y en a qu'une. Un TROISIÈME geste
  d'adoption doit passer par la même fonction. Le prédicat `modeleDemandeEchelle` lit ce que lit
  `construireConfigComplete` (échelle embarquée ou par id). Cas d'arrêt : aucune échelle dans le trimestre → pas de
  question, adoption sans échelle (#909, un mot de Grégoire est dû). Stock non réparé : sortie = rouvrir par l'assistant.
  Mesuré : la NOTE d'un portfolio Standards ne dépend pas de l'échelle choisie ; c'est l'INSTANCE qui en dépend.
- **`pan-objectifs` supprimé** (§2) ; tout id résiduel résout vers `standards`.

---

## 11. Carte des fonctions (repérer par **nom** via grep — pas de numéro de ligne)

| Fonction | Fichier | Exposée | Rôle |
|---|---|---|---|
| `normaliserIdPratique` | `pratique-registre.js` | window | legacy → canonique |
| `obtenirPratiqueParId` | `pratique-registre.js` | window | id → instance |
| `obtenirRepresentationPratique[Stricte]` | `pratique-registre.js` | window | {code, couleur, famille} |
| `genererBadgePratiqueHTML` | `pratique-registre.js` | window | badge SOM/STD/SPE/DEN |
| `obtenirConfigPratiqueActive` | `portfolio.js` | window | config d'une pratique |
| `simulerIndices` | `portfolio.js` | window | C/P/note, lecture seule |
| `calculerDetailsNoteFinale` | `profil-etudiant-actions.js` | window | détail note STD |
| `_obtenirConfigPortfolioCalcul` | `profil-etudiant-actions.js` | non | lit la config portfolio |
| `_diagnostiquerNoteNonCalculable` | `profil-etudiant-actions.js` | non | message d'erreur précis |

Infrastructure : `pratique-interface.js` (contrat `IPratique`), `pratique-configurable.js`,
`pratique-registre.js`, `pratique-manager.js`, `pratiques-predefines.js`.

---

## 12. Le Comparateur de pratiques (chantier en cours, MàJ 6 juin 2026)

Vue d'**aide à la transition SOM → PAN** : montrer ce que la note d'un profil-type
deviendrait sous d'autres pratiques, sur les **mêmes** artefacts. Ne recommande jamais ;
débouche sur l'assistant.

**Finalité (acté 6 juin 2026, Grégoire) — sortir du paradigme du cumul** (la note n'est pas
un score additionné), **pas « quitter SOM »** : le recentrage vaut **peu importe la famille**
(pluralisme ; *Gateways* de Clark — viser l'idée du cumul, jamais la pratique de l'enseignant).
Ce qui compte n'est **ni l'écart de notes** entre pratiques, **ni le seuil de réussite (60 %)**,
mais **ce que la note REPRÉSENTE : un reflet le plus fidèle possible de la maîtrise de la
compétence en fin de parcours**. Bonne question : « laquelle de ces notes dit le vrai sur ce
que l'élève maîtrise maintenant ? ». Le novice issu de SOM a le réflexe de comparer les
chiffres — réflexe normal après des années de moyenne ; le Comparateur **rappelle activement**
ce recentrage et **montre la maîtrise (trajectoire IDME, terminale) en regard de chaque note**.
Pluralisme : aucune PAN n'est « la bonne », l'outil ne tranche pas. Mémoire
`project-comparateur-finalite-sortie-paradigme-som` ; SPEC_comparateur §1 bis. **Ne jamais
générer de microcopy en « palmarès de générosité » ; l'« écart en points » reste un appui
discret, pas l'info vedette.**

- **Moteur réutilisé tel quel** : `simulerIndices` + `calculerDetailsNoteFinale` (le
  Comparateur est un **consommateur**, aucune écriture).
- **Phase 1 = données démo**, familles SOM + STD + SPE (DEN reporté #318).
- **Spécs** : `plans de travail/SPEC_comparateur_pratiques.md` ;
  `plans de travail/NOTE-CONCEPTION-C0-comparateur.md` (configs candidates, profils-types,
  plan de seed) ; outil `plans de travail/campagne-C0-diagnostic.js`.
- **Leçon C0 (résolue 6 juin)** : la démo ne portait aucune pratique PAN configurée → STD
  tombait en fallback, SPE rendait une note constante. **Seed démo v20.5** : 2 pratiques
  configurables ajoutées (`demo-std-litt`, `demo-spe-litt`) au pack, terminale passée en
  `type:'terminale'` (D1), pondérations SOM honnêtes (D5), pratique active = `demo-std-litt`.
  Pré-requis schéma (calcul_note + echelle) et délégation SPE : voir §10. Résultat : les 3
  familles calculent. **Reste** : D4 — construire le profil « irrégulier » (DEMO011) comme
  une **progression réelle** (maîtrise tardive démontrée), pas pour maximiser un écart.

**Axe suivant — « Exploration des pratiques » (D, conçu et validé 8 juin 2026).**
Le §12 ci-dessus décrit la **phase 1 livrée** (C0-C4). L'axe D élargit le Comparateur en
**« Exploration des pratiques »** (sous-section du Labo) : décliner une **souche** en
**variantes d'essai**, parenté via `inspireDe.sourceId`, **diff de config** (statique →
**survit au « non calculable »**), flag `estEssai` (transitoire). **DEN y est diffable mais
NON simulable** (jugement saisi → pas de colonne note). Le Comparateur reste **consommateur
lecture seule** ; aucun nouveau chemin de calcul. Spéc canonique :
`plans de travail/SPEC_D_exploration_pratiques.md` (découpage 6 lots, préalables **#320** +
**#318**) ; backlog **#326**.

**État (15 juin 2026) — D-0/D-1 LIVRÉS (moteur pur, aucune UI encore).**
- **Module** `js/pratiques/pratiques-exploration.js` (IIFE, `window.ExplorationPratiques`),
  **lecture seule**, pur, testable sans DOM. Fonctions :
  - `construireArbrePratiques(pratiques)` (D-0) — forêt de filiation par `inspireDe.sourceId` ;
    souche = sans sourceId / source absente / legacy sans id ; profondeur libre ; anti-cycle
    (jamais de boucle ni de perte de pratique).
  - `diffConfigsPratiques(configA, configB)` (D-1) — diff profond pur des objets `config`
    (tableaux comparés **en bloc**), sortie triée par chemin, **symétrique**, **statique**
    (se calcule même quand la note est « non calculable » : aucun appel au moteur).
  - `phraseEffetPourDiff(entry)` / `diffPratiques(pA, pB)` (D-1) — mapping paramètre→phrase
    d'effet (**affiné le 15 juin 2026 à la demande de Grégoire** ; libellé final = son ressort,
    à ajuster au fil de l'usage) avec **repli neutre garanti** (« Réglage modifié. ») — ne lève
    jamais. **Posture** : la phrase dit ce que le réglage change *dans la mesure*, jamais en
    « plus/moins sévère » (anti palmarès de générosité, §2 bis/§12) — un test le verrouille.
    Couverture : reprises (type, rétrogradation), pondération, conditions spéciales, méthode
    de calcul, **portfolio** (methodeSelection, nombreARetenir, minimumCompletion, notesFinales),
    échelle/seuils, **SPE** (tableBundles, typesTravaux), **DEN** (type, modeDEN, suggestion).
    Lookup robuste au nesting `configuration.*` (normalisé vers la forme à plat).
- **Modèle** (D-0) : `forgerInspireDe` pose `sourceId` ; `SCHEMA_INSPIRE_DE` l'accepte ;
  `dupliquerPratique(id, {estEssai})` pose `estEssai` **opt-in** (voir §5).
- Tests : `tests/unit/exploration-pratiques-arbre-326.test.js` (5) +
  `…-diff-326.test.js` (6), break-testés.
- **D-2 + D-3 LIVRÉS (15 juin 2026)** — UI Labo « Exploration » + dérivation :
  - **Filtre `estEssai`** : `BibliothequeUI.estEssai` / `filtrerParEssai` (miroir de
    `estItemDemo`/`filtrerParModeDemo`), appliqués aux sites de présentation
    (`afficherListePratiquesSidebar`, `afficherListePratiquesMateriel`,
    `afficheBibliothequePratiques`). Le helper source `obtenirToutesLesPratiquesBibliotheque`
    reste INTACT (l'Exploration/le wizard/la duplication voient les essais).
  - **Label** : `config.js` `'comparateur'` → « Exploration des pratiques » (id conservé).
  - **Promotion** : `promouvoirPratiqueEssai(id)` (`pratiques.js`) — `estEssai`→false en place,
    `inspireDe`/`sourceId` INTACTS (invariant CC). **Dérivation** : `deriverVarianteEssai(sourceId)`
    — nom auto « <souche> · essai N », `dupliquerPratique(sourceId,{estEssai:true,silencieux})`
    (pose `inspireDe.sourceId` via `forgerInspireDe`) puis `editerPratique` (assistant). `dupliquerPratique`
    retourne désormais l'id + accepte `silencieux`.
  - **Arbre** (`comparateur-pratiques.js`, sous-section devenue « Exploration ») : `rendreComparateur`
    rend deux régions — `#exploration-arbre-hote` (filiation des essais via `construireArbrePratiques`,
    actions dériver/promouvoir/jeter, noms `_esc`) + `#exploration-comparaison` (matrice démo inchangée).
  - Tests : `exploration-pratiques-essai-filtre-326`, `promotion-essai-326`, `derivation-essai-326`,
    `exploration-arbre-securite-326` (break-testés).
- **D-4 + D-5 (cœurs) LIVRÉS (16 juin 2026)** :
  - **D-4** : `comparateur-pratiques.js` — **DEN non-simulable** (colonne DEN = « jugement », pas un
    nombre) ; **diff avant matrice** (`#comparateur-diff`, re-rendu avec la matrice) via les helpers
    PURS `ExplorationPratiques.partagentSouche` + `phrasesEffetEntreConfigs` (diff de configs
    **résolues** par `construireConfigComplete` — pas `.config` à l'aveugle) ; bouton **« Comparer »**
    sur les nœuds d'essai → `_comparerDepuisArbre` injecte la variante dans la matrice démo.
  - **D-5** : moteur PUR `trierEssais`/`filtrerEssais`/`essaiDormant` (péremption douce = signale,
    jamais détruit) + badge « dormant » sur les nœuds d'essai.
  - Tests : `exploration-hygiene-326` (13), `exploration-diff-souche-326` (7), break-testés.
- **RESTE** : **D-4** pont réel↔démo de « Comparer » (la variante doit être résoluble en démo) +
  barre tri/filtre (liste plate) + rangement #320 — **décisions/validation terrain** ; **D-6**
  (validation terrain Mac+iPad sombre/clair + release `minor` + changelog). ⚠️ **Validation terrain
  Grégoire en attente** pour tout le visuel Exploration (arbre, diff, matrice, badges).

**RECADRAGE « banc de décision » (RELAIS-326, 16 juin 2026) — les lots D-2…D-5 ont livré le
mécanisme mais raté le workflow.** La refonte se découpe en `#343 → R1∥R2∥R3 → R4 → R5 → R6`
(SPEC_D bandeau + `plans de travail/RELAIS-326-refonte-banc-decision.md`, source unique). Le
**moteur pur survit tel quel** ; ne pas releaser 1.19.0 avant R6.

- **R1 LIVRÉ (16 juin 2026) — maquette (modèle + cycle de vie) + fix bug.** Vocabulaire
  **« essai » → « maquette »**, **« promouvoir » → « adopter »** (décisions Grégoire, RELAIS §4.5) :
  - **Champ** `estEssai` → `estMaquette` (migration boot one-shot dans `main.js`, supprime
    l'ancien champ — pas d'alias). **Fonctions** : `promouvoirPratiqueEssai`→**`adopterMaquette`**,
    `deriverVarianteEssai`→**`deriverMaquette`**, `BibliothequeUI.estEssai`→**`estMaquette`**,
    `filtrerParEssai`→**`filtrerParMaquette`** ; moteur pur `trierEssais`/`filtrerEssais`/
    `essaiDormant`→**`trierMaquettes`/`filtrerMaquettes`/`maquetteDormante`**.
  - **Garde-fou « max 1 dérivé »** : `deriverMaquette` refuse une source déjà maquette
    (profondeur d'arbre = 1) ; l'arbre n'offre « Dériver » que sur une souche → corrige
    « doublons de doublons » (#326 §1.2).
  - **Fix bug « Pratique introuvable »** (RELAIS §1.5) : `_attacherActionsArbre` rendait le
    listener délégué accumulé à chaque `_rafraichirArbre` → un clic « Jeter » se déclenchait N+1
    fois (la 1ʳᵉ supprimait, les suivantes levaient « Pratique introuvable : <id> »). Garde
    idempotente `host._explActionsAttachees`.
  - Tests : `adoption-maquette-326`, `derivation-maquette-326` (dont garde-fou), `exploration-maquette-filtre-326`,
    `exploration-hygiene-326`, `exploration-arbre-securite-326` (idempotence + garde-fou),
    `sentinelle-migration-maquette-326`. Break-testés. **CSS internes** `exploration-noeud--essai`/
    `exploration-tag-essai` conservées (tokens de style, non user-facing).
  - **RESTE R2, R4…R6** : R2 générateur de profils depuis l'échelle ; R4 tableau lecture seule
    (source + construction + résultat + lien formulaire #319) — **préalable #343 (b)+(c)** pour la
    colonne DEN ; R5 nettoyage UI D-2…D-5 ; R6 terrain + release 1.19.0.

- **R3 LIVRÉ (17 juin 2026) — extracteur « config résolue → attributs de construction par famille » (pur).**
  Module `js/pratiques/construction-attributs.js` (`window.ConstructionAttributs.extraire(config)`),
  lecture seule, testable sans DOM. Produit les **lignes de construction** du tableau R4
  (RELAIS §4.3.4) : **ancres toujours présentes** (`AXES_ANCRES` = pondération / reprises /
  nb de productions) puis attributs **family-specific** (STD : méthode de sélection, composantes,
  mode note finale, échelle ; SPE : seuil d'acceptabilité, forfaits, échelle, reprises=jetons ;
  SOM : règles spéciales, reprises=select ; DEN : note=jugement, suggestion, cibles, échelle/grille
  « à venir #343 »). Lit la config **résolue** (plat + `configuration.*`). **Applique le constat R1**
  (§4.5) : STD ne liste **pas** de jetons. R4 alignera les colonnes par `axe` (« s.o. » si absent).
  Repli neutre (config vide → ancres « — », jamais d'exception). Test `construction-attributs-326`
  (12 cas, break-testé). **RESTE R4…R6.**

- **R2 + INJECTION MÉMOIRE LIVRÉS (17 juin 2026).**
  - **R2** : `js/pratiques/profils-types-generateur.js` (`ProfilsTypesGenerateur.genererCorpus(echelle, options)`),
    pur + **déterministe** (profils FIXES, §4.8). `N niveaux → N profils ancrés` (trajectoires NON
    plates, libellés tirés de l'échelle) **+ 1 « irrégulier »** (maîtrise tardive). Corpus de
    productions partagé (exercices + 1 terminale) ; **scénarios de reprise sur exercices seulement**
    (pas la terminale). Notes dérivées de `valeur_pourcentage`. Forme calée sur les enregistrements
    réels → consommable par le moteur. Sortie `{ profils, productions, evaluations }`.
  - **Injection (approche A)** : `simulerIndices(da, pratiqueId, donnees?)` — si un corpus
    `{evaluationsSauvegardees, productions}` est fourni, le moteur calcule **dessus** (lecture seule,
    try/finally, aucune écriture, aucune bascule de contexte). Mécanisme dans `modes.js` :
    `definirContexteSimulation`/`effacerContexteSimulation`/`obtenirDonneesSimulationOuNull` ;
    `obtenirDonneesSelonMode` intercepte les clés simulables (évaluations/productions) **avant** la voie
    normale. **Param absent ⇒ parité historique stricte** (golden master inchangé). Les 3 lectures
    directes de productions du chemin de calcul de `pratique-pan-standards.js` sont routées par
    l'injection (repli `db.getSync` inchangé hors simulation). Seules évaluations+productions sont
    simulées ; la **config des pratiques + les échelles** restent lues du stockage réel.
  - Tests : `profils-types-generateur-326` (9), `simulation-injection-326` (8), break-testés. 823 verts.
  - **R4a LIVRÉ (17 juin 2026)** — le banc tourne sur les **profils fictifs générés (R2)** injectés,
    **par défaut, sans mode démo** (résout RELAIS §1.3/§1.4). `comparateur-pratiques.js` : `_corpusActif`/
    `_corpusInjection`/`_profilsActifs`/`_echelleActiveComparateur` (échelle de la pratique de réf, sinon
    1ʳᵉ échelle) ; `_note`/`_carteRecit` injectent le corpus dans `simulerIndices` ; `_donnees` lit le
    corpus ; garde « mode démo » → « corpus disponible » (repli `construireInvitationEchelle`).
    `genererCorpus` stampe `echelleId` sur les évals. Test `comparateur-source-fictive-326` (8, statique,
    break-testé). ⚠️ **Rendu non vérifiable en cloud → terrain.** `construireInvitation`/`activerDemoEtOuvrir`
    = code de transition (retrait R5).
  - **RESTE R4b** (colonnes paires sans réf + lignes de construction R3 + lien formulaire #319 + source
    réelle) ; **R5** nettoyage ; **R6** terrain + release 1.19.0.

---

## 13. Coordination

| Skill / doc | Quand |
|---|---|
| le skill `labo-codex` §5 | aperçu des familles, identifiants, place des pratiques dans l'app |
| le skill `ecosysteme-classe` | **UNE instanciation** (la pratique STD de Grégoire) — exemple de référence, **pas** la doctrine ni le panorama des familles. ⚠️ recadrage prévu (`plans de travail/PLAN_recadrage_skill_ecosysteme.md`) : au 5 juin il présente encore « PAN » ≈ son STD et une posture SOM/PAN partisane — ne pas en tirer de doctrine. |
| le skill `depistage-rai` | indices A-C-P, portraits, interventions |
| `docs/architecture/…` PLAN_architecture_pratiques_SSOT §7 | décisions SSOT des pratiques, séquence des sessions #303 |

**Sources du §2 bis** (corpus pratique/recherche, archivé hors dépôt dans le dossier Cowork
« description des pratiques de notation/ » — la synthèse exploitable est **inlinée au §2 bis**
pour rester accessible à Claude Code) : Grading for Growth (Talbert & Clark — Four Pillars,
Standards or specifications?, Whoops, Reasonable reassessments, Heart of the loop, media guide
to ungrading, Mythbusters) ; CoP-PAN (Poulin-Lamarre & Langlois, dénotation au Cégep de
Sherbrooke) ; Blum (2020) *Ungrading* ; Dyer (équité) ; CSÉ 2018 *Évaluer pour que ça compte
vraiment*.

---

## HISTORIQUE

| Date | Changement |
|------|------------|
| 2026-09-18 (#921) | **Une sommative CONFIGURABLE a son récit, et le profil l'affiche.** `PratiqueConfigurable.decrireCalcul` délègue à `PratiqueSommative.decrireCalcul` pour `moyenne_ponderee` (note = `_calculerPerformanceSommative`, verrou #897 compris ; `synthese.plafonnement = { moyenneOriginale }` quand il a joué). Le récit SOM porte `ponderation` et `poids` en nombres. Le profil rend la carte par `_genererNoteSessionSommative` quand `calculerDetailsNoteFinale` rend null. ⚠ `simulerIndices(da)` SANS id rend `null` (le §7 laisse croire à un repli sur la pratique active : il n'existe pas) — passer `obtenirPratiqueActiveGroupeCours()`. |
| 2026-09-17 (#898, lot 34, 1.142.31) | **§10 : adopter un modèle Standards sans échelle demande l'échelle** — deux gestes vivants (assistant, bibliothèque), une seule question (`demanderEchelleAdoption`, `uiDialogues.demanderChoix`), parité profil / export / Comparateur prouvée ; cas d'arrêt #909. |
| 2026-06-28 (#326 CLOS, 1.26.0) | **Comparateur RÉACTIVÉ (`COMPARATEUR_VISIBLE=true`), PR #73 mergée (squash `495cd99a`), constats terrain T1-T5 traités.** Décisions Grégoire : (1) une note STD non constructible rend `null` (« non constructible »), plus jamais un `0` trompeur — `simulerIndices` discrimine par FAMILLE (`obtenirCode()==='STD'`), le repli `calculerPerformance` ne masque plus l'échec STD (préserve SOM/SPE/DEN ; sentinelle 12 cas break-testée) ; (2) dérivation d'une maquette → créer + atterrir sur l'arbre SANS wizard ; (3) T3 : cause réelle = mismatch de FORME (copies en `.config` seul) → `dupliquerPratique`/`deriverMaquette` écrivent la forme CANONIQUE (sentinelle 4 cas). ⚠ `simulerIndices` alimente AUSSI l'export des résultats finaux — vérifié : les 4 pratiques STD abouties construisent 100 % des notes réelles. Journal antérieur (R1-R6, 1.19.0) = étapes intermédiaires, supersédées par cette clôture. |
| 2026-06-16 (#343 descriptions) | **Malentendu DEN corrigé dans les descriptions.** §2 bis (DEN) : « standards/specs implicites » → « doivent rester explicites » (cf. #343). 5 sites UI alignés (gabarits-utils, accompagnement terme/popup, wizard type + bannière). Reste #343 (b)+(c) modèle/formulaire (DEN porte échelle/grille optionnelles). |
| 2026-06-17 (#326 R4b/R5/R6) | **Banc de décision — code COMPLET, release 1.19.0 préparée.** R4b : colonnes paires (sans réf, maquettes incluses) + section « Construction de la note » (R3, alignée par axe, « s.o. ») + section « Résultat » + lien par colonne vers le formulaire #319 + source fictif/réel + « Comparer » depuis l'arbre injecte une colonne. R5 : retrait du code démo mort (PROFILS/PHRASES_CONTEXTE/MICROCOPY_E1/estEnDemo/construireInvitation/activerDemoEtOuvrir). R6 : bump 1.19.0 + changelog. Tests `comparateur-banc-r4b-326` (11). ⚠️ Rendu UI = validation terrain (porte avant merge). |
| 2026-06-17 (#326 R4a) | **Banc de décision — R4a : le banc tourne sur les profils fictifs générés (R2) injectés, sans mode démo.** `comparateur-pratiques.js` : `_corpusActif`/`_corpusInjection`/`_profilsActifs`/`_echelleActiveComparateur` ; `_note`/`_carteRecit`/`_donnees` consomment le corpus ; garde démo → corpus disponible. `genererCorpus` stampe `echelleId`. Test 8 cas (statique) break-testé. Rendu = terrain. Reste R4b (colonnes paires + lignes construction R3 + lien formulaire + source réelle), R5, R6. |
| 2026-06-17 (#326 R2+inj) | **Banc de décision — R2 (générateur de profils) + injection mémoire livrés.** `ProfilsTypesGenerateur.genererCorpus(echelle)` (pur, déterministe : N profils ancrés + 1 irrégulier, reprises sur exercices, corpus partagé). `simulerIndices(da,id,donnees?)` calcule sur un corpus injecté (try/finally, lecture seule) ; mécanisme dans `modes.js` (interception `obtenirDonneesSelonMode` des clés évaluations/productions) ; param absent ⇒ parité moteur (golden master vert). Tests 17 cas break-testés. Reste R4 (UI, terrain R6). |
| 2026-06-17 (#343 b+c) | **DEN porte échelle + grille optionnelles (rétroaction formative).** §8 : `configuration.echelleId/grilleId` optionnels (n'entrent pas dans le calcul = jugement saisi ; `valider()` n'exige pas d'échelle pour `jugement_global`). Wizard : selects optionnels dans `config-denotation`, build + récap, **branche `denotation` ajoutée à `chargerPratiqueExistante`** (round-trip cibles/suggestion/échelle/grille — comble un gap pré-existant). Commentaire récap `:2140` reformulé (« sans grille IDME » retiré). R3 colonne DEN montre échelle/grille. #343 entièrement livré. |
| 2026-06-17 (#326 R3) | **Banc de décision — R3 livré : extracteur d'attributs de construction (pur).** Module `construction-attributs.js` (`ConstructionAttributs.extraire`) → lignes de construction par famille (ancres pondération/reprises/nb productions + family-specific), lit la config résolue, applique le constat R1 (STD sans jetons), repli neutre. Test 12 cas break-testé. Alimente R4. |
| 2026-06-16 (#326 R1) | **Banc de décision — R1 livré : maquette (modèle + cycle de vie) + fix bug.** Renommage zéro-dette « essai »→« maquette », « promouvoir »→« adopter » : champ `estEssai`→`estMaquette` (migration boot), `adopterMaquette`/`deriverMaquette`/`filtrerParMaquette`/`estMaquette`, moteur pur `trierMaquettes`/`filtrerMaquettes`/`maquetteDormante`. Garde-fou « max 1 dérivé » (pas de dérivé-de-dérivé). Fix bug « Pratique introuvable » (listener d'arbre accumulé → garde idempotente `host._explActionsAttachees`). §5 + §12 à jour. Reste R2…R6 (préalable #343 (b)+(c) pour la colonne DEN de R4). Source unique : RELAIS-326. |
| 2026-06-15 (#326 D-2/D-3) | **Exploration des pratiques — UI arbre + dérivation livrées.** §12 État : filtre `estEssai` (helpers `BibliothequeUI.estEssai`/`filtrerParEssai` + sites de présentation) ; label `config.js` → « Exploration des pratiques » ; `promouvoirPratiqueEssai` (estEssai→false, inspireDe intact) ; `deriverVarianteEssai` (nom auto, dupliquerPratique{estEssai,silencieux} + assistant) ; arbre dans `comparateur-pratiques.js` (deux régions : arbre des essais + matrice). Reste D-4 (matrice/diff + Comparer), D-5 (hygiène/#320), D-6 (terrain + release). |
| 2026-06-15 (#333 Lot 1) | **Export des résultats finaux — récit de calcul DEN.** §8 : `PratiqueConfigurable.decrireCalcul` (jugement_global) comble le dernier trou du récit unifié de `simulerIndices` (DEN avait `recit=null`). Re-scoping acté : l'« API unifiée de décomposition » du plan #333 (10 juin) **existe déjà** (`simulerIndices(da,id)` → `{noteFinale, recit, details}` + `decrireCalcul` par famille) ; pas de nouvelle méthode IPratique (zéro-dette). Le module d'export (Lot 2/3) consommera `simulerIndices` + `obtenirPratiqueParId`. |
| 2026-06-15 (axe D, D-0/D-1) | **Exploration des pratiques — moteur pur livré (#326).** §5 : champs d'enveloppe `inspireDe.sourceId` (transversal, posé par `forgerInspireDe`, validé par `SCHEMA_INSPIRE_DE`) + `estEssai` (opt-in via `dupliquerPratique`). §12 : module `js/pratiques/pratiques-exploration.js` (`construireArbrePratiques`, `diffConfigsPratiques`, `phraseEffetPourDiff`, `diffPratiques`), lecture seule, pur ; mapping d'effets PROVISOIRE (à valider Grégoire) + repli neutre. D-2→D-6 restent à livrer (UI/nav, préalable #320). |
| 2026-06-08 (DEN-4) | **DEN couche 2 implémentée (#318).** §8 réécrit (jugement saisi, collection `jugementsDenotation` SSOT, moteur `_calculerPerformanceDenotation`, garde cibles → 59, helper `suggererNoteHolistique`, non-simulable/diffable, PRÉN) ; §9 5ᵉ cas de diagnostic. Lots DEN-0→DEN-3 livrés ; DEN-4 = doc + diagnostic ; DEN-5 = release. |
| 2026-06-08 (Cowork) | §12 : pointeur vers l'axe D (« Exploration des pratiques » : variantes/souche, diff de config, `estEssai`, DEN diffable-non-simulable ; SPEC_D, #326). Référence seulement — §3/§5/§8/§12 à mettre à jour au fil des lots D. |
| 2026-06-06 (Cowork) | §12 finalité réancrée : « sortir du **paradigme du cumul** », **pas** « quitter SOM » (align. SPEC_comparateur §1 bis + *Gateways*), pour lever la tension avec le pluralisme. |
| 2026-06-05 (Cowork) | Ajout du **§2 bis** (ancrage recherche/pratique + écarts code ; corpus GfG/CoP/Blum/Dyer/CSÉ) ; posture pluraliste explicite ; caveat `P` « commodité ≠ équivalence » (§7) ; entrée Sources + recadrage Ecosysteme (§13). |
| 2026-06-05 | Création (lecture de code, Comparateur #307/C0) : moteur, résolution, deux systèmes de calcul, `simulerIndices`, schéma des configs, pièges. Acte le fold `pan-objectifs → standards` et la garde STD de `calculerDetailsNoteFinale`. |
