# Audit de la section Aide – 24 octobre 2026

> Mené par Cowork (session dans le nuage) le samedi 24 octobre 2026, de 15 h à 18 h 25 (Toronto), à la demande de Grégoire : « revoir la section Aide afin de la mettre à jour en fonction du code, mais aussi afin de la rendre moins verbeuse ». Base lue : le dépôt public `labo-codex` sur GitHub, commit `35745bd` (23 oct., 19 h 46, version 1.216.2), parce que le Mac ne répondait pas au début de la session. Déposé dans le dépôt le 24 oct. au soir, sur `main` = `dc39bff2`.
> Page de travail de Grégoire (ses choix, le relevé) : l'artefact « Audit de l'Aide ».
> ⚠ **Les numéros de ligne cités dans ce dossier sont ceux de `35745bd`.** Depuis, la 1.217.0 et le lot 2 bis (#1151) ont décalé `index.html` (la section Aide d'environ 59 lignes au moins). **Repère toujours une entrée par son id** (`accordeon-aide-…`), jamais par sa ligne.

## Ce que contient ce dossier

| Fichier | Contenu |
|---|---|
| `AUDIT-AIDE-2026-10-24.md` | ce fichier : méthode, résultats, décisions de Grégoire, verdict et disposition de chaque entrée |
| `lot-1-introduction.md` à `lot-6-reference.md` | le détail, entrée par entrée : chaque écart avec sa preuve `fichier:ligne`, la redite, le verdict, les tests qui l'épinglent |
| `lot-7-trous.md` | l'audit dans l'autre sens : 144 gestes inventoriés au code, ceux que l'Aide ne couvre pas, et ce qu'elle décrit et qui n'existe plus |

Le plan d'exécution est dans `plans de travail/PLAN-2026-10-24-refonte-de-l-aide.md`.

## Méthode

- **Périmètre** : la section Aide d'`index.html` (75 entrées, environ 20 900 mots, six sous-sections). Hors périmètre : l'aide contextuelle et la visite guidée (lues seulement pour repérer les doublons), les tutoriels du blogue (autre chantier, décision de Grégoire). L'Aide doit rester **autonome** : aucun renvoi externe comme seule explication (décision de Grégoire, 24 oct.).
- **Deux tests par entrée.** *Est-ce encore vrai ?* : chaque affirmation vérifiable confrontée au code. *Est-ce que ça sert ?* : redite de l'écran, doublon, théorie qui n'aide à aucun geste, historique, langue de code, exemples réductibles.
- **Base** : les audits du 10 septembre (`AUDIT-AIDE-CONFORMITE-2026-09-10.md`) et du 15 octobre (`COMPARAISON-AUDIT-AIDE-2026-10-15.md`). Les corrections du 15 octobre sont livrées (`c263041` et suivants) et tiennent.
- **Sept lectures parallèles en lecture seule** : six lots d'entrées, un lot du code vers l'Aide. Six constats contre-vérifiés au code par Cowork, six confirmés (report des interventions, bouton « Régénérer », aperçu des présences, suppression d'un trimestre, plafond des jetons, règle « Aucun »).
- **Puis un tri par ancrage**, à la demande de Grégoire : chaque entrée confrontée à l'audit des intentions d'octobre (`plans de travail/observation/`, version 1.199.0) : les 103 conclusions qu'il a classées « voulu et fait » (`10-description-application.md`), les 11 « fait sans être voulu » (bugs, `8-interpretation.md`), les 29 intentions non faites (`11-confrontation-prevu-pas-fait.md`). Règle : une entrée garde sa place si elle explique un comportement voulu et fait, ou une fonction venue après la 1.199.0 (le code fait alors foi) ; ce qui promet une intention non faite sort ; ce qu'un bug empêche attend le correctif ; ce qui ne s'ancre sur rien est candidat à la coupe.

## Résultats

- **Vrai ?** 6 entrées exactes, 1 à voir à l'écran, **68 avec au moins un écart**.
- **Ancrage** : 24 entrées ancrées, 31 ancrées en partie, 16 sans ancrage, 4 postérieures à l'audit d'octobre. Le tri a revu 12 verdicts.
- **Verdicts finals** : garder 2, couper 14, fusionner 17, corriger ou resserrer 42.
- **Mots** : environ 20 900 aujourd'hui, environ 7 700 visés, plus environ 700 pour les sept trous.
- **Trous** : sur les 103 comportements voulus et faits, 46 ne sont expliqués par aucune entrée (dont une vingtaine de mécanique interne, sans place dans une Aide). Au code : 144 gestes, 52 couverts, 32 mentionnés sans explication, 60 absents.
- **Dans l'autre sens** : 14 écrans ou boutons décrits par l'Aide n'existent plus (`lot-7-trous.md`, §3).
- **Contre un comportement voulu** : la carte RàI dit « l'objectif n'est pas de classer les étudiant·es » ; la carte « Une donnée, une seule source » dit « jamais deux chiffres contradictoires » ; « Consulter l'aperçu » dit « il ne les recalcule pas ».
- **Intentions non faites que l'Aide promet** : 2.92 (la colonne « CAF » lue comme « Mesure d'aide ») dans `groupe` ; 7.65 (les présences suivent toute modification d'une intervention) dans `rai-absences`.
- **Gestes qu'un bug empêche encore** : l'import des résultats du bilan réflexif (#1054, vérifié au code le 24 oct.) dans `bilan-reflexif` ; la suppression d'un bloc par la corbeille de la carte (#1070) dans `lecons`.

## Les décisions de Grégoire (24 oct. 2026, 18 h 24, relevé de sa page, recopié tel quel)

| Décision | Recommandation de Cowork | Réponse |
|---|---|---|
| D1 Où va la théorie | L'Aide dit ce que l'application fait de chaque notion et renvoie au guide intégré (`js/guides-pedagogiques.js`) pour la théorie | retenue |
| D2 Ta pratique présentée comme la règle | Le niveau M qui « prédit la réussite dans le cours suivant », « organiser, être rigoureux, s'exprimer correctement », « doivent rester les mêmes » : présentés comme son exemple, au conditionnel ; l'affirmation sur le cours suivant retirée | retenue |
| D3 Les bornes du niveau RàI | 64 % et 75 %, fixes, tirées d'IDME : question inscrite au code (la RàI devrait-elle suivre l'échelle de chacun ?) ; d'ici là, l'Aide dit les bornes telles qu'elles sont | retenue |
| D4 Deux règles fixes que l'Aide tait | La couleur du badge « Contexte d'apprentissage » (85, 75, 65 % sur A et C ensemble) et le rappel « Mobilisation » (A ou C sous 75 %) : une phrase dans l'entrée du profil | retenue |
| D5 Le mot « sous-critère » | Une seule définition : un sous-critère est un élément observable ; dans un critère algorithmique, c'est une catégorie de ce qu'on compte | retenue |
| D6 « Élève 1, Élève 2 » | Le mode anonymisé affiche « Étudiant·e 1, Étudiant·e 2 » | retenue |
| D7 L'encadré Loi 25 | « les données de tes étudiant·es » | retenue |
| D8 Le courriel pour le codex | Retirer le courriel des moyens de transfert du codex ; ne proposer que des supports que l'enseignant·e contrôle | retenue |
| D9 « Temps estimés par activité » | Couper l'entrée | retenue |
| D10 Un prénom dans un exemple | Tous les noms d'exemple remplacés par des noms manifestement fictifs | retenue (aucune note : rien n'indique un nom réel) |
| D11 La forme de l'Aide | Ranger par onglet, chaque fonction à une seule place : environ 55 entrées | retenue |
| D12 Les trous à combler d'abord | Sept trous (voir plus bas) | **autrement** : « 2 : ça dépend de la pratique de notation ; la note n'est pas construite partout de la même façon » |
| D13 Ce que l'Aide dit du classement | « Elle dépiste des difficultés et classe des niveaux de besoin, pour éclairer et soutenir tes décisions d'intervention et d'accompagnement. » La négation retirée | retenue |

Et sur les entrées : 74 accords explicites ; une question sur `modes-formation` (« quels sont ces deux “modes” ? »). Réponse de Cowork : Normal et Anonymisé, un seul bouton de l'en-tête (`js/modes.js`, deux modes depuis le retrait de « simulation ») ; d'où une seule entrée « Le mode anonymisé ». **Fusion confirmée par Grégoire à 18 h 25 (« oui »).**

### Les sept trous, après la nuance de Grégoire sur le point 2

1. Supprimer : le codex proposé avant presque toute suppression ; le codex à part et le nom à ressaisir pour un groupe ou un trimestre ; le cours qui porte des données et ne se supprime pas.
2. **Comment chaque pratique de notation construit la note, famille par famille** (et non une règle unique : décision du 24 oct.) ; les règles communes seulement si le code les vérifie pour toutes les familles.
3. Les présences : tout le monde présent par défaut ; verrouiller une séance non saisie compte présent·es les étudiant·es non marqué·es ; « Confirmer la séance ».
4. Le panneau « Détails » du Suivi du groupe : qui y entre, le score d'urgence qui les range.
5. Les rencontres d'un service d'orthopédagogie, et le DA provisoire qui commence par 9.
6. Ce qui sort de l'application : l'export des résultats finaux pour Léa, l'export anonymisé avec sa table de correspondance et sa clé, le contenu du rapport de bogue.
7. Les archives de fin de trimestre : archiver le trimestre, vérifier, renvoyer aux archives, archiver les copies, faire revenir.

Ce sont des textes neufs : Cowork les propose à Grégoire, qui les corrige, avant toute intégration (lot 4 du plan).

## Les 75 entrées : verdict final et disposition

`#FICHE-AIDE` : la fiche du chantier, inscrite au BACKLOG par le lot 1 (étape 1), qui remplace ce repère par son numéro.

| Entrée (id `accordeon-aide-…`) | Titre actuel | Ancrage | Verdict final | Mots : avant → visés | Place dans la nouvelle forme | Disposition |
|---|---|---|---|---|---|---|
| `presentation` | « Présentation de l'application » | Ancrée en partie | Corriger et resserrer ; ne garder que « Où vont tes données ? » | 702 → ~120 | Commencer | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `monitorage` | « Comprendre le suivi de l'apprentissage » | Sans ancrage | Couper ; une phrase passe dans « Présentation de l'application » | 203 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `acp` | « Lire les indices A-C-P de tes étudiant·es » | Ancrée en partie | Corriger et resserrer | 120 → ~80 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `rai` | « La Réponse à l'Intervention (RàI) » | Ancrée en partie | Corriger et resserrer | 279 → ~120 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `solo` | « La taxonomie SOLO : évaluer la profondeur de l'apprentissage » | Ancrée en partie | Fusionner avec « Appliquer l'échelle IDME » | 205 → ~150 pour les deux | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `pan` | « Les pratiques alternatives de notation (PAN) » | Ancrée en partie | Resserrer | 408 → ~150 | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `suivi-apprentissage` | « Suivi de l'apprentissage et dépistage SOLO » | Ancrée en partie | Corriger et resserrer | 427 → ~220 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `criteres` | « Tes critères d'évaluation : le socle du dépistage » | Ancrée en partie | Fusionner dans « 5b. Configurer la grille de critères pour le dépistage » | 244 → ~60 versés | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `srpnf` | « Utiliser la grille SRPNF (PAN – Standards) » | Sans ancrage | Couper | 92 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `idme` | « Appliquer l'échelle IDME » | Ancrée | Fusionner avec « La taxonomie SOLO : évaluer la profondeur de l'apprentissage » | 109 → compté avec SOLO | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `ssot` | « Une donnée, une seule source » | Sans ancrage | Couper | 93 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `modes` | « Choisir ton mode d'utilisation » | Sans ancrage | Fusionner avec « Les deux modes de l'application » | 157 → compté avec celle-ci | Commencer | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `partage` | « Partager tes ressources pédagogiques » | Ancrée en partie | Corriger et resserrer | 224 → ~70 | Codex et archives | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `etapes-config` | « Étapes de configuration » | Ancrée | Fusionner avec « 2. Section Trimestre - Configuration centralisée » et « Checklist de configuration » | 111 → ~150 pour les trois | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `prise-en-main` | « Prendre en main l'application » | Ancrée en partie | Resserrer | 144 → ~80 | Commencer | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `cours` | « 1. Configurer le cours » | Ancrée | Corriger et resserrer | 73 → ~45 | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `trimestre` | « 2. Section Trimestre - Configuration centralisée » | Ancrée en partie | Fusionner avec « Étapes de configuration » | 182 → compté avec celle-ci | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `groupe-cours` | « 2c. Le concept Groupe-cours » | Sans ancrage | Fusionner avec « Étapes de configuration » ; une phrase de définition, corrigée | 183 → ~20 versés | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `groupe` | « 3. Créer le groupe » | Ancrée | Fusionner avec « Gérer la liste des étudiant·es » | 73 → ~110 pour les deux | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `horaire` | « 4. Établir l'horaire » | Ancrée | Corriger | 63 → ~55 | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `pratique` | « 5. Choisir ta pratique de notation » | Ancrée en partie | Resserrer ; garder une phrase par famille, couper « Sur les reprises » | 322 → ~170 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `creer-productions` | « Créer et configurer les productions » | Ancrée | Corriger et resserrer | 185 → ~100 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `creer-grilles` | « Créer une grille de critères » | Ancrée | Corriger | 132 → ~120 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `apporter-grille` | « Apporter une grille que tu as déjà » | Postérieure à l'audit | Corriger et resserrer | 613 → ~420 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `bareme` | « Le barème d’un critère analytique » | Postérieure à l'audit | Garder | 195 → 195 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger) ; texte gardé |
| `creer-echelles` | « Créer une échelle de performance » | Ancrée | Corriger et resserrer | 123 → ~80 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `creer-cartouches` | « Créer une cartouche de rétroaction » | Ancrée | Corriger | 109 → ~100 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `grille-depistage` | « 5b. Configurer la grille de critères pour le dépistage » | Ancrée en partie | Corriger et resserrer | 303 → ~130 | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `sous-criteres` | « 5c. Les critères algorithmiques » | Postérieure à l'audit | Garder | 508 → 508 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger) ; texte gardé |
| `checklist` | « Checklist de configuration » | Sans ancrage | Couper | 52 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `archivage` | « Qu'est-ce que clore un trimestre ? » | Postérieure à l'audit | Corriger | 145 → ~150 | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `preferences` | « Personnaliser les préférences » | Ancrée en partie | Corriger et resserrer | 158 → ~70 | Commencer | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `modes-formation` | « Les deux modes de l'application » | Ancrée en partie | Fusionner avec « Choisir ton mode d'utilisation » : une entrée « Le mode anonymisé » | 107 → ~80 pour les deux | Commencer | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `demo` | « Explorer la démonstration » | Ancrée | Corriger et resserrer | 199 → ~110 | Commencer | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `parcours` | « Deux parcours selon ton expérience » | Sans ancrage | Couper | 175 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `validation-grille` | « Valider ta configuration : Tests de la grille de référence » | Sans ancrage | Couper | 489 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `flux-travail` | « Flux de travail hebdomadaire » | Sans ancrage | Couper | 45 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `etudiants` | « Gérer la liste des étudiant·es » | Ancrée | Fusionner avec « 3. Créer le groupe » | 162 → compté avec celle-ci | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `lecons` | « Planifier les leçons » | Ancrée en partie | Corriger et resserrer ; déplacer vers la Conception ; retirer la suppression par la corbeille jusqu'au correctif | 676 → ~200 | Conception | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `preparer-importer` | « Préparer et importer les travaux » | Ancrée | Corriger et resserrer | 289 → ~180 | Évaluation | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `annoter-evaluer` | « Annoter et évaluer un travail » | Ancrée | Corriger et resserrer | 375 → ~245 | Évaluation | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `exporter-archiver` | « Exporter les travaux » | Ancrée | Resserrer | 167 → ~120 | Évaluation | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `saisie-presences` | « 1. Saisir les présences » | Ancrée | Corriger | 135 → ~90 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `evaluer-productions` | « 2. Évaluer les productions » | Ancrée en partie | Fusionner dans « Annoter et évaluer un travail » | 111 → ~25 versés | Évaluation | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `gerer-jetons` | « 3. Gérer les jetons » | Sans ancrage | Couper | 79 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `irrecevables` | « 4. Gestion des travaux irrecevables et non-remis » | Ancrée | Corriger et resserrer | 574 → ~250 | Évaluation | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `verification-hebdo` | « 5. Vérification hebdomadaire » | Ancrée en partie | Couper | 67 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `snapshots` | « 6. Captures de progression hebdomadaires » | Ancrée en partie | Corriger et resserrer | 457 → ~150 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `collaboration` | « 7. Collaboration entre collègues » | Ancrée en partie | Corriger et resserrer | 909 → ~220 | Codex et archives | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `rai-absences` | « 8. Interventions RàI avec absences motivées » | Ancrée en partie | Fusionner dans « Planifier les interventions RàI » ; n'en garder que la case de report | 682 → ~40 versés | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `tirage-sort` | « Utiliser le tirage au sort » | Ancrée | Corriger et resserrer | 136 → ~70 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `modelisation` | « Modéliser en projection » | Sans ancrage | Fusionner avec « Labo — Analyser ta démarche pédagogique » ; une phrase dans la vue d'ensemble | 150 → ~25 versés | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `jetons-reprise` | « Utiliser les jetons de reprise » | Ancrée en partie | Corriger et resserrer | 261 → ~170 | Évaluation | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `temps-estimes` | « Temps estimés par activité » | Sans ancrage | Couper (décision 9) | 32 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `tableau-bord` | « Consulter l'aperçu » | Ancrée | Corriger | 65 → ~70 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `presences-apercu` | « Consulter l'aperçu des présences » | Sans ancrage | Couper | 92 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `presences-calendrier` | « Lire le calendrier des présences » | Ancrée en partie | Corriger et resserrer | 87 → ~35 | Cadre | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2a |
| `profil-etudiant` | « Interpréter le profil d'un·e étudiant·e » | Ancrée | Fusionner avec « Guide détaillé : Profil étudiant » | 159 → ~350 pour les deux | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `diagnostics` | « Comprendre les diagnostics automatiques » | Ancrée | Corriger | 143 → ~120 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `rai-solo` | « Options configurables : RàI et SOLO » | Ancrée en partie | Corriger et resserrer | 332 → ~120 | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `patterns` | « Repérer les patterns de progression » | Ancrée en partie | Corriger et resserrer | 361 → ~170 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `guide-profil` | « Guide détaillé : Profil étudiant » | Ancrée en partie | Fusionner avec « Interpréter le profil d'un·e étudiant·e » | 1307 → compté avec celle-ci | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `planifier-rai` | « Planifier les interventions RàI » | Ancrée | Fusionner avec « 8. Interventions RàI avec absences motivées » ; ce texte comme base | 209 → ~150 | Suivi | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2b |
| `labo` | « Labo — Analyser ta démarche pédagogique » | Ancrée en partie | Corriger et resserrer | 355 → ~180 | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `bilan-reflexif` | « Bilan réflexif — Recueillir l'expérience vécue » | Ancrée en partie | Corriger et resserrer ; retirer l'import des résultats jusqu'au correctif | 379 → ~150 | Labo | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `glossaire` | « Glossaire — 48 termes du parcours » | Ancrée | Corriger | 21 → ~12 | Référence | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `seuils-critiques` | « Seuils critiques d'alerte » | Sans ancrage | Couper | 39 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `architecture` | « Une donnée, une seule source (rappel) » | Sans ancrage | Couper | 62 → 0 | (coupée) | inscrit #FICHE-AIDE, lot 1 |
| `problemes` | « Résolution de problèmes courants » | Ancrée en partie | Corriger et resserrer | 130 → ~70 | Référence | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `faq` | « Questions fréquentes (FAQ) » | Ancrée en partie | Corriger et resserrer | 880 → ~310 | Référence | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `glossaire-statique` | « Glossaire des termes » | Ancrée en partie | Fusionner dans le glossaire de l'aide contextuelle | 1770 → 0 ici, ~500 au glossaire | Référence | inscrit #FICHE-AIDE, lot 1 (ranger), lot 3 (un seul glossaire) |
| `export-import` | « Ouverture et partage de tes données » | Ancrée | Corriger et resserrer | 325 → ~150 | Codex et archives | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `codex` | « Le Codex — Espace de travail portable » | Ancrée | Corriger et resserrer | 426 → ~220 | Codex et archives | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `ressources` | « Ressources et documentation » | Sans ancrage | Resserrer ; ne garder que la bibliographie | 441 → ~120 | Référence | inscrit #FICHE-AIDE, lot 1 (ranger), lot 2c |
| `apropos` | « À propos de l'application » | Ancrée en partie | Couper ; une ligne renvoie à Réglages › À propos | 86 → ~15 | (coupée) | inscrit #FICHE-AIDE, lot 1 |

