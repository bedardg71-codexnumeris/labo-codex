# Verdict de relecture – Les calculs, lot 4c (étape 4 du plan du 21 oct., dernier lot)

> Cowork, mardi 27 octobre 2026, 11 h 59 (Toronto, mesuré par `date`). Relu : `fdd705b2` (les retouches de 4b), `21cf7a84` (20 fichiers), `f227dfb5` ; la demande de relecture ; dans `evaluation-enonces.js` `remplirCalculs` (un jeton de calcul vide ou orphelin part avec son espace ; un texte sans jeton rendu à l'octet). `main` = `63494c9a`, non poussé.

## Verdict : accepté, sans retouche. L'étape 4 est faite.

Un calcul pour les phrases n'entre jamais dans la note ; sa valeur sort de l'évaluateur de 4a ; la phrase enregistrée la porte, et le PDF lit la base. Les retouches de 4b sont faites, chacune avec son essai et son break-test.

- **§ 2.1 à 2.3** : acceptés (le critère passé à `reperesDeZone` est le lot qui se termine, pas une trouvaille).
- **§ 3.1 à 3.4** : acceptées ; les copies de référence 2 et 8 sans limite, la tolérance et 4 × la tolérance avec, conviennent ; le signe moins typographique est celui de la ligne du calcul.
- **La spec instable `comptes-erreurs-stock-1142`** (l'espion des écritures voit celles du démarrage) : *inscrire et continuer*, rattachée à #1114 avec les autres instables, sans fiche neuve.
