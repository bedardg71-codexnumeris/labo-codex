# Demande de relecture – #1007, lot 2a-2 : le codex proposé sur les gestes qui restent

> Écrite par Claude Code le 3 octobre 2026 vers 11 h 10 (Toronto, mesurée par `date`), sur la consigne de Cowork de 10 h 36 (`plans de travail/CONSIGNE-DU-JOUR.md`).
> Branche locale `claude/1007-propose-codex-2`, commit `719c9544`, partie de `main` à `6877d08c`. **Ni push du code, ni release.** Version : 1.176.0, inchangée.
> Ce chemin précède l'effacement des données de l'usager : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce qui se passe désormais** : la même fenêtre qu'en 1.176.0 (« Mettre ton codex à jour avant de supprimer ? ») paraît aussi quand tu fusionnes des copies, retires des pages d'une copie, supprimes une copie importée, appliques un jeton de reprise qui efface l'originale (ou retires ce jeton), choisis « Remplacer l'existante », réinitialises une séance déjà saisie, cliques « Effacer tout » sur une page annotée, retires un·e élève du registre longitudinal ou supprimes les résultats du bilan réflexif. Seulement si quelque chose sera vraiment effacé, et seulement si ton codex n'est pas à jour.
- **Ce qui t'attend** : la relecture de Cowork, puis dix premières phrases (§ 3, une par geste) et la ligne des Nouvelles (§ 6).
- **Ce que j'ai supposé** : les huit gestes de la consigne sont branchés, sans coupe. Les suppositions de placement sont au § 7.

## 1 · Remesure, avant d'ouvrir

Faite sur `6877d08c`, en relisant chaque fonction avant de brancher. Aucun geste disparu. Les numéros sont ceux de l'inventaire et de la demande de 2a-1.

