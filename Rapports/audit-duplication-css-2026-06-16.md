# Audit duplication CSS — index.html ↔ styles.css

**Date** : 2026-06-16 (re-génération ÉTAPE 0 — plage inline corrigée 16-3825)
**Ticket** : BACKLOG #297
**Mode** : Audit lecture seule. Aucune modification de code.
**Script** : `Rapports/_outils/audit-duplication-css.py`

---

## 1. Méthode

- Bloc inline extrait : lignes 16–3825 d'`index.html`.
- Parser naïf (CSS vanilla sans nesting) qui distingue les contextes `@media` / `@supports` / `@keyframes` (un sélecteur dans un `@media`
  est considéré comme une clef distincte de la même règle hors `@media`).
- Comparaison sur **blocs de propriétés normalisés** : whitespace réduit, commentaires retirés. L'ordre des propriétés est préservé (deux blocs avec le même contenu mais ordonné différemment sont considérés comme divergents — ce qui est correct pour CSS où l'ordre peut affecter le cascade en cas de redéfinition de la même propriété).
- Catégories :
  - **Identiques** : même sélecteur, même bloc normalisé → duplication pure, candidate à retrait dans un des deux fichiers.
  - **Divergentes** : même sélecteur, bloc différent → l'un surcharge l'autre. Source de bugs silencieux (cas du `.contenu min-height` du 28 mai matin).
  - **Inline seulement** / **Externe seulement** : pas de doublon, OK en l'état.

---

## 2. Statistiques globales

| Indicateur | Valeur |
|---|---:|
| Règles dans le `<style>` inline d'index.html | 629 |
| Règles dans `styles.css` | 4176 |
| **Sélecteurs communs (mêmes selecteur + contexte)** | 48 |
| → dont **identiques** (mêmes propriétés) | 15 |
| → dont **divergentes** (overrides potentiels) | 33 |
| Sélecteurs inline seulement | 579 |
| Sélecteurs externe seulement | 4125 |

**Lecture** : 48 sélecteurs sur 629 du bloc inline (7.6%) existent aussi dans `styles.css`.

---

## 3. Règles DIVERGENTES — priorité haute

Ces sélecteurs ont des propriétés différentes entre les deux sources. Selon l'ordre de chargement (`<style>` inline avant styles.css externe), **c'est styles.css qui gagne** sur tout ce qu'il redéfinit, mais le inline est utilisé pour ce que styles.css ne réécrit pas. Source du bug `.contenu min-height: 500px` non retiré du 28 mai matin.

**Total : 33 sélecteurs divergents.**

### 3.1 Échantillon des 30 premières divergences

| # | Sélecteur (contexte) | Inline | Externe | Δ taille |
|---|---|---|---|---:|
| 1 | `@keyframes fadeIn // from` | index.html:1596 | styles.css:5004 | 24 |
| 2 | `@keyframes fadeIn // to` | index.html:1600 | styles.css:5008 | 17 |
| 3 | `@keyframes slideIn // from` | index.html:1529 | styles.css:5277 | 0 |
| 4 | `@keyframes slideIn // to` | index.html:1533 | styles.css:5281 | 0 |
| 5 | ` // .badge-jeton` | index.html:3772 | styles.css:10328 | 63 |
| 6 | ` // .badge-jeton-delai` | index.html:3797 | styles.css:10344 | 50 |
| 7 | ` // .badge-jeton-reprise` | index.html:3803 | styles.css:10340 | 33 |
| 8 | ` // .badge-statut` | index.html:3809 | styles.css:2543 | 41 |
| 9 | ` // .badge-statut.non-evalue` | index.html:3817 | styles.css:5499 | 35 |
| 10 | ` // .btn-groupe` | index.html:1517 | styles.css:4322 | 2 |
| 11 | ` // .carte` | index.html:1415 | styles.css:2046 | 111 |
| 12 | ` // .carte-metrique-bleue` | index.html:1637 | styles.css:6305 | 46 |
| 13 | ` // .carte-metrique-verte` | index.html:1645 | styles.css:6315 | 40 |
| 14 | ` // .carte-metrique-violette` | index.html:1745 | styles.css:6326 | 48 |
| 15 | ` // .conteneur` | index.html:260 | styles.css:854 | 191 |
| 16 | ` // .controle-form` | index.html:1435 | styles.css:3496 | 1 |
| 17 | ` // .controle-form:focus` | index.html:1452 | styles.css:3505 | 13 |
| 18 | ` // .empty-state-center-30` | index.html:2848 | styles.css:3528 | 56 |
| 19 | ` // .groupe-form` | index.html:1459 | styles.css:3473 | 19 |
| 20 | ` // .groupe-form label` | index.html:1463 | styles.css:3481 | 19 |
| 21 | ` // .mt-3` | index.html:1513 | styles.css:5528 | 0 |
| 22 | ` // .notification-succes` | index.html:1539 | styles.css:5180 | 7 |
| 23 | ` // .section-accordeon` | index.html:1859 | styles.css:8505 | 74 |
| 24 | ` // .section.active` | index.html:1389 | styles.css:1949 | 115 |
| 25 | ` // .sous-navigation` | index.html:1355 | styles.css:1871 | 76 |
| 26 | ` // .tableau` | index.html:1470 | styles.css:2625 | 52 |
| 27 | ` // .tableau td` | index.html:1497 | styles.css:2794 | 9 |
| 28 | ` // .tableau th` | index.html:1479 | styles.css:2641 | 8 |
| 29 | ` // .tableau-blanc` | index.html:2020 | styles.css:2803 | 35 |
| 30 | ` // .text-muted` | index.html:1506 | styles.css:5505 | 74 |

