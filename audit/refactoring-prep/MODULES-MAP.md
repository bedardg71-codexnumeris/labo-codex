# Carte de découpage des 5 god modules

**Date** : 2026-05-15
**Auteur** : Cowork (Claude), validation Grégoire Bédard
**Document parent** : `audit/PLAN-MOYEN-TERME.md` (à rédiger)
**Source des constats** : audit `02-summary.md` (santé code) + `03-summary.md` (architecture) + scans structurels dans `audit/refactoring-prep/scan-*.txt`

---

## 1. Objet et méthode

Ce document cartographie les 5 god modules identifiés par l'audit annuel 2026 comme prioritaires pour le refactoring de moyen terme :

- `js/evaluation.js` (7 348 LOC, 123 fonctions)
- `js/productions.js` (3 994 LOC, 75 fonctions)
- `js/profil-etudiant.js` (8 818 LOC, 105 fonctions)
- `js/trimestre-v2.js` (6 584 LOC, 164 fonctions)
- `js/bilan-reflexif.js` (4 716 LOC, 153 fonctions)

Soit **~31 460 LOC cumulés** sur ces 5 modules, ce qui représente environ **18 % du code applicatif** (estimé ~175 000 LOC hors dataset démo). Pour chaque module, ce document propose :

1. Les zones fonctionnelles cohésives identifiées par les noms de fonction.
2. Un découpage en sous-modules cibles, avec taille approximative.
3. Les fonctions top-complexité à refactoriser en priorité.
4. Les états globaux partagés (`window.X`) qui constituent des **risques de régression** lors du découpage.
5. Les tests de régression à écrire **avant** de toucher au code.

Méthode : scan structurel par grep sur les patterns `function NAME(`, `window.X =`, accès `db.*` et clés SSOT. Pas de lecture intégrale du code — la cartographie reste **indicative** et devra être affinée à l'exécution du refactoring (lecture des fonctions par bloc, identification précise des dépendances internes).

Précaution : ce document n'a **pas été validé** par exécution effective de tests. Les frontières proposées sont raisonnables sur la base des noms de fonction, mais des dépendances cachées peuvent émerger en cours de travail (closures, variables module-scope, états implicites).

---

## 2. Cartographie par module

### 2.1 `evaluation.js` (7 348 LOC, 123 fonctions)

#### Statistiques

- **78 accès `db.*`** (API canonique) — bon point, 0 accès `localStorage` direct.
- **78 mentions des clés SSOT critiques** (`modalitesEvaluation`, `evaluationsSauvegardees`, `grillesTemplates`, `pratiquesConfigurables`).
- **57 exports `window.X`** — surface publique très large.
- **État global central** : `window.evaluationEnCours` (manipulé en 15+ endroits).

#### Zones fonctionnelles identifiées

| Zone | Lignes | LOC approx | Fonctions clés |
|---|---|---:|---|
| Chargement initial + sélection grille / cartouche | 77-1043 | ~970 | `initialiserModuleEvaluation`, `chargerListeEtudiantsEval`, `chargerEvaluationsEtudiant`, `chargerProduction`, `chargerGrilleSelectionnee`, `cartoucheSelectionnee`, `afficherCriteresDepuisGrille`, `niveauSelectionne` |
| Auto-save | 1120-1156 | ~30 | `_debouncerAutoSave`, `_flusherAutoSave`, `_autoSauvegarderCriteres` |
| Calcul de notes | 1257-1892 | ~640 | `calculerNoteAlgorithmique`, `calculerNoteAlgorithmiqueAvecCategories`, `calculerNoteAlgorithmiqueSimple`, `calculerNote`, `obtenirCouleurNiveau` |
| Génération de rétroaction | 1333-3582 | ~2 250 | `genererRetroactionEUF`, `genererRetroaction`, `regenererRetroactionAvecFeedback`, `genererRetroactionSpecifique`, `genererRetroactionBilan`, `copierRetroaction`, `basculerVueRetroaction`, `copierToutRetroaction` |
| Sauvegarde + jetons | 2177-2984 | ~810 | `sauvegarderEvaluation`, `majBadgesApresEvaluation`, `mettreAJourPillStatut`, `changerStatutRemise`, `afficherBadgesJetons`, `afficherGestionJetons`, `peuplementOptJetons`, gestion des 3 checkbox jetons |
| Nouvelle évaluation / formulaire | 2985-3132 | ~150 | `nouvelleEvaluation`, `reinitialiserFormulaire`, `evaluerProduction` |
| **Code mort à retirer** | 3634-3655 | ~25 | `calculerRisqueEchec`, `obtenirClasseRisque` |
| Liste des évaluations + filtres + tri | 3737-4400 | ~660 | `chargerListeEvaluationsRefonte`, `afficherListeEvaluations`, `genererDetailsEtudiant`, `filtrerListeEvaluations`, `trierListeEvaluations`, `mettreAJourStatistiquesEvaluations` |
| Mémorisation sélections | 4465-4610 | ~145 | `memoriserSelectionsEvaluation`, `sauvegarderSelectionsEvaluation`, `restaurerSelectionsEvaluation` |
| Mode modification | 4611-5975 | ~1 360 | `verifierEtChargerEvaluationExistante`, `modifierEvaluation`, `sauvegarderEvaluationModifiee`, navigation étudiant précédent/suivant, série |
| Verrouillage / suppression | 5976-6850 | ~870 | `verrouillerEvaluationIndividuelle`, `desactiverFormulaireEvaluation`, `basculerVerrouillageEvaluationCourante`, `verrouillerToutesEvaluations`, `supprimerEvaluation` |
| Banque d'évaluations | 6137-6610 | ~470 | `ouvrirBanqueEvaluations`, `chargerFiltresBanqueEvaluations`, `filtrerBanqueEvaluations`, `afficherListeBanqueEvaluations`, `chargerEvaluationDepuisBanque`, `supprimerEvaluationBanque` |
| Recherche sidebar / navigation profil / travail | 6851-7138 | ~290 | `ouvrirBanqueAvecRecherche`, `ouvrirProfilDepuisEvaluation`, `ouvrirTravailDepuisEvaluation` |
| Jetons personnalisés + copie TSV/SRPNF | 7037-7239 | ~200 | `afficherJetonsPersonnalisesEvaluation`, `appliquerJetonPersonnalise`, `copierEnFormatTSV`, `copierCriteresSRPN`, `copierCriteresSRPNF` |
| Handlers calcul + édition fichier | 7240-7348 | ~110 | `calculerNoteAlgoSimpleHandler`, `calculerNoteAlgoCatHandler`, `editerFichierDepuisEvaluation` |

#### Découpage proposé (6 sous-modules)

