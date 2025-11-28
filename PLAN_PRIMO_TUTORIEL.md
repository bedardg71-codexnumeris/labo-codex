# 📋 PLAN DE TRAVAIL - TUTORIEL PRIMO BETA 92

**Date** : 29 novembre 2025
**Objectif** : Créer un parcours tutoriel complet en 3 phases progressives pour guider les nouveaux utilisateurs.

---

## 🎯 VUE D'ENSEMBLE

### Philosophie du tutoriel
- **Progressif** : Du simple au complexe
- **Interactif** : L'utilisateur manipule l'interface réelle
- **Guidé** : Primo indique exactement quoi faire
- **Exploratoire** : Phase finale encourage la découverte

### Structure en 3 phases
1. **Phase 1** : Configuration de base (échelles, grilles, cours, étudiants, productions)
2. **Phase intermédiaire** : Polish CSS & UX de l'interface Primo
3. **Phase 2** : Chargement données + exploration diagnostics pédagogiques

---

## ⏰ PHASE 1 : Configuration de base (2-3h)

### Objectif
Primo guide l'utilisateur à configurer son cours **sans les cartouches** (problème d'import à résoudre plus tard).

### Étapes du tutoriel

#### 1. ✅ Importation échelle IDME (déjà fonctionnel)
- **Action** : Matériel → Échelles de performance → Nouvelle échelle → Options d'import/export → Importer une échelle
- **Fichier** : `test-echelle-idme.json`
- **Validation** : Échelle apparaît dans la liste

#### 2. ✅ Importation grille SRPNF (déjà fonctionnel)
- **Action** : Matériel → Grilles de critères → Nouvelle grille → Options d'import/export → Importer des grilles
- **Fichier** : `test-grille-srpnf.json`
- **Validation** : Grille apparaît dans la liste

#### 3. ⚙️ Configuration du cours (à valider)
- **Action** : Réglages → Cours
- **Données** :
  - Titre : "Écriture et littérature"
  - Sigle : "601-101-MQ"
  - Session : "Automne 2025"
  - Pondération : "2-2-3"
- **Validation** : Infos affichées dans en-tête

#### 4. ⚙️ Configuration du trimestre (à valider)
- **Action** : Réglages → Trimestre
- **Données** :
  - Date début : 2025-08-18
  - Date fin : 2025-12-13
  - Générer calendrier
- **Validation** : Calendrier visible avec ~15 semaines

#### 5. ⚙️ Importation liste étudiants (à valider)
- **Action** : Groupe → Importer liste
- **Méthode** : Copier-coller CSV
- **Fichier** : `etudiants-demo.csv` (déjà existe)
- **Validation** : 30 étudiants dans la liste

#### 6. ⚙️ Création d'une production (à valider)
- **Action** : Matériel → Productions → Nouvelle production
- **Données** :
  - Type : Artefact portfolio
  - Nom : "Analyse littéraire 1"
  - Grille : Grille Test
  - Échelle : Échelle IDME Test
  - Pondération : 20%
- **Validation** : Production dans la liste

### Tâches techniques

**Vérifications** :
- [ ] Lire `primo-questions.js` : étapes 1-6 complètes ?
- [ ] Vérifier que chaque étape a :
  - Texte d'instruction clair
  - Champs cibles identifiés
  - Validation de complétion
- [ ] Retirer temporairement les étapes cartouches
- [ ] Tester le flux complet sans interruption

**Corrections** :
- [ ] Bugs de navigation entre étapes
- [ ] Messages d'erreur si données invalides
- [ ] Boutons "Précédent/Suivant" toujours fonctionnels

**Tests de bout en bout** :
- [ ] Nouvel utilisateur peut compléter Phase 1 en 15-20 min
- [ ] Aucune étape ne bloque
- [ ] Message de félicitations à la fin

### Livrable
Tutoriel Phase 1 fonctionnel permettant la configuration complète d'un cours (sans cartouches).

---

## 🎨 PHASE INTERMÉDIAIRE : Polish CSS & UX (1-2h)

### Objectif
Améliorer l'apparence et l'ergonomie de l'interface Primo pour une expérience professionnelle et agréable.

### Améliorations visuelles

#### Section Pratique de notation (`pratiques.js`)
- [ ] Espacements harmonieux entre les cartes
- [ ] Cartes bien alignées (grilles CSS)
- [ ] Boutons cohérents (taille, couleur, hover)
- [ ] Labels clairs et lisibles

#### Modal Primo (`primo-modal.js`)
- [ ] Largeur optimale (max-width: 800px ?)
- [ ] Padding confortable (30px)
- [ ] Transitions smooth lors changement d'étape
- [ ] Boutons bien espacés en bas

#### Instructions tutoriel
- [ ] Typographie claire :
  - Taille de police optimale (16px base)
  - Line-height confortable (1.6)
  - Hiérarchie visuelle (h3, paragraphes, listes)
