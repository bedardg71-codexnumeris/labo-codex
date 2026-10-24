# Lot 1 — Aide › « Qu'est-ce que Labo Codex ? » (aide-introduction)

Dépôt lu au commit 35745bd (1.216.2). Lecture seule. Plages et décomptes de mots : `inventaire.json`.

Repères qui servent à plusieurs entrées :

- **Observation SOLO, changement du 19-20 oct. (#1117)**. La case « Activer l'observation de la structure des résultats d'apprentissage » (index.html:8801) décide maintenant trois choses. Décochée, le menu « Complexité SOLO du critère » disparaît des grilles (js/grilles.js:3190-3230). Un critère neuf reçoit alors « Aucun » (js/grilles.js:3203-3205), et le dépistage lit **tous** les critères, étiquette ou non (js/profil-etudiant-helpers.js:923-927, 960-964). Autre cas : une grille faite par « Apporter mon matériel » a **tous** ses critères à « Aucun » (js/materiel-assistant.js:309-312). Avec l'observation SOLO cochée, le dépistage saute donc tous ses critères.
- **Guides pédagogiques intégrés**. SOLO, ACP, RàI, sommative et PAN ont chacun un guide dans l'application (js/guides-pedagogiques.js:33-349). Les boutons « Guide » de Labo › Outils d'observation (index.html:8792, 8922, 9019) et de Conception › Pratiques de notation (index.html:5506-5511) les ouvrent. La bannière d'accueil les annonce (js/accueil.js:109). Couper la théorie de l'introduction ne rend pas l'Aide dépendante d'une source externe.

---

### presentation — « Présentation de l'application » (index.html:10014-10075, 702 mots)
- Vrai ? : à corriger
  - « élève(s) » quatre fois — Aide : « les données de tes élèves », « ton regard sur tes élèves », « pour ton élève », « l'accompagnement des élèves ». Règle : « étudiant·e » (index.html:10024, 10026, 10028, 10038).
  - « **Aperçu** : Indicateurs globaux A-C-P » — L'Aperçu n'existe plus comme écran depuis le 27 mai 2026 : sa carte a migré dans Suivi › Suivi du groupe (index.html:911-912 ; js/config.js:68).
  - « **Portraits individuels** » — L'onglet s'appelle « Profils individuels » (js/config.js:70).
  - Exact : la signature est exigée à l'import (« Non signé = rejeté », js/partage-import.js:699-709). Le modèle vide pour une IA existe, pour la cartouche (js/cartouches.js:2366) et pour le questionnaire (js/bilan-reflexif-import-export-texte.js:729). Licence CC BY-NC-SA (js/cc-license.js:17).
- Sert ? :
  - Les §1-2 répètent presque mot pour mot la bannière « À propos » de l'accueil : « écosystème-classe », « aucune intelligence artificielle… ton jugement professionnel est souverain » (js/accueil.js:98-99). Environ 115 mots.
  - Redite interne : après le trait (index.html:10036), les micro-données sont définies une deuxième fois. L'encadré « Autonomie et sobriété » répète « Où vont tes données ? » et le § sur l'IA. Environ 190 mots.
  - Exposé sans geste : « À quoi sert / Qu'est-ce que ça change / Qu'est-ce que ça demande » (~135 mots) et l'encadré « architecture pensée pour l'alignement pédagogique » (~80 mots).
  - « Fonctionnalités principales » (~50 mots) : doublon d'etapes-config et de prise-en-main, et la liste nomme l'Aperçu, qui n'existe plus.
- Verdict proposé : corriger, puis resserrer (~700 mots → ~250 mots)
- Motif : garder ce que l'écran ne dit pas (où vont les données, la signature, l'absence d'IA, le modèle vide pour une IA, le commun) et couper la redite de l'accueil, ainsi que la seconde moitié qui répète la première.
- Tests qui l'épinglent : aucun. La phrase « aucune intelligence artificielle » épinglée par `sentinelle-accueil-porte-ortho-et-champ2-846.test.js` est celle de js/accueil.js.

### monitorage — « Comprendre le suivi de l'apprentissage » (index.html:10076-10118, 203 mots)
- Vrai ? : à corriger
  - « Ton échelle de notation : Échelle qualitative (IDME) ou notes chiffrées (0-100 %) » — Ce n'est pas l'échelle qui porte des points mais le type de grille : holistique, analytique (en points, avec barème) ou algorithmique (js/grilles.js:3126 ; index.html:5097-5101).
  - « Évaluation par compétences (PAN) ou sommative traditionnelle » — L'application a quatre pratiques : Sommative, PAN – Standards, PAN – Spécifications, PAN – Dénotation (js/pratiques/pratique-registre.js:73-78). L'équation « PAN = compétences » contredit la carte pan du même lot.
  - L'exemple met la RàI dans la pratique PAN – Standards — La RàI est une option du Labo, indépendante de la pratique (« Appliquer une adaptation du modèle de la Réponse à l'intervention », index.html:9026-9027).
  - « l'exemple SRPNF fourni : Structure, … Français » — Hors démo, aucune grille SRPNF n'est fournie. La grille semée est la « Grille de départ » : Compréhension, Application, Analyse, Synthèse (js/grilles.js:1670-1680). Celle de la démo écrit « Français écrit » (js/pack-demo-10.js:7004).
