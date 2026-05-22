<!-- =====================================================================
     IDENTIFICATION DE CE FICHIER  (mis à jour 22 mai 2026 après-midi,
     post-livraison Phase 2 cascade legacy 95 + sub-cleanup tableau
     Réglages → Cours legacy)
     Ce SESSION.md vit sur la branche `main` du worktree principal et sert
     de relai entre les sessions Claude. Il décrit l'état post-livraison
     du cycle AQPC + Sprint A + dettes #1-4 + cleanups (résidus risque,
     palettes COULEURS) + Phase 2 cascade legacy 95 + sub-cleanup
     tableau Réglages → Cours legacy.
     L'archive complète du cycle Cat-B post-merge (clos 21 mai, 10/10
     critères atteints) reste dans les §§ suivants comme référence
     historique.
     ===================================================================== -->

> **📌 Identification**
> - **Chemin canonique** : `SESSION.md` (racine du repo, branche `main`)
> - **Cycle en cours** : aucun — Phase 2 + sub-cleanup tableau cours livrés, prochaine session à orienter (cf. §3)
> - **Documents maîtres récents** : `audit/refactoring-prep/PLAN-PHASE2-CASCADE-LEGACY-95.md` (Phase 2, livrée)

# SESSION — État au 22 mai 2026 (post-sub-cleanup tableau Réglages → Cours legacy)

**Beta / build** : 99.62 / 0522-1115 (pas de bump — convention §0 garde-fou).
**Branche `main`** : HEAD à `22914ac` (T-A10 touch targets) post-merge FF de Phase 2 (3 commits) + sub-cleanup tableau (1 commit) + portage a11y T-A3/T-A5 (3 cherry-picks) + bug fix doubles box-shadow + T-A10 = 11 commits sur main depuis `f51aeb1` + docs/session.
**Branches retirées après merge** : `aqpc/privacy`, `cleanup/phase2-cascade-legacy-95`, `cleanup/tableau-reglages-cours-legacy`, `cleanup/a11y-passe3-fixes-mineurs`, `cleanup/a11y-t-a10-touch-targets`.

**Tests** : 85 Vitest verts à chaque commit. Playwright non re-vérifié (les fonctions retirées sont legacy Réglages non couvertes).

**Cycle suivant** : à orienter avec Grégoire. Pistes possibles (cf. §3) :
1. Reprise audit annuel sur `audit/2026-mai` (Phase 7 Synthèse globale, tests manuels Grégoire 6.2/6.3)
2. Préparation présentation AQPC du 3 juin (J−12)
3. Tests manuels Grégoire des phases 7.1/7.2 PLAN-COURT-TERME (⏳ encore ouvertes)
4. Continuer le démantèlement legacy si d'autres modules le justifient (à investiguer)

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

### Garde-fous résiduels post-Phase 2

- ❌ **`navigation.js:250-251`** appelle encore `initialiserModuleTrimestre` via `if (typeof X === 'function')` — Zone protégée CLAUDE.md, guard intact (devient simplement faux, pas de régression boot). Ne pas toucher sans validation Grégoire.
- ❌ **`coursEnEdition` (config.js L199)** est désormais orphelin (plus aucun caller après chantier 2.1). Zone protégée → laissé en place. À retirer dans un chantier dédié config.js si Grégoire autorise.
- ⚠️ **Tests manuels UI obligatoires** côté zone Réglages (Cours / Groupe / Trimestre) — la suite Vitest ne couvre pas ces flows ; un appel `window[nomFonction]()` dynamique pourrait avoir été manqué par l'audit statique.

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
| 5.1 T-A3 contraste 17 nodes | ✅ Livré 22 mai PM (cherry-pick `36a7a81` depuis ds-update — variables `--texte-muted` + `--gris-clair` WCAG AA 4.5:1) |
| 5.2 22 outline:none T-A5 | ✅ Livré 22 mai PM (cherry-pick `f546215` + `eff9950` depuis ds-update — 4 tokens focus-ring + 22 `box-shadow: var(--focus-ring)` ajoutés) + bug fix régression doubles box-shadow (`91668ac`, 7 sites fusionnés en `box-shadow: var(--focus-ring), <original>`) |
| 5.3 prefers-reduced-motion | ✅ Livré |
| 5.4 prefers-contrast: more | ✅ Livré |
| 5.5 aria-live notifications | ✅ Livré |
| 5.6 T-A10 touch targets 44 px | ✅ Livré 22 mai PM (`22914ac` — `.btn-codex-header` 36→44px + section `@media (pointer: coarse)` sur `.btn`, `.btn-action-header`, `.btn-icon-header` 32→44px) — validation iPad par Grégoire pour confirmer 6.3 partie 2 |
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

