# 📋 DOCUMENT DE RÉFÉRENCE POUR CLAUDE CODE
## Transition : Design System v7 - Audit V5

**Date :** 2 janvier 2026  
**Contexte :** Fin de session avec Claude (contexte saturé)  
**Objectif :** Document auto-suffisant pour Claude Code

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Situation actuelle
- ✅ **Audit V4 créé et appliqué** dans Codex Numeris
- ❌ **Audit V4 incomplet** : couvre seulement 9 parties sur 16 modules
- 🎯 **Objectif :** Créer **Audit V5** EXHAUSTIF (16 parties)

### Décision de Grégoire
> "Je ne veux jamais aller vite. Je veux que le travail soit pérenne."

- **Option retenue :** Option B exhaustive
- **Plus jamais** les mots "complet" ou "final" dans les noms de fichiers
- **Créer :** AUDIT_V5.md (7 nouvelles parties + révision)

---

## 📊 ÉTAT ACTUEL : CE QUI EXISTE

### **Audit V4 (9 parties - INCOMPLET)**
Fichier : `AUDIT_COMPLET_V4.md` (18 KB)

**Parties existantes :**
1. ✅ 4 Pratiques de notation (SOM/STD/SPE/DEN)
2. ✅ Badges Tétris (7 familles)
3. ✅ Badges matériel pédagogique
4. ✅ Gradients (en-tête + fond page)
5. ✅ Box-shadow (système 5 niveaux)
6. ✅ Border-radius (12px harmonisé toggles)
7. ✅ Sidebars / Bibliothèques (fond blanc)
8. ✅ Boutons (padding unifié)
9. ✅ Variables CSS (système complet)

**Couverture :** 9/16 modules = **56%**

---

### **Modules HTML existants (16 modules)**

**✅ Harmonisés (6 modules)**
1. `01a-palette-couleurs.html` (66 KB) - Stable
2. `01b-typographie.html` (7.4 KB) - Stable
3. `02a-boutons-v2-harmonise.html` (12 KB) - ⭐ Nouveau
4. `02c-badges-v6-final.html` (18 KB) - ⭐ Nouveau
5. `03b-cartes-sidebars-v2-harmonise.html` (18 KB) - ⭐ Nouveau
6. `04b-entete-v3-gradients.html` (15 KB) - ⭐ Nouveau

**⚠️ À harmoniser (10 modules)**
7. `02b-formulaires.html` (20 KB) - Border-radius 8px → 12px
8. `03a-tableaux.html` (7.2 KB) - Border-radius 8px → 12px
9. `03c-barres-gradient.html` (17 KB) - Border-radius 8px → 12px
10. `03d-modals.html` (38 KB) - Border-radius 8px → 12px, Box-shadow Fort
11. `04a-navigation.html` (23 KB) - Border-radius 8px → 12px
12. `05-patterns-pedagogiques.html` (34 KB) - Border-radius 8px → 12px
13. `06a-emojis-CRITIQUE.html` (14 KB) - OK (guide technique)
14. `06b-toggles.html` (9.5 KB) - OK (référence 12px)
15. `06c-alertes.html` (8.1 KB) - Border-radius 8px → 6px (petits)
16. `07-primo-assistant.html` (13 KB) - Border-radius 8px → 12px

---

## ❌ CE QUI MANQUE DANS AUDIT V4

### **7 composants UI SANS instructions**
1. **Modals** (03d) - CRITIQUE
2. **Alertes** (06c) - CRITIQUE
3. **Navigation** (04a) - Important
4. **Formulaires** (02b) - Important
5. **Tableaux** (03a) - Important
6. **Barres de progression** (03c) - Moyen
7. **Primo assistant / Wizard** (07) - Moyen

**Conséquence :** Claude Code a appliqué l'audit V4 mais ces composants utilisent encore les anciennes specs (border-radius 8px, box-shadow incohérent).

---

## 🎯 MISSION : CRÉER AUDIT V5 (16 PARTIES)

### **Structure de l'Audit V5**

**Nom fichier :** `AUDIT_V5.md` (PAS "complet", PAS "final")

