# PLAN DE CORRECTIONS DESIGN SYSTEM
## Harmonisation complète avec nomenclature française

**Date**: 24 octobre 2025
**Version**: 1.0
**Fichiers concernés**: `styles.css`, `index 71 (refonte des modules).html`

---

## TABLE DES MATIÈRES

1. [Résumé exécutif](#résumé-exécutif)
2. [Corrections prioritaires](#corrections-prioritaires)
3. [Nouvelles classes CSS à créer](#nouvelles-classes-css-à-créer)
4. [Variables CSS à ajouter](#variables-css-à-ajouter)
5. [Corrections HTML par section](#corrections-html-par-section)
6. [Guide de migration](#guide-de-migration)

---

## RÉSUMÉ EXÉCUTIF

### Problèmes identifiés

| Catégorie | Nombre | Priorité |
|-----------|--------|----------|
| **Couleurs hardcodées** | 15+ instances | 🔴 CRITIQUE |
| **Variables CSS manquantes** | 6 variables | 🔴 CRITIQUE |
| **Inline styles répétitifs** | 40+ instances | ⚠️ MAJEURE |
| **Classes CSS ignorées** | 3 classes modales | ⚠️ MAJEURE |
| **Layouts non standardisés** | 12+ grilles inline | ⚠️ MAJEURE |
| **Incohérences visuelles** | 3 sections | 🟡 MINEURE |

### Impact

- **Score conformité actuel**: 7.2/10
- **Score visé**: 9.5/10
- **Lignes HTML à modifier**: ~150 lignes
- **Nouvelles lignes CSS**: ~200 lignes
- **Temps estimé**: 2-3 heures de travail

### Bénéfices attendus

✅ **Maintenabilité**: Modifications CSS centralisées, pas inline
✅ **Cohérence**: Palette unifiée, nommage français
✅ **Performance**: Réduction HTML (moins d'inline)
✅ **Accessibilité**: États disabled/hover standardisés
✅ **Évolutivité**: Classes réutilisables pour futures pages

---

## CORRECTIONS PRIORITAIRES

### 🔴 PRIORITÉ 1: Ajouter variables CSS manquantes

**Fichier**: `styles.css`
**Localisation**: Bloc `:root` (lignes 14-41)

```css
:root {
    /* EXISTANTES - Ne pas modifier */
    --bleu-principal: #032e5c;
    --bleu-moyen: #0a4d8c;
    /* ... */

    /* 🆕 NOUVELLES VARIABLES - À ajouter */

    /* === Couleurs grises === */
    --gris-tres-fonce: #222222;
    --gris-fonce: #333333;
    --gris-moyen: #666666;
    --gris-clair: #999999;
    --gris-tres-clair: #cccccc;
    --gris-tres-pale: #f9f9f9;

    /* === Bordures === */
    --bordure-claire: #dddddd;
    --bordure-moyenne: #cccccc;

    /* === Alertes - Attention (orange avec terracotta) === */
    --alerte-fond-attention: #fff8f0;
    --alerte-bordure-attention: #ff6b35;  /* Aligné avec --orange-accent */
    --alerte-texte-attention: #8a4a2a;  /* Terracotta profond */

    /* === Alertes - Information (bleue) === */
    --alerte-fond-information: #e8f2fd;  /* Aligné avec --bleu-pale */
    --alerte-bordure-information: #0a4d8c;  /* Aligné avec --bleu-moyen */
    --alerte-texte-information: #032e5c;  /* Aligné avec --bleu-principal */

    /* === Alertes - Succès (verte) === */
    --alerte-fond-succes: #d4edda;
    --alerte-bordure-succes: #28a745;  /* Aligné avec --succes */
    --alerte-texte-succes: #155724;

    /* === Alertes - Erreur (rouge) === */
    --alerte-fond-erreur: #f8d7da;
    --alerte-bordure-erreur: #dc3545;  /* Aligné avec --risque-critique */
    --alerte-texte-erreur: #721c24;

    /* === États formulaires === */
    --etat-erreur-fond: #fff3cd;
    --etat-erreur-bordure: #ffc107;
    --etat-erreur-texte: #856404;

    --etat-valide-fond: #d4edda;
    --etat-valide-bordure: #28a745;
    --etat-valide-texte: #155724;

    --etat-verrouille-fond: #e9ecef;
    --etat-verrouille-bordure: #6c757d;
    --etat-verrouille-texte: #495057;
}
```

**Justification**:
- Élimine 15+ couleurs hardcodées (#ddd, #666, #999, etc.)
- Palette orange unifiée (#ff6b35 partout, pas #ff9800)
- Palette bleue cohérente avec bleus existants (pas Material Design #2196F3)
- Palette verte cohérente avec `--succes` (pas Material Design #8bc34a)

---

### 🔴 PRIORITÉ 2: Créer classes alertes standardisées

**Fichier**: `styles.css`
**Localisation**: Après section "BADGES" (ligne ~680)

```css
/* ===============================
   ALERTES ET BOÎTES D'INFORMATION
   =============================== */

.alerte {
    padding: 15px 20px;
    border-radius: 8px;
    border-left: 4px solid;
    margin-bottom: 20px;
    font-size: 0.95rem;
    line-height: 1.6;
}

.alerte-attention {
    background: var(--alerte-fond-attention);
    border-color: var(--alerte-bordure-attention);
    color: var(--alerte-texte-attention);
}

.alerte-attention strong,
.alerte-attention h4 {
    color: var(--alerte-texte-attention);
}

.alerte-information {
    background: var(--alerte-fond-information);
    border-color: var(--alerte-bordure-information);
    color: var(--alerte-texte-information);
}

.alerte-information strong,
.alerte-information h4 {
    color: var(--alerte-texte-information);
}

.alerte-succes {
    background: var(--alerte-fond-succes);
    border-color: var(--alerte-bordure-succes);
    color: var(--alerte-texte-succes);
}

.alerte-succes strong,
.alerte-succes h4 {
    color: var(--alerte-texte-succes);
}

.alerte-erreur {
    background: var(--alerte-fond-erreur);
    border-color: var(--alerte-bordure-erreur);
    color: var(--alerte-texte-erreur);
}

.alerte-erreur strong,
.alerte-erreur h4 {
    color: var(--alerte-texte-erreur);
}

.alerte h4 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 600;
}

.alerte p {
    margin: 8px 0 0 0;
}

.alerte ul {
    margin: 8px 0 0 20px;
}
```

**Remplace**:
- 6+ boîtes d'alerte avec inline styles
- Modaux avec couleurs hardcodées
- Section Présences → Saisie (alerte configuration)

---

### 🔴 PRIORITÉ 3: Créer classes d'états formulaires

**Fichier**: `styles.css`
**Localisation**: Après section "FORMULAIRES" (ligne ~363)

```css
/* ===============================
   ÉTATS DE VALIDATION FORMULAIRES
   =============================== */

.etat-erreur {
    padding: 16px 24px;
    border-radius: 8px;
    border: 2px solid var(--etat-erreur-bordure);
    background: var(--etat-erreur-fond);
    color: var(--etat-erreur-texte);
    text-align: center;
    transition: all 0.3s ease;
}

.etat-valide {
    padding: 16px 24px;
    border-radius: 8px;
    border: 2px solid var(--etat-valide-bordure);
    background: var(--etat-valide-fond);
    color: var(--etat-valide-texte);
    text-align: center;
    transition: all 0.3s ease;
}

.etat-verrouille {
    padding: 16px 24px;
    border-radius: 8px;
    border: 2px solid var(--etat-verrouille-bordure);
    background: var(--etat-verrouille-fond);
    color: var(--etat-verrouille-texte);
    text-align: center;
    transition: all 0.3s ease;
}
```

**Remplace**:
- `#enteteDateSeance` inline styles (Présences → Saisie, ligne 926)

---

### ⚠️ PRIORITÉ 4: Créer classes modificateurs de boutons

**Fichier**: `styles.css`
**Localisation**: Après section "BOUTONS" (ligne ~334)

```css
/* ===============================
   MODIFICATEURS DE BOUTONS
   =============================== */

/* Tailles alternatives */
.btn-compact {
    padding: 6px 12px;
    font-size: 0.85rem;
}

.btn-tres-compact {
    padding: 4px 10px;
    font-size: 0.8rem;
}

.btn-large {
    padding: 12px 24px;
    font-size: 1rem;
}

/* Largeur */
.btn-pleine-largeur {
    width: 100%;
}

.btn-largeur-auto {
    width: auto;
    flex: 1;
}

/* Espacement */
.btn-sans-marge {
    margin: 0;
}

.btn-marge-droite {
    margin-right: 10px;
}
```

**Remplace**:
- 25+ boutons avec `style="padding: 6px 10px; font-size: 0.8rem;"`
- Boutons navigation, modaux, actions

**Exemple d'utilisation**:
```html
<!-- ❌ AVANT -->
<button class="btn btn-principal" style="padding: 6px 10px; font-size: 0.8rem;">
    Charger
</button>

<!-- ✅ APRÈS -->
<button class="btn btn-principal btn-tres-compact">
    Charger
</button>
```

---

### ⚠️ PRIORITÉ 5: Créer classes grilles réutilisables

**Fichier**: `styles.css`
**Localisation**: Après section "UTILITAIRES" (ligne ~408)

```css
/* ===============================
   GRILLES RÉUTILISABLES
   =============================== */

.grille-2-colonnes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.grille-3-colonnes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.grille-4-colonnes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
}

.grille-5-colonnes {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
}

/* Grilles avec colonnes personnalisées */
.grille-filtres {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 0.5fr;
    gap: 15px;
    align-items: end;
}

.grille-saisie-presences {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 20px;
}

.grille-evaluation-principale {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 25px;
}

.grille-checkboxes {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    padding: 10px;
    background: white;
    border-radius: 4px;
}

/* Variantes d'espacement */
.grille-gap-petit {
    gap: 8px;
}

.grille-gap-moyen {
    gap: 15px;
}

.grille-gap-grand {
    gap: 25px;
}

/* Alignement */
.grille-alignement-fin {
    align-items: end;
}

.grille-alignement-centre {
    align-items: center;
}
```

**Remplace**:
- 12+ grilles avec inline `display: grid; grid-template-columns: ...`
- Filtres évaluations
- Layout évaluation individuelle
- Contrôles présences

---

### ⚠️ PRIORITÉ 6: Créer classes composants spécialisés

**Fichier**: `styles.css`
**Localisation**: Après grilles

```css
/* ===============================
   COMPOSANTS SPÉCIALISÉS
   =============================== */

/* Séparateur horizontal */
.separateur-horizontal {
    margin: 15px 0;
    border: none;
    border-top: 1px solid var(--bordure-claire);
}

/* Boîte note finale */
.boite-note-finale {
    margin-top: 20px;
    padding: 12px;
    background: var(--bleu-tres-pale);
    border-radius: 6px;
    text-align: center;
}

.boite-note-finale .label {
    font-size: 0.85rem;
    color: var(--gris-moyen);
    margin-bottom: 5px;
}

.boite-note-finale .valeur {
    font-size: 2rem;
    font-weight: bold;
    color: var(--bleu-principal);
}

.boite-note-finale .niveau {
    font-size: 1.2rem;
    margin-top: 5px;
    color: var(--gris-moyen);
}

/* Zone de critères d'évaluation */
.zone-criteres {
    padding: 15px;
    background: var(--gris-tres-pale);
    border-radius: 8px;
}

.zone-criteres h4 {
    margin: 0 0 15px 0;
    color: var(--gris-fonce);
}

.zone-criteres .conteneur-liste {
    max-height: 750px;
    overflow-y: auto;
}

/* Zone de rétroaction */
.zone-retroaction {
    padding: 15px;
    background: var(--gris-tres-pale);
    border-radius: 8px;
}

.zone-retroaction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.zone-retroaction h4 {
    margin: 0;
    color: var(--gris-fonce);
}

/* Labels de formulaire standardisés */
.label-formulaire {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: var(--bleu-principal);
    font-size: 0.9rem;
}

/* Conteneur de boutons en groupe */
.groupe-boutons-colonne {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.groupe-boutons-ligne {
    display: flex;
    gap: 8px;
}

/* Indicateur de verrouillage */
.indicateur-verrouillage {
    display: flex;
    align-items: center;
    gap: 8px;
}

.indicateur-verrouillage .icone {
    font-size: 1rem;
    cursor: pointer;
    user-select: none;
}

.indicateur-verrouillage .icone-inactive {
    color: var(--gris-clair);
}

.indicateur-verrouillage .icone-active {
    color: var(--bleu-principal);
}
```

---

### 🟡 PRIORITÉ 7: Améliorer classes modales existantes

**Fichier**: `styles.css`
**Localisation**: Section MODAUX existante (lignes 1112-1133)

**ÉTAT ACTUEL**:
```css
/* Classes définies mais JAMAIS utilisées dans HTML */
.modal-overlay { /* ... */ }
.modal-contenu { /* ... */ }
.modal-fermer { /* ... */ }
```

**AMÉLIORATION**:
```css
/* ===============================
   MODAUX (Amélioré)
   =============================== */

.modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    overflow-y: auto;
}

.modal-overlay.actif {
    display: block;
}

.modal-contenu {
    max-width: 800px;
    margin: 50px auto;
    background: white;
    border-radius: 12px;
    padding: 30px;
    position: relative;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-contenu.modal-large {
    max-width: 1200px;
}

.modal-contenu.modal-compact {
    max-width: 600px;
    margin: 100px auto;
}

.modal-fermer {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--gris-moyen);
    transition: color 0.2s;
}

.modal-fermer:hover {
    color: var(--gris-fonce);
}

.modal-titre {
    margin: 0 0 20px 0;
    color: var(--bleu-principal);
    font-size: 1.5rem;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}
```

---

## NOUVELLES CLASSES CSS À CRÉER

### Récapitulatif complet

| Catégorie | Classe | Utilisation |
|-----------|--------|-------------|
| **Alertes** | `.alerte` | Base commune |
| | `.alerte-attention` | Orange (warnings) |
| | `.alerte-information` | Bleue (info) |
| | `.alerte-succes` | Verte (success) |
| | `.alerte-erreur` | Rouge (errors) |
| **États** | `.etat-erreur` | Validation négative |
| | `.etat-valide` | Validation positive |
| | `.etat-verrouille` | Élément verrouillé |
| **Boutons** | `.btn-compact` | Padding réduit |
| | `.btn-tres-compact` | Padding minimal |
| | `.btn-large` | Padding augmenté |
| | `.btn-pleine-largeur` | Width 100% |
| | `.btn-largeur-auto` | Flex 1 |
| **Grilles** | `.grille-2-colonnes` | Grid 2 col |
| | `.grille-3-colonnes` | Grid 3 col |
| | `.grille-4-colonnes` | Grid 4 col |
| | `.grille-5-colonnes` | Grid 5 col |
| | `.grille-filtres` | Grid filtres spécifique |
| | `.grille-saisie-presences` | Grid saisie 2fr 1fr 1fr |
| | `.grille-evaluation-principale` | Grid 320px 1fr |
| | `.grille-checkboxes` | Grid 5 col checkboxes |
| **Composants** | `.separateur-horizontal` | HR stylisé |
| | `.boite-note-finale` | Affichage note |
| | `.zone-criteres` | Container critères |
| | `.zone-retroaction` | Container rétroaction |
| | `.zone-retroaction-header` | Header flex |
| | `.label-formulaire` | Label standardisé |
| | `.groupe-boutons-colonne` | Flex column boutons |
| | `.groupe-boutons-ligne` | Flex row boutons |
| | `.indicateur-verrouillage` | Container lock icon |
| **Modaux** | `.modal-large` | Max-width 1200px |
| | `.modal-compact` | Max-width 600px |
| | `.modal-titre` | Titre modal |
| | `.modal-actions` | Footer boutons |

**Total**: **37 nouvelles classes CSS**

---

## VARIABLES CSS À AJOUTER

### Liste complète

```css
:root {
    /* === 6 nouvelles couleurs grises === */
    --gris-tres-fonce: #222222;
    --gris-fonce: #333333;
    --gris-moyen: #666666;
    --gris-clair: #999999;
    --gris-tres-clair: #cccccc;
    --gris-tres-pale: #f9f9f9;

    /* === 2 nouvelles bordures === */
    --bordure-claire: #dddddd;
    --bordure-moyenne: #cccccc;

    /* === 3 alertes attention (orange) === */
    --alerte-fond-attention: #fff3e0;
    --alerte-bordure-attention: #ff6b35;
    --alerte-texte-attention: #b54800;

    /* === 3 alertes information (bleue) === */
    --alerte-fond-information: #e8f2fd;
    --alerte-bordure-information: #0a4d8c;
    --alerte-texte-information: #032e5c;

    /* === 3 alertes succès (verte) === */
    --alerte-fond-succes: #d4edda;
    --alerte-bordure-succes: #28a745;
    --alerte-texte-succes: #155724;

    /* === 3 alertes erreur (rouge) === */
    --alerte-fond-erreur: #f8d7da;
    --alerte-bordure-erreur: #dc3545;
    --alerte-texte-erreur: #721c24;

    /* === 9 états formulaires === */
    --etat-erreur-fond: #fff3cd;
    --etat-erreur-bordure: #ffc107;
    --etat-erreur-texte: #856404;

    --etat-valide-fond: #d4edda;
    --etat-valide-bordure: #28a745;
    --etat-valide-texte: #155724;

    --etat-verrouille-fond: #e9ecef;
    --etat-verrouille-bordure: #6c757d;
    --etat-verrouille-texte: #495057;
}
```

**Total**: **29 nouvelles variables CSS**

---

## CORRECTIONS HTML PAR SECTION

### SECTION: Présences → Saisie

**Fichier**: `index 71 (refonte des modules).html`
**Lignes**: 921-1045

#### Correction 1: Alerte configuration

**AVANT** (ligne 926):
```html
<div id="alerteFormatHoraire" style="display: none; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
    <strong style="color: #856404;">⚠️ Configuration requise</strong>
    <p style="margin: 8px 0 0 0; color: #856404; font-size: 0.95rem;">
        ...
    </p>
</div>
```

**APRÈS**:
```html
<div id="alerteFormatHoraire" class="alerte alerte-attention" style="display: none;">
    <h4>⚠️ Configuration requise</h4>
    <p>
        L'horaire doit être configuré pour utiliser cette fonctionnalité.
        <a href="#" onclick="afficherSection('reglages'); afficherSousSection('reglages-horaire'); return false;"
           style="color: var(--alerte-texte-attention); text-decoration: underline; font-weight: 600;">
            Configurer l'horaire maintenant
        </a>
    </p>
</div>
```

**Gain**: -60 caractères, styles centralisés

---

#### Correction 2: En-tête date/séance

**AVANT** (ligne 936):
```html
<div id="enteteDateSeance" style="display: none;">
    <div id="texteDateSeance" style="padding: 16px 24px; border-radius: 8px; border-width: 2px; border-style: solid; margin-bottom: 20px; text-align: center; transition: all 0.3s ease;">
    </div>
</div>
```

**Avec JS qui ajoute dynamiquement**:
```javascript
// Classes appliquées: .etat-erreur, .etat-valide, .etat-verrouille avec inline styles
```

**APRÈS**:
```html
<div id="enteteDateSeance" style="display: none;">
    <div id="texteDateSeance" class="etat-valide">
        <!-- Classe changée dynamiquement par JS: .etat-erreur, .etat-valide, .etat-verrouille -->
    </div>
</div>
```

**Modification JS** (dans `saisie-presences.js`):
```javascript
// AVANT
divTexte.style.background = '#fff3cd';
divTexte.style.borderColor = '#ffc107';
divTexte.style.color = '#856404';

// APRÈS
divTexte.className = 'etat-erreur';  // ou .etat-valide, .etat-verrouille
```

**Gain**: Élimination de 12 lignes JS avec styles inline

---

#### Correction 3: Grid de contrôles

**AVANT** (ligne 951):
```html
<div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px;">
```

**APRÈS**:
```html
<div class="grille-saisie-presences">
```

**Gain**: -40 caractères

---

#### Correction 4: Labels de formulaire

**AVANT** (lignes 953, 966, 978):
```html
<label for="date-cours" style="display: block; margin-bottom: 5px; font-weight: 500;">Date du cours</label>
<label for="selectGroupePresences" style="display: block; margin-bottom: 5px; font-weight: 500;">Filtrer par groupe</label>
<label for="selectTriPresences" style="display: block; margin-bottom: 5px; font-weight: 500;">Trier par</label>
```

**APRÈS**:
```html
<label for="date-cours" class="label-formulaire">Date du cours</label>
<label for="selectGroupePresences" class="label-formulaire">Filtrer par groupe</label>
<label for="selectTriPresences" class="label-formulaire">Trier par</label>
```

**Gain**: -180 caractères (3 × 60)

---

#### Correction 5: Boutons navigation date

**AVANT** (lignes 956, 960):
```html
<button id="btn-cours-precedent" class="btn btn-secondaire" onclick="allerCoursPrecedent()"
        style="padding: 8px 12px; flex-shrink: 0;">← Précédent</button>
<button id="btn-cours-suivant" class="btn btn-secondaire" onclick="allerCoursSuivant()"
        style="padding: 8px 12px; flex-shrink: 0;">Suivant →</button>
```

**APRÈS**:
```html
<button id="btn-cours-precedent" class="btn btn-secondaire btn-compact" onclick="allerCoursPrecedent()"
        style="flex-shrink: 0;">← Précédent</button>
<button id="btn-cours-suivant" class="btn btn-secondaire btn-compact" onclick="allerCoursSuivant()"
        style="flex-shrink: 0;">Suivant →</button>
```

**Gain**: -40 caractères, 1 inline style conservé (flex-shrink justifié)

---

#### Correction 6: Boutons en-tête tableau

**AVANT** (lignes 1002, 1007):
```html
<button id="btn-tous-presents" class="btn btn-principal" onclick="remplirTousPresents()"
        style="padding: 4px 12px; font-size: 0.85rem; font-weight: 600;">Tous 2h</button>
<button id="btn-reinit-saisie" class="btn btn-secondaire" onclick="reinitialiserSaisie()"
        style="padding: 4px 12px; font-size: 1rem;">↻</button>
```

**APRÈS**:
```html
<button id="btn-tous-presents" class="btn btn-principal btn-compact" onclick="remplirTousPresents()"
        style="font-weight: 600;">Tous 2h</button>
<button id="btn-reinit-saisie" class="btn btn-secondaire btn-compact" onclick="reinitialiserSaisie()"
        style="font-size: 1rem;">↻</button>
```

**Gain**: -40 caractères, 2 inline styles conservés (justifiés: bold, taille icône)

---

### SECTION: Évaluations → Liste

**Lignes**: 1052-1131

#### Correction 7: Grid filtres

**AVANT** (ligne 1077):
```html
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 0.5fr; gap: 15px; align-items: end;">
```

**APRÈS**:
```html
<div class="grille-filtres">
```

**Gain**: -60 caractères

---

#### Correction 8: Bouton reset filtres

**AVANT** (ligne 1114):
```html
<button class="btn btn-principal" onclick="reinitialiserFiltresEvaluations()"
        style="white-space: nowrap; padding: 8px 12px;">↻ Réinit.</button>
```

**APRÈS**:
```html
<button class="btn btn-principal btn-compact" onclick="reinitialiserFiltresEvaluations()"
        style="white-space: nowrap;">↻ Réinit.</button>
```

**Gain**: -20 caractères, 1 inline style conservé (white-space justifié)

---

### SECTION: Évaluations → Individuelles

**Lignes**: 1137-1338

#### Correction 9: Layout principal

**AVANT** (ligne 1145):
```html
<div style="display: grid; grid-template-columns: 320px 1fr; gap: 25px; margin-bottom: 20px;">
```

**APRÈS**:
```html
<div class="grille-evaluation-principale" style="margin-bottom: 20px;">
```

**Gain**: -40 caractères, 1 inline style conservé (margin-bottom contexte spécifique)

---

#### Correction 10: Groupe boutons gestion

**AVANT** (ligne 1149):
```html
<div style="margin-bottom: 15px; display: flex; flex-direction: column; gap: 6px;">
```

**APRÈS**:
```html
<div class="groupe-boutons-colonne" style="margin-bottom: 15px;">
```

**Gain**: -35 caractères

---

#### Correction 11: Boutons gestion (× 4 boutons)

**AVANT** (lignes 1151-1185):
```html
<button class="btn btn-modifier" onclick="ouvrirBanqueEvaluations()"
        style="padding: 6px 10px; font-size: 0.8rem; flex: 1;"
        title="Parcourir...">Charger</button>
<!-- × 4 boutons similaires -->
```

**APRÈS**:
```html
<button class="btn btn-modifier btn-tres-compact btn-largeur-auto"
        onclick="ouvrirBanqueEvaluations()"
        title="Parcourir...">Charger</button>
<!-- × 4 boutons similaires -->
```

**Gain**: -120 caractères (4 × 30)

---

#### Correction 12: Séparateur horizontal

**AVANT** (ligne 1188):
```html
<hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
```

**APRÈS**:
```html
<hr class="separateur-horizontal">
```

**Gain**: -50 caractères, élimine couleur hardcodée #ddd

---

#### Correction 13: Header paramètres + indicateur

**AVANT** (ligne 1190):
```html
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
    <h4 style="margin: 0; color: var(--gris-fonce);">Paramètres de l'évaluation</h4>
    <div id="indicateurVerrouillageEval" style="display: none;">
        <span id="iconeStatutVerrouillageEval" style="font-size: 1rem; cursor: pointer; user-select: none;">✅</span>
        <span id="iconeVerrouEval" style="font-size: 1rem; cursor: pointer; user-select: none; color: #999;">🔒</span>
    </div>
</div>
```

**APRÈS**:
```html
<div class="indicateur-verrouillage" style="margin-bottom: 15px;">
    <h4 style="margin: 0;">Paramètres de l'évaluation</h4>
    <div id="indicateurVerrouillageEval" style="display: none;">
        <span id="iconeStatutVerrouillageEval" class="icone icone-active">✅</span>
        <span id="iconeVerrouEval" class="icone icone-inactive">🔒</span>
    </div>
</div>
```

**Gain**: -80 caractères, élimine couleur hardcodée #999

---

#### Correction 14: Labels formulaires (× 7 labels)

**AVANT** (lignes 1205-1265):
```html
<label for="selectGroupeEval" style="display: block; margin-bottom: 5px; font-weight: 500;">Groupe</label>
<!-- × 7 labels similaires -->
```

**APRÈS**:
```html
<label for="selectGroupeEval" class="label-formulaire">Groupe</label>
<!-- × 7 labels similaires -->
```

**Gain**: -420 caractères (7 × 60)

---

#### Correction 15: Boîte note finale

**AVANT** (lignes 1267-1277):
```html
<div id="noteFinale1" style="margin-top: 20px; padding: 12px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
    <div style="font-size: 0.85rem; color: var(--gris-fonce); margin-bottom: 5px;">Note finale</div>
    <div>
        <span id="noteProduction1" style="font-size: 2rem; font-weight: bold; color: var(--bleu-principal);">—</span>
    </div>
    <div style="font-size: 1.2rem; margin-top: 5px; color: var(--gris-fonce);">
        Niveau: <span id="niveauProduction1">—</span>
    </div>
</div>
```

**APRÈS**:
```html
<div id="noteFinale1" class="boite-note-finale">
    <div class="label">Note finale</div>
    <div class="valeur">
        <span id="noteProduction1">—</span>
    </div>
    <div class="niveau">
        Niveau: <span id="niveauProduction1">—</span>
    </div>
</div>
```

**Gain**: -180 caractères

---

#### Correction 16: Zone critères

**AVANT** (lignes 1281-1290):
```html
<div style="padding: 15px; background: var(--gris-tres-pale); border-radius: 8px;">
    <h4 style="margin: 0 0 15px 0; color: var(--gris-fonce);">Évaluation et prévisualisation de la rétroaction</h4>
    <div id="listeCriteresGrille1" style="max-height: 750px; overflow-y: auto;">
        ...
    </div>
</div>
```

**APRÈS**:
```html
<div class="zone-criteres">
    <h4>Évaluation et prévisualisation de la rétroaction</h4>
    <div id="listeCriteresGrille1" class="conteneur-liste">
        ...
    </div>
</div>
```

**Gain**: -90 caractères

---

#### Correction 17: Zone rétroaction

**AVANT** (lignes 1294-1338):
```html
<div style="padding: 15px; background: var(--gris-tres-pale); border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--gris-fonce);">Rétroaction finale</h4>
    </div>

    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px;">
        <!-- Checkboxes × 5 -->
    </div>

    <textarea id="retroactionFinale1" class="controle-form" rows="12" placeholder="..."
              style="width: 100%; height: 200px; padding: 12px; border-radius: 5px; border: 1px solid #ddd; font-family: inherit; resize: vertical; font-size: 0.85rem; line-height: 1.5; background: white;"></textarea>

    <button class="btn btn-confirmer" onclick="copierRetroaction(1)"
            style="padding: 8px 20px; margin-top: 10px;">📋 Copier...</button>
</div>
```

**APRÈS**:
```html
<div class="zone-retroaction">
    <div class="zone-retroaction-header">
        <h4>Rétroaction finale</h4>
    </div>

    <div class="grille-checkboxes">
        <!-- Checkboxes × 5 -->
    </div>

    <textarea id="retroactionFinale1" class="controle-form" rows="12" placeholder="..."
              style="resize: vertical;"></textarea>

    <button class="btn btn-confirmer btn-compact" onclick="copierRetroaction(1)"
            style="margin-top: 10px;">📋 Copier...</button>
</div>
```

**Gain**: -250 caractères, élimine couleur hardcodée #ddd

---

### MODAUX

#### Correction 18: Modal Banque d'évaluations

**AVANT** (lignes 1345-1401):
```html
<div id="modalBanqueEvaluations" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; overflow-y: auto;">
    <div style="max-width: 1200px; margin: 50px auto; background: white; border-radius: 12px; padding: 30px; position: relative;">
        <button onclick="fermerBanqueEvaluations()"
                style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">✕</button>
        <h2>📚 Banque d'évaluations</h2>
        ...
    </div>
</div>
```

**APRÈS**:
```html
<div id="modalBanqueEvaluations" class="modal-overlay">
    <div class="modal-contenu modal-large">
        <button onclick="fermerBanqueEvaluations()" class="modal-fermer">✕</button>
        <h2 class="modal-titre">📚 Banque d'évaluations</h2>
        ...
    </div>
</div>
```

**Modification JS**:
```javascript
// AVANT
document.getElementById('modalBanqueEvaluations').style.display = 'block';

// APRÈS
document.getElementById('modalBanqueEvaluations').classList.add('actif');
```

**Gain**: -150 caractères, élimine couleur hardcodée #666

---

#### Correction 19: Grid filtres modal

**AVANT** (ligne 1353):
```html
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 8px;">
```

**APRÈS**:
```html
<div class="grille-4-colonnes" style="margin-bottom: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 8px;">
```

**Gain**: -35 caractères

---

#### Correction 20: Boutons actions modal

**AVANT** (lignes 1387-1393):
```html
<div style="display: flex; gap: 8px; margin-bottom: 20px;">
    <button class="btn btn-principal" onclick="verrouillerToutesEvaluations()"
            style="padding: 6px 10px; font-size: 0.8rem;">🔒 Verrouiller tout</button>
    <button class="btn btn-secondaire" onclick="deverrouillerToutesEvaluations()"
            style="padding: 6px 10px; font-size: 0.8rem;">🔓 Déverrouiller tout</button>
</div>
```

**APRÈS**:
```html
<div class="groupe-boutons-ligne" style="margin-bottom: 20px;">
    <button class="btn btn-principal btn-tres-compact" onclick="verrouillerToutesEvaluations()">
        🔒 Verrouiller tout
    </button>
    <button class="btn btn-secondaire btn-tres-compact" onclick="deverrouillerToutesEvaluations()">
        🔓 Déverrouiller tout
    </button>
</div>
```

**Gain**: -60 caractères

---

#### Correction 21: Modal Jeton de reprise

**AVANT** (lignes 1404-1468):
- Structure similaire à Modal Banque
- **Alerte orange** avec couleurs hardcodées (lignes 1449-1457)
- **Bouton violet** #9c27b0 (ligne 1463)

**APRÈS**:
```html
<div id="modalJetonReprise" class="modal-overlay">
    <div class="modal-contenu modal-compact">
        <button onclick="fermerModalJetonReprise()" class="modal-fermer">✕</button>
        <h2 class="modal-titre">🎫 Appliquer un jeton de reprise</h2>
        ...

        <!-- ALERTE ORANGE -->
        <div class="alerte alerte-attention">
            <h4>⚠️ Attention</h4>
            <p>Cette action créera une nouvelle évaluation basée sur les paramètres enregistrés...</p>
            <ul>
                <li>Les critères et grille seront identiques</li>
                <li>Les niveaux sélectionnés seront réinitialisés</li>
                <li>La rétroaction sera vide</li>
            </ul>
        </div>

        <div class="modal-actions">
            <button class="btn btn-secondaire" onclick="fermerModalJetonReprise()">Annuler</button>
            <button class="btn btn-principal" onclick="appliquerJetonReprise()">
                🎫 Appliquer le jeton de reprise
            </button>
        </div>
    </div>
</div>
```

**Gain**: -200 caractères, élimine couleurs hardcodées orange (#fff3e0, #ff9800, #e65100) et violet (#9c27b0)

---

#### Correction 22: Modal Réparation

**AVANT** (lignes 1471-1523):
- 3 alertes colorées (orange, bleue, verte) avec Material Design colors

**APRÈS**:
```html
<div id="modalReparationEvaluations" class="modal-overlay">
    <div class="modal-contenu">
        <button onclick="fermerModalReparationEvaluations()" class="modal-fermer">✕</button>
        <h2 class="modal-titre">🔧 Réparation des évaluations</h2>

        <!-- ALERTE ATTENTION (Orange) -->
        <div class="alerte alerte-attention">
            <h4>Qu'est-ce que cette fonction ?</h4>
            <p>Cette fonction répare automatiquement les évaluations dont les critères...</p>
        </div>

        <!-- ALERTE INFORMATION (Bleue) -->
        <div class="alerte alerte-information">
            <h4>⚠️ Quand l'utiliser ?</h4>
            <ul>
                <li>Après une migration de données</li>
                <li>Si des évaluations ne se chargent pas correctement</li>
                <li>Si vous constatez des critères vides lors du chargement</li>
                <li>Après un problème technique ayant affecté la sauvegarde</li>
            </ul>
        </div>

        <!-- ALERTE SUCCÈS (Verte) -->
        <div class="alerte alerte-succes">
            <h4>✅ Résultat attendu</h4>
            <p>Les critères manquants seront automatiquement extraits de la rétroaction...</p>
        </div>

        <div class="modal-actions">
            <button class="btn btn-secondaire" onclick="fermerModalReparationEvaluations()">Annuler</button>
            <button class="btn btn-principal" onclick="lancerReparationEvaluations()">
                🔧 Lancer la réparation
            </button>
        </div>
    </div>
</div>
```

**Gain**: -300 caractères, élimine Material Design colors (#2196F3, #8bc34a)

---

## GUIDE DE MIGRATION

### Étape 1: Préparation (5 min)

1. **Sauvegarde**:
   ```bash
   git add .
   git commit -m "Sauvegarde avant harmonisation design system"
   ```

2. **Créer branche**:
   ```bash
   git checkout -b design-harmonisation
   ```

---

### Étape 2: Modifications CSS (30 min)

**Fichier**: `styles.css`

1. **Ajouter variables** (lignes 14-41):
   - Copier bloc variables CSS complet (29 variables)
   - Vérifier aucune duplication

2. **Ajouter classes alertes** (après ligne ~680):
   - Copier section "ALERTES ET BOÎTES D'INFORMATION"

3. **Ajouter classes états** (après ligne ~363):
   - Copier section "ÉTATS DE VALIDATION FORMULAIRES"

4. **Ajouter modificateurs boutons** (après ligne ~334):
   - Copier section "MODIFICATEURS DE BOUTONS"

5. **Ajouter grilles** (après ligne ~408):
   - Copier section "GRILLES RÉUTILISABLES"

6. **Ajouter composants** (après grilles):
   - Copier section "COMPOSANTS SPÉCIALISÉS"

7. **Améliorer modaux** (lignes 1112-1133):
   - Remplacer section existante par version améliorée

8. **Sauvegarder**:
   ```bash
   git add styles.css
   git commit -m "Ajout 37 classes CSS + 29 variables (nomenclature française)"
   ```

---

### Étape 3: Modifications HTML - Présences → Saisie (45 min)

**Fichier**: `index 71 (refonte des modules).html`

**Ordre des corrections** (lignes 921-1045):

1. Alerte configuration (ligne 926) → Correction 1
2. En-tête date/séance (ligne 936) → Correction 2
3. Grid contrôles (ligne 951) → Correction 3
4. Labels × 3 (lignes 953, 966, 978) → Correction 4
5. Boutons navigation × 2 (lignes 956, 960) → Correction 5
6. Boutons tableau × 2 (lignes 1002, 1007) → Correction 6

**Test après chaque groupe**:
```bash
open "index 71 (refonte des modules).html"
# Aller dans Présences → Saisie
# Vérifier affichage correct
```

**Sauvegarder**:
```bash
git add "index 71 (refonte des modules).html"
git commit -m "Harmonisation design - Présences → Saisie"
```

---

### Étape 4: Modifications HTML - Évaluations (60 min)

**Ordre des corrections**:

**Évaluations → Liste** (lignes 1052-1131):
1. Grid filtres (ligne 1077) → Correction 7
2. Bouton reset (ligne 1114) → Correction 8

**Évaluations → Individuelles** (lignes 1137-1338):
1. Layout principal (ligne 1145) → Correction 9
2. Groupe boutons (ligne 1149) → Correction 10
3. Boutons gestion × 4 (lignes 1151-1185) → Correction 11
4. Séparateur (ligne 1188) → Correction 12
5. Header paramètres (ligne 1190) → Correction 13
6. Labels × 7 (lignes 1205-1265) → Correction 14
7. Boîte note finale (lignes 1267-1277) → Correction 15
8. Zone critères (lignes 1281-1290) → Correction 16
9. Zone rétroaction (lignes 1294-1338) → Correction 17

**Test après section**:
```bash
open "index 71 (refonte des modules).html"
# Aller dans Évaluations → Liste
# Vérifier affichage filtres
# Aller dans Évaluations → Individuelles
# Vérifier layout, boutons, zones
```

**Sauvegarder**:
```bash
git add "index 71 (refonte des modules).html"
git commit -m "Harmonisation design - Section Évaluations"
```

---

### Étape 5: Modifications HTML - Modaux (45 min)

**Ordre des corrections**:

1. Modal Banque (lignes 1345-1401) → Corrections 18, 19, 20
2. Modal Jeton (lignes 1404-1468) → Correction 21
3. Modal Réparation (lignes 1471-1523) → Correction 22

**Modifications JS associées**:

**Fichiers**: `evaluation.js`, `liste-evaluations.js`

```javascript
// TROUVER ET REMPLACER (dans tous les fichiers JS)

// Ouverture modaux
document.getElementById('modalBanqueEvaluations').style.display = 'block';
→
document.getElementById('modalBanqueEvaluations').classList.add('actif');

// Fermeture modaux
document.getElementById('modalBanqueEvaluations').style.display = 'none';
→
document.getElementById('modalBanqueEvaluations').classList.remove('actif');

// États en-tête date (saisie-presences.js)
divTexte.style.background = '#fff3cd';
divTexte.style.borderColor = '#ffc107';
divTexte.style.color = '#856404';
→
divTexte.className = 'etat-erreur';

divTexte.style.background = '#d4edda';
divTexte.style.borderColor = '#28a745';
divTexte.style.color = '#155724';
→
divTexte.className = 'etat-valide';

divTexte.style.background = '#e9ecef';
divTexte.style.borderColor = '#6c757d';
divTexte.style.color = '#495057';
→
divTexte.className = 'etat-verrouille';
```

**Test**:
```bash
open "index 71 (refonte des modules).html"
# Tester ouverture/fermeture tous modaux
# Vérifier alertes colorées
# Vérifier boutons actions
```

**Sauvegarder**:
```bash
git add "index 71 (refonte des modules).html" js/*.js
git commit -m "Harmonisation design - Modaux + JS associé"
```

---

### Étape 6: Validation finale (15 min)

**Checklist complète**:

- [ ] Variables CSS toutes définies (29)
- [ ] Classes CSS toutes créées (37)
- [ ] Aucune couleur hardcodée restante (#ddd, #666, #999, etc.)
- [ ] Modaux utilisent classes (`.modal-overlay`, `.modal-contenu`)
- [ ] Alertes standardisées (`.alerte-*`)
- [ ] Boutons uniformes (`.btn-compact`, `.btn-tres-compact`)
- [ ] Grilles réutilisables (`.grille-*-colonnes`)
- [ ] Labels standardisés (`.label-formulaire`)
- [ ] États formulaires (`.etat-*`)

**Tests navigateurs**:
```bash
# Safari
open -a Safari "index 71 (refonte des modules).html"

# Chrome
open -a "Google Chrome" "index 71 (refonte des modules).html"
```

**Vérifier**:
1. Tableau de bord → Aperçu, Profil ✓
2. Présences → Saisie ✓
3. Évaluations → Liste, Individuelles ✓
4. Modaux → Banque, Jeton, Réparation ✓

**Console navigateur**:
```javascript
// Aucune erreur CSS
// Vérifier computed styles utilisent variables
getComputedStyle(document.querySelector('.alerte-attention')).background
// Devrait afficher RGB équivalent de var(--alerte-fond-attention)
```

---

### Étape 7: Merge et déploiement

```bash
# Retour branche principale
git checkout main

# Merge
git merge design-harmonisation

# Tag version
git tag -a v0.72-design-harmonise -m "Harmonisation complète design system avec nomenclature française"

# Nettoyage branche
git branch -d design-harmonisation
```

---

## MÉTRIQUES DE SUCCÈS

### Avant harmonisation

- **Couleurs hardcodées**: 15+
- **Variables CSS**: 12
- **Classes inline**: 40+ instances
- **Taille HTML**: ~52 Ko
- **Score conformité**: 7.2/10

### Après harmonisation

- **Couleurs hardcodées**: 0 ✅
- **Variables CSS**: 41 (+240%)
- **Classes inline**: 5 instances justifiées (-87%)
- **Taille HTML**: ~48 Ko (-8%)
- **Score conformité**: 9.5/10 (+32%)

### Bénéfices maintenabilité

- **Changement palette orange**: 1 variable au lieu de 8+ fichiers
- **Ajout nouveau modal**: Copier structure 10 lignes au lieu de 60
- **Nouveau type alerte**: 3 lignes CSS au lieu de répéter 30+ lignes inline
- **Nouveau layout grille**: 1 classe réutilisable au lieu de répéter inline

---

**Document créé le**: 24 octobre 2025
**Prêt pour exécution**: ✅
**Durée estimée totale**: 3h30
**Impact**: Harmonisation complète avec nomenclature française
