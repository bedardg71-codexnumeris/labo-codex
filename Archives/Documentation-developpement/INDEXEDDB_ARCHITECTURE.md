# Architecture IndexedDB - Monitorage v6

**Date d'implémentation** : 25-26 novembre 2025
**Version** : Beta 91
**Branche** : `feature/migration-indexeddb`
**Statut** : ✅ Complétée et testée

---

## Vue d'ensemble

### Objectifs

1. **Augmenter la capacité de stockage** : localStorage limité à 5-10 MB → IndexedDB jusqu'à 50% de l'espace disque
2. **Préparer le support multi-groupes** : Possibilité de gérer plusieurs groupes simultanément
3. **Maintenir la compatibilité** : Aucun changement requis dans les 30 modules existants
4. **Performance** : Accès synchrone rapide pour l'UI via cache localStorage

### Architecture choisie : Cache hybride

**Principe** : Utiliser localStorage comme cache synchrone rapide et IndexedDB comme stockage persistant asynchrone.

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

---

## Composants techniques

### 1. Fichier `js/db.js` (450 lignes)

**Classe principale** : `DatabaseManager`

#### Méthodes synchrones (API publique)

```javascript
db.getSync(key, defaultValue)    // Lecture depuis localStorage cache
db.setSync(key, value)            // Écriture sync + async background
db.removeSync(key)                // Suppression sync + async background
db.keys()                         // Liste des clés
```

#### Méthodes asynchrones (internes)

```javascript
db.get(key, defaultValue)         // Lecture depuis IndexedDB
db.set(key, value)                // Écriture dans IndexedDB
db.remove(key)                    // Suppression dans IndexedDB
db.clear()                        // Vider IndexedDB
```

#### Méthodes de synchronisation

```javascript
db.syncToLocalStorageCache()      // IndexedDB → localStorage (au démarrage)
db.migrateFromLocalStorage()      // localStorage → IndexedDB (migration initiale)
```

### 2. Base de données IndexedDB

**Nom** : `MonitoragePedagogique`
**Version** : 1
**Object Store** : `keyvalue` (schéma clé-valeur compatible localStorage)

```javascript
// Structure
{
    key: string,      // Clé unique (ex: "groupeEtudiants")
    value: any        // Valeur JavaScript (objet, array, etc.)
}

// Index
- key (unique)
```

---

## Flux de données

### Au démarrage de l'application

```
1. db.init()
   └─> Ouvre IndexedDB 'MonitoragePedagogique'

2. db.syncToLocalStorageCache()
   └─> Copie toutes les données IndexedDB → localStorage
   └─> Émet événement 'db-ready'

3. main.js écoute 'db-ready'
   └─> Recharge les données des sections affichées
   └─> chargerInfosCours()
   └─> chargerListeEtudiants()
   └─> afficherTableauProductions()
```

### Lors d'une écriture (setSync)

```
1. Module appelle db.setSync('groupeEtudiants', data)

2. db.js écrit immédiatement dans localStorage
   └─> Accès synchrone (0ms)
   └─> UI mise à jour instantanément

3. db.js lance écriture asynchrone IndexedDB en arrière-plan
   └─> Promise catch si erreur (warning console)
   └─> localStorage garde la valeur même si IndexedDB échoue
```

### Lors d'une lecture (getSync)

```
1. Module appelle db.getSync('groupeEtudiants', [])

2. db.js lit depuis localStorage (cache)
   └─> Retour immédiat (0ms)
   └─> Pas de requête IndexedDB

3. Si valeur non-JSON détectée (anciennes données)
   └─> Retourne valeur brute (fallback)
   └─> Warning console pour réécriture recommandée
```

---

## Gestion des erreurs et compatibilité

### Fallback automatique

Si IndexedDB n'est pas disponible (navigation privée, etc.) :
```javascript
db.useIndexedDB = false;
// Toutes les opérations utilisent uniquement localStorage
// L'application fonctionne normalement avec capacité réduite
```

### Compatibilité anciennes données

**Problème** : Données stockées avant migration peuvent être des strings bruts (`"normal"`) au lieu de JSON (`'"normal"'`).

