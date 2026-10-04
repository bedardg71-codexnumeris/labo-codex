# Consigne du jour – archiver un trimestre entier (E1)

> Écrite par Cowork le 4 octobre 2026 à 16 h 27 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 14 h 41, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1002-mise-en-ligne-et-mesure.md`.

## Où on en est

1.182.0 est en ligne (#1002 close) ; ta mesure est lue par Cowork. **Grégoire a approuvé à 16 h 27 le plan et son ordre** : `plans de travail/PLAN-2026-10-04-emprunter-et-rendre-un-trimestre.md` (lis-le en entier). Trois gestes : **archiver le trimestre (E1, ce lot)**, l'emprunter (E2), le rendre (E3). Ils passent avant l'enregistrement et la carte d'alignement, à cause de la marge du codex.

Ce lot fabrique l'exemplaire dont tout le reste dépend : il passe par la **relecture croisée** (règle 2 de `PROTOCOLE.md`), bien qu'il n'écrive rien dans les données.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/e1-archiver-trimestre`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 6.

## D'abord, les inscriptions (décisions de Cowork sur tes trouvailles)

1. **Inscris** (issue 2) : la suppression d'un trimestre laisse les fichiers de ses copies dans le navigateur (E0 de ta mesure) ; le stock déjà orphelin est une question de données, à Grégoire, plus tard.
2. **Inscris**, en une fiche : rouvrir un codex (dont le codex à part) remet tout l'espace à son état d'avant, et le codex à part devient le codex actif sous le nom « avant-suppression » ; les mots de la fenêtre reviendront à Grégoire.
3. **Inscris** : l'archive d'un groupe emporte entières les clés `{[da]}` inconnues (inféré, à mesurer).
4. **Ferme #1001** comme dépassée par le plan du 4 oct. (E3). Note à #1006 que le plan propose de retirer les trois boutons quand E1 sera livré : décision à Grégoire, au point 6.

## Les décisions de Cowork pour E1 (techniques ; dis-moi si une mesure les dément)

1. **Où** : dans la bibliothèque des trimestres, sur un trimestre **clos** seulement (ordre de vie : clos → archivé). Pas sur le trimestre actif ni sur un trimestre en cours.
2. **Ce que l'archive emporte** : toutes les clés `<trimestre>_*` ; les séances vivantes `seancesCompletes_gc_<id>` des groupes de ce trimestre ; tous les fichiers des copies de ce trimestre, corbeille comprise. **Aucune clé globale n'y entre comme donnée à réécrire** ; celles que le trimestre lit (cours, profil…) peuvent y figurer **pour mémoire**, dans une section que E2 ne réécrira jamais, si c'est utile pour lire l'archive seule. Tranche, et dis-le.
3. **Une empreinte par fichier et une par clé**, dans un manifeste qui dit aussi la version de l'application, le trimestre, la date et la liste des clés.
4. **Le socle des lots A1 et A2** : même assemblage sans charger les copies en mémoire, mêmes modes (fichier sous Safari, dossier sous Chrome), même confirmation par l'usager que le fichier est là, même liste des archives. **« Vérifier » s'étend** à l'archive d'un trimestre (fichiers et clés).
5. **Rien n'est retiré, rien n'est écrit dans les données** : seule la liste des archives gagne une entrée.
6. **Hors du lot** : emprunter, rendre, les boutons « Exporter les données » (#1006), la suppression (E0).

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne, son archive et le plan sur `main` ; les inscriptions ; pousse `main`.
2. **Code** E1 sur la branche, mots provisoires.
3. **Tests** : un banc sur un trimestre fictif clos (deux groupes, un doubleur, des copies dont une à la corbeille, des séances vivantes) : l'archive contient exactement ce que dit le point 2, aucune clé d'un autre trimestre, chaque empreinte juste ; « Vérifier » la dit intacte, puis abîmée après un octet altéré. Mutations rouges : une clé globale qui entre ; une copie de la corbeille oubliée. Largeur iPad. Vitest complet.
4. **La mémoire, mesurée** : une archive de taille réelle fabriquée au banc (de l'ordre de 1,1 Go, la taille de l'hiver 2026), pic relevé, sous WebKit.
5. **Écris** `plans de travail/DEMANDE-RELECTURE-2026-10-04-e1-archiver-trimestre.md` (ce que l'archive contient, avec le témoin ; ce qu'elle n'emporte pas, et pourquoi ; la mémoire ; ce qui reste pour E2).
6. **Arrête-toi et rends** : le commit sur la branche ; **les mots exacts** du geste (bouton, fenêtre, confirmation, liste) ; et ta recommandation sur les trois boutons « Exporter les données » (#1006). Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : ce que l'archive d'un trimestre emporte, et ce qu'elle laisse. Les mots dans un bloc à part. Ce que tu as supposé, en une ligne.
