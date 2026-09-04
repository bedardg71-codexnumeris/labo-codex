# Consigne du jour — le lot 3 des trois types de grille, puis UNE publication pour les lots 2 et 3

> **Écrite le 4 septembre 2026 au soir, par Cowork, à la clôture de la séance, pour la séance suivante.**
> **Application au moment de l'écriture : `1.115.0`, build `0903-2103`.**
> ▣ **État mesuré à l'écriture** : `HEAD` = `37660b76` (le lot 2), **un commit devant
> `origin/main`** (`16dfc5eb`), 0 derrière — témoin : `git rev-list --left-right --count
> origin/main...HEAD` rend `0 1`. Arbre : quatre fichiers modifiés non commités, tous à Cowork
> (`CONSIGNE-DEMARRAGE-COWORK.md`, `OU-EN-EST-ON.md`, `SESSION.md` pour ton bloc de clôture, la
> consigne des lots). **Ils partent AVEC le commit du lot 3.**
>
> ⚠ **Si tu lis ceci plus de quelques heures après son écriture, remesure avant d'exécuter.**
> ⚠ **Tu as un état mesuré plus frais que celui-ci : ton propre bloc de clôture du 4 septembre
> dans `SESSION.md`. Il fait foi sur le mien.**

---

## Ce que cette consigne produit à l'écran, pour Grégoire

Il saisit **24 sur 30** sur un critère analytique, et **la rétroaction de cartouche attachée au
niveau où tombe 80 % apparaît**, sans qu'il ait choisi de niveau nulle part. Et le PDF de l'élève
liste ce critère avec son chiffre — **24 / 30** — et rien d'autre.

---

## 1 · Lis d'abord

1. `PROTOCOLE.md`, puis `OU-EN-EST-ON.md` (la ligne des trois types de grille est à jour).
2. **`plans de travail/CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md`** — les arrêtés,
   le hors-périmètre, **le lot 3**, et sous le lot 2 la **relecture croisée de Cowork** avec ses
   trois trouvailles. ⛔ **Sa ligne « N'ouvre pas ce lot avant que Grégoire ait vu le lot 2 à
   l'écran » est LEVÉE par la décision du 4 septembre** : il regarde les deux lots ensemble.
3. Ton bloc de clôture du 4 septembre dans `SESSION.md`.

---

## 2 · Le mandat : le lot 3, avec une exigence que le texte du 3 septembre ne portait pas

**Le lot 3 tel qu'écrit** : le pourcentage d'un critère analytique trouve son niveau par les
bornes de l'échelle **de la grille** ; ce niveau ouvre la cartouche (clé `critereId_niveau`).
Mesure d'abord les deux points de sa section « À mesurer avant d'écrire ».

**L'exigence ajoutée** (trouvaille 1 de la relecture du lot 2, mesurée le 4 septembre) :
**un critère analytique DOIT entrer dans `evaluation.criteres[]` en base**, comme les autres,
parce que seize fichiers lisent ce tableau et qu'aucun ne voit les points aujourd'hui — dont le
PDF de l'élève (`travaux-export-pdf.js:949`, qui rend `critereNom — niveauSelectionne`) et la
matrice de dépistage (`consolidation.js:118`).

⚠ **Et ici les deux règles se croisent — tranche-les ensemble, pas l'une contre l'autre :**
- Le niveau déduit **entre** dans `criteres[]` (c'est ce qui le rend visible au dépistage, à la
  synthèse, à la cartouche) ;
