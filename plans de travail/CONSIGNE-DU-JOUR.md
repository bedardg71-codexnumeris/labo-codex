# Consigne du jour – Le commentaire d'un critère est le même dans le PDF et dans le texte copié vers Léa

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `origin/main` = `28d66162` (1.156.2, en production chez Netlify depuis 6 h 34, déploiement mesuré ; porte terrain des colonnes du PDF passée par Grégoire).
> La précédente (#760 + #759, livrée en 1.156.2) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-24-lot-760-759-observations.md` (déplacée par Cowork, à commiter avec ce lot).
> **Deuxième lot du chantier « synthèse des rétroactions »** (cap du 21 sept.). Source : `Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md`, section A, bloc 3, colonne « Répété ailleurs ? » (« B lit la cartouche VIVANTE… mesuré : « GELÉ » sur le PDF, « VIVANT » dans B pour le même critère »). **Pas de fiche au BACKLOG** : inscris-en une à l'ouverture du lot (numéro suivant #938), avec ce constat remesuré, et coche-la à la livraison. Ajoute le lot à `FILE-DES-LOTS.md` sous le cap.

## 0 · La décision de Grégoire (24 sept. 2026) – elle fait foi

**Le commentaire qui fait foi est celui qui est enregistré avec l'évaluation**, comme le PDF le fait déjà : le texte validé en évaluant cette copie-là, y compris celui que l'enseignant·e a réécrit pour cet·te élève. Une cartouche retouchée plus tard ne change pas une copie déjà évaluée. Le texte copié vers Léa suit la même règle.

## 1 · Ce que Cowork a mesuré (lecture seule, sur `28d66162` – à REMESURER avant de coder)

- **Le PDF** : `construireCriteres` (`js/synthese-retroaction-data.js` ≈ l. 435-480) prend, dans l'ordre : `c.retroaction` persistée (sauf une amorce de saisie, `estAmorceDeSaisie`, #672) → la rétroaction algorithmique persistée (`donneesAlgorithmiques[id].retroaction`, gelée, #581) → la cartouche au niveau retenu → rien. Puis `anonymiserTexteRetroaction`.
- **Le texte copié vers Léa** (générale) : `_rendreCommentairesCriteres` (`js/evaluation-retroaction.js` ≈ l. 144-185) prend : la rétroaction algorithmique → la cartouche VIVANTE (`cartouche.commentaires[critere_niveau]`) → sinon **« [Non défini] »** en clair, que l'élève lit. Il ne lit jamais le commentaire propre à la copie.
- **Le geste** : une seule règle pour les deux. Idéalement UNE fonction (propriétaire à choisir par toi après mesure : vraisemblablement `synthese-retroaction-data.js`, qui porte déjà la règle complète) que les deux lisent – zéro-dette, pas une seconde copie de la cascade. « [Non défini] » part : sans commentaire, le critère se dit par son en-tête, comme le PDF (et comme #764 le fait déjà sans cartouche).

**⚠ À mesurer d'abord – c'est le point délicat** : la générale se compose PENDANT l'évaluation, sur l'état vivant de l'écran (`evaluationEnCours`), pas seulement sur l'évaluation enregistrée. Trouve où l'enseignant·e tape le commentaire propre à une copie, et où il vit avant l'enregistrement (auto-save à 1,5 s, #758). La règle vaut pour « le commentaire de cette copie, tel qu'il est à l'écran ou enregistré » : un commentaire que l'enseignant·e vient de réécrire doit sortir dans le texte copié même si l'auto-save n'a pas encore tourné.

⛔ **Arrêt prévu** : si la mesure montre que le commentaire propre à une copie n'existe PAS à l'écran d'évaluation (seulement ailleurs, ou seulement en base), ou si les deux sources à l'écran peuvent se contredire, arrête-toi et dis-le avant de coder.

## 2 · Limites

- **Aucune donnée écrite.** Aucune évaluation réécrite, aucune cartouche touchée. Source, pas stock : les textes déjà copiés dans Léa sont déjà partis.
- La cascade du PDF ne change pas (amorce, gel algorithmique, anonymisation) : c'est le texte copié qui la rejoint.
- Pas de nom d'élève réel dans les bancs ni le rapport (règle 6).

## 3 · Preuve attendue

- Vitest : critère dont la copie porte un commentaire réécrit → le texte copié le dit (et plus la cartouche) ; cartouche retouchée après l'évaluation → le texte copié garde le commentaire enregistré ; amorce de saisie → la cartouche, pas l'amorce ; critère algorithmique → le texte gelé ; aucun commentaire nulle part → l'en-tête seul, jamais « [Non défini] ». Et le PDF rend la même chose sur les mêmes cas.
- WebKit : une copie dont un commentaire est réécrit à l'écran → « Copier tout » le livre, avant et après l'enregistrement.
- Break-tests de ton choix, chacun rouge ; nomme-les.
- « Nouvelles » : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Rétroaction : le texte copié vers Léa donne pour chaque critère le même commentaire que le PDF, celui de l'évaluation, y compris ce que tu as réécrit pour l'étudiant·e. Il n'écrit plus « [Non défini] ». »
- Relecture croisée de Cowork avant la fusion, puis verdict, fusion, push.

## 4 · Porte terrain

Une rangée, si Grégoire a une copie de cet automne dont il a réécrit un commentaire de critère : « Copier tout », coller dans une note, comparer au « Dossier PDF » de la même copie. Sinon, aucune porte.
