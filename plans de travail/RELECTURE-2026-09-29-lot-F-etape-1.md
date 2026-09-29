# Réponse d'étape – lot F, étape 1 (le témoin du codex)

> Écrite le 29 sept. à 4 h 57 (Toronto), par Cowork. Répond à `DEMANDE-RELECTURE-2026-09-28-lot-F-etape-1.md` (branche `lot-f-les-mots`). **Pas un verdict** : la relecture croisée, par exécution, se fait sur la demande finale. Fichier non suivi sur `main`.

## Tranché par Grégoire

- **L'enregistrement automatique « Toutes les 5 min » : retiré** (option 1). Ses mots : « de toute façon, on ne peut pas produire un backup de 1 Go à chaque 5 minutes ». Motif retenu avec lui : le codex est sa copie de sûreté ; un automate qui l'écrase sans aperçu pourrait remplacer une bonne copie par un état fautif.
  - Retire l'option de l'interface (menu, réglage) et le code du minuteur (`codex.js`, l. ~2564-2635 à l'inventaire) ; un réglage déjà enregistré sur « 5 min » chez un usager est **ignoré** à la lecture (ne réécris pas les préférences pour l'effacer ; rien n'est supprimé des données).
  - Essai : aucun minuteur n'écrit le fichier, même avec l'ancien réglage en base ; mutation (minuteur rebranché) → rouge.
  - Aide et mots : là où l'option était décrite, le texte le dit (tableau avant / après, relu par Grégoire).

## Tranché par Cowork (technique)

- **« Tes derniers changements » = les gestes de l'usager, pas les recalculs de la machine** : juste. Un codex marqué « pas à jour » à chaque ouverture serait le même mensonge dans l'autre sens.
- **Mais un geste qui écrit sans passer par le témoin laisserait le codex « à jour » à tort.** Fais l'inventaire : les écritures déclenchées par un geste (`db.setSync`, `db.set`, `db.modifier` hors du témoin) dans les zones non couvertes par les lots A à E3 (annotations, carte d'alignement, jetons, bilan, portfolio, suivi longitudinal, tirage, élèves suivis…). Pour chacune : **raccorde-la au même point d'accroche** si c'est un geste de l'usager, sans changer ce qu'elle écrit. Liste le tout dans la demande finale (écrivain, geste, raccordé oui / non et pourquoi). Un essai par famille raccordée ; une mutation (accroche retirée) → rouge.
- **La liste des cours réécrite à chaque ouverture, sans geste** : à inscrire (issue 2), comme tu le proposes.

## La suite

Étapes 2 à 4 (les mots), avec le retrait du minuteur et l'inventaire ci-dessus → demande finale avec le tableau complet des textes → relecture croisée de Cowork → mots et Nouvelles soumis à Grégoire → release → verdict WebKit complet → push → porte terrain.
