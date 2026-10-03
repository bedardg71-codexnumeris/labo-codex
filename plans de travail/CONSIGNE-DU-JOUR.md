# Consigne du jour – le bouton « ✓ N pér. » dans la saisie des présences

> Écrite par Cowork le 3 octobre 2026 à 17 h 48 (Toronto, mesurée par `date`). Remplace la consigne de 17 h 39, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-03-bouton-tout-le-monde-present.md`.

## Où on en est

Ta mesure a arrêté « Tout le monde présent (N pér.) » : la colonne passe de 160 à 246 px à 1024 px, et l'en-tête monte à quatre lignes à 768 et 390 px. **Décision de Grégoire** (« oui », 17 h 48), sur la proposition de Cowork : le bouton dit **« ✓ N pér. »** (le nombre lu dans la séance, comme avant), avec l'infobulle **« Mettre tout le monde présent (N périodes) »**. Motif : neutre, aussi court que l'ancien, et en écho au bouton voisin ↻, déjà une icône seule expliquée par son infobulle.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et à pousser. Si le garde de permissions refuse, arrête-toi sur ce seul point et dis-le-lui.

## Ce que tu fais

1. **Commite** les fichiers de Cowork tels quels, et pousse.
2. Sur ta branche `claude/bouton-tout-le-monde-present` : le libellé devient « ✓ ${nombrePeriodesSeance} pér. » ; l'infobulle « Mettre tout le monde présent (N périodes) » est gardée ; l'infobulle de ↻, « Réinitialiser (tout le monde absent) », aussi. **Tranché par Cowork** : un `aria-label` égal à l'infobulle sur les deux boutons, pour que le lecteur d'écran dise la phrase et non « crochet » ; le crochet lui-même `aria-hidden` si la structure le permet simplement. Le gabarit d'`index.html` (« Tous 2h ») suit, pour qu'aucun texte non neutre ne reste dans le code affichable.
3. **Mesure** aux trois largeurs (1024, 768, 390 px), comme tu l'as fait, l'ancien libellé dans la même page. Livre si la colonne ne s'élargit pas de plus de quelques pixels et si l'en-tête ne gagne pas de ligne par rapport à « Tous 2 pér. » ; sinon, arrête-toi et rends la mesure.
4. Vitest complet ; le banc des présences sous WebKit.
5. **Release patch** (1.177.1), ligne des Nouvelles à toi, une phrase (par exemple : « Dans la saisie des présences, le bouton qui met tout le monde présent dit « ✓ » ; son infobulle et le lecteur d'écran disent « Mettre tout le monde présent ». »). Pas de relecture croisée. **Verdict Playwright complet**, puis push et fusion ; constate la mise en ligne chez Netlify (connecteur) et dis l'heure.
6. **Pas de porte.**
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Suite : le lot 2b de #1007, sur une consigne de Cowork.

## Ce que tu rends

À Grégoire, deux lignes : le numéro en ligne et l'heure ; la mesure aux trois largeurs, en une phrase.