**Contenu :**
```
AUDIT V5 - Design System v7
Harmonisation exhaustive de tous les composants UI

PARTIE 1 : 4 Pratiques de notation (SOM/STD/SPE/DEN)
PARTIE 2 : Badges Tétris (7 familles)
PARTIE 3 : Badges matériel pédagogique
PARTIE 4 : Gradients (en-tête + fond page)
PARTIE 5 : Box-shadow (système 5 niveaux)
PARTIE 6 : Border-radius (12px harmonisé toggles)
PARTIE 7 : Sidebars / Bibliothèques (fond blanc)
PARTIE 8 : Boutons (padding unifié)
PARTIE 9 : Variables CSS (système complet)

⭐ NOUVELLES PARTIES À AJOUTER :

PARTIE 10 : MODALS (modale + overlay)
PARTIE 11 : ALERTES (4 types : info/succès/warning/danger)
PARTIE 12 : NAVIGATION (barre nav + items)
PARTIE 13 : FORMULAIRES (inputs/textarea/select/labels)
PARTIE 14 : TABLEAUX (headers/rows/hover)
PARTIE 15 : BARRES DE PROGRESSION (avec gradients)
PARTIE 16 : PRIMO ASSISTANT / WIZARD (étapes/formulaires)

CHECKLIST VALIDATION (mise à jour avec 16 parties)
TABLEAU RÉCAPITULATIF (16 modules)
```

---

## 📐 SPECS DÉTAILLÉES POUR NOUVELLES PARTIES

### **PARTIE 10 : MODALS** ⭐ CRITIQUE

**Fichier concerné :** `03d-modals.html`

**Modifications nécessaires :**

#### Modal content
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

#### Modal overlay
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

**Justification :**
- Border-radius 12px : Harmonisé avec toggles et conteneurs
- Box-shadow Fort : Élément flottant qui doit ressortir
- Overlay bleu : Cohérence avec palette (au lieu de noir pur)

---

### **PARTIE 11 : ALERTES** ⭐ CRITIQUE

**Fichier concerné :** `06c-alertes.html`

**Modifications nécessaires :**

#### Alertes (petits éléments)
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
}
```

#### 4 types d'alertes
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
- Border-radius 6px : Petits éléments (pas 12px)
- Box-shadow Subtil : Juste assez pour ressortir
- Color-mix 9% : Même technique que badges pratique

---

### **PARTIE 12 : NAVIGATION** ⭐ IMPORTANT

**Fichier concerné :** `04a-navigation.html`

**Modifications nécessaires :**

#### Barre navigation
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

#### Items navigation
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
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
}

.nav-item.active {
    background: rgba(255, 255, 255, 0.15);
    font-weight: 600;
}
```

**Justification :**
- Border-radius 12px conteneur : Harmonisé
- Items padding 10px 15px : Comme boutons
- Transitions cohérentes : 0.2s ease partout

---

### **PARTIE 13 : FORMULAIRES** ⭐ IMPORTANT

**Fichier concerné :** `02b-formulaires.html`

**Modifications nécessaires :**

#### Inputs / Textarea / Select
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
```

#### Labels
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
```

**Justification :**
- Border-radius 6px : Petits éléments
- Focus ring : Accessibilité améliorée
- Labels plus prononcés : Hiérarchie visuelle

---

### **PARTIE 14 : TABLEAUX** ⭐ IMPORTANT

**Fichier concerné :** `03a-tableaux.html`

**Modifications nécessaires :**

#### Table conteneur
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

#### Table rows
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
}

tbody tr:hover {
    background: #f0f8ff;                         /* Bleu très pâle */
    cursor: pointer;
}
```

#### Table headers
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

**Justification :**
- Border-radius 12px : Harmonisé conteneurs
- Hover bleu : Cohérence palette
- Headers bleu pâle : Identité visuelle

---

### **PARTIE 15 : BARRES DE PROGRESSION** ⭐ MOYEN

**Fichier concerné :** `03c-barres-gradient.html`

**Modifications nécessaires :**

#### Barre conteneur
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

#### Barre remplissage
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
```

