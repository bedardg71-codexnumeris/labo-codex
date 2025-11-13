# Guide de test - Migration Phase 2

**Date** : 13 novembre 2025
**Objectif** : Valider que la délégation aux pratiques produit les mêmes résultats

---

## 🚀 Démarrage rapide (2 minutes)

### Étape 1 : Ouvrir l'application

Ouvrir `index 90 (architecture).html` dans Safari ou Chrome.

### Étape 2 : Ouvrir la console JavaScript

- **Safari** : Cmd + Option + C
- **Chrome** : Cmd + Option + J
- **Firefox** : Cmd + Option + K

### Étape 3 : Charger le script de test

Dans la console, copier-coller le contenu du fichier `test-migration-pratiques.js` et appuyer sur Entrée.

Tu devrais voir :

```
═══════════════════════════════════════════════════════
📋 SCRIPT DE TEST - Migration Phase 2
═══════════════════════════════════════════════════════

FONCTIONS DISPONIBLES :
...
```

### Étape 4 : Lancer le test complet

Dans la console, taper :

```javascript
testerMigrationPratiques()
```

Le script va :
1. ✅ Vérifier que le registre est chargé
2. 💾 Sauvegarder les valeurs actuelles
3. 🔄 Recalculer via le nouveau système
4. 🔍 Comparer les résultats
5. 📊 Générer un rapport détaillé

---

## 📊 Interpréter les résultats

### ✅ Test réussi

```
═══════════════════════════════════════════════════════
📊 ÉTAPE 5 : Rapport final
═══════════════════════════════════════════════════════

RÉSULTATS GLOBAUX :
-----------------------------------------------------------
Total étudiants testés     : 30
Résultats identiques       : 30 (100.0%)
Résultats différents       : 0
Différence maximale        : 0%
Tolérance acceptée         : ±1%

✅✅✅ TEST RÉUSSI ! ✅✅✅

Tous les calculs sont identiques (±1% tolérance).
La migration vers le registre de pratiques est validée.
```

**Signification** : La délégation aux pratiques fonctionne parfaitement. Les calculs sont identiques.

### ⚠️ Test avec différences

```
RÉSULTATS GLOBAUX :
-----------------------------------------------------------
Total étudiants testés     : 30
Résultats identiques       : 28 (93.3%)
Résultats différents       : 2
Différence maximale        : 2%

⚠️⚠️⚠️ TEST PARTIEL ⚠️⚠️⚠️

2 étudiant(s) ont des différences > 1%

ÉTUDIANTS AVEC DIFFÉRENCES :
-----------------------------------------------------------
[1234567] Ève Tremblay
   SOM: C=80→80 (Δ0), P=72→74 (Δ2)
   PAN: C=87→87 (Δ0), P=85→85 (Δ0)
```

**Signification** : Il y a des différences mineures. Causes possibles :
- Arrondis différents (acceptable si < 2%)
- Données modifiées entre les deux calculs
- Bug à investiguer (si > 2%)

---

## 🔍 Test individuel d'un étudiant

Pour tester un étudiant spécifique avec plus de détails :

```javascript
testerEtudiant("1234567")  // Remplacer par le DA de l'étudiant
```

Exemple de sortie :

```
═══════════════════════════════════════════════════════
🧪 TEST INDIVIDUEL - Étudiant DA: 1234567
═══════════════════════════════════════════════════════

📊 Calculs via pratiques :
-----------------------------------------------------------
Sommative :
  C (Complétion)  : 80.0%
  P (Performance) : 72.0%

PAN-Maîtrise :
  C (Complétion)  : 87.0%
  P (Performance) : 85.0%

📋 Valeurs dans indicesCP :
-----------------------------------------------------------
Sommative :
  C : 80%
  P : 72%

PAN-Maîtrise :
  C : 87%
  P : 85%

🔍 Différences :
-----------------------------------------------------------
SOM C : Δ0.0%
SOM P : Δ0.0%
PAN C : Δ0.0%
PAN P : Δ0.0%

✅ Résultats identiques (tolérance ±1%)
```

---

## 🐛 Dépannage

### Erreur : "Le registre de pratiques n'est pas chargé"

```
❌ ERREUR : Le registre de pratiques n'est pas chargé !
   Assurez-vous que pratique-registre.js est chargé.
```

**Solution** : Vérifier que `pratique-registre.js` est chargé dans le HTML.

```bash
grep "pratique-registre" "index 90 (architecture).html"
```

Devrait retourner :
```html
<script src="js/pratiques/pratique-registre.js"></script>
```

### Erreur : "Pratique non trouvée dans le registre"

```
❌ ERREUR : Pratique "sommative" non trouvée dans le registre
```

**Solution** : Vérifier que les pratiques sont enregistrées. Dans la console :

```javascript
listerPratiquesDisponibles()
```

Devrait retourner :
```javascript
[
  { id: 'sommative', nom: 'Sommative traditionnelle', ... },
  { id: 'pan-maitrise', nom: 'PAN-Maîtrise', ... }
]
```

