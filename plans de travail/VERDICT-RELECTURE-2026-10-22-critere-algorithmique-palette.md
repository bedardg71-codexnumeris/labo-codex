# Verdict de relecture – Le critère algorithmique, étape 2b : la palette

> Cowork, jeudi 22 octobre 2026, 21 h 51 (Toronto, mesuré par `date`). Relu : `ae911d5c` (non poussé), comparé à `6cac9b1d` ; `DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-palette.md` ; `TEXTES-2026-10-22-palette-critere-algorithmique.md` ; cinq des seize captures, regardées (rédaction avec projection à 1440 et à 820, palette et zone ; chimie à 1440). Vitest ne tourne pas dans le shell du montage : les verts sont ceux que Claude Code rapporte.

## Verdict : accepté, avec trois retouches avant la version

Vérifié :

- **Une palette par critère**, qui sert les énoncés et les paliers ; plus aucune rangée « Poser : ». Les jetons enregistrés ne changent pas ; rien n'est écrit au rendu.
- **Les noms** : `palette-algo.js` ne rend que du texte, `grilles.js` l'échappe ; les blocs X le vérifient. « Des » devant les noms de l'enseignant : jamais d'élision.
- **La palette nomme sa cible**, invite sans zone visitée, rend inactif ce qu'une zone ne remplit pas.
- **Le collant au Mac** : `top: 96px`, `max-height` et défilement propre, comme la dissection.

## Retouche 1 – Sur l'iPad, la palette est loin des zones (le lot n'est pas fini)

Sous le seuil, la palette passe au-dessus du gabarit et ne colle pas. Capture `redaction-projection-820-1-palette-webkit.png` : environ 1 000 px de blocs en deux colonnes, et les paliers deux à trois écrans plus bas. Pour poser un bloc dans un palier, il faut remonter, toucher, redescendre. C'est moins bien que les rangées qu'elle remplace : Grégoire les avait voulues au-dessus de chaque zone le 3 sept., après un essai sur l'iPad.

Tranché par Cowork : **sous le seuil, la palette devient compacte et se place juste au-dessus de la zone qu'on écrit.**

- Compacte : le nom des blocs seulement (l'aide passe dans `title` et pour le lecteur d'écran), et seulement les blocs que la zone offre. La ligne de cible reste.
- Elle se déplace quand le curseur passe à une autre zone. Sans zone visitée, elle est en tête du gabarit, avec l'invitation, comme aujourd'hui.
- C'est la même palette, rendue autrement : rien ne se duplique, aucune rangée par zone ne revient.
- ⚠ À mesurer : à l'arrivée de la palette, la zone descend de sa hauteur. Si le curseur ou le défilement saute (WebKit, fenêtre d'iPad), le dire, avec une capture, et le régler.

## Retouche 2 – Les blocs inactifs prennent la place des autres

À 1440, la cible étant un palier, les trois blocs inactifs (« Nom du critère », « « erreurs » », « « mots » ») occupent le haut de la palette avec leur description entière, et « Compte des erreurs » passe sous le bas de l'écran. Tranché : **un bloc inactif se réduit à son nom, grisé, sur une ligne** ; « Ce texte ne le remplit pas. » passe dans `title` et pour le lecteur d'écran. Les blocs gardent leur place, pour que l'enseignant les retrouve au même endroit.

## Retouche 3 – Un effet du collant : la liste des grilles glisse sous la barre

La règle `overflow: clip` rend collante, sur cet écran, `.sidebar-navigation` (la liste des grilles), à `top: 20px` : elle glisse sous la barre de navigation, et sa première carte s'y coupe (capture `redaction-projection-1440-1-palette-chromium.png`). Sous la même condition, son `top` passe sous la barre, comme celui de la palette, et son `max-height` suit. Une capture défilée le montre.

## Les points de la demande : dispositions

- **`overflow: clip` sous condition** : accepté, c'est la bonne propriété. La question générale (aucun `position: sticky` ne colle dans l'application, ce que `styles.css` dit déjà l. 18127) : *commenter et oublier*, aucun symptôme vécu par Grégoire.
- **La palette poussée vers le haut à la fin du gabarit** : accepté, c'est le comportement normal du collant ; la retouche 2 le réduit.
- **Le toucher que la machine ne teste pas** : accepté ; le clic et les 44 px sont mesurés, le toucher reste au coup d'œil de Grégoire.
- **Les libellés des paliers** : à l'étape 3. D'accord.
- **Le break-test qui ne rougissait pas, et le trou comblé** (une zone qui n'offre rien) : bien.

## Les textes : tranchés par Cowork

Tous retenus tels quels. **La question des guillemets** : on les garde (« « unités manquantes » »). Dans la phrase, la pastille se lit comme le mot lui-même, et les guillemets la distinguent du compte voisin ; « Nom : unités manquantes » alourdirait chaque phrase composée.

L'item des Nouvelles : à la version, soumis à Grégoire avec les autres.

## Ensuite

Les trois retouches : `CONSIGNE-DU-JOUR.md` (21 h 51). Puis leur relecture, sur captures.
