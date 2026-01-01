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
- PAN-Maîtrise (Grégoire Bédard) : Échelle IDME, critères configurables, N derniers artefacts
- Sommative : Moyenne pondérée, toutes évaluations, défis génériques
- **PAN-Objectifs (Xavier C.-T.)** : 6 objectifs avec calcul non-linéaire par seuils critiques
  * Tous objectifs niveau 3 → 80% | Bonus niveau 4 → +3.33% par objectif
  * Un objectif niveau 2 → 55% | Deux niveau 2 OU un niveau 1 → 50%
  * Informatique (Interfaces et BD) | Cégep de Jonquière

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

**✅ VARIANTE PAR-OBJECTIFS UNIFIÉE (Beta 95 - 25 décembre 2025)** :

La variante "par-objectifs" de PAN-Standards offre maintenant 4 modes de calcul configurables via le wizard Primo :

| Mode | Auteur | Description |
|------|--------|-------------|
| **Comptage** | Bruno V. | Note = grille selon nb objectifs maîtrisés. Objectifs "essentiels" vs "complémentaires". Plafond 55% si essentiel non maîtrisé. |
| **Moyenne pondérée** | Michel B. | Note = moyenne des niveaux × pondération par objectif |
| **Seuils critiques** | Xavier C.-T. | Tous objectifs niveau 3+ requis. Bonus +3.33% par niveau 4. Règles non-linéaires. |
| **Holistique** | Isabelle M. | Suggestion statistique (mode/médiane/moyenne) + jugement professionnel |

**Structure de données** :
```javascript
modalitesEvaluation: {
    pratique: 'pan-standards',
    approcheEvaluation: 'par-objectifs',  // ou 'par-artefacts'
    varianteCalcul: 'par-objectifs',
    parObjectifs: {
        modeCalcul: 'comptage',  // ou 'moyenne-ponderee', 'seuils-critiques', 'holistique'
        comptage: {
            seuilMaitrise: 75,
            plafondSiEssentielNonMaitrise: 55
        }
    }
}
```

**Fichiers clés** :
- `js/primo-questions.js` : Questions wizard avec bifurcation artefacts/objectifs
- `js/primo-modal.js` : Support chemins imbriqués dans champsCibles
- `js/pratique-notation-v2.js` : Interface configuration avec 4 modes
- `js/pratiques/pratique-pan-standards.js` : Calculs pour les 4 modes

**Pratiques futures** :
- PAN-Spécifications : Pass/fail sur objectifs
- Dénotation (Ungrading) : Sans notes chiffrées

**Fichiers clés** :
```
js/pratiques/
├── pratique-interface.js        # Documentation du contrat IPratique
├── pratique-registre.js         # Registre central (détection auto)
├── pratique-pan-maitrise.js     # PAN-Maîtrise (IDME + SRPNF)
├── pratique-sommative.js        # Sommative traditionnelle
└── pratique-pan-objectifs.js    # 🆕 PAN-Objectifs (Xavier - Informatique)

Flux de données (Phase 2) :
portfolio.js
    ↓ appelle
obtenirPratiqueParId('sommative' | 'pan-maitrise' | 'pan-objectifs')
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

### Architecture Multi-Trimestres (Beta 95 - IMPLÉMENTÉ)

**✅ IMPLÉMENTÉ (24 décembre 2025)** : Gestion de plusieurs trimestres distincts avec données isolées.

#### Problème actuel

Actuellement, toutes les données calendrier sont stockées dans des clés partagées :
- `calendrierComplet`, `cadreCalendrier`, `evenementsPrevus`, etc.
- Changer de trimestre écrase les données du trimestre précédent
- Impossible d'archiver ou comparer les trimestres (A2025 vs H2026)

#### Solution : Namespacing par trimestreId

**Principe** : Préfixer les clés localStorage/IndexedDB avec l'identifiant du trimestre.

```
AVANT (données partagées)          APRÈS (données isolées)
├─ calendrierComplet               ├─ h2026_calendrierComplet
├─ cadreCalendrier                 ├─ h2026_cadreCalendrier
├─ evenementsPrevus                ├─ h2026_evenementsPrevus
├─ seancesCompletes                ├─ h2026_seancesCompletes
└─ horaireHebdo                    └─ h2026_horaireHebdo
                                   │
                                   ├─ a2025_calendrierComplet
                                   ├─ a2025_cadreCalendrier
                                   └─ ... (autre trimestre)
