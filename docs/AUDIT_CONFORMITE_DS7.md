# Audit de Conformite - Design System v7

**Date :** 19 janvier 2026
**Reference :** `Design system - Modules/REFERENCE_CLAUDE_CODE.md`

---

## Resume executif

| Categorie | Conformite | Ecarts |
|-----------|------------|--------|
| Border-radius (styles.css) | Partiel | 5 valeurs non conformes |
| Box-shadow (styles.css) | Partiel | ~25 utilisations de rgba(0,0,0) |
| Gradients (styles.css) | OK | Direction 135deg respectee |
| Styles inline (index.html) | Non conforme | 1092 attributs style= |

---

## Specifications de reference

### Border-radius (4 niveaux autorises)
```css
--radius-petit: 5px;    /* Badges Tetris */
--radius-moyen: 6px;    /* Boutons, inputs, alertes */
--radius-grand: 12px;   /* Conteneurs, modaux, cartes */
--radius-pill: 20px;    /* Pills badges pratique */
```

### Box-shadow (couleur obligatoire)
```css
/* TOUJOURS utiliser rgba(3, 46, 92, X) et NON rgba(0, 0, 0, X) */
--shadow-subtil: 0 1px 4px rgba(3, 46, 92, 0.1);
--shadow-normal: 0 2px 8px rgba(3, 46, 92, 0.15);
--shadow-prononce: 0 4px 12px rgba(3, 46, 92, 0.25);
--shadow-fort: 0 8px 24px rgba(3, 46, 92, 0.3);
--shadow-inset: inset 0 1px 3px rgba(3, 46, 92, 0.08);
```

---

## Ecarts detectes dans styles.css

### 1. Border-radius non conformes

| Ligne | Valeur actuelle | Classe/Selecteur | Valeur attendue |
|-------|-----------------|------------------|-----------------|
| 469 | 10px | `.logo` | 12px (conteneur) |
| 2053 | 3px | `.badge-analyse-count` | 5px (badge Tetris) |
| 4819 | 3px | `.portfolio-artefact-checkbox-vide` | 5px ou 6px |
| 6113 | 3px | (a verifier contexte) | 5px minimum |
| 8980, 8999 | 15px | `.barre-patterns`, `.barre-patterns-overlay` | 20px (pill) |
| 9007, 9026 | 15px | `.barre-rai`, `.barre-rai-overlay` | 20px (pill) |

### 2. Box-shadow avec rgba(0,0,0) - A CORRIGER

**Lignes concernees (25 occurrences) :**

```
981:    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
4389:   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
7663:   box-shadow: 0 2px 4px rgba(0,0,0,0.2);
7685:   box-shadow: 0 3px 6px rgba(0,0,0,0.3);
8283:   box-shadow: 0 2px 4px rgba(0,0,0,0.3);
8293:   box-shadow: 0 3px 6px rgba(0,0,0,0.4);
8735:   box-shadow: 0 1px 2px rgba(0,0,0,0.15);
8743:   box-shadow: 0 2px 6px rgba(0,0,0,0.3);
8962:   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
8989:   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
9016:   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
9049:   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
9389:   box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
9480:   background: rgba(0, 0, 0, 0.5);  /* overlay modal */
9647:   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
9974:   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
```

**Note :** Certains usages de rgba(0,0,0) sont acceptables pour :
- Overlays de modales (fond semi-transparent)
- Effets de profondeur specifiques

### 3. Gradients - CONFORME

Aucun gradient avec direction non conforme detecte. Tous utilisent 135deg.

---

## Ecarts detectes dans index.html (styles inline)

### Statistiques generales
- **Total styles inline :** 1092 attributs `style=`
- **Styles avec border-radius :** ~50 occurrences

### Problemes critiques

#### Border-radius 8px (non conforme - devrait etre 6px ou 12px)
```
11 occurrences de: border-radius: 8px
Exemple: style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
```

#### Border-radius 4px (non conforme - devrait etre 5px ou 6px)
```
~7 occurrences de: border-radius: 4px
Exemples:
- style="margin-bottom: 15px; padding: 12px; background: var(--orange-tres-pale); border-left: 4px solid var(--orange-accent); border-radius: 4px;"
- style="background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border-left: 3px solid #ffc107; border-radius: 4px; ..."
```

#### Box-shadow avec rgba(0,0,0) inline
```
12 occurrences de: box-shadow: ... rgba(0,0,0,0.1)
Devrait utiliser: rgba(3, 46, 92, 0.1)
```

### Recommandation : Creer des classes CSS

Les styles inline repetitifs devraient etre extraits en classes :

```css
/* A ajouter dans styles.css */

.info-box-warning {
    margin-bottom: 15px;
    padding: 12px;
    background: var(--orange-tres-pale);
    border-left: 4px solid var(--orange-accent);
    border-radius: 6px;  /* Corrige de 4px */
}

.info-box-blue {
    margin-bottom: 15px;
    padding: 12px;
    background: var(--bleu-tres-pale);
    border-radius: 6px;
}

.img-responsive {
    max-width: 100%;
    border-radius: 6px;  /* Corrige de 8px */
    box-shadow: var(--shadow-normal);  /* Utilise variable */
}
```

---

## Actions recommandees

### Priorite HAUTE

1. **Corriger border-radius dans styles.css**
   - Ligne 469 : `.logo` → 12px
   - Lignes 8980-9026 : barres → 20px (pill)
   - Lignes 2053, 4819, 6113 : badges → 5px

2. **Remplacer rgba(0,0,0) par rgba(3,46,92) dans styles.css**
   - 25 occurrences a corriger
   - Conserver rgba(0,0,0) uniquement pour overlays de modales

### Priorite MOYENNE

3. **Creer classes CSS pour patterns repetitifs inline**
   - `.info-box-warning`, `.info-box-blue`, `.info-box-success`
   - `.img-responsive`

4. **Corriger les styles inline dans index.html**
   - Remplacer `border-radius: 8px` par `6px` ou `12px` selon contexte
   - Remplacer `border-radius: 4px` par `5px` ou `6px`

### Priorite BASSE

5. **Reduire le nombre de styles inline**
   - 1092 attributs style= est excessif
   - Extraire progressivement vers styles.css

---

## Validation

Pour verifier la conformite apres corrections :

```bash
# Border-radius non conformes (devrait retourner 0)
grep -E 'border-radius:\s*(3|4|7|8|9|10|11|13|14|15)px' styles.css

# Box-shadow avec noir (devrait retourner seulement overlays)
grep 'rgba(0,\s*0,\s*0' styles.css | grep -v overlay | grep -v background
```

---

## Annexe : Variables CSS disponibles

```css
/* Border-radius */
var(--radius-petit)     /* 5px */
var(--radius-moyen)     /* 6px */
var(--radius-grand)     /* 12px */
var(--radius-pill)      /* 20px */

/* Box-shadow */
var(--shadow-subtil)    /* 0 1px 4px rgba(3, 46, 92, 0.1) */
var(--shadow-normal)    /* 0 2px 8px rgba(3, 46, 92, 0.15) */
var(--shadow-prononce)  /* 0 4px 12px rgba(3, 46, 92, 0.25) */
var(--shadow-fort)      /* 0 8px 24px rgba(3, 46, 92, 0.3) */
var(--shadow-inset)     /* inset 0 1px 3px rgba(3, 46, 92, 0.08) */
```

---

**Fin du rapport d'audit**
