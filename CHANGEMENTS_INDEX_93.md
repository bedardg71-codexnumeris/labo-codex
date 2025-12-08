# Changements requis dans index 93.html

## Date
6 décembre 2025

## Fichier concerné
`/Users/kuekatsheu/Documents/GitHub/Monitorage_v6/index 93.html`

## Changements à effectuer

### 1. Mettre à jour le cache buster pour echelles.js

**Ligne à chercher** (environ ligne ~150-200) :
```html
<script src="js/echelles.js?v=2025113001"></script>
```

**Remplacer par** :
```html
<script src="js/echelles.js?v=2025120601"></script>
```

**Raison** : Le fichier `echelles.js` a été modifié (migration IndexedDB async)

### 2. (OPTIONNEL) Rendre main.js async pour initialiserModuleEchelles

Cette modification est **optionnelle** car `initialiserModuleEchelles()` peut fonctionner en mode "fire-and-forget" (sans await).

**Si vous voulez garantir que le module est complètement initialisé avant de continuer** :

#### Option A : Wrapper async dans main.js

Dans `js/main.js`, ligne 256, remplacer :
```javascript
if (typeof initialiserModuleEchelles === 'function') {
    console.log('   → Module 06-echelles détecté');
    initialiserModuleEchelles();
}
```

Par :
```javascript
if (typeof initialiserModuleEchelles === 'function') {
    console.log('   → Module 06-echelles détecté');
    initialiserModuleEchelles().catch(err => {
        console.error('   ⚠️  Erreur initialisation echelles:', err);
    });
}
```

**Avantage** : Capture les erreurs async
**Inconvénient** : Le code continue sans attendre la fin de l'initialisation

#### Option B : Rendre tout le bloc d'initialisation async (RECOMMANDÉ si vous voulez tout refactorer)

Wrapper tout le code d'initialisation dans une IIFE async :

```javascript
(async () => {
    // ... code existant ...
    
    if (typeof initialiserModuleEchelles === 'function') {
        console.log('   → Module 06-echelles détecté');
        await initialiserModuleEchelles();
    }
    
    // ... reste du code ...
})();
```

**Avantage** : Garantit que chaque module est initialisé dans l'ordre
**Inconvénient** : Nécessite de wrapper tout le code de main.js

### 3. (RECOMMANDATION) Ne rien faire pour l'instant

**Notre recommandation** : Ne modifiez **PAS** main.js pour l'instant.

**Raison** :
- `initialiserModuleEchelles()` fonctionne correctement en mode "fire-and-forget"
- Les opérations async internes seront exécutées correctement
- La seule différence est que le `console.log('✅ Module Échelles initialisé')` apparaîtra peut-être avant que tout soit chargé, mais ce n'est pas grave

**Test** : Si vous rencontrez des bugs (échelles non affichées, erreurs console), alors faites l'Option A ci-dessus.

## Résumé des changements OBLIGATOIRES

✅ **1 seul changement obligatoire** : Mettre à jour le cache buster dans index 93.html

```html
<!-- Chercher cette ligne -->
<script src="js/echelles.js?v=2025113001"></script>

<!-- La remplacer par -->
<script src="js/echelles.js?v=2025120601"></script>
```

## Tests après changements

1. Ouvrir index 93.html dans un navigateur
2. Ouvrir la console (F12)
3. Aller dans Matériel → Échelles de performance
4. Vérifier qu'il n'y a pas d'erreurs dans la console
5. Tester :
   - Créer une nouvelle échelle
   - Modifier une échelle existante
   - Ajouter/supprimer des niveaux
   - Dupliquer une échelle
   - Importer/exporter une échelle

## En cas de problème

Si vous voyez des erreurs comme :
- `Cannot read property 'get' of undefined`
- `db.get is not a function`
- Échelles qui ne s'affichent pas

**Solution** : Vérifiez que `js/db.js` est bien chargé **AVANT** `js/echelles.js` dans index 93.html

**Ordre correct** :
```html
<script src="js/db.js?v=2025112601"></script>
<!-- ... autres modules ... -->
<script src="js/echelles.js?v=2025120601"></script>
```

## Fichiers de backup créés

En cas de besoin de rollback :
- `js/echelles-original-backup.js` : Version originale (30 nov 2025)
- `js/echelles.js.backup-YYYYMMDD-HHMMSS` : Backup automatique daté

Pour restaurer :
```bash
cp js/echelles-original-backup.js js/echelles.js
```

Puis remettre le cache buster à `v=2025113001`.

