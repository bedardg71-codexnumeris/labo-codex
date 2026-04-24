# Audit Phase 5 — Pré-tentative 2

**Statut** : Audit 1 livré (24 avril 2026). Audits 2 et 3 à suivre après validation avec Grégoire.
**Plan directeur** : `plans de travail/PLAN-AUDIT-PHASE5-DEMO.md`
**Contexte** : tentative du 22 avril reverted (`7e47f4e`). Mode démo legacy réactif. Ne pas recoder avant que les 6 tables soient produites et validées.

---

## Méthode

- Lecture exhaustive de `js/donnees-demo.js` (1070 l.) ligne par ligne.
- Lecture ciblée des fonctions satellites appelées : `changerTrimestreActif` (`js/trimestres.js:307`), `creerGroupeCoursDemoSiNecessaire` (`js/trimestres.js:360`), `genererCalendrierComplet` (`js/trimestre.js:685`), `reconstruireSnapshotsHistoriques` (`js/snapshots.js:831`), `cleSnapshots` (`js/snapshots.js:90`), `peuplerDropdownGroupeCoursActif` (`js/trimestre-v2.js:5704`), `initialiserSystemeModes` (`js/modes.js:46`), `rafraichirContenuSelonMode` (`js/modes.js:181`), `retirerGuidageDemo` (`js/guidage-demo.js:128`), `calculerTousLesIndices` / save `indicesCP` (`js/portfolio.js:690`).
- Source de vérité des écritures : appels à `db.setSync()` / `db.set()` / `db.removeSync()` / `db.remove()` dans ces fichiers, regroupés par fonction déclenchée depuis `entrerEnDemo` et `quitterDemo`.

Les numéros de ligne entre parenthèses renvoient à `js/donnees-demo.js` sauf mention contraire.

---

## Audit 1 — Reverse-engineering du legacy

### Table 1 — Écritures de `chargerDonneesDemo` (+ `fusionnerDonneesDemo`)

Toutes les écritures effectuées par la chaîne `chargerDonneesDemo` → `fusionnerDonneesDemo` (l.436–768). Elles s'exécutent **avant** toute lecture namespacée (avant `changerTrimestreActif('demo')`), donc `cle()` pointe encore vers le trimestre utilisateur précédent — c'est pourquoi le module utilise un préfixe explicite `'demo_'` via le helper local `cleDemo()` (l.527).

| # | Clé écrite | Namespace | Valeur / comportement | Référence |
|---|---|---|---|---|
| 1 | `trimestres` | global | Upsert `{id:'demo', nom:'Démonstration', session:'D', annee:'2025', actif:false, isDemo:true}` (actif géré plus tard par `changerTrimestreActif`) | `chargerDonneesDemo` l.468–485 |
| 2 | `demo_cadreCalendrier` | demo_ | `packDemo.cadreCalendrier` (dates début/fin trimestre) | l.491–493 |
| 3 | `demo_horaireHebdo` | demo_ | `packDemo.horaireHebdo` (séances de la semaine type) | l.494–496 |
| 4 | `modalitesEvaluation` | **global, écrasé** | `packDemo.modalitesEvaluation` — **pas de namespace**, source de vérité globale écrasée le temps de la démo, sauvegardée dans `demo-etat-precedent` et restaurée au `quitterDemo` | l.498–501 |
| 5 | `demo_planification_mindmap` | demo_ | `CARTE_DEMO_ALIGNEMENT` (carte mentale Écriture et littérature, 17 nœuds / 14 liens) | l.504 |
| 6 | `demo-chargees` | flag global | `'true'` — marqueur idempotence `chargerDonneesDemo` | l.507 |
| 7 | `listeCours` | global | Push des cours de `packDemo.listeCours` avec marquage `isDemo=true`, sans remplacement des cours utilisateurs | `fusionnerDonneesDemo` §1 l.528–541 |
| 8 | `cours` | global | Merge par Map (par `id`) des cours démo dans la clé canonique — alimente les sélecteurs Contexte | §1b l.546–551 |
| 9 | `enseignants` | global | Push `{id:'ENS_DEMO', prenom:'Primo', nom:'Primavera', courriel:'', isDemo:true}` si absent | §1c l.556–567 |
| 10 | `demo_groupeEtudiants` | demo_ | Upsert étudiants du pack (clé de match : `da`) avec `isDemo=true` | §2 l.570–583 |
| 11 | `demo_productions` | demo_ | Upsert productions (match par `id`) avec `estDemo=true` | §3 l.585–601 |
| 12 | `demo_evaluationsSauvegardees` | demo_ | Upsert évaluations `packDemo.evaluationsSauvegardees` ou `packDemo.evaluations` (match par `id`) | §4 l.603–618 |
| 13 | `grillesTemplates` | global | Upsert grilles démo avec `estDemo=true` (match par `id`) | §5 l.620–635 |
| 14 | `echellesTemplates` | global | Upsert échelles démo avec `estDemo=true` (match par `id`) | §6 l.637–652 |
| 15 | `demo_presences` | demo_ | Conversion `{date:{da:data}}` → `[{date,da,…,estDemo:true}]`, push incrémental (pas de remplacement) | §7 l.654–676 |
| 16 | `cartouches_*` | global (potentiellement multiple) | Pour chaque clé `cartouches_XXX` présente dans le pack : push entrées avec `estDemo=true` (match par `id`). Le pack actuel écrit au moins `cartouches_GRILLE_DEMO` | §8 l.678–694 |
| 17 | `demo_horaires` | demo_ | Remplace ou push `HOR_DEMO` : 2 séances (Lundi 11:00–12:40, Mercredi 13:00–14:40), `groupeAssocie:'0demo'`, `isDemo:true`. Écriture **franche** si l'horaire existe déjà (pour corriger d'anciens formats) | §9 l.696–727 |
| 18 | `demo_groupesCours` | demo_ | Remplace ou push `GC_DEMO` : `{id:'GC_DEMO', trimestreId:'demo', coursId, groupeNum:'0demo' (padStart 5), horaireId:'HOR_DEMO', enseignantId:'ENS_DEMO', actif:true, isDemo:true}`. Écriture franche si existait déjà | §10 l.729–766 |

**Notes** :

