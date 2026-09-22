# Consigne du jour – Réassigner une copie : un seul geste, qui montre la copie et passe par la porte (#932, #934 ; #933 refusé)

> Écrite le 22 septembre 2026, 13 h 30 (Toronto), par Cowork, **révisée à 13 h 50 sur deux réponses de Grégoire (§1d)**, sur `main` = `origin/main` = `ac374dea` (application en 1.153.2). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N1b) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-lot-n1b.md` (déplacée par Cowork, à commiter avec ce lot).
> **Le plan fait foi** : `plans de travail/PLAN-932-933-934-reassocier-une-copie.md` (et l'audit `Rapports/AUDIT-reassocier-une-copie-2026-09-22.md`). Cette consigne ne le recopie pas : elle dit ce qui change de calendrier et **ce que la remesure de Cowork dément dans le plan**.

## 0 · Conditions de départ

- **Avancé par Grégoire** : le plan disait « matinée du 23 sept. ». Grégoire le lance **maintenant** (22 sept., après-midi), motif : un défaut de conception qui peut nuire à l'utilisateur.
- `origin/main` porte `ac374dea` ou un commit de journal après. Sinon, arrête-toi et dis-le. Aucune autre session n'écrit dans `js/`.
- Travaille sur une branche `lot-reassigner` partie de `main`. Rien ne se fusionne ni ne se pousse avant la relecture de Cowork.
- Skill `design-interface` chargé pour tout ce qui touche l'écran (lots 1, 2, 3).

## 1 · Ce que la remesure de Cowork corrige dans le plan (13 h 30, lecture seule, commandes ci-dessous)

**1a. Il y a un CINQUIÈME écrivain, que l'audit et le plan n'ont pas vu.** `appliquerCorrectionIdentite` (`js/travaux-ui.js:5372`), la « correction d'identité » du panneau d'évaluation (ouverte par `toggleCorrectionIdentite`, `:5354`, et automatiquement à `:4906`). Il change l'élève ET/OU la production d'une copie, avec **sa propre porte** : `confirm('Un fichier existe déjà pour cet étudiant et cette production. Remplacer ?')` – la porte muette d'avant #931, qui ne nomme aucun fichier –, puis `reassocierFichier` nu (`:5401`).
Commande : `grep -rn "reassocierFichier(" js/ | grep -v "^js/travaux-stockage.js"` → **5 appels** : `travaux-ui.js:4793` et `:4824` (`changerProductionFichier`), `:5392` et `:5401` (correction d'identité), `liste-evaluations.js:1579` (Propriétés).
⮕ **La sentinelle du lot 2 (point 4 du plan) est fausse telle qu'écrite** : elle serait rouge dès le départ. La correction d'identité **entre dans le lot 2**. Elle montre déjà la copie (elle vit dans la visionneuse) : il lui manque la porte qui nomme.

**1b. La porte ne couvre que la production ; deux écrivains changent aussi l'ÉLÈVE.** Propriétés (`liste-evaluations.js:1574-1580`) et la correction d'identité écrivent `{ etudiantDA, productionId }` ensemble. Changer l'élève d'une copie peut, lui aussi, créer un conflit (une copie existe déjà pour le nouvel élève × cette production). Or `changerProductionFichier` (`travaux-ui.js:4791`) ne prend que `nouveauProductionId`.
⮕ Le plan disait « `etudiantDA` garde son chemin » : **c'est ce chemin qui contourne la porte.** **Décidé par Cowork (technique)** : UNE fonction porte l'écriture de l'association d'une copie et sa porte de conflit, pour `productionId` ET `etudiantDA`. Elle nomme les deux fichiers (forme de #931) et, quand l'élève change, nomme aussi l'élève. Nom, signature et sort de `changerProductionFichier` : à toi (zéro-dette : pas d'alias « au cas où » ; si `changerProductionFichier` reste, c'est comme cette fonction, pas à côté). L'appel du jeton de reprise (`liste-evaluations.js:1686`, #561) et `sentinelle-561-reassociation-verdict.test.js` doivent rester verts.
⮕ **La sentinelle devient** : hors `travaux-stockage.js`, `reassocierFichier(` n'a qu'un appelant, cette fonction ; `reassocierFichiersBatch(` n'a que Transférer (`travaux-ui.js:7262`). Garde de non-vide (règle 10).

**1c. Ce qui est confirmé tel quel** : `genererLigneTableauFichier` `:2970` ; `changerProductionFichierDepuisTableau` `:7356` (le plan dit 7355), appel sans `await` à `:7359` ; `ouvrirProprieteFichier` `liste-evaluations.js:1487` ; libellés `:1305` et `:1640` ; `associerProductionDepuisListe` `:1603` ; `obtenirThumbnailSync` exporté (`travaux-stockage.js:735`, `:1358`) ; lien « Non associé › » qui ouvre Propriétés (`liste-evaluations.js:1185`).

**1d. La prémisse du plan sur le tableau est fausse – dit par Grégoire, 13 h 45.** Le plan écrit que le menu Production du tableau d'« Annoter et évaluer » (l'« État A » de `afficherFichiers`, `travaux-ui.js:1119`, qui ne s'affiche que visionneuse fermée) « a fait les 23 réassociations correctes du 22 sept. ». **Faux** : Grégoire les a faites avec « Réassocier » de la **Liste des évaluations**, une par une. Il ne connaît pas ce tableau (il retombe sur le carrousel). La fiche #931 de `SUIVI-BUGS.md` disait seulement « une par une ».
⮕ Conséquences, **acceptées par Grégoire** : (1) la colonne « Fichier » du tableau (#933) n'est pas faite – **#933 refusé**, motif : écran que l'utilisateur n'emploie pas, besoin couvert par le lot 2 (Propriétés montre la copie), à rouvrir si un testeur s'y trompe ; (2) seul l'`await` du lot 1 survit (`changerProductionFichierDepuisTableau`, `:7359` : sur refus, le menu revient à l'ancienne production), et il passe au lot 2 – ce menu reste un point d'entrée et doit passer par la fonction unique ; (3) **la réassignation en masse (#934) va dans la Liste des évaluations**, pas dans le tableau. Grégoire, textuellement : « Idéalement, j'aurais une option pour procéder à la réassignation par lot plutôt qu'une par une. »

## 2 · Ce que fait le lot – deux commits

- **Lot 2 (#932)** : le plan, **plus** 1a, 1b et l'`await` du tableau (1d). La correction d'identité et le menu Production du tableau passent par la fonction unique. Les deux choix « à trancher au design » du plan (où vit le jeton de reprise ; forme de la vignette) sont **à toi**, avec `design-interface` : dis ce que tu as retenu en une ligne. Seule contrainte : le jeton de reprise ne se perd pas.
- **Lot 3 (#934), déplacé dans la Liste des évaluations** (`js/liste-evaluations.js`). Le geste visé, celui de Grégoire ce matin : filtrer sur la production où l'import s'est trompé (« Artefact 2 »), cocher les lignes **qui portent une copie** (une ligne « Non reçu » n'a rien à déplacer : pas de case, ou case inerte), « Réassigner la sélection (N) », choisir la production cible (« Artefact 2 (rév) »). Une case « tout sélectionner » qui suit le filtre. La confirmation **compte** les copies, **nomme les fichiers** (c'est ce que la liste n'affiche pas) et **liste les conflits** avant d'écrire. Choix « une porte par conflit ou une question groupée » : **décidé par Cowork, question groupée** qui nomme chaque paire (élève, fichier qui part, fichier qui arrive) – 24 `confirm()` à la suite, c'est la fatigue qui a produit #931. L'écriture passe par la fonction unique : sépare la vérification de l'écriture dans cette fonction plutôt que d'ajouter un contournement. Mesure d'abord ce qu'est une ligne de la liste (élève × production, avec ou sans `fichierId`) et dis-le au rapport.
- Spec WebKit du lot 3 : sur le pack démo, dans la Liste, trois lignes cochées, une en conflit ; la question nomme le conflit ; « Annuler » ne déplace rien.

## 3 · Les mots d'écran

Le verbe est tranché par Grégoire : « réassigner » / « assigner ». **Les phrases neuves** (bouton du lot 3, question groupée, porte de la correction d'identité, notification d'abandon) : écris-les, marque-les **proposées** dans ton rapport, en un bloc à part. Grégoire les valide **avant la release**, pas avant le code.

## 4 · Stock – limite du 20 sept.

**Source seulement, aucune donnée réécrite.** Le stock possible : des paires élève × production portant deux copies, créées par Propriétés ou la correction d'identité sans porte. **Ne le répare pas, ne le cherche pas dans ses données.** Dis dans le rapport si le code d'après le lot le rend visible (ou non) quand il existe : c'est tout.

## 5 · Preuves et arrêt

Par lot : Vitest ciblé, break-test à mutations rouges (celles du plan, **plus** : correction d'identité qui rappelle `reassocierFichier` nu ; changement d'élève dans Propriétés qui contourne la porte), restauration par copie, puis Vitest complet depuis `tests/`. Spec WebKit du lot 3 (ci-dessus).
**Arrêt après le commit du lot 3** (deux commits de code : lot 2, lot 3) : pas de release, pas de verdict Playwright, pas de push. Rapport à Cowork : ce que tu as mesuré, ce que tu as supposé, tes écarts avec cette consigne, les trouvailles avec leur issue (1 / 2 / 3), les mots proposés. Cowork relit (règle 2), Grégoire valide les mots, puis release `minor`, verdict Cowork fermé (règle 8), `scripts/pousser.sh`.
**Écritures dues avec le lot** : cases #932 et #934 au BACKLOG ; #933 fermé avec sa disposition « refusé » et son motif (1d) ; #934 réécrit (Liste des évaluations, pas le tableau) ; la fiche #932 gagne la correction d'identité et le changement d'élève (1a, 1b) ; ce fichier et l'archive de la précédente.
