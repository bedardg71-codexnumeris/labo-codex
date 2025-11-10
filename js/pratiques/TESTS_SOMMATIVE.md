# Tests Sommative - Validation implémentation

## Objectif

Valider que la pratique Sommative fonctionne correctement et produit des résultats différents de PAN-Maîtrise.

---

## Prérequis

1. Ouvrir `index 90 (architecture).html` dans Safari ou Chrome
2. Ouvrir la console JavaScript (⌘+⌥+I sur macOS)
3. Avoir des données de test

---

## Test 1 : Chargement du module

### Vérifications attendues dans la console

```
✅ Module pratique-registry.js chargé
✅ Module pratique-test.js chargé
✅ Module pratique-pan-maitrise.js chargé
✅ Module pratique-sommative.js chargé
📊 Initialisation de la pratique Sommative
✅ [SOM] Pratique Sommative enregistrée avec succès
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
  { id: 'test', nom: 'Pratique de test', ... },
  { id: 'pan-maitrise', nom: 'PAN-Maîtrise', ... },
  { id: 'sommative', nom: 'Sommative traditionnelle', ... }
]
```

### Validation

- ✅ 3 pratiques enregistrées
- ✅ 'sommative' présente dans la liste
- ✅ Instance est de type PratiqueSommative

---

## Test 3 : Configuration de la pratique active

### Préparation

```javascript
// Configurer Sommative comme pratique active
const config = {
  pratique: 'sommative',
  afficherSommatif: true,
  afficherAlternatif: false,
  seuils: {
    fragile: 0.70,
    acceptable: 0.80,
    bon: 0.85
  }
};
localStorage.setItem('modalitesEvaluation', JSON.stringify(config));
invaliderCachePratique(); // Forcer rechargement
```

### Commande console

```javascript
obtenirPratiqueActive()
```

### Résultat attendu

```javascript
PratiqueSommative {
  // ... méthodes
}
```

### Validation

- ✅ Retourne instance PratiqueSommative
- ✅ Message console : "📊 Pratique active : sommative (Sommative traditionnelle)"

---

## Test 4 : Calcul indice P (Performance)

### Avec DA valide

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567'; // Remplacer par un DA réel
const indiceP = pratique.calculerPerformance(daTest);

console.log('Indice P:', indiceP);
console.log('Indice P (%):', (indiceP * 100).toFixed(1) + '%');
```

### Résultat attendu

- Message console : "[SOM] Performance DA xxx: xx.x% (n évaluations)"
- Calcul basé sur moyenne pondérée de TOUTES les évaluations

### Validation

- ✅ Retourne un nombre entre 0 et 1
- ✅ Nombre d'évaluations = toutes (pas juste artefacts)
- ✅ Prend en compte les pondérations

---

## Test 5 : Calcul indice C (Complétion)

### Avec DA valide

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567';
const indiceC = pratique.calculerCompletion(daTest);

console.log('Indice C:', indiceC);
console.log('Indice C (%):', (indiceC * 100).toFixed(1) + '%');
```

### Résultat attendu

- Message console : "[SOM] Complétion DA xxx: xx.x% (n/total)"
- Calcul basé sur TOUTES les productions (examens, travaux, quiz, artefacts)

### Validation

- ✅ Retourne un nombre entre 0 et 1
- ✅ Inclut toutes les productions (pas juste artefacts portfolio)

---

## Test 6 : Détection des défis génériques

### Avec DA ayant des évaluations

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567';
const defis = pratique.detecterDefis(daTest);