_(... 3 divergences supplémentaires, voir Section 6 pour la liste complète des sélecteurs.)_

### 3.2 Diff détaillé des 10 divergences les plus volumineuses

Pour aider la triage : pour chaque divergence parmi les 10 plus volumineuses, on montre le bloc inline et le bloc externe côte à côte (propriétés normalisées). Permet d'identifier en un coup d'œil les **valeurs réellement divergentes** vs les ajouts purs.

#### 1. ` // :root`

- **Inline** (index.html:17) — 4202 octets

```css
color-scheme: dark; --bleu-principal: #1a4a5e; --bleu-fonce: #0c1a22; --bleu-moyen: #244858; --bleu-clair: #6aacb8; --bleu-leger: #4a8a94; --bleu-carte: #1a3a48; --bleu-pale: #1a3040; --bleu-tres-pale: #142428; --bleu-anonymisation: #0c1a22; --orange-accent: #c8a060; --vert-pale: #0e2a28; --vert-doux: #2a5a4a; --vert-leger: #3aaa8a; --vert-succes: #34c759; --som-orange: #ff6f00; --std-bleu: #0277bd; --spe-vert: #22c55e; --den-violet: #8b5cf6; --gradient-entete: linear-gradient(135deg, #0a1820 0%, #1a3848 100%); --gradient-fond-page: linear-gradient(135deg, #0e1e28 0%, #0c1a22 100%); --shadow-subtil: 0 1px 4px rgba(10, 30, 40, 0.3); --shadow-normal: 0 2px 8px rgba(10, 30, 40, 0.4); --shadow-prononce: 0 4px 14px rgba(10, 30, 40, 0.5); --shadow-fort: 0 8px 24px rgba(10, 30, 40, 0.55); --shadow-inset: inset 0 1px 3px rgba(10, 30, 40, 0.15); --radius-petit: 5px; --radius-moyen: 6px; --radius-grand: 12px; --radius-pill: 20px; --padding-compact: 3px 8px; --font-compact: 0.75rem; --padding-compact-pill: 3px 10px; --padding-moyen: 10px 15px; --font-moyen: 0.9rem; --padding-moyen-pill: 6px 15px; --font-moyen-pill: 0.85rem; --padding-large: 15px; --font-large: 1rem; --table-hover: rgba(106, 172, 184, 0.12); --nav-bg: #122a34; --nav-normal: #8aa4b0; --nav-hover: #6aacb8; --nav-actif: #6aacb8; --nav-bordure-actif: var(--orange-accent); --nav-actif-normal: #6aacb8; --nav-actif-anonymisation: #5a7a88; --sous-nav-bg: #0e1e28; --sous-nav-normal: #8aa4b0; --sous-nav-hover: #6aacb8; --sous-nav-actif: #7ec8d4; --sous-nav-bg-normal: #0e1e28; --sous-nav-bg-anonymisation: #0e1e28; --btn-principal: #1a4a5e; --btn-principal-hover: #246478; --btn-ajouter: #1e5a4a; --btn-ajouter-hover: #287a64; --btn-modifier: #3a5070; --btn-modifier-hover: #4a6888; --btn-confirmer: #1e5a4a; --btn-confirmer-hover: #287a64; --btn-annuler: #b8864a; --btn-annuler-hover: #9a7040; --btn-supprimer: #7a3a3a; --btn-supprimer-hover: #6a2a2a; --niveau-attention-nul: #6aacb8; --niveau-attention-minimal: #34c759; --niveau-attention-faible: #7ae8a0; --niveau-attention-modere: #ffc107; --niveau-attention-eleve: #fd7e14; --niveau-attention-tres-eleve: #e84057; --niveau-attention-critique: #a02030; --gris-tres-fonce: #d0e0e4; --gris-fonce: #b0c4cc; --gris-moyen: #8aa4b0; --gris-clair: #80a0b0; --gris-tres-clair: #2a4a54; --gris-tres-pale: #142428; --bordure-claire: rgba(106, 172, 184, 0.25); --bordure-moyenne: rgba(106, 172, 184, 0.35); --alerte-fond-attention: rgba(200, 160, 96, 0.12); --alerte-bordure-attention: #c8a060; --alerte-texte-attention: #d4b878; --alerte-fond-information: rgba(106, 172, 184, 0.12); --alerte-bordure-information: #6aacb8; --alerte-texte-information: #7ec8d4; --alerte-fond-succes: rgba(52, 199, 89, 0.12); --alerte-bordure-succes: #34c759; --alerte-texte-succes: #5ae080; --alerte-fond-erreur: rgba(232, 64, 87, 0.12); --alerte-bordure-erreur: #e84057; --alerte-texte-erreur: #f06878; --etat-erreur-fond: rgba(232, 64, 87, 0.1); --etat-erreur-bordure: #e84057; --etat-erreur-texte: #f06878; --etat-valide-fond: rgba(52, 199, 89, 0.1); --etat-valide-bordure: #34c759; --etat-valide-texte: #5ae080; --etat-verrouille-fond: rgba(106, 172, 184, 0.06); --etat-verrouille-bordure: #5a7a88; --etat-verrouille-texte: #8aa4b0; --badge-evalue-fond: rgba(52, 199, 89, 0.12); --badge-evalue-texte: #5ae080; --badge-evalue-bordure: rgba(52, 199, 89, 0.3); --badge-non-evalue-fond: rgba(106, 172, 184, 0.08); --badge-non-evalue-texte: #8aa4b0; --badge-non-evalue-bordure: rgba(106, 172, 184, 0.2); --espacement-petit: 10px; --espacement-moyen: 20px; --espacement-grand: 30px; --jour-cours-reel-bg: rgba(106, 172, 184, 0.25); --reprise-bg: rgba(200, 160, 96, 0.15); --conge-bg: rgba(232, 64, 87, 0.12); --planification-bg: rgba(139, 92, 246, 0.12); --examens-bg: rgba(232, 64, 87, 0.08); --weekend-bg: rgba(106, 172, 184, 0.05); --surface-page: #0c1a22; --surface-section: #142428; --surface-conteneur: #142428; --surface-carte: #1a3040; --surface-element: #244858; --surface-input: rgba(106, 172, 184, 0.08); --ocean-moyen: #1a3040; --texte-principal: #d0e0e4; --texte-secondaire: #8aa4b0; --texte-muted: #80a0b0; --accent-primaire: #6aacb8; --accent-secondaire: #c8a060; --succes: var(--vert-succes);
```