- [ ] Code blocks bien formatés :
  - Fond gris clair
  - Police monospace
  - Padding interne
- [ ] Listes numérotées :
  - Numéros en couleur (bleu)
  - Espacement entre items
  - Indentation claire

#### Indicateurs de progression
- [ ] Barre de progression visible en haut
  - Pourcentage ou "Étape X/Y"
  - Remplie en bleu
  - Animation lors changement
- [ ] Étapes complétées en vert
- [ ] Étape actuelle mise en évidence (badge bleu)

### Tâches techniques

**Audit** :
- [ ] Lire CSS actuel de Primo dans `primo-modal.js`
- [ ] Identifier incohérences visuelles
- [ ] Noter éléments qui manquent de polish

**Implémentation** :
- [ ] Créer variables CSS dédiées si nécessaire :
  ```css
  --primo-modal-width: 800px;
  --primo-padding: 30px;
  --primo-spacing: 20px;
  --primo-color-primary: var(--bleu-leger);
  --primo-color-success: var(--vert-success);
  ```
- [ ] Uniformiser les espacements avec tokens (--spacing-sm/md/lg)
- [ ] Appliquer les styles aux éléments du modal
- [ ] Tester dans Safari et Chrome

**Tests responsive** :
- [ ] Desktop (1920×1080)
- [ ] Laptop (1440×900)
- [ ] Tablette (768×1024)
- [ ] Mobile (375×667) - si pertinent

### Livrable
Interface Primo polie, professionnelle et agréable à utiliser.

---

## 📊 PHASE 2 : Données & Diagnostics (3-4h)

### Objectif
Charger des données réalistes et guider l'utilisateur dans l'exploration des diagnostics pédagogiques.

### Étapes du tutoriel

#### 7. 📥 Chargement données d'assiduité
- **Action** : Bouton "Charger données démo" dans Primo
- **Données simulées** :
  - 4 semaines de présences
  - 30 étudiants × 12 séances (3h chacune)
  - Patterns variés :
    - 10 étudiants assidus (95-100%)
    - 15 étudiants normaux (80-90%)
    - 5 étudiants absents/irréguliers (50-70%)
- **Validation** : Graphique assiduité visible

#### 8. 📝 Saisie d'évaluations
- **Action** : Bouton "Charger évaluations démo" dans Primo
- **Données simulées** :
  - 3 artefacts par étudiant
  - Notes variées selon échelle IDME :
    - 20% Insuffisant (I)
    - 30% Développement (D)
    - 40% Maîtrisé (M)
    - 10% Étendu (E)
  - Critères SRPNF remplis avec variations réalistes
- **Validation** : Indices C-P calculés

#### 9. 📈 Exploration tableau de bord
- **Guide Primo** :
  - "Regarde la section Indicateurs globaux"
  - "Note les niveaux RàI identifiés"
  - "Observe les patterns détectés"
- **Points d'intérêt** :
  - Indices A-C-P moyens du groupe
  - Distribution des niveaux de risque
  - Patterns fréquents (Stable, Défi émergent, etc.)

#### 10. 🔍 Analyse profil étudiant
- **Guide Primo** :
  - "Clique sur Alya Tremblay (profil Excellence)"
  - "Clique sur Marc-André Dubois (profil Défi)"
  - "Clique sur Sophie Martin (profil Blocage émergent)"
- **Exploration** :
  - Lire diagnostics générés
  - Comprendre recommandations RàI
  - Observer graphiques évolution

### Tâches techniques

#### Création fichiers de données démo

**1. Assiduité** : `donnees-demo/assiduité.json`
```json
{
  "presences": {
    "2025-08-18": {
      "9999018": { "statut": "present", "heures": 3 },
      "9999019": { "statut": "absent", "heures": 0 },
      ...
    },
    ...
  }
}
```

**2. Évaluations** : `donnees-demo/evaluations.json`
```json
{
  "evaluations": [
    {
      "da": "9999018",
      "productionId": "...",
      "niveauFinal": "M",
      "criteres": {
        "Structure": "M",
        "Rigueur": "E",
        ...
      }
    },
    ...
  ]
}
```

#### Fonction import données démo

**Emplacement** : `js/primo-modal.js` ou nouveau `js/primo-donnees-demo.js`

**Fonction** :
```javascript
async function chargerDonneesDemo() {
  // 1. Charger assiduité
  const assiduité = await fetch('donnees-demo/assiduité.json').then(r => r.json());
  db.setSync('presences', assiduité.presences);

  // 2. Charger évaluations
  const evals = await fetch('donnees-demo/evaluations.json').then(r => r.json());
  // Sauvegarder chaque évaluation

  // 3. Recalculer indices
  calculerEtSauvegarderIndicesAssiduite();
  calculerEtStockerIndicesCP();

  afficherNotificationSucces('✅ Données démo chargées !');
}
```

**Bouton dans Primo** :
- Ajouter dans étape 7 du tutoriel
- Style : Gros bouton bleu "Charger données démo"
- Icône : 📥

