# Debug - Console navigateur

Documentation développeur déplacée depuis la section Aide (nettoyage pédagogique, avril 2026).

## Commandes à exécuter dans la console du navigateur (F12)

```javascript
// Vérifier calendrierComplet
console.log('calendrierComplet existe?', !!localStorage.getItem('calendrierComplet'));

// Voir contenu calendrier
JSON.parse(localStorage.getItem('calendrierComplet'));

// Vérifier indices A
console.log('Indices A existent?', !!localStorage.getItem('indicesAssiduiteDetailles'));

// Vérifier APIs disponibles
console.log('API calendrier:', typeof obtenirCalendrierComplet);
```
