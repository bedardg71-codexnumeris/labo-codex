# Demande de relecture croisée, AVANT fusion – lot #959 « une évaluation ouverte depuis sa copie garde son statut d'intégrité »

> Écrite le 26 septembre 2026, vers 16 h 30 (Toronto), par Claude Code. Branche `lot-959-statut-integrite` (arbre principal), base `98a0fc0b` (1.160.0, poussée ; jeton Playwright local vert sur ce commit – mesuré au début de la session). Commits : `208de686` (correctif, banc, consignes) et celui qui porte cette demande. **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-lot-959.md`. Un texte attend l'accord de Grégoire (§ 5).
>
> Pour lire le code sans changer de branche : `git diff 98a0fc0b..lot-959-statut-integrite -- js/ index.html tests/`.

## 1 · Mesure d'abord (§ 3.1 de la consigne) – par la copie, AVANT correctif

Banc WebKit `tests/integration/evaluation-959-copie-garde-statut-integrite.spec.js`, trajet des specs #699 / #882 (plus `preRemplirEvaluation` qui pose « importe » d'abord). Évaluation semée avec une valeur non par défaut partout : échelle `E959B` (pas celle de la production), remise « annote », intégrité « IA » + notes, points analytiques `c2: 24`, critère algorithmique `c3` (7 erreurs, 460 mots), niveau `c1: E`.

| Champ | Par la copie, avant | Par « Modifier » (Liste) |
|---|---|---|
| `echelleId` | gardé | gardé |
| `statutRemise` | gardé | gardé |
| **`statutIntegrite`** | **perdu** (« recevable ») | gardé |
| **`notesIntegrite`** | **perdu** (vide) | gardé |
| `pointsAnalytiques` | gardé | gardé |
| `donneesAlgorithmiques` | gardé | gardé |
| niveaux des critères | gardés | gardés |
| `cartoucheId` | gardé – banc #946 | – |
| `optionsAffichage` | gardé – banc #882 | cochées par défaut (choix du 24 fév.) |
| `retroactionFinale` | **régénérée** depuis les critères | **régénérée** aussi |

⮕ Le soupçon du § 2 (points, catégories) ne se confirme pas : ces valeurs viennent de `evaluationEnCours`, que les deux chemins remplissent. **Seules les deux valeurs d'intégrité se perdent.**

⮕ **Trouvaille hors lot, sans disposition arrêtée** : une rétroaction finale réécrite à la main est remplacée à l'ouverture par le texte régénéré, **par les deux chemins**. Pas d'entrée au BACKLOG : aucun symptôme vécu par Grégoire (règle du 24 août). À toi de dire si tu la vois autrement.

## 2 · Le correctif – un seul chargeur

`verifierEtChargerEvaluationExistante` (chemin de la copie) ne pose plus la remise lui-même : il appelle `_chargerStatutsEtBadgesModif`, la fonction de « Modifier ». Deux conséquences à regarder :

1. **La traduction des anciens statuts de remise** (`non-remis` → `non-recu`, `remis` → `evalue`) vivait dans le seul chemin de la copie ; elle est passée dans le chargeur partagé. Pour « Modifier », c'est un changement : une valeur ancienne se posait dans le menu sans option et se relisait vide à « Enregistrer ». **Non couvert par un banc** (je n'ai pas semé d'ancien statut).
2. **Le chargeur partagé émet `change`** sur la remise et l'intégrité, ce que le chemin de la copie ne faisait pas. `changerStatutRemise` → `cartoucheSelectionnee()` si une cartouche est en cours (le chemin l'appelle de toute façon la ligne suivante) ; pour une remise « non-recu », il vide la liste des critères avant que `cartoucheSelectionnee()` la redessine – **même ordre que « Modifier »**, non mesuré sur ce chemin.

**Ce que j'ai ajouté en plus, parce que le correctif le rendait nécessaire** : dans la branche « aucune évaluation » du même chargeur, le menu d'intégrité revient à « recevable » (par `change`, donc `changerStatutIntegrite` vide les notes). Motif mesuré : sans cela, après une copie « IA », la copie de l'élève suivant sans évaluation montrait « IA » **avec les notes de l'élève précédent**, que l'enregistrement aurait écrites dans sa nouvelle évaluation. Aucun geste ne remettait ce menu à zéro (`grep` : aucun écrivain de `statutIntegrite.value` hors des deux chargeurs). Cela vaut aussi, désormais, après « Modifier » suivi de la flèche vers un élève sans évaluation (#920).

## 3 · Anonymisation

Le chargeur partagé passe par `poserChampTexteLibre` (lot A) : notes masquées à l'écran, champ désactivé, mention. `_lireChampsDOMMod` retire alors `notesIntegrite` et la fusion garde celles de la base. Mesuré par la copie en anonymisation : statut « IA » à l'écran, notes masquées, base réécrite avec `ia` + notes intactes.

## 4 · Preuves

- **Rouge avant** (code de `98a0fc0b`) : par la copie, `statutIntegrite` et `notesIntegrite` rouges ; cas anonymisation rouge (statut « recevable », champ non masqué).
- **Vert après** : les 4 tests, `--repeat-each=3` → 12 / 12 (WebKit).
- **Témoin par la Liste** : vert après, et vert sous la mutation M1. ⚠ Avant correctif, il n'a pas été jugé : sa première version attendait à tort la restauration des options (que « Modifier » ne fait pas) – corrigé dans le banc, pas dans le code.
- **Mutations**, restauration par copie, empreinte vérifiée :
  - M1 – appel à `_chargerStatutsEtBadgesModif` retiré du chemin de la copie → 3 rouges (copie, anonymisation, cas voisin par son témoin « IA posé »), témoin Liste vert.
  - M2 – remise à « recevable » retirée → le cas voisin seul rouge.
  - ⚠ Le cas voisin est un garde de MON correctif, pas un « rouge avant / vert après » : avant, la copie ne posait jamais « IA ».
- Specs voisines WebKit (699, 882, lot A, 944, 946, lot 2, lot 3) : 25 / 25.
- Vitest complet : 642 fichiers, **7 452 / 7 452**, aucune « Errors ».
- Verdict Playwright complet : **pas encore** – après ta relecture et les corrections.

**Stock** : une évaluation déjà remise à « recevable » par ce chemin ne retrouve pas son statut ; rien n'est réécrit, rien n'est effacé. Non mesuré (demande de Grégoire).

## 5 · Le texte que Grégoire doit accepter avant le push

**Nouvelles** (proposition de Cowork ; les champs perdus mesurés sont bien le statut et les notes, elle tient telle quelle) : « Évaluer : une évaluation ouverte depuis la copie garde son statut d'intégrité et ses notes quand tu l'enregistres. »

## 6 · Ce que je te demande de regarder en particulier

1. Les deux conséquences du § 2 (traduction des anciens statuts pour « Modifier », `change` émis sur la remise) : y a-t-il un chemin où la remise « non-recu » ou un ancien statut se comporte autrement qu'avant ?
2. La remise à « recevable » dans la branche « aucune évaluation » : un trajet où cette branche s'exécute alors qu'une évaluation « IA » est encore en cours d'ouverture (course avec `modifierEvaluation`, garde `_modifierEvaluationEnCours`) ?
3. La disposition de la rétroaction régénérée (§ 1).
