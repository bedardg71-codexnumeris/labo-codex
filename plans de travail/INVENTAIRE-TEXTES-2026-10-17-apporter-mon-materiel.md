# Inventaire des textes – « Apporter mon matériel » (étape 7 du plan, préparation)

> Écrit par Claude Code le samedi 17 octobre 2026, d'après la consigne du jour de Cowork (12 h 05, mandat B). **Mesuré dans le code** à `903ac85b` (`main` local, étape 5 comprise), pas recopié des demandes de relecture. Cowork en tirera la page que Grégoire corrigera.
>
> ⚠ **Ne couvre pas encore l'étape 6** (« Aller plus loin avec ta grille ») **ni 5b** (la reconnaissance d'après les douze échantillons) : rien n'en est dans le code. L'ordre décidé à 12 h 07 (6, puis 5b, puis 7) appellera un complément de cet inventaire quand ces deux lots seront commités.
>
> ✅✅ **Réponses de Grégoire portées le 17 oct. 2026, vers 15 h 40** (étape 7, Claude Code, d'après `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-7-textes.md`) : 89 lignes portent « validé G. – 17 oct., 15 h 00 » : les 86 provisoires (prov. CC, prov. Cowork) et les 3 « proto adapté » (5.14, 10.2, 17.6) ; 77 tels quels, 12 au texte neuf (les 11 textes et la règle 8.16, dans la colonne « Texte exact »). Hors lignes : le mot D1 (§ 18) et l'entrée des Nouvelles. ⚠ Le compte de la consigne (75 tels quels, 14 qui changent, dont D1 et N1) ne retombe pas exactement sur ces 89 lignes : écart de deux, que la page de Cowork départagera. Commits `e87f5ad7`, `963cc15f`, `af1fbe99`.
>
> ✅ **Complété par Claude Code le 17 oct. 2026, vers 13 h 40**, à `d75d8f09` (étapes 6 et 5b commitées) : leurs textes neufs sont au **§ 20** ; les lignes que 5b a changées sont corrigées sur place et marquées **(5b)** (8.6, 8.8, 8.15, 12.2, 15.19). Les numéros de ligne des § 1 à 19 restent ceux de `903ac85b`.

## Comment lire

- **Texte exact** : copié du code, apostrophes et espaces compris. Une partie variable est notée ‹ainsi› (‹N› un nombre, ‹nom› un nom tiré du document ou saisi). Les guillemets « » d'un texte en font partie.
- **Où** : fichier et ligne à `903ac85b` (les lignes bougeront ; l'identifiant ou la clé, quand il y en a un, ne bouge pas).
- **Source**, une de cinq :
  - **proto** – prototype validé par Grégoire le 16 oct., 14 h 13 (`PROTOTYPE-2026-10-16-apporter-mon-materiel.dc.html`), mot pour mot ;
  - **proto adapté** – texte du prototype que Claude Code a modifié (la modification est dite) ;
  - **validé G.** – validé par Grégoire (date et heure données) ;
  - **prov. CC** – provisoire, écrit par Claude Code ;
  - **prov. Cowork** – provisoire, écrit par Cowork dans une consigne (laquelle est dite).
- **(lecteur d'écran)** : texte qui ne se voit pas, mais qu'un lecteur d'écran lit (VoiceOver). Grégoire peut le corriger comme les autres.
- Les textes **du document collé** (noms de critères, cases) ne sont pas inventoriés : ce sont ceux de l'utilisateur.

## Vue d'ensemble

| § | Écran | Lignes de l'inventaire | dont provisoires (CC ou Cowork) |
|---|---|---|---|
| 1 | Hors de l'onglet (en-tête, sous-navigation) | 4 | 2 |
| 2 | Le bandeau « En construction » | 1 | 1 |
| 3 | L'accueil de l'onglet | 12 | 0 |
| 4 | Les refus au collage | 2 | 0 |
| 5 | L'assistant, autour de chaque question | 15 | 2 |
| 6 | L'aperçu de la grille (sous chaque question) | 17 | 7 |
| 7 | Étape « Sens du tableau » | 6 | 0 |
| 8 | Étape « Ce que contient ton tableau » | 16 | 15 |
| 9 | Étape « Nature des cases » | 6 | 0 |
| 10 | Étape « Plages de notes » | 11 | 4 |
| 11 | Étape « Pondération » | 7 | 1 |
| 12 | Étape « Points » (grille en points) | 7 | 7 |
| 13 | Étape « À classer » | 14 | 1 |
| 14 | Vérification | 29 | 6 |
| 15 | « Avant de créer, il reste : » (les manques) | 26 | 19 |
| 16 | Les refus à la création | 4 | 4 |
| 17 | La confirmation | 13 | 2 |
| 18 | Ailleurs : Grilles de critères, Échelles, Cartouches | 5 | 5 |
| 19 | L'exemple fictif (« Essayer avec un exemple ») | 1 | 0 |
| 20 | Étapes 6 et 5b (complément, 17 oct. après-midi) | 18 | 10 |

Compté sur les lignes des tableaux ci-dessous (une ligne peut porter deux formes, singulier et pluriel, ou plusieurs boutons ; les renvois « voir … » ne comptent pas). Le lot le plus dense en textes provisoires est l'étape « Ce que contient ton tableau » (§ 8) : aucun de ses textes n'a été relu par Grégoire.

---

## 1. Hors de l'onglet

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 1.1 | Titre de l'onglet du navigateur, toujours | Labo Codex – Soutenir l’enseignement et le suivi des apprentissages | `index.html:11` (`<title>`) | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. Cowork – supposition dite à Grégoire (verdict du lot 1, 16 oct.)) |
| 1.2 | Sous le logo, en tête de l'application, toujours | Un outil de soutien à l’enseignement et au suivi des apprentissages | `index.html:3879` | validé G. – décision du 16 oct., 14 h 42 |
| 1.3 | Bouton de la sous-navigation de Conception, en premier | Apporter mon matériel | `js/config.js:45` (zone protégée) | validé G. – cadrage, décision 1 (15 oct., 16 h 15-16 h 17) |
| 1.4 | Info-bulle de ce bouton, au survol | Colle ta grille d’évaluation (format tableau), copiée depuis Word, Pages ou un autre traitement de texte : l’application te montre ce qu’elle en a compris, et tu corriges au besoin. | `js/accompagnement-contenu-hover.js:710` (clé `nav-conception-materiel`) | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC (lot 1). ⚠ Apostrophes droites (') : les autres textes de l'onglet ont l'apostrophe typographique (’).) |

## 2. Le bandeau « En construction »

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 2.1 | En tête de l'onglet, à toutes les étapes (accueil, assistant, vérification, confirmation) | 🚧 Cet outil est en développement : il pourrait ne pas reconnaître toutes les grilles et certaines étapes manquent encore. (emoji dans un `<span aria-hidden="true">`) | `index.html:4177` (`#materiel-en-construction`) | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. Cowork – proposé et soumis à Grégoire le 17 oct. à 9 h 51 ; aucune correction consignée. Reste jusqu'à ce que Grégoire le retire.) |

## 3. L'accueil de l'onglet

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 3.1 | Titre | Apporter mon matériel | `index.html:4180` | proto |
| 3.2 | Sous le titre | Ton matériel existe déjà. Tes grilles d’évaluation sont sans doute dans Word ou dans Pages : colle-les ici, l’application en fait une grille prête à servir. Elle te pose ensuite quelques questions, et tu vérifies tout avant que quoi que ce soit soit créé. | `index.html:4181` | proto |
| 3.3 | Carte 1, titre | Copie ton tableau | `index.html:4184` | proto |
| 3.4 | Carte 1, texte | Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte), sélectionne le tableau entier, et non seulement le texte de ses cases, puis copie-le. Copié depuis un PDF, il arriverait sans ses cases, en texte désordonné. | `index.html:4184` | validé G. – 17 oct., 8 h 53 (remplace le texte du prototype) |
| 3.5 | Carte 2, titre | Colle-le ici | `index.html:4185` | proto |
| 3.6 | Carte 2, texte | L’application reconnaît les critères, les niveaux et le texte de chaque case. | `index.html:4185` | proto |
| 3.7 | Carte 3, titre | Réponds, vérifie, crée | `index.html:4186` | proto |
| 3.8 | Carte 3, texte | Seulement les questions que ton document ne règle pas, une à la fois. | `index.html:4186` | proto |
| 3.9 | Étiquette de la zone de collage | Colle ta grille ici | `index.html:4189` | proto |
| 3.10 | Dans la zone vide (texte d'exemple) | Clique ici, puis colle (⌘ V) le tableau copié dans Word ou Pages. | `index.html:4190` | proto |
| 3.11 | Boutons sous la zone | Reconnaître le texte ci-dessus · Pas de document sous la main ? · Essayer avec un exemple · Taper ma grille à la main | `index.html:4193-4196` | proto |
| 3.12 | Bas de l'accueil | Bientôt ici : tes commentaires habituels aux étudiant·es et tes consignes de travaux. | `index.html:4199` | proto |

## 4. Les refus au collage (sous la zone de collage, en rouge)

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 4.1 | Rien de lisible comme un tableau (souvent un PDF) | L’application n’a pas trouvé de tableau dans ce que tu as collé. Si ta grille vient d’un PDF, ce serait la cause : un PDF ne transmet que du texte, sans ses cases. Tu pourrais la copier depuis son fichier d’origine (Word, Pages ou un autre traitement de texte), en sélectionnant le tableau entier, ou la taper à la main. | `js/materiel-lecture.js:800` (`MESSAGE_SANS_TABLEAU`) | validé G. – 17 oct., 8 h 53 |
| 4.2 | Un tableau, mais moins d'un critère ou de deux niveaux (une grille en points n'a pas besoin de niveaux) | Le tableau collé semble incomplet : il faut au moins un critère et deux niveaux. Tu pourrais vérifier ta sélection dans le document, ou taper ta grille à la main. | `js/materiel-lecture.js:801` (`MESSAGE_INCOMPLET`) | proto |

## 5. L'assistant, autour de chaque question

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 5.1 | Barre de progression | Étape ‹N› sur ‹M› | `js/materiel.js:450` | proto |
| 5.2 | Boutons des étapes : leurs noms, numérotés « 1. », « 2. »… | Sens du tableau · Nature des cases · Plages de notes · Pondération · À classer · Vérification | `js/materiel-assistant.js:39-40` (`NOMS_ETAPES`) | proto |
| 5.3 | Idem, étape du lot 3a | Ce que contient ton tableau | idem | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3a)) |
| 5.4 | Idem, grille en points | Points | idem | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne de l'étape 5)) |
| 5.5 | La barre des étapes (lecteur d'écran) | Étapes de l’assistant | `js/materiel.js:451` | proto |
| 5.6 | Bouton de retour, à la 1re étape | ← Recommencer | `js/materiel.js:445` | proto |
| 5.7 | Bouton de retour, aux suivantes | ← Précédent | idem | proto |
| 5.8 | Bouton d'avance | Suivant → | `js/materiel.js:464` | proto |
| 5.9 | Après « Essayer avec un exemple », en tête de chaque étape | Exemple fictif, pour essayer. Tes vraies grilles se collent à l’écran d’accueil de l’onglet. | `js/materiel.js:577` | proto |
| 5.10 | Titre de l'encadré sous chaque question | Dans l’application | `js/materiel.js:286` | proto |
| 5.11 | Encadré, « Sens du tableau » | Chaque ligne de ton tableau est un critère. Ensemble, tes critères forment ce que l’application appelle une grille de critères : tu la retrouveras dans « Grilles de critères ». | `js/materiel.js:267` (`MOTS_APP.axes`) | proto |
| 5.12 | Encadré, « Nature des cases », rétroactions choisies | Ces textes, l’application les range dans une cartouche de rétroaction : un commentaire par critère et par niveau. Tu la retrouveras dans « Cartouches de rétroaction ». | `js/materiel.js:268` (`natureRetro`) | proto |
| 5.13 | Encadré, « Nature des cases », descripteurs choisis | Ces textes, l’application les appelle des descripteurs : chacun reste attaché à son critère et à son niveau, dans ta grille de critères. | `js/materiel.js:269` (`natureDescr`) | proto |
| 5.14 | Encadré, « Plages de notes » | Ces niveaux, leurs plages et leurs notes retenues, l’application les appelle une échelle de performance. Tu la retrouveras dans « Échelles de performance ». | `js/materiel.js:272` (`valeurs`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : proto adapté – la note retenue se saisit désormais ici ; le prototype disait « où tu pourras aussi fixer une note précise pour chaque niveau ») |
| 5.15 | Encadré, « Pondération » | Le poids de chaque critère, l’application l’appelle la pondération. Il fait partie de ta grille de critères. | `js/materiel.js:273` (`pond`) | proto |
| 5.16 | Encadré, « Points » et « Ce que contient ton tableau » | voir 12.6 et 8.6 | | |

## 6. L'aperçu de la grille (sous chaque question)

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 6.1 | Titre de l'aperçu (et nom de la zone pour le lecteur d'écran) | Aperçu de ta grille | `js/materiel.js:155-157`, `174-176` | proto |
| 6.2 | Légende | Repris de ton document · Complété par l’application · À remplir | `js/materiel.js:142-144`, `156` | proto |
| 6.3 | En-têtes du tableau | Critère · Pondération | `js/materiel.js:160-161` | proto |
| 6.4 | En-tête, grille en points | Critère · Points | `js/materiel.js:179-180` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne de l'étape 5)) |
| 6.5 | Un niveau sans titre | Niveau sans nom | `js/materiel.js:117` | proto |
| 6.6 | Sous le titre d'un niveau, sa plage | ‹min› à ‹max› % | `js/materiel.js:114` | proto |
| 6.7 | Un niveau sans plage | plage à remplir | `js/materiel.js:115` | proto |
| 6.8 | Sous le titre d'un niveau, son code | code ‹X› · ou, si l'application l'a complété : code ‹X› · complété · ou : code à remplir | `js/materiel.js:95-96` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 6.9 | Un critère sans nom | Critère sans nom | `js/materiel.js:135` | proto |
| 6.10 | Pondération absente | à remplir | `js/materiel.js:130` | proto |
| 6.11 | Pondération complétée | complété : parts égales | `js/materiel.js:124` | proto |
| 6.12 | Pondération après « Ramener à 100 % » | complété : ramené à 100 % | `js/materiel.js:124` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 6.13 | Points d'un critère (grille en points) | sur ‹N› · ou : à remplir | `js/materiel.js:169` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (libellé « sur », consigne de l'étape 5)) |
| 6.14 | Une case sans texte | (case vide) | `js/materiel.js:133` | proto |
| 6.15 | Sous le nom d'un critère qui en a | ‹N› sous-critère · ‹N› sous-critères (puis la liste) | `js/materiel.js:105` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 6.16 | Résumé du tableau (lecteur d'écran) | ‹N› critères, ‹N› niveaux · ou, grille en points : ‹N› critères, en points | `js/materiel.js:159`, `178` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 6.17 | Une valeur marquée (lecteur d'écran, après la valeur) | (complété par l’application) · (proposé : à vérifier) · (à remplir) | `js/materiel.js:42-44` (`LIBELLES_ETAT`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |

## 7. Étape « Sens du tableau »

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 7.1 | Titre | Dans ton document, les critères sont-ils en lignes ou en colonnes ? | `js/materiel.js:298` | proto |
| 7.2 | Texte | Regarde l’aperçu ci-dessous : chaque ligne devrait être un critère, chaque colonne un niveau. | `js/materiel.js:300` | proto |
| 7.3 | Choix 1 | **En lignes** – Un critère par ligne, un niveau par colonne. | `js/materiel.js:302` | proto |
| 7.4 | Choix 2 | **En colonnes** – Un critère par colonne, un niveau par ligne : l’application permute le tableau. | `js/materiel.js:303` | proto |
| 7.5 | Sous les choix | Proposé d’après la lecture de ton tableau : à vérifier. Si tu changes ce choix, la pondération et la valeur des niveaux seront à revoir. | `js/materiel.js:304` | proto |
| 7.6 | Le groupe de choix (lecteur d'écran) | Sens du tableau | `js/materiel.js:301` | proto |
| 7.7 | Bandeau, si le tableau a des cases fusionnées | voir 8.7 | | |

## 8. Étape « Ce que contient ton tableau » (lot 3a, étape 5)

Aucun texte de cet écran ne vient du prototype : l'étape n'y existait pas.

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 8.1 | Titre | Vérifie ce que l’application a lu dans ton tableau | `js/materiel.js:341` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC) |
| 8.2 | Texte | Voici ton tableau, tel que l’application l’a lu. Le menu au début de chaque rangée, et celui en tête de chaque colonne, disent ce qu’elle en a compris. Si elle s’est trompée, change le menu : l’aperçu plus bas se met à jour aussitôt. | `js/materiel.js:342` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC) |
| 8.3 | Tant qu'aucun menu n'a été changé | Proposé par l’application : à vérifier | `js/materiel.js:343` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3a)) |
| 8.4 | Coin du tableau, au-dessus des menus de rangée | Rangées | `js/materiel.js:347` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 8.5 | La zone du tableau (lecteur d'écran) ; son résumé | Ton tableau, tel que l’application l’a lu · ‹N› rangées, ‹N› colonnes | `js/materiel.js:344`, `346` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 8.6 | Encadré « Dans l’application » | L’application construira ta grille de critères et son échelle de performance à partir de ce que tu décris ici : les niveaux, les critères, leurs descripteurs et leurs sous-critères. Rien n’est encore créé. | `js/materiel.js:277` (`MOTS_APP.roles`) | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC (lot 3a). ⚠ Le même texte paraît pour une grille en points, qui n'a ni échelle ni descripteurs.  **(5b : pour une grille à niveaux seulement ; grille en points, voir 20.13 et 20.14)**) |
| 8.7 | Bandeau, à l'étape « Sens du tableau » (celle d'avant), si le tableau a des cases fusionnées | Ton tableau contient des cases fusionnées. L’étape « Ce que contient ton tableau » montre ce que l’application en a lu : tu pourras y corriger sa lecture. | `js/materiel.js:281` (`MOT_FUSION`) ; affiché à `299` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 8.8 | Menu de chaque rangée : les choix | Noms des niveaux · Codes des niveaux · Plages de notes · Un critère · Nom d’un critère · Suite du critère · Partie **(5b : « Partie » ajouté, prov. CC)** · À ignorer | `js/materiel-lecture.js:285-293` (`ROLES_RANGEES`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3a)) |
| 8.9 | Menu de chaque colonne : les choix | Noms des critères · Partie · Points ou pondération · Un niveau · Sous-critères · Description du critère · À ignorer | `js/materiel-lecture.js:294-306` (`ROLES_COLONNES`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (lot 3a ; « Partie » et « Points ou pondération », consigne de l'étape 5)) |
| 8.10 | Nom des menus (lecteur d'écran) | Rôle de la rangée ‹N› · Rôle de la colonne ‹N› | `js/materiel.js:348`, `350` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 8.11 | Une case fusionnée, sa case d'origine | case fusionnée | `js/materiel.js:330` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 8.12 | Les cases qu'elle couvre | (suite de la case fusionnée au-dessus) · (suite de la case fusionnée à gauche) | `js/materiel.js:327` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 8.13 | Une case sans texte | (case vide) | `js/materiel.js:329` | proto (repris de l'aperçu) |
| 8.14 | S'il y a au moins une rangée « Suite du critère » | Dans une « Suite du critère », la case de la colonne « Noms des critères » devient : | `js/materiel.js:336` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3a)) |
| 8.15 | Ses quatre choix **(5b : le 1er ajouté, proposé par défaut, prov. CC)** | selon les puces : un sous-critère par ligne à puce, la description pour les autres lignes · des sous-critères, un par ligne · la description du critère · rien à garder | `js/materiel-lecture.js:308-312` (`CHOIX_SUITE`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3a)) |
| 8.16 | Nom d'un critère sous une « Partie » (étape 5) : forme du nom fabriqué | ‹partie› – ‹critère› ; une partie écrite entièrement en capitales prend une majuscule initiale (« INTRODUCTION » → « Introduction »), une lettre seule ou un chiffre romain gardant sa capitale (« Partie A », « Partie II ») | `js/materiel-lecture.js:706` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. Cowork (consigne de l'étape 5) ; ce nom s'imprime sur le PDF des élèves s'il n'est pas corrigé) |