| Geste | Porte | Ce qu'elle demandait | Branchement |
|---|---|---|---|
| P11 fusion | `travauxUI.sauvegarderEdition` (`js/travaux-ui.js`) | aucune question ; les copies absorbées effacées sans corbeille à « Enregistrer » | à « Enregistrer », si la fusion absorbe au moins une copie |
| P10 pages | la même | aucune question ; les pages retirées partent à « Enregistrer » | à « Enregistrer », si une page a été retirée (témoin neuf `editionPageRetiree`, remis à faux partout où l'état de l'éditeur l'est) |
| Copie importée | `supprimerFichierImporte` (`js/travaux-ui.js`) | deux `confirm` (avec ou sans évaluation liée) | avant la question |
| P12 | `appliquerJetonReprise` (`js/evaluation-jetons.js`), **devenue async** | selon la porte (voir le tableau des appelants) | dans la fonction, **après ses gardes**, seulement si l'originale est supprimée |
| P13 | `retirerJetonReprise`, **devenue async** | deux `confirm` (sur l'originale, sur la reprise) | avant chacun, seulement si une reprise part |
| P21 | `verifierEtGererDoublon` (`js/modal-doublon.js`), cinq appelants | la modale de doublon | après « Remplacer l'existante », avant le remplacement |
| P5 | `reinitialiserSaisie` (`js/saisie-presences.js`) | `confirmerAction`, seulement si la séance est en base | dans ce même bloc, avant la question |
| P14 | `travauxAnnotation.effacerPage`, **devenue async** | aucune | au clic, seulement si la page porte une annotation |
| P6 | `retirerEleveLongitudinal` (`js/registre-longitudinal.js`) | le dispatcher (`data-confirm`) | la question passe dans la fonction (attribut `data-question`), la fenêtre avant elle |
| P16 | `BilanReflexif.supprimerResultats` (`js/bilan-reflexif-rapport.js`), **devenue async** | le dispatcher (`data-confirm`) | même chose ; `data-confirm` retiré du bouton |

**Les appelants des jetons** (grep, tous mis à jour ; la sentinelle verrouille qu'aucun appel dans `js/` n'oublie l'`await`) :

| Appelant | Lit le résultat ? | Changement |
|---|---|---|
| `gererChangementCheckboxJetonReprise` (la case, `js/evaluation-sauvegarde.js`) | oui, les deux | devenue async, `await` ; la case se décoche sur `null`/`false` comme avant |
| `retirerJetonDepuisSidebar` (même fichier) | non | devenue async, `await` |
| `appliquerJetonRepriseSurCopie` (propriétés du fichier, `js/liste-evaluations.js`) et son appelant | oui | devenue async ; l'appelant (déjà async) attend |
| la modale de doublon à l'import (`js/travaux-ui.js`) | oui | `await` ; sur « Annuler » devant le codex, le message « Jeton non appliqué (maximum atteint) » n'est pas posé (il mentirait) |
| `appliquerJetonsReprisePostImport` (après l'import) | oui | `await` ; **un seul codex proposé pour le lot** (après le premier jeton accordé, les suivants ne redemandent pas) ; « Annuler » arrête les jetons du lot |
| `appliquerJetonRepriseDepuisBanque` (`js/evaluation.js`) | oui | devenue async, `await` (elle archive : jamais de fenêtre, mais elle aurait lu une promesse comme un succès) |

Le compte : dix appels neufs à `Codex.proposerAvantSuppression` (P10 et P11 en partagent un ; P13 en a deux), 46 en tout dans `js/`. Une clé inconnue ne supprime toujours rien.

**Une différence d'écriture avec 2a-1 :** chaque appel neuf porte la garde `typeof Codex !== 'undefined' &&`, comme les 36 de 2a-1 (la sentinelle accepte les deux formes). Sans elle, les harnais Vitest qui chargent ces modules sans `codex.js` levaient.

## 2 · Ce qui s'écrit après l'attente (la leçon du verdict)

| Porte | Disposition |
|---|---|
| P10, P11 `sauvegarderEdition` | **relu après l'attente** : la fenêtre vient en tête ; le fichier, les pages et les copies à effacer sont lus après ; l'éditeur fermé entre-temps : rien |
| Copie importée | relit : les évaluations sont lues au moment d'écrire (déjà) ; la copie est effacée par son id. L'évaluation liée est **résolue avant** (elle sert à la question) : son id est celui qu'on efface |
| P12 `appliquerJetonReprise` | **relu après l'attente** : la fonction repart du début (`codexPropose: true`) ; tout est relu et les gardes revérifiées, sans redemander |
| P13 `retirerJetonReprise` (×2) | **relu après l'attente**, de la même façon |
| P21 `verifierEtGererDoublon` | relit : les cinq appelants retirent l'homonyme au moment d'écrire (dans la file, ou par ids rejoués sur la collection de l'instant, productions) |
| P5 `reinitialiserSaisie` | **relu après l'attente** : la date affichée ; une autre séance affichée entre-temps, rien n'est réinitialisé. Les champs sont lus au moment d'écrire |
| P14 `effacerPage` | **relu après l'attente** : la page est relue (`_viderPageCourante`) ; fichier ou page changés : rien |
| P6 `retirerEleveLongitudinal` | relit (`retirerDuRegistre` lit le registre au moment d'écrire) |
| P16 `supprimerResultats` | n'écrit rien de lu : la clé est retirée |

**Les écritures différées.** P5 : ce qui attendait part **avant** la question (`viderEnregistrementPresences`, existant) ; pendant l'attente, une sauvegarde ne s'arme que si l'usager tape, et la réinitialisation lit les champs après. P14 : une sauvegarde planifiée pendant l'attente écrit l'état courant de l'annotation, que `_viderPageCourante` relit ensuite ; elle planifie sa propre sauvegarde. La fusion : aucune écriture différée ; l'état de l'éditeur est en mémoire, le PDF est réassemblé après l'attente.

## 3 · Les premières phrases (à Grégoire)

Seconde phrase inchangée : « Ton codex à jour pourra te **la / le / les** rendre, jusqu'à ta mise à jour suivante. » Toutes dans `PROPOSITIONS_AVANT_SUPPRESSION` (`js/codex.js`).

| Geste | Première phrase proposée | Pronom |
|---|---|---|
| Fusion (P11) | Fusionner ces copies efface pour de bon celles qui sont absorbées. | les |
| Pages retirées (P10) | Retirer ces pages les efface pour de bon. | les |
| Copie importée | Supprimer cette copie l'efface pour de bon. *(celle de G1, acceptée)* | la |
| Jeton de reprise, originale supprimée (P12) | Appliquer ce jeton de reprise efface pour de bon l'évaluation originale. | la |
| Retrait du jeton (P13) | Retirer ce jeton de reprise efface pour de bon la reprise. | la |
| « Remplacer l'existante » (P21) | Remplacer l'existante l'efface pour de bon. | la |
| Séance (P5) | Réinitialiser cette séance efface pour de bon ses présences. | les |
| « Effacer tout » (P14) | Effacer tout efface pour de bon les annotations de cette page. | les |
| Registre longitudinal (P6) | Retirer cet·te étudiant·e du registre efface pour de bon ses dossiers. | les |
| Bilan réflexif (P16) | Supprimer ces résultats les efface pour de bon. | les |

**Rendu à Grégoire, sans trancher.** La copie importée efface aussi son évaluation quand il y en a une ; la question qui suit le dit déjà. « Remplacer l'existante » vaut pour quatre familles et cinq appelants (grille, échelle, cartouche deux fois, production) : la phrase reprend le mot du bouton plutôt que de nommer la famille. « Effacer tout » se défait aussi par le retour arrière de l'annotation, tant que la copie est ouverte.

## 4 · La preuve

- **Sentinelle** `tests/unit/sentinelle-1007-propose-codex.test.js`, 62 essais (dont 17 neufs) :
  - les dix appels au registre, sa forme de ligne, le compte des appels dans `js/` ;
  - la relecture de P5 ;
  - les conditions « rien à effacer, aucune fenêtre » (fusion et pages, P12 après ses gardes, P5, P14, P13) ;
  - chaque appel des jetons attendu ;
  - P21 rend `null`, lu par les cinq appelants ;
  - P6 et P16 sans `data-confirm`.
- **Huit mutations, huit rouges, chacune par l'essai attendu** : relance de P12 retirée ; fusion jamais proposée ; appel de P6 retiré (deux rouges, l'appel et le compte) ; page retirée non notée ; `await` retiré à la Banque ; relecture de P5 retirée ; P14 qui propose sans annotation ; P21 dont « Annuler » laisse remplacer. Cette dernière est restée verte au premier passage : la forme de ligne acceptait tout `return`. L'essai propre à P21 a été ajouté, puis la mutation est devenue rouge. Restauration par copie, contrôlée par empreinte.
- **Banc WebKit** neuf, `tests/integration/1007-propose-codex-2a2.spec.js`, deux essais, verts deux fois :
  - *fusion* : l'éditeur sans rien retirer enregistre sans fenêtre ; la fusion de deux copies montre la fenêtre mot pour mot, avec le focus sur « Annuler ». « Annuler » ne fait rien (aucune copie effacée, rien d'écrit) ; « Supprimer sans codex » efface la copie absorbée.
  - *jeton* : la pratique « archiver » n'affiche aucune fenêtre ; « supprimer l'originale » affiche la fenêtre, et « Annuler » ne crée ni n'efface rien ; « Supprimer sans codex » efface l'originale ; une évaluation écrite pendant que la fenêtre attend survit.
- **P6 sur le vrai bouton**, au banc du registre (`registre-longitudinal-915.spec.js`, R4) : le clic montre la fenêtre ; « Annuler » ne pose aucune question et ne change rien ; « Supprimer sans codex » pose la question d'avant, mot pour mot (les assertions de R4 sont inchangées), et le refus ne change rien.
- **Trois mutations WebKit, trois rouges** : relance de P12 retirée (« EVAL_CONC_1 perdue », l'assertion attendue) ; fusion jamais proposée ; appel de P6 retiré.
- **Bancs voisins** (grep) :
  - `travaux-lecture-brute-autres-cours` et `presences-lot-d-enregistrement` rougissaient parce que la fenêtre attendait une réponse. Ils jugent autre chose : ils reçoivent la doublure « codex à jour », commentée.
  - Six harnais Vitest des jetons, du registre et de l'audit de notation passent à `await`. Le test du libellé de « Retirer du registre » lit `data-question`, et vérifie que `data-confirm` est absent. R6 lit les deux attributs, pour que la garde d'anonymisation ne devienne pas vacante.
  - Après correction : 25 essais WebKit verts (le lot, les voisins et le banc de 2a-1).
- **Vitest complet** : 7 999 sur 7 999 (674 fichiers), aucune erreur hors essai. **Pas de verdict Playwright complet** (consigne) : il viendra avec la release.

## 5 · Trouvé en chemin

| Constat | Disposition |
|---|---|
| Les runs planifiés de GitHub sont tous `cancelled` côté WebKit depuis au moins le 26 sept. (audit d'ouverture) ; seuls les verdicts locaux jugent le navigateur | **refusé (motif)** : aucun symptôme vécu, règle du 24 août ; rendu à Grégoire et Cowork pour décision |
| Au banc, remplacer `window.obtenirConfigJetons` ne change pas ce que lit `appliquerJetonReprise` sous WebKit (mesuré par une sonde jetable) | issue 3 : le banc passe la pratique en argument, comme la Banque |
| `retirerResultatLongitudinal` et la suppression d'un dossier | hors périmètre, comme la consigne le dit |

## 6 · Proposition pour les Nouvelles (à accepter par Grégoire)

> La proposition de mettre ton codex à jour avant d'effacer s'étend à la fusion de copies, aux pages retirées d'une copie, aux jetons de reprise, au remplacement d'un élément du même nom, à la réinitialisation d'une séance, à « Effacer tout » sur une page annotée, au registre longitudinal et aux résultats du bilan réflexif.

Release proposée : **minor** (un comportement neuf sur dix gestes).

## 7 · Ce que j'ai supposé

- **P12 : la fenêtre vit dans `appliquerJetonReprise`, pas aux quatre portes.** Elle vient après les gardes de la fonction (jetons épuisés, maximum atteint, évaluation déjà remplacée), pour qu'un refus ne propose rien. À la case, elle vient donc **après** la question « Appliquer un jeton de reprise créera… », pas avant. Une fenêtre placée avant cette question aurait proposé un codex pour des jetons que la garde refuse ensuite.
- **L'import en lot ne propose qu'une fois.** Sinon, une fenêtre par élève : après chaque jeton, le codex n'est plus à jour. « Annuler » arrête les jetons du lot. Les fichiers restent importés comme reprises, sans jeton, comme au refus d'une limite, et le balayage suivant les reprendra (et proposera de nouveau).
- **Doublon à l'import, puis « Annuler » :** si le balayage d'après l'import passe ensuite sur le même fichier, la fenêtre peut reparaître une fois. Je ne l'ai pas mesuré au banc.
- **P14** propose malgré le retour arrière : la consigne le demande, et ce retour arrière ne survit pas à la fermeture de la copie.
- **P6 :** l'attribut s'appelle `data-question`, pour que le dispatcher ne le lise pas. Les mots sont construits au même endroit et de la même façon.
- **Le banc n'a pas de codex actif** : il voit la fenêtre « sans codex ». Le chemin de mise à jour et le titre « à jour » sont communs à toutes les portes et jugés par le banc de 2a-1, relancé vert.
- **Pages retirées (P10) :** non éprouvé au navigateur (il faudrait un PDF de plusieurs pages, décomposé par PDF.js). C'est la même ligne que la fusion ; la sentinelle verrouille le témoin et sa remise à faux.

## 8 · Ce qui reste à Grégoire

Les dix phrases du § 3 et la ligne du § 6.
