# Relecture croisée, après coup – #950 (1.159.8)

> Écrite le 25 septembre 2026, vers 15 h 20 (Toronto), par Cowork. Objet relu : `2e8f639e` (fusion de #950, 1.159.8, livrée à la demande de Grégoire avant cette relecture et éprouvée par lui en ligne : « Ça fonctionne »).

## Verdict : VERT, sans retouche. Aucune nouvelle version nécessaire.

## Comment j'ai relu (par exécution)

- Copie `git archive` de `2e8f639e`, exécutée dans mon conteneur : `sentinelle-950` (6) et `sentinelle-948` (13), **19 / 19 verts**. Les deux `console.error` « Blob introuvable » du banc sont attendus (chemin d'échec éprouvé, DA fictif).
- Lu : `construireStudent` n'a qu'un lecteur de `s.da` (`renderHeader`) ; en anonymisation, la page d'en-tête reçoit le nom anonyme, aucun DA, le groupe sans « Gr. » doublé. `exporterPourLea` réutilise `_libelleEleve` de #948, pas une troisième règle.

## Mes mutations (différentes des tiennes), une à la fois, fichiers restaurés (`cmp` identiques)

| | Mutation | Résultat | Lecture |
|---|---|---|---|
| V1 | nom du PDF anonyme bâti sur le nom de famille (le « Inconnu_… » d'avant, sans DA) | rouge (1) | |
| V2 | les commentaires des critères de la page de synthèse ne passent plus par `anonymiserTexteRetroaction` | vert sur les bancs #948 et #950, **rouge sur `sentinelle-566`** | Hors du lot, mais c'est ce que le PDF Léa imprime : déjà gardé par #566. Rien à ajouter. |

## Ce qui reste hors code, pour Grégoire

Supprimer de Téléchargements l'archive exportée ce matin et le PDF « Inconnu_… » : ils portent les vrais noms et DA.