## 9. Étape « Nature des cases »

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 9.1 | Titre | Les cases de ton tableau décrivent-elles les niveaux, ou s’adressent-elles à l’étudiant·e ? | `js/materiel.js:363` | proto |
| 9.2 | Exemple tiré du document | Une case de ton tableau : « ‹texte de la 1re case, coupé à 160 caractères…› » | `js/materiel.js:364` | proto |
| 9.3 | Choix 1 | **Elles décrivent les niveaux** – Des descripteurs : à quoi ressemble chaque niveau, avant la tâche. Ils iront dans ta grille. | `js/materiel.js:366` | proto |
| 9.4 | Choix 2 | **Elles s’adressent à l’étudiant·e** – Des rétroactions : ce que l’étudiant·e lira après l’évaluation. Elles iront dans tes commentaires par critère et par niveau. | `js/materiel.js:367` | proto |
| 9.5 | Tant que le choix n'est pas fait | Proposé d’après le texte des cases : à vérifier. | `js/materiel.js:368` | proto |
| 9.6 | Le groupe de choix (lecteur d'écran) | Nature des cases | `js/materiel.js:365` | proto |
| 9.7 | Encadré | voir 5.12 et 5.13 | | |

## 10. Étape « Plages de notes »

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 10.1 | Titre | Quelle plage de notes correspond à chaque niveau ? | `js/materiel.js:388` | proto |
| 10.2 | Texte | Pour chaque niveau, indique de quelle note à quelle note il s’étend, en pourcentage, et la note que l’application retiendra pour une copie classée à ce niveau. | `js/materiel.js:390` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : proto adapté – ajout de « et la note que l’application retiendra pour une copie classée à ce niveau » (17 oct.)) |
| 10.3 | Étiquettes d'une carte de niveau | Niveau · De (%) · À (%) | `js/materiel.js:381-382`, `392` | proto |
| 10.4 | Étiquette du code | Code | `js/materiel.js:373` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 10.5 | Étiquette de la note retenue | Note retenue (%) | `js/materiel.js:383` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC ; le champ lui-même est une décision de Grégoire (17 oct., question fermée)) |
| 10.6 | Textes d'exemple des champs | ex. 85 · ex. 100 | `js/materiel.js:381-382` | proto |
| 10.7 | Sous un niveau sans plage | plage à remplir | `js/materiel.js:384` | proto |
| 10.8 | Avertissement, deux plages se chevauchent | Les plages « ‹A› » et « ‹B› » se chevauchent (‹x› et ‹y› %) : une même note tomberait dans deux niveaux. Il pourrait être utile de les ajuster. | `js/materiel-assistant.js:242` | proto |
| 10.9 | Avertissement, un trou entre deux plages | Il y a un trou entre « ‹A› » (jusqu’à ‹x› %) et « ‹B› » (dès ‹y› %) : certaines notes ne tomberaient dans aucun niveau. Il pourrait être utile de les ajuster. | `js/materiel-assistant.js:243` | proto |
| 10.10 | Avertissement, une note retenue hors de sa plage | La note retenue de « ‹niveau› » (‹x› %) est hors de sa plage : il pourrait être utile de la vérifier. | `js/materiel-assistant.js:255` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 10.11 | Dans 10.8-10.10, un niveau sans titre | sans nom | `js/materiel-assistant.js:238`, `255` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 10.12 | Encadré | voir 5.14 | | |

