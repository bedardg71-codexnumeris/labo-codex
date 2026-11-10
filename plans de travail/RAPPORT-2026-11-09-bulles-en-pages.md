# Rapport : « Les bulles en pages »

9 nov. 2026, session des parcours (cloud). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-09-bulles-en-pages.md`.
Branche `lot/bulles-en-pages`, partie de `origin/lot/bulle-sur-telephone` (19b3f46). Elle ne porte que le moteur.

⚠ Chromium seulement : WebKit est absent des sessions cloud. Le verdict Safari et iPad se prend sur le Mac.

## Retouche du 9 nov., 17 h 55 (après lecture des captures par Cowork et Grégoire)

Validé tel quel : la découpe à une fin de phrase, les pages de même hauteur, les flèches de 44 × 44 qui ne bougent
pas, la ligne du geste et « Plus tard » sur chaque page, le rendu à 820 px.

**1. Le compteur entre les flèches (décision de Grégoire) : fait.**

- Sous le texte, « ← 1/3 → ». La tête de la bulle ne garde que le titre et « n sur N ».
- Au changement de page (« → », « ← » ou les flèches du clavier), le lecteur d'écran entend « page 2 de 3 », et
  rien d'autre : la zone d'annonce du moteur ne reçoit que ces mots, le texte de l'étape n'est pas relu. Le compteur
  visible reste caché au lecteur d'écran : lu seul, « 1/3 » ne dirait pas ce qu'il compte.
- Repliée sur téléphone, rien ne change : le compteur est dans la rangée des flèches, cachée avec elle, et le clavier
  ne change pas la page.
- Le compteur s'écrit en chiffres de largeur fixe : « ← » et « → » ne bougent pas entre « 1/3 » et « 2/3 ».
- Essais : le compteur absent de la tête, et la tête réduite au titre et au rang ; le compteur entre les deux
  flèches, dans le DOM et à l'écran ; « page 2 de 2 » puis « page 1 de 2 » annoncés. Break-tests : l'ancien
  comportement remis (le compteur dans la tête, caché sur une seule page) → ROUGE « le compteur des pages hors de la
  tête », à 1180 et à 820 px ; l'annonce retirée → ROUGE. Rétablis, les 7 essais du lot sont verts.

**2. Les captures du parcours 3 : faites, et l'étape 8 couvre encore la matrice (mesure ci-dessous).**

Fusion jetable avec `origin/lot/parcours-3-evaluer` à jour (0925e22, « la cartouche nommée dans la fiche de la
production »), mêmes conflits qu'avant, résolus par union, rien poussé. Le banc du parcours 3 joué entier (grille à
niveaux), à 1180 et à 820 px : son banc ne tourne qu'à 1180, la copie jetable lui a donné une largeur.

- **Étape 2, « Ta production », sur la fiche** (le contour sur « Créer la production ») : 17 lignes à la largeur du
  texte (338 px), deux pages de 7 et 10 lignes ; la bulle fait 396 px de haut (496 sans les pages). « Créer la
  production » et les menus « Grille » et « Échelle » restent libres aux deux largeurs. À 820 px, la bulle se pose en
  bas à gauche, sur la colonne gauche de la fiche, déjà remplie à ce moment.
- **Étape 8, « Ta cartouche », la matrice remplie** : 16 lignes, deux pages de 9 et 7 lignes ; la bulle fait 374 px
  de haut (474 sans les pages), en haut à droite (x 652 à 1032 px à 1180 ; x 321 à 701 px à 820).

⚠ **En pages, la bulle de l'étape 8 couvre encore la première rangée de la matrice, dans les quatre colonnes de
niveaux, et leurs en-têtes.** Part de chaque case sous la bulle (la case amenée dans la vue comme la saisie le fait,
puis deux passages de la sonde) :

| Largeur | Rangée | I | P | S | R |
|---|---|---|---|---|---|
| 1180, en pages | 1 | 54 % | 72 % | 72 % | 24 % |
| 1180, en pages | 2 à 4 | 0 | 0 | 0 | 0 |
| 1180, sans les pages | 1 | 75 % | 100 % | 100 % | 34 % |
| 1180, sans les pages | 2 | 46 % | 61 % | 61 % | 21 % |
| 820, en pages | 1 | 72 % | 72 % | 72 % | 4 % |
| 820, en pages | 2 à 4 | 0 | 0 | 0 | 0 |
| 820, sans les pages | 1 | 100 % | 100 % | 100 % | 6 % |
| 820, sans les pages | 2 | 61 % | 61 % | 61 % | 3 % |

Les pages libèrent la deuxième rangée ; la première reste couverte aux deux tiers. Placement inchangé, comme demandé :
**Cowork tranche.** Captures `parcours-3-etape-8-…-matrice-page-1/2` et, pour comparer,
`parcours-3-etape-8-…-matrice-sans-les-pages`.

À 820 px, un clic du banc du parcours 3 est couvert à l'étape 1 (« des niveaux », dans « Ta grille ») ; c'est vrai
aussi sans les pages, donc hors de ce lot. La copie jetable l'a fait par le DOM pour aller jusqu'aux captures. À
signaler à la session des parcours 3, 4 et 5.

**3. Le parcours 9 : captures refaites** avec le compteur déplacé (trois pages, la tête « Ta pratique · 1 sur 8 »,
« ← 1/3 → »).

**Les sondes, relancées sur la retouche** (fusions jetables avec les branches à jour) : parcours 3, 3 verts sur 3 ;
parcours 6, 14 sur 14 ; parcours 8, 9 verts (5 captures sautées) ; parcours 9, 16 verts (4 captures sautées).
Aucune sonde touchée. Vitest, depuis `tests/` : 894 fichiers, 10 884 essais, tous verts.

## Ce qui est fait

**Le moteur (`js/parcours-moteur.js`).**

- La règle : le texte de la bulle est mesuré à sa largeur réelle. Au-delà de dix lignes (`LIGNES_PAR_PAGE`), il se
  coupe en deux pages ; si l'une dépasse encore dix lignes, en trois (`PAGES_MAX`). Au-delà, les trois pages restent,
  et le filet (le texte qui défile) prend le reste : c'est le dernier recours. Une découpe qui laisserait une page
  presque aussi longue que le tout (plus des deux tiers des lignes) n'est pas faite : elle coûterait une navigation
  sans épargner le défilement.
- Où couper : juste après une fin de phrase (`.`, `!`, `?`, `…`) suivie d'une espace et d'une majuscule (ou d'un
  guillemet ouvrant, d'un chiffre), jamais à l'intérieur d'une citation « … ». Parmi ces fins de phrase, la plus
  proche du milieu (pour trois pages, des tiers). Aucun mot ne change : les pages, mises bout à bout avec une espace,
  redonnent le texte au caractère près. Sans fin de phrase où couper, le texte reste entier.
- La découpe suit la largeur : un parcours qui change la largeur de sa bulle (la bulle étroite du parcours 6, la
  forme « réduite » ou « large » du parcours 9, posée dans sa sonde d'étape) la fait refaire dans le même passage de
  la sonde, sans image intermédiaire, la page affichée gardée si elle existe encore. Le texte de l'étape est lu une
  fois, au rendu : une nouvelle découpe ne le relit pas.
- Les pages ont toutes la hauteur de la plus haute : « ← » et « → » ne bougent pas sous le doigt d'une page à
  l'autre. Sous la contrainte du filet, le texte se resserre encore.
- La navigation : « ← 1/2 → » sous le texte, au-dessus de la ligne du geste (le compteur était d'abord à côté de
  « n sur N » ; déplacé à la retouche de 17 h 55)
  (« ← » désactivé à la première page, « → » à la dernière ; si le bouton qui a le focus se désactive, le focus passe
  à l'autre). Au clavier, les flèches gauche et droite quand le focus est dans la bulle, sans modificateur (Alt ou
  Cmd + ← restent au navigateur), et pas quand la bulle est repliée.
- Le lecteur d'écran : toutes les pages restent dans le paragraphe, dans l'ordre ; celles qu'on ne voit pas sont
  cachées à l'œil seulement (`u-lecteur-ecran`). L'annonce de l'étape dit le texte entier, comme avant.
- Ce qui ne change pas : la ligne orange du geste, les boutons de l'étape et « Plus tard » restent sous le texte, sur
  chaque page. L'étape avance sur l'état atteint, quelle que soit la page affichée (la sonde n'a pas changé).
- Sur téléphone : repliée, la bulle garde sa tête seule (ni « 1/2 », ni flèches) ; dépliée, elle se pagine comme
  ailleurs.
- `ParcoursMoteur.pageCourante()` rend `{ page, pages }` (lu par les bancs).

**Le style (`css/parcours.css`)** : l'indicateur, la rangée des flèches (cibles de 44 × 44 px), la règle d'une page.

**Aucun texte de parcours n'est modifié.**

## Les fusions locales (jamais poussées)

Comme demandé, les branches des parcours ont été fusionnées EN LOCAL, chacune dans une copie de travail jetable,
par-dessus ce lot : `origin/lot/parcours-3-evaluer`, `origin/lot/parcours-6-donnees-a-l-abri`,
`origin/lot/parcours-7-lire-ta-classe`, `origin/lot/parcours-8-automatiser-tes-commentaires`,
`origin/lot/parcours-9-notation-alternative`. Rien de ces fusions n'est sur la branche.

**Toutes conflictent**, pour la même raison : ces branches partent de `main`, pas du groupe 2. Les conflits :

- `index.html` : les jetons de cache (`?v=`) des fichiers touchés des deux côtés ;
- `js/assistance.js` : le refus « grand écran » du groupe 2 (`tropPetitPour`) contre ce que chaque parcours ajoute
  au panneau (la ligne facultative du parcours 3, la condition d'entrée du parcours 6, le refus des parcours 8 et 9) ;
- `css/parcours.css`, pour le parcours 9 seulement : deux règles voisines ajoutées des deux côtés.

Ils sont tous additifs : je les ai résolus par union (les deux côtés gardés), pour faire tourner les bancs.
⮕ **Ta règle « si une fusion conflicte, une seule de ces bulles » s'applique** : les captures ne portent que sur la
bulle de l'étape 1 du parcours 9 (la plus longue des trois : 1 110 caractères). Celles du parcours 7 (étape 7) et du
parcours 3 (étape 2) ne sont pas faites.

Pour la fusion du groupe 3 sur le Mac, deux choses à savoir :

- ces conflits reviendront à chaque parcours ; la résolution par union est celle qui a tenu ici ;
- dans `assistance.js`, la fusion avec le parcours 9 met deux variables `refus` dans la même fonction
  (`creerParcoursItem`) : l'avis « grand écran » du groupe 2 et l'avis de refus du parcours 9. Ça fonctionne (la
  première est déjà posée quand la seconde la remplace), mais c'est un piège de lecture : à renommer à la fusion.

## Les essais du lot

Banc `tests/integration/bulles-en-pages-2026-11-09.spec.js`, 7 essais, verts sous Chromium, sur un parcours de banc
(textes fictifs) :

- à 1180 et à 820 px : la bulle courte n'est pas coupée ; la longue (697 caractères) se coupe en deux pages, à 291,
  la fin de phrase qui précède la citation (la plus proche du milieu, 343, est DANS la citation) ; chaque page tient
  en dix lignes ; mises bout à bout, elles redonnent le texte ; l'arbre d'accessibilité du paragraphe contient le
  texte des deux pages, page 1 affichée ; « → », « ← », les flèches du clavier ; avec Alt, Cmd, Ctrl ou Maj, rien ne
  change ; le focus d'une flèche devenue inactive passe à l'autre ; « → » au même endroit sur les deux pages ; la
  ligne du geste et « Plus tard » visibles sur chaque page ; le geste fait avancer depuis la page 2 ;
- à 390 px : repliée, ni « 1/2 » ni flèches, et le clavier ne change pas la page ; dépliée, elle se pagine ;
- un texte de 1 126 caractères se coupe en trois pages de dix lignes au plus ;
- la page affichée reste au passage du seuil du téléphone, aller et retour ;
- une largeur posée par la sonde d'étape (`atteint`) refait la découpe dans le même passage : aucune image avec une
  découpe faite à une autre largeur ;
- une seule fin de phrase, tout près de la fin d'un texte de plus de dix lignes : pas de découpe.

**Break-tests** (chacun rouge, puis rétabli et vert) : `LIGNES_PAR_PAGE` à 99 ; la garde des guillemets retirée
(rouge « citation entière ») ; `PAGES_MAX` à 2 ; l'égalisation des hauteurs retirée (« → » bouge) ; le filtre des
modificateurs retiré ; le filtre de la bulle repliée retiré ; le passage du focus retiré ; la découpe après
`atteint` retirée ; la page remise à 1 au passage du seuil ; l'ancienne règle de découpe (toute découpe gardée) ;
les pages cachées au lecteur d'écran par `aria-hidden` (rouge « la page 2, cachée à l'œil, reste lue »).

**Vitest** (depuis `tests/`) : 894 fichiers, 10 884 essais, tous verts sur la version finale. Deux cliquets avaient rougi en cours de lot, tous deux de mon fait : une
classe posée sans règle CSS (`parcours-bulle-page`, règle ajoutée), une fonction de plus au-dessus de la complexité
15 (`sonder`, 15 → 18 ; la suite de l'état atteint et le placement en sortent, `sonder` repasse sous 13) et une pause
fixe de trop dans un essai (remplacée par une attente d'images).

**Les bancs du groupe 2**, avec ce lot et sur `origin/lot/bulle-sur-telephone` sans lui : les mêmes rouges des deux
côtés (5 avec le lot, 7 sans, les 5 étant communs). Le détail est plus bas, « À inscrire ».

## Les sondes des parcours 3, 6, 8 et 9

Dans les fusions locales, avec le moteur de ce lot. Les parcours 6 et 9 (ceux qui changent la largeur de leur
bulle) ont été relancés sur la version finale : 14 verts sur 14 et 16 verts sur 16 (captures sautées). Pour que « tenir » ne soit pas creux, un relevé local (jamais
poussé) a noté chaque bulle réellement coupée pendant les bancs :

| Parcours | Banc | Bulles coupées pendant le banc (exemples) |
|---|---|---|
| 3 | 6 verts sur 6, captures comprises | « Ta production », « Tes consignes », « Une première production », « Ta pratique », « Ta cartouche » : 2 pages |
| 6 | 14 verts sur 14 | « Range ton fichier » : 2 pages, 3 dans la bulle étroite à droite de l'aperçu (213 px) ; « Quand le rouvrir » : 2 |
| 8 | 12 verts sur 14 (les 2 rouges ne sont pas de ce lot, ci-dessous) | « Ta grille », « Tes codes », « Ta note », « Tes cas » : 2 pages ; « Ce que l'étudiant·e lit », « Ta rétroaction s'écrit seule » : 3 |
| 9 | 21 verts sur 22 (le rouge n'est pas de ce lot, ci-dessous) | « Ta pratique » : 3 pages ; « Ta sélection » : 3 pages à 338 px, puis 2 à 518 px quand sa sonde élargit la bulle |

**Aucune sonde de parcours n'a été touchée.** Les rouges restants, départagés en relançant sur la même fusion sans
les pages :

- parcours 8, capture à 390 px (« Continuer » caché) et parcours 9, capture des standards à 390 px (texte de
  l'étape 1 caché) : rouges aussi sans les pages. C'est la bulle repliée du groupe 2 contre des bancs écrits avant
  elle (ces captures ne tournaient pas au premier passage, faute de `CAPTURES_PARCOURS`) ;
- parcours 8, « sans fichier, sur une grille déjà employée » : la rétroaction générée n'est pas arrivée en 5 s ;
  4 verts sur 4 relancé seul, vert aux deux passages d'avant.

⚠ **Une sonde a tenu de justesse, et c'est de mon fait** : parcours 8, « 820 × 600 : un orange affiché avant le
lancement ne couvre pas la bulle ». Au début de l'étape 1, la bulle se pose d'abord en haut, puis descend une
fraction de seconde plus tard (la cible bouge dans la page ; c'est vrai avec ou sans les pages). La pile d'avis du
parcours 8 ne se replace que toutes les 200 ms. Sans les pages, la bulle était trop haute pour qu'aucun coin la
laisse libre : la pile passait dessous d'emblée. Paginée, plus courte, elle laissait un coin libre au premier
placement, puis l'avis la couvrait le temps que la pile suive. Mesures à charge égale (4 essais en parallèle) :

- première version du lot : 4 rouges sur 48 ; sans les pages : 0 sur 16 ;
- version finale (pages de hauteur égale, donc bulle plus haute) : 0 rouge sur 64. Le recouvrement passager existe
  encore, plus rare (0 ou 1 fois par essai, au plus 192 ms mesurées) ; la sonde le tolère sous 300 ms ;
- avec la sonde de la pile à 100 ms au lieu de 200 (une ligne de `js/utils-notifications.js`, sur la branche du
  parcours 8) : 32 verts sur 32 avec la première version. C'est le correctif durable, à poser à la fusion du groupe 3 :
  ma branche ne porte pas ce fichier. Inscrit ci-dessous.

Le parcours 3, « contour posé sur #selectCartoucheEval », a rougi une fois quand quatre bancs tournaient en même
temps ; seul, vert.

## Les captures

`plans de travail/captures-2026-11-09-bulles-en-pages/`, sombre, à 1180 et à 820 px, refaites à la retouche :

- parcours 9, étape 1 : ses trois pages (435, 341 et 354 caractères ; 9, 7 et 8 lignes), puis après le geste
  (l'assistant ouvert, la bulle à sa forme réduite, le second temps de l'étape). 431 px de haut d'une page à l'autre ;
- parcours 3, étape 2, sur la fiche de la production : ses deux pages ;
- parcours 3, étape 8, la matrice de la cartouche remplie : ses deux pages, et la même bulle sans les pages.

## La relecture d'un agent neuf

Verdict : « le moteur est sain et rien n'est bloquant ». Huit constats, tous dans le code de ce lot, donc finis ici :

1. Une largeur posée dans `atteint` (parcours 9) laissait une découpe périmée environ 100 ms : **corrigé** (la
   découpe et la place suivent dans le même passage ; le texte lu une fois au rendu) ; essai et break-test.
2. Les flèches du clavier changeaient la page d'une bulle repliée : **corrigé** ; essai et break-test.
3. Alt, Cmd, Ctrl ou Maj + flèche changeaient la page (et bloquaient le retour du navigateur) : **corrigé** ; essai
   et break-test.
4. Les flèches mesuraient 44 × 36 px : **corrigé**, 44 × 44.
5. « → » bougeait sous le doigt d'une page à l'autre : **corrigé** (hauteur de la plus haute page) ; essai et
   break-test.
6. Une abréviation (« p. 12 ») passe pour une fin de phrase : **commenté dans le code**, aucun texte de parcours
   n'en a (vérifié par la relecture sur les neuf branches).
7. Une découpe déséquilibrée qui n'aide pas : **corrigé** (règle des deux tiers) ; essai et break-test.
8. Deux tests trompeurs (« au plus près du milieu » à ±25 % ; le lecteur d'écran jugé par `textContent`) et trois
   chemins sans essai : **corrigés** (291 exigé ; l'arbre d'accessibilité ; trois essais ajoutés).

## Ce qui attend Grégoire

- **Deux mots neufs, lus par le lecteur d'écran** : « Page précédente » et « Page suivante », les noms des boutons
  « ← » et « → ». Posés parce qu'un bouton sans nom n'est pas lisible ; **proposés**, à valider ou à remplacer.
  « 1/2 », « ← » et « → » viennent de la consigne.
- **L'apparence** : sur les captures, une page plus courte que la plus haute garde un blanc sous son texte (le prix
  de flèches qui ne bougent pas). Et la bulle étroite de l'étape 3 du parcours 6 (213 px, à droite de l'aperçu)
  passe à trois pages.
- **Les captures du parcours 7 (étape 7) et du parcours 3 (étape 2)** ne sont pas faites : les fusions locales
  conflictent, ta règle s'est appliquée.

## Ce qui n'est pas vérifié

- **WebKit, Safari, l'iPad** : rien. Les polices de Safari ne coupent pas les lignes au même endroit ; le nombre de
  pages peut différer d'un navigateur à l'autre (c'est voulu : la mesure se fait à l'écran).
- **Un vrai lecteur d'écran** (VoiceOver) : non ; seulement l'arbre d'accessibilité de Chromium.
- **Les données réelles** : à mesurer sur le Mac.
- **Les parcours 3 et 8 sur la version finale** : leurs bancs ont tourné sur la version d'avant la sortie de deux
  fonctions de `sonder` (même ordre d'opérations, rien d'autre ne change) ; les parcours 6 et 9 ont été relancés.
- **Les sondes du parcours 7** : non demandées, non lancées.

## Les trouvailles et leur issue

- **À inscrire au BACKLOG** (inscrire et continuer) :
  1. Fusion du groupe 3 : les conflits décrits plus haut reviendront ; dans `assistance.js`, deux `var refus` dans
     `creerParcoursItem` après la fusion du parcours 9, à renommer.
  2. Parcours 8 : la pile d'avis suit la bulle avec 200 ms de retard ; la passer à 100 ms (mesuré : 32 sur 32 à
     charge) à la fusion du groupe 3.
  3. Groupe 2, bancs rouges sous Chromium dans le cloud, avec ou sans ce lot : `bulle-sur-telephone` « 390 px,
     Découvrir » (`droite` 372 au lieu de 382, vraisemblablement la barre de défilement), « un parcours pour grand
     écran… » (« Element is outside of the viewport »), « le refus suit la largeur » (instable : 5 rouges sur 26
     sans le lot, 8 sur 26 avec, sans parcours ouvert) ; `bulles-au-doigt-540` (trois essais) ;
     `parcours-1-et-2` « panneau ». À juger sur le Mac.
  4. Les captures à 390 px des parcours 8 et 9 butent sur la bulle repliée du groupe 2 : à ajuster à la fusion.
- **Commenté dans le code** : les abréviations prises pour des fins de phrase (constat 6).

## Source ou stock

Rien n'est écrit dans les données : le lot ne change que l'affichage de la bulle.

