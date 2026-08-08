# RELAIS — Vague 2 (juillet 2026) : réconciliation puis tâches autonomes

> **Rédigé le 2 juillet 2026 (Cowork, avec Grégoire).** Ce relais succède à
> `RELAIS-2026-07-02-cinq-taches.md` (vague 1 : #116, #145, #313, #344, #361).
> **Prémisse incertaine par construction** : au moment d'écrire, le dépôt local
> montrait la branche `claude/batch-mi-aout-justesse-filets` en avance de 1 commit
> non poussé (le relais vague 1), trois verrous `.git` périmés, `BACKLOG.md`
> modifié non committé (#365), et AUCUNE trace locale du travail de la session
> vague 1 — probablement livré côté GitHub (branches/PR) sans être rapatrié.
> **L'état réel que tu constateras PRIME sur tout ce qui suit.** Consigne les
> écarts (cf. incident du 28 mai, [[premisse-vs-donnees-reelles]]).

---

## Phase 0 — Réconciliation (OBLIGATOIRE avant tout travail)

1. **Verrous git** : si `.git/index.lock`, `.git/HEAD.lock` ou `.git/objects/maintenance.lock`
   existent encore (résidus d'une session Cowork du 2 juillet, 07h50 — aucun processus git
   actif derrière), les retirer.
2. **Rapatrier** : `git fetch --all --prune`. Inventorier les branches/PR créées depuis le
   2 juillet au matin (travail de la session vague 1). Vérifier leur statut (mergées sur
   `main` ? en attente ?).
3. **Pousser le local** : le commit `96f1294c` (relais vague 1) et la modification
   `BACKLOG.md` (#365) doivent rejoindre origin. Committer `BACKLOG.md`
   (`docs(backlog): #365 namespacer le bilan réflexif par trimestre`) puis push. Résoudre
   proprement toute divergence avec origin (merge, pas de force-push).
4. **Bilan de la vague 1** : établir factuellement le sort de chacune des 5 tâches
   (#116, #145, #313, #344, #361) — livrée+mergée / livrée non mergée / non entamée.
   Sources : git log distant, PR, `SESSION.md`, `BACKLOG.md`, `SUIVI-BUGS.md` des branches.
5. **Mettre à jour les traces** : si la vague 1 a livré sans tenir `SESSION.md`/`BACKLOG.md`/
   `SUIVI-BUGS.md` à jour (conventions : item coché + `✅ LIVRÉ (date, build)`), le faire
   maintenant. Un travail non consigné est invisible pour la reprise d'août.

**Si la Phase 0 révèle que des tâches de la vague 1 ne sont PAS livrées, elles passent
en tête de la Phase 2** (dans l'ordre du relais vague 1 : testeurs d'abord).

## Phase 1 — Rituels (identiques à la vague 1, non négociables)

- `SKILL_Debut_de_session.md` (audit factuel, lecture seule) ; skills du chantier selon
  `CLAUDE.md` §Avant de coder ; `SKILL_verification_adverse.md` avant tout « fini ».
- Zéro-dette : tout remplacement retire ce qu'il remplace ; auditer les call-sites.
- `/fin-de-session` complet avec §4 break-test (faire ROUGIR chaque sentinelle).
- Contraintes juillet : **Grégoire en congé** → aucune validation terrain (consigner les
  portes pour août) ; aucun `major` ; toute décision produit/UX non tranchée = STOP et
  consigner ; **ne pas supprimer les worktrees** (examen seulement, cf. tâche 5).
- Nouveau signalement dans `SUIVI-BUGS.md` = priorité sur tout ce qui suit.

## Phase 2 — Tâches autonomes, en ordre de priorité

### Tâche 1 — BACKLOG **#359** : fix désarchivage 🔴
`desarchiverTrimestre` (`trimestres.js:664`) ne purge pas les copies namespacées
`<id>_grillesTemplates` etc. : après désarchivage, `cle()` ne les relit plus → orphelins
morts. Bug latent **confirmé au code le 26 juin** ; cadrage : 
`plans de travail/CADRAGE-briques-C-D-namespacing.md` §D-D5. Traiter comme un fix avec
break-test. Zone données → charger `SKILL_Securite_donnees.md` + `SKILL_integrite_globaux.md`.

### Tâche 2 — BACKLOG **#365** : bilan réflexif — AUDIT D'ABORD
L'item exige un **dry-run/audit avant de coder** : les clés principales
(`questionnaireBilan`, `resultatsBilan`, `parcoursBilan`, `autoreflexionBilan`,
`js/bilan-reflexif-core.js:310-313`) passent déjà par `window.cle()`. Chercher le manque
réel dans les sous-composants (rapport, import/export texte, éditeur) ou conclure qu'il
n'y en a pas. **Si l'audit ne trouve rien : consigner le résultat dans l'item et
s'arrêter** (la question retourne à Grégoire) ; coder seulement si un manque est prouvé.

### Tâche 3 — BACKLOG **#356** : anonymiser la sortie du golden master
`valider-golden-master-trimestre.mjs` affiche un nom d'élève. Petit, spécifié, posture
Loi 25. Vérifier qu'aucune autre sortie du script ne fuit de données nominatives pendant
qu'on y est.

### Tâche 4 — Lot de frictions mineures : **#355** + **#305** + SUIVI-BUGS **#121**
- **#355** : `desactiverFormulaireEvaluation` désactive `selectEtudiantEval` → navigation
  élève impossible en consultation. Réactiver la navigation sans rouvrir l'édition.
- **#305** : a11y — modale d'aide sans nom accessible (`aria-label`/`aria-labelledby` +
  vérifier le focus, cf. règles a11y de `CLAUDE.md`).
- **#121** : bouton fantôme « ← Charger un codex data... » dans Labo › Tirage au sort.
  Grep pour identifier l'origine, décider retrait ou déplacement selon la trouvaille ;
  si le doute persiste sur l'intention, consigner pour Grégoire plutôt que trancher.
Chaque fix : petit commit dédié + test quand une sentinelle a du sens.

### Tâche 5 — Inventaire des 5 worktrees (LECTURE SEULE)
`wonderful-galileo` (modifs Brique C non commitées), `zen-lichterman` (`workers:1`),
`bold-wilson` (20 commits), `distracted-swanson`, `lucid-lovelace` (1 commit chacun).
Produire `plans de travail/INVENTAIRE-worktrees-2026-07.md` : pour chacun — branche,
commits/diffs par rapport à main, contenu encore pertinent ou absorbé, recommandation
(récupérer / committer / jeter) **sans rien supprimer ni committer dans les worktrees**.
Le triage lui-même reste à Grégoire en août.

## Hors périmètre (ne pas entamer)
#362 (chirurgie données live avec Grégoire), #364 T3/T4 (formulations à valider),
#353 (session dédiée), #333 Lot 3 (validation visuelle PDF), validations terrain
(#310/#311/#351/#240/#347 + celles de la vague 1).

## Clôture attendue
Par tâche livrée : tests verts (`cd tests && npm test`), sentinelle break-testée,
`SESSION.md` (bloc daté, portes terrain pour août), BACKLOG/SUIVI-BUGS à jour, release
via `scripts/release.mjs` (`patch`/`minor` selon nature ; grouper les petits fixes de la
tâche 4 dans un seul bump). Changelog : consolider, max 6-8 items, pas de dates. En fin
de session : résumé fait / reste / risques, et **pousser** (aucun travail seulement local).
