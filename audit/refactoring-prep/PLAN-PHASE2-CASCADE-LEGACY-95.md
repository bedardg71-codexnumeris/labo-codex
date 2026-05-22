# Plan Phase 2 — Cascade de code mort post-retrait blocs legacy 95

> Document de planification pour la **suite** du cleanup Beta 95 legacy : code mort en cascade qui dépend des IDs HTML retirés en Phase 1 (commit `479422c`) et des 19 fonctions JS orphelines retirées en Phase 2 (commit `6b2da4b`), mais n'a pas été nettoyé dans ces deux passes (scope trop large, lecture complète des modules requise).

**Date de création** : 22 mai 2026 (post-cleanup résidus risque commit `c697a29`)
**Statut** : à démarrer
**Effort estimé** : ~3-4 h (lecture complète des 3 modules + retraits en bloc + validation tests)
**Justification** : CLAUDE.md « Stabilité zéro-dette » — un audit qui révèle du code mort doit être nettoyé dans la même session, pas reporté.

**Articulation** :
- `SESSION.md` §1 — sous-section « Prochaine session — chantier dédié modules cours/groupe/trimestre.js cleanup »
- Commits parents : `479422c` (Phase 1 HTML −1314 l.), `6b2da4b` (Phase 2 JS −931 l.), `c697a29` (cleanup résidus risque −139 l.), `128ae0c` (palettes COULEURS −28 l.)

---

## 1. Contexte

La Phase 1 (commit `479422c`) a retiré 7 blocs `reglages-*-legacy` masqués depuis Beta 95 dans `index.html` (apercu, trimestre, cours, horaire, groupe, snapshots, import-export). La Phase 2 (commit `6b2da4b`) a fait suivre en retirant 19 fonctions JS orphelines évidentes.

Mais certaines fonctions JS dépendaient transitivement des IDs HTML retirés sans être directement reliées : elles cherchent un `getElementById('XYZ')` (où XYZ a disparu Phase 1), font un early return, et restent appelées par d'autres fonctions également mortes. Cette chaîne morte profonde n'a pas été nettoyée par scrupule (préservation comportementale, lecture incomplète).

Le présent plan organise le nettoyage en **3 chantiers cohérents**, un par module touché.

---

## 2. Périmètre et audit préliminaire

Audit réalisé sur worktree `Monitorage_v6-cleanup` (commit `128ae0c`, build 0522-1115). Les chiffres sont à valider en début de chantier — les call-sites peuvent avoir bougé.

### 2.1 — `js/cours.js` (1 580 lignes)

**Chaîne morte identifiée par SESSION.md §1** :

| Fonction | Statut audit 22 mai PM | Note |
|---|---|---|
| `afficherFormCours` | **MORT** — 0 caller JS/HTML (sauf commentaire `js/config.js:196`) | Cherche IDs retirés Phase 1 |
| `annulerFormCours` | **MORT** — 0 caller | Idem |
| `sauvegarderCours` | **MORT** — 0 caller (sauf commentaire `js/config.js:197`) | Idem |
| `afficherListeCoursSidebar` | **MORT** — 0 caller | Cherche `getElementById('listeCoursSidebar')` retiré Phase 1 |
| `ouvrirModalBibliothequeCours` | ⚠️ **VIVANT** — caller `index.html:6815` | Bouton dans section `accordeon-cours` Réglages → Cours active |

**Important** : la dette §1 SESSION mentionnait `ouvrirModalBibliothequeCours` comme morte mais l'audit révèle qu'elle est encore branchée sur un bouton visible. **NE PAS retirer** sans valider avec Grégoire que le bouton « Bibliothèque » de Réglages → Cours peut disparaître.

**Fonctions à retirer en chantier 2.1** :
1. `afficherFormCours` (L526-651) + export `window.X` L1559
2. `annulerFormCours` (L653-701) + export L1561
3. `sauvegarderCours` (L703-785) + export L1560
4. `afficherListeCoursSidebar` (à localiser) + export L1569

**Audit cascade** : avant retrait, grep si ces 4 fonctions s'appellent entre elles ou appellent d'autres helpers privés morts. Risque qu'un retrait révèle un 2e niveau de fonctions devenues orphelines (`modifierCours`, `dupliquerCours` etc. peuvent en dépendre).

**Estimation** : ~1 h (lecture L500-1000 + grep cascade + retrait + tests).

---

### 2.2 — `js/groupe.js` (1 190 lignes)

**Chaîne morte identifiée par SESSION.md §1** :

| Fonction | Statut audit 22 mai PM | Note |
|---|---|---|
| `addStudent` (L116) | **MORT** — 0 caller JS/HTML | Querysélecteur `button[data-action="addStudent"]` inexistant depuis Phase 1 |
| `resetFiltreGroupe` (L860) | **MORT** — 0 caller | Idem |

**Fonctions à retirer en chantier 2.2** :
1. `addStudent` (L116-~245) — vérifier la taille exacte
2. `resetFiltreGroupe` (L860-~877) — vérifier la taille exacte

