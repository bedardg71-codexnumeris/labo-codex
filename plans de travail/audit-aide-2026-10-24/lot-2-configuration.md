# Lot 2 : Aide › Configuration initiale (1ʳᵉ utilisation)

*Audit en lecture seule, 24 oct. 2026, sur le commit 35745bd (1.216.2). Sous-section `aide-configuration`, index.html:10586-11313, 19 entrées. Les nombres de mots sont ceux de l'inventaire.*

## Les quatre questions propres au lot

**1. Ce qui subsiste de l'assistant en étapes.** L'interface est retirée depuis le 19 oct. (d018354 ; index.html:4169-4176, 4255-4256). Il reste dans le code :
- `js/materiel-assistant.js`, gardé sous son nom : ses fonctions pures `calculs` et `construire` servent à la création depuis l'étiquetage (en-tête, l. 1-27) ;
- la constante `NOMS_ETAPES`, avec les huit noms d'étapes (l. 42-45), dont une seule est encore lue : `materiel-dissection-lecture.js:976-979` réécrit le seul message qui nomme « l'étape « Ce que contient ton tableau » » (`materiel-assistant.js:152`) ;
- une branche morte, `construireCartouche` (`materiel-assistant.js:233, 297, 373-375`) : elle ne s'exécute que si `nature` vaut `'retroactions'`, alors que l'étiquetage ne pose jamais que `'descripteurs'` (`materiel-dissection-lecture.js:914`).

**L'Aide ne décrit plus l'assistant.** « Apporter une grille que tu as déjà » décrit l'étiquetage, et un banc interdit le mot « dissection » (tests/unit/sentinelle-aide-apporter-mon-materiel.test.js:126-138). Ce que l'Aide ne suit pas, ce sont les ajouts faits **après** la forme du 19 oct. : coller sa liste de codes (1.214), le barème qui reçoit les niveaux d'une grille en points (1.214), et « Revenir à ma dissection » (1.210). Le détail est à l'entrée `apporter-grille`.

**2. Numérotation et ordre.** La numérotation ne suit pas l'écran.

| Aide (ordre et numéro) | Écran |
|---|---|
| 1. Cours | Cadre › Trimestre, 2ᵉ étape de la barre de convergence (« Cours et services ») |
| 2. Section Trimestre | 1ʳᵉ étape (« Trimestre ») |
| 2c. Groupe-cours (aucun 2a ni 2b) | 6ᵉ et dernière étape : celle qui assemble les cinq autres |
| 3. Groupe | 4ᵉ étape |
| 4. Horaire | 5ᵉ étape ; l'horaire exige un « Groupe associé » (index.html:7235) |
| aucune entrée | 3ᵉ étape, Enseignant·e |
| 5. Pratique | Conception, 7ᵉ onglet ; une pratique Standards exige une échelle (js/wizard-pratique-v2.js:2484) |
| six entrées sans numéro (Productions… Cartouches) | Conception, onglets 1 et 3 à 6 |
| 5b. Grille de dépistage | Labo › Outils d'observation |
| 5c. Critères algorithmiques | Conception › Grilles de critères, séparée de « Créer une grille » par cinq entrées |

L'ordre de l'écran vient de la barre de convergence (index.html:6219-6255) et de la configuration de la navigation (js/config.js:39-67).

**Recommandation : retirer les numéros, titrer chaque entrée du nom de son écran et suivre l'ordre des onglets.** L'ordre serait le suivant : Cadre (Trimestre, Cours, Enseignant·e, Groupe, Horaire, Groupe-cours), puis Conception (Apporter mon matériel, Productions, Grilles avec barème et critère algorithmique, Échelles, Cartouches, Pratiques), puis Labo (grille de dépistage), puis Clore, puis Préférences.

Motif : les numéros actuels sont des vestiges (2c sans 2a, 5b et 5c détachés de leur écran), et l'ordre des onglets est celui que l'enseignant·e voit. Les dépendances entre gestes tiennent en une phrase de l'entrée d'ensemble : une cartouche demande une grille et une échelle ; une pratique Standards demande une échelle.

Deux bancs fixent l'ordre et un titre :
- critere-algorithmique-mots.test.js épingle le titre « 5c. Les critères algorithmiques » ;
- bareme-2-pieces-d-aide.test.js:248 exige que « barème » vienne après `apporter-grille`. Les deux bancs coupent aussi au commentaire `<!-- Carte: Créer une échelle de performance -->`.

**3. Doublons entre « Étapes », « Prendre en main », « Checklist » (et « Trimestre »).** La suite des six étapes du cadre est écrite trois fois :
- une liste dans `etapes-config` (index.html:10602-10609) ;
- la même liste dans `trimestre` (« Workflow recommandé », 10722-10730) ;
- des cases à cocher dans `checklist` (11222-11227).

`trimestre` y ajoute la liste des six accordéons (10697-10707), et `groupe-cours` une quatrième version (« Workflow typique », 10778-10784). L'écran montre déjà ces six étapes, leur ordre et leur état, cochés (js/trimestre-v2.js:549-607). En tout, environ 720 mots sur sept entrées décrivent un seul écran. `prise-en-main` recoupe peu ces entrées : il renvoie à « Étapes de configuration » ; son doublon est `accordeon-aide-demo` (Formation).