## 11. Étape « Pondération »

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 11.1 | Titre | Combien pèse chaque critère ? | `js/materiel.js:400` | proto |
| 11.2 | Texte, si l'application a mis des parts égales | Ton tableau ne donnait pas de pondération : l’application a proposé des parts égales. Ajuste-les au besoin. | `js/materiel.js:401` | proto |
| 11.3 | Texte, sinon | Indique le poids de chaque critère, en pourcentage de la note. | `js/materiel.js:402` | proto |
| 11.4 | Texte d'exemple du champ | ex. 30 | `js/materiel.js:405` | proto |
| 11.5 | Sous les champs | Pondération totale : ‹N› % | `js/materiel.js:194` | proto |
| 11.6 | Si le total n'est pas 100 | La pondération totalise ‹N› % : il pourrait être utile de l’ajuster à 100 %. | `js/materiel.js:197` | proto |
| 11.7 | Bouton à côté (si le total est plus grand que 0) | Ramener à 100 % | `js/materiel.js:198` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 2)) |
| 11.8 | Mentions | voir 6.10 à 6.12 ; encadré, voir 5.15 | | |

## 12. Étape « Points » (une grille en points, étape 5)

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 12.1 | Titre | Sur combien de points chaque critère est-il noté ? | `js/materiel.js:412` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 12.2 | Texte | Ton tableau ne donnait pas les points de chaque critère. Indique-les : un nombre entier de 0 à 100 par critère. Le total est libre. **(5b : « de 0 à 100 », au lieu de « de 1 à 100 »)** | `js/materiel.js:413` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 12.3 | Étiquette du champ, devant lui | sur | `js/materiel.js:416` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne de l'étape 5)) |
| 12.4 | Étiquette complète (lecteur d'écran) | Points de « ‹critère› », sur | `js/materiel.js:416` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 12.5 | Texte d'exemple du champ | ex. 4 | `js/materiel.js:417` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 12.6 | Encadré « Dans l’application » | Les points de chaque critère font partie de ta grille de critères : à l’évaluation, tu noteras chaque critère sur ce nombre, et la note de la copie se calculera à partir des points seuls. | `js/materiel.js:276` (`MOTS_APP.points`) | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC) |
| 12.7 | Sous les champs | Total : sur ‹N› | `js/materiel.js:214` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (forme « sur N » de Cowork)) |

