# Changelog Beta 91 - Développement avancé

**Date de création** : 18 novembre 2025
**Version** : Beta 91.0
**Statut** : En développement actif

---

## 🎯 Objectifs de la Beta 91

La Beta 91 marque le début d'une nouvelle phase de développement après la présentation du 19 novembre 2025 à la communauté AQPC (400 personnes inscrites). Cette version se concentre sur l'amélioration et l'extension des fonctionnalités existantes.

---

## 📋 Provenance

**Créée à partir de** : Beta 90.5 (Architecture pratiques de notation)
**Date de duplication** : 18 novembre 2025
**Fichier source** : `index 90 (architecture).html`
**Fichier destination** : `index 91.html`

---

## 🔄 Changements appliqués lors de la création

### Métadonnées mises à jour
- ✅ Titre : "Beta 90" → "Beta 91"
- ✅ Sous-titre : "Architecture pratiques de notation" → "Développement avancé"
- ✅ Date : 16 novembre 2025 → 18 novembre 2025
- ✅ Cache buster CSS : `v=2025111701` → `v=2025111801`
- ✅ Cache busters scripts pratiques : `v=2025111302/2025111441` → `v=2025111801`

### Références de version
- Ligne 6 : Titre HTML mis à jour
- Ligne 9 : Cache buster CSS mis à jour
- Ligne 2708 : Meta informations (version, auteur, date)
- Ligne 8998 : Commentaire système pratiques
- Lignes 9002-9003 : Cache busters scripts pratiques

---

## 🆕 Nouveautés prévues pour Beta 91

### Phase 1 : Consolidation (semaines 1-2)
- [ ] Corrections de bugs identifiés lors de la présentation
- [ ] Optimisations de performance
- [ ] Amélioration de l'expérience utilisateur

### Phase 2 : Extensions fonctionnelles (semaines 3-4)
- [ ] Ajout de nouvelles fonctionnalités demandées par la communauté
- [ ] Extension du système de pratiques de notation
- [ ] Amélioration des visualisations de données

### Phase 3 : Documentation et tests (semaines 5-6)
- [ ] Mise à jour complète de la documentation
- [ ] Tests utilisateurs étendus
- [ ] Préparation package de distribution

---

## 📊 État actuel des fonctionnalités

### ✅ Fonctionnalités héritées de Beta 90.5

**Système de pratiques modulaire** (Phases 2-6 complètes)
- ✅ Architecture modulaire pratiques de notation
- ✅ PAN-Maîtrise : Échelle IDME, critères SRPNF, N artefacts
- ✅ Sommative : Moyenne pondérée, toutes évaluations
- ✅ Registre de pratiques avec détection automatique
- ✅ Migration automatique "alternative" → "pan-maitrise"

**Interface et visualisation**
- ✅ Barres de distribution avec nuages de points animés
- ✅ Gradients spectre lumineux (Rouge → Jaune → Vert)
- ✅ Affichage dual SOM/PAN en mode comparatif
- ✅ Points circulaires avec animation hover
- ✅ Anonymisation des tooltips en mode Anonymisation

**Détection patterns et RàI**
- ✅ Système RàI optionnel (activable/désactivable)
- ✅ Détection patterns sur N artefacts configurables
- ✅ Seuils IDME configurables
- ✅ Découplage critères SRPNF (grilles personnalisées)

**Système de jetons**
- ✅ Configuration jetons personnalisés
- ✅ Types : délai, reprise, aide, bonus
- ✅ Attribution dans profil étudiant
- ✅ Compteurs visuels et badges colorés

**Remplacement Risque → Engagement**
- ✅ Formule : E = A × C × P (perspective positive)
- ✅ Interface complète reformulée
- ✅ 16 fichiers mis à jour

---

## 🐛 Bugs connus (hérités de Beta 90.5)

### Critiques (à corriger en priorité)
- [ ] **Aucun bug critique identifié** (Beta 90.5 stable)

### Mineurs (à corriger éventuellement)
- [ ] Optimisation chargement initial (temps > 2s)
- [ ] Amélioration responsive mobile (sections étroites)

---

## 📝 Notes de développement

### Conventions de nommage Beta 91
- Fichier principal : `index 91.html`
- Cache busters : Format `v=2025MMJJXX` (année+mois+jour+compteur)
- Date de référence : 18 novembre 2025
- Cache buster CSS : `v=2025111801`
- Cache busters JS : `v=2025111801` (scripts pratiques)

### Dépendances
- **Chart.js** : Installé localement (`libs/chart.min.js`, ~200 KB)
- **Aucune autre dépendance externe** : 100% autonome

### Structure localStorage (inchangée)
```javascript
// Données existantes (Beta 90.5)
localStorage.calendrierComplet            // trimestre.js
localStorage.indicesAssiduiteDetailles    // saisie-presences.js
localStorage.indicesCP                     // portfolio.js
localStorage.modalitesEvaluation           // pratiques.js
localStorage.groupeEtudiants               // etudiants.js
localStorage.productions                   // productions.js
localStorage.evaluations                   // evaluation.js
```

