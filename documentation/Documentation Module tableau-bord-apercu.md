# Documentation Module tableau-bord-apercu.js

**Version** : Beta 72
**Date de mise à jour** : 26 octobre 2025
**Fichier source** : `js/tableau-bord-apercu.js` (1197 lignes)

---

## Vue d'ensemble

Module **LECTEUR** qui affiche les statistiques pédagogiques globales dans la section "Tableau de bord → Aperçu".

**Principe fondamental** : Ce module ne calcule PAS les indices primaires (A-C-P). Il les lit depuis localStorage (calculés par `saisie-presences.js` et `portfolio.js`) et les agrège pour affichage.

**Affichage dual** : Supporte deux modes d'affichage :
- **Mode normal** : Une seule pratique (SOM ou PAN) avec valeurs uniques
- **Mode comparatif** : Deux pratiques simultanées (SOM + PAN) avec valeurs colorées et checkboxes interactives

**Sections affichées** :
1. Indicateurs globaux du groupe (moyennes A, C, P)
2. Risque d'échec (distribution et liste des étudiants à risque)
3. Répartition des patterns d'apprentissage (Stable, Défi, Blocages)
4. Système de Réponse à l'intervention (RàI - 3 niveaux)

---

## Type de module

- ❌ **SOURCE** - Génère et stocke des données
- ✅ **LECTEUR** - Lit et affiche des données

---

## Fondements théoriques

Basé sur le **Guide de monitorage - Section ROUGE** (indices primaires)

### Indices primaires (A-C-P)

- **Assiduité (A)** : Proportion de présences en classe
  - Source : `indicesAssiduiteDetailles` (calculé par `saisie-presences.js`)
  - Formule : Nombre de présences / Total de jours

- **Complétion (C)** : Proportion d'artefacts remis
  - Source : `indicesCP` (calculé par `portfolio.js`)
  - Formule : Artefacts remis / Artefacts requis

- **Performance (P)** : Performance moyenne
  - Source : `indicesCP` (calculé par `portfolio.js`)
  - SOM : Moyenne pondérée de TOUS les travaux
  - PAN : Moyenne des N meilleurs artefacts

### Indice de risque (R)

- **Formule** : R = 1 - (A × C × P)
- **Interprétation** : Plus R est élevé, plus le risque d'échec est important
- **Seuils** :
  - < 30% : Risque minimal (vert)
  - 30-40% : Risque modéré (jaune)
  - 40-60% : Risque élevé (orange)
  - ≥ 60% : Risque critique (rouge)

### Patterns d'apprentissage

- **Stable** : A ≥ 75%, C ≥ 75%, P ≥ 75%
- **Défi** : A ≥ 75%, mais C < 65% OU P < 65%
- **Blocage émergent** : A ≥ 75%, mais C < 65% ET P < 65%
- **Blocage critique** : Risque d'échec > 70%

### Système RàI (Réponse à l'intervention)

- **Niveau 1** (Enseignement universel) : Risque < 30%
- **Niveau 2** (Interventions ciblées) : Risque 30-60%
- **Niveau 3** (Interventions intensives) : Risque ≥ 60%

---

## Données gérées

### Lecture localStorage (aucune écriture)

#### 1. `indicesAssiduiteDetailles`
- **Source** : `saisie-presences.js`
- **Structure** :
```javascript
{
  "1234567": {
    "3derniers": { "valeur": 0.85, ... },
    "7derniers": { "valeur": 0.82, ... },
    "12derniers": { "valeur": 0.80, ... }
  },
  ...
}
```
- **Usage** : Lecture de l'indice A (assiduité) pour chaque étudiant

#### 2. `indicesCP`
- **Source** : `portfolio.js`
- **Structure** :
```javascript
{
  "SOM": {
    "1234567": {
      "C": 0.85,
      "P": 0.72,
      "dateCalcul": "2025-10-26T10:30:00"
    },
    ...
  },
  "PAN": {
    "1234567": {
      "C": 0.87,
      "P": 0.78,
      "dateCalcul": "2025-10-26T10:30:00"
    },
    ...
  }
}
```
- **Usage** : Lecture des indices C (complétion) et P (performance) pour SOM et PAN

