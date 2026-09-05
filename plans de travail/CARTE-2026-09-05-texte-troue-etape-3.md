# Carte — le texte troué, étape 3 : le badge s'affiche dans la phrase (lot D du 5 septembre 2026)

> **Écrite le 5 septembre 2026, 9 h 27 (Toronto — heure lue par `TZ=America/Toronto date` avant l'écriture ;
> l'en-tête disait « 9 h 35 », tapé, non lu : erreur 14, corrigée à la relecture de Cowork), par Claude Code, sur
> `9ec87e70` (lots A et B commités en local, 1.118.0 en ligne).**
> ↻ **Relecture de Cowork (9 h 29-9 h 40) : le fond tient, ancres remesurées ; deux réserves, traitées ci-dessous
> (le saut de ligne, §a-b ; l'heure, ici).** Rendue à Cowork AVANT le code : c'est un composeur neuf, pas une finition (règle 2).
> Source : `CADRAGE-2026-09-02-badges-texte-troue.md` (« ▣ Le mécanisme de glissé existe déjà » ; ⛔ jamais
> `dragstart` / `drop`) et le lot D de `CONSIGNE-DU-JOUR.md`. L'étape 4 (les badges qu'on invente) reste hors
> de ce jour. Tout ce qui suit est MESURÉ (commande ou ligne), sauf ce qui est marqué « proposé ».

## 0 · La vue d'ensemble

Aujourd'hui, une zone qui offre des badges est un `<textarea>` : le badge cliqué y écrit `{erreurs}` en clair
(`insererRepereEnonce`, `grilles.js:~5555`), et ce texte brut est ce que la grille enregistre, ce que le moteur
lit, ce qui voyage. **Rien de cela ne change.** Ce qui change est ce que l'œil voit : par-dessus chaque
`<textarea>`, une zone éditable rend les `{jetons}` de sa palette comme des pastilles (les mêmes que la rangée
« Poser : », bleu posé / vert rempli) et le reste comme du texte. Le `<textarea>` reste **la valeur** — caché,
il garde ses attributs, ses handlers, son moment d'écriture ; la zone éditable n'est qu'une VUE qui s'y
resynchronise. Si la vue ne peut pas se construire, le `<textarea>` se montre et tout marche comme aujourd'hui.

## a) Le composant — ce que le dépôt a de plus proche, mesuré

- `grep -rn "contenteditable" js/` : **10 sites, tous dans `planification-carte.js`** (titres et objectifs de
  la carte mentale, `:5391`, `:5409`, `:5424`, `:5585`, `:5597`) plus deux gardes (`travaux-visionneuse.js:1001`,
  `travaux-annotation.js:915`, qui excluent `[contenteditable]` des raccourcis clavier). Ce sont des libellés
  d'UNE ligne, sans balisage interne : ils donnent le patron du collage (§c), pas celui des chips.
- `grep -rn "chip" js/ styles.css` : **un commentaire** (`bilan-reflexif-core.js:203`). Aucun composant de chips.
- `rendreBoutonsReperes` (`grilles.js:3578`) et `.repere-enonce` / `--posee` / `--remplie` (`styles.css:3308-3345`,
  44 px en tactile `:18260`) : **la pastille existe** — c'est le bouton de la palette. La chip dans la phrase
  réemploie ses classes, sans `data-action` (elle n'est pas un bouton de pose), avec une croix.
- `insererRepere` (`evaluation-enonces.js`, pur) : le point d'insertion ramené hors d'un mot (`_horsDuMot`), les
  espaces autour du jeton, le refus d'un jeton hors palette. **Il se réemploie tel quel** : la vue traduit sa
  sélection en positions dans le TEXTE, appelle `insererRepere`, et se redessine à partir du texte rendu.

**Proposé — un module neuf, `js/composeur-badges.js`** (chargé après `evaluation-enonces.js`, avant `grilles.js`),
deux couches :

1. **Pure, testable en Node** :
   - `segmenter(texte, palette)` → `[{ type: 'texte', valeur } | { type: 'jeton', jeton, famille, libelle }]`,
     par une expression construite depuis les jetons de la palette (`_echapperRegExp`, comme les registres) ;
     un `{truc}` hors palette est du TEXTE ; `{s}` (le pluriel, jamais dans une palette) reste du texte ;
   - `assembler(segments)` → le texte, concaténation stricte (aucune espace ajoutée, aucun trim) ;
   - ↻ **le saut de ligne (réserve de Cowork)** : `rendreHtml` rend `\n` en `<br>` (un texte qui FINIT par `\n`
     reçoit un `<br>` de plus — le « placeholder » que tout moteur exige pour poser le caret sur la ligne
     vide) ; `lire` compte `\n` pour chaque `<br>` SAUF le dernier enfant de son parent (le placeholder), et
     fait de tout bloc (`<div>`, `<p>`, `<li>`, `<section>`, `<blockquote>`) une frontière `\n` avant son contenu
     quand quelque chose le précède — ce que WebKit ou Blink produiraient si un Entrée leur échappait ;
     tout autre élément se lit par ses enfants (donc son texte, sans balise). La sentinelle d'aller-retour
     couvre `lire(ecrire(t))` sur des textes à une, deux et trois lignes, une ligne vide au milieu, une fin
     de ligne, et les formes de bloc des deux moteurs ;
   - `rendreHtml(texte, palette, esc)` → le HTML de la vue : `esc()` sur chaque segment texte, une
     `<span class="repere-enonce repere-enonce--<famille> composeur-chip" contenteditable="false"
     data-jeton="{erreurs}">erreurs<span class="composeur-chip-croix" aria-hidden="true">×</span></span>` par jeton ;
   - `positionDansTexte(segments, indexSegment, offsetDansSegment)` et `positionDansSegments(segments, offset)` :
     la table de correspondance texte ↔ vue, dans les deux sens (une chip compte pour la longueur de son jeton).
   ▣ **La sentinelle d'aller-retour** : pour tout texte des palettes (les défauts des quatre énoncés dans les
   deux modèles, les six paliers de migration et du gabarit neuf, les jetons collés, deux jetons adjacents, un
   jeton en tête, un inconnu, une accolade seule, du HTML dans le texte), `assembler(segmenter(t)) === t`, au
   caractère ; break-test : une sérialisation qui ajoute une espace rougit.
2. **DOM, sans handler inline** — `monter(textarea)` construit la vue à côté du `<textarea>` (qui prend
   `hidden` et `data-composeur="1"`) ; `lire(vue)` sérialise en marchant les nœuds (texte → `textContent`,
   chip → `data-jeton`, `<br>` → `\n`, tout autre élément → son texte) ; `ecrire(vue, texte, curseur)` redessine
   la vue depuis le texte (`innerHTML` du HTML de `rendreHtml`, tout échappé) et replace le caret ;
   `curseur(vue)` → `{ debut, fin }` en positions de TEXTE depuis la `Selection`.
   ↻ **Entrée (réserve de Cowork)** : `keydown` intercepté dans la vue, `preventDefault`, puis
   `execCommand('insertText', false, '\n')` — le patron du collage — pour que le moteur n'insère ni `<div>` ni
   `<br>` à sa guise, et que l'annulation native reste juste ; le repli par `Range` seulement si la commande est
   refusée. Le collage garde ses sauts de ligne par le même chemin.

## b) L'écriture — les mêmes handlers, la même valeur, au même moment

▣ Mesuré : les handlers de frappe lisent `el.value` et `el.dataset.*` du `<textarea>` (`modifierTexteEnonce*Handler`,
`modifierPalierProjection*Handler`, `grilles.js`), et le dispatcher délègue **`change`, `input`, `keyup`,
`mousedown`, `focusin`** (`main.js:1330`) — `data-on-change` sur le `<textarea>`. Un `contenteditable` n'émet
JAMAIS `change` (l'événement est réservé à `input` / `select` / `textarea`) ; il émet `input` à chaque frappe
et **`focusout`** en le quittant — `focusout` bulle, `blur` non ; `focusout` **n'est pas délégué** par `main.js`.

**Proposé** : le `<textarea>` reste le porteur de la valeur et des handlers — **rien ne change dans
`data-on-change`, ni dans main.js**. Le module écoute `focusout` sur `document` (comme grilles.js écoute
`focusin` pour `curseurVu`, `:5628`) : quand une vue est quittée, il écrit `lire(vue)` dans `textarea.value` et,
si la valeur a changé, **dispatche `change` sur le `<textarea>`** → le dispatcher exécute le handler d'aujourd'hui,
qui écrit et redessine — le même moment (en quittant la zone), la même valeur texte. Sur `input`, la vue ne
fait que garder `textarea.value` à jour (pour la pose au clic, qui lit la valeur), sans rien écrire ni
redessiner : le caret survit, comme aujourd'hui.

**La pose au clic** (`insererRepereEnonce`) : si la zone porte une vue, le caret vient de `curseur(vue)` au lieu
de `selectionStart`, le texte de `textarea.value` ; `insererRepere` rend le texte et le caret ; la vue se
redessine (`ecrire`) et le `<textarea>` reçoit la valeur ; le chemin d'écriture sans rendu (`_muterPalier`,
`_ecrireTexteEnonce*`) ne change pas. Le `focusin` de grilles.js reconnaît la vue (`closest('.composeur-badges')`
→ son `<textarea>`) pour `curseurVu` et `zoneActive`.

**Retirer un badge** : la chip est `contenteditable="false"` et inline — l'effacement arrière l'enlève d'un bloc
(comportement natif WebKit / Blink sur un nœud non éditable) ; la croix, sur `pointerdown` (comme la palette :
sans prendre le focus), retire la chip et resynchronise. ⚠ À ÉPROUVER SUR iPAD (porte terrain) : l'effacement
arrière d'un nœud non éditable au clavier virtuel.

## c) La sécurité

- Le texte tapé ne repasse JAMAIS dans le rendu autrement que par `esc()` (`rendreHtml`) ou `createTextNode` ;
- `{truc}` inconnu : texte ; la ligne orange (`ligneInconnus`, grilles.js) lit toujours `textarea.value` — inchangée ;
- coller : le patron de `collerEnTexteBrut` (`planification-carte.js:5320`) — `paste` intercepté, `text/plain`
  seulement, `execCommand('insertText')` (la pile d'annulation native), sauts de ligne gardés ici (une zone de
  palier peut en porter) ; un HTML collé ne rend que son texte ;
- rien dans les données : `git diff -- js/evaluation-projection.js js/evaluation-enonces.js js/import-export.js
  js/partage-schemas.js` rend ZÉRO ; **sentinelle** : une grille existante rendue puis « quittée » sans frappe
  ne subit aucune écriture (`lire(monter(textarea)) === textarea.value` pour tous les textes des palettes).

## d) Le repli — un drapeau mesuré à l'ouverture

**Proposé** : `composeurBadges.disponible()` mesure une fois, au chargement : `typeof window.getSelection ===
'function'`, `'isContentEditable' in document.createElement('div')`, et un essai réel (`div.contentEditable =
'true'` puis lecture `=== 'true'`). Faux → `monter` ne fait rien, le `<textarea>` reste visible : l'écran
d'aujourd'hui. Et à chaque `monter`, un `try / catch` : une exception du moteur laisse le `<textarea>` visible
pour CETTE zone. ⛔ Pas d'option d'écran.

## e) Le glissé

Hors de cette carte : le clic au curseur tient (il tient depuis l'étape 1, éprouvé iPad). Si Grégoire le
demande à la porte terrain, c'est le patron de `planification-carte.js` (pointeur, `setPointerCapture`) et
`positionDansSegments` (déjà là) pour « où ça tombe » ; un volet à part, séparable.

## Les volets, un commit chacun (après la relecture de Cowork)

1. **Composant + sentinelle d'aller-retour** : `js/composeur-badges.js` (pur + DOM), `styles.css` (la chip
   dans la phrase : `.composeur-badges` = l'aspect du `controle-form`, `.composeur-chip`, la croix, 44 px en
   tactile), `index.html` ; sentinelle Vitest : aller-retour au caractère, inconnu = texte, `esc()`, tables de
   positions, `lire` sur une vue simulée ; break-tests.
2. **Branchement dans les zones** : `grilles.js` — `monter` après chaque rendu du gabarit (les deux écrans),
   `insererRepereEnonce` et le `focusin` qui reconnaissent la vue ; sentinelle : le rendu porte la vue et le
   `<textarea>` caché avec ses attributs intacts ; une grille rechargée sans frappe : `critere.paliersProjection[].texte`,
   `.texteAide`, `critere.enonces.*` inchangés (break-test).
3. **Spec WebKit** : pose un badge au clic dans un palier, tape autour au clavier, efface un badge, quitte la
   zone, recharge : `{erreurs}` dans la grille ET la chip à l'écran. ⛔ 0 `page.click` à l'aveugle, 0 `waitForTimeout`.

**Puis** : rapport à Cowork, relecture croisée (règle 2), **porte terrain iPad** (skill `portes-terrain` : le
markdown ici, l'artefact par Cowork) — poser au doigt, taper autour, effacer un badge, quitter, recharger.
1.119 ne part avec D que si la porte est passée.

## Ce qui revient à Grégoire

Rien avant la porte iPad. À la porte : la croix (garder / retirer), et le glissé (§e).
