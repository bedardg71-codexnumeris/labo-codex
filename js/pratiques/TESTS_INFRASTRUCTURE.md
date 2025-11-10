# Tests d'infrastructure - Système de pratiques

## Objectif

Valider que l'infrastructure de base du système de pratiques fonctionne correctement avant d'implémenter les pratiques réelles (PAN-Maîtrise et Sommative).

---

## Prérequis

1. Ouvrir `index 90 (architecture).html` dans Safari ou Chrome
2. Ouvrir la console JavaScript (⌘+⌥+I sur macOS)
3. Vérifier qu'aucune erreur JavaScript n'apparaît au chargement

---

## Test 1 : Chargement des modules

### Vérifications attendues dans la console

Vous devriez voir ces messages de confirmation :

```
✅ Module pratique-registry.js chargé
✅ Module pratique-test.js chargé
✅ [PratiqueTest] Pratique de test enregistrée avec succès
💡 Pour tester, exécutez : testerPratiqueTest()
```

### Si messages absents

- **Problème** : Fichiers JS non chargés ou erreur de syntaxe
- **Solution** : Vérifier les chemins dans `<script>` tags, vérifier la console pour erreurs

---

## Test 2 : Enregistrement de pratique

### Commande à exécuter dans la console

```javascript
listerPratiquesDisponibles()
```

### Résultat attendu

```javascript
[
  {
    id: 'test',
    nom: 'Pratique de test',
    description: 'Pratique factice pour valider l\'infrastructure...',
    instance: PratiqueTest {...}
  }
]
```

### Validation

- ✅ Le tableau contient 1 élément
- ✅ L'ID est 'test'
- ✅ Le nom est 'Pratique de test'
- ✅ L'instance est un objet PratiqueTest

---

## Test 3 : Configuration pratique active

### Préparation : Configurer la pratique de test

```javascript
// Créer une configuration minimale
const config = {
  pratique: 'test',
  afficherSommatif: false,
  afficherAlternatif: false,
  seuils: {
    fragile: 0.70,
    acceptable: 0.80,
    bon: 0.85
  }
};
localStorage.setItem('modalitesEvaluation', JSON.stringify(config));
```

### Commande à exécuter

```javascript
obtenirPratiqueActive()
```

### Résultat attendu

```javascript
PratiqueTest {
  // ... méthodes obtenirNom, obtenirId, etc.
}
```

### Validation

- ✅ Retourne un objet (pas null)
- ✅ L'objet possède les méthodes IPratique
- ✅ Message console : "🎯 Pratique active : test (Pratique de test)"

---

## Test 4 : Détection automatique de l'ID

### Commande à exécuter

```javascript
obtenirIdPratiqueActive()
```

### Résultat attendu

```javascript
"test"
```

### Validation

- ✅ Retourne la chaîne "test"
- ✅ Correspond à la valeur dans `localStorage.modalitesEvaluation.pratique`

---

## Test 5 : Vérification de disponibilité

### Commandes à exécuter

```javascript
// Pratique existante
pratiqueEstDisponible('test')  // Doit retourner true

// Pratique inexistante
pratiqueEstDisponible('inexistante')  // Doit retourner false
```

### Validation

- ✅ 'test' retourne `true`
- ✅ 'inexistante' retourne `false`

---

## Test 6 : Obtention d'une pratique par ID

### Commandes à exécuter

```javascript
// Pratique existante
obtenirPratiqueParId('test')

// Pratique inexistante
obtenirPratiqueParId('inexistante')
```

### Résultats attendus

```javascript
// Pratique existante
PratiqueTest {...}  // Objet

// Pratique inexistante
null
```

### Validation

- ✅ 'test' retourne un objet PratiqueTest
- ✅ 'inexistante' retourne null

---

## Test 7 : Tests unitaires de la pratique de test

### Commande à exécuter

```javascript
testerPratiqueTest()
```

### Résultat attendu (dans la console)

```
=== DÉBUT DES TESTS DE LA PRATIQUE TEST ===

Test 1: Méthodes d'identité
  Nom: Pratique de test
  ID: test
  Description: Pratique factice pour valider l'infrastructure...
  ✅ Méthodes d'identité OK

Test 2: Calculs avec DA valide
  Performance: 0.75 (attendu: 0.75)
  Complétion: 0.80 (attendu: 0.80)
  ✅ Calculs OK

Test 3: Calculs avec DA invalide
  Performance: null (attendu: null)
  Complétion: null (attendu: null)
  ✅ Gestion erreurs OK

Test 4: Détection défis
  Type: test
  Nombre de défis: 2 (attendu: 2)
  Nombre de forces: 1 (attendu: 1)
  ✅ Défis OK

Test 5: Identification pattern
  Type: stable
  Description: Pattern de test - Stable
  Indices: {A: 0.85, C: 0.8, P: 0.75}
  ✅ Pattern OK

Test 6: Génération cible RàI
  Type: test
  Nombre de stratégies: 3 (attendu: 3)
  Nombre de ressources: 2 (attendu: 2)
  ✅ Cible RàI OK

=== FIN DES TESTS ===
Tous les tests sont passés avec succès ! ✅
```

