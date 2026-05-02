# Plan de travail — Après Phase 7 doublons

> **À lire au démarrage de la prochaine session.**
> Établi le 2 mai 2026 après livraison de Phase 7 doublons (Beta 99.32 b0502-0945, 10 commits poussés sur `main`).

---

## Contexte rapide

**Ce qui vient d'être livré** (session du 2 mai 2026 matin) :
- Phase 7 #1 — Compteur du carrousel dédupliqué par étudiant
- Phase 7 #2 — Outils console diagnostic doublons (livré la veille, 1er mai)
- Phase 7 #3 — Modale interactive « Plusieurs fichiers par étudiant » avec 2 familles + 4 tags informatifs + persistence des cas validés (clé `cas_fichiers_multiples_valides`) + 6e bouton « Livrable additionnel » dans la modale d'import

Détails techniques : `project_phase7_doublons.md` (mémoire Claude).

**État global du projet** :
- `main` à jour, beta 99.32, 8 commits Phase 7 + 2 commits docs/fix poussés
- Voie de retour Réserve : v1.5 FSAPI livrée + #254 réimport sélectif livré + #257 v2.A remapping livré (voir `project_reserve.md`)
- 5 lots `/ultrareview` audités, 4 remédiés, 2 en attente (Lot 4a jetons, Lot 3 indices)

---

## Items restants par bloc thématique

### A. Voie de retour Réserve (suite directe du chantier d'avril)

| Item | Description | Effort | Dépendance |
|---|---|---|---|
| **#257 v2.B** | Mode consultation namespace temporaire (`__archive_*`) — ouvrir un versement en lecture seule pour démo / formation / réflexion | 5-6 h | — |
| **#248** | Réserve v1.1 — fusion auto `manifeste-reserve.json` pour Safari (FSAPI Chrome/Edge le fait déjà) | 2-3 h | — |
| **#249** | Réserve v1.1 — section dédiée dans Réglages (état des versements, dates, tailles) | 3-4 h | #248 |
| **#256-bis** | Aide aux 8 autres modales (Nouveautés, Réparation, Wizard pratique, ApercuPDF, Confidentiel, Export, Import, Suppression ressource) | ~1 j | — |

### B. Écosystème données — concepts manquants (priorités 4-5 ECOSYSTEME-DONNEES.md)

| Item | Description | Effort | Dépendance |
|---|---|---|---|
| **#251** | Codex data — extraction depuis la Réserve, format JSON sans blobs (5-30 Mo) pour le Labo | 1-2 j | — |
| **#252** | Labo autonome — sortir le Labo de la section Suivi, charger des codex data en lecture seule | ~1 j | #251 |
| **#247** | Refonte Réglages > Données — alignement vocabulaire avec les 4 concepts (Codex/Réserve/Codex data/Voûte) | ~1 j | #251 + #252 |

### C. Remédiation audits ultrareview en attente

| Source | Description | Effort |
|---|---|---|
| Lot 4a | 11 findings dans `evaluation-jetons.js` (4 axes : symétrie originale↔reprise / validation / config canonique / SSOT). Plan détaillé dans `Rapports/ultrareview-lot-4a-evaluation.md` | ~4 h |
| Lot 3 | Triage manuel des 20 candidats indices (~14-16 vrais bugs attendus, ~4-6 faux positifs). Détails dans `Rapports/ultrareview-lot-3-indices.md` | 3-5 h |
| Lot 4b | Audit crashé, à relancer si autres crédits ultrareview disponibles | — |

### D. Refactos / dette technique (long terme)

| Item | Description | Effort |
|---|---|---|
| **#239** | Machine à états pour chargement évaluation (remplace 5 flags + setTimeout imbriqués par module `eval-chargement.js`) | ~1 j |
| **#207** | Intégrer `travaux-stockage.js` dans `db.js` (unifier API blob, retirer la base IndexedDB parallèle `MonitorageFichiers`) | ~1-2 j |
| Plan localStorage | Désaturation des thumbnails (plan déjà rédigé dans `plans de travail/Plan - Désaturation localStorage (analyse).md`) | ~1-2 j |

### E. Petits items hors thèmes principaux (à trier au cas par cas)

