# Palette visuelle — Système d'accompagnement

**Statut** : Validé (19 avril 2026)  
**Principe** : Fond orange franc, texte sombre. Apparence identique en mode sombre et clair.  
**Couleur de base** : `#e8923a`  
**Ébauche de référence** : `ebauches-accompagnement.html` (racine du projet)

---

## Principe

Le système d'accompagnement (tooltips, popups 📍, tour guidé, états vides, glossaire, bannière d'accueil, transitions) utilise une palette orange autonome qui ne dépend pas du thème de l'application. Quand l'enseignant bascule entre mode sombre et mode clair, le fond de page change mais tous les composants d'accompagnement gardent la même apparence.

L'orange `#e8923a` est un compromis entre le `--orange-accent` du mode sombre (`#c8a060`, laiton) et celui du mode clair (`#ff6b35`, orange vif). Il contraste bien sur les deux fonds de page (`#0c1a22` sombre, `#d4e6f5` clair).

---

## Variables CSS à ajouter dans `styles.css`

Ces variables sont définies dans `:root` (pas dans `.mode-clair`) — elles ne changent jamais de valeur.

```css
/* ═══════════════════════════════════════════
   PALETTE ACCOMPAGNEMENT
   Fond orange, texte sombre — identique 2 modes
   Base : #e8923a
   ═══════════════════════════════════════════ */

/* Surfaces */
--acc-fond:            #e8923a;   /* Fond principal de tous les composants */
--acc-surface:         #d4822e;   /* En-têtes, zones surélevées */
--acc-surface-hover:   #c87828;   /* Hover sur surfaces */

/* Bordures */
--acc-bordure:         #b06820;   /* Bordure standard */
--acc-bordure-active:  #8a5018;   /* Bordure focus/active */

/* Texte */
--acc-texte:           #2a1404;   /* Texte principal (brun très foncé) */
--acc-texte-doux:      #4a2e10;   /* Texte secondaire */
--acc-texte-leger:     #6a4820;   /* Texte tertiaire, annotations */

/* Accent (texte foncé sur fond orange = l'accent est le foncé) */
--acc-accent:          #3a1e08;   /* Titres, liens, termes glossaire */
--acc-accent-vif:      #2a1404;   /* Titres principaux */

/* Bouton primaire (foncé sur orange) */
--acc-btn-prim:        #2a1404;
--acc-btn-prim-hover:  #3a1e08;
--acc-btn-prim-txt:    #f8e8d0;   /* Texte clair sur bouton foncé */

/* Bouton secondaire (contour foncé sur orange) */
--acc-btn-sec-bord:    #4a2e10;
--acc-btn-sec-txt:     #2a1404;

/* Blocs internes (conseil, exemple, alerte) */
--acc-conseil-fond:    #f0a858;   /* Orange plus clair */
--acc-conseil-bord:    #8a5018;
--acc-exemple-fond:    #eba64e;   /* Orange chaud */
--acc-exemple-bord:    #3a5a78;   /* Bleu discret pour différencier */
--acc-alerte-fond:     #e07830;   /* Orange plus foncé/rouge */
--acc-alerte-bord:     #8a2e10;

/* Dots progression tour guidé */
--acc-dot-inactif:     #c87828;
--acc-dot-actif:       #2a1404;
--acc-dot-vu:          #6a4820;
```

---

## Composants concernés

| Composant | Fichier(s) | Utilise la palette |
|-----------|-----------|-------------------|
| Tooltip (info-bulle) | `tooltips.js` | `.tooltip-bulle` : fond, bordure, texte |
| Popup 📍 | `primo-tooltips.js`, `aide-contextuelle.js` | `.primo-popup` : fond, header, corps, blocs |
| Panneau tour guidé | `guidage.js` | `.panneau-tour-guide` : fond, header, dots, boutons |
| État vide | `etats-vides.js` | `.etat-vide` : fond, bordure pointillée, texte, boutons |
| Bannière d'accueil | `accueil.js` | `.banniere-accueil` : fond, titre, texte, boutons |
| Notification transition | `transitions.js` | `.transition-toast` : fond, bordure gauche, texte |
| Glossaire inline | `glossaire.js` | `.glossaire-terme` + `.glossaire-popup` : soulignement, popup |
| Icône 📍 | CSS global | `.primo-aide` : fond cercle, bordure |

---

## Contraste et accessibilité

| Combinaison | Ratio estimé | WCAG AA |
|-------------|-------------|---------|
| `--acc-texte` (#2a1404) sur `--acc-fond` (#e8923a) | ~7.5:1 | ✅ AAA |
| `--acc-texte-doux` (#4a2e10) sur `--acc-fond` (#e8923a) | ~4.8:1 | ✅ AA |
| `--acc-btn-prim-txt` (#f8e8d0) sur `--acc-btn-prim` (#2a1404) | ~11:1 | ✅ AAA |
| `--acc-texte` (#2a1404) sur `--acc-conseil-fond` (#f0a858) | ~8.5:1 | ✅ AAA |

---

## Règles d'application

1. **Aucun style inline** — tous les composants utilisent les classes CSS et les variables `--acc-*`
2. **Pas de redéfinition dans `.mode-clair`** — les variables sont globales dans `:root`
3. **Les blocs internes** (conseil 💡, exemple 📋, alerte ⚡) se distinguent par leur fond et leur bordure gauche, pas par leur couleur de texte
4. **Les boutons** du système d'accompagnement utilisent `btn-primaire` (foncé) et `btn-secondaire` (contour) — ils ne réutilisent pas les classes de boutons de l'application principale
5. **Le z-index** des composants d'accompagnement reste en dessous des modales de l'application (tour guidé : 900, modales : 1000+)
