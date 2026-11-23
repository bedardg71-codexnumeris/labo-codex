# Rapport — la bulle des parcours 2, 4 et 6, et le bandeau de version (23 novembre 2026)

**Branche** : `lot/bulle-et-bandeau`, partie de `origin/main` à `4d1043cce` (1.258.0, build 1122-2306).
**Mandat** : session coordonnatrice de Cowork (« Gestion des pratiques de notation 4 »), familles B et C du
verdict WebKit de la 1.258.0 (`RAPPORT-2026-11-23-verdict-webkit-1.258.0.md`, sur `origin/lot/verdict-1.258`).
**Fait** : la règle générale de la bulle, le bandeau sous l'en-tête, les 12 rouges verts, la release 1.258.1
commitée en local (`ff520be07`, build 1123-1652), la branche poussée.
**Reste** : la relecture de Cowork, le feu vert de Grégoire, la fusion dans `main` (aucune n'est faite), la ligne
de Nouvelles à trancher (§ 7), l'iPad au doigt (§ 6).

Les captures : `plans de travail/captures-2026-11-23-bulle-et-bandeau/` (20 fichiers, `avant-…` sur `4d1043cce`,
`apres-…` sur le lot ; WebKit, données fictives).

---

## 1. Ce que la mesure a montré

Mesuré sous WebKit sur `4d1043cce`, avant tout code : la bulle à chaque étape, avec puis sans les deux lignes de
tête (cachées dans la page, le moteur laissé libre de se replacer), et la plus haute bande de l'écran où une bulle
de cette largeur ne couvre rien de ce qu'elle évite.

| Étape | Fenêtre | Bulle | Plus haute bande libre | Sans les deux lignes de tête |
|---|---|---|---|---|
| Parcours 2, étape 1 | 1180 × 900 | 380 × 703 | 643 | 615 : tient, ne couvre plus rien |
| Parcours 2, étape 1 | 1180 × 820 | 380 × 703 | 561 | 615 : couvre encore |
| Parcours 4, étape 2 | 1180 × 900 | 1081 × 347 | 313 | sans objet : elles n'y paraissent pas |
| Parcours 4, étape 2 | 820 × 1180 | 780 × 411 | 342 | sans objet |
| Parcours 6, étape 3 | 1180 × 900 | 250 × 837, bas à 929 | écran utile : 800 | sans objet |
| Parcours 6, étape 3 | 1180 × 820 | 250 × 804, bas à 896 | écran utile : 720 | sans objet |
| Parcours 6, étape 3 | 1179 × 900 | 380 × 619 | — | sans objet |

**Mesuré.**
- Les deux lignes de tête pèsent 60 px (20 pour « Parcours 2 · … », 40 pour la phrase de la poignée). Elles ne
  paraissent qu'à la première bulle d'un parcours : elles n'expliquent donc ni le parcours 4 (étape 2) ni le
  parcours 6 (étape 3).
- Parcours 2 : l'inférence du verdict tient à 1180 × 900 (sans les deux lignes, la bulle tient) ; elle ne suffit
  pas à 1180 × 820, où le reste du texte dépasse déjà la bande libre de 54 px.
- Parcours 4 : la bulle manque de 34 px (1180) et de 69 px (820). L'essai long était déjà rouge à l'étape 2 sur
  `1a0474e19` (22 nov., 18 h 16), donc **avant** les textes récrits le 22 au soir.
- Parcours 6 : ce n'est pas la hauteur du texte. Le filet du moteur plafonnait la bulle à la fenêtre entière moins
  16 px (884), alors que l'écran utile commence sous l'en-tête (84 px) : posée en haut de l'écran utile, une bulle
  de plus de 800 px dépassait le bas. Et ce filet, posé en ligne, écrasait le plafond de la feuille de style
  (55 % de la fenêtre) prévu pour la bulle posée sur l'aperçu : c'est le rouge à 1179 px.
- Parcours 2, cause seconde : depuis que l'étape nomme sa section (19 nov.), elle passait par une branche du
  placement qui n'essayait plus la forme large, écrite le 16 nov. pour cette étape précisément.

**Lu.** Le commentaire du 16 nov. dans `moinsCouvrir` nomme « Ton trimestre » à 1180 × 900 et la ligne de la
poignée ; `7bc06f379` (23 nov.) ouvre les parcours 2 à 8.

**Inféré, non vérifié.** Que les neuf essais aient été verts le 22 nov. au matin : je ne l'ai pas rejoué. Pour le
parcours 4, la mesure sur `1a0474e19` dit seulement que le rouge précède le soir du 22.

**Conclusion.** Trois causes, pas une : la bulle a grandi (parcours 2 et 4), le filet ignorait l'en-tête et la
feuille de style (parcours 6), et la forme large n'était plus essayée (parcours 2). Aucune ne demande de toucher
aux mots.

## 2. Ce qui a été fait

**La bulle** — une règle générale, dans `js/parcours-moteur.js` et `css/parcours.css`. Aucun mot ne change, ne
disparaît, ne se replie. Aucune place déclarée n'a été touchée (`parcours-classe.js`, `parcours-recevoir.js`,
`parcours-donnees.js` : inchangés).

