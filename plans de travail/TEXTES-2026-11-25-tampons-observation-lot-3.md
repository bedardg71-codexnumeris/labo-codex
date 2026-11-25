# Textes à corriger : « Tampons d'observation », lot 3 — sur une production (25 novembre 2026)

> Tous les textes neufs du lot, en une page. **Ce sont des propositions de Claude Code : rien n'est tranché.** Ils vivent
> dans `MOTS` de `js/tableau-cibles.js` et de `js/profil-cibles.js` ; en changer un ne demande aucun autre geste que de
> mettre à jour l'essai qui le cite. Aucun texte existant n'est renommé. Le mot « copie » n'est employé nulle part ;
> « note », « remarque » et « marque » non plus.

## Au profil, section « Cibles »

| N° | Où | Texte proposé | Question |
|---|---|---|---|
| P1 | Titre de la carte neuve, sous « Les cibles » | **Sur ses productions** | L'intitulé du rang « sous cette production ». Autres formes possibles : « Traces sur ses productions », « Tampons posés sur ses productions ». |
| P2 | Phrase sous ce titre | Les tampons d'observation que tu as posés sur ses productions, à la date où tu les as posés. | Utile, ou de trop ? |
| P3 | Titre de chaque production | Production : *titre de la production* | C'est le texte déjà employé pour l'origine d'une inscription (« Production : … »), repris tel quel. |
| P4 | Marque d'une trace lue sous une cible, tant qu'aucune inscription n'existe pour cette production et cette cible | **pas encore inscrite** | La liste s'appelle « Toutes les inscriptions » ; cette trace n'en est pas une. Sans marque, rien ne le dirait. La garder, la dire autrement, ou la retirer ? |

Le nom lu par un lecteur d'écran pour la liste des tampons d'une trace reste celui du lot 2 (« Tampons posés »).

## Dans « Inscrire pour une production »

| N° | Où | Texte proposé | Question |
|---|---|---|---|
| I1 | Étiquette, dans le bloc de chaque cible, au-dessus des niveaux | **Tampons d'observation posés sur cette production** | Ce qui annonce les tampons. |
| I2 | À droite de l'étiquette : les noms des tampons qui entreront dans l'inscription | « : *Tampon A*, *Tampon B* » ; quand tous sont retirés : « : aucun » | Les tampons sont montrés par leur image seule, comme sur « Observer » ; cette ligne dit leurs noms sans survol. |
| I3 | Phrase sous les tampons, quand la fenêtre offre **une seule cible** (tous retenus d'office) | Ils entrent dans l'inscription de cette cible. Touche un tampon pour le retirer de l'inscription : il reste sur la production. | Le geste est le même que sur « Observer » (un tampon pressé est retenu, le toucher le relâche). |
| I4 | La même phrase, quand la fenêtre offre **plusieurs cibles** (aucun retenu d'office, sauf par son critère ; décision du 25 nov., 8 h 22) | Touche les tampons qui concernent cette cible : ils entrent dans son inscription et restent sur la production. | **Proposition de Cowork**, posée telle quelle. Elle ne dit pas qu'un tampon peut être déjà retenu par son critère : la ligne I2 le montre (son nom y est), sans l'expliquer. Faut-il le dire, par exemple « Un tampon qui porte un critère de cette cible est déjà retenu. » ? |

## Annonces pour lecteur d'écran

| N° | Quand | Texte proposé |
|---|---|---|
| A1 | Un tampon est retiré de l'inscription d'une cible | « *Tampon* » retiré de l'inscription de « *cible* ». Il reste sur la production. |
| A2 | Il est retenu (touché une première fois quand rien n'est retenu d'office, ou remis après un retrait) | « *Tampon* » retenu pour l'inscription de « *cible* ». |

A2 disait « remis dans l'inscription » : faux pour un tampon qu'on touche une première fois sous une cible, depuis la décision de 8 h 22. Un seul texte pour les deux cas ; à corriger au besoin.

Chaque tampon à toucher porte son nom (lu, et en infobulle) ; son état retenu ou relâché est dit par `aria-pressed`.

## Ce que je n'ai pas écrit

- Aucun texte pour l'étudiant·e : sa rétroaction n'est pas touchée.
- Aucun texte quand un·e étudiant·e n'a aucun tampon d'observation sur ses productions : la carte « Sur ses productions » n'existe pas, et rien ne s'ajoute à « Inscrire pour une production ».
