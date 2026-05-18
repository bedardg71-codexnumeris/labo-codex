<!-- =====================================================================
     IDENTIFICATION DE CE FICHIER  (ajouté 17 mai 2026)
     Le projet contient désormais 4 fichiers `SESSION.md` distincts (le worktree
     `Monitorage_v6-profil-etudiant` est créé ce soir). Ils vivent dans des
     emplacements / branches différents et couvrent des sujets séparés.
     Ne pas confondre.
     ===================================================================== -->

> **📌 Identification**
> - **Chemin** : `Monitorage_v6-profil-etudiant/SESSION.md` (worktree)
> - **Branche** : `refactor/profil-etudiant`
> - **Rôle** : session courante du chantier **refactor profil-etudiant.js** (productions.js et trimestre-v2.js TERMINÉS, mergés FF)
>
> **Les trois autres `SESSION.md` du projet** (chemins distincts, à ne pas confondre) :
> - `Monitorage_v6/SESSION.md` sur branche `audit/2026-mai` — récap historique de la branche principale (legacy 16 mai).
> - `Monitorage_v6/audit/SESSION.md` sur branche `audit/2026-mai` — session **audit annuel** Phase 3 (sujet distinct : audit de fidélité concept → implémentation).
> - `Monitorage_v6-refactor/SESSION.md` sur branche `refactor/trimestre-v2` — récap historique du chantier trimestre-v2 (mergé FF sur main, branche à supprimer après push).

# SESSION — État au 18 mai 2026 (refactor profil-etudiant.js — sessions A+B+C+D LIVRÉES + validation Grégoire ✅ — PRÊT à merger)

**Date** : 17 mai soir + 18 mai 00:30 (sessions 0+1+2 + A) + 18 mai matin (sessions B + C + D + capitalisation §7)
**Beta / build** : 99.48 / 0518-0540
**Branche actuelle du worktree** : `refactor/profil-etudiant`
**Dernier commit** : `685aaf1` — rétrospective §7 stand-by (capitalisation METHODE-REFACTORING)
**Branche `main`** : `0e8e0f8` — pushée à origin ✅ (merge FF à effectuer maintenant — cf. étape 6 instructions ci-dessous)
**Statut chantier profil-etudiant.js** :
- **Étape 0** : worktree + symlinks + baseline 73/73 ✅ (17 mai soir)
- **Étape 1** : lecture intégrale + audit ESLint + Agent Explore — **TERMINÉE** (commit `52ae385`). 11 écarts MODULES-MAP §2.3.
- **Étape 2** : tests régression Vitest 5 + Playwright 2 — **TERMINÉE** (commit `56c0978`). 80/80 verts.
- **Étape 3 session A LOW** : 3 sous-modules extraits — **TERMINÉE** (`d9c6793` helpers + `cd70c9d` calculs + `d5013d9` rapport + `590ea89` bump 99.48). Résidu 8818 → 6337 LOC (-28,1 %). 37 fonctions promues window.X.
- **Étape 3 session B MEDIUM** : 2 sous-modules extraits — **TERMINÉE** (`fc9415b` diagnostics + `e2613b1` confidentiel + `ac0eb85` bump). Résidu 6337 → 5207 LOC (-17,8 % session B, -40,9 % cumulé). 19 fonctions promues window.X.
- **Étape 3 session C HIGH partie 1** : 1 sous-module extrait — **TERMINÉE** (`27d3c17` actions + `a02a564` bump). Résidu 5207 → 4641 LOC (-10,9 % session C, -47,4 % cumulé). 8 fonctions promues window.X.
- **Étape 3 session D HIGH partie 2** : renommage profil-etudiant.js → sections-affichage.js — **TERMINÉE** (`7b37363`). 4642 LOC inchangées, 38 fonctions + 3 variables module-scope encapsulées.
- **Étape 4** : éclatement `afficherProfilComplet` cyc 58 → < 30 — **TERMINÉE PARTIELLEMENT** (`d119446`). 5 helpers privés extraits + cible dure cyc ≤ 30 atteinte sur la fonction principale. **5 fonctions cyc > 30 documentées comme héritages à traiter Catégorie B post-merge** (décision Grégoire 18 mai 2026).
- **Étape 5** : validation manuelle Grégoire Safari Mac — **✅ OK 18 mai 2026** (warning `conception-carte` navigation.js:563 pré-existant, non lié au refactor — fichier protégé non touché).
- **Étape 6** : merge FF refactor/profil-etudiant → main + push — **PRÊT À EXÉCUTER** (instructions ci-dessous).
- **Capitalisation §7 METHODE-REFACTORING** : pré-écrite stand-by (`685aaf1` — 6 propositions Catégorie B + 10 notes pour evaluation.js). Mergera avec le reste.

**Tests** : 70 Vitest + 10 Playwright = **80/80 verts** (confirmés post-bump session D + post-rétrospective §7).

**Commits non-pushés** : 9 commits session B+C+D + capitalisation §7 (de `fc9415b` diagnostics à `685aaf1` rétrospective METHODE).

**Action en attente côté Grégoire** :
1. **Merge FF + push** (instructions étape 6 ci-dessous, exécutable maintenant).
2. Optionnel : créer tag `refactor-profil-etudiant-2026-05-18`.

## Récap session D (18 mai matin — renommage + éclatement afficherProfilComplet)

| Opération | Détails | Commit |
|---|---|---|
| Renommage extraction unique | `profil-etudiant.js` (4642 LOC, IIFE complet) → `profil-etudiant-sections-affichage.js`. 38 fonctions + 3 variables module-scope encapsulées. 0 LOC modifiée (juste nom de fichier + en-tête réécrit). | `7b37363` |
| Éclatement `afficherProfilComplet` cyc 58 → < 30 | 5 helpers privés extraits : `_resoudreEtudiantProfil` + `_recalculerIndicesACPSiPossible` + `_calculerIndicesDualPourProfil` + `_resoudreSectionContenu` + `_postRendreProfilSection`. Atomicité dual-write état pivot préservée. Bug latent #106 préservé. | `d119446` |

**Bilan cumulé chantier profil-etudiant.js (sessions A+B+C+D, Étape 3 + Étape 4 partielle)** :
- profil-etudiant.js d'origine : **8 818 LOC monolithique** → **7 sous-modules autonomes** (8 818 LOC linéaires → 9 052 LOC distribuées, le surplus = IIFE wrappers + headers commentaires + exports)
- profil-etudiant.js : **renommé**, plus de "résidu central"
- **102 fonctions** extraites / réparties dans les 7 sous-modules + 5 helpers privés étape 4
- **Cible dure cyc ≤ 30 atteinte sur afficherProfilComplet** (le monstre central, cyc 58 → < 30)
- **5 fonctions cyc > 30 héritées documentées** (à traiter cycle dédié Catégorie B post-merge)

**Bugs latents préservés** (préservation comportementale stricte) :
- SUIVI-BUGS #105 : `chargerProfilEtudiant` dead code dans sauvegarderConfidentiel (session B)
- SUIVI-BUGS #106 : branche manquante `progression && progressionVisible` dans afficherProfilComplet (session D étape 4, helper `_resoudreSectionContenu`)

**Trouvailles notables session D (mémoires candidate)** :
1. **Renommage > extraction sed** : quand le résidu est DÉJÀ un IIFE complet englobant l'intégralité de la zone à extraire, le renommage `git mv` est l'opération la plus sûre — 0 LOC de code modifié, juste nom de fichier + en-tête. Pattern session D refactor profil-etudiant (résidu 4642 LOC déjà IIFE complet → renommage trivial vs sed delete + reconstruction risquée).
2. **Stratégie pragmatique cyc > 30 héritages** : pattern productions / trimestre-v2 confirmé sur profil-etudiant — éclater le monstre central (afficherProfilComplet 58), documenter les autres fonctions cyc > 30 comme « héritages à traiter Catégorie B post-merge ». Évite les manipulations risquées sur 200-700 LOC chacune sans validation intermédiaire. Décision pragmatique vs cible dure METHODE.
3. **Bug latent détecté pendant l'éclatement de l'orchestrateur** : la chaîne if/else if de afficherProfilComplet pour résoudre la section affichée manquait une branche. Détection par lecture systématique avant éclatement. Préservation stricte → inscription SUIVI-BUGS #106 avec commentaire explicite dans le helper (`Bug latent #106 : pas de cas...`).

## Étape 5 — Validation manuelle Grégoire (EN ATTENTE, à valider Safari Mac sombre + clair)

5-6 cas d'intégration à tester avec un trimestre réel :

1. **Sélection d'un étudiant** depuis la liste (cours actif). Vérifier l'affichage du profil complet :
   - Sidebar : sélecteur étudiant + Préc./Suiv. + carte info étudiant + navigation sections
   - Zone principale : section "Productions et évaluations" par défaut + bandeau contexte
   - Pas d'erreur console (DevTools).

2. **Changement de section dans la sidebar** (Productions → Engagement ACP → Progression → Développement habiletés → Accompagnement → Travaux soumis → Rapport). Vérifier que chaque section affiche son contenu approprié + post-rendu (graphiques Chart.js sur Progression).

3. **Navigation Précédent/Suivant** : passer d'un étudiant à l'autre, vérifier que la section active est préservée (`sectionProfilActive` mémorisée).

