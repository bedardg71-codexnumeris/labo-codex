# Design System Monitorage v7 - Structure Modulaire

**Date de modularisation :** 19 janvier 2026
**Derniere mise a jour :** 6 fevrier 2026 (Beta 97.1)

---

## Point d'entree

**Fichier principal :** `design-system-index.html`

**Acces depuis la racine :** `DESIGN_SYSTEM.html` (redirection automatique)

---

## Architecture CSS

- `../styles.css` - Styles de l'application (charge par chaque module)
- `guide-common.css` - Styles chrome du guide (en-tete, sections, composants, code, specs, do/dont, tableaux)

Chaque module charge ces deux fichiers. Le CSS specifique au module reste dans un `<style>` local.

---

## Structure des modules

### Module 1 : Fondations
- `01a-palette-couleurs.html` - Palette de couleurs (3 modes)
- `01b-typographie.html` - Hierarchie typographique

### Module 2 : Composants de base
- `02a-boutons.html` - Types et tailles de boutons
- `02b-formulaires.html` - Inputs, selects, labels
- `02c-badges-tetris.html` - Badges de statut

### Module 3 : Composants de donnees
- `03a-tableaux.html` - Tableaux de donnees
- `03b-cartes-sidebars.html` - Cartes et layouts
- `03c-barres-gradient.html` - Barres visuelles A-C-P-E
- `03d-modals.html` - Fenetres modales

### Module 4 : Composants de layout
- `04a-navigation.html` - Navigation principale
- `04b-box-shadow.html` - Box-shadow et en-tetes

### Module 5 : Patterns pedagogiques
- `05-patterns-pedagogiques.html` - Materiel et bibliotheques

### Module 6 : Composants interactifs
- `06a-emojis-CRITIQUE.html` - Regles emojis (IMPORTANT)
- `06b-toggles.html` - Cartes pliables
- `06c-alertes.html` - Messages et alertes
- `06d-utilitaires-beta97.html` - Patterns Beta 97.1 (.u-hide, toggleDisplay, .info-box, .badge-source)

### Module 7 : Primo Assistant
- `07-primo-assistant.html` - Modal d'accueil et Mode Assiste

---

## Archives

Le sous-dossier `_archives/` contient les fichiers historiques :
- Audits (AUDIT_V5.md, AUDIT_COMPLET_V4.md, etc.)
- Previews Liquid Glass
- Archive monolithique originale
- Comparatifs et specs

---

## Navigation

Chaque module contient un lien "Retour a l'index" vers `design-system-index.html`.

---

## Maintenance

Pour ajouter un nouveau module :
1. Creer le fichier HTML avec `<link rel="stylesheet" href="../styles.css">` et `<link rel="stylesheet" href="guide-common.css">`
2. Utiliser les classes `.guide-*` de `guide-common.css` pour la structure
3. Ajouter le CSS specifique au module dans un `<style>` local
4. Ajouter le lien de retour vers `design-system-index.html`
5. Mettre a jour `design-system-index.html` avec une nouvelle carte
6. Mettre a jour ce README
