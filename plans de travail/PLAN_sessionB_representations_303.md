# PLAN — Session B (représentations) · #303 refactor pratiques SSOT

> **Statut** : prêt à coder · **Créé** : 4 juin 2026 · **Branche** : `claude/eager-wozniak-KpaAC`
> **Préalable** : Session A (identifiants) LIVRÉE (beta 99.80, volet B 99.86). La résolution
> id→instance est fiable (`normaliserIdPratique`, `obtenirPratiqueParId`). Post-AQPC : la porte est levée.

---

## 1. Objectif

Faire du **registre de pratiques la source unique** pour les trois représentations d'une
pratique de notation :

- **CODE** court : `SOM` / `STD` / `SPE` / `DEN`
- **COULEUR** : variable CSS canonique du design system (`--som-orange`, `--std-bleu`,
  `--spe-vert`, `--den-violet`)
- **LABEL DE FAMILLE** : `Sommative` (pour SOM) · `PAN` (pour STD/SPE/DEN)

Puis **router tous les badges/couleurs/libellés vers le registre** et **supprimer** les
~7 tables locales éparpillées (principe zéro-dette : on retire ce qu'on remplace).

### Invariant
Rendu visuel **identique avant/après** pour les pratiques de Grégoire (badges STD/SOM
inchangés), **sauf** la correction de deux dérives réelles décrites en §4.

---

## 2. Constat d'audit (4 juin 2026)

Aucune source unique pour le triplet {code, couleur, famille}. Inventaire des
**tables de représentation réellement dupliquées** (à router puis supprimer) :

| # | Fichier | Lignes | Forme | Contenu |
|---|---------|--------|-------|---------|
| 1 | `js/main.js` | ~145-161 | if/else | code + classe CSS |
| 2 | `js/pratique-notation-v2.js` | ~375-379 | objet `badgeConfig` | type→{classe, code} |
| 3 | `js/pratiques-gestion.js` | ~293-309 | objet `typeMapping` + rendu | type→code + classe |
| 4 | `js/etudiants.js` | ~462-481 | if/else | code + classe + description famille |
| 5 | `js/gabarits-utils.js` | ~23-39, 145-148 | `PRATIQUES_DISPONIBLES` + `COULEURS_PRATIQUES` + `genererBadgePratique` | code + nom + **couleur (hex divergent)** + description |
| 6 | `js/donnees-v2.js` | ~1259-1267 | objet `badges` | type→HTML badge (**clé `denominateur` boguée**) |
| 7 | `js/echelles.js` | ~2479-2482 | `<option>` statiques | code→label |

### Hors scope (NE PAS toucher)
- **`js/couleurs.js` (19-25)** : mappe les **indices A-C-P** (A→bleu, C→orange, P→vert),
  pas les pratiques. Réutilisation fortuite des mêmes variables CSS. **Faux positif.**
- **`js/pratiques-bibliotheque.js`** : `type:`/`pratiques:['STD']` sont des **données de
  semence** (entrées), pas une table de rendu. Elles alimentent le générateur de badge.
- **`styles.css`** : les classes `.badge-type-som/std/spe/den` et les variables
  `--som-orange`… **restent** (c'est la cible de rendu, pas une duplication de logique).
- **`pratique-registre.js` `TABLE_NORMALISATION_PRATIQUE`** : SSOT d'identité (Session A).
- **Ids DOM** (`mat-config-*`, `v2-*`) : jamais normalisés.

---

## 3. Conception cible

### 3.1 Table canonique unique (dans `pratique-registre.js`)
Clé = identifiant **canonique** (post-`normaliserIdPratique`) :

```js
const REPRESENTATIONS_PRATIQUES = {
    sommative:      { code: 'SOM', couleurVar: '--som-orange', famille: 'Sommative' },
    standards:      { code: 'STD', couleurVar: '--std-bleu',   famille: 'PAN' },
    specifications: { code: 'SPE', couleurVar: '--spe-vert',   famille: 'PAN' },
    denotation:     { code: 'DEN', couleurVar: '--den-violet', famille: 'PAN' }
};
const REPRESENTATION_DEFAUT = REPRESENTATIONS_PRATIQUES.standards; // défaut = pratique défaut
```

### 3.2 Helpers exposés par le registre (SSOT)
- `obtenirRepresentationPratique(id)` → objet `{code, couleurVar, famille, classe}` (normalise l'id, fallback défaut)
- `obtenirCodePratique(id)` → `'STD'`
- `obtenirCouleurPratique(id)` → `'var(--std-bleu)'` (utilisable en style inline / Chart.js résolu)
- `obtenirLabelFamillePratique(id)` → `'PAN'`
- `genererBadgePratiqueHTML(id)` → `'<span class="badge-type-pratique badge-type-std">STD</span>'`
  (générateur **unique**, échappement non requis : sortie 100 % contrôlée)

`classe` = `'badge-type-' + code.toLowerCase()`.

### 3.3 Extension de `IPratique` (méthodes d'instance)
Chaque pratique gagne, en délégant au registre via son id canonique :
- `obtenirCode()` · `obtenirCouleur()` · `obtenirLabelFamille()`

- **Instances codées en dur** (`sommative`, `standards`, `specifications`) : id déjà canonique.
- **`PratiqueConfigurable`** : dérive du **type canonique** (`normaliserIdPratique(this.config.type)`),
  pas de l'id (les ids configurables sont libres : `pan-standards-bedard`, `pratique-1768…`).
  → ajouter le passthrough `type` dans `construireConfigComplete`.
- **`pratique-pan-objectifs`** (id legacy `pan-objectifs`, non normalisé en Session A) :
  représentation = `standards` (décision D1, fold en Session C). À gérer dans la table de
  normalisation *de représentation* OU via une entrée dédiée renvoyant STD.
- **`pratique-test`** : pratique de test → représentation neutre (défaut STD ou SOM selon son type).

### 3.4 Documentation
- `pratique-interface.js` : documenter les 3 nouvelles méthodes.

---

## 4. Deux dérives corrigées par la centralisation

1. **Couleurs `gabarits-utils.js`** divergent du design system :
   - actuel : SOM `#6c757d`, STD `#17a2b8`, SPE `#28a745`, DEN `#ffc107`
   - canonique (CSS) : SOM `#ff6f00`, STD `#0277bd`, SPE `#22c55e`, DEN `#8b5cf6`
   - → après routage, les pastilles de filtre adoptent la palette officielle.
2. **`donnees-v2.js`** : clé `denominateur` (typo) ne matchait jamais `denotation` →
   badge DEN jamais rendu par ce chemin. Corrigé par le générateur unique.

> Ces deux écarts sont des **corrections assumées** (à signaler à Grégoire), pas des
> régressions.

---

## 5. Découpage en lots (commits)

**Lot 1 — Fondation (registre + IPratique + tests)** · *non destructif, additif*
- Table `REPRESENTATIONS_PRATIQUES` + helpers + `genererBadgePratiqueHTML` dans le registre.
- Méthodes `obtenirCode/Couleur/LabelFamille` sur chaque classe de pratique.
- Passthrough `type` dans `construireConfigComplete`.
- `pratique-interface.js` documenté.
- **Test Vitest** `representation-pratiques` : code/couleur/famille pour les 4 familles +
  fallback + configurable par type + idempotence via normalisation.
- ✅ Validation : `node --check` sur chaque fichier + `npm test` vert.

**Lot 2 — Routage des badges** · *remplace, puis supprime*
- `donnees-v2.js`, `pratiques-gestion.js`, `pratique-notation-v2.js`, `main.js`,
  `etudiants.js` : remplacer chaque table/if-else par `genererBadgePratiqueHTML(...)` /
  `obtenirCodePratique(...)`.
- **Supprimer** les tables locales (zéro-dette).
- Test sentinelle : grep statique qu'aucune des tables supprimées ne réapparaît.

**Lot 3 — Couleurs + listes** · *remplace, puis supprime*
- `gabarits-utils.js` : `COULEURS_PRATIQUES`/`genererBadgePratique` → registre ;
  `PRATIQUES_DISPONIBLES` dérivé du registre (ou conservé comme liste d'ordre d'affichage
  si nécessaire, mais couleurs/codes via registre).
- `echelles.js` : `<option>` générées depuis le registre (ou laissées si statiques sûres).

**Lot 4 — Vérification & doc** 
- Audit final : plus aucune table de représentation hors registre.
- `node --check` global, `npm test`, validation terrain (Mac + iPad, 2 modes).
- Mise à jour `SESSION.md` / `BACKLOG.md` (#303 Session B livrée).

---

## 6. Risques & garde-fous

- **Fichiers calcul-adjacents** (`pratiques.js`, `etudiants.js`) : on ne touche QUE le rendu
  (badge/couleur/label), jamais le calcul d'indices. Vérifier `node --check` + diff ciblé.
- **CSP `script-src 'self'`** : `genererBadgePratiqueHTML` produit une sortie contrôlée
  (codes du registre), pas de données utilisateur → pas d'`echapperHtml` requis, mais
  zéro handler inline.
- **Round-trip configurable** : tester qu'une pratique wizard (type `standards`) rend `STD`.
- **`pan-objectifs`** : non remappé en Session A ; ici sa **représentation** = STD (fold D1).
- **Sécurité** : tout chantier Phase 1+ ajoute ≥ 1 test (Lot 1 = test Vitest).

---

## 7. Ordre d'exécution
Lot 1 → valider/commit → Lot 2 → valider/commit → Lot 3 → valider/commit → Lot 4 → push.
Bump version via `node scripts/release.mjs minor` (nouveauté sans rupture de données).
