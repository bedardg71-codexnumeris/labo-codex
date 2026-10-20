# Verdict de relecture – le PDF de la grille lit le barème (#1120)

> Cowork, mardi 20 octobre 2026, 18 h 21 (Toronto, mesuré par `date`). Commit relu : `67298a8d` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-20-pdf-grille-bareme.md`.

## Verdict : accepté, deux en-têtes soumis à Grégoire

Le code fait ce que la consigne demande. Le tableau se décide une fois (`tableauDesCriteres`) et les deux rendeurs le posent ; les tranches passent par `bareme.tranchesDuCritere`, qui ne lit que les critères analytiques (vérifié dans `bareme.js` : `critere.type !== 'analytique'` rend `[]`) : un critère holistique à descripteurs n'est donc jamais pris pour un barème, et sa grille garde l'échelle exigée. Les captures du PDF et de l'aperçu disent la même chose, ligne pour ligne.

## Ce que la relecture a trouvé

- **L'en-tête « % » au-dessus de points.** La colonne de la pondération s'intitule « % » (code d'avant ce lot). Sur une grille toute à barème, la pondération est le maximum de points du critère (#941) : sur « Journal de lecture A26 », l'élève lirait « % » au-dessus de 5, 5, 10, 10, total 30. Mots que les élèves lisent : **soumis à Grégoire**, avec l'en-tête « Barème » (supposition 3 de la demande).
- La grille du banc n'est pas « Journal de lecture A26 » recréée (quatre critères à 4 points, tranches en ordre décroissant) : sans effet, l'ordre écrit est respecté.
- Un critère de l'ancien format dont le texte porte ses points après un retour à la ligne (le premier « Journal de lecture », #1125) : le PDF garde le retour, l'aperçu le resserre en espace. Couvert par #1125 ; **commenter et oublier** ici.

## Les suppositions de la demande

1. Tranche à compléter, texte seul : retenu (Cowork).
2. Tranche sans points ni texte, rien : retenu.
3. « Barème » en en-tête : **soumis à Grégoire**.
4. Un critère analytique sans barème lit encore l'échelle : retenu.
5. Une case sur toute la largeur des niveaux, sans gras : retenu.

## La décision de Grégoire (20 oct., 18 h 22)

Les deux recommandations de Cowork, retenues : « Barème » reste l'en-tête de la colonne des tranches ; sur une grille dont tous les critères ont un barème, l'en-tête « % » devient « Points ». Ailleurs, « % » reste.

## Suite

Une correction courte sur ce lot : `CONSIGNE-LOT-2026-10-20-pdf-grille-bareme-entete-points.md` (écrite à 18 h 22).
