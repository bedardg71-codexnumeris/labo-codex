# Demande de relecture – Lot 6, la retouche du § 2 (#1159)

> Claude Code, dimanche 25 octobre 2026, soir, sur la branche `bibliotheques-deux-colonnes`, dans le même commit que le verdict de Cowork (`VERDICT-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-6.md`). Rien n'est fusionné, publié ni poussé (verdict, § 3 : on attend).

## 1. Les mots (§ 2.1)

| Geste | Avant | Maintenant |
|---|---|---|
| « Mettre de côté » d'un cours | « Cours retiré de ta sélection » | « Cours mis de côté. » |
| « Remettre dans mes cours » | « Cours ajouté à ta sélection avec succès ! » | « Cours remis dans tes cours. » |
| « Mettre de côté » d'un groupe-cours | « Groupe-cours masqué » | « Groupe-cours mis de côté. » |
| « Remettre dans le menu » | « Groupe-cours affiché » | « Groupe-cours remis dans le menu. » |
| « Exporter tous mes cours », sans cours | « Aucun cours à partager dans ta sélection » | **« Aucun cours à exporter. »** |

La dernière ligne est **un mot que j'ai choisi** : la règle du § 2.1 (« plus aucune notification de ces trois fenêtres ne dit « ta sélection » ») l'atteignait, et le verdict ne lui donnait pas de mot. Mesuré par `grep` : plus aucune notification de `cours.js`, `trimestre-v2-liste.js` ni des gestes de la bibliothèque des groupes-cours ne dit « ta sélection », « masqué » ni « avec succès ». Les messages des gestes de l'import et de l'export (« Import terminé », « … exporté avec métadonnées Creative Commons ! ») ne portaient aucun de ces mots : inchangés.

**Preuve** : le banc `bibliotheque-liste-1159` relève les notifications de succès pendant « Mettre de côté » puis « Remettre… » (cours et groupes-cours), à 1440 et 820 px. Deux break-tests (l'ancien mot remis dans chacun des deux fichiers) → ROUGISSENT. `sentinelle-678` B.b réancré sur « Aucun cours à exporter. », motif écrit.

## 2. Le code mort (§ 2.2)

| Retiré | Où | Lecteurs mesurés avant (`grep` dans `js/`, `index.html`, `design-system.html`, `tests/`) |
|---|---|---|
| `BibliothequeUI.formaterMetadonnees` | `bibliotheque-ui.js` | aucun dans `js/` ; deux essais de `sentinelle-467` (A.a, A.b), trois doublures de tests |
| `BibliothequeUI.formaterAttribution` | `bibliotheque-ui.js` | **son seul lecteur était `formaterMetadonnees`** : orphelin par ce retrait, il part avec lui (non nommé par le verdict ; « est-ce que je viens de le rendre orphelin ? » : oui) ; un commentaire de `grilles.js` le nommait, réécrit |
| La branche `{onclick}` de `_btnAttrs` et `onclickToDataAttrs` | `bibliotheque-ui.js` | aucun appelant ne passe `onclick` |
| `genererBadgeSourceProduction` | `productions.js` | aucun |
| `genererIdCourtProduction` | `productions.js` | **aucun** : son voisin, orphelin depuis le même lot 3 ; non nommé par le verdict, retiré dans le même esprit, et je le dis |

Aucun de ces noms n'est dans `noms_stables.json` (vérifié).

**Les essais qui partent, et pourquoi** : `sentinelle-467` A.a et A.b ne lisaient que `formaterMetadonnees` ; l'échappement d'une ligne de rangée est éprouvé par le banc `bibliotheque-liste-1159` (nom hostile). Les doublures `formaterMetadonnees` de `refactor-trimestre-v2`, `refactor-productions` et `sentinelle-452` sont retirées.

**La sentinelle** `sentinelle-bibliotheques-liste-1159` s'étend : les cinq noms au détecteur du `grep` nul ; `formaterMetadonnees` et `formaterAttribution` absents de l'objet ; un essai neuf : un bouton qui passerait encore `{onclick}` ne reçoit plus aucun attribut (ni `data-action`, ni rien de brut). Break-tests : `genererIdCourtProduction` remis dans `productions.js` → ROUGIT ; la branche `onclick` remise → le `grep` ET l'essai neuf ROUGISSENT. (Une première version de l'essai neuf rougissait pour une mauvaise raison, l'échappement absent du chargement : corrigé avant de compter le break-test.)

**#467 descend encore de deux** : les interpolations nues de `bibliotheque-ui.js`, 21 → 19 (les paramètres bruts de `onclickToDataAttrs`).

## 3. La preuve

- Vitest : 9 694 verts sur 9 695 ; le seul rouge reste l'anticache de `js/gabarits-utils.js` (lot 1, résorbé à la release). Les jetons `?v=` des cinq fichiers retouchés sont bumpés.
- Playwright : `bibliotheque-liste-1159` et `bibliotheque-deux-colonnes-1156` (les productions, pour `productions.js`) : 32 verts, 2 sautés (captures). Aucun fichier modifié pendant la course.

## 4. Mes écarts

- « Aucun cours à exporter. » (§ 1), mot à moi.
- `formaterAttribution` et `genererIdCourtProduction` retirés sans être nommés par le verdict (§ 2).