- **Externe** (styles.css:1) — 6525 octets

```css
color-scheme: dark; --bleu-principal: #1a4a5e; --bleu-fonce: #0c1a22; --bleu-moyen: #244858; --bleu-clair: #6aacb8; --bleu-leger: #4a8a94; --bleu-carte: #1a3a48; --bleu-pale: #1a3040; --bleu-tres-pale: #142428; --fond-page-sature: #0e1e28; --fond-page-clair: #0c1a22; --shadow-subtil: 0 1px 4px rgba(10, 30, 40, 0.3); --shadow-normal: 0 2px 8px rgba(10, 30, 40, 0.4); --shadow-prononce: 0 4px 14px rgba(10, 30, 40, 0.5); --shadow-fort: 0 8px 24px rgba(10, 30, 40, 0.55); --radius-petit: 5px; --radius-moyen: 6px; --radius-grand: 12px; --radius-pill: 20px; --padding-compact: 3px 8px; --font-compact: 0.75rem; --padding-moyen: 10px 15px; --font-moyen: 0.9rem; --orange-accent: #c8a060; --vert-pale: #0e2a28; --vert-doux: #2a5a4a; --vert-leger: #3aaa8a; --vert-succes: #34c759; --rouge-erreur: #e84057; --rouge-danger: #dc3545; --sarcelle-principal: #1a4a5e; --sarcelle-fonce: #0c1a22; --sarcelle-moyen: #244858; --sarcelle-clair: #6aacb8; --sarcelle-leger: #4a8a94; --sarcelle-carte: #1a3a48; --sarcelle-pale: #122a34; --sarcelle-tres-pale: #0e1e28; --som-orange: #ff6f00; --std-bleu: #0277bd; --spe-vert: #22c55e; --den-violet: #8b5cf6; --hybride-violet: #9c27b0; --bleu-meta: #9fc5e8; --table-hover: rgba(106, 172, 184, 0.12); --sous-nav-bg-anonymisation: #0e1e28; --btn-principal: #1a4a5e; --btn-principal-hover: #246478; --btn-ajouter: #1e5a4a; --btn-ajouter-hover: #287a64; --btn-modifier: #3a5070; --btn-modifier-hover: #4a6888; --btn-confirmer: #1e5a4a; --btn-confirmer-hover: #287a64; --btn-annuler: #b8864a; --btn-annuler-hover: #9a7040; --btn-supprimer: #7a3a3a; --btn-supprimer-hover: #6a2a2a; --rai-niveau-2: #818cf8; --rai-niveau-3: #a78bfa; --niveau-attention-nul: #6aacb8; --niveau-attention-minimal: #34c759; --niveau-attention-faible: #7ae8a0; --niveau-attention-modere: #ffc107; --niveau-attention-eleve: #fd7e14; --niveau-attention-tres-eleve: #e84057; --niveau-attention-critique: #a02030; --idme-etendu: #64B5F6; --idme-maitrise: #8BC34A; --idme-developpement: #FFEB3B; --idme-reussite: #FF9800; --idme-insuffisant: #F44336; --gris-fonce: #b0c4cc; --gris-moyen: #8aa4b0; --gris-clair: #80a0b0; --gris-tres-clair: #2a4a54; --gris-tres-pale: #142428; --bordure-claire: rgba(106, 172, 184, 0.25); --bordure-moyenne: rgba(106, 172, 184, 0.35); --alerte-fond-attention: rgba(200, 160, 96, 0.12); --alerte-bordure-attention: #c8a060; --alerte-texte-attention: #d4b878; --alerte-fond-information: rgba(106, 172, 184, 0.12); --alerte-bordure-information: #6aacb8; --alerte-texte-information: #7ec8d4; --alerte-fond-succes: rgba(52, 199, 89, 0.12); --alerte-bordure-succes: #34c759; --alerte-texte-succes: #5ae080; --alerte-fond-erreur: rgba(232, 64, 87, 0.12); --alerte-bordure-erreur: #e84057; --alerte-texte-erreur: #f06878; --etat-erreur-fond: rgba(232, 64, 87, 0.1); --etat-erreur-bordure: #e84057; --etat-erreur-texte: #f06878; --etat-valide-fond: rgba(52, 199, 89, 0.1); --etat-valide-bordure: #34c759; --etat-valide-texte: #5ae080; --etat-verrouille-fond: rgba(106, 172, 184, 0.06); --etat-verrouille-bordure: #5a7a88; --etat-verrouille-texte: #8aa4b0; --badge-evalue-fond: rgba(52, 199, 89, 0.12); --badge-evalue-texte: #5ae080; --badge-evalue-bordure: rgba(52, 199, 89, 0.3); --badge-non-evalue-fond: rgba(106, 172, 184, 0.08); --badge-non-evalue-texte: #8aa4b0; --badge-non-evalue-bordure: rgba(106, 172, 184, 0.2); --espacement-petit: 10px; --espacement-moyen: 20px; --espacement-grand: 30px; --jour-cours-reel-bg: rgba(106, 172, 184, 0.25); --reprise-bg: rgba(200, 160, 96, 0.15); --conge-bg: rgba(232, 64, 87, 0.12); --planification-bg: rgba(139, 92, 246, 0.12); --examens-bg: rgba(232, 64, 87, 0.08); --weekend-bg: rgba(106, 172, 184, 0.05); --carte-info-note-fond: #2a2818; --carte-info-note-bordure: #f5c842; --carte-info-note-titre: #d97706; --carte-info-conseil-fond: #0e2a28; --carte-info-conseil-bordure: #4ade80; --carte-info-conseil-titre: #34c759; --carte-info-pedagogique-fond: #2a1418; --carte-info-pedagogique-bordure: #f87171; --carte-info-pedagogique-titre: #f06878; --badge-pattern-critique-fond: rgba(79, 116, 243, 0.15); --badge-pattern-critique-texte: #7a9cff; --badge-pattern-emergent-fond: rgba(41, 148, 238, 0.15); --badge-pattern-emergent-texte: #5ab4ff; --badge-pattern-defi-fond: rgba(17, 174, 197, 0.15); --badge-pattern-defi-texte: #3cc8d8; --badge-pattern-stable-fond: rgba(27, 189, 126, 0.15); --badge-pattern-stable-texte: #4cd8a0; --jetons-reprise-fond: rgba(156, 39, 176, 0.12); --jetons-reprise-bordure: #9c27b0; --jetons-reprise-titre: #ce93d8; --jetons-delai-fond: rgba(255, 111, 0, 0.12); --jetons-delai-bordure: #ff6f00; --jetons-delai-titre: #ffab40; --calendrier-weekend-texte: #757575; --calendrier-examens-bordure: #f06292; --calendrier-planification-bordure: #ba68c8; --calendrier-conge-texte: #f06878; --calendrier-conge-bordure: #ef5350; --calendrier-reprise-texte: #ffab40; --alerte-fond-violet: rgba(156, 39, 176, 0.12); --alerte-bordure-violet: #9c27b0; --gabarit-couleur: #a78bfa; --gabarit-fond: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, #162c36 100%); --gris-bordure-dashed: #5a7a88; --gris-separateur: #5a7a88; --gris-encadre-jetons: #5a7a88; --gris-encadre-jetons-progression: #5a7a88; --surface-page: #0c1a22; --surface-section: #142428; --surface-conteneur: #142428; --surface-carte: #1a3040; --surface-element: #244858; --surface-input: rgba(106, 172, 184, 0.08); --texte-principal: #d0e0e4; --texte-secondaire: #8aa4b0; --texte-muted: #80a0b0; --accent-primaire: #6aacb8; --focus-ring-color: var(--accent-primaire); --focus-ring-width: 3px; --focus-ring-offset: 2px; --focus-ring: 0 0 0 var(--focus-ring-width) var(--focus-ring-color); --acc-fond: #e8923a; --acc-surface: #d4822e; --acc-surface-hover: #c87828; --acc-bordure: #b06820; --acc-bordure-active: #8a5018; --acc-texte: #2a1404; --acc-texte-doux: #4a2e10; --acc-texte-leger: #6a4820; --acc-accent: #3a1e08; --acc-accent-vif: #2a1404; --acc-btn-prim: #2a1404; --acc-btn-prim-hover: #3a1e08; --acc-btn-prim-txt: #f8e8d0; --acc-btn-sec-bord: #4a2e10; --acc-btn-sec-txt: #2a1404; --acc-conseil-fond: #f0a858; --acc-conseil-bord: #8a5018; --acc-exemple-fond: #eba64e; --acc-exemple-bord: #3a5a78; --acc-alerte-fond: #e07830; --acc-alerte-bord: #8a2e10; --acc-dot-inactif: #c87828; --acc-dot-actif: #2a1404; --acc-dot-vu: #6a4820; --icone-aide-config: #e8923a; --nav-actif: #e8923a; --section-conception: #dac16c; --section-calendrier: #30b85d; --section-suivi: #56cadc; --section-evaluations: #6ec1e7; --section-labo: #d1aff4; --accent-coeur: #ff6f91; --bg-bandeau-mediane: #133248;
```

