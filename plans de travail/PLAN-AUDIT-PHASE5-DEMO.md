# Plan — Audit préalable avant Phase 5 du chantier Autonomisation

**Statut** : à exécuter avant toute reprise du retrait `donnees-demo.js`.
**Date de création** : 24 avril 2026 (après le revert de la tentative du 22 avril).
**Temps estimé** : 2-3 h d'audit + 30 min de décision architecturale + validation avec Grégoire.
**Livrable** : un document `docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md` qui autorise (ou pas) la reprise du chantier avec un plan concret.

---

## 1. Contexte — pourquoi ce plan existe

### 1.1 Le projet

Labo Codex possède depuis janvier 2026 un **mode démo** pour que les enseignant·es puissent explorer l'outil sans entrer leurs vraies données. Techniquement, cocher « Données démo » sur l'accueil déclenche `entrerEnDemo()` (fichier `js/donnees-demo.js`) qui :

- Charge un pack de données fictives (étudiants Primo Primavera, production Hugo, etc.) dans les collections globales
- Active un trimestre virtuel `id='demo'`
- Affiche un bandeau vert « Mode démonstration » en bas d'écran
- Restaure l'état précédent au décocher via snapshot

Ça fonctionne, mais c'est 1070 lignes de code qui écrivent dans les globaux (`listeCours`, `trimestres`, `grillesTemplates`, etc.), potentiellement confondues avec les vraies données si le snapshot échoue.

### 1.2 Le Plan 1 Autonomisation (PLAN-AUTONOMISATION-UTILISATEUR.md)

Cadré le 21 avril 2026, 7 phases. Intention : remplacer le mode démo legacy par un **matériel pédagogique CC** isolé dans un namespace `demo_*` parallèle, selon le modèle de l'enseignement explicite (modélisation → pratique guidée → autonomie).

**Phases 1 à 4 livrées et acquises** (commit `602bacf`) :

- **Phase 1** — Namespace `demo_*` peuplé en permanence (`js/demo-namespace.js`, `cleDemo()`).
- **Phase 2** — Sélecteurs à 2 sections (Mes documents / Démo) dans 11 dropdowns, options démo préfixées `demo-`.
- **Phase 3** — Fork + attribution `inspireDe` sur cartes biblio.
- **Phase 4.A** — Identité CC utilisateur distincte de l'enseignant métier.
- **Phase 4.B** — Formulaires démo lecture seule sur 5 formulaires (grille, échelle, cartouche, production, pratique matériel) + bouton « Dupliquer ».
- **Phase 4.C** — Interdiction des références mixtes à la sauvegarde.

**Phase 5** — retrait `donnees-demo.js` + réécriture du toggle sans chargement en bloc → **tentée et revert le 22 avril**.

### 1.3 Ce qui s'est passé le 22 avril (échec)

Dix commits enchaînés entre 12h01 et 15h41, puis revert à 18h28. Le détail est dans `docs/POST-MORTEM-PHASE5-22-AVRIL.md`. Les quatre difficultés principales :

**Difficulté 1 — Cache-busters Safari (cause racine sous-estimée)**.
Les balises `<script src="js/X.js?v=2026041701">` de `index.html` gardaient des `?v=` de février-mars. Safari iPad (et parfois Mac) servait les anciennes versions des fichiers modifiés — mes nouvelles fonctions ne s'exécutaient simplement pas. Symptôme : la checkbox se cochait visuellement mais le flag `demo-actif` n'était pas écrit en storage. Au retour à l'accueil, case décochée. Attribué à tort à un « bug iOS Safari label+change » → j'ai ajouté des listeners JS directs comme workaround (code mort). Idem pour `<select>` avec `optgroup` → workaround `input+change`. La vraie cause a été trouvée après 3 cycles seulement en bumpant massivement les `?v=` en `fa85a97`.

**Difficulté 2 — Découpage en sous-phases trop serré**.
J'ai livré 5.A, 5.B, 5.B-bis, 5.B-ter en chaîne sans laisser Grégoire valider entre chaque. Les bugs se sont empilés, difficiles à isoler. Quand Grégoire a retesté, plusieurs problèmes s'additionnaient.

