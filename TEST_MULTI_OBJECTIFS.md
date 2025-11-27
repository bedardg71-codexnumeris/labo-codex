# Test du Système Multi-Objectifs

**Date**: 26 novembre 2025
**Version**: Beta 91.1
**Auteur**: Grégoire Bédard (Labo Codex)

## Vue d'ensemble

Le système multi-objectifs permet d'évaluer chaque objectif d'apprentissage séparément avec des artefacts dédiés, puis de calculer une note finale pondérée selon l'importance de chaque objectif.

**Cas d'usage**: Michel B. - Calcul différentiel avec 13 objectifs pondérés

## Fonctions implémentées

### 1. Calcul par objectif (`portfolio.js`)

```javascript
// Calcule la performance pour chaque objectif
calculerPerformanceParObjectif(da, ensembleId)
→ { obj1: {P: 85, nbArtefacts: 5}, obj2: {P: 72, nbArtefacts: 3}, ... }

// Calcule la note finale pondérée
calculerNoteFinaleMultiObjectifs(da, ensembleId)
→ { noteFinale: 78.5, nbObjectifsEvalues: 13, performances: {...} }
```

### 2. Configuration (`objectifs.js`)

```javascript
// Activer la pratique multi-objectifs
activerPratiqueMultiObjectifs('objectifs-michel-calcul-diff')

// Vérifier l'état
verifierPratiqueMultiObjectifs()
→ { actif: true, ensembleId: '...', ensemble: {...} }

// Désactiver
desactiverPratiqueMultiObjectifs()
```

### 3. Données de démonstration

```javascript
// Créer l'ensemble d'objectifs de Michel (13 objectifs)
creerEnsembleCalculDiff()
→ 'objectifs-michel-calcul-diff'
```

## Procédure de test

### Étape 1: Créer l'ensemble d'objectifs

```javascript
// Dans la console du navigateur
const ensembleId = creerEnsembleCalculDiff();
console.log('Ensemble créé:', ensembleId);
```

**Résultat attendu**:
```
✅ Ensemble créé: "Calcul différentiel (201-NYA)" (13 objectifs, 100%)
```

### Étape 2: Créer des productions liées aux objectifs

Dans l'interface **Réglages → Productions**, créer des artefacts avec le champ `objectif` rempli:

```javascript
// Exemple: Production pour objectif "obj1"
{
  titre: "Quiz Limites",
  description: "Évaluation sur les limites et continuité",
  type: "quiz",
  ponderation: 10,
  objectif: "obj1",  // ← Lien vers l'objectif
  grilleId: "..."
}

// Répéter pour plusieurs objectifs (obj2, obj3, obj5, obj8, obj10)
```

### Étape 3: Créer des évaluations

Évaluer plusieurs étudiants sur différentes productions liées à différents objectifs.

**Exemple**:
- **Alya** (DA: 1234567)
  - Quiz Limites (obj1): 85%
  - Devoir Dérivées (obj2): 78%
  - Examen Optimisation (obj5): 92%
  - Quiz Intégration (obj8): 73%

### Étape 4: Activer la pratique multi-objectifs

```javascript
// Activer la pratique
activerPratiqueMultiObjectifs('objectifs-michel-calcul-diff');

// Vérifier
const etat = verifierPratiqueMultiObjectifs();
console.log('Pratique active?', etat.actif);
console.log('Ensemble:', etat.ensemble.nom);
```

**Résultat attendu**:
```
✅ [Multi-Objectifs] Pratique activée avec ensemble "Calcul différentiel (201-NYA)" (13 objectifs)
Pratique active? true
Ensemble: Calcul différentiel (201-NYA)
```

### Étape 5: Calculer les indices

```javascript
// Recalculer les indices C et P
calculerEtStockerIndicesCP();
```

**Résultat attendu** (dans la console):
```
🔄 Calcul DUAL des indices C et P (SOM + PAN) via registre de pratiques...
[Multi-Objectifs] Calcul pour DA 1234567 avec ensemble objectifs-michel-calcul-diff
[Multi-Objectifs] DA 1234567: 13 objectifs calculés
[Multi-Objectifs] Note finale DA 1234567: 82.3%
✅ Indices C et P sauvegardés (SOM + PAN)
```

### Étape 6: Vérifier les données stockées

