# Plan de travail - Session du 5 décembre 2025

## Résumé session du 4 décembre 2025

### ✅ Travaux complétés

1. **Correction critique statutRemise (Beta 93)**
   - Problème : Plusieurs endroits affichaient travaux "non remis" comme remis
   - Cause : Logique vérifiait `statut === 'evalue'` avant `statutRemise`
   - Solution : `statutRemise` est maintenant la **seule source de vérité**
   - Fichiers corrigés :
     * `liste-evaluations.js` (v=2025120207)
     * `profil-etudiant.js` (v=2025120302)

2. **Système 100% universel - Critères configurables (Beta 93)**
   - Objectif : Permettre utilisation de N'IMPORTE QUELS critères d'évaluation
   - Modifications :
     * `profil-etudiant.js` : Nouvelle fonction `obtenirCriteresAvecValeurs(da)`
     * `pratique-pan-maitrise.js` : Extraction dynamique critères depuis grille
     * Recommandations RàI configurables avec fallback générique intelligent
   - Résultat : Support de grilles personnalisées (ex: Créativité, Analyse, Synthèse)

3. **Correction données Artefact 1**
   - Problème : 30 évaluations Artefact 1 avaient `note: null` dans `evaluationsEtudiants`
   - Cause : Import historique créa placeholders, migration ignora enregistrements existants
   - Solution : Script de correction mis à jour 28 évaluations avec vraies notes
   - Résultat : Notes restaurées (ex: Maïka G. 68.5%)

4. **Nettoyage snapshots**
   - Problème : 120 snapshots au lieu de 15 (8 duplicatas par semaine)
   - Solution : Script de déduplication (garde le plus récent par semaine)
   - Résultat : 120 → 15 snapshots

---

## 📋 Session du 6 décembre 2025

### ✅ Travaux complétés

1. **Correction CRITIQUE : Snapshots - Indices undefined (Beta 93)**
   - **Problème** : Les snapshots affichaient P=100% au lieu des vraies notes
   - **Cause racine** : Cache coherency issue
     * IndexedDB contient 194 évaluations (données correctes)
     * localStorage limité à ~5-10 MB → QuotaExceededError
     * `capturerSnapshotHebdomadaire()` utilisait `obtenirDonneesSelonMode()` qui lit localStorage
     * Résultat : Données incomplètes/null → calculs incorrects (P=100% par défaut)
   - **Solution appliquée** :
     * `capturerSnapshotHebdomadaire()` → async, charge depuis IndexedDB par défaut
     * `verifierEtCapturerSnapshotHebdomadaire()` → async avec await
     * `capturerSnapshotManuel()` → async avec await
     * Lignes 236-245 de `snapshots.js` : `await db.get('evaluationsEtudiants')`
   - **Fichiers modifiés** :
     * `js/snapshots.js` (v=2025120601)
     * `index 93.html` (cache buster mis à jour)
   - **Test validé** :
     * AVANT : P=100 (cache localStorage incomplet)
     * APRÈS : P=69 pour Maïka (données correctes depuis IndexedDB)
     * Console : `✓ 194 évaluations chargées depuis IndexedDB`
   - **Impact** : Graphiques progression temporelle maintenant fonctionnels avec données réelles

2. **Correction CRITIQUE : Reconstruction snapshots - Boucle async (Beta 93)**
   - **Problème** : `reconstruireSnapshotsHistoriques()` plantait avec TypeError
   - **Cause** : `forEach()` ne supporte pas async/await, fonction appelée sans `await`
   - **Solution** : `forEach()` → boucle `for` avec `await capturerSnapshotHebdomadaire()`
   - **Fichiers modifiés** :
     * `js/snapshots.js` (v=2025120602) - Lignes 507-522
     * `index 93.html` (cache buster mis à jour)
   - **Test validé** :
     * ✅ 15 snapshots reconstruits avec succès, 0 échecs
     * ✅ Graphiques affichent vraies courbes de progression A-C-P-E
   - **Impact** : Reconstruction historique complète maintenant fonctionnelle

### ⚠️ Problèmes identifiés NON résolus

1. **Reconstruction en boucle infinie**
   - Symptôme : Reconstruction continue après semaine 15, crée duplicatas
   - Impact : 9680+ messages console, snapshots multiples
   - **Statut : En attente** (nécessite debug approfondi de `snapshots.js`)

2. **Testeuse - Interface ne charge pas correctement**
   - Symptôme : Voit page minimale ("Aucun cours", boutons visibles mais Primo absent)
   - Contexte : Beta 92, nouvel utilisateur
   - **Statut : À investiguer** (besoin info navigateur/OS, console errors)

---

## 📋 Plan de travail - Session prochaine

### Priorité 1 : Support testeuse ⭐⭐⭐

**Objectif** : Comprendre et résoudre problème d'affichage