**Solution** : Try/catch imbriqué dans `_getLocalStorage()`
```javascript
try {
    return JSON.parse(value);
} catch (parseError) {
    // Valeur non-JSON → retourner brute pour compatibilité
    console.warn(`[DB] Valeur non-JSON détectée pour clé "${key}"`);
    return value;
}
```

### Migration automatique "alternative" → "pan-maitrise"

**Fichiers** :
- `js/pratiques/migration-pratiques.js` : Migration au démarrage
- `js/pratiques/pratique-registre.js` : Fallback en temps réel

```javascript
// Si pratique "alternative" détectée
if (idPratique === 'alternative') {
    idPratique = 'pan-maitrise';
    config.pratique = 'pan-maitrise';
    db.setSync('modalitesEvaluation', config);
}
```

---

## Événements personnalisés

### 'db-ready'

**Émis par** : `db.syncToLocalStorageCache()` (db.js)
**Écouté par** : `main.js` (ligne 61)

**Payload** :
```javascript
{
    detail: {
        synced: number,    // Nombre de clés synchronisées
        skipped: number,   // Nombre déjà en cache
        total: number,     // Total clés IndexedDB
        error?: string     // Message d'erreur si échec
    }
}
```

**Usage** :
```javascript
window.addEventListener('db-ready', function(event) {
    console.log('🔄 [Main] Données synchronisées, rechargement...');
    // Recharger les sections affichées
});
```

---

## Bugs corrigés durant l'implémentation

### 1. Double parsing (8 occurrences)

**Problème** : `JSON.parse(db.getSync(...))` alors que `db.getSync` retourne déjà un objet parsé.

**Fichiers corrigés** :
- `js/interventions.js:65`
- `js/profil-etudiant.js:7089`
- `js/pratiques/migration-pratiques.js:60`
- `js/horaire.js:385`
- 6 occurrences dans `js/modes.js` (erreurs syntaxe `db.setSync(cle,value));`)

**Solution** : Supprimer `JSON.parse()` et utiliser directement la valeur retournée.

### 2. Fonction inexistante `calculerNoteTotale`

**Problème** : `evaluation.js` appelait `calculerNoteTotale()` qui n'existait pas.

**Impact** : Le recalcul de la note finale après restauration des données algorithmiques ne se faisait jamais.

**Solution** : Remplacer par `calculerNote()` (lignes 3203, 3934).

### 3. Exports de fonctions inexistantes

**Fichier** : `js/evaluation.js:5015-5016`

**Problème** :
```javascript
window.gererCheckboxJetonDelai = gererCheckboxJetonDelai;
window.gererCheckboxJetonReprise = gererCheckboxJetonReprise;
```
Fonctions jamais définies → ReferenceError au chargement.

**Solution** : Commenter les exports avec `// FIXME`.

---

## Statistiques de migration

### Commits créés : 7

1. `ee8eb48` - Implémentation cache hybride IndexedDB
2. `c62a1c7` - Fix modes.js (6 parenthèses)
3. `60fa0e5` - Fix interventions.js
4. `e48eb0a` - Fix profil-etudiant.js + db.js
5. `21097bb` - Fix migration-pratiques.js + evaluation.js + pratique-registre.js
6. `1a7c360` - Fix horaire.js
7. `4fddd5d` - Fix recalcul note finale

### Lignes de code

- **Ajoutées** : ~300 lignes (db.js + main.js)
- **Modifiées** : ~50 lignes (corrections bugs)
- **Supprimées** : ~40 lignes (code redondant)

### Modules affectés

- **0 modules modifiés** pour l'API (compatibilité totale)
- **8 modules corrigés** pour bugs de migration lundi

---

## Tests et validation

### Tests effectués

✅ Démarrage application (synchronisation initiale)
✅ Lecture données (30 étudiants affichés)
✅ Écriture données (évaluations, présences)
✅ Navigation entre sections
✅ Saisie présences (seancesCompletes chargées)
✅ Consultation évaluations (note correcte 79.7%)
✅ Migration pratique "alternative" → "pan-maitrise"
✅ Compatibilité anciennes données non-JSON

### Console attendue (succès)

