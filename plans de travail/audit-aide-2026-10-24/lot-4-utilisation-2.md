# Lot 4 – Utilisation hebdomadaire (2e partie)

Audit en lecture seule, dépôt au commit 35745bd (1.216.2). Plage : `index.html:11876-12696`, dix entrées, 3 347 mots selon l'inventaire. Les comptes « ~N mots » des blocs sont mesurés sur le texte sans balises.

---

### gerer-jetons — « 3. Gérer les jetons » (index.html:11876-11907, 79 mots)
- Vrai ? : à corriger
  - Lieu du geste — Aide : « Navigation : Évaluation → Liste des évaluations » / Code : la liste ne fait que montrer et filtrer les jetons (filtre « Statut », `index.html:8356-8359`) ; on les applique dans Annoter et évaluer, bloc « Appliquer un jeton : » (`index.html:8622-8626`), et on les règle dans Conception › Pratiques de notation › « Système de jetons » (`index.html:6065`).
  - Plafond — Aide : « maximum 3-4 selon configuration » / Code : 2 par défaut (`index.html:6095`, champ « Nombre de jetons alloués par étudiant·e », `value="2"`, de 0 à 20 ; `evaluation-jetons.js:145-150` ; `evaluation-sauvegarde.js:765-767`).
  - Types — Aide : délai et reprise / Code : la pratique propose aussi « Reprise ciblée » (`index.html:6155-6168`), que plus aucun geste n'applique (voir jetons-reprise).
  - Prescription — Aide : « Bonnes pratiques : Expliquer clairement le système de jetons aux étudiant·es » : forme impérative, l'application parle au conditionnel.
- Sert ? : doublon presque complet de `jetons-reprise` (même chemin de navigation, mêmes types) et des entrées « Jetons », « Jetons de délai », « Jetons de reprise » du glossaire (`index.html:13800-13810`) ; « Encourage l'amélioration continue » et « Philosophie PAN : apprendre de ses erreurs » (~10 mots) relèvent du principe pédagogique ; seul « le système compte les jetons utilisés » est un fait d'écran.
- Verdict proposé : fusionner avec jetons-reprise
- Motif : tout ce qui est vrai ici se retrouve dans jetons-reprise ; le reste est faux ou prescriptif.
- Tests qui l'épinglent : aucun

### irrecevables — « 4. Gestion des travaux irrecevables et non-remis » (index.html:11910-12051, 574 mots)
- Vrai ? : à corriger
  - Correction du 15 oct., complétion : tient. Une copie non recevable n'est pas une remise et reste au dénominateur (`pratiques/pratique-registre.js:878-881`, lu par `pratique-sommative.js:313` et `pratique-pan-standards.js:381`).
  - Correction du 15 oct., note : tient. En sommative la note ne lit pas le statut d'intégrité et la copie vaut 0, car les critères passent à « 0 - Aucun » (`pratique-sommative.js:85-104` ; `evaluation-sauvegarde.js:595-605`) ; en standards la copie sort du portfolio (`profil-etudiant-actions.js:211-213`) ; en hybride, une fois les notes finales cochées, une obligatoire absente compte au dénominateur (`profil-etudiant-actions.js:236-251`) ; la moyenne de la liste l'écarte (`liste-evaluations.js:594`).
  - Badge du non-remis — Aide : « Badge «Non remis» dans le tableau des évaluations » / Code : la liste affiche la pastille « Non reçu » et « -- » en note (`liste-evaluations.js:137`, `:1397-1405`, `:1417-1419`) ; le badge « Non remis » est celui du profil (`profil-etudiant-sections-affichage.js:3266`).
  - Non-remis et P — Aide : « Performance (P) : Exclu du calcul de la moyenne » / Code : vrai en sommative au fil du trimestre, faux en standards hybride une fois les notes finales cochées, où une obligatoire non remise vaut 0 (`profil-etudiant-actions.js:236-251`) ; la même carte le dit trois paragraphes plus bas (`index.html:11947`).
  - Libellés du menu — Aide : « Non recevable - Plagiat », « Non recevable - IA non autorisée » / Écran : « Non recevable (Plagiat) », « Non recevable (IA non autorisée) » (`index.html:8609-8610`).
  - « Le système distingue clairement deux situations » : la carte en présente trois (non remis, non recevable, soupçonné).
