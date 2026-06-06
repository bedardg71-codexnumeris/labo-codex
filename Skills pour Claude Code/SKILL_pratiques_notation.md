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
  Pour le CADRE PÉDAGOGIQUE des PAN (ce que chaque pratique mesure, pourquoi) :
  SKILL_Ecosysteme_classe.md. Pour l'assistant de configuration : voir BACKLOG
  #317 (livré) / #319 (refonte).
---

# SKILL : Pratiques de notation — Architecture et moteur de calcul

> **Dernière mise à jour** : 5 juin 2026 (établi par lecture de code lors du démarrage
> du Comparateur de pratiques, lot C0).
> **Nature** : volet **technique**. Le « quoi » et le « pourquoi » pédagogiques sont
> dans SKILL_Ecosysteme_classe ; l'aperçu des familles est dans SKILL_labo_codex §5.
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
| DEN | `denotation` | `--den-violet` | PAN | Jugement global qualitatif | — | **non implémenté (#318)** |

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
  badge DEN serait inatteignable tant que #318 n'est pas fait.

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

## 12. Le Comparateur de pratiques (chantier en cours, 5 juin 2026)

Vue d'**aide à la transition SOM → PAN** : montrer ce que la note d'un profil-type
deviendrait sous d'autres pratiques, sur les **mêmes** artefacts. Principe (Grégoire) :
« montrer les effets, pas les faire deviner ; le chemin qui mène au chiffre importe plus
que le chiffre ». Ne recommande jamais ; débouche sur l'assistant.

- **Moteur réutilisé tel quel** : `simulerIndices` + `calculerDetailsNoteFinale` (le
  Comparateur est un **consommateur**, aucune écriture).
- **Phase 1 = données démo**, familles SOM + STD + SPE (DEN reporté #318).
- **Spécs** : `plans de travail/SPEC_comparateur_pratiques.md` ;
  `plans de travail/NOTE-CONCEPTION-C0-comparateur.md` (configs candidates, profils-types,
  plan de seed) ; outil `plans de travail/campagne-C0-diagnostic.js`.
- **Leçon C0** : la démo ne portait aucune pratique PAN configurée → STD tombait en
  fallback, SPE rendait une note constante. Pour comparer des familles, il faut des
  pratiques **réellement configurées** (schéma §5) sur des données qui exercent leur logique.

---

## 13. Coordination

| Skill / doc | Quand |
|---|---|
| SKILL_labo_codex §5 | aperçu des familles, identifiants, place des pratiques dans l'app |
| SKILL_Ecosysteme_classe | cadre pédagogique des PAN, IDME/SRPNF, ce que chaque pratique mesure |
| SKILL_RaI | indices A-C-P, portraits, interventions |
| `docs/architecture/…` PLAN_architecture_pratiques_SSOT §7 | décisions SSOT des pratiques, séquence des sessions #303 |

---

## HISTORIQUE

| Date | Changement |
|------|------------|
| 2026-06-05 | Création. Établi par lecture de code lors du démarrage du Comparateur (#307 / C0) : moteur de calcul, résolution, deux systèmes de calcul, `simulerIndices`, schéma exécutable des configs, représentations canoniques (Session B), pièges vérifiés. Acte le fold `pan-objectifs → standards` (Session C Lot 4) et la garde STD de `calculerDetailsNoteFinale`. |
