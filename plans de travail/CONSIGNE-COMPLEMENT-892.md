# Complément au lot #892 – un trou de preuve, avant le push

> Écrit le 20 septembre 2026, 19 h 54 (Toronto), par Cowork, après la relecture croisée de `9d9ddb71` (1.151.6, commitée, non poussée). **Relecture : verte par exécution sur le code, un trou de preuve à fermer.** Aucun changement de comportement attendu : un essai de plus, puis le push avec la ligne de « Nouvelles ».

## Ce que la relecture a fait

Clone de `d47d2a8c`, sentinelle `sentinelle-892-nettoyage-sans-perte` seule, cinq mutations de Cowork, différentes des tiennes :

| Mutation | Résultat |
|---|---|
| garde « annotée après l'export » neutralisée | rouge (2) |
| garde de l'écrivain (`permis.has`) neutralisée | rouge (3) |
| borne ramenée au 1er septembre | rouge (3) |
| `dateExport` illisible acceptée | rouge (4) |
| **test `blobStatut !== 'exporte'` retiré** | **VERTE – 16/16** |

## Pourquoi la survivante compte

`js/travaux-import.js` ≈ l. 1613 : re-déposer une copie remet `blobStatut = 'present'` **sans effacer `dateExport`**. Une copie exportée PUIS re-déposée porte donc une date d'export et un fichier NEUF, jamais sorti. Aujourd'hui seul le test du statut l'écarte, et aucun essai ne le dit : un refactor qui le retirerait proposerait ce fichier neuf au retrait – perte irréversible, la limite posée par Grégoire. Même chose pour une copie `'manquant'` qui garde sa date.

## Ce qui est attendu

1. Deux essais de COMPORTEMENT dans la sentinelle : une copie `present` avec une `dateExport` d'hier, et une `manquant` avec une `dateExport` d'hier → ni l'une ni l'autre n'est proposée, et `nettoyerFichiersArchives` appelé avec leurs ids ne les efface pas.
2. Reposer la mutation « test du statut retiré » : elle doit rougir. Restaurer à l'empreinte.
3. Aucun code d'application ne change, aucune nouvelle version : le commit part avec 1.151.6.
4. Puis la ligne de « Nouvelles » (validée par Grégoire si son relais le dit), puis le push.