**Cleanup résidus système risque** (22 mai 2026 matin, commit `c697a29`, build 0522-0945) :
- Audit post-refactor R → N révèle 3 systèmes JS morts + 2 familles CSS mortes (zéro caller, vérifié cross-codebase). Complémentaire aux dettes #1-4 (qui ont retiré l'UI legacy + DESCRIPTIONS_SEUILS orphelin) : touche les systèmes RaI badge échelle visuelle jamais migrés.
- **A.1** `js/profil-etudiant-helpers.js` : fonction `genererBadgeRisqueProfil` (28 l.) + export `window.X` + commentaire en-tête (« Badges (pratique, risque, pattern) » → « (pratique, pattern) »)
- **A.2** `js/couleurs.js` : objet `COULEURS.risque` (10 l.) + entrée du `return Object.freeze`. Palettes `indices`, `pratiques`, `idme`, `graphiques`, `correlations` intactes.
- **A.3** `js/interpretation-config.js` : bloc `risque: {minimal/faible/modere/eleve/critique}` dans `SEUILS_PAR_DEFAUT` (9 l.). NE PAS confondre avec `directionRisque` qui reste vivant.
- **A.4** `styles.css` : 6 classes `.badge-risque-{minimal/faible/modere/eleve/tres-eleve/critique}` (30 l.)
- **A.5** `styles.css` : 8 classes `.badge-risque-analyse-*` famille 2 (50 l.)
- Sentinelle Vitest `tests/unit/refactor-profil-etudiant.test.js` MAJ (export `genererBadgeRisqueProfil` retiré de la liste verrouillée).
- Bilan : 8 fichiers touchés, **−139 LOC nettes**, 85/85 Vitest verts. UI vivante « Direction du risque » (slider + `calculerDirectionRisque`) intacte — chantier renommage R → N futur, hors scope ce cleanup.

**Cleanup palettes COULEURS sans caller** (22 mai 2026 matin, commit `128ae0c`, build 0522-1115) :
- Audit complémentaire post-COULEURS.risque révèle que 3 autres palettes du module `js/couleurs.js` sont également sans caller cross-codebase.
- Retraits : `COULEURS.pratiques` (SOM/STD/SPE/DEN), `COULEURS.idme` (E/M/D/R/I), `COULEURS.graphiques` (fond/grille/texte) — la palette `graphiques` était fonctionnellement remplacée par `STYLE_GRAPHIQUE.couleurs()` qui calcule texte/grille dynamiquement selon mode clair/sombre.
- Seules `COULEURS.indices` (correlations-longitudinales.js + graphiques-progression.js) et `COULEURS.correlations` (correlations-longitudinales.js) restent consommées.
- JSDoc d'en-tête actualisée. Bilan : −28 LOC nettes dans couleurs.js, return Object.freeze rétréci à 2 entrées. Tests 85/85 Vitest verts.

### Chantier Phase 2 cascade legacy 95 — LIVRÉ (22 mai 2026 après-midi)

**Branche dédiée** : `cleanup/phase2-cascade-legacy-95` (créée depuis `main` `f51aeb1`, 3 commits, mergée FF sur `main`, puis supprimée).

**3 commits livrés (du plus simple au plus complexe)** :

