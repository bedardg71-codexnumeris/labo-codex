# Migration vers IndexedDB - Plan stratégique
**Date:** 10 novembre 2025
**Version cible:** Beta 95 → Version 1.0
**Auteur:** Grégoire Bédard + Claude Code

---

## 1. Contexte et objectifs

### Problème actuel
- **localStorage** limité à 5-10 MB selon navigateurs
- Capacité actuelle: ~2.74 MB pour 1 groupe (30 étudiants)
- **Projection:** Maximum 2-3 groupes avant saturation
- API synchrone bloque l'interface lors de gros calculs

### Objectifs de la migration
1. **Scalabilité:** Support de 10-15 groupes sans dégradation
2. **Performance:** Requêtes asynchrones pour UI réactive
3. **Rétrocompatibilité:** Migration automatique des données existantes
4. **Autonomie:** Conservation du fonctionnement 100% hors-ligne
5. **Confidentialité:** Données restent locales (navigateur uniquement)

---

## 2. IndexedDB : Architecture technique

### Concepts fondamentaux

```javascript
// Structure hiérarchique
Database (monitorage_db)
  └─ Object Store (équivalent d'une table SQL)
      ├─ cours (clé: id)
      ├─ etudiants (clé: da, index: groupeId)
      ├─ presences (clé: id, index: [da, date])
      ├─ evaluations (clé: id, index: [da, productionId])
      ├─ productions (clé: id, index: groupeId)
      ├─ grilles (clé: id)
      ├─ calendrier (clé: groupeId)
      └─ indices (clé: [da, type], index: groupeId)
```

### Avantages par rapport à localStorage

| Critère | localStorage | IndexedDB |
|---------|-------------|-----------|
| **Capacité** | 5-10 MB | 50 MB min, souvent illimitée |
| **Structure** | Clé-valeur plate | Base de données relationnelle |
| **Requêtes** | Tout charger en RAM | Filtrage côté DB (index) |
| **Performance** | Synchrone (bloquant) | Asynchrone (non-bloquant) |
| **Transactions** | Aucune | ACID complètes |
| **Indexes** | Aucun | Multiples index possibles |
| **Versioning** | Manuel | Migrations automatiques |

### Capacités de stockage (estimation)

```
localStorage actuel:
- 1 groupe (30 étudiants): 2.74 MB
- 3 groupes: ~8.2 MB → LIMITE ATTEINTE

IndexedDB (conservateur 50 MB):
- 1 groupe: 2.74 MB
- 15 groupes: ~41 MB → OK
- 20 groupes: ~55 MB → Limite navigateur
```

---

## 3. Stratégie de migration en 3 phases

### PHASE 1 : Couche d'abstraction (Beta 91-92)
**Durée:** 2-3 semaines
**Objectif:** Créer une API unifiée sans toucher aux modules existants

```javascript
// Nouveau module: js/storage-adapter.js
// API unique qui fonctionne avec localStorage OU IndexedDB

const StorageAdapter = {
    // Méthodes uniformes
    async get(store, key) { ... },
    async set(store, key, value) { ... },
    async getAll(store, filter) { ... },
    async query(store, indexName, value) { ... },
    async delete(store, key) { ... },

    // Détection automatique du backend
    backend: 'localStorage' // ou 'indexedDB'
};

// Les modules utilisent l'adapter au lieu de localStorage directement
// Exemple dans etudiants.js (ancien code)
const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');

// Exemple avec l'adapter (nouveau code)
const etudiants = await StorageAdapter.getAll('etudiants');
```

**Fichiers à créer:**
- `js/storage-adapter.js` (API unifiée)
- `js/indexeddb-manager.js` (implémentation IndexedDB)
- `js/migration-tool.js` (outil de migration localStorage → IndexedDB)

**Tests critiques:**
- ✅ Adapter fonctionne avec localStorage (mode legacy)
- ✅ Pas de régression dans les modules existants
- ✅ Migration invisible pour l'utilisateur

---

### PHASE 2 : Migration modules de lecture (Beta 93)
**Durée:** 2 semaines
**Objectif:** Migrer les modules qui LISENT les données uniquement

