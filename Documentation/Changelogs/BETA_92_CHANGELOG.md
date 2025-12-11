# Beta 92 - Changelog complet

**Version** : Beta 92
**Période de développement** : 27 novembre - 1er décembre 2025
**Auteur** : Grégoire Bédard (Labo Codex) avec Claude Code
**Statut** : ✅ Tests validés - Package prêt pour distribution

---

## 📅 Vue d'ensemble

Beta 92 introduit **Primo**, un assistant de démarrage conversationnel qui guide les nouveaux utilisateurs, accompagné d'un système d'import/export avec métadonnées Creative Commons et d'optimisations majeures de l'expérience utilisateur.

### Développement sur 5 jours

| Date | Session | Thème principal | Statut |
|------|---------|-----------------|--------|
| **27 nov** | Session 1 | Primo Assistant + Import matériel | ✅ Complété |
| **28 nov** | Session 2 | Corrections bugs Primo | ✅ Complété |
| **29 nov** | - | (Jour de repos) | - |
| **30 nov** | Session 3 | Import/Export CC + Navigation | ✅ Complété |
| **1er déc** | Session 4 | Tests et corrections finales | ✅ Complété |

---

## 🎯 Session 1 : Primo Assistant (27 novembre 2025)

### Nouvelle fonctionnalité majeure : Primo

**Problème résolu** : Les nouveaux utilisateurs ne savaient pas par où commencer avec une application vide.

**Solution** : Modal d'accueil automatique avec parcours modulaires guidés.

### Composantes Primo

#### 1. Détection automatique première utilisation

**Fichier** : `js/primo-accueil.js` (lignes 20-38)

**Critères de détection** :
- Flag `primo_accueil_vu` absent
- Aucun cours configuré
- Aucun étudiant ajouté
- Aucune information trimestre/modalités

**Comportement** :
- Affichage automatique 1 seconde après le chargement
- Uniquement en mode Assisté
- Ne perturbe pas les utilisateurs existants

---

#### 2. Modal d'accueil animé

**Design** :
- Emoji 😎 dans cercle bleu dégradé (80x80px)
- Message chaleureux : "Allô, je suis Primo !"
- Sous-titre : "Je te propose un tour guidé !"
- Animations CSS : fadeIn + slideUp fluides

**Fichier** : `js/primo-accueil.js` (lignes 54-262)

---

#### 3. Parcours modulaires (4 modules)

**MODULE 1 : Créer un groupe-cours** (3 minutes)
- Configuration complète conversationnelle
- Cours, trimestre, horaire, groupe d'étudiants
- Import automatique matériel de démarrage

**MODULE 2 : Évaluer une production**
- Navigation directe vers mode guide
- Import de matériel pédagogique
- Complétion d'une évaluation

**MODULE 3 : Explorer les diagnostics pédagogiques** (désactivé)
- Prévu pour futures versions
- Placeholder visible mais non fonctionnel

**MODULE 4 : Créer ma pratique de notation** (8 minutes)
- Lancement du Wizard de configuration pratique
- Seuils, échelle, grille, paramètres

**Option supplémentaire** :
- "Retour à la navigation libre" : Ferme le modal
- "Consulter l'aide" : Navigation vers section Aide

---

#### 4. Configuration conversationnelle

**Fichier** : `js/primo-modal.js` (nouveau, ~900 lignes)

**Questions structurées** (fichier `js/primo-questions.js`) :
1. Informations du cours (titre, code, enseignant, groupe)
2. Cadre du trimestre (dates, session, année)
3. Horaire (jour, heure début, durée)
4. Liste d'étudiants (import fichier ou copier-coller)
5. Pratique de notation (sommative ou PAN-Maîtrise)

**Fonctionnalités** :
- Questions conditionnelles (dépendances)
- Validation en temps réel
- Transformation automatique des réponses (ex: parsing liste CSV)
- Sauvegarde progressive dans IndexedDB
- Barre de progression visuelle

---

#### 5. Import automatique matériel de démarrage

**Fichier** : `materiel-demarrage.json` (nouveau)

**Contenu importé automatiquement** :
1. **Échelle IDME** (5 niveaux)
   - Insuffisant (I) : < 64%
   - Développement (D) : 65-74%
   - Maîtrisé (M) : 75-84%
   - Étendu (E) : ≥ 85%
   - Niveau 0 : 0% (plagiat, IA non autorisée)

2. **Grille SRPNF** (5 critères)
   - Structure (15%)
   - Rigueur (20%)
   - Plausibilité (10%)
   - Nuance (25%)
   - Français (30%)

3. **Cartouches de rétroaction** (20 commentaires prédéfinis)
   - Commentaires pour chaque combinaison critère × niveau
   - Approche constructive avec suggestions d'amélioration

**Déclenchement** :
- Automatique après configuration Primo (MODULE 1)
- Détection si matériel déjà existant (évite doublons)
- Notification utilisateur : "Matériel pédagogique installé - 3 ressources"