| Commit | Module | LOC retirée | Note |
|---|---|---:|---|
| `5ccb306` | `js/trimestre.js` | **−563** (601 → 38 l.) | + retrait caller `main.js:467-468`. **Bug latent fixé** : exports cassés L583+L586 introduits par commit `6b2da4b` faisaient crasher l'IIFE → ni `obtenirCalendrierComplet` ni `obtenirInfosJour` n'étaient sur window (sites `snapshots.js:398/443/690` et `calendrier-vue.js:500` plantaient silencieusement). Le retrait global restore les exports. |
| `dd493cc` | `js/cours.js` | **−365** (1580 → 1215 l.) | Retrait `afficherFormCours`, `annulerFormCours`, `sauvegarderCours`, `afficherListeCoursSidebar`, `modifierCours` + 5 exports. JSDoc `coursEnEdition` MAJ dans `config.js` (Zone protégée — commentaire only). |
| `137411c` | `js/groupe.js` | **−188** (1190 → 1002 l.) | Retrait `addStudent`, `resetFiltreGroupe`, doublon `deleteStudent` × 2 + 3 exports. Bouton HTML `data-action="resetFiltreGroupe"` retiré du HTML généré par `filtrerParGroupe`. QuerySelectors `addStudent` simplifiés dans `modifierEtudiant`. |

**Bilan total** : **5 fichiers touchés**, **−1124 LOC nettes** (+25 / −1149), tests 85/85 Vitest verts à chaque jalon.

### Bug latent fixé en cascade (à inscrire SUIVI-BUGS)

Le commit `6b2da4b` (Phase 2 legacy 95, 22 mai matin) avait retiré les définitions de `function genererCalendrierComplet()` et `function afficherStatistiquesTrimestre()` dans `trimestre.js` **mais oublié de retirer les exports L583 + L586** qui les référençaient. Conséquence vérifiée via node :

```
ReferenceError: genererCalendrierComplet is not defined
```

→ L'IIFE de trimestre.js crashait au chargement, ni `obtenirCalendrierComplet` ni `obtenirInfosJour` n'étaient en réalité sur window depuis 6 h ce matin. Sites cassés silencieusement (sans guard typeof) :
- `snapshots.js:398, 443, 690` (création de snapshots)
- `calendrier-vue.js:500` (vue calendrier)

Le retrait du module legacy entier dans le chantier 2.3 fixe gratuitement le bug. **Vérifié** : `node -e "require('./js/trimestre.js'); ..."` expose désormais bien les 2 getters.

### Sub-cleanup tableau Réglages → Cours legacy — LIVRÉ (22 mai 2026 après-midi)

**Branche dédiée** : `cleanup/tableau-reglages-cours-legacy` (créée depuis main `83687ae`, 1 commit, mergée FF puis supprimée).

**Commit livré** : `bd37072` refactor(legacy-95-cascade): sub-cleanup tableau Réglages → Cours legacy

**cours.js réduit de 1215 → 669 lignes (−546 LOC)**. Suite logique du chantier 2.1 qui avait laissé hors scope cette chaîne morte pour cohérence.

Fonctions retirées (toutes 0 caller actif après audit cascade) :
- `afficherTableauCours` (cherchait `#tableauCoursContainer` retiré Phase 1 → early return)
- `obtenirTousLesCoursBibliotheque` (orpheline — JSDoc disait « utilisée par ouvrirModalBibliothequeCours » mais cette dernière inline le filtre)
- `obtenirNomPratiqueFallback` (helper consommé uniquement par afficherTableauCours et afficherPratiqueEnLectureSeule)
- `afficherPratiqueEnLectureSeule` (0 caller validé)
- `dupliquerCours` (data-action dans HTML mort)
- `activerCours` (data-on-change dans HTML mort)
- `supprimerCours` (data-action dans HTML mort ; pas de conflit avec celui de `js/entites/cours-entite.js` en IIFE isolée)

Exports retirés : 4 (`window.{afficherTableauCours, dupliquerCours, activerCours, supprimerCours}`).

Section delimiters de commentaire orphelines retirées : `AFFICHAGE DU TABLEAU`, `FORMULAIRE D'AJOUT/ÉDITION` (delimiter trompeur — formulaire retiré chantier 2.1), `⭐ ACTIVATION DU COURS`, `SUPPRESSION`, `🔔 NOTIFICATIONS` (vide), `📌 NOTES D'UTILISATION` (~55 l. de commentaire obsolète).