### Validation

- ✅ Tous les tests affichent ✅
- ✅ Aucune erreur dans la console
- ✅ Les valeurs retournées correspondent aux valeurs attendues

---

## Test 8 : Gestion des erreurs

### Test 8.1 : Pratique non configurée

```javascript
// Supprimer la configuration
localStorage.removeItem('modalitesEvaluation');

// Tenter d'obtenir la pratique active
obtenirPratiqueActive()
```

**Résultat attendu** : `null` avec message console "⚠️ Aucune configuration trouvée..."

### Test 8.2 : Pratique inexistante configurée

```javascript
// Configurer une pratique inexistante
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'inexistante'
}));

// Tenter d'obtenir la pratique active
obtenirPratiqueActive()
```

**Résultat attendu** : `null` avec message console "Pratique 'inexistante' non trouvée..."

### Validation

- ✅ Aucune erreur JavaScript (pas de crash)
- ✅ Retourne null proprement
- ✅ Messages d'avertissement dans la console

---

## Test 9 : Invalidation du cache

### Commandes à exécuter

```javascript
// Configurer pratique 'test'
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'test'
}));

// Charger pratique (mise en cache)
const pratique1 = obtenirPratiqueActive();
console.log('Cache:', pratique1.obtenirId()); // 'test'

// Changer configuration SANS invalider cache
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'autre'
}));

// Essayer de charger (devrait retourner 'test' depuis cache)
const pratique2 = obtenirPratiqueActive();
console.log('Cache (avant invalidation):', pratique2 ? pratique2.obtenirId() : null);

// Invalider le cache
invaliderCachePratique();

// Charger à nouveau (devrait lire la nouvelle config)
const pratique3 = obtenirPratiqueActive();
console.log('Cache (après invalidation):', pratique3 ? pratique3.obtenirId() : null);
```

### Résultats attendus

```
Cache: test
Cache (avant invalidation): test
🔄 Cache de pratique invalidé
Cache (après invalidation): null  (car 'autre' n'existe pas)
```

### Validation

- ✅ Le cache fonctionne (évite lectures répétées)
- ✅ L'invalidation force le rechargement
- ✅ La nouvelle configuration est lue après invalidation

---

## Test 10 : Appels de méthodes IPratique

### Commandes à exécuter

```javascript
// Configurer la pratique de test
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'test'
}));

// Obtenir la pratique
const pratique = obtenirPratiqueActive();

// Tester chaque méthode
console.log('Nom:', pratique.obtenirNom());
console.log('ID:', pratique.obtenirId());
console.log('Description:', pratique.obtenirDescription());

const da = '1234567';
console.log('Performance:', pratique.calculerPerformance(da));
console.log('Complétion:', pratique.calculerCompletion(da));
console.log('Défis:', pratique.detecterDefis(da));
console.log('Pattern:', pratique.identifierPattern(da));
console.log('Cible RàI:', pratique.genererCibleIntervention(da));
```

### Validation

- ✅ Toutes les méthodes retournent des valeurs
- ✅ Les types de retour sont corrects (string, number, object)
- ✅ Aucune erreur dans la console

---

## Checklist finale

Avant de passer à Phase 3, vérifier que :

- [ ] Tous les modules se chargent sans erreur
- [ ] La pratique de test est enregistrée automatiquement
- [ ] Le registre liste correctement la pratique
- [ ] La détection automatique fonctionne
- [ ] Toutes les méthodes IPratique sont appelables
- [ ] La gestion des erreurs est robuste (null, avertissements)
- [ ] Le cache fonctionne et peut être invalidé
- [ ] `testerPratiqueTest()` passe tous les tests ✅

---

## Nettoyage après tests

### Supprimer la configuration de test

```javascript
localStorage.removeItem('modalitesEvaluation');
```

### Désenregistrer la pratique de test (optionnel)

```javascript
desenregistrerPratique('test');
viderRegistre();
```

---

## Prochaine étape

Une fois tous les tests passés ✅, passer à **PHASE 3 : Extraction PAN-Maîtrise**.

---

**Version** : 1.0
**Date** : 11 novembre 2025
**Auteur** : Grégoire Bédard (Labo Codex)
