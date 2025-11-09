# Feuille de route - Système de pratiques de notation

**Roadmap d'implémentation - Version 1.0 (9 novembre 2025)**

---

## 📋 Vue d'ensemble

Ce document liste **toutes les tâches** nécessaires pour implémenter le système de pratiques de notation, dans l'ordre chronologique.

**Objectif** : Passer du code couplé PAN-Maîtrise à une architecture modulaire supportant plusieurs pratiques.

**Durée estimée totale** : 4-5 jours de travail

---

## 🎯 Phase 1 : Documentation et planification

**Durée** : 0.5 jour
**Statut** : ✅ COMPLÉTÉ (9 novembre 2025)

### Tâches

- [x] Créer `ARCHITECTURE_PRATIQUES.md` (document de référence)
- [x] Créer `GUIDE_AJOUT_PRATIQUE.md` (guide opérationnel)
- [x] Créer `FEUILLE_DE_ROUTE_PRATIQUES.md` (ce document)
- [ ] Valider architecture avec Grégoire
- [ ] Mettre à jour `CLAUDE.md` avec références aux nouveaux docs

### Livrables

- Documentation complète du système
- Architecture validée
- Plan d'exécution clair

---

## 🏗️ Phase 2 : Infrastructure de base

**Durée** : 1 jour
**Statut** : ⏳ EN ATTENTE
**Dépendances** : Phase 1 validée

### Tâches

#### 2.1 - Créer l'interface documentée

- [ ] Créer `/js/pratiques/pratique-interface.js`
  - [ ] Documenter toutes les méthodes obligatoires
  - [ ] Ajouter des exemples de retour
  - [ ] Définir les types et structures de données

#### 2.2 - Créer le registre de pratiques

- [ ] Créer `/js/pratiques/pratique-registry.js`
  - [ ] Fonction `obtenirPratiqueActive()`
  - [ ] Fonction `enregistrerPratique(id, instance)`
  - [ ] Fonction `listerPratiquesDisponibles()`
  - [ ] Détection automatique selon `config.pratique`
  - [ ] Gestion des erreurs (pratique non trouvée)

#### 2.3 - Créer le dossier pratiques

