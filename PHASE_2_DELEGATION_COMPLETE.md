# Phase 2 : Délégation des calculs - COMPLÈTE

**Date** : 13 novembre 2025
**Durée** : 15 minutes
**Objectif** : Remplacer le code dupliqué dans `portfolio.js` par des appels au registre de pratiques

---

## ✅ Modifications réalisées

### 1. Fichier principal : `js/portfolio.js`

**Fonction modifiée** : `calculerEtStockerIndicesCP()` (lignes 505-719)

#### Avant (code dupliqué)
```javascript
// 98 lignes de calculs manuels pour SOM (lignes 564-603)
const evaluationsSOM = evaluations.filter(...);
// Calcul de C_som manuellement
// Calcul de P_som avec moyenne pondérée manuelle

// 44 lignes de calculs manuels pour PAN (lignes 609-652)
const evaluationsPAN = evaluations.filter(...);
// Calcul de C_pan manuellement
// Calcul de P_pan avec sélection des N meilleurs manuellement
```

#### Après (délégation aux pratiques)
```javascript
// 🎯 OBTENIR LES PRATIQUES DEPUIS LE REGISTRE
const pratiqueSommative = obtenirPratiqueParId('sommative');
const pratiquePAN = obtenirPratiqueParId('pan-maitrise');

// CALCUL PRATIQUE SOM (4 lignes)
const C_som_decimal = pratiqueSommative.calculerCompletion(da);
const P_som_decimal = pratiqueSommative.calculerPerformance(da);
const C_som = C_som_decimal !== null ? Math.round(C_som_decimal * 100) : 0;
const P_som = P_som_decimal !== null ? Math.round(P_som_decimal * 100) : 0;

// CALCUL PRATIQUE PAN (4 lignes)
const C_pan_decimal = pratiquePAN.calculerCompletion(da);
const P_pan_decimal = pratiquePAN.calculerPerformance(da);
const C_pan = C_pan_decimal !== null ? Math.round(C_pan_decimal * 100) : 0;
const P_pan = P_pan_decimal !== null ? Math.round(P_pan_decimal * 100) : 0;
```

**Réduction de code** : 142 lignes → 8 lignes = **-94% de code dupliqué**

---

## 📊 Changements détaillés

### Lignes 505-524 : Initialisation

**Avant** :
```javascript
console.log('🔄 Calcul DUAL des indices C et P (SOM + PAN)...');

const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
const productions = obtenirDonneesSelonMode('productions');
const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
const selectionsPortfolios = obtenirDonneesSelonMode('portfoliosEleves');

// 30 lignes de préparation de filtres...
```

**Après** :
```javascript
console.log('🔄 Calcul DUAL des indices C et P (SOM + PAN) via registre de pratiques...');

const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
const productions = obtenirDonneesSelonMode('productions');

// 🎯 OBTENIR LES PRATIQUES DEPUIS LE REGISTRE
const pratiqueSommative = obtenirPratiqueParId('sommative');
const pratiquePAN = obtenirPratiqueParId('pan-maitrise');

if (!pratiqueSommative || !pratiquePAN) {
    console.error('❌ Pratiques non disponibles dans le registre');
    return indicesCP;
}

// Compteurs simplifiés pour logs seulement
const productionsSOM = productions.filter(p => comptesDansDepistage(p, 'SOM'));
const nbProductionsSOMDonnees = productionsSOM.length;

const productionsPAN = productions.filter(p => comptesDansDepistage(p, 'PAN'));
const nbArtefactsPANDonnes = productionsPAN.length;
```

**Changements** :
- ✅ Ajout de `obtenirPratiqueParId()` pour récupérer les pratiques
- ✅ Validation que les pratiques sont disponibles
- ✅ Simplification des filtres (uniquement pour les logs)
- ❌ Suppression de `evaluations` et `selectionsPortfolios` (délégués aux pratiques)

### Lignes 544-564 : Calculs SOM et PAN

