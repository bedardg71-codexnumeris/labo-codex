# Rapport du lot `lot/dissection-ipad` — la dissection sur l'iPad (12 nov. 2026)

**Relais.** Branche `lot/dissection-ipad`, partie de `main` (`271dc9177`, la 1.243.0). Mandats : relais de la
conversation du Projet, 12 nov., 6 h 35 (huit points), puis 11 h 25 (huit corrections après la porte). **Fait** : les
deux relais, sur la branche, PR d'aperçu n° 21 ; la porte passée de 9 h 58 à 11 h 23 (dans la conversation, sans
artefact). **Reste** : la section « Après correction » de la porte, un geste par tour ; la fusion viendra par un relais
à part (avec les deux temps et l'en-tête). Commit, build : « Second relais », en fin de rapport.

## Livraison

- **Commit** : `556422384` (le code du lot) ; ce rapport et la porte suivent dans un commit de documents.
- **Build** : 1112-0755 (version 1.243.0 inchangée ; jetons `?v=20261112a` sur les neuf fichiers touchés).
- **Aperçu** : PR #21, `https://deploy-preview-21--codexnumeris-051225.netlify.app` (vérifié : sert
  `materiel-dissection.js?v=20261112a` et « Composer ma grille »).
- **Vitest** : 920 fichiers, 11 490 tests, verts.
- **Verdict Playwright WebKit (Mac, `556422384`)** : vert, 0 échec ; une spec verte au second essai, hors du lot
  (`grilles-sous-criteres-condense.spec.js`, iPad, sous-critères). Hook pré-push : vert, sans contournement.
- **Pas de fusion** : elle attend l'essai de Grégoire sur l'iPad.

## Ce qui a été fait, point par point

1. **La liste qui défile.** En haut et en bas de la palette, collées à ses bords, deux pastilles
   « ▲ N étiquettes plus haut » et « ▼ N étiquettes plus bas » (N compté à chaque défilement), qui font défiler la
   liste d'une hauteur quand on les touche ; rien quand la liste tient. Elle s'ouvre en haut. **Cause trouvée sous
   WebKit** : la remise à zéro faite pendant que la vue était encore masquée est ignorée, et la liste rouverte
   reprenait le défilement de la dissection d'avant (c'est vraisemblablement le « commence à Code » du 11 nov.) ;
   elle est maintenant faite après l'affichage. L'étiquette que l'aide désigne est amenée au milieu de la liste.
2. **Défiler et surligner.** `touch-action: none` retiré (`manipulation`). Au doigt (et au stylet) : un toucher pose
   (au lever, sans glisser) ; un glisser fait défiler et ne pose rien (y compris un `pointercancel` du navigateur) ;
   le doigt maintenu 350 ms puis glissé surligne plusieurs morceaux, la feuille retenue pendant ce glisser. La souris
   garde son geste (appuyer, glisser). « Couper » et « Rattacher » : un glisser défile, ne coupe ni ne lie.
3. **Une étiquette de code parmi celles d'une grille.** Ni « Poids » ni « Pondération » touchés. L'aide (point 4)
   nomme l'étiquette de trop (le groupe le moins nombreux ; à égalité, les codes) et ce qu'elle veut dire.