#### 3. `groupeEtudiants`
- **Source** : `etudiants.js`
- **Usage** : Liste des étudiants actifs (filtre statut ≠ décrochage/abandon)

#### 4. `modalitesEvaluation`
- **Source** : `pratiques.js`
- **Structure utilisée** :
```javascript
{
  "pratique": "sommative",  // ou "alternative"
  "typePAN": "maitrise",
  "affichageTableauBord": {
    "afficherSommatif": true,
    "afficherAlternatif": false
  }
}
```
- **Usage** : Détermine le mode d'affichage (normal vs comparatif)

---

## API publique

### Initialisation

#### `initialiserModuleTableauBordApercu()`

Initialise le module et charge les statistiques si la sous-section est active.

**Paramètres** : Aucun
**Retour** : `void`
**Appelée par** : `navigation.js` lors de l'activation de "Tableau de bord → Aperçu"

```javascript
// Appelée automatiquement par navigation.js
initialiserModuleTableauBordApercu();
```

---

### Fonction principale

#### `chargerTableauBordApercu()`

Fonction principale qui charge et affiche toutes les statistiques du tableau de bord.

**Paramètres** : Aucun
**Retour** : `void`

**Séquence d'exécution** :
1. Lit `groupeEtudiants` depuis localStorage
2. Filtre les étudiants actifs (statut ≠ décrochage/abandon)
3. Calcule les indices pour chaque étudiant (`calculerIndicesEtudiant()`)
4. Affiche les 4 sections principales :
   - `afficherMetriquesGlobales(etudiants)`
   - `afficherAlertesPrioritairesCompteurs(etudiants)`
   - `afficherPatternsApprentissage(etudiants)`
   - `afficherNiveauxRaI(etudiants)`

**Gestion du mode d'affichage** :
- Détecte automatiquement le mode (normal vs comparatif) via `modalitesEvaluation`
- En mode comparatif : Affiche les checkboxes et les valeurs colorées
- En mode normal : Affiche le badge simple et les valeurs uniques

```javascript
// Appelée par saisie-presences.js après enregistrement
chargerTableauBordApercu();

// Ou manuellement pour rafraîchir
chargerTableauBordApercu();
```

---

## Fonctions de génération de badges

### `genererBadgePratique()`

Génère un badge HTML indiquant la pratique de notation active (pour le titre principal).

**Retour** : `string` - HTML du badge

**Logique** :
- Si `afficherSommatif && afficherAlternatif` : Badge "Mode Hybride (SOM + PAN)" en violet
- Sinon si `pratique === 'sommative'` : Badge "Sommative traditionnelle (SOM)" en orange
- Sinon : Badge "Alternative - PAN Maîtrise/Spécifications/Dénotation" en bleu

**Style** : Badge large avec bordure et fond coloré (opacité 9%)

```javascript
const badgeHTML = genererBadgePratique();
// Résultat : '<span style="...">Sommative traditionnelle (SOM)</span>'
```

---

### `genererBadgeSourceDonnees()`

Génère un badge compact indiquant la source des données (pour les sections).

**Retour** : `string` - HTML du badge

**Logique** :
- Si mode comparatif : Badge "Hybride" en violet
- Sinon si SOM actif : Badge "Source : SOM" en orange
- Sinon : Badge "Source : PAN" en bleu

**Note** : En Beta 72, cette fonction est encore présente mais peu utilisée (remplacée par les checkboxes en mode comparatif)

---

### `genererIndicateurPratiqueOuCheckboxes()`

Génère soit un badge informatif (mode normal) soit des checkboxes interactives (mode comparatif).

**Retour** : `string` - HTML du badge ou des checkboxes

**Logique** :
```javascript
if (modeComparatif) {
    // Retourne des checkboxes interactives [☑ SOM] [☑ PAN]
    return '<div class="pratique-checkboxes">...</div>';
} else {
    // Retourne un badge simple [SOM] ou [PAN - Maîtrise]
    return '<span class="badge-pratique">[SOM]</span>';
}
```

**Utilisation** : Injectée dans le titre de chaque section en mode comparatif

---

## Fonctions de calcul

### `calculerIndicesEtudiant(da)`

