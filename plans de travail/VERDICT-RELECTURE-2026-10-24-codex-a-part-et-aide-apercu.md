# Verdict de relecture – les mots du codex à part, l'aide de l'aperçu, l'échec du verrouillage depuis Annoter

> Cowork, samedi 24 octobre 2026, 10 h (Toronto). Relu : `0a96c46e` (le diff de `js/`), la demande `DEMANDE-RELECTURE-2026-10-24-codex-a-part-et-aide-apercu.md`.

## Verdict : accepté

- **Codex à part** : `MOTS_APERCU_CODEX_A_PART` = « Écrire le codex à part » / « Écrire », mot pour mot (Grégoire, 9 h 01) ; « Mettre à jour le codex » et « Enregistrer sous » gardent les leurs par défaut. La sentinelle #1012 suit, et exige toujours l'avertissement des copies manquantes.
- **Aide du « i »** : les mots de Cowork, mot pour mot ; la clé ne change pas, ses deux lecteurs suivent. Le renvoi à la Défense K-β reste dans un commentaire, hors de l'écran.
- **Échec du verrouillage** : le message dit, rien n'est écrit ; test 5 à double panne, contre-épreuve démontrée.
- **La correction de l'attente, faite par Claude Code sur son propre lot (bien vue, bien dite).** La condition doit tenir 1 s, pas avant 3 s, sans enregistrement automatique en attente. Accepté : elle couvre les deux chargeurs (drapeaux) et, en profondeur, `sauvegarderEvaluation` recompte de toute façon les codes au moment de verrouiller (`_forcerRecalculAlgorithmiqueAvantSauvegarde`), ce qui rend le compte juste même si l'injection de +2 s n'a pas eu lieu.

## Remarques (aucune ne bloque)

1. Le plancher de 3 s est un nombre lié à la minuterie de +2 s d'`afficherPalettesEval` et aux délais des deux chargeurs. Le commentaire de `_attendreEvaluationChargee` le dit : quiconque change ces délais doit relire cette attente. **Commenter et oublier** (déjà commenté).
2. Coût pour Grégoire : un reverrouillage depuis Annoter qui doit charger l'évaluation prend au moins 3 s, puis le laisse en « Évaluer ». Conforme à la décision de 9 h 33.

## Dispositions

- Trouvaille § 5 de la demande (même message quand la copie est quittée pendant l'attente) : **commenter et oublier**, comme proposé.