- Sert ? :
  - Ce qui relève d'un geste (~100 mots) : la procédure (menu « Intégrité académique », notes, critères mis à 0, verrou) et le jeton de reprise.
  - Ce qui relève de l'exposé de calcul (~430 mots) : les blocs « NON REMIS » (~60) et « NON RECEVABLE » (~180), « SOUPÇONNÉ » (~45), « Principe clé » (~40, qui répète mot pour mot les quatre familles) et le scénario chiffré en standards, tableau de cinq lignes plus résultats (~115).
  - Redite d'écran : « Si non recevable : tous les critères passent automatiquement à «0 - Aucun» » répète le message affiché au même moment (`evaluation-sauvegarde.js:614-619`).
  - Doublon : l'infobulle `eval-integrite` dit déjà l'essentiel (`accompagnement-contenu-hover.js:357-358`).
- Verdict proposé : corriger et resserrer (~574 mots → ~250)
- Motif : garder les trois statuts en une ligne chacun, les quatre lignes par famille (décision du 15 oct.) et la procédure ; retirer « Principe clé » et le tableau, qui répètent.
- Tests qui l'épinglent : `tests/unit/sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js` (découpe entre « Travail NON RECEVABLE » et « Travail SOUPÇONNÉ », exige « 7/9 » et les quatre lignes par famille mot pour mot). L'infobulle `eval-integrite` renvoie à « Aide › « Travail NON RECEVABLE » » (`accompagnement-contenu-hover.js:358`) : renommer ce titre casse le renvoi et le test.

### verification-hebdo — « 5. Vérification hebdomadaire » (index.html:12054-12102, 67 mots)
- Vrai ? : à corriger
  - Navigation — Aide : « Navigation : Aperçu » / Code : l'onglet Aperçu n'existe plus depuis le 27 mai 2026 ; l'écran est Suivi › « Suivi du groupe » (`config.js:69` ; `index.html:911-912`, `:7481-7489`).
  - Indices — Aide : « Assiduité (AE/AI) : Sommative et alternative (3 derniers cours) » et « Comparer les indices sommatifs et alternatifs » / Code : l'indice alternatif est retiré, « alternatif pointe vers sommatif » (`indices.js:589`, `:632-633` ; le magasin d'assiduité n'a plus que `sommatif`, `indices.js:323-346`) (#224).
  - Seuil de P — Aide : « Performance < 60 % » / Code : le filtre du panneau « Détails » est « P < 65 % » (`tableau-bord-apercu.js:333`, `:444`) ; A ou C sous 70 % est juste (`contexte-qualification.js:289-293`).
  - Colonne « Action » (« Rencontre immédiate », « Investigation obstacles », « Soutien pédagogique ») : prescription présentée comme règle de l'application ; aucun écran ne la propose.
- Sert ? : rien de juste que l'écran ou l'entrée `tableau-bord` (lot Consultation) ne dise déjà ; la définition de C et de P est donnée ailleurs dans l'Aide.
- Verdict proposé : couper
- Motif : trois affirmations sur quatre sont périmées, et la quatrième (le seuil de A et de C) appartient à l'entrée qui décrit le Suivi du groupe.
- Tests qui l'épinglent : aucun

