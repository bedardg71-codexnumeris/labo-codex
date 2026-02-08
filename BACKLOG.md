# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les taches a faire. Consulte-le en debut de session.
> **Derniere mise a jour** : 8 février 2026 (Beta 97.4 - Build 0208-1440)

---

## A faire

### Priorite CRITIQUE - Planification / Carte mentale (Audit 8 fév 2026)

- [x] **#124** BUG CRITIQUE : supprimerNoeud() modifie etat.liens pendant iteration (liens orphelins) ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:824-828`
  - **Symptome** : `for (const [lienId, lien] of etat.liens)` appelle `supprimerLien(lienId)` qui fait `etat.liens.delete()` pendant la boucle
  - **Impact** : Comportement indefini en JavaScript — des liens peuvent etre sautes et rester en memoire apres suppression du noeud
  - **Correction** : Collecter les IDs dans un tableau temporaire, puis supprimer apres la boucle
  - **Fichier** : `js/planification-carte.js`

- [x] **#125** BUG CRITIQUE : mettreAJourZoneConteneur() sans protection contre cycles (stack overflow) ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1744-1745`
  - **Symptome** : Si corruption cree un cycle (conteneur A parent de B, B parent de A), recursion infinie → crash navigateur
  - **Contraste** : `reLayoutConteneur()` a deja une garde `_layoutEnCours.has()`, mais pas `mettreAJourZoneConteneur()`
  - **Correction** : Ajouter un Set `_zoneEnCours` comme garde anti-cycle, similaire a `_layoutEnCours`
  - **Fichier** : `js/planification-carte.js`

- [x] **#126** BUG CRITIQUE : estDescendantDe() sans protection contre cycles (stack overflow) ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1445-1453`
  - **Symptome** : Recursion infinie si le graphe parent/enfants contient un cycle
  - **Utilise par** : `trouverConteneurPour()` appele pendant le drag → freeze du drag si structure corrompue
  - **Correction** : Ajouter parametre `visited = new Set()` pour detecter les cycles
  - **Fichier** : `js/planification-carte.js`

- [x] **#127** evaluerBadge() : asymétrie clones/parent documentée (comportement voulu) ✅ DOCUMENTÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:248-252, 281, 291`
  - **Symptome** : Agrege les liens de TOUS les clones (via `trouverClones`) mais verifie `noeud.parent` du noeud courant seulement
  - **Exemple** : Clone A dans Lecon L1, Clone B hors lecon → B affiche badge vert car les liens de A sont agreges, mais parent de B n'est pas une lecon
  - **Correction** : Verifier le parent de chaque clone individuellement, ou documenter le comportement voulu
  - **Fichier** : `js/planification-carte.js`

### Priorite haute - Planification / Carte mentale (Audit 8 fév 2026)

- [x] **#128** VERBES_COMPAT : mapping incorrect pour 'evalue_par' ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:168`
  - **Symptome** : `'evalue_par': 's_acquiert_par'` — devrait etre `'se_verifie_par'`
  - **Impact** : Les liens d'evaluation anciens (avant migration) affichent un verbe incorrect
  - **Correction** : Changer en `'evalue_par': 'se_verifie_par'`
  - **Fichier** : `js/planification-carte.js`

- [x] **#129** Metadonnees (duree, semaines) non propagees aux clones ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:616, 630, 636`
  - **Symptome** : Changer la duree d'un clone ne met pas a jour les autres instances
  - **Contraste** : `titre` et `description` sont propages via `propagerModification()`, mais pas `metadata.duree`, `metadata.semaineDebut`, `metadata.semaineFin`
  - **Correction** : Appeler `propagerModification()` pour les metadonnees, ou creer une fonction dediee
  - **Fichier** : `js/planification-carte.js`

- [x] **#130** creerLien() ne verifie pas les doublons ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1038-1046`
  - **Symptome** : Possible de creer plusieurs liens identiques source→cible avec le meme verbe
  - **Impact** : Lignes SVG superposees, `getLiensDeNoeud()` retourne des doublons
  - **Correction** : Verifier l'existence d'un lien identique avant creation
  - **Fichier** : `js/planification-carte.js`

- [x] **#131** restaurerSnapshot() ne valide pas les references (liens orphelins) ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:1860-1878`
  - **Symptome** : Apres undo, des liens peuvent pointer vers des noeuds inexistants, et des enfants peuvent referencer un parent supprime
  - **Impact** : `dessinerLien()` echoue silencieusement (return), le lien reste en memoire sans affichage
  - **Correction** : Apres restauration, filtrer les liens dont source/cible n'existent pas, et nettoyer les references parent/enfants invalides
  - **Fichier** : `js/planification-carte.js`

- [x] **#132** chargerCarte() ne valide pas l'integrite des donnees chargees ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1935-2005`
  - **Symptome** : Donnees corrompues (compteur negatif, x/y = NaN, IDs invalides) sont chargees sans erreur
  - **Impact** : Canvas vide ou affichage incoherent, NaN se propage dans les calculs de layout
  - **Correction** : Ajouter validation minimale des champs critiques (type existe dans TYPES, x/y numeriques, etc.)
  - **Fichier** : `js/planification-carte.js`

- [x] **#133** Constantes GAP/PADDING/HEADER_H dupliquees en 3 fonctions (risque de divergence) ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:1569, 1647, 1714`
  - **Symptome** : `var GAP=30; var PADDING=30; var HEADER_H=45;` defini localement dans `reLayoutConteneur()`, `reLayoutConteneurSaufDragged()` et `mettreAJourZoneConteneur()`
  - **Impact** : Si on change une valeur dans une fonction et oublie les autres, les conteneurs se chevauchent
  - **Correction** : Extraire en constante module unique `LAYOUT_CONFIG = { GAP: 30, PADDING: 30, HEADER_H: 45 }`
  - **Fichier** : `js/planification-carte.js`

- [x] **#134** afficherMenuLienExistant() affiche des doublons pour verbes non migres ✅ CORRIGÉ (8 fév 2026)
  - **Lignes** : `planification-carte.js:1291-1294`
  - **Symptome** : Si `lien.type = 'developpe'` (ancien verbe), le bouton 'developpe' ET 'se_decline_en' apparaissent dans le menu
  - **Cause** : Le verbe actuel est ajoute brut a `verbesPertinents` sans normalisation via VERBES_COMPAT
  - **Correction** : Normaliser via `VERBES_COMPAT[lien.type] || lien.type` avant insertion
  - **Fichier** : `js/planification-carte.js`

- [x] **#135** Badges non recalcules apres undo/redo ✅ CORRIGÉ (8 fév 2026)
  - **Ligne** : `planification-carte.js:1887`
  - **Symptome** : Apres un undo, les badges affichent un etat obsolete jusqu'au prochain rafraichissement
  - **Correction** : Appeler `mettreAJourTousLesBadges()` dans un `requestAnimationFrame` apres `restaurerSnapshot()`
  - **Fichier** : `js/planification-carte.js`

- [x] **#136** Position menuLien : vérifié correct (menu enfant de la zone transformée) ✅ FAUX POSITIF (8 fév 2026)
  - **Lignes** : `planification-carte.js:1260-1262, 1337-1340`
  - **Symptome** : `clientVersEspace(x, y)` convertit en coordonnees d'espace, mais le menu est positionne en absolu dans le document
  - **Impact** : Apres zoom, le menu apparait decale ou hors ecran
  - **Correction** : Positionner relativement au viewport au lieu des coordonnees espace
  - **Fichier** : `js/planification-carte.js`

### Priorite moyenne - Planification / Carte mentale (Audit 8 fév 2026)

- [x] **#137** Mode individuel non sauvegarde dans undo/redo ✅ CORRIGÉ (8 fév 2026)
  - `modeIndividuel` ajouté dans `clonerEtatPersistant()` et restauré depuis le snapshot au lieu d'être forcé à `null`

- [x] **#138** Indicateurs clone 🧬 crees en async (requestAnimationFrame) ✅ CORRIGÉ (8 fév 2026)
  - Indicateur créé synchroniquement dans `reconstruireDOM()` après `attacherEvenements()`, retiré du bloc rAF

- [x] **#139** Event listeners non nettoyes lors de suppression de noeuds ✅ FAUX POSITIF (8 fév 2026)
  - Les listeners sont attachés à l'élément DOM lui-même (pas au document). Quand `el.remove()` est appelé et qu'aucune référence ne subsiste, le GC du navigateur collecte l'élément ET ses listeners. Les listeners document temporaires (mousemove/mouseup pendant drag) sont retirés dans le handler mouseup.

- [x] **#140** Cle `planification_seances` non centralisee ✅ CORRIGÉ (8 fév 2026)
  - Constante `CLE_SEANCES` ajoutée en haut du module, 3 occurrences remplacées par `window.cle(CLE_SEANCES)`

- [x] **#141** CSS inline dans le panneau clone ✅ CORRIGÉ (8 fév 2026)
  - Styles inline du panneau clone-info extraits vers classes CSS `.planif-clone-compteur` et `.planif-clone-lien` dans styles.css

- [x] **#142** Performance O(n²) dans trouverClones() et evaluerBadge() ✅ CORRIGÉ (8 fév 2026)
  - Index inverse `_cloneIndex: Map(sourceId → Set)` maintenu via `_indexerClone()`/`_desindexerClone()`, reconstruit dans `restaurerSnapshot()`, `chargerCarte()`, `viderCanvas()`