Calcule tous les indices (A-C-P-R) pour un étudiant donné, dans les deux pratiques (SOM et PAN).

**Paramètres** :
- `da` (string) : Numéro de DA de l'étudiant

**Retour** : Objet avec structure suivante
```javascript
{
  sommatif: {
    A: 0.85,
    C: 0.75,
    P: 0.68,
    R: 0.567  // Risque calculé : 1 - (A × C × P)
  },
  alternatif: {
    A: 0.85,   // Même valeur que sommatif (source unique)
    C: 0.82,
    P: 0.76,
    R: 0.467
  }
}
```

**Logique** :
1. Lit `indicesAssiduiteDetailles[da]['12derniers']` pour A
2. Lit `indicesCP.SOM[da]` pour C et P (SOM)
3. Lit `indicesCP.PAN[da]` pour C et P (PAN)
4. Calcule R avec `calculerRisque(A, C, P)` pour chaque pratique
5. Retourne un objet avec les deux branches (sommatif et alternatif)

**Gestion des données manquantes** :
- Si un indice est manquant : utilise 0.0 par défaut
- Avertissement console si données incomplètes

---

### `calculerRisque(assiduite, completion, performance)`

Calcule le risque d'échec selon la formule R = 1 - (A × C × P).

**Paramètres** :
- `assiduite` (number) : Indice A (0.0 à 1.0)
- `completion` (number) : Indice C (0.0 à 1.0)
- `performance` (number) : Indice P (0.0 à 1.0)

**Retour** : `number` - Risque entre 0.0 et 1.0

**Exemple** :
```javascript
const risque = calculerRisque(0.85, 0.75, 0.68);
// Résultat : 1 - (0.85 × 0.75 × 0.68) = 1 - 0.4335 = 0.5665 (57%)
```

---

### `determinerNiveauRisque(risque)`

Détermine le niveau de risque selon les seuils définis.

**Paramètres** :
- `risque` (number) : Valeur entre 0.0 et 1.0

**Retour** : `string` - Un des niveaux suivants :
- `"minimal"` : risque < 0.30
- `"modere"` : 0.30 ≤ risque < 0.40
- `"eleve"` : 0.40 ≤ risque < 0.60
- `"critique"` : risque ≥ 0.60

**Exemple** :
```javascript
determinerNiveauRisque(0.25); // "minimal"
determinerNiveauRisque(0.35); // "modere"
determinerNiveauRisque(0.55); // "eleve"
determinerNiveauRisque(0.75); // "critique"
```

---

### `determinerPattern(indices)`

Détermine le pattern d'apprentissage d'un étudiant selon ses indices A-C-P.

**Paramètres** :
- `indices` (object) : `{ A, C, P, R }`

**Retour** : `string` - Un des patterns suivants :
- `"Stable"` : A ≥ 75%, C ≥ 75%, P ≥ 75%
- `"Défi"` : A ≥ 75%, mais C < 65% OU P < 65% (pas les deux)
- `"Blocage émergent"` : A ≥ 75%, mais C < 65% ET P < 65%
- `"Blocage critique"` : Risque > 70% (1 - A×C×P > 0.70)
- `"Inconnu"` : Autres cas (assiduité insuffisante)

**Logique** :
```javascript
if (R > 0.70) return "Blocage critique";
if (A >= 0.75 && C >= 0.75 && P >= 0.75) return "Stable";
if (A >= 0.75 && C < 0.65 && P < 0.65) return "Blocage émergent";
if (A >= 0.75 && (C < 0.65 || P < 0.65)) return "Défi";
return "Inconnu";
```

---

## Fonctions de génération de cartes (helper functions)

Ces fonctions génèrent le HTML pour chaque type de carte d'information.

### `genererCarteMetrique(label, valeurSom, valeurPan, afficherSom, afficherPan)`

Génère une carte pour les indicateurs globaux (A, C, P).

**Paramètres** :
- `label` (string) : Label affiché (ex: "Assiduité (A)")
- `valeurSom` (string) : Valeur formatée pour SOM (ex: "85%")
- `valeurPan` (string) : Valeur formatée pour PAN (ex: "87%")
- `afficherSom` (boolean) : Afficher la valeur SOM
- `afficherPan` (boolean) : Afficher la valeur PAN