**Justification :**
- Gradients 135deg : Cohérence totale
- Box-shadow inset : Profondeur conteneur
- Fond bleu pâle : Identité visuelle

---

### **PARTIE 16 : PRIMO ASSISTANT / WIZARD** ⭐ MOYEN

**Fichier concerné :** `07-primo-assistant.html`

**Modifications nécessaires :**

#### Wizard conteneur
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

#### Étapes wizard
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
```

#### Boutons wizard
**AVANT :**
```css
.wizard-btn {
    padding: 8px 16px;
}
```

**APRÈS :**
```css
.wizard-btn {
    padding: 10px 15px;                          /* Harmonisé boutons */
    border-radius: 6px;
    /* Utiliser les styles .btn existants */
}
```

**Justification :**
- Border-radius 12px : Harmonisé conteneurs/étapes
- États visuels clairs : active/completed
- Boutons harmonisés : Cohérence totale

---

## 📋 CHECKLIST CRÉATION AUDIT V5

### **Étape 1 : Reprendre Audit V4**
- [ ] Copier `AUDIT_COMPLET_V4.md` → `AUDIT_V5.md`
- [ ] Retirer mentions "COMPLET" et "FINAL" partout
- [ ] Mettre à jour en-tête avec "Version 5.0"

### **Étape 2 : Ajouter 7 nouvelles parties**
- [ ] Partie 10 : Modals (specs détaillées ci-dessus)
- [ ] Partie 11 : Alertes (specs détaillées ci-dessus)
- [ ] Partie 12 : Navigation (specs détaillées ci-dessus)
- [ ] Partie 13 : Formulaires (specs détaillées ci-dessus)
- [ ] Partie 14 : Tableaux (specs détaillées ci-dessus)
- [ ] Partie 15 : Barres de progression (specs détaillées ci-dessus)
- [ ] Partie 16 : Primo assistant (specs détaillées ci-dessus)

### **Étape 3 : Mettre à jour sections finales**
- [ ] Checklist validation (16 sections au lieu de 9)
- [ ] Tableau récapitulatif (16 composants)
- [ ] Notes pour Claude Code (mentionner 16 parties)

### **Étape 4 : Créer modules HTML manquants**
Pour chaque nouvelle partie, créer un module HTML harmonisé :
- [ ] `03d-modals-v2-harmonise.html`
- [ ] `06c-alertes-v2-harmonise.html`
- [ ] `04a-navigation-v2-harmonise.html`
- [ ] `02b-formulaires-v2-harmonise.html`
- [ ] `03a-tableaux-v2-harmonise.html`
- [ ] `03c-barres-gradient-v2-harmonise.html`
- [ ] `07-primo-assistant-v2-harmonise.html`

### **Étape 5 : Vérification finale**
- [ ] Tous les 16 modules couverts
- [ ] Code AVANT/APRÈS pour chaque partie
- [ ] Tableau récapitulatif complet
- [ ] Aucune mention "complet" ou "final"

---

## 🎨 TEMPLATE POUR CHAQUE NOUVELLE PARTIE

Utilise ce template pour structurer chaque nouvelle partie :

```markdown
## PARTIE XX : [NOM COMPOSANT] ⭐ [PRIORITÉ]

### XX.1 : [Sous-composant 1]

**Fichier :** `[nom-fichier].html` ou `styles.css`

**AVANT :**
```css
[code actuel]
```

**APRÈS :**
```css
[code harmonisé]
```

**Changements :**
- [Changement 1]
- [Changement 2]
- [Changement 3]

**Justification :**
[Pourquoi ces changements]

### XX.2 : [Sous-composant 2]

[même structure]

