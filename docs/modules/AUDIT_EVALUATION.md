# Audit Module Evaluation

**Version** : 1.0
**Date** : 9 janvier 2026
**Auteur** : Claude Code
**Statut** : Audit complet

---

## Resume executif

L'audit du module d'evaluation revele une **architecture bien structuree mais complexe** avec **16 548 lignes de code** reparties dans 6 fichiers principaux. Le systeme respecte le pattern **Single Source of Truth** via localStorage/IndexedDB. Cependant, plusieurs **incoherences critiques** ont ete identifiees, notamment l'absence de namespacing par trimestre.

---

## 1. Fichiers analyses

| Fichier | Lignes | Responsabilite |
|---------|--------|----------------|
| `evaluation.js` | 5 923 | Moteur principal d'evaluation |
| `grilles.js` | 3 664 | Gestion des grilles de criteres |
| `cartouches.js` | 3 600 | Cartouches de retroaction |
| `liste-evaluations.js` | 1 499 | Affichage et filtrage |
| `portfolio.js` | 1 061 | Portfolios etudiants |
| `evaluation-jetons.js` | 801 | Gestion des jetons |
| **TOTAL** | **16 548** | |

---

## 2. Cles storage utilisees

### Cles principales

| Cle | Type | Namespacee | Notes |
|-----|------|------------|-------|
| `evaluationsSauvegardees` | Array | **NON** | Toutes les evaluations |
| `grillesTemplates` | Array | NON | Grilles reutilisables |
| `cartouches_{grilleId}` | Array | NON | Par grille |
| `echellesTemplates` | Array | NON | Echelles performance |
| `productions` | Array | NON | Productions/artefacts |
| `portfoliosEleves` | Object | NON | Selections artefacts |
| `modalitesEvaluation` | Object | NON | Config evaluation |

### Cles dependantes (namespacees)

| Cle | Type | Namespacee |
|-----|------|------------|
| `groupeEtudiants` | Array | OUI (`h2026_groupeEtudiants`) |
| `presences` | Object | OUI (`h2026_presences`) |

---

## 3. Structure d'une evaluation

```javascript
{
  // IDENTIFIANTS
  id: "EVAL_1704070400000",

  // REFERENCES ENTITES
  etudiantDA: "B00012345",
  productionId: "PROD_1234",
  grilleId: "GRILLE_5678",
  echelleId: "ECH_9012",
  cartoucheId: "CART_3456",

  // COTATION
  criteres: {
    "CRIT_001": { niveau: 3, sousNiveaux: [...] },
    "CRIT_002": { niveau: 2, sousNiveaux: [...] }
  },

  // RESULTATS
  noteFinale: 78.5,
  niveauFinal: "Competent",
  tendance: "->",

  // RETROACTION
  retroaction: "Analyse nuancee...",
  retroactionPersonnalisee: "Ajout manuel",

  // JETONS
  jetonDelaiApplique: false,
  jetonRepriseApplique: false,
  jetonRepriseCibleeApplique: false,
  repriseDeId: null,
  remplaceeParId: null,

  // VERROUILLAGE
  verrouillee: false,

  // METADONNEES
  dateCreation: "2024-12-30T15:30:00Z",
  dateModification: "2024-12-31T10:45:00Z",
  dateRemise: "2024-12-25T18:00:00Z",
  statut: "remis" // ou "non-remis", "retard"
}
```

---

## 4. Architecture

```
+------------------------------------------------------------------+
|                    MODULE EVALUATION                              |
+------------------------------------------------------------------+
|
|  ENTREE -> evaluation.js (5923 lignes)
|           +-- initialiserModuleEvaluation()
|           +-- chargerListeEtudiantsEval()
|           +-- afficherCriteresDepuisGrille()
|           +-- calculerNoteAlgorithmique()
|           +-- genererRetroaction()
|           +-- sauvegarderEvaluation()
|
|           SUPPORT GRILLES: grilles.js
|           +-- chargerGrilleTemplate()
|           +-- afficherListeCriteres()
|           +-- calculerTotalPonderationCriteres()
|
|           SUPPORT CARTOUCHES: cartouches.js
|           +-- chargerCartouchePourModif()
|           +-- genererMatriceRetroaction()
|
|           SUPPORT JETONS: evaluation-jetons.js
|           +-- appliquerJetonDelai()
|           +-- appliquerJetonReprise()
|
|           PORTFOLIOS: portfolio.js
|           +-- chargerPortfolioEleveDetail()
|           +-- selectionnerArtefactsSelonModalite()
|
|           LISTE: liste-evaluations.js
|           +-- chargerListeEvaluationsRefonte()
|           +-- afficherTableauEvaluations()
|
+------------------------------------------------------------------+
```

---

## 5. Comparaison avec pattern groupe-cours

