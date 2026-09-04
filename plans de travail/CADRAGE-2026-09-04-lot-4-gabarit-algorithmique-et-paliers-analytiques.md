# Cadrage du lot 4 — le gabarit algorithmique se range, et une grille analytique a ses paliers

> **Écrit le 4 septembre 2026 vers 9 h 45, par Cowork, à la demande de Grégoire**, pendant que
> Claude Code publiait 1.116 (les lots 2 et 3 des trois types de grille). Application au moment de
> l'écriture : `version.json` dit déjà **1.116.0**, build `0904-0729`, **pas encore poussée**.
>
> ⛔ **CE N'EST PAS UNE CONSIGNE.** C'est ce que Grégoire a décidé ce matin, à l'écran, en
> parcourant les lots 2 et 3 — huit retours, tous tranchés ou mesurés — rangés pour que la
> prochaine session Cowork **cartographie, puis écrive** `CONSIGNE-DU-JOUR.md`. Rien ici n'a été
> mesuré au-delà des lignes citées ; **tout se remesure avant d'écrire une ligne** (règle 2).
>
> **Les sources, ligne à ligne** : `CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md`
> (§ « Ce que le coup d'œil a ouvert », retours 1 à 7) et
> `CADRAGE-2026-09-03-accordeons-gabarit-algorithmique.md` (ajouts du 4 septembre). Ce fichier
> les rassemble ; en cas d'écart, **elles font foi**.

---

## Ce que l'utilisateur y gagne, en une phrase

Un enseignant qui ouvre le gabarit d'un critère algorithmique voit d'abord ce qui fait la note
(les sous-critères), puis des sections fermées et nommées pour ce qui fait les mots ; et un
enseignant dont la grille est analytique peut attacher une cartouche à ses chiffres sans qu'on
lui parle de « niveaux ».

---

## A · Les paliers d'une grille analytique — la cartouche sans « niveaux »

**Le retour** : *« quand on a une grille analytique et qu'on veut produire une cartouche, nous
n'avons pas le choix de créer une échelle, alors que la grille analytique fonctionne uniquement
avec des points. »*

**Ce que le lot 3 a bâti, et qui ne bouge pas** : le chiffre trouve son niveau **par les bornes
de l'échelle**, et ce niveau ouvre la cartouche (clé `critereId_niveau`). Une cartouche attache
un commentaire à un **palier** ; sans paliers, pas de cartouche. La question n'était donc pas
« échelle ou pas », mais « où vivent les paliers et comment s'appellent-ils ».

↻ **DÉCISION DE GRÉGOIRE, 4 septembre vers 7 h 30 : la voie (a)** — *« je suis ta
recommandation »*. L'échelle **reste** le mécanisme des paliers ; elle cesse de se présenter comme
des « niveaux » quand la grille est analytique :
- dans le formulaire de la cartouche, pour une grille analytique, le champ « Échelle (niveaux) * »
  se lit **« Paliers (bornes en %) »** et est **prérempli avec l'échelle de départ** ;
- l'éditeur de cartouche titre ses colonnes **par les bornes** (« 0–64 % », « 65–79 % »…) plutôt
  que par I·D·M·E.
Aucun mécanisme neuf ; cinquième occurrence du motif « ce que Grégoire demande existe déjà sous
un autre nom ».

**À mesurer avant d'écrire** : où le formulaire de cartouche lit le type de la grille (le type
monte à la grille depuis le lot 1 — `grille.type`, ou déduit des critères quand « Non précisé ») ;
d'où viennent les titres de colonnes de l'éditeur de cartouche ; ce que fait une grille MIXTE
(des critères à niveaux ET à points : les deux libellés, ou le libellé des niveaux ?). ⚠ Ce
dernier point est didactique s'il n'est pas évident : le remonter.

