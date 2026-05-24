<!-- =====================================================================
     IDENTIFICATION DE CE FICHIER  (mis à jour 24 mai 2026 fin de
     journée, post-livraison Phase B + Phase C + chasse au bug
     auto-save race condition. Beta 99.64 b0524-1640 — même beta toute
     la journée, bump de build seulement entre chantiers.)
     Ce SESSION.md vit sur la branche `main` du worktree principal et
     sert de relai entre les sessions Claude. Il décrit l'état
     post-livraison Phase B/C + fix critique race-condition autosave,
     prêt pour la REPRISE DE L'AUDIT ANNUEL (priorité explicite de
     Grégoire pour la prochaine session).
     L'historique complet (refonte pratique active 24 mai matin, chrome
     unifié 24 mai matin, #282 P1-P4 du 23 mai, cycle AQPC clos 22 mai,
     Cat-B clos 21 mai) reste dans les §§ suivants comme référence.
     ===================================================================== -->

> **📌 Identification**
> - **Chemin canonique** : `SESSION.md` (racine du repo, branche `main`)
> - **Cycle qui vient d'être livré** : **Phase B + Phase C + fix race-condition autosave** — refonte du PDF rétroaction Note finale (Phase B), section Note finale du profil étudiant alignée sur le PDF (Phase C), placeholder « 500 » trompeur retiré, et fix critique d'une race condition d'auto-save qui causait la perte silencieuse de `donneesAlgorithmiques` (nombre de mots/erreurs) entre les évaluations. Beta 99.64 b0524-1640, HEAD `b46185f`.
> - **Cycle suivant** : **REPRISE DE L'AUDIT ANNUEL** sur la branche `audit/2026-mai`. Convergence post-AQPC à planifier. Voir §3 pour la consigne complète.
> - **Documents de référence du cycle livré** : `plans de travail/PLAN-refonte-note-finale-portfolio.md` + mémoires `feedback-autosave-race-condition` + `project-autosaves-a-auditer`.

# SESSION — État au 24 mai 2026 fin de journée (Phase B + C livrées + bug auto-save critique fixé)

**Beta / build** : 99.64 / 0524-1640 (10 bumps de build sur la journée, beta conservée).
**Branche `main`** : HEAD à `b46185f` fix(eval): suspendre auto-save pendant le chargement d'une évaluation (race condition).
  - **Commits du 24 mai PM (10)** : `f4cbea7` Phase B → `aa9f26d` polish PDF → `2da9d9f` Phase C hybride → `41f77cb` titre dynamique + lien réglages → `678770d` calcul détaillé → `6e31fce` ligne compacte critère algo → `28e9d45` non-remis=0 en mode finale → `a633763` retrait placeholder « 500 » → `2259889` fix race-condition `donneesAlgorithmiques` → `b46185f` flag suspension auto-save générique.
**Tests** : 85 Vitest + 18 Playwright = 103/103 verts à chaque commit. Hook pré-push vert.

**Cycle suivant immédiat** : **Reprise de l'audit annuel** sur la branche `audit/2026-mai`. Cette branche est divergée de `main` depuis le 12 mai et accumule du retard. Grégoire a explicitement demandé de la finaliser. Voir §3 pour le détail. Note : aucune action de cleanup nécessaire (tous commits directs sur main, pas de worktree à retirer ; les modifications doc-mémoire sont locales et non versionnées).

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

### Garde-fous #282 P1-P4 (livrés 23 mai PM, à préserver pendant l'étape 5 migration finale)