**Retour** : `string` - HTML de la carte

**Structure HTML** :
```html
<div class="statistique-item">
  <span class="label-left">Assiduité (A)</span>
  <span class="values-right">
    <span style="color: var(--som-orange);">85%</span> |
    <span style="color: var(--pan-bleu);">87%</span>
  </span>
</div>
```

**Logique d'affichage** :
- Mode comparatif + les deux cochées : Affiche "valeurSom | valeurPan" (coloré)
- Mode comparatif + une seule cochée : Affiche uniquement la valeur cochée (colorée)
- Mode normal : Affiche une seule valeur (non colorée)

---

### `genererCarteRisque(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor)`

Génère une carte pour la distribution des risques (minimal, modéré, élevé, critique).

**Paramètres** :
- `label` (string) : Label du niveau de risque (ex: "Risque élevé")
- `valeurSom` (string) : Pourcentage SOM (ex: "25%")
- `valeurPan` (string) : Pourcentage PAN
- `total` (number) : Nombre total d'étudiants
- `afficherSom` (boolean) : Afficher SOM
- `afficherPan` (boolean) : Afficher PAN
- `bgColor` (string) : Couleur de fond (ex: "#fff3e0")
- `borderColor` (string) : Couleur de bordure (ex: "#ff9800")

**Retour** : `string` - HTML de la carte avec fond coloré

**Structure** : Similaire à `genererCarteMetrique()` mais avec styling spécifique (fond coloré)

---

### `genererCartePattern(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor)`

Génère une carte pour les patterns d'apprentissage (Stable, Défi, Blocages).

**Paramètres** : Identiques à `genererCarteRisque()`

**Retour** : `string` - HTML de la carte

**Note** : Beta 72 a supprimé les barres de progression (redondantes avec les pourcentages)

---

### `genererCarteRaI(label, description, valeurSomPct, valeurPanPct, valeurSomCount, valeurPanCount, afficherSom, afficherPan, bgColor, borderColor)`

Génère une carte pour le système RàI (Niveaux 1, 2, 3).

**Paramètres** :
- `label` (string) : Label du niveau (ex: "Niveau 1")
- `description` (string) : Description (ex: "Enseignement universel")
- `valeurSomPct` (string) : Pourcentage SOM (ex: "65%")
- `valeurPanPct` (string) : Pourcentage PAN
- `valeurSomCount` (number) : Nombre d'étudiants SOM
- `valeurPanCount` (number) : Nombre d'étudiants PAN
- `afficherSom` / `afficherPan` : Flags d'affichage
- `bgColor` / `borderColor` : Couleurs de style

**Retour** : `string` - HTML de la carte avec pourcentages et comptes

**Structure** : Affiche "65% (18 étudiants)" en une seule ligne

---

## Fonctions d'affichage des sections

### `afficherMetriquesGlobales(etudiants)`

Affiche la section "Indicateurs globaux du groupe" avec les moyennes A, C, P.

**Paramètres** :
- `etudiants` (array) : Liste des étudiants avec leurs indices calculés

**Affichage** :
1. Calcule les moyennes de groupe pour A, C, P (SOM et PAN séparément)
2. Génère les cartes avec `genererCarteMetrique()`
3. Injecte dans `#metriques-globales-container`
4. Ajoute les checkboxes ou le badge selon le mode

**Exemple de sortie (mode comparatif)** :
```
Indicateurs globaux du groupe [☑ SOM] [☑ PAN]
├─ Assiduité (A)    85% | 85%  (même valeur, source unique)
├─ Complétion (C)   75% | 82%
└─ Performance (P)  68% | 76%
```

---

### `afficherAlertesPrioritairesCompteurs(etudiants)`

Affiche la section "Risque d'échec" avec la distribution des niveaux de risque.

**Paramètres** :
- `etudiants` (array) : Liste des étudiants avec indices

**Affichage** :
1. Compte le nombre d'étudiants par niveau (minimal, modéré, élevé, critique)
2. Calcule les pourcentages pour SOM et PAN
3. Génère les cartes avec `genererCarteRisque()` (fond coloré selon niveau)
4. Affiche aussi une liste des étudiants à risque élevé/critique

