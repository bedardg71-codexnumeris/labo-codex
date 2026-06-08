---
name: pratiques-notation
description: >
  Utiliser ce skill pour tout travail TECHNIQUE sur les pratiques de notation de
  Labo Codex : moteur de calcul de la note, résolution d'une pratique, simulation
  et comparaison (#307 / Comparateur), familles SOM/STD/SPE/DEN, configs
  exécutables, badges et représentations. Déclencher dès qu'un chantier touche
  `js/pratiques/`, `calculerDetailsNoteFinale`, `simulerIndices`,
  `obtenirPratiqueParId`, `pratiquesConfigurables`, ou le calcul de l'indice P.
  Pour l'APERÇU des familles et l'architecture générale : SKILL_labo_codex §5.
  Ce skill ancre aussi le moteur dans la pratique et la recherche documentées (§2 bis)
  et signale les écarts entre le code et ce que la recherche propose — il ne se limite
  pas à décrire l'app. Pour l'instanciation de référence de Grégoire : SKILL_Ecosysteme_classe.
  Pour l'assistant de configuration : voir BACKLOG #317 (livré) / #319 (refonte).
---

# SKILL : Pratiques de notation — Architecture et moteur de calcul

> **Dernière mise à jour** : 5 juin 2026 (établi par lecture de code lors du démarrage
> du Comparateur de pratiques, lot C0 ; §2 bis ajouté le même jour — ancrage recherche/pratique).
> **Nature** : volet **technique**, mais **pas un simple miroir du code**. Le §2 bis ancre
> chaque famille dans la pratique et la recherche documentées (corpus GfG + CoP-PAN) et
> nomme les **écarts** entre le code et ce que la recherche propose. La doctrine de l'outil
> est **pluraliste** (SOM/STD/SPE/DEN, sans hiérarchie) ; `SKILL_Ecosysteme_classe` décrit
> UNE instanciation (la pratique STD de Grégoire), pas la doctrine.
> **Avertissement** : les emplacements `fichier:ligne` datent du 5 juin 2026 — les
> revérifier contre le code au moment de coder (le code bouge plus vite que ce skill).

---

## 1. Périmètre

**Couvre** : comment une note finale est calculée selon la pratique active ; comment
une pratique est résolue depuis un identifiant ; les deux systèmes de calcul coexistants ;
la simulation lecture seule (`simulerIndices`) ; les représentations (badges, codes,
couleurs) ; les pièges vérifiés.

**Ne couvre pas** : la pédagogie des pratiques (SKILL_Ecosysteme_classe), l'aperçu
descriptif des familles (SKILL_labo_codex §5), l'assistant/wizard de configuration
(`wizard-pratique-v2.js` ; bugs #131-#135 livrés en #317, refonte #319), les indices
A et C (cf. `indices.js`, `portfolio.js`).

---

## 2. Les quatre familles et leur identité canonique

| Code | Id canonique | Couleur (var CSS) | Famille | Calcul de la note | Fichier instance | État |
|------|--------------|-------------------|---------|-------------------|------------------|------|
| SOM | `sommative` | `--som-orange` | Sommative | Moyenne pondérée des évaluations | `pratique-sommative.js` | actif |
| STD | `standards` | `--std-bleu` | PAN | Portfolio (sélection de N) + terminale | `pratique-pan-standards.js` | actif |
| SPE | `specifications` | `--spe-vert` | PAN | Bundles tout-ou-rien par palier | `pratique-pan-specifications.js` | actif |
| DEN | `denotation` | `--den-violet` | PAN | Note finale par jugement certificatif sur l'atteinte de cibles (voir §2 bis) | — | **non implémenté (#318)** |

**Identifiants canoniques neutres (Session A, mai 2026)** : un seul id par pratique, sans
préfixe `pan-`. « PAN » est un **libellé de famille**, plus un préfixe technique ni un
jeton de calcul (décision 29 mai 2026). `PRATIQUE_DEFAUT = 'standards'`.

**Normalisation legacy → canonique** (`normaliserIdPratique`, `pratique-registre.js:51`,
idempotente). Table (`:35`) :

```
alternative, pan-maitrise, pan-maitrise-json, pan-standards, pan-objectifs → standards
pan-specifications → specifications
pan-denotation     → denotation
```

⚠️ **`pan-objectifs` a été foldé dans `standards`** (Session C Lot 4, PR #27, 5 juin 2026) :
l'instance séparée `pratique-pan-objectifs.js` (645 l.) a été **supprimée**. La variante
« par-objectifs » vit désormais dans Standards. Toute doc qui liste encore ce fichier est
périmée (c'est le cas de SKILL_labo_codex §5.2 au 5 juin).

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
  *qualité* des productions liées à des **cibles d'apprentissage** — donc reposant sur des
  standards/specs implicites (Clark). Talon d'Achille documenté (Dyer) : biais implicite sur
  l'attribution **holistique** de la note finale.
- *⚠️ Taxonomie (acté 6 juin)* : académiquement, DEN = **PRÉN** (pratique de réduction ou
  d'élimination de la notation — Girouard-Gagné et al., 2024), que la recherche **distingue**
  des **PAN** (qui renouvellent la notation : STD/SPE/maîtrise/contrat). Labo Codex **garde le
  badge famille « PAN »** pour l'UI (simplicité, suit le billet CoP qui fond la dénotation
  comme 3e famille PAN) — **mais c'est une approximation assumée**. Ne pas la prendre pour la
  réalité conceptuelle. (À documenter aussi : commentaire registre près de `denotation` ;
  guide PAN utilisateur.)
- *Code Labo Codex* : **non implémenté**. Le registre connaît le badge `DEN` et la
  normalisation `pan-denotation → denotation`, mais `deduireTypePratique` ne le produit pas.
- *Modèle DEN (conception actée 6 juin — `plans de travail/NOTE-COWORK-modele-DEN.md`)* : **un
  seul mécanisme** (note **entrée/suggérée** + **garde « cibles atteintes »**) exposé en
  **trois modes ancrés sur la gradation** Girouard-Gagné — (1) note **différée/masquée**
  (entrée prudente : la rétroaction avant le chiffre), (2) note **réduite** (réussi-échoué sur
  des épreuves + différenciation), (3) note **éliminée** (jugement narratif → note
  certificative). Principe : DEN abandonne la fonction de **tri** de la note, garde la
  **certification** (RREC). **Jamais « pas de chiffre ».** Garde-fou Dyer + santé mentale
  (Girouard-Gagné : certains étudiants déstabilisés par l'absence de repères) : traces +
  critères explicites obligatoires ; ne pas vendre DEN comme un bien universel. Sources :
  Girouard-Gagné et al. (2024), billet CoP dénotation (Poulin-Lamarre & Langlois), Blum (2020), Dyer.

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

`pratique-registre.js:487` (exposé `window.obtenirPratiqueParId`). Ordre :

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

`obtenirConfigPratiqueActive(pratiqueId)` (`portfolio.js:1087`) renvoie `configuration`.
Sans `pratiqueId`, repli sur la pratique active du groupe-cours.

**STD** (lu par `_obtenirConfigPortfolioCalcul`, `profil-etudiant-actions.js:195`) :
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

**Source canonique** : depuis la **Phase G2-a (24 mai 2026)**, la config portfolio est lue
**uniquement** depuis `pratiquesConfigurables`. Plus de fallback sur
`modalitesEvaluation.configPAN.portfolio` (qui driftait à l'édition wizard).

---

## 6. Les DEUX systèmes de calcul de la note (crucial)

Deux chemins coexistent — c'est la source de la plupart des surprises.

| | Chemin procédural | Instances IPratique |
|---|---|---|
| **Fonction** | `calculerDetailsNoteFinale(da, pratiqueId)` | `pratique.calculerPerformance(da)` |
| **Lieu** | `profil-etudiant-actions.js:403` | chaque `js/pratiques/pratique-*.js` |
| **Familles** | **STD uniquement** (`return null` si non-STD, `:420`) | toutes (chacune la sienne) |
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

`portfolio.js:714` (exposé `window.simulerIndices`, Lot 5). Miroir **sans effet de bord**
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

## 8. Calcul par famille (résumé technique)

- **SOM** (`pratique-sommative.js:63`) : moyenne pondérée de **toutes** les évaluations
  actives de l'étudiant (`!remplaceeParId`, note non nulle), pondérée par
  `production.ponderation || 1`. Indice = moyenne / 100.
- **STD** (`calculerDetailsNoteFinale`) : sélectionne `nombreARetenir` artefacts (méthode
  configurée) parmi les `type === 'artefact-portfolio'`, moyenne le portfolio, agrège avec
  la terminale selon pondérations. Reprises = le dernier essai non remplacé est retenu.
- **SPE** (`pratique-pan-specifications.js:158`) : compte les travaux **acceptables** par type
  (`_estTravailAcceptable` = `noteFinale >= seuilAcceptable`, défaut 60), puis trouve le
  palier le plus élevé dont **tous** les `requis` sont satisfaits (logique tout-ou-rien).
- **DEN** : non implémenté. Le registre le connaît (badge `DEN`, normalisation
  `pan-denotation → denotation`) mais `deduireTypePratique` ne le produit pas encore → un
  badge DEN serait inatteignable tant que #318 n'est pas fait. **Modèle à concevoir : voir
  §2 bis** (note finale par jugement certificatif, jamais « pas de chiffre » ; garde-fou
  équité de Dyer) — ne pas se contenter de « jugement global qualitatif ».

---

## 9. Note « non calculable » : diagnostic

`_diagnostiquerNoteNonCalculable()` (`profil-etudiant-actions.js:174`, #128) rend un message
**précis** selon la cause réelle, jamais un générique :
1. aucune pratique assignée au groupe-cours ;
2. pratique assignée introuvable en bibliothèque (id obsolète, supprimée) ;
3. pratique Sommative ou Spécifications (non branchée au calcul « détail » du profil) ;
4. STD mais config portfolio incomplète.

Quand on conçoit une vue multi-pratiques, diagnostiquer **par cellule/colonne** (une
pratique non calculable n'empêche pas les autres de calculer).

---

## 10. Pièges vérifiés (gotchas)

- **`calculerDetailsNoteFinale` ne répond que pour STD** (`return null` sinon). Ne pas s'en
  servir comme calcul universel.
- **SOM pondère `production.ponderation || 1`** : une production à pondération **0** reçoit
  donc le poids **1** (et non 0). Vérifier les pondérations avant d'interpréter un écart.
- **`_identifierProductionTerminale` cherche `type === 'terminale'`** (`:222`) — une
  production `type: 'travail'` n'est **pas** vue comme terminale par STD (elle serait ignorée).
- **Config portfolio = `pratiquesConfigurables` seulement** (Phase G2-a) ; ne pas relire
  `configPAN.portfolio`.
- **SPE acceptabilité = seuil simple** (`noteFinale >= seuil`) — le code annonce « sera
  raffiné avec vraies spécifications » ; aujourd'hui ça dérive des notes existantes.
- **Schéma `pratiquesConfigurables` ≠ `{id, nom, configuration}` seul** :
  `PratiqueConfigurable.valider()` exige `id`, `nom`, `calcul_note` **à la racine** ; et
  `echelle` (racine) si `calcul_note.methode ∈ {conversion_niveaux, pan_par_objectif}`.
  `construireConfigComplete` lit bien `configuration.{type,portfolio,seuils,objectifs}`,
  mais applique `calcul_note` **défaut `conversion_niveaux`** si absent → échelle alors
  exigée. Une config réduite à `{id, nom, configuration}` échoue à l'instanciation
  (« Champ obligatoire manquant : echelle »). Vérifié 6 juin 2026 (seed démo C0).
- **SPE configurable délègue à `PratiquePanSpecifications`** (depuis 6 juin 2026) :
  `PratiqueConfigurable.calculerPerformance` cas `'specifications'` instancie une
  `PanSpecifications` jetable, la configure avec `this.config.configuration`
  (`typesTravaux`/`tableBundles`) et lui délègue le calcul par paliers. Sans cette
  délégation (état antérieur), une SPE configurable retombait sur `indicesCP.actuel.PAN.P`
  (faux — pas un calcul tout-ou-rien). `jugement_global` (DEN) garde le repli PAN.
  Sentinelle : `tests/unit/sentinelle-spe-configurable-delegation-2026-06-06.test.js`.
- **Gabarits prédéfinis ≠ configs exécutables** (§3).
- **`pan-objectifs` supprimé** (§2) ; tout id résiduel résout vers `standards`.

---

## 11. Carte des fonctions (au 5 juin 2026 — revérifier)

| Fonction | Lieu | Exposée | Rôle |
|---|---|---|---|
| `normaliserIdPratique` | `pratique-registre.js:51` | window | legacy → canonique |
| `obtenirPratiqueParId` | `pratique-registre.js:487` | window | id → instance |
| `obtenirRepresentationPratique[Stricte]` | `pratique-registre.js:86`/`:104` | window | {code, couleur, famille} |
| `genererBadgePratiqueHTML` | `pratique-registre.js:132` | window | badge SOM/STD/SPE/DEN |
| `obtenirConfigPratiqueActive` | `portfolio.js:1087` | window | config d'une pratique |
| `simulerIndices` | `portfolio.js:714` | window | C/P/note, lecture seule |
| `calculerDetailsNoteFinale` | `profil-etudiant-actions.js:403` | window | détail note STD |
| `_obtenirConfigPortfolioCalcul` | `profil-etudiant-actions.js:195` | non | lit la config portfolio |
| `_diagnostiquerNoteNonCalculable` | `profil-etudiant-actions.js:174` | non | message d'erreur précis |

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

**Axe suivant — « Exploration des pratiques » (D, conçu et validé 8 juin 2026, NON codé).**
Le §12 ci-dessus décrit la **phase 1 livrée** (C0-C4). L'axe D élargit le Comparateur en
**« Exploration des pratiques »** (sous-section du Labo) : décliner une **souche** en
**variantes d'essai**, parenté via `inspireDe.sourceId`, **diff de config** (statique →
**survit au « non calculable »**), flag `estEssai` (transitoire). **DEN y est diffable mais
NON simulable** (jugement saisi → pas de colonne note). Le Comparateur reste **consommateur
lecture seule** ; aucun nouveau chemin de calcul. Spéc canonique :
`plans de travail/SPEC_D_exploration_pratiques.md` (découpage 6 lots, préalables **#320** +
**#318**) ; backlog **#326**. ⚠️ **Ne rien documenter ici comme existant tant que le code
n'est pas livré** : les §3/§5/§8/§12 seront mises à jour **au fil des lots D**, avec le code.

---

## 13. Coordination

| Skill / doc | Quand |
|---|---|
| SKILL_labo_codex §5 | aperçu des familles, identifiants, place des pratiques dans l'app |
| SKILL_Ecosysteme_classe | **UNE instanciation** (la pratique STD de Grégoire) — exemple de référence, **pas** la doctrine ni le panorama des familles. ⚠️ recadrage prévu (`plans de travail/PLAN_recadrage_skill_ecosysteme.md`) : au 5 juin il présente encore « PAN » ≈ son STD et une posture SOM/PAN partisane — ne pas en tirer de doctrine. |
| SKILL_RaI | indices A-C-P, portraits, interventions |
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
| 2026-06-05 | Création. Établi par lecture de code lors du démarrage du Comparateur (#307 / C0) : moteur de calcul, résolution, deux systèmes de calcul, `simulerIndices`, schéma exécutable des configs, représentations canoniques (Session B), pièges vérifiés. Acte le fold `pan-objectifs → standards` (Session C Lot 4) et la garde STD de `calculerDetailsNoteFinale`. |
| 2026-06-05 (Cowork) | Ajout du **§2 bis** (ancrage recherche/pratique des 4 familles + écarts code ; corpus GfG/CoP/Blum/Dyer/CSÉ inliné) suite au constat que le skill ne faisait que miroiter le code. Retouches : nature « pas un simple miroir », posture pluraliste explicite ; ligne DEN de la table requalifiée (plus « jugement global qualitatif ») ; caveat sur `P` « commodité ≠ équivalence » (§7) ; renvoi §8 DEN → §2 bis ; entrée Sources + recadrage prévu d'Ecosysteme (§13). |
| 2026-06-08 (Cowork) | Ajout au **§12** d'un **pointeur vers l'axe D** (« Exploration des pratiques » : variantes/souche, `inspireDe.sourceId`, diff de config, `estEssai`, DEN diffable-non-simulable ; SPEC `SPEC_D_exploration_pratiques.md`, backlog #326). **Référence seulement** — aucune description de code inexistant ; §3/§5/§8/§12 à mettre à jour au fil des lots D, avec le code. |
| 2026-06-06 (Cowork) | §12 finalité réancrée : « sortir du **paradigme du cumul** » (la note n'est pas un score additionné), **pas** « quitter SOM » — alignement sur SPEC_comparateur §1 bis et sur *Gateways* (viser l'idée, pas la pratique de l'enseignant), pour lever la tension avec le pluralisme affiché. Réserve forward notée pour DEN/#318 : « quelle note dit le vrai » est le cadre SBG ; Blum/ungrading reframe (la vérité vit dans le portfolio, pas dans un chiffre unique) — déjà porté par le §2 bis. |
