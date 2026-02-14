# SESSION ACTIVE - BETA 97.7

**Date** : 14 février 2026
**Version** : Beta 97.7 (build 0214-0932)
**Statut** : Refonte wizard de configuration des pratiques

## SESSION DU 14 FÉVRIER 2026

### Travail accompli — Améliorations UX du wizard (Beta 97.7, build 0214-0932)

31. **Grille démo** : Quand aucune grille de critères n'existe, le wizard propose un bouton « Créer une grille de base (4 critères) » qui génère une grille générique (Compréhension, Démarche, Communication, Esprit critique à 25% chacun). Auto-sélectionnée après création. Modifiable dans Matériel → Critères.

32. **Annonce du type diagnostiqué au récapitulatif** : Le récapitulatif commence par un encadré proéminent avec badge coloré (SOM bleu / PAN orange / SPE vert), le nom du type, et une explication pédagogique vulgarisant la méthode. Variante et règles aussi affichées.

33. **Champ nom modifiable au récapitulatif** : Sous le diagnostic, un champ texte éditable pré-rempli avec le nom saisi à l'étape 1. Le placeholder suggère un format contextualisé. `creerPratiqueV2()` lit ce champ avant de sauvegarder.

34. **Carte d'accueil renommée** : « Construire la note » → « Configurer une pratique de notation » avec description actualisée.

35. **Placeholder simplifié** : « Ex: PAN-Standards Littérature H2026 » → « Ex: Ma pratique de notation » (moins intimidant pour les novices).

### Travail accompli — Refonte du wizard de configuration (Beta 97.7, build 0214-0909)

28. **Classification comportementale** : Remplacement de l'étape `type-pratique` (qui demandait aux enseignants de se classer dans une taxonomie académique) par des questions concrètes sur le comportement de notation.
    - **Q1** : « Comment calculez-vous la note finale ? » → moyenne / niveaux / acceptable / pas certain
    - **Q2** : « Utilisez-vous des règles spéciales ? » (multi-select) → remplacement / verrou / portfolio / plafonnement / aucune
    - **Q3** : « Comment structurez-vous vos évaluations ? » → par artefacts / par objectifs
    - **Q4** : « Combien d'évaluations prévoyez-vous ? » → nombre
    - **Q5** : « Quels sont vos seuils personnels ? » → 3 seuils en %
    - **`deduireTypePratique()`** : Fonction d'inférence qui retourne `{ type, variante, regles, confiance }` — score 12/12 enseignants
    - **Nouveau type de champ** : `checkbox-cards` (multi-sélection avec exclusion mutuelle pour "aucune")

29. **Méthodes de calcul manquantes** (pratique-configurable.js) :
    - **`calculerParSpecifications()`** : Vérifie les spécifications satisfaites, retourne la note du forfait le plus élevé (ref: François)
    - **`appliquerDoubleVerrou()`** : Plafonne la note finale si l'évaluation verrouillée est sous le seuil (ref: Marie-Hélène)
    - **`calculerParRemplacementProgression()`** : Pour chaque paire, utilise `max(initiale, finale)` avec pondérations (ref: Jordan)

30. **Enrichissement de la capture** (Phase 2) :
    - **`config-sommative-regles`** : Étape conditionnelle pour configurer remplacement/verrou/portfolio/plafonnement
    - **`config-objectifs-definition`** : Capture du nombre d'objectifs d'apprentissage
    - **`config-reprises`** : Toggle reprises + mode (illimité/limité/non) + nb max
    - **CSS** : Styles pour checkbox-cards, dynamic-list, weight-slider, replacement-pair
    - **`construireConfigComplete()`** : Extension pour les nouveaux champs (variante, reglesSpeciales, objectifs, seuils)

### Fichiers modifiés (14 février - Beta 97.7)
- `js/wizard-pratique-v2.js` — Classification comportementale Q1-Q5, deduireTypePratique(), grille démo, récapitulatif refondu, nom modifiable
- `js/pratiques/pratique-configurable.js` — 3 méthodes de calcul implémentées (+190 lignes)
- `js/pratiques/pratique-registre.js` — Extension construireConfigComplete() pour nouveaux champs (+5 lignes)
- `styles.css` — CSS checkbox-cards, dynamic-list, weight-slider, replacement-pair (+150 lignes)
- `js/accueil.js` — Carte « Configurer une pratique de notation » (icône, titre, description)
- `js/changelog-data.js` — Entrées changelog wizard
- `index.html` — VERSION_MAJEURE 97.7, BUILD_ID 0214-0932
- `version.json` — Build 0214-0932, Beta 97.7

### Matrice de validation (12 cartographies)
| # | Enseignant | Q1 | Type déduit | Variante | OK |
|---|-----------|-----|-------------|----------|-----|
| 1 | Jordan R. | moyenne | sommative | progressive | OK |
| 2 | Bruno V. | niveaux | pan-standards | n-meilleurs | OK |
| 3 | Michel B. | niveaux | pan-standards | moyenne-ponderee | OK |
| 4 | Étienne L. | moyenne | sommative | classique | OK |
| 5 | Olivier L. | moyenne | sommative | classique | OK |
| 6 | Marie-Hélène L. | moyenne | sommative | verrou | OK |
| 7 | François A.-H. | acceptable | pan-specifications | bundles | OK |
| 8 | Hélène C. | moyenne | sommative | portfolio | OK |
| 9 | Annie Bourgoin | moyenne | sommative | portfolio | OK |
| 10 | Xavier C.-T. | niveaux | pan-standards | seuils-critiques | OK |
| 11 | Élise Desgreniers | niveaux | pan-standards | comptage | OK |
| 12 | Grégoire Bédard | niveaux | pan-standards | n-meilleurs | OK |

---

## SESSION DU 13 FÉVRIER 2026

### Travail accompli — Sécurisation des données personnelles (Beta 97.6)

26. **Sécurisation des données personnelles** : Audit et corrections systémiques pour protéger les données d'étudiants.
    - **Anti-XSS** : `echapperHtml()` appliqué systématiquement dans import-export.js, grilles.js, entites-ui.js
    - **Validation imports** : Fonctions `assainirChaine()` et `assainirObjet()` avec schémas whitelist (grille, échelle, pratique, production). Limite 10 Mo par fichier JSON importé.
    - **Exports sécurisés** : Avertissement données personnelles + préfixe CONFIDENTIEL dans le nom de fichier. Noms d'étudiants retirés des snapshots exportés (DA conservé).
    - **Isolation groupes** : `cleSnapshots()` retourne null sans cours actif. Fallbacks vers `[]` au lieu de `obtenirDonneesSelonMode('groupeEtudiants')` dans snapshots.js.
    - **Nettoyage démo** : Suppression de `demo_snapshots_GC_DEMO` + balayage générique de toutes les clés `demo_*` via `db.keys()`.