- [ ] Créer `/js/pratiques/` (si n'existe pas)
- [ ] Ajouter README.md dans le dossier expliquant la structure

### Livrables

- Infrastructure technique prête
- Système de registre fonctionnel
- Documentation de l'interface

---

## 🔧 Phase 3 : Extraction PAN-Maîtrise

**Durée** : 1.5 jours
**Statut** : ⏳ EN ATTENTE
**Dépendances** : Phase 2 complétée

### Tâches

#### 3.1 - Créer la classe PratiquePANMaitrise

- [ ] Créer `/js/pratiques/pratique-pan-maitrise.js`
- [ ] Copier le code actuel de `profil-etudiant.js` :
  - [ ] `calculerMoyennesCriteresRecents()` → méthode de classe
  - [ ] `calculerIndicesTroisDerniersArtefacts()` → méthode interne
  - [ ] `diagnostiquerForcesChallenges()` → adapter pour `detecterDefis()`
  - [ ] `identifierPatternActuel()` → adapter pour `identifierPattern()`
  - [ ] `determinerCibleIntervention()` → adapter pour `genererCibleIntervention()`

#### 3.2 - Implémenter les méthodes obligatoires

- [ ] `obtenirNom()` : "PAN-Maîtrise"
- [ ] `obtenirId()` : "pan-maitrise"
- [ ] `obtenirDescription()` : Description complète
- [ ] `calculerPerformance(da)` : Moyenne N derniers artefacts
- [ ] `calculerCompletion(da)` : Utiliser code existant de `portfolio.js`
- [ ] `detecterDefis(da)` : Défis SRPNF sur N derniers
- [ ] `identifierPattern(da)` : Logique avec seuils IDME
- [ ] `genererCibleIntervention(da, pattern, defis)` : Cibles basées sur SRPNF
- [ ] `obtenirParametres()` : Retourner config PAN
- [ ] `validerConfiguration()` : Vérifier échelle IDME, productions, etc.

#### 3.3 - Adapter profil-etudiant.js

- [ ] Remplacer appels directs par appels via interface :
  ```javascript
  // AVANT
  const moyennes = calculerMoyennesCriteresRecents(da);

  // APRÈS
  const pratique = obtenirPratiqueActive();
  const defis = pratique.detecterDefis(da);
  ```

- [ ] Zones à modifier :
  - [ ] Fonction `determinerCibleIntervention()`
  - [ ] Fonction `afficherSectionAccompagnement()`
  - [ ] Fonction `afficherSectionPerformance()`
  - [ ] Fonction `afficherSectionMobilisation()`

#### 3.4 - Adapter etudiants.js (tableau des individus)

- [ ] Fonction `afficherListeEtudiantsConsultation()` :
  - [ ] Utiliser `pratique.identifierPattern(da)` au lieu de code direct
  - [ ] Utiliser `pratique.detecterDefis(da)` pour la colonne défis

#### 3.5 - Tests de non-régression

- [ ] Vérifier que PAN-Maîtrise fonctionne toujours :
  - [ ] Patterns affichés correctement dans le tableau
  - [ ] Défis SRPNF détectés correctement
  - [ ] Profil étudiant affiche les bonnes recommandations
  - [ ] Niveaux RàI cohérents
  - [ ] Aucune erreur JavaScript dans la console

### Livrables

- Code PAN-Maîtrise extrait et isolé
- `profil-etudiant.js` utilise l'interface
- Tests de non-régression passés

---

## 🔨 Phase 4 : Implémentation Sommative

**Durée** : 1 jour
**Statut** : ⏳ EN ATTENTE
**Dépendances** : Phase 3 complétée

### Tâches

#### 4.1 - Créer la classe PratiqueSommative

- [ ] Créer `/js/pratiques/pratique-sommative.js`
- [ ] Implémenter toutes les méthodes obligatoires :
  - [ ] `obtenirNom()` : "Sommative traditionnelle"
  - [ ] `obtenirId()` : "sommative"
  - [ ] `obtenirDescription()`
  - [ ] `calculerPerformance(da)` : Moyenne pondérée provisoire
  - [ ] `calculerCompletion(da)` : Productions remises / total
  - [ ] `detecterDefis(da)` : Défis génériques ou liste vide
  - [ ] `identifierPattern(da)` : Basé sur performance globale
  - [ ] `genererCibleIntervention()` : Recommandations génériques
  - [ ] `obtenirParametres()` : Configuration sommative
  - [ ] `validerConfiguration()` : Vérifier productions

#### 4.2 - Enregistrer la pratique

- [ ] Ajouter dans `pratique-registry.js` :
  ```javascript
  'sommative': new PratiqueSommative()
  ```

#### 4.3 - Ajouter le script dans index.html

- [ ] Ajouter avant le registre :
  ```html
  <script src="js/pratiques/pratique-sommative.js"></script>
  ```

#### 4.4 - Tests avec données démo

- [ ] Créer jeu de données test sommative
- [ ] Basculer en mode sommative :
  ```javascript
  config.pratique = 'sommative';
  ```
- [ ] Vérifier :
  - [ ] Performance calculée avec moyenne pondérée
  - [ ] Patterns détectés correctement
  - [ ] Recommandations cohérentes
  - [ ] Pas d'erreurs console

### Livrables

- Pratique sommative fonctionnelle
- Tests validés
- Documentation de base

---

## 🧪 Phase 5 : Tests et validation

**Durée** : 1 jour
**Statut** : ⏳ EN ATTENTE
**Dépendances** : Phase 4 complétée

### Tâches

#### 5.1 - Tests de basculement

- [ ] Tester passage PAN-Maîtrise → Sommative
- [ ] Tester passage Sommative → PAN-Maîtrise
- [ ] Vérifier recalcul des indices
- [ ] Vérifier affichage mis à jour

#### 5.2 - Tests de cohérence

- [ ] Indices A-C-P-R identiques entre pratiques (A et R)
- [ ] Indices P différents mais cohérents
- [ ] Niveaux RàI cohérents avec les patterns
- [ ] Tableau de bord fonctionne pour les deux pratiques

#### 5.3 - Tests de robustesse

- [ ] Étudiant sans évaluation
- [ ] Étudiant avec 1 seule évaluation
- [ ] Étudiant avec toutes les évaluations
- [ ] Passage d'une pratique à l'autre en cours de trimestre

#### 5.4 - Tests d'interface

- [ ] Section Aide complète pour les deux pratiques
- [ ] Interface de choix de pratique (Réglages)
- [ ] Messages d'erreur clairs
- [ ] Validation de configuration

### Livrables

- Suite de tests passés
- Bugs identifiés et corrigés
- Validation de la cohérence

---

## 📚 Phase 6 : Documentation utilisateur

**Durée** : 0.5 jour
**Statut** : ⏳ EN ATTENTE
**Dépendances** : Phase 5 complétée

### Tâches

#### 6.1 - Mettre à jour section Aide

- [ ] Ajouter section "Pratiques de notation"
- [ ] Documenter PAN-Maîtrise
- [ ] Documenter Sommative
- [ ] Expliquer comment choisir sa pratique
- [ ] FAQ sur les pratiques

#### 6.2 - Créer guide de configuration

- [ ] Comment configurer PAN-Maîtrise
- [ ] Comment configurer Sommative
- [ ] Comment basculer entre pratiques
- [ ] Recommandations selon le contexte

#### 6.3 - Mettre à jour CLAUDE.md

- [ ] Ajouter références aux nouveaux fichiers
- [ ] Documenter architecture pratiques
- [ ] Ajouter section "Ajouter une pratique"
- [ ] Exemples pour Claude Code

### Livrables

- Documentation utilisateur complète
- Guide de configuration
- CLAUDE.md à jour

---

## 🚀 Phase 7 : Release et distribution

**Durée** : 0.5 jour
**Statut** : ⏳ EN ATTENTE
**Dépendances** : Phase 6 complétée

### Tâches

#### 7.1 - Créer notes de version

- [ ] Créer `NOTES_VERSION_0.91.md`
- [ ] Lister toutes les nouveautés
- [ ] Documenter breaking changes (s'il y en a)
- [ ] Migration guide si nécessaire

#### 7.2 - Package de distribution

- [ ] Créer `Monitorage_Beta_0.91.zip`
- [ ] Inclure tous les fichiers nécessaires
- [ ] Inclure documentation
- [ ] Inclure données démo pour les deux pratiques

#### 7.3 - Communication

- [ ] Annonce aux testeurs
- [ ] Documentation sur codexnumeris.org
- [ ] Invitation aux collaborateurs pour ajouter leurs pratiques

### Livrables

- Beta 0.91 prête à distribuer
- Documentation publiée
- Communication envoyée

---

## 📊 Phases futures (post-0.91)

### Phase 8 : Pratiques additionnelles

**Selon demande des collaborateurs**

- [ ] PAN-Spécifications
- [ ] Dénotation (Ungrading)
- [ ] Hybrides personnalisées

### Phase 9 : Optimisations

- [ ] Cache des calculs de pratique
- [ ] Performance avec gros volumes
- [ ] Import/export de configurations de pratiques

---

## 🎯 Critères de succès

### Pour la Beta 0.91

✅ **Fonctionnel**
- Deux pratiques implémentées (PAN-Maîtrise, Sommative)
- Basculement fluide entre pratiques
- Indices A-C-P-R corrects pour les deux
- Aucune régression sur fonctionnalités existantes

✅ **Architectural**
- Code découplé et modulaire
- Interface claire et documentée
- Facile d'ajouter une nouvelle pratique

✅ **Documentation**
- Architecture documentée
- Guide d'ajout de pratique complet
- Section Aide à jour
- CLAUDE.md à jour

✅ **Tests**
- Suite de tests passée
- Pas d'erreurs console
- Données démo pour les deux pratiques

---

## 📞 Notes pour les prochaines conversations

### Où on en est

**Dernière mise à jour** : 9 novembre 2025, 16h
**Phase actuelle** : Phase 1 (Documentation) - EN COURS
**Prochaine étape** : Validation de l'architecture par Grégoire

### Points de décision en attente

- [ ] Validation de l'architecture par Grégoire
- [ ] Choix de la stratégie pour détection défis en Sommative (défis génériques vs aucun défi)
- [ ] Format d'affichage des pratiques dans l'interface utilisateur

### Fichiers créés lors de cette session

1. `ARCHITECTURE_PRATIQUES.md` - Document de référence
2. `GUIDE_AJOUT_PRATIQUE.md` - Guide opérationnel
3. `FEUILLE_DE_ROUTE_PRATIQUES.md` - Ce document

---

**Version** : 1.0 (9 novembre 2025)
**Dernière mise à jour** : 2025-11-09 16:00
**Responsable** : Grégoire Bédard / Claude Code
**Statut global** : Phase 1 en cours