| Sous-module cible | LOC approx | Contenu | Risque |
|---|---:|---|---|
| `evaluation-chargement.js` | ~1 000 | Chargement initial, sélection grille/cartouche, auto-save | Faible |
| `evaluation-calcul.js` | ~640 | Calcul des notes (algorithmique + simple + catégories) | Faible (logique pure) |
| `evaluation-retroaction.js` | ~2 250 | Génération + copie + bascule vue des rétroactions | **Moyen** (à éclater à terme en 2) |
| `evaluation-sauvegarde.js` | ~810 | Sauvegarde, jetons, badges, statuts | **Élevé** (touche `evaluationEnCours`) |
| `evaluation-liste.js` | ~1 100 | Liste, filtres, tri, mémorisation, banque, recherche | Moyen |
| `evaluation-modification.js` | ~1 360 | Mode modification, verrouillage, navigation série | **Élevé** (touche `evaluationEnCours`) |
| `evaluation-handlers.js` | ~310 | Jetons perso, copies, handlers calcul, édition fichier | Faible |

#### Fonctions top-complexité identifiées par l'audit

- `sauvegarderEvaluationModifiee` (ligne 5719, dans `evaluation-modification.js`) — cible cyclomatic ≤ 30.
- `modifierEvaluation` (ligne 5207, dans `evaluation-modification.js`) — cible cyclomatic ≤ 30.
- `verifierEtChargerEvaluationExistante` (ligne 4611, dans `evaluation-modification.js`) — cible cyclomatic ≤ 30.

#### Doublons à résoudre

Trois fonctions sont définies **deux fois** dans le fichier — bug latent à investiguer :

| Fonction | Ligne 1 | Ligne 2 | Action recommandée |
|---|---:|---:|---|
| `restaurerPreferenceTri` | 4295 | 4309 | Comparer les deux corps, conserver la bonne, supprimer l'autre |
| `obtenirClasseNote` | 3681 | 4390 | Signatures différentes — vérifier laquelle est référencée par les call-sites |
| `filtrerListeEvaluations` | 4178 | 6851 | Conserver la version utilisée par le HTML, supprimer l'autre |

#### Code mort à retirer (T-L de l'audit 1.3)

- `calculerRisqueEchec` (ligne 3634) — vocabulaire alarmiste, fonction non référencée.
- `obtenirClasseRisque` (ligne 3644) — idem.

#### États globaux partagés (risques de régression)

| Variable | Manipulée à | Rôle |
|---|---|---|
| `window.evaluationEnCours` | 15+ endroits dans le module | State machine de l'évaluation en cours |
| `window._moyennesQualifies` | 2382, 7126 | Cache des moyennes qualifiées |
| `window._moyennesToutes` | 2383, 7127 | Cache des moyennes globales |
| `window._modifierEvaluationEnCours` | 5222, 5339, 5710 | Flag mode modification |
| `window._forceStandaloneEval` | 5332 | Flag mode standalone |
| `window._snapshotAvantModifRemplacee` | 5922 | Snapshot pour annulation |

**Implication pour le découpage** : `window.evaluationEnCours` doit rester accessible aux sous-modules `evaluation-chargement`, `evaluation-sauvegarde`, `evaluation-modification`. Soit on garde l'état global tel quel, soit on l'encapsule dans un nouvel `evaluation-state.js` qui expose une API (`getEvaluationEnCours()`, `setEvaluationEnCours(...)`, `resetEvaluationEnCours()`).

#### Tests de régression à écrire AVANT refactoring

Cas-tests prioritaires (Vitest + Playwright) :

1. **Chargement d'une évaluation existante** : ouvrir une évaluation existante d'un étudiant, vérifier que tous les critères affichent les bons niveaux.
2. **Calcul de note** : 3 cas : note simple, note avec catégories, note SRPNF. Comparer la note calculée à la note attendue.
3. **Sauvegarde nouvelle évaluation** : créer + sauvegarder + relire en base, vérifier intégrité.
4. **Modification d'évaluation** : ouvrir existante + modifier 2 critères + sauvegarder + vérifier que les autres critères sont préservés.
5. **Filtre par production** : appliquer le filtre par production, vérifier que les bons étudiants sont affichés (**ce cas confirme aussi le fix du bug `eval.productionId`**).
6. **Verrouillage** : verrouiller une évaluation, tenter de la modifier, vérifier que l'interface est bien désactivée.
7. **Auto-save** : modifier un critère, attendre le debounce, vérifier que la sauvegarde a eu lieu.

Au minimum 7 tests Vitest et 2-3 tests Playwright avant de toucher `sauvegarderEvaluationModifiee` ou `modifierEvaluation`.

---

### 2.2 `productions.js` (3 994 LOC, 75 fonctions)

#### Statistiques

- **69 accès `db.*`** — clean.
- **11 mentions des clés SSOT critiques** — couplage modeste.
- **42 exports `window.X`** — large mais cohérent avec le pattern dispatcher.
- **État global mineur** : `window.productionEnCoursEdition`, `window._productionsImportEnAttente`.

#### Zones fonctionnelles identifiées

| Zone | Lignes | LOC | Fonctions clés |
|---|---|---:|---|
| Helpers et accesseurs | 56-176 | ~120 | `getCleProductions`, `getCleGrilles`, `obtenirEcheanceEffective`, `obtenirEcheancePlusTot`, `trierListeProductions`, `detecterDoublonsProductions`, `genererBadgeSourceProduction`, `genererIdCourtProduction` |
| Affichage tableau + formulaire | 177-805 | ~630 | `afficherTableauProductions`, `peuplerEcheancesParGroupe`, `verifierDateHorsTrimestre`, `afficherInfoSeanceEcheance`, `lireEcheancesParGroupeDepuisFormulaire`, `afficherFormProduction` |
| CRUD (sauvegarde, modification, suppression, déplacement) | 805-1297 | ~490 | `sauvegarderProduction` (top-complexité cyc 79), `annulerFormProduction`, `modifierProduction`, `supprimerProduction`, `verrouillerEvaluation`, `monterEvaluation`, `descendreEvaluation` |
| Gestion type / ponderation / portfolio | 1298-1666 | ~370 | `gererChangementTypeProduction`, `synchroniserGrilles`, `chargerArtefactsDisponibles`, `mettreAJourPonderationTotale`, `mettreAJourResumeTypes`, `getTypeLabel`, `gererPortfolio` |
| Affichage par type + bibliothèque partagée | 1667-2629 | ~960 | `afficherToutesLesProductionsParType`, `ajouterProductionAuType`, `migrerProductionsVersBibliotheque`, `preparerDonneesBibliothequeProductions`, `afficherBibliothequeProductions`, plus tout le CRUD bibliothèque |
| Import / export | 2630-3273 | ~640 | `exporterProductions`, `exporterProductionActive`, `importerDansProductionActive`, `importerProductions`, `verifierMigrationCategories`, `afficherAssistantMigrationCategories` |
| Liste filtrée + duplication + actions | 3314-3993 | ~680 | `dupliquerEtEditerProduction`, `afficherListeProductions`, `filtrerListeProductions`, `chargerProductionPourModif`, `creerNouvelleProduction`, `dupliquerProduction`, `supprimerProductionActive` |

