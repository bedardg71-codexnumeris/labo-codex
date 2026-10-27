# Verdict de relecture – La note remise (#1173)

> Cowork, mardi 27 octobre 2026, 08 h 40 (Toronto, mesuré par `date`). Relu : `d95f1a84` et `04489237` (18 fichiers) ; la demande de relecture ; dans `evaluation-calcul.js` les fonctions neuves (`ligneNoteRemise`, `evaluationRemiseAffichee`, `_afficherCriteresAlgoRemis`, `_calculActuelRedonne`, `afficherCalculActuel`, `_recalculerCriteresAlgorithmiques`) : tout s'écrit par `textContent` ; le CSS ; la capture à 820 px en clair. `main` = `04489237`, non poussé.

## Verdict : accepté ; deux retouches, à faire en tête du lot 4b

Le point d'appui est le bon : la copie remise se retrouve en base au bout de `calculerNote`, si bien que les deux chemins d'ouverture et les recalculs différés y passent tous. `noteCalculeeCourante` porte la note remise : un enregistrement qui passerait malgré le verrou réécrirait la même note. Déverrouiller recalcule sans événement, donc sans écriture. La comparaison se fait sur les nombres affichés. La phrase sous les cartes est posée parce que la preuve la rend vraie. Le PDF lisait déjà la base : bien mesuré.

- **§ 2.2, la fixture du piège 2 du lot 4a corrigée** : acceptée. La conclusion de 4a tient ; son 85 venait de la fixture, pas du changement.
- **§ 3.1, la liste A2025 / H2026 en trois copies, « commenter et oublier »** : acceptée. La décision du 1er sept. est sans retour : la liste ne bougera pas.
- **§ 3.3 et 3.4** : acceptées.

## Les retouches

1. **La ligne sans liseré.** `.boite-note-finale .note-remise` pose `border-left: 3px`. Grégoire l'a dit le 24 oct. : pas de liseré, des bordures égales sur les quatre côtés. Bordure d'un pixel tout autour, même couleur (`--alerte-bordure-information`). Les encadrés existants ne sont pas à ce lot.
2. **Les sept avertissements du crochet de pré-commit** sur les données fictives de `tests/integration/note-remise-1173.spec.js` : acquitte-les par `// security-ok: fixture …`, la convention des autres bancs.

Ni l'une ni l'autre ne touche le comportement ; la spec du lot rejouée seule suffit.
