# AUDIT GLOBAL - Harmonisation complète UI
# Date : 2 janvier 2026
# Responsable : Grégoire
# Fichier cible : styles.css

---

## 📋 OBJECTIF

Harmoniser TOUS les éléments UI avec un système cohérent à 3 échelles :
- **Compact** : Badges Tétris (3-8px, radius 5px)
- **Moyen** : Boutons, Badges matériel (6-15px, radius 6px/20px)
- **Large** : Cartes, Sidebars, Bibliothèques (15px, radius 8px)

---

## 🎯 PARTIE 1 : BADGES TÉTRIS

### Variables CSS à ajouter

```css
:root {
    /* Badges Compact */
    --badge-padding: 3px 8px;
    --badge-font-size: 0.75rem;
    --badge-border-radius: 5px;
    --badge-gap: 5px;
    
    /* Badges internes */
    --badge-compact-padding: 2px 6px;
    --badge-compact-font-size: 0.7rem;
    --badge-compact-border-radius: 3px;
    
    /* Badges pill Moyen */
    --badge-pill-padding: 6px 15px;
    --badge-pill-font-size: 0.85rem;
    --badge-pill-border-radius: 20px;
    
    /* Commun */
    --badge-font-weight: 600;
    --badge-line-height: 1.2;
    --badge-transition: all 0.2s ease;
}
```

### Modifications badges (13 sections)

Voir fichier **AUDIT_BADGES.md** pour le détail complet de :
1. Badges Absence/Retard
2. Badge Intervention RàI
3. Badges Artefacts
4. Badges Jetons (3 types)
5. Badges Statut RàI
6. Badges Niveau RàI
7. Badges Pratique (SOM/PAN)
8. Badges Système
9. Badges Completion
10. Badges Statut Intervention
11. Badge Type Intervention
12. Badges Engagement
13. Badge Info

**Règle générale :**
- Padding : `3px 8px` → `0.75rem` → radius `5px`
- Padding interne : `2px 6px` → `0.7rem` → radius `3px`

---

## 🎯 PARTIE 2 : BADGES MATÉRIEL PÉDAGOGIQUE (NOUVEAU)

### Classes concernées

```css
/* Chercher dans styles.css les classes suivantes :
   .badge-criteres
   .badge-materiel
   .badge-compteur
   Ou tout badge utilisé dans les bibliothèques/cartouches
*/
```

### Modifications

```css
/* AVANT */
.badge-criteres,
.badge-materiel {
    padding: 8px 20px;
    border-radius: 25px;
    background: var(--bleu-principal);
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
}

/* APRÈS (Tétris - Échelle Moyenne pill) */
.badge-criteres,
.badge-materiel {
    padding: 6px 15px;
    border-radius: 20px;
    background: var(--bleu-principal);
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.2;
    transition: all 0.2s ease;
}

.badge-criteres:hover,
.badge-materiel:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(3, 46, 92, 0.2);
}
```

**Changements :**
- Padding : 8px 20px → **6px 15px**
- Border-radius : 25px → **20px**
- Font-size : 0.9rem → **0.85rem**
- Ajout : line-height 1.2, transition, hover

---

## 🎯 PARTIE 3 : SIDEBARS BLANCHES

### Classes concernées

```css
.sidebar-navigation
.sidebar-cartouches
.profil-sidebar
.item-cartouche-banque
.sidebar-item
```

### Modifications

```css
/* AVANT */
.sidebar-navigation,
.sidebar-cartouches,
.profil-sidebar {
    background: var(--bleu-pale);
    border: 1px solid var(--bleu-leger);
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* APRÈS (Blanc - Échelle Large) */
.sidebar-navigation,
.sidebar-cartouches,
.profil-sidebar {
    background: white;
    border: 1px solid var(--bleu-leger); /* Conservé */
    border-radius: 8px; /* Conservé */
    padding: 15px; /* Conservé */
    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.08);
}
```

**Changement principal :**
- Background : `var(--bleu-pale)` → **`white`**
- Box-shadow renforcée : `0 1px 3px` → `0 2px 8px rgba(3, 46, 92, 0.08)`

### Items sidebar

```css
/* AVANT */
.sidebar-item,
.item-cartouche-banque {
    padding: 12px;
    border-radius: 6px;
}

/* APRÈS (Échelle Moyenne) */
.sidebar-item,
.item-cartouche-banque {
    padding: 10px 15px;
    border-radius: 6px; /* Conservé */
}
```

**Changement :**
- Padding : `12px` → **`10px 15px`** (aligné sur boutons)

---

## 🎯 PARTIE 4 : BIBLIOTHÈQUES / CARTES BLANCHES

### Classes concernées

```css
.carte-bibliotheque
.bibliotheque-item
.carte
.profil-carte
.profil-carte-simple
.carte-metrique
```

### Modifications