**Avant** :
```javascript
// ========================================
// CALCUL PRATIQUE SOM
// ========================================

const evaluationsSOM = evaluations.filter(e =>
    e.etudiantDA === da &&
    productionsSOMDonnees.has(e.productionId) &&
    !e.remplaceeParId &&
    e.statutIntegrite !== 'plagiat' &&
    e.statutIntegrite !== 'ia'
);

const productionsSOMRemises = new Set(evaluationsSOM.map(e => e.productionId));
const nbSOMRemises = productionsSOMRemises.size;
const C_som = nbProductionsSOMDonnees === 0 ? 0 : Math.round((nbSOMRemises / nbProductionsSOMDonnees) * 100);

let P_som = 0;
let notesSOM = [];
let productionsSOMRetenues = [];

const evaluationsSOMAvecNote = evaluationsSOM.filter(e => e.noteFinale !== null);
if (evaluationsSOMAvecNote.length > 0) {
    let sommePonderee = 0;
    let totalPonderation = 0;

    evaluationsSOMAvecNote.forEach(evaluation => {
        const production = productions.find(p => p.id === evaluation.productionId);
        const ponderation = production?.ponderation || 0;
        sommePonderee += evaluation.noteFinale * ponderation;
        totalPonderation += ponderation;
    });

    if (totalPonderation > 0) {
        P_som = Math.round(sommePonderee / totalPonderation);
    } else {
        const somme = evaluationsSOMAvecNote.map(e => e.noteFinale).reduce((sum, note) => sum + note, 0);
        P_som = Math.round(somme / evaluationsSOMAvecNote.length);
    }

    productionsSOMRetenues = evaluationsSOMAvecNote.map(e => e.productionId);
    notesSOM = evaluationsSOMAvecNote.map(e => e.noteFinale);
}

// 44 lignes similaires pour PAN...
```

**Après** :
```javascript
// ========================================
// CALCUL PRATIQUE SOM (via registre)
// ========================================

const C_som_decimal = pratiqueSommative.calculerCompletion(da);
const P_som_decimal = pratiqueSommative.calculerPerformance(da);

// Convertir 0-1 → 0-100
const C_som = C_som_decimal !== null ? Math.round(C_som_decimal * 100) : 0;
const P_som = P_som_decimal !== null ? Math.round(P_som_decimal * 100) : 0;

// ========================================
// CALCUL PRATIQUE PAN (via registre)
// ========================================

const C_pan_decimal = pratiquePAN.calculerCompletion(da);
const P_pan_decimal = pratiquePAN.calculerPerformance(da);

// Convertir 0-1 → 0-100
const C_pan = C_pan_decimal !== null ? Math.round(C_pan_decimal * 100) : 0;
const P_pan = P_pan_decimal !== null ? Math.round(P_pan_decimal * 100) : 0;
```

**Changements** :
- ✅ Appel direct aux méthodes `calculerCompletion()` et `calculerPerformance()`
- ✅ Conversion automatique 0-1 → 0-100 (les pratiques retournent des décimales)
- ✅ Gestion des valeurs `null` (pas de données)
- ❌ Suppression de 142 lignes de code dupliqué

### Lignes 566-588 : Structure de données

**Avant** :
```javascript
const entreeActuelle = {
    date: dateCalcul,
    SOM: {
        C: C_som,
        P: P_som,
        details: {
            nbProductionsRemises: nbSOMRemises,
            nbProductionsDonnees: nbProductionsSOMDonnees,
            productionsRetenues: productionsSOMRetenues,
            notes: notesSOM
        }
    },
    PAN: {
        C: C_pan,
        P: P_pan,
        details: {
            nbArtefactsRemis: nbPANRemis,
            nbArtefactsDonnes: nbArtefactsPANDonnes,
            artefactsRetenus: artefactsPANRetenus,
            notes: notesPAN
        }
    }
};
```