### snapshots — « 6. Captures de progression hebdomadaires » (index.html:12105-12176, 457 mots)
- Vrai ? : à corriger
  - Correction du 15 oct. (hebdomadaire) : tient. Une capture par séance passée de la semaine, à l'ouverture, si la semaine n'en a pas (`snapshots.js:347-389`).
  - Données capturées — Aide : « A ponctuel, A cumulatif, C cumulatif, P cumulatif, pattern, niveau RàI » / Code : A cumulatif, C, P ; « plus de ponctuel » (#224) ; pattern et RàI valent « Non calculé », leur calcul est désactivé (`snapshots.js:509`, `:516-538`, `:540-549`).
  - Graphique du groupe — Aide : « Graphique GROUPE (Aperçu) : Indices mixtes… A ponctuel… C ponctuel… P cumulatif » / Code : la carte « Développement du groupe, semaine par semaine » du Suivi du groupe trace une courbe par étudiant·e, toutes cumulatives (`index.html:7578-7609` ; `graphiques-progression.js:1365-1381` ; infobulle `tdb-dev-groupe`, « Chaque ligne représente un·e étudiant·e »). Les moyennes de groupe capturées ne sont lues que par Labo › Études (`correlations-longitudinales.js:140-143`).
  - Unité — Aide : « 24h présentes / 26h offertes » / Code : A se compte en périodes (`indices.js:183-188`).
  - Vocabulaire — Aide : « l'état des indices de ses élèves » (`index.html:12119`) : « étudiant·es ».
  - Chemin : le bloc « Captures de progression » est dans l'accordéon « Captures et recherche » de Réglages › Données (`index.html:9625-9631`) ; la carte saute ce niveau. À voir à l'écran si c'est gênant.
  - Exemple de la « séance fantôme » : le geste « suppression de cette séance » dans la saisie des présences n'a pas été trouvé dans le code ; à voir à l'écran.
- Sert ? :
  - Redite d'écran : « Le système recalcule toutes les captures depuis le début du trimestre » répète « Recalcule toutes les captures depuis le début » (`index.html:9669`) ; la reconstruction est expliquée trois fois (liste, procédure en 4 étapes, encadré « Avantages ») (~90 mots en double).
  - Principe : les deux « Justification pédagogique » (~45 mots) et « Avantages des captures » (~35 mots).
  - Exemple fictif long (~45 mots), qui porte un prénom.
  - Prescription : « tu dois reconstruire les captures ».
- Verdict proposé : corriger et resserrer (~457 mots → ~150)
- Motif : garder ce que la capture enregistre, où se voient les deux graphiques et le geste « Recalculer les captures » ; retirer les justifications, l'exemple et les répétitions.
- Nom de personne à vérifier : `index.html:12164`.
- Tests qui l'épinglent : `tests/unit/sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js` (exige « une fois par semaine », présent une seule fois dans l'Aide, ici) ; `tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js` (exige « Recalculer les captures » dans l'Aide, une seule occurrence, ici).

### collaboration — « 7. Collaboration entre collègues » (index.html:12179-12360, 909 mots)
- Vrai ? : à corriger
  - Correction du 15 oct. (.lcz signé) : tient (`partage-export.js:7-12`, `:188-195`).
  - Ressources — Aide : quatre (grilles, échelles, productions, cartouches) / Code : cinq, les pratiques de notation aussi (`partage-export.js:7-8`, `:44-50` ; `pratiques-gestion.js:367`). Le bouton est dans le menu ⋮ de chaque bibliothèque (`index.html:9595`).
  - Import — Aide : « Importe les fichiers (boutons d'import dans chaque section) » / Code : une seule zone de dépôt, Réglages › Données › « Partage entre collègues » (`index.html:9586-9601`) ; l'item arrive dans « Partagés par des collègues », non modifiable, et se « Duplique vers mes documents » avant d'être adapté (`partage-section.js:9-16`).
  - Auteur — Aide : « Ton nom (enseignant du groupe-cours actif) » / Code : l'identité vient de Cadre › Trimestre › Enseignant·e, « pas du groupe-cours actif » (`cc-license.js:101-112`, `:335-337`).
  - Chaîne d'attribution — Aide : « Auteur original : préservé à jamais », « Contributeurs : liste complète », exemple où « le fichier créditera les trois personnes » / Code : chaîne « minimale v1 : un seul maillon », la chaîne multi-niveaux renvoyée à un lot ultérieur (`partage-format.js:296-299`) ; un item importé n'a pas de `metadata_cc` (`partage-format.js:303-311`) ; la duplication retire `metadata_cc` et fait de toi l'auteur, en gardant `inspireDe` (`partage-section.js:31-34`).
  - Conseil — Aide : « entre ton nom lors de l'export » / Code : « Exporter pour partager » ne demande aucun nom, il l'affiche (« attribué à : … », `partage-export.js:277-279`) ; seul « Exporter ma config » a un champ « Ton nom » (`cc-license.js:879`).
  - Import .txt — Aide : noms de critères qui « doivent correspondre exactement » / Code : comparaison sans casse, sans accents ni ponctuation, puis par inclusion (`cartouches.js:2180-2210`).
  - Non dit depuis 1.207 : une grille dont un critère est « à compléter » est refusée à l'export .lcz (`partage-export.js:362-392`).
- Sert ? :
  - Ce qui relève d'un geste (~200 mots, à réécrire) : exporter (menu ⋮ › « Exporter pour partager »), importer (Réglages › Données), dupliquer pour adapter, importer des commentaires en .txt, « Exporter ma config ».
  - Ce qui relève du principe ou du scénario (~600 mots) : intro (~25), « Scénarios de collaboration », quatre scénarios en puces (~95), explication de la licence CC (~60), « Système automatique d'attribution » et « Règle simple » (~200), exemple à trois personnes (~50), conseil (~35), vie privée (~30).
  - Répétition : la même phrase sur le nom du fichier .lcz est écrite quatre fois (~45 mots × 4, `index.html:12196`, `:12202`, `:12208`, `:12214`).
  - Doublon : l'entrée `export-import` (« Ouverture et partage de tes données », `index.html:13903-13950`) et la carte d'écran « Partage entre collègues » (`index.html:9592-9595`).
- Verdict proposé : corriger et resserrer (~909 mots → ~220)
- Motif : la moitié de la carte décrit un mécanisme d'attribution que le code ne fait pas ; le geste tient en cinq lignes.
- Nom de personne à vérifier : `index.html:12346-12349` (trois noms propres, dont celui du propriétaire). L'exemple parle aussi d'« un ensemble d'objectifs », qui n'est pas une ressource partageable.
- Tests qui l'épinglent : `tests/unit/sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js` (exige « Ressources partageables (.lcz signé) ») ; `tests/unit/sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js` (chaque mention du nom de famille du propriétaire doit être précédée d'« Exemple » ou être bibliographique ; retirer l'exemple laisse le test vert, deux mentions bibliographiques restent) ; `tests/unit/sentinelle-audit-aide-lot-D-ne-promet-pas-l-inexistant.test.js` (négatif : pas de « YYYY-MM-DD »).

### rai-absences — « 8. Interventions RàI avec absences motivées » (index.html:12363-12542, 682 mots)
- Vrai ? : à corriger
  - Report automatique — Aide : « Dès que tu marques l'intervention comme complétée, le système transfère automatiquement les données » / Code : le report n'a lieu que si la case « Reporter les présences dans la saisie des présences… », décochée par défaut, est cochée dans la question de complétion (`interventions.js:117-119`, `:1648-1653`, `:1695-1697`, `:1725-1740`). Décision de Grégoire du 28 sept.
  - Propagation — Aide : « Si tu modifies l'intervention (ajouter/retirer des étudiant·es), les changements se propagent automatiquement aux présences » / Écran : « Le report se fait une seule fois : il ne se refait pas si tu modifies l'intervention ensuite » (`interventions.js:119` ; `:1654-1656`).
  - Durée — Aide : « 2 heures enregistrées » (six fois) / Code : la « Durée (périodes) » du formulaire, 2 par défaut, de 0,5 à 4 (`interventions.js:1044-1048`, `:1545` ; `indices.js:270-274`).
  - Absences motivées — Aide : niveau 2 = absences motivées pour les non-participant·es / Code : seulement si le contexte est « Séance de rattrapage — les non-participants ont congé » ; avec « Petit groupe ciblé pendant le cours régulier », aucune entrée pour les non-participant·es (`interventions.js:1024-1028`, `:1551-1558`, `:1812-1817`).
  - Niveau 3 — Aide : « L'assiduité augmente (heures supplémentaires) » / Code : la présence à une intervention compense une absence au cours et plafonne aux périodes de la séance (`indices.js:278-287`) ; elle ne compte que si la date est une séance du cours déjà saisie (`indices.js:173-178`, `:220-229`). L'effet complet sur A est à voir à l'écran.
  - Formulaire — Aide : « Type : Groupe (niveau 2) ou Individuel (niveau 3) », « Cliquer sur « Planifier l'intervention » », « Marquer comme complétée » / Écran : « Niveau RàI : » avec « Niveau 2 (Groupe ciblé) » et « Niveau 3 (Individuel) », « Contexte de l'intervention », « Durée (périodes) », statut « En préparation / Complétée », boutons « Créer l'intervention » et « Marquer complétée » (`interventions.js:112`, `:121-122`, `:1010-1072`, `:1738`).
  - Vocabulaire — Aide : « Niveau 2 (Préventif…) », « Niveau 3 (Intensif…) » / Écran : « Groupe ciblé », « Individuel » (déjà relevé le 15 oct.).
  - Unité : « 2h (vert) », « 0h (ambre) » : la saisie compte des périodes ; la couleur ambre est juste (`styles.css:3353-3358`).
- Sert ? :
  - Ce qui relève d'un geste (~155 mots, faux en partie) : étapes 1 et 2, vérification dans Saisie des présences.
  - Ce qui relève du principe ou du mécanisme (~470 mots) : « Contexte pédagogique » (~50), « Objectif du système » (~25), « Distinction entre niveaux 2 et 3 » (~135) puis « Étape 3 » (~105), qui répète les mêmes listes presque mot pour mot, « Résultat » avec un exemple (~45), « Important » (~65).
  - Doublon : l'étape 1 répète l'entrée `planifier-rai` (`index.html:13292-13327`), à jour sur le formulaire ; la popup `interventions-planification` et l'infobulle `interv-gestion-absences` disent le reste.
  - « Temps estimé : 5-10 minutes par intervention » : aucune source (voir temps-estimes).
- Verdict proposé : corriger et resserrer (~682 mots → ~150), ou fusionner avec planifier-rai
- Motif : le mécanisme décrit (report automatique, 2 h fixes, propagation) n'est plus celui du code, et il touche l'assiduité des étudiant·es ; ce qui reste à dire tient en un paragraphe : la case de report, ce qu'elle écrit selon le contexte, et qu'elle ne joue qu'une fois.
- Tests qui l'épinglent : aucun

### tirage-sort — « Utiliser le tirage au sort » (index.html:12545-12579, 136 mots)
- Vrai ? : à corriger
  - Outils — Aide : « 2 cartes disponibles » / Écran : trois outils dans une barre latérale, « Questions flash », « Tirage au sort », « Équipes » (`index.html:8194-8208`) (#1039). L'outil « Équipes » n'est décrit nulle part dans l'Aide.
  - Réglages — Aide : configuration en quatre étapes, puis « Ouvre la modal de réglages » / Code : nombre (1 à 5), remise, exclusions, badge « tiré » et « Réinitialiser » sont tous dans la même fenêtre « Paramètres du tirage », ouverte par l'engrenage (`boite-outils.js:355-415`). Le contenu est exact ; la découpe ne l'est pas.
  - « modal » : anglicisme (« fenêtre », ou le titre « Paramètres du tirage »).
- Sert ? : redite des infobulles `outil-tirage`, `outil-tirage-nombre`, `outil-tirage-remise`, `outil-tirage-exclusion` (`accompagnement-contenu-hover.js:841-851`), qui disent déjà le nombre, la remise et les exclusions (~70 mots en double).
- Verdict proposé : corriger et resserrer (~136 mots → ~70)
- Motif : une phrase par outil d'Animation, Équipes compris, suffit ; les réglages sont dans les infobulles.
- Tests qui l'épinglent : aucun

### modelisation — « Modéliser en projection » (index.html:12580-12612, 150 mots)
- Vrai ? : à corriger
  - Fichiers — Aide : « tu ouvres un PDF local » / Code : « + Ouvrir » accepte PDF, JPG, PNG et HEIC, et garde plusieurs fichiers qu'on parcourt (`modelisation.js:79-92`, `:253`).
  - Palette — Aide : « identique à celle des Travaux » / Code : la même palette sans les codes d'erreurs (`modelisation.js:362-368`, `afficherCodes: false`) ; « Travaux » n'est plus un nom d'écran (Évaluation › Annoter et évaluer).
  - Navigation (Labo › Modélisation), zoom et persistance : exacts (`config.js:87` ; `modelisation.js:94-96`, `:231-238`).
- Sert ? : « Usage prévu » (~15 mots) répète la phrase d'intro ; la liste « Fonctionnalités » nomme ce que la barre d'outils montre.
- Verdict proposé : corriger et resserrer (~150 mots → ~80)
- Motif : deux précisions factuelles, et l'intro dit déjà l'usage.
- Tests qui l'épinglent : `tests/unit/sentinelle-audit-aide-lot-D-ne-promet-pas-l-inexistant.test.js` (l'id `accordeon-aide-modelisation` doit exister ; pas « en développement »).

### jetons-reprise — « Utiliser les jetons de reprise » (index.html:12613-12658, 261 mots)
- Vrai ? : à corriger
  - Reprise ciblée — Aide : « Trois types : délai, reprise et reprise ciblée » et badge « Reprise ciblée » / Code : aucun geste n'applique plus une reprise ciblée depuis le retrait de sa case le 29 août (`evaluation-sauvegarde.js:790-795` ; `travaux-annotation.js:1199-1203` ; aucune écriture de `jetonRepriseCibleeApplique`). Le badge ne paraît que sur des évaluations anciennes (#563).
  - Appliquer un jeton — Aide : « Évaluation → Liste des évaluations », « Choisis Jeton de reprise dans les options d'action » / Code : le menu « Actions » de la liste n'a pas cette option (`liste-evaluations.js`, `genererDropdownActions` : Évaluer, Annoter, Consulter, Journal, Dossier PDF, Modifier, Renommer, Transférer, Associer, Supprimer…). Le jeton se coche dans Annoter et évaluer, « Appliquer un jeton : » (`index.html:8622-8626` ; `evaluation-sauvegarde.js:782-789`), dans les Propriétés d'une copie (« Cette copie est une reprise : appliquer un jeton de reprise… », `liste-evaluations.js:1819-1822`) ou à l'import.
  - Original — Aide : « L'original est gardé » (étape 5, sans condition) / Code : selon le réglage « Garder l'original » ou « Supprimer » (`index.html:6142-6147` ; `evaluation-jetons.js:643`) ; l'encadré de la même carte le dit.
  - Couleurs — Aide : « Reprise ciblée (rose) » / Code : mêmes couleurs que la reprise, violet (`styles.css:10908-10913`, variables `--jetons-reprise-*`, `styles.css:215-217`). Le badge « Délai » (orange, `liste-evaluations.js:1391-1393`) n'est pas cité.
  - Import avec reprise et bouton « Appliquer comme jeton de reprise » : exacts (`travaux-ui.js:1943`, `:2049`, `:4316`).
- Sert ? :
  - Redite d'écran : « Les jetons sont des ressources limitées que chaque étudiant·e peut utiliser pour adapter son parcours » répète `index.html:6070` (~20 mots).
  - Principe : « Approche stratégique » (~50 mots, « Brûler ses jetons pour des délais n'est pas une stratégie efficace. L'étudiant·e doit… ») présente une position pédagogique comme la règle de l'application.
  - Doublon : `gerer-jetons` ; glossaire « Jetons », « Jetons de délai », « Jetons de reprise », « Jetons de reprise ciblée » (`index.html:13800-13810`) ; infobulles `cn-pratique-jetons`, `eval-jeton-reprise`.
- Verdict proposé : corriger et resserrer (~261 mots → ~170, en absorbant gerer-jetons)
- Motif : devenir l'entrée unique « Utiliser les jetons » : où on les règle, où on les applique (délai et reprise), ce que montrent les badges.
- Tests qui l'épinglent : aucun

### temps-estimes — « Temps estimés par activité » (index.html:12659-12696, 32 mots)
- Vrai ? : à voir à l'écran
  - Source des durées (2-5 min, 15-30 min, 1-2 min, 3-5 min, total 5-15 min) : rien dans le code ni dans les documents du dépôt ne les appuie. Les seules autres occurrences sont dans l'Aide elle-même (`index.html:11564`, `:11570` dans `flux-travail` ; `:11861` dans `evaluer-productions` ; `:12540` dans `rai-absences`). L'historique du dépôt commence au 4 octobre 2026 (e1a5b0b) et ne dit pas d'où viennent ces chiffres.
  - L'application mesure ces durées : Labo › « Rythme de travail » affiche les « Durées d'évaluation par activité d'apprentissage – mesurées par le chronomètre et les évaluations enregistrées » (`index.html:9058`).
- Sert ? : « Gestion jetons 1-2 min » et « Vérification hebdomadaire 3-5 min » renvoient à deux entrées que ce lot propose de fondre ou de couper ; le tableau répète `flux-travail`.
- Verdict proposé : couper
- Motif : des chiffres sans appui ne devraient pas s'afficher comme une donnée de l'application, alors qu'un écran mesure le temps réel.
- Tests qui l'épinglent : aucun

---

## Trouvé en chemin, hors des entrées (disposition proposée : inscrire, sauf mention)

1. Le message affiché quand on choisit « Non recevable » dit « Cette évaluation sera exclue des calculs de moyenne » (`evaluation-sauvegarde.js:614-619`). En sommative, elle vaut 0 dans la note (décision du 15 oct.) ; seule la moyenne de la liste l'écarte. Ce sont des mots que l'enseignant·e lit.
2. Le nom du fichier .lcz porte « CC-BY-SA » (`cc-license.js:1565`), alors que la licence est « CC BY-NC-SA 4.0 » (`partage-schemas.js:45`). La mention « NC » manque dans le nom.
3. « Exporter ma config » est annoncé « ZIP léger » à l'écran et dans l'infobulle (`index.html:9488` ; `accompagnement-contenu-hover.js:197`) ; il télécharge un .json et un LISEZMOI.txt (`import-export.js:4048-4087`). Sur ce point, l'Aide (« le .json de « Exporter ma config » ») dit juste.
4. La pratique propose encore « Reprise ciblée » (`index.html:6155-6168`), la liste la filtre (`index.html:8358`), l'infobulle `cn-pratique-jetons` l'annonce, mais aucun geste ne l'applique (#563).
5. L'infobulle `eval-jetons` donne « Reprise (vert) ou Reprise ciblée (violet) » (`accompagnement-contenu-hover.js:372-373`) ; les deux sont violettes.
6. Le champ « Séance concernée » d'une intervention de rattrapage n'a pas de lecteur : `obtenirAbsencesMotiveesParDate` n'est appelée nulle part, et les absences motivées s'écrivent à la date de l'intervention (`interventions.js:1838`, `:1905-1944`). À voir à l'écran.
7. Le glossaire « Jetons de délai » annonce « par défaut : 7 jours » (`index.html:13804`) ; le code et l'écran disent 2 (`evaluation-jetons.js:146` ; `index.html:6114`). Relève du lot du glossaire.
8. Le formulaire d'intervention écrit « Les élèves non sélectionnés pour cette séance de rattrapage… » (`interventions.js:1080-1081`), où la règle des mots demande « étudiant·es ».
9. Infobulles de navigation : `nav-labo-modelisation` parle de « démonstrations interactives et modélisations visuelles » (`accompagnement-contenu-hover.js:788-789`), pas de l'annotation d'un document projeté ; `nav-suivi-animation` oublie Équipes (`:790-791`).
10. Commentaire seulement : `moyenneA` est commenté « A ponctuel », mais calculé comme moyenne des A cumulatifs (`snapshots.js:554`, `:606`). Disposition : commenter dans le code.

---

## Bilan du lot

| Verdict | Entrées |
|---|---|
| corriger et resserrer | 7 (irrecevables, snapshots, collaboration, rai-absences, tirage-sort, modelisation, jetons-reprise) |
| fusionner | 1 (gerer-jetons dans jetons-reprise) |
| couper | 2 (verification-hebdo, temps-estimes) |
| garder tel quel | 0 |

Mots actuels : 3 347. Mots visés : ~1 090 (irrecevables ~250, snapshots ~150, collaboration ~220, rai-absences ~150, tirage-sort ~70, modelisation ~80, jetons-reprise ~170 ; trois entrées à 0).

Les trois constats qui comptent le plus :
1. **L'entrée sur les interventions RàI décrit un report de présences qui n'existe plus.** Elle annonce un transfert automatique de 2 h, propagé à chaque modification. Le code ne reporte que sur une case décochée par défaut, une seule fois, selon la durée en périodes, et ne motive les absences que pour une séance de rattrapage. Ce mécanisme touche l'assiduité des étudiant·es.
2. **Quatre affirmations décrivent des choses retirées du code** : l'indice d'assiduité « alternatif » et l'onglet Aperçu (Vérification hebdomadaire) ; le graphique de groupe « à indices mixtes » et la capture du pattern et du niveau RàI (Captures) ; le jeton de reprise ciblée, que plus aucun geste n'applique. S'y ajoute un seuil de P donné à 60 % quand l'écran filtre à 65 %.
3. **Les trois corrections du 15 octobre tiennent** : non recevable non remise dans C et à 0 en sommative, captures hebdomadaires, partage en .lcz. Mais leurs voisines les contredisent ou les débordent : le bloc « NON REMIS » dit P « exclu » alors que l'hybride compte 0, le message d'écran dit « exclue des calculs de moyenne », et la carte Collaboration oublie les pratiques, situe mal l'import et promet une chaîne d'attribution que le code ne fait pas. Les durées de « Temps estimés » n'ont aucun appui dans le dépôt.
