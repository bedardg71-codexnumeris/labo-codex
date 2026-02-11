# Implémentation des tooltips — Planification > Alignement pédagogique

**Scope** : Sous-onglet Alignement pédagogique du module Planification (5 zones, 20 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Ce module est un canevas interactif (drag & drop, zoom, liens). Les tooltips ne doivent jamais interférer avec les interactions de glisser-déposer, les ports de connexion entre nœuds, ou les contrôles de zoom.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // PLANIFICATION — Alignement pédagogique
    // =================================================================

    'planif-sous-nav':
        'Deux vues complémentaires : la carte mentale d\'alignement et l\'organisateur du cours.',

    'planif-alignement':
        'Carte mentale interactive pour construire visuellement l\'alignement pédagogique du cours.',

    // --- Barre d'outils ---

    'planif-selecteur-cours':
        'Choisir le cours à planifier. Chaque cours a sa propre carte d\'alignement.',

    'planif-boutons-action':
        'Ajouter, supprimer, couper, copier et coller des nœuds sur le canevas.',

    // --- Palette d'éléments ---

    'planif-palette':
        'Glisser un élément vers le canevas pour l\'ajouter à la carte mentale.',

    'planif-pouvoir-enseigner':
        'Cadre curriculaire : compétence ministérielle et idées maîtresses du cours.',

    'planif-quoi-enseigner':
        'Savoirs, informations préalables, stratégies cognitives et conditions d\'apprentissage.',

    'planif-comment-enseigner':
        'Dispositifs d\'enseignement : activités, soutien et révision.',

    'planif-design-apprentissages':
        'Évaluations et productions : lier les objectifs aux moyens d\'évaluation.',

    'planif-structure':
        'Organisation temporelle : séquences (semaines) et leçons (séances).',

    'planif-aide':
        'Instructions rapides : glisser, relier, intégrer et cloner des éléments.',

    // --- Canevas ---

    'planif-canevas':
        'Espace de travail de la carte mentale. Glisser des éléments, créer des liens, organiser visuellement le cours.',

    // --- Panneau de propriétés ---

    'planif-panneau-proprietes':
        'Propriétés du nœud sélectionné : titre, description, clonage et suppression.',

    'planif-titre-noeud':
        'Nom de l\'élément pédagogique tel qu\'il apparaît sur la carte.',

    'planif-description-noeud':
        'Notes ou précisions sur cet élément. Champ libre.',

    'planif-cloner':
        'Créer un clone de ce nœud. Les modifications se propagent à toutes les copies.',

    'planif-supprimer-noeud':
        'Supprimer ce nœud et ses liens de la carte.',

    // --- Barre inférieure ---

    'planif-barre-outils':
        'Contrôles de zoom, filtres d\'affichage et options de vue du canevas.',

    'planif-zoom':
        'Ajuster le niveau de zoom du canevas.',

    'planif-filtres':
        'Filtrer l\'affichage des nœuds et des liens sur le canevas.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Sous-navigation

| Clé | Élément cible |
|-----|---------------|
| `planif-sous-nav` | Conteneur des onglets « Alignement pédagogique » / « Organisateur » |
| `planif-alignement` | Onglet « Alignement pédagogique » |

### Barre d'outils (haut)

| Clé | Élément cible |
|-----|---------------|
| `planif-selecteur-cours` | Menu déroulant du sélecteur de cours |
| `planif-boutons-action` | Conteneur des boutons +, ✕, ciseaux, copier, coller |

### Palette d'éléments (sidebar gauche)

| Clé | Élément cible |
|-----|---------------|
| `planif-palette` | Titre « ÉLÉMENTS » du panneau latéral |
| `planif-pouvoir-enseigner` | Titre de catégorie « POUVOIR ENSEIGNER » |
| `planif-quoi-enseigner` | Titre de catégorie « QUOI ENSEIGNER » |
| `planif-comment-enseigner` | Titre de catégorie « COMMENT ENSEIGNER » |
| `planif-design-apprentissages` | Titre de catégorie « DESIGN / APPRENTISSAGES » |
| `planif-structure` | Titre de catégorie « STRUCTURE » |
| `planif-aide` | Titre de la zone « AIDE » |

### Canevas

| Clé | Élément cible |
|-----|---------------|
| `planif-canevas` | Conteneur principal du canevas (pas les nœuds individuels) |

### Panneau de propriétés (sidebar droite)

| Clé | Élément cible |
|-----|---------------|
| `planif-panneau-proprietes` | En-tête du panneau (type du nœud + indicateur coloré) |
| `planif-titre-noeud` | Label « TITRE » |
| `planif-description-noeud` | Label « DESCRIPTION » |
| `planif-cloner` | Label « Cloner » (à côté de la case à cocher) |
| `planif-supprimer-noeud` | Bouton « Supprimer ce nœud » |

### Barre inférieure

| Clé | Élément cible |
|-----|---------------|
| `planif-barre-outils` | Conteneur de la barre inférieure |
| `planif-zoom` | Contrôle de zoom (pourcentage + boutons +/−) |
| `planif-filtres` | Conteneur des filtres d'affichage (Tout, Nœuds/liens, etc.) |

---

## Règles de placement

- Pour la **palette d'éléments** : placer `data-tooltip` sur les **titres de catégorie** (POUVOIR ENSEIGNER, QUOI ENSEIGNER, etc.), pas sur les éléments individuels à glisser. Les éléments glissables doivent rester pleinement manipulables pour le drag & drop — un tooltip ne doit jamais interférer avec l'initiation d'un glisser.
- Pour le **canevas** : placer `data-tooltip` sur le **conteneur** du canevas (zone de fond), pas sur les nœuds ou les liens. Les nœuds sont des objets interactifs (sélection, déplacement, connexion via les ports) et ne doivent pas déclencher de tooltips système. L'information contextuelle des nœuds est déjà gérée par le panneau de propriétés.
- Pour le **panneau de propriétés** : placer `data-tooltip` sur les **labels** (TITRE, DESCRIPTION), pas sur les champs de saisie. Les champs doivent rester libres pour la frappe.
- Pour le **bouton Supprimer** : placer `data-tooltip` directement sur le bouton. Le tooltip disparaît au clic (masquage instantané) donc pas de conflit avec l'action de suppression.
- Pour le **sélecteur de cours** : placer `data-tooltip` sur le **conteneur** du select ou son label, pas sur le `<select>` lui-même qui doit s'ouvrir librement.
- Pour les **boutons d'action** (+, ✕, ciseaux, etc.) : placer `data-tooltip` sur le **conteneur du groupe**, pas sur chaque bouton individuel. Chaque bouton a déjà un `title` natif ou est identifiable par son icône.

---

## Vérification

- [ ] 20 tooltips apparaissent au survol des éléments ciblés
- [ ] Le drag & drop des éléments de la palette vers le canevas reste fonctionnel
- [ ] Les connexions entre nœuds (ports) ne sont pas perturbées
- [ ] Le zoom et le déplacement du canevas restent fluides
- [ ] Le sélecteur de cours s'ouvre normalement
- [ ] Les champs Titre et Description du panneau de propriétés restent éditables
- [ ] Le bouton Supprimer reste cliquable
- [ ] Le clonage (case à cocher) reste fonctionnel
- [ ] Les boutons d'action (+, ✕, ciseaux, copier, coller) restent cliquables
