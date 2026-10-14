# Convergence entre les lectures A et B

Sources lues : la consigne `interpretation/CONSIGNE-convergence.md`, `lecture/finalite-A.md` (A), `lecture/finalite-B.md` (B) et `lecture/observation.md`. Aucun autre fichier du dépôt, ni code, ni web.

## Conventions

- **Groupes.** *les deux* : même sens dans A et B, même si les mots diffèrent (c'est un accord, rien de plus) ; *A seule* ou *B seule* : une seule lecture le dit ; *contradictoire* : A et B ne peuvent pas avoir raison ensemble.
- **Niveaux** repris de chaque lecture : **O** observé (A compte « lu dans le code » parmi [O] ; B l'écrit **O(c)**), **I** inféré directement, **H** hypothèse, **[?]** inconnu, **—** pas de niveau donné par cette lecture (affirmation absente de cette lecture, ou non étiquetée).
- **Numérotation.** Chaque affirmation a un identifiant `Qn-xx`. Une affirmation qui revient sous plusieurs questions n'est comptée qu'une fois ; ses autres apparitions portent « = Qn-xx ».
- **Appuis** (partie 2). Chaque passage est cité par sa section et son geste, avec sa ligne `l.N` dans `observation.md`, et par la lecture qui le cite (A, B ou A+B). Verdict d'un passage : ✔ soutient ; ◐ soutient en partie ; ✘ ne soutient pas ; ∅ introuvable.
- **Verdict d'une affirmation** : *soutient* quand les passages cités établissent ce que l'affirmation énonce (pour un niveau I, les faits dont l'inférence découle ; l'inférence elle-même est celle de la lecture) ; *soutient en partie* quand une part manque (dite en note) ; *ne soutient pas* quand les passages cités concernent autre chose ; *introuvable* quand aucun passage n'est cité. Un passage cité à tort ne change pas le verdict d'une affirmation que d'autres passages établissent ; il est signalé ✘.
- **Textes à l'écran.** Les phrases entre guillemets sont des sorties du programme ; elles ne sont pas prises pour une description de son but.
- Ont leur appui évalué (consigne, point 4) : les affirmations *dites par les deux*, les *contradictoires* et les formulations de finalité, y compris cinq composantes de finalité propres à une lecture.

## Partie 1. Convergence

### Q1. Ce que le programme reçoit, et qui le lui fournit

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q1-01 | L'enseignant·e saisit le trimestre : bornes de dates, journées sans cours (A ajoute reprises et semaines spéciales). | les deux | O | O |  |
| Q1-02 | L'enseignant·e saisit la fiche de cours : code, discipline, compétence, pondération « 2-2-3 ». | les deux | O | O |  |
| Q1-03 | Le profil de l'enseignant·e est saisi ; prénom, nom, courriel et institution sont requis. | les deux | O | O |  |
| Q1-04 | L'horaire est saisi avec un nombre de périodes par séance, exigé. | les deux | O | O |  |
| Q1-05 | Les groupes-cours sont saisis (trimestre, cours, groupe, horaire, enseignant·e). | B seule | — | O |  |
| Q1-06 | La liste des étudiant·es est collée ou lue d'un CSV (DA, groupe, nom, prénom, programme, SA). | les deux | O | O |  |
| Q1-07 | Un·e étudiant·e s'ajoute fiche par fiche, avec CAF et date d'arrivée. | les deux | O | O |  |
| Q1-08 | Les statuts « inactif » et « décrochage » sont posés par l'enseignant·e. | B seule | — | O |  |
| Q1-09 | Productions, grilles, échelles, cartouches et pratiques de notation sont saisies par l'enseignant·e. | les deux | O | O |  |
| Q1-10 | La carte d'alignement est saisie (nœuds, liens, objectifs, semaines, durées). | A seule | O | — |  |
| Q1-11 | Les présences sont saisies par séance et par étudiant·e, avec des notes libres. | les deux | O | O |  |
| Q1-12 | Des copies sont déposées en fichiers (A nomme PDF, JPEG, PNG, HEIC ; B ajoute WebP). | les deux | O | O | Listes de formats différentes (A en nomme 4, B en nomme 5) ; pas de désaccord. |
| Q1-13 | Chaque fichier est rattaché à un·e étudiant·e d'après le DA, le nom/prénom ou le format « LÉA ». | les deux | O | O | B le dit sous Q4. |
| Q1-14 | Un niveau par critère est choisi par l'enseignant·e à l'évaluation. | les deux | O | O |  |
| Q1-15 | Un statut d'intégrité (« plagiat ») et des notes d'intégrité sont saisis. | les deux | O | O |  |
| Q1-16 | Des jetons de délai et de reprise sont appliqués. | A seule | O | — |  |
| Q1-17 | La rétroaction peut être réécrite à la main. | B seule | — | O |  |
| Q1-18 | Des annotations sont posées sur les copies (traits, tampons, codes d'erreurs). | les deux | O | O |  |
| Q1-19 | Des informations « confidentielles » sont saisies par étudiant·e (parcours, défis, catégories comme « Dyslexie », notes). | les deux | O | O |  |
| Q1-20 | Des notes personnelles pour le rapport de profil (« Mes notes ») sont saisies. | A seule | O | — |  |
| Q1-21 | Interventions et rencontres sont saisies (participant·es, notes individuelles, bilan). | les deux | O | O |  |
| Q1-22 | Les résultats ultérieurs d'un·e élève sont saisis dans le registre longitudinal. | les deux | O | O |  |
| Q1-23 | Les réponses des étudiant·es au questionnaire de bilan arrivent par un fichier CSV importé par l'enseignant·e. | A seule | O | — |  |
| Q1-24 | Le questionnaire de bilan est composé et édité par l'enseignant·e. | B seule | — | O |  |
| Q1-25 | Des fichiers de collègues ou de sauvegarde sont importés (JSON, paquets .lcz signés, configuration, codex .zip, codex data). | les deux | O | O |  |
| Q1-26 | La durée de chaque évaluation n'est recueillie que si le chronomètre est activé. | les deux | O | O |  |
| Q1-27 | Le chronomètre est désactivé par défaut. | A seule | O | — |  |
| Q1-28 | Des préférences d'horaire de travail (rythme) sont saisies. | A seule | O | — |  |
| Q1-29 | Des préférences et seuils d'interprétation sont saisis. | B seule | — | O |  |
| Q1-30 | Le prénom du testeur et la description d'un bug sont saisis. | B seule | — | O |  |
| Q1-31 | Un service d'orthopédagogie se crée à partir d'une liste d'élèves ; un DA provisoire (commençant par 9) est attribué quand il manque. | les deux | O | O |  |
| Q1-32 | Le programme apporte lui-même un jeu de démonstration (10 étudiant·es, dont les noms sont ceux de personnalités publiques). | les deux | O | O |  |
| Q1-33 | Le programme apporte des gabarits de grilles, d'échelles et de pratiques. | les deux | O | O |  |
| Q1-34 | Le programme apporte une carte d'alignement de démonstration signée « Grégoire Bédard · CC BY-NC-SA 4.0 ». | A seule | O | — |  |
| Q1-35 | Les textes des guides et de l'aide viennent du programme. | A seule | O | — |  |
| Q1-36 | Le fichier version.json est demandé au même serveur 30 s après le chargement, puis toutes les 5 min. | les deux | O | O |  |
| Q1-37 | L'horloge du système fixe la date de séance et la notion de « Date future ». | A seule | O | — |  |
| Q1-38 | Aucun écran n'est destiné à un·e étudiant·e : toutes les données d'étudiant·es entrent par un geste de l'enseignant·e (ou de l'orthopédagogue). | les deux | I | I |  |
| Q1-39 | L'institution n'est pas une source directe de données. | B seule | — | I |  |
| Q1-40 | Les textes du programme emploient le DA « du collège », Omnivox et Léa. | les deux | O | O | B range l'interprétation de ces mots sous Q1-41 (hypothèse). |
| Q1-41 | Les mots Omnivox et Léa désignent des systèmes en amont et en aval du programme. | B seule | — | H |  |

### Q2. Ce que le programme produit, et à qui chaque production est montrée ou destinée

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q2-01 | Rien ne quitte le navigateur sans geste de l'enseignant·e ; le seul échange automatique est GET version.json. | les deux | O | O (Q1) / I (Q2) | Écart : B donne O sous Q1 et I sous Q2 ; A donne O. |
| Q2-02 | Tout ce qui sort passe par un téléchargement, le presse-papiers ou un lien mailto: déclenché par l'enseignant·e. | A seule | O | — |  |
| Q2-03 | Un tableau de bord du groupe (A, C, P, bandes, corrélations, SOLO, RàI) est montré à l'enseignant·e à l'écran. | les deux | O | O |  |
| Q2-04 | Un panneau « Détails » filtre (P < 65 %, A ou C < 70 %, RàI 2-3) et range les étudiant·es par urgence. | les deux | O | O | A le dit sous Q4 et Q6. |
| Q2-05 | Une liste des étudiant·es montre A, C, P, profil, RàI et corrélations, pour l'enseignant·e. | les deux | O | O | A y ajoute la colonne des interventions, B les moyennes. |
| Q2-06 | Un profil individuel, pour l'enseignant·e, comporte une rubrique d'accompagnement avec « Interventions recommandées ». | les deux | O | O | A y ajoute « Niveau 3 - Intensif » et les absences datées. |
| Q2-07 | La rétroaction générée par niveaux est rédigée au « tu », copiable ; l'étudiant·e est la personne visée. | les deux | O (texte) / I (destinataire) | O (contenu) / I (destinataire) / H (remise) | B ajoute que la remise réelle est une hypothèse. |
| Q2-08 | Un « Dossier PDF » par étudiant·e et production est rédigé au « tu » et porte « Note provisoire — peut changer selon tes prochains travaux ». | les deux | O / I | O / I |  |
| Q2-09 | Le PDF « Exporter pour Léa » (copie annotée + évaluation) porte le libellé « pour téléversement dans Léa » ; son destinataire serait l'étudiant·e, via Léa. | les deux | O (libellé) / I (destinataire) | O (libellé) / H (destinataire) | Écart sur le destinataire : A I, B H. |
| Q2-10 | Un PDF consignes + grille + échelle est destiné à l'étudiant·e avant la tâche. | A seule | O / I | — |  |
| Q2-11 | Un CSV « synthèse des résultats finaux » est produit (DA, nom, prénom, note arrondie, statut). | les deux | O ; destinataire H | O ; usage ultérieur H |  |
| Q2-12 | Un PDF « Grille des présences » est produit (A : avec DA, programme, SA). | les deux | O ; destinataire H | O |  |
| Q2-13 | Un rapport de profil en texte copiable est produit (A, C, P, notes de l'enseignant·e). | les deux | O ; destinataire H | O ; destinataire H |  |
| Q2-14 | Un plan de cours, un déroulement et un calendrier sont exportés (txt, tsv, md). | A seule | O | — |  |
| Q2-15 | Des fichiers « à coller dans l'IA de ton choix » sont produits (carte, cartouche, prompt de questionnaire). | A seule | O | — |  |
| Q2-16 | Le texte du questionnaire de bilan est copiable, destiné aux étudiant·es via un outil externe. | A seule | O / I | — |  |
| Q2-17 | Un rapport d'analyse du bilan (score /4, % favorables) est produit, à l'écran et en PDF, pour l'enseignant·e. | les deux | O | O | B précise : sur des résultats injectés par le banc d'essai. |
| Q2-18 | Des exports JSON de matériel (grilles, échelles, cartouches, productions, pratiques, tampons, cartes) portent nom, courriel, institution et licence CC BY-NC-SA 4.0 ; ils sont destinés aux collègues. | les deux | O (y compris le destinataire) | O (contenu) / I (destinataire) | Écart sur le destinataire : A O, B I. |
| Q2-19 | Un paquet .lcz signé (ECDSA) est produit. | les deux | O | O |  |
| Q2-20 | Un « export anonymisé » (identifiants hachés, programme, services adaptés, résultats ultérieurs) est produit avec un fichier privé de correspondance. | les deux | O ; destinataire non dit (H : recherche) | O ; destinataire H |  |
| Q2-21 | Un « codex data » (données de plusieurs groupes archivés) est produit, avec l'avertissement « Ne le partage pas tel quel ». | A seule | O | — |  |
| Q2-22 | Une archive « codex » .zip (donnees.json, travaux/, manifeste) est produite et gardée par l'enseignant·e comme sauvegarde. | les deux | O | O |  |
| Q2-23 | Un rapport de bogue (version, appareil, nombre d'étudiant·es, 20 derniers clics, erreurs ; aucun nom ni DA) est copié ou envoyé par mailto:labo@codexnumeris.org sur geste. | les deux | O | O | B ajoute que le rapport peut être « enregistré en TXT » (voir appui). |
| Q2-24 | Des liens de soutien mènent à l'abonnement au blogue, à l'abonnement de soutien, au don et à la communauté de pratique de l'AQPC. | les deux | O | O | B le dit sous Q7. |
| Q2-25 | Tirage au sort, équipes (et, pour A, questions flash) : A les destine à la classe en séance ; B les destine à l'enseignant·e, avec projection en classe probable. | les deux | O / I | O ; projection H | Écart sur la destination : A O/I, B H. |
| Q2-26 | Des rappels (sauvegarde, pause) et un « Portrait temporel » s'adressent à l'enseignant·e sur son propre travail. | les deux | O (code pour les rappels) | O / O(c) |  |
| Q2-27 | Un ZIP des copies originales et annotées, rangées par étudiant·e, est produit. | B seule | — | O |  |
| Q2-28 | Le programme n'offre pas de canal de remise vers l'étudiant·e ; transmettre exige un geste hors du programme. | les deux | I | I |  |

### Q3. Ce que le programme garde, et ce qu'il garde sans jamais le montrer

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q3-01 | Tout est gardé dans le navigateur : IndexedDB, avec copie dans localStorage. | les deux | O | O |  |
| Q3-02 | Les écrans le disent : « Tes données vivent dans ce navigateur… », « Rangement : dans le navigateur ». | A seule | O | — |  |
| Q3-03 | Les données d'identité des étudiant·es sont gardées (DA, nom, prénom, programme, SA, CAF). | les deux | O | O |  |
| Q3-04 | Les présences sont gardées, avec leurs notes. | les deux | O | O |  |
| Q3-05 | Les évaluations sont gardées, avec un journal horodaté. | les deux | O | O |  |
| Q3-06 | Le nom de l'étudiant·e est recopié dans chaque évaluation (etudiantNom). | A seule | O | — |  |
| Q3-07 | Les copies (blobs, miniatures) et les annotations sont gardées. | les deux | O | O |  |
| Q3-08 | Les fiches confidentielles sont gardées. | les deux | O | O |  |
| Q3-09 | Les interventions sont gardées, avec notes individuelles, snapshotAvant et bilan. | les deux | O | O |  |
| Q3-10 | Les indices A, C, P et les patterns RàI calculés sont stockés. | les deux | O | O | B le dit sous Q4. |
| Q3-11 | Un registre longitudinal garde une copie figée du dossier d'un·e élève, d'un trimestre à l'autre, avec ses résultats ultérieurs. | les deux | O | O |  |
| Q3-12 | Des captures hebdomadaires des indices sont prises automatiquement pour la semaine courante. | les deux | O | O(c) | Même niveau : A compte « lu dans le code » parmi O ; B l'écrit O(c). |
| Q3-13 | Les captures peuvent être reconstruites rétroactivement (« Recalculer les captures »). | A seule | O | — |  |
| Q3-14 | Presque toute suppression ouvre d'abord « Écrire un codex avant de supprimer ? ». | les deux | O | O |  |
| Q3-15 | Supprimer un groupe ou un trimestre, ou tout réinitialiser, exige un codex à part et la saisie d'un nom ou de « EFFACER ». | les deux | O | O |  |
| Q3-16 | Si le codex à part ne peut pas être écrit, rien n'est supprimé. | A seule | O | — |  |
| Q3-17 | Un cours qui porte des données ne peut pas être supprimé. | les deux | O | O |  |
| Q3-18 | Une grille ou une échelle employée ne peut pas être supprimée. | A seule | O | — |  |
| Q3-19 | Changer la session ou l'année d'un trimestre qui porte des données est refusé. | les deux | O | O | B le dit sous Q4. |
| Q3-20 | a2026_elevesDesinscrits (DA et date) est écrit à la suppression d'une fiche ; aucun écran observé ne le lit. | les deux | O | O |  |
| Q3-21 | Les tables de correspondance d'anonymisation (« Élève N » ↔ DA) restent après le retour au mode normal. | A seule | O | — |  |
| Q3-22 | À l'export anonymisé, une clé secrète aléatoire (32 caractères) et la table de correspondance sont créées. | les deux | O | O |  |
| Q3-23 | La clé secrète est gardée en clair (tableCorrespondance_a2026). | A seule | O | — |  |
| Q3-24 | Les 20 derniers clics et erreurs sont gardés en mémoire ; ils n'apparaissent que dans le rapport de bogue. | les deux | O | O |  |
| Q3-25 | Le manifeste du codex enregistre l'appareil, le navigateur et le userAgent complet. | les deux | O | O |  |
| Q3-26 | Un journal des tentatives de sauvegarde du codex est gardé dans sessionStorage. | A seule | O | — |  |
| Q3-27 | _codex_snapshot_avant : des empreintes SHA-256 de chaque clé sont écrites à l'ouverture d'un codex. | les deux | O | O |  |
| Q3-28 | ressourcesSupprimees garde la liste des gabarits supprimés. | A seule | O | — |  |
| Q3-29 | Les rapports de bogue sont archivés ; envoye:true est posé même quand le rapport a seulement été copié. | les deux | O | O | B le range sous ses contradictions, A sous Q3 et Q8. |
| Q3-30 | clesConnues garde la clé publique, les dates et le nombre d'imports de chaque collègue. | les deux | O | O |  |
| Q3-31 | preferencesRythme est enregistrée, mais le formulaire affiche les valeurs par défaut après rechargement. | A seule | O | — |  |
| Q3-32 | sisDefaut et modeExpert sont gardés sans aucun lecteur. | A seule | O | — |  |
| Q3-33 | Des blobs restent après « Remplacer l'existant » et après archivage. | A seule | O | — |  |
| Q3-34 | La miniature d'un fichier de Modélisation supprimé reste. | les deux | O | O |  |
| Q3-35 | Des références orphelines restent : pratiqueId d'une pratique supprimée, horaireId d'un horaire supprimé. | les deux | O | O |  |
| Q3-36 | Les clés demo_* restent après la sortie de la démo. | A seule | O | — |  |
| Q3-37 | jetonsEtudiants est créé à la simple consultation d'une évaluation. | les deux | O | O |  |
| Q3-38 | Après une suppression apparente, des traces restent (DA désinscrit, correspondances, blobs, références). | A seule | I | — |  |
| Q3-39 | Une corbeille de 30 jours garde les fichiers de copies supprimés. | B seule | — | O |  |
| Q3-40 | Une paire de clés ECDSA (clé privée non exportable) est rangée dans labo-codex-identite. | B seule | — | O |  |
| Q3-41 | Des marqueurs d'usage accompagnement-vu__… gardent les flèches déjà fermées. | B seule | — | O |  |
| Q3-42 | Supprimer une intervention ne retire pas les présences déjà reportées. | B seule | — | O |  |
| Q3-43 | Les fiches confidentielles, le registre et le journal d'évaluation se rouvrent à l'écran. | B seule | — | O |  |

### Q4. Ce que le programme rend facile, et ce qu'il rend difficile

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q4-01 | L'enregistrement est différé de 1,5 s et se fait sans geste (évaluation, présences). | les deux | O | O | A l'étend à la fiche de production et à la carte (Q4-02). |
| Q4-02 | Même enregistrement automatique pour la fiche de production et la carte ; il n'y a pas de bouton « Enregistrer ». | A seule | O | — |  |
| Q4-03 | A, C, P et les patterns RàI sont recalculés, et réécrits si leur contenu change, au chargement ou à l'affichage du suivi. | les deux | O | O |  |
| Q4-04 | A est aussi recalculé à chaque saisie de présence. | A seule | O | — |  |
| Q4-05 | Une fenêtre de rappel de sauvegarde s'ouvre 1,5 s après le chargement s'il existe une évaluation ou un fichier. | les deux | O | O |  |
| Q4-06 | Les séances sont générées et des migrations à drapeau s'exécutent au chargement. | B seule | — | O |  |
| Q4-07 | Aux présences, tout le monde est présent par défaut (2/2, 100 %). | les deux | O | O |  |
| Q4-08 | « ✓ 2 pér. » met tout le monde présent en un geste. | A seule | O | — |  |
| Q4-09 | « Confirmer la séance » enregistre la séance (environ 3 clics depuis l'accueil). | B seule | — | O / I | Le décompte des clics est celui de B. |
| Q4-10 | Verrouiller une séance non saisie compte présent·es les élèves non marqué·es. | les deux | O | O |  |
| Q4-11 | Une séance non saisie s'affiche à 100 % mais n'entre pas dans le taux A. | les deux | O | O | B la range sous ses contradictions ; A l'énonce comme deux faits. |
| Q4-12 | Une absence demande un geste par étudiant·e ; la présence est l'état par défaut. | A seule | I | — |  |
| Q4-13 | « Évaluer » préselectionne groupe, étudiant·e, production, grille, échelle, cartouche (A : aussi statut de remise et intégrité). | les deux | O | O |  |
| Q4-14 | La note est recalculée et la rétroaction rédigée automatiquement à chaque niveau choisi. | les deux | O | O |  |
| Q4-15 | Évaluer demande peu de gestes (A : un choix par critère ; B : 7 à 8 gestes pour 4 critères). | les deux | I | I |  |
| Q4-16 | Le dernier choix de production est réutilisé pour les dépôts suivants. | A seule | O | — |  |
| Q4-17 | Les images déposées sont optimisées et regroupées en PDF par DA. | B seule | — | O |  |
| Q4-18 | Il existe une visite guidée. | les deux | O | — | B la nomme sans niveau, dans sa finalité E. |
| Q4-19 | La visite suit Cadre → Conception → Évaluation → Suivi ; la carte d'alignement et le Labo sont « (optionnel) ». | A seule | O | — |  |
| Q4-20 | L'assistance est active au premier chargement ; des flèches didactiques désignent les premières actions. | A seule | O | — |  |
| Q4-21 | activerRai:true et depistageAcp:true sont les valeurs écrites au premier enregistrement des préférences. | A seule | O | — |  |
| Q4-22 | Activer la démo mène directement à Suivi › Suivi du groupe. | A seule | O | — |  |
| Q4-23 | Des prérequis imposent un ordre : six étapes du Cadre ; un horaire exige un groupe d'étudiant·es ; un groupe-cours exige cinq choix ; sans horaire, aucune séance. | B seule | — | O |  |
| Q4-24 | Il n'y a pas de note tant qu'un critère est sans niveau. | les deux | O | O | B le dit sous Q5. |
| Q4-25 | Sans pratique appliquée, la note de cours n'est pas constructible (C = P = 0). | les deux | O | O | B le dit sous Q5. |
| Q4-26 | Pour SPE, aucune note tant que types de travaux et forfaits manquent ; pour DEN sans cible, aucune note ne peut dépasser 59. | A seule | O | — |  |
| Q4-27 | Partager du matériel exige une description et une case de licence cochée ; le matériel démo et importé est exclu de « Exporter ma config ». | A seule | O | — |  |
| Q4-28 | Les métadonnées d'export sont préremplies et la licence CC BY-NC-SA 4.0 est écrite d'office. | B seule | — | O |  |
| Q4-29 | Saisir ou ajouter coûte moins de gestes que supprimer ou retirer (entrer facile, enlever coûteux). | les deux | I | I | Formulations différentes : B oppose aussi la configuration à la capture. |
| Q4-30 | Le calendrier tolère (« rien n'est bloqué ») alors que les suppressions bloquent. | A seule | I | — |  |
| Q4-31 | Exceptions où retirer est facile : résultat longitudinal sans confirmation, cartouche sans dialogue, pratique appliquée sans avertissement. | A seule | O | — |  |
| Q4-32 | Le déverrouillage immédiat d'une évaluation échoue dans la même session « Évaluer ». | les deux | O | O |  |
| Q4-33 | Le tri de la liste des productions n'agit pas. | les deux | O | O |  |
| Q4-34 | La corbeille de la carte déplace le bloc sans le supprimer. | les deux | O | O |  |
| Q4-35 | L'import des résultats du bilan échoue (erreur de page). | les deux | O | O |  |
| Q4-36 | L'import du questionnaire de bilan lève une erreur au premier clic. | B seule | — | O |  |
| Q4-37 | Le bouton d'export PDF de l'échelle ne produit aucun fichier. | B seule | — | O |  |
| Q4-38 | L'import texte d'une cartouche n'est pas persisté. | A seule | O | — |  |
| Q4-39 | La carte de l'écran annonce « ZIP léger… » alors que les fichiers produits sont un JSON et un TXT. | A seule | O | — |  |
| Q4-40 | L'export anonymisé laisse vide la liste des captures malgré 15 captures présentes. | les deux | O | O |  |
| Q4-41 | Les sélecteurs natifs de fichiers et de dossiers échouent dans le banc d'essai ; les chemins qui suivent n'ont pas été exécutés. | les deux | O | O |  |
| Q4-42 | Le mode anonymisation est un basculeur d'un clic, non actif au départ. | B seule | — | O |  |
| Q4-43 | Un clic sur une ligne de la liste des étudiant·es ouvre le profil. | B seule | — | O |  |
| Q4-44 | La date de séance affichée aux présences est la dernière séance passée. | B seule | — | O |  |
| Q4-45 | Corriger un DA passe par une boîte « codex », un dialogue de saisie et une vérification de doublon. | B seule | — | O |  |

### Q5. Ce que le programme calcule, compte ou classe, et à partir de quoi

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q5-01 | La note d'une évaluation est la moyenne des valeurs ponctuelles des niveaux choisis (I 32, D 69,5, M 79,5, E 92,5), pondérée par les critères. | les deux | O | O | A écrit « moyenne pondérée », B « moyenne des valeurCalcul » ; grille de 4 critères à 25 %. |
| Q5-02 | Une évaluation au statut « plagiat » vaut 0 et sa ligne est exclue de la moyenne de la liste. | les deux | O | O | A écrit « hors plagiat et IA ». |
| Q5-03 | La moyenne de la liste inclut des évaluations non verrouillées. | A seule | O | — |  |
| Q5-04 | Note « algorithmique » = Pondération − (Erreurs ÷ Mots × 500) ; formule non exécutée sur une copie. | A seule | O | — |  |
| Q5-05 | Le calendrier calcule semaines et jours de cours à partir des bornes, congés, reprises et horaire. | les deux | O | O |  |
| Q5-06 | Les heures attendues (pondération × semaines) et l'écart entre l'horaire et le devis sont calculés. | A seule | O | — |  |
| Q5-07 | Des badges d'alignement (✓ ⚠ !) et des durées (minutes → périodes, Σ de leçon) sont calculés sur la carte. | les deux | O | O |  |
| Q5-08 | Des sommes de pondérations sont calculées (« 70% manquant », « 5% en trop »). | les deux | O | O |  |
| Q5-09 | A = périodes présentes ÷ périodes offertes, sur les séances saisies seulement. | les deux | O | O | B ajoute « plafonné à 1 ». |
| Q5-10 | C est une part de travaux remis (calculée par la pratique active). | les deux | O | O |  |
| Q5-11 | Le dénominateur de C : « travaux demandés » (A) ; « travaux réalisés » (B, qui cite la définition de la note d'aide). | contradictoire | O | O | A et B donnent deux dénominateurs différents. |
| Q5-12 | P = note du cours selon la pratique active (ex. moyenne pondérée pour SOM). | les deux | O | O |  |
| Q5-13 | μ, σ, le nombre d'étudiant·es à ±1σ et le r de Pearson A↔P et C↔P sont calculés sur le groupe. | les deux | O | O |  |
| Q5-14 | Des bandes d'engagement « Fragile / Modéré / Favorable / Très favorable » sont calculées. | les deux | O | O |  |
| Q5-15 | La distribution de P est calculée selon les niveaux de l'échelle. | les deux | O | O |  |
| Q5-16 | Des patterns SOLO (« Progression stable » … « Non-participation ») et des niveaux RàI 1-2-3 sont calculés par étudiant·e. | les deux | O | O |  |
| Q5-17 | Les statuts inactif/décrochage excluent l'étudiant·e des calculs du groupe. | les deux | O | O |  |
| Q5-18 | Un score d'urgence range les étudiant·es retenu·es (P, min(A, C), suivi, RàI). | les deux | O | O | B écrit « Suivi : indice × 30 ». |
| Q5-19 | Des trajectoires, quartiles, médiane et habiletés par critère sont calculés. | A seule | O | — |  |
| Q5-20 | Le comparateur de pratiques calcule la note finale de mêmes profils (fictifs ou groupe réel) sous plusieurs pratiques. | les deux | O | O |  |
| Q5-21 | Des corrélations longitudinales (Pearson) sont calculées dans « Études » (B : minimum de 5 étudiant·es). | les deux | O | O |  |
| Q5-22 | « P contrôle » et P avec/sans jetons sont calculés. | A seule | O | — |  |
| Q5-23 | Le bilan calcule un score moyen /4, un % favorables et un « signal fort ». | les deux | O | O |  |
| Q5-24 | Durée moyenne/médiane d'évaluation, tendance, charge estimée et « Portrait temporel » sont calculés. | les deux | O | O |  |
| Q5-25 | L'identifiant anonyme est un hachage SHA-256 tronqué à 8 caractères du DA et d'une clé. | les deux | O | O | B écrit « identifiants hachés » ; la formule est celle de A. |
| Q5-26 | Le tirage au sort et les équipes utilisent Math.random (A : absent·es écarté·es, paires déjà formées évitées). | les deux | O | O |  |
| Q5-27 | Le graphique hebdomadaire ajoute un décalage aléatoire (±0,015) à l'affichage. | les deux | O / I | O | A ajoute l'inférence que la valeur affichée n'est pas la valeur calculée ; B l'écrit sous ses contradictions. |
| Q5-28 | Ce qui est classé, ce sont des personnes (bandes, patterns, RàI, priorités). | les deux | I | I |  |
| Q5-29 | Rien n'indique que les données « Confidentiel » entrent dans un calcul. | A seule | I | — |  |
| Q5-30 | Les classements partent d'effectifs très petits : un·e étudiant·e à P = 51 sur une seule production est classé·e « Niveau 3 ». | B seule | — | O / I |  |
| Q5-31 | Les seuils sont modifiables sans bornes appliquées par le code (« fenêtre = 99 acceptée »). | B seule | — | O |  |

### Q6. La finalité que ces régularités révèlent

**Les deux formulations côte à côte**

| Lecture | Phrase |
|---|---|
| A (6.1) | « Labo Codex fait du poste de l'enseignant·e le lieu, seul et fermé, où ce que l'enseignant·e saisit sur chaque étudiant·e (présences, copies, niveaux par critère) se convertit sans cesse en notes et rétroactions à rendre et en indices qui classent chaque étudiant·e selon un besoin d'intervention. Ce dossier est conservé et protégé bien plus qu'il n'est mis en circulation. » |
| B (6) | « Le programme sert à une personne enseignante, seule, à tenir étudiant·e par étudiant·e un dossier de présences, de notes et de rétroactions, et à en dériver automatiquement des indices et un classement de niveau de besoin qui orientent ses décisions de notation et d'intervention. » |

**Ce en quoi elles se recoupent.** Les deux parlent d'une personne enseignante seule (Q6-01), d'un dossier tenu étudiant·e par étudiant·e (Q6-02), de ce qu'elle saisit — présences et niveaux ou notes (Q6-03) —, d'une dérivation automatique d'indices et d'un classement des étudiant·es selon un besoin (Q6-05), de l'usage de ce classement pour orienter des décisions (Q6-06) et de la primauté de la conservation du dossier sur sa circulation (Q6-07). B ne donne pas cette dernière sous forme de comparaison : elle écrit que la tenue du dossier est ce que le programme protège le plus.

**Ce en quoi elles diffèrent.** A nomme les copies parmi ce qui est saisi, B nomme les rétroactions parmi ce que le dossier contient (Q6-03). A fait de la conversion en notes et en rétroactions « à rendre » un élément de sa phrase (Q6-04) et la termine sur la conservation (Q6-07) ; B la termine sur les décisions de notation et d'intervention (Q6-06) et argumente « décision » plutôt que « tenue de dossier » (Q6-12). A ajoute que la sortie la plus outillée va vers l'étudiant·e (Q6-08) et que la circulation encouragée concerne le matériel (Q6-09) ; B ajoute l'enchaînement repérer → intervenir → mesurer (Q6-10). A ne donne pas de niveau à sa phrase (ses justifications aboutissent à [I]) ; B l'écrit (I).

**Les autres finalités présentées**

| Finalité chez A | Finalité chez B | Recoupement et différence |
|---|---|---|
| A. Outil de travail de l'enseignant·e : planifier → évaluer → noter → rendre | A. Gestion de classe : notes + présences + transmission | Même idée (Q6-13). A y met planifier (plan de cours, carte) ; B y met la transmission (Léa, CSV). |
| B. Dépistage et suivi des étudiant·es « à risque » | B. Repérage et triage des étudiant·es à risque | Même idée (Q6-14), mêmes calculs en appui (A, C, P, RàI, interventions). A ajoute les données confidentielles et le registre ; B note que le classement dépend des seuils de l'enseignant·e. |
| C. Faire changer les pratiques de notation | E. Formation à d'autres pratiques de notation | Même terrain (assistant de pratiques, comparateur, guides) (Q6-15) ; A dit « faire changer », B dit « formation ». |
| D. Produire des données pour la recherche | C. Recherche sur la pratique d'enseignement | Même idée (Q6-16) : « Études », export anonymisé, registre longitudinal. |
| E. Bâtir une communauté et une économie autour du projet | D. Diffusion de ressources entre enseignant·es | Partage de ressources signé et sous licence en commun (Q6-17). A ajoute abonnement, don, courriel de rapport ; B limite en notant que ces fonctions sont peu liées au dossier étudiant. |
| F. Réflexivité de l'enseignant·e sur sa pratique et sa charge | (pas une finalité chez B) | B décrit les mêmes fonctions comme sa régularité 7, qui « prolonge le dossier sans y entrer » (Q6-11). |

A écrit que « aucune n'exclut les autres » ; B écrit qu'elles « ne s'excluent pas » (Q6-18). Chaque lecture donne, pour chaque finalité, ce qui l'appuie, ce qui la limite et ce qui permettrait de trancher ; seules les finalités sont mises en regard ici.

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q6-01 | Le programme est celui d'une personne enseignante, seule (A : « seul et fermé »). | les deux | I | I | Formulation de A non étiquetée ; ses justifications (6.2) aboutissent à [I]. |
| Q6-02 | Le dossier est tenu étudiant·e par étudiant·e. | les deux | I | I |  |
| Q6-03 | Ce que l'enseignant·e saisit : présences et niveaux/notes (A nomme aussi les copies ; B nomme aussi les rétroactions). | les deux | I | I |  |
| Q6-04 | Cette saisie se convertit sans cesse en notes et en rétroactions « à rendre ». | A seule | I | — |  |
| Q6-05 | Le programme dérive automatiquement des indices et un classement des étudiant·es selon un besoin (d'intervention). | les deux | I | I |  |
| Q6-06 | Ce classement oriente des décisions (A : auprès de qui intervenir ; B : de notation et d'intervention). | les deux | I | I | A le dit dans sa justification 3, B dans sa phrase. |
| Q6-07 | La conservation et la protection du dossier priment sur sa circulation. | les deux | I | I | A : « protégé bien plus qu'il n'est mis en circulation » ; B : « la tenue du dossier est ce que le programme protège le plus ». |
| Q6-08 | La sortie la plus outillée va vers l'étudiant·e : évaluer et rendre est le parcours le plus court. | A seule | I | — |  |
| Q6-09 | La circulation encouragée concerne le matériel pédagogique, non les données d'étudiant·es. | A seule | I | — |  |
| Q6-10 | Après le classement s'enchaînent repérer → intervenir → mesurer (interventions, registre, courbes). | B seule | — | O / I |  |
| Q6-11 | Le programme instrumente aussi le travail de l'enseignant·e (rythme, charge, bilan). | les deux | — (finalité F : « compatible ») | O (régularité 7) | Statut différent : A en fait une finalité possible, B une régularité qui prolonge le dossier. |
| Q6-12 | « Décision » plutôt que seule « tenue de dossier » : le programme calcule d'office des classes de besoin. | B seule | — | I |  |
| Q6-13 | Finalité compatible : outil de travail / gestion de classe (planifier → évaluer → noter → rendre). | les deux | — | — | Niveau non étiqueté chez A et chez B. |
| Q6-14 | Finalité compatible : repérage / dépistage des étudiant·es à risque. | les deux | — | — |  |
| Q6-15 | Finalité compatible : faire changer / enseigner d'autres pratiques de notation. | les deux | — | — | A : « faire changer » ; B : « formation à ». |
| Q6-16 | Finalité compatible : produire des données pour la recherche. | les deux | — | — |  |
| Q6-17 | Finalité compatible : diffuser des ressources entre enseignant·es / bâtir une communauté (A ajoute une « économie » autour du projet). | les deux | — | — |  |
| Q6-18 | Ces finalités ne s'excluent pas. | les deux | — | — |  |
| Q6-19 | A retient la formulation 6.1 et dit ce qui la ferait réviser (exports « recherche » transmis à un tiers ; classements jamais consultés). | A seule | — | — |  |

### Q7. À quoi le programme sert, pour chacune des personnes qu'il touche

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q7-01 | L'enseignant·e, utilisateur·rice principal·e : organiser, saisir, évaluer, produire notes et rétroactions, repérer qui est en difficulté, garder une trace. | les deux | O | O |  |
| Q7-02 | Il lui sert aussi à observer son propre rythme de travail (si le chronomètre est activé). | les deux | O | O |  |
| Q7-03 | Les données de l'enseignant·e sont aussi traitées (nom, courriel, institution dans les exports ; clics et erreurs ; heures d'évaluation). | A seule | O | — |  |
| Q7-04 | Le programme déplace une partie du jugement : l'ordre d'urgence est donné par des formules. | B seule | — | I |  |
| Q7-05 | Le programme demande à l'enseignant·e de tenir seule la sauvegarde, avec des rappels. | B seule | — | O |  |
| Q7-06 | L'orthopédagogue est une seconde utilisatrice : service sans code ni horaire, élèves même sans DA, rencontres. | A seule | O | — |  |
| Q7-07 | Créer un service remplace les indices des étudiant·es du trimestre par ceux des élèves du service. | A seule | O | — |  |
| Q7-08 | Les étudiant·es ne sont jamais utilisateur·rices ; ce sont des personnes dont les données sont traitées. | les deux | — | — | Intitulés non étiquetés ; voir Q1-38 (I, I). |
| Q7-09 | Des données de santé ou de handicap (catégorie diagnostique comme « Dyslexie ») et le parcours scolaire peuvent être consignés. | les deux | O | O |  |
| Q7-10 | Les catégories de classement n'apparaissent pas dans les sorties observées destinées aux étudiant·es ; le « Dossier PDF » ne contient ni A, ni RàI, ni pattern. | A seule | I | — |  |
| Q7-11 | Il n'existe aucun canal de consultation ni de contestation pour l'étudiant·e. | B seule | — | I |  |
| Q7-12 | Les étudiant·es peuvent répondre au questionnaire de bilan, hors du programme. | A seule | O | — |  |
| Q7-13 | Des noms de personnalités publiques servent d'étudiant·es dans la démo. | les deux | O | O |  |
| Q7-14 | Ces personnes ne sont ni utilisatrices ni informées par le document. | B seule | — | I |  |
| Q7-15 | Les collègues reçoivent du matériel signé (nom, courriel, institution de l'auteur·e) ; la clé de l'auteur·e est mémorisée chez qui importe. | (compté ailleurs) | O | O | = Q2-18 et Q3-30 ; compté là. |
| Q7-16 | Un changement de clé de signature déclenche un avertissement. | B seule | — | O |  |
| Q7-17 | Le programme reprend les formats du collège (DA, Omnivox, Léa, devis ministériel, EUF). | (compté ailleurs) | O | O | = Q1-40 ; compté là. |
| Q7-18 | Les fichiers CSV de notes et la grille de présences servent à la remise des notes ou au dossier administratif de l'établissement. | A seule | H | — |  |
| Q7-19 | Aucun flux vers l'institution n'est rapporté. | B seule | — | I | Compatible avec Q7-18 (A dit que le programme ne le dit pas) ; non classé contradictoire. |
| Q7-20 | « Dis-le-moi en session » : trace d'un échange direct entre auteur·es et utilisateur·rices en phase bêta. | A seule | H | — | B cite la phrase du refus sous Q4 sans en tirer cette lecture. |
| Q7-21 | Le serveur qui héberge version.json voit passer une requête toutes les 5 min par poste ouvert. | les deux | H | H | A le dit sous Q9, B sous Q7 et Q9. |
| Q7-22 | Des chercheur·es recevraient l'export anonymisé (A : aussi codex data et « Études ») ; aucune remise n'est observée. | les deux | H | H |  |
| Q7-23 | Une IA externe reçoit, par copier-coller, des modèles contenant cours, carte, consignes et grilles, sans noms d'étudiant·es. | A seule | O | — |  |
| Q7-25 | L'enseignant·e peut aussi partager du matériel signé et placé sous licence. | A seule | O | — |  |
| Q7-24 | Les auteur·es reçoivent, sur geste, des rapports de bogue ; des liens de soutien les relient aux utilisateur·rices. | (compté ailleurs) | O | O | = Q2-23 et Q2-24 ; compté là. |

### Q8. Contradictions relevées par A et par B

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q8-01 | La fenêtre « Confidentiel » dit « jamais partagées » alors que le codex exporte donnees.json (49 clés) sans chiffrement ; l'observation ne dit pas si les données confidentielles y figurent. | les deux | O ; [?] pour le contenu | O ; contenu non confirmé |  |
| Q8-02 | Le pack démo se déclare « 10 étudiants anonymisés » alors que les noms sont ceux de personnalités publiques. | A seule | O | — |  |
| Q8-03 | Licence : noms de fichier « CC-BY-SA » contre « CC BY-NC-SA 4.0 » dans les métadonnées. | les deux | O | O |  |
| Q8-04 | L'Accueil annonce une infolettre (« Ton courriel, une fois par mois… ») sans champ, bouton ni requête correspondants. | A seule | O | — |  |
| Q8-05 | Les colonnes Groupe et Cours du CSV de synthèse sont vides. | les deux | O | O | B le range dans la colonne « limite » de sa finalité A. |
| Q8-06 | Protection inégale : cours indélébile ; pratique appliquée supprimée sans avertissement ; résultat longitudinal retiré sans confirmation. | A seule | O | — | Les pièces sont comptées en Q3-17, Q3-35, Q4-31. |
| Q8-07 | Écrans qui annoncent une chose et en font une autre (ZIP léger, tri, corbeille de la carte, import texte de cartouche, import du bilan, déverrouillage). | A seule | O | — | Les pièces sont comptées en Q4-32 à Q4-35, Q4-38, Q4-39. |
| Q8-08 | La moyenne de la liste exclut le plagiat mais inclut des évaluations non verrouillées. | (compté ailleurs) | O | — | = Q5-03 ; compté là. |
| Q8-09 | L'export dit « anonymisé » garde programme, services adaptés et résultats ultérieurs ; la table de correspondance et la clé secrète sont produites au même clic. | les deux | O | O |  |
| Q8-10 | Formule d'assiduité : l'aide écrit « heures présentes / heures données », le calcul porte sur des périodes saisies. | B seule | — | O |  |
| Q8-11 | Arrondi : la fiche affiche « (50.8 × 50) ÷ 50 = 50.7% ». | B seule | — | O |  |
| Q8-12 | Des fonctions existent sans bouton ni appelant dans l'interface. | B seule | — | O |  |
| Q8-13 | Le « Dossier PDF » s'adresse à l'étudiant·e au « tu », sans étape de remise rapportée. | (compté ailleurs) | — | — | = Q2-28 ; compté là. |
| Q8-14 | Courbe hebdomadaire bruitée ; envoye:true pour un rapport copié ; séance non saisie à 100 % ; classement sur peu de données. | (compté ailleurs) | O | O | = Q5-27, Q3-29, Q4-11, Q5-30 ; comptés là. |

### Q9. Ce que l'observation ne permet pas de savoir

| # | Affirmation | Groupe | Niveau A | Niveau B | Remarque |
|---|---|---|---|---|---|
| Q9-01 | L'usage réel est inconnu (qui, combien, quels écrans, quelle fréquence) ; toutes les données observées sont fictives. | les deux | — | — |  |
| Q9-02 | On ne sait pas si les indices et classements sont lus ou guident des actions. | les deux | — | — | A : « lus » ; B : « guide effectivement des actions ». |
| Q9-03 | On ne sait pas si les PDF et rétroactions parviennent aux étudiant·es (téléversement dans Léa, canal de remise). | les deux | — | — |  |
| Q9-04 | On ne sait pas à qui vont les fichiers exportés, ni sous quel protocole ni avec quel consentement. | les deux | — | — |  |
| Q9-05 | Le déploiement réel est inconnu (observé depuis 127.0.0.1) ; ce que l'hébergeur voit ou enregistre est inconnu. | les deux | H (sur l'hébergeur) | — (H sous Q7) |  |
| Q9-06 | Le contenu exact du codex (49 clés ; présence des données confidentielles) n'est pas connu. | les deux | — | — |  |
| Q9-07 | Chemins non exécutés : sélecteurs natifs, écriture réelle du codex et des archives. | les deux | — | — |  |
| Q9-08 | Non observés : signalements de dépistage par critères, blocs SOLO/RLO. | A seule | — | — |  |
| Q9-09 | Non observé : tableau « Avant / Après » des interventions. | A seule | — | — |  |
| Q9-10 | Non observé : mode anonymisation appliqué aux profils. | A seule | — | — |  |
| Q9-11 | Non observés : critères algorithmiques appliqués à une copie. | A seule | — | — |  |
| Q9-12 | Non observés : archivage en dossier lié, partage par glisser-déposer, plusieurs groupes avec plusieurs sections. | B seule | — | — |  |
| Q9-13 | Les intentions des auteur·es : le document n'en dit rien. | les deux | — | — |  |
| Q9-14 | Les effets des rétroactions générées et des notes provisoires sur les personnes sont inconnus. | A seule | — | — |  |
| Q9-15 | Le cadre institutionnel est inconnu : personnes informées, consentement, institution au courant. | B seule | — | — |  |
| Q9-16 | Certains comportements observés peuvent tenir aux artefacts du banc d'essai (Chromium sans tête, blobs non restitués). | B seule | — | — |  |

### Écarts de niveau relevés

- **Q2-01** : A donne O à « rien ne quitte le navigateur sans geste » ; B donne O sous Q1 et I sous Q2.
- **Q2-09** : pour le destinataire du PDF « pour téléversement dans Léa », A écrit I (l'étudiant·e, via Léa) et B écrit H.
- **Q2-18** : pour le destinataire des exports de matériel, A écrit O (« des collègues ») et B écrit I (d'après l'intitulé « Partager »).
- **Q2-12** : A ajoute une hypothèse (H) sur la destination du PDF des présences (dossier administratif) ; B écrit seulement O (fichier pour l'enseignant·e).
- **Q2-25** : pour la destination du tirage et des équipes, A écrit O/I (la classe) et B écrit H (projection probable).
- **Q6-11** : A en fait une finalité « compatible » non étiquetée ; B en fait une régularité observée (O).
- **Q4-18** : A donne O à l'existence d'une visite guidée ; B la nomme sans niveau.
- **Q9-05** : A écrit H pour l'hypothèse sur l'hébergeur sous Q9 ; B l'écrit H sous Q7 et ne l'étiquette pas sous Q9.
- **Q2-07** : B ajoute une hypothèse (la remise réelle) que A n'écrit pas.
- **Q5-27** : A ajoute une inférence (la valeur affichée n'est pas la valeur calculée) à l'observation que B rapporte seule.

## Partie 2. Appuis

Légende : ✔ soutient ; ◐ soutient en partie ; ✘ ne soutient pas ; ∅ introuvable. « Cité par » : A, B ou A+B.

### Appuis — Q1. Ce que le programme reçoit, et qui le lui fournit

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q1-01 | ✔ Cadre › Trimestre › « Créer le trimestre » (l.300) [A+B]<br>✔ Cadre › Trimestre › champs de dates (l.322-324) [A+B]<br>✔ Cadre › Trimestre › « + Ajouter » une journée sans cours (l.328-330) [A+B] | soutient |  |
| Q1-02 | ✔ Cadre › Cours et services › « Créer le cours » (l.339-342) [A+B] | soutient | Pondération « Format du devis ministériel : 2-2-3 » exigée (l.341). |
| Q1-03 | ✔ Cadre › Enseignant·e › « Créer le profil » (l.370-373) [A+B] | soutient |  |
| Q1-04 | ✔ Cadre › Horaire › « Créer l'horaire » (l.418-421) [A+B]<br>✔ Cadre › Horaire › refus observés (l.420) [A] | soutient | Refus : « nombre de périodes manquant. C'est lui qui compte au dénominateur de l'assiduité ». |
| Q1-06 | ✔ Cadre › Groupe d'étudiant·es › « Prévisualiser » (l.383-387) [A+B]<br>✔ Cadre › Groupe d'étudiant·es › fichier CSV (l.388) [B]<br>✔ Cadre › Groupe d'étudiant·es › « Confirmer » (l.390-391) [A+B] | soutient |  |
| Q1-07 | ✔ Cadre › Groupe d'étudiant·es › « Ajouter un·e étudiant·e » (l.393-396) [A+B] | soutient |  |
| Q1-09 | ✔ Conception › Productions › « Créer la production » (l.800-804) [A+B]<br>✔ Conception › Grilles › « Créer la grille » (l.894-896) [A+B]<br>✔ Conception › Échelles › « Créer l'échelle » (l.959-960) [A+B]<br>✔ Conception › Rétroactions › « Créer la cartouche » (l.1012-1013) [A+B]<br>✔ Conception › Pratiques › assistant « Créer la pratique » (l.1103-1126) [A+B] | soutient |  |
| Q1-11 | ✔ Suivi › Saisie des présences › champ de périodes (l.1985-1987) [A+B]<br>✔ Suivi › Saisie des présences › champ de notes (l.1991-1992) [A+B] | soutient |  |
| Q1-12 | ✔ Évaluation › Préparer et importer › zone de dépôt (l.1561-1564) [A+B] | soutient | Le champ accepte .pdf .jpg .jpeg .png .heic .heif .webp ; les quatre formats de A en sont un sous-ensemble. |
| Q1-13 | ✔ Évaluation › Préparer et importer › zone de dépôt, appariement (l.1566-1568) [A+B] | soutient |  |
| Q1-14 | ✔ Évaluation › Évaluer › listes de niveau (l.1446-1454) [A+B] | soutient |  |
| Q1-15 | ✔ Évaluation › Évaluer › Intégrité (l.1475-1477) [A+B] | soutient |  |
| Q1-18 | ✔ Évaluation › Annoter › stylo, tampons, codes (l.1668-1684) [A+B]<br>✔ Évaluation › Préparer et importer › zone de dépôt (l.1561-1573) [B] | soutient |  |
| Q1-19 | ✔ Suivi › Profil › « Confidentiel » (l.1943-1950) [A+B] | soutient | Parcours « Échec », « Abandon » ; défis ; catégorie « apprentissage » → « Dyslexie » ; notes (l.1944-1946). |
| Q1-21 | ✔ Suivi › Interventions › « Créer l'intervention » (l.2069-2070) [A+B]<br>✔ Suivi › Interventions › Bilan (l.2085-2086) [A]<br>✔ Suivi › Rencontres › « Créer la rencontre » (l.2121) [A+B] | soutient |  |
| Q1-22 | ✔ Labo › Suivi longitudinal › « Ajouter » un résultat ultérieur (l.2380-2383) [A+B] | soutient |  |
| Q1-25 | ✔ Conception › Pratiques › « Importer des pratiques (JSON) » (l.1272-1277) [A+B]<br>✔ Conception › Pratiques › « Importer un partage (.lcz) » (l.1279-1281) [A+B]<br>✔ Réglages › « Ouvrir un Codex… » (l.2455-2470) [A+B]<br>✔ Réglages › Partage entre collègues (l.2540-2554) [A+B]<br>✔ Labo › Bandeau « Codex data chargé » (l.2393-2402) [A+B]<br>✔ Cadre › Cours et services › « Importer des cours » (l.364) [B] | soutient |  |
| Q1-26 | ✔ Labo › Outils d'observation › cases à cocher (l.2194) [A]<br>◐ Réglages › Préférences › case chronomètre (l.2421) [A]<br>◐ Labo › Rythme de travail › tableau des durées (l.2275) [B] | soutient en partie | Les passages cités montrent l'option (chronoEvaluation:false par défaut) et le calcul des durées ; la condition « seulement si activé » est écrite en l.2267 (« Active le chronomètre dans les préférences… ») et l.2423, que ni A ni B ne citent ici. Durées observées injectées en mode démo (l.2273). |
| Q1-31 | ✔ Suivi › Rencontres › « Créer mon service d'orthopédagogie » (l.2105-2115) [A+B]<br>✔ Cadre › Cours et services › nature « Orthopédagogie » (l.351-353) [B] | soutient | DA provisoire = « 9 » + (Date.now()+compteur) mod 1 000 000 (l.2110). |
| Q1-32 | ✔ Aide contextuelle (l.149) [A]<br>✔ Accueil › Données démo, activation (l.214) [B]<br>✔ Chargement › demo-namespace.js (l.2629) [A]<br>✘ Chargement › securite-prefs.js (l.2631) [B]<br>✔ Modules sans élément interactif › pack-demo-10.js (l.2731) [B] | soutient | B cite l.2631 pour le pack de démonstration ; ce passage décrit securite-prefs.js (persistance FSAPI), non le pack. |
| Q1-33 | ✔ Conception › Pratiques › « Partir d'un modèle » (l.1129) [A+B]<br>✔ Conception › Pratiques › Bibliothèque (l.1237) [B]<br>✔ Conception › Grilles › Bibliothèque (l.934) [A]<br>◐ Conception › Carte › Bibliothèque › « Ajouter » (l.641-644) [B] | soutient | l.644 montre l'ajout d'une carte de démonstration, non d'un « gabarit d'alignement ». |
| Q1-36 | ✔ Conditions d'observation › Réseau (l.12) [A+B]<br>✔ Chargement › Vérification de version distante (l.2677-2685) [A+B] | soutient | l.2681 observe trois requêtes (≈30 s, +5 min, +10 min) avec une horloge simulée ; l.2846 précise que, hors simulation, seule la requête de 30 s a été observée. |
| Q1-38 | ✔ Conditions d'observation › Réseau (l.12) [B]<br>✔ Évaluation › Préparer et importer › zone de dépôt (l.1561-1571) [A]<br>✔ Labo › Bilan réflexif › Importer les résultats (l.2355-2356) [A] | soutient en partie | Les passages montrent l'entrée par gestes de l'enseignant·e ; l'absence d'écran destiné à l'étudiant·e n'est affirmée par aucun passage (déduite du silence). |
| Q1-40 | ✔ Cadre › Groupe d'étudiant·es › « Prévisualiser » (l.387) [A]<br>✔ Cadre › Groupe d'étudiant·es › refus du DA (l.394) [A+B]<br>✔ Cadre › Groupe d'étudiant·es › « + Nouveau groupe » (l.409) [A+B]<br>✔ Évaluation › Préparer et importer › format LÉA (l.1568) [A+B]<br>✔ Évaluation › Exporter et archiver › encart « Export Léa » (l.1704) [B]<br>✔ Cadre › Cours et services › « Créer le cours » (l.341) [A]<br>✔ Conception › Grilles › critère algorithmique, projection EUF (l.922) [A] | soutient |  |

### Appuis — Q2. Ce que le programme produit, et à qui chaque production est montrée ou destinée

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q2-01 | ✔ Conditions d'observation › Réseau (l.12) [A+B]<br>✔ Ce qui se produit sans geste › Suivi › Saisie des présences… (l.2805) [A+B]<br>✔ Chargement › Séquence de chargement, CSP (l.2595) [A] | soutient | Observé sur 127.0.0.1 (l.8) ; l.12 note aussi l'absence de XMLHttpRequest, WebSocket, sendBeacon dans le code. Voir Q9-05. |
| Q2-03 | ✔ Suivi › Suivi du groupe › affichage (l.1785-1789) [A+B] | soutient |  |
| Q2-04 | ✔ Suivi › Suivi du groupe › « Détails » (l.1795-1805) [A+B] | soutient |  |
| Q2-05 | ✔ Suivi › Liste › affichage (l.1860-1870) [A+B] | soutient |  |
| Q2-06 | ✔ Suivi › Profil › Accompagnement (l.1933) [A+B]<br>✔ Suivi › Profil › Engagement ACP (l.1929) [A] | soutient |  |
| Q2-07 | ✔ Évaluation › Évaluer › « Évaluer » (l.1442) [A+B]<br>✔ Évaluation › Évaluer › listes de niveau (l.1451) [A+B]<br>✔ Évaluation › Évaluer › « Copier » (l.1500-1501) [A+B]<br>✔ Évaluation › Évaluer › « Copier tout » (l.1508-1509) [A] | soutient | Le destinataire est une inférence : les passages montrent le « tu » (« Bonjour Testeur ! ») sans nommer qui reçoit le texte. |
| Q2-08 | ✔ Évaluation › Liste › « Dossier PDF » (l.1357) [A+B] | soutient |  |
| Q2-09 | ✔ Évaluation › Exporter et archiver › encart « Export Léa » (l.1704) [A+B]<br>✔ Évaluation › Exporter et archiver › « Exporter pour Léa » (l.1733) [A+B] | soutient en partie | Libellé et fichier observés ; le passage ne dit pas qui reçoit le fichier. |
| Q2-11 | ✔ Évaluation › Export des résultats › « Exporter la synthèse (CSV) » (l.1425-1433) [A+B]<br>✔ Suivi › Suivi du groupe › « Exporter la synthèse (CSV) » (l.1850) [A] | soutient | Le destinataire n'est dit nulle part (les deux lectures l'écrivent H). |
| Q2-12 | ◐ Suivi › Saisie des présences › « Rapport » › « Générer le PDF » (l.2046-2048) [A+B] | soutient en partie | Cases par défaut : DA non, Programme oui, Services adaptés oui (l.2046) ; la mention « avec DA » de A dépend de l'option. |
| Q2-13 | ✔ Suivi › Profil › Rapport › « Copier » (l.1952-1957) [A+B] | soutient |  |
| Q2-17 | ✔ Labo › Bilan réflexif › Rapport d'analyse (l.2366) [A+B]<br>✔ Labo › Bilan réflexif › « Exporter en PDF » (l.2367) [A+B]<br>✔ Labo › Bilan réflexif › Rapport d'analyse, état dérivé (l.2364) [B] | soutient | Rapport observé sur des résultats écrits par le banc d'essai, les deux voies d'import échouant (l.2364). |
| Q2-18 | ✔ Conception › Productions › Bibliothèque › Exporter (l.867) [A+B]<br>✔ Conception › Grilles › Bibliothèque › Exporter (l.937) [A+B]<br>✔ Conception › Cartouches › Bibliothèque › Exporter (l.1058) [A+B]<br>✔ Conception › Pratiques › « Exporter toutes mes pratiques » (l.1263-1265) [A+B]<br>✔ Évaluation › Annoter › « Exporter mes tampons » (l.1687) [A+B]<br>✔ Conception › Carte › Bibliothèque › « Exporter » (l.635-637) [A]<br>✔ Réglages › « Exporter ma config » (l.2447-2450) [A] | soutient en partie | Contenu (nom, courriel, institution, licence) observé. Aucun passage ne nomme les collègues comme destinataires ; A donne O à ce destinataire, B I. |
| Q2-19 | ✔ Conception › Pratiques › « Exporter pour partager » (l.1269-1270) [B]<br>✔ Réglages › Partage entre collègues (l.2541) [B]<br>✔ Conception › Pratiques › « Importer un partage (.lcz) » (l.1280-1281) [A] | soutient | algorithme « ECDSA-P256-SHA-256 » (l.2541). |
| Q2-20 | ✔ Réglages › « Générer l'export anonymisé » (l.2492-2496) [A+B] | soutient | Contenu : id_anonyme, programme, services_adaptes, resultats_ulterieurs (l.2494) ; fichier PRIVE (l.2495). A ajoute « rangé sous l'accordéon captures-recherche » : introuvable aux lignes citées (l.2490-2496) ; l.2475-2476 ne donne que l'état de l'accordéon. |
| Q2-22 | ✔ Réglages › « Ouvrir un Codex… » (l.2468) [A+B]<br>✔ Réglages › « Ouvrir un Codex… » (l.2470) [B]<br>✔ Accueil › rappel « Mettre à jour le codex » (l.190) [A] | soutient |  |
| Q2-23 | ✔ En-tête › Signaler un bug (l.94-96) [A+B]<br>✔ En-tête › Signaler un bug › « Copier le rapport » (l.102) [A+B]<br>✔ En-tête › Signaler un bug › « Envoyer par courriel » (l.104-105) [A+B]<br>✔ Chargement › Écouteurs globaux (l.2710) [B]<br>✘ En-tête › Signaler un bug › « Enregistrer en TXT » (l.103 ; Non observé, l.2835) [B] | soutient | B écrit « enregistré en TXT » : l.103 renvoie à « Non observé » et le clic n'a produit aucun fichier (l.2835). |
| Q2-24 | ✔ En-tête › « Soutenir » (l.108-111) [A+B] | soutient |  |
| Q2-25 | ✔ Suivi › Animation › « Tirer ! » (l.2139-2143) [A+B]<br>✔ Suivi › Animation › Questions flash (l.2154-2172) [A]<br>✔ Suivi › Animation › Équipes (l.2175-2182) [A+B] | soutient en partie | Fonctions observées ; aucun passage ne dit à qui l'écran est montré (classe, projection). |
| Q2-26 | ✔ Labo › Rythme de travail › « Portrait temporel » (l.2278) [A+B]<br>✔ Labo › Rythme de travail › rappels d'hygiène (l.2279) [A+B]<br>✔ Accueil › rappel « Mets ton codex à jour » (l.187-192) [B] | soutient | Portrait observé en mode démo avec durées injectées (l.2273) ; rappels de pause lus dans le code (appel direct sans message, l.2279). |
| Q2-28 | ✔ Conditions d'observation › Réseau (l.12) [A]<br>✔ Évaluation › Exporter et archiver › « Exporter pour Léa » (l.1733) [A+B] | soutient en partie | L'absence de canal intégré est une inférence ; B ne cite aucun passage pour cette phrase. |

### Appuis — Q3. Ce que le programme garde, et ce qu'il garde sans jamais le montrer

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q3-01 | ✔ Stockage, vue d'ensemble (l.39) [A+B]<br>✔ Évaluation › Préparer et importer › stockage (l.1595) [A] | soutient |  |
| Q3-03 | ✔ Cadre › Groupe d'étudiant·es › « Confirmer » (l.391) [A+B]<br>✔ Cadre › Groupe d'étudiant·es › « Ajouter un·e étudiant·e » (l.395-396) [A+B]<br>✔ Cadre › Groupe d'étudiant·es › menu « Remarque » (l.406) [B] | soutient |  |
| Q3-04 | ✔ Suivi › Préalables (l.1754) [A]<br>✔ Suivi › Saisie des présences (l.1981) [A]<br>✔ Suivi › Saisie des présences › champ de périodes (l.1987) [B] | soutient |  |
| Q3-05 | ✔ Évaluation › Évaluer › listes de niveau (l.1454) [A+B]<br>✔ Évaluation › Liste › « Journal » (l.1351) [A+B]<br>✔ Évaluation › Évaluer › « Verrouiller » (l.1458) [A]<br>✔ Évaluation › Évaluer › Intégrité (l.1477) [B] | soutient |  |
| Q3-07 | ✔ Évaluation › Préparer et importer › stockage (l.1595-1596) [A+B]<br>✔ Évaluation › Annoter › stylo (l.1668) [A+B] | soutient |  |
| Q3-08 | ✔ Suivi › Profil › « Confidentiel » (l.1945) [A+B] | soutient |  |
| Q3-09 | ✔ Suivi › Interventions › « Créer l'intervention » (l.2070) [A+B]<br>✔ Suivi › Interventions › Bilan (l.2080) [B] | soutient |  |
| Q3-10 | ✔ Suivi › Préalables (l.1754, 1768) [A]<br>✔ Suivi › Suivi du groupe › affichage (l.1784) [B]<br>✔ Ce qui se produit sans geste › Suivi (l.2784) [A]<br>✔ Chargement › Code exécuté, indices.js (l.2634) [B] | soutient |  |
| Q3-11 | ✔ Labo › Suivi longitudinal (l.2373) [A]<br>✔ Labo › Suivi longitudinal › « Inscrire au registre » (l.2377) [A+B] | soutient | La copie contient évaluations, présences, interventions, captures et indices (l.2377). |
| Q3-12 | ✔ Ce qui se produit sans geste › Suivi (l.2791) [A+B] | soutient | Passage « lu dans le code » ; une capture du 2026-10-12 existait dans l'état de base. |
| Q3-14 | ✔ Cadre › Cours et services › « Supprimer » (l.356) [A+B]<br>✔ Cadre › Enseignant·e › « Supprimer » (l.379) [A]<br>✔ Cadre › Groupe d'étudiant·es › « Supprimer » (l.399) [A+B]<br>✔ Conception › Productions › « Supprimer » (l.845) [A]<br>✔ Conception › Grilles › « Supprimer » (l.928) [B]<br>✔ Évaluation › Liste › « Supprimer l'évaluation » (l.1361) [A+B]<br>✔ Évaluation › Annoter › « Effacer tout » (l.1677) [A]<br>✔ Suivi › Saisie des présences › « ↻ » (l.2003) [A]<br>✔ Suivi › Interventions › « Supprimer » (l.2091) [A+B] | soutient |  |
| Q3-15 | ✔ Cadre › Trimestre › « Supprimer… » (l.318-320) [A+B]<br>✔ Cadre › Groupe d'étudiant·es › « Supprimer un groupe… » (l.413) [A+B]<br>✔ Cadre › Groupe-cours › « Supprimer » (l.439) [A]<br>✔ Réglages › Boutons « Supprimer » une ressource (l.2518-2519) [A]<br>✔ Réglages › « Réinitialiser toutes les données » (l.2532-2536) [A+B] | soutient |  |
| Q3-17 | ✔ Cadre › Cours et services › « Supprimer » (l.355) [A+B] | soutient |  |
| Q3-19 | ✔ Cadre › Trimestre › identification (l.307) [A+B] | soutient |  |
| Q3-20 | ✔ Cadre › Groupe d'étudiant·es › « Supprimer » (l.399) [A+B] | soutient | La clé n'apparaît ailleurs qu'en l.280 (liste de clés) ; aucun écran qui la lit n'est décrit. |
| Q3-22 | ✔ Réglages › « Générer l'export anonymisé » (l.2492) [A+B] | soutient |  |
| Q3-24 | ✔ En-tête › Signaler un bug (l.94) [A+B]<br>✔ Chargement › Code exécuté au chargement, rapport-bug.js (l.2625) [A+B]<br>✔ Ce qui se produit sans geste › En-tête, Accueil et Aide (l.2739) [A+B]<br>✔ Chargement › Écouteurs globaux (l.2710) [A+B] | soutient |  |
| Q3-25 | ✔ Réglages › « Ouvrir un Codex… » (l.2468) [A+B]<br>✔ Accueil › « Mettre à jour le codex » (l.190) [B] | soutient |  |
| Q3-27 | ✔ Réglages › « Ouvrir un Codex… » (l.2469) [A+B] | soutient |  |
| Q3-29 | ✔ En-tête › Signaler un bug › « Copier le rapport » (l.102) [A+B]<br>✔ En-tête › Signaler un bug › « Envoyer par courriel » (l.104) [A]<br>✔ En-tête › Signaler un bug › rapports archivés (l.106) [B] | soutient |  |
| Q3-30 | ✔ Conception › Pratiques › « Importer un partage (.lcz) » (l.1281) [A+B]<br>✔ Réglages › Partage entre collègues (l.2548-2552) [A+B] | soutient |  |
| Q3-34 | ✔ Labo › Modélisation (l.2237) [A+B] | soutient |  |
| Q3-35 | ✔ Conception › Pratiques › « Supprimer » (l.1230) [A+B]<br>✔ Cadre › Horaire › « Supprimer » (l.426) [A+B] | soutient |  |
| Q3-37 | ✔ Évaluation › « Consulter » (l.1466) [A+B]<br>✔ Évaluation › « Consulter » une évaluation non verrouillée (l.1483) [B]<br>✔ Suivi › Profil (l.1930) [A+B] | soutient |  |

### Appuis — Q4. Ce que le programme rend facile, et ce qu'il rend difficile

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q4-01 | ✔ Évaluation › Évaluer › listes de niveau (l.1454) [A+B]<br>✔ Suivi › Saisie des présences › champ de périodes (l.1987) [A+B] | soutient |  |
| Q4-03 | ✔ Suivi › Suivi du groupe › affichage (l.1784) [A+B]<br>✔ Ce qui se produit sans geste › Suivi (l.2784) [A]<br>✔ Chargement › Code exécuté, indices.js (l.2634) [B] | soutient |  |
| Q4-05 | ✔ Accueil › rappel « Mets ton codex à jour » (l.188-192) [A+B] | soutient |  |
| Q4-07 | ✔ Suivi › Saisie des présences › affichage initial (l.1983) [A+B] | soutient |  |
| Q4-10 | ✔ Suivi › Saisie des présences › « Verrouiller » (l.2015) [A+B] | soutient |  |
| Q4-11 | ✔ Suivi › Saisie des présences › affichage initial (l.1983) [A+B]<br>✔ Suivi › Saisie des présences › « Précédent / Suivant » (l.2021) [A+B] | soutient | l.2021 : « Une séance non saisie n'entre pas dans le taux : 2026-10-07 affiche 100 % ». |
| Q4-13 | ✔ Évaluation › Évaluer › « Évaluer » (l.1442) [A+B] | soutient |  |
| Q4-14 | ✔ Évaluation › Évaluer › listes de niveau (l.1448-1453) [A+B] | soutient |  |
| Q4-15 | ◐ Évaluation › Évaluer › « Évaluer » et listes de niveau (l.1439-1458) [A+B] | soutient en partie | Les gestes sont décrits ; le décompte « 7 à 8 gestes » est celui de B, il n'est pas écrit dans le passage. |
| Q4-18 | ✔ En-tête › Panneau de visite (l.128) [A]<br>✘ Écran Aide (l.231-262) [B] | soutient | B cite l'écran Aide pour « visite guidée » ; ces lignes décrivent l'Aide (73 cartes, guides l.259), non la visite. |
| Q4-24 | ✔ Évaluation › Évaluer › listes de niveau (l.1449-1450) [A+B] | soutient |  |
| Q4-25 | ✔ Suivi › Préalables (l.1769) [A+B]<br>◐ Évaluation › Export des résultats › CSV (l.1430) [A] | soutient | l.1430 montre « non constructible » pour des évaluations non verrouillées ou au statut plagiat, la pratique SOM étant appliquée ; la cause « sans pratique » est en l.1769. |
| Q4-29 | ✔ Évaluation › Évaluer › listes de niveau (l.1454) [A+B]<br>✔ Cadre › Cours et services › « Supprimer » (l.355-356) [A+B]<br>✔ Réglages › « Réinitialiser toutes les données » (l.2532-2536) [A+B] | soutient | La comparaison de coût est une inférence ; les gestes qu'elle compare sont dans les passages. |
| Q4-32 | ✔ Évaluation › Évaluer › « Verrouiller » (l.1461) [A+B] | soutient |  |
| Q4-33 | ✔ Conception › Productions › tri (l.837) [A+B] | soutient |  |
| Q4-34 | ✔ Conception › Carte › Corbeille (l.706) [A+B] | soutient |  |
| Q4-35 | ✔ Labo › Bilan réflexif › Importer les résultats (l.2358-2359) [A+B] | soutient |  |
| Q4-40 | ✔ Réglages › « Générer l'export anonymisé » (l.2491) [A+B] | soutient |  |
| Q4-41 | ✔ Ce qui n'a pas pu être observé › Réglages (l.2967-2970) [A+B]<br>✔ Ce qui n'a pas pu être observé › Cadre (l.2851-2852) [A] | soutient |  |

### Appuis — Q5. Ce que le programme calcule, compte ou classe, et à partir de quoi

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q5-01 | ✔ Évaluation › Liste › grille de départ (l.1301) [A]<br>✔ Évaluation › Évaluer › listes de niveau (l.1451) [A+B] | soutient |  |
| Q5-02 | ✔ Évaluation › Liste › état de la liste (l.1317) [A+B]<br>✔ Évaluation › Liste › affichage du tableau (l.1312) [A]<br>✔ Évaluation › Évaluer › Intégrité (l.1476) [B] | soutient |  |
| Q5-05 | ✔ Cadre › Trimestre › « Créer le trimestre » (l.301) [A]<br>✔ Cadre › Trimestre › champs de dates (l.324) [A]<br>✔ Cadre › Trimestre › journées sans cours (l.330-332) [A]<br>✔ Cadre › Horaire › « Créer l'horaire » (l.421) [A+B] | soutient |  |
| Q5-07 | ✔ Conception › Carte › badges des blocs (l.510-511) [A+B]<br>✔ Conception › Carte › champ durée (l.527) [A+B]<br>✔ Conception › Carte › inspecteur (l.565) [B]<br>✔ Conception › Carte › planificateur (l.763) [A] | soutient |  |
| Q5-08 | ✔ Conception › Productions › « Créer la production » (l.808) [A+B]<br>✔ Conception › Grilles › critères en création (l.892) [A]<br>✔ Conception › Grilles › modification (l.905) [A]<br>✔ Conception › Pratiques › éditeur (l.1192) [B] | soutient |  |
| Q5-09 | ✔ Suivi › Préalables (l.1755) [A+B]<br>✔ Suivi › Saisie des présences › « Précédent / Suivant » (l.2021) [A+B]<br>✔ Suivi › Saisie des présences › champ de périodes (l.1988) [B] | soutient |  |
| Q5-10 | ✔ Suivi › Préalables (l.1769) [A+B]<br>✔ Suivi › Suivi du groupe › note d'aide des indicateurs (l.1825) [A+B]<br>✔ Suivi › Profil › Engagement ACP (l.1929) [A] | soutient |  |
| Q5-11 | Suivi › Suivi du groupe › note d'aide des indicateurs (l.1825) : « C = (travaux remis / travaux réalisés) × 100 » [A+B] — soutient B ; ne soutient pas A<br>Suivi › Préalables (l.1769) : renvoie à calculerCompletion, sans formule [A+B] — soutient en partie A et B<br>Suivi › Profil › Engagement ACP (l.1929) : « Productions remises : 2/2 » ; « 1/2 … 1 production non remise ou non recevable » [A] — soutient en partie A | soutient en partie | L'observation ne fixe pas un dénominateur unique : la note d'aide dit « réalisés », le profil compte la production non remise dans le dénominateur. Non départagé. |
| Q5-12 | ✔ Suivi › Préalables (l.1769) [A+B]<br>✔ Suivi › Profil › note provisoire (l.1924-1928) [A+B]<br>✔ Conception › Pratiques › assistant, récapitulatifs (l.1105, 1114) [B] | soutient |  |
| Q5-13 | ✔ Suivi › Suivi du groupe › affichage (l.1787-1788) [A+B]<br>✔ Suivi › Liste › affichage (l.1869-1870) [A+B] | soutient |  |
| Q5-14 | ✔ Suivi › Suivi du groupe › affichage (l.1787) [A+B] | soutient |  |
| Q5-15 | ✔ Suivi › Suivi du groupe › affichage (l.1787-1788) [A+B] | soutient |  |
| Q5-16 | ✔ Suivi › Suivi du groupe › affichage (l.1789) [A+B]<br>✔ Suivi › Liste › affichage (l.1870) [A]<br>✔ Labo › Outils d'observation › seuils (l.2200-2203) [A+B] | soutient |  |
| Q5-17 | ✔ Cadre › Groupe d'étudiant·es › menu « Remarque » (l.406) [A+B]<br>✔ Suivi › Liste › affichage (l.1870) [A] | soutient |  |
| Q5-18 | ✔ Suivi › Suivi du groupe › « Détails » (l.1803-1804) [A+B] | soutient | l.1804 : « Suivi → ipb × 30 + 20/10 selon direction » ; B écrit « indice × 30 ». |
| Q5-20 | ✔ Labo › Exploration des pratiques (l.2244-2251) [A+B] | soutient |  |
| Q5-21 | ✔ Labo › Études (l.2286-2292) [A+B] | soutient | Observé en mode démo ou avec un codex data chargé (l.2286, 2398). |
| Q5-23 | ✔ Labo › Bilan réflexif › Rapport d'analyse (l.2366) [A+B] | soutient | « signal fort si favorable ≥ 80 % » (l.2366). |
| Q5-24 | ✔ Labo › Rythme de travail (l.2275-2278) [A+B] | soutient | Observé avec des durées injectées en mode démo (l.2273). |
| Q5-25 | ✔ Réglages › « Générer l'export anonymisé » (l.2494) [A+B]<br>✔ Réglages › « Générer l'export anonymisé » (l.2496) [A] | soutient |  |
| Q5-26 | ✔ Suivi › Animation › « Tirer ! » (l.2140) [A+B]<br>✔ Suivi › Animation › Équipes (l.2176-2180) [A+B] | soutient |  |
| Q5-27 | ✔ Suivi › Suivi du groupe › affichage (l.1790) [A+B]<br>✔ Suivi › Suivi du groupe › sélecteur « Mesure » (l.1833) [A]<br>✔ Ce qui se produit sans geste › Suivi (l.2789) [A+B] | soutient |  |
| Q5-28 | ✔ Suivi › Suivi du groupe › affichage (l.1787-1789) [A+B]<br>✔ Suivi › Liste › affichage (l.1863-1866) [A]<br>✔ Suivi › Profil › Accompagnement (l.1933) [A] | soutient |  |

### Appuis — Q6. La finalité que ces régularités révèlent

Les deux phrases de finalité sont évaluées par composantes : celles que les deux lectures partagent (Q6-01 à Q6-07, Q6-11) et celles qui sont propres à l'une (Q6-04, Q6-08, Q6-09, Q6-10, Q6-12, marquées « seule »). Les finalités présentées comme compatibles sont évaluées en Q6-13 à Q6-18. Pour toutes, `observation.md` ne dit rien de l'intention (l.3) : les passages ne peuvent établir que les faits sur lesquels chaque finalité s'appuie.

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q6-01 | ✔ Conditions d'observation › Réseau (l.12) [A+B]<br>✔ Ce qui se produit sans geste › Suivi › Saisie des présences… (l.2805) [B] | soutient en partie | L'absence d'autre utilisateur ou d'écran partagé n'est affirmée par aucun passage ; voir Q1-38. |
| Q6-02 | ✔ Suivi › Liste › affichage (l.1863-1866) [A]<br>✔ Évaluation › Évaluer › listes de niveau (l.1454) [A]<br>✔ Suivi › Saisie des présences (l.1981) [B]<br>✔ Labo › Suivi longitudinal (l.2377) [A+B] | soutient |  |
| Q6-03 | ✔ Suivi › Saisie des présences (l.1985-1987) [A+B]<br>✔ Évaluation › Évaluer › listes de niveau (l.1446-1454) [A+B]<br>✔ Évaluation › Préparer et importer (l.1561-1571) [A] | soutient |  |
| Q6-04 (A seule) | ✔ Évaluation › Évaluer › listes de niveau (l.1451) [A]<br>✔ Ce qui se produit sans geste › Suivi (l.2784) [A]<br>✔ Ce qui se produit sans geste › Suivi (l.2791) [A] | soutient en partie | La conversion automatique de la saisie en note, rétroaction et indices est dans les passages ; que ces notes et rétroactions soient « à rendre » (leur destinataire) n'y est pas observé (voir Q9-03). |
| Q6-05 | ✔ Suivi › Suivi du groupe › affichage (l.1784-1789) [A+B]<br>✔ Ce qui se produit sans geste › Suivi (l.2784) [A]<br>✔ Suivi › Profil › Accompagnement (l.1933) [A+B] | soutient |  |
| Q6-06 | ✔ Suivi › Suivi du groupe › « Détails » (l.1795-1805) [A+B]<br>✔ Suivi › Profil › Accompagnement (l.1933) [A+B]<br>✔ Suivi › Interventions (l.2062-2091) [B]<br>✔ Suivi › Interventions › Complétée (l.2081) [A] | soutient en partie | Fonctions et libellés observés ; que le classement « oriente des décisions » n'est pas observé (voir Q9-02). |
| Q6-07 | ✔ Conditions d'observation › Réseau (l.12) [A+B]<br>✔ Cadre › Groupe d'étudiant·es › « Supprimer un groupe… » (l.413) [A]<br>✔ Réglages › « Réinitialiser toutes les données » (l.2533) [A]<br>✔ Labo › Suivi longitudinal (l.2373) [A]<br>✔ Accueil › rappel « Mets ton codex à jour » (l.187-192) [B] | soutient en partie | Les faits sont dans les passages ; la comparaison « bien plus que » (A) et « ce que le programme protège le plus » (B) n'y est pas écrite. |
| Q6-08 (A seule) | ✔ Évaluation › Évaluer › « Évaluer » (l.1442) [A]<br>✔ Évaluation › Exporter et archiver › « Exporter pour Léa » (l.1733) [A]<br>✔ Évaluation › Liste › « Dossier PDF » (l.1357) [A]<br>✔ En-tête › Panneau de visite (l.128) [A]<br>✔ En-tête › Barre de navigation principale (l.51) [A] | soutient en partie | Les faits (sélecteurs préremplis, PDF, ordre de la visite, bandeau de l'Évaluation) sont dans les passages ; la comparaison « la plus outillée », « le parcours le plus court » n'y est pas écrite. |
| Q6-09 (A seule) | ✔ Conception › Pratiques › « Exporter pour partager » (l.1267-1270) [A]<br>✔ Réglages › « Exporter ma config » (l.2447) [A]<br>✔ Réglages › « Générer l'export anonymisé » (l.2494) [A]<br>✔ Réglages › « Extraire un codex data… » (l.2583) [A] | soutient en partie | Les exports de matériel (signés, sous licence, métadonnées préremplies) et les exports de données d'étudiant·es (anonymisé ; avertissement « Ne le partage pas tel quel ») sont observés ; que la circulation du matériel soit « encouragée » est une inférence. |
| Q6-10 (B seule) | ✔ Suivi › Interventions (l.2062-2091) [B]<br>✔ Labo › Suivi longitudinal (l.2371-2389) [B]<br>✔ Suivi › Suivi du groupe › affichage (l.1790) [B]<br>✔ Labo › Études (l.2286) [B] | soutient | B donne O aux fonctions et I à l'enchaînement ; les fonctions sont dans les passages. |
| Q6-11 | ✔ Labo › Rythme de travail (l.2262-2279) [B]<br>✔ Labo › Bilan réflexif (l.2298-2369) [B]<br>✔ Labo › Bilan réflexif › Auto-réflexion (l.2348) [A]<br>✔ Labo › Rythme de travail (l.2278-2279) [A] | soutient |  |
| Q6-12 (B seule) | ✔ Suivi › Suivi du groupe › affichage (l.1784) [B]<br>✔ Suivi › Suivi du groupe › « Détails » (l.1795-1805) [B]<br>✔ Suivi › Profil › Accompagnement (l.1933) [B] | soutient en partie | Le calcul des classes de besoin et du score d'urgence a lieu à l'affichage de l'écran (l.1784) ; « sans que l'enseignant·e les demande » n'est pas écrit tel quel (l'écran est ouvert par un geste). |
| Q6-13 | ✔ En-tête › Panneau de visite (l.128) [A]<br>✔ Évaluation › Exporter et archiver › « Exporter pour Léa » (l.1733) [A+B]<br>✔ Évaluation › Liste › « Dossier PDF » (l.1357) [A]<br>✔ Conception › Carte › « Exporter le plan… » (l.588-604) [A]<br>✔ Évaluation › Export des résultats › « Exporter la synthèse (CSV) » (l.1425-1433) [B]<br>✔ Suivi › Saisie des présences › affichage initial (l.1983) [B] | soutient en partie | Les fonctions sont observées ; qu'elles soient la finalité n'est dit nulle part (l.3). |
| Q6-14 | ✔ Ce qui se produit sans geste › Suivi (l.2784) [A]<br>✔ Suivi › Suivi du groupe › « Détails » (l.1803) [A]<br>✔ Suivi › Profil › « Confidentiel » (l.1946) [A]<br>✔ Labo › Suivi longitudinal (l.2373) [A]<br>✔ Labo › Outils d'observation › cases à cocher (l.2194) [A]<br>✔ Suivi › Profil › Accompagnement (l.1933) [A]<br>✔ Suivi › Suivi du groupe (l.1789, 1804) [B]<br>✔ Suivi › Interventions (l.2062-2091) [B] | soutient en partie | Même réserve : fonctions observées, finalité non dite. l.1933 note aussi « Aucune grille de critères n'est désignée pour le dépistage ». |
| Q6-15 | ✔ Conception › Pratiques › assistant (l.1094-1136) [A]<br>✔ Conception › Pratiques › guide (l.1089) [A]<br>✔ Labo › Exploration des pratiques (l.2244, 2249) [A]<br>✔ Réglages › À propos, liens (l.2588) [A]<br>✔ Conception › Pratiques › assistant (l.1094-1148) [B]<br>✔ Labo › Exploration des pratiques (l.2240-2260) [B]<br>◐ Écran Aide (l.231-262) [B] | soutient en partie | Les guides et l'aide sont des sorties du programme, non des preuves de finalité. l.231-262 décrivent l'Aide (73 cartes, guides l.259) mais pas la « visite guidée » que B y rattache. |
| Q6-16 | ✔ Labo › Études (l.2283-2293) [A]<br>✔ Réglages › « Générer l'export anonymisé » (l.2494) [A]<br>✔ Labo › Bandeau « Codex data chargé » (l.2393-2398) [A]<br>✔ Labo › Suivi longitudinal (l.2380) [A]<br>✔ Labo › Bilan réflexif (l.2301-2366) [A]<br>✔ Labo › Études (l.2281-2296) [B]<br>✔ Réglages › « Générer l'export anonymisé » (l.2490) [B]<br>✔ Labo › Suivi longitudinal (l.2371) [B] | soutient en partie | Fonctions observées ; l.2293 (« pistes de réflexion, pas des preuves ») est une sortie du programme ; la remise à des chercheur·es n'est pas observée. |
| Q6-17 | ✔ Réglages › Partage entre collègues (l.2541) [A]<br>✔ Conception › Carte › Bibliothèque (l.631) [A]<br>✔ En-tête › « Soutenir » (l.109) [A+B]<br>✔ En-tête › Signaler un bug › « Envoyer par courriel » (l.104) [A]<br>✔ Conception › Pratiques › « Exporter pour partager » (l.1269) [B]<br>✔ Réglages › Partage entre collègues (l.2540-2554) [B]<br>✔ Réglages › À propos, liens (l.2588) [B] | soutient en partie | Fonctions et liens observés ; la finalité n'est pas dite. |
| Q6-18 | — (aucun passage cité) | introuvable | Ni A ni B ne citent de passage pour cette phrase. |

### Appuis — Q7. À quoi le programme sert, pour chacune des personnes qu'il touche

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q7-01 | ✔ Évaluation › Évaluer › « Évaluer » (l.1442-1454) [A+B]<br>✔ Suivi › Liste › affichage (l.1863-1870) [A+B]<br>✔ Suivi › Profil › Accompagnement (l.1933) [A+B]<br>✔ Accueil › rappel « Mets ton codex à jour » (l.187-192) [B] | soutient | A et B renvoient à leurs propres sections (1-5) ; les passages sont repris de ces sections. |
| Q7-02 | ✔ Labo › Rythme de travail (l.2275-2278) [A]<br>✔ Labo › Rythme de travail (l.2262-2369) [B] | soutient |  |
| Q7-08 | — (aucun passage cité) | introuvable | Aucun passage cité à cet endroit ; voir Q1-38 pour l'absence d'écran étudiant. |
| Q7-09 | ✔ Suivi › Profil › « Confidentiel » (l.1945-1946) [A+B] | soutient | Catégories « apprentissage » (Dyslexie…), sensorielle, neurologique, organique, santé mentale ; parcours « Échec », « Abandon ». |
| Q7-13 | ✔ Accueil › Données démo, activation (l.214) [A+B] | soutient |  |
| Q7-21 | ✔ Conditions d'observation › Exécution (l.8) [A]<br>✔ Chargement › Minuteries récurrentes (l.2667) [A]<br>✔ Conditions d'observation › Réseau (l.12) [B] | soutient en partie | La requête toutes les 5 min est observée ; que l'hébergeur la voie et en fasse quelque chose est une hypothèse hors passages. |
| Q7-22 | ✔ Réglages › « Générer l'export anonymisé » (l.2490-2496) [A+B]<br>✔ Réglages › « Extraire un codex data… » (l.2583) [A]<br>✔ Labo › Études (l.2283) [A] | soutient en partie | Contenu des exports observé ; aucune remise à des chercheur·es n'est observée. |

### Appuis — Q8. Contradictions relevées par A et par B

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q8-01 | ✔ Suivi › Profil › « Confidentiel » (l.1944) [A+B]<br>✔ Réglages › « Ouvrir un Codex… » (l.2468) [A+B]<br>✔ Réglages › « Extraire un codex data… » (l.2583) [A] | soutient | l.2468 : « pas de chiffrement ni de signature » ; 49 clés, sans énumération de leur contenu. |
| Q8-03 | ✔ Conception › Productions › Bibliothèque › Exporter (l.867) [A+B]<br>✔ Conception › Grilles › Bibliothèque › Exporter (l.937) [A+B]<br>✔ Conception › Cartouches › Bibliothèque › Exporter (l.1058) [A+B]<br>✔ Évaluation › Annoter › « Exporter mes tampons » (l.1687) [A+B]<br>✔ Conception › Pratiques › « Exporter toutes mes pratiques » (l.1265) [B]<br>◐ Conception › Pratiques › « Exporter (JSON) » (l.1259) [A]<br>◐ Conception › Échelles › Bibliothèque › Exporter (l.988) [B]<br>◐ Réglages › « Exporter ma config » (l.2448) [A] | soutient | l.1259, 988 et 2448 donnent le nom de fichier « CC-BY-SA » ; la licence « CC BY-NC-SA 4.0 » n'y est pas montrée (elle l'est en l.2449 ; l.988 ne la montre pas). |
| Q8-05 | ✔ Évaluation › Export des résultats › « Exporter la synthèse (CSV) » (l.1433) [A+B] | soutient |  |
| Q8-09 | ✔ Réglages › « Générer l'export anonymisé » (l.2492-2495) [A+B] | soutient | « Aucun DA ni nom présent dans le fichier » (l.2494) ; table PRIVE et clé secrète en clair (l.2495). |

### Appuis — Q9. Ce que l'observation ne permet pas de savoir

| # | Passages dans observation.md (section › geste, ligne, cité par) | Verdict | Note |
|---|---|---|---|
| Q9-01 | ✔ Conditions d'observation › Données (l.9) [A+B]<br>✔ Conditions d'observation › Exécution (l.8) [B] | soutient | Affirmation d'ignorance : aucun passage ne rapporte d'usage réel. |
| Q9-02 | ✔ Conditions d'observation › Données (l.9) [A] | soutient | Affirmation d'ignorance : aucun passage ne rapporte l'usage des classements. |
| Q9-03 | ✔ Évaluation › Exporter et archiver › « Exporter pour Léa » (l.1733) [A] | soutient | Affirmation d'ignorance : le passage montre un fichier téléchargé, aucune remise. |
| Q9-04 | ✔ Réglages › « Générer l'export anonymisé » (l.2490-2497) [A]<br>✔ Réglages › « Extraire un codex data… » (l.2583) [A]<br>✔ Réglages › « Ouvrir un Codex… » (l.2468-2470) [A] | soutient |  |
| Q9-05 | ✔ Conditions d'observation › Exécution (l.8) [A+B]<br>✔ Chargement › Minuteries récurrentes (l.2667) [A]<br>✔ Conditions d'observation › Réseau (l.12) [B] | soutient |  |
| Q9-06 | ✔ Réglages › « Ouvrir un Codex… » (l.2468) [A+B] | soutient |  |
| Q9-07 | ✔ Ce qui n'a pas pu être observé › Cadre (l.2851-2852) [A]<br>✔ Ce qui n'a pas pu être observé › Réglages (l.2967-2970) [A+B] | soutient |  |
| Q9-13 | ✔ Introduction (l.3) [A+B] | soutient |  |

## Tableau récapitulatif

| Groupe | Affirmations | Appui évalué | dont « soutient » | soutient en partie | ne soutient pas | introuvable |
|---|---|---|---|---|---|---|
| Dites par les deux | 142 | 142 | **122** | 18 | 0 | 2 |
| Dites par une seule | 113 (A seule 72, B seule 41) | 5 (composantes de finalité) | **1** | 4 | 0 | 0 |
| Contradictoires | 1 | 1 | **0** | 1 | 0 | 0 |

Les affirmations dites par une seule lecture n'ont pas toutes un appui évalué : la consigne (point 4) ne l'exige que pour les affirmations communes, contradictoires et les formulations de finalité. Seules les cinq composantes de finalité propres à une lecture (Q6-04, Q6-08, Q6-09, Q6-10, Q6-12) l'ont ; les autres affirmations de ce groupe ne sont pas évaluées. Les formulations de finalité communes (Q6-01 à Q6-07, Q6-11, Q6-13 à Q6-18) sont comptées dans la ligne « Dites par les deux ».
