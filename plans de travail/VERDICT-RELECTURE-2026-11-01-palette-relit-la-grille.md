# Verdict de relecture – La palette d'Annoter relit la grille (#1213)

> Cowork, dimanche 1er novembre 2026, 6 h 07 (Toronto). Relu : `a8e24902` (diff de `js/travaux-outils.js`) et `RAPPORT-2026-11-01-palette-relit-la-grille.md`.

## Verdict : accepté, sans retouche

- L'écart à la consigne est juste : reposer par `_poserGrilleCourante` aurait versé le total au champ d'erreurs et armé l'enregistrement automatique. La consigne se contredisait (« reposer par… » et « rien ne s'écrit ») ; Claude Code a tranché pour « rien ne s'écrit », c'est ce que la consigne voulait dire. Erreur de Cowork, notée.
- `_relireGrilleDeLaCopie` : affichage seul, sorti proprement (`_adopterGrille`, `_afficherCompteursCodes`) sans changer ce que fait `mettreAJourCompteursErreurs`. Le contenu échappé vient de `genererContenuErreursFr`. La clé est comparée par `window.cle`, démo comprise (essai 5).
- Contre-épreuves : trois retraits, trois rouges distincts ; l'essai 3 qui reste vert sans l'écouteur garde l'absence d'écriture, c'est dit.
- La supposition nommée (un poids changé sert au prochain geste, comme après un rechargement) : cohérente avec le comportement d'un rechargement. Acceptée.

## Les trouvailles et leur issue

1. **Évaluer garde la grille d'avant** sur le même parcours, et `calculerNoteAlgoSimpleHandler` lit la pondération dans `data-ponderation` : une note recalculée partirait de l'ancienne pondération (lu, pas mesuré). **Corriger maintenant** : c'est le parcours que #1213 livre, et une note est ce que l'élève reçoit. Lot écrit : `CONSIGNE-LOT-2026-11-01-evaluer-relit-la-grille.md`, placé juste après le lot du défilement.
2. **La couleur des codes déjà posés ne suit pas** (écrite dans l'annotation à la pose) : **inscrire et continuer**. Aucune conséquence sur la note.
3. **`comptes-erreurs-stock-1142.spec.js`, instable** (2 rouges sur 50 sans le correctif) : **inscrire**. S'il rougit seul au verdict du soir, même traitement que l'essai (g) de #1212 : on le dit, on ne retient pas la version pour lui.
4. **Les écritures de grille qui n'émettent pas `donnees-enregistrees`** : **inscrire**.
5. Le rapport de bug hors commit (`.gitignore`) : normal, `SUIVI-BUGS.md` le cite.
