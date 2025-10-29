# Guide de test - Monitorage Beta 0.79

Merci de participer aux tests de l'application de monitorage pédagogique ! 🙏

---

## 🚀 Démarrage rapide

### 1. Installation (2 minutes)
1. Décompressez le fichier `Monitorage_Beta_0.79.zip`
2. Ouvrez le fichier `index 78 (bouton soutien).html` dans votre navigateur
   - **Recommandé** : Safari, Chrome ou Edge
   - Astuce : Ajoutez-le à vos favoris pour y accéder rapidement

### 2. Première utilisation (5 minutes)
1. **Importer les données de démonstration** (optionnel mais recommandé) :
   - Allez dans **Réglages → Import/Export**
   - Cliquez sur «📥 Importer les données»
   - Sélectionnez le fichier `donnees-demo.json`
   - Confirmez l'import

2. **Explorer les nouveautés** :
   - **Matériel → Critères d'évaluation** : Nouveau design compact
   - **Matériel → Productions** : Affichage optimisé
   - Cliquez sur «✏️ Éditer» pour tester le mode édition

---

## 🎯 Quoi tester en priorité ?

### ⚠️ PRIORITÉ HAUTE (15 minutes)

#### Test 1 : Grilles de critères
1. Allez dans **Matériel → Critères d'évaluation**
2. Observez la vue d'ensemble des grilles
3. Cliquez sur «✏️ Éditer la grille» sur une grille existante
4. Essayez de modifier un critère (bouton «Modifier»)
5. Ajoutez un nouveau critère
6. Cliquez sur «← Retour à la vue d'ensemble»
7. Vérifiez que vos modifications sont sauvegardées

**Questions à vous poser** :
- Le format compact facilite-t-il la vue d'ensemble ?
- Les descriptions repliables sont-elles pratiques ?
- La navigation vue/édition est-elle claire ?

#### Test 2 : Productions
1. Allez dans **Matériel → Productions**
2. Créez une nouvelle production (examen, travail, etc.)
3. Observez l'affichage compact
4. Testez les boutons ↑ ↓ pour réorganiser
5. Modifiez une production existante

**Questions à vous poser** :
- Les codes couleur aident-ils à distinguer les types ?
- Les informations essentielles sont-elles visibles d'un coup d'œil ?
- Les icônes (📌 ✏️ 📦) sont-elles utiles ?

### 📊 PRIORITÉ MOYENNE (10 minutes)

#### Test 3 : Workflow complet
1. Créez une grille de critères complète (5 critères)
2. Créez 3 productions liées à cette grille
3. Naviguez entre les sections
4. Vérifiez que tout se sauvegarde correctement

#### Test 4 : Affichage
- Testez sur différentes tailles de fenêtre
- Vérifiez la lisibilité des textes
- Observez le comportement du scroll

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

## 🔍 Points de vigilance spécifiques à Beta 0.79

### Nouveautés à valider
- [ ] Le format compact des critères est-il trop dense ?
- [ ] Les descriptions repliables : utiles ou frustrantes ?
- [ ] Le bouton «← Retour à la vue d'ensemble» est-il bien placé ?
- [ ] Les codes couleur des productions sont-ils cohérents ?
- [ ] Les métadonnées inline (Type • 25% • Grille) sont-elles lisibles ?

### Problèmes potentiels à surveiller
- [ ] Boutons trop petits (difficiles à cliquer) ?
- [ ] Textes trop compacts (difficiles à lire) ?
- [ ] Navigation confuse entre vue et édition ?
- [ ] Informations manquantes dans le format compact ?
- [ ] Problèmes de sauvegarde après édition ?

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

**Version du package** : Beta 0.79
**Date de publication** : 29 octobre 2025
**Statut** : Phase de tests - Retours attendus
