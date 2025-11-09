# Plan d'action - Présentation du 19 novembre 2025

**Date limite** : 19 novembre 2025 (10 jours)
**Événement** : Présentation Communauté de pratique (400 personnes inscrites)
**Objectif** : Beta 90.5 fonctionnelle et inspirante pour enseignants en PAN

---

## 🎯 Vision

Présenter une application **simple, claire et fonctionnelle** qui inspire les enseignants à se lancer dans les PAN, sans les submerger de complexité technique.

**Cible** : Enseignants en fin de trimestre qui n'ont PAS le temps pour des expérimentations complexes.

---

## 📅 Sprint de 10 jours

### **Semaine 1 : 9-15 novembre**

#### **Jours 1-2 : Corriger les bugs actuels (9-10 nov)**

**Statut** : ✅ EN COURS

**Tâches** :
- [x] Créer `calculerMoyennesCriteresRecents()` pour moyennes sur N artefacts
- [x] Modifier `identifierPatternActuel()` pour utiliser seuils IDME configurables
- [x] Modifier `determinerCibleIntervention()` pour distinguer PAN vs SOM
- [ ] **TESTER** : Vérifier que Maïka affiche "Défi spécifique" (pas "Stable")
- [ ] **TESTER** : Vérifier détection défis sur moyennes récentes
- [ ] **TESTER** : Vérifier cohérence pattern/RàI/recommandations

**Bugs à corriger** :
1. ❌ Patterns incorrects : Tout le monde "Stable" malgré défis
2. ❌ Défis non détectés : Moyennes globales au lieu de moyennes récentes
3. ❌ Incohérence : Élève "en baisse" marqué "Stable"

**Fichiers modifiés** :
- `js/profil-etudiant.js` (lignes 3517-3617, 3766-3770, 4074-4096, 4104-4119)
- Cache buster : v=2025110910

---

#### **Jours 3-4 : Package de démonstration (11-12 nov)**

**Statut** : ⏳ EN ATTENTE

**Créer** : `Monitorage_Beta_90.5_Demo.zip`

**Contenu du package** :
1. **Application complète** (index 90.html + tous les JS/CSS)
2. **Données de démo réalistes** :
   - 30 étudiants (noms fictifs)
   - 10 artefacts évalués
   - Variété de performances (Stable, Défis, Blocages)
   - Quelques présences saisies
3. **LISEZMOI_DEMO.txt** :
   - Étapes 1-2-3 pour démarrer
   - Chemins exacts à double-cliquer
   - Que faire si ça ne marche pas
4. **DEMARRAGE_5MIN.pdf** :
   - Guide visuel avec captures d'écran
   - Flèches et annotations
   - Checklist de configuration (max 10 points)

**Test** : Faire tester par 2-3 collègues naïfs (non-techniciens)

---

#### **Jours 5-6 : Documentation publique (13-14 nov)**

**Statut** : ⏳ EN ATTENTE

**Créer** :
1. **GUIDE_UTILISATEUR_SIMPLE.pdf** (20-30 pages max)
   - Qu'est-ce que c'est ?
   - À qui ça s'adresse ?
   - Comment démarrer ?
   - Saisir ses premières évaluations
   - Comprendre les indices A-C-P-R
   - Comprendre les patterns et RàI
   - Captures d'écran annotées

2. **FAQ_PRATIQUES_PAN.md**
   - 10 questions essentielles
   - Qu'est-ce qu'une PAN ?
   - Quelle est la différence PAN-Maîtrise vs Sommative ?
   - Comment choisir ma pratique ?
   - Puis-je personnaliser les seuils IDME ?
   - Que signifie "Défi spécifique" ?
   - Comment interpréter les niveaux RàI ?

3. **[OPTIONNEL] Vidéo courte (8-10 min)** :
   - Screencast avec narration
   - "Prise en main en 10 minutes"
   - Montrer : ouvrir, configurer, saisir, consulter

---

### **Semaine 2 : 16-19 novembre**

#### **Jours 7-8 : Préparation de la présentation (16-17 nov)**

**Statut** : ⏳ EN ATTENTE

**Créer matériel de présentation** :
1. **Diaporama (max 10 slides)** :
   - Slide 1 : Problème (suivi pédagogique chronophage)
   - Slide 2 : Solution (dépistage automatisé)
   - Slide 3 : PAN-Maîtrise (mon contexte)
   - Slide 4 : Indices A-C-P-R (universels)
   - Slide 5 : Patterns et RàI (universels)
   - Slide 6 : Démo live (1 minute)
   - Slide 7 : Pour d'autres pratiques ? (architecture modulaire)
   - Slide 8 : Où télécharger ? (lien GitHub)
   - Slide 9 : Comment contribuer ? (labo@codexnumeris.org)
   - Slide 10 : Questions ?

2. **Script de talking points** :
   - 3-4 phrases par slide
   - Temps total : 15-20 minutes
   - Anticiper questions fréquentes

3. **Démo live** :
   - Données pré-chargées
   - Scénario : "Voici Maïka, elle a un défi en Rigueur..."
   - Montrer : Tableau individus → Profil → Recommandations RàI
   - Max 2 minutes

---

#### **Jour 9 : Tests utilisateurs (18 nov)**

**Statut** : ⏳ EN ATTENTE