⚠ **La réserve inscrite au lot 3 vit ici** : *points sans niveau déductible* (échelle à trous,
ou copie d'échelle sans bornes) — le critère ne trouve pas de niveau, **n'entre pas dans
`criteres[]`**, et le PDF se tait alors que la note compte ses points. Mesuré, assumé par un
test, pas corrigé (lever le garde ferait entrer une entrée sans `niveauSelectionne` chez dix-huit
lecteurs non mesurés pour ça). **Si ce lot touche aux bornes des paliers, c'est le moment de
décider** : bornes contiguës imposées par l'éditeur, ou entrée sans niveau tolérée par les
lecteurs.

---

## B · « Aucun » au menu « Niveau SOLO » de l'éditeur de grille

**Le retour** : *« si je m'en tiens à une méthode traditionnelle, le menu des niveaux SOLO devrait
m'offrir la possibilité d'écrire "Aucun". »*

▣ **Mesuré** : le menu existe à deux endroits (`js/grilles.js:3399` et `:4121`), défaut
`multistructurel` (`:330`). **À mesurer** : tout ce qui LIT `niveauSOLO` (dépistage, profil, matrice)
— « Aucun » veut dire *ce critère ne nourrit pas la lecture SOLO*, et chaque lecteur doit savoir
sauter, sans que le critère disparaisse de la note.
⚠ **Question didactique à remonter avec la mesure** : que fait le dépistage d'une copie dont
TOUS les critères sont « Aucun » ? (Rien, sans doute — mais que l'écran le dise.)

---

## C · Le gabarit algorithmique se range — ordre, cartes, défaut, libellés

Cinq décisions de Grégoire, toutes du 4 septembre, sur le même écran :

1. **L'ordre** : les **sous-critères viennent en premier**, tout de suite sous la rangée du
   critère ; la formule, le commentaire et la projection suivent. Aujourd'hui ils sont derniers
   (`grilles.js` : formule `:3482`, rétroaction `:3594`, projection `:3725`, seuil `:3806`,
   sous-critères après). Ses mots : *« il devrait apparaître immédiatement après le critère »*.
2. **Les cartes repliables** (cadrage « accordéons » du 3 septembre, règle « ouvert ce qui porte
   la note, fermé ce qui porte les mots ») — et c'est ce qui règle aussi le retour *« il manque
   d'espace entre le modèle de formule et le modèle de projection, on dirait un seul formulaire »*.
   Pas de marge ajoutée à part : le remède, pas le symptôme.
3. **Le défaut de projection d'un critère algorithmique neuf** : « Norme externe » avec 900 / 30
   (`evaluation-projection.js:605`) est l'EUF servie à un collègue de philosophie. **Recommandation
   de Cowork : « Aucune projection » par défaut**, la norme externe se choisit. ⚠ **Grégoire n'a
   pas encore tranché ce point** (il a tranché le nom, pas le défaut). Le remonter au moment de la
   consigne. Source seulement ; tarir n'est pas réparer.
4. **« Modèle de rétroaction » → « Modèle de commentaire »** (`grilles.js:3594`, un seul
   libellé ; la clé sous le menu ne porte pas le mot). Sa nuance : *la rétroaction, c'est la
   cartouche, sur le travail ; ici ce sont des commentaires sur une projection.* Relire les
   descriptions de la section pour dire « commentaire » partout.
5. **« Norme externe (épreuve uniforme) » → « Projection à l'EUF »** (`evaluation-projection.js:186`,
   `nom` seulement ; l'`id` `norme_externe` voyage avec les grilles partagées et ne bouge pas).
   ↻ Tranché **contre la recommandation de Cowork** (le modèle est paramétrable et sert toute
   norme ; le 2 septembre avait retiré les noms d'épreuves de ce qui est offert). *« Pour
   l'instant, indiquons "Projection à l'EUF". »* La réserve reste écrite dans le cadrage
   « accordéons » ; on la ressortira sur une mesure, pas avant.

---

## D · À rejuger avec une vraie cartouche, pas avant

*« Beaucoup d'espace perdu à droite des scores »* dans la liste des critères du PDF. ▣ La place
à droite est celle du **commentaire de cartouche** (`renderCritere`, `synthese-retroaction-rendu.js`),
et la copie de Grégoire n'en avait pas — il ne pouvait pas créer de cartouche (retour A). ⮕ Quand
A est livré : produire le PDF d'une copie **avec** cartouche. Si l'espace reste vide, c'est du
design (skill `design-interface`) ; sinon c'était le symptôme de A.

---

## Ce qui remonte à Grégoire dans ce lot, et rien d'autre

- C.3 — le défaut de projection (pas encore tranché).
- A — ce qu'une grille MIXTE affiche dans le formulaire de cartouche, si la mesure ne le rend pas
  évident.
- B — ce que le dépistage dit d'une copie dont tous les critères sont « Aucun ».
- Les mots de tout libellé neuf que ses collègues liront (« Paliers (bornes en %) », les titres
  de colonnes). **Lui proposer le texte, pas lui demander de l'écrire.**

## Ce qui ne bouge pas

Le calcul de la note (aucune sentinelle du calcul ne change), les collecteurs de `criteres[]`,
tout ce que l'élève lit (arrêté 4, fermé en 1.116), et les données de qui que ce soit.

## Ordre proposé pour la consigne (à confirmer par la cartographie)

C d'abord (le gabarit : libellés, ordre, cartes, défaut) — c'est de l'écran, sans donnée qui
voyage ; puis B (SOLO « Aucun » : touche le dépistage, à cartographier) ; puis A (les paliers :
touche la cartouche, format qui voyage → **relecture croisée obligatoire**, règle 2) ; D en
dernier. Une seule livraison à la fin, après le coup d'œil de Grégoire.