**4. Clos, archivé, Faire revenir.** La carte « Qu'est-ce que clore un trimestre ? » respecte le vocabulaire : « clos », « Clore », « Rouvrir », aucun « archivé ». Un banc y interdit tout mot en « archiv » (sentinelle-1002-mots-clos.test.js:120).

Elle décrit mal deux choses :
- **où se trouve « Clore »** : dans le menu ⋮ d'une carte de la Bibliothèque des trimestres ;
- **qui peut l'être** : jamais le trimestre actif. Il faut donc d'abord activer un autre trimestre.

**L'archive hors du navigateur n'est décrite nulle part dans l'Aide :** « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… », « Faire revenir », « Terminer le renvoi ». « Faire revenir » compte 0 occurrence dans index.html:9977-14126. Le détail est à l'entrée `archivage`.

---

### etapes-config — « Étapes de configuration » (index.html:10591-10630, 111 mots)
- Vrai ? : à corriger
  - Aide : « La configuration se fait principalement dans Cadre → Trimestre qui centralise toutes les étapes » / Code : seules les six étapes du cadre y sont (index.html:6219-6255). Productions, grilles, échelles, cartouches et pratiques sont dans Conception (js/config.js:39-62), et la grille de dépistage dans Labo › Outils d'observation (index.html:8833).
  - Aide : « Groupe : Importer la liste d'étudiant·es (CSV/TXT) » / Code : l'écran offre aussi « Coller les données » ; le fichier est « CSV/TSV » (index.html:7142, 7152). Mineur.
  - L'ordre des six étapes est celui de la barre de convergence : exact.
- Sert ? :
  - La liste des six étapes (63 mots) est reprise dans `trimestre` et `checklist`, et la barre de convergence l'affiche.
  - L'astuce qui renvoie à la carte suivante (20 mots) n'est que de la navigation interne.
  - « Workflow » est un anglicisme.
