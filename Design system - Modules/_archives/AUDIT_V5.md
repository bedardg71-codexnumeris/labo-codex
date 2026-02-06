# AUDIT V5 - Design System v7
## Harmonisation exhaustive de tous les composants UI

**Date :** 2 janvier 2026
**Version :** 5.0
**Pour :** Claude Code
**Objectif :** Implémenter toutes les harmonisations Design System v7 (16 parties)

---

## SOMMAIRE DES MODIFICATIONS

### Parties existantes (V4)
1. **4 Pratiques de notation** (SOM / STD / SPE / DEN)
2. **Badges Tétris** (7 familles harmonisées)
3. **Badges matériel pédagogique**
4. **Gradients** (en-tête + fond page)
5. **Box-shadow** (système 5 niveaux)
6. **Border-radius** (12px harmonisé avec toggles)
7. **Sidebars / Bibliothèques** (fond blanc)
8. **Boutons** (padding unifié)
9. **Variables CSS** (système complet)

### Nouvelles parties (V5)
10. **Modals** (modale + overlay)
11. **Alertes** (4 types : info/succès/warning/danger)
12. **Navigation** (barre nav + items)
13. **Formulaires** (inputs/textarea/select/labels)
14. **Tableaux** (headers/rows/hover)
15. **Barres de progression** (avec gradients)
16. **Primo Assistant / Wizard** (étapes/formulaires)

---

## PARTIE 1 : 4 PRATIQUES DE NOTATION

### 1.1 : Variables CSS

**Fichier :** `index.html` (ligne ~42)

**AJOUTER :**
```css
:root {
    /* Couleurs pratiques d'évaluation (codes 3 lettres uniformes) */
    --som-orange: #ff6f00;
    --std-bleu: #0277bd;
    --spe-vert: #16a34a;
    --den-violet: #9c27b0;
}
```

**Note :** Supprimer `--pan-bleu` si présent (obsolète, remplacé par `--std-bleu`).

### 1.2 : Styles badges pratique

**Fichier :** `styles.css` (section badges pratique)

**REMPLACER** tous les badges `.som`, `.pan`, `.spec` par :

```css
/* === BADGES PRATIQUE (4 FAMILLES) === */

/* Badge normal (Compact pill) */
.badge-pratique {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1.5px solid;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    transition: all 0.2s ease;
}

.badge-pratique:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Variante SOM (orange) */
.badge-pratique.som {
    background: color-mix(in srgb, var(--som-orange) 9%, transparent);
    border-color: var(--som-orange);
    color: var(--som-orange);
}

/* Variante STD (bleu) */
.badge-pratique.std {
    background: color-mix(in srgb, var(--std-bleu) 9%, transparent);
    border-color: var(--std-bleu);
    color: var(--std-bleu);
}

/* Variante SPE (vert) */
.badge-pratique.spe {
    background: color-mix(in srgb, var(--spe-vert) 9%, transparent);
    border-color: var(--spe-vert);
    color: var(--spe-vert);
}

/* Variante DEN (violet) */
.badge-pratique.den {
    background: color-mix(in srgb, var(--den-violet) 9%, transparent);
    border-color: var(--den-violet);
    color: var(--den-violet);
}

/* Badge compact */
.badge-pratique-compact {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1.5px solid;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
}

.badge-pratique-compact.som {
    background: color-mix(in srgb, var(--som-orange) 9%, transparent);
    border-color: var(--som-orange);
    color: var(--som-orange);
}

.badge-pratique-compact.std {
    background: color-mix(in srgb, var(--std-bleu) 9%, transparent);
    border-color: var(--std-bleu);
    color: var(--std-bleu);
}

.badge-pratique-compact.spe {
    background: color-mix(in srgb, var(--spe-vert) 9%, transparent);
    border-color: var(--spe-vert);
    color: var(--spe-vert);
}

.badge-pratique-compact.den {
    background: color-mix(in srgb, var(--den-violet) 9%, transparent);
    border-color: var(--den-violet);
    color: var(--den-violet);
}
```

### 1.3 : Bulles en-tête

**Fichier :** `index.html` (section bulles, ligne ~1486)

**AJOUTER :**
```css
.bulle.som {
    background: var(--som-orange);
}

.bulle.std {
    background: var(--std-bleu);
}

.bulle.spe {
    background: var(--spe-vert);
}

.bulle.den {
    background: var(--den-violet);
}
```

**Note :** Supprimer `.bulle.pan` si présent (obsolète).

### 1.4 : HTML - Recherche et remplacement

**Dans tous les fichiers HTML/JS :**

**REMPLACER :**
- `class="badge-pratique pan"` → `class="badge-pratique std"`
- `class="bulle pan"` → `class="bulle std"`
- Texte "PAN" → "STD" (dans les badges uniquement, pas dans la documentation)

**AJOUTER** le support pour DEN partout où SOM/STD/SPE apparaissent.

### 1.5 : Tableau récapitulatif 4 pratiques