- Écritures « globales » (non préfixées, hors namespace trimestre) : 6 clés — `trimestres`, `listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, plus `modalitesEvaluation` et les `cartouches_*`. Ces clés sont **partagées** avec les vrais trimestres utilisateur. Le snapshot `demo-etat-precedent` les capture (4 d'entre elles — `trimestres`, `listeCours`, `grillesTemplates`, `echellesTemplates`) mais pas toutes (`cours`, `enseignants`, `cartouches_*` **non sauvegardées** — c'est la source des résidus potentiels observés au quitter).
- Le tableau des `cartouches_*` est ouvert : toute clé commençant par `cartouches_` dans le pack sera injectée globalement, y compris potentiellement `cartouches_GRILLE_DEMO` (cf. pack-demo-20.js pour la liste exhaustive).
- Le helper `cleDemo()` (l.527) est volontairement découplé de `window.cle()` pour éviter la race : au moment de `chargerDonneesDemo`, `trimestreActif` pointe encore sur le trimestre utilisateur — préfixer manuellement `'demo_'` garantit que les données atterrissent dans le namespace cible.

**Lacunes de Table 1 à noter pour Audit 3 (gap analysis)** :

- Pas d'écriture `demo_indicesCP` ni `demo_indicesAssiduite*` ici — ces clés sont **calculées après activation** (étapes 12–13 de Table 2) et n'existent pas dans le pack.
- Pas d'écriture `demo_calendrierComplet` ici — idem, calculé après.
- Pas d'écriture `demo_snapshots_<coursId>` ici — idem, reconstruit après.
- Clé `demo_modalitesEvaluation` : **inexistante**. Le pack écrit dans la clé globale `modalitesEvaluation`. Si Phase 5 garde le namespace, il faudra soit peupler `demo_modalitesEvaluation`, soit modifier les lectures, soit garder l'écrasement global (bannière zéro-dette de Grégoire : éviter).

---

### Table 2 — Effets de bord de `entrerEnDemo`

Séquence complète du toggle `checkbox Données démo` ON, ordre d'exécution (l.189–310) :

| # | Étape / ligne | Action | Effet observable / écriture |
|---|---|---|---|
| 0 | l.192–201 | Guard résidu | Si `demo-actif==='true'` mais pas de bandeau visible → reset `demo-actif`, `demo-chargees` à null, continue. Si bandeau visible → `return`. |
| 1 | l.205 `sauvegarderEtatAvantDemo()` | Snapshot état utilisateur | `db.setSync('demo-etat-precedent', {infoCours, groupeCoursActif, modeApplication, modalitesEvaluation, trimestres, listeCours, grillesTemplates, echellesTemplates, trimestreActifId})` |
| 2 | l.208 | Flag activation | `db.setSync('demo-actif', 'true')` |
| 3 | l.211 | Force reload pack | `db.setSync('demo-chargees', null)` |
| 4 | l.214 `await chargerDonneesDemo()` | Peuplement complet | Toutes les écritures de la **Table 1** (18 clés). |
| 5 | l.222–227 | Vérification post-charge | Lit `demo_groupeEtudiants`; si vide → `await db.syncToLocalStorageCache()` + retry. Pas d'écriture si OK. |
| 6 | l.231 `await changerTrimestreActif('demo')` (trimestres.js:307) | Bascule trimestre actif | 1) boucle `trimestres.forEach(t => t.actif=false)` ; 2) `trimestre.actif=true` ; 3) `db.setSync('trimestres', trimestres)` ; 4) `window.trimestreActif='demo'` ; 5) `db.setSync('trimestreActif', 'demo')` ; 6) `db.setSync('infoCours', null)` ; 7) `db.setSync('groupeCoursActif', null)` ; 8) `creerGroupeCoursDemoSiNecessaire()` (voir ci-dessous) ; 9) `mettreAJourBandeauArchive()` ; 10) `genererCalendrierComplet()` (voir §12). |
| 6a | trimestres.js:360 `creerGroupeCoursDemoSiNecessaire` | Filet de sécurité GC démo | Si `GC_DEMO` absent de `cle('groupesCours')` = `demo_groupesCours` → recrée `HOR_DEMO` (format simplifié `{jour:'lundi',periode:'AM'}`, **différent de Table 1 §17**) et `GC_DEMO`. Normalement no-op après `fusionnerDonneesDemo` §9–10, mais il y a **divergence de schéma** avec Table 1 §17 : cette fonction-ci écrit un horaire sans `heureDebut/heureFin/lettre/…`, ce qui peut écraser si elle s'exécute. À vérifier. |
| 7 | l.237–244 | Pointeur cours actif | Lit `cours` puis `listeCours` pour trouver `id==='demo-cours'` (ou premier cours démo) ; `db.setSync('infoCours', coursDemo)`. |
| 8 | l.247–253 | Pointeur groupe-cours actif | Lit `demo_groupesCours` pour trouver `GC_DEMO` ; `db.setSync('groupeCoursActif', gcDemo)`. |
| 9 | l.260–263 | Pré-sélection sidebar | `db.setSync(cle('horaireSelectionne'), 'HOR_DEMO')` = `demo_horaireSelectionne` ; `db.setSync(cle('groupeSelectionne'), '0demo')` = `demo_groupeSelectionne`. |
| 10 | l.268–270 `genererCalendrierComplet()` (trimestre.js:685) | Calendrier démo | Lit `cle('cadreCalendrier')`, `cle('evenementsPrevus')`, `cle('evenementsImprevus')`, `cle('horaires')`, `cle('horaireHebdo')`. Écrit potentiellement `cle('horaireHebdo')` (synchronisation depuis entités horaire, l.709) et systématiquement `cle('calendrierComplet')` = `demo_calendrierComplet` (l.848). |
| 11 | l.274–279 `await reconstruireSnapshotsHistoriques()` (snapshots.js:831) | Snapshots démo | 1) re-appelle `genererCalendrierComplet()` (cache re-écrit `demo_calendrierComplet`) ; 2) lit `await db.get(cle('evaluationsSauvegardees'))` ; 3) appelle `genererSeancesCompletes()` ou `obtenirSeancesCompletes()` ; 4) `await db.set(cleSnapshots(), {hebdomadaires:[], interventions:[], metadata:{...}})` puis itère dates → push entrées. **Clé = `cle('snapshots') + '_' + (infoCours._groupeCoursId || infoCours.id)`** — pour la démo : `demo_snapshots_<coursId démo>`. **Note** : le nettoyage (Table 3 l.829) attend `demo_snapshots_GC_DEMO`, mais la vraie clé dépend de `infoCours.id` — **incohérence potentielle** à confirmer selon ce que contient `infoCours` pour la démo. |
| 11a | portfolio.js:690 (appelé indirectement par reconstructeur) | Indices C-P | `db.setSync(cle('indicesCP'), indicesCP)` = `demo_indicesCP`. (Probablement aussi `cle('indicesAssiduite')` si le calcul d'assiduité est déclenché en amont — à confirmer par lecture de `calculerTousLesIndices`.) |
| 12 | l.282 | Mode d'application | `db.setSync('modeApplication', 'normal')` — force retrait anonymisation. |
| 13 | l.283–285 `initialiserSystemeModes()` (modes.js:46) | UI mode | Lecture du mode, mise à jour du sélecteur en en-tête. (Écritures : à vérifier ; probablement aucune.) |
| 14 | l.288 `afficherBandeauDemo(true)` | UI bandeau | `document.getElementById('bandeau-demo').style.display='block'` (via `toggleDisplay`) ; `document.body.classList.add('mode-demo')`. **Pas d'écriture storage.** |
| 15 | l.291–293 `peuplerDropdownGroupeCoursActif()` (trimestre-v2.js:5704) | Header refresh | Repopule le dropdown GC dans la barre principale. |
| 16 | l.297 `afficherSection('apercu')` | Navigation | Route vers la section aperçu (tableau de bord). |
| 17 | l.301–303 `rafraichirContenuSelonMode()` (modes.js:181) | Rerender complet | Trigger les re-rendus des sections affichées selon le mode. |
| -- | l.305–309 catch | Rollback | `db.setSync('demo-actif', null)` + `await restaurerEtatApresDemo()`. |

**Total** : 11 étapes numérotées dans `entrerEnDemo`, qui se décomposent en **~22 écritures storage distinctes** (en comptant Table 1 étape 4 comme 18 écritures + 6 écritures propres : `demo-actif`, `demo-chargees`, `trimestres`, `trimestreActif`, `infoCours`, `groupeCoursActif`, `demo_horaireSelectionne`, `demo_groupeSelectionne`, `demo_calendrierComplet`, `demo_snapshots_<id>`, `demo_indicesCP`, `modeApplication`).

**Points critiques pour Phase 5** :

1. **Écritures post-chargement (étapes 10–11)** : `demo_calendrierComplet`, `demo_snapshots_<id>`, `demo_indicesCP` ne sont **pas dans le pack**. Ce sont des **données dérivées** calculées à partir du pack. Si Phase 5 remplace le chargement par de la redirection namespace pure (Option B), il faut soit pré-calculer ces clés et les inclure dans `demo-namespace.js` (Phase 1), soit déclencher les fonctions de calcul à l'activation (Option A).
2. **Clé `cleSnapshots()` non triviale** : dépend de `infoCours._groupeCoursId || infoCours.id`. L'incohérence avec `supprimerDonneesNamespaceesDemo` (qui hardcode `demo_snapshots_GC_DEMO`) suggère un bug latent si le cours démo est chargé sans `_groupeCoursId`. À vérifier.
3. **Double synchronisation horaire** : `fusionnerDonneesDemo` §9 écrit HOR_DEMO avec schéma complet (heureDebut/heureFin/lettre/…), puis `creerGroupeCoursDemoSiNecessaire` re-écrit avec schéma allégé si GC_DEMO manque. Ordre d'exécution fait que l'allégé ne s'exécute pas (GC_DEMO est déjà là après §10), mais c'est fragile.
4. **`modeApplication` forcé à `normal`** : si l'utilisateur était en anonymisation, ce basculement est invisible tant qu'il n'a pas quitté la démo. Restauration OK via snapshot.
5. **`peuplerDropdownGroupeCoursActif`** et **`rafraichirContenuSelonMode`** sont des orchestrateurs UI — ils lisent à travers `cle()` qui pointe maintenant sur `demo_*`. C'est ce qui fait que l'aperçu se peuple « naturellement ». La tentative 5.B-ter a échoué parce qu'elle a changé les pointeurs sans déclencher ces orchestrateurs ni les étapes 10–11 de calcul des dérivées.

---

### Table 3 — Effets de bord de `quitterDemo`

Séquence complète du toggle OFF (ou clic « Quitter la démo »), l.320–363 :

| # | Étape / ligne | Action | Effet observable / écriture |
|---|---|---|---|
| 1 | l.324 `await dechargerDonneesDemo()` | Nettoyage données | Détail ci-dessous (1a–1e). |
| 1a | `supprimerDonneesNamespaceesDemo()` l.812–848 | Purge demo_* | Pour chaque clé de la liste hardcodée `[groupeEtudiants, productions, evaluationsSauvegardees, presences, horaires, groupesCours, indicesAssiduiteDetailles, indicesCP, indicesAssiduite, calendrierComplet, snapshots, cadreCalendrier, horaireHebdo, planification_mindmap]` : `db.removeSync('demo_'+cle)` + `await db.remove('demo_'+cle)`. Puis suppression explicite `demo_snapshots_GC_DEMO` et `seancesCompletes_gc_GC_DEMO`. Enfin, nettoyage générique via `await db.keys()` qui filtre `startsWith('demo_')` et `remove`. |
| 1b | `supprimerDonneesGlobalesDemo()` l.854–893 | Purge globaux `isDemo`/`estDemo` | `listeCours` (filter `!isDemo`), `cours` (filter `!isDemo`), `enseignants` (filter `!isDemo`), `grillesTemplates` (filter `!estDemo`), `echellesTemplates` (filter `!estDemo`), puis `removeSync('cartouches_GRILLE_DEMO')` s'il y a du contenu. **Écrit aux deux storages** (localStorage + IndexedDB). |
| 1c | l.790–793 | Retrait trimestre démo | `db.setSync('trimestres', trimestres.filter(t => t.id !== 'demo'))` + `await db.set('trimestres', …)`. |
| 1d | l.796 | Flag rechargé | `db.setSync('demo-chargees', null)`. |
| 1e | l.799 | Sync storages | `await db.syncToLocalStorageCache()`. |
| 2 | l.327 | Flag désactivation | `db.setSync('demo-actif', null)`. |
| 3 | l.330–331 | UI bandeau masqué | `toggleDisplay(bandeau, false)` + `document.body.classList.remove('mode-demo')` ; `retirerGuidageDemo()` si chargé. |
| 4 | l.334 `await restaurerEtatApresDemo()` l.125–179 | Restauration snapshot | Lit `demo-etat-precedent` puis : (a) `db.setSync('trimestres', etat.trimestres)` ; (b) `db.setSync('listeCours', etat.listeCours)` ; (c) `db.setSync('grillesTemplates', etat.grillesTemplates)` ; (d) `db.setSync('echellesTemplates', etat.echellesTemplates)` ; (e) si `trimestreActifId` → `await changerTrimestreActif(trimestreActifId)` (écrit `trimestreActif`, `window.trimestreActif`, `infoCours=null`, `groupeCoursActif=null`, déclenche à nouveau `genererCalendrierComplet` pour le trimestre restauré) ; (f) `db.setSync('infoCours', etat.infoCours)` ou `removeSync` ; (g) idem `groupeCoursActif` ; (h) `db.setSync('modalitesEvaluation', etat.modalitesEvaluation)` si présente ; (i) `db.setSync('modeApplication', mode)` — force `normal` si valeur legacy `simulation` ; (j) `db.removeSync('demo-etat-precedent')`. |
| 5 | l.338 `initialiserSystemeModes()` | UI mode | Met à jour sélecteur mode (anonymisation/normal). |
| 6 | l.343 `peuplerDropdownGroupeCoursActif()` | Header refresh | Re-render dropdown GC. |
| 7 | l.349 `afficherSection('accueil')` | Navigation | Retour accueil (pas aperçu — choix explicite Accueil V3). |
| 8 | l.353–355 | Rerender | `rafraichirContenuSelonMode()`. |
| -- | l.357–362 catch | Fallback | `db.setSync('demo-actif', null)` + `afficherBandeauDemo(false)`. |

**Écritures / suppressions — 4 catégories** :

- **~16 suppressions demo_*** (liste explicite) + nettoyage générique via `db.keys()` (balaye tout résidu).
- **6 réécritures globales filtrées** : `listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, `cartouches_GRILLE_DEMO` (retrait des items `isDemo`/`estDemo`).
- **Restauration snapshot** : 7 clés (`trimestres`, `listeCours`, `grillesTemplates`, `echellesTemplates`, `infoCours`, `groupeCoursActif`, `modalitesEvaluation`, `modeApplication`) + `trimestreActif` via `changerTrimestreActif`.
- **Flags** : `demo-actif=null`, `demo-chargees=null`, `demo-etat-precedent` supprimé.

