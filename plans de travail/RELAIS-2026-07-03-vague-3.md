# RELAIS — Vague 3 (juillet 2026) : état des lieux, reliquats, puis suite

> **Rédigé début juillet 2026 (Cowork, avec Grégoire), EN AVEUGLE** : impossible de
> vérifier depuis Cowork ce que les vagues 1 et 2 ont livré (dépôt local inchangé,
> pas d'accès GitHub). Ce relais ne présume donc RIEN : la Phase 0 établit l'état
> réel, et la file de travail (Phase 2) se construit à partir de ce constat.
> Relais précédents : `RELAIS-2026-07-02-cinq-taches.md` (vague 1 : #116, #145,
> #313, #344, #361) et `RELAIS-2026-07-02-vague-2.md` (vague 2 : #359, #365-audit,
> #356, lot #355/#305/#121, inventaire worktrees).
>
> **Note de versionnement (3 juillet, session cloud)** : fichier recréé depuis le
> texte transmis en conversation — l'original du Mac n'a jamais été poussé (même
> incident que le relais vague 1, consigné au rituel de début de session).

---

## ⚠ Préalable : où tournes-tu ?

Le clone local du Mac porte des problèmes que SEULE une session locale (ou Grégoire)
peut régler : trois verrous `.git` périmés (résidus Cowork du 2 juillet, 07h50),
le commit `96f1294c` (relais vague 1) non poussé, `BACKLOG.md` (#365) et les relais
vagues 2-3 non commités.

- **Session LOCALE (sur le Mac)** : règle tout ça en Phase 0, points 1-3.
- **Session CLOUD (depuis GitHub)** : tu ne peux PAS le régler. Saute les points 1-3,
  consigne-le en tête de ton rapport final, et signale à Grégoire les commandes à
  exécuter : `rm .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`,
  puis `git add -A "plans de travail" BACKLOG.md && git commit && git push`.

## Phase 0 — État des lieux (OBLIGATOIRE, lecture d'abord)

1. **(local seulement)** Retirer les 3 verrous `.git` — aucun processus git actif derrière.
2. **(local seulement)** Committer `BACKLOG.md` (#365) + les relais non suivis, pousser
   `claude/batch-mi-aout-justesse-filets`.
3. **(local seulement)** `git fetch --all --prune`, réconcilier avec origin (merge, jamais
   de force-push).
4. **Bilan factuel des vagues 1 et 2** — pour CHAQUE tâche, statut prouvé par commit/PR/
   SESSION.md (pas par souvenir de session) :
   - Vague 1 : #116, #145, #313, #344, #361
   - Vague 2 : #359, #365 (audit), #356, #355, #305, #121, inventaire worktrees
   Produire un **tableau récapitulatif** (tâche | statut : livrée+mergée / livrée non
   mergée / entamée / non entamée | preuve) — le déposer dans le bloc SESSION.md de
   cette session. C'est le livrable minimal de la vague 3 : Grégoire doit retrouver
   cette vue en août même si rien d'autre n'est fait.
5. **Traces** : si des livraisons n'ont pas été consignées selon les conventions
   (SESSION.md bloc daté, BACKLOG item coché + `✅ LIVRÉ (date, build)`, SUIVI-BUGS),
   les consigner maintenant.

## Phase 1 — Rituels (non négociables, identiques aux vagues 1-2)

`SKILL_Debut_de_session.md` d'abord ; skills du chantier (`CLAUDE.md` §Avant de coder) ;
`SKILL_verification_adverse.md` avant tout « fini » ; zéro-dette (retirer ce qu'on
remplace, auditer les call-sites) ; `/fin-de-session` avec §4 break-test.
Contraintes juillet : Grégoire EN CONGÉ → aucune validation terrain (consigner les portes
pour août), aucun `major`, décision produit/UX non tranchée = STOP et consigner, ne pas
supprimer les worktrees. Nouveau signalement `SUIVI-BUGS.md` = priorité absolue.
En fin de session : **pousser** — aucun travail seulement local.

## Phase 2 — File de travail

### 2a. Reliquats des vagues 1-2 (PRIORITAIRES, dans cet ordre)
Toute tâche des vagues 1-2 non livrée au bilan de la Phase 0 passe ici, ordre :
1. Bugs testeurs : #116, #145, #121
2. Tranchés prêts : #313, #344
3. Fixes données/code : #359, #356, #355, #305
4. Audits : #365 (dry-run d'abord), inventaire worktrees (lecture seule)
5. #361 (suppression de trimestre — la plus grosse, balises UX du BACKLOG, STOP si
   un choix les déborde)
Les consignes détaillées restent dans les relais vagues 1 et 2 — ne pas les réinventer.

### 2b. Nouvelles tâches (seulement si 2a est vide ou épuisé)

**Tâche A — BACKLOG #328, reliquats L2-b2 puis L2-c (SSOT `modalitesEvaluation`)**
Le gros chantier autonome restant : L2-b2 = dégonfler le miroir côté affichage
(~46 sites), L2-c = jetons. Plan canonique : `plans de travail/PLAN-328-L2-degonfler-miroir.md` ;
audit : `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`. Vérifier d'abord au
code que les reliquats existent encore (le plan date du 10 juin ; des sessions ont pu
en absorber). Méthode : lots de sites avec test après chaque lot, jamais un big-bang.
Coordination #333 : l'export lit via l'API `lire()` du module propriétaire — préserver.

**Tâche B — BACKLOG #363 : audit de currency des skills/docs contre le code post-#358**
Créé le 29 juin (commit `c8887bf1`), prévu « reprise 1er août » mais entièrement
autonome et lecture seule : confronter `Skills pour Claude Code/*.md` et `docs/` à
l'état réel du code après la migration namespacée #358. Livrable : rapport d'écarts
+ corrections des passages factuellement périmés (pas de réécriture de fond).

**Tâche C — SUIVI-BUGS #118 : overflow horizontal Calendrier → Trimestre**
Diagnostic déjà posé au tracker (grid 2 colonnes + formulaire interne ; pistes
`min-width: 0` / `overflow-x: auto`). Petit fix CSS ; 2 modes ; la validation visuelle
terrain reste en porte pour août. Vérifier le non-chevauchement avec #344 (si livré,
la zone a peut-être bougé) et avec #283-T1 (empilement des mois, page voisine —
le traiter en même temps si l'empreinte CSS est commune).

**Tâche D — BACKLOG #306 : uniformisation de la page d'assemblage groupe-cours**
Plan prêt dans `plans de travail/`. Le relire d'abord : s'il exige des choix UX non
tranchés, s'arrêter au cadrage et consigner les questions pour Grégoire au lieu de coder.

## Hors périmètre (inchangé)
#362 (données live avec Grégoire), #364 T3/T4 (formulations), #353 (session dédiée),
#333 Lot 3 (validation visuelle PDF), #114 option Cloudflare (dashboard = Grégoire),
validations terrain accumulées, triage effectif des worktrees.

## Clôture attendue
Tableau de bilan des vagues (Phase 0.4) dans SESSION.md ; par tâche livrée : tests verts,
sentinelle break-testée, traces à jour, release `patch`/`minor` via `scripts/release.mjs` ;
changelog consolidé (max 6-8 items, pas de dates) ; résumé fait / reste / risques ; PUSH.
