# 3. Glossaire pédagogie ↔ code

> **Statut : BROUILLON du 12 octobre 2026**, rédigé par Claude Code à partir de l'interface
> (`index.html`, `js/`), des contenus d'aide, des skills du projet et de `docs/DATA-OWNERSHIP.md`
> (version 1.199.0). **À corriger par Grégoire Bédard**, en particulier les définitions
> pédagogiques.
>
> **Pour qui** : le développeur qui ne connaît pas la pédagogie (il y trouve le sens des mots
> qu'il lira dans le code) et le pédagogue qui ne connaît pas le code (il y trouve où vit chaque
> notion, et les pièges de vocabulaire).

## Comment lire une entrée

- **Définition** : le sens pédagogique, tel que l'application l'emploie.
- **À l'écran** : le libellé que voit l'utilisateur, entre guillemets français.
- **Dans le code** : les identifiants **stables**, d'abord la clé de stockage (elle voyage dans
  les données des utilisateurs, donc elle ne change pas à la légère), puis la famille de
  fichiers. *(par trimestre)* signifie que la clé est préfixée par l'identifiant du trimestre
  (`h2026_productions`) ; *(commune)* qu'elle vaut pour tous les trimestres. Les noms de
  fonctions ne sont donnés que lorsqu'ils sont centraux.
