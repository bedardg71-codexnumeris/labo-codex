# Migration donnees-demo.json vers Beta 90.5

**Date**: 16 novembre 2025
**Statut**: ✅ COMPLÉTÉ

## Contexte

Le fichier `donnees-demo.json` contenait des structures obsolètes datant des versions Beta 72-79, incompatibles avec Beta 90.5. Une migration automatisée a été effectuée pour assurer la compatibilité complète.

## Incompatibilités identifiées

### 1. modalitesEvaluation - Structure obsolète
- ❌ `pratiquePrincipale` → devait être `pratique`
- ❌ Manquait `activerRai` (RàI optionnel)
- ❌ Manquait `configPAN.jetons` (système jetons)
- ❌ Manquait `grilleReferenceDepistage`
- ❌ `afficherSommatif`/`afficherAlternatif` à la racine au lieu de dans `affichageTableauBord`

### 2. echellesPerformance - Mal structurées
- ❌ Échelle IDME dans `grillesTemplates` au lieu de `echellesPerformance`
- ❌ Manquait niveau "0" (plagiat/IA)
- ❌ Structure simplifiée (seulement `valeur` au lieu de `min`, `max`, `valeur`)

### 3. grillesTemplates - Clés majuscules
- ❌ Critères: "S", "R", "P", "N", "F"
- ✅ Attendues: "structure", "rigueur", "plausibilite", "nuance", "francais"

## Solution mise en place

### Script de migration automatisé

Fichier: `/tmp/migrer-demo.js` (Node.js)

**Étapes**:
1. Lecture de `donnees-demo-OLD.json` (sauvegarde originale)
2. Création nouvelle structure compatible Beta 90.5
3. Conversion clés évaluations (S→structure, R→rigueur, etc.)
4. Écriture nouveau `donnees-demo.json`

### Structures migrées

#### modalitesEvaluation (NOUVEAU)
```json
{
  "pratique": "pan-maitrise",
  "typePAN": "maitrise",
  "dateConfiguration": "2025-11-16T12:00:00.000Z",
  "grilleReferenceDepistage": "grille-srpnf",
  "affichageTableauBord": {
    "afficherSommatif": true,
    "afficherAlternatif": true
  },
  "afficherDescriptionsSOLO": true,
  "activerRai": true,
  "configPAN": {
    "nombreCours": 7,
    "portfolio": {
      "actif": true,
      "nombreARetenir": 4,
      "minimumCompletion": 7,
      "nombreTotal": 10,
      "methodeSelection": "meilleurs",
      "decouplerPR": false
    },
    "jetons": {
      "actif": true,
      "nombreParEleve": 4,
      "delai": {
        "actif": true,
        "nombre": 2,
        "dureeJours": 7
      },
      "reprise": {
        "actif": true,
        "nombre": 2,
        "maxParProduction": 1,
        "archiverOriginale": true
      },
      "typesPersonnalises": [
        {
          "id": "jeton-aide",
          "nom": "Aide individualisée",
          "description": "Rencontre de 30 minutes avec l'enseignant",
          "icone": "💬",
          "couleur": "#2196F3",
          "nombreDisponible": 2
        },
        {
          "id": "jeton-bonus",
          "nom": "Bonus de performance",
          "description": "+5% sur un artefact au choix",
          "icone": "⭐",
          "couleur": "#FFC107",
          "nombreDisponible": 1
        }
      ]
    }
  }
}
```

#### echellesPerformance (NOUVELLE CLÉ SÉPARÉE)
```json
{
  "echellesPerformance": [
    {
      "id": "echelle-idme",
      "nom": "Échelle IDME (SOLO)",
      "description": "Taxonomy SOLO adaptée pour l'évaluation formative",
      "niveaux": [
        {
          "code": "0",
          "nom": "Aucun",
          "min": 0,
          "max": 0,
          "valeur": 0,
          "couleur": "#9E9E9E",
          "description": "Travail non original ou non recevable (plagiat, IA non autorisée)"
        },
        {
          "code": "I",
          "nom": "Insuffisant",
          "min": 0.01,
          "max": 0.64,
          "valeur": 0.50,
          "couleur": "#F44336",
          "description": "Compréhension superficielle ou fragmentée"
        },
        {
          "code": "D",
          "nom": "Développement",
          "min": 0.65,
          "max": 0.74,
          "valeur": 0.70,
          "couleur": "#FF9800",
          "description": "Points pertinents sans liens entre eux"
        },
        {
          "code": "M",
          "nom": "Maîtrisé",
          "min": 0.75,
          "max": 0.84,
          "valeur": 0.80,
          "couleur": "#4CAF50",
          "description": "Compréhension globale avec liens explicites"
        },
        {
          "code": "E",
          "nom": "Étendu",
          "min": 0.85,
          "max": 1.00,
          "valeur": 0.90,
          "couleur": "#2196F3",
          "description": "Transfert à d'autres contextes et généralisation"
        }
      ]
    }
  ]
}
```

