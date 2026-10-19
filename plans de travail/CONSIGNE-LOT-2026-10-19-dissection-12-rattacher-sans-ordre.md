# Consigne – la dissection, lot 12 : rattacher sans que l'ordre des touchers compte

> Écrite par Cowork le lundi 19 octobre 2026 à 07 h 59 (Toronto, mesuré par `date`). **Symptôme vécu par Grégoire ce matin (7 h 54, capture, 1.207.0)** : il a touché « Idées secondaires » puis « preuves) », puis « (explications, procédés, » puis « preuves) ». L'outil a pris « preuves) » pour le début : marques « ↳ » sur « Idées secondaires » et « (explications, procédés, », infobulle « Suite de « preuves) » », lecture « preuves) Idées secondaires (explications, procédés, ». Le geste naturel est l'inverse de celui qu'attendait l'outil, et un troisième morceau ne se chaîne pas. Cowork avait accepté ce cas en relecture (supposition 1 du lot 7) : c'était une erreur. **Décision de Grégoire, 7 h 58** : l'ordre des touchers ne compte plus ; le premier morceau affiche sous lui le nom entier. Il a écarté avec Cowork l'idée de déplacer les blocs (la place d'un morceau dans un tableau dit son critère et son niveau). Règles 2 et 7 de `PROTOCOLE.md`. **Pas de verdict complet** : Vitest et `materiel-*` seulement.

## Ce que l'enseignant fait à la fin de ce lot

« Rattacher » en main, il touche « preuves) » puis « Idées secondaires », puis « (explications, procédés, » puis l'un des deux autres, dans l'ordre qu'il veut : sous « Idées secondaires », le nom entier se lit « Idées secondaires (explications, procédés, preuves) ». Il touche deux fois un morceau rattaché : il s'en détache.

## Ce qu'il faut

1. **Un groupe, lu dans l'ordre du document.** Joindre deux morceaux les met dans un même groupe ; si l'un d'eux ou les deux sont déjà dans un groupe, les groupes se rejoignent. Le texte lu est celui de tous les membres **dans l'ordre de lecture du document**, séparés par une espace. La **tête** est le premier membre dans cet ordre : elle porte l'étiquette et la place du groupe ; les autres sortent de l'ordre de lecture. Le format `{ idB: idTete }` peut rester (un seul niveau), à condition que la tête précède toujours ses membres.
2. **Le geste** (événements de pointeur, cibles et `touch-action` comme aujourd'hui) : premier toucher, un morceau est choisi (marqué) ; second toucher sur un **autre** morceau, ils sont joints ; second toucher sur le **même** morceau : s'il est rattaché, il se détache, sinon le choix s'annule. Échap et « Terminer » annulent le choix. Joindre deux membres du même groupe ne change rien et le dit.
3. **Détacher** un membre : il redevient un morceau à part, son texte tel quel ; si c'est la tête, le membre suivant devient la tête et garde l'étiquette du groupe ; un groupe d'un seul morceau cesse d'exister.
4. **L'étiquette du groupe** : celle de la tête si elle en a une ; sinon celle du premier membre étiqueté, reportée sur la tête (supposition de Cowork : garder ce que l'enseignant a posé). Les étiquettes des autres membres sont retirées, et la ligne d'état le dit, comme aujourd'hui.
5. **Ce qui se voit** : les membres autres que la tête gardent le pointillé et « ↳ » dans la couleur de l'étiquette du groupe ; **sous la tête, en tout temps, le nom entier tel que l'application le lit** (petit, discret, lu aussi par les lecteurs d'écran) ; l'outil en main, les flèches vont de chaque membre vers la tête. L'infobulle d'un membre nomme la tête.
6. **Avec les autres gestes**, inchangé : la première partie d'une coupe prend la place du morceau coupé ; annuler une coupe défait d'abord les liens de ses parties ; « Retirer les étiquettes » garde les groupes.
7. **Les bancs.** Vitest : l'ordre des touchers indifférent (A puis B, B puis A : même lecture) ; trois morceaux dans les six ordres possibles → le même nom, dans l'ordre du document ; la fusion de deux groupes ; détacher un membre, puis la tête ; l'étiquette du groupe (tête étiquetée, ou premier membre étiqueté) ; (d7) jointe dans l'ordre de la capture → le critère créé porte le nom entier. WebKit : les touchers de la capture, dans son ordre ; le nom entier sous la tête ; détacher par deux touchers. Break-test : l'ordre des touchers au lieu de l'ordre du document.

## Les textes

Le bandeau, la ligne d'état, le nom entier sous la tête, le rien-à-changer : neufs et provisoires. Liste aussi, dans la demande, **lesquels des textes validés le 18 à 17 h 18 deviennent faux** (ceux qui disent « d'abord la suite, puis celui qu'il continue », le refus « déjà la suite », le refus « boucle ») et propose leur remplacement ou leur retrait. L'entrée 1.206 des Nouvelles reste telle quelle (c'est l'histoire) ; la prochaine dira le changement.

## Ce qu'il ne faut pas

- Déplacer un morceau dans le document ; deviner un lien.
- Le verdict complet, un numéro de version.

## Livrer

Un commit sur `main` (avec cette consigne, et au BACKLOG ce symptôme vécu par Grégoire à sa porte du 19 oct., 8 h 25 : la grille d'une collègue dont une partie de 23 points se multiplie par deux (« X 2 = / 46 ») ; la dissection ne sait pas lire une multiplication, il l'a mise en « À ignorer » ; à cadrer avec Cowork, rien à coder) ; Vitest complet vert ; `materiel-*` vertes dans WebKit ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-dissection-12-rattacher-sans-ordre.md`.