```javascript
// Vérifier les indices pour un étudiant
const indices = obtenirIndicesCP('1234567', 'PAN');
console.log('Indice C:', indices.C);
console.log('Indice P:', indices.P);
console.log('Pratique multi-objectifs:', indices.details.pratiqueMultiObjectifs);
console.log('Performances par objectif:', indices.details.performancesObjectifs);
console.log('Note finale:', indices.details.noteFinaleMultiObjectifs);
```

**Résultat attendu**:
```javascript
{
  C: 87,
  P: 82,  // Note finale pondérée multi-objectifs
  details: {
    pratiqueMultiObjectifs: true,
    ensembleObjectifsId: 'objectifs-michel-calcul-diff',
    performancesObjectifs: {
      obj1: { P: 85, nbArtefacts: 3, artefacts: [...] },
      obj2: { P: 78, nbArtefacts: 2, artefacts: [...] },
      obj5: { P: 92, nbArtefacts: 1, artefacts: [...] },
      obj8: { P: 73, nbArtefacts: 1, artefacts: [...] },
      // ... autres objectifs null si non évalués
    },
    noteFinaleMultiObjectifs: {
      noteFinale: 82.3,
      nbObjectifsEvalues: 4,
      nbObjectifsSansNote: 9,
      poidsTotal: 41,  // obj1(6%) + obj2(8%) + obj5(15%) + obj8(12%)
      performances: { ... }
    }
  }
}
```

## Formule de calcul

### Performance par objectif (P_obj)

Pour chaque objectif:
1. Filtrer les évaluations liées à cet objectif
2. Trier par note décroissante
3. Prendre les N meilleurs (selon config PAN, défaut: 3)
4. Calculer la moyenne

```
P_obj = moyenne(N_meilleurs_artefacts_pour_cet_objectif)
```

### Note finale pondérée

```
Note_finale = Σ(P_obji × poids_i) / 100

Où:
- P_obji = Performance de l'objectif i (0-100%)
- poids_i = Poids de l'objectif i (%)
- Σ poids_i = 100%
```

**Exemple avec 4 objectifs évalués**:
```
obj1: P=85%, poids=6%  → contribution = 85 × 6 / 100 = 5.1
obj2: P=78%, poids=8%  → contribution = 78 × 8 / 100 = 6.24
obj5: P=92%, poids=15% → contribution = 92 × 15 / 100 = 13.8
obj8: P=73%, poids=12% → contribution = 73 × 12 / 100 = 8.76

Note_finale = 5.1 + 6.24 + 13.8 + 8.76 = 33.9%
```

**⚠️ Note importante**: Si tous les objectifs ne sont pas évalués, la note sera partielle. Dans l'exemple ci-dessus, seulement 41% du poids total est évalué (6+8+15+12), donc la note de 33.9% représente 33.9/41 = 82.7% de performance réelle sur les objectifs évalués.

## Cas d'usage réels

### Michel B. - Calcul différentiel

**Configuration**:
- 13 objectifs pondérés (total 100%)
- 3 meilleurs artefacts par objectif
- Évaluation continue tout au long de la session

**Objectifs** (extrait):
1. Limites et continuité (6%)
2. Dérivées - Définition (8%)
3. Règles de dérivation (8%)
4. Dérivées composées (7%)
5. Optimisation (15%) ← **Intégrateur**
...

**Avantages**:
- ✅ Suivi précis de la maîtrise par concept
- ✅ Identification rapide des lacunes spécifiques
- ✅ Pondération flexible selon importance pédagogique
- ✅ Permet reprises ciblées sur objectifs faibles
- ✅ Détection automatique des défis par objectif

## Prochaines étapes

### 1. Interface profil étudiant ✅ **COMPLÉTÉ**

**Implémenté le 26 novembre 2025**

Tableau des 13 objectifs dans le profil:

| Objectif | Type | Poids | P | Niveau | Statut |
|----------|------|-------|---|--------|--------|
| Limites et continuité | Fondamental | 6% | 85% | M | ✅ Force |
| Optimisation | Intégrateur | 15% | 68% | D | ⚠️ Défi |
| ... | ... | ... | ... | ... | ... |

**Fonction**: `genererTableauObjectifs(da, ensembleId, noteFinaleMultiObjectifs)` (profil-etudiant.js:3572-3752)