```css
/* AVANT (variable) */
.carte-bibliotheque {
    background: var(--bleu-pale);
    border: 3px solid var(--bleu-moyen);
    border-radius: 16px;
    padding: 25px;
}

.profil-carte {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
}

.carte {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 15px;
}

/* APRÈS (Unifié - Échelle Large) */
.carte-bibliotheque,
.bibliotheque-item,
.carte,
.profil-carte,
.profil-carte-simple,
.carte-metrique {
    background: white;
    border: 2px solid var(--bleu-leger); /* #6b85b3 */
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(3, 46, 92, 0.08);
    transition: all 0.2s ease;
}

.carte-bibliotheque:hover {
    border-color: var(--bleu-moyen);
    box-shadow: 0 4px 12px rgba(3, 46, 92, 0.12);
    transform: translateY(-2px);
}
```

**Changements principaux :**
- Background : Toujours **`white`**
- Border : Uniformisé **`2px solid var(--bleu-leger)`**
- Border-radius : Uniformisé **`8px`** (pas 6px, pas 16px)
- Padding : Uniformisé **`15px`** (pas 20px, pas 25px)
- Box-shadow : Uniformisée
- Hover ajouté pour bibliothèques

**IMPORTANT :** Supprimer toutes les variations de padding (20px, 25px) et de radius (6px, 16px).

---

## 🎯 PARTIE 5 : BOUTONS HARMONISÉS

### Classes concernées

```css
.btn
.btn-principal
.btn-secondaire
.btn-ajouter
.btn-modifier
.btn-confirmer
.btn-annuler
.btn-supprimer
.btn-partager
.btn-retirer
```

### Modifications

```css
/* AVANT */
.btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
}

/* APRÈS (Échelle Moyenne) */
.btn {
    padding: 10px 15px;
    border-radius: 6px; /* Conservé */
    font-size: 0.9rem; /* Conservé */
    font-weight: 600; /* Conservé */
    line-height: 1.2;
    transition: all 0.2s ease;
}
```

**Changement principal :**
- Padding horizontal : `20px` → **`15px`**
- Ajout : line-height 1.2, transition

---

## 🎯 PARTIE 6 : VÉRIFICATIONS FINALES

### Checklist complète

#### Badges Tétris
- [ ] Tous les badges principaux : `padding: 3px 8px`
- [ ] Tous les badges internes : `padding: 2px 6px`
- [ ] Font-size : `0.75rem` (principal), `0.7rem` (interne)
- [ ] Border-radius : `5px` (principal), `3px` (interne)
- [ ] Gap : `5px` partout

#### Badges Matériel
- [ ] Padding : `6px 15px`
- [ ] Font-size : `0.85rem`
- [ ] Border-radius : `20px`
- [ ] Hover : transform + shadow

#### Sidebars
- [ ] Background : `white` (pas var(--bleu-pale))
- [ ] Border : `1px solid var(--bleu-leger)`
- [ ] Border-radius : `8px`
- [ ] Padding : `15px`
- [ ] Items sidebar : `padding: 10px 15px`

#### Bibliothèques / Cartes
- [ ] Toutes : `background: white`
- [ ] Toutes : `border: 2px solid var(--bleu-leger)`
- [ ] Toutes : `border-radius: 8px` (pas 6px, pas 16px)
- [ ] Toutes : `padding: 15px` (pas 20px, pas 25px)
- [ ] Hover bibliothèques : ajouté

#### Boutons
- [ ] Padding : `10px 15px` (pas 10px 20px)
- [ ] Border-radius : `6px`
- [ ] Font-size : `0.9rem`

---

## 📊 RÉSUMÉ : Système à 3 échelles

| Échelle | Padding | Font | Radius | Usage |
|---------|---------|------|--------|-------|
| **Compact** | 3px 8px<br>2px 6px | 0.75rem<br>0.7rem | 5px<br>3px | Badges Tétris |
| **Moyen** | 10px 15px<br>6px 15px | 0.9rem<br>0.85rem | 6px<br>20px | Boutons<br>Badges matériel |
| **Large** | 15px | 1rem | 8px | Sidebars<br>Cartes<br>Bibliothèques |

**Progression harmonieuse :** 5px → 6px → 8px (border-radius)

---

## ✅ MODIFICATIONS APPLIQUÉES PAR

Date : _________________  
Signature : _________________  
Validation : Grégoire

---

## 🚨 NOTES IMPORTANTES

1. **Chercher TOUTES les occurrences** de :
   - `background: var(--bleu-pale)` dans sidebars → Remplacer par `white`
   - `padding: 20px` dans cartes → Remplacer par `15px`
   - `padding: 25px` dans bibliothèques → Remplacer par `15px`
   - `border-radius: 16px` → Remplacer par `8px`
   - `border-radius: 25px` dans badges matériel → Remplacer par `20px`
   - `padding: 8px 20px` dans badges matériel → Remplacer par `6px 15px`
   - `padding: 10px 20px` dans boutons → Remplacer par `10px 15px`

2. **Tester après modifications** :
   - Affichage sidebars (blanches sur fond bleu)
   - Affichage bibliothèques (blanches, radius 8px)
   - Badges matériel (6px 15px, radius 20px)
   - Hover states (tous fonctionnels)

3. **Vérifier cohérence visuelle** :
   - Tous les conteneurs = blanc
   - Tous les radius Large = 8px
   - Tous les padding Large = 15px
   - Badges pill = radius 20px

---

**FIN DE L'AUDIT**
