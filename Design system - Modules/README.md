# Design System Monitorage v7 - Structure Modulaire

**Date de modularisation :** 19 janvier 2026

---

## Point d'entree

**Fichier principal :** `design-system-index.html`

**Acces depuis la racine :** `DESIGN_SYSTEM.html` (redirection automatique)

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

### Module 7 : Primo Assistant
- `07-primo-assistant.html` - Modal d'accueil et Mode Assiste

---

## Fichiers d'audit

- `AUDIT_V5.md` - Specifications harmonisees (16 parties)
- `AUDIT_COMPLET_V4.md` - Version precedente (9 parties)

---

## Archives

- `DESIGN_SYSTEM_monolithique_archive.html` - Fichier monolithique original (archive)

---

## Navigation

Chaque module contient un lien "Retour a l'index" vers `design-system-index.html`.

---

## Maintenance

Pour ajouter un nouveau module :
1. Creer le fichier HTML avec la structure standard
2. Ajouter le lien de retour vers `design-system-index.html`
3. Mettre a jour `design-system-index.html` avec une nouvelle carte

