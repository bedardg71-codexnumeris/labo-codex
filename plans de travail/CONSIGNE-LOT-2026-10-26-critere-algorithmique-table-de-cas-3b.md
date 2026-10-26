# Consigne – La table de cas, lot 3b : les tables que l'enseignant·e ajoute (étape 3 du plan du 21 oct.)

> Écrite par Cowork le lundi 26 octobre 2026 à 14 h 55 (Toronto, mesuré par `date`), sur `main` = `a46312ad` (le lot 3a, `cddfd207`, accepté sans retouche : `VERDICT-RELECTURE-2026-10-26-table-de-cas-3a.md` ; non poussé). Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 3. Ébauche validée par Grégoire le 26 oct. : `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`.
> **Relis dans l'ébauche la table « Table de cas » de l'étape « Cas d'interprétation »** (fonctions `tableEnseignant`, `casParDefaut`, `casChoisi`, `libelleCas`, `regleSurCas`, `ajouterTable`) : elle fait foi pour ce que l'enseignant·e voit et pour les mots d'écran. Ses calculs sont des copies ; ceux de l'app font foi.
> Le cœur de l'étape 3 du plan : **la valeur qui choisit le texte est n'importe quelle donnée de la copie, pas seulement la part de la limite** (« si la valeur est…, ce texte »). C'est le geste que Grégoire faisait dans son classeur avec des `SI` imbriqués (`MESURE-2026-10-21-critere-algorithmique.md`, l. 58).

## 0. Avant tout

- D'autres sessions peuvent travailler : ne commence qu'une fois le lot en cours commité, sur un `main` à jour, sans suite qui tourne. Pas de `git stash`.
- **Si le verdict complet et le push du lot 3a n'ont pas eu lieu, ce lot part quand même de `main`** : les deux lots partiront ensemble au prochain verdict, au signal de Grégoire.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `VERDICT-RELECTURE-2026-10-26-table-de-cas-3a.md`, la note de Cowork en tête de `PORTES-TERRAIN-2026-10-26-table-de-cas-3a.md`.

## 1. Les principes

1. **Aucune discipline dans `js/`.** Banc dans les deux disciplines fictives de l'ébauche (« erreurs » sur « mots » ; « unités manquantes » sur « calculs »).
2. **Rien ne change sans geste.** Un critère sans table lit exactement ce qu'il lit aujourd'hui (le relevé du lot 3a, `tests/fixtures/table-de-cas-3a-avant.json`, reste vert à l'octet). Une table neuve et ses cas naissent **vides** : rien de neuf sous les yeux d'un·e étudiant·e tant que l'enseignant·e n'écrit rien (supposition 3 de l'ébauche, acceptée).
3. **Une donnée neuve qui voyage.** Elle part à l'export, au codex, au partage, à la copie d'une grille ; elle revient à l'import. C'est la partie délicate du lot (« la rétro-compat couvre ce qui voyage », `CLAUDE.md`).
4. Les mots d'écran : présent pour ce que le critère fait, conditionnel pour la simulation, jamais le futur ; « étudiant·e ».

## 2. Ce que l'enseignant·e voit, en gestes (l'ébauche fait foi)

1. Dans « Cas d'interprétation », **sous la table des paliers**, les tables de l'enseignant·e, dans leur ordre, puis **« + Ajouter une table de cas »**, puis l'encadré « Ce que l'application choisit sans toi ».
2. **Une table** : en tête « Table de cas », « Selon » et son menu, « Retirer cette table » ; la phrase « L'étudiant·e lit le cas de sa copie sous le critère, après les paliers. Une table neuve naît vide : un cas laissé vide n'ajoute rien à ce que lit l'étudiant·e. » ; les rangées en deux colonnes (Quand · L'étudiant·e lit), qui s'empilent quand la place manque.
3. **Le menu « Selon »** offre six valeurs, nommées avec les noms du critère : « Le compte des {pluriel de ce qu'on compte} », « Le compte des {pluriel de l'étendue} », « La note du critère », « La part de la limite » (désactivée, « (aucune limite) », sans limite fixée), « La moyenne de {pluriel de l'étendue} par {singulier de ce qu'on compte} », « Le code le plus fréquent ». Changer de valeur remplace les cas par ceux de la nouvelle valeur.
4. **Les cas** :
   - valeurs chiffrées : « 0 » (le compte, la note, la part), « Jusqu'à [borne] » (champ, unité : « / {pondération} » pour la note, « % » pour la part), « Au-delà de {dernière borne} » (ou « Toute autre valeur » sans borne), et « Sans valeur » quand la donnée peut manquer (la note, la part, la moyenne), avec sa raison ; « + Ajouter un cas » (une borne au-dessus de la dernière) ; « Retirer ce cas » sur une borne ;
   - le code le plus fréquent : une rangée par code de la liste (« Code N », son nom), puis « Aucun code » ; dessous, la règle d'égalité du critère (« À égalité, le premier de ta liste des codes. » pour un critère neuf ; « À égalité, le premier posé, comme aujourd'hui pour ce critère. » pour un existant) ;
   - chaque cas : la zone violette « Texte de ce cas » (« L'étudiant·e le lit » ; vide : « Vide : ce cas n'ajoute rien. »), qui accepte les blocs de la palette (tous ceux des paliers, plus « Somme pondérée ») ; le repère « cas de la copie fictive » ; **« Voir ce que l'étudiant·e lirait dans ce cas »**.