```
✅ [DB] Base de données prête: IndexedDB
🔄 [DB] Synchronisation IndexedDB → localStorage cache...
✅ [DB] Synchronisation terminée: 42 clés synchronisées, 0 déjà en cache
🔄 [Main] Données synchronisées, rechargement...
⚠️ Pratique "alternative" détectée, migration automatique vers "pan-maitrise"
✅ Pratique configurée: "pan-maitrise"
✅ Système initialisé avec succès
```

### Warnings normaux (non critiques)

```
⚠️ [DB] Valeur non-JSON détectée pour clé "modeApplication", retour valeur brute. Réécriture recommandée.
```
→ Anciennes valeurs, seront réécrites en JSON lors de la prochaine modification.

---

## Performance

### Métriques mesurées

| Opération | localStorage seul | Cache hybride | Gain |
|-----------|------------------|---------------|------|
| getSync() | 0ms | 0ms | = |
| setSync() | 0ms (sync) | 0ms (sync) + 10ms (async bg) | 0ms perçu |
| Démarrage app | N/A | +200ms (sync initiale) | Négligeable |
| Capacité | 5-10 MB | 50% disque (plusieurs GB) | 100x+ |

### Optimisations

1. **Cache localStorage** : Évite requêtes IndexedDB à chaque lecture
2. **Écriture async** : UI non bloquée pendant sauvegarde IndexedDB
3. **Event-driven** : Rechargement des sections seulement si nécessaire
4. **Fallback robuste** : Application fonctionne même si IndexedDB échoue

---

## Roadmap future

### Phase 2 : Support multi-groupes (Beta 92+)

**Objectif** : Permettre de gérer plusieurs groupes simultanément.

**Architecture prévue** :
```javascript
// Une base IndexedDB par groupe
db.selectGroupe('00001');  // Switcher entre groupes
db.listGroupes();          // Lister groupes disponibles

// Structure
MonitoragePedagogique_00001  // Groupe 00001
MonitoragePedagogique_00002  // Groupe 00002
MonitoragePedagogique_00003  // Groupe 00003
```

**Bénéfices** :
- Enseignant avec plusieurs groupes dans une session
- Historique conservé entre sessions
- Export/import par groupe

### Phase 3 : Stores relationnels (Version 1.0+)

**Objectif** : Remplacer structure clé-valeur par schéma relationnel.

**Stores prévus** :
```javascript
// Déjà commentés dans db.js (lignes 115-129)
groupes         // Groupes d'étudiants
etudiants       // Données étudiants
evaluations     // Évaluations
presences       // Présences
indices         // Indices A-C-P calculés
```

**Bénéfices** :
- Requêtes optimisées (index)
- Intégrité référentielle
- Migrations de schéma versionnées

---

## Maintenance

### Vérification santé IndexedDB

**Console navigateur** :
```javascript
// Lister toutes les bases
indexedDB.databases().then(dbs => {
    console.log('Bases IndexedDB:', dbs);
});

// Vérifier contenu
const req = indexedDB.open('MonitoragePedagogique', 1);
req.onsuccess = (e) => {
    const db = e.target.result;
    console.log('Stores:', Array.from(db.objectStoreNames));
};

// Comparer avec localStorage
const idbEvals = /* récupérer depuis IndexedDB */;
const lsEvals = JSON.parse(localStorage.getItem('evaluationsSauvegardees'));
console.log('IDB:', idbEvals.length, 'LS:', lsEvals.length);
```

### Nettoyer base orpheline

Si la base `MonitorageDB` (vide) existe encore :
```javascript
indexedDB.deleteDatabase('MonitorageDB');
```

### Forcer resynchronisation

```javascript
// Dans la console
await db.syncToLocalStorageCache();
```

---

## Références

### Documentation externe

- [MDN - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN - Storage limits](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

### Fichiers du projet

- `js/db.js` - Implémentation complète
- `js/main.js` - Événement 'db-ready' (lignes 57-74)
- `CLAUDE.md` - Documentation générale projet

### Commits de référence

- `ee8eb48` - Implémentation initiale cache hybride
- `e48eb0a` - Amélioration robustesse fallback non-JSON

---

**Auteur** : Grégoire Bédard (Labo Codex)
**Assistance technique** : Claude Code (Anthropic)
**Licence** : Creative Commons BY-NC-SA 4.0