- mais **l'élève ne voit que le chiffre** (arrêté 4, et « ce qui ne doit pas bouger » du lot 3).
  ⮕ Le rendu du PDF **doit donc distinguer** un critère analytique : il imprime **« 24 / 30 »**,
  pas le niveau. C'est **dans** le périmètre (le chiffre) ; tout ce qui irait au-delà du chiffre
  dans le PDF est nommé hors périmètre. Mesure où `criteres[]` se construit à l'enregistrement
  (les quatre écrivains du lot 2 : `evaluation-sauvegarde.js`, `evaluation.js`, l'auto-save) et
  fais entrer le critère analytique **avec ses points ET son niveau déduit**, sous des noms qui
  disent ce qu'ils sont.
- **Les points restent dans `pointsAnalytiques`** (lot 2) : la source ne change pas de place, le
  tableau `criteres[]` en porte une **lecture**. Si tu vois mieux, dis-le avant d'écrire.

**Ce qui ne bouge pas** : un critère holistique ou algorithmique se calcule et s'enregistre
exactement comme avant ; les sentinelles du calcul passent **sans modification** ; la boucle de
`calculerNote` reste intouchée (le lot 2 y a mis un témoin de source).

**Trouvaille 2 du lot 2** (points bornés à la saisie, pas en base) : **pas dans ce lot.** Inscrite.

---

## 3 · L'ordre de la séance, et il ne se négocie pas

```
lot 3 commité (avec les fichiers de Cowork)
  → relecture croisée de Cowork (le lot touche le calcul et ce que l'élève lit)
  → corrections
  → coup d'œil de Grégoire sur les DEUX lots, une seule fois
      (le champ « sur 30 » est-il lisible et à sa place, Mac ET iPad ? · 24 → la cartouche s'ouvre · le PDF dit 24 / 30)
  → verdict au jeton (scripts/pousser.sh le rend sur le commit poussé)
  → release MINEURE : 1.116 — UNE entrée de changelog pour les deux lots, dont les mots sont à Grégoire
  → push
```

⛔ **Rien ne part avant son coup d'œil.** Le lot 2 est resté sur sa machine exprès : publier le
lot 2 seul mettait en ligne un PDF qui omet un critère que la note compte.

---

## 4 · Ce que tu rends à Cowork, pour la relecture

Le commit du lot 3, et **la liste des fichiers où `criteres[]` se construit et se lit** que tu as
mesurée, avec pour chacun : *le critère analytique y entre / y est lu / n'a pas à y être*. C'est la
carte dont la relecture a besoin ; sans elle, elle lit le patch seul, et le protocole dit pourquoi
ça ne suffit pas.

---

## 5 · Retouche décidée le 4 septembre 2026 au matin, après la relecture croisée du lot 3 (`b4039828`)

> Écrite par Cowork vers 6 h 10, sur l'arbre commité `b4039828` (deux commits devant `origin/main`).
> La relecture du lot 3 est dans la consigne des lots, sous le lot 3 : rien à corriger, une réserve
> inscrite (points sans niveau déductible), et la question ci-dessous, que Grégoire a tranchée.

**Ce que ça produit à l'écran** : dans le texte copié vers LÉA, la section « === BILAN === » nomme
un critère analytique par son chiffre — « Langue (24 / 30) » — et non plus par le nom du niveau
déduit (« Langue (Maîtrisé) »). Les critères holistiques et algorithmiques y restent nommés par
leur niveau, comme avant.

**a) Le bilan dit le chiffre — décision de Grégoire, 4 septembre au matin** : *« pas de niveau avec
la grille analytique : on passe au chiffre »*. C'est l'arrêté 4 appliqué au dernier endroit où le
niveau déduit atteignait encore l'élève. Sites : `_rendreDefisBilan` / `_rendreSignalesBilan`
(`js/evaluation-retroaction.js`), que ta carte a nommés. Même prédicat que les trois rendus du
lot 3 (`typeof points === 'number'`, ou les points de `evaluationEnCours.pointsAnalytiques` selon
ce que ces fonctions lisent — mesure-le, c'est toi qui as le fichier). ⚠ Mesure aussi si le bilan
est relu depuis `criteres[]` en base pour une copie rouverte : le chiffre doit y être identique.
Un cas dans la sentinelle lot 3 ; break-test.

**b) `.claude/settings.local.json` entre au `.gitignore`** — décidé par Cowork (technique) : c'est le
seul fichier VRAIMENT non suivi du dépôt, et il est propre au poste. Témoin de la mesure : les autres
« non suivis » que voyait Cowork (`Retours des testeurs/jean-françois/`, `docs/projet de
développement/SPEC-…`, le `.txt` de modèle) sont **suivis** sous leur nom NFC, et `ignorés/` est
couvert par `*ignorés*/` ; c'est le montage Linux qui rend les noms en NFD. Rien d'autre à faire
pour eux.

