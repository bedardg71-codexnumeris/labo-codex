# Consigne – La fenêtre de fusion en deux colonnes (29 octobre 2026, suite de #1182)

> Écrite par Cowork le jeudi 29 octobre 2026 à 20 h 59 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `c176cb84` (1.225.1 en ligne). **Passe APRÈS** `CONSIGNE-LOT-2026-10-29-codex-copies-aux-archives.md` (les deux touchent `js/codex.js`). Un seul lot qui écrit à la fois.
> **Demande de Grégoire** (29 oct., 20 h 35 à 20 h 58), après sa première fusion réelle : rendre la fenêtre de fusion conviviale. Aujourd'hui, elle demande « Entrer 1, 2, 3 ou 4 », puis un chiffre par conflit, et montre « La donnée « personnalisationObservations » » avec « Objet {24 propriétés} » des deux côtés : il a choisi sans voir ce qu'il choisissait.
> **L'ébauche, approuvée par Grégoire** (20 h 56, « beaucoup plus clair » ; 20 h 57, « C'est très bien ») : https://claude.ai/artifact/Xq457R7bW6F7sdUBbuckbF (noms fictifs ; deux planches, Mac 1 280 px et iPad 820 px). C'est la référence visuelle et de comportement.
> Ce lot **absorbe** le § 3 de `VERDICT-RELECTURE-2026-10-29-fusion-copie-par-copie.md` (les mots de la fusion) : le lot des copies aux archives ne le fait pas.

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne. Fiche au `BACKLOG.md` (prochain numéro libre). Commit de docs seul : ce fichier et la fiche.

## 1. D'abord, un défaut de #1182 (lu au code par Cowork, non reproduit)

