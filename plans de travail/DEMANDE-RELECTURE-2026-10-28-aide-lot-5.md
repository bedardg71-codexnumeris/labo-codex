# Demande de relecture – L'Aide, lot 5 : les textes d'écran qui contredisaient le code (#1152)

> Claude Code, jeudi 29 octobre 2026, sur `main` (non poussé). Consigne : `CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md`. Textes : `TEXTES-2026-10-28-textes-d-ecran.md`.
> Commits : `6c954d61` (les quinze textes validés), `6f65ecbf` (les décisions), et un troisième (les mesures du § 1.3, la sentinelle, cette demande).
> Vitest (depuis `tests/`) : 847 fichiers, 10 245 tests, tout vert. Playwright ciblé : voir § 5. Aucune release, aucun verdict Playwright complet, aucun push.

## 1. Les textes validés (n° 1 à 5, 7 à 16) – `6c954d61`

Tous posés mot pour mot. Le seul tri typographique : l'espace insécable devant « % » (n° 7 et 16), qu'exige `sentinelle-nombres-a-la-francaise-1137` ; les mots ne changent pas.

| N° | Où | Mesure à l'intégration |
|---|---|---|
| 1 | `index.html`, sous « Réinitialiser toutes les données » | vrai : `reinitialiserDonnees`, codex à part, deux `confirm`, `prompt` « EFFACER » |
| 2 | `index.html`, note des grilles | vrai (aucun geste ne verrouille une grille) |
| 3 | `index.html` et sa bulle `donnees-config-export` | vrai : un .json et un LISEZMOI.txt, `import-export.js:4112-4150` |
| 4 | aide « i » `evaluations-annoter` | **l'exemple « Essai_1234567_Artefact-8-p1.jpeg » est FAUX à la mesure** (voir ci-dessous) ; le paragraphe multi-pages, recopié de l'Aide, vrai |
| 5 | profil, « À propos de cette section » (Accompagnement) | vrai : les trois cartes, « Confidentiel », « + Nouvelle intervention » existent ; « Échelle visuelle de positionnement du risque » ne se rend nulle part ailleurs |
| 7 | aide « i » `construction-grilles` | vrai : `couleurDuTotal` (orange, rouge, vert, aucune en points), les trois calculs tout faits, « Retoucher ce calcul », « Composer ton propre calcul » |
| 8, 15 | note « i » de « Dynamique des corrélations » | vrai : `correlations-longitudinales.js`, cercles vides ou pleins |
| 9 | huit bulles du Labo et de l'Animation | identifiants réels : `labo-comparateur`, `labo-longitudinal` ; les deux lignes de `js/navigation.js` (autorisation de Grégoire), rien d'autre dans ce fichier |
| 10 | `genererNomFichierExport` | vrai ; aucun lecteur ne cherche « CC-BY-SA » dans un nom. Les deux noms écrits à la main (`objectifs.js:752`, `productions-import-export.js:157`) suivent, même règle |
| 11 | `atelier-algo.js`, l'introduction des cas | la phrase retirée, le reste intact |
| 12 | `materiel.js` | « Revenir à mon étiquetage » ; l'Aide `apporter-grille` le cite désormais |
| 13 | l'import, menu de production d'un fichier | posé ; l'Aide (entrée des jetons) dit « dans le menu « Production de ce fichier » » |
| 14 | fiche d'intervention, bulle `pref-outils-rai` | posé ; l'Aide `planifier-rai` recopie les libellés. Le vocabulaire `rencontres` ne nomme pas de niveaux (« En sous-groupe », « Individuelle ») : il reste |
| 16 | aide « i » `interventions-planification` | vrai : « Suggérer », seuils 0,64 et 0,75 (`obtenirSeuil`, aucun écran ne les règle) |

**Le n° 4, l'écart.** `parserNomFichierLea` ne lit la production que dans le format Léa (`…_Remis_le_…`) ; « Essai_1234567_Artefact-8-p1.jpeg » n'en a pas : l'import y trouve le DA, pas la production, et la page n'est pas numérotée. Comme TEXTES le prévoit, l'exemple devient **« Essai_1234567_Artefact-8-p1_Remis_le_2026-09-15_09h46m45s.jpeg »**, que l'import lit « Artefact-8 », page 1 (la sentinelle le vérifie avec le vrai parseur). Le reste de la ligne est celui de TEXTES.

## 2. Les décisions – `6f65ecbf`

