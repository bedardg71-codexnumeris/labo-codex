# Demande de relecture croisée – #944 (1.159.3)

> Écrite le 24 septembre 2026, ≈ 16 h 30 (Toronto), par Claude Code. Branche `bug-944-cartouche-changee` (arbre principal, non poussée) : `5347ca39` (correctif + release), `d742cf30` (porte terrain), puis le commit de l'auto-save et de cette demande. Base : `bb790e78`.
> Règle 2 de `PROTOCOLE.md` : une release. Verdict attendu dans `plans de travail/RELECTURE-2026-09-24-bug-944.md`.

## À cartographier AVANT de lire le patch

1. **Qui pose la cartouche au menu `#selectCartoucheEval`** : sur `bb790e78`, cherche `selectCartoucheEval` et `selC` suivis de `dispatchEvent`. J'en ai trouvé quatre qui simulent un `change` : `evaluation-chargement.js` (le mode Évaluer, `_selectionnerCartoucheProduction`), `evaluation.js` (`_chargerCartoucheDropdownModif`, restauration des sélections « en série ») et `travaux-ui.js` (restauration du cache). Plus trois qui appellent `cartoucheSelectionnee()` directement. **La question qui compte** : en existe-t-il un cinquième ? Il ouvrirait la confirmation tout seul à l'ouverture d'une copie.
2. **Où la règle #939 est lue** : `_commentaireEnregistreDuCritere` (écran), `commentaireDuCritere` (PDF et texte copié). Le PDF lit l'évaluation ENREGISTRÉE, le texte copié lit les divs `comm_`.
3. **Qui enregistre sans geste** : l'auto-save (`_debouncerAutoSave`) lit le menu au moment où il écrit.

## Ce que le lot fait, et où regarder

- `choisirCartoucheEval` (branché dans `index.html`) : la question n'est posée que si la copie a un commentaire enregistré qui fait foi ET que la cartouche choisie diffère de celle de l'évaluation. Pendant la question, le menu montre l'ancienne cartouche (pour l'auto-save).
- `_remplacementConfirme` + `_remplacementConfirmeActif` : une copie, une cartouche. L'état s'éteint de lui-même quand l'évaluation enregistrée porte la nouvelle cartouche : c'est ce qui rend #939 de nouveau protecteur.
- `poserCartoucheParChargeur` : la marque des chargeurs.

## Deux points où j'aimerais un second regard

- **L'auto-save pendant la question** : je remets le menu à l'ancienne cartouche AVANT d'ouvrir la fenêtre. Un auto-save déjà armé qui tombe pendant la question écrit donc l'état d'avant. Le vois-tu écrire autre chose ?
- **Réponse « Remplacer », puis la copie quittée sans « Enregistrer »** : mesuré en écrivant cette demande. Les niveaux restaurés arment l'auto-save, qui écrivait les nouveaux commentaires mais PAS `cartoucheId` : la base aurait porté les commentaires de la révisée sous le nom de l'ancienne. Corrigé dans le lot (`_majEvaluationExistanteAutoSave` : la cartouche part avec les commentaires, seulement quand un remplacement confirmé est actif pour cette copie ; deux essais, M8 et M9 rouges). Conséquence à dire à Grégoire : « le prochain enregistrement » inclut l'auto-save, soit quelques secondes après « Remplacer ». Sur une copie verrouillée, l'auto-save n'écrit rien (garde existante) : seul « Enregistrer » fixe.

## Preuves

Bloc #944 de `tests/unit/sentinelle-939-commentaire-critere-meme-regle.test.js` (9 essais) ; `tests/integration/cartouche-changee-copie-evaluee-944.spec.js` (3/3). Rouges sans le correctif ; neuf mutations (une par clause) rouges. Vitest 634/634 fichiers, 7364/7364 essais ; 18 specs voisines 46/46 (sur `5347ca39`).

## Ligne des Nouvelles à soumettre à Grégoire (`js/changelog-data.js`, 1.159.3)

« Évaluer : sur une copie déjà évaluée, choisir une autre cartouche au menu propose maintenant de remplacer ses commentaires par ceux de la nouvelle cartouche. Tu confirmes ou tu gardes les commentaires actuels ; une cartouche retouchée ailleurs ne change toujours pas une copie déjà évaluée. »
