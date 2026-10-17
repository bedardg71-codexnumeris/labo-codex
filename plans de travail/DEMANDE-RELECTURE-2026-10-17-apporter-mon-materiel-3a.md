# Demande de relecture – « Apporter mon matériel », lot 3a

> Claude Code, samedi 17 octobre 2026, matinée (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3a-roles.md`, via `CONSIGNE-DU-JOUR.md` (8 h 36). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `e7fd773e`**, sur `0adf66be`. Aucun push, aucune release, aucun verdict Playwright complet : ce soir, après 3b.

## État mesuré

- Vitest complet, depuis `tests/` : 766 fichiers, **9 037 essais, tous verts** (avant le lot : 8 997).
- Banc neuf `tests/unit/materiel-lot3a-roles.test.js` : 40 essais. **55 mutations du code, 55 tuées ; chacun des 40 essais rougit sous au moins une.** Une mutation a d'abord survécu (l'affichage de la description dans l'aperçu) : l'essai S.f a été ajouté.
- Spec neuve `tests/integration/materiel-lot3a-roles.spec.js` (3 essais) ; specs des lots 1 et 2 : **lancées seules dans WebKit, 8/8 vertes** ; 3 mutations, 3 rouges. Ce n'est pas le verdict.
- En route, deux sentinelles : le banc iPad a montré que **les `<select>` natifs ignorent `min-height` dans WebKit** (corrigé par le patron du registre longitudinal, apparence retirée et hauteur fixée) ; le cliquet de complexité a refusé `proposerRoles` à 21 (découpée en trois).
- Rendu vérifié par capture, modes clair et sombre, à l'étape neuve.

## ⚠ Une trouvaille qui touche le défaut que tu as supposé

**Tu as écrit : « sous-critères » proposé par défaut ; sur un critère holistique, ils deviennent des codes d'annotation si l'utilisateur coche la case du critère.** Mesuré : dans Grilles de critères, les sous-critères ne s'affichent **que pour un critère algorithmique**. `rendreSousCriteresAlgo` (qui porte aussi la case « Utiliser ces sous-critères comme codes d'annotation ») n'est appelée que par `rendreCartesGabaritAlgo`, qui sort d'emblée si `critere.type !== 'algorithmique'` (`grilles.js` ~4419-4423). Les critères créés par l'assistant sont holistiques (lot 2) : **leurs sous-critères sont écrits, mais invisibles et non modifiables** dans l'application, et la case des codes est hors d'atteinte.
La **description** du critère, elle, s'affiche et se modifie dans Grilles de critères (`grilles.js` ~4770).

J'ai gardé ton défaut (« sous-critères »), parce que Grégoire les a nommés parmi ce que l'utilisateur doit pouvoir désigner. Disposition : **inscrit pour 3b**, même parcours que « descripteurs visibles dans Grilles de critères ». La spec Playwright vérifie donc que les sous-critères sont **écrits** (forme et ordre), pas qu'ils sont visibles : la consigne demandait « visibles », ce n'est pas possible sans toucher à `grilles.js`, hors du lot.

## Ce que le commit fait

| Fichier | Ce qui change |
|---|---|
| `js/materiel-lecture.js` | `deplier` (colspan, rowspan, les deux ; rangées vides gardées à la lecture pour compter les rowspan, retirées après) ; `texteDe` garde les retours (`\n`) ; `orienter` (dépliée, transposée si en colonnes) ; `proposerRoles`, `changerRole`, `modeleDepuisRoles`, `relire` ; `coder` en repli seulement. `transposer` (lot 1) **retiré**, remplacé par la transposition de la grille dépliée. |
| `js/materiel-assistant.js` | Étape `roles` ; `choisirRole`, `choisirSuiteNom` ; manques des codes et des sous-critères (≤ 30, noms ≤ 200, description ≤ 2 000 : bornes du partage) ; critère à la forme de l'éditeur ; sous-critères. |
| `js/materiel.js` | L'étape « Ce que contient ton tableau » ; champs « Code » ; sous-critères et description dans l'aperçu et à la Vérification ; bandeau des cases fusionnées à « Sens du tableau ». |
| `styles.css`, `index.html` | Bloc lot 3a (variables seulement) ; jetons `?v=20261015e`. |
| Bancs | Lot 3a neufs ; lot 1 : L.b (retours gardés), I.j (rowspan : la rangée du dessous est la suite), I.s (case fusionnée transposée : à sa place, dépliée) ; lot 2 : E.a, E.c et la spec (six étapes). |

## Ce que j'ai décidé seul – à vérifier

1. **Rangées d'en-tête** : la 1re, puis celles qui la suivent **sans nom de critère** et dont les cases de niveau sont courtes (une ligne, 60 caractères au plus) ou qui sont **sous une case fusionnée de la 1re rangée** (alors sans limite de longueur). Sans la condition « sans nom », une grille simple aux descripteurs courts (« Très clair », « Confus ») perdait sa 1re rangée de critères.
2. **Une rangée « Un critère » garde les règles du lot 1** : sans nom, ligne de pondération, ou une seule case fusionnée sur toute la largeur → « À classer », avec la même raison. C'est ce qui garde I.i vert ; « Ligne d'une autre forme » ne sert plus qu'à une rangée plus courte que le tableau (dépliage impossible) ou à cette case unique.
3. **Rowspan** : une rangée sous la case fusionnée d'un critère est proposée « Suite du critère » (I.j a changé en conséquence).
4. **« Noms des critères » et « Pondération » sont uniques**, comme les trois rôles de rangée que tu as nommés : la consigne ne lit que la première, une seconde ne servirait à rien.
5. **Codes des bandes** : par colonne, si toutes les bandes portent le même code court ; sinon `coder` complète. Une rangée « Codes des niveaux » l'emporte sur les bandes.
6. **Sans colonne « Noms des critères »**, aucun critère n'est construit et rien ne va « À classer » : le manque nommé suffit (sinon chaque rangée y tomberait).
7. **Une suite orpheline** : son contenu n'est pris nulle part, le manque nomme la rangée (« un critère au-dessus de la rangée 4 »). Une rangée de critère envoyée à « À classer » rend orpheline la suite qui la suit.
8. **Une colonne « Pondération » dans une suite** remplit la pondération du critère seulement s'il n'en a pas.
9. **Un sous-critère** : code `String(k)` dans l'ordre des lignes, comme l'éditeur ; `sousCriteres` absent si aucun (l'éditeur ne le crée qu'au premier ajout).

## Textes provisoires neufs (pour la page de textes de 3b)

- Étape : nom « Ce que contient ton tableau » ; titre « Dis à l'application ce qu'est chaque partie de ton tableau » ; phrase d'intro (« Voici ton tableau, tel que l'application l'a lu… ») ; mention « Proposé par l'application : à vérifier » ; coin du tableau « Rangées » ; « case fusionnée », « (suite de la case fusionnée au-dessus) », « (suite de la case fusionnée à gauche) » ; étiquettes « Rôle de la rangée N », « Rôle de la colonne N ».
- Les libellés des rôles (tes libellés, tels quels) et du choix de la suite ; sa légende « Dans une « Suite du critère », la case de la colonne « Noms des critères » devient : ».
- Encadré « Dans l'application » de l'étape.
- Bandeau à « Sens du tableau » : « Ton tableau contient des cases fusionnées. L'étape « Ce que contient ton tableau » montre ce que l'application en a lu : tu pourras y corriger sa lecture. »
- Manques : les deux colonnes manquantes, la suite orpheline, les trois manques de code, les trois bornes (sous-critères, leurs noms, description).
- Champ « Code » ; dans l'aperçu « code à remplir », « N sous-critères ».

## Questions pour toi

1. **Le défaut de la suite** : garder « sous-critères » et les rendre visibles en 3b (ma recommandation), ou proposer « description », visible dès aujourd'hui ?
2. Le seuil de 60 caractères pour une rangée d'en-tête sans case fusionnée (point 1) : à ta lecture de la vraie grille, tient-il ?
