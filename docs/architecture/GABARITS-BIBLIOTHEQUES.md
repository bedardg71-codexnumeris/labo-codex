# Architecture : Gabarits et Bibliothèques

> **Date de création** : 2 janvier 2026
> **Statut** : Concept validé, en cours d'implémentation
> **Auteurs** : Grégoire Bédard, Claude Code

---

## Résumé

Un **gabarit** est un formulaire de création pré-configuré qui permet aux utilisateurs de créer du matériel pédagogique (productions, échelles, grilles, cartouches) adapté à leur pratique de notation.

Les gabarits sont stockés **dans les bibliothèques existantes** (pas dans une bibliothèque séparée) et sont **tagués par pratique** pour faciliter le filtrage.

---

## Concepts clés

### Gabarit vs Élément

| Concept | Description | Exemple |
|---------|-------------|---------|
| **Gabarit** | Formulaire pré-configuré pour créer du matériel | "Gabarit Échelle SPE binaire" |
| **Élément** | Instance concrète créée à partir d'un gabarit | "Mon échelle Acceptable/Non acceptable" |

### Workflow utilisateur

```
1. Utilisateur va dans Matériel > Échelles
2. Clique sur "Consulter la bibliothèque" ou "+ Nouvelle"
3. Voit les gabarits filtrés selon sa pratique de notation
4. Sélectionne un gabarit
5. Le formulaire de création se pré-remplit
6. L'utilisateur personnalise et sauvegarde
7. L'élément est créé (peut être ajouté à la bibliothèque pour partage)
```

---

## Structure d'un gabarit

```javascript
{
  id: 'GABARIT_ECHELLE_SPE_BINAIRE',
  nom: '[SPE] Échelle binaire',

  // === MÉTADONNÉES GABARIT ===
  estGabarit: true,                    // Distingue des éléments normaux
  gabaritType: 'echelle',              // Type de matériel

  // === TAGS PRATIQUES ===
  pratiques: ['SPE'],                  // Ou ['SOM', 'STD', 'SPE', 'DEN'] ou ['all']

  // === DESCRIPTION ===
  description: 'Échelle binaire pour PAN-Spécifications...',
  auteur: 'Labo Codex',

  // === CONFIGURATION PRÉ-REMPLIE ===
  // (spécifique au type de matériel)
  niveaux: [
    { code: 'A', nom: 'Acceptable', min: 100, max: 100 },
    { code: 'N', nom: 'Non acceptable', min: 0, max: 0 }
  ],

  // === MÉTADONNÉES STANDARD ===
  dateCreation: '2026-01-02T00:00:00.000Z',
  dansBibliotheque: true
}
```

---

## Tags de pratiques

| Tag | Pratique | Description |
|-----|----------|-------------|
| `SOM` | Sommative | Pratique traditionnelle avec moyenne pondérée |
| `STD` | PAN-Standards | Standards-Based Grading (objectifs à maîtriser) |
| `SPE` | PAN-Spécifications | Specifications Grading (forfaits/bundles) |
| `DEN` | PAN-Dénotation | Ungrading (autoévaluation guidée) |
| `all` | Multi-pratiques | Compatible avec toutes les pratiques |

---

## Organisation dans les bibliothèques

Chaque bibliothèque existante contient maintenant :

```
Bibliothèque Échelles
├── [Section] Gabarits
│   ├── [Multi] IDME 4 niveaux
│   ├── [SPE] Acceptable/Non acceptable
│   └── [STD] Standards de maîtrise
│
└── [Section] Mes échelles
    ├── Échelle cours PHI-101
    └── Échelle modifiée IDME
```

### Filtrage

L'interface offre un filtre par pratique :
- `[Tous]` - Affiche tout
- `[SOM]` - Sommative seulement
- `[STD]` - Standards seulement
- `[SPE]` - Spécifications seulement
- `[DEN]` - Dénotation seulement

---

## Gabarits par type de matériel

### Échelles de performance

| Gabarit | Pratiques | Description |
|---------|-----------|-------------|
| IDME 4 niveaux | Multi | Insuffisant, Développement, Maîtrise, Excellence |
| SPE binaire | SPE | Acceptable / Non acceptable |
| Standards mastery | STD | Non démontré, En développement, Maîtrisé |

### Grilles de critères

| Gabarit | Pratiques | Description |
|---------|-----------|-------------|
| Analytique multi-critères | Multi | Grille avec plusieurs critères et niveaux |
| Checklist spécifications | SPE | Liste de spécifications binaires (oui/non) |
| Objectifs standards | STD | Critères alignés sur les objectifs du cours |

### Productions étudiantes

| Gabarit | Pratiques | Description |
|---------|-----------|-------------|
| Artefact portfolio | Multi | Production pour portfolio (PAN) |
| Examen | Multi | Évaluation sommative traditionnelle |
| Travail écrit | Multi | Dissertation, rapport, etc. |
| Prise de position SPE | SPE | Production type SPE (François) |

### Cartouches de rétroaction

| Gabarit | Pratiques | Description |
|---------|-----------|-------------|
| Rétroaction analytique | Multi | Commentaires par critère et niveau |
| Feedback SPE | SPE | Commentaires pour révision (acceptable/non) |

---

## Implémentation technique

### Détection d'un gabarit

```javascript
function estUnGabarit(element) {
  return element.estGabarit === true;
}
```

### Filtrage par pratique

```javascript
function filtrerParPratique(elements, pratique) {
  return elements.filter(e => {
    if (!e.pratiques) return true; // Rétrocompatibilité
    if (e.pratiques.includes('all')) return true;
    return e.pratiques.includes(pratique);
  });
}
```

### Affichage dans la bibliothèque

```javascript
function afficherBibliotheque(elements, pratiqueActive) {
  // Séparer gabarits et éléments
  const gabarits = elements.filter(e => e.estGabarit);
  const mesElements = elements.filter(e => !e.estGabarit);

  // Filtrer par pratique si filtre actif
  const gabaritsFiltres = pratiqueActive
    ? filtrerParPratique(gabarits, pratiqueActive)
    : gabarits;

  // Afficher en deux sections
  return `
    <h4>Gabarits disponibles</h4>
    ${afficherListe(gabaritsFiltres)}

    <h4>Mon matériel</h4>
    ${afficherListe(mesElements)}
  `;
}
```

---

## Migration et rétrocompatibilité

Les éléments existants sans `estGabarit` sont considérés comme du matériel utilisateur (pas des gabarits).

Les éléments existants sans `pratiques` sont considérés comme multi-pratiques par défaut.

---

## Fichiers concernés

- `js/echelles.js` - Affichage bibliothèque échelles
- `js/grilles.js` - Affichage bibliothèque grilles
- `js/productions.js` - Affichage bibliothèque productions
- `js/cartouches.js` - Affichage bibliothèque cartouches
- `js/spe-specifications.js` - Gabarits SPE
- `js/*-bibliotheque.js` - Stockage des bibliothèques

---

## Évolutions futures

1. **Import/Export de gabarits** - Partager des gabarits entre collègues
2. **Gabarits communautaires** - Bibliothèque partagée en ligne
3. **Personnalisation de gabarits** - Modifier un gabarit pour créer le sien
4. **Gabarits par discipline** - Filtrage additionnel par matière

---

## Historique

| Date | Modification |
|------|--------------|
| 2026-01-02 | Création du concept (session Claude Code) |