#### Découpage proposé (4 sous-modules)

| Sous-module cible | LOC | Contenu | Risque |
|---|---:|---|---|
| `productions-core.js` | ~1 610 | Helpers, affichage tableau/formulaire, CRUD, gestion type/ponderation | Moyen |
| `productions-bibliotheque.js` | ~960 | Bibliothèque partagée (afficher, ajouter, importer, retirer, dupliquer, migrer) | Faible |
| `productions-import-export.js` | ~640 | Import/export, assistant migration catégories | Faible |
| `productions-liste.js` | ~680 | Liste filtrée, duplication active, suppression active | Faible |

#### Fonctions top-complexité

- `sauvegarderProduction` (ligne 805) — cyclomatic 79. Cible : éclater en sous-fonctions par section du formulaire (identité, échéances, grilles, ponderation).

#### États globaux

| Variable | Rôle |
|---|---|
| `window.productionEnCoursEdition` | Production active en édition |
| `window._productionsImportEnAttente` | File d'attente pour import confirmé |
| `window.confirmerImportProductions` (fonction globale réassignée) | Callback post-aperçu |

#### Tests de régression

1. **Création d'une production** : nouvelle production + sauvegarde + relecture, vérifier les échéances par groupe.
2. **Modification d'une production existante** : ouvrir + modifier titre + sauvegarder + vérifier que la grille associée n'est pas changée.
3. **Suppression d'une production** : supprimer + vérifier que les évaluations associées sont en cascade (préservées ? supprimées ? vérifier le comportement attendu).
4. **Import / export** : exporter un ensemble de productions, ré-importer, vérifier intégrité.
5. **Bibliothèque partagée** : ajouter une production locale à la bibliothèque, vérifier qu'elle est accessible aux autres trimestres.
6. **Verrouillage** : verrouiller une évaluation associée à une production, vérifier que la modification de la production est bloquée ou avertit.

Au minimum 6 tests Vitest avant refactor de `sauvegarderProduction`.

#### Écarts observés à l'exécution (étape 1 lecture — 15 mai 2026, refactor non démarré)

Lecture complète des 3 994 LOC + audit ESLint complexity + grep helpers cross-module + scan callers externes. Annotations à compléter quand le découpage sera effectif. La rétrospective finale ira en §6.5 + dans METHODE-REFACTORING §7.

**Écart #1 — Conflit de nommage `productions-bibliotheque.js`** : un fichier `js/productions-bibliotheque.js` (303 LOC) existe déjà et est chargé AVANT `productions.js` dans `index.html` (ligne 16048). Il contient le **storage layer** de la bibliothèque partagée (clé non-namespacée `bibliothequeProductions`) : `obtenirToutesLesProductionsBibliotheque[Sync]`, `obtenirProductionsParDiscipline`, `ajouterALaBibliotheque`, `retirerDeLaBibliotheque`, `importerDansBibliotheque`, `exporterBibliotheque`, `migrerVersBibliotheque`, `listerTrimestresAvecProductions`, etc. Le sous-module `productions-bibliotheque.js` proposé par §2.2 ci-dessus (~960 LOC) concerne la **partie UI** (afficherBibliothequeProductions, preparerDonneesBibliothequeProductions, modale de gestion, sections sélection/disponibles, filtres discipline). À résoudre avant la première extraction. Options : (a) renommer le sous-module UI en `productions-bibliotheque-ui.js` — recommandé, pattern cohérent storage/ui ; (b) fusionner UI dans le fichier existant (le storage devient ~1 263 LOC). Décision Grégoire.

**Écart #2 — Top-complexité élargi** : MODULES-MAP §2.2 listait `sauvegarderProduction` (cyc 79) comme seule fonction au-dessus de cyc 30. L'audit ESLint sur le code actuel (`npx eslint --no-config-lookup --rule '{"complexity": ["error", 15]}'`) révèle **2 fonctions au-dessus de cyc 30** :

| Fonction | Ligne | Cyc actuel | MODULES-MAP §2.2 |
|---|---:|---:|---|
| `sauvegarderProduction` | 805 | **80** | 79 (proche) |
| `afficherFormProduction` | 600 | **47** | non listé |

L'étape 4 (refactoring top-complexité) doit donc traiter `afficherFormProduction` en plus de `sauvegarderProduction`. Plan de découpage proposé pour `afficherFormProduction` : séparer chargement des sélecteurs (grille/échelle/cartouche), branche mode-modification (pré-remplissage), branche mode-création (réinit). 8 autres fonctions au-dessus de cyc 15 (héritage, refactor cosmétique optionnel) : `peuplerEcheancesParGroupe` 27, `gererChangementTypeProduction` 29, `genererHtmlProduction` (nested) 25, `exporterProductionActive` 25, arrow `.map()` ligne 190 = 21, `afficherInfoSeanceEcheance` 20, `afficherToutesLesProductionsParType` 18, arrow ligne 3955 = 16.

**Écart #3 — Helpers cross-module** (anti-pattern §5.6) : **aucun helper local `rendre*`/`echapper*`/`tronquer`/`format*` interne au module** (contrairement à `bilan-reflexif.js`). Les utilitaires partagés sont au début du module (lignes 56-176) et iront naturellement dans le résidu `productions-core.js` consommé par les sous-modules extraits — c'est le pattern inverse de bilan-reflexif. `afficherNotificationSucces/Erreur` consommés via `typeof X === 'function'` (défensif, cross-module — définitions dans `js/trimestre-v2.js` 19/26, `js/evaluation.js` 3583, `js/groupe.js` 47). `echapperHtml` consommé 15 fois (helper global, hors module). `BibliothequeUI` consommé 15 fois (dépendance ferme à `js/bibliotheque-ui.js`).

**Écart #4 — Surface d'exports `window.X`** : 47 exports au total, dont 3 réaffectations en bas du fichier (`window.sauvegarderProduction`, `window.annulerFormProduction`, `window.supprimerProduction` ligne 3873/3898/3923) qui wrappent les fonctions originales pour ajouter le rechargement de la sidebar. **Pattern wrappers** à conserver pendant le découpage : ces 3 réaffectations utilisent les variables module-scope `sauvegarderProductionOriginale` (3872), `annulerFormProductionOriginale` (3897), `supprimerProductionOriginale` (3922). Doivent rester groupées dans le résidu `productions-core.js` (anti-pattern §5.3 — variables module-scope partagées entre fonctions, ne peuvent pas être réparties entre sous-modules).