**Fonction** : `importerMaterielDemarrage()` dans `primo-modal.js` (lignes 627-687)

---

#### 6. Tutoriel interactif (après données démo)

**Fichier** : `js/tutoriel-interactif.js` (nouveau, ~650 lignes)

**Déclenchement** :
- Automatique 2 secondes après import `donnees-demo.json`
- Détection via flag `donnees_demo_chargees`
- Ne s'affiche qu'une fois (`tutoriel_demo_vu`)

**Parcours guidé en 7 étapes** :
1. Bienvenue (message centré)
2. Tableau de bord (indicateurs A-C-P-E)
3. Liste des étudiants (30 étudiants de démo)
4. Profil d'un étudiant (ouverture automatique)
5. Section Évaluations
6. Réglages pratiques
7. Félicitations

**Fonctionnalités** :
- Bulles positionnées dynamiquement (top/bottom/left/right/center)
- Surbrillance éléments cibles (box-shadow bleu)
- Barre de progression (Étape X/7)
- Navigation Précédent/Suivant/Terminer
- Actions contextuelles automatiques (navigation entre sections)

---

### Fichiers créés (Session 1)

1. **`js/primo-accueil.js`** (469 lignes)
   - Détection première utilisation
   - Affichage modal avec animations
   - Gestion des parcours modulaires
   - Exports : `initialiserPrimoAccueil()`, `reafficherAccueilPrimo()`

2. **`js/primo-modal.js`** (~900 lignes)
   - Modal conversationnel complet
   - Gestion questions/réponses
   - Validation et transformation
   - Import matériel de démarrage
   - Reload automatique après configuration

3. **`js/primo-questions.js`** (~600 lignes)
   - 25+ questions structurées avec dépendances
   - Fonctions de transformation (parsing CSV, validation)
   - Questions conditionnelles

4. **`js/tutoriel-interactif.js`** (~650 lignes)
   - Système de tutoriel guidé en 7 étapes
   - Positionnement dynamique bulles
   - Navigation et surbrillance

5. **`materiel-demarrage.json`** (nouveau)
   - Échelle IDME (5 niveaux)
   - Grille SRPNF (5 critères)
   - Cartouches de rétroaction (20 commentaires)

### Fichiers modifiés (Session 1)

**`index 92.html`**
- Titre : "Système de suivi Beta 92 - Primo Assistant"
- Meta : "Beta 92 par Grégoire Bédard (27 novembre 2025 - Primo Assistant)"
- Scripts ajoutés (lignes 10224-10227) :
  ```html
  <script src="js/primo-accueil.js?v=2025112700"></script>
  <script src="js/primo-modal.js?v=2025112700"></script>
  <script src="js/primo-questions.js?v=2025112700"></script>
  <script src="js/tutoriel-interactif.js?v=2025112701"></script>
  ```

**`js/import-export.js`**
- Détection automatique données de démo lors de l'import
- Activation du flag `donnees_demo_chargees`
- Déclenchement du tutoriel interactif

---

## 🐛 Session 2 : Corrections bugs Primo (28 novembre 2025)

### Contexte

Le 27 novembre, l'import automatique du matériel de démarrage ne se déclenchait pas correctement lors de la configuration Primo.

**Symptômes** :
- Pas de logs `[Primo] 🚀 Début import matériel de démarrage...`
- Deux notifications rapides (verte puis rouge) impossibles à lire
- Erreur : `ReferenceError: Can't find variable: cartouches`

### Bug #1 : Fonction notification manquante

**Fichier** : `js/primo-accueil.js` (ligne 286)
**Erreur** : `ReferenceError: Can't find variable: afficherNotificationInformation`

**Cause** : La fonction `afficherNotificationInformation()` n'existe pas dans le codebase.

**Correctif** (lignes 286-293) :
```javascript
// AVANT
afficherNotificationInformation(
    'Presque prêt !',
    'Clique sur le bouton "Importer des données"...'
);

// APRÈS
if (typeof afficherNotificationSucces === 'function') {
    afficherNotificationSucces(
        'Presque prêt !',
        'Clique sur le bouton "Importer des données" et sélectionne le fichier "donnees-demo.json" 📦'
    );
} else {
    alert('Presque prêt !\n\nClique sur le bouton "Importer des données"...');
}
```

**Commit** : `8004069`
**Impact** : Éliminé l'erreur bloquante dans l'option "Charger des données de démonstration".

---

### Bug #2 : CORS / File Protocol bloque fetch()

**Erreur console** :
```
Cross origin requests are only supported for HTTP.
Fetch API cannot load file:///Users/.../materiel-demarrage.json due to access control checks.
TypeError: Load failed
```

**Cause** : Ouverture de `index 92.html` avec le protocole `file://` au lieu de `http://`.

**Solution** :
```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000/index%2092.html
```

