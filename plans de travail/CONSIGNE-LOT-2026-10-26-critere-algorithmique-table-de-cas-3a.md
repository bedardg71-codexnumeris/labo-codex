# Consigne – La table de cas, lot 3a : l'étape « Cas d'interprétation », ses paliers et ce que l'application choisit seule (étape 3 du plan du 21 oct.)

> Écrite par Cowork le lundi 26 octobre 2026 à 13 h 30 (Toronto, mesuré par `date`), sur `main` = `c07270a6` (1.219.1 en ligne). Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 3. Textes tranchés par Grégoire le 25 oct. à 17 h 19 : `TEXTES-2026-10-25-table-de-cas-a-corriger.md`. **Ébauche validée par Grégoire le 26 oct. (12 h 56 ; table des paliers revue et validée à 13 h 23)** : `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`, copie de l'artefact.
> **Ouvre l'ébauche dans un navigateur et lis son code avant tout.** Elle fait foi pour ce que l'enseignant·e voit et pour chaque mot d'écran ; elle n'est pas du code à reprendre (ses calculs sont des copies, ceux de l'app font foi). Ses « Ce que j'ai supposé » (neuf points, en tête de page) sont des décisions acceptées par Grégoire.
> **L'étape 3 est coupée en deux lots, décision de Cowork.** 3a (ce fichier) : la présentation, les paliers en table, les défauts d'un critère neuf, les choix que l'application fait seule. 3b (consigne à venir, après le verdict de 3a) : les tables que l'enseignant·e ajoute (« + Ajouter une table de cas »), une donnée neuve qui voyage. **Dans ce lot, l'ébauche montre une table de l'enseignant·e : ne la code pas.**

## 0. Avant tout

- D'autres sessions peuvent travailler : ne commence qu'une fois le lot en cours commité, sur un `main` à jour, sans suite qui tourne. Fichiers du § 5 modifiés par une autre session, non commités : arrête et dis-le. Pas de `git stash`.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, l'ébauche, `TEXTES-2026-10-25-table-de-cas-a-corriger.md` (non suivi depuis le 25), la ligne du plan du 21 oct.

## 1. Les principes

1. **Aucune discipline dans `js/`** (principe de Grégoire, 21 oct., 9 h 20). Banc dans deux disciplines fictives au moins, dont une sans texte : celles de l'ébauche (« erreurs » sur « mots » ; « unités manquantes » sur « calculs »).
2. **Tarir n'est pas réparer.** Un critère existant (sans la marque `codesSousCriteresSeulement`, `codes-annotation.js` l. 86) **lit exactement ce qu'il lit aujourd'hui** : mêmes textes, mêmes paliers, même règle d'égalité, même note. Aucune donnée existante n'est réécrite. Ce qui change pour l'élève ne vaut que pour un critère **neuf** (né marqué depuis le 21 oct.), sauf les deux phrases du § 3.6, où seuls les noms changent.
3. **Le temps des verbes** (Grégoire, 26 oct.) : à l'écran, le **présent** pour ce que le critère fait réellement, le **conditionnel** pour ce que la simulation montre, **jamais le futur**. **« étudiant·e »** remplace « élève » dans tout l'atelier du critère algorithmique (pas ailleurs dans l'app : § 8).

## 2. Ce que l'enseignant·e voit, en gestes (l'ébauche fait foi)

Les mots ci-dessous sont ceux de l'ébauche ; reprends-les **au caractère près** depuis son code.

1. **La palette** s'appelle « Blocs de textes » : « Ces blocs servent à composer les phrases que ce critère écrit seul sur chaque copie. Chaque bloc prend la valeur réelle de la copie évaluée. » Légende : « Après la flèche : la valeur que le bloc prendrait sur la copie fictive. » Groupes : « Ce que tu écris dans la grille » / « Ce qui se remplit quand tu évalues la copie ». Le bloc de la moyenne s'appelle « Moyenne de {pluriel de l'étendue} par {singulier de ce qu'on compte} » (« Moyenne de calculs par unité manquante »).
2. **La chaîne et les étapes** : **Ce que tu relèves et comptes → Codes utilisés → Note calculée → Cas d'interprétation → Ce que l'étudiant·e lit**, avec les buts et résumés de l'ébauche.
   - « Ce que tu relèves et comptes » : le but, puis le tableau « Deux exemples » (les deux paires de noms et la phrase que l'étudiant·e lit), puis les champs. Les deux exemples sont du **texte d'aide fixe**, ils ne nomment aucune discipline.
   - « Codes utilisés » : le texte d'aide de l'ébauche ; la colonne « Pondération ». La ligne « Ce critère utilise encore les dix codes de la palette générale ; tu les configures dans Annoter, sous l'engrenage de la palette. » remplace la note d'aujourd'hui sous la case d'activation décochée (`grilles.js` l. ~3953, « Décochée : la palette montre les dix codes… ») ; **la case reste**, pour les critères non marqués. « Aucune annotation » reste dans cette étape.
   - « Note calculée » : le but de l'ébauche. La formule ne change pas.
   - « Ce que l'étudiant·e lit » : décompte, défi prioritaire, quand tout est maîtrisé, avec les aides de l'ébauche.
3. **« Cas d'interprétation »** (remplace « Paliers ») : les deux paragraphes de l'ébauche, puis **la table des paliers**, puis l'encadré **« Ce que l'application choisit sans toi »** (quatre lignes, chacune avec « Modifier son texte » qui ouvre la zone, sauf le code le plus fréquent).
4. **La table des paliers** reprend **tout** ce que fait aujourd'hui `rendreBlocProjectionAlgo` (`grilles.js` l. 4026), disposé comme l'ébauche :
   - en-tête : « Paliers », « Selon » + le repère « La part de la limite atteinte par la copie », le menu « Reprendre une de tes collections… » (s'il y en a), « Retirer la limite » ;
   - sans limite : la phrase de l'ébauche et « Fixer une limite » ; les collections restent accessibles ;
   - avec limite : la phrase d'introduction ; les cinq réglages (« Longueur de référence ({pluriel de l'étendue}) », « Tolérance sur cette longueur ({pluriel de ce qu'on compte}) », « Nom du service d'aide », « Ce que le signalement t'affiche », « Lien d'inscription au service (facultatif) ») ; la ligne « Limite : … » ; « La limite est indépendante de la formule de la note… » ;
   - une rangée par palier, en trois colonnes (Quand · Nom court · L'étudiant·e lit) qui s'empilent quand la place manque : **le seuil se règle en pourcentage de la limite** (« Jusqu'à [30] % de la limite », « soit au plus 1 … à chaque N … »), enregistré comme aujourd'hui (`ratioMax` = pourcentage ÷ 100) ; le verdict ; la recommandation (repliée en « + Ajouter une recommandation » quand elle est vide) ; « Ce palier lève un signalement » ; **« Voir ce que l'étudiant·e lirait à ce palier »** (décision 10 du verdict du 24 oct.) ; « Retirer ce palier » ; le repère « cas de la copie fictive » sur la rangée atteinte ;
   - « + Ajouter un palier » ; « Enregistrer ces paliers sous un nom… », « Mes collections ».
5. **La colonne de droite** s'appelle « Simulation de ce que l'étudiant·e lirait », avec la phrase d'introduction de l'ébauche. La copie fictive dit « Le plus fréquent : code N, nom » (et l'égalité, quand il y en a une). **Une copie de référence de plus, « Égalité »**, quand le critère a au moins deux codes : deux codes posés deux fois chacun, le second de la liste posé le premier. Les conditions se disent au conditionnel (« Si la copie portait au moins un code… », « s'afficherait » / « ne s'afficherait pas » / « dépendrait des autres critères »). Deux lectures de plus : la ligne « principalement » de « Points récurrents », et le signalement (« Pour toi seul·e »).

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **« Fixer une limite » / « Retirer la limite » remplacent le menu « Modèle de projection »** (supposition 8 acceptée). Les identifiants ne bougent pas (`norme_externe`, `aucune`). **« Retirer la limite » garde ce qui est écrit** (longueur, tolérance, service, paliers) : « Fixer une limite » le retrouve. Aujourd'hui, passer à « Aucune projection » efface `paramsProjection` (`appliquerAuCritere`, l. 764) : c'est une perte que Grégoire refuse (« je ne veux pas qu'on efface des données de façon irréversible »). Mesure que `normaliser` ignore les paramètres sous `aucune`, et que l'export et le partage les acceptent (`import-export.js` l. ~942, `partage-schemas.js` l. ~267).
2. **Les collections** passent du menu au « Reprendre une de tes collections… » de l'en-tête ; même geste (copie, aucun lien), mêmes mots ailleurs.
3. **Un critère neuf qui fixe sa limite pour la première fois part de champs vides** (supposition 9) : ni 900, ni 30, ni « Centre d'aide du collège ». ⚠ Aujourd'hui, `_valeurParametre` (l. 442) remplace un vide par le défaut du modèle : il faut un chemin pour le critère marqué, sans toucher la lecture des critères existants. Tant que la longueur ou la tolérance manque, la ligne dit « Écris la longueur de référence et la tolérance : les paliers s'appliquent dès que les deux dépassent 0. », l'étape « Cas d'interprétation » est « à régler », et aucune copie n'atteint de palier.
4. **Les paliers d'un critère neuf** sont ceux du 25 oct., écrits sur le critère (`paliersProjection`) au moment où il fixe sa limite : « Aucune occurrence » (« C'est exceptionnel. »), « Excellent », « Très bien », « Bien », « Risqué » (« Ce rapport est risqué : il approche de la limite. » ; aide « Il pourrait être utile de demander de l'aide : {service}. »), « Au-delà » (« Ce rapport dépasse la limite fixée. » ; aide « Il serait important de demander de l'aide : {service}. »). Seuils : 30, 40, 50, 100 %. Ils remplacent le contenu de `PALIERS_GABARIT_NEUF` (`evaluation-projection.js` l. 310, défini mais jamais servi, mesuré le 4 sept.). Un critère existant garde la lecture de `PALIERS_MIGRATION`.
5. **« Quand tout est maîtrisé » d'un critère neuf** : « Tu pourrais encore raffiner : {critere} », **sans point final** (supposition 7 : `synthese-retroaction-data.js` l. ~919 et `evaluation-retroaction.js` l. ~1112 écrivent après lui « ({n} {nom}). »). **Un critère existant lit toujours « Concentre-toi sur {critere} »**, y compris par « Revenir au modèle ». ⚠ `normaliser` (`evaluation-enonces.js` l. 705) lit le défaut du modèle à chaque rendu : changer `ENONCES_GENERIQUES.concentre` changerait le stock. Route recommandée : le modèle générique a deux défauts pour cette clé, choisis par la marque du critère neuf ; « Revenir au modèle » rend celui du critère.
6. **Les noms de l'enseignant·e dans deux phrases que l'étape 2a n'avait pas atteintes** (supposition 6, la seule qui touche ce que lit l'étudiant·e) : le préfixe « Tu fais en moyenne 1 {singulier} à chaque {N} {étendue accordée à N}. » (`evaluation-projection.js` l. ~713, aujourd'hui « 1 erreur à chaque N mots ») et la ligne « {critère} : {n} {nom accordé} (principalement : {code}) » de « Points récurrents » (`construireFrancaisResume`, `synthese-retroaction-data.js` l. 1012-1023, aujourd'hui « erreur(s) »). Même structure, les noms seulement (`enoncesAlgo.noms`, `accorder`, `nombreEtNom`). Un critère sans noms lit « erreur » / « mot » : la phrase d'hier, à l'octet. Même règle pour les mots d'écran de la limite (`libelleSeuil`, les libellés des paramètres).
7. **La règle d'égalité du code le plus fréquent** (Grégoire, 25 oct.) : pour un critère neuf, le premier dans la liste des codes (`codesAnnotation.listeCodes`) ; pour un critère existant, le premier à atteindre ce nombre, comme aujourd'hui. Deux endroits : `_trouverCodeDominant` (`evaluation-calcul.js` l. 659, mode Catégories) et `construireFrancaisResume` (« principalement »).
8. **Les zones des paliers acceptent aussi les deux noms** (`{nomErreurs}`, `{nomMots}`, accordés au compte), comme le décompte. Le préfixe tombe toujours selon les jetons de projection (décision du 4 sept.), pas selon les noms.
9. **La simulation** se calcule par `miroirAlgo.essayer` (un seul calcul). « Égalité » s'ajoute à `miroirAlgo.copies`. « Voir ce que l'étudiant·e lirait à ce palier » cherche une copie qui atteint ce palier, en allongeant l'étendue si le compte entier ne le permet pas (l'ébauche le fait : `regleSurPalier`), et dit dans la simulation ce qu'elle a réglé.

## 4. Ce qui reste tel quel

La formule de la note et son calcul ; les phrases d'une évaluation déjà enregistrée (`donneesAlgorithmiques[…].retroaction`) ; le décompte, le défi prioritaire et « Aucune annotation » ; les seuils et textes de tout critère existant ; le mode Catégories (#1133, décision de Grégoire en attente) ; les identifiants enregistrés.

## 5. Où (mesuré par Cowork en lecture, à revérifier)

- `js/atelier-algo.js` : `TEXTES` (l. 50-100), l'ordre et l'état des étapes (`_etapePaliers` → « Cas d'interprétation »), la simulation (l. ~605-630).
- `js/grilles.js` : `rendreBlocProjectionAlgo` (l. 4026-4270), `rendreSaisieCollectionProjection` (l. ~4282), `rendreNomsCritereAlgo` (l. 4486), `rendreSousCriteresAlgo` (l. 4590) et la note de la case (l. ~3953), `rendreBlocEnoncesAlgo` (l. 3845), `rendreBlocFormuleAlgo` (l. 3653), `rendrePaletteAlgo` (l. 3810), `rendreCartesGabaritAlgo` (l. 5140), les gestionnaires du modèle de projection (l. ~6240-6300).
- `js/evaluation-projection.js` : `PALIERS_GABARIT_NEUF`, `appliquerAuCritere`, `_valeurParametre`, `_resultat`, `libelleSeuil`, `poserDefautNeuf`.
- `js/evaluation-enonces.js` (`normaliser`, `ENONCES_GENERIQUES`), `js/codes-annotation.js` (la marque), `js/evaluation-calcul.js`, `js/synthese-retroaction-data.js`, `js/miroir-algo.js`, `js/palette-algo.js` ; `styles.css` ; `design-system.html` si l'atelier s'y décrit.

## 6. Pièges connus

1. **Le stock** (§ 1.2) : un essai compare, sur un critère existant de démonstration, la note et toutes les phrases (critère, bilan, PDF) avant et après le lot, à l'octet. Le lot 4 l'a fait : reprends son relevé.
2. `_valeurParametre` et la lecture de `normaliser` : un critère neuf aux champs vides ne doit pas retomber sur 900 / 30 à la lecture.
3. Le rendu du gabarit redessine tout à chaque modification : la section ouverte, la copie fictive réglée, le focus d'un seuil en cours de saisie et la saisie d'un nom de collection ne doivent pas sauter.
4. Un seuil saisi en pourcentage : arrondi, virgule décimale (« 7,5 »), valeur ≤ 0 refusée sans rien écrire.
5. Règles 1 et 2 de `CLAUDE.md` : `textContent` ou `echapperHtml` pour tout ce que l'enseignant·e écrit ; aucun gestionnaire en ligne. Aucun nom d'élève réel (règle 6).
6. Les bancs des étapes 0 à 2b, 5 et de la présentation (`grep` de `miroir-algo`, `palette-algo`, `gabarit-algo`, `atelier-algo`, `critere-algorithmique`) : recalés sur les nouveaux mots, pas affaiblis ; dis lesquels.

## 7. Preuve exigée

- **Vitest** : la règle d'égalité (neuf / existant) ; le préfixe et la ligne « principalement » avec et sans noms (sans noms : la phrase d'hier, à l'octet) ; le défaut de « Quand tout est maîtrisé » selon la marque, et par « Revenir au modèle » ; les paliers d'un critère neuf qui fixe sa limite ; les champs vides d'un critère neuf ; « Retirer la limite » puis « Fixer une limite » retrouve les valeurs ; la conversion pourcentage ↔ `ratioMax`. Break-test pour chacun.
- **Playwright (WebKit)** : les deux disciplines fictives ; la chaîne et ses cinq noms ; la table des paliers (seuil en %, ajouter et retirer un palier, signalement, « Voir ce que l'étudiant·e lirait à ce palier ») ; « Fixer une limite » sur un critère neuf (champs vides, puis paliers du 25 oct.) ; une collection enregistrée puis reprise ; « Égalité » ; le stock (piège 1) ; 1 440, 1 180, 820 et 700 px.
- **Captures** : 1 440, 1 180, 820 px, clair et sombre, l'étape « Cas d'interprétation » ouverte, sur chacune des deux disciplines.
- Portes terrain : skill `portes-terrain` (l'iPad et Safari réels sont à prévoir).

## 8. Ce qui n'entre pas

Les tables de l'enseignant·e (lot 3b) ; les calculs composés (étape 4) ; le mode Catégories (#1133) ; « élève » hors de l'atelier du critère algorithmique ; le PDF hors des deux phrases du § 3.6.
**À inscrire, trouvaille hors lot** : le titre « --- Langue --- » du texte copié par « Copier tout » (`evaluation-retroaction.js` l. ~229) nomme une discipline ; l'étudiant·e le lit.

## 9. Clôture

- Le plan du 21 oct. : la ligne de l'étape 3 à « 3a fait », avec ses commits.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-26-table-de-cas-3a.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