**Modules prioritaires (pas d'écriture):**
1. `tableau-bord-apercu.js` - Lecture indices A-C-P-R
2. `profil-etudiant.js` - Lecture profil complet
3. `presences-apercu.js` - Lecture statistiques
4. `evaluations-apercu.js` - Lecture statistiques
5. `calendrier-vue.js` - Lecture calendrier
6. `statistiques.js` - Lecture config

**Exemple de migration:**

```javascript
// AVANT (localStorage synchrone)
function chargerApercuPresences() {
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');
    calculerStatistiques(etudiants, presences);
}

// APRÈS (IndexedDB asynchrone)
async function chargerApercuPresences() {
    const etudiants = await StorageAdapter.getAll('etudiants');
    const presences = await StorageAdapter.getAll('presences');
    calculerStatistiques(etudiants, presences);
}
```

**Pattern de migration systématique:**
1. Ajouter `async` à la fonction principale
2. Remplacer `localStorage.getItem()` par `await StorageAdapter.get()`
3. Remplacer `JSON.parse()` par appel direct (déjà parsé)
4. Tester unitairement chaque module

---

### PHASE 3 : Migration modules d'écriture (Beta 94-95)
**Durée:** 3-4 semaines
**Objectif:** Migrer les modules qui ÉCRIVENT les données (plus critique)

**Modules critiques (avec écriture):**
1. `etudiants.js` - Ajout/modification étudiants
2. `saisie-presences.js` - Enregistrement présences
3. `portfolio.js` - Calcul et stockage indices C-P
4. `productions.js` - Gestion évaluations
5. `trimestre.js` - Génération calendrier
6. `interventions.js` - Création interventions RàI
7. `pratiques.js` - Configuration pratiques

**Exemple migration écriture avec transactions:**

```javascript
// AVANT (localStorage - pas de transaction)
function sauvegarderPresences(presences) {
    const presencesActuelles = JSON.parse(localStorage.getItem('presences') || '[]');
    presencesActuelles.push(...presences);
    localStorage.setItem('presences', JSON.stringify(presencesActuelles));

    // Si crash ici, données incohérentes
    calculerIndicesAssiduite();
}

// APRÈS (IndexedDB - transaction ACID)
async function sauvegarderPresences(presences) {
    const transaction = await StorageAdapter.beginTransaction(['presences', 'indices']);

    try {
        // Toutes les opérations ou aucune
        await transaction.addAll('presences', presences);
        await transaction.set('indices', 'lastUpdate', Date.now());
        await calculerIndicesAssiduite(transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback(); // Annule tout en cas d'erreur
        throw error;
    }
}
```

**Défis techniques:**
- Gestion erreurs asynchrones
- Transactions multi-stores
- Rechargement UI après écriture
- Migration données existantes sans perte

---

## 4. Architecture technique détaillée

### Schéma de la base de données

```javascript
// js/indexeddb-manager.js - Définition du schéma

const DB_NAME = 'monitorage_db';
const DB_VERSION = 1;

const SCHEMA = {
    // Store 1: Cours et configuration
    cours: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'session', keyPath: 'session', unique: false },
            { name: 'actif', keyPath: 'actif', unique: false }
        ]
    },

    // Store 2: Étudiants (avec relation au groupe)
    etudiants: {
        keyPath: 'da',
        indexes: [
            { name: 'groupeId', keyPath: 'groupeId', unique: false },
            { name: 'nom', keyPath: 'nom', unique: false },
            { name: 'statut', keyPath: 'statut', unique: false }
        ]
    },

    // Store 3: Présences
    presences: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'da', keyPath: 'da', unique: false },
            { name: 'date', keyPath: 'date', unique: false },
            { name: 'da_date', keyPath: ['da', 'date'], unique: true }
        ]
    },

    // Store 4: Évaluations
    evaluations: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'da', keyPath: 'da', unique: false },
            { name: 'productionId', keyPath: 'productionId', unique: false },
            { name: 'da_production', keyPath: ['da', 'productionId'], unique: false }
        ]
    },

    // Store 5: Productions
    productions: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'groupeId', keyPath: 'groupeId', unique: false },
            { name: 'type', keyPath: 'type', unique: false }
        ]
    },

    // Store 6: Grilles de critères
    grilles: {
        keyPath: 'id',
        indexes: [
            { name: 'nom', keyPath: 'nom', unique: false }
        ]
    },

    // Store 7: Calendrier (un par groupe)
    calendrier: {
        keyPath: 'groupeId',
        indexes: []
    },

    // Store 8: Indices calculés (A-C-P-R)
    indices: {
        keyPath: ['da', 'type'], // Clé composite
        indexes: [
            { name: 'da', keyPath: 'da', unique: false },
            { name: 'type', keyPath: 'type', unique: false },
            { name: 'timestamp', keyPath: 'timestamp', unique: false }
        ]
    },

    // Store 9: Interventions RàI
    interventions: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'da', keyPath: 'da', unique: false },
            { name: 'dateCreation', keyPath: 'dateCreation', unique: false },
            { name: 'statut', keyPath: 'statut', unique: false }
        ]
    },

    // Store 10: Métadonnées système
    metadata: {
        keyPath: 'key',
        indexes: []
    }
};
```

### API du StorageAdapter

```javascript
// js/storage-adapter.js

class StorageAdapter {
    constructor() {
        this.backend = this.detectBackend();
        this.db = null;
    }

    // Détection automatique du meilleur backend
    detectBackend() {
        if ('indexedDB' in window) {
            return 'indexedDB';
        }
        console.warn('IndexedDB non disponible, fallback sur localStorage');
        return 'localStorage';
    }

    // Initialisation
    async init() {
        if (this.backend === 'indexedDB') {
            this.db = await IndexedDBManager.open();
        }
    }

    // Lecture simple
    async get(store, key) {
        if (this.backend === 'localStorage') {
            const data = localStorage.getItem(`${store}_${key}`);
            return data ? JSON.parse(data) : null;
        }

        return await IndexedDBManager.get(this.db, store, key);
    }

    // Écriture simple
    async set(store, key, value) {
        if (this.backend === 'localStorage') {
            localStorage.setItem(`${store}_${key}`, JSON.stringify(value));
            return;
        }

        await IndexedDBManager.set(this.db, store, key, value);
    }

    // Lecture multiple avec filtre
    async getAll(store, filter = null) {
        if (this.backend === 'localStorage') {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(store));
            let items = keys.map(k => JSON.parse(localStorage.getItem(k)));

            if (filter) {
                items = items.filter(filter);
            }

            return items;
        }

        return await IndexedDBManager.getAll(this.db, store, filter);
    }

    // Requête par index (UNIQUEMENT IndexedDB)
    async query(store, indexName, value) {
        if (this.backend === 'localStorage') {
            // Fallback: getAll + filtre manuel
            const all = await this.getAll(store);
            return all.filter(item => item[indexName] === value);
        }

        return await IndexedDBManager.queryByIndex(this.db, store, indexName, value);
    }

    // Suppression
    async delete(store, key) {
        if (this.backend === 'localStorage') {
            localStorage.removeItem(`${store}_${key}`);
            return;
        }

        await IndexedDBManager.delete(this.db, store, key);
    }

    // Transaction (UNIQUEMENT IndexedDB)
    async beginTransaction(stores) {
        if (this.backend === 'localStorage') {
            throw new Error('Transactions non supportées avec localStorage');
        }

        return await IndexedDBManager.transaction(this.db, stores);
    }
}

// Instance globale
const storage = new StorageAdapter();
```

---

## 5. Migration des données existantes

### Outil de migration automatique

```javascript
// js/migration-tool.js

class MigrationTool {

    /**
     * Migre toutes les données de localStorage vers IndexedDB
     * Appelée automatiquement au premier lancement avec IndexedDB
     */
    async migrateFromLocalStorage() {
        console.log('🔄 Migration localStorage → IndexedDB...');

        const stores = [
            'listeCours',
            'groupeEtudiants',
            'presences',
            'evaluationsSauvegardees',
            'productions',
            'grillesTemplates',
            'calendrierComplet',
            'indicesCP',
            'indicesAssiduite',
            'interventions'
        ];

        let totalMigre = 0;

        for (const storeKey of stores) {
            const data = localStorage.getItem(storeKey);

            if (data) {
                const parsed = JSON.parse(data);
                const count = await this.migrateStore(storeKey, parsed);
                totalMigre += count;
                console.log(`  ✅ ${storeKey}: ${count} entrées migrées`);
            }
        }

        // Marquer la migration comme complétée
        await storage.set('metadata', 'migrationCompleted', {
            date: new Date().toISOString(),
            itemsMigrated: totalMigre,
            version: '1.0'
        });

        console.log(`✅ Migration terminée: ${totalMigre} entrées`);

        // Optionnel: demander à l'utilisateur s'il veut supprimer localStorage
        this.promptCleanup();
    }

    /**
     * Migre un store spécifique selon son type
     */
    async migrateStore(storeKey, data) {
        switch(storeKey) {
            case 'listeCours':
                return await this.migrateCours(data);

            case 'groupeEtudiants':
                return await this.migrateEtudiants(data);

            case 'presences':
                return await this.migratePresences(data);

            case 'evaluationsSauvegardees':
                return await this.migrateEvaluations(data);

            case 'productions':
                return await this.migrateProductions(data);

            case 'grillesTemplates':
                return await this.migrateGrilles(data);

            case 'calendrierComplet':
                return await this.migrateCalendrier(data);

            case 'indicesCP':
            case 'indicesAssiduite':
                return await this.migrateIndices(storeKey, data);

            case 'interventions':
                return await this.migrateInterventions(data);

            default:
                console.warn(`⚠️ Type de store inconnu: ${storeKey}`);
                return 0;
        }
    }

    /**
     * Migration des étudiants avec enrichissement
     */
    async migrateEtudiants(etudiants) {
        const transaction = await storage.beginTransaction(['etudiants']);

        for (const etudiant of etudiants) {
            // Enrichir avec groupeId si absent
            if (!etudiant.groupeId) {
                etudiant.groupeId = 1; // Groupe par défaut
            }

            await transaction.set('etudiants', etudiant.da, etudiant);
        }

        await transaction.commit();
        return etudiants.length;
    }

    /**
     * Demande à l'utilisateur s'il veut nettoyer localStorage
     */
    promptCleanup() {
        const message = `
Migration terminée avec succès!

Voulez-vous supprimer les anciennes données de localStorage?
(Recommandé pour libérer de l'espace, mais gardez un backup JSON avant)

- OUI: Supprime localStorage (après avoir fait un backup)
- NON: Conserve localStorage (backup automatique)
        `;

        if (confirm(message)) {
            this.cleanupLocalStorage();
        }
    }

    /**
     * Nettoie localStorage après migration
     */
    cleanupLocalStorage() {
        const keysToKeep = ['theme', 'language', 'version'];
        const keysToDelete = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!keysToKeep.includes(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ ${keysToDelete.length} clés localStorage supprimées`);
    }
}
```

---

## 6. Proof of Concept (POC)

### Test minimal pour valider l'approche

```javascript
// test-indexeddb-poc.html
// À créer dans /Documents de travail (obsolètes)/

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>POC IndexedDB - Monitorage</title>
</head>
<body>
    <h1>Proof of Concept IndexedDB</h1>

    <button onclick="testWrite()">1. Écrire 1000 étudiants</button>
    <button onclick="testRead()">2. Lire tous les étudiants</button>
    <button onclick="testQuery()">3. Query par statut</button>
    <button onclick="testTransaction()">4. Transaction multi-stores</button>

    <pre id="output"></pre>

    <script>
        const DB_NAME = 'poc_monitorage';
        const DB_VERSION = 1;
        let db;

        // Initialisation de la DB
        async function initDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);

                request.onupgradeneeded = (event) => {
                    db = event.target.result;

                    // Créer store étudiants
                    if (!db.objectStoreNames.contains('etudiants')) {
                        const store = db.createObjectStore('etudiants', { keyPath: 'da' });
                        store.createIndex('statut', 'statut', { unique: false });
                        store.createIndex('groupeId', 'groupeId', { unique: false });
                    }

                    // Créer store presences
                    if (!db.objectStoreNames.contains('presences')) {
                        const store = db.createObjectStore('presences', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        store.createIndex('da', 'da', { unique: false });
                    }
                };
            });
        }

        // Test 1: Écrire 1000 étudiants
        async function testWrite() {
            const start = performance.now();

            const transaction = db.transaction(['etudiants'], 'readwrite');
            const store = transaction.objectStore('etudiants');

            for (let i = 1; i <= 1000; i++) {
                store.add({
                    da: `DA${i.toString().padStart(7, '0')}`,
                    nom: `Étudiant ${i}`,
                    prenom: `Prénom ${i}`,
                    groupeId: Math.floor(i / 100) + 1,
                    statut: i % 10 === 0 ? 'alerte' : 'actif'
                });
            }

            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = () => reject(transaction.error);
            });

            const duration = performance.now() - start;
            log(`✅ 1000 étudiants écrits en ${duration.toFixed(2)} ms`);
        }

        // Test 2: Lire tous les étudiants
        async function testRead() {
            const start = performance.now();

            const transaction = db.transaction(['etudiants'], 'readonly');
            const store = transaction.objectStore('etudiants');
            const request = store.getAll();

            const etudiants = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            const duration = performance.now() - start;
            log(`✅ ${etudiants.length} étudiants lus en ${duration.toFixed(2)} ms`);
        }

        // Test 3: Query par index
        async function testQuery() {
            const start = performance.now();

            const transaction = db.transaction(['etudiants'], 'readonly');
            const store = transaction.objectStore('etudiants');
            const index = store.index('statut');
            const request = index.getAll('alerte');

            const alertes = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            const duration = performance.now() - start;
            log(`✅ ${alertes.length} étudiants en alerte trouvés en ${duration.toFixed(2)} ms`);
        }

        // Test 4: Transaction multi-stores
        async function testTransaction() {
            const start = performance.now();

            const transaction = db.transaction(['etudiants', 'presences'], 'readwrite');
            const storeEtudiants = transaction.objectStore('etudiants');
            const storePresences = transaction.objectStore('presences');

            // Ajouter un étudiant
            const etudiant = {
                da: 'DA9999999',
                nom: 'Test',
                prenom: 'Transaction',
                groupeId: 1,
                statut: 'actif'
            };
            storeEtudiants.add(etudiant);

            // Ajouter 5 présences pour cet étudiant
            for (let i = 1; i <= 5; i++) {
                storePresences.add({
                    da: 'DA9999999',
                    date: `2025-11-${i.toString().padStart(2, '0')}`,
                    statut: 'présent'
                });
            }

            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = () => reject(transaction.error);
            });

            const duration = performance.now() - start;
            log(`✅ Transaction complétée en ${duration.toFixed(2)} ms`);
        }

        function log(message) {
            const output = document.getElementById('output');
            output.textContent += message + '\n';
        }

        // Initialiser au chargement
        initDB().then(result => {
            db = result;
            log('✅ Base de données initialisée');
        });
    </script>