1. Le filet vaut l'écran utile (sous l'en-tête, au-dessus du bandeau de la démo) et respecte le plafond que la
   feuille de style donne à la bulle.
2. Avant de couvrir quoi que ce soit, la bulle se limite à la plus haute bande où elle ne couvre rien, cherchée à
   12 px de ce qu'elle désigne ; son texte y défile. Elle y prend sa forme large si elle y montre une plus grande
   part de son texte. Plancher : 240 px (celui de `serrer`) ; sous ce plancher, rien ne change.
3. Tant qu'il reste des lignes à lire plus bas, leur bord du bas se fond.
4. La forme de la bulle est gardée d'un passage de la sonde au suivant (120 ms), et rechoisie quand ce qu'elle
   évite change.

Les points 3 et 4 viennent de défauts que la règle 2 aurait créés, trouvés en chemin (§ 8).

**Le bandeau de version** — `js/init-inline.js` : sa place est mesurée quand il paraît, 12 px sous l'en-tête et la
bande du groupe actif. Son texte ne change pas. `index.html` n'est pas touché, hors jetons de la release.

## 3. Ce qu'on voit maintenant

| Écran | Avant | Après |
|---|---|---|
| Parcours 2, « Ton trimestre », 1180 × 820 | la bulle sur « Session », l'année et le début des dates ; 3 flèches | la bulle à droite, sous le nom du trimestre, large de 520 px et haute de 400 ; les cinq champs et « Créer le trimestre » libres, 6 flèches ; le texte défile dans la bulle |
| Parcours 2, 820 × 1180 | la bulle au milieu, entière | la bulle en bas à gauche, large, entière |
| Parcours 4, « Vérifie avant d'importer », 1180 | la bulle sur « Importer » | la bulle sous « Importer », haute de 300 px ; sa dernière note défile |
| Parcours 4, 820 | idem | idem, haute de 334 px |
| Parcours 6, « Range ton fichier », 1180 × 820 | le bas de la bulle hors de la fenêtre, « Quitter le parcours » coupé | la bulle tient entre l'en-tête et le bas ; « Quitter le parcours » visible ; le texte défile |
| Parcours 6, 820 × 1180 | la bulle au coin, à sa hauteur entière (mesuré à 1179 × 900 : 380 × 619) | la bulle au coin, plafonnée à 55 % de la fenêtre |
| Bandeau de version, 1180 et 820, clair et sombre | sur « Codex », le thème et le menu ; à 820, sur la fin de la navigation | sous l'en-tête et la bande du groupe ; le menu s'ouvre sans le fermer |

Captures : `avant-…` et `apres-…`, même nom. Le banc du parcours 4 joue sa fenêtre large à 1180 × 900.

**Trois limites qui se voient sur les captures, à regarder.**
- Parcours 2 à 1180 × 820 : la bulle ne montre que deux lignes et demie de son texte ; la consigne « Touche
  « Créer le trimestre » » est sous la coupe, à faire défiler. Le fondu le signale. C'est la place qui tient sans
  toucher aux mots ; si c'est trop peu, la question des mots de cette première bulle remonte à Grégoire.
- Parcours 2 : la bulle couvre la colonne « Semaines spéciales », que l'étape ne désigne pas.
- Parcours 6 à 820 px : la bulle couvre le haut de l'aperçu (son titre, sa première ligne), comme avant. Sous
  1180 px, l'étape ne lui fait éviter que le bouton.

## 4. Les essais

