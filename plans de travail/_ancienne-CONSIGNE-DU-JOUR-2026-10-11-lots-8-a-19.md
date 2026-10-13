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

## Ajout de Cowork (15 h 17) – verdict des lots 10 à 13 et de la correction de #590

**Série acceptée, une correction avant la release.** Relus : `b5774567` à `95f665f9` (22 commits). Tes suppositions des quatre lots sont retenues. Tes trois coupures du lot 10 (#838, #548, #854) sont justes : elles vont dans la liste des décisions de Grégoire, Cowork s'en charge. Le défaut de découpage de `18e4253f` / `ee9a0e1d` est accepté tel quel (rien n'est poussé ; c'est écrit dans ta demande). Mon remède du verdict du lot 9 était faux (la validation exige `config.echelle`) : ton remède à la lecture est le bon.

**Correction (#590, `b5774567`) : le repli sur `echelle_id` de la marque n'était pas redondant, il faut le remettre.** Ta mutation survivait parce que l'essai F ne couvre que la forme `configuration.echelleId`. Cas réel : une pratique **importée sous la forme `.config`** (#712, schéma d'import `echelleId` en `config`) dont l'échelle est introuvable, puis « Dupliquer ». La copie reçoit `config` = la config résolue, qui ne porte pas `echelleId` (le `return` de `construireConfigComplete` ne le recopie pas), et `configuration` vide. Avec la marque écartée, plus aucune référence : `echelle` reste vide et `PratiqueConfigurable` lève « Champ obligatoire manquant : echelle ». La copie s'enregistre, puis ne se charge plus ; avant ton correctif, elle se chargeait sans niveaux. Remède : quand la marque est écartée, son `echelle_id` sert de référence si ni `configuration.echelleId` ni `config.echelleId` n'existe. Un essai sur la forme `.config`, et la mutation qui survivait doit rougir.

**RELAIS.md** : réécrit par Cowork (15 h 17), le travail vit sur le `main` local, 41 commits devant `origin/main` ; `lot8-cadre` n'a plus rien qui ne soit sur `main`.

**Mots d'écran et items des Nouvelles** : soumis à Grégoire ; sa décision te sera transmise ici.

**Après la correction** : commit, une ligne dans la demande du lot 10, et arrêt. La release attend le signal de Grégoire.

**Décision de Grégoire (15 h 18) : la phrase « Reprises » du Comparateur (#324) et les légendes « P sans reprises · <titre> » / « P sans reprises · contrôle » (#241) sont retenues telles quelles.** Les items des Nouvelles lui seront soumis avec la release.

## Ajout de Cowork (15 h 22) – la série suivante : lots 14 à 19

**Source** : les fiches sans décision des deux mesures du 9 oct. (`MESURE-2026-10-09-fiches-rapides-et-intermediaires.md`, `MESURE-2026-10-09-fiches-a-trier.md` § 2), moins celles faites depuis. Toutes sont encore `[ ]` au BACKLOG (relevé de Cowork à 15 h 22). Ordre : d'abord la robustesse des données, puis la logique, puis le confort et l'outillage. **Remesure chaque fiche sur `main` avant d'y toucher** : la mesure date de 1.193.0.

**Méthode** : celle des lots 10 à 13 (ajout de 13 h 32), inchangée. Tu commences après la correction de #590, sans attendre de feu vert ; tu enchaînes les six lots ; une demande de relecture par lot ; **un seul arrêt, à la fin du lot 19**. Mêmes limites « sans Grégoire ». Toujours aucun push, aucune release, aucun verdict Playwright.

### Lot 14 – les liens entre pratiques et échelles qui tiennent
- #663 – une archive rouverte : la pratique garde l'ancien lien vers son échelle.
- #627 – Réserve ouverte ou import en double : les liens pratiques ↔ échelles (la table `remapCartouches` existe, celle des échelles ?).
- #586 – dupliquer une échelle (barre latérale, bibliothèque) garde son identifiant : deux jumelles confondues.
- #580 – l'échelle venue de la pratique active perd en route ce qui n'est pas ses niveaux.
- #579 – une pratique ancienne qui porte sa propre échelle (`config.echelle`) ne peut pas recevoir de repères.
- #793 – après un import de cartouches, d'échelles, de pratiques ou de productions, rien ne montre ce qui est arrivé (les grilles le font déjà : même geste).
Prolonge le lot 9 et la règle d'import du lot 3. Source seulement : les liens déjà écrits chez l'utilisateur ne sont pas réécrits, et c'est dit.

### Lot 15 – rien ne s'écrit ni ne se perd en silence
- #1040 – des clés se réécrivent à l'identique à chaque ouverture.
- #646 – l'évaluation en cours rangée à deux endroits sous un même nom.
- #653 – la fenêtre de suppression peut réafficher les avertissements d'une suppression précédente.
- #1015 – retirer un type de travail ou un forfait PAN sans question alors que des évaluations l'emploient : mesure d'abord ; s'il y en a, la même fenêtre que les autres suppressions (décision de Grégoire du 4 oct., sans repasser par lui).
- #624 – supprimer une échelle ou une grille peut laisser des évaluations sans référence : mesure et garde à la source ; rien n'est rattaché après coup (les notes d'A2025 et d'H2026 ne sont pas rouvertes).

### Lot 16 – les interventions et le calendrier
- #978 – une intervention modifiée après sa complétion : les présences ne suivent pas.
- #729 – une intervention après la dernière séance : sa courbe part du tout début.
- #582 – la comparaison horaire ↔ devis suppose une période d'une heure.
- #430 et #428 – deux nettoyages provisoires échus en septembre (reprise des anciennes activités de planification, vieille archive de notes de leçon) : à retirer s'ils n'ont plus rien à traiter ; s'ils peuvent encore trouver des données anciennes chez quelqu'un, dis-le et laisse.

### Lot 17 – des fenêtres qui parlent comme l'application
- #1037 – la bibliothèque des trimestres parle par les fenêtres d'alerte du navigateur.
- #951 – l'avertissement avant d'exporter un partage n'a aucune mise en forme.
- #783 – le titre de la colonne « Présence » existe en deux versions.
- #633 – fermer le formulaire d'une production ne fait pas la même chose selon le bouton.
- #483 – des pondérations qui ne font pas 100 % : confirmer, et ne plus compter en silence.
- #536 – « pas de donnée » au lieu de 0 quand aucun niveau n'est convertible.
Garde les mots existants quand une alerte devient une notification. Les mots neufs (#483, #536) : écrits dans le code, cités dans la demande.
**Hors de ce lot** : #678 (les 46 alertes du tutoriel) est laborieuse ; ne l'ouvre que si le lot reste petit, sinon inscris la mesure.

### Lot 18 – le code mort, la suite
- #469, ce que tu as coupé au lot 12 : `pratique-notation-v2.js` (et ses dix fichiers de test), l'îlot de `pratiques.js`, la grappe `calculerNoteFinale`, `initialiserPratiquesPredefines`, l'ancienne génération des grilles, échelles et cartouches, l'outil de diagnostic I14.
- #628 – le faux sélecteur de grilles et sa fonction.
- #722 – l'ancien panneau de détail du portfolio.
- #791 – probablement morte avec `groupe.js` : mesure et ferme.
- #689 – deux fonctions « Générique » qui créent du matériel « de départ » : le nom suit.
- #587 – les homonymes qui restent (la dernière chargée gagne).
Coupe encore si ça déborde ; chaque retrait prouvé par grep d'appelants et Vitest.

### Lot 19 – l'outillage qui dit vrai
- #685 – le test « semer puis noter » qui ne réussit parfois qu'au second essai.
- #616 – des sentinelles qui lisent le code « à N caractères ».
- #642 et #679 – un nom caché par un paramètre ; un style employé jamais défini : un détecteur chacun.
- #784 – aucun test ne repère un bouton placé dans une zone redessinée.
- #595 – des couleurs appelées par un nom qui n'existe pas (71 noms tolérés).
- #980 – le script d'envoi juge la branche courante, pas celle demandée.
- #979 et #955 – les essais planifiés de GitHub : mesure, puis répare ou retire.
Rien ne change à l'écran, sauf #595 (des couleurs qui reviennent) : décris ce qui change.

**Écartées de la série**, parce qu'elles reviennent à Grégoire : #588 et #696 (des mots à écrire), #439 (le contenu de deux guides), #997 et #682 (ses données), #721 (déplace le stock des jetons), #690 (le contenu des pratiques prédéfinies), #1004 (son Chrome), #1019 (supprimerait des fichiers de copies). Laborieuses gardées pour une série suivante : #465, #470, #522 (s'il reste quelque chose), #584, #596, #598, #602, #615, #678, #738.

**À la fin du lot 19** : le rapport court à Grégoire, comme pour les lots 10 à 13.

**Cowork (15 h 22) : correction de #590 relue (`ed6d4a76`), acceptée.** Les lots 8 à 13 sont prêts pour la release, au signal de Grégoire.

## Ajout de Cowork (17 h 29) – verdict des lots 14 à 19

**Série acceptée sous condition : une correction bloquante et cinq à faire, puis arrêt.** Relus : `eec2354d` à `99df924a` (35 commits), en relecture adverse par lot. Tenus et vérifiés : les retraits du lot 18 (aucun appel restant, y compris aux noms de `pratique-notation-v2.js` ; #587 garde bien la version qui gagnait), #536, #951, #783, #653, #624, #729, #1015, #595, les quatre cliquets (non tautologiques, ils retrouvent exactement leur figé), et la suppression d'un trimestre par les fenêtres de l'application (focus sur « Annuler », Échap et clic hors fenêtre n'effacent rien, `await` avant `supprimerTrimestre`, codex écrit avant). Tes suppositions sont retenues ; tes cinq questions à Grégoire lui seront soumises une à la fois.

### Bloquant

**1. #1040 : `setSyncSiChange` saute l'écriture quand l'appelant a modifié en place l'objet lu.** Au-dessus de 25 Ki, `getSync` rend l'objet de `memoryCache` **par référence** (`db.js` ≈ 1652). `portfolio.js` (≈ 394, 436, 497) lit `indicesCP`, le modifie en place, puis appelle `setSyncSiChange` : la relecture rend le même objet, le JSON est identique, `'inchange'`, aucune écriture IndexedDB. L'écran reste juste dans la séance, mais IndexedDB et le codex gardent l'ancien C/P. Le seuil tombe vers 160 élèves cumulés dans le trimestre : probable chez Grégoire. Remède : dans `setSyncSiChange`, écrire quand `actuel === value` (même référence : on ne peut rien conclure). Un essai par le vrai `db.js` avec une valeur > 25 Ki, modifiée en place ; break-test.

### À corriger

**2. #580 : les menus et le calcul ne lisent plus la même échelle.** `evaluation-chargement.js` ≈ 1056 et 1274 passent par `obtenirEchelleResolue` (qui reconnaît `idOriginal`), mais le calcul (`evaluation-calcul.js` ≈ 1437) et la garde d'enregistrement (`evaluation-chargement.js` ≈ 2059) restent sur l'id exact. Une évaluation qui désigne une échelle par son ancien id voit ses niveaux dans les menus, mais sa note reste « -- » et elle ne s'enregistre pas. **Remède : retire `6f48c2ae`** (un `git revert`, ou l'équivalent à la main). Aligner aussi le calcul ferait apparaître des notes sur des évaluations d'A2025 ou d'H2026 restées « -- », et ces trimestres ne sont pas rouverts. Écris-le dans #580 : c'est à Grégoire.

**3. #793 : la notification accuse une case qui n'existe pas.** La préférence « Masquer… » est commune aux cinq bibliothèques, mais sa case n'existe que dans trois modales (grilles, échelles, cartouches). Dans Productions et Pratiques, ou pour un élément rangé dans un dossier, le message renvoie à une case ou à un filtre absents. Remède : la phrase sur la case seulement là où la case existe ; ailleurs, aucune phrase neuve, la mise en évidence se tait.

**4. #483 : l'avertissement des 100 % part sur un geste qui n'est pas un enregistrement.** Supprimer un critère (`grilles.js` ≈ 525) passe par `sauvegarderGrilleTemplate(false, …)` et affiche « Grille enregistrée : ses critères totalisent N %… », alors qu'ajouter un critère ou changer une pondération reste silencieux. Remède : l'avertissement sur les gestes explicites seulement (créer, « Sauvegarder la grille »), comme annoncé ; un essai sur la suppression d'un critère.

**5. #980 : `ref-poussee.sh` se contourne par le scénario même de #980.** `pousser.sh origin --force lot-x` passe (`case "$2" in -*) return 0`), et `pousser.sh origin main lot-x` aussi (seul `$2` est lu). Remède : examiner tous les arguments non-options après le dépôt distant ; chaque référence doit désigner la branche courante (`HEAD` compris, refusé aujourd'hui à tort). Le cas du banc `['origin','--force'] → 0` change de sens.

**6. #1037, deux petites choses.** (a) La ressaisie du nom porte un « Supprimer » en `btn-principal` (bleu) : une variante danger pour `demanderSaisie`, comme la première fenêtre. (b) Spec 1007 : l'attente de la première fenêtre après « Écrire le codex à part » est passée de 60 s à 30 s alors que la génération prend des secondes ; remets 60 s, pour que le verdict de ce soir ne rougisse pas à tort.

### Mineurs, à écrire dans la fiche ou en commentaire, sans code
- #663 : la branche du partage ne se déclenche jamais (un paquet de pratique ne porte pas son échelle, `partage-format.js` ≈ 241) ; c'est ton code neuf : retire-la avec son essai, ou dis pourquoi la garder.
- #586 : retirer `idOriginal` aveugle `_sonder574` (`echelles.js` ≈ 444) et `estVisee` (`echelles-bibliotheque.js` ≈ 188) pour les copies futures : dans #586.
- #1040 : la recopie d'une petite clé restée seulement dans localStorage n'a plus lieu à l'ouverture : dans #1040, accepté.
- #633 : « Fermer » juste après une frappe sans quitter le champ peut perdre le titre (garde `productionEnEdition !== id`) ; fenêtre étroite, déjà présente par `u-hide` : dans #633.
- `sentinelle-ssot-modalites-ecrivains-L0` (≈ 86) vise un fichier retiré, son assertion est vide ; `scripts/audit-innerhtml.sh:44` le liste encore ; les témoins de #679 et #784 sont négatifs seulement : un témoin positif chacun.

**Après les corrections** : une demande `DEMANDE-RELECTURE-2026-10-11-corrections-14-19.md`, Vitest complet, et arrêt. Toujours rien de poussé.

## Ajout de Cowork (18 h 02) – corrections des lots 14 à 19 relues

**Acceptées** (`a6753d01` à `792896ad`). #1040 : `actuel !== value` est le bon remède, il vaut pour tout appelant futur. #580 annulé proprement ; le texte de sa fiche (ta demande, § 3) sera posé au BACKLOG avec la décision de Grégoire. `ref-poussee.sh` : `-o ci.skip origin main` est encore refusé (la valeur d'option est prise pour le dépôt) ; refus sans danger, laissé. **Les lots 8 à 19 sont relus.** Reste avant la release : les mots d'écran des lots 15 et 17 et les items des Nouvelles, soumis à Grégoire ; sa décision te sera transmise ici.

**Décision de Grégoire (18 h 02) : les mots de la suppression d'un trimestre (#1037).** À poser exactement :
- Première fenêtre. Titre : « Supprimer définitivement le trimestre « X » ? » Message : « Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles. » Bouton : « Supprimer » (destructif).
- Seconde fenêtre. Titre : « Confirmation finale : cette action est irréversible. » Message : « Pour supprimer « X » et toutes ses données, retape son nom exactement : » Bouton : « Supprimer » (destructif).
- Bibliothèque vide : « Aucun trimestre dans la bibliothèque. » ; détail : « Clique sur « + Nouveau trimestre » pour en créer un. »
- Les notifications « Trimestre "X" supprimé (N clés…) » : guillemets français aussi (« Trimestre « X » supprimé… »).

**Décision de Grégoire (18 h 03) : les mots du lot 15 (deux phrases du codex, refus de supprimer une grille) et l'avertissement des 100 % (#483) sont retenus tels quels.** Tous les mots d'écran des lots 8 à 19 sont tranchés. Restent les Nouvelles.

## Ajout de Cowork (18 h 04) – préparer la release des lots 8 à 19

**Décision de Grégoire (18 h 04) : l'entrée des Nouvelles est retenue**, mots exacts, couleur `bleu` :

Titre : « Rien d'inventé, rien de perdu »
1. « Recalculer les captures ne fait plus perdre les mesures avant et après des interventions ; dans le Cadre, les noms des groupes-cours et le compteur « X/5 configurés » sont à jour, et « Clore » n'est plus proposé sur le trimestre en cours. »
2. « Ajouter un niveau à une échelle ne pose plus de valeurs à ta place : le niveau attend que tu aies rempli son code, son nom, ses bornes et sa valeur. »
3. « Dans la fiche d'un élève (Cadre › Trimestre), la mesure d'aide se coche maintenant à côté de SA. »
4. « Sur les courbes d'intervention du tableau de bord, une courbe pointillée montre P sans l'apport des reprises. »
5. « Après un import, la carte importée est mise en évidence, et une copie faite par « Dupliquer » ne se confond plus avec son original. »
6. « Une grille qu'emploient des évaluations ne peut plus être supprimée depuis la Conception. »
7. « Supprimer un trimestre se fait dans les fenêtres de l'application, et une grille dont les pondérations ne font pas 100 % te le signale. »

**Ce que tu fais maintenant**, dans l'ordre, sans attendre :
1. Pose les mots de la suppression d'un trimestre décidés à 18 h 02 (plus haut), avec la spec 1007 et le banc #361 alignés ; Vitest complet ; un commit.
2. L'entrée ci-dessus dans `js/changelog-data.js`, puis `node scripts/release.mjs minor` (1.199.0) ; un commit de release. Les deux par le skill `release-et-changelog`.
3. Arrête-toi et dis-le à Grégoire en une ligne. **Le verdict complet et le push attendent son signal** de fin de journée (règle 7 : Chrome, Safari, Claude fermés ; Mac branché, sans veille). À son signal : verdict, puis push si vert, comme au § 4.5 de `fin-de-session`.

## Ajout de Cowork (19 h 09) – avant le verdict

Release 1.199.0 relue (`05d70e6c`, `039b523d`) : les mots de 18 h 02 et l'entrée des Nouvelles sont posés tels que décidés. **Avant de lancer le verdict, commite `RELAIS.md` et ce fichier** (« docs : relais et consigne du 11 oct., Cowork ») pour qu'ils partent avec le push. Puis, au signal de Grégoire : verdict complet, push si vert.

## Ajout de Cowork (20 h 49) – diagnostic du verdict rouge : trois specs à aligner, pas le code

Mesuré par Cowork dans les specs et le code ; **les trois échecs sont des specs restées sur l'ancien comportement**, voulu changé par des lots relus.

1. **`ecraser-homonyme-employe-967` (échelle) et `lot-e1-conception-creer-ou-modifier` (trouvaille 1 (a))** : les deux créent l'« homonyme libre » en ne donnant qu'un nom, puis « Créer ». `creerNouvelleEchelle` propose quatre niveaux aux codes et noms **vides** (`echelles.js` ≈ 1790) ; depuis #574 (lot 9, relu et accepté), `sauvegarderEchelleComplete` refuse un niveau incomplet (« Niveau 1 — Le code du niveau est obligatoire. », par `alert`, que Playwright ferme seul). Rien n'est créé : « 0 au lieu de 1 ». Avant le lot 9, ces specs créaient des niveaux au code vide, la collision de #524. **Remède : dans les deux specs, remplir code et nom des quatre niveaux proposés avant « Créer »** (un petit utilitaire partagé, noms fictifs). Ne touche pas `echelles.js`. Vérifie que la spec 967 n'attrape pas l'`alert` du refus dans sa liste `alertes` (« aucun refus ») une fois les niveaux remplis.
2. **`cartouches-namespacees-par-trimestre-623`** : `LIRE_ANNONCE` (≈ 337) cherche `.texte-avertissement` dans `#modalPartageExport`. #951 (lot 17, `6a956db5`) a remplacé cette classe par `alerte alerte-attention`. **Remède : la spec lit `.alerte-attention`.** Cherche d'abord (`grep -rn "texte-avertissement" tests js`) tout autre lecteur de l'ancienne classe et aligne-le.

**Ensuite** : les trois specs lancées seules, 3 sur 3 chacune ; Vitest complet ; un commit (« test : trois specs alignées sur #574 et #951 ») ; puis **le verdict complet à nouveau, et le push s'il est vert**. Le signal de Grégoire de ce soir vaut toujours ; s'il est trop tard pour un verdict d'une heure, dis-le-lui et attends son signal suivant.

## Ajout de Cowork (12 oct., 4 h 18) – 1.199.0 en ligne : les écritures de clôture

**Constaté chez Netlify** : déploiement `6acc41e0`, `commit_ref` `437d48ec`, `state: ready`, publié le 11 oct. à 22 h 11 (Toronto). La fusion de `f6acfef7` est propre : entre `2104120e` (le commit jugé) et `437d48ec`, seuls `ETAT-PROJET.md` et `RELAIS.md` changent. Ta marche à suivre au push refusé (fusion plutôt que rebase, pour garder les SHA jugés) est la bonne.

**BACKLOG.md, écrit par Cowork, non commité** : 41 fiches cochées (37 livrées en 1.199.0, 4 closes sur la mesure : #685, #791, #955, #979) ; 22 fiches restées ouvertes reçoivent une ligne datée, « en partie livré » ou « à Grégoire », dont le texte de #580 que ta demande des corrections réservait à Cowork. Copie d'avant, hors du dépôt : `/tmp/BACKLOG.avant-1199.md` du shell de Cowork.

**À faire en ouvrant ta prochaine session, avant tout lot** : relis le diff de `BACKLOG.md` (63 lignes, une par fiche), puis un seul commit de documentation avec `BACKLOG.md` et ce fichier (« docs(1.199.0) : en ligne à 22 h 11 ; lots 8 à 19 cochés au BACKLOG »). Mets à jour dans le même commit l'en-tête de `RELAIS.md` (1.199.0 EN LIGNE, `main` à jour), `OU-EN-EST-ON.md` et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, comme pour 1.198.0 (`304c3b58`). Rien d'autre ne dépend de ce commit.