- **Attention** : écarts de nom, homonymes, idées reçues.
- Les termes marqués **[modèle de l'auteur]** appartiennent à l'instanciation de Grégoire Bédard
  (cours de littérature, critères SRPNF, ELLAC). Ce sont des **exemples**, pas des notions de
  l'application (document 2, P6).

Les identifiants de navigation (sections et sous-sections) sont au document 1, §1.4.

---

## A. Le cadre

### Trimestre
**Définition.** La période d'enseignement (environ quinze semaines) : dates de début et de fin,
congés, journées de reprise. Il génère le calendrier et contient presque toutes les données.
**À l'écran :** « Trimestre » (Cadre › Trimestre) ; sessions « Hiver », « Été », « Automne ».
**Dans le code :** `trimestres` (commune), identifiants `a2025`, `h2026`, `demo`… ;
`js/trimestres.js` (registre et rangement par trimestre), `js/trimestre.js` (génération du
calendrier), `js/trimestre-v2-*.js` (écrans).
**Attention :** « session » sert parfois de synonyme dans les données.

### Clore, trimestre clos
**Définition.** Geler un trimestre terminé : il reste consultable en lecture seule.
**À l'écran :** « Clore », « Rouvrir », bandeau « LECTURE SEULE — Trimestre clos ».
**Dans le code :** `archiverTrimestre`, `desarchiverTrimestre`, champ `trimestre.archive`.
**Attention :** le code dit « archiver » pour ce que l'écran appelle « clore ». **Clore n'est pas
archiver** : archiver, c'est déposer hors du navigateur (voir Archives).

### Cours
**Définition.** Le cours inscrit au programme, avec son code et son titre.
**À l'écran :** « Cours et services » ; nature « Enseignement ».
**Dans le code :** `cours` (commune) ; l'ancienne clé `listeCours` est migrée au chargement ;
`js/cours.js`, `js/entites/cours-entite.js`.
**Attention :** la clé `infoCours` ne désigne pas un cours mais le **contexte actif** (voir
Groupe-cours actif).

### Service
**Définition.** Un accompagnement offert hors d'un cours, comme l'orthopédagogie. Il se
configure à la place d'un cours ; l'horaire y est facultatif.
**À l'écran :** nature « Orthopédagogie » ; sous-section « Rencontres ».
**Dans le code :** `cours.nature === 'service'` ; `js/mots-nature.js` donne les mots affichés
selon la nature.

### Groupe-cours
**Définition.** L'unité de travail : l'assemblage d'un trimestre, d'un cours, d'un numéro de
groupe, d'un horaire et d'un·e enseignant·e, auquel on rattache la pratique de notation.
**À l'écran :** « Groupe-cours ».
**Dans le code :** `groupesCours` (par trimestre), entrées `{id: 'GC_…', coursId, groupeNum,
horaireId, enseignantId, pratiqueId}` ; `js/entites/groupe-cours.js`. **`pratiqueId` est la
seule source de la pratique active.**

### Groupe-cours actif, contexte actif
**Définition.** Le groupe-cours que l'enseignant a choisi dans l'en-tête. La plupart des écrans
montrent celui-là. Une vue « Cours (tous groupes) » réunit les groupes d'un même cours.
**Dans le code :** `groupeCoursActif` (commune), `infoCours` ; `obtenirIdContexteActif()`,
`obtenirDonneesSelonMode()` dans `js/modes.js`, par où passe tout filtrage.

### Élève, étudiant·e
**Définition.** Une personne inscrite au groupe. Un élève peut être actif, inactif, en
décrochage ou en abandon ; un élève exclu reste calculé mais sort des moyennes du groupe.
**À l'écran :** surtout « étudiant·e(s) » ; « élève » dans les textes récents.
**Dans le code :** `groupeEtudiants` (par trimestre) ; `elevesDesinscrits`,
`confidentielEtudiants` (par trimestre).
**Attention :** la constante `listeEtudiants` de `js/config.js` ne contient **pas** la liste des
élèves : ce sont des données de démonstration, protégées pour des raisons historiques.

### DA
**Définition.** Le numéro d'admission de l'élève, attribué par le système d'information scolaire.
**C'est un identifiant personnel** : donnée la plus sensible de l'application.
**Dans le code :** champ `da` ; c'est la clé qui relie un élève à toutes ses données.
`js/correction-da.js` corrige un DA partout où il apparaît.
**Attention :** un DA n'est **pas** le code permanent, malgré certains commentaires du code.

### Horaire, période
**Définition.** L'horaire est le format hebdomadaire des cours (jours, heures, local). La
période est une **unité de durée** (55 minutes par défaut), pas un contenant.
**Dans le code :** `horaires`, `horaireHebdo`, `seancesHoraire`, `dureePeriode` (par trimestre) ;
`js/horaire.js`.

### Calendrier
**Définition.** Le calendrier du trimestre, jour par jour : jours de cours, congés, reprises,
numéros de semaine. Base des séances et des présences.
**À l'écran :** « Calendrier scolaire » (section « Cadre »).
**Dans le code :** `calendrierComplet` (par trimestre, écrit seulement par `js/trimestre.js`),
`cadreCalendrier`, `journeesSansCours`.

### Séance
**Définition.** Une rencontre datée du groupe, issue de l'horaire croisé avec le calendrier.
À distinguer de la **leçon**, unité de contenu planifiée dans la carte d'alignement.
**Dans le code :** `seancesCompletes_gc_<groupeCoursId>`. **Piège** : cette clé n'est pas
préfixée par le trimestre, alors que le registre déclare une clé `seancesCompletes` qui n'est
qu'un repli.
**Attention :** la « reprise » du calendrier (journée de rattrapage) n'a rien à voir avec le
jeton de reprise.

### Présences
**Définition.** La saisie, séance par séance, de qui était là. Elle alimente l'indice A.
**À l'écran :** « Saisie des présences » ; « Présent », « Absent », « Présence partielle ».
**Dans le code :** `presences` (par trimestre), seul écrivain `js/saisie-presences.js` ; dates
verrouillées dans `<trimestre>_datesVerrouillees_gc_<id>`.

---

## B. La conception

### Production
**Définition.** Un travail demandé aux élèves (examen, travail écrit, laboratoire, projet…),
avec sa pondération et son échéance. Dans les pratiques par standards, c'est d'abord une occasion
d'apprendre, pas seulement d'être noté.
**À l'écran :** « Productions étudiantes ».
**Dans le code :** `productions` (par trimestre), propriétaire `js/productions.js`.
**Attention :** dans `js/productions.js`, des fonctions protégées s'appellent
`monterEvaluation`, `descendreEvaluation`… alors qu'elles agissent sur des **productions**.
« Les pondérations totalisent 100 % » n'est vrai qu'en notation sommative.

### Travail diagnostique
**Définition.** Une production qui sert à observer, pas à noter : elle n'entre ni dans la note,
ni dans les indices, ni dans le dépistage.
**À l'écran :** case « Travail diagnostique ».
**Dans le code :** `js/entites/production-diagnostique.js`.

### Portfolio, artefact
**Définition.** Un portfolio est une production-conteneur ; ses **artefacts** sont des pièces
sans pondération propre, dont on ne retient que certaines pour la note (les meilleures, les plus
récentes…).
**Dans le code :** productions de type `portfolio` et `artefact-portfolio` ; sélections par
élève dans `portfoliosEleves` (par trimestre) ; `js/portfolio.js`.
**Attention : ambiguïté majeure.** Le dépistage, les skills et une partie de l'Aide emploient
« artefact » pour **toute production évaluée**, pas seulement pour une pièce de portfolio.

### Évaluation terminale
**Définition.** La production qui conclut le cours et pèse sur la note finale selon la
pratique.
**Dans le code :** type `terminale`.

### Grille de critères
**Définition.** Ce qu'on évalue dans une production : des critères nommés, typés et pondérés.
Réutilisable d'une production et d'un trimestre à l'autre.
**À l'écran :** « Grilles de critères ».
**Dans le code :** `grillesTemplates` (par trimestre) pour les grilles de travail ;
`bibliothequeGrilles` (commune) pour les gabarits ; `partage_grilles` (commune) pour les grilles
reçues ; `js/grilles.js`.
**Attention :** **le nom d'une grille s'imprime sur le PDF de l'élève.** Plusieurs fonctions
génériques portent encore le nom SRPNF (voir la section G).

### Critère
**Définition.** Une dimension évaluée. Il a un type (holistique, analytique, algorithmique), une
pondération, et peut porter un **niveau cognitif SOLO** qui détermine s'il est surveillé par le
dépistage.
**Dans le code :** `grillesTemplates[].criteres[]`, champ `niveauSOLO`.

### Sous-critère
**Définition.** Pour un critère algorithmique : les catégories d'erreurs, chacune avec un code,
une pondération et une rétroaction. Les sous-critères peuvent servir de codes d'annotation sur la
copie.
**Dans le code :** `critere.sousCriteres[]` ; `js/codes-annotation.js`, `js/evaluation-calcul.js`.

### Échelle de performance, niveau
**Définition.** Les niveaux qu'un critère peut atteindre. Une échelle fait **deux conversions
inverses**, toutes deux nécessaires : d'une note vers un niveau (plage), et d'un niveau vers une
note (valeur ponctuelle). Sans valeur ponctuelle, un niveau n'est pas calculable.
**À l'écran :** « Échelles de performance » ; « Plage de notes », « Valeur ponctuelle ».
**Dans le code :** `echellesTemplates` (par trimestre), `bibliothequeEchelles` (commune) ;
`js/echelles.js` (`niveauxDefaut`, `valeurNumeriqueDuNiveau`).
**Attention :** « niveau » a quatre sens : niveau d'échelle, niveau cognitif SOLO, palier RàI,
et l'ancien « niveau d'attention ».

### IDME
**Définition.** L'échelle à quatre niveaux proposée par défaut, alignée sur la taxonomie SOLO :
**I**ncomplet, **D**éveloppement, **M**aîtrise, **É**tendu.
**Dans le code :** `niveauxDefaut` (`js/echelles.js`) ; seuils dans `seuilsInterpretation.idme`.
**Attention :** plusieurs textes disent « Insuffisant » et « Maîtrisé » ; l'application affiche
« Incomplet » et « Maîtrise ». Les bornes varient d'une unité selon les sources. Statut :
choix de l'auteur devenu échelle par défaut (document 2, P6, question ouverte).

### Cartouche de rétroaction
**Définition.** Une matrice de commentaires préparés une fois pour toutes : un commentaire par
critère et par niveau. Elle assemble la rétroaction remise à l'élève.
**À l'écran :** « Cartouches de rétroaction ». Le mot est féminin à l'écran.
**Dans le code :** `cartouches_<grilleId>` (par trimestre, par une règle particulière de
`cle()`), `bibliothequeCartouches`, `partage_cartouches` (communes) ; `js/cartouches.js`.
**Attention :** un ancien texte la définit comme un « bloc d'identification » : c'est faux.

### Bibliothèque, gabarit, modèle de travail
**Définition.** Un **gabarit** est un modèle de départ, réutilisable et partageable, rangé dans
une **bibliothèque** commune à tous les trimestres. Un **modèle de travail** est la copie
qu'un enseignant utilise dans un trimestre donné.
**Dans le code :** `bibliotheque*` (communes) contre `*Templates` (par trimestre) ; lien
d'origine `inspireDe`.

---

## C. Évaluer

### Copie, travaux
**Définition.** Le fichier remis par l'élève (PDF, image, photo HEIC), importé puis associé à
l'élève et à la production.
**À l'écran :** « Préparer et importer », « Travaux soumis », « Archiver les copies ».
**Dans le code :** `fichiersTravaux` (par trimestre, base locale), `corbeilleFichiers` ;
`js/travaux-*.js`.

### Annotation, tampon
**Définition.** Ce que l'enseignant écrit ou appose sur la copie. Les tampons sont des marques
prêtes à l'emploi.
**À l'écran :** « Autocollants », « Codes », « Symboles » ; « Tampon » ou « Estampe » dans l'Aide.
**Dans le code :** `annotationsTravaux` (par trimestre) ; `tamponsPersonnalises`, `tamponsImages`,
`bibliothequeTampons` (communes) ; `js/travaux-annotation.js`, `js/tampons-bibliotheque.js`.
**Attention :** trois mots pour un même objet.

### Évaluation
**Définition.** Le geste d'attribuer un niveau à chaque critère d'une production pour un élève,
avec sa rétroaction. **Seule une évaluation verrouillée compte dans la note.**
**À l'écran :** section « Évaluation », « Annoter et évaluer », « Verrouiller l'évaluation ».
**Dans le code :** `evaluationsSauvegardees` (par trimestre, base locale), propriétaire
`js/evaluation-sauvegarde.js` ; `evaluationEntreDansLaNote()`.
**Attention :** d'autres modules écrivent encore cette clé en contournant son propriétaire
(document 2, P3). Le mot « évaluation » désigne aussi un bloc de la carte d'alignement et,
dans `js/productions.js`, des productions.

### Verrouiller
**Définition.** Figer. Une évaluation verrouillée entre dans la note ; on verrouille aussi une
production, un critère, une cartouche, une date de présences.

### Rétroaction
**Définition.** Le commentaire remis à l'élève, assemblé à partir de la cartouche et ajusté
par l'enseignant, puis remis en PDF.
**Dans le code :** champs `retroaction*` de l'évaluation ; `js/evaluation-retroaction.js`,
`js/synthese-retroaction-*.js`, `js/travaux-export-pdf.js`.
**Attention :** ce sont **des mots que l'élève lira** : leur contenu relève du pédagogue.

### Jetons
**Définition.** Des occasions supplémentaires qu'une pratique peut offrir à l'élève :
« Délai », « Reprise », « Reprise ciblée ». Le droit à l'erreur, institutionnalisé.
**Dans le code :** configuration dans la pratique (`configuration.jetons`) ; traces sur
l'évaluation (`repriseDeId`, `remplaceeParId`, `jetonDelaiApplique`) ; compteur par élève
`jetonsEtudiants`, **clé commune hors des registres** ; `js/evaluation-jetons.js`.

---

## D. Construire la note

### Pratique de notation
**Définition.** La règle complète qui transforme les évaluations en note : quelles productions
comptent, comment on les combine, quels jetons sont offerts. L'application en accueille quatre
familles, **sans hiérarchie** (document 2, P6).
**À l'écran :** « Pratiques de notation » ; badges « SOM », « STD », « SPE », « DEN ».
**Dans le code :** `pratiquesConfigurables` (par trimestre) pour les pratiques exécutables ;
`js/pratiques/` (`pratique-registre.js` : `obtenirPratiqueParId`) ; assistant
`js/wizard-pratique-v2.js`.
**Attention :** **sans pratique assignée au groupe-cours, aucune note n'est calculée.** Le guide
de la sommative dit encore le contraire, et une constante de défaut ne sert plus qu'à un badge.

### SOM : sommative
**Définition.** La note est la moyenne pondérée des évaluations. Option de premier rang, pas une
étape vers autre chose.
**Dans le code :** identifiant `sommative`, `js/pratiques/pratique-sommative.js`.
**Attention :** « sommatif » a trois sens dans l'application : une fonction de l'évaluation, une
famille de pratique, et un groupe de l'écran Productions.

### PAN : pratique alternative de notation
**Définition.** Le nom de famille des pratiques qui renouvellent la notation. Dans l'application,
le badge couvre STD, SPE et DEN.
**Attention :** un document de conventions le traduit par « Plan d'Aide à l'Apprentissage
Numérique » : **c'est faux.**

### STD : standards
**Définition.** La note se construit à partir des productions qui démontrent l'atteinte des
standards : un portfolio dont on retient certains artefacts, plus l'évaluation terminale. Une
reprise remplace l'essai précédent.
**Dans le code :** identifiant `standards` (anciens identifiants `pan-standards`, `pan-maitrise`…,
normalisés à la lecture) ; `js/pratiques/pratique-pan-standards.js`.

### SPE : spécifications
**Définition.** Chaque travail est jugé en tout ou rien (« conforme », « non conforme ») ; la note
dépend des **forfaits** (ensembles de travaux) atteints.
**Dans le code :** identifiant `specifications`, `js/pratiques/pratique-pan-specifications.js`.
**Attention :** l'acceptabilité est approximée par un seuil de note, ce que la recherche ne fait
pas.

### DEN : dénotation
**Définition.** Pas de note sur les travaux ; la note finale est un **jugement saisi** par
l'enseignant, encadré par l'atteinte de cibles. Sans saisie, pas de note, jamais zéro.
**Dans le code :** identifiant `denotation` ; `jugementsDenotation`, **commune de fait** alors que
le registre des données la dit par trimestre.
**Attention :** la recherche classe la dénotation parmi les pratiques de réduction de la
notation (PRÉN), pas parmi les PAN. Le badge « PAN » est une approximation assumée.

### Note d'une production, note du cours
**Définition.** La note d'une copie (`evaluation.noteFinale`) n'est pas la note du cours, que
calcule la pratique.
**Dans le code :** `calculerNoteDuCours`, `simulerIndices` (`js/portfolio.js`) ; export
`js/export-resultats-finaux.js`. Le document 10 décrira le moteur.

### Note non constructible
**Définition.** Quand les données ne permettent pas de calculer une note, l'application affiche
« — ». **Principe : jamais un zéro inventé.**
**Dans le code :** drapeaux `noteConstructible`, `completionConstructible`.
**Piège :** un `P = 0` stocké peut signifier « non constructible » : lire le drapeau avant
d'interpréter un zéro.

### Formatif, sommatif, certificatif
**Définition.** Deux finalités de l'évaluation : soutenir l'apprentissage (formative) ou
témoigner des acquis (certificative). « Sommatif ne veut pas dire addition. »
**Dans le code :** `metadata.visee` (`formative`, `certificative`).

### RREC
**Définition.** Le Règlement sur le régime des études collégiales : au collégial, 60 est la note
de passage. Toute pratique produit au bout du compte une note certificative conforme à cette
règle.

### Note différée
**Définition.** Une préférence d'affichage qui masque les notes par travail. Elle ne change aucun
calcul.

---

## E. Suivre

### Indices A, C, P
**Définition.** Trois lectures de l'engagement et de la réussite de chaque élève :
- **A, assiduité** : l'exposition aux situations d'apprentissage (périodes présentes sur périodes
  offertes). Un constat, pas un jugement sur la participation ;
- **C, complétion** : la régularité de la mise en pratique (travaux remis sur travaux attendus),
  indépendamment de la note. Sa règle exacte dépend de la pratique ;
- **P, performance** : la compétence démontrée à un moment donné selon la pratique active. Une
  photographie, pas un pronostic ni la note finale.
**Dans le code :** `indicesAssiduite` (par trimestre, `js/indices.js`) ; `indicesCP` (par
trimestre, propriétaire `js/portfolio.js`, calcul délégué à la pratique).
**Attention :** la fenêtre des trois dernières productions pour P est une règle de l'auteur
(ADR-006). L'ancien indice E (engagement) est retiré, mais d'anciennes données et certains
textes le citent encore.

### Mobilisation (M)
**Définition.** Une lecture combinée de A et C : l'élève est-il là et fait-il le travail ?
**À l'écran :** « Engagement ACP » dans le profil ; colonne « M » de la liste des élèves.

### Seuils d'interprétation
**Définition.** Les bornes qui colorent les colonnes A, C, P et M (« Fragile », « Acceptable »,
« Bon », « Excellent »). Elles ne touchent ni la note ni l'échelle.
**Dans le code :** `seuilsInterpretation` (commune), valeurs par défaut dans
`SEUILS_PAR_DEFAUT` (`js/interpretation-config.js`).
**Attention :** les noms des bandes diffèrent selon les textes d'aide. Les valeurs par défaut
sont des conventions de l'auteur, non validées empiriquement.

### SOLO
**Définition.** Une taxonomie des apprentissages (Biggs et Collis, 1982) en cinq niveaux de
complexité : préstructurel, unistructurel, multistructurel, relationnel, abstrait étendu. Elle
sert à étiqueter les critères et fonde le dépistage.
**Dans le code :** champ `niveauSOLO` des critères et des niveaux.

### Dépistage
**Définition.** Un **portrait** des élèves qui peinent sur les apprentissages de base, pas un
diagnostic. Il surveille les critères de niveau multistructurel.
**À l'écran :** Labo › « Outils d'observation » (réglages) ; lu dans « Suivi du groupe » et le
profil.
**Dans le code :** `js/profil-etudiant-calculs.js`, `js/profil-etudiant-helpers.js`,
`js/interpretation-config.js`.

### IPB : indice de persistance du blocage
**Définition.** Le nombre de productions récentes consécutives où l'élève reste sous le seuil
sur les critères surveillés. Croisé avec la direction de sa progression, il donne un diagnostic
(« Difficulté persistante », « Progression », « Plateau »…).
**Dans le code :** `calculerIPB()`, `diagnostiquerSuiviApprentissage()` ; rien n'est stocké.

### Pattern d'apprentissage
**Définition.** Le profil courant de l'élève : « Stable », « Défi spécifique », « Difficulté
émergente », « Difficulté persistante ». Vocabulaire descriptif (document 2, P7).
**Dans le code :** `identifierPatternActuel()` ; `indicesPatternsRaI` (par trimestre).

### RàI : réponse à l'intervention
**Définition.** Un modèle d'organisation du soutien en trois paliers : **1**, universel (tout le
groupe) ; **2**, un sous-groupe ciblé ; **3**, individuel et intensif. Une inspiration, pas une
norme.
**À l'écran :** « Niveau 1 - Universel », « Niveau 2 - Préventif », « Niveau 3 - Intensif » dans
le profil ; « Groupe ciblé » et « Individuel » dans le formulaire d'intervention.
**Dans le code :** une seule source pour le palier suggéré, `determinerNiveauRaiPedagogique()`
(`js/profil-etudiant-calculs.js`), qui combine P et le pattern.
**Attention :** deux noms pour le palier 2 selon l'écran. Plusieurs textes d'aide décrivent une
autre règle de calcul du palier que celle du code.

