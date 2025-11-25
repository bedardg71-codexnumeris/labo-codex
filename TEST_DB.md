# Tests de la couche d'abstraction db.js

## Date: 24 novembre 2025
## Version: Beta 91.5 (Migration IndexedDB)

---

## Comment tester

### 1. Ouvrir l'application dans le navigateur

```bash
open "index 91.html"
```

### 2. Ouvrir la console (F12 ou Cmd+Option+I)

### 3. Exécuter les tests suivants

#### Test 1: Vérifier l'initialisation
```javascript
// Vérifier que db est disponible
console.log(window.db);

// Voir le type de stockage utilisé
db.info().then(info => console.log('Info DB:', info));
```

**Résultat attendu:**
```
Info DB: {type: "IndexedDB", nbCles: 0, ready: true}
ou
Info DB: {type: "localStorage", nbCles: XX, ready: true}
```

---

#### Test 2: Écriture et lecture simple
```javascript
// Écrire une valeur
await db.set('test_migration', {message: 'Hello IndexedDB!', date: new Date()});

// Lire la valeur
const resultat = await db.get('test_migration');
console.log('Résultat:', resultat);
```

**Résultat attendu:**
```
Résultat: {message: "Hello IndexedDB!", date: "2025-11-24T..."}
```

---

#### Test 3: Valeurs par défaut
```javascript
// Lire une clé inexistante avec valeur par défaut
const defaut = await db.get('cle_inexistante', {valeur: 'défaut'});
console.log('Défaut:', defaut);
```

**Résultat attendu:**
```
Défaut: {valeur: "défaut"}
```

---

#### Test 4: Tableau et objets complexes
```javascript
// Écrire un tableau
await db.set('etudiants_test', [
  {da: '1234567', nom: 'Dubois', prenom: 'Alice'},
  {da: '2345678', nom: 'Martin', prenom: 'Bob'}
]);

// Lire le tableau
const etudiants = await db.get('etudiants_test', []);
console.log('Étudiants:', etudiants);
console.log('Nombre:', etudiants.length);
```

**Résultat attendu:**
```
Étudiants: [{da: "1234567", nom: "Dubois", ...}, {da: "2345678", ...}]
Nombre: 2
```

---

#### Test 5: Suppression
```javascript
// Supprimer une clé
await db.remove('test_migration');

// Vérifier qu'elle n'existe plus
const apres = await db.get('test_migration', null);
console.log('Après suppression:', apres);
```

**Résultat attendu:**
```
Après suppression: null
```

---

#### Test 6: Lister toutes les clés
```javascript
const keys = await db.keys();
console.log('Clés disponibles:', keys);
console.log('Nombre de clés:', keys.length);
```

**Résultat attendu:**
```
Clés disponibles: ["etudiants_test", "groupeEtudiants", "productions", ...]
Nombre de clés: XX
```

---

#### Test 7: Migration localStorage → IndexedDB (SI IndexedDB disponible)
```javascript
// Migrer toutes les données de localStorage vers IndexedDB
await db.migrateFromLocalStorage();
```

**Résultat attendu:**
```
🔄 [DB] Début migration localStorage → IndexedDB...
✅ [DB] Migration terminée: XX/XX clés migrées
```

---

## Résultats des tests

### Navigateur: Safari 18.1 (macOS Sequoia 15.5)
- [ ] Test 1: ✅ / ❌
- [ ] Test 2: ✅ / ❌
- [ ] Test 3: ✅ / ❌
- [ ] Test 4: ✅ / ❌
- [ ] Test 5: ✅ / ❌
- [ ] Test 6: ✅ / ❌
- [ ] Test 7: ✅ / ❌

### Navigateur: Chrome
- [ ] Test 1: ✅ / ❌
- [ ] Test 2: ✅ / ❌
- [ ] Test 3: ✅ / ❌
- [ ] Test 4: ✅ / ❌
- [ ] Test 5: ✅ / ❌
- [ ] Test 6: ✅ / ❌
- [ ] Test 7: ✅ / ❌

### Navigateur: Firefox
- [ ] Test 1: ✅ / ❌
- [ ] Test 2: ✅ / ❌
- [ ] Test 3: ✅ / ❌
- [ ] Test 4: ✅ / ❌
- [ ] Test 5: ✅ / ❌
- [ ] Test 6: ✅ / ❌
- [ ] Test 7: ✅ / ❌

---

## Notes

- **IndexedDB disponible**: OUI / NON
- **Fallback localStorage**: Fonctionne correctement OUI / NON
- **Performance**: Rapide / Lent / Problèmes
- **Erreurs console**: Aucune / Voir ci-dessous

### Erreurs rencontrées:
```
(Noter ici les erreurs éventuelles)
```

---

## Prochaines étapes

Une fois tous les tests validés (✅):
1. Commiter les changements
2. Commencer migration modules (Jour 2)
3. Tester avec données réelles (export/import)