**Puis l'ordre de la séance reprend au §3** : coup d'œil de Grégoire sur les deux lots, verdict au
jeton, release 1.116, push. Commite cette retouche AVEC ce fichier.

---

## 6 · Seconde retouche, décidée le 4 septembre 2026 au matin, après le coup d'œil de Grégoire (`5b8bc6b0`)

> Écrite par Cowork vers 6 h 45. Grégoire a parcouru les deux lots à l'écran et a produit le PDF
> d'une copie évaluée avec sa grille « Analyse littéraire » (12 critères, tous analytiques).
> ▣ **Mesuré depuis Cowork avant d'écrire** : le PDF remis porte un SECOND bilan, distinct de celui
> du texte copié — `construireConcentration` (`js/synthese-retroaction-data.js:762`) et
> `construireForce` (l. 881, `libelleNiveau(echelle, …)`), rendus par
> `js/synthese-retroaction-rendu.js:643-648`. La retouche du §5 n'a touché que
> `evaluation-retroaction.js` ; celui-ci n'a pas bougé. Et la légende de l'échelle
> (`renderLegende`, `synthese-retroaction-rendu.js:328`) s'imprime depuis `ctx.feedback.scale`
> quel que soit le type des critères.

**Ce que ça produit à l'écran** : dans l'écran d'évaluation, un champ de points vide affiche « – »
et non plus « 0 » — un vrai zéro se tape. Et sur le PDF de l'élève, pour une grille dont les critères sont
analytiques, **plus aucun nom de niveau nulle part** — ni dans « Présentement, il faut se
concentrer sur » (« pertinent et clair (Sujet divisé Incomplet ou insuffisant) » devient
« pertinent et clair (Sujet divisé 1 / 2) »), ni dans « Acquis en développement, à consolider »
(« Sujet posé (2 / 3) »), ni dans « Ta force : Sujet amené (3 / 3) ») — et **la légende
« 0 Aucun · I · D · M · E » disparaît de l'en-tête « Rétroaction par critère » quand aucun critère
imprimé ne lit l'échelle**. Les critères holistiques et algorithmiques gardent leur niveau et
leur légende.

**C'est le lot 3 qui n'est pas fini, pas une trouvaille** (le test de `CLAUDE.md` : « est-ce que
je viens de l'écrire ? » — l'arrêté 4 s'appliquait à TOUT ce que l'élève lit, et deux sites ont
été manqués par ma consigne et par la carte). Corriger maintenant.

- **a)** Le bilan du PDF nomme un critère analytique par son chiffre, aux trois endroits (défis,
  acquis en développement, force). Même règle que `_lectureNiveauBilan` (§5) : `points` présent
  dans l'entrée de `criteres[]` → « 1 / 2 » ; sinon le libellé du niveau comme avant. Le poids
  vient de l'entrée enregistrée (`c.ponderation`), comme au repli du §5.
- **b)** La légende de l'échelle ne s'imprime que si au moins un critère rendu passe par la
  rangée de niveaux (`typeof critere.points !== 'number'`). Grille mixte : elle reste.
- **c)** Un cas par site dans la sentinelle lot 3 ; break-test. Le spec WebKit du lot 3 lit le PDF
  produit : ajoute-lui les deux assertions négatives (aucun libellé de niveau, aucune légende)
  sur une grille entièrement analytique — c'est le témoin que le §5 n'avait pas.

- **d) Le champ de points vide ne doit pas ressembler à un zéro** — trouvé par Grégoire à
  l'écran : *« je ne savais pas que le zéro prérempli était une absence de valeur »*. Sur un critère
  qui valait vraiment 0, il n'a rien tapé, le critère est resté sans points et la note n'a pas pu
  se calculer. ▣ Mesuré : `placeholder="0"` sur les deux gabarits du champ
  (`js/evaluation-chargement.js:1114` et `:1301`). Remplace le `placeholder` par « – » (tiret
  demi-cadratin) aux deux sites : le vide se lit comme un vide, et « 0 » redevient une valeur
  qu'on tape. Rien d'autre ne change (`min`, `max`, `step`, le handler). Un cas dans la sentinelle
  du lot 2 (le gabarit ne porte plus `placeholder="0"`), break-test. C'est le lot 2 qui n'était
  pas fini : symptôme vécu, note bloquée.

