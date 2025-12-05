# Système de monitorage pédagogique - Application web

## Vue d'ensemble du projet

Application web autonome de suivi des apprentissages convertie depuis un tableur Numbers.
Permet le monitorage pédagogique avec calcul automatique d'indices prédictifs (A-C-P) et génération de diagnostics personnalisés.

**Contrainte principale** : 100% autonome, fonctionnement hors-ligne, données stockées localement (IndexedDB + localStorage cache).

---

## Architecture technique

### Stack technologique
- **Frontend** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dépendance externe)
- **Stockage** : IndexedDB (stockage principal) + localStorage (cache synchrone)
- **Capacité** : Plusieurs GB (vs 5-10 MB avec localStorage seul)
- **Compatibilité** : Navigateurs modernes (Safari, Chrome, Firefox, Edge)
- **Système d'exploitation de dev** : macOS Sequoia 15.5 (M3) / iPadOS 18.5 (M1)

### Principe architectural fondamental

**Single Source of Truth** : Chaque donnée a UNE source unique qui la génère et la stocke.
Les autres modules la **lisent** via localStorage, jamais de duplication de logique.

```
MODULE SOURCE (génère/stocke)     MODULE LECTEUR (lit/affiche)
├─ trimestre.js                   ├─ calendrier-vue.js
│  └─ calendrierComplet          │  └─ lit calendrierComplet
│                                │
├─ saisie-presences.js           ├─ tableau-bord-apercu.js
│  └─ indicesAssiduite           │  └─ lit les indices A
│                                │
└─ portfolio.js                  └─ tableau-bord-apercu.js
   └─ indicesCP                     └─ lit les indices C et P
```

**Règle d'or** : Les modules ne se parlent JAMAIS directement. Communication via localStorage uniquement.

### Système de pratiques de notation

**NOUVEAU (Beta 91)** : Architecture modulaire permettant de supporter plusieurs pratiques de notation.

**✅ Phase 2 complétée (13 novembre 2025)** : Délégation des calculs vers le registre de pratiques
- Élimination de 94% du code dupliqué dans `portfolio.js`
- Tests automatiques : 30/30 étudiants validés (100% identiques)
- Documentation : 8 documents créés (~200 pages)

**Documentation complète** :
- `ARCHITECTURE_PRATIQUES.md` : Document de référence (architecture, contrats, concepts)
- `GUIDE_AJOUT_PRATIQUE.md` : Guide opérationnel pour ajouter une pratique
- `FEUILLE_DE_ROUTE_PRATIQUES.md` : Roadmap d'implémentation
- `PHASE_2_DELEGATION_COMPLETE.md` : Détails migration Phase 2
- `VALIDATION_PHASE_2.md` : Rapport final tests

**Principes** :
- **Universel** : A-C-P-E (Engagement), niveaux RàI → identiques pour toutes les pratiques
- **Spécifique** : Calcul de P, détection défis, cibles RàI → propre à chaque pratique
- **Interface** : Chaque pratique implémente le contrat `IPratique`
- **Séparation** : portfolio.js orchestre, pratiques calculent (Single Source of Truth)

**Pratiques implémentées** :
- PAN-Maîtrise (Grégoire) : Échelle IDME, critères configurables, N derniers artefacts
- Sommative : Moyenne pondérée, toutes évaluations, défis génériques

**✅ SYSTÈME 100% UNIVERSEL (3 décembre 2025)** : Critères d'évaluation configurables
- **Avant** : Critères SRPNF codés en dur dans le code
- **Après** : N'importe quelle grille de critères peut être utilisée
- **Impact** : Un utilisateur peut créer ses propres critères (ex: Créativité, Analyse, Synthèse)
- **Fonctionnalités universelles** :
  * Détection automatique des critères depuis la grille de référence
  * Calcul des moyennes avec regex dynamique
  * Détection forces/défis pour n'importe quels critères
  * Patterns et diagnostics universels
  * Interventions RàI configurables avec fallback générique intelligent

**Pratiques futures** :
- PAN-Spécifications : Pass/fail sur objectifs
- Dénotation (Ungrading) : Sans notes chiffrées

**Fichiers clés** :
```
js/pratiques/
├── pratique-interface.js        # Documentation du contrat IPratique
├── pratique-registre.js         # Registre central (détection auto)
├── pratique-pan-maitrise.js     # PAN-Maîtrise (IDME + SRPNF)
└── pratique-sommative.js        # Sommative traditionnelle

Flux de données (Phase 2) :
portfolio.js
    ↓ appelle
obtenirPratiqueParId('sommative' | 'pan-maitrise')
    ↓ retourne instance
pratique.calculerPerformance(da)
pratique.calculerCompletion(da)
    ↓ retourne 0-1 (décimal)
portfolio.js convertit 0-100 et stocke dans indicesCP
```

### Architecture de stockage hybride IndexedDB

**✅ IMPLÉMENTÉ (Beta 91.1)** : Migration localStorage → IndexedDB avec cache hybride (25-26 novembre 2025)

**Principe** : IndexedDB comme stockage persistant asynchrone + localStorage comme cache synchrone rapide.

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION (30 modules)                  │
│                  db.getSync() / db.setSync()                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │    db.js      │
                   │  (API unique) │
                   └───────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌───────────────┐           ┌──────────────────┐
    │ localStorage  │           │    IndexedDB     │
    │  (Cache sync) │◄─────────►│ (Storage async)  │
    │   Accès: 0ms  │  Sync     │  Accès: ~10ms    │
    └───────────────┘           └──────────────────┘
```

**Bénéfices** :
- **Capacité** : 5-10 MB (localStorage) → Plusieurs GB (IndexedDB)
- **Performance** : Accès synchrone via cache localStorage (0ms)
- **Compatibilité** : 100% des modules inchangés (API identique)
- **Résilience** : Fallback automatique si IndexedDB indisponible
- **Futur** : Base pour support multi-groupes (Beta 92+)

**Fichier clé** :
- `js/db.js` (450 lignes) : Gestionnaire unifié de stockage
- API publique : `db.getSync()`, `db.setSync()`, `db.removeSync()`, `db.keys()`
- API interne : `db.get()`, `db.set()`, `db.remove()`, `db.clear()`
- Synchronisation : `db.syncToLocalStorageCache()` au démarrage
- Événement : `'db-ready'` émis après synchronisation initiale

**Documentation complète** : `INDEXEDDB_ARCHITECTURE.md`

**Statistiques migration** :
- 38 commits (20 lundi + 18 mardi)
- 10 bugs corrigés (double parsing, fonctions manquantes, etc.)
- 37 fichiers modifiés (+1966 lignes, -682 lignes)
- 0 modules modifiés pour l'API (compatibilité totale)

**Version** : v0.91.1-indexeddb (tag Git créé 26 novembre 2025)

---

## Structure des fichiers

```
projet/
├── index 92.html                            # Point d'entrée actuel (Beta 92)
├── index 91.html                            # Beta 91 (archivé - Import/Export config complète)
├── index 90 (architecture).html             # Beta 90.5 (archivé - présentation 19 nov 2025)
├── css/
│   └── styles.css                        # Styles globaux + variables CSS pratiques
├── js/
│   ├── config.js                         # ⚠️ PROTÉGÉ - Configuration globale
│   ├── navigation.js                     # ⚠️ PROTÉGÉ - Gestion navigation
│   ├── main.js                           # Initialisation
│   ├── db.js                             # ✅ NOUVEAU (Beta 91.1) - Gestionnaire de stockage hybride
│   │
│   ├── primo-accueil.js                  # 🆕 NOUVEAU (Beta 92) - Modal d'accueil Primo
│   ├── primo-modal.js                    # 🆕 NOUVEAU (Beta 92) - Configuration conversationnelle
│   ├── primo-questions.js                # 🆕 NOUVEAU (Beta 92) - Questions structurées Primo
│   ├── tutoriel-interactif.js            # 🆕 NOUVEAU (Beta 92) - Tutoriel guidé 7 étapes
│   │
│   ├── pratiques/                        # 🆕 SYSTÈME DE PRATIQUES (Beta 91)
│   │   ├── pratique-interface.js         # Documentation contrat IPratique
│   │   ├── pratique-registre.js          # Registre et sélection pratique
│   │   ├── pratique-pan-maitrise.js      # PAN-Maîtrise (IDME + SRPNF)
│   │   └── pratique-sommative.js         # Sommative traditionnelle
│   │
│   ├── trimestre.js                      # ✅ SOURCE - Calendrier complet
│   ├── calendrier-vue.js                 # ✅ LECTEUR - Affichage calendrier
│   ├── saisie-presences.js               # ✅ SOURCE - Indices assiduité (A)
│   ├── tableau-bord-apercu.js            # ✅ LECTEUR - Affichage tableau de bord
│   ├── profil-etudiant.js                # ✅ LECTEUR - Profil individuel complet
│   │
│   ├── etudiants.js                      # Gestion étudiants
│   ├── productions.js                    # Productions/évaluations
│   ├── portfolio.js                      # ✅ SOURCE - Indices C et P
│   ├── grilles.js                        # Grilles de critères SRPNF
│   ├── echelles.js                       # Échelle IDME (SOLO)
│   ├── cartouches.js                     # Cartouches de rétroaction
│   ├── horaire.js                        # Horaire des séances
│   ├── groupe.js                         # Liste des étudiants
│   ├── cours.js                          # Informations du cours
│   ├── pratiques.js                      # Configuration pratiques de notation
│   ├── import-export.js                  # Import/export JSON
│   └── statistiques.js                   # Calculs statistiques
│
├── materiel-demarrage.json               # 🆕 NOUVEAU (Beta 92) - Matériel pédagogique de base
│
├── CLAUDE.md                             # Ce fichier
├── README_PROJET.md                      # Documentation projet
├── COLLAB_RULES.txt                      # Règles de collaboration
├── noms_stables.json                     # Registre des noms protégés
├── structure-modulaire.txt               # Documentation architecture
│
├── ARCHITECTURE_PRATIQUES.md             # 🆕 Architecture système pratiques (Beta 91)
├── GUIDE_AJOUT_PRATIQUE.md               # 🆕 Guide pour ajouter une pratique
├── FEUILLE_DE_ROUTE_PRATIQUES.md         # 🆕 Roadmap implémentation pratiques
├── INDEXEDDB_ARCHITECTURE.md             # ✅ Architecture stockage hybride (Beta 91.1)
├── BETA_92_CHANGELOG.md                  # 🆕 Changelog complet Beta 92 (Primo + Import/Export CC)
└── PLAN_TESTS_BETA_92.md                 # 🆕 Plan de tests systématique Beta 92
```

---

## Système de monitorage : concepts pédagogiques

### Les trois indices primaires (A-C-P)

**Assiduité (A)** : Présence en classe
- Mesure l'engagement cognitif
- Source : `saisie-presences.js` → `localStorage.indicesAssiduiteDetailles`

**Complétion (C)** : Remise des travaux
- Mesure la mobilisation
- Source : `portfolio.js` → `localStorage.indicesCP`

**Performance (P)** : Qualité des productions
- Mesure la maîtrise
- Source : `portfolio.js` → `localStorage.indicesCP`

### Critères d'évaluation SRPNF

- **Structure** (15%) : Organisation logique des idées
- **Rigueur** (20%) : Exhaustivité des observations
- **Plausibilité** (10%) : Crédibilité de l'interprétation
- **Nuance** (25%) : Qualité du raisonnement
- **Français** (30%) : Maîtrise linguistique

### Taxonomie SOLO et échelle IDME

| SOLO | IDME | Score | Compréhension |
|------|------|-------|---------------|
| Préstructurel | **I**nsuffisant | < .40 | Incompréhension |
| Unistructurel | **I**nsuffisant | < .64 | Superficielle |
| Multistructurel | **D**éveloppement | .65-.74 | Points pertinents sans liens |
| Relationnel | **M**aîtrisé | .75-.84 | Compréhension globale avec liens |
| Abstrait étendu | **E**tendu | >= .85 | Transfert à autres contextes |

---

## Standards de code CRITIQUES

### ⚠️ ZONES STRICTEMENT PROTÉGÉES

**INTERDICTION ABSOLUE de modifier** (sauf commentaires) :

1. **config.js** : Configuration navigation, variables globales, `configurationsOnglets`
2. **navigation.js** : Logique de navigation sections/sous-sections
3. **Noms dans noms_stables.json** : IDs, classes CSS, fonctions listées

### Conventions de nommage (à respecter)

**Fonctions** :
```javascript
// ✅ BON - Préfixes descriptifs cohérents
genererCalendrierComplet()      // Génère des données
obtenirInfosJour(date)          // Récupère des données
calculerIndicesAssiduité()      // Calcule des valeurs
afficherTableauBord()           // Affichage visuel
formaterDateTrimestreYMD(date)  // Formatage avec contexte