**Écart #5 — Callers externes** : `js/donnees-v2.js:1710` réassigne `window.afficherTableauProductions` (à investiguer — pourquoi ce module redéfinit-il une fonction de productions.js ?). `js/reserve-ouvrir.js:1120-1121` consomme `window.importerProductionsExternes`. `js/export-pdf.js:2166` définit `window.exporterProductionsEnPDF` (fonction homonyme distincte). Aucun autre caller externe identifié pour les 47 exports — la plupart sont consommés via le dispatcher `data-action`.

**Écart #6 — Bugs latents détectés** (inscrits dans `Retours des testeurs/SUIVI-BUGS.md` #96 et #97, priorité basse) :

1. **#96 — `event.target.value` ligne 2972** dans `importerProductions(eventOuEl)`. Variable `event` non-définie dans le scope IIFE — probablement masqué par `window.event` (Chrome/Safari rétro-compat). Devrait utiliser `target` capturé à la ligne 2917.
2. **#97 — `window.productionEnCoursEdition` jamais positionnée** : la state machine du formulaire utilise `productionEnEdition` (let dans `js/config.js:133`, sans `window.`), tandis que les wrappers en bas (lignes 3883/3916/3938) lisent/écrivent `window.productionEnCoursEdition`. Code mort silencieux : `definirProductionActive(id)` après save (3889) et `annulerFormProduction()` après suppression d'item actif (3939) ne se déclenchent jamais. À harmoniser pendant le refactor : soit migrer toute la state vers `window.productionEnCoursEdition` (avec `productionEnEdition = window.productionEnCoursEdition`), soit supprimer les références mortes.

**Écart #7 — Découpage proposé : tailles révisées** (estimations après lecture) :

