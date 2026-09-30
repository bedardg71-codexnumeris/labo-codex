# Plan – finir la carte d'alignement et l'enregistrement

> Écrit le 29 septembre 2026 par Cowork, à la demande de Grégoire (« Terminons tout ce qui a trait à la carte d'alignement et à l'enregistrement »). Ordre des lots tranché par Cowork (question technique). Les lots partent APRÈS le lot H (#987, en cours) : une seule session écrit à la fois. Paliers et fichiers lus dans les fiches, pas remesurés au code : chaque consigne commence par vérifier que la fiche vit encore là où elle le dit.

## Les lots, dans l'ordre

1. **Lot I – Le rappel propose de mettre à jour le codex** (#985, mis dans ce chantier par Grégoire le 29 sept. vers 15 h 15). Symptôme vécu, même jour : sur l'iPad, l'invitation à faire une copie de secours revient à l'ouverture de l'application, alors que son codex a été mis à jour à 15 h 03. Mesuré par Cowork en lecture (`js/modal-backup-reminder.js`) : (a) le rappel ne regarde que sa propre date (`backupProchainRappel`) ; mettre à jour le codex ne le repousse pas ; (b) le fermer par ✕ (`fermerModal`) ne pose aucune date : il revient à chaque ouverture, jusqu'à ce qu'on choisisse un délai ou « Copie de secours ». Quel bouton Grégoire utilise : non su. Priorité des retours testeurs : ce lot passe en premier. Décision due avant le code : la forme du rappel (piste de la fiche : il propose de mettre à jour le codex ; la copie de secours devient une option du codex).
1 bis. **Lot I bis – On élimine la copie de secours** (D9, 29 sept. vers 19 h 15). Retirer la fabrication d'une copie de secours aux endroits inventoriés (mesure du lot I, § 3) ; ouvrir une copie déjà faite reste possible. ⚠ La suppression d'un trimestre propose aujourd'hui une copie de secours avant d'effacer (`js/trimestre-v2-liste.js`) : ce filet doit devenir « mettre à jour le codex », jamais disparaître (limite du 20 sept.). Mots neufs à Grégoire.
2. **Lot J – L'export du plan dit vrai** (carte d'alignement). Un objectif servi dans une autre leçon, un objectif retiré de la carte, « Aucune échelle » partout (#974, #968, #969, registre des retours testeurs). Même lot : la carte démo qui enseigne l'ancien geste (#970). Mots à Grégoire : ce que l'export écrit à la place.
3. **Lot K – La carte, côté technique.** Coût de la pastille sur une grande carte, lecteur d'écran, défaut de semaine sans essai (#971, #972, #973). Aucune décision attendue.
4. **Lot L – « Écraser » un homonyme ne laisse plus de liens orphelins** (#967). Laborieuse, trois éditeurs (échelles, grilles, cartouches). Touche la limite du 20 sept. (aucun effacement irréversible). Lot seul.
5. **Lot M – Les écritures sans geste et les échecs tardifs.** La liste des cours réécrite à chaque ouverture (#981), la sélection du portfolio écrite sans geste (#983), l'échec IndexedDB d'une grosse donnée dit trop tard (#962).
6. **Lot N – Créer un trimestre par la bibliothèque suit D3** (#975). ⚠ Le fichier porte l'archivage, sous moratoire (#622) : vérifier le moratoire avant d'ouvrir.
7. **Lot O – Le clavier de l'iPad ne cache plus « Enregistré »** (#986). Porte terrain sur l'iPad.

## Ce qui attend une décision de Grégoire (une question à la fois, au moment où le lot s'ouvre)

- **#982** – afficher « Enregistré » pour les ~101 gestes sans témoin (étendre D0) : oui ou non. Si oui, lot à part.
- **#976** – corriger une coquille de DA sans détacher évaluations et présences : ses données réelles, conception due.
- **#984** – les anciens guides pour testeurs : les retirer ou les réécrire.
- **#985** – mis dans ce chantier par Grégoire (29 sept., vers 15 h 15), en premier : voir lot I.

## Ce qui ne peut pas se clore maintenant

- **#978** – une intervention modifiée après sa complétion : attend un cas réel (règle du 6 sept. : pas de données fictives pour vérifier un geste).

## Hors chantier, décision de Grégoire en attente (notée le 29 sept., vers 16 h)

- **La vérification planifiée de GitHub, annulée chaque jour à 60 minutes** (#979) : même cause que #987 côté croissance de la suite ; la régler coûte des minutes GitHub, donc c'est sa décision. Proposée par Claude Code comme question d'une prochaine session ; à poser quand il est disponible, pas pendant ce chantier.
