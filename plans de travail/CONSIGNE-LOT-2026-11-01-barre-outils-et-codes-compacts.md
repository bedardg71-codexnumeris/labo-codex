# Consigne – La barre d'outils compacte et la palette Codes en version compacte (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 5 h 40 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `0fd0427f` (1.229.0 en ligne).
> **Remesurée par Cowork à 10 h 37** sur `main` = `abf256ee` (6 commits d'avance sur `origin/main`, non poussés) : les trois lots qui la précèdent sont faits et relus, acceptés. Les repères de lignes ci-dessous sont recalés sur cet état (`grep`) ; les autres n'avaient pas bougé.
> **Une autre session tourne** : `lot/pauses-apres-ouverture`, dans son propre arbre (`.claude/worktrees/`), qui ne touche que des specs. Ne l'arrête pas et n'écris pas dans son arbre. Ses Playwright et les tiens peuvent se chevaucher : les durées en souffrent, pas les verdicts (constaté à #1215). Elle posera un cliquet sur les pauses fixes des specs : **dans tes specs, attends une condition observable plutôt qu'un délai** ; une fenêtre « rien n'est écrit », sans condition possible, se garde et se nomme en commentaire, pour être comptée à la fusion.
> **Ébauches validées par Grégoire** (barre adoptée à 5 h 37, palette à 5 h 39), dans `plans de travail/`, **dessinées à l'échelle 1 : 1 de l'iPad en paysage (1180 pt ; 1 px = 1 pt)**, contrairement à celles du 31 oct. (2×) : `EBAUCHE-2026-11-01-barre-outils-aujourdhui.dc.html` (la référence), `EBAUCHE-2026-11-01-barre-outils-proposee.dc.html`, `EBAUCHE-2026-11-01-palette-codes-descriptions.dc.html`, `EBAUCHE-2026-11-01-palette-codes-compacte-code-choisi.dc.html`, `EBAUCHE-2026-11-01-palette-codes-compacte-aucun-code.dc.html`. Ce sont des maquettes de canevas : ignore `support.js` et `x-dc`, lis les styles en ligne. Mode sombre dessiné ; le mode clair suit le design system.
> **Son but** : donner le plus d'espace possible à la copie sur l'iPad, et voir plus de noms d'élèves dans le carrousel (au moins un de plus).
> Noms d'élèves : fictifs dans les ébauches ; ne recopie aucun nom réel (règle 6 de `CLAUDE.md`).
> **À lancer après les lots « la palette relit la grille »** (`CONSIGNE-LOT-2026-11-01-palette-relit-la-grille.md`, même fichier `travaux-outils.js`) **, « la palette Évaluation n'a qu'une barre de défilement »** (`CONSIGNE-LOT-2026-11-01-palette-evaluation-un-defilement.md`, même `styles.css`) **et « Évaluer relit la grille »** (`CONSIGNE-LOT-2026-11-01-evaluer-relit-la-grille.md`) : une seule session écrit à la fois. Un commit par partie.

## 0. Avant tout

- Commit de docs seul : cette consigne, les cinq ébauches, et les deux verdicts de relecture de Cowork restés hors commit (`VERDICT-RELECTURE-2026-11-01-palette-evaluation-un-defilement.md`, `VERDICT-RELECTURE-2026-11-01-evaluer-relit-la-grille.md`).

## Partie A – La barre d'outils (`EBAUCHE-…-barre-outils-proposee`)

Mesuré par Cowork sur la capture de Grégoire (iPad, 1180 pt) : aujourd'hui un nom complet et deux coupés ; avec l'ébauche, trois noms complets. Le gain vient surtout des étiquettes et du menu de la production ; les bandes n'apportent qu'une quarantaine de points. Tiens ces proportions.

1. **Étiquettes du carrousel** (`genererBadgeFichierImporte`, `travaux-ui.js` vers 2742) : la pastille en mots devient **un symbole de 15 pt avant le nom**. Nom à 14 pt ; le nom de la copie ouverte en gras ; bouton de profil 24 pt ; cadenas 13 pt après le nom ; l'étoile de reprise reste.
   - Symboles : Évalué = disque vert avec crochet ; En cours (copie ouverte) = demi-disque orange dans un cercle ; Importé = cercle gris vide. **Les deux états que l'ébauche ne dessine pas, décidés par Cowork** : Annoté = cercle bleu avec un point central ; Incomplet = cercle orange avec un point d'exclamation. Les formes diffèrent, pas seulement les couleurs.
   - Le mot reste dans la bulle et pour le lecteur d'écran (le texte actuel de la pastille, inchangé : « Évalué », « EN COURS », « Incomplet »…).
   - ⚠ **`.travaux-badge-pill` sert ailleurs** : `liste-evaluations.js` vers 1625, `modelisation.js` vers 145, `travaux-ui.js` vers 3066 et 7320. Ces vues gardent leurs mots. Et l'état d'une pastille change en direct (`afficherPastilleActive` vers 2722, le surlignage vers 3474 et 5939, `evaluation-sauvegarde.js` vers 515, 548 et 733 : `className` et `textContent`). **Piste de Cowork** : garder l'élément et son texte, et dessiner le symbole en CSS, scopé à l'étiquette du carrousel, d'après la classe d'état ; ainsi aucun de ces écrivains ne change. Mesure, décide, écris-le. La vue Archivage réutilise l'étiquette : décide si elle prend les symboles, et écris-le.
2. **Menu de la production** (`_htmlDropdownProduction`, vers 2936) : 136 pt, un titre trop long se coupe par « … », titre complet dans la bulle.
3. **Bande des palettes** (`genererHTMLBandePalettes`, `travaux-outils.js` vers 2063) : trois boutons de 32 pt, inchangés sinon. ⚠ Elle est aussi appelée par `modelisation.js` (vers 84) : la Modélisation prend le même changement ; vérifie qu'elle s'affiche encore bien, et écris-le.
4. **Pages** : une bande soudée ‹ | 1/3 | › (32, 40, 32 pt), `#travaux-indicateur-page` écrit « 1/3 » sans espaces.
5. **Zoom et plein écran** : une bande soudée « 57 % » | plein écran (46 et 32 pt). Rien ne change dans leur comportement.
6. **Chronomètre** : icône 15 pt, temps à 13 pt.
7. Hauteur des contrôles : 32 à 34 pt. Ne descends sous 32 pt pour aucun bouton (cibles tactiles).

Mesure sur l'iPad (1180 pt) **et** sur une largeur de Mac : combien d'étiquettes complètes on voit, avant et après ; écris-le au rapport.

## Partie B – La palette Codes en version compacte

**Décision de Grégoire** : l'utilisateur choisit entre les descriptions (la palette d'aujourd'hui) et la version compacte. Motif : en début d'usage, on a besoin des noms des codes ; quand on les connaît, la version compacte libère la copie.

1. **Le choix** : un troisième bouton de disposition dans l'en-tête de la palette Codes, après ↔ et ↕, une icône de quatre carrés (`EBAUCHE-…-palette-codes-descriptions`). Ordre de l'en-tête : poignée, nom, engrenage | ↔ ↕ compacte −. La disposition choisie est marquée. **Défaut : les descriptions (↕).** Le choix est mémorisé : nouvelle préférence, à inscrire dans `docs/DATA-OWNERSHIP.md`. ↔ et ↕ gardent leur comportement (`layoutPaletteH`, `layoutPaletteV`, `travaux-outils.js` vers 2174 et 2203) ; décide comment le troisième s'articule à eux, et écris-le. Seule la palette Codes a ce bouton.
2. **La version compacte** (`EBAUCHE-…-compacte-code-choisi` et `…-aucun-code`) : **188 pt de large**, comme la palette Annotation.
   - Une grille soudée de tuiles, cinq par rangée (plus de dix codes : d'autres rangées), chaque tuile à la couleur du code et son numéro en blanc. Un code dont le numéro est long (un code libre de sous-critère, jusqu'à 20 caractères) : mesure ce qu'il donne et décide.
   - Le compteur de chaque code (`.travaux-errfr-compteur`) passe dans le coin de sa tuile.
   - Le code actif : double liseré intérieur, blanc puis foncé (celui de la couleur active de la palette Annotation).
   - Sous la grille, une zone de trois lignes réservées : le numéro et le nom du code actif ; sans code actif, « Touche un code : son nom paraît ici. » (mots de l'ébauche validée). La hauteur de la palette ne bouge pas d'un code à l'autre.
   - En-tête : le total devient une pastille numérique après « CODES » (bulle : le texte actuel du total, `_totalCodesEnMots`). En descriptions, le total reste tel qu'aujourd'hui.
   - Les touches 1 à 9 et 0 posent toujours les codes (partie E du 31 oct.) ; le nom complet de chaque code est dans sa bulle et son `aria-label`.
3. Les messages de palette vide (`travaux-errfr-vide`) s'affichent aussi en version compacte.
4. Tout ce qui lit `.travaux-errfr-item` (`travaux-outils.js` vers 2094, `rafraichirPalette` vers 2074, le surlignage du code actif) doit fonctionner dans les deux versions : mesure les consommateurs avant de toucher au balisage.

## Partie C – La zone de travail tient dans l'écran (trouvaille du lot du défilement)

Mesuré par #1214 (WebKit, 1180 × 820) : hors plein écran, la zone de la copie commence à 403 px et finit à 1060 px ; **la page entière défile** sous les palettes. C'est peut-être ce que Grégoire a vécu comme un « double défilement ». Décision de Cowork : le corriger ici, puisque ce lot rend l'espace à la copie.

- En Annoter et en Évaluer, hors plein écran, la zone de travail tient dans la hauteur de l'écran : la page ne défile plus, la copie et les palettes ont toute la hauteur qui reste sous la barre. Mesure d'où viennent les 240 px de trop (la règle `height: calc(100vh - 120px)` de la zone, vers 17456 de `styles.css`, ce qui la précède dans la page) avant de corriger.
- iPad : la barre d'adresse de Safari change la hauteur visible ; vérifie l'unité retenue (`dvh` ou mesure) sur WebKit.
- Test : à 1180 × 820, en Annoter et en Évaluer, `document.scrollingElement.scrollHeight <= innerHeight`. Contre-épreuve.

## Tests

- Playwright `webkit` : la copie ouverte porte le symbole « en cours », une copie évaluée le symbole « évalué » ; le mot est dans l'`aria-label` ; une vue hors carrousel (liste des évaluations) garde sa pastille en mots.
- Palette : le bouton compact bascule ; le choix survit au rechargement ; un code se pose d'un toucher sur sa tuile et son compteur monte ; la touche 4 pose le code 4 en compacte.
- Contre-épreuves (skill `verification-adverse`). Noms fictifs.

## Fin

Commit par partie, Vitest entier, specs WebKit touchées. **Pas de release ni de verdict** (le verdict tourne le soir, au signal de Grégoire). Rapport `RAPPORT-2026-11-01-barre-outils-et-codes-compacts.md` à Cowork pour relecture, avec les mesures de la partie A et toute décision prise seul.

Gestes à vérifier sur l'iPad après la mise en ligne (porte terrain, skill `portes-terrain`) :
- Le carrousel montre au moins trois noms complets ; les symboles se lisent ; toucher un symbole n'ouvre rien d'autre que la copie.
- Le titre d'une production longue se coupe proprement.
- Pages, zoom, plein écran, palettes : tout répond comme avant.
- Hors plein écran, en Annoter et en Évaluer, la page ne défile plus : seule la palette touchée défile.
- Palette Codes : la version compacte se choisit, reste choisie à la copie suivante et au rechargement ; un code touché affiche son nom sous la grille ; mode clair et mode sombre.
