# Implémentation des tooltips — Tableau de bord > Aperçu

**Scope** : Sous-onglet Aperçu du Tableau de bord (4 sections, 22 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Le Tableau de bord contient des graphiques interactifs (Chart.js) et des barres avec des points cliquables. Les tooltips ne doivent pas interférer avec les interactions natives de Chart.js ni avec le survol des points individuels sur les barres d'indices.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // TABLEAU DE BORD — Aperçu
    // =================================================================

    'tdb-sous-nav':
        'Quatre vues : aperçu du groupe, liste des individus, profil étudiant et interventions RàI.',

    'tdb-apercu':
        'Portrait complet du groupe-cours : indices d\'apprentissage, patterns, interventions et graphiques de développement.',

    'tdb-liste-individus':
        'Vue détaillée de chaque étudiant avec ses indices individuels.',

    'tdb-profil':
        'Fiche individuelle d\'un étudiant : trajectoire, indices et historique.',

    'tdb-interventions-rai':
        'Gestion des interventions par niveau RàI : universel, préventif, intensif.',

    // --- Section Observer ---

    'tdb-observer':
        'Indices A-C-E-P du groupe. Chaque barre positionne les étudiants de Fragile à Très favorable.',

    'tdb-zones-couleur':
        'Fragile (30-49%), Modéré (50-64%), Favorable (65-79%), Très favorable (≥80%). Seuils configurables dans Réglages.',

    'tdb-assiduite':
        'Taux de présence aux séances. Chaque point = un étudiant.',

    'tdb-completion':
        'Taux de remise des travaux. La corrélation C×P indique le lien entre remise et résultats.',

    'tdb-engagement':
        'Niveau d\'engagement dans les activités d\'apprentissage. Combine plusieurs signaux comportementaux.',

    'tdb-performance':
        'Résultats aux évaluations par niveaux : Insuffisant, En Développement, Maîtrisé, Étendu.',

    // --- Section Intervenir ---

    'tdb-intervenir':
        'Détection de patterns d\'apprentissage et répartition par niveaux d\'intervention RàI.',

    'tdb-patterns':
        'Répartition des trajectoires : progression stable, défi spécifique, blocage émergent ou critique.',

    'tdb-rai':
        'Trois niveaux RàI : universel, préventif, intensif. Indique le type d\'intervention suggéré pour chaque groupe d\'étudiants.',

    // --- Section Développement du groupe ---

    'tdb-dev-groupe':
        'Évolution d\'un indice dans le temps pour tout le groupe. Chaque ligne = un étudiant.',

    'tdb-selecteur-indice':
        'Choisir l\'indice à visualiser : Assiduité, Complétion, Engagement ou Performance.',

    'tdb-selecteur-eleve-groupe':
        'Isoler la trajectoire d\'un étudiant spécifique sur le graphique du groupe.',

    'tdb-graphique-groupe':
        'Graphique longitudinal du groupe. Cliquer sur une courbe pour la verrouiller.',

    // --- Section Développement individuel ---

    'tdb-dev-individuel':
        'Résultats par artefact. Chaque point = un étudiant sur une activité. Les trajectoires isolées méritent attention.',

    'tdb-selecteur-eleve-indiv':
        'Isoler la trajectoire d\'un étudiant spécifique sur le graphique des artefacts.',

    'tdb-graphique-individuel':
        'Résultats par activité d\'apprentissage. Les zones denses révèlent les tendances du groupe.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Sous-navigation

| Clé | Élément cible |
|-----|---------------|
| `tdb-sous-nav` | Conteneur des onglets de sous-navigation |
| `tdb-apercu` | Onglet « Aperçu » |
| `tdb-liste-individus` | Onglet « Liste des individus » |
| `tdb-profil` | Onglet « Profil » |
| `tdb-interventions-rai` | Onglet « Interventions RàI » |

### Section Observer

| Clé | Élément cible |
|-----|---------------|
| `tdb-observer` | Barre de titre « Observer » |
| `tdb-zones-couleur` | Légende des zones (Fragile / Modéré / Favorable / Très favorable) |
| `tdb-assiduite` | Titre « Assiduité (A) » |
| `tdb-completion` | Titre « Complétion (C) » |
| `tdb-engagement` | Titre « Engagement (E) » |
| `tdb-performance` | Titre « Performance (P) » |

### Section Intervenir

| Clé | Élément cible |
|-----|---------------|
| `tdb-intervenir` | Barre de titre « Intervenir » |
| `tdb-patterns` | Titre « Répartition des patterns d'apprentissage » |
| `tdb-rai` | Titre « Modèle de la Réponse à l'Intervention (RàI) » |

### Section Développement du groupe

| Clé | Élément cible |
|-----|---------------|
| `tdb-dev-groupe` | Barre de titre « Développement du groupe » |
| `tdb-selecteur-indice` | Label ou conteneur du sélecteur « Indice » |
| `tdb-selecteur-eleve-groupe` | Label ou conteneur du sélecteur « Élève » |
| `tdb-graphique-groupe` | Conteneur du graphique Chart.js (pas le canvas lui-même) |

### Section Développement individuel

| Clé | Élément cible |
|-----|---------------|
| `tdb-dev-individuel` | Barre de titre « Développement individuel » |
| `tdb-selecteur-eleve-indiv` | Label ou conteneur du sélecteur « Élève » |
| `tdb-graphique-individuel` | Conteneur du graphique Chart.js (pas le canvas lui-même) |

---

## Règles de placement

- Pour les **barres d'indices** (A, C, E, P) : placer `data-tooltip` sur le **titre de l'indice** (ex. : « Assiduité (A) »), pas sur la barre elle-même ni sur les points individuels. Les points ont leur propre interaction au survol (affichage du nom de l'étudiant via Chart.js ou logique native).
- Pour les **graphiques Chart.js** (Développement du groupe et individuel) : placer `data-tooltip` sur le **conteneur div** du graphique, pas sur l'élément `<canvas>`. Chart.js gère ses propres tooltips natifs au survol des points de données — nos tooltips système ne doivent pas interférer. Le tooltip système n'apparaîtra qu'au survol de la zone autour du graphique, pas au survol des données elles-mêmes.
- Pour les **sélecteurs** (Indice, Élève) : placer `data-tooltip` sur le **label**, pas sur le `<select>`.
- Pour les **annotations textuelles** automatiques (analyses sous les barres) : pas de tooltip. Ce sont des textes générés dynamiquement qui changent selon les données — ils sont eux-mêmes explicatifs.
- Pour les **barres de titre** (Observer, Intervenir, Développement...) : placer `data-tooltip` sur le titre de section dans la barre sombre.
- Pour la **légende des zones de couleur** : placer `data-tooltip` sur le conteneur de la légende (Fragile / Modéré / Favorable / Très favorable), une seule clé pour l'ensemble.

---

## Vérification

- [ ] 22 tooltips apparaissent au survol des éléments ciblés
- [ ] Les tooltips natifs de Chart.js sur les points de données fonctionnent toujours
- [ ] Le clic pour verrouiller/déverrouiller une courbe reste fonctionnel
- [ ] Les sélecteurs (Indice, Élève) s'ouvrent normalement
- [ ] Le survol des points individuels sur les barres d'indices n'est pas perturbé
- [ ] Les annotations textuelles dynamiques restent lisibles
- [ ] Le défilement entre les sections reste fluide
