# Registre de propriété des clés de stockage

> **Version** : Beta 99.62 (22 mai 2026, Sprint A)
> **Source** : `scripts/audit-ssot.py` (auto-régénérable) — Livrable 1 du Sprint A
>             + chantiers Cat-B post-merge (21 mai) + cycle AQPC pré-3-juin (22 mai)
> **Audit annuel de référence** : `audit/reports/03-1-ssot.md` (Beta 99.42, 12 mai 2026)
> **Objectif** : documenter qui a le droit d'écrire dans chaque clé pour prévenir
>               les violations SSOT, et tracer la dette résiduelle pour Sprint C.
> **Inventaire régénéré le 11 oct. 2026 (1.198.0, lot 13)** : `scripts/audit-ssot.{json,md}` sont à jour ; les
> 83 clés que ce registre ne déclarait pas sont listées en annexe, sans propriétaire déclaré. Les tables
> ci-dessous n'ont pas été réécrites : leurs listes de contourneurs datent toujours du 22 mai.
> **Note de currency (3 juillet 2026, #363)** : les colonnes NS/G des modèles de
> travail ont été réalignées sur le code post-#358 (`grillesTemplates`,
> `echellesTemplates`, `pratiquesConfigurables` = namespacées). Les listes de
> contourneurs datent de l'audit Beta 99.62 (22 mai) — re-générer via
> `scripts/audit-ssot.py` avant de s'y fier pour un chantier.

---

## Conventions

- **Propriétaire** : le module qui CRÉE et MET À JOUR la donnée canonique. Un seul par clé.
- **Lecteurs** : modules qui lisent via `obtenirDonneesSelonMode()` ou `db.getSync()`.
- **Contourneurs** : modules qui écrivent directement sans passer par le propriétaire.
- **NS** : namespacée par trimestre (via `cle('nomCle')`). **G** : globale.

**Méthode de mise à jour** : `python3 scripts/audit-ssot.py` régénère
`scripts/audit-ssot.{json,md}` à partir du code. Pour chaque clé en violation,
le présent registre déclare l'owner cible et liste les contourneurs comme dette.
Le script ne capture pas les écritures via variable opaque (`const CLE_X = 'foo';
db.setSync(CLE_X, …)`) — ces cas sont marqués « via variable » dans les notes
ci-dessous.

---

## Données étudiantes (critiques)

