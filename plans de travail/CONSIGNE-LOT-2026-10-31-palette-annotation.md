# Consigne – les palettes d'annotation, la barre d'outils et le bloc de texte (retours de Grégoire, iPad)

> Cowork, samedi 31 octobre 2026, 10 h 14 (Toronto, mesuré par `date`), sur `main` à `e3a018c0`. Cette version remplace celle de 9 h 10 à 9 h 23, qui n'a jamais été transmise.
> Sources : le rapport `Retours des testeurs/gregoire/BUG_"grégoire"_2026-10-29_11-36-01.txt` (iPad, Safari, 1.223.0) et la séance de Cowork avec Grégoire ce matin, captures d'iPad à l'appui. **Retour testeur : il passe avant le backlog.** Inscris les deux bogues de la partie A dans `Retours des testeurs/SUIVI-BUGS.md` (lecture ciblée).
> Ébauches validées par Grégoire, dans `plans de travail/`, **dessinées à l'échelle 2×** (divise leurs px par deux) : `EBAUCHE-2026-10-31-palette-annotation.dc.html`, `EBAUCHE-2026-10-31-palette-tampons.dc.html`, `EBAUCHE-2026-10-31-palette-codes.dc.html`, `EBAUCHE-2026-10-31-barre-outils.dc.html`. Ce sont des maquettes de canevas : ignore `support.js` et `x-dc`, lis les styles en ligne. Les icônes des tampons y sont des copies des fichiers d'`autocollants/`.
> Noms d'élèves : les ébauches portent des noms fictifs ; les captures de Grégoire portent des noms réels, que tu ne recopies nulle part (règle 6 de CLAUDE.md).
> À lancer quand le lot en cours est clos : une seule session écrit dans `js/`. **Un commit par partie, dans l'ordre A à H.**

## Partie A – Les deux bogues qui gênent le travail

### A1. Le tampon se pose dès qu'on le choisit

Mesuré par Cowork, **à confirmer par un test qui échoue avant le correctif** : `setAutocollantActif` (`travaux-outils.js` vers 473) met `outilActif = 'tampon'` sans émettre `travaux-outil-change`. Or c'est cet événement qui rend le toucher au canevas d'annotation (`travaux-annotation.js` vers 976 : `position` donne `pointer-events: none`, tout autre outil `auto`) et qui coupe le déplacement de la page (`travaux-visionneuse.js` vers 1135). L'outil par défaut à l'ouverture étant `position`, le premier toucher après le choix d'un tampon tombe sur `#travaux-canvas-document`. C'est la trace exacte du rapport : 11:34:43 choix du tampon, 11:34:45 toucher sur le canevas du document, 11:34:46 Grégoire choisit un outil, puis le tampon se pose.