⚠ **Ce qui n'entre PAS dans cette retouche, et qui est cadré ailleurs** (consigne des lots, sous
le lot 3, « Ce que le coup d'œil a ouvert ») : l'espace vide à droite du chiffre dans la liste
des critères ; la cartouche qui exige une échelle pour une grille analytique ; le menu SOLO
sans « Aucun ». Les deux derniers attendent une décision de Grégoire.

**Puis l'ordre reprend** : relecture croisée de Cowork de cette retouche, verdict au jeton,
release 1.116, push. Commite cette retouche AVEC ce fichier.

---

## 7 · Troisième retouche — RÉGRESSION du lot 3, trouvée par Grégoire à l'écran le 4 septembre à 7 h 01 (`44559804`)

> Écrite par Cowork vers 7 h 05. **Symptôme vécu** : il a modifié sa grille « Analyse littéraire »
> (12 critères, tous analytiques), est revenu dans « Annoter et évaluer », et **son évaluation
> enregistrée ne s'est pas chargée** — bandeau rouge *« Impossible de charger l'évaluation : Timeout
> génération selects critères »* — **et le cadenas n'est pas apparu** dans la palette de gauche.
>
> ▣ **Cause mesurée depuis Cowork, une seule pour les deux symptômes** :
> `attendreSelectsCriteres` (`js/evaluation.js:1269-1296`) attend `#eval_<critereId>` du **premier**
> critère de `evaluation.criteres[]`, 30 fois 100 ms, puis rejette. Un critère analytique n'a pas
> ce select : son élément est `#eval_pts_<critereId>` (`evaluation-chargement.js:1113`, `:1300`).
> **Avant le lot 3, un critère analytique n'entrait jamais dans `criteres[]`** : le premier était
> toujours holistique ou algorithmique, et le select existait. Depuis le lot 3, sur une grille
> entièrement analytique, le premier critère est analytique → 3 s → rejet → le `catch` de
> `modifierEvaluation` (l. 1352) affiche le bandeau, et **les étapes 13-14 (indicateur et
> verrouillage, l. 1343) ne s'exécutent jamais** : c'est le cadenas absent. Deux symptômes, une
> cause. Le témoin : le spec du lot 3 rouvrait une copie sur une grille MIXTE dont le premier
> critère est holistique — il ne pouvait pas voir ça.

**Ce que ça produit à l'écran** : rouvrir une copie évaluée avec une grille entièrement
analytique charge l'évaluation, ses points, sa note, et montre le cadenas — comme pour toute
autre grille.

**À faire**
- **a)** `attendreSelectsCriteres` attend l'élément de saisie du premier critère **quel que soit
  son type** : `#eval_<id>` OU `#eval_pts_<id>`. Tranche toi-même la forme (un `querySelector`
  sur les deux identifiants, ou attendre que `#listeCriteresGrille1` porte un élément par
  critère de la grille — cette seconde forme couvre aussi un premier critère dont le type
  changerait demain). Le message du timeout cesse de dire « selects » s'il ne les attend plus seuls.
- **b)** Mesure si autre chose, sur le chemin de réouverture, suppose un `select` pour chaque
  entrée de `criteres[]` (`_chargerValeursEtAlgoModif`, l. 1625 et ce qu'elle appelle) — le même
  angle mort peut s'y répéter. Dis ce que tu as trouvé, corrige ce qui est dans ce chemin.
- **c)** Témoins : le spec WebKit du lot 3 sur la grille ENTIÈREMENT analytique **rouvre la copie
  enregistrée** et vérifie que les points sont revenus dans leurs champs, que la note est
  identique, et que l'indicateur de verrouillage est affiché ; un cas Vitest sur
  `attendreSelectsCriteres` avec un premier critère analytique (rouge avant, vert après) ;
  break-test.
- ⚠ Ce que tu ne fais PAS : toucher aux collecteurs ni au calcul. Rien dans les données.