| Pratique | Code | Couleur | Hex | Variable | Description |
|----------|------|---------|-----|----------|-------------|
| **Sommative** | SOM | Orange | #ff6f00 | `--som-orange` | Notation sommative traditionnelle |
| **Standards** | STD | Bleu | #0277bd | `--std-bleu` | Standards-based grading (PAN-Standards) |
| **Spécifications** | SPE | Vert | #16a34a | `--spe-vert` | Specifications grading (PAN-Spécifications) |
| **Dénotation** | DEN | Violet | #9c27b0 | `--den-violet` | Ungrading / Dénotation (PAN-Dénotation) |

---

## PARTIE 2 : BADGES TÉTRIS (7 FAMILLES)

**Référence détaillée :** Voir AUDIT_BADGES.md pour les 13 familles complètes.

**Principe uniforme :**
```css
/* Badge principal */
padding: 3px 8px;
font-size: 0.75rem;
border-radius: 5px;
gap: 5px;
font-weight: 600;
line-height: 1.2;
transition: all 0.2s ease;

/* Badge interne (imbriqué) */
padding: 2px 6px;
font-size: 0.7rem;
border-radius: 3px;
```

**Familles concernées :**
1. Absence / Retard
2. Intervention RàI
3. Artefacts
4. Jetons (3 types)
5. Statut RàI / Pattern
6. Niveau RàI
7. Système (analyse, risque)

**Variables CSS recommandées :**
```css
:root {
    /* Taille principale */
    --badge-padding: 3px 8px;
    --badge-font-size: 0.75rem;
    --badge-border-radius: 5px;
    --badge-gap: 5px;

    /* Taille interne (badges imbriqués) */
    --badge-compact-padding: 2px 6px;
    --badge-compact-font-size: 0.7rem;
    --badge-compact-border-radius: 3px;

    /* Commun */
    --badge-font-weight: 600;
    --badge-line-height: 1.2;
    --badge-transition: all 0.2s ease;
}
```

---

## PARTIE 3 : BADGES MATÉRIEL PÉDAGOGIQUE

**Fichier :** `styles.css`

**Classes :** `.badge-criteres`, `.badge-nombre-criteres`

**AVANT :**
```css
.badge-criteres {
    padding: 8px 20px;
    border-radius: 25px;
    font-size: 0.9rem;
}
```

**APRÈS (Moyen pill) :**
```css
.badge-criteres {
    display: inline-block;
    padding: 6px 15px;           /* Au lieu de 8px 20px */
    border-radius: 20px;          /* Au lieu de 25px */
    background: #032e5c;
    color: white;
    font-size: 0.85rem;           /* Au lieu de 0.9rem */
    font-weight: 600;
    line-height: 1.2;
    transition: all 0.2s ease;
}

.badge-criteres:hover {
    background: #054a95;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(3, 46, 92, 0.2);
}
```

---

## PARTIE 4 : GRADIENTS

### 4.1 : En-tête

**Fichier :** `styles.css` ou `index.html`

**AVANT :**
```css
.entete {
    background: linear-gradient(135deg, #032e5c 0%, #0f1e3a 100%);
    border-radius: 8px;
}
```

**APRÈS :**
```css
.entete {
    background: linear-gradient(135deg, #032e5c 0%, #0f1e3a 100%);
    border-radius: 0 0 12px 12px;  /* Coins arrondis bas seulement */
    box-shadow: 0 4px 12px rgba(3, 46, 92, 0.25);
    transition: box-shadow 0.3s ease;
}
```

**Changements :**
- Border-radius : `0 0 12px 12px` (coins arrondis bas)
- Box-shadow : Niveau Prononcé ajouté
- Harmonisé avec toggles (12px)

### 4.2 : Fond de page

**Fichier :** `styles.css` ou body dans HTML

**CONSERVER (déjà bon) :**
```css
body {
    background: linear-gradient(135deg, #e8f2fd 0%, #f0f8ff 100%);
    min-height: 100vh;
}
```

**Note :** Le gradient fond page est déjà correct.

---

## PARTIE 5 : BOX-SHADOW (SYSTÈME 5 NIVEAUX)

### 5.1 : Variables CSS

**Fichier :** `index.html` ou `styles.css` (section :root)

**AJOUTER :**
```css
:root {
    /* === BOX-SHADOW (5 niveaux) === */
    --shadow-subtil: 0 1px 4px rgba(3, 46, 92, 0.1);
    --shadow-normal: 0 2px 8px rgba(3, 46, 92, 0.15);
    --shadow-prononce: 0 4px 12px rgba(3, 46, 92, 0.25);
    --shadow-fort: 0 8px 24px rgba(3, 46, 92, 0.3);
    --shadow-inset: inset 0 1px 3px rgba(3, 46, 92, 0.08);
}
```

### 5.2 : Application

**Appliquer aux composants :**

