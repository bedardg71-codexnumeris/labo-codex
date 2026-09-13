# Module démo & autonomisation — architecture post-Phase 5

**Statut** : à jour au 24 avril 2026 (Beta 99.24).
**Contexte** : livraison complète du Plan 1 Autonomisation. Retrait du legacy `donnees-demo.js` (1070 l.) lors des sous-phases 5.A → 5.E.

---

## 1. Rôle

Fournir un jeu complet de données de démonstration (10 étudiants, 11 productions, 101 évaluations, 313 présences, 3 grilles, 2 échelles, 1 carte mentale d'alignement) publié sous licence **CC BY-NC-SA 4.0** et exposé via un toggle sur l'accueil. Le matériel sert de modèle pédagogique (modélisation → pratique guidée → autonomie) et peut être dupliqué par l'utilisateur pour devenir la base de ses propres documents, avec attribution « Inspiré de » conservée automatiquement.

---

## 2. Fichiers

| Fichier | Rôle |
|---|---|
| `js/pack-demo-10.js` | Pack de données démo (`PACK_DEMARRAGE`) — 0,63 Mo (10 élèves depuis #852), 16 clés top-level. Lazy-loadé par `demo-namespace.js`. |
| `js/demo-namespace.js` | Phase 1 : peuple `demo_*` en permanence au boot (idempotent via flag `demo-version-installee`). Contient aussi la constante `CARTE_DEMO_ALIGNEMENT`. |
| `js/demo-activation.js` | Phases 5.B/5.C/5.D/5.E : pilote le toggle de l'accueil. Seule source de vérité pour l'activation/désactivation. |

Le legacy `js/donnees-demo.js` a été supprimé en 5.D. Aucun code ailleurs ne doit plus s'y référer.

---

## 3. Namespace `demo_*`

Toutes les collections démo sont préfixées `demo_` pour coexister avec les trimestres réels (`h2026_*`, `a2025_*`). `cle('X')` de `trimestres.js` retourne `'demo_X'` quand `trimestreActif === 'demo'`, donc toutes les lectures existantes (`obtenirDonneesSelonMode`, `obtenirEtudiantsCoursActif`, etc.) fonctionnent sans modification.

**14 clés peuplées par Phase 1** (`peuplerNamespace` dans `demo-namespace.js`) :

Collections directes du pack : `demo_listeCours`, `demo_cadreCalendrier`, `demo_horaireHebdo`, `demo_groupeEtudiants`, `demo_productions`, `demo_evaluationsSauvegardees`, `demo_grillesTemplates`, `demo_echellesTemplates`, `demo_modalitesEvaluation`.

Avec conversion : `demo_presences` (le pack stocke un objet `{date:{da:data}}` — `peuplerNamespace` convertit en tableau `[{date,da,...}]` attendu par tous les lecteurs).

Synthétiques : `demo_trimestres` (entrée `{id:'demo', actif:false, isDemo:true, auteur:'Labo Codex'}`), `demo_enseignants` (ENS_DEMO Primo Primavera), `demo_horaires` (HOR_DEMO Lun-AM / Mer-PM), `demo_groupesCours` (GC_DEMO).

Plus : `demo_planification_mindmap` (`CARTE_DEMO_ALIGNEMENT`, 17 nœuds + 14 liens).

**Clés non peuplées par Phase 1** : `demo_calendrierComplet`, `demo_snapshots_<coursId>`, `demo_indicesCP`, `demo_indicesAssiduite`, `demo_indicesAssiduiteDetailles`, `demo_horaireSelectionne`, `demo_groupeSelectionne`. Ces clés sont **dérivées** — elles sont calculées par `activerModeDemo` au toggle ON à partir des clés précédentes.

---

## 4. Cycle d'activation / désactivation

### Au boot (`main.js`)

1. `initialiserBandeauDemoSiActif()` — si `demo-actif === 'true'` (rechargement en démo), ré-affiche le bandeau vert. **Ne fait aucun nettoyage** (le nettoyage automatique du legacy était la cause du bug Q3).
2. `migrerResidusPhase5()` — migration one-shot des résidus legacy (items `isDemo`/`estDemo` dans les globaux, trimestre `demo` orphelin). Idempotent via flag `migration-phase5-done`. Skippée si `demo-actif === 'true'`.
3. `initialiserDemoNamespace()` — Phase 1 peuple `demo_*` si flag `demo-version-installee` différent de la version du pack.

### Au cochage (`activerModeDemo`, 15 étapes)

1. Guard résidu : si `demo-actif === 'true'` sans bandeau, reset.
2. Snapshot état utilisateur dans `demo-etat-precedent` (trimestres, listeCours, cours, enseignants, grillesTemplates, echellesTemplates, infoCours, groupeCoursActif, modeApplication, modalitesEvaluation, trimestreActifId).
3. `demo-actif = 'true'`.
4. Upsert trimestre `{id:'demo', actif:true, isDemo:true}` dans la liste globale `trimestres`. Tous les autres trimestres passent à `actif:false`. `trimestreActif = 'demo'`.
5. `fusionnerDemoVersGlobaux()` — fusion des données démo vers les 6 clés globales polluées par convention (`listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`) + les 3 `cartouches_*` listées dynamiquement depuis `PACK_DEMARRAGE`.
6. `infoCours = demo_listeCours[0]` (= cours démo).
7. `groupeCoursActif = GC_DEMO` (depuis `demo_groupesCours`).
8. Pré-sélections sidebar : `demo_horaireSelectionne = 'HOR_DEMO'`, `demo_groupeSelectionne = '0demo'`.
9. `modeApplication = 'normal'` + `initialiserSystemeModes()`.
10. `genererCalendrierComplet()` → écrit `demo_calendrierComplet`.
11. `await reconstruireSnapshotsHistoriques()` → écrit `demo_snapshots_<coursId>`.
12. `calculerEtSauvegarderIndicesAssiduite()` → écrit `demo_indicesAssiduite` + cascade vers `demo_indicesCP` via `portfolio.js`.
13. `afficherBandeauDemo(true)` — bandeau vert + classe `.mode-demo` sur body.
14. `peuplerDropdownGroupeCoursActif()` — header refresh.
15. `afficherSection('apercu')` + `rafraichirContenuSelonMode()`.

### Au décochage (`desactiverModeDemo`, 9 étapes)

1. Lecture du snapshot `demo-etat-precedent`.
2. `retirerItemsDemoDesGlobaux()` — filtre `isDemo`/`estDemo` des 6 globaux (listeCours, cours, enseignants, grillesTemplates, echellesTemplates) et des `cartouches_*` (listées dynamiquement depuis `PACK_DEMARRAGE`).
3. Retrait de `{id:'demo'}` de la liste globale `trimestres`.
4. `await changerTrimestreActif(etat.trimestreActifId)` — restaure le trimestre réel précédent et régénère son calendrier. Reset `infoCours`/`groupeCoursActif` à null.
5. Restauration des pointeurs depuis snapshot : `infoCours`, `groupeCoursActif`, `modalitesEvaluation`, `modeApplication`.
6. `demo-actif = null`, `demo-etat-precedent` supprimé. **Les clés `demo_*` restent intactes.**
7. `afficherBandeauDemo(false)` + `retirerGuidageDemo()`.
8. `initialiserSystemeModes()` + `peuplerDropdownGroupeCoursActif()`.
9. `afficherSection('accueil')` + `rafraichirContenuSelonMode()`.

---

## 5. Helpers utilisateur exposés

| Fichier | Fonction | Rôle |
|---|---|---|
| `js/bibliotheque-ui.js` | `estItemDemo(item)` | Détection via flag `isDemo` ou auteur `Labo Codex`. |
| `js/bibliotheque-ui.js` | `formaterInspireDe(item)` | Retourne « Inspiré de X par Y ». |
| `js/bibliotheque-ui.js` | `forkerItem(source, prefixeId)` | Clone profond avec `inspireDe` (Phase 4.B). |
| `js/bibliotheque-ui.js` | `appliquerModeLectureSeuleDemo(conteneur, item, action, label, texte)` | Formulaire démo en lecture seule + bouton « Dupliquer ». |
| `js/bibliotheque-ui.js` | `verifierReferencesPasDemo(references)` | Garde au save : refuse les références mixtes. |
| `js/bibliotheque-ui.js` | `ajouterOptgroupDemo(select, items, labeler, titreOptgroup)` | Sélecteurs à 2 sections (Phase 2). |
| `js/cc-license.js` | `obtenirIdentiteCCUtilisateur()` | Nom de l'utilisateur pour attribution (Phase 4.A). Distinct de `obtenirNomEnseignantActif` (usage PDF). |

---

## 6. Contrat avec le reste du code

- **Jamais d'écriture directe dans `demo_*` depuis un autre module** — seul `demo-namespace.js` (Phase 1) et `demo-activation.js` ont ce droit.
- **Jamais de référence directe à `entrerEnDemo`, `quitterDemo`, `nettoyerResiduDemo`, etc.** — ces fonctions n'existent plus depuis 5.D.
- **Le toggle de l'accueil** (`data-on-change="toggleDemoHandler"`) appelle `toggleDemoHandler` dans `accueil.js`, qui route vers `activerModeDemo` / `desactiverModeDemo`.
- **Le bouton « Quitter la démo »** du bandeau (`data-action="desactiverModeDemo"`) appelle directement `desactiverModeDemo` via le dispatcher de `main.js`.

---

## 7. Préservation des données utilisateur

Le cycle toggle ON/OFF est **non destructif** pour les trimestres réels. Le snapshot `demo-etat-precedent` capture tout l'état altéré par le toggle ON (5 pointeurs + 6 globaux) et le restaure fidèlement au toggle OFF. Les écritures de snapshot, d'activation et de désactivation utilisent `db.setSync` qui fait un fallback vers memoryCache + IndexedDB quand localStorage est saturé.

---

## 8. Pour déboguer

**Vérifier l'état démo** en console :

```js
db.getSync('demo-actif', null)                     // 'true' en démo, null sinon
db.getSync('trimestreActif', null)                 // 'demo' en démo
db.getSync('infoCours', null)                      // cours démo en démo, cours réel sinon
db.getSync('groupeCoursActif', null).id            // 'GC_DEMO' en démo
db.getSync('demo_groupeEtudiants', []).length      // doit être 10 (toujours, depuis #852)
db.getSync('demo_presences', []).length            // doit être 313 (toujours, depuis #852)
Array.isArray(db.getSync('demo_presences'))        // doit être true
db.getSync('migration-phase5-done', null)          // '1' après le premier boot post-5.E
```

**Forcer un re-peuplement Phase 1** (rare, en cas de divergence) :

```js
localStorage.removeItem('demo-version-installee');
location.reload();
// Au boot, Phase 1 re-peuple demo_*
```

---

## 9. Références

- Audit complet avant la 2e tentative : `docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md` (6 tables, 807 call-sites mappés).
- Parcours & tests : `docs/PHASE5-PARCOURS-TESTS.md` (6 parcours, 22 critères).
- Plan source : `plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md`.
- Post-mortem 1re tentative : `docs/POST-MORTEM-PHASE5-22-AVRIL.md`.
- Cadrage Plan 2 (partage CC) : `docs/HOOKS-PLAN2.md`.