**Décidé par Cowork** : c'est « corriger maintenant » — ça casse le parcours qu'on est en train
de livrer (rouvrir une copie), et ça part dans 1.116. Ce que Grégoire a changé dans sa grille
n'est pas la cause : la mesure suffit sans le savoir. Commite AVEC ce fichier.

**Puis** : relecture croisée de Cowork, verdict au jeton, release 1.116, push.

---

## 8 · La version 1.116 — relecture faite, mots arrêtés, ordre du §3 à reprendre au verdict

> Écrite par Cowork le 4 septembre 2026 vers 7 h 28, sur `f485ea34` (cinq commits devant
> `origin/main`, tous relus par Cowork : lot 3, deux retouches du PDF et du champ, régression de la
> réouverture). Grégoire a vu les deux lots à l'écran et a arrêté les mots du changelog (« ça va »).
> ⚠ **Quatre fichiers de cadrage de Cowork sont modifiés dans l'arbre** (`CONSIGNE-DEMARRAGE-COWORK.md`,
> `00-CADRAGES-OUVERTS.md`, les cadrages « collections » et « accordéons ») : **ils partent avec le
> commit de release**, comme la consigne. Ce sont des décisions de Grégoire prises ce matin ; les
> perdre serait perdre les décisions.

**Ce que ça produit à l'écran** : le bandeau de l'application passe à **1.116.0**, et la section
« Nouvelles » de l'accueil porte une seule entrée pour les lots 2 et 3.

**Ordre, celui du §3 :**
1. **Changelog** — une entrée en tête de `CHANGELOG` dans `js/changelog-data.js`, couleur `vert`,
   **au mot près** (les mots sont à Grégoire) :

```javascript
        {
            version: '1.116',
            couleur: 'vert',
            titre: 'Une grille analytique se note en points, et l\'élève ne lit que le chiffre',
            items: [
                '<strong>Un champ « sur 30 » à la place du menu de niveaux.</strong> Sur un critère analytique, tu tapes des points sur le poids du critère : 24 sur 30 fait 80 %. Le champ vide affiche « – » ; un vrai zéro se tape.',
                '<strong>Le chiffre trouve son niveau, et ta cartouche s\'ouvre.</strong> 24 sur 30 tombe dans un niveau de ton échelle, et la rétroaction que tu as attachée à ce niveau apparaît, sans que tu choisisses de niveau nulle part.',
                '<strong>L\'élève ne voit que le chiffre.</strong> Sur son PDF, dans le texte copié vers LÉA et dans le bilan, un critère analytique dit « 24 / 30 », jamais le niveau qui a servi à choisir le commentaire. Sur une grille entièrement analytique, la légende des niveaux disparaît du PDF.',
                '<strong>Le critère analytique compte partout.</strong> Il entre dans l\'évaluation enregistrée avec ses points, donc le dépistage, le profil de l\'élève et les archives le voient comme les autres.',
                '<strong>Rien ne change pour tes critères holistiques et algorithmiques</strong>, ni pour tes évaluations déjà enregistrées.'
            ]
        },
```

2. **Verdict au jeton** : `scripts/pousser.sh`, tel que le skill `release-et-changelog` et
   `fin-de-session` l'ordonnent — le verdict est le dernier geste avant le push, et il se prend
   sur le commit qui part. Si le verdict rougit, on s'arrête là et Cowork relit ; pas de
   correction « pour que ça passe ».
3. **Release MINEURE** : `node scripts/release.mjs minor` → 1.116.0, les quatre points de vérité
   et les jetons anti-cache par le script, jamais à la main. Témoin après coup :
   `grep -rl '1\.115\.0' --include=*.js --include=*.json --include=*.html .` rend 0.
4. **Push**, puis l'état mesuré dans `SESSION.md` (règle 4) : le commit poussé, le run GitHub, et
   la phrase « vérifié comment » pour `OU-EN-EST-ON.md` que Cowork reprendra.

⛔ Rien d'autre n'entre : le lot 4 (gabarit algorithmique, paliers d'une grille analytique, menu
SOLO) est cadré et attend une consigne à froid.
