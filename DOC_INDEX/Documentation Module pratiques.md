# Documentation Module pratiques.js

**Version** : Beta 0.72
**Date de mise à jour** : 26 octobre 2025
**Fichier source** : `js/pratiques.js`

---

## 📋 Vue d'ensemble

**Nom du module** : `pratiques.js` (Pratiques de notation)

**Description** : Module de configuration du système de notation du cours. Permet de choisir entre une pratique sommative traditionnelle (moyenne pondérée) ou une pratique alternative (PAN - Pratiques Alternatives de Notation). Gère également le mode d'affichage (normal vs comparatif) des indices au tableau de bord.

**Fonctionnalités principales** :
1. Configuration de la pratique de notation (sommative vs alternative)
2. Sélection du type de PAN (Maîtrise, Spécifications, Dénotation)
3. **Mode comparatif** : Affichage simultané des deux pratiques (Beta 0.72)
4. Sauvegarde et chargement de la configuration
5. Mise à jour du statut de configuration

**Exemple concret** : Un enseignant configure son cours en "pratique alternative - maîtrise" (Standards-Based Grading). Il active le "mode comparatif" pour afficher simultanément les indices sommatifs et alternatifs au tableau de bord, lui permettant de comparer empiriquement les deux approches.

---

## 🏷️ Type de module

**Type** : SOURCE (Configuration)

Ce module **génère et stocke** la configuration de notation dans localStorage.

**Données générées** :
- `modalitesEvaluation` : Objet complet avec configuration de notation et options d'affichage

**Modules lecteurs** :
- `tableau-bord-apercu.js` : Lit pour savoir quel mode d'affichage utiliser
- `profil-etudiant.js` : Lit la pratique pour afficher les bons indices
- `portfolio.js` : Calcule les indices selon les deux pratiques

---

## 💾 Données gérées

### Structure de données principale

#### `modalitesEvaluation`

```javascript
{
  pratique: string,              // "sommative" | "alternative"
  typePAN: string | null,        // "maitrise" | "specifications" | "denotation" | null
  affichageTableauBord: {
    afficherSommatif: boolean,   // Afficher indices sommatifs (SOM)
    afficherAlternatif: boolean  // Afficher indices alternatifs (PAN)
  },
  dateConfiguration: string      // ISO format (ex: "2025-10-26T14:30:00.000Z")
}
```

---

### Exemples de configurations

#### Configuration 1 : Sommative traditionnelle (mode normal)

```javascript
{
  pratique: "sommative",
  typePAN: null,
  affichageTableauBord: {
    afficherSommatif: true,      // Afficher SOM uniquement
    afficherAlternatif: false
  },
  dateConfiguration: "2025-08-15T08:00:00.000Z"
}
```

**Interface** : Pratique = Sommative, Checkbox "mode comparatif" **non cochée**
**Résultat** : Tableau de bord affiche uniquement les indices SOM avec badge `[SOM]`

---

#### Configuration 2 : Alternative - maîtrise (mode normal)

```javascript
{
  pratique: "alternative",
  typePAN: "maitrise",
  affichageTableauBord: {
    afficherSommatif: false,
    afficherAlternatif: true     // Afficher PAN uniquement
  },
  dateConfiguration: "2025-08-15T08:30:00.000Z"
}
```

**Interface** : Pratique = Alternative (PAN - Maîtrise), Checkbox "mode comparatif" **non cochée**
**Résultat** : Tableau de bord affiche uniquement les indices PAN avec badge `[PAN - Maîtrise]`

---

#### Configuration 3 : Alternative - maîtrise (mode comparatif)

```javascript
{
  pratique: "alternative",
  typePAN: "maitrise",
  affichageTableauBord: {
    afficherSommatif: true,      // Afficher les deux pour comparaison
    afficherAlternatif: true
  },
  dateConfiguration: "2025-10-26T10:00:00.000Z"
}
```

**Interface** : Pratique = Alternative (PAN - Maîtrise), Checkbox "mode comparatif" **cochée**
**Résultat** : Tableau de bord affiche checkboxes interactives `[☑ SOM] [☑ PAN]` avec valeurs colorées

---

#### Configuration 4 : Sommative (mode comparatif expérimental)

```javascript
{
  pratique: "sommative",
  typePAN: "maitrise",          // PAN calculé mais pas la pratique "officielle"
  affichageTableauBord: {
    afficherSommatif: true,
    afficherAlternatif: true
  },
  dateConfiguration: "2025-10-26T10:30:00.000Z"
}
```

