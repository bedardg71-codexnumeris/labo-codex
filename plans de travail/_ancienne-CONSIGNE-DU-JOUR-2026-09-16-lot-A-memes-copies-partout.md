# Consigne du jour – lot A des règles du dépistage : les mêmes copies partout (#737, #741, #718, #738 volet complétion)

> Écrite le 16 septembre 2026, 19 h 00 (Toronto), sur `916e6dac` (`1.142.18` en ligne, un commit de docs d'avance).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-16-652-890-ouvrir-une-copie.md`.
> ⚠ Recopiée ici après coup : les consignes des lots 22 (#891, #894) et 23 (lot B, #739, #740) n'ont été remises que dans la conversation, ce qui est une faute de Cowork. Leur trace est dans les messages de commit `f59c8b3c` et `4ef65597` et dans `RELAIS.md`.
> Choisie par Grégoire vers 19 h : c'est le seul lot restant du chantier qui ne lui demande aucun mot.

Mandat (Grégoire, 16 sept. 2026, soir) : lot A du chantier « Les règles du dépistage » (`plans de travail/CADRAGE-2026-09-16-regles-du-depistage.md`), intitulé « Les mêmes copies partout » : #737, #741, #718 et le volet complétion de #738. Grégoire a tranché les quatre à 17 h 19 (lis la ligne « ✅ TRANCHÉ » sous chaque fiche du BACKLOG). État au départ : 1.142.18 en ligne ; main a un commit de docs d'avance (916e6dac, relecture de Cowork), à pousser avec ce lot.

## Les deux règles

- **R1 (#737, #741, #718)** : une copie compte quand l'enseignant l'a ENREGISTRÉE, avec ou sans commentaire final, partout : note, complétion, dépistage (barres, moyennes, IPB, défi, défi spécifique), carte RàI, niveau de la note globale (STD). Un brouillon ne compte nulle part.
- **R2 (#738)** : la complétion ne compte JAMAIS un travail non remis, quelle que soit la pratique. La NOTE garde la règle de sa famille : elle reste hors périmètre (`CADRAGE-2026-09-05-non-remis-par-famille.md`). Le statut « non-recu », que le menu écrit depuis février, est reconnu comme l'ancien « non-remis ».

## Mesure d'abord, et arrêt possible

- « Non reçu » est aussi le DÉFAUT du formulaire (`evaluation-chargement.js:369`). Il verrouille les critères (961 ; `evaluation-sauvegarde.js:549`), donc une copie évaluée ne devrait pas le porter. Mais un statut remis à « Non reçu » APRÈS l'évaluation passe par `changerStatutRemise` sans rien effacer. Mesure, sur le pack démo et sur les bancs existants, combien d'évaluations portent à la fois `statutRemise` `'non-recu'` et des niveaux ou une note. **Si le cas existe et qu'un chemin réel le produit, ARRÊTE-TOI et rapporte à Cowork avant R2** : ce serait une question sur les données de Grégoire, pas une question technique. S'il n'existe pas, écris comment tu l'as établi.
- Relevé de Cowork (18 h 55, par lecture) : le filtre `e.retroactionFinale` est à six endroits de `profil-etudiant-calculs.js` (709, 784, 948, 1002, 1045, 1608 ; l'un d'eux est `obtenirEchelleCommuneDesEvaluations`, cité par #741). `evaluationEntreDansLaNote` existe dans `pratique-sommative.js`, mais ne sert qu'à P. Les `calculerCompletion` de `pratique-sommative.js` et `pratique-configurable.js` ne lisent pas `statutRemise`, alors que `pratique-pan-standards.js` (vers 566) et `snapshots.js` (230, 284) le lisent. Remesure tout cela et nomme ce que la mesure corrige.

## Périmètre

1. UN prédicat « la copie compte » (enregistrée, non remplacée), et UN prédicat « la copie est non remise » (`non-remis` ou `non-recu`), chacun à un seul endroit que tous les lecteurs partagent. Réutilise `evaluationEntreDansLaNote` s'il dit déjà R1, au lieu d'écrire une deuxième règle. Aucune garde par site.
2. Les six filtres `retroactionFinale` sont remplacés par le prédicat de R1. La complétion de SOM et de la pratique configurable passe par les deux prédicats. STD et les snapshots s'alignent sur le même prédicat « non remise », s'ils ne l'utilisent pas déjà.
3. Stock : les snapshots hebdomadaires déjà écrits gardent leur valeur ; TARIR, PAS RÉPARER, à écrire dans le rapport et dans OU-EN-EST-ON. Rien d'autre n'écrit dans les données : ce lot change ce qui est calculé et affiché.

**Hors périmètre** : la note d'un non-remis selon la famille ; les lots C, D, E, F ; les lecteurs dormants de `pratique-pan-standards.js` (`_calculerMoyennesCriteresRecents` vers 946, sans consommateur depuis le retrait de `genererCarteCibleIntervention` ; voir le relais) : ne pas les toucher, les nommer. Toute autre trouvaille reçoit l'une des trois issues, et « inscrire et continuer » est le défaut.

**Mots** : aucun mot neuf attendu. Si un écran doit dire autre chose (par exemple un compte de copies), arrête-toi et propose-le à Grégoire. Propose-lui aussi la phrase de « Nouvelles » avant de la figer.

## Preuve

- Une sentinelle qui exécute les calculs réels sur un élève de banc à quatre travaux : P1 à P3 enregistrés, dont un sans commentaire final ; P4 en brouillon ; puis la variante où P4 est « non-remis » noté 0, et celle où il est « non-recu ». Attendu : note, complétion, IPB, moyennes et palier RàI lisent les trois mêmes copies ; la copie sans commentaire compte ; la complétion est la même sous SOM, sous la pratique configurable et sous STD.
- Break-test : chaque assertion neuve doit rougir sous sa mutation (`retroactionFinale` remis sur un site, brouillon réadmis, `'non-recu'` oublié, complétion qui ignore le statut), site par site. Mutations et résultats dans le rapport. Cowork en posera d'autres à la relecture.
- Les tests existants qui figeaient l'ancienne règle (audit du 5 sept. B-2, B-4, C-7, E-2) passent à la valeur d'après : dis lesquels, et pourquoi chacun.
- Vitest depuis `tests/`, puis le verdict Playwright sur le commit final, Cowork fermé. Porte terrain : aucune attendue, puisque la mise en page ne bouge pas.

## Livraison

Patch `1.142.19` par `scripts/release.mjs`. Puis `OU-EN-EST-ON.md` (avec la phrase « vérifié comment »), `RELAIS.md`, les fiches cochées avec leur disposition (#738 seulement pour le volet complétion : sa case reste ouverte pour la note, écris-le), le lot A marqué livré dans le cadrage, et le markdown du tri, en corrigeant au passage « 229 entrées ouvertes » (lignes 12 et 169) : c'était 227 après le lot B. Push par `scripts/pousser.sh` (916e6dac part avec). Signale à Cowork que le lot est poussé, pour la relecture croisée et l'artefact du tri.