## 13. Étape « À classer »

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 13.1 | Titre | Que faire de ces passages ? | `js/materiel.js:428` | proto |
| 13.2 | Texte | Ils viennent de ton document, mais ne trouvent pas leur place dans le tableau. Rien n’est retiré sans toi : range-les ou écarte-les. | `js/materiel.js:429` | proto |
| 13.3 | Boutons d'un passage | Ajouter comme critère · Écarter · (une fois fait) Annuler | `js/materiel.js:432-434` | proto |
| 13.4 | Un passage ajouté | Ajouté comme critère | `js/materiel.js:422` | proto |
| 13.5 | Un passage écarté | Écarté : ne sera pas repris dans la grille | `js/materiel.js:423` | proto |
| 13.6 | Raison : texte au-dessus du tableau (sauf la 1re ligne courte, prise pour le nom) | Texte avant le tableau | `js/materiel-lecture.js:661` | proto |
| 13.7 | Raison : texte sous le tableau | Texte après le tableau | `js/materiel-lecture.js:727` | proto |
| 13.8 | Raison : rangée irrégulière | Ligne d’une autre forme que le tableau (cases fusionnées ?) | `js/materiel-lecture.js:609` | proto |
| 13.9 | Raison : rangée sans nom | Ligne sans nom de critère | `js/materiel-lecture.js:611` | proto |
| 13.10 | Raison : rangée « Pondération… » | Ligne de pondération, à reporter sur les critères | `js/materiel-lecture.js:612` | proto |
| 13.11 | Raison : rangée « Total… » (étape 5) | Ligne de total : l’application le calcule elle-même | `js/materiel-lecture.js:614` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 13.12 | Le texte d'une rangée écartée : ses cases jointes par | · (point médian entre les cases) | `js/materiel-lecture.js:592` | proto |
| 13.13 | Rappel, à la Vérification, s'il reste un passage | Il reste un passage de ton document à classer ou à écarter. · Il reste ‹N› passages de ton document à classer ou à écarter. | `js/materiel.js:206-207` | proto |
| 13.14 | Bouton à côté | Y aller | `js/materiel.js:209` | proto |