Si la liste est vide, vérifier l'ordre de chargement des scripts dans le HTML :
1. `pratique-registre.js` (d'abord)
2. `pratique-pan-maitrise.js` (ensuite)
3. `pratique-sommative.js` (ensuite)

### Erreur : "Fonction calculerEtStockerIndicesCP() non disponible"

```
❌ ERREUR : Fonction calculerEtStockerIndicesCP() non disponible
```

**Solution** : La fonction n'est pas exportée. Vérifier dans `portfolio.js` :

```javascript
window.calculerEtStockerIndicesCP = calculerEtStockerIndicesCP;
```

### Warning : "Aucune donnée indicesCP trouvée"

```
⚠️ Aucune donnée indicesCP trouvée dans localStorage
   Le test va calculer les valeurs initiales...
```

**Explication** : C'est normal si c'est la première fois que tu lances l'application. Le script va calculer les valeurs initiales.

**Actions** :
1. Laisser le script terminer
2. Relancer le test : `testerMigrationPratiques()`
3. Cette fois, il devrait comparer avec les valeurs initiales

---

## 📝 Cas d'usage

### Cas 1 : Première utilisation (nouvelles données)

1. Ouvrir l'application
2. Charger des données (étudiants, évaluations)
3. Lancer `testerMigrationPratiques()`
4. Le test calcule les valeurs initiales
5. **Résultat** : Pas de comparaison possible (aucune valeur "avant")

**Recommandation** : Lancer le test deux fois :
- 1ère fois : Calcule les valeurs initiales
- 2ème fois : Compare avec les valeurs initiales

### Cas 2 : Application existante (migration)

1. Ouvrir l'application (avec données existantes)
2. Lancer `testerMigrationPratiques()`
3. Le test compare ancien calcul vs nouveau
4. **Résultat** : Rapport de comparaison détaillé

**Attendu** : Tous les résultats devraient être identiques (±1%)

### Cas 3 : Debugging d'un étudiant spécifique

1. Identifier un étudiant avec des différences
2. Lancer `testerEtudiant("DA_ETUDIANT")`
3. Analyser les différences par pratique (SOM vs PAN)
4. Vérifier les données sources (évaluations, productions)

---

## 🔬 Tests avancés

### Test avec reset complet

Pour tester le calcul à partir de zéro :

```javascript
// ATTENTION : Cela efface les données existantes !
localStorage.removeItem('indicesCP');
calculerEtStockerIndicesCP();

// Vérifier les nouvelles valeurs
const indices = JSON.parse(localStorage.getItem('indicesCP'));
console.log(indices);
```

### Test de performance

Pour mesurer le temps de calcul :

```javascript
console.time('Calcul indices');
calculerEtStockerIndicesCP();
console.timeEnd('Calcul indices');
// → Calcul indices: 125.34ms
```

### Test avec modification de données

Pour tester la réactivité aux changements :

```javascript
// 1. Calculer les valeurs initiales
testerMigrationPratiques();

// 2. Modifier une évaluation (dans l'interface)
// 3. Recalculer
calculerEtStockerIndicesCP();

// 4. Retester
testerMigrationPratiques();
```

---

## 📋 Checklist de validation

### Avant de valider la migration

- [ ] Le registre de pratiques est chargé
- [ ] Les 2 pratiques (SOM et PAN) sont enregistrées
- [ ] `testerMigrationPratiques()` réussit (100% identiques)
- [ ] Différence maximale < 1%
- [ ] Aucun message d'erreur dans la console
- [ ] Les profils étudiants affichent les bonnes valeurs
- [ ] Le tableau de bord affiche les bonnes valeurs
- [ ] Le mode comparatif fonctionne (SOM vs PAN)

### Tests manuels supplémentaires

- [ ] Ouvrir le profil de 3 étudiants différents
- [ ] Vérifier les valeurs C et P dans la section Mobilisation
- [ ] Vérifier les valeurs dans la section Performance
- [ ] Créer une nouvelle évaluation et vérifier recalcul automatique
- [ ] Modifier une évaluation existante et vérifier mise à jour

---

## 🎯 Critères de succès

### ✅ Test validé si :

1. **100% des étudiants** ont des résultats identiques (±1%)
2. **Différence maximale** < 1%
3. **Aucune erreur** dans la console
4. **Temps de calcul** < 500ms pour 30 étudiants
5. **Interface utilisateur** fonctionne normalement

### ⚠️ À investiguer si :

- 1-5% des étudiants ont des différences > 1%
- Différence maximale entre 1-2%
- Temps de calcul > 1 seconde

### ❌ Blocker si :

- > 5% des étudiants ont des différences > 2%
- Erreurs JavaScript dans la console
- Application crashe ou devient lente

---

## 🚀 Après validation

Une fois les tests réussis :

1. ✅ Créer un commit Git avec les changements
2. ✅ Mettre à jour la documentation (CLAUDE.md)
3. ✅ Archiver l'ancien code (commentaires)
4. ✅ Passer à la Phase 3 (si applicable)

---

## 📞 Support

En cas de problème :

1. Vérifier les messages d'erreur dans la console
2. Relire la section **Dépannage** de ce guide
3. Vérifier les fichiers modifiés :
   - `js/portfolio.js` (lignes 505-588)
   - `index 90 (architecture).html` (ligne 8779)
4. Consulter `PHASE_2_DELEGATION_COMPLETE.md` pour les détails

---

**Guide créé par** : Claude Code
**Date** : 13 novembre 2025
**Version** : 1.0