4. **L'aide pas à pas.** `D.creation` (et `D.codesCompris`) rendent `manques`, une sorte par raison, dans l'ordre exact
   de `raisons` (la seule source) ; `R.sansPlace` garde l'identifiant du morceau et sa rangée. `D.aide` (pur) tire du
   PREMIER manque une phrase, l'étiquette à prendre et, quand l'application le sait, le morceau (le premier morceau
   sans étiquette de sa rangée, ou en tête de sa colonne). Le moteur des parcours relit la ligne du geste à chaque
   passage (`poserGeste`, neuf : « la ligne du geste suit l'état ») ; l'étape « Ta grille » passe par `zones`,
   `fleches`, `aussiEviter`, `contour` : une flèche vers l'étiquette, une vers le morceau, le halo sur le premier
   geste (l'étiquette, puis le morceau une fois l'étiquette en main) ; plus aucun manque, « Créer ma grille ».
   Le moteur reconnaît maintenant une étiquette ou un morceau à son `data-param` / `data-id` (`signatureDe`) : sans
   cela, passer d'une étiquette à une autre ne la ramenait pas à l'écran.
5. **L'exemple.** Celui d'« Essayer avec un exemple » (`exempleDoc`), offert à « Commencer » dans l'étape 1 elle-même
   (pas d'étape neuve : les rangs de l'Assistance ne bougent pas pour un parcours en cours), avec trois boutons :
   « Voir le travail complet », « Faire l'exercice soi-même », « Passer à ma grille ». Il n'écrit rien : ni brouillon,
   ni grille ; « Créer ma grille » est remplacé par une phrase ; « Coller une autre grille » n'efface pas le brouillon
   de la personne, qui revient en passant à sa grille. Étiquetage complet : `D.exempleLiens` (§3.3 de la porte).
6. **« Composer ma grille ».** Partout (accueil, `TEXTE_1`, ligne du geste, commentaires). Dans l'étiquetage, un
   bouton à côté de « Coller une autre grille », même action `materiel.taperMain` : Grilles, brouillon intact. Plus
   aucun « Partir de zéro » dans `index.html` ni `js/` (garde Vitest).
7. **Une grille déjà là.** Dans l'étape 1, « Prendre une grille déjà créée » mène à Grilles ; une grille enregistrée
   ouverte dans l'éditeur fait paraître « Prendre cette grille », qui fait passer à « Ta production » avec elle (son
   identifiant retenu dans le repère du parcours, rien dans les données). Les lignes du geste nomment les boutons tels
   qu'écrits.
8. **Le skill d'ouverture**, `mesures-sous-condition.md` §2.1 : réécrit pour le push jugé au navigateur (20 morceaux,
   job `Playwright — verdict`) ; ligne d'historique dans `SKILL.md`.

## Les phrases de l'aide (PROPOSÉES, une par sorte de manque)

- nom : « Ta grille n'a pas encore de nom : prends « Titre », puis touche son nom dans ta grille. »
- nom déjà pris : « « X » est déjà le nom d'une de tes grilles : change-le dans « Nom de ta grille ». » ; trop long :
  « Le nom de ta grille est trop long : raccourcis-le dans « Nom de ta grille ». »
- sans critère dans la rangée : « « / 5 » n'a aucun critère dans sa rangée : prends « Critère », puis touche
  « Introduction ». » ; seul dans sa rangée : « « / 60 » est seul dans sa rangée : si c'est un total, prends
  « Total », puis touche-le. » ; texte brut : « « X » n'a aucun critère avant lui : prends « Critère », puis touche le
  critère qu'il complète. »
- niveau : « « X » n'a aucun niveau nommé dans sa colonne : prends « Niveau », puis touche « Y ». » (sans morceau
  connu : « … puis touche le nom du niveau en tête de sa colonne. ») ; « « X » est une réponse de plus que tes
  niveaux : prends « Niveau », puis touche le nom du niveau qui manque. »