## 14. Vérification

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 14.1 | Titre | Vérifie ta grille, puis crée-la | `js/materiel.js:532`, `549` | proto |
| 14.2 | Sous le titre | Tout reste modifiable ici. Rien n’est encore créé. | `js/materiel.js:533`, `550` | proto |
| 14.3 | Champ du nom | Nom de la grille | `js/materiel.js:512` | proto |
| 14.4 | Sous le champ | Il apparaîtra sur le document que reçoivent tes étudiant·es. | `js/materiel.js:514` | proto |
| 14.5 | Mention du nom, s'il vient de la ligne au-dessus du tableau | repris de la ligne au-dessus du tableau : à vérifier | `js/materiel.js:511` | proto |
| 14.6 | Mention du nom, s'il manque | à remplir | `js/materiel.js:510` | proto |
| 14.7 | Rappels des choix (pastilles) | Critères : en lignes · en colonnes — Les cases : décrivent les niveaux · s’adressent à l’étudiant·e | `js/materiel.js:479-482` | proto |
| 14.8 | Légende | **Comment lire le tableau :** Repris de ton document · Complété par l’application : à vérifier · À remplir | `js/materiel.js:534`, `551` | proto |
| 14.9 | En-têtes du tableau | Critère · Pondération (%) | `js/materiel.js:553` | proto |
| 14.10 | En-têtes, grille en points | Critère · Description · Points | `js/materiel.js:536` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne de l'étape 5)) |
| 14.11 | En-tête d'un niveau : étiquettes | Niveau · Code · De (%) · À (%) · Note retenue (%) | `js/materiel.js:487-488` | voir 10.3-10.5 |
| 14.12 | Champ du nom d'un critère (exemple, et nom pour le lecteur d'écran) | Nom du critère | `js/materiel.js:494-495`, `521-522` | proto |
| 14.13 | Champ de la pondération (lecteur d'écran) ; exemple | Pondération du critère · ex. 30 | `js/materiel.js:497-498` | proto |
| 14.14 | Case d'un niveau, texte d'exemple | Descripteur (facultatif) · ou : Rétroaction à l’étudiant·e (facultatif) | `js/materiel.js:504` | proto |
| 14.15 | Case d'un niveau (lecteur d'écran) | Descripteur : ‹critère›, niveau ‹niveau› · ou : Rétroaction : ‹critère›, niveau ‹niveau› | `js/materiel.js:502` | proto |
| 14.16 | Grille en points : champ de description, exemple ; nom pour le lecteur d'écran | Description (facultatif) · Description : ‹critère› | `js/materiel.js:525-526` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 14.17 | Grille en points : étiquette des points | sur (lecteur d'écran : Points du critère, sur) ; exemple : ex. 4 | `js/materiel.js:527-528` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC / « sur » de Cowork) |
| 14.18 | Nom de la zone du tableau (lecteur d'écran) | Ta grille | `js/materiel.js:535`, `552` | proto |
| 14.19 | Boutons | Ajouter un critère · Ajouter un niveau | `js/materiel.js:556-557` | proto |
| 14.20 | Quand la grille a 20 niveaux (bouton grisé) | 20 niveaux au plus. | `js/materiel.js:558` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (#1091)) |
| 14.21 | Total et avertissements | voir 11.5-11.6, 12.7, 10.8-10.10, 13.13 | | |
| 14.22 | « Ce qui sera créé » : titre | Ce qui sera créé | `js/materiel.js:235`, `251` | proto |
| 14.23 | Ligne 1 | Une grille de critères « ‹nom› » : ‹N› critères, avec leurs descripteurs. (sans descripteurs : se termine après « critères. ») | `js/materiel.js:244` | proto |
| 14.24 | Ligne 2 | Une échelle de performance : ‹N› niveaux (‹titre› · ‹titre› · …), réutilisable pour d’autres grilles. | `js/materiel.js:245` | proto |
| 14.25 | Ligne 3, rétroactions | Une cartouche de rétroaction : un commentaire par critère et par niveau, que tes étudiant·es liront après l’évaluation. | `js/materiel.js:247` | proto |
| 14.26 | Note sous la liste | Tu les retrouveras ensuite dans Grilles de critères, Échelles de performance et Cartouches de rétroaction, où tout reste modifiable. · ou : Tu les retrouveras ensuite dans Grilles de critères et dans Échelles de performance, où tout reste modifiable. | `js/materiel.js:249-250` | proto |
| 14.27 | « Ce qui sera créé », grille en points | Une grille en points « ‹nom› » (‹N› critères), sur ‹T›. | `js/materiel.js:236` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (forme de Cowork)) |
| 14.28 | Note sous la liste, grille en points | Aucune échelle n’est créée : la note se calcule par les points seuls. Tu retrouveras ta grille dans Grilles de critères, où tout reste modifiable. | `js/materiel.js:237` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 14.29 | Bouton | Créer ma grille | `js/materiel.js:541`, `561` | proto |
| 14.30 | Nom fabriqué, grille sans nom (dans 14.23 et 14.27) | sans nom | `js/materiel.js:236`, `240` | proto |

## 15. « Avant de créer, il reste : » (au clic sur « Créer ma grille », s'il manque quelque chose)

Le titre, puis une liste ; chaque élément complète la phrase du titre. Forme singulier · pluriel quand il y en a deux.

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 15.1 | Titre | Avant de créer, il reste : | `js/materiel.js:258` | proto |
| 15.2 | Nom de la grille absent | le nom de la grille | `js/materiel-assistant.js:212` | proto |
| 15.3 | Nom trop long | un nom de grille plus court (200 caractères au plus) | `js/materiel-assistant.js:213` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.4 | Nom déjà pris dans le trimestre | un autre nom de grille : « ‹nom› » existe déjà dans ce trimestre | `js/materiel-assistant.js:214` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.5 | Pas de colonne de noms | une colonne « Noms des critères », à l’étape « Ce que contient ton tableau » | `js/materiel-lecture.js:675` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 15.6 | « Suite du critère » sans critère au-dessus | un critère au-dessus de la rangée ‹N› (« Suite du critère »), à l’étape « Ce que contient ton tableau » · un critère au-dessus des rangées ‹N›, ‹N› (« Suite du critère »), à l’étape « Ce que contient ton tableau » | `js/materiel-lecture.js:724-725` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 15.7 | Niveau sans nom | le nom d’un niveau · le nom de ‹N› niveaux | `js/materiel-assistant.js:129` | proto |
| 15.8 | Plage absente ou invalide | la plage de notes d’un niveau · la plage de notes de ‹N› niveaux | `js/materiel-assistant.js:131` | proto |
| 15.9 | Note retenue absente | la note retenue d’un niveau · la note retenue de ‹N› niveaux | `js/materiel-assistant.js:133` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 15.10 | Code absent | le code d’un niveau · le code de ‹N› niveaux | `js/materiel-assistant.js:148` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 15.11 | Code invalide | un code de 1 à 4 caractères, sans « _ », pour un niveau · un code de 1 à 4 caractères, sans « _ », pour ‹N› niveaux | `js/materiel-assistant.js:150` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC (lot 3a)) |
| 15.12 | Deux codes pareils | un code différent pour chaque niveau (deux niveaux ont le même code : « ‹X› ») · … (des niveaux ont le même code : « ‹X› », « ‹Y› ») | `js/materiel-assistant.js:160-162` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 3a)) |
| 15.13 | Plus de 20 niveaux | au plus 20 niveaux (ta grille en a ‹N›) | `js/materiel-assistant.js:136` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.14 | Critère sans nom | le nom d’un critère · le nom de ‹N› critères | `js/materiel-assistant.js:168` | proto |
| 15.15 | Pondération absente | la pondération d’un critère · la pondération de ‹N› critères | `js/materiel-assistant.js:173` | proto |
| 15.16 | Pondération non entière ou hors de 0-100 | une pondération en nombre entier de 0 à 100 pour un critère · … pour ‹N› critères | `js/materiel-assistant.js:176` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 15.17 | Grille en points, aucun point | les points de chaque critère, ou des colonnes de niveaux, à l’étape « Ce que contient ton tableau » | `js/materiel-assistant.js:197` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne de l'étape 5), complété par CC (« à l’étape… »)) |
| 15.18 | Grille en points, quelques points absents | les points d’un critère · les points de ‹N› critères | `js/materiel-assistant.js:198` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.19 | Points non entiers ou hors de 0-100 **(5b : « / 0 » accepté)** | des points en nombre entier de 0 à 100 pour un critère · … pour ‹N› critères | `js/materiel-assistant.js:200` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.20 | Plus de 50 critères | au plus 50 critères (ta grille en a ‹N›) | `js/materiel-assistant.js:178` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.21 | Nom de critère trop long | des noms de critères plus courts (200 caractères au plus) | `js/materiel-assistant.js:180` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.22 | Case trop longue | des cases plus courtes (5 000 caractères au plus) | `js/materiel-assistant.js:182` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.23 | Trop de sous-critères | au plus 30 sous-critères par critère | `js/materiel-assistant.js:184` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.24 | Sous-critère trop long | des sous-critères plus courts (200 caractères au plus) | `js/materiel-assistant.js:186` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.25 | Description trop longue | des descriptions de critère plus courtes (2 000 caractères au plus) | `js/materiel-assistant.js:188` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 15.26 | Passage en attente | un passage à classer ou à écarter · ‹N› passages à classer ou à écarter | `js/materiel-assistant.js:219` | proto |

