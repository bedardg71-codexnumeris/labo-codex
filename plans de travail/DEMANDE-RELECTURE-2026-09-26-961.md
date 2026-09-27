# Demande de relecture croisée, AVANT fusion – #961 « une rétroaction finale réécrite à la main ne suit plus les niveaux » (D7)

> Écrite le 26 septembre 2026, en soirée (Toronto), par Claude Code. Branche `lot-retroaction-ne-suit-plus-les-niveaux` (arbre principal), base `958683a7` (1.160.2). **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-961.md`. Un volet de la consigne est **arrêté** (§ 3), et un texte attend l'accord de Grégoire (§ 6).
>
> Pour lire le code : `git diff 958683a7..lot-retroaction-ne-suit-plus-les-niveaux -- js/ index.html styles.css tests/`.

## 1 · Ménage d'ouverture et remesure

- Branche locale `lot-960-retroaction-a-la-main` supprimée (`git branch -d`, fusionnée dans `main`, absente chez origin ; `958683a7` constaté dans `origin/main`). Consigne #960 archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-960.md`.
- Constat remesuré par lecture : `genererRetroaction(1)` a douze appelants. Parmi eux : `niveauSelectionne`, `pointsSaisis`, les quatre chemins du calcul algorithmique (`evaluation-calcul.js`), les cases et boutons radio d'affichage, le changement d'échelle, la bascule d'anonymisation. **La zone porte déjà un bouton « Régénérer »** (`regenererRetroactionAvecFeedback`), sous elle : je l'ai réutilisé, sans en ajouter un second.

## 2 · Le correctif

- **La marque** : `retroactionFinale1.dataset.reecritePour = "<DA>|<productionId>"`. Elle est attachée à la copie, ce qui fait qu'ouvrir une autre copie ne l'emporte pas (clé différente : la marque ne vaut plus, sans qu'aucun chemin ait à l'effacer). Deux fonctions dans `evaluation-retroaction.js` : `estRetroactionReecrite(copie?)` et `poserRetroactionReecrite(bool)`, qui montre ou cache l'avis.
- **Qui la pose** : `retroactionModifiee` (l'événement `input`, la frappe seulement). Aussi la modale « Aperçu rétroaction » de Travaux, si son texte a changé (`value !== defaultValue`). C'est un écrivain du même texte à la main, que la consigne ne nommait pas.
- **Qui l'efface** : « Régénérer » (qui arme aussi l'auto-save, comme une frappe, pour que la base suive), les deux remises à zéro du formulaire (`nouvelleEvaluation`, `reinitialiserFormulaire`), et **le changement de cartouche fait au menu** (voir plus bas).
- **La garde est UNE, dans `genererRetroaction`**, et non deux (dans `niveauSelectionne` et dans `pointsSaisis`). **Décision de ma part, à regarder.** Tous les appelants automatiques s'arrêtent devant un texte réécrit : niveau, points, calcul algorithmique (une saisie d'erreurs change aussi un niveau), cases d'affichage, échelle, bascule d'anonymisation. Motif : D7 dit « aucun texte perdu », et chacun de ces gestes l'effaçait de la même façon. Conséquence : l'avis dit « ne suit plus les niveaux » alors que la rétroaction ne suit plus non plus les cases d'affichage. La mutation « garde retirée » rougit donc les deux chemins, niveau et points, à la fois (M2).
- **Persistée** : `retroactionReecrite` (booléen, toujours écrit) par les quatre écrivains. Ce sont l'auto-save d'une évaluation existante, l'auto-save qui crée une évaluation, « Enregistrer » d'une copie neuve (`_lireChampsDOMSauv`) et « Enregistrer » d'une modification (`_lireChampsDOMMod`). L'auto-save lit la marque pour la copie de l'instantané, pas pour celle qui est à l'écran.
- **Relue à l'ouverture**, par les deux chargeurs qui posent le texte : `_chargerOptionsEtRetroactionModif` (« Modifier », qui sert à la Liste ET à la copie) et `verifierEtChargerEvaluationExistante` (seul, en série, quand on choisit l'élève au menu). La marque ne vaut que si l'évaluation a une rétroaction.
- **Neutralité de #960** : l'ouverture n'écrit toujours rien (banc `evaluation-959-neutralite-chargeur`, vert). Poser la marque ne touche pas la base.

