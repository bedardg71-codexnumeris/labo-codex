# Module Carte Mentale — Description pour Cowork

## Vue d'ensemble

Le module **Carte mentale** (`planification-carte.js`, 4 239 lignes) est un éditeur de graphe pédagogique. Il permet aux enseignants de visualiser et consolider l'**alignement pédagogique** de leur cours en connectant compétences, idées maîtresses, contenus, activités et évaluations sur un canevas zoomable.

---

## Architecture technique

- **Rendu** : Noeuds = `<div>` DOM positionnés en absolu. Liens = courbes de Bézier SVG.
- **Canevas** : 10 000 × 6 000 px, zoomable (25 % – 300 %) via `transform: scale()`.
- **Persistance** : IndexedDB (clé `h2026_planification_mindmap`), pas de serveur.
- **Aucune dépendance externe** (pas de D3, pas de vis.js — tout est maison).

---

## Types de noeuds (9 types)

| Catégorie | Type | Couleur | Conteneur ? |
|-----------|------|---------|-------------|
| **Objectifs** | `competence` | Bleu (#2563eb) | Non |
| | `idee-maitresse` | Bleu clair (#3b82f6) | Non |
| **Savoirs** | `connaissance` (« Information ») | Orange (#f97316) | Non |
| | `strategie` | Orange foncé (#ea580c) | Non |
| | `condition` | Orange moyen (#fb923c) | Non |
| **Contenants** | `sequence` | Violet (#7e22ce) | **Oui** — contient des leçons |
| | `lecon` | Violet clair (#c084fc) | **Oui** — contient savoirs + activités |
| **Activités** | `activite` (« Apprentissage ») | Vert (#16a34a) | Non |
| | `soutien` | Vert clair (#22c55e) | Non |
| | `revision` | Vert foncé (#15803d) | Non |
| **Évaluation** | `evaluation` | Magenta (#D946EF) | Non |

Chaque noeud a : `id`, `type`, `titre` (éditable), `description`, `x/y`, `parent` (si enfant d'un conteneur), `enfants[]`, `metadata{}`, `cloneSourceId`.

---

## Types de liens (verbes pédagogiques)

Les liens entre noeuds portent un **verbe** qui décrit la relation d'alignement. Les verbes sont **déduits automatiquement** selon les types source → cible :

| Source | Cible | Verbe auto |
|--------|-------|------------|
| Compétence | Idée maîtresse | **se décline en** |
| Idée maîtresse | Leçon / Séquence | **se concrétise dans** |
| Savoir (info/stratégie/condition) | Activité / Soutien / Révision | **s'acquiert par** |
| Idée / Savoir / Activité | Évaluation | **se vérifie par** |

Pour les liens **horizontaux** (même famille de types), l'utilisateur choisit parmi : `s'appuie sur`, `complète`, `conduit à`, `est mobilisé(e) par`.

Structure d'un lien : `{ id, source, cible, type: 'se_decline_en' }`.

---

## Système de badges (validation de l'alignement)

Chaque noeud affiche 2 badges de validation :

- **Badge entrée** (en haut à gauche) : est-ce que ce noeud est connecté en amont ? (ex. : une idée maîtresse est-elle reliée à une compétence ?)
- **Badge sortie** (en haut à droite) : est-ce que ce noeud se prolonge en aval ? (ex. : une idée maîtresse mène-t-elle à une leçon ?)

| Type | Entrée valide si… | Sortie valide si… | Avertissement si… |
|------|-------------------|-------------------|-------------------|
| Compétence | Toujours valide | Décline en ≥1 idée maîtresse | Aucune évaluation ne l'atteint |
| Idée maîtresse | Reliée à une compétence | Se concrétise dans ≥1 leçon | Aucune évaluation ne l'atteint |
| Connaissance | Contenue dans une leçon | Reliée à une activité | — |
| Activité | Reliée à un contenu | Reliée à un contenu | — |
| Leçon | Reliée à une idée maîtresse | Contient contenus + activités | — |
| Séquence | Toujours valide | Contient ≥1 leçon | — |
| Évaluation | Reliée à un objectif/contenu/activité | Toujours valide | — |

Les badges sont vert (✓) quand valide, gris (!) quand manquant, orange (⚠) pour les avertissements.

---

## Interactions utilisateur

### Création
- **Palette latérale gauche** avec les 9 types. Glisser un type sur le canevas crée un noeud.

### Manipulation
- **Clic** = sélection (panneau de propriétés à droite).
- **Double-clic** = édition du titre (contenteditable).
- **Glisser** = repositionner (avec logique complexe pour les enfants de conteneurs).
- **Ctrl+Clic** = multi-sélection.
- **Suppr/Backspace** = supprimer.
- **Ctrl+D** = cloner un noeud.
- **Ctrl+Z / Ctrl+Shift+Z** = annuler / rétablir (pile de 50 snapshots).

### Connexion
- Chaque noeud a **4 ports** (haut, bas, gauche, droite).
- Glisser d'un port à un autre noeud crée un lien avec verbe automatique.
- Les liens ont des **poignées** pour reconnecter les extrémités.

### Zoom
- Ctrl + / − / 0 / 1 pour zoom, reset, recentrer.
- Boutons préréglés : 100 %, 75 %, 50 %, 25 %.

---

## Conteneurs (séquences et leçons)

Les **séquences** et **leçons** sont des noeuds conteneurs :
- Une **séquence** contient des **leçons** (positionnement libre à l'intérieur).
- Une **leçon** contient des **savoirs**, **activités** et **évaluations** (empilement vertical automatique).
- Glisser un noeud dans un conteneur l'adopte automatiquement.
- Glisser un enfant hors du conteneur le détache.

---

## Clones

Un même noeud (ex. : une information) peut apparaître dans **plusieurs leçons**. Le système de clones :
- Clone = copie liée visuellement par un indicateur 🧬.
- Modifier le titre/description d'un clone propage à tous les clones du même original.
- Chaque clone a sa propre position et son propre parent.

---

## Stockage des données

```javascript
// Clé IndexedDB (préfixée par trimestre)
h2026_planification_mindmap = {
    index: {
        active: 'carte_1',          // Carte actuellement affichée
        compteurCartes: 3,
        cartes: [
            { id: 'carte_1', nom: 'Algèbre H2026', dateCreation: '...' },
            ...
        ]
    },
    cartes: {
        'carte_1': {
            compteur: 42,            // Prochain ID de noeud
            compteurLiens: 17,       // Prochain ID de lien
            noeuds: [ /* tableau d'objets noeud */ ],
            liens: [ /* tableau d'objets lien */ ]
        }
    }
}
```

L'utilisateur peut avoir **plusieurs cartes** (une par cours/section) avec un sélecteur.

---

## Organisateur (sous-module intégré)

L'onglet **Organisateur** (`organisateur.js`) est un planificateur de séances lié à la carte mentale :
- Sélectionner une séquence → leçon → voir les activités liées.
- Template d'**enseignement explicite** en 5 étapes : Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture.
- Lien avec les productions (évaluations).

---

## Export

3 formats d'export :
- **Texte** (.txt) : Hiérarchie lisible avec relations.
- **TSV** (.tsv) : Tableur avec noeuds et liens.
- **JSON** (.json) : Sauvegarde complète, réimportable.

---

## Flux d'alignement pédagogique attendu

```
Compétence
    ↓ se décline en
Idée maîtresse
    ↓ se concrétise dans
Séquence → Leçon
    ↓ contient
    ├── Information / Stratégie / Condition
    │       ↓ s'acquiert par
    │   Activité / Soutien / Révision
    └── Évaluation
            ↑ se vérifie par
        Idée maîtresse / Information / Activité
```

Le système de badges valide que **chaque compétence est atteinte par au moins une évaluation** à travers cette chaîne.
