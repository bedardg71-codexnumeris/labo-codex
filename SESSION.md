<!-- =====================================================================
     IDENTIFICATION DE CE FICHIER  (mis à jour 22 mai 2026 matin, post-cycle AQPC)
     Ce SESSION.md vit sur la branche `main` du worktree principal et sert
     de relai entre les sessions Claude. Il décrit l'état post-livraison
     du cycle AQPC pré-3-juin (PLAN-COURT-TERME) et donne la consigne de
     démarrage pour la prochaine instance.
     L'archive complète du cycle Cat-B post-merge (clos 21 mai, 10/10
     critères atteints) reste dans les §§ suivants comme référence
     historique.
     ===================================================================== -->

> **📌 Identification**
> - **Chemin canonique** : `SESSION.md` (racine du repo, branche `main`)
> - **Cycle en cours** : AQPC pré-3-juin (PLAN-COURT-TERME) — Phase 7 tests manuels Grégoire restante
> - **Document maître** : `audit/PLAN-COURT-TERME.md` (avec `PLAN-AQPC.md` en archive du plan pré-pivot)

# SESSION — État au 22 mai 2026 (post-AQPC, prochaine priorité : Sprint A axes 2 & 3)

**Beta / build** : 99.62 / 0522-0650 (bump validé par Grégoire à la clôture du cycle AQPC).
**Branche `main`** : HEAD à `7c30d64` (release 99.62) post-merge FF de `aqpc/privacy` (6 commits AQPC) + bump.
**Branche `aqpc/privacy`** : retirée localement + remotement (mergée et propre).

**Tests** : 85 Vitest verts à chaque commit (hook pré-push vert sur les 6 commits AQPC + commit release 99.62). Playwright non re-vérifié dans le worktree aqpc (pas de modif de zone DOM nouvelle).

**Cycle suivant demandé par Grégoire (22 mai 2026 matin)** : attaquer la santé du code (Axe 2) et l'architecture SSOT (Axe 3) de l'audit annuel. Le plan est séquencé en 3 sprints A → B → C. **La prochaine session démarre par le Sprint A** (~1-2 h, 0 risque applicatif). Voir §3 ci-dessous.

---

## §0 — GARDE-FOU (lire en premier)

**Ce qui est INTERDIT dans la prochaine session :**

- ❌ **Ne pas bumper la beta sans demander à Grégoire**. Le bump 99.62 (build 0522-0650) a été acté à la clôture du cycle AQPC le 22 mai matin. Toute nouvelle modification version.json/init-inline.js doit confirmer le numéro suivant avec Grégoire en début de session.
- ❌ **Ne pas re-livrer les Phase 1.4 ni 1.6 du PLAN-COURT-TERME sur ce worktree main**. Les fichiers cibles (`audit/04-sustainability/`, `audit/package.json`, `docs/adr/`) vivent uniquement sur la branche `audit/2026-mai` — c'est là que ces fixes doivent être appliqués, pas sur main.
- ❌ **Ne pas redéfinir `decouplerPR` ni `indiceR` ni `risque` comme propriété**. Le refactor R → N (Niveau d'attention) du 22 mai a éliminé ce vocabulaire. Source unique : `decouplerPN` / `indiceN` / propriété `niveauAttention` sur l'objet `indices`. Migration de données idempotente dans `main.js` (`migration_decoupler_pn_done`).
- ❌ **Ne pas remettre `MAX_RAPPORTS_ARCHIVES` à 50** dans `js/rapport-bug.js`. Seuil abaissé à 20 le 22 mai (Phase 6.2 PLAN-AQPC, audit PII). Migration de tronquage dans `main.js` (`migration_rapports_bug_20_done`).
- ❌ **Ne pas démarrer une nouvelle session Cat-B sur `audit/2026-mai`**. Cette branche a son propre cycle (audits, rapports, docs sécurité) — créer un nouveau worktree depuis `main`.
- ❌ **Ne pas réactiver `initialiserModuleEvaluation`** : le bug #107 a été corrigé par RETRAIT du code (stabilité zéro-dette CLAUDE.md), pas par activation. La fonction n'a jamais servi en prod depuis 5 mois.
- ❌ **Ne pas tenter de descendre `genererSectionMobilisationEngagement` sous cyc 30 sans nouvelle validation Grégoire**. Cyc 48 acté **héritage Cat-B sous N=50** le 21 mai PM. Le template HTML est dense en ternaires (`${nb > 1 ? 's' : ''}` × ~20) qui sont difficiles à éclater sans sur-fragmenter (cf. §6.5 gabarit METHODE). Si réouverture, valider d'abord avec Grégoire qu'il accepte la sur-fragmentation.
- ❌ **Ne pas re-fix le bug latent #110 (`portfolioActif` → `portfolioActifRapport`)** : déjà corrigé dans le commit `47651cb` (Track 3 phase 2 Performance). Inscrit Corrigés SUIVI-BUGS le 21 mai PM.
- ❌ **Ne pas écrire `window.evaluationEnCours = ...` ni `.X = ...` depuis un module hors whitelist** (config.js + evaluation*.js). Sentinelle Vitest `tests/unit/sentinelle-evaluation-en-cours.test.js` verrouille cet invariant (chantier F livré 21 mai soir). Toute amorce du pivot depuis un module externe passe par `window.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js`.
- ❌ **Ne pas définir une fonction `function afficherNotificationX(...)` dans `js/*.js`** (hors `_archives/`). Sentinelle Vitest `tests/unit/utils-notifications.test.js` verrouille cet invariant (chantier E livré 21 mai soir). Utiliser `window.notifications.{succes, erreur, info}` (utils-notifications.js) pour toute notification toast.
- ❌ **Ne pas réintroduire un wrapper local défensif `if (typeof window.afficherNotificationX === 'function')`**. L'API `notifications.X` est garantie chargée via `utils-notifications.js` (ligne 15969 d'index.html, après modes.js). Les 149 guards typeof orphelins ont été retirés ; tout nouveau guard est une régression Cat-B.

---

## §1 — Récap du cycle AQPC pré-3-juin livré (22 mai 2026)

**Branche dédiée** : `aqpc/privacy` (créée depuis main `e50cf61`, mergée FF sur `main` au commit `1312a6b`, puis supprimée localement + remotement).

