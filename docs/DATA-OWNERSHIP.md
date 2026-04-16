# Registre de propriete des cles de stockage

> **Version** : Beta 99.03 (3 avril 2026)
> **Source** : Audit SSOT du 2 avril 2026 + verification code du 3 avril
> **Objectif** : Documenter qui a le droit d'ecrire dans chaque cle pour prevenir les violations SSOT.

---

## Conventions

- **Proprietaire** : le module qui CREE et MET A JOUR la donnee canonique. Un seul par cle.
- **Lecteurs** : modules qui lisent via `obtenirDonneesSelonMode()` ou `db.getSync()`.
- **Contourneurs** : modules qui ecrivent directement sans passer par le proprietaire. A migrer vers des API du proprietaire (Tier 6.4).
- **NS** : namespacee par trimestre (via `cle('nomCle')`). **G** : globale.

---

## Donnees etudiantes (critiques)

| Cle | NS/G | Proprietaire | Lecteurs principaux | Contourneurs | Taille |
|-----|------|-------------|---------------------|-------------|--------|
| `groupeEtudiants` | NS | `trimestre-v2.js` | evaluation, travaux-import, indices, profil-etudiant, interventions | migrations (direct setSync) | < 200 Ko |
| `evaluationsSauvegardees` | NS | `evaluation.js` | liste-evaluations, profil-etudiant, travaux-resolution, export-pdf | import-export (bulk import) | ~1.2 Mo (IDB) |
| `presences` | NS | `saisie-presences.js` | indices, profil-etudiant, presences-apercu | **interventions.js**, **profil-etudiant.js** | < 200 Ko |
| `fichiersTravaux` | NS | `travaux-stockage.js` | travaux-ui, travaux-export-pdf | travaux-import (blobs directs) | ~3.8 Mo (IDB) |
| `annotationsTravaux` | NS | `travaux-stockage.js` | travaux-ui, travaux-export-pdf | — | < 200 Ko |
| `corbeilleFichiers` | NS | `travaux-stockage.js` | travaux-ui | — | < 200 Ko |
| `portfoliosEleves` | NS | `portfolio.js` | indices, profil-etudiant | — | < 200 Ko |
| `interventions` | NS | `interventions.js` | evaluation, trimestres | primo-modal | < 200 Ko |

---

## Structure pedagogique (templates)

| Cle | NS/G | Proprietaire | Lecteurs principaux | Contourneurs | Taille |
|-----|------|-------------|---------------------|-------------|--------|
| `productions` | NS | `productions.js` | evaluation, travaux-ui, export-pdf | primo-modal, import-export | < 200 Ko |
| `grillesTemplates` | G | `grilles.js` | evaluation, grilles-bibliotheque, export-pdf | **import-export**, **primo-modal**, **donnees-demo**, **spe-specifications** | < 200 Ko |
| `echellesTemplates` | G | `echelles.js` | evaluation, echelles-bibliotheque | **import-export**, **primo-modal**, **donnees-demo** | < 200 Ko |
| `cartouches_[grilleId]` | G | `cartouches.js` | evaluation, cartouches-bibliotheque | import-export, primo-modal | < 100 Ko |
| `pratiquesConfigurables` | G | `pratiques.js` | evaluation, wizard-pratique-v2 | import-export, primo-modal, wizard | < 200 Ko |
| `modalitesEvaluation` | NS | `evaluation.js` | horaire, tous les modules d'evaluation | **25+ modules** (violation #1, reportee post-AQPC) | < 50 Ko |

---

## Indices (donnees calculees)

| Cle | NS/G | Proprietaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `indicesCP` | NS | `portfolio.js` | indices, evaluation, profil-etudiant, etudiants | Source unique C/P/E. Calcul via `calculerEtStockerIndicesCP()` |
| `indicesAssiduite` | NS | `indices.js` | indices, evaluation, profil-etudiant | Source unique A. Calcul via `calculerEtSauvegarderIndicesAssiduite()` |
| `indicesEvaluation` | NS | ~~aucun~~ | ~~aucun~~ | **ORPHELINE** — ecritures supprimees Tier 6.2 (3 avril 2026) |

---

## Planification et calendrier

| Cle | NS/G | Proprietaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `calendrierComplet` | NS | `trimestre.js` | calendrier-vue, saisie-presences, productions | Pattern exemplaire : un seul ecrivain (ligne ~842) |
| `cadreCalendrier` | NS | `trimestre.js` | horaire, productions, snapshots | |
| `horaireHebdo` | NS | `horaire.js` | calendrier-vue, saisie-presences, organisateur | |
| `planification_mindmap` | NS | `planification-donnees.js` | planification-carte, planification | |
| `snapshots` | NS | `snapshots.js` | trimestres, trimestre | Cle composite : `h2026_snapshots_[coursId]` |
| `groupesCours` | NS | `trimestres.js` | organisateur, travaux-ui, modes | |

