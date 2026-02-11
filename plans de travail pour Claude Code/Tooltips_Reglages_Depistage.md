# Implémentation des tooltips — Réglages > Dépistage

**Scope** : Sous-onglet Dépistage de l'onglet Réglages (2 zones, 15 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Ce sous-onglet a été récemment migré depuis les Préférences. Vérifier que la structure HTML correspond bien à un sous-onglet autonome dans la navigation des Réglages.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // RÉGLAGES — Dépistage
    // =================================================================

    'depist-sous-nav':
        'Configuration de la détection des patterns et de l\'identification des forces et défis. Influence la sensibilité des alertes du tableau de bord.',

    // --- Configuration du dépistage ---

    'depist-activer-patterns':
        'Activer ou désactiver l\'identification des tendances récurrentes (progression, stagnation, régression) dans les résultats.',

    'depist-grille':
        'Grille utilisée pour identifier les forces et défis. Doit être la même pour tous les artefacts du trimestre.',

    'depist-decoupler-pr':
        'Séparer le calcul de la note (P, selon la pratique) du calcul de risque (R, basé sur les N dernières productions). Recommandé avec « N meilleurs ».',

    'depist-fenetre':
        'Nombre de dernières productions analysées pour détecter les tendances. Valeur basse = détection précoce. Valeur élevée = détection plus fiable.',

    // --- Seuils de détection avancés ---

    'depist-seuil-progression':
        'Différence minimale (%) pour signaler une progression ou régression entre deux artefacts. Bas = sensible, élevé = moins sensible.',

    'depist-seuil-direction':
        'Variation minimale (%) pour afficher une tendance du risque. Contrôle la sensibilité de l\'indicateur directionnel.',

    'depist-seuil-defi':
        'Score (%) sous lequel un critère est identifié comme un défi nécessitant attention. Bas = plus exigeant, élevé = moins exigeant.',

    'depist-restaurer':
        'Réinitialiser tous les seuils de détection à leurs valeurs par défaut.',

    // --- Seuils d'interprétation ---

    'depist-seuils-interpretation':
        'Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). Détermine les alertes du tableau de bord.',

    'depist-seuils-visuels':
        'Activer ou désactiver l\'affichage des couleurs Fragile / Acceptable / Bon dans les tableaux et indicateurs.',

    'depist-seuil-fragile':
        'Indice sous lequel la situation est considérée préoccupante (rouge). Nécessite une intervention.',

    'depist-seuil-acceptable':
        'Indice sous lequel la situation est en zone de vigilance (jaune). À surveiller.',

    'depist-seuil-bon':
        'Indice au-dessus duquel la situation est satisfaisante (vert).',

    'depist-seuils-restaurer':
        'Réinitialiser les seuils d\'interprétation à leurs valeurs par défaut (70/80/85%).',
```

---

## Cartographie HTML — où placer les data-tooltip

### Zone « Configuration du dépistage »

| Clé | Élément cible |
|-----|---------------|
| `depist-activer-patterns` | Label « Activer la détection des patterns » |
| `depist-grille` | Label « Grille de critères pour le dépistage » |
| `depist-decoupler-pr` | Label « Découpler Performance (P) et Risque (R) » |
| `depist-fenetre` | Label « Fenêtre d'analyse des patterns » |

### Zone « Seuils de détection avancés »

| Clé | Élément cible |
|-----|---------------|
| `depist-seuil-progression` | Titre « Progression des artefacts » (au-dessus du curseur) |
| `depist-seuil-direction` | Titre « Direction du risque » (au-dessus du curseur) |
| `depist-seuil-defi` | Titre « Seuil de défi spécifique » (au-dessus du curseur) |
| `depist-restaurer` | Bouton « Restaurer les valeurs par défaut » (section dépistage) |

### Zone « Seuils d'interprétation »

| Clé | Élément cible |
|-----|---------------|
| `depist-seuils-interpretation` | Titre du panneau « Seuils d'interprétation » |
| `depist-seuils-visuels` | Label « Indicateurs visuels des seuils » |
| `depist-seuil-fragile` | Carte rouge « Fragile si inférieur à » |
| `depist-seuil-acceptable` | Carte jaune « Acceptable si inférieur à » |
| `depist-seuil-bon` | Carte verte « Bon si supérieur ou égal à » |
| `depist-seuils-restaurer` | Bouton « Restaurer les valeurs par défaut » (section seuils) |

### Sous-navigation

| Clé | Élément cible |
|-----|---------------|
| `depist-sous-nav` | Onglet « Dépistage » dans la sous-navigation des Réglages |

---

## Règles de placement

- Pour les **curseurs** (sliders) : placer `data-tooltip` sur le **titre** au-dessus du curseur, pas sur le curseur lui-même. Le curseur doit rester manipulable sans interférence.
- Pour les **cartes colorées** (Fragile/Acceptable/Bon) : placer `data-tooltip` sur le **titre coloré** de la carte (ex. : « Fragile si inférieur à »), pas sur le champ de saisie numérique.
- Pour les **boutons Restaurer** : attention, il y a deux boutons distincts (un pour le dépistage, un pour les seuils). Utiliser des clés différentes (`depist-restaurer` vs `depist-seuils-restaurer`).

---

## Vérification

- [ ] 15 tooltips apparaissent au survol
- [ ] Les curseurs (sliders) restent manipulables
- [ ] Les champs numériques des seuils restent éditables
- [ ] Les deux boutons « Restaurer » ont chacun leur tooltip distinct
- [ ] La checkbox « Indicateurs visuels » reste cliquable
- [ ] Le sélecteur de grille reste utilisable
