# Consigne du jour – une série de lots, une seule vérification à la fin

> Écrite par Cowork le 11 octobre 2026 à 11 h 37 (Toronto, mesurée par `date`). L'ancienne consigne de `main` est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-11-lot8-main.md`. La consigne du lot 8 et ses ajouts (verdict, item des Nouvelles) vivent sur `lot8-cadre` (`5415b265`). Tu peux commiter ce fichier.

## Où on en est

1.198.0 en ligne (11 h 26, lots 5, 6, 7). Le lot 8 (le Cadre, et la fiche urgente « Recalculer les captures », #1049) est relu et accepté sur `lot8-cadre`.

## La méthode (décisions de Grégoire du 11 oct., règle 7 de `PROTOCOLE.md`)

Les lots s'enchaînent dans la journée : pour chacun, **remesure d'abord**, commits séparés, break-tests, Vitest complet, demande de relecture, **arrêt** pour la relecture de Cowork, corrections. Puis le lot suivant, sur feu vert de Cowork. **Aucun verdict Playwright ni release** tant que Grégoire n'a pas donné son signal ; alors, une seule release groupe tout ce qui a été relu, avec un seul verdict complet.

« Sans Grégoire » : aucune décision de pédagogie, **aucune écriture dans des données déjà écrites chez l'utilisateur** (le stock s'écrit et s'assume), aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), aucune suppression de données d'utilisateur. Un mot d'écran neuf : écris-le dans le code, cite-le, Cowork le soumet à Grégoire. Un lot qui dépasse ce qu'on peut relire d'un coup se coupe : livre la moitié sûre, inscris le reste avec la mesure.

## Étape 0 – le lot 8 rejoint main

Fusionne `lot8-cadre` dans `main` (sans release). Vitest complet sur le résultat. Le lot 8 partira avec la prochaine release ; ses Nouvelles sont dans `5415b265`.

## La source des lots suivants

La remesure du 11 oct. des 69 fiches qui attendaient Grégoire, faite en lecture seule par une session du nuage : `git fetch origin claude/inspiring-mccarthy-99htj8` puis `git show FETCH_HEAD:"plans de travail/DECISIONS-A-PRENDRE-2026-10-11.md"`, section « Sans décision réelle (21) ». Elle a été faite sur 1.197.0 : remesure chaque fiche sur `main` avant d'y toucher. Ne copie pas ce fichier dans `main` (Cowork s'en charge).

## Lot 9 – les échelles et les cartouches qui disent juste

1. #590 – retirer l'échelle de repli écrite en dur et reconnaître les anciens identifiants d'échelle (option A, déjà tranchée).
2. #574 – un niveau d'échelle neuf tenu en attente au lieu de valeurs inventées (principe tranché le 28 août).
3. #656 – l'échelle d'une cartouche copiée d'un autre trimestre rattachée comme à l'import (patron du lot 3).
4. #634 – l'aperçu lit le seuil du portfolio par la même résolution que la note.

## Lot 10 – les élèves et les interventions

1. #554 – le statut « décrochage » branché jusqu'à la cible d'intervention.
2. #838 – un élève déjà inscrit à un cours entre aussi dans le service.
3. #792 – le contrôle « Mesure d'aide » à l'écran, à côté de SA ; avec la trouvaille 4 du rapport du nuage (`js/groupe.js` ≈ 756-762, champ `etudiantCAF` absent de la page) : mesure si la fonction est morte.
4. #548 – marquer le trimestre sur chaque **nouvelle** production, pour remettre en marche la garde contre les travaux mal rangés. Les productions déjà écrites ne sont pas réécrites : la garde doit tolérer leur absence de marque, et c'est écrit.
5. #854 – le formulaire de gestion écrit les jetons là où le calcul les lit. Croise avec #938 (lot 4) : l'assistant garde désormais ce qu'il n'édite pas ; vérifie que les deux chemins s'accordent.

**Hors de la série** : #1043 (ranger les jetons et jugements de dénotation par trimestre en copiant le stock) écrit dans les données existantes : il attend Grégoire.

## Lot 11 – le confort, sans mot neuf

1. #241 – « P sans reprises » sur les courbes d'intervention.
2. #865 – doubles attributs de classe dans cinq gabarits.
3. #324 (morte au sens du rapport) – la ligne « Reprises » du Comparateur dit encore « Non permises » pour une sommative : aligne-la sur la décision #903. **C'est un mot d'écran** : écris la phrase proposée, Cowork la soumet.

## Lot 12 – le code mort

#469 (le gros stock : vieilles pratiques de test, ancienne notation v2, vieux horaires, outil de diagnostic), #641, #688, #1047, la fonction `comptesDansDepistage` (`portfolio.js`, versée à #469 le 11 oct.). Rien ne change à l'écran ; chaque retrait prouvé par une recherche d'appelants **et** par Vitest. #469 est laborieuse : coupe-la si elle déborde.

## Lot 13 – la documentation

#471 (documentation technique et registre des données), #804 (documentation des pratiques de notation), le volet documentation de #629, #989 (le codex data : « prévu, non codé »), et la ligne `BACKLOG.md` de #476 qui dit encore « dû par Grégoire » (relevé du 26 août : sans objet). Motif à garder en tête : une personne qui reprendrait le code doit pouvoir s'y fier (rencontre du 23 sept. avec le service informatique).

## Après chaque lot

Arrête-toi : demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-11-lotN-<sujet>.md`, rapport court à Grégoire en gestes d'utilisateur (numéros entre parenthèses en fin de ligne), une ligne par supposition, ta proposition d'**un item** de Nouvelles. Ne commence le lot suivant qu'au feu vert de Cowork, transmis par Grégoire.
