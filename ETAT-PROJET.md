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
> **Dernière mise à jour** : 28 juin 2026 (Cowork) — bêta publique **1.26.0** / build `0628-2126`.
> `origin/main` `495cd99a` ; **`main` local en avance** (merge docs plan mi-août + travail #362 en
> cours, **non poussé** au moment de la rédaction). Dépôt **privatisé le 23 juin 2026**.

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

## 0. Repère rapide (28 juin 2026)

État sain, dépôt très actif. Repères pour se situer en un coup d'œil :

- **Version** : 1.26.0 (build `0628-2126`). ~20 releases depuis le 10 juin (1.6.1).
- **Horizon courant** : **« app stable pour la CoP / expérimentateurs » à la mi-août 2026** ; pilote
  restreint de la Voûte fin août. Cadrage priorisé et autoportant : **`plans de travail/PLAN-mi-aout-2026.md`**
  (3 paliers, porteurs Claude Code vs Grégoire, décisions à trancher). Exclu de cet horizon par décision
  Grégoire : l'**article longitudinal avec Steve Bissonnette** (#35/#36).
- **Grands chantiers récents LIVRÉS** : #358 namespacing par trimestre (migration **live validée**, 1.25.0) ;
  #353 durabilité IndexedDB (**risque de perte fermé**, 1.24.2) ; #360 prévention des doublons d'évals (1.24.0) ;
  #326 comparateur de pratiques **réactivé** (1.26.0) ; #328 SSOT `modalitesEvaluation` (1.22.0, « fin de #328 »
  — *case BACKLOG à recouper*, voir §5.3) ; Voûte Phase 1 avant-pilote code-complet (1.11.0).
- **En cours (Claude Code)** : palier 1 du plan mi-août — #362 (grilles h2026 désappariées, fix `f9c824af`),
  puis #350/#346/#342.
