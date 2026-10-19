# Consigne – brancher la vérification complète sur GitHub : la fusion

> Écrite par Cowork le lundi 19 octobre 2026 à 13 h 40 (Toronto, mesuré par `date`). Proposé par Cowork à 13 h 29 (« juste après le lot 13 ») ; Grégoire, 13 h 37 : « Ensuite prépare la consigne pour le lancement ». Le lot 13 est relu et accepté (`VERDICT-RELECTURE-2026-10-19-lot-13-modifier-les-reponses.md`). Le chantier : `CONSIGNE-2026-10-16-verdict-sur-github.md` ; la branche `ci/verdict-morceaux-2` (`fb20d986`), relue par Cowork le 17 : accord sur le contenu (`VERDICT-RELECTURE-2026-10-17-verdict-sur-github.md`, dont la date du « mardi » a glissé à aujourd'hui, après la rencontre). Règles 2, 7 et 8 de `PROTOCOLE.md`.

## Ce que ça change pour Grégoire

Une fois poussée, la vérification complète tourne chez GitHub, en seize morceaux, à chaque push qui touche l'application, et à la demande depuis son téléphone (Actions ▸ Tests ▸ Run workflow). Ce soir, le juge du push sur le Mac reste celui d'aujourd'hui.

## Temps A – maintenant

0. `main` est à `4d029ac1` (lot 13, accepté), non poussé. **Ne pousse rien.**
1. **Deux fichiers non suivis bloqueraient la fusion** : `CONSIGNE-2026-10-16-verdict-sur-github.md` et `DEMANDE-RELECTURE-2026-10-16-verdict-sur-github.md`, dans `plans de travail/`. Mesuré par Cowork : identiques octet pour octet à ceux de la branche. Retire les copies non suivies ; la fusion les ramène.
2. **Fusionne `origin/ci/verdict-morceaux-2` dans `main`** : un commit de fusion, pas de rebase (les commits de la branche ont été relus tels quels). Mesuré par Cowork : depuis la base commune (`eb6dd86e`), `main` n'a touché aucun fichier du lot sauf `BACKLOG.md` ; seuls conflits attendus, la ligne « Dernier ID utilisé » et la fiche #1090.
3. **Ce que le verdict du 17 demandait à la fusion**, points 1 et 2 :
   - **#1090 en double** : la fiche Dependabot de la branche prend le premier numéro libre (#1111 à l'écriture ; remesure) ; la ligne « Dernier ID utilisé » le dit ; le #1090 de `main` (la grille partagée sans son échelle) garde le sien.
   - **#1094** : clos, en renvoyant au verdict du 17 (c'est le comportement voulu).
   - Le point 4 (la branche locale `ci/verdict-morceaux` et son worktree) **n'est pas de ce lot** : il attend Grégoire (#1093).
4. **Le juge du Mac n'a pas changé** : la fusion modifie `scripts/verifier-playwright.mjs`, que `pousser.sh` appelle. Si le script permet de rejuger le rapport du dernier verdict complet (`22062197`, 10 h 25) sans relancer la suite, fais-le avec l'ancien et le nouveau : même liste de rouges, même code de sortie. Sinon, dis-le : le contrôle se fera au verdict de ce soir.
5. **Ne touche** ni au crochet pré-push, ni à `pousser.sh`, ni au rituel du soir (consigne du 16, point 4).
6. **Vitest complet**, depuis `tests/` : vert, sentinelles CI comprises.

## Livrer

Le commit de fusion, avec : cette consigne, la consigne du jour et son archive, `VERDICT-RELECTURE-2026-10-19-lot-13-modifier-les-reponses.md` et `VERDICT-RELECTURE-2026-10-17-verdict-sur-github.md` (non suivi, absent de la branche). La demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-fusion-verdict-github.md` : les conflits et leur résolution, les numéros, le résultat du point 4. **Puis arrête-toi** : pas de verdict complet, pas de push.

## Temps B – ce soir (consigne à venir)

Cowork l'écrira à la fin de la journée de Grégoire : la version du soir (le lot 13, avec ses textes et l'entrée des Nouvelles validés par Grégoire), le verdict du Mac (Cowork fermé), le push, qui lancera la première vérification complète chez GitHub, puis le point 5 du mandat du 16 : les deux listes de rouges, celle du Mac identique à celle de 10 h 25, et une recommandation.