- Verdict proposé : fusionner avec trimestre et checklist (trois entrées, 345 mots → une entrée d'environ 150 mots)
- Motif : trois entrées décrivent le même écran et la même suite de gestes, que l'écran coche déjà.
- Tests qui l'épinglent : aucun

### prise-en-main — « Prendre en main l'application » (index.html:10631-10661, 144 mots)
- Vrai ? : exact
  - Aide : « Assistance … Active les info-bulles et l'aide contextuelle » / Code : la carte dit « Info-bulles, aide à l'écran et visite guidée », et la case pilote aussi la visite et les flèches (js/accueil.js:263-264, 361-375). Écart de portée seulement.
  - `preferences` contredit cette carte : elle place les info-bulles dans Réglages › Préférences, où elles ne sont pas.
- Sert ? : le bloc « Données démo » (environ 30 mots) double `accordeon-aide-demo` (Formation), plus complet, et le popup `accueil-donnees-demo`.
- Verdict proposé : resserrer (~144 → ~80 mots)
- Motif : une phrase par outil suffit ; le détail de la démo est dans « Explorer la démonstration ».
- Tests qui l'épinglent : tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js:115-131 (« Données démo », « Assistance », « Visite guidée » doivent rester dans la carte)

### cours — « 1. Configurer le cours » (index.html:10662-10686, 73 mots)
- Vrai ? : à corriger
  - Aide : « Heures/semaine : Ex. 4 heures » / Code : le champ s'appelle « Heures d'enseignement » et vaut pour tout le cours (« Total d'heures d'enseignement (RREC) », exemple « 60 », index.html:6569-6571).
  - Aide : « Titre » / Code : « Nom du cours » (index.html:6546).
  - Aide : « Horaire : tes séances de la semaine (de 1 à 5)… » et l'Astuce sur les périodes / Code : l'horaire n'est pas dans l'accordéon « Cours et services » (index.html:6478) mais dans « Horaire » (7188-7293). Ces deux lignes, posées le 15 oct. (c263041), reprennent le popup `contexte-horaire` (js/accompagnement-contenu-popup.js:809).
  - Manquent « Nature » (cours ou service) et « Discipline », obligatoire (index.html:6530, 6578).
- Sert ? : les trois exemples sont les textes indicatifs (placeholders) de l'écran (index.html:6543, 6547, 6565) : redite d'environ 15 mots.
- Verdict proposé : resserrer et corriger (~73 → ~45 mots ; les deux lignes d'horaire vont dans `horaire`)
- Motif : la carte décrit un formulaire que l'écran étiquette déjà, et l'information propre (les périodes) est dans la mauvaise carte.
- Tests qui l'épinglent : aucun

### trimestre — « 2. Section Trimestre - Configuration centralisée » (index.html:10687-10738, 182 mots)
- Vrai ? : à corriger
  - Aide : « Gestion des trimestres », « Gestion des cours », « Groupe d'étudiants », « Horaire hebdomadaire », « Assemblage groupe-cours » / Code : « Trimestre », « Cours et services », « Groupe d'étudiant·es », « Horaire », « Groupe-cours » (index.html:6261, 6478, 7006, 7191, 7299).
  - Aide : « Horaire hebdomadaire : Séances avec jour, heures, local » / Code : chaque séance porte aussi son nombre de périodes, exigé (js/trimestre-v2-horaires.js:1132-1175).
  - Aide : « Synthèses intelligentes […] dans sa barre latérale : "Hiver 2026 • 15 sem., 31 jours cours, 10 congés" […] "4/5 éléments" » / Code : le panneau du trimestre écrit « N semaines • N jours de cours » (index.html:6286-6290), celui du groupe-cours « N/5 éléments configurés » (js/trimestre-v2-cours.js:1136). La barre de convergence montre « Actif », « N cours », le nom, « N étud. », « N hor. », « N GC » (js/trimestre-v2.js:556-580).
- Sert ? :
  - « Synthèses intelligentes » (48 mots) décrit ce que l'écran affiche.
  - « Workflow recommandé » (33 mots) double `etapes-config`.
  - L'Astuce (20 mots) redit « Le groupe-cours actif apparaît dans l'en-tête de l'application » (index.html:7339).
  - La liste des six accordéons (46 mots) double la barre de convergence.
  - « Multi-profils avec dropdown » est du jargon.
- Verdict proposé : fusionner avec etapes-config et checklist
- Motif : presque tout le texte redit l'écran ou une autre entrée ; l'entrée fusionnée garderait la définition du cadre et l'ordre des étapes.
- Tests qui l'épinglent : aucun

### groupe-cours — « 2c. Le concept Groupe-cours » (index.html:10739-10788, 183 mots)
- Vrai ? : à corriger
  - Aide : « Les 5 composantes : Cours, Enseignant·e, Groupe étudiants (La liste des étudiant·es), Horaire, Pratique de notation » / Code : l'écran dit « 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e. La pratique de notation est facultative. » (index.html:7306 ; formulaire 7383-7424). Le trimestre manque, la pratique est comptée parmi les cinq, et le groupe est un numéro, pas une liste.
  - Aide : « avec les 5 dropdowns », « Clique "Créer groupe-cours" » / Code : six menus, et le bouton s'appelle « Créer le groupe-cours » (index.html:7383-7424, 7442).
  - Aide : « Un·e enseignant·e peut avoir plusieurs groupes-cours actifs » / Code : un seul est actif, avec le badge « Actif » (js/trimestre-v2-groupes-cours.js:1002, 1026-1027).
  - La bibliothèque offre aussi « Afficher » et « Masquer » (js/trimestre-v2-groupes-cours.js:1036, 1045). Mineur.
- Sert ? :
  - « Workflow typique » (30 mots) redit l'état vide de l'écran (index.html:7350-7358).
  - « Bibliothèque groupe-cours » (33 mots) décrit des boutons visibles.
  - « modal » et « dropdown » sont du jargon.
  - Ce qui sert : la définition, le cloisonnement par trimestre et le menu de l'en-tête.
- Verdict proposé : resserrer et corriger (~183 → ~70 mots)
- Motif : l'erreur porte sur la définition même du groupe-cours, et la moitié du texte redit l'écran.
- Tests qui l'épinglent : aucun

### groupe — « 3. Créer le groupe » (index.html:10789-10815, 73 mots)
- Vrai ? : à corriger
  - Aide : « l'élève est inscrit à une mesure d'aide » / la règle demande « étudiant·e » (libellé de l'écran : « Mesure d'aide », index.html:7113).
  - Aide : « La colonne s'appelait « CAF » ; les fichiers qui portent l'ancien en-tête restent lisibles. » : c'est de l'historique, et « CAF » dans un texte affiché.
  - Aide : « Options d'import : Saisie manuelle, Import depuis fichier CSV » / Code : l'écran offre aussi « Coller les données » (Excel, Omnivox) et accepte CSV/TSV (index.html:7142-7157).
  - Manquent « Groupe », « Programme » et « Date d'arrivée » (index.html:7097-7122). Le chemin dit « Groupe d'étudiants » au lieu de « Groupe d'étudiant·es » (7006).
- Sert ? : la carte double `accordeon-aide-etudiants` (Utilisation, index.html:11579-11613), plus complète : trois façons d'ajouter, colonnes du fichier, actions. Seule la ligne « Mesure d'aide » lui est propre (environ 15 mots).
- Verdict proposé : fusionner avec etudiants (y porter la ligne « Mesure d'aide », sans l'historique)
- Motif : deux cartes décrivent le même accordéon, et celle-ci est la moins juste.
- Tests qui l'épinglent : aucun

### horaire — « 4. Établir l'horaire » (index.html:10816-10835, 63 mots)
- Vrai ? : à corriger
  - Aide : « Gestion automatique des reprises : Ex: "Horaire du lundi" se déplace au jeudi si lundi est congé » / Code : la reprise n'est pas automatique. Elle se déclare dans « Journées sans cours », avec « Horaire de reprise » et « Date de reprise » (index.html:6426-6441), puis le calendrier l'applique.
  - Manquent le « Groupe associé », obligatoire (index.html:7235), et le nombre de périodes de chaque séance, exigé (js/trimestre-v2-horaires.js:1146-1150). Ces deux informations sont dans la carte `cours`.
- Sert ? : « Gestion automatique des reprises » et « Adaptation aux congés » disent la même chose (environ 30 mots, une phrase suffirait). La carte double en partie le popup `contexte-horaire`.
- Verdict proposé : corriger (~63 → ~55 mots, en y ramenant les périodes depuis `cours`)
- Motif : la donnée qui compte pour l'assiduité est dans une autre carte, et la reprise est présentée comme automatique.
- Tests qui l'épinglent : aucun pour la carte (le mot « 2×2h » est interdit dans toute l'Aide : sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js:276-279)

### pratique — « 5. Choisir ta pratique de notation » (index.html:10836-10878, 322 mots)
- Vrai ? : exact
  - Familles et libellés conformes (js/wizard-pratique-v2.js:51-56).
  - Sélection des traces : l'écran offre quatre modes, dont « Hybride » (js/wizard-pratique-v2.js:659-664), l'Aide en nomme trois. Mineur.
  - Non dit : une pratique Standards exige une échelle avant de s'adopter (js/wizard-pratique-v2.js:2484). C'est utile pour l'ordre des gestes.
- Sert ? :
  - La première phrase de chaque famille (environ 60 mots) reprend presque mot pour mot `accordeon-aide-pan` (index.html:10246-10249).
  - « Sur les reprises » (79 mots) résume une recherche et ne mène à aucun geste.
  - Les « À régler » (environ 110 mots) sont la partie propre à la carte.
- Verdict proposé : resserrer (~322 → ~170 mots)
- Motif : garder ce qui se règle dans l'assistant, renvoyer aux définitions de l'Introduction ; si « Sur les reprises » est gardé, sa place est dans `pan`.
- Tests qui l'épinglent : aucun

### creer-productions — « Créer et configurer les productions » (index.html:10879-10923, 185 mots)
- Vrai ? : à corriger
  - Aide : « Clique sur Nouvelle production dans la sidebar » / Code : « + Nouvelle production » est en haut à droite de la zone principale (index.html:4689-4691). La barre latérale porte « Consulter la bibliothèque », le tri et la liste (4620-4645).
  - Aide : « le type parmi 11 options » / Code : 12 (index.html:4738-4756).
  - Aide : « Rédige une description de l'activité » / Code : le champ s'appelle « Activité d'apprentissage » et il est recommandé (index.html:4760-4764). La description de la tâche est un bloc de consignes.
  - Manquent la case « Travail diagnostique — ne compte dans aucun calcul » (4810-4816), « Préparer le PDF » (4826), « + Nouveau champ » (4886) et « Échéances par groupe » (4912).
- Sert ? :
  - « Layout : 2 colonnes — sidebar… » (environ 10 mots) est du jargon et redit l'écran.
  - « ⚠️ Important » (21 mots) redit l'étape 5 de la même carte, le statut de l'écran (« Pondération correcte », « … manquant », js/productions.js:2805-2813) et le popup `conception-productions`.
  - « Autres options » (42 mots) décrit des boutons visibles.
- Verdict proposé : resserrer et corriger (~185 → ~100 mots)
- Motif : deux libellés et un nombre sont faux, et le texte manque la seule case qui change un calcul (« Travail diagnostique »).
- Tests qui l'épinglent : aucun

### creer-grilles — « Créer une grille de critères » (index.html:10924-10963, 132 mots)
- Vrai ? : à corriger
  - Aide : « Coche les pratiques compatibles (sommative, PAN, etc.) » / Code : ces cases sont retirées depuis le 3 sept. (index.html:5083 ; tests/unit/sentinelle-pratiques-compatibles-retirees.test.js). La rangée porte « Nom de la grille », « Type de la grille » et « Description (optionnel) » (index.html:5088-5110).
  - Aide : « Analytique (niveaux détaillés) » / Code : la bulle dit « analytique (tu attribues des points, que son barème décrit) » (js/accompagnement-contenu-hover.js:262).
  - Aide : « Le total […] doit atteindre 100 %. Le système valide automatiquement ce total et t'alerte en cas d'écart. » / Code : une grille dont tous les critères sont analytiques compte des points et ne se mesure pas à 100 (js/grilles.js:1239-1247, 5508-5513). Sinon, le total change seulement de couleur, sans alerte (5517-5523).
  - Aide : « Aperçu PDF : […] combinant ta grille avec une échelle de performance et une cartouche optionnelle » / Code : Grilles de critères n'a pas de bouton PDF.
    - Le formulaire `#formulairePreparationPDF` (index.html:5029) n'a aucun appelant : seules sa définition et son exposition existent (js/export-pdf.js:2974, 3970).
    - La zone d'aperçu que cherche js/export-pdf.js:1400 n'existe pas dans index.html.
    - Le PDF se prépare depuis la fiche de production (index.html:4826), et une grille dont tous les critères ont un barème n'exige plus d'échelle (Nouvelles 1.212, js/changelog-data.js:95).
  - Manquent les sous-critères d'un critère holistique ou analytique, modifiables depuis la 1.211 (js/changelog-data.js:106), et un renvoi au barème.
- Sert ? :
  - « Layout » (environ 10 mots) est du jargon.
  - La phrase d'ouverture redit la note de l'écran (index.html:4965).
  - Le popup `construction-grilles` porte le même défaut sur le total de 100 % (js/accompagnement-contenu-popup.js:186).
- Verdict proposé : corriger (~132 → ~120 mots)
- Motif : la carte décrit un formulaire d'avant le 3 sept. et un aperçu PDF qui n'est plus à cet endroit.
- Tests qui l'épinglent : aucun

### apporter-grille — « Apporter une grille que tu as déjà » (index.html:10964-11006, 613 mots)
- Vrai ? : à corriger (deux points, le reste est exact)
  - Aide : « Ta grille se range dans Grilles de critères ; ses niveaux, s'il y en a, dans Échelles de performance. » / Code : depuis la 1.214, une grille en points qui nomme ses niveaux se crée avec un barème. Chaque niveau devient une tranche, sans échelle (b677b6d ; js/changelog-data.js:65 ; js/materiel-assistant.js:23-26). L'échelle ne naît que pour une grille notée par niveaux.
  - Aide : « Les rétroactions et les consignes de travaux viendront plus tard », avec une liste de six étiquettes / Code : la palette a aussi un groupe « Les codes » (Code, Nom du code, Poids, Commentaire, js/materiel-dissection-lecture.js:63-66). Une liste de codes collée s'ajoute, par « Ajouter ces codes », à un critère algorithmique qui n'en a pas (js/materiel-dissection.js:1046-1186 ; Nouvelles 1.214, js/changelog-data.js:63). L'Aide n'en dit rien.
  - Non dits : « Revenir à ma dissection » (1.210, js/materiel.js:110) ; Titre, Description, Section, Total, Suite (js/materiel-dissection-lecture.js:51-68). L'écran explique ces derniers.
  - L'ancienne forme (l'assistant en étapes) n'est pas décrite : exact.
