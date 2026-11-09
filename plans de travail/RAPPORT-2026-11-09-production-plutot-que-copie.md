# Rapport, session cloud B : « production » plutôt que « copie », le relevé

Nuit du 8 au 9 nov. 2026. Branche `mesure/production-plutot-que-copie`, partie de `origin/main` (98c04bf, 1.237.2). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-production-plutot-que-copie.md` ; plan de nuit : `plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md`, session B.

## En tête

### Ce qui est fait

- Le rappel « Mets ton codex à jour » dit maintenant : « Ton codex en garde une copie complète, productions de tes étudiant·es comprises, que tu rouvres sur n'importe quel appareil. » C'est le texte que tu as validé à 12 h 48, posé mot pour mot. Aucun autre texte n'a changé à l'écran.
- Le relevé de « copie » et « copies » dans tout ce que l'utilisateur lit : 499 lignes de code. Je les ai rangées ainsi : 369 en (a), ce que l'étudiant·e remet ; 87 en (b), une sauvegarde ou un double ; 33 en (c), autre chose ; 10 écartées parce qu'elles ne s'affichent pas. Chacune des 369 lignes (a) porte une proposition, au § 4.
- La banque de types (partie 2) : mesurée, avec ma proposition en quelques lignes, au § 8. Rien n'est codé.
- Vérifié contre le code : « Structure des évaluations » est bien le titre affiché dans Conception › Pratiques (`index.html:5611`). Le texte validé de la définition « Artefact » tient donc.

### Ce qui attend Grégoire (une question par ligne, ma recommandation entre parenthèses)

1. Quand « copie » désigne en fait l'évaluation (sa note, son niveau, son verrouillage, son résultat), je propose « évaluation ». Cela touche 53 lignes, drapeau **EV**. (Oui : c'est ta règle « l'étudiant·e produit, l'enseignant·e évalue ».)
2. Quand « production » prendrait deux sens (83 lignes, drapeau **2S**) : je propose « productions remises » dans les comptes et les Archives, « de tes étudiant·es » ou « d'un·e étudiant·e » ailleurs (le glossaire et les définitions de la grille compris), et « rangées » dans la Liste. (Oui pour « productions remises » : c'est court, et ça ne peut pas désigner ta production à toi.)
3. Quand « copie » désigne le fichier déposé (Réassigner, la corbeille, réparer une page blanche), je propose « fichier ». Cela touche 31 lignes (drapeau **FI**), plus 9 à trancher (**FI?**). (Oui pour les gestes qui portent sur le fichier ; « production » partout ailleurs.)
4. Le bouton « Réunir en une copie » devient « Réunir en une production ». (Oui. L'autre choix serait « Réunir en un fichier ». La consigne du parcours 4 cite l'ancien libellé : sa bulle suivra.)
5. « Copie de référence » (Annoter › Actions) devient « Production de référence », et « Copie fictive » (l'atelier du critère algorithmique) devient « Production fictive ». (Oui.)
6. Deux textes sont imprimés sur le PDF que reçoivent tes étudiant·es (drapeau **ÉL**) : « Cette copie n'a pas de niveau général » et « Note de la copie : ». Je propose « Cette évaluation n'a pas de niveau général » et « Note de l'évaluation : ». (Oui, ou simplement « Note : ».)
7. Huit lignes reprennent des textes que tu as déjà acceptés (drapeau **VA**) : les avertissements du codex (#1012, 2 oct.) et deux phrases des Archives (4 oct.). Les changer rouvre tes mots. (Oui, dans le même lot : sinon le codex dirait « copies » juste à côté du rappel qui dit « productions ».)
8. La banque : quand une production partagée arrive chez un·e collègue, son type va-t-il seulement sur la production, ou aussi dans sa banque ? (Seulement sur la production. Le menu le montre quand même pour cette production, et le ou la collègue l'ajoute d'un geste s'il lui sert.)
9. La banque : renommer un type, est-ce que ça renomme les productions qui le portent déjà ? (Non. On renomme pour la suite, et les productions gardent leur nom : rien n'est réécrit.)

### Ce que je n'ai pas pu vérifier

- **WebKit n'existe pas ici.** La spec du rappel (`tests/integration/lot-i-rappel-mene-au-codex.spec.js`) est verte sous Chromium (4/4), et seulement sous Chromium. Le verdict WebKit se prend sur le Mac.
- **Le relevé lit le code, pas les écrans.** Une chaîne de code mort peut s'y trouver : je n'ai pas ouvert chaque écran.
- **Tes données ne sont pas ici.** Combien de tes productions portent le type « Autre » ou un type inconnu (§ 8, le stock) : à mesurer sur le Mac.
- **Aucune capture prise** : une seule phrase change cette nuit. Les captures WebKit à 1180 px que demande la consigne viennent à l'étape 2.

## 1. Comment le relevé a été fait

- **Périmètre.** Tout `js/` (hors `js/_archives`, que l'application ne sert pas) et `index.html`. J'ai écarté :
  - `js/changelog-data.js` (174 lignes), parce que les Nouvelles déjà publiées restent telles quelles ;
  - les tests, la documentation, `design-system.html` et les scripts de diagnostic : l'utilisateur ne les lit pas.
- **Outil.** Pour le JavaScript, un tokeniseur (acorn) : les commentaires sont écartés, seules les chaînes et les gabarits sont gardés. Pour `index.html`, un analyseur HTML (parse5) : les nœuds texte et les attributs lus (title, placeholder, aria-label…), sans les scripts ni les commentaires. Le motif est le mot entier « copie » ou « copies », en toute casse. « Copier » et « copié » n'y entrent pas ; un impératif comme « Copie ton tableau » y entre, et il est rangé en (c).
- **Mots en morceaux.** Les pluriels bâtis à part, comme `pluriel(n, 'copie', 'copies')`, ont été repris à la main (18 lignes). Une ligne de code qui porte un singulier et un pluriel compte une fois.
- **Noms de fichiers reçus par les étudiant·es.** Aucun nom de fichier exporté ne contient « copie » (recherche dans `js/`).
- **Ce que reçoivent les étudiant·es.** Seules deux lignes du relevé s'impriment sur leur PDF (entrées 448 et 449, `js/synthese-retroaction-rendu.js`).

## 2. Les règles que j'ai suivies pour proposer

- **(a) devient « production »**, avec le possessif de ta règle : « sa production », « la production de l'étudiant·e », « les productions de tes étudiant·es ». « Ta production » reste celle que tu demandes.
- **EV.** Ce qui appartient à l'évaluation passe à « évaluation » : la note, le niveau, le verrouillage, « Non verrouillée », le résultat. Exemples : « Une évaluation ne compte dans la note qu'une fois verrouillée » ; « Le résultat d'une évaluation viendrait : ». Quand une phrase prêtait des points à la copie (« ce qu'on attend d'une copie qui les obtient »), je propose « ce qu'on attend d'une production pour les obtenir ».
- **2S.** Quand « production » désignerait à la fois la tienne et la leur, je propose « productions remises », « de tes étudiant·es », ou un autre mot (« rangée » dans la Liste, « fichier » dans les Propriétés du fichier).
- **FI.** Quand le geste porte sur le fichier lui-même (le déplacer, le mettre à la corbeille, le réparer, le dire illisible), je propose « fichier ». La fenêtre s'appelle déjà « Propriétés du fichier », et la corbeille dit déjà « Mettre le fichier à la corbeille ».
- **Le reste de la phrase ne bouge pas**, ponctuation comprise, pour que l'étape 2 ne change que le mot. Deux exceptions, signalées dans leur note : « sur une copie papier » devient « sur papier » (entrée 137), et « jamais sur sa copie » devient « jamais dans sa rétroaction » (entrées 159, 161 et 247), parce que la phrase parle de ce que l'étudiant·e reçoit.
- **Les identifiants du code et les clés de stockage ne sont pas touchés** (`fichiersTravaux`, `reserve-copies.js`, `ReserveCopies`, les classes CSS) : seuls les mots affichés changeront.

Les drapeaux du tableau : **EV** (la copie désigne l'évaluation) ; **2S** (« production » prendrait deux sens) ; **FI** / **FI?** (« fichier » proposé, ou à trancher) ; **ÉL** (lu par les étudiant·es) ; **BU** (cité par une bulle ou par le texte validé d'un parcours) ; **VA** (texte que tu as déjà accepté) ; **A** / **D** (une phrase que les sessions A ou D touchent cette nuit) ; **POSÉ** (le texte validé, posé cette nuit).

## 3. Ce que d'autres lots touchent

- **Les bulles déjà posées** (`lot/parcours-1-et-2`, a328bb9) : aucune ne cite un libellé qui dit « copie ». J'ai cherché dans les quatre fichiers neufs : `assistance.js`, `parcours-moteur.js`, `parcours-decouvrir.js`, `parcours-classe.js`.
- **Les textes validés des parcours suivants** (pas encore posés) qui citent un libellé de ce relevé :
  - Parcours 3, bulle du choix : « Le résultat d'une copie viendrait : des points / des niveaux » (entrée 297).
  - Parcours 4, étape 2 : « Réunir en une copie » (entrée 469). Sa consigne dit déjà de citer le libellé tel qu'il s'affiche.
  - Parcours 8, étape 4 : « Sur la copie fictive : … » (entrée 257). Son point 2 « INSCRIS AU BACKLOG » (« l'atelier du critère algorithmique dit « copie » ») est couvert par ce relevé, entrées 149 à 180 : il ne faut pas l'inscrire deux fois.
  - Parcours 5 : il se place « après « Recevoir et rendre tes copies » », alors que la consigne du parcours 4 titre ce parcours « Recevoir les productions, rendre tes rétroactions ». Les deux consignes ne disent pas le même titre : à trancher par Cowork.
- **La session A** (copie non recevable) touche 11 lignes de ce relevé (drapeau **A**). Ses textes neufs devraient dire « production » d'emblée.
- **La session D** (la complétion suit la remise) touche 4 lignes (drapeau **D**), dont la règle de l'Aide sur l'indice C (entrée 60).

## 4. Le tableau des occurrences (a) : ce que l'étudiant·e remet (369 lignes de code)

Une ligne par ligne de code. Quand une ligne porte un singulier et un pluriel, les deux sont séparés par « / » ou « ⟂ ». « … » marque un extrait : seul le passage qui change est réécrit, le reste de la phrase ne bouge pas.

### Conception › Mon matériel (11)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 291 | `js/materiel-dissection-lecture.js:55` | Ce qui est attendu : la question que tu te poses devant la copie | Ce qui est attendu : la question que tu te poses devant la production d'un·e étudiant·e | 2S | lecture de Mon matériel ; comme l'entrée 19 |
| 292 | `js/materiel-dissection-lecture.js:56` | Ce que tu regardes dans toutes les copies pour juger du critère | Ce que tu regardes dans les productions de tes étudiant·es pour juger du critère | 2S | comme l'entrée 20 (relecture) |
| 293 | `js/materiel-dissection-lecture.js:58` | Ce que tu vois dans une copie, à un niveau donné ⟂ Une réponse possible à la question du critère (une seule vaut pour une copie) | Ce que tu vois dans la production d'un·e étudiant·e, à un niveau donné / … (une seule vaut pour chaque production remise) | 2S |  |
| 294 | `js/materiel-dissection-lecture.js:63` | Ce que tu écris sur la copie | Ce que tu écris dans ta rétroaction | EV | catégorie de Mon matériel (le commentaire) |
| 295 | `js/materiel-dissection.js:661` | . Ce serait à toi de dire laquelle donne le résultat d’une copie. | … Ce serait à toi de dire laquelle donne le résultat d’une évaluation. | EV BU |  |
| 296 | `js/materiel-dissection.js:779` | Aucun critère pour l’instant : surligne une question que tu te poses devant la copie avec « Critère », ou des réponses avec « Descripteur ». | … surligne une question que tu te poses devant la production d’un·e étudiant·e avec « Critère » … | 2S |  |
| 297 | `js/materiel-dissection.js:812` | Le résultat d’une copie viendrait : | Le résultat d’une évaluation viendrait : | EV BU | la bulle du choix du parcours 3 cite « Le résultat d'une copie viendrait : des points / des niveaux » : elle suivra |
| 298 | `js/materiel-dissection.js:816` | Pour chaque niveau : la plage de notes qu’il couvre, et la note qu’une copie reçoit à ce niveau. | Pour chaque niveau : la plage de notes qu’il couvre, et la note qu’il donne. | EV |  |
| 299 | `js/materiel.js:41` | , dans « Grilles de critères ». D’ici là, la note d’une copie évaluée avec cette grille affichera « -- ». | … D’ici là, la note d’une évaluation faite avec cette grille affichera « -- ». | EV |  |
| 300 | `js/materiel.js:54` | Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle. | Pour t’en servir, associe-la à une production, puis fais une première évaluation avec elle. | 2S EV | « associe-la à une production, puis évalue une première production » : deux sens |
| 301 | `js/materiel.js:101` | Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle. | Pour t’en servir, associe-la à une production, puis fais une première évaluation avec elle. | 2S EV |  |

### Conception › Productions (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 3 | `index.html:4632` | …e, en début de trimestre. Il reste entier dans le dossier de l'étudiant·e — copie, annotation, rétroaction, résultat — mais il ne pèse ni sur la note, ni sur la performance, ni sur la complétion, ni sur le palier RàI. Sa pondérati… | … dans le dossier de l'étudiant·e — production remise, annotation, rétroaction, résultat — … | 2S | la case est sur la fiche de Conception : « sa production » mêlait les deux sens (relecture) |

### Conception › Grilles (6)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 255 | `js/grilles.js:3661` | La note reste entre 0 et la pondération du critère. Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. | Une évaluation déjà enregistrée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. | EV | comme l'entrée 35 |
| 256 | `js/grilles.js:3695` | Sur la copie fictive, il vaudrait <span data-calcul-phrases-valeur=" | Sur la production fictive, il vaudrait … |  |  |
| 257 | `js/grilles.js:3735` | Sur la copie fictive : | Sur la production fictive : | BU | la consigne du parcours 8 (étape 4) cite « Sur la copie fictive : … » |
| 258 | `js/grilles.js:3757` | Quand une donnée de la copie vaut 0 | Quand une donnée de la production vaut 0 |  |  |
| 259 | `js/grilles.js:4036` | Sur toute copie évaluée avec cette grille, la palette des codes montre | Sur toute production évaluée avec cette grille, la palette des codes montre |  |  |
| 260 | `js/grilles.js:4057` | Sans cette case, la copie utilise la palette générale (Annoter › palette). Cochée, ce sont ces sous-critères qui deviennent les codes de la copie. | Sans cette case, la production utilise la palette générale (Annoter › palette). Cochée, ce sont ces sous-critères qui deviennent les codes de la production. |  |  |

### Conception › Échelles (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 233 | `js/echelles.js:3323` | copie ⟂ copies | N production(s) remise(s) | 2S | liste « 3 évaluations, 2 productions et 5 copies » : sans « remises », deux sens dans la même phrase |

### Conception › Rétroactions (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 187 | `js/cartouches.js:2413` | > Aucun travail n'a été remis au moment où tu écris. N'invente aucun détail de copie | > Aucun travail n'a été remis au moment où tu écris. N'invente aucun détail de production |  | invite que l'enseignant·e copie vers une IA ; lue par l'IA, pas par les étudiant·es |

### Suivi › Groupe (2)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 7 | `index.html:7341` | Aux productions reprises, la note de la copie d’origine à la place de celle de la reprise | Aux productions reprises, la note de l’évaluation d’origine à la place de celle de la reprise | EV | libellé de case (courbes du groupe) |
| 8 | `index.html:7366` | …ir le groupe sans ses reprises : à chaque production reprise, la note de la copie d'origine remplace celle de la reprise (la médiane suit). Décoche pour revenir aux reprises. Tant qu'une reprise n'est pas réévaluée, elle garde d'o… | … à chaque production reprise, la note de l'évaluation d'origine remplace celle de la reprise … | EV |  |

### Évaluation › Liste (23)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 9 | `index.html:8122` | Sélectionner toutes les copies affichées | Sélectionner toutes les rangées affichées | 2S | « les productions affichées » se lirait comme les productions que tu demandes (filtre « Production ») |
| 10 | `index.html:8344` | Incomplet ; travail en cours : cette copie n'a pas de note et ne compte pas dans la note de l'étudiant·e. Décoche la case dans Paramètres pour évaluer la copie terminée. | Incomplet ; travail en cours : cette production n'est pas évaluée et ne compte pas dans la note de l'étudiant·e. Décoche la case dans Paramètres pour évaluer la production terminée. | EV | infobulle de la pastille « Incomplet » |
| 270 | `js/liste-evaluations.js:712` | copies sélectionnées ⟂ copie sélectionnée | N rangées sélectionnées / 1 rangée sélectionnée | 2S | comme l'entrée 9 |
| 271 | `js/liste-evaluations.js:800` | Aucune copie à déplacer vers « | Aucun fichier à déplacer vers « | 2S FI | tout l'encadré « Réassigner » dit « fichier » (800 à 832), sinon il dirait à la fois copies, productions et fichiers |
| 272 | `js/liste-evaluations.js:802` | copie ⟂ copies | N fichier(s) vers « … » : | 2S FI | la cible est une production : « fichier » évite le double sens |
| 273 | `js/liste-evaluations.js:823` | plus de copie liée (l’évaluation elle-même est conservée). | … plus de fichier lié (l’évaluation elle-même est conservée). | 2S FI |  |
| 274 | `js/liste-evaluations.js:828` | copie déjà sur la cible, laissée telle quelle ⟂ copies déjà sur la cible, laissées telles quelles | fichier déjà sur la cible, laissé tel quel / fichiers déjà sur la cible, laissés tels quels | 2S FI |  |
| 275 | `js/liste-evaluations.js:831` | copie non déplacée ⟂ copies non déplacées | fichier non déplacé / fichiers non déplacés | 2S FI |  |
| 276 | `js/liste-evaluations.js:832` | : deux copies d’un·e même étudiant·e sont cochées. Choisis-en une. | … : deux fichiers d’un·e même étudiant·e sont cochés. Choisis-en un. | 2S FI |  |
| 277 | `js/liste-evaluations.js:845` | Le module des copies n’est pas chargé. | Le module des fichiers n’est pas chargé. | FI | message d'erreur technique |
| 278 | `js/liste-evaluations.js:867` | copies ⟂ copie | Réassigner N fichiers / Réassigner 1 fichier | FI | titre de la fenêtre |
| 279 | `js/liste-evaluations.js:906` | copies ⟂ copie | Réassigner N fichiers / Réassigner 1 fichier | FI | bouton |
| 280 | `js/liste-evaluations.js:915` | copies réassignées ⟂ copie réassignée | N fichiers réassignés / 1 fichier réassigné | FI |  |
| 281 | `js/liste-evaluations.js:971` | Copie sans étudiant·e | Fichier sans étudiant·e | FI |  |
| 282 | `js/liste-evaluations.js:995` | copie déjà évaluée ⟂ copies déjà évaluées | production déjà évaluée / productions déjà évaluées |  | récapitulatif de la corbeille |
| 283 | `js/liste-evaluations.js:996` | : leur évaluation et leur note restent dans la liste, sans copie liée. | … : leur évaluation et leur note restent dans la liste, sans fichier lié. | FI |  |
| 284 | `js/liste-evaluations.js:999` | copie liée ⟂ copies liées | fichier lié / fichiers liés à une reprise. | FI | la phrase suivante dit déjà « Mettre le fichier à la corbeille » |
| 285 | `js/liste-evaluations.js:1037` | copies ⟂ une copie | N fichiers / un fichier | FI | confirmation de la corbeille |
| 286 | `js/liste-evaluations.js:1061` | copies mises à la corbeille. ⟂ copie mise à la corbeille. | N fichiers mis à la corbeille. / 1 fichier mis à la corbeille. | FI |  |
| 287 | `js/liste-evaluations.js:1664` | Sélectionner la copie de | Sélectionner la production de |  | suivi du nom de l'étudiant·e : « la production d'Alex Exemple », au sens de la règle |
| 288 | `js/liste-evaluations.js:2035` | Cette copie est une reprise : appliquer un jeton de reprise sur la production choisie | Ce fichier est une reprise : appliquer un jeton de reprise sur la production choisie | 2S FI | case des « Propriétés du fichier » |
| 289 | `js/liste-evaluations.js:2139` | Le module des copies n’est pas chargé. | Le module des fichiers n’est pas chargé. | FI |  |
| 290 | `js/liste-evaluations.js:2144` | La copie garde son étudiant·e et sa production ; rien n’a été modifié. | Le fichier garde son étudiant·e et sa production ; rien n’a été modifié. | 2S FI |  |

### Aide › Bibliothèque et démo (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 11 | `index.html:9853` | Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées. | … et « Retirer les productions importées » les efface. | 2S | suit le bouton du bandeau démo (demo-activation.js:677, 707) |

### Aide › Conception (22)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 14 | `index.html:10128` | …men à 90 (60 %) donnent (80 × 40 + 90 × 60) / 100 = 86. Seules comptent les copies évaluées et verrouillées ; un brouillon, une copie « Incomplet ; travail en cours » et une production diagnostique n'y entrent pas. Une production … | Seules comptent les évaluations verrouillées ; un brouillon, une production « Incomplet ; travail en cours » et une production diagnostique n'y entrent pas. | EV 2S | Aide › sommative ; « production diagnostique » est la tienne, « production « Incomplet » » la sienne |
| 15 | `index.html:10130` | …révu (un forfait sans requis) ; sans lui, la note n'est pas calculable. Une copie non recevable est non satisfaisante ; un travail non remis ou une copie « Incomplet ; travail en cours » ne compte pour aucun type. Pendant une repr… | Une production non recevable est non satisfaisante ; un travail non remis ou une production « Incomplet ; travail en cours » ne compte pour aucun type. | A | Aide › spécifications |
| 16 | `index.html:10132` | …us « Productions qui comptent dans la note ». Parmi les productions dont la copie compte, ta pratique en retient selon sa « Construction de la note » : les N meilleures (les preuves de maîtrise les plus fortes), les N dernières (l… | Parmi les productions dont l'évaluation compte, ta pratique en retient … | EV | Aide › standards |
| 17 | `index.html:10134` | … 45. Aucune évaluation n'entre dans la note, quel que soit son statut : une copie non recevable, une reprise ou un jeton n'y changent rien. Tant que tu n'as enregistré aucun jugement pour un·e étudiant·e, sa note n'est pas calcula… | … une production non recevable, une reprise ou un jeton n'y changent rien. | A | Aide › dénotation |
| 18 | `index.html:10190` | …e un : un élément observable du critère, ce que tu regardes dans toutes les copies pour en juger. Dans un critère algorithmique, un sous-critère devient une catégorie de ce que tu comptes (voir « Les critères algorithmiques »).… | … ce que tu regardes dans les productions de tes étudiant·es pour en juger. | 2S | « chaque production » se lirait comme chaque fiche de Conception (relecture) |
| 19 | `index.html:10219` | : ce qui est attendu ; la question que tu te poses devant la copie. | : ce qui est attendu ; la question que tu te poses devant la production d'un·e étudiant·e. | 2S | même choix que 20 ; même texte : glossaire (131), Mon matériel (291) |
| 20 | `index.html:10220` | : ce que tu regardes dans toutes les copies pour juger d’un critère. On dit aussi sous-critère. | : ce que tu regardes dans les productions de tes étudiant·es pour juger d’un critère. On dit aussi sous-critère. | 2S | « toutes les copies » : le pluriel se garde (relecture) |
| 21 | `index.html:10221` | : ce que tu observes dans une copie, à un niveau donné ; une réponse possible à la question du critère. Une seule vaut pour une copie. | : ce que tu observes dans la production d'un·e étudiant·e, à un niveau donné ; une réponse possible à la question du critère. Une seule vaut pour chaque production remise. | 2S |  |
| 22 | `index.html:10227` | …lle peut porter les deux : c’est toi qui dis lequel donne le résultat d’une copie. Avec les niveaux, l’application te demande, pour chacun, sa plage de notes et la note qu’une copie reçoit à ce niveau : c’est ainsi qu’un niveau de… | … c’est toi qui dis lequel donne le résultat d’une évaluation. Avec les niveaux, l’application te demande, pour chacun, sa plage de notes et la note qu’il donne … | EV BU | la bulle du parcours 3 dit déjà « Le résultat d'une évaluation » |
| 23 | `index.html:10234` | …mme toute grille. S’il manque des points à un critère, la grille se crée quand même : Grilles dit combien de critères les attendent, et la note d’une copie affiche « -- » tant qu’ils ne sont pas complétés.… | … la note d’une évaluation affiche « -- » tant qu’ils ne sont pas complétés. | EV |  |
| 24 | `index.html:10253` | …s points (un nombre, ou deux bornes comme « 3 à 4 »), ce qu’on attend d’une copie qui les obtient et, si tu veux, un nom. Tu l’écris dans Conception › Grilles, sous le critère.… | … ce qu’on attend d’une production pour les obtenir … | EV | la production n'« obtient » pas de points : l'évaluation les donne |
| 25 | `index.html:10294` | … critère algorithmique calcule sa note à partir de ce que tu comptes sur la copie. Tu choisis le calcul dans l'étape « Note calculée » du critère. Un calcul tout fait a un réglage ; un calcul que tu composes n'en a pas : ses nombr… | … calcule sa note à partir de ce que tu comptes dans la production. |  |  |
| 26 | `index.html:10296` | : Chaque occurrence retire des points en proportion de la longueur de la copie : le même nombre d’occurrences coûte moins sur une copie plus longue. Tu fixes la longueur sur laquelle une occurrence coûte un point. | : Chaque occurrence retire des points en proportion de la longueur de la production : le même nombre d’occurrences coûte moins dans une production plus longue. … |  | même texte : evaluation-formules.js:116 |
| 27 | `index.html:10297` | : Tu fixes le rapport qui donne la note entière, par exemple une occurrence à chaque 60 mots. Une copie qui l’atteint a la note entière ; en deçà, la note baisse en proportion. Une copie sans occurrence a la note entière. | : … par exemple une occurrence à chaque 60 mots. Si la production l’atteint, la note est entière ; en deçà, la note baisse en proportion. Sans occurrence, la note est entière. | EV | réécriture au-delà du mot, à juger comme telle ; même texte : evaluation-formules.js:131 |
| 28 | `index.html:10298` | : Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la copie. La longueur reste comptée pour les phrases de l’étudiant·e, mais n’entre pas dans la note. | : Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la production. … |  | même texte : evaluation-formules.js:146 |
| 29 | `index.html:10300` | « Retoucher ce calcul » ouvre « Composer ton propre calcul » sur une copie du calcul choisi ; l'original ne change pas. « Ce calcul sert » dit si ton calcul donne la note ou sert seulement à tes phrases et à tes tables. « Quand un… | « Retoucher ce calcul » ouvre … sur une copie du calcul choisi ; … « Quand une donnée de la production vaut 0 » dit ce que vaut alors le calcul. |  | « une copie du calcul » est un double (b) et reste ; le libellé cité suit grilles.js:3757 et composeur-calcul.js:53 |
| 30 | `index.html:10301` | « Le calcul, en blocs » montre le calcul choisi, tes réglages compris. Au moment d'évaluer, il s'affiche en chiffres sous le résultat ; sur une copie verrouillée que le calcul actuel ne redonne plus, cette ligne se cache. | … sur une évaluation verrouillée que le calcul actuel ne redonne plus, cette ligne se cache. | EV |  |
| 31 | `index.html:10312` | L'étape « Cas d'interprétation » situe la copie par des paliers, d'après une limite : une longueur de référence et une tolérance sur cette longueur. « Fixer une limite » en pose une ; « Retirer la limite » la retire sans effacer c… | L'étape « Cas d'interprétation » situe la production par des paliers … |  |  |
| 32 | `index.html:10313` | « + Ajouter une table de cas » choisit un texte selon une valeur de la copie : un compte, la note, la part de la limite, la moyenne, le code le plus fréquent ou l'un de tes calculs. Une table neuve est vide. | … choisit un texte selon une valeur de la production : … |  |  |
| 33 | `index.html:10316` | Dans Annoter, les sous-critères sont les codes que tu poses, sur toute copie évaluée avec cette grille. Chaque code posé compte une occurrence de son sous-critère ; le champ de ce que tu comptes se remplit tout seul, et la formule… | … sur toute production évaluée avec cette grille. … |  |  |
| 34 | `index.html:10317` | L'étudiant·e lit, sous le critère, la phrase du décompte, puis le cas de sa copie dans les paliers, puis le texte des tables de cas. Son PDF imprime aussi la ligne du calcul : « 7 erreurs (5 après pondération) sur 400 mots → 13,75… | L'étudiant·e lit, sous le critère, la phrase du décompte, puis le cas de sa production dans les paliers … |  |  |
| 35 | `index.html:10320` | Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. Verrouillée, si le calcul actuel lui donnerait une autre note, une ligne sous sa note le dit. | Une évaluation déjà enregistrée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. … | EV | même texte : grilles.js:3661 ; cité par la consigne du parcours 8 (à inscrire) |

### Aide › Évaluation (23)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 37 | `index.html:10488` | À l'étape « Optimisation », « LEA » remplit l'étudiant·e, la production et la date d'après le nom du fichier de Léa ; « Autre » te les fait choisir. Les doublons sont repérés, les pages assemblées ; « Importer » range les copies. | … « Importer » range les productions de tes étudiant·es. | 2S | juste avant, « la production » est la tienne (relecture) |
| 38 | `index.html:10490` | 3. Suivre les copies : ⟂ dans Annoter, chaque copie porte une pastille, « Importé », « Annoté » ou « Évalué » ; « Incomplet » passe avant les trois. | 3. Suivre les productions : dans Annoter, chaque production porte une pastille … |  |  |
| 39 | `index.html:10495` | Selon le navigateur, « Configurer le stockage sur disque » range aussi les copies dans un dossier de ton ordinateur ; ni Safari, ni Firefox, ni une tablette ne l'offrent. | … « Configurer le stockage sur disque » range aussi les productions dans un dossier de ton ordinateur … |  |  |
| 40 | `index.html:10513` | Une rangée par copie attendue. « Statut » porte sa pastille, de « Non reçu » à « Évalué » ; une copie « Non verrouillée » ne compte pas encore dans la note. « Jeton » porte les badges des jetons et de l'intégrité. Le filtre « Stat… | Une rangée par étudiant·e et par production. … une évaluation « Non verrouillée » ne compte pas encore dans la note. | 2S EV | « une rangée par production attendue » se lirait comme une rangée par production demandée |
| 41 | `index.html:10515` | Le menu « Actions » d'une rangée n'offre que ce que la copie permet : « Évaluer », « Annoter », « Consulter », « Modifier » (l'éditeur de pages)… « Réassigner » ouvre les « Propriétés du fichier » : l'étudiant·e, la production et … | Le menu « Actions » d'une rangée n'offre que ce que la rangée permet … « Réassigner » ouvre les « Propriétés du fichier » : l'étudiant·e, la production et l'évaluation du fichier. | 2S FI | « la production de la production » est impossible |
| 42 | `index.html:10517` | …ngée, ou « Mettre à la corbeille (N) », sur les rangées cochées, envoie les copies à la corbeille, après une question. « Corbeille (N) », près des filtres, les montre : elles s'y restaurent pendant 30 jours.… | … envoie les fichiers à la corbeille, après une question. … | FI | la corbeille reçoit le fichier ; l'évaluation reste (liste-evaluations.js:996) |
| 43 | `index.html:10534` | « Annoter », dans le tableau des copies, ouvre la visionneuse ; « Actions ▾ » passe d'« Annoter » à « Évaluer ». À côté de « 100 % », un bouton passe en plein écran. | « Annoter », dans la Liste, ouvre la visionneuse ; … |  | « le tableau des productions » se lirait comme Conception › Productions |
| 44 | `index.html:10551` | (gauche) : la copie, la grille, l'échelle, la cartouche, l'« Intégrité académique » et les jetons (voir « Utiliser les jetons »). Cochée, « Incomplet ; travail en cours » met la copie de côté, sans note ni jeton, et elle garde sa … | (gauche) : la production, la grille, … met la production de côté … : voir « Productions non remises, non recevables, soupçonnées ou incomplètes ». | A | cite le titre de l'entrée 49 |
| 45 | `index.html:10552` | … note se calcule. Sous un critère à barème, touche la tranche qui décrit la copie, puis ses points, ou passe par « Ou tape les points : ». Des points qu'aucune tranche ne couvre portent « hors barème » ; une tranche « à compléter … | … touche la tranche qui décrit la production, puis ses points … |  |  |
| 46 | `index.html:10560` | … toute seule (témoin « Enregistré »). Dès qu'un critère porte un niveau, la copie se dit « Évalué » ici, « Non verrouillée » dans la Liste : elle ne compte pas encore dans la note. ⟂ , en haut de Paramètres, l'y fait entrer ; ce b… | … la production se dit « Évalué » ici, « Non verrouillée » dans la Liste … caché tant que la production n'a pas d'évaluation. |  |  |
| 47 | `index.html:10561` | Verrouillée, la copie montre la note remise, et la ligne « Note remise : … Avec le calcul actuel de la grille, elle serait de … » si le calcul actuel en donnerait une autre. Pour la corriger, déverrouille-la : elle montre la note … | Verrouillée, l'évaluation montre la note remise … | EV |  |
| 48 | `index.html:10577` | … jeton : » du panneau Paramètres ; dans les « Propriétés du fichier » d'une copie, la case « Cette copie est une reprise : appliquer un jeton de reprise sur la production choisie » ; à l'import, « Jeton de reprise » dans le menu «… | … dans les « Propriétés du fichier », la case « Ce fichier est une reprise : appliquer un jeton de reprise sur la production choisie » … | 2S FI | suit la case de liste-evaluations.js:2035 |
| 49 | `index.html:10591` | Copies non remises, non recevables, soupçonnées ou incomplètes | Productions non remises, non recevables, soupçonnées ou incomplètes | A | titre d'une section de l'Aide, cité ailleurs |
| 50 | `index.html:10597` | Une copie peut être non remise, non recevable, soupçonnée ou incomplète. | Une production peut être non remise, non recevable, soupçonnée ou incomplète. | A |  |
| 51 | `index.html:10606` | Une raison d'intégrité : la Liste marque la copie « Non recevable (Plagiat) » ou « Non recevable (IA) », 0 sous « Statut », « -- » en note. | … la Liste marque la production « Non recevable (Plagiat) » … | A |  |
| 52 | `index.html:10607` | Une copie non recevable compte comme non remise dans la complétion (C) ; elle reste dans le total attendu. Dans la note, son sort dépend de ta pratique : | Une production non recevable compte comme non remise dans la complétion (C) ; … | A D |  |
| 53 | `index.html:10612` | en dénotation, ta note est ton jugement : la copie n'y entre pas par calcul. | en dénotation, ta note est ton jugement : l'évaluation n'y entre pas par calcul. | EV A |  |
| 54 | `index.html:10620` | « Soupçon à vérifier » note un doute : la Liste montre « À vérifier », et la copie s'évalue normalement d'ici ta décision. | … et la production s'évalue normalement d'ici ta décision. |  |  |
| 55 | `index.html:10625` | …case « Incomplet ; travail en cours » du panneau Paramètres met de côté une copie inachevée, sans note ni jeton : elle n'entre pas dans la note, et compte comme remise dans la complétion (C) jusqu'à ce que tu décoches la case pour… | … met de côté une production inachevée … jusqu'à ce que tu décoches la case pour évaluer la production terminée. | D |  |
| 56 | `index.html:10628` | …ns « Notes (optionnel) ». Non recevable, ton évaluation est gardée, mais la copie montre « Non recevable » au lieu de sa note et de ses niveaux, jusque sur le PDF ; dans la note, elle vaut ce que dit la règle ci-dessus. Verrouille… | … Non recevable, ton évaluation est gardée, mais l'évaluation montre « Non recevable » au lieu de sa note et de ses niveaux, jusque sur le PDF … | EV A | même texte : evaluation-sauvegarde.js:577 ; « ton évaluation… mais l'évaluation » se répète : à reformuler par Grégoire |
| 57 | `index.html:10642` | Cet écran sort tes copies et tes évaluations de l'application, en fichiers que tu gardes sur ton ordinateur. | Cet écran sort les productions de tes étudiant·es et tes évaluations de l'application … | 2S | « tes productions » serait les tiennes |
| 58 | `index.html:10646` | : la copie annotée et son évaluation en un PDF à téléverser dans Léa ; « Reprises seulement » limite l'export aux reprises. | : la production annotée et son évaluation en un PDF à téléverser dans Léa … |  |  |
| 59 | `index.html:10649` | le bloc au bas de l'écran dit ce que tes copies occupent. | … le bloc au bas de l'écran dit ce que les productions de tes étudiant·es occupent. | 2S |  |

### Aide › Suivi (4)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 60 | `index.html:10692` | : les travaux remis, divisés par les travaux comptés. Un travail facultatif n'y entre pas, et un travail n'y entre qu'une fois qu'une copie, au moins, compte dans la note. | … et un travail n'y entre qu'une fois qu'une évaluation, au moins, compte dans la note. | EV D | Aide › indice C ; la session D touche cette règle cette nuit |
| 61 | `index.html:10859` | …nt·es. Ce seuil est le repère « Suffisant à partir de » de l'échelle de tes copies ; si ton échelle n'en a pas, c'est la note de passage, 60 %.… | … le repère « Suffisant à partir de » de l'échelle de tes évaluations … | EV 2S |  |
| 62 | `index.html:10892` | : une performance sous le repère de suffisance (sans ce repère, sous la note de passage) sur les derniers artefacts ; en début de trimestre, une seule copie peut l'allumer ; | … en début de trimestre, une seule évaluation peut l'allumer ; | EV |  |
| 63 | `index.html:10896` | : présent·e en classe, mais aucune production évaluée, quand le groupe permet d'en juger (un travail dû et au moins une copie du groupe évaluée). | … (un travail dû et au moins une production du groupe évaluée). |  | même texte : guides-pedagogiques.js:184 |

### Infobulles (9)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 72 | `js/accompagnement-contenu-hover.js:135` | Active trois tampons ou estampes (Repérage, Liaison, Ouverture) que tu poses sur les copies pour observer les gestes cognitifs de tes étudiant·es. Les résultats alimentent le profil ACO et l'export de recherche anonymisé. | … que tu poses sur les productions pour observer les gestes cognitifs … |  |  |
| 73 | `js/accompagnement-contenu-hover.js:271` | Ce qu’on attend d’une copie qui obtient ces points. | Ce qu’on attend d’une production pour obtenir ces points. | EV |  |
| 74 | `js/accompagnement-contenu-hover.js:281` | Touche la tranche qui décrit la copie, puis ses points. | Touche la tranche qui décrit la production, puis ses points. |  |  |
| 75 | `js/accompagnement-contenu-hover.js:366` | Recevable ou non. Une copie non recevable (plagiat, IA non autorisée) compte comme non remise dans la complétion ; dans la note, son sort dépend de ta pratique (Aide › « Travail NON RECEVABLE »). | Recevable ou non. Une production non recevable (plagiat, IA non autorisée) compte comme non remise … | A |  |
| 77 | `js/accompagnement-contenu-hover.js:433` | Mode annotation : surligne, écris et appose des tampons / estampes ou des codes spécifiques directement sur la copie de l'étudiant·e. | … directement sur la production de l'étudiant·e. |  |  |
| 78 | `js/accompagnement-contenu-hover.js:439` | Remplace un fichier allégé par l'original complet, à re-déposer. Ne concerne que les copies allégées avant le retrait de cette fonctionnalité. | … Ne concerne que les fichiers allégés avant le retrait de cette fonctionnalité. | FI |  |
| 85 | `js/accompagnement-contenu-hover.js:497` | La grille donne les critères avec lesquels tu évalues chaque copie. Tu peux la choisir plus tard, dans Conception › Grilles. | La grille donne les critères avec lesquels tu évalues chaque production. … |  |  |
| 89 | `js/accompagnement-contenu-hover.js:752` | Annote les copies et évalue selon la grille de critères, sur le même document. | Annote les productions et évalue selon la grille de critères, sur le même document. |  |  |
| 92 | `js/accompagnement-contenu-hover.js:907` | Ta grille porte des points et des niveaux : choisis lequel donne le résultat d’une copie. Avec les niveaux, tu diras ensuite la note que vaut chacun. | … choisis lequel donne le résultat d’une évaluation. … | EV BU | comme la bulle du parcours 3 |

### Aide contextuelle (ⓘ) (19)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 94 | `js/accompagnement-contenu-popup.js:177` | Un critère qui se calcule à partir de ce que tu comptes sur la copie (des erreurs, des éléments manquants, des calculs…) peut être de type algorithmique : son atelier propose trois calculs tout faits, que tu peux retoucher, ou te … | … à partir de ce que tu comptes dans la production (des erreurs, des éléments manquants, des calculs…) … |  |  |
| 97 | `js/accompagnement-contenu-popup.js:454` | « Dans ta palette » : les tampons que tu poses sur les copies, dans tous tes trimestres. | « Dans ta palette » : les tampons que tu poses sur les productions, dans tous tes trimestres. |  |  |
| 99 | `js/accompagnement-contenu-popup.js:484` | Préparer et importer des copies | Préparer et importer des productions |  | titre de la fenêtre d'aide de Préparer |
| 100 | `js/accompagnement-contenu-popup.js:488` | Cette page rassemble les copies numérisées de tes étudiant·es (PDF ou images), les optimise et les associe à une production, prêtes à être annotées et évaluées ensuite. | Cette page rassemble les productions numérisées de tes étudiant·es (PDF ou images) … |  |  |
| 101 | `js/accompagnement-contenu-popup.js:495` | Le processus optimise les images, regroupe les pages d'une même copie et propose une association automatique à partir du nom de fichier | … regroupe les pages d'une même production … |  |  |
| 102 | `js/accompagnement-contenu-popup.js:497` | Clique sur « Importer » : les copies sont stockées et prêtes pour « Annoter » | Clique sur « Importer » : les productions sont stockées et prêtes pour « Annoter » |  |  |
| 103 | `js/accompagnement-contenu-popup.js:507` | …u téléphone, par exemple), coche dans « Originaux » les fichiers d'une même copie, puis « Réunir en une copie » : ils deviennent un seul document, dans l'ordre réglé aux flèches, et tu choisis l'étudiant·e et la production une seu… | … coche dans « Originaux » les fichiers d'une même production, puis « Réunir en une production » … | BU | suit le bouton travaux-ui.js:1996 ; la consigne du parcours 4 cite « Réunir en une copie » |
| 104 | `js/accompagnement-contenu-popup.js:529` | L'annotation te permet de marquer directement sur les copies de tes étudiants : surlignage, commentaires écrits, symboles (crochet, X) et autocollants de rétroaction pédagogique. | … marquer directement sur les productions de tes étudiants : … |  | « étudiants » non inclusif, hors de ce lot : à signaler |
| 105 | `js/accompagnement-contenu-popup.js:536` | Importe les copies (PDF, JPEG, PNG) par glisser-déposer ou via le bouton parcourir | Importe les productions de tes étudiant·es (PDF, JPEG, PNG) … | 2S | la ligne voisine dit « Sélectionne la production concernée » : la tienne (relecture) |
| 106 | `js/accompagnement-contenu-popup.js:537` | Clique sur une copie pour l'ouvrir dans la visionneuse | Clique sur une production pour l'ouvrir dans la visionneuse |  |  |
| 107 | `js/accompagnement-contenu-popup.js:577` | Le panneau d'export rassemble l'inventaire des fichiers de travaux déjà importés (originaux PDF/image, copies annotées) et propose plusieurs modes d'export pour les sortir hors de l'application. | … (originaux PDF/image, productions annotées) … |  |  |
| 108 | `js/accompagnement-contenu-popup.js:589` | L'inventaire affiché en haut du panneau (« N fichiers en stock ») reflète tout ce qui a été importé dans Préparer . Si tu ne vois aucun fichier ici, c'est qu'aucune copie n'a encore été importée pour ce groupe-cours. | … c'est qu'aucune production n'a encore été importée pour ce groupe-cours. |  |  |
| 109 | `js/accompagnement-contenu-popup.js:607` | Par production : toutes les copies d'un même travail | Par production : ce que tous tes étudiant·es ont remis pour une même production | 2S | « toutes les productions d'une même production » |
| 111 | `js/accompagnement-contenu-popup.js:1053` | …te. Il n’apparaît alors ni au calendrier ni dans les courbes de progression. Les indices C et P ne comptent une production qu’à partir de sa première copie évaluée.… | … Les indices C et P ne comptent une production qu’à partir de sa première évaluation. | EV D |  |
| 112 | `js/accompagnement-contenu-popup.js:1180` | Algorithmique : une formule calcule la note à partir de ce que tu comptes sur la copie. | … une formule calcule la note à partir de ce que tu comptes dans la production. |  |  |
| 113 | `js/accompagnement-contenu-popup.js:1193` | …alent ces points : chaque tranche porte ses points et ce qu’on attend d’une copie qui les obtient, avec un nom si tu veux. Deux tranches ne se chevauchent pas : des points donnés tombent dans une seule.… | … ce qu’on attend d’une production pour les obtenir … | EV |  |
| 114 | `js/accompagnement-contenu-popup.js:1206` | Le barème ne change aucune note : la note vient des points que tu donnes, avec ou sans barème. Il peut t’aider à donner les mêmes points à deux copies semblables. | … Il peut t’aider à donner les mêmes points à deux productions semblables. |  |  |
| 115 | `js/accompagnement-contenu-popup.js:1267` | Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées. | … et « Retirer les productions importées » les efface. | 2S | comme l'entrée 11 |
| 124 | `js/accompagnement-contenu-popup.js:1524` | Vérifier relit une archive copie par copie ; une archive vérifiée offre Faire revenir . | <em>Vérifier</em> relit une archive production par production ; … |  | même geste : reserve-reglages.js:73 |

### Glossaire (15)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 130 | `js/accompagnement-contenu-terme.js:108` | …rithmique (une formule calcule la note à partir de ce que tu comptes sur la copie).… | … algorithmique (une formule calcule la note à partir de ce que tu comptes dans la production). |  | glossaire « Type de critère » |
| 131 | `js/accompagnement-contenu-terme.js:130` | Ce qui est attendu ; la question que tu te poses devant la copie. | Ce qui est attendu ; la question que tu te poses devant la production d'un·e étudiant·e. | 2S | glossaire « Critère » |
| 132 | `js/accompagnement-contenu-terme.js:139` | Ce que tu regardes dans toutes les copies pour juger d’un critère. On dit aussi sous-critère. | Ce que tu regardes dans les productions de tes étudiant·es pour juger d’un critère. On dit aussi sous-critère. | 2S | glossaire « Élément observable » |
| 133 | `js/accompagnement-contenu-terme.js:148` | Ce que tu observes dans une copie, à un niveau donné ; une réponse possible à la question du critère. Une seule vaut pour une copie. | Ce que tu observes dans la production d'un·e étudiant·e, à un niveau donné ; une réponse possible à la question du critère. Une seule vaut pour chaque production remise. | 2S | glossaire « Descripteur » |
| 134 | `js/accompagnement-contenu-terme.js:177` | Pour un critère noté en points, ce que valent ces points : une suite de tranches, chacune avec ses points et ce qu’on attend d’une copie qui les obtient. Chaque critère analytique a son propre barème. | … chacune avec ses points et ce qu’on attend d’une production pour les obtenir. … | EV | glossaire « Barème » |
| 135 | `js/accompagnement-contenu-terme.js:186` | Une partie d’un barème : des points (un nombre, comme 2, ou deux bornes, comme 3 à 4), ce qu’on attend d’une copie qui les obtient et, si tu veux, un nom, comme « Partiel ». | … ce qu’on attend d’une production pour les obtenir et, si tu veux, un nom … | EV | glossaire « Tranche » |
| 136 | `js/accompagnement-contenu-terme.js:223` | … ; un critère algorithmique se calcule à partir de ce que tu comptes sur la copie. La rétroaction se construit au fur et à mesure.… | … un critère algorithmique se calcule à partir de ce que tu comptes dans la production. … |  | glossaire « Évaluation » |
| 137 | `js/accompagnement-contenu-terme.js:250` | Marques visuelles que tu apposes sur les copies importées pour annoter le travail de l'étudiant·e. Ils permettent d'identifier des éléments précis (erreurs, réussites, points d'attention) directement sur le document, comme tu le f… | Marques visuelles que tu apposes sur les productions importées … comme tu le ferais avec un stylo sur papier. |  | glossaire « Tampons » ; « une copie papier » devient « papier » |
| 138 | `js/accompagnement-contenu-terme.js:375` | Trois actions cognitives observables que tu peux repérer sur les copies de tes étudiant·es à l'aide de tampons ou estampes : Repérage (identifier un élément), Liaison (relier des éléments entre eux) et Ouverture (transférer, génér… | … que tu peux repérer sur les productions de tes étudiant·es … |  | glossaire « RLO » |
| 139 | `js/accompagnement-contenu-terme.js:393` | …ervées chez un·e étudiant·e, construit à partir des annotations RLO sur ses copies. Le profil ACO montre la répartition entre repérage, liaison et ouverture — il rend visible le type de pensée que l'étudiant·e mobilise, pas seulem… | … construit à partir des annotations RLO sur ses productions. … |  | glossaire « Profil ACO » |
| 142 | `js/accompagnement-contenu-terme.js:578` | Un élément observable : ce que tu regardes dans toutes les copies pour juger d’un critère. Dans un critère algorithmique, les sous-critères sont les catégories de ce que tu comptes. Chaque sous-critère porte un code, un nom, une p… | Un élément observable : ce que tu regardes dans les productions de tes étudiant·es pour juger d’un critère. … | 2S | glossaire « Sous-critère » |
| 143 | `js/accompagnement-contenu-terme.js:615` | Une copie évaluée ne compte dans la note qu’une fois verrouillée : « Verrouiller », en haut de Paramètres et de la palette Annotation. Verrouillée, elle montre la note remise ; pour la corriger, déverrouille-la. Une copie « Non ve… | Une évaluation ne compte dans la note qu’une fois verrouillée … Une évaluation « Non verrouillée » ne compte pas encore. … | EV | glossaire « Verrouiller » |
| 144 | `js/accompagnement-contenu-terme.js:624` | Changer l’étudiant·e, la production ou l’évaluation d’une copie. « Réassigner », dans le menu « Actions » d’une rangée de la Liste, ouvre les « Propriétés du fichier » ; « Réassigner la sélection » le fait pour plusieurs copies. | Changer l’étudiant·e, la production ou l’évaluation d’un fichier. … « Réassigner la sélection » le fait pour plusieurs fichiers. | 2S FI | glossaire « Réassigner » |
| 145 | `js/accompagnement-contenu-terme.js:652` | …dans la bibliothèque des trimestres, pour un trimestre clos. Une fois l’archive vérifiée, ce qu’elle garde peut quitter l’application (« Archiver les copies… », « Renvoyer aux archives… »), puis revenir par « Faire revenir ».… | … (« Archiver les productions remises… », « Renvoyer aux archives… ») … | 2S | glossaire « Archive » ; suit reserve-copies.js:88 |
| 146 | `js/accompagnement-contenu-terme.js:661` | …ion ce qu’une archive vérifiée garde. Pour l’archive d’un groupe-cours, ses copies reviennent sous leurs fiches ; rien n’est remplacé ni effacé. Un trimestre renvoyé aux archives revient tel qu’il a été archivé, clos ; les autres … | … Pour l’archive d’un groupe-cours, ses productions reviennent sous leurs fiches ; … |  | glossaire « Faire revenir » |

### Accompagnement (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 147 | `js/accompagnement.js:1156` | …ère et la rétroaction se construit au fur et à mesure. Tu peux importer les copies de tes étudiant·es (PDF ou images), les annoter avec des tampons / estampes ou des codes, puis les évaluer — tout sur le même document. Les jetons … | … Tu peux importer les productions de tes étudiant·es (PDF ou images) … |  | accompagnement.js est très remanié sur lot/parcours-1-et-2 : à revoir à la fusion |

### Accueil (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 148 | `js/accueil.js:188` | Importer des copies | Importer des productions |  | bouton de l'accueil (accueil.js est touché par lot/parcours-1-et-2) |

### Conception › Grilles › critère algorithmique (55)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 149 | `js/atelier-algo.js:74` | Ce que tu relèves sur la copie, et ce à quoi tu rapportes ce compte (des mots, des calculs, des mesures…). Ces noms s’écrivent dans les phrases destinées à l’étudiant·e. | Ce que tu relèves dans la production, et ce à quoi tu rapportes ce compte … |  |  |
| 150 | `js/atelier-algo.js:75` | …rvation). Dans Annoter, la palette les affiche pour que tu les poses sur la copie, sans les modifier. Chaque code posé compte selon sa pondération.… | … Dans Annoter, la palette les affiche pour que tu les poses sur la production, sans les modifier. … |  |  |
| 151 | `js/atelier-algo.js:78` | Les paliers situent la copie par rapport à la limite que tu fixes, d’après le compte que l’application fait pour toi. | Les paliers situent la production par rapport à la limite que tu fixes … |  |  |
| 152 | `js/atelier-algo.js:79` | Selon la valeur établie sur sa copie, l’étudiant·e reçoit un commentaire précis qui s’adresse à son cas. Ci-dessous, chaque table choisit un seul cas pour l’étudiant·e. La simulation te montre de quel cas il s’agirait. | Selon la valeur établie dans sa production, l’étudiant·e reçoit un commentaire précis … |  |  |
| 153 | `js/atelier-algo.js:81` | Les phrases que l’application écrit à ta place sur chaque copie. Ce que dit chaque cas s’écrit dans l’étape « Cas d’interprétation ». | Les phrases que l’application écrit à ta place pour chaque production. … |  |  |
| 154 | `js/atelier-algo.js:91` | En tête de son bilan, quand la note de ce critère tombe à 0 alors que la copie porte au moins un code. | En tête de son bilan, quand la note de ce critère tombe à 0 alors que la production porte au moins un code. |  |  |
| 155 | `js/atelier-algo.js:92` | Dans son bilan, quand tous les critères de la grille sont acquis et que la copie porte au moins un code. L’application écrit après lui le compte entre parenthèses, puis le point. | Dans son bilan, quand tous les critères de la grille sont acquis et que la production porte au moins un code. … |  |  |
| 156 | `js/atelier-algo.js:93` | S’affiche pour toi seul·e, quand la copie ne porte ni tampon ni code. | S’affiche pour toi seul·e, quand la production ne porte ni tampon ni code. |  |  |
| 157 | `js/atelier-algo.js:101` | La part de la limite atteinte par la copie | La part de la limite atteinte par la production |  |  |
| 158 | `js/atelier-algo.js:108` | L’étudiant·e lit le cas de sa copie sous le critère, après le décompte. Un verdict sans bloc est précédé de la moyenne, sauf au premier cas : « Tu fais en moyenne 1 | L’étudiant·e lit le cas de sa production sous le critère, après le décompte. … |  |  |
| 159 | `js/atelier-algo.js:115` | À côté du palier RàI de l’étudiant·e, jamais sur sa copie. | À côté du palier RàI de l’étudiant·e, jamais dans sa rétroaction. |  | « sur sa copie » voulait dire « dans ce que l'étudiant·e reçoit » : à confirmer |
| 160 | `js/atelier-algo.js:120` | La limite est indépendante de la formule de la note : la note suit la formule, le palier situe la copie par rapport à la limite. | … la note suit la formule, le palier situe la production par rapport à la limite. |  |  |
| 161 | `js/atelier-algo.js:142` | (pour toi, à côté du palier RàI de l’étudiant·e ; rien n’est écrit sur sa copie) | (pour toi, à côté du palier RàI de l’étudiant·e ; rien n’est écrit dans sa rétroaction) |  | comme l'entrée 159 |
| 162 | `js/atelier-algo.js:148` | cas de la copie fictive | cas de la production fictive | BU | la consigne du parcours 8 cite « Sur la copie fictive : … » |
| 164 | `js/atelier-algo.js:165` | Quand la copie porte au moins un code, l’étudiant·e lit le nom du plus fréquent dans son bilan, à la ligne « principalement ». À égalité : | Quand la production porte au moins un code, l’étudiant·e lit le nom du plus fréquent … |  |  |
| 165 | `js/atelier-algo.js:171` | Quand la note de ce critère tombe à 0 alors que la copie porte au moins un code : en tête de son bilan. | Quand la note de ce critère tombe à 0 alors que la production porte au moins un code : en tête de son bilan. |  |  |
| 166 | `js/atelier-algo.js:173` | Quand tous les critères de la grille sont acquis et que la copie porte au moins un code : dans son bilan. | Quand tous les critères de la grille sont acquis et que la production porte au moins un code : dans son bilan. |  |  |
| 167 | `js/atelier-algo.js:175` | Quand la copie ne porte ni tampon ni code : toi seul·e le lis. | Quand la production ne porte ni tampon ni code : toi seul·e le lis. |  |  |
| 168 | `js/atelier-algo.js:182` | Copie fictive | Production fictive | BU | titre de l'atelier ; cité par la consigne du parcours 8 |
| 169 | `js/atelier-algo.js:183` | Copies de référence | Productions de référence | BU | titre de l'atelier ; cité par la consigne du parcours 8 |
| 170 | `js/atelier-algo.js:195` | Si la copie portait au moins un code, dans « Points récurrents » : | Si la production portait au moins un code, dans « Points récurrents » : |  |  |
| 171 | `js/atelier-algo.js:199` | Si la copie ne portait aucun code : | Si la production ne portait aucun code : |  |  |
| 172 | `js/atelier-algo.js:213` | Copie réglée sur le palier « | Production réglée sur le palier « |  |  |
| 173 | `js/atelier-algo.js:214` | Aucune copie n’atteindrait ce palier avec cette limite. | Aucune production n’atteindrait ce palier avec cette limite. |  |  |
| 174 | `js/atelier-algo.js:216` | Copie réglée : les codes | Production réglée : les codes |  |  |
| 175 | `js/atelier-algo.js:218` | Copie réglée : | Production réglée : |  |  |
| 176 | `js/atelier-algo.js:219` | Copie réglée : trois fois le code | Production réglée : trois fois le code |  |  |
| 177 | `js/atelier-algo.js:220` | Copie réglée : aucun code. | Production réglée : aucun code. |  |  |
| 178 | `js/atelier-algo.js:221` | Aucune copie fictive n’atteindrait ce cas. | Aucune production fictive n’atteindrait ce cas. |  |  |
| 179 | `js/atelier-algo.js:230` | L’étudiant·e lit le cas de sa copie sous le critère, après les paliers. Une table neuve naît vide : un cas laissé vide n’ajoute rien à ce que lit l’étudiant·e. | L’étudiant·e lit le cas de sa production sous le critère, après les paliers. … |  |  |
| 180 | `js/atelier-algo.js:243` | cas de la copie fictive | cas de la production fictive | BU | comme l'entrée 162 |
| 220 | `js/composeur-calcul.js:34` | Comme dans un tableur : tu poses les données de la copie, tes nombres et les opérations. Le résultat se voit sur la copie fictive pendant que tu écris. | Comme dans un tableur : tu poses les données de la production, tes nombres et les opérations. Le résultat se voit sur la production fictive pendant que tu écris. |  |  |
| 221 | `js/composeur-calcul.js:52` | Sur la copie fictive : | Sur la production fictive : | BU |  |
| 222 | `js/composeur-calcul.js:53` | Quand une donnée de la copie vaut 0 | Quand une donnée de la production vaut 0 |  |  |
| 238 | `js/evaluation-enonces.js:404` | Le nombre d'erreurs comptées sur la copie, à la correction. | Le nombre d'erreurs comptées dans la production, à la correction. |  | « correction » : la consigne du parcours 8 l'écarte aussi (hors de ce lot) |
| 239 | `js/evaluation-enonces.js:501` | Affiché à l'enseignant·e quand la copie ne porte ni tampon ni erreur. | Affiché à l'enseignant·e quand la production ne porte ni tampon ni erreur. |  |  |
| 240 | `js/evaluation-formules.js:116` | Chaque occurrence retire des points en proportion de la longueur de la copie : le même nombre d’occurrences coûte moins sur une copie plus longue. Tu fixes la longueur sur laquelle une occurrence coûte un point. | … en proportion de la longueur de la production : le même nombre d’occurrences coûte moins dans une production plus longue. … |  | comme l'entrée 26 |
| 241 | `js/evaluation-formules.js:131` | Tu fixes le rapport qui donne la note entière, par exemple une occurrence à chaque 60 mots. Une copie qui l’atteint a la note entière ; en deçà, la note baisse en proportion. Une copie sans occurrence a la note entière. | … Si la production l’atteint, la note est entière ; en deçà, la note baisse en proportion. Sans occurrence, la note est entière. | EV | réécriture au-delà du mot, à juger comme telle (relecture) ; comme l'entrée 27 |
| 242 | `js/evaluation-formules.js:146` | Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la copie. La longueur reste comptée pour les phrases de l’étudiant·e, mais n’entre pas dans la note. | … quelle que soit la longueur de la production. … |  | comme l'entrée 28 |
| 243 | `js/evaluation-projection.js:154` | Le nombre d'erreurs comptées sur la copie, à la correction. | Le nombre d'erreurs comptées dans la production, à la correction. |  |  |
| 244 | `js/evaluation-projection.js:158` | En moyenne, 1 erreur à chaque N mots : c'est ce N. Vide sur une copie sans erreur. | … Vide pour une production sans erreur. |  |  |
| 245 | `js/evaluation-projection.js:160` | Le nombre d'erreurs que la copie ferait sur la longueur de référence, au même rythme. | Le nombre d'erreurs que la production ferait sur la longueur de référence, au même rythme. |  |  |
| 246 | `js/evaluation-projection.js:162` | Le nom du palier que la copie atteint, tel qu'il est écrit dans la colonne « Palier ». | Le nom du palier que la production atteint, … |  |  |
| 247 | `js/evaluation-projection.js:432` | Une phrase courte, dans tes mots : « Aide en français recommandée », « Reprise du module 2 à prévoir »… Elle apparaît à côté du palier RàI de l'étudiant·e, jamais sur sa copie. Laisser vide pour ne lever aucun signalement. | … Elle apparaît à côté du palier RàI de l'étudiant·e, jamais dans sa rétroaction. … |  | comme l'entrée 159 |
| 303 | `js/miroir-algo.js:108` | Donne une pondération à ce critère : l'essai montrera la note de chaque copie. | Donne une pondération à ce critère : l'essai montrera la note de chaque production. | EV | à confirmer : « la note que reçoit chaque production de l'essai » |
| 304 | `js/miroir-algo.js:110` | Sans limite fixée, ces copies ont la longueur fixée dans le calcul : à cette longueur, chaque | Sans limite fixée, ces productions ont la longueur fixée dans le calcul : … |  |  |
| 309 | `js/palette-algo.js:65` | Ces blocs servent à composer les phrases que ce critère écrit seul sur chaque copie. Chaque bloc prend la valeur réelle de la copie évaluée. | Ces blocs servent à composer les phrases que ce critère écrit seul dans chaque évaluation. Chaque bloc prend la valeur réelle de la production évaluée. | EV 2S | les phrases forment la rétroaction, qui est celle de l'évaluation (relecture) |
| 310 | `js/palette-algo.js:67` | Après la flèche : la valeur que le bloc prendrait sur la copie fictive. | Après la flèche : la valeur que le bloc prendrait sur la production fictive. |  |  |
| 311 | `js/palette-algo.js:70` | Ce qui se remplit quand tu évalues la copie | Ce qui se remplit quand tu évalues la production |  |  |
| 312 | `js/palette-algo.js:78` | Ton calcul : sa valeur sur la copie évaluée. | Ton calcul : sa valeur sur la production évaluée. |  |  |
| 313 | `js/palette-algo.js:86` | Le nombre compté sur la copie, à la correction : les codes posés dans Annoter, ou le nombre tapé. | Le nombre compté dans la production, à la correction : … |  |  |
| 314 | `js/palette-algo.js:90` | Le nombre saisi à la correction, copie par copie. | Le nombre saisi à la correction, production par production. |  |  |
| 315 | `js/palette-algo.js:116` | Le nom court du palier que la copie atteint. | Le nom court du palier que la production atteint. |  |  |
| 316 | `js/palette-algo.js:120` | Ce que la copie compterait sur la longueur de référence, au même rythme. | Ce que la production compterait sur la longueur de référence, au même rythme. |  |  |
| 451 | `js/tables-cas-algo.js:93` | la copie ne porte aucune occurrence | la production ne porte aucune occurrence |  | table de cas d'un critère algorithmique |

### Codex (23)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 192 | `js/codex.js:1164` | copie ⟂ copies | N production(s) sur M |  | bilan d'un codex rouvert : les fichiers qui n'ont pas pu revenir |
| 193 | `js/codex.js:1173` | cette copie ⟂ ces copies | Pour retrouver cette production / ces productions : … |  |  |
| 194 | `js/codex.js:1205` | cette copie ⟂ ces copies | Pour retrouver cette production / ces productions : … |  |  |
| 195 | `js/codex.js:1244` | Ce codex n'aura pas toutes tes copies | Ce codex n'aura pas toutes les productions de tes étudiant·es | 2S VA | « tes productions » serait les tiennes ; mots acceptés par Grégoire le 2 oct. (#1012) |
| 196 | `js/codex.js:1248` | Écrire sans cette copie ⟂ Écrire sans ces copies | Écrire sans cette production / Écrire sans ces productions | VA | bouton ; #1012 |
| 197 | `js/codex.js:1262` | Cette sélection n'aura pas toutes ses copies | Cette sélection n'aura pas toutes ses productions | VA | #1012 |
| 198 | `js/codex.js:1264` | Écrire sans cette copie ⟂ Écrire sans ces copies | Écrire sans cette production / Écrire sans ces productions | VA | #1012 |
| 199 | `js/codex.js:1271` | copie ⟂ copies | N production(s) sur M n'est pas / ne sont pas dans l'application. … | VA | #1012 |
| 200 | `js/codex.js:2180` | copie ⟂ copies | production / productions |  | compte de la fusion de deux codex (MOTS_DES_ELEMENTS) |
| 201 | `js/codex.js:2181` | copie à la corbeille ⟂ copies à la corbeille | production à la corbeille / productions à la corbeille |  |  |
| 202 | `js/codex.js:2182` | copie de modélisation ⟂ copies de modélisation | production de modélisation / productions de modélisation |  | les productions d'exemple que tu montres en classe |
| 203 | `js/codex.js:2771` | Les copies aux archives ici ne sont pas reprises. | Les productions aux archives ici ne sont pas reprises. |  |  |
| 207 | `js/codex.js:3836` | Retirer ces copies les efface pour de bon. | Retirer ces productions de tes étudiant·es les efface pour de bon. | 2S | l'entrée voisine « Supprimer cette production » parle de ta fiche ; ici, ce sont les fichiers déjà exportés qu'on retire (relecture) |
| 208 | `js/codex.js:3857` | Supprimer cette copie l'efface pour de bon. | Supprimer cette production l'efface pour de bon. |  |  |
| 209 | `js/codex.js:3858` | Vider la corbeille efface pour de bon ces copies. | Vider la corbeille efface pour de bon ces productions. |  |  |
| 210 | `js/codex.js:3863` | Fusionner ces copies efface pour de bon celles qui sont absorbées. | Fusionner ces productions efface pour de bon celles qui sont absorbées. |  |  |
| 211 | `js/codex.js:3864` | Supprimer cette copie l'efface pour de bon. | Supprimer cette production l'efface pour de bon. |  |  |
| 213 | `js/codex.js:3891` | Réparer cette copie remplace son fichier par le fichier réparé. | Réparer ce fichier le remplace par le fichier réparé. | FI | comme les entrées 490, 491, 494 |
| 214 | `js/codex.js:4100` | fichiers de copies reçus. ⟂ fichier de copie reçu. | N fichiers de productions reçus. / 1 fichier de production reçu. |  |  |
| 215 | `js/codex.js:4103` | fichier(s) de copie non reçu(s) : leur copie est dite « manquante ». | N fichier(s) de production non reçu(s) : leur production est dite « manquante ». |  |  |
| 216 | `js/codex.js:4106` | Les copies aux archives ici n'ont pas été reprises de l'autre codex. | Les productions aux archives ici n'ont pas été reprises de l'autre codex. |  |  |
| 217 | `js/codex.js:4196` | Import des fichiers des copies… | Import des fichiers des productions… |  |  |
| 218 | `js/codex.js:4342` | Fichiers de copies à recevoir : | Fichiers de productions à recevoir : |  |  |

### Démo (10)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 224 | `js/demo-activation.js:503` | Attends la fin de l'import des copies avant d'entrer dans la démo. | Attends la fin de l'import des productions avant d'entrer dans la démo. |  |  |
| 225 | `js/demo-activation.js:504` | Attends la fin de l'import des copies avant de quitter la démo. | Attends la fin de l'import des productions avant de quitter la démo. |  |  |
| 226 | `js/demo-activation.js:677` | Retirer la copie ⟂ Retirer les copies | Retirer la production importée / Retirer les productions importées |  | bouton du bandeau démo |
| 227 | `js/demo-activation.js:678` | Retirer la copie importée dans la démo ? ⟂ copies importées dans la démo ? | Retirer la production importée dans la démo ? / les N productions importées dans la démo ? |  |  |
| 228 | `js/demo-activation.js:679` | Tes vraies copies et tes données ne sont pas touchées. | Les productions de tes étudiant·es et tes données ne sont pas touchées. | 2S | « tes vraies productions » serait les tiennes |
| 229 | `js/demo-activation.js:707` | Retirer les copies | Retirer les productions importées |  | libellé initial du bouton |
| 261 | `js/guidage-demo.js:47` | Une rangée par copie attendue, avec son statut, sa note et ses jetons. Les filtres « Production » et « Statut » et la recherche resserrent la liste ; le menu « Actions » d'une rangée n'offre que ce que la copie permet. La démo por… | Une rangée par étudiant·e et par production, avec son statut, sa note et ses jetons. … le menu « Actions » d'une rangée n'offre que ce que la rangée permet. … | 2S | visite de la démo ; comme l'entrée 40 |
| 262 | `js/guidage-demo.js:51` | …lage des pages) et associe chacun à une production. La démo ne livre aucune copie ; ce que tu importes ici, « Retirer les copies » (bandeau vert) l'efface.… | … La démo ne livre aucune production remise ; ce que tu importes ici, « Retirer les productions importées » (bandeau vert) l'efface. | 2S | la démo livre onze productions (les tiennes), aucune remise |
| 263 | `js/guidage-demo.js:55` | Annote les copies à l'écran, appose des tampons, puis évalue-les selon la grille : « Actions ▾ » passe d'« Annoter » à « Évaluer ». Pour annoter dans la démo, importe d'abord une copie : le pack n'en livre aucune. | Annote les productions à l'écran … Pour annoter dans la démo, importe d'abord une production remise : le pack n'en livre aucune. | 2S |  |
| 264 | `js/guidage-demo.js:59` | Sors tes copies et tes évaluations de l'application : un ZIP pour tout le groupe, une production ou un·e étudiant·e, ou l'« Export Léa », un PDF à téléverser dans Léa. | Sors les productions de tes étudiant·es et tes évaluations de l'application : … | 2S |  |

### Réglages › Données (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 231 | `js/donnees-v2.js:1181` | copie(s) y sont rattachées | N production(s) remise(s) y sont rattachées | 2S | avant de supprimer une production : « N productions y sont rattachées » se lirait comme d'autres productions à toi |

### Évaluation › Évaluer (8)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 234 | `js/evaluation-chargement.js:1624` | Remplacer les commentaires de cette copie par ceux de la cartouche « | Remplacer les commentaires de cette évaluation par ceux de la cartouche « | EV |  |
| 235 | `js/evaluation-chargement.js:1625` | Les retouches faites à la main dans la rétroaction de cette copie seront perdues. | Les retouches faites à la main dans la rétroaction de cette évaluation seront perdues. | EV |  |
| 236 | `js/evaluation-chargement.js:2151` | L'évaluation garde ce qui a été enregistré. La note se recalcule sur la grille actuelle dès que tu modifies cette copie. | … La note se recalcule sur la grille actuelle dès que tu modifies cette évaluation. | EV |  |
| 237 | `js/evaluation-chargement.js:2186` | et reste valable : le PDF de l'étudiant·e conclut normalement. Si tu modifies cette copie, il faudra | … Si tu modifies cette évaluation, il faudra … | EV |  |
| 250 | `js/evaluation-sauvegarde.js:577` | Ton évaluation est gardée, mais la copie montre « Non recevable » au lieu de sa note et de ses niveaux, | Ton évaluation est gardée, mais l'évaluation montre « Non recevable » au lieu de sa note et de ses niveaux, | EV A | comme l'entrée 56 |
| 251 | `js/evaluation-sauvegarde.js:762` | Copie incomplète | Production incomplète |  | titre d'un avis au verrouillage |
| 252 | `js/evaluation-sauvegarde.js:763` | Une copie « Incomplet ; travail en cours » ne se verrouille pas : décoche la case pour évaluer la copie terminée. | Une évaluation « Incomplet ; travail en cours » ne se verrouille pas : décoche la case pour évaluer la production terminée. | EV |  |
| 253 | `js/evaluation.js:2556` | n’apparaît pas au calendrier et ses copies ne comptent pas dans les courbes de progression. | … n’apparaît pas au calendrier et ses évaluations ne comptent pas dans les courbes de progression. | EV 2S | « ses copies » : celles des étudiant·es pour cette production |

### Guides pédagogiques (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 267 | `js/guides-pedagogiques.js:184` | …n évaluée, quand le groupe permet d'en juger (un travail dû et au moins une copie du groupe évaluée). Tant que rien n'est jugeable, l'app affiche «&nbsp;Données insuffisantes&nbsp;» plutôt qu'un pattern. L'app surveille …… | … (un travail dû et au moins une production du groupe évaluée). |  | comme l'entrée 63 |

### Rappel « Mets ton codex à jour » (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 305 | `js/modal-backup-reminder.js:218` | …ées de sites, changes de navigateur ou d'ordinateur. Ton codex en garde une copie complète, copies de tes étudiant·es comprises, que tu rouvres sur n'importe quel appareil. <div style="disp…… | Ton codex en garde une copie complète, productions de tes étudiant·es comprises, que tu rouvres sur n'importe quel appareil. | POSÉ | texte validé le 8 nov. à 12 h 48, posé mot pour mot cette nuit |

### Conception › Pratiques (2)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 342 | `js/pratiques/construction-attributs.js:128` | La reprise prend la place de la copie d'origine dans la note | La reprise prend la place de l'évaluation d'origine dans la note | EV | réglage d'une pratique (Construction de la note) |
| 499 | `js/wizard-pratique-v2.js:416` | Sur une copie corrigée, tu inscris le plus souvent… | Sur une production évaluée, tu inscris le plus souvent… |  | « corrigée » : les consignes des parcours 8 et 9 écartent « corriger » (hors de ce lot) |

### Suivi › Profil (3)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 344 | `js/profil-etudiant-calculs.js:2039` | la note de passage (tes copies n'ont pas d'échelle unique) | la note de passage (tes évaluations n'ont pas d'échelle unique) | EV 2S | profil de l'étudiant·e ; « tes productions » serait les tiennes |
| 345 | `js/profil-etudiant-calculs.js:2040` | aucune-copie ⟂ la note de passage (aucune échelle de tes copies ne le fixe encore) | la note de passage (aucune échelle de tes évaluations ne le fixe encore) | EV 2S |  |
| 346 | `js/profil-etudiant-calculs.js:2041` | la note de passage (aucune échelle de tes copies ne le fixe encore) | la note de passage (aucune échelle de tes évaluations ne le fixe encore) | EV 2S |  |

### Réglages › Données › Archives (78)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 363 | `js/reserve-copies.js:84` | Les annotations restent aussi, mais ne se voient qu'avec leur copie. | Les annotations restent aussi, mais ne se voient qu'avec leur production. |  | Archives : retirer les fichiers d'un trimestre |
| 364 | `js/reserve-copies.js:88` | Archiver les copies… | Archiver les productions remises… | 2S | menu ⋮ d'un trimestre ; « les productions de ce trimestre » seraient les tiennes, qui restent |
| 365 | `js/reserve-copies.js:89` | Retirer de l'application les copies de ce trimestre : son archive vérifiée les garde, ses données restent | Retirer de l'application les productions remises de ce trimestre : son archive vérifiée les garde, ses données restent | 2S |  |
| 366 | `js/reserve-copies.js:91` | Archivage des copies… | Archivage des productions remises… |  |  |
| 367 | `js/reserve-copies.js:93` | Archiver les copies de | Archiver les productions remises de <trimestre> ? | 2S |  |
| 368 | `js/reserve-copies.js:96` | copie quittera ⟂ copies quitteront | N production quittera / N productions quitteront l'application, environ … |  |  |
| 369 | `js/reserve-copies.js:99` | Garde bien cette archive : c'est elle qui conserve les copies. | Garde bien cette archive : c'est elle qui conserve les productions. |  |  |
| 370 | `js/reserve-copies.js:101` | copie d'un·e étudiant·e supprimé·e reste ⟂ copies d'étudiant·es supprimé·es restent | N production d'un·e étudiant·e supprimé·e reste / productions d'étudiant·es supprimé·es restent dans l'application. |  |  |
| 371 | `js/reserve-copies.js:104` | Archiver les copies | Archiver les productions remises | 2S | bouton de confirmation |
| 372 | `js/reserve-copies.js:107` | Des copies de | Des productions remises de <trimestre> ont changé depuis son archive | 2S |  |
| 373 | `js/reserve-copies.js:110` | copie ajoutée ⟂ copies ajoutées | production ajoutée / productions ajoutées |  |  |
| 374 | `js/reserve-copies.js:111` | copie modifiée ⟂ copies modifiées | production modifiée / productions modifiées |  |  |
| 375 | `js/reserve-copies.js:114` | Pour archiver ses copies : archive le trimestre de nouveau, vérifie la nouvelle archive, puis archive ses copies. | Pour archiver ses productions remises : archive le trimestre de nouveau, vérifie la nouvelle archive, puis archive ses productions remises. | 2S |  |
| 376 | `js/reserve-copies.js:119` | Les copies de | Les productions remises de <trimestre> sont aux archives | 2S |  |
| 377 | `js/reserve-copies.js:121` | copie retirée ⟂ copies retirées | production retirée / productions retirées |  |  |
| 378 | `js/reserve-copies.js:123` | Pour faire revenir les copies : | Pour faire revenir les productions : … |  |  |
| 379 | `js/reserve-copies.js:127` | Archivage des copies inachevé | Archivage des productions remises inachevé |  |  |
| 380 | `js/reserve-copies.js:129` | L'archivage des copies de | L'archivage des productions remises de <trimestre> s'est arrêté en cours de route. … | 2S |  |
| 381 | `js/reserve-copies.js:135` | Copies non archivées | Productions non archivées |  |  |
| 382 | `js/reserve-copies.js:136` | Ce trimestre n'a plus de copie dans l'application : il n'y a rien à archiver. | Ce trimestre n'a plus de production remise dans l'application : il n'y a rien à archiver. | 2S |  |
| 383 | `js/reserve-copies.js:144` | Copie aux archives : sa note, sa grille, sa rétroaction et ses annotations restent dans l'application | Production aux archives : son évaluation (note, grille, rétroaction) et ses annotations restent dans l'application | EV | infobulle du badge « ARC » |
| 384 | `js/reserve-copies.js:146` | Cette copie est aux archives. | Cette production est aux archives. |  |  |
| 385 | `js/reserve-copies.js:147` | Ses résultats, sa grille et sa rétroaction restent dans l'application ; ses annotations aussi, mais elles ne se voient qu'avec la copie. | Son évaluation (résultats, grille, rétroaction) reste dans l'application ; ses annotations aussi, mais elles ne se voient qu'avec la production. | EV |  |
| 386 | `js/reserve-copies.js:148` | Pour la revoir : fais revenir les copies de | Pour la revoir : fais revenir les productions remises de <trimestre> (…). | 2S |  |
| 387 | `js/reserve-copies.js:153` | Cette copie est aux archives : le dossier ne contient que la synthèse (note, grille, rétroaction). | Cette production est aux archives : le dossier ne contient que la synthèse (note, grille, rétroaction). |  | avis à l'enseignant·e à l'export du dossier PDF (travaux-export-pdf.js:844) |
| 388 | `js/reserve-copies.js:155` | Cette copie est aux archives. | Cette production est aux archives. |  | aperçu du PDF annoté |
| 389 | `js/reserve-copies.js:157` | Cette copie est aux archives : fais-la revenir avant de modifier ses pages. | Cette production est aux archives : fais-la revenir avant de modifier ses pages. |  |  |
| 390 | `js/reserve-copies.js:165` | Les copies de | Les productions remises de <trimestre> sont aux archives : une nouvelle archive ne les contiendrait pas, … | 2S |  |
| 391 | `js/reserve-emprunter.js:80` | copie ⟂ copies | <trimestre> revient dans l'application tel qu'il a été archivé, clos : N étudiant·es, N productions remises. | 2S | le trimestre emporte aussi tes productions : « N productions » se lirait comme les tiennes |
| 392 | `js/reserve-emprunter.js:89` | copie revenue ⟂ copies revenues | production revenue / productions revenues |  |  |
| 393 | `js/reserve-emprunter.js:90` | copie déjà là ⟂ copies déjà là | production déjà là / productions déjà là |  |  |
| 394 | `js/reserve-emprunter.js:91` | copie d'un·e étudiant·e supprimé·e, laissée dans l'archive ⟂ copies d'étudiant·es supprimé·es, laissées dans l'archive | production d'un·e étudiant·e supprimé·e, laissée dans l'archive / productions d'étudiant·es supprimé·es, laissées dans l'archive |  |  |
| 395 | `js/reserve-emprunter.js:92` | fiche sans copie dans l'archive ⟂ fiches sans copie dans l'archive | fiche sans production dans l'archive / fiches sans production dans l'archive |  |  |
| 396 | `js/reserve-emprunter.js:101` | Une séance ou une copie de | Une séance ou une production remise de <trimestre> est déjà dans l'application et ne concorde pas avec l'archive. … | 2S |  |
| 397 | `js/reserve-emprunter.js:106` | Le stockage des copies n'est pas disponible dans cette page. | Le stockage des productions n'est pas disponible dans cette page. | FI? | message technique : « des fichiers » serait plus exact |
| 398 | `js/reserve-emprunter.js:113` | copie ⟂ copies | … N données et N productions restent. |  |  |
| 399 | `js/reserve-emprunter.js:115` | une copie de l'archive ne concorde pas avec son empreinte | une production de l'archive ne concorde pas avec son empreinte | FI? |  |
| 403 | `js/reserve-reglages.js:73` | title="Relire cette archive, copie par copie"> | Relire cette archive, production par production |  | infobulle du bouton « Vérifier » |
| 404 | `js/reserve-renvoyer.js:87` | copie ⟂ copies | <trimestre> quittera l'application : N étudiant·es, N productions remises, environ … | 2S | comme l'entrée 391 |
| 405 | `js/reserve-renvoyer.js:100` | copie ajoutée ⟂ copies ajoutées | production ajoutée / productions ajoutées |  |  |
| 406 | `js/reserve-renvoyer.js:101` | copie modifiée ⟂ copies modifiées | production modifiée / productions modifiées |  |  |
| 407 | `js/reserve-renvoyer.js:118` | copie retirée ⟂ copies retirées | production retirée / productions retirées |  |  |
| 408 | `js/reserve-renvoyer.js:146` | Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau. | Son archive a changé depuis sa vérification, ou une production y est illisible. … | FI? | « un fichier y est illisible » serait plus exact |
| 409 | `js/reserve-renvoyer.js:147` | Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau. | Son archive a changé depuis sa vérification, ou une production y est illisible. … | FI? |  |
| 410 | `js/reserve-renvoyer.js:151` | Le stockage des copies n'est pas disponible dans cette page. | Le stockage des productions n'est pas disponible dans cette page. | FI? |  |
| 411 | `js/reserve-revenir.js:56` | Remettre dans l'application les copies de cette archive | Ramener dans l'application les productions remises de cette archive | 2S | « Remettre… les productions remises » faisait écho (relecture) |
| 412 | `js/reserve-revenir.js:57` | Retour des copies… | Retour des productions remises… | 2S | tout le module dit « productions remises » quand il nomme l'ensemble |
| 413 | `js/reserve-revenir.js:58` | copies sur | N productions sur M |  |  |
| 414 | `js/reserve-revenir.js:60` | Faire revenir les copies | Faire revenir les productions remises | 2S | titre de la fenêtre |
| 415 | `js/reserve-revenir.js:62` | Les copies de cette archive ( | Les productions remises de cette archive (M) reviennent sous leurs fiches, quand le fichier n'est plus dans l'application. | 2S |  |
| 416 | `js/reserve-revenir.js:63` | Rien n'est remplacé ni effacé : une copie déjà là, ou qui a changé depuis l'archive, reste telle quelle. | Rien n'est remplacé ni effacé : une production déjà là, ou qui a changé depuis l'archive, reste telle quelle. |  |  |
| 417 | `js/reserve-revenir.js:68` | Copies revenues | Productions revenues |  |  |
| 418 | `js/reserve-revenir.js:69` | Copies revenues, archive abîmée | Productions revenues, archive abîmée |  |  |
| 419 | `js/reserve-revenir.js:70` | copies de l'archive sont abîmées ⟂ copie de l'archive est abîmée | N productions de l'archive sont abîmées / 1 production de l'archive est abîmée | FI? |  |
| 420 | `js/reserve-revenir.js:71` | copies revenues ⟂ copie revenue | N productions revenues / 1 production revenue |  |  |
| 421 | `js/reserve-revenir.js:72` | copies déjà là ⟂ copie déjà là | N productions déjà là / 1 production déjà là |  |  |
| 422 | `js/reserve-revenir.js:73` | copies changées depuis l'archive, laissées telles quelles ⟂ copie changée depuis l'archive, laissée telle quelle | productions changées depuis l'archive, laissées telles quelles / production changée …, laissée telle quelle |  |  |
| 423 | `js/reserve-revenir.js:74` | copies sans fiche dans l'application ⟂ copie sans fiche dans l'application | productions sans fiche dans l'application / production sans fiche dans l'application |  |  |
| 424 | `js/reserve-revenir.js:75` | copies d'étudiant·es supprimé·es ⟂ copie d'un·e étudiant·e supprimé·e | productions d'étudiant·es supprimé·es / production d'un·e étudiant·e supprimé·e |  |  |
| 425 | `js/reserve-revenir.js:76` | copies n'ont pas pu être écrites ⟂ copie n'a pas pu être écrite | productions n'ont pas pu être écrites / production n'a pas pu être écrite | FI? |  |
| 426 | `js/reserve-revenir.js:79` | Impossible de faire revenir les copies | Impossible de faire revenir les productions remises | 2S |  |
| 427 | `js/reserve-revenir.js:82` | Cette archive date d'avant les empreintes : ses copies ne peuvent pas revenir. Archive de nouveau ce groupe. | Cette archive date d'avant les empreintes : ses productions remises ne peuvent pas revenir. … | 2S |  |
| 428 | `js/reserve-revenir.js:83` | Le stockage des copies n'est pas disponible dans cette page. | Le stockage des productions remises n'est pas disponible dans cette page. | 2S FI? |  |
| 430 | `js/reserve-trimestre.js:61` | copie | L'archive emporte tout le trimestre : N étudiant·es, N groupes, N productions remises (dont N à la corbeille), … | 2S |  |
| 431 | `js/reserve-trimestre.js:69` | copie(s) : | Trimestre archivé : N étudiant·es, N production(s) remise(s) : <chemin> | 2S |  |
| 432 | `js/reserve-trimestre.js:72` | copie(s) ( | Trimestre archivé : fichier téléchargé : N étudiant·es, N production(s) remise(s) (taille) | 2S |  |
| 433 | `js/reserve-trimestre.js:206` | Empreintes des copies… | Empreintes des productions… |  | barre de progression |
| 434 | `js/reserve-verifier.js:62` | copies sur | N productions sur M |  |  |
| 435 | `js/reserve-verifier.js:65` | copies sont présentes et intactes, et les données concordent. | Les M productions sont présentes et intactes, et les données concordent. |  |  |
| 436 | `js/reserve-verifier.js:69` | copies sur | N productions sur M manquent ou ne concordent pas. … |  |  |
| 437 | `js/reserve-verifier.js:73` | Cette archive date d'avant les empreintes : elle ne peut pas être vérifiée copie par copie. Archive de nouveau ce groupe. | … elle ne peut pas être vérifiée production par production. … |  |  |
| 438 | `js/reserve-verifier.js:82` | copie | N production(s) absente(s) / tronquée(s) / altérée(s) / illisible(s) | FI? | « N fichiers tronqués » serait plus exact |
| 439 | `js/reserve-verifier.js:85` | du groupe sans copie dans l'archive | N fiche(s) du groupe sans production dans l'archive |  |  |
| 440 | `js/reserve-verifier.js:97` | copies et les données du trimestre sont présentes et intactes. | Les M productions remises et les données du trimestre sont présentes et intactes. | 2S VA | texte accepté par Grégoire (E1, 4 oct.) |
| 441 | `js/reserve-verifier.js:98` | copies sur | N productions remises sur M manquent ou ne concordent pas. … | 2S VA |  |
| 442 | `js/reserve-verifier.js:102` | du trimestre sans copie dans l'archive | N fiche(s) du trimestre sans production dans l'archive | VA |  |
| 443 | `js/reserve-verifier.js:107` | copies, | N productions, taille (compte et taille seulement, sans valoir vérification). |  |  |
| 444 | `js/reserve.js:198` | copies | productions |  | nom de la catégorie dans les comptes de la Réserve (à vérifier où il s'affiche) |

### Rythme (2)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 446 | `js/rythme.js:1081` | copies · | ~N productions · |  | Rythme : la charge d'une tâche d'évaluation |
| 447 | `js/rythme.js:1228` | — les copies seront encore là lundi. | Évaluation un samedi — les productions seront encore là lundi. |  |  |

### PDF de rétroaction (étudiant·e) (2)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 448 | `js/synthese-retroaction-rendu.js:441` | Cette copie n’a pas de niveau général | Cette évaluation n’a pas de niveau général | EV ÉL | imprimé sur le PDF de rétroaction que reçoit l'étudiant·e (le commentaire du code le dit : « texte que ses élèves reçoivent ») |
| 449 | `js/synthese-retroaction-rendu.js:470` | Note de la copie : | Note de l'évaluation : | EV ÉL | imprimé sur le PDF de rétroaction, bandeau « Niveau général » |

### Tableau de bord (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 450 | `js/tableau-bord-apercu.js:1604` | Les copies de ce groupe n'ont pas d'échelle unique ⟂ Les copies de ce groupe sont notées sans échelle | Les évaluations de ce groupe n'ont pas d'échelle unique / Les évaluations de ce groupe sont faites sans échelle | EV | tableau de bord |

### Évaluation › Annoter (12)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 452 | `js/travaux-annotation.js:3470` | Annoter la copie | Annoter la production |  |  |
| 457 | `js/travaux-outils.js:619` | Les codes de cette copie viennent de sa grille « | Les codes de cette production viennent de sa grille « |  |  |
| 458 | `js/travaux-outils.js:4020` | Ces dix codes servent à toute copie dont la grille ne porte pas ses propres codes (une grille active les siens dans Conception, sous son critère algorithmique). Ces textes apparaîtront dans la rétroaction générée pour l'étudiant·e… | Ces dix codes servent à toute production dont la grille ne porte pas ses propres codes … |  |  |
| 459 | `js/travaux-reference.js:31` | Copie de référence | Production de référence | BU | titre du panneau ; la consigne cite « Actions › Copie de référence » |
| 460 | `js/travaux-reference.js:33` | Choisir une copie… | Choisir une production… |  |  |
| 461 | `js/travaux-reference.js:38` | Fermer la copie de référence | Fermer la production de référence |  |  |
| 462 | `js/travaux-reference.js:39` | Aucune autre copie de cette production. | Aucun autre fichier pour cette production. | FI | compte aussi l'original d'une reprise du même étudiant·e : « aucun·e autre étudiant·e n'a remis » affirmait une non-remise (relecture) |
| 463 | `js/travaux-reference.js:40` | Choisis la copie à mettre en regard. | Choisis la production à mettre en regard. |  |  |
| 464 | `js/travaux-reference.js:41` | Cette copie ne s’ouvre pas ici. | Cette production ne s’ouvre pas ici. |  |  |
| 492 | `js/travaux-visionneuse.js:208` | Le fichier de cette copie est introuvable. | Le fichier de cette production est introuvable. |  | visionneuse |
| 493 | `js/travaux-visionneuse.js:248` | Une page de cette copie s'affiche blanche : sa photo est encore dans le fichier, mais mal enregistrée. | Une page de cette production s'affiche blanche : sa photo est encore dans le fichier, mais mal enregistrée. |  |  |
| 494 | `js/travaux-visionneuse.js:249` | Réparer la copie | Réparer le fichier | FI | bouton de la visionneuse |

### Évaluation › Exporter (4)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 453 | `js/travaux-archivage.js:836` | copie(s) livrée(s) SANS leur page de rétroaction : | N production(s) livrée(s) SANS leur page de rétroaction : |  | bilan d'un export |
| 454 | `js/travaux-export-pdf.js:722` | aucune évaluation enregistrée pour cette copie | aucune évaluation enregistrée pour cette production |  |  |
| 455 | `js/travaux-export-pdf.js:740` | la note de cette copie ne porte pas sur toute la grille ( | la note de cette évaluation ne porte pas sur toute la grille (…) | EV |  |
| 456 | `js/travaux-export-pdf.js:936` | Aucune copie ni évaluation enregistrée pour cet·te étudiant·e et cette production. | Aucun fichier ni évaluation enregistrés pour cet·te étudiant·e et cette production. | 2S FI | « aucune production … pour cette production » |

### Évaluation › Préparer et Annoter (25)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 465 | `js/travaux-ui.js:939` | &#x1F4DD; Prépare et importe les copies de tes étudiant·es Dépose les copies numérisées (PDF ou images) : le processus les optimise, regroupe les pages d'une même copie et les associe à une production, pr… | Prépare et importe les productions de tes étudiant·es / Dépose les productions numérisées (PDF ou images) : le processus les optimise, regroupe les pages d'une même production … |  | écran vide de Préparer |
| 466 | `js/travaux-ui.js:1114` | Aucune copie à afficher : celles de ce groupe appartiennent à des étudiant·es supprimé·es. | Aucune production à afficher : celles de ce groupe appartiennent à des étudiant·es supprimé·es. |  |  |
| 467 | `js/travaux-ui.js:1259` | …item-vert" id="travaux-btn-evaluer" data-action="travauxUI.basculerMode" data-param="evaluer">Évaluer Copie de référence <div class="actions… | Production de référence | BU | menu « Actions » d'Annoter (le commentaire HTML voisin n'est pas affiché) |
| 469 | `js/travaux-ui.js:1996` | >Réunir en une copie | Réunir en une production | BU | bouton de l'étape « Optimisation » ; cité par la consigne du parcours 4 |
| 470 | `js/travaux-ui.js:2045` | " aria-label="Cocher pour réunir en une copie" data-stop data-action="travauxUI.cocherPourReunir" data-param=" | Cocher pour réunir en une production |  | libellé accessible de la case |
| 471 | `js/travaux-ui.js:2183` | Copie de | Production en N fichiers |  |  |
| 472 | `js/travaux-ui.js:2217` | Production de cette copie | Production de ces fichiers | 2S | « Production de cette copie » : on choisit la production (la tienne) à laquelle se rattachent ces fichiers |
| 473 | `js/travaux-ui.js:4019` | 1 copie porte une marque d'exportation antérieure au 16 septembre 2026, que l'application ne garantit pas. Elle n'est pas proposée : exporte-la de nouveau si tu veux la retirer. | 1 production porte une marque d'exportation antérieure au 16 septembre 2026, … Elle n'est pas proposée : exporte-la de nouveau si tu veux la retirer. |  | libérer de l'espace |
| 474 | `js/travaux-ui.js:4020` | copies portent une marque d'exportation antérieure au 16 septembre 2026, que l'application ne garantit pas. Elles ne sont pas proposées : exporte-les de nouveau si tu veux les retirer. | N productions portent une marque d'exportation … Elles ne sont pas proposées : … |  |  |
| 475 | `js/travaux-ui.js:4024` | Aucune copie de ce groupe n'a encore été exportée : les retirer les perdrait. Exporte-les d'abord dans « Exporter les travaux », puis reviens ici. | Aucune production de ce groupe n'a encore été exportée : les retirer les perdrait. … |  |  |
| 476 | `js/travaux-ui.js:4046` | 1 de ces copies est évaluée. Son évaluation reste : la note, la grille et la rétroaction ne bougent pas. Seule la copie annotée ne s'ouvrira plus ici. | 1 de ces productions est évaluée. Son évaluation reste : … Seule la production annotée ne s'ouvrira plus ici. |  |  |
| 477 | `js/travaux-ui.js:4047` | de ces copies sont évaluées. Leur évaluation reste : la note, la grille et la rétroaction ne bougent pas. Seule la copie annotée ne s'ouvrira plus ici. | N de ces productions sont évaluées. Leur évaluation reste : … Seule la production annotée ne s'ouvrira plus ici. |  |  |
| 478 | `js/travaux-ui.js:4052` | Cette copie a déjà été exportée : son fichier existe ailleurs, sur ton ordinateur. La retirer d'ici libère de l'espace tout de suite. Les copies qui n'ont pas encore été exportées ne sont jamais proposées. | Cette production a déjà été exportée : son fichier existe ailleurs, sur ton ordinateur. … Les productions qui n'ont pas encore été exportées ne sont jamais proposées. |  |  |
| 479 | `js/travaux-ui.js:4053` | Ces copies ont déjà été exportées : leur fichier existe ailleurs, sur ton ordinateur. Les retirer d'ici libère de l'espace tout de suite. Les copies qui n'ont pas encore été exportées ne sont jamais proposées. | Ces productions ont déjà été exportées : … Les productions qui n'ont pas encore été exportées ne sont jamais proposées. |  |  |
| 480 | `js/travaux-ui.js:4064` | Retirer cette copie ( ⟂ copies ( | Retirer cette production (…) / ces productions (…) |  |  |
| 481 | `js/travaux-ui.js:4069` | 1 copie retirée ⟂ copies retirées | 1 production retirée / N productions retirées |  |  |
| 482 | `js/travaux-ui.js:4070` | copies retirées sur | N productions retirées sur M |  |  |
| 483 | `js/travaux-ui.js:4274` | …ront importés sans élève. Choisis l'étudiant·e dans l'inspecteur ; pour une copie en plusieurs fichiers, coche-les dans « Originaux », puis « Réunir en une copie ».… | … pour une production en plusieurs fichiers, coche-les dans « Originaux », puis « Réunir en une production ». | BU |  |
| 484 | `js/travaux-ui.js:4368` | copie(s) seront créées | N production(s) remise(s) seront créées …, à partir de N fichiers : | 2S | confirmation d'import : « N productions seront créées » se lirait comme de nouvelles productions dans Conception |
| 486 | `js/travaux-ui.js:4543` | aucune évaluation à reprendre, la copie devient l’original pour : | aucune évaluation à reprendre, la production devient l’original pour : |  |  |
| 487 | `js/travaux-ui.js:5319` | » n’aura plus de copie liée | « … » n’aura plus de fichier lié | FI |  |
| 488 | `js/travaux-ui.js:5885` | La copie garde son étudiant·e et sa production. | Le fichier garde son étudiant·e et sa production. | 2S FI |  |
| 489 | `js/travaux-ui.js:6577` | Le fichier de cette copie est introuvable : elle ne peut pas être fusionnée. | Le fichier de cette production est introuvable : elle ne peut pas être fusionnée. |  |  |
| 490 | `js/travaux-ui.js:7163` | Copie réparée : la page s'affiche de nouveau. | Fichier réparé : la page s'affiche de nouveau. | FI |  |
| 491 | `js/travaux-ui.js:7164` | Cette copie ne peut pas être réparée ici. Rien n'a été modifié. | Ce fichier ne peut pas être réparé ici. Rien n'a été modifié. | FI |  |

### Cadre › Trimestre (1)

| n° | Où | Texte actuel | Texte proposé | Drapeaux | Note |
|---|---|---|---|---|---|
| 497 | `js/trimestre-v2-etudiants.js:911` | copie ⟂ copies | • N production(s) |  | avant de supprimer un·e étudiant·e : ce qui part avec sa fiche |

## 5. Les occurrences (b) : une sauvegarde ou un double, à garder (87)

| n° | Où | Extrait | Pourquoi |
|---|---|---|---|
| 2 | Conception › Productions, `index.html:4488` | Créer une copie de cette production | « Dupliquer » une production : ici « production » est la tienne |
| 4 | Conception › Grilles, `index.html:4812` | Créer une copie de cette grille | double ou sauvegarde : reste |
| 5 | Conception › Échelles, `index.html:5006` | Créer une copie de cette échelle | double ou sauvegarde : reste |
| 6 | Conception › Rétroactions, `index.html:5130` | Créer une copie de cette cartouche | double ou sauvegarde : reste |
| 36 | Aide › Conception, `index.html:10458` | …d'une cartouche enregistrée en fait une copie pour la nouvelle grille, après une question ; l'originale reste telle quel… | cartouche dupliquée pour une autre grille |
| 64 | Aide › Labo, `index.html:10995` | : « Inscrire au registre » fige une copie datée du dossier d'un·e étudiant·e, cherché·e dans tous les trimestres, et acc… | le registre fige une copie datée d'un dossier |
| 67 | Aide › Codex et archives, `index.html:11211` | …s un autre trimestre », qui en fait une copie : au pied de « Dans ce trimestre » pour les grilles, les cartouches et les… | double ou sauvegarde : reste |
| 68 | Aide › Codex et archives, `index.html:11239` | …rille » pour une cartouche) en fait une copie que tu adaptes, et l'attribution d'origine est conservée.…… | double ou sauvegarde : reste |
| 70 | Archives › Ouvrir une archive, `index.html:12275` | — l'élément reçoit un nouvel ID et son nom est suffixé « — copie ». | suffixe « — copie » |
| 79 | Infobulles, `js/accompagnement-contenu-hover.js:446` | …ne production. Pratique pour garder une copie d'une évaluation complète.… | « garder une copie d'une évaluation complète » : sauvegarde |
| 87 | Infobulles, `js/accompagnement-contenu-hover.js:691` | Crée une copie INDÉPENDANTE de ce bloc : la modifier ne touchera pas l'original. Raccourci : ⌥ en glissant le bloc, ou ⌘… | bloc de la carte |
| 90 | Infobulles, `js/accompagnement-contenu-hover.js:838` | Crée une copie du groupe-cours dans tes archives. Geste manuel, ne supprime rien dans ton codex de travail. | archive d'un groupe-cours |
| 91 | Infobulles, `js/accompagnement-contenu-hover.js:842` | Active la recopie des items déjà présents dans ta bibliothèque active : ils recevront un nouvel identifiant et le suffix… | suffixe « — copie » |
| 110 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:947` | Une copie et un clone ne sont pas la même chose. Une copie est indépendante : la modifier ne touche pas l’original. Un c… | copie et clone de la carte |
| 116 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1279` | … production, ma pratique) et renomme la copie. Elle reste dans la démo : une nouvelle version du pack l'efface. Une copi… | matériel dupliqué de la démo |
| 117 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1284` | … « Dupliquer pour créer ma grille ». Ta copie porte la ligne « Inspiré de Grille-5 FR-HOLIS-20 H26 par Labo Codex » : c'… | double ou sauvegarde : reste |
| 118 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1288` | … : duplique-le d'abord, puis choisis ta copie.… | double ou sauvegarde : reste |
| 119 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1308` | Archiver, c'est déposer une copie d'un groupe-cours terminé dans tes archives personnelle locale. C'est un geste manuel … | archive |
| 120 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1326` | …n dans ton codex de travail — c'est une copie , pas un déplacement. Tu peux archiver autant de fois que tu veux.… | archive |
| 121 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1389` | L’archive original n'est jamais modifié. Réimporter, c'est faire une copie. | archive |
| 122 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1433` | Si tu coches « Recopier en double », ces items sont réactivés : ils seront recopiés avec un nouvel identifiant et le suf… | suffixe « — copie » |
| 123 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1438` | …ointera automatiquement sur la nouvelle copie de la grille — pas sur la grille existante. Le rebranchement se fait à con… | double ou sauvegarde : reste |
| 125 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1533` | …cteur du haut. L’archive, elle, est une copie de sécurité figée.… | copie de sécurité |
| 126 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1816` | Les maquettes. Une maquette est une copie d'essai d'une de tes pratiques. Tu la dérives, tu changes un réglage, puis tu … | maquette |
| 127 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1836` | Importer crée une copie. Le modèle d'origine reste intact dans son trimestre ; c'est la copie, dans ton trimestre actif,… | import d'une pratique |
| 128 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:1840` | Ce qui change sur la copie. Une pratique copiée porte « (importée) » à la fin de son nom ; tu peux le retirer. La carte … | double ou sauvegarde : reste |
| 129 | Glossaire, `js/accompagnement-contenu-terme.js:35` | …ormulaire s'ouvre rempli, et « Créer la copie » l'enregistre.… | cours dupliqué |
| 140 | Glossaire, `js/accompagnement-contenu-terme.js:538` | …ibliothèque : l’application en crée une copie dans ton trimestre actif, et l’original reste intact là où il était.…… | import d'un modèle |
| 141 | Glossaire, `js/accompagnement-contenu-terme.js:557` | Une copie d’essai d’une de tes pratiques, faite pour être comparée. Elle reste dans l’Exploration : tu ne peux pas l’app… | maquette |
| 183 | Bibliothèque, `js/bibliotheque-ui.js:384` | Cette copie reste dans la démo. Quand elle est prête, garde-la dans ta bibliothèque pour la retrouver dans tes vrais tri… | matériel de la démo dupliqué |
| 184 | Bibliothèque, `js/bibliotheque-ui.js:915` | Copies | groupe de doublons « Copies » de la bibliothèque |
| 188 | Conception › Rétroactions, `js/cartouches.js:3471` | Changer de grille crée une copie de cette cartouche pour la grille choisie. L'originale reste telle quelle. Les commenta… | cartouche dupliquée |
| 189 | Conception › Rétroactions, `js/cartouches.js:3544` | Copie impossible : dans la grille choisie, deux critères de cette cartouche tomberaient sur le même critère, et leurs co… | cartouche dupliquée |
| 190 | Conception › Rétroactions, `js/cartouches.js:3881` | Créer une copie | double ou sauvegarde : reste |
| 204 | Codex, `js/codex.js:3394` | ). Ton fichier de codex n'a pas changé : garde-le, c'est ta copie hors de | le fichier de codex est « ta copie hors de l'application » |
| 212 | Codex, `js/codex.js:3874` | Retirer cet·te étudiant·e du registre efface pour de bon sa copie et ses résultats ultérieurs. | registre : la copie figée d'un dossier |
| 230 | Réglages › Données, `js/donnees-v2.js:1094` | Retrait de la Bibliothèque. Aucune copie n'a été trouvée dans une grille du trimestre actif. | copie d'un élément de la bibliothèque |
| 232 | Conception › Échelles, `js/echelles.js:1076` | Créer une copie | double ou sauvegarde : reste |
| 254 | Conception › Grilles, `js/grilles.js:2297` | Créer une copie | double ou sauvegarde : reste |
| 265 | Démo, `js/guidage-demo.js:63` | …er pour créer ma grille » t'en fait une copie.… | double ou sauvegarde : reste |
| 266 | Démo, `js/guidage-demo.js:67` | … pour créer mon échelle » t'en fait une copie.… | double ou sauvegarde : reste |
| 268 | Noms des doubles, `js/identite-item.js:459` | (copie) ⟂ (copie | suffixe « (copie) » d'un double |
| 306 | Conception › Objectifs, `js/objectifs.js:323` | ;" title="Créer une copie de cet ensemble"> Dupliquer l'ensemble <button class="btn btn-secondaire btn-exporter-ensemble… | double ou sauvegarde : reste |
| 307 | Conception › Objectifs, `js/objectifs.js:664` | - Copie | suffixe « - Copie » |
| 308 | Conception › Objectifs, `js/objectifs.js:679` | ✅ Ensemble dupliqué avec succès ! Tu peux maintenant modifier la copie. | double ou sauvegarde : reste |
| 317 | Partage, `js/partage-import.js:635` | Confirmer remplacera la copie existante par cette version. | partage : copie importée |
| 318 | Partage, `js/partage-import.js:784` | Seule la copie importée est retirée — tes propres documents ne sont pas touchés. | partage |
| 319 | Partage, `js/partage-import.js:852` | Retirer cette copie importée (tes documents ne sont pas touchés) | partage |
| 322 | Partage, `js/partage-section.js:449` | Seule la copie importée est retirée : tes propres documents, | partage |
| 323 | Partage, `js/partage-section.js:653` | Importés par fichier .lcz, non modifiables ici. « Dupliquer » crée une copie | partage |
| 324 | Partage, `js/partage-section.js:655` | Le menu ⋮ retransmet un item à un collègue ou supprime la copie importée ; | partage |
| 325 | Partage, `js/partage-section.js:669` | Créer une copie modifiable dans tes documents (l'original partagé reste intact) | partage |
| 326 | Partage, `js/partage-section.js:683` | Supprimer cette copie importée (tes documents ne sont pas touchés) | partage |
| 327 | Conception › Carte, `js/planification-bibliotheque.js:166` | Créer une copie dans ce trimestre | carte : leçon |
| 328 | Conception › Carte, `js/planification-carte.js:2045` | … cours donné à une session précédente — copie indépendante, la source reste intacte.… | carte |
| 329 | Conception › Carte, `js/planification-carte.js:4157` | Copie indépendante créée — une leçon ou une séquence ne se clone jamais : le clone lié (⇧) est réservé aux blocs simples… | carte |
| 330 | Conception › Carte, `js/planification-carte.js:4158` | Copie indépendante créée — modifie-la sans toucher l'originale. | carte |
| 331 | Conception › Carte, `js/planification-carte.js:4268` | Copie indépendante créée — modifie-la sans toucher l'originale. | carte |
| 332 | Conception › Carte, `js/planification-carte.js:4446` | copies créées — elles sont sélectionnées, glisse-les où tu veux. | carte |
| 333 | Conception › Carte, `js/planification-carte.js:8756` | Nom de la copie : ⟂ (copie) | carte |
| 334 | Conception › Carte, `js/planification-carte.js:8759` | (copie) | carte |
| 335 | Conception › Carte, `js/planification-carte.js:11261` | Carte reprise — copie indépendante, celle du trimestre d'origine reste intacte. | carte |
| 336 | Conception › Carte, `js/planification-carte.js:12517` | Dupliquer la sélection (copie indépendante) | carte |
| 337 | Conception › Carte, `js/planification-carte.js:12519` | Dupliquer en déplaçant (copie indépendante) | carte |
| 338 | Conception › Carte, `js/planification-export.js:1698` | (copie) | gabarit |
| 339 | Conception › Pratiques, `js/pratiques-gestion.js:329` | Créer une copie | double ou sauvegarde : reste |
| 340 | Conception › Pratiques, `js/pratiques.js:619` | Copie de pratique | pratique dupliquée |
| 341 | Conception › Pratiques, `js/pratiques.js:620` | Nom de la copie: | pratique dupliquée |
| 343 | Conception › Productions, `js/productions-bibliotheque-ui.js:153` | Créer une copie | double ou sauvegarde : reste |
| 353 | Labo › Registre, `js/registre-longitudinal.js:93` | … tu suis d'un trimestre à l'autre : une copie figée de leur dossier, et les notes qu'ils et elles obtiennent ensuite.… | registre : copie figée d'un dossier |
| 354 | Labo › Registre, `js/registre-longitudinal.js:104` | Refaire la copie | registre |
| 355 | Labo › Registre, `js/registre-longitudinal.js:105` | Refaire la copie du dossier de | registre |
| 356 | Labo › Registre, `js/registre-longitudinal.js:106` | La copie du ⟂ La copie précédente | registre |
| 357 | Labo › Registre, `js/registre-longitudinal.js:109` | Copie du | registre |
| 358 | Labo › Registre, `js/registre-longitudinal.js:112` | non calculé au moment de la copie | registre |
| 359 | Labo › Registre, `js/registre-longitudinal.js:138` | Indices au moment de la copie | registre |
| 360 | Labo › Registre, `js/registre-longitudinal.js:143` | note impossible à calculer au moment de la copie | registre |
| 361 | Labo › Registre, `js/registre-longitudinal.js:145` | Aucune évaluation dans cette copie. | registre |
| 362 | Labo › Registre, `js/registre-longitudinal.js:164` | Sa copie | registre : colonne « Sa copie » |
| 400 | Réglages › Données › Archives, `js/reserve-ouvrir.js:1063` | — copie | suffixe « — copie » |
| 401 | Réglages › Données › Archives, `js/reserve-ouvrir.js:1233` | copie(s) en double | import d'archive : éléments recopiés en double |
| 402 | Réglages › Données › Archives, `js/reserve-ouvrir.js:1234` | référence(s) rebranchée(s) sur les copies | références rebranchées sur les doubles |
| 429 | Réglages › Données › Archives, `js/reserve-trimestre.js:54` | Déposer une copie complète de ce trimestre hors du navigateur | archive du trimestre : « une copie complète » |
| 445 | Réglages › Données › Archives, `js/reserve.js:1178` | Copie mise de côté incomplète : | reste « Copie » : le message parle du double écrit hors de l'archive, l'original est intact (relecture) ; affiché par la notification « Groupe non archivé » |
| 495 | Cadre › Trimestre, `js/trimestre-v2-cours.js:656` | Créer la copie | cours dupliqué |
| 496 | Cadre › Trimestre, `js/trimestre-v2-cours.js:664` | (copie) | suffixe « (copie) » |
| 498 | Conception › Pratiques, `js/wizard-pratique-v2.js:184` | Adopter un modèle copie sa configuration dans une nouvelle pratique. L'original n'est pas modifié — tu pourras renommer … | adopter un modèle de pratique |

## 6. Les occurrences (c) : autre chose, à garder (33)

| n° | Où | Extrait | Pourquoi |
|---|---|---|---|
| 1 | Conception › Mon matériel, `index.html:4011` | Copie ton tableau ⟂ Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte), sélectionn… | verbe « copier » |
| 12 | Aide › Bibliothèque et démo, `index.html:9894` | « Garder dans ma bibliothèque → » copie un élément de ce trimestre dans ta bibliothèque. | verbe « copier » |
| 13 | Aide › Bibliothèque et démo, `index.html:9895` | « ← Utiliser dans ce trimestre » copie un élément de ta bibliothèque dans ce trimestre. | verbe « copier » |
| 65 | Aide › Labo, `index.html:11099` | …e tu modifies, actives ou désactives. « Copier les questions » les copie pour le formulaire en ligne de ton choix, et l'… | verbe « copier » |
| 66 | Aide › Codex et archives, `index.html:11162` | …utre trimestre », dans la même fenêtre, copie le matériel d'un trimestre précis.… | verbe « copier » |
| 76 | Infobulles, `js/accompagnement-contenu-hover.js:403` | Rétroaction générée automatiquement. Modifie le texte au besoin, puis copie dans le presse-papier. | presse-papier |
| 80 | Infobulles, `js/accompagnement-contenu-hover.js:467` | Copie toutes les grilles de ce trimestre dans ton trimestre actif, avec leurs rétroactions. Les originales restent intac… | verbe « copier » |
| 81 | Infobulles, `js/accompagnement-contenu-hover.js:469` | Copie toutes les échelles de ce trimestre dans ta bibliothèque. Les originales restent intactes. | verbe « copier » |
| 82 | Infobulles, `js/accompagnement-contenu-hover.js:471` | Copie toutes les cartouches de ce trimestre dans ton trimestre actif. Les originales restent intactes. | verbe « copier » |
| 83 | Infobulles, `js/accompagnement-contenu-hover.js:473` | Copie toutes les productions de ce trimestre dans ta bibliothèque. Les originales restent intactes. | verbe « copier » |
| 84 | Infobulles, `js/accompagnement-contenu-hover.js:475` | Copie toutes les pratiques de ce trimestre dans ton trimestre actif. Les originales restent intactes. Vérifie ensuite le… | verbe « copier » |
| 86 | Infobulles, `js/accompagnement-contenu-hover.js:596` | Rapport textuel configurable. Coche les sections à inclure et copie dans le presse-papier. | verbe « copier » |
| 88 | Infobulles, `js/accompagnement-contenu-hover.js:693` | … simples — une séquence ou une leçon se copie toujours à l'indépendant.… | verbe « copier » |
| 93 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:166` | Copie ta grille depuis son fichier d’origine (Word, Pages) plutôt que depuis un PDF : le tableau arrive avec ses cases, … | verbe « copier » |
| 95 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:418` | « Garder dans ma bibliothèque → » copie un élément de ce trimestre dans ta bibliothèque. | verbe « copier » |
| 96 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:419` | « ← Utiliser dans ce trimestre » copie un élément de ta bibliothèque dans ce trimestre. | verbe « copier » |
| 98 | Aide contextuelle (ⓘ), `js/accompagnement-contenu-popup.js:462` | « Garder dans ma bibliothèque → » copie un tampon de ta palette dans ta bibliothèque. | verbe « copier » |
| 163 | Conception › Grilles › critère algorithmique, `js/atelier-algo.js:154` | Reprendre une collection copie ses paliers et sa limite dans ce critère. La corriger ou la supprimer ensuite ne change p… | verbe « copier » |
| 185 | Labo › Bilan réflexif, `js/bilan-reflexif-editeur.js:69` | Copie les questions — Clique sur « Copier les questions ». Le texte est copié dans ton presse-papier. | verbe « copier » |
| 186 | Labo › Bilan réflexif, `js/bilan-reflexif-parcours.js:55` | Copie le formulaire — Clique sur « Copier le formulaire ». Le texte complet (activités + questions de synthèse) est copi… | verbe « copier » |
| 191 | Codex, `js/codex.js:593` | avertissement des copies manquantes | trace technique du rapport de bug, pas un texte d'écran |
| 205 | Codex, `js/codex.js:3687` | avertissement des copies manquantes refusé par l'usager | trace technique du rapport de bug, pas un texte d'écran |
| 206 | Codex, `js/codex.js:3786` | avertissement des copies manquantes refusé par l'usager | trace technique du rapport de bug, pas un texte d'écran |
| 219 | Codex, `js/codex.js:4422` | Copie automatique refusée | presse-papier |
| 248 | Évaluation › Évaluer, `js/evaluation-retroaction.js:649` | Erreur lors de la copie. Utilise Cmd+A puis Cmd+C manuellement. | presse-papier |
| 249 | Évaluation › Évaluer, `js/evaluation-retroaction.js:1504` | Erreur lors de la copie. | presse-papier |
| 302 | Conception › Mon matériel, `js/materiel.js:154` | …ien de lisible dans ce que tu as collé. Copie le tableau de ta grille dans Word ou Pages, ou le texte d’un PDF, puis col… | verbe « copier » |
| 347 | Suivi › Profil, `js/profil-etudiant-rapport.js:187` | …egistre nulle part : si tu le modifies, copie-le avant de quitter l'écran. Tes notes, dans le champ du dessous, s'enregi… | verbe « copier » |
| 348 | Suivi › Profil, `js/profil-etudiant-rapport.js:274` | Tes observations sur cet·te étudiant·e. Elles restent ici, et s'ajoutent au bas du rapport quand tu le copies. | verbe « copier » |
| 349 | Suivi › Profil, `js/profil-etudiant-rapport.js:358` | La copie a échoué. Sélectionne le texte manuellement (Ctrl+A puis Ctrl+C). | presse-papier |
| 350 | Suivi › Profil, `js/profil-etudiant-rapport.js:367` | La copie a échoué. Sélectionne le texte manuellement (Ctrl+A puis Ctrl+C). | presse-papier |
| 351 | Suivi › Profil, `js/profil-etudiant-rapport.js:372` | La copie a échoué. Sélectionne le texte manuellement (Ctrl+A puis Ctrl+C). | presse-papier |
| 352 | Signaler un bug, `js/rapport-bug.js:1093` | Erreur lors de la copie. Sélectionne manuellement le texte du rapport. | presse-papier |

## 7. Écartées du relevé : non affichées (10)

| n° | Où | Extrait | Pourquoi |
|---|---|---|---|
| 69 | Archives › Ouvrir une archive, `index.html:12270` | reserve-ouvrir-toggle-copie | non affiché (identifiant, classe, attribut) |
| 71 | Archives › Ouvrir une archive, `index.html:12278` | reserve-copie-double | non affiché (identifiant, classe, attribut) |
| 181 | Conception › Grilles › critère algorithmique, `js/atelier-algo.js:727` |  | classe CSS |
| 182 | Conception › Grilles › critère algorithmique, `js/atelier-algo.js:728` |  | classe CSS |
| 223 | Conception › Grilles › critère algorithmique, `js/composeur-calcul.js:188` | ⟂ | classes CSS |
| 269 | Import-export, `js/import-export.js:556` | trace de la source d'un import — la transporter ferait répondre la copie à l'identifiant de la source (#542) | description interne d'un champ (#542) |
| 320 | Partage, `js/partage-schemas.js:677` | trace de la source d'un import — la transporter ferait répondre la copie à l'identifiant de la source (#542) | description interne d'un champ (#542) |
| 321 | Partage, `js/partage-schemas.js:685` | copie à la racine de metadata_cc.institution (cc-license.js) — l'attribution voyage par le manifeste, pas par la racine | description interne d'un champ |
| 468 | Évaluation › Préparer et Annoter, `js/travaux-ui.js:1297` | …av-seq-icon"> <img src="icons/icons8-stopwatch.svg" alt="Chronomèt… | commentaire HTML |
| 485 | Évaluation › Préparer et Annoter, `js/travaux-ui.js:4369` |  | classe CSS |

## 8. Partie 2 : la banque de types, mesure et proposition

Mesure faite en lecture seule par un agent, à ma demande. J'en ai relu moi-même deux points : le titre « Structure des évaluations » et l'échappement des imports `.lcz`. [lu] veut dire lu dans le code, [inféré] déduit sans l'éprouver.

**Ce qui existe.**
- Le type d'une production est la chaîne `production.type` [lu, `js/productions.js:1759`]. La table `TYPES_PRODUCTION` compte 12 identifiants (`js/productions.js:106-121`), recopiés à la main dans le menu d'`index.html` (4557-4574).
- La sentinelle `tests/unit/sentinelle-492-types-production-source-unique.test.js` compare les deux, en lisant le `<select>` statique par une expression régulière [lu, l. 97-110]. Une option « + Nouveau type… » ou un menu bâti en JS la fera rougir : elle est à adapter dans le lot.
- Seuls trois types changent le calcul : `portfolio`, `artefact-portfolio`, `terminale` (72 comparaisons dans 20 fichiers) [lu]. Les autres ne sont testés nulle part dans le calcul. Exception : la convention `-formatif`, qui passe par `type.includes('formatif')` (`js/productions-liste.js:121`, `js/productions.js:3019`). Un type libre « Quiz formatif » serait donc classé formatif [inféré].
- Un type inconnu s'affiche tel quel (`getTypeLabel`, `js/productions.js:2948-2956`), et sous « Type non répertorié » dans la carte (`js/planification-carte.js:8579-8588`) [lu].
- Le type ne passe pas par une fonction unique : la bibliothèque a son propre repli, et l'export PDF ainsi que Réglages › Données montrent l'identifiant brut (« artefact-portfolio ») [lu, `js/travaux-export-pdf.js:675`, `js/donnees-v2.js:704`]. Le plan de cours n'affiche pas le type de production [lu, `js/planification-export.js:914`].
- **Ce qui voyage.** Le `type` voyage partout tel quel, sans liste de valeurs : partage `.lcz` en chaîne de 50 caractères au plus (`js/partage-schemas.js:597`), import et bibliothèque en chaîne de 100 au plus (`js/import-export.js:1279`), et le codex emporte toute la clé [lu]. Un champ neuf, lui, devrait être déclaré au schéma `.lcz`, et une version plus ancienne de l'application rejetterait le fichier [inféré, `js/partage-validation.js:256`].
- **Les tampons**, l'exemple « hors trimestre », vivent dans des clés globales non préfixées (`tamponsPersonnalises`, `bibliothequeTampons`) et partent avec le codex [lu]. La liste blanche des Archives (`CLES_GLOBALES_INCLUSES`, `js/reserve.js:58-74`) ne les contient pas [lu]. Une archive récente ne les ramènerait donc pas [inféré].
- **Le stock.** Le dépôt ne contient aucune production « autre » (la démo n'a que portfolio, artefacts et terminale) [lu]. Ton stock à toi est à mesurer sur le Mac. À l'édition d'une production dont le type n'est plus dans le menu, `select.value = prod.type` donne une valeur vide (`js/productions.js:1556`), et l'enregistrer forcerait à rechoisir un type, ce qui réécrirait son type [inféré, comportement standard du DOM, pas éprouvé sous Safari]. C'est ce qui arrivera aux productions « Autre » dès qu'« Autre » sortira du menu.

**Ma proposition, en quelques lignes.**
1. **Où vit la banque** : une clé globale, hors trimestre, comme les tampons (par exemple `banqueTypesProduction`), propriété de `js/productions.js`, inscrite à `docs/DATA-OWNERSHIP.md`. Elle porte les types créés (leur nom, s'ils sont retirés), et les exemples que la personne a retirés de sa vue.
2. **Sur la production**, le type créé s'écrit tel qu'il est nommé, dans le champ `type` qui existe déjà. Il voyage alors sans rien changer au format, il s'affiche partout où l'application affiche déjà un type inconnu, et une version plus ancienne le lit. Deux gardes à la création : refuser un nom qui reprend un exemple ou un identifiant existant ; faire que `includes('formatif')` ne touche que les identifiants connus. La saisie se limite à 50 caractères, la borne du partage.
3. **Ce qui voyage** : la banque part avec le codex (toute clé y part). Elle doit être ajoutée à la liste blanche des Archives ; le lot dira au passage si les tampons y manquent vraiment. Une production partagée ou importée emporte son nom de type ; chez le ou la collègue, il ne va que sur la production (question 8).
4. **Le geste de gestion** : au bas du même menu, « + Nouveau type… » et, à côté, « Gérer mes types… », une petite fenêtre qui renomme, retire, et masque les exemples. Retirer ou renommer ne réécrit aucune production (question 9). Le menu garde une option pour le type que porte la production ouverte, même retiré de la banque, même « Autre » : c'est la réponse au point vide du stock.
5. **À faire dans le même lot**, parce qu'un type devient un texte libre : `echapperHtml()` aux trois endroits qui le mettent dans un `innerHTML` sans échappement (`js/productions.js:289`, `js/productions.js:3052`, `js/productions-import-export.js:410`). Aujourd'hui, le type vient d'un menu fixe ou d'un import qui neutralise le HTML (`js/partage-validation.js:47-56`, `js/import-export.js:505-511`). Le lot fera aussi afficher le libellé, pas l'identifiant, dans l'export PDF et dans Réglages › Données : la consigne veut le type affiché partout.

Les textes validés de la partie 2 (le glossaire, le menu « Type », les trois infobulles, les trois définitions) **ne sont pas posés cette nuit** : le plan de nuit limite la session B au relevé. Ils se posent à l'étape 2, mot pour mot.

## 9. À inscrire au BACKLOG

1. **Le lot « « Production » plutôt que « copie », dans l'interface »** (consigne du 8 nov., décisions de Grégoire de 12 h 48 à 12 h 53 et de 13 h 51 à 14 h 09). L'étape 1 est livrée cette nuit : ce rapport, sur `mesure/production-plutot-que-copie`. L'étape 2 attend l'accord de Grégoire sur le tableau (§ 4) et sur la banque (§ 8). Ne pas inscrire à part le point 2 de la consigne du parcours 8 : il est dans ce lot.

## 10. Trouvailles faites en chemin, et ce qu'elles deviennent

- **Le menu vide le type d'une production « Autre » à l'édition** (§ 8, le stock) : joint au lot de la banque, qui retire « Autre » du menu. Rien n'arrive tant qu'« Autre » reste au menu.
- **Les tampons absents de la liste blanche des Archives** (`js/reserve.js:58-74`, inféré) : joint au lot de la banque, qui doit ajouter sa propre clé à la même liste. Pas de symptôme vécu, donc pas d'entrée à part.
- **L'échappement manquant du type** (`js/productions.js:289` et `:3052`, `js/productions-import-export.js:410`) : joint au lot de la banque (§ 8, point 5). Sans conséquence observable aujourd'hui, puisque le type vient d'un menu fixe ou d'un import qui neutralise le HTML.
- **« correction », « corrigée »** (entrées 238, 243, 313, 314 et 499) : les consignes des parcours 8 et 9 écartent « corriger ». Ce n'est pas ce lot, qui ne change que « copie » : je le signale, sans proposer.
- **« tes étudiants »** non inclusif (entrée 104) : la phrase change de toute façon à l'étape 2, et Grégoire dira s'il veut « tes étudiant·es ».
- **La vérification de GitHub est rouge sur la 1.237.2** (relevé par l'audit de début de session) : 4 specs Linux rougissent pour la première fois, dont `aide-cp-suit-la-case-1086` et `tampons-masques-bibliotheque-1216`, absentes de #1246. Le Mac rend 1 420/1 420. Ce n'est pas ce lot : c'est signalé pour la session du Mac, sans entrée au BACKLOG.

## 11. Vérifications

- **Sentinelle neuve** `tests/unit/sentinelle-rappel-codex-productions-2026-11-09.test.js` : rouge avant le code (2 essais sur 4 échouent : le texte validé absent, l'ancien présent), verte après. Elle lit le fichier aplati, comme la sentinelle du lot I bis.
- **Spec du lot I** (`tests/integration/lot-i-rappel-mene-au-codex.spec.js`) : son `TEXTE_D8` suit le texte. Verte sous Chromium (4/4). Break-test : sur l'ancien texte, l'essai (1) rougit.
- **Anti-cache** : `?v=` de `modal-backup-reminder.js` porté à `20261108n`. La sentinelle `sentinelle-anticache-fichiers-modifies` veut le jour du build en ligne (1108), et un premier essai à `20261109a` a été refusé par le crochet de push. La release du Mac refera le jeton.
- **Vitest complet**, depuis `tests/` : 893 fichiers, 10 829/10 829 verts (après le code ; le crochet de push l'a relancé et laissé passer)..
- **Playwright** : seule la spec du lot I, sous Chromium. Aucun verdict WebKit.
- **Relecture par un agent neuf** (`plans de travail/BOUCLE-SANS-RELAIS.md`, § 4, point 4) : « le code est conforme et peut passer tel quel » ; dans un échantillon de 51 lignes du relevé, une catégorie fausse (445, remise en (b)) et neuf propositions à reprendre (un sens changé en 462, des doubles sens « ta production / la sienne », des apostrophes typographiques perdues). Toutes reprises, et les lignes voisines alignées sur le même choix (18 à 21, 131 à 133, 142, 291 à 296, 411 à 428). L'agent a refait le break-test de la sentinelle sur des copies : rouge sur l'ancien texte, sur « étudiants » sans point médian et sur « sauvegarde complète ». Limite qu'il note : la sentinelle lit la source, pas l'écran ; la spec Playwright couvre l'écran.