```

#### Structure du registre des trimestres

**Clé** : `trimestres` (globale, non namespacée)

```javascript
[
  {
    id: "h2026",              // Identifiant unique (session + année en minuscules)
    nom: "Hiver 2026",        // Nom affiché
    session: "H",             // H (Hiver) ou A (Automne)
    annee: "2026",
    dateCreation: "2025-12-19",
    actif: true               // Un seul trimestre actif à la fois
  },
  {
    id: "a2025",
    nom: "Automne 2025",
    session: "A",
    annee: "2025",
    dateCreation: "2025-08-15",
    actif: false
  }
]
```

#### Clés namespacées vs globales

**Clés NAMESPACÉES par trimestre** (préfixe `{trimestreId}_`) :

| Clé originale | Exemple namespacé | Module source |
|---------------|-------------------|---------------|
| `calendrierComplet` | `h2026_calendrierComplet` | trimestre.js |
| `cadreCalendrier` | `h2026_cadreCalendrier` | trimestre.js |
| `evenementsPrevus` | `h2026_evenementsPrevus` | trimestre.js |
| `evenementsImprevus` | `h2026_evenementsImprevus` | trimestre.js |
| `seancesCompletes` | `h2026_seancesCompletes` | horaire.js |
| `horaireHebdo` | `h2026_horaireHebdo` | horaire.js |

**Clés GLOBALES** (partagées entre trimestres) :

| Clé | Raison |
|-----|--------|
| `trimestres` | Registre des trimestres |
| `grillesTemplates` | Matériel pédagogique réutilisable |
| `echellesTemplates` | Matériel pédagogique réutilisable |
| `cartouches_*` | Matériel pédagogique réutilisable |
| `pratiquesConfigurables` | Configuration globale |
| `modalitesEvaluation` | Configuration globale |
| `modeApplication` | État application |
| `etatsAccordeonsV2` | État UI |

**Clés liées aux COURS** (déjà avec `coursId`) :

| Clé | Lien |
|-----|------|
| `listeCours` | Filtrer par `trimestreId` |
| `groupeEtudiants` | Via `coursId` |
| `productions` | Via `coursId` |
| `presences` | Via `coursId` |
| `evaluationsSauvegardees` | Via `coursId` |
| `snapshots` | Via `coursId` |

#### Nouveau module : js/trimestres.js

**Fonctions principales** :

```javascript
// Lecture du trimestre actif
obtenirTrimestreActif()     // Retourne l'objet trimestre actif
obtenirTrimestreId()        // Retourne l'ID (ex: "h2026")

// Namespacing des clés
cle(nomCle)                 // Helper : cle('calendrierComplet') → 'h2026_calendrierComplet'

// Gestion des trimestres
creerTrimestre(session, annee)     // Crée un nouveau trimestre
changerTrimestreActif(id)          // Change le trimestre et recharge les données
supprimerTrimestre(id)             // Supprime un trimestre et ses données namespacées

// Migration
migrerVersMultiTrimestres()        // Migration automatique au premier chargement
```

**Exemple d'utilisation** :

```javascript
// AVANT (clé fixe)
const calendrier = db.getSync('calendrierComplet', {});

// APRÈS (clé namespacée)
const calendrier = db.getSync(cle('calendrierComplet'), {});
// Si trimestre actif = h2026, lit 'h2026_calendrierComplet'
```

#### Migration des données existantes

**Fonction** : `migrerVersMultiTrimestres()`

**Étapes** :
1. Détecter si l'ancien format existe (`calendrierComplet` sans préfixe)
2. Lire `cadreCalendrier` pour déterminer session + année
3. Générer le `trimestreId` (ex: "h2026")
4. Créer l'entrée dans `trimestres` avec `actif: true`
5. Renommer toutes les clés concernées avec le préfixe
6. Supprimer les anciennes clés non préfixées

**Exemple** :
```javascript
// Avant migration
localStorage: {
  calendrierComplet: {...},
  cadreCalendrier: {session: "H", annee: "2026", ...}
}

// Après migration
localStorage: {
  trimestres: [{id: "h2026", nom: "Hiver 2026", actif: true}],
  h2026_calendrierComplet: {...},
  h2026_cadreCalendrier: {...}
}
```

#### Interface utilisateur

**Dropdown dans l'en-tête** :
```html
<select id="selectTrimestreActif" onchange="changerTrimestreActif(this.value)">
  <option value="h2026" selected>Hiver 2026</option>
  <option value="a2025">Automne 2025</option>