// ❌ MAUVAIS - Conflits de noms génériques
formaterDate()  // Trop générique, conflits entre modules
getInfo()       // Non descriptif
process()       // Ambigu
```

**Variables localStorage** :
```javascript
// Format : nomModule + TypeDonnees
localStorage.calendrierComplet            // trimestre.js
localStorage.indicesAssiduiteDetailles    // saisie-presences.js
localStorage.indicesCP                     // portfolio.js (à créer)
localStorage.seancesCompletes             // horaire.js (futur)
```

**Classes CSS** :
```css
// Réutiliser les classes existantes
.item-carte                  // Conteneur carte
.item-carte-header          // En-tête de carte
.item-carte-body            // Corps de carte
.statut-badge               // Badge de statut
.statistique-item           // Item statistique
```

**Règles des boutons (styles.css:1302-1324)** :
```css
/* RÈGLE AUTOMATIQUE appliquée depuis Beta 79 */
/* Les boutons DANS les cartes/listes/formulaires sont automatiquement compacts */
/* Les boutons HORS contexte (actions principales) restent standards */

✅ Compacts automatiquement (6px 12px, 0.85rem) :
- Boutons dans .carte
- Boutons dans #listeCriteres, #tableauEvaluationsContainer
- Boutons dans [id*="liste"] ou [id*="tableau"]
- Boutons dans divs avec background: white ou var(--bleu-tres-pale)
- Exemples: "Modifier", "Supprimer" dans les items

✅ Standards (10px 20px, 0.95rem) :
- Boutons au niveau racine d'une sous-section
- Boutons d'actions principales
- Exemples: "Voir les grilles existantes", "Dupliquer cette grille", "Sauvegarder"

⚠️ Exceptions :
- .btn-large : Force taille grande (12px 24px)
- .btn-tres-compact : Force taille très petite (4px 10px)
```

### Workflow de modification

**AVANT toute modification** :
1. ✅ Sauvegarder (commit Git ou copie manuelle)
2. ✅ Vérifier `noms_stables.json`
3. ✅ Lire la doc du module concerné
4. ✅ Identifier la zone `<!-- LLM:OK_TO_EDIT -->`

**PENDANT la modification** :
1. ✅ Patch minimal uniquement
2. ✅ Respecter le style existant
3. ✅ Pas de renommage d'éléments existants
4. ✅ Commenter les ajouts importants

**APRÈS la modification** :
1. ✅ Test immédiat dans Safari/Chrome
2. ✅ Vérifier la console (erreurs JS)
3. ✅ Tester le flux complet utilisateur
4. ✅ Commit si succès, rollback si échec

---

## État actuel du projet (octobre-novembre 2025)

### ✅ Fonctionnalités complétées

**MODULE trimestre.js** (Commit 1 - complété)
- Génération du `calendrierComplet` (124 jours)
- API : `obtenirCalendrierComplet()` et `obtenirInfosJour(date)`
- Gestion congés prévus/imprévus et reprises
- Calcul automatique des semaines (5 jours cours = 1 semaine)
- Interface admin complète

**MODULE calendrier-vue.js** (Commit 2 - complété)
- Lecture seule de `calendrierComplet`
- Affichage visuel du calendrier
- Suppression du code mort (recalculs)

**MODULE saisie-presences.js** (Session 20 octobre - complété)
- Calcul des indices A (assiduité)
- Stockage dans `indicesAssiduiteDetailles`
- Périodes configurables (3, 7, 12 derniers artefacts)

**MODULE tableau-bord-apercu.js** (Session 20 octobre - complété)
- Affichage des indices A
- Lecture depuis `indicesAssiduiteDetailles`
- Rechargement automatique

**MODULE profil-etudiant.js** (Session 24 octobre - refonte complète)
- Layout 2 colonnes : sidebar de navigation + zone de contenu principale
- Navigation Précédent/Suivant entre étudiants (boutons centrés)
- 3 sections structurées :
  1. Suivi de l'apprentissage (engagement E, patterns, niveaux RàI)
  2. Développement des habiletés et compétences (performance SRPNF)
  3. Mobilisation (assiduité, complétion, artefacts)
- Système d'interprétation harmonisé (seuils A/C/M : 70%, 80%, 85%)
- Échelle de risque avec gradient 6 niveaux et indicateur de position
- Toggles uniformes pour détails techniques et formules
- Badges épurés sans icônes redondantes
- Recommandations RàI selon niveau de risque
- Diagnostic SRPNF avec forces et défis identifiés

**MODULE styles.css** (Session 24 octobre - améliorations accessibilité)
- État `.btn:disabled` avec opacité et curseur appropriés
- Pseudo-classe `:hover:not(:disabled)` sur tous les boutons
- Amélioration accessibilité navigation (boutons désactivés visuellement distincts)

**MODULE portfolio.js** (Session 24 octobre - implémentation Single Source of Truth)
- Calcul et stockage des indices C (Complétion) et P (Performance)
- Structure `localStorage.indicesCP` avec historique longitudinal
- API : `calculerEtStockerIndicesCP()`, `obtenirIndicesCP(da)`, `obtenirHistoriqueIndicesCP(da)`
- Déclencheurs automatiques lors des évaluations et sélections d'artefacts
- Sélection automatique des N meilleurs artefacts (PAN)
- Adaptation des lecteurs (profil-etudiant.js, tableau-bord-apercu.js)

**CORRECTIONS IMPORTANTES** (Session 24 octobre)
- ✅ Harmonisation des seuils d'interprétation A/C/M (incohérence "75% = bon vs fragile" corrigée)
- ✅ Réduction redondance affichage indice C (3 occurrences → 1)
- ✅ Suppression bouton "Retour à la liste" dupliqué dans index 71
- ✅ Mise à jour Documentation profil-etudiant.md (1218 → 3696 lignes)
- ✅ Mise à jour Documentation Style CSS.md (Beta 0.50 → 0.55)

**MODULE horaire.js** (Session 25 octobre - complété)
- Génération de `seancesCompletes` comme source unique
- API : `genererSeancesCompletes()` et `obtenirSeancesCompletes()`
- Gestion des reprises (ex: «Horaire du lundi» le jeudi)
- Calcul automatique des séances avec calendrierComplet
- Interface de configuration complète

**MODULE productions.js** (Session 25 octobre - complété)
- Gestion complète des productions et évaluations
- Support portfolios, artefacts, pondérations
- API : `afficherTableauProductions()`, `sauvegarderProduction()`, `initialiserModuleProductions()`
- Lien avec grilles de critères (grillesTemplates)
- Verrouillage et réorganisation des évaluations
- Calcul automatique de la pondération totale

**SECTION AIDE** (Session 25 octobre - Phase 1 et 2 complétées)
- 5 sous-sections implémentées (Introduction, Configuration, Utilisation, Consultation, Référence)
- Harmonisation CSS complète (classes .tableau, .alerte-*, .carte-titre-bleu)
- Suppression de tous les emojis (72 total)
- Utilisation des guillemets français «...»
- Titres avec fond bleu dégradé pour meilleure structure visuelle
- FAQ avec 13 questions en 3 catégories (monitorage, technique, usage)
- Glossaire avec 45 termes techniques (A-V alphabétiquement)
- Guide détaillé du profil étudiant avec exemples et workflows

**IMPLÉMENTATION SUPPORT SOM-PAN HYBRIDE** (Session 26 octobre - Beta 1.0)
- ✅ **Fichier** : `index 72 (support SOM-PAN hybride).html` - Version Beta 1.0
- ✅ **Types formatifs** : Ajout de `examen-formatif`, `travail-formatif`, `quiz-formatif`, etc. avec organisation par `<optgroup>`
- ✅ **Fonctions helpers** dans `portfolio.js` :
  - `obtenirModePratique()` : Détecte 'SOM' ou 'PAN' depuis `localStorage.modalitesEvaluation`
  - `comptesDansDepistage(production, mode)` : Filtre les productions selon le mode
  - `convertirNiveauEnPourcentage(niveau, echelleId)` : Convertit IDME en %
- ✅ **Calcul dual** dans `calculerEtStockerIndicesCP()` :
  - Calcule TOUJOURS SOM **ET** PAN simultanément
  - Structure : `indicesCP[da].actuel = { SOM: {C, P, details}, PAN: {C, P, details} }`
  - Filtrage SOM : examen, travail, quiz, presentation, autre (exclut formatifs)
  - Filtrage PAN : artefact-portfolio uniquement
  - P_som : Moyenne pondérée provisoire
  - P_pan : Moyenne des N meilleurs artefacts
- ✅ **Adaptation lecteurs** :
  - `profil-etudiant.js` : `calculerTousLesIndices(da, pratique)` lit la branche appropriée
  - `tableau-bord-apercu.js` : `calculerIndicesEtudiant(da)` lit SOM et PAN séparément
  - API : `obtenirIndicesCP(da, 'SOM')` ou `obtenirIndicesCP(da, 'PAN')`
- ✅ **Bénéfices** :
  - Permet comparaison expérimentale des deux pratiques
  - Dépistage A-C-P-E (Engagement) fonctionne dans les deux modes
  - Checkboxes contrôlent l'affichage, pas le calcul

**REFONTE COMPLÈTE AFFICHAGE HYBRIDE SOM-PAN** (Session 26 octobre suite - Beta 72)
- ✅ **Fichier** : `index 72 (support SOM-PAN hybride).html` - Version Beta 72
- ✅ **Variables CSS ajoutées** dans `styles.css` :
  - `--som-orange: #ff6f00` (couleur SOM)
  - `--pan-bleu: #0277bd` (couleur PAN)
  - `--hybride-violet: #9c27b0` (couleur mode hybride, réservé pour futur usage)