Cleanups annexes : `main.js` event listener (10 l.) écoutant `[data-sous-onglet="reglages-cours"]` retiré ; `config.js` ligne « 08-cours.js (utilise coursEnEdition) » retirée du JSDoc des modules dépendants (caduque).

Préservé intact : `dupliquerCoursPourTrimestreActif` (vivante, référencée par carte HTML du modal bibliothèque), tout `ouvrirModalBibliothequeCours` et la chaîne modal bibliothèque, section delimiter `🔄 DUPLICATION` (toujours pertinente).

Le doublon `supprimerCours` documenté dans le chantier 2.1 s'est révélé être un faux doublon : `js/entites/cours-entite.js:171 supprimerCours` est en IIFE isolée et exposée uniquement via `window.CoursEntite.supprimer`, pas de conflit avec celle de `cours.js` retirée.

**Bilan cumulé Phase 2 + sub-cleanup** : trimestre.js (−563), cours.js (−365 puis −546 = −911 total), groupe.js (−188), main.js (−5 puis −10 = −15 total), config.js (commentaires seulement). **Total ~−1677 LOC nettes** (+25 / −1702) cumulé sur 4 commits.

### Fixes accessibilité a11y — T-A3 + T-A5 portés depuis ds-update (22 mai PM)

**Branche dédiée** : `cleanup/a11y-passe3-fixes-mineurs` (créée depuis main `5afd4c7`, 3 commits cherry-pickés depuis `ds-update/2026-mai`, mergée FF puis supprimée).

3 commits portés sur main :

| Commit | Trouvaille | Effet |
|---|---|---|
| `36a7a81` | T-A3 contraste 17 nodes | Variables `--texte-muted` + `--gris-clair` ajustées dans 3 modes (sombre, clair, print) pour atteindre WCAG AA 4.5:1. styles.css + fallback index.html. |
| `f546215` | T-A5 fondation | 4 tokens focus-ring créés dans `:root` (couleur, largeur 3px, offset 2px, composite). Override `--focus-ring-color` en `.mode-clair`. |
| `eff9950` | T-A5 finition | 22 sites `outline: none` désormais accompagnés d'un `box-shadow: var(--focus-ring)` qui restaure un focus visible clavier. |

**Bilan** : 4 fichiers touchés (styles.css, index.html), 85/85 Vitest verts, pas de bump beta (convention §0). Audit annuel sous-audit 6.1 passe de Jaune (T-A1+T-A2 fixés 21 mai) à **Vert** côté outils statiques (T-A3 + T-A5 traités, T-A7 déjà fait Phase 5.3/5.4 AQPC). Restent les tests manuels 6.2/6.3 (Grégoire).

3 brouillons ds-update non versionnés sur main retirés du staging des cherry-picks (`ds-update/passe-2-diff/decisions-actees-01a-palette.md` + `ds-update/v8-drafts/01a-palette-couleurs.html` + `ds-update/v8-drafts/_guide-styles.css`) — ces fichiers vivent uniquement sur `ds-update/2026-mai`.

### Fixes accessibilité a11y — T-A10 touch targets + bug fix doubles box-shadow (22 mai PM, suite)

**Branche dédiée** : `cleanup/a11y-t-a10-touch-targets` (créée depuis main `32c5b44`, 2 commits, mergée FF puis supprimée).

2 commits livrés :

| Commit | Sujet | Effet |
|---|---|---|
| `91668ac` | Fix régression doubles box-shadow | Le cherry-pick T-A5 (`eff9950`) avait inséré `box-shadow: var(--focus-ring);` au début de 7 blocs `:focus` qui avaient déjà un `box-shadow` plus loin → le 2e écrasait le focus-ring. Fusion en `box-shadow: var(--focus-ring), <original>` sur `.controle-form`, `.cc-meta-ligne input/select`, `.cc-meta-textarea`, `.btn-codex-header`, `.wizard-v2-champ input/textarea/select`, `.travaux-retro-modal .travaux-retro-textarea`, `.travaux-retro-nom-input`. |
| `22914ac` | T-A10 touch targets 44×44 px | `.btn-codex-header` min-height 36→44px (cas Lighthouse). Section `@media (pointer: coarse)` ajoutée en fin de styles.css : `.btn`, `.btn-action-header` min-height 44px ; `.btn-icon-header` 32×32 → 44×44 ; icône SVG header 18→20px pour rester proportionnelle. Préserve la densité visuelle desktop (`pointer: fine` non affecté). |

