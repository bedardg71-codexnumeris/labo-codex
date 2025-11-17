# Guide de test - Monitorage Beta 90.5

Merci de participer aux tests de l'application de monitorage pédagogique ! 🙏

**Nouveautés Beta 90.5** : Architecture modulaire, système de jetons, visualisations avancées (nuages de points), engagement vs risque

---

## 🚀 Démarrage rapide

### 1. Installation (2 minutes)
1. Décompressez le fichier `Monitorage_Beta_90.5.zip`
2. Ouvrez le fichier `index 90 (architecture).html` dans votre navigateur
   - **Recommandé** : Safari, Chrome ou Edge
   - Astuce : Ajoutez-le à vos favoris pour y accéder rapidement

### 2. Première utilisation (5 minutes)
1. **Importer les données de démonstration** (optionnel mais recommandé) :
   - Allez dans **Réglages → Import/Export**
   - Cliquez sur «📥 Importer les données»
   - Sélectionnez le fichier `donnees-demo.json`
   - Confirmez l'import

2. **Explorer les nouveautés** :
   - **Tableau de bord → Aperçu** : Nuages de points avec gradients lumineux
   - **Réglages → Pratique de notation** : Système de jetons personnalisés
   - **Profil étudiant** : Affichage dual Sommative/PAN-Maîtrise
   - Survolez les points dans les barres (animation et grossissement)

---

## 🎯 Quoi tester en priorité ?

### ⚠️ PRIORITÉ HAUTE (15 minutes)

#### Test 1 : Visualisations nuages de points
1. Allez dans **Tableau de bord → Aperçu**
2. Observez les barres de distribution des indices (A-C-P-E)
3. Survolez les points individuels (animation hover)
4. Observez les gradients de couleur (rouge → jaune → vert pour Patterns)
5. Activez le mode comparatif (Réglages → Pratique de notation)
6. Comparez les points oranges (Sommative) vs bleus (PAN-Maîtrise)

**Questions à vous poser** :
- Les nuages de points facilitent-ils la visualisation de la densité ?
- L'animation au hover est-elle utile ou distrayante ?
- Les gradients de couleur sont-ils intuitifs ?

#### Test 2 : Système de jetons
1. Allez dans **Réglages → Pratique de notation**
2. Configurez les jetons (délai, reprise, aide, bonus)
3. Ouvrez un **profil étudiant**
4. Section Accompagnement : Attribuer un jeton
5. Retournez aux évaluations : vérifiez le badge jeton

**Questions à vous poser** :
- La configuration des jetons est-elle claire ?
- L'attribution dans le profil est-elle intuitive ?
- Les badges sont-ils visibles et distincts ?

### 📊 PRIORITÉ MOYENNE (10 minutes)

#### Test 3 : Engagement vs Risque
1. Notez que "Risque d'échec" est maintenant "Engagement"
2. Observez les barres vertes (engagement faible nécessite intervention)
3. Dans un profil, section "Engagement dans l'apprentissage"
4. Comparez avec l'ancienne formulation (si connue)

**Questions à vous poser** :
- La reformulation positive est-elle plus claire ?
- L'interprétation est-elle intuitive ?

#### Test 4 : RàI optionnel
1. Allez dans **Réglages → Pratique de notation**
2. Décochez "Activer RàI et détection des patterns"
3. Retournez au tableau de bord : colonnes Pattern/RàI disparues ?
4. Réactivez pour retrouver ces fonctionnalités

**Questions à vous poser** :
- L'option est-elle clairement expliquée ?
- Le masquage fonctionne-t-il partout ?

---

## 📝 Comment rapporter vos observations ?

### Format suggéré pour vos retours

**1. Points positifs** ✅
- Qu'est-ce qui fonctionne bien ?
- Qu'est-ce qui améliore vraiment votre expérience ?

**2. Points à améliorer** ⚠️
- Qu'est-ce qui est confus ou difficile ?
- Qu'est-ce qui manque ?

**3. Bugs rencontrés** 🐛
Pour chaque bug :
- **Quoi** : Que s'est-il passé ?
- **Quand** : Dans quelle section / après quelle action ?
- **Attendu** : Que devrait-il se passer normalement ?
- **Navigateur** : Safari / Chrome / Firefox / Edge ?

**4. Suggestions** 💡
- Quelles améliorations proposez-vous ?
- Quelles autres sections pourraient bénéficier d'optimisations ?

---

## 🔍 Points de vigilance spécifiques à Beta 90.5

### Nouveautés à valider
- [ ] Les nuages de points sont-ils plus clairs que les barres empilées ?
- [ ] L'animation au hover est-elle utile ou distrayante ?
- [ ] Les gradients de couleur sont-ils intuitifs ?
- [ ] Le concept "Engagement" est-il plus clair que "Risque" ?
- [ ] Le système de jetons est-il facile à configurer et utiliser ?
- [ ] Le mode comparatif (orange vs bleu) aide-t-il à comparer SOM/PAN ?

### Problèmes potentiels à surveiller
- [ ] Points trop petits ou difficiles à cliquer ?
- [ ] Animations trop lentes ou saccadées ?
- [ ] Gradients peu lisibles ou confus ?
- [ ] Terminologie "Engagement" mal interprétée ?
- [ ] Jetons non sauvegardés ou perdus ?
- [ ] Données corrompues après activation/désactivation RàI ?

---

## 💾 Sauvegarder vos données

**Important** : L'application fonctionne en mode local (localStorage)

### Export de vos données (recommandé)
1. Allez dans **Réglages → Import/Export**
2. Cliquez sur «📤 Exporter les données»
3. Sauvegardez le fichier JSON sur votre ordinateur
4. Conservez-le comme backup

### En cas de problème
- Rechargez la page (F5 ou Cmd+R)
- Si les données sont corrompues : réimportez votre dernier export
- En dernier recours : réimportez `donnees-demo.json`

---

## 🆘 Besoin d'aide ?

### Documentation complète
- `README_PROJET.md` - Vue d'ensemble du projet
- Section **Aide** dans l'application (dans le menu de navigation)

### Support
- Email : [Votre email de contact]
- GitHub : https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues

---

## 📅 Calendrier de test

**Durée suggérée** : 1-2 semaines d'utilisation

**Phase 1** (Jours 1-3) : Tests initiaux
- Familiarisation avec les nouveautés
- Tests des fonctionnalités principales
- Rapport des bugs critiques

**Phase 2** (Jours 4-10) : Utilisation quotidienne
- Intégration dans votre workflow réel
- Observations sur l'ergonomie
- Suggestions d'amélioration

**Phase 3** (Jours 11-14) : Retour final
- Synthèse de votre expérience
- Retours consolidés
- Propositions pour la version 1.0

---

## ✨ Ce qui arrive ensuite

Vos retours permettront de :
1. Corriger les bugs identifiés
2. Ajuster l'interface selon vos besoins réels
3. Prioriser les fonctionnalités manquantes
4. Préparer la version 1.0 stable

**Merci de votre contribution précieuse !** 🎉

---

**Version du package** : Beta 90.5
**Date de publication** : 16 novembre 2025
**Statut** : Phase de tests - Retours attendus avant présentation du 19 novembre