</select>
<button onclick="ouvrirModalNouveauTrimestre()">+ Nouveau</button>
```

**Modal création trimestre** :
- Session : A (Automne) ou H (Hiver)
- Année : 2025, 2026, 2027...
- Bouton "Créer"

#### Fichiers à modifier

| Fichier | Modifications |
|---------|---------------|
| `js/trimestres.js` | **NOUVEAU** - Module gestion multi-trimestres |
| `js/trimestre.js` | Utiliser `cle()` pour toutes les clés calendrier |
| `js/trimestre-v2.js` | Dropdown sélection + utiliser `cle()` |
| `js/calendrier-vue.js` | Utiliser `cle()` pour lecture calendrier |
| `js/horaire.js` | Utiliser `cle()` pour séances |
| `js/cours.js` | Filtrer `listeCours` par `trimestreId` |
| `js/main.js` | Initialiser le système trimestres au démarrage |
| `index.html` | Ajouter dropdown dans l'en-tête |

#### Plan d'implémentation

**Phase 0 : Backup et préparation** ⚠️ OBLIGATOIRE
- [ ] Exporter backup complet via Réglages → Import/Export
- [ ] Sauvegarder le fichier JSON en lieu sûr
- [ ] Documenter l'état actuel (nb étudiants, cours, évaluations)

**Phase 1 : Infrastructure** (js/trimestres.js)
- [ ] Créer le module avec fonctions de base
- [ ] `obtenirTrimestreActif()`, `obtenirTrimestreId()`
- [ ] `cle(nomCle)` pour namespacing
- [ ] `creerTrimestre()`, `supprimerTrimestre()`
- [ ] `changerTrimestreActif()`

**Phase 2 : Migration A2025**
- [ ] `migrerVersMultiTrimestres()` - détection et renommage clés
- [ ] Créer entrée `trimestres` avec A2025 actif
- [ ] Renommer toutes les clés calendrier avec préfixe `a2025_`
- [ ] Mettre à jour `trimestreId` dans les cours existants
- [ ] Intégrer dans main.js au démarrage
- [ ] **VALIDER** : Application fonctionne avec données A2025 migrées

**Phase 3 : Adaptation modules**
- [ ] Adapter trimestre.js (utiliser `cle()`)
- [ ] Adapter trimestre-v2.js (utiliser `cle()`)
- [ ] Adapter calendrier-vue.js (utiliser `cle()`)
- [ ] Adapter horaire.js (utiliser `cle()`)
- [ ] Adapter cours.js (filtrer par `trimestreId`)
- [ ] Adapter saisie-presences.js si nécessaire
- [ ] Adapter snapshots.js si nécessaire

**Phase 4 : Interface sélection**
- [ ] Dropdown sélection trimestre dans index.html (en-tête)
- [ ] Modal création nouveau trimestre
- [ ] Confirmation suppression trimestre
- [ ] Affichage du trimestre actif visible

**Phase 5 : Système d'archivage**
- [ ] `archiverTrimestre(id)` - calcul stats finales + export auto
- [ ] `consulterTrimestreArchive(id)` - mode lecture seule
- [ ] `exporterTrimestreArchive(id)` - export JSON complet
- [ ] `desarchiverTrimestre(id)` - avec confirmation
- [ ] Interface liste des trimestres avec états visuels
- [ ] Bandeau "ARCHIVÉ" en mode consultation

**Phase 6 : Tests complets**
- [ ] Migration A2025 réussie (données intactes)
- [ ] Création nouveau trimestre H2026
- [ ] Changement de trimestre (A2025 ↔ H2026)
- [ ] Isolation des données vérifiée
- [ ] Archivage d'un trimestre
- [ ] Consultation d'un trimestre archivé
- [ ] Export d'un trimestre archivé
- [ ] Désarchivage (avec confirmation)

#### Transfert sécurisé des données A2025

**⚠️ CRITIQUE** : Les données actuelles A2025 doivent être transférées AVANT toute création de nouveau trimestre.

**Contexte actuel** (19 décembre 2025) :
- Données A2025 stockées dans clés non préfixées (`calendrierComplet`, etc.)
- Ces données représentent un trimestre complet avec étudiants, évaluations, présences
- Risque de pollution si on crée H2026 sans migrer d'abord

**Séquence de transfert obligatoire** :

```
ÉTAPE 0 : BACKUP COMPLET
    ↓ Exporter via Réglages → Import/Export
    ↓ Conserver fichier backup-YYYY-MM-DD.json

ÉTAPE 1 : MIGRATION A2025
    ↓ Détecter cadreCalendrier.session = "A", annee = "2025"
    ↓ Créer entrée trimestres: [{id: "a2025", actif: true}]
    ↓ Renommer TOUTES les clés : calendrierComplet → a2025_calendrierComplet
    ↓ Renommer cours avec trimestreId: "a2025"

ÉTAPE 2 : VALIDATION
    ↓ Vérifier que l'application fonctionne avec a2025_*
    ↓ Confirmer accès aux étudiants, évaluations, présences

ÉTAPE 3 : NOUVEAU TRIMESTRE (optionnel)
    ↓ Créer H2026 via interface
    ↓ Données H2026 dans h2026_* (vide au départ)
    ↓ A2025 intact dans a2025_*
