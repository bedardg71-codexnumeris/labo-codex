# Les fiches « à toi » — décisions du 15 oct. 2026 (14 h 49 à 15 h 29) et lots à exécuter

> Tri mené par Cowork avec Grégoire, une question à la fois, sur les 33 fiches que la page du tri marquait « à toi ». Ce fichier porte les décisions et les lots qui en découlent, dans l'ordre où Claude Code les prendra. Une seule session écrit dans `js/` à la fois ; ces lots passent APRÈS ceux déjà en file sur la page du tri (#1075 en tête).
> ⛔ Aucun nom de collègue ni d'élève dans ce qui s'écrit au dépôt à partir de ces lots.
> Chaque lot finit par un geste à voir à l'écran ou par une fermeture motivée, et chaque fiche reçoit au backlog la ligne donnée ici.

## Ce qui attend une réponse extérieure (rien ne se code)
- #1060 et #591 : la table qui relie un code au vrai DA. Attend la réponse des responsables de la Loi 25 du cégep (courriel de Grégoire, texte accepté le 15 à 13 h 29).
- #835 : la formule « repérées sur total » de la grille de l'orthopédagogue. Question de Grégoire le 19 oct.
- #274 : une carte d'alignement d'exemple d'une autre discipline. Question aux collègues le 19 oct.

---

## Lot A — Avant la purge (CE SOIR) — #694
Consigne à part : `plans de travail/CONSIGNE-LOT-2026-10-15-avant-la-purge.md`.
Lignes à poser sous #694 :
`**Décidé par Grégoire le 15 oct. 2026 (14 h 51, 15 h 06, 15 h 08)** : les dossiers de retours de collègues, leurs prénoms et noms dans les fichiers (remplacés par une initiale, décompte validé d'abord) et le répertoire « Autres pratiques de notation » (rendu d'abord à Grégoire hors du dépôt) entrent dans la purge du 16. Détail : plans de travail/LOTS-2026-10-15-fiches-a-toi.md, lot A.`

## Lot B — Ce qui sort de l'application (confidentialité) — #1074, #1071
À prendre avec #1075 ou juste après (même famille).
- **#1074 (Grégoire, 14 h 54)** : l'export anonymisé retire aussi le programme, les services adaptés et les résultats ultérieurs. Motif : il est fait pour partir chez quelqu'un d'autre. Geste : retirer ces trois champs de toute sortie marquée anonymisée ; mettre à jour l'écran ou l'aide qui énumère ce qui est retiré ; essai qui rougit si l'un des cinq champs sort. Ne touche pas à la table code ↔ DA (#1060).
- **#1071 (Grégoire, 14 h 53)** : pas de chiffrement du codex (une clé perdue le rendrait illisible, contraire à la règle du 20 sept.). La fenêtre « Confidentiel » et toute promesse du même ordre (aide, Nouvelles, `CONFIDENTIALITE.md`, `PRIVACY.md`) sont corrigées pour dire vrai : le codex est un fichier en clair sur l'appareil de l'enseignant·e ; sa protection, c'est l'endroit où on le range. **Les mots sont soumis à Grégoire sur une page avant d'être posés.**
Lignes au backlog : `**Décidé par Grégoire le 15 oct. 2026 à 14 h 54** : l'export anonymisé retire aussi le programme, les services adaptés et les résultats ultérieurs.` · `**Décidé par Grégoire le 15 oct. 2026 à 14 h 53** : pas de chiffrement ; la promesse « Confidentiel » est corrigée pour dire vrai, mots soumis à Grégoire.`

