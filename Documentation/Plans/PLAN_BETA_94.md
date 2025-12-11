# Plan de match Beta 94
**Date de création :** 10 décembre 2025
**Objectif :** Support multi-cours + Corrections critiques + Améliorations UX

---

## 🎯 Vision Beta 94

Permettre aux enseignants de gérer **plusieurs groupes-cours simultanément** tout en corrigeant les bugs critiques et en améliorant l'expérience utilisateur.

---

## 📋 Priorités et phases

### **PRIORITÉ 1 : Support multi-cours** ⭐⭐⭐ (CRITIQUE)
**Objectif :** Gérer plusieurs groupes simultanément (ex: 601-101-9999, 601-102-8888, 601-103-7777)

#### Phase 1A : Architecture et stockage (2-3 jours)
- [ ] Analyse architecture actuelle (localStorage → IndexedDB)
- [ ] Conception structure multi-cours dans IndexedDB
  - Collections par cours : `cours-{id}/presences`, `cours-{id}/evaluations`, etc.
  - Métadonnées globales : `listeCours`, `coursActif`
- [ ] Migration système actuel (groupe unique → multi-groupes)
- [ ] Création module `js/multi-cours.js`

#### Phase 1B : Interface de sélection (1-2 jours)
- [ ] Menu déroulant sélection cours actif (en-tête ou sidebar)
- [ ] Persistance du cours actif (localStorage.coursActif)
- [ ] Rechargement automatique des données lors du changement de cours
- [ ] Indicateur visuel du cours actif

#### Phase 1C : Gestion des cours (1 jour)
- [ ] Interface "Mes cours" (création, édition, archivage)
- [ ] Import/export par cours (isolation des données)
- [ ] Duplication de cours (template pour nouvelle session)

#### Phase 1D : Tests et validation (1 jour)
- [ ] Tests avec 3 cours simultanés
- [ ] Vérification isolation des données
- [ ] Performance avec plusieurs cours

**Durée estimée :** 5-7 jours

---

### **PRIORITÉ 2 : Bug snapshots Performance (P)** ⭐⭐⭐ (CRITIQUE)
**Problème :** Snapshots affichent P=65-69% alors que calcul temps réel affiche P=78%

#### Investigation (0.5 jour)
- [ ] Vérifier lecture snapshots depuis IndexedDB (`db.get('snapshots')`)
- [ ] Comparer calcul P dans snapshots vs `indicesCP`
- [ ] Identifier si problème vient de :
  - Capture des snapshots (fonction `capturerSnapshot()`)
  - Lecture/affichage dans graphique
  - Conversion échelle (0-1 vs 0-100)

#### Correction (0.5 jour)
- [ ] Corriger fonction de capture si elle utilise ancienne logique
- [ ] Forcer recalcul snapshots avec nouvelle logique
- [ ] Valider que P dans snapshots = P dans indicesCP

#### Validation (0.5 jour)
- [ ] Reconstruire tous les snapshots
- [ ] Vérifier graphiques affichent bonnes valeurs
- [ ] Tester avec plusieurs étudiants

**Durée estimée :** 1-2 jours

---

### **PRIORITÉ 3 : Améliorations groupe démo 9999** ⭐⭐
**Objectif :** Améliorer expérience utilisateurs testant l'application

#### Améliorations (1-2 jours)
- [ ] Ajouter tutoriel interactif au premier chargement du groupe 9999
- [ ] Améliorer diversité des profils étudiants (patterns variés)
- [ ] Ajouter exemples d'interventions RàI pré-complétées
- [ ] Documentation contextuelle (tooltips explicatifs)
- [ ] Message d'accueil expliquant que c'est un bac à sable

**Durée estimée :** 1-2 jours

---

### **PRIORITÉ 4 : Optimisations UX** ⭐⭐

#### 4.1 Profil étudiant par défaut (0.5 jour)
**Problème actuel :** Page vide au chargement, utilisateur doit sélectionner manuellement

**Solution :**
- [ ] Charger automatiquement le 1er étudiant de la liste (ordre alphabétique)
- [ ] Conserver dernier étudiant consulté (localStorage.dernierEtudiantConsulte)
- [ ] Restaurer dernier étudiant au rechargement

#### 4.2 Performance chargement (1 jour)
- [ ] Lazy loading des sections profil (charger à la demande)
- [ ] Cache calculs lourds (indices, patterns)
- [ ] Optimisation taille graphiques (compression)