</body>
</html>
```

---

## 7. Checklist de migration par module

### Modules de lecture (Phase 2)

- [ ] **tableau-bord-apercu.js**
  - [ ] Remplacer `obtenirDonneesSelonMode()` par appels async
  - [ ] Migrer `calculerIndicesEtudiant()` vers async
  - [ ] Tester affichage patterns et RàI

- [ ] **profil-etudiant.js**
  - [ ] Fonction `afficherProfilEtudiant()` → async
  - [ ] Fonction `calculerTousLesIndices()` → async
  - [ ] Tester navigation Précédent/Suivant

- [ ] **presences-apercu.js**
  - [ ] Fonction `chargerApercuPresences()` → async
  - [ ] Fonction `calculerStatistiquesPresences()` → async
  - [ ] Tester calculs taux, séances, prochaine séance

- [ ] **evaluations-apercu.js**
  - [ ] Fonction `chargerApercuEvaluations()` → async
  - [ ] Lecture indices depuis IndexedDB
  - [ ] Tester comptage productions réalisées

- [ ] **calendrier-vue.js**
  - [ ] Fonction `afficherCalendrierComplet()` → async
  - [ ] Lecture calendrier par groupeId
  - [ ] Tester affichage jours cours/congés

- [ ] **statistiques.js**
  - [ ] Fonction `chargerInfosCours()` → async
  - [ ] Fonction `chargerMaterielConfigure()` → async
  - [ ] Tester aperçu réglages

### Modules d'écriture (Phase 3)

- [ ] **etudiants.js**
  - [ ] Fonction `addStudent()` → async avec transaction
  - [ ] Fonction `updateStudent()` → async
  - [ ] Fonction `deleteStudent()` → async
  - [ ] Tester ajout/modification/suppression

- [ ] **saisie-presences.js**
  - [ ] Fonction `enregistrerPresences()` → async avec transaction
  - [ ] Recalcul indices assiduité dans transaction
  - [ ] Tester saisie + mise à jour indices

- [ ] **portfolio.js**
  - [ ] Fonction `calculerEtStockerIndicesCP()` → async avec transaction
  - [ ] Stockage indices SOM et PAN séparément
  - [ ] Tester calcul dual C-P

- [ ] **productions.js**
  - [ ] Fonction `sauvegarderProduction()` → async
  - [ ] Fonction `supprimerProduction()` → async
  - [ ] Tester CRUD complet productions

- [ ] **trimestre.js**
  - [ ] Fonction `genererCalendrierComplet()` → async
  - [ ] Stockage avec groupeId
  - [ ] Tester génération + reprises

- [ ] **interventions.js**
  - [ ] Fonction `sauvegarderIntervention()` → async
  - [ ] Fonction `marquerInterventionCompletee()` → async
  - [ ] Tester workflow RàI complet

- [ ] **pratiques.js**
  - [ ] Fonction `sauvegarderModalites()` → async
  - [ ] Configuration par groupe
  - [ ] Tester basculement SOM/PAN

---

## 8. Tests de performance comparatifs

### Benchmark localStorage vs IndexedDB

```javascript
// test-performance.js