**Dissymétrie importante vis-à-vis de Table 1** :

La restauration n'écrit **pas** `cours` ni `enseignants` avec leur snapshot pré-démo. Elle compte sur le filtrage par flag `isDemo` (étape 1b) pour nettoyer, mais si un utilisateur a **modifié un cours ou un enseignant pendant la démo** et que cette modif a été écrite sur un objet non-`isDemo`, la modif persiste après sortie. Réciproquement, si l'utilisateur avait des cours non marqués `isDemo` qui auraient été accidentellement écrasés par la démo (merge par Map §1b : `coursMap.set(cours.id, cours)` remplace sans vérifier `isDemo`), la version utilisateur est **perdue**. Le snapshot ne restaure `listeCours` (global) que partiellement — `cours` n'est pas sauvegardée du tout.

**Autres points critiques** :

- **Trimestre restauré appelle son propre `genererCalendrierComplet`** : Le calendrier du trimestre utilisateur sera donc reconstruit au `quitterDemo`. Si Phase 5 retire le legacy, il faut s'assurer que la sortie du mode démo (Option A/B) déclenche aussi la reconstruction.
- **`retirerGuidageDemo()`** : fonction dans `js/guidage-demo.js` — à lire en Audit 2 si elle lit des données démo.
- **Nettoyage générique `db.keys().startsWith('demo_')`** : protection contre résidus. Si Phase 1 (`demo-namespace.js`) peuple des clés `demo_*` de façon **permanente**, ce nettoyage devient un bug : il supprime les données permanentes au `quitterDemo`. À **absolument** réconcilier avec Phase 1 (Audit 3).

---

## Synthèse Audit 1 — questions ouvertes pour Grégoire

Avant de lancer Audit 2, quatre points méritent validation ou décision :

1. **Écritures globales (`listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`, `cartouches_*`)** : la dette observée vient de là. Le pack démo **pollue** 7 clés globales partagées avec les vrais trimestres. Veut-on vraiment les isoler dans `demo_*` (Phase 5 Option A/B) ou accepte-t-on que le mode démo les écrase temporairement (Option C, statu quo) ?
2. **Incohérence `cleSnapshots()`** : la clé réelle = `demo_snapshots_<infoCours._groupeCoursId || infoCours.id>`, mais le nettoyage suppose `demo_snapshots_GC_DEMO`. Bug latent ou je rate quelque chose ? À confirmer en testant `obtenirCoursIdPourSnapshots()` en mode démo actif (console).
3. **Collision Phase 1 (demo-namespace.js) / nettoyage `db.keys().startsWith('demo_')`** : si Phase 1 peuple `demo_*` en permanence, le `quitterDemo` legacy les supprime — à rapprocher de Phase 1 pour voir si la suppression est neutralisée côté `demo-namespace.js`.
4. **Dissymétrie snapshot / restauration** : `cours`, `enseignants`, `cartouches_*` ne sont pas restaurés à partir d'un snapshot mais seulement filtrés. Veut-on corriger ce point dans la nouvelle implémentation, ou accepter que « l'utilisateur ne doit rien modifier pendant la démo » ?

Ces questions conditionnent le choix Option A vs B vs C et le contenu d'Audit 3 (gap analysis demo_* vs legacy). Elles ne nécessitent pas de réponse immédiate — validation intermédiaire suffit pour passer à Audit 2.

---

## Réponses post-Audit 1 (24 avril, validation Grégoire)

### Question 1 — Lecture seule

Confirmée par Grégoire comme approche à retenir. Phase 4.B (déjà livrée) a verrouillé les 5 formulaires de bibliothèque. La pollution globale côté storage est un problème orthogonal qui oriente vers Option A ou B.

### Question 2 — `cleSnapshots()` en console

`obtenirCoursIdPourSnapshots` n'est pas exportée (fonction interne `snapshots.js`). Test effectif pour la prochaine fois : `window.cleSnapshots()` en console sur une démo active, puis `db.getSync('infoCours', null)`. Laissé en suspens — pas bloquant pour la décision architecturale, à retester le jour où l'incohérence `GC_DEMO` vs `<id>` devient un problème concret.

### Question 3 — Collision Phase 1 / nettoyage `demo_*` : **BUG CONFIRMÉ**

Lecture de `js/demo-namespace.js` (214 l.) :

- `initialiserDemoNamespace()` (l.162) n'écrit dans `demo_*` que **si le flag `demo-version-installee` diffère de `pack._metadata.version`**.
- Si identique → **return immédiat, pas de re-peuplement** (l.189–192).
- Le flag est posé dans `localStorage` après peuplement réussi (l.196).

Scénario défaillant :

1. Premier démarrage → Phase 1 écrit `demo_groupeEtudiants`, `demo_productions`, etc. + flag `demo-version-installee = "X.Y"`.
2. Utilisateur coche « Données démo » → `entrerEnDemo` → `fusionnerDonneesDemo` réécrit `demo_*` (idempotent).
3. Utilisateur décoche → `quitterDemo` → `supprimerDonneesNamespaceesDemo` → le nettoyage générique `db.keys().startsWith('demo_')` (`donnees-demo.js:837–843`) supprime **toutes** les clés `demo_*`.
4. Recharge → `initialiserDemoNamespace` voit flag `"X.Y"` égal à version pack → **retour sans re-peupler**. Les clés permanentes sont perdues jusqu'au prochain changement de version du pack.

Atténuation partielle observée en l.167–170 : `initialiserDemoNamespace` attend 1 s si `demo-actif === 'true'` au boot, pour laisser `dechargerDonneesDemo` finir. Mais après un `quitterDemo` complet, `demo-actif === null` — donc pas d'attente et surtout **pas de re-peuplement** du fait du flag.

**Conséquence directe pour Phase 5** :

- Phase 2 (sélecteurs à 2 sections) dépend de `demo_*` peuplé. Après un cycle toggle legacy ON/OFF, les sélecteurs démo deviennent vides jusqu'à un changement de version pack ou effacement manuel du flag.
- **Cette collision est silencieuse aujourd'hui** parce que :
  - Soit les utilisateurs n'ont pas essayé de toggler démo ON puis OFF entre deux démarrages ;
  - Soit le pack a été bumpé entretemps (ce qui ré-écrit `demo_*`) ;
  - Soit le chemin n'a pas été testé en combinaison.