**Impact** : Fetch du fichier `materiel-demarrage.json` fonctionne maintenant correctement.

**Documentation** : Instruction ajoutée dans README_TESTEURS.md

---

### Bug #3 : Mode application non initialisé

**Symptôme** : Liste des étudiants vide dans le formulaire d'évaluation.

**Investigation console** :
```javascript
> db.getSync('groupeEtudiants', [])
< Array(11)  // ✅ Les étudiants sont bien stockés

> db.getSync('modeApplication', null)
< null  // ❌ Le mode n'est pas initialisé !
```

**Cause racine** :
1. Primo ne définissait pas `modeApplication` dans IndexedDB
2. La variable globale `modeActuel` dans `modes.js` se charge au démarrage du script
3. Si `modeApplication` n'existe pas au moment du reload, `modeActuel` reste `null`
4. Les étudiants sont retournés mais avec un warning

**Correctif** (`js/primo-modal.js`, lignes 688-691) :
```javascript
// Définir le mode de travail sur "simulation" (Mode Assisté)
// L'utilisateur qui utilise Primo est nécessairement en mode assisté
db.setSync('modeApplication', 'simulation');
console.log('[Primo] Mode de travail défini sur "simulation" (Mode Assisté)');
```

**Commit** : `592d559`
**Impact** : Après le reload automatique de Primo, le mode "simulation" est correctement chargé et les étudiants apparaissent dans le formulaire.

---

### Bug #4 : Fonction transformation manquante

**Symptôme** : Liste d'étudiants collée dans Primo non transformée en tableau d'objets.

**Cause** :
- La question "Comment veux-tu ajouter les étudiants ?" contient une fonction `transformation`
- **MAIS** : La fonction `transformerReponse()` n'existe nulle part dans `primo-modal.js`
- L'appel échoue silencieusement, la valeur brute (string) est sauvegardée

**Correctif** : Création de la fonction `transformerReponse()` (lignes 737-749) :
```javascript
/**
 * Transforme une réponse selon la fonction transformation de la question
 */
function transformerReponse(questionId, valeur) {
    const question = obtenirQuestion(questionId);

    if (question && typeof question.transformation === 'function') {
        console.log(`[Primo] Transformation appliquée pour ${questionId}`);
        return question.transformation(valeur);
    }

    return valeur;
}
```

**Commit** : `2b84123`
**Impact** : La liste d'étudiants collée est maintenant correctement transformée en tableau d'objets avec structure `{da, nom, prenom, programme, courriel}`.

---

### Workflow complet validé (end-to-end)

**Étapes** :
1. Réinitialisation complète (`localStorage.clear()` + `indexedDB.deleteDatabase()`)
2. Primo s'affiche automatiquement (première utilisation détectée)
3. Choisir "Configuration complète pas à pas"
4. Répondre aux questions (cours, trimestre, horaire, étudiants, pratique)
5. Primo termine : sauvegarde, initialise mode simulation, importe matériel, reload
6. Après reload : mode actif, 11 étudiants, 3 ressources pédagogiques
7. Créer évaluation : liste complète des étudiants visible ✅

**Console logs attendus** :
```
[Primo] Configuration terminée !
[Primo] Mode de travail défini sur "simulation" (Mode Assisté)
[Primo] 🚀 Début import matériel de démarrage...
[Primo] 🔍 Vérification matériel existant: {echelles: 0, grilles: 0}
[Primo] 📥 Chargement de materiel-demarrage.json...
[Primo] 📦 Fichier chargé: Matériel pédagogique de démarrage
[Primo] ✅ 1 échelle(s) importée(s)
[Primo] ✅ 1 grille(s) importée(s)
[Primo] ✅ Cartouche importée pour grille grille-srpnf-defaut
[Primo] 🎉 Matériel pédagogique importé: 3 ressources
```

**Commits Session 2** : 3 commits, 4 bugs critiques corrigés

---

## 🎨 Session 3 : Import/Export CC + Navigation (30 novembre 2025)

### 1. Système d'import/export individuel avec métadonnées Creative Commons

**Problème résolu** : Impossible de remplacer une ressource pédagogique existante tout en préservant son ID et ses métadonnées de licence.

**Solution** : Boutons d'import/export individuels pour chaque ressource avec support complet des métadonnées CC BY-NC-SA 4.0.

#### Fonctionnalités implémentées

**Export individuel** (4 modules) :
- Productions : `exporterProductionActive()`
- Grilles : `exporterGrilleActive()`
- Échelles : `exporterEchelleActive()`
- Cartouches : `exporterCartoucheActive()`

**Import individuel** (4 modules) :
- Productions : `importerDansProductionActive()`
- Grilles : `importerDansGrilleActive()`
- Échelles : `importerDansEchelleActive()`
- Cartouches : `importerDansCartoucheActive()`

#### Comportement import individuel

