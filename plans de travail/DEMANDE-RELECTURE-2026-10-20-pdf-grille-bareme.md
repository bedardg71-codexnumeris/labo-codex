# Demande de relecture – le PDF de la grille lit le barème (#1120, une part du geste 4)

> Claude Code, mardi 20 octobre 2026, vers 18 h 20 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-pdf-grille-bareme.md`. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**, sans numéro de version. **Pas de verdict complet** : il tourne ce soir, au signal de Grégoire.

## À regarder d'abord : les captures

Dans `plans de travail/captures-2026-10-20-pdf-grille-bareme/` (la feuille de la grille ; la page 1, celle des consignes, ne change pas) :

| Fichier | Ce qu'il montre |
|---|---|
| `1-journal-de-lecture-apercu.png` | L'aperçu : le « Journal de lecture A26 » recréé (quatre critères analytiques, quatre tranches chacun, aucune échelle ; textes fictifs) |
| `1-journal-de-lecture-pdf.png` | La page 2 du vrai PDF jsPDF, même grille (`1-journal-de-lecture.pdf` à côté) |
| `2-grille-mixte-apercu.png` | Une grille mixte : deux holistiques et un critère à barème, avec l'échelle de la démo |
| `2-grille-mixte-pdf.png` | La page 2 du PDF, même grille (`2-grille-mixte.pdf`) |

Dans les deux captures de l'aperçu, la barre d'options de la modale recouvre le haut de la feuille (le titre). C'est un effet de la capture : le tableau, lui, est entier.

## Ce que le commit change

| Quoi | Où | Comment le vérifier |
|---|---|---|
| La ligne lue par l'élève | `js/bareme.js`, `pointsAvecUnite`, `ligneEleve` | « 3-4 points : texte », trait court, « point » sous 2 (la règle C1 de la dissection), accord sur la borne haute (« 0-1 point ») ; espace insécable avant le deux-points. |
| Le tableau décidé une fois | `js/export-pdf.js`, `tableauDesCriteres`, `entetesColonnesTableau` | Les deux rendeurs le posent. Les tranches passent par `bareme.tranchesDuCritere` (invariant 2) ; le PDF ne relit rien lui-même. |
| L'échelle exigée seulement si un critère en lit une | `echelleExigee`, `grilleEvaluable`, `grilleParId`, `accorderEchelleRequiseInline` | Les trois portes vivantes : `ouvrirApercuPDFPour` (la fiche), `mettreAJourOptionsInlinePDF` (le bouton et l'astérisque), `ouvrirApercuPDFDepuisInline`. |
| Une grille mixte sans échelle | `tableauDesCriteres` rend `null` | Avant, `echelle.niveaux` sur une échelle absente plantait le rendu (production avec consignes, grille, sans échelle). Maintenant : aucun tableau. |
| Les bancs et leurs harnais | `tests/unit/_helpers/charger-script.js` | Le vrai `bareme.js` est posé dans le bac à sable, sur le modèle de `taille-fichier.js` (#993). La sentinelle I.a de `bareme-1-editeur` compte maintenant `export-pdf.js` parmi les lecteurs (un affichage, aucun calcul). |
| Cliquets abaissés | `complexite-fonctions-30.json`, `masquages-cle-642.json` | Les deux rendeurs passent de 32 à 29 ; `ouvrirApercuPDFPour` passe de 34 à 33. Deux masquages de `cle` en moins. Aucune hausse assumée. |
| Jetons anticache | `index.html` | `bareme.js?v=20261020c`, `export-pdf.js?v=20261020b`. |

## Preuves

- **Vitest** `bareme-3-pdf-grille.test.js`, 16 cas. Le cas C compare l'aperçu (vrai DOM JSDOM) à l'appel `autoTable` capturé, ligne par ligne, en-têtes compris, pour une grille toute à barème et pour une grille mixte.
- **WebKit** `bareme-3-pdf-grille.spec.js`, 3 cas : (a) la fiche, sans échelle ; (b) la grille mixte ; (c) le formulaire. 15 sur 15 en `--repeat-each=5`.
- **Break-tests**, code restauré après chacun :
  - nom de tranche réintroduit dans `ligneEleve` : 3 Vitest et 2 WebKit rouges ;
  - `echelleExigee` qui rend toujours vrai : 7 Vitest et 2 WebKit rouges ;
  - `escapeHtml` retiré de la tranche : S.a rouge.
- **Vitest complet** : 9 294 sur 9 294.
- **WebKit, specs du PDF et du barème** : 19 sur 19. Fichiers : `bareme-1`, `bareme-2-aide`, `bareme-3-pdf-grille`, `fiche-production-apres-pdf`, `ce-que-l-eleve-lit-703-705`, `eleve-supprime-masque-1013`, `lot3-analytique-niveau`.

## Suppositions à confirmer ou corriger

1. **De Cowork, réversible** : une tranche « à compléter » montre son texte seul, sans chiffre (L.d).
2. **De Claude Code** : une tranche sans points et sans texte ne montre rien. Elle n'occupe pas de ligne vide.
3. **De Claude Code, mot que les élèves liront** : dans une grille toute à barème, l'en-tête de la colonne unique est « **Barème** ». C'est le mot retenu par Grégoire pour l'application. Je le soumets parce qu'il s'imprime.
4. **De Claude Code** : un critère analytique **sans** barème lit encore l'échelle, comme avant. Une grille qui en contient un garde donc l'échelle exigée. La consigne ne visait que la grille dont tous les critères ont un barème.
5. **De Claude Code, disposition** : dans une grille mixte, la case du barème couvre toutes les colonnes de niveaux (`colspan`, `colSpan` dans jsPDF), une tranche par ligne. Pas de gras sur les points : jsPDF ne met pas une partie de case en gras sans dessin à la main, et l'aperçu doit dire la même chose que le PDF.

## Hors lot, nommé

- **Inscrire et continuer** (#1128, avec les deux inscriptions du verdict de #1127) : les chemins morts (`afficherFormulairePreparationPDF`, la modale `exportPDF-*`) n'ont pas été adaptés et exigent encore l'échelle.
- **Commenter et oublier** : une production avec consignes, liée à une grille mixte et sans échelle, s'ouvre. Le cran « + Évaluation » y reste offert, puis sa feuille est vide (`cransDisponibles` ne voit pas l'échelle). Avant ce lot, ce rendu plantait. Aucun symptôme vécu.
- La copie corrigée (geste 4), le calcul, la note : non touchés.
