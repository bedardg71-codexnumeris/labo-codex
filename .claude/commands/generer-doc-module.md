Génère la documentation technique d'un module existant :

**Format de documentation** :
````markdown
# Module [nom].js

## Vue d'ensemble
[Description du rôle du module]

## Type
- [ ] SOURCE - Génère et stocke des données
- [ ] LECTEUR - Lit et affiche des données

## Données gérées

**Stockage localStorage** :
- Clé : `[nomCle]`
- Format : `[description structure]`

**Exemple** :
```json
{
  "exemple": "de structure"
}
```

## API publique

### `fonction1(param)`
**Description** : [Que fait la fonction]  
**Paramètres** : 
- `param` (type) : Description  
**Retour** : (type) Description  
**Utilisation** :
```javascript
const resultat = fonction1(valeur);
```

## Dépendances

**Lit depuis** :
- localStorage.[cle1] (généré par module-source.js)
- localStorage.[cle2] (généré par module-source2.js)

**Utilisé par** :
- module-lecteur1.js (lit via API publique)
- module-lecteur2.js (lit via API publique)

## Initialisation
- Fonction : `initialiserModuleNom()`
- Appelée depuis : navigation.js / main.js
- Ordre de chargement : [position dans index.html]

## Tests

**Console navigateur** :
```javascript
// Tester disponibilité API
typeof fonction1 === 'function'

// Tester données localStorage
!!localStorage.getItem('[nomCle]')
```

**Tests fonctionnels** :
1. [Étape test 1]
2. [Étape test 2]
3. [Résultat attendu]

## Problèmes connus
- [Problème 1] : [Solution]
- [Problème 2] : [Solution]

## Historique
- [Date] : Création initiale
- [Date] : Refonte [description]
````

**Instructions** :
Applique ce format au module demandé en analysant son code source.