console.log('Type:', defis.type); // 'generique'
console.log('Défis:', defis.defis);
console.log('Tendance:', defis.tendance);
console.log('Statistiques:', defis.statistiques);
```

### Résultat attendu

```javascript
{
  type: 'generique',
  defis: [
    { type: 'note-faible', production: 'Examen 2', note: 55, seuil: 60, priorite: 'haute' },
    { type: 'tendance-baisse', variation: -12, priorite: 'haute' },
    { type: 'irregularite', ecartType: 18, priorite: 'moyenne' }
  ],
  tendance: {
    direction: 'baisse',
    variation: -12,
    moyenneRecente: 68,
    moyenneAncienne: 80
  },
  statistiques: {
    moyenne: 72,
    ecartType: 18,
    min: 45,
    max: 95
  }
}
```

### Validation

- ✅ Type est 'generique' (pas 'srpnf')
- ✅ Défis basés sur notes faibles (< 60%)
- ✅ Défis basés sur tendance (baisse > -10)
- ✅ Défis basés sur irrégularité (écart-type > 15)
- ✅ Tendance calculée (hausse/baisse/stable)

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
{
  type: 'blocage-emergent',
  description: 'Blocage émergent - Assiduité présente mais performance faible',
  indices: {
    A: 0.85,
    C: 0.70,
    P: 0.62,
    R: 0.63
  },
  couleur: '#ff9800',
  recommandation: 'Intervention préventive ciblée (Niveau 2 RàI)'
}
```

### Validation selon A-C-P-R

| Condition | Pattern attendu |
|-----------|-----------------|
| P < 60% OU R > 70% | blocage-critique |
| A ≥ 75% ET (C < 65% OU P < 65%) | blocage-emergent |
| P ∈ [70-80%] ET défis | defi-specifique |
| P ∈ [80-85%] | stable |
| P ≥ 85% | progression |

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

### Résultat attendu

```javascript
{
  type: 'production-faible',
  cible: 'Reprise obligatoire : Examen 2',
  niveau: 3,
  strategies: [
    'Rencontre individuelle pour identifier les obstacles',
    'Plan de rattrapage détaillé avec échéances',
    'Jeton de reprise disponible (sous conditions)',
    'Suivi hebdomadaire des progrès'
  ],
  ressources: [
    'Services adaptés (SA)',
    'Centre d\'aide (CAF)',
    'Mentorat par les pairs',
    'Capsules de révision'
  ],
  couleur: '#dc3545',
  emoji: '🔴'
}
```

### Validation

- ✅ Type est 'production-faible' (pas 'critere-srpnf')
- ✅ Cible mentionne une production (pas un critère SRPNF)
- ✅ Stratégies centrées sur rattrapage/reprise
- ✅ Niveau RàI cohérent avec pattern

---

## Test 9 : Comparaison PAN vs Sommative

### Configuration pour comparaison

```javascript
// Tester avec MÊME DA pour comparer

// Test PAN
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'pan-maitrise',
  configPAN: { nombreCours: 3, nombreARetenir: 3 }
}));
invaliderCachePratique();

const pratiquePAN = obtenirPratiqueActive();
const daTest = '1234567'; // DA avec données
const P_pan = pratiquePAN.calculerPerformance(daTest);
const C_pan = pratiquePAN.calculerCompletion(daTest);
const defis_pan = pratiquePAN.detecterDefis(daTest);

console.log('=== PAN-MAÎTRISE ===');
console.log('P:', (P_pan * 100).toFixed(1) + '%');
console.log('C:', (C_pan * 100).toFixed(1) + '%');
console.log('Défis:', defis_pan.defis.map(d => d.nom || d.type));

// Test Sommative
localStorage.setItem('modalitesEvaluation', JSON.stringify({
  pratique: 'sommative'
}));
invaliderCachePratique();

const pratiqueSOM = obtenirPratiqueActive();
const P_som = pratiqueSOM.calculerPerformance(daTest);
const C_som = pratiqueSOM.calculerCompletion(daTest);
const defis_som = pratiqueSOM.detecterDefis(daTest);

console.log('=== SOMMATIVE ===');
console.log('P:', (P_som * 100).toFixed(1) + '%');
console.log('C:', (C_som * 100).toFixed(1) + '%');
console.log('Défis:', defis_som.defis.map(d => d.type));
```