```css
/* Sections, items */
.section-collapsible,
.item-liste {
    box-shadow: var(--shadow-subtil);
}

/* Cartes, sidebars, bibliothèques */
.carte,
.sidebar-navigation,
.sidebar-cartouches,
.profil-sidebar,
.carte-bibliotheque {
    box-shadow: var(--shadow-normal);
}

/* En-tête, hover sur cartes */
.entete {
    box-shadow: var(--shadow-prononce);
}

.carte:hover {
    box-shadow: var(--shadow-prononce);
    transform: translateY(-2px);
}

/* Modaux, dropdowns */
.modal-content,
.dropdown-menu {
    box-shadow: var(--shadow-fort);
}

/* Panneaux, toggles, inputs */
.panneau-saisie,
input[type="checkbox"],
input[type="text"]:focus {
    box-shadow: var(--shadow-inset);
}
```

### 5.3 : Tableau récapitulatif Box-Shadow

| Niveau | Box-shadow | Usage |
|--------|------------|-------|
| **Subtil** | `0 1px 4px rgba(3, 46, 92, 0.1)` | Sections, items |
| **Normal** | `0 2px 8px rgba(3, 46, 92, 0.15)` | Cartes, sidebars |
| **Prononcé** | `0 4px 12px rgba(3, 46, 92, 0.25)` | En-tête, hover |
| **Fort** | `0 8px 24px rgba(3, 46, 92, 0.3)` | Modaux |
| **Inset** | `inset 0 1px 3px rgba(3, 46, 92, 0.08)` | Panneaux, toggles |

---

## PARTIE 6 : BORDER-RADIUS (12PX)

### 6.1 : Système 4 niveaux

**Fichier :** `styles.css`

**MODIFIER :**

```css
/* === BORDER-RADIUS HARMONISÉ === */

/* NIVEAU 1 : 12px (conteneurs - harmonisé toggles) */
.entete,
.carte,
.sidebar-navigation,
.sidebar-cartouches,
.profil-sidebar,
.carte-bibliotheque,
.modal-content,
.section-collapsible,
.panneau-saisie {
    border-radius: 12px;  /* Au lieu de 8px */
}

/* En-tête : coins arrondis bas seulement */
.entete {
    border-radius: 0 0 12px 12px;
}

/* NIVEAU 2 : 6px (petits éléments) */
.btn,
input[type="text"],
input[type="number"],
textarea,
select,
.alert {
    border-radius: 6px;
}

/* NIVEAU 3 : 20px (pills uniformes) */
.badge-pratique,
.badge-criteres {
    border-radius: 20px;
}

/* NIVEAU 4 : 5px (badges Tétris) */
.badge-absence,
.badge-retard,
.badge-intervention {
    border-radius: 5px;
}
```

### 6.2 : Progression border-radius

**Logique :**
- 5px → Badges Tétris (compact)
- 6px → Boutons, inputs, alertes (petits éléments)
- 12px → Conteneurs (harmonisé toggles)
- 20px → Pills (pratiques, matériel péda)

---

## PARTIE 7 : SIDEBARS / BIBLIOTHÈQUES (FOND BLANC)

### 7.1 : Sidebars

**Fichier :** `styles.css`

**AVANT :**
```css
.sidebar-navigation {
    background: #e8f2fd;  /* Bleu pâle */
    padding: 15px;
    border-radius: 8px;
}
```

**APRÈS :**
```css
.sidebar-navigation,
.sidebar-cartouches,
.profil-sidebar {
    background: white;                          /* Au lieu de #e8f2fd */
    padding: 15px;
    border-radius: 12px;                        /* Au lieu de 8px */
    box-shadow: var(--shadow-normal);           /* Ajout */
}

/* Items sidebar */
.sidebar-item,
.nav-item {
    padding: 10px 15px;  /* Au lieu de 12px */
}
```

### 7.2 : Bibliothèques

**Fichier :** `styles.css`

**AVANT :**
```css
.carte-bibliotheque {
    background: #e8f2fd;
    border: 3px solid #2196f3;
    border-radius: 16px;
    padding: 25px;
}
```

**APRÈS :**
```css
.carte-bibliotheque {
    background: white;                          /* Au lieu de #e8f2fd */
    border: 2px solid #6b85b3;                 /* Au lieu de 3px #2196f3 */
    border-radius: 12px;                        /* Au lieu de 16px */
    padding: 15px;                              /* Au lieu de 25px */
    box-shadow: var(--shadow-normal);
    transition: all 0.2s ease;
}

.carte-bibliotheque:hover {
    box-shadow: var(--shadow-prononce);
    transform: translateY(-2px);
}
```

---

## PARTIE 8 : BOUTONS (PADDING UNIFIÉ)

**Fichier :** `styles.css`

**AVANT (variabilité) :**
```css
.bouton-principal { padding: 10px 20px; }
.bouton-secondaire { padding: 12px 18px; }
```

**APRÈS (Moyen uniforme) :**
```css
.bouton-principal,
.bouton-secondaire,
.bouton-action,
.bouton-danger,
.bouton-texte,
.btn {
    padding: 10px 15px;  /* Unifié */
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
}
```

---

## PARTIE 9 : VARIABLES CSS COMPLÈTES