async function benchmarkStorage() {
    const sizes = [10, 100, 1000, 5000];
    const results = {};

    for (const size of sizes) {
        console.log(`\n=== Test avec ${size} étudiants ===`);

        // Test localStorage
        const localStart = performance.now();
        for (let i = 0; i < size; i++) {
            localStorage.setItem(`etudiant_${i}`, JSON.stringify({
                da: `DA${i}`,
                nom: `Nom ${i}`,
                prenom: `Prénom ${i}`
            }));
        }
        const localDuration = performance.now() - localStart;

        // Test IndexedDB
        const idbStart = performance.now();
        const transaction = db.transaction(['etudiants'], 'readwrite');
        const store = transaction.objectStore('etudiants');

        for (let i = 0; i < size; i++) {
            store.add({
                da: `DA${i}`,
                nom: `Nom ${i}`,
                prenom: `Prénom ${i}`
            });
        }

        await new Promise(resolve => {
            transaction.oncomplete = resolve;
        });
        const idbDuration = performance.now() - idbStart;

        results[size] = {
            localStorage: localDuration.toFixed(2),
            indexedDB: idbDuration.toFixed(2),
            speedup: (localDuration / idbDuration).toFixed(2)
        };

        console.log(`localStorage: ${localDuration.toFixed(2)} ms`);
        console.log(`IndexedDB: ${idbDuration.toFixed(2)} ms`);
        console.log(`Speedup: ${(localDuration / idbDuration).toFixed(2)}x`);
    }

    return results;
}
```

**Résultats attendus:**
```
=== Test avec 10 étudiants ===
localStorage: 2.50 ms
IndexedDB: 1.80 ms
Speedup: 1.39x

