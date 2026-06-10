# ÉTAT DU PROJET — Labo Codex

> **Nature** : document de référence interne. Il dit **où en est le projet** par rapport à ses
> objectifs de **stabilité, pérennité et qualité du code**, et par rapport aux **plans** issus
> de l'audit annuel. Il se consulte pour se situer sans avoir à refouiller les documents source.
>
> **Ce qu'il n'est PAS** : un backlog. La liste des tâches à faire vit dans `BACKLOG.md` ;
> le contexte de la session courante dans `SESSION.md` ; la version publique de l'audit dans
> `AUDIT.md`. Ce document agrège et **situe** — il pointe vers ces sources, il ne les duplique pas.
>
> **Entretien** : à relire/mettre à jour en fin de chantier significatif et au moins à chaque
> bascule de session importante. Le §11 (journal) trace les révisions. Chaque ligne d'état porte
> idéalement sa source et sa date de vérification, pour éviter de propager un état périmé.
>
> **Dernière mise à jour** : 10 juin 2026 — bêta publique 1.6.1 / build 0610-0512 — HEAD `main` `80cb7f65`
> (synchro `origin/main`).

---

## Légende des statuts

| Symbole | Sens |
|---|---|
| **Fait** | Livré et présent sur `main` (vérifié) |
| **En cours** | Chantier actif, partiellement livré |
| **À faire** | Identifié, non démarré |
| **Optionnel** | Utile mais non requis ; n'engage pas la stabilité |
| **Long terme** | Reporté explicitement (Q3 2026+ ou audit dédié requis) |

---

## 1. Objectifs directeurs

Le cadre est posé par `CLAUDE.md` (principe **« stabilité zéro-dette »**, 21 avril 2026) et l'audit
annuel (`AUDIT.md`, ADR-012). Trois objectifs orientent toute décision de développement :

- **Stabilité** — l'application ne régresse pas. Tout fix défensif critique est verrouillé par un
  test/sentinelle ; tout refactoring préserve le comportement ; les données personnelles de Grégoire
  (trimestres réels, grilles, évaluations) survivent à chaque changement.
- **Pérennité** — le projet reste maintenable et adoptable par des tiers : licences propres,
  documentation publique de conformité, hygiène GitHub, audit annuel rejoué (ADR-012).
- **Qualité du code** — pas de dette empilée. Un nouveau système retire l'ancien (pas d'alias « au
  cas où ») ; complexité cyclomatique maîtrisée ; SSOT par donnée ; CSP stricte (`script-src 'self'`,
  zéro inline) ; sécurité non négociable (échappement HTML, validation imports).

---

## 2. Tableau de bord synthétique

