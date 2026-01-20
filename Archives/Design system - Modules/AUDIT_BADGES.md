# AUDIT_BADGES.md - Uniformisation style "Compact Tétris"

**Date :** 2 janvier 2026  
**Responsable :** Grégoire  
**Fichier cible :** `styles.css`  
**Objectif :** Uniformiser TOUS les badges avec le style "Compact Tétris"

---

## 📋 SPÉCIFICATIONS TÉTRIS (à appliquer partout)

### Variables CSS recommandées

```css
/* === VARIABLES BADGES TÉTRIS === */
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

## 🎯 MODIFICATIONS À APPLIQUER

### 1. BADGES ABSENCE / RETARD

**Classes concernées :**
- `.badge-absence`
- `.badge-absence-complete`
- `.badge-absence-partielle`
- `.badge-absence-date`
- `.badge-absence-heures`

**Modifications :**

```css
/* AVANT */
.badge-absence {
    padding: 4px 6px;
    border-radius: 8px;
    gap: 6px;
}

.badge-absence-date {
    font-size: 0.85rem;
}

.badge-absence-heures {
    padding: 2px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
}

/* APRÈS (Tétris) */
.badge-absence {
    padding: 3px 8px;
    border-radius: 5px;
    gap: 5px;
}

.badge-absence-date {
    font-size: 0.75rem;
}

.badge-absence-heures {
    padding: 2px 6px;
    font-size: 0.7rem;
    border-radius: 3px;
}
```

---

### 2. BADGE INTERVENTION RÀI

**Classes concernées :**
- `.badge-intervention-rai`
- `.badge-intervention-vert`

**Modifications :**

```css
/* AVANT */
.badge-intervention-rai {
    padding: 4px 6px;
    border-radius: 8px;
    gap: 6px;
}

/* APRÈS (Tétris) */
.badge-intervention-rai {
    padding: 3px 8px;
    border-radius: 5px;
    gap: 5px;
}

.badge-intervention-rai .badge-absence-date {
    font-size: 0.75rem;
}

.badge-intervention-rai .badge-absence-heures {
    padding: 2px 6px;
    font-size: 0.7rem;
    border-radius: 3px;
}
```

---

### 3. BADGES ARTEFACTS

**Classes concernées :**
- `.badge-artefact`
- `.badge-artefact-titre`
- `.badge-artefact-note`
- `.badge-artefact-non-remis`

**Modifications :**

```css
/* AVANT */
.badge-artefact {
    padding: 4px 6px;
    border-radius: 8px;
    gap: 6px;
}

.badge-artefact-titre {
    font-size: 0.85rem;
}

.badge-artefact-note {
    padding: 2px 8px;
    font-size: 0.85rem;
    border-radius: 4px;
}

/* APRÈS (Tétris) */
.badge-artefact {
    padding: 3px 8px;
    border-radius: 5px;
    gap: 5px;
}

.badge-artefact-titre {
    font-size: 0.75rem;
}

.badge-artefact-note {
    padding: 2px 6px;
    font-size: 0.7rem;
    border-radius: 3px;
}
```

**Badges non remis :**

```css
/* AVANT */
.badge-artefact-non-remis {
    padding: 4px 6px;
    border-radius: 8px;
    gap: 6px;
}

/* APRÈS (Tétris) */
.badge-artefact-non-remis {
    padding: 3px 8px;
    border-radius: 5px;
    gap: 5px;
}
```

---

### 4. BADGES JETONS (3 types)

**Classes concernées :**
- `.badge-jeton-delai-wrapper`
- `.badge-jeton-reprise-wrapper`
- `.badge-jeton-reprise-ciblee-wrapper`
- `.badge-jeton-titre`
- `.badge-jeton-numero`

**Modifications :**

```css
/* AVANT */
.badge-jeton-delai-wrapper,
.badge-jeton-reprise-wrapper,
.badge-jeton-reprise-ciblee-wrapper {
    padding: 2px 6px;
    border-radius: 8px;
    gap: 8px;
}

.badge-jeton-titre {
    font-size: 0.7rem;
}

.badge-jeton-numero {
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 4px;
}

/* APRÈS (Tétris) */
.badge-jeton-delai-wrapper,
.badge-jeton-reprise-wrapper,
.badge-jeton-reprise-ciblee-wrapper {
    padding: 3px 8px;
    border-radius: 5px;
    gap: 5px;
}

.badge-jeton-titre {
    font-size: 0.75rem;
}

.badge-jeton-numero {
    padding: 2px 6px;
    font-size: 0.7rem;
    border-radius: 3px;
}
```

---

### 5. BADGES STATUT RÀI / PATTERN

**Classes concernées :**
- `.badge-pattern-stable`
- `.badge-pattern-blocage-emergent`
- `.badge-pattern-blocage-critique`
- `.badge-pattern-progression`
- `.badge-pattern-defi-specifique`

**Modifications :**

```css
/* AVANT */
.badge-pattern-stable,
.badge-pattern-blocage-emergent,
.badge-pattern-blocage-critique {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
}

/* APRÈS (Tétris) */
.badge-pattern-stable,
.badge-pattern-blocage-emergent,
.badge-pattern-blocage-critique,
.badge-pattern-progression,
.badge-pattern-defi-specifique {
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
}
```

---

### 6. BADGES NIVEAU RÀI

**Classes concernées :**
- `.badge-rai-1`
- `.badge-rai-2`
- `.badge-rai-3`

**Modifications :**

```css
/* AVANT */
.badge-rai-1,
.badge-rai-2,
.badge-rai-3 {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
}

