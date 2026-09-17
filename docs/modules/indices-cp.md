# Module Indices C-P

**Fichier principal** : `js/portfolio.js` (ancien nom, sera renomme indices-cp.js)
**Version** : Beta 95
**Derniere mise a jour** : 1er janvier 2026

---

## Objectif

Calculer et stocker les indices C (Completion) et P (Performance) pour tous les etudiants.

---

## Les indices A-C-P

### Assiduite (A)
- **Source** : `saisie-presences.js`
- **Stockage** : `indicesAssiduiteDetailles`
- **Description** : Mesure l'engagement cognitif (presence en classe)

### Completion (C)
- **Source** : `portfolio.js`
- **Stockage** : `indicesCP`
- **Description** : Mesure la mobilisation (remise des travaux)

### Performance (P)
- **Source** : `portfolio.js`
- **Stockage** : `indicesCP`
- **Description** : Mesure la maitrise (qualite des productions)

---

## Architecture de delegation

**Principe** : Le calcul de P depend de la pratique configuree.

```
portfolio.js (orchestrateur)
    | appelle
pratique-registre.js
    | retourne instance
pratique-pan-maitrise.js | pratique-sommative.js | ...
    | calcule
indices C et P specifiques a la pratique
```

### Code type

```javascript
const pratique = obtenirPratiqueParId(pratiqueActive);
const performance = pratique.calculerPerformance(da);
const completion = pratique.calculerCompletion(da);
```

---

## Pratiques supportees

### PAN-Maitrise (Gregoire)
- Echelle IDME (Insuffisant, Developpement, Maitrise, Etendu)
- Criteres SRPNF (Structure, Rigueur, Plausibilite, Nuance, Francais)
- N meilleurs artefacts

### Sommative
- Moyenne ponderee de toutes les evaluations
- Detection defis generiques (< 65%)

### PAN-Standards
- Par objectifs ou par artefacts
- 4 modes de calcul : comptage, moyenne ponderee, seuils critiques, holistique

---

## Structure des donnees

```javascript
indicesCP[da] = {
    actuel: {
        C: 0.85,           // Completion 0-1
        P: 0.72,           // Performance 0-1
        dernierCalcul: "2026-01-01T10:00:00"
    },
    historique: [
        { date: "2025-12-15", C: 0.80, P: 0.70 }
    ]
}
```

---

## API publique

```javascript
// Calcul et stockage
calculerEtStockerIndicesCP()           // Recalcule les indices de TOUT le groupe, exclus par statut compris (#745, 17 sept. 2026 —
                                       // « hors des moyennes » se tient a la lecture : voir indice-assiduite.md)

// Lecture
obtenirIndicesCP(da)                   // Retourne indices pour un etudiant
obtenirHistoriqueIndicesCP(da)         // Retourne historique
```

---

## Declencheurs automatiques

Les indices sont recalcules automatiquement :
- Apres chaque evaluation
- Apres selection d'artefacts
- Lors du chargement initial

---

## Note importante

Le module `portfolio.js` sera renomme `indices-cp.js` pour clarifier son role universel.
Si tu vois "portfolio" dans le code, c'est du legacy a mettre a jour.
