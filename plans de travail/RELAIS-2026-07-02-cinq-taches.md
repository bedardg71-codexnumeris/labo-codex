# RELAIS — Session de juillet 2026 : cinq tâches prioritaires

> **Rédigé le 2 juillet 2026 (Cowork, avec Grégoire).** Prémisse vérifiée contre
> `SESSION.md` (bloc 29 juin), `BACKLOG.md` (en-tête 29 juin), `version.json` et
> `Retours des testeurs/SUIVI-BUGS.md` au 2 juillet. Si le rituel de début de session
> révèle un écart avec cette prémisse (item déjà livré, état différent), **l'état réel
> du dépôt prime** — consigne l'écart et ajuste (cf. incident du 28 mai, prémisse
> périmée sur le Lot A).

---

## 1. Contexte

- **État** : bêta publique **1.26.2** (build 0629-0909), déployée le 29 juin. Vitest 1187, Playwright 68/68 au dernier passage.
- **Grégoire est EN CONGÉ tout juillet, reprise en AOÛT.** Conséquences strictes :
  - **Aucune validation terrain** possible (Mac/iPad, 2 modes). Livrer = code + tests verts + sentinelles break-testées ; consigner les portes terrain dans `SESSION.md` pour août.
  - **Aucun `major`** (confirmation Grégoire requise). `patch`/`minor` selon jugement courant via `node scripts/release.mjs`.
  - **Toute décision produit/UX non tranchée = STOP** : consigner la question dans `SESSION.md` ou le BACKLOG, ne pas supposer.
  - **Ne pas toucher aux 5 worktrees à contenu** (wonderful/zen/bold-wilson/distracted/lucid) — triage prévu à la reprise, EXAMINER avant toute suppression.
- **Cap** : stabilité mi-août pour la CoP/expérimentateurs — `plans de travail/PLAN-mi-aout-2026.md`.

## 2. Rituels obligatoires (non négociables)

1. **Début de session** : dérouler `Skills pour Claude Code/SKILL_Debut_de_session.md` (audit git + tests + version + lecture `SESSION.md`/`BACKLOG.md` + comparaison avec CE relais). Lecture seule.
2. **Charger les skills pertinents** au chantier (liste dans `CLAUDE.md` §Avant de coder). Pour les tâches ci-dessous : `SKILL_labo_codex.md` toujours ; `SKILL_Securite_donnees.md` EN PRIORITÉ pour la tâche 5 (suppression de données) ; `SKILL_verification_adverse.md` avant de déclarer quoi que ce soit fini.
3. **Zéro-dette** : tout remplacement RETIRE ce qu'il remplace dans la même session. Auditer les call-sites avant de changer un défaut/flag/signature.
4. **Fin de session** : `/fin-de-session` complet, dont le **§4 break-test** (faire ROUGIR chaque sentinelle avant de lui faire confiance).
5. **Retours testeurs d'abord** : si un nouveau signalement apparaît dans `SUIVI-BUGS.md`, il passe avant cette liste.

## 3. Les cinq tâches, en ordre de priorité

### Tâche 1 — SUIVI-BUGS **#116** : « Capturer maintenant » (snapshots) — Moyenne
Seul bug testeur ouvert non-Basse. Diagnostic complet dans `SUIVI-BUGS.md` (3 facettes + recommandations), effort estimé ~2 h avec tests.
- (A) Filtrer les dates capturées par les jours où le **groupe-cours actif** a réellement cours (capture phantôme inter-groupes).
- (B) Dédoublonnage par `(coursId, dateSeance)` dans `capturerSnapshotSeance` (`snapshots.js:667`).
- (C) `obtenirNumeroSemaineActuelle()` : retourner `null` hors trimestre + early return avec message explicite (supprimer le fallback `|| 1` menteur).
- **Zéro-dette** : migrer `capturerSnapshotManuel` vers `capturerSnapshotSeance` et **retirer le wrapper LEGACY `capturerSnapshotHebdomadaire`** — auditer tous ses appelants avant retrait.
- Fichiers : `js/snapshots.js`, `js/trimestre.js` (`obtenirCalendrierComplet:26`). Sentinelle Vitest + break-test.

