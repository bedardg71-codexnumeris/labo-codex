# 🎯 SPECS TÉTRIS - Aide-mémoire rapide

## Variables CSS à ajouter dans styles.css

```css
/* === BADGES TÉTRIS === */
:root {
    /* Principal */
    --badge-padding: 3px 8px;
    --badge-font-size: 0.75rem;
    --badge-border-radius: 5px;
    --badge-gap: 5px;
    
    /* Interne */
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

## 📐 Dimensions Tétris

| Élément | Valeur | Utilisation |
|---------|--------|-------------|
| **Padding principal** | `3px 8px` | Tous les badges externes |
| **Padding interne** | `2px 6px` | Badges imbriqués (heures, notes, numéros) |
| **Font principal** | `0.75rem` (12px) | Texte principal des badges |
| **Font interne** | `0.7rem` (11.2px) | Texte des badges imbriqués |
| **Border-radius** | `5px` | Tous les badges (sauf pills) |
| **Radius interne** | `3px` | Badges imbriqués |
| **Gap** | `5px` | Espacement entre éléments du badge |
| **Font-weight** | `600` | Semi-bold (tous les badges) |
| **Line-height** | `1.2` | Hauteur de ligne compacte |

---

## 🎨 Exceptions

### Badges pratique (SOM/PAN)
- Border-radius : `20px` (style pill conservé)
- Padding : `3px 10px` (légèrement plus large pour le pill)

### Badge info générique
- Border-radius : `12px` (style légèrement arrondi)
- Padding : `3px 10px`

---

## ✅ Règle simple à retenir

**TOUS les badges :**
```css
padding: 3px 8px;
font-size: 0.75rem;
border-radius: 5px;
gap: 5px;
```

**TOUS les badges internes :**
```css
padding: 2px 6px;
font-size: 0.7rem;
border-radius: 3px;
```

**Exceptions :** Pills conservent border-radius arrondi (20px ou 12px)

---

## 📊 Résultat attendu

- ✅ Hauteur uniforme : **~24px** (vs 26-30px avant)
- ✅ Style compact et empilable
- ✅ Lisibilité préservée
- ✅ **+15% d'espace économisé**
- ✅ Cohérence visuelle totale
