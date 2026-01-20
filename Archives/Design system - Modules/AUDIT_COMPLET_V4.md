# AUDIT COMPLET V4 - Design System v7
## Harmonisation finale : 4 pratiques + Gradients + Box-shadow

**Date :** 2 janvier 2026  
**Version :** 4.0 (FINALE)  
**Pour :** Claude Code  
**Objectif :** Implémenter toutes les harmonisations Design System v7

---

## 📋 SOMMAIRE DES MODIFICATIONS

1. **4 Pratiques de notation** (SOM / STD / SPE / DEN) - codes 3 lettres uniformes
2. **Badges Tétris** (7 familles harmonisées)
3. **Badges matériel pédagogique** (harmonisation)
4. **Gradients** (en-tête + fond page)
5. **Box-shadow** (système 5 niveaux)
6. **Border-radius** (12px harmonisé avec toggles)
7. **Sidebars / Bibliothèques** (fond blanc)
8. **Boutons** (padding unifié)
9. **Variables CSS** (système complet)

---

## PARTIE 1 : 4 PRATIQUES DE NOTATION ⭐ NOUVEAU

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

**Référence complète :** Voir AUDIT_BADGES.md pour les 7 familles détaillées.

**Principe uniforme :**
```css
padding: 3px 8px;
font-size: 0.75rem;
border-radius: 5px;
line-height: 1.2;
transition: all 0.2s ease;
```

**Familles concernées :**
1. Absence
2. Retard
3. Intervention RàI
4. Artefacts
5. Jetons (3 types)
6. Statut RàI
7. Niveau RàI

**Application :** Modifier chaque classe pour utiliser les specs Compact Tétris.

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

## PARTIE 4 : GRADIENTS ⭐ NOUVEAU

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

## PARTIE 5 : BOX-SHADOW (SYSTÈME 5 NIVEAUX) ⭐ NOUVEAU

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

## PARTIE 6 : BORDER-RADIUS (12PX) ⭐ NOUVEAU