**6 commits livrés** (du plus ancien au plus récent) :

```
2e5a86c  docs(aqpc): documentation Loi 25 + déploiement (Phase 2-3)
32d931a  docs(aqpc): refonte README + MAJ versions Beta 99.61 (Phase 1.5 + 4)
4401ac6  a11y(aqpc): Phase 5 axe-core — T-A1 + T-A2 + 5.3 + 5.4 + 5.5
c018b44  refactor(aqpc): Phase 6.1 — retirer 2 fonctions code mort alarmistes
52b2ebf  refactor(aqpc): R (Risque) → N (Niveau d'attention) — Phase 6.1 reliquat
1312a6b  refactor(aqpc): Phase 6.2 — audit + rétention rapportsBugArchives
```

Puis bump version `99.61 → 99.62` (build `0521-2101 → 0522-0650`) à la clôture, commit séparé.

### Bilan PLAN-COURT-TERME

| Phase | Statut |
|---|---|
| 1.1 typo eval | ✅ Déjà corrigé antérieurement |
| 1.2 + 1.3 (T-A1, T-A2 ARIA) | ✅ Livré |
| 1.4 (CC BY-SA → CC BY-NC-SA) | ⏳ Reporté `audit/2026-mai` (fichiers cibles n'existent pas sur main) |
| 1.5 (MAJ Beta CLAUDE.md + START-HERE) | ✅ Livré |
| 1.6 (lien docs/adr/) | ⏳ Reporté `audit/2026-mai` (dossier n'existe pas sur main) |
| 2.1 PRIVACY.md | ✅ Livré (≈ 400 l., 7 sections requises + mentions formelles + limites assumées) |
| 2.2 INCIDENTS.md | ✅ Livré (registre conforme art. 63.5 Loi 25) |
| 2.3 INFO-ELEVES.md | ✅ Livré (gabarit à distribuer aux étudiants) |
| 3.1 DEPLOY.md | ✅ Livré (chaîne GitHub → Netlify → Cloudflare Access) |
| 3.2 netlify.toml | ✅ Livré (consolide `_headers` — à supprimer après validation deploy) |
| 4 refonte README.md | ✅ Livré (8 références mortes retirées) |
| 5.1 T-A3 contraste 17 nodes | ⏳ Délégué ds-update passe 3 |
| 5.2 22 outline:none | ⏳ Délégué ds-update passe 3 |
| 5.3 prefers-reduced-motion | ✅ Livré |
| 5.4 prefers-contrast: more | ✅ Livré |
| 5.5 aria-live notifications | ✅ Livré |
| 6.1 (a) chaînes alarmistes UI | ✅ Déjà retiré Cat-B Track 4 chantier J + refactor R → N (49 substitutions) |
| 6.1 (b) 4 fonctions code mort | ✅ 4/4 retirées (2 Cat-B Track 1 + 2 AQPC) |
| 6.2 audit `rapportsBugArchives` | ✅ Livré (seuil 50→20, migration, alerte UI) |
| 7.1 + 7.2 tests manuels Grégoire | ⏳ À toi |

### Dettes explicites documentées — toutes closes le 22 mai 2026

| # | Dette | Commit | Note |
|---|---|---|---|
| #1 | UI Direction du risque (bloc `reglages-interpretation-legacy` complet) | `5c4338b` | −408 lignes |
| #2 | « Seuils d'alerte critiques » → « Seuils de vigilance » | `6e7455d` | 1 site |
| #3 | 3 tooltips UI « risque » → « niveau d'attention » + `DESCRIPTIONS_SEUILS` orphelin | `92480f1` | Bonus zéro-dette |
| #4 | Retrait `_headers` (netlify.toml prend le relai) | `ad396f4` | Deploy validé |

**Cleanup Beta 95 legacy étendu** (22 mai 2026 matin) :
- Phase 1 (commit `479422c`) : retrait des 7 autres blocs `reglages-*-legacy` masqués depuis Beta 95 (apercu, trimestre, cours, horaire, groupe, snapshots, import-export) — **−1314 lignes index.html**
- Phase 2 (commit `6b2da4b`) : retrait de 19 fonctions JS orphelines associées dans trimestre.js, horaire.js, trimestre-v2-init.js, trimestre-v2.js, cours.js, import-export.js — **−931 lignes JS**

### Prochaine session — chantier dédié modules cours/groupe/trimestre.js cleanup

Reste du code mort en cascade qui dépend des IDs legacy retirés mais n'a pas été nettoyé en Phase 2 (scope trop large, lecture complète des modules requise) :

- **`js/cours.js`** : `afficherFormCours`, `annulerFormCours`, `sauvegarderCours`, `ouvrirModalBibliothequeCours`, `afficherListeCoursSidebar` — chaîne morte profonde (cherche `getElementById('listeCoursSidebar')`, ID retiré Phase 1)
- **`js/groupe.js`** : `addStudent`, `resetFiltreGroupe` + leurs callers internes morts en cascade (querySelectors sur `button[data-action="addStudent"]` inexistant)
- **`js/trimestre.js`** : `chargerCadreCalendrier`, `chargerEvenementsPrevus`, `chargerEvenementsImprevus`, `migrerEvenementsAvecIDs`, `afficherStatistiquesTrimestre`, `supprimerEvenement`, `modifierEvenementEnPlace`, `sauvegarderEditionEnPlace`, `annulerEditionEnPlace`, `majAffichageRepriseEditionEnPlace`, `genererCarteEvenement*` — chaîne morte. `initialiserModuleTrimestre` est devenue no-op (cherche `debutTrimestre` inexistant → early return) mais reste appelée par `main.js:467` — à simplifier au seul appel `initialiserTrimestreV2()`

**Estimation effort** : ~3-4 h. Lecture complète des 3 modules + identification précise de l'état legacy/v2 + retraits en bloc avec validation tests. Cohérent CLAUDE.md « Stabilité zéro-dette ».

### Démarches externes à engager

- **Demande d'avis au responsable PRP du Cégep de Drummondville** (Loi 25) — délai réponse 2-6 semaines. À envoyer par Grégoire. Conditionne la version 1.1 de PRIVACY.md.

---

## §1bis — Archive du cycle Cat-B post-merge (clos 21 mai 2026)

> Cycle précédent — 10/10 critères atteints. Conservé pour référence.

### Track 1 — Quick wins (✅ complet, matin)

**Commit** : `054d461` (correctif version : `5a12236`)
**Tag** : `cat-b-track-1-2026-05-21`

- **13 bugs latents #96-108 fermés** (productions 3, trimestre-v2 6, profil-etudiant 2, evaluation 2)
- **3 doublons evaluation résolus** (`restaurerPreferenceTri`, `obtenirClasseNote`, `filtrerListeEvaluations`)
- **2 codes morts alarmistes retirés** (`calculerRisqueEchec`, `obtenirClasseRisque`)
- −307 LOC nettes, 89/89 tests verts

Voir `Retours des testeurs/SUIVI-BUGS.md` section « Corrigés (21 mai 2026 — Cat-B Track 1 chantier A) ».

### Track 2 — Méthode (✅ complet, matin)

**Commit** : `3c09782`
**Tag** : `cat-b-track-2-2026-05-21`

- **20 propositions Cat-B méthode actées et intégrées** dans `audit/refactoring-prep/METHODE-REFACTORING.md`
- **6 nouveaux anti-patterns §5.8 à §5.13** (wrappers résiduels, factoriser branches, `// security-ok` inline, variables IIFE, let cross-IIFE, closures async)
- **§3 étapes 0/3/4/5 enrichies** (orchestrateurs en dernier, grep `window.X`, renommage si résidu IIFE complet, trade-off cyc 15/30, stratégie N=50, sous-helpers DOM, bug latent pendant éclatement)
- **§4 check-list étape 3 enrichie de 4 items**
- **§6.5 gabarit** : rubrique « Stratégie cyc > 30 (cible dure vs héritages Cat-B) » ajoutée
- **METHODE-REFACTORING gelée** jusqu'au prochain cycle de refactors (Q3 2026 si applicable)

### Track 3 phase 1 — Héritages cyc > 30 (✅ partiel, matin — 8/14 fonctions)

**Commits** : `826b28a` (refactor) + `c9ef2d0` (doc statut)
**Tag** : `cat-b-track-3-phase1-2026-05-21`

**Modules à baseline 0 cyc > 30** :
- ✅ `evaluation*.js` : 3/3 fonctions
- ✅ `trimestre-v2*.js` : 4/4 fonctions
- ⚠️ `profil-etudiant*.js` : 1/7 (`determinerCibleIntervention` 58→<30) — reste 6 fonctions traitées en phase 2 PM

### Track 3 phase 2 — profil-etudiant (✅ complet, après-midi)

**Commits** : `d03352d` (arrow :2659) + `4462bdc` (calculerIPB) + `e0caa8f` (calculerDetailsNoteFinale) + `47651cb` (Performance + arrow :4083 + fix #110) + `2b24576` (Mobilisation) + `88bcaf1` (docs PLAN)
**Tag** : `cat-b-track-3-phase2-2026-05-21`

**5 fonctions traitées (38 helpers privés ajoutés)** :

| Fonction | Cyc | Helpers | Statut |
|---|---:|---:|---|
| Arrow `.map` :2659 (zone Section Productions) | 36 → <30 | 5 | ✅ strictement <30 |
| `calculerIPB` (calculs.js) | 36 → <30 | 5 | ✅ strictement <30 |
| `calculerDetailsNoteFinale` (actions.js) | 67 → <30 | 8 | ✅ strictement <30 |
| `genererSectionPerformance` + arrow :4083 | 52 → <30 | 10 | ✅ strictement <30 |
| `genererSectionMobilisationEngagement` | 59 → **48** | 10 | ⚠️ **héritage Cat-B sous N=50 acté** |

**Bug latent #110 fixé** dans le commit Performance : `portfolioActif` (variable non définie dans `genererSectionPerformance`, la correcte est `portfolioActifRapport`). Affichait toujours « Performance des productions indépendantes ». Inscrit Corrigés SUIVI-BUGS le 21 mai PM.

**ESLint cyc>30 dans profil-etudiant\*** : 6 → 1 (Mobilisation héritage cyc 48).

### Track 4 — Transversaux (✅ G + J + F + E + I livrés)

**Commits clés** : `3fe5165` (G+J matin) + `6532f75` (F soir) + sous-lots E `e0a9fdb`→`864a756` (6 commits soir) + `a16aefa` (I soir + build refresh 0521-2046)
**Tags** : `cat-b-track-4-gj-2026-05-21` + `cat-b-track-4-chantierF-2026-05-21` + `cat-b-track-4-chantierE-2026-05-21` + `cat-b-track-4-chantierI-2026-05-21`

**Livré** :
- ✅ **Chantier G** : 2 accès localStorage direct migrés vers `db.getSync`/`db.setSync` (`profil-etudiant-diagnostics.js`)
- ✅ **Chantier J** : 8 reformulations UI vocabulaire alarmiste + retrait FAQ « Indice R prédit risque d'échec » + glossaire descriptif
- ✅ **Chantier F** (soir, branche `cat-b/track-4-chantier-F`) : Couplage travaux-ui ↔ `window.evaluationEnCours` découplé via API `evaluation.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js`. Audit révèle 8 sites d'écriture cross-module dans travaux-ui (1 réassignation L4639 + 7 mutations Zone 1 `basculerMode` + Zone 2 `afficherPalettesEval`) — scope plus profond que les ~1-3h annoncées PLAN-CAT-B chantier F. Décision (b) découpler actée avec Grégoire. Sentinelle Vitest `tests/unit/sentinelle-evaluation-en-cours.test.js` (3 sub-tests) verrouille l'invariant : whitelist = `config.js` + 7 modules `evaluation*.js`. Tests 92/92 verts (80 Vitest + 12 Playwright).
- ✅ **Chantier E** (soir, branche `cat-b/track-4-chantier-E`) : Consolidation `utils-notifications.js` — **scope réel ~7x plus gros que les 73 annoncés**. Audit révèle ~525 sites d'appel (54 guardés + ~440 bare refs résolues via scope chain → window). Migration en 6 commits livrés sur la branche. État final : 0 def `function afficherNotificationX`, 0 export `window.afficherNotificationX`, 0 wrapper local, 0 guard typeof, 0 cas spécial. Source unique : `window.notifications.{succes, erreur, info}` (utils-notifications.js, textContent → immunisé XSS sans dépendance à echapperHtml). Sentinelle Vitest stricte `tests/unit/utils-notifications.test.js` verrouille l'invariant. 3 bugs latents fixés : #111 XSS trimestre.js (résolu gratuitement par retrait def), #112 type ignoré (`'warning'`/`'erreur'`/`'succes'` en 2e param), #113 shadow local wizard-pratique-v2 1-param. Tests 97/97 verts (85 Vitest + 12 Playwright). −469 LOC nettes.

- ✅ **Chantier I** (soir, branche `cat-b/track-4-chantier-I`, build 0521-2046) : 6 tests Playwright rendus DOM, 5 fichiers `*-rendu.spec.js`. Couvrent : bilan-reflexif éditeur (`initialiserBilanReflexif` → `#bilan-vue-editeur`), productions badge CC (`genererBadgeCC` + vérification fix XSS E-β sur `metadata.contributeurs[].modifications`), trimestre-v2 carte résumé horaires (`chargerHorairesV2` → `#v2-carteResumeHoraire` avec jours/heures/local), profil-etudiant Section Productions par défaut (`afficherProfilComplet` → `#contenuProfilEtudiant`, exerce le résolveur étudiant + cours actif + sidebar 2col), evaluation palette critères (`afficherCriteresDepuisGrille` → `#listeCriteresGrille1`, cartes critères × 4 options IDME), evaluation rétroaction Bilan (`basculerVueRetroaction('bilan')` → `#contenuRetroBilan`, exerce `genererRetroactionBilan` cyc 75 — défis prioritaires + forces). **Tests 85 Vitest + 18 Playwright = 103/103 verts** (+6 chantier I). Critère A8 atteint. **10/10 critères Cat-B atteints** (A2 sous exception N=50). Pattern technique : `page.evaluate()` pour appeler les fonctions de rendu publiques après fixtures `db.setSync`, évite les `setTimeout` en cascade des flux navigation ; `page.on('dialog')` pour auto-dismiss `alert('Élève introuvable')`. Convention `*-rendu.spec.js` complète les `*-chargement.spec.js` existants (sentinelles d'exports).

**Reporté post-AQPC** :
- ⏳ **Chantier H** (OPTIONNEL) : Sous-découpage résidus (~4-6h) — NE PAS attaquer sans nouvelle validation Grégoire (D-21M-5).

**Chantier J reliquat — tokens CSS LIVRÉ (21 mai soir)** :
- ✅ Tokens CSS `--risque-{nul,minimal,faible,modere,eleve,tres-eleve,critique}` renommés en `--niveau-attention-*` (mapping 1:1, 97 hits dans 10 fichiers). Audit réel beaucoup plus modeste que les 480 hits estimés (qui comptaient commentaires + JSON ESLint historiques). Tests 103/103 verts post-renommage. Audit annuel 1.3 désormais complètement vert côté tokens CSS.

**1 décision Grégoire restante (chantier J reliquat)** :
- Label `v2-seuil-fragile` — conservation, atténuation, ou alignement ?

---

## §2 — Critères de clôture du cycle Cat-B (statut)

Référence : `PLAN-CAT-B-POST-MERGE.md` §5.

| Critère | Description | Statut |
|---|---|---|
| A1 | 13 bugs latents #96-108 fermés | ✅ |
| A2 | 0 fonction cyc > 30 dans le codebase | **13/14 strictement <30 + 1 héritage Cat-B sous N=50** (Mobilisation cyc 48) |
| A3 | 0 doublon dans evaluation.js (3 résolus) | ✅ |
| A4 | 2 codes morts alarmistes retirés | ✅ |
| A5 | `utils-notifications.js` créé + 73 callers migrés | ✅ Track 4 chantier E livré (scope réel ~525 sites dans 39 modules, +3 bugs fix #111-113) |
| A6 | Couplage `travaux-ui.js:4639` documenté ou découplé | ✅ Track 4 chantier F découplé via API + sentinelle Vitest |
| A7 | 3 accès localStorage profil-etudiant migrés | ✅ (audit réel = 2 accès, tous migrés) |
| A8 | 6 tests Playwright rendus DOM ajoutés | ✅ Track 4 chantier I (6 tests, 103/103 verts) |
| A9 | Strings UI alarmistes reformulées + FAQ Indice R retirée + glossaire aligné | ✅ (chantier J) |
| A10 | 20 propositions Cat-B méthode actées | ✅ |
| **Bonus** | Bug latent #110 (`portfolioActif`) fixé | ✅ (commit `47651cb`) |

**10/10 critères pleinement atteints** (A1, A3, A4, A5, A6, A7, A8, A9, A10) + A2 acté avec exception N=50. **Cycle Cat-B post-merge clos pré-AQPC.** Seul chantier H reste optionnel et post-AQPC.

**Objectif pré-AQPC 3 juin largement dépassé** : Track 1 + Track 2 + chantier J livrés + Track 3 phase 2 livrée + chantier F livré + chantier E livré + chantier I livré + chantier J reliquat tokens CSS livré (les 4 derniers initialement post-AQPC, tous anticipés le 21 mai). Codebase quasi-propre côté cyc > 30 (1 héritage acté). Pivot `evaluationEnCours` désormais clos cross-module (sentinelle Vitest). Méthode gelée et publiable. Statut audit annuel 1.3 **complètement Vert** (UI + tokens CSS). Rendus DOM des 5 modules refactorés sous test Playwright. **Le seul chantier ouvert (H) est explicitement optionnel et reporté post-AQPC.**

---

## §3 — Consigne de démarrage pour la prochaine session (Sprint A — santé code + SSOT)

> Pour la prochaine instance Claude qui prend le relai. **Le cycle AQPC est livré, la prochaine priorité est le Sprint A** demandé par Grégoire le 22 mai matin : capitaliser sur les améliorations Cat-B + AQPC pour faire basculer formellement l'Axe 2 de l'audit (Rouge → Jaune presque Vert) et préparer le terrain pour Axe 3 (qui reste Rouge). **Effort ~1-2 h, 0 risque applicatif** (mise à jour de documentation + mesures auto-régénérables, pas de modification de code métier).

### Sprint A — contexte

L'audit annuel de mai 2026 a classé :

- **Axe 2 (Santé du code)** : Rouge — 3 R + 1 J + 1 V (cf. `audit/reports/02-summary.md`)
- **Axe 3 (Architecture / SSOT)** : Rouge — 3 R (cf. `audit/reports/03-summary.md`)

Mais **le cycle Cat-B post-merge (clos 21 mai, 10/10 critères) + le cycle AQPC (clos 22 mai matin)** ont changé la donne sans que les rapports d'audit ne soient mis à jour. Notamment :

**Axe 2** :
- 5 god modules refactorés en 32 sous-modules (LOC répartie, 2.1 R → J)
- 13/14 fonctions cyc > 30 descendues sous 30 (2.2 R → J presque V, 1 héritage acté sous N=50)
- 3 doublons evaluation résolus + utils-notifications consolidé (2.3 J → V)
- 4 fonctions code mort retirées (Track 1 + AQPC)
- 85 Vitest + 12 Playwright verts à chaque commit (2.5 R → J)

**Axe 3** (partiellement amélioré) :
- `utils-notifications.js` source unique pour 525 sites (chantier E)
- Pivot `window.evaluationEnCours` encapsulé + sentinelle Vitest (chantier F)
- 2 accès `localStorage` direct profil-etudiant migrés vers `db.*` (chantier G)
- Refactor R → N cohérent SSOT (AQPC Phase 6.1 reliquat, 49 substitutions)
- Tokens CSS `--risque-*` → `--niveau-attention-*` (chantier J)

Mais `docs/DATA-OWNERSHIP.md` est figé au 3 avril 2026 (Beta 99.03) — 7 semaines de retard, 4 owners erronés, 8 violations non listées selon `PLAN-MOYEN-TERME.md` §5.2.

Le Sprint A vise à **rattraper cette dette documentaire** et à **mesurer factuellement le delta Cat-B** dans un addendum à `audit/reports/02-summary.md`. Aucune modification de code applicatif. Sprint B (cartographies SSOT 3.1/3.2/3.3) et Sprint C (Tier 6.5 `modalitesEvaluation`, 14 écrivains, 47 sites) sont la suite logique mais à attaquer plus tard (Sprint B post-AQPC, Sprint C été 2026).

### Étape 1 — Vérifier l'état du repo (1-2 min)

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

git status                              # branche actuelle ? attendu : audit/2026-mai (l'autre instance)
git log --oneline main -5               # HEAD main attendu : `7c30d64 release(aqpc): Beta 99.62 build 0522-0650` ou plus récent
git worktree list                       # 1 seul worktree attendu (le principal sur audit/2026-mai)
```

**Si HEAD main au-delà de `7c30d64`** : un autre chantier a été fait depuis. Vérifier `git log main` pour comprendre. Pas de panique, ce SESSION.md sera mis à jour par cet autre chantier.

### Étape 2 — Créer un worktree dédié main

`audit/2026-mai` a son propre cycle de vie avec des modifs uncommitted (audits, rapports, docs sécurité). **NE PAS écraser**. Créer un worktree dédié :

```bash
git worktree add ../Monitorage_v6-sprintA -b sprint-a/data-ownership main
```

> ⚠️ Pattern observé : `git checkout main` avec modifs uncommitted sur `audit/2026-mai` → git refuse. **Solution propre = worktree dédié à main**.

### Étape 3 — Lecture obligatoire (10 min)

Ordre strict :
1. **Ce SESSION.md** (relai courant + garde-fou §0)
2. `docs/DATA-OWNERSHIP.md` — l'**état actuel** du registre SSOT (à actualiser). Daté du 3 avril 2026, Beta 99.03.
3. `audit/reports/02-summary.md` et `audit/reports/03-summary.md` (sur branche `audit/2026-mai` — lecture seulement, NE PAS modifier le worktree principal) — base de référence statuts V/J/R
4. `audit/refactoring-prep/MODULES-MAP.md` §2.1-2.5 — cartographies par module post-refactoring
5. `audit/PLAN-MOYEN-TERME.md` §5.2 — précise les 4 owners erronés et 8 violations non listées
6. `CLAUDE.md` racine — règles sécurité et conventions

### Étape 4 — Charger les skills

**Obligatoire** :
- `Skills pour Claude Code/SKILL_labo_codex.md` — architecture, indices A-C-P, workflow
- `Skills pour Claude Code/SKILL_integrite_globaux.md` — collections globales partagées (relevant pour DATA-OWNERSHIP)
- `Skills pour Claude Code/SKILL_hygiene_donnees_partagees.md` — principes abstraits SSOT

### Étape 5 — Lancer la suite de tests (baseline)

```bash
cd tests && npm install      # première fois après nouveau worktree
cd tests && npm run test:unit    # attendu : 85 Vitest verts
```

Si rouge dès le départ → diagnostic prioritaire AVANT tout chantier. Sprint A ne touche pas au code applicatif donc cette baseline ne devrait pas bouger pendant le sprint.

### Étape 6 — Exécution Sprint A (1-2 h)

Trois livrables séquentiels.

#### Livrable 1 — Audit auto-régénérable des écrivains/lecteurs SSOT (~20 min)

Script de cartographie automatique. Ne dépend pas d'une vérité humaine, lit le code et produit la carte.

```bash
# Produit la liste des écrivains réels par clé (depuis le code source)
grep -rn "db\.setSync\|setItem" js/ | grep -v "test\|_archives" > /tmp/ecrivains-bruts.txt

# Produit la liste des lecteurs par clé
grep -rn "db\.getSync\|getItem" js/ | grep -v "test\|_archives" > /tmp/lecteurs-bruts.txt
```

À transformer en script Python ou Node qui sort un Markdown ou JSON exploitable. Cible : pouvoir le re-lancer dans 3 mois et obtenir la même structure auto-régénérée. **À déposer dans `scripts/audit-ssot.{js|py}`** (créer le dossier si besoin). C'est aussi le pre-work du Sprint B.

#### Livrable 2 — Actualiser `docs/DATA-OWNERSHIP.md` (~45 min)

À partir des données du Livrable 1 et de la connaissance des chantiers récents :

1. **Mettre à jour l'en-tête** : Beta courante (au moment du sprint), date du jour, source = audit auto-régénéré (script du Livrable 1) + chantiers Cat-B/AQPC livrés
2. **Corriger les 4 owners erronés** identifiés par PLAN-MOYEN-TERME §5.2 (les lister explicitement)
3. **Ajouter les 8 violations multi-écrivains non listées** (idem)
4. **Mesurer le vrai chiffre `modalitesEvaluation`** (le tableau actuel dit « 25+ écrivains » alors que la mesure de la session du 22 mai en a trouvé **14 modules écrivains, 47 call-sites `db.setSync`**)
5. **Refléter les chantiers livrés** :
   - `utils-notifications.js` = source unique notifications (chantier E)
   - `window.evaluationEnCours` encapsulé via API + sentinelle Vitest (chantier F)
   - `profil-etudiant-diagnostics.js` : 2 accès `localStorage` migrés vers `db.*` (chantier G)
   - Refactor R → N : `decouplerPR` → `decouplerPN`, `indiceR` → `indiceN`, propriété `risque` → `niveauAttention` (AQPC Phase 6.1)
   - 4 fonctions code mort alarmiste retirées (`calculerRisqueEchec`, `obtenirClasseRisque`, `calculerNiveauRaI`, `afficherAlertesPrioritaires`, + bonus `afficherDistributionRisques` détecté pendant AQPC)
6. **Marquer les violations résolues** dans le tableau « Violations connues » (#5 `presences` déjà clos antérieurement ; ajouter celles fermées par Cat-B/AQPC)
7. **Garder Tier 6.5 `modalitesEvaluation` (violation #1)** comme dette résiduelle pour le Sprint C

#### Livrable 3 — Addendum à `audit/reports/02-summary.md` (~30 min)

⚠️ **Attention** : `audit/reports/02-summary.md` vit sur la branche `audit/2026-mai` (l'autre instance). NE PAS y écrire depuis le worktree sprintA (main). Deux options :

- **Option A (recommandée)** : créer `audit/refactoring-prep/02-DELTA-CAT-B-AQPC.md` sur main, qui se référence depuis `audit/reports/02-summary.md` au moment où `audit/2026-mai` sera mergé sur main. Pas de collision.
- **Option B** : préparer un patch texte (diff prêt à appliquer) à intégrer manuellement quand la branche `audit/2026-mai` sera mergée. Le déposer dans `audit/refactoring-prep/02-DELTA-PATCH.diff` ou équivalent.

Contenu de l'addendum : tableau avant/après par sous-audit, mesures factuelles (cloc, eslint complexity, jscpd, baseline tests), statut révisé.

Mesures à produire avec :

```bash
# Métriques santé du code post-Cat-B/AQPC
find js -maxdepth 2 -name "*.js" -not -path "*/_archives/*" | xargs wc -l | tail -1
find js -maxdepth 2 -name "*.js" -not -path "*/_archives/*" | wc -l
# eslint complexity si la config est présente dans tests/ ou audit/
```

### Étape 7 — Conventions de travail Sprint A

- **0 modification de code applicatif**. Si une régression latente est détectée pendant le grep, NE PAS la fixer dans ce sprint — inscrire dans `Retours des testeurs/SUIVI-BUGS.md` section « Détectés Sprint A » pour traitement ultérieur (Sprint B ou C selon la nature).
- **1 commit par livrable** (script auto-régénérable, MAJ DATA-OWNERSHIP, addendum/patch).
- **Sécurité** : pas pertinent puisqu'aucune modif applicative. Mais le hook pré-push Vitest reste vert obligatoire à chaque commit (= rien ne touche au code, donc trivialement vert).

### Étape 8 — Bump version en fin de Sprint A

**ATTENTION** : demander à Grégoire AVANT de bumper. Convention CLAUDE.md.

Si pas de modification de code applicatif, **probablement pas de bump beta**. Juste un refresh build (`version.json` + `js/init-inline.js`) pour marquer la livraison documentaire. À confirmer avec Grégoire.

### Étape 9 — Merge FF + push en fin de Sprint A

Depuis le worktree sprintA :
```bash
git push origin sprint-a/data-ownership:main    # FF merge
```

Pas de tag obligatoire pour Sprint A (c'est de la documentation). Si Grégoire le souhaite : `sprint-a-data-ownership-2026-MM-DD`.

### Étape 10 — Cleanup worktree en fin de Sprint A

```bash
# Depuis le repo principal :
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
git worktree remove ../Monitorage_v6-sprintA
git branch -D sprint-a/data-ownership

# Suppression remote (si gh disponible, évite hook pré-push) :
gh api -X DELETE repos/bedardg71-codexnumeris/Monitorage_v6/git/refs/heads/sprint-a/data-ownership
```

### Étape 11 — Préparation Sprint B (à signaler à Grégoire)

Une fois Sprint A clos, signaler à Grégoire que **Sprint B (cartographies 3.1 + 3.2 + 3.3 de l'Axe 3)** peut s'attaquer post-AQPC :

- 3.1 : étendre le script du Livrable 1 pour produire la cartographie complète (lecteurs + écrivains + violations) en MD
- 3.2 : utiliser `npx madge --json js/` pour produire le graphe fan-in/fan-out et le présenter dans `docs/architecture/`
- 3.3 : capitaliser sur `audit/refactoring-prep/MODULES-MAP.md` §2.x + détecter les imports circulaires éventuels

Effort estimé Sprint B : 3-4 h. Risque : faible (production de documentation et de scripts d'analyse).

---

## §3bis — Archive consigne de démarrage Cat-B (clos 21 mai 2026)

> Consigne précédente — conservée comme référence pour les conventions worktree, hook pré-push, etc.

### Étape 1 — Vérifier l'état du repo (1-2 min, période Cat-B)

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

git status                              # branche actuelle ?
git log --oneline main -3               # HEAD main attendu pendant Cat-B : `cdd8a23 refactor(cat-b): chantier J reliquat — tokens CSS` ou plus récent
git tag -l "cat-b-*" | sort             # 9 tags attendus :
                                        #   cat-b-track-1-2026-05-21
                                        #   cat-b-track-2-2026-05-21
                                        #   cat-b-track-3-phase1-2026-05-21
                                        #   cat-b-track-3-phase2-2026-05-21
                                        #   cat-b-track-4-gj-2026-05-21
                                        #   cat-b-track-4-chantierF-2026-05-21
                                        #   cat-b-track-4-chantierE-2026-05-21
                                        #   cat-b-track-4-chantierI-2026-05-21
                                        #   cat-b-track-4-chantierJ-tokens-2026-05-21
```

(Consigne Cat-B complète omise — voir versions précédentes de SESSION.md dans `git log` si besoin.)

---

## §4 — Trouvailles méthode session du 21 mai (Cat-B Tracks 1-4 + 3 phase 2)

À considérer pour un futur enrichissement de METHODE-REFACTORING (mais cycle Cat-B = méthode déjà gelée Track 2) :

### Cumul Track 1-4 matin

1. **Fix par retrait > fix par activation** (bug #107) : un dead code qui n'a jamais servi 5 mois en prod doit être RETIRÉ plutôt que ACTIVÉ. Activer peut révéler des side-effects pré-existants.

2. **Extraction agrégée + sous-helpers DOM (§3 étape 4 acté Track 2)** : confirmé 3× dans Track 3 phase 1.

3. **Cascade règles métier → 1 helper par pattern** (`determinerCibleIntervention` 58→<30) : extraire 1 helper par valeur extérieure de la cascade.

4. **Encoding mixte fichiers** (calculerIPB cyc 36) : Edit JSON-based ne supporte pas le re-encoding automatique des escapes Unicode. Fallback Python éprouvé.

### Nouvelles trouvailles Track 3 phase 2 (PM)

5. **Fallback Python systématique pour gros blocs avec escapes Unicode** (`̀-ͯ` dans regex `replace(/[̀-ͯ]/g, '')`) : Edit échoue silencieusement. Pattern Python éprouvé :
   ```python
   python3 - <<'PYEOF'
   path = 'js/file.js'
   with open(path, encoding='utf-8') as f:
       content = f.read()  # ou lines = f.readlines()
   assert old_string in content, 'sentinel'
   content = content.replace(old_string, new_string, 1)
   with open(path, 'w', encoding='utf-8') as f:
       f.write(content)
   PYEOF
   ```

6. **IIFE imbriqués dans template literals ne contribuent pas autant que prévu à ESLint complexity**. Les extraire en helpers n'apporte qu'un gain marginal (~1 cyc par IIFE). Le ROI vient des branches `if/else if`, `||` cascade, `?.` chains, et `?:` ternaires dans le **corps direct de la fonction**.

7. **Templates HTML denses en ternaires (`${nb > 1 ? 's' : ''}` × N) sont difficiles à éclater sans sur-fragmenter**. Le seuil pragmatique N=50 acté Track 2 (gabarit §6.5) trouve son cas d'usage typique : `genererSectionMobilisationEngagement` cyc 48 = héritage légitime (au-delà, on fragmente artificiellement le code de templating).

8. **Bug latent détecté pendant l'extraction = fix immédiat** (Cat-B, préservation LEVÉE). Bug #110 `portfolioActif` → `portfolioActifRapport` détecté en extrayant le 3e IIFE de Performance, fixé dans le même commit. Inscription SUIVI-BUGS Corrigés. Pattern conforme §3 étape 7 conventions Cat-B.

9. **Factorisation cross-fonctions interdite par le scope** : les helpers SRPNF (Forces et défis) du chantier Performance auraient pu être réutilisés par Mobilisation. NE PAS le faire sans validation Grégoire = ce serait un refactor cross-zones hors scope Track 3 phase 2. Si réouverture, créer un sous-module `profil-etudiant-helpers-srpnf.js` à part.

---

## §5 — Historique des révisions de ce SESSION.md

| Date | Modification | Auteur |
|---|---|---|
| 2026-05-21 (matin) | Identification refactor evaluation TERMINÉ étape 6, archive historique. | Cat-B session (Claude) |
| 2026-05-21 (après-midi) | Réécriture complète pour cycle Cat-B post-merge : §0 garde-fou, §1 récap Tracks 1-4, §2 critères clôture, §3 consigne démarrage prochaine session, §4 trouvailles méthode. | Cat-B session 1 (Claude autonome) |
| 2026-05-21 (PM, post-Track 3 phase 2) | Réécriture complète après livraison Track 3 phase 2 (5 commits + 1 docs PLAN, 38 helpers privés ajoutés, bug #110 fixé, Mobilisation acté héritage Cat-B sous N=50). HEAD main `3fe5165` → `88bcaf1`. Worktrees catb + catb2 supprimés. Garde-fou §0 enrichi (ne pas re-fix #110, ne pas tenter Mobilisation <30 sans validation). §3 consigne démarrage actualisée (priorité Track 4 F/I/E + chantier J reliquat). §4 trouvailles enrichies (Python fallback systématique, IIFE templates ne pèsent pas, ternaires denses = héritage légitime, bug pendant extraction = fix immédiat, factorisation cross-fonctions interdite par scope). | Cat-B Track 3 phase 2 (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier F) | MAJ après livraison Track 4 chantier F (1 commit refactor `6532f75` + 1 commit docs). API `evaluation.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js` ; 8 sites d'écriture cross-module éliminés dans travaux-ui.js (1 réassignation + 7 mutations Zone 1 `basculerMode` + Zone 2 `afficherPalettesEval`) ; sentinelle Vitest `tests/unit/sentinelle-evaluation-en-cours.test.js` (3 sub-tests). Tests 89→92/92 verts. Critère A6 atteint. Garde-fou §0 enrichi (ne pas écrire le pivot hors whitelist). §1 Track 4 enrichi (chantier F livré). §2 critères : 7 atteints au lieu de 6 + 2 restants au lieu de 3. §3 étape 6 réordonnée (Track 4 F retiré, I devient priorité 1). | Cat-B Track 4 chantier F (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier E) | MAJ après livraison Track 4 chantier E (6 commits sur la branche `cat-b/track-4-chantier-E`). Consolidation `utils-notifications.js` — **scope réel ~7x plus gros que les 73 annoncés** : ~525 callers migrés dans 39 modules. 0 def, 0 export, 0 wrapper, 0 guard typeof restants ; source unique `window.notifications.{succes, erreur, info}` (textContent immunisé XSS). Sentinelle Vitest stricte `tests/unit/utils-notifications.test.js` verrouille la régression. 3 bugs latents fixés : #111 XSS trimestre.js innerHTML sans echapperHtml (résolu par retrait def), #112 type `'warning'` ignoré en 2e param, #113 shadow local wizard-pratique-v2 1-param. Tests 92→97/97 verts (+5 nouveaux : 4 API + 1 sentinelle stricte). Build refresh 0521-1108 → 0521-1717. Critère A5 atteint. Garde-fou §0 enrichi (ne pas définir `function afficherNotificationX`, ne pas réintroduire guards). §2 critères : 8 atteints au lieu de 7 + 1 restant au lieu de 2 (A8 chantier I). §3 étape 6 réordonnée (chantier E retiré). −469 LOC nettes. | Cat-B Track 4 chantier E (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier I) | MAJ après livraison Track 4 chantier I (1 commit refactor `a16aefa` + 1 commit docs sur la branche `cat-b/track-4-chantier-I`, build 0521-2046). 6 tests Playwright rendus DOM répartis dans 5 fichiers `tests/integration/*-rendu.spec.js` : bilan-reflexif éditeur, productions badge CC (+ vérif XSS E-β), trimestre-v2 carte résumé horaires, profil-etudiant Section Productions par défaut, evaluation palette critères + rétroaction Bilan. Tests 97→103/103 verts (85 Vitest + 18 Playwright). Critère A8 atteint. **10/10 critères Cat-B atteints** (A2 sous exception N=50). Cycle Cat-B clos pré-AQPC. §0 garde-fou inchangé. §1 Track 4 enrichi (chantier I livré). §2 critères : tous 10 atteints. §3 étape 6 réordonnée (chantier I retiré, priorité 1 devient test visuel Grégoire + décisions J reliquat + prep AQPC). Pattern technique éprouvé : `page.evaluate()` + fixtures `db.setSync` + `page.on('dialog')` pour auto-dismiss alert. Convention `*-rendu.spec.js` (rendus DOM) complète `*-chargement.spec.js` (sentinelles d'exports) déjà en place. | Cat-B Track 4 chantier I (Claude autonome) |
| 2026-05-21 (soir, post-Track 4 chantier J reliquat tokens CSS) | MAJ après livraison chantier J reliquat tokens CSS (1 commit, branche `cat-b/track-4-chantier-J-tokens`). Renommage 7 tokens `--risque-{nul,minimal,faible,modere,eleve,tres-eleve,critique}` → `--niveau-attention-*` (mapping 1:1). Scope réel : 97 hits dans 10 fichiers (styles.css 34 + index.html 29 + 8 modules JS 34). L'estimation initiale 480 incluait commentaires + JSON ESLint historiques (préservés intacts). Tests 103/103 verts (aucune régression). Audit annuel 1.3 désormais **complètement Vert** côté tokens CSS. §1 Track 4 enrichi (chantier J reliquat tokens livré). §3 étape 6 : retirer item tokens CSS de la décision pendante (reste seulement label `v2-seuil-fragile`). Pattern technique : substitution `perl -i -pe 's/--risque-/--niveau-attention-/g'` sur liste explicite de fichiers (préserve les rapports historiques). | Cat-B Track 4 chantier J reliquat tokens (Claude autonome) |
| 2026-05-22 (matin, cycle AQPC pré-3-juin) | Bascule du cycle Cat-B (clos) vers le cycle AQPC pré-3-juin. 6 commits livrés sur la branche `aqpc/privacy` (créée depuis main `e50cf61`, mergée FF sur main au commit `1312a6b`) couvrant Phase 1.5 + 2 + 3 + 4 + 5 (sauf 5.1/5.2 délégués ds-update passe 3) + 6.1 + 6.2 du PLAN-COURT-TERME. Documents publics nouveaux : PRIVACY.md (~400 l.), INCIDENTS.md (~250 l.), INFO-ELEVES.md (~175 l.), DEPLOY.md (~315 l.), netlify.toml (consolide _headers). README.md refondu (8 références mortes retirées, double licence AGPL+CC). Refactor R → N (Niveau d'attention) : 49 substitutions dans 8 modules + cohérent avec renommage tokens CSS du chantier J. 4 fonctions code mort alarmiste retirées au total (2 Cat-B Track 1 + 2 AQPC). Audit `rapportsBugArchives` avec seuil 50→20, migration idempotente, alerte UI dans formulaire bug. Phase 5 axe-core : T-A1/T-A2 ARIA + prefers-reduced-motion + prefers-contrast: more + aria-live notifications. Tests Vitest 85/85 verts à chaque commit (hook pré-push). Bump version 99.61 → 99.62 (build 0521-2101 → 0522-0650) à la clôture. Branche `aqpc/privacy` supprimée localement et remotement après merge. §0 garde-fou réécrit (retrait mention 99.62 reverté, ajout decouplerPN + MAX_RAPPORTS 20 + 1.4/1.6 reportés audit/2026-mai). §1 réécrit pour cycle AQPC ; ancien §1 Cat-B déclassé en §1bis archive. Dette explicite documentée : « Direction du risque » UI, « Seuils d'alerte critiques » doc, ~10 références JS au mot « risque » dans commentaires, `_headers` à retirer post-validation deploy. Démarche externe à engager par Grégoire : demande d'avis PRP du Cégep de Drummondville (Loi 25, délai 2-6 semaines). | Cycle AQPC (Claude autonome) |
| 2026-05-22 (matin, post-AQPC, préparation Sprint A) | Mise à jour du relai post-clôture cycle AQPC. Grégoire demande un cycle dédié aux axes Rouge 2 (Santé du code) et 3 (Architecture SSOT) de l'audit annuel. Plan séquencé en 3 sprints A → B → C présenté et validé : Sprint A (1-2 h, MAJ DATA-OWNERSHIP.md + addendum 02-summary delta Cat-B/AQPC, 0 risque applicatif) — priorité immédiate. Sprint B (3-4 h, cartographies 3.1/3.2/3.3) — post-AQPC. Sprint C (5-8 h, Tier 6.5 `modalitesEvaluation` 14 écrivains/47 sites) — été 2026. §3 réécrit pour donner consigne Sprint A complète (11 étapes, livrables explicites, conventions pas-de-code-applicatif). Ancien §3 Cat-B déclassé en §3bis archive (consigne tronquée — référence aux versions précédentes du fichier via `git log`). Header mis à jour : prochaine priorité = Sprint A. Aucun bump version (juste un commit doc + refresh build). | Préparation Sprint A (Claude autonome) |