### Validation des différences

**Indice P** :
- ✅ PAN : Moyenne N meilleurs artefacts
- ✅ SOM : Moyenne pondérée TOUTES évaluations
- ✅ Valeurs différentes (sauf cas particuliers)

**Indice C** :
- ✅ PAN : Artefacts portfolio uniquement
- ✅ SOM : Toutes productions
- ✅ Valeurs potentiellement différentes

**Défis** :
- ✅ PAN : SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
- ✅ SOM : Génériques (note-faible, tendance-baisse, irregularite)
- ✅ Types complètement différents

**Cibles RàI** :
- ✅ PAN : Critères SRPNF à renforcer
- ✅ SOM : Productions à refaire/rattraper
- ✅ Stratégies adaptées au contexte

---

## Test 10 : Edge cases

### Étudiant sans évaluations

```javascript
const pratique = obtenirPratiqueActive();
const daSansEval = '9999999';

console.log('P:', pratique.calculerPerformance(daSansEval)); // null
console.log('C:', pratique.calculerCompletion(daSansEval)); // 0 ou null
console.log('Défis:', pratique.detecterDefis(daSansEval)); // { type: 'generique', defis: [] }
```

### DA invalide

```javascript
const pratique = obtenirPratiqueActive();

console.log('P:', pratique.calculerPerformance('123')); // null
console.log('C:', pratique.calculerCompletion('')); // null
console.log('Pattern:', pratique.identifierPattern(null)); // { type: 'inconnu', ... }
```

### Validation

- ✅ Retourne null ou valeurs par défaut sécuritaires
- ✅ Aucun crash JavaScript
- ✅ Messages d'avertissement dans la console

---

## Test 11 : Tendance et statistiques

### Avec DA ayant plusieurs évaluations

```javascript
const pratique = obtenirPratiqueActive();
const daTest = '1234567';
const defis = pratique.detecterDefis(daTest);

console.log('Tendance:', defis.tendance);
console.log('  Direction:', defis.tendance.direction); // 'hausse' | 'baisse' | 'stable'
console.log('  Variation:', defis.tendance.variation); // Différence en %
console.log('  Récente:', defis.tendance.moyenneRecente);
console.log('  Ancienne:', defis.tendance.moyenneAncienne);

console.log('Statistiques:', defis.statistiques);
console.log('  Moyenne:', defis.statistiques.moyenne);
console.log('  Écart-type:', defis.statistiques.ecartType);
console.log('  Min:', defis.statistiques.min);
console.log('  Max:', defis.statistiques.max);
```

### Validation

- ✅ Tendance calculée correctement (1/3 récent vs 1/3 ancien)
- ✅ Direction basée sur variation (±5%)
- ✅ Statistiques descriptives correctes

---

## Checklist finale Phase 4

Avant de passer à Phase 5, vérifier que :

- [ ] Module se charge sans erreur
- [ ] Pratique Sommative enregistrée dans le registre
- [ ] calculerPerformance() retourne moyenne pondérée TOUTES évaluations
- [ ] calculerCompletion() retourne ratio TOUTES productions
- [ ] detecterDefis() identifie défis génériques (pas SRPNF)
- [ ] identifierPattern() retourne pattern universel basé sur A-C-P
- [ ] genererCibleIntervention() retourne cibles productions (pas critères)
- [ ] Tendance calculée correctement (hausse/baisse/stable)
- [ ] Statistiques descriptives correctes
- [ ] Résultats DIFFÉRENTS de PAN-Maîtrise
- [ ] Edge cases gérés proprement

---

## Prochaine étape

Une fois tous les tests passés ✅, passer à **PHASE 5 : Migration modules existants**.

---

**Version** : 1.0
**Date** : 11 novembre 2025
**Auteur** : Grégoire Bédard (Labo Codex)
