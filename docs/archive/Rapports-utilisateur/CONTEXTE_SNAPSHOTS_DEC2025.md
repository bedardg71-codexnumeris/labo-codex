# Contexte: Système de snapshots et migration IndexedDB (Décembre 2025)

## Chronologie des événements

### 📅 6 décembre 2025 - Développement système snapshots

#### Commit 1: Refonte majeure snapshots par séance (73224b1)
**Objectif**: Passer de snapshots hebdomadaires à snapshots PAR SÉANCE

**Changements**:
- Architecture: ~30 snapshots (1 par séance du groupe) au lieu de 15 (1 par semaine)
- Assiduité (A): PONCTUELLE pour chaque séance (non cumulative)
- Complétion (C): Cumulative (conservée)
- Performance (P): Cumulative avec règle N meilleurs (conservée)
- Engagement (E): `(A_ponctuel × C_cumul × P_cumul)^(1/3)`

**Fichiers modifiés**:
- `saisie-presences.js`: Nouvelle fonction `calculerAssiduiteSeance(da, dateSeance)`
- `snapshots.js`:
  - `capturerSnapshotSeance(dateSeance)` remplace logique par semaine
  - `reconstruireSnapshotsHistoriques()` boucle sur toutes les dates de cours
  - IDs: `"SEANCE-2025-01-15"` au lieu de `"2025-S01"`

#### 🐛 Commit 2: PROBLÈME CRITIQUE - QuotaExceededError (13f45f7 + 15c4525)

**Le bug**:
```
❌ QuotaExceededError: localStorage quota exceeded
- localStorage limité à 5-10 MB
- 75 snapshots × 30 étudiants × données complètes = ~15-20 MB
- Seulement 3 captures réussissaient, 72 échecs
- Application devenait dysfonctionnelle
```

**Symptômes**:
- Reconstruction historique plante après 3 séances
- Console remplie d'erreurs QuotaExceededError
- Snapshots incomplets/corrompus
- Interface graphiques vide ou erreurs

**Solution implémentée**:
```javascript
// AVANT (bugué):
const snapshots = db.getSync('snapshots', {});  // localStorage
db.setSync('snapshots', snapshots);             // localStorage (TROP PETIT!)

// APRÈS (corrigé):
let snapshots = await db.get('snapshots');      // IndexedDB (plusieurs GB)
await db.set('snapshots', snapshots);           // IndexedDB
```

**Modifications `snapshots.js`**:
1. `capturerSnapshotSeance()`:
   - `db.getSync()` → `await db.get()`
   - `db.setSync()` → `await db.set()`
2. `reconstruireSnapshotsHistoriques()`:
   - Initialisation avec `await db.set()` directement dans IndexedDB
   - Vide d'abord IndexedDB avant reconstruction

**Impact**:
- ✅ Capacité: 5-10 MB → Plusieurs GB
- ✅ Toutes les 75 séances peuvent être sauvegardées
- ⚠️ Performance: Légèrement plus lent (async) mais fiable
- ✅ Aucun QuotaExceededError

---

## Architecture actuelle (Post-correctif)

### Stockage hybride IndexedDB + localStorage

```
┌─────────────────────────────────────────────────────────────┐
│                    DONNÉES APPLICATION                       │
├─────────────────────────────────────────────────────────────┤
│  PETITES DONNÉES                 GRANDES DONNÉES            │
│  (< 1 MB)                        (> 5 MB)                   │
├──────────────────────────────────────────────────────────────┤
│  • Étudiants (30)                • Snapshots (75 séances)   │
│  • Productions (10)              • Historique complet       │
│  • Grilles (5)                   • Cache évaluations        │
│  • Configuration                                            │
├──────────────────────────────────────────────────────────────┤
│  STOCKAGE: localStorage          STOCKAGE: IndexedDB        │
│  (Cache hybride)                 (Persistant)               │
│  db.getSync() / db.setSync()     await db.get() / db.set()  │
└─────────────────────────────────────────────────────────────┘
```

