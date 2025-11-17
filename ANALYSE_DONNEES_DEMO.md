# Analyse d'incompatibilité - donnees-demo.json vs Beta 90.5

**Date:** 16 novembre 2025
**Fichier analysé:** `donnees-demo.json` (667 lignes, dernière MAJ inconnue)
**Code actuel:** Beta 90.5 (16 novembre 2025)

---

## Résumé exécutif

**Statut:** ⚠️ **INCOMPATIBILITÉS MAJEURES DÉTECTÉES**

Le fichier `donnees-demo.json` contient des structures obsolètes datant des versions Beta 72-79. Il doit être mis à jour avant distribution de Beta 90.5.

**Impact:**
- ❌ Système de jetons ne fonctionnera pas (clés manquantes)
- ❌ RàI optionnel ne fonctionnera pas (clé manquante)
- ❌ Grille de référence pour dépistage non configurée
- ❌ Échelles de performance mal structurées
- ⚠️ Pratique "sommative" vs "pan-maitrise" (ancien vs nouveau)

---

## 1. modalitesEvaluation - INCOMPATIBILITÉS CRITIQUES

### Structure actuelle (OBSOLÈTE):
```json
"modalitesEvaluation": {
  "pratiquePrincipale": "sommative",
  "afficherSommatif": true,
  "afficherAlternatif": true,
  "modeComparatif": true,
  "nombreArtefacts": 4,
  "periodeDepistage": 3
}
```

### Structure attendue par Beta 90.5:
```json
"modalitesEvaluation": {
  "pratique": "pan-maitrise",  // ❌ CHANGÉ: "pratiquePrincipale" → "pratique"
  "typePAN": "maitrise",       // ✅ OK (si pratique = pan-maitrise)
  "dateConfiguration": "2025-11-16T...",

  "grilleReferenceDepistage": "grille-srpnf",  // ❌ MANQUANT (nouveau Beta 90.5)

  "affichageTableauBord": {    // ❌ RESTRUCTURÉ
    "afficherSommatif": true,
    "afficherAlternatif": true
  },

  "afficherDescriptionsSOLO": true,  // ❌ MANQUANT (nouveau)
  "activerRai": true,                 // ❌ MANQUANT CRITIQUE (RàI optionnel)

  "configPAN": {               // ❌ MANQUANT CRITIQUE (système portfolio + jetons)
    "nombreCours": 7,

    "portfolio": {
      "actif": true,
      "nombreARetenir": 5,
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
          "description": "Rencontre de 30 minutes",
          "icone": "💬",
          "couleur": "#2196F3",
          "nombreDisponible": 2
        },
        {
          "id": "jeton-bonus",
          "nom": "Bonus de performance",
          "description": "+5% sur un artefact",
          "icone": "⭐",
          "couleur": "#FFC107",
          "nombreDisponible": 1
        }
      ]
    }
  }
}
```

### Clés obsolètes à supprimer:
- ❌ `pratiquePrincipale` → renommer en `pratique`
- ❌ `afficherSommatif` (racine) → déplacer dans `affichageTableauBord`
- ❌ `afficherAlternatif` (racine) → déplacer dans `affichageTableauBord`
- ❌ `modeComparatif` → calculé automatiquement selon `affichageTableauBord`
- ❌ `nombreArtefacts` → dans `configPAN.portfolio.nombreARetenir`
- ❌ `periodeDepistage` → dans `configPAN.nombreCours`

---

## 2. grillesTemplates vs echellesPerformance - STRUCTURE OBSOLÈTE

### Problème actuel:
L'échelle IDME est dans `grillesTemplates` alors qu'elle devrait être séparée.

```json
"grillesTemplates": [
  {
    "id": "grille-srpnf",
    "nom": "Grille SRPNF",
    "criteres": [
      {"nom": "S", "libelle": "Structure", "poids": 0.15},
      {"nom": "R", "libelle": "Rigueur", "poids": 0.20},
      {"nom": "P", "libelle": "Plausibilité", "poids": 0.10},
      {"nom": "N", "libelle": "Nuance", "poids": 0.25},
      {"nom": "F", "libelle": "Français", "poids": 0.30}
    ]
  },
  {
    "id": "grille-idme",       // ❌ ERREUR: Ce n'est pas une grille!
    "nom": "Échelle IDME",
    "type": "echelle",
    "niveaux": [...]
  }
]
```

### Structure attendue:
```json
"grillesTemplates": [
  {
    "id": "grille-srpnf",
    "nom": "Grille SRPNF",
    "criteres": [
      {"nom": "structure", "libelle": "Structure", "poids": 0.15},      // ✅ Clé minuscule
      {"nom": "rigueur", "libelle": "Rigueur", "poids": 0.20},
      {"nom": "plausibilite", "libelle": "Plausibilité", "poids": 0.10},
      {"nom": "nuance", "libelle": "Nuance", "poids": 0.25},
      {"nom": "francais", "libelle": "Français", "poids": 0.30}
    ]
  }
],

"echellesPerformance": [      // ❌ CLÉ MANQUANTE
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
```

**Changements majeurs:**
1. ✅ Ajout niveau "0" (nouveau Beta 89+)
2. ✅ Structure `min`, `max`, `valeur` au lieu de juste `valeur`
3. ✅ `couleur` explicite pour chaque niveau
4. ✅ `description` détaillée pour chaque niveau
5. ✅ Séparation grilles vs échelles

