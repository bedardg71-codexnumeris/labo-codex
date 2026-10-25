# Verdict de relecture – deux noms d'étudiant·es réel·les retirés des fichiers actuels

> ⚠ **Correction du 24 oct. 2026, 19 h 18 : la prémisse de ce lot était fausse.** Grégoire : « Je n'ai ni élève [nom 1] ni [nom 2] ». Les deux noms n'étaient pas ceux d'étudiant·es réel·les ; Cowork avait cru le commentaire de tête de `sentinelle-603-604` (« Mesuré sur l'import réel de Grégoire […] Deux élèves — … ») sans le lui demander. Aucune donnée n'était exposée. Le remplacement par des noms fictifs reste (sans effet) ; la sentinelle qui les interdit est retirée (`CONSIGNE-LOT-2026-10-24-correction-noms-fictifs.md`).


> Relu par Cowork (session dans le nuage) le samedi 24 octobre 2026 à 19 h 14 (Toronto), sur `main` = `cac1465d`. Demande : `DEMANDE-RELECTURE-2026-10-24-noms-reels-tests.md`.

## Verdict : accepté

## Vérifié par Cowork

- Le nom 1 ne paraît plus dans aucun fichier suivi (`git grep -i` : 0 fichier).
- Le nom 2 ne paraît plus que dans les quatre citations du rapport de l'autrice homonyme (`index.html`, `js/pratiques/construction-attributs.js`, `BACKLOG.md`, `OU-EN-EST-ON.md`), inchangées.
- Aucune ligne ajoutée par le commit ne porte l'un des deux noms ; le message de commit non plus.
- Douze fichiers touchés, aucun dans `js/` : pas de jeton à mettre à jour.

## Ce qui reste ouvert

- **L'historique** du dépôt public garde les deux noms (le nom 1 dans 9 commits, du 7 sept. au 6 oct. ; le nom 2 dans 4, dont un pour l'autrice). **Décision de Grégoire (24 oct., 19 h 16) : « on ne recommence pas ce processus de purge ».** L'historique reste tel quel ; la sentinelle protège l'arbre actuel.
- **`tests/unit/export-resultats-finaux-333.test.js`, l. 49-51** : trois noms de famille dont on ignore s'ils sont fictifs (les DA, 9000113 à 9000115, le sont). **Réponse de Grégoire (24 oct., 19 h 14) : « les trois noms sont fictifs ».** Rien à faire.
- La limite de la sentinelle (un nom ajouté seulement sous `plans de travail/` n'est vu qu'au prochain Vitest, pas par la CI de ce commit) : notée, sans suite ; Vitest tourne avant chaque push.
