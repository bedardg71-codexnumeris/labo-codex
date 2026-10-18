# Demande de relecture – la dissection, lot 5 : « Couper », et des raisons qui nomment

> Claude Code, dimanche 18 octobre 2026, vers 14 h (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-5-couper.md` (13 h 17). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi la porte retouchée par Cowork, `VERDICT-RELECTURE-2026-10-18-version-1.204.0.md`, le plan, la consigne du lot, la consigne du jour et son archive. **Pas de version, pas de push.**

## État mesuré

- **Vitest complet** (lancé depuis `tests/`) : **775 fichiers et 9 213 essais, tous verts** (avant le lot : 774 et 9 188). Le banc neuf, `materiel-dissection-5-couper.test.js`, compte 25 essais. Au banc 2b, l'essai W.b attend maintenant la raison avec le critère nommé : « la pondération d'un critère (« Tenue de la langue ») ».
- **WebKit, specs `materiel-*`** (ce n'est pas le verdict) : **12 vertes, 0 rouge**. Les 17 essais ignorés sont ceux de l'assistant débranché, déjà ignorés avant ce lot. La spec neuve, `materiel-dissection-5.spec.js`, coupe (d) au pointeur, au point d'un caractère calculé par `Range.getBoundingClientRect` : 25 coupes au total, puis l'annulation, le glisser, la création et Grilles de critères. Dans la spec du lot 1, le compte de la palette devient « 12 étiquettes + l'outil, juste après « Suite » ».
- **Break-tests** (chaque fois, le fichier est restauré depuis une copie) :
  - coupe hors d'une espace : C.a, C.b, C.c, C.e et C.g rougissent ;
  - étiquette perdue à la coupe : E.a, E.b, P.a, P.b, D.b et R.f rougissent ;
  - renvoi à l'assistant laissé tel quel : N.a rougit.
- **`git grep`** des noms d'étapes de l'assistant (« à l'étape », « Ce que contient ton tableau », « Sens du tableau », « Nature des cases », « Plages de notes ») dans `js/materiel-dissection*.js` : **zéro**. Le message de `calculs` est reconnu par `NOMS_ETAPES.roles`, jamais par son texte.
- Capture à 820 px : `dissection-5-couper-820.png` (sortie de la spec). Le bandeau porte « Annuler la dernière coupe » et « Terminer », chacun d'au moins 44 px, et la page ne défile pas de côté.

## Ce que j'ai décidé seul (suppositions nommées)

1. `couper(doc, id, decalage)` rend `{ doc, parties }` (le nouveau document et les deux identifiants neufs), ou `null`. L'interface a besoin des identifiants pour poser l'étiquette, d'où cette forme plutôt qu'un document seul.
2. L'annulation est une fonction pure, `recoller(liens, coupe)`. La pile vit dans la page (`etat.coupes`).
3. À égalité entre deux espaces, la première l'emporte. Sans point lisible sous le doigt, la coupe se fait au milieu du morceau, comme le demande la consigne. Au-delà de 8 px, le geste est un glisser et ne coupe pas.
4. « Retirer les étiquettes » ne défait pas les coupes. En revanche, une coupe annulée ensuite ne rend plus l'étiquette que ce bouton a retirée.
5. « Annuler la dernière coupe » est masqué quand il n'y a rien à annuler (plutôt que grisé).
6. L'outil n'a pas de couleur d'étiquette : il a un trait en pointillé gris (`--texte-secondaire`), et le curseur devient un curseur de texte sur les morceaux.
7. Dans les raisons, les sous-critères s'appellent « éléments observables », le nom de l'étiquette que l'enseignant a posée.
8. **Les raisons nommées vont un peu au-delà des trois que la consigne liste.** « les points de N critères » et « la pondération de N critères » nomment aussi leurs critères. C'est ce que Grégoire verrait s'il ne coupait qu'une partie de ses lignes.
9. Le message de l'étape est **retiré** quand aucune logique n'est lue : « des points ou des niveaux » vient de le dire. Quand une logique est lue, il est remplacé par l'équivalent de la dissection.

## Une trouvaille corrigée maintenant (niveau 1 : elle casse le parcours livré)

**Une seconde Pondération pour un même critère remplaçait la première sans rien dire.** Prenons Grégoire qui coupe ses lignes et étiquette « / 25 », mais laisse la Pondération posée ce midi sur « Total … / 70 ». Le 70 devenait alors en silence la pondération du dernier critère de la section, et la grille se serait créée avec ce poids. Maintenant, ce morceau ne trouve pas de place, avec la raison « son critère a déjà une pondération (25) ; une ligne de total prend l'étiquette « Total » » (R.f). Le chemin des critères à nommer (`pondApres`) ne change pas.

## Trouvailles inscrites (niveau 2), hors du lot

- **Deux lignes « Total »** : seule la dernière compte. Sur (d), coupée et créée, les constats affichent « Somme des pondérations : 100 · ton total : 30 : écart ». Rien n'est bloqué, mais Grégoire le verra sur sa grille lundi s'il étiquette ses deux totaux.
- **Une ligne non coupée étiquetée Critère, et une Pondération de total juste en dessous** : le total devient la pondération de ce critère, en silence, quand le critère n'en avait pas (c'est le cas de (d) telle que collée).
- Les autres raisons de `calculs` comptent sans nommer : nombre entier de 0 à 100, nom de critère vide, plus de 30 sous-critères.

## Les textes neufs (provisoires, à trancher par Grégoire)

| Où | Texte |
|---|---|
| Palette | « Couper » · « Sépare un morceau en deux, là où tu touches » |
| Bandeau | « Outil « Couper » : touche l'endroit d'un morceau où le séparer en deux. La coupe tombe entre deux mots. » |
| Bandeau, bouton | « Annuler la dernière coupe » |
| Ligne d'état | « Outil « Couper » en main : touche l'endroit d'un morceau où le séparer en deux. » |
| Ligne d'état | « Morceau coupé en deux : « A » et « B ». » |
| Ligne d'état | « Ce morceau n'a qu'un mot : il ne se coupe pas. » |
| Ligne d'état | « Coupe annulée : « … » est recollé. » |
| Raison | « des noms de critères plus courts (200 caractères au plus) pour « A… », « B… », « C… » et N autres : coupe-les avec « Couper » » (un seul : « pour « A… » : coupe-le ») |
| Raison | « des éléments observables plus courts (200 caractères au plus) pour … : coupe-les avec « Couper » » |
| Raison | « des réponses plus courtes (5 000 caractères au plus) pour … : coupe-les avec « Couper » » |
| Raison | « les points de 2 critères (« A » et « B ») » · « la pondération d'un critère (« A ») » |
| Raison | « les points de chaque critère : surligne le poids de chaque critère avec l'étiquette « Pondération », ou ce que vaut chaque réponse avec l'étiquette « Points » » |
| Sans place | « aucun critère avant lui ; une ligne de total prend l'étiquette « Total » » |
| Sans place | « son critère a déjà une pondération (N) ; une ligne de total prend l'étiquette « Total » » |

Les premiers mots s'arrêtent à 40 caractères, coupés entre deux mots, puis « … ».

## Ce qu'aucune machine n'a éprouvé

Le doigt réel sur l'iPad : `caretRangeFromPoint` sous un vrai toucher, avec `user-select: none` actif, et un morceau plus large que le canevas qu'on a fait défiler. Dans WebKit, les événements sont synthétiques et le morceau est aligné à gauche avant le toucher. Si Cowork juge qu'il faut une rangée de porte, c'est celle-là.
