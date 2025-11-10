# Plan de travail - Beta 90 : Architecture pratiques de notation

**Période** : 11-18 novembre 2025
**Objectif** : Implémenter architecture modulaire supportant PAN-Maîtrise + Sommative
**Deadline** : Présentation 19 novembre 2025

---

## 📋 Vue d'ensemble

**Architecture validée** : ✅ Oui (10 novembre 2025)
**Documents de référence** :
- `ARCHITECTURE_PRATIQUES.md` - Architecture technique
- `GUIDE_AJOUT_PRATIQUE.md` - Guide opérationnel
- `FEUILLE_DE_ROUTE_PRATIQUES.md` - Roadmap complète

**Pratiques cibles** :
1. PAN-Maîtrise (Grégoire) - Extraction du code existant
2. Sommative traditionnelle - Nouvelle implémentation

---

## 🎯 PHASE 2 : Infrastructure de base

**Durée** : Jour 1-2 (lun-mar 11-12 novembre)
**Statut** : ⏳ EN COURS

### Objectif
Créer la fondation technique permettant l'enregistrement et la détection automatique des pratiques.

### Tâches

#### 2.1 - Créer le dossier pratiques
- [ ] Créer `/js/pratiques/`
- [ ] Ajouter `README.md` dans le dossier

#### 2.2 - Créer l'interface documentée
- [ ] Créer `/js/pratiques/pratique-interface.js`
- [ ] Documenter toutes les méthodes obligatoires :
  - `obtenirNom()` - Nom de la pratique
  - `obtenirId()` - Identifiant unique
  - `obtenirDescription()` - Description complète
  - `calculerPerformance(da)` - Calcul indice P
  - `calculerCompletion(da)` - Calcul indice C
  - `detecterDefis(da)` - Détection défis spécifiques
  - `identifierPattern(da)` - Pattern d'apprentissage
  - `genererCibleIntervention(da)` - Cible RàI
- [ ] Ajouter exemples de retour pour chaque méthode
- [ ] Définir les structures de données

#### 2.3 - Créer le registre de pratiques
- [ ] Créer `/js/pratiques/pratique-registry.js`
- [ ] Implémenter `enregistrerPratique(id, instance)`
- [ ] Implémenter `obtenirPratiqueActive()`
- [ ] Implémenter `listerPratiquesDisponibles()`
- [ ] Détection automatique selon `modalitesEvaluation.pratique`
- [ ] Gestion des erreurs (pratique non trouvée)

#### 2.4 - Tests infrastructure
- [ ] Créer pratique factice pour tests
- [ ] Tester enregistrement
- [ ] Tester détection automatique
- [ ] Tester gestion erreurs

### Livrables
- ✅ Dossier `/js/pratiques/` structuré
- ✅ Interface `IPratique` documentée
- ✅ Registre fonctionnel avec détection auto
- ✅ Tests passants

---

## 🔧 PHASE 3 : Extraction PAN-Maîtrise

**Durée** : Jour 3 (mer 13 novembre)
**Statut** : ⏳ EN ATTENTE

### Objectif
Isoler toute la logique PAN-Maîtrise dans un module dédié implémentant l'interface.

### Tâches

#### 3.1 - Créer la classe PratiquePANMaitrise
- [ ] Créer `/js/pratiques/pratique-pan-maitrise.js`
- [ ] Définir la structure de classe

#### 3.2 - Extraire code de profil-etudiant.js
- [ ] Copier `calculerMoyennesCriteresRecents()` (ligne ~1750-1850)
- [ ] Copier `calculerIndicesTroisDerniersArtefacts()` (ligne ~1650-1750)
- [ ] Copier `diagnostiquerForcesChallenges()` (ligne ~1900-2000)
- [ ] Copier `identifierPatternActuel()` (ligne ~2100-2200)
- [ ] Copier `determinerCibleIntervention()` (ligne ~2200-2300)

#### 3.3 - Implémenter interface IPratique
- [ ] `obtenirNom()` → "PAN-Maîtrise"
- [ ] `obtenirId()` → "pan-maitrise"
- [ ] `obtenirDescription()` → Description complète
- [ ] `calculerPerformance(da)` → Moyenne N derniers artefacts
- [ ] `calculerCompletion(da)` → Utiliser code portfolio.js
- [ ] `detecterDefis(da)` → Défis SRPNF sur N derniers
- [ ] `identifierPattern(da)` → Pattern selon moyennes
- [ ] `genererCibleIntervention(da)` → Cible RàI SRPNF

#### 3.4 - Adapter au système de configuration
- [ ] Lire `modalitesEvaluation.configPAN.nombreCours`
- [ ] Lire `modalitesEvaluation.configPAN.nombreARetenir`
- [ ] Utiliser config au lieu de valeurs hardcodées

#### 3.5 - Tests
- [ ] Tester avec données actuelles (groupe 00001)
- [ ] Vérifier identité des résultats vs code original
- [ ] Tester avec différentes configs (3/7/12 cours)

### Livrables
- ✅ Classe `PratiquePANMaitrise` complète
- ✅ Code PAN isolé et réutilisable
- ✅ Configuration dynamique fonctionnelle
- ✅ Tests passants