**Audit cascade attendu** : SESSION.md mentionne « + leurs callers internes morts en cascade ». À investiguer en priorité :
- `previewPastedData`, `parseAndPreview`, `confirmImport`, `cancelImport`, `afficherPrevisualisation`, `handleFileImport` — sont-elles encore branchées sur l'UI ?
- `attacherEventListenersEtudiants` (L1075) — ses querySelectors visent quels boutons ?

**Note importante** : `groupe.js` contient `deleteStudent` défini **2 fois** (L957 et L1138) — possible doublon mort à nettoyer dans le même chantier. À vérifier.

**Estimation** : ~1-1.5 h.

---

### 2.3 — `js/trimestre.js` (601 lignes)

**Chaîne morte identifiée par SESSION.md §1** :

| Fonction | Statut audit 22 mai PM | Note |
|---|---|---|
| `chargerCadreCalendrier` | **MORT** — 0 caller hors `initialiserModuleTrimestre` (lui-même no-op) | |
| `chargerEvenementsPrevus` | **MORT** — idem | |
| `chargerEvenementsImprevus` | **MORT** — idem | |
| `migrerEvenementsAvecIDs` | **MORT** — idem | |
| `afficherStatistiquesTrimestre` | **MORT** — 0 caller | Export `window.X` L586 orphelin |
| `supprimerEvenement` | **MORT** — 0 caller | Export L591 orphelin |
| `modifierEvenementEnPlace` | **MORT** — 0 caller | Export L592 orphelin |
| `sauvegarderEditionEnPlace` | **MORT** — 0 caller | Export L593 orphelin |
| `annulerEditionEnPlace` | **MORT** — 0 caller | Export L594 orphelin |
| `majAffichageRepriseEditionEnPlace` | **MORT** — 0 caller | Export L599 orphelin |
| `genererCarteEvenement*` (variantes V1) | **MORT** — `genererCarteEvenementV2` (trimestre-v2-init.js:444) prend le relais | |
| `initialiserModuleTrimestre` | **NO-OP** — early return ligne 149 (cherche `getElementById('debutTrimestre')` qui n'existe plus, seul `v2-debutTrimestre` reste). Encore appelée par `main.js:467` + `navigation.js:250` | |

**Fonctions à PRÉSERVER** (vivantes, exports utilisés) :
- `genererCalendrierComplet` (L583) — appelée par `trimestres.js:344-346`
- `obtenirCalendrierComplet` (L584) — appelée par `snapshots.js:398, 443, 690`
- `obtenirInfosJour` (L585) — appelée par `saisie-presences.js:158-159`

**Stratégie de retrait** :
1. Retirer les 10+ fonctions chaîne événements + 6 exports `window.X`
2. Retirer `initialiserModuleTrimestre` + ses 2 callers (`main.js:467-468` + `navigation.js:250-251`) + export L580
3. **Garder** les 3 fonctions vivantes + leurs exports L583-585

**Estimation** : ~1 h (la cascade est claire, le scope est délimité).

---

## 3. Ordre d'exécution recommandé

Ordre **du plus simple au plus complexe**, validation tests entre chaque commit :

1. **Chantier 2.3 — `trimestre.js`** (~1 h) : périmètre le plus clair, 0 ambiguïté sur les fonctions à garder (3 vivantes documentées).
2. **Chantier 2.1 — `cours.js`** (~1 h) : audit cascade requis mais scope localisé (4 fonctions).
3. **Chantier 2.2 — `groupe.js`** (~1-1.5 h) : audit cascade le plus profond (callers internes morts), doublon `deleteStudent` à clarifier.

**Pourquoi cet ordre** : trimestre.js d'abord parce que `initialiserModuleTrimestre` est appelée depuis `main.js` et `navigation.js` — c'est une opportunité de tester en premier qu'on peut retirer un point d'entrée sans casser le boot. Si ça passe, les chantiers suivants sont plus simples.

---

## 4. Conventions de travail

**Branche** : `cleanup/phase2-cascade-legacy-95` (worktree dédié `Monitorage_v6-phase2cleanup` depuis `main`).

**Commits** : 1 commit par chantier (3 commits total) + 1 commit doc final si mise à jour SESSION.md nécessaire.

**Format message commit** :
```
refactor(legacy-95-cascade): chantier 2.X — retrait code mort cascade <module>

<résumé scope>

- Fonction X retirée (Y lignes) — 0 caller validé
- ...

Tests 85/85 Vitest verts. Build 0522-XXXX (pas de bump beta).
```

**Tests à valider à chaque commit** :
- `cd tests && npm run test:unit` — attendu **85 Vitest verts** (la sentinelle `refactor-profil-etudiant.test.js` ne couvre pas ces modules, mais une régression boot serait visible via `setup.test.js` ou `lint-securite.test.js`).
- Si une régression apparaît, **NE PAS retirer le fix** : investiguer (probable caller manqué dans l'audit), restaurer la fonction si nécessaire.

**Hook pré-push Vitest** : doit rester vert à chaque push.

**Conventions zéro-dette** (CLAUDE.md) :
- Pas d'alias « au cas où ». Pas de wrapper « pour compatibilité ».
- Le retrait inclut TOUS les éléments liés : fonction + exports `window.X` + commentaires références dans autres fichiers.
- Si un export `window.X` retiré est listé dans un fichier de test sentinelle, mettre à jour le test (cf. cas `genererBadgeRisqueProfil` dans commit `c697a29`).

**Audit cascade systématique** : pour chaque fonction retirée, grep son nom dans tout le repo (`js/`, `index.html`, `tests/`, `_archives/` exclus). Si > 0 caller, NE PAS retirer sans investiguer.

---

## 5. Vérifications pré-démarrage

Avant d'attaquer le chantier, exécuter cette check-list (~10 min) :

1. **State du repo** :
   ```bash
   git log --oneline main -5         # HEAD attendu : 128ae0c ou plus récent
   git status                        # branche actuelle ? worktrees ?
   ```

2. **Confirmer que les chiffres du plan §2 sont à jour** :
   ```bash
   grep -c "^function " js/cours.js js/groupe.js js/trimestre.js
   wc -l js/cours.js js/groupe.js js/trimestre.js
   ```

3. **Re-vérifier les 5 callers du tableau §2.1 cours.js** :
   ```bash
   for fn in afficherFormCours annulerFormCours sauvegarderCours \
             afficherListeCoursSidebar ouvrirModalBibliothequeCours; do
       echo "=== $fn ==="
       grep -rnE "\\b$fn\\b" js/ index.html | grep -v _archives | grep -v "js/cours.js"
   done
   ```

4. **Re-vérifier les 3 vivantes du tableau §2.3 trimestre.js** :
   ```bash
   for fn in genererCalendrierComplet obtenirCalendrierComplet obtenirInfosJour; do
       echo "=== $fn ==="
       grep -rnE "\\b$fn\\b" js/ index.html | grep -v _archives | grep -v "js/trimestre.js"
   done
   ```

5. **Baseline tests** :
   ```bash
   cd tests && npm run test:unit
   # Attendu : 85 Vitest verts. Si rouge, investiguer AVANT de commencer.
   ```

Si une vérification révèle une divergence avec ce plan, mettre à jour le tableau du chantier concerné avant de commencer le retrait.

---

## 6. Risques et points d'attention

- **`initialiserModuleTrimestre` est appelée 2 fois au boot** (`main.js:467` + `navigation.js:250`). Retirer la fonction sans retirer les 2 callers casserait avec `ReferenceError` au boot. **Retirer les 3 sites dans le même commit.** Vérifier que `navigation.js` n'est pas dans la liste « Zones protégées » CLAUDE.md → c'est le cas (`navigation.js` est protégé). **Demander validation Grégoire avant de toucher `navigation.js:250-251`.** Alternative : laisser le `if (typeof initialiserModuleTrimestre === 'function')` qui devient simplement faux après retrait — pas de régression boot.

- **`config.js` contient des commentaires** référençant `afficherFormCours` et `sauvegarderCours` (L196-197). Si on retire les fonctions, mettre à jour ces commentaires aussi. `config.js` est protégé → modification commentaire only, pas de logique.

- **Doublon `deleteStudent` dans `groupe.js`** (L957 + L1138) : c'est probablement un doublon mort, mais à investiguer (la 2e définition shadow la 1ère en JS, donc la L957 ne s'exécute jamais). Cleanup opportuniste possible — cohérent avec le scope.

- **Régression silencieuse possible** : si une fonction « morte » est en fait appelée via une string dynamique (`window[nomFonction]`), le grep statique ne la voit pas. Mitigation : tester manuellement la zone Réglages → Cours / Groupe / Trimestre dans l'app après chantier (boot complet + clic sur les 3 sous-sections + ouverture des modales).

- **Préservation comportementale** : ne PAS embarquer de refactor élargi dans ces 3 chantiers. Si une fonction conservée pourrait être simplifiée maintenant que ses callers morts sont retirés, **ne pas le faire** dans ce cycle — ouvrir un chantier dédié.

---

## 7. Mise à jour SESSION.md après livraison

Après les 3 chantiers livrés et mergés :

1. **§1 « Prochaine session — chantier dédié modules cours/groupe/trimestre.js cleanup »** : remplacer par un récap des 3 commits livrés (LOC retirée par module, statut tests).
2. **§5 historique des révisions** : ajouter une ligne avec la date et le résumé.
3. **En-tête §1 Beta/build** : mettre à jour HEAD main + build courant.

---

## 8. Notes futures (hors scope ce plan)

Pendant l'audit cascade, garder l'œil ouvert pour :
- Autres exports `window.X` orphelins ailleurs (notamment dans `horaire.js` après Phase 2)
- Autres palettes/configs orphelines (style `COULEURS.X` mais dans d'autres modules)
- Helpers privés morts révélés par le retrait de leurs callers

Si du code mort hors scope est détecté, **l'inscrire dans BACKLOG.md ou SUIVI-BUGS** plutôt que l'embarquer dans le commit en cours (préserver la cohérence du scope chantier).

---

**Date de création** : 22 mai 2026
**Auteur** : cleanup post-COULEURS palettes (Claude autonome)
**À démarrer** : prochaine session dédiée ou continuité immédiate selon disponibilité.
