# Textes à corriger : « Tampons d'observation », lot 3 — sur une production (25 novembre 2026)

> Tous les textes neufs du lot, en une page. **Tranchés par Grégoire le 25 nov. 2026**, après son essai sur l'iPad
> (Safari, aperçu n° 62, de 11 h 10 à 11 h 47 ; rapporté par Cowork à midi) : P1 à P4, I1, I3, A1 et A2 acceptés tels
> quels ; I2 et I4 changés. La colonne « Sort » le dit ligne par ligne. Ils vivent
> dans `MOTS` de `js/tableau-cibles.js` et de `js/profil-cibles.js` ; en changer un ne demande aucun autre geste que de
> mettre à jour l'essai qui le cite. Aucun texte existant n'est renommé. Le mot « copie » n'est employé nulle part ;
> « note », « remarque » et « marque » non plus.

## Au profil, section « Cibles »

| N° | Où | Texte | Sort |
|---|---|---|---|
| P1 | Titre de la carte neuve, sous « Les cibles » | **Sur ses productions** | **Accepté par Grégoire le 25 nov.** La carte reste en bas de la section. |
| P2 | Phrase sous ce titre | Les tampons d'observation que tu as posés sur ses productions, à la date où tu les as posés. | **Accepté par Grégoire le 25 nov.** |
| P3 | Titre de chaque production | Production : *titre de la production* | **Accepté par Grégoire le 25 nov.** (le texte déjà employé pour l'origine d'une inscription). |
| P4 | Marque d'une trace lue sous une cible, tant qu'aucune inscription n'existe pour cette production et cette cible | **pas encore inscrite** | **Accepté par Grégoire le 25 nov.** : la marque est gardée. |

Le nom lu par un lecteur d'écran pour la liste des tampons d'une trace reste celui du lot 2 (« Tampons posés »).

## Dans « Inscrire pour une production »

| N° | Où | Texte | Sort |
|---|---|---|---|
| I1 | Étiquette, dans le bloc de chaque cible, au-dessus des tampons. **Seule sur sa ligne** : ni deux-points ni noms à sa suite | **Tampons d'observation posés sur cette production** | **Accepté par Grégoire le 25 nov.** |
| I2 | Une ligne à elle, **sous les tampons**, entre eux et la phrase d'aide ; dans un bloc comme dans plusieurs | Retenus pour cette cible : *Tampon A*, *Tampon B* ; quand rien n'est retenu : Retenus pour cette cible : aucun | **Changé le 25 nov., midi.** Avant : les noms suivaient l'étiquette, sur la même ligne (« … posés sur cette production : aucun »), ce qui se lisait « aucun tampon posé » alors que deux étaient affichés dessous. |
| I3 | Phrase d'aide, quand la fenêtre offre **une seule cible** (tous retenus d'office) | Ils entrent dans l'inscription de cette cible. Touche un tampon pour le retirer de l'inscription : il reste sur la production. | **Accepté par Grégoire le 25 nov.** |
| I4 | Phrase d'aide, quand la fenêtre offre **plusieurs cibles** (aucun retenu d'office, sauf par son critère ; décision du 25 nov., 8 h 22) | Touche les tampons qui concernent cette cible : ils entrent dans son inscription et restent sur la production. **Puis, seulement dans le bloc où au moins un tampon est retenu d'office par son critère :** Un tampon qui porte un critère de cette cible est déjà retenu. | **Changé le 25 nov., midi : la seconde phrase est ajoutée.** Elle paraît à l'ouverture du bloc et reste tant qu'il est affiché pour cet·te étudiant·e et cette production, même si le tampon est relâché ensuite (tranché par Cowork : elle explique l'état de départ). Jamais dans une fenêtre à un seul bloc. |

## Annonces pour lecteur d'écran

| N° | Quand | Texte | Sort |
|---|---|---|---|
| A1 | Un tampon est retiré de l'inscription d'une cible | « *Tampon* » retiré de l'inscription de « *cible* ». Il reste sur la production. | **Accepté par Grégoire le 25 nov.** |
| A2 | Il est retenu (touché une première fois quand rien n'est retenu d'office, ou remis après un retrait) | « *Tampon* » retenu pour l'inscription de « *cible* ». | **Accepté par Grégoire le 25 nov.** |

A2 disait « remis dans l'inscription » : faux pour un tampon qu'on touche une première fois sous une cible, depuis la décision de 8 h 22. Un seul texte pour les deux cas.

Chaque tampon à toucher porte son nom (lu, et en infobulle) ; son état retenu ou relâché est dit par `aria-pressed`.

## Ce que je n'ai pas écrit

- Aucun texte pour l'étudiant·e : sa rétroaction n'est pas touchée.
- Aucun texte quand un·e étudiant·e n'a aucun tampon d'observation sur ses productions : la carte « Sur ses productions » n'existe pas, et rien ne s'ajoute à « Inscrire pour une production ».

## Les essais qui citent ces textes

| Texte | Essai |
|---|---|
| P1 à P4 | `tests/integration/tampons-observation-lot-3-production.spec.js` (premier groupe d'essais) ; `essai-tampons-observation-depart.spec.js` (P4, « pas encore inscrite ») |
| I1, seule sur sa ligne | lot 3 : « les tampons de la production se voient avant d'attribuer le niveau… » et « deux cibles, un tampon qui déclare un critère de l'une… » ; fichier d'essai : groupe 4 |
| I2 | lot 3 : les mêmes (un bloc, et plusieurs), « une seule cible… », « deux cibles, aucun tampon à critère… » ; l'ordre étiquette, tampons, noms, aide y est lu ; fichier d'essai : groupes 4, 6 et 7 |
| I3 | lot 3 : « une seule cible : un seul bloc, tous les tampons retenus d'office, et la phrase du retrait » |
| I4, les deux phrases | lot 3 : « deux cibles, un tampon qui déclare un critère de l'une… » (présente sous la cible A, absente sous B, et elle reste après le relâchement) ; « deux cibles, aucun tampon à critère… » (absente partout) ; « une seule cible… » et le premier essai de la fenêtre (absente à un bloc) ; fichier d'essai : groupes 4 et 6 |
| A1, A2 | lot 3 : « les tampons de la production se voient… » (A1), « deux cibles, un tampon qui déclare un critère… » (A2) |