---

## 📊 PHASE 4 : Implémentation Sommative

**Durée** : Jour 4 (jeu 14 novembre)
**Statut** : ⏳ EN ATTENTE

### Objectif
Créer une pratique sommative traditionnelle avec moyenne pondérée.

### Tâches

#### 4.1 - Créer la classe PratiqueSommative
- [ ] Créer `/js/pratiques/pratique-sommative.js`
- [ ] Définir structure de classe

#### 4.2 - Implémenter méthodes identité
- [ ] `obtenirNom()` → "Sommative traditionnelle"
- [ ] `obtenirId()` → "sommative"
- [ ] `obtenirDescription()` → Description complète

#### 4.3 - Implémenter calculs
- [ ] `calculerPerformance(da)` :
  - Moyenne pondérée de TOUTES les évaluations
  - Exclure évaluations remplacées
  - Inclure jetons de reprise
  - Respecter pondérations productions
- [ ] `calculerCompletion(da)` :
  - Nombre remis / Total attendu
  - Inclure toutes productions (pas juste artefacts)

#### 4.4 - Implémenter détection défis génériques
- [ ] `detecterDefis(da)` :
  - Défis génériques (pas SRPNF)
  - Basés sur notes faibles (< 60%)
  - Basés sur tendance (baisse)
  - Basés sur écart-type (irrégularité)

#### 4.5 - Implémenter patterns
- [ ] `identifierPattern(da)` :
  - Blocage critique : P < 60%
  - Blocage émergent : P entre 60-70%
  - Défi spécifique : P entre 70-80%
  - Stable : P entre 80-85%
  - Progression : P > 85%

#### 4.6 - Implémenter cibles RàI
- [ ] `genererCibleIntervention(da)` :
  - Cibles adaptées sommative
  - Focus sur productions faibles
  - Stratégies de rattrapage
  - Pas de critères SRPNF

#### 4.7 - Tests
- [ ] Tester avec données démo
- [ ] Vérifier calculs pondérés
- [ ] Vérifier différence PAN vs Sommative

### Livrables
- ✅ Classe `PratiqueSommative` complète
- ✅ Support complet pratique sommative
- ✅ Différences claires PAN vs Sommative
- ✅ Tests passants

---

## 🔄 PHASE 5 : Migration modules existants

**Durée** : Jour 5 (ven 15 novembre)
**Statut** : ⏳ EN ATTENTE

### Objectif
Adapter les modules existants pour utiliser l'interface au lieu du code hardcodé.

### Tâches

#### 5.1 - Migrer profil-etudiant.js

**Section Développement des habiletés** (ligne ~1650-2300)
- [ ] Remplacer `calculerMoyennesCriteresRecents()` par `pratique.detecterDefis(da)`
- [ ] Remplacer `diagnostiquerForcesChallenges()` par `pratique.detecterDefis(da)`
- [ ] Adapter affichage défis selon pratique :
  - PAN : Défis SRPNF avec moyennes
  - Sommative : Défis génériques avec productions faibles

**Section Patterns d'apprentissage** (ligne ~2100-2200)
- [ ] Remplacer `identifierPatternActuel()` par `pratique.identifierPattern(da)`
- [ ] Adapter affichage selon pratique

**Section RàI** (ligne ~2200-2400)
- [ ] Remplacer `determinerCibleIntervention()` par `pratique.genererCibleIntervention(da)`
- [ ] Adapter affichage cibles selon pratique :
  - PAN : Critère SRPNF faible
  - Sommative : Production faible à refaire

#### 5.2 - Migrer tableau-bord-apercu.js

**Section Patterns d'apprentissage** (ligne ~400-600)
- [ ] Utiliser `pratique.identifierPattern(da)` pour chaque étudiant
- [ ] Adapter compteurs selon pratiques actives

**Section RàI** (ligne ~600-800)
- [ ] Utiliser `pratique.genererCibleIntervention(da)` si nécessaire
- [ ] Adapter groupement selon pratique

#### 5.3 - Migrer portfolio.js

**Fonction calculerEtStockerIndicesCP** (ligne ~200-400)
- [ ] Garder calcul C universel
- [ ] Adapter calcul P selon pratique :
  - PAN : Utiliser `pratiquePAN.calculerPerformance(da)`
  - Sommative : Utiliser `pratiqueSOM.calculerPerformance(da)`
- [ ] Stocker les deux si mode comparatif actif

#### 5.4 - Tests migration
- [ ] Tester profil étudiant PAN-Maîtrise
- [ ] Tester profil étudiant Sommative
- [ ] Tester tableau de bord mixte
- [ ] Vérifier mode comparatif fonctionne

### Livrables
- ✅ `profil-etudiant.js` utilise interface
- ✅ `tableau-bord-apercu.js` utilise interface
- ✅ `portfolio.js` adaptatif selon pratique
- ✅ Fonctionnement identique PAN-Maîtrise
- ✅ Support automatique Sommative
- ✅ Tests passants

---

## ✅ PHASE 6 : Tests et documentation

