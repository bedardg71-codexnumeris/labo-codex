# Demande de relecture – la dissection, lot 7 : « Rattacher »

> Claude Code, dimanche 18 octobre 2026, vers 17 h 05 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-7-rattacher.md` (16 h 45). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi `VERDICT-RELECTURE-2026-10-18-version-1.205.0.md`, la consigne du lot, la consigne du jour et son archive. **Pas de version, pas de push.**

## État mesuré

- **Vitest complet**, lancé depuis `tests/` : **776 fichiers, 9 230 essais, tous verts**. Avant le lot, on en comptait 775 et 9 214. Le banc neuf, `materiel-dissection-7-rattacher.test.js`, compte 16 essais.
- **WebKit, specs `materiel-*`** (ce n'est pas le verdict) : **13 vertes, 0 rouge**. Les 17 essais ignorés appartiennent à l'assistant débranché.
  - La spec neuve, `materiel-dissection-7.spec.js`, couvre :
    - les deux touchers au pointeur, le choix annulé (par un second toucher, puis par Échap) ;
    - le lien : la marque (pointillé et « ↳ », mesurés par `getComputedStyle`), la flèche de B vers A ;
    - les refus « déjà la suite » et « boucle », le lien défait ;
    - l'étiquette refusée sur une suite ;
    - la création, puis le critère retrouvé sous son nom entier dans Grilles de critères ;
    - à 820 px : aucun défilement de côté, l'outil d'au moins 44 px.
  - Dans la spec du lot 1, la palette compte maintenant 2 outils : « Suite » + « Couper » + « Rattacher ».
- **Break-tests**. Chaque fois, le fichier est restauré depuis une copie.

| Ce que j'ai cassé | Essais qui rougissent |
|---|---|
| L'ordre des gestes au lieu de l'ordre de lecture | L.b, L.e, K.d, D.b |
| B qui compte encore comme morceau à part | L.a, L.c, L.d, L.e, K.d |
| Un lien en boucle accepté (refus « boucle » et « déjà la suite » retirés) | F.b, F.c |

- **Capture à 820 px** : `dissection-7-rattacher-820.png`, sortie de la spec. Elle montre les deux suites marquées, les flèches qui remontent vers « Nuances fictives du propos », et la lecture « 1 critère ».
- **Au passage (point 8)** : la raison « aucun critère dans sa rangée ; une ligne de total prend l'étiquette « Total » » est marquée « validé G. 18 oct. 13 h 48 ».

## Ce que j'ai décidé seul (suppositions nommées)

1. **Un seul niveau.** A n'est jamais lui-même une suite.
   - Quand on rattache à A un B qui avait déjà ses propres suites, ces suites passent à A. C'est le cas où Grégoire commence par « preuves) » → « (explications, … », puis « (explications, … » → « Idées secondaires ».
   - Le refus « boucle » est donc le cas où A est une suite de B. Il passe avant « déjà la suite », sinon le message dirait de rattacher B à lui-même.
2. **Un refus garde la suite choisie**, pour que Grégoire puisse toucher tout de suite le bon morceau. Un second toucher sur la suite, ou Échap, ou « Terminer » annule le choix.
3. **Pendant le choix, toucher un morceau déjà rattaché donne le refus « déjà la suite »** et ne défait pas son lien. Le lien ne se défait que par un premier toucher, quand aucune suite n'est choisie.
4. **Couper un morceau lié** : la première partie prend sa place dans le lien, comme elle prend son étiquette.
   - Annuler la coupe défait d'abord les liens qui touchent ses parties, sans rendre le lien d'avant la coupe. La ligne d'état ajoute alors : « Le lien qui touchait ses parties est défait. »
5. **Une étiquette posée sur une suite n'est pas écrite du tout**, plutôt qu'écrite puis ignorée. Le compteur de la palette reste ainsi juste.
   - Par sécurité, `comprendre` ignore aussi l'étiquette d'une suite.
6. **La marque d'une suite prend la couleur de l'étiquette de son A**, en pointillé, avec le symbole « ↳ ».
   - Le symbole est caché aux lecteurs d'écran (`content: '↳ ' / ''`).
   - Une infobulle (`title`) donne « Suite de « … » ».
7. **La flèche passe par la gauche des deux morceaux**, en pointillé, et seulement si les deux sont visibles dans le canevas.
   - J'ai borné la courbe au canevas : sur la première capture, elle mordait sur la palette.
8. **Factorisations dans mon propre lot** :
   - `etatNeuf(doc)` remplace trois copies de l'état initial ;
   - `lire()` remplace six appels à `comprendre` ;
   - `gesteToucher` est maintenant partagé par « Couper » et « Rattacher ».
9. **La grille (d7)** reprend (d) et y ajoute une partie D et une case de six lignes, avec un nom sur trois lignes entrecoupées de deux cases à cocher. Ses textes sont inventés.
   - La spec WebKit n'étiquette que cette case : les lignes longues de (d) sont déjà coupées au pointeur dans la spec du lot 5.
   - Le banc Vitest coupe (d) en entier.

## Les textes neufs

« Rattacher » et « Joint un morceau à celui dont il est la suite » sont validés (16 h 44). Tous les autres textes sont **provisoires**.

| Où | Texte |
|---|---|
| Bandeau | « Outil « Rattacher » : touche d'abord le morceau qui en continue un autre, puis celui qu'il continue. Touche un morceau déjà rattaché pour défaire son lien. » |
| Bandeau, suite choisie | « Outil « Rattacher » : touche maintenant le morceau que « B » continue. Retouche « B » pour annuler. » |
| Ligne d'état, outil pris | « Outil « Rattacher » en main : touche d'abord le morceau qui en continue un autre. » |
| Ligne d'état | « Suite choisie : « B ». Touche maintenant le morceau qu'il continue. » |
| Ligne d'état | « Choix annulé : aucun lien créé. » |
| Ligne d'état | « Morceaux rattachés : l'application lit « A B ». » |
| Ligne d'état (ajout) | « L'étiquette « X » de la suite est retirée : celle du premier morceau vaut pour le texte entier. » |
| Ligne d'état | « Lien défait : « B » redevient un morceau à part. » |
| Refus | « Un morceau ne se rattache pas à lui-même. » (inatteignable au doigt : retoucher la suite annule le choix) |
| Refus (texte de la consigne) | « Ce morceau est déjà la suite de « A » : rattache plutôt à celui-là. » |
| Refus | « Ce morceau est déjà la suite de « B » : les rattacher dans l'autre sens ferait une boucle. » |
| Étiquette sur une suite | « Ce morceau est la suite de « A » : l'étiquette de « A » vaut pour les deux. Défais le lien avec « Rattacher » pour l'étiqueter à part. » |
| Toucher une suite, sans outil | « Ce morceau est la suite de « A » : l'application les lit comme un seul texte. » |
| Infobulle d'une suite | « Suite de « A » » |
| Annuler une coupe (ajout) | « Le lien qui touchait ses parties est défait. » |

Dans ces textes, les morceaux sont nommés par leurs premiers mots (40 caractères au plus). Seul « l'application lit » donne le texte entier.

## Trouvailles

Aucune hors du lot.

## Ce qu'aucune machine n'a éprouvé

- **Le doigt réel sur l'iPad.** Dans WebKit, les événements de pointeur sont synthétiques. Les 44 px mesurés sont ceux de l'outil dans la palette. Un morceau d'une ligne, comme « preuves) », garde la hauteur de sa ligne de texte (environ 20 px), comme depuis le lot 1. Deux touchers sur des lignes courtes et voisines sont le geste à éprouver au doigt.
- **La lisibilité de la flèche en mode sombre**, sur sa vraie grille.
