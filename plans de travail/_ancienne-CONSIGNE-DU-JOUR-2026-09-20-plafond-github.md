# Consigne suivante – GitHub rend de nouveau un verdict (plafond du job WebKit)

> Écrite le 20 septembre 2026, 16 h 27 (Toronto), par Cowork. **Décision de Grégoire, 20 sept. en fin d'après-midi** : monter le plafond à **60 minutes**, et remesurer la durée réelle sur trois runs avant de rediscuter du chiffre. Motif retenu : un run annulé à 40 min facture 40 minutes et n'achète aucun verdict.
> **Condition de départ** : `git --no-optional-locks log origin/main` porte 1.151.4 (`a305f524`) ou plus récent, et le commit de relais `8abdd4fc` part avec ce lot. Aucune autre session n'écrit dans `js/`.
> **Archive** : la consigne précédente est rangée par Cowork sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-20-aide-exporter-archiver.md`. Les deux fichiers vont au commit.
> ⛔ **Rien dans `js/` ne change** : aucune release, aucune entrée de « Nouvelles », rien à l'écran.

---

## 1 · Pourquoi

Le job `playwright` de `.github/workflows/tests.yml` porte `timeout-minutes: 40` (l. 232), posé le 2 septembre par **projection** – 239 specs × 7 s + 3 min ≈ 31 min, plus un tiers de marge – et le commentaire du fichier dit lui-même : « si un run réel la dépasse, on le dit ». C'est arrivé : deux runs annulés aujourd'hui à 40 min 17 s (`efa185c1` et `ee2669f9`), pas par un push concurrent. Depuis, la suite a grossi.

## 2 · Ce qui est attendu

1. **`timeout-minutes: 60`** sur le job `playwright`, et **le commentaire d'en-tête mis à jour** : la mesure du 20 septembre (deux annulations à 40 min), la décision de Grégoire, et la règle qui tient toujours – le plafond se déplace sur une mesure, il ne disparaît pas.
2. **Mesurer la durée réelle** des trois prochains runs complets du job (`gh run list`, `gh run view`) et l'inscrire dans le commentaire du workflow : durée, SHA, nombre de specs. Si un run conclut à 45 min, c'est le chiffre à garder en tête pour la prochaine décision ; s'il frôle 60, dis-le à Grégoire, ne remonte pas le plafond.
3. **Vérifier le cliquet** `tests/unit/sentinelle-ci-paths-ignore.test.js` : s'il fige le chiffre 40, le mettre à 60 dans le même commit ; sinon dire qu'il ne le voit pas.
4. **Dire si le job `vitest` (plafond 15) approche le sien** : simple mesure, aucune modification sans mot de Grégoire.

## 3 · Arrêts

- Si la mesure montre que le dépassement vient d'une spec qui s'est mise à durer (et non de la croissance régulière de la suite) : arrête-toi, nomme-la, et ne monte rien. Le plafond n'est pas le remède à une spec qui s'emballe.
- ⛔ Pas de shards (écartés par Grégoire : ils raccourcissent l'attente, pas la facture). Pas d'exclusion, pas de `retries`.

## 4 · Preuve

- Le premier run complet après ce commit **conclut** : vert ou rouge, mais lu, avec sa durée inscrite au relais.
- ⚠ Rappel mesuré ce matin par toi : un nouveau push annule le run en cours. Ce commit part seul, et on lit son run avant d'en pousser un autre.