- ✅ **Module tableau-bord-apercu.js** - Refonte complète :
  - **Design unifié** : 4 sections (Indicateurs globaux, Risque d'échec, Patterns, RàI)
  - **Valeurs colorées** : Orange (#ff6f00) pour SOM, Bleu (#0277bd) pour PAN
  - **Mode normal** : Badge simple [SOM] ou [PAN] sans checkboxes
  - **Mode comparatif** : Checkboxes interactives pour basculer entre vues
  - **Fonctions helper** réutilisables :
    * `genererCarteMetrique(label, valeurSom, valeurPan, ...)` - Indicateurs globaux
    * `genererCarteRisque(label, valeurSom, valeurPan, ...)` - Risque d'échec
    * `genererCartePattern(label, valeurSom, valeurPan, ...)` - Patterns (sans barres)
    * `genererCarteRaI(label, description, valeurSomPct, valeurPanPct, ...)` - RàI
  - **Fonction** `genererIndicateurPratiqueOuCheckboxes()` :
    * Détecte mode comparatif vs mode normal
    * Génère soit badge informatif soit checkboxes selon le contexte
  - **Suppression** : Fonctions `afficherPatternsHybride()` et `afficherRaIHybride()` (code mort)
  - **Layout** : Label à gauche, valeurs colorées à droite (label-left, values-right)
  - **Barres de progression** : Retirées de la section Patterns (redondance)
- ✅ **Module pratiques.js** - Interface simplifiée :
  - **Une seule checkbox** : "Activer le mode comparatif (expérimental)"
  - **Mode normal** (checkbox non cochée) :
    * Pratique = 'sommative' → afficherSommatif=true, afficherAlternatif=false
    * Pratique = 'alternative' → afficherSommatif=false, afficherAlternatif=true
  - **Mode comparatif** (checkbox cochée) :
    * Quelle que soit la pratique → afficherSommatif=true, afficherAlternatif=true
  - **Fonction** `sauvegarderOptionsAffichage()` : Logique simplifiée basée sur une checkbox
  - **Fonction** `chargerModalites()` : Détecte automatiquement mode comparatif
  - **Suppression** : 2 checkboxes séparées (afficherSommatif, afficherAlternatif)
- ✅ **Documentation corrigée** dans `index 72.html` :
  - **Tableau IDME** : Scores sur 4 → Pourcentages (< 64%, 65-74%, 75-84%, ≥ 85%)
  - **Description artefacts** : "Note sur 4" → "Pourcentage selon l'échelle IDME"
  - **Forces/Défis** : ≥ 2.85 et < 2.85 → ≥ 75% et < 75%
  - **Blocage émergent** : Performance ≤ 2.0 → Assiduité ≥ 75% mais C ou P < 65%
  - **Blocage critique** : Performance ≤ 1.5 → Risque d'échec > 70% (formule: 1 - A×C×P)
- ✅ **Expérience utilisateur** :
  - Interface épurée sans badges "Hybride" redondants
  - Identification claire de la pratique en mode normal
  - Contrôles intuitifs en mode comparatif
  - Validation : au moins une pratique doit rester affichée
- ✅ **Commits créés** :
  1. Refonte complète du système d'affichage hybride SOM-PAN (11 fichiers)
  2. Correction de l'aide: échelle IDME en pourcentages (1 fichier)
  3. Mise à jour version Beta 72 (2 fichiers)

**SYSTÈME D'IMPORT/EXPORT MATÉRIEL PÉDAGOGIQUE** (Session 28 octobre - Beta 75)
- ✅ **Fichier** : `index 75 (import-export matériel pédagogique).html` - Version Beta 75
- ✅ **Objectif** : Faciliter la collaboration entre enseignant·es et le partage de matériel pédagogique
- ✅ **Fonctionnalités d'export/import JSON** :
  - **Productions** : Boutons 📤📥 dans Matériel → Productions
    * Export : `productions-YYYY-MM-DD.json`
    * Contient : artefacts, pondérations, liens avec grilles
  - **Grilles de critères** : Boutons 📤📥 dans Matériel → Critères d'évaluation
    * Export : `grilles-criteres-YYYY-MM-DD.json`
    * Contient : critères SRPNF, pondérations, descriptions
  - **Échelles de performance** : Boutons 📤📥 dans Matériel → Niveaux de performance
    * Export : `echelle-performance-YYYY-MM-DD.json`
    * Contient : niveaux IDME, seuils, descriptions
  - **Cartouches de rétroaction** : Boutons 📤📥 dans Matériel → Rétroactions
    * Export : `cartouches-retroaction-YYYY-MM-DD.json`
    * Contient : commentaires prédéfinis par critère et niveau
    * **NOUVEAU** : Import spécial depuis fichiers .txt Markdown
- ✅ **Module cartouches.js** - Nouvelles fonctions :
  - `exporterCartouches()` : Compile toutes les cartouches (toutes grilles) en un seul fichier
  - `importerCartouches(event)` : Importe et fusionne avec cartouches existantes
  - `importerCartoucheDepuisTxt(event)` : Import depuis fichier .txt Markdown (format spécial)
    * Permet de rédiger commentaires dans éditeur externe (Word, Google Docs)
    * Format : `## CRITÈRE` puis `**CRITÈRE (NIVEAU)** : Commentaire`
    * Validation : noms de critères doivent correspondre exactement
- ✅ **Interface utilisateur** :
  - Boutons d'export/import dans chaque section de matériel pédagogique
  - IDs uniques pour éviter conflits : `-local` suffix
  - Codes couleur distincts par type :
    * Productions : 🟢 Vert (`#f1f8e9`)
    * Grilles : 🟠 Orange (`#fff8f0`)
    * Échelles : 🔵 Bleu clair (`#f0f8ff`)
    * Cartouches : 🔵 Bleu foncé (`#e3f2fd` pour .txt)
  - Note d'avertissement pour import .txt : correspondance exacte des noms requis
- ✅ **Section Réglages → Import/Export clarifiée** :
  - Carte informative expliquant la différence entre :
    * **Backup complet** (boutons modaux) : toutes les données d'application
    * **Export partiel** (boutons sections) : matériel pédagogique seulement
  - Préserve la fonctionnalité critique de backup complet
- ✅ **Section Aide enrichie** :
  - **Nouvelle carte "5. Collaboration entre collègues"** dans Utilisation hebdomadaire
  - 4 scénarios de collaboration documentés :
    1. Harmonisation départementale
    2. Mentorat et formation
    3. Réutilisation entre sessions
    4. Communautés de pratique
  - Explication des formats JSON vs .txt Markdown
  - Note de confidentialité : exports ne contiennent JAMAIS de données étudiants
  - Flux typique de partage illustré (5 étapes)
- ✅ **Package de démonstration enrichi** :
  - `donnees-demo.json` : Ajout de `cartouches_grille-srpnf`
  - Cartouche complète "A2 Description d'un personnage" (16 commentaires)
  - Commentaires réalistes pour 4 critères × IDME (Structure, Rigueur, Plausibilité, Nuance)
  - Tutoiement et approche constructive avec suggestions concrètes d'amélioration
- ✅ **Fichiers de démonstration pour testeurs** :
  - `etudiants-demo.txt` : 30 étudiants groupe TEST
  - `etudiants-demo-groupe9999.txt` : 30 étudiants groupe 9999
  - Diversité culturelle : 80% noms québécois, 20% multiculturels
  - 10 codes de programmes différents
  - 13% avec Services Adaptés (SA)
- ✅ **Bénéfices pédagogiques** :
  - Réduction du temps de préparation initiale
  - Harmonisation des pratiques départementales
  - Mutualisation des efforts de création de matériel
  - Facilite le mentorat et la transmission de bonnes pratiques
  - Conservation et amélioration continue du matériel entre sessions
- ✅ **Protection vie privée** :
  - Exports JSON contiennent UNIQUEMENT le matériel pédagogique réutilisable
  - Aucune donnée confidentielle exportée (noms, DA, notes, présences)
  - Partage sécuritaire entre collègues

**CORRECTIFS CRITIQUES** (Session 28 octobre - Beta 77)
- ✅ **Fichier** : `index 77 (correctifs critiques).html` - Version Beta 77
- ✅ **Bugs corrigés** : Deux bugs bloquants lors de l'import de `donnees-demo.json`

**Bug #1 : Corruption de données (import-export.js)**
- ✅ **Symptômes** : Erreurs `JSON.parse: unexpected character at line 1 column 2` (multiples)
- ✅ **Cause racine** : Dans `js/import-export.js` ligne 192
  - Code buggé : `localStorage.setItem(cle, donneesImportEnAttente[cle])`
  - Problème : `donneesImportEnAttente[cle]` est déjà un objet JavaScript (parsed JSON)
  - Résultat : localStorage.setItem() convertit avec `.toString()` → `"[object Object]"`
  - Conséquence : Impossible de parser les données corrompues
- ✅ **Correctif appliqué** (lignes 191-198) :
  ```javascript
  Object.keys(donneesImportEnAttente).forEach(cle => {
      // IMPORTANT : Convertir en JSON string avant de sauvegarder dans localStorage
      const valeur = typeof donneesImportEnAttente[cle] === 'string'
          ? donneesImportEnAttente[cle]
          : JSON.stringify(donneesImportEnAttente[cle]);
      localStorage.setItem(cle, valeur);
      nbCles++;
  });
  ```

**Bug #2 : Export fonction inexistante (groupe.js)**
- ✅ **Symptômes** : Erreur `ajouterEtudiant is not defined` (groupe.js:887)
- ✅ **Cause racine** : Dans `js/groupe.js` ligne 887
  - Code buggé : `window.ajouterEtudiant = ajouterEtudiant;`
  - Problème : La fonction `ajouterEtudiant` n'existe pas dans le fichier
  - Résultat : ReferenceError lors du chargement du module
  - Note : La fonction `addStudent()` existe et peut être utilisée à la place
- ✅ **Correctif appliqué** (ligne 887) :
  ```javascript
  // window.ajouterEtudiant = ajouterEtudiant; // FIXME: fonction n'existe pas - utiliser addStudent() à la place
  ```

- ✅ **Impact** : Bugs bloquants corrigés, import de `donnees-demo.json` fonctionne maintenant
- ✅ **Package mis à jour** : `Monitorage_Beta_0.77.zip` (318 Ko) prêt pour distribution

**AJOUT BOUTON SOUTIEN** (Session 28 octobre - Beta 78)
- ✅ **Fichier** : `index 78 (bouton soutien).html` - Version Beta 78
- ✅ **Nouvelle fonctionnalité** : Bouton "Soutenir le projet" dans l'en-tête
- ✅ **Emplacement** : Partie gauche de l'en-tête, sous "Réfléchir, expérimenter, partager"
- ✅ **Lien** : https://codexnumeris.org/#/portal/support (Ghost/Stripe)
- ✅ **Style** : Bouton orange discret mais visible avec effet hover
  - Couleur : `--orange-accent` (#ff6b35)
  - Effet hover : élévation visuelle (translateY -2px)
  - Ombre portée : 0 2px 8px avec transition smooth
- ✅ **CSS** : Classe `.btn-soutien` (lignes 445-469)
- ✅ **Objectif** : Permettre aux utilisateurs de soutenir financièrement le développement du projet

**OPTIMISATION INTERFACE** (Session 29 octobre - Beta 79)
- ✅ **Fichier** : `index 79 (optimisation espace).html` - Version Beta 79
- ✅ **Grilles de critères** : Format compact (~70% d'espace gagné)
  - Vue hiérarchique par défaut avec tous critères visibles
  - Mode édition dédié (clic sur «✏️ Éditer la grille»)
  - Bouton «← Retour à la vue d'ensemble» pour navigation fluide
  - Descriptions repliables (clic sur «Voir la description»)
  - Barre bleue à gauche pour identification visuelle
- ✅ **Productions** : Format compact (~50% d'espace gagné)
  - Format 2 lignes maximum
  - Métadonnées inline avec séparateurs «•»
  - Codes couleur par type (🟠 Orange sommative, 🔵 Bleu portfolio, ⚪ Gris artefacts)
  - Icônes contextuelles (📌 objectif, ✏️ tâche, 📦 artefacts)
- ✅ **Package testeurs** : `Monitorage_Beta_0.79.zip` avec guides

**AUDIT ET PLANIFICATION** (Session 30 octobre - Beta 80)
- ✅ **Fichier** : `index 80 (phase 1 préparation).html` - Version Beta 80
- ✅ **Audit complet** : `AUDIT_FONCTIONNALITES_2025-10-30.md`
  - Analyse détaillée 72% de complétude
  - Comparaison systématique avec Guide de monitorage (36 pages)
  - Identification gaps critiques (jetons, cartouches, matrice évaluation, graphiques)
- ✅ **Plan de match** : `PLAN_DE_MATCH_2025-10-30.md`
  - Roadmap structurée en 4 phases vers version 1.0
  - PHASE 1 : Consolidation (2-3 semaines) → Beta 85
  - PHASE 2 : Enrichissement (3-4 semaines) → Beta 0.95
  - PHASE 3 : Optimisation (2-3 semaines) → Version 1.0
  - PHASE 4 : Analyses avancées (Post-1.0)
- ✅ **Documentation** : `NOTES_VERSION_0.80.md`

**SEUILS CONFIGURABLES ET AFFICHAGE ÉPURÉ** (Session 31 octobre - Beta 83)
- ✅ **Fichier** : `index 83 (seuils configurables).html` - Version Beta 83
- ✅ **Configuration des seuils d'interprétation** :
  - Interface de personnalisation dans Réglages › Pratique de notation
  - Trois niveaux configurables : Fragile, Acceptable, Bon (par défaut 70%, 80%, 85%)
  - Validation en temps réel pour empêcher seuils incohérents
  - Recalcul automatique de tous les diagnostics et niveaux RàI
  - Impact sur couleurs, recommandations, et alertes de patterns
- ✅ **Affichage épuré section Mobilisation** :
  - Descriptions au lieu de noms de productions ("Carte mentale" vs "Artefact 3")
  - Notes simplifiées : `52.5` au lieu de `52.5/100`
  - Heures d'absence en fraction : `2/3` au lieu de `(2h manquées)`
  - Uniformisation complète de tous les formats
- ✅ **Descriptions de productions partout** :
  - Profil étudiant (sections Performance et Mobilisation)
  - Portfolio (sélection des artefacts)
  - Productions (formulaire d'ajout)
  - Détails de calcul (artefacts retenus pour indice P)
- ✅ **Fichiers modifiés** : `profil-etudiant.js`, `portfolio.js`, `productions.js`
- ✅ **Documentation** : `NOTES_VERSION_0.83.md`

**INTERVENTIONS RÀI ET OPTIMISATIONS** (Session 1er novembre - Beta 85)
- ✅ **Fichier** : `index 85 (interventions).html` - Version Beta 85
- ✅ **Cartes métriques uniformisées** :
  - Format standard appliqué: texte à gauche, données à droite
  - Utilisation classes CSS `.carte-metrique-standard` et `.carte-metrique-bleue`
  - Suppression de tous les styles inline
  - Nouvelle règle CSS pour pourcentages (0.75rem, gris)
  - Cartes: Risques faibles, RàI Niveau 1/2/3
- ✅ **Affichage noms complets de programmes** :
  - Fonction `obtenirNomProgramme()` exportée
  - "200.B1" devient "Sciences de la nature"
  - Support 40+ programmes réseau collégial
- ✅ **Optimisation profil étudiant** :
  - Barre latérale compacte (données supprimées)
  - Élimination barre de défilement verticale
  - "Rapport" déplacé après "Accompagnement"
- ✅ **Correctifs critiques** :
  - Exports fonctions inexistantes (echelles.js, cartouches.js, groupe.js)
  - Crash chargement liste étudiants (élément DOM manquant)
  - Fonctions non exportées vers window
- ✅ **Refactorisation majeure** :
  - Renommage `etudiants-ameliore.js` → `etudiants.js`
  - Ancien `etudiants.js` archivé (Archives/etudiants.js.old)
  - Code nettoyé et organisé
- ✅ **Fichiers modifiés** : 10 fichiers, ~1500 lignes ajoutées
- ✅ **Bugs corrigés** : 5 (ReferenceError, crash DOM, exports)
- ✅ **Documentation** : `NOTES_VERSION_0.85.md`

**CORRECTIFS ABSENCES MOTIVÉES RÀI ET AMÉLIORATIONS UX** (Session 3 novembre - Beta 88)
- ✅ **Fichier** : `index 88 (améliorations usage).html` - Version Beta 88
- ✅ **Correctifs système absences motivées** :
  - Préservation flag `facultatif: true` lors enregistrement présences (saisie-presences.js:1040-1074)
  - Les absences motivées RàI restent en couleur ambre après modification
  - Les taux d'assiduité ne pénalisent plus les absences motivées (100% préservé)
  - Synchronisation automatique interventions → présences (interventions.js:1064-1068)
  - Modifications d'étudiants dans interventions propagées automatiquement
  - Rechargement automatique du tableau présences via MutationObserver (saisie-presences.js:1540-1576)
- ✅ **Améliorations UX** :
  - Persistance du filtre de recherche lors navigation entre dates (saisie-presences.js:1481, 710-716)
  - Le nom recherché reste actif en cliquant sur Précédent/Suivant
  - Total heures inclut maintenant la séance actuelle (saisie-presences.js:881-882, 1002-1007)
  - Affichage intuitif: Alya (38.0h) vs Loïc (36.0h) selon présence/absence
  - Mise à jour dynamique du total lors modification heures
- ✅ **Workflow validé de bout en bout** :
  - Créer intervention RàI → Marquer complétée → Transfert auto vers présences
  - Modifier participants → Mise à jour auto des présences sans rechargement manuel
  - Enregistrer présences → Flag facultatif préservé → Assiduité correcte
  - Navigation dates → Filtre recherche persistant → Rechargement auto tableau
- ✅ **Fichiers modifiés** : 3 fichiers (interventions.js, saisie-presences.js, styles.css)
- ✅ **Statistiques** : 168 insertions, 1367 suppressions
- ✅ **Bugs corrigés** : 3 bugs critiques système absences motivées
- ✅ **Documentation** : `NOTES_VERSION_0.88.md`

**SUPPORT NIVEAU "0" ET AMÉLIORATIONS INTERFACE** (Session 4 novembre - Beta 89)
- ✅ **Fichier** : `index 89 (correctif échelles).html` - Version Beta 89
- ✅ **Nouvelle fonctionnalité : Niveau "0" dans échelle IDME** :
  - Support complet échelles à 5 niveaux (0, I, D, M, E)
  - Niveau "0" (Aucun/Nul) pour gérer plagiat ou utilisation IA non autorisée
  - Configuration : Code=0, Nom=Aucun, Min=0, Max=0, Valeur=0
  - Cas d'usage : Travail non original, non recevable pour évaluation
- ✅ **Correctifs critiques** :
  - evaluation.js (lignes 571-584, 657-672) : `calculerNote()` et `obtenirCouleurNiveau()` lisent maintenant l'échelle sélectionnée au lieu de l'ancienne `niveauxEchelle`
  - profil-etudiant.js (lignes 634, 3233, 4502) : Remplacement `||` par `??` pour supporter note 0 (bug JavaScript : `0 || null` retourne `null`)
  - Cache busters mis à jour : evaluation.js, profil-etudiant.js
- ✅ **Améliorations interface** :
  - Bouton "Courriel" ajouté dans l'en-tête (mailto:labo@codexnumeris.org)
  - Interventions RàI : Badges compacts avec compteurs, bouton "Planifier" en haut
  - Recherche étudiants : Étendue au numéro DA, vidage automatique champ
- ✅ **Archivage** :
  - index 88 déplacé vers Archives/
  - 6 démos de design déplacées vers Documents de travail (obsolètes)/
- ✅ **Fichiers modifiés** : 13 fichiers (evaluation.js, profil-etudiant.js, interventions.js, etudiants.js, styles.css, etc.)
- ✅ **Statistiques** : ~3,900 insertions, ~400 suppressions, 4 commits
- ✅ **Problèmes connus** :
  - Évaluations anciennes conservent `niveauFinal: "--"` jusqu'à resauvegarde
  - Page blanche occasionnelle lors chargement depuis liste (en investigation)
- ✅ **Documentation** : `NOTES_VERSION_0.89.md`

**CRÉATION BETA 0.90 ET INTÉGRATION CHART.JS** (Session 5 novembre - Beta 90)
- ✅ **Fichier** : `index 90 (snapshots).html` - Version Beta 90
- ✅ **Création par duplication** : Beta 89 → Beta 90
  - Titre : "Snapshots et suivi longitudinal"
  - Date : 5 novembre 2025
  - Cache buster CSS mis à jour : v=2025110500
  - Beta 89 archivée dans Archives/
- ✅ **Décision technique majeure : Intégration Chart.js**
  - Librairie MIT open source pour graphiques professionnels
  - Taille : ~200 KB (chart.min.js)
  - Installation locale (pas de CDN, fonctionne hors ligne)
  - Gain estimé : ~10 jours de développement
  - Permet reproduction graphiques Numbers (aires empilées, spaghetti charts, zones colorées)
- ✅ **Plan de match Beta 90** : `PLAN_BETA_0.90.md` (819 lignes)
  - Système de snapshots interventions (capture données à complétion)
  - Snapshots hebdomadaires (portrait complet chaque semaine)
  - Reconstruction rétroactive (recalcul semaines passées)
  - Graphiques évolution A-C-P avec Chart.js
  - Cartouches contextuels dans formulaire évaluation
  - Correctifs bugs Beta 89 (migration niveaux "--", page blanche)
- ✅ **Calendrier** : 3 semaines (5-24 novembre 2025)
  - Semaine 1 : Snapshots interventions + hebdomadaires
  - Semaine 2 : Reconstruction rétroactive + cartouches
  - Semaine 3 : Chart.js + correctifs + documentation
- ✅ **Nouveaux fichiers prévus** :
  - libs/chart.min.js (librairie externe)
  - js/snapshots.js (gestion snapshots)
  - js/graphiques.js (8 fonctions Chart.js)
- ✅ **Modifications terminologie RàI** :
  - Niveau 1 (Universel) : "suivi régulier en classe"
  - Niveau 2 (Préventif) : renommage "Ciblé" → "Préventif", "interventions préventives en classe"
  - Niveau 3 (Intensif) : "interventions intensives individuelles hors classe"
  - Fichiers modifiés : index 89, tableau-bord-apercu.js
- ✅ **Impact PHASE 2 accélérée** : 3-4 semaines au lieu de 6-8 (grâce à Chart.js)

---

**DÉVELOPPEMENTS NOVEMBRE 2025** (5-16 novembre - 109 commits)

**Contexte**: Sprint intensif de 11 jours en préparation de la présentation du 19 novembre 2025 (Communauté de pratique PAN, 400 personnes inscrites). Objectif: Beta 90.5 fonctionnelle et inspirante.

#### 1. **Système de pratiques modulaire - Phases 2-6 complétées** (6-13 nov)

**✅ PHASE 2**: Délégation calculs vers registre (7 nov)
- Élimination 94% code dupliqué dans `portfolio.js`
- Tests: 30/30 étudiants validés (100% identiques)

**✅ PHASE 3**: Extraction PAN-Maîtrise (8 nov)
- Création `js/pratiques/pratique-pan-maitrise.js` (548 lignes)
- Migration logique IDME + SRPNF + N artefacts
- Tests: Calculs identiques avant/après migration

**✅ PHASE 4**: Implémentation Sommative (8 nov)
- Création `js/pratiques/pratique-sommative.js` (312 lignes)
- Moyenne pondérée de toutes les évaluations
- Détection défis génériques (< 65%)

**✅ PHASE 5**: Migration lecteurs vers interface (9-10 nov)
- `profil-etudiant.js`: Utilise `pratique.obtenirDonneesProfil()`
- `tableau-bord-apercu.js`: Utilise `pratique.identifierPattern()`, `pratique.calculerNiveauRai()`
- Migration automatique "alternative" → "pan-maitrise"

**✅ PHASE 6**: Tests et corrections (10-13 nov)
- Session tests #1: Détection 5 bugs critiques
- Corrections: Extraction SRPNF, format patterns, ordre navigation
- Documentation: `PHASE_6_TESTS_SESSION1.md`

**Fichiers clés**:
- `js/pratiques/pratique-registre.js` (détection auto)
- `js/pratiques/pratique-pan-maitrise.js` (548 lignes)
- `js/pratiques/pratique-sommative.js` (312 lignes)

#### 2. **Remplacement Risque d'échec → Engagement** (8-10 nov)

**Reformulation complète du concept pédagogique**:
- **Ancien**: Risque d'échec (R) = 1 - (A × C × P)  [0-100%, plus élevé = pire]
- **Nouveau**: Engagement (E) = A × C × P  [0-100%, plus élevé = meilleur]

**Justification**:
- Perspective positive vs punitive
- Cohérence avec indices A-C-P (tous positifs)
- Formulation plus motivante pour étudiants

**Impact**: 16 fichiers modifiés
- Liste étudiants: Colonne "Risque" → "Engagement"
- Profil: "Risque d'échec" → "Engagement dans l'apprentissage"
- Tableau de bord: Reformulation complète section
- Surlignement: Rouge (risque élevé) → Vert (engagement faible)

#### 3. **Système de jetons personnalisés** (7-9 nov)

**Implémentation complète**:
- ✅ Configuration jetons (Réglages → Pratique de notation)
- ✅ Types de jetons configurables: délai, reprise, aide, bonus
- ✅ Attribution jetons dans profil étudiant
- ✅ Compteurs visuels: disponibles/utilisés
- ✅ Calcul automatique échéances prolongées (jetons délai)
- ✅ Remplacement évaluation (jetons reprise)
- ✅ Badges dans liste évaluations avec couleurs distinctes

**Fichiers modifiés**:
- `js/pratiques.js`: Configuration système jetons
- `js/profil-etudiant.js`: Interface attribution
- `js/portfolio.js`: Logique jetons délai/reprise
- `js/evaluation.js`: Affichage badges

#### 4. **Barres de distribution - Refonte majeure** (10-13 nov + 15-16 nov)

**Évolution design**:

**Phase 1** (10-11 nov): Transformation barres → nuages de points
- Scatter plots avec jitter (±1.5% horizontal, ±12px vertical)
- Points circulaires remplacent barres empilées
- Visualisation densité par agglomération

**Phase 2** (11-12 nov): Gradients spectre lumineux
- Patterns: Rouge → Jaune → Vert (zones Défi → Stable → Excellence)
- RàI: Vert → Jaune → Orange (Niveau 1 → 2 → 3)
- Suppression zone "Insuffisant" (opacité maximale partout)

**Phase 3** (12 nov): Affichage dual SOM/PAN
- Mode comparatif: Points oranges (SOM) + points bleus (PAN)
- Moyennes affichées pour chaque pratique
- Transitions dégradées entre zones

**Phase 4** (13 nov): Profil étudiant
- Barres SRPNF avec points circulaires
- Barre d'engagement avec gradient optimisé
- Affichage dual SOM/PAN en mode comparatif

**Phase 5** (15-16 nov): Animation et contraintes
- Dilatation points (jitter augmenté pour visibilité)
- Contraintes: points ne dépassent pas gradient
- Animation subtile au hover (±1px horizontal, −2px vertical, 7s)
- Grossissement au hover (scale 1.5)
- Anonymisation tooltips en mode Anonymisation

**Impact**: Visualisation transformée, densité visible

#### 5. **Découplage critères SRPNF** (11-12 nov)

**Objectif**: Rendre le dépistage universel (applicable à toute grille)

**Changements**:
- ✅ Ajout sélecteur "Grille de référence pour le dépistage"
- ✅ Séparation patterns (3 artefacts récents) vs performance finale (4)
- ✅ Support grilles personnalisées (pas seulement SRPNF)
- ✅ Configuration: choix grille, nombre artefacts, fenêtre patterns

**Bénéfice**:
- Enseignants peuvent utiliser leurs propres critères
- Système patterns/RàI fonctionne avec n'importe quelle grille
- SRPNF n'est plus codé en dur

**Documentation**: `ARCHITECTURE_PRATIQUES.md` section Universel vs Spécifique

#### 6. **Détection patterns et RàI** (9-16 nov)

**Corrections bugs critiques** (9-10 nov):
- ✅ Bug #1: Patterns incorrects - Tout le monde "Stable" malgré défis
  - Cause: Moyennes globales au lieu de N artefacts récents
  - Fix: Création `calculerMoyennesCriteresRecents(da, n)`
- ✅ Bug #2: Défis non détectés sur critères individuels
  - Cause: Seuils IDME non utilisés (seuils fixes 70/80/85)
  - Fix: Modification `identifierPatternActuel()` pour seuils configurables
- ✅ Bug #3: Incohérence pattern/RàI/recommandations
  - Cause: Logique RàI pas alignée avec patterns
  - Fix: `determinerCibleIntervention()` distinction PAN vs SOM

**Amélioration seuils** (11 nov):
- Seuils IDME configurables utilisés partout
- Fenêtre patterns configurable (défaut: 3 artefacts)
- Support N artefacts configurable (PAN: 3, 7, 12)

**RàI optionnel** (15-16 nov):
- ✅ Checkbox "Activer RàI et détection des patterns"
- ✅ Masquage sections si désactivé (tableau de bord, profil)
- ✅ Masquage colonnes Pattern/RàI dans liste étudiants
- ✅ Sauvegarde préférence dans localStorage

**Fichiers modifiés**:
- `js/profil-etudiant.js`: Logique patterns/défis corrigée
- `js/pratiques.js`: Checkbox RàI optionnel
- `js/tableau-bord-apercu.js`: Affichage conditionnel
- `js/etudiants.js`: Colonnes conditionnelles

#### 7. **Profil étudiant - Améliorations** (7-13 nov)

**Section Productions ajoutée** (7 nov):
- Tableau productions évaluées avec notes
- Liens directs vers évaluations
- Séparation SOM vs PAN

**Affichage dual SOM/PAN** (9-10 nov):
- Badges dual dans titre ("SOM 67%" / "PAN 82%")
- Variables `indicesSOM` et `indicesPAN` partout
- Section Mobilisation avec données duales
- Correctifs bugs (variables manquantes, format)

**Navigation améliorée** (10 nov):
- Ordre alphabétique Précédent/Suivant corrigé
- Uniformisation messages succès

**Forces et défis dynamiques** (6 nov):
- Calcul dynamique depuis évaluations réelles
- Plus de valeurs codées en dur
- Cohérence avec moyennes SRPNF

#### 8. **Optimisations UX** (7-10 nov)

**Interface matériel pédagogique** (8 nov):
- Refonte complète: 4 onglets → interface unifiée
- Productions, Grilles, Échelles, Cartouches dans une seule page
- Navigation par cartes au lieu d'onglets
- Optimisation espace vertical

**Simplification aperçus** (10 nov):
- Aperçus présences/évaluations automatiquement générés
- Suppression boutons "Recalculer" redondants
- Rechargement automatique lors de modifications

**Optimisation espace** (8 nov):
- Page Trimestre: Aménagements en deux colonnes
- Suppression systèmes verrouillage (complexité inutile)
- Tableau étudiants: Pleine largeur
- Boutons d'action: Largeur optimisée (200px)

**Module contexte** (8 nov):
- Nouveau `js/contexte.js` pour affichage en-tête
- Informations cours, session, groupe centralisées

#### 9. **Corrections critiques** (13-15 nov)

**Calcul moyennes SRPNF** (14 nov):
- Bug: Barres SRPNF affichaient NaN%
- Cause: Lecture directe `criteres[]` au lieu de moyennes calculées
- Fix: Ajout calcul moyennes avec support variantes noms critères

**Standardisation clés** (14 nov):
- Bug: `francaisecrit` vs `francais` causait moyennes manquantes
- Fix: Standardisation toutes clés en minuscules
- Impact: 6 commits correctifs progressifs

**Support niveau '0'** (14 nov):
- Ajout niveau "0" dans table conversion IDME
- Cas d'usage: Plagiat, IA non autorisée
- Matching critères: Support variantes de noms

**Erreurs console** (14 nov):
- Fonctions inexistantes exportées (window.ajouterEtudiant)
- Éléments DOM manquants
- 3 correctifs critiques

**Barres SRPNF** (14 nov):
- Calcul moyennes manquant
- Clés minuscules non supportées
- 2 correctifs successifs

#### 10. **Documentation et organisation** (16 nov)

**Nettoyage répertoire principal**:
- ✅ Création structure `Archives/` (Plans, Phases, Analyses, Versions)
- ✅ 31 fichiers historiques archivés
- ✅ 11 fichiers obsolètes supprimés
- ✅ 52 documents → 15 documents actifs

**Documents actifs conservés**:
- CLAUDE.md (ce fichier)
- PLAN_NOV19_2025.md (plan actif présentation)
- MIGRATION_INDEXEDDB.md (plan migration future)
- ROADMAP_V1_AQPC2026.md (vision long terme)
- ARCHITECTURE_PRATIQUES.md, GUIDE_AJOUT_PRATIQUE.md, FEUILLE_DE_ROUTE_PRATIQUES.md
- GUIDE_TESTEURS.md, README_TESTEURS.md, README_DONNEES_DEMO.md
- LICENSE.md, NOMS_STABLES.json, donnees-demo.json

**Bénéfices**:
- Clarté navigation
- Onboarding facilité
- Recherches plus rapides
- Histoire préservée dans Archives/

---

**Fichier actuel: Beta 92 (Primo Assistant)**

**Nom**: `index 92.html`
**Date de création**: 27 novembre 2025
**Version actuelle**: Beta 92
**Statut**: ✅ Prêt pour distribution

**Créée à partir de**: Beta 91.2 (`index 91.html`)
**Provenance**: Beta 91.2 avec système import/export CC complet
**Changelog**: Voir `BETA_92_CHANGELOG.md` pour détails complets

**Développement sur 3 jours** (27-30 novembre 2025):

### Session 1 : Primo Assistant (27 novembre)

**Nouvelle fonctionnalité majeure** : Modal d'accueil conversationnel pour nouveaux utilisateurs

**Composantes Primo** :
1. ✅ Détection automatique première utilisation
2. ✅ Modal d'accueil animé (emoji 😎 + message chaleureux)
3. ✅ 4 parcours modulaires guidés :
   - MODULE 1 : Créer un groupe-cours (config conversationnelle, 3 min)
   - MODULE 2 : Évaluer une production (mode guide direct)
   - MODULE 3 : Explorer diagnostics (placeholder, désactivé)
   - MODULE 4 : Créer pratique de notation (Wizard, 8 min)
4. ✅ Import automatique matériel de démarrage (IDME + SRPNF + cartouches)
5. ✅ Tutoriel interactif en 7 étapes (après données démo)

**Fichiers créés** :
- `js/primo-accueil.js` (469 lignes) : Modal d'accueil et parcours
- `js/primo-modal.js` (~900 lignes) : Configuration conversationnelle
- `js/primo-questions.js` (~600 lignes) : Questions structurées avec dépendances
- `js/tutoriel-interactif.js` (~650 lignes) : Tutoriel guidé
- `materiel-demarrage.json` : Échelle IDME + Grille SRPNF + 20 cartouches

---

### Session 2 : Corrections bugs Primo (28 novembre)

**4 bugs critiques corrigés** :
1. ✅ Fonction notification manquante → Fallback avec `afficherNotificationSucces()`
2. ✅ CORS file:// bloque fetch() → Documentation serveur HTTP local
3. ✅ Mode application non initialisé → Définition automatique `modeApplication = 'simulation'`
4. ✅ Fonction transformation manquante → Création `transformerReponse()`

**Workflow end-to-end validé** :
- Configuration complète Primo → Import matériel → Mode simulation → Liste étudiants → Évaluation

**Commits** : 3 commits (`8004069`, `592d559`, `2b84123`)

---

### Session 3 : Import/Export CC + Navigation (30 novembre)

**1. Import/Export individuel avec Creative Commons** :
- ✅ Export individuel avec métadonnées CC BY-NC-SA 4.0 (4 modules)
- ✅ Import individuel avec préservation ID et métadonnées (4 modules)
- ✅ Support ancien format (JSON direct) et nouveau format (avec metadata wrapper)
- ✅ Affichage badge CC lors de l'import (licence, auteur, date)
- ✅ Visibilité contextuelle des boutons (mode création vs modification)

**Fonctions implémentées** :
- Productions : `importerDansProductionActive()` (lignes 1314-1432)
- Grilles : `importerDansGrilleActive()` (lignes 1611-1721)
- Échelles : `importerDansEchelleActive()` (lignes 1681-1791)
- Cartouches : `importerDansCartoucheActive()` (lignes 1920-2031)

**2. Renommage sections navigation Matériel** :
| Ancien | Nouveau |
|--------|---------|
| Productions | **Productions étudiantes** |
| Échelle de performance | **Échelles de performance** |
| Rétroactions | **Cartouches de rétroaction** |
| Objectifs d'apprentissage | **Ensembles d'objectifs** |

**3. Optimisations Modal Primo** :
- ✅ Layout horizontal (emoji gauche, texte droite)
- ✅ Bouton "Consulter l'aide" ajouté (navigation vers section Aide)
- ✅ Reformulation "Retour à la navigation libre" (simplifié, centré)
- ✅ Ordre final : MODULE 1-4 → Consulter l'aide → Retour navigation

**4. Correctifs divers** :
- ✅ Boutons manquants dans Échelles (btnSupprimer + visibilité contextuelle)
- ✅ Réorganisation boutons Cartouches (déplacés en bas de page)

**Fichiers modifiés** : 7 fichiers (productions.js, grilles.js, echelles.js, cartouches.js, config.js, primo-accueil.js, index 92.html)

---

### Statistiques globales Beta 92

| Métrique | Valeur |
|----------|--------|
| **Sessions** | 3 (27, 28, 30 novembre) |
| **Commits** | ~15 commits |
| **Fichiers créés** | 5 (Primo + materiel-demarrage.json) |
| **Fichiers modifiés** | ~20 fichiers |
| **Lignes ajoutées** | ~3,500 lignes |
| **Bugs corrigés** | 6 bugs (4 critiques + 2 mineurs) |

**Documentation** :
- `BETA_92_CHANGELOG.md` : Changelog complet (3 sessions détaillées)
- `PLAN_TESTS_BETA_92.md` : Plan de tests systématique (30-45 min)

---

**Fichier actuel: Beta 93 (Système universel)**

**Nom**: `index 93.html`
**Date de création**: 3 décembre 2025
**Version actuelle**: Beta 93
**Statut**: ✅ En cours de développement

**Créée à partir de**: Beta 92 (`index 92.html`)
**Provenance**: Beta 92 avec système Primo complet
**Changelog**: Session unique (3 décembre 2025)

**Développement sur 1 jour** (3 décembre 2025):

### Session unique : Correction statutRemise + Système 100% universel

**1. CORRECTION CRITIQUE : Single Source of Truth pour statutRemise**

**Problème identifié** : Plusieurs endroits affichaient des travaux "non remis" comme étant remis
- Liste évaluations : Badge "Non remis" ne s'affichait pas (note 0% affichée à la place)
- Profil étudiant (Productions) : Idem
- Profil étudiant (Engagement) : Artefacts "non remis" comptés comme remis

**Cause** : Logique vérifiait `statut === 'evalue'` avant de vérifier `statutRemise`

**Solution appliquée** :
```javascript
// ✅ PRIORITÉ 1 : Vérifier statutRemise D'ABORD
if (statutRemise === 'non-remis' || statutRemise === 'retard') {
    affichage = '<span class="badge-non-remis">Non remis</span>';
} else if (statut === 'evalue') {
    affichage = `<strong>${note}</strong>`;
}
```

**Fichiers corrigés** :
- `liste-evaluations.js` (v=2025120207) : lignes 833-857
- `profil-etudiant.js` (v=2025120302) :
  * Section Productions : lignes 3568-3597
  * Section Engagement : lignes 765-780

**Résultat** : `statutRemise` est maintenant la **seule source de vérité**

---

**2. SYSTÈME 100% UNIVERSEL : Critères configurables**

**Objectif** : Permettre à n'importe quel utilisateur d'utiliser ses propres critères d'évaluation (pas seulement SRPNF)

**Avant** (90% universel) :
- Critères SRPNF codés en dur dans le code
- Recommandations RàI spécifiques à SRPNF
- Impossible d'utiliser d'autres critères

**Après** (100% universel) :
- Critères lus dynamiquement depuis la grille de référence
- Recommandations RàI configurables avec fallback générique
- Support de N'IMPORTE quelle grille

**Modifications profil-etudiant.js** (v=2025120303) :

1. **Nouvelle fonction `obtenirCriteresAvecValeurs(da)`** (lignes 138-171)
   - Remplace tableau SRPNF codé en dur
   - Lit grille de référence configurée
   - Retourne `[{ nom, valeur, cleNormalisee }, ...]`

2. **Section Suivi de l'apprentissage** (ligne 1556)
   - Utilise `obtenirCriteresAvecValeurs()` dynamiquement
   - Forces/défis calculés pour n'importe quels critères

3. **Rapport diagnostic** (lignes 5795-5812)
   - Extraction dynamique depuis grille
   - Support de toute grille personnalisée

4. **Textes universalisés**
   - "Critères SRPNF" → "Critères d'évaluation"

**Modifications pratique-pan-maitrise.js** (v=2025120302) :

1. **Nouvelle fonction `_obtenirGrilleReference()`** (lignes 478-501)
   - Lit grille configurée dans `modalitesEvaluation.grilleReferenceDepistage`

2. **Nouvelle fonction `_obtenirInterventionConfiguree(nomCritere, niveau)`** (lignes 503-549)
   - Cherche interventions RàI dans la grille
   - Support format `critere.interventions.niveau1/2/3`

3. **`_calculerMoyennesCriteresRecents()` - Refonte complète** (lignes 514-642)
   - ✅ Regex dynamique construite depuis noms de critères
   - ✅ Support variantes accentuées (É→[ÉE], Ç→[ÇC])
   - ✅ Initialisation accumulateurs dynamique
   - ✅ Matching insensible accents/espaces

4. **`_diagnostiquerForcesChallenges()` - Universel** (lignes 644-695)
   - ✅ Critères extraits dynamiquement depuis moyennes
   - ✅ Plus de tableau SRPNF codé

5. **`_determinerCibleIntervention()` - Système à 2 niveaux** (lignes 860-974)
   ```javascript
   // NIVEAU 1 : Chercher dans grille si configuré
   const interventionConfig = this._obtenirInterventionConfiguree(defiPrincipal, niveau);
   if (interventionConfig) {
       cible.cible = interventionConfig.cible;
       cible.strategies = interventionConfig.strategies;
   } else {
       // NIVEAU 2 : Recommandations génériques intelligentes
       cible.cible = `Remédiation intensive en ${defiPrincipal}`;
       cible.strategies = [
           `Rencontre individuelle pour diagnostic approfondi`,
           `Exercices de remédiation ciblés sur ${defiPrincipal}`,
           // ...
       ];
   }
   ```

6. **Documentation mise à jour**
   - Version : 1.0 → 1.1 (Universelle)
   - Description : "critères configurables" au lieu de "critères SRPNF"
   - `type: 'critere-grille'` au lieu de `'critere-srpnf'`

**Autres corrections** :
- `calendrier-vue.js` (v=2025120201) : Jours type='cours' cliquables (ligne 259)
- `evaluation.js` (v=2025120216) : Navigation bouton profil corrigée (lignes 5361-5396)
- `index 93.html` : Statut "En retard" supprimé (simplifié à remis/non-remis)

---

### Résultat : Système 100% universel

**Pour VOUS (grille SRPNF actuelle)** :
- ✅ Rien ne change ! Recommandations génériques de qualité
- ✅ Possibilité d'ajouter `interventions{}` dans grille pour recommandations spécifiques originales

**Pour AUTRES UTILISATEURS** :
- ✅ Peuvent créer grille personnalisée (ex: Créativité, Analyse, Synthèse, Méthodologie)
- ✅ Système détecte automatiquement forces/défis/patterns
- ✅ Recommandations génériques automatiques OU configurables

**Exemple grille personnalisée** :
```javascript
{
    nom: "Créativité",
    ponderation: 25,
    // Optionnel : Interventions RàI personnalisées
    interventions: {
        niveau3: {
            cible: "Stimulation créative intensive",
            strategies: [
                "Exercices de brainstorming guidés",
                "Exposition à exemples créatifs variés",
                "Rencontre individuelle déblocage"
            ]
        },
        niveau2: {...},
        niveau1: {...}
    }
}
```

### Statistiques Beta 93

| Métrique | Valeur |
|----------|--------|
| **Sessions** | 1 (3 décembre) |
| **Commits** | 2 commits |
| **Fichiers modifiés** | 6 fichiers JS + 1 HTML |
| **Lignes ajoutées** | ~500 lignes |
| **Bugs corrigés** | 3 bugs statutRemise + 1 bug navigation |

**Commits** :
1. `1c42472` - Correction statutRemise et système universel de critères
2. `0253b5d` - Déplacement scripts de build vers racine du projet

---

**Fichier précédent: Beta 92 (Primo Assistant)**

**Nom**: `index 92.html`
**Date de création**: 27 novembre 2025
**Version actuelle**: Beta 92
**Statut**: ✅ Prêt pour distribution

---

**Fichier précédent: Beta 91 (Développement avancé)**

**Nom**: `index 91.html`
**Date de création**: 18 novembre 2025
**Version actuelle**: Beta 91.1 (v0.91.1-indexeddb)
**Statut**: En développement actif

**Créée à partir de**: Beta 90.5 (`index 90 (architecture).html`)
**Provenance**: Beta 90.5 stable après présentation 19 novembre 2025
**Changelog**: Voir `BETA_91_CHANGELOG.md` pour détails complets

**Changements initiaux Beta 91.0**:
- ✅ Titre mis à jour: "Beta 91 - Développement avancé"
- ✅ Date: 18 novembre 2025
- ✅ Cache buster CSS: `v=2025111801`
- ✅ Cache busters pratiques: `v=2025111801`
- ✅ Documentation: `BETA_91_CHANGELOG.md` créé

**Migration IndexedDB Beta 91.1** (25-26 novembre 2025):
- ✅ Architecture hybride IndexedDB + localStorage
- ✅ Capacité stockage: 5-10 MB → plusieurs GB
- ✅ 38 commits, 10 bugs corrigés, 37 fichiers modifiés
- ✅ 100% compatibilité modules existants (API inchangée)
- ✅ Documentation: `INDEXEDDB_ARCHITECTURE.md` (441 lignes)
- ✅ Tag Git: `v0.91.1-indexeddb` (26 novembre 2025)
- ✅ Fusionné dans `main` avec succès

**Système d'import/export pédagogique Beta 91.2** (26 novembre 2025):
- ✅ Export avec métadonnées enrichies CC BY-NC-SA 4.0
- ✅ Configuration complète (échelles + grilles + productions + cartouches + paramètres)
- ✅ Génération automatique fichier LISEZMOI.txt avec instructions
- ✅ Import avec détection et résolution automatique conflits d'ID
- ✅ Remapping intelligent des références (productions → grilles, cartouches → grilles)
- ✅ Détection dépendances manquantes avec avertissements
- ✅ Interface complète dans Réglages → Gestion des données
- ✅ Documentation: Plan de tests complet + fichiers de test JSON
- ✅ 5 phases implémentées en 1 session (~700 lignes ajoutées)

**Fichiers clés import/export**:
```
js/
├── import-export.js        # Module principal (613 lignes)
│   ├── exporterConfigurationComplete()
│   ├── importerConfigComplete()
│   └── executerImportConfigComplete() (avec remapping)
├── cc-license.js          # Métadonnées CC (748 lignes)
│   ├── demanderMetadonneesEnrichies()
│   ├── demanderMetadonneesConfigComplete()
│   └── genererFichierLISEZMOI()
├── productions.js         # Détection dépendances
├── cartouches.js          # Détection dépendances
├── grilles.js            # Export enrichi
└── echelles.js           # Export enrichi

Tests/
├── PHASE_5_PLAN_TESTS.md           # Plan détaillé (~600 lignes)
├── PHASE_5_GUIDE_EXECUTION.md      # Guide rapide
├── test-echelle-idme.json          # Échelle IDME test
├── test-grille-srpnf.json          # Grille SRPNF test
└── test-production-avec-dependance.json  # Production test
```

**Fonctionnalités**:
1. **Export individuel**: Grilles, échelles, productions, cartouches avec métadonnées
2. **Export complet**: Bundle toutes ressources + README automatique
3. **Import intelligent**: Détection conflits, remapping IDs, validation dépendances
4. **Métadonnées enrichies**: discipline[], niveau, description, auteur, licence CC
5. **Partage pédagogique**: Format standardisé pour collaboration entre enseignants

---

### ✅ Beta 90.5 - Résumé historique (5-16 novembre 2025)

**Contexte**: Sprint présentation 19 novembre 2025 (Communauté AQPC, 400 personnes)

**Statistiques période 5-16 novembre 2025**:
- **Commits**: 109
- **Jours**: 11 (travail quotidien)
- **Fichiers modifiés**: ~50 fichiers JS/CSS/HTML
- **Lignes ajoutées**: ~15,000
- **Lignes supprimées**: ~8,000
- **Bugs corrigés**: 20+ bugs critiques
- **Fonctionnalités complétées**: 10 thèmes majeurs
- **Documentation**: 31 fichiers archivés, 11 supprimés

**Résultat**: Beta 90.5 stable et fonctionnelle pour présentation

---

### 🔴 Prochaines priorités (Beta 93 - Développement avancé)

**Date de démarrage**: Décembre 2025 (post-Beta 92)
**Objectif**: Tests Beta 92, feedback utilisateurs, et développement nouvelles fonctionnalités

**Phase 1 - Court terme (décembre 2025)**:

1. **Tests et validation Beta 92** ✅ **EN COURS**
   - [ ] Exécution plan de tests PLAN_TESTS_BETA_92.md
   - [ ] Validation workflow Primo end-to-end
   - [ ] Tests import/export individuel avec CC
   - [ ] Corrections bugs découverts
   - [ ] Package distribution Monitorage_Beta_0.92.zip

2. **Intégration feedback communauté** (post-présentation 19 nov)
   - [ ] Collecte et analyse feedback présentation
   - [ ] Corrections bugs rapportés par utilisateurs
   - [ ] Améliorations UX suggérées
   - [ ] Priorisation demandes fonctionnalités

3. **Optimisations performance**
   - [ ] Réduction temps chargement initial
   - [ ] Optimisation calculs indices A-C-P
   - [ ] Amélioration responsive mobile
   - [ ] Cache intelligent pour données calculées

4. **Documentation enrichie**
   - [ ] Guide utilisateur simplifié (version publique)
   - [ ] FAQ étendue (questions communauté)
   - [ ] Tutoriels vidéo courts (< 5 min chacun)
   - [ ] Documentation technique développeurs

**Phase 2 - Moyen terme (janvier-février 2026)**:

1. **Migration IndexedDB** ✅ **COMPLÉTÉE (Beta 91.1 - 25-26 nov 2025)**
   - ✅ Remplacement localStorage → IndexedDB (architecture hybride)
   - [ ] Support plusieurs groupes simultanés (prévu Beta 92+)
   - ✅ Amélioration capacité stockage (5-10 MB → plusieurs GB)
   - ✅ API unifiée accès données (db.js)

2. **Système de snapshots**
   - [ ] Snapshots interventions RàI (capture à complétion)
   - [ ] Snapshots hebdomadaires (portrait complet chaque semaine)
   - [ ] Reconstruction rétroactive (recalcul semaines passées)
   - [ ] Export snapshots (analyse longitudinale)

3. **Graphiques évolution A-C-P** (Chart.js)
   - [ ] Graphiques aires empilées (évolution temporelle)
   - [ ] Spaghetti charts (trajectoires individuelles)
   - [ ] Zones colorées RàI (contexte visuel)
   - [ ] Export graphiques (PNG, PDF)

**Phase 3 - Long terme (mars-juin 2026)**:

1. **Préparation Version 1.0**
   - [ ] Consolidation toutes fonctionnalités
   - [ ] Tests utilisateurs extensifs (20+ testeurs)
   - [ ] Documentation complète (utilisateur + technique)
   - [ ] Package distribution professionnel

2. **Présentation AQPC 2026**
   - [ ] Version 1.0 stable et robuste
   - [ ] Package complet démonstration
   - [ ] Communication publique large
   - [ ] Ateliers formation (si demande)

**📊 Statut roadmap** (26 novembre 2025):
- ✅ Phase 1 : En cours (feedback communauté, optimisations)
- ✅ Phase 2 : **75% complétée** (IndexedDB ✅, snapshots/graphiques restants)
- ⏳ Phase 3 : Prévu mars-juin 2026

**Note** : Migration IndexedDB complétée **2 mois en avance** sur calendrier initial (prévu janvier-février 2026, réalisé novembre 2025).

**Voir**:
- `BETA_92_CHANGELOG.md` pour changelog complet Beta 92 (Primo + Import/Export CC + Navigation)
- `PLAN_TESTS_BETA_92.md` pour plan de tests systématique Beta 92
- `BETA_91_CHANGELOG.md` pour suivi détaillé développements Beta 91
- `INDEXEDDB_ARCHITECTURE.md` pour architecture stockage hybride complète
- `MIGRATION_INDEXEDDB.md` pour plan migration technique (si existe)
- `ROADMAP_V1_AQPC2026.md` pour vision long terme Version 1.0
- `PLAN_NOV19_2025.md` pour référence historique présentation (archivé)

---

## Commandes bash courantes

```bash
# Test local
open "index 92.html"   # macOS - Beta 92 (actuel)
open "index 91.html"   # macOS - Beta 91 (archivé)
open "index 90 (architecture).html"   # macOS - Beta 90.5 (archivé)

# Voir localStorage dans console Safari
localStorage.getItem('calendrierComplet')
localStorage.getItem('indicesAssiduiteDetailles')
localStorage.getItem('indicesCP')

# Debug - Vérifier existence données (localStorage)
!!localStorage.getItem('calendrierComplet')  # true/false
JSON.parse(localStorage.getItem('calendrierComplet'))  # Voir contenu

# Debug - Vérifier IndexedDB (console navigateur)
indexedDB.databases().then(dbs => console.log('Bases:', dbs))  # Lister bases
db.keys().then(keys => console.log('Clés IndexedDB:', keys.length))  # Nombre clés
db.get('groupeEtudiants').then(data => console.log(data))  # Voir une clé

# Tester le calcul dual SOM-PAN
calculerEtStockerIndicesCP();  // Force le recalcul
const indices = JSON.parse(localStorage.getItem('indicesCP'));
console.log(indices);

// Vérifier pour un étudiant spécifique
const da = '1234567';
console.log('SOM:', obtenirIndicesCP(da, 'SOM'));
console.log('PAN:', obtenirIndicesCP(da, 'PAN'));
```

---

## Format de demande standardisé pour Claude Code

```markdown
CONTEXTE : [Module concerné et sa fonction]
OBJECTIF : [Une seule tâche précise]
ZONES AUTORISÉES : [Fichier et lignes modifiables]
NOMS STABLES : [Référencer noms_stables.json si pertinent]
EXTRAIT : [40-100 lignes de code pertinentes]
ATTENDU : [Comportement visible souhaité]
FORMAT : [Patch minimal / diff / code complet si nouveau module]
```

---

## Problèmes connus et solutions

### "Invalid Date" dans le calendrier
**Cause** : Conflit de noms de fonctions entre modules
**Solution** : Préfixer les fonctions par leur contexte (ex: `formaterDateTrimestreYMD`)

### Calendrier vide après rechargement
**Cause** : `calendrierComplet` pas généré ou corrompu
**Solution** : Aller dans Réglages → Trimestre → Régénérer le calendrier

### Indices A non calculés
**Cause** : Présences pas saisies ou module non initialisé
**Solution** : Vérifier ordre de chargement dans index 70, aller dans Présences → Saisie

### Données perdues
**Cause** : localStorage effacé (navigation privée, nettoyage navigateur)
**Solution** : Utiliser Import/Export régulièrement pour backup JSON

---

## Debug général

```javascript
// Console navigateur - Vérifier données
console.log('calendrierComplet existe?', !!localStorage.getItem('calendrierComplet'));
console.log('Nombre de jours:', Object.keys(JSON.parse(localStorage.getItem('calendrierComplet'))).length);

console.log('Indices A existent?', !!localStorage.getItem('indicesAssiduiteDetailles'));
console.log('Contenu indices:', JSON.parse(localStorage.getItem('indicesAssiduiteDetailles')));

// Vérifier APIs disponibles
console.log('API calendrier:', typeof obtenirCalendrierComplet);
console.log('API infos jour:', typeof obtenirInfosJour);
```

---

## Licence et partage

**Licence** : Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)
- ✅ Partage et adaptation autorisés (sans usage commercial)
- ✅ Attribution requise
- ✅ Redistribution sous même licence

**Ressources** :
- Guide de monitorage complet : Labo Codex (https://codexnumeris.org/apropos)
- Articles publiés : Revue Pédagogie collégiale (printemps-été 2024, hiver 2025)

---

## Notes importantes pour Claude Code

1. **Ce projet est complexe** : Prendre le temps de comprendre l'architecture avant de modifier
2. **Tester immédiatement** : Ouvrir dans Safari après chaque modification
3. **Pas de fantaisie** : Respecter strictement le style existant
4. **Documenter** : Ajouter des commentaires pour les modifications importantes
5. **Questions bienvenues** : Demander des clarifications plutôt que supposer

**L'objectif pédagogique** : Faire mentir les prédictions de risque par des interventions proactives !