- **« élève » → « étudiant·e »**, une soixantaine de chaînes dans 30 fichiers. **Restent, et pourquoi** :
  - les écrans d'orthopédagogie (`rencontres.js`, le vocabulaire `rencontres` d'`interventions.js`, la bulle et l'Aide des Rencontres) ;
  - **les pseudonymes « Élève 1 », « Élève R1 »** de l'anonymisation : ce sont des données, relues par des motifs (`modes.js`, `_MOTIF_ELEVE_N`), et la décision D6 attend Grégoire ;
  - les citations du Conseil (`guides-pedagogiques.js`) et un titre d'ouvrage (Gauthier et coll.) ;
  - **cas ambigu** : « Élève non associé », nom de dossier dans l'archive ZIP des copies (`travaux-archivage.js:95`), laissé ; c'est un nom de fichier, pas un écran.
  - Les mots relus par Grégoire en septembre (registre longitudinal, #913, #917) suivent la règle : **à lui signaler**.
- **« Exploration des pratiques »** : le titre de l'écran (deux sites), le bouton d'aide, le titre de son aide et le terme du glossaire. Restent « le comparateur » en minuscule, dans trois phrases de l'écran (`comparateur-pratiques.js:59, 69, 722`) et le bouton « Ouvrir le comparateur du Labo » de l'assistant : **inscrit, non changé** (mots).
- **Le guide ACP** cite « Suivi du groupe ».
- **« + Ouvrir » de la Modélisation**, mesuré : le HEIC y est rangé tel quel, sans `HeicDecodeur` (contrairement à l'import) ; seul Safari l'affiche. Le bouton dit « Ouvrir un fichier : PDF, JPG, PNG ; HEIC selon le navigateur ». ⚠ La bulle validée n° 9 (« PDF, JPG, PNG ou HEIC ») ne le dit pas : **à Grégoire**.
- **Le glossaire** : `cours` (c'est le groupe-cours qui est actif ; « Créer la copie » existe), `groupe-cours` (les éléments que l'écran nomme, la phrase de l'Aide), `production` (« la Carte d'alignement »).
- **Le soulignement aux mots entiers** (`regexEnrichissement`). ⚠ **Défaut trouvé par la sentinelle, corrigé dans le troisième commit** : sous le drapeau `u`, le `\-` qu'échappait l'ancien code est une erreur de syntaxe ; « Groupe-cours » aurait fait tomber le soulignement. La sentinelle construit maintenant la regex sur le glossaire réel.
- **Le code mort** : `basculerVerrouillageCritere` et son entrée de `noms_stables.json` (autorisation du 28 oct., 14 h 42 ; rien d'autre dans ce fichier), `allerVersAide`, `ouvrirAideGroupeCours`, et **toute** la branche des rétroactions de l'ancien assistant : `estRetro`, `construireCartouche`, l'écriture de la cartouche (`materiel-creation.js`), la carte « Tes rétroactions » et son bouton (`materiel.js`). L'étiquetage ne pose que `'descripteurs'`.
- **§ 1.4 (Cowork)** : les deux phrases de la reprise, `evaluation-jetons.js:374` et `:715`.

Sentinelles suivies par décision, chacune avec sa ligne « ↻ #1152, lot 5 » : 1119, lot 2b, lot D de l'audit, textes relus du 15 oct., #678, #1012, #1174, #560, #749, #853, #915, lot 29, lot D des présences, et sept bancs `materiel-*` (la cartouche retirée ; deux tests partis avec elle, B.e et W.e).

## 3. Les mesures du § 1.3

| Point | Ce que fait le code | Ce que dit l'écran | Fait |
|---|---|---|---|
| « n/5 configurés » | comptait la **pratique** (facultative), pas le **trimestre** (obligatoire) : un groupe-cours complet sans pratique restait à « 4/5 » | « les 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e » | **technique, fait** : `_trimestreExistePourGC` (sans repli sur le trimestre actif) remplace `_pratiqueExistePourGC`, retirée ; sentinelle #475 suivie (cas 2 et 2 bis) |
| « Reprise ciblée » | aucun geste ne l'applique depuis #563 ; `cibleePlafond` sans lecteur ; `cibleeActif` ne joue plus que dans le compteur du profil (anciennes reprises ciblées) | la case, cochée par défaut, et « Note maximale » | **technique, fait** : bloc masqué (`u-hide`) ; les champs restent dans le DOM, relus et réécrits tels quels : aucune donnée ne bouge |
| « Système de jetons » sous Standards | l'accordéon s'affiche pour toutes les familles ; **le jeton de reprise agit sur une note Standards** (la copie remplacée sort du portfolio) ; le délai n'agit sur aucune note | « Système de jetons », « Activer le système de jetons » | **rien à cacher**. Un écart trouvé, non touché : voir « Pour Grégoire » |
| « Séance concernée » | écrit (`seanceConcernee`), **jamais lu** : le congé (absence motivée) est posé à la date de l'intervention ; `obtenirAbsencesMotiveesParDate` n'a aucun appelant | « Séance concernée : » ; l'Aide : « porte la séance concernée » | **rien fait** : deux sens possibles, voir « Pour Grégoire » |

## 4. Les tests

- **Neuve** : `tests/unit/sentinelle-aide-2026-10-28-lot-5.test.js`, 24 tests. Chaque texte validé, **lu dans TEXTES**, à sa place ; les onze mots retirés absents de `js/` (hors Nouvelles) et d'`index.html` (hors commentaires) ; la licence lue dans `partage-schemas.js` ; l'exemple du n° 4 lu par le vrai `parserNomFichierLea` ; le soulignement aux mots entiers, sur un glossaire de banc puis sur le réel.
  - « verrouillées une fois finalisées » n'est cherché que dans `index.html` : la même promesse sur les **cartouches** (aide « i », `accompagnement-contenu-popup.js:239`) est fausse aussi (`verrouille: false`, « champ inerte », `cartouches.js:1476`), mais hors du lot : voir « Pour Grégoire ».
- **Break-test**, arbre restauré par sha256 après chaque sabotage : (1) le `\-` revient → rouge ; (2) la regex sans bornes de mot → rouge ; (3) « ZIP léger » remis sous le bouton → rouge ; (4) « individuel » → « individuelle » au niveau 3 → **d'abord vert** (sous-chaîne) ; l'assertion lit maintenant la chaîne entière entre apostrophes → rouge. Témoin restauré : vert.
- Le cas « pratique supprimée » de #475 rougit sur l'ancien code (il donnait « 4/5 »).

## 5. Playwright ciblé

Specs suivies par décision : `evaluation-920` (« Étudiant·e N de 3 »), `lot-f-placement-mots`, `materiel-1119`, `presences-lot-d-enregistrement`, `registre-longitudinal-915`. Résultat : ci-dessous.

WebKit, sur le Mac : **68 tests verts** sur 19 specs (les six lots de l'Aide, bulles au doigt, Exploration des pratiques, Annoter sans copie, verrou, placement des mots, matériel et étiquetage, présences, registre longitudinal), puis **20 verts** sur les deux specs du Cadre et des pratiques, relancées après les retouches du § 1.3, arrivées pendant le premier passage. Pas de verdict Playwright complet.

## Pour Grégoire

1. **Les bulles de la démo** : `plans de travail/TEXTES-2026-10-28-guidage-demo.md`, proposées, rien n'est posé. **18 bulles, pas 19** (`GUIDAGE_TEXTES` en compte 18) : 16 réécrites, 1 reposée sous `suivi-groupe` (les clés `apercu-contenu` et `suivi-apercu-legacy` ne s'affichent jamais : Suivi du groupe, où la démo s'ouvre, n'a aucune bulle), 1 à retirer ; la fenêtre « Données démo », 6 blocs sur 7 (le bloc validé le 7 oct. reste). Les comptes, relus dans le pack : 10 étudiant·es, 11 productions, 101 évaluations, 313 présences sur 32 dates, 3 grilles, 2 échelles, 9 cartouches. **La carte ne fait pas 26 nœuds et 45 liens, mais 17 et 12** (`CARTE_DEMO_ALIGNEMENT`, `demo-namespace.js`). Quatre bulles fausses à la mesure (filtre par groupe, couleurs du calendrier, grille de chaque production, export « aux étudiant·es »). Rédigé par un agent, relu en surface par moi : à lire en entier.
2. **« Séance concernée »** (fiche d'intervention, rattrapage) : la date saisie n'est lue par rien ; le congé tombe à la date de l'intervention. **A** : retirer le champ (et la phrase de l'Aide). **B** : faire porter le congé par cette date.
3. **Les jetons actifs par défaut** : une pratique dont le formulaire n'a jamais été touché n'a pas de bloc `jetons` ; le moteur retombe alors sur « actif, 2 et 2 » (`evaluation-jetons.js:137-149`) pendant que la case « Activer le système de jetons » s'affiche **décochée**. Même chose pour une Spécifications de l'assistant aux jetons désactivés (`{activer:false}` non reconnu). Un comportement à trancher, rien n'est changé.
4. **Des mots qui restent** : « Reprise ciblée » dans la bulle `cn-pratique-jetons` et dans l'aide de l'assistant (option masquée) ; « le comparateur » (trois phrases, un bouton) ; la promesse de verrouiller les **cartouches** (fausse) ; « HEIC » sans réserve dans la bulle validée de la Modélisation ; les mots du registre longitudinal relus en septembre, passés à « étudiant·e ».

## Suppositions nommées

- Le lot part du `main` local (22 commits non poussés à l'ouverture) : la consigne dit « `main` à jour » ; le push attend ton signal.
- Jetons anti-cache : `20261028e` (premier commit), `20261028f` (deuxième), `20261028g` (troisième), suffixes libres de la date du dernier build.
