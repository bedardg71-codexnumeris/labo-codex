# Notes de version Beta 0.89

**Date** : 4 novembre 2025
**Fichier principal** : `index 89 (correctif échelles).html`
**Commits** : `aabd0d2`, `65457b4`, `40f4202`, `3a15102`

---

## Vue d'ensemble

La version Beta 0.89 ajoute le support complet du **niveau "0" (Aucun/Nul)** dans l'échelle IDME, permettant de gérer les cas de plagiat ou d'utilisation d'IA générative. Cette version corrige également des bugs critiques d'affichage et améliore l'interface des interventions RàI.

### Nouveautés principales

1. **Support niveau "0" dans échelle IDME à 5 niveaux**
2. **Correction bug affichage note 0 affichée comme (null)**
3. **Ajout bouton Courriel dans l'en-tête**
4. **Interface interventions RàI redessinée**

---

## ✨ Nouvelle fonctionnalité : Niveau "0"

### Contexte pédagogique

L'échelle IDME (taxonomie SOLO) compte traditionnellement 4 niveaux :
- **I** (Insuffisant) : < 64%
- **D** (En développement) : 65-74%
- **M** (Maîtrisé) : 75-84%
- **E** (Étendu) : ≥ 85%

La Beta 0.89 ajoute un **5e niveau "0" (Aucun)** pour gérer les situations où l'évaluation n'est pas possible :
- **0** (Aucun/Nul) : 0% - Plagiat, IA générative, travail non original

### Configuration de l'échelle

**Étapes pour créer une échelle à 5 niveaux** :

1. Aller dans **Matériel → Niveaux de performance**
2. Cliquer sur "Dupliquer l'échelle actuelle"
3. Nommer la nouvelle échelle (ex: "IDME et niv 0 (5 niveaux)")
4. Cliquer sur "Ajouter un niveau"
5. Configurer le niveau 0 :
   - **Code** : 0
   - **Nom** : Aucun
   - **Min** : 0
   - **Max** : 0
   - **Valeur de calcul** : 0
   - **Couleur** : Gris ou rouge
6. Sauvegarder l'échelle

### Utilisation dans les évaluations

1. Dans le formulaire d'évaluation, sélectionner l'échelle à 5 niveaux
2. Pour chaque critère, sélectionner **"0 - Aucun"**
3. La note finale affichera **0.0 %** avec niveau **"0"**
4. Cette évaluation sera incluse dans le calcul de la moyenne de l'étudiant

---

## 🐛 Correctifs critiques

### 1. Calcul du niveau "0" non reconnu

**Problème** :
Les fonctions `calculerNote()` et `obtenirCouleurNiveau()` lisaient l'ancienne échelle à 4 niveaux depuis `localStorage.niveauxEchelle` au lieu de lire l'échelle sélectionnée. Résultat : le niveau "0" n'était jamais trouvé et la note finale affichait `niveauFinal: "--"`.

**Solution** (evaluation.js:571-584, 657-672) :

```javascript
// AVANT (BUGGY) :
const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');

// APRÈS (CORRIGÉ) :
const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
const echelleSelectionnee = echelles.find(e => e.id === echelleId);
const niveaux = echelleSelectionnee.niveaux;
```

**Impact** :
- ✅ Le niveau "0" est maintenant correctement détecté
- ✅ La couleur du niveau "0" s'affiche correctement
- ✅ Le calcul de la moyenne inclut les notes à 0%

**Note importante** : Les évaluations déjà sauvegardées avant cette correction conservent `niveauFinal: "--"` dans localStorage jusqu'à ce qu'elles soient resauvegardées.

---

### 2. Note 0 affichée comme (null)

**Problème** :
Dans la page Mobilisation (Profil étudiant), les artefacts avec note 0 affichaient **(null)** au lieu de **(0)**.

**Cause racine** :
En JavaScript, `0` est considéré comme "falsy", donc :
```javascript
note: evaluation?.noteFinale || null  // ❌ 0 || null retourne null
```

**Solution** (profil-etudiant.js:634, 3233, 4502) :

```javascript
// Utiliser l'opérateur nullish coalescing (??) au lieu de OR (||)
note: evaluation?.noteFinale ?? null  // ✅ 0 ?? null retourne 0
niveau: evaluation?.niveauFinal ?? null
```

**Impact** :
- ✅ Les notes à 0 s'affichent correctement
- ✅ Les badges dans la section Mobilisation montrent "(0)" au lieu de "(null)"
- ✅ Correction appliquée à 3 endroits dans le code

---

## ✨ Améliorations interface

### 1. Bouton Courriel dans l'en-tête

**Ajout** : Nouveau bouton "Courriel" dans l'en-tête, sous les boutons "Feedback" et "Soutenir".

**Implémentation** (index 89:2467-2472) :

```html
<!-- Bouton Courriel -->
<a href="mailto:labo@codexnumeris.org"
   class="btn-action-header"
   title="Contacter l'équipe du Labo Codex">
    Courriel
</a>
```

