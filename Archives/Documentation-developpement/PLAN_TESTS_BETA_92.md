# Plan de tests systématique - Beta 92

**Date de création** : 30 novembre 2025
**Version testée** : Beta 92 (Monitorage v6)
**Contexte** : Validation des modifications suivantes :
- Import/export individuel avec métadonnées Creative Commons
- Renommage sections navigation (Matériel)
- Réorganisation modal Primo
- Visibilité contextuelle des boutons

---

## 1️⃣ Test du Modal Primo et Navigation

### Préparation
**Ouvrir l'application en mode Assisté** (si première utilisation, sinon cliquer sur le bouton 😎) :

```bash
open "/Users/kuekatsheu/Documents/GitHub/Monitorage_v6/index 92.html"
```

### Vérifications Modal Primo

- [ ] Modal Primo s'affiche avec emoji à gauche, texte à droite
- [ ] Les 6 boutons sont dans le bon ordre :
  1. MODULE 1 : Créer un groupe-cours
  2. MODULE 2 : Évaluer une production
  3. MODULE 3 : Explorer les diagnostics (désactivé)
  4. MODULE 4 : Créer ma pratique de notation
  5. **Consulter l'aide**
  6. **Retour à la navigation libre**
- [ ] Cliquer sur **"Consulter l'aide"** → doit naviguer vers section Aide
- [ ] Cliquer sur **"Retour à la navigation libre"** → doit fermer le modal
- [ ] Rouvrir le modal (bouton 😎) → doit fonctionner à nouveau

**Résultat** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

## 2️⃣ Test Navigation Renommée

### Vérifications Sous-sections Matériel

**Aller dans Matériel** et vérifier les sous-sections :

- [ ] "Productions étudiantes" (pas "Productions")
- [ ] "Grilles de critères" (inchangé)
- [ ] "Échelles de performance" (pluriel)
- [ ] "Cartouches de rétroaction" (pas "Rétroactions")
- [ ] "Ensembles d'objectifs" (pluriel avec 's')

### Vérifications Titres Pages

**Vérifier que les titres `<h2>` correspondent au nom de navigation** :

- [ ] Cliquer sur "Productions étudiantes" → titre = "Productions étudiantes"
- [ ] Cliquer sur "Grilles de critères" → titre = "Grilles de critères"
- [ ] Cliquer sur "Échelles de performance" → titre = "Échelles de performance"
- [ ] Cliquer sur "Cartouches de rétroaction" → titre = "Cartouches de rétroaction"
- [ ] Cliquer sur "Ensembles d'objectifs" → titre = "Ensembles d'objectifs"

**Résultat** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

## 3️⃣ Test Import/Export Individuel avec CC

### A. Test Productions

#### Étape 1 : Créer une production de test

1. [ ] Aller dans Matériel → Productions étudiantes
2. [ ] Créer une nouvelle production (ex: "Test Export CC")
3. [ ] Remplir les champs (nom, description, type)
4. [ ] Sauvegarder

#### Étape 2 : Exporter cette production

