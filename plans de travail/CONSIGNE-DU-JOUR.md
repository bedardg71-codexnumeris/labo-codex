# Consigne du jour – lot 3, après relecture : deux corrections avant la release

> Écrite par Cowork le 10 octobre 2026 à 11 h 31 (Toronto, mesurée par `date`). Remplace la consigne du lot 3, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-10-lot3-import-selectif.md`. Tu peux commiter ce fichier avec tes corrections.

## Verdict de relecture

Relus : `95c98004`, `c2be076a`, `af6b93e5` et `DEMANDE-RELECTURE-2026-10-10-lot3-import-selectif.md`. L'ordre des blocs, les tables, `rebrancher`, la clé `cle('cartouches_…')`, `nombreImporte` et les listes blanches sont justes. L'identité des cartouches (#954) tient aussi pour une cartouche réelle : ce qu'écrit `cartouches.js` à la création (≈ 464) est entièrement dans la liste blanche, `metadata_cc.auteur_original` compris. Deux corrections avant la release ; le reste est accepté.

## Correction 1 – « même nom » ne suffit pas pour rebrancher (ta première supposition)

Ta supposition : une grille ou une échelle écartée parce qu'une de même nom est déjà là est tenue pour la même, et ce qui la désignait suit celle-là. L'écart lui-même date d'avant le lot ; la **redirection** est neuve, et elle peut rattacher à tort.

Cas : le fichier vient d'un collègue (l'import sélectif lit aussi ces fichiers, d'où `auteurSource`). Sa grille « Grille de rédaction » (critères `CR_x`, `CR_y`) a le même nom qu'une grille locale aux critères différents. Avant le lot, ses cartouches dormaient sous une clé que personne ne lisait. Avec le lot, elles apparaissent sous la grille locale, avec des commentaires indexés sur des critères qui n'y sont pas ; ses productions désignent une grille qui n'est pas la leur. Un lien rompu se voit ; un lien faux ne se voit pas.

À faire : ne rebrancher sur la grille de même nom que si elle porte **les mêmes ids de critères** (même ensemble, ordre indifférent) ; pour une échelle, **les mêmes codes de niveaux**. Sinon, aucune entrée dans la table : le comportement d'avant le lot. Ton cas A.b (second passage) doit rester vert, puisque la grille renommée au premier passage a les mêmes critères. Ajoute au banc le cas « même nom, critères différents → aucune redirection », pour la grille et pour l'échelle, avec break-test.

## Correction 2 – un sous-schéma ne laisse plus passer une valeur brute

Dans `assainirObjet`, `case 'object'` : quand `spec.schema` existe mais que la valeur n'est pas un objet, la valeur passe **telle quelle** (`resultat[cle] = valeur`). C'est d'avant le lot, mais le lot l'étend à trois champs neufs (`calcul_note`, `echelle` d'une pratique, `regles` d'une production) : une chaîne à cet endroit entrerait sans `assainirChaine`. À faire : avec un `spec.schema`, une valeur qui n'est pas un objet non nul (tableau compris) est omise. Sans `spec.schema` (`configuration`, `config`), rien ne change : c'est le compromis déjà assumé, que l'échappement à l'affichage du lot 2 couvre. Un essai au banc, avec break-test.

## Ce qui est accepté sans changement

- Tes trois autres suppositions (renommages internes au lot entrant non rebranchés ; `auteurOriginal` hors identité ; échelle cachée dans `configuration`/`config` non rebranchée).
- Les quatre champs laissés hors du transport.
- Le stock assumé, tel qu'écrit au BACKLOG.

## Tes deux trouvailles

- **Issue 2, inscrite** : l'import sélectif ne propose pas les grilles, échelles, pratiques et cartouches namespacées d'une sauvegarde récente. Inscris la fiche au BACKLOG avec ta mesure ; Cowork la place dans la file à la prochaine recomposition. Ne la code pas dans ce lot.
- **Issue 3, inscrite** : `executerImportLocalStorageBrut` est du code mort. Inscris-la ; elle rejoint le nettoyage du code mort de la file.

## Mots d'écran

La ligne neuve du bilan (« N cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) ») et la ligne des Nouvelles sont soumises à Grégoire par Cowork. **N'y touche pas** tant que Cowork ne t'a pas transmis sa décision.

## Puis arrête-toi

Un commit par correction, en local. `cd tests && npm test` (suite complète) avant la release : `import-export.js` est sous les règles de sécurité ; Chrome, Safari et Cowork fermés. Rapport court : ce qui a changé pour l'usager, le banc et ses mutations, le verdict. **Pas de release** avant le retour de Cowork sur les mots d'écran.