| Clé | NS/G | Propriétaire | Lecteurs principaux | Contourneurs | Taille |
|-----|------|-------------|---------------------|-------------|--------|
| `groupeEtudiants` | NS | `trimestre-v2.js` (via variable, 32 lecteurs) | etudiants, evaluation-*, indices, portfolio, profil-etudiant-*, travaux-*, statistiques | migrations (init), demo-activation | < 200 Ko |
| `evaluationsSauvegardees` | NS | `evaluation-sauvegarde.js` (post-refactor 21 mai) | liste-evaluations, profil-etudiant-*, travaux-resolution, export-pdf (36 lecteurs) | **7 contourneurs : echelles, evaluation-jetons, evaluation-chargement, evaluation, liste-evaluations, migration-diagnostic, travaux-ui** (violation #2 ci-dessous) | ~1.2 Mo (IDB) |
| `presences` | NS | `saisie-presences.js` | indices, profil-etudiant, presences-apercu (7 lecteurs) | — (corrigé Tier 6.4, avril 2026) | < 200 Ko |
| `fichiersTravaux` | NS | `travaux-stockage.js` | travaux-ui, travaux-export-pdf | `migration-diagnostic.js` (rétention IDB) | ~3.8 Mo (IDB) |
| `annotationsTravaux` | NS | `travaux-stockage.js` | travaux-ui, travaux-export-pdf | `modelisation.js` (cas particulier outils) | < 200 Ko |
| `corbeilleFichiers` | NS | `travaux-stockage.js` | travaux-ui | `migration-diagnostic.js` (rétention) | < 200 Ko |
| `_copiesAuxArchives` | **G** (#1028, 5 oct. 2026 — hors de toute clé `<trimestre>_*` : E3 ne la compare pas, E1 ne l'archive pas ; voyage dans le codex) | `reserve-copies.js` (« Archiver les copies » pose la marque AVANT de retirer les fichiers ; `lever` la retire pour les copies dont le fichier est revenu) | `reserve-copies.js` (`estAuxArchives`, `copiesParties`) ; travaux-visionneuse, travaux-ui (badge, miniatures, fusion, éditeur), travaux-export-pdf, travaux-archivage (bilans « aux archives ») ; codex.js et import-export.js (une copie marquée n'est ni attendue ni « manquante ») ; reserve-trimestre.js et reserve.js (refus d'une nouvelle archive) ; reserve-reglages.js (bouton « Faire revenir » de la ligne du trimestre) | `reserve-renvoyer.js` (E3 lève la marque du trimestre renvoyé) ; `reserve-revenir.js` (« Faire revenir » lève celle des copies revenues, via `lever`) | `{ <trimestre>: { dossier, uuid, date, ids: { <id>: true } } }`. Une copie est « aux archives » si elle est marquée ET que son fichier manque : une copie marquée encore là (geste interrompu) se montre normalement. Les fiches, annotations et évaluations ne sont jamais touchées |
| `<trim>_elevesDesinscrits` | NS (**#1012, 2 oct. 2026**, l'élève désinscrit) | `trimestre-v2-etudiants.js` (`supprimerEtudiantV2`, après le retrait de la fiche — seul « Supprimer » l'écrit ; décrochage, inactivité, réactivation et changement de groupe-cours jamais) | `import-export.js` (`executerImportSelectif` : `dasElevesEcartes` puis `ecarterElevesDesinscrits` sur les cinq familles, avant la fusion) | — | `[{ da, date }]`. Un DA de la trace absent de `groupeEtudiants` n'entre plus par l'import par cases (fiche, copies, évaluations, présences, annotations). Ce qui reste de l'élève dans l'espace n'est pas effacé. Voyage dans le codex et l'export comme toute clé du trimestre ; sans semis. Ouvrir un codex entier la restaure telle qu'elle était ce jour-là |
| `portfoliosEleves` | NS | `portfolio.js` | indices, profil-etudiant-sections-affichage (réflecteur lecture seule) | `profil-etudiant-sections-affichage.js` (écrit aussi — à investiguer, voir §Violations) | < 200 Ko |
| `interventions` | NS | `interventions.js` | evaluation, trimestres | — | < 200 Ko |
| `registreLongitudinal` | **G** (**#915, 17 sept. 2026** — inscrite à `CLES_GLOBALES` : un élève traverse les trimestres, sa fiche ne vit dans aucun ; survit à `supprimerTrimestre`, figure dans l'export complet, ABSENTE de la Réserve) | `registre-longitudinal.js` (seul écrivain, `db.set` au GESTE seulement — le rendu et l'ouverture du sous-onglet ne font que lire ; un registre absent ou illisible se lit comme vide, sans semis) | `registre-longitudinal.js` (Labo › Suivi longitudinal) ; `trimestres.js` (`exporterFormatRecherche` lit la CLÉ : `eleves[da].resultatsUlterieurs` et `reprise913` — livré au lot 3, 18 sept.) | — | `{ format: 'registre-longitudinal', version: 1, eleves: { [da]: { da, nom, prenom, inscritLe, dossiers[], resultatsUlterieurs[{ cours, trimestre, note, origine? }], reprise913? } } }` ; **lot 3** : `ajouterResultat`, `retirerResultat`, `retirerDuRegistre` (purge les modèles orphelins) — toujours une seule clé écrite ; `reprise913` = le stock de `<trim>_resultatsUlterieurs` a été RECOPIÉ pour ce DA (`origine: 'cadre'`), le registre fait foi ; format DISTINCT de `codex-data` v1 ; `modeles: { grilles: { '<trim>:<id>': copie }, echelles }` rangés UNE fois par trimestre (mesuré le 18 sept. sur le pack démo : 15,5 Ko par dossier sinon) ; **capture en LECTURE SEULE sur les trimestres (lot 2, livré 1.144.0)** : lit par `cleSource(nomCle, trimestreId)`, jamais en changeant le trimestre actif, indices LUS tels que stockés (jamais `calculerEtStockerIndicesCP`), prouvé par sentinelle (une seule écriture, stock identique) et banc WebKit (trimestre actif archivé) |
| `jugementsDenotation` | NS | `pratiques/denotation-jugements.js` (#318, DEN couche 2) | moteur DEN `pratique-configurable.js` (lecture seule au calcul) ; UI de saisie profil (écriture, DEN-2) | — (collection neuve, aucune migration) | < 200 Ko |

### Notes de schéma

- `evaluationsSauvegardees[i].actionsRLO` : `{reperage, liaison, ouverture, incertain, incomplet, inexact, total} | null` — peuplé par `actions-rlo.js` au moment de `sauvegarderEvaluation()` si la préférence `activerActionsRLO` est active. Absent si la préférence est désactivée. `null` explicite si aucune annotation n'est résolue pour l'évaluation.
- `evaluationsSauvegardees` est écrit littéralement dans **8 modules** (audit 22 mai). 5 contourneurs hérités du god module `evaluation.js` pré-refactor (split en `evaluation-chargement` / `evaluation-sauvegarde` / `evaluation-jetons` lors du refactor du 21 mai). Plan Tier 6.6 documenté en violation #2.
- **Écrivain transversal du DA (#976, 8 oct. 2026)** : `js/correction-da.js` (« Corriger le DA… », fiche du Cadre) réécrit EN PLACE le DA d'un·e élève dans toutes les clés du trimestre actif qui le portent (liste et formes : `CorrectionDA.FAMILLES`, inventaire `plans de travail/MESURE-2026-10-08-976-cles-qui-portent-un-DA.md`). Il n'ajoute ni ne retire aucune entrée. Trois clés globales le suivent aussi (décision de Grégoire, 8 oct. 2026, 14 h 50) : `registreLongitudinal` (`eleves[da]` et son champ `da` ; les copies datées des dossiers gardent le DA de leur capture), `jetonsEtudiants` (une entrée vide sous le nouveau DA est remplacée), `jugementsDenotation` ; un conflit refuse sans rien écrire. Les autres globales qui portent un DA restent. Toute nouvelle clé qui porte un DA s'inscrit à `FAMILLES`, sinon une correction la laisse sous l'ancien DA.
- `jugementsDenotation` : ⚠ nue de fait (absente de `CLES_NAMESPACEES` : `cle()` la rend globale, mesuré le 8 oct. 2026 pour #976) malgré la colonne NS du tableau. `{ [pratiqueId]: { [da]: { ciblesAtteintes: {[objectifId]: boolean}, noteFinale: number, justification: string, date: 'YYYY-MM-DD' } } }`. La note DEN est un **jugement saisi** par l'enseignant, pas un calcul. Le moteur la **lit** seulement (`denotationJugements.lireJugementDenotation`) ; l'écriture est le geste de l'UI de saisie (profil étudiant, DEN-2). Une cible non confirmée plafonne la certification à 59 (RREC), jamais ≥ 60 (garde « cibles atteintes », DEN-B).

---

## Structure pédagogique (templates)

| Clé | NS/G | Propriétaire | Lecteurs principaux | Contourneurs | Taille |
|-----|------|-------------|---------------------|-------------|--------|
| `productions` | NS | `productions.js` (via variable `cleProductions`, 41 lecteurs) | evaluation-*, travaux-ui, export-pdf | `migrations.js` (init, 1 écriture littérale) | < 200 Ko |
| `grillesTemplates` | NS (**#358, 28 juin 2026** — sortie de `CLES_GLOBALES`, namespacée par trimestre ; global nu vidé au boot, garde anti-resemage 1.25.0) | `grilles.js` | evaluation-*, grilles-bibliotheque, export-pdf (multi-lecteurs) | **6 contourneurs : cartouches, demo-activation, donnees-v2, import-export, spe-specifications, wizard-pratique-v2** (violation #3) | < 200 Ko |
| `echellesTemplates` | NS (**#358, 28 juin 2026** — même régime que `grillesTemplates`) | `echelles.js` | evaluation-*, echelles-bibliotheque | **3 contourneurs : demo-activation, donnees-v2, import-export** (violation #4) | < 200 Ko |
| ~~`niveauxEchelle`~~ | G (nue — jamais passée par `cle()`) | ~~`echelles.js`~~ — **aucun depuis #658 (13 sept. 2026)** | ~~aucun~~ | **ORPHELINE.** Copie « de travail » des niveaux de l'ancien éditeur, dont le tableau rendait dans `#tableauNiveaux`, un conteneur caché d'index.html. Écrite par `chargerEchelleTemplate`, les six gestes de ce tableau et un miroir conditionnel de l'éditeur vivant ; lue par `chargerConfigurationEchelle`. Tout est retiré avec le bloc « Conteneurs cachés pour compatibilité ». Les niveaux vivent dans `echellesTemplates[].niveaux`. **Stock** : au plus une clé par base, restée en place, inerte — l'effacer est un geste sur les données, qui revient à Grégoire. Sentinelle `sentinelle-658` C | < 10 Ko |
| ~~`configEchelle`~~ | G (nue) | ~~`echelles.js`~~ — **aucun depuis #658 (13 sept. 2026)** | ~~aucun~~ | **ORPHELINE.** Dernier écrivain `chargerEchelleTemplate` (sans déclencheur vivant), seul lecteur `chargerConfigurationEchelle` (posait des `.value` sur des `<div>`) : retirés tous deux. L'écriture aplatie à chaque entrée dans la section (#659) était tarie depuis #520. La configuration d'une échelle vit dans `echellesTemplates[].config` (lue par `export-pdf.js`). **Stock** : au plus une clé par base, peut-être aplatie (`seuilReussite: 60`, `typeEchelle` absent) — inerte, non purgée (à Grégoire). Sentinelles `sentinelle-658` C, `sentinelle-520` C | < 1 Ko |
| `collectionsProjection` | NS (`CLES_NAMESPACEES`, **lot B du 5 sept. 2026**) — un jeu NOMMÉ de réglages de projection `{ id, nom, dateCreation, modeleId, params, paliers }`, COPIÉ dans un critère au choix (décision de Grégoire : la copie ; le critère ne garde aucun lien) | `collections-projection.js` (écrit par `db.modifier` seulement) | grilles.js (menu de projection, gabarit) | aucun | < 50 Ko |
| `cartouches_[grilleId]` | NS (verdict **D1** du 21 août 2026, migration au démarrage `main.js`, drapeau `migration_cartouches_namespacees_done` ; corrigé ici le 11 oct. 2026) | `cartouches.js` | evaluation-*, cartouches-bibliotheque | import-export, primo-modal (au cas par cas) | < 100 Ko |
| `pratiquesConfigurables` | NS (namespacée par trimestre depuis le 24 mai 2026, `CLES_NAMESPACEES` ; copie d'archive via `CLES_TEMPLATES_ARCHIVES`) | `pratiques.js` | evaluation-*, wizard-pratique-v2, pratique-* | **4 contourneurs : donnees-v2, import-export, pratique-manager, wizard-pratique-v2** (violation #5) | < 200 Ko |
| `modalitesEvaluation` | NS | **`js/pratiques/modalites-evaluation.js`** (module propriétaire #328 Lot 1 — API `lire()`/`modifier()`/`remplacer()`, seul écrivain de la clé NS) | evaluation-*, pratique-notation-v2, pratiques, profil-etudiant-*, tableau-bord (39 fichiers lecteurs) | Violation #1 **RÉSORBÉE côté écriture** (10 juin 2026) : Lot 0 intrus extraits (horaire, preferences-v2), Lot 1 les 12 écrivains du domaine routés sur le module. **Lot 3 LIVRÉ (11 juin 2026)** : fallbacks de lecture clé nue purgés partout (~57 sites), `pratiques/migration-pratiques.js` supprimé (ids legacy résolus à la volée par `normaliserIdPratique`), seul lecteur clé nue restant = migration namespacing bornée de `main.js` ; champ legacy `dureePeriodeMinutes` purgé des données par `purgerLegacy()` (module, appelé au boot). Sentinelle `tests/unit/sentinelle-ssot-modalites-purge-L3.test.js`. **Lot 2 LIVRÉ** (L2-a/b1 le 11 juin, L2-b2 le 12 juin `e3179c41`, L2-c le 27 juin PR #67 — fin de #328 en 1.22.0) : les champs miroirs (`pratique`, `pratiqueId`, `approcheEvaluation`, `configPAN.jetons`) DÉRIVENT de la pratique active, miroir mort purgé par `purgerLegacy()`. Sentinelle ratchet `tests/unit/sentinelle-ssot-modalites-ecrivains-L0.test.js` + contrat `tests/unit/modalites-evaluation-proprietaire-L1.test.js`. Audit : `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md` | < 50 Ko |

---

## Indices (données calculées)

| Clé | NS/G | Propriétaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `indicesCP` | NS | `portfolio.js` (via variable) | indices, evaluation, liste-evaluations, pratique-configurable, tableau-bord-apercu, trimestres (6 lecteurs) | Source unique C/P/E. Calcul via `calculerEtStockerIndicesCP()` |
| `indicesAssiduite` | NS | `indices.js` | indices, evaluation, profil-etudiant-* (7 lecteurs) | Source unique A. Calcul via `calculerEtSauvegarderIndicesAssiduite()` |
| `indicesPatternsRaI` | NS | `profil-etudiant-actions.js` (post-refactor) | profil-etudiant-*, statistiques (2 lecteurs) | Patterns groupe RaI — `calculerEtStockerPatternsGroupe()` |
| ~~`indicesEvaluation`~~ | NS | ~~aucun~~ | ~~aucun~~ | **ORPHELINE** — écritures supprimées Tier 6.2 (3 avril 2026) |

---

## Planification et calendrier

| Clé | NS/G | Propriétaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `calendrierComplet` | NS | `trimestre.js` (12 lecteurs) | calendrier-vue, saisie-presences, productions | Pattern exemplaire : un seul écrivain (ligne 842) |
| `cadreCalendrier` | NS | `trimestre.js` | horaire, productions, snapshots (multi-lecteurs) | `trimestre-v2-init.js` co-écrit pendant l'initialisation (cas particulier init, violation mineure #6) |
| `horaireHebdo` | NS | `trimestre-v2-orchestre.js` (cible — était `horaire.js` mais celui-ci est lecteur seul) | calendrier-vue, saisie-presences, organisateur (5 lecteurs) | **4 contourneurs : entites/groupe-cours, trimestre.js (legacy), trimestre-v2-orchestre, `trimestre-v2-horaires.js`** (violation mineure #7 — owner cible à confirmer Sprint C). ⚠ `trimestre-v2-horaires.js` écrit la clé à la sauvegarde ET à la suppression d'un horaire : écrivain non listé jusqu'au 21 août 2026 (constat CT-04). Les trois sites de fusion « entités horaires → horaireHebdo » passent désormais par la source unique `fusionnerSeancesHoraires()` (`js/horaire-fusion.js`). ⚠ **ARBITRAGE TRANCHÉ (Grégoire, 22 août 2026, retour de porte terrain)** : deux écrivains portaient des intentions contradictoires — la fusion veut TOUS les groupes du trimestre, `entites/groupe-cours.js:252` (`synchroniserInfoCours`, fix du 30 mars 2026) réécrit les SEULES séances du groupe actif. **Le groupe actif PRIME** : c'est ce que le calendrier et la saisie des présences doivent montrer. La fusion `CT-04` gouverne donc la sauvegarde d'un horaire, sa suppression et `genererCalendrierComplet` ; la synchro du groupe actif gouverne l'affichage dès qu'un groupe est actif, et écrase volontairement la liste fusionnée. Ne pas « corriger » cet écrasement sans rouvrir la décision |
| `seancesHoraire` | NS | `horaire.js` (cible) | horaire, trimestre-v2 | **3 écrivains : entites/groupe-cours, horaire, trimestre-v2-orchestre** (violation mineure #8) |
| `dureePeriode` | NS (**réellement namespacée depuis #464/21 août 2026** — la colonne disait NS mais la clé était ABSENTE de CLES_NAMESPACEES : nue de facto, partagée entre trimestres — CT-07 ; résidu migré vers tous les trimestres au boot) | `horaire.js` (`obtenirDureePeriode`/`definirDureePeriode`, seul écrivain) | indices, saisie-presences, etudiants, profil-etudiant-*, trimestre-v2 (tous via `obtenirDureePeriode()`) | Créée au Lot 0 SSOT (10 juin 2026) — extraite de `modalitesEvaluation.dureePeriodeMinutes` (Lot 3, 11 juin 2026 : champ legacy purgé des données au boot par `modalitesEvaluation.purgerLegacy()` ; plus de migration paresseuse). Seed démo : clé `dureePeriode` du pack |
| `journeesSansCours` | NS | `trimestre-v2-init.js` (CRUD du formulaire) | trimestre.js (générateur), calendrier-vue, trimestre-v2 (validations #369) | Fusion #374 (5 août 2026) des ex-clés `evenementsPrevus`+`evenementsImprevus` — migrées au boot par `migrerJourneesSansCours()` (migrations.js, sans flag, idempotente) ; anciens noms acceptés en LECTURE seulement (reserve, import-export) pour les archives pré-fusion |
| `planification_mindmap` | NS | `planification-donnees.js` | planification-carte, planification | Pattern exemplaire (1 écrivain) |
| `snapshots` | NS | `snapshots.js` (via variable composite `cleSnap`) | trimestres, trimestre | Clé composite : `h2026_snapshots_[coursId]` |
| `groupesCours` | NS | `trimestres.js` (via variable) | organisateur, travaux-ui, modes, calendrier-vue, productions, rythme, tableau-bord-apercu, travaux-import, trimestre-v2 (7 lecteurs) | OK SSOT — écriture via variable `cleGroupesCours` |

---

## Contexte trimestre / groupe-cours (cluster cross-cutting)

| Clé | NS/G | Propriétaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `trimestres` | G | `trimestres.js` (7 écritures littérales) | 18 lecteurs cross-modules | **4 écrivains : demo-activation, migrations, trimestre-v2-init, trimestres** (violation mineure #9 — owner cible OK, contourneurs init/migration justifiables structurellement) |
| `trimestreActif` | G | `trimestres.js` (cible) | trimestre-v2, evaluation-*, productions (7 lecteurs) | **4 écrivains : demo-activation, migrations, trimestre-v2-init, trimestres** (violation mineure #10 — même profil que `trimestres`) |
| `infoCours` | NS | `trimestre-v2-cours.js` (cible) | 33 lecteurs cross-modules | **7 écrivains : contexte, demo-activation, entites/groupe-cours, trimestre-v2-cours, trimestre-v2-etudiants, trimestre-v2-orchestre, trimestres** (violation critique #11 — **non listée en mai**, découverte 22 mai par audit-ssot.py) |
| `<trim>_etudiantsSuivis_gc_<gcId>` | NS (composée par trimestre ET groupe-cours, **#749, 11 sept. 2026** ; famille `etudiantsSuivis` dans `CLES_NAMESPACEES`, clé réelle suffixée comme `snapshots`) | `tableau-bord-apercu.js` (`cleEtudiantsSuivis`, seul écrivain : ajouter / retirer / réinitialiser, plus le semis) | tableau-bord-apercu (Suivi du groupe, au plus cinq élèves) | Filtrée À LA LECTURE (groupe actif, non exclus), jamais purgée en écriture. **Semis** : à la première lecture d'un groupe, la clé NUE `etudiantsSuivis` (stock d'avant) est lue et ses DA du groupe copiés — la nue reste en place, orpheline connue de `diagnostic-353` |
| `<trim>_datesVerrouillees_gc_<gcId>` | NS (composée par trimestre ET groupe-cours, **#749 lot 3, 11 sept. 2026** ; famille `datesVerrouillees` dans `CLES_NAMESPACEES`, clé réelle suffixée comme `snapshots`) | `saisie-presences.js` (`cleDatesVerrouillees`, seul écrivain : le cadenas de la saisie, plus le semis) | saisie-presences (validation d'une date, `estDateVerrouillee`) | **Semis** : à la première lecture d'un groupe-cours, la clé NUE `datesVerrouillees` (stock d'avant : partagée entre tous les groupes et trimestres) est lue et sa liste ENTIÈRE copiée — la nue reste en place, orpheline connue de `diagnostic-353`. Verrouiller sauvegarde d'abord la grille hors du mode (#736, cité) |
| `<trim>_presences_date` / `_presences_groupe` / `_presences_tri` / `_recherchePresences` | NS (**#749 lot 3, 11 sept. 2026** — nues avant) | `saisie-presences.js` (états d'écran : date affichée, sous-groupe, tri, recherche) | saisie-presences seul | Sans semis (un trimestre neuf part à vide) ; hors de l'inventaire Données et de tout export : un état d'écran ne voyage pas. Les nues d'avant sont orphelines (`diagnostic-353`) |
| `<trim>_preferencesRapport` | NS (**lot 4 du cadrage 11, 11 sept. 2026** — nue avant, partagée entre trimestres et élèves) | `profil-etudiant-rapport.js` (`sauvegarderPreferencesRapport`, appelée au geste seulement : `cocherSectionRapport`) | profil-etudiant-rapport seul (`restaurerPreferencesRapport`) | Six cases de forme du rapport du profil (identification, assiduité, complétion, performance, jetons, date). Sans semis ; la nue `preferencesRapport` est orpheline, connue de `diagnostic-353` |
| `<trim>_notesRapport` | NS (**#866, 15 sept. 2026**) | `profil-etudiant-rapport.js` (`enregistrerNotesRapport` au blur, `planifierEnregistrementNotesRapport` à la frappe — au GESTE seulement : le rendu ne fait que lire) | `profil-etudiant-rapport.js` seul (`obtenirNotesRapport`, lu dans le HTML de `genererSectionRapport` et dans `copierRapport`) | Notes libres de l'enseignant dans le rapport du profil, `{ [da]: texte }`. **Données d'élèves** : voyagent dans l'export complet (balayage `db.keys()`), sans semis démo. Une note vidée retire son entrée |
| `<trim>_resultatsUlterieurs` | NS (**#913, 17 sept. 2026**) | **PLUS AUCUN ÉCRIVAIN depuis #915 lot 3 (18 sept. 2026)** — le bloc du Cadre et `resultats-ulterieurs.js` sont retirés ; la saisie vit dans `registreLongitudinal`. La clé reste au registre `CLES_NAMESPACEES` parce que le STOCK écrit du 17 au 18 sept. existe chez les gens : ni réécrit, ni effacé | `registre-longitudinal.js` (`stock913`, par `cleSource` : reprise du stock au premier geste qui écrit pour l'élève, drapeau `reprise913`) et `trimestres.js` (`exporterFormatRecherche` : repli, en union sans doublon, tant que le registre n'a pas repris ce DA) | Résultats obtenus APRÈS le trimestre, saisis à la main : `{ [da]: [{ cours, trimestre, note }] }` ; `cours` et `trimestre` en texte libre, `note` de 0 à 100 à une décimale. Voyage avec l'archive du trimestre. |
| `groupeCoursActif` | G | `trimestre-v2-groupes-cours.js` (cible — post-refactor 17 mai) | 14 lecteurs (evaluation, horaire, travaux-ui, filtrage) | **6 écrivains : contexte, demo-activation, entites/groupe-cours, trimestre-v2-groupes-cours, trimestre-v2-orchestre, trimestres** (violation critique #12 — non documentée en avril) |
| `listeCours` | G | `cours.js` (11 écritures littérales) | 14 lecteurs | **5 écrivains : contexte, cours, demo-activation, migrations, trimestre-v2-cours** (violation critique #13) |
| `cours` | G | `cours.js` (cible) | large usage (lookup cours) | **3 écrivains : demo-activation, migrations, trimestre-v2-cours** (violation mineure héritée, clé legacy `listeCours` = fallback) |
| `enseignants` | G | `trimestre-v2-enseignants.js` (cible — post-refactor 17 mai) | export-pdf, primo-questions | **4 écrivains : demo-activation, import-export, migrations, trimestre-v2-enseignants** (violation critique #14) |
| `equipesAnimation_<coursId>` | G (composée par groupe-cours, comme `questionsFlash_<coursId>` et `etatTirage`, tous trois de l'Animation ; **#1039, 7 oct. 2026**) | `equipes.js` (`retenirEquipes` écrit, `oublierEquipesRetenues` retire — au GESTE seulement) | `equipes.js` seul | `{ paires: ['da1\|da2', …], formations: n }` : les paires d'élèves des équipes RETENUES, pour ne pas refaire les mêmes. Contient des DA (donnée d'élève). Rien d'écrit tant que l'enseignant ne clique pas « Retenir ces équipes ». Lit `presences` (absents du jour) sans l'écrire |

---

## Configuration et préférences

| Clé | NS/G | Propriétaire | Lecteurs principaux | Notes |
|-----|------|-------------|---------------------|-------|
| `profilEnseignant` | G | `trimestre-v2-enseignants.js` (post-refactor — était `cc-license.js` mais celui-ci est lecteur seul) | export-pdf, bibliothèques, cc-license (5 lecteurs) | Auteur pour métadonnées CC. **Owner corrigé 22 mai** (audit 12 mai → `cc-license.js` était incorrect) |
| `preferencesUtilisateur` | G | `preferences.js` (via variable `CLE_STOCKAGE`) | tous les modules UI via `obtenirPreference`/`definirPreference` | **2 contourneurs littéraux : `accompagnement.js:156` (système d'aide, historique) + `main.js:289` (migration AQPC 22 mai, `migration_decoupler_pn_done` & `migration_rapports_bug_20_done`)** (violation mineure #15) |
| `planif-fond-canvas` | G | `planification-carte.js` (rubrique « Fond du canevas » du menu « Vue » de la carte d'alignement) | `planification-carte.js` seul (restauration au chargement) | Chaîne : couleur `#rrggbb`, ou `""` pour le défaut du thème. **Globale à dessein** : vaut pour toutes les cartes et tous les trimestres — d'où sa place dans « Vue » et non sous le nom d'une carte (décision de Grégoire, 8 oct. 2026). Inscrite au registre le 8 oct. 2026 (trouvaille du lot 0 du chantier de la carte). |
| `travaux-fond-canvas` | G | `travaux-ui.js` (rubrique « Fond du canevas » du menu « Annoter » / « Évaluer ») | `travaux-ui.js` seul | Même forme que `planif-fond-canvas`, clé distincte : la copie annotée et la carte gardent chacune leur fond. Inscrite au registre le 8 oct. 2026 (même trouvaille). |
| `modeApplication` | G | `modes.js` | tous les modules via `obtenirDonneesSelonMode` | **2 écrivains : demo-activation, modes** (violation mineure héritée — demo-activation force le mode au démarrage). Valeurs : `'normal'` ou `'anonymisation'` |
| `seuilsInterpretation` | G | `interpretation-config.js` (cible) | preferences-v2, profil-etudiant-*, indices | **2 écrivains : interpretation-config, preferences-v2** (violation mineure #16 — découverte 22 mai) |
| `rapportsBugArchives` | G | `rapport-bug.js` | main (audit AQPC seuil 20) | Phase 6.2 AQPC 22 mai : seuil 50 → 20 + migration idempotente |

---

## Bibliothèques (partage entre collègues)

| Clé | NS/G | Propriétaire | Notes |
|-----|------|-------------|-------|
| `bibliothequeGrilles` | G | `grilles-bibliotheque.js` (via variable) | |
| `bibliothequeEchelles` | G | `echelles-bibliotheque.js` (via variable) | |
| `bibliothequeCartouches` | G | `cartouches-bibliotheque.js` (via variable) | |
| `bibliothequeProductions` | G | `donnees-v2.js` (init) + `productions-bibliotheque-ui.js` (CRUD, via variable) | 1 écrivain littéral détecté (init) |
| `bibliothequeAlignements` | G | `planification-bibliotheque.js` (via variable) | |
| `bibliothequePratiques` | G | `main.js` (init pratiques) | Lecteur unique : `tableau-bord-apercu.js` |
| `tamponsPersonnalises` | G | `tampons-bibliotheque.js` (cible) | **3 écrivains : reserve-ouvrir, tampons-bibliotheque, travaux-outils** (violation mineure #17) |
| `clesConnues` | G | `js/trust-tofu.js` (#329 lot T) | Registre TOFU auteur → clé publique (D3). JAMAIS namespacée (la confiance en une personne ne dépend pas du trimestre). Index par nom normalisé (NFC, casse, espaces). Champ `signaturesWoT` réservé au WoT progressif post-pilote. |
| `partage_packagesImportes` | G | `js/partage-import.js` (#329 lot P3) | Registre des packages .lcz importés : auteur (+ nom normalisé), item principal (id d'origine + id intégré), statut de confiance à l'import, `idsIntegres` par type (le retrait passe par cette IDENTITÉ, jamais par flag). JAMAIS namespacée. |
| `partage_grilles` / `partage_echelles` / `partage_cartouches` / `partage_productions` / `partage_pratiques` | G | `js/partage-import.js` (#329 lot P3) | Entités intégrées depuis des packages de partage, IDs préfixés `PARTAGE_{suffixe d'import}_` (D7), id source dans `inspireDe.idOriginal`. Collections PLATES (les cartouches y portent leur `grilleId` remappé — l'ancrage `cartouches_{grilleId}` reste réservé aux cartouches de l'utilisateur). Lues par `js/partage-section.js` (section « Partagés » des 5 biblios, lot P4), qui n'y écrit JAMAIS — « Dupliquer » copie vers les collections utilisateur. L'import n'écrit JAMAIS dans les collections utilisateur. |

---

## Migrations et flags d'état (init/boot)

Ces clés sont des flags one-shot, lues une fois au démarrage, écrites une fois lors d'une migration. Pattern SSOT-OK acceptable :

| Clé | Owner | Rôle |
|-----|-------|------|
| `migration-cles-globales-done` | `trimestres.js` | Migration namespacing Beta 95 |
| `migration-phase5-done` | `demo-activation.js` | Migration mode démo Phase 5 |
| `migrationBeta96Effectuee` | `migrations.js` | Migration Beta 96 |
| `migrationLegacyEffectuee` | `migrations.js` | Migration data legacy pré-Beta 95 |
| `migrationConfigsSpecifiques` | `pratiques.js` | Migration config v2 pratiques |
| `migrationBibliothequeV2` | `pratique-manager.js` | Migration bibliothèque pratiques |
| `migrationCleProductionsFaite` | `migrations.js` | Migration clé productions |
| `migration_decoupler_pn_done` | `main.js` | Migration AQPC 22 mai : decouplerPR → decouplerPN |
| `migration_rapports_bug_20_done` | `main.js` | Migration AQPC 22 mai : seuil rétention 50 → 20 |
| `migration_onboarding_v6_21_done` | `main.js` | Migration onboarding v6.21 |
| `_migration_fichiers_done` | `db.js` | Migration interne db |
| `_migration_thumbnails_done` | `travaux-stockage.js` | Extraction thumbnails 27 mars 2026 |

---

## Décisions de régime (triage du 21 août 2026)

| Verdict | Décision | État mesuré le 11 oct. 2026 |
|---|---|---|
| **D1** — régime des cartouches | Namespacer par trimestre (seule famille encore globale, partagée réel ↔ démo, orpheline à la suppression de sa grille) | **Exécuté** : `cartouches.js` écrit ``cle(`cartouches_${grilleId}`)`` ; la migration du stock tourne au démarrage (`main.js`, drapeau `migration_cartouches_namespacees_done`) |
| **D2** — huit échelles « collègues » codées en dur | Les retirer du code, vers la bibliothèque et les paquets de partage | **Exécuté** : aucun nom de collègue dans `js/echelles.js` (grep) ; le matériel de collègues passe par `partage_*` (#329) |

Source : `plans de travail/TRIAGE-audits-2026-08-21.md`, lignes D1 et D2 (#471, lot 13).

## Patterns exemplaires (à reproduire)

### 1. `calendrierComplet` — Un seul écrivain
`trimestre.js:842` est le seul module qui écrit dans cette clé. Tous les autres (calendrier-vue, saisie-presences, productions) lisent uniquement. Zéro risque de données incohérentes. 12 lecteurs.

### 2. `indicesAssiduite` — Calcul + stockage centralisé
`indices.js` (`calculerEtSauvegarderIndicesAssiduite()`) est le seul point d'écriture. 7 lecteurs.

### 3. `presences` — Refactorée Tier 6.4
`saisie-presences.js` est le seul écrivain depuis avril 2026 (API `modifierNotesPresence()` + `ajouterPresencesIntervention()` créées pour migrer interventions.js et profil-etudiant.js).

### 4. `interventions` — Owner unique
`interventions.js` seul écrivain. 1 lecteur (evaluation).

### 5. `profilEnseignant` — Owner corrigé 22 mai
`trimestre-v2-enseignants.js:249` est le seul écrivain littéral. Auteur pour CC. 5 lecteurs dont `cc-license.js` (consommateur, pas écrivain — erreur du registre d'avril 2026 corrigée Sprint A).

---

## Violations connues (à corriger)

### Synthèse — 22 mai 2026

| # | Clé | Sévérité | # écrivains | Plan |
|---|-----|----------|---:|------|
| #1 | `modalitesEvaluation` | CRITIQUE | 15 | **Tier 6.5 — Sprint C été 2026** (cf. SESSION.md §3 + PLAN-MOYEN-TERME §1 hors périmètre) |
| #2 | `evaluationsSauvegardees` | HAUTE | 8 | Tier 6.6 — Sprint C : créer API publique `evaluation-sauvegarde.js`, migrer 5 contourneurs hérités du god module pré-refactor |
| #3 | `grillesTemplates` | HAUTE | 7 | API `importerGrillesExternes()` existante — migration des 6 contourneurs (Tier 6.4 en cours) |
| #4 | `echellesTemplates` | HAUTE | 4 | API `importerEchellesExternes()` existante — migration des 3 contourneurs (Tier 6.4) |
| #5 | `pratiquesConfigurables` | HAUTE | 5 | Sprint B/C — examiner si tous les contourneurs sont justifiables ou s'il faut une API publique |
| #6 | `cadreCalendrier` | MINEURE | 2 | Init-only contournement par `trimestre-v2-init.js` — justifiable structurellement |
| #7 | `horaireHebdo` | MINEURE | 4 | Owner cible à confirmer (`trimestre-v2-orchestre.js` post-refactor). Écrivain `trimestre-v2-horaires.js` ajouté au décompte le 21 août 2026 (CT-04) |
| #8 | `seancesHoraire` | MINEURE | 3 | Cluster horaire — Sprint C |
| #9 | `trimestres` | MINEURE | 4 | Init/migration contournements justifiables |
| #10 | `trimestreActif` | MINEURE | 4 | Idem #9 (même cluster) |
| #11 | `infoCours` | **CRITIQUE (nouvelle)** | 7 | **Découverte 22 mai par audit-ssot.py** — non listée en mai. Cluster contexte cours, planifier Sprint C |
| #12 | `groupeCoursActif` | CRITIQUE | 6 | Sprint C — cluster contexte cours/groupe |
| #13 | `listeCours` | CRITIQUE | 5 | Sprint C — clé legacy + clé `cours` actuelle, à consolider |
| #14 | `enseignants` | HAUTE | 4 | Sprint C — migration des contourneurs `demo-activation`, `import-export`, `migrations` |
| #15 | `preferencesUtilisateur` | MINEURE | 2 | `accompagnement.js:156` historique + `main.js:289` migrations AQPC — justifiables (init/migration) mais à confirmer |
| #16 | `seuilsInterpretation` | MINEURE | 2 | Sprint C — clarifier rôle preferences-v2 vs interpretation-config |
| #17 | `tamponsPersonnalises` | MINEURE | 3 | Sprint C — examiner duplication tampons-bibliotheque/travaux-outils |

### Violations résolues

| # | Clé | Sévérité originale | Résolution |
|---|-----|---|---|
| ~~#R1~~ | ~~`presences`~~ | ~~MOYENNE~~ | **CORRIGÉ Tier 6.4** (3 avril 2026) — API `modifierNotesPresence()` + `ajouterPresencesIntervention()` |
| ~~#R2~~ | ~~`calculerTauxCompletion`~~ | ~~MOYENNE~~ | **CORRIGÉ Tier 6.1** (3 avril 2026) — recalcul divergent indice C retiré |
| ~~#R3~~ | ~~`_moyennesQualifies`~~ | ~~FAIBLE~~ | **CORRIGÉ Tier 6.3** (3 avril 2026) — cache jamais invalidé |
| ~~#R4~~ | ~~Notifications dispersées~~ | ~~MOYENNE~~ | **CORRIGÉ Cat-B Track 4 chantier E** (21 mai 2026) — `js/utils-notifications.js` consolidé, ~525 sites migrés, source unique `window.notifications.{succes, erreur, info}`, sentinelle Vitest stricte. Cf. SESSION.md §1bis Track 4 |
| ~~#R5~~ | ~~`window.evaluationEnCours` cross-module~~ | ~~HAUTE~~ | **CORRIGÉ Cat-B Track 4 chantier F** (21 mai 2026) — pivot encapsulé via API `evaluation.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par `evaluation-chargement.js`, sentinelle Vitest verrouille la whitelist d'écrivains (config.js + 7 modules `evaluation*.js`). Cf. SESSION.md §1bis Track 4 |
| ~~#R6~~ | ~~2 accès `localStorage` direct profil-etudiant~~ | ~~MOYENNE~~ | **CORRIGÉ Cat-B Track 4 chantier G** (21 mai 2026) — `profil-etudiant-diagnostics.js` migré vers `db.getSync`/`db.setSync` |
| ~~#R7~~ | ~~Vocabulaire alarmiste `--risque-*`~~ | ~~FAIBLE (UX)~~ | **CORRIGÉ Cat-B Track 4 chantier J + reliquat tokens** (21 mai 2026) — 49 substitutions R → N + 97 tokens CSS `--risque-*` → `--niveau-attention-*` |
| ~~#R8~~ | ~~`decouplerPR`/`indiceR`/`risque` propriété~~ | ~~CRITIQUE (vocabulaire)~~ | **CORRIGÉ AQPC Phase 6.1 reliquat** (22 mai 2026) — refactor R → N, source unique `decouplerPN`/`indiceN`/`niveauAttention`, migration de données idempotente dans `main.js` (`migration_decoupler_pn_done`) |

---

## Opérations destructives globales

À surveiller — chaque `localStorage.clear()` / `db.clear()` doit être encadré par une confirmation UX :

| Fichier:ligne | Opération | Encadrement |
|---|---|---|
| `js/db.js:475` | `localStorage.clear()` | Interne à l'API d'abstraction — utilisé par `db.clear()` |
| `js/import-export.js:1101` | `localStorage.clear()` | Confirmation `'EFFACER'` requise. **Note Sprint B/C : 03-1-ssot zone grise** — doublon avec `db.clear()` ligne 1105 (cf. interprétation A/B audit) |
| `js/import-export.js:1105` | `db.clear()` | Suit immédiatement le `localStorage.clear()` |

---

## Architecture de stockage

```
Petites clés (< 200 Ko)
  localStorage = source de vérité
  IDB = backup asynchrone

Grosses clés (> 200 Ko) : fichiersTravaux, evaluationsSauvegardees
  IDB + memoryCache = source de vérité
  localStorage = cache synchrone (si quota le permet)

Filtrage par cours/mode :
  obtenirDonneesSelonMode('cle')  → lecture filtrée
  sauvegarderDonneesSelonMode('cle', data) → écriture protégée (bloque en anonymisation)

Namespacing par trimestre :
  cle('presences') → 'h2026_presences'
  Liste des clés namespacées : trimestres.js lignes 40-80
```

### Seuil IDB-first (`SEUIL_IDB_FIRST`, #334 D)

Constante **unique** (`js/db.js`, top de l'IIFE, 200 Ko), consommée par `set()`,
`setSync()` et `syncToLocalStorageCache()`. Au-delà du seuil, une valeur va
directement dans `memoryCache` + IndexedDB **sans tenter localStorage** — évite
un `QuotaExceededError` systématique sur les grosses clés. `set()` et `setSync()`
sont harmonisés sur ce chemin (15 juin 2026) ; `set()` conserve un filet
`QuotaExceededError` résiduel (estimation sous le seuil mais localStorage saturé
par ailleurs).

### Règle d'éviction `memoryCache` (décision #334 D, 15 juin 2026)

**Pas d'éviction LRU / purge généralisée du `memoryCache` possible.** `getSync()`
ne peut pas réhydrater une clé depuis IndexedDB (lecture IDB asynchrone) : 608
call-sites `getSync` dans ~60 fichiers lisent les grosses clés de façon
synchrone. `memoryCache` est, par conception, le **tiers synchrone** des grosses
clés (`fichiersTravaux`, `evaluationsSauvegardees`…).

> **Invariant** : toute purge de `memoryCache` doit PROUVER qu'aucun `getSync`
> ne lit la clé visée. Seule clé purgée sans risque à ce jour :
> `_codex_snapshot_avant` (lectures exclusivement asynchrones), remplacée depuis
> #334 C par un index de hachés (`codex-snapshot-hash-v1`, format interne de
> `js/codex.js` : `{__format, cles: {clé: sha256(JSON)}}`) — quelques Ko au lieu
> du dataset intégral, donc repassée sous le seuil et sortie du `memoryCache`.

---

## Bases IndexedDB annexes (hors db.js)

Stockage qui ne passe PAS par `db.js` ni par sa base `keyvalue` — donc invisible
aux exports/restaurations Codex et au cache localStorage. À n'utiliser que pour
du matériel qui NE DOIT PAS entrer dans ces flux.

| Base | Store | Propriétaire | Contenu | Justification |
|------|-------|-------------|---------|---------------|
| `labo-codex-identite` | `cles` | `js/signature.js` (#329 lot F) | Paire ECDSA P-256 de signature des packages de partage. Clé privée **non extractible** (`CryptoKey`), clé publique + export base64(JWK), date de création. Enregistrement unique `identite-v1`. | Un `CryptoKey` se dégrade silencieusement en `{}` au `JSON.stringify` de la copie localStorage de `db.js` ; et le matériel d'identité ne doit jamais transiter par un export/restauration Codex (écrasement, fausse restauration d'une clé non extractible). Décision Grégoire 10 juin 2026. Perte de la base = nouvelle identité (re-TOFU chez les pairs ; sauvegarde chiffrée = #47, hors lot). |

---

## Annexe — clés vues par l'inventaire du 11 oct. 2026, non déclarées ci-dessus

> Générée le 11 oct. 2026 (lot 13, #471 et volet documentation de #629) par `python3 scripts/audit-ssot.py`.
> **C'est un INVENTAIRE, pas une déclaration de propriétaire** : la colonne « Écrivains » liste les fichiers où
> le script voit une écriture littérale, sans dire lequel devrait être le propriétaire. Déclarer un propriétaire
> se fait clé par clé, dans les tables ci-dessus, quand un chantier touche la clé. Les violations viennent en tête.
> 83 clés sur 137 inventoriées.

| Clé | Statut du script | Écrivains (fichiers) | Lecteurs |
|---|---|---|---|
| `groupeSelectionne` | violation-mineure | `demo-activation.js`, `trimestre-v2-etudiants.js` | 1 |
| `horaireSelectionne` | violation-mineure | `demo-activation.js`, `trimestre-v2-horaires.js` | 1 |
| `horaires` | violation-mineure | `migrations.js`, `trimestre-v2-horaires.js` | 8 |
| `planification_seances` | violation-mineure | `main.js`, `planification-donnees.js` | 2 |
| `cartouches_` | no-literal-writer | — | 2 |
| `chronoEvaluations` | no-literal-writer | — | 2 |
| `coursActif` | no-literal-writer | — | 1 |
| `demo_enseignants` | no-literal-writer | — | 1 |
| `demo_groupesCours` | no-literal-writer | — | 1 |
| `demo_listeCours` | no-literal-writer | — | 1 |
| `demo_modalitesEvaluation` | no-literal-writer | — | 1 |
| `echellePerformanceActive` | no-literal-writer | — | 1 |
| `elevesDesinscrits` | no-literal-writer | — | 1 |
| `flechesDidactiquesActives` | no-literal-writer | — | 1 |
| `horaireActif` | no-literal-writer | — | 1 |
| `indicesAssiduiteDetailles` | no-literal-writer | — | 1 |
| `mapping_anonymisation` | no-literal-writer | — | 1 |
| `planification_seances_archive_pre367` | no-literal-writer | — | 1 |
| `productionsPedagogiques` | no-literal-writer | — | 1 |
| `proto_carte_mentale` | no-literal-writer | — | 1 |
| `resultatsUlterieurs` | no-literal-writer | — | 1 |
| `rythmeColonnesT1` | no-literal-writer | — | 1 |
| `rythmeColonnesT2` | no-literal-writer | — | 1 |
| `trimestresDisponibles` | no-literal-writer | — | 1 |
| `xxx` | no-literal-writer | — | 1 |
| `anonymisation_afficher_da_reel` | ssot-ok | `modes.js` | 1 |
| `autoreflexionBilan` | ssot-ok | `bilan-reflexif-core.js` | 0 |
| `categoriesMasquees` | ssot-ok | `travaux-outils.js` | 1 |
| `categoriesPerso` | ssot-ok | `travaux-outils.js` | 1 |
| `cc-derniere-description` | ssot-ok | `cc-license.js` | 1 |
| `confidentielEtudiants` | ssot-ok | `profil-etudiant-confidentiel.js` | 1 |
| `corbeilleFichiers_backup_v1` | ssot-ok | `migration-diagnostic.js` | 1 |
| `couleursCategories` | ssot-ok | `travaux-outils.js` | 2 |
| `demo-actif` | ssot-ok | `demo-activation.js` | 4 |
| `demo-etat-precedent` | ssot-ok | `demo-activation.js` | 1 |
| `dernieresSelectionsEvaluation` | ssot-ok | `evaluation.js` | 1 |
| `elementsMasques` | ssot-ok | `travaux-outils.js` | 1 |
| `errfrModeSynthese` | ssot-ok | `travaux-outils.js` | 1 |
| `etatsAccordeonsV2` | ssot-ok | `pratiques.js` | 1 |
| `evaluationsSauvegardees_backup_v1` | ssot-ok | `migration-diagnostic.js` | 1 |
| `fichiersTravaux_backup_v1` | ssot-ok | `migration-diagnostic.js` | 1 |
| `filtresListeEvaluations` | ssot-ok | `liste-evaluations.js` | 1 |
| `fsapi_persistance_handles` | ssot-ok | `db.js` | 2 |
| `mapping_groupes_anonymes` | ssot-ok | `modes.js` | 1 |
| `migrationBeta96Date` | ssot-ok | `migrations.js` | 0 |
| `migration_cartouches_namespacees_done` | ssot-ok | `main.js` | 1 |
| `migration_estEssai_to_estMaquette_done` | ssot-ok | `main.js` | 1 |
| `migration_modalites_namespacees_done` | ssot-ok | `main.js` | 1 |
| `migration_modeles_namespacees_done` | ssot-ok | `main.js` | 1 |
| `migration_planification_seances_done` | ssot-ok | `main.js` | 1 |
| `migration_pratiqueId_to_configurable_id_done` | ssot-ok | `main.js` | 1 |
| `migration_pratiques_namespacees_done` | ssot-ok | `main.js` | 1 |
| `nomsCategoriesTampons` | ssot-ok | `travaux-outils.js` | 1 |
| `notesRapport` | ssot-ok | `profil-etudiant-rapport.js` | 1 |
| `objectifsTemplates` | ssot-ok | `objectifs.js` | 1 |
| `ordreAutocollants_` | ssot-ok | `travaux-outils.js` | 1 |
| `ordreAutocollants_action` | ssot-ok | `travaux-outils.js` | 1 |
| `ordreAutocollants_comprehension` | ssot-ok | `travaux-outils.js` | 0 |
| `ordreAutocollants_contenu` | ssot-ok | `travaux-outils.js` | 1 |
| `ordreAutocollants_diagnostic` | ssot-ok | `travaux-outils.js` | 0 |
| `ordreAutocollants_observations` | ssot-ok | `travaux-outils.js` | 0 |
| `ordreAutocollants_qualite` | ssot-ok | `travaux-outils.js` | 0 |
| `ordreAutocollants_symboles` | ssot-ok | `travaux-outils.js` | 0 |
| `ordreCategories` | ssot-ok | `travaux-outils.js` | 1 |
| `ordreErreursFr` | ssot-ok | `travaux-outils.js` | 0 |
| `personnalisationErreursFr` | ssot-ok | `travaux-outils.js` | 1 |
| `personnalisationObservations` | ssot-ok | `travaux-outils.js` | 1 |
| `pratiqueParDefaut` | ssot-ok | `pratiques.js` | 2 |
| `preferencesRythme` | ssot-ok | `rythme.js` | 1 |
| `presences_date` | ssot-ok | `saisie-presences.js` | 1 |
| `presences_groupe` | ssot-ok | `saisie-presences.js` | 1 |
| `presences_tri` | ssot-ok | `saisie-presences.js` | 1 |
| `profilOngletDeveloppementActif` | ssot-ok | `profil-etudiant-diagnostics.js` | 0 |
| `raccourcisAnnotation` | ssot-ok | `travaux-outils.js` | 1 |
| `recalculerIndicesCP` | ssot-ok | `main.js` | 1 |
| `recherchePresences` | ssot-ok | `saisie-presences.js` | 1 |
| `ressourcesSupprimees` | ssot-ok | `main.js` | 1 |
| `<trim>_ressourcesSupprimeesTrimestre` | ssot-ok | `main.js` (#683, 15 oct. 2026 : marque de suppression du matériel de départ, par trimestre ; l’ancienne globale reste lue) | 1 |
| `retroactionsErreursFr` | ssot-ok | `travaux-outils.js` | 1 |
| `retroactionsObservations` | ssot-ok | `travaux-outils.js` | 1 |
| `seancesCompletes` | ssot-ok | `horaire.js` | 0 |
| `symbolesUnicodePerso` | ssot-ok | `travaux-outils.js` | 1 |
| `tamponsImages` | ssot-ok | `tampons-bibliotheque.js` | 1 |
| `thumbnail_` | ssot-ok | `travaux-stockage.js` | 1 |

---

## Méthodologie — comment ce registre est mis à jour

1. Lancer `python3 scripts/audit-ssot.py` à la racine du repo.
2. Lire `scripts/audit-ssot.md` (synthèse Markdown) ou `scripts/audit-ssot.json` (données structurées).
3. Pour chaque clé en `violation-critique` ou `violation-mineure` non listée ici, ajouter une entrée dans la table « Violations connues ».
4. Pour chaque clé qui apparaît comme `no-literal-writer`, vérifier manuellement quel module l'écrit via variable (grep `const CLE_X = 'nom-cle'` ou `cle('nom-cle')`) — ces écrivains via variable sont annotés ici par « via variable ».
5. Mettre à jour l'en-tête : Beta courante + date + source.

**Fréquence recommandée** : à chaque cycle de refactoring majeur (god modules, consolidation SSOT, migrations de clés).

---

**Dernière mise à jour** : 11 oct. 2026 (annexe de l'inventaire, lot 13) ; tables déclarées : 22 mai 2026, Sprint A (Beta 99.62, build 0522-0650).
**Prochaine mise à jour prévue** : à la clôture du Sprint B (cartographies 3.2 + 3.3) post-AQPC, puis à la clôture du Sprint C (Tier 6.5 `modalitesEvaluation`) été 2026.
