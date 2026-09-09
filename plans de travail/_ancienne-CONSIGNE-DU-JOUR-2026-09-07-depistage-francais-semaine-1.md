# Consigne du jour — le dépistage du français en première semaine : une production qui signale sans peser

> **Écrite le 7 septembre 2026, 21 h 15 (Toronto), par Cowork, sur les six arbitrages de Grégoire du même soir.** Elle remplace la consigne des six correctifs des sous-onglets de Suivi, archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-06-six-correctifs-sous-onglets.md` — commets l'archivage avec ton premier commit.
> **Cette séance tourne SUR LE MAC**, dans le dépôt monté. **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `git --no-optional-locks rev-parse --short origin/main`, `cat version.json`, `TZ=America/Toronto date`. État à l'écriture : `b8ccd67b`, 1.124.3, build `0907-1325`.
> **Source de vérité du raisonnement** : `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`, écrit le même soir, qui porte les mesures avec leurs commandes et les mots de Grégoire.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Les sites cités ci-dessous ont été lus le 7 au soir sur `b8ccd67b` ; vérifie-les avant d'écrire.
> ⛔ **Le chantier de purge de l'historique (#781) n'est pas touché par cette séance.** Il attend ailleurs, prêt à froid.

## Le besoin réel, en une phrase

Grégoire a fait écrire un portrait de lecteur en première semaine, l'a corrigé **sur le seul critère du français**, et veut que ce résultat repère les élèves à qui recommander l'aide en français — **sans peser sur quoi que ce soit d'autre**.

## Le mandat

Livrer, en UN lot et une seule fois à la fin : **une production qu'on marque « diagnostique », qui ne pèse sur rien, et qui lève un signalement quand la projection franchit le palier que l'enseignant a désigné.**

## Ce que Grégoire a tranché (ne pas rouvrir)

1. Le texte diagnostique **ne compte ni dans la note finale, ni dans P, ni dans C, ni dans le palier RàI**. Motif dans ses mots pour C : « Certains élèves ne sont pas au premier cours pour des raisons administratives (horaire, inscription, etc.). »
2. Il **reste une production entière et visible** : copie, annotation, rétroaction, résultat consultables dans le dossier de l'élève en tout temps. On lui retire son poids, pas son existence.
3. Le signalement se lit **« Aide en français recommandée »**, et **aucun nom de service n'est écrit en dur**.
4. Le signalement se lève **dès le palier « Risqué »**, pas à « Échec » — parce que « Risqué » recommande DÉJÀ l'aide dans le texte que l'élève lit (`evaluation-projection.js`, `texteAide` du palier `risque`), et qu'on ne peut pas accompagner un conseil qu'on ne voit pas.
5. Le signalement **reste distinct du champ « Services adaptés »** : l'un dit que l'élève *est* inscrit, l'autre qu'il *devrait* être référé.
6. Le champ « CAF » de la fiche de l'élève devient **« Aide en français »**, sans nom de service.

## Volet A — Le marqueur et ses QUATRE exclusions

**Un seul marqueur sur la PRODUCTION** (pas sur chaque évaluation : sinon la case se coche trente-cinq fois). Coché à la création ou en modification du travail. Le libellé de la case et son texte d'aide sont à toi ; dis-les en une ligne dans le commit.

⚠ **Le marqueur est un champ d'ÉTAT.** Lis le commentaire de `construireProductionData` (`js/productions.js:1898`) avant d'écrire : l'objet est fusionné par spread, et un champ posé à `undefined` ÉCRASE. Le bug #346 est né exactement là.

Les quatre portes à fermer. **Les trois premières sont mesurées ; la quatrième est le piège.**

1. **La note et l'indice P** — la sélection passe par la pratique active (`js/pratiques/pratique-configurable.js`, `_calculerPerformanceSommative`, `nombreARetenir`, et les `calculerPerformance` de chaque famille).
2. **La fenêtre des patterns et l'IPB** — un seul point : `obtenirIdsProductionsEvaluables` (`js/profil-etudiant-helpers.js:434`), que cinq appelants partagent. C'est le levier le plus économique du lot.
3. **L'indice C** — `calculerCompletion` de chaque famille (`pratique-configurable.js:463`, `pratique-sommative.js:358`, `pratique-pan-standards.js:541`, `pratique-pan-specifications.js:386`).
4. **⚠ LE JUGEMENT DE NON-PARTICIPATION** — `depistagePeutJugerLaNonParticipation()` (`js/profil-etudiant-calculs.js:1789`). Il autorise « Non-participation → niveau 3 » dès que le groupe réunit un travail dû ET une copie évaluée. **En première semaine, le texte diagnostique remplit les deux conditions à lui seul** dès la première copie corrigée : un élève arrivé en retard pour une raison d'horaire basculerait en palier intensif par cette porte, l'exclusion de C n'y changeant rien. Sans ce quatrième point, le lot ne tient pas.

⮕ **Une sentinelle par porte, en Vitest.** Chaque test doit pouvoir échouer : retire le marqueur et vérifie que la valeur bouge, avant de lui faire confiance (skill `verification-adverse`, §4).

## Volet B — Le signalement

- **Le déclencheur est une CASE SUR LE PALIER** du gabarit de projection (« ce palier lève un signalement »), **jamais un seuil `0,5` écrit dans le code**. Structure existante : `critere.paliersProjection`, registre `js/evaluation-projection.js` (les six paliers et leurs `ratioMax` sont aux lignes 249-292).
- **Le libellé du signalement est un champ du gabarit**, à côté du nom du service. Écrire « français » en dur rejouerait le code dur retiré du dépistage : un enseignant de chimie doit pouvoir écrire le sien.
- **Le gabarit « critères EUF » livré en exemple** (`PALIERS_GABARIT_NEUF`) naît avec « Risqué » et « Échec » cochés et le libellé « Aide en français recommandée ». C'est du seed, pas du stock.
- **Le signalement se calcule à la volée, il ne se stocke pas** — motif « tarir n'est pas réparer » : une donnée dérivée stockée devient du stock chez les utilisateurs, à migrer et à réparer.
- **Où il s'affiche** : au profil de l'élève, **à côté du palier RàI et pas dedans** ; et là où Grégoire voit son groupe d'un coup d'œil, pour mesurer l'ampleur avant d'écrire à qui que ce soit. L'emplacement exact est à toi — charge le skill `design-interface` avant d'écrire le moindre pixel, et anticipe le Mac et l'iPad séparément.
- Il doit pouvoir **ouvrir une intervention**, comme le reste du dépistage.

## Volet C — Le renommage

`etudiant.caf` : **le libellé change, la CLÉ RESTE.** Mesuré : la clé voyage dans l'import CSV (`js/groupe.js:213`, qui reconnaît déjà les alias « centre d'aide », « aide francais », « aide français »), l'export CSV (`js/groupe.js:826`), le formulaire (`etudiantCAF`) et le pack de démonstration. La renommer casserait les fichiers d'élèves déjà constitués pour un gain nul.

Les deux sites d'affichage : `js/profil-etudiant-sections-affichage.js:1169` et `:2484`. L'en-tête d'export peut porter le nom neuf sans qu'un fichier réexporté cesse d'être relisible — l'alias existe déjà.

## Source ou stock — réponds-y dans le commit

**Le marqueur est neuf : aucune production existante ne le porte, et aucun palier existant n'a la case.** Le portrait de lecteur de Grégoire est DÉJÀ créé et évalué dans ses vraies données.

⛔ **N'écris rien dans ses données.** Pas de migration qui cocherait la case pour lui, pas de rattrapage « au cas où ». C'est lui qui cochera, et c'est ce qui lui fera voir le changement. Si tu crois qu'une migration est due, mesure-la, écris-la, et remonte-la.

## Ce qui reste hors du lot

- Le nom du champ « Aide en français » reste un libellé de discipline dans une application qui vise toutes les disciplines. **Réserve nommée, non tranchée** : ne l'élargis pas de toi-même.
- Toute trouvaille faite en chemin suit les trois issues de `CLAUDE.md`. **Le défaut est « inscrire et continuer ».**

## Ce que Grégoire doit pouvoir vérifier à l'écran, sur ses vraies données

1. Il ouvre sa production « portrait de lecteur », coche la case « diagnostique », enregistre.
2. La note finale de ses élèves **ne bouge pas**, et leur palier RàI non plus.
3. Il ouvre son gabarit de projection, coche « Risqué » et « Échec ».
4. Les élèves dont le ratio dépasse le seuil portent « Aide en français recommandée » à leur profil — et **aucun élève absent au premier cours n'est passé en palier intensif**.
5. Le champ de la fiche dit « Aide en français », plus « CAF ».

⮕ Termine par ce geste-là, pas par un rapport.
