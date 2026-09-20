# Consigne en attente – la zone « Non planifié » est toujours là (rapport de Grégoire, 20 sept., 8 h 51)

> Écrite le 20 septembre 2026, 9 h 14 (Toronto), par Cowork. **En attente** : elle part APRÈS le lot du verdict GitHub (`CONSIGNE-DU-JOUR.md`), en cours à l'écriture. Au départ : archive `CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-20-filet-github.md`, puis renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> **Condition de départ** : `git --no-optional-locks log origin/main` porte le push du lot GitHub. Aucune autre session n'écrit dans `js/`.
> **Identifiant** : relis « Dernier ID utilisé » (#928 à l'écriture) et `grep` les deux registres ; la fiche va dans `Retours des testeurs/SUIVI-BUGS.md`, comme #926 à #928.
> **Décision de Grégoire, 20 sept. vers 9 h 10** : « Zone toujours là ». Ligne à poser sous la fiche : « TRANCHÉ par Grégoire le 20 sept. 2026 : la zone « Non planifié » s'affiche même vide, avec la phrase « Glisse ici une leçon pour la retirer du calendrier. » ».

---

## 1 · Le rapport

`BUG_grégoire_2026-09-20_08-51-41.txt`, 1.151.0, Chrome/Mac, Alignement pédagogique › carte : « Le planificateur n'affiche pas les deux modes de présentation (vertical et horizontal). Le glyphe pivote quand on clique dessus, mais le panneau demeure inchangé. » Dix clics sur `#planif-btn-disposition-reserve` dans le journal. Ses captures : grille des semaines 1 à 15, **aucune zone « Non planifié »**.

## 2 · Mesuré par Cowork (lecture du code, pas à l'écran) – à remesurer

- `js/planification-carte.js` : `zoneReserve` vaut `''` quand `nonPlanifie` est vide (≈ l. 10035). Le bouton bascule la préférence, fait pivoter le glyphe, et n'a rien à déplacer : défaut muet.
- Cette zone est la **seule** cible `data-grille-semaine=""` (« déposer ici = désancrer », ≈ l. 9714). Inférence à vérifier : quand tout est planifié, aucune leçon ne peut plus être retirée du calendrier par le glisser.
- `tests/unit/sentinelle-disposition-reserve.test.js:183` affirme « sans rien en réserve, aucune colonne vide n'est fabriquée » : **c'était une décision, que Grégoire renverse**. Réécris cet essai dans l'autre sens, en le disant dans le rapport.

## 3 · Ce qui est attendu

1. La zone se rend toujours, sous la grille ou en colonne à gauche selon la préférence, avec son titre « Non planifié » ; vide, elle porte la phrase **« Glisse ici une leçon pour la retirer du calendrier. »** (mots validés, ne pas les changer). Même balisage vide ou pleine (`data-grille-semaine=""`) : le dépôt ne doit pas connaître l'état.
2. Le bouton ◧ déplace donc toujours quelque chose de visible.
3. Vérifie que la colonne vide à gauche garde une largeur lisible (`LARGEUR_RESERVE_COLONNE`) et que la phrase ne déborde pas à 768 px.

## 4 · Arrêts

- Si retirer une leçon du calendrier par glisser sur la zone vide écrit autre chose que ce qu'écrit le même geste sur la zone pleine : arrête-toi.
- Aucune donnée réécrite ; la préférence `planifReserveDisposition` ne change pas de format.

## 5 · Preuve

- Sentinelle réécrite : zone vide rendue dans les deux dispositions, avec la phrase ; mutation « retour au `''` quand vide » rouge.
- Banc WebKit par le vrai geste : un trimestre où tout est planifié → la zone vide paraît ; clic sur ◧ → elle passe à gauche puis revient ; une leçon glissée dessus quitte sa semaine et entre dans la zone.
- Patch par `scripts/release.mjs`. Phrase de « Nouvelles » **proposée** à Grégoire, pas posée.
- Ce que Grégoire vérifiera ensuite à l'écran : ouvrir sa carte, cliquer ◧, voir la zone changer de place.
