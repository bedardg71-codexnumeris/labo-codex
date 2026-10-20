# Verdict de relecture – le PDF de la grille, 2e tentative : la forme de la grille d'origine (#1120)

> Cowork, mardi 20 octobre 2026, 18 h 56 (Toronto, mesuré par `date`). Commit relu : `2fc42169` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-20-pdf-grille-forme-originale.md`.

## Verdict : accepté, sans correction

- **Aucun cas particulier** : la forme se décide par une règle générale (`nomsDesTranchesCommunes` : même nombre, mêmes noms non vides après `trim`, même ordre), pas par la grille de Grégoire. Exigence redite par lui à 18 h 42 : traiter toutes les grilles de façon uniforme.
- Le tableau reste décidé une fois (`tableauDesCriteres` → `tableauEnColonnes`) et posé par les deux rendeurs ; `escapeHtml` sur la description, les éléments observables et les noms de tranches.
- Les autres grilles : l'aperçu identique à l'octet près (banc #497).
- **Grégoire a vu le PDF de sa vraie grille** (18 h 56) : « Le résultat est bien meilleur. »

## Ce que la relecture retient

- **Le gras des éléments observables dans le PDF** (jsPDF met toute une case en gras ou rien) : la grille d'origine ne les met pas en gras. Écart de forme, au sens du principe de Grégoire (18 h 40, dans le plan) ⮕ **inscrire** : à faire par Claude Code dans le prochain commit, avec son numéro ici.
  ✅ **Inscrit : #1129** (Claude Code, 20 oct., 19 h, avec la release 1.212.0).
- **La suite proposée par Cowork à 18 h 42, en attente de Grégoire** : que la dissection garde la forme de l'original (sections, total, etc.), mesurée d'abord en lecture seule sur les quatre formes de grilles de l'analyse du 17 oct. (`PROPOSITION-2026-10-17-reconnaissance-des-grilles.md`) ; aujourd'hui, la forme d'origine n'est rendue que pour l'une d'elles (un critère par rangée, points dans chaque case).

Quatre commits attendent le verdict complet, au signal de Grégoire : `9882d2d5`, `67298a8d`, `c04df849`, `2fc42169`.