**Interface** : Pratique = Sommative, Checkbox "mode comparatif" **cochée**
**Résultat** : Tableau de bord affiche les deux pratiques côte à côte pour comparaison

**Note** : Cette configuration permet à un enseignant utilisant la notation traditionnelle d'explorer les résultats d'une pratique alternative sans changer sa pratique officielle.

---

## 🔧 Fonctions principales

### Initialisation

#### `initialiserModulePratiques()`

Initialise le module des pratiques de notation.

**Appelée par** : `main.js` au chargement de la page

**Fonctionnement** :
1. Vérifie que les éléments DOM existent (section active)
2. Attache les événements aux éléments
3. Charge les modalités sauvegardées (`chargerModalites()`)
4. Met à jour le statut d'affichage

**Retour** : `void` (sortie silencieuse si les éléments n'existent pas)

```javascript
// Appelée automatiquement
initialiserModulePratiques();
```

---

#### `attacherEvenementsPratiques()`

Attache les événements aux éléments HTML.

**Appelée par** : `initialiserModulePratiques()`

**Événements attachés** :
- `#pratiqueNotation` (change) → `changerPratiqueNotation()`
- `#typePAN` (change) → `changerTypePAN()`
- `#modeComparatif` (change) → `sauvegarderOptionsAffichage()`
- `#btnSauvegarderPratiqueNotation` (click) → `sauvegarderPratiqueNotation()`

---

### Gestion de la pratique de notation

#### `changerPratiqueNotation()`

Gère le changement de pratique (sommative ↔ alternative).

**Déclencheur** : Événement `change` sur `#pratiqueNotation`

**Fonctionnement** :
1. Récupère la pratique sélectionnée
2. Si pratique = "alternative" :
   - Affiche `#colonnePAN` (sélection du type de PAN)
   - Réinitialise le type PAN si nécessaire
3. Si pratique = "sommative" :
   - Masque `#colonnePAN`
   - Efface les infos PAN
4. Appelle `afficherOptionsAffichage()`

**Exemple** :
```javascript
// Utilisateur sélectionne "Alternative" dans le menu déroulant
// → La colonne type PAN s'affiche
// → L'utilisateur peut choisir Maîtrise / Spécifications / Dénotation
```

---

#### `changerTypePAN()`

Gère le changement du type de PAN (maîtrise, spécifications, dénotation).

**Déclencheur** : Événement `change` sur `#typePAN`

**Fonctionnement** :
1. Récupère le type de PAN sélectionné
2. Affiche les informations correspondantes dans `#infoPAN` :
   - **Maîtrise** : Standard-Based Grading (échelle IDME : I-D-M-E)
   - **Spécifications** : Specifications Grading (critères binaires)
   - **Dénotation** : Ungrading (pas de notes quantitatives)

**Descriptions** :
- **Maîtrise** : Évaluation selon une échelle de maîtrise des compétences (IDME basée sur SOLO)
- **Spécifications** : Critères binaires (satisfait / non satisfait)
- **Dénotation** : Abandon des notes quantitatives au profit de rétroactions qualitatives

---

### Gestion du mode d'affichage (Beta 0.72)

#### `afficherOptionsAffichage()`

Gère l'affichage de la section "Options d'affichage" avec la checkbox "mode comparatif".

**Appelée par** :
- `changerPratiqueNotation()`
- `chargerModalites()`

**Fonctionnement** :
1. Affiche la section `#optionsAffichageIndices`
2. Configure la checkbox `#modeComparatif` selon la pratique :
   - Pratique alternative : Checkbox disponible (souvent cochée pour recherche)
   - Pratique sommative : Checkbox disponible (généralement non cochée)
3. Appelle `sauvegarderOptionsAffichage()`

**Interface Beta 0.72** :
```
Options d'affichage au tableau de bord
☐ Activer le mode comparatif (expérimental)
  ↓ Si cochée
  → Affiche SOM et PAN simultanément avec checkboxes interactives
```

---

#### `sauvegarderOptionsAffichage()`

Sauvegarde les options d'affichage selon l'état de la checkbox "mode comparatif".

**Déclencheur** : Événement `change` sur `#modeComparatif`

**Fonctionnement** :
```javascript
if (modeComparatif) {
    // Mode comparatif : afficher les deux pratiques
    modalites.affichageTableauBord = {
        afficherSommatif: true,
        afficherAlternatif: true
    };
} else {
    // Mode normal : afficher uniquement la pratique principale
    if (pratique === 'sommative') {
        modalites.affichageTableauBord = {
            afficherSommatif: true,
            afficherAlternatif: false
        };
    } else if (pratique === 'alternative') {
        modalites.affichageTableauBord = {
            afficherSommatif: false,
            afficherAlternatif: true
        };
    }
}
```

**Validation** : Aucune validation nécessaire (la checkbox détermine tout)

**Sauvegarde** : Écrit directement dans `localStorage.modalitesEvaluation`

**Log console** : Affiche l'état sauvegardé

---

### Sauvegarde et chargement

#### `sauvegarderPratiqueNotation()`

Sauvegarde la configuration complète de la pratique de notation.

**Déclencheur** : Clic sur le bouton "Sauvegarder la configuration"

**Fonctionnement** :
1. Récupère les valeurs des champs (`#pratiqueNotation`, `#typePAN`)
2. **Validation** :
   - Pratique obligatoire (affiche alerte si vide)
   - Si pratique = "alternative" : typePAN obligatoire
3. Construit l'objet `modalitesEvaluation` :
   ```javascript
   {
       pratique: pratique,
       typePAN: typePAN,
       dateConfiguration: new Date().toISOString(),
       affichageTableauBord: affichageTableauBord  // Préservé ou créé
   }
   ```
4. S'assure que `affichageTableauBord` existe (défaut selon pratique si absent)
5. Sauvegarde dans `localStorage.modalitesEvaluation`
6. Affiche notification de succès
7. Met à jour le statut avec `mettreAJourStatut()`
8. Log console

**Notifications** :
- Succès : "✓ Configuration sauvegardée" (vert)
- Erreur : "⚠️ Veuillez sélectionner une pratique" (orange)
- Erreur : "⚠️ Veuillez sélectionner un type de PAN" (orange)

---

#### `chargerModalites()`

Charge les modalités sauvegardées depuis localStorage au démarrage.

**Appelée par** : `initialiserModulePratiques()`

**Fonctionnement** :
1. Lit `localStorage.modalitesEvaluation`
2. Vérifie que les éléments DOM existent
3. **Si pas de données sauvegardées** :
   - Réinitialise tous les champs à vide
   - Masque la colonne PAN
   - Masque les options d'affichage
   - Affiche statut "Non configuré"
4. **Si données existent** :
   - Sélectionne la pratique dans `#pratiqueNotation`
   - Si pratique = "alternative" :
     - Affiche `#colonnePAN`
     - Sélectionne le type PAN dans `#typePAN`
     - Affiche les infos PAN avec `changerTypePAN()`
   - Charge l'état de la checkbox `#modeComparatif` :
     ```javascript
     const modeComparatif = modalites.affichageTableauBord.afficherSommatif &&
                            modalites.affichageTableauBord.afficherAlternatif;
     checkComparatif.checked = modeComparatif;
     ```
   - Appelle `afficherOptionsAffichage()`
   - Met à jour le statut avec `mettreAJourStatut()`

**Gestion de la rétrocompatibilité** : Si `affichageTableauBord` est absent, le crée avec des valeurs par défaut selon la pratique.

---

### Affichage du statut

#### `mettreAJourStatut()`

Met à jour l'affichage du statut de configuration dans `#statutModalites`.

**Appelée par** :
- `sauvegarderPratiqueNotation()`
- `chargerModalites()`

**Fonctionnement** :
1. Lit `modalitesEvaluation` depuis localStorage
2. **Si pas de configuration** :
   ```html
   <span style="color: #666;">Aucune configuration sauvegardée</span>
   ```
3. **Si configuration existe** :
   ```html
   <span style="color: #2196f3;">
     Pratique actuelle : <strong>Alternative - Maîtrise</strong>
   </span>
   ```
4. Affiche la date de dernière configuration (format lisible)
5. Affiche le mode d'affichage :
   - **Mode comparatif** : "Mode comparatif activé (SOM + PAN)"
   - **Mode normal** : "Affichage : SOM uniquement" ou "Affichage : PAN uniquement"

**Exemple de statut** :
```
Pratique actuelle : Alternative - Maîtrise
Mode comparatif activé (SOM + PAN)
Dernière configuration : 26 octobre 2025 à 10:30
```

---

## 🔗 Dépendances

### Modules requis (AVANT ce module)

```html
<script src="js/config.js"></script>      <!-- Variables globales -->
<script src="js/pratiques.js"></script>   <!-- CE MODULE -->
```

### Éléments HTML requis

```html
<!-- Sélection de la pratique -->
<select id="pratiqueNotation">
  <option value="">-- Choisir --</option>
  <option value="sommative">Sommative traditionnelle</option>
  <option value="alternative">Alternative (PAN)</option>
</select>

<!-- Type de PAN (affiché si pratique = alternative) -->
<div id="colonnePAN" style="display:none;">
  <select id="typePAN">
    <option value="">-- Choisir --</option>
    <option value="maitrise">Maîtrise (IDME)</option>
    <option value="specifications">Spécifications</option>
    <option value="denotation">Dénotation</option>
  </select>
  <div id="infoPAN"></div>
</div>

<!-- Options d'affichage (Beta 0.72) -->
<div id="optionsAffichageIndices">
  <label>
    <input type="checkbox" id="modeComparatif">
    Activer le mode comparatif (expérimental)
  </label>
</div>

<!-- Bouton de sauvegarde -->
<button id="btnSauvegarderPratiqueNotation">Sauvegarder la configuration</button>

<!-- Statut -->
<div id="statutModalites"></div>
```

### LocalStorage utilisé

**Écriture** :
- `modalitesEvaluation` : Configuration complète (pratique, type PAN, options affichage)

**Lecture** : Aucune (module source uniquement)

---

## 📊 Flux de données

```
INTERFACE UTILISATEUR          MODULE PRATIQUES           MODULES LECTEURS
┌─────────────────┐           ┌──────────────┐           ┌──────────────────┐
│ Select pratique │──────────▶│ pratiques.js │──────────▶│ tableau-bord-    │
│ Select type PAN │           │              │           │ apercu.js        │
│ Checkbox mode   │           │ Sauvegarde   │           │                  │
│ comparatif      │           │ dans         │           │ Lit mode pour    │
└─────────────────┘           │ localStorage │           │ afficher badge   │
                              └──────────────┘           │ ou checkboxes    │
                                     ↓                    └──────────────────┘
                              localStorage:
                              modalitesEvaluation          ┌──────────────────┐
                              {                           │ profil-          │
                                pratique,                 │ etudiant.js      │
                                typePAN,          ────────▶│                  │
                                affichageTableauBord,     │ Lit pratique     │
                                dateConfiguration         │ pour afficher    │
                              }                           │ les bons indices │
                                                          └──────────────────┘
```

---

## 🔄 Cycle de vie typique

### 1. Première configuration (enseignant)

```
Utilisateur ouvre Réglages → Pratiques de notation
   ↓
chargerModalites() → Aucune donnée → Statut "Non configuré"
   ↓
Utilisateur sélectionne "Alternative"
   ↓
changerPratiqueNotation() → Affiche colonne type PAN
   ↓
Utilisateur sélectionne "Maîtrise"
   ↓
changerTypePAN() → Affiche infos sur PAN-Maîtrise
   ↓
Utilisateur coche "Mode comparatif"
   ↓
sauvegarderOptionsAffichage() → afficherSom=true, afficherAlt=true
   ↓
Utilisateur clique "Sauvegarder"
   ↓
sauvegarderPratiqueNotation() → Sauvegarde complète
   ↓
mettreAJourStatut() → Affiche statut "Alternative - Maîtrise (Mode comparatif)"
```

---

### 2. Rechargement de page (session suivante)

```
Utilisateur revient sur Réglages → Pratiques de notation
   ↓
initialiserModulePratiques()
   ↓
chargerModalites() → Lit modalitesEvaluation depuis localStorage
   ↓
Restaure l'interface :
  - Pratique = "alternative"
  - Type PAN = "maitrise"
  - Checkbox "mode comparatif" cochée
   ↓
mettreAJourStatut() → Affiche statut sauvegardé
```

---

### 3. Basculement mode normal ↔ comparatif

```
Mode comparatif activé (SOM + PAN affichés)
   ↓
Utilisateur décoche "Mode comparatif"
   ↓
sauvegarderOptionsAffichage()
   ↓
Détecte pratique = "alternative"
   ↓
Sauvegarde : afficherSom=false, afficherAlt=true
   ↓
Tableau de bord se rafraîchit → Affiche uniquement PAN avec badge [PAN - Maîtrise]
```

---

## 🎯 Cas d'utilisation

### Cas 1 : Enseignant traditionaliste

**Profil** : Utilise uniquement la notation sommative (moyennes pondérées)

**Configuration** :
- Pratique : Sommative
- Mode comparatif : Non coché

**Résultat** : Tableau de bord affiche uniquement indices SOM avec badge `[SOM]`

---

### Cas 2 : Enseignant PAN convaincu

**Profil** : Utilise uniquement la pratique alternative (PAN-Maîtrise)

**Configuration** :
- Pratique : Alternative - Maîtrise
- Mode comparatif : Non coché

**Résultat** : Tableau de bord affiche uniquement indices PAN avec badge `[PAN - Maîtrise]`

---

### Cas 3 : Chercheur / Expérimentateur

**Profil** : Veut comparer empiriquement les deux approches

**Configuration** :
- Pratique : Alternative - Maîtrise (pratique "officielle")
- Mode comparatif : Coché ✓

**Résultat** : Tableau de bord affiche :
```
Indicateurs globaux du groupe [☑ SOM] [☑ PAN]
├─ Assiduité (A)    85% | 85%  (orange | bleu)
├─ Complétion (C)   75% | 82%
└─ Performance (P)  68% | 76%
```

**Avantage** : Peut basculer les checkboxes pour isoler une pratique sans recharger la page

---

### Cas 4 : Enseignant en transition

**Profil** : Utilise la notation traditionnelle mais explore le PAN

**Configuration** :
- Pratique : Sommative (pratique officielle)
- Type PAN : Maîtrise (configuré pour exploration)
- Mode comparatif : Coché ✓

**Résultat** : Voit les deux pratiques côte à côte sans changer sa pratique officielle. Peut analyser les divergences pour éclairer une future transition vers le PAN.

---

## ⚠️ Validation et gestion d'erreurs

### Validation des champs obligatoires

#### Pratique vide

```javascript
if (!pratique) {
    alert('⚠️ Veuillez sélectionner une pratique de notation');
    return;
}
```

#### Type PAN manquant (si pratique = alternative)

```javascript
if (pratique === 'alternative' && !typePAN) {
    alert('⚠️ Veuillez sélectionner un type de PAN');
    return;
}
```

### Création automatique de `affichageTableauBord`

Si l'objet `affichageTableauBord` est absent (ancienne version), le module le crée automatiquement :

```javascript
if (!modalites.affichageTableauBord) {
    modalites.affichageTableauBord = {
        afficherSommatif: pratique === 'sommative',
        afficherAlternatif: pratique === 'alternative'
    };
}
```

---

## 🚀 Changements Beta 0.72

### Modifications majeures

1. **Interface simplifiée** :
   - ❌ Anciennes : 2 checkboxes séparées (afficherSommatif, afficherAlternatif)
   - ✅ Nouvelle : 1 checkbox unique "Activer le mode comparatif (expérimental)"

2. **Logique automatique** :
   - Mode comparatif coché → Affiche SOM et PAN
   - Mode comparatif décoché → Affiche uniquement la pratique principale

3. **Validation supprimée** :
   - ❌ Ancienne : Validation "au moins une checkbox cochée"
   - ✅ Nouvelle : Pas de validation nécessaire (checkbox unique détermine tout)

4. **Fonction `sauvegarderOptionsAffichage()` refactorée** :
   - Lecture d'une seule checkbox
   - Logique conditionnelle selon `modeComparatif` et `pratique`

### Rétrocompatibilité

Les anciennes configurations restent valides :
- Si `affichageTableauBord` existe → Le mode comparatif est détecté automatiquement
- Si `afficherSommatif && afficherAlternatif` → Checkbox "mode comparatif" cochée au chargement

---

## 📚 Références

- **CLAUDE.md** : Architecture globale du projet
- **Documentation_Indicateurs_Pratique.md** : Guide utilisateur du mode comparatif
- **Documentation Module tableau-bord-apercu.md** : Lecteur principal de cette configuration
- **Guide de monitorage** : Fondements théoriques des pratiques alternatives

---

## 📝 Notes pour les développeurs

### Points d'attention

1. **Ordre de chargement** : Ce module doit être chargé AVANT les modules d'affichage (tableau-bord-apercu.js, profil-etudiant.js)

2. **Événements** : Les événements sont attachés uniquement si les éléments DOM existent (gestion des sections inactives)

3. **localStorage** : Toujours vérifier l'existence de `modalitesEvaluation` avant de lire

4. **Validation** : Seuls les champs critiques sont validés (pratique, typePAN si alternative)

### Extensions futures

- Mode comparatif étendu au profil étudiant
- Historique des configurations (undo/redo)
- Import/export de configurations
- Préréglages (templates) pour démarrage rapide

---

**Licence** : Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)
**Contact** : Labo Codex (https://codexnumeris.org/apropos)