**Support ancien et nouveau format** :
```javascript
// Format ancien (JSON direct)
{
    "id": "prod-123",
    "nom": "Analyse littéraire",
    "description": "..."
}

// Format nouveau (avec métadonnées CC)
{
    "metadata": {
        "licence": "CC BY-NC-SA 4.0",
        "auteur_original": "Marie Tremblay",
        "institution": "Cégep de Rimouski",
        "date_creation": "2025-11-30",
        "disciplines": ["Français"],
        "niveau": "Collégial"
    },
    "contenu": {
        "id": "prod-123",
        "nom": "Analyse littéraire",
        "description": "..."
    }
}
```

**Préservation des métadonnées** :
- Lecture des métadonnées CC lors de l'import
- Affichage du badge CC dans la confirmation (licence, auteur, date)
- Sauvegarde dans `metadata_cc` de la ressource
- ID original préservé (remplacement in-place)

**Exemple de code** (pattern répliqué 4 fois) :

`js/productions.js` (lignes 1314-1432) :
```javascript
function importerDansProductionActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    const itemActif = document.querySelector('.sidebar-item.active');
    if (!itemActif) {
        alert('Aucune production sélectionnée...');
        event.target.value = '';
        return;
    }

    const productionId = itemActif.getAttribute('data-id');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Support ancien et nouveau format
            let productionImportee;
            let metadata = null;

            if (donnees.contenu) {
                metadata = donnees.metadata;
                productionImportee = donnees.contenu;
            } else {
                productionImportee = donnees;
            }

            // Affichage badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `📋 Matériel sous licence ${metadata.licence}\n` +
                    `👤 Auteur: ${metadata.auteur_original}\n` +
                    `📅 Créé le: ${metadata.date_creation}\n\n`;
            }

            const confirmation = confirm(messageConfirmation + `⚠️ ATTENTION...`);

            // Préserver ID original et métadonnées CC
            const productionMiseAJour = {
                ...productionImportee,
                id: productionId
            };

            if (metadata) {
                productionMiseAJour.metadata_cc = metadata;
            }

            // Sauvegarde et rafraîchissement
            productions[index] = productionMiseAJour;
            db.setSync('productions', productions);
            afficherFormProduction(productionId);
            afficherListeProductions();
        } catch (error) {
            alert('Erreur lors de la lecture du fichier JSON...');
        } finally {
            event.target.value = '';
        }
    };

    reader.readAsText(file);
}
```

#### Visibilité contextuelle des boutons

**Mode création** (nouveau formulaire) :
- Aucun bouton en bas (pas Exporter, Importer, Dupliquer, Supprimer)
- Seulement "Annuler" et "Sauvegarder"

**Mode modification** (ressource existante chargée) :
- **4 boutons visibles** en bas :
  1. "Exporter cette [ressource]"
  2. "Importer dans cette [ressource]"
  3. "Dupliquer cette [ressource]"
  4. "Supprimer cette [ressource]"

**Implémentation** : Logique ajoutée dans les fonctions de chargement de chaque module :
- `chargerProductionPourModif()` et `nouveauFormProduction()`
- `chargerGrillePourModif()` et `nouvelleGrille()`
- `chargerEchellePourModif()` et `creerNouvelleEchelle()`
- `chargerCartouchePourModif()` et `creerNouvelleCartouche()`

---

### 2. Renommage des sections de navigation Matériel

**Objectif** : Harmoniser la terminologie et clarifier les noms de sections.

**Changements** (`js/config.js`, lignes 51-55) :

| Ancien nom | Nouveau nom | Changement |
|------------|-------------|------------|
| Productions | **Productions étudiantes** | Ajout "étudiantes" |
| Grilles de critères | Grilles de critères | Inchangé |
| Échelle de performance | **Échelles de performance** | Pluriel |
| Rétroactions | **Cartouches de rétroaction** | Nom complet |
| Objectifs d'apprentissage | **Ensembles d'objectifs** | Reformulation |

**Fichiers modifiés** :

1. **`js/config.js`** (lignes 51-55)
   - Mise à jour labels navigation

2. **`index 92.html`**
   - Mise à jour titres `<h2>` pour correspondre aux noms de navigation :
     - Ligne 3811 : "Productions étudiantes"
     - Ligne 4014 : "Grilles de critères"
     - Ligne 4150 : "Échelles de performance"
     - Ligne 4435 : "Cartouches de rétroaction"
     - Ligne 4611 : "Ensembles d'objectifs"

**Impact** : Cohérence totale entre navigation et titres de page.

---

### 3. Optimisations Modal Primo

#### 3.1 Layout horizontal (emoji gauche, texte droite)

**Avant** : Layout vertical centré (emoji au-dessus du texte)
**Après** : Layout horizontal (emoji à gauche, texte à droite)

**Objectif** : Optimiser l'espace vertical du modal.

