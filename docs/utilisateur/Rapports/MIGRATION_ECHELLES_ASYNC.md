# Migration echelles.js vers IndexedDB async

## Date
6 décembre 2025

## Objectif
Remplacer tous les appels synchrones `db.getSync()` et `db.setSync()` par leurs versions asynchrones `await db.get()` et `await db.set()`.

## Statistiques de migration

### Occurrences remplacées
- **db.getSync** : 43 occurrences → `await db.get()`
- **db.setSync** : 28 occurrences → `await db.set()`
- **Total** : 71 occurrences

### Fonctions converties en async
**41 fonctions** ont été converties en `async` :

1. afficherToutesLesEchellesNiveaux
2. dupliquerEchelle
3. initialiserModuleEchelles
4. chargerEchellesTemplates
5. chargerEchelleTemplate
6. sauvegarderNomEchelle
7. enregistrerCommeEchelle
8. dupliquerEchelleActuelle
9. supprimerEchelle
10. chargerConfigurationEchelle
11. sauvegarderConfigEchelle
12. modifierNiveau
13. ajouterNiveau
14. supprimerNiveau
15. deplacerNiveauHaut
16. deplacerNiveauBas
17. basculerVerrouillageNiveau
18. reinitialiserNiveauxDefaut
19. sauvegarderNiveaux
20. genererNiveauxPersonnalises
21. chargerEchellePerformance
22. importerDansEchelleActive
23. importerEchelles
24. afficherListeEchelles
25. creerNouvelleEchelle
26. chargerEchellePourModif
27. modifierNiveauEchelle
28. ajouterNiveauEchelle
29. supprimerNiveauEchelle
30. deplacerNiveauEchelleHaut
31. deplacerNiveauEchelleBas
32. definirEchelleActive
33. dupliquerEchelleDepuisSidebar
34. verifierUtilisationEchelle
35. migrerEvaluationsVersNouvelleEchelle
36. supprimerEchelleDepuisSidebar
37. dupliquerEchelleActive
38. supprimerEchelleActive
39. sauvegarderEchelleComplete
40. exporterEchelles (déjà async)
41. exporterEchelleActive (déjà async)

## Exemples de modifications

### Avant (synchrone)
```javascript
function chargerEchellesTemplates() {
    const echelles = db.getSync('echellesTemplates', []);
    // ...
}

function sauvegarderNomEchelle() {
    let echelles = db.getSync('echellesTemplates', []);
    // ...
    db.setSync('echellesTemplates', echelles);
}
```

### Après (asynchrone)
```javascript
async function chargerEchellesTemplates() {
    const echelles = await db.get('echellesTemplates') || [];
    // ...
}

async function sauvegarderNomEchelle() {
    let echelles = await db.get('echellesTemplates') || [];
    // ...
    await db.set('echellesTemplates', echelles);
}
```

### Cas particulier : onclick

Les attributs `onclick` ont été wrappés dans des fonctions async :

**Avant :**
```html
<button onclick="chargerEchelleTemplate('ID')">Modifier</button>
```

**Après :**
```html
<button onclick="(async () => { await chargerEchelleTemplate('ID'); })()">Modifier</button>
```

## Fichiers affectés

### Fichier principal
- `/Users/kuekatsheu/Documents/GitHub/Monitorage_v6/js/echelles.js`

### Fichiers de backup
- `echelles-original-backup.js` : Backup du fichier original (30 nov 2025)
- `echelles.js.backup-YYYYMMDD-HHMMSS` : Backup daté automatique

## Changements requis dans index 93.html

### Cache buster à mettre à jour
```html
<!-- AVANT -->
<script src="js/echelles.js?v=2025113001"></script>

<!-- APRÈS -->
<script src="js/echelles.js?v=2025120601"></script>
```

### Appel de initialiserModuleEchelles

Si `initialiserModuleEchelles()` est appelée dans `main.js` ou ailleurs, il faut ajouter `await` :

```javascript
// AVANT
initialiserModuleEchelles();

// APRÈS
await initialiserModuleEchelles();
```

**Note** : Si la fonction appelante n'est pas `async`, elle doit aussi être convertie.

## Vérifications effectuées

✅ Aucun `db.getSync` ou `db.setSync` restant (sauf 2 occurrences dans commentaires)
✅ Toutes les fonctions utilisant `await` sont déclarées `async`
✅ Tous les appels de fonctions async ont `await` (sauf exports window)
✅ Les attributs `onclick` sont correctement wrappés
✅ Le fichier compilé a le même nombre de lignes (2633 lignes)

## Tests recommandés

1. **Test de chargement** : Vérifier que le module se charge sans erreur
2. **Test CRUD échelles** : Créer, modifier, supprimer une échelle
3. **Test niveaux** : Ajouter, modifier, supprimer des niveaux
4. **Test import/export** : Importer et exporter des échelles
5. **Test configuration** : Modifier la configuration globale
6. **Test aperçu** : Vérifier l'affichage de l'aperçu visuel

## Notes importantes

- **Compatibilité** : Cette migration est compatible avec l'architecture hybride IndexedDB (Beta 91.1+)
- **Performance** : Les opérations sont maintenant asynchrones mais restent rapides grâce au cache localStorage
- **Rollback** : Le fichier original est sauvegardé dans `echelles-original-backup.js`

## Prochaines étapes

1. Mettre à jour le cache buster dans index 93.html
2. Tester le module complètement
3. Si OK, supprimer les fichiers temporaires (`echelles-async.js`, `echelles-temp.js`, `echelles-final.js`)
4. Commit Git avec message explicite

## Auteur
Migration effectuée par Claude Code le 6 décembre 2025
