# PLAN — Session C (calcul par famille) · #303 refactor pratiques SSOT

> **Statut** : prêt à réviser (PAS encore approuvé pour code) · **Créé** : 4 juin 2026
> **Branche** : `claude/eager-wozniak-KpaAC`
> **Préalables LIVRÉS** : Session A (identifiants, 99.80/99.86) + Session B (représentations, 1.1.2, mergée).
> **Débloque** : #307 phase 1 (simuler/comparer des pratiques sur les mêmes données).

---

## 1. Objectif (énoncé du plan SSOT)

1. **Router le moteur d'indices vers `pratique.calculerPerformance(da)` / `calculerCompletion(da)`** de l'instance.
2. **Supprimer le jeton binaire `'SOM' | 'PAN'`**.
3. **Rattacher le fold `objectifs ⊂ standards`** (décision D1).
4. **Invariant strict** : indices A-C-P **identiques avant/après**, verrouillés par des **tests chiffrés** (golden master).

---

## 2. Constat d'audit (4 juin 2026) — RECADRAGE IMPORTANT

L'audit révèle que **le jeton `SOM|PAN` est déjà vestigial au niveau du calcul** (refonte Beta 95.5). Ça change la nature du chantier : Session C n'est pas « démêler un moteur binaire vivant », mais **découpler le calcul de l'état global actif**.

### 2.1 La structure `indicesCP` est déjà UNIFIÉE (plate)
`portfolio.js:653-661` stocke, par étudiant :
```
indicesCP[da] = { historique:[{date,pratique,C,P,details}], actuel:{date,pratique,C,P,details} }
```
**Plus de branches `.actuel.SOM` / `.actuel.PAN`.** Une seule paire C/P, celle de la **pratique active**.

### 2.2 Le jeton `SOM|PAN` ne branche plus rien
- `obtenirIndicesCP(da, pratique)` (`indices.js:368-386`) **ignore** le paramètre `pratique` (commentaire « Déprécié, ignoré en Beta 95.5 ») : il renvoie le même `actuel.C/P` que le jeton soit `'SOM'` ou `'PAN'`.
- `calculerTousLesIndices(da, pratique=null)` (`indices.js:484`) n'utilise le jeton que pour **étiqueter** le champ `.pratique` du retour ; auto-détecté `config.pratique === 'sommative' ? 'SOM' : 'PAN'` (l.502-504).
- **Conséquence** : les appels comparatifs `calculerTousLesIndices(da,'SOM')` vs `(da,'PAN')` (`profil-etudiant-sections-affichage.js:73-76, 2211-2212, 4007-4008`) renvoient **des valeurs identiques** → le « mode comparatif » affiche deux fois la même chose. Cohérent avec la décision actée `project-mode-comparatif-som-pan-a-retirer` (« n'a jamais servi, n'affiche pas de résultats »).

→ **Retirer le jeton = nettoyage**, pas un changement de calcul. Faible risque sur l'invariant.

### 2.3 Le VRAI verrou #307 : le calcul lit l'état GLOBAL, pas `this.config`
C'est ici que se joue la simulation. Aujourd'hui :
- `calculerEtStockerIndicesCP` (`portfolio.js`) calcule pour la **pratique active uniquement** et écrit **une** paire C/P dans le store global.
- `calculerDetailsNoteFinale(da)` (`profil-etudiant-actions.js:395`) résout la pratique via `obtenirPratiqueActiveGroupeCours()` (l.407) — **pas de paramètre**.
- Les instances lisent le **SSOT global** au lieu de leur propre config :
  - `pratique-pan-standards.js:74` (`modalites.varianteCalcul`), `:701`, `_calculerPerformanceParObjectifs` `:1352` (`modalites.parObjectifs`)
  - `pratique-pan-objectifs.js:377`
  - `pratique-configurable.js:207-208` (`modalites.pratique` pour « déterminer la branche SOM/PAN »)

→ **Impossible de calculer une pratique NON active sur les mêmes données** sans changer l'état global. C'est exactement le comportement émergent #307.