**Difficulté 3 — Mauvaise compréhension de l'intention pédagogique**.
Le plan §5.2 dit : « checkbox on → affiche la section Démo dans les sélecteurs ». J'ai lu ça comme LE comportement attendu. Grégoire attendait aussi — implicitement — que l'**aperçu se peuple** automatiquement pour que la modélisation pédagogique fonctionne (§2 du plan : modèle de l'enseignement explicite). La tentative minimaliste 5.A-5.B ne faisait que cacher/montrer des optgroups — sans visualisation, pas de modélisation.

**Difficulté 4 — Le GC oublié dans Phase 4.B**.
Phase 4.B avait livré le flow lecture seule + Dupliquer pour 5 formulaires (grille, échelle, cartouche, production, pratique matériel) via leurs bibliothèques visuelles. Le groupe-cours n'a pas de bibliothèque visuelle — juste un dropdown. Les options démo y étaient `disabled=true` (convention Phase 2), donc l'utilisateur ne pouvait pas consulter la démo GC. Il a fallu livrer une Phase 4.B-bis (`7f6685d`) pendant la tentative.

**Difficulté 5 — 5.B-ter n'a pas validé de bout en bout**.
La tentative finale virtualisait le trimestre `demo` dans la liste globale + set `groupeCoursActif` et `infoCours` vers les items démo. Théoriquement, `cle('X')` routait vers `demo_X` et l'aperçu lisait depuis le namespace démo. En pratique, ça n'a pas peuplé l'aperçu. Cause probablement multiple : réconciliation au `db-ready` qui interférait, `migration-phase5` qui filtrait les items `isDemo` après coup, lectures (indices, snapshots, calendrier) qui ne trouvaient pas leurs données dans `demo_*`, ou autre effet de bord non-identifié. Jamais diagnostiqué précisément avant le revert.

### 1.4 État actuel (post-revert, 22 avril soir, build 0422-1828)

- **Main** : identique à `602bacf` (Phase 4.C) + docs post-mortem.
- **Mode démo** : fonctionne via le legacy `entrerEnDemo` / `quitterDemo`, aperçu peuplé, bandeau vert visible.
- **Phases 1-4 acquises** : namespace `demo_*` existe en parallèle (vivant), sélecteurs à 2 sections visibles, fork CC sur 5 formulaires, attribution propre.
- **Tension architecturale** : le legacy (`donnees-demo.js`, 1070 l.) et Phase 1 (`demo-namespace.js`) coexistent. Le legacy reste l'autorité pour peupler l'aperçu. `demo_*` est utilisé uniquement par les optgroups Phase 2 et le flow Dupliquer Phase 4.B.
- **Branche backup** : `backup/phase5-tentative-22avril-2026` conserve les 10 commits tentés, consultable pour référence.

---

## 2. Pourquoi un audit avant de recommencer

La tentative du 22 avril a raté parce que j'ai commencé à **coder avant de comprendre**. Les spécifications du plan §5.x semblaient suffisantes pour guider le travail — elles ne l'étaient pas. Il manquait une connaissance opérationnelle :

- Que fait exactement le legacy (toutes les écritures, tous les effets de bord) ?
- Qui lit quelles clés, selon quel trimestre actif, dans quel module ?
- Qu'est-ce qui est déjà dans `demo_*` vs ce qui manque pour servir toutes les lectures ?

Sans ces réponses, l'approche « simple toggle flag » est nécessairement incomplète. L'audit remplit ces blancs **avant** que l'on touche au code. Si l'audit révèle que le legacy fait 20 choses subtiles qu'il faudrait reproduire, on décide en connaissance de cause : soit on les reproduit proprement, soit on abandonne Phase 5.

---

## 3. Les trois audits à produire

### 3.1 Audit 1 — Reverse-engineering du legacy (45 min)

**Objectif** : connaître exhaustivement ce que le legacy fait.

**Fichiers à lire** :
- `js/donnees-demo.js` en entier (1070 l.)
- Les fonctions appelées : `changerTrimestreActif('demo')` dans `js/trimestres.js`, `genererCalendrierComplet`, `reconstruireSnapshotsHistoriques`, `initialiserSystemeModes`, `peuplerDropdownGroupeCoursActif`, `rafraichirContenuSelonMode`

**Livrable — Table 1 : Écritures de `chargerDonneesDemo`**

| Clé écrite | Namespace | Valeur | Appelé depuis |
|---|---|---|---|
| `trimestres` | global | ajout `{id:'demo', actif:true, isDemo:true}` | `chargerDonneesDemo` ligne ~480 |
| `listeCours` | global | push cours démo avec `isDemo:true` | `fusionnerDonneesDemo` ligne ~530 |
| `cours` | global | push idem | idem |
| `enseignants` | global | push `ENS_DEMO` | idem ~560 |
| `grillesTemplates` | global | push avec `estDemo:true` | idem ~620 |
| ... | ... | ... | ... |

**Livrable — Table 2 : Effets de bord de `entrerEnDemo`**

| Étape | Action | Effet observable |
|---|---|---|
| 1 | `sauvegarderEtatAvantDemo()` | snapshot `demo-etat-precedent` |
| 2 | `db.setSync('demo-actif', 'true')` | flag |
| 3 | `chargerDonneesDemo()` | écritures ci-dessus (Table 1) |
| 4 | `changerTrimestreActif('demo')` | trimestre actif + `creerGroupeCoursDemoSiNecessaire` |
| 5 | `db.setSync('infoCours', coursDemo)` | cours actif pointé |
| 6 | `db.setSync('groupeCoursActif', gcDemo)` | GC actif pointé |
| 7 | `db.setSync(cle('horaireSelectionne'), 'HOR_DEMO')` | pré-sélection sidebar |
| 8 | `db.setSync(cle('groupeSelectionne'), '0demo')` | pré-sélection sidebar |
| 9 | `genererCalendrierComplet()` | `demo_calendrierComplet` calculé |
| 10 | `reconstruireSnapshotsHistoriques()` | `demo_snapshots` + `demo_indicesCP` calculés |
| 11 | `db.setSync('modeApplication', 'normal')` | force mode (pas anonymisation) |
| 12 | `afficherBandeauDemo(true)` | bandeau vert |
| 13 | `peuplerDropdownGroupeCoursActif()` | header refresh |
| 14 | `afficherSection('apercu')` | navigation vers aperçu |
| 15 | `rafraichirContenuSelonMode()` | rerender complet |

**Livrable — Table 3 : Effets de bord de `quitterDemo`**

Symmétrique. Identifier précisément ce qui est nettoyé et ce qui est restauré.

### 3.2 Audit 2 — Cartographie des lectures (60-90 min)

**Objectif** : connaître tous les points qui dépendent du trimestre actif ou du GC actif.

**Méthode** : grep exhaustif des appels `cle(`, `obtenirDonneesSelonMode(`, `obtenirEtudiantsCoursActif(`, `obtenirTrimestreActif(`, `obtenirTrimestreId(`. Pour chaque call-site :

**Livrable — Table 4 : Lectures dépendantes du namespace trimestre**

| Module | Fonction | Clé lue | Utilisée pour | Fréquence |
|---|---|---|---|---|
| etudiants.js | `chargerOptionsFiltres` | `cle('groupeEtudiants')` | Filtres liste étudiants | Au render |
| tableau-bord-apercu.js | ligne 1058 | `obtenirDonneesSelonMode('groupeEtudiants')` | Lignes contexte aperçu | Au render |
| profil-etudiant.js | ligne 2807 | `obtenirDonneesSelonMode('groupeEtudiants')` | Navigation profil | Au click |
| ... | ... | ... | ... | ... |

**Focus particulier** sur les modules qui alimentent l'aperçu :
- `tableau-bord-apercu.js` (compteurs, barres A-C-P)
- `indices.js` (`calculerTousLesIndices`, `calculerTauxCompletion`)
- `correlations-longitudinales.js`
- `graphiques-progression.js`
- `snapshots.js` (`obtenirSnapshots`, `reconstruireSnapshotsHistoriques`)
- `evaluation.js` (lecture des évaluations)

**Livrable — Table 5 : Lectures dépendantes du GC actif**

Même chose pour `groupeCoursActif` et `infoCours`. Exemple : `obtenirPratiqueActiveGroupeCours()`, `obtenirCoursActifId()`, etc.

### 3.3 Audit 3 — Gap analysis demo_* vs legacy (30 min)

**Objectif** : savoir ce que `demo-namespace.js peuplerNamespace()` omet aujourd'hui par rapport à ce que le legacy charge.

**Méthode** : comparer deux listes en parallèle.

**Colonne A** : ce que `demo-namespace.js` écrit dans `demo_*` au 1er run :
- `demo_listeCours`, `demo_cadreCalendrier`, `demo_horaireHebdo`, `demo_groupeEtudiants`, `demo_productions`, `demo_evaluationsSauvegardees`, `demo_grillesTemplates`, `demo_echellesTemplates`, `demo_modalitesEvaluation`, `demo_presences`, `demo_trimestres`, `demo_enseignants`, `demo_horaires`, `demo_groupesCours`

**Colonne B** : ce que le legacy charge (extrait de l'Audit 1 Table 1).

**Livrable — Table 6 : Gap analysis**

| Clé (demo_X) | Peuplée par Phase 1 ? | Peuplée par legacy ? | Utilisée par lectures (Audit 2) ? | Décision |
|---|---|---|---|---|
| `demo_planification_mindmap` | Non | Oui (via `CARTE_DEMO_ALIGNEMENT`) | Oui (module planification) | À ajouter dans `peuplerNamespace` |
| `demo_calendrierComplet` | Non | Calculé après activation via `genererCalendrierComplet` | Oui | À calculer à l'activation, pas au peuplement |
| `demo_snapshots_GC_DEMO` | Non | Calculé après activation via `reconstruireSnapshotsHistoriques` | Oui (aperçu) | Idem |
| `demo_indicesCP` | Non | Calculé | Oui (aperçu) | Idem |
| `cartouches_GRILLE_DEMO` | Non | Legacy l'écrit dans global `cartouches_*` | Oui | À décider : `demo_cartouches_*` ou maintenir global |

---

## 4. Décision architecturale (30 min, après les 3 audits)

Avec les 6 tables en main, choisir entre trois options :

### Option A — Activation complète via pointeurs (approche 5.B-ter améliorée)

Cocher « Données démo » :
1. Snapshot des 3 pointeurs (`trimestreActif`, `groupeCoursActif`, `infoCours`)
2. Virtualiser le trimestre `demo` dans `trimestres` global
3. Pointer `groupeCoursActif` = gcDemo, `infoCours` = coursDemo
4. **Nouveau par rapport à 5.B-ter** : déclencher les effets de bord identifiés dans la Table 2 (étapes 9-10-11-13-15 surtout) pour que calendrier, snapshots, indices soient recalculés à partir de `demo_*`

Décocher : symétrique.

**Risque** : reproduire 15 étapes proprement est un travail substantiel. Il faut aussi que `demo_*` soit assez complet pour alimenter `genererCalendrierComplet`, `reconstruireSnapshotsHistoriques`, etc. Les gaps de Table 6 devront être comblés.

### Option B — Redirection dans `cle()` et `obtenirDonneesSelonMode()`

Modifier `cle()` (trimestres.js:211) : si `demo-actif === 'true'`, retourner `demo_X` au lieu de `<trimestre>_X`. Pareil pour `obtenirDonneesSelonMode()` et `obtenirTrimestreActif()` (retourner un objet virtuel si démo actif).

**Avantage** : pas d'écriture dans les globaux (plus propre que Option A). Toutes les lectures sont redirigées automatiquement.

**Risque** : modifier `cle()` est intrusif. Beaucoup de modules supposent une structure stable. Il faut s'assurer que les effets de bord (calendrier, snapshots) fonctionnent aussi avec cette redirection.

### Option C — Abandonner Phase 5

Garder le legacy comme source de vérité. Documenter que le mode démo = chargement en bloc dans les globaux avec snapshot/restore. Accepter les 1070 lignes de `donnees-demo.js`. Marquer Phase 5 comme « abandonné, acceptable en l'état ».

**Avantage** : zéro risque, zéro dette nouvelle, mode démo fonctionnel.

**Inconvénient** : la dette legacy reste (1070 l. de code, snapshot fragile, écritures dans globaux). Violation du principe zéro-dette, mais consciente.

### Critère de décision

Basé sur les 6 tables :

- Si **Table 6 montre peu de gaps** (2-3 clés manquantes, effets de bord reproductibles) → Option A ou B
- Si **Table 6 montre beaucoup de gaps** (données calculées à la volée, dépendances complexes) → Option C

À trancher avec Grégoire après présentation des tables.

---

## 5. Après la décision : parcours utilisateur + tests d'acceptation

Si décision = A ou B, avant de coder :

### 5.1 Parcours utilisateur formalisé

Écrire clic par clic ce qui doit se passer :

> 1. Utilisateur arrive sur l'accueil, case « Données démo » décochée
> 2. Clic sur la case → case cochée, bannière bienvenue disparaît si présente
> 3. Utilisateur clique sur « Avoir un aperçu » → aperçu affiche les barres A-C-P peuplées avec les étudiants démo (Primo Primavera, Hugo, etc.)
> 4. Utilisateur va dans Contexte → voit le GC démo actif avec Primo Primavera comme enseignant
> 5. Utilisateur va dans Suivi → voit les séances démo
> 6. Utilisateur clique Décocher → retour à l'état précédent (aperçu vide si pas de vrai GC, sinon données réelles)

Valider avec Grégoire que ce parcours sert la modélisation pédagogique.

### 5.2 Tests d'acceptation (checklist manuelle)

Étendre les 10 critères §7 du plan :

- [ ] C1 — Case cochée au démarrage reste cochée après reload (déjà dans plan)
- [ ] C2-C10 — ...
- [ ] **Nouveau C11** — Case cochée → aperçu peuplé avec données démo (barres A-C-P, indices, compteurs)
- [ ] **Nouveau C12** — Case cochée → section Planification montre la carte démo
- [ ] **Nouveau C13** — Case décochée → aucune donnée démo visible anywhere
- [ ] **Nouveau C14** — Toggle ON/OFF/ON n'écrit jamais dans les globaux (verify via snapshot storage avant/après)
- [ ] **Nouveau C15** — Deux utilisateurs distincts (trimestres réels H2026 + démo) n'interfèrent pas

Chaque critère = test manuel à cocher sur iPad + Mac à chaque sous-phase.

---

## 6. Implémentation (si on y va)

Une fois audit + décision + tests d'acceptation écrits :

### Règles opérationnelles (tirées du post-mortem)

1. **Cache-busters `?v=` dans LE MÊME commit** que chaque modif `.js`. Pas d'exception. Lister les fichiers modifiés, grep leurs `?v=`, bumper.
2. **Une sous-phase à la fois**, test terrain iPad+Mac entre chaque. Attendre validation Grégoire avant de pousser la suite.
3. **Tester iPad dès la 1re sous-phase**, pas seulement Mac.
4. **Valider chaque critère d'acceptation** à la fin de chaque sous-phase concernée.
5. **En cas de symptôme étrange iPad** (case ne persiste pas, handler non déclenché), premier réflexe : vérifier cache-busters + `window.<fonction>.toString().indexOf('<marqueur_nouveau>')` en console.

### Découpage proposé (à affiner selon audit)

- **5.1** — Combler les gaps de Table 6 (ajouter données manquantes dans `peuplerNamespace`)
- **5.2** — Implémenter l'activation (selon Option A ou B)
- **5.3** — Reproduire les effets de bord nécessaires (calendrier, snapshots)
- **5.4** — Retrait progressif du legacy (`donnees-demo.js` seulement après que tout marche)
- **5.5** — Migration silencieuse pour les utilisateurs avec résidus legacy

Chaque sous-phase = 1-2 commits max, validation entre chaque.

---

## 7. Ce que vous devez avoir pour démarrer la session audit

### 7.1 Fichiers à lire en priorité (dans cet ordre)

1. Ce fichier (`plans de travail/PLAN-AUDIT-PHASE5-DEMO.md`)
2. `SESSION.md` (état actuel)
3. `docs/POST-MORTEM-PHASE5-22-AVRIL.md` (le détail de l'échec)
4. `plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md` (le plan Phases 1-7 + section Leçons)
5. `memory/feedback_cache_busters.md` (règle n°1 des `?v=`)
6. `memory/project_autonomisation_utilisateur.md` (contexte projet Plan 1)

### 7.2 Branche backup disponible

Pour consulter le code tenté sans le charger sur main :
```
git log backup/phase5-tentative-22avril-2026 --oneline
git show 253ce0d:js/accueil.js    # voir l'activerModeDemo qui n'a pas fonctionné
git show 7c8cc8e:js/migration-phase5.js    # voir la migration silencieuse
```

### 7.3 Consigne de démarrage

À coller au début de la prochaine session si on attaque l'audit :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Objectif : exécuter le plan d'audit Phase 5 avant de tenter le retrait
legacy. Document directeur : plans de travail/PLAN-AUDIT-PHASE5-DEMO.md.
Tentative précédente reverted le 22 avril — ne pas recommencer à coder
avant que les 6 tables (Audit 1+2+3) soient produites dans
docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md.

Lis dans l'ordre :
1. plans de travail/PLAN-AUDIT-PHASE5-DEMO.md (ce plan, ordre des
   audits + critères de décision)
2. SESSION.md + docs/POST-MORTEM-PHASE5-22-AVRIL.md (contexte échec)
3. memory/feedback_cache_busters.md (règle ?v=)
4. memory/project_autonomisation_utilisateur.md (contexte projet)

Action : commencer par l'Audit 1 (reverse-engineering legacy). Lire
js/donnees-demo.js en entier, produire Table 1 (écritures) et Table 2
(effets de bord) dans docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md. Validation
intermédiaire avec Grégoire avant Audit 2.

Le mode démo legacy est réactif depuis le revert — Grégoire peut
l'utiliser normalement pendant que l'audit se fait.
```

---

## 8. Quand abandonner Phase 5

Scénarios où l'audit conclut « on laisse le legacy et on passe à autre chose » :

- Table 6 montre que >5 clés calculées à la volée ont des dépendances croisées complexes (calendrier→snapshots→indices→compteurs) difficiles à reproduire.
- Les lectures de l'aperçu (Audit 2 Table 4/5) reposent sur des effets de bord implicites (cache mémoire, ordre d'initialisation) qui résistent au redirigeage namespace.
- Grégoire juge que la dette legacy (1070 l. dans `donnees-demo.js`) est acceptable comparée au coût de la refonte.

Dans ce cas, produire à la place :
- Un document `docs/PHASE5-ABANDON.md` qui acte la décision
- Mise à jour de `plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md` pour marquer Phase 5 « abandonnée, mode démo legacy accepté »
- Le reste du plan (Phases 6, 7, Plan 2) peut avancer sans Phase 5

---

## 9. Temps estimé total

| Étape | Durée |
|---|---|
| Audit 1 (reverse-engineering legacy) | 45 min |
| Audit 2 (cartographie des lectures) | 60-90 min |
| Audit 3 (gap analysis) | 30 min |
| Rédaction du document `AUDIT-PHASE5-PRE-TENTATIVE-2.md` | 30-45 min |
| Décision architecturale avec Grégoire | 30 min |
| **Total session audit** | **3-4 h** |
| Parcours utilisateur + tests d'acceptation (si on procède) | 1 h |
| Implémentation (si on procède) | 2-4 sessions, découpage par sous-phase |

---

## 10. Suivi

| Étape | État | Notes |
|---|---|---|
| Plan rédigé (ce fichier) | Livré | 24 avril 2026 |
| Audit 1 | À faire | — |
| Audit 2 | À faire | — |
| Audit 3 | À faire | — |
| Document AUDIT-PHASE5-PRE-TENTATIVE-2.md | À produire | — |
| Décision architecturale | À faire | — |
| Implémentation / abandon | Selon décision | — |

Mise à jour : au fil de l'audit.
