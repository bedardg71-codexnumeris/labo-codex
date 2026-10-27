# Demande de relecture – Les calculs, lot 4c : un calcul pour tes phrases et tes tables (dernier lot de l'étape 4)

> Claude Code, mardi 27 octobre 2026, sur `main` (codé par une session, clos par une seconde : § 4). Commits : `fdd705b2` (les deux retouches du verdict de 4b, avec ce verdict et la consigne de 4c), puis le lot et cette demande. Rien de poussé. Consigne : `CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4c.md`. Vitest 9 919 tests verts (830 fichiers) ; Playwright WebKit : la spec du lot (10 essais, dont les captures) et 48 specs voisines, 208 réussis, 9 sautés (captures sur demande), 2 instables hors du lot (§ 4). Le verdict complet de la suite n'est pas pris (au signal de Grégoire, avec le push).

## 0. Les deux retouches du verdict de 4b (`fdd705b2`)

1. **La réparation de #1142 passe le compte brut** (`js/comptes-erreurs-stock.js`) : `calculer(critere, entree, compte, mots)`, le compte brut étant la valeur relue (la phrase, les codes). Essai neuf dans `comptes-erreurs-stock-1142.spec.js` : un calcul composé « Pondération − Compte × 2 » sur des codes qui pèsent 2 ; l'évaluation avait le compte pondéré 2 et le brut 1 (90 %). La réparation écrit le même pourcentage, la même note et la somme pondérée 2. Break-test : sans `compte`, la somme pondérée disparaît (la réparation retombe sur la lecture brute).
2. **Les copies de référence d'un calcul qui ne baisse pas** (`js/miroir-algo.js`). La règle ne vaut que pour un **calcul composé** : les trois tout faits gardent la règle d'hier, à l'octet. Un réglage de 0 point par erreur ne baisse pas non plus, et n'a qu'« Aucune » depuis toujours ; la mesure le distinguait, d'où cette garde. « Ne baisse pas » se mesure sur les comptes 0, 1, 2, 4… jusqu'à la borne de la recherche (100 000) : vrai dès qu'un compte donne moins qu'un compte plus petit.
   - **Les nombres choisis** : avec une limite fixée, « Quelques » = la tolérance et « Beaucoup » = quatre fois la tolérance ; sans limite, 2 et 8. C'est le rapport d'un à quatre de la règle d'hier (« Quelques » est le quart de « Beaucoup »). Une tolérance de 0 est lue à 1 par la projection (son minimum), d'où 1 et 4.
   - Banc R (`calculs-4c-phrases.test.js`) : la règle d'hier recopiée comme témoin, sur plus de cent réglages des trois tout faits, avec et sans limite ; « Compte × 5 » donnait hier 0 et 1 (« Quelques » disparaissait), il donne 0, 2 et 8. Deux break-tests.
3. **En passant** : la sentinelle anticache était rouge sur HEAD. #1174 avait mis `?v=20261027a` à `travaux-stockage.js` et `liste-evaluations.js` alors que le build est du 26. Je les ai ramenés à `20261026a`, sans quoi le hook pré-push bloquait. Issue : corrigé, parce que ça bloquait le push de tout le monde.

## 1. Ce qui a été fait

- **Le registre** (`js/evaluation-formules.js`) reste la seule source.
  - `sert` admet `'phrases'` (`SERTS`), à côté de `'note'`. Mêmes identifiants, même compteur et mêmes bornes : 10 calculs en tout par critère.
  - Fonctions neuves : `calculsPourLaNote`, `calculsPourLesPhrases`, `valeurCalcul`, `valeursCalculs`, `jetonsDesCalculs`, `direValeur`, `donneesDeLaPhrase`, `calculLu`, `refusDuRetrait`.
  - **La valeur** sort de l'évaluateur de 4a, **sans aucune borne**. Elle est dite par `_nb`, comme la ligne du calcul : `formaterNombre` (virgule, deux décimales au plus) avec le signe moins typographique (« −10 »).
  - Choix « vaut 0 » : `calcul`, `aucune` (« Sans valeur ») et `zero` (« La valeur 0 »). « La note entière » est illisible pour un calcul des phrases : écartée à la lecture, refusée au partage.
  - Un calcul des phrases ne donne jamais la note : `perso:` vers lui est introuvable, et `choisirCalculCompose` le refuse.
  - `garderCalcul` porte `sert`. Pour les phrases, il n'écrit pas `modeleFormule`, et son message est celui de la consigne.
- **Les refus** (§ 3.5) : `refusDuBrouillon` refuse les deux changements de « Ce calcul sert » ; `retirerCalcul` refuse un calcul lu.
  - `calculLu` lit les champs écrits tels quels : les énoncés, les deux zones des paliers, le texte des cas et le `selon` des tables.