- points sans réponse : « « X » n'a aucune réponse à qui donner ces points : prends « Descripteur », puis touche
  « Y ». » (ou « … touche la réponse qu'ils valent. »)
- seconde pondération : « « X » : son critère a déjà une pondération ; si c'est un total, prends « Total », puis
  touche-le. »
- étiquette impossible : « « X » ne peut pas garder l'étiquette « T » (raison) : prends « T », puis touche-le pour la
  retirer. »
- codes : « « X » n'a aucun code dans sa rangée : prends « Code », puis touche « Y ». » ; « Ta liste n'a encore aucun
  code : prends « Code », puis touche chaque code. » ; « Choisis le critère qui recevra ces codes, dans « Où vont ces
  codes ? ». »
- logique : « Il manque ce que vaut chaque réponse : prends « Points », puis touche les points d'une réponse (ou
  « Niveau », pour le nom d'un niveau). »
- mêlé : « « Poids » sert aux listes de codes (ce que pèse un code posé) : pour le poids d'un critère, prends
  « Pondération », puis touche « / 5 ». » ; « « T » sert aux listes de codes (aide) : prends « T », puis touche « X »
  pour la retirer. » ; « « T » sert aux grilles, pas aux listes de codes : prends « T », puis touche « X » pour la
  retirer. »
- niveaux en niveaux : « Il reste ce que vaut chaque niveau : écris sa plage et sa note retenue dans « Ce que vaut
  chaque niveau ». »
- autre : « Avant de créer, il reste … » ; prête : « Ta grille est prête : touche « Créer ma grille ». » / « Ta liste
  est prête : touche « Ajouter ces codes ». »

## Bancs et break-tests

- Vitest `tests/unit/dissection-ipad-aide-2026-11-12.test.js` (11) : `sansPlace` garde son morceau ; `manques` suit
  `raisons` ; l'aide sur un tableau, un texte brut, un cas mêlé ; la capture de Grégoire (fictive) ; l'exemple
  étiqueté en entier et prêt ; aucun « Partir de zéro ». Break-tests faits : `libreDansRangee` nul → A.a, G.a
  rouges ; `codesDeTrop` inversé → A.c, G.b, G.c ; `sansPlace` sans id → S.a ; `exempleLiens` sans points → E.a ;
  « Partir de zéro » remis dans un commentaire → rouge.
- Playwright WebKit `tests/integration/dissection-ipad-2026-11-12.spec.js` (6, à 1180 × 820 et 820 × 1180). Break-tests
  faits, chacun rouge : remise à zéro de la liste retirée (P1) ; le geste tactile débranché (P2) ; l'aide sur le
  DERNIER manque (P4) ; le brouillon écrit par l'exemple (P5) ; le bouton « Composer ma grille » retiré (P6) ; la
  grille prise ignorée (P7).
- Bancs existants adaptés : les gestes de surlignage des bancs de la dissection passent de « toucher » à « souris »
  (un glisser au doigt ne pose plus rien, c'est la règle du lot) ; les bancs du parcours 3 touchent « Passer à ma
  grille » ; les sentinelles des mots (« Composer ma grille », trois boutons de bulle, sept bulles d'aide) ; la
  complexité reste à 434 (`D.aide` en table).

## Ce que j'ai supposé

- L'exemple vit DANS l'étape 1 (offert à « Commencer » et « Refaire »), pas dans une étape neuve : un parcours déjà
  en cours chez quelqu'un garderait sinon un rang décalé. Un parcours repris en cours d'étape 1 sans ce repère passe
  droit à sa grille.
- « Voir le travail complet » et « Faire l'exercice soi-même » : les mots de Grégoire, première lettre en capitale
  (ce sont des boutons) ; « Passer à ma grille » est de moi.
- La Grille de départ compte comme « une grille déjà là » (« Prendre une grille déjà créée » est donc toujours offert).
- L'aide pointe un morceau seulement quand la place le dit (sa rangée, sa colonne) ; en texte brut, jamais.
- Le bouton « Essayer avec un exemple » de l'accueil, hors parcours, garde son comportement (il écrit le brouillon).

## Trouvailles (hors du lot)

- *Inscrire et continuer* : `debut-de-session-labo-codex/SKILL.md` §0.5 attend encore `pwd` = `…/Monitorage_v6` ; le
  dépôt s'appelle `labo-codex`.

## Nouvelles (proposée, pas écrite)

« Ta grille, sur l'iPad : la liste des étiquettes montre qu'elle défile, un doigt qui fait défiler ne pose plus
d'étiquette, et la bulle te guide un manque à la fois, avec un exemple à voir ou à faire toi-même. »

## Second relais (12 nov., 11 h 25) : les corrections après la porte

**Livraison.** Un seul commit, celui de cette section ; build 1112-1157 (1.243.0 inchangée), poussé sur `lot/dissection-ipad` ; l'aperçu n° 21 se
met à jour. Pas de fusion.

1. **« Composer ma grille »** (accueil d'« Apporter mon matériel ») : `btn btn-secondaire`, comme ses voisins.
2. **La légende.** Titre visible « Légende » au-dessus de la liste ; `aria-label` « Légende ». Consigne mot pour mot ;
   la phrase du milieu suit l'appareil (`majConsigne`), posée à l'ouverture de la dissection : sans geste encore,
   `(pointer: coarse)` → le doigt, sinon la souris ; ensuite, le type du dernier pointeur posé dans l'application. Pas
   au toucher même : la consigne changée déplaçait la grille entre l'appui et le lever (bancs « Couper » et
   « Rattacher » rouges à 820 × 1180, mesuré). Bandeau, statut, lecture vide, manques de
   `D.creation` et étape 3 de l'accueil : phrases proposées ci-dessous. « Couper » et « Rattacher » intouchés.
3. **Un exemple de forme.** Précisions de « Pondération » et « Points » mot pour mot ; noms inchangés. « Points » posé
   sur un morceau « / N » : l'aide le dit AVANT le premier manque (une telle grille peut être lisible et fausse) et
   propose « Pondération » sur ce morceau (`pointsSurPonderation`).
4. **Les points sans réponse.** `libreAvantDansLaCase` : le plus proche morceau libre qui précède les points dans leur
   case ; à défaut, la phrase sans morceau. **Les deux autres usages de `libreDansRangee`, gardés** : un critère (ou un
   code) ouvre sa rangée, dans sa première colonne ; le premier morceau libre de la rangée, dans l'ordre de lecture,
   est bien lui. Le défaut du point 4 tenait à ce que les points vivent dans une case du MILIEU de la rangée.
5. **Les flèches d'étiquetage** : le défilement de la légende appelle `planifierDessin` (elles restent bornées à son
   cadre, `dessiner`).
6. **La flèche de la carte.** « Rien ne vise ce qui ne se voit pas » : l'étiquette désignée, cachée par un défilement
   de la personne, est remplacée pour la carte par la pastille de son côté (« ▲ … plus haut » / « ▼ … plus bas »), qui
   y mène (`etiquetteOuSonChemin`) ; le moteur redessine à chaque défilement (écoute en capture), la flèche suit.
   **Pourquoi `amenerDansLaListe` n'a pas suffi** — mesuré sous WebKit : il n'agit qu'au changement d'étiquette
   désignée ET après chaque geste d'étiquetage (`finSurlignage` remet le repère) ; un défilement de la personne, sans
   geste après lui, cache l'étiquette déjà désignée et rien ne la ramène ; le moteur visait alors l'élément tel quel
   (`visible()` ne tient pas compte du cadre de la liste), d'où la flèche au-dessus de la légende. *Inférence* sur
   l'iPad : la liste a été défilée jusqu'à « Poids » après le dernier geste qui avait amené « Pondération ». Non
   mesurable ici : qu'iOS ignore un défilement programmé pendant un élan du doigt.
7. **Les pastilles hors de la liste.** Au-dessus et au-dessous de la liste qui défile (dans `#dissection-legende`), leur
   place gardée tant que la liste défile ; une étiquette désignée est amenée entière dans le cadre (`dansLeCadre`),
   donc sous la pastille.
8. **Le skill d'ouverture** : §0.5 attend `…/Documents/GitHub/labo-codex` ; ligne d'historique.

**Phrases proposées** (elles partent telles quelles et restent corrigeables) :
- bandeau, une étiquette choisie : « Étiquette « Critère » : touche les morceaux de ta grille qu'elle désigne. Touche un
  morceau déjà étiqueté pour retirer son étiquette. »
- statut, une étiquette choisie : « Étiquette « Critère » choisie : touche les morceaux de ta grille qu'elle désigne. »
- statut d'un tableau collé : « Tableau collé : 3 rangées, 9 morceaux. Touche une étiquette dans la légende, puis les
  morceaux qu'elle désigne. »
- lecture vide : « Étiquette ta grille : la lecture de l'application apparaîtra ici. » ; sans critère : « Aucun
  critère pour l'instant : pose « Critère » sur une question que tu te poses devant la copie, ou « Descripteur » sur des
  réponses. »
- manques : « … pose l'étiquette « Pondération » sur le poids de chaque critère, ou l'étiquette « Points » sur ce que
  vaut chaque réponse » ; « … pose l'étiquette « Points » sur ce que vaut chaque réponse, ou l'étiquette « Niveau » sur
  le nom de chaque niveau » ; « au moins un code : pose l'étiquette « Code » sur chaque code »
- accueil, étape 3 : « Avec les étiquettes de la légende, tu identifies tes sections, tes critères, tes points ; … »
- sous la lecture : « Elle se refait à chaque morceau étiqueté. »
- aide, point 3 : « « / 10 » ressemble au poids d'un critère (sur combien il se note), pas à ce que vaut une réponse :
  prends « Pondération », puis touche « / 10 ». »
- l'`aria-label` d'une étiquette : « …, 2 morceaux étiquetés ».

**Bancs et break-tests.**
- Vitest `tests/unit/dissection-legende-2026-11-12.test.js` (7). Break-tests, chacun rouge puis rétabli :
  `libreDansRangee` remis pour les points → R.a, R.b ; la règle « Points » sur « / N » neutralisée → P.b ; « palette »
  remis au bandeau → L.b ; « palette » remis dans la consigne d'`index.html` → L.a.
- Playwright WebKit `tests/integration/dissection-legende-2026-11-12.spec.js` (7, à 1180 × 820 et 820 × 1180).
  Break-tests, chacun rouge : « palette » au bandeau → L2 (×2) ; le défilement sans `planifierDessin` → L5 ; la carte
  qui vise l'étiquette cachée → L6 (×2) ; le repère non remis après un geste → L6 (×2) ; les pastilles d'avant (index,
  styles et JS de `39284dee3`) → L7 (×2).
- Bancs existants adaptés : les mots du bandeau et de la lecture vide (`materiel-dissection-1`), les trois manques
  (Vitest). Rejoués sur l’état final (build 1112-1157) : Vitest 921 fichiers, 11 497 tests, verts ; WebKit, les bancs de la dissection (`materiel-dissection-*`, `materiel-*`, `dissection-*`, `bareme-1`, `critere-algorithmique-coller-codes`) et du parcours « Évaluer » (`parcours-3-*`, `parcours-fleches`, `registre-des-parcours`) : 59 verts, 4 ignorés par leurs propres conditions, 0 rouge. Une correction en chemin : la consigne changée au toucher même déplaçait la grille (« Couper » et « Rattacher » rouges), voir le point 2.

**Ce que j'ai supposé.**
- Point 6 : la légende ne défile pas d'elle-même tant que la personne la fait défiler sans geste (sinon elle lui
  reprend la main, et « Poids » ne se laisse plus atteindre) ; dans ce cas, la carte vise la pastille qui mène à
  l'étiquette. Elle la ramène, entière, au prochain changement d'étiquette désignée ou au prochain geste.
- Point 3 : la forme « / N » seule (« / 10 », « /5 », « / 7,5 ») ; « sur 10 » ou « 10 pts » ne déclenchent rien.
- Point 7 : la place des pastilles est gardée tant que la liste défile (une centaine de pixels de liste en moins).
- Le titre « Légende » est caché aux lecteurs d'écran (`aria-hidden`), la liste portant déjà ce nom.

**Nouvelles (proposée, pas écrite).** « Ta grille, sur l'iPad : la légende montre qu'elle défile, un doigt qui fait
défiler ne pose plus d'étiquette, et la bulle te guide un manque à la fois, avec un exemple à voir ou à faire
toi-même. »

**Trouvaille (hors du lot, inscrire et continuer).** `.claude/skills/portes-terrain/SKILL.md` l. 171 nomme encore un
clone `~/Documents/GitHub/Monitorage_v6` : vrai ou périmé, à vérifier.