- Sert ? :
  - Les étapes 1 et 2 de la liste numérotée (environ 60 mots) reprennent l'accueil et les consignes de l'écran (index.html:4188-4190, 4213-4215).
  - « Chaque étiquette s'enregistre… » (33 mots) double le popup `conception-materiel` (js/accompagnement-contenu-popup.js:162).
  - « L'outil est en développement » redit le bandeau (index.html:4181).
  - Le paragraphe « Des points et des niveaux… » (73 mots), « Couper » / « Rattacher » et les manques de l'outil servent.
- Verdict proposé : resserrer et corriger (~613 → ~420 mots)
- Motif : la carte est juste sur l'étiquetage mais en retard sur deux livraisons, et elle redit l'écran sur environ 100 mots.
- Tests qui l'épinglent :
  - tests/unit/sentinelle-aide-apporter-mon-materiel.test.js exige exactement six `li` dans `#aide-apporter-grille-etiquettes`, mot pour mot avec le lexique, interdit le mot « dissection » et coupe au commentaire « Carte: Créer une échelle de performance ».
  - tests/integration/materiel-aide-accompagnement.spec.js:104 compte six `li`.
  - tests/unit/bareme-2-pieces-d-aide.test.js:248 veut cette carte avant le barème.
  - Conséquence : les étiquettes des codes vont **hors** de la liste des six.