```

**Clés à transférer pour A2025** :

| Clé actuelle | Nouvelle clé | Données |
|--------------|--------------|---------|
| `calendrierComplet` | `a2025_calendrierComplet` | 124 jours |
| `cadreCalendrier` | `a2025_cadreCalendrier` | Config trimestre |
| `evenementsPrevus` | `a2025_evenementsPrevus` | Congés planifiés |
| `evenementsImprevus` | `a2025_evenementsImprevus` | Congés ajoutés |
| `seancesCompletes` | `a2025_seancesCompletes` | Séances générées |
| `horaireHebdo` | `a2025_horaireHebdo` | Horaire configuré |
| `presences` | Filtrer par coursId A2025 | Toutes présences |
| `snapshots` | Filtrer par coursId A2025 | Captures progression |

#### Système d'archivage des trimestres

**Objectif** : Permettre de "fermer" un trimestre terminé pour le préserver en lecture seule.

**Structure enrichie du registre** :

```javascript
{
  id: "a2025",
  nom: "Automne 2025",
  session: "A",
  annee: "2025",
  dateCreation: "2025-08-15",
  dateFin: "2025-12-20",           // 🆕 Date de clôture
  actif: false,
  archive: true,                    // 🆕 Trimestre archivé (lecture seule)
  statistiquesFinales: {            // 🆕 Snapshot des stats à la clôture
    nbEtudiants: 30,
    moyenneEngagement: 78.5,
    tauxReussite: 85.2
  }
}
```

**États d'un trimestre** :

| État | actif | archive | Description |
|------|-------|---------|-------------|
| **Actif** | `true` | `false` | Trimestre en cours, modifications permises |
| **Inactif** | `false` | `false` | Trimestre passé, encore modifiable |
| **Archivé** | `false` | `true` | Trimestre fermé, lecture seule |

**Fonctions d'archivage** :

```javascript
// Archiver un trimestre (fin de session)
archiverTrimestre(id)
    → Calcule statistiques finales
    → Définit dateFin = aujourd'hui
    → Définit archive = true
    → Génère export JSON automatique (backup)

// Consulter un trimestre archivé
consulterTrimestreArchive(id)
    → Charge les données en lecture seule
    → Interface en mode consultation (pas de boutons modifier/supprimer)
    → Bandeau visuel "ARCHIVÉ - Lecture seule"

// Exporter un trimestre archivé
exporterTrimestreArchive(id)
    → Génère fichier JSON complet du trimestre
    → Inclut toutes les données : cours, étudiants, évaluations, présences, snapshots
    → Format : trimestre-a2025-archive-YYYY-MM-DD.json

// Restaurer un trimestre (désarchiver)
desarchiverTrimestre(id)
    → Nécessite confirmation explicite
    → Retire le flag archive = false
    → Permet modifications à nouveau
```

**Interface d'archivage** :

```
┌─────────────────────────────────────────────────────────────┐
│  TRIMESTRES                                                  │
├─────────────────────────────────────────────────────────────┤
│  ● Hiver 2026 (actif)                    [Sélectionner]     │
│  ○ Automne 2025                          [Archiver] [→]     │
│  📁 Hiver 2025 (archivé)                 [Consulter] [📤]   │
│  📁 Automne 2024 (archivé)               [Consulter] [📤]   │
├─────────────────────────────────────────────────────────────┤
│  [+ Nouveau trimestre]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Workflow typique fin de trimestre** :

```
1. Terminer les évaluations et présences
2. Vérifier les indices A-C-P finaux
3. Générer les rapports si nécessaire
4. Cliquer "Archiver" sur le trimestre
5. Confirmer l'archivage (irréversible sans désarchivage)
6. Export automatique généré
7. Créer le nouveau trimestre
```

#### Précautions

**Backup obligatoire** : Exporter toutes les données AVANT migration (Réglages → Import/Export)

**Ordre de migration critique** :
1. Backup complet
2. Migrer A2025 vers format namespacé
3. Valider le fonctionnement
4. Seulement ensuite créer H2026

**Rétrocompatibilité** : Le code doit fonctionner même sans migration (fallback sur clés sans préfixe)

**Performance** : Ne pas charger les données des trimestres inactifs/archivés (lazy loading)

**Intégrité des archives** : Un trimestre archivé ne peut JAMAIS être modifié sans désarchivage explicite

#### Export pour la recherche (Beta 95)

**Objectif** : Exporter les données dans un format anonymisé pour analyse pédagogique ou publication.

**Fonctions principales** :

```javascript
// Générer une clé d'anonymisation (32 caractères aléatoires)
genererCleAnonymisation()

// Exporter au format recherche (anonymisé)
exporterFormatRecherche(options)
    → Génère clé d'anonymisation SHA-256
    → Anonymise tous les DA (hash tronqué 8 caractères)
    → Structure selon spécifications (meta, contexte, observations, calculs)
    → Télécharge 2 fichiers :
      1. monitorage_[trimestre]_anonyme_[date].json (partageable)
      2. table_correspondance_[trimestre]_PRIVE_[date].json (NE PAS PARTAGER)

// Lancer depuis l'interface
lancerExportRecherche()
    → Bouton dans Réglages → Trimestre → Export pour la recherche
    → Affiche résultat avec statistiques
```

**Structure du JSON exporté** :