5. **La simulation** montre le texte du cas atteint après les paliers, avec sa source (« Table · jusqu'à 2 »). La chaîne compte les tables (« 2 tables » : les paliers en sont une) ; le résumé de l'étape les nomme (« une table selon le compte des unités manquantes »).
6. **La phrase retirée au lot 3a revient** dans « Ce que l'application choisit sans toi », ligne du code le plus fréquent : « Pour lui écrire un texte par code, ajoute une table selon « Le code le plus fréquent ». »

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **Le modèle de données** (noms indicatifs, à aligner sur les conventions du fichier) : `critere.tablesCas = [{ id, selon, cas: [{ genre, borne?, code?, texte }] }]`, `selon` ∈ {`erreurs`, `mots`, `note`, `part`, `moyenne`, `code`}, `genre` ∈ {`zero`, `max`, `audela`, `vide`, `code`, `aucun`}. Les identifiants enregistrés ne nomment aucune discipline ; ils ne changent plus une fois écrits. Bornes : max 10 tables, 40 cas par table, texte ≤ 5 000 caractères (comme un palier). **Un critère sans tables n'a pas le champ** : rien n'est écrit tant qu'il n'y a pas de geste.
2. **Le choix d'un cas** (`casChoisi` de l'ébauche) : une valeur absente choisit « Sans valeur » ; sinon, dans l'ordre : « 0 » si la valeur vaut 0, la première borne qui la contient (inclusive), puis « Au-delà ». Pour le code : le code le plus fréquent par la règle d'égalité du lot 3a (`lePlusFrequent`), « Aucun code » s'il n'y en a pas. **Les valeurs sont celles que la palette montre** : la moyenne arrondie comme `{moyenne}`, la part en pourcentage de la limite (comme les seuils des paliers), la note sur la pondération du critère.
3. **Où l'étudiant·e lit** : le texte du cas atteint de chaque table s'ajoute à la phrase du critère, **juste après la projection** (verdict et recommandation), dans l'ordre des tables, séparé par une espace ; **dans les deux modes** (`phraseDecompteAlgo`, mode simple ; `_construireRetroactionAlgoCategories`, mode Catégories, avant l'observation du code dominant). Il est donc enregistré avec la phrase (`donneesAlgorithmiques[…].retroaction`) et repris par le PDF et « Copier tout » sans autre geste. Un texte vide n'ajoute rien, pas même une espace. Les blocs sans valeur disparaissent (règle de `rendre`).
4. **Les valeurs au moment de la phrase** : la note est calculée avant la phrase en mode simple (`noteCalculee`) ; la part et la moyenne sortent du calcul de projection ; **le code le plus fréquent sort des codes posés sur la copie** (la même source que la ligne « principalement » du bilan). Un compte tapé sans code posé donne « Aucun code ». Mesure ce qu'il faut passer à `phraseDecompteAlgo` sans changer ce qu'elle rend pour un critère sans table ; la réparation du stock (`comptes-erreurs-stock.js` l. 244) l'appelle aussi : elle doit rendre la même phrase qu'aujourd'hui pour tout critère sans table.
5. **« + Ajouter une table de cas » crée une table selon « Le compte des … »**, la valeur que tout critère possède (écart à l'ébauche, qui proposait le code le plus fréquent : un critère à compte tapé n'a pas de codes). Les cas par défaut de chaque valeur : ceux de `casParDefaut` dans l'ébauche.
6. **« Retirer cette table »** : si au moins un de ses textes est écrit, une confirmation dans la carte (« Retirer cette table et ses textes ? » · « Retirer » · « Annuler »), jamais `confirm()` ; vide, elle part tout de suite. Motif : la règle de Grégoire du 20 sept., aucun effacement irréversible sans qu'il le voie.
7. **La simulation** passe par `miroirAlgo.essayer` (un seul calcul) ; « Voir ce que l'étudiant·e lirait dans ce cas » cherche une copie qui atteint le cas (compte, puis étendue ; trois fois le code pour un cas de code ; aucun code pour « Aucun code »), comme `regleSurCas` dans l'ébauche, et dit ce qu'il a réglé.