- **Elle deviendra bloquante dès que Phase 2 est testée en usage courant**, et elle **invalide l'assertion « Phases 1-4 acquises »** : Phase 1 est subtilement cassée tant que le nettoyage legacy existe.

**Options de correction** (hors scope Audit, à décider en Phase 5) :

- (a) Dans `supprimerDonneesNamespaceesDemo`, aussi `db.removeSync('demo-version-installee')` avant le nettoyage. Simple, force le re-peuplement au prochain boot. Inconvénient : 1 s d'écriture au boot suivant.
- (b) Dans `initialiserDemoNamespace`, vérifier la présence effective d'au moins une clé sentinelle (`demo_groupeEtudiants`) avant de décider no-op. Plus robuste, masque le bug legacy sans le corriger.
- (c) Phase 5 retire le legacy → le nettoyage générique disparaît → problème résolu par construction.

Option (c) est la plus propre (zéro-dette), les autres sont des filets transitoires.

### Question 4 — Lecture seule démo + création libre en mode réel

Confirmée par Grégoire. Compréhension alignée : démo en lecture seule, fork via « Dupliquer » atterrit dans trimestre utilisateur (Phase 4.B), créations hors démo vont naturellement dans `h2026_*`. Entités sans bibliothèque visuelle (enseignant, horaire, cours brut) ne nécessitent pas de fork — création fraîche en mode réel.

---

## Audit 2 — Cartographie des lectures

### Mécaniques centrales à connaître

Avant les tables, trois fonctions servent de point de passage pour pratiquement toutes les lectures du projet :

**`cle(nomCle)`** — `js/trimestres.js:211`. Préfixe par `<trimestreActifId>_` sauf si :
- `nomCle` est dans `CLES_GLOBALES` = `['trimestres', 'grillesTemplates', 'echellesTemplates', 'pratiquesConfigurables', 'modalitesEvaluation', 'modeApplication', 'etatsAccordeonsV2', 'cours', 'listeCours']` → retour tel quel.
- `nomCle` commence par `cartouches_` → retour tel quel.
- Trimestre actif archivé et `nomCle` est un template → cherche la copie archivée d'abord.

En mode démo (`trimestreActif='demo'`), `cle('X')` = `'demo_X'` pour toutes les clés **non globales**. **Les 9 clés globales restent partagées** — c'est la racine de la pollution.

**`obtenirDonneesSelonMode(cle)`** — `js/modes.js:558` (la définition dans `db.js:1005` est une ancienne version non utilisée). Pipeline :

1. Passe la clé par `window.cle()` → résout au namespace actif.
2. Lit `db.getSync(cleEffective, valeurParDefaut)`.
3. **Filtre par `coursActif.id`** pour les clés `['groupeEtudiants', 'productions', 'presences', 'evaluationsSauvegardees']` (l.588–624).
4. Anonymise si `modeActuel === MODES.ANONYMISATION` (l.627).
5. Retourne les données filtrées.

**`obtenirEtudiantsCoursActif()`** — `js/modes.js:1012`. Surcouche qui appelle `obtenirDonneesSelonMode('groupeEtudiants')`, re-filtre par `coursId` + `groupe` (plus strict que odsm), puis `filtrerEtudiantsParMode` (exclut groupe `9999` en mode normal, etc.). **77 call-sites**.

**Implication Phase 5** : si Phase 5 route correctement via `cle()` (Option B), toutes les 426 lectures `cle()` et les 381 lectures `obtenirDonneesSelonMode` sont redirigées automatiquement. **Le travail à faire n'est pas dans les lectures ; il est dans les pré-requis** (`trimestreActif='demo'`, `infoCours.id` cohérent avec les `coursId` des étudiants démo, `groupeCoursActif` pointant sur `GC_DEMO`).

### Clés lues — inventaire exhaustif

**Via `cle()`** (35 clés distinctes) :

```
annotationsTravaux, autoreflexionBilan, cadreCalendrier, calendrierComplet,
chronoEvaluations, confidentielEtudiants, corbeilleFichiers, echellesTemplates,
evaluationsSauvegardees, evenementsImprevus, evenementsPrevus, fichiersTravaux,
grillesTemplates, groupeEtudiants, groupesCours, groupeSelectionne, horaireHebdo,
horaires, horaireSelectionne, indicesAssiduite, indicesCP, indicesEvaluation,
indicesPatternsRaI, interventions, modalitesEvaluation, parcoursBilan,
portfoliosEleves, presences, productions, productionsPedagogiques,
questionnaireBilan, resultatsBilan, seancesCompletes, seancesHoraire, snapshots
```

**Via `obtenirDonneesSelonMode()`** (11 clés) :

```
corbeilleFichiers, evaluationsSauvegardees, fichiersTravaux, groupeEtudiants,
groupesCours, indicesAssiduite, indicesCP, modalitesEvaluation, portfoliosEleves,
presences, productions
```

---

### Table 4 — Lectures dépendantes du namespace trimestre (agrégée par clé)

Pour chaque clé lue via `cle()` ou `obtenirDonneesSelonMode()`, on note : status namespace, volume lectures, principaux lecteurs, trigger dominant, impact Phase 5.

Légende :
- **NS** : la clé est namespacée (`<trimestre>_X`).
- **GLOB** : la clé est globale (dans `CLES_GLOBALES`, même en mode démo).
- **GLOB+cartouches** : clé `cartouches_<id>`, globale par préfixe.

