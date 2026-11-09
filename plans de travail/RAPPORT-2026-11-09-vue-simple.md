# Rapport — lot « Vue simple »

Consigne de Cowork du 9 nov. 2026, 17 h 40. Branche `lot/vue-simple`, partie de `origin/lot/tableau-de-notation-1-bis` (`b6d5926`). Session cloud, Chromium seulement.

> **État de ce fichier : ÉTAPE 1 (la mesure) seulement.** Le rapport final (ce qui est fait, ce qui est supposé, ce qui attend Grégoire, la preuve) viendra EN TÊTE de ce fichier quand le code sera livré. Rien n'est codé au moment où ce texte est poussé.

---

## ÉTAPE 1 — LA MESURE (lecture seule, 9 nov. 2026)

Méthode : lecture du code par quatre agents en parallèle et par moi (`js/config.js`, `js/navigation.js`, `js/tableau-notation.js`, l'en-tête d'`index.html`). **Rien n'a été exécuté dans un navigateur à cette étape** : la colonne « section par section » plus bas est une lecture de code, à confirmer par le banc Playwright du lot. Base mesurée : Vitest 10 963 verts sur 10 963 à `b6d5926`, version 1.239.0.

### 1. La navigation, et la façon la plus étroite de masquer

- Les sections et sous-sections sont déclarées dans `configurationsOnglets` (`js/config.js:32`). Les boutons de la barre principale sont du HTML statique (`index.html:3708-3718`), doublés d'une liste pour les écrans étroits (`#entete-sections-liste`, `index.html:3806`). `afficherSection(nom)` (`js/navigation.js:68`) montre `#section-<nom>` et masque les autres ; une section absente de `configurationsOnglets` s'affiche sans sous-navigation.
- **Constat : la vue simple peut se faire SANS toucher à `js/config.js` ni à `js/navigation.js`.** Une section neuve `#section-simple` dans `index.html`, une seconde barre de cinq entrées à côté de la barre principale, et une classe sur `<body>` qui masque l'une ou l'autre. `afficherSection('simple')` fonctionne tel quel.
- **Décision (technique, la mienne) : je n'use pas de l'autorisation sur les deux fichiers protégés.** Le masquage vit dans le CSS et dans un module neuf. Le banc « navigation de la vue étendue identique avant et après » reste dû et sera livré (il compare entrées, ordre et sous-sections à l'état de `b6d5926`).

### 2. Ce que le code sait d'une application vide

- Aucune fonction générale. Trois approximations existent : `aproposReplie()` (`js/accueil.js:84`, « un trimestre autre que démo existe »), `utilisateurADesDonnees()` (`js/modal-backup-reminder.js:38`, compte les évaluations), `etapesDuCadre()` (`js/trimestre-v2.js:512`).
- Le mode démo se reconnaît : `estEnModeDemo()` (`js/modes.js:1633`), trimestre d'id `demo`, clés `demo_*`.
- **À écrire** : une fonction pure « vide » = aucun élève dans la liste (`<trimestre>_groupeEtudiants`) d'aucun trimestre hors démo.
- Les élèves sont une liste plate par trimestre, pas rangés dans un objet « groupe ». **Supposition** : « aucun groupe avec au moins un élève » se lit « aucun élève inscrit, dans aucun trimestre ».

### 3. Où garder le choix de la vue

- Le thème clair/sombre vit dans `preferencesUtilisateur` et **voyage avec le codex** : ce n'est pas le bon endroit.
- À l'export, seules les clés `_codex_*` sont exclues (`js/codex.js:476`) ; à l'ouverture d'un codex, les clés qui commencent par `_` ne sont pas écrites (`js/codex.js:440`).
- **Décision** : le choix de la vue s'écrit directement dans `localStorage`, hors de `db.js`, sous une clé à lui. Il n'entre donc ni dans le codex ni dans l'empreinte des données. Seul un choix EXPLICITE est écrit (la bascule, ou avoir bâti sa classe en vue simple) ; sans choix, la règle « vide → simple, sinon étendue » est recalculée à chaque démarrage.

### 4. Coller une liste, créer trimestre, cours, groupe

| Besoin | Ce qui existe | Réutilisé ? |
|---|---|---|
| Créer un trimestre sans formulaire | `creerTrimestre(session, annee)` puis `changerTrimestreActif(id)` (`js/trimestres.js:509, 547`) | Oui |
| Créer un cours | `CoursEntite.creer(donnees)` (`js/entites/cours-entite.js:82`) | Oui |
| Inscrire des élèves | `db.modifier(cle('groupeEtudiants'), …)` | Oui |
| Créer un groupe-cours | **Aucune fonction** : le seul chemin passe par le formulaire du Cadre, qui exige horaire et enseignant. `creerMonService()` (`js/rencontres.js:310`) fait déjà toute la chaîne en coulisse, sans horaire, mais pour un « service » d'orthopédagogie | Le motif, pas la fonction |
| Lire une liste collée | `analyserListeEtudiantsCollee` exige quatre colonnes (format Omnivox, avec le groupe) ; `analyserListeEleves` (rencontres) accepte trois colonnes mais **invente un DA provisoire**, ce que la règle « aucun DA inventé » interdit ailleurs | Non : un lecteur neuf, DA de 7 chiffres, rien d'inventé |

- Le trimestre né en coulisse : un identifiant tiré de la date du jour (A, H ou E + année), **sans dates de début ni de fin, sans horaire, sans congé**. `genererCalendrierComplet()` écrit alors un calendrier vide, sans planter (`js/trimestre.js:55`).
- Le groupe-cours : `horaireId: null`, pratique vide, comme celui d'un service.
- Le cours : il lui faut un nom. **Supposition** : un champ facultatif « Nom du cours » sur l'écran Classe ; laissé vide, le cours s'appelle « Mon cours » (texte PROPOSÉ). C'est le seul mot inventé du trimestre né en coulisse, et il se lit dans la colonne « Cours » du CSV.

### 5. Choisir un modèle et la règle

- Trois modèles prêts existent pour ces deux familles (`js/pratiques-bibliotheque.js:30`) : « N meilleures évaluations » et « N plus récentes » (standards), « Modèle simple » (spécifications : deux types, Projet et Examen ; deux paliers, 90 et 70).
- L'installation existante (`ajouterPratiqueALaSelection`, `js/pratiques-gestion.js:756`) passe par des fenêtres de la vue étendue ; l'assignation au groupe est `PratiqueManager.changerPratiqueActive(id)` (`js/pratiques/pratique-manager.js:64`).
- **La règle, en standards** : `portfolio.methodeSelection` (meilleures, plus récentes, toutes) et `portfolio.nombreARetenir`. **En spécifications** : les paliers (une note pour un nombre de productions acceptables par type).
- Un modèle par standards a besoin d'une échelle : l'échelle de départ du trimestre (`ECHELLE_IDME_DEPART`, cinq niveaux) est semée par `assurerEchelleIdmeDeDepart()` (`js/echelles.js:386`).
- **Ce qui remonte à Grégoire** : les valeurs de départ des modèles sont celles qui existent déjà (7 meilleures, 5 plus récentes, paliers 90 et 70). Je n'en invente aucune ; l'enseignant les change à l'écran Pratique.

### 6. « + Production » : la production la plus légère

- Clé `cle('productions')`. Le formulaire exige titre, type, et une pondération sauf en standards.
- Le tableau et le calcul acceptent, en standards : `{ id, titre, type: 'autre', coursId, dateEcheance }`. Aucun lien à un standard n'est requis ; ni grille, ni échelle (celle de la pratique sert).
- **En spécifications, une production ne devient une colonne que si son type est un des types de la pratique.** « Un nom et une date, rien d'autre » ne suffit donc pas quand la pratique a plus d'un type. **Supposition** : « + Production » ajoute alors un troisième champ, le type, et seulement dans ce cas.

### 7. « Arrête les notes »

- Aucun geste n'arrête les notes d'un trimestre. Ce qui s'en approche : la case « Notes finalisées » des réglages d'une pratique (`configuration.notesFinales`). Elle change des libellés (« Note finale » au lieu de « Note provisoire », statut `final` au CSV) **et, en standards, compte zéro pour une production obligatoire non remise**. Elle ne verrouille rien.
- **Cela touche le sens d'une note : je ne l'offre pas en vue simple.** La carte 4 sera livrée avec la note et l'export seulement. Question pour Grégoire au rapport final.
- L'export existe : `exporterSyntheseResultatsCSV()` (`js/export-resultats-finaux.js:190`), colonnes DA, Nom, Prénom, Groupe, Cours, Trimestre, Pratique, Note finale, Statut, Non comptées.

### 8. Le sélecteur de l'en-tête

- **L'en-tête ne porte pas de sélecteur de trimestre.** La bande pâle porte un sélecteur de **groupe-cours** (`#selectGroupeCoursHeader`, `index.html:3827`), avec les mots « groupe-cours » et « Cours (tous groupes) ».
- **Décision** : en vue simple, la bande pâle est masquée. Résultats et Note finale portent leur propre sélecteur de groupe, affiché seulement s'il y a plus d'un groupe. **Supposition** : il liste les groupes du trimestre actif ; changer de trimestre reste un geste de la vue étendue.

### 9. « Sauvegarder »

- Le bouton « Codex » (`#btn-codex`, `index.html:3723`) ouvre un **menu déroulant** de douze entrées (`#codex-menu`). Son en-tête (`#codex-menu-statut-haut`) est réécrit à chaque ouverture par `_actualiserMenu()` (`js/codex.js:3206`) : c'est là que la phrase peut s'afficher.
- Presque chaque entrée porte le mot « codex », et d'autres portent « Archiver », « Fusionner », « codex data ». **Décision** : en vue simple, le menu montre la phrase, puis deux gestes seulement, « Enregistrer dans un fichier » et « Ouvrir un fichier… » (textes PROPOSÉS), branchés sur les mêmes actions qu'aujourd'hui. Le point d'état ne change pas.
- **Chemin détourné qui reste** : le geste d'enregistrement lui-même (aperçu « Mettre à jour le codex », barre « Génération du codex », confirmation « Codex mis à jour ») dit « codex ». Il vient après la phrase qui introduit le mot. Je ne réécris pas ces fenêtres : disposition au rapport final.

### 10. Les parcours d'assistance

- Aucun parcours ne démarre seul (`js/assistance.js:13`). Ils se proposent par l'entrée « Assistance » du menu, par l'accueil étendu, et par des flèches et bulles automatiques (`js/accompagnement.js:765`).
- En vue simple : le menu ne porte que « Vue étendue », l'accueil étendu n'est pas affiché, et les flèches sont coupées par une garde sur la vue dans `estAccompagnementActif()`.

### 11. Le passage vers la vue étendue, section par section

Lecture de code, devant un trimestre né en coulisse (un cours, un groupe, des élèves, une pratique, des productions, des résultats ; ni dates, ni horaire, ni grille).

| Section | Verdict | Ce qui manque |
|---|---|---|
| Accueil | tient | |
| Cadre › Trimestre | tient | |
| Cadre › Calendrier | **vide sans explication** | se rabat sur août 2025 et montre des mois vides (`js/calendrier-vue.js:478`) |
| Conception | tient | états vides existants |
| Évaluation › Liste et tableau | tient | |
| Évaluation, ouvrir une copie | message existant | « Grille introuvable » (`js/evaluation-chargement.js:1325`) |
| Évaluation, bandeau d'étape | **affirme à tort** que l'horaire est configuré (`js/transitions.js:65`) | |
| Suivi › Groupe | **vide sans explication** pour l'assiduité (`js/tableau-bord-apercu.js:1794`) | |
| Suivi › Présences | **bloqué sans dire pourquoi** : « hors du calendrier scolaire » pour toute date (`js/saisie-presences.js:718`) | |
| Dépistage (profil) | tient | message explicite sans grille |

Aucun accès qui lèverait une erreur n'a été trouvé à la lecture ; le banc le vérifiera en console.

### 12. Les chemins détournés vers un mot interdit

1. Le menu du bouton de l'en-tête (traité, § 9) et le geste d'enregistrement (reste, § 9).
2. Les textes fixes du tableau : la légende du point, la phrase sur les critères (arrêté par Grégoire), mais aussi **trois messages d'état qui nomment des écrans de la vue étendue** (« Conception › Pratiques », « Cadre › Trimestre », « Conception › Productions ») et le lien « Réglages de la pratique » qui y mène. En vue simple, ils seront remplacés par des textes propres (PROPOSÉS) ; ceux de la vue étendue, validés mot pour mot, ne bougent pas.
3. Une case évaluée avec une grille ouvre la copie dans l'éditeur de la vue étendue. En vue simple, elle se lit et ne s'ouvre pas.
4. Les infobulles au survol (`data-tooltip`) et les flèches automatiques : coupées en vue simple.
5. Le bandeau de version et son bouton « Voir les nouveautés » (le journal des versions nomme tout) : le bouton est masqué en vue simple.
6. Le rappel « Mets ton codex à jour » (1,5 s après le démarrage, dès qu'il existe des résultats) : il dit « codex ». **Je le laisse** : le couper retirerait une protection contre la perte de données. Disposition au rapport final.
7. La cause « Seule l'évaluation terminale a une note… les artefacts du portfolio… » (`js/pratiques/pratique-registre.js:933`) : elle ne peut paraître que s'il existe une production terminale, donc jamais chez un novice de la vue simple.
8. Le bandeau « Mode démonstration » : la démo ne s'ouvre que depuis la vue étendue.

### Ce que la mesure contredit ou nuance dans la consigne

- « Le sélecteur de trimestre de l'en-tête » n'existe pas (§ 8).
- « Arrête les notes » n'a pas de geste (§ 7) : la carte 4 promet plus que ce qui est livré. Le texte de Cowork est gardé tel quel, marqué PROPOSÉ, et signalé.
- « Un nom et une date, rien d'autre » ne tient pas en spécifications à plusieurs types (§ 6).
- Rien ne contredit une décision arrêtée par Grégoire : je continue.
