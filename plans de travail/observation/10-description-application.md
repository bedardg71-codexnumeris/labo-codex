# Labo Codex 1.199.0 : description consolidée de ce que fait l'application

*15 octobre 2026. Base de description tirée de l'audit « observer ce que fait réellement l'application » (rapport : `9-rapport-audit.md`). Rédigée par Claude Code à partir des documents de l'audit ; elle n'a pas été relue contre le code.*

## À quoi sert ce document, et ses limites

- **Ce qu'il contient.** Les 103 conclusions que deux lectures indépendantes (A et B) tirent toutes deux de l'observation à l'aveugle, que la vérification de leurs appuis juge solides (« soutient »), et que Grégoire a classées « voulu et fait » (`8-interpretation.md`). Chaque énoncé garde le texte et le repère de `7-convergence.md` (par exemple [Q1-01]).
- **Ce qu'il décrit.** La version **1.199.0** (build 1011-1808), publiée le 11 octobre 2026, observée avec des données fictives dans Chromium, ni sur iPad ni dans Safari.
- **Ce qu'il ne contient pas.** Les affirmations qu'une seule lecture fait (113), celles dont l'appui n'est que partiel (19) ou introuvable (2) : voir `7-convergence.md`. Le détail geste par geste est dans `2-observation-aveugle.md`, qui reste la description la plus complète ; ce document en est le noyau le mieux établi, pas le tout.
- **Rangement.** Par écran (d'après la section de l'observation où chaque conclusion s'appuie d'abord), puis par nature : ce que le programme reçoit, produit, garde, facilite ou freine, calcule, et à quoi il sert. Une conclusion qui touche plusieurs écrans n'est rangée qu'une fois.
- **Ce qui relève de l'intention.** La section « Finalité » sépare ce que disent les lectures (tiré de l'observation) de ce qu'en dit Grégoire (son intention). Le reste du document ne décrit que des comportements.

## Finalité

**Selon la lecture A** (`5-finalite-A.md`, §6.1) :
> « Labo Codex fait du poste de l'enseignant·e le lieu, seul et fermé, où ce que l'enseignant·e saisit sur chaque étudiant·e (présences, copies, niveaux par critère) se convertit sans cesse en notes et rétroactions à rendre et en indices qui classent chaque étudiant·e selon un besoin d'intervention. Ce dossier est conservé et protégé bien plus qu'il n'est mis en circulation. »

**Selon la lecture B** (`5-finalite-B.md`, §6) :
> « Le programme sert à une personne enseignante, seule, à tenir étudiant·e par étudiant·e un dossier de présences, de notes et de rétroactions, et à en dériver automatiquement des indices et un classement de niveau de besoin qui orientent ses décisions de notation et d'intervention. »

**Les deux bornes du contrepoids** (`7-contrepoids.md`, §1), entre lesquelles A et B se situent :
- *la moins flatteuse* : un dossier par étudiant·e tenu par une seule personne, dont le programme tire automatiquement une note et un classement par « besoin d'intervention », gardé d'un trimestre à l'autre, sans écran destiné aux personnes classées ;
- *la plus flatteuse* : un poste de travail personnel et local pour préparer, évaluer et rendre des travaux avec une rétroaction par critère, voir où en est le groupe et comparer des façons de noter, où rien ne part sans geste et où seul le matériel pédagogique circule.

**Autres finalités compatibles** proposées par A et B, toutes reconnues par Grégoire : outil de travail planifier, évaluer, noter, rendre ; dépistage et suivi ; changement des pratiques de notation ; données pour la réflexion sur la pratique ; communauté et économie autour du projet ; réflexivité sur la pratique et la charge ; gestion de classe ; diffusion de ressources ; formation à d'autres pratiques.

**Ce qu'en dit Grégoire** (intention, `6-reaction-scellee.md`) : les deux formulations sont « reconnues ». Il préfère parler de **dépistage de difficultés** et de **classement de niveau de besoins** plutôt que de classement ou de triage d'élèves ; le but est d'**éclairer et soutenir les décisions d'intervention et d'accompagnement**, l'enseignant·e restant autonome. Il décrit l'application comme un **multi-outil** de soutien au travail enseignant et au **développement professionnel** par la pratique réflexive, et la communauté comme une **économie du commun**.

## Ce que fait l'application, écran par écran

