# Audit SSOT — cartographie écrivains/lecteurs par clé

Généré par `scripts/audit-ssot.py`. Re-lancer pour régénérer.

## Limitations

- Clés passées par variable opaque non capturées (héritage 03-1-ssot §3.3).
- Audit statique — pas de runtime, pas de couplage conditionnel.
- Périmètre js/ uniquement.

## Synthèse

- **137 clés détectées** (avec au moins un accès littéral)
- **85 clés SSOT-OK** (1 écrivain littéral)
- **17 clés en violation mineure** (2-3 écrivains)
- **8 clés en violation critique** (≥ 4 écrivains)
- **27 clés sans écrivain littéral** (accès via variable opaque, à confirmer manuellement)

## Opérations destructives globales

| Fichier | Ligne | Opération |
|---|---:|---|
| `js/db.js` | 1166 | `localStorage.clear()` |
| `js/import-export.js` | 1919 | `localStorage.clear()` |
| `js/import-export.js` | 1923 | `db.clear()` |

## Violations critiques (≥ 4 écrivains)

| Clé | # écrivains | Modules écrivains |
|---|---:|---|
| `groupeCoursActif` | 8 | `contexte.js`, `demo-activation.js`, `groupe-cours.js`, `main.js`, `pratique-manager.js`, `trimestre-v2-groupes-cours.js`, `trimestre-v2-orchestre.js`, `trimestres.js` |
| `infoCours` | 8 | `contexte.js`, `cours.js`, `demo-activation.js`, `groupe-cours.js`, `trimestre-v2-cours.js`, `trimestre-v2-groupes-cours.js`, `trimestre-v2-orchestre.js`, `trimestres.js` |
| `evaluationsSauvegardees` | 7 | `evaluation-chargement.js`, `evaluation-jetons.js`, `evaluation-sauvegarde.js`, `evaluation.js`, `liste-evaluations.js`, `migration-diagnostic.js`, `travaux-ui.js` |
| `pratiquesConfigurables` | 6 | `donnees-v2.js`, `import-export.js`, `pratiques-gestion.js`, `pratiques.js`, `pratique-manager.js`, `wizard-pratique-v2.js` |
| `cours` | 5 | `contexte.js`, `cours.js`, `demo-activation.js`, `migrations.js`, `trimestre-v2-cours.js` |
| `enseignants` | 4 | `demo-activation.js`, `import-export.js`, `migrations.js`, `trimestre-v2-enseignants.js` |
| `horaireHebdo` | 4 | `groupe-cours.js`, `trimestre-v2-horaires.js`, `trimestre-v2-orchestre.js`, `trimestre.js` |
| `trimestres` | 4 | `demo-activation.js`, `reserve-emprunter.js`, `trimestre-v2-init.js`, `trimestres.js` |

## Violations mineures (2-3 écrivains)

| Clé | # écrivains | Modules écrivains |
|---|---:|---|
| `listeCours` | 3 | `demo-activation.js`, `migrations.js`, `trimestre-v2-cours.js` |
| `trimestreActif` | 3 | `demo-activation.js`, `trimestre-v2-init.js`, `trimestres.js` |
| `annotationsTravaux` | 2 | `modelisation.js`, `travaux-stockage.js` |
| `cadreCalendrier` | 2 | `rencontres.js`, `trimestre-v2-init.js` |
| `corbeilleFichiers` | 2 | `migration-diagnostic.js`, `travaux-stockage.js` |
| `echellesTemplates` | 2 | `echelles.js`, `import-export.js` |
| `fichiersTravaux` | 2 | `migration-diagnostic.js`, `travaux-stockage.js` |
| `grillesTemplates` | 2 | `grilles.js`, `import-export.js` |
| `groupeSelectionne` | 2 | `demo-activation.js`, `trimestre-v2-etudiants.js` |
| `groupesCours` | 2 | `pratique-manager.js`, `trimestre-v2-groupes-cours.js` |
| `horaireSelectionne` | 2 | `demo-activation.js`, `trimestre-v2-horaires.js` |
| `horaires` | 2 | `migrations.js`, `trimestre-v2-horaires.js` |
| `modeApplication` | 2 | `demo-activation.js`, `modes.js` |
| `planification_seances` | 2 | `main.js`, `planification-donnees.js` |
| `seancesHoraire` | 2 | `horaire.js`, `trimestre-v2-orchestre.js` |
| `seuilsInterpretation` | 2 | `interpretation-config.js`, `preferences-v2.js` |
| `tamponsPersonnalises` | 2 | `tampons-bibliotheque.js`, `travaux-outils.js` |

## Patterns exemplaires (1 écrivain littéral)