- **Le jeton `{calcN}`** :
  - `enoncesAlgo.remplirCalculs` est appelé par `rendre` et par `projectionAlgo.remplir`. Les tables passent par `remplir`.
  - Un jeton que l'appel ne remplit pas part avec l'espace qui le précède. Un texte sans tel jeton est rendu à l'octet.
  - La projection ne le compte pas parmi ses « jetons inconnus », et il ne fait pas tomber le préfixe engendré : ce n'est pas un jeton de projection.
- **Les tables** (`js/tables-cas-algo.js`) :
  - `selon` peut valoir un calcul des phrases du même critère ; `selonsDuCritere` alimente le menu.
  - Ses cas de départ sont ceux de l'ébauche, et son libellé est « Ton calcul « X » ».
  - `valeurs` porte la valeur de chaque calcul, et `casChoisi` la lit comme une valeur chiffrée.
  - `assainir(brut, chaine, critere)` et `refusStructure(brut, critere)` relisent une table avec son critère : une table qui lit un calcul introuvable est écartée (import) ou refusée (partage).
- **À l'évaluation** (`js/evaluation-calcul.js`) : `_jetonsDesCalculs`, avec la note, sur les données de la copie (le compte brut, le compte pondéré, l'étendue, la pondération du critère). Les trois chemins sont mesurés :
  - le décompte et les paliers, dans `phraseDecompteAlgo` et dans `_construireRetroactionAlgoCategories` (le mode Catégories, avec la somme pondérée des codes) ;
  - les tables, dans `tablesCasAlgo.valeurs`, même source.

  La phrase enregistrée porte la valeur, et le PDF la lit.
- **La simulation et la palette** :
  - la simulation (`miroirAlgo.essayer`, `atelierAlgo.lecture`) calcule de même ;
  - « Après la flèche », chaque bloc de calcul porte sa valeur (`valeursDesBlocs`) ;
  - la palette (`js/palette-algo.js`) a un bloc par calcul, à la fin de « Ce qui se remplit… », sous son nom et avec l'aide de l'ébauche ;
  - ce bloc s'offre dans le décompte, les deux zones d'un palier et le cas d'une table, mais pas dans le bilan.
  - `grilles.js` (pose et cible) et `atelierAlgo.montrer` passent désormais le critère de la zone à `reperesDeZone`. C'était `null` : un bloc ne s'offre que dans les zones de SON critère.
- **L'écran** :
  - « Ce calcul sert » est dans le composeur. Changer de choix redessine le composeur seul, et le brouillon reste.
  - La zone dit « [Nom] = », ou « Ton calcul = » sans nom ; elle suit la frappe du nom sans redessin.
  - La liste « Tes calculs pour les phrases et les tables » (`_calculsPourLesPhrases`) offre « Modifier » et « Retirer », avec la confirmation en place.
  - Les cartes de la note ne montrent que les calculs `sert: 'note'`.
  - Le résumé de la chaîne ajoute « · N calcul(s) pour tes phrases ».
- **Le transport** : à l'import, `calculs` est relu AVANT `tablesCas` (l'ordre du schéma, commenté et testé). Chaque assainisseur dédié reçoit ce qui est déjà relu du critère. Au partage, `refusStructure` reçoit le critère.
- **Le style** : `.calc-sert`, `.calc-sert-choix` (44 px), `.calc-perso`, `.calc-perso-item` et `.calc-formule--ligne`, aux variables de `design-system.html`.

## 2. Ce que la mesure a dit

1. **`reperesDeZone(null, …)`**. La pose d'un bloc et le ciblage de la palette ne passaient pas le critère, parce que rien n'en dépendait avant les calculs. Sans ce changement, le bloc d'un calcul ne se serait jamais posé.
2. **Une copie fictive sans étendue** (un calcul sans longueur, comme la pénalité fixe) donne « sans valeur » à un calcul qui divise par l'étendue. C'est correct, et c'est ce que lira l'enseignant·e. Mesuré dans WebKit, et la spec a été écrite sur la discipline à étendue.
3. **La sentinelle du texte troué** (B.a) lit les appels `enonce(…, { … })` par une expression régulière. J'ai écrit les jetons des calculs par `...calculs` dans le littéral, pour garder la forme que la sentinelle lit.

## 3. Les suppositions que j'ai faites seul (à corriger d'un mot)

1. **Un jeton de calcul ne fait pas tomber le préfixe** « Tu fais en moyenne… » d'un palier, comme les deux noms (décision du 4 sept. sur les seuls jetons de projection).
2. **Les copies de référence** : 2 et 8 sans limite ; la tolérance et 4 × tolérance avec (§ 0).
3. **Le signe moins** d'une valeur négative est typographique (« −10 »), comme dans la ligne du calcul.
4. **« Modifier » de la liste** rouvre le composeur au-dessus de la liste, comme « Modifier ce calcul » sur une carte.

## 4. La preuve

> **Une reprise.** La session qui a codé ce lot s'est arrêtée à 10 h 23, avant ses tests et son commit (le lot entier non commité, cette preuve en blanc). Une seconde session de Claude Code l'a close à la demande de Grégoire (10 h 35) : elle a vérifié le code contre la consigne, fait passer la spec, pris la preuve et les captures. Ce qu'elle a changé est dit ci-dessous, rien d'autre.

