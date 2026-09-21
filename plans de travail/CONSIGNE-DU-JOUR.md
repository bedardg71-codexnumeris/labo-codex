# Consigne du jour – la note d'une pratique Standards « tous » et l'arrondi de l'export (#715, #723)

> Écrite le 21 septembre 2026, 10 h 17 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (#908, poussée en 1.152.1) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-908-entete-export-recherche.md` (déplacée par Cowork, à commiter avec ce lot).
> **Pourquoi ces deux-là** : Grégoire et la cohorte utilisent surtout SOM et PAN-STD cet automne (Grégoire, 21 sept. ≈ 10 h 15). Des quatre défauts de note remesurés par Cowork ce matin (banc `audit-pratiques-notation-config-2026-09-16`, 32/32 verts avec les valeurs fausses figées), ce sont les deux qui les touchent. #713 (SPE) et #717 (DEN) attendent.

## 0 · Conditions de départ – mesure-les

- `git fetch && git log --oneline -1 origin/main` porte **1.152.1** (`b87dfffc` ou un commit de journal après). Sinon, arrête-toi.
- Aucune autre session n'écrit, aucun `pousser.sh` en cours ; arbre propre hors des non-suivis anciens et des fichiers de Cowork (§4).

## 1 · #715 – sous « tous », la note prend toutes les productions

Constat (fiche, tenu au 21 sept.) : `_selectionnerArtefactsLegacy` (`js/profil-etudiant-actions.js:262`) applique `.slice(0, nombreARetenir)` à tous les modes ; sous `methodeSelection: 'tous'` le chemin riche coupe à N dans l'ordre de stockage (**76,75**), l'instance `pratique-pan-standards.js` prend tout (**77,32**).
**Décision de Cowork (technique, dite à Grégoire)** : « tous » veut dire tous – **une règle, celle qui prend tout**, dans les deux chemins.
- **À remesurer avant de coder** : les autres lecteurs de `methodeSelection` qui pourraient couper sous « tous » (grep des cinq lecteurs cités au lot 28 : `portfolio.js`, `profil-etudiant-actions.js`, `pratique-pan-standards.js`, la carte du profil, `construction-attributs.js`). Mêmes chiffres partout : profil, `simulerIndices`, export.
- **A2b du banc de l'audit rougit** (il fige 76,75) : réécris-le pour juger 77,32, ne le supprime pas.
- **Le Comparateur** (`construction-attributs.js:160`) écrit « 4 retenu(s) sur 2 minimum » à côté de « Méthode de sélection : tous ». Sous « tous », rien n'est « retenu sur » : si un libellé EXISTANT dit juste, emploie-le ; sinon **arrête-toi sur ce point et propose les mots** (lus par des collègues), sans les poser.
- **Stock** : la note se calcule à la lecture ; remesure si un P calculé sous « tous » est ÉCRIT quelque part (relevés hebdomadaires, `indicesCP`). S'il l'est, ne réécris rien : dis-le, en une ligne (« tarir n'est pas réparer »). Les notes d'A2025 et d'H2026 ne se rouvrent pas.

## 2 · #723 – l'export garde l'entier, et le dit

**Tranché par Grégoire le 21 sept. à 10 h 17** : le fichier d'export des résultats finaux sert à reporter les notes dans Léa ; **il garde la note arrondie à l'entier**, et l'en-tête le dit, pour qu'un 88 à côté d'un 87,6 au profil ne passe plus pour une erreur.
- `js/export-resultats-finaux.js`, `ENTETES_SYNTHESE` (l. 70-72) : la colonne **« Note finale »** devient **« Note finale (arrondie à l'entier) »** – décision de Cowork sur la forme, Grégoire en est informé et peut la reprendre.
- **À remesurer avant de poser** : l'arrondi est bien un arrondi au plus proche (`indices.js:560`, `Math.round(P * 100)`) et un 74,5 donne 75 comme au niveau imprimé (1.150.0) ; qu'aucun lecteur (import, gabarit, test, Aide) ne dépend du libellé « Note finale » de ce fichier – sinon arrête-toi et dis lequel.
- Aucune valeur ne change ; seul le libellé de la colonne. Le profil garde sa décimale (hors lot : le point décimal « 79.4 » du profil, s'il s'affiche encore ainsi, est à nommer, pas à corriger ici).

## 3 · Preuves attendues

- #715 : sur le vrai moteur, une STD « tous » à 6 productions dont 4 « à retenir » : 77,32 au profil, par `simulerIndices` et à l'export ; un essai dont l'ordre de stockage contredit l'ordre attendu (erreur 17 de Cowork : un tri doit être jugé par un élément qui le contredit) ; « meilleurs » et « récents » inchangés (non-régression).
- #723 : le CSV produit relu ; la colonne porte le nouveau libellé ; les valeurs identiques à avant, octet pour octet hors en-tête.
- Mutations, une clause à la fois, toutes rouges : le `slice` remis sous « tous » ; un seul des deux chemins corrigé ; l'ancien libellé remis ; l'arrondi au plancher.
- Vitest complet vert. **Release : patch.** **Phrase de « Nouvelles » à PROPOSER à Grégoire** avant de l'écrire.
- Relecture croisée par Cowork avant le verdict et le push ; push sur le mot de Grégoire seulement.

## 4 · Fichiers de Cowork à commiter avec ce lot

`plans de travail/CONSIGNE-DU-JOUR.md` (celle-ci), `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-908-entete-export-recherche.md`, `CONSIGNE-DEMARRAGE-COWORK.md` (page du tri, version 45).

## 5 · Ce que Grégoire verra (en tête d'`OU-EN-EST-ON.md`)

Une pratique Standards réglée sur « tous » compte toutes les productions évaluées, au profil comme à l'export. Le fichier d'export des résultats finaux titre sa colonne « Note finale (arrondie à l'entier) » ; les notes elles-mêmes ne changent pas.
