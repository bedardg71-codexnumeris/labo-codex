# Consigne du jour — le texte troué, ÉTAPE 1 : les quatre énoncés de rétroaction

> **Écrite le 3 septembre 2026 à 12 h (heure de Grégoire), par Cowork, avec lui.**
> **Application au moment de l'écriture : `1.113.0`, build `0903-0906`.**
> Elle remplace la consigne de l'audit, exécutée (`5887532e`, commité non poussé).
>
> ▣ **État à l'écriture, mesuré** : `HEAD` = `5887532e`,
> `git rev-list --count origin/main..HEAD` rend **1** (le lot d'audit, non poussé) — témoin,
> `HEAD..origin/main` rend **0**. Arbre propre sauf `OU-EN-EST-ON.md` et `PROTOCOLE.md`, à
> Cowork : **ne les commite pas.**
>
> ⚠ **Le lot d'audit attend son push.** Si tu le trouves encore non poussé, **dis-le et
> demande** avant d'empiler dessus.
>
> **Source** : `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`. **Lis-le d'abord** :
> il porte le pourquoi, la distinction des deux familles de variables, et ce qui est arrêté.
> Cette consigne n'en exécute que **la première étape**.

---

## ⛔ LE DÉCOUPAGE, ET C'EST LUI QUI DÉFINIT LE LOT

**Décision de Grégoire, 3 septembre : on découpe, étape par étape.**

Le cadrage compte `2 × N paliers + 4` champs de texte à convertir — **douze** avec quatre
paliers. ⛔ **Ce lot n'en fait QUE QUATRE** : les quatre énoncés du **bloc 3**
(`rendreBlocEnoncesAlgo`, `js/grilles.js:3456`).

⮕ **Motif** : c'est ce que le cadrage appelle « la vraie prise ». Aujourd'hui l'enseignant
choisit entre deux formulations toutes faites — « Générique » et « Français écrit » — et s'il
n'est ni l'un ni l'autre, **il prend la moins fausse**. C'est aussi le seul des trois blocs qui
produit **ce que l'élève lit**.

⛔ **HORS DU LOT, et n'y touche pas** : les paliers de projection (bloc 2), le modèle de formule
(bloc 1 — il ne contient aucun texte, **il n'y a rien à trouer**), les badges personnalisés
(version ultérieure, arrêté par Grégoire).

---

## ▣ LA PALETTE N'EST PAS À INVENTER — ELLE EST DÉJÀ DANS LE CODE

⚠⚠ **CORRECTION DU CADRAGE, mesurée le 3 septembre.** Le cadrage proposait dix badges. **Le
bloc 3 n'en connaît pas dix.** `grep -n "^var JETON_" js/evaluation-enonces.js` rend **cinq**
déclarations :

| jeton | ce qu'il vaut | badge ? |
|---|---|---|
| `{critere}` | le nom du critère, tel qu'il est dans la grille | **oui** |
| `{erreurs}` | le nombre d'erreurs | **oui** |
| `{mots}` | le nombre de mots | **oui** |
| `{points}` | la mention pondérée, avec son espace de tête, ou vide | **oui** |
| `{s}` | « s » quand `{erreurs}` est au pluriel, vide sinon | ⛔ **NON** |

⛔ **`{s}` n'est PAS un badge.** C'est un accord grammatical qui suit `{erreurs}`, et le module
le documente ainsi : *« un texte qui ne porte pas `{erreurs}` ne porte pas `{s}` non plus »*
(`js/evaluation-enonces.js:349`). ⮕ **Il ne s'offre pas à la pose.** S'il doit apparaître, c'est
comme conséquence de `{erreurs}`, jamais comme geste de l'enseignant.
⚠ **Remesure cette liste** avant de coder : elle est le contrat du lot.

---

## ↻ LA RÈGLE ARRÊTÉE PAR GRÉGOIRE — un champ n'offre que ce qui peut y valoir

**Chaque champ n'offre que les badges qui peuvent valoir quelque chose dedans.**

▣ **Le cas qui l'a fait trancher** : « Aucune annotation » s'affiche *« quand la copie ne porte
ni tampon ni erreur »* (`js/evaluation-enonces.js:173`). Y offrir `{erreurs}` proposerait de
composer une phrase avec un nombre qui vaudra **toujours zéro**.

⮕ **C'est la même logique que tout ce qui a été livré depuis hier** : un écran n'annonce pas ce
qui n'aura pas lieu. Un badge offert là où il ne peut rien valoir est un piège.

⚠ **La correspondance champ → badges n'est PAS décidée.** Les quatre clés sont `decompte`,
`priorite`, `concentre`, `aucune` (`js/evaluation-enonces.js:170-173`).
⮕ **MESURE-LA** : lis ce que chaque énoncé reçoit réellement à l'appel, et **propose la table à
Grégoire dans ton rapport**. ⛔ **Ne la devine pas, et ne l'implante pas avant qu'il l'ait vue**
si tu as le moindre doute sur une case.

---

## Ce que le geste doit être

▣ **Le motif d'origine, dans les mots de Grégoire** : *« La page du critère algorithmique est
vraiment très complexe, et je crains que cette complexité ne fasse fuir les utilisateurs. Elle
est très codage entre guillemets. »* Son modèle : **la cellule de formule dans Numbers**, où les
variables sont des pastilles qu'on manipule, pas du texte à taper.

▣ **La preuve que ça règle une vraie erreur, et elle est de lui** : le 2 septembre, il a tapé
`[service]` au lieu de `{service}`. Le texte avait l'air juste à l'écran, **et son élève aurait
lu le crochet**. ⮕ **Un badge ne se tape pas, il se pose. Cette classe d'erreur disparaît.**

⛔ **LE CLIC EST LE CHEMIN PRINCIPAL**, pas le glissé. ▣ **Motif, arrêté au cadrage** : Grégoire
travaille sur iPad, et le glisser-déposer au doigt n'est pas celui de la souris. **Un clic sur
le badge l'insère au curseur.** Le glissé, s'il existe, est un confort — jamais le seul chemin.

⚠ **Le champ reste éditable à la main.** Quelqu'un qui tape `{erreurs}` au clavier doit
continuer d'obtenir le même résultat. **On ajoute un chemin, on n'en ferme aucun.**

---

## ⛔ CE QUI NE DOIT PAS BOUGER — trois garde-fous

**1. Les textes déjà écrits continuent de fonctionner, tels quels.** Les grilles existantes
portent des phrases avec ou sans jetons. ▣ *Tarir n'est pas réparer* — et ici **il n'y a même
rien à tarir** : le format du gabarit ne change pas. ⛔ **Ce lot ne touche AUCUNE donnée
enregistrée.** `critere.enonces` reste `{cle: texte}`, du texte libre.

**2. Le rendu final ne change pas d'un caractère.** `engendrer...` continue de produire les
mêmes phrases pour les mêmes gabarits. ▣ **Témoin exigé** : la sentinelle existante des énoncés
passe **sans être modifiée**. Si tu dois la toucher, tu as changé le comportement — **arrête-toi
et dis-le.**

**3. La règle du jeton sans valeur existe déjà, et elle est fine.** *« Un jeton que l'appel ne
fournit pas est retiré du texte, jamais rendu littéralement : un élève ne doit pas lire
`{critere}` sur son PDF »* (`js/evaluation-enonces.js:44`). ⛔ **Réutilise-la. Ne la réinvente
pas.**

---

## Ce qui remplace la petite note du bas

Le bloc porte aujourd'hui, sous les quatre champs, une phrase qui EXPLIQUE les jetons :
*« Écris {critere} là où le nom de ce critère doit apparaître, {erreurs} pour le nombre
d'erreurs et {mots} pour le nombre de mots. »* (`js/grilles.js:3501-3506`).

⮕ **Si les badges se posent, cette phrase n'a plus à apprendre une syntaxe.** Ce qui doit
survivre, en revanche, et que la note dit déjà : *« Un repère que la phrase n'a pas à remplir
disparaît proprement. Une zone laissée VIDE fait taire l'énoncé. »*
⚠ **Ces deux comportements sont invisibles autrement. Ne les perds pas en retirant la note.**

---

## Fini quand

**Un enseignant compose la phrase que ses élèves liront sans jamais taper une accolade.**

▣ **Le témoin** : dans le bloc « Modèle de rétroaction » d'un critère algorithmique, chacun des
quatre champs porte ses badges posables, et un clic sur un badge l'insère au curseur.
▣ **Le témoin négatif, qui compte autant** : une grille existante ouverte après ce lot affiche
**exactement les mêmes textes qu'avant**, et le PDF engendré est identique au caractère près.
▣ **Le témoin du piège évité** : le champ « Aucune annotation » n'offre pas de badge qui vaudrait
toujours zéro.

---

## L'ordre

1. **Rapporte le verdict de GitHub sur `1.113.0`** (rituel d'ouverture, §2.1), et **dis où en
   est le lot d'audit `5887532e`** — commité, poussé ?
2. **Lis le cadrage** avant de coder.
3. **Mesure la correspondance champ → badges**, et rends-la en tableau **avant** de l'implanter.
4. Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
5. `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que
   c'est prêt.** ⚠ Vitest se lance **depuis `tests/`**.
6. ⛔ **Tu commites, puis tu t'arrêtes.** Pas de release, pas de push, pas de verdict au jeton :
   Grégoire regarde l'écran d'abord. ▣ **Ce lot touche ce que ses élèves lisent** — son coup
   d'œil n'est pas une formalité ici.
7. **Ce fichier se commite avec ton lot.** Nomme tes fichiers ; pas de `git add -A`.

⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR** : Conception › une grille avec un critère
**algorithmique** › le bloc « Modèle de rétroaction ». Il doit pouvoir **cliquer un badge et le
voir apparaître dans la phrase**, sans rien taper. ⚠ **Et vérifier que ses propres textes sont
intacts.**
