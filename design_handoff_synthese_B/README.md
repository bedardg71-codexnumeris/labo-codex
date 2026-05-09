# Handoff — Synthèse de rétroaction (Direction B « Tableau de bord »)

## 1. Vue d'ensemble

Cette page est la **synthèse de rétroaction d'un artefact** dans une application
d'évaluation par compétences (échelle IDME : 0 / I / D / M / E). Elle est
imprimable au format **Lettre US portrait (8.5″ × 11″)** et est destinée à être
remise à l'élève une fois la copie corrigée.

La direction retenue est **B — « Tableau de bord critères »** : approche data-viz,
une rangée par critère avec une jauge IDME 5-crans, grille structurée pour les
tampons groupés par famille, sparkline d'erreurs, bilan en bande pleine largeur.

## 2. À propos des fichiers fournis

Les fichiers de ce dossier sont des **références de design réalisées en HTML/JSX
mocké via Babel-in-browser**. Ce ne sont **pas** du code de production à coller
tel quel.

L'objectif est de **recréer fidèlement ce design dans la stack cible
(Next.js / Remix)** en utilisant les conventions, le système de design et les
composants déjà en place dans le codebase. Le HTML/JSX fourni sert de **vérité
visuelle** : pixel-perfect, valeurs exactes, comportement attendu.

## 3. Fidélité

**Haute fidélité (hifi).** Tous les choix typo, couleurs, espacements, bordures
et radii sont arrêtés. Le développeur doit reproduire l'apparence à la pixel
près en utilisant les composants/variables de son codebase.

> **⚠️ Note importante du designer :** le mock contient des **données fictives
> (placeholders)** générées dans `source/data.jsx` (élève « Léa Tremblay »,
> artefact 6, etc.). En production, **l'application remplira ces champs avec
> les résultats réels** au moment de la génération. La structure (« shape »)
> de `data.jsx` est ce qui doit être respecté — voir §8.

## 4. Stack cible

- **Framework :** Next.js (App Router) ou Remix.
- **Langage :** TypeScript recommandé. Les types peuvent être dérivés de la shape
  de `data.jsx` (voir §8).
- **Rendu :** server component privilégié — la page est statique côté client une
  fois rendue (pas d'interactivité, pas de state).
- **Print-ready :** la page **doit s'imprimer correctement** (format Lettre US,
  marges respectées, pas de débordement). Voir §10.
- **Design system de l'app :** **respecter les couleurs et le design général
  déjà en place dans l'application.** Les valeurs ci-dessous (§7) sont celles
  alignées sur l'app actuelle ; si elles divergent du design system existant,
  **le design system de l'app fait foi**.

## 5. Structure de la page