| Clé | NS/GLOB | Peuplée par legacy ? | Peuplée par Phase 1 (demo-namespace) ? | Lecteurs principaux | Trigger | Impact Phase 5 |
|---|---|---|---|---|---|---|
| `groupeEtudiants` | NS | Oui (Table 1 §10) | Oui | `obtenirEtudiantsCoursActif` (77 call-sites), `indices.js` (120, 224, 267), `evaluation.js` (122, 167, 196, 1198), `profil-etudiant.js` (1452, 2091), `tableau-bord-apercu.js` (1058) | Au render sections Suivi/Apercu/Profil | Critique. Filtré par `infoCours.id`. Exige que `infoCours` en démo contienne l'id du cours démo. |
| `productions` | NS | Oui (Table 1 §11) | Oui | `evaluation.js` (249, 557, 1200), `profil-etudiant.js` (698, 2092, 2512), `graphiques-progression.js` (461, 600, 826, 1682, 2552, 2634), `rythme.js` (31, 168), `impact-jetons.js` (80, 180), `correlations-longitudinales.js` (254) | Render aperçu + graphiques | Critique pour l'aperçu peuplé. Filtré par `infoCours.id`. |
| `evaluationsSauvegardees` | NS | Oui (Table 1 §12) | Oui | `evaluation.js` (2680), `indices.js` (423), `graphiques-progression.js` (460), `snapshots.js` (522, 844), `profil-etudiant.js` (700, 1514, 2511, 2585) | Saisie évaluation + render | Critique. Filtré par `coursId`. |
| `presences` | NS | Oui (Table 1 §15) | Oui | `indices.js` (109, 258), `profil-etudiant.js` (2091), `saisie-presences.js` (13 call-sites) | Saisie présence + calcul indicesAssiduité | Filtré par `coursId`. |
| `horaires` | NS | Oui (Table 1 §17) | Oui | `trimestres.js:364` (creerGroupeCoursDemoSiNecessaire), `genererCalendrierComplet` (693), `horaire.js`, `trimestre-v2.js` | Boot trimestre + édition GC | Utilisé pour dériver `horaireHebdo`. |
| `groupesCours` | NS | Oui (Table 1 §18) | Oui | `modes.js:1123` (obtenirPratiqueActiveGroupeCours), `trimestre-v2.js` | Lecture GC, édition, sélection | Critique. Le routage vers `demo_groupesCours` dépend du `trimestreActif='demo'`. |
| `cadreCalendrier` | NS | Oui (Table 1 §2) | Oui | `genererCalendrierComplet` (687), `snapshots.js` (249, 497), `graphiques-progression.js` (604, 1677), `correlations-longitudinales.js` (261) | Génération calendrier + filtres de dates | Disponible dans Phase 1. |
| `horaireHebdo` | NS | Oui (Table 1 §3) | Oui | `genererCalendrierComplet` (716), `snapshots.js` | Génération calendrier | Dérivé par `genererCalendrierComplet` si vide. |
| `calendrierComplet` | NS | **Non — calculé après** (Table 2 §10) | **Non** | `rythme.js`, `indices.js`, `snapshots.js`, `graphiques-progression.js` | Render aperçu + graphiques | **Gap bloquant**. À calculer à l'activation démo (Option A) ou lors de Phase 1 (enrichissement demo-namespace). |
| `snapshots` (+ `_<coursId>`) | NS complexe | **Non — calculé après** (Table 2 §11) | **Non** | `snapshots.js` (135, 144, 155, 395, 641, 760), `graphiques-progression.js` (lecture via `obtenirSnapshots`) | Graphiques de progression | **Gap bloquant**. Clé réelle = `<trimestre>_snapshots_<_groupeCoursId\|\|id>`. À reconstruire à l'activation. |
| `indicesCP` | NS | **Non — calculé après** (Table 2 §11a) | **Non** | `indices.js` (370, 397), `tableau-bord-apercu.js` (1068), `portfolio.js` (écriture) | Barres A-C-P + profil | **Gap bloquant**. Calculé par `calculerTousLesIndices` → écrit dans `cle('indicesCP')`. |
| `indicesAssiduite` | NS | **Non — calculé après** | **Non** | `indices.js` (489, 556), `tableau-bord-apercu.js` (1067), `graphiques-progression.js` (4015) | Barres A + métriques assiduité | **Gap bloquant**. Idem indicesCP. |
| `indicesAssiduiteDetailles` | NS | **Non — calculé après** | **Non** | `indices.js`, nettoyé par `supprimerDonneesNamespaceesDemo` | Détails assiduité | **Gap bloquant**. |
| `indicesEvaluation` | NS | Indirect (indices.js) | Non | `indices.js`, `evaluation.js` | Calcul indices | Gap. |
| `indicesPatternsRaI` | NS | Non | Non | `tableau-bord-apercu.js:606` | Patterns RàI aperçu | Valeur par défaut tolérable. |
| `interventions` | NS | Non (pas dans pack) | Non | `interventions.js` (6 call-sites) | Module interventions | Probablement OK vide en démo (pas de modélisation RàI côté pack). |
| `horaireSelectionne` | NS | Set par legacy (Table 2 §9) | Non | `chargerHorairesV2` (trimestre-v2.js) | Render section latérale Horaire | **Écrit par le legacy à l'activation**. Si Phase 5 ne le fait plus → section latérale vide. |
| `groupeSelectionne` | NS | Set par legacy (Table 2 §9) | Non | `populerDropdownGroupesV2` (trimestre-v2.js) | Dropdown Groupe d'étudiants | Idem. |
| `seancesCompletes` | NS | Non (dérivé) | Non | `horaire.js`, `snapshots.js:882`, `reconstruireSnapshotsHistoriques` | Snapshots | Dérivé de `cle('horaireHebdo')` + calendrier. |
| `seancesHoraire` | NS | Non | Non | `horaire.js`, `presences-apercu.js` | Rendu séances | Selon contenu Phase 1. |
| `portfoliosEleves` | NS | Non | Non | `indices.js:431`, `profil-etudiant.js` | Sélection portfolios | OK vide en démo. |
| `fichiersTravaux` | NS | Non (hors pack) | Non | `travaux-*.js` | Import de travaux | OK vide en démo. |
| `corbeilleFichiers` | NS | Non | Non | `travaux-*.js` | Corbeille | OK vide. |
| `annotationsTravaux` | NS | Non | Non | `travaux-ui.js`, `annotations.js` | Annotations saisies | OK vide. |
| `chronoEvaluations` | NS | Non | Non | `evaluation.js` (chrono saisie) | Chrono évaluation | OK vide. |
| `confidentielEtudiants` | NS | Non | Non | `profil-etudiant.js`, `etudiants.js` | Notes confidentielles | OK vide. |
| `parcoursBilan`, `questionnaireBilan`, `resultatsBilan`, `autoreflexionBilan`, `productionsPedagogiques` | NS | Non | Non | Modules bilan/portfolio (moins prioritaires) | Évaluations sommatives | OK vide en démo. |
| `trimestres` | **GLOB** | Oui (Table 1 §1, upsert `{id:'demo'}`) | **Non** (Phase 1 écrit `demo_trimestres`, pas la liste globale) | `obtenirTrimestres` partout (138), `obtenirTrimestreActif`, `changerTrimestreActif` | Boot, chgmt trimestre | **Point de bascule central**. Pour que `cle()` retourne `demo_X`, il faut `trimestreActif==='demo'`. En Option B, soit on persiste l'upsert démo dans `trimestres`, soit on intercepte `obtenirTrimestreActif`. |
| `grillesTemplates` | GLOB | Oui (Table 1 §13) | Non | `grille.js`, `cartouches`, `design-grille.js` (> 40 lectures) | Toute édition/affichage grille | Pollution globale. En Option A/B, il faut soit peupler `demo_grillesTemplates` et modifier le lookup, soit accepter que les grilles démo cohabitent avec les vraies (filtrées par `estDemo`). |
| `echellesTemplates` | GLOB | Oui (Table 1 §14) | Non | Modules échelles | Idem grilles | Pollution. Même choix. |
| `pratiquesConfigurables` | GLOB | Non (pas dans pack) | Non | `pratiques/*.js` | Pratiques de notation | Pas impacté. |
| `modalitesEvaluation` | GLOB | Oui (Table 1 §4, **écrasement franc**) | Oui en `demo_modalitesEvaluation` | `tableau-bord-apercu.js:761, 807`, `indices.js:502` | Aperçu + indices | **Conflit** : Phase 1 écrit `demo_modalitesEvaluation` (inutile puisque clé globale), legacy écrase la globale. Réconcilier. |
| `modeApplication` | GLOB | Oui (Table 2 §12, force `normal`) | Non | `modes.js`, nombreuses lectures | Toggle anonymisation | OK, snapshot restaure. |
| `cours`, `listeCours` | GLOB | Oui (Table 1 §7–8) | Non | Sélecteurs Contexte, `chargerDropdownCoursV2`, `tableau-bord-apercu.js:424` (infoCours) | Affichage cours | Pollution. Phase 4.B n'a PAS traité ces clés — les cours démo sont mélangés aux cours utilisateur. |
| `cartouches_*` | GLOB+cartouches | Oui (Table 1 §16, clés multiples) | Non | `cartouches.js`, `design-grille.js` | Rendu grilles | Pollution. Idem grilles. |

**Observations pour la Phase 5** :

1. **3 clés dérivées bloquantes** : `calendrierComplet`, `snapshots`, `indicesCP`/`indicesAssiduite`. Elles sont absentes du pack et de Phase 1 — le legacy les **calcule à l'activation**. Option B (redirection pure via `cle()`) **ne suffit pas** : il faut déclencher le calcul. Option A (reproduire les étapes du legacy au toggle) est plus directe.
2. **2 clés « pré-sélection sidebar »** : `horaireSelectionne`, `groupeSelectionne`. Le legacy les écrit à l'activation (Table 2 §9). Sans cette étape, les sections latérales Horaire et Groupe d'étudiants arrivent vides.
3. **6 clés globales polluées** : `grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`, `cours`, `listeCours`, `cartouches_*`. Phase 4.B filtre déjà l'affichage UI (sélecteurs à 2 sections) mais les clés restent mélangées en storage. Option A et B les laissent polluées ; un vrai zéro-dette nécessite de **revoir `CLES_GLOBALES`** pour sortir ces clés du global — **hors scope Phase 5 raisonnable**.
4. **2 clés absentes du pack et utilisées par Phase 1** (`demo_trimestres`, `demo_enseignants`) : utiles seulement si Phase 2 s'en sert (à vérifier dans Audit 3). Si personne ne les lit, c'est du code mort.

---

### Table 5 — Lectures dépendantes du GC actif

Deux familles :

- **Via helpers** : 4 helpers centralisés, 117 call-sites cumulés.
- **Directes** : `db.getSync('infoCours')` et `db.getSync('groupeCoursActif')` lus sans wrapper — 24 et 61 occurrences.

**Helpers — lectures centralisées**

| Helper | Fichier:ligne | Lit | Call-sites | Retour si démo |
|---|---|---|---|---|
| `obtenirEtudiantsCoursActif()` | modes.js:1012 | `infoCours` + `obtenirDonneesSelonMode('groupeEtudiants')` + filtre `coursId`/`groupe` + `filtrerEtudiantsParMode` | 77 | Étudiants démo filtrés par cours démo — OK si `infoCours` pointe sur le cours démo. |
| `obtenirCoursActifId()` | cours.js:1650 | `infoCours.id` | 40 | `'demo-cours'` ou id réel du cours démo. |
| `obtenirPratiqueActiveGroupeCours()` | modes.js:1108 | `groupeCoursActif.pratiqueId`, fallback `infoCours.pratiqueId`, fallback `cle('groupesCours')` | ~15 | `null` (GC_DEMO.pratiqueId=null dans Table 1 §18) — module pratique non-initialisé en démo. |
| `etudiantDansCoursActif(e)` | modes.js:1083 | `infoCours` + `e.coursId` / `e.groupe` | ~5 | OK. |
| `obtenirTrimestreActif()` | trimestres.js:136 | `db.getSync('trimestres')` filtré `actif===true` | 38 | Retourne `{id:'demo', isDemo:true, …}` si démo active. |
| `obtenirTrimestreId()` | trimestres.js:193 | idem, retourne `id` ou `''` | indirect (utilisé dans `cle()`) | `'demo'` si démo active — **fondation** du namespacing. |

**Lecteurs directs de `groupeCoursActif`** (24 call-sites) :