#### 4.3 Navigation améliorée (0.5 jour)
- [ ] Breadcrumbs (fil d'Ariane)
- [ ] Raccourcis clavier (← → pour navigation étudiants)
- [ ] Recherche rapide étudiants (Ctrl+K)

**Durée estimée :** 2 jours

---

### **PRIORITÉ 5 : Nouvelles fonctionnalités pédagogiques** ⭐

#### 5.1 Icônes dans graphiques (1 jour)
**Objectif :** Annoter graphiques avec événements importants

- [ ] Icône 📝 : Artefact évalué (à chaque évaluation)
- [ ] Icône 🎯 : Intervention RàI (niveau 2 ou 3)
- [ ] Tooltip au survol avec détails (date, titre, note/participants)
- [ ] Filtres visuels (afficher/masquer types d'événements)

**Implémentation :**
- Plugin Chart.js annotations
- Lecture événements depuis snapshots
- Positionnement automatique sur timeline

#### 5.2 Interface étudiante (2-3 jours)
**Objectif :** Vue lecture seule pour les étudiants

- [ ] Mode "Étudiant" (authentification simple par DA)
- [ ] Profil personnel (indices A-C-P-E, patterns, recommandations)
- [ ] Historique évaluations (notes, rétroactions)
- [ ] Graphiques progression personnels
- [ ] Export PDF rapport personnel

**Limitations :**
- Lecture seule (pas de modification)
- Isolation (ne voit que ses propres données)
- Désactivation sections enseignant (interventions, groupe)

#### 5.3 Rapports pour élève (1-2 jours)
**Objectif :** Générer rapports imprimables/exportables

- [ ] Rapport mi-trimestre (bilan + recommandations)
- [ ] Rapport final (synthèse complète)
- [ ] Export PDF avec graphiques
- [ ] Templates personnalisables (logo, en-tête)
- [ ] Génération en lot (tous les étudiants)

**Durée estimée :** 4-6 jours

---

## 📅 Calendrier proposé

### Semaine 1 (10-16 décembre) - FONDATIONS
- **Jour 1-2 :** Support multi-cours Phase 1A (Architecture)
- **Jour 3-4 :** Support multi-cours Phase 1B (Interface sélection)
- **Jour 5 :** Bug snapshots P (Investigation + Correction)
- **Weekend :** Tests et validation multi-cours

### Semaine 2 (17-23 décembre) - CONSOLIDATION
- **Jour 1 :** Support multi-cours Phase 1C (Gestion cours)
- **Jour 2 :** Support multi-cours Phase 1D (Tests)
- **Jour 3 :** Améliorations groupe démo 9999
- **Jour 4 :** UX 4.1 (Profil par défaut) + 4.3 (Navigation)
- **Jour 5 :** UX 4.2 (Performance)

### Semaine 3 (6-12 janvier) - ENRICHISSEMENT
- **Jour 1 :** Icônes dans graphiques (5.1)
- **Jour 2-3 :** Interface étudiante (5.2)
- **Jour 4-5 :** Rapports pour élève (5.3)

### Semaine 4 (13-19 janvier) - FINALISATION
- **Jour 1-2 :** Tests complets Beta 94
- **Jour 3 :** Corrections bugs
- **Jour 4 :** Documentation
- **Jour 5 :** Déploiement Beta 94

---

## 🎯 Objectifs de sortie Beta 94

### Must-have (Requis pour release)
- ✅ Support multi-cours fonctionnel (3 cours minimum)
- ✅ Bug snapshots P corrigé
- ✅ Profil étudiant chargé par défaut

### Should-have (Fortement souhaités)
- ✅ Améliorations groupe démo 9999
- ✅ Icônes dans graphiques
- ✅ Navigation améliorée

### Nice-to-have (Bonus si temps disponible)
- Interface étudiante
- Rapports pour élève
- Performance optimisée

---

## 📊 Métriques de succès

1. **Multi-cours :** Gérer 3+ cours sans ralentissement (<2s changement cours)
2. **Précision :** Snapshots P = Calcul temps réel (écart <1%)
3. **UX :** Profil étudiant charge automatiquement (<1s)
4. **Groupe démo :** 80%+ testeurs complètent tutoriel
5. **Performance :** Temps chargement initial <3s

---

## 🔧 Fichiers impactés (estimation)

### Nouveaux fichiers
- `js/multi-cours.js` (gestion multi-cours)
- `js/interface-etudiant.js` (mode étudiant)
- `js/rapports.js` (génération rapports)
- `Documentation/GUIDE_MULTI_COURS.md`

### Modifications majeures
- `js/db.js` (isolation données par cours)
- `js/main.js` (initialisation multi-cours)
- `js/navigation.js` (sélecteur cours)
- `js/snapshots.js` (correction calcul P)
- `js/profil-etudiant.js` (chargement auto)
- `js/graphiques-progression.js` (annotations)
- `index.html` (interface sélection cours)

---

## 🚨 Risques identifiés

1. **Migration multi-cours :** Complexité élevée, risque de régression
   - Mitigation : Tests exhaustifs, branche séparée, backup données

2. **Performance IndexedDB :** Ralentissement avec plusieurs cours
   - Mitigation : Lazy loading, pagination, cache intelligent

3. **Interface étudiante :** Sécurité (isolation données)
   - Mitigation : Validation stricte DA, mode lecture seule

4. **Temps développement :** Plan ambitieux (4 semaines)
   - Mitigation : Priorisation stricte (Must-have first)

---

## 📝 Notes

- Beta 94 sera la **version la plus ambitieuse** depuis le début du projet
- Support multi-cours est un **game changer** pour l'adoption
- Interface étudiante ouvre la porte à **nouvelles utilisations pédagogiques**
- Garder compatibilité Beta 93.5 (migration automatique)

---

**Prochaine étape :** Valider ce plan avec vous, puis démarrer Phase 1A (Architecture multi-cours)