**Changement** (`js/primo-accueil.js`, lignes 83-110) :
```html
<!-- En-tête avec Primo -->
<div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
    <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #1a5266, #2d7a8c);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        box-shadow: 0 4px 15px rgba(26, 82, 102, 0.3);
        flex-shrink: 0;
    ">
        😎
    </div>
    <div style="flex: 1;">
        <h2 style="color: var(--bleu-principal); margin: 0 0 5px; font-size: 1.8rem;">
            Allô, je suis Primo !
        </h2>
        <p style="color: var(--gris-moyen); font-size: 0.95rem; margin: 0;">
            Je te propose un tour guidé !
        </p>
    </div>
</div>
```

**Impact** : Réduction de la hauteur du modal, meilleure utilisation de l'espace.

---

#### 3.2 Ajout bouton "Consulter l'aide"

**Contexte** : Le bouton "😎 Aide" a été retiré de la navigation principale (uniquement en mode Assisté).

**Solution** : Ajout d'un bouton "Consulter l'aide" dans le modal Primo.

**Implémentation** (`js/primo-accueil.js`, lignes 219-236) :
```html
<button onclick="consulterAide()" style="...">
    <strong>Consulter l'aide</strong>
    <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">
        Accéder à la documentation
    </div>
</button>
```

**Fonction associée** (lignes 388-403) :
```javascript
function consulterAide() {
    fermerModalAccueil();
    setTimeout(() => {
        if (typeof afficherSection === 'function') {
            afficherSection('aide');
        } else {
            console.error('[Primo] Fonction afficherSection non disponible');
        }
    }, 300);
}

// Export
window.consulterAide = consulterAide;
```

**Fichiers modifiés** :
- `index 92.html` : Suppression du bouton "😎 Aide" de la navigation principale (ligne 2815)
- `js/primo-accueil.js` : Ajout bouton et fonction `consulterAide()`

---

#### 3.3 Reformulation "Explorer sans guide"

**Avant** : "Explorer sans guide / Naviguer librement dans l'application"
**Après** : "Retour à la navigation libre"

**Changements** :
- Texte simplifié et centré
- Suppression de la description
- Style : `text-align: center`

**Code** (`js/primo-accueil.js`, lignes 222-236) :
```html
<button onclick="explorerLibrement()" style="...text-align: center...">
    <strong>Retour à la navigation libre</strong>
</button>
```

---

#### 3.4 Ordre final des boutons

**Ordre dans le modal Primo** :
1. MODULE 1 : Créer un groupe-cours
2. MODULE 2 : Évaluer une production
3. MODULE 3 : Explorer les diagnostics (désactivé)
4. MODULE 4 : Créer ma pratique de notation
5. **Consulter l'aide**
6. **Retour à la navigation libre** ← En bas du modal

**Changement** : Le bouton "Retour à la navigation libre" a été déplacé en dernière position (après "Consulter l'aide").

---

### 4. Correctifs divers (Session 3)

#### 4.1 Boutons manquants dans Échelles

**Problème** : Bouton "Exporter cette échelle" manquant dans la page Échelles de performance.

**Cause** : Référence `btnSupprimer` manquante dans `chargerEchelleTemplate()`.

**Correctif** (`js/echelles.js`) :
- Ajout `btnSupprimer` dans `chargerEchelleTemplate()` (ligne 464)
- Fix `creerNouvelleEchelle()` pour cacher tous les 4 boutons (lignes 2003-2010)
- Fix `chargerEchellePourModif()` pour afficher tous les 4 boutons (lignes 2053-2060)

---

#### 4.2 Réorganisation boutons Cartouches

**Objectif** : Structure similaire aux autres pages de matériel pédagogique.

**Changement** (`index 92.html`) :
- Déplacement des boutons (Exporter, Importer, Dupliquer, Supprimer, Annuler, Sauvegarder) du milieu de la page vers le bas
- Positionnement après la matrice et l'aperçu (lignes 4573-4598)

---

### Fichiers modifiés (Session 3)

1. **`js/productions.js`**
   - Ajout `importerDansProductionActive()` (lignes 1314-1432)
   - Export vers `window` (ligne 1617)
   - Visibilité boutons dans `chargerProductionPourModif()` et `nouveauFormProduction()`

2. **`js/grilles.js`**
   - Ajout `importerDansGrilleActive()` (lignes 1611-1721)
   - Export vers `window` (ligne 1897)
   - Visibilité boutons dans `chargerGrillePourModif()` et `nouvelleGrille()`

3. **`js/echelles.js`**
   - Ajout `importerDansEchelleActive()` (lignes 1681-1791)
   - Export vers `window` (ligne 1956)
   - Fix `chargerEchelleTemplate()` avec `btnSupprimer` (ligne 464)
   - Fix `creerNouvelleEchelle()` pour cacher 4 boutons (lignes 2003-2010)
   - Fix `chargerEchellePourModif()` pour afficher 4 boutons (lignes 2053-2060)

