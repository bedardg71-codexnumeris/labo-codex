# Consigne du jour – le garde-éveil de la vérification (#1008)

> Écrite par Cowork le 4 octobre 2026 à 7 h 04 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 0 h 07, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1007-pluriel-cible.md`.

## Où on en est

1.178.0 est en ligne, #1007 close, la porte de Grégoire est passée (4 oct., 6 h 59, dix rangées sur dix). Grégoire veut, aujourd'hui, clore dans l'ordre : ce lot, puis les archives, l'enregistrement et la carte d'alignement. Ce lot ne touche que la forge (`scripts/`, `tests/unit/`) : **aucun fichier de `js/`, aucune release, aucun texte d'écran**.

Lis la fiche #1008 au BACKLOG en entier (ligne ~224) : c'est la mesure de la nuit du 1er octobre.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à travailler sur une branche `claude/1008-garde-eveil`, à pousser et à fusionner vers `main`. Si le garde de permissions refuse, arrête-toi sur ce seul point et dis-le-lui.

## Ce que Cowork a mesuré (lecture du code, le 4 oct. à 7 h)

- `scripts/verifier-playwright.mjs` (l. ~184) lance `caffeinate -i -w <pid>` : il empêche la veille d'inactivité, rien d'autre ; il ne ramène pas un Mac en éveil sombre à l'éveil complet.
- La suite part par `spawnSync` (l. ~191) : **la boucle d'événements de Node est bloquée pendant les ~43 min**. Aucune surveillance en cours de suite n'est possible tant que ce lancement reste synchrone.
- `scripts/garde-charge.sh` ne relève que la charge moyenne, au lancement seulement (son en-tête le dit : « la garde juge le LANCEMENT, pas la durée »).
- Le verdict se lance aussi hors de `pousser.sh` : le skill `fin-de-session` (l. ~264) le fait à la main, et la session de la nuit du 1er aussi.

## Les décisions de Cowork (techniques, prises seul ; dis-moi si une mesure les dément)

1. **Les gardes vivent dans `verifier-playwright.mjs`**, le point par où passe tout verdict, quel que soit l'appelant. On ne force donc pas tout verdict à passer par `pousser.sh` : ce serait une règle à retenir, alors qu'une garde dans le script n'a besoin de personne.
2. **Au lancement, ramener le Mac à l'éveil complet et l'y tenir** : déclarer l'utilisateur actif (`caffeinate -u`), puis tenir pendant toute la suite une assertion d'écran et de système en plus de l'inactivité (`-d -i -s`, toujours `-w <pid>`). Puis **vérifier que les assertions sont réellement tenues** (`pmset -g assertions`) ; si elles ne le sont pas, ne pas lancer : verdict code 2, une ligne qui dit pourquoi. ⚠ Inféré dans la fiche, pas mesuré : qu'une assertion d'écran retienne la veille de maintenance. À toi de le mesurer, au moins en lançant après `pmset displaysleepnow`.
3. **Pendant la suite, une surveillance toutes les 30 s** (lancement asynchrone, groupe de processus à soi) :
   - **la veille** : détecter chaque veille survenue pendant la suite (piste : l'écart entre l'horloge murale et l'horloge monotone, qui sur macOS ne compte pas le temps de veille ; à vérifier, sinon `pmset -g log` entre le début et la fin). Le verdict déposé dit **combien de veilles et leur durée** ; un verdict rouge rendu après une veille le dit en tête.
   - **la mémoire** : relever le fichier d'échange (`sysctl vm.swapusage`) et la pression mémoire (`kern.memorystatus_vm_pressure_level`). Au-delà d'un seuil tenu sur deux relevés de suite, **arrêter proprement la suite** (tout le groupe de processus, WebKit compris), déposer le verdict code 2 « non jugé : mémoire », avec la valeur relevée. Mieux vaut un verdict non rendu qu'un Mac figé jusqu'au bouton, comme le 1er.
   - Les seuils sont nommés en tête du script, avec la mesure qui les justifie, comme ceux de `pousser.sh`.
4. **Au lancement aussi, le fichier d'échange** : s'il est déjà au-delà du seuil, ne pas lancer (code 2). Dans `verifier-playwright.mjs`, pour la raison du point 1.
5. **Le rapport du verdict** porte, en plus de l'existant : veilles (nombre, durée), mémoire au plus haut (échange, pression), éveil complet tenu oui/non.

## Ce que tu fais, dans cet ordre

1. **Commite** les fichiers de Cowork tels quels sur `main` (cette consigne et son archive), et **coche #1014 au BACKLOG** : le codex complet est en ligne depuis 1.174.6 (2 oct.), la fiche est restée non cochée (remesuré par Cowork le 4 à 7 h). Pousse `main`.
2. **Mesure avant de coder**, sur le Mac : l'horloge monotone de Node pendant une veille (si tu ne peux pas provoquer de veille, dis-le et prends `pmset -g log`) ; ce que `pmset -g assertions` montre avec `-d -i -s` tenu ; les valeurs lisibles d'échange et de pression au repos.
3. **Code** les points 2 à 5 sur `claude/1008-garde-eveil`. Les décisions (lire l'échange, la pression, la veille ; juger un seuil) sont des fonctions pures, testées par une sentinelle Vitest dans `tests/unit/` ; démontre la mutation rouge (la garde mémoire retirée, puis la détection de veille retirée).
4. **L'épreuve réelle** : le verdict complet de ce lot se lance avec la nouvelle garde. Pendant qu'il tourne, relève `pmset -g assertions` ; à la fin, son rapport doit dire « éveil complet tenu », les veilles (zéro attendu, Mac ouvert) et la mémoire au plus haut. Si tu peux, une contre-épreuve courte de la garde mémoire avec un seuil abaissé par variable d'environnement (comme `LABO_CHARGE_SEUIL`) : la suite s'arrête, le verdict dit « non jugé : mémoire ».
5. **Le skill `fin-de-session`** et l'en-tête de `garde-charge.sh` : une phrase chacun qui dit où vivent désormais ces gardes, rien de plus.
6. **Pousse, fusionne vers `main`.** Clos #1008 au BACKLOG ; ce qui resterait (le couvercle fermé, que rien n'empêche) s'écrit dans la fiche close, pas dans une fiche neuve, sauf s'il bloque un chantier.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Suite : le signal au début de l’évaluation (#1010), puis masquer ce qui reste d’un élève supprimé (#1013), avant les archives (ordre confirmé par Grégoire le 4 oct.), sur une consigne de Cowork.

## Ce que tu rends

À Grégoire, trois lignes : le verdict de ce lot et ce que son rapport dit de l'éveil, des veilles et de la mémoire ; si la garde mémoire a été éprouvée ; ce qui reste (le couvercle). Pas de porte terrain : la machine répond. Ce que tu as supposé, en une ligne.
