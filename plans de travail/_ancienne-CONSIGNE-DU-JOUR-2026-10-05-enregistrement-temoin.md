# Consigne du jour – chantier de l'enregistrement, lot 1 : le témoin dit vrai et se voit (#962, #986)

> Écrite par Cowork le 5 octobre 2026 à 12 h 01 (Toronto, mesurée par `date`). Remplace la consigne de livraison de #1028, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-1028-livraison.md`.

## Où on en est

1.186.0 est en ligne. **Le chantier des archives est clos** (décision de Grégoire, 11 h 59). Grégoire ouvre **le chantier de l'enregistrement** : #967, #981, #983, #962, #975, #986 (techniques) ; #982, #976, #984 (ses décisions, que Cowork lui soumet une à une pendant que tu travailles). Ce premier lot prend les deux fiches qui touchent la promesse du chantier, « Enregistré » après chaque écriture (D0) : **#962** (le témoin dit « Enregistré » alors qu'une grosse clé n'a pas été écrite dans IndexedDB) et **#986** (sur l'iPad, le clavier cache le témoin ; symptôme vécu). Lis les deux fiches en entier.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/enregistrement-temoin`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 5. Pousse `RELAIS.md` seul sur `main` en t'arrêtant.

## Les décisions de Cowork (techniques ; dis-moi si une mesure les dément)

1. **#962 : un échec d'écriture ne se tait jamais.** Quand l'écriture IndexedDB d'une clé échoue après que le témoin a dit « Enregistré », le témoin passe à « Non enregistré », dit pourquoi, et **reste affiché** (comme les autres échecs depuis 1.161.0). Une écriture synchrone suivante de la même clé ne l'efface pas avant que son propre commit IndexedDB ait réussi. Piste de la fiche : signal d'échec de `_trackOperation`, abonnement dans `modes.js`. **Pour les grosses clés (au-delà de `SEUIL_IDB_FIRST`), « Enregistré » ne s'affiche qu'une fois le commit IndexedDB confirmé** ; mesure le délai sur une clé de taille réelle (les évaluations, les fichiers de travaux) et dis-le s'il dépasse une seconde.
2. **#986 : le témoin se voit au-dessus du clavier de l'iPad.** Il se place au-dessus du clavier à l'écran quand celui-ci est ouvert (`visualViewport`), et reste lisible assez longtemps pour être vu (2 s actuellement : mesure, et allonge si le décalage du clavier le rend plus court en pratique). Rien ne change sur le Mac.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure avant de coder** : comment provoquer l'échec IndexedDB au banc (quota, transaction avortée, connexion fermée comme après une mise en arrière-plan sur l'iPad) ; quels gestes écrivent une grosse clé ; ce que fait aujourd'hui le témoin dans chaque cas.
3. **Code** sur la branche.
4. **Tests** : l'échec provoqué sur une grosse clé → « Non enregistré », qui reste ; une écriture qui réussit ensuite → « Enregistré » seulement après son commit ; une petite clé inchangée. Le placement au-dessus d'un clavier simulé (`visualViewport` réduit) à la largeur de l'iPad. Mutations rouges : l'échec redevenu muet ; « Enregistré » avant le commit d'une grosse clé ; le témoin sous le clavier. Vitest complet ; les bancs WebKit du témoin.
5. **Arrête-toi et rends** : le commit sur la branche ; `DEMANDE-RELECTURE-2026-10-05-enregistrement-temoin.md` ; pour Grégoire, **le texte exact** de tout message nouveau ou changé, et **le geste à vérifier sur l'iPad** (porte terrain).

## Ce que tu rends

À Grégoire, deux lignes : ce qui change à l'écran. Les mots dans un bloc à part, s'il y en a. Ce que tu as supposé, en une ligne.