Remarque de forme : 15.3 et 15.20-15.25 sont des bornes du partage (ce qui ne voyagerait pas ne se crée pas) ; un utilisateur ne les rencontrera presque jamais.

## 16. Les refus à la création (sous « Créer ma grille », en rouge)

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 16.1 | Aucun trimestre ouvert | Aucun trimestre n’est ouvert : la grille n’a nulle part où être rangée. Ouvre ton trimestre, puis reviens la créer ; ce que tu as saisi reste ici tant que la page reste ouverte. | `js/materiel-creation.js:33` (`MESSAGES.sansTrimestre`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 16.2 | Trimestre clos | Le trimestre ouvert est clos : il se consulte sans se modifier. Ouvre un trimestre en cours, puis reviens créer ta grille. | `js/materiel-creation.js:36` (`MESSAGES.clos`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (verdict du lot 2) ; le mot « clos » est arrêté) |
| 16.3 | L'écriture a échoué, tout est défait | La création n’a pas abouti, et rien n’a été créé. Tu pourrais réessayer. | `js/materiel-creation.js:37` (`MESSAGES.echec`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 16.4 | L'écriture a échoué, un retrait aussi | La création n’a pas abouti, et l’application n’a pas pu retirer tout ce qu’elle venait d’écrire. Il pourrait rester : « ‹nom› », « ‹nom› ». | `js/materiel-creation.js:38`, `126` (`MESSAGES.echecPartiel`) | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |

## 17. La confirmation

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 17.1 | Titre | Ta grille « ‹nom› » est créée | `js/materiel.js:596`, `610` | proto |
| 17.2 | Texte, descripteurs | Elle est rangée dans tes grilles, avec ‹N› critères et leurs descripteurs. Rien d’autre n’a changé dans l’application. (sans descripteurs : sans « et leurs descripteurs ») | `js/materiel.js:592` | proto |
| 17.3 | Texte, rétroactions | Elle est rangée dans tes grilles, avec ‹N› critères ; tes rétroactions sont prêtes à servir quand tu évalueras. Rien d’autre n’a changé dans l’application. | `js/materiel.js:591` | proto |
| 17.4 | Texte, grille en points | Elle est rangée dans tes grilles, avec ‹N› critères notés en points. Rien d’autre n’a changé dans l’application. | `js/materiel.js:611` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 17.5 | Carte 1, titre | Ta grille | `js/materiel.js:598`, `613` | proto |
| 17.6 | Carte 1, texte | ‹N› critères, avec leurs descripteurs. (sans descripteurs : ‹N› critères.) | `js/materiel.js:593` | **validé G. – 17 oct., 15 h 00, tel quel** (était : proto adapté – le prototype disait « ‹N› critères, chacun avec un descripteur par niveau. ») |
| 17.7 | Carte 1, texte, grille en points | ‹N› critères, sur ‹T›. | `js/materiel.js:613` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 17.8 | Carte 1, bouton | La voir dans Grilles de critères | `js/materiel.js:598`, `613` | proto |
| 17.9 | Carte 2, titre | Ses niveaux | `js/materiel.js:599` | proto |
| 17.10 | Carte 2, texte | ‹titre› (‹min› à ‹max› %) · ‹titre› (‹min› à ‹max› %) · … | `js/materiel.js:599` ; `js/materiel-creation.js:98` | proto |
| 17.11 | Carte 2, bouton | Les voir dans Échelles de performance | `js/materiel.js:599` | proto |
| 17.12 | Carte 3 (rétroactions), titre et texte | **Tes rétroactions** – Un commentaire par critère et par niveau, que tes étudiant·es liront après l’évaluation. | `js/materiel.js:600` | proto |
| 17.13 | Carte 3, bouton | Les voir dans Cartouches de rétroaction | `js/materiel.js:600` | proto |
| 17.14 | Invitation | Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle. | `js/materiel.js:601`, `614` | proto |
| 17.15 | Bouton de l'invitation | Aller aux productions | `js/materiel.js:602`, `615` | proto |
| 17.16 | Lien du bas | Apporter autre chose | `js/materiel.js:603`, `616` | proto |

## 18. Ailleurs : ce que le chantier a ajouté dans les autres outils

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 18.1 | Grilles de critères, sous un critère qui a des descripteurs (lecture seule) | Ce qui est attendu à chaque niveau | `js/grilles.js:4450` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3b1)) |
| 18.2 | Idem, sous un critère qui a des sous-critères | Sous-critères | `js/grilles.js:4459` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. Cowork (consigne du lot 3b1)) |
| 18.3 | Idem : le nom d'un niveau dont l'échelle a disparu | ‹code du niveau› (le code seul) | `js/grilles.js:4448` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 18.4 | Échelles de performance : le nom de l'échelle créée | Échelle – ‹nom de la grille› (si pris : Échelle – ‹nom› (2), (3)…) | `js/materiel-assistant.js:398`, `377-384` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |
| 18.5 | Cartouches de rétroaction : le nom de la cartouche créée | Rétroactions – ‹nom de la grille› | `js/materiel-assistant.js:476` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (lot 2)) |

