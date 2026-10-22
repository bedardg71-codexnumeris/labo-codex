# Fiche – Les écritures directes dans un trimestre clos (#1140)

> Claude Code, jeudi 22 octobre 2026, sur `main` (`6cf96456`). Suite 2 du verdict de Cowork
> (`VERDICT-RELECTURE-2026-10-22-protection-donnees-1075.md`). **Mesure seulement, aucun code.**
> Prolonge #1075, point 2 : le refus vit dans `sauvegarderDonneesSelonMode` et `modifierEtAnnoncer`
> (`js/modes.js`, `_trimestreClosRefuse`) et au seul point d'écriture de l'annotation ; tout ce qui
> suit écrit sans passer par lui.

## Ce que la fiche compte

**Le critère** : `grep -rnE "db\.setSync\((window\.)?cle\(" js/`, soit une écriture directe dans une
clé du trimestre actif. **56 sites, pas 48** : le même motif donne 56 à `5bb7ff6d` (avant #1075) et à
`HEAD`, aucun dans `js/_archives/`. Je ne retrouve pas le critère qui donnait 48 dans la demande de
relecture ; la fiche liste donc les 56, avec ce critère nommé.

**Ce qu'elle ne compte pas** (mesuré, non classé) : 40 écritures `db.modifier`, `db.remove` et
`db.removeSync` directes sur `cle(…)` (grilles, échelles, cartouches, pratiques, `groupeEtudiants`) ;
6 `db.setSyncSiChange(cle(…))` ; et les autres `db.setSync` à clé calculée (354 `db.setSync` au total,
dont ces 56). Le trou est donc plus large que la liste.

## Comment lire « atteignable »

La lecture seule d'un trimestre clos est une règle CSS (`index.html`, l. 1153-1165) : `pointer-events:
none` sur les champs, sauf les exclus (`v2-`, `inclure-`, `checkbox-`, `recherche-`, `filtre-`,
`selecteur…`), et sur les seuls boutons `.btn-supprimer`, `.btn-modifier`, `.btn-ajouter`.

| Valeur | Sens |
|---|---|
| **Auto** | Écrit sans geste : chargement, bascule de trimestre, rendu d'une vue. Atteint dès qu'un trimestre clos est actif. |
| **Oui** | Un geste ouvert : bouton d'une autre classe, ou champ exclu de la règle. |
| **Clavier** | Bloqué à la souris par la règle CSS, mais `pointer-events` n'arrête pas Tab ni Entrée. *Inféré du CSS, non éprouvé.* Sur iPad sans clavier : non. |
| **Non** | Une garde explicite refuse avant, ou l'écriture vise un autre trimestre. |
| **Console** | Seulement par la console du navigateur. |

« (inféré) » marque un geste lu dans le code sans remonter jusqu'à l'écran.

## Les 56 sites

### Auto – sans geste (14)

| Site | Clé | Ce qui y mène |
|---|---|---|
| `trimestre.js:93` | `calendrierComplet` | `genererCalendrierComplet`, dès la bascule vers le trimestre (`changerTrimestreActif`, `trimestres.js:595`) et au démarrage. N'écrit ici que `{}` quand les dates manquent. |
| `horaire.js:605` | `seancesCompletes` | `genererSeancesCompletes`, appelé à l'ouverture des Présences, du tableau de bord, et par `obtenirSeancesCompletes` quand le cache manque (une lecture qui écrit). N'écrit ici que `{}` quand le calendrier est vide. |
| `trimestre-v2-horaires.js:527` | `horaireSelectionne` | `chargerHorairesV2`, au démarrage et à la bascule ; seulement si la sélection est orpheline. Préférence d'affichage. |
| `planification-carte.js:559` | `planification_seances` (`CLE_SEANCES`) | `migrerObjectifsVersMetadata`, à l'ouverture de la carte ; idempotente. |
| `planification-donnees.js:152` | carte (`CLE_DONNEES`) | `setDonnees` : écritures discrètes à l'ouverture et réparation silencieuse (l. 237, 254). **Aussi Oui** : tout geste sur la carte passe par là. |
| `pratiques.js:112` | `pratiquesConfigurables` | `migrerConfigurationsSpecifiques`, à l'initialisation du module. |
| `pratiques.js:420` | `pratiquesConfigurables` | `migrerEtablissementsPratiques`, au rendu de la liste des pratiques. |
| `pratique-manager.js:143`, `:176` | `pratiquesConfigurables` | `migrerVersBibliotheque`, à l'initialisation du module. |
| `portfolio.js:41` | `portfoliosEleves` | IIFE au chargement du script ; seulement si le stock est un tableau (réparation). |
| `interventions.js:1874` | `interventions` | `initialiserModuleInterventions` (`main.js:1264`) ; seulement si la clé est absente (pose `[]`). |
| `demo-activation.js:474` | `cartouches_<id>` | `retirerItemsDemoDesGlobaux` par `migrerResidusPhase5` (`main.js:1199`), au démarrage hors démo, une fois (marque `migration-phase5-done`), s'il reste des résidus. |
| `travaux-stockage.js:319` | `fichiersTravaux` | `initialiserStockageTravaux` : `migrerBlobStatut` (l. 1333). **Aussi Oui**, voir plus bas. |
| `travaux-stockage.js:1029` | `corbeilleFichiers` | `initialiserStockageTravaux` : `purgerCorbeilleExpiree` (l. 1339). **Aussi Oui**, voir plus bas. |

### Oui – un geste ouvert (32, plus les deux hubs des copies déjà comptés en Auto)

| Site | Clé | Geste |
|---|---|---|
| `import-export.js:3046`, `:3072`, `:3107` | `echellesTemplates`, `grillesTemplates`, `cartouches_<id>` | Importer une configuration complète (`executerImportConfigComplete`, bouton `btn-principal`). |
| `import-export.js:3358`, `:3397`, `:3489` | `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables` | Importer la sélection d'un fichier brut (`executerImportSelectif`, bouton `btn-principal`). |
| `grilles.js:6786`, `echelles.js:3699`, `pratiques.js:1228` | `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables` | Réimporter depuis la Réserve (`appliquerReimport`, `reserve-ouvrir.js:1170-1190`), par `importer…Externes`. Aucune garde (inféré). |
| `travaux-stockage.js:319` | `fichiersTravaux` | Hub des copies, 20 appelants : importer, supprimer, réassocier, mettre à jour, marquer exporté, réimporter (`travaux-import.js:1655, 1670`). Aucune garde dans l'import des copies. **L'archivage des copies (#1028) y écrit légitimement.** |
| `travaux-stockage.js:1029` | `corbeilleFichiers` | Mettre en corbeille, restaurer, supprimer définitivement, vider la corbeille. |
| `travaux-stockage.js:934` | `annotationsTravaux` | Annoter : **gardé** depuis `ea3b1753` (`sauvegarderAnnotation`). Restent sans garde : le report des annotations à l'enregistrement de l'éditeur de pages (l. 1005, #1075 point 7) et la suppression définitive d'une copie (l. 1140). |
| `modelisation.js:238` | `fichiersModelisation` | Ajouter un fichier de modélisation (`ouvrirFichierLocal`) ou le supprimer (inféré). |
| `modelisation.js:435` | `annotationsTravaux` | Retirer un fichier de modélisation (badge `annot-badge-supprimer`, `modelisation.js:145`). |
| `travaux-doublons-ui.js:36` | `cas_fichiers_multiples_valides` | Dialogue des copies multiples : « Appliquer » (l. 476) et marquer un livrable additionnel (inféré). |
| `trimestre-v2-etudiants.js:584` | `groupeSelectionne` | Choisir un groupe (`#v2-selectGroupe`, exclu de la règle). Préférence d'affichage. |
| `trimestre-v2-etudiants.js:1052` | `groupeSelectionne` | « Nouveau groupe » (`btn-nouvelle-entite`, non bloqué). |
| `trimestre-v2-horaires.js:574`, `:589`, `:597` | `horaireSelectionne` | Choisir un horaire (`#v2-selectHoraire`, exclu). Préférence d'affichage. |
| `trimestre-v2-horaires.js:889` | `horaireSelectionne` | « Fermer » la fiche d'horaire (`btn-annuler`). |
| `trimestre-v2-orchestre.js:251`, `:252` | `horaireHebdo`, `seancesHoraire` | Activer un groupe-cours dans le Cadre (`changerGroupeCoursActifV2`, `trimestre-v2-groupes-cours.js:74`), si le groupe a un horaire (inféré). |
| `groupe-cours.js:255` | `horaireHebdo` | Changer de cours dans l'en-tête (`changerCoursDepuisEntete`, `contexte.js:122`) (inféré). |
| `profil-etudiant-rapport.js:506` | `preferencesRapport` | Cocher une section du rapport (`#inclure-…`, exclu de la règle). |
| `planification-carte.js:3780` | `planification_seances` | Supprimer un nœud de leçon : bouton du panneau (`.planif-btn-supprimer`, pas `.btn-supprimer`), glisser vers la corbeille, touche Suppr. |
| `planification-donnees.js:594` | `planification_seances` | Importer une carte depuis un autre trimestre (`importerCarteDepuisTrimestre`) (inféré). |
| `rencontres.js:354` | `cadreCalendrier` | « Créer mon service » (`btn-principal`). |
| `modalites-evaluation.js:53` | `modalitesEvaluation` | Appliquer une configuration de pratique (`pratiques-bibliotheque.js:521`), importer une configuration complète (`import-export.js:3162`). **Aussi Auto** : `nettoyerLegacy` (`preferences.js:516`). |
| `saisie-presences.js:2180` | `recherchePresences` | Taper dans la recherche des présences (`#recherche-saisie-presences`, exclu). Préférence d'affichage. |
| `denotation-jugements.js:125` | jugements de dénotation | « Enregistrer le jugement » (`btn-principal`) ; le champ de justification, lui, est bloqué. |
| `pratique-manager.js:79` | `groupesCours` | « Appliquer au cours » (`appliquerPratiqueAuCoursActive`, `btn-principal`, `index.html:6183`). |
| `pratique-manager.js:211` | `pratiquesConfigurables` | Finaliser l'assistant de pratique, dupliquer une pratique, importer une pratique (inféré). |
| `pratique-manager.js:239` | `pratiquesConfigurables` | Jeter une maquette du Comparateur (`comparateur-pratiques.js:619`) ; l'appelant de `supprimerPratique` (`pratiques.js:801`) n'est pas remonté. |

### Clavier – bloqué à la souris seulement (3)

| Site | Clé | Geste |
|---|---|---|
| `trimestre-v2-horaires.js:1095` | `horaireSelectionne` | « Supprimer » l'horaire (`#v2-btnSupprimerHoraire.btn-supprimer`). |
| `profil-etudiant-rapport.js:460` | `notesRapport` | Écrire dans « Mes notes » du rapport (`#textarea-notes-rapport-…` : l'exclusion vise `textarea-rapport-`, pas ce préfixe). |
| `donnees-v2.js:1627` | `pratiquesConfigurables` | Supprimer une pratique (bouton `btn-supp…` de la Conception). Le même geste depuis Réglages › Données (l. 1557) n'est pas remonté jusqu'à sa classe. |

### Non (4) et Console (3)

| Site | Clé | Pourquoi |
|---|---|---|
| `pratiques-gestion.js:664` | `pratiquesConfigurables` | `copierPratiqueDepuisTrimestre` : les deux appelants refusent un trimestre clos (l. 725, 756). |
| `demo-activation.js:227`, `:310`, `:311` | `cartouches_<id>`, `horaireSelectionne`, `groupeSelectionne` | Écrits après `trimestreActif = 'demo'` : visent la démo, pas le trimestre clos. |
| `migration-diagnostic.js:176`, `:177`, `:178` | `…_backup_v1` | `migrationSnapshot`, seulement par la console ; une fois par trimestre (marque). |

## Ce que la mesure dit, en trois lignes

- **Faits** : 14 sites écrivent sans geste dès qu'un trimestre clos est actif ; 32 autres sont au bout d'un geste ouvert ; 3 ne sont bloqués qu'à la souris ; 4 ne visent pas le trimestre clos ou sont refusés ; 3 ne passent que par la console (14 + 32 + 3 + 4 + 3 = 56).
- **Inférence** : les écritures qui changent une donnée d'élève ou de notation sont les copies et la corbeille, l'import et le réimport (grilles, échelles, pratiques, cartouches), la carte, la pratique appliquée au cours, le jugement de dénotation et les modalités. Les autres sont des préférences d'affichage ou des migrations idempotentes.
- **Limite** : la classe des boutons de plusieurs dialogues n'est pas lue (« inféré »), et aucune de ces lignes n'a été éprouvée dans un navigateur.

## Disposition

Inscrit au BACKLOG sous **#1140**, au titre de #1075 (chantier en cours), sans symptôme vécu. Aucun code.