**Impact** :
- ✅ Accès direct pour contacter l'équipe
- ✅ Ouvre le client de messagerie par défaut
- ✅ Cohérent avec le style des autres boutons

---

### 2. Interface interventions RàI redessinée

**Améliorations** (interventions.js:382-915, styles.css:307+) :

1. **Badges compacts** : Nouvelle classe `.badge-analyse` avec compteurs visuels
2. **Bouton "Planifier une intervention"** en haut de la liste
3. **Affichage répartition RàI amélioré** : Badges colorés avec nombre d'étudiants
4. **Répartition du risque** : Visualisation par badges (Faible, Modéré, Élevé, Critique)
5. **Retrait bouton "Modifier"** pour les interventions planifiées (confusion avec "Ouvrir")

**Exemple badge RàI** :
```html
<span class="badge-analyse badge-rai-analyse-2">
    Niveau 2
    <span class="badge-analyse-count">12</span>
</span>
```

**Impact** :
- ✅ Interface plus claire et compacte
- ✅ Identification rapide des niveaux RàI
- ✅ Meilleure hiérarchie visuelle

---

### 3. Recherche étudiants améliorée

**Améliorations** (etudiants.js:103-110, 532-542) :

1. **Recherche par DA** : En plus du nom/prénom
2. **Vidage automatique** du champ de recherche au chargement de la section

**Implémentation** :
```javascript
// Recherche étendue au numéro DA
const da = (e.da || '').toString().toLowerCase();
return nomComplet.includes(recherche) || da.includes(recherche);
```

**Impact** :
- ✅ Recherche rapide par code permanent (ex: "9000060")
- ✅ Champ de recherche vide au chargement (UX améliorée)
- ✅ Filtrage plus flexible

---

## 🗂️ Archivage

### 1. Index 88 déplacé vers Archives

**Action** : `index 88 (améliorations usage).html` → `Archives/index 88 (améliorations usage).html`

**Raison** : Index 89 devient la version active, l'ancienne version est archivée pour référence historique.

---

### 2. Démos de design archivées

**Action** : 6 fichiers de démonstration déplacés vers `Documents de travail (obsolètes)/`

**Fichiers** :
- demo-entete-glassmorphisme.html
- demo-navigation-liquid-glass.html
- demo-option-b-fond-bleu.html
- demo-profondeur-header.html
- demo-sidebar.html
- demo-sous-navigation.html

**Raison** : Démos d'exploration de design UI conservées pour référence future mais retirées de l'arborescence principale.

---

## 🔧 Détails techniques

### Fichiers modifiés

1. **index 89 (correctif échelles).html** :
   - Cache busters mis à jour (evaluation.js, profil-etudiant.js)
   - Ajout bouton Courriel dans l'en-tête

2. **js/evaluation.js** :
   - Lignes 571-584 : `calculerNote()` lit l'échelle sélectionnée
   - Lignes 657-672 : `obtenirCouleurNiveau()` lit l'échelle sélectionnée

3. **js/profil-etudiant.js** :
   - Lignes 634, 3233, 4502 : Remplacement `||` par `??` pour supporter note 0

4. **js/interventions.js** :
   - Interface redessinée avec badges compacts
   - Ajout bouton planification en haut de liste
   - Amélioration affichage analyse sous-groupes

5. **js/etudiants.js** :
   - Recherche étendue au numéro DA
   - Vidage automatique champ recherche

6. **styles.css** :
   - Nouveaux styles badges analyse (.badge-analyse, .badge-rai-analyse-*)
   - Styles compteurs (.badge-analyse-count)

### Statistiques

- **4 commits** créés
- **13 fichiers** modifiés au total
- **~3,900 insertions**, ~400 suppressions
- **2 bugs critiques** corrigés
- **1 nouvelle fonctionnalité** majeure (niveau "0")

---

## 🧪 Tests recommandés

### Test 1 : Création échelle 5 niveaux

1. Aller dans Matériel → Niveaux de performance
2. Dupliquer l'échelle IDME existante
3. Ajouter un niveau "0" (Aucun, 0-0%, valeur 0)
4. ✅ Vérifier que l'échelle se sauvegarde avec 5 niveaux

### Test 2 : Évaluation avec niveau "0"

1. Créer/charger une évaluation
2. Sélectionner l'échelle à 5 niveaux
3. Mettre tous les critères à "0 - Aucun"
4. ✅ Vérifier note finale : **0.0 %**, niveau : **"0"**
5. Sauvegarder
6. ✅ Vérifier dans la liste : note affiche "0 (0%)" et non "-- (0%)"

### Test 3 : Calcul de la moyenne avec 0%

1. Étudiant avec 3 artefacts : 69%, 78%, 0%
2. En mode **sommative** : Moyenne = (69 + 78 + 0) / 3 = **49%**
3. ✅ Vérifier que la moyenne affiche bien 49%

### Test 4 : Affichage dans Mobilisation