4. **Actions cascade `consulterEvaluation`** (clic sur ligne d'évaluation dans Productions) : ouvre la visionneuse en mode évaluer, timer T+200ms. Vérifier pas de race condition sur clics rapides.

5. **Modal confidentiel** : ouvrir, sauvegarder des notes de présences + cocher services adaptés + sous-catégorie médicale. Fermer + rouvrir → données persistées. Badge ● vert sur le bouton Confidentiel quand des infos existent.

6. **Rapport** : aller dans la section Rapport, vérifier la génération + le bouton Copier. Tester en mode comparatif SOM/PAN si configuré.

**Cibles plateformes** : Safari Mac (obligatoire — Cmd+Q pour invalider le cache file://), mode sombre + clair. iPad Air optionnel.

**Si bug** : inscrire SUIVI-BUGS, corriger sur `refactor/profil-etudiant` (nouveau commit), re-tester.

**Si OK** : Étape 6 — merge FF + push (instructions ci-dessous).

## Récap session C (18 mai matin — 1 sous-module HIGH partie 1)

| Sous-module | LOC | Fonctions | Cyc > 30 | Commit |
|---|---:|---:|---:|---|
| `profil-etudiant-actions.js` | 600 | 8 (cascade consulterEvaluation + CRUD évaluations + jetons + patterns groupe) | 1 (calculerDetailsNoteFinale 57, hérité) | `27d3c17` |

**Bilan résidu profil-etudiant.js** : 5207 → 4641 LOC (**-10,9 %**). Cumulé depuis l'initial : 8818 → 4641 LOC (**-47,4 %**).

**Timers cascade préservés** (atomicité critique race guard) :
- `window._consulterEvalTimerId` (clearTimeout/setTimeout T+200ms)
- `window._apresOuvertureFichier` (callback post-ouverture fichier)

**4 exports critiques cross-fichier conservés** (consommateurs documentés dans header sous-module) :
- consulterEvaluation : evaluation.js, travaux-ui.js
- evaluerProduction : evaluation.js, liste-evaluations.js
- calculerDetailsNoteFinale : portfolio.js, synthese-retroaction-data.js (FIX #37 Beta 96)
- calculerEtStockerPatternsGroupe + obtenirPatternEtudiant : tableau-bord-apercu.js

**Export `calculerDirectionsCriteres` re-localisé** : la fonction reste dans le résidu (zone Sections affichage L2003 selon MODULES-MAP §2.3 sous-module #6) mais son `window.X = X` était dans la zone extraite L5032. Solution : déplacer l'export vers les exports résiduels (L4624 nouveau résidu).

**3 doublons orphelins nettoyés post-extraction** (sed delete + commentaires pointer) :
- L4623 originale `window.calculerDetailsNoteFinale` → commentaire pointer vers actions.js
- L4631 originale `window.consulterEvaluation` → commentaire pointer
- L4632 originale `window.evaluerProduction` → commentaire pointer

**Trouvailles notables session C (mémoire candidate)** :
1. **Export window.X reste résidu quand la fonction reste résidu** : `calculerDirectionsCriteres` est définie L2003 (résidu) mais son export window.X était dans la zone extraite L5032. Réflexe : pré-extraction, identifier les exports window.X dont la fonction NE migre PAS, et les sortir du contenu extrait (sed delete ciblé) puis les rajouter manuellement dans le résidu.
2. **Doublons d'export post-extraction** : 3 lignes `window.X = X` dans la zone exports résiduelle (L4623, 4631, 4632) pointaient vers des fonctions qui migrent vers le sous-module. Sans nettoyage, le résidu plante en `ReferenceError` au chargement IIFE. Pattern : grep `^window\.<noms_extraits>\s*=` dans le résidu APRÈS sed delete, retirer ou commenter.
3. **Timers cascade globaux `window._X`** : pas de migration nécessaire — déjà sur `window` (pas de variable module-scope `let _consulterEvalTimerId`). Conservation comportementale automatique.

## Récap session B (18 mai matin — 2 sous-modules MEDIUM extraits)

| Sous-module | LOC | Fonctions | Cyc > 30 | Commit |
|---|---:|---:|---:|---|
| `profil-etudiant-diagnostics.js` | 865 | 11 (diagnostics SRPNF/Critères + blocs RLO + onglets) | 0 | `fc9415b` |
| `profil-etudiant-confidentiel.js` | 330 | 8 (modal PII + services adaptés + sous-catégories médicales) | 0 | `e2613b1` |
| **Total extrait session B** | **1195** | **19** | **0** | |

**Bilan résidu profil-etudiant.js** : 6337 → 5207 LOC (**-17,8 %**). Cumulé depuis l'initial : 8818 → 5207 LOC (**-40,9 %**).

**Audit ESLint complexity post-session B** : aucune nouvelle fonction cyc > 30 introduite. 6 fonctions cyc > 30 héritées dans le résidu (à éclater étapes 4 sessions C+D) : `afficherProfilComplet` 58, `genererSectionMobilisationEngagement` 52, `genererSectionPerformance` 47, `calculerDetailsNoteFinale` 57, 2 arrow functions 36+34. + 2 dans `calculs.js` (`calculerIPB` 36, `determinerCibleIntervention` 58).

**Conformité SKILL_Securite_donnees.md** (zone confidentiel risque ÉLEVÉ PII) :
- Variables module-scope encapsulées dans l'IIFE (`_confidentielDaActuel`, `SOUS_CATEGORIES_SERVICES`) — pas de fuite cross-module.
- Préservation comportementale stricte : pas de migration `escapeHtml` local → `echapperHtml` canonique, échappement existant conservé.
- 1 acquittement `// security-ok` inline sur `innerHTML` re-flagué baseline F.16 hook Défense J (transfert refactor neutre, valeurs statiques + `echapperHtml()` défense profondeur).

**Bug latent détecté et préservé** (SUIVI-BUGS #105) :
- `sauvegarderConfidentiel` appelle `chargerProfilEtudiant()` derrière un `typeof === 'function'` guard, mais cette fonction n'est définie nulle part dans le codebase. La branche est dead → le rechargement post-sauvegarde n'arrive jamais (le badge confidentiel se met à jour au prochain affichage manuel du profil). Préservation comportementale stricte du refactor.

**Trouvailles notables session B (mémoire candidate)** :
1. **Hook Défense J `// security-ok` inline obligatoire** : le commentaire d'acquittement DOIT être sur la même ligne que l'`innerHTML` (en fin de ligne), PAS en commentaire de bloc avant. Un bloc 3 lignes au-dessus ne suffit pas — le hook re-flague. Pattern réutilisable pour les futurs refactors avec transferts XSS innerHTML.
2. **Re-flag baseline F.16 par fichier** : la baseline du hook Défense J est par fichier, pas globale. Toute extraction de zone contenant `innerHTML` avec interpolation déclenche un nouveau flag dans le sous-module. Réflexe : acquitter au commit, ne pas chercher à éviter le re-flag.
3. **Variables module-scope encapsulées via IIFE** : `_confidentielDaActuel` + `SOUS_CATEGORIES_SERVICES` migrent SANS promotion `window.X` (variables privées). Différent du pattern « tous window.X » pour les fonctions. La consigne d'encapsulation reste : préserver l'accessibilité d'origine (était module-scope dans le résidu, reste module-scope dans le sous-module).

---

## Étape 6 — Merge FF + push (validation Grégoire CONFIRMÉE 18 mai 2026, prêt à exécuter)

**Validation Safari Mac Grégoire** : ✅ OK 18 mai 2026.
**Warning détecté sur page d'accueil** (`navigation.js:563 — "conception-carte"`) : **pré-existant**, lié au module Alignement/carte mentale, **non lié au refactor profil-etudiant**. Fichier `navigation.js` protégé (non modifié pendant le refactor). À ignorer pour le merge.

Capitalisation §7 METHODE déjà faite (commit `685aaf1` 18 mai stand-by — 6 propositions Catégorie B + 10 notes pour evaluation.js).

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6-profil-etudiant

# Vérification rapide :
git log --oneline @{u}..HEAD          # 9 commits non-pushés depuis 2b118c7 (fc9415b diag → 685aaf1 rétro §7)
git status                             # propre (hors node_modules symlinks)
cat version.json                       # {"build":"0518-0540","beta":"99.48"}
cd tests && npm test                   # 80/80 verts attendus

# Bump optionnel pour marquer le merge (refresh build → 99.49 si Grégoire préfère
# marquer une version majeure de consolidation, sinon refresh build courant).

# Merge FF refactor/profil-etudiant → main (depuis ce worktree, sans toucher au
# checkout Monitorage_v6 sur audit/2026-mai) :
git fetch origin
git update-ref refs/heads/main refs/heads/refactor/profil-etudiant

# Vérification post-merge :
git rev-parse main                     # doit retourner HEAD profil-etudiant (685aaf1 ou bump postérieur)
git log --oneline main -3              # voir le commit merge en tête

# Push depuis la maison (réseau école bloque GitHub) :
git push origin main refactor/profil-etudiant

# Optionnel après push : supprimer la branche refactor (traçabilité préservée via main) :
# git push origin --delete refactor/profil-etudiant
# git branch -d refactor/profil-etudiant

# Optionnel : créer un tag pour marquer le commit de merge :
# git tag -a refactor-profil-etudiant-2026-05-18 -m "Refactor profil-etudiant.js livré (7 sous-modules, 102 fonctions, afficherProfilComplet cyc 58 → < 30)"
# git push origin refactor-profil-etudiant-2026-05-18
```

### Cycle Catégorie B post-merge — 5 fonctions cyc > 30 héritages à éclater

Pattern productions / trimestre-v2 : ces fonctions héritées du god module sont préservées
comportementalement, à éclater dans un cycle dédié post-merge (PR ou worktree
`bugfix/cyc-superieur-30-profil-etudiant`).

| Fonction | Cyc | Fichier | LOC |
|---|---:|---|---:|
| afficherProfilComplet | < 30 | sections-affichage.js | ✅ traité étape 4 session D |
| genererSectionMobilisationEngagement | 52 | sections-affichage.js | ~730 |
| genererSectionPerformance | 47 | sections-affichage.js | ~615 |
| calculerDetailsNoteFinale | 57 | actions.js | ~287 |
| determinerCibleIntervention | 58 | calculs.js | ~200 |
| calculerIPB | 36 | calculs.js | ~150 |

+ traiter SUIVI-BUGS #105 (chargerProfilEtudiant dead code) + #106 (progression && progressionVisible branche manquante).

### Chantier suivant : refactor `evaluation.js` (dernier god module)

- 7 348 LOC
- Effort estimé : ~6-8 h (PLAN-MOYEN-TERME §4.5)
- Tendance : peut-être encore plus complexe (IDME × SRPNF × algo notation)
- Branche : `refactor/evaluation` (worktree dédié)
- Méthode : appliquer PARFAITEMENT le pattern productions/trimestre-v2/profil-etudiant
  (préparation → extraction sous-modules → réduction complexité → validation → merge)

## Récap session A — 18 mai 2026 (3 sous-modules LOW extraits)

| Sous-module | LOC | Fonctions | Cyc > 30 | Commit |
|---|---:|---:|---:|---|
| `profil-etudiant-helpers.js` | 630 | 16 (helpers + badges + interprétations indices) | 0 | `d9c6793` |
| `profil-etudiant-calculs.js` | 1547 | 14 (conversion IDME + moyennes + IPB + RàI + cibles) | 2 (calculerIPB 36, determinerCibleIntervention 58) | `cd70c9d` |
| `profil-etudiant-rapport.js` | 426 | 7 (rapport API + préférences) | 0 | `d5013d9` |
| **Total extrait** | **2603** | **37** | **2** | |

**Bilan résidu profil-etudiant.js** : 8818 → 6337 LOC (**-28,1 %**). 26 exports résiduels (vs 36 initial — 10 doublons commentés avec pointer vers sous-modules).

**Audit ESLint complexity post-session A** :
- Résidu : 6 fonctions cyc > 30 (vs 8 initial, -2 passées dans calculs.js)
- helpers.js : 0 fonctions cyc > 30
- calculs.js : 2 fonctions cyc > 30 héritées (à éclater étape 4 session D)
- rapport.js : 0 fonctions cyc > 30

**Patterns confirmés** :
- Promotion `window.X` systématique des 37 fonctions extraites (décision étape 1 b)
- 10 doublons d'export pré-existants commentés dans le résidu (préservation contexte historique)
- 0 doublons orphelins post-extraction (audit grep complet)
- Appels privés résiduels (`obtenirTermeProduction()`, `calculerMoyennesCriteres()`, `genererEtAfficherRapport()`, etc.) fonctionnent via chaîne de scope global — pattern trimestre-v2 confirmé
- Helper `chargerScript(path, stubs, fauxWindowExistant)` éprouvé sur 4 sous-modules dans le même sandbox

## Récap étape 1 — profil-etudiant.js (17 mai soir)

**Métriques** : 8 818 LOC, 105 fonctions, 36 exports `window.X` (vs 24 annoncés MODULES-MAP §2.3, +50 %), 7 zones fonctionnelles confirmées.

**11 écarts documentés** dans `audit/refactoring-prep/MODULES-MAP.md §2.3` « Écarts observés à l'exécution » :

1. **Découpage 7 sous-modules validé à ~100 %** — frontières correspondent au prévisionnel. `profil-etudiant-sections-affichage.js` reste géant (~3 700 LOC), éclatement plus poussé reporté post-merge.
2. **8 fonctions cyc > 30** : `afficherProfilComplet` 58, `determinerCibleIntervention` 58, `calculerDetailsNoteFinale` 57, `genererSectionMobilisationEngagement` 52, `genererSectionPerformance` 47, `calculerIPB` 36, 2 arrow functions 36+34. **Pas de monstre cyc 80-100** (max 58, contre 94 pour trimestre-v2).
3. **36 exports `window.X`** (vs 24 prévus) — dispersés en 5 zones du fichier (L2362, 6440, 7385-7386, 8335-8345, 8408-8409, 8703-8708, 8797-8816).
4. **Pas de hub résiduel** comparable à `populerDropdownsAssemblageV2` — plutôt 11 helpers internes candidats à promotion `window.X` (interpreterMobilisation/Performance/Completion/Assiduite, obtenirCouleurNiveauIDME, obtenirDetailsAssiduite, etc.).
5. **5 variables module-scope** identifiées (vs 4 annoncées) : `profilActuelDA`+`window.profilActuelDA` (dual), `sectionProfilActive`, `indiceActif`, `_confidentielDaActuel`, `SOUS_CATEGORIES_SERVICES`.
6. **État pivot `window.profilActuelDA`** — pattern dual-write atomique L2807-2808 (`profilActuelDA = da; window.profilActuelDA = da;`), 24 lectures HORS module. **Atomicité critique** à préserver lors du découpage.
7. **3 accès `localStorage` direct** (anti-pattern isolé) — clé `profilOngletDeveloppementActif` L6371, 6401, 6423, toutes dans zone Sections (cluster L6354-6451). **Décision à prendre** : migrer vers `db.getSync/setSync` OU préservation stricte + SUIVI-BUGS.
8. **Cascade `consulterEvaluation`** — orchestrateur multi-timeouts T+200/500/300ms avec `window._consulterEvalTimerId` race guard. + `afficherProfilComplet` cyc 58 orchestre 7 sections + post-rendu @100ms.
9. **Ordre d'extraction recommandé** : LOW (helpers+calculs+rapport) → MEDIUM (diagnostics+confidentiel) → HIGH partie 1 (actions) → HIGH partie 2 (sections affichage). 4 sessions.
10. **Tailles révisées** : tous les sous-modules conformes ±0 LOC vs MODULES-MAP §2.3. Résidu estimé ~80-150 LOC (très petit, peu de wrappers transversaux).
11. **Commentaire en-tête obsolète** L9-12 — sections « (À développer) » toutes implémentées. À inscrire SUIVI-BUGS Catégorie B post-refactor.

**Décisions actées avec Grégoire** (17 mai soir, étape 1) :
- (a) **3 accès `localStorage` direct** L6371/6401/6423 (clé `profilOngletDeveloppementActif`) → **préservation comportementale stricte**. Inscrit en SUIVI-BUGS pour traitement Catégorie B post-refactor.
- (b) **11 helpers internes cross-zones** → **promouvoir tous `window.X`** (sécurité frontière, convention systématique appliquée sur 5 sessions consécutives bilan-reflexif → trimestre-v2). +11 lignes export.

**Décisions à acter** (avant session B) :
- (c) **Zone PII confidentiel** — charger `SKILL_Securite_donnees.md` au démarrage session B (rappel automatique dans SESSION.md).

## Consigne session B — Étape 3 MEDIUM (diagnostics + confidentiel, ~1-2 h)

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6-profil-etudiant

# Vérification rapide à l'ouverture de session :
git log --oneline @{u}..HEAD          # vide attendu (branche synchro avec origin)
git status                             # propre (sauf node_modules symlinks)
cat version.json                       # {"build":"0518-0030","beta":"99.48"}
cd tests && npm test                   # 80/80 verts (70 Vitest + 10 Playwright)
wc -l ../js/profil-etudiant.js ../js/profil-etudiant-*.js  # résidu 6337, +3 sous-modules

# Si nouveau jour de travail : fetch d'abord pour s'assurer que rien n'a bougé côté Grégoire
git fetch origin
git status                             # détecte si origin est en avance

Lecture obligatoire :
1. SESSION.md (ce document) — récap étapes 0+1+2 + session A LIVRÉE
2. audit/refactoring-prep/MODULES-MAP.md §2.3 (découpage 7 sous-modules + 11 écarts)
3. audit/refactoring-prep/METHODE-REFACTORING.md §3 étape 3 + §7 propositions Catégorie B trimestre-v2 + §7 notes pour profil-etudiant
4. **Skills pour Claude Code/SKILL_Securite_donnees.md** — OBLIGATOIRE pour zone confidentiel (PII, données sensibles, services adaptés, sous-catégories médicales). Lire AVANT de toucher au sous-module confidentiel.

OBJECTIF SESSION B : extraire 2 sous-modules MEDIUM (~1-2 h)

### Sous-module 4 — `js/profil-etudiant-diagnostics.js` (~830 LOC)
- Zone originale L5693-6520, zone résidu actuel à recalculer
- 1re fonction probable : `genererDiagnosticCriteres` (visible à L3603 du résidu actuel)
- Contenu : Diagnostics SRPNF/Critères/Générique, _genererBarresSRPNF, Blocs RLO + Évolution + Consolidation + Gestes cognitifs + Note RLO + Onglets
- Risque MOYEN (consomme calculs.js + helpers.js)

### Sous-module 5 — `js/profil-etudiant-confidentiel.js` (~365 LOC)
- Zone originale L8461-8716 + zone Section Travaux L8717-8818 (NON, garder Travaux dans résidu — voir Écart MODULES-MAP §2.3 sous-module #7 = confidentiel + Section Travaux ; à confirmer à l'ouverture)
- Variables module-scope incluses : `_confidentielDaActuel`, `SOUS_CATEGORIES_SERVICES`
- Contenu : modal confidentiel (ouverture, sauvegarde, chargement notes/présences, services adaptés, sous-catégories) + `aDesInfosConfidentielles`
- Risque ÉLEVÉ (PII) — **respecter SKILL_Securite_donnees.md §9**

### Workflow par sous-module (check-list éprouvée sessions A) :
1. **Localiser zone** : `grep -nE "^function" js/profil-etudiant.js | awk -F: '$1 >= X && $1 <= Y'` pour confirmer les bornes
2. **Lire la zone** (Read ciblé du début + fin pour vérifier frontières exactes — pas besoin de tout lire)
3. **Audit pré-deletion doublons** : `grep -nE "^window\.(fonc1|fonc2|...)\s*=" js/profil-etudiant.js` pour identifier les exports déjà sur window
4. **Commenter les doublons** dans le résidu avec pointer vers nouveau sous-module (Edit) — préservation contexte historique
5. **Extraire la zone** vers `/tmp/<zone>-content.js` via `sed -n 'START,ENDp' js/profil-etudiant.js > /tmp/...`
6. **Construire le sous-module** avec heredocs bash : header (IIFE + 'use strict' + en-tête commentaire) + contenu + footer (16/N exports window.X + `})()`)
7. **Vérifier syntaxe** : `node --check js/profil-etudiant-<zone>.js`
8. **Supprimer la zone du résidu** : `sed -i '' 'START,ENDd' js/profil-etudiant.js`
9. **Modifier index.html** : ajouter `<script src="js/profil-etudiant-<zone>.js?v=20260518a"></script>` après le précédent et AVANT le résidu (ordre : helpers → calculs → rapport → diagnostics → confidentiel → résidu)
10. **Modifier `tests/unit/refactor-profil-etudiant.test.js`** : ajouter `chargerScript('js/profil-etudiant-<zone>.js', stubs, win)` + élargir sentinelle avec exports promus
11. **Audit post-extraction** : grep doublons orphelins (= 0 attendu), ESLint complexity résidu + nouveau sous-module
12. **Tests verts attendus** : 80/80
13. **Commit par sous-module** avec message conventionnel

### Bump prévu en fin de session B
Refresh build 99.48 b0518-XXXX (pas de changement de version majeure car même journée, même chantier). Optionnellement passer à 99.49 si Grégoire le préfère pour marquer une session distincte.

### Réflexes installés (METHODE §7 trimestre-v2 + session A profil-etudiant)
- Convention systématique `window.X` pour TOUTES les fonctions extraites (décision étape 1 b)
- Doublons d'export pré-existants : commenter dans le résidu, ne pas supprimer (préservation contexte)
- Pattern appels privés résiduels OK via chaîne de scope global — pas besoin de migrer en `window.X()`
- Helper `chargerScript(path, stubs, fauxWindowExistant)` réutilisé tel quel
- Acquittement `// security-ok` automatique sur XSS innerHTML transférés tels quels (préservation comportementale stricte)
- Audit ESLint complexity APRÈS chaque extraction (vérifier pas de régression)

### Notes spécifiques session B
- **PII** : la zone confidentiel manipule des données sensibles (santé mentale, services adaptés, sous-catégories médicales). Pas de modification du comportement — extraction comportementalement neutre. Si un bug latent est détecté pendant l'extraction, l'inscrire en SUIVI-BUGS Catégorie B, ne PAS le corriger pendant le refactor.
- **`window._avertiGrilleMoyennes`** : variable transitoire utilisée par calculs.js et diagnostics.js — vérifier qu'elle reste accessible cross-module (probablement OK via window.X automatique).
- **`window._consulterEvalTimerId` et `window._apresOuvertureFichier`** : timers de cascade utilisés par consulterEvaluation (session C — pas session B). Pas de manipulation en B.

---

## Consigne session A (RÉALISÉ — référence)

3 sous-modules LOW (helpers + calculs + rapport)
- helpers.js 630 LOC, calculs.js 1547 LOC, rapport.js 426 LOC
- Total 2603 LOC extraits, 37 fonctions promues window.X
- Résidu 8818 → 6337 LOC (-28,1 %)
- `js/profil-etudiant-helpers.js` (~545 LOC, zone L70-643)
  - Helpers, badges, interprétations indices
  - 11 helpers internes à promouvoir window.X (décision étape 1 b) :
    interpreterMobilisation/Performance/Completion/Assiduite, obtenirCouleurNiveauIDME,
    obtenirIdsProductionsEvaluables, obtenirCriteresAvecValeurs, obtenirDetailsAssiduite, etc.
- `js/profil-etudiant-calculs.js` (~1 215 LOC, zone L4190-5404)
  - Moyennes critères, IPB, diagnostic apprentissage, forces/défis, progression, pattern, RàI
  - Logique pure, faible risque
  - Inclure les fonctions cyc > 30 : calculerIPB cyc 36, determinerCibleIntervention cyc 58
    (étape 4 traitera l'éclatement à la session D)
- `js/profil-etudiant-rapport.js` (~365 LOC, zone L7462-7826)
  - Rapport API, génération, copie, préférences
  - 2 exports : genererEtAfficherRapport, copierRapport

Réflexes installés sessions précédentes (METHODE §7 trimestre-v2) :
- Grep `window.X = X` PRÉ-deletion (doublons d'export) ET APRÈS chaque extraction (orphelins)
- Grep noms de fonctions extraites dans le résidu post-deletion (cross-zone audit tardif)
- Wrappers `afficherNotification*` dupliqués dans chaque sous-module (consolidation reportée)
- Acquittement `// security-ok` automatique sur XSS innerHTML transférés tels quels
- Audit ESLint complexity APRÈS chaque éclatement
- `chargerScript(path, stubs, fauxWindowExistant)` étendu pour enchaîner les 3 sous-modules
  dans le même sandbox (sentinelle élargie au fur et à mesure)

Workflow par sous-module :
1. Identifier les lignes exactes de la zone (grep + fonctions de début/fin)
2. Copier vers le nouveau fichier (avec IIFE + 'use strict' + en-tête commentaire)
3. Ajouter exports window.X (incluant les 11 helpers internes à promouvoir)
4. sed delete dans profil-etudiant.js + grep résidu pour orphelins
5. Ajouter <script> dans index.html (AVANT profil-etudiant.js)
6. Mettre à jour tests/unit/refactor-profil-etudiant.test.js (chargerScript du sous-module + élargir sentinelle si nouveaux exports promus)
7. Lancer tests : 80/80 attendu
8. Commit par sous-module (3 commits) avec message conventionnel

Bump en fin de session A : version.json 99.47 → 99.48 b0517-XXXX + js/init-inline.js + index.html.

Session B (MEDIUM diagnostics + confidentiel, PII), session C (actions cascade)
et session D (sections affichage 3 700 LOC + étape 4 + étapes 5+6) suivront.
```

## Décisions actées avec Grégoire (à compléter)

À documenter au fil des sessions :
- Étape 1 (17 mai soir) : (en attente — voir « Décisions à acter » ci-dessus).

---

# Archive — Sessions précédentes (refactor trimestre-v2.js TERMINÉ + productions.js TERMINÉ)

> Le contenu ci-dessous est l'historique des chantiers refactor `productions.js` (16 mai) et `trimestre-v2.js` (17 mai). Les deux sont mergés FF sur main. Conservé en archive pour consultation.

# SESSION — État au 17 mai 2026 (refactor productions.js + trimestre-v2.js TERMINÉS — mergés FF sur main)

**Date** : 17 mai 2026 (journée complète — productions §6 matin, trimestre-v2 étapes 0→2 + sessions A+B+C + capitalisation Phase 4 + merge FF)
**Beta / build** : 99.47 / 0517-1259
**Branche actuelle du worktree** : `refactor/trimestre-v2` (HEAD identique à `main` après FF)
**Dernier commit** : `3b0f3ae` — `docs(session): relai post-merge — état git final + consigne profil-etudiant précisée`
**Branche `main`** : **`3b0f3ae`** — FF effectué depuis `4b915b0` (+14 commits refactor trimestre-v2 + capitalisation + relai)
**Commits non-pushés sur `main`** : 14 (`e59a669` étape 1 → `3b0f3ae` relai) — **à pusher depuis la maison** (réseau école bloque GitHub)
**Statut** :
- Refactor productions.js : **complet** — étapes 0→6 livrées, mergé sur `main` (le 17 mai matin).
- Refactor trimestre-v2.js : **complet** — sessions A+B+C + capitalisation + merge FF sur `main` (le 17 mai soir). 8 sous-modules sur 8 prévus extraits, monstre cyc 94 éclaté en 4+1 helpers, validation manuelle Grégoire OK. 6 bugs latents inscrits SUIVI-BUGS #99-104 (préservation comportementale stricte, à traiter dans un cycle Catégorie B distinct).
- **Action en attente** : `git push origin main refactor/trimestre-v2` depuis la maison.

**Tests** : 65 Vitest + 8 Playwright = **73/73 verts** (confirmés post-merge FF — sentinelle + canari capturent les 8 extractions cumulées).

## Récap session C (17 mai soir — zone HIGH 8 + éclatement monstre + capitalisation)

**Phase 1 — Extraction zone HIGH 8 orchestre** (commit `e52e765`)

15 fonctions extraites vers `js/trimestre-v2-orchestre.js` (~820 LOC) :
- Dropdown groupe-cours actif (entête) : `peuplerDropdownGroupeCoursActif`, `changerGroupeCoursDepuisHeader`
- **Monstre `changerGroupeCoursActifV2`** (cyc 94, 282 LOC) — préservé tel quel pour Phase 1
- Dropdown enseignants + UI enseignant : `peuplerDropdownEnseignants`, `changerEnseignantSelectionneV2`, `afficherFormEnseignantV2`, `modifierEnseignantSelectionneV2`
- UI horaire (dead code apparent — aucun caller index.html) : `afficherFormHoraireV2`, `modifierHoraireSelectionneV2`, `mettreAJourResumeFormatHoraireV2`
- UI groupe-cours : `afficherFormGroupeCoursV2`, `activerGroupeCoursV2`, `_supprimerGroupeCoursV2_legacy`, `mettreAJourApercuGroupeCours`
- `accederCalendrierRapide`

14 exports `window.X` migrés. Variable module-scope migrée : `enseignantEnEditionUI`. Bilan résidu : 1333 → 599 LOC (-55 %). Cumulé depuis l'initial : 6584 → 599 LOC (-90,9 %).

orchestre.js chargé EN DERNIER dans index.html (appelle `window.X` d'autres sous-modules : `populerDropdownGroupesHoraireV2`, `afficherTrimestreGroupeCoursV2`, `supprimerGroupeCoursV2`).

**Phase 2 — Éclatement monstre cyc 94** (commit `46ac1f2`)

`changerGroupeCoursActifV2` éclatée en **4 helpers + 1** selon Écart #8 MODULES-MAP §2.4 :
1. `_definirInfoCoursModeCours(coursId, trimestreActif)` (~25 LOC, cyc ~3)
2. `_definirInfoCoursModeGroupeCours(gc, trimestreActif, groupesCours, cleGC)` (~50 LOC, cyc 16) — async, inclut `await db.set(cleGC, ...)` AVANT les 2 setSync atomiques + sync horaireHebdo
3. `_rafraichirVuesContextDependantes(valeurHeader, message, regenererCalendrier)` (~75 LOC, cyc 28) — factorisation des 2 branches ~90 % dupliquées
4. `_rafraichirProfilEtudiantSiVisible()` (~22 LOC, cyc ~10) — **ajout en cours d'éclatement** pour redescendre `_rafraichirVuesContextDependantes` de cyc 36 (au-dessus de cible dure) à cyc 28
5. Fonction principale `changerGroupeCoursActifV2(valeur)` (~32 LOC, cyc < 15)

**Atomicité préservée** (Écart #6) : couple `db.setSync('groupeCoursActif', X)` + `db.setSync('infoCours', Y)` jamais séparé par `await` dans les 2 helpers de définition.

**Cible dure cyc ≤ 30 atteinte sur la zone 8** (objectif explicite du scope session C). Bilan orchestre.js : 820 → 789 LOC (-31 LOC nets après dé-duplication des 2 branches +160 LOC dupliqués → +75 LOC factorisés).

**Trouvailles notables session C (mémoire candidate)** :
1. **Découpage supplémentaire requis pour cible dure** : un éclatement initial planifié à N fonctions peut produire une fonction au-dessus de la cible dure (cyc > 30). Pattern Phase 2 : éclatement 4 fonctions laisse `_rafraichirVuesContextDependantes` à cyc 36. Réflexe : audit ESLint complexity après chaque éclatement, prêt à extraire un sous-helper additionnel.
2. **Factoriser les 2 branches dupliquées en paramètres** : les blocs avec 90 %+ de code dupliqué (Mode COURS / Mode GROUPE-COURS) abstraits en paramètres (`valeurHeader`, `messageNotification`, `regenererCalendrier`) plutôt que dupliqués. Gain : −110 LOC vs duplication.
3. **Chargement orchestre EN DERNIER** : un sous-module qui appelle `window.X` d'AUTRES sous-modules doit être chargé en dernier dans `index.html` pour que les exports soient déjà disponibles au moment de son IIFE.

**Phase 3 — Validation manuelle Grégoire** (17 mai soir, Safari Mac sombre+clair) : **OK** sur 5 cas MODULES-MAP §2.4 (création trimestre + identification + calendrier ; CRUD cours/GC/horaire/enseignant ; changement groupe-cours actif = test du monstre éclaté ; archivage+biblio ; import/export CSV Omnivox). Aucun bug détecté.

**Phase 4 — Capitalisation + merge** : rétrospective MODULES-MAP §2.4 + NOTES-DE-VERSION 99.47 + METHODE §7 (5 propositions Catégorie B) + 6 bugs latents inscrits SUIVI-BUGS (#99-104) + memory feedback + bump build (refresh build 99.47 b0517-XXXX) + merge FF refactor/trimestre-v2 → main + push à la maison.

**4 fonctions cyc > 30 héritées** restantes dans sous-modules session B (cours + groupes-cours) — hors-scope du refactor C : `sauvegarderCoursV2` 56, `mettreAJourCarteResumeGroupeCoursV2` 34, `remplirFormCoursV2` 31, `genererNomGroupeCoursV2` 31. À traiter dans un cycle dédié productions-style.

## Récap étape 3 session B (17 mai matinée — zones MEDIUM extraites)

3 sous-modules MEDIUM extraits depuis trimestre-v2.js (résidu post-session-A 4148 LOC) :

| Sous-module | LOC | Périmètre |
|---|---:|---|
| `trimestre-v2-cours.js` | ~1040 | Zone 3 : CRUD cours + 5 synthèses sidebar (cours, enseignant, groupe-étudiants, horaire, groupe-cours) + dropdown pratiques + helper `setValue` + `coursEnEditionV2` (18 fonctions) |
| `trimestre-v2-etudiants.js` | ~990 | Zone 4 : CRUD étudiants + groupes + import/export CSV (Omnivox windows-1252) + handlers dispatcher (actionEtudiantV2Handler/remarqueEtudiantV2Handler) + `donneesImportEnAttenteV2` + `etudiantEnEditionIndex` (29 fonctions) |
| `trimestre-v2-groupes-cours.js` | ~970 | Zone 6 : CRUD groupes-cours + bibliothèque modale (visibles/masqués) + helpers nom (`abrevierJour`, `obtenirPeriodeJournee`) + `groupeCoursEnEditionId` (16 fonctions, **SANS** le hub `populerDropdownsAssemblageV2`) |

**Bilan résidu trimestre-v2.js** : 4148 → 1333 LOC (-2815, **-68 %**). Cumulé depuis l'initial : 6584 → 1333 LOC (-79,8 %).

**Hub `populerDropdownsAssemblageV2` conservé dans le résidu** (Écart #4 MODULES-MAP §2.4 + anti-pattern §5.6). Accédé par les 3 sous-modules MEDIUM via `window.populerDropdownsAssemblageV2`.

**Promotion ajoutée en session B** (détection cross-zone tardive) :
- `window.afficherTrimestreGroupeCoursV2` — appelée par `afficherFormGroupeCoursV2` (zone 8 résidu). Promotion réflexe : ajout `window.X` dans le sous-module + remplacement par `window.afficherTrimestreGroupeCoursV2()` (avec garde `typeof`) dans le résidu.

**Bugs latents nettoyés en session B** :
- **Doublon `window.supprimerGroupeCoursV2`** : exporté 2× dans le pré-session-B résidu (lignes 1203 zone 6 + 2114 zone 8). La seconde occurrence référençait la même fonction. Après extraction zone 6, la seconde aurait planté → suppression. Conservation comportementale (1 export valide, comportement inchangé).
- **`_supprimerGroupeCoursV2_legacy`** (dead code, jamais appelé) : appel interne à `supprimerGroupeCoursV2()` fixé en `window.supprimerGroupeCoursV2()`. Fonction préservée per stricte préservation comportementale.

**Trouvailles notables session B (mémoire candidate)** :
1. **Audit cross-zone tardif** : un export non listé dans MODULES-MAP §2.4 peut être appelé depuis une zone non extraite — `afficherTrimestreGroupeCoursV2` n'apparaissait pas dans Écart #5 ni les sentinelles. Détecté à l'extraction zone 6 par grep résidu post-deletion. Pattern réutilisable : **après chaque deletion, grep noms de fonctions extraites dans le résidu** (pas seulement les exports).
2. **Sub-module IIFE et doublons d'export** : un `window.X = X` orphelin dans le résidu, où `X` était une fonction maintenant extraite, transforme le résidu en `ReferenceError: X is not defined` au chargement IIFE. **Pré-deletion, grep `window\.X = X` pour identifier les doublons** + retrait du doublon non principal.
3. **Hub résiduel + zones extraites = pattern `window.X` systématique** : les 3 zones MEDIUM extraites en session B appellent toutes le hub `populerDropdownsAssemblageV2` via `window.X`. **Convention** : tout appel au hub passe désormais par `window.X` (préfixe explicite) avec garde `typeof === 'function'` pour résilience à l'ordre de chargement.

## Récap étape 3 session A (17 mai après-midi)

4 sous-modules LOW extraits depuis trimestre-v2.js :

| Sous-module | LOC | Commit | Périmètre |
|---|---:|---|---|
| `trimestre-v2-enseignants.js` | ~390 | `4e9252b` | Zone 7 : CRUD profils enseignants (8 fonctions + viderFormulaireEnseignantV2 + `enseignantEnEditionId`) |
| `trimestre-v2-horaires.js` | ~870 | `39901ae` | Zone 5 : CRUD séances + horaires + format (20 fonctions + `seanceEnEditionV2` + `horaireEnEditionId`) |
| `trimestre-v2-liste.js` | ~485 | `98f3efd` | Zone 2 : liste trimestres + archivage + biblio + modal nouveau (11 fonctions) |
| `trimestre-v2-init.js` | ~860 | `a02f2af` | Zone 1 : init + identification + calendrier + événements (21 fonctions + 2 variables ; `afficherStatistiquesTrimestreV2` reste résidu) |

**Bilan résidu trimestre-v2.js** : 6588 → 4148 LOC (-2440, **-37 %**).

**Promotions ajoutées au résidu** (anti-pattern §5.6 helpers cross-module) :
- `window.populerDropdownsAssemblageV2` (hub résiduel, appelé par sous-modules enseignants + horaires)
- `window.chargerIdentificationTrimestreV2` (appelé par sous-module liste)

**Trouvailles notables session A (déjà capturées en feedback)** :
1. Pattern `exports-orphelins-grep-window` déclenché aux extractions horaires (7 orphelins L4524-4530) + liste (11) + init (19). Confirmation : grep `^window.X = X` AVANT ET APRÈS chaque extraction est obligatoire.
2. Helper local `afficherNotification` (sans suffixe) consommé par init.js, défini dans `js/trimestre.js`. Nouveau wrapper défensif ajouté au sous-module pour préserver le pattern.
3. Variables module-scope spécifiques migrent avec leur zone (enseignantEnEditionId, seanceEnEditionV2, horaireEnEditionId, evenementPrevuEnEditionV2, evenementImprevuEnEditionV2). Pas de réutilisation cross-zone observée.
4. Sub-module `js/utils-notifications.js` (préparation amont) REPORTÉ à un chantier séparé : 73 sites d'appel `afficherNotificationSucces` dans le code = risque régression silencieuse pendant le découpage. Wrappers défensifs locaux dupliqués dans chaque sous-module (5 fichiers ≈ 30 LOC dupliquées) — acceptable, consolidation post-refactor.

## Récap session trimestre-v2 (après-midi 17 mai)

**Étape 1** — Lecture intégrale 6 584 LOC + audit ESLint complexity + Agent Explore frontières inter-zones. **11 écarts** documentés dans MODULES-MAP §2.4 (commit `e59a669`) :
- **8 fonctions ≥ cyc 30** (vs 1 prévu) ; `changerGroupeCoursActifV2` cyc 94 (vs 86 prévu, 282 LOC, 2 branches ~90 % dupliquées).
- **129 exports réels** (vs 53 prévus) dispersés en 5 zones (4010, 4139, 5150, 5732, 6453).
- Hub critique `populerDropdownsAssemblageV2` (cyc 28, appelé 10× cross-zones) reste au résidu.
- État pivot `window.trimestreActif` lu 28× hors module — atomicité critique du couple `=` + `setSync`.
- Plan d'extraction : LOW (1+2+5+7) → MEDIUM (3+4+6) → HIGH (8) en 3 sessions séparées.

**Étape 2** — 5 Vitest + 2 Playwright (commit `4d30a0a`) :
- Canari de chargement IIFE dans sandbox Node.
- Sentinelle 20 exports représentatifs des 8 zones.
- Assertions structure `changerGroupeCoursActifV2` (async, arité 1).
- Hub résiduel `populerDropdownsAssemblageV2` accessible.
- État pivot `window.trimestreActif` non muté au chargement IIFE.
- Playwright : chargement WebKit sans erreur console (filtres file:// connus) + sentinelle exports browser.

## Décisions actées avec Grégoire (17 mai après-midi)

1. Lecture intégrale du module avant tout découpage (étape 1 complète).
2. Étape 2 enchaînée dans la même session (canari + sentinelle suffisants pour pré-refactor).
3. **Fractionnement étapes 3+4 en 3 sessions** :
   - Session A : zones LOW (1 init + 2 liste + 5 horaires + 7 enseignants) — < 5 dépendances internes chacune.
   - Session B : zones MEDIUM (3 cours + 4 étudiants + 6 groupes-cours) — toutes appellent `populerDropdownsAssemblageV2`.
   - Session C : zone HIGH (8 orchestre) + éclatement de `changerGroupeCoursActifV2` cyc 94 en 3 helpers + étapes 5+6 (validation manuelle + capitalisation + merge).

## Récap étape 5 — Validation manuelle Grégoire (17 mai 2026)

6 cas d'intégration MODULES-MAP §2.2 validés OK sur **Safari Mac, modes sombre + clair** : création, modification, suppression, import/export JSON, bibliothèque, verrouillage. Aucun bug nouveau détecté. Bugs latents préservés (#96 `event.target.value` rétro-compat, #97 `productionEnCoursEdition` désynchronisé — restent priorité basse dans SUIVI-BUGS).

## Récap étape 6 — Capitalisation (commit `24cad3b` + correctif `1196d75`)

Toutes les écritures faites avant la validation (anticipation prémérite, signalée en début de session) :
- `MODULES-MAP §2.2` — rétrospective post-refactoring (métriques avant/après, dette résiduelle, notes pour modules suivants).
- `NOTES-DE-VERSION.md` — entrée Beta 99.46 séparée de bilan-reflexif 99.45.
- `BACKLOG.md` — header daté 17 mai + #279 (gabarit production enrichi).
- `SUIVI-BUGS.md` — updates #96/#97 (préservés).
- `METHODE-REFACTORING §7 productions.js` — synthèse méthode + 4 propositions Catégorie B + notes pour `trimestre-v2.js`.
- 5 mémoires feedback transférées : `charger-script-multi-modules`, `exports-orphelins-grep-window`, `hook-defense-j-arrow-vers-function`, `refactor-audit-appelants-distants`, `refactor-preserver-bugs-latents`.

Correctif numérique `1196d75` — les chiffres écrits par `24cad3b` ne pouvaient pas s'inclure eux-mêmes (HEAD `9de1bfc`, 7 commits → HEAD `24cad3b`, 8 commits).

> **Note d'emplacement (archive)** : la consigne étape 5 productions.js ci-dessus a été rédigée sur la branche `refactor/productions` (depuis renommée `refactor/trimestre-v2` puis mergée sur `main`). Le bloc d'identification en tête de ce fichier liste les 3 `SESSION.md` du projet et leur rôle respectif.

---

## Récap session 16 mai 2026 (étapes 3 + 4)

### Étape 3 — Découpage incrémental (3 commits)

3 sous-modules extraits depuis productions.js :

| Sous-module | LOC | Commit | Périmètre |
|---|---:|---|---|
| `js/productions-import-export.js` | 640 | `941c148` | 13 fonctions : exporter/importer JSON CC, assistant migration catégories, wrappers délégation modale |
| `js/productions-liste.js` | 456 | `1623643` | 8 fonctions : sidebar + CRUD utilisateur, `importerProductionsExternes` |
| `js/productions-bibliotheque-ui.js` | 714 | `65434ff` | 15 fonctions : modale Gestionnaire de bibliothèque + 14 actions (ajouter/retirer/dupliquer/import trimestre/etc.) |

**Bilan étape 3** :
- `js/productions.js` : 3995 → 2211 LOC (**−44,7 %**)
- Wrappers délégation `sauvegarderProductionOriginale`, `annulerFormProductionOriginale`, `supprimerProductionOriginale` restés groupés dans le résidu (anti-pattern §5.3)
- `getCleProductions`, `detecterDoublonsProductions` promues sur `window.X` (anti-pattern §5.6)
- Helper test étendu : `chargerScript(path, stubs, fauxWindowExistant)` permet d'enchaîner N sous-modules dans le même sandbox (réutilisable pour tous futurs refactors)
- Pattern factorisation `chargerSandbox(stockage)` dans les tests quand 3+ sous-tests partagent les mêmes stubs

### Étape 4 — Réduction de complexité (1 commit `1423bb7`)

Cible dure METHODE §3 étape 4 : aucune fonction > cyc 30 — **✅ atteinte**.

**`afficherFormProduction` cyc 47 → ≤ 30** (3 helpers privés) :
- `peuplerCartouchesProduction(grilleId)` — arrow locale promue function declaration
- `prerenseignerFormulaireProduction(prod)` — pré-remplissage mode modification
- `reinitialiserFormulaireProduction()` — réinitialisation mode ajout

**`sauvegarderProduction` cyc 80 → ≤ 30** (6 helpers privés) :
- `lireDonneesFormulaireProduction()` — lecture tous champs (multi-groupe inclus)
- `validerChampsObligatoiresProduction(d)` — alertes + bool
- `validerEcheancesDansTrimestre(d)` — confirm si dates hors bornes
- `gererDoublonProduction(titre, evals, idActuel)` — dialogue doublons
- `construireProductionData(d, evals)` — assemblage productionData
- `rafraichirInterfaceApresSauvegarde(idSauvegarde)` — side-effects UI

**Cible souple** (cyc ≤ 15) non atteinte : 11 fonctions restent entre 16 et 29 cyc (max `gererChangementTypeProduction` cyc 29). Acceptable selon METHODE qui qualifie cette cible d'« optionnelle ».

### Trouvailles notables de la session (mémoire candidate)

1. **Helper `chargerScript` étendu** : 3e paramètre `fauxWindowExistant` permet d'enchaîner N sous-modules dans le même `win`. Pattern à réutiliser pour `trimestre-v2.js`, `profil-etudiant.js`, `evaluation.js`.
2. **Exports orphelins dispersés** : les `window.X = X;` ne sont pas tous regroupés en bas du fichier. Pour productions.js, 9 exports thématiques étaient au milieu (lignes 2689-2702 pré-extraction). Grep tous les `window.X` après chaque sed pour les attraper.
3. **Hook Défense J et promotion arrow → function** : promouvoir une arrow function en function declaration change la ligne et fait re-flagger l'innerHTML par le hook (baseline F.16). Acquittement `// security-ok` justifié si le code interne est inchangé.
4. **Bug latent `productionEnEdition`** : `annulerFormProduction()` met cette variable à `null` AVANT la notification de succès dans `sauvegarderProduction`. Donc le message dit toujours « ajoutée » même en modification. Préservation comportementale stricte → bug conservé, commenté pour future correction.
5. **Pattern : extraire un helper requiert d'auditer ses appelants distants** : `definirProductionActive` reste dans le résidu car le wrapper du résidu (`sauvegarderProductionOriginale`) l'appelle. `chargerGrillesDisponiblesPourProduction` reste car helper interne consommé par `creerNouvelleProduction` extraite.

### Décisions actées avec Grégoire pendant la session

1. Enchaînement complet des 3 extractions sans pause de validation entre chacune (étape 3).
2. Étape 4 réalisée immédiatement après étape 3 (chantier risqué validé).
3. Bump beta 99.46 + build 0516-0820 + SESSION.md à jour AVANT l'étape 5.

---

## Consigne de démarrage pour la prochaine session (refactor `profil-etudiant.js`)

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6-refactor

# AVANT TOUT — pusher depuis la maison si pas déjà fait :
#   git push origin main refactor/trimestre-v2
# Réseau école bloque GitHub.

Lecture obligatoire :
1. SESSION.md (ce document) — récap trimestre-v2 TERMINÉ + capitalisation + merge FF
2. audit/refactoring-prep/MODULES-MAP.md §2.3 (profil-etudiant, lecture pré-refactor)
3. audit/refactoring-prep/MODULES-MAP.md §2.4 rétrospective trimestre-v2 (patterns à réutiliser)
4. audit/refactoring-prep/METHODE-REFACTORING.md §7 « Module : trimestre-v2.js » — 5 propositions Catégorie B + 6 notes pour profil-etudiant
5. Retours des testeurs/SUIVI-BUGS.md — #99-104 préservés du refactor trimestre-v2 (à traiter Catégorie B distincte, PAS dans le refactor profil-etudiant)

État git attendu en début de session :
- main : 3b0f3ae (refactor trimestre-v2 mergé FF + capitalisation + relai, +14 commits depuis 4b915b0)
- refactor/trimestre-v2 : 3b0f3ae (identique à main après FF — branche conservée pour push, à supprimer après push)
- Beta / build : 99.47 / 0517-1259
- Tests verts attendus : 73/73 (65 Vitest + 8 Playwright)
- Repo principal Monitorage_v6 : sur audit/2026-mai (WIP non-commité indépendant — NE PAS TOUCHER)

Vérification rapide à l'ouverture de session :
  git log --oneline -5            # 3b0f3ae en HEAD
  git rev-parse main              # 706dc0a (idem worktree)
  git status                      # propre (hors node_modules symlinks)
  cd tests && npm test            # 73/73 verts
  cat ../version.json             # {"build":"0517-1259","beta":"99.47"}
  wc -l ../js/profil-etudiant.js  # ≈ 8 818 LOC initial

OBJECTIF : refactor `profil-etudiant.js` selon METHODE-REFACTORING (étapes 0→6)

### Préambule — créer le worktree (depuis le repo principal Monitorage_v6)

cd ~/Documents/GitHub/Monitorage_v6
git worktree add -b refactor/profil-etudiant ../Monitorage_v6-profil-etudiant main
cd ../Monitorage_v6-profil-etudiant
# Symlinks node_modules :
ln -s ../Monitorage_v6/node_modules .
ln -s ../Monitorage_v6/tests/node_modules tests/

### Notes critiques pour ce module (retour d'expérience trimestre-v2)

1. **État pivot critique** : `window.profilActuelDA` est l'analogue de `window.trimestreActif` (lu 24× hors module selon MODULES-MAP §2.3). Tout changement de DA déclenche une cascade de rafraîchissements de vues — anticiper un monstre similaire à `changerGroupeCoursActifV2` et planifier l'éclatement.
2. **8 818 LOC, 105 fonctions** — module presque 50 % plus gros que trimestre-v2 en LOC. **Envisager 4 sessions** au lieu de 3 (split MEDIUM en 2 si nécessaire).
3. **Helper `chargerScript(path, stubs, fauxWindowExistant)` éprouvé** sur productions + trimestre-v2 — réutiliser tel quel pour le canari.
4. **Réflexes installés sessions B+C trimestre-v2** (à appliquer dès l'étape 3) :
   - Grep `window\.X = X` PRÉ-deletion (doublons d'export) ET APRÈS chaque extraction (orphelins)
   - Grep noms de fonctions extraites dans le résidu post-deletion (cross-zone audit tardif)
   - Sous-module orchestrateur chargé EN DERNIER dans index.html
   - Wrappers `afficherNotification*` dupliqués dans chaque sous-module (consolidation `utils-notifications.js` reportée)
   - Acquittement `// security-ok` automatique sur XSS innerHTML transférés tels quels (préservation comportementale stricte)
   - Audit ESLint complexity APRÈS éclatement, prêt à extraire un sous-helper additionnel si une fonction dépasse cyc 30
5. **5 propositions Catégorie B issues du refactor trimestre-v2** déposées dans METHODE §7 — à intégrer dans la méthode au prochain pas (compléter §4 check-list étape 3 × 2 items + §3 étape 0 chargement orchestre + §3 étape 4 découpage supplémentaire + §5 anti-patterns §5.8 factoriser branches dupliquées).
6. **Préservation comportementale stricte** : NE PAS profiter du refactor pour corriger des bugs préexistants (ReferenceError, XSS, dead code). C'est un autre cycle, autre PR. Inscrire systématiquement les bugs en SUIVI-BUGS.

### Étape 0 — Worktree + symlinks + baseline tests (~30 min)

- Créer worktree `refactor/profil-etudiant` depuis main (706dc0a)
- Symlinks node_modules
- Lancer tests baseline : 73/73 verts attendus

### Étape 1 — Lecture intégrale + audit ESLint + grep helpers cross-module (~2-3 h)

- Lire les 8 818 LOC ; identifier les zones (probable similaire à trimestre-v2 : init + chargement DA + UI rendu + handlers + orchestre cascade)
- Audit ESLint complexity (cible : repérer les fonctions cyc > 30, MODULES-MAP §2.3 mentionne probablement le top — peut-être `afficherProfilComplet` ?)
- Grep helpers cross-module (`afficherNotification*`, `echapperHtml`, `BibliothequeUI.*`, `cle()`, `obtenirEtudiantsCoursActif`)
- Annoter MODULES-MAP §2.3 si écarts vs analyse pré-refactor (Écarts #1 à #N comme productions/trimestre-v2)

### Étape 2 — Tests de régression + canari (~1-2 h)

- Vitest : canari + sentinelle 15-20 exports + structure monstre identifié + état pivot `window.profilActuelDA` non muté au chargement
- Playwright : chargement WebKit + sentinelle exports browser (~2 tests minimum)

### Étape 3 — Découpage incrémental (~3-4 sessions ou 6-9 h, à fractionner)

Tentative de découpage (à valider à l'étape 1, possible analogie avec trimestre-v2) :
- `profil-etudiant-init.js`
- `profil-etudiant-chargement.js` (chargement données DA)
- `profil-etudiant-rendu.js` (cartes profil, graphiques)
- `profil-etudiant-handlers.js` (events, actions utilisateur)
- `profil-etudiant-orchestre.js` (changement DA actif + cascade) — chargé EN DERNIER

### Étape 4 — Éclatement fonctions cyc > 30 (~1-2 h)

À planifier après étape 1 selon les fonctions identifiées. Si analogie trimestre-v2 tient : monstre `afficherProfilComplet` ou `changerProfilActif` autour de cyc 80-100.

### Étape 5 — Validation manuelle Grégoire (~30 min - 1 h)

5-6 cas Safari Mac sombre + clair sur les flots utilisateur identifiés MODULES-MAP §2.3 :
- Sélection d'un étudiant depuis la liste
- Changement de groupe-cours actif → rechargement profil
- Affichage des graphiques A-C-P
- Affichage des évaluations + travaux
- Navigation cross-onglet (Bilan, RaI, etc.)

### Étape 6 — Capitalisation + merge (~30-45 min)

- MODULES-MAP §2.3 rétrospective
- NOTES-DE-VERSION (entrée Beta 99.48 ou bump build sur 99.47)
- BACKLOG.md (header daté)
- METHODE §7 notes pour evaluation.js (module suivant, le dernier god module)
- SUIVI-BUGS pour bugs latents découverts
- Mémoires feedback : nouvelles trouvailles
- Merge FF `refactor/profil-etudiant` → `main` (via `git update-ref` si main pas checkable)
- Push à la maison

### Chantiers connexes en attente (post-refactor profil-etudiant)

- **Cycle Catégorie B trimestre-v2** : traiter les 6 bugs latents inscrits SUIVI-BUGS #99-104 (3 XSS innerHTML + 3 dead code).
- **Intégrer les 5 propositions Catégorie B de METHODE §7** dans la méthode officielle (check-list étape 3, §3 étape 0, §3 étape 4, §5 anti-pattern §5.8).
- **Refactor `evaluation.js`** (7 348 LOC) — dernier god module, à enchaîner après profil-etudiant. Tendance : peut-être encore plus complexe vu la logique IDME × SRPNF × algo notation.
- **Consolidation `utils-notifications.js`** (~25 LOC) — wrappers `afficherNotificationSucces/Erreur` dupliqués dans tous les sous-modules. 73 sites d'appel dans le code, à faire un cycle dédié post-refactors (risque régression silencieuse si fait pendant un découpage).
```

---

## Archive — Consigne session A (livrée 17 mai 2026)

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6-refactor

Lecture obligatoire :
1. SESSION.md (ce document) — récap trimestre-v2 étapes 0+1+2 livrées
2. audit/refactoring-prep/MODULES-MAP.md §2.4 + « Écarts observés à l'exécution » (11 écarts documentés)
3. audit/refactoring-prep/METHODE-REFACTORING.md §3 étape 3 + §7 notes pour trimestre-v2

État git attendu :
- main : 4b915b0 (refactor productions mergé)
- refactor/trimestre-v2 : 4d30a0a (2 commits trimestre-v2 non-pushés)
- Tests verts : 73/73 (65 Vitest + 8 Playwright)

OBJECTIF SESSION A : étape 3 zones LOW (1 init + 2 liste + 5 horaires + 7 enseignants)
Extraire 4 sous-modules + le helper commun :
- `js/utils-notifications.js` (~25 LOC) — wrappers afficherNotification* consolidés, chargé EN AMONT
- `js/trimestre-v2-init.js` (~780 LOC) — init + identification + calendrier + événements (afficherStatistiquesTrimestreV2 reste au résidu)
- `js/trimestre-v2-liste.js` (~485 LOC) — liste trimestres + archivage + biblio + modal nouveau
- `js/trimestre-v2-horaires.js` (~830 LOC) — horaires + séances + format
- `js/trimestre-v2-enseignants.js` (~315 LOC) — profils enseignants

Notes pour cette session (issues étape 1 + METHODE §7 productions.js) :
- Helper test `chargerScript(path, stubs, fauxWindowExistant)` étendu : enchaîner les 4 sous-modules dans le même `win`.
- **Grep `window.X` AVANT ET APRÈS chaque extraction** — 5 zones d'exports dispersées (4010, 4139, 5150, 5732, 6453).
- **Hub résiduel** `populerDropdownsAssemblageV2` (4182, cyc 28) reste dans `trimestre-v2.js`.
- **Variables module-scope** restent au résidu : `evenementPrevuEnEditionV2`, `evenementImprevuEnEditionV2` (zone 1), `enseignantEnEditionId` (zone 7), `horaireEnEditionId` + `seanceEnEditionV2` (zone 5).
- **Charger `js/utils-notifications.js` EN AMONT** de trimestre-v2.js dans index.html (wrappers défensifs deviennent vrais helpers).
- **Préserver atomicité** : le couple `window.trimestreActif = X; db.setSync('trimestreActif', X)` ne doit jamais être séparé pendant le découpage.
- Mettre à jour le test `tests/unit/refactor-trimestre-v2.test.js` : ajouter `chargerScript()` pour chaque sous-module.
- Tests verts attendus à la fin : 73+ (canari + sentinelle élargis si nouveaux exports promus pour helpers privés).

Session B (zones MEDIUM 3+4+6) et session C (zone HIGH 8 + monstre + étapes 5+6) suivront.
```

---

## Archive — Consigne étape 5 productions.js (livrée 17 mai 2026)

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6-refactor

Lecture obligatoire :
1. SESSION.md (ce document) — récap étapes 3+4
2. audit/refactoring-prep/METHODE-REFACTORING.md §3 étape 5 (validation manuelle)
3. audit/refactoring-prep/MODULES-MAP.md §2.2 — 6 tests d'intégration cibles

État git attendu en début de session :
- main : 1b4818d (inchangé)
- refactor/productions : 1423bb7 (6 commits non-pushés)
- version.json : {"build":"0516-0820","beta":"99.46"}
- Tests verts attendus : 60 Vitest + 6 Playwright = 66/66

Vérification rapide à l'ouverture de session :
  git log --oneline -7       # 1423bb7 visible + 5 commits refactor au-dessus
  git status                 # propre (sauf symlinks node_modules)
  cd tests && npm test       # 66/66 verts

## OBJECTIF DE LA SESSION : étape 5 — validation manuelle Grégoire (~30 min - 1 h)

### 6 cas d'intégration à valider (MODULES-MAP §2.2)

1. **Création** : créer une production sommative + un portfolio + un artefact de portfolio
2. **Modification** : éditer une production existante (titre, type, ponderation, dateEcheance multi-groupe)
3. **Suppression** : retrait soft (dansBibliotheque=false) puis suppression définitive
4. **Import / Export JSON** : exporter une production seule + toutes les productions, ré-importer dans un nouveau cours
5. **Bibliothèque** : ouvrir le Gestionnaire, ajouter/retirer/dupliquer, filtrer par discipline, importer depuis un autre trimestre
6. **Verrouillage** : verrouiller une production (lock), tenter d'éditer (refusé), déverrouiller

### Cibles plateformes

- Safari Mac (obligatoire — Cmd+Q pour éviter cache buster inopérant sur file://)
- iPad Air si possible (cible secondaire)
- Vérifier mode sombre + mode clair

### Si validation réussie

- Étape 6 (merge sur main) :
  - Mise à jour MODULES-MAP.md §2.2 (rétrospective avant/après — métriques §6.5 METHODE)
  - Mise à jour NOTES-DE-VERSION.md (entrée Beta 99.46)
  - Mise à jour BACKLOG.md (clore l'item refactor productions)
  - Mémoire : transférer les 5 trouvailles notables ci-dessus
  - Merge `refactor/productions` → `main` (fast-forward ou squash selon préférence Grégoire)
  - Push à la maison (réseau école bloque GitHub)

### Si bug trouvé

- Inscrire dans SUIVI-BUGS.md (cf. #96, #97 déjà inscrits)
- Corriger sur `refactor/productions` (nouveau commit)
- Re-tester le cas d'intégration concerné
```

---

## Archive — Consignes précédentes (16 mai 2026, terminées)

### Étape 3 (matin/midi) — Découpage incrémental
3 commits : `941c148` import-export.js, `1623643` liste.js, `65434ff` bibliotheque-ui.js.
Voir détails ci-dessus.

### Étape 4 (après-midi) — Réduction complexité
1 commit : `1423bb7`. Voir détails ci-dessus.

---

## Archive — Sessions du 15 mai 2026 (étapes 0+1+2 livrées)

- **Étape 0** ✓ : worktree + symlinks + baseline 52 verts
- **Étape 1** ✓ : lecture intégrale 3994 LOC + grep + audit ESLint + MODULES-MAP annotée (7 écarts d'exécution)
- **Étape 2** ✓ : 14 tests Vitest régression (pures publiques + canari)
- **Bugs latents** #96 (`event.target.value` ligne 2972 d'origine) et #97 (`productionEnCoursEdition` jamais positionnée) inscrits dans SUIVI-BUGS.md (priorité basse)
- Commit `bad7ecd` (préparation) + `98f1063` (SESSION.md consignation)

Voir le SESSION.md du repo principal (`audit/2026-mai`) pour la consigne d'origine du chantier productions.js.

---

## Référence rapide (conventions en vigueur)

- **version.json source unique** pour beta et build — bumper en fin de session si modifs code
- **Hook pré-push Vitest** doit rester vert à chaque push
- **Hook pré-commit Défense J** : `// security-ok: <raison>` si false positive innerHTML
- **Convention nommage** : `nb` canonique (pas `n` ni `nombre`). Voir `docs/architecture/CONVENTIONS-NOMMAGE.md`
- **STYLE_GRAPHIQUE** (#246) : `Object.assign({}, window.STYLE_GRAPHIQUE.tooltip, overrides)` pour tout nouveau chart Chart.js
- **Aide ✴️** : `<button class="btn-aide-contextuelle" data-aide="cle">✴️</button>` + entrée dans `js/accompagnement-contenu-popup.js`
- **Tooltips survol** : `data-tooltip="cle"` + entrée dans `js/accompagnement-contenu-hover.js`
- **Sentinelle Défense E (F.16)** dans `tests/unit/lint-securite.test.js` bloque tout nouveau `value="${X.Y}"` non échappé. Utiliser `echapperHtml()`.

---

## Chantiers reportés (référence)

- **Bac à sable Lot 4a jetons** (semaine 25-31 mai)
- **Lot 3 indices ultrareview** (post-trimestre)
- **Phase 5 Démo** (~1 j, déjà reverté 22 avril)
- **#272** machine à états chargement éval (~1 j)
- **#240** Tampons jetons visuels sur travaux annotés (~2-3 h)
- **Défense E migration EXHAUSTIVE** — post-colloque

---

## Refactor modules après productions.js (PLAN-MOYEN-TERME §4.3-§4.5)

| Module | LOC actuel | Effort estimé | Fenêtre |
|---|---:|---:|---|
| `trimestre-v2.js` | 6 584 | ~8-12 h | 19-23 mai (après évals Grégoire) |
| `profil-etudiant.js` | 8 818 | ~6-9 h | 19-23 mai |
| `evaluation.js` | 7 348 | ~6-8 h | 19-23 mai, en dernier |

Méthodologie : appliquer le pattern productions.js (préparation → extraction sous-modules → réduction complexité → validation manuelle → merge). Réutiliser le helper `chargerScript(path, stubs, fauxWindowExistant)` étendu pour les canaris multi-modules.