**« Changer de cartouche » (#944), mesuré par lecture et laissé tel quel** : choisi au menu et confirmé, ou choisi sans question (copie sans commentaire enregistré, retour à la cartouche de l'évaluation), il **régénère la rétroaction**, retouches comprises. La question le dit d'ailleurs : « Les retouches faites à la main dans la rétroaction de cette copie seront perdues. » Pour que ce comportement ne change pas, le geste efface la marque (`changerAuGeste`). Sans cela, la garde centrale l'aurait bloqué. **À regarder** : la consigne dit « rien d'autre [que Régénérer] ne l'efface ». Ici, deux de ses phrases se contredisent : garder #944 tel quel oblige à effacer la marque. J'ai suivi « sans le changer dans ce lot ». « Garder les commentaires actuels » laisse la marque et le texte en place.

## 3 · Volet arrêté : le stock sans marque

La consigne : « Si la comparaison n'est pas fiable (options d'affichage, gabarits changés depuis), dis-le et arrête-toi avant de coder ce volet. » **Elle n'est pas fiable, et je me suis arrêté.** Voici ce que j'ai mesuré dans le dépôt, sans toucher au stock :

- Le texte généré dépend du **code du générateur**. Celui-ci a changé au moins six fois depuis le 11 septembre, date où la cohorte avait déjà des copies : noms IDME à la source (1.129.2), #939 (règle du commentaire, 24 sept.), #760 (tampons sur les réglages actuels), #941 S1/S2 (grille en points), #764, et D6 aujourd'hui même (`a749e717`).
- Il dépend aussi des **commentaires de cartouche**, modifiables à tout moment, et des **réglages des tampons**.
- Conséquence : une rétroaction générée le 20 septembre et jamais touchée DIFFÈRE du texte que la génération donne aujourd'hui. La comparaison la prendrait pour « réécrite ». Le sens reste sûr (rien n'est remplacé), mais l'avis dirait « Tu as réécrit » à Grégoire sur des copies qu'il n'a pas réécrites. Je ne peux pas dire dans quelle proportion : ce serait mesurer le stock.

**Ce qui vaut aujourd'hui** : sans marque, une rétroaction enregistrée suit les niveaux, comme avant D7. Pour le stock, le risque de #961 reste donc entier. **Question pour Cowork** (et pour Grégoire, s'il s'agit de ses mots) : (a) le laisser ainsi, puisque la marque s'installe à la première frappe ou au premier enregistrement ; (b) traiter tout stock sans marque comme réécrit (sûr, mais l'avis s'affiche sur toutes les copies déjà évaluées) ; (c) un autre signal que vous auriez.

## 4 · Preuves

Banc WebKit `tests/integration/evaluation-961-retroaction-ne-suit-plus-les-niveaux.spec.js` : **16 cas, verts**. Fixture du banc #960, noms fictifs.

- Par la copie ET par la Liste, niveau ET points (critère analytique) : réécrire, changer, attendre 2,5 s → l'écran et la base gardent le texte, la marque est en base, l'avis s'affiche. « Régénérer » → texte généré, avis parti. Un niveau changé ensuite → le texte suit (`CARTOUCHE c2_I`), la base a le texte généré et la marque à `false`.
- Rouverte avec la marque en base, par la copie, par la Liste et **en série** (second élève choisi au menu) : l'avis revient, un niveau changé garde le texte, le niveau s'écrit.
- Marque absente (stock) : le texte suit, aucun avis. La marque d'une copie ne vaut pas pour une autre copie.
- Cartouche changée au menu : « Remplacer » donne le texte de la nouvelle cartouche et fait partir l'avis ; « Garder » garde le texte et l'avis.
- Écrivains : « Enregistrer » par la Liste, copie neuve (auto-save), copie neuve (« Enregistrer » avant l'auto-save, les deux critères notés : à portée incomplète, il ne créait rien et la mutation survivait, mesuré), modale de Travaux (retouchée : `true` ; non retouchée : rien d'écrit).

**Mutations** (restauration par copie, empreinte vérifiée) :