### Intervention
**Définition.** Une action de soutien planifiée pour un sous-groupe ou un élève, avec son
objectif, les critères visés, et un bilan.
**Dans le code :** `interventions` (par trimestre), seul écrivain `js/interventions.js`.

### Rencontre
**Définition.** Le nom que prend l'intervention dans un **service** d'orthopédagogie.
**Dans le code :** même donnée que les interventions ; `js/rencontres.js`.

### Profil de l'élève
**Définition.** La fiche individuelle : productions, engagement, progression, habiletés,
accompagnement, travaux, rapport.
**À l'écran :** « Profils individuels ».
**Dans le code :** `js/profil-etudiant-*.js`. Les sections `mobilisation` et `performance`
s'affichent « Engagement ACP » et « Développement des habiletés ».

### Suivi du groupe
**Définition.** La vue d'ensemble du groupe : indices, besoins d'intervention, trajectoires,
résultats finaux. Anciennement « tableau de bord » ou « Aperçu ».
**Dans le code :** `js/tableau-bord-apercu.js` ; élèves suivis dans
`<trimestre>_etudiantsSuivis_gc_<id>`.

### Capture
**Définition.** Une photographie des indices A, C et P à un moment donné : à chaque séance, et
avant et après une intervention. Elle permet de tracer la progression.
**À l'écran :** « Captures de progression », « Captures de séances ».
**Dans le code :** `<trimestre>_snapshots_<groupeCoursId>`, forme `{hebdomadaires[],
interventions[]}` ; `js/snapshots.js`.
**Attention :** le tableau s'appelle `hebdomadaires` mais contient une capture par séance.

