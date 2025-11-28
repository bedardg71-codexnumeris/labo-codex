# Plan de travail - 28 novembre 2025

## Contexte de la session d'aujourd'hui (27 novembre)

### ✅ Réalisations complétées

1. **Amélioration wizard création de pratique**
   - ✅ Fix affichage échelle à l'étape 2 (plages et valeurs de calcul visibles)
   - ✅ Simplification intro (de ~150 mots à ~40 mots)
   - Commit: `2a5db40`

2. **Création package matériel de démarrage**
   - ✅ Fichier `materiel-demarrage.json` créé
   - ✅ Contenu : Échelle IDME (5 niveaux) + Grille SRPNF (5 critères) + 20 cartouches de rétroaction
   - ✅ Métadonnées CC BY-NC-SA 4.0
   - Commit: `99e9470`

3. **Intégration import automatique dans Primo**
   - ✅ Fonction `importerMaterielDemarrage()` créée
   - ✅ Logs détaillés pour débogage
   - ✅ Notifications utilisateur (succès/erreur)
   - ✅ Correction appels async (bug critique résolu)
   - Commits: `99e9470`, `0cdd07b`, `ed88700`

### ❌ Problème en suspens

**Import du matériel ne se déclenche pas lors de la configuration Primo**

**Symptômes observés** :
- Pas de log `[Primo] 🚀 Début import matériel de démarrage...` dans la console
- Pas de log `[Primo] Configuration terminée !`
- Deux notifications rapides (verte puis rouge) qui disparaissent trop vite pour être lues
- Erreur mentionnée : `ReferenceError: Can't find variable: cartouches` (origine exacte non identifiée)

**Corrections déjà appliquées** :
- `terminerConfiguration()` rendue async
- `afficherQuestionActuelle()` rendue async avec `await`
- Bouton HTML avec `.catch()` pour gérer erreurs

**À vérifier demain** :
- Tester si les corrections async fonctionnent maintenant
- Si ça ne marche toujours pas, investiguer l'origine de l'erreur `cartouches`

---

## 🎯 Plan de travail pour demain (28 novembre)

### Phase 1 : Validation import matériel de démarrage (priorité haute)

#### Étape 1.1 : Test de l'import avec corrections async
```bash
# Dans la console JavaScript
localStorage.clear()
indexedDB.deleteDatabase('MonitorageDB')
location.reload()
```

**Résultat attendu** :
- Primo s'affiche
- Compléter toutes les questions
- Console devrait montrer :
  ```
  [Primo] Configuration terminée !
  [Primo] 🚀 Début import matériel de démarrage...
  [Primo] 🔍 Vérification matériel existant: {echelles: 0, grilles: 0}
  [Primo] 📥 Chargement de materiel-demarrage.json...
  [Primo] 📦 Fichier chargé: Matériel pédagogique de démarrage
  [Primo] ✅ 1 échelle(s) importée(s)
  [Primo] ✅ 1 grille(s) importée(s)
  [Primo] ✅ Cartouche importée pour grille grille-srpnf-defaut
  [Primo] 🎉 Matériel pédagogique importé: 3 ressources
  ```
- Notification verte : "Matériel pédagogique installé - 3 ressources importées"

**Si ça marche** :
- ✅ Vérifier dans Réglages → Matériel pédagogique que tout est là
- ✅ Tester création d'une évaluation avec le matériel importé
- ✅ Passer à la Phase 2

**Si ça ne marche toujours pas** :
- Aller à l'Étape 1.2

#### Étape 1.2 : Investigation erreur `cartouches` (si nécessaire)

1. **Identifier la source exacte de l'erreur**
   - Regarder la console Safari → l'erreur devrait indiquer le fichier et la ligne
   - Format : `cartouches.js:123` ou `evaluation.js:456`

2. **Vérifier les endroits suspects**
   ```bash
   # Chercher utilisations de cartouches sans déclaration
   grep -n "^\s*cartouches\." js/*.js
   grep -n "^\s*cartouches\[" js/*.js
   ```

3. **Vérifier si db.getSync retourne null au lieu de []**
   - Dans la console pendant l'erreur :
   ```javascript
   db.getSync('cartouches_grille-srpnf-defaut', [])
   ```

4. **Solution probable** :
   - Ajouter vérification dans le code qui plante :
   ```javascript
   const cartouches = db.getSync(`cartouches_${grilleId}`, []) || [];
   ```