| Sous-module | LOC §2.2 | LOC effectif estimé | Périmètre |
|---|---:|---:|---|
| `productions-core.js` (résidu) | ~1 610 | ~1 700 | Helpers (56-176), tableau (177-253), form (255-775), CRUD sauvegarder/annuler/modifier/supprimer/verrouiller/monter/descendre (805-1271), gestion type/portfolio (1298-1665), init/migration (1891-1937), wrappers sidebar (3868-3943) |
| `productions-bibliotheque-ui.js` *(renommé — cf. écart #1)* | ~960 | ~730 | Bibliothèque UI (1898-2629). Surcoût LOC §2.2 surévalué. |
| `productions-import-export.js` | ~640 | ~643 | Import/export CC + assistant migration catégories (2630-3273) |
| `productions-liste.js` | ~680 | ~715 | Sidebar : liste filtrée, duplication, suppression active, importerProductionsExternes (3278-3993 sauf wrappers) |

Total estimé : ~3 788 LOC (vs 3 994 LOC actuels, écart ~5 % attribuable à découpe nette des frontières).

---

### 2.3 `profil-etudiant.js` (8 818 LOC, 105 fonctions)

#### Statistiques

- **44 accès `db.*`**, **2 accès `localStorage` direct** (contournements à investiguer — lignes à identifier).
- **46 mentions des clés SSOT critiques**.
- **24 exports `window.X`**.
- **État global central** : `window.profilActuelDA` (DA de l'étudiant en cours d'affichage).

#### Zones fonctionnelles identifiées (par bloc)

| Bloc | Lignes | LOC | Domaine |
|---|---|---:|---|
| Helpers + accesseurs | 70-303 | ~230 | Terme production, couleurs IDME, conversion pourcentage→niveau, accesseurs pratique/grille/critères, init |
| Badges | 325-407 | ~80 | Pratique, risque, pattern |
| **Interprétation des indices** | 408-643 | ~235 | `interpreterMobilisation` (T-L3 zone grise alarmiste), `interpreterPerformance`, `interpreterCompletion`, `interpreterAssiduite` |
| Section Mobilisation Engagement (XXL) | 644-1389 | ~745 | `genererSectionMobilisationEngagement` |
| Section Accompagnement | 1454-1919 | ~465 | `genererSectionAccompagnement` |
| Section Mobilisation | 1920-2043 | ~120 | `genererSectionMobilisation` |
| Indices + détails assiduité | 2044-2213 | ~170 | `obtenirCouleurIndice`, `obtenirEmojiIndice`, `obtenirDetailsAssiduite` |
| Cibles + sections collapsibles | 2214-2373 | ~160 | `genererCarteCibleIntervention`, `genererSectionCollapsible`, `toggleSectionCollapsible`, `toggleDetailsTechniques` |
| Navigation profil + directions | 2374-2724 | ~350 | `changerSectionProfil`, `calculerDirectionRisque`, `calculerDirectionsCriteres`, `genererHistoriqueInterventionsProfil`, `genererValeursComparatives` |
| Affichage profil complet | 2725-3119 | ~395 | `afficherProfilComplet` |
| Section Assiduité + Productions + Objectifs + Bandeau | 3120-3756 | ~635 | `genererSectionAssiduite`, `genererSectionProductions`, `genererTableauObjectifs`, `genererBandeauContexteProfil` |
| Section Progression + Détails indice | 3757-4011 | ~255 | `genererSectionProgression`, `toggleDetailIndice`, `fermerDetailIndice` |
| Section Complétion | 4012-4189 | ~180 | `genererSectionCompletion` |
| **Calculs pédagogiques** | 4190-5404 | ~1 215 | Conversion IDME, moyennes critères, IPB, diagnostic suivi, forces/défis, indices N derniers artefacts, progression, défi, pattern, RaI, alerte contextuelle, cible intervention |
| Diagnostics SRPNF/Critères/Générique | 5693-6186 | ~495 | `genererDiagnosticCriteres`, `genererDiagnosticSRPNF`, `genererDiagnosticGenerique`, `_genererBarresSRPNF` |
| Blocs RLO + Évolution | 6187-6520 | ~335 | RLO, Consolidation, Gestes cognitifs, Note RLO, Onglets, Évolution |
| Section Performance | 6520-7147 | ~625 | `genererSectionPerformance` |
| Section Assiduité Legacy + Navigation + Toggles | 7148-7461 | ~315 | `genererSectionAssiduiteLegacy`, navigation présence/intervention |
| Rapport API + Génération + Copie | 7462-7826 | ~365 | `genererRapportAPI`, `genererSectionRapport`, `genererEtAfficherRapport`, `copierRapport`, `viderRapport`, préférences |
| Consultation évaluation + Note finale | 7851-8288 | ~440 | `consulterEvaluation`, `evaluerProduction`, `supprimerEvaluationDepuisProfil`, `calculerDetailsNoteFinale` |
| Jetons personnalisés | 8289-8353 | ~65 | `attribuerJetonPersonnaliseAvecPrompt`, `retirerJetonPersonnaliseAvecConfirmation` |
| Patterns groupe | 8354-8460 | ~110 | `calculerEtStockerPatternsGroupe`, `obtenirPatternEtudiant` |
| Modal confidentiel | 8461-8716 | ~260 | Ouverture, chargement notes/présences, sauvegarde, services adaptés, sous-catégories |
| Section Travaux + handlers | 8717-8818 | ~105 | `genererSectionTravaux`, handlers toggles, export annoté |

#### Découpage proposé (7 sous-modules)

| Sous-module cible | LOC | Contenu | Risque |
|---|---:|---|---|
| `profil-etudiant-helpers.js` | ~545 | Helpers, badges, interprétations indices (incluant correction T-L3 sur `interpreterMobilisation`) | Faible (logique pure) |
| `profil-etudiant-sections-affichage.js` | ~3 700 | Toutes les `genererSection*`, navigation profil, affichage profil complet | **Élevé** (encore gros — éclater plus tard en sous-sections) |
| `profil-etudiant-calculs.js` | ~1 215 | Moyennes critères, IPB, diagnostic apprentissage, forces/défis, progression, pattern, RaI | Faible (logique pure, **mais testé empiriquement par 1.2 — 156/157 cas conformes**) |
| `profil-etudiant-diagnostics.js` | ~830 | Diagnostics critères/SRPNF/générique, blocs RLO, évolution | Moyen |
| `profil-etudiant-rapport.js` | ~365 | Rapport API, génération, copie, préférences | Faible |
| `profil-etudiant-actions.js` | ~615 | Consultation évaluation, calcul note finale, jetons perso, patterns groupe, navigation | Moyen |
| `profil-etudiant-confidentiel.js` | ~365 | Modal confidentiel + section Travaux + handlers | **Élevé** (PII — données sensibles, voir SKILL_Securite_donnees.md) |

#### Fonctions top-complexité (à confirmer par ESLint complexity)

L'audit `02-2-complexity.md` ne nomme pas explicitement les fonctions de ce module dans son top 5, mais signale qu'il contribue aux 387 fonctions au-delà du seuil. Candidates par taille :

- `genererSectionMobilisationEngagement` (~745 LOC) — quasi certainement au-delà du seuil
- `afficherProfilComplet` (~395 LOC)
- `genererSectionPerformance` (~625 LOC)
- `calculerDetailsNoteFinale` (~300 LOC)
- `genererRapportAPI` (~145 LOC)

#### États globaux

| Variable | Rôle |
|---|---|
| `window.profilActuelDA` | DA de l'étudiant actuellement affiché — état central |
| `window.etudiantsListeCache` | Cache de la liste d'étudiants |
| `window._avertiGrilleMoyennes` | Flag pour éviter d'avertir deux fois |
| `window._consulterEvalTimerId`, `window._apresOuvertureFichier` | États transitoires de l'ouverture de fichiers d'évaluation |

#### Tests de régression

1. **Affichage profil complet** : ouvrir le profil de plusieurs étudiants test, vérifier qu'aucune erreur console.
2. **Calcul IPB** : `calculerIPB(da)` sur 3 cas synthétiques — vérifier valeur (cas testés en 1.2 de l'audit, **réutiliser les snippets**).
3. **Calcul moyennes critères** : `calculerMoyennesCriteres(da)` sur cas réel — comparer aux valeurs attendues (idem 1.2).
4. **Diagnostic apprentissage** : `diagnostiquerSuiviApprentissage(da)` sur cas réel — vérifier valeur (idem 1.2).
5. **Pattern actuel** : `identifierPatternActuel(P, défi)` sur 5 cas (cas tests 1.2).
6. **Niveau RaI** : `determinerNiveauRaiPedagogique(da)` sur cas réel.
7. **Modal confidentiel** : ouvrir + remplir + sauvegarder + relire, vérifier persistance des données sensibles (FileVault assumé).

Au minimum 7 tests Vitest, **dont 5 réutilisables des snippets de 1.2 calculations-tests.md**.

---

### 2.4 `trimestre-v2.js` (6 584 LOC, 164 fonctions)

#### Statistiques

- **203 accès `db.*`** — le plus dense de tous les modules !
- **8 mentions des clés SSOT critiques** — surtout `pratiquesConfigurables`.
- **53 exports `window.X`** — surface énorme (confirmé par audit 3.3 à 134 symboles).
- **État global central** : `window.trimestreActif`.

#### Zones fonctionnelles identifiées

| Zone | Lignes | LOC | Domaine |
|---|---|---:|---|
| Helpers notifications (à consolider hors module) | 19-41 | ~25 | `afficherNotificationSucces`, `afficherNotificationErreur` |
| Init + Identification + Calendrier + Événements | 42-911 | ~870 | `initialiserTrimestreV2`, identification, cadre calendrier, bornes, semaines spéciales, stats, événements prévus/imprévus, formulaires |
| Liste / archivage trimestres | 911-1271 | ~360 | `populerDropdownTrimestreV2`, `afficherListeTrimestreGestion`, `confirmerArchivage`, `confirmerDesarchivage`, `archiverTrimestreActif`, `supprimerTrimestreActif` |
| Bibliothèque + Modal nouveau trimestre | 1164-1396 | ~230 | `ouvrirBibliothequeTrimestreV2`, `fermerModalBibliothequeTrimestres`, `ouvrirModalNouveauTrimestre`, `changerTrimestreActifV2` |
| **Cours (CRUD + synthèses)** | 1397-2363 | ~970 | `chargerDropdownCoursV2`, `changerCoursSelectionneV2`, `supprimerCoursV2`, affichage détails/syntheses, formulaires cours, `sauvegarderCoursV2`, `ouvrirModalNouveauCours` |
| **Étudiants** | 2364-3257 | ~895 | `chargerListeEtudiantsV2`, `populerDropdownGroupesV2`, `filtrerParGroupeV2`, `soumettreEtudiantV2`, `editerEtudiantV2`, `supprimerEtudiantV2`, import/export, groupes |
| **Horaires (CRUD + séances)** | 3258-4087 | ~830 | `chargerSeancesV2`, formulaires séances, `chargerHorairesV2`, `populerDropdownHorairesV2`, `changerHoraireSelectionneV2`, `nouveauHoraireV2`, `editerHoraireV2`, `sauvegarderHoraireV2`, `supprimerHoraireV2`, `mettreAJourSeancesHoraireV2`, `calculerHeureFin` |
| **Groupes-cours (CRUD + bibliothèque)** | 4088-5165 | ~1 080 | `chargerGroupeCoursV2`, `populerDropdownGroupeCoursV2`, `populerDropdownsAssemblageV2`, `mettreAJourNomGroupeCoursV2`, `changerGroupeCoursSelectionneV2`, `nouveauGroupeCoursV2`, `editerGroupeCoursV2`, `sauvegarderGroupeCoursV2`, `supprimerGroupeCoursV2`, bibliothèque (activer, supprimer, masquer, afficher) |
| Format horaire + handlers + guide | 5110-5437 | ~330 | `mettreAJourOptionsFormatHoraire`, `mettreAJourFormatHoraire`, `mettreAJourInfoDuree`, handlers étudiants, `mettreAJourGuideGroupeCours`, `allerVersAide` |
| **Enseignants** | 5438-5752 | ~315 | `chargerProfilEnseignantV2`, `populerDropdownEnseignantsV2`, `chargerEnseignantSelectionneV2`, `nouveauProfilEnseignantV2`, `sauvegarderEnseignantV2`, `supprimerProfilEnseignantV2` |
| **Orchestre groupe-cours actif** | 5753-6477 | ~725 | `peuplerDropdownGroupeCoursActif`, `changerGroupeCoursDepuisHeader`, `changerGroupeCoursActifV2` (top-complexité cyc 86), `peuplerDropdownEnseignants`, `mettreAJourApercuGroupeCours`, `accederCalendrierRapide`, `mettreAJourBarreContexte` |

#### Découpage proposé (8 sous-modules + 1 helper externe)

Le découpage suggéré par l'audit `03-summary.md` était 4 axes (étudiants, horaires, cours, orchestre). Je propose plus fin :

| Sous-module cible | LOC | Contenu | Risque |
|---|---:|---|---|
| `js/utils-notifications.js` (commun) | ~25 | `afficherNotificationSucces`/`Erreur` consolidées | Faible |
| `trimestre-v2-init.js` | ~870 | Init + identification + calendrier + événements | Moyen |
| `trimestre-v2-liste.js` | ~590 | Liste trimestres + archivage + bibliothèque + modal nouveau | Faible |
| `trimestre-v2-cours.js` | ~970 | CRUD cours + synthèses | Moyen |
| `trimestre-v2-etudiants.js` | ~895 | Étudiants + groupes + import/export | Moyen |
| `trimestre-v2-horaires.js` | ~830 | Horaires + séances + format | Moyen |
| `trimestre-v2-groupes-cours.js` | ~1 080 | Groupes-cours + bibliothèque + assemblage | Moyen |
| `trimestre-v2-enseignants.js` | ~315 | Profils enseignants | Faible |
| `trimestre-v2-orchestre.js` | ~725 | Changement groupe-cours actif + barre contexte (top-complexité) | **Élevé** |

#### Fonctions top-complexité identifiées par l'audit

- `changerGroupeCoursActifV2` (ligne 5864, dans `trimestre-v2-orchestre.js`) — cyclomatic 86. Cible cyc ≤ 30.

#### États globaux

| Variable | Rôle |
|---|---|
| `window.trimestreActif` | ID du trimestre actif — état pivot du contexte |

C'est l'état le plus critique du projet : tout le namespacing des données dépend du `trimestreActif`. Un découpage qui casse cette cohérence corrompt potentiellement tout le stockage. **Précaution** : `changerGroupeCoursActifV2` doit garder l'atomicité de la transition (toutes les variables dépendantes du contexte se mettent à jour, ou aucune).

#### Tests de régression

1. **Création d'un trimestre** : nouveau trimestre + identification + calendrier + sauvegarde + relecture.
2. **Création cours/groupes-cours/horaire/enseignant** : CRUD complet sur chaque entité.
3. **Changement de groupe-cours actif** : passer d'un groupe-cours à un autre, vérifier que (a) le bandeau de contexte se met à jour, (b) les vues internes (calendrier, productions, évaluations) reflètent le nouveau contexte, (c) aucune donnée n'est perdue.
4. **Archivage d'un trimestre** : archiver le trimestre actif, vérifier qu'on bascule sur un autre trimestre + que l'archive est accessible en bibliothèque.
5. **Import/export d'étudiants** : importer un CSV de 30 étudiants, vérifier que tous sont créés + dans le bon groupe.

Au minimum 5 tests Vitest + 2 tests Playwright avant refactor de `changerGroupeCoursActifV2`.

---

### 2.5 `bilan-reflexif.js` (4 716 LOC, 153 fonctions)

#### Statistiques

- **10 accès `db.*`**, **2 accès `localStorage` direct** (à investiguer), **5 appels `window.cle(...)`** (le seul des 5 modules à les faire — à consolider via `db.*`).
- **0 mention de clé SSOT critique** — couplage faible avec les globaux partagés.
- **4 exports `window.X`** seulement — module bien encapsulé.

#### Zones fonctionnelles identifiées

| Zone | Lignes | LOC | Domaine |
|---|---|---:|---|
| Styles + init + interface principale | 15-387 | ~370 | `injecterStyles`, `genId`, `initialiserBilanReflexif`, `rendreInterface`, `afficherVue`, `afficherToast`, `libelleTypeQuestion` |
| Éditeur de questionnaire | 407-1148 | ~740 | `rendreEditeur`, `rendreDetailsQuestion`, `rendreBlocHTML`, modifications préambule/description/titre, toggles, édition/suppression/déplacement questions, options, énoncés, NA |
| Formatage texte + export | 1150-1296 | ~145 | `formaterQuestionnaireEnTexte`, `exporterTexte` |
| Parser texte + modèle + import modale | 1297-1953 | ~655 | `parserQuestionnaireTexte`, `genererModeleTexte`, `telechargerModele`, `copierPromptIA`, `injecterModaleImport`, `ouvrirModaleImport`, `fermerModaleImport`, `appliquerImport` |
| Aide + utilitaires recherche | 1954-2013 | ~60 | `rendreAideHTML`, `toggleAide`, `trouverBloc`, `trouverQuestion`, `trouverQuestionPerso`, `sauvegarderQuestionnaire` |
| Parcours (activités) | 2014-2582 | ~570 | `rendreParcours`, `rendreActiviteHTML`, `rendreQuestionParActiviteHTML`, toggles, edit/suppression QPA, CRUD activités, importerProductions, émotions, transversales, export texte parcours |
| Réflexion explicite | 2584-2981 | ~395 | `rendreReflexion`, `rendreQuestionMiroirLikertHTML`, `rendreActiviteReflexionHTML`, `rendreQuestionSyntheseHTML`, changement état, toggles, réponses, CRUD questions, sauvegarde |
| Import CSV (parsing + mapping) | 2982-3704 | ~720 | `rendreImport`, `declencherImport`, `traiterFichierCSV`/`Contenu`, `detecterSeparateur`, `parserCSV`, `normaliserTexte`, `similitudeTexte`, `obtenirCiblesMapping`, mapping auto, `afficherMapping`, `modifierMapping`, `confirmerImport`, agrégation, NA/multi-choix, `convertirLikert` |
| Rapport + graphiques + export PDF | 3716-4593 | ~880 | `rendreRapport`, barres Likert/Pct, réponses, vue d'ensemble, scores blocs, signaux, synthèses, graphiques Chart.js, exportPDF |
| Toggles affichage section / sous-section | 4593-4716 | ~125 | `tronquer`, exports finaux |

#### Découpage proposé (7 sous-modules)

| Sous-module cible | LOC | Contenu | Risque |
|---|---:|---|---|
| `bilan-reflexif-core.js` | ~370 | Styles, init, interface principale | Faible |
| `bilan-reflexif-editeur.js` | ~740 | Éditeur de questionnaire | Faible |
| `bilan-reflexif-import-export-texte.js` | ~800 | Formatage texte, parser, modale import | Faible |
| `bilan-reflexif-parcours.js` | ~570 | Parcours d'activités | Faible |
| `bilan-reflexif-reflexion.js` | ~395 | Réflexion explicite | Faible |
| `bilan-reflexif-csv.js` | ~720 | Import CSV (parsing + mapping) | **Moyen** (sécurité imports — `validerMagicBytes` ?) |
| `bilan-reflexif-rapport.js` | ~880 | Rapport, graphiques, export PDF | Moyen (Chart.js — dépendance externe) |

#### Fonctions top-complexité

L'audit ne nomme pas spécifiquement ce module dans son top 5. Candidates par taille :

- `rendreRapport` (~120 LOC autour de 3716)
- `parserQuestionnaireTexte` (~297 LOC autour de 1297)
- Import CSV : `_agregerQuestion` (~127 LOC autour de 3530), `mapperColonnes` (~68 LOC)

#### États globaux

| Variable | Rôle |
|---|---|
| `window.BilanReflexif` (objet conteneur) | API publique du module |
| `window.afficherSousSection`, `window.afficherSection` | Réassignations de fonctions globales (à vérifier — possible conflit avec d'autres modules) |

#### Tests de régression

1. **Création d'un questionnaire** : éditeur, ajout de blocs/questions/options, sauvegarde.
2. **Import texte** : parser un questionnaire texte, vérifier que les blocs/questions/options sont correctement créés.
3. **Export texte** : exporter un questionnaire, vérifier la cohérence avec l'import.
4. **Parcours** : créer un parcours d'activités, ajouter questions par activité, sauvegarder.
5. **Réflexion** : remplir une réflexion avant + après, vérifier que les réponses sont préservées.
6. **Import CSV** : importer un CSV de résultats, vérifier le mapping automatique + l'agrégation.
7. **Rapport** : générer un rapport sur un ensemble de résultats, vérifier les graphiques Chart.js.

Au minimum 7 tests Vitest avant refactor — **module idéal pour démarrer le refactoring** parce que (a) couplage faible aux globaux, (b) zones bien séparées par domaine.

#### Écarts observés à l'exécution (refactoring terminé 2026-05-15)

Branche `refactor/2026-mai`, commits `6f0049c` à `8038c40`. Rétrospective complète : `METHODE-REFACTORING.md` §7 « Module : `bilan-reflexif.js` ».

**Frontières effectives vs proposées** :

| Sous-module | Proposé | Effectif | Écart |
|---|---:|---:|---:|
| `bilan-reflexif-core.js` | 370 | 425 | +15 % |
| `bilan-reflexif-editeur.js` | 740 | 829 | +12 % |
| `bilan-reflexif-import-export-texte.js` | 800 | 888 | +11 % |
| `bilan-reflexif-parcours.js` | 570 | 623 | +9 % |
| `bilan-reflexif-reflexion.js` | 395 | 444 | +12 % |
| `bilan-reflexif-csv.js` | 720 | 815 | +13 % |
| `bilan-reflexif-rapport.js` | 880 | 955 | +9 % |
| `bilan-reflexif.js` (résidu) | — | 284 | — |

Surcoûts homogènes (+9 à +15 %) attribuables à l'overhead IIFE : commentaire d'en-tête + aliases + bloc d'exports `window.X`. **Pas un signal de mauvaise cartographie**, le découpage proposé tient.

**Périmètre du `core` étendu** au-delà du plan initial (styles + 3 utilitaires) pour absorber au fil de l'eau les éléments partagés effectivement nécessaires aux autres sous-modules :
- `etat` partagé (objet mutable par référence), `CLE_QUESTIONNAIRE/RESULTATS/PARCOURS/REFLEXION`
- `sauvegarderQuestionnaire/Parcours/Reflexion` (3 wrappers `db.setSync`)
- `trouverBloc/Question/QuestionPerso` (finders lecture seule)
- `rendreAideHTML`/`toggleAide` (panneaux d'aide repliables — consommés par editeur ET parcours)
- `tronquer` (utilitaire string — consommé par reflexion, csv, rapport)

Décision rétroactive : un sous-module « core » ne se cartographie pas une fois pour toutes, il accueille au fil de l'eau les helpers identifiés comme partagés. À documenter dans la méthode.

**Top-complexité confirmés et corrigés** :

| Fonction | Cyc avant | Cyc après | Méthode |
|---|---:|---:|---|
| `parserQuestionnaireTexte` | **63** | 27 | Extraction en 4 helpers : `_parserPretraitement`, `_parserDecoderType`, `_parserCreerQuestion`, `_parserAjouterChoix` |
| `_agregerQuestion` | **48** | 5 | Dispatch par type dans 4 sous-fonctions (`_agregerLikert/Choix/Matrix/Ouvert`) + helper `_agregerLikertSurColonne` |
| `exporterPDF` | **42** | 6 | Découpage en 7 sous-fonctions partageant un `ctx` mutable (en-tête, table Likert, réponses ouvertes, bloc, synthèse, collecte forces/vigilances, pied de page) |

Zéro fonction au-dessus de cyc 30 dans les 8 modules issus du refactoring (audit `npx eslint --rule '{"complexity": ["error", 30]}'` post-merge).

**Bugs latents découverts pendant le refactoring** (3) :

1. `rendreAideHTML`/`toggleAide` (résidu) appelés par `editeur.js` et `parcours.js` extraits — ReferenceError silencieux au premier rendu DOM. Tests Vitest pures ne couvraient pas.
2. `tronquer` (résidu) appelé par `reflexion.js` extrait — même pattern.
3. Resync ctx ↔ parent introduit pendant la refacto cyc de `parserQuestionnaireTexte` — bug auto-introduit, attrapé immédiatement par test 2 (Import texte modèle).

Fix #1 et #2 : migration vers `core` + aliases. Fix #3 : règle « ne resync que parent → ctx, jamais l'inverse — les closures s'en occupent ».

**Accès `localStorage` direct (signalés §3.2 du document)** : 2 dans `bilan-reflexif.js` → confirmés, restés dans `core.js` après extraction (`rendreAideHTML`/`toggleAide`). Cas légitime : préférence UI locale (état replié/déplié des panneaux d'aide), non namespacée par trimestre. À documenter par commentaire en tête de la section 6 de `core.js`. **Pas une violation de la convention `cle()`**.

**Dette résiduelle** :

- `bilan-reflexif-rapport.js` à 955 LOC (au-dessus du seuil intermédiaire de 1000 mais sous 2000). Pourrait être éclaté à terme en `-rapport-rendu.js` / `-rapport-graphiques.js` / `-rapport-pdf.js`.
- 14 fonctions au-dessus de cyc 15 (cible souple non atteinte). Quasi toutes héritées du code pré-existant (mêmes lignes déplacées). Refactor cosmétique possible plus tard.
- Tests Playwright DOM absents — auraient attrapé les bugs latents #1 et #2 sans grep manuel.
- Audit `no-unused-vars` non passé.

---

## 3. Synthèse cross-modules

### 3.1 Ordre de refactoring recommandé

Critères pris en compte : (a) zone protégée pendant les évaluations de Grégoire (jusqu'au ~22 mai), (b) couplage avec autres modules, (c) gain qualitatif attendu.

| Ordre | Module | Justification | Fenêtre |
|---|---|---|---|
| 1 | `bilan-reflexif.js` | Module le moins couplé, zones très distinctes, faible risque de casser quoi que ce soit. Idéal pour valider la méthode et les tests de régression. | 15-19 mai (parallèle aux évaluations Grégoire) |
| 2 | `productions.js` | Domain clair (CRUD), couplage modeste. `sauvegarderProduction` à découper. | 15-19 mai (modifications mineures pendant évaluations possibles si tests verts) |
| 3 | `trimestre-v2.js` | Le plus de fonctions (164), gros mais découpage clair par domaine (cours, étudiants, horaires, groupes-cours, etc.). Risque sur `changerGroupeCoursActifV2` (cyc 86) — atomicité de l'état global. | 19-23 mai (après évaluations Grégoire) |
| 4 | `profil-etudiant.js` | Le plus gros (8 818 LOC). Calculs pédagogiques **déjà validés par 1.2** — donc le risque est dans l'affichage, pas dans la logique. | 19-23 mai |
| 5 | `evaluation.js` | Le plus couplé à `evaluationEnCours` + Grégoire l'utilise tous les jours pour ses corrections. À faire en dernier, après vérification que les autres refactorings n'ont pas créé de régression. Inclut la résolution des 3 doublons + retrait du code mort. | 19-23 mai, tests intensifs |

### 3.2 Patterns récurrents à consolider

Repérés dans les scans, recoupent les recommandations de l'audit 3.x :

- **`afficherNotificationSucces` / `afficherNotificationErreur`** : redéfinis dans `evaluation.js` et `trimestre-v2.js`. À consolider dans `js/utils-notifications.js`.
- **Accès `localStorage` direct** : 2 dans `profil-etudiant.js`, 2 dans `bilan-reflexif.js`. Les lignes exactes sont à identifier — probables contournements de `db.*` à corriger.
- **Appels `window.cle(...)`** : 5 dans `bilan-reflexif.js`, 0 ailleurs. À examiner — soit consolidation via `db.*`, soit légitime.
- **3 fonctions doublonnées dans `evaluation.js`** (`restaurerPreferenceTri`, `obtenirClasseNote`, `filtrerListeEvaluations`) — bugs latents à résoudre.
- **Code mort identifié** : `calculerRisqueEchec` et `obtenirClasseRisque` dans `evaluation.js`. À retirer (T-L de l'audit 1.3 — vocabulaire alarmiste).

### 3.3 Estimation d'effort

L'audit donne ~25-35 h pour les axes 2 et 3 cumulés. Ventilation indicative pour les 5 god modules :

| Module | Sous-modules cibles | Effort estimé | Notes |
|---|---:|---:|---|
| `bilan-reflexif.js` | 7 | ~4-6 h | Module pilote, méthode à mettre au point |
| `productions.js` | 4 | ~3-4 h | Domain clair, sauvegarderProduction à éclater |
| `trimestre-v2.js` | 8 + 1 helper | ~8-12 h | Le plus dispersé, mais zones distinctes |
| `profil-etudiant.js` | 7 | ~6-9 h | Le plus gros, mais calculs déjà validés |
| `evaluation.js` | 6-7 | ~6-8 h | Le plus risqué, état global central |
| **Total** | **32-33** | **~27-39 h** | Cohérent avec l'estimation audit |

### 3.4 Dépendances de refactoring identifiées

- Avant `evaluation.js` : avoir refactoré `productions.js` (pour le filtre par production, `obtenirEcheanceEffective`, etc.) et `profil-etudiant.js` (pour `consulterEvaluation`).
- Avant `profil-etudiant.js` : `profil-etudiant-calculs.js` peut être extrait **en premier** parce que les tests de 1.2 calculations-tests.md couvrent déjà cette zone.
- Pendant `trimestre-v2.js` : la consolidation `js/utils-notifications.js` est un préalable.

---

## 4. Limites de cette cartographie

- **Pas de lecture intégrale du code** : les frontières proposées reposent sur les noms de fonctions et les comptages structurels. Des dépendances internes (closures, variables module-scope) peuvent les invalider.
- **Pas d'exécution de ESLint complexity** : les fonctions top-complexité réelles dans chaque module sont partiellement inférées du SUMMARY-internal. Avant de découper, lancer `npx eslint --rule '{"complexity": ["error", 10]}' js/<module>.js` pour obtenir la liste précise.
- **Pas de relevé des call-sites externes** : pour chaque fonction exportée `window.X`, il faudra grep les autres modules pour identifier qui appelle quoi avant de scinder. Par exemple, `evaluation.js` exporte ~57 fonctions — chacune doit être tracée à ses consommateurs.
- **Pas de mesure de couverture des tests existants** : il y a 32 tests Vitest + 6 Playwright (Défense I). Combien couvrent les god modules ? À mesurer.
- **Pas de validation par Grégoire** des frontières fonctionnelles proposées. Sa connaissance contextuelle du projet peut révéler des cohésions ou découpages que les noms de fonction ne disent pas.

---

## 5. Articulation avec les autres documents

- **`audit/PLAN-MOYEN-TERME.md`** (à rédiger) : ce document est l'annexe technique du plan moyen terme.
- **`audit/PLAN-COURT-TERME.md`** (à rédiger) : reprendra notamment le fix `eval.productionId` et le retrait du code mort `calculerRisqueEchec` / `obtenirClasseRisque` comme actions courtes pré-refactoring.
- **`audit/reports/SUMMARY-internal.md`** : référence des constats d'audit qui sous-tendent ce document.
- **`audit/reports/03-summary.md`** : propose les axes de découpage de `trimestre-v2.js` (4 axes) et `reserve.js` (3 couches). Ce document affine pour les 5 god modules ciblés.

---

**Fin de la carte de découpage.** À mettre à jour après chaque module refactoré pour enregistrer les écarts entre frontières proposées et frontières effectives.
