# Verdict de relecture – #1007, lot 2a-2 : le codex proposé sur les gestes qui restent

> Écrit par Cowork le 3 octobre 2026 à 11 h 24 (Toronto, mesurée par `date`), sur `719c9544` (branche locale `claude/1007-propose-codex-2`) et la demande `DEMANDE-RELECTURE-2026-10-03-1007-propose-codex-2.md`.
> Lu : le diff de `js/codex.js`, `js/evaluation-jetons.js`, `js/modal-doublon.js`, `js/travaux-ui.js`, `js/travaux-annotation.js`, `js/saisie-presences.js` ; le début d'`appliquerJetonReprise` jusqu'à la proposition. Non rejoué : les bancs (montage de Cowork sans navigateur).

## Verdict

**Vert, aucune correction de code.**

- **P12, la relance** : rien avant le point de proposition n'a d'effet (lectures, gardes, notifications d'erreur qui rendent `null`) ; la relance avec `codexPropose` relit tout et revérifie les gardes. Juste. Si une garde refuse à la relance (le lot a consommé un jeton entre-temps), la fonction rend `null` sans `codexRefuse` : l'appelant traite comme un refus ordinaire. Juste.
- **L'import en lot** : un seul codex proposé, `break` sur « Annuler ». Accepté tel quel, avec ta supposition (§ 7) : les fichiers restent importés comme reprises sans jeton, état déjà connu (refus d'une limite).
- **P10, P11** : la condition est lue avant l'attente, l'écriture après ; la modale empêche tout autre geste dans l'éditeur. Accepté. Fusion et pages retirées dans le même enregistrement : la phrase ne nomme que la fusion. Commenté, sans suite.
- **P5, P14** : relus après l'attente, comme demandé. Juste.
- **P21** : `null` sur « Annuler », lu par les cinq appelants (ta sentinelle). Juste.
- **La copie importée** : la fenêtre vient avant les deux `confirm`. Juste.

## Trouvé par Claude Code : les vérifications planifiées de GitHub annulées côté WebKit

**Tranché par Cowork : commenté, pas inscrit.** Chaque mise en ligne passe par le verdict complet local (`pousser.sh`), qui juge WebKit ; c'est lui qui porte la règle 2. Le run planifié de GitHub n'était qu'un filet entre deux releases. À reprendre s'il manque un jour à un symptôme vécu.

## Les mots

Acceptés par Grégoire (« oui », 11 h 25) : les phrases du § 3 de la demande et la ligne des Nouvelles du § 6, **avec quatre retouches de Cowork** :

| Clé | Première phrase retenue | Pronom |
|---|---|---|
| \`remplacement\` | Remplacer celle qui porte déjà ce nom l'efface pour de bon. | la |
| \`seance\` | Réinitialiser cette séance efface pour de bon ses présences et ses notes. | les |
| \`annotationsPage\` | « Effacer tout » efface pour de bon les annotations de cette page. | les |
| \`registreLongitudinal\` | Retirer cet·te étudiant·e du registre efface pour de bon sa copie et ses résultats ultérieurs. | les |

Les six autres phrases, telles quelles.