---

## 🔮 Roadmap Beta 91

### Court terme (novembre-décembre 2025)
1. **Intégration feedback communauté** (post-présentation 19 nov)
   - Corrections bugs rapportés
   - Améliorations UX suggérées

2. **Optimisations performance**
   - Réduction temps chargement initial
   - Optimisation calculs indices A-C-P

3. **Documentation enrichie**
   - Guide utilisateur simplifié
   - FAQ étendue
   - Tutoriels vidéo courts

### Moyen terme (janvier-février 2026)
1. **Migration IndexedDB** (support multi-groupes)
   - Remplacement localStorage → IndexedDB
   - Support plusieurs groupes simultanés
   - Amélioration capacité stockage

2. **Système de snapshots**
   - Snapshots interventions RàI
   - Snapshots hebdomadaires (portrait complet)
   - Reconstruction rétroactive

3. **Graphiques évolution A-C-P**
   - Intégration Chart.js complète
   - Graphiques aires empilées
   - Spaghetti charts évolution

### Long terme (mars-juin 2026)
1. **Préparation Version 1.0**
   - Consolidation toutes fonctionnalités
   - Tests utilisateurs extensifs
   - Documentation complète

2. **Présentation AQPC 2026**
   - Version 1.0 stable
   - Package complet de démonstration
   - Communication publique large

---

## 📚 Documentation de référence

### Documents actifs (Beta 91)
- `CLAUDE.md` - Guide principal développement
- `ARCHITECTURE_PRATIQUES.md` - Architecture système pratiques
- `GUIDE_AJOUT_PRATIQUE.md` - Ajouter une nouvelle pratique
- `FEUILLE_DE_ROUTE_PRATIQUES.md` - Roadmap pratiques
- `PLAN_NOV19_2025.md` - Plan présentation (référence historique)
- `MIGRATION_INDEXEDDB.md` - Plan migration future
- `ROADMAP_V1_AQPC2026.md` - Vision long terme

### Documents archivés (Beta 90.5)
- Voir répertoire `Archives/` pour historique complet
- 31 fichiers de plans, phases, analyses
- Documentation versions antérieures

---

## 🔧 Commandes utiles

### Ouvrir Beta 91 (développement local)
```bash
open "index 91.html"  # macOS
```

### Vérifier localStorage
```javascript
// Console navigateur
localStorage.getItem('calendrierComplet')
localStorage.getItem('indicesCP')
localStorage.getItem('modalitesEvaluation')
```

### Forcer recalcul indices
```javascript
// Console navigateur
calculerEtStockerIndicesCP();  // Force recalcul C et P
const indices = JSON.parse(localStorage.getItem('indicesCP'));
console.log(indices);
```

---

## 👥 Contributeurs

**Développement principal** : Grégoire Bédard
**Collaboration IA** : Claude Code (Anthropic)
**Tests et feedback** : Communauté AQPC (novembre 2025)

---

## 📄 Licence

**Creative Commons BY-NC-SA 4.0** (Grégoire Bédard)
- ✅ Partage et adaptation autorisés (sans usage commercial)
- ✅ Attribution requise
- ✅ Redistribution sous même licence

**Ressources** : https://codexnumeris.org/apropos

---

## 📅 Historique des versions

| Version | Date | Description |
|---------|------|-------------|
| **Beta 91.2** | 26 nov 2025 | Système import/export pédagogique complet (5 phases, ~700 lignes) |
| **Beta 91.1** | 25-26 nov 2025 | Migration IndexedDB (38 commits, 37 fichiers, capacité GB) |
| **Beta 91.0** | 18 nov 2025 | Création depuis Beta 90.5, début développement avancé |
| Beta 90.5 | 5-16 nov 2025 | Sprint présentation AQPC (109 commits, 11 jours) |
| Beta 90.0 | 5 nov 2025 | Création, intégration Chart.js, système pratiques |
| Beta 89.0 | 4 nov 2025 | Support niveau "0", améliorations interface |
| Beta 88.0 | 3 nov 2025 | Correctifs absences motivées RàI, améliorations UX |

**Voir** : `Archives/` pour historique complet versions antérieures

---

## 🆕 Nouveautés Beta 91.2 (26 novembre 2025)

### Système d'import/export pédagogique

**Objectif** : Faciliter le partage de pratiques pédagogiques entre enseignants avec licence CC BY-NC-SA 4.0.

#### Fonctionnalités implémentées

**Export enrichi** :
- ✅ Métadonnées enrichies pour tous les exports (grilles, échelles, productions, cartouches)
- ✅ Champs: discipline[], niveau, description_courte, auteur, email, site
- ✅ Modal de saisie avec validation et compteurs de caractères
- ✅ Licence Creative Commons BY-NC-SA 4.0 obligatoire

