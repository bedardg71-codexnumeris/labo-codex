# Audit — Apparence des bibliothèques (5 ressources)

**Date** : 9 mai 2026
**Beta** : 99.39
**Périmètre** : modales bibliothèque pour grilles, échelles, cartouches, productions, pratiques.
**Objectif** : inventorier l'état actuel, lister les incohérences observées, proposer une cible commune et un plan de migration.

---

## 1. Contexte

Chaque ressource pédagogique dispose de **deux modales bibliothèque** :

1. **Sidebar / "Ma sélection"** : la liste des items affichés dans la barre latérale active (boutons Dupliquer / Retirer / Supprimer, et historiquement Exporter).
2. **Pool / "Disponibles à ajouter"** : le pool d'items à intégrer dans ma sélection (boutons Ajouter à ma sélection / Supprimer).

Soit **5 × 2 = 10 modales**.

Le code passe par un module partagé `js/bibliotheque-ui.js` (`BibliothequeUI`) pour 4 ressources sur 5. **Pratiques fait exception** : son rendu est inline dans `pratiques-materiel.js`.

---

## 2. État actuel par ressource

### 2.1 Module partagé `BibliothequeUI` (js/bibliotheque-ui.js, 287 lignes)

| API | Rôle |
|-----|------|
| `creerModal(config)` | Squelette de la modale + sections |
| `renderCarteSelection(opts)` | Carte sidebar (3 boutons standard) |
| `renderCarteDisponible(opts)` | Carte pool (2 boutons empilés) |
| `genererBadgeSource(item, locaux)` | Badge `Locale` / `Bibliothèque` / `Démo` |
| `genererIdCourt(id)` | `id.slice(-6)` ← **bug** (voir §4) |
| `formaterAttribution(item)` | "par X" |
| `formaterInspireDe(item)` | "Inspiré de Y" |

**Utilisé par** : grilles, échelles, cartouches, productions (4/5).
**N'utilise pas** : pratiques (`pratiques-materiel.js` construit son HTML manuellement).

### 2.2 Tableau comparatif des 10 modales

| Ressource | Sidebar : boutons | Sidebar : layout | Pool : boutons | Pool : layout |
|-----------|-------------------|------------------|----------------|---------------|
| Grilles | Dupliquer · Retirer · Supprimer | horizontal compact | Ajouter à ma sélection · Supprimer | vertical empilé |
| Échelles | idem | idem | idem | idem |
| Cartouches | idem | idem | idem | idem |
| Productions | idem | idem | idem | idem |
| Pratiques | Dupliquer · **Exporter** · Retirer · Supprimer (4 boutons) | horizontal flex | Ajouter (1 bouton seul) | horizontal aligné droite |

**Asymétrie** : pratiques garde 4 boutons en sidebar (raison : `partagerPratiqueMateriel` télécharge un vrai JSON, conservé après #262 Phase 2 — voir commit `8d1fb7b`). Pool pratiques : 1 seul bouton (pas de Supprimer).

---

## 3. Cartographie des badges

### 3.1 Badges affichés (par ressource)

| Badge | Source | Grilles/Échelles/Cartouches/Productions | Pratiques |
|-------|--------|------------------------------------------|-----------|
| **Type** (STD/SPE/MULTI/SOM/DEN) | `pratique.type` | ❌ | ✅ (couleur par type) |
| **Préfixe titre** (`[Démo]`, `[Multi]`, `[SPE]`) | hardcodé dans `nom` | ✅ | partiellement |
| **`#identifiant`** | `id.slice(-6)` | ✅ (toutes) | ✅ |
| **Source** (`Locale`/`Bibliothèque`/`Démo`) | flag `dansBibliotheque` + `isDemo` | ✅ | ✅ |
| **`Démo`** (badge violet séparé) | `isDemo === true` | ✅ (en plus du préfixe titre) | ✅ |
| **Auteur** | `formaterAttribution(item)` | ✅ subtitle | ✅ subtitle |
| **`Gabarit`** | `pratique.estGabarit === true` | ❌ | ✅ |

### 3.2 Redondances identifiées

1. **Type 2× affiché** (pratiques) : badge coloré `STD` à gauche **et** parfois `[STD]`/`[SPE]` dans le titre.
2. **Démo 3× affiché** (grilles pool) : préfixe `[Démo]` dans titre + badge violet `Démo` + couleur de carte spécifique.
3. **`Bibliothèque` toujours présent** : badge contextuel qui n'apporte aucune info par-item (la modale s'appelle déjà "Bibliothèque").
4. **`#identifiant` non actionnable** : un humain ne peut rien faire d'un suffixe hex de 6 chars (et le bug §4 le rend illisible pour les démos).

