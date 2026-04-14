# Audit des pratiques de notation — Labo Codex

**Date** : 14 avril 2026
**Portee** : Sommative, PAN-Standards, PAN-Specifications
**Objectif** : Valider la coherence et la fonctionnalite avant ajout de PAN-Denotation

---

## Verdict global

**Les 3 pratiques sont fonctionnelles et architecturalement solides.**
Le systeme est modulaire (interface + registre + implementations isolees), les calculs sont coherents (echelle 0-1 partout), et les alias legacy sont partiellement migres. Quelques problemes de nommage a resoudre.

---

## 1. Architecture

### 1.1 Fichiers du systeme

| Fichier | Lignes | Role |
|---|---|---|
| `js/pratiques/pratique-interface.js` | 299 | Contrat IPratique (methodes obligatoires) |
| `js/pratiques/pratique-registre.js` | 470+ | Registre central, detection pratique active, alias |
| `js/pratiques/pratique-manager.js` | 240+ | Gestion pratiques configurables (JSON) |
| `js/pratiques/pratique-sommative.js` | 730 | Implementation sommative |
| `js/pratiques/pratique-pan-standards.js` | 1619 | Implementation PAN-Standards |
| `js/pratiques/pratique-pan-specifications.js` | 682 | Implementation PAN-Specifications |
| `js/pratiques.js` | 5418 | UI principale, configuration, bibliotheque |
| `js/pratique-notation-v2.js` | 2000+ | Interface expert de configuration |
| `js/pratiques-materiel.js` | 1000+ | UI Material Design |

### 1.2 Interface IPratique (contrat)

Toute pratique doit implementer :

| Methode | Retour | Statut |
|---|---|---|
| `obtenirNom()` | string | Implemente x3 |
| `obtenirId()` | string | Implemente x3 |
| `obtenirDescription()` | string | Implemente x3 |
| `calculerPerformance(da)` | 0-1 ou null | Implemente x3 |
| `calculerCompletion(da)` | 0-1 ou null | Implemente x3 |
| `detecterDefis(da)` | object | Implemente x3 |
| `identifierPattern(da)` | object | Implemente x3 |
| `genererCibleIntervention(da)` | object ou null | Implemente x3 |

---

## 2. Pratiques implementees

### 2.1 Sommative traditionnelle

| Aspect | Detail |
|---|---|
| **ID** | `sommative` |
| **Classe** | `PratiqueSommative` |
| **Calcul P** | Moyenne ponderee de TOUTES les evaluations actives. `scoreTotal / pondTotal / 100` |
| **Calcul C** | `productionsRemises / productionsEvaluees` |
| **Config** | Aucune (ponderations sur les productions) |
| **Alias legacy** | Aucun |
| **Statut** | COMPLET |

### 2.2 PAN par standards (Standards-Based Grading)

| Aspect | Detail |
|---|---|
| **ID** | `pan-standards` |
| **Classe** | `PratiquePANStandards` |
| **Calcul P** | N meilleurs artefacts du portfolio. Methodes : `meilleurs`, `recents`, `recents-meilleurs`, `tous` |
| **Calcul C** | `travauxRemis / travauxAssignes` |
| **Variantes** | Mode portfolio (defaut) OU mode par objectifs (4 sous-modes : comptage, moyenne, seuils, holistique) |
| **Config riche** | Portfolio (methode, N artefacts, categories), jetons (delai, reprise), ponderation terminale |
| **Alias legacy** | `pan-maitrise`, `alternative` (migres dans registre.js) |
| **Statut** | COMPLET |

### 2.3 PAN par specifications (Specifications Grading / Contrat)

| Aspect | Detail |
|---|---|
| **ID** | `pan-specifications` |
| **Classe** | `PratiquePanSpecifications` |
| **Calcul P** | Evaluation binaire (acceptable/non acceptable) → palier de note fixe par bundles. `noteAtteinte / 100` |
| **Calcul C** | `totalAcceptable / totalAttendu` |
| **Config riche** | Types de travaux (seuils, specifications), table de bundles (note fixe + requis), jetons, seuils reussite/excellence |
| **Modeles predéfinis** | Chimie, Simple, Litterature |
| **Alias legacy** | `specifications` |
| **Statut** | COMPLET |