⚠ Vocabulaire, déjà signalé par Cowork pour l'étape 7 (consigne du lot 3b1) : dans Grilles de critères, le champ de la **description** d'un critère s'appelle « Descripteur » (vocabulaire du 4 sept., antérieur au chantier). Il côtoie maintenant le bloc 18.1, qui montre les vrais descripteurs, par niveau. Ce n'est pas un texte du chantier ; la question du mot est à Grégoire. **D1, validé G. – 17 oct., 15 h 00 : le champ s'appelle « Description »** (`e87f5ad7`).

## 19. L'exemple fictif (« Essayer avec un exemple »)

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 19.1 | Tout le contenu de la grille d'exemple (nom « Exposé oral : grille d’évaluation », critères Contenu, Organisation, Communication, niveaux Excellent, Satisfaisant, À améliorer, Insuffisant, douze descripteurs, et le passage « La qualité de la langue est évaluée à part, selon la politique du département. ») | voir le code | `js/materiel-lecture.js:834-843` (`exempleHtml`) | proto |

## 20. Étapes 6 et 5b (complément, mesuré à `d75d8f09`)

| # | Quand il paraît | Texte exact | Où | Source |
|---|---|---|---|---|
| 20.1 | Confirmation, sous les cartes (étape 6) : titre de l'encadré | Aller plus loin avec ta grille | `js/materiel.js`, `PLUS_LOIN.titre` | validé G. (17 oct., 12 h 07) |
| 20.2 | Idem, grille en points **sans** descripteurs | Ta grille note chaque critère en points. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en décrivant, pour un critère, ce qu’on attend à chaque niveau. | `PLUS_LOIN.enPoints` | validé G. (12 h 07) ; apostrophes typographiques (’) au lieu des droites de la consigne |
| 20.3 | Idem, grille à niveaux, cases = descripteurs | Ta grille décrit ce qu’on attend à chaque niveau. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en associant une rétroaction à chaque niveau. | `PLUS_LOIN.aNiveaux` | validé G. (12 h 07) |
| 20.4 | Idem, dans tous les cas | Un critère peut s’évaluer de trois façons : holistique (par niveaux), analytique (par points) ou algorithmique (par un calcul). | `PLUS_LOIN.commune` | validé G. (12 h 07) |
| 20.5 | Idem, le lien (ouvre l'aide existante « Type de critère d’évaluation ») | Les trois façons d’évaluer un critère | `PLUS_LOIN.lien` | validé G. (12 h 07) |
| 20.6 | Quand l'encadré n'a que 20.4 et 20.5 | grille à niveaux dont les cases étaient des rétroactions (supposition de Cowork) ; **et (5b) grille en points qui décrit déjà ses niveaux** (supposition de Claude Code) | `plusLoinHtml` | — |
| 20.7 | Menu des rangées (5b) : nouveau choix | Partie | `js/materiel-lecture.js`, `ROLES_RANGEES` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 20.8 | Choix d'une « Suite du critère » (5b), proposé par défaut | selon les puces : un sous-critère par ligne à puce, la description pour les autres lignes | `CHOIX_SUITE` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 20.9 | À classer, raison : ligne de calcul de la langue | Ligne de calcul de la langue : l’application ne la lit pas encore comme un critère | `L.RAISONS_PIED.calcul` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 20.10 | À classer, raison : ligne de pénalité | Ligne de pénalité : l’application ne la lit pas encore comme un critère | `L.RAISONS_PIED.penalite` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 20.11 | À classer, raison : « Commentaires : » seul | Espace de commentaires : il se remplit à la correction | `L.RAISONS_PIED.commentaires` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 20.12 | À classer, raison : total, note finale, « Note : », résultat (étendue en 5b) | Ligne de total : l’application le calcule elle-même | `L.RAISONS_PIED.total` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (étape 5, = 13.11)) |
| 20.13 | « Dans l’application », étape des rôles, grille en points sans niveaux | L’application construira ta grille de critères, notée en points, à partir de ce que tu indiques ici : les critères, leurs points, leurs descriptions et leurs sous-critères. Rien n’est encore créé. | `MOTS_APP.rolesPoints` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC) |
| 20.14 | Idem, grille en points à niveaux | L’application construira ta grille de critères, notée en points, à partir de ce que tu établis ici : les critères, leurs points, ce qui est attendu à chaque niveau, leurs descriptions et leurs sous-critères. Elle ne créera pas d’échelle : la note se calculera à partir des points. Rien n’est encore créé. | `MOTS_APP.rolesPointsNiveaux` | **validé G. – 17 oct., 15 h 00, texte neuf** (était : prov. CC) |
| 20.15 | Vérification d'une grille en points à niveaux : en-tête de chaque niveau ; sous un nom vide | Niveau · à remplir | `enteteVerifNiveauPoints` | proto (repris de la Vérification à niveaux) |
| 20.16 | Idem, chaque case (lecteur d'écran ; dans la case) | Descripteur : ‹critère›, niveau ‹niveau› · Descripteur (facultatif) | `rangeeVerifPoints` | proto (repris) |
| 20.17 | « Ce qui sera créé », grille en points à niveaux | Une grille en points « ‹nom› » (‹N› critères), sur ‹T›, avec ce qui est attendu à chaque niveau. | `creeListeHtml` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC) |
| 20.18 | Manques, grille en points à niveaux | le nom d’un niveau · le nom de ‹N› niveaux · un nom différent pour chaque niveau · un nom de niveau qui ne commence pas par « _ » | `js/materiel-assistant.js`, `manquantsNiveauxPoints` | **validé G. – 17 oct., 15 h 00, tel quel** (était : prov. CC (les deux premiers repris de 15)) |

