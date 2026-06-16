# Relais de cadrage — #283 Harmonisation responsive des pages à sidebar (<1024 px)

**Date** : 16 juin 2026
**Statut** : Analyse lecture seule (Claude Code, cloud). **Décision d'option requise (Grégoire)** + validation visuelle terrain avant tout fix.
**Origine** : bug pré-existant (pas introduit par le chrome unifié). Lié à #284 (livré).

> ⚠️ **Limite de cette analyse** : faite en cloud, **sans rendu visuel**. Elle identifie
> la structure et les incohérences dans le CSS ; elle ne peut pas constater le rendu
> exact (deux modes, iPad Air portrait 820 px / paysage 1180 px). La sélection de
> l'option et la vérif finale sont une **passe terrain Mac+iPad**.

---

## 1. Constat structurel (vérifié dans le code)

### Pages à sidebar
| Page | Layout | Reflow |
|---|---|---|
| Conception › Productions / Grilles / Échelles / Pratiques / Cartouches | `.layout-sidebar-2col` (5 instances : `index.html` 4657/4958/5131/5426/5617) | **cohérent** |
| Évaluation › Liste | layout **propre** (`.eval-colonnes-selecteur`, `.eval-chrono-wrapper`…) | **divergent** |
| Calendrier | à confirmer au terrain (structure différente probable) | ? |

### Breakpoints de `.layout-sidebar-2col` (`styles.css:8303-8329`)
```
défaut        : grid 280px 1fr
@max 1024px   : grid 220px 1fr   (sidebar étroite)
@max 850px    : grid 1fr         (empilé ; reset .sidebar-navigation)
```
`.sidebar-liste` (les 5 biblio) est un simple bloc (`margin` seul, pas de `sticky`/`max-height`) → s'empile proprement au stack. **Mais** le reset `@850` cible `.sidebar-navigation`, pas `.sidebar-liste` (sans effet ici, juste à noter).

### Les deux incohérences à résoudre
1. **Désalignement de breakpoints** : le chrome/nav de l'app bascule à **1024 px** et **768 px** ; la sidebar 2col empile à **850 px**. → zone **850-1024 px** où la sidebar à **220 px** est serrée et désynchronisée du reste.
2. **Évaluation › Liste** n'utilise pas `.layout-sidebar-2col` → comportement responsive différent des 5 pages biblio.

---

## 2. Trois options à arbitrer

### Option A — Unifier sur `.layout-sidebar-2col`
Migrer **Évaluation › Liste** (et Calendrier si applicable) vers `.layout-sidebar-2col`, pour un reflow **identique partout**.
- ✅ Cohérence totale, une seule source de vérité responsive.
- ⚠️ Le layout d'Évaluation est spécifique (sélecteur de colonnes, palette chrono) → la grille 2col peut ne pas convenir sans adaptation ; **risque visuel le plus élevé** → validation terrain serrée.

### Option B — Aligner le breakpoint de stack (850 → 1024 px)  ⟵ **recommandée comme 1er pas**
Empiler la sidebar **dès qu'on passe sous 1024 px** (au lieu de 850), pour supprimer la zone 850-1024 où la sidebar à 220 px est serrée, et **aligner sur les breakpoints du chrome**.
- ✅ Changement **minimal** (déplacer/fusionner une media query), faible risque, cohérence des breakpoints.
- ✅ Sur iPad : portrait (820) → empilé (déjà le cas) ; paysage (1180) → 2col plein ; entre les deux → empilé proprement.
- ⚠️ On perd la 2col sur les petits paysages 850-1024 (acceptable : 220 px était serré).

### Option C — Sidebar repliable (toggle)
Sous 1024 px : sidebar **masquée par défaut**, bouton bascule (☰), contenu pleine largeur.
- ✅ Maximise l'espace contenu sur tablette.
- ⚠️ **Nouveau composant** (bouton + état + JS + a11y focus) sur 6 pages → coût et surface de bug les plus élevés ; sur-dimensionné si le seul problème est la zone 850-1024.

---

## 3. Recommandation

**B d'abord** (aligner le stack à 1024 px) — 1 changement à faible risque qui résout l'incohérence de breakpoint pour les 5 pages biblio, **puis** **A** pour Évaluation › Liste (et Calendrier) une fois le terrain confirmé. **C** seulement si le terrain montre que la pleine largeur est vraiment nécessaire sur tablette (sinon trop de surface pour le gain).

**Prérequis de décision (terrain Grégoire)** : ouvrir chaque page à sidebar sur iPad (portrait + paysage) et au redimensionnement Mac autour de 768 / 850 / 1024 px, et **noter quelle page casse à quelle largeur** — ça tranchera entre « juste aligner le breakpoint » (B) et « refondre Évaluation » (A).

---

## 4. Profil de risque
- **Pur CSS** (B) : faible, réversible (une media query). FOUC non concerné (pas le bloc critique inline).
- **A / C** : touchent la structure / ajoutent du JS → vérif deux modes + iPad obligatoire.
- Aucun de ces changements ne touche les données ni la sécurité.
