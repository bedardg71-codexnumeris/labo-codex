# TABLEAU DU LABO — les pratiques de notation, geste par geste (16 septembre 2026)

Second livrable de `Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md`. **Matériau** pour le labo « comment ça marche, comment l'utiliser » : une ligne par geste du parcours, par famille. Colonnes : le geste à l'écran · l'écran/bouton · ce que l'application ÉCRIT (clé, champ) · ce que le moteur LIT · ce que l'application DIT · le test qui le couvre · verdict au 16 sept. (`[exécuté]` banc, `[page]` navigateur, `[lecture]`). **Une ligne sans test devient une porte terrain** (skill `portes-terrain`), à Grégoire.

Légende des verdicts : ✅ le geste fait ce que l'app dit · ⚠ le geste fonctionne mais une phrase ment ou une valeur se perd · ⛔ le geste trahit le labo (constat majeur de l'audit).

## Transversal (les sept étapes, quelle que soit la famille)

| # | Geste | Écran / bouton | L'app écrit | Le moteur lit | L'app dit | Test | Verdict |
|---|---|---|---|---|---|---|---|
| 0 | Ouvrir l'assistant | Conception › Pratiques de notation › « + Nouvelle pratique » (`data-action="creerNouvellePratique"`) | rien | — | « L'assistant te guide en 8 étapes… » (popup 1543) — il y en a 9 à 10 selon la famille | spec audit E ×4 | ⚠ le compte d'étapes de l'Aide |
| 1 | Porte « décrire » ou « partir d'un modèle » | étape `entree-pratique` | `reponses.porteEntree` | — | — | `golden-creation-319` | ✅ |
| 1' | **Partir d'un modèle** (5 offerts) | `choix-modele` → clone fidèle du gabarit | l'enveloppe du gabarit, nouvel id, `dansBibliotheque` | selon famille (voir B) | « Modèle … » | `golden-creation-319` (clone fidèle) ; banc B1 | ⛔ STD : pas d'instance (échelle absente) → profil 77,32 mais export « non constructible » ; rouvrir + enregistrer efface le portfolio (B-2) |
| 8 | Informations de base | `infos-base` | `nom, auteur, etablissement, discipline, description` | `nom`, `auteur` (badge, CC) | « Remplis : Nom, Établissement, Discipline » (obligatoires) | spec E | ✅ — le labo doit prévenir : établissement et discipline sont exigés |
| 9 | Récapitulatif → « Créer » | `recapitulatif`, `#wizard-v2-btn-creer` | `pratiquesConfigurables[]` (namespacée), forme `{id, nom, type, calcul_note, configuration}` | `construireConfigComplete` | le récap (voir par famille) | `golden-creation-319`, spec E | ✅ |
| 10 | Appliquer au cours | pratique ouverte › « Appliquer au cours actif » | `groupesCours[].pratiqueId`, `groupeCoursActif.pratiqueId` ; miroir `modalitesEvaluation` (mort) | `obtenirPratiqueActiveGroupeCours` | « Pratique appliquée au cours actif — c'est elle qui calcule maintenant… » | `sentinelle-762`, spec `pratiques-762`, banc D1, spec E | ✅ — ⚠ l'indice affiché reste celui d'avant jusqu'au recalcul (D-1) |
| 11 | Changer de pratique / la retirer | même bouton sur une autre pratique / (aucun bouton pour retirer) | idem | idem | — | banc D1 | ⚠ retirer laisse un indice « constructible » (D-1) ; aucun geste d'écran ne retire (repli #710) |
| 12 | Modifier par le formulaire | Conception › Pratiques › Réglages de la pratique | noms legacy (`portfolio.methodeSelection`…), `jetons` à plat (sauf si réglés par l'assistant, #853) | oui (`configuration.*`) | — | `sentinelle-522`, `sentinelle-853` | ✅ pour STD ; ⚠ jetons SPE de l'assistant ignorés (#854) — **non exécuté ici** (porte terrain) |
| 13 | Modifier par l'assistant | pratique › « Modifier » → `ouvrirWizardV2(true, id)` | ré-écriture complète depuis les réponses relues | idem | — | `roundtrip-317`, banc A1-A4, B2 | STD ✅ · DEN ✅ · SOM ⚠ (valeurs de règles → défauts) · SPE ⛔ (seuil → 100, jetons perdus) · modèle STD ⛔ (portfolio effacé) |
| 14 | Lire la note au profil | Suivi › élève › « Note provisoire de session » | `portfoliosEleves` (au rendu, #714) ; `indicesCP` | `calculerDetailsNoteFinale` (STD seul) ; `calculerPerformance` (autres) | STD : la construction (« Portfolio (4 plus récents sur 5 évalués) », ×60 %, ×40 %) ; SOM/SPE : « pas encore branché » ; DEN : section « Jugement » | spec E, Chrome (capture) | ✅ STD · ⚠ SOM/SPE : la note ne se lit qu'à l'export et au tableau de bord |
| 15 | Exporter les résultats | Résultats finaux › « Exporter la synthèse CSV » | un fichier `resultats-finaux-synthese-<cours>-<date>.csv` | `simulerIndices` (toutes familles) | colonne « Statut » : `final` / `non constructible` ; « Non comptées » | spec E (fichier lu) | ✅ STD/DEN/SOM · ⛔ SPE de l'assistant : « 0, final » (A-3) · ⚠ arrondi (#723) |

## SOM — Sommative

| # | Geste | Écran | L'app écrit | Le moteur lit | L'app dit | Test | Verdict |
|---|---|---|---|---|---|---|---|
| 2 | « Moyenne pondérée » | `calcul-note-finale` = `moyenne` | `type 'sommative'`, `calcul_note {moyenne_ponderee}` | `calcul_note.methode` → `PratiqueSommative` | « Ta note finale est calculée par une moyenne pondérée des évaluations » | `golden-creation-319`, banc A1 | ✅ |
| 3 | Règles spéciales (remplacement, double verrou, portfolio, plafonnement) | `regles-sommative` (cases) puis `config-sommative-regles` (valeurs) | `configuration.remplacement`, `configuration.conditions_speciales[]`, `configuration.portfolio{nbArtefacts, qualitatif}` | **rien** (le moteur lit `calcul_note.conditions_speciales`) | « Une évaluation spécifique doit être réussie pour passer le cours » ; Comparateur « Actif (une évaluation doit être réussie) » | banc A1 (0 test avant) | ⛔ **la règle n'est jamais appliquée** (A-1) ; les valeurs reviennent aux défauts à la réédition (A-2) |
| 4 | Nombre d'évaluations, seuils personnels | `nb-evaluations`, `seuils-personnels` | `nbEvaluationsPrevues`, `seuils {va_bien, difficulte, grande_difficulte}` | `seuils` (interprétation) | « Seuils : Bien ≥80 % … » | banc A1 | ✅ |
| 5 | Reprises | `champsReprises` (select) | `configuration.reprises {permises, mode}` | **rien** (les jetons lisent `configuration.jetons`) | « Reprises : Limitées (configurer après) » | `golden-creation-319` (G4 rouge) | ⚠ écrit, jamais lu — les reprises SOM sont celles des jetons par défaut de l'app |
| 6 | Affichage (rang, moyenne du groupe) | `config-sommative` | `configuration.afficherRang`, `afficherMoyenneGroupe` | **rien** | « Afficher la moyenne du groupe : Oui » | — | ⚠ décoratif |
| 14 | Note | profil | — | moyenne pondérée, `ponderation || 1` | « pas encore branché » | spec E | ⚠ à dire : une production à pondération 0 pèse 1 (D-3, #483) |

## STD — Standards

| # | Geste | Écran | L'app écrit | Le moteur lit | L'app dit | Test | Verdict |
|---|---|---|---|---|---|---|---|
| 2 | « Niveaux de maîtrise » | `calcul-note-finale` = `niveaux` | `type 'standards'`, `calcul_note {conversion_niveaux}`, `variante 'n-meilleurs'` (figé) | `calcul_note.methode` ; chemin riche `calculerDetailsNoteFinale` | badge « Variante : Par artefacts (N meilleurs) » | banc A2, spec E | ⚠ le libellé « N meilleurs » est figé quelle que soit la méthode (C-1) |
| 3 | Approche | `approche-evaluation` = `par-artefacts` (seule) | `configuration.approcheEvaluation` | condition d'écriture du portfolio à la réédition | « PAN-Standards s'appuie sur le portfolio » | `roundtrip-317` | ✅ — ⛔ absent d'un modèle adopté → portfolio effacé à la réédition (B-2) |
| 5 | Portfolio : soumis / méthode / retenus / minimum / reprises | `config-portfolio` | `configuration.portfolio {nombreTotal, methodeSelection ('meilleurs'\|'tous'\|'derniers'), nombreARetenir, minimumCompletion, reprisesPermises, hybride}`, `varianteCalcul` | `portfolio.methodeSelection` (`derniers`→`recents`), `nombreARetenir`, `minimumCompletion`, `reglesConformite` (jamais écrit), `notesFinales` (formulaire seul) | « Construction de la note : N derniers artefacts » ; « Artefacts retenus : 4 » | banc A2 ; `sentinelle-816` (le moteur) ; **aucun test sur la méthode écrite** (G1, G6 : 0 rouge) | ✅ le nombre ; ⚠ « tous » coupe à N (#715) ; ⚠ `hybride`, `reprisesPermises`, `varianteCalcul` sans lecteur |
| 6 | Échelle, repères, grille | `echelle-performance`, `grille-criteres` | `configuration.echelleId`, `grilleId` ; repères sur l'échelle (#577) | `echelleId` → `echelle` (repli IDME codé en dur si introuvable, #590) | « Échelle : IDME banc · Grille : Grille banc » | `sentinelle-577`, `validation-echelle` | ✅ — l'échelle est **obligatoire** (création bloquée sans elle) |
| 14 | Note | profil « Note provisoire de session » | `portfoliosEleves` au rendu | N artefacts (méthode) × 60 % + terminale × 40 % (pondérations des productions) ; reprise = **dernier essai** non remplacé | « Portfolio (4 plus récents artefacts sur 5 évalués) · 71,5 % ×60 % · Analyse finale 82,0 % ×40 % · 75,7 % » | spec E, Chrome (capture) | ✅ — à dire : « reprise » = récence, pas meilleure tentative (skill §2 bis) |

## SPE — Spécifications

| # | Geste | Écran | L'app écrit | Le moteur lit | L'app dit | Test | Verdict |
|---|---|---|---|---|---|---|---|
| 2 | « Acceptable / non acceptable avec forfaits » | `calcul-note-finale` = `acceptable` | `type 'specifications'`, `calcul_note {specifications}` | délégation `PratiquePanSpecifications` **si** `typesTravaux` et (`tableBundles` ou `forfaits`) | « La note finale dépend du nombre de spécifications réussies (forfaits) » | banc A3 | ⛔ l'assistant n'écrit ni types ni forfaits |
| 5 | Seuil d'acceptabilité | `config-specifications` | `configuration.seuilAcceptabilite` | oui (`seuilAcceptabilite` ou `seuilAcceptable`) | « Seuil d'acceptabilité : 70 % » | banc A3 (G3 : 0 rouge) | ✅ écrit ; ⛔ 70 → 100 à la réédition (A-4) |
| 6 | Jetons (délai, durée, délai sur reprise, reprises) | `config-jetons` | `configuration.jetons {activer, delai{nombre, dureeJours, surReprise}, reprise{nombre}}` | `obtenirConfigJetonsPratique` (priorité 1) | « Jetons délai : 4 (5 jours) · Jetons reprise : 3 » | `sentinelle-853`, `jetons-derivation-L2c` | ✅ écrit et lu ; ⛔ perdus à la réédition (#854 b) ; le formulaire ne peut plus les modifier (#854) |
| 7 | Modèle de forfaits | `choix-modele-bundles` | `configuration.modeleBundle` | **rien** (une phrase du Comparateur) | « Forfaits progressifs / unique / flexibles / personnalisé » | — | ⚠ décoratif : aucun forfait n'en découle |
| 12 | **Types de travaux et forfaits** | **formulaire de gestion seulement** (tables « Types de travaux », « Forfaits ») | `configuration.typesTravaux[]`, `configuration.forfaits[]` (traduits en `tableBundles` à la lecture, #708) | oui | récap de l'assistant : « Grille : À configurer plus tard » (sans dire où) | `sentinelle-708`, `sentinelle-522` ; **non exécuté ici** | ⚠ **porte terrain** : créer par l'assistant, puis compléter au formulaire, puis lire l'export |
| 14-15 | Note | profil « pas encore branché » ; export | cache `indicesCP {P:0, noteConstructible:false}` | `_lireIndiceStocke` (relit 0 comme une note) | export « 0, final » | banc A3 (après une passe), spec E | ⛔ (A-3) ; avec forfaits, un élève sans forfait atteint reçoit **50** si aucun palier plancher (B-3, #713) |

## DEN — Dénotation

| # | Geste | Écran | L'app écrit | Le moteur lit | L'app dit | Test | Verdict |
|---|---|---|---|---|---|---|---|
| 2 | Voie rapide « Je sais déjà ce que je veux » → « PAN – Dénotation » | lien `wizardV2VoieRapide` puis `voie-rapide` = `jugement` | `type 'denotation'`, `calcul_note {jugement_global}` | court-circuit en tête de `calculerPerformance` | « Note finale certificative posée (non calculée)… abandonne la fonction de tri » | `wizard-denotation-319`, `DEN3`, spec E | ✅ — le labo doit dire que DEN n'est PAS dans les cartes de la question 1, mais dans la voie rapide ; ⚠ le guide dit encore « pas encore activable » (C-2) |
| 3 | Cibles (une par ligne), suggestion, échelle et grille de rétroaction | `config-denotation` | `configuration.objectifs [{id:'cible-N', nom}]`, `suggestion.methode`, `echelleId`, `grilleId` (optionnels) | `objectifs` (garde par cible), `suggestion` (helper) ; échelle/grille **hors calcul** | « Cibles d'apprentissage : 2 · Échelle (rétroaction) : IDME banc » | banc A4, `denotation-materiel-343` (G7 : 0 rouge sur les ids) | ✅ — ⚠ retirer une cible décale les ids des jugements déjà saisis (#717) |
| 14 | Saisir le jugement | profil › section « Jugement » : cibles atteintes, note, justification | `jugementsDenotation[pratiqueId][da]` | lecture seule au calcul ; une cible non confirmée → 59 | « la garde « cibles atteintes » conditionne la certification ≥ 60 » | `denotation-saisie-DEN2` (non rejouée ici) | ✅ (couvert ailleurs) — porte terrain : la saisie à l'écran |
| 15 | Export | « Exporter la synthèse CSV » | — | `simulerIndices` → le jugement | « 78, final » ; sans saisie : « non constructible » | spec E, banc A4 | ✅ — non simulable au Comparateur (colonne « jugement ») |

## Portes terrain qui découlent du tableau (à Grégoire, skill `portes-terrain`)

1. SPE : créer par l'assistant, compléter types et forfaits au formulaire, évaluer, lire l'export — le chemin complet SPE n'a été joué par personne.
2. Modifier une pratique STD par le formulaire (carte Portfolio) puis relire l'assistant : la méthode écrite legacy est-elle relue ?
3. DEN : la saisie du jugement à l'écran, puis l'export (DEN2 couvre la saisie, pas l'enchaînement).
4. iPad/Safari : l'assistant (10 étapes) et le profil STD.