### Bilan réflexif
**Définition.** Un outil d'enquête auprès des élèves (questionnaire, parcours, autoréflexion)
et d'analyse de ses résultats.
**Dans le code :** `questionnaireBilan`, `parcoursBilan`, `resultatsBilan` (par trimestre) ;
`js/bilan-reflexif*.js`.

### Suivi longitudinal
**Définition.** Suivre un élève d'un trimestre à l'autre : une copie datée de son dossier, à
laquelle s'ajoutent ses résultats dans les cours suivants.
**Dans le code :** `registreLongitudinal` (commune), seul écrivain `js/registre-longitudinal.js`.

### Carte d'alignement
**Définition.** La planification du cours sous forme de carte : ce qu'on vise, comment on
l'enseigne, comment on le vérifie, reliés par des liens typés (« se décline en », « s'acquiert
par », « se vérifie par »).
**À l'écran :** « Carte d'alignement » (anciennement « Alignement pédagogique »).
**Dans le code :** `planification_mindmap`, `planification_seances` (par trimestre) ;
`js/planification*.js`.

### Exploration des pratiques
**Définition.** Un banc d'essai qui compare des pratiques de notation sur des profils d'élèves
types. Il ne recommande jamais. Une **maquette** est une pratique d'essai ; l'**adopter** la rend
réelle.
**Dans le code :** `js/comparateur-pratiques.js`, `simulerIndices()` en lecture seule ; drapeau
`COMPARATEUR_VISIBLE` (`js/config.js`).