### 2.4 Bug latent confirmé (`pratique-configurable.js:216/221`)
La méthode lit `donneesEtudiant.actuel.PAN?.P` / `.SOM?.P` — **branches qui n'existent plus** (structure plate) → renvoie toujours `0`. Masqué en pratique car `calculerEtStockerIndicesCP` prend P via `calculerDetailsNoteFinale` d'abord, et ne retombe sur `pratique.calculerPerformance` que si la note finale est null. **À corriger** : la méthode doit calculer depuis `this.config` + données brutes, pas relire le store d'indices (dépendance circulaire en prime, déjà notée l.253 pour `calculerCompletion`).

### 2.5 Calculateurs en double / morts (zéro-dette)
- `calculerPerformancePAN(da)` (`indices.js:422`) — **fallback** dupliquant la logique N-meilleurs de `PratiquePANStandards.calculerPerformance`. À retirer une fois le routage instance fiable.
- `calculerCompletionSommative` / `calculerCompletionAlternative` (`liste-evaluations.js:173/205`) — **orphelins** (aucun appelant, refonte Beta 98). À supprimer.
- `calculerPerformanceParObjectif` (`portfolio.js:737`) — helper de rapports multi-objectifs, **conservé** (hors moteur d'indices).

---

## 3. Conception cible

### 3.1 Paramétrer le calcul par une pratique explicite
- **`calculerDetailsNoteFinale(da, pratiqueId = null)`** : si `pratiqueId` fourni, calcule pour CETTE pratique (résolue via `obtenirPratiqueParId`), sinon comportement actuel (active). Rétro-compatible (param optionnel).
- Les instances `calculerPerformance/Completion` **lisent `this.config`** en priorité, avec repli sur le SSOT global UNIQUEMENT pour la pratique active (transition contrôlée), puis repli retiré en fin de chantier.
- **Effet** : `simulerIndices(da, pratiqueId)` (brique #307) devient trivial — calcule sans écrire le store global.

### 3.2 Source de config des instances
Les instances codées en dur (`standards`, `sommative`, `specifications`) tirent leur config de `modalitesEvaluation` aujourd'hui. Cible : la config voyage avec l'instance.
- `PratiqueConfigurable` a **déjà** `this.config` (construit par `construireConfigComplete`).
- Pour les instances hard-codées, deux options (§7 — décision) : (a) leur injecter une config au moment de la résolution, ou (b) garder la lecture globale **pour l'active** et n'exiger `this.config` que pour la simulation d'une non-active. **Recommandé : (b)** — moins invasif, invariant trivialement préservé pour l'active.

### 3.3 Fold `objectifs ⊂ standards`
- La variante `par-objectifs` vit **déjà** dans `PratiquePANStandards` (`_calculerPerformanceParObjectifs`, 4 modes : comptage / moyenne-pondérée / seuils-critiques / holistique).
- L'instance séparée `pan-objectifs` (enregistrée sous `'pan-objectifs'`) fait doublon. Fold = **router `pan-objectifs` → `standards` + variante** (décision D1), puis retirer l'instance séparée si aucune donnée de production ne l'utilise (audit requis avant suppression).

### 3.4 Retrait du jeton `SOM|PAN`
- Supprimer le param `pratique` de `calculerTousLesIndices` (toujours = active) + le param déprécié de `obtenirIndicesCP`.
- Traiter les call-sites comparatifs (`profil-etudiant-sections-affichage.js`) : **coordination avec le chantier « mode comparatif »** (§7 — décision). Comme les deux colonnes sont déjà identiques, la simplification est sûre.

### 3.5 Garantie « non calculable » (portfolio.js:644-647)
Ajouter un repli diagnostique quand `calculerPerformance` rend null/0 (au lieu de stocker 0 silencieusement) — relie le diagnostic #128 déjà livré.

---

## 4. Invariant & stratégie de test (NON négociable)

1. **Golden master AVANT tout code** : capturer A-C-P (et note finale) pour un jeu de données représentatif (les pratiques réelles de Grégoire : `standards` H2026/A2025, + au moins une `sommative` et une configurable). Figer dans un test chiffré.
2. Après CHAQUE lot : rejouer le golden master → **valeurs identiques**.
3. Nouveau test : `simulerIndices(da, pratiqueId)` rend les mêmes chiffres que si la pratique était active (preuve de découplage).
4. `cd tests && npm test` vert à chaque étape ; bump et terrain en fin.

---

## 5. Découpage en lots (commits)

**Lot 0 — Golden master** *(test seul, aucune prod touchée)*
- Test Vitest qui calcule A-C-P sur fixtures connues et fige les chiffres. Filet de sécurité.

**Lot 1 — `this.config` dans les instances** *(non destructif)*
- Chaque `js/pratiques/*.js` lit `this.config.X` avec repli sur le global pour l'active. Helper `_lireConfig(cle)` interne. Sites : pan-standards 74/701/1352, pan-objectifs 377, configurable 207.
- Corrige le bug §2.4 (configurable calcule depuis sa config, plus de `.actuel.PAN?.P`).

**Lot 2 — `calculerDetailsNoteFinale(da, pratiqueId)`** *(additif)*
- Param optionnel ; résolution via `obtenirPratiqueParId`. Call-sites inchangés (param par défaut).

**Lot 3 — Retrait du jeton `SOM|PAN`** *(remplace puis supprime)*
- `calculerTousLesIndices(da)` sans jeton ; `obtenirIndicesCP(da)` sans param déprécié ; call-sites comparatifs simplifiés (coordination §7).

**Lot 4 — Fold `pan-objectifs ⊂ standards`** *(après audit données)*
- Router `pan-objectifs` → `standards`+variante ; retirer l'instance + calculateurs morts (§2.5) si aucune donnée n'en dépend.

**Lot 5 — Brique simulation #307** *(additif, prépare la phase suivante)*
- `simulerIndices(da, pratiqueId)` lecture seule (ne touche pas le store). Test de parité.

**Lot 6 — Vérif & doc** : golden master final, `node --check` global, bump (probable `minor` — capacité de simulation = nouveauté), relais SESSION/BACKLOG, validation terrain.

---

## 6. Risques & garde-fous

- **Cœur de l'app** : à faire **à froid, sur backup** (note projet). Golden master = filet n°1.
- **Pas de migration destructive** : Session C est du **code**, pas une migration de données. Le store `indicesCP` est régénéré par recalcul ; aucune donnée perso réécrite.
- **Dépendance circulaire** (`calculerCompletion` lisant `indicesCP` pendant qu'on le calcule) : déjà contournée pour C (l.253) ; faire pareil pour P (calculer depuis brut, jamais depuis le store).
- **Sécurité** : ≥ 1 test par lot (Phase 1+). Golden master + parité simulation couvrent.

---

## 7. Décisions à trancher AVANT de coder (pour Grégoire)

> **✅ TRANCHÉES le 4 juin 2026 :**
> 1. **Mode comparatif** → **Option A** : Session C absorbe la simplification des call-sites
>    comparatifs (les colonnes sont déjà identiques) — zéro-dette, pas de jeton à demi retiré.
> 2. **Source de config des instances** → **(b)** : repli global pour la pratique **active** ;
>    `this.config` exigé seulement pour **simuler** une pratique non active.
> 3. **Sort de `pan-objectifs`** → **audit d'abord** (aucune donnée de prod ne l'utilise comme
>    pratique active ?), puis router/supprimer. À faire par Claude en Lot 4.
> 4. **Bump** → à confirmer en fin (probable `minor` quand la brique simulation atterrit).

---

## 8. Ordre d'exécution
Lot 0 (golden master) → 1 → 2 → 3 → 4 → 5 → 6. Validation terrain + bump en fin.
**Aucun code tant que les décisions §7 ne sont pas tranchées.**
