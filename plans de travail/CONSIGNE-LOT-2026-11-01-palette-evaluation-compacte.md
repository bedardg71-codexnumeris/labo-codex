# Consigne – La palette Évaluation en version compacte (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 6 h 05 (Toronto, mesuré par `date`), sur `main` = `a8e24902` (#1213 commité, non poussé).
> **Demande de Grégoire** (6 h 00) : dans la palette Évaluation, le même choix que pour les codes, entre l'affichage complet et une version compacte. La description de chaque critère prend une place considérable ; un·e enseignant·e qui connaît ses critères s'en passe, avec le nom du critère et son menu. **Ébauches validées à 6 h 05**, dans `plans de travail/`, à l'échelle 1 : 1 de l'iPad (1 px = 1 pt), mode sombre : `EBAUCHE-2026-11-01-palette-evaluation-descriptions.dc.html` (aujourd'hui, et le défaut), `EBAUCHE-2026-11-01-palette-evaluation-compacte.dc.html`, `EBAUCHE-2026-11-01-palette-evaluation-compacte-bulle.dc.html`. Maquettes de canevas : ignore `support.js` et `x-dc`, lis les styles en ligne.
> **Ordre du groupe du 1er nov.** (décision de Cowork) : après « la barre d'outils compacte et la palette Codes compacte », avant « la palette Rétroaction laisse la place au texte ». Motifs : elle touche la palette que corrige le lot du défilement, et elle reprend le mécanisme du bouton compact que ce lot-là pose pour les codes. Une seule session écrit à la fois.

## 0. Avant tout

- Commit de docs seul : cette consigne, les trois ébauches, et `VERDICT-RELECTURE-2026-11-01-barre-outils-et-codes-compacts.md`.
- **Ajout de Cowork, 16 h 29, sur `main` = `225965ff`** : la zone de travail tient maintenant dans l'écran (partie C du lot précédent). Hors plein écran, à 1180 × 820, il reste 416 px à la copie et aux palettes.

## 1. Bâtir sur l'existant

- Le bouton compact (quatre carrés) et sa préférence mémorisée, posés pour la palette Codes au lot précédent : **même geste, même icône, même place** (en-tête, après ↔ et ↕, avant −). **Une préférence par palette** (décision de Cowork) : on peut connaître ses codes sans connaître encore ses critères. Inscris-la dans `docs/DATA-OWNERSHIP.md`.
- La palette : `creerPaletteEval` (`js/travaux-ui.js` vers 5467) crée aussi la palette Rétroaction ; **seule la palette Évaluation** (`#travaux-palette-eval-droite`) reçoit le bouton.
- Le rendu d'un critère : `js/evaluation-chargement.js` vers 1140-1245, et une seconde copie vers 1363. Mesure laquelle sert la palette, et si l'autre surface (le formulaire hors annotation) doit suivre ; écris-le.

## 2. La version compacte (`EBAUCHE-…-palette-evaluation-compacte`)

- **Défaut : les descriptions**, comme aujourd'hui.
- Une ligne par critère : son nom (gras), sa pondération, son menu de niveau à droite (environ 120 pt). La description (`.eval-critere-description`) ne s'affiche pas. Les lignes sont soudées dans un bloc, comme dans l'ébauche.
- **Critère algorithmique** : sa ligne de titre (nom, pondération, « ALGORITHMIQUE »), ses deux champs côte à côte avec leur étiquette à gauche, la ligne du résultat, le menu du niveau sans son étiquette visible (elle reste dans l'`aria-label`). Les phrases d'aide (`.eval-aide` : « Par défaut: utilise le niveau calculé… », « (Voir configuration de la grille) ») ne s'affichent pas. L'interface avec catégorisation (champ des codes) suit la même règle.
- **Critère analytique** (en points, `_saisiePointsHtml`) : absent de l'ébauche. Même règle : la description part, la saisie reste. Décide la mise en page et écris-la.
- **La bulle** (`EBAUCHE-…-compacte-bulle`) : en version compacte, le nom d'un critère qui a une description est souligné en pointillé ; le toucher ouvre sa description dans une bulle sous la ligne ; toucher ailleurs ou un autre nom la ferme. Un critère sans description : ni soulignement ni bulle. ⚠ Le nom porte déjà une bulle d'aide générale (`data-tooltip="eval-critere"`, `js/accompagnement-contenu-hover.js` vers 355) : mesure son déclencheur ; **en version compacte, la description l'emporte, jamais deux bulles à la fois**. Si le mécanisme de ces bulles peut porter la description, sers-t'en plutôt que d'en écrire un second.
- Rien ne change dans les données ni dans le calcul : un niveau choisi en version compacte donne la même note qu'en version complète.
- ↔ (en bandeau) et la palette repliée : la version compacte s'y applique aussi ; vérifie qu'un seul élément défile toujours (lot du défilement).

## 2 bis. Trois trouvailles du lot du défilement, à corriger ici (décision de Cowork, `VERDICT-RELECTURE-2026-11-01-palette-evaluation-un-defilement.md`)

- **La largeur des palettes d'Évaluer** : `min-width: 280px` et `max-width: none` (`.travaux-palette-eval`) perdent contre `.palette-flottante`, plus loin dans `styles.css`. La palette reste à 200 px et ↔ s'arrête à 320 px au lieu de la largeur de la zone (mesuré par #1214). Qu'elles gagnent, et vérifie la largeur d'ouverture sur l'iPad (1180 pt).
- **Le badge « ALGORITHMIQUE » coupé à 200 px** : il ne se coupe plus, en descriptions comme en compacte.
- **En mode sombre, les champs Erreurs et Mots** sont clairs avec un texte clair : mesure le contraste et corrige (design system).

## 3. Les tests

- Playwright `webkit`, 1180 × 820, mode Évaluer, grille de démo avec un critère algorithmique : le bouton bascule ; en compacte, aucune description ni aide visible ; le choix survit au rechargement ; un niveau choisi en compacte donne la même note qu'en complète ; toucher un nom ouvre sa description, toucher ailleurs la ferme ; une seule bulle à la fois.
- **Mesure hors plein écran** (ajout de 16 h 29) : à 1180 × 820, hors plein écran puis en plein écran, compte les critères entiers visibles sans défiler, en version complète et en version compacte ; écris les quatre nombres au rapport.
- Contre-épreuves (skill `verification-adverse`). Noms fictifs.

## 4. Fin

Commit, rapport `plans de travail/RAPPORT-2026-11-01-palette-evaluation-compacte.md` à Cowork pour relecture. **Pas de push** : la mise en ligne suit la cadence du soir.

Gestes à vérifier sur l'iPad après la mise en ligne (porte terrain) :
- Dans Évaluer, le bouton compact : une ligne par critère, le critère algorithmique avec ses deux champs ; la palette tient sans défiler (ou presque) ; mode clair et mode sombre.
- Toucher le nom d'un critère : sa description en bulle ; toucher ailleurs : elle se ferme.
- Choisir un niveau en compacte, puis revenir aux descriptions : le même niveau est choisi, la note n'a pas bougé.