---

## F. Les données

### Rangement par trimestre
**Définition.** Le principe qui préfixe les données d'un trimestre par son identifiant (document
2, P4).
**Dans le code :** `cle('nom')` rend `h2026_nom` ; registres `CLES_NAMESPACEES` et
`CLES_GLOBALES` dans `js/trimestres.js`. Une clé absente des deux registres est rendue telle
quelle, avec un avertissement dans la console.

### Codex
**Définition.** L'espace de travail actif, enregistré dans un fichier `.codex.zip` que
l'enseignant garde où il veut. Sauvegarde et moyen de changer d'appareil.
**À l'écran :** bouton « Codex » de l'en-tête et son menu.
**Dans le code :** `js/codex.js`.
**Attention :** à ne pas confondre avec Labo Codex (l'application) ni CodexNumeris (le blogue de
l'auteur).

### Archives
**Définition.** Un dépôt local, hors du navigateur, où l'on verse ce qui est terminé ; jamais
purgé.
**À l'écran :** « Archives », « Archiver… », « Ouvrir une archive… », « Faire revenir ».
**Dans le code :** **« Réserve »** : `js/reserve*.js`, `Reserve.verserGroupeCours`.
**Attention :** l'ADR-011 et plusieurs skills disent encore « Réserve » et « verser ».

### Codex data
**Définition.** Un extrait sans les copies, qui peut réunir plusieurs trimestres, pour l'analyse
dans le Labo.
**Dans le code :** `js/codex-data.js` ; fichiers `.codex-data.json`.
**Attention :** **il contient les noms des élèves** : l'anonymisation est prévue mais pas écrite.

### Partage, Voûte
**Définition.** Le partage échange des ressources (grilles, échelles, cartouches, pratiques)
entre collègues dans des fichiers signés `.lcz`. La **Voûte** est le projet, futur, d'une
bibliothèque partagée ; le partage par fichiers en est la première étape.
**Dans le code :** `js/partage-*.js`, `js/signature.js`, `js/trust-tofu.js` ; `partage_*`,
`clesConnues` (communes).

### Mode anonymisation
**Définition.** Un mode d'**affichage** qui remplace les noms par des pseudonymes, pour projeter
son écran. **Ce n'est pas une anonymisation des données.** Les écritures y sont bloquées.
**Dans le code :** `modeApplication` (commune), `js/modes.js`.

### Mode démonstration
**Définition.** Un cours fictif déjà configuré, isolé des données de l'enseignant.
**Dans le code :** trimestre `demo`, préfixe `demo_` ; `js/pack-demo-10.js`,
`js/demo-namespace.js`. Le mécanisme est générique ; **le contenu reprend le modèle de
l'auteur**.

---

## G. Le modèle de l'auteur : des exemples, pas des notions de l'application

### ELLAC [modèle de l'auteur]
*Enseigner la lecture littéraire au collégial* : un cadre didactique pour la littérature
(Bélec et Doré, 2023) qui fonde la grille d'exemple de l'auteur. Il n'apparaît que dans l'aide
et des commentaires.

### SRPNF [modèle de l'auteur]
Les cinq critères de la grille d'exemple de l'auteur : Structure, Rigueur, Plausibilité, Nuance,
Français. **Une grille d'exemple, pas une structure du logiciel.**
**Piège :** des fonctions génériques portent encore son nom (`copierCriteresSRPNF`,
`_genererBarresSRPNF`…) et un ancien module de pratiques prédéfinies en contient une version
figée.

### 601-101 [modèle de l'auteur]
Le cours de littérature de l'auteur, dont les données de démonstration sont tirées.

---

## H. Pièges de vocabulaire

**Un mot, plusieurs choses :**
- **reprise** : journée de rattrapage du calendrier, ou jeton ;
- **évaluation** : le geste, un bloc de la carte, et une production dans `js/productions.js` ;
- **artefact** : pièce de portfolio, ou toute production évaluée ;
- **accompagnement** : section du profil, identifiant de Labo › « Outils d'observation », et
  système d'aide (`js/accompagnement.js`) ;
- **modélisation** : Labo › « Modélisation » (annotation projetée), et phase de l'enseignement
  explicite ;
- **niveau** : d'échelle, SOLO, palier RàI ;
- **archiver** : clore un trimestre (dans le code), ou déposer aux Archives (à l'écran) ;
- **emprunter** : depuis les Archives, ou depuis la future Voûte ;
- **instantané** : capture d'indices, copie figée d'une archive, ou brouillon d'évaluation ;
- **sommatif** : fonction, famille, groupe d'écran.

**Une chose, plusieurs mots :** Archives et Réserve ; tampon, estampe et autocollant ; Suivi du
groupe, tableau de bord et Aperçu ; Exploration des pratiques et comparateur ; Cadre et
`calendrier` ; Nouveautés et Nouvelles.

**Des clés qui échappent aux registres** (à connaître avant de toucher aux données) :
`jetonsEtudiants`, `seancesCompletes_gc_<id>`, `jugementsDenotation`, `infoCours`.

**Des notions retirées qui survivent dans des textes :** l'indice E (engagement), l'indice de
risque R et le « niveau d'attention » N, le mode « simulation ».

---

**Sources principales** : `index.html`, `js/config.js`, `js/trimestres.js`,
`js/accompagnement-contenu-terme.js`, `js/guides-pedagogiques.js`, `docs/DATA-OWNERSHIP.md`,
`noms_stables.json`, skills `pratiques-notation`, `depistage-rai`, `ecosysteme-classe`,
`alignement`, `labo-codex`. Relevé du 12 octobre 2026.
