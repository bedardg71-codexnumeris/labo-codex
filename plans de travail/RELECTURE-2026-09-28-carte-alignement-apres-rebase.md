# Relecture croisée – carte d'alignement #963 à #966, après le rebase sur main

> Écrite le 28 septembre 2026, à 8 h 15 (Toronto), par Cowork. Répond à `DEMANDE-RELECTURE-2026-09-28-carte-alignement-963-a-966.md` (branche locale `carte-alignement-963-966`, tête `e03013fd`). Fichier non suivi sur `main`, nom distinct des deux relectures versées sur la branche : il ne bloque pas la fusion.

## Verdict : **vert** – fusion permise après R6 (texte accepté, ci-dessous) et le verdict WebKit complet

## 1 · Le rebase n'a rien changé au chantier – mesuré

- Les 13 fichiers `js/` et `tests/` que la branche touche : **mêmes fichiers** que `merge-base(df359bfe)..a4bb0570`, et **sha256 identiques** entre `a4bb0570` et `e03013fd`, fichier par fichier.
- **Aucun recouvrement** avec ce que `main` a changé depuis `df359bfe` (`df359bfe..185eba31`, js et tests) : le rebase ne peut pas avoir écrasé le lot E1.
- `index.html` : jetons, le paragraphe du principe et le bouton « Télécharger un modèle… » (#963), rien d'autre.

## 2 · R1 à R4 – rejoués par exécution, pas relus

Vitest sur un clone jetable de `e03013fd` (Linux, dépendances installées à part : le `node_modules` du Mac porte un rollup natif macOS). Les trois fichiers du chantier : 62 / 62 verts. Huit mutations, **toutes rouges** :

| Mutation | Essai qui rougit |
|---|---|
| R1 : `designation(inst)` → `designation(nd)` | #963 R1, le clone de semaine 6 |
| R1 : `instances = [nd]` | #963 R1, idem |
| R2 : passe préparatoire des objectifs neutralisée (une seule passe) | #964 R2 (B avant A) et #964 (c) |
| R3 (a) : les groupes « déjà cochés » retirés de l'Inspecteur | #964 R3 (a) |
| R4 : évaluation hors leçon non marquée inconclusive | #965 R4 |
| R4 : leçon sans semaine → « après » | #965, deux essais |
| R4 : même semaine, rang `<=` → `<` | #965, même séance autre leçon |
| R4 : semaines différentes toujours « avant » | #965, trois essais |

Non rejoué : R3 (b) et (c) ; le banc les garde selon la disposition, non contredit.

## 3 · R5 – jetons

`styles.css` `20260927k`, `planification-carte.js` et `planification-export.js` `20260927f` : **n'apparaissent dans aucun commit antérieur** (`git log --all -S` sur `index.html` : seul `975e4c6e`). Justes.
Précision : la lettre `e` n'avait été posée que par `a4bb0570`, une branche distante jamais fusionnée dans `main` ; « servie » est inexact, mais prendre `f` est prudent et sans coût. Rien à corriger.

## 4 · Renumérotation #967 → #974

Tenue partout : en-tête du BACKLOG (« Dernier ID utilisé : #974 »), `SUIVI-BUGS.md` (ligne 974, ancien numéro dit), demandes #963 et #964. #967 reste au lot E1.

## 5 · RELAIS.md

Le bloc de la carte dit l'état rebasé, rien de fusionné ni de publié. Juste.

## 6 · R6 – accepté par Grégoire le 28 sept., avec une retouche

`js/accompagnement-contenu-hover.js`, `planif-design-apprentissages` : remplacer la première phrase par, **mot pour mot** :

« Vérification : l'évaluation ferme la boucle – coche dans son Inspecteur les objectifs qu'elle vérifie, ceux de sa leçon ou d'une leçon placée avant elle. »

Tiret **demi-cadratin** (–), pas cadratin. La suite de l'infobulle (la visée) ne change pas. Jeton du fichier à monter.
Vérifié au code : l'Inspecteur propose exactement ces leçons (`leconsProposeesAEvaluation`), plus les objectifs déjà cochés d'une leçon déplacée, affichés pour être décochés. La phrase décrit l'écran ; elle n'est pas une consigne plus étroite que lui.

## 7 · La suite

R6 → les autres questions à Grégoire (liste « À Grégoire » de la relecture du 27, points 2 à 5), posées par Cowork une à la fois → une release `minor`, Nouvelles acceptées par Grégoire → verdict WebKit complet → fusion (avance rapide) → push. Pas de nouvelle relecture si R6 est posé mot pour mot.

## 8 · Les mots de la carte – réponses de Grégoire (28 sept.)

- **#964, les mots du § 5 de sa demande** (tracer vers une évaluation, Inspecteur, badge, glisser sur un objectif, refus) : **acceptés tels quels**, à 8 h 19.
- **#965, titre de la légende « Pastille de l'évaluation »** : **gardé**.
- **Guide, page 5 (« Ce que la leçon vise »)** : **deux retouches acceptées**, mot pour mot ; le reste de la page ne change pas.
  - Point 3 devient : « Dans l'Inspecteur d'une activité ou d'un exposé de cette leçon, coche les **objectifs servis** ; dans celui d'une évaluation, les **objectifs vérifiés**, ceux de sa leçon ou d'une leçon placée avant elle. C'est ainsi que tu vérifies qu'aucun objectif ne reste sans moyen. » (mêmes `<strong>` qu'aujourd'hui sur les termes en gras)
  - Point 4 : la dernière phrase « Le bloc doit être dans la même leçon que l'objectif. » devient « Une activité ou un exposé doit être dans la même leçon que l'objectif ; une évaluation, dans cette leçon ou une leçon placée après. »
- **Définition du terme « Leçon »** (`accompagnement-contenu-terme.js`) : **inchangée**, elle reste juste.
- **#965, quand l'application ne peut pas trancher** (une leçon sans semaine, ou l'évaluation, ou le bloc qui sert l'objectif, hors de toute leçon – les trois `inconclusif = true`) : **une pastille distincte**, décision didactique de Grégoire, qui remplace le ✓ par défaut. Texte accepté, mot pour mot : « ? – Impossible de dire si chaque objectif a été enseigné avant : une leçon n'a pas encore de semaine, ou l'évaluation n'est dans aucune leçon. »
  - Tranché par Cowork (technique) : ✕ puis ⚠ l'emportent sur « ? » ; « ? » l'emporte sur ✓. Un 5e état dans `LEGENDE_PASTILLES_EVALUATION` (la légende de l'Inspecteur et la page du guide qui l'affichent le suivent seules, à vérifier). Couleur : un gris des jetons existants de la carte, contraste AA ; Grégoire jugera les couleurs à l'écran à la porte terrain (question 5, non bloquante).
  - Preuves : un essai par cas incertain (leçon sans semaine, évaluation hors leçon, bloc hors leçon) → « ? » ; « ? » + ⚠ → ⚠ ; « ? » + ✕ → ✕ ; tout « avant » sans incertitude → ✓. Mutations rouges : « ? » rendu ✓ ; « ? » qui l'emporte sur ⚠.
  - Nouvelle relecture de Cowork : **légère**, sur ce seul ajout (diff + mutations), avant la release.

## 9 · Ordre qui suit

Pastille « ? » et page 5 (§ 8) → Vitest → relecture légère de Cowork → release `minor` unique pour #963 à #966, **Nouvelles à faire accepter par Grégoire** → verdict WebKit complet → fusion (avance rapide) → push → porte terrain (dont les couleurs des pastilles).

## 10 · Demande de Grégoire (28 sept.) : la référence Gauthier, Bissonnette et Richard renvoie à l'édition québécoise

Grégoire veut l'édition **ERPI** (Montréal, 2013, collection Éducation, 344 p., ISBN 978-2-7613-5506-3), pas De Boeck ni Gaëtan Morin. Sous-titre vérifié sur la notice de l'ISBN (ERPI, Google Books) : « la gestion des apprentissages ».

Texte unique, partout où la référence s'affiche (format APA des autres références ; collection, pages et ISBN non repris, tranché par Cowork) :

« Gauthier, C., Bissonnette, S. et Richard, M. (avec la collaboration de M. Castonguay) (2013). *Enseignement explicite et réussite des élèves : la gestion des apprentissages*. ERPI. »

Trois endroits, **sur la branche `carte-alignement-963-966`** (elle avancera `main` en avance rapide ; ne rien modifier de suivi sur `main`) :
- `js/planification-carte.js` ~l. 1885 (guide de la carte) : « De Boeck » → la référence ci-dessus, et `tests/unit/sentinelle-guide-carte-966.test.js` l. 64 qui la cite ;
- `index.html` ~l. 14218 : « Gaëtan Morin Éditeur » → la même référence ;
- `plans de travail/CARTE-ALIGNEMENT-2026-09-27-4-le-guide-dit-ce-que-fait-la-carte.md` l. 35 : la même, avec une note « édition ERPI retenue par Grégoire le 28 sept. ».
Puis `git grep -i "De Boeck\|Gaëtan Morin"` : plus aucune occurrence pour cet ouvrage. À inclure dans la courte demande de relecture de l'ajout du § 8.

## 11 · Relecture légère de l'ajout (43bfa9a5, b1f8fffc) – 10 h 02

**Verdict : vert après deux retouches (R7, R8), sans nouvelle relecture si elles sont posées comme dit.**

- Logique relue : `position` rend 'inconnu' dans les trois cas ; un objectif est « avant » dès qu'un bloc le sert sûrement avant, sinon « incertain » s'il reste un bloc non situable, sinon « après » ; préséance par `GRAVITE`. Conforme au § 8.
- Mutations rejouées sur un clone jetable (39 essais des deux fichiers, verts) : « ? » rendu ✓ → **rouge** (4 essais) ; « ? » qui l'emporte sur ⚠ → **rouge**. Une troisième **survit** : voir R8.
- Page 5 : les deux phrases, mot pour mot (apostrophes courbes gardées, tranché par Cowork). Référence ERPI : identique aux deux endroits affichés (`planification-carte.js` l. 1893, `index.html` l. 14218), espace insécable du guide gardé.
- Couleur : `--gris-moyen`, 6,5:1 sur le fond sombre par défaut, 5,6:1 en mode clair (mesuré). Grégoire juge à l'écran.
- Le cas « bloc hors de toute leçon » ne rend jamais « ? » (le bloc ne sert rien) : juste, et le texte ne le nomme pas.

**R7 – le texte de « ? », élargi, accepté par Grégoire le 28 sept. (10 h 02)** : il nomme aussi la séance non posée. Remplacer le libellé de l'état `incertain`, mot pour mot :
« Impossible de dire si chaque objectif a été enseigné avant : une leçon n'a pas encore sa semaine ou sa séance, ou l'évaluation n'est dans aucune leçon. »
(Mêmes apostrophes que les autres libellés du tableau.) L'essai qui cite le texte le suit.

**R8 – un essai manque** : un objectif servi par un bloc **sûrement avant** ET par un bloc **non situable** doit donner ✓, pas « ? ». Mutation qui survit aujourd'hui : tester `'inconnu'` avant `'avant'` dans `etatObjectif`. ⮕ Essai, puis cette mutation → rouge.

Ensuite : release `minor` unique (#963 à #966), **Nouvelles à faire accepter par Grégoire** (propose-les-lui par Cowork, dans ta réponse) → verdict WebKit complet → fusion → push.

## 12 · Nouvelles de 1.165.0 – acceptées par Grégoire le 28 sept. (10 h 09)

- **Titre de l'entrée : « Carte d'alignement »** (au lieu de « Objectifs vérifiés », proposé par Cowork et accepté).
- **Les quatre phrases proposées par Claude Code (commit a133389c) : acceptées telles quelles, mot pour mot.**

Ensuite : release réelle (`scripts/release.mjs`, minor), Vitest, verdict WebKit complet, fusion dans `main` en avance rapide (retirer d'abord de `main` la copie non suivie de `RELECTURE-2026-09-27-carte-alignement-963-a-966.md` qui bloquerait), push par `scripts/pousser.sh`, puis la porte terrain (dont les couleurs des cinq pastilles), que Cowork publiera en artefact. Ce fichier-ci, non suivi, ne bloque pas la fusion.