| Aspect | Groupe-Cours (Beta 95.2) | Evaluation |
|--------|--------------------------|------------|
| Entites liees | Cours + Enseignant + Horaire + Pratique | Etudiant + Production + Grille + Echelle |
| Identifiant | `GC_timestamp` | `EVAL_timestamp` |
| Cle storage | `{trimestreId}_groupesCours` | `evaluationsSauvegardees` (non namespace) |
| Hydratation | `hydraterGroupeCours()` | Pas d'hydratation |
| Integrite ref. | Validations presentes | Validations absentes |
| Scope trimestre | OUI | **NON** |

### Incoherence majeure

Le module d'evaluation **N'UTILISE PAS** le pattern groupe-cours :

```javascript
// ACTUELLEMENT:
const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
// -> Pas de lien avec groupe-cours actif

// DEVRAIT ETRE:
const groupeCours = await obtenirGroupeCoursActifComplet(trimestreId);
const etudiants = filtrerEtudiantsParGroupeCours(groupeCours);
// -> Source unique de verite
```

---

## 6. Problemes detectes

### Critiques (priorite immediate)

| # | Probleme | Impact | Solution |
|---|----------|--------|----------|
| 1 | `evaluationsSauvegardees` non namespace | Contamination inter-trimestres | Implementer `{trimestre}_evaluationsSauvegardees` |
| 2 | Groupe-cours ignore | Pattern Beta 95.2 inutilise | Integrer `obtenirGroupeCoursActif()` |
| 3 | Pas de validation references | Evaluations orphelines possibles | Ajouter `validerEvaluation()` |

### Hauts (Beta 96)

| # | Probleme | Impact | Solution |
|---|----------|--------|----------|
| 4 | Code duplique calcul indices | Desynchronisation | Extraire dans `indices.js` |
| 5 | `obtenirDonneesSelonMode()` mal exploite | Filtrage incomplet | Harmoniser namespacing |
| 6 | Pas de schema validation | Donnees corrompues | Ajouter validation avant save |

### Moyens (Plus tard)

| # | Probleme | Impact | Solution |
|---|----------|--------|----------|
| 7 | Performance liste 1000+ | Ralentissement | Pagination/virtualisation |
| 8 | `window.evaluationEnCours` globale | Bugs multi-onglets | Pattern singleton |
| 9 | Gestion modes eparrillee | Maintenance difficile | Centraliser dans modes.js |

---

## 7. Points positifs

- Architecture modulaire claire
- Separation des responsabilites
- Systeme de jetons fonctionnel (delai, reprise, reprise ciblee)
- Generation automatique retroaction via matrice
- Support mode anonymisation
- Calcul d'indices (completion + performance)
- Portfolio avec 4 modalites de selection
- Verrouillage d'evaluations

---

## 8. Recommandations

### Phase 1 - Stabilisation (Beta 96)

1. **Namespacer les cles** par trimestre
   - `evaluationsSauvegardees` -> `{trimestre}_evaluationsSauvegardees`
   - `productions` -> `{trimestre}_productions`

2. **Integrer groupe-cours** comme source de verite
   - Modifier `chargerListeEtudiantsEval()` pour utiliser groupe-cours actif
   - Filtrer evaluations par groupe-cours

3. **Ajouter validations** avant sauvegarde
   - Verifier `etudiantDA` existe
   - Verifier `productionId` existe
   - Verifier `grilleId` existe

### Phase 2 - Refactoring

4. **Extraire calcul indices** dans module dedie `js/indices.js`
5. **Centraliser notifications** dans service unifie
6. **Documenter `obtenirDonneesSelonMode()`** clairement

### Phase 3 - Optimisation

7. **Implementer pagination** pour listes 1000+ evaluations
8. **Reduire variables globales** (`window.evaluationEnCours`)
9. **Merger** `echellesPerformance` et `echellesTemplates`

---

## 9. Checklist migration

### A faire pour Beta 96

- [ ] Namespacer `evaluationsSauvegardees`
- [ ] Namespacer `productions`
- [ ] Ajouter migration automatique des anciennes cles
- [ ] Integrer groupe-cours dans module evaluation
- [ ] Ajouter validation `etudiantDA`
- [ ] Ajouter validation `productionId`
- [ ] Ajouter validation `grilleId`
- [ ] Extraire calcul indices dans module dedie
- [ ] Tester avec donnees A2025 et H2026

### Verification post-migration

- [ ] Evaluations A2025 accessibles
- [ ] Evaluations H2026 isolees
- [ ] Pas de contamination inter-trimestres
- [ ] Performance acceptable (< 1s pour 500 evaluations)

---

## 10. Historique

| Version | Date | Changement |
|---------|------|------------|
| 1.0 | 9 jan 2026 | Audit initial complet |

---

**Fichiers de reference** :
- `js/evaluation.js`
- `js/grilles.js`
- `js/cartouches.js`
- `js/liste-evaluations.js`
- `js/portfolio.js`
- `js/evaluation-jetons.js`