**Fichier :** `index.html` ou `styles.css` (section :root)

**AJOUTER :**
```css
:root {
    /* === COULEURS PRATIQUES === */
    --som-orange: #ff6f00;
    --std-bleu: #0277bd;
    --spe-vert: #16a34a;
    --den-violet: #9c27b0;

    /* === GRADIENTS === */
    --gradient-entete: linear-gradient(135deg, #032e5c 0%, #0f1e3a 100%);
    --gradient-fond-page: linear-gradient(135deg, #e8f2fd 0%, #f0f8ff 100%);

    /* === BOX-SHADOW (5 niveaux) === */
    --shadow-subtil: 0 1px 4px rgba(3, 46, 92, 0.1);
    --shadow-normal: 0 2px 8px rgba(3, 46, 92, 0.15);
    --shadow-prononce: 0 4px 12px rgba(3, 46, 92, 0.25);
    --shadow-fort: 0 8px 24px rgba(3, 46, 92, 0.3);
    --shadow-inset: inset 0 1px 3px rgba(3, 46, 92, 0.08);

    /* === BORDER-RADIUS === */
    --radius-petit: 5px;    /* Badges Tétris */
    --radius-moyen: 6px;    /* Boutons, inputs, alertes */
    --radius-grand: 12px;   /* Conteneurs (harmonisé toggles) */
    --radius-pill: 20px;    /* Pills uniformes */

    /* === SYSTÈME 3 ÉCHELLES TÉTRIS === */

    /* Compact */
    --padding-compact: 3px 8px;
    --font-compact: 0.75rem;

    /* Compact pill */
    --padding-compact-pill: 3px 10px;

    /* Moyen */
    --padding-moyen: 10px 15px;
    --font-moyen: 0.9rem;

    /* Moyen pill */
    --padding-moyen-pill: 6px 15px;
    --font-moyen-pill: 0.85rem;

    /* Large */
    --padding-large: 15px;
    --font-large: 1rem;
}
```

---

## PARTIE 10 : MODALS

**Fichier concerné :** `03d-modals.html`, `styles.css`

### 10.1 : Modal content

**AVANT :**
```css
.modal-content {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

**APRÈS :**
```css
.modal-content {
    background: white;
    border-radius: 12px;                            /* Au lieu de 8px */
    padding: 30px;
    box-shadow: 0 8px 24px rgba(3, 46, 92, 0.3);   /* FORT - niveau 4 */
    max-width: 600px;
    margin: 0 auto;
}
```

**Changements :**
- Border-radius : 12px (harmonisé conteneurs)
- Box-shadow : Niveau Fort (éléments flottants)
- Couleur ombre : bleu #032e5c (cohérence palette)

### 10.2 : Modal overlay

**AVANT :**
```css
.modal-overlay {
    background: rgba(0, 0, 0, 0.5);
}
```

**APRÈS :**
```css
.modal-overlay {
    background: rgba(3, 46, 92, 0.4);               /* Bleu principal avec alpha */
    backdrop-filter: blur(2px);                     /* Flou moderne */
}
```

**Changements :**
- Overlay bleu : Cohérence avec palette (au lieu de noir pur)
- Backdrop-filter : Effet moderne

### 10.3 : Modal header et footer

**APRÈS :**
```css
.modal-header {
    padding-bottom: 15px;
    border-bottom: 1px solid #e8f2fd;
    margin-bottom: 20px;
}

.modal-header h2,
.modal-header h3 {
    color: #032e5c;
    font-weight: 600;
    margin: 0;
}