---

## 3. Coherence des calculs

### 3.1 Echelle de retour (indice P)

| Pratique | Formule finale | Echelle | Coherent |
|---|---|---|---|
| Sommative | `moyennePonderee / 100` | 0-1 | OUI |
| PAN-Standards | `moyennePortfolio / 100` | 0-1 | OUI |
| PAN-Specifications | `noteAtteinte / 100` | 0-1 | OUI |

**Verdict** : Echelle 0-1 uniforme. Pas d'incoherence.

### 3.2 Points d'entree du calcul

Le calcul est centralise dans `portfolio.js` via `calculerEtStockerIndicesCP()` qui appelle :
- `pratique.calculerPerformance(da)` → indice P
- `pratique.calculerCompletion(da)` → indice C

Les resultats sont stockes dans `indicesCP` (SSOT). Aucun module ne recalcule independamment.

### 3.3 Diagnostics (defis, patterns, interventions)

Les 3 methodes diagnostiques sont implementees dans les 3 pratiques :
- `detecterDefis(da)` — retourne type + defis + forces
- `identifierPattern(da)` — retourne pattern (excellence, stable, difficulte, risque)
- `genererCibleIntervention(da)` — retourne cible personnalisee

---

## 4. Problemes identifies

### PROBLEME 1 — Alias `pan-maitrise` encore dominant (HAUTE PRIORITE)

`pratiques.js` utilise `'pan-maitrise'` dans **29 occurrences** vs seulement 4 pour `'pan-standards'`.

**Exemples** :
- Ligne 286 : `modalites.pratique || 'pan-maitrise'` (defaut)
- Ligne 358 : `pratiqueDefaut === 'pan-maitrise'`
- Ligne 540 : `if (pratique === 'pan-maitrise')`
- JSDoc lignes 218, 222, 280, 335 : documentent `'pan-maitrise'`

**Impact** : Le registre.js migre automatiquement `pan-maitrise` → `pan-standards`, mais `pratiques.js` continue de l'utiliser en dur. Fonctionnel grace a la migration, mais confus pour la maintenance.

**Correction** : Rechercher-remplacer `'pan-maitrise'` → `'pan-standards'` dans `pratiques.js` (29 occurrences). Les alias dans `registre.js` et les switch de `pratique-notation-v2.js` restent comme filet de securite.

---

### PROBLEME 2 — Alias `specifications` non migre (MOYENNE PRIORITE)

`pratique-registre.js` (lignes 219-227) migre automatiquement `'alternative'` et `'pan-maitrise'` vers `'pan-standards'`, mais ne migre PAS `'specifications'` vers `'pan-specifications'`.

**Impact** : Si des donnees anciennes utilisent `'specifications'` comme ID de pratique, elles ne seront pas auto-corrigees par le registre. Les switch dans `pratique-notation-v2.js` gerent les deux (lignes 509-511), donc le risque est limite a certains chemins de code.

**Correction** : Ajouter dans `registre.js` :
```javascript
if (idPratique === 'specifications') {
    idPratique = 'pan-specifications';
}
```

---

### PROBLEME 3 — Sommative sans section dans `pratiques-materiel.js` (BASSE PRIORITE)

Le panneau de configuration Material Design (lignes 840-898) n'a pas de branche pour la sommative :
```javascript
if (type === 'pan-standards') { ... }
else if (type === 'pan-specifications') { ... }
// Pas de else if (type === 'sommative')
```

**Impact** : Faible — la sommative n'a pas de configuration specifique (pas de portfolio, pas de bundles). L'absence de section dediee est coherente avec sa simplicite.

**Action** : Aucune correction requise. Documenter que c'est intentionnel.

---

### PROBLEME 4 — Defaut pratique inconsistant (BASSE PRIORITE)

