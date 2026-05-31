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
> **Dernière mise à jour** : 31 mai 2026 — beta 99.86 / build 0531-0840 — HEAD `main` `32f7c7b`.

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
| Documentation publique de conformité | **Fait** (révision Loi 25 en attente) | §7 |
| Hygiène GitHub / OpenSSF | **Fait** | §7 |
| Accessibilité (WCAG AA) | **En cours** | §7 |
| Refactoring résiduel (Track 3 ph.2, Track H) | **Optionnel** | §5 |
| Bugs de données connus (#300, #301) | **À faire** | §6 |
| Chantier pratiques SSOT (#303) | **En cours** | §8 |
| Branche `audit/2026-mai` (archivage doc) | **À faire** (post-AQPC) | §4 |
| Plan long terme + chantiers long terme | **Long terme** | §4, §5 |

**Seul chantier réellement urgent avant l'AQPC du 3 juin** : **#294** (Cloudflare/Netlify).
La révision Loi 25 (#298) est importante mais sa fenêtre est « avant l'ouverture publique 3-30 juin »,
pas avant la démo.

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

**Branche `audit/2026-mai`** (HEAD `097ce88`) : **purement documentaire** (rapports + plans + traces
Cowork, **aucun code applicatif**). Divergence depuis le 15 mai : ≈68 commits d'avance, ≈340 commits de
retard sur `main`. Un **merge d'archivage** vers `main` est prévu **post-AQPC**, une fois les tests
manuels d'accessibilité faits. Conflits attendus seulement sur `SESSION.md`/`BACKLOG.md` (réconciliation
manuelle) ; **zéro conflit de code**. Aucun plan détaillé écrit — c'est un archivage à faible risque,
pas une migration de données.

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

- **Tier 6.5 `modalitesEvaluation`** : 14 écrivains sur la même clé (violation SSOT critique) — audit dédié requis.
- **`reserve.js`** : refactoring en 3 couches (FSAPI / métier / UI) — long terme.
- **Dispatcher publish/subscribe** (≈405 actions) — long terme.
- **#297** : duplication de règles CSS entre le `<style>` inline d'`index.html` et `styles.css`
  (tout fix CSS sur une règle dupliquée doit toucher les deux endroits). Audit complet post-AQPC.

---

## 6. Stabilité

### 6.1 Filet de tests
- Suite : 125 tests Vitest + 24 tests Playwright (WebKit) = **149 verts** au 31 mai.
- Couvre : sécurité (CSP, sandbox, sanitisation, imports), sentinelles d'exports après refactoring,
  rendus DOM des modules refactorés.
- **Limite connue** : la page d'assemblage (`trimestre-v2-*`) n'a que des sentinelles d'exports,
  aucun test de comportement de sauvegarde (cf. #306).

### 6.2 Bugs de données connus, non corrigés
| Réf | Description | Impact |
|---|---|---|
| **#300** | `getSync("trimestres")` rend des ids vides (désync localStorage↔IDB) | Tout énumérateur de trimestres doit lire en async |
| **#301** | Résolution de pratique en consultation lit le namespace du trimestre **actif**, pas du **consulté** | La note finale d'un trimestre archivé dépend du contexte courant |

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
- **Fait** : aria-label `#btn-codex`, label `#selectGroupeCoursHeader` (15 mai).
- **À confirmer / compléter** : contraste, `outline:none`, `prefers-reduced-motion`,
  `prefers-contrast`, `aria-live` (audit C.3-C.7, statut partiel selon les plans — à revérifier sur `main`).
- **À faire (humain, post-AQPC ou Q3)** : tests manuels VoiceOver (Mac) + iPad réel.
- **#305** : la modale d'aide contextuelle annonce un dialogue sans nom accessible (`aria-labelledby`
  pointant vers un span jamais peuplé) — vrai pour ~40 entrées d'aide.

---

## 8. Backlog applicatif — vue par priorité

Détail et contexte complet dans `BACKLOG.md` (≈41 items/sous-items ouverts au 31 mai). Regroupement :

- **Prioritaires actés** : #282 (migrer `cours.js` `listeCours`→`cours`), #283 (responsive sidebar mobile),
  #284 (titres/sous-titres de pages).
- **Bugs de données** : #300, #301 (cf. §6.2).
- **Chantier pratiques** : #303 (SSOT — Sessions A-1, A-2 et volet B faits ; **reste Session C**, calcul par
  famille), #306 (uniformisation assemblage — décisions actées 31 mai, cf. `Rapports/analyse-coherence-assemblage-groupe-cours.md`),
  #302 (guides pédagogiques + PAN), #307 (simuler/comparer des pratiques).
- **Conformité** : #298 (révision PRIVACY.md Loi 25).
- **A11y / dette** : #305, #299 (références d'onglets périmées dans l'aide), #297 (dette CSS inline),
  #295 (diagnostic mémoire avant ouverture Codex iPad/iPhone).
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
- **Cadre AQPC** : ne rien lancer de sensible (migration destructive, gros refactoring) à J-3. Seul urgent : #294.
- **Cache Safari `file://`** : après un bump de build, hard refresh `Cmd+Option+R` obligatoire ; suspecter
  le cache avant le code en cas de faux bug.
- **Refactoring d'extraction** : un guard `typeof === 'function'` ne signifie pas qu'une fonction est morte ;
  tout fix défensif critique doit être verrouillé par une sentinelle sous peine de disparaître silencieusement.

---

## 11. Journal des mises à jour

| Date | Build | Révision |
|---|---|---|
| 2026-05-31 | 0531-0840 | Création du document. État consolidé après audit du backlog et des plans Phase 2 ; vérification de l'état réel de `main` (docs de conformité + hygiène GitHub présents, plans d'audit périmés sur ces points). |