```javascript
{
  meta: {
    version_monitorage: "6.0.0-beta95",
    version_format: "1.0",
    date_export: "2024-12-22T...",
    trimestre: { id, nom, session, annee },
    anonymisation: { methode, cle_hash }
  },
  contexte: {
    cours: { code, titre, groupe },
    grille_evaluation: {
      criteres: [{ code, nom, ponderation, niveau_solo, type }]
    },
    calendrier: { date_debut, date_fin },
    artefacts: [{ id, titre, date_echeance, semaine }]
  },
  observations: {
    etudiants: [{ id_anonyme, statut, profil }],
    presences: [{ id_etudiant, date, statut, duree_cours }],
    evaluations: [{
      id_etudiant, id_artefact, date_echeance,
      criteres: { structure: "M", rigueur: "D", ... },
      commentaires: { structure: "...", ... },
      note_finale, niveau_final
    }]
  },
  calculs: {
    formules: { indice_A, indice_C, indice_P, engagement },
    snapshots_hebdomadaires: [{ semaine, indices_par_etudiant }],
    indices_finaux: [{ id_etudiant, A_final, C_final, P_final }],
    performance_par_critere: [{ id_etudiant, structure: {nb_I, nb_D, nb_M, nb_E} }]
  }
}
```

**Classification SOLO automatique** :
- Structure, Rigueur, Français → `multistructural` (fondamental)
- Plausibilité → `relational` (transitionnel)
- Nuance → `extended_abstract` (complexe)

**Documentation détaillée** : Voir `ARCHITECTURE_EXPORT_RECHERCHE.md` et `SPECIFICATIONS_EXPORT_JSON_A2025.md`

### Vision stratégique Multi-Trimestres

**Objectif à long terme** : Mesurer non seulement les résultats d'apprentissage (A-C-P), mais aussi l'efficacité de l'enseignement via comparaisons et analyses longitudinales.

#### Documents de référence

| Document | Contenu |
|----------|---------|
| `ARCHITECTURE_EXPORT_RECHERCHE.md` | Format export anonymisé, séparation observations/calculs |
| `SPECIFICATIONS_EXPORT_JSON_A2025.md` | Structure données pour analyse, critères SRPNF, SOLO |
| `Documentation/Plans/PLAN_UX_BETA_95.md` | Architecture UI, modèle Trimestre → Cours → Groupe-cours |

#### Architecture des données

- **Namespacing** : Clés préfixées par trimestreId (`a2025_*`, `h2026_*`)
- **Cours** : Liés par `trimestreId` dans `listeCours`
- **Étudiants/évaluations/présences** : Liés par `coursId`
- **Indices A-C-P** : Calculés et historisés dans `snapshots`

#### Workflow fin de trimestre

```
1. Exporter backup complet (Réglages → Import/Export)
2. Créer nouveau trimestre (creerTrimestre('H', '2026', false))
3. Archiver trimestre terminé (archiverTrimestre('a2025'))
4. Activer nouveau trimestre (changerTrimestreActif('h2026'))
5. (Optionnel) Export anonymisé (lancerExportRecherche())
```

#### Analyses futures possibles

- **Comparaison inter-trimestres** : A2025 vs H2026 (même cours, élèves différents)
- **Comparaison inter-groupes** : Groupe 01 PAN vs Groupe 02 Sommative
- **Patterns de blocage** : Critères systématiquement < M (taxonomie SOLO)
- **Prédicteurs de décrochage** : Affiner les seuils A-C-P
- **Efficacité des jetons** : Impact sur progression

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
│   ├── trimestres.js                     # ✅ IMPLÉMENTÉ (Beta 95) - Gestion multi-trimestres
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

## État actuel du projet (octobre 2025 - janvier 2026)

> **Version actuelle** : Beta 95 (Stabilisation H2026)
> **Objectif** : Version stable pour le trimestre Hiver 2026 (5 janvier 2026)
> **Plan détaillé** : `PLAN_STABILISATION_BETA_95.md`

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

**Fichier intermédiaire: Beta 93.5 (Architecture multi-cours et groupe démo)**

**Nom**: Non applicable (changements intégrés progressivement)
**Date de développement**: 11 décembre 2025
**Version**: Beta 93.5
**Statut**: ✅ Complété et intégré dans Beta 94

**Objectif**: Préparer l'architecture pour supporter plusieurs cours-groupes simultanément et intégrer un groupe démo préchargé.

### Architecture Trimestre → Cours → Groupe → Étudiants

**Hiérarchie pédagogique réelle** :

```
TRIMESTRE (période temporelle unique : H2026, A2025, etc.)
    ↓
COURS (un ou plusieurs : 601-101, 601-102, 601-103)
    ↓
GROUPE (un ou plusieurs par cours : 01, 02, 03, 9999)
    ↓
ÉTUDIANTS + DONNÉES (évaluations, présences)
```

**Exemple concret - Hiver 2026** :
- **1 trimestre actif** : H2026
- **3 cours** : 601-101, 601-102, 601-103
- **5 groupes** :
  * 601-101 Groupe 01 (30 étudiants)
  * 601-101 Groupe 02 (28 étudiants)
  * 601-102 Groupe 01 (32 étudiants)
  * 601-102 Groupe 03 (25 étudiants)
  * 601-103 Groupe 01 (29 étudiants)

### Modifications des structures de données

**1. Cours - Ajout `trimestreId`** :
```javascript
{
    id: "601-101-h2026-01",
    sigle: "601-101",
    titre: "Écriture et littérature",
    session: "H",
    annee: "2026",
    trimestreId: "h2026",         // 🆕 Lien vers trimestre
    groupe: "01",
    actif: true
}
```