### bareme — « Le barème d'un critère analytique » (index.html:11007-11036, 195 mots)
- Vrai ? : exact
  - Le barème sous le critère (js/grilles.js:4737), sans effet sur aucun calcul (4912), et la conversion à la première modification (4905-4907) sont conformes.
- Sert ? :
  - F2, le tableau et F4 (environ 150 mots) disent ce que dit l'aide « i » `grille-bareme` (js/accompagnement-contenu-popup.js:1147-1166), qui ajoute un exemple.
  - F5 (environ 40 mots) vise les grilles apportées avant le 20 oct. : c'est de l'historique, à date de péremption.
- Verdict proposé : garder
- Motif : textes validés par Grégoire le 20 oct. et épinglés par deux bancs ; F5 pourra partir quand ce stock n'existera plus, à son jugement.
- Tests qui l'épinglent : tests/unit/bareme-2-pieces-d-aide.test.js (F2, F4, F5 et le tableau, mot pour mot) ; tests/integration/bareme-2-aide.spec.js

### creer-echelles — « Créer une échelle de performance » (index.html:11037-11079, 123 mots)
- Vrai ? : à corriger
  - Aide, pour chaque niveau : « Nom », « Code lettre », « Seuil (%) — le pourcentage minimum », « Couleur » / Code : « Code* », « Nom du niveau* », « Min (%)* », « Max (%)* », « Valeur ponctuelle* », « Couleur », et « Palier SOLO du niveau (facultatif) » quand l'observation SOLO est active (js/echelles.js:1738-1871). La valeur ponctuelle, obligatoire, manque.
  - Manquent les repères « Suffisant à partir de » et « Maîtrisé à partir de » (js/echelles.js:2539-2542).
  - Aide : « Une barre horizontale colorée se met à jour… » : à voir à l'écran (`#apercuEchelleNiveaux`, index.html:5264).
  - Aide : « niveaux de réussite utilisés pour évaluer les productions » / Code : depuis le barème, l'échelle sert les critères holistiques (tableau de la carte `bareme`, index.html:11022).
- Sert ? : « Exemple IDME » (environ 25 mots) redit la note de l'écran (index.html:5165-5169) et double `accordeon-aide-idme`. « Layout » est du jargon.
- Verdict proposé : resserrer et corriger (~123 → ~80 mots)
- Motif : le champ obligatoire qui fait la note (valeur ponctuelle) manque, et l'exemple redit l'écran.
- Tests qui l'épinglent : aucun sur son texte. Le commentaire qui la précède sert de borne à deux bancs (voir `apporter-grille`), et deux specs vérifient qu'elle reste fermée.

