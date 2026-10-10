# Consigne du jour – la file sans Grégoire, lot 4 : rien ne se perd en silence

> Écrite par Cowork le 10 octobre 2026 à 15 h 19 (Toronto, mesurée par `date`). Remplace la consigne de la release du lot 3, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-10-lot3-release.md`. Tu peux commiter ce fichier avec ton premier commit.

## Où on en est

1.196.0 est en ligne (Netlify `6aca8026`, `9588f5b2`, 14 h 13 ; verdict complet vert au second passage). Le passage Playwright de nuit est retiré (#1048, `fd1338a1`) : le verdict au navigateur est celui du Mac. Inscrites au lot 3, hors file pour l'instant : #1046, #1047.

## La règle (rappel)

« Sans Grégoire » : aucune décision de pédagogie, aucune écriture dans des données déjà écrites chez l'utilisateur (on tarit la source ; le stock s'écrit et s'assume), aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), aucune suppression définitive de données d'utilisateur. Seule la ligne des Nouvelles revient à Grégoire, par Cowork.

## La file (inchangée)

1 à 3 en ligne. **4. Rien ne se perd en silence ← CE LOT.** 5. La mémoire sur l'iPad (#991, #996, #1025 ; #995 après sa sonde Chromium). 6. Les nombres qui disent faux (#925, #726, #727, #728). Ne prends pas d'avance.

## Lot 4 – ce qu'il fait

**Mesure d'abord**, écrite dans la demande de relecture. Les trois fiches sont indépendantes : un commit chacune.

1. **#845 – une clé supprimée continue d'être lue.** `db.remove()` (`js/db.js`) vide IndexedDB et localStorage, pas `memoryCache` ; `removeSync` fait les trois. Mesure : la liste de tous les appelants de `db.remove()`, et pour chacun s'il relit la clé dans la même session (et ce que l'usager voit alors). Correctif : `remove()` invalide le cache, comme `removeSync`. Banc avec break-test, sous IndexedDB simulé (le faux-vert de #522 : en mode localStorage seul, la fenêtre n'existe pas ; et la fausse connexion doit **cloner**, patron `sentinelle-522-lot4-bibliotheques-serialisees`). Si un appelant a eu une conséquence visible, écris-la ; ne répare rien dans les données.
2. **#938 – rouvrir une pratique par l'assistant perd ses jetons.** `sauvegarderPratique` (`wizard-pratique-v2.js`) reconstruit l'objet et ne recopie que `inspireDe`, `estMaquette`, `metadata_cc`, `isDemo` : le bloc `jetons` réglé au formulaire de gestion part au premier enregistrement. Mesure d'abord : **tout** ce que l'assistant jette ainsi (pas seulement `jetons` : compare les clés d'une pratique réglée au formulaire avant et après un passage par l'assistant), et si l'assistant a lui-même des champs de jetons (alors : lequel l'emporte, et pourquoi). Correctif : l'assistant garde ce qu'il n'édite pas. S'il édite un champ, sa valeur l'emporte ; sinon, la valeur en place reste. Le banc existant (`audit-pratiques-notation-config-2026-09-16.test.js`, bloc « lot N6 », essai « standards · … 80,95 ») compare en **excluant** `jetons` : retire l'exclusion, il doit rougir sur l'ancien code. **Stock** : les pratiques déjà rééditées ont perdu leur bloc, sans réparation, assumé et écrit.
3. **#522 – deux enregistrements rapprochés : le reste du lot 5.** **Remesure d'abord** avec `scripts/mesurer-522.py` : les chiffres de la fiche datent du 30 août, et chaque lot a été sous-compté (35 à 93 %). Traite **seulement les sites déclenchés par un geste de l'usager** (la fiche en nommait ~13 : `cours.js`, `cartouches.js` copie entre trimestres, `cc-license.js`, `snapshots.js` capture, `donnees-v2.js`, `reserve-ouvrir.js`, `codex.js` fusion de travaux, `echelles.js` migration d'évaluations), par `db.modifier`, au patron des lots 1 à 4. Les drapeaux de migration au démarrage : mesure-les un par un et écris lesquels tournent seulement au démarrage ; ne les convertis pas en bloc. Le faux positif nommé (`reinitialiserEtudiantsV2`) ne se touche pas. Si le reste dépasse un lot raisonnable, coupe : livre les gestes de l'usager, inscris le reste dans la fiche avec la mesure, et dis-le.
   - Pour `donnees-v2.js` (suppression définitive) : la conversion ne change **que** la sérialisation, jamais ce qui est supprimé ni quand. Si elle demande davantage, arrête-toi sur ce site et écris pourquoi.

**Aucun mot d'écran changé.** Si un message neuf est nécessaire, écris-le dans le code et cite-le : Cowork le relit, Grégoire le tranche.

## Tests

Chaque correctif a son banc, avec break-test, sous IndexedDB simulé qui clone. `js/db.js` est sous les règles de sécurité : suite complète (`cd tests && npm test`) avant la release, Chrome, Safari et Cowork fermés, sur le commit de release. Noms manifestement fictifs.

## Puis arrête-toi

Commits séparés, en local. Demande de relecture dans `plans de travail/DEMANDE-RELECTURE-2026-10-10-lot4-rien-ne-se-perd.md`. Rapport à Grégoire en gestes d'utilisateur (numéros entre parenthèses en fin de ligne), une ligne par supposition, ta proposition de titre et de ligne des Nouvelles. **Pas de release avant la relecture de Cowork.**
