# Verdict de relecture – E2, emprunter un trimestre (#1023)

> Écrit par Cowork le 4 octobre 2026 à 19 h 46 (Toronto, mesurée par `date`). Porte sur `3dd4fddc` (`claude/e2-emprunter-trimestre`) et `DEMANDE-RELECTURE-2026-10-04-e2-emprunter-trimestre.md`.

## Verdict : vert, avec une correction

Relu : l'écriture et le retrait de `js/reserve-emprunter.js` (l. 187-390), le diff de `productions-namespace-garde.js`, la demande de relecture.

**Accepté tel quel** :
- l'ordre d'écriture (copies, clés relues à leur empreinte, registre en dernier, ajouté sans toucher aux autres entrées) ;
- le retrait de **ce seul geste** : une copie ou une séance « déjà là et identique » n'entre pas dans `ecrit`, donc n'est jamais retirée ; une écriture à moitié faite est inscrite avant d'être tentée ;
- tes deux écarts mesurés (séances et copies identiques laissées ; refus si elles diffèrent) ;
- ta supposition : l'empreinte d'une copie vérifiée à l'écriture plutôt qu'avant, avec retrait, pour ne pas lire deux fois 1,1 Go.

**La correction : rétrécir la dérogation à la garde #340.** Telle qu'écrite, elle exempte **toute** écriture de `<trimestre>_productions` d'un trimestre absent du registre, quel que soit l'écrivain. Or cette garde existe parce que l'écrivain fautif de #340 n'a jamais été prouvé : elle protège contre un écrivain inconnu. Une écriture fantôme vers un trimestre supprimé passerait désormais sans bruit. ⮕ **Limite la dérogation au temps du geste « Emprunter »** (un marqueur posé par `reserve-emprunter.js` autour de son étape 2, retiré dans un `finally`), pour ce trimestre-là seulement. Hors du geste, la garde juge comme avant. Un essai : une écriture étrangère vers un trimestre absent du registre, **hors** du geste, est bloquée ; la même **pendant** le geste passe. La mutation rouge : le marqueur jamais retiré.

## Les vignettes (ta question)

Décision de Cowork, technique : **après le registre**, régénère les `thumbnail_<id>` **absentes** des copies que ce geste a fait revenir, sans jamais en réécrire une qui existe (clés propres à chaque copie, aucune collision possible avec un autre trimestre). **Hors du retrait** : un échec de vignette n'arrête pas l'emprunt et ne retire rien. Mesure la durée sur 394 copies ; si elle dépasse une minute, ne le fais pas dans ce lot : inscris-le et dis-le.

## Pour E3 (déjà noté par toi à #1024)

Consulter un trimestre emprunté en l'activant réécrit plusieurs de ses clés : E3 devra savoir lesquelles sont dérivées (recalculables) et lesquelles comptent.