/* APRÈS (Tétris) */
.badge-rai-1,
.badge-rai-2,
.badge-rai-3 {
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
}
```

---

### 7. BADGES PRATIQUE (SOM / PAN)

**Classes concernées :**
- `.badge-pratique`
- `.badge-pratique-compact`

**Modifications :**

```css
/* AVANT */
.badge-pratique {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    gap: 4px;
}

.badge-pratique-compact {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    gap: 4px;
}

/* APRÈS (Tétris) */
.badge-pratique {
    padding: 3px 10px;
    border-radius: 20px;  /* Conserve le style pill */
    font-size: 0.75rem;
    gap: 4px;
}

.badge-pratique-compact {
    padding: 2px 8px;
    border-radius: 12px;  /* Conserve le style pill compact */
    font-size: 0.7rem;
    gap: 4px;
}
```

---

### 8. BADGES SYSTÈME (analyse, risque)

**Classes concernées :**
- `.badge-sys`
- `.badge-analyse`
- `.badge-rai-analyse-1`, `.badge-rai-analyse-2`, `.badge-rai-analyse-3`
- `.badge-risque-analyse-*`

**Modifications :**

```css
/* AVANT */
.badge-sys,
.badge-analyse {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.badge-analyse-count {
    padding: 2px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
}

/* APRÈS (Tétris) */
.badge-sys,
.badge-analyse {
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
    gap: 5px;
}

.badge-analyse-count {
    padding: 2px 6px;
    font-size: 0.7rem;
    border-radius: 3px;
}
```

---

### 9. BADGES COMPLETION

**Classes concernées :**
- `.badge-completion-remis`
- `.badge-completion-non-remis`
- `.badge-completion-titre`

**Modifications :**

```css
/* AVANT */
.badge-completion-remis,
.badge-completion-non-remis {
    padding: 4px 6px;
    border-radius: 8px;
    gap: 8px;
}

.badge-completion-titre {
    font-size: 0.85rem;
}

/* APRÈS (Tétris) */
.badge-completion-remis,
.badge-completion-non-remis {
    padding: 3px 8px;
    border-radius: 5px;
    gap: 5px;
}

.badge-completion-titre {
    font-size: 0.75rem;
}
```

---

### 10. BADGES STATUT INTERVENTION

**Classes concernées :**
- `.badge-statut-planifiee`
- `.badge-statut-en-cours`
- `.badge-statut-completee`

**Modifications :**

```css
/* AVANT */
.badge-statut-planifiee,
.badge-statut-en-cours,
.badge-statut-completee {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
}

/* APRÈS (Tétris) */
.badge-statut-planifiee,
.badge-statut-en-cours,
.badge-statut-completee {
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
}
```

---

### 11. BADGE TYPE INTERVENTION

**Classes concernées :**
- `.badge-type-intervention`

**Modifications :**

```css
/* AVANT */
.badge-type-intervention {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
}

/* APRÈS (Tétris) */
.badge-type-intervention {
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
}
```

---

### 12. BADGES ENGAGEMENT

**Classes concernées :**
- `.badge-engagement-tres-favorable`
- `.badge-engagement-favorable`
- `.badge-engagement-modere`
- `.badge-engagement-fragile`
- `.badge-engagement-insuffisant`

**Modifications :**

```css
/* AVANT */
.badge-engagement-* {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
}

/* APRÈS (Tétris) */
.badge-engagement-tres-favorable,
.badge-engagement-favorable,
.badge-engagement-modere,
.badge-engagement-fragile,
.badge-engagement-insuffisant {
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
}
```

---

### 13. BADGE INFO (générique)

**Classes concernées :**
- `.badge-info`

**Modifications :**

```css
/* AVANT */
.badge-info {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
}

/* APRÈS (Tétris) */
.badge-info {
    padding: 3px 10px;
    border-radius: 12px;  /* Conserve style légèrement arrondi */
    font-size: 0.75rem;
}
```

---

## ✅ CHECKLIST VALIDATION

Après avoir appliqué toutes les modifications, vérifier :

- [ ] Tous les badges ont `padding: 3px 8px` (principal)
- [ ] Tous les badges internes ont `padding: 2px 6px`
- [ ] Tous les badges ont `font-size: 0.75rem` (principal)
- [ ] Tous les badges internes ont `font-size: 0.7rem`
- [ ] Tous les badges ont `border-radius: 5px` (sauf pills)
- [ ] Tous les badges internes ont `border-radius: 3px`
- [ ] Tous les gaps sont à `5px`
- [ ] Les badges pratique conservent `border-radius: 20px` (style pill)
- [ ] Tous les badges ont `font-weight: 600`
- [ ] Tous les badges ont `line-height: 1.2`

---

## 🎯 RÉSULTAT ATTENDU

**Avant :**
- Hauteurs variables : 26-30px
- Font-sizes : 0.7rem, 0.8rem, 0.85rem
- Border-radius : 4px, 8px, 12px, 20px
- Gaps : 4px, 6px, 8px
- **Incohérent et difficile à maintenir**

**Après (Tétris) :**
- Hauteur uniforme : ~24px
- Font-size : 0.75rem (principal), 0.7rem (interne)
- Border-radius : 5px (principal), 3px (interne)
- Gap : 5px partout
- **Cohérent, compact, empilable**

---

## 📊 IMPACT

- **+15% d'espace économisé**
- **Cohérence visuelle totale**
- **Style "empilable Tétris"**
- **Lisibilité préservée**
- **Maintenance simplifiée**

---

**Date de validation :** _________________  
**Signature :** Grégoire
