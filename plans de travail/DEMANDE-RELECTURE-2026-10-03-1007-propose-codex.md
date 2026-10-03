# Demande de relecture – #1007, second lot (2a-1) : avant de supprimer, le codex proposé

> Écrite par Claude Code le 3 octobre 2026 à 7 h 50 (Toronto, mesurée par `date`), sur la consigne de Cowork de 3 h 34 (`plans de travail/CONSIGNE-DU-JOUR.md`).
> Branche locale `claude/1007-propose-codex`, commit `22de2db9`, partie de `main` à `bd810533` (la mise en place du § 0, commitée telle quelle). **Ni push du code, ni release.** Version : 1.175.0, inchangée.
> Ce chemin précède l'effacement des données de l'usager : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce qui se passe désormais** quand tu supprimes une évaluation, une production, une grille, une pratique, une copie de la corbeille, un·e élève, et une trentaine de gestes du même ordre : si ton codex est à jour, rien ne change. Sinon, avant la question habituelle, une fenêtre te propose « Mettre à jour, puis supprimer » (ou de supprimer sans mettre à jour, ou d'annuler).
- **Ce qui t'attend** : la relecture de Cowork, puis les variantes de la première phrase (§ 4, une par geste) et les mots de la fenêtre sans codex (§ 5), puis la ligne des Nouvelles (§ 7).
- **Ce que j'ai supposé** : le lot était trop gros pour une seule relecture. J'ai branché 36 portes, celles qui ne demandent qu'un appel avant leur question. Les dix gestes qui demandent un vrai travail de structure partent dans un lot 2a-2 (§ 2).

## 1 · Remesure, avant d'ouvrir

Remesurée sur `bd810533`, lecture seule, par un agent de lecture. J'ai relu moi-même chaque point d'insertion avant de brancher. Les lignes citées sont celles d'avant le lot.

| # | Porte (fonction, fichier) | Ce qu'elle demande aujourd'hui | Lot |
|---|---|---|---|
| P1 | `supprimerFicheCoursAvecGarde`, `js/cours.js` (commune au Cadre et à la bibliothèque) | refus si le cours porte des données ; `confirm` | 2a-1 |
| P2 | `supprimerEtudiantV2`, `js/trimestre-v2-etudiants.js` | `confirm` « Supprimer {nom} ? » | 2a-1 |
| P3 | `supprimerProfilEnseignantV2`, `js/trimestre-v2-enseignants.js` | `confirm` | 2a-1 |
| P4 | `supprimerHoraireV2`, `js/trimestre-v2-horaires.js` (devenue async) | `confirm` | 2a-1 |
| P5 | `reinitialiserSaisie`, `js/saisie-presences.js` | question seulement si la séance est en base ; **écriture différée** | 2a-2 |
| P6 | `retirerEleveLongitudinal`, `js/registre-longitudinal.js` | **question faite par le dispatcher** (`data-confirm`, `js/main.js:1234`, synchrone) | 2a-2 |
| P7 | `supprimerProductionActive` (`js/productions-liste.js`) **et** `supprimerProduction` (`js/productions.js`, lignes « Supprimer » des tableaux : **porte neuve**, vivante) | `confirm` | 2a-1 |
| P8 | `supprimerEvaluation`, `js/liste-evaluations.js` (devenue async) | `confirm` | 2a-1 |
| P9 | `travauxUI.proposerNettoyage`, `js/travaux-ui.js` (devenue async) | la modale « Libérer de l'espace » | 2a-1 |
| P10, P11 | `travauxUI.sauvegarderEdition`, `js/travaux-ui.js` | **aucune** ; l'effacement se fait à « Enregistrer » | 2a-2 |
| P12 | `appliquerJetonReprise`, `js/evaluation-jetons.js` (synchrone), **quatre portes** (case, propriétés du fichier, doublon à l'import, après l'import) | selon la porte : `confirm`, choix de la modale, ou rien | 2a-2 |
| P13 | `retirerJetonReprise`, `js/evaluation-jetons.js` (synchrone ; l'appelant lit le booléen) | deux `confirm` | 2a-2 |
| P14 | `travauxAnnotation.effacerPage` (sauvegarde différée) | **aucune** | 2a-2 |
| P15 | `supprimerInterventionEtRafraichir`, `js/interventions.js` (une porte pour les interventions et les rencontres ; devenue async) | `confirm` | 2a-1 |
| P16 | `BilanReflexif.supprimerResultats` | **dispatcher** (`data-confirm`), comme P6 | 2a-2 |
| P17 | `reinitialiserDemo` et `appliquerImport` (bilan réflexif ; devenues async) | `confirm` | 2a-1 |
| P18, P19 | `supprimerGrilleAvecPorteDeSortie`, `js/grilles.js` (commune aux deux, et à `supprimerGrille`) | deux branches : grille porteuse (`confirm` puis choix) ou `confirm` simple | 2a-1 |
| P20 | `supprimerGrilleDeBibliothequePartagee` | `confirm` | 2a-1 |
| P21 | `verifierEtGererDoublon`, `js/modal-doublon.js` (cinq appelants) | la modale de doublon elle-même | 2a-2 |
| P22 | `supprimerCollectionProjection`, `js/grilles.js` | `confirm` | 2a-1 |
| P23, P24 | `supprimerOuRemplacerEchelle`, `js/echelles.js` (commune) | `confirm`, ou `prompt` du successeur | 2a-1 |
| P25 | `supprimerEchelleDeBibliothequePartagee` | `confirm` | 2a-1 |
| P26, P27, P28 | `supprimerCartoucheConfirm`, `supprimerCartoucheDefinitivement`, `supprimerCartoucheDeBibliothequePartagee`, `js/cartouches.js` (aucune fonction commune) | `confirm` | 2a-1 |
| P29, P30, P31 | `supprimerPratiqueMateriel`, `supprimerPratiqueDefinitivement`, `supprimerPratiqueDeBibliothequePartagee`, `js/pratiques-gestion.js` | `confirm` | 2a-1 |
| P32 | `_jeterMaquette`, `js/comparateur-pratiques.js` | `confirmerAction` | 2a-1 |
| P33 | `ouvrirModalSuppressionRessource`, `js/donnees-v2.js` (devenue async) | la modale où l'on retape le nom ; bloquée s'il y a des dépendances | 2a-1 |
| P34, P35 | `supprimerProductionDefinitivement`, `supprimerProductionDeBibliothequePartagee`, `js/productions-bibliotheque-ui.js` | `confirmerAction` | 2a-1 |
| P36 | `tamponsBibliotheque.supprimerDeBibliotheque` | **aucune** (la fenêtre paraît au geste, seulement si le codex n'est pas à jour) | 2a-1 |
| P37 | `supprimerCarteActive` (`js/planification-carte.js`, devenue async) et `supprimerAlignementDuTrimestre` (`js/planification-bibliotheque.js`) | `confirm` / `confirmerAction` | 2a-1 |
| P38 | `supprimerAlignementDeBibliotheque` (aussi appelée par Réglages, `js/donnees-v2.js:805`) | `confirmerAction` | 2a-1 |
| G1, G2 | `supprimerFichierDefinitivement`, `viderTouteCorbeille`, `js/liste-evaluations.js` (devenues async) | la modale HTML « Supprimer définitivement ? » / « Vider la corbeille ? » | 2a-1 |
| G3 | `supprimerFichierModelisation`, `js/modelisation.js` | `confirm` | 2a-1 |
| Config. | `supprimerParametreConfig`, `js/donnees-v2.js` (devenue async) | `confirm` ; la fenêtre seulement pour `enseignants` et `modalitesEvaluation` (clé namespacée : `‹trimestre›_modalitesEvaluation`) | 2a-1 |

**Déplacé, disparu, neuf.** Aucun geste disparu. Une porte neuve vivante branchée : P7b (`supprimerProduction`). Trois portes vivantes absentes de l'inventaire, inscrites sous #1007 (§ 9). Des portes mortes, sans bouton, ne sont pas branchées (issue 3) : `supprimerEtudiant` (groupe.js), `supprimerEvaluationBanque`, `retirerJeton`, `confirmerSuppressionEvaluationSidebar` (evaluation.js), `supprimerEchelle`, `supprimerGrilleDepuisSidebar`, la modale de `pratiques.js`.

## 2 · La coupe : 2a-1 livré, 2a-2 proposé

La consigne le permettait : « si 2a est trop gros pour un seul lot relisible, propose une coupe ». La remesure compte **une cinquantaine de portes**, pas 41. **2a-1** prend les 36 où le branchement est un seul appel avant la question existante. Le lot touche 22 fichiers, et le diff de `js/` fait environ 200 lignes. Une fonction synchrone devient `async` quand il le faut, sans appelant qui lise son résultat (mesuré par grep).

**2a-2**, à faire ensuite, réunit les dix gestes qui demandent un vrai travail :
- **P6 et P16** : la question est posée par le dispatcher, qui est synchrone. Il faut soit déplacer la question dans la fonction, soit rendre le dispatcher async (un fichier central).
- **P10, P11 et P14** : il n'y a pas de question ; l'effacement se fait à « Enregistrer » ou par une sauvegarde différée. Il faut savoir *si* ce qui part est un effacement.
- **P12 et P13** : des chaînes synchrones, quatre portes pour P12, et un appelant qui lit le booléen pour P13.
- **P5** : une écriture différée, et la question n'est posée que si la séance est en base.
- **P21** : la modale de doublon, partagée par cinq familles.

Toutes les familles de la consigne sont couvertes par 2a-1 : structure, évaluation et copies, matériel, corbeille, configuration.

## 3 · Le parcours commun

Une seule fonction, `Codex.proposerAvantSuppression(geste)` (`js/codex.js`, `proposerCodexAvantSuppression`). Elle rend `true` si la suppression peut continuer. Chaque porte l'appelle juste avant sa question habituelle, sur une seule ligne : `if (… !(await Codex.proposerAvantSuppression('clé'))) return;`. Sur `false`, la porte ne fait que sortir.

1. **Codex à jour** (`actif` et sans modification depuis) : `true`, rien n'est affiché.
2. **Pas à jour** : la fenêtre du § 8, construite par `uiDialogues.demanderAction`. Elle a trois boutons ; « Annuler » est celui qui ferme et il a le focus, car aucun bouton n'est « principal ».
   - « Annuler », Échap ou un clic à côté : `false`.
   - « Supprimer sans mettre à jour » : `true`, puis la question habituelle.
   - « Mettre à jour, puis supprimer » : `_mettreAJourLeCodex(false)`, **la fonction même du menu** (avertissement des copies manquantes de 1.174.0, aperçu, écriture, « Réessayer » ou « Télécharger à la place »). Elle rend maintenant un booléen : `true` seulement si le fichier est écrit. C'est le seul changement de la fonction ; le menu ignore ce retour.
3. **Aucun codex actif** : la même fenêtre et le même chemin (sans fichier tenu, la destination est demandée). Seuls le titre et le troisième bouton changent (§ 5).
4. **Gestes sans question** : P36 (tampon), la seule porte de 2a-1 dans ce cas. La fenêtre paraît au clic, seulement si le codex n'est pas à jour. P10, P11 et P14 vont avec 2a-2.
5. **Une clé inconnue ne supprime rien** (`console.error`, `false`) : une porte mal branchée échoue du côté sûr. La sentinelle en fait une erreur de compilation de fait (§ 6).

**Lu, pas mesuré par un banc** : ce que la porte a lu avant la fenêtre reste valable après. J'ai vérifié que le chemin de mise à jour n'écrit que les clés internes du codex (`_codex_*` : état, instantané de référence). Pendant la fenêtre, modale, aucun autre geste de l'usager n'est possible.

**P33** : la fenêtre ne paraît que si la suppression n'est pas bloquée par des dépendances. Proposer un codex avant une suppression refusée serait du bruit.

## 4 · Les variantes de la première phrase (à Grégoire)

La seconde phrase est celle qui a été acceptée, avec son pronom : « Ton codex à jour pourra te **la / le / les** rendre, jusqu'à ta mise à jour suivante. » Toutes les variantes sont dans un seul registre (`PROPOSITIONS_AVANT_SUPPRESSION`, `js/codex.js`), pour qu'elles se relisent d'un coup.

| Geste | Première phrase proposée | Pronom |
|---|---|---|
| P1 fiche de cours | Supprimer cette fiche de cours l'efface pour de bon. | la |
| P2 élève | Supprimer la fiche de cet·te étudiant·e l'efface pour de bon. | la |
| P3 profil enseignant | Supprimer ce profil l'efface pour de bon. | le |
| P4 horaire | Supprimer cet horaire l'efface pour de bon. | le |
| P7, P34 production | Supprimer cette production l'efface pour de bon. | la |
| P8 évaluation | Supprimer cette évaluation l'efface pour de bon. *(acceptée)* | la |
| P9 nettoyage | Retirer ces copies les efface pour de bon. | les |
| P15 intervention / rencontre | Supprimer cette intervention (rencontre) l'efface pour de bon. | la |
| P17 questionnaire | Remplacer ce questionnaire l'efface pour de bon. | le |
| P18, P19 grille | Supprimer cette grille l'efface pour de bon. | la |
| P20 / P25 / P28 / P31 / P35 / P38 bibliothèque partagée | Supprimer cette grille (échelle, cartouche, pratique, production, carte) de la Bibliothèque l'efface pour de bon. | la |
| P22 collection | Supprimer cette collection l'efface pour de bon. | la |
| P23, P24 échelle | Supprimer cette échelle l'efface pour de bon. | la |
| P26, P27 cartouche | Supprimer cette cartouche l'efface pour de bon. | la |
| P29, P30 pratique | Supprimer cette pratique l'efface pour de bon. | la |
| P32 maquette | Jeter cette maquette l'efface pour de bon. | la |
| P33 Réglages, ressource | Supprimer cette ressource l'efface pour de bon. | la |
| P36 tampon | Supprimer ce tampon l'efface pour de bon. | le |
| P37 carte | Supprimer cette carte l'efface pour de bon. | la |
| G1 copie à la corbeille | Supprimer cette copie l'efface pour de bon. | la |
| G2 vider la corbeille | Vider la corbeille efface pour de bon ces copies. | les |
| G3 fichier de modélisation | Supprimer ce fichier l'efface pour de bon. | le |
| Paramètre (`enseignants`, `modalitesEvaluation`) | Supprimer ce paramètre l'efface pour de bon. | le |

**Rendu à Grégoire, sans trancher.** Plusieurs gestes effacent plus que ce que la phrase nomme. G1 efface aussi les évaluations de l'élève pour cette production. P19, P24 et P27 effacent la grille, l'échelle ou la cartouche du trimestre **et** sa copie de la Bibliothèque. P23 remplace l'échelle partout avant de la supprimer. La consigne interdisait tout mot neuf : la phrase dit le minimum vrai, et la question habituelle qui suit dit le reste (constat C8 de l'inventaire, hors lot). « Ressource » (P33) et « paramètre » sont génériques : un mot par type demanderait de passer le type en argument, ce qui est faisable si Grégoire le veut.

## 5 · Sans codex actif : les mots (à Grégoire)

Les mots existants ne vont pas : « Mettre ton codex à jour » parle d'un codex qui n'existe pas. Ma proposition, appliquée dans le lot :

> **Écrire un codex avant de supprimer ?**
> *(la même phrase du geste, et la même seconde phrase)*
> [Annuler] [Supprimer sans mettre à jour] [Écrire un codex, puis supprimer]

Le bouton du milieu reste, comme le demande la consigne. Le chemin du troisième est celui du menu, « Mettre à jour le codex », qui porte ce nom même sans codex actif.

## 6 · La preuve

- **Sentinelle** `tests/unit/sentinelle-1007-propose-codex.test.js` (39 essais). Pour les 36 portes d'un registre, elle vérifie quatre choses :
  - l'appel, avec sa clé, juste avant la question (rien d'autre entre les deux que des commentaires) et avant la ligne qui efface ;
  - la forme de la ligne (sur `false`, on sort) ;
  - que chaque clé existe dans le registre des mots, et que chaque clé du registre sert ;
  - que le compte des appels dans `js/` égale le registre.
  
  Elle découpe par `tranche()`, à l'accolade fermante de la fonction. **Cinq mutations, cinq rouges, chacune par l'essai attendu** : l'appel retiré (P8, et le compte), du code intercalé (P18), une clé hors du registre (P36), un appel non déclaré (le compte), et l'appelant qui efface sur `false` (configuration). Les fichiers ont été restaurés par copie et contrôlés par empreinte.
- **Banc WebKit** `tests/integration/1007-propose-codex-avant-suppression.spec.js`, deux essais, vert deux fois de suite.
  - *Évaluation (P8)*, tous les chemins : sans codex (Annuler ; « Écrire un codex, puis supprimer »), codex à jour (aucune fenêtre, la question tout de suite), pas à jour (la fenêtre mot pour mot, focus sur Annuler ; Annuler ; sans mise à jour ; mise à jour puis suppression), échec de l'écriture (« Codex non mis à jour », Fermer : rien d'effacé), abandon (aperçu refusé : rien d'effacé).
  - *Une porte par autre famille* : élève (P2), pratique (P29, par la mise à jour), paramètre `enseignants` (Annuler, puis sans mise à jour) et une clé hors liste (aucune fenêtre), corbeille (G1 : la fenêtre **avant** la modale « Supprimer définitivement ? »).
  - Le banc appelle la fonction que nomme le bouton, sans passer par le clic : supposition nommée au § 8.
  
  **Deux mutations de la fonction commune, deux rouges** : plus aucune proposition ; « Annuler » qui laisse supprimer.
- **Bancs voisins** : onze bancs passent par ces portes (grep), et je les ai lancés sous WebKit. Six essais rougissaient, tous parce que la fenêtre attendait une réponse :
  - Trois bancs jugent autre chose (orphelinage des grilles, nettoyage #892, témoin lot B). Ils reçoivent une doublure « codex à jour », commentée.
  - Le banc lot B avait en plus une course : la modale de la corbeille arrive une micro-tâche plus tard. Le banc attend désormais la promesse de l'ouverture.
  - Le témoin du premier lot, « le second lot n'est pas commencé », est réancré : une évaluation reçoit la proposition, pas le codex à part.
  
  Après correction, les quatre bancs touchés sont verts (39 essais) ; les sept autres l'étaient déjà au premier passage.
- **Vitest complet** : 7 976 sur 7 976 (674 fichiers). Les sentinelles #892 et #893 sont réancrées sur la signature devenue `async`, et la doublure du banc #522 a reçu la fonction neuve. **Pas de verdict Playwright complet**, comme le demande la consigne. **Risque nommé** : d'autres bancs de la suite peuvent supprimer par ces portes sans que mon grep les ait vus ; la suite complète de la release le dira.

## 7 · Proposition pour les Nouvelles (à accepter par Grégoire)

> Avant d'effacer une évaluation, une production, une grille, une pratique, une copie ou tout autre élément de ton matériel, l'application te propose de mettre ton codex à jour, si ce n'est pas déjà fait : il pourra te rendre ce que tu as supprimé.

Release proposée : **minor** (un comportement neuf sur 36 portes). Elle ne viendrait qu'après 2a-2, ou dès maintenant si Grégoire préfère livrer 2a-1 seul.

## 8 · Ce que j'ai supposé

- **La coupe** (§ 2) : 2a-1 maintenant, 2a-2 ensuite. Si Cowork préfère un seul lot, 2a-2 s'ajoute à cette branche.
- **L'emplacement de la fenêtre** : juste avant la question habituelle, *après* les gardes qui refusent (P1 « le cours porte des données », P18 « aucune autre grille », P23 « trimestre archivé », P33 dépendances). Une suppression refusée ne propose rien.
- **Le banc appelle la fonction-porte** (`supprimerEvaluation(id)`, etc.) au lieu de cliquer le bouton : le dispatcher ne fait que la nommer. Le premier lot cliquait de vrais boutons ; ici, 36 portes rendaient ce choix coûteux.
- **Le bouton « Mettre à jour, puis supprimer » n'est pas mis en valeur** : marquer un bouton « principal » lui donnerait le focus. Comme au premier lot, le focus va à « Annuler ».
- **Après un échec d'écriture**, la mise à jour suivante redemande où écrire, même avec un fichier tenu. C'est le comportement existant de « Mettre à jour le codex » (vu au banc), que je n'ai pas touché.

## 9 · Trouvé en chemin

| Constat | Disposition |
|---|---|
| Dix gestes de 2a demandent un travail de structure (§ 2) | **inscrit sous #1007** (2a-2) |
| `supprimerFichierImporte` (`js/travaux-ui.js:3777`) efface une copie **et** son évaluation, sans corbeille ; porte vivante absente de l'inventaire | **inscrit sous #1007** (issue 2, à classer avec 2a-2) |
| `retirerResultatLongitudinal` (`js/registre-longitudinal.js:1024`) efface sans question | **inscrit sous #1007** (issue 2) |
| La suppression d'un dossier de bibliothèque (`js/bibliotheque-ui.js:1575`) | **inscrit sous #1007** ; un classement, côté « rien » (décision § 4) |
| Portes mortes listées au § 1 | issue 3 : sans bouton, sans conséquence observable |
| Le banc #623 (Vitest) journalise « Erreur export: a.click is not a function » | identique sur `main` : préexistant, issue 3 |

## 10 · Ce qui reste à Grégoire

Les variantes du § 4, les mots du § 5 et la ligne du § 7. Puis la coupe : accepter 2a-2 comme lot suivant.

## 11 · La correction du verdict de 7 h 55 : ce qui s'écrit après l'attente

> Ajouté par Claude Code le 3 octobre 2026, vers 8 h 10, sur `6dd4d519` (branche `claude/1007-propose-codex`).

La question, porte par porte : ce qui est écrit après l'attente vient-il d'une lecture faite avant ? **Six oui, corrigées** (relecture après la question, aucun texte changé) ; trente non.

| # | Porte | Disposition |
|---|---|---|
| P1 | `supprimerFicheCoursAvecGarde` | **relu après l'attente, corrigé** : le plan est recensé de nouveau ; les mêmes refus, aux mêmes mots, valent s'il a changé (`_refuserLaSuppressionDuCours`) |
| P2 | `supprimerEtudiantV2` | relit (`modifierEtAnnoncer`) |
| P3 | `supprimerProfilEnseignantV2` | **relu après l'attente, corrigé** (`enseignants`) |
| P4 | `supprimerHoraireV2` | **relu après l'attente, corrigé** (`horaires` ; `horaireHebdo` en découle) |
| P7a | `supprimerProductionActive` | relit (`db.modifier`) |
| P7b | `supprimerProduction` | relit (`db.modifier`) |
| P8 | `supprimerEvaluation` | **relu après l'attente, corrigé** ; disparue entre-temps : « Évaluation introuvable » (le message existant) |
| P9 | `proposerNettoyage` | liste capturée exprès (#556) |
| P15 | `supprimerInterventionEtRafraichir` | relit (`supprimerIntervention` lit au moment d'écrire) |
| P17a | `reinitialiserDemo` | n'écrit rien de lu : le modèle d'origine |
| P17b | `appliquerImport` | n'écrit rien de lu en base : le texte importé |
| P18 | `supprimerGrilleAvecPorteDeSortie`, grille porteuse | relit (`deplacerCartouchesVersAutreGrille` et `_retirerGrilleDeLaListe` lisent au moment d'écrire ; seule la liste des grilles proposées vient d'avant) |
| P19 | idem, grille simple | relit (`_retirerGrilleDeLaListe`, dans la file) |
| P20 | `supprimerGrilleDeBibliothequePartagee` | relit (`retirerGrilleDeLaBibliotheque`, `db.modifier`) |
| P22 | `supprimerCollectionProjection` | relit (`collectionsProjection.supprimer`, `modifier`) |
| P23 | `supprimerOuRemplacerEchelle`, remplacée | relit (`remplacerEchellePartout`, puis `modifierEtAnnoncer` ; seuls les candidats proposés viennent d'avant) |
| P24 | idem, sans porteur | relit (`modifierEtAnnoncer`) |
| P25 | `supprimerEchelleDeBibliothequePartagee` | relit (`db.modifier`) |
| P26 | `supprimerCartoucheConfirm` | relit (`modifierEtAnnoncer`) |
| P27 | `supprimerCartoucheDefinitivement` | relit (`db.modifier`, puis la Bibliothèque par la file) |
| P28 | `supprimerCartoucheDeBibliothequePartagee` | relit (`db.modifier`) |
| P29 | `supprimerPratiqueMateriel` | relit (`modifierEtAnnoncer`) |
| P30 | `supprimerPratiqueDefinitivement` | relit (`db.modifier`) |
| P31 | `supprimerPratiqueDeBibliothequePartagee` | relit (`db.modifier`) |
| P32 | `_jeterMaquette` | relit (`PratiqueManager.supprimerPratique(id)`) |
| P33 | `ouvrirModalSuppressionRessource` | relit (la suppression part de la modale, par id) |
| P34 | `supprimerProductionDefinitivement` | relit (`db.modifier`) |
| P35 | `supprimerProductionDeBibliothequePartagee` | relit (`db.modifier`) |
| P36 | `supprimerDeBibliotheque` (tampon) | relit (`retirerDeLaBibliotheque` lit au moment d'écrire) |
| P37a | `supprimerCarteActive` | **relu après l'attente, corrigé** (l'index ; la carte active a changé : rien) |
| P37b | `supprimerAlignementDuTrimestre` | **relu après l'attente, corrigé** (l'index ; l'attente existait déjà avec `confirmerAction`) |
| P38 | `supprimerAlignementDeBibliotheque` | relit (`retirerAlignementDeLaBibliotheque`) |
| G1 | `supprimerFichierDefinitivement` | relit (au clic de la modale) |
| G2 | `viderTouteCorbeille` | liste capturée exprès (#556) ; les évaluations sont relues au clic |
| G3 | `supprimerFichierModelisation` | relit (les annotations au moment d'écrire ; la liste du module est son état vivant) |
| Config. | `supprimerParametreConfig` | n'écrit rien de lu (`null`) |

**Preuve.** L'essai WebKit neuf : une évaluation écrite pendant que la fenêtre attend survit à « Supprimer sans mettre à jour ». Mutation (relecture de `supprimerEvaluation` retirée) : rouge par l'assertion attendue, `EVAL_BANC_CONCURRENTE` perdue ; restauré par copie et empreinte. La sentinelle verrouille les six relectures (six essais ; la même mutation la rougit). Vitest 7 982 / 7 982.
