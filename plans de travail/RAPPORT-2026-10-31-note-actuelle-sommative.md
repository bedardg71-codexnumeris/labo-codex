# Rapport – « La note actuelle du cours » en pratique sommative (#1207)

> Claude Code, samedi 31 octobre 2026 (Toronto). Exécute `CONSIGNE-LOT-2026-10-30-note-actuelle-sommative.md` avec `TEXTES-2026-10-31-note-actuelle-sommative.md`. Pas de release, pas de push : relecture de Cowork.

## Ce qui est livré

| Texte | Sommative | Pratique alternative | Où |
|---|---|---|---|
| 1. Titre du profil | « Note actuelle du cours » | « Note provisoire de session » | `_genererNoteSessionSommative`, `js/profil-etudiant-sections-affichage.js` |
| 2. Titre du bloc, PDF | « Note actuelle du cours » | « Note provisoire » | `MOTS_DU_BLOC_NOTE`, `js/synthese-retroaction-rendu.js` |
| 3. Mention sous la note, PDF | « Cette note peut changer selon tes prochains travaux. » ; « … et l'application de jetons. » | « Note provisoire — peut changer… » | même table |
| Formule du profil (consigne § 1) | « Note actuelle = … » | sans objet | `_genererNoteSessionSommative` |

« Note finale » ne change nulle part. La garde `sentinelle-note-provisoire-reservee` ne garde plus d'exception pour la sommative, et rend le PDF de bout en bout dans les deux familles.

## Ce que j'ai supposé

- **« Trois endroits » du texte 1 : un seul change.** Mesuré : `calculerDetailsNoteFinale` rend `null` hors standards, et seule cette voie mène à `_genererNoteSessionSommative`. Les deux autres cartes (hybride et classique) ne s'affichent donc qu'en standards ; « en pratique sommative seulement » les laisse à « Note provisoire de session ».
- **« Note actuelle = … »** n'est pas dans le fichier de textes, qui ne périme la consigne que pour la mention. Repris de la consigne.
- **Source ou stock :** rien n'est écrit dans les données, les mots se calculent au rendu. Un PDF déjà produit garde les siens.

## Relevé, non appliqué : à soumettre à Grégoire

| # | Où | Dit encore | Proposition |
|---|---|---|---|
| 1 | Réglage « Notes finalisées » (`index.html`), bloc commun, donc visible en sommative | « Active le titre « Note finale » sur les PDFs de rétroaction (au lieu de « Note provisoire ») et retire… » : faux en sommative depuis ce lot | « … (au lieu de « Note provisoire », ou de « Note actuelle du cours » en pratique sommative) et retire… » |
| 2 | Définition de « Notes finalisées » (`js/accompagnement-contenu-terme.js`) | « titrent alors « Note finale » au lieu de « Note provisoire » » : même défaut | « titrent alors « Note finale » au lieu de « Note provisoire » (« Note actuelle du cours » en pratique sommative) » |
| 3 | Export des résultats, colonne « Statut » (`js/export-resultats-finaux.js`), décision E7 du 28 oct., toutes familles | « provisoire » | En sommative : « actuelle ». Quatre specs figent la valeur. |
| 4 | PDF de l'élève, sommative, la phrase au-dessus du chiffre (`phraseFinale`, `js/synthese-retroaction-rendu.js`) | Ne dit pas « provisoire », mais « Note finale = 74 % », sous le titre « Note actuelle du cours » et au-dessus de « Cette note peut changer » ; antérieur au lot | En sommative non finalisée : « Note actuelle = 74 % », comme le profil. La même phrase sous « Note provisoire » est hors de ce lot. |

Les lignes 1 et 2 restent des exceptions nommées de la garde, jusqu'à la décision.

Vérifié sans objet : le titre du bouton « Modifier le statut (provisoire / finale) » n'existe qu'en standards ; `modeCalcul: 'provisoire'` est une valeur stockée, pas un mot à l'écran ; « Ce que tu fais dans la démo est provisoire » ne parle pas de la note.

## Suite : les relevés tranchés par Grégoire (31 oct., 9 h 07 à 9 h 09)

| Relevé | Décision | Fait |
|---|---|---|
| R4, ligne de calcul du PDF | Reprend le mot du titre, toutes pratiques | `motDeLaLigneDeCalcul`, les deux formes : « Note actuelle = … », « Note provisoire = … », « Note finale = … » une fois finalisées |
| R1, réglage « Notes finalisées » | Texte validé | `index.html` |
| R2, glossaire | Texte validé, le reste inchangé | `js/accompagnement-contenu-terme.js` |
| R3, export | Inchangé | Une garde fige « provisoire » |

- **Source ou stock, pour R4 :** la source seulement. Les PDF déjà remis gardent « Note finale = … » ; aucun code ne les rejoint. Un nouveau PDF porte le bon mot.
- **Les deux exceptions de la garde « se ferment » autrement que supprimées.** Les textes validés R1 et R2 nomment encore « Note provisoire » pour la pratique alternative ; le détecteur la voit. Elles ne sont plus ouvertes : elles portent le nouveau texte et le motif « pratique alternative ».
- **Inscrire et continuer, à soumettre à Grégoire :** le profil en standards a la même contradiction que R4, sous son titre « Note provisoire de session » : « Note finale = … pts + … pts = … », « Note finale pondérée (…) », « Note finale (portfolio à 100 %) » (`js/profil-etudiant-sections-affichage.js`). Écran de l'enseignant·e, hors de la décision, non touché. Proposition : le même mot que le titre tant que la note n'est pas finalisée.

Vérifié : Vitest entier vert (10 587) ; 12 changements volontaires du code font tous rougir une garde ; les 17 specs WebKit qui touchent le PDF ou le réglage vertes (71 tests).

## Vérifié comment (lot initial)

- Vitest entier vert (10 578 tests), lancé depuis `tests/`.
- Specs WebKit touchées vertes (7/7) : `profil-921-note-de-session-sommative`, `audit-parcours-sommatif-2026-09-24` (page du PDF), `standards-sans-portfolio-lot-1` (le profil en standards garde « Note provisoire de session »).
- 15 changements volontaires du code font tous rougir une garde, le code restauré après chacun (journal en fin de `sentinelle-note-provisoire-reservee.test.js`).

**Pas encore** : la vérification complète du navigateur, Safari sur l'iPad, ton vrai codex. Aucune capture : seuls des mots changent.