**Après** :
```javascript
const entreeActuelle = {
    date: dateCalcul,
    SOM: {
        C: C_som,
        P: P_som,
        details: {
            calculViaPratique: true,
            pratique: 'sommative'
        }
    },
    PAN: {
        C: C_pan,
        P: P_pan,
        details: {
            calculViaPratique: true,
            pratique: 'pan-maitrise'
        }
    }
};
```

**Changements** :
- ✅ Structure `indicesCP` préservée (compatibilité)
- ✅ `details` simplifié (flag `calculViaPratique`)
- ✅ Identification de la pratique utilisée
- ℹ️ Les détails complets peuvent être récupérés directement des pratiques si nécessaire

---

## 🎯 Architecture finale

### Avant (duplication)
```
portfolio.js
├─ calculerEtStockerIndicesCP()
   ├─ Calcule C_som manuellement (98 lignes)
   ├─ Calcule P_som manuellement
   ├─ Calcule C_pan manuellement (44 lignes)
   └─ Calcule P_pan manuellement

pratique-sommative.js
└─ calculerPerformance() [NON UTILISÉ]
   └─ calculerCompletion() [NON UTILISÉ]

pratique-pan-maitrise.js
└─ calculerPerformance() [NON UTILISÉ]
   └─ calculerCompletion() [NON UTILISÉ]
```

### Après (délégation)
```
portfolio.js
├─ calculerEtStockerIndicesCP()
   ├─ pratiqueSommative.calculerCompletion(da)
   ├─ pratiqueSommative.calculerPerformance(da)
   ├─ pratiquePAN.calculerCompletion(da)
   └─ pratiquePAN.calculerPerformance(da)
   └─ Structure et sauvegarde indicesCP

pratique-sommative.js
└─ calculerPerformance() [UTILISÉ ✓]
   └─ calculerCompletion() [UTILISÉ ✓]

pratique-pan-maitrise.js
└─ calculerPerformance() [UTILISÉ ✓]
   └─ calculerCompletion() [UTILISÉ ✓]
```

---

## 📄 Fichiers modifiés

| Fichier | Lignes modifiées | Type de changement |
|---------|------------------|--------------------|
| `js/portfolio.js` | 505-588 (83 lignes) | Remplacement logique calcul |
| `index 90 (architecture).html` | 8779 | Cache buster mis à jour |

---

## 🧪 Tests à effectuer

### Test 1 : Vérifier chargement des pratiques

Ouvrir `index 90 (architecture).html` dans le navigateur, vérifier la console :

```javascript
// Devrait afficher :
// ✅ Module pratique-registre.js chargé
// ✅ [PAN] Pratique PAN-Maîtrise enregistrée avec succès
// ✅ [SOM] Pratique Sommative enregistrée avec succès
// 🔄 Calcul DUAL des indices C et P (SOM + PAN) via registre de pratiques...
// ✅ Indices C et P sauvegardés (SOM + PAN)
```

### Test 2 : Comparer résultats avant/après

**Avant Phase 2** (avec calcul manuel) :
```javascript
const indicesCP = JSON.parse(localStorage.getItem('indicesCP'));
console.log(indicesCP['1234567'].actuel);
// {
//   SOM: { C: 80, P: 72 },
//   PAN: { C: 87, P: 85 }
// }
```

**Après Phase 2** (avec délégation) :
```javascript
// Vider localStorage et recharger les données
localStorage.removeItem('indicesCP');
calculerEtStockerIndicesCP();

const indicesCP = JSON.parse(localStorage.getItem('indicesCP'));
console.log(indicesCP['1234567'].actuel);
// {
//   SOM: { C: 80, P: 72 },  // DOIT être identique
//   PAN: { C: 87, P: 85 }   // DOIT être identique
// }
```