### creer-cartouches — « Créer une cartouche de rétroaction » (index.html:11080-11110, 109 mots)
- Vrai ? : à corriger
  - Aide : « Aperçu aléatoire : Teste le rendu de la rétroaction avec un profil simulé » / Code : la fonction n'existe pas. « aléatoire » n'apparaît dans aucun module de cartouche ou de rétroaction (js/cartouches*.js, evaluation-retroaction.js, synthese-retroaction-*.js), ni dans index.html hors de l'Aide.
  - Aide : « Ajoute un contexte optionnel (description ou consigne) », en étape 3 / Code : il y a deux champs, « Contexte de la rétroaction générale » et « … spécifique », placés sous la matrice (index.html:5459-5471), et un menu « Consignes du travail » (5423).
  - Aide : « Lie une grille + une échelle » / Code : pour une grille analytique, le champ devient « Paliers (bornes en %) » (js/cartouches.js:3340-3346, 3384-3388).
  - Manquent « Exporter en PDF », « Exporter en texte », « Télécharger un modèle » (index.html:5358-5366) et « Importer depuis un fichier texte (.txt / .md) » (5476).
- Sert ? : « environ 50 à 75 mots recommandés » double le popup `construction-cartouches` (js/accompagnement-contenu-popup.js:231), et c'est une prescription. « ✅ Résultat » (24 mots) sert.
- Verdict proposé : corriger (~109 → ~100 mots)
- Motif : l'un des deux « outils » nommés n'existe pas, et les quatre gestes d'import et d'export manquent.
- Tests qui l'épinglent : aucun

### grille-depistage — « 5b. Configurer la grille de critères pour le dépistage » (index.html:11111-11175, 303 mots)
- Vrai ? : à corriger
  - Aide : « Cliquer sur «Enregistrer les réglages» » / Code : le bouton est retiré (28 sept., lot E3) ; le choix s'écrit dès qu'on le change (index.html:8763-8770 ; tests/unit/sentinelle-lot-e3-reglages.test.js:129-141).
  - Aide : « Cliquer sur «➕ Créer une nouvelle grille» » et « Enregistrer la grille » / Code : le bouton est « + Nouvelle grille » (index.html:5019) ; une grille neuve se crée par « Créer la grille », puis s'enregistre toute seule (5009-5012).
  - Aide : « Vérifier que la pondération totale = 100 % » / Code : ne vaut pas pour une grille en points (voir `creer-grilles`).
  - Aide : « Tu dois utiliser cette même grille pour toutes tes évaluations. » / Code : le dépistage rapproche chaque critère d'une évaluation de la grille de référence par son nom, à égalité ou par préfixe, sans accents ni casse (js/profil-etudiant-calculs.js:867-880). Une autre grille aux mêmes noms de critères est donc lue. La phrase est fausse et prescriptive (« Tu dois »).
  - Aide : « Le dépistage lit les niveaux que tu enregistres pour chaque critère » / Code : il lit les points d'abord, le niveau sinon (js/profil-etudiant-calculs.js:887-889).
  - Aide : « maîtrisés (≥70 %) et les défis (<70 %) » / Code : c'est le « Seuil de défi spécifique », réglable de 60 à 80, 70 par défaut (index.html:8897-8905 ; js/profil-etudiant-calculs.js:1278-1281).
  - Aide : « Les critères avec pondération élevée sont priorisés dans les recommandations » / Code : la pondération ne départage que deux critères de même score, à un point près (js/profil-etudiant-calculs.js:1331-1344).
  - Non dit : un critère réglé « Aucun » (complexité SOLO) n'est pas surveillé quand l'observation SOLO est active (js/profil-etudiant-helpers.js:915-927). `accordeon-aide-criteres` le dit.
- Sert ? :
  - « Étape 1 » (62 mots) redit `creer-grilles`.
  - « Pourquoi configurer… » (50 mots) et « Exemples de grilles par discipline » (34 mots) doublent `accordeon-aide-criteres`.
  - « Comment le système utilise la grille » (48 mots) double les cartes de Consultation.
  - L'écran dit déjà : « Cette grille définit les critères utilisés pour identifier les forces et défis des étudiant·es. » (index.html:8842).
- Verdict proposé : resserrer et corriger (~303 → ~130 mots)
- Motif : sept affirmations sont fausses ou dépassées, dont une règle présentée comme obligatoire, et la moitié du texte double d'autres cartes.
- Tests qui l'épinglent : aucun sur la carte. Dans toute l'Aide, « analyse tes rétroactions » est interdit (sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js:297).

### sous-criteres — « 5c. Les critères algorithmiques » (index.html:11176-11212, 508 mots)
- Vrai ? : exact
  - Textes D1 à D8, validés le 21 oct., conformes au code. Depuis :
  - Un critère algorithmique neuf naît sans noms. Évalué sans eux, l'étudiant·e lit « éléments relevés » et « éléments examinés » (js/evaluation-enonces.js:202-230). D3 ne dit que le cas d'un critère antérieur (« erreur », « mot »).
  - « Partir de la liste du français écrit » pose aussi « erreur » et « mot » (js/grilles.js:5657-5664 ; Nouvelles 1.215). D5 ne le dit pas.
  - Trois livraisons ne sont pas dites :
    - le miroir (1.214) ;
    - la palette de blocs (1.216), qui a son invitation à l'écran (js/grilles.js:3758-3759) ;
    - les codes d'une grille à deux critères algorithmiques, qui vont tous au premier (1.214). L'écran le dit (js/grilles.js:3852-3856).
  - Vocabulaire à trancher : ici, « sous-critère » est une catégorie de ce que tu comptes. Dans `apporter-grille`, « Élément observable : […] On dit aussi sous-critère » (index.html:10981). Le même mot porte deux sens dans la même sous-section ; c'est une question didactique, pour Grégoire.