- [x] **#143** Migration VERBES_COMPAT non appliquee au chargement ✅ CORRIGÉ (8 fév 2026)
  - Post-migration `VERBES_COMPAT` ajoutée dans `chargerCarte()` : après MIGRATION_VERBES (direction), normalise les noms restants via VERBES_COMPAT (renommage simple)

### Priorite CRITIQUE - Namespacing (Audit 5 fév 2026)

- [x] **#64** interventions.js : écriture presences sans namespace (CORRUPTION DONNÉES) ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `db.setSync('presences', presences)` à la ligne 1481 écrit dans la clé nue
  - **Cause** : `transfererPresencesVersModule()` lit via `cle('presences')` mais écrit dans `'presences'`
  - **Risque** : Les présences du trimestre actif sont écrites dans la mauvaise clé, invisibles aux lectures namespacées
  - **Correction** : Utiliser `db.setSync(clePresences, presences)` avec la variable déjà définie à la ligne 1415
  - **Fichier** : `js/interventions.js`

- [x] **#65** ~20 appels `db.getSync('productions', [])` sans namespace ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Les productions ne sont pas trouvées en contexte multi-trimestre
  - **Cause** : `productions` est dans `CLES_NAMESPACEES` mais accédé directement sans `cle()`
  - **Fichiers concernés** :
    - `js/evaluation.js` (8 occurrences : lignes 535, 1630, 1746, 2817, 2903, 3126, 3141, 3310)
    - `js/portfolio.js` (ligne 87)
    - `js/pratiques.js` (ligne 421)
    - `js/statistiques.js` (ligne 135)
    - `js/donnees-v2.js` (lignes 783, 929)
    - `js/pratiques/pratique-pan-standards.js` (lignes 159, 722, 1546)
    - `js/pratiques/pratique-sommative.js` (ligne 614)
    - `js/pratiques/pratique-pan-objectifs.js` (ligne 604)
  - **Correction** : Remplacer par `obtenirDonneesSelonMode('productions')` ou `db.getSync(cle('productions'), [])`

- [x] **#66** pratique-pan-specifications.js : `localStorage.getItem()` contourne db.js ET cle() ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Module PAN-Spécifications entièrement cassé en multi-trimestre
  - **Cause** : `_lireEvaluations()` et `_lireProductions()` (lignes 645, 654) lisent directement `localStorage.getItem('evaluations')` et `localStorage.getItem('productions')`
  - **Triple problème** : 1) Contourne db.js, 2) Contourne cle(), 3) Clé 'evaluations' incorrecte (devrait être 'evaluationsSauvegardees')
  - **Correction** : Remplacer par `obtenirDonneesSelonMode('evaluationsSauvegardees')` et `obtenirDonneesSelonMode('productions')`
  - **Fichier** : `js/pratiques/pratique-pan-specifications.js`

- [x] **#67** spe-specifications.js : `db.getSync('groupeEtudiants')` sans namespace ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `genererRecapitulatifClasseSPE()` retourne les étudiants du mauvais trimestre
  - **Cause** : Accès direct sans `cle()` ni `obtenirDonneesSelonMode()` à la ligne 537
  - **Correction** : Remplacer par `obtenirDonneesSelonMode('groupeEtudiants')`
  - **Fichier** : `js/spe-specifications.js`

### Priorite haute - Namespacing (Audit 5 fév 2026)

- [x] **#68** Fonctions dupliquées en scope global (collisions silencieuses) ✅ CORRIGÉ (6 fév 2026)
  - ✅ `echapperHtml()` : 4 doublons supprimés, canonique dans config.js
  - ✅ `afficherNotificationSucces()` : 8 doublons supprimés, canonique dans evaluation.js (signature étendue à 2 params)
  - ✅ `formaterDate()` : 3 versions consolidées → canonique dans main.js ("6 février 2026")
  - ✅ `formaterDateCourte()` : 2 versions consolidées → canonique dans main.js ("6 fév.")
  - ✅ `formaterDateComplete()` : nouvelle canonique dans main.js ("jeudi 6 février 2026"), remplace formaterDateFrancais + formaterDateLisible

- [x] **#69** Clés manquantes dans CLES_NAMESPACEES ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Données partagées entre trimestres au lieu d'être isolées
  - **Clés candidates** :
    - `portfoliosEleves` (portfolio.js, profil-etudiant.js)
    - `indicesEvaluation` (liste-evaluations.js, evaluation.js)
    - `indicesPatternsRaI` (profil-etudiant.js, tableau-bord-apercu.js)
    - `horaireSelectionne` (trimestre-v2.js)
    - `seancesHoraire` (~12 localisations dans calendrier-vue.js, saisie-presences.js, presences-apercu.js, horaire.js, profil-etudiant.js, migrations.js)
  - **Action** : Auditer chaque clé et ajouter à `CLES_NAMESPACEES` dans trimestres.js si elle contient des données par trimestre

- [x] **#70** 1 261 assignations `window.*` — pollution du namespace global ✅ CORRIGÉ (7 fév 2026)
  - **Résultat** : 91/93 fichiers JS encapsulés en IIFE avec `'use strict'` (2 protégés : config.js, navigation.js)
  - **71 fichiers** nouvellement wrappés, 0 erreurs de syntaxe (node -c)
  - **Corrections strict mode** : `eval` renommé `ev` dans portfolio.js, echelles.js, profil-etudiant.js
  - **Impact** : Toutes les variables/fonctions locales sont encapsulées. Seuls les exports explicites `window.X =` restent globaux

- [x] **#71** ~50 appels `localStorage.getItem()` contournant db.js ✅ CORRIGÉ (6 fév 2026)
  - **Fichiers concernés** : cc-license.js, primo-questions.js, modes.js, echelles-bibliotheque.js, grilles-bibliotheque.js, cartouches-bibliotheque.js, productions-bibliotheque.js, boite-outils.js
  - **Risque** : Contourne le memoryCache fallback de db.js (données IndexedDB retournent null) et la correction double-stringify
  - **Correction** : Remplacer par `db.getSync()` pour cohérence

- [x] **#72** Storage event listener vérifie clé non-namespacée (main.js) ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `window.addEventListener('storage', ...)` vérifie `e.key === 'groupeEtudiants'` (lignes 238-247)
  - **Cause** : Avec namespacing actif, la clé réelle est `h2026_groupeEtudiants`
  - **Effet** : Le listener ne se déclenche jamais, la régénération des bulles ne se fait pas
  - **Correction** : Vérifier contre `cle('groupeEtudiants')` ou vérifier si la clé contient `groupeEtudiants`

- [x] **#73** Patterns d'accès namespace incohérents ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 136 patterns défensifs `typeof cle/window.cle` → `cle('X')` dans 24 fichiers, 0 restant
  - Phase 1 : 19 remplacements (5 fichiers backlog)
  - Phase 2 : 117 remplacements (19 fichiers supplémentaires incluant trimestre-v2, migrations, productions, etc.)
  - Guards flow-control `if (typeof cle === 'function')` dépliés dans migrations.js, horaire.js, primo-modal.js, echelles.js

### Priorite CRITIQUE - Design / CSS (Audit 5 fév 2026)

