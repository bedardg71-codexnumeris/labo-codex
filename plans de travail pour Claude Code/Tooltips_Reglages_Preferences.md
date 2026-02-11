# Implémentation des tooltips — Réglages > Préférences

**Scope** : Sous-onglet Préférences de l'onglet Réglages (4 sections, 13 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // RÉGLAGES — Préférences
    // =================================================================

    'pref-sous-nav':
        'Personnaliser l\'expérience : outils actifs, ressources affichées, effets visuels et comportement de navigation.',

    // --- Outils à exploiter ---

    'pref-outils':
        'Activer ou désactiver les fonctionnalités avancées (indices ACP, système RàI). Les outils désactivés sont masqués de l\'interface.',

    'pref-outils-acp':
        'Indices prédictifs Assiduité, Complétion, Performance. Calculés sur une fenêtre glissante, ils alimentent le tableau de bord et la détection précoce des difficultés.',

    'pref-outils-rai':
        'Niveaux d\'intervention et recommandations personnalisées. Structure le soutien aux étudiants en trois niveaux d\'intensité (universel, ciblé, intensif).',

    // --- Affichage des ressources ---

    'pref-affichage':
        'Choisir les ressources visibles dans l\'interface : cartes SOLO, snapshots, graphiques, détails techniques, mode comparatif. Adapte la densité d\'information affichée.',

    'pref-affichage-solo':
        'Affiche une carte avec les descriptions détaillées basées sur la taxonomie SOLO. Utile pour interpréter le niveau cognitif des apprentissages.',

    'pref-affichage-snapshots':
        'Historique hebdomadaire des indices A-C-P. Permet de suivre l\'évolution dans le temps.',

    'pref-affichage-graphiques':
        'Visualisation de la progression dans le temps via Chart.js.',

    'pref-affichage-details':
        'Affiche les formules de calcul et les données brutes. Destiné aux utilisateurs souhaitant vérifier les calculs sous-jacents.',

    'pref-affichage-assiduite':
        'Choisir comment afficher les totaux de présence et d\'assiduité (ex. : en périodes).',

    'pref-affichage-comparatif':
        'Mode expérimental. Affiche les deux pratiques de notation (SOM et PAN) côte à côte pour comparer les approches.',

    // --- Expérience visuelle ---

    'pref-visuel':
        'Effets visuels de l\'interface. L\'animation des points du tableau de bord peut être désactivée pour réduire les distractions.',

    // --- Navigation ---

    'pref-navigation':
        'Court-circuiter la page d\'accueil pour ouvrir directement sur le tableau de bord au démarrage.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Section « Outils à exploiter »

| Clé | Élément cible |
|-----|---------------|
| `pref-outils` | Titre du panneau « Outils à exploiter » |
| `pref-outils-acp` | Label ou texte « Micro données ACP » (à côté de la checkbox) |
| `pref-outils-rai` | Label ou texte « Système RàI (Réponse à l'Intervention) » (à côté de la checkbox) |

### Section « Affichage des ressources »

| Clé | Élément cible |
|-----|---------------|
| `pref-affichage` | Titre du panneau « Affichage des ressources » |
| `pref-affichage-solo` | Label « Observation de la structure des résultats (SOLO) » |
| `pref-affichage-snapshots` | Label « Snapshots (captures de progression) » |
| `pref-affichage-graphiques` | Label « Graphiques d'évolution » |
| `pref-affichage-details` | Label « Détails techniques » |
| `pref-affichage-assiduite` | Label « Unité d'affichage de l'assiduité » |
| `pref-affichage-comparatif` | Label « Mode comparatif SOM/PAN (expérimental) » |

### Section « Expérience visuelle »

| Clé | Élément cible |
|-----|---------------|
| `pref-visuel` | Titre du panneau « Expérience visuelle » |

### Section « Navigation »

| Clé | Élément cible |
|-----|---------------|
| `pref-navigation` | Label « Ouvrir directement sur le tableau de bord » |

### Sous-navigation

| Clé | Élément cible |
|-----|---------------|
| `pref-sous-nav` | Onglet « Préférences » dans la sous-navigation des Réglages |

---

## Règle de placement

Placer `data-tooltip` sur le **label textuel** de chaque option (pas sur la checkbox elle-même, ni sur le conteneur). Le curseur `help` doit apparaître quand l'utilisateur survole le texte descriptif.

Pour les titres de section (bandeau sombre), placer l'attribut sur le **titre** du panneau.

---

## Vérification

- [ ] 13 tooltips apparaissent au survol
- [ ] Les checkboxes restent cliquables (le tooltip ne bloque pas l'interaction)
- [ ] Le sélecteur « Unité d'affichage de l'assiduité » reste utilisable
- [ ] Le curseur `help` s'affiche sur les labels mais pas sur les checkboxes