| Clé | Écrivain | # lecteurs |
|---|---|---:|
| `_migration_fichiers_done` | `db.js` | 1 |
| `_migration_thumbnails_done` | `travaux-stockage.js` | 1 |
| `anonymisation_afficher_da_reel` | `modes.js` | 1 |
| `autoreflexionBilan` | `bilan-reflexif-core.js` | 0 |
| `calendrierComplet` | `trimestre.js` | 13 |
| `categoriesMasquees` | `travaux-outils.js` | 1 |
| `categoriesPerso` | `travaux-outils.js` | 1 |
| `cc-derniere-description` | `cc-license.js` | 1 |
| `confidentielEtudiants` | `profil-etudiant-confidentiel.js` | 1 |
| `corbeilleFichiers_backup_v1` | `migration-diagnostic.js` | 1 |
| `couleursCategories` | `travaux-outils.js` | 2 |
| `demo-actif` | `demo-activation.js` | 4 |
| `demo-etat-precedent` | `demo-activation.js` | 1 |
| `dernieresSelectionsEvaluation` | `evaluation.js` | 1 |
| `elementsMasques` | `travaux-outils.js` | 1 |
| `errfrModeSynthese` | `travaux-outils.js` | 1 |
| `etatTirage` | `boite-outils.js` | 1 |
| `etatsAccordeonsV2` | `pratiques.js` | 1 |
| `evaluationsSauvegardees_backup_v1` | `migration-diagnostic.js` | 1 |
| `fichiersTravaux_backup_v1` | `migration-diagnostic.js` | 1 |
| `filtresListeEvaluations` | `liste-evaluations.js` | 1 |
| `fsapi_persistance_handles` | `db.js` | 2 |
| `indicesAssiduite` | `indices.js` | 6 |
| `indicesPatternsRaI` | `profil-etudiant-actions.js` | 2 |
| `interventions` | `interventions.js` | 1 |
| `jetonsEtudiants` | `evaluation-jetons.js` | 1 |
| `journeesSansCours` | `trimestre-v2-init.js` | 4 |
| `mapping_groupes_anonymes` | `modes.js` | 1 |
| `migration-cles-globales-done` | `trimestres.js` | 1 |
| `migration-phase5-done` | `demo-activation.js` | 1 |
| `migrationBeta96Date` | `migrations.js` | 0 |
| `migrationBeta96Effectuee` | `migrations.js` | 1 |
| `migrationBibliothequeV2` | `pratique-manager.js` | 1 |
| `migrationCleProductionsFaite` | `migrations.js` | 1 |
| `migrationConfigsSpecifiques` | `pratiques.js` | 1 |
| `migration_cartouches_namespacees_done` | `main.js` | 1 |
| `migration_estEssai_to_estMaquette_done` | `main.js` | 1 |
| `migration_modalites_namespacees_done` | `main.js` | 1 |
| `migration_modeles_namespacees_done` | `main.js` | 1 |
| `migration_onboarding_v6_21_done` | `main.js` | 1 |
| `migration_planification_seances_done` | `main.js` | 1 |
| `migration_pratiqueId_to_configurable_id_done` | `main.js` | 1 |
| `migration_pratiques_namespacees_done` | `main.js` | 1 |
| `migration_rapports_bug_20_done` | `main.js` | 1 |
| `modalitesEvaluation` | `modalites-evaluation.js` | 17 |
| `nomsCategoriesTampons` | `travaux-outils.js` | 1 |
| `notesRapport` | `profil-etudiant-rapport.js` | 1 |
| `objectifsTemplates` | `objectifs.js` | 1 |
| `ordreAutocollants_` | `travaux-outils.js` | 1 |
| `ordreAutocollants_action` | `travaux-outils.js` | 1 |
| `ordreAutocollants_comprehension` | `travaux-outils.js` | 0 |
| `ordreAutocollants_contenu` | `travaux-outils.js` | 1 |
| `ordreAutocollants_diagnostic` | `travaux-outils.js` | 0 |
| `ordreAutocollants_observations` | `travaux-outils.js` | 0 |
| `ordreAutocollants_qualite` | `travaux-outils.js` | 0 |
| `ordreAutocollants_symboles` | `travaux-outils.js` | 0 |
| `ordreCategories` | `travaux-outils.js` | 1 |
| `ordreErreursFr` | `travaux-outils.js` | 0 |
| `personnalisationErreursFr` | `travaux-outils.js` | 1 |
| `personnalisationObservations` | `travaux-outils.js` | 1 |
| `planif-fond-canvas` | `planification-carte.js` | 1 |
| `portfoliosEleves` | `portfolio.js` | 1 |
| `pratiqueParDefaut` | `pratiques.js` | 2 |
| `preferencesRapport` | `profil-etudiant-rapport.js` | 1 |
| `preferencesRythme` | `rythme.js` | 1 |
| `preferencesUtilisateur` | `accompagnement.js` | 1 |
| `presences` | `saisie-presences.js` | 9 |
| `presences_date` | `saisie-presences.js` | 1 |
| `presences_groupe` | `saisie-presences.js` | 1 |
| `presences_tri` | `saisie-presences.js` | 1 |
| `productions` | `migrations.js` | 38 |
| `profilEnseignant` | `trimestre-v2-enseignants.js` | 5 |
| `profilOngletDeveloppementActif` | `profil-etudiant-diagnostics.js` | 0 |
| `raccourcisAnnotation` | `travaux-outils.js` | 1 |
| `rapportsBugArchives` | `main.js` | 1 |
| `recalculerIndicesCP` | `main.js` | 1 |
| `recherchePresences` | `saisie-presences.js` | 1 |
| `ressourcesSupprimees` | `main.js` | 1 |
| `retroactionsErreursFr` | `travaux-outils.js` | 1 |
| `retroactionsObservations` | `travaux-outils.js` | 1 |
| `seancesCompletes` | `horaire.js` | 0 |
| `symbolesUnicodePerso` | `travaux-outils.js` | 1 |
| `tamponsImages` | `tampons-bibliotheque.js` | 1 |
| `thumbnail_` | `travaux-stockage.js` | 1 |
| `travaux-fond-canvas` | `travaux-ui.js` | 1 |