## 4. Le transport (mesuré par Cowork en lecture, à revérifier)

- **Import** : `assainirObjet` et le schéma du critère (`js/import-export.js` l. ~887-955, à côté de `paliersProjection`). Une table illisible (valeur ou genre inconnus, borne non numérique) est écartée, pas devinée ; un import d'une grille sans tables reste identique.
- **Partage** : `js/partage-schemas.js` (l. ~267-393), `projeterEntite`, `validerPackage`.
- **Export, codex, archives, copie de grille, bibliothèque** : mesure par `grep` que chacun copie le critère entier (ou dis lequel ne le fait pas).
- ⚠ **Trouvaille à mesurer puis inscrire, hors lot** : le schéma de partage des paliers ne déclare pas `leveSignalement` (l'import le déclare, `import-export.js` l. 948). Si le partage écarte les clés non déclarées, une grille partagée perd « Ce palier lève un signalement ». Mesure ; si c'est vrai, inscris-le avec le symptôme.

## 5. Où (mesuré par Cowork en lecture, à revérifier)

- `js/atelier-algo.js` (`TEXTES.cas`, la chaîne, la simulation), `js/grilles.js` (`rendreBlocProjectionAlgo` et ses voisines du lot 3a, `rendreChoixAppAlgo`, les gestionnaires), `js/evaluation-calcul.js` (`phraseDecompteAlgo` l. 204, `_construireRetroactionAlgoCategories` l. 688, `calculerNoteAlgorithmiqueSimple`), `js/miroir-algo.js`, `js/palette-algo.js` (l'offre des zones de table), `js/codes-annotation.js` (`lePlusFrequent`), `js/import-export.js`, `js/partage-schemas.js`, `styles.css` (les règles `.table-cas*` du lot 3a servent aussi ici), `index.html` (jetons).

## 6. Pièges connus

1. **Le stock** : le relevé du lot 3a reste vert à l'octet ; ajoute-lui un critère neuf **sans** table (même phrase qu'avant ce lot).
2. **Une évaluation déjà enregistrée** garde sa phrase. Mesure ce qui arrive quand l'enseignant·e ajoute une table à une grille déjà employée puis rouvre une copie évaluée non verrouillée : la phrase se recalcule-t-elle, et s'enregistre-t-elle sans geste ? Dis-le dans la demande de relecture ; ne change rien à ce comportement dans ce lot.
3. Le redessin du gabarit : la table ouverte, la borne en cours de saisie, le menu « Selon » et le focus d'une zone ne sautent pas.
4. Règles 1 et 2 de `CLAUDE.md` : tout texte de l'enseignant·e par `textContent` ou `echapperHtml` ; aucun gestionnaire en ligne ; un texte importé ou partagé est une donnée étrangère. Aucun nom d'élève réel.
5. Deux critères algorithmiques dans une grille : chacun ses tables.

## 7. Preuve exigée

- **Vitest** : le choix d'un cas pour chaque valeur et chaque genre (« Sans valeur », « 0 », bornes inclusives, « Au-delà », égalité de codes neuf / existant, « Aucun code ») ; la phrase des deux modes avec et sans tables (sans : identique) ; un texte vide n'ajoute rien ; l'aller-retour export → import et partage → réception, table intacte ; une table illisible écartée ; les bornes de taille. Break-test pour chacun.
- **Playwright (WebKit)** : ajouter une table, changer « Selon », écrire un texte avec un bloc, ajouter et retirer un cas, « Voir ce que l'étudiant·e lirait dans ce cas », la simulation ; **une vraie copie évaluée** (mode simple, codes posés dans Annoter) dont la phrase sous le critère et le PDF portent le texte du cas ; la confirmation de « Retirer cette table » ; 1 440, 1 180, 820 et 700 px.
- **Captures** : 1 440, 1 180, 820 px, clair et sombre, une table de chaque sorte (compte, code), sur les deux disciplines.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord.

## 8. Ce qui n'entre pas

Les calculs que l'enseignant·e compose (étape 4 : ici, on choisit parmi les valeurs existantes) ; une table qui écrit ailleurs que sous le critère (le bilan) ; le mode Catégories (#1133) ; « élève » hors de l'atelier.

## 9. Clôture

- Le plan du 21 oct. : la ligne de l'étape 3 à « fait », avec les commits de 3a et 3b.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-26-table-de-cas-3b.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