**Faire tester** :
1. Donner le package de démo à 2-3 collègues
2. Observer sans aider (10 minutes max)
3. Poser questions :
   - Qu'avez-vous compris ?
   - Qu'est-ce qui bloque ?
   - Que changeriez-vous ?
4. Ajuster documentation selon feedback

**Répéter la présentation** :
- Devant 1-2 personnes
- Chronométrer (max 20 min)
- Ajuster le rythme

---

#### **Jour 10 : Polissage final (19 nov matin)**

**Statut** : ⏳ EN ATTENTE

**Checklist finale** :
- [ ] Package de démo fonctionne sur Mac et PC
- [ ] Documentation PDF sans fautes
- [ ] Lien de téléchargement GitHub actif
- [ ] Démo live testée (pas de surprise)
- [ ] Slides exportés en PDF
- [ ] Backup des données sur clé USB (au cas où)

**Présentation l'après-midi** 🎤

---

## 🚫 Ce qu'on NE fait PAS avant le 19 novembre

Pour éviter la surcharge et rester focalisés :

❌ **Refactoring complet de l'architecture** (reporté post-19 nov)
❌ **Implémentation de nouvelles pratiques** (Sommative, PAN-Spécifications)
❌ **Système de snapshots** (Beta 91)
❌ **Fonctionnalités avancées** (import/export, API, etc.)
❌ **Optimisations de performance** (cache, indexation)

---

## ✅ Critères de succès

### Pour la présentation :
1. **Application fonctionne** : Zéro bug bloquant
2. **Démo claire** : "Je vois comment ça m'aide" (< 2 min)
3. **Documentation simple** : "Je peux essayer chez moi" (< 30 min)
4. **Inspiration** : "Je veux me lancer dans une PAN"

### Pour la Beta 90.5 :
1. **PAN-Maîtrise impeccable** :
   - Patterns détectés correctement
   - Défis SRPNF sur N artefacts récents
   - Recommandations RàI cohérentes
   - Seuils IDME configurables utilisés

2. **Aucune régression** :
   - Assiduité calcule correctement
   - Profils étudiants s'affichent
   - Tableau des individus fonctionnel
   - Pas d'erreurs console

3. **Utilisable par non-techniciens** :
   - Ouvrir index.html = ça marche
   - Configuration en 10 points max
   - Messages d'erreur compréhensibles

---

## 📋 Feuille de route post-19 novembre

Une fois la présentation passée, retour au plan architectural :

### **Beta 91 : Architecture modulaire (Décembre 2025)**

**Phase 1** : Documentation (✅ COMPLÉTÉ)
- ARCHITECTURE_PRATIQUES.md
- GUIDE_AJOUT_PRATIQUE.md
- FEUILLE_DE_ROUTE_PRATIQUES.md

**Phase 2** : Infrastructure de base (5 jours)
- Créer `/js/pratiques/pratique-interface.js`
- Créer `/js/pratiques/pratique-registry.js`
- Système de détection automatique

**Phase 3** : Extraction PAN-Maîtrise (3 jours)
- Créer `/js/pratiques/pratique-pan-maitrise.js`
- Migrer code actuel vers classe
- Adapter `profil-etudiant.js` pour interface

**Phase 4** : Implémentation Sommative (2 jours)
- Créer `/js/pratiques/pratique-sommative.js`
- Logique de moyenne pondérée
- Tests avec données démo

**Phase 5** : Tests et validation (2 jours)
- Tests de basculement entre pratiques
- Vérification indices A-C-P-R universels
- Cohérence niveaux RàI

**Phase 6** : Documentation utilisateur (1 jour)
- Section Aide mise à jour
- Guide de configuration des pratiques
- Exemples pour collaborateurs

**Phase 7** : Release Beta 91 (0.5 jour)
- Package de distribution
- Notes de version
- Communication communauté

**Total estimé** : 13.5 jours de travail

---

## 🎯 Prochaines étapes immédiates

### **MAINTENANT (9 nov, après-midi)** :
1. Tester les corrections de bugs pattern/défis
2. Valider avec données de Maïka
3. Commit + push si tests passent

### **DEMAIN (10 nov)** :
1. Derniers ajustements bugs si nécessaire
2. Commencer package de démo
3. Créer données réalistes

### **11-12 nov** :
1. Finaliser package de démo
2. Tests utilisateurs préliminaires

---

## 📞 Contacts et ressources

**Auteur** : Grégoire Bédard
**Labo** : Codex Numeris
**Email** : labo@codexnumeris.org
**Événement** : Communauté de pratique PAN - 19 novembre 2025
**Public** : 400 personnes inscrites (enseignants collégiaux)

---

## 💡 Principes directeurs

Pour garder le cap pendant ces 10 jours :

1. **Simple > Complet** : Mieux vaut une fonction qui marche qu'un système complet qui bugge
2. **Clair > Exhaustif** : Une page bien expliquée > 50 pages techniques
3. **Inspirant > Parfait** : Montrer le potentiel > Démontrer la perfection
4. **Utilisable > Théorique** : "Je peux l'essayer maintenant" > "C'est intéressant conceptuellement"

**Citation de Grégoire** :
> "Cette application pourrait être pour eux un incitatif à se lancer dans l'aventure des PAN. Nous sommes en fin de trimestre et personne n'a le temps de faire des expérimentations complexes."

---

**Version** : 1.0
**Créé** : 9 novembre 2025
**Statut** : EN COURS - Jour 1/10
**Prochaine révision** : 12 novembre 2025 (après package démo)
