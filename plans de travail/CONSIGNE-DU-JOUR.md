# Consigne du jour – un bouton neutre dans la saisie des présences

> Écrite par Cowork le 3 octobre 2026 à 17 h 39 (Toronto, mesurée par `date`). Remplace la consigne de 11 h 25, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-03-1007-2a-2-release-1.177.0.md`.

## Où on en est

1.177.0 est en ligne ; **la porte de Grégoire est passée** à 17 h 36 (relevé : douze rangées cochées, aucun échec ; les deux préalables non cochés sont faits de fait, la suite en dépend). Sa remarque à la rangée 1.5 : le bouton « Tous 2 pér. » n'est pas neutre. Mesuré par Cowork : le nombre vient de `nombrePeriodesSeance` (`js/saisie-presences.js`, l. 1624), pas codé en dur ; seul le mot l'est.

**Décision de Grégoire** (« oui », 17 h 39), sur la proposition de Cowork : le bouton dit **« Tout le monde présent (N pér.) »**. Motif : neutre sans point médian, et en écho à la question existante « Mettre tout le monde absent et vider les notes de cette séance ? ».

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et à pousser. Si le garde de permissions refuse, arrête-toi sur ce seul point et dis-le-lui.

## Ce que tu fais

1. **Commite** les fichiers de Cowork tels quels, et pousse.
2. **Le bouton** (`js/saisie-presences.js`, l. 1624) : « Tout le monde présent (${nombrePeriodesSeance} pér.) ». **Tranché par Cowork, même décision appliquée aux infobulles du même endroit** : « Mettre tout le monde présent (N périodes) » et « Réinitialiser (tout le monde absent) ». Cherche toute autre occurrence affichée de « tous présents » / « tous absents » (grep, textes à l'écran seulement, pas les commentaires) et rends-en la liste : ne la change pas sans Cowork.
3. **La largeur** : le bouton est `btn-tres-compact`, et le texte est plus long. Mesure-le à 1024 px (iPad en paysage), 768 px et 390 px. S'il déborde ou casse l'en-tête de colonne, **arrête-toi** et rends la mesure : la forme courte reviendrait à Grégoire.
4. **Les essais** qui citent l'ancien libellé suivent. Vitest complet ; le banc des présences sous WebKit.
5. **Release patch** (1.177.1), ligne des Nouvelles à toi, une phrase, sur le modèle : « Dans la saisie des présences, le bouton dit « Tout le monde présent ». » Pas de relecture croisée (des mots, rien d'écrit dans les données). **Verdict Playwright complet**, puis push ; constate la mise en ligne chez Netlify (connecteur) et dis l'heure.
6. **Pas de porte** : Grégoire le verra en usage.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Suite : le lot 2b de #1007 (les lignes d'éditeur qui portent des notes), sur une consigne de Cowork.

## Ce que tu rends

À Grégoire, deux lignes : le numéro en ligne et l'heure ; la liste des autres « tous présents / tous absents » trouvés, s'il y en a.