4. **`js/cartouches.js`**
   - Ajout `importerDansCartoucheActive()` (lignes 1920-2031)
   - Export vers `window` (ligne 2106)
   - Visibilité boutons dans `chargerCartouchePourModif()` et `creerNouvelleCartouche()`

5. **`js/config.js`**
   - Mise à jour labels navigation Matériel (lignes 51-55)

6. **`index 92.html`**
   - Suppression bouton "😎 Aide" de navigation principale (ligne 2815)
   - Mise à jour titres sections matériel (lignes 3811, 4014, 4150, 4435, 4611)
   - Déplacement boutons Cartouches vers le bas (lignes 4573-4598)

7. **`js/primo-accueil.js`**
   - Layout horizontal header (lignes 83-110)
   - Ajout bouton "Consulter l'aide" (lignes 219-236)
   - Fonction `consulterAide()` (lignes 388-403)
   - Export vers `window` (ligne 465)
   - Reformulation "Retour à la navigation libre" (lignes 222-236)

---

## 📊 Statistiques globales Beta 92

### Développement

| Métrique | Valeur |
|----------|--------|
| **Sessions** | 3 (27, 28, 30 novembre) |
| **Jours de développement** | 3 jours |
| **Commits totaux** | ~15 commits |
| **Fichiers créés** | 5 (primo-accueil.js, primo-modal.js, primo-questions.js, tutoriel-interactif.js, materiel-demarrage.json) |
| **Fichiers modifiés** | ~20 fichiers |
| **Lignes ajoutées** | ~3,500 lignes |
| **Bugs corrigés** | 4 bugs critiques (Session 2) + 2 bugs mineurs (Session 3) |

### Fonctionnalités ajoutées

✅ **Primo Assistant** (Session 1)
- Détection première utilisation
- Modal d'accueil animé
- 4 parcours modulaires guidés
- Configuration conversationnelle (25+ questions)
- Import automatique matériel de démarrage (IDME + SRPNF + cartouches)
- Tutoriel interactif en 7 étapes

✅ **Corrections Primo** (Session 2)
- 4 bugs critiques corrigés
- Workflow end-to-end validé
- Documentation utilisateur mise à jour

✅ **Import/Export CC** (Session 3)
- Export individuel avec métadonnées CC BY-NC-SA 4.0 (4 modules)
- Import individuel avec préservation ID et métadonnées (4 modules)
- Support ancien et nouveau format JSON
- Visibilité contextuelle des boutons

✅ **Navigation et UX** (Session 3)
- Renommage 5 sections Matériel
- Layout horizontal modal Primo
- Bouton "Consulter l'aide" ajouté
- Réorganisation boutons Cartouches

---

## 🎯 Tests requis avant distribution

Voir fichier détaillé : **`PLAN_TESTS_BETA_92.md`**

### Résumé des tests

