# Relecture croisée de Cowork – lot #959 (le chemin de la copie garde le statut d'intégrité)

> Écrite le 26 septembre 2026, vers 16 h 30 (Toronto), par Cowork. Branche `lot-959-statut-integrite`, commits `208de686` (code) et `3a54f381` (demande).

## Verdict : À COMPLÉTER – deux preuves et une mesure avant la fusion

Le choix est le bon : un seul chargeur pour les deux chemins, et la remise à « recevable » pour l'élève suivant sans évaluation est une trouvaille utile. Mais le chargeur partagé n'est pas neutre : il **déclenche des événements** que l'ancien chemin de la copie ne déclenchait pas, et l'un d'eux touche la rétroaction.

## Ce que Cowork a lu

- `_chargerStatutsEtBadgesModif` fait `selectRemise.dispatchEvent(new Event('change'))`. Le gestionnaire (`changerStatutRemise`, `js/evaluation-sauvegarde.js` l. 550) écrit `evaluationEnCours.statutRemise` et, **si l'évaluation a une cartouche, rappelle `cartoucheSelectionnee()`**. Avant ce lot, le chemin de la copie ne le faisait pas. Et l'appel est placé **avant** « Charger l'échelle » (`verifierEtChargerEvaluationExistante`, ≈ l. 596) : `cartoucheSelectionnee()` s'exécute donc sur un état où l'échelle de l'évaluation n'est peut-être pas encore posée.
- Or trois règles récentes de Grégoire vivent exactement là : ce qui est enregistré fait foi (cartouche d'une copie évaluée, 1.159.4, #946 ; commentaire d'un critère, 1.156.3, #939 ; visionneuse, 1.159.7, #947).

## Ce qui est demandé

- **P1 · Preuve de neutralité à l'ouverture par la copie.** Une évaluation déjà enregistrée, avec cartouche, échelle et commentaires qui diffèrent de la cartouche actuelle : (a) ouverte par la copie puis enregistrée, sa cartouche, son échelle, ses commentaires par critère et sa rétroaction finale sont inchangés ; (b) ouverte par la copie **sans rien toucher**, la base est inchangée (aucune écriture automatique déclenchée par les événements du chargeur). Rouge si le dispatch fait du tort, vert sinon ; s'il en fait, corrige (par exemple : ne pas rappeler `cartoucheSelectionnee()` pendant le chargement, ou charger l'échelle avant les statuts).
- **P2 · La traduction des anciens statuts de remise** (`non-remis` → `non-recu`, `remis` → `evalue`) : un essai par la Liste ET par la copie. Elle change le comportement de « Modifier » (qui relisait vide), donc elle doit être prouvée.
- **M1 · Ta trouvaille « rétroaction finale régénérée à l'ouverture »** : mesure-la au banc sur le code d'avant le lot ET après, par les deux chemins. **Tranché par Cowork** : si ce lot l'aggrave ou l'introduit sur le chemin de la copie (par le dispatch ci-dessus), corrige-la ici ; si elle est antérieure et identique avant et après, inscris-la (issue 2 : une rétroaction réécrite à la main remplacée est une perte, au cœur du cap « finir la rétroaction ») – elle deviendra le prochain lot court, avant le Lot B.

## Hors de cause

- La remise à zéro pour l'élève suivant (`changerStatutIntegrite` vide les notes) : juste, et prouvée par sa mutation.
- Anonymisation : le chargeur passe par `poserChampTexteLibre`, cas couvert par ton banc.

Les « Nouvelles » : Cowork recommande à Grégoire le texte tel quel ; sa réponse arrive par lui.

---

## Contre-vérification – 16 h 38 (Toronto) : VERT, fusion accordée

Lu la réponse (`662568cb`, § 7 de la demande) et le banc de neutralité.

- **P1** : neutre, mesuré avant et après, identique à l'octet par les deux chemins. Le rappel de `cartoucheSelectionnee()` par le dispatch ne fait pas de tort mesurable. Accepté.
- **P2** : prouvée, rouge avant, vert après, quatre mutations rouges. Bonus mesuré : la traduction était inopérante sur le vrai trajet de la copie avant le lot. Accepté.
- **M1** : antérieure au lot, non aggravée ⮕ #960 inscrite, prochain lot court avant le Lot B, comme tranché. Les deux « échecs attendus » marqués #960 sont la bonne façon de garder la trace.
- **La question jointe à #960** (un commentaire de critère enregistré vide reçoit celui de la cartouche) relève de Grégoire (ce que l'élève lit) : Cowork la lui pose avec la consigne de #960.

Suite : release patch avec les « Nouvelles » acceptées, verdict Playwright complet, fusion, push, #959 cochée, FILE-DES-LOTS à jour.
