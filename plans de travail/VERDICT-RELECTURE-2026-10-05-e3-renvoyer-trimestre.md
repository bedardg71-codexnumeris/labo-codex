# Verdict de relecture – E3, renvoyer un trimestre aux archives (#1024)

> Écrit par Cowork le 5 octobre 2026 à 7 h 19 (Toronto, mesurée par `date`). Porte sur `2cf725f0` et `ae4f06cd` (`claude/e3-renvoyer-trimestre`) et `DEMANDE-RELECTURE-2026-10-05-e3-renvoyer-trimestre.md`.

## Verdict : orange, trois corrections

Relu : `js/reserve-renvoyer.js` l. 1-560 (refus, comparaison, retrait, compte rendu), `reserve-verifier.js` (`sourceFichier`, la boucle des copies de « Vérifier »), `db.js` (`get`, `getSync`, `keysSync`), la demande, les fiches #1024, #1026, #1027.

**Accepté tel quel** :
- l'ordre (registre, copies et vignettes, séances, clés en dernier) et ses deux raisons ;
- la garde de plus (recomparaison juste avant le premier retrait) : **utile, gardée**. La fenêtre de confirmation est une attente ; rien ne garantit que rien n'écrit pendant. Elle est peu coûteuse ;
- la relecture de chaque retrait et l'arrêt au premier refus ; le contournement de #845 par `removeSync` ;
- la mise de côté `hors-archive-<date>/` du mode dossier (rien d'effacé) ;
- les deux clés laissées (`snapshot_<trim>_*`, `tableCorrespondance_<trim>`).

## Correction 1 – la supposition du § 1 : refusée. Relire le CONTENU des copies de l'archive

Le renvoi est le seul moment où l'archive devient l'unique exemplaire. La garantie « vérifiée » peut dater de plusieurs semaines, et l'archive de Grégoire vit sur iCloud (dossier « réserve »), où un fichier peut être évincé du disque local ou remplacé par la synchronisation sans que la liste change. Lire la liste, c'est prouver que le nom est là, pas que la copie se rendra.

Coût *inféré* de ta mesure : la comparaison empreinte déjà 1,08 Go de copies de l'application en 1,3 s ; relire autant dans l'archive coûte du même ordre, quelques secondes. C'est peu pour le seul geste qui retire.

⮕ Dans `comparer()`, après la vérification de `meta.json` et `donnees.json` : relis et empreinte **chaque copie de l'archive** (`source.lireCopie`, une à la fois, comme « Vérifier »), y compris celles que l'application n'a plus (une reprise). Une seule illisible, tronquée ou d'empreinte différente → refus, rien retiré, mot de refus « L'archive ne concorde plus avec sa vérification… » (le même). Mesure la durée et le pic sur 394 copies ; au-delà de 30 s de plus, dis-le avant de livrer. Mutation rouge : la relecture du contenu neutralisée, avec une copie d'archive altérée après « Vérifier ».

## Correction 2 – une clé `<trimestre>_*` qui vaut `null` bloque le renvoi en boucle (*lu*, non mesuré)

`comparer()` saute une clé vide (l. ~315, `continue`) sans la mettre dans `aRetirer.cles` ; `retirer()` la compte « née depuis » (elle a le préfixe et n'est pas connue) et rend `different`. « Archiver de nouveau » n'y change rien : E1 ne garde pas les clés vides (`reserve-trimestre.js` l. 149). Et si elle restait après un renvoi, `estInacheve()` dirait « inachevé » pour toujours. `db.set(k, null)` écrit bien `"null"`, que `getSync` relit `null` (*lu*, `db.js`).

⮕ Une clé `<trimestre>_*` qui vaut `null` ne garde rien : elle va dans `aRetirer.cles` (retirée en dernier avec les autres) et n'est jamais « née ». Un essai : un trimestre avec une clé `null` se renvoie et ne reste pas « inachevé ». Mutation rouge : le traitement de la clé vide retiré.

## Correction 3 – #1027 se corrige dans ce lot

Sans elle, le geste peut être inutilisable sur les données de Grégoire, et le savoir demande une lecture dans son Chrome. La piste de la fiche est juste : une fiche que `meta.json` déclare sans fichier **à l'archivage** n'est pas « non couverte ». L'archive la garde telle qu'elle était (une fiche sans fichier) ; la renvoyer ne perd rien, puisque l'application n'a pas de fichier non plus.

⮕ Dans « Vérifier », ne compte pas « non couverte » une fiche que l'archive déclare manquante à l'archivage. Mais une fiche dont le fichier est **là dans l'application** et absent de l'archive reste une différence pour E3 (c'est déjà le cas : « copie absente de l'archive »). Essais : l'archive d'un trimestre avec une fiche sans fichier est « vérifiée », revient et se renvoie. Mutation rouge : l'ancienne règle remise.

## Ce qui ne demande rien

- **§ 5, point 5** : les passages planifiés annulés des 3 et 4 oct. sont déjà #979. Le défaut « en trop » du mode dossier d'un **groupe** : laissé, d'accord.
- **#1026 (vignettes)** : E3 la rend vécue au premier aller-retour (la vignette part au renvoi, ne revient pas). Rien n'est perdu : c'est l'affichage. Elle reste ouverte, pas dans ce lot.

## Les mots

Soumis à Grégoire par Cowork ; ils arriveront avec la consigne de livraison.

## Les mots tranchés par Grégoire (5 oct. 2026, 7 h 43)

**Fenêtre « identique » : acceptée**, telle que proposée par Cowork :

> Titre : « Renvoyer Hiver 2026 aux archives ? »
> « Hiver 2026 quittera l'application : 130 étudiant·es, 394 copies, environ 1,08 Go.
> Son archive, vérifiée le 5 octobre 2026, le garde tel quel : « Faire revenir » le ramènera.
> Garde bien cette archive : c'est elle qui le conserve.
> Les autres trimestres, les cours et les réglages ne sont pas touchés. »
> Bouton : « Renvoyer aux archives »

Avec : une seule date (celle de la vérification) ; « c'est elle qui le conserve » remplace « c'est son seul exemplaire » (un ancien codex peut encore le contenir) ; la virgule décimale (« 1,08 Go »), à aligner dans tout l'écran des archives (« 80.0 Ko » d'E1 devient « 80,0 Ko »).

**Fenêtre « différent » : acceptée** (7 h 45), telle que proposée par Cowork :

> Titre : « Hiver 2026 a changé depuis son archive »
> « Rien n'a été retiré.
> Depuis son archive du 5 octobre 2026 : 3 données modifiées, 7 données ajoutées.
> C'est normal si tu l'as consulté : l'application recalcule certaines données à l'ouverture.
> Pour le renvoyer : archive-le de nouveau, vérifie la nouvelle archive, puis renvoie-le. »
> Bouton : « Archiver de nouveau »

Les copies suivent la même règle : « N copies ajoutées » (absentes de l'archive), « N copies modifiées » (différentes de l'archive). Le cas « reprise » garde sa dernière ligne propre, dans les mêmes mots (« Fais-le revenir pour le consulter, puis archive-le de nouveau avant de le renvoyer. »).

**Bilan : accepté**, tel que proposé par Cowork :

> Titre : « Hiver 2026 est renvoyé aux archives »
> « Il n'est plus dans l'application ; son archive le garde.
> Pour le faire revenir : Réglages › Données › Archives, « Faire revenir ».
> 394 copies retirées. Ton prochain codex sera plus léger d'environ 1,08 Go. »

(Le compte des données retirées disparaît.)

**Interrompu : accepté**, tel que proposé par Cowork :

> Titre : « Renvoi inachevé »
> « Le renvoi de Hiver 2026 s'est arrêté en cours de route. Rien n'est perdu : son archive garde tout.
> Pour finir : Réglages › Données › Archives, ligne de Hiver 2026, « Terminer le renvoi ».
> Pour annuler : « Faire revenir », au même endroit. »

(La cause technique et le compte de ce qui reste disparaissent.)

**Reprise : acceptée**, avec le mot de Grégoire. **« Finir de renvoyer » est remplacé partout par « Terminer le renvoi »** (bouton, titre, fenêtre « Renvoi inachevé », aide, tests) ; motif de Grégoire : « finir de renvoyer » s'entend comme « continuer de vomir ».

> Bouton sur la ligne de l'archive : « Terminer le renvoi » (infobulle : « Le renvoi s'est arrêté en cours de route : retirer ce qui reste »)
> Titre : « Terminer le renvoi de Hiver 2026 ? »
> « Une partie de Hiver 2026 est restée dans l'application, identique à son archive. Elle sera retirée ; l'archive garde tout. »
> Bouton : « Terminer le renvoi »

