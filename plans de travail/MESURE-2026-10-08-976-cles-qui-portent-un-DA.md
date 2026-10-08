# Mesure – les clés qui portent un DA (#976, lot 7 du chantier de l'enregistrement)

> Claude Code, 8 octobre 2026, vers 14 h 45 (Toronto). Lecture seule du code à `803f2c5d` (1.190.1 + consigne). Aucune donnée réelle ouverte : l'inventaire vient du code (écrivains, formes construites), pas d'un stock.
> Portée décidée le 8 oct. (14 h 18) : **le trimestre actif seulement**. Les clés globales ne sont pas touchées (consigne § 1).

Légende : **NS** = préfixée `<trim>_` par `cle()` ; **NS composée** = `<trim>_famille_<suffixe>`, hors des boucles du registre (énumérée par `db.keysSync()`) ; **G** = globale (au registre `CLES_GLOBALES`) ; **G nue** = globale de fait (absente des deux registres, `cle()` la rend nue).

## A. Trimestre actif : ce que le geste déplace

| Clé | Écrivain propriétaire | Où est le DA | Ce que le geste fait |
|---|---|---|---|
| `<trim>_groupeEtudiants` | `trimestre-v2-etudiants.js` (`soumettreEtudiantV2`) | champ `da` de la fiche | renomme la fiche, **en dernier** |
| `<trim>_evaluationsSauvegardees` | `evaluation-sauvegarde.js` (+ 7 contourneurs) | champ `etudiantDA` | renomme (aucun id composé, `remplaceeParId`/`repriseDeId` sans DA) |
| `<trim>_presences` | `saisie-presences.js` | champ `da` | renomme |
| `<trim>_indicesAssiduite` | `indices.js` | clé d'objet `sommatif[da]` | renomme la clé, puis recalcul A → C → P |
| `<trim>_indicesCP` | `portfolio.js` | clé d'objet `[da]` | renomme la clé (recalculée ensuite) |
| `<trim>_indicesPatternsRaI` | `profil-etudiant-actions.js` | clé d'objet `[da]` | renomme la clé |
| `<trim>_indicesEvaluation` | aucun (orpheline, Tier 6.2) | clé d'objet `[da]` | renomme la clé (stock hérité) |
| `<trim>_snapshots_<id>` | `snapshots.js` | trois formes : `hebdomadaires[].etudiants[].da`, `interventions[].etudiantsDA[]`, `interventions[].avant/apres[da]` | renomme les trois |
| `<trim>_portfoliosEleves` | `portfolio.js` | clé d'objet `[da]` | renomme la clé |
| `<trim>_interventions` (interventions, rencontres, RàI) | `interventions.js` | trois formes : `etudiants[]`, `notesIndividuelles[da]`, `snapshotAvant[da]` | renomme les trois |
| `<trim>_etudiantsSuivis_gc_<gcId>` | `tableau-bord-apercu.js` | champ `da` | renomme |
| `<trim>_notesRapport` | `profil-etudiant-rapport.js` | clé d'objet `[da]` | renomme la clé |
| `<trim>_elevesDesinscrits` | `trimestre-v2-etudiants.js` (`supprimerEtudiantV2`) | champ `da` | renomme |
| `<trim>_resultatsUlterieurs` | aucun depuis #915 (stock lu par le registre) | clé d'objet `[da]` | renomme la clé |
| `<trim>_confidentielEtudiants` | `profil-etudiant-confidentiel.js` | clé d'objet `[da]` | renomme la clé |
| `<trim>_chronoEvaluations` | `travaux-ui.js` | champ `etudiantDA` | renomme |
| `<trim>_fichiersTravaux` (copies) | `travaux-stockage.js` | champ `etudiantDA` ; `leaParsed.da` ; `groupeDocumentId` = `<da>_…` | renomme les trois ; **les noms de fichier d'origine** (`nomFichier`, `nomFichierLea`, `leaParsed.raw`) restent tels quels : c'est le nom du fichier déposé, pas un lien |
| `<trim>_annotationsTravaux` | `travaux-stockage.js` | champ `etudiantDA` | renomme |
| `<trim>_corbeilleFichiers` | `travaux-stockage.js` | comme `fichiersTravaux` | renomme comme `fichiersTravaux` |
| `<trim>_mapping_anonymisation` | `modes.js` (NS composée à la main) | clé d'objet `[da]` | renomme la clé (le pseudonyme suit l'élève) |

