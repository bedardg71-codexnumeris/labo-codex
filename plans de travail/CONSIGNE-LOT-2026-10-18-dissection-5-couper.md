# Consigne – la dissection, lot 5 : « Couper » un morceau, et des raisons qui nomment ce qui bloque

> Écrite par Cowork le dimanche 18 octobre 2026 à 13 h 17 (Toronto, mesuré par `date`). Né de la porte de Grégoire (relevé de 13 h 14, rangée 2.5 en échec, consigné à la fin de `PLAN-2026-10-18-la-dissection-pour-lundi.md`). **Décision de Grégoire, 13 h 16** : « On fait ça maintenant », pour la rencontre de lundi 11 h. Règles 2 et 7 de `PROTOCOLE.md`. 1.204.0 est en ligne (`74ab9cc3`).

## Ce qui a échoué (mesuré par Cowork sur ses captures)

Sa grille « Évaluation sur le symbolisme » écrit, **sur une seule ligne**, le nom du critère, ses points et ses cases à cocher : « Repérage et classement / 10 [ ] l’idée directrice est mise en évidence / n’est pas mise en évidence ». La dissection n'étiquette qu'une ligne entière. Résultat, sous « Avant de créer, il reste : » :
- des noms de critères de plus de 200 caractères, **sans dire lesquels** ; de même pour les sous-critères ;
- « les points de chaque critère, ou des colonnes de niveaux, **à l’étape « Ce que contient ton tableau »** » : un message de `calculs` qui renvoie à l'assistant débranché ;
- aucun point lu (les « / 10 » sont dans le texte des critères) ;
- deux « Pondération » posées sur les lignes de total (« / 70 », « / 30 ») : sans place, « aucun critère avant lui ».
Grégoire, dans ses mots : « l'application me dit qu'il manque des éléments (non identifiés), mais j'ai tout identifié ».

## Ce que l'enseignant fait à la fin de ce lot

Dans la palette, un outil **« Couper »**. Il le prend comme une étiquette (le bandeau le dit), puis touche l'endroit exact d'un morceau : le morceau devient deux morceaux, à la même place dans la grille. Il étiquette chacun : « Repérage et classement » en Critère, « / 10 » en Pondération, « [ ] l’idée directrice… » en Élément observable. Sa grille se crée, en points. Et quand quelque chose bloque encore, chaque raison nomme le critère ou le morceau en cause.

## Ce qu'il faut

1. **La coupe, en fonction pure, testée** (`materiel-dissection-lecture.js`) : `couper(doc, id, decalage)` rend un nouveau document où la ligne `id` devient deux lignes consécutives **dans la même case** (tableau) ou à la suite (texte brut), avec des identifiants neufs. La coupe tombe **entre deux mots** : à l'espace le plus proche du point touché ; les espaces de bord sont retirés des deux parties ; une partie vide n'est pas créée (un morceau d'un seul mot ne se coupe pas : rien ne change, et la ligne d'état le dit). Le texte des deux parties, mis bout à bout avec une espace, redonne l'original : rien ne se perd.
2. **Les étiquettes** : la première partie garde l'étiquette du morceau coupé ; la seconde n'en a pas. La lecture se refait.
3. **L'outil dans la palette**, groupe « Le reste », après « Suite » : « Couper » · aide « Sépare un morceau en deux, là où tu touches » (provisoire, étape des mots). Il se prend comme une étiquette (même bandeau, même « Terminer », même Échap) ; il ne surligne rien et ne compte rien. En main : `touch-action: none` sur les morceaux comme pour le surligneur ; le point touché se lit par `document.caretRangeFromPoint` (WebKit) ou `caretPositionFromPoint`, avec un repli sur le milieu du morceau si aucun n'existe. Un toucher, une coupe ; le glisser ne coupe pas.
4. **Défaire** : tant que « Couper » est en main, le bandeau offre « Annuler la dernière coupe » (une pile ; une coupe annulée recolle exactement les deux parties et rend à la ligne son étiquette d'origine). « Coller une autre grille » perd aussi les coupes, sous la même confirmation (C2 du lot 1), qui se déclenche dès qu'il y a une étiquette **ou** une coupe.
5. **Une grille sans niveaux dont chaque critère porte une pondération** se lit comme une grille en points : chaque critère est noté sur sa pondération (le maximum de points, comme au lot 2a), même sans morceau étiqueté « Points ». `bilan` dit alors « des points » ; la phrase L3 vaut telle quelle. Aucune conversion : c'est le nombre que l'enseignant a écrit.
6. **Les raisons qui nomment** (sous « Avant de créer, il reste : ») :
   - les noms de critères trop longs : nomme chacun par ses premiers mots (« « Repérage et classement / 10 [ ] l’idée… » », jusqu'à 3, puis « et ‹N› autres ») et ajoute « : coupe-les avec « Couper » » ; même forme pour les sous-critères et les réponses trop longs ;
   - **dans la dissection, aucun message ne renvoie à une étape de l'assistant** : remplace ceux de `calculs` qui le font par leur équivalent de la dissection (ne change pas les messages de l'assistant lui-même) ; un `git grep` des noms d'étapes de l'assistant dans ce que la dissection affiche rend zéro ;
   - « aucun critère avant lui », pour une Pondération : ajoute « ; une ligne de total prend l’étiquette « Total » ».
   Textes provisoires : liste-les dans le rapport, Grégoire les tranche ensuite.
7. **Les bancs.** Une grille fictive (d), de la forme de la sienne, **jamais son texte** : trois sections, des critères écrits sur une ligne avec « / N » et des cases « [ ] … / … », deux lignes de total « / 70 » et « / 30 ». Vitest : `couper` (au milieu, au bord, dans un mot, un seul mot, texte brut, tableau, l'aller-retour qui ne perd rien), l'étiquette gardée par la première partie, l'annulation ; (d) coupée et étiquetée → créable en points, pondérations lues ; chaque raison nommée ; aucun renvoi à l'assistant. WebKit : (d) collée, un morceau coupé par des événements de pointeur au point d'un caractère calculé (`Range.getBoundingClientRect`), les deux parties étiquetées, la grille créée et retrouvée dans Grilles de critères ; à 820 px, sans défilement de côté. Break-tests : la coupe hors d'une espace, l'étiquette perdue à la coupe, le renvoi à l'assistant.

## Ce qu'il ne faut pas

- Écrire quoi que ce soit dans les données avant « Créer ma grille » : les coupes vivent dans la page.
- Couper au milieu d'un mot, ou perdre un caractère.
- Deviner : l'application ne coupe jamais d'elle-même.
- Un numéro de version : la release suivra la relecture.

## Livrer

Un commit sur `main`, avec les documents en attente (la porte retouchée par Cowork, `VERDICT-RELECTURE-2026-10-18-version-1.204.0.md`, le plan, cette consigne, la consigne du jour et son archive) ; Vitest complet vert ; les specs `materiel-*` vertes dans WebKit ; la demande de relecture courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-5-couper.md` avec la liste des textes neufs. **Puis arrête-toi.**