| Axe | État global | Détail |
|---|---|---|
| Audit annuel 2026 — Phase 1 (corrections) | **Fait** | §3 |
| Audit annuel 2026 — Phase 2 (refactoring god modules) | **Fait** | §3, §5 |
| Audit annuel 2026 — Phase 2 (transverse : notifications, vocabulaire) | **Fait** | §3 |
| Lancement public (bêta 1.0.0, AQPC 3 juin) | **Fait** | §8 |
| Documentation publique de conformité | **Fait** (révision Loi 25 en attente, #298) | §7 |
| Hygiène GitHub / OpenSSF | **Fait** | §7 |
| Accessibilité (WCAG AA) | **En cours** (#305 corrigé) | §7 |
| Refactoring résiduel (Track 3 ph.2, Track H) | **Optionnel** | §5 |
| Bugs de données connus (#300, #301) | **En cours** (#300 **clos** en 1.6.1 ; reste #301) | §6 |
| Chantier pratiques SSOT (#303) | **Fait** (Sessions A+B+C consolidées 5 juin) | §8 |
| SSOT `modalitesEvaluation` (Tier 6.5, 14 écrivains) | **À faire** (audit dédié requis) | §5.3 |
| Branche `audit/2026-mai` (archivage doc) | **À faire** | §4 |
| Plan long terme + chantiers long terme | **Long terme** | §4, §5 |

---

## 3. Audit annuel 2026 — état

Audit conduit du 12 au 14 mai 2026 (`AUDIT.md`, version publique v1.1 du 25 mai ; ADR-012 : rejoué chaque année).

**Fait :**
- **Phase 1 (corrections)** close 14-15 mai : 45 corrections dans 8 fichiers, bug `evaluation.js:4193`
  confirmé et traité.
- **Phase 2 — refactoring des 5 god modules** : tous livrés et mergés sur `main` (15-21 mai). Détail métrique en §5.
- **Phase 2 — transverse** :
  - Consolidation des notifications : `js/utils-notifications.js`, ~525 appelants migrés dans 39 modules,
    ≈469 LOC nettes retirées, 3 bugs latents corrigés (#111 XSS, #112, #113). Sentinelle Vitest stricte. (21 mai)
  - Nettoyage du vocabulaire alarmiste : 8 chaînes UI reformulées, code mort prédictif retiré
    (`calculerRisqueEchec`, `obtenirClasseRisque`), tokens CSS `--risque-*` → `--niveau-attention-*`. (21 mai)
  - Cycle « Catégorie B » (dette des 5 refactors) : **10/10 critères atteints**, clos 21 mai (Tracks 1-2-3-4).

**Reste à faire (issu de l'audit) :** voir §5 (qualité du code résiduelle), §7 (accessibilité, révision Loi 25).

> **Écart documentaire à connaître** : les plans Phase 2 (rédigés le 15 mai) listent comme « à faire »
> plusieurs éléments **déjà livrés depuis** sur `main` (hygiène GitHub, documents de conformité). Ne pas
> s'y fier sans recouper avec l'état réel. C'est l'une des raisons d'être de ce document.

---

## 4. Plans Phase 2 et branche d'audit

Les plans d'action vivent dans `audit/` (branche `audit/2026-mai`, documentaire). Statut au 31 mai :

| Plan | Objet | État |
|---|---|---|
| `audit/PLAN-PHASE-2-OVERVIEW.md` | Vue d'ensemble, traces Cowork (12 décisions D-COW) | À jour ; manque « bilans » de fin + relais Phase 3 |
| `audit/PLAN-COURT-TERME.md` | Sécurité, doc, a11y, vocabulaire (échéance 3 juin) | Majorité livrée ; reste a11y + révision Loi 25 |
| `audit/PLAN-MOYEN-TERME.md` | Refactoring god modules + hygiène structurelle | Refactorings **faits** ; hygiène GitHub **faite** (plan périmé) |
| `audit/refactoring-prep/PLAN-CAT-B-POST-MERGE.md` | Dette des 5 refactors (4 tracks) | Tracks 1-2-3-4 livrés ; reste Track 3 ph.2 + Track H (optionnels) |
| `PLAN-LONG-TERME.md` | À rédiger après validation court/moyen terme | **À faire** (post-AQPC) |

**Branche `audit/2026-mai`** (HEAD `097ce88`, inchangée depuis le 21 mai) : **purement documentaire**
(rapports + plans + traces Cowork, **aucun code applicatif**). Divergence au 10 juin : 68 commits
d'avance, **526 commits de retard** sur `main`. Le **merge d'archivage** vers `main` (prévu post-AQPC)
n'est **pas encore fait** ; l'AQPC est passé, la fenêtre est ouverte. Conflits attendus seulement sur
`SESSION.md`/`BACKLOG.md` (réconciliation manuelle) ; **zéro conflit de code**. Archivage à faible
risque, pas une migration de données.

---

## 5. Qualité du code

### 5.1 Refactoring des god modules (Phase 2) — Fait

Les cinq modules à forte complexité ont été éclatés en sous-modules et mergés. Source : `audit/PLAN-MOYEN-TERME.md`.

| Module | LOC avant → résidu | Complexité (cyc) | Statut |
|---|---|---|---|
| `bilan-reflexif.js` | 4 716 → 955 | 63 → 27 | Fait (15 mai) |
| `productions.js` | 3 995 → ≈2 211 | 80 → ≤30 | Fait (17 mai) |
| `trimestre-v2.js` | 6 584 → 599 | 94 → ≤30 | Fait (17 mai) |
| `profil-etudiant.js` | 8 818 → 4 654 | 58 → ≤30 (1 héritage cyc 48 acté N=50) | Fait (18-21 mai) |
| `evaluation.js` | 7 321 → 3 984 | 78 → 42 | Fait (21 mai) |

### 5.2 Dette résiduelle de refactoring — Optionnel, post-AQPC

- **Track 3 phase 2** : 6 fonctions de `profil-etudiant-sections-affichage.js` à cyc 31-52 restant à
  éclater (~4-5 h). 1 exception assumée (`genererSectionMobilisationEngagement`, cyc 48, sous N=50).
- **Track H** : sous-découpage des résidus `profil-etudiant-sections-affichage.js` (4 654 LOC) et
  `evaluation.js` (3 984 LOC). Optionnel (~4-6 h).

### 5.3 Dette structurelle long terme

- **Tier 6.5 `modalitesEvaluation`** : 14 écrivains sur la même clé (violation SSOT critique) — audit
  dédié requis. **C'est la dernière grande violation SSOT identifiée par l'audit annuel** maintenant que
  le chantier pratiques (#303/#307) est clos. Pièges connus à recouper avant d'y toucher :
  `calculerPerformance` sur une pratique non active lit `modalitesEvaluation` global (biais documenté
  2 juin) ; le mode comparatif SOM/PAN (toggles `afficherSommatif`/`afficherAlternatif`) est un résidu
  à retirer (chantier distinct acté 30 mai).
- **`reserve.js`** : refactoring en 3 couches (FSAPI / métier / UI) — long terme.
- **Dispatcher publish/subscribe** (≈405 actions) — long terme.
- **#297** : duplication de règles CSS entre le `<style>` inline d'`index.html` et `styles.css`
  (tout fix CSS sur une règle dupliquée doit toucher les deux endroits). Audit complet post-AQPC.

---

## 6. Stabilité

### 6.1 Filet de tests
- Suite : 389 tests Vitest + 47 tests Playwright (WebKit) = **436 verts** au 10 juin (exécution locale, HEAD `80cb7f65`).
- Couvre : sécurité (CSP, sandbox, sanitisation, imports), sentinelles d'exports après refactoring,
  rendus DOM des modules refactorés, golden master du calcul (#303 Session C), sentinelles wizard/DEN,
  icônes suivies par git, répertoires de classement (#320/#327).
- **Limite connue** : la page d'assemblage (`trimestre-v2-*`) n'a que des sentinelles d'exports,
  aucun test de comportement de sauvegarde (cf. #306).

### 6.2 Bugs de données connus
| Réf | Description | État |
|---|---|---|
| **#300** | `getSync("trimestres")` rend des ids vides (désync localStorage↔IDB au boot) | **CLOS** (10 juin, 1.6.1) — Lot 1 `f36b143f` : helper `enumererTrimestres()` lecture seule, 9 énumérateurs routés, sentinelle 6 cas ; Lot 2 `f224d1c0` : cause racine, clear-then-hydrate au boot |
| **#301** | Résolution de pratique en consultation lit le namespace du trimestre **actif**, pas du **consulté** | **À faire** — la note finale d'un trimestre archivé dépend du contexte courant |

### 6.3 Préservation des données
- Données réelles consolidées : 601-101 sous un `COURS_*` unique (chantier D, 29 mai).
- Migrations destructives : **uniquement en console one-shot sur backup Codex frais**, jamais distribuées.
- Pattern de risque surveillé : race-condition auto-save (reset synchrone + restauration async).

---

## 7. Pérennité

### 7.1 Documentation publique de conformité — Fait (révision Loi 25 en attente)
Présents et vérifiés sur `main` au 31 mai : `AUDIT.md`, `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`,
`README.md`, `SECURITY.md`, `libs/VERSIONS.md`, 15 ADRs (`docs/adr/`).
- **Reste** : **#298** — réviser `PRIVACY.md` (recadrage du référentiel Loi 25, alignement sur la
  fenêtre publique 3-30 juin). Dépend d'abord de l'analyse des logs Cloudflare par Grégoire.

### 7.2 Hygiène GitHub / OpenSSF — Fait
Présents et vérifiés sur `main` : `SECURITY.md`, `.github/dependabot.yml`, workflows CI
(`.github/workflows/tests.yml`, `codeql.yml`). Livrés le 25 mai.
- **Note** : les plans d'audit (15 mai) les listent encore « absents » — état périmé.

### 7.3 Licences
- Double licence AGPL v3 + CC BY-NC-SA 4.0. Triple décalage « CC BY-SA » → « CC BY-NC-SA » corrigé (15-21 mai).
- Headers SPDX et `libs/VERSIONS.md` : présents.

### 7.4 Accessibilité (WCAG 2.1 AA) — En cours
- **Fait** : aria-label `#btn-codex`, label `#selectGroupeCoursHeader` (15 mai) ; **#305 corrigé**
  (7 juin, `677af656`, livré 1.2.0) — titre labellisé dans l'en-tête de la modale d'aide ;
  contraste corbeilles Supprimer (#323, 1.2.0) ; a11y clavier/focus dans le comparateur (C1-d)
  et la bannière d'accueil.
- **À confirmer / compléter** : contraste, `outline:none`, `prefers-reduced-motion`,
  `prefers-contrast`, `aria-live` (audit C.3-C.7, statut partiel selon les plans — à revérifier sur `main`).
- **À faire (humain, Q3)** : tests manuels VoiceOver (Mac) + iPad réel.

---

## 8. Backlog applicatif — vue par priorité

Détail et contexte complet dans `BACKLOG.md` (≈52 items/sous-items ouverts au 9 juin). Regroupement :

**Livré depuis le 31 mai** (10 releases, 1.0.0 → 1.6.0) :
- **Lancement public 1.0.0** (3 juin, AQPC) — déploiement Cloudflare, bêta publique ouverte.
- **Refonte complète des textes** (2-4 juin) : 13 pages + Aide (6/6) + bibliothèques + assistant —
  écriture inclusive, terminologie canonique, tutoiement.
- **#302 (partiel)** : module guides pédagogiques unifié SOLO+ACP+RàI (1.1.0) + découvrabilité (1.1.1) ;
  reste l'intégration des guides `som`/`pan` (contenu rédigé, prêt).
- **#303 — pratiques SSOT : CLOS** (Sessions A+B+C, consolidé 5 juin, golden master) ; **#307 — Comparateur
  de pratiques : LIVRÉ** (C0→C4, 1.2.0) avec `simulerIndices` lecture seule et récits de calcul.
- **#319 refonte assistant** (1.2.0) + **#317 correctifs wizard #131-#135** (1.1.3) + **#137 inférence
  « pas-certain »** (1.3.0).
- **#318 — Dénotation couche 2 : LIVRÉE** (1.3.0) — famille DEN créable, jugement saisi, garde 59/certif.
- **Bouton Soutien + correctifs terrain** (1.4.0-1.4.2, dont #138/#115 icônes non suivies par git).
- **#320 répertoires de classement** (1.5.0) puis **#327 extension transversale** (1.6.0) ;
  cartouches = exception actée (structure par grille).
- **#305** (a11y modale d'aide) et **#323** (contraste corbeilles) corrigés (1.2.0).

**Reste ouvert, par priorité :**
- **Prioritaires actés** : #282 (migrer `cours.js` `listeCours`→`cours`), #283 (responsive sidebar mobile),
  #284 (titres/sous-titres de pages).
- **Bugs de données** : #300 cause racine, #301 (cf. §6.2).
- **Chantiers débloqués** : **#326 axe D « Exploration des pratiques »** (SPEC validée 8 juin ; ses deux
  préalables #318 et #320 sont livrés), #306 (uniformisation assemblage — plan prêt), #321 (note différée
  / couche 1 PRÉN), #324 (reprises configurées non consommées).
- **Conformité** : #298 (révision PRIVACY.md Loi 25 — fenêtre « avant ouverture publique » désormais échue,
  à requalifier).
- **Dette** : #299 (références d'onglets périmées), #297 (dette CSS inline), #295 (diagnostic mémoire Codex
  iPad/iPhone), #316 (alert()/prompt() natifs de Codex).
- **Long terme (sans urgence)** : migration icônes SVG #286, simplification Codex #233, réserve #257v2.B,
  imports historiques #35/#36, analytics évaluateur #268-271, mode tableur #33, mot de passe sauvegarde #47,
  formulaire production #279, tooltips #18, guide PDF #2, etc.

---

## 9. Décisions en attente

| Réf | Décision | Contexte |
|---|---|---|
| `v2-seuil-fragile` | Conserver / atténuer / aligner le libellé | Reliquat vocabulaire alarmiste (audit D.1) |
| `interpreterMobilisation` | Zone grise vocabulaire (audit D.3) | À trancher |
| Règle IDME stricte niveau global | Tous critères à M pour niveau M, etc. (override moyenne pondérée) | Backlog, reportée par Grégoire (14 mai) |
| #306 — implémentation | Chantier post-AQPC ; décisions de cadrage déjà prises (§8) | Cahier des charges dans le rapport d'assemblage |

---

## 10. Points de vigilance

- **Plans d'audit périmés** : `audit/PLAN-*.md` reflètent l'état du 15 mai. `main` est en avance (hygiène
  GitHub, docs de conformité livrés depuis). Toujours recouper avec l'état réel — c'est le rôle de ce document.
- **Bêta publique en cours** : des expérimentateurs réels utilisent l'app depuis le 3 juin. Les retours
  testeurs interrompent le plan en cours (règle CLAUDE.md) ; toute migration destructive distribuée est
  exclue — les fixes de données se font en console one-shot chez Grégoire seulement.
- **Cache Safari `file://`** : après un bump de build, hard refresh `Cmd+Option+R` obligatoire ; suspecter
  le cache avant le code en cas de faux bug.
- **Refactoring d'extraction** : un guard `typeof === 'function'` ne signifie pas qu'une fonction est morte ;
  tout fix défensif critique doit être verrouillé par une sentinelle sous peine de disparaître silencieusement.

---

## 11. Journal des mises à jour

| Date | Build | Révision |
|---|---|---|
| 2026-05-31 | 0531-0840 | Création du document. État consolidé après audit du backlog et des plans Phase 2 ; vérification de l'état réel de `main` (docs de conformité + hygiène GitHub présents, plans d'audit périmés sur ces points). |
| 2026-05-31 (PM) | 0531-1409 | #294 fait (déploiement lancé). UI : bandeau orange, thème clair par défaut, anti-flash. « wizard » → « assistant » (8 textes). Plan « Bêta publique 1.0.0 » prêt pour le 3 juin. Conventions terminologie mémorisées. Ménage entamé (plans réalisés sortis ; reste à gitignorer 36 Mo d'artefacts + trancher untracked ambigus). |
| 2026-06-10 | 0610-0512 | Rattrapage de 10 jours (124 commits, releases 1.0.0 → 1.6.1) vérifié sur git. Lancement public fait (3 juin). #303 clos, #307/#318/#319/#320/#327 livrés, #305 corrigé, **#300 clos** (Lots 1+2, 1.6.1). Tests 436 verts. Audit SSOT `modalitesEvaluation` livré (`Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`, plan 4 lots). Branche `audit/2026-mai` toujours à merger (fenêtre post-AQPC ouverte). |