## Lot C — La note — #483, #1076
Skill `pratiques-notation`. Relecture croisée avant l'envoi.
- **#483 (Grégoire, 14 h 55)** : une pondération 0 ne compte pas dans la note ; l'écran signale une évaluation sans pondération. Mesurer d'abord où 0 (ou une pondération absente) devient 1 (audit du 16 sept. : six artefacts, 85 au lieu de 87,43) ; distinguer 0 explicite et absente ; corriger note, notes finales, export Léa, profil ; vérifier les autres pratiques (PAN-STD d'abord) pour le même défaut. Mots du signal soumis à Grégoire. **Avant la sortie** : dire à Grégoire combien de notes bougent et de combien (démo ; ses données s'il fournit un codex), sans aucun nom. Trimestres clos non rouverts.
- **#1076 (Grégoire, 14 h 57)** : faits donnés par Grégoire, Léa accepte le dixième mais arrondit la note finale à l'entier en fin de trimestre. Décision : la note finale (export vers Léa, bulletin PDF de fin de trimestre) est l'ENTIER, arrondi UNE seule fois à partir de la note exacte (59,45 donne 59, jamais 60 par un dixième intermédiaire) ; ailleurs, le dixième. Une fonction d'arrondi commune ; essais aux bornes (59,45 ; 59,5 ; 59,95 ; 87,449) ; rien n'est réécrit dans les données. Rapport : la liste des écrans qui passent au dixième.
Lignes au backlog : `**Décidé par Grégoire le 15 oct. 2026 à 14 h 55** : une pondération 0 ne compte pas ; l'écran signale une évaluation sans pondération ; l'ampleur du changement lui est montrée avant la sortie.` · `**Décidé par Grégoire le 15 oct. 2026 à 14 h 57** : Léa arrondit la note finale à l'entier ; la note finale est l'entier, arrondi une seule fois depuis la note exacte ; ailleurs le dixième.`

## Lot D — Les repères de maîtrise d'une échelle — #579, #551
Skills `pratiques-notation`, `depistage-rai`. Relecture croisée.
- **#579 (Grégoire, 15 h 16)** : les repères d'une pratique dupliquée deviennent modifiables ; quand un repère est retouché après évaluation, les résultats déjà donnés SUIVENT, mais l'écran dit d'abord combien d'évaluations notées vont changer et l'enseignant·e confirme. Motif : une retouche est presque toujours une correction ; deux sens pour un même niveau dans un groupe seraient inéquitables. Geste : résoudre `pratique-<id>` par la référence `configuration.echelleId` avant la copie embarquée, aligner `construireConfigComplete` (DEMANDE-RELECTURE-2026-10-11-lot14 § 4) ; compte et confirmation à l'enregistrement (mots soumis à Grégoire) ; aucune évaluation réécrite ; trimestres clos inchangés (essai).
- **#551 (Grégoire, 15 h 18)** : le dépistage du risque se cale sur les deux repères de maîtrise de l'échelle de chaque enseignant·e (seuil de réussite, seuil de maîtrise) ; 0,64 et 0,75 ne restent qu'en repli quand l'échelle n'a pas de repères. Ne toucher que la chaîne vivante (mesure du 27 août : six implémentations, une seule atteinte) ; les phrases de suggestion suivent le repère réel ; corriger la fragilité nommée le 13 sept. (un 0,64 figé indiscernable du repli). **Avant la sortie** : mesurer si les repères de Grégoire valent 64 et 75 ; sinon, lui montrer combien de paliers RàI bougent, sans nom. Objectifs déjà enregistrés non réécrits.
Lignes au backlog : `**Décidé par Grégoire le 15 oct. 2026 à 15 h 16** : les résultats suivent une retouche des repères, après un compte affiché et une confirmation.` · `**Décidé par Grégoire le 15 oct. 2026 à 15 h 18** : le dépistage se cale sur les repères de maîtrise de l'échelle de chacun ; 0,64 / 0,75 en repli.`

## Lot E — Zone protégée — #1052, #1053, #646, #628
Accord de Grégoire (14 h 59 pour les deux premières, 15 h 28 pour les deux autres), à la condition de la relecture croisée de `PROTOCOLE.md` (commit, relecture par Cowork, corrections, verdict, push). Rien ne change à l'écran. Un commit par fiche.
- **#1052** : retirer du registre des noms protégés les cinq fonctions mortes des grilles, après une recherche qui prouve qu'aucun appel ni `data-action` n'y renvoie.
- **#1053** : brancher les deux modules sur la navigation au lieu de l'envelopper.
- **#646** : PROUVER d'abord le défaut (appeler le vrai calcul quand seul `window.evaluationEnCours` a écrit ; DEMANDE-RELECTURE-2026-10-11-lot15 § 4). Non confirmé : rien n'est touché, la fiche se ferme sur la mesure. Confirmé : un seul emplacement, lecteurs et écrivains alignés.
- **#628** : retirer `#selectGrilleTemplate`, la branche création de `chargerGrilleTemplate`, son inscription au registre, les quatre écritures `select.value = x` sur ce div et le JSDoc périmé ; ajuster le cas E.a de `sentinelle-625-etats-edition-purges`.
Ligne au backlog (chacune) : `**Accord de Grégoire le 15 oct. 2026 (<heure>)** pour toucher la zone protégée, avec relecture croisée avant l'envoi.`

