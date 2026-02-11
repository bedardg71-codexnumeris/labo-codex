# Implémentation des tooltips — Construction de la note > Aperçu + Productions

**Scope** : Sous-onglets Aperçu et Productions du module Construction de la note (13 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Le sous-onglet Productions comporte de nombreux champs éditables (via ✏️) et des sélecteurs. Les `data-tooltip` doivent être placés sur les **labels**, pas sur les champs de saisie ni les `<select>`.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // CONSTRUCTION DE LA NOTE — Concepts transversaux
    // =================================================================

    'cn-bibliotheque':
        'Gérer les ressources : créer, importer depuis la bibliothèque communautaire, dupliquer, exporter ou supprimer.',

    'cn-pratiques-compat':
        'Pratiques compatibles : SOM = Sommative, STD = PAN-Standards, SPE = Spécifique, DEN = Dénombrement.',

    'cn-preparer-pdf':
        'Générer un PDF de la ressource. Choisir la grille et l\'échelle, puis prévisualiser.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Aperçu
    // =================================================================

    'cn-apercu':
        'Décompte des ressources configurées : productions, grilles, échelles, pratiques et cartouches.',

    'cn-ressources':
        'Nombre total de ressources disponibles (locales + bibliothèque) pour chaque type.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Productions
    // =================================================================

    'cn-prod-titre':
        'Définir les productions étudiantes : portfolio, artefacts et travaux avec pondérations et échéances.',

    'cn-prod-type':
        'Portfolio (conteneur d\'artefacts pondéré), Artefact (production du portfolio) ou Travail (évaluation indépendante).',

    'cn-prod-ponderation':
        'Poids dans la note finale. Les artefacts contribuent au portfolio ; les portfolios et travaux se partagent le 100%.',

    'cn-prod-activite':
        'Nom de l\'activité pédagogique associée à cette production. Cliquer sur ✏️ pour modifier.',

    'cn-prod-grille':
        'Associer une grille d\'évaluation à cette production. Définit les critères utilisés lors de l\'évaluation.',

    'cn-prod-objectif':
        'Ce que l\'étudiant sera capable de faire. Utilisé dans la rétroaction et le dossier PDF.',

    'cn-prod-tache':
        'Ce qui est demandé à l\'étudiant. Apparaît dans le dossier PDF de rétroaction.',

    'cn-prod-tableau':
        'Tableau récapitulatif de toutes les productions : titre, type, pondération et échéance.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Concepts transversaux (réutilisés dans plusieurs sous-onglets)

| Clé | Élément cible |
|-----|---------------|
| `cn-bibliotheque` | Bouton « Consulter la bibliothèque » (présent dans Productions, Grilles, Échelles, Cartouches) |
| `cn-pratiques-compat` | Conteneur des badges « Pratiques compatibles : » dans chaque formulaire |
| `cn-preparer-pdf` | Bouton « Préparer le PDF » (présent dans Productions, Grilles, Échelles, Cartouches) |

### Sous-onglet Aperçu

| Clé | Élément cible |
|-----|---------------|
| `cn-apercu` | Titre « Vue d'ensemble » |
| `cn-ressources` | Bandeau « Ressources configurées » (en-tête sombre) |

### Sous-onglet Productions

| Clé | Élément cible |
|-----|---------------|
| `cn-prod-titre` | Titre « Productions étudiantes » |
| `cn-prod-type` | Label « Type » dans le formulaire de production |
| `cn-prod-ponderation` | Label « Pondération (%) » dans le formulaire |
| `cn-prod-activite` | Label « Activité d'apprentissage » dans le formulaire |
| `cn-prod-grille` | Label « Grille de critères » dans le formulaire |
| `cn-prod-objectif` | Label « Objectif d'apprentissage » dans le formulaire |
| `cn-prod-tache` | Label « Description de la tâche » dans le formulaire |
| `cn-prod-tableau` | Titre « Productions pédagogiques » (vue tableau) |

---

## Règles de placement

- Les clés **transversales** (`cn-bibliotheque`, `cn-pratiques-compat`, `cn-preparer-pdf`) sont réutilisées sur les mêmes éléments dans chaque sous-onglet (même tooltip, même `data-tooltip`).
- Pour les **labels de formulaire** : placer `data-tooltip` sur le label textuel, pas sur le champ de saisie ni le `<select>`.
- Les champs avec **icône crayon (✏️)** : le tooltip va sur le label, pas sur l'icône.
- Le **tableau des productions** : placer `data-tooltip` sur le titre « Productions pédagogiques », pas sur les cellules individuelles ni les en-têtes de colonnes.
- Les boutons **+ Nouvelle production** et **Exporter en PDF** sont auto-explicatifs.
- La **modale de bibliothèque** : placer `cn-bibliotheque` sur le bouton qui ouvre la modale.
- Les boutons **Dupliquer, Exporter, Retirer, Supprimer** dans la bibliothèque sont auto-explicatifs.

---

## Vérification

- [ ] 13 tooltips apparaissent au survol des éléments ciblés
- [ ] Les sélecteurs (Type, Grille de critères) s'ouvrent normalement
- [ ] Les icônes de crayon (✏️) restent cliquables
- [ ] Le tableau des productions reste navigable
- [ ] Le bouton Consulter la bibliothèque ouvre la modale
- [ ] Le bouton Préparer le PDF ouvre le dialogue
- [ ] Les champs de saisie (Nom, Objectif, Tâche) restent éditables
