# Consigne du jour – renvoyer un trimestre aux archives (E3, #1024)

> Écrite par Cowork le 5 octobre 2026 à 4 h 36 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 19 h 46, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-e2-mise-en-ligne.md`.

## Où on en est

1.184.0 est en ligne (E2, « Faire revenir » un trimestre, #1023 close), relu par Cowork le 5 à 4 h 36. Plan : `PLAN-2026-10-04-emprunter-et-rendre-un-trimestre.md` ; ce lot est **E3, « Renvoyer aux archives »**, le dernier du chantier. Lis la fiche #1024 **en entier** (ta note d'E1 sur le mode dossier, les deux points du verdict d'E1, ta mesure d'E2 sur l'activation), et #1019, #1026.

C'est le **seul geste du plan qui retire des données de l'application** : relecture croisée obligatoire (règle 2 de `PROTOCOLE.md`), et la première fois sur l'hiver 2026 revient à Grégoire.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/e3-renvoyer-trimestre`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 6. Pousse `RELAIS.md` seul sur `main` en t'arrêtant.

## Les décisions de Cowork (techniques ; dis-moi si une mesure les dément)

1. **D'où** : au menu ⋮ d'un trimestre **clos** de la bibliothèque des trimestres, à côté de « Archiver le trimestre… ». Refusé pour le trimestre actif (il faut en activer un autre d'abord) et pour un trimestre en cours.
2. **La règle : on ne renvoie que ce que l'archive sait rendre à l'identique.** Au moment du geste, l'archive (listée, vérifiée dans ce navigateur) est relue et **comparée au trimestre** : chaque clé `<trimestre>_*` et chaque séance de ses groupes à son empreinte ; chaque fichier de copie (travail et corbeille) que l'application a, à son empreinte dans l'archive. Puis :
   - **identique** (aucune clé ni copie absente de l'archive, aucune différente) → le geste est offert ;
   - **différent** (une clé changée ou née depuis, une copie absente de l'archive ou différente) → **rien n'est retiré**. La fenêtre le dit, avec le nombre de différences, et propose **d'archiver de nouveau d'abord** (E1 coûte quelques secondes), puis de renvoyer. Rien ne se perd jamais : c'est la règle de Grégoire du 20 sept. Ta mesure d'E2 dit que l'activation change des clés : c'est ce chemin qui les sauve.
3. **Le mode dossier** : ta note d'E1 (un fichier d'une archive précédente reste dans le dossier, et « Vérifier » le dit « en trop ») est à régler avant la comparaison. Tranche, et dis-le.
4. **Ce qui est retiré** : l'entrée du trimestre au registre `trimestres` (sans toucher aux autres) ; toutes ses clés `<trimestre>_*` ; les séances `seancesCompletes_gc_<id>` de ses groupes ; les fichiers de ses copies (travail et corbeille, ce que la suppression oublie, #1019) ; les vignettes `thumbnail_<id>` de ces copies. **Jamais** une clé globale partagée (`cours`, `infoCours`, profil, registre longitudinal, `seancesCompletes_<coursId>`, `groupeCoursActif`…).
5. **Interrompu, il se reprend** : le geste est **idempotent**. S'il s'arrête au milieu, le relancer achève ce qui reste (offert depuis la bibliothèque si le trimestre y est encore, sinon depuis la ligne de son archive) ; le bilan dit ce qui reste et comment finir. Choisis l'ordre de retrait qui laisse l'état le plus lisible en cas d'arrêt, et dis pourquoi. Et « Faire revenir » doit savoir rendre un trimestre dont il reste des morceaux identiques à l'archive (ta règle d'E2 : identique → laissé).
6. **Le filet** : l'archive vérifiée et identique **est** le filet ; le geste n'exige pas de codex à part (un codex de 1,3 Go le ferait tomber). Les mots le diront ; Cowork le soumettra à Grégoire avec les mots.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure avant de coder** : le point 3 ; et ce qui, dans l'espace, lit encore un trimestre absent après un renvoi (registre longitudinal, Suivi longitudinal, alignement, tableau de bord) : rien ne doit planter.
3. **Code** sur la branche, mots provisoires.
4. **Tests** : **l'aller-retour complet**, sur un espace qui porte un trimestre en cours (avec un doubleur) et des réglages : archiver un trimestre clos fictif, le renvoyer, faire évoluer l'espace, puis le faire revenir : **toutes ses clés et tous ses fichiers égaux à l'avant-renvoi**, et rien d'autre n'a changé dans l'espace à aucune étape. Puis le cas « consulté » : faire revenir, activer, réactiver un autre trimestre, renvoyer → **refus**, rien retiré ; archiver de nouveau, renvoyer → passe, et l'aller-retour suivant rend la version consultée. Les refus du point 1. Un arrêt provoqué au milieu, puis la reprise. Mutations rouges : une clé globale retirée ; une copie retirée alors que l'archive ne l'a pas ; la comparaison neutralisée. Largeur iPad. Vitest complet.
5. **La mémoire et la durée**, mesurées sur un trimestre de taille réelle (~1,1 Go).
6. **Arrête-toi et rends** : le commit sur la branche ; une `DEMANDE-RELECTURE-2026-10-05-e3-renvoyer-trimestre.md` ; et, pour Grégoire, **les mots exacts** (menu, fenêtre identique, fenêtre « différent » avec la proposition d'archiver de nouveau, bilan, refus, reprise). Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : ce que fait « Renvoyer aux archives », et ce qu'il refuse de faire. Les mots dans un bloc à part. Ce que tu as supposé, en une ligne.