- [x] **#74** 1 855 styles inline dans les templates JS avec couleurs hardcodées ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 1 855 → 1 776 `style=` (-79 attributs), 0 couleur hex mappée restante dans les inline styles
  - **Travail effectué** :
    - 30+ classes utilitaires ajoutées dans styles.css (u-flex-gap-*, u-p-*, u-bg-*, u-border-*)
    - Patterns info-box, badge-source, modal-js-overlay/contenu appliqués dans tous les fichiers
    - ~475 couleurs hex hardcodées remplacées par `var(--token)` CSS dans 40+ fichiers JS
    - Toutes les couleurs mappées (#032e5c, #065dbb, #666, #999, #28a745, #dc3545, #fff3cd, etc.) éliminées
    - 30 hex restantes sont des couleurs sémantiques spécifiques (palettes RàI, swatches, Primo) hors mapping
    - Tous les fichiers passent `node --check` (syntaxe valide)

- [x] **#75** 1 304 attributs style inline dans index.html ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 1 309 → 1 138 `style=` (-171 attributs supprimés)
  - **Phase 1** : Section changelog (18 entrées) → classes `.changelog-entry--*`, `.changelog-title`, `.changelog-list`
  - **Phase 2** : Hex colors → `var(--token)`, single-property → utility classes, flex → `.u-flex-*`
  - **Non touché** : `style="display: none"` (~150 occurrences, états JS toggle)

- [x] **#76** 595 toggling `.style.display` dans 31 fichiers JS ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 434 → 11 (423 migrés). Les 11 restants sont des `= ''` (nettoyage) ou commentés
  - **Infrastructure** : `window.toggleDisplay(el, show)` helper, `.u-hide { display: none !important; }`
  - **Phase 1** : 11 fichiers migrés + classes CSS utilitaires (info-box, badge-source)
  - **Phase 2** : 22 fichiers migrés (tous les restants), 0 `.style.display` actif pour show/hide

### Priorite haute - Design / CSS (Audit 5 fév 2026)

- [x] **#77** Couleurs Material Design hors palette « Nuit Élégante » ✅ CORRIGÉ (6 fév 2026)
  - ~35 couleurs Material Design remplacées par variables CSS dans styles.css
  - `#1976d2` → `var(--bleu-clair)`, `#2196F3` → `var(--bleu-clair)`, `#4caf50` → `var(--vert-succes)`
  - `#ff9800` → `var(--orange-accent)`, `#ffc107` → `var(--btn-annuler)`, `#9e9e9e` → `var(--gris-clair)`
  - ✅ #74 terminé — toutes les couleurs hardcodées mappées remplacées par var(--token)

- [x] **#78** box-shadow hardcodés remplacés par variables CSS ✅ PARTIEL (6 fév 2026)
  - 2 ombres `rgba(3, 46, 92, ...)` remplacées par `var(--shadow-normal)`
  - ~29 restantes sont des ombres colorées intentionnelles (vert, bleu, orange, violet) non remplaçables

- [x] **#79** border-radius incohérents (valeur 8px hors design system) ✅ CORRIGÉ (6 fév 2026)
  - 9 occurrences `border-radius: 8px` remplacées par `var(--radius-moyen)` dans styles.css

- [x] **#80** 75 déclarations `!important` dans styles.css ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 75 → 37 `!important` (-38, -51%), 37 restants tous justifiés
  - 8 retirés sans conflit (cursor, padding, color, textarea, note-plafonnée, wizard-toggle)
  - 17 retirés par spécificité suffisante (carte accordeon, #reglages-trimestre, IDME, maintenance)
  - 7 retirés par ajustement de sélecteur (summary.summary-materiel, .tableau .td-center-*)
  - 6 retirés : matrice-tableau textarea (redondants avec base)
  - 37 conservés : 3 utilitaires, 3 media queries, 26 toggles JS, 5 overrides inline styles

- [x] **#81** Validation primo avec styles inline au lieu de classes CSS ✅ CORRIGÉ (6 fév 2026)
  - Classes `.primo-champ-vide` et `.primo-champ-rempli` créées dans styles.css
  - `primo-validation-champs.js` utilise maintenant `classList.add/remove` au lieu de `.style.*`

- [x] **#82** Tokens badges Tetris non définis dans styles.css :root ✅ CORRIGÉ (6 fév 2026)
  - `--badge-padding`, `--badge-font-size`, `--badge-border-radius` ajoutés dans `:root`

- [x] **#83** En-tête styles.css indique « Beta 0.60 » (obsolète) ✅ CORRIGÉ (6 fév 2026)
  - Mis à jour vers « Beta 97 / 06-02-2026 »

- [x] **#84** Documentation design system : mode « assiste » vs « simulation » ✅ CORRIGÉ (6 fév 2026)
  - **Résultat** : 7 occurrences `[data-mode="assisté"]` → `[data-mode="simulation"]` dans 3 modules DS
  - Fichiers corrigés : 01a-palette-couleurs.html (4), 03b-cartes-sidebars.html (1), 04a-navigation.html (2)
  - Archives (_archives/) laissées telles quelles (documents historiques)

### Bugs CRITIQUES (Audit complet 5 fév 2026)

- [x] **#85** BUG CRITIQUE : Clé productions incohérente — `productionsPedagogiques` vs `productions` ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Les productions créées dans productions.js sont invisibles pour 15+ autres modules
  - **Cause** : `productions.js` écrit via `getCleProductions()` → `cle('productionsPedagogiques')` → clé `'productionsPedagogiques'`. Mais `evaluation.js`, `portfolio.js`, `statistiques.js`, etc. lisent depuis `'productions'` ou `obtenirDonneesSelonMode('productions')` — une clé complètement différente
  - **Fichiers lecteurs (mauvaise clé)** : evaluation.js (9x), portfolio.js, statistiques.js, rapport-bug.js (2x), donnees-v2.js (2x), pratiques.js, pratique-pan-standards.js (3x), pratique-pan-objectifs.js, pratique-sommative.js, cc-license.js, pratique-notation-v2.js
  - **Impact** : Évaluations, portfolio, statistiques ne trouvent aucune production
  - **Correction** : Unifier sur UNE seule clé canonique et mettre à jour tous les lecteurs

- [x] **#86** BUG CRITIQUE : Suppression demo peut effacer des productions réelles ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : `supprimerGroupe9999()` filtre par `!p.id?.startsWith('PROD_')` — un préfixe aussi utilisé pour les vraies productions
  - **Fichier** : `js/donnees-demo.js` ligne 430
  - **Impact** : Déchargement du mode démo peut supprimer des productions utilisateur
  - **Correction** : Filtrer uniquement `estDemo: true` ou utiliser un préfixe spécifique `PROD_DEMO_`

- [x] **#87** BUG CRITIQUE : obtenirHeuresSeance() retourne toujours 2 (code mort) ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Assiduité incorrecte pour les cours non-2h (3h, 4h, etc.)
  - **Fichier** : `js/saisie-presences.js` ligne 804
  - **Cause** : La fonction calcule minutieusement totalHeures (lignes 772-801) puis `return 2;` ignore tout
  - **Impact** : Étudiants en cours 4h peuvent afficher 200% ou 50% au lieu de 100%
  - **Correction** : Retourner `totalHeures` au lieu du hardcodé, ou documenter que seules les périodes sont utilisées

- [x] **#88** BUG CRITIQUE : Format presences incohérent (Array vs Object) entre modules ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Migrations silencieusement ignorées, TypeError potentiel
  - **Cause** : `migrations.js:116` et `donnees-demo.js:238` lisent comme Object `{}`, `saisie-presences.js` lit comme Array `[]`
  - **Impact** : `migrerPresencesVersPeriodes()` ne s'exécute jamais si format Object, `Object.keys()` donne des indices numériques sur un Array
  - **Fichiers** : migrations.js, donnees-demo.js, saisie-presences.js, cours.js
  - **Correction** : Normaliser sur un format unique (Array), ajouter détection de format dans les migrations

- [x] **#89** BUG CRITIQUE : Collisions d'ID avec Date.now() seul ✅ CORRIGÉ (6 fév 2026)
  - **Symptôme** : Clics rapides produisent des IDs identiques → données écrasées
  - **Fichiers et lignes** :
    - `evaluation.js:1794` → `'EVAL_' + Date.now()`
    - `grilles.js:369,389` → `'CR' + Date.now()` (dans une boucle!)
    - `cartouches.js:434` → `'CART' + Date.now()`
    - `groupe.js:203` → `Date.now()` nu
    - `productions.js:545` → `'PROD' + Date.now()`
    - `interventions.js:129` → `` `intervention-${Date.now()}` ``
  - **Patron correct existant** : `evaluation-jetons.js:299` utilise `Date.now() + '_' + Math.random().toString(36).substr(2,5)`
  - **Correction** : Créer un utilitaire `generateId(prefix)` et standardiser

### Bugs HAUTE priorité (Audit complet 5 fév 2026)

- [x] **#90** Mauvais noms de clés dans plusieurs modules (retournent toujours vide) ✅ CORRIGÉ (6 fév 2026)
  - **donnees-v2.js** : `${trim.id}_evaluations` au lieu de `${trim.id}_evaluationsSauvegardees` (6 emplacements : lignes 797, 824, 875, 943, 974, 1020) → compteurs d'usages toujours à 0, suppressions non protégées
  - **rapport-bug.js** : `'grillesCriteres'` (ligne 467) et `'echellesPerformance'` (ligne 470) n'existent pas → contexte bug incomplet
  - **cours.js** : `'evaluationsDetaillees'` (ligne 1025) n'existe pas → avertissement de suppression affiche "0 évaluations"
  - **pratique-configurable.js** : `'evaluations'` avec default `{}` (ligne 117) → calculs toujours à 0
  - **Correction** : Remplacer par les bonnes clés (`evaluationsSauvegardees`, `grillesTemplates`, `echellesTemplates`)

- [x] **#91** calculerAssiduiteJusquADate() ne filtre pas par DA pour les dates ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/saisie-presences.js` lignes 269-276
  - **Symptôme** : `datesSaisies` inclut les dates de TOUS les étudiants, pas seulement l'étudiant cible
  - **Impact** : Un étudiant est compté absent pour des dates où seuls d'autres étudiants ont des données
  - **Comparaison** : `calculerAssiduiteSommative()` (lignes 97-102) filtre correctement par DA d'abord
  - **Correction** : Filtrer `presencesFiltrees` par DA avant de construire `datesSaisies`

- [x] **#92** evaluations-apercu.js divise totalC par nbTotal au lieu de nbAvecDonnees ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/evaluations-apercu.js` ligne 94
  - **Symptôme** : `Math.round(totalC / nbTotal)` divise par TOUS les étudiants au lieu de ceux avec données
  - **Impact** : Taux de complétion affiché trop bas (ex: 5/25=20% au lieu de 5/5=100%)
  - **Correction** : Remplacer `nbTotal` par `nbAvecDonnees`

- [x] **#93** Mode « recents-meilleurs » utilise reverse() au lieu de trier par date ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/profil-etudiant.js` lignes 911-928
  - **Symptôme** : `.reverse()` inverse l'ordre par note, ne trie PAS par date
  - **Impact** : Sélectionne les pires notes du top 50% au lieu des plus récentes → affecte la note finale
  - **Comparaison** : `portfolio.js` ligne 63 trie correctement par `dateRemise`, `pratique-pan-standards.js:138` par `dateEvaluation`
  - **Aussi** : Mode `recents` (ligne 911) a le même problème
  - **Correction** : Remplacer `.reverse()` par `.sort((a, b) => new Date(b.dateRemise) - new Date(a.dateRemise))`

- [x] **#94** Demo : race condition et nettoyage cible le mauvais trimestre ✅ CORRIGÉ (6 fév 2026)
  - **donnees-demo.js:58-106** : `chargerDonneesDemo()` change temporairement le trimestre actif (async) → tout module synchrone qui lit `cle()` pendant ce temps voit le mauvais trimestre
  - **donnees-demo.js:383-437** : `supprimerGroupe9999()` utilise `window.cle()` mais le trimestre actif peut ne plus être demo → nettoie les vraies données
  - **Correction** : Passer le préfixe `demo_` explicitement au lieu de changer le trimestre actif

- [x] **#95** Éléments DOM référencés mais absents de index.html ✅ CORRIGÉ (6 fév 2026)
  - **pratiques.js:550** : `getElementById('pratiqueNotation').value` sans null check → crash
  - **cours.js:249-250** : `getElementById('nombreCours')` et `getElementById('resumeCours')` n'existent pas → crash
  - **evaluation.js:2774** : `getElementById('tri-evaluations')` n'existe pas → crash
  - **Correction** : Ajouter les éléments dans index.html ou ajouter des null checks

- [x] **#96** donnees-v2.js : `localStorage.removeItem` au lieu de `db.remove` ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/donnees-v2.js` ligne 1411
  - **Symptôme** : `localStorage.removeItem('cartouches_${grilleId}')` ne supprime que du localStorage, pas d'IndexedDB
  - **Impact** : Les cartouches réapparaissent après rechargement
  - **Correction** : Utiliser `db.remove()` ou `db.removeSync()`

- [x] **#97** portfolio.js : `event.target.checked` sans paramètre event ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/portfolio.js` ligne 330
  - **Symptôme** : `toggleArtefactPortfolio(da, portfolioId, nombreARetenir)` utilise `event` qui n'est pas un paramètre
  - **Impact** : En mode strict, ReferenceError. Sinon, le checkbox n'est pas décoché quand on dépasse le max
  - **Correction** : Ajouter `event` comme paramètre de la fonction

- [x] **#98** evaluation.js : lecture structure SOM/PAN obsolète ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/evaluation.js` lignes 3050-3051
  - **Symptôme** : `indicesCPEtudiant?.[pratique]` cherche des sous-branches SOM/PAN, mais depuis Beta 95.5 la structure est plate
  - **Impact** : Taux de complétion utilise toujours le fallback, jamais la valeur autoritative
  - **Correction** : Lire `indicesCPEtudiant?.C` directement

### Bugs MOYENNE priorité (Audit complet 5 fév 2026)

- [x] **#99** donnees-v2.js : 11 blocs catch silencieux « // Ignorer » ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/donnees-v2.js` (lignes 789, 804, 831, 855, 882, 913, 934, 949, 980, 1001, 1026)
  - **Impact** : Erreurs de données complètement masquées, diagnostic impossible
  - **Correction** : Remplacer par `console.warn('[donnees-v2] Erreur calcul usages:', e.message)`

- [x] **#100** cartouches.js et statistiques.js : clé legacy `niveauxEchelle` ✅ CORRIGÉ (6 fév 2026)
  - **cartouches.js:425** : `await db.get('niveauxEchelle')` — clé obsolète
  - **statistiques.js:144** : `db.getSync('niveauxEchelle', [])` — clé obsolète
  - **Impact** : Utilise le fallback IDME hardcodé au lieu de l'échelle configurée par l'utilisateur
  - **Correction** : Lire depuis `'echellesTemplates'` et extraire les niveaux de l'échelle active

- [x] **#101** Math.random() pour clé d'anonymisation (non cryptographique) ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/trimestres.js` lignes 1106-1109
  - **Impact** : Clés prédictibles pour anonymiser les DA (données personnelles)
  - **Correction** : Utiliser `crypto.getRandomValues()` (Web Crypto API native)

- [x] **#102** import-export.js : risque double-stringify multi-cycles ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/import-export.js` ligne 238
  - **Cause** : `JSON.stringify(valeur)` sur des données déjà parsées → double stringification
  - **Impact** : Exports/imports multiples créent des niveaux d'imbrication croissants
  - **Correction** : `typeof valeur === 'string' ? valeur : JSON.stringify(valeur)`

- [x] **#103** Export n'exclut pas toutes les données demo ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/import-export.js` lignes 207-239
  - **Impact** : Productions et évaluations demo incluses dans les sauvegardes utilisateur
  - **Correction** : Ajouter filtrage demo pour `*_productions`, `*_evaluationsSauvegardees`, `cartouches_*`

- [x] **#104** entites-ui.js : `setTimeout(initialiserEntitesUI, 500)` fragile ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/entites-ui.js` ligne 125
  - **Impact** : Trop lent sur appareils rapides, possiblement insuffisant sur iPad
  - **Correction** : Utiliser le pattern `db-ready` comme les autres modules

- [x] **#105** trimestres.js : `calculerStatistiquesFinales` lit le mauvais trimestre ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/trimestres.js` lignes 646-695
  - **Cause** : `obtenirDonneesSelonMode('groupeEtudiants')` lit le trimestre ACTIF, pas celui archivé
  - **Impact** : Statistiques d'archive calculées avec les données du mauvais trimestre
  - **Correction** : Lire directement depuis `${trimestreId}_groupeEtudiants`

- [x] **#106** liste-evaluations.js : complétion inclut évaluations remplacées et hors-type ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/liste-evaluations.js` lignes 93-111
  - **Impact** : Complétion > 100% possible (cappée par Math.min), reprises comptées double
  - **Correction** : Filtrer `!e.remplaceeParId` et compter les `productionId` distincts

- [x] **#107** Math.pow(négatif, 1/3) → NaN dans calcul engagement ✅ CORRIGÉ (6 fév 2026)
  - **Fichiers** : `js/portfolio.js:648-649`, `js/profil-etudiant.js:434-435`
  - **Impact** : Si indice A, C ou P négatif (données corrompues), tout le calcul E retourne NaN
  - **Correction** : Utiliser `Math.cbrt(E_brut)` ou `Math.max(0, E_brut)` avant la racine cubique

- [x] **#108** obtenirTendance() assume que les évaluations sont triées par date ✅ CORRIGÉ (6 fév 2026)
  - **Fichier** : `js/evaluation.js` lignes 3389-3399
  - **Impact** : `evaluations[0]` n'est pas forcément la plus récente → tendance potentiellement inversée
  - **Correction** : Trier par date avant de comparer

### Priorite haute - UX / Interface

- [x] **#39** Courbes de distribution (densite) des indices ACPE ✅ FAIT (25 jan 2026)
  - Objectif : Visualiser la distribution des etudiants selon les indices A, C, P, E
  - Type : Courbe de densite (style Gauss) avec les 4 indices superposes
  - Couleurs : A=bleu, C=orange, P=vert, E=violet (coherence avec graphiques existants)
  - Emplacement : Tableau de bord, section Vue d'ensemble (apres graphique spaghetti)
  - Fonction creee : `creerGraphiqueDistributionACPE(canvasId)`
  - Algorithme : KDE (Kernel Density Estimation) avec regle de Silverman
  - **Fichiers modifies** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`

- [x] **#30** Export PDF des elements pedagogiques ✅ CORRIGÉ (25 jan 2026)
  - [x] Grilles descriptives (grille + echelle + cartouche) avec jsPDF
  - [x] Formulaire preparation 2 etapes (selection contenu → apercu mise en page)
  - [x] Nouvelle disposition : cours/trimestre en haut a droite, enseignant en bas a gauche
  - [x] Options simplifiees : orientation, checkbox trimestre, pied de page (enseignant, licence CC)
  - [x] Marges reduites (0.5 inch)
  - [x] Fonctions SST : obtenirInfosCoursPDF(), obtenirNomEnseignantPDF()
  - [x] **Bug corrigé** : Infos cours/enseignant maintenant affichées
    - **Cause** : `window.trimestreActif` vide, pas de fallback
    - **Fix** : Utilisation de `obtenirTrimestreActif()` + fallbacks multiples
    - En-tête : code cours, nom cours, trimestre
    - Pied de page : nom enseignant, licence CC BY-NC-SA
  - [ ] **Ajustements futurs (optionnel)** :
    - Productions : liste des travaux
    - Echelles seules

### Bugs critiques

- [x] **#49** Import CSV Omnivox : colonne SA non reconnue + accents mal gérés (Jordan, 18 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Problème 1** : Accents corrompus → Encodage Windows-1252 au lieu de UTF-8
  - **Problème 2** : Colonne SA non détectée → Position flexible (col 5 ou 6)
  - **Fichier modifié** : `js/trimestre-v2.js`

- [x] **#50** Primo : configuration incomplète après wizard (Bruno & Olivier, 5-6 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Jour de la semaine du cours pas configuré après Primo
  - **Cause** : `creerHoraireDansBanquePrimo()` lisait `reponses['horaireHebdomadaire']` (toujours vide)
  - **Correction** : Lecture depuis `cle('horaireHebdo')` (créé par creerSeancesHoraire)
  - **Fichier modifié** : `js/primo-modal.js`

- [x] **#51** Création horaire : permettre heures non piles (Bruno, 5 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Cadre-horaire limité aux heures piles (8h00, 9h00...)
  - **Correction** : Dropdown remplacé par `<input type="time">` avec step 5 min
  - **Fichier modifié** : `index.html`

- [x] **#52** Erreurs null dans objectifs.js et trimestre-v2.js (Jordan, 18 jan) ✅ DÉJÀ CORRIGÉ (Beta 95.5)
  - **Erreur 1** : `Cannot set properties of null (setting 'innerHTML')` - objectifs.js:73
  - **Erreur 2** : `Cannot set properties of null (setting 'value')` - trimestre-v2.js:3463
  - **Correction** : Vérifications `if (!element) return;` ajoutées dans les deux fichiers

- [x] **#53** Menu "Format horaire" ne se met pas à jour automatiquement (Olivier, 6 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Options statiques ne reflétaient pas le nb d'heures choisi
  - **Correction** : Fonction `mettreAJourOptionsFormatHoraire()` génère les diviseurs dynamiquement
  - **Fichiers modifiés** : `index.html`, `js/trimestre-v2.js`

- [x] **#54** UX : Message "Partage impossible" trop peu visible (Grégoire, 30 jan) ✅ DÉJÀ CORRIGÉ
  - **Analyse** : Le message est déjà en rouge (fond #f8d7da, bordure #dc3545, texte #721c24)
  - **Fichier** : `js/import-export.js` ligne 802-810

- [x] **#56** Nommage exports avec horodatage complet (Grégoire, 31 jan) ✅ CORRIGÉ (1er fév 2026)
  - **Format** : `sauvegarde-monitorage-YYYY-MM-DD-HH-MM-SS.json`
  - **Correction** : Horodatage complet ajouté dans `js/import-export.js` ligne 252

- [x] **#57** Erreur console lors suppression grilles (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Bouton supprimer grille inactif, grilles impossibles à retirer
  - **Erreur** : `null is not an object (evaluating 'document.getElementById('optionsImportExportGrilles').style')`
  - **Cause** : Élément `#optionsImportExportGrilles` supprimé en Beta 92 mais code y référait encore
  - **Correction** : Suppression des lignes 3614 et 3625 dans `js/grilles.js`

- [x] **#58** Import productions non détectées (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : "Aucune production n'a été importée" malgré présence dans le fichier
  - **Cause** : Fonctions d'import/export ne cherchaient que dans `productions` ou `bibliothequeProductions`, pas les clés namespacées `*_productions`
  - **Correction** : Support des clés namespacées dans 4 fonctions de `js/import-export.js`
    - `analyserRessourcesDetaillees()`, `executerImportSelectif()`, `executerImportVersBibliotheques()`, `exporterConfigurationComplete()`

- [x] **#59** Horaires non trouvés - aperçu présences vide (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Aperçu présences vide, compte de semaines incorrect (horaireActif: non défini)
  - **Cause** : Clé `horaires` dans `CLES_NAMESPACEES` mais lue depuis `'horaires'` au lieu de `cle('horaires')`
  - **Correction** : Utilisation de `cle('horaires')` dans 4 fichiers :
    - `js/horaire.js`, `js/entites-ui.js`, `js/trimestre-v2.js`, `js/migrations.js`

- [x] **#60** Cours A25 sauvegardé comme H2026 (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Nouveau cours pour A2025 non visible (créé sous H2026)
  - **Cause** : `reinitialiserFormCoursV2()` forçait session='H' sans définir l'année
  - **Correction** : Extraction session/année depuis `obtenirTrimestreActif()` dans `js/trimestre-v2.js`

- [x] **#61** Section Trimestre tronquée sur iPad (Gregoire, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Dates et boutons coupés à droite sur iPad Safari
  - **Cause** : Grilles CSS 2 colonnes fixes sans responsive pour tablettes
  - **Correction** : Media queries pour `layout-sidebar-2col`, `grille-2col`, section `#reglages-trimestre`
  - **Fichier modifié** : `styles.css`

- [x] **#62** Erreur "reglages-horaire introuvable" (Tous rapports, 1er fév) ✅ CORRIGÉ (1er fév 2026)
  - **Symptôme** : Erreur console au démarrage
  - **Cause** : Sous-section renommée `reglages-horaire-legacy` en Beta 95, références obsolètes
  - **Correction** : Mise à jour des références vers `reglages-trimestre` dans 4 fichiers
    - `js/guidage.js`, `js/saisie-presences.js`, `index.html`, `js/primo-validation-champs.js`

- [x] **#63** FR: Supprimer pratiques hors-bibliothèque (Gregoire, 1er fév) ✅ IMPLÉMENTÉ (1er fév 2026)
  - **Demande** : Pouvoir supprimer des pratiques depuis la section "Disponibles à ajouter"
  - **Solution** : Bouton "Supprimer" ajouté dans le modal Bibliothèque de pratiques
  - **Nouvelle fonction** : `supprimerPratiqueHorsBibliotheque()` dans `js/pratiques.js`

- [x] **#55** Pratique configurable non trouvée dans le registre ✅ CORRIGÉ (31 jan 2026)
  - **Symptôme** : Erreur `❌ Pratique "pratique-1768910384608" non disponible dans le registre`
  - **Cause 1** : `obtenirPratiqueParId()` ne cherchait pas dans `pratiquesConfigurables`
  - **Cause 2** : Les pratiques créées via wizard ont une structure différente (ID/échelle à la racine, pas dans `config`)
  - **Solution** : Nouvelle fonction `construireConfigComplete()` qui normalise les deux formats
    - Fusionne les champs racine + config interne
    - Charge l'échelle par ID depuis `echellesTemplates` si non embarquée
    - Fallback vers échelle IDME par défaut si référence introuvable
  - **Fichier modifié** : `js/pratiques/pratique-registre.js`

- [x] **#37** Incoherence indice P vs Note finale (tableau de bord) ✅ CORRIGÉ (25 jan 2026)
  - **Symptome** : Vincent affiche P=50% dans le tableau de bord mais Note finale=59% dans son profil
  - **Cause** : L'indice P était calculé avec TOUTES les évaluations (via `pratique.calculerPerformance()`)
    alors que la Note finale utilisait la méthode de sélection configurée
  - **Solution** : `calculerEtStockerIndicesCP()` utilise maintenant `calculerDetailsNoteFinale()`
    - L'indice P reflète la vraie note finale de session
    - Respecte la méthode de sélection (meilleurs, récents, récents-meilleurs)
    - Respecte les pondérations portfolio/terminale
    - Applique les règles de conformité (plafonnement)
  - **Fichiers modifiés** :
    - `js/portfolio.js` : `calculerEtStockerIndicesCP()` utilise `calculerDetailsNoteFinale()`
    - `js/profil-etudiant.js` : Export de `calculerDetailsNoteFinale` pour accès global

### Documentation / Aide

- [ ] **#2** Guide PDF pour utilisateurs (10-15 pages)
  - Version imprimable du contenu de la section Aide
  - Workflow de configuration pas-à-pas
  - Captures d'écran annotées

- [x] **#10** Mettre a jour section AIDE ✅ FAIT (26 jan 2026)
  - Notes de version Beta 96 ajoutées
  - Notes de version Beta 95.3-95.7 consolidées
  - Section Introduction et Configuration à jour

- [ ] **#11** Message "Nouveautes de la beta" automatise
  - Mise a jour automatique apres chaque correctif fonctionnel
  - Synchronise avec le numero de build

- [ ] **#18** Etendre aide contextuelle 😎
  - Ajouter aides pour cas d'erreur frequents
  - Pas seulement les sections, aussi les messages d'erreur

- [x] **#43** Apercu avant impression fidele au PDF final ✅ FAIT (28 jan 2026)
  - Correction des en-têtes de niveaux : fond blanc comme le PDF (au lieu de gris)
  - Alignement des styles avec le rendu PDF final
  - **Fichier modifie** : `js/export-pdf.js`

- [x] **#44** Effet 3D sur les bulles du tableau de bord ✅ FAIT (28 jan 2026)
  - Ombre décentrée simulant lumière latérale gauche→droite
  - Dégradé de fond pour profondeur
  - Highlight inset pour reflet
  - **Fichier modifie** : `styles.css` (classe `.barre-etudiant`)

- [x] **#45** Animation des bulles animees de l'entete ✅ FAIT (28 jan 2026)
  - Effet 3D harmonisé avec les bulles du tableau de bord
  - Dégradés de couleur pour chaque pratique (SOM, STD, SPE, DEN)
  - Ombre décentrée et highlights inset ajoutés
  - **Fichier modifie** : `index.html` (section styles bulles)

- [x] **#40** Boutons d'aide dans les modals de bibliothèques ✅ FAIT (28 jan 2026)
  - Ajout du bouton 😎 dans les 5 bibliothèques (grilles, échelles, cartouches, pratiques, productions)
  - Contenu d'aide expliquant les badges (Locale/Bibliothèque/Retirée) et les boutons
  - **Fichiers modifiés** : `js/aide-contextuelle-contenu.js`, `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#41** Uniformiser présentation visuelle des sidebars ✅ FAIT (28 jan 2026)
  - Style uniforme pour les boutons "Consulter la bibliothèque" (font-size: 0.9rem)
  - Classe `.sidebar-vide` pour messages vides (remplace `.banque-vide`)
  - **Fichiers modifiés** : `index.html`, `styles.css`

- [x] **#42** Uniformiser présentation visuelle des bibliothèques ✅ FAIT (28 jan 2026)
  - Badges de source (Locale/Bibliothèque/Retirée) ajoutés aux 4 bibliothèques
  - Affichage ID court (#XXXX) pour identifier les éléments
  - Détection de doublons potentiels avec avertissement
  - **Fichiers modifiés** : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/productions.js`

- [x] **#46** Corrections visuelles Beta 96.1 ✅ FAIT (28 jan 2026)
  - Z-index modal d'aide : 10002 (au-dessus des bibliothèques à 10000)
  - Doublon bouton "Consulter la bibliothèque" dans cartouches supprimé
  - Bouton "Préparer le PDF" ajouté à la section Productions
  - Footer PDF : espacement corrigé, nom enseignant correctement affiché
  - Effet 3D appliqué aux bulles de niveau dans les tableaux (classe `.bulle-niveau-tableau`)
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`, `js/profil-etudiant.js`

### Recherche / Analyse longitudinale

- [ ] **#35** Import historique H2024 (trimestre implementation portfolio)
  - **Contexte** : Premier trimestre du portfolio, pratique sommative uniquement
  - **Donnees disponibles** : TSV artefacts, etudiants, evaluations
  - **Caracteristiques** : Pas de PAN, pas de RaI, pas de patterns
  - **Objectif** : Avoir le baseline complet pour comparaison longitudinale
  - **Processus** : Meme methode que A2024 (scripts d'import console)
  - **Livrable** : Trimestre h2024 archive dans l'application

- [ ] **#36** Rapport comparatif inter-trimestres
  - **Objectif** : Comparer les trimestres pour valider le systeme et analyser la pratique
  - **Trimestres** : H2024, A2024, A2025, H2026
  - **Indicateurs** : A, C, P, E, patterns, niveaux RaI (quand disponibles)
  - **Variables systeme** : +Portfolio (H24), +PAN (A25), +RaI (A25), +Patterns (A25)
  - **Variables pratique** : Nombre d'artefacts, interventions, abandons
  - **Questions de recherche** :
    - Impact du RaI sur les interventions et les resultats ?
    - Impact de la reduction du nombre d'artefacts sur P ?
    - Evolution des patterns entre cohortes ?
  - **Hypothese principale** : L'introduction de la RaI (A25) a rendu l'enseignant plus proactif
    - Chaine causale : RaI → niveaux/patterns visibles → interventions precoces → moins de decrochages → meilleures moyennes
    - A valider : comparer taux de decrochage et moyennes finales A24 (sans RaI) vs A25+ (avec RaI)
    - Potentiel : communication AQPC si resultats concluants
  - **Variable confondante** : Profil des etudiants
    - A25 : beaucoup d'eleves en sciences (meilleurs resultats attendus)
    - Documenter le profil (programme d'etudes) par trimestre pour nuancer les conclusions
    - **Donnees disponibles** : programmes dans l'application et/ou tableurs sources
  - **Format** : Rapport genere (PDF ou markdown) avec tableaux et graphiques
  - **Prerequis** : #35 (Import H2024) pour avoir les 4 trimestres

### Planification pedagogique

- [ ] **#34** Module Planification — Phase 2 : Enseignement explicite
  - **Phase 1 LIVRÉE** (7 fév 2026) : Carte mentale intégrée dans l'app (voir #123)
  - **Phase 2** : Enrichir la carte mentale avec le modèle de l'enseignement explicite
  - **Public cible** : Enseignants novices qui découvrent l'enseignement explicite
  - **Concepteur** : Grégoire (5-6 ans de pratique, formation TELUQ en enseignement efficace)
  - **Les 5 phases d'une leçon** :
    1. Ouverture (objectif, prérequis)
    2. Modelage ("je fais" - enseignant verbalise sa pensée)
    3. Pratique guidée ("nous faisons" - avec aide)
    4. Pratique autonome ("vous faites" - sans aide)
    5. Clôture (synthèse, annonce suite)
  - **Fonctionnalités envisagées** :
    - Wizard/Primo pour guider la planification des leçons
    - Templates de leçons selon les 5 phases
    - Lien entre nœuds de la carte et productions/évaluations existantes
  - **Fichier de specs** : `docs/enseignement explicite/SPEC-MODULE-PLANIFICATION.md`
  - **Référence PDF** : `docs/enseignement explicite/livret-enseignement_explicite_2024-01-03.pdf` (Académie de Paris)
  - **Prérequis** : Documentation complète de la logique pédagogique avant codage

### Mode simplifie

- [ ] **#33** Mode Tableur - Saisie directe des resultats (BETA 97 - MARS 2026)
  - **Concept** : Permettre d'utiliser l'application sans creer de productions, grilles, echelles, etc.
  - **Usage** : Entrer directement les resultats des etudiants comme dans un tableur
  - **Objectif** : Suivi de l'apprentissage avec calculs automatiques (moyennes, progression, distribution)
  - **Public cible** : Enseignants qui ont deja leur propre systeme d'evaluation ou qui veulent un outil simple
  - **A explorer** :
    - Format des notes (sur 100? lettres? echelle personnalisee?)
    - Nommage libre des evaluations ("Examen 1", "TP2", etc.)
    - Integration avec le tableau de bord (indices C/P)
    - Cohabitation avec le mode complet (pratiques de notation)
  - **Prerequis** : Documenter la logique complete avant codage

### Securite / Protection des donnees

- [x] **#48** BUG CRITIQUE : Import données personnelles bloqué sur nouvel appareil ✅ CORRIGÉ (31 jan 2026)
  - **Symptôme** : Le message "Partage impossible" s'affichait même pour sa propre sauvegarde
  - **Impact** : Impossible de restaurer étudiants, présences et notes sur un nouvel appareil (ex: iPad)
  - **Corrections apportées** :
    1. Checkbox "C'est ma propre sauvegarde" ajoutée pour bypasser la protection
    2. Cocher auto des cases Étudiants/Présences/Notes quand on confirme sa sauvegarde
    3. Préservation des IDs originaux (pratiques, grilles, échelles, productions)
    4. Import des données calendrier (`cadreCalendrier`, `horaireHebdo`, etc.)
  - **Fichiers modifiés** : `js/import-export.js`
  - **Résultat** : Synchronisation MacBook ↔ iPad fonctionnelle

- [ ] **#47** Mot de passe optionnel pour sauvegarde/restauration
  - **Objectif** : Renforcer la protection des données personnelles lors des transferts
  - **Fonctionnement** :
    - Option lors de l'export : "Protéger avec un mot de passe"
    - Chiffrement des données sensibles (étudiants, présences, notes) avec le mot de passe
    - Demande du mot de passe lors de l'import pour déverrouiller les données
  - **Algorithme** : AES-256 via Web Crypto API (natif navigateur)
  - **UX** : Le mot de passe n'est pas stocké, seulement utilisé pour chiffrer/déchiffrer
  - **Cas d'usage** :
    - Transfert entre appareils personnels (MacBook → iPad)
    - Sauvegarde sur cloud ou clé USB
    - Protection contre accès non autorisé au fichier JSON
  - **Prerequis** : Documenter la logique de chiffrement avant codage

### Fiabilite / Maintenance

- [x] **#32** Refonte architecture groupe Demo ✅ OBSOLÈTE (6 fév 2026) — Remplacé par Chantiers 1-4 (Beta 97.2) : route démo isolée, pack 20 étudiants anonymisés, page d'accueil, guidage contextuel

- [x] **#12** Audit db.get() vs db.getSync() ✅ CORRIGÉ (8 fév 2026)
  - **Résultat** : Architecture saine — `db.set()` ET `db.setSync()` écrivent dans les DEUX stores (localStorage + IndexedDB). Pas de désynchronisation systémique.
  - **340 appels db.get()** (async), **992 appels db.getSync()** (sync) — 99.1% correctement awaités
  - **Fix 1** : contexte.js:117 — ajout `.catch()` sur le `.then()` sans gestion d'erreur
  - **Fix 2** : pratiques-materiel.js:1256 — double écriture `db.set()` + `db.setSync()` redondante retirée
  - **Fix 3** : wizard-pratique-v2.js:1709 — double écriture `db.setSync()` + `db.set()` redondante retirée
  - **Fichiers** : `js/contexte.js`, `js/pratiques-materiel.js`, `js/wizard-pratique-v2.js`

- [ ] **#13** Outil verification integrite donnees
  - Comparer IndexedDB et localStorage
  - Detecter et signaler les incoherences

- [ ] **#15** Consolidation wizard vs pratiques-materiel
  - Code duplique pour creation de pratiques
  - Factoriser logique commune

- [ ] **#16** Systeme changelog automatise
  - Generer notes de version depuis commits ou SESSION.md
  - Reduire maintenance manuelle

- [ ] **#17** Checklist tests de regression
  - Documenter verifications manuelles apres chaque build
  - Creer pratique, evaluer, sauvegarder, recharger, etc.

- [ ] **#27** Documenter conventions nommage champs
  - nArtefactsPAN vs nbArtefactsSoumis vs nombreTotal
  - Creer reference dans docs/ pour coherence future

- [ ] **#28** Ajouter mode edition a Wizard V2
  - Permettre d'editer une pratique existante via wizard-pratique-v2
  - Actuellement l'edition utilise le wizard legacy

- [ ] **#29** Retirer wizard legacy (post #28)
  - Supprimer modalWizardPratique (~600 lignes HTML)
  - Supprimer fonctions legacy dans pratiques.js
  - Prerequis : #28 complete

### Bibliotheques

- [x] **#40** Boutons d'aide 😎 dans les modals de bibliotheques ✅ FAIT (28 jan 2026)
  - Aide contextuelle ajoutée expliquant le fonctionnement des bibliothèques
  - Distinction claire : Retirer ≠ Supprimer, Locale vs Bibliothèque, doublons
  - **Fichiers modifies** : `js/aide-contextuelle-contenu.js`, `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#41** Uniformiser presentation visuelle des sidebars ✅ FAIT (28 jan 2026)
  - Bouton "Consulter la bibliothèque" ajouté aux cartouches
  - Style uniforme (font-size: 0.9rem) sur tous les boutons
  - Classe `.banque-vide` remplacée par `.sidebar-vide` pour cohérence
  - **Fichiers modifies** : `index.html`, `js/cartouches.js`

- [x] **#42** Uniformiser presentation visuelle des bibliotheques ✅ FAIT (28 jan 2026)
  - Vérification : ordre des boutons déjà uniforme (Dupliquer → Exporter → Retirer → Supprimer)
  - Badges source (Locale/Bibliothèque/Retirée) ajoutés aux 4 bibliothèques
  - IDs courts (#abc123) ajoutés pour identifier les doublons
  - **Fichiers modifies** : `js/grilles.js`, `js/echelles.js`, `js/cartouches.js`, `js/pratiques-materiel.js`

- [x] **#7-a** Bouton Supprimer dans bibliotheques ✅ FAIT (28 jan 2026)
  - Suppression définitive avec confirmation (modal)
  - Vérification des dépendances (ex: cartouches liées à une grille)
  - Bouton "Retirer" changé de rouge à gris (action moins grave)
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

- [x] **#7-b** Bouton Dupliquer dans bibliotheques ✅ FAIT (28 jan 2026)
  - Duplication avec nouvel ID et suffixe "(copie)"
  - Métadonnées CC nettoyées sur la copie
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

### Configuration

- [ ] **#22** Mettre a jour fichier noms_stables.json
  - Verifier que tous les identifiants critiques sont documentes
  - Ajouter les nouveaux noms proteges

---

## Complete (Beta 97.3 - 7 février 2026)

- [x] **#123** Module Planification — Carte mentale intégrée + renommage Calendrier → Séances
  - Portage du prototype standalone (3608 lignes) vers 3 modules : `planification-donnees.js`, `planification-carte.js`, `planification.js`
  - ~849 lignes CSS ajoutées à `styles.css` (préfixe `planif-`)
  - Carte mentale à 2 zones : Objectifs & Savoirs (gauche) / Organisation & Activités (droite)
  - 10 types de nœuds : compétence, idée maîtresse, connaissance, prérequis, stratégie, séquence, leçon, activité, soutien, révision
  - Panneau latéral Séances avec vue calendrier, export texte et TSV
  - Multi-cartes avec sélecteur, import/export JSON
  - Storage : `cle('planification_mindmap')` via db.getSync/setSync
  - Auto-migration des clés prototype (`proto_cm_*`) au premier chargement
  - Navigation et config intégrées (`config.js`, `navigation.js`)
  - **Fichiers** : `index.html`, `styles.css`, `js/planification-*.js`, `js/config.js`, `js/navigation.js`, `js/accueil.js`

- [x] **#118** Zoom adaptatif : modes "Pleine largeur" et "Pleine hauteur"
  - Remplacement des boutons +/- par deux modes de zoom adaptatifs
  - Pleine largeur : le document couvre toute la largeur du conteneur
  - Pleine hauteur : le document tient en hauteur dans la fenêtre
  - **Fichiers** : `js/travaux-visionneuse.js`, `js/travaux-ui.js`

- [x] **#119** Épaisseur du trait relative à la résolution + affichage pixels
  - Résolution de référence 1000px : l'épaisseur visuelle est constante quelle que soit la résolution
  - Slider affiche l'épaisseur en pixels réels (`Xpx`) en temps réel
  - Ratio appliqué au dessin live, au rendu des annotations et à l'export PDF
  - **Fichiers** : `js/travaux-outils.js`, `js/travaux-annotation.js`, `js/travaux-export-pdf.js`

- [x] **#120** Bouton Annotation → Évaluation
  - Bouton "Évaluer" dans la toolbar d'annotation
  - Navigation directe vers le formulaire d'évaluation avec étudiant et production pré-remplis
  - Utilise `evaluerProduction()` existant dans liste-evaluations.js
  - **Fichier** : `js/travaux-ui.js`

- [x] **#121** Export PDF dossier complet (travail annoté + grille + rétroaction)
  - Nouvelle fonction `exporterDossierComplet(da, productionId)` dans travaux-export-pdf.js
  - Assemble les pages annotées + page de synthèse (grille remplie + rétroaction)
  - Bouton "Dossier PDF" ajouté dans la liste des évaluations complétées
  - **Fichiers** : `js/travaux-export-pdf.js`, `js/liste-evaluations.js`

- [x] **#122** Correctif : aperçu Construction de la note vide (exports IIFE manquants)
  - `chargerStatistiquesApercu()` et `chargerMaterielConfigure()` non exportées après wrapping IIFE (#70)
  - Ajout des exports `window.*` dans statistiques.js, presences-apercu.js, evaluations-apercu.js
  - **Fichiers** : `js/statistiques.js`, `js/presences-apercu.js`, `js/evaluations-apercu.js`

- [x] **#113** Correctif CRITIQUE : fontSize exponentielle lors du redimensionnement de texte
  - `appliquerRedimensionnement()` multipliait la fontSize deja modifiee a chaque frame de drag
  - Correction : utiliser `donneesAvantModif.fontSize` (valeur capturee au debut du drag)
  - **Fichier** : `js/travaux-annotation.js`

- [x] **#114** Correctif : selection fantome au changement de page
  - `annotationSelectionnee` persistait entre les pages, causant un rectangle de selection fantome
  - Correction : reset `annotationSelectionnee = null` dans le handler `travaux-page-rendue`
  - **Fichier** : `js/travaux-annotation.js`

- [x] **#115** Correctif : EXPORT_SCALE hardcode dans les fonctions de dessin d'export
  - `dessinerAnnotationsSurCtx` utilisait `EXPORT_SCALE = 2.0` en dur, meme quand l'archive passe `scale: 1.5`
  - Correction : parametre `scale` propage a `dessinerAnnotationsSurCtx`, `dessinerTrait`, `dessinerForme`
  - L'archivage d'images (taille native) passe `scale = 1`
  - **Fichiers** : `js/travaux-export-pdf.js`, `js/travaux-archivage.js`

- [x] **#116** Correctif : event listeners qui s'accumulent dans la visionneuse
  - `travaux-annotation-activee/desactivee` etaient ajoutes a chaque appel de `afficherVisionneuse()`
  - Correction : listeners deplaces dans `initialiserModuleTravaux()` (execute une seule fois)
  - **Fichier** : `js/travaux-ui.js`

- [x] **#117** Correctif : Backspace intercepte globalement meme dans les champs de formulaire
  - `onKeyDown` capturait Delete/Backspace dans les `<input>`, `<select>`, `<textarea>`
  - Correction : guard `e.target.matches('input, select, textarea, [contenteditable]')` ajoute
  - **Fichier** : `js/travaux-annotation.js`

---

## Complete (Beta 97.2 - 7 février 2026)

- [x] **#110** Outil d'annotation — Panneau retractable avec memoire de session
  - Bouton toggle avec fleche directionnelle (◀/▶) visible des que la sidebar est repliee
  - Memoire manuelle via `sessionStorage` : la sidebar reste repliee si l'utilisateur l'a repliee
  - Sortie d'annotation ne redéploie plus la sidebar si manuellement repliee
  - **Fichier** : `js/travaux-ui.js`

- [x] **#111** Outil d'annotation — Mode selection/edition des annotations
  - Nouvel outil Selection (☝️) en position 0 de la palette
  - Hit-testing reutilisable (`trouverAnnotationAuPoint`) : stickers > texte > formes > traits
  - Cadre pointille bleu + 4 poignees blanches aux coins pour selection visuelle
  - Deplacement : traits, formes, texte, stickers (drag dans la bbox)
  - Redimensionnement V1 : formes, stickers, texte (traits = deplacement seulement)
  - Suppression via Delete/Backspace, deselection via Escape
  - Undo/redo pour modifications (`modification-annotation` avec avant/apres)
  - Curseur contextuel (move, nw-resize, etc.)
  - Apple Pencil : le mode selection accepte le touch (doigt) pour selection tactile iPad
  - Gomme refactorisee pour utiliser le hit-testing partage
  - **Fichiers** : `js/travaux-annotation.js`, `js/travaux-outils.js`

- [x] **#112** Outil d'annotation — Export PDF annote dans archives ZIP
  - Nouvelle fonction `rendrePDFAvecAnnotations()` partagee (export-pdf)
  - Remplacement du `return null` pour les PDF dans `genererFichierAnnote()`
  - Consolidation du code duplique : `dessinerAnnotationsSurCanvas` (91 lignes) → wrapper 3 lignes
  - Le rendu partage inclut les stickers (manquant dans l'ancien code archivage)
  - Callback de progression pour le rendu PDF multi-pages
  - **Fichiers** : `js/travaux-export-pdf.js`, `js/travaux-archivage.js`

---

## Complete (Beta 96.3 - 6 février 2026)

- [x] **#109** Module Travaux - Import, Annotation et Archivage
  - Import drag-drop de PDF/images avec detection auto du DA etudiant
  - Moteur d'annotation Canvas avec support Apple Pencil (pression, rejet paume, undo/redo)
  - Integration evaluation : vue cote-a-cote travail + grille, section "Travaux soumis" dans profil
  - Archivage ZIP par etudiant/production/semestre via JSZip
  - File System Access API (Mac), scroll virtuel (500+ miniatures), pre-rendu pages adjacentes, moniteur quota
  - **Beta 97.1** : Panneau retractable en mode annotation, palette de 12 tampons de retroaction (qualite + diagnostic), export PDF annote avec page de synthese (jsPDF), ecran de revision avant export
  - **Nouveaux fichiers** : 8 modules JS (`js/travaux-*.js` + `js/travaux-export-pdf.js`), 3 libs (`libs/pdf.min.js`, `libs/pdf.worker.min.js`, `libs/jszip.min.js`), 12 PNG (`autocollants/`)
  - **Fichiers modifies** : `index.html`, `styles.css`, `js/config.js`, `js/navigation.js`, `js/trimestres.js`, `js/evaluation.js`, `js/profil-etudiant.js`

---

## Complete (Beta 96 - 25 janvier 2026)

- [x] **#38** Graphique spaghetti - Trajectoires d'apprentissage par artefact
  - Affiche les **resultats bruts par artefact** (pas l'indice P agrege)
  - Montre la volatilite reelle de l'apprentissage (hauts et bas, non-linearite)
  - Revele les artefacts difficiles (convergence vers le bas)
  - Permet de voir la resilience (rebonds apres difficultes)
  - Zones IDME colorees en arriere-plan avec etiquettes a droite
  - Carte d'aide 😎 expliquant pourquoi les resultats bruts vs indice P
  - **Decision pedagogique** : L'indice P (meilleures notes) masque la non-linearite
  - **Fichiers modifies** : `index.html`, `js/graphiques-progression.js`, `js/tableau-bord-apercu.js`
  - **Prochaine etape** : Courbes de distribution (densite) des indices ACPE

---

## Complete (Beta 95.7 - 25 janvier 2026)

- [x] **Import historique A2024** Archivage trimestre Automne 2024
  - Import retroactif : 55 etudiants, 2 groupes, 750 evaluations, 1650 presences
  - Echelle IDME (I=40%, D=65%, M=85%, E=100%) documentee dans bibliotheque
  - Pratique : 6 artefacts recents (60%) + Analyse finale (40%)
  - Correction tri "recents" par numero de production (pas par date)
  - Scripts d'import et diagnostic dans `docs/A2024/`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

## Complete (Beta 95.7 - 22 janvier 2026)

- [x] **Calcul assiduite en periodes** (correction majeure)
  - Formule corrigee : `periodesPresentes / periodesOffertes` (au lieu de heures)
  - Resultat : 2/2 periodes = 100% (avant: 92% a cause de la conversion heures)
  - Etudiants absents affichent 0% (au lieu du tiret) si presences saisies
  - **Fichiers modifies** : `js/saisie-presences.js`, `js/etudiants.js`

- [x] **Moyenne A du groupe** affichee partout
  - Entete liste etudiants : `moy=93%` sous la colonne A
  - Barre Assiduite du tableau de bord : moyenne + 28 points individuels
  - Calcul inclut les 0% (absents) pour moyenne correcte
  - **Fichiers modifies** : `js/etudiants.js`, `js/tableau-bord-apercu.js`

- [x] **Points individuels** sur barre Assiduite
  - Distribution visible : 26 points a droite (100%), 2 points a gauche (0%)
  - Mode PAN active par defaut si aucun mode configure
  - Filtrage specifique pour A : inclut tous les etudiants avec presences saisies
  - **Fichier modifie** : `js/tableau-bord-apercu.js`

- [x] **Bug namespacing presences** Saisie presences ne fonctionnait pas
  - `db.getSync('presences', [])` utilisait la cle sans prefixe trimestre
  - Corrige dans : `saisie-presences.js`, `interventions.js`, `rapport-bug.js`
  - Ajoute protection `Array.isArray()` dans `presences-apercu.js`
  - **Fichiers modifies** : 4 fichiers JS
  - **Resultat** : Saisie presences fonctionne avec namespacing correct

- [x] **Synchronisation horaireHebdo** avec horaires du trimestre
  - Le calendrier ne reconnaissait pas les jours de cours du nouveau trimestre
  - `horaireHebdo` n'etait pas mis a jour lors de la sauvegarde d'un horaire
  - Ajout synchronisation automatique dans `sauvegarderHoraireV2()` et `supprimerHoraireV2()`
  - **Fichier modifie** : `js/trimestre-v2.js`
  - **Resultat** : Le calendrier reconnait correctement les jours de cours

- [x] **UX Saisie presences** Input numerique au lieu de dropdown
  - Remplacement du dropdown par un champ numerique (permet fractions: 1.5, etc.)
  - Affichage format `X/Y` (ex: `2/2` pour presence complete)
  - Colonne "Total heures" devient "Total per." (periodes)
  - **Fichiers modifies** : `js/saisie-presences.js`, `index.html`

- [x] **Affichage nom pratique** dans l'entete
  - L'entete affichait l'ID (pratique-xxx) au lieu du nom
  - Recherche dans `pratiquesConfigurables` si l'ID n'est pas dans les pratiques codees
  - Chargement async via `db.get()` si `db.getSync()` retourne tableau vide (timing IndexedDB)
  - **Fichier modifie** : `js/contexte.js`

## Complete (Beta 95.7 - 21 janvier 2026)

- [x] **Bug critique** Trimestres A2025/Demo inaccessibles
  - `changerTrimestreActif()` ne mettait pas a jour `window.trimestreActif`
  - `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
  - Donnees demo sans groupe-cours (maintenant cree automatiquement)
  - Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` dans trimestres.js
  - **Fichiers modifies** : `js/trimestres.js`, `js/donnees-demo.js`
  - **Resultat** : A2025 affiche 30 etudiants, Demo cree auto groupe-cours

- [x] **Migration horaires/groupesCours** vers trimestre actif
  - Donnees H2026 stockees sans prefixe mais lues avec prefixe
  - Nouvelle fonction `migrerHorairesEtGroupesCours()` dans trimestres.js
  - Migration automatique au demarrage de l'application

## Complete (Beta 95.7 - 20 janvier 2026)

- [x] **#20** Datalist programmes d'etudes (~130 programmes preuniversitaires + techniques)
- [x] **#25** Analyse fonctionnalites pour Claude Cowork (docs/ANALYSE-FONCTIONNALITES.md)
- [x] **#14** Dropdowns discipline : liste complete (~120 disciplines, 6 optgroups)
- [x] **#26** Audit versions Primo : pas de conflit, 3 recommandations ajoutees (#27-29)
- [x] **#24** Option hybride construction note portfolio (Primo + Expert)
- [x] **#23** Uniformiser boutons tous modals (Design System v7)
- [x] **#4** Persistance donnees Wizard -> Mode Expert (flag enChargementFormulaire)
- [x] **#5** Valeurs par defaut jetons : 2 jetons/eleve, 2 jours delai
- [x] **#6** Dropdown note maximale (reprise ciblee) : echelle dynamique
- [x] **#8** Message aide bibliotheque pratiques
- [x] **#9** Document backlog independant (BACKLOG.md)
- [x] **#19** Ordre disciplines dropdown (100->600, groupe 400 corrige)
- [x] **#21** Menage fichiers repertoire principal (fusion archive/, reorganisation)
- [x] **#3** Clarifier nombre total d'artefacts (meilleurs vs obligatoires)

---

## Complete (Beta 95.6 - 19 janvier 2026)

- [x] Dropdown discipline (champ texte -> dropdown 6 categories)
- [x] Correction sauvegarde pratiques (desync IndexedDB/localStorage)
- [x] Boutons 😎 aide contextuelle (14 themes)
- [x] Design System v7 (harmonisation styles)

---

## Reporte (Post-AQPC ou V1.1)

- [ ] PAN-Objectifs ponderes (Michel B.)
- [ ] Remplacement progression (Jordan R.)
- [ ] PAN-Jugement global (config JSON)

---

## Notes

### Priorites
- **Retours testeurs** passent TOUJOURS AVANT ce backlog
- Items classes par importance et facilite d'implementation

### Pour ajouter un item
```markdown
- [ ] **#XX** Description courte
  - Detail 1
  - Detail 2
```

### Pour marquer comme complete
Deplacer dans la section "Complete" avec [x]
