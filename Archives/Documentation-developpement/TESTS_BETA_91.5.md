# Tests Beta 91.5 - Checklist de vérification

**Date** : 27 novembre 2025
**Version** : Beta 91.5

---

## ✅ Tests critiques (5 minutes)

### 1. Chargement initial
- [ ] Ouvrir `index 91.5.html` dans Safari
- [ ] Ouvrir la console JavaScript (Cmd+Option+C)
- [ ] **Vérifier** : Aucune erreur rouge dans la console
- [ ] **Vérifier** : Les messages suivants apparaissent :
  ```
  ✅ Module pratique-registre.js chargé
  ✅ [SOM] Pratique Sommative enregistrée avec succès
  ✅ [PAN] Pratique PAN-Maîtrise enregistrée avec succès
  ```

**Résultat** : ☐ PASS  ☐ FAIL

---

### 2. Tableau de bord - Barres de distribution
- [ ] Aller dans **Tableau de bord → Aperçu**
- [ ] **Vérifier** : Les 4 barres de distribution sont visibles (A, C, P, E)
- [ ] **Vérifier** : Pas de "NaN%" affiché
- [ ] **Vérifier** : Les points colorés (SOM/PAN) s'affichent si mode comparatif
- [ ] **Vérifier** : Les statistiques en haut sont correctes

**Résultat** : ☐ PASS  ☐ FAIL

**Capture d'écran** : ________________

---

### 3. Sélecteur de grille de référence
- [ ] Aller dans **Réglages → Pratique de notation**
- [ ] Scroller jusqu'à **"Grille de critères pour le dépistage"**
- [ ] **Vérifier** : Le sélecteur affiche vos grilles créées
- [ ] **Vérifier** : Au moins 1 grille est disponible
- [ ] **Action** : Sélectionner une grille
- [ ] **Action** : Cliquer sur "Sauvegarder les modalités"
- [ ] **Vérifier** : Message de confirmation
- [ ] **Vérifier** : La console affiche : `✅ X grille(s) chargée(s) dans le sélecteur de référence`

**Nombre de grilles trouvées** : _______

**Résultat** : ☐ PASS  ☐ FAIL

---

### 4. Profil étudiant - Barres SRPNF
- [ ] Aller dans **Étudiants → Liste**
- [ ] Cliquer sur un étudiant avec des évaluations
- [ ] Aller dans l'onglet **"Développement des habiletés"**
- [ ] **Vérifier** : Les barres SRPNF s'affichent avec pourcentages
- [ ] **OU** : Si pas configuré, le message "Configuration requise" s'affiche
- [ ] **Vérifier** : Pas de "NaN%" affiché

**Si grille configurée** :
- [ ] **Vérifier** : Les 5 barres sont visibles (Structure, Rigueur, Plausibilité, Nuance, Français)
- [ ] **Vérifier** : Les pourcentages sont cohérents (0-100%)
- [ ] **Vérifier** : Les points sur les barres sont positionnés correctement

**Résultat** : ☐ PASS  ☐ FAIL

**Capture d'écran** : ________________

---

### 5. Console JavaScript - Erreurs
- [ ] Console ouverte pendant toute la navigation
- [ ] Naviguer dans toutes les sections principales
- [ ] **Vérifier** : Aucune erreur rouge (SyntaxError, ReferenceError, etc.)
- [ ] **Accepter** : Les warnings jaunes sont acceptables

**Erreurs trouvées** : _______________________

**Résultat** : ☐ PASS  ☐ FAIL

---

## 📋 Tests approfondis (15 minutes)

### 6. Import/Export des données
- [ ] **Réglages → Gestion des données → Exporter les données**
- [ ] **Vérifier** : Fichier JSON téléchargé
- [ ] **Vérifier** : Taille du fichier > 0 Ko
- [ ] **Optionnel** : Importer le fichier dans une nouvelle session
- [ ] **Vérifier** : Données restaurées correctement