## B. Trimestre actif : laissé tel quel, et pourquoi

| Clé | Où est le DA | Disposition |
|---|---|---|
| `<trim>_preferencesRapport` | aucun (six booléens) | rien à faire |
| `<trim>_archivesBundles` | aucun écrivain | rien à faire |
| `<trim>_fichiersTravaux_backup_v1`, `_evaluationsSauvegardees_backup_v1`, `_corbeilleFichiers_backup_v1` | copies figées d'une migration (une seule fois, `migration-diagnostic.js`) | **laissées** : une sauvegarde d'avant migration n'est pas un lien vivant ; la réécrire la fausserait (issue 3) |
| `<trim>_pipeline_queue` | en `sessionStorage`, file d'import en cours | laissée : éphémère, ne survit pas à l'onglet |
| magasin IndexedDB `fichiers`, index `etudiantDA` | champ du blob | **laissé** : aucun lecteur (`listerBlobsEtudiant` n'a aucun appelant, mesuré par grep) et `reassocierFichier` ne le tient déjà pas à jour ; le réécrire réécrirait chaque copie entière (issue 3, commentaire dans le code) |

## C. Clés globales qui portent un DA

> **Mise à jour, 8 oct. 2026, après 14 h 50 — décision de Grégoire : les trois clés de résultats SUIVENT** (`registreLongitudinal` : `eleves[da]` et son champ `da`, les copies datées des dossiers gardent le DA de leur capture ; `jetonsEtudiants` : une entrée vide sous le nouveau DA est remplacée ; `jugementsDenotation`), avec les mêmes garanties que les clés du trimestre. Le refus décrit ci-dessous est retiré. Les autres globales restent telles quelles.

Version d'avant la décision (le tableau reste lisible pour ses autres lignes) :

| Clé | NS/G | Écrivain | Forme | Ce que le geste fait |
|---|---|---|---|---|
| `registreLongitudinal` | G | `registre-longitudinal.js` | `eleves[da]` + dossiers | **compte** ; s'il porte l'ancien DA, le geste **refuse** (voir ci-dessous) |
| `jetonsEtudiants` | G nue | `evaluation-jetons.js` | `[da]` (jetons personnalisés) | **compte** ; refus s'il porte l'ancien DA |
| `jugementsDenotation` | G nue (`cle()` appelée, clé absente du registre ; DATA-OWNERSHIP la dit NS à tort) | `pratiques/denotation-jugements.js` | `[pratiqueId][da]` (notes de la dénotation) | **compte** ; refus s'il porte l'ancien DA |
| `cas_fichiers_multiples_valides` | G nue | `travaux-doublons-ui.js` | `[{ da, … }]` | laissée (une validation d'écran : au pire la question revient) |
| `etatTirage` | G nue | `boite-outils.js` | `exclus[]`, `dejaTires[]` | laissée (état d'animation) |
| `equipesAnimation_<coursId>` | G nue | `equipes.js` | `'da1\|da2'` | laissée (équipes retenues) |
| `etudiantsSuivis`, `mapping_anonymisation`, `indicesPatternsRaI` (nues, héritées) | G nue | plus écrites | `[da]` | laissées |

**Pourquoi un refus et non un oubli** : la consigne dit à la fois « ne touche pas une clé globale » et « rien ne reste sous l'ancien DA ». Pour les trois clés qui portent des **résultats** (registre, jetons, notes de dénotation), les deux règles ne tiennent ensemble que si le geste refuse quand l'une d'elles porte l'ancien DA. Le refus dit laquelle. C'est une supposition (à Grégoire de dire si ces trois clés doivent suivre).

Trouvailles, issue 2 (à inscrire, hors lot) : `jugementsDenotation`, `jetonsEtudiants` et `cas_fichiers_multiples_valides` sont globales de fait alors que leurs données sont celles d'un trimestre (même mécanique que `fichiersModelisation`).

## D. Ce que la fenêtre compte « pour de vrai »

Évaluations (`evaluationsSauvegardees`), présences (`presences`), copies (`fichiersTravaux` + corbeille), résultats (indices A/C/P, portfolio, interventions et rencontres, notes de rapport, confidentiel, résultats ultérieurs). Le compte est celui de la passe à blanc, sur les clés ci-dessus, avant toute écriture.