**Export configuration complète** :
- ✅ Bundle toutes les ressources (échelles + grilles + productions + cartouches + paramètres)
- ✅ Génération automatique fichier LISEZMOI.txt avec:
  - Métadonnées complètes
  - Statistiques de contenu
  - Instructions d'utilisation
  - Texte complet licence CC
  - Guide d'attribution
- ✅ Téléchargement dual (JSON + TXT) avec délai 500ms

**Import intelligent** :
- ✅ Validation structure JSON
- ✅ Modal d'aperçu avec métadonnées et statistiques
- ✅ Détection automatique conflits d'ID
- ✅ Remapping intelligent des IDs (échelles, grilles)
- ✅ Mise à jour automatique références (productions → grilles, cartouches → grilles)
- ✅ Détection dépendances manquantes avec avertissement
- ✅ Option annuler ou continuer malgré dépendances manquantes

#### Fichiers modifiés/créés

**Code (7 fichiers modifiés, ~700 lignes ajoutées)** :
- `js/import-export.js` : +360 lignes (import config complète, remapping)
- `js/cc-license.js` : +330 lignes (métadonnées enrichies, README)
- `js/productions.js` : Détection dépendances manquantes
- `js/cartouches.js` : Détection dépendances manquantes
- `js/grilles.js` : Export async avec métadonnées
- `js/echelles.js` : Export async avec métadonnées
- `index 91.html` : Section UI "Configuration pédagogique complète"

**Tests et documentation (5 fichiers créés)** :
- `PHASE_5_PLAN_TESTS.md` : Plan détaillé 5 scénarios (~600 lignes)
- `PHASE_5_GUIDE_EXECUTION.md` : Guide exécution rapide
- `test-echelle-idme.json` : Échelle IDME test
- `test-grille-srpnf.json` : Grille SRPNF test
- `test-production-avec-dependance.json` : Production test avec dépendance

#### Interface utilisateur

**Réglages → Gestion des données** :
- Bouton "Exporter ma configuration complète"
- Bouton "Importer une configuration"
- Documentation claire des différences (backup vs config vs partiel)

#### Cas d'usage

1. **Harmonisation départementale** : Partager grilles communes entre collègues
2. **Mentorat** : Transmettre pratique complète à nouvel enseignant
3. **Réutilisation sessions** : Conserver configuration entre sessions
4. **Communautés de pratique** : Mutualiser ressources pédagogiques

#### Statistiques

- **Développement** : 1 session (26 novembre 2025)
- **Phases** : 5 phases (1-2-3 implémentées, 4 optionnelle, 5 tests)
- **Lignes code** : ~700 lignes ajoutées
- **Fichiers modifiés** : 7 fichiers JavaScript + 1 HTML
- **Documentation** : 5 fichiers (plan tests, guide, 3 JSON test)
- **Commits** : À créer (package complet)

---

## 🆕 Nouveautés Beta 91.1 (25-26 novembre 2025)

### Migration IndexedDB

**Objectif** : Augmenter capacité de stockage de 5-10 MB à plusieurs GB pour support multi-groupes futur.

#### Architecture hybride implémentée

- ✅ IndexedDB comme stockage persistant principal (asynchrone)
- ✅ localStorage comme cache synchrone (accès 0ms)
- ✅ API unifiée `db.js` (450 lignes)
- ✅ 100% compatibilité modules existants (aucun changement requis)
- ✅ Fallback automatique si IndexedDB indisponible

#### Fonctions clés

**API publique** :
- `db.getSync(key, defaultValue)` : Lecture synchrone depuis cache
- `db.setSync(key, value)` : Écriture synchrone + async IndexedDB
- `db.removeSync(key)` : Suppression synchrone + async IndexedDB
- `db.keys()` : Liste des clés

**API interne** :
- `db.get(key)` : Lecture async IndexedDB
- `db.set(key, value)` : Écriture async IndexedDB
- `db.remove(key)` : Suppression async IndexedDB
- `db.clear()` : Vidage complet
- `db.syncToLocalStorageCache()` : Synchronisation cache démarrage

#### Statistiques migration

- **Période** : 25-26 novembre 2025 (2 jours)
- **Commits** : 38 (20 lundi + 18 mardi)
- **Fichiers modifiés** : 37 fichiers
- **Lignes ajoutées** : +1,966
- **Lignes supprimées** : -682
- **Bugs corrigés** : 10 (double parsing, fonctions manquantes, etc.)
- **Tag Git** : `v0.91.1-indexeddb` (26 novembre 2025)
- **Fusion** : Mergé dans `main` avec succès

#### Documentation

- `INDEXEDDB_ARCHITECTURE.md` : Architecture complète (441 lignes)
- CLAUDE.md : Section mise à jour

#### Bénéfices

- **Capacité** : 5-10 MB → plusieurs GB
- **Performance** : Accès cache synchrone (0ms) préservé
- **Compatibilité** : Aucun module à modifier
- **Résilience** : Fallback localStorage automatique
- **Futur** : Base pour support multi-groupes (Beta 92+)

---

**Dernière mise à jour** : 26 novembre 2025
**Prochaine révision prévue** : À déterminer selon développements