⚠ Deux noms fabriqués par 5b s'impriment sur le PDF des élèves s'ils ne sont pas corrigés (règle de `CLAUDE.md`, « les mots que ses élèves liront ») : **‹partie› – ‹critère›** pour une partie en rangée (« INTRODUCTION – Sujet amené » : ~~la partie garde la casse du document~~ — **8.16, validé G. – 17 oct., 15 h 00 : « Introduction – Sujet amené »**, `963cc15f`) ; et un nom **recollé** de deux rangées (« Mise en » + « contexte » → « Mise en contexte »).

---

## Ce que l'inventaire ne couvre pas

- Les messages des journaux de la console (`console.error` de `materiel-creation.js`) et les messages de validation du partage (`partage-validation.js`, « nombre de clés > max ‹N› ») : un utilisateur ne les lit pas dans l'onglet.
- L'entrée des Nouvelles (étape 7, après la page des textes).

## Un constat fait en chemin (non corrigé : mandat sans code)

> ✅ **Réglé à l'étape 5b** (`d75d8f09`) : l'encadré dit ce qui vaut pour la grille lue (20.13, 20.14).

**8.6** : l'encadré « Dans l’application » de « Ce que contient ton tableau » parle d'« échelle de performance » et de « descripteurs » aussi pour une grille en points, qui n'en aura pas (`motApp`, `js/materiel.js:284`, ne distingue pas). Issue : *inscrire et continuer* — inscrit ici, pour l'étape 7, où Grégoire corrige ce texte de toute façon ; rien au BACKLOG.
