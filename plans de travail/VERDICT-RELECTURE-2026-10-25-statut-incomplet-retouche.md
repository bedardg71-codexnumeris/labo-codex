# Verdict de relecture – retouche du statut « Incomplet ; travail en cours »

> Cowork, dimanche 25 octobre 2026, 11 h 53 (Toronto). Relu : `f7d29bd3` (`evaluation-sauvegarde.js`, `synthese-retroaction-data.js`, `travaux-ui.js`), le rapport relayé par Grégoire à 11 h 52.

## Verdict : accepté

- **PDF** : `sansNiveauxSiTravailEnCours` (`synthese-retroaction-data.js`) lit une vue sans critères ; la base garde les niveaux (réversible). La règle est celle du registre, pas une recopie.
- **L'historique de l'élève** (décision de Claude Code, prise seule) : la même vue pour les copies antérieures, pour qu'une copie suivante ne compare pas ses niveaux à un brouillon masqué. Juste : c'est le lot qui garde ces niveaux en base ; break-test démontré.
- **La pastille** : l'état réel vient de `travauxUI.statutPastilleFichier`, exporté, sans recopie ; l'affichage passe par `afficherPastilleActive`, extrait de la sélection.
- **Spécifications** : aucun code changé ; deux tests fixent la règle (1/2 avec la copie incomplète, 2/2 sans le statut).
- **Contraste** : inscrit (#1162).

## Dispositions

- Trouvaille (le banc `critere-algorithmique-dit-vrai.spec.js`, essai #1131, rouge sous WebKit depuis `9b70e1b1`) : **corriger avant la version du soir** – la vérification complète du soir la rencontrerait. Consigne : `CONSIGNE-LOT-2026-10-25-banc-critere-algo-1131.md`.
