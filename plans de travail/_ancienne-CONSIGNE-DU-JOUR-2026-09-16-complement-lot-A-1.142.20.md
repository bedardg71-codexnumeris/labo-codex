# Consigne du jour – complément du lot A : le rapport compte les mêmes productions que la complétion (1.142.20)

> Écrite le 16 septembre 2026, 20 h 00 (Toronto), sur `db117dce` (`1.142.19` en ligne), à la suite de la relecture croisée de Cowork (`RELAIS.md`, ajout de 19 h 56).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-16-lot-A-memes-copies-partout.md`.

Mandat (proposé par Cowork le 16 sept. 2026 à 20 h, relayé par Grégoire) : compléter le lot A des règles du dépistage (1.142.19). La relecture croisée de Cowork a trouvé un endroit que le lot a laissé à moitié, et cinq lecteurs que la sentinelle ne juge que par leur texte. Aucun mot neuf, aucune question de didactique.

## 1 · Le défaut à corriger (prouvé par exécution)

`genererRapportAPI` (`js/profil-etudiant-rapport.js`, lignes 78 à 80) calcule son dénominateur `productionsComptees` avec l'ancienne règle (`!e.remplaceeParId && e.noteFinale != null`), alors que la complétion sommative lit désormais `evaluationEntreDansLaNote`. Dans le banc de la sentinelle du lot A, avec P4 en brouillon pour les DEUX élèves, la complétion vaut 100 et le rapport écrit « Complétion : 100% (3 remises / 4 productions) ». Avant 1.142.19, les deux disaient 4. Cowork a posé la correction d'une ligne (`compteDansLaNote(e)`) dans un clone : le rapport écrit « 3 remises / 3 productions », Vitest 579 / 6 489 vert.
Retire aussi le repli de `compteDansLaNote` (`typeof evaluationEntreDansLaNote === 'function' ? … : ancienne règle`) : la ligne suivante appelle déjà `window.evaluationNonRemise` sans garde, et le lot A a posé « aucune garde par site ». Une seule règle, sans copie de secours.

## 2 · La preuve qui manque : cinq lecteurs jugés seulement par le texte

Cowork a posé cinq mutations qui gardent le texte exigé par l'essai D3 et changent le comportement. **Toutes les cinq survivent à la suite unitaire entière** (579 / 6 489 vert sous chacune) :
- K1 · « (sur N) » du profil (`sections-affichage`, `evaluationsDA`) : `(window.evaluationEntreDansLaNote(e) || (e.noteFinale != null && !e.remplaceeParId))` — un brouillon y rentre ;
- K2 · directions (`calculerDirectionsCriteres`) : `(window.evaluationEntreDansLaNote(e) || !e.remplaceeParId) &&` — un brouillon y rentre ;
- K3 · `nbRemis` du rapport : `… && !window.evaluationNonRemise(e) || (e.etudiantDA === da && e.productionId === p.id && e.noteFinale != null)` — un non-remis noté y rentre ;
- K4 et K5 · dénominateur de la complétion, SOM puis configurable (`productionsEvaluees`) : `(window.evaluationEntreDansLaNote(e) || e.noteFinale != null)` — une production que seuls des brouillons touchent y rentre.
Ajoute à la sentinelle du lot A des essais de COMPORTEMENT qui rougissent sous chacune : la variante « P4 en brouillon pour les deux élèves » (dénominateur SOM et configurable = 3 ; rapport « 3 remises / 3 productions ») ; le « (sur N) » vaut 3 avec P4 en brouillon ; les directions ne lisent pas P4 en brouillon ; `nbRemis` vaut 3 avec P4 « non-recu » noté 0. Repose K1 à K5 et le défaut du point 1, et rapporte les rouges, mutation par mutation. Garde D3.

## 3 · À mesurer, pas à corriger d'office

- `js/profil-etudiant-sections-affichage.js:2864` (détail de la note hybride sans terminale, colonne des obligatoires) lit `noteFinale != null` sans le verrou : un brouillon d'obligatoire s'y affiche-t-il comme une note comptée ? Mesure, puis donne l'une des trois issues (« inscrire et continuer » par défaut).
- ⛔ **Ne touche pas** `SignalementDepistage._evaluationActive` (`js/entites/signalement-depistage.js:45`) : il ne lit pas le verrou, donc une copie en brouillon lève un signalement. La règle du lot dit « nulle part », mais la page des questions ne montrait pas ce cas : Cowork pose la question à Grégoire. Rappel : la sentinelle #790 interdit d'y appliquer le filtre des quatre portes (productions diagnostiques).

## Livraison

Patch `1.142.20` par `scripts/release.mjs`. La phrase de « Nouvelles » de 1.142.19 n'est pas encore validée : propose à Grégoire UNE phrase qui couvre les deux patchs, avant de la figer. `RELAIS.md` (réponse à l'ajout de Cowork de 19 h 56), `OU-EN-EST-ON.md` (phrase « vérifié comment »). Aucune fiche neuve attendue. Vitest depuis `tests/`, puis le verdict Playwright sur le commit final, Cowork fermé. Aucune porte terrain. Commite aussi les fichiers de Cowork : `CONSIGNE-DEMARRAGE-COWORK.md`, `RELAIS.md` (ajout de 19 h 56), `plans de travail/CONSIGNE-DU-JOUR.md`, et trois archives `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-16-16h31.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-16-652-890-ouvrir-une-copie.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-16-lot-A-memes-copies-partout.md`. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