.modal-footer {
    padding-top: 20px;
    border-top: 1px solid #e8f2fd;
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}
```

**Justification :**
- Border-radius 12px : Harmonisé avec toggles et conteneurs
- Box-shadow Fort : Élément flottant qui doit ressortir
- Overlay bleu : Cohérence avec palette

---

## PARTIE 11 : ALERTES

**Fichier concerné :** `06c-alertes.html`, `styles.css`

### 11.1 : Style de base

**AVANT :**
```css
.alert {
    padding: 12px 16px;
    border-radius: 8px;
    border-left: 4px solid;
}
```

**APRÈS :**
```css
.alert {
    padding: 12px 16px;
    border-radius: 6px;                            /* Petits éléments = 6px */
    border-left: 4px solid;
    box-shadow: 0 1px 4px rgba(3, 46, 92, 0.1);   /* Subtil */
    font-size: 0.9rem;
    line-height: 1.5;
}
```

**Changements :**
- Border-radius : 6px (petits éléments)
- Box-shadow : Niveau Subtil

### 11.2 : 4 types d'alertes

**APRÈS :**
```css
/* Info (bleu) */
.alert-info {
    background: color-mix(in srgb, #0277bd 9%, transparent);
    border-color: #0277bd;
    color: #01579b;
}

/* Succès (vert) */
.alert-success {
    background: color-mix(in srgb, #22c55e 9%, transparent);
    border-color: #22c55e;
    color: #16a34a;
}

/* Warning (orange) */
.alert-warning {
    background: color-mix(in srgb, #ff6f00 9%, transparent);
    border-color: #ff6f00;
    color: #e65100;
}

/* Danger (rouge) */
.alert-danger {
    background: color-mix(in srgb, #dc3545 9%, transparent);
    border-color: #dc3545;
    color: #c82333;
}
```

**Justification :**
- Color-mix 9% : Même technique que badges pratique
- Couleurs cohérentes avec le reste du système

---

## PARTIE 12 : NAVIGATION

**Fichier concerné :** `04a-navigation.html`, `styles.css`

### 12.1 : Barre navigation

**AVANT :**
```css
.navigation {
    background: linear-gradient(135deg, #2a4a8a 0%, #032e5c 100%);
    padding: 15px;
    border-radius: 8px;
}
```

**APRÈS :**
```css
.navigation {
    background: linear-gradient(135deg, #2a4a8a 0%, #032e5c 100%);
    padding: 15px;
    border-radius: 12px;                           /* Au lieu de 8px */
    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.15);  /* Normal */
}
```

**Changements :**
- Border-radius : 12px (harmonisé conteneurs)
- Box-shadow : Niveau Normal

### 12.2 : Items navigation

**AVANT :**
```css
.nav-item {
    padding: 10px 20px;
    border-radius: 6px;
}
```

**APRÈS :**
```css
.nav-item {
    padding: 10px 15px;                            /* Harmonisé boutons */
    border-radius: 6px;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateY(-1px);
}

.nav-item.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 600;
}
```

**Justification :**
- Padding harmonisé avec boutons
- Transitions cohérentes

---

## PARTIE 13 : FORMULAIRES

**Fichier concerné :** `02b-formulaires.html`, `styles.css`

### 13.1 : Inputs / Textarea / Select

**AVANT :**
```css
input[type="text"],
textarea,
select {
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}
```

**APRÈS :**
```css
input[type="text"],
input[type="email"],
input[type="number"],
input[type="password"],
input[type="date"],
textarea,
select {
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;                           /* Au lieu de 4px */
    font-size: 0.9rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Focus state */
input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #032e5c;
    box-shadow: 0 0 0 3px rgba(3, 46, 92, 0.1);  /* Ring focus */
}

/* Placeholder */
input::placeholder,
textarea::placeholder {
    color: #9ca3af;
}
```

**Changements :**
- Border-radius : 6px (petits éléments)
- Focus ring : Accessibilité améliorée

### 13.2 : Labels

**AVANT :**
```css
label {
    font-weight: 500;
    margin-bottom: 5px;
}
```

**APRÈS :**
```css
label {
    font-weight: 600;                             /* Plus prononcé */
    font-size: 0.9rem;
    color: #032e5c;
    margin-bottom: 6px;
    display: block;
}

label.required::after {
    content: " *";
    color: #dc3545;
}
```

**Justification :**
- Labels plus prononcés : Hiérarchie visuelle
- Support required

### 13.3 : Form groups

**APRÈS :**
```css
.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 15px;
}

.form-row .form-group {
    flex: 1;
}
```

---

## PARTIE 14 : TABLEAUX

**Fichier concerné :** `03a-tableaux.html`, `styles.css`

### 14.1 : Table conteneur

**AVANT :**
```css
.table-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
}
```

**APRÈS :**
```css
.table-container {
    background: white;
    padding: 20px;
    border-radius: 12px;                          /* Au lieu de 8px */
    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.15); /* Normal */
    overflow-x: auto;
}
```

**Changements :**
- Border-radius : 12px (harmonisé conteneurs)
- Box-shadow : Niveau Normal
- Overflow-x : Responsive

### 14.2 : Table headers

**AVANT :**
```css
th {
    background: #f5f5f5;
    font-weight: 600;
    padding: 12px;
}
```

**APRÈS :**
```css
th {
    background: #e8f2fd;                         /* Bleu pâle */
    color: #032e5c;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 12px 15px;
    text-align: left;
    border-bottom: 2px solid #032e5c;
}
```

**Changements :**
- Background bleu pâle : Identité visuelle
- Border-bottom : Séparation nette

### 14.3 : Table rows

**AVANT :**
```css
tr:hover {
    background: #f5f5f5;
}
```

**APRÈS :**
```css
tbody tr {
    transition: background 0.2s ease;
    border-bottom: 1px solid #e8f2fd;
}

tbody tr:hover {
    background: #f0f8ff;                         /* Bleu très pâle */
    cursor: pointer;
}

tbody tr:last-child {
    border-bottom: none;
}

td {
    padding: 12px 15px;
    font-size: 0.9rem;
}
```

**Justification :**
- Hover bleu : Cohérence palette
- Headers bleu pâle : Identité visuelle

---

## PARTIE 15 : BARRES DE PROGRESSION

**Fichier concerné :** `03c-barres-gradient.html`, `styles.css`

### 15.1 : Barre conteneur

**AVANT :**
```css
.progress-bar-container {
    background: #e0e0e0;
    height: 20px;
    border-radius: 10px;
}
```

**APRÈS :**
```css
.progress-bar-container {
    background: #e8f2fd;                         /* Bleu pâle */
    height: 20px;
    border-radius: 10px;                         /* OK (pill) */
    box-shadow: inset 0 1px 3px rgba(3, 46, 92, 0.08); /* Inset */
    overflow: hidden;
}
```

**Changements :**
- Background bleu pâle : Identité visuelle
- Box-shadow inset : Profondeur

### 15.2 : Barre remplissage

**AVANT :**
```css
.progress-bar-fill {
    background: #22c55e;
    height: 100%;
}
```

**APRÈS :**
```css
.progress-bar-fill {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 10px;
}

/* Variantes */
.progress-bar-fill.primary {
    background: linear-gradient(135deg, #2a4a8a 0%, #032e5c 100%);
}

.progress-bar-fill.warning {
    background: linear-gradient(135deg, #ff9800 0%, #ff6f00 100%);
}

.progress-bar-fill.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc3545 100%);
}

.progress-bar-fill.info {
    background: linear-gradient(135deg, #42a5f5 0%, #0277bd 100%);
}
```

**Justification :**
- Gradients 135deg : Cohérence totale
- Variantes colorées : Feedback visuel

### 15.3 : Labels progression

**APRÈS :**
```css
.progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 0.85rem;
    color: #032e5c;
}

.progress-value {
    font-weight: 600;
}
```

---

## PARTIE 16 : PRIMO ASSISTANT / WIZARD

**Fichier concerné :** `07-primo-assistant.html`, `styles.css`

### 16.1 : Wizard conteneur

**AVANT :**
```css
.wizard-container {
    background: white;
    padding: 30px;
    border-radius: 8px;
}
```

**APRÈS :**
```css
.wizard-container {
    background: white;
    padding: 30px;
    border-radius: 12px;                          /* Au lieu de 8px */
    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.15); /* Normal */
}
```

**Changements :**
- Border-radius : 12px (harmonisé conteneurs)
- Box-shadow : Niveau Normal

### 16.2 : Étapes wizard

**AVANT :**
```css
.wizard-step {
    padding: 15px;
    border-radius: 8px;
    background: #f5f5f5;
}
```

**APRÈS :**
```css
.wizard-step {
    padding: 15px;
    border-radius: 12px;                          /* Au lieu de 8px */
    background: white;
    border: 2px solid #e8f2fd;
    transition: all 0.2s ease;
}

