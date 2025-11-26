# Tests console - Syntaxe correcte pour db.js

## Option 1: Fonction async auto-exécutée (RECOMMANDÉ)

Copiez-collez ce bloc complet dans la console:

```javascript
(async function() {
    // Test 1: Écriture et lecture
    await db.set('test', {message: 'Ça marche!'});
    const resultat = await db.get('test');
    console.log('✅ Test 1:', resultat);
    
    // Test 2: Tableau
    await db.set('etudiants_test', [
        {da: '1234567', nom: 'Dubois'},
        {da: '2345678', nom: 'Martin'}
    ]);
    const etudiants = await db.get('etudiants_test', []);
    console.log('✅ Test 2:', etudiants.length, 'étudiants');
    
    // Test 3: Info système
    const info = await db.info();
    console.log('✅ Test 3:', info);
})();
```

## Option 2: Commandes une par une (si console moderne)

Dans Safari/Chrome récents, tapez UNE ligne à la fois:

```javascript
await db.set('test', {message: 'Ça marche!'})
```
Puis Enter, puis:
```javascript
await db.get('test')
```

## Option 3: Sans await (callbacks)

Si await ne fonctionne pas, utilisez .then():

```javascript
db.set('test', {message: 'Ça marche!'}).then(() => {
    return db.get('test');
}).then(resultat => {
    console.log('Résultat:', resultat);
});
```

## Résultat attendu

Dans la console, vous devriez voir:

```
📊 [DB] IndexedDB détecté, initialisation...
✅ [DB] IndexedDB initialisé avec succès
✅ [DB] Base de données prête: IndexedDB
✅ Test 1: {message: "Ça marche!"}
✅ Test 2: 2 étudiants
✅ Test 3: {type: "IndexedDB", nbCles: 2, ready: true}
```