**1️⃣ Modal Primo et Navigation** (5 min)
- Affichage modal correct (emoji gauche, texte droite)
- Boutons fonctionnels (MODULE 1-4, Consulter l'aide, Retour)
- Navigation vers section Aide

**2️⃣ Navigation renommée** (5 min)
- Vérification 5 nouveaux noms Matériel
- Cohérence titres pages avec navigation

**3️⃣ Import/Export CC** (20-30 min)
- Export avec métadonnées CC (4 modules)
- Import avec lecture métadonnées CC (4 modules)
- Préservation IDs et métadonnées

**4️⃣ Visibilité boutons** (5-10 min)
- Mode création : boutons cachés
- Mode modification : 4 boutons visibles
- Validation sur 4 modules

**Temps total estimé** : 30-45 minutes

---

## 🎯 Session 4 : Tests et Corrections Finales (1er décembre 2025)

### Tests systématiques Beta 92

**Fichier de référence** : `PLAN_TESTS_BETA_92.md`

Cette session documente l'exécution complète du plan de tests et toutes les corrections appliquées.

### Tests exécutés

#### ✅ Test 1 : Modal Primo et Navigation
- **Statut** : Validé
- **Résultat** : Modal s'affiche correctement, tous les boutons fonctionnent
- **Note** : Bug détecté et corrigé (bouton "Suivant" restait visible après annulation MODULE 2)

#### ✅ Test 2 : Navigation Renommée
- **Statut** : Validé
- **Vérification** : 5 sections Matériel correctement renommées
  - Productions → **Productions étudiantes**
  - Échelle de performance → **Échelles de performance**
  - Rétroactions → **Cartouches de rétroaction**
  - Objectifs d'apprentissage → **Ensembles d'objectifs**

#### ✅ Test 3 : Import/Export avec métadonnées Creative Commons

**Test 3A - Productions** : ✅ Validé
- Modal CC s'affiche correctement
- Métadonnées exportées : auteur, discipline, institution, description
- Import préserve métadonnées et affiche badge CC

**Test 3B - Grilles de critères** : ✅ Validé
- Export/Import fonctionnels avec modal CC

**Test 3C - Échelles de performance** : ✅ Validé
- Export/Import fonctionnels avec modal CC
- **Amélioration** : Ajout champs Discipline et Institution dans formulaire Réglages
- **Fix** : Checkboxes intelligentes (cochées seulement si champs remplis)

**Test 3D - Cartouches de rétroaction** : ✅ Validé après correctifs
- **Problème détecté** : Modal ne s'affichait pas (attribut `onclick` inline avec fonction `async`)
- **Solution appliquée** : Remplacement par gestionnaires d'événements modernes avec `addEventListener`
- **Fichiers corrigés** :
  - `cartouches.js` : Export global + export individuel (lignes 85-101, 1907-1962)
  - `index 92.html` : Retrait `onclick` inline (lignes 4481, 4574)
  - Cache buster : v2025113002 → v2025120122

**Test 3E - Ensembles d'objectifs** : ✅ Validé après correctifs
- **Problème détecté** : Pas de modal avant export (ancien système avec `prompt()`)
- **Solution appliquée** : Migration vers `demanderMetadonneesEnrichies()`
- **Fichiers corrigés** :
  - `objectifs.js` : Fonction `exporterEnsembleObjectifs()` devenue `async` (lignes 652-695)
  - Délégation d'événements dans `initialiserModuleObjectifs()` (lignes 24-34)
  - Cache buster : v2025112620 → v2025120124

#### ✅ Test 4 : Visibilité Contextuelle des Boutons (5 modules)

**Modules testés** :
- Productions : ✅ Validé
- Grilles : ✅ Validé
- Échelles : ✅ Validé
- Cartouches : ✅ Validé
- Ensembles d'objectifs : ✅ Validé après correction

**Correction Ensembles d'objectifs** :
- **Problème** : Boutons "Dupliquer" et "Exporter" visibles en mode création
- **Solution** : Cacher boutons si nom = "Nouvel ensemble d'objectifs"
- **Affichage dynamique** : Boutons apparaissent après sauvegarde avec nouveau nom
- **Fichier** : `objectifs.js` (lignes 310-313, 577-583)

### Corrections techniques majeures

#### 1. Problème async/await avec boutons onclick inline

**Symptômes** :
- Fonctions `async` appelées via `onclick="fonction()"` ne géraient pas correctement les promesses
- Modal CC ne s'affichait pas (export direct sans modal)

**Solution globale** :
- Retrait de tous les attributs `onclick` inline pour fonctions `async`
- Remplacement par `addEventListener` avec gestion correcte de `await`
- Application sur 3 modules : Cartouches (×2) et Objectifs

**Pattern appliqué** :
```javascript
// ❌ Avant (ne fonctionne pas avec async)
<button onclick="exporterCartouches()">Exporter</button>

// ✅ Après (fonctionne correctement)
<button id="btnExporter">Exporter</button>

// JavaScript avec addEventListener
btnExporter.addEventListener('click', async function(e) {
    e.preventDefault();
    await exporterCartouches();
});
```

#### 2. Gestion métadonnées Discipline et Institution

**Amélioration** : Ajout de deux nouveaux champs dans formulaire Réglages
- **Fichiers modifiés** :
  - `index 92.html` : Champs `disciplineEnseignant` et `institutionEnseignant` (lignes 4860-4893)
  - `cours.js` : Load/Save nouveaux champs (lignes 368-369, 512-513)
  - `cc-license.js` : Pré-remplissage modal + checkboxes intelligentes (lignes 325-326, 348-349)
  - Cache busters : cours.js v2025120115, cc-license.js v2025120118

**Comportement intelligent** :
- Checkboxes Discipline et Institution cochées seulement si champs remplis
- Pré-remplissage depuis `listeCours` (priorité) ou `infoCours` (fallback)
- Export JSON correct avec `discipline` (array) et `institution` (string)

#### 3. Bug interventions RàI (JSON Parse)

**Symptôme** : `SyntaxError: JSON Parse error: Unexpected identifier "object"`

**Cause** : `db.getSync()` retourne déjà un objet JavaScript, mais le code essayait de faire `JSON.parse()` dessus

**Correction** :
- **Fichier** : `interventions.js` (ligne 109)
- Retrait `JSON.parse()` inutile
- Utilisation directe de l'objet retourné
- Cache buster : v2025112122 → v2025120125

### Statistiques Session 4

| Métrique | Valeur |
|----------|--------|
| **Tests exécutés** | 10 (Test 1-4, avec sous-tests) |
| **Bugs découverts** | 5 |
| **Bugs corrigés** | 5 |
| **Fichiers modifiés** | 8 (cartouches.js, objectifs.js, interventions.js, cours.js, cc-license.js, index 92.html) |
| **Cache busters mis à jour** | 8 versions |
| **Lignes ajoutées** | ~250 lignes |
| **Lignes modifiées** | ~150 lignes |
| **Temps total** | ~3 heures |

### Fichiers finaux mis à jour

**JavaScript** :
- `js/cartouches.js` : v2025120122
- `js/objectifs.js` : v2025120124
- `js/interventions.js` : v2025120125
- `js/cours.js` : v2025120115
- `js/cc-license.js` : v2025120118

**HTML** :
- `index 92.html` : Cache busters synchronisés

### Matériel de démonstration

**Nouveau dossier** : `matériel beta 92/`

Contenu créé pour testeurs :
- ✅ `liste de 10 élèves A.tsv` : 10 étudiants fictifs (programmes variés)
- ✅ `grille-Global-5-FR-HOLIS-CC-BY-SA-2025-12-01-3.json` : Grille d'évaluation complète
- ✅ `echelle-idme-et-niv-0-CC-BY-SA-2025-12-01-3.json` : Échelle IDME avec niveau 0
- ✅ `cartouche-undefined-undefined-CC-BY-SA-v1.0-2025-12-01.json` : Cartouches de rétroaction
- ✅ `production-Carte-mentale-CC-BY-SA-2025-12-01.json` : Production "Artefact 3"
- ✅ `README-DEMO.md` : Guide d'installation pas-à-pas (5 étapes)

**Avantage** : Les nouveaux utilisateurs peuvent tester l'application avec du contenu réaliste en moins de 5 minutes.

### Validation finale

**Statut** : ✅ **Tous les tests validés**

Résultat des tests :
- ✅ Test 1 : Modal Primo et Navigation
- ✅ Test 2 : Navigation Renommée
- ✅ Test 3A : Import/Export CC - Productions
- ✅ Test 3B : Import/Export CC - Grilles
- ✅ Test 3C : Import/Export CC - Échelles
- ✅ Test 3D : Import/Export CC - Cartouches
- ✅ Test 3E : Import/Export CC - Ensembles d'objectifs
- ✅ Test 4 : Visibilité Contextuelle Boutons (5 modules)
- ✅ Correctif interventions RàI

**Conclusion** : Beta 92 est prête pour distribution.

---

## 🚀 Prochaines étapes

### Court terme (décembre 2025)

1. **Tests complets Beta 92**
   - Exécuter `PLAN_TESTS_BETA_92.md`
   - Corriger bugs découverts
   - Valider workflow end-to-end

2. **Package distribution**
   - Créer `Monitorage_Beta_0.92.zip`
   - Inclure :
     - `index 92.html`
     - Tous les fichiers JS/CSS
     - `materiel-demarrage.json`
     - `donnees-demo.json`
     - `BETA_92_CHANGELOG.md` (ce fichier)
     - `PLAN_TESTS_BETA_92.md`
     - `README.md`

3. **Communication communauté**
   - Annonce sur Teams Labo Codex
   - Partage avec testeurs Beta
   - Recueillir feedback

### Moyen terme (janvier-février 2026)

4. **Migration IndexedDB** (Beta 93)
   - Support multi-groupes (10-15 groupes simultanés)
   - Architecture hybride localStorage + IndexedDB
   - Outil de migration

5. **Améliorations UX Primo**
   - Notification détaillée import matériel
   - Ralentir notifications importantes (3-4 sec)
   - Message récupération si import échoue
   - Uniformiser chemins formulaire évaluation

---

## 📚 Documentation associée

### Fichiers de documentation

- **`BETA_92_CHANGELOG.md`** (ce fichier) : Changelog complet Beta 92
- **`BETA_92_SESSION_2025-11-28.md`** : Détails Session 2 (bugs Primo)
- **`PLAN_TESTS_BETA_92.md`** : Plan de tests systématique
- **`CLAUDE.md`** : Documentation technique générale (à mettre à jour)
- **`ROADMAP_V1_AQPC2026.md`** : Vision long terme Version 1.0

### Fichiers techniques

- **`js/primo-accueil.js`** : Code source Primo accueil (469 lignes)
- **`js/primo-modal.js`** : Code source modal conversationnel (~900 lignes)
- **`js/primo-questions.js`** : Questions structurées (~600 lignes)
- **`js/tutoriel-interactif.js`** : Tutoriel guidé (~650 lignes)
- **`materiel-demarrage.json`** : Matériel pédagogique de base

---

## 🙏 Remerciements

Merci à **Claude Code (Anthropic)** pour la collaboration IA sur le design, l'implémentation et le débogage de Primo Assistant et du système d'import/export avec Creative Commons.

---

## 📞 Support

**Email** : labo@codexnumeris.org
**Site** : https://codexnumeris.org

---

**Version** : Beta 92
**Date de finalisation** : 1er décembre 2025
**Auteurs** : Grégoire Bédard (Labo Codex) avec Claude Code
**Statut** : ✅ Tests validés - Prêt pour distribution

---

**Bon démarrage avec Primo ! 👋🎓**