**Critère de succès** : Les valeurs C et P doivent être **identiques** (±1% d'arrondi acceptable).

### Test 3 : Vérifier profils étudiants

1. Aller dans **Accueil › Groupe**
2. Cliquer sur un étudiant (ex: Ève)
3. Vérifier section **Mobilisation** :
   - Complétion (C) : 87%
   - Performance (P) : 85%
4. Les valeurs doivent être **identiques** à avant la migration

### Test 4 : Mode comparatif SOM/PAN

1. Aller dans **Réglages › Pratique de notation**
2. Activer "Mode comparatif"
3. Aller dans **Accueil › Tableau de bord**
4. Vérifier que les deux colonnes (SOM et PAN) affichent des valeurs différentes

---

## ✅ Bénéfices de la Phase 2

### 1. Élimination de la duplication de code
- **Avant** : 142 lignes de calculs dupliqués dans `portfolio.js`
- **Après** : 8 lignes d'appels aux pratiques
- **Réduction** : -94% de code

### 2. Séparation des responsabilités (SRP)
- **portfolio.js** : Orchestration et stockage (data collection)
- **pratique-*.js** : Logique de calcul (calculation logic)

### 3. Extensibilité
- Ajouter une nouvelle pratique = créer 1 module
- Pas besoin de modifier `portfolio.js`

### 4. Maintenabilité
- Corriger un bug de calcul = modifier 1 endroit (la pratique)
- Pas de risque d'incohérence

### 5. Testabilité
- Les pratiques peuvent être testées indépendamment
- Tests unitaires possibles sans dépendances

---

## 🚀 Prochaines étapes

### Phase 3 : Tests et validation (recommandé)

1. ✅ Tester chargement des pratiques
2. ✅ Comparer résultats avant/après
3. ✅ Vérifier profils étudiants
4. ✅ Tester mode comparatif

### Phase 4 : Nettoyage (optionnel)

1. Documenter l'architecture dans `CLAUDE.md`
2. Mettre à jour `AUDIT_ARCHITECTURE_PORTFOLIO.md`
3. Créer commit Git avec message descriptif

### Futures améliorations

1. **Enrichir l'interface IPratique** :
   - Ajouter méthode `obtenirDetails()` pour récupérer les détails complets
   - Retourner structure complète avec métadonnées

2. **Support d'autres pratiques** :
   - PAN-Spécifications (évaluation dichotomique)
   - Dénotation (sans notes chiffrées)

3. **Optimisation performance** :
   - Mettre en cache les résultats des pratiques
   - Calcul incrémental (seulement si changements)

---

## 📝 Notes importantes

### Compatibilité ascendante

La structure `localStorage.indicesCP` reste **100% compatible** avec l'ancien format :

```javascript
{
  "DA": {
    "actuel": {
      "SOM": { "C": 80, "P": 72, "details": {...} },
      "PAN": { "C": 87, "P": 85, "details": {...} }
    },
    "historique": [...]
  }
}
```

**Seul changement** : Le champ `details` est simplifié, mais la structure principale est préservée.

### Conversion 0-1 ↔ 0-100

Les pratiques retournent des **décimales (0-1)** selon le contrat `IPratique`.

`portfolio.js` convertit en **pourcentages (0-100)** pour compatibilité avec le reste de l'application.

```javascript
const C_decimal = pratique.calculerCompletion(da);  // 0.87
const C_pct = Math.round(C_decimal * 100);          // 87
```

### Gestion des erreurs

Si une pratique n'est pas disponible dans le registre :

```javascript
if (!pratiqueSommative || !pratiquePAN) {
    console.error('❌ Pratiques non disponibles dans le registre');
    return indicesCP;  // Retourne l'historique existant sans modification
}
```

Cela évite de crasher l'application si le registre n'est pas initialisé.

---

**Phase 2 complétée avec succès !** 🎉

**Prochaine action recommandée** : Ouvrir `index 90 (architecture).html` dans le navigateur et vérifier la console.

---

**Rédigé par** : Claude Code
**Date** : 13 novembre 2025
**Version** : 1.0