=== Test avec 100 étudiants ===
localStorage: 25.00 ms
IndexedDB: 8.50 ms
Speedup: 2.94x

=== Test avec 1000 étudiants ===
localStorage: 280.00 ms
IndexedDB: 45.00 ms
Speedup: 6.22x

=== Test avec 5000 étudiants ===
localStorage: 1450.00 ms (bloque UI)
IndexedDB: 180.00 ms (non-bloquant)
Speedup: 8.06x
```

---

## 9. Plan de développement (timeline)

### Beta 91 (Semaine 1-2) - Fondations
- [ ] Créer `js/indexeddb-manager.js` (300 lignes)
- [ ] Créer `js/storage-adapter.js` (200 lignes)
- [ ] Créer `js/migration-tool.js` (250 lignes)
- [ ] POC minimal fonctionnel
- [ ] Tests unitaires couche abstraction
- **Livrable:** Adapter fonctionne en mode localStorage (aucun changement visible)

### Beta 92 (Semaine 3) - Tests adapter
- [ ] Intégrer adapter dans `main.js`
- [ ] Tests de non-régression complets
- [ ] Documentation API adapter
- [ ] Préparation migration modules lecteurs
- **Livrable:** Adapter testé, prêt pour migration modules

### Beta 93 (Semaine 4-5) - Migration lectures
- [ ] Migrer 6 modules de lecture (voir checklist)
- [ ] Tests de chaque module individuellement
- [ ] Tests d'intégration
- [ ] Performance profiling
- **Livrable:** Tous les modules de lecture utilisent IndexedDB

### Beta 94 (Semaine 6-7) - Migration écritures (1/2)
- [ ] Migrer etudiants.js
- [ ] Migrer saisie-presences.js
- [ ] Migrer portfolio.js
- [ ] Tests transactions ACID
- **Livrable:** Modules critiques d'écriture migrés

### Beta 95 (Semaine 8-9) - Migration écritures (2/2)
- [ ] Migrer productions.js, trimestre.js, interventions.js
- [ ] Outil de migration automatique localStorage → IndexedDB
- [ ] Tests de migration complète
- [ ] Documentation utilisateur
- **Livrable:** Migration complète fonctionnelle

### Version 1.0 (Semaine 10) - Finalisation
- [ ] Tests de charge (10+ groupes)
- [ ] Optimisations performance
- [ ] Documentation complète
- [ ] Guide de migration pour utilisateurs
- **Livrable:** Version 1.0 stable avec support multi-groupes

---

## 10. Risques et mitigation

### Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Compatibilité navigateurs anciens | Élevé | Faible | Fallback localStorage automatique |
| Bugs lors migration données | Critique | Moyenne | Tests exhaustifs + backup obligatoire |
| Performance dégradée | Moyen | Faible | Benchmarks avant/après |
| Perte de données | Critique | Très faible | Transactions ACID + backup auto |
| Complexité asynchrone | Moyen | Moyenne | Documentation + patterns clairs |

### Plan de rollback

Si problème critique détecté en production:
1. Désactiver IndexedDB (flag dans config)
2. Revenir à localStorage temporairement
3. Investiguer et corriger
4. Migrer à nouveau

---

## 11. Avantages à long terme

### Pour l'enseignant·e
- ✅ **Multi-groupes:** Gérer 10-15 groupes sans limite
- ✅ **Performance:** UI réactive même avec 500+ étudiants
- ✅ **Fiabilité:** Transactions ACID évitent corruption données
- ✅ **Requêtes:** Filtres rapides par statut, groupe, période

### Pour le développement futur
- ✅ **Scalabilité:** Architecture prête pour sync cloud (optionnelle)
- ✅ **Flexibilité:** Ajout de nouveaux stores sans refactorisation
- ✅ **Maintenance:** Code asynchrone moderne (async/await)
- ✅ **Tests:** Isolation des stores facilite tests unitaires

---

## 12. Ressources et documentation

### Documentation officielle
- [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [IndexedDB Best Practices](https://developers.google.com/web/ilt/pwa/working-with-indexeddb)

### Librairies recommandées (optionnel)
- **Dexie.js:** Wrapper élégant autour IndexedDB (20 KB)
- **idb:** Promisification IndexedDB par Jake Archibald (1.5 KB)

### Outils de développement
- Chrome DevTools → Application → IndexedDB
- Firefox DevTools → Storage → Indexed DB
- [IndexedDB Explorer Extension](https://chrome.google.com/webstore/detail/indexeddb-explorer)

---

## Prochaines étapes

1. **Validation du plan** avec Grégoire
2. **Création du POC** (test-indexeddb-poc.html)
3. **Développement Beta 91** (couche abstraction)
4. **Tests de non-régression**
5. **Migration progressive Beta 92-95**

---

**Questions ouvertes pour décision:**
- Utiliser une librairie (Dexie.js) ou IndexedDB natif?
- Faut-il supporter localStorage legacy à long terme?
- Backup automatique avant chaque migration?
- Interface admin pour gérer les stores?