**2. Étudiants - Ajout `coursId`** :
```javascript
{
    da: "2234567",
    prenom: "Émilie",
    nom: "Tremblay",
    groupe: "01",                 // ⚠️ Ambigu seul
    coursId: "601-101-h2026-01"  // 🆕 Lien précis vers cours-groupe
}
```

**3. Productions - Ajout `coursId`** :
```javascript
{
    id: "PROD1234567890",
    nom: "Analyse littéraire",
    coursId: "601-101-h2026-01"  // 🆕 Lien vers cours
}
```

**4. Présences - Structure par date** :
```javascript
[
    {
        date: "2026-01-15",
        da: "2234567",
        heures: 2.0,
        coursId: "601-101-h2026-01"  // 🆕 Lien vers cours (via migration)
    }
]
```

### Système de migrations automatiques

**Nouveau module** : `js/migrations.js` (189 lignes)

**4 migrations Beta 93.5** :
1. **Étudiants → coursId** : Associe chaque étudiant au cours actif
2. **Productions → coursId** : Associe chaque production au cours actif
3. **Présences → coursId** : Associe chaque présence au cours actif
4. **Cours → trimestreId** : Génère trimestreId depuis session+annee (ex: "h2026")

**Fonction principale** :
```javascript
function executerMigrationsBeta935() {
    const resultats = {
        etudiants: migrerEtudiantsVersCoursId(),
        productions: migrerProductionsVersCoursId(),
        presences: migrerPresencesVersCoursId(),
        cours: migrerCoursVersTrimestreId()
    };
    return resultats;
}
```

**Exécution** : Automatique au chargement dans `js/main.js`

### Groupe démo préchargé

**Interface utilisateur** :
- **Emplacement** : Réglages → Trimestre → Section "Données de démonstration"
- **Contrôle** : Checkbox "Utiliser les données de démonstration (groupe 9999)"
- **Fonction** : `basculerDonneesDemo(activer)` dans `js/trimestre.js` (lignes 1152-1280)

**Caractéristiques du groupe demo** :
- **Trimestre** : H2026 (fictif)
- **Cours** : 601-101 Écriture et littérature
- **Enseignant** : Primo Primavera
- **Groupe** : 9999 (identifiant fictif réservé)
- **Étudiants** : 10 étudiants fictifs avec programmes variés
- **Productions** : 4 artefacts avec échéances
- **Évaluations** : 40 évaluations complètes (notes IDME)
- **Présences** : 8 semaines générées dynamiquement (92% assiduité moyenne)
- **Identifiant unique** : `601-101-h2026-9999`

**Contenu du pack** :
- **Fichier source** : `pack-demarrage-complet.json` (99 KB)
- **Module chargeur** : `window.PACK_DEMARRAGE` (chargé via script)
- **Grilles** : Grille SRPNF complète
- **Échelle** : IDME (4 niveaux)
- **Cartouches** : Commentaires de rétroaction prédéfinis

**Fonctionnement** :

```javascript
// Activation (checkbox cochée)
basculerDonneesDemo(true)
    ↓
Fusion intelligente avec données existantes
    ↓
Cours demo ajouté (si absent)
10 étudiants ajoutés (groupe 9999)
4 productions ajoutées (liées au cours demo)
40 évaluations ajoutées (réparties sur artefacts)
Présences générées dynamiquement (pattern 92%)
Grilles/échelles fusionnées (si absentes)
    ↓
Groupe 9999 immédiatement disponible dans l'application

// Désactivation (checkbox décochée)
basculerDonneesDemo(false)
    ↓
supprimerGroupe9999()
    ↓
Toutes les données associées au groupe 9999 supprimées
    ↓
Application revient à l'état sans demo
```

**Génération dynamique des présences** :
- Fonction `genererPresencesDemo()` dans `js/trimestre.js`
- Pattern réaliste : 92% d'assiduité moyenne
- Variations individuelles pour réalisme
- 8 semaines de données générées
- Dates calculées depuis le calendrier du trimestre

**Suppression propre** :
- Fonction `supprimerGroupe9999()` supprime :
  * Le cours demo
  * Les 10 étudiants (DA 2234567-2234576)
  * Les productions liées
  * Les évaluations liées
  * Les présences liées
- Données utilisateur préservées intactes

### Bénéfices Beta 93.5

✅ **Architecture évolutive** : Prépare le terrain pour support multi-cours (Beta 95+)
✅ **Isolation des données** : Chaque cours-groupe est clairement séparé
✅ **Groupe démo intégré** : Nouveaux utilisateurs peuvent explorer avec données réalistes
✅ **Migrations automatiques** : Données existantes migrées transparemment
✅ **Suppression propre** : Groupe démo supprimable en un clic

### Statistiques Beta 93.5

