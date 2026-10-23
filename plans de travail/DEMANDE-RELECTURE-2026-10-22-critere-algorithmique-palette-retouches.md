# Demande de relecture – La palette du critère algorithmique : les trois retouches

> Claude Code, jeudi 22 octobre 2026, 22 h 11 (Toronto, mesuré par `date`), sur `main`, non poussé. Consigne : `CONSIGNE-DU-JOUR.md` (21 h 51). Verdict d'origine : `VERDICT-RELECTURE-2026-10-22-critere-algorithmique-palette.md`. Captures : `captures-2026-10-22-palette-critere-algorithmique/`, suffixe `-retouches`, WebKit et Chrome.

## Ce qui a changé

**Retouche 1 – sous le seuil, la palette au-dessus de la zone.** Mesuré d'abord : le gabarit fait 649 px en portrait et 675 px en paysage (WebKit). L'iPad est donc sous le seuil de 754 px **dans les deux sens**, et la palette compacte sert aux deux orientations.

- Elle est compacte : seulement le nom des blocs, sur une ligne, en pastilles de 44 px. L'aide (et la précision) passe dans le `title` ; elle reste lue par le lecteur d'écran, masquée à l'œil seulement. La palette ne montre que les blocs que la zone offre ; un groupe sans bloc offert disparaît (`data-vide`). La ligne de cible reste.
- Elle se place juste au-dessus de la zone : au-dessus de la rangée des deux zones pour un palier, au-dessus du champ (étiquette comprise) pour un énoncé. Elle suit la zone, vers le bas comme vers le haut. Sans zone visitée, elle reste en tête du gabarit, avec l'invitation.
- C'est le même élément, déplacé (`placerPaletteAlgo`, grilles.js) : rien n'est re-rendu, et aucune rangée par zone ne revient. Le curseur survit comme avant.
- Le seuil n'est écrit qu'une fois, dans la feuille de style. La requête de conteneur pose `--palette-algo-compacte: 1`, et le JS lit cette variable.
- Si l'iPad tourne et que la largeur passe au-dessus du seuil, la palette retourne sur le côté (écouteur `resize`).

**Le saut, mesuré, puis réglé.** À l'arrivée de la palette, la zone descend de sa hauteur : 111 px au-dessus de « Défi prioritaire », 186 au-dessus du décompte, 236 au-dessus d'un palier. WebKit ne compense pas ; Chrome, si (ancrage du défilement). On mesure donc l'écart après le déplacement et on le rend au défilement. Résultat : en portrait comme en paysage, la zone touchée bouge de 0 à 1 px dans les deux moteurs, et la compensation n'agit pas deux fois dans Chrome (mesuré : aucun défilement ajouté).

**Retouche 2 – un bloc inactif réduit à son nom.** Grisé, sur une ligne, à sa place. Son aide, sa précision et la mention « Ce texte ne le remplit pas. » restent lues par le lecteur d'écran, masquées à l'œil ; la mention devient son `title`. **Décidé seul** : il garde sa hauteur de 44 px, comme les autres, pour que la palette ne change pas de rythme d'une zone à l'autre. Capture `redaction-1440-1-palier-inactifs-*` : « Compte des erreurs » est maintenant dans la fenêtre.

**Retouche 3 – la liste des grilles sous la barre.** Sous la même condition que `overflow: clip`, `.sidebar-navigation` colle à `top: 96px`, et son `max-height` passe à `calc(100vh - 104px)`. Mesuré à 1440 : sur cet écran, les autres éléments collants sont la barre elle-même (top 0) et la palette (96 px). La sous-navigation mobile n'y paraît pas, puisqu'elle n'existe qu'à 1024 px ou moins. Capture `redaction-1440-2-defilee-*`.

## Les bancs

- **Vitest**, bloc R de `critere-algorithmique-palette.test.js`, trois essais : le `title` des blocs (l'aide, puis la mention quand le bloc devient inactif, puis l'aide de nouveau quand il redevient actif) ; les groupes marqués vides ; la feuille de style (le bloc inactif réduit, la palette compacte, la liste sous la barre).
- **WebKit**, `critere-algorithmique-palette.spec.js` :
  - Mac : un bloc inactif est réduit à son nom. Nouvel essai : la liste des grilles colle sous la barre.
  - iPad portrait et paysage : la palette compacte va juste au-dessus d'un énoncé, puis d'un palier plus bas, puis du décompte plus haut. Elle n'y montre que les blocs offerts, à 44 px, réduits à leur nom. La zone touchée ne bouge pas de plus de 2 px. Un bloc se pose au curseur sans perdre le focus. La fenêtre élargie à 1440, la palette retourne sur le côté.
- **Les zones sont touchées au clic.** La note du 22 oct. sur `hasTouch` vaut toujours : le toucher réel reste au coup d'œil.
- `sentinelle-composeur-branchement` : son faux bloc reçoit `querySelector` et `title`, comme un vrai élément.
- `placerPaletteAlgo` a été découpée (`_ancreDeLaPalette`) : elle dépassait 15 de complexité, et le cliquet l'a vu.

**Break-tests, tous rouges sur l'assertion visée, fichiers restaurés après chacun :**

| Cassé | Rougit |
|---|---|
| Sans le déplacement de la palette | iPad : « la palette est juste au-dessus du champ » |
| Sans la compensation du défilement | iPad : « la zone touchée ne saute pas » |
| Sans la réduction CSS des inactifs | Mac : « inactif : son nom seul, sur une ligne » |
| Sans la règle de la liste | Mac : « la liste commence sous la barre » |
| La palette compacte montre les inactifs | iPad paysage : « seulement les blocs que la zone offre » |
| Sans le `title` de mention | Mac (WebKit) et R.a (Vitest) |
| Sans le `title` rendu | R.a |
| Sans `data-vide` | R.b |
| Sans l'écouteur `resize` | iPad : « revenue à sa place, sur le côté » |

**Verts :**

- Vitest, depuis `tests/` : 810 fichiers, 9 538 tests.
- Specs WebKit `critere-algorithmique-*` et `texte-troue-*` : 25 passés, 2 sautés (les essais de captures).
- Ni verdict complet ni release, comme demandé.

## Trouvailles en chemin

- **Mesure** : dans Chrome, les cartes se déplient avec une transition. Une mesure prise pendant le dépliage mesure la transition, pas la page (contenu rogné, défilement au bout). Le spec attend désormais la fin du dépliage (`ouvrir`). C'est mon propre banc : corrigé dans le lot.
- **Passer d'une zone modifiée à une autre re-rend le gabarit** (le `change` de la première), et le focus se perd. C'est le comportement depuis le 3 sept., déjà écrit dans le code (`_ecrireTexteEnonce*`) ; la retouche n'y change rien. *Commenter et oublier* : aucun symptôme vécu.

## Les questions

1. La palette au-dessus d'un palier fait 236 px pour 8 blocs, en deux groupes titrés. Faut-il retirer les titres de groupe en mode compact pour gagner une ligne ? La couleur dit déjà la famille. Je les ai gardés, faute de décision.
2. Sur un vrai iPad, le clavier qui apparaît fait lui-même défiler la page. Le banc ne peut pas le simuler : c'est le geste à vérifier à l'écran.

## Le geste à vérifier à l'écran

Sur l'iPad, dans une grille à critère algorithmique, touche le texte d'un palier, puis un autre plus haut : la palette doit apparaître juste au-dessus de chacun, sans que le texte touché ne se dérobe sous ton doigt, clavier ouvert, en portrait comme en paysage.