- Sert ? : exposé général (« Objectivité, Systématicité, Lecture rapprochée », ~45 mots). La liste des réglages (~55 mots) double presentation et pratique ; l'exemple (~85 mots) double srpnf, idme et rai. Le titre est presque celui de suivi-apprentissage (« Suivi de l'apprentissage et dépistage SOLO »), pour un contenu différent.
- Verdict proposé : couper. Une phrase passerait dans presentation : « Grilles, échelles et pratique sont les tiennes ; SRPNF et IDME sont des exemples » (~25 mots).
- Motif : rien n'y aide à un geste ; ce qui y est vrai est dit ailleurs, et ce qu'elle seule dit est faux.
- Tests qui l'épinglent : aucun

### acp — « Lire les indices A-C-P de tes étudiant·es » (index.html:10119-10148, 120 mots)
- Vrai ? : à corriger
  - C — Aide : « le respect des délais » / Code : C = travaux remis ÷ travaux comptés (non facultatifs, avec au moins une copie qui compte), sans aucune lecture du retard (js/pratiques/pratique-sommative.js:266-325).
  - A — Aide : « Mesure l'engagement cognitif ». C'est une inférence pédagogique, pas un calcul. Code : A = périodes présentes ÷ périodes offertes, sur les seules séances saisies ; A reste inconnue tant qu'aucune séance ne compte (js/indices.js:200-229).
  - P — « Dans une PAN, il porte sur les traces retenues… selon l'échelle et la méthode de sélection » : vrai pour PAN – Standards seulement. Spécifications compose la note par forfaits et Dénotation par jugement (index.html:10248-10249).
- Sert ? : la carte dit ce que chaque indice « mesure » (de la théorie), pas comment il se calcule, alors que c'est ce qui permet de lire un chiffre. Le guide ACP de l'application a déjà les définitions exactes (js/guides-pedagogiques.js:117-138).
- Verdict proposé : corriger, puis resserrer (~120 mots → ~80 mots) — remplacer les trois « mesure… » par les trois définitions de calcul.
- Motif : c'est ici qu'on cherche ce que veut dire un A de 80 %.
- Tests qui l'épinglent : aucun

