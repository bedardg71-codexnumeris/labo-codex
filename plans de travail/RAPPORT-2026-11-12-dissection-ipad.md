# Rapport du lot `lot/dissection-ipad` — la dissection sur l'iPad (12 nov. 2026)

**Relais.** Branche `lot/dissection-ipad`, partie de `main` (`271dc9177`, la 1.243.0). Mandat : relais de la
conversation du Projet, 12 nov., 6 h 35 (huit points). **Fait** : les huit points, sur la branche, PR d'aperçu
ouverte. **Reste** : l'essai de Grégoire sur l'iPad (porte terrain `PORTES-TERRAIN-2026-11-12-dissection-ipad.md`,
un geste par tour) ; la fusion attend son verdict. Commit, build, aperçu : section « Livraison ».

## Livraison

(Rempli au push : commit, build, adresse de l'aperçu, verdicts.)

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