---

## 4. Bug confirmé : `#YTIQUE` / `#ECTIFS` / `#SITION` / `#TFOLIO`

### Symptôme

Capture (grilles pool) :
- `[Multi] Grille analytique` → `#YTIQUE` (les 6 dernières lettres de "analyt**ique**")
- `[Démo] Grille par objectifs` → `#ECTIFS` (de "obj**ectifs**")
- `[SPE] Gabarit - Prise de position` → `#SITION` (de "po**sition**")
- `[SPE] Gabarit - Portfolio` → `#TFOLIO` (de "por**tfolio**")
- `[SPE] Gabarit - Test` → `#T_TEST`

### Cause racine

`js/bibliotheque-ui.js:22-25` :

```javascript
BibliothequeUI.genererIdCourt = function (id) {
    if (!id || id.length < 6) return id || '?';
    return id.slice(-6);
};
```

L'app génère deux types d'IDs :
- **UUID standard** (`genererIdUnique('GRILLE_')`) → `GRILLE_1707123456789_2_5f8e2c3b1a4d` → `.slice(-6)` = `b1a4d` (suffixe hex pseudo-aléatoire, peu lisible mais inoffensif)
- **ID démo / friendly** (matériel livré avec l'app, fixtures) → `GRILLE_analytique`, `GRILLE_objectifs`, `SPE_portfolio`, `MULTI_test`, etc. → `.slice(-6)` = derniers chars du nom slug → **mot tronqué qui ressemble à un bug**.

### Vraie question

Au-delà de la mauvaise troncation : **est-ce que `#identifiant` mérite d'exister dans l'UI** ? Pour l'utilisateur final, ni un suffixe hex ni une troncation de slug n'a de valeur. C'est un artefact dev exposé.

---

## 5. Synthèse des incohérences

| # | Constat | Sévérité |
|---|---------|----------|
| 1 | Pratiques contourne `BibliothequeUI` (HTML manuel) | Architecture |
| 2 | 4 boutons sidebar pratiques vs 3 boutons sidebar autres | Cohérence visuelle |
| 3 | Pool pratiques : 1 bouton vs 2 boutons autres (pas de Supprimer) | Cohérence visuelle |
| 4 | `[Démo]`/`[Multi]`/`[SPE]` dans le titre **et** badge coloré séparé | Redondance |
| 5 | Badge `Bibliothèque` toujours présent (no-op) | Bruit visuel |
| 6 | `#identifiant` produit des troncations absurdes pour démos | **Bug** |
| 7 | `#identifiant` n'a aucune valeur utilisateur même quand correct | Pertinence |
| 8 | Badge `Démo` violet répété alors que `isDemo` change déjà la teinte | Redondance |
| 9 | Métadonnées subtitle composées par ressource (pas standardisé) | Maintenance |
| 10 | Pratiques affiche un badge `STD/SPE/SOM/DEN` qui n'existe pas pour les autres ressources | Spécificité métier (légitime) |

---

## 6. Cible proposée

### 6.1 Principe directeur

> **Une carte = un nom + un repère typologique + une métadonnée pertinente + une action principale.**
>
> Tout le reste va dans un menu secondaire ou disparaît.

### 6.2 Anatomie cible (croquis ASCII)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Type]  Titre de la ressource                              ┌──────┐  │
│         3 critères · par Auteur · Discipline               │ Action│  │
│         Description courte (1 ligne)                       └──────┘  │
│                                                                  ⋮   │
└──────────────────────────────────────────────────────────────────────┘
```

- **Badge type** : un seul (couleur de fond ou pastille gauche). Remplace `[Démo]/[Multi]/[SPE]/STD/SPE/SOM/DEN` selon la ressource.
- **Titre** : nom propre, sans préfixe `[Démo]/[Multi]/[SPE]`.
- **Subtitle** : 3 infos max, séparées par `·` ; toujours dans l'ordre **quantité · auteur · discipline**.
- **Description** : optionnelle, 1 ligne tronquée.
- **Action principale** : un seul bouton primaire (`Ajouter` dans le pool, `Dupliquer` ou autre dans la sidebar).
- **Menu secondaire** (icône `⋮` ou bouton "Plus") : toutes les autres actions (Retirer, Supprimer, Exporter pour pratiques).

### 6.3 Suppressions proposées

| Élément | Décision | Raison |
|---------|----------|--------|
| `#identifiant` | **Supprimer** | Bug + non actionnable |
| Badge `Bibliothèque` | **Supprimer** | Contexte de la modale |
| Préfixe `[Démo]` dans titre | **Supprimer** | Couvert par badge Démo / coloration |
| Préfixe `[Multi]/[SPE]` dans titre | **Supprimer** | Couvert par badge type |
| Badge `Démo` violet séparé | **Conserver** (ou intégrer dans badge source) | Distinction utile |
| Badge `Locale` / `Bibliothèque` / `Retirée` | **Conserver** (compact) | État pertinent |
| Bouton `Exporter` pratiques | **Conserver** mais migrer dans menu secondaire | Action légitime mais rare |

### 6.4 Migration de pratiques vers `BibliothequeUI`

Pratiques doit passer par `renderCarteSelection` / `renderCarteDisponible`. Le badge type pratique (STD/SPE/SOM/DEN) devient un slot custom dans `BibliothequeUI` (extensible aux autres ressources si besoin).

### 6.5 Filtrage par mode démo (décision actée)

**Principe** : le matériel marqué `isDemo === true` (ou `auteur === 'Labo Codex'`) n'est visible dans les bibliothèques **que lorsque le mode démo est actif** (`db.getSync('demo-actif') === 'true'`).

**Mécanisme actuel** : `js/demo-activation.js` gère un flag `demo-actif` + une migration Phase 5.E qui **nettoie les résidus au boot** quand le mode démo est OFF. Le problème : ce nettoyage est destructif et partiel — les captures montrent qu'en mode normal, des items démo restent affichés (`[Démo] Checklist de spécifications`, etc.).

**Proposition** : remplacer le nettoyage destructif par un **filtre d'affichage** au niveau de `BibliothequeUI.creerModal` (ou dans les fonctions `afficherListe*` / `afficherBibliotheque*`). Pseudo-code :

```javascript
const modeDemoActif = db.getSync('demo-actif', null) === 'true';
const itemsAffichables = items.filter(item =>
    modeDemoActif || !BibliothequeUI.estItemDemo(item)
);
```

**Conséquences positives** :
1. Plus besoin du préfixe `[Démo]` dans les titres (§6.3 confirmé : suppression).
2. Plus besoin du badge violet `Démo` séparé (suppression complète).
3. Plus besoin de coloration spéciale pour les démos.
4. Les bibliothèques en mode normal deviennent considérablement plus calmes (moins de bruit).
5. Les démos restent en stockage (pas perdus si l'utilisateur réactive le mode).

**Tradeoff** : un utilisateur qui veut « Dupliquer une grille démo pour s'en inspirer » doit activer le mode démo, dupliquer (la copie sort de `isDemo=false` automatiquement), désactiver le mode. La copie reste visible en mode normal.

**À examiner** :
- Le flux d'**import** : si un item importé arrive avec `isDemo=true` (matériel CC d'un collègue qui partage un démo), faut-il forcer `isDemo=false` à l'import ? Probablement oui pour préserver l'invariant « démo = matériel livré avec l'app ».
- L'**auteur `Labo Codex`** comme alias de démo : `BibliothequeUI.estItemDemo` détecte les deux. À garder.

---

## 7. Plan de migration (phasé)

### Phase A — Quick wins (≈ 2-3 h)
- **A.0** : Filtrage par mode démo (décision §6.5) — masque les items `isDemo` quand mode démo OFF. Débloque A.3 et simplifie tout le reste.
- A.1 : Fix `genererIdCourt` ou retirer l'affichage `#identifiant`
- A.2 : Retirer badge `Bibliothèque` (no-op contextuel)
- A.3 : Retirer préfixes `[Démo]/[Multi]/[SPE]` des titres (les démos sont déjà filtrés par A.0 ; les `[Multi]/[SPE]` restent couverts par badge type)
- A.4 : Retirer le badge violet `Démo` séparé (rendu inutile par A.0)

### Phase B — Uniformisation pratiques (≈ 4 h)
- B.1 : Migrer `pratiques-materiel.js` vers `BibliothequeUI.renderCarteSelection`
- B.2 : Étendre `BibliothequeUI` pour supporter le slot "badge type pratique" (paramétrable)
- B.3 : Aligner le nombre de boutons sidebar (4 → 3 + menu, ou 3 unifiés)

### Phase C — Refonte carte (≈ 1 j)
- C.1 : Spec visuelle dans `design-system.html` (carte bibliothèque type)
- C.2 : Refactor `renderCarteSelection` / `renderCarteDisponible` — bouton primaire + menu secondaire `⋮`
- C.3 : Tests visuels mode clair + sombre, iPad + Mac

### Phase D — Cohérence métadonnées (≈ 2 h)
- D.1 : Standardiser `formaterMetadonnees(item, ressource)` dans `BibliothequeUI`
- D.2 : Ordre fixe : quantité · auteur · discipline
- D.3 : Tronquer description à N caractères

---

## 8. Décisions actées (9 mai 2026)

| # | Question | Décision |
|---|----------|----------|
| 1 | Filtrage des items démo en mode normal (§6.5) | ✅ **Filtrer** — items `isDemo` masqués quand `demo-actif !== 'true'` |
| 2 | Affichage `#identifiant` | ✅ **Supprimer complètement** — bug `#YTIQUE` + non-actionnable |
| 3 | Préfixes `[Démo]/[Multi]/[SPE]/[STD]` dans titres | ✅ **Supprimer tous** — couverts par badges + filtrage |
| 4 | Layout des boutons d'action | ✅ **Action principale + menu `⋮`** — un primaire visible, autres dans menu |
| 5 | Pratiques : 3 vs 4 boutons | ✅ **Résolu par Q4** — `Exporter` part dans le menu `⋮` comme les autres actions secondaires |
| 6 | Badge `Bibliothèque` | ✅ **Supprimer** — bruit visuel contextuel |

**Conséquences combinées** : la carte cible se réduit à `[badge type] · titre nu · subtitle (qty · auteur · discipline) · description (1 ligne) · bouton principal · menu ⋮`. Les bibliothèques en mode normal perdent ~50% de leur bruit visuel actuel.

---

## 9. Références

- `js/bibliotheque-ui.js` — module partagé (287 l.)
- `js/grilles.js:2179-2234` — pattern de référence
- `js/pratiques-materiel.js:298-571` — outlier à migrer
- `design-system.html` — racine, source de vérité visuelle
- `js/main.js:27-37` — `genererIdUnique`
- Commit `8d1fb7b` (#262 Phase 2) — retrait des doublons "Exporter" précédents
