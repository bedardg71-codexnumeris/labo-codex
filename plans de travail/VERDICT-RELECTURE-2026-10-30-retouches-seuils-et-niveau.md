# Verdict de relecture – La retouche des lots 1 et 2 (d20bd5f5, 73622888, 234e4371)

> Cowork, vendredi 30 octobre 2026, 12 h 14 (Toronto). Lecture faite par une session de relecture indépendante, en lecture seule, depuis `5b154aeb` ; Cowork a revérifié au commit `d20bd5f5` les constats 1, 2, 4, 5 et 6. Rien exécuté.

## Verdict

**Pas accepté tel quel, mais il reste peu.** Les §§ 1, 2, 4 et 5 de la consigne sont faits, au bon endroit, presque tous gardés par un test qui peut échouer (L2-6 recalculé à la main : n contre n−1, 5 contre 6, l'élève à 80 dans un groupe à 94). Cache de lecture apparié (`try`/`finally`, compteur d'imbrication), jetons bumpés, rien d'écrit hors des caches dérivés et du namespace `demo_*`.

## À finir dans le lot (consigne : `CONSIGNE-LOT-2026-10-30-retouches-seuils-et-niveau-2.md`)

1. **L'Aide « Repérer les patterns » dit l'ancienne règle du niveau** (`index.html:11026` : « Le niveau suit une seule règle : P sous le repère de maîtrise […] « Difficulté persistante » […] donnent le niveau 3 »), deux cartes sous celle qui dit le contraire (`:11000`). `sentinelle-aide-2026-10-28-lot-2c-bis.test.js:145` verrouille la phrase périmée : le lot 2 a recalé la moitié « code » de cette sentinelle, pas la moitié « texte ». Phrase neuve dans la liste des mots.
2. **Sans référence de groupe, « alors que la moyenne de son groupe est au-dessus »** (`js/profil-etudiant-calculs.js:1796`, texte `:1903`) : sous 5 élèves avec copie, `reference` est nulle et le motif `sous-la-note-de-passage` sort quand même. L2-1 sur l'autre branche. Un motif de plus, sa phrase dans la liste ; le test `:91` vérifie le motif, pas seulement le niveau.
4. **Le test « sommative sans échelle, même si la bibliothèque compte une échelle » ne la met pas** (`tests/unit/sentinelle-niveau-compare-au-groupe-2026-10-30.test.js:229-233`) : `groupe()` ne remplit la bibliothèque que si `echelle` est passée ; retirer la garde le laisse vert, et ses deux sous-cas sont identiques. Mettre une échelle à repères en bibliothèque.
5. **Barre P, sommative en points** (`js/tableau-bord-apercu.js:1466`) : « Les copies de ce groupe n'ont pas d'échelle unique » laisse croire à une divergence à réparer ; c'est maintenant le cas le plus fréquent de cette phrase. Choisir la phrase selon `raison` (aucun écran ne la lit encore) ; phrase neuve dans la liste.
6. **« élèves » dans les phrases neuves d'écrans d'enseignant**, contre la décision du 28 oct. (« étudiant·e », `6f65ecbf`) : `profil-etudiant-calculs.js:1906`, `index.html:10999` (« l'étudiant·e » puis « 5 élèves » dans la même phrase), `accompagnement-contenu-hover.js:542`, `accompagnement-contenu-terme.js:337`, `guides-pedagogiques.js:216`. Avant que Grégoire reçoive les mots.
10. `audit-onglet-suivi…:529` : la fin de commentaire « sommative sans repère depuis le 30 oct. » contredit le § 4. Une ligne.

## Inscrire et continuer

3. **La garde du § 4 teste la famille, pas « en points »** (`js/contexte-qualification.js:164`, `:174`). Défendable pour standards et dénotation (leur note prête déjà l'échelle de la bibliothèque à une copie sans `echelleId` : signaux et note d'accord). Mais `echelleId` est écrit depuis le premier commit, et depuis #941 S1 (24 sept.) une grille entièrement en points s'enregistre avec `echelleId` vide : une copie sans échelle est d'abord une copie en points, quelle que soit la famille. Deux trous rares : en sommative, des copies en points d'avant le 24 sept. qui portent l'échelle d'office apportent ses repères ; en standards, une copie en points depuis le 24 sept. reçoit l'échelle de la bibliothèque. Critère direct existant : `grilleEntierementEnPoints`. Mesurer sur les données du pilote avant d'y toucher.
7. **Service d'orthopédagogie** : préservé dans le code (`:1863-1865`), sans banc qui monte un service aux fiches de numéros différents.

## Commenter et oublier

- Cache de lecture : le jeton ne change qu'à l'invalidation totale ; une écriture ciblée pendant un lot laisserait la lecture du groupe périmée. Aucun de ces lots n'est asynchrone ni n'écrit ses entrées.
- Pack de démo 21.3 : `peuplerNamespace` n'écrit que `demo_*` et tourne au démarrage pour tout le monde ; au premier démarrage après la mise en ligne, ce qu'on a modifié dans la démo est écrasé (comme à chaque version du pack). **Erratum du verdict du lot 1** : les totems avaient déjà leur bump (`68ce070a`, 21.1 → 21.2).
- `reperesPerformance()` encore lu une fois par élève dans `determinerNiveauRaiPedagogique` (`:2006`) ; sous le cache de lecture, sans coût mesuré.
- En sommative, la répartition de l'Aperçu nomme des niveaux alors que l'infobulle du profil dit que la note « ne la situe dans aucune échelle de niveaux » (`profil-etudiant-helpers.js:650`) : déjà le cas avant le lot 1.

## Non vérifié

Vitest, WebKit, les 13 mutations, les chronos, le rejeu « 0 écart » ; Safari, iPad ; sur les données réelles : copies en points portant un `echelleId`, service de 5 élèves ou plus, fiches sans `coursId`.