`_direCeQuiEntre` (`js/codex.js:~2497`) : `_compter(venues, nomme ? cle : '', …)`. `cle` y est la fonction globale `cle()`, pas `nomCle` : `_motsDe` → `_nomDeBase(cle)` → `cle.replace` n'existe pas → **TypeError**. Arrive quand une liste nommée sans `id` (aujourd'hui `chronoEvaluations`) n'existe que dans l'autre codex, par exemple un trimestre dont l'appareil d'ici n'a encore aucune durée d'évaluation : la fusion casse au résumé. C'est le lot #1182 qui n'est pas fini : **corrige-le en premier**, test rouge avant (la liste n'existe que là-bas), vert après.

## 2. Ce que Grégoire a décidé (à respecter tel quel)

1. **Deux colonnes, comme la bibliothèque** (20 h 39) : à gauche « Ici », à droite « L'autre codex ».
2. **D'autres appareils que l'iPad et le Mac, lus comme dans le rapport de bug** (20 h 47).
3. **Rien de choisi d'office** (20 h 56) : l'utilisateur peut vouloir récupérer une ancienne version. « La plus récente » est une **mention**, jamais un choix posé ; « Prendre les plus récentes » est **offert** comme raccourci.
4. **Nommer ce qui arrive** au lieu de « N autres données » (20 h 58).
5. **Les mots** (validés à 20 h 58, sauf le point 4, qui te revient à proposer) :
   - Titre : « Fusionner avec un codex »
   - En tête : « Viendront de l'autre codex, sans question : 18 évaluations, 18 annotations, 18 durées d'évaluation et … » (les comptes réels ; « durées d'évaluation » remplace « mesures du chronomètre », le mot de l'écran Rythme) ; puis « Rien n'est effacé : ce qui n'est qu'ici est gardé. Les copies aux archives ici ne sont pas reprises. Les indices seront recalculés après la fusion. » (chaque phrase seulement si elle est vraie, comme aujourd'hui)
   - Section : « Différent des deux côtés (N) », puis « Choisis, pour chaque ligne, la version à garder. »
   - Raccourcis : « Prendre les plus récentes », « Tout garder d'ici », « Tout prendre de l'autre codex »
   - Colonnes : « Ici », l'appareil, « Ton espace actuel » ; « L'autre codex », l'appareil, « Codex du 29 octobre 2026 à 17 h 45 » (la date du manifeste)
   - Rangée : « La plus récente » ; boutons « Garder celle-ci » / « Gardée »
   - Bas : « Il te reste N choix à faire. » / « Tout est choisi. » ; « Annuler », « Fusionner » (désactivé tant qu'un choix manque)
   - Fin : « Fusion terminée. », le bilan, « Pense à mettre à jour le codex pour y garder la fusion. », bouton « Mettre à jour le codex » (le geste existant)

## 3. Les décisions de Cowork (techniques)

1. **Une seule lecture de l'appareil.** Mesuré : trois détections. `_identifierAppareil` (`js/codex.js`) écrit « Mac — Chrome » pour tout Chrome qui n'est pas un iPad, **Windows compris** ; `obtenirInfosSysteme` (`js/rapport-bug.js:414`) distingue iPad, iPhone, Mac, PC, mais lit Edge comme Chrome et Android comme Linux ; `_identifierNavigateur` (`js/codex.js`) lit bien le système. Fais-en **une seule fonction**, partagée par le rapport de bug et le manifeste du codex : appareil (iPad, iPhone, Mac, PC Windows, PC Linux, Chromebook, Android), navigateur (Edge avant Chrome ; les navigateurs iOS), système. Libellé d'une colonne : « Mac, Chrome », « PC Windows, Edge », etc. Le format du rapport de bug ne change pas pour qui le lit (dis-le si une ligne change).
2. **Un codex ancien** porte un `appareil` faux (« Mac — Chrome » sous Windows) : la fenêtre lit d'abord `navigateur` (« Chrome 156 / Windows »), qui porte le bon système ; sinon `appareil` ; sinon la colonne dit « L'autre codex » seule. Aucun manifeste existant n'est réécrit.
3. **La fenêtre** remplace les deux `uiDialogues.demanderSaisie` de `_resoudreConflits` (`js/codex.js:~2660` et `~2685`). Bâtis-la sur l'existant : mesure si `BibliothequeUI.creerFenetreDeuxColonnes` (`js/bibliotheque-ui.js`, #1154) peut porter des rangées **alignées** (un conflit = une rangée, ses deux versions côte à côte) ; sinon, une fenêtre sœur avec les mêmes jetons et classes `biblio2-*` (empilement sous 760 px de fenêtre, cibles de 44 px). Dis lequel dans la demande. « Annuler » n'écrit rien. Règles de sécurité : `echapperHtml` sur tout ce qui vient des données, `data-action`, aucun handler inline.
4. **Ce qui diffère, de chaque côté** : une copie dit la date de son fichier, sa taille, annotée ou non ; une évaluation, sa date de modification (et sa note si elle diffère) ; une clé-objet dit **les entrées qui changent**, valeur courte de chaque côté (« Date objectif (remise) : 30 octobre 2026, 8 h »), « absente » quand l'entrée manque, et « N autres identiques ». « La plus récente » seulement quand les deux côtés ont une date et qu'elles diffèrent.
5. **Une table de libellés**, une seule, sert aux titres des rangées et aux noms de ce qui arrive : au moins `preferencesRythme` → « Date objectif (remise) » ou le libellé de l'entrée qui change, `retroactionsObservations` → « Les textes de tes tampons », `personnalisationObservations` → « Tes tampons personnalisés ». **Mesure les clés qui arrivent « en entier »** sur les codex de Grégoire (`a2026_brouillonDissection`, `interventions`, d'autres ?) et **propose leurs noms dans la demande** : Cowork les fera valider. Une clé inconnue garde son nom technique en repli, jamais d'erreur.
6. Les choix restent ceux d'aujourd'hui dans l'analyse (`choix[_cleDuConflit(c)]`) : seule la façon de les recueillir change.

## 4. Les tests

- Vitest : la lecture de l'appareil sur des chaînes réelles (Mac Chrome, Mac Safari, iPad Safari, iPhone, Windows Chrome, Windows Edge, Android Chrome, ChromeOS) ; un codex ancien « Mac — Chrome » + `navigateur` Windows → « PC Windows, Chrome » ; les différences d'une clé-objet ; la table de libellés et son repli ; le défaut du § 1.
- Playwright WebKit (on attend l'élément, jamais `waitForTimeout`) : une fusion à conflits ouvre la fenêtre, **aucune version n'est choisie**, « Fusionner » est désactivé ; « Prendre les plus récentes » ne choisit que les rangées datées ; un choix par rangée débloque « Fusionner » ; le résultat suit les choix ; « Annuler » n'écrit rien. Noms fictifs.
- Break-test (arbre restauré par sha256) sur le défaut du § 1, sur l'absence de choix d'office, et sur la lecture de Windows.
- **Deux captures** de la fenêtre (1 280 et 820 px de large) dans `plans de travail/captures/` (non commitées), pour que Cowork les compare à l'ébauche.

## 5. Clôture

Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-fenetre-de-fusion.md` : le composant retenu, la lecture de l'appareil et ce qui change dans le rapport de bug, les noms proposés pour ce qui arrive, les captures. Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