- **Contexte humain** : Grégoire passe du Plan Max 20x au **Plan Pro** et prend **congé en juillet** →
  reprise visée **1er août**. Conséquence : privilégier la structure (rituel début-de-session + plan) plutôt
  que la mémoire personnelle ; défaut Sonnet pour le codage afin d'étirer le budget Pro.

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
| Audit annuel 2026 — Phase 2 (refactoring god modules + transverse) | **Fait** | §3, §5 |
| Lancement public (bêta 1.0.0, AQPC 3 juin) | **Fait** | §8 |
| SSOT `modalitesEvaluation` (#328, Tier 6.5 — dernière violation SSOT de l'audit) | **Fait** (probable — 1.22.0 « fin de #328 », 27 juin ; case BACKLOG non cochée → à recouper) | §5.3 |
| Namespacing par trimestre (#358) — modèles namespacés, migration **live** | **Fait** (1.25.0, 28 juin) | §6.3 |
| Durabilité IndexedDB (#353) — risque de perte de données | **Fait** (1.24.2 ; risque de perte **fermé**) | §6.2 |
| Prévention des doublons d'évals note-égale (#360) | **Fait** (1.24.0) | §6.2 |
| Comparateur de pratiques (#326, axe D) | **Fait** — **réactivé** (1.26.0, `COMPARATEUR_VISIBLE=true`) | §8 |
| Voûte Phase 1 (#329) — partage de ressources signées | **En cours** (avant-pilote code-complet 1.11.0 ; reste revue format + terrain iPad → pilote fin août) | §8 |
| Grilles h2026 désappariées des évals (#362) | **En cours** (Claude Code, fix `f9c824af` ; séance dédiée backup + L0) | §6.2 |
| Documentation publique de conformité | **Fait** (révision Loi 25 en attente, #298) | §7 |
| Hygiène GitHub / OpenSSF | **Fait** (CodeQL + protection de branche **suspendus** depuis la privatisation du 23 juin) | §7.2 |
| Accessibilité (WCAG AA) | **En cours** | §7.4 |
| Branche `audit/2026-mai` (archivage doc) | **À faire** (divergence accrue) | §4 |
| Refactoring résiduel (Track 3 ph.2, Track H) | **Optionnel** | §5.2 |
| Plans + chantiers long terme | **Long terme** | §4, §5.3 |

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

**Suite (juin) :** la dernière grande violation SSOT identifiée par l'audit — `modalitesEvaluation` (#328) —
a été traitée en juin (voir §5.3). Reste à faire issu de l'audit : §7 (accessibilité, révision Loi 25),
§5.2 (dette de refactoring optionnelle), §4 (archivage de la branche d'audit).

> **Écart documentaire à connaître** : les plans Phase 2 (rédigés le 15 mai) listent comme « à faire »
> plusieurs éléments **déjà livrés depuis** sur `main`. Ne pas s'y fier sans recouper avec l'état réel.
> C'est l'une des raisons d'être de ce document.

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
(rapports + plans + traces Cowork, **aucun code applicatif**). La divergence avec `main` s'est **fortement
accrue** depuis le 10 juin (526 commits de retard à l'époque ; ~20 releases livrées depuis). Le **merge
d'archivage** vers `main` n'est **toujours pas fait**. Conflits attendus seulement sur `SESSION.md`/`BACKLOG.md`
(réconciliation manuelle) ; **zéro conflit de code**. Archivage à faible risque, pas une migration de données.
Candidat naturel pour une séance « hygiène » à la reprise d'août.

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

### 5.3 Dette structurelle

- **Tier 6.5 `modalitesEvaluation` (#328) — Fait (probable, à recouper).** C'était la dernière grande
  violation SSOT de l'audit annuel (14 écrivains sur la même clé, miroir non déclaré de la SSOT pratiques).
  La consolidation en lots a avancé tout juin (Lot 0/1/3 + L2-0/a/b1 livrés 10-11 juin) et **la release
  1.22.0 du 27 juin est étiquetée « fin de #328 »** (PR #68). **⚠ Désync de tracker** : la case `#328` de
  `BACKLOG.md` reste **ouverte** avec un reste « L2-b2 + L2-c », non mis à jour. À recouper au code
  (`js/pratiques/modalites-evaluation.js`, sentinelles `…-L2*`) avant de s'y fier dans un sens ou l'autre —
  pattern de lag déjà observé sur #326-T1/T2. Plan : `plans de travail/PLAN-328-L2-degonfler-miroir.md`,
  audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`.
- **`reserve.js`** : refactoring en 3 couches (FSAPI / métier / UI) — long terme.
- **Dispatcher publish/subscribe** (≈405 actions) — long terme.
- **#297** : duplication de règles CSS entre le `<style>` inline d'`index.html` et `styles.css`
  (tout fix CSS sur une règle dupliquée doit toucher les deux endroits). Audit complet post-AQPC.

---

## 6. Stabilité

### 6.1 Filet de tests
- Suite **rapportée par la session 1.26.0 (28 juin) : 1142 Vitest + 68 Playwright (WebKit) verts.**
  *Chiffre non re-vérifié en Cowork — à recouper via `cd tests && npm test`.* (Pour mémoire : 436 verts au 10 juin.)
- Couvre : sécurité (CSP, sandbox, sanitisation, imports — Défense I/J), golden masters L0/L2 du calcul de note
  et de l'isolation par trimestre, sentinelles de namespacing (#358, briques A/B/C, special-archive), durabilité
  IDB (#353), prévention des doublons (#360), comparateur/maquettes (#326), DEN, répertoires de classement.
- **Limite connue** : la page d'assemblage (`trimestre-v2-*`) n'a que des sentinelles d'exports,
  aucun test de comportement de sauvegarde (cf. #332 Constat 1, #306).

### 6.2 Bugs de données — état au 28 juin
| Réf | Description | État |
|---|---|---|
| **#300** | désync `getSync("trimestres")` au boot | **CLOS** (10 juin, 1.6.1) |
| **#353** | saturation localStorage → bascule memoryCache/IDB | **Risque de PERTE fermé** (durabilité Option A/B/C, 1.24.1/1.24.2) ; reclassé 🟢, observabilité reportée à une session dédiée |
| **#352** | écrasement `a2025_productions` ← `h2026_productions` | **Réparé en données** (26 juin, console) ; tient après recharge ; cause structurelle adossée à #353 |
| **#360** | doublons d'évals note-égale vs reprises légitimes | **Cœur LIVRÉ** (1.24.0, Option A, vérif adverse 6 agents) |
| **#340** | changement de trimestre écrase les productions cibles | Symptôme réparé + **garde-fou actif** (1.17.7) ; reste **confirmation terrain** |
| **#346** | `coursId` non migré sur les productions | **Réparé en données** (24 juin) ; reste cause de fond (migration d'id + doublons de fiches `cours`) |
| **#362** | 408 évals h2026 → 3 grilles absentes du jeu de travail | **EN COURS** (Claude Code, fix `f9c824af` apparié par couverture scopée + `critereId`) ; séance dédiée backup + L0 |
| **#350** | recalcul FR-algo à l'ouverture d'une éval A25 → note gonflée | Données intactes, L0 vert ; **correctif à faire** + vérifier H26 |
| **#301** | résolution de pratique en **consultation** lit le namespace actif, pas le consulté | **À faire** — la note d'un trimestre archivé dépend du contexte courant |

### 6.3 Préservation des données
- **Namespacing par trimestre (#358) — migration live VALIDÉE (1.25.0, 28 juin)** : les modèles
  (grilles/échelles/cartouches) sont désormais des copies namespacées `<trim>_*` ; le global hérité est vidé
  au boot (orphelins non capturés **conservés** + journalisés, jamais perdus). Filet : golden masters L0/L2,
  sentinelles special-archive. Doc : `plans de travail/CADRAGE-briques-C-D-namespacing.md`,
  `PLAN-358-migration-modeles.md`.
- Migrations destructives : **uniquement en console one-shot sur backup Codex frais**, jamais distribuées.
- Règle d'or des séances « données » : backup Codex → dry-run/preview lecture seule → golden master L0
  avant/après (MAE Omnivox < 0,5 sur a2025 ; h2026 = self-compare) → break-test `--prouver-rougit`.

---

## 7. Pérennité

### 7.1 Documentation publique de conformité — Fait (révision Loi 25 en attente)
Présents et vérifiés sur `main` : `AUDIT.md`, `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `README.md`,
`SECURITY.md`, `libs/VERSIONS.md`, ADRs (`docs/adr/`).
- **Reste** : **#298** — réviser `PRIVACY.md` (recadrage Loi 25, alignement sur la fenêtre publique
  3-30 juin). La fenêtre « avant ouverture » est échue ; à requalifier. Dépend de l'analyse des logs Cloudflare.

### 7.2 Hygiène GitHub / OpenSSF — Fait (CodeQL et protection de branche retombés avec la privatisation)
Présents et vérifiés sur `main` : `SECURITY.md`, `.github/dependabot.yml`, workflow CI
`.github/workflows/tests.yml` (Vitest + Playwright, fonctionnel). Livrés le 25 mai.
- **CodeQL retiré le 26 juin 2026** : exige GitHub Advanced Security, indisponible gratuitement sur dépôt
  privé. Depuis la **privatisation du 23 juin**, le job échouait à chaque PR (check rouge trompeur).
  `codeql.yml` supprimé (zéro-dette).
- **Protection de branche `main` inactive** depuis la privatisation (API GitHub `403 — Upgrade to GitHub Pro`).
  `BRANCH-PROTECTION.md` recadré le 26 juin (statut « suspendu »), `DEPLOY.md` §8.3 + checklist Scorecard
  alignés. Référence à réappliquer si le dépôt redevient public ou passe à GitHub Pro.
- **Note** : les plans d'audit (15 mai) listent encore ces éléments « absents » — état périmé.

### 7.3 Licences
- Double licence AGPL v3 + CC BY-NC-SA 4.0. Headers SPDX et `libs/VERSIONS.md` présents.
- **#342** (attribution CC erronée) : **prévention livrée** (1.20.0, défaut « Inconnu ») ; reste la
  réparation des données déjà stampées (script console — palier 1 du plan mi-août).

### 7.4 Accessibilité (WCAG 2.1 AA) — En cours
- **Fait** : labels d'en-tête, #305 (modale d'aide), contraste corbeilles (#323), a11y clavier/focus du
  comparateur et de la bannière d'accueil.
- **À confirmer / compléter** : contraste, `outline:none`, `prefers-reduced-motion`, `prefers-contrast`,
  `aria-live` (audit C.3-C.7, statut partiel — à revérifier sur `main`).
- **À faire (humain, Q3)** : tests manuels VoiceOver (Mac) + iPad réel. #299 (références d'onglets périmées
  dans l'aide) compte aussi pour l'expérience d'un utilisateur frais.

---

## 8. Backlog applicatif — vue par horizon

Détail et contexte complet dans **`BACKLOG.md`** (dernier ID #362). La priorisation vers la mi-août vit
dans **`plans de travail/PLAN-mi-aout-2026.md`** (3 paliers, porteurs, décisions). Ce document ne duplique
pas le backlog ; il situe.

**Livré depuis le 10 juin (≈20 releases, 1.7.0 → 1.26.0), points saillants :**
- **Voûte Phase 1** (#329) : lots P1→P4, signature ECDSA + TOFU, format `.lcz` (1.7.0 → 1.11.0). Avant-pilote
  code-complet ; reste revue du format + re-passe iPad → **pilote restreint fin août**.
- **Import codex iPad** (#334 A-D) + garde-fous inter-appareils (#335, 1.16.0) + purge espace précédent
  (#336, preview/manuel). Restent des validations **terrain iPad**.
- **Comparateur de pratiques** (#326/#307) : banc de décision (1.19.0), `noteConstructible` (1.20.0),
  masquage réversible (#345, 1.21.0), **réactivation (1.26.0)**.
- **Dénotation** : DEN éditable inline + créable de 1er rang (1.21.0).
- **Namespacing par trimestre** (#358 + briques A/B/C, #357) : 1.21.1 → 1.23.0, migration **live** 1.25.0.
- **SSOT `modalitesEvaluation`** (#328) : « fin de #328 » 1.22.0 (à recouper, §5.3).
- **Intégrité** : #360 doublons (1.24.0), #353 durabilité (1.24.2), #350/#346/#352 réparés en données.

**Horizon mi-août — paliers (détail dans le plan) :**
- **Palier 1 (bloquant-confiance)** : finir #326 (fait), #362, #350, #346, #342 (réparation données), #332
  Constat 1 ; côté terrain Grégoire : #334, #336, #340, re-passe iPad #329.
- **Palier 2 (polish)** : #299, #313/#279 (décisions UX), #291, #286, #273.
- **Palier 3 (reportable / automne)** : 🟢 et 📦 du backlog ; **exclu : article #35/#36** (Steve Bissonnette).

---

## 9. Décisions en attente

Les décisions structurantes pour l'horizon mi-août sont rassemblées au **§9 de `PLAN-mi-aout-2026.md`**.
Synthèse :

| Réf | Décision | État |
|---|---|---|
| Arbitrage de volume | Quels 🟡 sont vraiment « confiance externe » (palier 1) vs polish ? ~14 🟡 ouverts + #358 en parallèle, 7 semaines | **Ouverte** — appartient à Grégoire |
| #328 dans la fenêtre mi-août | Si du reste subsiste (L2-b2/L2-c), entre-t-il avant l'automne ? | **À recouper** d'abord (§5.3) |
| #313 / #279 (UX) | Dédup sélecteurs Production / 3 champs au formulaire de production | **Ouverte** (📐, à trancher avant de coder) |
| Voûte #329 — format | Taille max (50 Mo) + champs exclus à confirmer avant le lot final | **Ouverte** |
| #336 — purge espace précédent | Exécuter ou non la purge auto sur les vraies données | **Ouverte** |
| Comparateur — « STD = 0 » | 0 légitime vs `null` | **TRANCHÉE (28 juin)** : STD non bâtie → `null` (« non constructible »). Vu en 1.26.0 |
| Reliquats vocabulaire (`v2-seuil-fragile`, `interpreterMobilisation`) | Libellés à conserver/atténuer | Ouvertes (audit D.1/D.3) |
| Règle IDME stricte niveau global | Override moyenne pondérée | Reportée par Grégoire (14 mai) |

---

## 10. Points de vigilance

- **Reprise d'août sur Plan Pro, après un congé de juillet.** Mémoire personnelle dégradée + budget réduit
  (Pro ≪ Max 20x, usage partagé Cowork + Claude Code). Mitigations : s'appuyer sur le rituel
  `SKILL_Debut_de_session.md` et sur `PLAN-mi-aout-2026.md` plutôt que sur la mémoire ; défaut **Sonnet**
  pour le codage ; viser un dépôt **propre et poussé** avant le départ (cf. §10 bis).
- **Multi-agents.** Plusieurs agents (Cowork + Claude Code) opèrent sur le même dépôt ; une collision de
  rebase a déjà eu lieu le 28 juin (résolue en merge, sans perte). Vérifier `git status` / verrous `.git/*.lock`
  avant toute opération d'écriture.
- **Désyncs de tracker.** `BACKLOG.md` / `SUIVI-BUGS.md` peuvent retarder sur le code (vu #326-T1/T2, #328).
  Toujours recouper un statut au code avant de s'y fier — c'est le rôle de ce document.
- **Bêta publique en cours.** Des expérimentateurs réels utilisent l'app depuis le 3 juin. Les retours
  testeurs interrompent le plan (règle CLAUDE.md) ; aucune migration destructive distribuée — fixes de
  données en console one-shot chez Grégoire seulement.
- **Cache Safari `file://`** : après un bump de build, hard refresh `Cmd+Option+R` obligatoire ; suspecter
  le cache avant le code en cas de faux bug.
- **Refactoring d'extraction** : un guard `typeof === 'function'` ne signifie pas qu'une fonction est morte ;
  tout fix défensif critique doit être verrouillé par une sentinelle sous peine de disparaître silencieusement.

### 10 bis. À faire avant le congé de juillet (pour une reprise nette au 1er août)
1. **Dépôt propre et poussé** : laisser Claude Code finir/committer/pousser le palier 1 en cours ; nettoyer
   les `.git/*.lock` résiduels (depuis le Terminal Mac) ; aligner `origin/main` sur le local.
2. **Trancher ou parquer explicitement les décisions ouvertes du §9** (sinon une session fraîche stagne).
3. Optionnel : une note `REPRISE-2026-08-01.md` (état git, décisions §9, items « mains dans les données »,
   première tâche recommandée).

---

## 11. Journal des mises à jour

| Date | Build | Révision |
|---|---|---|
| 2026-05-31 | 0531-0840 | Création du document. État consolidé après audit du backlog et des plans Phase 2. |
| 2026-05-31 (PM) | 0531-1409 | #294 fait (déploiement lancé). UI : bandeau orange, thème clair, anti-flash. « wizard » → « assistant ». Plan « Bêta publique 1.0.0 » prêt. |
| 2026-06-10 | 0610-0512 | Rattrapage de 10 jours (124 commits, 1.0.0 → 1.6.1). Lancement public fait. #303 clos, #307/#318/#319/#320/#327 livrés, #300 clos. Tests 436 verts. Audit SSOT `modalitesEvaluation` livré (plan 4 lots). |
| 2026-06-28 | 0628-2126 | **Rafraîchissement Cowork** (1.6.1 → 1.26.0, ~20 releases). Ajout §0 repère rapide + §10 bis. LIVRÉS : Voûte avant-pilote (1.11.0), comparateur réactivé (#326, 1.26.0), namespacing par trimestre + migration live (#358, 1.25.0), durabilité IDB (#353, 1.24.2), doublons (#360, 1.24.0), « fin de #328 » (1.22.0, **à recouper** — case BACKLOG ouverte). EN COURS : palier 1 mi-août (#362 fix `f9c824af`). Horizon **mi-août** cadré (`PLAN-mi-aout-2026.md`). Privatisation du dépôt (23 juin) → CodeQL/branch-protection suspendus. Contexte : passage Max 20x → Pro + congé juillet, reprise 1er août. Tests 1142+68 *rapportés* (à recouper). État vérifié au code/git ; non poussé. |