- Sert ? : texte dense, sans redite notable. Les exemples chiffrés (D4b, D7) servent le geste. « 5c. » est un numéro vestige.
- Verdict proposé : garder (avec, au besoin, une phrase sur les noms de repli)
- Motif : le texte est validé et épinglé depuis trois jours ; les manques sont dits à l'écran, sauf le repli des noms, qui touche ce que lit l'étudiant·e.
- Tests qui l'épinglent : tests/unit/critere-algorithmique-mots.test.js:105-114 (D1 à D8 mot pour mot, exactement trois `li`, le titre avec « 5c. ») ; tests/integration/critere-algorithmique-mots.spec.js

### checklist — « Checklist de configuration » (index.html:11213-11233, 52 mots)
- Vrai ? : à corriger
  - Aide : « Pratiques PAN paramétrées » / Code : la pratique est facultative au groupe-cours (index.html:7306, 7421), et l'Aide dit ailleurs que « l'application ne prescrit aucune pratique » (10251). Cette case présente les PAN comme la norme.
  - Aide : « Horaire défini (si disponible) » / Code : l'horaire est obligatoire pour un cours, facultatif pour un service (index.html:7405).
  - Manquent le groupe-cours, le geste qui assemble, et les productions. « définie comme référence » ne sert qu'au dépistage.
- Sert ? : la carte redit `etapes-config`, et la barre de convergence coche déjà chaque étape (index.html:6219-6255 ; js/trimestre-v2.js:584-606).
- Verdict proposé : fusionner avec etapes-config (ou couper)
- Motif : liste incomplète et orientée PAN de ce que l'écran coche déjà.
- Tests qui l'épinglent : aucun

### archivage — « Qu'est-ce que clore un trimestre ? » (index.html:11234-11277, 145 mots)
- Vrai ? : à corriger
  - Aide : « Cadre → Trimestre → Gestion des trimestres […] Clique sur Clore à côté du trimestre souhaité » / Code : « Clore » est dans le menu ⋮ d'une carte de la Bibliothèque des trimestres. On l'ouvre par l'accordéon « Trimestre », bouton « Bibliothèque » (index.html:6261, 6270-6272 ; js/trimestre-v2-liste.js:241). Le geste n'est offert que pour un trimestre qui n'est pas le trimestre actif (js/trimestre-v2-liste.js:239-248 ; js/trimestres.js:691-694 : « Impossible de clore le trimestre actif. Change de trimestre d'abord. »).
  - Conséquence : « tu peux ensuite en commencer un nouveau » et « Quand clore ? […] Tu souhaites commencer un nouveau trimestre » inversent l'ordre du code, où il faut d'abord activer un autre trimestre. Cette première phrase est celle que Grégoire a acceptée le 4 oct., et un banc l'épingle : la reformuler lui revient.
  - Aide : « Le trimestre passe en mode lecture seule (aucune modification possible) » / Code : le bandeau du trimestre clos offre « Permission d'écriture » (index.html:3966-3973 ; js/modes.js:1049), et les imports y écrivent encore (Nouvelles 1.214, js/changelog-data.js:67).
  - Aide : « Une capture des ressources […] est créée » / Code : vrai (js/trimestres.js:700, 723), mais cette copie n'a aucun lecteur (js/trimestres.js:828-831). C'est un mécanisme sans effet visible.
  - Vocabulaire conforme : « Clore », « Rouvrir », « Trimestres clos » (js/trimestre-v2-liste.js:117-121, 153-155, 271), aucun « archivé ».
  - Non dit, ici comme ailleurs dans l'Aide : l'archive hors du navigateur.
    - Le menu d'un trimestre clos offre « Archiver le trimestre… », « Archiver les copies… » et « Renvoyer aux archives… » (js/reserve-trimestre.js:53 ; js/reserve-copies.js:83 ; js/reserve-renvoyer.js:78).
    - Le retour passe par « Faire revenir » et « Terminer le renvoi », dans Réglages › Données › Archives (js/reserve-renvoyer.js:117, 131 ; js/reserve-revenir.js:55).
- Sert ? :
  - Dans « Que se passe-t-il » (43 mots), la ligne sur la capture des ressources est de la mécanique interne.
  - « Important » (19 mots) redit la fenêtre de confirmation (« Cette action est réversible par le bouton « Rouvrir » », js/trimestre-v2-liste.js:119).
  - « Quand clore ? » (26 mots) sert.