1. [ ] Charger la production pour modification (cliquer sur l'item dans la sidebar)
2. [ ] Cliquer sur **"Exporter cette production"** (bouton du bas)
3. [ ] Remplir les métadonnées CC dans le modal :
   - Auteur original
   - Discipline(s)
   - Niveau d'enseignement
   - Description
4. [ ] Télécharger le fichier JSON
5. [ ] **Vérifier** : Ouvrir le JSON dans un éditeur de texte
   - [ ] Doit contenir `"metadata": { "licence": "CC BY-NC-SA 4.0", ... }`
   - [ ] Doit contenir `"contenu": { ... }`
   - [ ] Nom du fichier commence par "production-" et finit par ".json"

#### Étape 3 : Importer dans une autre production

1. [ ] Créer une nouvelle production vide (ex: "Test Import CC")
2. [ ] Sauvegarder
3. [ ] Charger cette production pour modification
4. [ ] Cliquer sur **"Importer dans cette production"** (bouton du bas)
5. [ ] Sélectionner le fichier JSON exporté précédemment
6. [ ] **Vérifier** : Message de confirmation affiche le badge CC avec :
   - Licence CC BY-NC-SA 4.0
   - Nom de l'auteur original
   - Date de création
7. [ ] Accepter l'import (cliquer "OK")
8. [ ] **Vérifier** : Les données sont bien remplacées (nom, description, etc.)
9. [ ] **Vérifier** : L'ID de la production est préservé (ne change pas)

**Résultat Productions** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

### B. Test Grilles

#### Étape 1 : Créer une grille de test

1. [ ] Aller dans Matériel → Grilles de critères
2. [ ] Créer une nouvelle grille (ex: "Test Grille CC")
3. [ ] Ajouter au moins 2 critères avec pondérations
4. [ ] Sauvegarder

#### Étape 2 : Exporter cette grille

1. [ ] Charger la grille pour modification
2. [ ] Cliquer sur **"Exporter cette grille"** (bouton du bas)
3. [ ] Remplir les métadonnées CC
4. [ ] Télécharger le fichier JSON
5. [ ] **Vérifier** : Ouvrir le JSON et confirmer présence métadonnées CC

#### Étape 3 : Importer dans une autre grille

1. [ ] Créer une nouvelle grille vide (ex: "Test Import Grille CC")
2. [ ] Sauvegarder
3. [ ] Charger cette grille pour modification
4. [ ] Cliquer sur **"Importer dans cette grille"** (bouton du bas)
5. [ ] Sélectionner le fichier JSON exporté
6. [ ] **Vérifier** : Message de confirmation avec badge CC
7. [ ] Accepter l'import
8. [ ] **Vérifier** : Les critères sont bien remplacés
9. [ ] **Vérifier** : L'ID de la grille est préservé

**Résultat Grilles** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

### C. Test Échelles

#### Étape 1 : Créer une échelle de test

1. [ ] Aller dans Matériel → Échelles de performance
2. [ ] Créer une nouvelle échelle (ex: "Test Échelle CC")
3. [ ] Ajouter au moins 3 niveaux
4. [ ] Sauvegarder

#### Étape 2 : Exporter cette échelle

1. [ ] Charger l'échelle pour modification
2. [ ] Cliquer sur **"Exporter cette échelle"** (bouton du bas)
3. [ ] Remplir les métadonnées CC
4. [ ] Télécharger le fichier JSON
5. [ ] **Vérifier** : Ouvrir le JSON et confirmer présence métadonnées CC

#### Étape 3 : Importer dans une autre échelle

1. [ ] Créer une nouvelle échelle vide (ex: "Test Import Échelle CC")
2. [ ] Sauvegarder
3. [ ] Charger cette échelle pour modification
4. [ ] Cliquer sur **"Importer dans cette échelle"** (bouton du bas)
5. [ ] Sélectionner le fichier JSON exporté
6. [ ] **Vérifier** : Message de confirmation avec badge CC
7. [ ] Accepter l'import
8. [ ] **Vérifier** : Les niveaux sont bien remplacés
9. [ ] **Vérifier** : L'ID de l'échelle est préservé

**Résultat Échelles** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

### D. Test Cartouches

#### Étape 1 : Créer une cartouche de test

1. [ ] Aller dans Matériel → Cartouches de rétroaction
2. [ ] Créer une nouvelle cartouche (ex: "Test Cartouche CC")
3. [ ] Ajouter au moins quelques commentaires
4. [ ] Sauvegarder

#### Étape 2 : Exporter cette cartouche

1. [ ] Charger la cartouche pour modification
2. [ ] Cliquer sur **"Exporter cette cartouche"** (bouton du bas)
3. [ ] Remplir les métadonnées CC
4. [ ] Télécharger le fichier JSON
5. [ ] **Vérifier** : Ouvrir le JSON et confirmer présence métadonnées CC

#### Étape 3 : Importer dans une autre cartouche

1. [ ] Créer une nouvelle cartouche vide (ex: "Test Import Cartouche CC")
2. [ ] Sauvegarder
3. [ ] Charger cette cartouche pour modification
4. [ ] Cliquer sur **"Importer dans cette cartouche"** (bouton du bas)
5. [ ] Sélectionner le fichier JSON exporté
6. [ ] **Vérifier** : Message de confirmation avec badge CC
7. [ ] Accepter l'import
8. [ ] **Vérifier** : Les commentaires sont bien remplacés
9. [ ] **Vérifier** : L'ID de la cartouche est préservé

**Résultat Cartouches** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

## 4️⃣ Test Visibilité des Boutons

### Vérifications Contextuelles

**Objectif** : Vérifier que les boutons d'import/export individuel apparaissent/disparaissent correctement selon le contexte.

### A. Productions

**Mode création (nouveau formulaire)** :
1. [ ] Cliquer sur "Nouvelle production"
2. [ ] **Vérifier** : Aucun bouton visible en bas (pas Exporter, Importer, Dupliquer, Supprimer)
3. [ ] Seulement les boutons "Annuler" et "Sauvegarder" doivent être visibles

**Mode modification (production existante chargée)** :
1. [ ] Cliquer sur une production existante dans la sidebar
2. [ ] **Vérifier** : 4 boutons visibles en bas :
   - [ ] "Exporter cette production"
   - [ ] "Importer dans cette production"
   - [ ] "Dupliquer cette production"
   - [ ] "Supprimer cette production"

**Résultat Productions** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

### B. Grilles

**Mode création** :
1. [ ] Cliquer sur "Nouvelle grille"
2. [ ] **Vérifier** : Aucun bouton en bas (seulement Annuler/Sauvegarder)

**Mode modification** :
1. [ ] Cliquer sur une grille existante
2. [ ] **Vérifier** : 4 boutons visibles (Exporter, Importer, Dupliquer, Supprimer)

**Résultat Grilles** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

### C. Échelles

**Mode création** :
1. [ ] Cliquer sur "Nouvelle échelle"
2. [ ] **Vérifier** : Aucun bouton en bas

**Mode modification** :
1. [ ] Cliquer sur une échelle existante
2. [ ] **Vérifier** : 4 boutons visibles (Exporter, Importer, Dupliquer, Supprimer)

**Résultat Échelles** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

### D. Cartouches

**Mode création** :
1. [ ] Cliquer sur "Nouvelle cartouche"
2. [ ] **Vérifier** : Boutons en bas masqués

**Mode modification** :
1. [ ] Cliquer sur une cartouche existante
2. [ ] **Vérifier** : Boutons en bas visibles (Exporter, Importer, Dupliquer, Supprimer)

**Résultat Cartouches** : ✅ Réussi / ❌ Échec
**Notes** : _________________________________________________

---

## ✅ Checklist Résumée Finale

```
☐ Modal Primo
  ☐ Affichage correct (emoji gauche, texte droite)
  ☐ Bouton "Consulter l'aide" fonctionne
  ☐ Bouton "Retour" ferme le modal
  ☐ Ordre boutons correct (Aide avant Retour)

☐ Navigation
  ☐ "Productions étudiantes" (renommé)
  ☐ "Échelles de performance" (pluriel)
  ☐ "Cartouches de rétroaction" (renommé)
  ☐ "Ensembles d'objectifs" (pluriel avec s)
  ☐ Titres h2 correspondent aux noms navigation

☐ Import/Export CC
  ☐ Export production avec métadonnées CC
  ☐ Import production avec lecture métadonnées CC
  ☐ Export grille avec métadonnées CC
  ☐ Import grille avec lecture métadonnées CC
  ☐ Export échelle avec métadonnées CC
  ☐ Import échelle avec lecture métadonnées CC
  ☐ Export cartouche avec métadonnées CC
  ☐ Import cartouche avec lecture métadonnées CC

☐ Boutons contextuels
  ☐ Mode création : boutons cachés
  ☐ Mode modification : boutons visibles (×4)
  ☐ Tous les modules (Productions, Grilles, Échelles, Cartouches)
```

---

## 📝 Résumé des Résultats

| Test | Statut | Notes |
|------|--------|-------|
| 1️⃣ Modal Primo | ⬜ | |
| 2️⃣ Navigation | ⬜ | |
| 3️⃣ A. Productions | ⬜ | |
| 3️⃣ B. Grilles | ⬜ | |
| 3️⃣ C. Échelles | ⬜ | |
| 3️⃣ D. Cartouches | ⬜ | |
| 4️⃣ A. Productions | ⬜ | |
| 4️⃣ B. Grilles | ⬜ | |
| 4️⃣ C. Échelles | ⬜ | |
| 4️⃣ D. Cartouches | ⬜ | |

**Légende** : ⬜ Non testé | ✅ Réussi | ❌ Échec | ⚠️ Problème mineur

---

## 🐛 Bugs Identifiés

_Lister ici tout bug découvert pendant les tests avec description détaillée et étapes pour reproduire._

1.
2.
3.

---

## 💡 Conseil de Test

**Stratégie recommandée** :
1. Commencer par les tests 1️⃣ et 2️⃣ (rapides, ~5 minutes)
2. Faire un test complet 3️⃣ sur **UN seul module** (ex: Productions)
3. Si ça fonctionne, tester rapidement les 3 autres modules (même pattern de code)
4. Finir par le test 4️⃣ (visibilité boutons)

**Temps estimé total** : 30-45 minutes

---

## 📚 Fichiers Modifiés (référence)

**JavaScript** :
- `/js/productions.js` : fonction `importerDansProductionActive()`
- `/js/grilles.js` : fonction `importerDansGrilleActive()`
- `/js/echelles.js` : fonction `importerDansEchelleActive()`
- `/js/cartouches.js` : fonction `importerDansCartoucheActive()`
- `/js/config.js` : labels navigation matériel
- `/js/primo-accueil.js` : ordre boutons modal, fonction `consulterAide()`

**HTML** :
- `/index 92.html` : titres sections matériel, bouton Aide retiré de navigation

---

**Date de test** : ___________________
**Testeur** : _______________________
**Résultat global** : ✅ Réussi / ⚠️ Problèmes mineurs / ❌ Échec critique
