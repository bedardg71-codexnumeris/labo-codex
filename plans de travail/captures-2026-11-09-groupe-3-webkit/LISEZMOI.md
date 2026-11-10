# Groupe 3, vérifications sous WebKit avant le verdict (9 nov. 2026)

Prises sur `main` local après l'assemblage du groupe 3, Playwright WebKit, Mac, par les bancs des lots en mode capture (`CAPTURES_PARCOURS`, `CAPTURES`). Noms fictifs.

| Capture | Ce que la bulle couvre |
|---|---|
| `p9-etape-1-820-sombre-standards.png` | Parcours 9, étape 1, 820 px : la bulle (en pages, 1/3) se pose sous « + Nouvelle pratique », qui reste libre ; elle couvre le milieu de la carte vide « Choisis une pratique ». |
| `p9-etape-1-1180-sombre.png` | Même étape à 1180 px : même chose, « + Nouvelle pratique » libre, la carte vide couverte au centre. |
| `p3-2-fiche-1180-sombre-niveaux.png` | Parcours 3, étape 2, sur la fiche (1180 px, 1/2) : « Créer la production » et les menus Grille, Échelle, Cartouche libres ; la bulle couvre la bande d'étapes (Objectif…), le milieu du champ « Nom de la production », la droite du menu « Type » et le début de la description du type. |
| `p3-8-fiche-1180-sombre-niveaux.png` | Parcours 3, étape 8, la matrice (1180 px, 1/2) : « Créer la cartouche » libre ; la bulle couvre la fin du menu « Grille », le menu « Type de travail », l'étape « Commentaires » de la bande, et les en-têtes de niveaux I, P, S (et le début de R) de la matrice. Dans cette prise, les cases de la première rangée restent à découvert, juste sous la bulle (connu et accepté pour ce groupe). |
| `standards-820-sombre-debut.png`, `-fin.png` | Tableau de notation à 820 px : au début, la quatrième colonne est coupée au bord de « Note provisoire » (« Pro… » pâli) ; à la fin, la deuxième est coupée à gauche (« …n 2 » pâli). Le bord estompé se voit, mais faiblement : c'est le titre pâli qui le signale, plus qu'un dégradé. |

Pas pris : le parcours 5, étapes 3 et 6. Sous WebKit, son banc passe d'abord par le parcours 3, qui rougit à l'étape 9 (le contour décalé de 298 px sur « Cartouche de rétroaction ») : voir le rapport de l'assemblage.