**Bilan** : 1 fichier touché (styles.css), 85/85 Vitest verts, pas de bump beta. **Sous-audit 6.3 T-A10 passe À-vérifier → Vert** côté outils statiques. Validation iPad par Grégoire (tests manuels 6.3 partie 2) nécessaire pour confirmer empiriquement sur ~237 éléments interactifs.

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


## §3 — Consigne de démarrage pour la prochaine session

> Cycle Phase 2 cascade legacy 95 + sub-cleanup tableau Réglages → Cours legacy LIVRÉS. La prochaine session doit être orientée par Grégoire. Pistes documentées ci-dessous, par ordre d'élan technique.

### Piste 1 — Reprise audit annuel sur `audit/2026-mai`

**Effort estimé** : variable. **Branche** : `audit/2026-mai` (existante).

Items restants documentés dans `audit/SESSION.md` (sujet distinct) :
- Phase 7 Synthèse globale (axes 1+5+6)
- Tests manuels 6.2 / 6.3 (Grégoire)
- 4.3 onboarding tiers
- Phases 1.4 + 1.6 PLAN-COURT-TERME reportées (CC BY-NC-SA + lien docs/adr/)

### Piste 2 — Préparation AQPC 3 juin (J−12)

- Tests visuels Grégoire chantier E (6 scénarios notifications Safari Mac + iPad Air, modes sombre + clair) — pendant
- Décision label `v2-seuil-fragile` (conservation / atténuation / alignement)
- Présentation AQPC à finaliser

### Piste 3 — Tests manuels Grégoire phases 7.1 / 7.2 PLAN-COURT-TERME

⏳ Toujours ouvertes (cf. §1 tableau).

---