## Clés sans écrivain littéral détecté

_Ces clés ont des lecteurs littéraux mais aucun écrivain littéral._ L'écriture passe probablement par une variable (`const CLE_X = 'foo'`) ou par `cle('xxx')` dans un fichier non vu par le scan.

| Clé | # lecteurs | Modules lecteurs |
|---|---:|---|
| `bibliothequePratiques` | 1 | `pratiques-gestion.js` |
| `cartouches_` | 2 | `accompagnement.js`, `reserve-ouvrir.js` |
| `chronoEvaluations` | 2 | `rythme.js`, `travaux-ui.js` |
| `coursActif` | 1 | `export-pdf.js` |
| `demo_enseignants` | 1 | `demo-activation.js` |
| `demo_groupesCours` | 1 | `demo-activation.js` |
| `demo_listeCours` | 1 | `demo-activation.js` |
| `demo_modalitesEvaluation` | 1 | `demo-activation.js` |
| `dureePeriode` | 3 | `horaire.js`, `migrations.js`, `trimestres.js` |
| `echellePerformanceActive` | 1 | `tableau-bord-apercu.js` |
| `elevesDesinscrits` | 1 | `import-export.js` |
| `flechesDidactiquesActives` | 1 | `accompagnement.js` |
| `groupeEtudiants` | 34 | `comparateur-pratiques.js`, `etudiants.js`, `evaluation-chargement.js`, `evaluation-retroaction.js`, `evaluation-sauvegarde.js`, `evaluation.js`, `graphiques-progression.js`, `horaire.js`, `import-export.js`, `indices.js`, `interventions.js`, `liste-evaluations.js`, `modes.js`, `navigation.js`, `portfolio.js`, `presences-apercu.js`, `presences-rapport.js`, `profil-etudiant-actions.js`, `profil-etudiant-confidentiel.js`, `profil-etudiant-rapport.js`, `profil-etudiant-sections-affichage.js`, `rapport-bug.js`, `saisie-presences.js`, `tableau-bord-apercu.js`, `travaux-archivage.js`, `travaux-export-pdf.js`, `travaux-import.js`, `travaux-resolution.js`, `travaux-ui.js`, `trimestre-v2-cours.js`, `trimestre-v2-etudiants.js`, `trimestre-v2-horaires.js`, `trimestre-v2.js`, `trimestres.js` |
| `horaireActif` | 1 | `rapport-bug.js` |
| `indicesAssiduiteDetailles` | 1 | `pratique-sommative.js` |
| `indicesCP` | 4 | `indices.js`, `pratique-configurable.js`, `tableau-bord-apercu.js`, `trimestres.js` |
| `mapping_anonymisation` | 1 | `modes.js` |
| `planification_seances_archive_pre367` | 1 | `main.js` |
| `productionsPedagogiques` | 1 | `migrations.js` |
| `proto_carte_mentale` | 1 | `planification-donnees.js` |
| `registreLongitudinal` | 1 | `trimestres.js` |
| `resultatsUlterieurs` | 1 | `trimestres.js` |
| `rythmeColonnesT1` | 1 | `rythme.js` |
| `rythmeColonnesT2` | 1 | `rythme.js` |
| `snapshots` | 1 | `trimestres.js` |
| `trimestresDisponibles` | 1 | `migrations.js` |
| `xxx` | 1 | `labo-codex-data.js` |

## Annexe — Top 10 fichiers par densité d'écritures `db.*`

Comptage générique (toutes formes d'écriture, y compris via variable).

| Fichier | # hits `db.setSync`/`db.set` |
|---|---:|
| `js/travaux-outils.js` | 51 |
| `js/demo-activation.js` | 26 |
| `js/trimestres.js` | 26 |
| `js/main.js` | 22 |
| `js/migrations.js` | 22 |
| `js/import-export.js` | 14 |
| `js/codex.js` | 12 |
| `js/trimestre-v2-groupes-cours.js` | 11 |
| `js/trimestre-v2-horaires.js` | 10 |
| `js/trimestre-v2-orchestre.js` | 10 |