## Trouvé hors de la section Aide

| Constat | Preuve (à `35745bd`) | Disposition proposée |
|---|---|---|
| Le message affiché au choix « Non recevable » dit « sera exclue des calculs de moyenne » ; en sommative, elle vaut 0 dans la note | `js/evaluation-sauvegarde.js:614-619` | inscrit #FICHE-AIDE, lot 5 |
| Réglages › Données annonce « triple confirmation + mot de passe » ; le code : codex à part, deux confirmations, « EFFACER » | `index.html:9722` ; `js/import-export.js` (`reinitialiserDonnees`) | inscrit #FICHE-AIDE, lot 5 |
| L'écran Grilles de critères dit que les grilles peuvent être « verrouillées une fois finalisées » ; aucun geste ne le fait | `index.html:4970` ; `js/grilles.js:1185, 2097` | inscrit #FICHE-AIDE, lot 5 |
| « Exporter ma config » annoncé « ZIP léger » ; il télécharge un .json et un LISEZMOI.txt | `index.html:9488` ; `js/accompagnement-contenu-hover.js:197` ; `js/import-export.js:4048-4087` | inscrit #FICHE-AIDE, lot 5 |
| La pratique propose encore « Reprise ciblée », qu'aucun geste n'applique (#563) | `index.html:6155-6168, 8358` | inscrit #FICHE-AIDE, lot 5 (mesure d'abord : retirer l'option touche une pratique déjà configurée, donc ses données) |
| L'aide contextuelle d'Annoter conseille « …8a, …8b » pour assembler des pages ; noms de famille en exemple | `js/accompagnement-contenu-popup.js:509, 513` | inscrit #FICHE-AIDE, lot 1 (les noms, D10) et lot 5 (la règle) |
| Le profil et l'encart de la démo parlent encore de risque ou d'indice E | `js/profil-etudiant-sections-affichage.js:1081, 2699, 3392` ; `js/guidage-demo.js:17` | inscrit #FICHE-AIDE, lot 5 |
| La popup de Conception donne une formule d'erreurs qui n'est aucun des trois modèles, et exige que les pondérations totalisent 100 % | `js/accompagnement-contenu-popup.js:177, 186` ; `js/evaluation-formules.js:93-152` | inscrit #FICHE-AIDE, lot 5 |
| La note « i » des corrélations parle de points carrés ; le graphique dessine des cercles | `index.html:9210` ; `js/correlations-longitudinales.js:406-420` | inscrit #FICHE-AIDE, lot 5 |
| Bulles d'onglet Animation, Modélisation, Rythme de travail périmées ; Exploration des pratiques et Suivi longitudinal sans bulle | `js/accompagnement-contenu-hover.js:771-772, 788-791` ; `js/navigation.js:149-191` (zone protégée) | inscrit #FICHE-AIDE, lot 5 (`navigation.js` : autorisation de Grégoire requise) |
| « Élève » dans des textes d'écran et le formulaire d'intervention | `index.html:7520, 8984` ; `js/bilan-reflexif-parcours.js:36-38` ; `js/interventions.js:1080-1081` | inscrit #FICHE-AIDE, lot 5 |
| L'infobulle des outils RàI dit « ciblé » en minuscules ; la sentinelle, sensible à la casse, ne le voit pas | `js/accompagnement-contenu-hover.js:149` | inscrit #FICHE-AIDE, lot 5 (et la sentinelle rendue insensible à la casse) |
| « En savoir plus » d'un terme souligné ouvrirait l'Introduction de l'Aide plutôt que la fiche du terme | `js/navigation.js:445` (zone protégée) | à voir à l'écran ; lot 5 si confirmé |
| Le nom du fichier .lcz porte « CC-BY-SA » ; la licence est BY-NC-SA | `js/cc-license.js:1565` contre `js/partage-schemas.js:45` | inscrit #FICHE-AIDE, lot 5 (mots publics : le nom du fichier est vu par les collègues) |
| Le champ « Séance concernée » d'une intervention de rattrapage n'a pas de lecteur | `js/interventions.js:1838, 1905-1944` | à voir à l'écran ; commenter dans le code (issue 3) si rien ne s'affiche |
| Branche morte de l'ancien assistant d'« Apporter mon matériel » | `js/materiel-assistant.js:233, 297, 373-375` | inscrit #FICHE-AIDE, lot 5 (retrait du code mort) |
| Un test du 10 sept. reste vert à tort : il trouve « Régénérer » sur le bouton de la rétroaction | `tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js` ; `index.html:8701` | inscrit #FICHE-AIDE, lot 1 (le test resserré avec la coupe) |
| Les bornes du niveau RàI fixes (64 %, 75 %), sans lien avec l'échelle de l'utilisateur | `js/interpretation-config.js:43-46` | inscrit à part (D3) : question de pédagogie, une fiche distincte, sans code tant que Grégoire n'a pas tranché |

## Limites

- Rien n'a été vu à l'écran : les points qui l'exigent sont marqués « à voir à l'écran ». L'historique avant le 4 octobre n'était pas dans la copie lue.
- L'audit des intentions décrit la 1.199.0, observée avec des données fictives dans Chromium ; il n'a pas pu écrire de fichiers (codex, archives). « S'ancre » est une lecture, pas une mesure. Le groupe-cours, les jetons, le mode anonymisé et la Modélisation n'y ont aucune conclusion : ces fonctions existent et sont voulues ; pour elles, le code a fait foi.
- Les mots visés sont des estimations. Une lecture du code juge moins bien qu'un·e enseignant·e si une explication aide vraiment ; c'est pourquoi les coupes ont été soumises une à une à Grégoire (74 accords explicites).
- Depuis `35745bd` : la 1.217.0 (bibliothèques de la Conception en menu) et le lot 2 bis (#1151, le profil individuel en rangée de sélection) changent deux écrans que l'Aide décrit. Le lot 2 les décrit tels qu'ils sont alors.