### En-tête, Accueil et Aide

**Ce que le programme reçoit**

- Le programme apporte lui-même un jeu de démonstration (10 étudiant·es, dont les noms sont ceux de personnalités publiques). [Q1-32]

**Ce que le programme produit**

- Un rapport de bogue (version, appareil, nombre d'étudiant·es, 20 derniers clics, erreurs ; aucun nom ni DA) est copié ou envoyé par mailto:labo@codexnumeris.org sur geste. [Q2-23]
- Des liens de soutien mènent à l'abonnement au blogue, à l'abonnement de soutien, au don et à la communauté de pratique de l'AQPC. [Q2-24]

**Ce que le programme garde**

- Les 20 derniers clics et erreurs sont gardés en mémoire ; ils n'apparaissent que dans le rapport de bogue. [Q3-24]

**Ce que le programme facilite ou freine**

- Une fenêtre de rappel de sauvegarde s'ouvre 1,5 s après le chargement s'il existe une évaluation ou un fichier. [Q4-05]
- Il existe une visite guidée. [Q4-18]

**À quoi il sert, et à qui**

- Des noms de personnalités publiques servent d'étudiant·es dans la démo. [Q7-13]

### Cadre

**Ce que le programme reçoit**

- L'enseignant·e saisit le trimestre : bornes de dates, journées sans cours (A ajoute reprises et semaines spéciales). [Q1-01]
- L'enseignant·e saisit la fiche de cours : code, discipline, compétence, pondération « 2-2-3 ». [Q1-02]
- Le profil de l'enseignant·e est saisi ; prénom, nom, courriel et institution sont requis. [Q1-03]
- L'horaire est saisi avec un nombre de périodes par séance, exigé. [Q1-04]
- La liste des étudiant·es est collée ou lue d'un CSV (DA, groupe, nom, prénom, programme, SA). [Q1-06]
- Un·e étudiant·e s'ajoute fiche par fiche, avec CAF et date d'arrivée. [Q1-07]
- Les textes du programme emploient le DA « du collège », Omnivox et Léa. [Q1-40]

**Ce que le programme garde**

- Les données d'identité des étudiant·es sont gardées (DA, nom, prénom, programme, SA, CAF). [Q3-03]
- Presque toute suppression ouvre d'abord « Écrire un codex avant de supprimer ? ». [Q3-14]
- Supprimer un groupe ou un trimestre, ou tout réinitialiser, exige un codex à part et la saisie d'un nom ou de « EFFACER ». [Q3-15]
- Un cours qui porte des données ne peut pas être supprimé. [Q3-17]
- Changer la session ou l'année d'un trimestre qui porte des données est refusé. [Q3-19]
- a2026_elevesDesinscrits (DA et date) est écrit à la suppression d'une fiche ; aucun écran observé ne le lit. [Q3-20]

**Ce que le programme calcule**

- Le calendrier calcule semaines et jours de cours à partir des bornes, congés, reprises et horaire. [Q5-05]
- Les statuts inactif/décrochage excluent l'étudiant·e des calculs du groupe. [Q5-17]

### Conception

**Ce que le programme reçoit**

- Productions, grilles, échelles, cartouches et pratiques de notation sont saisies par l'enseignant·e. [Q1-09]
- Le programme apporte des gabarits de grilles, d'échelles et de pratiques. [Q1-33]

**Ce que le programme produit**

- Un paquet .lcz signé (ECDSA) est produit. [Q2-19]

**Ce que le programme calcule**

- Des badges d'alignement (✓ ⚠ !) et des durées (minutes → périodes, Σ de leçon) sont calculés sur la carte. [Q5-07]
- Des sommes de pondérations sont calculées (« 70% manquant », « 5% en trop »). [Q5-08]

### Évaluation

**Ce que le programme reçoit**

- Des copies sont déposées en fichiers (A nomme PDF, JPEG, PNG, HEIC ; B ajoute WebP). [Q1-12]
- Chaque fichier est rattaché à un·e étudiant·e d'après le DA, le nom/prénom ou le format « LÉA ». [Q1-13]
- Un niveau par critère est choisi par l'enseignant·e à l'évaluation. [Q1-14]
- Un statut d'intégrité (« plagiat ») et des notes d'intégrité sont saisis. [Q1-15]
- Des annotations sont posées sur les copies (traits, tampons, codes d'erreurs). [Q1-18]

**Ce que le programme produit**

- La rétroaction générée par niveaux est rédigée au « tu », copiable ; l'étudiant·e est la personne visée. [Q2-07]
- Un « Dossier PDF » par étudiant·e et production est rédigé au « tu » et porte « Note provisoire — peut changer selon tes prochains travaux ». [Q2-08]

**Ce que le programme garde**

- Les évaluations sont gardées, avec un journal horodaté. [Q3-05]
- Les copies (blobs, miniatures) et les annotations sont gardées. [Q3-07]
- jetonsEtudiants est créé à la simple consultation d'une évaluation. [Q3-37]

**Ce que le programme facilite ou freine**

- L'enregistrement est différé de 1,5 s et se fait sans geste (évaluation, présences). [Q4-01]
- « Évaluer » préselectionne groupe, étudiant·e, production, grille, échelle, cartouche (A : aussi statut de remise et intégrité). [Q4-13]
- La note est recalculée et la rétroaction rédigée automatiquement à chaque niveau choisi. [Q4-14]
- Il n'y a pas de note tant qu'un critère est sans niveau. [Q4-24]
- Saisir ou ajouter coûte moins de gestes que supprimer ou retirer (entrer facile, enlever coûteux). [Q4-29]

**Ce que le programme calcule**

- La note d'une évaluation est la moyenne des valeurs ponctuelles des niveaux choisis (I 32, D 69,5, M 79,5, E 92,5), pondérée par les critères. [Q5-01]
- Une évaluation au statut « plagiat » vaut 0 et sa ligne est exclue de la moyenne de la liste. [Q5-02]

**À quoi il sert, et à qui**

- L'enseignant·e, utilisateur·rice principal·e : organiser, saisir, évaluer, produire notes et rétroactions, repérer qui est en difficulté, garder une trace. [Q7-01]

### Suivi

**Ce que le programme reçoit**

- Les présences sont saisies par séance et par étudiant·e, avec des notes libres. [Q1-11]
- Des informations « confidentielles » sont saisies par étudiant·e (parcours, défis, catégories comme « Dyslexie », notes). [Q1-19]
- Interventions et rencontres sont saisies (participant·es, notes individuelles, bilan). [Q1-21]
- Un service d'orthopédagogie se crée à partir d'une liste d'élèves ; un DA provisoire (commençant par 9) est attribué quand il manque. [Q1-31]

**Ce que le programme produit**

- Un tableau de bord du groupe (A, C, P, bandes, corrélations, SOLO, RàI) est montré à l'enseignant·e à l'écran. [Q2-03]
- Un panneau « Détails » filtre (P < 65 %, A ou C < 70 %, RàI 2-3) et range les étudiant·es par urgence. [Q2-04]
- Une liste des étudiant·es montre A, C, P, profil, RàI et corrélations, pour l'enseignant·e. [Q2-05]
- Un profil individuel, pour l'enseignant·e, comporte une rubrique d'accompagnement avec « Interventions recommandées ». [Q2-06]
- Un rapport de profil en texte copiable est produit (A, C, P, notes de l'enseignant·e). [Q2-13]

**Ce que le programme garde**

- Les présences sont gardées, avec leurs notes. [Q3-04]
- Les fiches confidentielles sont gardées. [Q3-08]
- Les interventions sont gardées, avec notes individuelles, snapshotAvant et bilan. [Q3-09]
- Les indices A, C, P et les patterns RàI calculés sont stockés. [Q3-10]

**Ce que le programme facilite ou freine**

- A, C, P et les patterns RàI sont recalculés, et réécrits si leur contenu change, au chargement ou à l'affichage du suivi. [Q4-03]
- Aux présences, tout le monde est présent par défaut (2/2, 100 %). [Q4-07]
- Verrouiller une séance non saisie compte présent·es les élèves non marqué·es. [Q4-10]
- Une séance non saisie s'affiche à 100 % mais n'entre pas dans le taux A. [Q4-11]
- Sans pratique appliquée, la note de cours n'est pas constructible (C = P = 0). [Q4-25]

**Ce que le programme calcule**

- A = périodes présentes ÷ périodes offertes, sur les séances saisies seulement. [Q5-09]
- C est une part de travaux remis (calculée par la pratique active). [Q5-10]
- P = note du cours selon la pratique active (ex. moyenne pondérée pour SOM). [Q5-12]
- μ, σ, le nombre d'étudiant·es à ±1σ et le r de Pearson A↔P et C↔P sont calculés sur le groupe. [Q5-13]
- Des bandes d'engagement « Fragile / Modéré / Favorable / Très favorable » sont calculées. [Q5-14]
- La distribution de P est calculée selon les niveaux de l'échelle. [Q5-15]
- Des patterns SOLO (« Progression stable » … « Non-participation ») et des niveaux RàI 1-2-3 sont calculés par étudiant·e. [Q5-16]
- Un score d'urgence range les étudiant·es retenu·es (P, min(A, C), suivi, RàI). [Q5-18]
- Le tirage au sort et les équipes utilisent Math.random (A : absent·es écarté·es, paires déjà formées évitées). [Q5-26]
- Le graphique hebdomadaire ajoute un décalage aléatoire (±0,015) à l'affichage. [Q5-27]
- Ce qui est classé, ce sont des personnes (bandes, patterns, RàI, priorités). [Q5-28]

**Ce qui touche la finalité**

- Le dossier est tenu étudiant·e par étudiant·e. [Q6-02]
- Ce que l'enseignant·e saisit : présences et niveaux/notes (A nomme aussi les copies ; B nomme aussi les rétroactions). [Q6-03]
- Le programme dérive automatiquement des indices et un classement des étudiant·es selon un besoin (d'intervention). [Q6-05]

**À quoi il sert, et à qui**

- Des données de santé ou de handicap (catégorie diagnostique comme « Dyslexie ») et le parcours scolaire peuvent être consignés. [Q7-09]

### Labo

**Ce que le programme reçoit**

- Les résultats ultérieurs d'un·e élève sont saisis dans le registre longitudinal. [Q1-22]

**Ce que le programme produit**

- Un rapport d'analyse du bilan (score /4, % favorables) est produit, à l'écran et en PDF, pour l'enseignant·e. [Q2-17]
- Des rappels (sauvegarde, pause) et un « Portrait temporel » s'adressent à l'enseignant·e sur son propre travail. [Q2-26]

**Ce que le programme garde**

- Un registre longitudinal garde une copie figée du dossier d'un·e élève, d'un trimestre à l'autre, avec ses résultats ultérieurs. [Q3-11]
- La miniature d'un fichier de Modélisation supprimé reste. [Q3-34]

**Ce que le programme calcule**

- Le comparateur de pratiques calcule la note finale de mêmes profils (fictifs ou groupe réel) sous plusieurs pratiques. [Q5-20]
- Des corrélations longitudinales (Pearson) sont calculées dans « Études » (B : minimum de 5 étudiant·es). [Q5-21]
- Le bilan calcule un score moyen /4, un % favorables et un « signal fort ». [Q5-23]
- Durée moyenne/médiane d'évaluation, tendance, charge estimée et « Portrait temporel » sont calculés. [Q5-24]

**Ce qui touche la finalité**

- Le programme instrumente aussi le travail de l'enseignant·e (rythme, charge, bilan). [Q6-11]

**À quoi il sert, et à qui**

- Il lui sert aussi à observer son propre rythme de travail (si le chronomètre est activé). [Q7-02]

### Réglages et données

**Ce que le programme reçoit**

- Des fichiers de collègues ou de sauvegarde sont importés (JSON, paquets .lcz signés, configuration, codex .zip, codex data). [Q1-25]

**Ce que le programme produit**

- Un « export anonymisé » (identifiants hachés, programme, services adaptés, résultats ultérieurs) est produit avec un fichier privé de correspondance. [Q2-20]
- Une archive « codex » .zip (donnees.json, travaux/, manifeste) est produite et gardée par l'enseignant·e comme sauvegarde. [Q2-22]

**Ce que le programme garde**

- À l'export anonymisé, une clé secrète aléatoire (32 caractères) et la table de correspondance sont créées. [Q3-22]
- Le manifeste du codex enregistre l'appareil, le navigateur et le userAgent complet. [Q3-25]
- _codex_snapshot_avant : des empreintes SHA-256 de chaque clé sont écrites à l'ouverture d'un codex. [Q3-27]
- clesConnues garde la clé publique, les dates et le nombre d'imports de chaque collègue. [Q3-30]

**Ce que le programme calcule**

- L'identifiant anonyme est un hachage SHA-256 tronqué à 8 caractères du DA et d'une clé. [Q5-25]

### Fonctionnement général

**Ce que le programme reçoit**

- Le fichier version.json est demandé au même serveur 30 s après le chargement, puis toutes les 5 min. [Q1-36]

**Ce que le programme produit**

- Rien ne quitte le navigateur sans geste de l'enseignant·e ; le seul échange automatique est GET version.json. [Q2-01]
- Un CSV « synthèse des résultats finaux » est produit (DA, nom, prénom, note arrondie, statut). [Q2-11]

**Ce que le programme garde**

- Tout est gardé dans le navigateur : IndexedDB, avec copie dans localStorage. [Q3-01]
- Des captures hebdomadaires des indices sont prises automatiquement pour la semaine courante. [Q3-12]

**Ce que le programme facilite ou freine**

- Les sélecteurs natifs de fichiers et de dossiers échouent dans le banc d'essai ; les chemins qui suivent n'ont pas été exécutés. [Q4-41]

## Écarts connus (bugs inscrits)

Ces comportements sont observés et solides, mais Grégoire les a classés « fait sans être voulu » : la description ci-dessus ne les reprend pas comme comportements de l'application.

- Les rapports de bogue sont archivés ; envoye:true est posé même quand le rapport a seulement été copié. [Q3-29] : #1068
- Des références orphelines restent : pratiqueId d'une pratique supprimée, horaireId d'un horaire supprimé. [Q3-35] : #1057, #1065
- Le déverrouillage immédiat d'une évaluation échoue dans la même session « Évaluer ». [Q4-32] : #1064
- Le tri de la liste des productions n'agit pas. [Q4-33] : #1069
- La corbeille de la carte déplace le bloc sans le supprimer. [Q4-34] : #1070
- L'import des résultats du bilan échoue (erreur de page). [Q4-35] : #1054
- L'export anonymisé laisse vide la liste des captures malgré 15 captures présentes. [Q4-40] : #1061
- La fenêtre « Confidentiel » dit « jamais partagées » alors que le codex exporte donnees.json (49 clés) sans chiffrement ; l'observation ne dit pas si les données confidentielles y figurent. [Q8-01] : #1071
- Licence : noms de fichier « CC-BY-SA » contre « CC BY-NC-SA 4.0 » dans les métadonnées. [Q8-03] : #1072
- Les colonnes Groupe et Cours du CSV de synthèse sont vides. [Q8-05] : #1073
- L'export dit « anonymisé » garde programme, services adaptés et résultats ultérieurs ; la table de correspondance et la clé secrète sont produites au même clic. [Q8-09] : #1060, #1074

Autres écarts déjà inscrits par le tri du temps 3 : #1055 à #1067 (voir `4-dispositions.md`).

## Ce que l'observation ne permet pas de savoir

- L'usage réel est inconnu (qui, combien, quels écrans, quelle fréquence) ; toutes les données observées sont fictives. [Q9-01]
- On ne sait pas si les indices et classements sont lus ou guident des actions. [Q9-02]
- On ne sait pas si les PDF et rétroactions parviennent aux étudiant·es (téléversement dans Léa, canal de remise). [Q9-03]
- On ne sait pas à qui vont les fichiers exportés, ni sous quel protocole ni avec quel consentement. [Q9-04]
- Le déploiement réel est inconnu (observé depuis 127.0.0.1) ; ce que l'hébergeur voit ou enregistre est inconnu. [Q9-05]
- Le contenu exact du codex (49 clés ; présence des données confidentielles) n'est pas connu. [Q9-06]
- Chemins non exécutés : sélecteurs natifs, écriture réelle du codex et des archives. [Q9-07]
- Les intentions des auteur·es : le document n'en dit rien. [Q9-13]

Grégoire y a répondu dans sa réaction scellée (N1 à N11) : l'application ne garde aucune donnée sur ses utilisateurs ni aucune trace d'usage, « et c'est bien ainsi » ; les élèves voient leurs notes et rétroactions par Léa ou en classe ; les commentaires des élèves sont recueillis par le bilan réflexif de fin de trimestre ; le classement est une aide à la décision, et c'est l'enseignant·e qui décide d'agir et comment.