### Méthodes de stockage

#### Méthode 1: Synchrone (cache localStorage)
```javascript
// Pour petites données fréquemment lues
const etudiants = db.getSync('groupeEtudiants', []);
db.setSync('groupeEtudiants', etudiants);

// Utilise:
// - localStorage comme cache rapide (0ms)
// - IndexedDB en arrière-plan (async)
```

#### Méthode 2: Asynchrone (IndexedDB direct)
```javascript
// Pour grandes données (snapshots, historiques)
const snapshots = await db.get('snapshots');
await db.set('snapshots', snapshots);

// Utilise:
// - IndexedDB directement (plusieurs GB)
// - AUSSI met à jour localStorage (depuis votre correctif du 7 déc)
```

---

## Problème résolu aujourd'hui (7 décembre 2025)

### Bug: Artefact 8 n'apparaît pas dans filtre

**Cause racine**: Désynchronisation cache localStorage

```javascript
// productions.js
await db.set('productions', evaluations);  // Écrivait SEULEMENT dans IndexedDB
                                           // localStorage non mis à jour!

// liste-evaluations.js
const prods = db.getSync('productions', []);  // Lisait cache obsolète
// → Artefact 8 absent!
```

**Solution**: Correction `db.js` ligne 225-239

```javascript
async set(key, value) {
    if (this.useIndexedDB) {
        // Écrire dans IndexedDB (stockage persistant)
        await this._setIndexedDB(key, value);

        // ✅ NOUVEAU: AUSSI écrire dans localStorage (cache synchrone)
        this._setLocalStorage(key, value);
    }
}
```

**Bénéfice**:
- ✅ Cache localStorage toujours synchronisé
- ✅ Nouvelles productions apparaissent immédiatement dans filtres
- ✅ Pas besoin de recharger la page

### Bug #2: Reconstruction créait 75 snapshots au lieu de 30

**Problème**: `reconstruireSnapshotsHistoriques()` utilisait le calendrier complet

```javascript
// AVANT (incorrect):
const datesCours = Object.keys(calendrier).filter(date => {
    return (jour.statut === 'cours' || jour.statut === 'reprise');
});
// → 75 jours (TOUT le calendrier du trimestre, tous groupes confondus!)
```

**Réalité**:
- Calendrier trimestre = 75 jours de cours (tous groupes)
- Horaire spécifique groupe = 2 séances/semaine × 15 semaines = **30 séances**

**Solution**: Utiliser `seancesCompletes` au lieu du calendrier brut

```javascript
// APRÈS (corrigé):
const seancesCompletes = obtenirSeancesCompletes();  // Horaire du groupe
const datesCours = Object.keys(seancesCompletes).sort();
// → ~30 dates (seulement les séances du groupe configurées dans l'horaire!)
```

**Impact**:
- ✅ Volume de données réduit: ~15 MB → ~6 MB
- ✅ Reconstruction 2.5× plus rapide
- ✅ Reflète la réalité du groupe (2 séances/semaine, pas 5)

---

## État actuel du système

### ✅ Fonctionnel
- Snapshots sauvegardés dans IndexedDB (plusieurs GB)
- Reconstruction historique basée sur horaire du groupe (~30 séances)
- Productions/Grilles/Étudiants dans cache hybride
- Synchronisation IndexedDB ↔ localStorage

### ⚠️ Points d'attention

1. **Snapshots utilisent async/await**
   - `capturerSnapshotSeance()` est maintenant async
   - `reconstruireSnapshotsHistoriques()` est async
   - Appeler avec `await` partout

2. **Cache localStorage synchronisé**
   - `db.set()` écrit maintenant dans BOTH IndexedDB + localStorage
   - `db.remove()` supprime de BOTH IndexedDB + localStorage
   - Garantit cohérence du cache

3. **Capacités de stockage**
   ```
   localStorage:  5-10 MB    (cache rapide)
   IndexedDB:     Plusieurs GB (stockage principal)
   ```

### 📊 Volumes de données actuels

