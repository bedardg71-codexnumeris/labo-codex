# Verdict de relecture – L'Aide, lot 2b, la seconde retouche (#1152)

> Cowork, mardi 27 octobre 2026, 19 h 00 (Toronto, mesuré par `date`), sur `main` = `b9a7d11f`. Lu : la demande de relecture de la seconde retouche, le diff de `9b55e8ec` (huit fichiers de code, `index.html`, `styles.css`, trois essais) et celui de `b9a7d11f` (`BACKLOG.md`, la remesure). Rejoué par Cowork sur une copie du dépôt, hors du Mac de Grégoire (Linux, dépendances installées à part).

## Verdict

**Acceptée sans retouche.** Les cinq points sont faits comme le verdict de la retouche les demandait ; les quatre commentaires PS de la cartouche sont, mot pour mot, ceux que Grégoire a validés à 18 h 38, avec les apostrophes des commentaires voisins. Le lot 2b de l'Aide est clos côté relecture.

## Ce que Cowork a mesuré lui-même

- **Le banc de la seconde retouche** (`sentinelle-echelle-depart-ps-seconde-retouche-1152.test.js`) : 8 sur 8, avec les sentinelles 902, 913 et celle du niveau PS (44 sur 44).
- **Cinq mutations rejouées par Cowork**, une par correctif (retrait de `nb_PS`, du niveau PS de la cartouche, de `'PS'` dans le compte « en difficulté », retour à `||` pour le zéro, retrait de `--gris-moyen` de la table des couleurs) : chacune rougit son essai (1, 1, 2, 1 et 1 échecs). Fichiers restaurés, identiques à l'original (`cmp`).
- **Vitest complet sur la copie** : 9 967 réussis, 11 échecs dans 8 fichiers, tous expliqués par la copie elle-même (ni `.git` ni `.claude/` copiés : historique git, fichiers suivis, `.gitignore`, skills). Aucun ne touche un fichier du lot. Le « 9 983 sur 9 983 » de Claude Code, sur le Mac, n'est donc pas contredit.
- **Lu au code** : `--gris-moyen` vaut bien `#8aa4b0` dans `:root` (`styles.css:132`) et `#666677` en mode sombre (l. 515) ; `formaterNotePourcentage(0)` rend « 0 % » (`_nombre` ne rejette que le vide, le booléen et le non-fini) ; `parNiveau` est bâti sur les niveaux de l'échelle lue, donc une échelle sans PS donne `[]` et le message reste celui d'avant.
- **La porte de la cartouche** : le semis ne touche pas un trimestre qui a déjà `CART_GENERIQUE` (essai « TARIR, PAS RÉPARER »).

## Ce que Cowork n'a pas rejoué

- Playwright : ni la spec PS de bout en bout ni les cinq specs voisines (pas de navigateur dans la copie). Ce sera jugé par le verdict complet de la mise en ligne.

## Les docs (`b9a7d11f`)

- **#551** : les deux sites sont ajoutés à sa fiche, en attente de Grégoire (D3). Conforme.
- **La remesure** : `rai-solo` sous une section « Labo » neuve, `glossaire-statique` et le terme du glossaire sous « Référence ». Conforme ; la section neuve est la bonne place (la partie Labo du plan est le lot 2d).

## Trouvailles

- **`niveauVersScore`** dans `calculerPerformanceParCritere`, sans lecteur : issue 3 confirmée (code étranger au lot, sans conséquence observable). Rien à inscrire.

## Suite

- Aucun travail de code. Le push des 12 commits passe par la mise en ligne du soir : release `minor` (le niveau PS est une fonction neuve) avec son entrée des Nouvelles, verdict complet, puis push — l'ordre de `fin-de-session`, § 4.5 ; pousser avant le verdict mettrait en ligne du code non jugé. Consigne à écrire par Cowork une fois le texte des Nouvelles validé par Grégoire.