- **Vitest** (`tests/unit/calculs-4c-phrases.test.js`, 24 tests ; les trois du banc R sont ceux de `fdd705b2`) :
  - A, la valeur : sans borne, ses trois choix « vaut 0 », jamais la note, « Garder » ;
  - B, le jeton `{calcN}` : rempli, vide, orphelin, dans le décompte, les paliers et les tables ;
  - C, une table « Selon » un calcul ; D, `calculLu` et les refus ; E, la palette ;
  - F, l'évaluation : les deux modes, la phrase d'hier à l'octet sans calcul pour les phrases, l'orphelin d'un import ;
  - G, l'aller-retour import et partage, la table qui lit un calcul introuvable.
- **Break-tests** (chacun restauré, `cmp` identique), six au total :
  - Vitest : une borne posée sur la valeur fait rougir A.a ; un jeton non rempli laissé tel quel, B.a à B.d, F.d et G.a ; `calculLu` qui rend toujours faux, D.a à D.c ; une table qui accepte tout `calcN` sans le chercher, G.a et G.b ;
  - WebKit : le nom d'un calcul non échappé dans la liste fait rougir l'essai du nom piégé ; un défilement de 30 px après la pose du bloc fait rougir l'essai du piège 3.
- **Playwright WebKit** (`critere-algorithmique-calculs-4c.spec.js`, 9 essais et les captures) : composer « Compte pondéré des erreurs ÷ Compte des mots × 100 » pour les phrases et le garder (la liste, la palette, la chaîne, la note intacte) ; « Ce calcul sert » sans perte du brouillon, le calcul de la note refusé aux phrases ; le bloc posé dans le décompte, la simulation, une table « Selon » ce calcul, « Retirer » refusé tant qu'un texte le lit ; **une vraie copie évaluée**, codes posés dans Annoter, dont la phrase et le PDF portent la valeur et le cas, la note inchangée ; le nom piégé ; 1 440, 1 180, 820 et 700 px.
- **Ce que la reprise a changé, dans les tests seulement** (aucune ligne de `js/`) :
  1. *La spec 4b, « cibles d'au moins 44 px »* (quatre largeurs) rougissait : elle comptait les boutons radio de « Ce calcul sert » (18 px). La cible au doigt est leur étiquette, `.calc-sert-choix`, de 44 px. L'essai mesure désormais l'étiquette d'un bouton radio.
  2. *L'essai du nom piégé* comptait toutes les images de l'atelier : il trouvait les 9 icônes de l'application (chevrons, corbeille des cas). Il vise désormais l'image du piège (`img[src="x"]`) ; `window.__piege` reste vérifié.
  3. *L'essai du piège 3* lisait 29 px de défilement : la fin du défilement doux de l'ouverture d'étape (`atelierAlgo`), pas la pose. Mesuré à 0 px pour `{calc1}`, `{erreurs}` et `{mots}` une fois le défilement immobile ; l'essai attend désormais un défilement immobile avant sa mesure.
- **Bancs voisins** : 48 specs WebKit choisies par `grep` (le registre, les tables, les énoncés, la palette, la projection, `donneesAlgorithmiques`, le partage, l'import, le PDF) : 208 réussis, 9 sautés, 0 échec.
  - **2 instables, hors du lot** : `comptes-erreurs-stock-1142.spec.js`, les essais « refusée sans codex à jour » et « n'écrit que `donneesAlgorithmiques` ». Au premier passage, l'espion des écritures voit celles du démarrage (les drapeaux de migration, `indicesAssiduite`, `indicesCP`, `indicesPatternsRaI`) ; ils passent au second. Le lot ne touche ni `comptes-erreurs-stock.js` ni cette spec. Issue : *inscrit ici et continuer* : l'espion devrait attendre la fin du démarrage. Pas au BACKLOG : aucun symptôme vécu.
- **Captures** : `plans de travail/captures-2026-10-27-calculs-4c/` (24 : la liste, la palette avec le bloc, une table « Selon » un calcul ; 1 440 et 820 px, clair et sombre, les deux disciplines).

## 5. Portes terrain : aucune

Les deux règles de tête du skill s'appliquent : la machine répond (WebKit, quatre largeurs, une vraie copie évaluée et son PDF), et aucun raté n'est irréversible (rien ne s'écrit avant « Garder » ; un critère sans calcul pour les phrases écrit la phrase d'hier ; une copie remise garde sa phrase enregistrée). **Ce que je n'ai pas pu vérifier** : l'iPad réel, c'est-à-dire le bouton radio « Ce calcul sert » au doigt et la pose d'un bloc de calcul au clavier virtuel.

## 6. Ce qui n'entre pas (§ 8)

Un calcul dans les phrases du bilan ; un calcul qui en lit un autre ; des fonctions ; l'Aide. Pas de release, de verdict ni de push.
