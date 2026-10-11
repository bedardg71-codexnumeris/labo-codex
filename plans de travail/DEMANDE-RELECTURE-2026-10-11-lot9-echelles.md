# Demande de relecture – lot 9 : les échelles et les cartouches qui disent juste

> Claude Code, 11 octobre 2026, 12 h 01 (mesuré par `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 11 h 37).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright** (règle 7).

## 0 · Étape 0 – le lot 8 sur main

`lot8-cadre` fusionnée (`4f718035`), après le commit de la consigne (`2ff9f161`). Deux conflits : la consigne (gardée dans sa version neuve ; les Nouvelles du lot 8 restent dans `5415b265`) et cinq jetons anti-cache d'`index.html`, résolus par un jeton neuf. Vitest a ensuite rougi sur la sentinelle anti-cache : cinq fichiers du lot 8 gardaient un jeton du 10 oct., antérieur au build 1.198.0. Corrigé par `29315a94`. Vitest vert.

## 1 · Ce qui change pour l'usager

- Dans l'éditeur d'une échelle, « + Ajouter un niveau » ouvre une ligne **en attente** au lieu d'écrire tout de suite un niveau « N » valant 50 sur toute la plage 0-100. Le niveau rejoint l'échelle quand son code, son nom, ses deux bornes et sa valeur ponctuelle sont remplis (#574).
- À la création d'une échelle, un niveau ajouté naît vide, et une échelle dont un niveau est incomplet ne s'enregistre pas : le refus nomme le niveau (#574).
- Une pratique dont l'échelle a disparu ne reçoit plus l'échelle IDME 50/65/80/95 inventée par le code (#590). Une échelle importée est trouvée par son ancien identifiant partout, plus seulement au profil (#590).
- Copier une grille ou une cartouche depuis un autre trimestre, ou depuis les partagés : l'échelle de la cartouche se rattache à l'échelle de même nom et de mêmes codes du trimestre, comme à l'import (#656).
- Tableau de bord : « N évaluations en attente » (barre P) annonce le même seuil que celui de la note, y compris pour une pratique importée ou désignée par un ancien identifiant (#634).

## 2 · Ce qui est fait, fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #590 | `52a10502` | `consolidation.js` retiré ; restent deux résolveurs ; IDME en dur à `pratique-registre.js:263` | `resoudreModeleParId` lit `idOriginal` (échelles seulement) ; échelle introuvable = `{ niveaux: [], introuvable: true }` ; diagnostic des résolveurs mis à jour |
| #574 | `17825b6b` | `ajouterNiveauEchelle` écrivait `N`, 0-100, 50 en base ; deux ajouts de création posaient 0-100/50 ; aucune garde de complétude | tampon `_niveauEnAttente` ; ligne de niveau extraite (`ligneNiveauEchelleHtml`), partagée par le niveau en attente ; garde à l'enregistrement d'une échelle neuve |
| #656 | `12a45010` | le témoin D-C4 n'avait jamais rugi ; trois chemins de copie (Voûte, grille d'un autre trimestre, cartouche d'un autre trimestre en deux branches) | `partageSection.rattacherEchelle`, règle de l'import du lot 3 (même nom + mêmes codes, `memesIdentifiantsElements`) |
| #634 | `a1beeb09`, `6e0c864a` | l'aperçu cherchait l'id brut, ignorait `.config`, retombait à 3 | `seuilEvaluationsPourP` passe par `obtenirConfigPratiqueActive` |

## 3 · Mots d'écran – à soumettre à Grégoire

Tous dans `js/echelles.js` :

1. Ligne du niveau en attente : « Niveau en attente : il rejoint l'échelle quand son code, son nom, ses deux bornes et sa valeur ponctuelle sont remplis. »
2. Infobulle de sa corbeille : « Retirer ce niveau en attente »
3. Refus à l'enregistrement d'une échelle neuve : « Niveau 5 — Le code du niveau est obligatoire. » (le numéro et le motif varient ; les motifs sont les messages existants de `refusChampNiveau`).
4. Notification à l'achèvement : « Niveau ajouté. » / « L'échelle contient maintenant 5 niveau(x). » La seconde phrase de l'ancienne notification (« Ajuste son code, son nom, ses bornes et sa valeur : chaque champ s'enregistre tout seul. ») est retirée : elle ne décrit plus le geste.

## 4 · Ce que j'ai supposé – une ligne chacune

- #590 : les **grilles** n'apprennent pas `idOriginal` (des évaluations d'H2026 pointent des grilles absentes : les rattacher changerait des notes remises).
- #590 : le repli au pool **n'est pas** ajouté à `obtenirEchelleResolue` (il changerait la ligne « Progrès » du PDF élève via `echellesComparables`) ; aucun symptôme vécu, pas inscrit, écrit dans #590.
- #590 : une pratique **par dénotation** à l'échelle introuvable dit « n'établit pas sa note par niveaux » (`note-chiffree`), ce qui est inexact ; sans conséquence observable, laissé.
- #574 : un niveau en attente **est oublié** si l'on quitte l'échelle (il n'a jamais été écrit) ; aucune question posée.
- #574 : les **quatre niveaux proposés** à la création d'une échelle neuve gardent leurs plages et valeurs (90-100/95…) : c'est l'offre de départ, à Grégoire ; noté dans #574.
- #656 : le BACKLOG la disait « à trancher par Grégoire » ; j'ai suivi la consigne, qui la tranche. Un id déjà présent à destination est gardé même si l'échelle diffère ; la grille garde son `echelleId` ; les copies déjà faites ne sont pas réécrites (stock assumé, il se résout par le pool).
- #634 : le défaut devient **7** (celui du moteur) quand le portfolio de la pratique ne dit pas son minimum ; `.portfolio` et `.regles` à la racine ne sont plus lus, la note ne les lit pas.
- Sentinelle #467 : le compte des interpolations nues d'`echelles.js` **monte** de 23 à 24, contre la règle « à la baisse seulement » : six `${index}` sont devenus un `${index}` et six `${attrs}` (fragments d'identifiants), aucun nom désescapé. À juger.

## 5 · Ce qui est vérifié, et comment

- Sentinelles neuves : `sentinelle-590-un-identifiant-une-echelle` (5), `sentinelle-574-niveau-neuf-en-attente` (10), `sentinelle-656-echelle-cartouche-copiee-rattachee` (9), `sentinelle-634-seuil-p-comme-la-note` (6, sur pratique-registre, portfolio et tableau-bord-apercu réels).
- **Break-tests : 21 mutations, 21 rouges**, restaurées par copie, empreintes vérifiées. #590 : 4 ; #574 : 8 (dont la course de #522 rouverte) ; #656 : 6 ; #634 : 3. Deux cas vacants trouvés par les mutations et corrigés avant le commit : le F de #574 (`ajouterPremierNiveau` remplace le tableau) et le cas 1 de #656 (sans homonyme concurrente, il passait sans la règle).
- Bancs transposés, chacun avec sa raison en commentaire : #522 lot 2b (la course se joue à l'achèvement, plus à l'ajout), #468, #542, lot C (3 coins d'outils), #467 (compte), #626 (témoin), Brique C (témoin D-C4), banc d'audit E6 (note 79,45 inchangée), diagnostic des résolveurs.
- Vitest complet : **720 fichiers, 8 576 essais, vert**.
- **Non vérifié** : aucun rendu dans un navigateur (ni Safari ni iPad) de la ligne en attente ; Playwright non lancé (règle 7).

## 6 · Proposition d'un item de Nouvelles

« Ajouter un niveau à une échelle ne pose plus de valeurs à ta place : le niveau attend que tu aies rempli son code, son nom, ses bornes et sa valeur avant de rejoindre l'échelle. »
