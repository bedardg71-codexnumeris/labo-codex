# Système de monitorage pédagogique - Application web

## Vue d'ensemble du projet

Application web autonome de suivi des apprentissages convertie depuis un tableur Numbers.
Permet le monitorage pédagogique avec calcul automatique d'indices prédictifs (A-C-P) et génération de diagnostics personnalisés.

**Contrainte principale** : 100% autonome, fonctionnement hors-ligne, données en localStorage uniquement.

---

## Architecture technique

### Stack technologique
- **Frontend** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dépendance externe)
- **Stockage** : localStorage uniquement
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

---

## Structure des fichiers

```
projet/
├── index 78 (bouton soutien).html            # Point d'entrée actuel (Beta 0.78)
├── css/
│   └── styles.css                        # Styles globaux + variables CSS pratiques
├── js/
│   ├── config.js                         # ⚠️ PROTÉGÉ - Configuration globale
│   ├── navigation.js                     # ⚠️ PROTÉGÉ - Gestion navigation
│   ├── main.js                           # Initialisation
│   │
│   ├── trimestre.js                      # ✅ SOURCE - Calendrier complet
│   ├── calendrier-vue.js                 # ✅ LECTEUR - Affichage calendrier
│   ├── saisie-presences.js               # ✅ SOURCE - Indices assiduité (A)
│   ├── tableau-bord-apercu.js            # ✅ LECTEUR - Affichage tableau de bord
│   ├── profil-etudiant.js                # ✅ LECTEUR - Profil individuel complet
│   │
│   ├── etudiants.js                      # Gestion étudiants
│   ├── productions.js                    # À créer - Productions/évaluations
│   ├── portfolio.js                      # À créer - Indices C et P
│   ├── grilles.js                        # Grilles de critères SRPNF
│   ├── echelles.js                       # Échelle IDME (SOLO)
│   ├── cartouches.js                     # Cartouches de rétroaction
│   ├── horaire.js                        # Horaire des séances
│   ├── groupe.js                         # Liste des étudiants
│   ├── cours.js                          # Informations du cours
│   ├── pratiques.js                      # Pratiques de notation (PAN)
│   ├── import-export.js                  # Import/export JSON
│   └── statistiques.js                   # Calculs statistiques
│
├── CLAUDE.md                             # Ce fichier
├── README_PROJET.md                      # Documentation projet
├── COLLAB_RULES.txt                      # Règles de collaboration
├── noms_stables.json                     # Registre des noms protégés
└── structure-modulaire.txt               # Documentation architecture
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
/* RÈGLE AUTOMATIQUE appliquée depuis Beta 0.79 */
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

## État actuel du projet (octobre 2025)

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
  1. Suivi de l'apprentissage (indices R, RàI, échelle de risque visuelle)
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
  - Dépistage A-C-P-R fonctionne dans les deux modes
  - Checkboxes contrôlent l'affichage, pas le calcul

**REFONTE COMPLÈTE AFFICHAGE HYBRIDE SOM-PAN** (Session 26 octobre suite - Beta 0.72)
- ✅ **Fichier** : `index 72 (support SOM-PAN hybride).html` - Version Beta 0.72
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
  3. Mise à jour version Beta 0.72 (2 fichiers)

**SYSTÈME D'IMPORT/EXPORT MATÉRIEL PÉDAGOGIQUE** (Session 28 octobre - Beta 0.75)
- ✅ **Fichier** : `index 75 (import-export matériel pédagogique).html` - Version Beta 0.75
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

**CORRECTIFS CRITIQUES** (Session 28 octobre - Beta 0.77)
- ✅ **Fichier** : `index 77 (correctifs critiques).html` - Version Beta 0.77
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

**AJOUT BOUTON SOUTIEN** (Session 28 octobre - Beta 0.78)
- ✅ **Fichier** : `index 78 (bouton soutien).html` - Version Beta 0.78
- ✅ **Nouvelle fonctionnalité** : Bouton "Soutenir le projet" dans l'en-tête
- ✅ **Emplacement** : Partie gauche de l'en-tête, sous "Réfléchir, expérimenter, partager"
- ✅ **Lien** : https://codexnumeris.org/#/portal/support (Ghost/Stripe)
- ✅ **Style** : Bouton orange discret mais visible avec effet hover
  - Couleur : `--orange-accent` (#ff6b35)
  - Effet hover : élévation visuelle (translateY -2px)
  - Ombre portée : 0 2px 8px avec transition smooth
- ✅ **CSS** : Classe `.btn-soutien` (lignes 445-469)
- ✅ **Objectif** : Permettre aux utilisateurs de soutenir financièrement le développement du projet

### 🔴 Prochaines priorités

1. **Documentation** - Finaliser documentation Beta 0.72
   - ✅ CLAUDE.md (complété)
   - 🔄 Documentation_Indicateurs_Pratique.md (en cours)
   - Documentation utilisateur pour mode comparatif

2. **MODULE horaire.js** - À refondre
   - Générer `seancesCompletes` comme source unique
   - Gestion des reprises (ex: "Horaire du lundi" le jeudi)
   - API : `obtenirSeancesCompletes()`
   - Adapter calendrier-vue.js pour lecture seule

3. **MODULE productions.js** - À créer
   - Gestion des artefacts/productions
   - Évaluations selon critères SRPNF
   - Lien avec grilles.js et echelles.js
   - Stockage dans localStorage

4. **MODULE évaluations individuelles** - Interface de saisie
   - Saisie des évaluations SRPNF par critère
   - Calcul automatique des scores selon grilles
   - Lien avec cartouches de rétroaction
   - Intégration avec portfolio.js pour calcul indices C-P

---

## Commandes bash courantes

```bash
# Test local
open "index 72 (support SOM-PAN hybride).html"   # macOS

# Voir localStorage dans console Safari
localStorage.getItem('calendrierComplet')
localStorage.getItem('indicesAssiduiteDetailles')
localStorage.getItem('indicesCP')

# Debug - Vérifier existence données
!!localStorage.getItem('calendrierComplet')  # true/false
JSON.parse(localStorage.getItem('calendrierComplet'))  # Voir contenu

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