| Fichier | Nb | Usage |
|---|---|---|
| `trimestre-v2.js` | 7 | Formulaire GC, bandeau GC actif, `changerGroupeCoursActifV2` |
| `evaluation.js` | 3 | Contextualisation évaluation |
| `travaux-stockage.js` | 2 | Clés de stockage fichiers travaux |
| `organisateur.js` | 2 | Séances planification |
| `horaire.js` | 2 | Affichage horaire sur aperçu |
| `donnees-demo.js` | 2 | Le legacy lit son propre état |
| `modes.js`, `travaux-ui.js`, `travaux-import.js`, `modal-backup-reminder.js`, `accueil.js` | 1 chacun | Divers |

**Lecteurs directs de `infoCours`** (61 call-sites, concentrés) :

| Fichier | Nb | Usage |
|---|---|---|
| `trimestre-v2.js` | 10 | Syncing, formulaire cours, bandeau |
| `rapport-bug.js`, `modes.js`, `graphiques-progression.js`, `export-pdf.js`, `cc-license.js` | 4 chacun | Contexte affichage/export |
| `profil-etudiant.js`, `boite-outils.js` | 3 | Profil + outils contextuels |
| `planification-carte.js`, `import-export.js`, `impact-jetons.js`, `codex.js` | 2 chacun | Divers |

**Résumé impact Phase 5** :

