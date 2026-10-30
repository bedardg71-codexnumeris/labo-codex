# Rapport du lot 2 : le niveau RàI comparé au groupe-cours (30 oct. 2026)

Commit du lot : `9e2be4b4`. Aucun résultat sur données réelles ici : ils restent en page privée. Le modèle a été mesuré avant d'être codé (`scripts/mesures-depistage/regles-1-et-2.mjs`), et Grégoire a donné son accord sur les chiffres, avec la règle 1 dès la première copie. Questions 2 à 5 du lot : hors de ce commit, elles attendent la relecture de Cowork.

## La règle

Sur la moyenne des copies de l'élève, comparée à son groupe-cours (`classerNiveauDansLeGroupe`, `js/profil-etudiant-calculs.js`) :

| Niveau | Condition |
|---|---|
| 3 | plus d'un écart-type sous la moyenne du groupe |
| 2 | entre un demi et un écart-type sous la moyenne |
| 1 | le reste |

- **Condition des niveaux 2 et 3 :** être aussi sous le repère de maîtrise de l'échelle. Sans repère, elle se lève.
- **Règle 1 :** signal de groupe éteint, un élève sous la note de passage est au moins au niveau 2, dès la première copie. Signal allumé : rien ne change.
- **Règle 2 :** pas de comparaison au groupe avant 2 copies corrigées.
- **Signal de groupe :** moyenne du groupe sous la note de passage. Il remplace les 70 et 60 % en dur de la phrase sous la barre RàI (#1191, fermé).
- **Inchangés :** « Non-participation » (règle du 5 sept.) et la complétion. Le pattern et le défi restent affichés : ils ne fixent plus le niveau.

## Preuves

| Vérification | Résultat | Comment |
|---|---|---|
| Le code redonne le modèle mesuré, sur le codex | 0 écart sur 47 dates ; même stabilité | `regles-1-et-2.mjs` rejoué sur `9e2be4b4` : colonne « en place » égale à la colonne « règles » |
| « Tous les groupes » redonne le niveau du groupe-cours | 0 écart sur 46 élèves | `temoin-tous-les-groupes.mjs` |
| La phrase du signal dans l'écran réel | absente aujourd'hui, présente à une date où le groupe est sous la note de passage | même script, WebKit |
| Coût d'un passage sur 46 élèves | 104 ms hors lot, 22 ms dans un lot | même script |
| Vitest | 854 fichiers, 10 405 essais verts | `cd tests && npx vitest run` |
| Sentinelle neuve | 18 essais, 11 mutations toutes rouges | journal en fin de `sentinelle-niveau-compare-au-groupe-2026-10-30.test.js` |
| Navigateur | 27 essais verts, specs touchées seulement | `seuils-une-source`, `profil-etudiant-chargement`, `lot-e3-creer-ou-modifier`, `lot-a-anonymisation-enregistre` |

Non fait : le verdict Playwright complet, Safari et iPad.

## Suppositions

- **Sous 5 élèves avec copie dans un groupe :** pas de comparaison, seule la règle 1 parle. Repris de la mesure, où le cas ne se produit jamais.
- **Élèves à une copie :** ils comptent dans la moyenne du groupe.
- **Élèves exclus par statut :** hors de la référence, mais classés quand on ouvre leur profil (#745).
- **Élève qui n'a que des copies « non remises » :** non-participation, au niveau 3. Le code d'avant le mettait au niveau 3 par une performance de 0.
- **Copies remises sans note chiffrée :** en attente, rien à comparer.
- **Pratiques sommative et spécifications :** même règle ; sans échelle, la condition du repère se lève.
- **Les mots de la carte du profil et de la phrase :** écrits par Claude Code. Écrans d'enseignant : ils ne remontaient pas d'office, ils se corrigent en une ligne (`DESCRIPTION_DU_MOTIF`).

## Écarts et incident

- **Commit refait :** un premier commit (`f261e7af`) est parti avec 10 essais rouges, parce que la commande enchaînait les tests et le commit sans condition. Corrigé par `--amend` avant tout rejeu. Rien n'a été poussé.
- **Faux vert du banc :** il fournissait `obtenirContexteCoursActif`, privée à `modes.js`. Le code aurait mêlé les groupes dans l'app. Trouvé par un break-test : le code lit maintenant la liste des élèves.

## Trouvailles

| Trouvaille | Issue |
|---|---|
| Un élève peut être au niveau 1 avec le pattern « Difficulté persistante » : les deux ne lisent plus la même chose ni la même fenêtre | Inscrire et continuer : à trancher avec les questions 2 à 5 |
| `rejeu-rai.mjs` lit encore `obtenirSeuil('idme.*')` et sa colonne « sans P » décrit l'ancien modèle | Commenter et oublier (déjà au verdict du lot 1) |

## Tarir n'est pas réparer

Le niveau se calcule à la lecture : il change partout dès ce commit. **Stock assumé :** une intervention déjà enregistrée garde le niveau et l'analyse du jour où elle a été écrite. Rien n'est écrit dans les données de personne.

## Ce qui attend

Le verdict du lot 1 de Cowork (`plans de travail/VERDICT-RELECTURE-2026-10-30-seuils-une-source-lot-1.md`, non commité par cette session) est arrivé pendant ce lot : aucun de ses constats n'est traité ici. Son constat 3 dit « pas de niveau 2 entre 60 et la maîtrise » : ce n'est plus vrai du niveau depuis ce commit, ça le reste du pattern. Relecture de ce lot par Cowork, puis verdict complet Cowork fermé. Pas de bump, rien de poussé.