1. Aller dans Profil étudiant → Mobilisation
2. ✅ L'artefact avec note 0 doit afficher **(0)** et non **(null)**
3. ✅ Badge de couleur grise ou rouge selon configuration

### Test 5 : Bouton Courriel

1. Cliquer sur le bouton "Courriel" dans l'en-tête
2. ✅ Le client de messagerie s'ouvre avec destinataire `labo@codexnumeris.org`

### Test 6 : Interventions RàI

1. Aller dans Accompagnement → Interventions
2. ✅ Vérifier bouton "Planifier une intervention" en haut
3. ✅ Badges RàI compacts avec compteurs
4. ✅ Pas de bouton "Modifier" pour interventions planifiées

---

## ⚠️ Problèmes connus

### 1. Niveau "--" dans évaluations anciennes

**Problème** : Les évaluations sauvegardées **avant** la Beta 0.89 conservent `niveauFinal: "--"` dans localStorage.

**Impact** : Ces évaluations affichent "--" au lieu de "0" dans la liste, même si la note est correcte (0%).

**Solution temporaire** : Ouvrir et resauvegarder l'évaluation pour recalculer le niveau correctement.

**Solution future** : Script de migration pour recalculer tous les niveaux finaux.

---

### 2. Page blanche lors du chargement depuis la liste

**Problème** : Cliquer sur "Consulter" depuis la liste des évaluations peut occasionnellement afficher une page blanche.

**Impact** : Nécessite de charger l'évaluation depuis le formulaire d'évaluation principal.

**Status** : En investigation (probablement erreur JavaScript non catchée).

---

## 📚 Documentation associée

- **CLAUDE.md** : À mettre à jour avec section Beta 89
- **Guide utilisateur** : À enrichir avec procédure création échelle 5 niveaux
- **Section Aide** (index 89) : À compléter avec cas d'usage niveau "0"

---

## 🎯 Cas d'usage pédagogiques

### Scénario 1 : Plagiat détecté

Un étudiant soumet un travail copié intégralement d'Internet.

**Action** :
1. Sélectionner l'échelle à 5 niveaux
2. Attribuer niveau "0 - Aucun" à tous les critères
3. Ajouter commentaire : "Travail non original détecté. Veuillez consulter la politique d'intégrité académique."
4. Note finale : **0%**, niveau : **"0"**

**Impact sur la moyenne** :
- Moyenne avant : 75%
- Après ajout du 0% : 50% (alerte risque d'échec)
- Déclenche intervention RàI automatique

---

### Scénario 2 : Utilisation d'IA générative non autorisée

Un étudiant utilise ChatGPT pour générer l'intégralité de son analyse sans contribution personnelle.

**Action** :
1. Évaluer avec niveau "0" en expliquant pourquoi
2. Offrir possibilité de refaire avec jeton de reprise (si disponible)
3. Rencontre RàI pour clarifier les attentes

**Avantages du niveau "0"** :
- Distinction claire entre "insuffisant" (travail fourni mais faible) et "nul" (travail non recevable)
- Impact quantifiable sur la moyenne
- Traçabilité pour justifier échec si récidive

---

## 🎯 Prochaines étapes

La Beta 0.89 complète le support des échelles à niveaux variables. Les prochaines priorités (Phase 1) restent :

1. **Système de jetons complet** (délai, reprise) - 80% complété
2. **Cartouches de rétroaction contextuels** - 60% complété
3. **Script de migration** pour recalculer niveaux finaux des anciennes évaluations
4. **Correction bug page blanche** lors du chargement depuis la liste

Voir : `PLAN_DE_MATCH_2025-10-30.md` pour la roadmap complète vers la version 1.0.

---

## 📝 Notes de développement

### Architecture technique

Le système d'échelles suit maintenant une architecture **Single Source of Truth** :

**ANCIEN** (Beta < 89) :
```javascript
localStorage.niveauxEchelle  // Une seule échelle, 4 niveaux fixes
```

**NOUVEAU** (Beta ≥ 89) :
```javascript
localStorage.echellesTemplates  // Multiples échelles, niveaux variables
// Chaque évaluation stocke son echelleId
```

### Migration en douceur

Les deux architectures coexistent temporairement :
- Les anciennes fonctions lisent `niveauxEchelle` en fallback
- Les nouvelles fonctions lisent `echellesTemplates` en priorité
- Permet compatibilité ascendante sans migration forcée

### Cache busters

Pour forcer le rechargement des scripts modifiés :
- `evaluation.js?v=1762281435`
- `profil-etudiant.js?v=1762284180`

---

## 🙏 Remerciements

Merci aux testeurs qui ont signalé :
- Le besoin d'un niveau "0" pour les cas de plagiat
- Le bug d'affichage "(null)" dans les profils étudiants
- Les suggestions d'amélioration de l'interface interventions

Vos retours sont essentiels pour améliorer l'outil !

---

**Prochaine version prévue** : Beta 0.90 (mi-novembre 2025)
**Focus** : Système de jetons et cartouches contextuels
