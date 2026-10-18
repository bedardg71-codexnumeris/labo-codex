# Porte terrain – la dissection, version 1.204.0 (dimanche 18 octobre 2026, après-midi)

> Écrite par Claude Code le dimanche 18 octobre 2026 (étape 4 du plan, temps A), pour **cet après-midi**, avec le temps de corriger avant la rencontre de lundi 11 h. Elle remplace `PORTE-TERRAIN-2026-10-19-apporter-mon-materiel.md` (l'assistant en sept étapes, débranché).
> Une seule porte : le parcours de lundi, **sur tes vraies grilles** (ta grille Cornell, et la grille en réponses et points de ta collègue), sur le Mac (Safari) puis sur l'iPad. Seul ton matériel peut répondre : ce que Word et Pages mettent vraiment dans le presse-papiers, Safari, et l'iPad au doigt. Le reste est mesuré par les bancs (voir §4).
> **« Créer ma grille » écrit dans ton trimestre en cours** : une grille, et en niveaux une échelle, toutes NEUVES. Rien d'existant n'est modifié, et chacune se supprime dans son outil. Ce n'est pas irréversible : aucune sauvegarde préalable n'est exigée.
> Ce qui échoue devient un item de backlog, avec le numéro de la rangée. L'artefact jumeau (bouton « Copier mes résultats ») est publié par Cowork.

## §0 · Préalable

⚠ **Cette porte attend le push.** La version 1.204.0 est commitée (`fe641099`), pas poussée : le verdict et le push se font au temps B. Tant qu'elle n'est pas en ligne, tu verrais 1.203.0, et la porte jugerait l'assistant d'hier.

| N° | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre `https://app.codexnumeris.org` dans Safari, recharge en vidant le cache (⌘ ⇧ R). | La page se recharge. |
| 0.2 | Lis le numéro de version en bas de page. | **1.204.0** (build 1018-1024 ou plus récent). Sinon, arrête-toi ici : la version n'est pas encore en ligne. |
| 0.3 | Ouvre les Nouvelles. | En tête : « Apporter mon matériel », sept lignes, la première commence par « Tu colles ta grille, tu la vois telle que tu l’as écrite ». |

## §2 · Interface – le parcours de lundi

**Pourquoi.** Ce matin à 5 h 10, l'assistant en sept étapes t'a perdu : « Je ne sais pas où regarder, quoi lire et ce qui est attendu de moi. » La dissection le remplace : tu vois ta grille telle quelle, et c'est toi qui l'étiquettes. Les bancs collent un HTML de Word reconstitué ; seul ton matériel dit si tu t'y retrouves.

Sélectionne **le tableau en entier**, puis copie.

### A · Ta grille Cornell (Pages), sur le Mac

| N° | Geste | Attendu | À noter (champ) |
|---|---|---|---|
| 2.1 | Conception → « Apporter mon matériel » ; clique dans la zone, colle (⌘ V). | « Étiquette ta grille » : ta grille telle que tu l’as écrite, la palette à gauche, le bandeau « Touche une étiquette dans la palette : elle devient ton surligneur. » au-dessus. | Ce qui manque ou est de trop, par rapport à ton document |
| 2.2 | Sans rien toucher : regarde l'écran dix secondes. | Tu sais où regarder et quoi faire en premier. | Ce qui t'arrête, dans tes mots (aucune réponse n'est un échec) |
| 2.3 | Étiquette ta grille : critères, descripteurs, niveaux, au clic puis au glisser. | La lecture du bas se refait à chaque geste ; les morceaux sans place sont listés avec leur raison. | Un morceau que tu n'as pas su étiqueter, s'il y en a |
| 2.4 | Si l'écran demande « Le résultat d’une copie viendrait : », choisis « des niveaux ». Remplis « Ce que vaut chaque niveau » (plage et note retenue de chaque niveau). | Les champs sont vides au départ ; « Créer ma grille » s'active quand tout est rempli. | — |
| 2.5 | « Créer ma grille ». | « Ta grille « … » est créée », avec les cartes « Ta grille » et « Ses niveaux ». | Le nom de la grille créée |
| 2.6 | « La voir dans Grilles de critères », puis reviens et « Les voir dans Échelles de performance ». | Ta grille, puis son échelle, ouvertes et sélectionnées, avec tes niveaux. | Ce qui ne correspond pas à ton document |

### B · La grille de ta collègue (réponses et points), sur le Mac

| N° | Geste | Attendu | À noter (champ) |
|---|---|---|---|
| 2.7 | Colle-la ; étiquette critères, descripteurs et points. | La lecture dit « L’application y lirait une grille en points … jusqu’à un total de ‹N› ». | Le total lu, et celui de son document |
| 2.8 | « Créer ma grille ». | La carte « Ta grille » dit « ‹N› critères, sur ‹T› points. » | — |
| 2.9 | « La voir dans Grilles de critères ». | Ses critères et leurs réponses, avec leurs points, tels que dans son document. | Ce qui ne correspond pas à son document |

### C · Sur l'iPad

| N° | Geste | Attendu | À noter (champ) |
|---|---|---|---|
| 2.10 | Une de tes deux grilles : touche la zone, puis « Coller ». | La dissection s'ouvre ; la palette reste à côté de ta grille, iPad debout comme couché. | — |
| 2.11 | Étiquette au doigt : touche un morceau, puis glisse sur plusieurs. | Chaque toucher et chaque glissé surligne, sans viser ; hors d'une étiquette en main, la grille défile au doigt. | Un geste difficile au doigt, s'il y en a |
| 2.12 | « Créer ma grille », puis « La voir dans Grilles de critères ». | Comme sur le Mac. | — |

Si un collage affiche « Rien de lisible dans ce que tu as collé », note-le dans le champ de la rangée, avec l'application et l'appareil : c'est l'information la plus utile de la porte.

## §3 · Décisions

Aucune à cette porte. La rangée 2.2 est une mesure de ton ressenti, pas un verdict à poser.

## §4 · Ce que je n'ai pas pu vérifier

- **Le verdict Playwright complet** n'est pas pris au moment d'écrire cette porte : il se prend au temps B, sur le dernier commit. Les specs `materiel-*` ont tourné seules dans WebKit sur `4c16a4f0` (11 vertes, 0 rouge) ; Vitest complet est vert sur le commit de release `fe641099` (9 188 / 9 188).
- **Un vrai presse-papiers de Word ou de Pages, Safari, l'iPad au doigt** : rien de cela n'existe dans les bancs.
- **Retiré par Cowork (relecture de 11 h 50), parce que les bancs le mesurent déjà** (règle de tête du skill) : le nom déjà pris puis changé, l'affichage en points plutôt qu'en %, l'ordre des réponses. Ce que les bancs mesurent, en somme : la grille en points affichée en points (spec `materiel-dissection-2a`, C2), l'ordre des réponses (C1), le nom déjà pris puis changé (C3), la création en niveaux et son échelle (`materiel-dissection-2b`), la palette à gauche à 820 px (lot 1, C1), un collage piégé qui ne s'exécute pas (`materiel-dissection-1`).
- **Ton ressenti (2.2)** : aucune machine ne le mesure. C'est la raison d'être de cette porte après celle de 5 h 10.

## §5 · Reprise sur la 1.205.0 (« Couper »), ajoutée par Cowork le 18 oct. à 13 h 50

Relevé de 13 h 14 (sur 1.204.0) : 0.1 à 2.4 passées ; **2.5 en échec** sur la grille « Évaluation sur le symbolisme » (une même ligne porte le critère, ses points et ses cases à cocher). La 1.205.0 ajoute « Couper ». La reprise ne refait pas 2.1 à 2.4.

| N° | Geste | Attendu | À noter (champ) |
|---|---|---|---|
| 5.1 | Recharge en vidant le cache ; lis le numéro en bas de page, puis les Nouvelles. | **1.205.0** ; en tête des Nouvelles, « Couper un morceau ». Sinon, arrête-toi. | Version affichée |
| 5.2 | Mac : colle ta grille sur le symbolisme ; prends « Couper » et touche, dans une ligne, l'endroit entre le nom du critère et ses points. | Deux morceaux, à la même place ; la coupe tombe entre deux mots ; « Annuler la dernière coupe » recolle. | Une coupe qui n'est pas tombée où tu voulais |
| 5.3 | Coupe et étiquette tes lignes (Critère, Pondération, Élément observable), tes totaux en « Total » ou « À ignorer », puis « Créer ma grille ». | La grille se crée en points ; ou chaque raison qui reste nomme le critère en cause. | Les raisons qui restent, s'il y en a |
| 5.4 | Reprends 2.6 à 2.12 de la porte (la grille créée dans Grilles de critères, la grille de ta collègue, l'iPad). | Comme écrit plus haut. | Le numéro des rangées en échec |
| 5.5 | iPad : prends « Couper » et coupe un morceau au doigt. | La coupe tombe là où ton doigt touche, entre deux mots ; la grille ne défile pas pendant le geste. | Un geste difficile au doigt |

## §6 · Reprise sur la 1.206.0 (« Rattacher »), ajoutée par Cowork le 18 oct. à 17 h 23

Relevé de 16 h 43 (sur 1.205.0) : dans la case où le nom « Idées secondaires » s'écrit sur trois lignes, entrecoupées de cases à cocher, « (explications, procédés, » et « preuves) » deviennent des critères à part. La 1.206.0 ajoute « Rattacher ». Ce que les bancs mesurent déjà n'y est pas : le lien défait, les refus, l'étiquette retirée d'une suite, la marque qui suit l'étiquette de son morceau.

| N° | Geste | Attendu | À noter (champ) |
|---|---|---|---|
| 6.1 | Recharge en vidant le cache ; lis le numéro en bas de page, puis les Nouvelles. | **1.206.0** ; en tête des Nouvelles, « Rattacher un morceau ». Sinon, arrête-toi. | Version affichée |
| 6.2 | Mac : ta grille sur le symbolisme, coupée comme en 5.3 ; prends « Rattacher », touche « (explications, procédés, », puis « Idées secondaires ». | La ligne d'état lit « Idées secondaires (explications, procédés, » ; « (explications, procédés, » garde un trait en pointillé et « ↳ ». | Ce que la ligne d'état a lu |
| 6.3 | Refais le geste pour « preuves) », puis « Créer ma grille » et « La voir dans Grilles de critères ». | Avant même de créer, les deux lignes de ta capture de 17 h 24 (« des points ou des niveaux », « les points de 2 critères ») ne s'affichent plus. Puis un seul critère, « Idées secondaires (explications, procédés, preuves) », avec sa pondération. | Le nom du critère créé |
| 6.4 | Si tu travailles en mode sombre : « Rattacher » en main, regarde les flèches et les pointillés sur ta grille. | Lisibles. Sinon, passe cette rangée. | Ce qui se lit mal |
| 6.5 | iPad : au doigt, rattache « preuves) » à « Idées secondaires » (deux touchers sur des lignes courtes et voisines). | Chaque toucher prend le morceau visé, pas son voisin ; la grille ne défile pas pendant le geste. | Un toucher qui a pris le mauvais morceau |