- **En démo, ces 2 clés (`infoCours`, `groupeCoursActif`) sont écrites par le legacy comme des objets complets** (Table 2 §7–8). Tous les helpers et les 85 lectures directes se reposent dessus.
- **Option A** (reproduction d'étapes) doit absolument poser ces 2 pointeurs correctement — la tentative 5.B-ter du 22 avril les a posés mais a raté ailleurs (calendrier, snapshots, indices).
- **Option B** (pure redirection via `cle()`) doit **aussi** poser ces 2 pointeurs, sinon tous les helpers tombent sur `null`. Option B pure n'existe donc pas réellement — elle se réduit à Option A pour ces 2 clés.
- **Clé de voûte** : `obtenirTrimestreId()` retourne `'demo'` ⟺ `trimestres` global contient un `{id:'demo', actif:true}`. Ce upsert est **déjà fait par Phase 1** dans `demo_trimestres` (mais **pas dans la liste globale** — cf. l.94 de `demo-namespace.js`). En Phase 5, il faudra **soit** mettre un `demo` actif directement dans `trimestres` global au toggle ON (comme fait le legacy), **soit** modifier `obtenirTrimestreActif` pour retourner un objet virtuel si `demo-actif === 'true'` (approche plus propre, intrusive).

---

## Synthèse Audit 2 — conclusions pour la décision architecturale

### Les 3 clés bloquantes (dérivées calculées à l'activation)

- `calendrierComplet` — produit par `genererCalendrierComplet()`, lit `cadreCalendrier`, `horaireHebdo`, `horaires`, `evenementsPrevus`, `evenementsImprevus`.
- `snapshots_<coursId>` — produit par `reconstruireSnapshotsHistoriques()`, lit `evaluationsSauvegardees`, `productions`, `seancesCompletes`, `groupeEtudiants`.
- `indicesCP` / `indicesAssiduite` (/ `indicesAssiduiteDetailles`) — produits par `calculerTousLesIndices` / `calculerEtSauvegarderIndicesAssiduite`, lisent tout ce qui précède.

Ces 3 clés ne sont **ni dans le pack ni dans Phase 1**. Le legacy les **calcule à l'activation** à partir des autres données démo. **Toute Phase 5 doit reproduire ce calcul** — c'est la cause principale de l'échec de 5.B-ter (qui a posé les pointeurs mais pas déclenché les calculs dérivés).

### Les 2 clés « pré-sélection sidebar »

- `horaireSelectionne` → `'HOR_DEMO'`
- `groupeSelectionne` → `'0demo'`

Posées à l'activation par le legacy (Table 2 §9). Sans elles, les sections latérales Horaire et Groupe d'étudiants arrivent vides. Faciles à reproduire (2 `db.setSync`).

### Les 6 clés globales polluées

`grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`, `cours`, `listeCours`, `cartouches_*`. Phase 4.B a traité l'**affichage** (sélecteurs à 2 sections + fork), mais pas le **stockage** : les items démo cohabitent avec les items utilisateur dans la même collection globale, identifiés seulement par flag `estDemo`. Sortir ces clés de `CLES_GLOBALES` serait une refonte majeure **hors scope Phase 5**. Option réaliste : laisser le statu quo (accepté par Phase 4.B + 4.C), éventuellement poser `demo_*` parallèles en Phase 7 pour cadrer Plan 2.

### Bug latent confirmé (question 3)

Le cycle toggle legacy ON/OFF supprime les données Phase 1 permanentes et le flag de version empêche le re-peuplement. Solution propre : **retirer le legacy en Phase 5** (option c de la section Réponses post-Audit 1).

### Positionnement des 3 options

- **Option A (reproduction des étapes legacy)** : 5 étapes à reproduire proprement (upsert trimestre `demo`, `infoCours`, `groupeCoursActif`, `horaire/groupe Selectionne`, calcul dérivées calendrier/snapshots/indices). Nb de `db.setSync` à faire au toggle ON : **~12**. Nb au toggle OFF : **~10**. Risque : oubli d'une clé dérivée.
- **Option B (redirection pure via `cle()`)** : n'existe pas en réalité. Les lectures passent par `cle()`, donc la redirection fonctionne **automatiquement**, mais les pointeurs `infoCours`/`groupeCoursActif` et les dérivées restent à poser. Se réduit à Option A avec moins de code sur le reste.
- **Option C (abandon)** : accepter le legacy. Coût zéro mais dette de 1070 lignes + pollution globale + bug Phase 1/nettoyage. Phase 4.B/C restent acquises.

**Critère de décision** (à trancher avec Grégoire après Audit 3) :

- Si 3 clés dérivées se recalculent proprement à partir de `demo_*` au toggle ON, **Option A viable** (→ Phase 5 reprend).
- Si la reconstruction des dérivées révèle des dépendances supplémentaires (ex. `seancesCompletes` a besoin d'un horaire précis, `snapshots` a besoin d'un `coursId` normalisé), la dette de reproduction devient significative → **Option C recommandée**.

---

## Audit 3 — Gap analysis `demo_*` Phase 1 vs legacy

### Contenu réel du pack (`js/pack-demo-20.js`)

Pack `PACK_DEMARRAGE` v20.2 (2026-04-22), 1.14 Mo, 14 clés top-level :

`_metadata`, `listeCours`, `cadreCalendrier`, `horaireHebdo`, `groupeEtudiants`, `productions`, `evaluationsSauvegardees`, `grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`, `presences`, **`cartouches_GRILLE1759243306842`**, **`cartouches_GRILLE1759264206489`**, **`cartouches_GRILLE1759529438501`**.

Les 3 grilles du pack ont des IDs `GRILLE1759...` (pas `GRILLE_DEMO`) — chaque grille a sa clé cartouches associée. Les productions du pack référencent exactement ces 3 grilleIds.

### Ce que Phase 1 écrit dans `demo_*` (lecture de `js/demo-namespace.js:68–151`)

10 clés issues directement du pack (`collectionsDuPack`) + 4 clés synthétiques = **14 clés** :

- `demo_listeCours`, `demo_cadreCalendrier`, `demo_horaireHebdo`, `demo_groupeEtudiants`, `demo_productions`, `demo_evaluationsSauvegardees`, `demo_grillesTemplates`, `demo_echellesTemplates`, `demo_modalitesEvaluation`, `demo_presences`
- `demo_trimestres` (construit : `[{id:'demo', actif:false, isDemo:true, auteur:'Labo Codex'}]`)
- `demo_enseignants` (construit : `[ENS_DEMO]`)
- `demo_horaires` (construit : `[HOR_DEMO]` avec schéma complet — séances détaillées)
- `demo_groupesCours` (construit : `[GC_DEMO]` avec `trimestreId:'demo'`, `enseignantId:'ENS_DEMO'`, `horaireId:'HOR_DEMO'`, `pratiqueId:null`)

**Absences notables par rapport au pack** :

- `cartouches_GRILLE1759*` (3 clés) : **non peuplées** en `demo_cartouches_*`. Phase 1 ignore les clés préfixées `cartouches_`. Conséquence : les grilles démo existent dans `demo_grillesTemplates` mais leurs cartouches n'ont pas d'adresse `demo_*` — elles vivent uniquement via le legacy dans les globaux `cartouches_*`.

### Ce que le legacy écrit en plus de Phase 1 (depuis Tables 1 + 2)

**7 catégories additionnelles non couvertes par Phase 1** :

1. Upsert `{id:'demo'}` dans la liste **globale** `trimestres` (Phase 1 écrit seulement `demo_trimestres`).
2. Push isDemo dans **globaux** `listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates` + merge `modalitesEvaluation`.
3. Merge dans `cartouches_*` (3 clés) dans les **globaux**.
4. `demo_planification_mindmap` ← constante `CARTE_DEMO_ALIGNEMENT` embarquée dans `donnees-demo.js` (pas dans le pack).
5. `demo_calendrierComplet` (calculé par `genererCalendrierComplet` à l'activation).
6. `demo_snapshots_<coursId>`, `demo_indicesCP`, `demo_indicesAssiduite*` (calculés par `reconstruireSnapshotsHistoriques` + `calculerTousLesIndices` à l'activation).
7. `demo_horaireSelectionne = 'HOR_DEMO'`, `demo_groupeSelectionne = '0demo'` (pré-sélections sidebar).

### Bug nettoyage cartouches confirmé

`supprimerDonneesGlobalesDemo` (`donnees-demo.js:888–892`) nettoie **seulement `cartouches_GRILLE_DEMO`** (hardcodé). Mais le pack écrit dans `cartouches_GRILLE1759243306842`, `cartouches_GRILLE1759264206489`, `cartouches_GRILLE1759529438501`. **Aucune de ces 3 clés n'est nettoyée au `quitterDemo`** — elles restent dans le storage global avec les items `estDemo:true`.

Atténuation partielle : les grilles démo sont filtrées de `grillesTemplates` (étape 1b Table 3), donc ces cartouches deviennent orphelines — invisibles dans l'UI mais résidentes en storage. Dette silencieuse.

### Table 6 — Gap analysis

Colonnes :
- **Peuplée Phase 1** : oui/non.
- **Peuplée legacy** : oui/non (à `chargerDonneesDemo` ou calculée à `entrerEnDemo`).
- **Lue par (Audit 2)** : module principal + si c'est lu par l'aperçu.
- **Criticité** : impact si manquante pendant une démo active.
- **Décision recommandée** : pour Phase 5 Option A.

| Clé | Phase 1 | Legacy | Lue par | Criticité | Décision Option A |
|---|---|---|---|---|---|
| `demo_listeCours` | ✅ | ✅ | `obtenirDonneesSelonMode` via `cle('listeCours')` ⚠️ | — | Phase 1 suffit. **Note** : `cle('listeCours')` retourne `'listeCours'` (clé globale), donc `demo_listeCours` n'est **jamais lu** aujourd'hui. |
| `demo_cadreCalendrier` | ✅ | ✅ | `genererCalendrierComplet`, `snapshots.js`, `graphiques-progression.js` | Bloquante (calendrier) | Phase 1 suffit. |
| `demo_horaireHebdo` | ✅ | ✅ | `genererCalendrierComplet`, `snapshots.js` | Bloquante | Phase 1 suffit. Auto-regénéré par `genererCalendrierComplet`. |
| `demo_groupeEtudiants` | ✅ | ✅ | `obtenirEtudiantsCoursActif`, `indices.js`, `evaluation.js`, `profil-etudiant.js`, **aperçu** | Bloquante | Phase 1 suffit. |
| `demo_productions` | ✅ | ✅ | `evaluation.js`, `graphiques-progression.js`, **aperçu**, `rythme.js` | Bloquante | Phase 1 suffit. |
| `demo_evaluationsSauvegardees` | ✅ | ✅ | `evaluation.js`, `snapshots.js`, `indices.js`, **aperçu** | Bloquante | Phase 1 suffit. |
| `demo_grillesTemplates` | ✅ | Écrit **aussi** dans global `grillesTemplates` ⚠️ | Formulaires grille, cartouches | — | Phase 1 suffit. **Lecture actuelle** : via `cle('grillesTemplates')` = `'grillesTemplates'` global → Phase 1 ne sert à rien tant que les lecteurs passent par clé globale. |
| `demo_echellesTemplates` | ✅ | Écrit **aussi** dans global | Formulaires échelle | — | Idem. |
| `demo_modalitesEvaluation` | ✅ | Écrit **aussi** dans global (écrasement !) | `tableau-bord-apercu`, `indices.js` | Importante (aperçu) | **Conflit** : Phase 1 écrit `demo_modalitesEvaluation`, legacy écrase le global. Lecteurs passent par `cle('modalitesEvaluation')` = global → `demo_modalitesEvaluation` **jamais lu**. En Option A, il faut soit peupler la globale au toggle ON (comme legacy) soit retirer de `CLES_GLOBALES` pour que `cle()` la namespace. |
| `demo_presences` | ✅ | ✅ | `indices.js`, `saisie-presences.js`, **aperçu** | Bloquante | Phase 1 suffit. |
| `demo_trimestres` | ✅ | ❌ (legacy upsert la **globale** `trimestres`) | **Non lue** (tous les lecteurs passent par `trimestres` global) | — | Inutile en l'état. Utile plus tard si Phase 7 refactore `obtenirTrimestres()` pour fusionner global + demo. |
| `demo_enseignants` | ✅ | ❌ (legacy push dans **globale** `enseignants`) | Dropdown Contexte (lecteurs : global) | — | Inutile en l'état (même raison). |
| `demo_horaires` | ✅ | ✅ (via `fusionnerDonneesDemo` §9 puis `creerGroupeCoursDemoSiNecessaire` à schéma divergent) | `genererCalendrierComplet`, `trimestre-v2.js` | Bloquante (si `trimestreActif='demo'`) | Phase 1 suffit, mais schéma doit correspondre. |
| `demo_groupesCours` | ✅ | ✅ | `obtenirPratiqueActiveGroupeCours`, `trimestre-v2.js` | Bloquante | Phase 1 suffit. |
| `demo_planification_mindmap` | ❌ | ✅ (`CARTE_DEMO_ALIGNEMENT` dans legacy) | Module Planification | Importante (carte mentale démo) | **Gap à combler** : déplacer `CARTE_DEMO_ALIGNEMENT` dans `demo-namespace.js` (note déjà présente l.148–150). |
| `demo_calendrierComplet` | ❌ | ✅ (calculé à `entrerEnDemo` §10 via `genererCalendrierComplet`) | `rythme.js`, `indices.js`, `snapshots.js`, **aperçu**, `graphiques-progression.js` | Bloquante | **À déclencher à l'activation**. Option A : appeler `genererCalendrierComplet()` au toggle ON. Phase 1 enrichi possible mais fragile (calendrier dépend d'une date de début figée). |
| `demo_snapshots_<coursId>` | ❌ | ✅ (calculé via `reconstruireSnapshotsHistoriques`) | `snapshots.js` (`obtenirSnapshots`), `graphiques-progression.js` | Bloquante (graphiques progression) | **À déclencher à l'activation**. Option A : appeler `reconstruireSnapshotsHistoriques()` au toggle ON (potentiellement coûteux, à mesurer). |
| `demo_indicesCP`, `demo_indicesAssiduite`, `demo_indicesAssiduiteDetailles` | ❌ | ✅ (calculés) | `indices.js`, `tableau-bord-apercu.js` (barres A-C-P), `graphiques-progression.js` | Bloquante (barres d'indices de l'aperçu) | **À déclencher à l'activation**. |
| `demo_seancesCompletes` | ❌ | ❌ (legacy n'écrit pas — régénéré via `genererSeancesCompletes` à la volée) | `snapshots.js`, `horaire.js`, `presences-apercu.js` | Importante | Dérivé : `genererSeancesCompletes()` doit être appelable sur données démo. |
| `demo_horaireSelectionne` | ❌ | ✅ (posé à `entrerEnDemo` §9 : `'HOR_DEMO'`) | Section latérale Horaire | Importante (sinon sidebar vide) | **À poser à l'activation** (2 `db.setSync`). |
| `demo_groupeSelectionne` | ❌ | ✅ (posé à `entrerEnDemo` §9 : `'0demo'`) | Dropdown Groupe d'étudiants | Importante | Idem. |
| `demo_indicesEvaluation`, `demo_indicesPatternsRaI` | ❌ | ❌ (calculés éventuellement par modules spécifiques) | `tableau-bord-apercu.js:606`, `evaluation.js` | Basse (valeur par défaut tolérable) | Laisser vide. |
| `demo_interventions`, `demo_portfoliosEleves`, `demo_*Bilan`, `demo_confidentielEtudiants`, `demo_fichiersTravaux`, `demo_annotationsTravaux`, `demo_chronoEvaluations`, `demo_corbeilleFichiers` | ❌ | ❌ | Modules spécifiques (interventions, portfolio, bilan, etc.) | Basse | Laisser vide. |
| `demo_cartouches_GRILLE1759*` (3 clés) | ❌ | ❌ (legacy écrit **globales** `cartouches_*`) | `cartouches.js`, `design-grille.js` | Importante (affichage grilles + niveaux) | **Gap** : pour que les cartouches démo cohabitent sans pollution, il faudrait écrire `demo_cartouches_*` et intercepter `cle()` pour les préfixes `cartouches_`. Sinon accepter pollution globale. |
| **Global** `trimestres` : upsert `{id:'demo',actif:true}` | ❌ | ✅ (Table 2 §6 via `changerTrimestreActif`) | `cle()`, `obtenirTrimestreActif` partout | **Critique** | **À poser à l'activation**. Sans ça, `obtenirTrimestreId()` retourne le trimestre réel → `cle('X')` routerait vers `h2026_X`, pas `demo_X`. Toute l'architecture en dépend. |
| **Global** `trimestreActif = 'demo'` | ❌ | ✅ | `cle()` indirect | Critique | **À poser à l'activation**. |
| **Global** `infoCours` = cours démo | ❌ | ✅ | `obtenirEtudiantsCoursActif`, `obtenirCoursActifId`, 85 call-sites | Critique | **À poser à l'activation**. |
| **Global** `groupeCoursActif` = GC_DEMO | ❌ | ✅ | `obtenirPratiqueActiveGroupeCours`, 24 call-sites | Critique | **À poser à l'activation**. |
| **Global** `modeApplication = 'normal'` | ❌ | ✅ | `modes.js` | Importante (désactive anonymisation) | **À poser à l'activation** (avec snapshot pour restauration). |

### Résumé chiffré Table 6

- **14 clés `demo_*`** peuplées par Phase 1 — dont **4 inutilisées actuellement** (`demo_listeCours`, `demo_grillesTemplates`, `demo_echellesTemplates`, `demo_modalitesEvaluation`, `demo_trimestres`, `demo_enseignants` — lues seulement si les lecteurs passaient par `cle()` sur ces noms, ce qui n'est pas le cas pour `CLES_GLOBALES`).
- **8 clés bloquantes manquantes en Phase 1** : `demo_planification_mindmap`, `demo_calendrierComplet`, `demo_snapshots_<id>`, `demo_indicesCP`, `demo_indicesAssiduite`, `demo_indicesAssiduiteDetailles`, `demo_horaireSelectionne`, `demo_groupeSelectionne`.
- **5 pointeurs globaux critiques à poser à l'activation** : `trimestres` (upsert), `trimestreActif`, `infoCours`, `groupeCoursActif`, `modeApplication`.
- **1 gap subtil** : les 3 `cartouches_*` polluent le global et ne sont pas nettoyés (bug confirmé).

---

## Décision architecturale — recommandation

### Récapitulatif des 3 options en chiffres

**Option A — Reproduction des étapes legacy** :
- Au toggle ON : poser 5 pointeurs globaux + appeler 3 fonctions de calcul (`genererCalendrierComplet`, `reconstruireSnapshotsHistoriques`, `calculerTousLesIndices`) + poser 2 `demo_*Selectionne` = **~10 `db.setSync` + 3 appels de fonction**.
- Au toggle OFF : symétrique (`demo-etat-precedent` → restaurer 5 pointeurs + re-déclencher `changerTrimestreActif` qui régénère calendrier et snapshots du vrai trimestre).
- Gaps à combler dans `demo-namespace.js` : 1 seul (`demo_planification_mindmap`, avec constante à déplacer).
- Retrait `donnees-demo.js` : possible après basculement complet. Le nettoyage générique `db.keys().startsWith('demo_')` disparaît → **bug Phase 1 résolu par construction**.

**Option B — Redirection pure via `cle()`** :
- Équivalent fonctionnel à Option A : les 5 pointeurs doivent quand même être posés ; les 3 calculs dérivés doivent être déclenchés ou Phase 1 enrichie. Aucun avantage net sur Option A, juste une différence cosmétique sur le nom du mécanisme.
- Non retenue.

**Option C — Abandon Phase 5** :
- Garder `donnees-demo.js` (1070 l.) + migration silencieuse des résidus (optionnelle).
- Bug Phase 1 (question 3) persiste → **impose** une correction transitoire : soit retirer `demo-version-installee` dans `supprimerDonneesNamespaceesDemo`, soit rendre `initialiserDemoNamespace` idempotent par présence de clés.
- Pollution des 6 clés globales acceptée. Bug cartouches accepté.
- Phase 4.B/C restent acquises.

### Recommandation : Option A, mais conditionnée

Option A est techniquement à portée (seulement **8 clés dérivées/pointeurs à gérer** au toggle, toutes identifiées), et elle résout proprement le bug Phase 1 de la question 3. Mais trois conditions doivent être remplies pour qu'elle réussisse là où la tentative du 22 avril a échoué :

1. **Découpage très fin** : livrer 5.A = enrichir Phase 1 (ajouter `demo_planification_mindmap`). Valider. 5.B = implémenter toggle ON (poser 5 pointeurs + déclencher 3 calculs). Valider **en testant que l'aperçu se peuple** avant de continuer. 5.C = toggle OFF. 5.D = retrait `donnees-demo.js`. 5.E = migration silencieuse.
2. **Cache-busters systématiques** dans chaque commit modifiant un `.js` référencé.
3. **Test iPad dès 5.B** — pas attendre 5.C.

**Pré-requis à valider avec Grégoire avant de coder** :

- L'appel à `reconstruireSnapshotsHistoriques()` au toggle ON est-il acceptable en termes de latence ? Le legacy le fait déjà aujourd'hui et c'est perçu comme rapide (< 1 s sur 200 évaluations × 20 étudiants). Si oui, pas de blocage.
- Accepte-t-on de laisser les 6 clés globales polluées (`grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`, `cours`, `listeCours`, `cartouches_*`) comme aujourd'hui, avec filtrage par flag `estDemo` ? Sortir ces clés de `CLES_GLOBALES` serait une refonte majeure **hors scope Phase 5**.
- Accepte-t-on de laisser le bug cartouches (3 `cartouches_GRILLE1759*` non nettoyés au `quitterDemo`) tant qu'on n'a pas retiré le legacy ? Après Phase 5, le problème disparaît puisqu'il n'y aura plus de nettoyage asymétrique — on pourra juste ne plus polluer au chargement.

### Si Grégoire valide Option A, plan de découpage proposé

| Sous-phase | Livrable | Critère d'acceptation |
|---|---|---|
| **5.A** | Ajout `demo_planification_mindmap` dans `peuplerNamespace` (const déplacée depuis `donnees-demo.js`) | Carte mentale démo visible dans Planification sans entrer en démo. |
| **5.B** | Réécriture `toggleDemoHandler` → pose 5 pointeurs + appels `genererCalendrierComplet` + `reconstruireSnapshotsHistoriques` + `calculerTousLesIndices` + 2 `db.setSync` sidebar. Affiche bandeau. | **Aperçu peuplé avec données démo (barres A-C-P, compteurs, indices)**. Test iPad+Mac. |
| **5.C** | Réécriture `quitterDemo` → restaure 5 pointeurs depuis snapshot + re-déclenche `changerTrimestreActif(trimestreActifId)`. Retire bandeau. | Sortie propre, aperçu retourne aux données réelles. Test iPad+Mac. |
| **5.D** | Suppression `js/donnees-demo.js` + script tag `index.html`. Retrait références `entrerEnDemo`/`quitterDemo` dans `accueil.js`, `main.js`. Retrait `nettoyerResiduDemo` du boot. | Mode démo continue de fonctionner (déjà géré par 5.B/5.C). Pas de console error. |
| **5.E** | `js/migration-phase5.js` : au 1er boot post-mise-à-jour, nettoyer les résidus `isDemo=true` des globaux (`listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, `cartouches_*`), supprimer `demo-etat-precedent` si présent, supprimer trimestre `demo` de la liste globale si actif=false. Idempotent via flag. | Utilisateurs existants (Grégoire inclus) ne voient plus leurs résidus démo après la mise à jour. |

### Si Option C retenue

Simplement :

- Corriger le bug Phase 1 (question 3) : ajouter `db.removeSync('demo-version-installee')` dans `supprimerDonneesNamespaceesDemo` (`donnees-demo.js:~835`). 1 ligne.
- Corriger le bug cartouches : lister dynamiquement les `cartouches_*` du pack dans `supprimerDonneesGlobalesDemo`. ~10 lignes.
- Documenter dans `docs/PHASE5-ABANDON.md` que le legacy reste la source de vérité.
- Mettre à jour le plan Autonomisation pour marquer Phase 5 « abandonnée, mode démo legacy accepté ».
- Enchaîner sur Phase 6 (docs) et Phase 7 (hooks Plan 2).

---

## Suivi audits

| Audit | État | Notes |
|---|---|---|
| 1.1 Table 1 (écritures legacy) | ✅ Livré | 18 écritures identifiées (6 globales, 11 `demo_*`, 1 flag). |
| 1.2 Table 2 (effets entrerEnDemo) | ✅ Livré | 17 étapes, ~22 écritures storage. |
| 1.3 Table 3 (effets quitterDemo) | ✅ Livré | Symétrie partielle identifiée, 3 dissymétries signalées. |
| Validation intermédiaire Grégoire | ✅ Livré | 4 réponses collectées ; question 3 close (bug Phase 1 confirmé). |
| 2.0 Lecture demo-namespace.js | ✅ Livré | Flag de version bloque re-peuplement après nettoyage legacy. |
| 2.1 Table 4 (lectures trimestre) | ✅ Livré | 35 clés `cle()` + 11 `obtenirDonneesSelonMode`, 807 call-sites cumulés. |
| 2.2 Table 5 (lectures GC actif) | ✅ Livré | 6 helpers (117 call-sites) + lectures directes (85 occurrences). |
| 3 Table 6 (gap `demo_*` vs legacy) | ✅ Livré | 14 clés Phase 1 (dont 6 non lues), 8 gaps bloquants identifiés, bug cartouches confirmé. |
| Décision architecturale | ✅ Recommandation | **Option A conditionnée** (voir section dédiée), découpage 5 sous-phases proposé. En attente validation Grégoire. |

Mise à jour : 24 avril 2026 — fin Audit 3, recommandation finale posée.
