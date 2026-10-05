# Consigne du jour – enregistrement, lot 2 : « Enregistré » partout (#982) et les anciens guides rangés (#984)

> Écrite par Cowork le 5 octobre 2026 à 18 h 34 (Toronto, mesurée par `date`). Remplace la consigne de livraison du lot 1, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-enregistrement-livraison.md`.

## Où on en est

1.186.1 est en ligne ; la porte terrain du lot 1 est passée sur l'iPad (dix rangées sur dix). Grégoire a tranché les trois décisions du chantier : lis `DECISIONS-2026-10-05-chantier-enregistrement.md` en entier (décisions et ordre des lots). Ce lot est le lot 2.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork (les décisions, cette consigne, son archive), à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/enregistrement-partout`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 5. Pousse `RELAIS.md` seul sur `main` en t'arrêtant.

## Les décisions de Cowork (techniques)

1. **#982** : aux gestes de la liste figée par `sentinelle-lot-F-gestes-hors-temoin.test.js`, l'appel `signalerEcritureUsager(cle)` devient l'annonce du témoin par le point unique du lot 1 (`_annoncerEnregistre` ou son équivalent public), pour que la règle du lot 1 s'applique partout : grosse clé → « Enregistré » au commit ; échec → « Non enregistré » qui reste. Le codex continue d'être marqué « pas à jour » comme avant. Un geste qui écrit plusieurs clés n'affiche qu'**un** « Enregistré », après la dernière. Mesure d'abord : ceux des gestes de la liste qui ne sont **pas** des gestes de l'usager (écritures discrètes) gardent leur silence ; dis lesquels.
2. **#984** : `git mv` des deux guides vers `docs/archive/` ; corrige les liens qui y pointent dans le dépôt (le BACKLOG et les rapports peuvent garder leur mention historique).

## Ce que tu fais, dans cet ordre

1. **Commite** les décisions, cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure** le point 1 (gestes de l'usager ou écritures discrètes).
3. **Code** sur la branche.
4. **Tests** : la sentinelle de la liste devient : chaque geste de l'usager annonce « Enregistré » (et pas deux fois) ; un échec provoqué sur un geste de la liste → « Non enregistré ». Mutations rouges : un geste rendu muet ; deux annonces pour un geste ; l'annonce avant le commit d'une grosse clé. Vitest complet ; les bancs WebKit du témoin et voisins (résumé lu sans filtre).
5. **Arrête-toi et rends** : le commit sur la branche ; `DEMANDE-RELECTURE-2026-10-05-enregistrement-partout.md` ; pour Grégoire, la liste des écrans où « Enregistré » apparaît désormais, en gestes d'enseignant.

## Ce que tu rends

À Grégoire, deux lignes : ce qui change à l'écran. Ce que tu as supposé, en une ligne.