- #240-243 raffinements analytics (post-AQPC)
- #244 Codex navigateur source dans manifeste
- #233 simplifier flux Codex pour utilisateur lambda
- #239 menu Codex adapter selon navigateur
- #215, #216, #218, #219 (UX divers)

### F. Observations ouvertes (hors plan formel)

- Warnings console `[Résolution] AMBIGUÏTÉ: N fichiers pour (DA, )` — productionId vide, déclenché probablement par `genererDropdownActions` qui itère sur les évaluations. Bruit non critique.
- Pas d'UI pour annuler une validation Phase 7 (purger via console pour l'instant). À ajouter au backlog si le besoin se manifeste.
- Quota localStorage saturé sur Mac (warnings au boot).

---

## Trois options de séquencement

### Option A — Boucler l'écosystème Réserve (cohérent avec document fondateur)

**Bloc 1** (Réserve v1.1) → **Bloc 2** (codex data + Labo + Réglages refonte) → **Bloc 3** (jetons + indices) → **Bloc 4** (UX polish)

- **Estimation** : ~4-5 sessions de travail
- **Logique** : finir ce qui a été commencé, livrer l'écosystème complet (Codex / Réserve / Codex data / Voûte) avant d'attaquer la dette
- **Risque** : la dette jetons / indices traîne plus longtemps

### Option B — Dette technique d'abord (qualité code)

**Lot 4a jetons** → **Lot 3 indices** → **Bloc Réserve v1.1** → **Bloc 2 codex data**

- **Estimation** : ~4-5 sessions
- **Logique** : éliminer les bugs connus avant d'ajouter des features ; les jetons sont au cœur du flux d'évaluation
- **Risque** : remettre le travail Réserve à plus tard alors que le contexte est encore frais

### Option C — Quick wins puis features (mix par effort croissant) — **RECOMMANDÉE**

**#248 + #249** (v1.1 Réserve, ~5-6 h) → **#257 v2.B** (mode consultation) → **Lot 4a jetons** (4 h) → **#256-bis** (aide modales) → **#251 + #252** (codex data + Labo) → **#247** (Réglages refonte) → **Lot 3 indices**

- **Estimation** : ~5-6 sessions
- **Logique** : alterner gros morceaux et fixes courts pour maintenir l'élan ; #257 v2.B en deuxième position permet de boucler la voie de retour Réserve avant d'attaquer le codex data (concept nouveau, plus gros)
- **Risque** : moins linéaire à raconter, mais plus durable en pratique

---

## Pour démarrer la prochaine session

### Lecture obligatoire avant de coder

1. **(auto-memory de Claude) `project_phase7_doublons.md`** — référence technique du module Phase 7 (modale, persistence, conventions à respecter)
2. **(auto-memory de Claude) `project_reserve.md`** — référence Réserve (versement v1.5 FSAPI + réimport v1) si on attaque les items #248, #249, #257 v2.B
3. **`docs/architecture/ECOSYSTEME-DONNEES.md`** — document fondateur 4 concepts, indispensable pour #251, #252, #247
4. **`CLAUDE.md`** — règles de sécurité + zones protégées + conventions

### Conventions critiques à retenir (issues de la session du 2 mai)

- **Modales** : `classList.add('actif')` (pas 'visible'). Convention `styles.css:3499`.
- **Persistence de petites métadonnées** : `db.setSync` (PAS `db.set` qui est async sans await — `getSync` immédiat lit valeur stale).
- **Pas d'interprétation des noms de fichiers** au-delà des conventions générées par l'app elle-même. En cas de doute, demander à l'utilisateur.

### Avant chaque commit

- Demander le numéro de beta à Grégoire
- Bumper `version.json` + `js/init-inline.js` (cache buster du fichier modifié dans `index.html`)
- Stage explicite par fichier (`git add fichier1 fichier2`) — beaucoup d'untracked dans le working tree
- Cmd+Q + rouvrir Safari pour tester (cache busters `?v=` inopérants sur file://)

---

## Prochaine action

Au démarrage de la prochaine session, demander à Grégoire :
- Quelle option (A, B, C ou autre) il veut suivre
- Si C, par quel item commencer (la séquence est élastique)
- S'il veut intégrer un nouvel item découvert d'ici là (retour testeur, idée, etc.)