| | Mutation | Résultat |
|---|---|---|
| M1 | marque non persistée (auto-save d'une évaluation existante) | rouge, 4 cas |
| M2 | garde retirée de `genererRetroaction` (niveau ET points) | rouge, 6 cas |
| M3 | « Régénérer » n'efface pas la marque | rouge, 4 cas |
| M4 | la frappe ne marque pas | rouge, 5 cas |
| M5 | ouverture en série sans marque | rouge (après ajout du cas « série » ; verte avant : la copie passe aussi par « Modifier ») |
| M6 | ouverture par « Modifier » sans marque | rouge |
| M7 | le changement de cartouche garde la marque | rouge |
| M8 | « Enregistrer » (modification) sans marque | rouge |
| M9 | « Enregistrer » (copie neuve) sans marque | rouge (après correction du cas) |
| M10 | auto-save (copie neuve) sans marque | rouge |
| M11 | modale de Travaux sans marque | rouge |

Aussi verts : Vitest (642 fichiers, 7 462 essais) et, en WebKit, les bancs voisins #959/#960 (neutralité, statut), #944, #946, #939, #760/#759, #672, #673, cartouche « Enregistrer reste ouverte », lot 3 analytique, lot A anonymisation, #911 (61 cas). Vitest avait rougi d'abord (23 essais) : dans le harnais `vm`, la zone factice n'a pas de `dataset`. Les deux fonctions le tolèrent maintenant.

## 5 · Portes terrain

- `[à vérifier]` **iPad** : l'avis tient-il dans le pied de la zone, à côté du compteur et de « Régénérer » ? Le pied passe en `flex-wrap` : sur un écran étroit, l'avis se met au-dessus.
- `[à vérifier]` **Par la Liste**, dans ce banc, la zone est repliée au moment de la frappe (sonde : non visible ; la vue côte à côte ne rend rien en `file://`). La frappe y est donc simulée par l'événement `input`, celui que reçoit la délégation. Le vrai geste au clavier par la Liste n'est éprouvé que par la copie (zone visible, même gestionnaire).
- `design-system.html` n'a pas reçu la classe `.eval-avis-retro-reecrite` (texte 0,7 rem, `--texte-secondaire`), un texte discret du même gabarit que le compteur de mots.

## 6 · À faire accepter par Grégoire

**Nouvelles** proposées par Cowork : « Évaluer : une rétroaction finale que tu as réécrite à la main n'est plus remplacée quand tu changes un niveau ; le bouton « Régénérer » la refait à la demande. » Si la garde centrale est retenue (§ 2), la phrase reste vraie, et elle vaut aussi pour les cases d'affichage.

**Case à cocher à la livraison** : #961 (BACKLOG).

---

## 7 · Complément – réponse à la relecture de Cowork (R1, R2), commit `6d1b0998`

> Ajouté le 26 septembre 2026, en soirée, par Claude Code, sur `6d1b0998` (branche inchangée). Relecture versée : `plans de travail/RELECTURE-2026-09-26-961.md`. Diff : `git diff e7bebd96..6d1b0998`. **Pas de verdict Playwright, pas de push, pas de release** : Cowork contre-vérifie avant la fusion.

**R1 · les chemins sans question gardent la marque.** `changerAuGeste` (qui efface la marque) ne sert plus qu'au remplacement CONFIRMÉ. Tous les chemins sans question passent par `cartoucheSelectionnee()` : copie pas encore enregistrée, retour à la cartouche de l'évaluation, `dejaConfirme` et copie sans commentaire enregistré. Les commentaires des critères s'appliquent, et la garde centrale garde le texte et l'avis. Deux essais WebKit : copie sans commentaire enregistré (commentaire `AUTRE c1_M` posé, texte et avis gardés), et copie neuve réécrite puis cartouche choisie.

**R2 · le stock d'avant D7 (option c de Grégoire).** La garde centrale n'a pas eu à attendre : quand une question est due, `genererRetroaction` **n'écrit rien** et la pose. C'est la réponse qui agit : « Garder » pose la marque, « Remplacer » l'efface puis régénère, et dans les deux cas elle arme l'auto-save. Il n'y a pas de seconde règle.
- **Signal** : la clé `retroactionReecrite` est absente ET la rétroaction n'est pas vide. Les chargeurs le posent (`preparerRetroactionEnregistree`, les deux mêmes sites que la marque), et toute réponse le lève (frappe, « Régénérer », cartouche confirmée, remises à zéro, la question elle-même).
- **Pendant un chargement** (`_autoSaveSuspendu` ou le compteur de #960), il n'y a ni question ni écriture. Les restaurations de niveaux du chargeur ne la déclenchent donc pas, et l'ouverture n'écrit toujours rien.
- **La question** : `confirmerAction`, variante `danger`, avec les mots de Grégoire, **sans titre** (aucun mot de plus que ceux qu'il a acceptés). Le focus est sur « Garder la mienne », Entrée suit le bouton (#945), Échap ou la fermeture valent « garder ». Si on a changé de copie entre-temps, la réponse n'agit pas.
- **Tant que la question est sans réponse, la clé reste absente en base** (`marqueRetroactionAEcrire` rend `undefined`, et les écrivains ne l'écrivent pas). Sans cela, l'auto-save du niveau changé, qui tombe 1,5 s après le geste pendant que la question est ouverte, aurait écrit `false` : la question n'aurait plus été posée à la réouverture.
- **Les écrivains qui portent la clé** : les cinq écrivains de la rétroaction l'écrivent tous désormais. Ce sont l'auto-save d'une évaluation existante, l'auto-save d'une copie neuve, « Enregistrer » d'une copie neuve, « Enregistrer » d'une modification, et la modale de Travaux (`true` si retouchée ; sinon `false` quand l'évaluation n'a pas de clé). Aucun ne manquait avant R2 sauf la modale non retouchée. La copie d'archive (`travaux-archivage.js`) reprend l'objet entier, clé comprise.
- **À regarder, mesuré** : avec la règle de Cowork, une évaluation du stock ouverte dans la modale et sauvegardée **sans retouche** reçoit `false`. Elle suit alors les niveaux sans question. Je l'ai appliquée telle quelle.
- **Ligne exacte ajoutée sous D7.** Fiche #961 : la phrase sur le stock suit la décision.

**Preuves.** Le banc `evaluation-961-…` compte maintenant **24 cas, tous verts** en WebKit. Les nouveaux cas R2, par la copie et par la Liste : « Garder la mienne » et « Remplacer ». Chacun vérifie les mots, le focus, qu'aucune question ne s'ouvre et que rien n'est écrit à l'ouverture, que rien n'est réécrit pendant la question, que la clé reste absente jusqu'à la réponse, la réponse en base, l'avis, et qu'aucune seconde question ne vient au niveau suivant. S'y ajoutent Échap, la rétroaction vide (pas de question, génération) et la clé à `false` (pas de question). Vitest : 642 fichiers, 7 462 essais verts. Bancs voisins en WebKit : 81 cas verts, dont #959/#960, #944, #946, #882, #947, #699 et #911.

| | Mutation | Résultat |
|---|---|---|
| R1m | chemin sans question (copie non enregistrée, retour, `dejaConfirme`) efface la marque | rouge (verte au premier passage : aucun cas ne couvrait ce chemin ; cas « copie neuve » ajouté) |
| R1m′ | chemin « sans commentaire enregistré » efface la marque | rouge |
| R2a | question retirée | rouge, 5 cas |
| R2b | réponse non persistée | rouge, 4 cas (verte au premier passage : l'auto-save du niveau, tombé APRÈS une réponse éclair, l'écrivait à sa place ; les cas répondent maintenant après 2,5 s) |
| R2c | question posée aussi quand la clé vaut `false` | rouge |
| R2d | modale sans clé n'écrit pas `false` | rouge |

**Preuve voisine ajustée** : dans `commentaire-critere-939-meme-regle.spec.js`, la fixture est un stock sans clé avec une rétroaction. Son geste (un niveau changé, puis « Copier tout ») posait désormais la question au lieu de régénérer : c'est R2, voulu. Le banc éprouve la règle du commentaire DANS le texte généré, donc sa fixture porte maintenant `retroactionReecrite: false` (une évaluation d'après D7). Rouge avant cet ajustement, vert après.
