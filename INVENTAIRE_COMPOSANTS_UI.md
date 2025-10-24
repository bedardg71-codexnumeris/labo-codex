# INVENTAIRE COMPLET DES COMPOSANTS UI
## Système de monitorage pédagogique - Beta 0.71

**Date**: 24 octobre 2025
**Fichier analysé**: `index 71 (refonte des modules).html`
**Objectif**: Harmonisation du design system avec nomenclature française

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Section: Tableau de bord](#section-tableau-de-bord)
3. [Section: Présences](#section-présences)
4. [Section: Évaluations](#section-évaluations)
5. [Section: Réglages](#section-réglages)
6. [Composants modaux](#composants-modaux)
7. [Problèmes identifiés](#problèmes-identifiés)

---

## VUE D'ENSEMBLE

### Structure de navigation

**4 sections principales** avec **19 sous-sections au total**:

| Section | Sous-sections | Nombre |
|---------|--------------|--------|
| **Tableau de bord** | Aperçu, Liste des individus, Profil | 3 |
| **Présences** | Aperçu, Vue calendaire, Saisie | 3 |
| **Évaluations** | Aperçu, Liste des évaluations, Procéder à une évaluation | 3 |
| **Réglages** | Aperçu, Cours, Trimestre, Horaire, Groupe, Pratique de notation, Productions, Grilles de critères, Échelle de performance, Rétroactions, Import/Export | 11 |

### Composants du Design System utilisés

| Type de composant | Variantes | Fichier source |
|-------------------|-----------|----------------|
| **Boutons** | 8 types | styles.css, inline |
| **Cartes** | 3 types | styles.css |
| **Badges** | 12+ types | styles.css, inline |
| **Tableaux** | 1 type standard | styles.css |
| **Formulaires** | 3 types | styles.css |
| **Navigation** | 2 niveaux | styles.css |
| **Modaux** | 5+ instances | inline majoritairement |

---

## SECTION: TABLEAU DE BORD

### TABLEAU-DE-BORD → APERÇU

**Localisation**: Lines 901-950 (généré dynamiquement par `tableau-bord-apercu.js`)

#### Composants utilisés

**1. Cartes statistiques**
- **Classe**: `.conteneur-statistiques`
  - Layout: Grid responsive `repeat(auto-fit, minmax(280px, 1fr))`
  - Gap: 20px
- **Classe**: `.carte-statistique`
  - Background: `var(--bleu-pale)` (#e8f2fd)
  - Border: 1px solid `var(--bleu-leger)` (#6b85b3)
  - Padding: 20px
  - Shadow: `0 3px 6px rgba(3, 46, 92, 0.1)`
  - **Sous-composants**:
    - `.valeur` - Font-size: 2.5rem, bold, color: `var(--bleu-principal)`
    - `.label` - Font-size: 0.9rem, color: `var(--bleu-leger)`, uppercase

**2. Cartes d'items étudiants**
- **Classe**: `.item-carte`
  - Background: white
  - Border: 1px solid `var(--bleu-pale)`
  - Border-radius: 8px
  - Padding: 15px
  - Transition: transform, shadow
  - Hover: `transform: translateY(-2px)`, shadow augmentée

**3. Badges de statut**
- **Classe**: `.statut-badge`
  - Padding: 4px 10px
  - Border-radius: 12px
  - Font-size: 0.8rem
  - Font-weight: 600
  - **Variantes**:
    - `.statut-actif` - Green (#28a745)
    - `.statut-inactif` - Gray (#6c757d)

**4. Indicateurs de risque**
- **Classes**: 7 niveaux
  - `.risque-nul` - `#d4edda` (vert très pâle)
  - `.risque-minimal` - `#28a745` (vert)
  - `.risque-faible` - `#90EE90` (vert clair)
  - `.risque-modere` - `#ffc107` (ambre)
  - `.risque-eleve` - `#fd7e14` (orange)
  - `.risque-tres-eleve` - `#dc3545` (rouge)
  - `.risque-critique` - `#721c24` (rouge foncé)

**5. Boutons d'action**
- **Classe**: `.btn-action`
  - Padding: 6px 12px
  - Font-size: 0.85rem
  - Border-radius: 4px
  - **Variantes**:
    - `.btn-principal` - Background: `var(--btn-principal)` (#065dbb)
    - `.btn-secondaire` - Background: `var(--btn-annuler)` (#7a5a1a)

**État du design**: ✅ **Conforme** - Utilise les classes du design system

---

### TABLEAU-DE-BORD → LISTE DES INDIVIDUS

**Localisation**: Généré dynamiquement

#### Composants utilisés

**1. Tableau standard**
- **Classe**: `.tableau`
  - Width: 100%
  - Border-collapse: collapse
  - **Header (th)**:
    - Background: `var(--bleu-pale)` (#e8f2fd)
    - Padding: 12px
    - Font-weight: 600
    - Color: `var(--bleu-principal)` (#032e5c)
    - Border-bottom: 2px solid `var(--bleu-leger)`
  - **Rows (td)**:
    - Padding: 10px 12px
    - Border-bottom: 1px solid `var(--bleu-tres-pale)`
  - **Hover**:
    - Background: `var(--bleu-tres-pale)` (#f0f8ff)

**2. Boutons d'action dans tableau**
- **Classes**: `.btn-modifier`, `.btn-supprimer`
- **Inline styles**: ⚠️ Padding personnalisé `6px 10px` sur certains boutons

**État du design**: ⚠️ **Quelques inline styles** - Majoritairement conforme

---

### TABLEAU-DE-BORD → PROFIL

**Localisation**: Généré par `profil-etudiant.js`

#### Composants utilisés

**1. Layout 2 colonnes**
- **Classe**: `.profil-conteneur`
  - Display: flex
  - Gap: 20px

**2. Sidebar de navigation**
- **Classe**: `.profil-sidebar`
  - Width: 280px
  - Flex-shrink: 0
  - Background: `var(--bleu-tres-pale)`
  - Padding: 20px
  - Border-radius: 8px

**3. Navigation étudiant**
- **Boutons**: Précédent/Suivant
  - **Classe**: `.btn-navigation-etudiant`
  - Display: flex, justify-content: center, gap: 10px
  - **États**:
    - `:disabled` - Opacity: 0.5, cursor: not-allowed
    - `:hover:not(:disabled)` - Background hover approprié

**4. Sections de contenu**
- **Cartes**: `.carte` standard
- **Toggles détails**: `.toggle-details`
  - Cursor: pointer
  - Color: `var(--bleu-moyen)`
  - Font-size: 0.9rem

**5. Échelle de risque visuelle**
- **Classe**: `.echelle-risque-visuelle`
  - Display: flex
  - Height: 40px
  - Border-radius: 20px
  - Overflow: hidden
  - **Segments**: 6 niveaux avec gradient
  - **Indicateur**: Position absolute avec animation

**6. Grilles de performance SRPNF**
- **Layout**: Grid 2 colonnes
- **Classes**: `.critere-item`, `.barre-progression`
- **Couleurs**: Basées sur score (vert/jaune/rouge)

**État du design**: ✅ **Très conforme** - Refonte récente (24 octobre)

---

## SECTION: PRÉSENCES

### PRÉSENCES → APERÇU

**Localisation**: Lines 901-920 (placeholder)

#### Composants utilisés

**1. Carte d'information**
- **Classe**: `.carte`
- **Contenu**: Badges informatifs uniquement

**2. Badges**
- **Classe**: `.badge-info`
  - Background: `var(--bleu-pale)` (#e8f2fd)
  - Color: `var(--bleu-principal)` (#032e5c)
  - Padding: 4px 12px
  - Border-radius: 12px
  - Font-size: 0.85rem

**État du design**: ✅ **Conforme** - Section stub

---

### PRÉSENCES → VUE CALENDAIRE

**Localisation**: Généré par `calendrier-vue.js`

#### Composants utilisés

**1. Grille calendrier**
- **Classe**: `.calendrier-grille`
  - Display: grid
  - Grid-template-columns: repeat(7, 1fr)
  - Gap: 2px

**2. Cellules de jour**
- **Classes par type**:
  - `.jour-cours-reel` - Background: `var(--jour-cours-reel-bg)` (#e3f2fd)
  - `.jour-reprise` - Background: `var(--reprise-bg)` (#fff3e0)
  - `.jour-conge` - Background: `var(--conge-bg)` (#ffebee)
  - `.jour-planification` - Background: `var(--planification-bg)` (#f3e5f5)
  - `.jour-examens` - Background: `var(--examens-bg)` (#fce4ec)
  - `.jour-weekend` - Background: `var(--weekend-bg)` (#f5f5f5)

**3. En-têtes de jour**
- **Classe**: `.calendrier-header-jour`
  - Font-weight: bold
  - Text-align: center
  - Background: `var(--bleu-principal)`
  - Color: white

**État du design**: ✅ **Conforme** - Utilise variables CSS

---

### PRÉSENCES → SAISIE

**Localisation**: Lines 921-1045

#### Composants utilisés

**1. Alerte de configuration**
- **ID**: `#alerteFormatHoraire`
- **⚠️ INLINE STYLES**:
  ```css
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  ```
- **Problème**: Couleurs hardcodées, pas de classe réutilisable

**2. En-tête date/séance**
- **ID**: `#enteteDateSeance`
- **⚠️ INLINE STYLES** pour états:
  - `.etat-erreur` - Yellow (#fff3cd)
  - `.etat-valide` - Green (#d4edda)
  - `.etat-verrouille` - Gray (#e9ecef)
- **Problème**: Classes définies inline, devraient être dans CSS global

**3. Grid de contrôles**
- **⚠️ INLINE STYLE**:
  ```css
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  ```
- **Problème**: Layout inline, pas de classe réutilisable

**4. Formulaires**
- **Classes**: `.groupe-form`, `.controle-form`
- **État**: ✅ Conforme
- **Labels**: ⚠️ Styles inline `display: block; margin-bottom: 5px; font-weight: 500;`

**5. Boutons de navigation date**
- **Classe**: `.btn-secondaire`
- **⚠️ INLINE STYLES**: `padding: 8px 12px; flex-shrink: 0;`

**6. Tableau de saisie**
- **Classe**: `.tableau` - ✅ Conforme
- **Cellules input**:
  - **Classes par état**:
    - `.saisie-absence` - Background: #f8d7da (rouge pâle)
    - `.saisie-retard` - Background: #fff3cd (jaune pâle)
    - `.saisie-present` - Background: #d4edda (vert pâle)
    - `.saisie-vide` - Background: white
  - **État**: ✅ Classes CSS définies

**7. Boutons d'action en-tête tableau**
- **Boutons**: "Tous 2h", "↻ Réinitialiser"
- **Classes**: `.btn-principal`, `.btn-secondaire`
- **⚠️ INLINE STYLES**: `padding: 4px 12px; font-size: 0.85rem;`

**8. Boutons d'action finaux**
- **Classes**: `.btn-confirmer`, `.btn-annuler`
- **État**: ✅ Variables CSS utilisées

**État du design**: ⚠️ **Mixte** - Beaucoup d'inline styles, classes CSS présentes mais incomplètes

---

## SECTION: ÉVALUATIONS

### ÉVALUATIONS → APERÇU

**Localisation**: Stub (similaire à Présences → Aperçu)

**État du design**: ✅ **Conforme**

---

### ÉVALUATIONS → LISTE DES ÉVALUATIONS

**Localisation**: Lines 1052-1131

#### Composants utilisés

**1. Cartes statistiques**
- **Classe**: `.conteneur-statistiques` + `.carte-statistique`
- **État**: ✅ Conforme (même que Tableau de bord)

**2. Filtres**
- **Grid layout**: ⚠️ INLINE
  ```css
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 0.5fr;
  gap: 15px;
  ```
- **Selects**: `.controle-form` ✅
- **Bouton reset**: `.btn-principal` avec inline `padding: 8px 12px;` ⚠️

**3. Accordéon d'évaluations**
- **ID**: `#conteneur-evaluations-accordeon`
- **Généré dynamiquement** avec classes:
  - `.etudiant-evaluation-carte` ✅
  - `.etudiant-header` ✅
  - `.etudiant-details` ✅
  - `.toggle-icon` ✅
  - `.badge-note` ✅ (5 variantes: maitrise, intermediaire, developpement, base, observation)
  - `.badge-statut` ✅

**4. ⚠️ PROBLÈME MAJEUR: Badges vs Boutons**
D'après la capture d'écran fournie, cette section présente:
- **Confusion visuelle**: Badges ressemblent à des boutons
- **Couleurs non-standard**: Orange (#ff9800) pas dans palette
- **États disabled**: Incohérents (parfois gris, parfois pas)
- **Tailles de police**: Variables dans même tableau

**État du design**: ⚠️ **PROBLÉMATIQUE** - C'est l'exemple cacophonique fourni par l'utilisateur

---

### ÉVALUATIONS → PROCÉDER À UNE ÉVALUATION (INDIVIDUELLES)

**Localisation**: Lines 1137-1338

#### Composants utilisés

**1. Layout principal**
- **⚠️ INLINE STYLE**:
  ```css
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 25px;
  ```

**2. Boutons de gestion**
- **Classes**: `.btn-modifier`, `.btn-secondaire`, `.btn-principal`
- **⚠️ INLINE STYLES**: `padding: 6px 10px; font-size: 0.8rem; flex: 1;`
- **Problème**: Surcharge systématique du padding

**3. Séparateur horizontal**
- **⚠️ INLINE STYLE**:
  ```css
  border: none;
  border-top: 1px solid #ddd;
  ```
- **Problème**: Couleur hardcodée #ddd

**4. Indicateur de verrouillage**
- **ID**: `#indicateurVerrouillageEval`
- **⚠️ INLINE STYLES**: `color: #999;` sur emoji
- **Problème**: Couleur hardcodée

**5. Labels de formulaire**
- **⚠️ INLINE STYLES** répétés:
  ```css
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  ```

**6. Boîte note finale**
- **ID**: `#noteFinale1`
- **⚠️ TOTALEMENT INLINE**:
  ```css
  margin-top: 20px;
  padding: 12px;
  background: var(--bleu-tres-pale);
  border-radius: 6px;
  text-align: center;
  ```
- **Utilise variables CSS non définies**: `var(--gris-fonce)`, `var(--gris-tres-pale)`

**7. Zone de critères**
- **⚠️ INLINE STYLES**:
  ```css
  padding: 15px;
  background: var(--gris-tres-pale);
  border-radius: 8px;
  ```

**8. Checkboxes d'affichage**
- **⚠️ INLINE GRID**:
  ```css
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  ```

**9. Textarea rétroaction**
- **Classe**: `.controle-form` ✅
- **⚠️ MAIS avec inline styles massifs**:
  ```css
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #ddd;  /* ⚠️ HARDCODED */
  font-size: 0.85rem;
  line-height: 1.5;
  ```

**État du design**: ❌ **NON CONFORME** - Majoritairement inline, variables CSS manquantes

---

## COMPOSANTS MODAUX

### MODAL 1: Banque d'évaluations

**Localisation**: Lines 1345-1401

#### Problèmes identifiés

**1. Overlay**
- **⚠️ TOTALEMENT INLINE**:
  ```css
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  ```
- **EXISTE dans CSS**: `.modal-overlay` (lines 1112-1133 de styles.css)
- **Problème**: N'utilise pas la classe existante

**2. Conteneur modal**
- **⚠️ INLINE**:
  ```css
  max-width: 1200px;
  margin: 50px auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  ```
- **EXISTE dans CSS**: `.modal-contenu`
- **Problème**: N'utilise pas la classe existante

**3. Bouton fermeture**
- **⚠️ INLINE**:
  ```css
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;  /* ⚠️ HARDCODED */
  ```
- **EXISTE dans CSS**: `.modal-fermer`
- **Problème**: N'utilise pas la classe existante

**4. Grid de filtres**
- **⚠️ INLINE**:
  ```css
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  background: var(--gris-tres-pale);  /* ⚠️ VARIABLE NON DÉFINIE */
  ```

**État**: ❌ **NON CONFORME** - Ignore classes CSS existantes

---

### MODAL 2: Jeton de reprise

**Localisation**: Lines 1404-1468

#### Problèmes identifiés

**1. Structure**: Même problèmes que Modal 1 (overlay, conteneur inline)

**2. Alerte orange**
- **⚠️ COULEURS HARDCODÉES**:
  ```css
  background: #fff3e0;  /* Orange pâle */
  border-left: 4px solid #ff9800;  /* Orange */
  color: #e65100;  /* Orange foncé */
  ```
- **Problème**: Palette orange non standardisée
  - Design system: `--orange-accent: #ff6b35`
  - Modal: `#ff9800` (différent!)

**3. Bouton "Appliquer le jeton"**
- **⚠️ COULEUR HARDCODÉE**:
  ```css
  background: #9c27b0;  /* Violet/Mauve */
  ```
- **Problème**: Couleur totalement hors palette (pas de violet dans design system)

**État**: ❌ **NON CONFORME** - Couleurs anarchiques

---

### MODAL 3: Réparation des évaluations

**Localisation**: Lines 1471-1523

#### Problèmes identifiés

**1. Multiples alertes colorées hardcodées**:

**Alerte orange**:
```css
background: #fff3e0;
border-left: 4px solid #ff9800;
```

**Alerte bleue**:
```css
background: #e3f2fd;
border-left: 4px solid #2196F3;  /* ⚠️ Bleu Material Design, pas palette projet */
```

**Alerte verte**:
```css
background: #f1f8e9;
border-left: 4px solid #8bc34a;  /* ⚠️ Vert Material Design, pas palette projet */
```

**Problème**:
- Palette Material Design (#2196F3, #8bc34a) incompatible avec palette bleue du projet
- Devrait utiliser variables CSS: `var(--bleu-principal)`, `var(--succes)`

**État**: ❌ **NON CONFORME** - Mélange de palettes

---

## SECTION: RÉGLAGES

**Note**: Section non analysée en détail dans cette phase (11 sous-sections)

**Analyse préliminaire**:
- Utilise majoritairement `.carte`, `.tableau`, `.btn-*`
- Quelques inline styles probables
- À documenter dans Phase 3

---

## PROBLÈMES IDENTIFIÉS

### 🔴 CRITIQUE: Couleurs hardcodées

| Couleur | Utilisations | Devrait être |
|---------|-------------|--------------|
| **#ddd** | Bordures (HR, textarea) | `var(--bordure-claire)` |
| **#666** | Textes secondaires, bouton fermer | `var(--gris-moyen)` |
| **#999** | Icône verrouillage | `var(--gris-clair)` |
| **#fff3e0** | Alertes orange | `var(--alerte-fond-attention)` |
| **#ff9800** | Bordures alertes orange | `var(--alerte-bordure-attention)` ⚠️ Conflit avec `--orange-accent: #ff6b35` |
| **#9c27b0** | Bouton violet | Hors palette - À définir ou remplacer |
| **#2196F3** | Alerte bleue (Material) | `var(--bleu-principal)` ou `var(--bleu-moyen)` |
| **#8bc34a** | Alerte verte (Material) | `var(--succes)` (#28a745) |
| **#e65100** | Texte alerte orange foncé | `var(--alerte-texte-attention)` |

### 🔴 CRITIQUE: Variables CSS manquantes

Variables utilisées mais **non définies** dans `:root`:
- `var(--gris-fonce)` - Utilisé pour titres, labels
- `var(--gris-tres-pale)` - Utilisé pour backgrounds
- `var(--gris-moyen)` - Implicite
- `var(--bordure-claire)` - Manquant

### ⚠️ MAJEUR: Surcharge inline systématique

**Boutons**: Presque tous ont padding/font-size inline
```html
<!-- ⚠️ MAUVAIS -->
<button class="btn btn-principal" style="padding: 6px 10px; font-size: 0.8rem;">

<!-- ✅ BON -->
<button class="btn btn-principal btn-compact">
```

**Solution**: Créer classes modificateurs:
- `.btn-compact` → `padding: 6px 10px; font-size: 0.85rem;`
- `.btn-large` → `padding: 12px 24px; font-size: 1rem;`

### ⚠️ MAJEUR: Layouts inline répétés

**Grids 2 colonnes**: Répété 5+ fois
```html
<!-- ⚠️ MAUVAIS -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">

<!-- ✅ BON -->
<div class="grille-2-colonnes">
```

**Grids 3+ colonnes**: Même problème

**Solution**: Créer classes utilitaires:
- `.grille-2-colonnes`
- `.grille-3-colonnes`
- `.grille-4-colonnes`
- `.grille-5-colonnes`

### ⚠️ MAJEUR: Modaux n'utilisent pas classes CSS

**Classes existantes ignorées**:
- `.modal-overlay` (définie ligne 1112 de styles.css)
- `.modal-contenu` (définie ligne 1113)
- `.modal-fermer` (définie ligne 1133)

**Solution**: Remplacer tous les styles inline des modaux par ces classes

### ⚠️ MAJEUR: Alertes non standardisées

**3 types d'alertes** avec couleurs hardcodées:
- Alerte attention (orange)
- Alerte information (bleue)
- Alerte succès (verte)

**Solution**: Créer classes:
- `.alerte-attention` (orange)
- `.alerte-information` (bleue)
- `.alerte-succes` (verte)
- `.alerte-erreur` (rouge) - anticipation

### 🟡 MINEUR: Confusion badges/boutons

**Problème visuel**: Dans liste évaluations, badges "Évalué" (vert) ressemblent à boutons "Déverrouiller" (orange)

**Solution**:
- Badges → Plus petits, sans hover, pas de cursor pointer
- Boutons → Padding standard, hover distinct, cursor pointer
- Revoir hiérarchie visuelle

### 🟡 MINEUR: Incohérence palette orange

**2 oranges différents**:
- Design system: `--orange-accent: #ff6b35`
- Alertes/modaux: `#ff9800` (Material Design)

**Solution**: Standardiser sur `#ff6b35` OU redéfinir palette

---

## STATISTIQUES

### Conformité par section

| Section | Sous-section | Conformité | Score |
|---------|-------------|-----------|-------|
| Tableau de bord | Aperçu | ✅ Conforme | 9/10 |
| Tableau de bord | Liste | ✅ Conforme | 8/10 |
| Tableau de bord | Profil | ✅ Très conforme | 10/10 |
| Présences | Aperçu | ✅ Conforme | 10/10 |
| Présences | Calendrier | ✅ Conforme | 9/10 |
| Présences | Saisie | ⚠️ Mixte | 6/10 |
| Évaluations | Aperçu | ✅ Conforme | 10/10 |
| Évaluations | Liste | ⚠️ Problématique | 5/10 |
| Évaluations | Individuelles | ❌ Non conforme | 3/10 |
| **Modaux** | Tous | ❌ Non conforme | 2/10 |

**Moyenne générale**: 7.2/10

### Composants à créer/standardiser

**18 nouvelles classes CSS recommandées**:

1. `.btn-compact` - Bouton petit format
2. `.btn-large` - Bouton grand format
3. `.grille-2-colonnes` - Layout 2 colonnes
4. `.grille-3-colonnes` - Layout 3 colonnes
5. `.grille-4-colonnes` - Layout 4 colonnes
6. `.grille-5-colonnes` - Layout 5 colonnes
7. `.alerte-attention` - Alerte orange
8. `.alerte-information` - Alerte bleue
9. `.alerte-succes` - Alerte verte
10. `.alerte-erreur` - Alerte rouge
11. `.separateur-horizontal` - HR stylisé
12. `.boite-note-finale` - Affichage note
13. `.zone-criteres` - Container critères
14. `.grille-checkboxes-5` - Grid 5 colonnes checkboxes
15. `.label-formulaire` - Label standardisé
16. `.conteneur-filtres` - Grid filtres
17. `.etat-erreur` - État erreur (existe inline)
18. `.etat-valide` - État valide (existe inline)

### Variables CSS à ajouter

**6 nouvelles variables**:

```css
:root {
    /* Couleurs grises manquantes */
    --gris-fonce: #333333;
    --gris-moyen: #666666;
    --gris-clair: #999999;
    --gris-tres-pale: #f9f9f9;

    /* Bordures */
    --bordure-claire: #dddddd;

    /* Alertes */
    --alerte-fond-attention: #fff3e0;
    --alerte-bordure-attention: #ff6b35;  /* Aligné avec --orange-accent */
    --alerte-texte-attention: #e65100;

    --alerte-fond-information: #e3f2fd;
    --alerte-bordure-information: var(--bleu-moyen);  /* Au lieu de #2196F3 */
    --alerte-texte-information: var(--bleu-principal);

    --alerte-fond-succes: #f1f8e9;
    --alerte-bordure-succes: var(--succes);  /* Au lieu de #8bc34a */
    --alerte-texte-succes: #155724;
}
```

---

## PROCHAINES ÉTAPES

**Phase 3**: Identifier incohérences spécifiques
**Phase 4**: Proposer corrections fichier par fichier
**Phase 5**: Appliquer corrections systématiquement

---

**Document généré le**: 24 octobre 2025
**Analysé par**: Claude Code + agents exploratoires
**Version**: 1.0