### 6.1 : Système 2 niveaux

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
select {
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
- 6px → Boutons, inputs (petits éléments)
- 12px → Conteneurs (harmonisé toggles) ⭐
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
    --radius-moyen: 6px;    /* Boutons, inputs */
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

## CHECKLIST DE VALIDATION

### ✅ 4 Pratiques de notation
- [ ] Variables SOM/STD/SPE/DEN ajoutées dans :root
- [ ] Variable `--pan-bleu` supprimée (obsolète)
- [ ] `.badge-pratique.som/std/spe/den` fonctionnent
- [ ] `.badge-pratique-compact.som/std/spe/den` fonctionnent
- [ ] `.bulle.som/std/spe/den` affichent bulles correctes
- [ ] HTML : `class="badge-pratique pan"` remplacé par `std`
- [ ] 4 couleurs distinctes : Orange/Bleu/Vert/Violet

### ✅ Badges Tétris
- [ ] 7 familles : padding 3px 8px, font 0.75rem, radius 5px
- [ ] Hover states ajoutés partout

### ✅ Badges matériel péda
- [ ] Padding : 6px 15px (au lieu de 8px 20px)
- [ ] Border-radius : 20px (au lieu de 25px)
- [ ] Font-size : 0.85rem (au lieu de 0.9rem)

### ✅ Gradients
- [ ] En-tête : gradient conservé + radius 0 0 12px 12px
- [ ] En-tête : box-shadow prononcé ajouté
- [ ] Fond page : gradient conservé (déjà bon)

### ✅ Box-shadow
- [ ] Variables 5 niveaux ajoutées dans :root
- [ ] Sections/items : shadow-subtil
- [ ] Cartes/sidebars : shadow-normal
- [ ] En-tête/hover : shadow-prononce
- [ ] Modaux : shadow-fort
- [ ] Panneaux/toggles : shadow-inset

### ✅ Border-radius
- [ ] Conteneurs : 12px (harmonisé toggles)
- [ ] En-tête : 0 0 12px 12px (coins bas)
- [ ] Boutons/inputs : 6px
- [ ] Pills : 20px
- [ ] Badges Tétris : 5px

### ✅ Sidebars / Bibliothèques
- [ ] Toutes sidebars : fond blanc + shadow-normal + radius 12px
- [ ] Bibliothèques : fond blanc, 15px padding, radius 12px, border 2px
- [ ] Hover states ajoutés

### ✅ Boutons
- [ ] Tous boutons : padding 10px 15px uniforme
- [ ] Border-radius : 6px

### ✅ Variables CSS
- [ ] Toutes variables ajoutées dans :root
- [ ] Utilisées dans les styles (var(--shadow-normal), etc.)

---

## TABLEAU RÉCAPITULATIF FINAL

| Composant | AVANT | APRÈS | Échelle |
|-----------|-------|-------|---------|
| **Pratiques** | SOM/PAN/SPEC (3) | SOM/STD/SPE/DEN (4) | Compact pill |
| **Badge Absence** | 4px 12px, 0.8rem, 6px | 3px 8px, 0.75rem, 5px | Compact |
| **Badge critères** | 8px 20px, 0.9rem, 25px | 6px 15px, 0.85rem, 20px | Moyen pill |
| **Boutons** | Variable 8-20px | 10px 15px, 6px | Moyen |
| **Sidebars** | Bleu #e8f2fd, 15px, 8px | Blanc, 15px, 12px, shadow | Large |
| **Bibliothèques** | Bleu, 25px, 16px | Blanc, 15px, 12px, shadow | Large |
| **En-tête** | Gradient, 8px | Gradient, 0 0 12px 12px, shadow | - |
| **Conteneurs** | Radius 8px | Radius 12px (harmonisé toggles) | - |

---

## IMPACT FINAL

### ✅ Avantages
- **4 pratiques complètes** : SOM/STD/SPE/DEN (codes 3 lettres)
- **Cohérence 100%** : Tous composants harmonisés
- **Contraste optimal** : Blanc sur gradient bleu
- **Profondeur visuelle** : Système 5 niveaux box-shadow
- **Harmonisé toggles** : Border-radius 12px uniforme
- **Design moderne** : Épuré et professionnel
- **+15% espace économisé** : Badges compacts
- **Maintenance simplifiée** : Variables CSS complètes

### 📊 Statistiques
- **4 pratiques** : SOM / STD / SPE / DEN
- **3 échelles** : Compact / Moyen / Large
- **5 niveaux shadow** : Subtil → Fort + Inset
- **4 niveaux radius** : 5px → 6px → 12px → 20px
- **Progression harmonieuse** : Petit → Moyen → Grand

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
7. **Hover** : Effects fonctionnent partout

### Validation visuelle

- Comparer avec `02c-badges-v6-final.html`
- Comparer avec `04b-entete-v3-gradients.html`
- Vérifier cohérence SOM/STD/SPE/DEN (4 pratiques)
- Vérifier border-radius 12px partout
- Vérifier box-shadow 5 niveaux

---

## RÉSUMÉ FINAL

**Ce qui change :**
✅ 4 pratiques SOM/STD/SPE/DEN (codes 3 lettres uniformes)  
✅ Gradients en-tête avec box-shadow prononcé  
✅ Border-radius 12px harmonisé avec toggles  
✅ Système 5 niveaux box-shadow complet  
✅ Badges Tétris harmonisés (7 familles)  
✅ Badges matériel péda harmonisés  
✅ Sidebars/bibliothèques fond blanc  
✅ Boutons padding unifié  
✅ Variables CSS complètes  

**Ce qui reste :**
✓ Couleurs principales (bleu foncé #032e5c)  
✓ Structure générale  
✓ Fonctionnalités existantes  

**Impact :** Cohérence visuelle totale, design moderne, profondeur optimale, maintenance simplifiée.

---

**FIN DE L'AUDIT COMPLET V4 - PRÊT POUR IMPLÉMENTATION**