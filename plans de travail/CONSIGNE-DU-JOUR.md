# Consigne du jour – chantier du démo : T2, T4, T7 et les deux gardes restantes (1.186.6)

> Écrite par Cowork le 6 octobre 2026 à 18 h 56 (Toronto, mesurée par `date`). Remplace la consigne du lot 2 de l'enregistrement, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-enregistrement-lot2-livraison.md`.

## Où on en est

1.186.5 est en ligne (`a98d87d6`). Du chantier du démo (`Rapports/AUDIT-2026-10-05-chantier-demo.md`, tableau des T), T1 et T5 sont livrés. Grégoire veut **clore le chantier ce soir**. Ce lot prend tout ce qui ne demande pas d'arbitrage de sa part ; T3 (le retrait des copies, qui supprime) et T6 (le mode d'emploi du pack) viennent ensuite, avec ses décisions G3 et G4.

**Décision de Grégoire, G1 (6 oct., 18 h 55, par Cowork)** : **le codex n'emporte pas le démo.** Ni les clés `demo_*`, ni les fichiers qu'elles référencent. Le démo se réinstalle depuis l'application. Corollaire accepté : **ouvrir un codex ne touche plus le démo** (un ancien codex qui porte des clés `demo_*` ne les écrit pas).

Mesuré par Cowork à `bfe1f565` : `genererCodex` (`js/codex.js:371`) ne filtre que `_codex_` (`clesFiltrees`, ~l. 391), et `_clesDesListesDeFichiers` (~l. 346) reconnaît `demo_` comme préfixe de trimestre : les copies du démo entrent dans le codex. Le reste de l'audit est à remesurer avant d'écrire (les numéros de ligne ont bougé).

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork** (PROTOCOLE.md, règle 2).

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive.
2. **T2 – le codex exclut le démo.** À l'écriture : aucune clé `demo_*`, aucun fichier référencé par `demo_fichiersTravaux`, `demo_corbeilleFichiers`, `demo_annotationsTravaux`, ni leurs `thumbnail_<id>` (précision C4 de l'audit). Sélection **par identité** (ids des listes `demo_`), jamais par drapeau ; une copie réelle qui partagerait un id est un cas à mesurer, pas à supposer (skill `hygiene-donnees-partagees`). À l'ouverture : les clés `demo_*` d'un ancien codex ne sont pas écrites, et le démo installé reste tel quel ; le bilan d'ouverture ne les compte pas comme perdues. Banc : un `demo_fichiersTravaux` non vide et une copie réelle côte à côte ; le codex porte la réelle, pas celle du démo ; mutation sur le filtre → rouge.
3. **T4 – importer en démo avec un dossier sur disque branché (FSAPI).** Les copies du démo s'écriraient dans le dossier réel de Grégoire (`travaux-stockage.js`, `stockerBlob`). Choix technique laissé à toi entre refuser et écrire en IndexedDB seulement ; ce qui compte : **rien du démo n'entre dans son dossier réel**. Nomme ta supposition en une ligne.
4. **T7 – quitter le démo pendant un import.** Bloquer « Quitter la démo » (et le décochage de l'accueil) tant que `importEnCours` est vrai (`travaux-import.js`), avec un avis ; à défaut, figer la clé de destination au début de l'import. Mécanique de #340, transposée aux copies.
5. **Les deux gardes sans cible (relecture de 1.186.5, SUIVI-BUGS sous #1034, point b)** : `pratiques-gestion.js` (~l. 1550, échelle d'une pratique) et `trimestre-v2-groupes-cours.js` (~l. 708, horaire ; retire au passage le double préfixe `cle('horaires')`) passent `{ cible }`. Mesure d'abord que le refus se produit bien en démo ; s'il ne se produit pas, inscris-le et ne touche à rien.
6. **Mots d'écran** (avis de T4 et de T7) : propose-les dans ton rapport, à part, en une phrase chacun. Ils remontent à Grégoire par Cowork à la relecture.
7. Tests : bancs neufs avec break-test, specs voisins (codex, import, démo), Vitest complet. Noms manifestement fictifs dans tout banc.
8. **Release 1.186.6** par `scripts/release.mjs`, commits séparés par T, relais écrit. Puis arrête-toi : relecture de Cowork, verdict, push.

## Hors lot

T3 et T6 (décisions G3, G4 de Grégoire) ; #1035 (mesure des 30 copies dans `demo_fichiersTravaux`) ; le stock de #1034 au réel ; #1033.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Ce qui reste à vérifier à l'écran, s'il y a lieu, en une ligne.
