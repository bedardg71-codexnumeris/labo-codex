# Tests PAN-Maîtrise - Validation extraction

## Objectif

Valider que la pratique PAN-Maîtrise fonctionne correctement et produit des résultats identiques au code original.

---

## Prérequis

1. Ouvrir `index 90 (architecture).html` dans Safari ou Chrome
2. Ouvrir la console JavaScript (⌘+⌥+I sur macOS)
3. Avoir des données de test (groupe 00001 ou données démo)

---

## Test 1 : Chargement du module

### Vérifications attendues dans la console

```
✅ Module pratique-registre.js chargé
✅ Module pratique-test.js chargé
✅ [PratiqueTest] Pratique de test enregistrée avec succès
✅ Module pratique-pan-maitrise.js chargé
🎯 Initialisation de la pratique PAN-Maîtrise
✅ [PAN] Pratique PAN-Maîtrise enregistrée avec succès
```

### Validation

- ✅ Aucune erreur JavaScript
- ✅ Message de chargement du module
- ✅ Message d'enregistrement de la pratique

---

## Test 2 : Enregistrement de la pratique

### Commande console

```javascript
listerPratiquesDisponibles()
```

### Résultat attendu

```javascript
[
  {
    id: 'test',
    nom: 'Pratique de test',
    description: '...',
    instance: PratiqueTest {...}
  },
  {
    id: 'pan-maitrise',
    nom: 'PAN-Maîtrise',
    description: 'Pratique PAN-Maîtrise basée sur les N meilleurs...',
    instance: PratiquePANMaitrise {...}
  }
]
```

### Validation

- ✅ 2 pratiques enregistrées
- ✅ 'pan-maitrise' présente dans la liste
- ✅ Instance est de type PratiquePANMaitrise

---

## Test 3 : Configuration de la pratique active

### Préparation

```javascript
// Configurer PAN-Maîtrise comme pratique active
const config = {
  pratique: 'pan-maitrise',
  afficherSommatif: false,
  afficherAlternatif: true,
  configPAN: {
    nombreCours: 3,      // 3 cours dans le programme
    nombreARetenir: 3    // 3 meilleurs artefacts
  },
  seuils: {
    fragile: 0.70,
    acceptable: 0.80,
    bon: 0.85
  }
};
localStorage.setItem('modalitesEvaluation', JSON.stringify(config));
```

### Commande console

```javascript
obtenirPratiqueActive()
```

### Résultat attendu

```javascript
PratiquePANMaitrise {
  // ... méthodes
}
```

### Validation

- ✅ Retourne instance PratiquePANMaitrise
- ✅ Message console : "🎯 Pratique active : pan-maitrise (PAN-Maîtrise)"

---

## Test 4 : Calcul indice P (Performance)

### Avec DA valide (ex: étudiant groupe 00001)

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567'; // Remplacer par un DA réel
const indiceP = pratique.calculerPerformance(daTest);

console.log('Indice P:', indiceP);
console.log('Indice P (%):', (indiceP * 100).toFixed(1) + '%');
```

### Validation

- ✅ Retourne un nombre entre 0 et 1
- ✅ Message console : "[PAN] Performance DA xxx: xx.x% (n/3 artefacts)"
- ✅ Le nombre d'artefacts correspond à la config (3 max)

### Avec DA invalide

```javascript
const indiceP = pratique.calculerPerformance('123'); // Trop court
console.log('Résultat:', indiceP); // Doit être null
```

### Validation

- ✅ Retourne null
- ✅ Message d'avertissement dans la console

---

## Test 5 : Calcul indice C (Complétion)

### Avec DA valide

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567'; // Remplacer par un DA réel
const indiceC = pratique.calculerCompletion(daTest);

console.log('Indice C:', indiceC);
console.log('Indice C (%):', (indiceC * 100).toFixed(1) + '%');
```

### Validation

- ✅ Retourne un nombre entre 0 et 1
- ✅ Message console : "[PAN] Complétion DA xxx: xx.x% (n/total)"
- ✅ Le calcul reflète artefacts remis / total attendu

---

## Test 6 : Détection des défis SRPNF

### Avec DA ayant des évaluations

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567';
const defis = pratique.detecterDefis(daTest);

