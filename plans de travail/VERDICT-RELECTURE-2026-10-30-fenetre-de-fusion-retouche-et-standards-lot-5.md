# Verdict de relecture – La retouche des mots de la fusion (#1186) et le lot 5 des standards sans portfolio (#1178)

> Cowork, vendredi 30 octobre 2026, 5 h 42 (Toronto, mesuré par `date`), sur `main` = `df8cf722` (12 commits non poussés). Lu : les deux demandes de relecture ; la sentinelle `lot-n6` (#899) ; le compte des séparateurs de chemin dans `js/` et `index.html`. Vitest et Playwright non rejoués.

## Verdict

**Les deux sont acceptés, sans retouche.**

### La fusion, retouche de mots

- Les mots validés par Grégoire (30 oct., 5 h 09) sont posés ; le break-test rougit.
- **La supposition « Grille sans nom »** (ce que dit chaque côté de « Ta grille en cours ») : retenue.
- Le chemin des captures déplacé : le lot qui n'était pas fini, bien classé.

### Le lot 5 des standards

1. **« › » contre « → » : le texte validé garde son « › ».** Mesuré : « › » est le séparateur de chemin dominant de l'application (247 occurrences contre 99 pour « → ») ; le « → » de #899 était un choix de lot, pas une décision de Grégoire. La sentinelle limitée à cette seule occurrence est retenue. **À inscrire** (issue 2, sans le corriger) : un seul séparateur de chemin dans les textes d'écran, « › », à la place des 99 « → » (dont le récapitulatif de l'assistant, qui montre les deux sur le même écran).
2. **« Variante : Par productions »** au récapitulatif : retenu, c'est le mot du texte 1.
3. **`obtenirTermeProduction` relit les productions à chaque appel** : mémoïsé pendant un pipeline, sans symptôme vécu (son corpus : 11 productions). Issue 3 : un commentaire dans le code suffit.
4. **Les champs morts** : source tarie, stock gardé (« tarir n'est pas réparer ») ; 84,8 inchangé. Les ajouts (gabarits, portfolio par défaut, copie de `pratique-pan-standards.js`) et ce qui est gardé (pack de démo, schémas qui voyagent) : retenus.
5. **Les deux chaînes sans texte validé** (« Toutes les évaluations du portfolio comptent, sans sélection. », la bulle de l'étape de l'assistant) : elles iront avec #1187 et #1188, au prochain lot de mots, avec Grégoire.

Mise en ligne : `CONSIGNE-LOT-2026-10-30-mise-en-ligne-1226.md`, au signal de Grégoire.
