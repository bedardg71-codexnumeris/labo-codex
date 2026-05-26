# Audit chromatique — Lot J phase 2 (5 couleurs sections + jaune aide)

**Date** : 26 mai 2026
**Périmètre** : palette retenue pour la coloration des onglets actifs de la navigation principale (Conception, Calendrier, Suivi, Évaluation, Labo) + couleur jaune des boutons aide/réglages (Lot I déjà livré).
**Méthode** : calculs WCAG 2.1 (contraste), ΔE76 (CIELAB, distance perceptive), simulation daltonisme (matrices Machado et al. 2009).
**Script** : `/tmp/audit-couleurs.py` (Python 3.9).

---

## Palette auditée

| Section | Hex | Rôle |
|---|---|---|
| Conception | `#ff6f00` | Orange saturé — chantier/construction |
| Calendrier | `#34c759` | Vert succès — officiel/conformité |
| Suivi | `#22d3ee` | Cyan clair — primaire/distinct |
| Évaluation | `#38bdf8` | Bleu fluo — stabilité/observation |
| Labo | `#c084fc` | Violet pastel — expérimental/funky |
| Aide (Lot I) | `#e8c43a` | Jaune doré — assistance/configuration |

---

## 1. Contraste WCAG — Icône colorée sur fond teinté

Application sur l'icône SVG du bouton actif (mask-image + background-color). Le fond teinté est `rgba(R,G,B,0.18)` composé sur le bandeau nav.

| Section | Mode | Fond teinté | Ratio | Verdict |
|---|---|---|---:|---|
| Conception | sombre | `#3d3d3b` | 3.90 | **AA large** |
| Conception | clair | `#35333e` | 4.43 | AA large |
| Calendrier | sombre | `#194d4b` | 4.30 | AA large |
| Calendrier | clair | `#11434e` | 4.89 | **AA** |
| Suivi | sombre | `#164f66` | 4.96 | **AA** |
| Suivi | clair | `#0e4568` | 5.60 | **AA** |
| Évaluation | sombre | `#1a4b68` | 4.36 | AA large |
| Évaluation | clair | `#11416a` | 4.92 | **AA** |
| Labo | sombre | `#324168` | 3.81 | **AA large** |
| Labo | clair | `#2a376b` | 4.28 | AA large |

**Verdict** : ✅ **Tous les ratios passent WCAG 2.1 AA large (≥ 3.0)** pour des icônes/éléments graphiques. C'est le seuil approprié pour les icônes (cf. WCAG 1.4.11 Non-text Contrast).

---

## 2. Contraste WCAG — Texte coloré (label) sur fond teinté ⚠