| Métrique | Valeur |
|----------|--------|
| **Date** | 11 décembre 2025 |
| **Fichiers créés** | 1 (migrations.js) |
| **Fichiers modifiés** | 4 (cours.js, db.js, main.js, pack-demarrage.js) |
| **Lignes ajoutées** | ~250 lignes |
| **Migrations** | 4 migrations automatiques |

**Documentation complète** :
- `Documentation/Plans/PLAN_BETA_93.5_GROUPE_DEMO.md`
- `Documentation/Plans/PLAN_BETA_93.5_MULTI_COURS.md`

---

**Fichier actuel: Beta 95 (Stabilisation H2026)**

**Nom**: `index.html`
**Date de création**: 27 décembre 2025
**Version actuelle**: Beta 95
**Statut**: 🔄 En stabilisation (objectif : 5 janvier 2026)

**Créée à partir de**: Beta 94 (Snapshots et suivi longitudinal)
**Objectif**: Version stable pour le trimestre H2026
**Plan détaillé**: `PLAN_STABILISATION_BETA_95.md`

### Corrections critiques Beta 95 (27 décembre 2025)

**1. Filtrage automatique par coursId** (commit `101dbe4`)

Problème : ~120 endroits utilisaient `obtenirDonneesSelonMode()` sans filtrer par coursId, causant une contamination des données entre cours.

Solution dans `js/modes.js` :
```javascript
// Filtrage automatique pour groupeEtudiants, productions, presences, evaluationsSauvegardees
const clesAvecCoursId = ['groupeEtudiants', 'productions', 'presences', 'evaluationsSauvegardees'];
if (clesAvecCoursId.includes(cle) && Array.isArray(donnees)) {
    const coursActif = db.getSync('infoCours', null);
    if (coursActif && coursActif.id) {
        donnees = donnees.filter(item => item.coursId === coursActif.id);
    }
}
```

**2. coursId dans création de données** (commit `fc2d550`)

Ajout de `coursId` lors de la création :
- `groupe.js` : `addStudent()`, `parseAndPreview()`
- `saisie-presences.js` : Enregistrement présences
- `evaluation.js` : Sauvegarde évaluations
- `productions.js` : Nouvelles productions

**3. Correction infoCours dans Primo** (commit `400a627`)

Primo sauvegardait seulement `{id, trimestreId}` au lieu du cours complet.
Fix : `db.setSync('infoCours', nouveauCours)` avec l'objet cours complet.

### Audit technique complété

| Phase | Statut |
|-------|--------|
| 1.1 Architecture données | ✅ coursId dans toutes les entités |
| 1.2 Flux de données | ✅ Création/lecture cohérentes |
| 1.3 Modes d'application | ✅ Normal/Assisté/Anonymisé OK |
| 1.4 Audit visuel | ✅ Design system solide (50+ variables CSS) |
| 2.1 Bugs critiques | ✅ Tous corrigés |
| 2.2 Robustesse | ✅ Validation doublons, migrations auto |
| 2.3 Visuelles | ✅ Compromis acceptable |

### Statistiques Beta 95

| Métrique | Valeur |
|----------|--------|
| **Date début** | 27 décembre 2025 |
| **Objectif** | 5 janvier 2026 |
| **Commits** | ~10 commits |
| **Fichiers modifiés** | 8+ fichiers JS |
| **Bugs corrigés** | 3 critiques (coursId) |

---

**Fichier précédent: Beta 94 (Snapshots et suivi longitudinal)**

**Nom**: `index.html`
**Date de création**: 10 décembre 2025
**Version**: Beta 94
**Statut**: ✅ Archivé

**Créée à partir de**: Beta 93.5 (architecture multi-cours intégrée)
**Provenance**: Beta 93 avec système universel 100% complet
**Changelog**: Développement sur 3 jours (10-12 décembre 2025)

**Développement système de snapshots** (10-12 décembre 2025):

### Session 1 : Système de snapshots hebdomadaires (10 décembre)

**Objectif** : Capturer l'évolution longitudinale des indices A-C-P pour visualiser la progression dans le temps

**Nouveau module** : `js/snapshots.js` (765 lignes)

**Fonctionnalités implémentées** :
1. **Capture automatique** : À chaque saisie de présences, un snapshot est créé
2. **Données capturées** : A ponctuel, A_cumulatif, C, P, pattern, niveau RàI
3. **Reconstruction rétroactive** : Recalcul de tous les snapshots historiques
4. **Graphiques Chart.js** : Visualisation évolution individuelle et groupe

**Distinction ponctuel vs cumulatif** :

| Graphique | A | C | P | Rationale |
|-----------|---|---|---|-----------|
| **Individuel** | Cumulatif | Cumulatif | Cumulatif | Dépistage impact à long terme |
| **Groupe** | Ponctuel | Ponctuel | Cumulatif | Détection variations récentes |

**Rationale pédagogique** :
- **Indices cumulatifs (individuel)** : Une absence passée ou un travail non remis peuvent avoir des conséquences durables sur l'apprentissage. Les indices cumulatifs permettent de mieux dépister cet impact à long terme.
- **Indices ponctuals (groupe)** : Permettent de détecter rapidement les problèmes émergents (ex: séance difficile, échéance problématique).