(Le compte de ce qui reste disparaît.)

**Refus : acceptés** (titre inchangé, « Trimestre non renvoyé »). Inchangés : `pasClos`, `actif`, `rien` ; `sansArchive` sans la parenthèse : « Ce trimestre n'a pas d'archive dans la liste. Archive-le d'abord, puis vérifie l'archive. » ; `nonVerifiee` tel quel. Changés :

> `changeeDepuis` ET `copiesAbsentes` (un seul message) : « Son archive a changé depuis sa vérification, ou une copie y est illisible. Rien n'a été retiré. Vérifie-la de nouveau ; si elle reste en défaut, archive le trimestre de nouveau. »
> `sansEmpreintes` : « Cette archive est trop ancienne pour un renvoi. Archive le trimestre de nouveau. »

`introuvable`, `pasUnTrimestre`, `sansMagasin` : laissés (cas techniques, non soumis).

Menu et son infobulle : inchangés (« Renvoyer aux archives… », nom décidé par Grégoire le 4 oct.).

## Relecture des corrections (`d17b0749`, Cowork, 5 oct., 7 h 51) : verte

Lu le diff de `reserve-renvoyer.js`, `reserve-verifier.js`, `reserve-emprunter.js`. Les trois corrections font ce que le verdict demande ; la supposition sur #1027 (le compte des fiches sans fichier doit égaler `nombre_fichiers_manquants`, sinon l'ancienne règle) est acceptée : elle ne peut que refuser davantage.

## À inscrire au BACKLOG (décision de Grégoire, 5 oct. 2026)

Une fiche neuve, **non prioritaire, après la livraison d'E3** : « Archiver les copies d'un trimestre clos en gardant ses données » (retirer de l'application les seules copies, que l'archive vérifiée garde à l'identique ; les données restent consultables). Grégoire juge cette option « assez probable » chez les utilisateurs. Elle reprend l'intention de #1001 (fermée le 4 oct., dépassée par E3) et s'appuiera sur la comparaison et le retrait d'E3 (copies et vignettes seulement). On termine d'abord le chantier actuel.