**Durée** : Jour 6-7 (sam-dim 16-17 novembre)
**Statut** : ⏳ EN ATTENTE

### Objectif
Valider complètement le système et documenter pour utilisateurs.

### Tâches

#### 6.1 - Tests complets

**Tests fonctionnels**
- [ ] Basculer PAN ↔ Sommative dans réglages
- [ ] Vérifier calcul P différent selon pratique
- [ ] Vérifier défis adaptés selon pratique
- [ ] Vérifier patterns identiques (universel)
- [ ] Vérifier cibles RàI adaptées
- [ ] Tester avec groupe 00001 (données réelles)
- [ ] Tester avec données démo

**Tests mode comparatif**
- [ ] Activer mode comparatif
- [ ] Vérifier affichage SOM et PAN simultané
- [ ] Vérifier compteurs patterns corrects
- [ ] Vérifier légende claire

**Tests edge cases**
- [ ] Étudiant sans évaluations
- [ ] Étudiant avec jeton de reprise
- [ ] Étudiant avec toutes évaluations remplacées
- [ ] Changement pratique en cours de session

#### 6.2 - Documentation utilisateur

**Mise à jour section Aide**
- [ ] Ajouter section "Pratiques de notation"
- [ ] Expliquer PAN-Maîtrise vs Sommative
- [ ] Documenter différences calculs
- [ ] Documenter défis selon pratique
- [ ] Ajouter FAQ pratiques

**Mise à jour CLAUDE.md**
- [ ] Ajouter section architecture pratiques
- [ ] Documenter interface IPratique
- [ ] Documenter registre
- [ ] Documenter pratiques disponibles
- [ ] Ajouter exemples d'ajout pratique

**Guide testeurs**
- [ ] Mise à jour `GUIDE_TESTEURS.md`
- [ ] Documenter comment tester les 2 pratiques
- [ ] Documenter mode comparatif
- [ ] Scénarios de test

#### 6.3 - Polish interface

**Messages selon pratique active**
- [ ] Profil étudiant : Adapter titres sections selon pratique
- [ ] Tableau bord : Badge pratique active
- [ ] Réglages : Aide contextuelle selon pratique

**Configuration PAN visible**
- [ ] Section config PAN affichée si pratique = PAN
- [ ] Masquée si pratique = Sommative

#### 6.4 - Préparation démo

**Jeu de données démo**
- [ ] Créer étudiant exemple PAN-Maîtrise
- [ ] Créer étudiant exemple Sommative
- [ ] Préparer basculement PAN ↔ Sommative

**Script de démo**
- [ ] Scénario 1 : Profil PAN-Maîtrise
- [ ] Scénario 2 : Profil Sommative
- [ ] Scénario 3 : Mode comparatif
- [ ] Scénario 4 : Configuration pratique

### Livrables
- ✅ Application stable avec 2 pratiques
- ✅ Tests complets passants
- ✅ Documentation utilisateur complète
- ✅ Documentation technique à jour
- ✅ Guide testeurs mis à jour
- ✅ Démo préparée
- ✅ **Prêt pour présentation 19 novembre**

---

## 📅 Timeline récapitulatif

```
Lun 11 nov  ──► PHASE 2 (Infrastructure)
Mar 12 nov  ──► PHASE 2 (Tests + docs)
Mer 13 nov  ──► PHASE 3 (PAN-Maîtrise)
Jeu 14 nov  ──► PHASE 4 (Sommative)
Ven 15 nov  ──► PHASE 5 (Migration)
Sam 16 nov  ──► PHASE 6 (Tests)
Dim 17 nov  ──► PHASE 6 (Docs + Polish)
Lun 18 nov  ──► BUFFER / Urgences
Mar 19 nov  ──► 🎉 PRÉSENTATION
```

---

## 🎯 Critères de succès

### Fonctionnels
- ✅ 2 pratiques fonctionnelles (PAN-Maîtrise, Sommative)
- ✅ Basculement fluide entre pratiques
- ✅ Calcul P différent selon pratique
- ✅ Défis adaptés selon pratique
- ✅ Cibles RàI pertinentes selon pratique
- ✅ Mode comparatif fonctionnel

### Techniques
- ✅ Code modulaire et maintenable
- ✅ Interface claire et documentée
- ✅ Registre extensible
- ✅ Pas de régression fonctionnelle
- ✅ Tests passants

### Utilisateur
- ✅ Configuration simple
- ✅ Messages clairs selon pratique
- ✅ Documentation complète
- ✅ Aide contextuelle

---

## 📊 Suivi quotidien

### Lundi 11 novembre
- [ ] Créer infrastructure
- [ ] ...

### Mardi 12 novembre
- [ ] ...

### Mercredi 13 novembre
- [ ] ...

### Jeudi 14 novembre
- [ ] ...

### Vendredi 15 novembre
- [ ] ...

### Samedi 16 novembre
- [ ] ...

### Dimanche 17 novembre
- [ ] ...

### Lundi 18 novembre (Buffer)
- [ ] ...

---

**Version** : 1.0
**Date création** : 10 novembre 2025
**Dernière mise à jour** : 10 novembre 2025
**Auteur** : Plan validé avec Grégoire