.wizard-step.active {
    background: #e8f2fd;
    border-color: #032e5c;
}

.wizard-step.completed {
    background: #f0fdf4;
    border-color: #22c55e;
}

.wizard-step.completed::before {
    content: "✓";
    color: #22c55e;
    font-weight: bold;
    margin-right: 8px;
}
```

**Changements :**
- Border-radius : 12px (harmonisé)
- États visuels clairs : active/completed

### 16.3 : Indicateurs d'étapes

**APRÈS :**
```css
.wizard-progress {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    position: relative;
}

.wizard-progress-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
}

.wizard-progress-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e8f2fd;
    color: #032e5c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: 8px;
    transition: all 0.2s ease;
}

.wizard-progress-item.active .wizard-progress-number {
    background: #032e5c;
    color: white;
}

.wizard-progress-item.completed .wizard-progress-number {
    background: #22c55e;
    color: white;
}

.wizard-progress-label {
    font-size: 0.85rem;
    color: #6b7280;
    text-align: center;
}

.wizard-progress-item.active .wizard-progress-label,
.wizard-progress-item.completed .wizard-progress-label {
    color: #032e5c;
    font-weight: 600;
}
```

### 16.4 : Boutons wizard

**AVANT :**
```css
.wizard-btn {
    padding: 8px 16px;
}
```

**APRÈS :**
```css
.wizard-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e8f2fd;
}

.wizard-btn {
    padding: 10px 15px;                          /* Harmonisé boutons */
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.2s ease;
}

.wizard-btn-prev {
    background: white;
    border: 1px solid #e0e0e0;
    color: #6b7280;
}

.wizard-btn-prev:hover {
    background: #f5f5f5;
    border-color: #032e5c;
    color: #032e5c;
}

.wizard-btn-next {
    background: #032e5c;
    border: none;
    color: white;
}