27. **Corrections bugs Élise** (#64, #65, #66, #67) :
    - **Bug #64** : `afficherNotificationSucces` / `afficherNotificationErreur` non accessibles depuis trimestre-v2.js → wrappers locaux + exports vers window dans evaluation.js et groupe.js
    - **Bug #65** : `e.target.closest is not a function` dans tooltips.js → guard typeof avant appel
    - **Bug #66** : 0 étudiants affichés malgré 24 dans la DB — étudiants importés sans champ `groupe` filtrés silencieusement par `normaliserGroupe(undefined)="00000" ≠ "00001"`. Correction : inclusion des étudiants sans groupe dans `obtenirDonneesSelonMode()` et `obtenirEtudiantsCoursActif()` (modes.js)
    - **Bug #67** : Rapport de bug affichait "Cours actif: undefined (A2025)" — `rapport-bug.js` cherchait dans `listeCours` au lieu de lire `infoCours` (source de vérité)

### Fichiers modifiés (13 février - Beta 97.6)
- `js/import-export.js` — Échappement HTML, fonctions assainissement, schémas validation, limite taille, barrière exports
- `js/grilles.js` — Échappement HTML dans option grille
- `js/entites-ui.js` — Échappement HTML dans options groupe-cours et enseignant
- `js/snapshots.js` — Isolation groupe (fallback []), cleSnapshots null-safe
- `js/donnees-demo.js` — Nettoyage demo_snapshots_GC_DEMO + balayage générique demo_*
- `js/changelog-data.js` — Entrée changelog sécurisation
- `index.html` — VERSION_MAJEURE 97.6, BUILD_ID 0213-1351
- `js/trimestre-v2.js` — Wrappers locaux afficherNotificationSucces/Erreur
- `js/evaluation.js` — Export window.afficherNotificationSucces
- `js/groupe.js` — Export window.afficherNotificationErreur
- `js/tooltips.js` — Guard typeof sur e.target.closest
- `js/modes.js` — Inclusion étudiants sans champ groupe (bug #66)
- `js/rapport-bug.js` — Lecture infoCours au lieu de listeCours (bug #67)
- `Retours des testeurs/SUIVI-BUGS.md` — Bugs #64, #65, #66, #67 documentés
- `version.json` — Build 0213-1530, Beta 97.6

---

### Travail accompli — Suivi d'étudiants au tableau de bord

25. **Suivi d'étudiants** : Nouveau panneau dans la section Observer du tableau de bord.
    - Bouton « Suivi » + panneau collapsible avec liste des étudiants du groupe actif
    - Jusqu'à 5 étudiants trackés simultanément, chacun avec couleur distincte (palette Océan)
    - Points blancs deviennent des billes 3D colorées dans toutes les barres (A, C, P, E, Patterns, RàI)
    - Clic sur un point → surligne la badge correspondante dans le panneau
    - Nettoyage automatique des entrées obsolètes lors du changement de groupe
    - Compatible mode anonymisation et mode archive
    - Badges semi-transparentes avec backdrop-filter, style design system Océan
    - Stockage : `db.setSync('etudiantsSuivis', [...])` (préférence UI, non namespacée)

### Fichiers modifiés (13 février)
- `styles.css` — Classes .tracked-0 à .tracked-4 (billes 3D), panneau suivi, badges, surlignage
- `index.html` — Bouton Suivi + panneau collapsible dans carte Observer, notes de version, BUILD_ID
- `js/tableau-bord-apercu.js` — Logique complète : stockage, couleurs, nettoyage, UI panneau, événements délégués
- `js/changelog-data.js` — Entrée changelog suivi d'étudiants
- `version.json` — Build 0213-1101

---

## SESSION DU 12 FÉVRIER 2026

### Travail accompli — Tour guide & accueil enrichi

22. **Primo → Tour guide** : Remplacement de l'emoji 😎 par 🧭 et suppression des références au personnage "Primo" dans tous les textes utilisateur.
    - `index.html` : 46 emojis remplacés, textes d'aide/glossaire mis à jour
    - `js/primo-accueil.js` : Textes d'accueil modernisés ("Bienvenue dans le tour guidé")
    - `js/primo-modal.js` : Avatar et texte de confirmation mis à jour
    - `js/primo-tooltips.js` : Popup "Conseil de Primo" → "Conseil"
    - `js/primo-validation-champs.js` : Tooltips "Complété par Primo" → "Complété automatiquement"
    - `js/primo-questions.js` : Message d'accueil vouvoiement
    - 8 fichiers JS additionnels (aide-contextuelle, modal-bienvenue, profil-etudiant, etudiants, bibliotheque-ui, pratiques-materiel, changelog-data, aide-contextuelle-contenu)
    - Console logs `[Primo]` → `[Guide]` dans tous les fichiers primo-*.js

23. **Activation Tour guide** : Checkbox fonctionnelle sur la page d'accueil.
    - `js/accueil.js` : Checkbox déverrouillée, lecture de `preferencesAffichage.tourGuide`
    - `js/modes.js` : `estModeAssiste()` lit la préférence au lieu de retourner `false`
    - `js/modes.js` : Nouvelle fonction `definirTourGuide()` (sauvegarde, sync checkboxes, toggle classe CSS, événement)
    - `js/modes.js` : Initialisation au démarrage (`document.body.classList.add('mode-assiste')` si actif)

24. **Accueil élargi (10 cartes)** : Deux nouvelles cartes d'action.
    - 🎯 Construire la note → ouvre directement le wizard de création de pratique
    - 🛟 Préparer des interventions → navigue vers Tableau de bord > Interventions RàI
    - Grille passée de 4 à 5 colonnes (`accueil-cartes--10`)
    - Conteneur élargi de 800px à 1200px
    - Descriptions réduites (0.75rem) pour décompacter les colonnes

### Fichiers modifiés
- `index.html` — Emojis, textes, glossaire, CSS grille 5 colonnes, notes de version, BUILD_ID
- `js/accueil.js` — 10 cartes, checkbox tour guide, grille --10
- `js/modes.js` — estModeAssiste(), definirTourGuide(), init mode-assiste
- `js/primo-accueil.js` — Textes et console logs
- `js/primo-modal.js` — Avatar, texte, console logs
- `js/primo-tooltips.js` — Popup titre, console logs
- `js/primo-validation-champs.js` — Tooltips, console logs
- `js/primo-questions.js` — Message accueil, console logs
- `js/changelog-data.js` — Entrée Beta 97.5
- `js/aide-contextuelle.js` — Emoji titre modal
- `js/modal-bienvenue.js` — Emoji et textes Primo
- `js/aide-contextuelle-contenu.js` — Texte bouton
- `js/profil-etudiant.js` — Emojis spans et commentaires
- `js/etudiants.js` — Emoji et commentaire
- `js/bibliotheque-ui.js` — Emoji bouton
- `js/pratiques-materiel.js` — Emoji bouton

## SESSION DU 11 FÉVRIER 2026

### Travail accompli — Corrections et améliorations

17. **Notification toast** : Bandeau de mise à jour remplacé par une notification compacte en haut à droite (slide-in, X pour fermer).
18. **Double tooltip Aide** : Retiré l'attribut `title` obsolète du bouton Aide (le tooltip custom du parent suffisait).
19. **Bouton Confidentiel** : Modal corrigé — utilise `.classList.add('actif')` / `.remove('actif')` au lieu de `u-hide` (compatible avec `.modal-overlay` CSS).
    - `js/profil-etudiant.js` : `ouvrirModalConfidentiel()` et `fermerModalConfidentiel()` corrigés
    - `index.html` : Retiré `style="display: none;"` et `u-hide` du modal
20. **Type d'intervention MIO** : Nouveau type «Message écrit (MIO) à un groupe ciblé» ajouté aux interventions.
    - `js/interventions.js` : Ajouté aux 3 dropdowns, badge "MIO", garde dans `transfererPresencesVersModule()` pour ne pas affecter les présences
    - `js/profil-etudiant.js` : Icône ✉️ pour le type MIO
21. **Verrouillage des présences** : Contrôle refait et intégré dans la barre de statistiques (Présents/Absents/Total).
    - `js/saisie-presences.js` : Nouvelles fonctions `basculerVerrouillageDateActive()` et `mettreAJourControleVerrouillage()`, checkbox injecté par `restaurerCompteurPresences()`
    - Ancien mécanisme `enteteDateSeance` remplacé par une approche autonome sans dépendance à `obtenirInfosJourCalendrier`

### Travail accompli — Onglet Dépistage (Réglages)

16. **Nouvel onglet Dépistage** : Extraction des 2 cartes dépistage (Configuration du dépistage + Seuils d'interprétation) depuis Préférences vers un onglet dédié dans Réglages.
    - `js/config.js` : Ajout entrée `{ id: 'depistage', label: 'Dépistage' }` dans le tableau `reglages`
    - `js/navigation.js` : Ajout case `reglages-depistage` qui réutilise `initialiserPreferencesV2()`
    - `index.html` : HTML déplacé vers `<div id="reglages-depistage" class="sous-section">`, description Préférences mise à jour
    - L'onglet Préférences ne contient plus que : Outils, Affichage, Expérience visuelle, Navigation

## SESSION DU 10 FÉVRIER 2026

### Travail accompli — Tooltips au survol

12. **Nouveau systeme de tooltips** : Moteur leger avec delegation d'evenements (`mouseenter`/`mouseleave`), positionnement automatique (bas/haut/droite/gauche), animation CSS.
    - `css/tooltips.css` : Styles integres au theme via variables CSS (`--bleu-fonce`, `--shadow-fort`, `--radius-moyen`)
    - `js/tooltips-contenu.js` : 31 cles de contenu regroupees par zone (en-tete + reglages)
    - `js/tooltips.js` : Moteur de positionnement et cycle de vie
13. **En-tete (10 tooltips)** : Logo, version, mode affichage, signaler bug, pratique, semaine, groupe-cours, nav principale, sous-nav, reglages
14. **Reglages Trimestre (21 tooltips)** : 6 panneaux accordeon + 12 champs specifiques + 3 boutons bibliotheque
15. **Tooltips dynamiques** : `entete-pratique` et `entete-semaine` marques dans le HTML genere par `contexte.js`

### Fichiers crees
- `css/tooltips.css`
- `js/tooltips.js`
- `js/tooltips-contenu.js`

### Fichiers modifies (tooltips)
- `index.html` — 29 attributs `data-tooltip` + chargement des 3 fichiers
- `js/contexte.js` — 2 attributs `data-tooltip` sur contenu dynamique

### Travail accompli — Bibliothèques

1. **Suppression deux stores** : `supprimerXDefinitivement()` appelle maintenant `retirerXDeLaBibliotheque()` dans les 4 modules (grilles, échelles, productions, cartouches)
2. **Bouton Supprimer en Section 2** : Ajout d'un bouton "Supprimer" dans la section "Disponibles à ajouter" des 4 bibliothèques + fonctions `supprimerXDeBibliothequePartagee()`
3. **Boutons "Ajouter à la bibliothèque"** : Grilles et échelles ont maintenant un bouton `ajouterMesXALaBibliotheque()` comme productions
4. **Audit complet** : Analyse des 4 modales → 14 tâches ajoutées au BACKLOG (#144-#157) couvrant bugs fonctionnels, uniformisation visuelle et refactoring architectural

### Travail accompli — Indicateurs de développement

5. **Nouveau module `badges-dev.js`** : MutationObserver non-intrusif qui appose 🚧 pulsant sur les onglets de sous-navigation en développement actif
6. **Sections marquées** : Construction de la note (5 sous-sections) + Planification (2 sous-sections) + Aide (6 sous-sections)

### Travail accompli — Notification de mise à jour

7. **Polling `version.json`** : Vérifie toutes les 5 minutes si une nouvelle version est déployée (première vérification après 30s)
8. **Bandeau vert discret** : Apparaît en bas de l'écran avec animation slide-up quand le build distant diffère du local. Bouton "Recharger" pour appliquer la mise à jour
9. **Résilience offline** : Échecs réseau silencieux, cache-busting via `?t=timestamp`, détection unique (pas de spam)

---

## SESSION DU 8 FÉVRIER 2026 (soir)

### Travail accompli — Démo et UX

7. **Thème sarcelle en mode démo**
   - `body.mode-demo` redéfinit toutes les variables `--bleu-*` → `--sarcelle-*`
   - Navigation, boutons, fonds, info-boxes basculent automatiquement
   - Retour au bleu normal quand on quitte la démo

8. **Fix patterns d'apprentissage à 0%**
   - Export manquant `window.determinerCibleIntervention` depuis l'IIFE de profil-etudiant.js
   - Export manquant `window.calculerTauxCompletion` depuis etudiants.js
   - Race condition `calculerEtStockerIndicesCP` async→sync (portfolio.js)
   - Crash `I.toFixed(1)` quand `francaisMoyen` est null

9. **Nettoyage démo robuste**
   - `db.removeSync()` + `db.remove()` pour chaque clé demo (deux couches de stockage)
   - `db.setSync()` + `db.set()` pour les données globales filtrées
   - Élimine les résidus après rechargement

10. **Page d'accueil**
    - Carte groupe remplacée par invitation démo (mode normal)
    - Boutons "Explorer la démo | Tableau de bord" retirés du pied de page
    - Lien codexnumeris.org en pied de page
    - Cartes interverties : Sauvegarde avant Suivre le projet
    - Émoji 🔍→🗺️, pastille ✉️ à taille normale + 🔴 petit en exposant

11. **Correctifs visuels démo**
    - "Démonstration 2025" → "Données de démonstration"
    - Section "Cours (tous groupes)" masquée en mode démo
    - Encarts guidage : classe `.info-box--info` hérite du thème sarcelle automatiquement

### Fichiers modifiés (soir)
- `styles.css` — bloc `body.mode-demo` sarcelle, `.pastille-nouveautes` réduite
- `js/donnees-demo.js` — nettoyage dual localStorage+IndexedDB
- `js/accueil.js` — invitation démo, pied de page, interversion cartes
- `js/guidage-demo.js` — commentaire mis à jour
- `js/profil-etudiant.js` — export `determinerCibleIntervention`
- `js/etudiants.js` — export `calculerTauxCompletion`
- `js/portfolio.js` — `calculerEtStockerIndicesCP` sync
- `js/tableau-bord-apercu.js` — contexte démo, try/catch patterns
- `js/trimestre-v2.js` — masquer dropdown "Cours (tous groupes)" en démo
- `js/changelog-data.js` — nouvelle entrée changelog
- `index.html` — BUILD_ID, `mettreAJourPastille` adapté

---

### Travail accompli — Alignement pédagogique

1. **Système de clonage (PLAN-CLONAGE.md)**
   - `cloneSourceId` ajouté au modèle de données (creerNoeud, clonerEtatPersistant, restaurerSnapshot, chargerCarte)
   - `clonerNoeud()` remplace `dupliquerNoeud()` : copie avec identité partagée
   - Propagation titre/description à tous les clones
   - `supprimerNoeud()` : transfert d'original si l'original est supprimé
   - `evaluerBadge()` : agrège les liens de tous les clones
   - Indicateur visuel 🧬 avec surbrillance au survol
   - Bouton « Cloner » dans le panneau d'information

2. **Verbes verticaux refondus (PLAN-VERBES-LIENS.md)**
   - 5 verbes amont→aval : se décline en, se concrétise dans, s'acquiert par, se vérifie par, s'appuie sur
   - `VERBES_AUTO` réécrit avec direction inversée
   - `MIGRATION_VERBES` + `VERBES_COMPAT` pour migration automatique des anciens liens
   - Messages `evaluerBadge()` mis à jour

3. **Verbes horizontaux (PLAN-VERBES-HORIZONTAUX.md)**
   - 2 nouveaux verbes : complète, conduit à
   - `VERBES_HORIZONTAUX` table séparée avec normalisation de types
   - `resoudreVerbe()` retourne `type: 'vertical'` ou `type: 'horizontal'`
   - Popup de choix pour liens horizontaux, attribution automatique pour verticaux
   - `afficherMenuLienExistant()` filtre les verbes pertinents par couple

4. **Évaluations**
   - Nouveau type avec couleur #D946EF (rose/magenta)
   - Insertion dans les conteneurs Leçon (`peutContenir()`)
   - Champs Rétroaction et Production dans le panneau d'information

5. **UX carte mentale**
   - Carte d'aide flottante : draggable, redimensionnable, fermable
   - Bouton « ? » dans la palette (toggle afficher/masquer)
   - Espacement conteneurs augmenté (GAP 12→30px)
   - Menu sélection verbes sur liens existants

6. **Renommage**
   - Onglet « Carte mentale » → « Alignement pédagogique » (config.js)

### Fichiers modifiés
- `js/planification-carte.js` — logique clonage, verbes, évaluations
- `js/config.js` — label sous-nav
- `index.html` — palette, panneau, carte d'aide, changelog, BUILD_ID
- `styles.css` — clone, carte d'aide, évaluation

---

## HISTORIQUE PRÉCÉDENT — BETA 97.3

---

## POUR REPRENDRE

> **Lire ce fichier puis demander : "Ou en sommes-nous ?"**
> La refactorisation est découpée en phases. Chaque phase est documentée ci-dessous.

---

## REFACTORISATION PROGRESSIVE (Beta 97.1)

**Ticket principal** : #76 (595 `.style.display` dans 31 fichiers JS → `classList` + `u-hide`)
**Tickets connexes** : #74 (classes CSS utilitaires pour inline styles)

### Phase 1 — COMPLETEE (6 fév 2026, session 1)

**Objectif** : Poser les fondations + migrer un premier lot de fichiers moyens

**Infrastructure créée** :
1. `window.toggleDisplay(element, show)` — helper global dans `js/main.js`
   - `toggleDisplay(el, true)` → `el.classList.remove('u-hide')`
   - `toggleDisplay(el, false)` → `el.classList.add('u-hide')`
   - Gère `null` silencieusement
2. `.u-hide` renforcé avec `!important` dans `styles.css:340` (garantit priorité sur inline styles)
3. Nouvelles classes CSS utilitaires dans `styles.css` (~ligne 2457) :
   - `.info-box` + `--attention`, `--info`, `--succes`, `--erreur` (remplace inline `background: #fff3cd; border-left: 4px solid...`)
   - `.badge-source` + `--locale`, `--bibliotheque`, `--retiree`, `--id` (remplace inline badges colorés)

**Fichiers JS migrés (Phase 1)** :
- `js/cc-license.js` (30 changements)
- `js/echelles.js` (64 changements)
- `js/entites-ui.js` (46 changements)
- `js/etudiants.js` (24 changements)
- `js/export-pdf.js` (46 changements)
- `js/groupe.js` (18 changements)
- `js/pratique-notation-v2.js` (42 changements)
- `js/pratiques-materiel.js` (56 changements)
- `js/profil-etudiant.js` (22 changements)
- `js/saisie-presences.js` (22 changements)
- `js/donnees-v2.js` (16 changements)

**Nettoyage** :
- Suppression `Archives/Design system - Modules/` (37 fichiers, ~16 000 lignes)
- Suppression `docs/A2024/` (scripts d'import historique)
- Suppression retours testeurs anciens (`bruno/`, `gregoire/`, `jordan/`, `olivier/`)
- Déplacement `DESIGN_SYSTEM.html` et `Design system - Modules/` à la racine

**Non commité** : Tous ces changements sont dans le working tree, pas encore commités.

### Phase 2 — COMPLETEE (6 fév 2026, session 2)

**Objectif** : Migrer TOUS les fichiers JS restants (434 occurrences dans 23 fichiers)

**Résultat** : 434 → 11 (423 occurrences migrées, 11 exceptions légitimes)

| Fichier | Avant | Migrés | Restants | Raison |
|---------|-------|--------|----------|--------|
| `pratiques.js` | 97 | 95 | 2 | `= ''` (nettoyage accordéons) |
| `trimestre-v2.js` | 88 | 83 | 5 | `= ''` (nettoyage inline styles) |
| `evaluation.js` | 51 | 51 | 0 | — |
| `cartouches.js` | 51 | 49 | 2 | Code commenté |
| `productions.js` | 41 | 40 | 1 | `= ''` (reset display) |
| `grilles.js` | 39 | 39 | 0 | — |
| `horaire.js` | 6 | 6 | 0 | — |
| `import-export.js` | 6 | 6 | 0 | — |
| `tableau-bord-apercu.js` | 6 | 6 | 0 | — |
| `travaux-ui.js` | 6 | 6 | 0 | — |
| `travaux-annotation.js` | 6 | 6 | 0 | — |
| `wizard-pratique-v2.js` | 5 | 5 | 0 | — |
| `modes.js` | 5 | 5 | 0 | — |
| `liste-evaluations.js` | 5 | 5 | 0 | — |
| `trimestres.js` | 4 | 4 | 0 | — |
| `trimestre.js` | 4 | 4 | 0 | — |
| `cours.js` | 4 | 4 | 0 | — |
| `rapport-bug.js` | 2 | 2 | 0 | — |
| `primo-modal.js` | 2 | 2 | 0 | — |
| `primo-tooltips.js` | 2 | 2 | 0 | — |
| `objectifs.js` | 2 | 2 | 0 | — |
| `modal-doublon.js` | 1 | 1 | 0 | — |
| `main.js` | 1 | 0 | 1 | Helper toggleDisplay lui-même |

**Fichiers JS migrés (Phase 2)** : 22 fichiers
**Exceptions restantes** : 8 `= ''` (nettoyage), 2 commentés, 1 helper = **aucune utilisation active de `.style.display` pour show/hide**

**Changements HTML associés** :
- `#modalExport` et `#modalImport` (index.html) : `style="display:none"` → `class="u-hide"` + `style="display:flex"`
- `#modalWizardPratiqueV2` (index.html) : Supprimé `style="display:none"` redondant (CSS `.modal-overlay` le gère)

**Patterns de migration utilisés** :
- `.modal-overlay` → `.actif` (pattern CSS existant)
- Éléments génériques → `u-hide` (classe utilitaire avec `!important`)
- Ternaires → `toggleDisplay(element, condition)` (helper global)
- Vérifications → `element.classList.contains('u-hide')`
- Reset inline → `style.display = ''` gardé tel quel

**Règles de migration** :
- `.style.display = 'none'` → `element.classList.add('u-hide')`
- `.style.display = 'block'|'flex'|'inline-block'` → `element.classList.remove('u-hide')`
- `.style.display = condition ? 'X' : 'none'` → `toggleDisplay(element, condition)`
- `.style.display !== 'none'` (test) → `!element.classList.contains('u-hide')`
- `.style.display = ''` → GARDER (nettoyage legacy, pas du show/hide)

### Phase 3 — COMPLETEE (6 fév 2026, session 3)

**Objectif** : Nettoyer et moderniser le Design System pour en faire la reference efficace

**Commits** : `fdf8558` (Phase 2), `1821dfc` (Phase 3)

**Diagnostic initial** (score 2.5/5) :
- 478 lignes de CSS chrome dupliquees dans 17 fichiers HTML
- 20 fichiers parasites (audits, previews, archives) sur 38 au total
- Redefinitions CSS dans `02c-badges-tetris.html` et `03d-modals.html` qui masquent `styles.css`
- Patterns Beta 97.1 absents du Design System (.u-hide, .info-box, .badge-source, toggleDisplay, .modal-overlay.actif)

**4 etapes executees** :

**Etape 1 — Nettoyage du repertoire** :
- Cree `Design system - Modules/_archives/`
- Deplace 17 fichiers parasites :
  - 8 audits (AUDIT_*.md, AUDIT_*.html)
  - 3 previews Liquid Glass
  - 1 doublon (4b - En-tete v3)
  - 1 comparatif, 1 archive monolithique (204KB)
  - 2 docs obsoletes, 2 fichiers caches temporaires
- Resultat : 20 fichiers actifs (17 modules + index + guide-common.css + README)

**Etape 2 — Extraction CSS chrome partage** :
- Cree `Design system - Modules/guide-common.css` (~230 lignes) contenant :
  - Reset body
  - `.guide-header`, `.guide-header h1/p`, `.guide-header-nav`
  - `.guide-container`, `.guide-section`, `.guide-section-title`, `.guide-section-intro`
  - `.guide-component`, `.guide-component-title`, `.guide-component-description`
  - `.guide-example`, `.guide-example-title`
  - `.guide-code`, `.guide-code-title`
  - `.guide-specs`, `.guide-specs-title`, `.guide-specs ul/li`
  - `.guide-do-dont`, `.guide-do`, `.guide-dont`, `.guide-do-title`, `.guide-dont-title`
  - `.guide-table`, `.guide-table th/td`, `.guide-table tr:nth-child(even)`
- 18 fichiers HTML modifies : `<link rel="stylesheet" href="guide-common.css">` ajoute, CSS chrome inline supprime
- 12 modules n'ont plus de `<style>` du tout (100% guide chrome)
- 6 fichiers gardent un `<style>` avec CSS specifique au module :
  - `01a` (palette couleurs), `02c` (badges tetris), `03d` (modals demo)
  - `04b` (box-shadow demo), `design-system-index` (cartes nav), `06d` (utilitaires demo)

**Etape 3 — Suppression des redefinitions CSS** :
- `03d-modals.html` : Supprime les 75 lignes de `.btn*` redefinitions (tous dans `styles.css` lignes 2574-2698)
  - Garde les styles `.modal-entete/corps/pied` (pas dans styles.css) et `.modal-overlay` (demo statique)
- `02c-badges-tetris.html` : Ajoute commentaire d'avertissement (noms partiellement differents de styles.css : `.badge-rai1` vs `.badge-rai-1`)

**Etape 4 — Nouveau module 06d : Utilitaires Beta 97.1** :
- Cree `Design system - Modules/06d-utilitaires-beta97.html` documentant :
  1. `.u-hide` — Classe utilitaire show/hide (styles.css:343)
  2. `toggleDisplay(element, show)` — Helper JS global null-safe (main.js:37)
  3. `.modal-overlay.actif` — Pattern modal show/hide (styles.css:2774-2789)
  4. `.info-box` + `--attention`, `--info`, `--succes`, `--erreur` (styles.css:2462-2484)
  5. `.badge-source` + `--locale`, `--bibliotheque`, `--retiree`, `--id` (styles.css:2487-2504)
- Chaque section : exemples Do/Don't, code CSS/JS, demos interactives, tableau recapitulatif
- Mise a jour `design-system-index.html` (carte 06d avec badge NOUVEAU)
- Mise a jour `README.md` (architecture CSS, module 06d, instructions maintenance)

**Architecture resultante du Design System** :
```
Design system - Modules/
├── guide-common.css           ← CSS chrome partage (NOUVEAU)
├── design-system-index.html   ← Index avec cartes cliquables
├── README.md                  ← Documentation structure
├── 01a-palette-couleurs.html  ← Module 1a
├── 01b-typographie.html       ← Module 1b
├── 02a-boutons.html           ← Module 2a
├── 02b-formulaires.html       ← Module 2b
├── 02c-badges-tetris.html     ← Module 2c
├── 03a-tableaux.html          ← Module 3a
├── 03b-cartes-sidebars.html   ← Module 3b
├── 03c-barres-gradient.html   ← Module 3c
├── 03d-modals.html            ← Module 3d
├── 04a-navigation.html        ← Module 4a
├── 04b-box-shadow.html        ← Module 4b
├── 05-patterns-pedagogiques.html ← Module 5
├── 06a-emojis-CRITIQUE.html   ← Module 6a
├── 06b-toggles.html           ← Module 6b
├── 06c-alertes.html           ← Module 6c
├── 06d-utilitaires-beta97.html ← Module 6d (NOUVEAU)
├── 07-primo-assistant.html    ← Module 7
└── _archives/                 ← 17 fichiers historiques
```

**Pour ajouter un nouveau module** :
1. Creer le fichier HTML avec `<link rel="stylesheet" href="../styles.css">` et `<link rel="stylesheet" href="guide-common.css">`
2. Utiliser les classes `.guide-*` de `guide-common.css` pour la structure
3. CSS specifique dans un `<style>` local si necessaire
4. Ajouter lien retour vers `design-system-index.html`
5. Ajouter carte dans `design-system-index.html`
6. Mettre a jour `README.md`

---

## ETAT ACTUEL

### Ce qui fonctionne
- Section Trimestre operationnelle (tous les accordeons)
- Creation et selection de groupe-cours
- Dropdown groupe-cours dans l'en-tete
- **Dropdown "Cours (tous groupes)"** : Voir tous les groupes fusionnes
- Design harmonise (Design System v7)
- Message de bienvenue et notes de version a jour
- Variables CSS adoptees massivement (box-shadow 43%, border-radius 95%)
- **Badge nb personnes** : S'ajuste au groupe-cours selectionne
- **Vue calendaire** : Affiche correctement l'horaire du groupe-cours actif
- **Pratiques de notation** : Sauvegarde fiable via wizard et mode expert
- **Dropdown note maximale** : Peuplé dynamiquement selon l'échelle de performance
- **Graphique spaghetti** : Visualisation de l'évolution de tous les étudiants (nouveau Beta 96)
- **Modal Confidentiel** : Informations sensibles sur l'étudiant (ÉPGC, services adaptés, etc.)
- **Anonymisation groupes** : Numéros de groupe remplacés par lettres en mode anonymisation

### Derniere tache completee (6 février - Beta 97.1)

- **35 correctifs de l'audit du 5 février** (#64-#65, #85-#108) — tous corrigés
- **Refactorisation Phase 1** (Beta 97.1) — `.style.display` fondations + 11 fichiers JS migres
- **Refactorisation Phase 2** (Beta 97.1) — 434 → 11 occurrences dans 22 fichiers JS (`fdf8558`)
- **Design System Phase 3** (Beta 97.1) — Nettoyage, deduplication CSS, module 06d (`1821dfc`)

### Tache precedente (6 février - Beta 96.3)

- **MODULE TRAVAUX - Import, Annotation et Archivage**
  - **Objectif** : Gestion complete des travaux etudiants directement dans Monitorage
  - **5 phases implementees** :
    1. **Import + Visualisation** : Import drag-drop de PDF/images, detection auto du DA etudiant, miniatures, PDF.js pour rendu PDF
    2. **Moteur d'annotation** : Canvas overlay, Apple Pencil (Pointer Events, rejet paume, pression), outils (stylo, surligneur, gomme, texte, formes, symboles), undo/redo (50 niveaux), sauvegarde auto (debounce 2s)
    3. **Integration evaluation** : Bouton "Voir le travail" dans evaluations, vue cote-a-cote (travail + grille), section "Travaux soumis" dans profil etudiant
    4. **Archivage** : Export ZIP par etudiant/production/semestre via JSZip, aplatissement annotations sur images
    5. **Optimisation** : File System Access API (Mac Chrome/Edge) pour stockage sur disque, scroll virtuel (500+ miniatures), pre-rendu pages adjacentes, moniteur quota avec nettoyage
  - **Nouveaux fichiers** (7 modules JS + 3 libs) :
    - `js/travaux-stockage.js` - Abstraction stockage (IndexedDB + FSAPI)
    - `js/travaux-import.js` - Import fichiers, drag-drop, jumelage auto DA
    - `js/travaux-visionneuse.js` - Rendu PDF.js + images, zoom/pan, cache pages
    - `js/travaux-annotation.js` - Moteur annotation canvas, Apple Pencil
    - `js/travaux-outils.js` - Definitions outils, palette, pression
    - `js/travaux-archivage.js` - Generation ZIP/PDF, export portfolio
    - `js/travaux-ui.js` - Coordinateur UI, scroll virtuel, vue cote-a-cote
    - `libs/pdf.min.js` + `libs/pdf.worker.min.js` (PDF.js v4.2.67)
    - `libs/jszip.min.js` (JSZip v3.10.1)
  - **Fichiers modifies** : `index.html`, `styles.css`, `js/config.js`, `js/navigation.js`, `js/trimestres.js`, `js/evaluation.js`, `js/profil-etudiant.js`
  - **Navigation** : Nouvel onglet "Travaux" avec 3 sous-sections (Import, Visionneuse, Archivage)
  - **Donnees** : 3 nouvelles cles namespacees (`fichiersTravaux`, `annotationsTravaux`, `archivesBundles`)
  - **Stockage** : IndexedDB blobs (iPad) ou fichiers sur disque via FSAPI (Mac), annotations JSON legeres

### Tache precedente (4 février - Beta 96.2)

- **REFONTE GESTION DES RESSOURCES (Réglages > Données > Maintenance)**
  - **Objectif** : Outil développeur pour auditer et nettoyer les ressources pédagogiques accumulées
  - **Avant** : 5 accordéons imbriqués avec problèmes de scroll et de chargement
  - **Après** : Dropdown unique avec compteurs, tableau unifié, interface simplifiée
  - **Types de ressources gérés** :
    - Pratiques de notation (source: `pratiquesConfigurables`)
    - Grilles de critères
    - Cartouches de rétroaction
    - Échelles de performance
    - Productions
  - **Informations affichées** :
    - Nom et auteur/description
    - Type (pour pratiques: SOM/STD/SPE/DEN badges)
    - Statut: Sidebar (visible) ou Masquée
    - Usage: cours, évaluations, productions liées
    - Actions: Voir, Supprimer définitivement
  - **Fichiers modifiés** :
    - `index.html` : Section Maintenance avec dropdown et conteneur unique
    - `js/donnees-v2.js` : Fonctions V2 pour affichage dynamique
    - `styles.css` : Nettoyage CSS accordéons obsolètes

### Tache precedente (1er février - Beta 96.2)

- **CORRECTION ERREUR SUPPRESSION GRILLES (Bugs Gregoire #5, #6, #7)**
  - **Symptôme** : Impossible de supprimer certaines grilles de la barre latérale (bouton inactif)
  - **Erreur console** : `null is not an object (evaluating 'document.getElementById('optionsImportExportGrilles').style')`
  - **Cause** : L'élément `#optionsImportExportGrilles` a été supprimé en Beta 92, mais le code continuait à y accéder
  - **Fonctions affectées** :
    - `supprimerGrilleDepuisSidebar()` (ligne 3614)
    - `annulerFormGrille()` (ligne 3625)
  - **Correction** : Suppression des deux lignes qui référençaient l'élément supprimé
  - **Fichier modifié** : `js/grilles.js`

- **CORRECTION IMPORT PRODUCTIONS NON DÉTECTÉES (Bug Gregoire #3)**
  - **Symptôme** : "Aucune production n'a été importée" après import de sauvegarde
  - **Cause** : Les fonctions d'analyse et d'import ne cherchaient que dans les clés globales (`productions`, `bibliothequeProductions`), pas les clés namespacées (`h2026_productions`, etc.)
  - **Fonctions corrigées** :
    - `analyserRessourcesDetaillees()` : Recherche maintenant dans `*_productions`
    - `executerImportSelectif()` : Importe depuis toutes les clés productions
    - `executerImportVersBibliotheques()` : Même correction
    - `exporterConfigurationComplete()` : Exporte depuis la clé namespacée
  - **Fichier modifié** : `js/import-export.js`

- **CORRECTION HORAIRES NON TROUVÉS (Bugs Gregoire #1, #2)**
  - **Symptôme** : Aperçu présences vide, compte de semaines incorrect (horaireActif: non défini)
  - **Cause** : La clé `horaires` est dans `CLES_NAMESPACEES` mais était lue sans namespacing dans 4 fichiers
  - **Fichiers corrigés** :
    - `js/horaire.js:92` - `obtenirSeancesHoraire()`
    - `js/entites-ui.js:74`
    - `js/trimestre-v2.js:1957`
    - `js/migrations.js:1036`
  - **Correction** : Utilisation de `cle('horaires')` pour obtenir la clé namespacée

- **CORRECTION COURS A25 NON SAUVEGARDÉ (Bugs Gregoire #9, #10)**
  - **Symptôme** : Cours créé pour A2025 était sauvegardé comme H2026 malgré permission d'écriture
  - **Cause** : `reinitialiserFormCoursV2()` forçait session='H' et ne définissait pas l'année
  - **Impact** : À la sauvegarde, année=2026 (défaut), donc trimestreId='h2026' au lieu de 'a2025'
  - **Correction** : Extraction session/année depuis le trimestre actif (`obtenirTrimestreActif()`)
  - **Fichier modifié** : `js/trimestre-v2.js`

- **CORRECTION SECTION TRIMESTRE TRONQUÉE SUR iPad (Bug Gregoire #8)**
  - **Symptôme** : Contenu coupé à droite (dates, boutons) sur iPad Safari
  - **Cause** : Layouts CSS sans media queries pour tablettes (grilles 2 colonnes fixes)
  - **Correction** : Ajout de media queries responsive pour :
    - `.layout-sidebar-2col` : Sidebar réduite à 220px puis empilée sous 850px
    - `.grille-2col` / `.grille-2col-gap15` : Empilées verticalement sur tablette
    - `#reglages-trimestre` : Styles spécifiques pour dates et blocs compacts
  - **Fichier modifié** : `styles.css`

- **CORRECTION ERREUR `reglages-horaire` INTROUVABLE (Tous les rapports)**
  - **Symptôme** : Erreur console `❌ Sous-section introuvable: reglages-horaire` au démarrage
  - **Cause** : La sous-section a été renommée en `reglages-horaire-legacy` et masquée en Beta 95, mais des références pointaient encore vers l'ancien ID
  - **Fichiers corrigés** :
    - `js/guidage.js` : Étape "horaire" → pointe maintenant vers `reglages-trimestre`
    - `js/saisie-presences.js` : Lien "Configurer l'horaire" → `reglages-trimestre`
    - `index.html` : Lien dans l'aide → `reglages-trimestre`
    - `js/primo-validation-champs.js` : Configuration `reglages-horaire` supprimée (obsolète)

- **FEATURE REQUEST : SUPPRIMER PRATIQUES HORS-BIBLIOTHÈQUE (FR Gregoire #4)**
  - **Demande** : Pouvoir supprimer des pratiques qui sont dans "Disponibles à ajouter" mais pas dans "Ma sélection"
  - **Problème** : Avant, ces pratiques ne pouvaient qu'être ajoutées, pas supprimées
  - **Solution** : Ajout d'un bouton "Supprimer" dans la section "Disponibles à ajouter" du modal Bibliothèque
  - **Nouvelle fonction** : `supprimerPratiqueHorsBibliotheque(pratiqueId)`
  - **Fichier modifié** : `js/pratiques.js`

- **#56 - NOMMAGE EXPORTS AVEC HORODATAGE COMPLET**
  - **Demande** : Inclure l'heure dans le nom des fichiers exportés pour éviter confusion
  - **Avant** : `sauvegarde-monitorage-2026-02-01.json`
  - **Après** : `sauvegarde-monitorage-2026-02-01-08-08-30.json`
  - **Fichier modifié** : `js/import-export.js` (ligne 252)

- **NETTOYAGE ÉMOJIS DANS LES NOUVEAUTÉS**
  - Retrait de tous les émojis du modal Nouveautés pour un affichage plus sobre
  - Fichier modifié : `index.html`

- **#51 - HORAIRE HEURES NON PILES**
  - **Demande** : Permettre des heures de début non piles (ex: 8h55 au lieu de 8h00)
  - **Solution** : Remplacement du dropdown par `<input type="time">` avec step="300" (5 min)
  - **Fichier modifié** : `index.html` (ligne 7355)

- **#49 - IMPORT CSV OMNIVOX (SA + ACCENTS)**
  - **Problème 1** : Accents mal gérés (é → caractères bizarres)
  - **Cause** : Omnivox exporte en Windows-1252, pas UTF-8
  - **Solution** : `reader.readAsText(fichier, 'windows-1252')`
  - **Problème 2** : Colonne SA non reconnue
  - **Cause** : Position variable (colonne 5 ou 6 selon format)
  - **Solution** : Chercher SA dans colonnes 5 ET 6, normaliser valeurs (Oui/SA/X → "Oui")
  - **Fichier modifié** : `js/trimestre-v2.js`

- **#50 - PRIMO CONFIGURATION INCOMPLÈTE (JOUR SEMAINE)**
  - **Symptôme Bruno** : Jour de la semaine du cours pas configuré après Primo
  - **Cause** : `creerHoraireDansBanquePrimo()` cherchait `reponses['horaireHebdomadaire']` (vide)
  - **Solution** : Lire les séances depuis `cle('horaireHebdo')` ou `seancesHoraire_{coursId}` (créées par creerSeancesHoraire)
  - **Fichier modifié** : `js/primo-modal.js`

- **#53 - MENU FORMAT HORAIRE NE SE MET PAS À JOUR**
  - **Symptôme** : Changer le nombre d'heures/semaine ne met pas à jour les options du dropdown Format horaire
  - **Cause** : Options statiques (1×4h, 2×2h, 4×1h) au lieu de dynamiques
  - **Solution** : Nouvelle fonction `mettreAJourOptionsFormatHoraire()` qui génère les diviseurs
  - **Fichiers modifiés** : `index.html` (onchange), `js/trimestre-v2.js` (fonction)

- **MODAL DE BIENVENUE POUR NOUVEAUX UTILISATEURS**
  - **Problème** : Premier lancement sur iPad affiche le modal backup au lieu d'un accueil guidé
  - **Cause** : Primo ne s'affichait qu'en mode Assisté, mais le mode par défaut est Normal
  - **Solution** : Nouveau modal de bienvenue qui s'affiche avant tout autre modal
  - **Choix offerts** :
    - "Configuration guidée" : Passe en mode Assisté et lance Primo
    - "Explorer par moi-même" : Ferme le modal avec conseil vers section Trimestre
  - **Coordination** : Le modal backup ne s'affiche pas si le modal bienvenue est présent
  - **Fichiers créés/modifiés** :
    - `js/modal-bienvenue.js` (nouveau)
    - `styles.css` (styles modal bienvenue)
    - `js/modal-backup-reminder.js` (check bienvenue actif)
    - `index.html` (script + nouveautés)

- **AMÉLIORATION MODAL BIENVENUE - REPÈRES VISUELS**
  - Ajout d'une section expliquant les 3 icônes de l'en-tête :
    - ✉️ Nouveautés — Corrections et nouvelles fonctionnalités
    - 😎 Primo — Guide interactif et navigation générale
    - ⚠️ Rappel backup — Protection des données
  - **Fichiers modifiés** : `js/modal-bienvenue.js`, `styles.css`

- **RENOMMAGE "DÉCOUVRIR L'APPLICATION" → "PREMIERS PAS"**
  - Titre du bouton 😎 et du modal intro mis à jour
  - **Fichier modifié** : `index.html`

- **AMÉLIORATION ANIMATION BULLES EN-TÊTE**
  - **Style 3D** : Gradient blanc→gris + box-shadow multicouche (identique aux points du tableau de bord)
  - **Effet parallaxe** : Grandes bulles rapides (proches), petites lentes (éloignées)
  - **Vitesses** : grande 30-50s, moyenne 55-75s, petite 80-120s
  - **Couleur** : Toutes blanches (uniformité avec tableau de bord)
  - **Référence** : CSS `index.html:1465-1560`, JS `js/main.js:128-240`
  - **Fichiers modifiés** : `index.html`, `js/main.js`, `CLAUDE.md` (référence ajoutée)

### Tache precedente (31 janvier - Beta 96.2)

- **#48 - SYNCHRONISATION MULTI-APPAREILS (MacBook ↔ iPad)**
  - **Symptôme** : Import sur nouvel appareil échouait, données non chargées
  - **Corrections** :
    - Auto-cochage des cases Étudiants/Présences/Notes quand "C'est ma propre sauvegarde" coché
    - Préservation des IDs originaux pour pratiques, grilles, échelles, productions
    - Import des données calendrier (cadreCalendrier, horaireHebdo, etc.)
  - **Résultat** : 68 éléments importés avec succès (22 pratiques, 14 grilles, 8 échelles, 137 étudiants, 2797 présences, 6 groupe-cours, 9 horaires)
  - Fichier modifié : `js/import-export.js`

- **#55 - PRATIQUES CONFIGURABLES NON TROUVÉES DANS LE REGISTRE**
  - **Symptôme** : Erreur `❌ Pratique "pratique-1768910384608" non disponible dans le registre`
  - **Cause 1** : `obtenirPratiqueParId()` ne cherchait pas dans `pratiquesConfigurables`
  - **Cause 2** : Pratiques créées via wizard ont structure différente (ID/échelle à la racine, pas dans `config`)
  - **Solution** : Nouvelle fonction `construireConfigComplete()` qui normalise les deux formats
    - Fusionne champs racine + config interne
    - Charge l'échelle par ID depuis `echellesTemplates` si non embarquée
    - Fallback vers échelle IDME par défaut si référence introuvable
  - Fichier modifié : `js/pratiques/pratique-registre.js`

- **DÉSACTIVATION MODAL MIGRATION LEGACY**
  - **Symptôme** : Modal "Mise à jour de vos données" apparaissait après nettoyage des clés obsolètes
  - **Cause** : Flag `migrationLegacyEffectuee` supprimé par le script de nettoyage
  - **Solution** : `detecterDonneesLegacy()` vérifie maintenant si des données namespacées existent
    - Si `h2026_groupeEtudiants` ou `h2026_groupesCours` présents → migration non nécessaire
    - Marque automatiquement `migrationLegacyEffectuee=true`
  - Fichier modifié : `js/migrations.js`

- **SCRIPT DE NETTOYAGE DES CLÉS OBSOLÈTES**
  - Nouveau script `scripts/nettoyage-cles.js` pour usage en console navigateur
  - 3 étapes : `etape1_identifier()` → `etape2_backup()` → `etape3_supprimer()`
  - Catégories nettoyées : test/simulation, séances test, globales obsolètes, flags migration, snapshots anciens
  - 48 clés supprimées (189 → 141 clés)

### Tache precedente (30 janvier - Beta 96.2)
- **CORRECTION CRITIQUE - EXPORT SAUVEGARDE COMPLÈTE (IndexedDB)**
  - Bug critique : La "Sauvegarde complète" exportait SEULEMENT les données de localStorage
  - Les données volumineuses (groupes-cours, horaires, etc.) stockées uniquement dans IndexedDB étaient PERDUES
  - **Correction** :
    - `ouvrirModalExport()` : Utilise maintenant `db.keys()` pour lister TOUTES les clés
    - `executerExport()` : Convertie en async, utilise `await db.get(cle)` au lieu de `localStorage.getItem()`
    - Exports window ajoutés pour les fonctions d'export
  - Fichier modifié : `js/import-export.js`

- **CORRECTION - UTF-16 Safari (envoyerRapportParCourriel)**
  - Erreur répétée sur iPad : `URIError: String contained an illegal UTF-16 sequence`
  - **Cause** : Caractères Unicode invalides dans les rapports de bug
  - **Correction** : Fonction `nettoyerUTF16()` compatible Safari (sans lookbehind regex)
  - Fichier modifié : `js/rapport-bug.js`

- **AMÉLIORATION - Archivage local des rapports de bug**
  - Les rapports sont maintenant sauvegardés localement (max 50)
  - Fichier modifié : `js/rapport-bug.js`

### Tache precedente (30 janvier - Beta 96.1)
- **CORRECTION - IMPORT SAUVEGARDE COMPLÈTE (clés manquantes)**
  - Bug signalé par testeur (iPad/Safari) : Import réussi mais données non chargées
  - **Cause** : Les clés `*_groupesCours`, `*_horaires`, `enseignants` n'étaient pas gérées par l'import sélectif
  - **Correction** : Ajout du support des entités structurelles Beta 95+ dans `import-export.js`
    - Analyse des clés `*_groupesCours`, `*_horaires`, `enseignants`
    - Affichage dans le modal avec section "Structure du trimestre"
    - Importation effective de ces données
  - Fichier modifié : `js/import-export.js`

- **CORRECTION - ERREUR CONSOLE ouvrirModalPreparationPDF**
  - Erreur systématique au chargement : `Can't find variable: ouvrirModalPreparationPDF`
  - **Cause** : Fonction renommée `ouvrirModalExportPDF` mais window.export pas mis à jour
  - **Correction** : Mise à jour des exports window dans `js/export-pdf.js`

- **BOÎTE À OUTILS - QUESTIONS FLASH**
  - Deuxième outil dans la section Boîte à outils
  - Tirage aléatoire de questions pour pratiques de récupération en classe
  - **Questions liées au cours** : Chaque cours a ses propres questions (stockage par coursId)
  - **Organisation par catégories** : Créer, modifier, supprimer des catégories thématiques
  - **Gestion CRUD** : Ajouter, modifier, supprimer des questions depuis le modal
  - **Changement de catégorie** : Dropdown pour déplacer une question vers une autre catégorie
  - **Filtre par catégorie** : Dropdown dans la carte pour filtrer les questions à tirer
  - **Animation roulette** : Même effet de suspense que le tirage d'étudiants
  - **Mode avec/sans remise** : Option pour répéter ou non les questions
  - **Mise en page** : Deux cartes côte à côte (Questions Flash | Tirage au sort)
  - Fichiers modifiés : `js/boite-outils.js`, `js/navigation.js`, `js/trimestre-v2.js`, `index.html`, `styles.css`

- **NAVIGATION - ICÔNE RÉGLAGES**
  - Le texte "Réglages" remplacé par l'icône d'engrenage dans la barre de navigation
  - Tooltip "Réglages" au survol pour l'accessibilité

- **BOÎTE À OUTILS - TIRAGE AU SORT** (précédent)
  - Nouvelle section "Boîte à outils" dans la navigation principale
  - Premier outil : Tirage au sort d'étudiants pour pratiques de récupération en classe
  - **Animation roulette** : Effet de suspense avec défilement ralentissant
  - **Modal paramètres** : Nombre à tirer, mode avec/sans remise, exclusions manuelles
  - **Persistance** : État conservé lors du changement d'onglet (localStorage)
  - **Rafraîchissement auto** : Liste mise à jour lors du changement de groupe-cours
  - Design System v7 respecté (modal, boutons, couleurs)
  - Fichiers créés : `js/boite-outils.js`
  - Fichiers modifiés : `js/config.js`, `js/navigation.js`, `js/trimestre-v2.js`, `js/contexte.js`, `index.html`, `styles.css`

### Tache precedente (28 janvier - Beta 96.1)
- **ANIMATION 3D DES POINTS (Tableau de bord)**
  - Les points blancs dans les barres graduées oscillent avec un effet de rotation 3D
  - Tous les points partent du centre de la barre (ligne horizontale)
  - Chaque point a une amplitude aléatoire (5-22px) et un délai aléatoire (0-3s)
  - Durée inversement proportionnelle à l'amplitude (grandes amplitudes = plus rapide)
  - Effet de profondeur via z-index (premier plan en montant, arrière-plan en descendant)
  - **Option désactivable** : Préférences > Expérience visuelle > Animation des points
  - Fichiers modifiés : `styles.css`, `js/tableau-bord-apercu.js`, `js/preferences-v2.js`, `index.html`

- **MODAL CONFIDENTIEL (Profil étudiant)**
  - Nouveau bouton 🔒 Confidentiel dans la section Accompagnement
  - Formulaire pour saisir : ÉPGC, cours antérieur, services adaptés, défis particuliers, notes
  - Services adaptés avec dropdowns conditionnels (catégorie → sous-catégorie)
  - Interface réorganisée en 2 colonnes pour optimiser l'espace
  - Indicateur vert si l'étudiant a des infos confidentielles
  - Fichiers modifiés : `index.html`, `js/profil-etudiant.js`

- **AMÉLIORATIONS TABLEAU DE BORD**
  - **Corrélations significatives** : Messages A↔P et C↔P affichés uniquement si r ≥ 0.5
  - **Barres uniformisées** : Patterns et RàI alignées sur hauteur ACPE (55px)
  - **Graphique Trajectoire** : Courbe sélectionnée au premier plan (order: 0)
  - Fichiers modifiés : `js/tableau-bord-apercu.js`, `js/graphiques-progression.js`, `styles.css`

- **ANONYMISATION DES GROUPES**
  - Nouvelle fonction `anonymiserGroupe()` : 00001 → Gr. A, 00002 → Gr. B
  - Appliquée dans l'en-tête du tableau de bord et les tableaux d'étudiants
  - Mapping persisté dans localStorage (réinitialisé avec mapping anonymisation)
  - Fichiers modifiés : `js/modes.js`, `js/tableau-bord-apercu.js`

- **CORRECTIONS MINEURES**
  - "Correction" → "Permission d'écriture" dans bandeau trimestre archivé
  - "heures" → "périodes" dans section Engagement du profil étudiant

### Tache precedente (28 janvier - Beta 96.1)
- **REFONTE EXPORT PDF - FORMULAIRE INLINE ET APERÇU AMÉLIORÉ**
  - **Formulaire inline** : Le bouton "Préparer le PDF" affiche le formulaire dans la zone principale (pas de navigation)
    - Production, Grille, Échelle, Cartouche sur 2 lignes compactes
    - Bouton "Annuler" restaure le contenu précédent
    - Bouton "Voir l'aperçu →" ouvre le modal d'aperçu
  - **Modal d'aperçu optimisé** : Options compactes sur une seule ligne
    - **Orientation** : Portrait/Paysage
    - **Entête** : Code cours ✓ / Nom cours ✓ / Trimestre ✓ (nouvelles options)
    - **Pied de page** : Enseignant ✓ / Licence CC ✓
    - **Production** (conditionnel) : Nom ✓ / Objectif ✓ / Tâche ✓ / Desc. critères ☐
  - **Aperçu dynamique** : Toutes les options mettent à jour l'aperçu en temps réel
  - **Pied de page visible** : CSS modifié pour afficher le footer même si le contenu dépasse
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`

- **CORRECTIONS VISUELLES ET UX** (#40-#46)
  - **Boutons d'aide dans bibliothèques** (#40) : Bouton 😎 ajouté aux 5 bibliothèques
    - Contenu d'aide expliquant les badges (Locale/Bibliothèque/Retirée) et les boutons
  - **Uniformisation sidebars** (#41) : Style uniforme pour boutons "Consulter la bibliothèque"
    - Classe `.sidebar-vide` pour messages vides
  - **Uniformisation bibliothèques** (#42) : Badges, ID courts, détection doublons
  - **Z-index modal d'aide** : 10002 (au-dessus des bibliothèques à 10000)
  - **Doublon bouton cartouches** : Supprimé le bouton HTML dupliqué
  - **Bouton "Préparer le PDF" productions** : Ajouté pour cohérence avec grilles/échelles/cartouches
  - **Footer PDF corrigé** : Espacement correct, nom enseignant affiché
  - **Effet 3D bulles tableaux** : Classe `.bulle-niveau-tableau` (même effet que barres graduées)
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`, `js/profil-etudiant.js`, `js/aide-contextuelle-contenu.js`, et 5 fichiers bibliothèques

- **GESTION BIBLIOTHÈQUES COMPLÈTE** : Boutons Supprimer et Dupliquer (session précédente)
  - **Bouton Supprimer** : Suppression définitive avec confirmation modale
    - Vérification des dépendances (ex: impossible de supprimer une grille avec cartouches liées)
    - Bouton "Retirer" changé de rouge (btn-supprimer) à gris (btn-secondaire)
    - Implémenté dans 5 bibliothèques : Grilles, Cartouches, Échelles, Pratiques, Productions
  - **Bouton Dupliquer** : Crée une copie avec nouvel ID et suffixe "(copie)"
    - Métadonnées CC nettoyées sur la copie
    - Bouton vert (btn-confirmer)
    - Implémenté dans les 5 bibliothèques
  - **Détection doublons (Productions)** : Avertissement si titres en double
    - Badges de source : Locale (vert), Bibliothèque (bleu), Retirée (orange)
    - ID court affiché (#abc123) pour distinguer les doublons
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

- **ISOLATION DES TEMPLATES ARCHIVÉS** : Protection des trimestres archivés
  - **Problème résolu** : Supprimer une grille en H2026 affectait les trimestres archivés (A2025)
  - **Solution** : Copie des templates UTILISÉS lors de l'archivage
    - Nouvelle constante `CLES_TEMPLATES_ARCHIVES` dans trimestres.js
    - Nouvelle fonction `identifierTemplatesUtilises()` pour identifier les templates référencés
    - Modification de `creerSnapshotRessources()` pour copier vers des clés namespacées
    - Modification de `cle()` pour utiliser les copies archivées en lecture
  - **Templates copiés** : grillesTemplates, echellesTemplates, pratiquesConfigurables, cartouches_{grilleId}
  - **Fichier modifié** : `js/trimestres.js`

### Tache precedente (26 janvier - Beta 96)
- **FIX APERÇU DES PRÉSENCES** : Alignement calculs sur tableau de bord
  - **Problème** : Élèves=53 (au lieu de 25), Taux=90% (au lieu de 98%), Séances=1/2 (au lieu de 1/30)
  - **Causes multiples** :
    1. Étudiants non filtrés par groupe-cours actif → utilisait tous les étudiants du trimestre
    2. Taux faisait la moyenne SOM/PAN → si sommatif=98% et alternatif=82%, moyenne=90%
    3. Indices lus comme valeurs directes → mais format réel est `{indice: 0.98, nombreSeances: 1}`
    4. Séances comptées jusqu'à aujourd'hui → au lieu du total trimestre
    5. `seancesHoraire` lu sans namespace → clé globale au lieu de trimestre actif
  - **Corrections** :
    - Utilisation de `obtenirEtudiantsCoursActif()` pour filtrer par groupe
    - Taux utilise **sommatif uniquement** (pas de moyenne avec alternatif)
    - Extraction `.indice` des objets indices
    - Division par `nbAvecDonnees` (pas nbTotal) pour éviter dilution
    - Comptage de TOUTES les séances du trimestre
    - Utilisation de `obtenirSeancesHoraire()` pour le bon namespace
  - **Résultat** : Élèves=25, Taux=98%, Séances=1/30
  - **Fichiers modifiés** : `js/presences-apercu.js`

### Tache precedente (25 janvier - Beta 96)
- **FIX #30 : EXPORT PDF - INFOS COURS/ENSEIGNANT** : Le PDF affiche maintenant les infos complètes
  - **Problème** : Infos cours et enseignant non affichées dans le PDF (seulement trimestre visible)
  - **Cause** : `window.trimestreActif` était vide, et pas de fallback sur `profilEnseignant`
  - **Solution** : Fonctions `obtenirInfosCoursPDF()` et `obtenirNomEnseignantPDF()` améliorées
    - Utilisation de `obtenirTrimestreActif()` au lieu de juste `window.trimestreActif`
    - Fallbacks multiples : `coursActif`, `infoCours`, cours unique dans `listeCours`
    - Fallback final sur `profilEnseignant` même si groupe-cours non trouvé
  - **Résultat** : En-tête affiche "601-101-MQ / Écriture et littérature / Hiver 2026"
  - **Résultat** : Pied de page affiche "Grégoire Bédard" et "CC BY-NC-SA 4.0"
  - **Fichier modifié** : `js/export-pdf.js`

- **FIX #37 : COHÉRENCE INDICE P = NOTE FINALE** : L'indice P reflète maintenant la vraie note
  - **Problème** : P=50% dans tableau de bord mais Note finale=59% dans profil
  - **Cause** : `calculerPerformance()` utilisait TOUTES les évaluations, pas la méthode de sélection
  - **Solution** : `calculerEtStockerIndicesCP()` utilise maintenant `calculerDetailsNoteFinale()`
  - L'indice P respecte : méthode de sélection, pondérations, règles de conformité
  - **Fichiers modifiés** : `js/portfolio.js`, `js/profil-etudiant.js`

- **UNIFORMISATION VISUELLE DES POINTS** : Tous les graphiques ont le même style
  - **Points blancs par défaut** : Fond `rgba(255, 255, 255, 0.9)` + contour bleu pâle `rgba(33, 150, 243, 0.5)`
  - **Points noirs au survol/sélection** : Fond `rgba(0, 0, 0, 0.85)` + contour blanc
  - **Taille uniformisée** : 10px pour les barres ACEP (CSS), pointRadius: 5 pour Chart.js
  - **Barres ACEP** : `.barre-etudiant` CSS modifié pour style uniforme
  - **Graphiques Chart.js** : Tous les `pointBackgroundColor` et `pointBorderColor` uniformisés
  - **Fichiers modifiés** : `styles.css`, `js/graphiques-progression.js`

- **CORRECTION CLIC SUR NOMS ÉTUDIANTS** : Le verrouillage fonctionne maintenant partout
  - **Problème** : Cliquer sur le nom d'un étudiant/indice ne déclenchait pas le verrouillage
  - **Cause** : Coordonnées du clic en espace CSS vs zones cliquables en espace canvas
  - **Fix** : Application du ratio de scale (`canvas.width / rect.width`) dans les gestionnaires de clic
  - **Graphiques corrigés** : Évolution temporelle, Progression temporelle, Développement des habiletés
  - **Fichier modifié** : `js/graphiques-progression.js`

- **CORRECTION ANONYMISATION ARCHIVES** : Les noms sont anonymisés partout
  - **Problème** : Noms réels affichés dans graphiques "Évolution temporelle" malgré mode anonymisation
  - **Cause** : Les labels étaient construits directement depuis snapshot sans vérifier l'anonymisation
  - **Fix** : Ajout vérification `anonymiserNom(da)` dans `creerGraphiqueGroupeSpaghettiACP` et `creerGraphiqueGroupeSpaghetti`
  - **Fichier modifié** : `js/graphiques-progression.js`

- **RÉORGANISATION DU TABLEAU DE BORD** : 4 sections distinctes (tâche précédente)
  1. **Indicateurs ACPE du groupe** : Barres A, C, P, E avec mini-courbes Gauss
  2. **Indicateurs d'apprentissage** : Patterns + RàI (nouvelle section séparée)
  3. **Évolution temporelle** : Graphique spaghetti ACP
  4. **Trajectoire d'apprentissage** : Graphique spaghetti par production
  - Chaque section a son propre ID pour injection JS ciblée
  - Notes d'aide mises à jour pour chaque section
  - **Fichiers modifiés** : `index.html`, `js/tableau-bord-apercu.js`

- **MINI-COURBES DE GAUSS INTÉGRÉES** (tâche précédente)
  - Mini-courbe de Gauss SVG superposée sur chaque barre ACPE
  - Ligne μ pleine + lignes ±σ pointillées
  - Statistiques sous chaque barre : μ=XX% | ±1σ: X/N (Y%)
  - Barres agrandies : 55px (ACPE), 45px (Patterns, RàI)

### Tache precedente (25 janvier - Beta 96)
- **UNIFORMISATION DES GRAPHIQUES** : Tous les graphiques adoptent le même look
  - **Échelle Y dynamique** : S'adapte aux données (min-5% à max+5%) au lieu de 0-100% fixe
  - **Zones IDME dynamiques** : Utilisent l'échelle utilisateur partout (via `genererZonesDepuisEchelle()`)
  - **Étiquettes de zones** : Centrées dans le graphique avec couleurs saturées (rouge, orange, vert, bleu)
  - **Survol interactif** : Courbe survolée mise en évidence, autres atténuées, nom affiché au bout
  - **Graphiques uniformisés** :
    - `creerGraphiqueIndividuel` : Progression temporelle A-C-P (profil étudiant)
    - `creerGraphiqueGroupeMoyennes` : Moyennes A-C-P du groupe (tableau de bord)
    - `creerGraphiqueGroupeSpaghettiACP` : Trajectoires ACP par étudiant (tableau de bord)
    - `creerGraphiqueGroupeSpaghetti` : Trajectoires par production (tableau de bord)
    - `creerGraphiqueCriteres` : Développement des habiletés (profil étudiant)
  - **Fichiers modifiés** :
    - `js/graphiques-progression.js` : Ajout plugins, onHover, échelle dynamique
    - `index.html` : Notes de version Beta 96
  - **Plugins créés** :
    - `pluginEtiquettesZones` / `pluginEtiquettesZones100` : Étiquettes centrées
    - `pluginNomCritereSurvol` : Affiche nom du critère au survol

### Tache precedente (25 janvier - Beta 96)
- **GRAPHIQUE SPAGHETTI - TRAJECTOIRES D'APPRENTISSAGE** : Nouvelle visualisation
  - Affiche les **résultats bruts par artefact** (pas l'indice P agrégé)
  - Montre la volatilité réelle de l'apprentissage (hauts et bas)
  - Révèle les artefacts difficiles (convergence vers le bas)
  - Permet de voir la résilience (rebonds après difficultés)
  - Zones IDME colorées en arrière-plan avec étiquettes
  - Carte d'aide expliquant la différence avec l'indice P

### Tache precedente (25 janvier - Beta 95.7)
- **IMPORT HISTORIQUE A2024** : Archivage trimestre Automne 2024
  - Import retroactif : 55 etudiants, 2 groupes, 750 evaluations, 1650 presences
  - Echelle IDME documentee (I=40%, D=65%, M=85%, E=100%)
  - Pratique : 6 artefacts recents (60%) + Analyse finale (40%)
  - Correction tri "recents" par numero de production (pas par date)
  - Scripts d'import dans `docs/A2024/`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

### Tache precedente (24 janvier)
- **NETTOYAGE DOUBLON GROUPE-COURS** : Groupe 1 de A25 apparaissait dans H26
  - **Symptome** : Le dropdown groupe-cours en H26 affichait 3 groupes (1, 2, 8) au lieu de 2 (2, 8)
  - **Cause** : La migration `migrerHorairesEtGroupesCours()` du 21 jan avait copie les donnees globales vers le trimestre actif, incluant le groupe 1 de A25 dans h2026_groupesCours
  - **Diagnostic** : Script console pour lister les groupes par trimestre
    - `db.getSync("h2026_groupesCours")` → 3 groupes (00001, 00002, 00008)
    - `db.getSync("a2025_groupesCours")` → 1 groupe (00001)
  - **Fix** : Nettoyage manuel via console (suppression du groupe 00001 de h2026_groupesCours)
    - Script : `db.setSync("h2026_groupesCours", db.getSync("h2026_groupesCours").filter(gc => gc.groupe !== "00001"))`
  - **Resultat** : H26 affiche maintenant seulement les groupes 2 et 8, A25 conserve son groupe 1
  - **Note** : Pas de changement de code, correction de donnees uniquement

- **CORRECTION AFFICHAGE TABLEAU DE BORD** : Messages "en attente" contradictoires
  - **Symptome 1** : Trimestre archive A25 affichait les moyennes (92%, 78%, 89%) ET "(X evaluations en attente)" simultanement
  - **Cause** : La condition d'affichage du message "en attente" ne verificait pas si une moyenne existait deja
  - **Fix** : Ajout condition `moyenneSignificative` - le message n'apparait que si la moyenne est 0%
  - **Symptome 2** : H26 sans evaluations affichait "100% en blocage critique" et "100% Niveau 3 intensif"
  - **Cause** : Le filtrage incluait les etudiants avec A > 0 mais C = P = 0 pour les patterns/RaI
  - **Fix** : Filtrage corrige pour ne considerer que les etudiants avec C > 0 OU P > 0
  - **Fichier modifie** : `js/tableau-bord-apercu.js`
    - `genererBarreDistribution()` : Condition `moyenneSignificative` (ligne 1418)
    - `afficherPatternsApprentissage()` : Filtrage `etudiantsAvecDonneesCP` sur C et P uniquement
    - `afficherNiveauxRaI()` : Meme correction pour les niveaux RaI
  - **Resultat** :
    - A25 (archive) : Moyennes affichees sans message "en attente" parasite
    - H26 (sans evaluations) : Message "En attente de donnees" pour Patterns et RaI

### Tache precedente (23 janvier)
- **CORRECTION BUG ANONYMISATION #2** : Liste etudiants vide en mode anonymise
  - **Symptome** : Passage Normal → Anonymise affichait "0 personne" et "Aucun etudiant trouve"
  - **Cause** : Le filtrage par groupe dans `obtenirEtudiantsCoursActif()` comparait le groupe anonymise (`AN.00001`) avec le groupe reel (`00001`)
    - `anonymiserDonnees()` remplacait `e.groupe` par `AN.${e.groupe}` sans preserver le groupe reel
    - La comparaison `normaliserGroupe(e.groupe) === normaliserGroupe(groupeCours)` echouait systematiquement
  - **Fix** : Ajout de `groupeReel` dans l'anonymisation + utilisation dans le filtrage
    - `anonymiserDonnees()` : Ajout `groupeReel: etudiant.groupe` (ligne 667)
    - `obtenirEtudiantsCoursActif()` : Utilise `e.groupeReel || e.groupe` pour le filtrage (ligne 889)
    - `etudiantDansCoursActif()` : Meme correction (ligne 955)
  - **Fichier modifie** : `js/modes.js`

- **CORRECTION BUG ANONYMISATION #1** : "Eleve introuvable" lors du changement de mode
  - **Symptome** : Checkbox Anonymiser ou dropdown mode affichait "Eleve introuvable"
  - **Cause** : Incoherence de filtrage dans `rafraichirContenuSelonMode()` (modes.js)
    - La verification utilisait `filtrerEtudiantsParMode` (sans filtre coursId)
    - Mais `afficherProfilComplet` utilisait `obtenirEtudiantsCoursActif()` (avec filtre coursId)
  - **Fix** : Utiliser `obtenirEtudiantsCoursActif()` partout pour coherence
  - **Fichier modifie** : `js/modes.js`

- **DIAGNOSTIC ET CORRECTION DONNEES A25** : Trimestre A2025 inutilisable (pas d'etudiants, pas d'indices)
  - **Symptome** : Groupe-cours 00001 de l'A25 n'affichait aucune donnee malgre 30 etudiants
  - **Cause 1** : Mismatch coursId - etudiants, evaluations, presences et productions avaient un ancien coursId
    - Fix : Script console pour corriger coursId dans toutes les entites
  - **Cause 2** : Pratique non reconnue - `pan-standards-bruno` (pratique utilisateur) non trouvee par `obtenirPratiqueParId()`
    - Fix : Changement vers `pan-standards` (pratique built-in)
  - **Cause 3** : Cache indicesCP ancien format causait erreur `historique.length`
    - Fix : Nettoyage cache et recalcul avec nouveau format
  - **Cause 4** : Configuration affichage manquante - `affichageTableauBord` non defini
    - Fix : Ajout `afficherAlternatif: true` dans `modalitesEvaluation`
  - **Resultat** : A25 affiche maintenant A=98%, C=92%, P=78%, E=89% + patterns + niveaux RaI
  - **Note** : Corrections via scripts console (pas de changement de code)

- **CORRECTION FILTRAGE PRESENCES PAR GROUPE-COURS** : Les presences etaient melangees entre les groupes
  - **Symptome** : Le groupe 2 affichait les presences du groupe 8 (indice A incorrect)
  - **Cause** : `chargerGroupesPresences()`, `chargerTableauPresences()` et `sauvegarderToutesPresences()` utilisaient `obtenirDonneesSelonMode('groupeEtudiants')` (retourne TOUS les etudiants du trimestre)
  - **Fix** : Utilisation de `obtenirEtudiantsCoursActif()` pour ne prendre que les etudiants du groupe-cours actif
  - **Fichier modifie** : `js/saisie-presences.js`

- **CORRECTION CALCUL MOYENNE A PAR GROUPE-COURS** : Le calcul incluait les presences d'autres groupes
  - **Symptome** : Groupe 2 affichait la moyenne A du groupe 8
  - **Cause** : Les presences n'etaient pas filtrees par `coursId` du groupe-cours actif
  - **Fix** : Ajout filtrage `presencesGlobal.filter(p => p.coursId === coursIdActif)` dans le calcul moyenneA
  - **Fichier modifie** : `js/etudiants.js`

- **CORRECTION DROPDOWN TRIMESTRE ACTIF** : Le dropdown affichait le mauvais trimestre
  - **Symptome** : Apres changement vers A2025, le dropdown affichait toujours "Demonstration"
  - **Cause** : La valeur du select n'etait pas forcee apres population des options
  - **Fix** : Ajout `select.value = trimestreActif.id` apres population des options
  - **Fichier modifie** : `js/trimestre-v2.js`

- **CORRECTION DOUBLONS TRIMESTRES** : Deux entrees "Demonstration" dans le dropdown
  - **Cause** : Doublons dans la liste des trimestres enregistres
  - **Fix** : Nettoyage automatique des doublons dans `obtenirTrimestres()` (detection par ID et par nom)
  - **Fichier modifie** : `js/trimestres.js`

- **MASQUAGE TRIMESTRE DEMO EN MODE NORMAL** : Le trimestre Demo n'apparait plus en mode Normal
  - Le trimestre Demo est maintenant visible uniquement en Mode Assiste
  - **Fichier modifie** : `js/trimestre-v2.js`

- **AJOUT BACKLOG #32** : Refonte architecture groupe Demo planifiee
  - Le groupe Demo devient un "bac a sable" accessible en Mode Assiste
  - Plus de switch de trimestre, mais switch de MODE (Normal/Assiste)
  - Dataset complet : 5 etudiants, ~8-10 semaines, presences variees, evaluations, productions
  - Prerequis : Documentation complete avant codage

### Tache precedente (21 janvier)
- **BUG CRITIQUE TRIMESTRES A2025/DEMO** : Données inaccessibles après changement de trimestre
  - **Symptôme** : "0 personne" affiché, aucun étudiant ni résultat visible
  - **Cause 1** : `changerTrimestreActif()` ne mettait pas à jour `window.trimestreActif`
    - Fix : Ajout `window.trimestreActif = id;` après `db.setSync` (trimestres.js)
  - **Cause 2** : `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
    - `cle('groupesCours')` retournait 'groupesCours' au lieu de 'a2025_groupesCours'
    - Fix : Ajout des deux clés à `CLES_NAMESPACEES` (trimestres.js)
  - **Cause 3** : Données demo n'avaient pas de groupe-cours
    - Fix : `fusionnerDonneesDemo()` crée maintenant automatiquement un horaire et groupe-cours demo
    - Fichier modifié : `js/donnees-demo.js`
  - **Cause 4** : Création automatique groupe-cours demo au changement de trimestre
    - Fix : Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` appelée dans `changerTrimestreActif()`
    - Crée `HOR_DEMO` et `GC_DEMO` si manquants quand on passe au trimestre demo
    - Fichier modifié : `js/trimestres.js`
  - **Résultat** : A2025 affiche maintenant 30 étudiants avec assiduité (98%)
  - **Problème résiduel A2025** : Complétion et Performance à 0% dans le tableau de bord agrégé
    - Cause probable : Grille d'évaluation originale (`GRILLE1759243306842 - Global-5 FR-HOLIS`) supprimée/modifiée
    - Les notes individuelles sont conservées mais le calcul agrégé échoue
    - Ce n'est pas un bug de code mais un problème de données

- **MIGRATION HORAIRES/GROUPESCOURS** : Données H2026 manquantes après ajout à CLES_NAMESPACEES
  - **Symptôme** : Horaires et groupe-cours créés pour H2026 n'apparaissaient pas
  - **Cause** : Données stockées dans `horaires`/`groupesCours` (sans préfixe) mais lues depuis `h2026_horaires`/`h2026_groupesCours`
  - **Fix** : Nouvelle fonction `migrerHorairesEtGroupesCours()` dans `initialiserModuleTrimestres()`
  - Migre automatiquement les données vers le trimestre actif au démarrage
  - **Fichier modifié** : `js/trimestres.js`

- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Améliorations mise en page
  - **Nouvelle disposition** :
    - En-tête droite : Code cours, Nom du cours, Trimestre (empilés verticalement)
    - Pied de page gauche : Nom complet de l'enseignant uniquement
    - Pied de page droite : Licence CC BY-NC-SA 4.0
  - **Corrections SST** (Single Source of Truth) :
    - `obtenirInfosCoursPDF()` : Lecture depuis `listeCours`/`cours` via `coursId` (comme trimestre-v2.js:4117-4120)
    - `obtenirNomEnseignantPDF()` : Gestion correcte `enseignantId === 'profil'` (comme trimestre-v2.js:4127-4140)
  - **Options simplifiées** :
    - Retiré : Option "Cours" du pied de page (maintenant dans l'en-tête)
    - Retiré : Taille police (fixée à "petit")
    - Ajouté : Checkbox "Afficher le trimestre"
  - **Marges réduites** : 0.5 inch au lieu de 1 inch
  - **Bug en cours** : Les infos cours/enseignant ne s'affichent pas encore dans le PDF
    - Prochaine étape : Ajouter logs de débogage pour identifier la source des données
  - **Fichiers modifiés** : `js/export-pdf.js`, `index.html`, `styles.css`

### Tache precedente (20 janvier)

- **CLARIFIER ARTEFACTS MEILLEURS VS OBLIGATOIRES (#3)** : Workflow amélioré
  - Primo : Nouvelle question "Combien de productions Obligatoires ?"
  - Primo : Message validation affiche total (ex: "4 meilleures + 2 obligatoires = 6 productions")
  - Wizard : Transfert config catégories Primo → pratique.configuration
  - Expert : Résumé visuel "📊 Construction de la note" avec calcul dynamique
  - **Fichiers modifiés** : `js/primo-questions.js`, `js/wizard-pratique-v2.js`, `js/pratiques-materiel.js`, `index.html`

- **DROPDOWN NOTE MAXIMALE (Beta 95.7)** : Reprise ciblée avec échelle dynamique
  - Champ texte remplacé par dropdown dans Construction > Pratiques et Réglages
  - Peuplé automatiquement avec les niveaux de l'échelle sélectionnée
  - **Fichiers modifiés** : `index.html`, `js/pratiques-materiel.js`, `js/pratiques.js`

- **ORDRE DISCIPLINES DROPDOWN (Beta 95.7)** : Correction ordre 100→600
  - Groupe 400 (Administration) était à la fin, maintenant après 300
  - **Fichier modifié** : `js/wizard-pratique-v2.js`

- **MESSAGE AIDE BIBLIOTHEQUE (Beta 95.7)** : Guide pour édition des pratiques
  - Message ajouté dans les modals bibliothèque (Construction et Réglages)
  - "Pour éditer une pratique, transférez-la d'abord dans la barre latérale..."
  - **Fichiers modifiés** : `js/pratiques-materiel.js`, `js/pratiques.js`

- **VALEURS PAR DEFAUT JETONS (Beta 95.7)** : Ajustement selon usage réel
  - Nombre de jetons par élève : 4 → **2**
  - Durée du délai : 7 → **2 jours**
  - **Fichiers modifiés** : `index.html`, `js/pratiques.js`, `js/pratiques-materiel.js`, `js/pratique-notation-v2.js`, `js/evaluation-jetons.js`, `js/profil-etudiant.js`, `js/pratiques/pratique-pan-specifications.js`

- **MENAGE REPERTOIRE PRINCIPAL (Beta 95.7)** : Réorganisation des fichiers
  - Fusion `archive/` dans `Archives/` (documentation + scripts obsolètes)
  - Fichiers temporaires déplacés vers `Archives/`
  - Documentation utilisateur → `docs/utilisateur/`
  - Fichiers de référence → `docs/references/`
  - Logo et images → `img/`
  - Racine nettoyée : uniquement fichiers essentiels

- **BACKLOG.md CREE** : Fichier dédié pour les tâches à faire
  - Accès rapide en début de session
  - Structure : À faire / Complété
  - Référencé dans CLAUDE.md

- **BACKLOG P2 ENRICHI** : 20 éléments ajoutés à la roadmap
  - **Fichier modifié** : `docs/ROADMAP_H2026.md`
  - **Éléments ajoutés** :
    - Clarifier nombre total d'artefacts (meilleurs vs obligatoires)
    - Persistance données Primo ↔ Mode Expert
    - Valeurs par défaut système de jetons
    - Reprise ciblée - dropdown note maximale
    - Gestion bibliothèques (boutons Supprimer/Dupliquer)
    - Message aide bibliothèque pratiques
    - Document backlog indépendant (BACKLOG.md)
    - Mettre à jour section AIDE + Notes de version
    - Message "Nouveautés de la beta" automatisé
    - Audit db.get() vs db.getSync()
    - Outil vérification intégrité données
    - Audit champs texte → dropdown
    - Consolidation wizard vs pratiques-materiel
    - Système changelog automatisé
    - Checklist tests de régression
    - Étendre aide contextuelle 😎
    - Ordre disciplines dans dropdown (100→600)
    - Mettre à jour liste programmes d'études

- **DROPDOWN DISCIPLINE (Beta 95.6)** : Remplacement du champ texte libre par dropdown
  - Champ "Discipline" dans l'édition d'une pratique (Construction > Pratiques)
  - Même dropdown que Primo avec 6 catégories (100-600)
  - **Fichier modifié** : `index.html`

- **CORRECTION SAUVEGARDE PRATIQUES (Beta 95.6)** : Bug critique corrigé
  - **Symptôme** : Pratiques créées disparaissaient au rechargement de la page
  - **Cause** : Désynchronisation IndexedDB ↔ localStorage
    - Lectures depuis IndexedDB (données anciennes) écrasaient localStorage (données récentes)
    - Wizard ne définissait pas `dansBibliotheque: true` ni `pratiques: ['STD']`
  - **Corrections** :
    - `js/pratiques-materiel.js` : Toutes les lectures utilisent `db.getSync()` (localStorage)
    - `js/pratiques-materiel.js` : Vérification explicite après sauvegarde
    - `js/wizard-pratique-v2.js` : Ajout `dansBibliotheque: true` et `pratiques: [type]`
    - `js/wizard-pratique-v2.js` : Sauvegarde async avec attente IndexedDB
    - `js/wizard-pratique-v2.js` : Rafraîchissement sidebar après création

### Tache precedente (19 janvier)
- **AIDE CONTEXTUELLE 😎 (Beta 95.6)** : Systeme de boutons d'aide en Mode Assiste
  - 15 sections d'aide couvrant toutes les zones critiques de l'application
  - Nouvelle section "Cartouches de rétroaction" (rôle dans les grilles descriptives)
  - Nouvelle section "Reflexion sur les objectifs d'apprentissage"
  - Tutoiement systematique (tu/ton/tes) pour ton chaleureux
  - Ordre de configuration clarifie : Echelles → Pratiques → Grilles → Productions
  - **Fichiers crees** : `js/aide-contextuelle.js`, `js/aide-contextuelle-contenu.js`
  - **Fichiers modifies** : `index.html`, `styles.css`

- **MODULARISATION DESIGN SYSTEM (Beta 95.6)** : Separation en modules
  - 16 modules HTML dans `Design system - Modules/`
  - Index navigable `design-system-index.html`
  - Redirection depuis `DESIGN_SYSTEM.html`
  - Archive du fichier monolithique

- **AUDIT CONFORMITE DS7 (Beta 95.6)** : Corrections styles.css et index.html
  - Border-radius non conformes corriges (3px→5px, 10px→12px, 15px→20px)
  - Box-shadow rgba(0,0,0) remplaces par rgba(3,46,92) via variables CSS
  - Styles inline corriges (border-radius 4px/8px, box-shadow)
  - Rapport d'audit : `docs/AUDIT_CONFORMITE_DS7.md`

- **BADGE NB ETUDIANTS (Beta 95.6)** : Uniformisation affichage
  - Badge "X personne(s)" dans "Indicateurs globaux" et "Étudiant·es inscrit·es"
  - Mise à jour automatique au changement de groupe-cours
  - **Fichiers modifiés** : `tableau-bord-apercu.js`, `trimestre-v2.js`

- **BUG VUE CALENDAIRE (Beta 95.6)** : Calendrier n'affichait pas les bons jours de cours
  - **Symptome** : Groupe Lun-Jeu affichait des cours le mardi, ne changeait pas selon groupe-cours actif
  - **Causes multiples** :
    1. Comparaison case-sensitive `seance.jour` ("lundi") vs `jourSemaine` ("Lundi")
    2. `obtenirSeancesHoraire()` priorisait clé legacy avant entité horaire du groupe-cours
    3. Logique `typeFinal` ne distinguait pas cours-reel vs jour-ouvrable
  - **Corrections** :
    - `js/horaire.js` : Priorité à l'entité Horaire du groupe-cours actif (ordre de recherche modifié)
    - `js/calendrier-vue.js` : Normalisation minuscules + logique typeFinal améliorée
    - `js/saisie-presences.js` : Normalisation minuscules pour filtrage dates
    - `js/presences-apercu.js` : Normalisation dans `calculerTotalSeances()` et `calculerProchaineSeance()`

### Tache precedente (11 janvier)
- **SEPARATION MODAL BIENVENUE (Beta 95.4)** : Deux modals distincts
  - ✉️ Modal News : Nouveautes par version (95.4, 95.3, 95.2, 95.1)
  - 😎 Modal Introduction : Guide de demarrage (Primo, Mode Assiste)
  - Deux boutons dans l'entete (a cote de ⚠️ backup)
  - Contenu Beta 95.1 integre depuis "Docu Pour les testeurs.txt"

- **COMPATIBILITE DONNEES A2025 (Beta 95.5)** : Correction affichage indices
  - **Probleme** : Badge "0 personne" et barres vides pour trimestres anterieurs
  - **Cause 1** : `infoCours` non initialise quand changement de trimestre
  - **Cause 2** : `tableau-bord-apercu.js` lisait directement `.SOM/.PAN` (ancien format)
  - **Corrections** :
    - Auto-selection du premier groupe-cours quand changement trimestre
    - Detection format ancien (SOM/PAN) vs nouveau (pratique unique)
    - Retrocompatibilite complete pour les deux formats
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Auto-selection groupe-cours dans `peuplerDropdownGroupeCoursActif()`
    - `js/tableau-bord-apercu.js` : Detection format dans `calculerIndicesEtudiant()`

- **OPTIMISATION INDICES C/P (Beta 95.5)** : Migration IndexedDB + pratique unique
  - **Probleme resolu** : Saturation localStorage avec calcul DUAL SOM/PAN
  - **Solution** :
    - Stockage principal dans IndexedDB (pas de limite de taille)
    - Calcul d'une seule pratique (pratique active du groupe-cours)
    - Structure simplifiee : `{ date, pratique, C, P, E, details }`
  - **Nouvelles fonctions** :
    - `obtenirPratiqueActiveGroupeCours()` dans modes.js
    - `obtenirIndicesCPAsync(da)` pour lecture async
    - `calculerEtStockerIndicesCP()` maintenant async
  - **Retrocompatibilite** : `obtenirIndicesCP(da, 'SOM')` fonctionne toujours
  - **Bug corrige** : db.js memoryCache pour donnees > localStorage
  - **Fichiers modifies** :
    - `js/portfolio.js` : Refonte calcul + nouvelles fonctions lecture
    - `js/modes.js` : obtenirPratiqueActiveGroupeCours()
    - `js/db.js` : Fix memoryCache pour QuotaExceededError

- **BADGE NB PERSONNES** : Ajout et correction du filtrage par groupe-cours
  - **Ajout badge** : "Indicateurs globaux du groupe" affiche maintenant le nombre de personnes
  - **Terminologie** : "etudiant(s)" remplace par "personnes"
  - **Correction filtrage** : Le badge s'ajuste correctement quand on change de groupe-cours
  - **Probleme resolu** : `infoCours.id` utilisait l'ID groupe-cours au lieu de l'ID cours
  - **Probleme resolu** : `db.set` async n'ecrivait pas dans localStorage sature → utilisation `db.setSync`
  - **Suppression duplication** : `changerGroupeCoursActifV2` n'existe plus que dans trimestre-v2.js
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Mise a jour directe de `infoCours` avec `db.setSync` + correction `id: gc.coursId`
    - `js/etudiants.js` : Badge dans header "Indicateurs globaux" + terminologie "personnes"
    - `js/modes.js` : Logs DEBUG pour diagnostic (a retirer plus tard)
    - `js/entites-ui.js` : Suppression fonctions dupliquees
    - `index.html` : Ajout span badge + mise a jour versions scripts

### Tache precedente (10 janvier)
- **REDESIGN UX** : Categories Selection/Obligatoires (Beta 95.4)
  - **Separation design/notation** : Champ categorie retire du formulaire Production
  - **Nouveau design** : Deux cartes cote a cote dans Structure des evaluations
    - Carte "Selection (N meilleures)" : nombre a retenir + ponderation + checkboxes
    - Carte "Obligatoires (toujours comptees)" : ponderation + checkboxes
  - **Calcul automatique** : Ponderation unitaire affichee en temps reel
    - Selection : 65% / 4 = 16.25% par production retenue
    - Obligatoires : 35% / 2 = 17.5% par production
  - **Checkboxes exclusives** : Une production ne peut etre que dans UNE categorie
    - Cocher dans Selection → grise dans Obligatoires
    - Indication visuelle quand deja assignee ailleurs
  - **Fichiers modifies** :
    - `index.html` : Nouveau HTML cartes avec checkboxes + retrait champ categorie
    - `js/pratiques-materiel.js` : Nouvelles fonctions checkboxes + calcul unitaire
    - `js/productions.js` : Preserve categorie existante (plus de lecture du champ retire)

- **Tache precedente** : Categories Selection/Obligatoires (implementation initiale)
  - Permet de distinguer des productions "pool" (N meilleures retenues) vs "toujours comptees"
  - **Cas d'usage** : 4 meilleures sur 8 artefacts (65%) + 2 certifications obligatoires (35%)
  - Fonction `calculerNoteAvecCategories()` dans portfolio.js
  - Questions Primo pour configurer les categories

- **Tache precedente** : Mode "Cours" dans le dropdown de l'en-tete
  - Permet de selectionner un cours entier (tous les groupes fusionnes)
  - Format dropdown : `SIGLE (X groupes)` dans section "Cours (tous groupes)"
  - Etudiants de tous les groupes affiches ensemble
  - Statistiques agregees pour le cours complet
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : `peuplerDropdownGroupeCoursActif()` + `changerGroupeCoursActifV2()`
    - `js/modes.js` : `obtenirEtudiantsCoursActif()` + `obtenirDonneesSelonMode()`
  - **Implementation** :
    - Valeur dropdown avec prefixe `cours:` pour le mode cours
    - Flag `modeCours: true` dans `groupeCoursActif` et `infoCours._modeCours`
    - Filtrage par coursId sans filtre groupe quand mode cours actif
  - **Amelioration** : Option "Cours" visible meme avec 1 seul groupe-cours actif (permet de voir tous les etudiants meme si d'autres groupes sont masques)
  - **Rafraichissement automatique** : Changement de groupe-cours dans l'entete rafraichit la liste des etudiants et reinitialise le filtre Groupe
  - **Suppression dropdown redondant** : L'ancien dropdown cours dans la zone contextuelle est supprime, seul le dropdown "Groupe-cours actif" reste
- **CORRECTIONS DE BUGS** (10 janvier) :
  - **Dropdown pratique de notation** : Utilise maintenant la bonne cle `pratiquesConfigurables` (etait `pratiquesNotation`)
  - **Echelle de performance** : Persiste correctement apres rechargement (ordre de chargement corrige dans pratiques-materiel.js)
  - **Grilles de criteres** : Modifications persistaient pas apres rechargement (synchronisation grilleTemplateActuelle ajoutee)
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Cle dropdown pratique corrigee
    - `js/pratiques-materiel.js` : Dropdown echelles charge AVANT remplissage formulaire
    - `js/contexte.js` : Suppression dropdown cours redondant
    - `js/grilles.js` : 4 fonctions synchronisent maintenant grilleTemplateActuelle (modifierCritereGrille, deplacerCritereGrilleHaut/Bas, supprimerCritereGrille)

### Tache precedente (9 janvier)
- **BUG CRITIQUE CORRIGE** : Perte de donnees etudiants (55 → 29)
  - **Symptome** : Import 29 etudiants OK, import 26 de plus OK (55 total), mais dropdown affiche 29
  - **Cause racine** : `db.getSync()` lisait depuis localStorage qui contenait des donnees obsoletes
  - **Solution** : Convertir toutes les fonctions en async avec `await db.get/set` pour lire/ecrire depuis IndexedDB (source de verite)
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : 8 fonctions converties en async
      - `confirmerImportV2`, `soumettreEtudiantV2`, `supprimerEtudiantV2`
      - `reinitialiserEtudiantsV2`, `supprimerGroupeSelectionneV2`, `sauvegarderGroupeEtudiantsV2`
      - `chargerListeEtudiantsV2`, `filtrerParGroupeV2`, `chargerGroupesCoursV2`
    - `js/modes.js` : Normalisation des groupes pour comparaison ("1" == "00001")
  - **Suppression appels legacy** : `afficherListeEtudiants()` retire de `chargerListeEtudiantsV2`
- **Bouton "Supprimer ce groupe"** : Nouvelle fonctionnalite
  - Permet de supprimer tous les etudiants d'un groupe en un clic
  - Bouton visible uniquement quand un groupe est selectionne
  - Confirmation requise avant suppression
- **Support format Excel** : `="valeur"` maintenant reconnu lors de l'import
- **Section AIDE mise a jour** : Documentation Beta 95.3
  - Carte "Etapes de configuration" : Workflow Beta 95 unifie
  - Carte "Primo" : Integration Section Trimestre + detection config existante
  - Carte "Partage et communs" : Import trimestre precedent + nommage exports
  - Carte "Section Trimestre" : 6 accordeons + syntheses intelligentes
  - Carte "Groupe-cours" : 5 composantes + bibliotheque
- **Audit module evaluation** : 3/3 problemes critiques resolus
  - `docs/modules/AUDIT_EVALUATION.md` : 16 548 lignes analysees
  - Fix #1: Namespacing `evaluationsSauvegardees` (34 occurrences, 7 fichiers)
  - Fix #2: Integration groupe-cours (`groupeCoursId` + logs)
  - Fix #3: Validations references (etudiant/production/grille)
- **Compatibilite A2025** : Verifiee, donnees legacy nettoyees
- **Donnees demo (groupe 9999)** : Bug fusion corrige
- **Protocole mise a jour beta** : Documentation + script automatisation

---

## PROCHAINE TACHE

**Choisir une tache dans le backlog Beta 95.x**

---

## BACKLOG BETA 95.x (A FAIRE)

### Prioritaire (H2026)
- [x] **Separation modal Bienvenue** : Deux modals distincts (FAIT)
  - ✉️ News (nouveautes par version : 95.4, 95.3, 95.2, 95.1)
  - 😎 Introduction (guide demarrage, Primo, Mode Assiste)
  - Contenu Beta 95.1 integre depuis "Docu Pour les testeurs.txt"
- [x] **Systeme modals info 😎 (Mode Assiste)** : Aide contextuelle (FAIT Beta 95.6)
  - 15 sections d'aide couvrant toutes les zones critiques
  - Tutoiement systematique + ordre configuration clarifie
  - Visible uniquement en Mode Assiste
- [x] **Badge nb etudiants (uniformisation)** : Afficher badge "X etudiant(s)" (FAIT Beta 95.6)
  - En-tete "Indicateurs globaux du groupe" (Vue d'ensemble)
  - En-tete "Etudiant·es inscrit·es" (Liste des etudiant·es)
  - Mise a jour automatique au changement de groupe-cours
- [x] **Modularisation design_system.html** : Separation en 16 modules (FAIT Beta 95.6)
  - Index navigable + redirection + archive monolithique
- [x] **Audit conformite Design System v7** : Corrections styles.css et index.html (FAIT Beta 95.6)
  - Border-radius et box-shadow conformes aux specifications
- [ ] **Optimisation page Trimestre** : Performance et UX
- [ ] **Tests export/import metadata CC** : Verifier que les metadonnees CC sont correctement exportees et reimportees
- [ ] **Test securite donnees sensibles** : Audit des donnees stockees (localStorage, IndexedDB)

### Ameliorations rapport de bug (post-testeurs) — FAIT 18 jan 2026
- [x] **Stack trace complet** : Ajouter trace detaillee au lieu de juste fichier:ligne
- [x] **Historique actions recentes** : Capturer les 5-10 dernieres actions (clics, navigation) avant l'erreur
- [x] **Contexte de donnees** : Inclure infos pertinentes selon la section (ex: type de fichier importe, cles localStorage actives)
- [x] **Capture d'ecran integree** : Bouton pour capturer et joindre automatiquement une capture
- [x] **Etat stockage** : Inclure cles localStorage/IndexedDB pertinentes pour la section active

### Archivage trimestre (post-H2026)
- [ ] **Snapshot complet lors archivage** : Figer TOUTES les dependances d'un trimestre
  - Productions (`trimestre_productions`)
  - Grilles de criteres (`trimestre_grilles`)
  - Echelles de performance (`trimestre_echelles`)
  - Cartouches (`trimestre_cartouches`)
  - Pratique de notation (`trimestre_pratiques`)
  - **Objectif** : Garantir consultation des anciens trimestres meme si config evolue
- [ ] **Compatibilite donnees A2025** : Corriger les references cassees
  - Probleme : Evaluations A2025 referencent grilles/echelles supprimees
  - Cause : Productions/grilles/echelles modifiees pour H2026
  - Impact : Notes non calculees pour A2025
  - Solution : Reconstruire les metadonnees ou accepter perte partielle
- [ ] **Message groupe-cours manquant** : Quand aucun groupe-cours pour un trimestre
- [ ] **Pratique de notation fallback** : Utiliser defaut si pratique configuree n'existe plus

---

## DECISIONS RECENTES

| Decision | Date | Raison |
|----------|------|--------|
| Mode Cours (tous groupes) dans dropdown | 10 jan | Suivre plusieurs groupes simultanément |
| Migration massive variables CSS | 9 jan | Maintenabilite + coherence |
| Modularisation code reportee a Beta 96 | 8 jan | Priorite = stabilite pour H2026 |
| Garder tout dans trimestre-v2.js | 8 jan | Structure donnees deja modulaire |
| Design System v7 | 8 jan | Harmonisation border-radius 12px/6px |

---

## BACKLOG BETA 95.x (COMPLETE)

### Prioritaire (fait)
- [x] Valider import/export (Productions, Grilles, Echelles, Cartouches, Pratiques)
- [x] Connexion calendrier avec groupe-cours
- [x] Saisie des presences avec groupe-cours actif
- [x] Migration variables CSS (box-shadow, border-radius)

### Plus tard
- [x] **Bug trimestre par defaut** : Resolu - detection et correction auto si plusieurs trimestres actifs
- [x] **Incoherence profil enseignant** : Resolu - liste unifiee `enseignants` (migration auto de profilEnseignant)
- [x] **Bouton supprimer groupe-cours** : Deja implementé (bouton dans formulaire + liste)
- [x] **Modal bibliotheque groupe-cours** : Vue liste avec Activer/Supprimer (Beta 95.3)
- [x] **Affichage dropdown groupe-cours** : "Groupe 00001" au lieu de "??? gr.00001"
- [x] Optimiser utilisation de l'espace (limiter scrolling vertical)
- [x] Revoir design page Trimestre (harmonisation complete)
- [x] Compatibilite page Trimestre avec wizard Primo (dropdown pratique ajoute)
- [x] Creer protocole de mise a jour des beta (docs/operations/ + scripts/)
- [x] Auditer module evaluation (3/3 problemes critiques resolus)
- [x] Syntheses intelligentes dans sidebars (5 fonctions Beta 95.3)
- [x] **Filtres par discipline/cours** : Deja implementes dans Grilles, Echelles, Productions
- [x] **Import par trimestre filtrable par cours** : Section + filtre cours + preview (Productions)
- [x] **UX modal Echelles** : Section "Importer depuis un autre trimestre" ajoutee
- [x] **Filtres discipline Echelles/Grilles** : Capture auto discipline depuis infoCours
- [x] **Harmoniser largeur modaux** : Tous a 800px (cours 900→800, groupe-cours 700→800)
- [x] **Nommage fichiers export** : Fonction genererNomFichierExport() standardisee
- [x] **Audit design global** : 16 parties verifiees, toutes conformes

### Compatibilite et donnees
- [x] Assurer compatibilite donnees A2025 avec modifications au code
- [x] Tester l'application avec les donnees A2025
- [x] Assurer la fonctionnalite des donnees demo (groupe 9999)

---

## FICHIERS CLES MODIFIES (9 janvier)

| Fichier | Modification |
|---------|--------------|
| `js/groupe.js` | **FIX CRITIQUE** : Perte donnees etudiants + format Excel ="valeur" |
| `js/trimestre-v2.js` | Bouton supprimer groupe + reset dropdown + format Excel |
| `index.html` | Bouton "Supprimer ce groupe" + Section AIDE |
| `js/cc-license.js` | Fonction genererNomFichierExport() standardisee |
| `js/echelles.js` | Import trimestre + discipline auto + nommage export |
| `js/grilles.js` | Discipline auto + nommage export |
| `js/productions.js` | Filtre cours import + nommage export |
| `js/cours.js` | Modal 800px (etait 900px) |
| `js/evaluation.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/evaluation-jetons.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/portfolio.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/snapshots.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/donnees-demo.js` | Fix fusion demo - syncToLocalStorageCache() avant cle() |
| `docs/modules/AUDIT_EVALUATION.md` | Documentation audit module evaluation |

---

## RAPPELS CRITIQUES

### Architecture
- **Single Source of Truth** : Chaque donnee a UNE source unique
- **Namespacing** : Utiliser `cle('nomCle')` pour cles localStorage
- **Priorite testeurs** : Les retours utilisateurs passent AVANT le backlog

### Design System v7
- Conteneurs : `border-radius: var(--radius-grand)` (12px)
- Petits elements : `border-radius: var(--radius-moyen)` (6px)
- Box-shadow : 5 niveaux (subtil, normal, prononce, fort, inset)

### Zones protegees
- `js/config.js` - Ne pas modifier
- `js/navigation.js` - Ne pas modifier
- `noms_stables.json` - Ne pas modifier

---

## HISTORIQUE RECENT

### 31 janvier 2026
- **#48 SYNCHRONISATION MULTI-APPAREILS** : Export/Import MacBook ↔ iPad fonctionnel
  - Auto-cochage cases données personnelles quand "C'est ma propre sauvegarde" coché
  - Préservation IDs originaux (pratiques, grilles, échelles, productions)
  - Import données calendrier (cadreCalendrier, horaireHebdo, bornesTrimestre)
  - Test réussi : 146 clés exportées, 68 éléments importés sur iPad
  - **Fichier** : `js/import-export.js`
- **#55 PRATIQUES CONFIGURABLES** : Correction chargement depuis registre
  - Nouvelle fonction `construireConfigComplete()` normalise formats wizard vs legacy
  - Chargement échelle par ID depuis `echellesTemplates`
  - Fallback échelle IDME par défaut
  - **Fichier** : `js/pratiques/pratique-registre.js`
- **MODAL MIGRATION DÉSACTIVÉ** : Détection automatique données modernes
  - `detecterDonneesLegacy()` vérifie présence clés namespacées
  - Marque auto `migrationLegacyEffectuee=true` si données modernes détectées
  - **Fichier** : `js/migrations.js`
- **SCRIPT NETTOYAGE** : Nouveau `scripts/nettoyage-cles.js`
  - 3 étapes interactives pour supprimer clés obsolètes
  - 48 clés nettoyées (tests, migrations, snapshots anciens)
- **COMMITS** : 309be1c, 4e75c0e (Build 0131-1510)

### 25 janvier 2026
- **IMPORT HISTORIQUE A2024** : Archivage complet du trimestre Automne 2024
  - Import retroactif des donnees historiques (session de developpement initial)
  - 55 etudiants, 2 groupes, 14 artefacts + 1 analyse finale
  - 750 evaluations (700 artefacts + 50 analyses finales)
  - 1650 presences importees
  - Echelle IDME A2024 creee dans bibliotheque (I=40%, D=65%, M=85%, E=100%)
  - Pratique de notation : 6 recents (60%) + Analyse finale (40%)
  - Analyse finale : 5 criteres (Structure 15%, Rigueur 20%, Plausibilite 10%, Nuance 25%, Francais 30%)
  - Correction tri "recents" : par numero de production (pas par date d'evaluation)
  - Scripts d'import et diagnostic dans `docs/A2024/`
  - Documentation complete dans `docs/A2024/README.md`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

### 24 janvier 2026
- **NETTOYAGE DOUBLON GROUPE-COURS** : Groupe 1 de A25 retire de H26 (correction donnees via console)
- **CORRECTION AFFICHAGE TABLEAU DE BORD** : Messages "en attente" et patterns/RaI incoherents
  - Trimestre archive A25 : Moyennes affichees sans message "en attente" contradictoire
  - H26 sans evaluations : Message "En attente de donnees" au lieu de "100% blocage critique"
  - Corrections dans `genererBarreDistribution()`, `afficherPatternsApprentissage()`, `afficherNiveauxRaI()`
  - Fichier : `js/tableau-bord-apercu.js`

### 23 janvier 2026
- **BUG ANONYMISATION #2 CORRIGE** : Liste etudiants vide en mode anonymise
  - Cause : Comparaison groupe anonymise (`AN.00001`) vs groupe reel (`00001`) dans `obtenirEtudiantsCoursActif()`
  - Fix : Ajout `groupeReel` dans `anonymiserDonnees()` + utilisation dans le filtrage (modes.js)
- **BUG ANONYMISATION #1 CORRIGE** : "Eleve introuvable" lors du changement de mode (anonymisation)
  - Cause : Incoherence entre `filtrerEtudiantsParMode` et `obtenirEtudiantsCoursActif()`
  - Fix : Utiliser `obtenirEtudiantsCoursActif()` dans `rafraichirContenuSelonMode()` (modes.js)
- **DIAGNOSTIC DONNEES A25** : Corrections multiples pour rendre le trimestre A2025 fonctionnel
  - Mismatch coursId corrige pour etudiants (30), evaluations (305), presences (941), productions (11)
  - Pratique `pan-standards-bruno` → `pan-standards` (built-in)
  - Cache indicesCP nettoye (ancien format incompatible)
  - Configuration `affichageTableauBord.afficherAlternatif: true` ajoutee
  - Resultat : Tableau de bord A25 affiche tous les indicateurs (A, C, P, E, patterns, RaI)
- **CORRECTION FILTRAGE PRESENCES** : Presences et calcul A maintenant filtres par groupe-cours actif
  - Corrige la contamination croisee entre groupes (ex: groupe 2 affichait les donnees du groupe 8)
  - `chargerGroupesPresences()`, `chargerTableauPresences()`, `sauvegarderToutesPresences()` utilisent maintenant `obtenirEtudiantsCoursActif()`
  - Calcul moyenneA filtre les presences par `coursId`
  - **Fichiers** : `js/saisie-presences.js`, `js/etudiants.js`
- **CORRECTION DROPDOWN TRIMESTRE** : Synchronisation correcte apres changement
  - Le dropdown affiche maintenant le bon trimestre actif
  - Nettoyage automatique des doublons dans la liste des trimestres
  - Trimestre Demo masque en Mode Normal (visible seulement en Mode Assiste)
  - **Fichiers** : `js/trimestre-v2.js`, `js/trimestres.js`
- **BACKLOG #32 AJOUTE** : Refonte architecture groupe Demo planifiee
  - Concept : Demo devient un "bac a sable" accessible en Mode Assiste
  - Plus de switch de trimestre, mais switch de MODE
  - Prerequis : Documentation complete avant codage

### 21 janvier 2026
- **BUG CRITIQUE CORRIGÉ** : Données A2025/Démo inaccessibles après changement de trimestre
  - **Symptôme** : Aucun résultat, aucun élève, aucun travail affiché pour trimestres autres que H2026
  - **Causes multiples** :
    1. `changerTrimestreActif()` ne mettait pas à jour `window.trimestreActif`
    2. `groupesCours` et `horaires` manquaient dans `CLES_NAMESPACEES`
  - **Impact** :
    - Les modules lisaient l'ancienne valeur de `window.trimestreActif`
    - `cle('groupesCours')` retournait `'groupesCours'` au lieu de `'a2025_groupesCours'`
  - **Fix** :
    - Ajout `window.trimestreActif = id;` dans `changerTrimestreActif()`
    - Ajout `'groupesCours'` et `'horaires'` à `CLES_NAMESPACEES`
  - **Fichier** : `js/trimestres.js`

- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Améliorations mise en page
  - Nouvelle disposition : cours/trimestre en haut à droite, enseignant en bas à gauche
  - Fonctions refactorisées selon SST de trimestre-v2.js
  - Options simplifiées (retrait option Cours du pied de page, taille fixe "petit")
  - Marges réduites à 0.5 inch
  - Bug en cours : infos cours/enseignant non affichées (à déboguer)

### 20 janvier 2026
- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Première version fonctionnelle
  - Formulaire 2 étapes : sélection contenu → aperçu mise en page
  - Options : orientation, taille police, pied de page personnalisable (enseignant, cours, licence CC)
  - Titre inclut l'activité d'apprentissage (production.description)
  - Fichiers : export-pdf.js, index.html (modal aperçu)
- **DROPDOWN NOTE MAXIMALE (Beta 95.7)** : Reprise ciblée avec échelle dynamique
  - Champ texte → dropdown peuplé selon l'échelle de l'utilisateur
  - Fonctions : `peuplerDropdownNoteMaximaleMat()`, `peuplerDropdownPlafondNoteCiblee()`
- **ORDRE DISCIPLINES DROPDOWN** : Groupe 400 déplacé à la bonne position (après 300)
- **MESSAGE AIDE BIBLIOTHEQUE** : Guide pour édition des pratiques ajouté aux modals
- **VALEURS PAR DEFAUT JETONS** : Jetons par élève 4→2, Durée délai 7→2 jours
- **BACKLOG.md** : Fichier dédié créé pour accès rapide aux tâches
- **BACKLOG P2 ENRICHI** : 20 éléments ajoutés à docs/ROADMAP_H2026.md
  - Fiabilité : audit db.get/getSync, outil intégrité données
  - UX : clarifier artefacts, persistance Primo/Expert, dropdowns, gestion bibliothèques
  - Maintenance : changelog automatisé, checklist régression, section AIDE
  - Données : programmes d'études, ordre disciplines
- **CORRECTION SAUVEGARDE PRATIQUES** : Bug critique corrigé
  - Pratiques disparaissaient au rechargement (désync IndexedDB/localStorage)
  - Fix dans pratiques-materiel.js et wizard-pratique-v2.js
- **DROPDOWN DISCIPLINE** : Champ texte remplacé par dropdown (6 catégories)

### 19 janvier 2026
- **AIDE CONTEXTUELLE 😎** : Systeme complet de boutons d'aide en Mode Assiste
  - 15 sections : evaluations, construction (grilles, echelles, cartouches, productions, pratiques), tableau de bord, presences, reglages
  - Nouvelle section "Reflexion sur les objectifs d'apprentissage" (avant creation grilles)
  - Tutoiement systematique pour ton chaleureux et accessible
  - Ordre de configuration clarifie : Echelles → Pratiques → Grilles → Productions
  - Fichiers : aide-contextuelle.js, aide-contextuelle-contenu.js
- **MODULARISATION DESIGN SYSTEM** : Separation en 16 modules HTML
  - Index navigable design-system-index.html
  - Redirection depuis DESIGN_SYSTEM.html
  - Archive du fichier monolithique (4000+ lignes)
- **AUDIT CONFORMITE DS7** : Corrections styles.css et index.html
  - Border-radius : 3px→5px, 10px→12px, 15px→20px (utilisation variables CSS)
  - Box-shadow : rgba(0,0,0) → rgba(3,46,92) via variables CSS
  - Styles inline corriges (border-radius 4px/8px)
  - Rapport : docs/AUDIT_CONFORMITE_DS7.md
- **BADGE NB ETUDIANTS** : Uniformisation dans Vue d'ensemble et Liste
  - Mise à jour automatique au changement de groupe-cours (tableau-bord-apercu.js, trimestre-v2.js)
- **BUG VUE CALENDAIRE** : Calendrier n'affichait pas les bons jours selon groupe-cours actif
  - Causes : (1) Comparaison case-sensitive, (2) Ordre priorité dans obtenirSeancesHoraire(), (3) Logique typeFinal
  - Corrections : horaire.js (priorité entité), calendrier-vue.js (logique améliorée), saisie-presences.js, presences-apercu.js

### 11 janvier 2026
- **Separation modal Bienvenue** : Deux modals distincts ✉️ News / 😎 Introduction
- **Optimisation indices C/P** : Migration IndexedDB + calcul pratique unique
- **Compatibilite A2025** : Detection format ancien/nouveau + auto-selection groupe-cours
- **Fix db.js** : memoryCache pour QuotaExceededError

### 10 janvier 2026
- **Mode "Cours" dans dropdown entete** : Voir tous les groupes fusionnes d'un cours
  - Section "Cours (tous groupes)" dans le dropdown
  - Format : `SIGLE (X groupes)`
  - Filtrage par coursId sans filtre groupe
  - Flag `_modeCours` et `groupe: null` pour detecter le mode
- **FIX Grilles de criteres** : Modifications ne persistaient pas apres rechargement
  - Cause : grilleTemplateActuelle n'etait pas synchronisee apres modification inline
  - Solution : Synchroniser grilleTemplateActuelle dans 4 fonctions (modifierCritereGrille, deplacerHaut/Bas, supprimer)

### 9 janvier 2026
- **BUG CRITIQUE CORRIGE** : Perte donnees etudiants lors import/suppression
  - Cause : obtenirDonneesSelonMode() filtrait par coursId puis sauvegarderDonneesSelonMode() ecrasait TOUT
  - Fix : db.getSync() direct dans groupe.js (confirmerImport, supprimerEtudiant)
- **Bouton "Supprimer ce groupe"** : Permet de supprimer un groupe entier avec confirmation
- **Support format Excel** : `="valeur"` reconnu lors de l'import etudiants
- **Section AIDE mise a jour** : Documentation Beta 95.3 (workflow, Primo, import trimestre)
- **Modal bibliotheque groupe-cours** : Vue liste, Activer, Supprimer, bouton 📚
- **Syntheses intelligentes sidebars** : 5 fonctions (Cours, Enseignant, Groupe, Horaire, Groupe-cours)
- **Libelle dropdown groupe-cours** : "Groupe 00001" au lieu de "??? gr.00001" (5 endroits)
- **UX modal Echelles** : Section "Importer depuis un autre trimestre" (3 fonctions)
- **Import Productions filtrable par cours** : Dropdown filtre cours + preview
- **Harmonisation modaux** : Tous a 800px (cours, groupe-cours)
- **Nommage exports** : genererNomFichierExport() type-nom-cours-discipline-date
- **Filtres discipline** : Auto-capture depuis infoCours (echelles, grilles)
- **Audit module evaluation** : 16 548 lignes, 3 problemes critiques identifies et resolus
- **Fix #1 namespacing evaluationsSauvegardees** : 34 occurrences, 7 fichiers
- **Fix #2 integration groupe-cours** : groupeCoursId ajoute aux evaluations + logs
- **Fix #3 validations references** : Verification etudiant/production/grille avant sauvegarde
- **Compatibilite A2025** : Verifiee, donnees legacy nettoyees
- **Donnees demo (groupe 9999)** : Bug fusion corrige (sync cache avant cle())
- **Protocole mise a jour beta** : Documentation + script automatisation
- **Audit Design System v7 COMPLET** : 16 parties verifiees, toutes conformes

### 8 janvier 2026
- Consolidation entites-ui.js → trimestre-v2.js
- Correction dropdown groupe-cours (namespacing)
- Harmonisation design section Trimestre
- Persistance groupe-cours et horaire au rechargement
- Bouton suppression horaire + simplification UI
- Bouton "Voir le calendrier" dans sidebar groupe-cours
- Connexion presences avec groupe-cours (filtrage par coursId dans saisie-presences.js)
- Primo dynamique : detection config existante (enseignant, cours, trimestre)
- Correction bug Primo : creerGroupeCoursDepuisPrimo() pour que le dropdown fonctionne
- **5 dropdowns groupe-cours** : Trimestre, Cours, Groupe, Horaire, Enseignant selectionnables
- **Multi-profils enseignants** : Liste unifiee `enseignants` avec dropdown, boutons nouveau/supprimer
- Migration automatique profilEnseignant → enseignants au chargement
- **Alignement SST Primo/Trimestre** : obtenirCoursExistants() utilise listeCours + filtrage trimestre
- **Fix discipline cours** : sauvegarderCoursV2() + remplirFormCoursV2() corriges
- **Fix affichage cours** : chargerDropdownCoursV2() appelle changerCoursSelectionneV2()

### 6-7 janvier 2026
- Corrections bugs testeurs (Bruno, Olivier)
- Systeme de notification automatique
- Architecture modulaire Trimestre

### 24-27 decembre 2025
- Multi-trimestres avec namespacing
- Archivage automatique trimestres termines

---

## CONTACTS TESTEURS

| Testeur | Discipline | Derniers retours |
|---------|------------|------------------|
| Bruno V. | Chimie organique | 6 jan (bugs corriges) |
| Olivier L. | Geographie | 6 jan (bugs corriges) |

---

## LIENS UTILES

- `docs/00-START-HERE.md` - Point d'entree documentation
- `docs/ROADMAP_H2026.md` - Feuille de route et backlog
- `Design system - Modules/AUDIT_V5.md` - Reference design
- `Documentation/Changelogs/BETA_95_CHANGELOG.md` - Notes de version

---

**Derniere mise a jour** : 31 janvier 2026
