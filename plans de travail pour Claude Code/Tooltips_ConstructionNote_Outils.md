# Implémentation des tooltips — Construction de la note > Grilles + Échelles + Cartouches + Pratiques

**Scope** : Sous-onglets Grilles de critères, Échelles de performance, Cartouches de rétroaction et Pratiques de notation (18 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Ces quatre sous-onglets partagent le même patron de bibliothèque avec barre latérale + formulaire d'édition. Les tooltips transversaux (`cn-bibliotheque`, `cn-pratiques-compat`, `cn-preparer-pdf`) sont définis dans Tooltips_ConstructionNote_Productions.md et réutilisés ici.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // CONSTRUCTION DE LA NOTE — Grilles de critères
    // =================================================================

    'cn-grille-titre':
        'Grilles réutilisables avec critères pondérés. Chaque grille définit les critères d\'évaluation d\'une production.',

    'cn-grille-critere':
        'Critères avec nom, type, pondération et description. La pondération totale doit atteindre 100%.',

    'cn-grille-type-critere':
        'Méthode d\'évaluation : Holistique (attribution manuelle d\'un niveau) ou Algorithmique (calcul automatique).',

    'cn-grille-ponderation-totale':
        'Somme des pondérations de tous les critères. Doit atteindre 100% pour que la grille soit valide.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Échelles de performance
    // =================================================================

    'cn-echelle-titre':
        'Échelles de conversion pourcentage → niveaux de performance. Configurer les seuils et couleurs.',

    'cn-echelle-niveau':
        'Niveaux avec code, nom, plages de pourcentage, valeur ponctuelle et couleur.',

    'cn-echelle-valeur-ponctuelle':
        'Valeur numérique fixe attribuée au niveau pour les calculs de note. Limite l\'impact des résultats extrêmes.',

    'cn-echelle-apercu':
        'Barre colorée montrant les plages de chaque niveau. Vérifie visuellement la cohérence des seuils.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Cartouches de rétroaction
    // =================================================================

    'cn-cartouche-titre':
        'Matrices de commentaires automatiques. Chaque cartouche génère une rétroaction par critère × niveau.',

    'cn-cartouche-selectors':
        'La grille détermine les critères (lignes), l\'échelle détermine les niveaux (colonnes) de la matrice.',

    'cn-cartouche-contexte':
        'Texte introductif optionnel affiché au début de la rétroaction si l\'option « Contexte » est cochée.',

    'cn-cartouche-matrice':
        'Tableau critères × niveaux. Chaque cellule est un commentaire de rétroaction. Assemblage automatique lors de l\'évaluation.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Pratiques de notation
    // =================================================================

    'cn-pratique-titre':
        'Assemblage final : type de pratique, échelle, structure des évaluations et système de jetons.',

    'cn-pratique-type':
        'SOM = Sommative (moyenne pondérée), STD = PAN-Standards (meilleures évaluations), SPE = Spécifique, DEN = Dénombrement.',

    'cn-pratique-discipline':
        'Discipline académique associée. Filtre les ressources de la bibliothèque par pertinence.',

    'cn-pratique-echelle':
        'Échelle IDME utilisée pour convertir les pourcentages en niveaux. Configurable dans Échelles de performance.',

    'cn-pratique-jetons':
        'Ressources limitées (Délai, Reprise, Reprise ciblée) pour adapter le parcours évaluatif de l\'étudiant.',

    'cn-pratique-appliquer':
        'Définir cette pratique comme configuration active du cours. Conditionne tous les calculs de notes et indices.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Sous-onglet Grilles de critères

| Clé | Élément cible |
|-----|---------------|
| `cn-grille-titre` | Titre « Grilles de critères » |
| `cn-grille-critere` | En-tête de chaque carte de critère (la rangée contenant Ordre, Nom, Type, Pond., Description) — tooltip sur le **label « Nom du critère »** |
| `cn-grille-type-critere` | Label « Type » dans chaque carte de critère |
| `cn-grille-ponderation-totale` | Texte « Pondération totale des critères : » |

### Sous-onglet Échelles de performance

| Clé | Élément cible |
|-----|---------------|
| `cn-echelle-titre` | Titre « Échelles de performance » |
| `cn-echelle-niveau` | En-tête de chaque carte de niveau (la rangée contenant Ordre, Code, Nom, Min, Max, Valeur, Couleur) — tooltip sur le **label « Nom du niveau »** |
| `cn-echelle-valeur-ponctuelle` | Label « Valeur ponctuelle » dans chaque carte de niveau |
| `cn-echelle-apercu` | Conteneur de la barre colorée d'aperçu visuel |

### Sous-onglet Cartouches de rétroaction

| Clé | Élément cible |
|-----|---------------|
| `cn-cartouche-titre` | Titre « Cartouches de rétroaction » |
| `cn-cartouche-selectors` | Conteneur des sélecteurs « Grille (critères) » et « Échelle (niveaux) » en haut du formulaire |
| `cn-cartouche-contexte` | Label « Contexte de la rétroaction (optionnel) » |
| `cn-cartouche-matrice` | Titre « Matrice des commentaires de rétroaction » |

### Sous-onglet Pratiques de notation

| Clé | Élément cible |
|-----|---------------|
| `cn-pratique-titre` | Titre « Pratiques de notation » |
| `cn-pratique-type` | Label « Type de pratique » |
| `cn-pratique-discipline` | Label « Discipline » |
| `cn-pratique-echelle` | Label « Échelle à utiliser » (dans la section Échelle de performance) |
| `cn-pratique-jetons` | Titre « Système de jetons » (en-tête de la section) |
| `cn-pratique-appliquer` | Bouton « Appliquer au cours actif » |

---

## Règles de placement

### Grilles
- La clé `cn-grille-critere` est réutilisée sur chaque carte de critère (même tooltip pour tous les critères).
- Placer `data-tooltip` sur le label « Nom du critère », pas sur le champ `<input>` ni les flèches d'ordre.
- Le bouton **+ Ajouter un critère** est auto-explicatif.

### Échelles
- La clé `cn-echelle-niveau` est réutilisée sur chaque carte de niveau.
- Placer `data-tooltip` sur le label « Nom du niveau », pas sur les champs Min/Max.
- Le bouton **+ Ajouter un niveau** est auto-explicatif.
- L'**aperçu visuel** (barre colorée) est un conteneur non interactif — le tooltip s'y applique directement.

### Cartouches
- La **matrice** comporte des cellules éditables (zones de texte). Placer `data-tooltip` sur le titre « Matrice des commentaires de rétroaction », pas sur les cellules individuelles.
- Les **sélecteurs Grille et Échelle** : placer `data-tooltip` sur le conteneur des deux sélecteurs ou sur un label commun, pas sur les `<select>` individuels.

### Pratiques
- Le bouton **Appliquer au cours actif** reçoit un tooltip car son action a un impact significatif sur tout le système.
- Le bouton **Enregistrer la pratique** est auto-explicatif et ne reçoit pas de tooltip.
- La section **Structure des évaluations** apparaît comme un accordéon dans les captures. Si son contenu est visible, placer un `data-tooltip` sur son titre.

---

## Vérification

- [ ] 18 tooltips apparaissent au survol des éléments ciblés
- [ ] Les sélecteurs (Type de critère, Grille, Échelle, Type de pratique, Discipline) s'ouvrent normalement
- [ ] Les champs de saisie (noms, descriptions, Min/Max, valeur ponctuelle) restent éditables
- [ ] Les cellules de la matrice des cartouches restent éditables
- [ ] Les flèches d'ordre (↑↓) fonctionnent pour réordonner critères et niveaux
- [ ] Les boutons d'action (Ajouter, Dupliquer, Supprimer, Sauvegarder) restent fonctionnels
- [ ] Le bouton « Appliquer au cours actif » reste cliquable
- [ ] La case « Activer le système de jetons » reste cochable
- [ ] Les tooltips transversaux (bibliothèque, pratiques compatibles, PDF) fonctionnent dans les 4 sous-onglets