**Fonctionnalités**:
- Note finale pondérée avec formule Σ(P_objectif × poids) / 100
- Résumé forces et défis (nombre d'objectifs ≥ seuil vs < seuil)
- Tableau détaillé des 13 objectifs avec:
  - Nom et type (fondamental, intégrateur, transversal)
  - Poids en pourcentage
  - Performance (P) en pourcentage avec code couleur
  - Niveau IDME (I, D, M, E)
  - Statut (✅ Force ou ⚠️ Défi)
  - Nombre d'artefacts évalués par objectif
- Légende des types d'objectifs avec couleurs distinctes
- Styles CSS complets (`.tableau-objectifs-profil` dans styles.css:7333+)

### 2. Détection défis par objectif ✅ **COMPLÉTÉ**

**Implémenté le 26 novembre 2025**

Adaptation de `detecterDefis()` dans `pratique-configurable.js` pour identifier:
- ✅ Objectifs intégrateurs (poids ≥ 10%) avec P < 70% → **Alerte prioritaire**
- ✅ 3+ objectifs fondamentaux avec P < 75% → **Alerte générale**
- ✅ Objectifs transversaux faibles → **Suivi**

**Fonction**: `detecterDefis(da)` (pratique-configurable.js:256-391)

**Logique implémentée**:
```javascript
// Branch spécifique pour multi-objectifs
if (this.config.calcul_note.methode === 'pan_par_objectif') {
    // 1. Charger performances par objectif depuis indicesCP
    // 2. Itérer sur tous les objectifs de l'ensemble
    // 3. Classifier défis par type:
    //    - Intégrateurs: poids ≥ 10% ET P < 70% → priorité haute
    //    - Fondamentaux: P < 75% → compteur
    //    - Transversaux: P < 75% → suivi
    // 4. Alerte générale si 3+ fondamentaux faibles
    // 5. Retourner noms des objectifs en défi
}
```

**Seuils configurables**:
- `seuils.difficulte` (défaut: 70%) pour objectifs intégrateurs
- `seuils.acceptable` (défaut: 75%) pour objectifs fondamentaux/transversaux

**Logging console**: Affiche nombre de défis par catégorie

### 3. Graphiques d'évolution ⏳ **À VENIR**

- Évolution de P par objectif dans le temps
- Comparaison objectifs fondamentaux vs intégrateurs
- Radar chart des 13 objectifs
- Zones colorées par type d'objectif

**Prérequis**: Système de snapshots hebdomadaires (prévu Beta 92+)

### 4. Export rapports ⏳ **À VENIR**

- Rapport détaillé par objectif
- Recommandations ciblées selon type d'objectif
- Plan d'action personnalisé basé sur défis détectés

## Fichiers modifiés

1. **js/portfolio.js** (+195 lignes)
   - `calculerPerformanceParObjectif()`
   - `calculerNoteFinaleMultiObjectifs()`
   - Intégration dans `calculerEtStockerIndicesCP()`

2. **js/objectifs.js** (+86 lignes)
   - `activerPratiqueMultiObjectifs()`
   - `desactiverPratiqueMultiObjectifs()`
   - `verifierPratiqueMultiObjectifs()`

3. **js/profil-etudiant.js** (+180 lignes)
   - `genererTableauObjectifs()` (lignes 3572-3752)
   - Intégration dans `genererSectionPerformance()` (ligne 3754+)
   - CSS `.tableau-objectifs-profil` (styles.css:7333+)

4. **js/pratiques/pratique-configurable.js** (+135 lignes)
   - `detecterDefis()` amélioré (lignes 256-391)
   - Branch spécifique pour `pan_par_objectif`
   - Détection par type d'objectif (fondamental, intégrateur, transversal)

5. **js/productions.js** (déjà existant)
   - Champ `objectif` sauvegardé et affiché

## Support et documentation

- Guide complet: `ARCHITECTURE_PRATIQUES.md`
- Configuration: Section **Objectifs d'apprentissage**
- Démonstration: Ensemble Michel B. pré-configuré
- Test: `test-multi-objectifs.js` (script de validation complet)

---

**Statut**: ✅ Implémentation complète (moteur de calcul + interface profil + détection défis)
**Reste à faire**: Graphiques d'évolution (Beta 92+) + Export rapports (Beta 93+)