### Tâche 2 — SUIVI-BUGS **#145** : production sans fichier → PDF étranger — Basse mais mûre
Correctif suggéré au tracker, **à valider par audit avant pose** : `trouverFichierPourEvaluation` (`travaux-resolution.js:99`) refuse la résolution par DA seul (`if (!evaluation.productionId) return null;`).
- **Prérequis impératif** : audit de TOUS les appelants (le chemin prioritaire par `evaluation.id` l.65-92 doit rester intact).
- Supprime le PDF étranger ET le flot de warnings « AMBIGUÏTÉ (DA, ) ». Aucune corruption en jeu (chemin lecture seule, déjà vérifié par vérif adverse le 27 juin).
- Sentinelle break-testée obligatoire. Reproduction : créer une production sans fichier, l'évaluer.

### Tâche 3 — BACKLOG **#313** : double sélecteur « Production » du pipeline d'import — 🟡, TRANCHÉ
Décision Grégoire actée (29 juin) : **neutraliser l'écrasement silencieux** — le sélecteur GLOBAL ne réécrit plus un choix par-fichier divergent (préserve les corrections « Modifier ») + **info UI** clarifiant global ↔ par-fichier. Conserver le raccourci « Modifier ».
- Empreinte : `travaux-ui.js` (`associerProductionGlobale:1683`, boucle `~:2259`), `travaux-import.js`.
- Auditer les chemins d'écriture de `f.productionId` avant de poser la garde.

### Tâche 4 — BACKLOG **#344** : Calendrier scolaire, fusion des 3 cartes métriques dans la carte « Légende » — 🟢, TRANCHÉ
Décision actée (29 juin) : carte Légende fusionnée remonte EN HAUT, 2 colonnes.
- Empreinte : `calendrier-vue`/`styles.css`/`index.html` — **disjointe de #313** : la paire #313+#344 est explicitement prête pour 2 agents parallèles (cf. `SESSION.md` 29 juin). Si lancée en parallèle, vérifier les empreintes AVANT lancement.
- Travail visuel : `design-system.html` + variables CSS + **2 modes** (la validation visuelle terrain restera en porte pour août — le noter).

### Tâche 5 — BACKLOG **#361** : suppression de trimestre (remplacer le stub) — 🟢, zone sensible
`supprimerTrimestreActif` (`trimestre-v2-liste.js:344`) n'est qu'un `alert`. La logique sûre est éprouvée (snippet a2024, détail au BACKLOG) : garde anti-trimestre-ACTIF ; énumération des clés = union `db.keys()` + `localStorage` + `memoryCache` ; `db.remove` par clé ; retrait du registre `trimestres` ; nettoyage des globales.
- **UX** : suivre les balises du BACKLOG (distinction archivage/suppression, confirmation forte par ressaisie du nom, proposer un export/backup avant, message d'état, a11y + 2 modes). **Si un choix UX déborde ces balises, s'arrêter et consigner la question pour Grégoire** plutôt que trancher.
- **Sécurité/tests** : perte de données → sentinelle Vitest où la garde anti-actif doit ROUGIR si contournée, break-test, ≥ 1 test couvrant la suppression. Charger `SKILL_Securite_donnees.md` en priorité.
- La plus grosse des cinq ; ne l'entamer que si le temps le permet après 1-4.

## 4. Hors périmètre de cette session (ne pas entamer)

- **#362** grilles h2026 désappariées : chirurgie de données live, exige backup + L0 avant/après **avec Grégoire** — séance dédiée d'août (`plans de travail/RELAIS-grilles-h2026-desappariees.md`).
- **#364 T3/T4/T5** : contenu d'aide — formulations à valider par Grégoire.
- **#353** saturation localStorage : session dédiée décidée (28 juin), à froid.
- Validations terrain en attente (#310/#311/#351/#240/#347) : restent à Grégoire en août.

## 5. Clôture attendue

Pour chaque tâche livrée : tests verts (`cd tests && npm test`), sentinelle break-testée, entrée `SESSION.md` (dont les portes terrain pour août), BACKLOG/SUIVI-BUGS mis à jour selon les conventions (item coché + `✅ LIVRÉ (date, build)` ; bascule vers l'archive seulement lors d'une passe de triage). Release via `scripts/release.mjs` (`patch`/`minor` selon nature). Changelog : consolider, max 6-8 items, pas de dates.