**Les 12 rouges des familles B et C : verts.** Deux attentes ont changé, pour des rouges qui existaient déjà sur
`4d1043cce`, cachés derrière ceux de la bulle (mesuré : le jugement de place retiré, l'essai rougit plus loin).

| Essai | Attente d'avant | Attente d'après | Pourquoi |
|---|---|---|---|
| `parcours-6` 343 (clair, sombre), dernière bulle | « Touche « Terminer » » | « Touche « Voir le parcours 7 », ou « Terminer » », et le bouton « Voir le parcours 7 » | depuis `7bc06f379`, un parcours suit celui-ci ; `consigneDeLaFin` (décision du 14 nov.) |
| `parcours-4` 155, étape 4 à la reprise | une flèche vers la palette « Tampons » entière | une flèche vers l'engrenage, et la bulle ne couvre pas la palette | une bulle en lignes (19 nov.) envoie ses flèches aux gestes et à ce qu'il faut toucher |

La seconde est **ma lecture** de la règle des flèches : à confirmer par Cowork.

**Bancs neufs.** `tests/integration/bulle-et-bandeau-2026-11-23.spec.js` (9 essais) et
`tests/unit/sentinelle-bulle-bande-libre-2026-11-23.test.js` (7 essais).

**Comptes, sur `ff520be07`, WebKit, secteur, `caffeinate -i`, un worker, config du dépôt (une reprise).**

| Passage | Résultat |
|---|---|
| Vitest complet, depuis `tests/` | 958 fichiers, 12 334 essais, tous verts |
| 53 bancs (270 essais) : parcours, deux temps, bulles, flèches, `codex-de-depart`, en-tête, accueil, bandeaux, témoin | 235 passés, 5 verts au second essai, 9 rouges, 21 sautés par les bancs |

Les 9 rouges : 8 de la famille A (`je-regarde-commentaires` 79 × 2, `je-regarde-lire-ta-classe` 62 × 2,
`je-regarde-recevoir` 99 × 2, `nous-faisons-recevoir` 130 × 2) et 1 de la famille E (`parcours-8` 623). Hors
mandat, non touchés.

Les 5 verts au second essai :
- `parcours-1-et-2` 131, `parcours-5-monter-ton-cours` 425, `parcours-fleches` 425 : dans la liste des instables
  du verdict.
- `en-tete-epure` 249 : instable sur la base aussi (joué seul, 8 rouges sur 8 sur `4d1043cce` comme sur le lot).
- `je-regarde-cours` 158 (1180 × 820) : un rouge sur neuf passages, sur le geste qui relie deux blocs ; six
  passages de suite verts ensuite. Cause non établie.

`parcours-4` 155 : deux rouges sur une quinzaine de passages pendant la session (un critère de grille jamais
ajouté pendant la mise en place du parcours 3 ; l'autre non lu), cinq passages de suite verts ensuite, vert aux
deuxième et troisième tours. Cause non établie.

## 5. Vérification adverse

Chaque défense cassée, un essai rougit (WebKit pour le moteur, Vitest pour la fonction pure) ; rétablie, vert.

| Casse | Essai qui rougit |
|---|---|
| le filet rendu à la fenêtre entière | banc neuf « Range ton fichier » 1180 × 820 ; `parcours-6` 1180 × 820 |
| le plafond de la feuille de style ignoré | `parcours-6` 1179 px |
| la bande libre retirée | banc neuf « Ton trimestre » ; `parcours-2` 248 et 563 |
| la bande cherchée sans les 12 px | banc neuf « Ton trimestre » et `parcours-2` 563 (6 flèches) |
| la forme jamais gardée | banc neuf : le texte défilé remonte |
| la largeur jamais rechoisie | `parcours-8` 591 |
| l'élargissement d'une bulle trop haute, hauteur plafonnée comptée | banc neuf « bulle plus haute que l'écran utile » |
| la branche à section sans la bande | `parcours-2` 248 |
| la forme large jamais prise dans la bande | banc neuf « Ton trimestre » 1180 × 820 |
| le fondu jamais posé | banc neuf « Ton trimestre » 1180 × 820 |
| la mesure du bandeau retirée | banc neuf (4 essais) ; `codex-de-depart` |
| `hauteurLibre` : rend l'écran ; sans les places collées ; sans arrondi du côté libre | la sentinelle (5, 1 et 1 essais) |

Deux casses n'ont d'abord rien fait rougir : un essai manquait à chacune, ajouté depuis (« entre deux colonnes »
dans la sentinelle, « bulle plus haute que l'écran utile » dans le banc).

## 6. Ce qui reste non jugé

- **Le verdict complet n'a pas été joué** (choix du mandat). Non jugés : les quelque 1 670 essais des autres
  bancs, dont tout ce qui lit `js/init-inline.js` hors bandeau. Vitest complet les couvre en partie.
- **L'iPad au doigt.** La poignée est jouée à la souris seulement : la bulle plafonnée se déplace et reste dans la
  fenêtre. Non jugé : le glisser au doigt et au stylet ; le défilement intérieur au toucher (l'élan, et s'il
  entraîne la page derrière) ; le fondu sous Safari iPad ; le clavier à l'écran ouvert sur une bulle plafonnée.
- **Une bulle déplacée par la personne** reprend sa hauteur entière, bornée à l'écran utile : non jugé à l'œil.
- **Le téléphone** (390 px) n'est pas touché par la règle ; ses bancs sont verts.
- **Le bandeau** : jugé à 1180 × 820 et 820 × 1180. Non jugé : 390 px ; la page déjà défilée quand il paraît (la
  mise à jour distante) ; ce qu'il couvre de la page sous l'en-tête, variable selon l'écran.
- **Chromium** : non joué.

## 7. La release, préparée

`scripts/release.mjs patch` : 1.258.1, build 1123-1652, les quatre points de vérité cohérents. Commit local
`ff520be07`. Rien n'est fusionné ni poussé sur `main`.

**La ligne de Nouvelles.** Je propose de **n'en mettre aucune** : c'est la réparation de ce que la 1.258 annonce
depuis hier, et `js/changelog-data.js` n'est pas touché. Si Grégoire en veut une, sous la 1.258 :

> Les bulles des parcours ne couvrent plus ce qu'elles te demandent de remplir ou de toucher ; quand la place
> manque, leur texte défile dans la bulle.

**Complexité** (par rapport à la 1.258.0) : fonctions au-dessus de 15, 433 (inchangé, la sentinelle le tient) ;
au-dessus de 30, 75 ; `js/parcours-moteur.js`, 2 904 → 3 038 lignes. Les deltas des sommes ne sont pas calculés :
je n'ai pas rejoué la mesure sur la base.

**Source ou stock.** Rien n'est écrit chez l'utilisateur : ni clé, ni donnée. Le correctif est tout entier dans le
code servi.

## 8. Ce que j'ai supposé

- Que « sous l'en-tête » comprend la bande du groupe actif : à 820 px, 12 px sous l'en-tête seul, le bandeau
  couvrait le sélecteur de groupe.
- Qu'une flèche qui ne peut plus se tracer compte autant qu'un champ couvert : d'où la bande cherchée à 12 px,
  qui coûte de la hauteur (parcours 2 à 1180 × 900 : 476 px au lieu de 631).
- Que le fondu est permis par le mandat : c'est un indice de défilement, pas un mot. Il est neuf à l'œil : à
  faire relire sur capture.
- Que 240 px est le bon plancher : repris de `serrer`, non remesuré.
- Que les deux attentes changées (§ 4) suivent des décisions déjà prises.

## 9. Les trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| Le texte défilé dans une bulle plafonnée remontait à chaque passage de la sonde (mon lot) | **corrigé** (la forme gardée), essai neuf |
| La forme large, une fois prise, restait quand l'étape changeait ce qu'il faut toucher : `parcours-8` 591 et 601 rougissaient (mon lot) | **corrigé** (la largeur rechoisie) |
| Une bulle plafonnée coupait ses lignes sans le dire (mon lot) | **corrigé** (le fondu), essai neuf |
| `parcours-8` 623, famille E : cause mesurée. À 820 px, la liste des critères et la palette occupent l'écran, aucune bande n'est libre de tout, et la bulle couvre le champ à remplir ; l'étape ne déclare pas `serrer`, qui dégagerait au moins ce champ. Avec ce lot, l'essai avance d'un champ puis bute au suivant | **inscrire** — hors mandat, non touché |
| `en-tete-epure` 249 lit l'état juste après un redimensionnement, sans attendre | **inscrire** |
| `parcours-4` 155 et `je-regarde-cours` 158 : instables, cause non établie | **inscrire** |
| Parcours 6 sous 1180 px : la bulle couvre le haut de l'aperçu | **inscrire** — la place déclarée, à voir avec Grégoire |
| `scripts/release.mjs` a monté les jetons de cinq fichiers que ce lot ne touche pas (`changelog-data`, `interventions`, `parcours-commentaires`, `parcours-lire-ta-classe`, `saisie-presences`) | **commenter** — sans conséquence observée, non expliqué |
| `hauteurNaturelle`, que le téléphone emploie, ne compte pas ce qui défile dans les lignes | **commenter** — aucun symptôme, bancs du téléphone verts |