**Résultat** : ☐ PASS  ☐ FAIL

---

### 7. Saisie de présences
- [ ] **Présences → Saisie des présences**
- [ ] Sélectionner une date
- [ ] **Action** : Marquer un étudiant présent/absent
- [ ] **Action** : Enregistrer
- [ ] **Vérifier** : Message de confirmation
- [ ] **Vérifier** : Le compteur d'heures est mis à jour

**Résultat** : ☐ PASS  ☐ FAIL

---

### 8. Création d'évaluation
- [ ] **Évaluations → Nouvelle évaluation**
- [ ] Sélectionner un étudiant et une production
- [ ] **Action** : Évaluer avec une grille de critères
- [ ] **Action** : Sélectionner des niveaux IDME
- [ ] **Action** : Sauvegarder
- [ ] **Vérifier** : Message de confirmation
- [ ] **Vérifier** : L'évaluation apparaît dans le profil de l'étudiant

**Résultat** : ☐ PASS  ☐ FAIL

---

### 9. Navigation et liens
- [ ] Naviguer dans toutes les sections principales
- [ ] **Vérifier** : Tous les boutons fonctionnent
- [ ] **Vérifier** : Les liens entre sections fonctionnent
- [ ] **Vérifier** : Le fil d'Ariane est correct
- [ ] **Vérifier** : Les sous-sections s'affichent correctement

**Résultat** : ☐ PASS  ☐ FAIL

---

### 10. Compatibilité navigateurs (optionnel)

#### Safari (macOS)
- [ ] Ouvrir dans Safari
- [ ] Tous les tests critiques (1-5)
- [ ] **Résultat** : ☐ PASS  ☐ FAIL

#### Chrome
- [ ] Ouvrir dans Chrome
- [ ] Tous les tests critiques (1-5)
- [ ] **Résultat** : ☐ PASS  ☐ FAIL

#### Firefox (optionnel)
- [ ] Ouvrir dans Firefox
- [ ] Tous les tests critiques (1-5)
- [ ] **Résultat** : ☐ PASS  ☐ FAIL

---

## 📊 Résumé des tests

**Date d'exécution** : ___________________
**Testeur** : ___________________
**Navigateur principal** : ___________________

### Résultats globaux

| Test | Résultat | Notes |
|------|----------|-------|
| 1. Chargement initial | ☐ PASS ☐ FAIL | |
| 2. Barres de distribution | ☐ PASS ☐ FAIL | |
| 3. Sélecteur de grille | ☐ PASS ☐ FAIL | |
| 4. Barres SRPNF | ☐ PASS ☐ FAIL | |
| 5. Console sans erreurs | ☐ PASS ☐ FAIL | |
| 6. Import/Export | ☐ PASS ☐ FAIL | |
| 7. Saisie présences | ☐ PASS ☐ FAIL | |
| 8. Création évaluation | ☐ PASS ☐ FAIL | |
| 9. Navigation | ☐ PASS ☐ FAIL | |
| 10. Compatibilité | ☐ PASS ☐ FAIL | |

**Score total** : ___ / 10

---

## 🐛 Bugs découverts

| # | Description | Sévérité | Étapes pour reproduire |
|---|-------------|----------|------------------------|
| 1 | | ☐ Critique ☐ Majeur ☐ Mineur | |
| 2 | | ☐ Critique ☐ Majeur ☐ Mineur | |
| 3 | | ☐ Critique ☐ Majeur ☐ Mineur | |

---

## ✅ Validation finale

- [ ] Tous les tests critiques (1-5) sont PASS
- [ ] Aucune erreur JavaScript critique dans la console
- [ ] Les fonctionnalités principales fonctionnent
- [ ] L'application est stable pour distribution

**Validation** : ☐ OUI - Prêt pour distribution  ☐ NON - Corrections nécessaires

**Signature** : ___________________
**Date** : ___________________

---

## 📝 Notes additionnelles

_Espace pour notes, observations, suggestions..._