**Actions** :
1. Collecter informations :
   - Navigateur et version (Safari, Chrome, Firefox ?)
   - Système d'exploitation (macOS, Windows, iPad ?)
   - Messages console (F12 / Cmd+Option+C)
   - Screenshot de la console avec erreurs

2. Diagnostics possibles :
   - CSS ne charge pas → Vérifier réseau, paths relatifs
   - JavaScript erreur → Vérifier compatibilité navigateur
   - Primo modal bloqué → Vérifier localStorage, détection première utilisation
   - Fichiers manquants → Vérifier intégrité package

3. Tests de validation :
   - Tester sur même navigateur/OS que la testeuse
   - Vérifier package distribution (tous fichiers présents ?)
   - Tester mode navigation privée (localStorage vide)

**Durée estimée** : 30-60 minutes

---

### Priorité 2 : Snapshots et graphiques (optionnel)

**Objectif** : Corriger système de snapshots historiques

**Option A - Correction rapide (1-2h)** :
1. Corriger `calculerIndicesHistoriques()` dans `snapshots.js`
   - Vérifier pourquoi retourne indices undefined
   - Ajouter logs debug pour tracer le problème

2. Empêcher boucle infinie reconstruction
   - Identifier pourquoi `forEach` continue après semaine 15
   - Ajouter garde-fou (max 15 itérations)

3. Tester avec 1 snapshot avant reconstruction complète

**Option B - Repenser architecture (4-6h)** :
1. Revoir approche snapshots (trop coûteuse ?)
2. Calculer indices à la volée au lieu de les stocker ?
3. Alternative : générer CSV export pour analyse externe

**Recommandation** : Attendre feedback utilisateur avant investir temps

---

### Priorité 3 : Documentation et nettoyage

**Actions** :
1. Documenter correction Artefact 1 dans CLAUDE.md
2. Créer guide dépannage pour testeurs (FAQ commune)
3. Nettoyer fichiers temporaires (`/tmp/`, scripts de diagnostic)

**Durée estimée** : 30 minutes

---

## 📝 Notes techniques

### Données corrigées aujourd'hui

**IndexedDB - evaluationsEtudiants** :
- 28 évaluations Artefact 1 corrigées
- Champs mis à jour : `note`, `niveauFinal`, `statut`, `dateEvaluation`
- Backup créé : `BACKUP_evaluationsEtudiants_artefact1_[timestamp]` dans localStorage

**IndexedDB - snapshots** :
- Dédupliqués : 120 → 15 snapshots
- ⚠️ Indices encore undefined (nécessite recalcul)

### Scripts utilisés (conservés dans historique)

- `/tmp/diagnostic-artefact1.js` - Diagnostic écarts evaluationsSauvegardees vs evaluationsEtudiants
- `/tmp/corriger-artefact1.js` - Correction note:null → vraies notes
- Scripts console (nettoyage, déduplication) - Voir historique session

### Fichiers modifiés Beta 93

**Critiques** :
- `index 93.html` - Beta 93 avec système universel
- `js/profil-etudiant.js` (v=2025120303) - Critères dynamiques
- `js/pratique-pan-maitrise.js` (v=2025120302) - Extraction grille référence
- `js/liste-evaluations.js` (v=2025120207) - Correction statutRemise
- `js/evaluation.js` (v=2025120216) - Navigation profil corrigée

**Nouveaux** :
- `js/snapshots.js` - Système snapshots historiques (WIP)
- `js/graphiques-progression.js` - Graphiques Chart.js (WIP)
- `import-artefacts-historiques.html` - Outil import dates remise
- `libs/chart.umd.js` - Librairie Chart.js 4.4.0

---

## 🎯 Objectifs à moyen terme

1. **Stabiliser Beta 93** (1-2 semaines)
   - Résoudre tous problèmes testeurs
   - Valider système universel avec utilisateurs réels
   - Corriger bugs découverts

2. **Snapshots et graphiques** (2-3 semaines)
   - Finaliser reconstruction historique
   - Graphiques évolution A-C-P fonctionnels
   - Export données longitudinales

3. **Documentation utilisateur** (1 semaine)
   - Guide démarrage simplifié
   - Tutoriels vidéo courts
   - FAQ étendue

4. **Vers Version 1.0** (Q1 2026)
   - Consolidation fonctionnalités
   - Tests utilisateurs extensifs
   - Package distribution professionnel
   - Préparation AQPC 2026

---

## 📚 Références

- `CLAUDE.md` - Documentation complète projet
- `BETA_93_CHANGELOG.md` - Changelog Beta 93 (à créer)
- `INDEXEDDB_ARCHITECTURE.md` - Architecture stockage
- `ARCHITECTURE_PRATIQUES.md` - Système pratiques modulaire

---

**Créé le** : 4 décembre 2025, 20:15
**Par** : Grégoire Bédard + Claude Code
**Prochaine session** : 5 décembre 2025 (ou ultérieur)