#### 2. ` // .carte`

- **Inline** (index.html:1415) — 231 octets

```css
background: var(--surface-carte, #1a3040); border: 1px solid rgba(106, 172, 184, 0.15); border-radius: var(--radius-grand); padding: var(--espacement-moyen); margin-bottom: var(--espacement-moyen); box-shadow: var(--shadow-normal);
```

- **Externe** (styles.css:2046) — 342 octets

```css
background: var(--surface-carte, #1a3040); border: 1px solid rgba(106, 172, 184, 0.15); border-left: 3px solid var(--accent-primaire, #6aacb8); border-radius: var(--radius-grand); padding: var(--espacement-moyen); margin-bottom: var(--espacement-moyen); box-shadow: var(--shadow-normal); transition: box-shadow 0.2s ease, transform 0.2s ease;
```

#### 3. ` // body`

- **Inline** (index.html:249) — 261 octets

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: var(--surface-page, #0c1a22); color: var(--texte-principal, #d0e0e4); min-height: 100vh; margin: 0; padding: 0; width: 100%; overflow-x: hidden;
```

- **Externe** (styles.css:826) — 273 octets

```css
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.6; color: var(--texte-principal, #d0e0e4); background: linear-gradient(135deg, var(--fond-page-sature) 0%, var(--fond-page-clair) 100%); min-height: 100vh; padding: 30px;
```

#### 4. ` // .conteneur`

- **Inline** (index.html:260) — 60 octets

```css
background: var(--surface-carte, #1a3040); overflow: hidden;
```

- **Externe** (styles.css:854) — 251 octets

```css
max-width: 95%; margin: 0 auto; background: var(--surface-section, #142428); border: 1px solid rgba(106, 172, 184, 0.1); border-radius: var(--radius-grand); box-shadow: var(--shadow-normal), inset 0 1px 3px rgba(255, 255, 255, 0.04); overflow: hidden;
```

#### 5. ` // .notification-succes`

- **Inline** (index.html:1539) — 248 octets

```css
position: fixed; top: 20px; right: 20px; background: var(--vert-succes); color: white; padding: 15px 20px; border-radius: var(--radius-grand); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); z-index: 9999; animation: slideIn 0.3s ease; max-width: 400px;
```

- **Externe** (styles.css:5180) — 241 octets

```css
position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: var(--vert-leger); color: white; border-radius: var(--radius-grand); box-shadow: var(--shadow-prononce); z-index: 11000; animation: slideIn 0.3s ease; max-width: 420px;
```

#### 6. ` // .badge-jeton`

- **Inline** (index.html:3772) — 132 octets

```css
display: inline-block; padding: 2px 4px; border-radius: var(--radius-moyen); font-size: 0.75rem; font-weight: 600; margin-left: 8px;
```

- **Externe** (styles.css:10328) — 195 octets

```css
padding: var(--padding-compact); border-radius: var(--radius-petit); font-size: var(--font-compact); font-weight: 600; line-height: 1.2; color: white; margin-left: 8px; transition: all 0.2s ease;
```

#### 7. ` // .section.active`

- **Inline** (index.html:1389) — 48 octets

```css
display: block; animation: apparition 0.3s ease;
```

- **Externe** (styles.css:1949) — 163 octets

```css
display: block; background: var(--surface-section, #142428); padding: var(--espacement-moyen); border-radius: var(--radius-grand); animation: apparition 0.3s ease;
```

#### 8. ` // .controle-form`

- **Inline** (index.html:1435) — 154 octets

```css
width: 100%; padding: 8px; border: 1px solid var(--bordure-claire); border-radius: var(--radius-moyen); font-size: 0.95rem; transition: border-color 0.2s;
```

- **Externe** (styles.css:3496) — 155 octets

```css
width: 100%; padding: 8px 12px; border: 1px solid var(--bleu-leger); border-radius: var(--radius-moyen); font-size: 0.95rem; transition: border-color 0.2s;
```

#### 9. ` // .tableau th`

- **Inline** (index.html:1479) — 136 octets

```css
background: var(--bleu-moyen); padding: 10px; text-align: left; border: 1px solid var(--bordure-claire); font-weight: 600; color: white;
```

- **Externe** (styles.css:2641) — 128 octets

```css
padding: 12px; text-align: left; font-weight: 600; font-size: 0.9rem; color: white; border: 1px solid rgba(106, 172, 184, 0.25);
```

#### 10. ` // .carte-metrique-violette`

- **Inline** (index.html:1745) — 133 octets

```css
background: var(--alerte-fond-information); padding: 15px; border-radius: var(--radius-grand); border: 2px solid var(--btn-modifier);
```

- **Externe** (styles.css:6326) — 85 octets

```css
background: var(--surface-carte, #1a3040); border-color: var(--niveau-attention-nul);
```

---

## 4. Règles IDENTIQUES — duplication pure, candidates à retrait

Ces sélecteurs ont strictement les mêmes propriétés des deux côtés. Retirer ces règles de l'un des deux fichiers ne change aucun comportement de rendu (modulo l'ordre de chargement vs cascade). Le mécanisme « inline d'abord, externe ensuite » garantit que la version externe est toujours appliquée si elle est identique.

**Total : 15 sélecteurs identiques.**

### 4.1 Échantillon des 30 plus volumineuses

| # | Sélecteur (contexte) | Inline | Externe | Octets bloc |
|---|---|---|---|---:|
| 1 | ` // .carte h3` | index.html:1427 | styles.css:2066 | 135 |
| 2 | ` // .sous-titre-section` | index.html:3764 | styles.css:10419 | 126 |
| 3 | ` // .grille-form-2col` | index.html:1788 | styles.css:8681 | 78 |
| 4 | ` // .notification-details` | index.html:1553 | styles.css:5200 | 49 |
| 5 | ` // .sous-section.active` | index.html:1398 | styles.css:1961 | 48 |
| 6 | ` // *` | index.html:233 | styles.css:811 | 46 |
| 7 | `@keyframes apparition // from` | index.html:1405 | styles.css:1979 | 40 |
| 8 | `@keyframes apparition // to` | index.html:1409 | styles.css:1983 | 37 |
| 9 | ` // .contenu` | index.html:1375 | styles.css:1925 | 33 |
| 10 | ` // .tableau thead tr:first-child th:last-child` | index.html:1493 | styles.css:2782 | 29 |
| 11 | ` // .tableau thead tr:first-child th:first-child` | index.html:1488 | styles.css:2777 | 28 |
| 12 | ` // .mb-30` | index.html:3124 | styles.css:10480 | 20 |
| 13 | ` // .texte-centre` | index.html:1346 | styles.css:5515 | 19 |
| 14 | ` // .section` | index.html:1382 | styles.css:1941 | 14 |
| 15 | ` // .sous-section` | index.html:1394 | styles.css:1957 | 14 |

---

## 5. Recommandation par catégorie

### 5.1 Pour les règles IDENTIQUES

Trois options.

- **(a) Retirer de l'inline, garder dans styles.css** → réduit la taille du HTML envoyé, l'app reste rendue identique tant que styles.css est chargé. **Risque résiduel** : si styles.css est perdu (cache invalidé en pleine session, file://, etc.), ces règles disparaissent. Acceptable pour les règles non critiques (profondes dans l'arbre UI). À éviter pour les règles de bandeau, navigation principale, accueil — celles qui définissent le premier rendu visible.
- **(b) Retirer de styles.css, garder dans l'inline** → cohérent avec une stratégie « inline = source unique ». Mais alors styles.css perd l'historique de ces règles et il devient plus difficile de les auditer hors index.html. Non recommandé.
- **(c) Garder les deux et documenter** → la convention actuelle. Risque de divergence silencieuse confirmée par le bug du 28 mai. Acceptable si on ajoute une discipline (toute modification d'une règle dupliquée doit toucher les deux fichiers).

**Recommandation par défaut** : (a) pour les règles **profondes** (modales, sous-sections, composants non-above-the-fold), (c) pour les règles **critiques** (variables `:root`, `body`, `.bandeau-*`, navigation principale).

### 5.2 Pour les règles DIVERGENTES

Chacune est un **piège potentiel**. À traiter cas par cas :

- Lire les deux versions. Décider laquelle est correcte.
- Retirer celle qui est obsolète. Acquérir une source de vérité unique.
- Si les deux servent intentionnellement (override délibéré), ajouter un commentaire en BOUT de chaque définition (« cf. autre définition dans index.html:NNNN »).

### 5.3 Convention à inscrire en tête du bloc `<style>` inline

Une fois l'audit traité, ajouter en tête du bloc inline un encart explicite, ex. :

```html
<style>
/* ============================================================
   CSS critique inliné délibérément pour mitiger Safari file://
   (cache CSS externe non invalidé après bump build).

   Convention :
   - Variables :root → inline (chargement immédiat)
   - Mises en page initiales (bandeau, nav, accueil) → inline
   - Règles profondes (modales, panels) → styles.css UNIQUEMENT

   Toute règle dupliquée DOIT exister à l'identique des deux côtés.
   ============================================================ */
```

---

## 6. Annexe — Liste complète des divergences

| # | Sélecteur | Contexte | Inline | Externe |
|---|---|---|---|---|
| 1 | `from` | `@keyframes fadeIn` | index.html:1596 | styles.css:5004 |
| 2 | `to` | `@keyframes fadeIn` | index.html:1600 | styles.css:5008 |
| 3 | `from` | `@keyframes slideIn` | index.html:1529 | styles.css:5277 |
| 4 | `to` | `@keyframes slideIn` | index.html:1533 | styles.css:5281 |
| 5 | `.badge-jeton` | `_(global)_` | index.html:3772 | styles.css:10328 |
| 6 | `.badge-jeton-delai` | `_(global)_` | index.html:3797 | styles.css:10344 |
| 7 | `.badge-jeton-reprise` | `_(global)_` | index.html:3803 | styles.css:10340 |
| 8 | `.badge-statut` | `_(global)_` | index.html:3809 | styles.css:2543 |
| 9 | `.badge-statut.non-evalue` | `_(global)_` | index.html:3817 | styles.css:5499 |
| 10 | `.btn-groupe` | `_(global)_` | index.html:1517 | styles.css:4322 |
| 11 | `.carte` | `_(global)_` | index.html:1415 | styles.css:2046 |
| 12 | `.carte-metrique-bleue` | `_(global)_` | index.html:1637 | styles.css:6305 |
| 13 | `.carte-metrique-verte` | `_(global)_` | index.html:1645 | styles.css:6315 |
| 14 | `.carte-metrique-violette` | `_(global)_` | index.html:1745 | styles.css:6326 |
| 15 | `.conteneur` | `_(global)_` | index.html:260 | styles.css:854 |
| 16 | `.controle-form` | `_(global)_` | index.html:1435 | styles.css:3496 |
| 17 | `.controle-form:focus` | `_(global)_` | index.html:1452 | styles.css:3505 |
| 18 | `.empty-state-center-30` | `_(global)_` | index.html:2848 | styles.css:3528 |
| 19 | `.groupe-form` | `_(global)_` | index.html:1459 | styles.css:3473 |
| 20 | `.groupe-form label` | `_(global)_` | index.html:1463 | styles.css:3481 |
| 21 | `.mt-3` | `_(global)_` | index.html:1513 | styles.css:5528 |
| 22 | `.notification-succes` | `_(global)_` | index.html:1539 | styles.css:5180 |
| 23 | `.section-accordeon` | `_(global)_` | index.html:1859 | styles.css:8505 |
| 24 | `.section.active` | `_(global)_` | index.html:1389 | styles.css:1949 |
| 25 | `.sous-navigation` | `_(global)_` | index.html:1355 | styles.css:1871 |
| 26 | `.tableau` | `_(global)_` | index.html:1470 | styles.css:2625 |
| 27 | `.tableau td` | `_(global)_` | index.html:1497 | styles.css:2794 |
| 28 | `.tableau th` | `_(global)_` | index.html:1479 | styles.css:2641 |
| 29 | `.tableau-blanc` | `_(global)_` | index.html:2020 | styles.css:2803 |
| 30 | `.text-muted` | `_(global)_` | index.html:1506 | styles.css:5505 |
| 31 | `:root` | `_(global)_` | index.html:17 | styles.css:1 |
| 32 | `body` | `_(global)_` | index.html:249 | styles.css:826 |
| 33 | `html` | `_(global)_` | index.html:242 | styles.css:821 |

---

_Rapport généré automatiquement par `Rapports/_outils/audit-duplication-css.py`._