- `getOutilActif()` rend `OUTILS.stylo` pour `'tampon'` (absent d'`OUTILS`) : vérifie ce que l'événement transporterait et ce qu'en font ses écouteurs.
- Même chemin pour le tampon de jeton (`activerTamponJeton`). Les codes passent par `setOutilActif` : vérifie qu'ils n'ont pas le même défaut.
- Le toucher d'un seul doigt pour poser un tampon (#1123) doit continuer de fonctionner.
- **Le tampon choisi n'est vraisemblablement jamais surligné** : `setAutocollantActif` (vers 484) et `rafraichirPalette` (vers 1667) cherchent la tuile par `[onclick*=…]`, alors que les tuiles portent `data-param` depuis le retrait des handlers en ligne. Corrige-le avec le sélecteur des codes (`data-param`).

### A2. Le bloc de texte se modifie sans perdre son texte

Rapport de Grégoire (10 h 09, deux captures d'iPad) : toucher un bloc de texte long avec l'outil Texte ouvre une zone plus petite, et il ne peut plus atteindre la fin du texte pour corriger. Il dicte ses commentaires : pouvoir corriger est essentiel. Mesuré dans `editerTexte` (`travaux-annotation.js` vers 1428) :

1. **Hauteur** : seul `min-height: 32px`, avec `overflow: hidden`. La zone montre deux lignes ; le reste est caché, sans défilement.
2. **Largeur** : `max-width: 400px` plafonne un bloc plus large, qui rétrécit à l'ouverture. À la confirmation, `data.width = nouvelleLargeur` : vérifie si un simple aller-retour rétrécit le bloc pour de bon.
3. **Sélection** : `textarea.select()` sélectionne tout ; une lettre tapée ou dictée remplace le bloc entier.

Validé par Grégoire : la zone s'ouvre exactement à la taille du bloc (sa largeur enregistrée, sans plafond ; une hauteur qui couvre tout le texte) et grandit en hauteur pendant la saisie. Rien n'est sélectionné : le curseur se place à la fin du texte, et toucher dans la zone le déplace (comportement natif). Même règle pour la création d'un bloc (vers 1338). **Source ou stock** : un bloc déjà rétréci garde sa largeur enregistrée ; ne le répare pas d'office, écris-le dans le rapport.

Tests : la zone couvre tout le texte d'un bloc de dix lignes ; rien n'est sélectionné à l'ouverture (break-test).

## Partie B – Deux doigts déplacent la page (iPad)

Quel que soit l'outil actif, **deux doigts qui glissent déplacent la page**. Un doigt garde son comportement (rejet de la paume, tampon ou code posé d'un toucher, #1123). Bâtis sur l'existant : le pincement pour zoomer (`travaux-visionneuse.js` vers 805-900, `gesturestart`/`gesturechange` sous Safari) et le déplacement de l'outil `position` (`panState`, `configurerPan`). Le pincement et le glissé à deux doigts cohabitent dans un même geste, comme dans les apps de l'iPad. Sur Mac, rien ne change. Le toucher réel ne s'émule pas fidèlement : ce point passe par la porte terrain.

## Partie C – La palette d'annotation (`EBAUCHE-2026-10-31-palette-annotation.dc.html`)

**Largeur : 188 px** au lieu de 200 (Grégoire veut garder la place de la copie ; la rangée la plus large, lignes et extrémités avec le badge W, tient dans 188 px). Seule la palette d'annotation change de largeur. Vérifie si une largeur redimensionnée par l'utilisateur (poignée, #773) est mémorisée : si oui, la sienne l'emporte ; écris-le.

De haut en bas :

1. En-tête : voir la partie F.
2. « Déverrouiller l'évaluation » : inchangé, quand il est affiché.
3. **Bande soudée** : Déplacer la page (`position`), Sélection, Dupliquer.
4. **Bande soudée** : Annuler, Supprimer (la corbeille, **au milieu**), Rétablir.
5. **Disparaissent de la palette** : « Effacer tout » (déplacé au point 11) ; l'identité de l'élève et de la production, avec son bouton de profil (le bouton jumeau de la palette Paramètres, `index.html` vers 8444, reste ; la partie G en ajoute un au carrousel) ; la barre du bas (ses trois boutons passent à la barre d'outils, partie G). Retire avec l'identité ses lecteurs (`#travaux-annot-label-etudiant` : `travaux-outils.js` vers 3884, `travaux-ui.js` vers 5533) : zéro dette.
6. Une rangée : « Outils » au-dessus d'un bloc soudé Stylo | Surligneur | Texte ; « Formes » au-dessus d'un bloc soudé Cercle | Rectangle | Polygone (partie H).
7. Une rangée : « Lignes » au-dessus d'un bloc soudé Ligne | Pointillé | Vague ; « Extrémités » au-dessus du bloc soudé des quatre extrémités.
8. **Extrémité par défaut : sans pointe** (`let flechePointes = 'fin'`, l. 146, devient `'aucune'`). Source seulement : `normaliserPointes` lit la valeur posée sur chaque forme ; les flèches existantes gardent leurs pointes.
9. **Couleurs** : une seule rangée soudée de douze carrés (environ 13 px), la couleur active marquée d'un double liseré intérieur, blanc puis foncé (visible aussi sur le blanc).
10. **Épaisseur**, une seule rangée : ← | glissière | → | aperçu du trait (épaisseur et couleur courantes) | « 2 px ». L'icône aux trois lignes disparaît.
11. **« Effacer la page »**, tout en bas : petit bouton au contour rouge. C'est le nouveau libellé de « Effacer tout », qui n'efface que la page affichée (mesuré, `effacerPage`). Son comportement ne change pas : proposition de sauvegarde, puis Annuler le défait.

Les quatre titres de section (« Outils », « Formes », « Lignes », « Extrémités ») et « Effacer la page » sont validés mot pour mot.

- **Bloc soudé** : coins arrondis aux deux bouts seulement, séparateurs fins, l'outil actif prend le fond bleu dans son segment. Un raccourci assigné garde son badge (W sur Vague).
- **Icône du carré** : son trait passe à l'épaisseur de celui du cercle (`icons/icon-square.svg` ; mesure ses autres usages avant de la remplacer).
- **Raccourcis X et S** : Grégoire videra lui-même ces deux cases dans « Raccourcis outils » ; rien à coder (mesuré : une case vidée n'est pas réécrite par les défauts).
- Mesure les consommateurs avant de déplacer : `rafraichirPalette`, `#travaux-options-fleche`, les badges, le CSS `.palette-flottante` (vers 27409 de `styles.css`), le mode sombre. Mac et iPad séparément.

## Partie D – La palette Tampons (`EBAUCHE-2026-10-31-palette-tampons.dc.html`)

- Chaque catégorie : un **bloc de tuiles soudées**, trois colonnes (icône, nom dessous, badge de raccourci dans le coin).
- La couleur de catégorie devient **un petit carré devant le titre**, à la place du liseré gauche (`border-left`, `genererContenuTampons` vers 1471). Principe de Grégoire (24 oct.) : pas de liseré dans l'app.
- **Le titre d'une catégorie la replie ou la déplie** (flèche qui pivote ; repliée, une ligne qui dit « N tampons »). L'état est mémorisé par catégorie : nouvelle clé de préférence, à inscrire dans `docs/DATA-OWNERSHIP.md`.
- Le tampon choisi prend le fond bleu (A1).
- Largeur inchangée.

## Partie E – La palette Codes (`EBAUCHE-2026-10-31-palette-codes.dc.html`)

- **Le badge gris de raccourci disparaît** : la touche d'un code est son numéro (1 à 9, et 0 pour le code 10) ; au-delà de dix codes, pas de touche. Constat de Grégoire : les raccourcis enregistrés ne concordaient plus avec les numéros (le code 4 se posait avec la touche 5, le 6 avec la 4), après un déplacement des codes.
- Les raccourcis de codes enregistrés (`raccourcisAnnotation`, entrées `errfr_*`) ne sont plus lus ; **ne les efface pas** (Grégoire refuse toute suppression irréversible de données).
- Vérifie le traitement des touches (`travaux-annotation.js` vers 1085) : un chiffre va au code, même si un autre item (un tampon) avait reçu ce chiffre. L'écran des raccourcis ne doit plus proposer de chiffres pour les codes. Mesure, décide, écris-le.
- Le compteur des codes posés (cadre gris, `travaux-errfr-compteur`) reste.

## Partie F – Les en-têtes des trois palettes

- **Même ordre partout** : à gauche la poignée ⠿, le nom de la palette, puis l'engrenage des réglages ; à droite ↔ ↕ − (Annotation : − seul). Aujourd'hui, l'engrenage est à gauche du nom dans Tampons et Codes, et le nom de Codes est centré.
- **Les glyphes ↔ ↕ s'affichent partout comme sur Mac.** Sur l'iPad, Safari dessine « ↕ » (U+2195) avec la police emoji (un carré bleu). Ajoute le sélecteur de présentation texte U+FE0E, déjà employé pour le crochet (`'✔︎'`), après `↔` et `↕` : boutons de disposition de `travaux-outils.js` (vers 518-519 et 1583-1584), de `travaux-ui.js` (vers 5463-5464), et la double pointe des extrémités (vers 2015, libellé et `title`). Mesure s'il en reste d'autres (les commentaires et les libellés de graphiques ne comptent pas). Une garde Vitest (break-test). Si l'iPad ignore le sélecteur à la porte terrain, le repli est une petite icône SVG : ne le fais pas d'office.

## Partie G – La barre d'outils (`EBAUCHE-2026-10-31-barre-outils.dc.html`)

- **Étiquette de l'élève dans le carrousel** (`genererBadgeFichierImporte`, `travaux-ui.js` vers 2741) : le bouton « Aperçu rétroaction » (`travaux-badge-retro`) disparaît, **avec la fenêtre qu'il ouvre** (`afficherRetroaction`, vers 7250, et sa modale). Grégoire ne s'en sert pas : elle s'affiche vide alors que la rétroaction existe, et elle porte un bouton « Enregistrer ». C'était son seul appelant (mesuré). **Mesure d'abord si ce bouton pouvait écrire une rétroaction vide**, et dis-le dans le rapport.
- À sa place, **un bouton de profil** (`ouvrirProfilDepuisAnnotation`, icône `icon-profile.svg`, `data-stop` pour ne pas ouvrir la copie). Le cadenas reste. La vue Archivage réutilise ce badge (action `ouvrirPreviewInline`) : décide si le profil y a sa place, et écris-le.
- **Les trois boutons du bas de la palette d'annotation** (Bibliothèque de tampons, palette Codes, palette Tampons) passent dans la barre d'outils, **en bande soudée, juste après le carrousel** (`travaux-ui.js` vers 1212). Garde les identifiants `btn-toggle-codes` et `btn-toggle-tampons` (`majEtatBtnToggle`, et la visite guidée : `accompagnement.js` vers 571 cible `#btn-toggle-tampons`). Un bouton enfoncé montre que sa palette est ouverte. Vérifie s'ils doivent rester visibles hors du mode Annoter (le menu « Annoter ▾ »), et la place qui reste au carrousel sur iPad.

## Partie H – Les nouvelles formes

### H1. Le trait des formes fermées

**La dernière ligne choisie (pleine, pointillée, vague) donne son trait au cercle, au rectangle et au polygone.** Exemple : toucher Pointillé, puis Cercle, trace un cercle pointillé. Tant qu'une forme fermée est active, le segment du trait courant reste marqué d'un état secondaire, distinct de l'outil actif. Les extrémités n'ont pas d'effet sur une forme fermée. Au départ, le trait courant est plein.

- Données : une propriété sur la forme (par ex. `trait`), absente = plein. Les annotations existantes restent en trait plein, sans migration.
- Rendu : il existe **deux copies** de `dessinerForme`, celle de l'écran (`travaux-annotation.js` vers 2617, plus `dessinerFormeTemporaire` vers 2967) et celle du **PDF que lisent les élèves** (`travaux-export-pdf.js` vers 450). Regarde aussi `dessinerAnnotationsSurCanvas` (`travaux-archivage.js` vers 581). Le pointillé est un `setLineDash` ; la vague suit le contour. **Une seule fonction pure** trace la vague le long d'un contour fermé, appelée par l'écran et par le PDF : l'ellipse, et le polygone, dont le rectangle est le cas à quatre côtés.
- Vérifie la sélection, le déplacement et la duplication d'une forme pointillée ou ondulée.
- Tests : la fonction pure (Vitest) ; le rendu écran et PDF d'un cercle pointillé (break-test).

### H2. Le polygone, tracé sommet par sommet

Validé par Grégoire : **sommet par sommet**, pas d'un seul geste. Rien de tel n'existe dans l'app (mesuré).

- Bouton « Polygone », dans le bloc des formes, après Rectangle. Crée `icons/icon-polygon.svg` dans le style des autres (viewBox 50, tracé noir, même épaisseur que le cercle).
- Tracé : chaque toucher du crayon (ou clic) pose un sommet ; les côtés sont droits ; un segment d'aperçu suit le pointeur. Toucher le premier sommet ferme la forme (tolérance de quelques px à l'écran, à fixer par toi) ; il faut au moins trois sommets. Pendant le tracé, Annuler retire le dernier sommet ; changer d'outil, ou Échap sur Mac, abandonne un polygone non fermé ; après fermeture, Annuler retire le polygone entier. Doigt : rejet de la paume ; deux doigts déplacent la page (partie B).
- Données : un type nouveau (par ex. `polygone`, sommets normalisés), rendu à l'écran et dans le PDF de l'élève par la fonction de H1. Mesure ce que fait une version antérieure de l'app devant un type inconnu (défaut des `switch` de rendu), sans corriger d'office ; écris-le.
- Sélection, déplacement, duplication et suppression du polygone fermé.
- Tests : moins de trois sommets ne crée rien ; rendu écran et PDF (break-test).

## Fin

Un commit par partie, Vitest entier, specs WebKit touchées. **Pas de release ni de verdict** (le verdict tourne le soir, au signal de Grégoire). Rapport `RAPPORT-2026-10-31-palettes-annotation.md`, avec pour chaque correctif la phrase « source ou stock » ; demande de relecture à Cowork.

Gestes à vérifier sur l'iPad après la mise en ligne (porte terrain, skill `portes-terrain`) :

- Choisir un tampon, toucher la copie : le tampon se pose du premier coup, et sa tuile est surlignée.
- Toucher un long bloc de texte avec l'outil Texte : tout le texte est visible, rien n'est sélectionné ; dicter une correction au milieu du texte.
- Deux doigts déplacent la page avec le stylo actif ; un doigt seul ne trace rien.
- La palette d'annotation a la disposition de l'ébauche, à 188 px, sans débordement, en mode clair et en mode sombre.
- Une nouvelle ligne n'a pas de pointe ; une flèche posée avant garde la sienne.
- Tampons : tuiles soudées ; toucher « Action » la replie, et elle reste repliée à la copie suivante.
- Codes : plus de badge gris ; la touche 4 pose le code 4 (Mac, clavier de l'iPad).
- Les trois en-têtes : poignée, nom, engrenage à gauche ; les flèches ↔ ↕ sont des flèches simples, pas un carré bleu.
- Carrousel : plus d'icône d'aperçu ; le bouton de profil ouvre le profil sans changer de copie ; les trois boutons des palettes, après le carrousel, ouvrent et ferment leur palette.
- Pointillé puis Cercle : cercle pointillé à l'écran et dans le PDF de l'élève ; Vague puis Rectangle, idem.
- Polygone : quatre touchers, puis le premier sommet : un quadrilatère se ferme ; en pointillé et en vague aussi.
