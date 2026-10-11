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

## Ajout de Cowork (13 h 21) – verdict du lot 9

**Lot 9 accepté, une correction à faire avant le lot 10.** Relus sur `main` : `29315a94`, `52a10502` (#590), `17825b6b` (#574), `12a45010` (#656), `a1beeb09` et `6e0c864a` (#634), `e765ef78`. Tes suppositions sont toutes retenues. Le compte #467 à 24 est accepté : `${attrs}` est un fragment construit par le code, aucun nom n'y passe, la raison est écrite dans le test. Sentinelles non relancées par Cowork (le shell de Cowork ne charge pas le rollup natif du Mac) : je m'appuie sur ton Vitest complet et tes 21 mutations.

**Correction (#590, ton lot pas fini).** La marque `{ niveaux: [], introuvable: true }` que pose `construireConfigComplete` voyage jusque dans les données : « Dupliquer » et « Dériver une variante » (`js/pratiques.js` ≈ 841-875) copient `configResolue` entière dans `copie.config`. Or `construireConfigComplete` lit `config.echelle` embarquée AVANT toute référence : la copie garde une échelle vide pour toujours, même quand l'échelle redevient trouvable. Avant le lot, c'était l'IDME qui se figeait ; maintenant c'est l'absence. Remède : quand `configResolue.echelle && configResolue.echelle.introuvable`, la copie ne porte pas `config.echelle` ; elle garde `configuration.echelleId` (déjà transmis par `configuration: pratiqueData.configuration`), et se résoudra par référence. Une sentinelle, avec son break-test. Source seulement : aucune copie de ce genre n'a pu être écrite avant ton commit d'aujourd'hui.

**À écrire dans #634, sans nouvelle fiche** (règle d'entrée du BACKLOG : aucun symptôme vécu). Le seuil par défaut quand le portfolio de la pratique ne dit pas son minimum vaut maintenant 7 au tableau de bord et dans la note (`portfolio.js:179`, `profil-etudiant-actions.js:190`), mais encore 3 dans la liste des étudiants (`etudiants.js:906`, « performance insuffisante ») et dans le texte du profil (`profil-etudiant-sections-affichage.js:418`, « Minimum N évaluations requises »). Ces deux-là disaient déjà 3 avant toi ; le tableau de bord leur donnait raison, il ne leur donne plus. Note-le, ne le corrige pas dans ce lot.

**Mots d'écran et item des Nouvelles** : soumis à Grégoire ; sa décision te sera transmise ici. Ne les attends pas pour avancer.

**Feu vert pour le lot 10** une fois la correction commitée (même arrêt pour relecture à la fin du lot 10, la correction y sera relue avec lui).

**Décision de Grégoire (13 h 23) : les quatre mots d'écran du lot 9 sont retenus tels quels.** L'item des Nouvelles du lot 9 lui sera soumis avec la release.

## Ajout de Cowork (13 h 32) – décision de Grégoire : les lots 10 à 13 s'enchaînent sans arrêt

Ceci remplace « Après chaque lot » et le dernier paragraphe du verdict du lot 9. Après la correction de #590, fais les lots 10, 11, 12 et 13 **d'affilée, sans attendre de feu vert** entre eux.

- **Pour chaque lot, la même discipline** : remesure d'abord, commits séparés, break-tests, Vitest complet, et sa demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-11-lotN-<sujet>.md` déposée avant d'ouvrir le suivant. La correction de #590 va dans la demande du lot 10.
- **Ce que tu ne tranches pas** (pédagogie, écriture dans des données déjà écrites, zone protégée, suppression de données d'utilisateur) : tu l'écris dans la demande du lot, tu laisses la fiche telle quelle et tu passes à la suite. Ce n'est pas une raison de t'arrêter.
- **Un mot d'écran neuf** (dont la phrase « Reprises » de #324 au lot 11) : écris-le dans le code et cite-le dans la demande ; Cowork le soumettra à Grégoire à la fin.
- **Tu t'arrêtes avant la fin seulement si** Vitest rougit sans que tu saches pourquoi, ou si un lot touche un fichier qu'un lot précédent de la série a modifié d'une façon que tu ne peux pas concilier. Dans ce cas, dis-le dans la demande du lot en cours et arrête-toi là.
- Toujours **aucun push, aucune release, aucun verdict Playwright** (règle 7).

**À la fin du lot 13, un seul arrêt** : rapport court à Grégoire, un paragraphe par lot en gestes d'utilisateur (les numéros entre parenthèses en fin de ligne), une ligne par supposition, un item de Nouvelles proposé par lot. Cowork relit les quatre lots et la correction ; les corrections suivent ; puis la release groupée et le verdict complet, au signal de Grégoire.