---

## 3. productions - STRUCTURE CORRECTE (mais manque cartouches liées)

### Structure actuelle: ✅ COMPATIBLE
```json
"productions": [
  {
    "id": "prod-001",
    "titre": "Examen formatif 1",
    "type": "examen-formatif",
    "dateRemise": "2025-02-05",
    "ponderation": 0,
    "grilleId": "grille-srpnf",
    "verrouille": false
  }
]
```

**Statut:** ✅ Structure correcte, mais pourrait bénéficier de:
- ⚠️ `description` (optionnel mais recommandé)
- ⚠️ `objectif` (optionnel)
- ⚠️ Lien vers cartouches suggérées

---

## 4. cartouches - STRUCTURE CORRECTE

### Structure actuelle: ✅ COMPATIBLE
```json
"cartouches_grille-srpnf": [
  {
    "id": "CART1730000000001",
    "nom": "A2 Description d'un personnage",
    "grilleId": "grille-srpnf",
    "contexte": "...",
    "commentaires": {
      "structure": {
        "I": "...",
        "D": "...",
        "M": "...",
        "E": "..."
      },
      ...
    }
  }
]
```

**Statut:** ✅ Structure correcte et complète

---

## 5. evaluationsSauvegardees - À VÉRIFIER

**Manque dans l'analyse:** Structure des évaluations sauvegardées.

Éléments critiques à vérifier:
- ✅ Format `criteres: { structure: "M", rigueur: "D", ... }` (clés minuscules)
- ✅ Champ `niveauFinal` (peut être "--" pour anciennes évaluations)
- ⚠️ Jetons attribués: `jetonUtilise: { type: "delai", dateAttribution: "..." }`

---

## 6. Autres clés à vérifier

### Clés présentes dans demo:
- ✅ `infoCours` - OK
- ✅ `infoTrimestre` - OK
- ✅ `groupeEtudiants` - OK
- ✅ `artefactsSelectionnes` - OK (mais devrait être dans `configPAN.portfolio`)
- ⚠️ `calendrierComplet` - Non vérifié
- ⚠️ `presences` - Non vérifié
- ⚠️ `indicesCP` - Non vérifié
- ⚠️ `indicesAssiduiteDetailles` - Non vérifié

---

## 7. Priorités de correction

### 🔴 CRITIQUE (bloquant):
1. **modalitesEvaluation** - Restructurer complètement
2. **activerRai** - Ajouter (sinon RàI non optionnel)
3. **configPAN.jetons** - Ajouter (sinon système jetons non fonctionnel)
4. **echellesPerformance** - Créer clé et séparer de grillesTemplates

### 🟡 IMPORTANT (non bloquant mais recommandé):
5. **grilleReferenceDepistage** - Ajouter pour dépistage universel
6. **Critères SRPNF** - Changer clés en minuscules (S→structure, etc.)
7. **Niveau "0"** - Ajouter dans échelle IDME
8. **typePAN** - Clarifier "maitrise" vs ancien "alternative"

### 🟢 OPTIONNEL (amélioration):
9. Descriptions productions
10. Objectifs productions
11. Liens cartouches ↔ productions

---

## 8. Plan d'action recommandé

### Option A: Mise à jour manuelle (2-3 heures)
1. Restructurer `modalitesEvaluation`
2. Créer `echellesPerformance`
3. Nettoyer `grillesTemplates`
4. Ajouter configurations manquantes
5. Tester import

### Option B: Génération automatique (30 minutes)
1. Créer nouveau `donnees-demo-beta90.5.json` à partir du code
2. Réutiliser données existantes (étudiants, évaluations)
3. Ajouter nouveautés Beta 90.5
4. Tester import

**Recommandation:** Option B (plus sûr et plus rapide)

---

## 9. Checklist de compatibilité

Pour qu'un fichier JSON soit compatible Beta 90.5:

- [ ] `modalitesEvaluation.pratique` existe (pas `pratiquePrincipale`)
- [ ] `modalitesEvaluation.activerRai` existe
- [ ] `modalitesEvaluation.grilleReferenceDepistage` existe
- [ ] `modalitesEvaluation.affichageTableauBord` est un objet
- [ ] `modalitesEvaluation.configPAN` existe
- [ ] `modalitesEvaluation.configPAN.jetons` existe
- [ ] `echellesPerformance` existe (séparé de `grillesTemplates`)
- [ ] Échelle IDME contient niveau "0"
- [ ] Critères SRPNF en minuscules

---

## Conclusion

Le fichier `donnees-demo.json` actuel est **INCOMPATIBLE** avec Beta 90.5.

**Risques si non corrigé:**
- Système de jetons ne s'active pas
- RàI toujours activé (pas d'option)
- Grille de dépistage non configurée → erreurs console
- Échelles mal structurées → bugs affichage
- Utilisateurs confus par comportement inattendu

**Action requise:** Créer nouveau fichier `donnees-demo.json` compatible Beta 90.5 avant distribution du package.

---

**Fichier créé:** 16 novembre 2025
**Analysé par:** Claude Code
**Prochaine étape:** Génération nouveau donnees-demo.json
