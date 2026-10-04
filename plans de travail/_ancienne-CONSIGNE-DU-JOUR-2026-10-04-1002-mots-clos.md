# Consigne du jour – archives, lot A5 : les mots « clos » (#1002)

> Écrite par Cowork le 4 octobre 2026 à 14 h 17 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 12 h 47, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1000-mise-en-ligne.md`.

## Où on en est

1.181.0 est en ligne (#1000 close, relais 61d30f04), relu par Cowork à 14 h 17. Chantier des archives : ce lot (A5), puis alléger (A4, #1001), puis chantier clos.

Lis en entier : la fiche #1002 au BACKLOG ; `plans de travail/MESURE-2026-09-30-archives.md` § 4 (l'inventaire et la table des 41 textes, avec une proposition pour chacun) ; la fiche #1006 (le fichier téléchargé à la clôture, que rien ne sait rouvrir).

**Ce qui est tranché par Grégoire** (30 sept.) : « clos » = l'état gelé d'un trimestre terminé, en lecture seule ; « archivé » = déposé hors du navigateur et vérifié. Et (2 oct., fiche #1002) : **seuls les textes où un vrai choix existe lui reviennent** ; le remplacement mécanique du mot ne lui revient pas.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/1002-mots-clos`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 5.

## Les décisions de Cowork (techniques ; dis-moi si une mesure les dément)

1. **Le remplacement mécanique, sans le lui demander** : archivé → clos, archiver → clore, désarchiver → rouvrir, archivage → clôture, partout où le texte désigne l'**état gelé**, selon la table de la mesure. Le tutoiement remplace le vouvoiement là où la table le relève.
2. **Ne change pas** : les textes du **dépôt aux archives** (158, ils gardent leur mot) ; « Exporter et archiver » de Travaux et l'évaluation « archivée » après un jeton (deux autres sens, hors du lot : inscris-les à une fiche si elle n'existe pas) ; les **noms internes** (`archiverTrimestre`, `trimestre.archive`…) ; les **Nouvelles déjà publiées**.
3. **Les « vrais choix »**, que tu prépares et qui lui reviendront par Cowork, chacun avec ta recommandation :
   - l'aide de la clôture, qui dit que clore « libère l'espace » (faux : clore ne libère rien) : la phrase de remplacement ;
   - le **fichier téléchargé à la clôture** (`trimestre-<id>-archive-<date>.json`, #1006 : rien ne sait le rouvrir) et le message « Un fichier d'export a été téléchargé » : le garder et le renommer, ou ne plus le télécharger ;
   - « l'archive d'un trimestre » (`registre-longitudinal.js`), à trancher selon la mesure ;
   - le libellé « dernière maj » sous la liste des archives, qui avance après « Vérifier » sans que l'archive change (trouvaille de la porte A2, dans #1002) ;
   - l'encadré « Archiver dans les archives… » (`index.html`) et l'aide de la carte Archives qui ne nomme pas « Vérifier » ni « Faire revenir ».
4. **Remesure l'inventaire avant de coder** : il date du 30 sept. (1.172.0) ; neuf versions sont passées. Les lignes ont bougé, des textes ont pu naître ou mourir.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Remesure** l'inventaire (même méthode que la mesure du 30 sept.) ; dis l'écart avec les 41.
3. **Code** le point 1 sur la branche. Les vrais choix du point 3 : **ne les écris pas** ; prépare pour chacun le texte actuel, ta proposition et ta recommandation.
4. **Tests** : les sentinelles textuelles existantes suivent ; une sentinelle qui dit qu'aucun texte lu par l'usager ne désigne plus l'état gelé par « archiv » (avec la liste des exceptions nommées du point 2) ; la mutation démontrée rouge (un « Trimestre archivé » remis). Vitest complet.
5. **Arrête-toi et rends** : le commit sur la branche ; le nombre de textes changés ; et **les vrais choix**, un par un, chacun en trois lignes (actuel, proposé, recommandation et pourquoi). Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : combien de textes disent maintenant « clos », et où il le verra (la bibliothèque des trimestres). Les vrais choix dans un bloc à part, numérotés. Ce que tu as supposé, en une ligne.
