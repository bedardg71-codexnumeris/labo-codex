# Plan — Audit UX cohérence visuelle

**Date** : 6 avril 2026
**Statut** : Planifié — prochaine session
**Priorité** : Qualité / cohérence UI
**Prérequis** : Design system mis à jour (sections 20-23 ajoutées le 6 avril)

---

## Objectif

Assurer la cohérence visuelle de l'application en utilisant `design-system.html` comme étalon de référence, puis corriger les écarts par lots CSS sans refonte HTML.

---

## 3 axes d'analyse

### Axe 1 — Cohérence interne
Les composants similaires se ressemblent-ils ?

| Composant | Vérifié dans |
|---|---|
| Accordéons | Contexte vs Structure vs Aide |
| Formulaires (layout bibliothèque/formulaire) | 6 accordéons de Trimestre |
| Tableaux | Étudiants vs Évaluations vs Présences |
| Boutons (styles, tailles, couleurs par action) | Toutes les sections |
| Badges et chips (A-C-P-E, statuts, compteurs) | Suivi, Évaluations, Profil étudiant |
| Panneaux métadonnées | Grille, Production, Échelle, Cartouche |
| Cartes métriques | Tableau de bord, Profil étudiant |
| Sidebar navigation | Structure, Évaluations |

### Axe 2 — Différenciation contextuelle
L'utilisateur sait-il « où » il est ?

| Contexte | Rôle | Ton visuel attendu |
|---|---|---|
| **Configuration** (Contexte > Trimestre) | Paramétrer | Neutre, formulaires, blocs-section |
| **Construction** (Structure) | Créer les gabarits | Technique, grilles/échelles/cartouches |
| **Opération** (Évaluations, Travaux, Suivi) | Données vivantes | Dense, tableaux, badges dynamiques |
| **Export/Archive** | Sortie | Aperçus PDF, zones de téléchargement |
| **Aide** | Lecture | Navigation documentaire, toggles info |

### Axe 3 — Modes clair et sombre
Pas juste « inversé » mais intentionnel.

- Contrastes suffisants (WCAG AA : 4.5:1 texte, 3:1 éléments graphiques)
- Surfaces et ombres cohérentes entre les deux modes
- Les accents (A-C-P-E, badges risque, alertes) restent lisibles dans les deux modes
- Le mode clair n'est pas un afterthought — même niveau de soin que le sombre

---

## Critères de réussite

| Critère | Mesure |
|---|---|
| Un enseignant identifie la section active en < 2 sec | Hiérarchie visuelle claire |
| Pas de « rupture » visuelle entre sections | Même vocabulaire de composants |
| Mode clair aussi soigné que le sombre | Pas de dégradation visible |
| Zéro ajout de complexité gratuite | Chaque changement sert la lisibilité |

---

## Méthode (5 étapes)

### Étape 1 — Capturer
Prendre des captures d'écran de l'app par contexte :
- Configuration (Trimestre : 6 accordéons)
- Construction (Structure : grilles, échelles, productions, cartouches)
- Opération (Évaluations, Travaux, Suivi, Tableau de bord)
- Export (Export Lea, Export PDF, Archivage)
- Aide (sections principales)

**Livrable** : dossier de captures organisé par contexte

### Étape 2 — Cataloguer
Comparer chaque capture avec le design system (`design-system.html`).
Remplir un tableau d'écarts :

| Section | Composant | Écart observé | Gravité |
|---|---|---|---|
| (ex.) Aide | Accordéons | Pas de chevron, style différent | Gênant |
| (ex.) Évaluations | Tableaux | Header non coloré | Mineur |

**Livrable** : tableau d'écarts complet

### Étape 3 — Prioriser
Classer les écarts en 3 niveaux :
1. **Gêne** — Casse la compréhension ou la lisibilité → corriger immédiatement
2. **Dérange** — Incohérence visible mais pas bloquante → corriger dans la session
3. **Pourrait être mieux** — Raffinement esthétique → corriger si le temps le permet

### Étape 4 — Appliquer
Corriger par lots (CSS seulement, pas de refonte HTML) :
- Lot 1 : Écarts de gravité « Gêne »
- Lot 2 : Écarts de gravité « Dérange »
- Lot 3 : Raffinements « Pourrait être mieux » (avec le plugin frontend-design)

**Règle** : un commit par lot, validation visuelle entre chaque lot.

### Étape 5 — Valider
Après chaque lot :
- Vérifier le rendu en mode sombre ET clair
- Comparer avec le design system
- Tester sur MacBook (1470px) et iPad (768px) si possible
- Capture « après » pour documenter l'amélioration

---

## Fichiers concernés

- **Étalon** : `design-system.html` (sections 1-23)
- **CSS principal** : `styles.css` (~22 000 lignes)
- **Captures avant/après** : `design systeme captures 6 avril/`
- **Pas de modification JS** sauf si un composant manque dans le DOM

---

## Risques

- Le CSS est dense (~22k lignes) — bien cibler les sélecteurs pour éviter les effets de bord
- Certains composants ont des styles inline dans `index.html` — les noter mais ne pas les corriger dans cet audit (chantier séparé)
- Le mode clair est moins testé — prévoir du temps de validation supplémentaire

---

## Ce qui est hors scope

- Refonte HTML / restructuration du DOM
- Nouvelles fonctionnalités
- Performance CSS (chantier séparé)
- Accessibilité avancée au-delà du contraste (chantier séparé)
