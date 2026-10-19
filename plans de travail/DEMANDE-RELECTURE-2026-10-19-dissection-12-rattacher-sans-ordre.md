# Demande de relecture – la dissection, lot 12 : rattacher sans que l'ordre des touchers compte

> Claude Code, lundi 19 octobre 2026, matin (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-dissection-12-rattacher-sans-ordre.md` (7 h 59). Décision de Grégoire, 7 h 58. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi la consigne du lot et #1109 au BACKLOG. **Pas de version, pas de push, pas de verdict complet.**

## Ce qui est fait

1. **Un groupe, lu dans l'ordre du document** (`materiel-dissection-lecture.js`). `rattacher(rat, liens, B, A)` est remplacé par `joindre(doc, rat, liens, x, y)` : les groupes des deux morceaux se rejoignent, la tête est le premier membre dans l'ordre de lecture, chaque autre membre pointe sur elle. Le format `{ idMembre: idTete }` reste, sur un seul niveau, et la tête précède toujours ses membres.
   - `morceauxLus` trie aussi le texte d'un groupe dans l'ordre du document. Une tête forcée APRÈS un membre dans les données, qui ne peut plus naître d'un geste, se lit donc quand même dans l'ordre (O.c).
   - Les trois refus du lot 7 (soi, déjà la suite, boucle) sont tombés, sans remplaçant. Joindre deux membres d'un même groupe, ou un morceau à lui-même, rend `{ rien: true }`.
2. **Le geste** (`materiel-dissection.js`, `toucherLien`). Premier toucher : le morceau est choisi, même s'il est déjà rattaché. Second toucher sur un AUTRE morceau : ils sont joints. Second toucher sur le MÊME : il se détache s'il est rattaché, sinon le choix s'annule. Échap et « Terminer » annulent le choix, comme avant. Le champ d'état `suite` s'appelle désormais `choix`.
3. **Détacher** (`detacher(doc, rat, liens, id)`). Un membre redevient un morceau à part. Si c'est la tête, le membre suivant devient la tête, et l'étiquette du groupe passe sur lui. Un groupe d'un seul morceau cesse d'exister.
4. **L'étiquette du groupe**. C'est celle de la tête ; si la tête n'en a pas, celle du premier membre étiqueté lui est reportée. Les autres sont retirées, et la ligne d'état le dit.
5. **Ce qui se voit**. Sous la tête, en tout temps, s'affiche `.dissection-nom-entier`, un élément frère placé juste après elle. C'est du texte simple (`textContent`), petit et en italique, qui n'est pas caché aux lecteurs d'écran. Les membres gardent le pointillé et « ↳ », dans la couleur de l'étiquette de la tête. Les flèches vont de chaque membre vers la tête. L'infobulle d'un membre nomme la tête (« Suite de « … » », texte inchangé). Capture : `tests/test-results/…/dissection-12-nom-entier-820.png` (lancer la spec 12 pour la refaire).
6. **Avec les autres gestes**, rien n'a bougé : `rattachementsApresCoupe`, `rattachementsSansParties` et « Retirer les étiquettes » restent tels quels. Si on coupe la tête, la première partie reste tête, à la même place, donc toujours avant ses membres.

## Ce que j'ai supposé (une ligne chacun)

- Quand on détache la tête, **elle repart sans étiquette** : l'étiquette reste au groupe, sur la nouvelle tête. C'est vrai même pour un groupe de deux, où le morceau qui reste seul garde l'étiquette.
- Après « rien ne change », **le choix tombe**. Avant, un refus gardait le choix pour réessayer ; ici, il n'y a rien à réessayer.
- L'aide de l'outil (« Joint un morceau à celui dont il est la suite », validée le 18 à 16 h 44) **est gardée** : elle reste vraie, quel que soit l'ordre des touchers.

## Les textes

**Neufs, PROVISOIRES** (Claude Code, 19 oct.) :

| Clé | Texte |
|---|---|
| `bandeau` | Outil « Rattacher » : touche deux morceaux d'un même texte, dans l'ordre que tu veux ; l'application les lit dans l'ordre de ta grille. Touche deux fois un morceau rattaché pour le détacher. |
| `bandeauChoix` | Outil « Rattacher » : touche maintenant le morceau à joindre à « X ». Retouche « X » pour annuler. *(si X est rattaché : « … pour le détacher. »)* |
| `enMain` | Outil « Rattacher » en main : touche un morceau, puis celui à lui joindre. |
| `choisi` | Morceau choisi : « X ». Touche maintenant celui à lui joindre. *(si X est rattaché : « …, ou retouche-le pour le détacher. »)* |
| `reportee` | L'étiquette « Critère » passe au premier morceau : elle vaut pour le texte entier. |
| `rien` | Ces deux morceaux sont déjà rattachés : rien ne change. |
| `nomEntier` (sous la tête) | L'application lit : « … » |

**Textes validés le 18 à 17 h 18 qui devenaient faux**, et ce que j'en ai fait :

| Texte validé | Pourquoi il est faux | Fait |
|---|---|---|
| `bandeau` : « touche d'abord le morceau qui en continue un autre, puis celui qu'il continue. Touche un morceau déjà rattaché pour défaire son lien. » | L'ordre ne compte plus, et un seul toucher ne détache plus | Remplacé (ci-dessus) |
| `bandeauChoix` : « touche maintenant le morceau que « X » continue » | Même raison | Remplacé |
| `enMain` : « touche d'abord le morceau qui en continue un autre » | Même raison | Remplacé |
| `choisi` : « Suite choisie : … Touche maintenant le morceau qu'il continue. » | Même raison | Remplacé |
| Refus `dejaSuite` (« déjà la suite de… : rattache plutôt à celui-là ») | Le cas se joint maintenant | **Retiré** |
| Refus `boucle` (« … dans l'autre sens ») | Le cas ne change plus rien, et c'est `rien` qui le dit | **Retiré** |
| Refus `soi` | Retoucher le même morceau détache ou annule | **Retiré** |
| `sansEtiquette` : « vaut pour les deux. Défais le lien avec « Rattacher »… » | Un groupe peut compter plus de deux morceaux, et le geste s'appelle maintenant « détacher » | « vaut pour le texte entier. Détache-le avec « Rattacher »… » (provisoire) |

Gardés tels quels, parce qu'ils restent vrais : `annule`, `lie`, `etiquetteRetiree` (« … de la suite est retirée … »), `defait` et `suiteDe`. L'entrée 1.206 des Nouvelles n'est pas touchée ; la prochaine entrée devra dire le changement.

## Les bancs

- **Vitest** : `materiel-dissection-12-rattacher-sans-ordre.test.js` (12 essais). Ce qu'il couvre :
  - O : A puis B et B puis A ; trois morceaux dans les six ordres, avec pour chacun les deux façons de joindre le troisième ; la tête forcée après un membre.
  - G : la fusion de deux groupes ; « rien » ; `estRattache` et `teteDuGroupe`.
  - X : détacher un membre, puis la tête ; la tête d'un groupe de trois.
  - E : la tête étiquetée, l'étiquette reportée, aucune étiquette.
  - D.a : (d7) dans l'ordre de la capture donne un critère créé sous le nom entier.

  Le banc du lot 7 passe à `joindre` : ses gestes y gardent la même lecture, et ses trois essais de refus sont retirés. **Vitest complet : 780 fichiers, 9 267 essais verts.**
- **WebKit** : `materiel-dissection-12.spec.js`. Elle rejoue les touchers de la capture dans leur ordre, vérifie le nom entier sous la tête (visible, non caché, juste après elle) et les deux flèches vers la tête, puis détache un membre et ensuite la tête, chacun par deux touchers. La spec du lot 7 suit le nouveau geste (bandeau, défaire par deux touchers, troisième morceau, « rien »). **Les 15 specs `materiel-*` sont vertes en WebKit.**
- **Break-tests** :

| Ce que j'ai cassé | Ce qui a rougi |
|---|---|
| Tête = celle du second touché, comme au lot 7 | O.a, O.b, E.b et D.a en Vitest ; la spec 12 en WebKit |
| Texte du groupe pris tête d'abord, sans le tri de `morceauxLus` | O.c |

  Le code a été restauré après chaque essai (`diff` vide).

## Où regarder en premier

- `joindre`, quand ni la tête ni les autres n'ont d'étiquette sauf un membre placé au milieu (E.b couvre le cas à deux groupes).
- `marquer`, pour l'élément frère du nom entier : il est créé, mis à jour ou retiré à chaque marque. `marquerTout` calcule `morceauxLus` une seule fois par passage.
- Les rangées 6.2 et 6.3 de la porte du 18 sont à refaire par Grégoire sur cette version.
