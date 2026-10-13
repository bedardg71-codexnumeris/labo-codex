# Demande de relecture – lot 22 : le code mort, la fin

> Claude Code, 12 octobre 2026, 8 h 10 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 20 à 24.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (749 fichiers, 8 736 essais).

## 1 · Ce qui change pour l'usager

Rien à l'écran. Plus de 2 000 lignes que rien n'atteignait sont retirées. L'outil de diagnostic des cours, lancé à la main en console, rend son rapport au lieu de l'imprimer.

## 2 · La méthode : un graphe d'appels, pas un `grep`

Script jetable (dans le bac à brouillon de la session, pas dans le dépôt) : pour un fichier, ses fonctions de premier niveau ; **racines** = les noms cités hors du fichier (`js/`, `index.html`, `data-action` compris, appels par `window[...]` couverts parce que leurs noms y sont écrits entre guillemets) ou par son code de module ; une fonction est vivante si une racine ou une fonction vivante la cite. Une fonction n'est morte que si **aucune fonction vivante** ne l'appelle, comme le demandait la consigne.

## 3 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #587 | `1e5e625f` | `afficherTableauProductions` : la version de `donnees-v2.js` (conteneur `table-ressources-productions` absent) était écrasée sur `window` par `productions.js` ; `afficherSection` : l'enveloppe de `rapport-bug.js` ne se posait jamais (chargé avant `navigation.js`) | la version perdante et sa branche d'accordéon partent ; l'enveloppe morte part ; cliquet #557 de 4 à 3 |
| #469 trio | `7aa1e7d7` | cible `v2-spec-dropdown-modeles` absente ; aucun appelant | 6 fonctions de `pratiques-bibliotheque.js` (le trio, le générateur du sélecteur, l'enregistrement de la configuration courante, un compteur) ; `appliquerConfigurationPratique` reste (pratiques-gestion.js l'appelle) |
| #469 îlot | `44ca2596` | `pratiques.js` : 54 fonctions, 28 mortes au graphe | les 28 partent (1 048 lignes) : l'ancienne bibliothèque, son sélecteur de pratique par défaut, l'ancien éditeur des spécifications, l'échelle de conformité ; après : 26, toutes vivantes |
| #469 ancienne génération | `622d7816` | six modules (grilles, échelles, cartouches et leurs bibliothèques) : 48 fonctions mortes | **coupé** : 27 retirées (735 lignes) ; 21 mesurées au § 4 |
| #469 I14 | `4422fffe` | `_diagnostiquerModeleCours` imprimait son rapport (`console.log`/`group`) ; `trimestre-v2-cours.js` un `console.info` | le rapport est rendu (`rapport`, mêmes lignes) ; `info` → `warn` |

Vérifications : chaque retrait par graphe et `grep` d'appelants (js, index.html, `noms_stables.json`, tests), puis Vitest complet. Sentinelle `sentinelle-469-lot22-code-mort-la-fin` (parties A à D) : une mutation par partie (la version d'avant du fichier), chacune rouge. #587 : 2 mutations, 2 rouges (`donnees-v2.js` d'avant ; l'enveloppe de `rapport-bug.js` remise).

Bancs réancrés, chacun parce que son sujet est parti : #687 (cas C, qui jugeaient le sélecteur retiré), #338 (`activerPratique` et `onEchelleConformiteChange` passent de « vivants » à « retirés » : ils ne l'étaient plus), canonisation (unité 1), lot F (`pratiques.js` 5 → 1 annonce), #679 (316 → 305 classes), #467 (`echelles.js` 24 → 21), #522 2b/2c/3b (écritures par la file : 18 → 17, 25 → 24 et cartouches.js 1 → 0, 14 → 12), #477 (le rapport rendu). La spec `lot-f-gestes-hors-temoin` perd une étape (elle appelait `definirPratiqueParDefaut`, qu'aucun geste n'atteignait) ; non relancée.

## 4 · Coupé, avec la mesure : les 21 fonctions mortes gardées