---
```

---

## 📊 SYSTÈME DE RÉFÉRENCE

### **Border-radius (4 niveaux)**
```css
--radius-petit: 5px;    /* Badges Tétris */
--radius-moyen: 6px;    /* Boutons, inputs, alertes */
--radius-grand: 12px;   /* Conteneurs, modaux, cartes */
--radius-pill: 20px;    /* Pills badges pratique */
```

### **Box-shadow (5 niveaux)**
```css
--shadow-subtil: 0 1px 4px rgba(3, 46, 92, 0.1);      /* Sections, items */
--shadow-normal: 0 2px 8px rgba(3, 46, 92, 0.15);     /* Cartes, sidebars */
--shadow-prononce: 0 4px 12px rgba(3, 46, 92, 0.25);  /* En-tête, hover */
--shadow-fort: 0 8px 24px rgba(3, 46, 92, 0.3);       /* Modaux */
--shadow-inset: inset 0 1px 3px rgba(3, 46, 92, 0.08); /* Inputs, panneaux */
```

### **Padding (3 échelles Tétris)**
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

### **Gradients (direction unique)**
```css
/* TOUJOURS 135deg, TOUJOURS clair → foncé */
linear-gradient(135deg, [couleur-claire] 0%, [couleur-foncée] 100%)
```

---

## 🚀 INSTRUCTIONS POUR CLAUDE CODE

### **Mission principale**
Créer **AUDIT_V5.md** exhaustif (16 parties) en ajoutant 7 nouvelles parties pour les composants UI manquants.

### **Ordre d'exécution**
1. Lire ce document en ENTIER
2. Vérifier l'existence de `AUDIT_COMPLET_V4.md`
3. Copier V4 → V5
4. Ajouter Parties 10-16 (specs détaillées ci-dessus)
5. Mettre à jour checklist et tableau récap
6. Créer 7 modules HTML harmonisés (optionnel mais recommandé)

### **Principes absolus**
- ✅ **Border-radius 12px** : Conteneurs (modaux, cartes, navigation, tableaux, wizard)
- ✅ **Border-radius 6px** : Petits éléments (boutons, inputs, alertes)
- ✅ **Border-radius 5px** : Badges Tétris uniquement
- ✅ **Border-radius 20px** : Pills uniquement
- ✅ **Gradients 135deg** : TOUJOURS clair → foncé
- ✅ **Box-shadow** : Utiliser les 5 niveaux définis
- ✅ **Padding harmonisé** : Suivre les 3 échelles Tétris
- ✅ **Color-mix 9%** : Pour tous les fonds teintés

### **Code AVANT/APRÈS obligatoire**
Chaque partie DOIT contenir :
- Code AVANT (état actuel)
- Code APRÈS (harmonisé)
- Liste des changements
- Justification

### **Validation finale**
- [ ] 16 parties dans l'audit
- [ ] Tous les modules HTML couverts
- [ ] Tableau récapitulatif avec 16 lignes
- [ ] Checklist validation avec 16 sections
- [ ] Aucune mention "complet" ou "final"

---

## 📁 FICHIERS DE RÉFÉRENCE

### **À lire absolument**
1. Ce document (REFERENCE_CLAUDE_CODE.md)
2. `AUDIT_COMPLET_V4.md` (base pour V5)
3. `LOCALISATION_TRAVAIL_HARMONISATION.md` (contexte)

### **Modules HTML harmonisés (exemples)**
- `02a-boutons-v2-harmonise.html` (structure type)
- `03b-cartes-sidebars-v2-harmonise.html` (structure type)
- `04b-entete-v3-gradients.html` (gradients + box-shadow)

### **Modules HTML à harmoniser**
- `03d-modals.html` → créer v2
- `06c-alertes.html` → créer v2
- `04a-navigation.html` → créer v2
- `02b-formulaires.html` → créer v2
- `03a-tableaux.html` → créer v2
- `03c-barres-gradient.html` → créer v2
- `07-primo-assistant.html` → créer v2

---

## ⚠️ ERREURS À ÉVITER

### **NE JAMAIS utiliser "complet" ou "final"**
❌ `AUDIT_COMPLET_V5.md`
❌ `AUDIT_FINAL_V5.md`
✅ `AUDIT_V5.md`

### **NE JAMAIS utiliser border-radius incohérent**
❌ Border-radius 8px pour conteneurs (ancien)
❌ Border-radius 4px pour inputs (ancien)
✅ Border-radius 12px pour conteneurs
✅ Border-radius 6px pour petits éléments

### **NE JAMAIS utiliser box-shadow alpha 0.05**
❌ `box-shadow: 0 2px 8px rgba(3, 46, 92, 0.05)` (trop subtil)
✅ `box-shadow: 0 2px 8px rgba(3, 46, 92, 0.15)` (Normal)

### **NE JAMAIS oublier les gradients 135deg**
❌ `linear-gradient(90deg, ...)`
❌ `linear-gradient(135deg, #032e5c 0%, #2a4a8a 100%)` (foncé → clair)
✅ `linear-gradient(135deg, #2a4a8a 0%, #032e5c 100%)` (clair → foncé)

---

## 📞 QUESTIONS FRÉQUENTES

### **Q1 : Dois-je créer les modules HTML v2 maintenant ?**
**R :** Priorité = AUDIT_V5.md. Les modules HTML v2 peuvent être créés après (optionnel mais recommandé pour documentation).

### **Q2 : Que faire si je trouve une incohérence dans V4 ?**
**R :** Corriger dans V5 et documenter le changement.

### **Q3 : Border-radius 12px ou 6px pour [composant] ?**
**R :** 
- 12px = Conteneurs, grandes surfaces (modaux, cartes, navigation)
- 6px = Petits éléments interactifs (boutons, inputs, alertes)

### **Q4 : Quel niveau de box-shadow pour [composant] ?**
**R :**
- Subtil = Sections, items liste
- Normal = Cartes, sidebars, tableaux
- Prononcé = En-tête, hover
- Fort = Modaux, dropdowns
- Inset = Inputs, panneaux, barres progression

---

## ✅ CRITÈRES DE SUCCÈS

### **Audit V5 est considéré réussi si :**
- ✅ 16 parties documentées (au lieu de 9)
- ✅ Tous les composants UI couverts
- ✅ Code AVANT/APRÈS pour chaque partie
- ✅ Justifications claires
- ✅ Tableau récapitulatif 16 lignes
- ✅ Checklist validation 16 sections
- ✅ Aucune mention "complet" ou "final"
- ✅ Specs cohérentes avec système existant

### **Documentation est considérée réussie si :**
- ✅ 7 nouveaux modules HTML v2 créés (optionnel)
- ✅ Modules suivent structure des v2 existants
- ✅ Exemples visuels interactifs
- ✅ Code CSS prêt à copier

---

## 🎯 RÉSUMÉ POUR DÉMARRAGE RAPIDE

**1. Lis ce document en entier** (tu y es !)

**2. Copie AUDIT_COMPLET_V4.md → AUDIT_V5.md**

**3. Ajoute 7 parties (10-16) avec specs ci-dessus**

**4. Mets à jour checklist et tableau récap**

**5. Crée modules HTML v2 (optionnel)**

**6. Valide avec critères de succès**

---

## 📦 LIVRABLES ATTENDUS

### **Obligatoire**
1. `AUDIT_V5.md` (16 parties complètes)

### **Recommandé**
2. `03d-modals-v2-harmonise.html`
3. `06c-alertes-v2-harmonise.html`
4. `04a-navigation-v2-harmonise.html`
5. `02b-formulaires-v2-harmonise.html`
6. `03a-tableaux-v2-harmonise.html`
7. `03c-barres-gradient-v2-harmonise.html`
8. `07-primo-assistant-v2-harmonise.html`

### **Optionnel**
9. Document récapitulatif des changements V4→V5

---

## 💬 MESSAGE FINAL DE GRÉGOIRE

> "Je ne veux jamais aller vite. Je veux que le travail soit pérenne."

Cette philosophie guide tout le projet. L'audit V5 doit être exhaustif, même si ça prend du temps. La qualité et la cohérence priment sur la vitesse.

---

**Fin du document de référence**  
**Date :** 2 janvier 2026  
**Version :** 1.0  
**Pour :** Claude Code (prise de relai)

**Prêt à créer AUDIT_V5.md ! 🚀**