#### Étape 1.3 : Alternative - Import manuel du matériel

Si l'import automatique pose trop de problèmes, proposer à l'utilisateur :

**Option A** : Bouton manuel dans Primo
- Ajouter un bouton "Importer le matériel de démarrage" dans l'interface Primo
- L'utilisateur clique pour importer explicitement

**Option B** : Section Réglages
- Ajouter dans Réglages → Matériel pédagogique un bouton :
  "📦 Installer le matériel de démarrage (IDME + SRPNF)"

---

### Phase 2 : Validation flux complet Primo (priorité moyenne)

Une fois l'import matériel résolu, tester le flux complet :

#### Test 2.1 : Vérifier auto-population des formulaires
- [ ] Cadre du trimestre (dates, session, année)
- [ ] Configuration de l'horaire (séances avec jour, heure début, durée)
- [ ] Informations du cours (titre, enseignant, groupe)

#### Test 2.2 : Vérifier matériel importé
- [ ] Échelle IDME visible dans Réglages → Matériel → Échelles
- [ ] Grille SRPNF visible dans Réglages → Matériel → Grilles
- [ ] Cartouches SRPNF visibles dans Réglages → Matériel → Cartouches

#### Test 2.3 : Créer une première évaluation
- [ ] Créer une production test
- [ ] Lier à la grille SRPNF
- [ ] Vérifier que l'échelle IDME est disponible
- [ ] Créer une évaluation pour un étudiant test
- [ ] Vérifier que les cartouches apparaissent dans le formulaire

---

### Phase 3 : Améliorations UX Primo (priorité basse)

Si tout fonctionne bien, petites améliorations :

#### 3.1 : Notification plus claire sur l'import
- Notification actuelle : "Matériel pédagogique installé - 3 ressources importées"
- Amélioration possible : Détailler ce qui a été importé
  ```
  ✅ Matériel de démarrage installé
  • 1 échelle IDME (5 niveaux)
  • 1 grille SRPNF (5 critères)
  • 20 cartouches de rétroaction
  ```

#### 3.2 : Message si import échoue
- Message actuel : "Import partiel - Le matériel de base n'a pas pu être importé..."
- Amélioration : Proposer action de récupération
  ```
  ⚠️ Import du matériel échoué
  Vous pourrez l'ajouter manuellement dans :
  Réglages → Matériel pédagogique → Importer
  ```

#### 3.3 : Ralentir les notifications
- Actuellement elles disparaissent trop vite (1.5s)
- Proposition : 3-4 secondes pour les messages importants

---

## 📁 État des fichiers modifiés aujourd'hui

```
materiel-demarrage.json          ← NOUVEAU fichier (244 lignes)
js/primo-modal.js                 ← Modifié (fonction import + corrections async)
js/pratiques.js                   ← Modifié (affichage échelle étape 2)
index 92.html                     ← Modifié (simplification intro wizard)
```

## 🔧 Commits créés aujourd'hui

1. `2a5db40` - Beta 92: Amélioration wizard de création de pratique
2. `99e9470` - Beta 92: Import automatique du matériel pédagogique de démarrage
3. `0cdd07b` - Beta 92: Ajout logs débogage import matériel de démarrage
4. `ed88700` - Beta 92: Correction appels async terminerConfiguration

## 📊 Statistiques session

- **Durée** : Journée complète
- **Commits** : 4
- **Fichiers créés** : 1 (materiel-demarrage.json)
- **Fichiers modifiés** : 3
- **Lignes ajoutées** : ~300
- **Bugs résolus** : 2 (affichage échelle étape 2, appels async)
- **Bugs en suspens** : 1 (import matériel ne se déclenche pas)

## 💡 Notes importantes

1. **Ne pas oublier** : L'utilisateur a un backup complet d'hier qu'il peut utiliser pour tester
2. **Erreur mystérieuse** : `ReferenceError: Can't find variable: cartouches` - source exacte non identifiée
3. **Notifications rapides** : Deux notifications (verte + rouge) disparaissent trop vite
4. **Async/await** : Corrections appliquées mais pas encore testées

## 🎯 Objectif principal demain

**Faire fonctionner l'import automatique du matériel de démarrage dans Primo**

Si après 30 minutes d'investigation ça ne fonctionne toujours pas, passer à l'approche alternative (bouton manuel).

---

Bonne nuit ! 🌙