Layout vertical en 5 zones empilées dans un conteneur **8.5″ × 11″** avec
padding `0.45in 0.5in`, fond blanc, `display: flex; flex-direction: column`,
`font-family: Inter`, `font-size: 10px`, `line-height: 1.4`.

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│  • Métadonnées cours / session / artefact n/total   │
│  • Titre artefact (h1, 20px, weight 700)            │
│  • Élève · DA · Groupe · date corrigé               │
│  • TrimestreBar (8 cases, à droite)                 │
├─────────────────────────────────────────────────────┤
│ RUBAN OBJECTIF / TÂCHE / CONTEXTE (3 col, fond crème)│
├─────────────────────────────────────────────────────┤
│ RÉTROACTION GÉNÉRALE                                │
│  • Légende IDME (en haut à droite)                  │
│  • Tableau bordé : 5 lignes (1 par critère)         │
│      [Nom + sub + poids] [Jauge 5-crans] [Comment]  │
│  • Bandeau Niveau global (couleur du code, lettre   │
│    géante 44px + libellé + commentaire)             │
├─────────────────────────────────────────────────────┤
│ COMMENTAIRES CIBLÉS  (1.55fr) │ FRANÇAIS ÉCRIT (1fr)│
│  3 colonnes par famille       │  Top 3 erreurs      │
│  (Action / Observations /     │  + bar count + total│
│   Compréhension)              │                     │
├─────────────────────────────────────────────────────┤
│ FOOTER — BILAN & PISTES (3 colonnes : forces / défis│
│ / gestes à poser ; la 3ᵉ est emphasized = fond noir)│
└─────────────────────────────────────────────────────┘
```

## 6. Composants détaillés

### 6.1 `VariantB` (root)

- **Conteneur :** `width: 8.5in; height: 11in; background: #fff; padding:
  0.45in 0.5in; display: flex; flex-direction: column`.
- **Typo de base :** `Inter` (`-apple-system, system-ui` en fallback), 10px / 1.4.
- **Police mono :** `JetBrains Mono` (`IBM Plex Mono, ui-monospace` fallback) —
  utilisée pour toutes les **étiquettes** (CAPS, letter-spacing 0.5–0.8), les
  codes IDME, les codes d'erreurs, les dates.

### 6.2 `header` (en-tête)

- **Grid** `1fr auto`, `align-items: end`, `gap: 12px`, `margin-bottom: 10px`.
- **Colonne gauche** :
  - Mono 8.5px, `letter-spacing: 0.5px`, `text-transform: uppercase`, color
    `--muted (#767169)` :
    `{course.code} / {session.toLowerCase()} / artefact {n} of {total}`.
  - h1 20px, weight 700, `letter-spacing: -0.4`, marges 2px verticales :
    `{artefact.title}`.
  - Mono 9px, color muted ; nom élève en `--ink` weight 600 :
    `<b>{firstName} {lastName}</b> · DA {da} · Gr. {group} · corrigé {corrected}`.
- **Colonne droite** : `<TrimestreBarB />` (voir 6.4).

### 6.3 Ruban OBJ / TÂCHE / CONTEXTE

- Grid `1fr 1fr 1fr`, gap 14px, fond `--card (#f5f4f1)`, padding `8px 10px`,
  `border-radius: 3px`, font-size 9.5px, `margin-bottom: 10px`.
- Pour chaque cellule : étiquette mono 7.5px CAPS + texte courant.

### 6.4 `TrimestreBarB`

Barre horizontale de 8 cases représentant les artefacts du trimestre.

- Ligne d'en-tête mono 7.5px alignée à droite : `PROGRESSION · TRIMESTRE · 4
  MEILLEURES + 2 OBLIGATOIRES`.
- Une rangée de 8 cases de **26px de large** (gap 2px), chacune avec :
  - **Pastille obligatoire** au-dessus (`●` 8px en `--ink` si `t.obligatoire`).
  - **Carré 22×22, radius 2px** :
    - Si `status === "current"` → fond `--ink`, texte blanc, contenu = code IDME.
    - Si `status === "done"` → fond = `CODE_COLOR[t.code]`, texte blanc, contenu
      = code IDME.
    - Si `status === "todo"` → fond transparent, bordure dashed `--line`, texte
      muted, contenu = numéro `t.n`.
  - **Numéro d'artefact** en dessous (mono 6.5px, weight 700 si current).
  - **Date d'échéance** en dessous (mono 6px) si `todo` et `t.due` présent,
    formaté `fr-CA` court (« 8 mai »).

### 6.5 `LegendB`

Pastille couleur (8×8, radius 1px) + code IDME + libellé pour chaque cran de
l'échelle. Mono 8px. Affichée à droite de l'en-tête « Rétroaction générale ».

### 6.6 `CriterionB` (rangée du tableau de bord)

Grid `130px 135px 1fr`, gap 10px, padding `8px 10px`, `border-bottom: 1px solid
--line` sauf dernière rangée.

- **Col 1 — Identité du critère** :
  - Nom 11px weight 700.
  - Sub mono 7.5px muted : `{weight}% · {sub}`.
- **Col 2 — Jauge IDME 5-crans** : 5 segments flex avec gap 3px, height 18px,
  radius 2px.
  - Chaque segment affiche son code (0/I/D/M/E) en mono 9px.
  - Segments `i ≤ idx_atteint` → fond = `CODE_COLOR[c.code]`, texte blanc.
  - Segment `i === idx_atteint` → bordure 1px solid `--ink`, weight 800.
  - Segments suivants → fond `--card`, texte muted, bordure 1px solid `--line`.
- **Col 3 — Commentaire** : 10px / 1.35.

### 6.7 Bandeau « Niveau global »

Hors tableau, au-dessous, `margin-top: 10px`.

- Grid `auto 1fr`, gap 14px, padding `10px 12px`, radius 3px.
- **Fond** = `CODE_COLOR[overall]` (donc varie selon le résultat).
- Texte blanc.
- Lettre géante : 44px, weight 800, `line-height: 0.85`, `letter-spacing: -2`.
- Libellé : mono 8px CAPS opacity 0.85 — `Niveau général · {label}`.
- Note : 10.5px — `{overallNote}`.

### 6.8 `StampColumnB` (par famille de tampons)

3 colonnes côte à côte (Action / Observations / Compréhension).

- Carte : bordure 1px `--line`, radius 3px, padding `6px 7px`, fond blanc.
- En-tête mono 7.5px CAPS, weight 700, **couleur = couleur de la famille** (voir
  §7), border-bottom `--line`, marge bas 5px : `{fam} · {count}`.
- Pour chaque tampon : grid `18px 1fr`, gap 5px, marge bas 4px.
  - **Pastille** 16×16, radius 2px, fond = couleur famille, texte blanc, mono
    weight 700, contenu = numéro `it.n` (qui correspond au numéro tracé sur la
    copie de l'élève).
  - **Bloc texte** : nom du tampon 8.5px weight 600 + commentaire 9px / 1.3.

### 6.9 `ErrorsB`

Carte bordée, padding `6px 10px`. Pour chaque erreur (top 3) :

- Grid `20px 1fr 24px`, gap 6px, padding `5px 0`, séparée par `border-top: 1px
  dashed --line` (sauf la première).
- **Pastille** 18×18 ronde, fond `--ink`, texte blanc, mono 9px weight 700, code
  numérique de l'erreur.
- **Bloc central** : nom de l'erreur 9px weight 600 + barre de remplissage
  height 4px (fond `--card`, fill `CODE_COLOR["I"]`, largeur =
  `count/max * 100%`).
- **Compteur** : mono 11px weight 700, aligné droite.

### 6.10 `BilanCardB` (3 colonnes en pied de page)

Grid `1fr 1fr 1.15fr` dans le footer, gap 8px.

- Carte : bordure 1px `--line`, radius 3px, padding `8px 10px`,
  **`border-top: 3px solid {color}`** où color = couleur du code IDME associé
  (voir ci-dessous).
- Variante **`emphasized` (gestes à poser)** : fond `--ink`, texte blanc.
- Titre mono 8px CAPS letter-spacing 0.8, weight 700, **color = color de la
  carte**.
- Liste `<ul>` 9.5px / 1.4, padding-left 14px.

Mapping couleurs → cartes :
- **FORCES** : `CODE_COLOR["M"]` (vert).
- **DÉFIS** : `CODE_COLOR["I"]` (orange).
- **GESTES À POSER** : `CODE_COLOR["E"]` (cyan), avec `emphasized`.

## 7. Tokens de design

### 7.1 Couleurs neutres

| Token       | Valeur     | Usage                                  |
| ----------- | ---------- | -------------------------------------- |
| `--ink`     | `#141414`  | Texte principal, fond pastilles erreurs|
| `--paper`   | `#ffffff`  | Fond page                               |
| `--card`    | `#f5f4f1`  | Fond ruban OBJ/TÂCHE, segments inactifs|
| `--line`    | `#e3e0d8`  | Bordures, séparateurs                   |
| `--muted`   | `#767169`  | Texte secondaire, étiquettes mono       |

### 7.2 Échelle IDME (couleurs alignées sur l'application)

Lues directement depuis `data.scale[i].color` — **ne pas hardcoder**, utiliser la
table fournie par l'API.

| Code | Libellé           | SOLO              | Plage % | Couleur     |
| ---- | ----------------- | ----------------- | ------- | ----------- |
| `0`  | Non recevable     | Préstructurel     | 0       | `#b8b8b8`   |
| `I`  | Insuffisant       | Unistructurel     | 0–64    | `#f08c3a`   |
| `D`  | En développement  | Multistructurel   | 65–74   | `#f0c83a`   |
| `M`  | Maîtrisé          | Relationnel       | 75–84   | `#5fb84a`   |
| `E`  | Étendu            | Abstrait étendu   | 85–100  | `#27b9e0`   |

### 7.3 Familles de tampons

| Famille        | Couleur     | Description                  |
| -------------- | ----------- | ---------------------------- |
| Action         | `#27b9e0`   | Gestes d'écriture            |
| Observations   | `#b85a3a`   | Procédés repérés             |
| Compréhension  | `#5fb84a`   | Niveau SOLO                  |

### 7.4 Typographie

- **Sans :** Inter — 400, 500, 600, 700, 800.
  Fallback : `-apple-system, system-ui, sans-serif`.
- **Mono :** JetBrains Mono — 400, 500, 700.
  Fallback : `IBM Plex Mono, ui-monospace, monospace`.

Échelle utilisée :

| Usage                                  | Taille | Weight | Mono ? |
| -------------------------------------- | ------ | ------ | ------ |
| Titre artefact (h1)                    | 20px   | 700    | non    |
| Code global (lettre géante)            | 44px   | 800    | non    |
| Nom critère                            | 11px   | 700    | non    |
| Compteur erreur                        | 11px   | 700    | oui    |
| Texte courant / commentaires           | 10px   | 400    | non    |
| Note overall, ruban OBJ                | 10.5 / 9.5 | 400 | non  |
| Bilan items                            | 9.5px  | 400    | non    |
| Comment tampon, erreurs                | 9px    | 400    | non    |
| Métadonnées élève                      | 9px    | 400    | oui    |
| Titres de section (HeaderB)            | 9px    | 700    | oui    |
| Titre carte bilan                      | 8px    | 700    | oui    |
| Étiquettes ruban (OBJ/TÂCHE/CONTEXTE)  | 7.5px  | 700    | oui    |
| En-tête famille tampons                | 7.5px  | 700    | oui    |
| Numéro artefact (sous case timeline)   | 6.5px  | 400/700| oui    |
| Date échéance timeline                 | 6px    | 400    | oui    |

### 7.5 Espacements / radius

- Page padding : `0.45in 0.5in`.
- Radius : 2px (segments jauge, pastilles tampons), 3px (cartes, ruban).
- Bordures : `1px solid var(--line)` partout sauf rangées : `1px dashed
  var(--line)` pour erreurs.

## 8. Données — `FEEDBACK` (shape)

Voir `source/data.jsx`. Le développeur doit produire ce contrat (recommandé en
TypeScript). Tous les champs sont **fournis par l'application** — ce sont les
**vrais résultats**, pas des constantes.

```ts
type Code = "0" | "I" | "D" | "M" | "E";
type Status = "done" | "current" | "todo";
type Family = "Action" | "Observations" | "Compréhension";

interface Feedback {
  student: { firstName: string; lastName: string; da: string; group: string };

  course: {
    code: string;       // "601-101-MQ"
    name: string;       // "Écriture et littérature"
    session: string;    // "Hiver 2026"
    teacher: string;
  };

  artefact: {
    number: number;     // 6
    total: number;      // 7
    title: string;
    submitted: string;  // ISO date "2026-04-18"
    corrected: string;  // ISO date
    objective: string;
    task: string;
    context: string;
  };

  // 8 entrées (les 7 artefacts + un éventuel 8e)
  trimestre: Array<{
    n: number;
    label: string;
    status: Status;
    code: Code | null;          // null si status=todo
    obligatoire?: boolean;
    due?: string;               // ISO date, présent si status=todo
  }>;

  // L'échelle IDME — 5 entrées dans cet ordre. La couleur est CONTRACTUELLE :
  // c'est la palette de l'app. La grille du composant lit `scale[i].color`.
  scale: Array<{
    code: Code;
    label: string;
    solo: string;
    min: number;
    max: number;
    color: string;              // hex
  }>;

  criteria: Array<{
    key: string;                // slug stable
    name: string;
    weight: number;             // pondération en %
    sub: string;                // sous-titre descriptif
    code: Code;                 // niveau atteint
    comment: string;            // commentaire personnalisé
  }>;

  overall: Code;
  overallNote: string;

  // Tampons groupés par famille (clés EXACTES : Action / Observations /
  // Compréhension — c'est l'ordre de rendu).
  stamps: Record<Family, Array<{
    n: number;                  // numéro tracé sur la copie
    stamp: string;              // nom (ex. "Repérage")
    comment: string;
  }>>;

  errors: Array<{
    code: number;               // code numérique de l'erreur
    name: string;
    count: number;
  }>;
  errorsTotal: number;

  bilan: {
    forces: string[];
    defis: string[];
    pistes: string[];           // « gestes à poser » — typiquement 2
  };
}
```

### Métadonnées additionnelles

- `STAMP_META` : table de métadonnées par tampon (glyphe, code lettre, famille).
  Non utilisée dans la Direction B (B affiche le numéro `n`, pas le glyphe).
  Conservée pour cohérence avec d'autres directions.
- `FAMILY_META` : couleurs des 3 familles (voir §7.3).

## 9. Comportement & interactions

**Aucune interaction.** La page est entièrement statique :
- Pas de hover state.
- Pas de click handler.
- Pas de transition / animation.
- Pas de fetch côté client (rendu serveur recommandé).
- Pas de state local.

## 10. Print-ready

La page **doit s'imprimer correctement** sur du Lettre US portrait :

```css
@page {
  size: letter portrait;
  margin: 0;
}
@media print {
  body { margin: 0; }
  /* Le conteneur racine fait déjà 8.5in × 11in. */
}
```

À vérifier au print :
- Pas de débordement vertical (la maquette respecte 11″ stricte — ne pas
  rallonger le contenu sans revoir la composition).
- Couleurs imprimées : `print-color-adjust: exact` sur le bandeau « Niveau
  global » et les pastilles, sinon les fonds couleur disparaissent.
- Polices : embarquer Inter et JetBrains Mono via `next/font` plutôt que Google
  Fonts CDN pour éviter le FOUT à l'impression.

## 11. Accessibilité (à confirmer côté dev)

- Hiérarchie : `h1` = titre artefact, `h2` = en-têtes de section (mono CAPS).
  Préserver cette hiérarchie sémantique même si l'app a un autre style.
- Le code IDME affiché en couleur dans la jauge est aussi présent **en
  caractère** (le code lettre est lisible) — l'info ne dépend pas que de la
  couleur. Bien conserver.
- Contrastes vérifiés : ink/paper et ink/card OK ; le bandeau Niveau global
  utilise du blanc sur la couleur du code — vérifier WCAG AA pour le code `D`
  (jaune `#f0c83a`) en particulier ; envisager du texte ink dans ce cas.

## 12. Fichiers fournis

```
design_handoff_synthese_B/
├── README.md             ← ce document
├── preview.html          ← ouvre dans un navigateur pour voir le design
└── source/
    ├── variant-b.jsx     ← composant React (référence visuelle)
    └── data.jsx          ← shape des données + valeurs fictives
```

Pour visualiser le mock : ouvrir `preview.html` dans un navigateur (les CDN
React/Babel/Inter sont chargés en ligne).

## 13. Checklist d'implémentation

- [ ] Page Lettre US portrait, 8.5″ × 11″ stricte, bordures 0, fond blanc.
- [ ] Inter + JetBrains Mono via `next/font` (poids listés en §7.4).
- [ ] Tokens de couleur ajoutés au design system de l'app **OU** mappés vers
      les tokens existants si équivalents disponibles.
- [ ] Composant `<Synthese feedback={...} />` accepte un objet `Feedback`
      typé selon §8.
- [ ] Header : grid 1fr auto, TrimestreBar à droite avec les 8 cases.
- [ ] Tableau de bord : 5 critères, jauge 5-crans, segment courant en surbrillance.
- [ ] Bandeau Niveau global avec lettre 44px et fond = `CODE_COLOR[overall]`.
- [ ] Tampons : 3 colonnes par famille avec couleurs alignées.
- [ ] Erreurs : top 3 + total, barres de remplissage en orange (`CODE_COLOR["I"]`).
- [ ] Footer : 3 cartes bilan, la 3ᵉ en mode `emphasized` (fond noir).
- [ ] CSS `@page letter` + `print-color-adjust: exact` sur les fonds colorés.
- [ ] Vérifier impression PDF : aucun débordement, couleurs préservées.

## 14. Hors scope

- **Édition** des champs (l'enseignant ne saisit pas dans ce document).
- **Internationalisation** : la maquette est en français. Si i18n requis, prévoir
  que les libellés mono CAPS sont traduits sans casser le layout (les colonnes
  sont serrées).
- **Versions A et D** : autres directions explorées dans le projet de design,
  non retenues pour cette livraison.

---

*Pour toute question sur l'intention de design, voir `preview.html` qui montre
le rendu exact attendu.*