**Structure des données** :
```javascript
{
    id: "snapshot-2025-09-03",
    dateSeance: "2025-09-03",
    numSemaine: 1,
    etudiants: [
        {
            da: "9000116",
            nom: "Eve B.",
            A: 100,              // Ponctuel (pour graphique groupe)
            A_cumulatif: 100,    // Cumulatif (pour graphique individuel)
            C: 67,               // Cumulatif
            P: 75.5,             // Cumulatif
            pattern: "stable",
            rai: 1
        },
        // ...
    ]
}
```

**Fichiers clés** :
- `js/snapshots.js` : Capture, reconstruction, API
- `js/graphiques-progression.js` : Visualisations Chart.js
- `js/saisie-presences.js` : Déclencheur automatique

### Session 2 : Correction bug A_cumulatif (12 décembre)

**Problème identifié** : Eve affichait 92% d'assiduité au lieu de 100%

**Investigation** :
- Graphique individuel : A_cumulatif chute à 92% à la semaine 6 (2025-10-01)
- Calcul : 24h présentes / 26h offertes = 92.3%
- Cause : **Séance fantôme le 30 septembre 2025** (un mardi sans cours)

**Scripts de diagnostic créés** :
- `test_graphique_c.js` : Vérification données snapshots
- `test_c_individuel.js` : Simulation calcul C par semaine
- `test_eve_presences.js` : Analyse détaillée présences Eve
- `test_eve_30sept.js` : Investigation séance problématique
- `supprimer_30sept.js` : Script de correction

**Solution appliquée** :
1. Identification : 30 étudiants avec absence enregistrée le 30 septembre (jour sans cours)
2. Suppression : 30 présences fantômes supprimées (911 → 881 présences)
3. Reconstruction : Snapshots recalculés avec données corrigées
4. Résultat : Assiduité Eve corrigée 92.3% → 100.0% (24h/24h sur 12 séances)

**Leçon apprise** : Importance de valider la cohérence entre horaire configuré et séances enregistrées

### Session 3 : Documentation complète (12 décembre)

**Documentation ajoutée** :

1. **Section Aide de l'application** (index.html:8600-8666)
   - Carte "6. Captures de progression (Snapshots hebdomadaires)"
   - Explication fonctionnement automatique
   - Distinction ponctuel vs cumulatif (graphiques individuel et groupe)
   - Procédure reconstruction snapshots
   - Exemple concret (cas Eve)
   - Avantages des snapshots

2. **Titres des graphiques** (graphiques-progression.js)
   - Graphique individuel (ligne 261) : "Évolution des indices A-C-P (par séance) / Indices cumulatifs depuis le début du trimestre"
   - Graphique groupe (ligne 499) : "Évolution du groupe - Moyennes A-C-P (par séance) / A et C : ponctuals (cette séance) • P : cumulatif (depuis le début)"

3. **CLAUDE.md** (ce fichier)
   - Documentation complète système snapshots
   - Rationale pédagogique
   - Bugs corrigés
   - Scripts créés

**Impact Beta 94** :
- ✅ Suivi longitudinal complet de la progression
- ✅ Visualisation graphique évolution A-C-P
- ✅ Détection patterns temporels (chutes, paliers, rebonds)
- ✅ Reconstruction rétroactive pour corrections
- ✅ Documentation complète pour utilisateurs

### Statistiques Beta 94

| Métrique | Valeur |
|----------|--------|
| **Sessions** | 3 (10-12 décembre) |
| **Commits** | ~8 commits |
| **Fichiers créés** | 2 (snapshots.js, 5 scripts de test) |
| **Fichiers modifiés** | 6 fichiers JS + 1 HTML |
| **Lignes ajoutées** | ~1200 lignes |
| **Bugs corrigés** | 1 bug critique (séance fantôme) |

**Commits principaux** :
1. Implémentation système snapshots hebdomadaires
2. Correction bug A_cumulatif (séance fantôme)
3. Documentation complète (Aide + CLAUDE.md)

---

**Fichier précédent: Beta 93 (Système universel)**

**Nom**: `index 93.html`
**Date de création**: 3 décembre 2025
**Version actuelle**: Beta 93
**Statut**: ✅ Archivé

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

### Anonymisation ne fonctionne pas dans le formulaire d'évaluation (CORRIGÉ Beta 95 - 29 déc 2025)
**Symptômes** : La checkbox "Anonymiser" est cochée mais les vrais noms/DA s'affichent
**Cause** : `mettreAJourBandeauArchive()` réinitialisait le mode à 'normal' à chaque navigation
**Solution appliquée** :
1. `trimestres.js` : Synchroniser l'état de la checkbox avec le mode stocké au lieu de réinitialiser
2. `evaluation.js` : Lire le mode directement depuis `db.getSync('modeApplication')` car `modeActuel` est une variable locale à `modes.js`
**Commits** : `8794971`, `210ed93`, `08ada03`

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