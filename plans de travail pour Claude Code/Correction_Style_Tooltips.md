# Correction du style des tooltips — Positionnement, amorce et comportement

**Problèmes identifiés** :
1. Le phylactère est trop éloigné de l'élément survolé, avec une flèche trop courte
2. Le tooltip se place souvent en dessous de la cible, masquant l'interface voisine
3. Pas de masquage au clic — le tooltip reste affiché tant que la souris est sur l'élément

**Solutions retenues** :
- **Amorce allongée** : Triangle CSS pur de 12px au lieu du carré pivoté de 8px
- **Marge réduite** : 4px au lieu de 8px
- **Positionnement latéral préférentiel** : Droite → Gauche → Bas → Haut (au lieu de Bas → Haut → Droite → Gauche). La cible et son voisinage restent visibles.
- **Masquage instantané** : Disparition immédiate au clic ou au scroll, sans délai

---

## 1. Modification JS — tooltips.js — Constantes

```javascript
// AVANT
const MARGE = 8;                // px entre la bulle et l'élément

// APRÈS
const MARGE = 4;                // px entre la bulle et l'élément
```

---

## 2. Modification JS — tooltips.js — Fonction positionnerBulle()

Remplacer **entièrement** la fonction `positionnerBulle` :

```javascript
// AVANT — ordre : bas → haut → droite → gauche
// APRÈS — ordre : droite → gauche → bas → haut

/**
 * Calcule la position optimale de la bulle.
 * Priorité latérale : droite → gauche → bas → haut.
 * Le placement latéral évite de masquer l'interface sous/sur la cible.
 * @param {HTMLElement} cible
 * @param {HTMLElement} bulle
 */
function positionnerBulle(cible, bulle) {
    const rect = cible.getBoundingClientRect();
    const bulleRect = bulle.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;
    let position = 'droite';

    // --- 1. Essayer À DROITE ---
    left = rect.right + MARGE;
    top = rect.top + (rect.height / 2) - (bulleRect.height / 2);

    if (left + bulleRect.width > vw) {
        // --- 2. Essayer À GAUCHE ---
        left = rect.left - bulleRect.width - MARGE;
        position = 'gauche';

        if (left < 0) {
            // --- 3. Essayer EN BAS ---
            left = rect.left + (rect.width / 2) - (bulleRect.width / 2);
            top = rect.bottom + MARGE;
            position = 'bas';

            if (top + bulleRect.height > vh) {
                // --- 4. Essayer EN HAUT ---
                top = rect.top - bulleRect.height - MARGE;
                position = 'haut';
            }
        }
    }

    // Contraindre dans le viewport
    left = Math.max(MARGE, Math.min(left, vw - bulleRect.width - MARGE));
    top = Math.max(MARGE, Math.min(top, vh - bulleRect.height - MARGE));

    bulle.style.top = `${top + window.scrollY}px`;
    bulle.style.left = `${left + window.scrollX}px`;
    bulle.dataset.position = position;
}
```

**Logique** : On tente d'abord le placement latéral (droite puis gauche) parce que ça laisse la cible et les éléments au-dessus/en dessous entièrement visibles. Le placement vertical (bas puis haut) n'est utilisé qu'en dernier recours, quand l'espace horizontal est insuffisant des deux côtés.

---

## 3. Modification JS — tooltips.js — Masquage instantané

### 3a. Ajouter un écouteur de clic

Après les écouteurs existants (`mouseenter`, `mouseleave`, `scroll`, `resize`), ajouter :

```javascript
// AJOUTER — masquage instantané au clic
document.addEventListener('click', function() {
    clearTimeout(timerAffichage);
    masquer();
}, true);
```

### 3b. Rendre le scroll instantané (déjà en place)

Le `scroll` appelle déjà `masquer()` directement (sans délai). Aucun changement nécessaire.

### 3c. Optionnel — masquage à la touche Escape

```javascript
// OPTIONNEL — masquage au clavier
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        clearTimeout(timerAffichage);
        masquer();
    }
});
```

---

## 4. Modification CSS — tooltips.css — Flèche

Remplacer **entièrement** le bloc `.tooltip-fleche` et ses variantes positionnelles :

