# Pattern Architectural : Bibliothèque + Assemblage

**Version** : Beta 95.2
**Date** : 6 janvier 2026

> ⚠ **DOCUMENT PÉRIMÉ** (bandeau du 11 oct. 2026, #471 ; écarts mesurés par l'audit du 20 août, constat CT-25).
> Faux au moins sur : `js/entites-ui.js` (archivé sous `js/_archives/`, non chargé) ; la clé `horaires` dite
> non namespacée (elle l'est) ; les gabarits prédéfinis et l'import/export de trimestre « à implémenter »
> (livrés). Le **principe** (bibliothèque, puis assemblage) tient ; les noms de fichiers et de clés, non.

---

## Vue d'ensemble

L'application Monitorage Pédagogique utilise un pattern architectural cohérent appelé **"Bibliothèque + Assemblage"** dans deux modules majeurs :

1. **Construction de la note** - Pratiques de notation
2. **Gestion du Trimestre** - Groupe-cours

Ce pattern permet la **réutilisation** d'entités indépendantes qui sont ensuite **assemblées** pour créer des configurations spécifiques.

---

## Schéma du pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BIBLIOTHÈQUE (entités réutilisables)             │
│                    Stockage: NON namespacé (partagé)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Construction de la note         Gestion du Trimestre              │
│   ┌───────────────────────┐       ┌───────────────────────┐         │
│   │ • Pratiques           │       │ • Cours               │         │
│   │ • Gabarits prédéfinis │       │ • Enseignants         │         │
│   │                       │       │ • Horaires            │         │
│   │                       │       │ • (Groupes étudiants) │         │
│   └───────────────────────┘       └───────────────────────┘         │
│                                                                     │
│   Clés:                           Clés:                             │
│   - bibliothequePratiques         - cours                           │
│   - pratiquesConfigurables        - enseignants                     │
│                                   - horaires                        │
│                                                                     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ Sélection par référence (ID)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ASSEMBLAGE (instance spécifique)                 │
│                    Stockage: peut être namespacé                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Configuration de note           Groupe-cours                      │
│   ┌───────────────────────┐       ┌───────────────────────┐         │
│   │ pratique sélectionnée │       │ coursId: "COURS_123"  │         │
│   │ + pondérations        │       │ enseignantId: "ENS_x" │         │
│   │ + critères            │       │ horaireId: "HOR_456"  │         │
│   │ + paramètres          │       │ pratiqueId: "..."     │         │
│   └───────────────────────┘       │ groupe: "00001"       │         │
│                                   └───────────────────────┘         │
│   Clé:                            Clé:                              │
│   - modalitesEvaluation           - {trimestre}_groupesCours        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Caractéristiques du pattern

### 1. Stockage à deux niveaux

| Niveau | Scope | Namespacé ? | Exemple |
|--------|-------|-------------|---------|
| **Bibliothèque** | Partagé (tous trimestres/cours) | NON | `enseignants`, `cours` |
| **Assemblage** | Spécifique à un contexte | OUI (optionnel) | `h2026_groupesCours` |

### 2. Référencement par ID

L'assemblage ne **copie pas** les données de la bibliothèque, il les **référence** par ID :

```javascript
// Groupe-cours (assemblage)
{
    id: "GC_1704567890",
    coursId: "COURS_1704500000",      // Référence
    enseignantId: "ENS_1704400000",   // Référence
    horaireId: "HOR_1704450000",      // Référence
    pratiqueId: "pratique_somm",      // Référence
    groupe: "00001"
}
```

### 3. Hydratation pour l'affichage

Lors de l'affichage, les références sont "hydratées" (résolues) :

```javascript
// Hydrater un groupe-cours
async function hydrater(gc) {
    return {
        ...gc,
        cours: await CoursEntite.obtenirParId(gc.coursId),
        enseignant: await EnseignantsEntite.obtenirParId(gc.enseignantId),
        horaire: await HorairesEntite.obtenirParId(gc.horaireId)
    };
}
```

### 4. Avantages

| Avantage | Description |
|----------|-------------|
| **Réutilisation** | Un même cours/enseignant/horaire peut servir dans plusieurs assemblages |
| **Maintenance centralisée** | Modifier un enseignant le met à jour partout où il est référencé |
| **Isolation** | Les assemblages sont indépendants les uns des autres |
| **Historique** | Les entités persistent même si l'assemblage est supprimé |
| **Partage** | Export/import des bibliothèques entre utilisateurs |

---

## Implémentation : Construction de la note

### Fichiers principaux

- `js/pratiques-bibliotheque.js` - CRUD bibliothèque + gabarits
- `js/pratiques-gestion.js` - Sidebar + assemblage + édition
- `js/pratiques.js` - Logique métier

### Clés de stockage

```javascript
// Bibliothèque (NON namespacées)
'bibliothequePratiques'     // Pratiques partagées/communauté
'pratiquesConfigurables'    // Sélection personnelle

// Assemblage (peut être namespacée)
'modalitesEvaluation'       // Configuration active du cours
```

### Flux de données

```
1. Créer/Importer pratique → bibliothequePratiques
2. Sélectionner pratique → pratiquesConfigurables (flag dansBibliotheque)
3. Appliquer au cours → copie dans modalitesEvaluation
```

### Affichage

- **Sidebar** : Liste des pratiques disponibles avec badges
- **Formulaire** : Détails et édition d'une pratique
- **Modal** : Sélection depuis la bibliothèque complète

---

## Implémentation : Gestion du Trimestre

### Fichiers principaux

- `js/entites/cours-entite.js` - CRUD cours
- `js/entites/enseignants.js` - CRUD enseignants
- `js/entites/horaires.js` - CRUD horaires
- `js/entites/groupe-cours.js` - CRUD assemblage
- `js/entites-ui.js` - Interface utilisateur

### Clés de stockage

```javascript
// Bibliothèque (NON namespacées - partagées entre trimestres)
'cours'                     // Liste des cours
'enseignants'               // Liste des enseignants
'horaires'                  // Liste des horaires

// Assemblage (namespacée par trimestre)
'{trimestreId}_groupesCours'  // Ex: 'h2026_groupesCours'
```

### Flux de données

```
1. Créer entités → cours, enseignants, horaires
2. Assembler → sélection via dropdowns
3. Sauvegarder → {trimestre}_groupesCours
```

### Affichage

- **Accordéons** : Un par type d'entité (Cours, Enseignant, Horaire)
- **Dropdowns** : Sélection des entités existantes
- **Formulaires** : Création/édition d'entités
- **Groupe-cours** : Assemblage final via dropdowns

---

## Comparaison des deux modules

| Aspect | Construction de la note | Gestion du Trimestre |
|--------|------------------------|---------------------|
| **Entités** | Pratiques, critères, gabarits | Cours, enseignants, horaires |
| **Affichage bibliothèque** | Sidebar | Dropdowns dans accordéons |
| **Gabarits prédéfinis** | Oui (12 modèles) | Non (à implémenter) |
| **Assemblage** | Configuration active | Groupe-cours |
| **Namespace assemblage** | Optionnel | Par trimestre |
| **Import/Export** | Oui | À implémenter |

---

## Règles de développement

### 1. Clés de stockage

```javascript
// ✅ CORRECT : Bibliothèque non namespacée
const CLE_COURS = 'cours';

// ✅ CORRECT : Assemblage namespacé
function getCleGroupesCours(trimestreId) {
    return `${trimestreId}_groupesCours`;
}

// ❌ INCORRECT : Bibliothèque namespacée
const CLE_COURS = cle('cours');  // NE PAS FAIRE
```

### 2. Référencement

```javascript
// ✅ CORRECT : Stocker l'ID, pas l'objet
const groupeCours = {
    coursId: cours.id,
    enseignantId: enseignant.id
};

// ❌ INCORRECT : Stocker l'objet complet
const groupeCours = {
    cours: { ...coursComplet },  // NE PAS FAIRE
    enseignant: { ...enseignantComplet }
};
```

### 3. Hydratation

```javascript
// ✅ CORRECT : Hydrater pour l'affichage
const gcHydrate = await GroupeCoursEntite.hydrater(gc);
afficher(gcHydrate.cours.nomCours);

// ❌ INCORRECT : Stocker les données hydratées
await db.set(cle, gcHydrate);  // NE PAS FAIRE
```

---

## Évolutions futures

1. **Gabarits prédéfinis pour Trimestre** : Créer des modèles de cours/horaires réutilisables
2. **Import/Export pour Trimestre** : Permettre le partage de configurations
3. **Interface unifiée** : Possibilité d'avoir une sidebar comme Construction de la note
4. **Synchronisation** : Propagation des modifications d'entités

---

## Résumé

Le pattern **Bibliothèque + Assemblage** assure :

- **Cohérence** entre les modules de l'application
- **Réutilisabilité** des entités créées
- **Flexibilité** dans l'assemblage
- **Maintenabilité** du code et des données

Tout nouveau module suivant ce pattern devrait respecter :
1. Entités indépendantes dans une bibliothèque NON namespacée
2. Assemblage par référence (ID) dans un stockage possiblement namespacé
3. Hydratation pour l'affichage, pas pour le stockage
