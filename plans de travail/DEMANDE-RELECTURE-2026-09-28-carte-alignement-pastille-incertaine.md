# Demande de relecture légère – carte d'alignement : la pastille « ? » et la page 5 du guide

> Écrite le 28 septembre 2026 par Claude Code, pour Cowork. Ton § 8 de `RELECTURE-2026-09-28-carte-alignement-apres-rebase.md`. Branche locale `carte-alignement-963-966`, un seul commit à relire : **`43bfa9a5`** (sur `43977338`, R6). `git show 43bfa9a5` suffit.

## Ce qui est posé

- **Pastille « ? »** (`js/planification-carte.js`) : état `incertain`, symbole `?`, texte mot pour mot (le « ? – » du texte accepté est la pastille suivie de son libellé, comme les quatre autres états dans la consigne #965). Préséance : ✕, ⚠, ?, ✓. `position()` rend `'inconnu'` là où elle rendait `'avant'` avec `inconclusif` ; un objectif est `incertain` quand aucun bloc ne le sert sûrement avant et qu'au moins un ne peut pas être situé. Le drapeau `inconclusif` garde son sens.
- **Légende** : cinq états, « ? » entre ⚠ et ✓ ; l'Inspecteur et la page 8 du guide la suivent seules (vérifié : banc navigateur de chacun).
- **Couleur** : `--gris-moyen` (5,7:1 sur blanc en mode clair), trait plein pour ne pas se confondre avec le « ! » en pointillé. Proposition ; Grégoire juge à l'écran.
- **Page 5** : points 3 et 4 mot pour mot, `<strong>` sur « Inspecteur », « objectifs servis », « objectifs vérifiés ». **Apostrophes typographiques (’)**, celles de toute la page, là où ton texte a des apostrophes droites : même mots, pas mêmes octets. Dis-moi si tu veux les droites.

## Preuves

- Vitest **649 fichiers, 7 582 / 7 582** ; WebKit, bancs `planif-*`, **27 / 27**.
- Essais de « ? » : leçon (du bloc) sans semaine, leçon de l'évaluation sans semaine, séance non posée, évaluation hors leçon → « ? » ; « ? » + ⚠ → ⚠ et « ? » + ✕ → ✕, dans les deux ordres ; « ? » + ✓ → « ? » ; tout « avant » sans incertitude → ✓ ; texte, symbole et classe ; légende à cinq. Au navigateur : l'état « ? » ajouté au parcours des états de la pastille, et la page 8 du guide à cinq pastilles.
- Page 5 : les deux phrases, une fois chacune ; l'ancienne absente ; **en remettant les deux anciennes phrases, on retrouve l'empreinte d'avant le lot** (`8fe3a8e048b00535`) : rien d'autre n'a bougé.
- **Mutations, rouges** : « ? » rendu ✓ (six essais rougissent) ; « ? » qui l'emporte sur ⚠ (un essai).
- Jetons : `planification-carte.js` `20260927g`, `styles.css` `20260927l` (lettres jamais servies).

## Un écart avec ton § 8, à trancher

**« Le bloc qui sert l'objectif, hors de toute leçon » ne peut pas arriver** : `objectifsServisPar` rend `[]` pour un bloc sans leçon parente (un bloc sert les objectifs de SA leçon). Un tel bloc ne rend rien incertain ; l'objectif qu'il croyait servir reste ✕ s'il est seul. Écrit en essai sous cette forme. La branche `!leconBloc` de `position()` reste, sans effet (issue 3).
**Et un quatrième cas incertain existe** : même semaine, **séance non posée** (déjà marqué `inconclusif` au lot, R4). Il donne « ? » lui aussi. Le texte accepté (« une leçon n'a pas encore de semaine, ou l'évaluation n'est dans aucune leçon ») ne le nomme pas : c'est à Grégoire de dire si le texte doit le couvrir. Je ne l'ai pas touché.

## § 10 – la référence Gauthier, Bissonnette et Richard, édition ERPI

Commit à relire aussi : **la tête de la branche**, qui ajoute ce paragraphe (`git show carte-alignement-963-966`). Texte unique, repris de ton § 10 :
« Gauthier, C., Bissonnette, S. et Richard, M. (avec la collaboration de M. Castonguay) (2013). *Enseignement explicite et réussite des élèves : la gestion des apprentissages*. ERPI. »

| Endroit | Avant | Forme posée |
|---|---|---|
| `js/planification-carte.js` l. 1893 (guide, page 1) | … De Boeck. | titre en `<em>`, espace insécable avant le deux-points (celle qu'y portait déjà la page) |
| `tests/unit/sentinelle-guide-carte-966.test.js` l. 64 | … De Boeck. | la même, en texte normalisé |
| `index.html` l. 14218 (références de l'accompagnement) | … *La gestion des apprentissages*. Gaëtan Morin Éditeur. | titre en `<em>` ; « la » en minuscule, comme ton texte |
| `plans de travail/CARTE-ALIGNEMENT-2026-09-27-4-…md` l. 35 | … De Boeck. | la même, titre en italique, et la note « *(Édition ERPI retenue par Grégoire le 28 sept. 2026.)* » |

`git grep -i "De Boeck\|Gaëtan Morin"` : **plus aucune occurrence pour cet ouvrage**. Il en reste deux, d'**autres** ouvrages, laissées telles quelles : `index.html` l. 14216 (Gauthier et Bissonnette, 2023, *Enseignement explicite et données probantes*) et l. 14220 (Gauthier et Tardif, 2017, *La pédagogie*). Hors de l'application, `Plan Accompagnement/PLAN_guides_pedagogiques.md` l. 336 citait déjà l'édition ERPI (autre format, avec collection et pages) : non touché.
Jeton : `planification-carte.js` `20260927h`. Vitest **7 582 / 7 582** ; WebKit, banc du guide, vert.

## R7 et R8 (§ 11) – posés, `9e216c8f`

- **R7** : le libellé de « ? », mot pour mot ; les quatre bancs qui le citent suivent.
- **R8** : essai « servi sûrement avant ET par un bloc non situable → ✓ ». Le cas suppose deux leçons portant le même objectif (des clones, qui partagent leurs métadonnées) : c'est ainsi que l'essai le construit. **Mutation `'inconnu'` testé avant `'avant'` : rouge.**
- Jeton `planification-carte.js` `20260927i`. Vitest **649 fichiers, 7 583 / 7 583** ; WebKit, pastille et guide, verts.

## La release, préparée

- **1.165.0, `minor`, une seule pour #963 à #966.** Prévisualisée (`node scripts/release.mjs minor --dry-run`) : build `0928-…`, 15 jetons montés — les fichiers de la carte, **et ceux du lot E1** : le script bumpe tout ce qui a changé depuis l'avant-dernière release (comportement écrit et voulu, `release.mjs` l. 226-241). Effet : un rechargement de ces fichiers, rien d'autre.
- **Pas encore lancée** : les Nouvelles vivent dans `js/changelog-data.js`, dont la release monte le jeton ; un mot changé après coup obligerait à refaire le jeton. Le bump se fait dès l'accord de Grégoire.

### Nouvelles proposées – à soumettre à Grégoire

Titre de l'entrée : **« Objectifs vérifiés »** (le nom de la rubrique neuve de l'Inspecteur).

1. « Carte d'alignement : Actions ▸ « Télécharger un modèle… » produit un fichier à coller dans l'IA de ton choix, pour faire relire ta carte. Rien n'est modifié dans ta carte. Le principe « Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence. » s'affiche sous le titre. » *(proposée par le lot #963, reprise telle quelle)*
2. « Une évaluation se relie désormais à ses objectifs : dans son Inspecteur, coche ceux qu'elle vérifie, dans sa leçon ou dans une leçon placée avant elle. Ses badges et ceux de tes objectifs suivent ces cases. Les liens « se vérifie par » déjà tracés restent en place et comptent comme avant. » *(#964)*
3. « Chaque évaluation porte une pastille qui dit si ce qu'elle vérifie a été enseigné avant elle : ✓ oui, ⚠ seulement après, ✕ jamais, ? impossible de le dire, ! aucun objectif coché. » *(#965)*
4. « Le guide de la carte décrit ces nouveautés. » *(#966)*

## Pas fait

Pas de bump de version (en attente des Nouvelles), pas de push.
