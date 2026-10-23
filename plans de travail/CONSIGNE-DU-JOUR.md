# Consigne du jour – le critère algorithmique, étape 2b : les trois retouches de la relecture (jeudi 22 octobre 2026)

> Écrite par Cowork le jeudi 22 octobre 2026 à 21 h 51 (Toronto, mesuré par `date`), sur `main` à `ae911d5c` (non poussé). Elle remplace la consigne de la palette (20 h 51), exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-22-critere-algorithmique-palette.md`. Source : `VERDICT-RELECTURE-2026-10-22-critere-algorithmique-palette.md`, **à lire en entier d'abord** : il porte les mesures et les captures en cause.

## 0. Avant tout

`git status` : le verdict, cette consigne et son archive viennent de Cowork. **Commit de docs seul, d'abord**, fichiers nommés.

## 1. Retouche 1 – sous le seuil, la palette au-dessus de la zone qu'on écrit

- Compacte : le nom des blocs seulement, l'aide dans `title` et pour le lecteur d'écran ; seulement les blocs que la zone offre ; la ligne de cible reste. Cibles au doigt de 44 px.
- Elle se place juste au-dessus de la zone où est le curseur, et la suit d'une zone à l'autre. Sans zone visitée : en tête du gabarit, avec l'invitation.
- La même palette, rendue autrement : aucune rangée par zone ne revient.
- Le curseur survit, comme aujourd'hui (`pointerdown` annulé, pas de re-rendu à la pose).
- **À mesurer** : à l'arrivée de la palette, la zone descend. Si le curseur ou le défilement saute (WebKit, fenêtre d'iPad portrait et paysage), le dire avec une capture, et le régler.

## 2. Retouche 2 – un bloc inactif se réduit à son nom

Grisé, sur une ligne ; « Ce texte ne le remplit pas. » dans `title` et pour le lecteur d'écran. Les blocs gardent leur place. Au-dessus du seuil seulement : en dessous, la retouche 1 ne montre que les blocs offerts.

## 3. Retouche 3 – la liste des grilles ne glisse plus sous la barre

Sous la même condition que `overflow: clip`, `.sidebar-navigation` colle sous la barre de navigation (comme la palette, `top: 96px`), et son `max-height` suit. Mesure d'abord quels autres éléments collants paraissent sur cet écran ; chacun colle sous la barre, ou ne colle pas.

## 4. Tests et captures

- Bancs : la palette compacte n'offre que les blocs de la zone ; un bloc inactif n'a ni aide ni précision visibles ; la position de la palette suit la zone (WebKit, au clic).
- Break-tests nommés dans la demande.
- Vitest depuis `tests/`, puis les specs WebKit du critère algorithmique et du texte troué.
- **Captures** dans le même dossier, suffixe `-retouches` : à 820 et 1180 de large, la palette posée au-dessus d'un énoncé, puis d'une zone de palier ; à 1440, la palette avec un palier pour cible (blocs inactifs réduits), puis la page défilée (la liste des grilles sous la barre).
- **Ni verdict complet ni release.**

## 5. Clôture

- Commit sur `main`, non poussé, fichiers nommés ; demande de relecture courte, `DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-palette-retouches.md`.
- Toute trouvaille hors du lot : les trois issues de `CLAUDE.md`.
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur.