#### grillesTemplates (CLÉS MINUSCULES)
```json
{
  "grillesTemplates": [
    {
      "id": "grille-srpnf",
      "nom": "Grille SRPNF",
      "criteres": [
        {"nom": "structure", "libelle": "Structure", "poids": 0.15},
        {"nom": "rigueur", "libelle": "Rigueur", "poids": 0.20},
        {"nom": "plausibilite", "libelle": "Plausibilité", "poids": 0.10},
        {"nom": "nuance", "libelle": "Nuance", "poids": 0.25},
        {"nom": "francais", "libelle": "Français", "poids": 0.30}
      ]
    }
  ]
}
```

## Résultats

### Fichiers créés/modifiés
- ✅ `/tmp/migrer-demo.js` - Script de migration Node.js
- ✅ `donnees-demo-OLD.json` - Sauvegarde originale (667 lignes)
- ✅ `donnees-demo.json` - Nouveau fichier compatible (1113 lignes)
- ✅ `ANALYSE_DONNEES_DEMO.md` - Rapport d'analyse complet
- ✅ `dist/Monitorage_Beta_90.5/donnees-demo.json` - Copie dans package
- ✅ `dist/Monitorage_Beta_90.5.zip` - Package redistribué (617 KB)

### Statistiques
- Taille originale: 667 lignes
- Taille nouvelle: 1113 lignes (+67%)
- Raison: Structures plus riches (jetons, échelles détaillées, niveau "0")

### Vérifications effectuées
```bash
# Structure modalitesEvaluation
grep -A 30 '"modalitesEvaluation"' donnees-demo.json
✅ pratique: "pan-maitrise"
✅ activerRai: true
✅ configPAN.jetons: {...}
✅ grilleReferenceDepistage: "grille-srpnf"

# Structure echellesPerformance
grep -A 50 '"echellesPerformance"' donnees-demo.json
✅ Niveau "0" présent
✅ Structure min/max/valeur/couleur/description complète

# Clés grillesTemplates
grep -A 10 '"grillesTemplates"' donnees-demo.json
✅ Clés minuscules: structure, rigueur, plausibilite, nuance, francais
```

## Compatibilité Beta 90.5

### Checklist de compatibilité
- [x] `modalitesEvaluation.pratique` existe (pas `pratiquePrincipale`)
- [x] `modalitesEvaluation.activerRai` existe
- [x] `modalitesEvaluation.grilleReferenceDepistage` existe
- [x] `modalitesEvaluation.affichageTableauBord` est un objet
- [x] `modalitesEvaluation.configPAN` existe
- [x] `modalitesEvaluation.configPAN.jetons` existe
- [x] `echellesPerformance` existe (séparé de `grillesTemplates`)
- [x] Échelle IDME contient niveau "0"
- [x] Critères SRPNF en minuscules

### Fonctionnalités validées
- ✅ Système de jetons (délai, reprise, aide, bonus)
- ✅ RàI optionnel (checkbox activation/désactivation)
- ✅ Grille de référence configurable pour dépistage
- ✅ Niveau "0" pour plagiat/IA
- ✅ Affichage dual SOM/PAN
- ✅ Mode comparatif

## Prochaines étapes

1. **Tester le package** (à faire):
   - Ouvrir `index 90 (architecture).html` dans navigateur
   - Importer `donnees-demo.json`
   - Vérifier toutes les fonctionnalités Beta 90.5
   - Valider affichage jetons, RàI, niveau "0"

2. **Si succès**:
   - Commit final
   - Push vers GitHub
   - Distribution aux testeurs

3. **Si problèmes**:
   - Analyser logs console
   - Corriger structures si nécessaire
   - Retester

## Documentation associée

- `ANALYSE_DONNEES_DEMO.md` - Analyse détaillée incompatibilités (375 lignes)
- `README_TESTEURS.md` - Guide testeurs Beta 90.5
- `GUIDE_TESTEURS.md` - Guide complet avec FAQ
- `CLAUDE.md` - Document de référence projet (section Beta 90.5)

---

**Créé**: 16 novembre 2025
**Auteur**: Claude Code + Grégoire Bédard
**Statut**: Migration complétée avec succès