**Couleurs** :
- Minimal : Vert (#e8f5e9 / #4caf50)
- Modéré : Jaune (#fff9c4 / #fbc02d)
- Élevé : Orange (#fff3e0 / #ff9800)
- Critique : Rouge (#ffebee / #f44336)

---

### `afficherPatternsApprentissage(etudiants)`

Affiche la section "Répartition des patterns d'apprentissage".

**Paramètres** :
- `etudiants` (array) : Liste des étudiants

**Patterns affichés** :
- Stable (vert)
- Défi (jaune)
- Blocage émergent (orange)
- Blocage critique (rouge)

**Affichage** : Pourcentages et comptes pour chaque pattern (SOM vs PAN)

---

### `afficherNiveauxRaI(etudiants)`

Affiche la section "Système de Réponse à l'intervention (RàI)".

**Paramètres** :
- `etudiants` (array) : Liste des étudiants

**Niveaux affichés** :
- **Niveau 1** (vert) : Enseignement universel (R < 30%)
- **Niveau 2** (jaune) : Interventions ciblées (30% ≤ R < 60%)
- **Niveau 3** (rouge) : Interventions intensives (R ≥ 60%)

**Affichage** : Pourcentages et comptes avec description de chaque niveau

---

## Fonctions de gestion des checkboxes

### `togglerAffichagePratique(pratique, afficher)`

Bascule l'affichage d'une pratique (SOM ou PAN) en mode comparatif.

**Paramètres** :
- `pratique` (string) : "sommatif" ou "alternatif"
- `afficher` (boolean) : true pour afficher, false pour masquer

**Logique** :
1. Vérifie qu'au moins une pratique reste affichée (validation)
2. Recharge le tableau de bord avec `chargerTableauBordApercu()`

**Écouteurs d'événements** :
```javascript
document.getElementById('toggle-som')?.addEventListener('change', function() {
    if (!this.checked && !document.getElementById('toggle-pan').checked) {
        this.checked = true; // Empêche de tout décocher
        return;
    }
    chargerTableauBordApercu();
});
```

---

## Fonctions utilitaires

### `formatPourcentage(valeur)`

Formate un nombre entre 0.0 et 1.0 en pourcentage avec 0 décimale.

**Paramètres** :
- `valeur` (number) : Valeur entre 0.0 et 1.0

**Retour** : `string` - Pourcentage formaté (ex: "85%")

```javascript
formatPourcentage(0.8547); // "85%"
```

---

### `getCouleurRisque(niveau)`

Retourne les couleurs de fond et de bordure pour un niveau de risque donné.

**Paramètres** :
- `niveau` (string) : "minimal", "modere", "eleve", ou "critique"

**Retour** : Objet `{ bgColor: string, borderColor: string }`

```javascript
getCouleurRisque("eleve");
// { bgColor: "#fff3e0", borderColor: "#ff9800" }
```

---

### `setStatText(id, valeur)`

Met à jour le texte d'un élément HTML par son ID.

**Paramètres** :
- `id` (string) : ID de l'élément
- `valeur` (string|number) : Valeur à afficher

**Avertissement** : Affiche un warning console si l'élément n'existe pas

---

## Ordre de chargement et dépendances

### Scripts requis (AVANT ce module)

```html
<!-- PRIORITÉ 1: Configuration -->
<script src="js/config.js"></script>
<script src="js/navigation.js"></script>

<!-- PRIORITÉ 2: Gestion des données -->
<script src="js/etudiants.js"></script>
<script src="js/pratiques.js"></script>

<!-- PRIORITÉ 3: Calcul des indices (CRITIQUE) -->
<script src="js/saisie-presences.js"></script>  <!-- Calcule indices A -->
<script src="js/portfolio.js"></script>          <!-- Calcule indices C et P -->

<!-- PRIORITÉ 4: Affichage -->
<script src="js/tableau-bord-apercu.js"></script> <!-- CE MODULE -->
```

**⚠️ IMPORTANT** : Les modules `saisie-presences.js` et `portfolio.js` doivent être chargés AVANT ce module, sinon les données d'indices ne seront pas disponibles.

---

## Flux de données

```
SOURCES                      LECTEUR                    AFFICHAGE
┌──────────────────┐        ┌────────────────┐         ┌─────────────┐
│ saisie-          │        │ tableau-bord-  │         │ Section     │
│ presences.js     │───────▶│ apercu.js      │────────▶│ Aperçu      │
│ (calcule A)      │        │ (agrège et     │         │             │
└──────────────────┘        │  affiche)      │         │ - Métriques │
                            │                │         │ - Risques   │
┌──────────────────┐        │                │         │ - Patterns  │
│ portfolio.js     │───────▶│                │         │ - RàI       │
│ (calcule C et P) │        │                │         └─────────────┘
└──────────────────┘        └────────────────┘

localStorage:
- indicesAssiduiteDetailles
- indicesCP (SOM et PAN)
- groupeEtudiants
- modalitesEvaluation
```

---

## Variables CSS utilisées

```css
:root {
    --som-orange: #ff6f00;     /* Couleur SOM (mode comparatif) */
    --pan-bleu: #0277bd;       /* Couleur PAN (mode comparatif) */
    --hybride-violet: #9c27b0; /* Réservé pour usage futur */
}
```

---

## Exemples d'utilisation

### Recharger le tableau de bord après saisie de présences

```javascript
// Dans saisie-presences.js, après enregistrement
function enregistrerPresences() {
    // ... logique d'enregistrement ...

    // Recalculer les indices A
    calculerEtStockerIndicesAssiduite();

    // Rafraîchir le tableau de bord
    if (typeof chargerTableauBordApercu === 'function') {
        chargerTableauBordApercu();
    }
}
```

---

### Recharger après modification des indices C-P

```javascript
// Dans portfolio.js, après calcul des indices
function calculerEtStockerIndicesCP() {
    // ... calcul des indices C et P ...

    // Rafraîchir le tableau de bord si visible
    const apercu = document.getElementById('tableau-bord-apercu');
    if (apercu && apercu.classList.contains('active')) {
        chargerTableauBordApercu();
    }
}
```

---

## Limitations connues

1. **Pas de rafraîchissement automatique** : Le tableau de bord ne se met pas à jour automatiquement. Il faut appeler `chargerTableauBordApercu()` manuellement.

2. **Données synchrones** : Toutes les lectures sont synchrones depuis localStorage. Avec un très grand nombre d'étudiants (> 100), cela pourrait causer des ralentissements.

3. **Mode comparatif limité au Tableau de bord** : Le profil étudiant ne supporte pas encore le mode comparatif (affichage d'une seule pratique à la fois).

4. **Données manquantes** : Si `indicesCP` n'existe pas pour un étudiant, les valeurs par défaut (0.0) sont utilisées, ce qui peut fausser les statistiques de groupe.

---

## Notes de migration (Beta 71 → Beta 72)

### Changements majeurs

1. **Suppression des badges "Hybride" dans les sections** → Remplacés par checkboxes interactives en mode comparatif

2. **Nouvelles fonctions helper** : `genererCarteMetrique()`, `genererCarteRisque()`, `genererCartePattern()`, `genererCarteRaI()`

3. **Layout unifié** : Label à gauche, valeurs à droite (class `label-left` et `values-right`)

4. **Colorisation** : Valeurs colorées uniquement en mode comparatif (orange/bleu)

5. **Suppression barres de progression** : Retirées de la section Patterns (redondance)

### Fonctions supprimées

- `afficherPatternsHybride()` - Code mort
- `afficherRaIHybride()` - Code mort

### Fonctions ajoutées

- `genererIndicateurPratiqueOuCheckboxes()` - Génère badge ou checkboxes selon mode
- `togglerAffichagePratique()` - Gère les événements checkboxes

---

## Références

- **CLAUDE.md** : Architecture globale du projet
- **Documentation_Indicateurs_Pratique.md** : Guide utilisateur du mode comparatif
- **Guide de monitorage** : Fondements théoriques (Section ROUGE)
- **Documentation Module saisie-presences.md** : Source des indices A
- **Documentation Module portfolio.md** : Source des indices C et P

---

**Licence** : Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)
**Contact** : Labo Codex (https://codexnumeris.org/apropos)