## Lot F — Des données rangées dans leur trimestre — #1043
Skill `integrite-globaux`. Relecture croisée.
- **#1043 (Grégoire, 15 h 00)** : les jetons et les jugements de dénotation se rangent chacun dans son trimestre, pour suivre un trimestre renvoyé aux archives ou qu'on fait revenir. Migration idempotente qui COPIE sans supprimer ; lecture qui préfère la nouvelle place et retombe sur l'ancienne ; les anciennes clés restent intactes (leur retrait n'est PAS dans ce lot) ; essais aller-retour codex et archive.
Ligne au backlog : `**Décidé par Grégoire le 15 oct. 2026 à 15 h 00** : rangés dans leur trimestre ; anciennes clés intactes jusqu'à vérification, rien n'est effacé.`

## Lot G — Fermetures (une ligne chacune, sans code)
- **#582 (Grégoire, 14 h 59)** : fait donné par Grégoire, une heure du devis vaut une période, quelle que soit sa durée (50 ou 55 min selon le collège). Fermée, le calcul est juste. Vérifier seulement que la durée d'une période n'entre pas dans le compte des heures.
- **#838 (Grégoire, 15 h 17)** : on ne peut pas être à la fois enseignant·e et orthopédagogue ; le cas ne se produit pas. Fermée.
- **#406 (Grégoire, 15 h 29)** : le test « à froid » reporté le 7 août est fermé ; de vrais collègues découvrent l'application et les tutoriels du blogue ont parcouru les écrans. Le triage des observations déjà notées (bloc A du 7 août) se fait sans lui, par l'issue « inscrire » ou « fermer ».
- Décidées par Cowork (technique, mesurable), chacune dite à Grégoire en une ligne :
  - **#580** : on garde les listes blanches (état actuel, cohérent depuis le retrait du 11 oct.) ; aligner le calcul toucherait des trimestres clos, non rouverts (décision du 1er sept.). Fermée.
  - **#548** : la garde inerte est acceptée (option d'origine de la fiche) ; un lot dédié risquait de refuser des écritures sur des données réelles. Aucun symptôme vécu. Fermée, à rouvrir sur un cas réel.
  - **#854** : l'état actuel est gardé (chaque emplacement des jetons a un seul éditeur, et le formulaire le dit, #853). Pas de second champ. Fermée.
  - **#788, #676** : tranchées par Grégoire le 10 oct. (plus de Playwright planifié sur GitHub ; le verdict du Mac fait foi). Fermées.
  - **#425** : déjà tranchée le 8 août (ordre D → C → B → A) ; elle va au chantier de la carte d'alignement, sans autre décision.

## Lot H — Le code temporaire et le reste technique (décidé par Cowork)
À prendre dans le volet « contenir la complexité » (décision de Grégoire du 12 oct.). Chacun mesure avant d'agir ; ce qui touche ses données ou ses écrans lui remonte.
- **#722** : retirer les 290 lignes de portfolio qu'aucun écran n'appelle (zéro-dette), après la preuve qu'aucun appel ni `data-action` n'y mène.
- **#428, #430** : retirer les deux rattrapages temporaires SEULEMENT si la mesure montre qu'aucun ancien fichier encore ouvrable (codex, archive, ancienne sauvegarde) n'en dépend ; sinon, fermer la fiche en gardant le code, motif écrit (« les anciens fichiers sont reconnus à l'ouverture », décision du 30 sept.).
- **#766** : mesurer les 13 classes écrasées ; si le rendu change, captures avant / après montrées à Grégoire avant l'envoi.
- **#476** : les vingt-deux « Dupliquer » se fusionnent dans le volet « contenir la complexité », famille par famille.
- **#978** : corriger la source (une intervention modifiée après sa complétion refait son report, avec la nouvelle date) ; les reports déjà écrits ne sont pas réécrits.
- **#1044** : mesurer les boutons à icône seule ; les mots proposés à Grégoire écran par écran (ce sont des mots d'écran).
- **#393** : les six décisions de l'audit du 5 août sont techniques : `estCollègue` insensible à la casse et aux accents ; l'import fusionne les enseignant·es au lieu de remplacer la liste ; une seule écriture de `seancesHoraire` ; la doc suit le code ; la conversion du format clairsemé ancien gardée tant qu'un ancien fichier en dépend ; plus de dates de repli en dur dans `genererCalendrierComplet` (des bornes vides disent qu'il manque les dates du trimestre).