console.log('Type:', defis.type); // 'srpnf'
console.log('Défis:', defis.defis);
console.log('Forces:', defis.forces);
console.log('Principal défi:', defis.principalDefi);
console.log('Principale force:', defis.principaleForce);
```

### Résultat attendu

```javascript
{
  type: 'srpnf',
  defis: [
    { nom: 'Nuance', cle: 'nuance', score: 0.68 },
    ...
  ],
  forces: [
    { nom: 'Structure', cle: 'structure', score: 0.82 },
    ...
  ],
  principalDefi: { nom: 'Nuance', cle: 'nuance', score: 0.68 },
  principaleForce: { nom: 'Structure', cle: 'structure', score: 0.82 }
}
```

### Validation

- ✅ Type est 'srpnf'
- ✅ Défis sont triés par score croissant (plus faible en premier)
- ✅ Forces sont triées par score décroissant (plus forte en premier)
- ✅ Principal défi est le critère avec le score le plus faible (< 75%)

---

## Test 7 : Identification du pattern

### Avec DA valide

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567';
const pattern = pratique.identifierPattern(daTest);

console.log('Type:', pattern.type);
console.log('Description:', pattern.description);
console.log('Indices:', pattern.indices);
console.log('Couleur:', pattern.couleur);
console.log('Recommandation:', pattern.recommandation);
```

### Résultat attendu (selon performance)

```javascript
// Exemple: Blocage émergent
{
  type: 'Blocage émergent',
  description: 'Blocage émergent - Performance en développement avec défis',
  indices: {
    P: 0.68,
    nbArtefacts: 3
  },
  couleur: '#ff9800',
  recommandation: 'Intervention préventive ciblée (Niveau 2 RàI)'
}
```

### Validation selon performance

| Performance | Défis | Pattern attendu |
|-------------|-------|-----------------|
| < 64% | - | Blocage critique |
| 65-74% | Oui | Blocage émergent |
| 65-74% | Non | Stable |
| 75-84% | Oui | Défi spécifique |
| 75-84% | Non | Stable |
| ≥ 85% | - | Stable |

---

## Test 8 : Génération cible RàI

### Avec DA valide

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567';
const cible = pratique.genererCibleIntervention(daTest);

console.log('Type:', cible.type);
console.log('Cible:', cible.cible);
console.log('Niveau RàI:', cible.niveau);
console.log('Stratégies:', cible.strategies);
console.log('Ressources:', cible.ressources);
console.log('Couleur:', cible.couleur);
console.log('Emoji:', cible.emoji);
```

### Résultat attendu (selon pattern et défi)

```javascript
// Exemple: Blocage émergent + défi Structure
{
  type: 'critere-srpnf',
  cible: 'Remédiation en Structure',
  niveau: 2,
  strategies: [
    'Pratique de plans détaillés',
    'Feedback formatif sur la structure',
    'Comparaison de textes exemplaires'
  ],
  ressources: [
    'Guide de rétroaction formative',
    'Capsules vidéo sur les critères SRPNF',
    'Grilles d\'auto-évaluation'
  ],
  couleur: '#ff9800',
  emoji: '🟠'
}
```

### Validation

- ✅ Niveau RàI cohérent avec pattern (3=critique, 2=émergent, 1=spécifique/stable)
- ✅ Cible mentionne le défi principal
- ✅ Stratégies sont spécifiques au défi
- ✅ Ressources sont présentes

---

## Test 9 : Comparaison avec code original

### Prérequis
- Avoir des données de test dans l'ancien système
- Connaître les résultats attendus

### Commandes

```javascript
// Nouveau système (pratique-pan-maitrise.js)
const pratique = obtenirPratiqueActive();
const daTest = '1234567';

const nouveauP = pratique.calculerPerformance(daTest);
const nouveauC = pratique.calculerCompletion(daTest);
const nouveauxDefis = pratique.detecterDefis(daTest);
const nouveauPattern = pratique.identifierPattern(daTest);

console.log('=== NOUVEAU SYSTÈME ===');
console.log('P:', (nouveauP * 100).toFixed(1) + '%');
console.log('C:', (nouveauC * 100).toFixed(1) + '%');
console.log('Défis:', nouveauxDefis.defis.map(d => d.nom));
console.log('Pattern:', nouveauPattern.type);