```css
/* SUPPRIMER l'ancien bloc :
.tooltip-fleche {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #1a1a2e;
    transform: rotate(45deg);
}
... et les 4 variantes [data-position] associées
*/

/* NOUVEAU — triangle CSS pur, amorce de 12px */

.tooltip-fleche {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
}

/* Bulle À DROITE de l'élément → flèche pointe vers la GAUCHE */
.tooltip-bulle[data-position="droite"] .tooltip-fleche {
    left: -12px;
    top: 50%;
    margin-top: -8px;
    border-width: 8px 12px 8px 0;
    border-color: transparent #1a1a2e transparent transparent;
}

/* Bulle À GAUCHE de l'élément → flèche pointe vers la DROITE */
.tooltip-bulle[data-position="gauche"] .tooltip-fleche {
    right: -12px;
    top: 50%;
    margin-top: -8px;
    border-width: 8px 0 8px 12px;
    border-color: transparent transparent transparent #1a1a2e;
}

/* Bulle SOUS l'élément → flèche pointe vers le HAUT (fallback) */
.tooltip-bulle[data-position="bas"] .tooltip-fleche {
    top: -12px;
    left: 50%;
    margin-left: -8px;
    border-width: 0 8px 12px 8px;
    border-color: transparent transparent #1a1a2e transparent;
}

/* Bulle AU-DESSUS de l'élément → flèche pointe vers le BAS (fallback) */
.tooltip-bulle[data-position="haut"] .tooltip-fleche {
    bottom: -12px;
    left: 50%;
    margin-left: -8px;
    border-width: 12px 8px 0 8px;
    border-color: #1a1a2e transparent transparent transparent;
}
```

Note : les positions latérales (droite/gauche) sont listées en premier car elles seront les plus fréquentes.

---

## 5. Modification CSS — tooltips.css — Animation d'entrée

L'animation actuelle (`translateY(4px)`) est pensée pour un placement vertical. Avec le placement latéral préférentiel, il faut adapter la direction de l'animation.

```css
/* AVANT :
.tooltip-bulle {
    ...
    transform: translateY(4px);
    ...
}
*/

/* APRÈS — animation neutre (fondu seul, sans déplacement directionnel) */
.tooltip-bulle {
    position: absolute;
    z-index: 10000;
    padding: 10px 14px;
    border-radius: 6px;
    background: #1a1a2e;
    color: #e0e0e0;
    font-size: 0.85rem;
    line-height: 1.45;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    opacity: 0;
    transform: scale(0.97);
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-bulle.tooltip-visible {
    opacity: 1;
    transform: scale(1);
}
```

Justification : un léger `scale(0.97 → 1)` fonctionne quelle que soit la direction de placement, contrairement à `translateY` qui ne convient qu'au placement vertical. La transition est aussi raccourcie à 0.15s pour un rendu plus réactif.

---

## 6. Surbrillance de la cible — Bordure orange pulsante

Quand le tooltip s'affiche, l'élément survolé reçoit une bordure lumineuse orange qui pulse doucement. Cela lève toute ambiguïté sur la cible du tooltip, surtout en placement latéral où la flèche seule peut être insuffisante pour identifier l'élément concerné.

### 6a. CSS — tooltips.css — Animation et classe de surbrillance

**Historique du bug** :
1. Version initiale (`box-shadow`) : contour rogné sur les 4 côtés des accordéons Trimestre à cause de `overflow: hidden` sur le parent.
2. Version 2 (`outline` + `outline-offset: 2px`) : amélioration — haut et bas visibles, mais Safari rogne encore les côtés gauche et droit quand l'élément est à ras bord de son parent.
3. **Version actuelle (`outline` + `outline-offset: -2px`)** : contour dessiné **à l'intérieur** de l'élément. Rien ne dépasse, donc rien à rogner. Garanti visible sur les 4 côtés dans tous les contextes.

```css
/* --- Surbrillance de la cible du tooltip --- */

@keyframes tooltip-pulse {
    0%, 100% { outline-color: color-mix(in srgb, var(--orange-accent, #ff9800) 40%, transparent); }
    50%      { outline-color: color-mix(in srgb, var(--orange-accent, #ff9800) 80%, transparent); }
}

.tooltip-cible-active {
    outline: 4px solid var(--orange-accent, #ff9800);
    outline-offset: -4px;
    box-shadow: inset 0 0 0 9999px color-mix(in srgb, var(--orange-accent, #ff9800) 15%, transparent);
    animation: tooltip-pulse 1.8s ease-in-out infinite;
    transition: outline-color 0.2s ease;
}
```

**Choix techniques** :

- `outline: 4px` (doublé, était 2px) : contour plus épais, bien visible même sur les en-têtes sombres.
- `outline-offset: -4px` (négatif, inset) : le contour est dessiné 4px **à l'intérieur** du bord de l'élément. Immunisé contre tout rognage par `overflow: hidden` car rien ne dépasse du box model.
- `box-shadow: inset 0 0 0 9999px ... 15%` : crée un voile orange à 15% d'opacité qui remplit l'intérieur de l'élément. Le `box-shadow inset` avec un `spread` énorme (9999px) couvre toute la surface. Dessiné par-dessus le fond mais sous le contenu texte — l'élément se teinte subtilement sans masquer son libellé.
- `color-mix(in srgb, var(--orange-accent) X%, transparent)` : dérive les niveaux d'opacité directement depuis la variable CSS `--orange-accent`, sans hardcoder de valeurs RGB. Supporté par Safari 16.2+, Chrome 111+, Firefox 113+.
- `var(--orange-accent, #ff9800)` : utilise la variable CSS existante de l'application, avec fallback.
- `outline` respecte `border-radius` dans les navigateurs modernes (Safari 16.4+).
- Cycle de 1.8s, amplitude 40%↔80% : subtil mais perceptible.
- Le fond teinté est **statique** (ne pulse pas) — seul le contour pulse. Cela évite un effet trop chargé visuellement.

