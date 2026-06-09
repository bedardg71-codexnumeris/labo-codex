# PLAN — Session B de #303 : le registre devient SSOT des représentations

**Date** : 4 juin 2026
**Auteur** : Claude Code (plan d'attaque, lecture seule — aucune modification de code)
**Statut** : à valider par Grégoire avant exécution
**Réf.** : `Refactorisations/PLAN_architecture_pratiques_SSOT.md` §5 (Phase 1) et §7 ; `BACKLOG.md` #303 ; `SPEC_simulation_pratiques_307.md` §3.2
**Position dans la séquence** : Session A ✅ → **Session B (ce plan)** → Session C (calcul) → #307. Non destructif. Fichiers modérément sensibles (pas le cœur du calcul).

---

## 1. Objectif et critère de réussite

Une pratique **déclare une fois** son code court, sa couleur et son libellé de famille ; **tout le monde lit le registre**. Aujourd'hui ces trois représentations sont **dupliquées dans 6 tables locales** qui divergent déjà entre elles. Fin de session = ces tables supprimées, une seule source.

**Critère de fin mesurable** :
1. Les 4 instances exposent `obtenirCode()`, `obtenirCouleur()`, `obtenirLabelFamille()`.
2. Le registre expose des accesseurs par id (tolérants legacy via `normaliserIdPratique`).
3. Les 6 tables locales (§4) sont **supprimées** (grep de contrôle : plus aucune table id→{code,couleur,label} hors instances).
4. `cd tests && npm test` vert (baseline 178) + ≥ 1 test ajouté (représentations).
5. Mac + iPad, sombre + clair : badges identiques à avant partout (profil, tableau de bord, wizard, listes, échelles).

**Hors-périmètre** (reste en C) : le calcul, le jeton binaire `'SOM'|'PAN'`, le fold `objectifs ⊂ standards`.

---

## 2. DÉCISION PRÉALABLE — le nœud 4a (à trancher avant de coder)

`pratique-notation-v2.js` lit/compare encore `modalites.pratique` en termes **legacy** :
- l. 143-149 : passe `modalites.pratique` brut aux afficheurs (`afficherDescriptionTaxonomique`, `mettreAJourBadgePratiqueV2`, etc.) ;
- **l. 550 : `modalites.pratique === 'pan-standards'`** — comparaison en dur ;
- écriture unique l. 544 : `modalites.pratique = #v2-pratique-type.value` (inchangée).

**Recommandation : NORMALISER à la lecture (option 1 du §7 plan SSOT).** Raisons :
- **Cohérence** avec le pattern déjà posé en 4c/4e (le code est à moitié migré ; laisser l'autre moitié brute = la dette que le principe zéro-dette proscrit).
- **Mine latente réelle** : `=== 'pan-standards'` (l. 550) casse l'affichage de la variante dès que la production écrit le canonique `'standards'` (intention du volet B étape 2). Normaliser désamorce.
- **Non destructif** : on touche le côté lecture/comparaison ; l'écriture l. 544 reste identique.
- **Coût faible** : envelopper ~5 lectures + corriger 1 comparaison (`=== 'pan-standards'` → comparer `normaliserIdPratique(...) === 'standards'`).

Alternative (laisser brut + documenter) : défendable seulement si on prévoyait de retirer la clé `modalitesEvaluation.pratique`. Or la Session C **route le calcul** via les instances, elle ne supprime pas la clé. La clé reste → normaliser ses lecteurs est le bon geste.

> ✅ **DÉCISION ACTÉE (Grégoire, 4 juin 2026) : option 1 — normaliser à la lecture.** Étape 3 du §6 : envelopper les lectures l.143-149 via `normaliserIdPratique` et remplacer `modalites.pratique === 'pan-standards'` (l.550) par `normaliserIdPratique(modalites.pratique) === 'standards'`. L'écriture l.544 reste inchangée.

---

## 3. Le contrat à étendre

### 3.1 Trois méthodes par instance

| id canonique | `obtenirCode()` | `obtenirLabelFamille()` | `obtenirCouleur()` |
|---|---|---|---|
| `sommative` | `SOM` | `Sommative` | classe `som` |
| `standards` | `STD` | `PAN – Standards` | classe `std` |
| `specifications` | `SPE` | `PAN – Spécifications` | classe `spe` |
| `denotation` | `DEN` | `PAN – Dénotation` | classe `den` (placeholder) |

Libellés au **demi-cadratin** « PAN – X » (décision terminologie 2 juin, mémoire `project-terminologie-beta-assistant` / SESSION.md). `pratique-pan-objectifs` (variante de granularité de `standards`, décision D1) rend les **mêmes** valeurs que `standards`.

### 3.2 `obtenirCouleur()` — recommandation : renvoyer une classe/variable CSS, pas un hex

Deux palettes JS divergent déjà :
- `gabarits-utils.js:34-37` : SOM `#6c757d`, STD `#17a2b8`, SPE `#28a745`, DEN `#ffc107`
- `wizard-pratique-v2.js:1623-1625` : SOM `#4A90D9`, STD `#E67E22`, SPE `#27AE60`

Or les badges sont déjà colorés par **classes CSS `.som/.std/.spe/.den`** (styles.css) dans main.js/notation-v2/etudiants. Seul le wizard utilise un hex JS en dur (inline style) — ce qui **viole CLAUDE.md** (« jamais de couleur en dur ») et **diverge**. Donc :
- `obtenirCouleur()` retourne le **nom de classe CSS** (`'som'`/`'std'`/…) ou une variable `var(--pratique-std)` consultée dans `design-system.html`, **pas** un hex.
- Effet : le hex en dur du wizard disparaît, la divergence est collapsée par construction. Couleurs décoratives (mémoire `project-palette-couleurs-contraintes`) → choix à faible enjeu, mais à acter dans le design system.

### 3.3 Accesseurs du registre

Ajouter à `pratique-registre.js` : `obtenirCodePratique(id)`, `obtenirCouleurPratique(id)`, `obtenirLabelFamillePratique(id)` — chacun `normaliserIdPratique(id)` puis délègue à l'instance (`obtenirPratiqueParId`). Fallback explicite si instance absente (id inconnu) : `'?'` / classe neutre / « Indéterminé » — **pas** de table de secours.

### 3.4 Verrou de contrat — EN DERNIER

`enregistrerPratique` valide `methodesRequises` (l. 100-109). Ajouter les 3 méthodes à cette liste **est un gate dur** : toute instance qui en manque fait planter le boot. → Implémenter d'abord dans **toutes** les classes (étape 1), n'étendre `methodesRequises` qu'à la toute fin (étape 6), après vérification que `pratique-test.js`, `config-francois-chimie.js`, `pratiques-predefines.js` et `PratiqueConfigurable` couvrent les 3 méthodes.

---

## 4. Inventaire vérifié des tables locales (ancres réelles au 4 juin)

> Le plan SSOT cite des numéros datés ; voici les lignes **réelles mesurées ce jour**. À reconfirmer juste avant d'éditer (le code bouge).

| # | Fichier : lignes | Contenu actuel | Action |
|---|---|---|---|
| 1 | `gabarits-utils.js:24-37` | table `{code,nom,description}` SOM/STD/SPE/DEN + map couleurs 34-37 | remplacer par lecture registre ; supprimer table |
| 2 | `pratique-notation-v2.js:375-379` | map id legacy → `{classe,texte}` | remplacer par `obtenirCode/Couleur` ; supprimer |
| 3 | `wizard-pratique-v2.js:1623-1625` (`typeBadges`) + `2125-2127` (`typeMapping`) | `{code,couleur,label,description}` + id→code | remplacer ; **garde** les `description` (texte pédagogique propre au wizard, hors périmètre représentations) ou les déplacer si jugé SSOT |
| 4 | `main.js:138-167` (`genererBadgePratique`) | prend le **jeton `'SOM'/'PAN'`** + lit `config.typePAN` | **FRONTIÈRE B/C** — voir §5 |
| 5 | `etudiants.js:~452-480` | dérivation inline `texte/classePratique/description` depuis `pratique`+`typePAN` (déjà `normaliserIdPratique`) | remplacer par accesseurs registre ; supprimer le bloc if/else |
| 6 | `echelles.js:2478-2483` | `<option>` filtre (SOM/STD/SPE/DEN/all) en dur | générer depuis `listerPratiquesDisponibles()` + `obtenirCode` |

---

## 5. Frontière B/C : `main.js:genererBadgePratique`

`genererBadgePratique(type)` reçoit le **jeton binaire `'SOM'|'PAN'`** (fourni par `calculerTousLesIndices`) puis ré-dérive le code via `config.typePAN`. Ce jeton est précisément ce que la **Session C retire**.

**Décision de séquencement proposée** : en Session B, réécrire le **corps** de `genererBadgePratique` pour qu'il dérive code+classe via le registre (à partir de l'**instance active**, plus de `typePAN`), mais **conserver la signature** tant que les appelants passent encore le jeton. Le retrait de la signature binaire + des ~callers est un item **explicite de la Session C** (avec le jeton). À tracer dans le plan SSOT §5 Phase 2.

> Si on préfère ne pas toucher main.js du tout en B, c'est défendable (laisser tout le badge à C). Mais alors la table de `genererBadgePratique` survit à B → critère de fin §1.3 partiellement non atteint. Recommandation : faire le corps en B, la signature en C.

---

## 6. Ordre d'exécution (un fichier à la fois, test après chaque)

1. **Instances** (4 fichiers + objectifs + configurable) : ajouter les 3 méthodes. `node --check` + test unitaire par instance. *Aucun consommateur encore branché → zéro régression.*
2. **Registre** : ajouter les 3 accesseurs + fallback. Test Vitest : chaque id canonique (et 1 legacy via normalisation) rend le bon code/couleur/label.
3. **Nœud 4a** (`pratique-notation-v2.js`) : normaliser les lectures 143-149 + corriger `=== 'pan-standards'` (550). Puis remplacer la table 375-379 par les accesseurs.
4. **`etudiants.js`** : remplacer le bloc if/else par les accesseurs.
5. **`echelles.js`** : générer les `<option>` de filtre depuis le registre.
6. **`gabarits-utils.js`** + **`wizard-pratique-v2.js`** : remplacer les tables ; supprimer. Vérifier le wizard en terrain (badge de classification).
7. **`main.js`** : corps de `genererBadgePratique` via registre (§5).
8. **Verrou de contrat** : étendre `methodesRequises` (registre l. 100-109). Boot complet OK.
9. **Grep de contrôle** + bump `release.mjs --build-only` (ou minor si jugé) + commit.

---

## 7. Tests et invariants

- **Vitest représentations** : `obtenirCode/Couleur/Label` corrects pour chaque id canonique ; un id legacy (`pan-standards`) résout via normalisation ; id inconnu → fallback explicite (pas d'exception).
- **Grep de non-régression** : plus aucune occurrence de `code: 'SOM'`/`'STD'`… hors instances ; plus aucune map id→badge hors registre.
- **Boot** : `methodesRequises` étendu ne fait pas planter l'enregistrement (toutes instances couvertes).
- **Terrain** (Mac + iPad, sombre/clair) : badges profil, tableau de bord, wizard (classification), listes, filtre échelles — identiques à avant.
- CLAUDE.md : ≥ 1 test automatisé (module sensible touché : registre).

---

## 8. Risques

| Risque | Gravité | Parade |
|---|---|---|
| `methodesRequises` étendu trop tôt → boot cassé | haute | étendre **en dernier** (étape 8), après couverture de toutes les instances |
| `genererBadgePratique` à cheval B/C → table survit | moyenne | §5 : corps en B, signature/jeton en C, tracé au plan SSOT |
| Couleur : choix de palette non tranché | faible | décorative ; `obtenirCouleur` rend une classe CSS, divergence collapsée ; acter la classe dans `design-system.html` |
| `wizard typeBadges.description` : texte péda, pas une représentation | faible | conserver hors périmètre (ne migrer que code/couleur/label) |
| Nœud 4a non tranché | bloquant pour étape 3 | §2 — décision Grégoire en tête de session |

---

**Fin du plan.** Compagnon de `Refactorisations/PLAN_architecture_pratiques_SSOT.md` (§5 Phase 1, §7 Session B). À exécuter sur backup, fenêtre calme, après décision §2.