- Verdict proposé : corriger (~145 → ~120 mots, plus deux phrases sur l'archive, ici ou dans `accordeon-aide-codex`)
- Motif : la procédure omet la condition qui bloque le geste, et la différence entre clos et archivé n'est dite nulle part.
- Tests qui l'épinglent : tests/unit/sentinelle-1002-mots-clos.test.js:101-121. Le banc veut la première phrase mot pour mot, aucun mot en « archiv » dans la carte (ligne 120), et une tranche HTML d'au moins 1 500 caractères (ligne 101). Parler de l'archive dans cette carte demande de modifier la ligne 120 ; un resserrement doit rester au-dessus de 1 500 caractères de HTML.

### preferences — « Personnaliser les préférences » (index.html:11278-11322, 158 mots)
- Vrai ? : à corriger
  - Aide, liste des cartes : « Outils de saisie », « Expérience visuelle », « Navigation », « Parcours d'apprentissage » / Code : Expérience visuelle, Navigation, Outils de saisie, Système d'information scolaire, Sécurité (index.html:9336-9461). Aucune carte « Parcours d'apprentissage ».
  - Aide : « Navigation : Lancement direct à l'aperçu, info-bulles au survol, aide contextuelle, mode clair/sombre » / Code : Navigation ne porte que « Ouvrir directement sur le tableau de bord » (index.html:9383-9391). Le thème est dans Expérience visuelle (9366-9377). Les info-bulles et l'aide contextuelle se règlent par « Assistance » (accueil) et par le bouton de l'en-tête (js/accueil.js:260-268, 370-374), pas dans Préférences.
  - Aide : « Mode sombre (par défaut) » / Code : le défaut est le mode clair (js/preferences.js:77 `modeClair: true` ; index.html:9374, « Mode clair » coché).
  - Aide : « Mode clair : activable via la case « Mode clair » dans Navigation » / Code : c'est un bouton radio « Mode clair », sous « Thème », dans Expérience visuelle.
  - Manquent « Informations contextuelles (graphiques) » (9355-9362), le SIS (9414-9437) et Sécurité (9443-9461).
  - « Tout changement s'enregistre automatiquement » : exact (index.html:9327-9328).
- Sert ? : « Options de thème » et « Aide contextuelle » (43 mots) décrivent des réglages absents de l'écran. La note qui renvoie à Labo › Outils d'observation (environ 30 mots) sert.
- Verdict proposé : resserrer et corriger (~158 → ~70 mots)
- Motif : trois des quatre cartes annoncées sont fausses ou n'existent pas, et le défaut du thème est inversé.
- Tests qui l'épinglent : aucun

---

## Trouvé en chemin, hors du lot (à inscrire)
- Le popup `construction-grilles` donne la formule « (nb_erreurs / nb_mots) × 100 » (js/accompagnement-contenu-popup.js:177). Elle n'est aucun des trois modèles du code (js/evaluation-formules.js:93-152).
- Le même popup dit que « la somme des pondérations des critères doit totaliser 100 % » (ligne 186). C'est le défaut de `creer-grilles`.
- Le code de l'ancien assistant laisse une branche morte : `construireCartouche` et `estRetro` (js/materiel-assistant.js:233, 297, 373-375). Elle ne s'exécute jamais depuis l'étiquetage (voir question 1).

## Bilan du lot

| Verdict | Entrées |
|---|---|
| garder | 2 (bareme, sous-criteres) |
| corriger | 4 (horaire, creer-grilles, creer-cartouches, archivage) |
| resserrer (avec ou sans correction) | 9 (prise-en-main, cours, groupe-cours, pratique, creer-productions, apporter-grille, creer-echelles, grille-depistage, preferences) |
| fusionner | 4 (etapes-config, trimestre, checklist en une seule entrée ; groupe dans etudiants) |
| couper | 0 |

Test 1 : 4 entrées exactes, 15 à corriger.

**Mots :** environ 3 670 aujourd'hui, environ 2 450 visés (−33 %). Les entrées validées et épinglées (`bareme`, `sous-criteres`, la liste des six étiquettes) restent à leur longueur.

**Les trois constats qui comptent le plus :**
1. **Cinq cartes décrivent des choses qui n'existent pas ou plus :**
   - « Aperçu aléatoire » des cartouches ;
   - les cases « pratiques compatibles » des grilles ;
   - le bouton « Enregistrer les réglages » du dépistage ;
   - l'aperçu PDF dans Grilles de critères ;
   - dans Préférences, la carte « Parcours d'apprentissage », les info-bulles et le mode sombre « par défaut ».
2. **Le bloc Cadre consacre environ 720 mots, sur sept entrées, à un seul écran qui coche déjà ses six étapes.** Les numéros 1, 2, 2c, 3, 4 ne suivent pas l'ordre de l'écran, Enseignant·e n'a pas d'entrée, et `groupe-cours` se trompe sur les cinq éléments obligatoires. Recommandation : une entrée d'ensemble, sans numéros, dans l'ordre des onglets.
3. **Deux règles de fonctionnement sont mal dites :**
   - le dépistage : « Tu dois utiliser cette même grille » est faux (rapprochement par le nom) et prescriptif ; la pondération et le seuil de 70 % sont présentés comme fixes ;
   - la clôture : le trimestre actif ne peut pas être clos, ce que la procédure omet. Et l'archive hors du navigateur (« Renvoyer aux archives », « Faire revenir ») n'est décrite nulle part dans l'Aide ; un banc empêche de l'ajouter dans la carte « clore » sans le modifier.