| Raison de les garder | Fonctions |
|---|---|
| **Nom protégé** (`noms_stables.json`) | `sauvegarderCritere`, `sauvegarderEtFermer`, `annulerAjoutCritere`, `basculerVerrouillageCritere`, `enregistrerCommeGrille` (grilles.js) |
| Liées à #628 (le `<div>` `#selectGrilleTemplate`, nom protégé) | `retourVueHierarchique` |
| Gardées par décision (#476, arbitrage de #586) | `dupliquerEchelle`, `supprimerEchelle` |
| Outils de console (statut de I14, à trancher) | `_sonder574`, `_diagnostiquerEchellesGrilles`, `_sonderEchellesDisciplinaires` |
| Un banc les exerce ; le retrait demande de lire chaque banc | `supprimerGrilleDepuisSidebar`, `obtenirCartouchesGrille`, `lireLigneCommentaire`, `importerCommentaires` (et `annulerImportCommentaires`), `lignesMatriceCartouche`, `ajouterCartoucheAGrille`, `exporterCartoucheActive`, `parserMarkdownCartouche`, `ajouterCartoucheALaBibliotheque` |

## 5 · Ce qui revient à Grégoire

- **Les noms protégés morts** : cinq fonctions de `grilles.js` inscrites à `noms_stables.json` n'ont plus d'appelant. Les retirer demande de toucher la zone protégée.
- **Les enveloppes de la navigation** (#587) : `afficherSection` et `afficherSousSection` restent enveloppées par `bilan-reflexif.js` et `planification.js`, seul point d'extension de `navigation.js` (zone protégée). Les remplacer par un événement de navigation demande son accord sur `navigation.js`. Justifiées au cliquet en attendant.

## 6 · Trouvailles, avec leur issue

- **`_apresOuvertureFichier`** (#587) n'est pas un doublon : un emplacement de rappel à usage unique, posé par l'écran qui ouvre une copie et vidé par `travaux-ui.js`. Issue 3 : justifié au cliquet, la fiche peut se fermer de ce côté.
- **Accordéons de ressources morts dans `donnees-v2.js`** : `afficherTableauPratiques`, `-Grilles`, `-Cartouches`, `-Echelles` et `onAccordeonRessourceOuvert` visent des conteneurs `table-ressources-*` et `accordeon-ressources-*` absents d'`index.html`. Issue 2, inscrire.
- **`executerMigrationsBeta96`** (lot 20) et les fonctions sans appelant du lot 21 : même famille, issue 2.
- **Console résiduelle** : `travaux-resolution.js` porte 28 `console.log`/`info`/`group` (outils de diagnostic), puis `cartouches.js` 4, `profil-etudiant-calculs.js` 3, `echelles-bibliotheque.js` 3, `migration-diagnostic.js` 2, `echelles.js` 2, `main.js` 1. Issue 2 : la réforme I14 appliquée à un outil ; les autres attendent la même décision.

## 7 · Ce que j'ai supposé – une ligne chacune

- Un nom cité seulement par les bancs (tests) ne rend pas une fonction vivante ; mais un banc qui l'exerce me fait la garder (§ 4), pour lire le banc avant.
- Le sélecteur « Aucun modèle « … » fourni — enregistre le tien » (#687, #691) n'était affiché nulle part : sa cible n'existait pas.
- `window.TYPE_BADGES` reste posé (les bancs #577 le lisent), son commentaire dit maintenant pourquoi.

## 8 · Documents à mettre à jour (pour Cowork)

- `docs/securite/MODELE-MENACES.md` (l. ≈ 796, 806, 824, 906) cite `exporterBibliothequeGrilles` comme pipeline d'export : la fonction est retirée (elle n'avait aucun appelant). Le compte des pipelines d'export (l. ≈ 906, et la défense K, l. ≈ 1465) est à revoir.
- Les changelogs archivés (`docs/archive/…`) nomment `exporterGrilleActive`/`exporterEchelleActive` : archives, rien à changer.

## 9 · Item de Nouvelles proposé

Aucun : rien ne change à l'écran.