### Étape 1 — Vérifier l'état du repo (commune à toutes les pistes)

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
git status                              # branche actuelle
git log --oneline main -5               # HEAD main attendu : bd37072 ou plus récent
git worktree list
```

**Si HEAD main au-delà de `22914ac`** : un autre chantier a été fait depuis. Vérifier `git log main` pour comprendre.

### Étape 2 — Worktree dédié si besoin

`audit/2026-mai` a son propre cycle de vie avec des modifs uncommitted (audits, rapports, docs sécurité). Pour un chantier code sur main, créer un worktree dédié :

```bash
git fetch origin main
git worktree add ../Monitorage_v6-<sujet> -b <branche-dédiée> main
cd ../Monitorage_v6-<sujet>
```

### Étape 3 — Lecture obligatoire (10-15 min)

Ordre strict :
1. **Ce SESSION.md** (relai courant + garde-fou §0)
2. `CLAUDE.md` racine — règles sécurité (innerHTML, handlers inline, zones protégées) et convention de bump version
3. `BACKLOG.md` — items potentiellement liés
4. Pour piste 1 : commit `dd493cc` (chantier 2.1) section « NON RETIRÉ »
5. Pour piste 2 : `audit/SESSION.md`

### Étape 4 — Charger les skills

**Obligatoire** : `Skills pour Claude Code/SKILL_labo_codex.md`.

### Étape 5 — Baseline tests + chantier

```bash
cd tests && npm run test:unit    # attendu : 85 Vitest verts
```

Puis exécuter le chantier choisi avec les conventions habituelles : commits ciblés, hook pré-push vert, pas de bump beta sans demander à Grégoire (cf. §0).

---

## §3bis — Archives des consignes de démarrage précédentes

> Anciennes consignes — déclassées car cycles clos. Sprint A (livrée 22 mai matin) + Cat-B (clos 21 mai). Conservées comme référence pour les conventions worktree, hook pré-push, etc. **Pour le détail Sprint A : voir `git log SESSION.md` ou commit `ad4d0ec`.** Pour Cat-B, voir ci-dessous.

### Archive Cat-B — Étape 1 — Vérifier l'état du repo (1-2 min, période Cat-B)

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
| 2026-05-22 (matin, cleanup résidus risque) | MAJ après livraison cleanup résidus système risque (1 commit `c697a29` sur branche `cleanup/risque-residus`, mergée FF main puis branche/worktree supprimés). Audit ciblé sur dette §1 SESSION main « ~10 réf JS risque » révèle 99 hits stricts (\brisque) sur 25 fichiers, dont 5 systèmes morts complémentaires aux dettes #1-4 livrées le matin par autre instance : A.1 fonction `genererBadgeRisqueProfil` + export, A.2 `COULEURS.risque`, A.3 `SEUILS_PAR_DEFAUT.risque` (9 niveaux échelle), A.4 6 classes CSS `.badge-risque-*`, A.5 8 classes CSS `.badge-risque-analyse-*`. Sentinelle Vitest mise à jour. Build refresh 0522-0925 → 0522-0945 (pas de bump beta). Tests 85/85 verts. Rebase nécessaire car 11 commits divergents sur origin/main (Sprint A + Phases legacy 95 + dettes #1-4) — conflits BUILD_ID uniquement, résolus en gardant 0522-0945. En-tête §1 mis à jour avec HEAD `c697a29` et chronologie 19 commits depuis `7c30d64`. Sous-section « Cleanup résidus système risque » ajoutée à §1 après « Cleanup Beta 95 legacy étendu ». UI vivante « Direction du risque » (slider + `calculerDirectionRisque`) NON touchée — chantier renommage R → N futur. | Cleanup résidus risque (Claude autonome) |
| 2026-05-22 (matin, cleanup palettes COULEURS + plan Phase 2) | 2 commits sur branche `cleanup/couleurs-phase2plan` mergée FF main. (1) Commit `128ae0c` : retrait 3 palettes mortes `COULEURS.pratiques`, `COULEURS.idme`, `COULEURS.graphiques` du module `js/couleurs.js` (audit cross-codebase confirme 0 caller — seules `indices` et `correlations` restent consommées par correlations-longitudinales.js et graphiques-progression.js). −28 LOC, JSDoc actualisée, return Object.freeze rétréci à 2 entrées. (2) Commit `9940975` : rédaction de `audit/refactoring-prep/PLAN-PHASE2-CASCADE-LEGACY-95.md` (237 lignes) couvrant le chantier successeur des Phases 1+2 legacy 95 — audit préliminaire des 3 modules cours.js/groupe.js/trimestre.js avec call-graph vérifié, ordre d'exécution recommandé (trimestre → cours → groupe), risques identifiés (navigation.js protégé pour appel `initialiserModuleTrimestre`, config.js commentaires à mettre à jour, régressions silencieuses via `window[X]` dynamique). **Découvertes audit modifiant la dette §1 SESSION main** : `ouvrirModalBibliothequeCours` est en fait VIVANTE (bouton `index.html:6815` actif) ; `trimestre.js` contient 3 fonctions vivantes à PRÉSERVER (`genererCalendrierComplet`, `obtenirCalendrierComplet`, `obtenirInfosJour`) — pas un module à retirer en bloc. Build refresh 0522-0945 → 0522-1115. Tests 85/85 verts. En-tête §1 mis à jour : HEAD `9940975`, 22 commits depuis `7c30d64`. Sous-section « Prochaine session — chantier Phase 2 cascade legacy 95 (plan documenté) » remplace l'ancienne version courte. | Cleanup palettes COULEURS + plan Phase 2 (Claude autonome) |
| 2026-05-22 (matin, relai consigne Phase 2) | Bascule du relai vers le chantier Phase 2 cascade legacy 95. En-tête principal réécrit (titre H1, identification, cycle en cours = Phase 2, document maître = PLAN-PHASE2-CASCADE-LEGACY-95.md). HEAD attendu `d1363fc`, build `0522-1115`. §0 enrichi avec sous-section « Garde-fous spécifiques Phase 2 » : 5 règles (`ouvrirModalBibliothequeCours` VIVANTE ; 3 fonctions trimestre.js à préserver ; `navigation.js:250-251` protégé — laisser guard ; doublon `deleteStudent` à clarifier ; test manuel UI obligatoire post-chantier). §3 entièrement réécrit — ancienne consigne Sprint A (livrée) supprimée (retrouvable via `git log SESSION.md`) ; nouvelle consigne pointe vers PLAN-PHASE2 comme document maître et donne 9 étapes (vérif repo, worktree dédié, lecture obligatoire, skills, tests baseline, exécution ordre PLAN-PHASE2 §3, bump version, merge FF push, cleanup + MAJ SESSION). §3bis Cat-B archive renommée « Archives des consignes de démarrage précédentes » (regroupe Sprint A déclassée + Cat-B). Aucune modif code applicatif. | Préparation relai Phase 2 (Claude autonome) |
| 2026-05-22 (après-midi, T-A10 touch targets + bug fix doubles box-shadow LIVRÉS) | 2 commits sur branche `cleanup/a11y-t-a10-touch-targets` (mergée FF main puis supprimée). `91668ac` corrige une régression introduite par le cherry-pick T-A5 du même jour (`eff9950` avait ajouté `box-shadow: var(--focus-ring)` au début de 7 blocs `:focus` qui avaient déjà un `box-shadow` plus loin → le 2e écrasait le focus-ring) — fusion en `box-shadow: var(--focus-ring), <original>` sur 7 sélecteurs (`.controle-form`, `.cc-meta-ligne input/select`, `.cc-meta-textarea`, `.btn-codex-header`, `.wizard-v2-champ input/textarea/select`, `.travaux-retro-modal .travaux-retro-textarea`, `.travaux-retro-nom-input`). `22914ac` traite T-A10 touch targets Apple HIG / WCAG 2.5.5 : `.btn-codex-header` min-height 36→44px (cas signalé Lighthouse `boundingRect` 44×36) + section `@media (pointer: coarse)` ajoutée en fin de styles.css garantissant `.btn` + `.btn-action-header` min-height 44px et `.btn-icon-header` 32→44 sur tactile (préserve densité desktop). T-A10 délégué initialement ds-update passe 3 mais ds-update n'avait pas de commit dédié — fix appliqué directement sur main avec approche systématique. Sous-audit 6.3 T-A10 passe À-vérifier → Vert côté outils statiques. Validation iPad par Grégoire (tests manuels 6.3 partie 2) nécessaire pour confirmation empirique sur ~237 éléments interactifs. Tests 85/85 Vitest verts. Pas de bump beta. | T-A10 + bug fix régression (Claude autonome) |
| 2026-05-22 (après-midi, portage a11y T-A3 + T-A5 depuis ds-update LIVRÉ) | 3 commits cherry-pickés depuis `ds-update/2026-mai` sur branche `cleanup/a11y-passe3-fixes-mineurs` (mergée FF main puis supprimée). `36a7a81` T-A3 : variables `--texte-muted` + `--gris-clair` ajustées WCAG AA ≥ 4.5:1 dans 3 modes (sombre, clair, print) — styles.css + fallback index.html. `f546215` T-A5 fondation : 4 tokens focus-ring créés dans `:root` (couleur, largeur 3px, offset 2px, composite). `eff9950` T-A5 finition : 22 sites `outline: none` désormais accompagnés d'un `box-shadow: var(--focus-ring)` restorant un focus visible clavier (WCAG 2.1 AA technique G195). Conflits cherry-pick résolus en `git rm` des 3 brouillons `ds-update/passe-2-diff/` + `ds-update/v8-drafts/` qui ne vivent pas sur main. Audit annuel sous-audit 6.1 (Phase 5.1+5.2 PLAN-COURT-TERME) passe Jaune → **Vert** côté outils statiques (T-A3 + T-A5 traités, T-A7 déjà fait Phase 5.3+5.4 AQPC, T-A1+T-A2 fixés 21 mai). Restent : tests manuels 6.2/6.3 par Grégoire + T-A10 touch targets 44px (non couvert par ds-update — chantier séparé ~3-5 h si souhaité). Pas de bump beta. Tests 85/85 Vitest verts. | Portage a11y T-A3+T-A5 (Claude autonome) |
| 2026-05-22 (après-midi, sub-cleanup tableau Réglages → Cours legacy LIVRÉ) | 1 commit `bd37072` sur branche `cleanup/tableau-reglages-cours-legacy` (mergée FF main puis supprimée). Suite directe du chantier 2.1 dont le scope avait explicitement exclu cette chaîne morte (cf. plan PLAN-PHASE2 §8). **cours.js réduit de 1215 → 669 l. (−546 LOC)**. 7 fonctions retirées + 4 exports (`afficherTableauCours`, `obtenirTousLesCoursBibliotheque` orphelin, `obtenirNomPratiqueFallback`, `afficherPratiqueEnLectureSeule`, `dupliquerCours`, `activerCours`, `supprimerCours`). 6 sections delimiters de commentaire orphelines retirées (`AFFICHAGE DU TABLEAU`, `FORMULAIRE D'AJOUT/ÉDITION` trompeur, `⭐ ACTIVATION DU COURS`, `SUPPRESSION`, `🔔 NOTIFICATIONS` vide, `📌 NOTES D'UTILISATION` ~55 l. obsolète). Cleanups annexes : `main.js` event listener `[data-sous-onglet="reglages-cours"]` (−10 l.), `config.js` ligne 274 « 08-cours.js (utilise coursEnEdition) » du JSDoc des modules dépendants. Doublon `supprimerCours` clarifié : faux doublon (cours-entite.js en IIFE isolée exposée via `window.CoursEntite.supprimer` — pas de conflit). Tests 85/85 Vitest verts. En-tête HEAD `bd37072`. §1 : nouvelle sous-section « Sub-cleanup tableau Réglages → Cours legacy LIVRÉ » remplace l'ancienne « Découvertes hors scope » avec bilan cumulé Phase 2 + sub-cleanup = **~−1677 LOC nettes** sur 4 commits. §3 : piste 1 (sub-cleanup) retirée puisque livrée ; renumérotation 2→1, 3→2, 4→3. | Sub-cleanup tableau Réglages → Cours legacy (Claude autonome) |
| 2026-05-22 (après-midi, Phase 2 cascade legacy 95 LIVRÉE) | 3 commits sur branche `cleanup/phase2-cascade-legacy-95` (mergée FF main puis supprimée) : `5ccb306` chantier 2.3 trimestre.js (−563 LOC, 601 → 38 l. ; **bug latent fixé** — exports cassés L583+L586 du commit `6b2da4b` faisaient crasher l'IIFE → `obtenirCalendrierComplet`/`obtenirInfosJour` désormais à nouveau exposés ; `main.js:467-468` retiré ; `navigation.js:250-251` préservé Zone protégée), `dd493cc` chantier 2.1 cours.js (−365 LOC, 1580 → 1215 l. ; `afficherFormCours`/`annulerFormCours`/`sauvegarderCours`/`afficherListeCoursSidebar`/`modifierCours` + 5 exports retirés ; `coursEnEdition` config.js MAJ JSDoc seulement = Zone protégée), `137411c` chantier 2.2 groupe.js (−188 LOC, 1190 → 1002 l. ; `addStudent`/`resetFiltreGroupe`/doublon `deleteStudent` ×2 + 3 exports retirés ; bouton HTML `data-action="resetFiltreGroupe"` retiré du HTML généré par `filtrerParGroupe` ; querySelectors `addStudent` simplifiés dans `modifierEtudiant`). Bilan total : 5 fichiers touchés, **−1124 LOC nettes** (+25 / −1149). Tests 85/85 Vitest verts à chaque jalon. Pas de bump beta (convention §0). §1 sous-section « Prochaine session — chantier Phase 2 (plan documenté) » remplacée par « Chantier Phase 2 cascade legacy 95 — LIVRÉ » avec tableau récap par module + section « Bug latent fixé en cascade » à inscrire SUIVI-BUGS + section « Découvertes hors scope » (tableau Réglages → Cours legacy mort = piste 1 §3). §0 garde-fous Phase 2 remplacés par 3 règles résiduelles. §3 entièrement réécrit avec 4 pistes pour la prochaine session (sub-cleanup tableau cours legacy / reprise audit annuel / prep AQPC / tests manuels Grégoire). En-tête HEAD `137411c`. | Phase 2 cascade legacy 95 (Claude autonome) |
