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
| **Beta 91.0** | 18 nov 2025 | Création depuis Beta 90.5, début développement avancé |
| Beta 90.5 | 5-16 nov 2025 | Sprint présentation AQPC (109 commits, 11 jours) |
| Beta 90.0 | 5 nov 2025 | Création, intégration Chart.js, système pratiques |
| Beta 89.0 | 4 nov 2025 | Support niveau "0", améliorations interface |
| Beta 88.0 | 3 nov 2025 | Correctifs absences motivées RàI, améliorations UX |

**Voir** : `Archives/` pour historique complet versions antérieures

---

**Dernière mise à jour** : 18 novembre 2025
**Prochaine révision prévue** : À déterminer selon développements
