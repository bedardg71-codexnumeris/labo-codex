# Ébauche – le barème d'un critère analytique, et le retour à la dissection

> Écrite par Cowork le lundi 19 octobre 2026 à 21 h 52 (Toronto, mesuré par `date`) ; **ajustée à 22 h 05**, puis à 22 h 25 (mesures préalables faites, question 4 reformulée sur l'arrêté du 4 sept.), après confrontation aux skills `pratiques-notation`, `ecosysteme-classe`, `depistage-rai`, `labo-codex`, `integrite-globaux`, `hygiene-donnees-partagees`, `securite-donnees`, `design-interface` et `portes-terrain` (quatre lectures ; leurs affirmations sur le code reprises au code par Cowork, version 1.209.0). **Plan, pas une consigne** : les cinq questions sont répondues (22 h 26) ; chaque lot se cadre dans sa propre consigne. Le mot « barème » est retenu par Grégoire ce soir ; il n'est encore employé nulle part dans l'application.

## L'idée

Un critère analytique se note en points. Son **barème** dit ce que valent ces points : pour chaque tranche de points, un nom facultatif (« Partiel ») et ce qui est attendu. L'échelle de performance ne change pas : elle reste l'instrument des critères holistiques, une seule par évaluation.

Avec une échelle, on choisit un niveau et l'échelle donne la note ; avec un barème, on donne des points et le barème dit à quoi ils correspondent. Un barème peut donc varier d'un critère à l'autre, une échelle non.

## Ce qui existe déjà (mesuré dans le code, 19 oct.)

- Un critère analytique se note en points, sans échelle ; son maximum est sa pondération. (`evaluation-calcul.js`, #941)
- Il peut porter des « réponses » : un texte rangé sous une clé qui contient ses points tels qu'écrits (« 3-4 », « 2 points ») ou, quand la grille nomme ses niveaux, le nom du niveau. Elles se modifient dans Grilles de critères depuis la 1.209.0. (`grilles.js`, « LES RÉPONSES D'UN CRITÈRE »)
- **Aucune évaluation ne lit ces réponses** : `grep -n "descripteurs" js/evaluation-calcul.js js/evaluation-chargement.js` ne rend rien.
- Un critère analytique sans points se lit comme un critère non saisi : `_pointsAnalytiquesDe` rend `undefined`, et `calculerPortee` retombe sur le niveau, sinon sur rien. (`evaluation-calcul.js`)
- Le dépistage lit déjà les points d'un critère analytique, en pourcentage, et aucune réponse. (`profil-etudiant-calculs.js`, `scoreCritereEvaluation`, « les points d'abord », #739)
- Dans la démo Journal de lecture, une fois la grille créée, les points sont restés dans le texte de chaque réponse (« Résume l'essentiel 3-4 ») et la case « Points » de l'éditeur montre le nom du niveau (capture de Grégoire, 21 h 30). Une réponse a deux morceaux (une clé, un texte) ; une tranche en demande trois (un nom, des points, un texte).
- Le schéma de partage des descripteurs est fermé (`partage-schemas.js`). Une version déjà livrée **refuse** un paquet qui porte un champ inconnu et dit à l'enseignant·e qu'il vient peut-être d'une version plus récente : rien ne se perd en silence. (`partage-validation.js`, `validerObjetFerme`, #583)

## Les invariants

1. **Le barème n'entre dans aucun calcul** : ni la note, ni l'indice P, ni le Comparateur, ni l'export, ni le dépistage. Tous lisent les points, comme aujourd'hui. Test sentinelle : mêmes points, même note et même P, avec ou sans barème. (`pratiques-notation` §12)
2. **Une seule fonction de lecture**, pure, partagée par l'éditeur, l'évaluation, le PDF et l'import : un critère donne ses tranches (`bareme`, ou l'ancien `parNiveau` sans `echelleId`) ; des points donnent leur tranche, ou `null`. Le PDF reçoit la tranche, il ne la calcule pas. (`labo-codex` §6 ; `integrite-globaux` §1.2)
3. **Le zéro est une valeur** : une tranche « 0 » et des points à 0 existent ; une clé « Partiel » n'a pas de points (`null`, pas 0) ; la virgule décimale se lit. (`pratiques-notation` §7 bis)
4. **Aucune valeur fabriquée** (#527) : toucher une tranche de plusieurs valeurs offre ses entiers, bornes incluses ; la saisie directe sert au reste (5,5). Tant que rien n'est choisi, rien ne s'enregistre et le critère reste non saisi, comme aujourd'hui.
5. **Rien ne s'efface** : aucune réécriture de masse du stock ; l'ancien `parNiveau` ne disparaît que par la conversion d'un critère à sa première modification, prouvée sans perte (question 2, répondue). (règle de Grégoire du 20 sept. ; `hygiene-donnees-partagees` P5)

## Le modèle (décisions techniques de Cowork)

- Une tranche : un `id` stable, indépendant des points (un lien futur, une cartouche par tranche par exemple, survit alors à « 3-4 » devenu « 3-5 ») ; `nom` (facultatif) ; `pointsMin` et `pointsMax` (des nombres, pas une chaîne à relire à chaque fois) ; `texte`.
- **Des points obligatoires pour toute tranche écrite**, comme la plage d'un niveau d'échelle depuis #526. Une tranche lue dans le stock sans points reste lisible, mais ne se touche pas à l'évaluation. Dans la dissection, une tranche sans points se crée « à compléter », sur le patron de la pondération manquante. La question des tranches sans points disparaît donc.
- Refus clairs, **identiques à l'éditeur et à l'import** : points hors de 0 au maximum du critère, tranches qui se chevauchent, plus de 20 tranches, texte de plus de 5 000 caractères. Une pondération baissée après coup peut rendre une tranche invalide : elle se montre alors « hors barème ». Des points qu'aucune tranche ne couvre aussi. (`securite-donnees` §9.1)
- Partage : `bareme` déclaré au schéma ; suivre `securite-donnees` §4.4 pour la version du format.
- Sécurité : `echapperHtml` sur le nom et le texte d'une tranche dans les trois affichages (éditeur, évaluation, PDF) ; `data-action`, aucun handler inline ; un test pose un `<img onerror>` dans un nom de tranche.

## Les mesures préalables (faites par Cowork, 19 oct., 22 h 25)

- **Les clés écrites aujourd'hui** : la dissection et l'éditeur passent par la même fonction (`materiel-dissection-lecture.js`, `clesDesReponses` et `avecUnite`) : les points tels qu'écrits, avec « points » ajouté à un nombre seul (« 2 points ») ; une plage telle qu'écrite (« 3-4 », mais aussi bien « 3 à 4 » ou « 4 – 5 pts », puisque c'est le texte de l'enseignant·e) ; « Réponse N » quand il n'y a pas de points ; « (2) » ajouté à une clé en double ; le nom du niveau dans une grille qui nomme ses niveaux. La fonction de lecture doit donc lire : un nombre avec ou sans unité, deux bornes séparées par un trait (court ou demi-cadratin) ou par « à », la virgule décimale, le suffixe « (n) » ; « Réponse N » et un nom de niveau donnent une tranche sans points. Une clé illisible devient une tranche sans points, texte intact. (`hygiene-donnees-partagees` P1 et §4)
- **Personne ne calcule avec les réponses** : seuls `grilles.js`, `import-export.js`, `partage-schemas.js` et les fichiers `materiel-*` lisent `descripteurs.parNiveau` (`grep -rln "parNiveau\|\.descripteurs" js` ; les autres résultats sont des variables locales homonymes). `consolidation.js`, `profils-types-generateur.js` et `suggererNoteHolistique` (`pratique-pan-standards.js`) n'y touchent pas. L'invariant 1 tient aujourd'hui.
- **Ce que le PDF dit d'un critère analytique** : son chiffre, « 1 / 2 » (points et poids), quelle que soit la pratique (`synthese-retroaction-data.js`, `lectureNiveauCritere`). C'est l'arrêté 4 de Grégoire, 4 sept. 2026 : « l'élève ne lit que la note chiffrée ». Le bilan de l'application suit la même règle (`evaluation-retroaction.js`, `_lectureNiveauBilan`).

## Le travail, par gestes de l'enseignant·e

### 1. Écrire un barème dans Grilles de critères

Chaque tranche d'un critère analytique montre trois champs : son nom, ses points, son texte. Le barème **remplace** les réponses actuelles des critères analytiques, il ne s'empile pas à côté (stabilité zéro-dette). Composants tirés de `design-system.html`, aucune couleur en dur, aucune couleur par tranche ; l'éditeur s'empile entre 768 et 1 024 px. Refus en trois temps (ce qui s'est passé, pourquoi, quoi faire), en tutoyant. (`design-interface` §2, §4, §6)

### 2. Apporter une grille qui a des niveaux et des points

Dans « Apporter mon matériel », une grille comme le Journal de lecture donne, pour chaque case : le nom de sa colonne, les points surlignés « Points », le texte surligné « Descripteur ». La démo, qui est celle du module, est revue pour montrer ce geste.

### 3. Évaluer une copie avec le barème

Le barème guide la saisie (question 1, répondue). Le texte de chaque tranche se lit **sur place avant de toucher** : ni infobulle, ni fenêtre. Les valeurs apparaissent sans rien déplacer sous le doigt ; cibles de 44 × 44 px, bien espacées ; Tab, puis Entrée ou Espace. « Hors barème » ne prend ni le style d'une alerte de dépistage ni celui d'une erreur. (`design-interface` §5, §7)

### 4. Ce que l'élève lit

Le chiffre, et dessous le texte de la tranche atteinte, sans son nom (question 4, répondue).

**La grille vierge remise avec la consigne** (décision de Grégoire, 20 oct. 2026, 16 h 58, sur proposition de Cowork) : chaque tranche avec ses points et son texte, sans son nom (« 3-4 points : Résume l'essentiel »). Même motif que la copie corrigée : l'élève ne lit pas « Satisfaisant » sur la grille, puis autre chose sur sa note. Né de son constat de 16 h 54 (1.211.0) : l'aperçu montrait l'échelle au lieu du barème et le formulaire exigeait une échelle. Consigne : `CONSIGNE-LOT-2026-10-20-pdf-grille-bareme.md`.

**Révisé à 18 h 39 (Grégoire, sur recommandation de Cowork), après avoir comparé le PDF à sa grille d'origine** : quand tous les critères ont les mêmes tranches, nommées pareil et dans le même ordre, la grille vierge prend la forme de la grille d'origine : une colonne par tranche, son nom en tête ; dans chaque case, le texte et ses points dessous ; les éléments observables sous le critère ; la description ; le total. Le « sans nom » ne vaut plus sur cette grille : sans échelle, les noms ne concurrencent aucun autre vocabulaire. Les autres grilles gardent la forme de 16 h 58. La copie corrigée garde la décision du 19 oct. (le chiffre, le texte, sans nom). Consigne : `CONSIGNE-LOT-2026-10-20-pdf-grille-forme-originale.md`.

**Le principe, dit par Grégoire à 18 h 40** : « C'est important de respecter la présentation originale, parce que c'est la façon dont l'utilisateur pense son processus d'évaluation. Si le produit qu'il obtient dans la boîte Codex ne ressemble pas à ce qu'il pense, il aura l'impression qu'on lui impose une pensée autre que la sienne, et il ne voudra pas utiliser l'application. » ⮕ Ce qu'une grille apportée devient (PDF, Grilles de critères, évaluation) se juge d'abord à sa ressemblance avec la grille d'origine, avant la cohérence interne du vocabulaire de l'application.

### Hors de ce chantier

- Les critères algorithmiques : plus tard, en les distinguant (Grégoire).
- Des cartouches de rétroaction par tranche : l'`id` stable les rend possibles plus tard.
- L'objectif d'intervention suggéré parle en pourcentages, pas en tranches (`suggererObjectifIntervention`).
- Tirer du barème l'acceptabilité des spécifications.

## L'aide, les bulles et l'accompagnement (demande de Grégoire, 22 h 27)

« Barème » et « tranche » sont des concepts nouveaux : ils doivent être **définis**, et **mis en relation** avec ceux qui existent (critère analytique, points, pondération, descripteur, échelle de performance, niveau, plage). Un concept arrive avec sa définition, pas après (zéro-dette) : chaque lot du barème porte ses pièces d'aide. Modèle suivi : `PLAN-2026-10-19-aide-apporter-mon-materiel.md`.

### Mesuré (Cowork, 22 h 30)

- L'application a six outils d'aide : les bulles au survol (`data-tooltip`, `accompagnement-contenu-hover.js`), l'aide « i » (`data-aide`, `accompagnement-contenu-popup.js`), la primo-aide, l'onglet Aide, le lexique (`accompagnement-contenu-terme.js`), la visite guidée.
- Le lexique a déjà : grille de critères, type de critère, échelle de performance, critère, élément observable, descripteur, niveau de performance, points, pondération. Il n'a ni barème, ni tranche ; la plage n'existe que dans l'aide « i » des échelles (`echelle-plage-notes`).
- **Une contradiction à lever d'abord** : l'aide « i » `grille-type-critere-detail` (« Type de critère d'évaluation ») définit l'analytique comme ce qui « décompose et évalue chaque élément séparément », et l'holistique comme ce qui « évalue l'ensemble en considérant les interrelations ». Le lexique (`type-de-critere`) et la bulle de l'éditeur disent autre chose, et c'est ce que fait l'application : holistique, « tu attribues un niveau » ; analytique, « tu attribues des points ». Le barème se définit contre cette seconde lecture : l'aide « i » doit s'y aligner.
- Deux définitions à nuancer : « échelle de performance » (« les niveaux que tu attribues à **chaque critère** ») ne vaut plus que pour les critères holistiques ; « points » (« ce que vaut une réponse, en chiffres ») parle de réponses, qui deviennent des tranches.

### Les pièces

1. **Le lexique** : deux termes neufs, « barème » et « tranche », source unique de leurs définitions (reprises mot pour mot ailleurs) ; leurs renvois : barème → type de critère, points, pondération, tranche, échelle de performance ; tranche → descripteur, points, et la plage d'une échelle, pour les distinguer. Nuancer « échelle de performance », « points », « type de critère ».
2. **L'aide « i » du barème**, dans l'éditeur, à côté du barème d'un critère analytique : ce qu'il est ; ce qui le distingue de l'échelle (avec une échelle, on choisit un niveau et l'échelle donne la note ; avec un barème, on donne des points et le barème dit à quoi ils correspondent ; un barème peut varier d'un critère à l'autre) ; un exemple tiré de la démo Journal de lecture ; un conseil ; « Voir aussi » : `construction-echelles`, `echelle-plage-notes`, `grille-type-critere-detail`. Aligner `grille-type-critere-detail` (contradiction ci-dessus).
3. **Les bulles** : les champs d'une tranche (nom, points, texte), « + Ajouter une tranche », les refus ; à l'évaluation, les tranches (« Touche la tranche qui décrit la copie, puis ses points ») et « hors barème », chez l'enseignant·e seulement.
4. **L'onglet Aide** : une section « Le barème d'un critère analytique », trouvable par la recherche, avec un tableau qui met côte à côte l'échelle et le barème (à quels critères, ce qu'on choisit, ce que l'outil donne, s'il varie d'un critère à l'autre, ce que l'élève lit).
5. **La primo-aide** : à la première rencontre d'un barème dans l'éditeur, une phrase et un lien vers l'aide « i ».
6. **« Apporter mon matériel »** : l'écran de confirmation (« Aller plus loin avec ta grille ») dit qu'une grille en points porte un barème ; l'aide de l'étiquette « Points » de la palette (validée le 18 oct.) est relue, sans y toucher sans Grégoire.
7. **La visite guidée** : aucune étape neuve (le barème n'est pas un onglet) — décision de Cowork.

### Les textes

Cowork les rédige et Grégoire les corrige (sa préférence : corriger un texte proposé plutôt que le composer), sur une page de validation publiée comme celle de « L'aide d'Apporter mon matériel ». Claude Code les intègre tels que validés, sans retouche. Ce sont des mots lus par l'enseignant·e, pas par l'élève (l'élève ne lit que le chiffre et le texte d'une tranche, question 4).

### Le banc

Comme au lot de l'aide d'« Apporter mon matériel » : chaque `data-tooltip` et chaque `data-aide` neufs ont leur entrée au catalogue ; les termes « barème » et « tranche » existent au lexique, et leurs renvois mènent à des entrées qui existent.

### Où cela tombe dans l'ordre

Avec les gestes 1 et 2 : le lexique, l'aide « i », la section de l'onglet Aide, les bulles de l'éditeur, la primo-aide, l'alignement de `grille-type-critere-detail`, l'écran de confirmation. Avec le geste 3 : les bulles de l'évaluation. Les textes se valident avant chaque lot.

## Le retour à la dissection (indépendant du barème, petit)

Mesuré : depuis la 1.208.0, la dissection s'enregistre à chaque geste et son brouillon **reste** après « Créer ma grille ». Mais l'écran de confirmation n'offre aucun chemin pour y revenir, et « Coller une autre grille » efface ce brouillon (après confirmation). (`materiel.js`, `recommencer` ; `materiel-dissection.js`, `oublierBrouillon`)

Ce qu'il faudrait : sur l'écran de confirmation, un bouton secondaire pour revenir à la dissection (mots provisoires : « Revenir à ma dissection »), qui la rouvre telle qu'elle était, avec le mot qui existe déjà : « Dissection reprise telle que tu l'as laissée. » La grille déjà créée ne change pas ; une deuxième création produit une autre grille, sous un autre nom.

Symptôme vécu par Grégoire le 19 oct. au soir : il a dû reconstituer son travail. Il peut donc entrer au BACKLOG.

## L'échelle tirée d'une grille sans points

Déjà là depuis le 18 oct. (1.204) : une grille qui n'a que des niveaux crée sa grille ET son échelle ; une grille qui a les deux propose un choix, « points » par défaut (décision de Grégoire, 18 oct.). Couvert par `tests/integration/materiel-dissection-2b.spec.js` : **aucune porte**, une machine répond. (`portes-terrain`, règle 1)

## Portes et déclarations

Aucune porte due si la conversion de l'ancien format est prouvée sans perte par un test aller-retour, partage compris. La livraison déclare non éprouvés le toucher sur l'iPad et le zoom. À la livraison, `pratiques-notation` reçoit une section « barème » après son §7 bis. (`portes-terrain` §0 et §4)

## Questions pour Grégoire, une à la fois, dans cet ordre

1. ~~Le barème guide-t-il la saisie ou se lit-il après ?~~ **Répondu, 19 oct., 21 h 54 : il guide.** Avec les trois règles acceptées : seuls les points s'enregistrent ; « 3-4 » ne choisit pas à sa place ; la saisie directe reste.
2. ~~Convertir à l'enregistrement ?~~ **Répondu, 19 oct., 22 h 24 : oui.** L'éditeur montre déjà les anciennes réponses lues comme un barème ; la première modification du critère l'écrit tel qu'affiché, sans rien perdre (test aller-retour, partage compris). Rien ne se convertit sans ce geste.
3. ~~Le barème et le dépistage peuvent dire deux choses ?~~ **Répondu, 19 oct., 22 h 25 : le barème reste séparé du dépistage**, qui lit les points comme aujourd'hui (invariant 1). Plus tard, sans fiche : l'éditeur pourrait montrer chaque tranche en pourcentage, pour rendre l'écart visible au moment d'écrire le barème.
4. ~~Ce que l'élève lit ?~~ **Répondu, 19 oct., 22 h 26 : l'arrêté du 4 sept. tient, complété.** L'élève lit le chiffre (« 3 / 5 »), seule note, et dessous le **texte** de la tranche atteinte, **sans son nom** : le texte dit ce que vaut le chiffre (c'est la seule rétroaction propre à un critère analytique, qui n'a pas de cartouche) ; sans le nom, aucun second vocabulaire ne concurrence les niveaux de l'échelle. Dans le PDF comme dans le bilan de l'application (`lectureNiveauCritere`, `_lectureNiveauBilan` : les deux disent la même chose du même critère). Des points hors barème : le chiffre seul ; « hors barème » se lit chez l'enseignant·e seulement. Reste hors de ce chantier, déjà vrai aujourd'hui : sous une pratique qui cache la note, les points par critère la laissent retrouver par addition.
5. ~~Le mot pour une partie du barème ?~~ **Répondu, 19 oct., 22 h 26 : « tranche ».** Libre dans l'application (« plage » sert aux échelles, « palier » à « Palier SOLO du niveau », « niveau » à l'échelle ; « tranche » n'apparaît nulle part à l'écran, mesuré). L'élève ne le lit jamais (question 4).

**Toutes les questions sont répondues (22 h 26) : le plan est prêt à être cadré en lots.**

## Ordre proposé

Le retour à la dissection d'abord : symptôme vécu, petit, aucune question ouverte. Les mesures préalables sont faites. Puis les gestes 1 et 2 ensemble, avec leurs pièces d'aide (textes validés avant), le geste 3 avec les siennes, enfin le geste 4. Fiches : #1119 (le retour à la dissection), #1120 (le barème).
