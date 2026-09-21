# Consigne suivante – le bilan de l'élève ne parle plus d'« artefact » ni du « niveau É » (F4-1 de l'audit du 21 sept.)

> Écrite le 21 septembre 2026, 11 h 40 (Toronto), par Cowork, **pendant** l'exécution de la consigne #553. **À ne lancer qu'une fois #553 poussée** (une seule session écrit dans `js/`). Au lancement : archive la consigne #553 sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-21-553-francais-diagnostic.md` et renomme celle-ci en `CONSIGNE-DU-JOUR.md`.
> **Texte validé par Grégoire le 21 sept. à 11 h 40** (« oui » à la proposition de Cowork). Mots d'élève : tels quels.

## 0 · Conditions de départ

`git log --oneline -1 origin/main` porte 1.152.3 (`dde51a01` ou un commit de journal après). Sinon, arrête-toi. Aucune autre session n'écrit.

## 1 · Ce qui change – deux sites jumeaux, un seul texte

Mesuré par Cowork à 11 h 40 :
- `js/evaluation-retroaction.js` ≈ l. 971 (bilan de l'évaluation) ;
- `js/synthese-retroaction-data.js` ≈ l. 832-836 (synthèse du PDF), qui dérive `versLeSommet` de `niveauLePlusHaut`.

Les deux rendent, quand tous les critères sont maîtrisés deux fois de suite, **exactement** :
> Tous les critères sont maîtrisés depuis plus d'une production. Tu peux aider tes collègues : c'est une excellente façon de transférer tes compétences à d'autres contextes.

- Apostrophes : suis celles de chaque fichier (typographiques dans le premier, droites dans le second) ; le deux-points précédé d'une espace comme ailleurs dans le fichier.
- `versLeSommet` et son appel à `niveauLePlusHaut` deviennent sans usage dans ce message : retire-les s'ils ne servent plus nulle part (zéro-dette), dis-le.
- Le message « Tous les critères sont maîtrisés. Continue sur cette lancée ! » ne change pas.
- **Repli de titre « Artefact »** que le rapport situe près de `evaluation-retroaction.js:1212` : remesure. S'il est lu par l'élève, il devient « Production » (règle de Grégoire du 21 sept. : « productions étudiantes » plutôt qu'« artefacts » hors de son cours) ; s'il n'est pas lu par l'élève, laisse-le et dis-le.
- **Aucun autre mot** : si tu trouves d'autres « artefact » ou « niveau É » lus par l'élève, **nomme-les dans ton rapport sans les changer** (ils remontent à Grégoire).

## 2 · Preuves

- Le vrai bilan et la vraie synthèse rendus pour un élève maîtrisé deux fois de suite, sous **deux échelles** (IDME, et une échelle à quatre niveaux sans É) : le texte exact dans les deux, aucun « É », aucun « artefact ».
- Mutations, une clause à la fois, rouges : l'ancien texte remis dans un seul des deux sites ; le tiret cadratin remis ; « artefact » remis.
- Les anciennes « Nouvelles » gardent leurs mots. Vitest complet vert. **Release : patch.** **Phrase de « Nouvelles » à PROPOSER à Grégoire.** Relecture croisée par Cowork avant le verdict et le push ; push sur son mot.

## 3 · Ce que Grégoire verra

Rétroaction et PDF d'un élève qui a tout maîtrisé deux fois de suite : la phrase ci-dessus, sans « artefact » ni « niveau É ».

## 4 · Fichiers de Cowork à commiter avec ce lot

Cette consigne (renommée), l'archive de celle de #553, `plans de travail/CONSIGNE-COMPLEMENT-1152-3-francais.md` et `plans de travail/FILE-DES-LOTS.md` (retire-en le lot 1 une fois poussé).