### rai — « La Réponse à l'Intervention (RàI) » (index.html:10149-10183, 279 mots)
- Vrai ? : à corriger
  - « qui lit tous les critères de la grille de référence sauf ceux marqués « Aucun » » (index.html:10178) — Depuis le 20 oct. (#1117, suite), « Aucun » n'exclut un critère que si l'observation SOLO est activée. Décochée, le dépistage lit tous les critères (js/profil-etudiant-helpers.js:923-927). La même phrase se trouve dans suivi-apprentissage (10332) et, hors de ce lot, aux lignes 13595, 13794 et 13859.
  - « Labo Codex structure ce cycle en trois niveaux » — La carte ne dit pas que la RàI est une option : la case « Appliquer une adaptation du modèle de la Réponse à l'intervention » est cochée par défaut (index.html:9026).
  - « L'objectif n'est pas de classer les étudiant·es » — Le panneau « Détails » du Suivi du groupe range les étudiant·es par urgence (constats Q5-18 et Q5-28 du 15 oct., toujours ouverts). La phrase est à reformuler pour ne pas contredire l'écran.
  - Exact : les trois niveaux et leurs noms (js/profil-etudiant-calculs.js:1854, 1881, 1899), la décision par P et par pattern (1840-1868), l'IPB qui nomme la cible.
  - Trouvé en chemin, dans le code (issue proposée : inscrire et continuer) : les bornes du niveau RàI sont fixes, 64 % et 75 %. Elles portent le nom d'IDME, n'ont aucun réglage à l'écran et ne lisent pas l'échelle de l'utilisateur (js/interpretation-config.js:43-46, lues à js/profil-etudiant-calculs.js:1843-1868). L'Aide ne les donne pas. Faut-il que la RàI suive l'échelle de chacun ? C'est de la didactique : à Grégoire.
  - Hors lot, même sujet : l'infobulle de la case RàI dit « universel, ciblé, intensif » (js/accompagnement-contenu-hover.js:149). La sentinelle du 15 oct. ne la voit pas : son motif est sensible à la casse (`sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js:131`).
- Sert ? : le cycle « dépister, agir, observer, s'ajuster » et l'encadré « L'objectif… » (~115 mots) reprennent le guide RàI (js/guides-pedagogiques.js:163-233). L'encadré « Quelle différence avec le Suivi des fondamentaux ? » (~85 mots) est presque identique à celui de suivi-apprentissage (10330-10333).
- Verdict proposé : corriger, puis resserrer (~280 mots → ~120 mots)
- Motif : garder ce qui décide du niveau (P, pattern, l'option, les bornes si Grégoire veut les dire), renvoyer la théorie au guide RàI, et ne garder l'encadré de différence qu'à un endroit.
- Tests qui l'épinglent : `sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js`. « pattern des derniers artefacts (3 par défaut) » doit rester au moins 3 fois dans l'Aide : 5 aujourd'hui, dont 10178. « nomme la cible de l'intervention » est présent 4 fois, dont 10174. `sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js` : motifs anciens, en négatif seulement.

### solo — « La taxonomie SOLO : évaluer la profondeur de l'apprentissage » (index.html:10184-10231, 205 mots)
- Vrai ? : à corriger
  - « Le seuil critique est M (Maîtrise), correspondant au niveau relationnel et à un indice de performance de 0.75. C'est le niveau qui prédit la réussite dans le cours suivant. » — Trois problèmes :
    - la pratique de Grégoire est présentée comme la règle de l'application, alors que l'application lit « Maîtrisé à partir de » sur l'échelle de chacun (js/echelles.js:2539-2542 ; js/profil-etudiant-calculs.js:303-310) ;
    - « 0.75 » est écrit à l'anglaise (nombres à la française, #1137 : la sentinelle ne balaie que `js/`) ;
    - l'affirmation empirique, déjà relevée le 15 oct., reste sans source.
  - « chaque critère peut être étiqueté avec son niveau SOLO (multistructurel, relationnel ou abstrait étendu) » — Le menu s'appelle « Complexité SOLO du critère ». Il offre aussi « Aucun » et ne paraît que si l'observation SOLO est cochée (js/grilles.js:3213-3224).
  - « Le dépistage surveille les critères multistructurels » — Vrai seulement si l'observation SOLO est activée ; sinon, il surveille tous les critères (js/profil-etudiant-helpers.js:960-964).
  - La carte ne dit pas que SOLO est une option (index.html:8800-8801).
- Sert ? : « Pourquoi SOLO plutôt qu'une note sur 100 ? » (~30 mots) plaide pour une pratique, alors que l'application ne prescrit pas ; le guide SOLO couvre la théorie (js/guides-pedagogiques.js:33-101). Le § IDME (~45 mots) répète la carte idme. Le tableau reste (#810).
- Verdict proposé : fusionner avec idme, en corrigeant (les deux cartes : ~315 mots → ~150 mots)
- Motif : une seule carte « SOLO et l'échelle de départ (IDME) », qui dit ce que l'application en fait (l'option, le menu, le dépistage) et laisse la théorie au guide.
- Tests qui l'épinglent : aucun directement

### pan — « Les pratiques alternatives de notation (PAN) » (index.html:10232-10270, 408 mots)
- Vrai ? : exact pour l'essentiel, deux écarts
  - « Les trois dernières sont des PAN » — Le guide PAN de l'application dit le contraire pour la dénotation : « une PRÉN » ; le badge PAN y est « un raccourci d'interface » (js/guides-pedagogiques.js:309, 328-330 ; js/pratiques/pratique-registre.js:69-71).
  - « ce niveau se lit **aujourd'hui** à travers les artefacts retenus » — « aujourd'hui » annonce un changement (#810, construire la note sur les cibles). L'Aide ne devrait pas promettre.
- Sert ? :
  - « Quatre familles » (~135 mots) : doublon presque mot pour mot de configuration › pratique (index.html:10836-10878), qui ajoute « À régler ».
  - « Six paramètres » (~140 mots) : ce sont les six groupes de rangées de Labo › Exploration des pratiques (js/pratiques/construction-attributs.js:50-57 ; js/comparateur-pratiques.js:368-379). La carte ne le dit pas, et le comparateur n'est nommé nulle part dans l'Aide (trou relevé le 15 oct., encore ouvert). C'est le seul passage de l'introduction qui servirait un geste.
  - Introduction (~100 mots) : deux phrases suffiraient.
- Verdict proposé : resserrer (~410 mots → ~150 mots)
- Motif : couper les familles, déjà dans pratique, et garder les six paramètres en les rattachant à l'écran qui les affiche.
- Tests qui l'épinglent : aucun. `sentinelle-803-aide-pan-famille-pas-mecanique.test.js` épingle l'entrée PAN du glossaire (index.html:13833), pas cette carte.

### suivi-apprentissage — « Suivi de l'apprentissage et dépistage SOLO » (index.html:10271-10337, 427 mots)
- Vrai ? : à corriger
  - « L'IPB compte combien d'artefacts consécutifs récents sont sous le **seuil de maîtrise** configurable » — Code : sous le seuil de défi spécifique (`defiSpecifique`, js/profil-etudiant-calculs.js:1155, 1183). Le « seuil de maîtrise » est un autre réglage, celui de l'échelle.
  - « Labo → Outils d'observation → **Seuil de défi** » — Le libellé est « Seuil de défi spécifique », dans « Paramètres d'analyse » de la carte Taxonomie SOLO (index.html:8851, 8897).
  - Le préalable manque : le suivi lit la grille choisie dans « Grille de critères pour le dépistage » (index.html:8834). Sans cette grille, rien ne s'affiche (js/profil-etudiant-calculs.js:1141-1142).
  - Les changements du 19-20 oct. (#1117) ne sont pas reportés : observation SOLO décochée, le suivi lit tous les critères. Une grille d'« Apporter mon matériel », elle, est tout entière à « Aucun » : observation SOLO cochée, le suivi des fondations reste vide tant qu'on n'étiquette pas ses critères (voir les repères en tête).
  - « sauf ceux marqués « Aucun » » (10332) : voir rai.
  - Exact : le tableau IPB × direction, dont les 8 lignes reprennent js/profil-etudiant-calculs.js:1230-1255 ; la fenêtre de 3 par défaut (index.html:8863).
- Sert ? :
  - « Pourquoi les critères multistructurels ? » et « Transférable à toute discipline » (~80 mots) : de l'exposé. « La taxonomie SOLO montre que les habiletés de base (organiser, être rigoureux, s'exprimer correctement) sont prérequises » donne trois critères de SRPNF (Structure, Rigueur, Français) pour un fait de la taxonomie : la pratique de Grégoire devient une loi. « devrait observer le même phénomène » est une conjecture.
  - « Quelle différence avec le modèle RàI ? » (~85 mots) : doublon de rai.
  - « Plateau n'est pas un verdict négatif » (~35 mots) : doublon de l'aide contextuelle (js/accompagnement-contenu-popup.js:745).
  - « Comment configurer » : l'écran dit déjà ce que font la fenêtre et le seuil (index.html:8867, 8903) ; il suffit de garder les chemins. La direction ↗ ou ↘ dépend de « Progression des artefacts » (10 points, index.html:8873-8879), que la carte ne nomme pas : une ligne utile à ajouter.
- Verdict proposé : corriger, puis resserrer (~430 mots → ~220 mots)
- Motif : c'est la carte qui explique un calcul affiché : elle doit suivre le réglage SOLO, nommer le bon seuil, et perdre l'exposé et les doublons.
- Tests qui l'épinglent : `sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js` : « (70 % par défaut) », seule occurrence dans l'Aide (index.html:10300). `sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js` : une des 5 occurrences de « pattern des derniers artefacts (3 par défaut) ».

### criteres — « Tes critères d'évaluation : le socle du dépistage » (index.html:10338-10363, 244 mots)
- Vrai ? : à corriger
  - « Par défaut, tous les critères sont considérés multistructurels » — Faux depuis le 19 oct. dans deux cas : quand l'observation SOLO est décochée, un critère neuf reçoit « Aucun » (js/grilles.js:3203-3205) ; une grille d'« Apporter mon matériel » est toujours à « Aucun » (js/materiel-assistant.js:309-312). La phrase ne vaut que pour un critère créé à la main, observation SOLO cochée.
  - « Les critères que tu choisis doivent rester les mêmes pendant tout le trimestre » — C'est prescriptif (« doivent », « Règle essentielle »), et la carte ne nomme pas le mécanisme réel : le dépistage lit la grille de référence (index.html:8834) et apparie les critères des évaluations par leur nom (js/profil-etudiant-calculs.js:1066-1069).
  - « tag » — À l'écran : « Complexité SOLO du critère » (js/grilles.js:3217).
- Sert ? : le § ELLAC (~45 mots) répète l'entrée SRPNF du glossaire (index.html:13875). « Adapte les critères à ta discipline » (~40 mots) répète monitorage, srpnf et grille-depistage. Le seul contenu propre (la constance des critères, l'étiquette SOLO) irait mieux dans configuration › grille-depistage (index.html:11111-11175), qui dit déjà « Tu dois utiliser cette même grille ».
- Verdict proposé : fusionner avec grille-depistage (~244 mots → ~60 mots ajoutés là-bas)
- Motif : la règle n'a de sens qu'avec le réglage de la grille de référence, et c'est là qu'on le fait.
- Tests qui l'épinglent : aucun

### srpnf — « Utiliser la grille SRPNF (PAN – Standards) » (index.html:10364-10418, 92 mots)
- Vrai ? : à corriger
  - Le tableau ne correspond à aucune grille de l'application — Aide : « Conception 15 %, Rigueur 20 %, Plausibilité 10 %, Nuance 25 %, Français 30 % ». La grille de la démo : Structure 20, Rigueur 20, Plausibilité 15, Nuance 25, Français écrit 20 (js/pack-demo-10.js:6968-7010). « Conception » pour le S de SRPNF contredit monitorage et le glossaire, qui disent « Structure ».
  - Le titre « Utiliser la grille SRPNF » suppose une grille disponible. Hors démo, elle n'est pas fournie : la grille semée est la « Grille de départ » (js/grilles.js:1670), et les gabarits n'en ont pas (js/gabarits-utils.js:173-225).
- Sert ? : l'entrée SRPNF du glossaire dit l'essentiel, avec le cadrage « et non une structure du logiciel » (index.html:13875).
- Verdict proposé : couper
- Motif : un exemple chiffré qui ne correspond à rien de ce qu'on voit dans l'application, et déjà défini au glossaire.
- Tests qui l'épinglent : `sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js` (« adaptable à ton contexte »). L'occurrence d'idme (10426) suffit si la carte fusionnée la garde.

### idme — « Appliquer l'échelle IDME » (index.html:10419-10474, 109 mots)
- Vrai ? : exact
  - Bornes et correspondances SOLO identiques à l'« Échelle de départ (IDME) » semée (js/echelles.js:79-119, 376). La carte ne lui donne pas son nom d'écran.
- Sert ? : la colonne « Compréhension » (~20 mots) répète la colonne SOLO. À sa place, la valeur ponctuelle de chaque niveau (32 / 69,5 / 79,5 / 92,5, js/echelles.js:87-117) aiderait à lire une note : c'est elle qui fait la note en sommative, et l'Aide ne l'énonce nulle part (constat Q5-01 du 15 oct.).
- Verdict proposé : fusionner avec solo (voir solo)
- Motif : la carte décrit l'échelle semée ; elle aiderait à lire une note si elle donnait les valeurs ponctuelles.
- Tests qui l'épinglent : `sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js` : « Autres échelles possibles », seule occurrence (10467) ; « adaptable à ton contexte » (10426). Les deux sont à garder dans la carte fusionnée.

### ssot — « Une donnée, une seule source » (index.html:10475-10490, 93 mots)
- Vrai ? : à corriger
  - « affichée à l'Aperçu » — L'Aperçu est devenu Suivi › Suivi du groupe (index.html:911-912 ; js/config.js:68).
  - « calculées aux Évaluations » — La pratique active calcule C et P à partir des évaluations (js/pratiques/pratique-sommative.js:74, 329 ; js/indices.js:16). L'onglet s'appelle « Évaluation » (constat A.2 du 10 sept.).
  - « Tu ne vois jamais deux chiffres contradictoires » — Trop fort sur deux points :
    - le code admet des indices en cache en retard jusqu'au prochain calcul (js/indices.js:20-26) ;
    - la moyenne de la liste des évaluations écarte une copie plagiée que P, en sommative, compte à 0 (js/liste-evaluations.js:596-597 ; js/pratiques/pratique-sommative.js:86-104).
- Sert ? : doublon de référence › architecture (« Une donnée, une seule source (rappel) », index.html:13482-13520), qui nomme aussi l'« Aperçu ». C'est un principe d'architecture ; il n'aide à aucun geste, sauf la phrase « tu modifies une donnée à sa source ».
- Verdict proposé : couper (et corriger « Aperçu » et « Évaluations » dans architecture, qui reste)
- Motif : la même carte existe deux fois, et sa promesse centrale n'est pas tenue à la lettre.
- Tests qui l'épinglent : aucun

### modes — « Choisir ton mode d'utilisation » (index.html:10491-10533, 157 mots)
- Vrai ? : à corriger
  - « Le sélecteur de mode se trouve dans l'en-tête de l'application, à droite du groupe-cours actif » — Code : c'est un bouton-icône (un masque, infobulle « Mode normal / anonymisé ») dans les utilitaires de la première ligne de l'en-tête (index.html:3889). Le sélecteur de groupe-cours est sur la deuxième ligne (index.html:3907-3911). Sur téléphone : menu ⋯ › « Anonymisation » (index.html:3933-3936). Position exacte : à voir à l'écran. formation › modes-formation porte la même phrase.
  - « Masque toutes les informations nominatives (noms, DA) » — Les noms deviennent « Élève N » et les groupes « Gr. A » (js/modes.js:331, 844-845) ; le DA est masqué sauf si « Afficher DA réels » est coché (index.html:4004-4005).
  - « Aide contextuelle : Info-bulles et repères » — L'interrupteur s'appelle « Assistance » (index.html:3895 ; js/accueil.js:263).
- Sert ? : doublon de formation › modes-formation (index.html:11323-11356), plus précise (« Élève 1 », « Gr. A », notes masquées). Le bloc « Outils d'accompagnement » (~45 mots) double configuration › prise-en-main, qui donne les libellés exacts.
- Verdict proposé : fusionner avec modes-formation (et corriger l'emplacement du bouton dans la carte qui reste)
- Motif : trois cartes disent la même chose ; une suffit.
- Tests qui l'épinglent : aucun

### partage — « Partager tes ressources pédagogiques » (index.html:10534-10590, 224 mots)
- Vrai ? : à corriger
  - « Nommage des fichiers export : `type-nom-cours-discipline-date.json` », « Ex: echelle-IDME-601101-litterature-2026-01-09.json » — Code : un fichier .lcz, avec la licence et l'heure : `type-nom-cours-discipline-CC-BY-SA-AAAA-MM-JJ-HHhMM.lcz` (js/partage-export.js:189-195 ; js/cc-license.js:1556-1569). La carte collaboration le dit déjà correctement.
  - « Productions : Définitions d'artefacts avec échéances » — L'échéance est retirée du paquet partagé (`champsInterdits: ['coursId', 'dateEcheance']`, js/partage-schemas.js:560 ; js/partage-format.js:47).
  - « Import depuis un trimestre précédent » annonce trois mécanismes différents (« Section… », « Dropdown… », « Filtre par cours… ») — Code : la même section « Importer depuis un autre trimestre » se trouve dans les cinq bibliothèques, cartouches et pratiques comprises (js/grilles.js:2329 ; js/echelles.js:1127 ; js/cartouches.js:4071 ; js/productions-bibliotheque-ui.js:204 ; js/pratiques-gestion.js:435). « Dropdown » est un anglicisme.
  - Exact : les cinq types partageables (js/partage-export.js:44-50), la licence CC BY-NC-SA 4.0 (js/cc-license.js:17), aucune donnée confidentielle grâce aux schémas fermés (js/partage-format.js:46-47).
  - Trouvé en chemin, dans le code (issue proposée : inscrire et continuer) : le nom de fichier porte « CC-BY-SA » alors que la licence est BY-NC-SA (js/cc-license.js:1565, contre :17).
- Sert ? : doublon d'utilisation › collaboration (index.html:12179-12362 : types, .lcz, licence, protection des données) et de l'aide contextuelle « Importer depuis un autre trimestre » (js/accompagnement-contenu-popup.js:1786-1800, « Importer crée une copie »). Le § « communs éducatifs » (~35 mots) est de l'exposé.
- Verdict proposé : corriger, puis resserrer (~225 mots → ~70 mots)
- Motif : garder dans l'introduction ce qui rassure (fichier signé, licence, rien de confidentiel) et renvoyer le mode d'emploi à collaboration.
- Tests qui l'épinglent : aucun

---

## Bilan du lot

**Verdicts, 13 entrées.**

| Verdict | Nombre | Entrées |
|---|---|---|
| Corriger, puis resserrer | 5 | presentation, acp, rai, suivi-apprentissage, partage |
| Resserrer | 1 | pan |
| Fusionner | 4 | solo avec idme ; criteres dans grille-depistage ; modes dans modes-formation |
| Couper | 3 | monitorage, srpnf, ssot |
| Garder tel quel | 0 | — |

Au test 1, une entrée est exacte (idme), une l'est pour l'essentiel (pan) et 11 sont à corriger.

**Mots.** 3 263 aujourd'hui, environ 1 100 visés :

| Entrée | Mots visés |
|---|---|
| presentation | 250 |
| acp | 80 |
| rai | 120 |
| solo et idme fusionnées | 150 |
| pan | 150 |
| suivi-apprentissage | 220 |
| partage | 70 |
| reprise de monitorage dans presentation | ~25 |
| reprise de criteres dans grille-depistage | ~60 |

Soit environ deux tiers de moins.

**Les trois constats qui comptent le plus.**

1. **Le changement SOLO du 19-20 oct. (#1117) n'a pas atteint l'Aide.** Quatre cartes (solo, suivi-apprentissage, criteres, rai) disent encore que tout critère non étiqueté est surveillé et que « Aucun » exclut toujours. C'est faux quand l'observation SOLO est décochée, et faux pour toute grille venue d'« Apporter mon matériel ». La même phrase « sauf ceux marqués « Aucun » » se trouve aussi trois fois hors de ce lot (13595, 13794, 13859). La sentinelle du 15 oct. a été mise à jour pour le code, pas pour le texte.
2. **La pratique de Grégoire est présentée comme une loi, à trois endroits :**
   - « Le seuil critique est M… 0.75… prédit la réussite dans le cours suivant » (solo) ;
   - « organiser, être rigoureux, s'exprimer correctement », donnés comme prérequis selon SOLO (suivi-apprentissage) ;
   - « doivent rester les mêmes » (criteres).

   Trouvaille liée, dans le code : les bornes du niveau RàI sont fixées à 64 et 75 %, d'après IDME, quelle que soit l'échelle (js/interpretation-config.js:43-46). C'est de la didactique : à Grégoire.
3. **La théorie de l'introduction est déjà dans l'application,** dans les cinq guides intégrés (SOLO, ACP, RàI, sommative, PAN). La couper ne rend pas l'Aide dépendante d'une source externe. À l'inverse, le seul passage théorique qui servirait un geste n'est pas relié à son écran : les six paramètres de la carte pan sont les rangées de Labo › Exploration des pratiques, et cet écran n'est nommé nulle part dans l'Aide.

**Aucun nom de personne réelle** dans ces 13 entrées.
