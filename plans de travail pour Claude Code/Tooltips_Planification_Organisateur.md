# Implémentation des tooltips — Planification > Organisateur

**Scope** : Sous-onglet Organisateur du module Planification (2 vues, 14 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : L'Organisateur est une vue de lecture structurée des données de la carte mentale. Les sélecteurs de séquence/leçon et les sections dépliables doivent rester pleinement fonctionnels.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // PLANIFICATION — Organisateur
    // =================================================================

    'orga-sous-nav':
        'Vue textuelle et structurée des données de la carte mentale. Sélectionner une séquence et une leçon pour afficher son plan.',

    // --- Sélecteurs de navigation ---

    'orga-selecteur-sequence':
        'Filtrer par séquence pour restreindre la vue calendrier.',

    'orga-selecteur-lecon':
        'Sélectionner une leçon pour afficher son plan détaillé.',

    // --- Vue calendrier ---

    'orga-vue-calendrier':
        'Vue hiérarchique textuelle des séquences, séances et activités avec leurs liens pédagogiques.',

    // --- Plan de leçon ---

    'orga-entete-lecon':
        'Groupes-cours auxquels cette leçon s\'applique, avec leurs plages horaires.',

    'orga-objectif':
        'Ce que l\'élève sera capable de faire au terme de la leçon.',

    'orga-connaissances-prealables':
        'Savoirs préalables à vérifier ou revoir avant d\'aborder cette leçon.',

    'orga-productions':
        'Productions et artefacts évaluatifs liés aux activités de cette leçon.',

    'orga-enseignement-explicite':
        'Structure en 5 phases : ouverture, modelage, pratique guidée, pratique autonome, objectivation.',

    'orga-coeur-lecon':
        'Activités pédagogiques de la leçon. Associer des productions pour compléter l\'alignement.',

    // --- Éléments individuels du plan ---

    'orga-alerte-alignement':
        'Incohérence d\'alignement détectée : une évaluation ou un objectif n\'est pas encore relié à une production.',

    'orga-selecteur-production':
        'Associer une production (artefact évaluatif) à cette activité.',

    'orga-lien-pedagogique':
        'Connexion vers un autre élément de la carte mentale (compétence, prérequis, stratégie, etc.).',

    'orga-item-a-revoir':
        'Élément préalable à revoir en début de séance avant de poursuivre.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Sous-navigation et sélecteurs

| Clé | Élément cible |
|-----|---------------|
| `orga-sous-nav` | Onglet « Organisateur » dans la sous-navigation |
| `orga-selecteur-sequence` | Label ou conteneur du sélecteur « — Séquence — » |
| `orga-selecteur-lecon` | Label ou conteneur du sélecteur « — Leçon — » |

### Vue calendrier

| Clé | Élément cible |
|-----|---------------|
| `orga-vue-calendrier` | Barre de titre « VUE CALENDRIER » |

### Plan de leçon — sections

| Clé | Élément cible |
|-----|---------------|
| `orga-entete-lecon` | Titre « EN-TÊTE DE LA LEÇON » |
| `orga-objectif` | Titre « OBJECTIF DE LA LEÇON » |
| `orga-connaissances-prealables` | Titre « CONNAISSANCES PRÉALABLES À VÉRIFIER » |
| `orga-productions` | Titre « PRODUCTIONS ASSOCIÉES » |
| `orga-enseignement-explicite` | Label « Enseignement explicite (5 étapes) » (section dépliable) |
| `orga-coeur-lecon` | Titre « CŒUR DE LA LEÇON » |

### Plan de leçon — éléments contextuels

| Clé | Élément cible |
|-----|---------------|
| `orga-alerte-alignement` | Bandeau d'alerte jaune/orange (ex. : « 1 évaluation dans la carte n'est reliée à aucune artefact... ») |
| `orga-selecteur-production` | Label « Production » à côté du sélecteur déroulant dans le cœur de la leçon |
| `orga-lien-pedagogique` | Puces de lien colorées sous chaque activité (compétence, prérequis, condition, etc.) |
| `orga-item-a-revoir` | Mention « À revoir » dans la section des connaissances préalables |

---

## Règles de placement

- Pour les **sélecteurs de séquence/leçon** : placer `data-tooltip` sur le **label** ou le conteneur, pas sur le `<select>` lui-même qui doit s'ouvrir librement.
- Pour les **titres de section** (EN-TÊTE, OBJECTIF, etc.) : placer `data-tooltip` directement sur le titre. Ces éléments ne sont pas interactifs.
- Pour la **section dépliable** « Enseignement explicite (5 étapes) » : placer `data-tooltip` sur le **label/toggle**, pas sur le contenu déplié. Le clic pour déplier doit rester fonctionnel — le tooltip disparaît au clic (masquage instantané).
- Pour les **alertes d'alignement** : placer `data-tooltip` sur le bandeau d'alerte lui-même. C'est un élément informatif non interactif.
- Pour les **puces de lien pédagogique** : placer `data-tooltip` sur le conteneur de la puce + libellé, pas sur chaque puce individuellement (il peut y en avoir beaucoup par activité). L'objectif est d'expliquer le concept de lien, pas chaque lien individuel.
- Pour les **sélecteurs de production** : placer `data-tooltip` sur le **label** « Production », pas sur le `<select>`.

---

## Vérification

- [ ] 14 tooltips apparaissent au survol des éléments ciblés
- [ ] Les sélecteurs de séquence et de leçon s'ouvrent normalement
- [ ] La section « Enseignement explicite » se déplie/replie sans conflit
- [ ] Les sélecteurs de production dans le cœur de la leçon restent fonctionnels
- [ ] Les liens pédagogiques (puces colorées) restent lisibles avec le tooltip à côté
- [ ] La vue calendrier reste navigable (défilement) sans tooltips parasites