#### Guide exploration

**Dans Primo** (étapes 9-10) :
- Texte explicatif : "Maintenant que les données sont chargées, explorons les diagnostics..."
- Liste de vérification :
  - [ ] Tableau de bord consulté
  - [ ] 3 profils étudiants explorés
  - [ ] Recommandations RàI comprises
- Liens directs vers :
  - Tableau de bord
  - Profils spécifiques (bouton "Voir profil Alya")

### Livrable
Tutoriel Phase 2 complet avec données réalistes et guide d'exploration des diagnostics.

---

## ✅ CHECKLIST AVANT DE COMMENCER DEMAIN

### Vérifications préalables
- [ ] **Lire** `primo-questions.js` : structure actuelle complète
- [ ] **Lire** `primo-modal.js` : système de navigation
- [ ] **Tester** flux actuel de bout en bout (identifier points de friction)
- [ ] **Noter** bugs connus et workarounds

### Fichiers à préparer
- [x] `test-echelle-idme.json` (existe)
- [x] `test-grille-srpnf.json` (existe)
- [ ] `donnees-demo/assiduité.json` (à créer)
- [ ] `donnees-demo/evaluations.json` (à créer)

### Documentation
- [x] `PLAN_PRIMO_TUTORIEL.md` (ce fichier)
- [ ] Noter bugs connus dans fichier séparé
- [ ] Créer `BUGS_CONNUS_BETA92.md` si nécessaire

---

## 🎯 PRIORITÉS DEMAIN (29 novembre)

### MATIN (3-4h)

**08h00-09h00 : Préparation**
- [ ] Café ☕
- [ ] Lire ce plan
- [ ] Ouvrir `primo-questions.js` et `primo-modal.js`
- [ ] Tester flux actuel

**09h00-12h00 : Phase 1 - Config de base**
- [ ] Vérifier étapes 1-6 dans `primo-questions.js`
- [ ] Corriger bugs navigation
- [ ] Tester flux complet 3 fois
- [ ] Ajuster messages d'instructions si flou

### APRÈS-MIDI (3-4h)

**13h00-15h00 : Phase intermédiaire - Polish CSS**
- [ ] Audit visuel de Primo
- [ ] Implémenter améliorations CSS
- [ ] Tester dans 2 navigateurs
- [ ] Screenshots avant/après

**15h00-17h00 : Phase 2 - Données démo**
- [ ] Créer `assiduité.json` (patterns réalistes)
- [ ] Créer `evaluations.json` (notes variées)
- [ ] Créer fonction `chargerDonneesDemo()`
- [ ] Intégrer dans Primo étapes 7-10

### SI TEMPS RESTANT

**Optionnel (pas critique)** :
- [ ] Débugger import cartouches (FileReader issue)
- [ ] Améliorer messages d'aide (tooltips)
- [ ] Ajouter animations subtiles
- [ ] Créer GIF démo du tutoriel

---

## 📝 NOTES IMPORTANTES

### Bugs connus à éviter
1. **Cartouches** : Import via fichier ne fonctionne pas (FileReader issue)
   - **Workaround** : Import manuel via console fonctionne
   - **Action** : Ignorer les cartouches dans Phase 1

2. **Cache navigateur** : Parfois tenace
   - **Solution** : Cache busters à jour (v=2025112801)
   - **Action** : Toujours tester avec rechargement forcé

3. **Menus déroulants** : Ne se rafraîchissent pas automatiquement
   - **Solution** : Recharger page après import
   - **Action** : Ajouter instruction "Recharge la page" dans Primo

### Points de vigilance
- **Ne pas complexifier** : Rester simple et guidé
- **Tester fréquemment** : Après chaque modification majeure
- **Documenter** : Tout changement dans commits Git
- **Respirer** : Prendre pauses régulières (Pomodoro 25min)

### Ressources utiles
- `CLAUDE.md` : Contexte complet du projet
- `ARCHITECTURE_PRATIQUES.md` : Système de pratiques
- `INDEXEDDB_ARCHITECTURE.md` : Stockage de données
- Commits récents : Voir corrections d'aujourd'hui

---

## 🎉 CRITÈRES DE SUCCÈS

**Fin de journée demain, on devrait avoir** :
1. ✅ Tutoriel Phase 1 complet et testé (config de base)
2. ✅ Interface Primo polie et professionnelle
3. ✅ Données démo créées et importables
4. ✅ Tutoriel Phase 2 fonctionnel (exploration diagnostics)
5. ✅ 3-5 commits Git bien documentés
6. ✅ Sentiment de progression tangible

**Bonus si temps** :
- 🎁 Cartouches debuggées
- 🎁 Animations ajoutées
- 🎁 Documentation utilisateur enrichie

---

**Bon courage pour demain ! Tu as un plan solide. Exécute méthodiquement et ça va bien aller.** 💪