.wizard-btn-next:hover {
    background: #054a95;
    transform: translateY(-1px);
}
```

**Justification :**
- Border-radius 12px : Harmonisé conteneurs/étapes
- États visuels clairs : active/completed
- Boutons harmonisés : Cohérence totale

---

## CHECKLIST DE VALIDATION

### PARTIE 1 : 4 Pratiques de notation
- [ ] Variables SOM/STD/SPE/DEN ajoutées dans :root
- [ ] Variable `--pan-bleu` supprimée (obsolète)
- [ ] `.badge-pratique.som/std/spe/den` fonctionnent
- [ ] `.badge-pratique-compact.som/std/spe/den` fonctionnent
- [ ] `.bulle.som/std/spe/den` affichent bulles correctes
- [ ] HTML : `class="badge-pratique pan"` remplacé par `std`
- [ ] 4 couleurs distinctes : Orange/Bleu/Vert/Violet

### PARTIE 2 : Badges Tétris
- [ ] 7 familles : padding 3px 8px, font 0.75rem, radius 5px
- [ ] Badges internes : padding 2px 6px, font 0.7rem, radius 3px
- [ ] Hover states ajoutés partout

### PARTIE 3 : Badges matériel péda
- [ ] Padding : 6px 15px (au lieu de 8px 20px)
- [ ] Border-radius : 20px (au lieu de 25px)
- [ ] Font-size : 0.85rem (au lieu de 0.9rem)

### PARTIE 4 : Gradients
- [ ] En-tête : gradient conservé + radius 0 0 12px 12px
- [ ] En-tête : box-shadow prononcé ajouté
- [ ] Fond page : gradient conservé (déjà bon)

### PARTIE 5 : Box-shadow
- [ ] Variables 5 niveaux ajoutées dans :root
- [ ] Sections/items : shadow-subtil
- [ ] Cartes/sidebars : shadow-normal
- [ ] En-tête/hover : shadow-prononce
- [ ] Modaux : shadow-fort
- [ ] Panneaux/toggles : shadow-inset

### PARTIE 6 : Border-radius
- [ ] Conteneurs : 12px (harmonisé toggles)
- [ ] En-tête : 0 0 12px 12px (coins bas)
- [ ] Boutons/inputs/alertes : 6px
- [ ] Pills : 20px
- [ ] Badges Tétris : 5px

### PARTIE 7 : Sidebars / Bibliothèques
- [ ] Toutes sidebars : fond blanc + shadow-normal + radius 12px
- [ ] Bibliothèques : fond blanc, 15px padding, radius 12px, border 2px
- [ ] Hover states ajoutés

### PARTIE 8 : Boutons
- [ ] Tous boutons : padding 10px 15px uniforme
- [ ] Border-radius : 6px

### PARTIE 9 : Variables CSS
- [ ] Toutes variables ajoutées dans :root
- [ ] Utilisées dans les styles (var(--shadow-normal), etc.)

### PARTIE 10 : Modals
- [ ] Modal content : border-radius 12px
- [ ] Modal content : box-shadow Fort
- [ ] Overlay : couleur bleu rgba(3, 46, 92, 0.4)
- [ ] Overlay : backdrop-filter blur

### PARTIE 11 : Alertes
- [ ] Alertes : border-radius 6px
- [ ] Alertes : box-shadow Subtil
- [ ] 4 types : info/success/warning/danger
- [ ] Color-mix 9% appliqué

### PARTIE 12 : Navigation
- [ ] Barre navigation : border-radius 12px
- [ ] Barre navigation : box-shadow Normal
- [ ] Items : padding 10px 15px
- [ ] Hover et active states

### PARTIE 13 : Formulaires
- [ ] Inputs/textarea/select : border-radius 6px
- [ ] Focus ring avec box-shadow
- [ ] Labels : font-weight 600, couleur #032e5c
- [ ] Support required

### PARTIE 14 : Tableaux
- [ ] Table container : border-radius 12px
- [ ] Table container : box-shadow Normal
- [ ] Headers : background bleu pâle
- [ ] Rows hover : bleu très pâle

### PARTIE 15 : Barres de progression
- [ ] Container : background bleu pâle
- [ ] Container : box-shadow inset
- [ ] Fill : gradients 135deg
- [ ] 4 variantes : default/primary/warning/danger

### PARTIE 16 : Primo Assistant / Wizard
- [ ] Wizard container : border-radius 12px
- [ ] Wizard steps : border-radius 12px
- [ ] États : pending/active/completed
- [ ] Boutons : padding 10px 15px, radius 6px

---

## TABLEAU RÉCAPITULATIF (16 COMPOSANTS)

| # | Composant | AVANT | APRÈS | Priorité |
|---|-----------|-------|-------|----------|
| 1 | **Pratiques** | SOM/PAN/SPEC (3) | SOM/STD/SPE/DEN (4) | Haute |
| 2 | **Badges Tétris** | Variable | 3px 8px, 0.75rem, 5px | Haute |
| 3 | **Badges matériel** | 8px 20px, 0.9rem, 25px | 6px 15px, 0.85rem, 20px | Moyenne |
| 4 | **Gradients** | Gradient seul | Gradient + shadow prononcé | Moyenne |
| 5 | **Box-shadow** | Incohérent | 5 niveaux normalisés | Haute |
| 6 | **Border-radius** | 8px partout | 5/6/12/20px système | Haute |
| 7 | **Sidebars** | Bleu #e8f2fd | Blanc + shadow | Moyenne |
| 8 | **Boutons** | Variable | 10px 15px uniforme | Moyenne |
| 9 | **Variables CSS** | Partiel | Système complet | Haute |
| 10 | **Modals** | radius 8px, shadow noir | radius 12px, shadow Fort bleu | Critique |
| 11 | **Alertes** | radius 8px | radius 6px, color-mix 9% | Critique |
| 12 | **Navigation** | radius 8px | radius 12px, shadow Normal | Importante |
| 13 | **Formulaires** | radius 4px | radius 6px, focus ring | Importante |
| 14 | **Tableaux** | radius 8px, gris | radius 12px, bleu pâle | Importante |
| 15 | **Barres progression** | Couleur plate | Gradients 135deg | Moyenne |
| 16 | **Primo/Wizard** | radius 8px | radius 12px, états visuels | Moyenne |

---

## SYSTÈME DE RÉFÉRENCE RAPIDE

### Border-radius (4 niveaux)
```css
--radius-petit: 5px;    /* Badges Tétris */
--radius-moyen: 6px;    /* Boutons, inputs, alertes */
--radius-grand: 12px;   /* Conteneurs, modaux, cartes */
--radius-pill: 20px;    /* Pills badges pratique */
```

### Box-shadow (5 niveaux)
```css
--shadow-subtil: 0 1px 4px rgba(3, 46, 92, 0.1);      /* Sections, items, alertes */
--shadow-normal: 0 2px 8px rgba(3, 46, 92, 0.15);     /* Cartes, sidebars, tableaux */
--shadow-prononce: 0 4px 12px rgba(3, 46, 92, 0.25);  /* En-tête, hover */
--shadow-fort: 0 8px 24px rgba(3, 46, 92, 0.3);       /* Modaux */
--shadow-inset: inset 0 1px 3px rgba(3, 46, 92, 0.08); /* Inputs, panneaux, barres */
```

### Padding (3 échelles Tétris)
```css
/* Compact */
--padding-compact: 3px 8px;         /* Badges Tétris */
--padding-compact-pill: 3px 10px;   /* Badges pratique */