- `pratiques.js` ligne 286 : defaut = `'pan-maitrise'`
- `pratique-registre.js` : defaut = `'sommative'` (via getPratiqueParDefaut)

**Impact** : Faible — le chemin principal passe par le registre. Mais confusion possible dans certains contextes.

**Correction** : Aligner sur `'pan-standards'` (ou `'sommative'` selon la volonte pedagogique).

---

## 5. Flux de donnees

### 5.1 Configuration

```
Enseignant choisit une pratique
    ↓
modalitesEvaluation.pratique = 'pan-standards'
modalitesEvaluation.configPAN = { portfolio: {...}, jetons: {...} }
    ↓
Stocke dans localStorage via cle('modalitesEvaluation')
```

### 5.2 Evaluation

```
Enseignant evalue un etudiant
    ↓
evaluation.js lit pratique active → charge l'echelle appropriee
    ↓
Sauvegarde dans evaluationsSauvegardees (IndexedDB)
    ↓
portfolio.js recalcule indices P et C via pratique.calculerPerformance(da)
    ↓
Stocke dans indicesCP (SSOT)
```

### 5.3 Affichage

```
profil-etudiant.js / tableau-bord.js
    ↓
Lit indicesCP (deja calcule)
    ↓
Appelle pratique.detecterDefis(da) pour diagnostic
    ↓
Affiche indices + patterns + interventions suggerees
```

---

## 6. Preparation pour PAN-Denotation

### 6.1 Ce qui existe deja

- ID `'pan-denotation'` reference dans :
  - `pratique-notation-v2.js` lignes 284, 379, 513 (switch avec fallback defaut)
  - `cours.js` ligne 435 (mapping de label)
  - `primo-questions.js` ligne 416 (option dans le wizard)
- Pas de fichier d'implementation (`pratique-pan-denotation.js` n'existe pas)

### 6.2 Ce qu'il faudra creer

1. `js/pratiques/pratique-pan-denotation.js` — implementer IPratique
2. Enregistrer dans `pratique-registre.js` (ajouter au switch des pratiques codees)
3. Ajouter la section de configuration dans `pratiques-materiel.js`
4. Definir le calcul P et C (qualitatif → quantitatif? jugement global?)
5. Implementer `detecterDefis`, `identifierPattern`, `genererCibleIntervention`

### 6.3 Points de decision avant implementation

- Comment traduire un feedback qualitatif en indice P (0-1)?
- Le C (completion) est-il simplement « a soumis / n'a pas soumis »?
- Y a-t-il un jugement global de fin de session (note unique)?
- Les seuils RaI s'appliquent-ils differemment?

---

## 7. Checklist pre-denotation

| # | Action | Priorite | Fichier | Statut |
|---|---|---|---|---|
| 1 | Remplacer `'pan-maitrise'` → `'pan-standards'` dans pratiques.js | HAUTE | pratiques.js | A FAIRE |
| 2 | Ajouter migration `'specifications'` → `'pan-specifications'` | MOYENNE | pratique-registre.js | A FAIRE |
| 3 | Aligner le defaut pratique (registre vs pratiques.js) | BASSE | pratiques.js | A FAIRE |
| 4 | Documenter l'absence de config sommative dans materiel.js | BASSE | pratiques-materiel.js | A FAIRE |
| 5 | Creer `pratique-pan-denotation.js` | PROCHAINE SESSION | nouveau fichier | PLANIFIE |

---

## 8. Resume visuel

```
                    IPratique (interface)
                         │
           ┌─────────────┼─────────────┐
           │             │             │
    Sommative    PAN-Standards    PAN-Specifications
     (730 l.)     (1619 l.)        (682 l.)
         │             │             │
         │        ┌────┴────┐        │
         │     Portfolio  Par obj.   │
         │     (4 methodes) (4 modes)│
         │             │             │
         └──────┬──────┴──────┬──────┘
                │             │
          Registre       Manager
        (detection,    (configurables,
         alias,         bibliotheque)
         migration)
```

**Etat** : Architecture extensible, prete pour une 4e pratique.