```
Étudiants (30):           ~50 KB
Productions (10):         ~20 KB
Grilles (5):              ~30 KB
Évaluations (200):        ~500 KB
Snapshots (30 séances):   ~6 MB      ← DOIT être dans IndexedDB!
Calendrier complet:       ~100 KB
Configuration:            ~20 KB
```

---

## Correctifs supplémentaires (7 décembre 2025 - après-midi)

### Bug #3: 75 snapshots créés au lieu de 30 (après correctif initial)

**Problème**: Même après le correctif ligne 567-575 pour utiliser `seancesCompletes`, la reconstruction créait toujours 75 snapshots.

**Cause racine**: `horaire.js` (ligne 357-362) ajoute TOUTES les dates de cours du calendrier à `seancesCompletes`, même sans séances configurées (tableaux vides `[]`).

```javascript
// horaire.js - ÉTAPE 3 problématique
Object.entries(calendrierComplet).forEach(([dateStr, infosJour]) => {
    if ((infosJour.statut === 'cours' || infosJour.statut === 'reprise') && !seancesCompletes[dateStr]) {
        seancesCompletes[dateStr] = [];  // ← Ajoute date vide!
    }
});
```

**Résultat**:
- Calendrier = 75 jours de cours (lundi-vendredi × 15 semaines)
- Horaire configuré = 30 séances (2×/semaine × 15 semaines)
- `seancesCompletes` contenait = 75 entrées (30 pleines + 45 vides)

**Solution implémentée** (`snapshots.js` ligne 581-583):
```javascript
// AVANT (bugué):
const datesCours = Object.keys(seancesCompletes).sort();
// → 75 dates (incluant dates vides)

// APRÈS (corrigé):
const datesCours = Object.keys(seancesCompletes)
    .filter(date => seancesCompletes[date] && seancesCompletes[date].length > 0)
    .sort();
// → ~30 dates (seulement dates avec séances configurées)
```

**Impact**:
- ✅ Volume de données: ~15 MB → ~6 MB (réduit de 60%)
- ✅ Reconstruction 2.5× plus rapide
- ✅ Reflète la réalité de l'horaire configuré

---

### Bug #4: Labels "Sem. undefined" dans graphiques

**Problème**: Les graphiques affichaient "Sem. undefined" au lieu de "Sem. 1", "Sem. 2", etc.

**Cause racine**: Incohérence des noms de propriétés
- Snapshots créés avec `numeroSemaine`, `dateSeance`
- Graphiques cherchaient `numSemaine`, `dateDebut`, `dateFin`
- Fonction `obtenirSnapshotsEtudiant()` cherchait aussi `numSemaine`

**Solution implémentée** (`snapshots.js` ligne 358-360):
```javascript
const snapshot = {
    id: `SEANCE-${dateSeance}`,
    dateSeance: dateSeance,
    numeroSemaine: numeroSemaine, // Pour horaire.js
    numSemaine: numeroSemaine,    // ✨ Pour graphiques
    dateDebut: dateSeance,         // ✨ Pour obtenirSnapshotsEtudiant()
    dateFin: dateSeance,           // ✨ Pour obtenirSnapshotsEtudiant()
    timestamp: new Date().toISOString(),
    etudiants: snapshotsEtudiants,
    groupe: groupe
};
```

**Impact**:
- ✅ Labels corrects dans graphiques: "Sem. 1", "Sem. 2", etc.
- ✅ Compatibilité avec `graphiques-progression.js`
- ✅ Compatibilité avec `obtenirSnapshotsEtudiant()`

---

### Scripts de diagnostic créés

1. **debug-seances.js**
   - Diagnostic de `seancesCompletes`
   - Compte dates pleines vs vides
   - Compare horaire configuré vs calendrier

2. **debug-snapshots-indices.js**
   - Diagnostic des snapshots dans IndexedDB
   - Vérification propriétés `numSemaine`, `dateDebut`
   - Analyse indices C, P, E (null vs valeurs)
   - Compte évaluations disponibles