---

## Configuration et preferences

| Cle | NS/G | Proprietaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `profilEnseignant` | G | `cc-license.js` | export-pdf, bibliotheques | Auteur pour metadonnees CC |
| `preferencesUtilisateur` | G | `preferences.js` | tous les modules UI (via `obtenirPreference`/`definirPreference`) | Source unique pour 23 preferences (anciens `preferencesAffichage` + 5 champs de `modalitesEvaluation`). Migration V3 + nettoyage legacy automatiques. |
| `modeApplication` | G | `modes.js` | tous les modules (via obtenirDonneesSelonMode) | `'normal'` ou `'anonymisation'` |
| `cours` | G | `cours.js` | large usage (lookup cours) | Cle legacy `listeCours` = fallback |
| `enseignants` | G | `enseignants.js` | export-pdf, primo-questions | |
| `groupeCoursActif` | G | `trimestre-v2.js` | evaluation, horaire, travaux-ui, filtrage | |

---

## Bibliotheques (partage entre collegues)

| Cle | NS/G | Proprietaire | Notes |
|-----|------|-------------|-------|
| `bibliothequeGrilles` | G | `grilles-bibliotheque.js` | |
| `bibliothequeEchelles` | G | `echelles-bibliotheque.js` | |
| `bibliothequeCartouches` | G | `cartouches-bibliotheque.js` | |
| `bibliothequeProductions` | G | `productions-bibliotheque.js` | |
| `bibliothequeAlignements` | G | `planification-bibliotheque.js` | |

---

## Patterns exemplaires (a reproduire)

### 1. `calendrierComplet` — Un seul ecrivain
`trimestre.js:842` est le seul module qui ecrit dans cette cle. Tous les autres (calendrier-vue, saisie-presences, productions) lisent uniquement. Zero risque de donnees incoherentes.

### 2. `indicesAssiduite` — Calcul + stockage centralise
`indices.js:260` (`calculerEtSauvegarderIndicesAssiduite()`) est le seul point d'ecriture. Le calcul et le stockage sont dans la meme fonction. Les lecteurs obtiennent toujours un resultat coherent.

### 3. `indicesCP` — Source unique pour C/P/E
`portfolio.js:719` (`calculerEtStockerIndicesCP()`) centralise le calcul des trois indices. Tous les modules (profil, tableau de bord, evaluations) lisent depuis cette source unique au lieu de recalculer.

---

## Violations connues (a corriger)

| # | Cle | Severite | Description | Plan |
|---|-----|----------|-------------|------|
| #1 | `modalitesEvaluation` | CRITIQUE | 25+ ecrivains, 36 lecteurs | Reporte post-AQPC (trop risque) |
| #2 | `grillesTemplates` | HAUTE | API `importerGrillesExternes()` creee | Tier 6.4 — API en place, migration contourneurs en cours |
| #3 | `echellesTemplates` | HAUTE | API `importerEchellesExternes()` creee | Tier 6.4 — API en place, migration contourneurs en cours |
| #5 | ~~`presences`~~ | ~~MOYENNE~~ | ~~2 contourneurs~~ | **CORRIGE** Tier 6.4 (3 avril 2026) — API `modifierNotesPresence()` + `ajouterPresencesIntervention()` |
| #7 | ~~`calculerTauxCompletion`~~ | ~~MOYENNE~~ | ~~Recalcul divergent de l'indice C~~ | **CORRIGE** Tier 6.1 (3 avril 2026) |
| #9 | ~~`_moyennesQualifies`~~ | ~~FAIBLE~~ | ~~Cache jamais invalide~~ | **CORRIGE** Tier 6.3 (3 avril 2026) |

---

## Architecture de stockage

```
Petites cles (< 200 Ko)
  localStorage = source de verite
  IDB = backup asynchrone

Grosses cles (> 200 Ko) : fichiersTravaux, evaluationsSauvegardees
  IDB + memoryCache = source de verite
  localStorage = cache synchrone (si quota le permet)

Filtrage par cours/mode :
  obtenirDonneesSelonMode('cle')  → lecture filtree
  sauvegarderDonneesSelonMode('cle', data) → ecriture protegee (bloque en anonymisation)

Namespacing par trimestre :
  cle('presences') → 'h2026_presences'
  Liste des cles namespacees : trimestres.js lignes 40-80
```

---

**Derniere mise a jour** : 3 avril 2026