// Ancien système (profil-etudiant.js - fonctions globales)
const anciensDefis = diagnostiquerForcesChallenges(
  calculerMoyennesCriteresRecents(daTest)
);

console.log('=== ANCIEN SYSTÈME ===');
console.log('Défis:', anciensDefis.defis.map(d => d.nom));
```

### Validation

- ✅ Indice P identique (±0.1%)
- ✅ Indice C identique (±0.1%)
- ✅ Même liste de défis SRPNF
- ✅ Même pattern identifié
- ✅ Même ordre de priorité des défis

---

## Test 10 : Configuration dynamique

### Test avec 3 cours (6 artefacts)

```javascript
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'pan-maitrise',
  configPAN: { nombreCours: 3, nombreARetenir: 3 }
}));
invaliderCachePratique(); // Forcer rechargement
const pratique = obtenirPratiqueActive();
const indiceP = pratique.calculerPerformance('1234567');
// Vérifier console: doit mentionner "3 meilleurs artefacts"
```

### Test avec 7 cours (14 artefacts)

```javascript
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'pan-maitrise',
  configPAN: { nombreCours: 7, nombreARetenir: 5 }
}));
invaliderCachePratique();
const pratique = obtenirPratiqueActive();
const indiceP = pratique.calculerPerformance('1234567');
// Vérifier console: doit mentionner "5 meilleurs artefacts"
```

### Validation

- ✅ Configuration lue correctement
- ✅ Nombre d'artefacts retenus correspond à nombreARetenir
- ✅ Calculs s'adaptent à la configuration

---

## Test 11 : Edge cases

### Étudiant sans évaluations

```javascript
const pratique = obtenirPratiqueActive();
const daSansEval = '9999999';

console.log('P:', pratique.calculerPerformance(daSansEval)); // null
console.log('C:', pratique.calculerCompletion(daSansEval)); // 0 ou null
console.log('Défis:', pratique.detecterDefis(daSansEval)); // { type: 'srpnf', defis: [], forces: [] }
```

### DA invalide

```javascript
const pratique = obtenirPratiqueActive();

console.log('P:', pratique.calculerPerformance('123')); // null (trop court)
console.log('C:', pratique.calculerCompletion('')); // null (vide)
console.log('Pattern:', pratique.identifierPattern(null)); // { type: 'inconnu', ... }
```

### Validation

- ✅ Retourne null ou valeurs par défaut sécuritaires
- ✅ Aucun crash JavaScript
- ✅ Messages d'avertissement dans la console

---

## Test 12 : Intégration avec localStorage

### Vérifier lecture évaluations

```javascript
const pratique = obtenirPratiqueActive();

// Ajouter temporairement une évaluation
const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
console.log('Nombre évaluations avant:', evaluations.length);

// Calculer performance
const indiceP = pratique.calculerPerformance('1234567');

// Vérifier que la pratique a bien lu les évaluations
console.log('Indice P calculé:', indiceP);
```

### Validation

- ✅ Pratique lit correctement evaluationsSauvegardees
- ✅ Pratique lit correctement productions
- ✅ Pratique lit correctement modalitesEvaluation

---

## Checklist finale Phase 3

Avant de passer à Phase 4, vérifier que :

- [ ] Module se charge sans erreur
- [ ] Pratique PAN-Maîtrise enregistrée dans le registre
- [ ] calculerPerformance() retourne valeurs cohérentes
- [ ] calculerCompletion() retourne valeurs cohérentes
- [ ] detecterDefis() identifie correctement défis SRPNF
- [ ] identifierPattern() retourne pattern correct
- [ ] genererCibleIntervention() retourne cibles personnalisées
- [ ] Configuration dynamique fonctionne (3, 7, 12 cours)
- [ ] Résultats identiques au code original (±0.1%)
- [ ] Edge cases gérés proprement (null, DA invalide)
- [ ] Aucun crash en cas de données manquantes

---

## Prochaine étape

Une fois tous les tests passés ✅, passer à **PHASE 4 : Implémentation Sommative**.

---

**Version** : 1.0
**Date** : 11 novembre 2025
**Auteur** : Grégoire Bédard (Labo Codex)