- ❌ **Ne pas retirer le bandeau `#v2-bandeauModeEdition`** dans `index.html` (formulaire cours) ni le badge `#v2-bandeauCodeCours`. Texte canonique : « Mode modification — Cours <code>. Pour créer un nouveau cours, clique + Nouveau cours. » (sans emoji — cf. [[feedback-zero-emoji-strict]]).
- ❌ **Ne pas retirer ou réordonner les appels à `_afficherBandeauEdition()` / `_cacherBandeauEdition()`** dans les 6 entry points de `trimestre-v2-cours.js` (nouveau, changer si !coursId/si cours, modifier, dupliquer, annuler, supprimer). Toute nouvelle voie d'ouverture du formulaire doit appeler l'un ou l'autre.
- ❌ **Ne pas remettre l'auto-activation `if (cours.actif)` dans `_persisterCoursV2`**. Seul le PREMIER cours créé s'auto-active désormais (et seulement si la liste passe de 0 à 1 entrée). Idem pour `sauvegarderGroupeCoursV2` : seul le PREMIER GC s'auto-active. Toute activation ultérieure passe par les boutons explicites `activerCoursV2` / `activerGroupeCoursV2` (ou `activerGroupeCoursDepuisBibliotheque`).
- ❌ **Ne pas retirer le flag `actif: true` lors de la création du premier cours / GC** : il est posé conditionnellement dans `_persisterCoursV2` / `sauvegarderGroupeCoursV2` pour maintenir l'invariant single-active (`cours.find(c => c.actif)` reste un reader valide).
- ❌ **Ne pas retirer les boutons `#v2-btnActiverCours` et `#v2-btnActiverGroupeCours`** d'index.html ni leurs helpers `_mettreAJourBoutonActiverCours(coursId)` / `_mettreAJourBoutonActiverGroupeCours(gcId)`. La visibilité est dynamique : caché si déjà actif, visible sinon.
- ❌ **Ne pas modifier `_tupleCoursNaturel(c)` ni `_migrerListeCoursVersCoursV2()`** dans `trimestre-v2-cours.js` (P3) sans bien comprendre l'invariant V2-wins-sur-tuple-naturel. La migration s'exécute au chargement de `chargerDropdownCoursV2` (idempotent : la clé `listeCours` est vidée après).
- ⚠️ **La migration finale étape 5 (#282) reste à faire** : ~93 sites lisant `db.getSync('listeCours', ...)` dans `js/cours.js` + `contexte.js` + `cc-license.js` + `pratiques.js` + `travaux-ui.js` + `demo-activation.js` + `migrations.js` + `statistiques.js` + `rapport-bug.js` + `organisateur.js` + `export-pdf.js` + `reserve.js`. Cf. consigne §3.

### Garde-fous résiduels post-Phase 2

- ❌ **`navigation.js:250-251`** appelle encore `initialiserModuleTrimestre` via `if (typeof X === 'function')` — Zone protégée CLAUDE.md, guard intact (devient simplement faux, pas de régression boot). Ne pas toucher sans validation Grégoire.
- ❌ **`coursEnEdition` (config.js L199)** est désormais orphelin (plus aucun caller après chantier 2.1). Zone protégée → laissé en place. À retirer dans un chantier dédié config.js si Grégoire autorise.
- ⚠️ **Tests manuels UI obligatoires** côté zone Réglages (Cours / Groupe / Trimestre) — la suite Vitest ne couvre pas ces flows ; un appel `window[nomFonction]()` dynamique pourrait avoir été manqué par l'audit statique.

### Garde-fous Phase B/C + race-condition autosave (livrés 24 mai PM, commits `f4cbea7` → `b46185f`)

- ❌ **Ne pas réintroduire le pattern fallback `||` pour les objets snapshot d'auto-save**. En JS, `{}` et `[]` sont TRUTHY donc `snapshot.X || target.X || {}` retourne TOUJOURS le snapshot, même vide → écrasement silencieux de données déjà persistées. Bug réel observé le 24 mai sur `donneesAlgorithmiques` (les nombres de mots des évaluations a2025 disparaissaient après quelques aller-retours). Toujours utiliser `if (snapshot.X && Object.keys(snapshot.X).length > 0)`. Cf. [[feedback-autosave-race-condition]].
- ❌ **Ne pas retirer le flag `window._autoSaveSuspendu`** ni la fonction `_suspendreAutoSaveTemporairement()` dans `evaluation-chargement.js`. Suspendre l'auto-save pendant 500 ms est essentiel pour éviter qu'un snapshot pris pendant la cascade de chargement (`reset partiel sync` puis `restauration async via setTimeout + dispatchEvent`) ne capture un état tronqué/vide. Les 3 entry points à protéger sont : `chargerEvaluationsEtudiant`, `demarrerEvaluationDepuisFichier`, `verifierEtChargerEvaluationExistante`. Si tu ajoutes une 4e entry point de chargement, ajoute-y aussi l'appel.
- ❌ **Ne pas réintroduire le placeholder `"500"` dans le champ « Nombre de mots »** (`evaluation-chargement.js` lignes ~857/892/1037). Trompeur : Grégoire pensait que c'était une vraie valeur saisie et ne tapait pas le bon nombre → calcul algorithmique jamais déclenché → PDF rétroaction sans rétroaction du critère Français écrit + note finale fausse. Le placeholder « 0 » du champ « Nombre d'erreurs » est conservé (auto-propagé depuis les tampons, donc pas trompeur).
- ❌ **Ne pas modifier la sémantique « obligatoires non remises = 0 » dans `_selectionnerArtefactsHybride`** sans considérer le flag `estFinale`. Cette pénalité s'applique UNIQUEMENT quand `configuration.notesFinales === true` (mode finale). En mode provisoire, les obligatoires non remises sont IGNORÉES (ne pénalisent pas la note tant que la session continue). Le calculateur reçoit `estFinale` en paramètre depuis `calculerDetailsNoteFinale`. Cf. réglage UI « Note = 0 si production non remise » du wizard pratique.
- ❌ **Ne pas dupliquer le calcul de la note finale entre app et PDF**. Le PDF (`synthese-retroaction-rendu.js renderRangeeNote`) et l'app (`profil-etudiant-sections-affichage.js`, bloc note-finale) doivent rester structurellement identiques : 2 cartes (Sélection / Obligatoires) avec calcul détaillé `(N1 + N2 + ...) ÷ N = moyenne × P% = pts`, puis bloc résultat final encadré. Toute divergence pédagogique = bug. Source unique : `calculerDetailsNoteFinale(da)` (qui lit `obtenirConfigPratiqueActive()`).
- ⚠️ **Audit à mener** : autres auto-saves du projet (wizard pratique, formulaires cours/groupe, mind map, etc.) peuvent avoir le même bug pattern. Cf. [[project-autosaves-a-auditer]] pour la liste et la démarche.

### Garde-fous refonte pratique active (livrée 24 mai fin de matinée, commit `6f85512`)

- ❌ **Ne pas réintroduire de fallback codé en dur sur les pondérations métier** (60/40, 65/35, etc.). Principe directeur sauvegardé en mémoire : [[feedback-zero-fallback-arbitraire]]. Les valeurs viennent toujours de la configuration utilisateur. Les conséquences logiques explicites (« pas de terminale → portfolio = 100% ») restent permises.
- ❌ **Ne pas réintroduire l'heuristique titre/desc/pondération dans `_identifierProductionTerminale`** (`js/profil-etudiant-actions.js:188`). La fonction est volontairement réduite à `find(p => p.type === 'terminale')`. Une production terminale est identifiée **uniquement** par son type explicite.
- ❌ **Ne pas remettre `'modalitesEvaluation'` ni `'pratiquesConfigurables'` dans `CLES_GLOBALES`** (`js/trimestres.js`). Les deux sont namespacés par trimestre depuis Phases E et F. Migrations boot idempotentes : `migration_modalites_namespacees_done`, `migration_pratiques_namespacees_done`.
- ❌ **Ne pas écrire dans `pratiquesConfigurables` (global) ni dans `modalitesEvaluation` (global) depuis le code applicatif**. Toujours `db.setSync(cle('xxx'), ...)`. La constante `CLE_PRATIQUES_CONFIGURATIONS` dans `pratiques-gestion.js` reste pour rétrocompat de lecture, mais les écritures sont déjà migrées.
- ❌ **Ne pas écrire un id de type général** (`"pan-standards"`, `"sommative"`, etc.) dans `groupesCours[].pratiqueId` ni dans `groupeCoursActif.pratiqueId`. La source canonique = id de pratique configurable (ex. `"pan-standards-bedard"`). Migration boot `migration_pratiqueId_to_configurable_id_done` (Phase G1) effectue le remappage idempotent.
- ❌ **Ne pas lire `modalitesEvaluation.configPAN.portfolio` comme source du calcul** dans un nouveau code. La source canonique est désormais `obtenirConfigPratiqueActive()` (qui lit la bibliothèque namespacée). Le snapshot reste en stockage mais n'est plus lu par `_obtenirConfigPortfolioCalcul`. Les 30 sites legacy de `pratiques.js` + `pratique-pan-standards.js` qui lisent encore le snapshot seront migrés en G2-b.
- ❌ **Ne pas renommer l'id `pan-standards-bedard`** (la pratique PAN-Littérature A25 de Grégoire) sans coordonner avec lui. C'est l'id qu'utilise son a2025 et l'attribution est désormais correcte (Grégoire Bédard / Cégep de Drummondville). Référence : [[project-pratique-active-ssot]].
- ⚠️ **Plan détaillé** : `plans de travail/PLAN-refonte-note-finale-portfolio.md` documente les 6 bugs identifiés, les décisions architecturales, et les phases restantes. Lire avant toute reprise.

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

## §1ter — Tests manuels Section A LIVRÉS (23 mai 2026 matin + midi)

**8/9 tests Section A passés**. A.6 reporté car bloqué par bug #282 (modale Bibliothèque cours vide en V2, chantier de réparation tenté et reverté — cf. ci-dessous).

| Test | Statut | Sortie clé |
|---|---|---|
| **A.1** Boot console | ✅ | Mac console propre. 2 bugs prod logés #114 (CSP Cloudflare beacon sur app.codexnumeris.org) + #115 (`icon-files.svg` 404 dans modal « Plusieurs fichiers par étudiant »). |
| **A.2** Snapshot Codex | ✅ critère strict (pas de ReferenceError) | **Bug #116 logé Priorité Moyenne** : `capturerSnapshotManuel` a 4 facettes problématiques (phantômes inter-groupes-cours, no dedup, métrique « Dernière capture » figée hors trimestre, fallback semaine 1 silencieux). **UI ajoutée** : bandeau contextuel « Groupe-cours actif : sigle — Groupe N » sous le titre du panneau Captures de progression (index.html + snapshots.js + trimestre-v2-orchestre.js). **Backlog #280** : fusionner « Capturer maintenant » + « Reconstruire l'historique » (retour Grégoire — il fait toujours Reconstruire). |
| **A.3** Vue Calendrier | ✅ | Renommage UI : « Congés avec reprises » → « Congés institutionnels et fériés » (calendrier-vue.js:604). Layout overflow #118 logé (sous-onglet Trimestre dépasse sur 1470px). **3 régressions critiques fixées en cascade** : #117 (ReferenceError `setValue` cross-IIFE, bouton Modifier événement no-op, fix `window.setValue` dans trimestre-v2-cours.js), #119 (vue calendaire pas rafraîchie après modif trimestre, 4 handlers patchés avec `afficherCalendrierScolaire`), **#120 RÉGRESSION MAJEURE** : `genererCalendrierComplet` (190 LOC) + 5 helpers date retirés à tort par commit `6b2da4b` Phase 2 cascade legacy 95 du matin précédent. Restaurés depuis `git show 6b2da4b^`. Le module trimestre.js est passé de 38 → 270 LOC. |
| **A.4** Saisie présences | ✅ | Console propre, Sem. 16 disparue après fix #120 (la séquence des numéros de semaine respecte désormais les fériés institutionnels sans reprise). |
| **A.5** Modal Bibliothèque cours | ✅ critère strict (modal s'ouvre, pas d'erreur console) | **Bug #282 découvert** : modal vide en V2 — lit `db.get('listeCours')` (clé legacy) au lieu de `cours` (clé canonique V2 cf. trimestres.js:72). Audit révèle ~23 sites actifs lisant `listeCours` cross-codebase (scope >2-3h annoncé initialement). |
| **A.6** Dupliquer cours | ⏸ **Reporté** | Bloqué par #282 — impossible de tester depuis bibliothèque vide. |
| **A.7** Ajouter étudiant V2 | ✅ | Liste se met à jour, console propre. |
| **A.8** Modifier puis supprimer étudiant | ✅ | + **UI : renommage « Éditer » → « Modifier »** sur 6 sites visibles (dropdown étudiant trimestre-v2-etudiants.js, bouton pratique pratiques.js, bouton fichier travaux-ui.js, bouton grille grilles.js, option évaluation liste-evaluations.js, doc index.html). Préserve les commentaires de code (`// Éditer`) et les `value="editer"` (références internes stables). |
| **A.9** Modifier dates trimestre V2 | ✅ | Confirme que le fix #119 fonctionne — modifier une date Début/Fin trimestre régénère le calendrier ET rafraîchit la vue calendaire sans changer d'onglet. |

### Chantier #282 listeCours → cours — TENTÉ ET REVERTÉ (23 mai 2026 matin)

**Grégoire a explicitement choisi « refonte complète zéro-dette »** plutôt qu'un fix minimal. 6 étapes (audit + migration boot + 5 vagues de migration) exécutées en ~1h30 :

- **12 fichiers JS touchés** : cours.js (10 sites + migration boot `migrerListeCoursVersCours` + helper `_normaliserCoursVersShapeV2`), trimestres.js (5 sites + comment registre), pratiques.js (3 sites — sensible indices A-C-P), travaux-ui.js (1 site simplifié), contexte.js (2 sites), cc-license.js (1 site + accès enseignant nested), demo-activation.js (5 sites — retraits redondants), migrations.js (13 sites historiques), statistiques.js + rapport-bug.js + organisateur.js + export-pdf.js + reserve.js (1-2 sites chacun), trimestre-v2-cours.js (retrait migration lazy redondante), main.js (appel migration ajouté + réordonné AVANT `executerMigrationsBeta935`).
- **93 sites migrés** à seulement **2** restants (tous dans la fonction de migration légitime).
- **Syntaxe OK** (`node --check` vert sur tous les fichiers), **zéro erreur console** au boot.

**Problèmes graves détectés au test fonctionnel** :

1. **Migration crée des doublons silencieux** : fusion par `id` seulement, pas par tuple naturel (codeCours, session, annee). Le setup Grégoire avait 2 versions du cours 601-101 : V2 (id `h2026-601-101-MQ-00001`) + legacy migré (id générique `COURS_1779535633370_...`). Post-migration, les 2 coexistent dans `cours`.
2. **Bug pré-existant de form state cours révélé** : clic « + Nouveau cours » ne reset pas `coursEnEditionV2`. Grégoire pensait créer un cours 102 mais a édité le V2 601-101 → contenu 601-102 sur id 601-101. Désynchro id immutable / codeCours.
3. **Bug pré-existant `_persisterCoursV2` auto-active** : tout save avec `cours.actif === true` (default) écrase silencieusement `infoCours`. Confusion sur « comment activer un cours ».

**Revert** : `git checkout HEAD -- ` sur 15 fichiers JS. BACKLOG.md gardé (entrées #281 et #282 enrichies). Snippet console fourni à Grégoire pour restaurer son cours 601-101 et retirer le doublon legacy de `cours`. Recovery validé par Grégoire.

**Le backlog #282 contient le post-mortem complet avec 4 prérequis P1-P4** :
- **P1** : fixer le form state cours — clic « + Nouveau cours » DOIT reset `coursEnEditionV2 = null` (~30 min)
- **P2** : clarifier UX activation cours/groupe-cours — bouton « Activer » explicite + indicateur visuel partout (~1 h)
- **P3** : migration listeCours → cours doit fusionner par (codeCours, session, annee) + log doublons (~1 h)
- **P4** : audit data utilisateur — snippet recovery si doublons existants

**Estimation révisée** : 5-7 h (pas 2-3 h). **#282 marqué PRIORITÉ HAUTE** « À TRAITER ABSOLUMENT » dans BACKLOG.md (retour Grégoire).

### Bilan SUIVI-BUGS post-Section A

- **4 bugs Ouverts** : #114 (CSP Cloudflare prod), #115 (icon-files.svg 404), #116 (snapshots manuels 4 facettes), #118 (layout overflow Trimestre).
- **3 bugs Corrigés** (section dédiée 22 mai 2026 dans SUIVI-BUGS) : #117 (setValue cross-IIFE), #119 (vue calendaire refresh), #120 (genererCalendrierComplet restaurée).
- **Prochain ID** : #121.

### Bilan BACKLOG post-Section A

- **#280** Fusion « Capturer maintenant » + « Reconstruire l'historique » snapshots (Priorité Moyenne).
- **#281** Uniformiser style notifications — migrer le custom HTML restant dans saisie-presences.js:1357 vers `notifications.succes`.
- **#282** **⚠️ PRIORITÉ HAUTE** Refonte listeCours → cours avec prérequis P1-P4 documentés (P1-P4 désormais ✅ livrés 23 mai PM, cf. §1quater — reste étape 5 migration finale).

---

## §1quater — #282 prérequis P1-P4 + tests Section B LIVRÉS (23 mai 2026 PM)

**2 commits sur main** (post-Section A et chantier #282 reverté du matin) :

| Commit | Sujet | Build |
|---|---|---|
| `04f8d9e` | feat(cours-gc): #282 P1 bandeau modification + P2 activation explicite cours/GC | 0523-1435 |
| `9cf542e` | refactor(cours): #282 P3 migration listeCours par tuple naturel + P4 snippet recovery | 0523-1710 |

### Tests manuels Section B livrée (a11y T-A3/T-A5/T-A10)

Grégoire a validé visuellement les 17 sous-tests B.1-B.3 sur Safari Mac, modes sombre et clair, simulation iPad Web Inspector. Aucune régression. Document `Retours des testeurs/TESTS-MANUELS-PENDING-2026-05-22.md` mis à jour avec ✅ partout. Sections C, D, E, F **reportées** (décision Grégoire en session).

### #282 P1 — Bandeau « Mode modification » (cours)

- `index.html` : bandeau `.alerte-information` ajouté dans `#cours-formulaire-edition`, texte « Mode modification — Cours <code>. Pour créer un nouveau cours, clique + Nouveau cours. » (sans emoji — cf. nouvelle [[feedback-zero-emoji-strict]]).
- `js/trimestre-v2-cours.js` : helpers `_afficherBandeauEdition(codeCours)` + `_cacherBandeauEdition()`, wire dans 6 entry points (nouveau, changer si !coursId, changer si cours, modifier, dupliquer, annuler, supprimer).

### #282 P2 — Activation explicite cours + groupe-cours

**Cours (`trimestre-v2-cours.js`)** :
- `_persisterCoursV2` : retrait de la condition `|| cours.actif` (l'ancien déclencheur auto-activation). Auto-active uniquement le **PREMIER cours créé** (`tousLesCours.length === 1` après push). Re-sync `infoCours` si modification du cours actuellement actif (pour conserver champs codeCours/nom synchronisés).
- `_construireObjetCoursV2` : retrait du flag `actif: true` hardcodé (géré conditionnellement dans `_persister`).
- `activerCoursV2()` (nouvelle) : handler bouton « Activer ce cours » avec invariant single-active (forEach pour marquer les autres `c.actif = false`) + `setSync infoCours` + notifications.succes.
- `_mettreAJourBoutonActiverCours(coursId)` : helper visibilité bouton (visible si pas déjà actif, caché sinon).
- Suffixe « (actif) » dans le `<option>` du dropdown V2 cours.
- Badge « Cours actif » (vert, classe `.apercu-badge-actif`) dans `afficherSyntheseCours` (sidebar aperçu).
- `index.html` : bouton `#v2-btnActiverCours` dans `.actions-formulaire`.

**Groupe-cours (`trimestre-v2-groupes-cours.js`)** : symétrique des cours
- `sauvegarderGroupeCoursV2` : auto-active uniquement le PREMIER GC créé (groupesCours.length === 0 avant push).
- `activerGroupeCoursV2()` + `_mettreAJourBoutonActiverGroupeCours(gcId)`.
- `activerGroupeCoursDepuisBibliotheque` : sync bouton formulaire si le GC activé est en cours d'édition.
- Badge « Groupe-cours actif » dans `mettreAJourCarteResumeGroupeCoursV2` (carte résumé).
- `index.html` : bouton `#v2-btnActiverGroupeCours`.

**CSS** : nouvelle classe `.apercu-badge-actif` dans `styles.css` (vert succès via tokens `--alerte-{fond,bordure,texte}-succes`).

### #282 P3 — Migration listeCours → cours, fusion par tuple naturel

`_migrerListeCoursVersCoursV2()` extrait de l'inline (anciennement L40-47 de `chargerDropdownCoursV2`) :
- Fusion par tuple `(codeCours, sessionAnnee)` au lieu de `id` seul → détecte les doublons cross-storage (cas : un cours présent à la fois dans `listeCours` legacy avec id générique `COURS_177...` ET dans `cours` V2 avec id `h2026-XXX-MQ-00001`, anciennement non détecté).
- `_tupleCoursNaturel(c)` : helper pur exportable, retourne `code|sessionAnnee` (ex. `"601-101-MQ|H2026"`) ou code seul si session/annee manquantes (tuple dégradé legacy minimal).
- **V2 wins** : les entrées legacy dont le tuple matche V2 sont ignorées (pas écrasées).
- Audit : `console.warn` avec détails `[{tuple, legacyId, v2Id}, ...]` + `notifications.info` à l'utilisateur si N > 0 (« Migration cours : N doublon(s) ignoré(s) — V2 préservée »).
- Idempotent : clé `listeCours` vidée après migration → ré-exécutions ultérieures = no-op.

### #282 P4 — Snippet console de recovery

Snippet autonome inscrit dans `BACKLOG.md` #282 P4 (block markdown ```js). Compatible Safari console (functions traditionnelles, var, pas d'arrow, pas de const, peut être collé en une seule ligne). Logique :
1. Groupe les cours par tuple naturel.
2. Détecte les groupes de 2+ entrées.
3. Retire les entrées non-V2 (id ne matchant pas `^[ah]\d{4}`) si V2 existe pour le même tuple.
4. Re-sync `infoCours` si pointait vers une entrée retirée (redirection vers V2 équivalent).

Grégoire avait déjà nettoyé ses données ce matin via un snippet équivalent (cf. SESSION.md §1ter), donc P4 sert de référence pour le futur (autres machines, autres utilisateurs si éventuels).

### Reste pour fermer #282 — étape 5 (migration finale, ~3 h, hors scope ce commit)

Migration des **~93 sites** lisant `db.getSync('listeCours', ...)` ou `db.get('listeCours')` vers la clé canonique `cours`. Liste indicative des fichiers touchés (à valider avec un audit grep frais) :
- **js/cours.js** : 10 sites (L64, 96, 126, 207, 272, 357, 376, 401, 455, 530) — la modal Bibliothèque cours, principalement.
- **js/contexte.js** : 2 sites (L156 forEach actif + L194)
- **js/cc-license.js** : 1 site (L520 `coursActif = listeCours.find(c => c.actif)`)
- **js/pratiques.js** : 3 sites (sensibles indices A-C-P)
- **js/travaux-ui.js** : 1 site (à vérifier)
- **js/demo-activation.js** : 5 sites (retraits redondants)
- **js/migrations.js** : 13 sites historiques (peut nécessiter conservation pour idempotence des migrations passées — auditer)
- **js/statistiques.js**, **js/rapport-bug.js**, **js/organisateur.js**, **js/export-pdf.js**, **js/reserve.js** : 1-2 sites chacun
- **js/trimestre-v2-cours.js** : 1 site (la fonction de migration `_migrerListeCoursVersCoursV2` lit `listeCours` — doit RESTER pour idempotence boot)

Stratégie suggérée :
1. Faire l'audit grep complet avec `grep -rn "listeCours" js/ --include="*.js"` pour le compte réel.
2. Identifier les sites de **lecture** (à migrer vers `cours`) vs les sites **historiques de migration** (à conserver).
3. Migrer par groupes cohérents (cours.js d'abord = la valeur immédiate user, puis contexte.js + cc-license.js + le reste).
4. Tester après chaque groupe via Réglages → Cours → Bibliothèque qui doit afficher les cours.

Idéal : créer un worktree dédié `cleanup/282-migration-finale` pour ne pas polluer main si quelque chose casse en cours de route.

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

## §1quinquies — Chrome unifié LIVRÉ (24 mai 2026 matin)

**Worktree dédié** : `Monitorage_v6-chrome` (créé depuis main `f71f412` le 23 mai soir, mergé FF sur main au commit `cbdf7d7` puis prêt à supprimer).

**1 commit livré** : `cbdf7d7` feat(chrome): refonte chrome unifié (entête + nav + sous-nav responsive). 8 fichiers touchés, +676 / −321 LOC nettes.

**Tag** : `chrome-unifie-2026-05-24` poussé sur origin.

**Bump version** : 99.63 (b0523-1710) → 99.64 (b0524-0548).

### Récapitulatif des 7 étapes du PLAN_chrome_unifie_Labo_Codex.md

| Étape | Statut | Détail |
|---|---|---|
| 1. HTML entête | ✅ | Refonte L3777-3886 : Codex (gauche) / Titre+Meta (centre) / Utilitaires 5 icônes 2 clusters (droite) / Bouton ⋯ mobile. Ligne 2 : sélecteur GC seul sans label. Popover utilitaires mobile (6 items) ajouté en fin de `<header>`. HTML/JS du bouton Codex et son menu intégralement préservés. |
| 2. HTML nav + selects mobile | ✅ | Wrapper `.navigation-boutons` + `<select id="select-nav-mobile">` (7 options) + `<select id="select-sous-nav-mobile" class="u-hide">` ajoutés. data-onglet des 7 boutons inchangés. |
| 3. Refonte CSS | ✅ | styles.css : refonte L863-1229 (zone entête) + adaptation nav primaire L1364+ + media query unique L4715+. Grid 3 colonnes `1fr auto 1fr` sur `.entete-ligne1` pour centrer le titre. Bande de contexte ligne 2 avec fond `rgba(106,172,184,0.10)`. Nav primaire `position: sticky; top: 0; z-index: 100` avec gradient maritime continu (mode sombre + mode clair). `.sous-navigation.vide { display: none }` masquage carré. Breakpoint unique `@media (max-width: 1024px)` : cache utilitaires desktop / montre ⋯, cache `.navigation-boutons` / montre select natif, cache `.sous-navigation` / montre select sous-nav sticky top 60px. Mode clair : overrides pour popover, selects, bouton ⋯. T-A10 pointer:coarse adapté à `.entete-utilitaires .btn-action-header`. Audit zéro-dette : classes mortes `.entete-controles-gauche/droite`, `.entete-ligne2-droite`, `.logo-section`, `.logo-meta`, `.separateur-contexte` retirées + CSS inline dans index.html L3663-3713 retiré. 0 référence orpheline. |
| 4. Logique JS popover + selects | ✅ | Nouveau module `js/chrome-unifie.js` (~200 LOC, IIFE) : `ouvrirPopoverUtilitaires` / `fermerPopoverUtilitaires` avec auto-désattachement défensif des écouteurs si popover caché (corrige bug détecté en tests : `_gererClicGlobal` restait attaché et bloquait les clics utilitaires après une session de tests mobile). `synchroniserSelectNavMobile` (lit `window.sectionActive`) + `regenererSelectSousNav` (peuple depuis `#sous-navigation` à chaque event `sectionAffichee`). Double câblage des selects mobile : via dispatcher `data-on-change` ET via `addEventListener('change')` direct (double sécurité). Inscrit dans `index.html` après `js/main.js` (priorité 8). |
| 5. Migration icônes icons8 filled | ⏸ **REPORTÉ** | Décision Grégoire : faire les icônes plus tard, hors-scope de ce chantier. Les icônes actuelles restent en place. |
| 6. Tests fonctionnels | ✅ | Test 1 desktop (Accueil + navigation + scroll sticky + mode sombre/clair) : PASS. Test simulation Safari Responsive Design Mode iPhone Pro Max 440×956 + custom 1404×956 : PASS après fix défensif chrome-unifie.js. Tests vrai iPad / vrai iPhone : reportés post-déploiement (option A actée — Grégoire teste sur device après push prod). |
| 7. Finalisation | ✅ | Bump 99.64 (b0524-0548), changelog +2 items en tête de Beta 99 (desktop + adaptation iPad/iPhone), BACKLOG +#283 (harmonisation pages à sidebar mobile) +#284 (harmonisation titres de page), SUIVI-BUGS +#121 (bouton fantôme « Charger un codex data » Tirage au sort, pré-existant), commit + merge FF main + tag + push. |

### Bugs détectés pendant les tests et corrigés en session

- **Bug 1** : Selects mobile ne déclenchaient pas `afficherSection` au change (Responsive Mode Safari). Cause : dispatcher `data-on-change` de main.js fonctionne mais protocole d'event dans Responsive Mode possiblement différent. **Fix** : ajout d'un `addEventListener('change')` direct sur les selects dans `chrome-unifie.js` en plus du dispatcher (double sécurité).
- **Bug 2** : Tous les boutons utilitaires header (Bug, Anonym, Thème, Aide, Réglages) ne répondaient plus aux clics souris après quelques tests mobile. Cause : `_gererClicGlobal` (handler ajouté dynamiquement par `ouvrirPopoverUtilitaires`) restait attaché au document même quand le popover était caché — il interceptait silencieusement les clics et appelait `fermerPopoverUtilitaires` (no-op). **Fix** : `_gererClicGlobal` auto-détecte si le popover est caché et se détache immédiatement (garantit aucune interférence avec les clics ailleurs).

### Observations hors-scope logées au backlog (à traiter séparément)

- **BACKLOG #283** : Harmonisation responsive des pages à sidebar en mobile (Productions étudiantes, Grilles de critères, Échelles de performance, Pratiques de notation, Cartouches de rétroaction, Trimestre, etc.) — en mobile <1024px, la zone détails apparaît tronquée. Bug pré-existant (visible aussi en prod main).
- **BACKLOG #284** : Harmonisation de la structure des pages (Conception → Alignement pédagogique et Labo → Tirage au sort n'ont pas de titre h1 ni de sous-titre descriptif, contrairement aux autres pages).
- **SUIVI-BUGS #121** : Bouton fantôme « ← Charger un codex data... » en haut à droite de Labo → Tirage au sort (déplacé / illogique dans ce contexte). Visible aussi en prod, pré-existant.

### À ne pas oublier pour la prochaine session

- **Cleanup post-merge** : `git worktree remove ../Monitorage_v6-chrome` puis `git branch -d cleanup/chrome-unifie` depuis le repo principal.
- **Test sur vrai iPhone après déploiement Netlify** : si bug device-spécifique, hotfix immédiat. Si OK, on peut clôturer définitivement le chantier chrome.
- **Mémoires à créer éventuellement** : pattern « double sécurité dispatcher data-action + addEventListener direct pour les contrôles UI critiques mobile » + pattern « auto-désattachement défensif des écouteurs globaux dynamiques ».

---

## §1sexies — Refonte pratique active + namespacing LIVRÉE (24 mai 2026 fin de matinée)

**Commit unique sur main** : `6f85512` refactor(pratique-active) — 51 fichiers touchés, +700 / −337 LOC. Pas de worktree dédié, commit direct.

**Beta / build** : 99.64 / 0524-1035 (bump build seulement, beta conservée à la demande de Grégoire).

### Phases livrées (résumé)

| Phase | Effet |
|---|---|
| **A** | Type `terminale` explicite dans le formulaire production. `_identifierProductionTerminale` réduit à `find(p => p.type === 'terminale')`. Retrait des fallbacks codés en dur 60/40 dans `calculerDetailsNoteFinale`. Propagation d'un champ `erreur` au rendu profil si config incomplète. |
| **E** | `modalitesEvaluation` déplacée de `CLES_GLOBALES` vers `CLES_NAMESPACEES`. Boot migration `migration_modalites_namespacees_done` (copie global → namespacé). 175 sites migrés. |
| **F** | `pratiquesConfigurables` namespacée pareillement. Boot migration `migration_pratiques_namespacees_done`. 69 sites migrés. Chaque trimestre a sa propre bibliothèque locale. |
| **G1** | Boot migration `migration_pratiqueId_to_configurable_id_done` : remappe les `groupesCours[].pratiqueId` qui contenaient un type général (ex. `"pan-standards"`) vers le premier id configurable du même type dans la bibliothèque locale du trimestre. Idem pour `groupeCoursActif.pratiqueId`. |
| **G2-a** | `_obtenirConfigPortfolioCalcul` lit uniquement la bibliothèque via `obtenirConfigPratiqueActive()`. Plus de fallback sur le snapshot `modalitesEvaluation.configPAN.portfolio`. Si la bibliothèque retourne null, erreur explicite affichée dans le profil. |
| **Wizard fix** | La constante `CLE_PRATIQUES_CONFIGURATIONS = 'pratiquesConfigurables'` dans `pratiques-gestion.js` (67 sites du fichier) écrivait à la clé globale, masquant Phase F. Sites migrés vers `cle('pratiquesConfigurables')`. **C'est ce fix qui a finalement permis à l'édition wizard de se propager au calculateur.** |

### Métadonnées de pratique corrigées (snippet console)

La pratique « PAN-Littérature A25 » avait l'auteur Bruno V. / Cégep Laurendeau (résidu de cloning). Re-attribuée à **Grégoire Bédard / Cégep de Drummondville**. Id renommé `pan-standards-bruno` → `pan-standards-bedard` dans toutes les références (pratiquesConfigurables, groupesCours, modalitesEvaluation, groupeCoursActif).

### Validation arithmétique

- a2025 Bermudez Ambriz, mode « N meilleurs avec N=4 » : **73,5%** (Léa transmis 73,2% en décembre, écart 0,3% = bruit d'arrondi).
- a2025 Bermudez Ambriz, mode « tous, 4 retenus » : 65,9% (vérifié).
- a2025 Bermudez Ambriz, mode « tous, 8 retenus » : 64,2% (vérifié — Formuler 5 HOC compté à 0%).
- Wizard édite → bibliothèque namespacée → calcul → rendu : **chaîne validée bout en bout**.

### Plan détaillé

`plans de travail/PLAN-refonte-note-finale-portfolio.md` — documente les 6 bugs identifiés au début, les décisions architecturales (5 sources de vérité partielles consolidées en 1 canonique au niveau groupe-cours), les phases livrées et restantes.

### Mémoires Claude créées

- `feedback-zero-fallback-arbitraire.md` — principe directeur (aucune valeur métier codée en dur).
- `project-pratique-active-ssot.md` — architecture SSOT de la pratique active (groupesCours[].pratiqueId, bibliothèque namespacée).

### Phases restantes (pour la session suivante)

- **Phase B** — Refonte section Note finale du PDF rétroaction (besoin pédagogique original de la session : `synthese-retroaction-data.js` + `synthese-retroaction-rendu.js`). Décisions actées : toggle manuel Provisoire/Finale dans l'app, pondération par bloc seulement (pas par artefact individuel). Cf. PLAN §3.B.
- **Phase C** — UI profil : cacher le bloc Évaluation terminale quand `terminal.present === false` (`profil-etudiant-sections-affichage.js:2728-2779`).
- **Phase D** — Retrait du champ legacy `mat-variante-calcul` dans le wizard (« Comment construis-tu la note finale ? »). Sa fonction de bascule Portfolio/Par-Objectifs doit migrer vers le sélecteur « Mode de sélection ».
- **G2-b** — Migrer 30 sites restants de `configPAN.portfolio` dans `pratiques.js` (21) + `pratique-pan-standards.js` (9) vers `obtenirConfigPratiqueActive()`. Puis boot migration pour retirer le snapshot du stockage. Pas urgent — le snapshot est neutralisé pour le calculateur principal.

---

## §1septies — Phase B + Phase C + fix race-condition autosave LIVRÉS (24 mai 2026 PM/soir)

**10 commits sur main** (chronologique du PM/soir) : `f4cbea7` → `b46185f`. Tous direct sur main (pas de worktree), tests 103/103 verts à chaque jalon. Beta inchangée 99.64, 10 bumps de build (`0524-1240` → `0524-1640`).

### Récap des chantiers livrés

| # | Commit | Beta/build | Chantier | Effet |
|---|---|---|---|---|
| 1 | `f4cbea7` | 99.64 b0524-1240 | **Phase B** | Refonte data shape `construireNoteProvisoire` (sépare `selection` vs `obligatoires`, retire fallbacks `\|\|65`/`\|\|35`) + refonte rendu `renderRangeeNote` (titre dynamique Provisoire/Finale, formule explicite, doublon éliminé). Toggle « Notes finalisées » dans le wizard pratique (case à cocher dans la carte « Informations de base ») piloté par `configuration.notesFinales`. |
| 2 | `aa9f26d` | 99.64 b0524-1320 | Polish PDF | « Ta note finale de portfolio » → « Ta note finale ». Note chiffrée par artefact `(M, 78 %)`. Échéances obligatoires masquées en mode finale. Rétroaction algorithmique Français écrit lue depuis `evaluation.donneesAlgorithmiques[id].retroaction` (fallback pour critère algo). Bloc résultat algo coloré dans l'app via `_appliquerStyleResultatAlgo` (bande verticale + fond tinté selon `obtenirCouleurNiveau`). |
| 3 | `2da9d9f` | 99.64 b0524-1340 | **Phase C** | Section Note finale du profil étudiant : 3 cas distingués selon `terminal.present` et `estHybride`. En mode hybride sans terminale (cas h2026) : carte gauche = Sélection, carte droite = Obligatoires (retenus + non remis). Pondérations lues depuis `obtenirConfigCategories()`. La carte « Évaluation terminale × 0% » fantôme disparaît. |
| 4 | `41f77cb` | 99.64 b0524-1420 | Titre dynamique + lien réglages | Titre « Note finale de session » ou « Note provisoire de session » selon `configuration.notesFinales` (plus de contradiction « finale (provisoire) »). `calculerDetailsNoteFinale` expose `estFinale` + `pratiqueId`. Bouton « Réglages de la pratique » à droite du titre → `ouvrirReglagesPratique(id)` enchaîne `afficherSection('conception')` + `afficherSousSection('conception-pratiques-notation')` + `chargerPratiquePourModif`. Format lignes aligné sur PDF : `Artefact N (M 75.0%) : Activité`. |
| 5 | `678770d` | 99.64 b0524-1450 | Calcul détaillé + rendu PDF = app | Sous chaque liste (app + PDF) : `(75% + 75% + 75% + 73%) ÷ 4 = 74.5% × 65% = 48.4 pts`. PDF refondu : bloc résultat final EN BAS (était en haut) avec grand chiffre `71.6%` encadré, identique au pattern de l'app. Mention italique « Note provisoire — peut changer… » uniquement en mode provisoire. Titres enrichis : « Sélection (les 4 meilleures sur 8 évaluées) (65%) ». Helper `calculCategorie(items, ponderation, comptenonRemisCommeZero)`. |
| 6 | `6e31fce` | 99.64 b0524-1505 | Ligne compacte critère algo PDF | Pour critères algorithmiques (Français écrit) : « 15 erreurs sur 584 mots → 7.16/20 (35.8 %) » au-dessus du commentaire texte. Data shape ajoute `critere.algo = {erreurs, mots, noteCalculee, pourcentage, ponderation}`. |
| 7 | `28e9d45` | 99.64 b0524-1515 | Non-remis = 0 en mode finale UNIQUEMENT | `_selectionnerArtefactsHybride` reçoit `estFinale` en paramètre. Dénominateur de la moyenne obligatoires : pool total si mode finale (non-remises = 0), sinon nb d'obligatoires évaluées seulement. `calculerDetailsNoteFinale` calcule `estFinale` tôt (avant l'appel au sélecteur). En cours de session (provisoire), les obligatoires non remises restent IGNORÉES. |
| 8 | `a633763` | 99.64 b0524-1605 | Placeholder « 500 » trompeur | 3 occurrences de `placeholder="500"` retirées des champs `eval_mots_*` dans `evaluation-chargement.js`. Grégoire pensait que c'était une vraie valeur saisie → ne tapait pas le nombre → calcul jamais déclenché → PDF vide. Maintenant le champ apparaît vide tant que rien n'est saisi explicitement. |
| 9 | `2259889` | 99.64 b0524-1630 | **Fix race-condition `donneesAlgorithmiques`** | Bug grave : `mots` (et autres valeurs algo) disparaissaient silencieusement après plusieurs allers-retours entre élèves. Cause : `_majEvaluationExistanteAutoSave` faisait `ec.donneesAlgo \|\| evalExistante.donneesAlgo \|\| {}` → en JS `{}` est truthy → snapshot vide écrasait la DB. Fix : test explicite `if (ec.donneesAlgo && Object.keys(ec.donneesAlgo).length > 0)`. |
| 10 | `b46185f` | 99.64 b0524-1640 | **Flag suspension auto-save générique** | Même bug pattern pouvait affecter `criteres` (5 niveaux → 2 tronqués) et autres valeurs. Solution : flag `window._autoSaveSuspendu` activé 500 ms via `_suspendreAutoSaveTemporairement()` au début de chaque entry point de chargement (3 sites : `chargerEvaluationsEtudiant`, `demarrerEvaluationDepuisFichier`, `verifierEtChargerEvaluationExistante`). `_debouncerAutoSave` ignore tant que le flag est actif. Couvre toutes les valeurs sans protection individuelle. |

### Découvertes pédagogiques

- **Le PDF et l'app doivent être structurellement identiques pour la Note finale** : Grégoire ne tolère aucune divergence entre la vue prof (app) et la vue élève (PDF). Même format, mêmes calculs visibles, mêmes données lues depuis les réglages.
- **Le mode finale est un toggle explicite, pas une inférence** : c'est l'enseignant qui décide quand passer en « finalisé ». Tant que le flag `configuration.notesFinales` est `false`, on est en provisoire et les obligatoires non remises ne pénalisent PAS.
- **Le placeholder gris ressemble trop à une vraie valeur saisie** : leçon UX. Pour les champs où la valeur a un impact métier critique (calcul de note), ne PAS mettre de placeholder numérique. Préférer une étiquette texte ou pas de placeholder du tout.
- **Le bug race-condition autosave est probablement répandu** : Grégoire l'a observé d'abord dans evaluation, mais le pattern (reset partiel synchrone + restauration async via dispatchEvent) existe aussi dans `pratiques-gestion.js sauvegarderConfigPratiqueMat`, `trimestre-v2-cours.js`, `productions.js`, etc. Cf. [[project-autosaves-a-auditer]] pour la liste à investiguer.

### Mémoires créées le 24 mai PM

- **`feedback-autosave-race-condition`** : pattern bug + fix défensif (flag + Object.keys check). Indispensable pour les futures sessions qui touchent un auto-save.
- **`project-autosaves-a-auditer`** : liste des auto-saves du projet à auditer + démarche. Référence Grégoire « il y a d'autres cas comme ça, par exemple le radio note chiffrée / niveau de performance ».

### Récupération des données perdues

Les évaluations a2025 qui ont eu leur `donneesAlgorithmiques` écrasé à `{}` ne peuvent pas être restaurées automatiquement. Pour chacune : rouvrir l'évaluation, re-saisir le nombre de mots (les erreurs auto-propagées via les tampons reviennent seules). Action manuelle ponctuelle pour Grégoire avant la remise des notes a2025.

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

> **Priorité 1 — REPRISE DE L'AUDIT ANNUEL**. Grégoire l'a explicitement demandé en fin de session du 24 mai : « il faudra reprendre l'implémentation de l'audit annuel si on veut que ça finisse un jour ». La branche `audit/2026-mai` est divergée de `main` depuis le 12 mai et accumule du retard. Tous les chantiers récents (Cat-B, AQPC, refonte pratique active, Phases B+C, fix race-condition) ont été livrés sur `main` SANS toucher à `audit/2026-mai`. Il faut maintenant **converger ou retravailler ce qui reste en suspens**.
>
> **Priorité 2 — Audit des autres auto-saves** (cf. [[project-autosaves-a-auditer]]). Le bug pattern race-condition du 24 mai PM est probablement répandu (wizard pratique, mind map, etc.). Grégoire a explicitement signalé le radio « note chiffrée / niveau de performance » comme premier suspect.
>
> **Priorité 3 — Phases restantes refonte pratique active** : Phase D (retrait legacy `mat-variante-calcul`) + G2-b (30 sites `configPAN.portfolio`). Pas urgent (le calculateur principal est déjà neutralisé), juste du ménage zéro-dette.

### Étapes de démarrage immédiat

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
git status                                              # main attendu propre
git log --oneline main -3                               # HEAD attendu : `b46185f` fix(eval): suspendre auto-save…
git fetch origin
git branch -a | grep audit                              # vérifier audit/2026-mai

# Voir où en est la branche audit/2026-mai par rapport à main
git log --oneline main..origin/audit/2026-mai          # commits sur audit absents de main
git log --oneline origin/audit/2026-mai..main          # commits sur main absents d'audit (gros liste)
git diff --stat main origin/audit/2026-mai             # ampleur de la divergence

# Vérifier que les tests sont toujours verts (smoke test sur main)
cd tests && npm test
```

### Avant toute écriture de code

1. **Charger les skills** : `Skills pour Claude Code/SKILL_labo_codex.md` (architecture générale).
2. **Charger les mémoires** (essentielles pour cette session) :
   - [[feedback-autosave-race-condition]] — pour comprendre le pattern bug fixé le 24 mai PM (à éviter ailleurs)
   - [[project-autosaves-a-auditer]] — liste des autres auto-saves suspects
   - [[feedback-zero-fallback-arbitraire]] — principe directeur métier
   - [[project-pratique-active-ssot]] — architecture pratique active (post-refonte 24 mai matin)
3. **Lire le SESSION.md complet** (ce fichier) pour comprendre le contexte récent. Le §1septies décrit ce qui vient juste d'être livré (10 commits du 24 mai PM).
4. **Pour l'audit annuel** : consulter les fichiers de la branche `audit/2026-mai` (`audit/PLAN-AQPC.md`, `audit/PLAN-COURT-TERME.md`, `audit/PLAN-MOYEN-TERME.md`, `audit/04-sustainability/`, `audit/reports/`, `docs/adr/`). Ces fichiers ne sont PAS sur main — il faut soit checker la branche, soit consulter via `git show origin/audit/2026-mai:audit/PLAN-AQPC.md`.

### Priorité 1 — Reprise de l'audit annuel

**Contexte** : La branche `audit/2026-mai` héberge l'audit annuel de la plateforme. Elle a été créée et travaillée jusqu'au 12 mai 2026, puis mise en pause pour livrer Cat-B, AQPC, refonte pratique active, et les fixes urgents a2025. Elle accumule donc du retard structurel par rapport à main.

**Première action recommandée** : faire un diagnostic clair de l'écart.

```bash
# Voir tous les commits de main absents d'audit
git log --oneline origin/audit/2026-mai..main | wc -l  # combien ?

# Voir les fichiers les plus divergents
git diff --stat main origin/audit/2026-mai | sort -k3 -n -r | head -20
```

**Questions à poser à Grégoire au début de la session** :
1. **Stratégie de convergence** : Veux-tu (a) merger main → audit (rebase audit sur main, garde le contenu audit), (b) merger audit → main (porte les ajouts audit), (c) cherry-pick sélectif des modifs audit pertinentes, (d) abandonner la branche et refaire l'audit directement sur main, OU (e) autre approche ?
2. **Périmètre de l'audit qui reste à faire** : quelles sections de l'audit sont incomplètes/à reprendre ? (À déterminer après lecture des PLAN-* sur la branche audit)
3. **Délai cible** : l'audit a-t-il un deadline (présentation AQPC du 3 juin déjà passé) ou peut-il s'étaler ?

**Risques attendus** :
- **Conflits de merge importants** vu le nombre de commits accumulés sur main depuis le 12 mai (Cat-B Tracks 1-4, AQPC complet, refonte pratique active, Phases B+C, chrome unifié, etc.).
- **Certaines décisions audit peuvent être obsolètes** (audit signalait des problèmes qui ont depuis été fixés sur main, ex: T-A8 `aria-live` notifications résolu par `utils-notifications.js` consolidé le 21 mai).
- **Certains fixes audit doivent être portés sur main** (ex: Phase 1.4 CC BY-SA → CC BY-NC-SA et Phase 1.6 lien docs/adr/ du PLAN-COURT-TERME, qui n'ont jamais été livrés sur main car les fichiers cibles `audit/04-sustainability/`, `audit/package.json`, `docs/adr/` vivent uniquement sur la branche audit).

### Priorité 2 — Audit des autres auto-saves

Cf. [[project-autosaves-a-auditer]] pour la liste détaillée et la démarche.

**Sites à inspecter en priorité** :
1. **Radio « Note chiffrée / Niveau de performance »** dans le wizard pratique (signalé explicitement par Grégoire). Lu via `pratique.affichageNote` ou `pratique.configuration.affichageNote`. Grégoire dit « c'est supposé être lu dans les réglages, mais souvent ce n'est pas le cas » — symptôme probable du même bug.
2. **`pratiques-gestion.js sauvegarderConfigPratiqueMat`** : auto-save sur chaque input du wizard pratique.
3. **`trimestre-v2-cours.js`** : formulaires cours/groupe-cours.
4. Autres : `productions.js`, `grilles.js`, `cartouches.js`, `objectifs.js`, `planification-carte.js`, `Rythme.sauvegarderPreferences`.

**Pattern à chercher** : tout site qui fait `target.X = ec.X || target.X || {}` ou `[]` (truthy en JS). Remplacer par `if (ec.X && Object.keys(ec.X).length > 0) target.X = ec.X`.

**Fix générique applicable** : étendre le flag `window._autoSaveSuspendu` (créé dans `evaluation-chargement.js`) à un module utilitaire global, et l'appeler depuis tous les flux de chargement qui ont un reset partiel + restauration async.

### Priorité 3 — Phases restantes refonte pratique active

**Phase D** — Retrait du champ legacy `mat-variante-calcul` du wizard pratique (« Comment construis-tu la note finale ? »).
- Fichiers : `index.html:5798-5814` (bloc `mat-variante-pan-standards`) + `js/pratiques-gestion.js:961-997` (`changerVariantePANStandardsMat`) + tous les readers de `configuration.varianteCalcul`.
- Question ouverte : la bascule Portfolio / Par-Objectifs que pilotait ce champ — où la migrer ? Probablement ajouter une option `par-objectifs` au sélecteur « Mode de sélection » (`mat-portfolio-selection`). À décider avec Grégoire au début de Phase D.

**G2-b** — Ménage des 30 sites `configPAN.portfolio` legacy.
- `js/pratiques.js` (21) + `js/pratiques/pratique-pan-standards.js` (9). Migrer vers `obtenirConfigPratiqueActive()`. Puis boot migration pour retirer la propriété `configPAN.portfolio` de chaque `${trim}_modalitesEvaluation`.
- Pas urgent (le calculateur principal est déjà neutralisé par Phase G2-a). Toucher pour cohérence et zéro-dette.

### Zones protégées — rappel permanent

- `js/config.js` · `js/navigation.js` · `noms_stables.json` — NE PAS MODIFIER sans autorisation explicite.

### Conventions

- **Pas de bump beta sans demander** Grégoire (cf. §0). Beta 99.64 conservée tant que non bumpée.
- **Hook pré-push vert** obligatoire (Défense J — 85 Vitest verts au minimum). Les commits du 24 mai PM ont tous passé le hook (103/103 tests verts).
- **Worktree dédié** recommandé pour tout chantier > 1 h. La session du 24 mai PM a livré 10 commits directement sur main (chaque commit était petit et autonome, tests verts à chaque jalon).
- **Test simulation Safari Responsive Design Mode** insuffisant pour valider mobile : toujours valider sur vrai device.
- **Charger la cache** : pour les nouveaux fichiers JS ou modifications, faire `Cmd+Q` complet de Safari puis ré-ouverture. Le cache buster `?v=` est inopérant en `file://`.

### Décisions de Grégoire pendantes (rappel pour ne pas oublier)

- **Audit annuel** — priorité 1 cette session (cf. ci-dessus).
- **Audit des autres auto-saves** — priorité 2 (cf. [[project-autosaves-a-auditer]]).
- **Phase D + G2-b** — priorité 3 (zéro-dette, pas urgent).
- **Récupération données a2025** — Grégoire doit re-saisir manuellement le nombre de mots dans les évaluations a2025 dont `donneesAlgorithmiques` a été écrasé. One-shot, post-fix b46185f.
- **Cleanup worktree chrome unifié** (legacy 24 mai matin) — encore à faire si pas déjà fait : `git worktree remove ../Monitorage_v6-chrome` puis `git branch -d cleanup/chrome-unifie`.
- **Test vrai iPhone chrome unifié** — après déploiement Netlify (orthogonal).
- **#282 étape 5** — migration `listeCours` finale (~3 h, plan dans §1quater du 23 mai). Indépendant.
- Label `v2-seuil-fragile` — conservation / atténuation / alignement ? (Cat-B Track 4 chantier J reliquat).
- Demande d'avis PRP Cégep de Drummondville (Loi 25) — à envoyer (délai réponse 2-6 semaines, conditionne PRIVACY.md v1.1).
- Tests manuels Sections **C, D, E, F reportées** (cf. doc TESTS-MANUELS-PENDING) — à reprendre si Grégoire le souhaite.
- **Migration globale des icônes vers icons8** — chantier séparé à planifier.

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
| 2026-05-24 (fin de journée, Phase B + C + race-condition autosave LIVRÉS) | Réécriture complète de l'en-tête + ajout §1septies + ajout sous-section garde-fous §0 (race-condition autosave + Phase B/C) + réécriture §3 (consigne démarrage prochaine session = REPRISE AUDIT ANNUEL). 10 commits livrés sur main entre 12h40 et 16h40 : `f4cbea7` Phase B refonte PDF Note finale (data shape + rendu + toggle Notes finalisées wizard pratique), `aa9f26d` polish PDF (« Ta note finale », note chiffrée par artefact, échéances obligatoires masquées en mode finale, rétroaction algo lue, bloc résultat algo coloré app), `2da9d9f` Phase C section Note finale profil (3 cas distingués, mode hybride Sélection/Obligatoires), `41f77cb` titre dynamique Provisoire/Finale + bouton « Réglages de la pratique » + format aligné PDF, `678770d` calcul détaillé par catégorie (`(N1+N2)÷N=moy×P%=pts`) + rendu PDF identique app (bloc résultat encadré en bas), `6e31fce` ligne compacte critère algo dans PDF (`15 erreurs sur 584 mots → 7.16/20 (35.8%)`), `28e9d45` obligatoires non remises = 0 EN MODE FINALE UNIQUEMENT (param `estFinale` au sélecteur hybride), `a633763` retrait placeholder « 500 » trompeur (3 occurrences eval_mots_*), `2259889` fix race-condition `donneesAlgorithmiques` perdues (`{}` truthy en JS, fix Object.keys check), `b46185f` flag `_autoSaveSuspendu` 500ms générique au début de 3 entry points de chargement éval (couvre criteres + donneesAlgo + futurs). Beta inchangée 99.64, 10 bumps build `0524-1240`→`0524-1640`. Tests 103/103 verts à chaque jalon. 2 nouvelles mémoires créées : [[feedback-autosave-race-condition]] (pattern bug + fix défensif, à éviter ailleurs) et [[project-autosaves-a-auditer]] (liste des auto-saves suspects du projet à investiguer, notamment radio « note chiffrée / niveau performance » signalé explicitement par Grégoire). §3 entièrement réécrit : priorité 1 = REPRISE AUDIT ANNUEL sur branche `audit/2026-mai` (divergée depuis 12 mai, Grégoire demande explicitement « si on veut que ça finisse un jour »), priorité 2 = audit autres auto-saves, priorité 3 = Phase D + G2-b. | Phase B/C + chasse bug autosave (Claude autonome) |
| 2026-05-24 (matin, chrome unifié LIVRÉ) | Bascule post-livraison du chantier chrome unifié (commit unique `cbdf7d7` sur main via merge FF depuis `cleanup/chrome-unifie`, tag `chrome-unifie-2026-05-24`, bump 99.63 → 99.64 b0524-0548). En-tête réécrit pour refléter livraison. §1quinquies (nouvelle) : récap 7 étapes du plan, 2 bugs détectés et corrigés en session (selects mobile câblage défensif + `_gererClicGlobal` auto-désattachement), 3 observations hors-scope logées (BACKLOG #283 harmonisation pages à sidebar mobile, #284 harmonisation titres de page, SUIVI-BUGS #121 bouton fantôme Tirage au sort). §3 entièrement réécrit : priorité 1 = cleanup worktree + test vrai iPhone post-déploiement Netlify ; priorité 2 = reprise #282 étape 5 (migration `listeCours` finale, ~3 h). Module `js/chrome-unifie.js` créé (200 LOC IIFE) : popover utilitaires + selects mobile + resynchronisation `sectionAffichee`. CSS refonte L863-1229 (grid 3 colonnes pour centrage parfait du titre, bande contexte ligne 2, nav primaire sticky avec gradient maritime continu, sous-nav vide masquée carré, breakpoint unique 1024px). Audit zéro-dette : classes mortes `.entete-controles-gauche/droite`, `.entete-ligne2-droite`, `.logo-section`, `.logo-meta`, `.separateur-contexte` retirées. 8 fichiers touchés, +676 / −321 LOC nettes. Étape 5 (migration icônes icons8 filled) reportée hors-scope par décision Grégoire. | Chrome unifié (Claude autonome) |
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
| 2026-05-22 (fin après-midi, préparation tests manuels Grégoire) | Grégoire a terminé ses dernières évaluations du trimestre et signale disponibilité pour exécuter tous les tests manuels accumulés (6.2 partie 2 + 6.3 partie 2 + test visuel Cat-B chantier E + vérifs post-fixes a11y du 22 mai PM + non-régression bug latent fixé chantier 2.3 + PLAN-COURT-TERME 7.1/7.2). Création du document maître `Retours des testeurs/TESTS-MANUELS-PENDING-2026-05-22.md` (6 sections A-F, ~5-6 h, check-list structurée par section avec cases à cocher + protocoles VoiceOver Mac + iPad Web Inspector + sélecteurs précis). En-tête §1 « Cycle suivant » réécrit : priorité unique = tests manuels (pas de chantier code). §3 entièrement réécrit : Document maître pointé + étapes de démarrage (http-server localhost 8080) + rôle Claude dans la session (accompagnement + reporting dans `audit/reports/06-2-manual.md` + `06-3-ipad.md` + `SUIVI-BUGS.md`) + 3 décisions Grégoire pendantes rappelées (label `v2-seuil-fragile`, convergence audit↔main post-AQPC, demande PRP Cégep). Aucune modif code applicatif. | Préparation tests manuels (Claude autonome) |
| 2026-05-22 (après-midi, T-A10 touch targets + bug fix doubles box-shadow LIVRÉS) | 2 commits sur branche `cleanup/a11y-t-a10-touch-targets` (mergée FF main puis supprimée). `91668ac` corrige une régression introduite par le cherry-pick T-A5 du même jour (`eff9950` avait ajouté `box-shadow: var(--focus-ring)` au début de 7 blocs `:focus` qui avaient déjà un `box-shadow` plus loin → le 2e écrasait le focus-ring) — fusion en `box-shadow: var(--focus-ring), <original>` sur 7 sélecteurs (`.controle-form`, `.cc-meta-ligne input/select`, `.cc-meta-textarea`, `.btn-codex-header`, `.wizard-v2-champ input/textarea/select`, `.travaux-retro-modal .travaux-retro-textarea`, `.travaux-retro-nom-input`). `22914ac` traite T-A10 touch targets Apple HIG / WCAG 2.5.5 : `.btn-codex-header` min-height 36→44px (cas signalé Lighthouse `boundingRect` 44×36) + section `@media (pointer: coarse)` ajoutée en fin de styles.css garantissant `.btn` + `.btn-action-header` min-height 44px et `.btn-icon-header` 32→44 sur tactile (préserve densité desktop). T-A10 délégué initialement ds-update passe 3 mais ds-update n'avait pas de commit dédié — fix appliqué directement sur main avec approche systématique. Sous-audit 6.3 T-A10 passe À-vérifier → Vert côté outils statiques. Validation iPad par Grégoire (tests manuels 6.3 partie 2) nécessaire pour confirmation empirique sur ~237 éléments interactifs. Tests 85/85 Vitest verts. Pas de bump beta. | T-A10 + bug fix régression (Claude autonome) |
| 2026-05-22 (après-midi, portage a11y T-A3 + T-A5 depuis ds-update LIVRÉ) | 3 commits cherry-pickés depuis `ds-update/2026-mai` sur branche `cleanup/a11y-passe3-fixes-mineurs` (mergée FF main puis supprimée). `36a7a81` T-A3 : variables `--texte-muted` + `--gris-clair` ajustées WCAG AA ≥ 4.5:1 dans 3 modes (sombre, clair, print) — styles.css + fallback index.html. `f546215` T-A5 fondation : 4 tokens focus-ring créés dans `:root` (couleur, largeur 3px, offset 2px, composite). `eff9950` T-A5 finition : 22 sites `outline: none` désormais accompagnés d'un `box-shadow: var(--focus-ring)` restorant un focus visible clavier (WCAG 2.1 AA technique G195). Conflits cherry-pick résolus en `git rm` des 3 brouillons `ds-update/passe-2-diff/` + `ds-update/v8-drafts/` qui ne vivent pas sur main. Audit annuel sous-audit 6.1 (Phase 5.1+5.2 PLAN-COURT-TERME) passe Jaune → **Vert** côté outils statiques (T-A3 + T-A5 traités, T-A7 déjà fait Phase 5.3+5.4 AQPC, T-A1+T-A2 fixés 21 mai). Restent : tests manuels 6.2/6.3 par Grégoire + T-A10 touch targets 44px (non couvert par ds-update — chantier séparé ~3-5 h si souhaité). Pas de bump beta. Tests 85/85 Vitest verts. | Portage a11y T-A3+T-A5 (Claude autonome) |
| 2026-05-22 (après-midi, sub-cleanup tableau Réglages → Cours legacy LIVRÉ) | 1 commit `bd37072` sur branche `cleanup/tableau-reglages-cours-legacy` (mergée FF main puis supprimée). Suite directe du chantier 2.1 dont le scope avait explicitement exclu cette chaîne morte (cf. plan PLAN-PHASE2 §8). **cours.js réduit de 1215 → 669 l. (−546 LOC)**. 7 fonctions retirées + 4 exports (`afficherTableauCours`, `obtenirTousLesCoursBibliotheque` orphelin, `obtenirNomPratiqueFallback`, `afficherPratiqueEnLectureSeule`, `dupliquerCours`, `activerCours`, `supprimerCours`). 6 sections delimiters de commentaire orphelines retirées (`AFFICHAGE DU TABLEAU`, `FORMULAIRE D'AJOUT/ÉDITION` trompeur, `⭐ ACTIVATION DU COURS`, `SUPPRESSION`, `🔔 NOTIFICATIONS` vide, `📌 NOTES D'UTILISATION` ~55 l. obsolète). Cleanups annexes : `main.js` event listener `[data-sous-onglet="reglages-cours"]` (−10 l.), `config.js` ligne 274 « 08-cours.js (utilise coursEnEdition) » du JSDoc des modules dépendants. Doublon `supprimerCours` clarifié : faux doublon (cours-entite.js en IIFE isolée exposée via `window.CoursEntite.supprimer` — pas de conflit). Tests 85/85 Vitest verts. En-tête HEAD `bd37072`. §1 : nouvelle sous-section « Sub-cleanup tableau Réglages → Cours legacy LIVRÉ » remplace l'ancienne « Découvertes hors scope » avec bilan cumulé Phase 2 + sub-cleanup = **~−1677 LOC nettes** sur 4 commits. §3 : piste 1 (sub-cleanup) retirée puisque livrée ; renumérotation 2→1, 3→2, 4→3. | Sub-cleanup tableau Réglages → Cours legacy (Claude autonome) |
| 2026-05-22 (après-midi, Phase 2 cascade legacy 95 LIVRÉE) | 3 commits sur branche `cleanup/phase2-cascade-legacy-95` (mergée FF main puis supprimée) : `5ccb306` chantier 2.3 trimestre.js (−563 LOC, 601 → 38 l. ; **bug latent fixé** — exports cassés L583+L586 du commit `6b2da4b` faisaient crasher l'IIFE → `obtenirCalendrierComplet`/`obtenirInfosJour` désormais à nouveau exposés ; `main.js:467-468` retiré ; `navigation.js:250-251` préservé Zone protégée), `dd493cc` chantier 2.1 cours.js (−365 LOC, 1580 → 1215 l. ; `afficherFormCours`/`annulerFormCours`/`sauvegarderCours`/`afficherListeCoursSidebar`/`modifierCours` + 5 exports retirés ; `coursEnEdition` config.js MAJ JSDoc seulement = Zone protégée), `137411c` chantier 2.2 groupe.js (−188 LOC, 1190 → 1002 l. ; `addStudent`/`resetFiltreGroupe`/doublon `deleteStudent` ×2 + 3 exports retirés ; bouton HTML `data-action="resetFiltreGroupe"` retiré du HTML généré par `filtrerParGroupe` ; querySelectors `addStudent` simplifiés dans `modifierEtudiant`). Bilan total : 5 fichiers touchés, **−1124 LOC nettes** (+25 / −1149). Tests 85/85 Vitest verts à chaque jalon. Pas de bump beta (convention §0). §1 sous-section « Prochaine session — chantier Phase 2 (plan documenté) » remplacée par « Chantier Phase 2 cascade legacy 95 — LIVRÉ » avec tableau récap par module + section « Bug latent fixé en cascade » à inscrire SUIVI-BUGS + section « Découvertes hors scope » (tableau Réglages → Cours legacy mort = piste 1 §3). §0 garde-fous Phase 2 remplacés par 3 règles résiduelles. §3 entièrement réécrit avec 4 pistes pour la prochaine session (sub-cleanup tableau cours legacy / reprise audit annuel / prep AQPC / tests manuels Grégoire). En-tête HEAD `137411c`. | Phase 2 cascade legacy 95 (Claude autonome) |
| 2026-05-23 (après-midi, Tests Section B + #282 P1-P4 LIVRÉS) | 2 commits sur main : `04f8d9e` (#282 P1 bandeau « Mode modification » cours + P2 activation explicite cours/GC, build 0523-1435) et `9cf542e` (#282 P3 migration `_migrerListeCoursVersCoursV2()` par tuple naturel + P4 snippet recovery dans BACKLOG, build 0523-1710). Tests Section B (a11y T-A3/T-A5/T-A10) **100 % verts** validés par Grégoire sur Safari Mac modes sombre+clair + simulation iPad. Sections C, D, E, F **reportées** (décision Grégoire en session : « plus important à faire »). Chantier #282 : tous les 4 prérequis P1-P4 désormais livrés, ouvrant la voie à l'étape 5 (migration finale des ~93 sites listeCours dans cours.js/contexte.js/cc-license.js/etc., estimée ~3 h, hors scope cette session). Snippet P4 testé partiellement (copier-coller Safari foireux avec backtick markdown puis caractère invisible — pas critique car Grégoire avait déjà nettoyé ses données le matin via snippet équivalent). Tests 85/85 Vitest verts à chaque commit. Hook pré-commit Défense J : 3 warnings setSync infoCours dans `_persisterCoursV2` / `activerCoursV2` acquittés via `// security-ok`. En-tête HEAD `9cf542e`. §1quater (nouvelle) : récap complet livraison P1-P4 + stratégie étape 5. §0 garde-fous : nouvelle sous-section « Garde-fous #282 P1-P4 livrés » (7 règles). §3 entièrement réécrit pour pointer vers l'étape 5 finale + tests visuels P1+P2 en pré-requis. Mémoire MEMORY.md : nouvelle [[feedback-zero-emoji-strict]] (sélection d'option preview avec emoji ≠ demande explicite). | #282 P1-P4 + Section B (Claude autonome) |
| 2026-05-23 (fin de session, pivot vers chantier chrome unifié) | Grégoire signale que le chantier de la prochaine session sera la **refonte du chrome de l'app** (entête + nav primaire + sous-nav) responsive desktop/iPad/iPhone, et qu'il veut travailler avec le plan **`PLAN_chrome_unifie_Labo_Codex.md`** (872 lignes, rédigé par Claude Cowork le 23 mai matin avec Grégoire — finalisé, à exécuter). 7 étapes structurées : HTML entête (L3777-3886) → HTML nav + select mobile (L3978-4006) → CSS refonte breakpoint 1024px + popover + sticky → JS popover utilitaires `⋯` + synchro selects → migration ~13 icônes vers icons8 filled → tests exhaustifs Mac+iPad+iPhone+a11y → finalisation (bump + changelog). Effort estimé 4-5 h. Zones protégées préservées (config.js, navigation.js, noms_stables.json). API préservée pour ne pas casser `afficherSection()` / `afficherSousSection()`. Gain attendu : 50-70 px de chrome sur desktop, 120-140 px sur iPhone. **#282 étape 5 mis en pause**, à reprendre après le chrome unifié. §3 entièrement réécrit pour pointer vers `PLAN_chrome_unifie_Labo_Codex.md` comme document maître + tableau des 7 étapes + zones protégées rappelées + API à préserver + questions probables. Décisions Grégoire pendantes mises à jour (chrome unifié en tête, #282 étape 5 décalé). PLAN_chrome ajouté au git (anciennement untracked). Pas de bump beta (commit doc-only). | Pivot chrome unifié (Claude autonome) |