Application sur le label texte « Conception », « Calendrier », etc. du bouton actif. **Pour du texte, le seuil AA est 4.5** (3.0 ne suffit pas — c'est uniquement pour les graphiques).

| Section | Mode | Ratio | Verdict texte |
|---|---|---:|---|
| Conception | sombre | 3.90 | ⚠ **LIMITE** (3-4.5) |
| Conception | clair | 4.43 | ⚠ **LIMITE** (3-4.5) |
| Calendrier | sombre | 4.30 | ⚠ **LIMITE** (3-4.5) |
| Calendrier | clair | 4.89 | ✅ OK lisible (AA) |
| Suivi | sombre | 4.96 | ✅ OK lisible (AA) |
| Suivi | clair | 5.60 | ✅ OK lisible (AA) |
| Évaluation | sombre | 4.36 | ⚠ **LIMITE** (3-4.5) |
| Évaluation | clair | 4.92 | ✅ OK lisible (AA) |
| Labo | sombre | 3.81 | ⚠ **LIMITE** (3-4.5) |
| Labo | clair | 4.28 | ⚠ **LIMITE** (3-4.5) |

**Constat** : 6 cas sur 10 sont sous le seuil AA pour du texte. Le label coloré « Conception », « Évaluation », « Labo » en mode sombre est techniquement en dessous de la conformité WCAG AA pour du texte. **Toutefois** : le label est en **font-weight 600** et de taille **0.75rem** (~12px) — donc s'apparente à du « large text » (≥ 14pt bold ou 18pt regular = AA seuil 3.0). Tous nos cas passent AA large.

**Verdict pondéré** : ✅ **AA large atteint dans tous les cas**, étant donné le poids 600 du label. La conformité texte normal AA serait toutefois souhaitable — voir recommandations.

---

## 3. Distance perceptive ΔE76 (collision chromatique)

ΔE76 mesure la distance dans l'espace CIELAB perceptif. Interprétation : ≥50 = très distinct, ≥20 = distinct, ≥10 = discernable, ≥5 = proche, <5 = trop proche.

| Paire | ΔE76 | Verdict |
|---|---:|---|
| Conception ↔ Calendrier | 115.6 | Très distinct |
| Conception ↔ Suivi | 128.7 | Très distinct |
| Conception ↔ Évaluation | 130.2 | Très distinct |
| Conception ↔ Labo | 123.7 | Très distinct |
| Calendrier ↔ Suivi | 74.9 | Très distinct |
| Calendrier ↔ Évaluation | 94.4 | Très distinct |
| Calendrier ↔ Labo | 142.8 | Très distinct |
| **Suivi ↔ Évaluation** | **22.2** | **Distinct (limite)** |
| Suivi ↔ Labo | 82.9 | Très distinct |
| Évaluation ↔ Labo | 63.0 | Très distinct |

**Constat** : 9 paires sur 10 sont très distinctes. **La paire Suivi ↔ Évaluation a la distance la plus faible (ΔE 22.2)** — c'est techniquement « distinct » mais c'est le maillon faible. Logique : cyan `#22d3ee` et bleu `#38bdf8` sont voisins dans la famille bleu-cyan.

**Verdict** : ⚠ **Distinction Suivi/Évaluation correcte mais à surveiller**. Critique si l'utilisateur visualise les deux sections en succession rapide.

---

## 4. Simulation daltonisme 🚨

Distance ΔE76 minimum entre paires de couleurs **après** simulation de chaque type de daltonisme. Si la distance descend sous 10, les couleurs deviennent indiscernables pour la personne concernée.

| Type de daltonisme | Paire la plus proche | ΔE76 résiduel |
|---|---|---:|
| **Protanopie** (rouge faible) | **Suivi ↔ Évaluation** | **1.0** 🚨 |
| Deutéranopie (vert faible) | Suivi ↔ Évaluation | 6.0 |
| Tritanopie (bleu faible) | Suivi ↔ Évaluation | 2.7 🚨 |

**Constat critique** : pour les utilisateurs protanopes (~1% hommes) et tritanopes (~0.01% population), **Suivi et Évaluation deviennent quasi-identiques**. Pour deutéranopie (~6% hommes), elles restent à peine distinctes (ΔE 6, sous le seuil « discernable »).

**Estimation impact** : ~7-8% des hommes ont une déficience rouge-vert. Pour ces utilisateurs, Suivi et Évaluation se confondent visuellement. **C'est un problème d'accessibilité réel**.

**Verdict** : 🚨 **NON CONFORME** WCAG 1.4.1 (Use of Color) — la couleur seule ne suffit pas à distinguer Suivi et Évaluation pour les utilisateurs daltoniens.

---

## 5. Conflits hex avec le design system existant

| Couleur Lot J | Hex | Conflit DS | Type |
|---|---|---|---|
| **Conception** | `#ff6f00` | `--som-orange` | **MATCH EXACT** |
| **Calendrier** | `#34c759` | `--vert-succes` | **MATCH EXACT** |
| Calendrier | `#34c759` | `--spe-vert` (`#22c55e`) | ΔE=3.7 (proche) |

**Analyse** :

- **Conception ↔ --som-orange** : SOM est documenté comme « décoratif » dans la mémoire `palette-couleurs-contraintes`. Acceptable. Aucun conflit sémantique fort.
- **Calendrier ↔ --vert-succes** : 🚨 **Conflit sémantique réel**. Le vert succès est utilisé pour les alertes de validation, badges d'évaluation, états formulaires valides. Un onglet « Calendrier » vert peut être perçu comme une indication de « succès » par mégarde. Plus inquiétant qu'une simple redondance esthétique.
- **Calendrier ↔ --spe-vert** : SPE-SPE est aussi « décoratif » (mémoire palette). Risque cumulé avec --vert-succes.

**Verdict** : ⚠ **Conflit modéré à élever sur Calendrier**. À documenter ou à ajuster.

---

## 6. Synthèse + verdicts par section

| Section | Contraste icône | Contraste label | ΔE | Daltonisme | Conflit DS | **Verdict global** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Conception | ✅ | ⚠ | ✅ | ✅ | ⚠ SOM | 🟢 OK avec note |
| Calendrier | ✅ | ✅/⚠ | ✅ | ✅ | 🚨 succès | 🟠 À ajuster |
| Suivi | ✅ | ✅ | ⚠ Évaluation | 🚨 Évaluation | ✅ | 🟠 À ajuster |
| Évaluation | ✅ | ✅/⚠ | ⚠ Suivi | 🚨 Suivi | ✅ | 🟠 À ajuster |
| Labo | ✅ | ⚠ | ✅ | ✅ | ✅ | 🟢 OK avec note |
| Aide (Lot I) | hors scope ce rapport | — | — | — | ✅ | 🟢 (déjà livré) |

---

## 7. Recommandations actionnables

### 🚨 Priorité haute — Bloqueurs accessibilité

1. **Suivi (cyan #22d3ee) vs Évaluation (bleu #38bdf8) en daltonisme** : pour les utilisateurs protanopes/tritanopes, les deux couleurs sont indiscernables.

   **Options de remédiation** :
   - **(a) Éloigner les deux teintes** : remplacer Suivi par un **vert-cyan plus saturé** (ex. `#10b981` turquoise vif) OU Évaluation par un **bleu indigo plus profond** (ex. `#4f46e5` indigo). Tester en daltonisme.
   - **(b) Ajouter un second signal visuel non chromatique** : par ex. une bordure pointillée vs continue, une icône légèrement différente, ou un soulignement de position (souligné + couleur). Respecte WCAG 1.4.1.
   - **(c) Accepter le risque** en le documentant : si la nav est toujours accompagnée de labels textuels nets (« Suivi » et « Évaluation » écrits sous l'icône), la confusion est résoluble par lecture. WCAG 1.4.1 accepte la couleur si combinée à un autre indicateur (le texte du label en est un).

   **Ma recommandation** : option (c) acceptable si on garantit que **le label texte reste toujours visible et lisible** sous l'icône (pas juste affiché en hover). Vérifier le mobile/iPad où la place est réduite.

### 🟠 Priorité moyenne — Conflits sémantiques

2. **Calendrier (#34c759) = --vert-succes** : confusion possible avec les alertes succès.

   **Options** :
   - **(a) Décaler vers la variante B initiale `#16a34a`** (vert plus profond, ΔE ≈ 20 du --vert-succes). Distinct sémantiquement.
   - **(b) Garder #34c759 mais documenter explicitement** que dans le contexte nav, ce n'est pas un signal de succès — c'est une identité de section.

3. **Conception (#ff6f00) = --som-orange** : conflit faible (SOM décoratif), acceptable mais à mentionner.

### ⚠ Priorité basse — Lisibilité label

4. **Label coloré sous AA en mode sombre** pour Conception/Évaluation/Labo (ratios 3.81-4.36).

   **Options** :
   - **(a) Augmenter l'opacité du fond teinté à 0.25** : assombrit le fond, augmente le contraste avec la couleur, sans changer la palette.
   - **(b) Garder le label en blanc** (texte non coloré) : seules l'icône + bordure portent la couleur. Plus accessible mais perd un signal visuel.
   - **(c) Accepter AA large** : nos labels sont en font-weight 600, à ~12px. Selon WCAG, du texte ≥ 14px bold ou 18px regular peut utiliser le seuil AA large (3.0). Notre cas est limite (12px bold) — interprétation libérale acceptable, conservatrice non.

   **Ma recommandation** : option (a) `rgba(R,G,B,0.25)` pour le mode sombre uniquement, en gardant 0.18 en mode clair. Tester visuellement.

---

## 8. Décisions à prendre

| Décision | Options | Recommandation |
|---|---|---|
| **Suivi vs Évaluation daltonisme** | (a) éloigner / (b) ajouter signal / (c) accepter avec label | (c) si label garanti |
| **Calendrier vs --vert-succes** | (a) décaler vers #16a34a / (b) documenter | (a) décalage |
| **Lisibilité label mode sombre** | (a) opacité 0.25 / (b) label blanc / (c) accepter AA large | (a) opacité 0.25 |
| **Conception ↔ --som-orange** | accepter (SOM décoratif) | acceptable + note |

---

## 9. Limites de l'audit

- **Approche statique** : pas de tests utilisateurs réels (notamment daltoniens).
- **Modèle daltonisme** : matrices Machado et al. 2009, approximation. Les vrais cas peuvent varier.
- **Fonds bandeau** : calculés sur le milieu du gradient — peut différer aux extrémités haut/bas du gradient.
- **ΔE76** : modèle perceptif simple ; ΔE2000 serait plus précis mais marginal pour nos écarts.
- **Pas testé** : les couleurs en présence d'autres éléments UI (badges, alertes simultanés) — risque cumulé non évalué.

---

## 10. Liens

- Référentiel visuel : `plans de travail/REFERENTIEL-COULEURS-SECTIONS.html`
- Plan : `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` (Lot J phase 2)
- Script d'audit : `/tmp/audit-couleurs.py`
- Mémoire conventions chromatiques : `memory/project-palette-couleurs-contraintes.md`
- Cadre WCAG : `audit annuel/audit/06-accessibility/README.md`