3. **CORRECTIFS_SNAPSHOTS_7DEC2025.md**
   - Documentation complète des correctifs
   - Instructions pas-à-pas pour tester
   - Explication "pics discontinus" normaux vs anormaux

---

## Prochaines étapes

### Quand vous reprenez les snapshots

1. **Vérifier l'architecture actuelle**
   ```javascript
   // snapshots.js doit utiliser async/await partout:
   await db.get('snapshots')
   await db.set('snapshots', ...)
   ```

2. **Tester la reconstruction**
   ```javascript
   // Devrait créer ~30 snapshots (selon horaire du groupe)
   await reconstruireSnapshotsHistoriques();
   ```

3. **Surveiller la console**
   ```
   ✓ Séances du groupe détectées: 30
   📊 Estimation: 30 snapshots × 30 étudiants × ~2 KB = ~2 MB
   ⚠️ "snapshots" trop grande pour localStorage, stockée uniquement dans IndexedDB
   ✅ Snapshot séance 2025-01-15 capturé (30 étudiants)
   ✅ Snapshot séance 2025-01-17 capturé (30 étudiants)
   ... (~30 fois, pas 75!)
   ✅ Reconstruction terminée: 30 captures par séance créées
   ```

4. **En cas de problème**
   - Vider cache navigateur (localStorage peut avoir vieilles données)
   - Recharger page
   - Relancer reconstruction

### Déploiement Netlify/Cloudflare

**Avantages pour les testeurs**:
- Pas besoin de serveur local
- Accès sécurisé via Cloudflare
- URL stable pour partage
- IndexedDB fonctionne parfaitement en ligne

**Points d'attention**:
- Même architecture hybride (localStorage + IndexedDB)
- Snapshots DOIVENT utiliser `await db.get()` / `await db.set()`
- Cache localStorage synchronisé automatiquement

---

## Résumé technique

| Aspect | Avant (bugué) | Après (corrigé) |
|--------|--------------|-----------------|
| **Snapshots stockage** | localStorage (getSync) | IndexedDB (await get) |
| **Capacité snapshots** | 5-10 MB (quotas dépassés) | Plusieurs GB |
| **Nombre snapshots** | Tentait 75 (tous jours calendrier) | 30 (séances du groupe) |
| **Volume données** | ~15-20 MB (trop gros!) | ~6 MB (acceptable) |
| **Reconstruction** | Échoue après 3 séances | Réussit pour 30 séances |
| **db.set() écrit** | IndexedDB seulement | IndexedDB + localStorage* |
| **Cache cohérent** | ❌ Non (désynchronisé) | ✅ Oui (synchronisé) |
| **Performance** | Rapide mais plante | Légèrement plus lent, fiable |

*Note: `db.set()` gère gracieusement QuotaExceededError - grandes données restent uniquement dans IndexedDB

---

## Fichiers clés

```
js/
├── db.js                    # ✅ Corrigé (7 déc) - Cache hybride cohérent
├── snapshots.js             # ✅ Corrigé (6 déc) - Utilise IndexedDB async
├── saisie-presences.js      # ✅ Modifié (6 déc) - Assiduité ponctuelle
├── liste-evaluations.js     # ✅ Utilise cache synchronisé
└── productions.js           # ✅ Utilise db.set() (cache synchronisé)
```

---

## Commits pertinents

```
15c4525 - Correctif CRITIQUE: Snapshots dans IndexedDB (QuotaExceededError résolu)
b2f8013 - Correctif critique: Structure metadata snapshots + compatibilité
73224b1 - Refonte majeure: Snapshots par séance avec assiduité ponctuelle (Beta 93)
13f45f7 - Fix: Snapshots utilisent maintenant IndexedDB au lieu de localStorage (Beta 93)
9471cba - Correctif: Mise à jour automatique des selects après modification de productions (7 déc)
```

---

**Date de ce résumé**: 7 décembre 2025
**Auteur**: Claude Code (avec contexte utilisateur)
**Statut**: Système fonctionnel, prêt pour reprise développement snapshots
