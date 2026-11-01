# Consigne – La palette Rétroaction laisse la place au texte (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 6 h 35 (Toronto, mesuré par `date`), sur `main` = `f302d833`.
> **Demande de Grégoire** (6 h 26) : optimiser l'espace de la palette Rétroaction, comme celui des autres palettes. **Ébauches validées à 6 h 35**, dans `plans de travail/`, à l'échelle 1 : 1 de l'iPad (1 px = 1 pt), mode sombre : `EBAUCHE-2026-11-01-palette-retroaction-aujourdhui.dc.html` (la référence), `EBAUCHE-2026-11-01-palette-retroaction-options-repliees.dc.html`, `EBAUCHE-2026-11-01-palette-retroaction-options-ouvertes.dc.html`. Maquettes de canevas : ignore `support.js` et `x-dc`, lis les styles en ligne.
> **Sa condition** (6 h 33, capture d'une première version) : « Générale », « Spécifique » et « Bilan » s'affichent **entièrement**, jamais coupés.
> **Ordre du groupe du 1er nov.** (décision de Cowork) : le dernier, après « la palette Évaluation en version compacte » (mêmes fichiers). Une seule session écrit à la fois.

## 0. Avant tout

- Commit de docs seul : cette consigne, les trois ébauches, et `VERDICT-RELECTURE-2026-11-01-palette-evaluation-compacte.md`.
- **Ajout de Cowork, 16 h 29, sur `main` = `225965ff`** : la zone de travail tient maintenant dans l'écran (partie C du lot de la barre d'outils). Hors plein écran, à 1180 × 820, le champ de rétroaction est à son plancher de 80 px ; il en a 441 en plein écran (mesuré par Claude Code). C'est la place que ce lot doit rendre au texte.

## 0 bis. La largeur des palettes d'Évaluer (décision de Cowork, `VERDICT-RELECTURE-2026-11-01-palette-evaluation-compacte.md`)

Le lot précédent a réduit la copie de 468 à 272 pt à l'ouverture, sur l'iPad (1180 pt). Le but de Grégoire pour cette série est l'inverse : le plus de place possible au canevas.

- **Paramètres revient à 200 pt d'ouverture**, comme tout l'automne.
- **Évaluation garde ses 316 pt**, et se pose contre la Rétroaction **réelle**, avec l'écart des autres palettes : plus de `right = '300px'` qui présume une Rétroaction de 280 (trouvaille 1 du rapport précédent).
- **La Rétroaction** prend la plus petite largeur où « Générale », « Spécifique » et « Bilan » tiennent entiers (au plus les 260 de l'ébauche) ; Évaluation se décale avec elle.
- **Mesure** : la largeur libre de la copie à l'ouverture, à 1180 × 820, avant et après ce lot ; écris-la au rapport. Attendu : 432 pt si la Rétroaction reste à 200, environ 372 à 260. Un essai la garde au-dessus de sa valeur d'avant.
- Une largeur déjà enregistrée par la poignée reste dans le stock, comme au lot précédent.

## 1. Ce qui existe (lu par Cowork)

- La sous-barre des vues et « Copier tout » : `equiperRetroaction` (`js/travaux-ui.js` vers 5346), radios `name="vueRetroaction"` qui appellent `basculerVueRetroaction`, bouton « Copier tout » (`copierToutRetroaction`). Le même appel ajoute « Copier » au pied (`.eval-retro-pied`, `copierRetroaction(1)`).
- Les options : `index.html` vers 8600, `.eval-options-retroaction` : cinq cases (`afficherDescription1`, `afficherObjectif1`, `afficherTache1`, `afficherAdresse1`, `afficherContexte1`) et deux radios (`affichageNoteComplet1`, `affichageNoteLettre1`), toutes `data-on-change="genererRetroaction"`, avec leurs `data-tooltip`.
- Le pied : l'avis de rétroaction réécrite (`#avisRetroactionReecrite`), le compte de mots (`#compteur-mots-retro`), « Régénérer ».
- La palette a déjà un seul défileur (`#travaux-palette-eval-retro`, `styles.css` vers 17794) : ne le défais pas.

## 2. Ce qui change (`EBAUCHE-…-options-repliees` et `…-options-ouvertes`)

1. **Les vues en une bande soudée**, sur toute la largeur de la palette : Générale | Spécifique | Bilan, la vue active marquée. Garde la sémantique des radios (mêmes `name`, même `basculerVueRetroaction`), habillées en segments. ⛔ **Aucun des trois mots n'est jamais coupé** : si la palette est trop étroite, la bande passe sur deux lignes ; ni ellipse ni débordement. Vérifie-le jusqu'à la largeur minimale de la palette.
2. **« Copier tout » descend au pied**, après « Copier ». Mêmes mots, même bulle (« Copier les 3 sections »).
3. **Le compte de mots** passe dans le coin bas droit de la zone de texte, sans jamais couvrir le texte (une marge sous le texte). L'avis de rétroaction réécrite reste au-dessus des boutons du pied.
4. **Les options, repliées par défaut**, sous la bande : une ligne qui les résume et qui s'ouvre au toucher (flèche qui pivote). Mots validés par Grégoire : **« Options : tout inclus · niveau de performance »** quand les cinq cases sont cochées ; quand il en manque, **« sans … »** avec leurs noms en minuscules (ex. « Options : sans contexte · note chiffrée »). La partie après « · » est le libellé de la radio choisie, en minuscules. Tout autre cas (aucune case cochée, par exemple) : propose les mots dans le rapport, Cowork les soumettra.
5. **Ouvertes**, les cinq cases deviennent des boutons à cocher (pastilles) et les deux radios une bande à deux segments. Garde les mêmes `input`, `id`, `data-on-change` et `data-tooltip` : rien ne change dans `genererRetroaction` ni dans ce qu'il écrit.
6. Le pli ouvert ou fermé vit en mémoire, comme les autres plis : fermé à chaque nouvelle ouverture de la palette. Pas de nouvelle préférence.
7. Les vues Spécifique et Bilan ne changent pas ; elles gagnent la même place.

## 3. Les tests

- Playwright `webkit`, 1180 × 820 : la bande change de vue ; aucun des trois libellés ne déborde (`scrollWidth <= clientWidth`) à 260 pt et à la largeur minimale de la palette ; les options sont repliées à l'ouverture ; décocher « Contexte » change le résumé (« sans contexte ») et régénère la rétroaction comme la case d'aujourd'hui ; « Copier tout » au pied copie les trois sections.
- **Mesure hors plein écran** (ajout de 16 h 29) : la hauteur du champ de rétroaction à 1180 × 820, hors plein écran et en plein écran, avant et après le lot ; écris les quatre nombres au rapport. Un essai la garde au-dessus de sa valeur d'avant, hors plein écran.
- Contre-épreuves (skill `verification-adverse`). Noms fictifs.

## 4. Fin

Commit, rapport `plans de travail/RAPPORT-2026-11-01-palette-retroaction-compacte.md` à Cowork pour relecture. **Pas de push.**

Gestes à vérifier sur l'iPad après la mise en ligne (porte terrain) :
- Générale, Spécifique, Bilan entiers, palette large et palette rétrécie.
- Toucher « Options » : les cases s'ouvrent ; décocher « Contexte » : le résumé dit « sans contexte » et le texte se régénère.
- Le texte de la rétroaction occupe la hauteur libérée ; mode clair et mode sombre.