### 6b. JS — tooltips.js — Ajouter/retirer la classe

Dans la fonction `afficher()`, ajouter la classe à la cible **avant** l'affichage de la bulle :

```javascript
function afficher(cible) {
    const cle = cible.dataset.tooltip;
    if (!cle || !window.TOOLTIPS || !window.TOOLTIPS[cle]) return;

    const texte = window.TOOLTIPS[cle];
    const bulle = obtenirBulle();
    const contenu = bulle.querySelector('.tooltip-contenu');

    contenu.textContent = texte;
    bulle.style.maxWidth = `${LARGEUR_MAX}px`;

    // Surbrillance de la cible
    if (cibleActive && cibleActive !== cible) {
        cibleActive.classList.remove('tooltip-cible-active');
    }
    cible.classList.add('tooltip-cible-active');

    bulle.classList.add('tooltip-mesure');
    bulle.classList.remove('tooltip-visible');

    requestAnimationFrame(() => {
        positionnerBulle(cible, bulle);
        bulle.classList.remove('tooltip-mesure');
        bulle.classList.add('tooltip-visible');
    });

    bulleActive = bulle;
    cibleActive = cible;
}
```

Dans la fonction `masquer()`, retirer la classe :

```javascript
function masquer() {
    if (bulleActive) {
        bulleActive.classList.remove('tooltip-visible');
        bulleActive = null;
    }
    if (cibleActive) {
        cibleActive.classList.remove('tooltip-cible-active');
        cibleActive = null;
    }
}
```

---

## 7. Résumé des changements

| Paramètre | Avant | Après |
|-----------|-------|-------|
| Marge bulle↔cible | 8px | 4px |
| Ordre de placement | bas → haut → droite → gauche | **droite → gauche → bas → haut** |
| Technique de la flèche | Carré 8×8 pivoté 45° | Triangle CSS pur (border) |
| Hauteur de l'amorce | ~5.7px | **12px** |
| Masquage au clic | Non | **Oui, instantané** |
| Masquage à Escape | Non | **Oui** (optionnel) |
| Animation d'entrée | translateY(4px), 0.2s | **scale(0.97→1), 0.15s** |
| Masquage de l'interface | Fréquent (placement vertical) | **Rare (placement latéral)** |
| Surbrillance de la cible | Aucune | **Contour 4px orange pulsant + fond teinté 15%** (outline inset + box-shadow inset + var(--orange-accent)) |

---

## 7. Vérification

- [ ] Le tooltip apparaît **à droite** de l'élément survolé par défaut
- [ ] Si l'espace à droite est insuffisant, il passe **à gauche**
- [ ] Si latéral impossible, il se place en bas puis en haut (fallback)
- [ ] La flèche pointe toujours vers l'élément cible, dans les 4 directions
- [ ] Le tooltip disparaît **immédiatement** au clic n'importe où
- [ ] Le tooltip disparaît **immédiatement** au scroll
- [ ] Le tooltip disparaît à la touche Escape (si implémenté)
- [ ] L'élément survolé et ses voisins restent visibles pendant l'affichage du tooltip
- [ ] L'animation d'entrée (scale) est fluide et discrète
- [ ] Le triangle est de la même couleur que la bulle (#1a1a2e), sans artefact
- [ ] Pas de décalage visible entre le triangle et le bord de la bulle
- [ ] L'élément survolé reçoit un **contour orange de 4px pulsant** + un **fond teinté orange 15%** pendant l'affichage du tooltip
- [ ] La surbrillance disparaît en même temps que le tooltip
- [ ] Le pulse est subtil (pas d'effet agressif ou épileptogène)
- [ ] La surbrillance ne décale pas les éléments voisins (outline inset, pas border)
- [ ] La surbrillance est **complète sur les 4 côtés** des accordéons du Trimestre (outline inset, pas de rognage)
- [ ] La surbrillance est **complète sur les 4 côtés** des en-têtes de Préférences
- [ ] La couleur du contour utilise `var(--orange-accent)` et correspond bien à l'orange accent de l'application
- [ ] La surbrillance épouse la forme de l'élément (outline suit border-radius en navigateurs modernes)