/* Moyen */
--padding-moyen: 10px 15px;         /* Boutons, nav items */
--padding-moyen-pill: 6px 15px;     /* Badges matériel péda */

/* Large */
--padding-large: 15px;              /* Sidebars, conteneurs */
```

### Gradients (direction unique)
```css
/* TOUJOURS 135deg, TOUJOURS clair → foncé */
linear-gradient(135deg, [couleur-claire] 0%, [couleur-foncée] 100%)
```

---

## NOTES POUR CLAUDE CODE

### Ordre d'implémentation recommandé

1. **Variables CSS** (toutes d'un coup dans :root)
2. **4 Pratiques** (SOM/STD/SPE/DEN + bulles)
3. **Badges Tétris** (7 familles)
4. **Badges matériel péda**
5. **Gradients + box-shadow** (en-tête)
6. **Border-radius 12px** (tous conteneurs)
7. **Sidebars / Bibliothèques** (fond blanc)
8. **Boutons** (padding unifié)
9. **Modals** (CRITIQUE)
10. **Alertes** (CRITIQUE)
11. **Navigation**
12. **Formulaires**
13. **Tableaux**
14. **Barres de progression**
15. **Primo / Wizard**

### Fichiers à modifier

- `index.html` (variables :root, bulles)
- `styles.css` (tous les styles)
- Fichiers JS (remplacer "pan" par "std" dans le code)

### Tests à effectuer

1. **4 pratiques** : Badges SOM/STD/SPE/DEN s'affichent correctement
2. **Bulles** : 4 bulles colorées dans en-tête
3. **Gradients** : En-tête avec coins arrondis bas + ombre
4. **Box-shadow** : Cartes avec ombre normale, hover prononcé
5. **Border-radius** : Tous conteneurs 12px (harmonisé toggles)
6. **Sidebars** : Fond blanc, contraste optimal avec fond page
7. **Modals** : Overlay bleu, border-radius 12px, shadow fort
8. **Alertes** : 4 types avec color-mix 9%
9. **Navigation** : Items avec hover et active states
10. **Formulaires** : Focus ring visible
11. **Tableaux** : Headers bleu pâle, hover bleu très pâle
12. **Barres** : Gradients 135deg
13. **Wizard** : États visuels (pending/active/completed)
14. **Hover** : Effects fonctionnent partout

---

## RÉSUMÉ V5

**Ce qui est nouveau par rapport à V4 :**
- PARTIE 10 : Modals (CRITIQUE)
- PARTIE 11 : Alertes (CRITIQUE)
- PARTIE 12 : Navigation
- PARTIE 13 : Formulaires
- PARTIE 14 : Tableaux
- PARTIE 15 : Barres de progression
- PARTIE 16 : Primo Assistant / Wizard

**Couverture :**
- V4 : 9/16 modules = 56%
- V5 : 16/16 modules = **100%**

**Impact :** Cohérence visuelle totale sur tous les composants UI.

---

**FIN DE L'AUDIT V5 - PRÊT POUR IMPLÉMENTATION**

**Date :** 2 janvier 2026
**Version :** 5.0
