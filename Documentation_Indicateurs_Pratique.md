# Guide utilisateur : Affichage comparatif SOM-PAN

**Version** : 2.0 (Beta 72)
**Date** : 26 octobre 2025
**Module** : Système de monitorage SOM-PAN hybride

---

## Vue d'ensemble

L'application supporte deux pratiques d'évaluation simultanées et permet de comparer leurs résultats:

- **SOM** (Sommative traditionnelle - moyenne pondérée) - Couleur orange (#ff6f00)
- **PAN** (Pratique Alternative de Notation - portfolio) - Couleur bleu (#0277bd)

Le système fonctionne en **deux modes** :

1. **Mode normal** : Affichage d'une seule pratique (SOM ou PAN) avec badge informatif simple
2. **Mode comparatif** : Affichage simultané des deux pratiques avec checkboxes interactives pour basculer entre les vues

---

## Pourquoi ce système est essentiel

Dans une application qui supporte **deux systèmes d'évaluation simultanés**, il est critique que l'utilisateur sache à tout moment quelle pratique génère les données affichées. Les décisions pédagogiques (interventions, RàI, diagnostics) dépendent directement de cette information.

### Exemple de confusion évitée

Sans identification claire, un enseignant pourrait :
- Voir un risque d'échec de 85% et croire qu'il s'agit de la pratique PAN, alors qu'il s'agit de SOM
- Comparer des indices C/P entre deux vues différentes sans réaliser qu'ils proviennent de pratiques différentes
- Interpréter les patterns d'apprentissage selon le mauvais cadre de référence

---

## Les deux modes de fonctionnement

### Mode normal (par défaut)

**Affichage** : Une seule pratique à la fois (SOM ou PAN)

**Identification visuelle** :
- Badge simple dans le titre : `[SOM]` ou `[PAN - Maîtrise]`
- Couleur du badge : Orange pour SOM, Bleu pour PAN
- Pas de checkboxes, pas d'affichage dual

**Configuration** :
- Défini par `modalitesEvaluation.pratique` ('sommative' ou 'alternative')
- Option "Activer le mode comparatif" **non cochée** dans Réglages → Pratiques de notation

**Exemple** :
```
Vue d'ensemble [SOM]
├─ Indicateurs globaux: 75% (en noir, valeur unique)
├─ Risque d'échec: 22% (en noir, valeur unique)
└─ Patterns: Stable (65%), Défi (25%), ... (valeurs uniques)
```

---

### Mode comparatif (expérimental)

**Affichage** : Deux pratiques simultanément avec contrôles interactifs

**Identification visuelle** :
- Checkboxes dans chaque section pour basculer entre SOM et PAN
- Valeurs **colorées** : Orange (#ff6f00) pour SOM, Bleu (#0277bd) pour PAN
- Labels à gauche, valeurs colorées à droite

**Configuration** :
- Option "Activer le mode comparatif (expérimental)" **cochée** dans Réglages → Pratiques de notation
- Force `affichageTableauBord.afficherSommatif = true` ET `affichageTableauBord.afficherAlternatif = true`

**Exemple** :
```
Vue d'ensemble
├─ [☑ SOM] [☑ PAN] Checkboxes interactives en haut
│
├─ Indicateurs globaux
│  ├─ C: 75% (orange) | 82% (bleu)
│  └─ P: 68% (orange) | 76% (bleu)
│
├─ Risque d'échec
│  └─ 22% (orange) | 18% (bleu)
│
└─ Patterns d'apprentissage
   └─ Stable: 65% (orange) | 58% (bleu)
```

**Important** : En mode comparatif, au moins une des deux checkboxes doit rester cochée (validation empêche de tout décocher)

---

## Emplacements de l'identification visuelle

### Tableau de bord - Aperçu

**En mode normal** :
- Badge simple dans le titre "Vue d'ensemble" : `[SOM]` ou `[PAN - Maîtrise]`
- Aucun indicateur dans les sections (données uniques, pas d'ambiguïté)
- Valeurs affichées en noir (couleur par défaut)

**En mode comparatif** :
- Checkboxes interactives en haut de chaque section :
  - [☑ SOM] [☑ PAN] pour basculer l'affichage
- Valeurs colorées : Orange (#ff6f00) pour SOM, Bleu (#0277bd) pour PAN
- 4 sections concernées :
  1. **Indicateurs globaux du groupe** (A, C, P)
  2. **Risque d'échec** (pourcentage et nombre d'étudiants)
  3. **Répartition des patterns d'apprentissage** (Stable, Défi, Blocage émergent/critique)
  4. **Système de Réponse à l'intervention (RàI)** (niveaux 1, 2, 3)

### Profil étudiant

**Badge de section** : Titre "Suivi de l'apprentissage"
- Affiche `[SOM]` ou `[PAN]` selon la pratique active pour cet étudiant
- Permet d'identifier rapidement quelle pratique génère les indices R (Risque) et RàI
- Couleur du badge : Orange pour SOM, Bleu pour PAN

```
Suivi de l'apprentissage [PAN]
```

**Note** : Le profil étudiant ne supporte pas le mode comparatif (affichage d'une seule pratique à la fois)

### Réglages - Pratiques de notation

**Checkbox de configuration** :
- "Activer le mode comparatif (expérimental)"
- Contrôle le basculement entre mode normal et mode comparatif
- Impact global sur toute l'application

### Futures implémentations

Les sections suivantes supporteront l'affichage dual dans une version future :
- Liste des étudiants (colonnes C, P, Risque)
- Évaluations - Aperçu (statistiques globales)
- Évaluations - Liste (détail des évaluations)

---

## Configuration du système

### Structure de données (localStorage.modalitesEvaluation)

```javascript
{
  "pratique": "sommative",           // ou "alternative"
  "typePAN": "maitrise",             // ou "specifications", "denotation"
  "affichageTableauBord": {
    "afficherSommatif": true,        // Géré automatiquement
    "afficherAlternatif": false      // Géré automatiquement
  }
}
```

### Interface de configuration (Réglages → Pratiques de notation)

**Une seule checkbox** : "Activer le mode comparatif (expérimental)"

**Logique de fonctionnement** :

#### Mode normal (checkbox non cochée)
```javascript
// Si pratique = 'sommative'
affichageTableauBord.afficherSommatif = true
affichageTableauBord.afficherAlternatif = false

// Si pratique = 'alternative'
affichageTableauBord.afficherSommatif = false
affichageTableauBord.afficherAlternatif = true
```
**Résultat** : Badge `[SOM]` ou `[PAN - Maîtrise]` dans le titre, valeurs uniques en noir

#### Mode comparatif (checkbox cochée)
```javascript
// Quelle que soit la pratique
affichageTableauBord.afficherSommatif = true
affichageTableauBord.afficherAlternatif = true
```
**Résultat** : Checkboxes interactives dans chaque section, valeurs colorées (orange/bleu)

### Scénarios d'utilisation

#### Scénario 1 : Enseignant utilisant SOM uniquement
```javascript
{
  "pratique": "sommative",
  "affichageTableauBord": {
    "afficherSommatif": true,
    "afficherAlternatif": false
  }
}
```
**Interface** : Checkbox "mode comparatif" non cochée
**Affichage** : Badge `[SOM]`, valeurs uniques en noir

#### Scénario 2 : Enseignant utilisant PAN uniquement
```javascript
{
  "pratique": "alternative",
  "typePAN": "maitrise",
  "affichageTableauBord": {
    "afficherSommatif": false,
    "afficherAlternatif": true
  }
}
```
**Interface** : Checkbox "mode comparatif" non cochée
**Affichage** : Badge `[PAN - Maîtrise]`, valeurs uniques en noir

#### Scénario 3 : Comparaison expérimentale SOM vs PAN
```javascript
{
  "pratique": "alternative",         // Pratique "officielle"
  "typePAN": "denotation",
  "affichageTableauBord": {
    "afficherSommatif": true,       // Forces par checkbox
    "afficherAlternatif": true       // Forces par checkbox
  }
}
```
**Interface** : Checkbox "mode comparatif" cochée
**Affichage** : Checkboxes [☑ SOM] [☑ PAN], valeurs colorées orange/bleu

---

## Interprétation pédagogique

### En mode comparatif

Le système permet de **comparer empiriquement** les deux pratiques côte à côte :

- **Indices C (Complétion)** : Souvent similaires entre SOM et PAN (même données source)
- **Indices P (Performance)** : Peuvent diverger significativement
  - SOM : Reflète la moyenne de TOUS les travaux (pénalise les échecs initiaux)
  - PAN : Reflète les MEILLEURS artefacts (valorise la trajectoire de progression)

**Exemple visuel** :
```
Indicateurs globaux du groupe [☑ SOM] [☑ PAN]

C (Complétion)    85% | 87%   ← Légère différence (orange | bleu)
P (Performance)   62% | 78%   ← Divergence importante ! (orange | bleu)
```

**Interprétation** : Le groupe a produit des travaux très inégaux. SOM pénalise les travaux faibles initiaux et donne une moyenne de 62%. PAN sélectionne les meilleurs artefacts et reflète une maîtrise de 78% (capacité actuelle démontrée).

### En mode normal - PAN uniquement

Badge `[PAN - Maîtrise]` rappelle que :
- Les indices reflètent une **trajectoire de développement**
- La sélection des N meilleurs artefacts simule le principe de l'évaluation cumulative
- Le risque d'échec est basé sur la **capacité actuelle démontrée**, pas la moyenne historique
- La philosophie sous-jacente : "Ce qui compte, c'est où l'étudiant est rendu, pas son parcours"

### En mode normal - SOM uniquement

Badge `[SOM]` indique que :
- Les indices reflètent une **moyenne pondérée provisoire** de toutes les évaluations
- Chaque évaluation impacte la moyenne selon son poids relatif
- Le risque d'échec est basé sur la **performance moyenne**, incluant les échecs antérieurs
- La philosophie sous-jacente : "Toutes les performances comptent également"

---

## Questions fréquentes

### Q1 : Comment activer le mode comparatif ?

**R** : Allez dans Réglages → Pratiques de notation, et cochez la checkbox "Activer le mode comparatif (expérimental)". Cela forcera l'affichage simultané des données SOM et PAN avec des checkboxes interactives dans chaque section.

### Q2 : Puis-je voir seulement PAN en mode comparatif ?

**R** : Oui ! En mode comparatif, décochez la checkbox [SOM] pour ne voir que les valeurs PAN (en bleu). Au moins une des deux checkboxes doit rester cochée (validation empêche de tout décocher).

### Q3 : Pourquoi les valeurs sont colorées en mode comparatif mais pas en mode normal ?

**R** : En mode normal, il n'y a **pas d'ambiguïté** (une seule pratique affichée), donc les valeurs sont en noir (couleur par défaut). En mode comparatif, les couleurs (orange/bleu) sont **essentielles** pour distinguer instantanément SOM de PAN.

### Q4 : Le badge change-t-il automatiquement si je modifie mes réglages ?

**R** : Oui, le badge et les checkboxes se génèrent dynamiquement à chaque rechargement de page selon la configuration actuelle dans localStorage. Après avoir modifié vos réglages, rafraîchissez la page ou changez de section.

### Q5 : Puis-je cacher les badges ou checkboxes ?

**R** : Non, ces éléments sont **essentiels** pour éviter les erreurs d'interprétation des données. Ils font partie intégrante de l'interface du système hybride SOM-PAN.

### Q6 : Quelle pratique devrais-je utiliser pour mes interventions pédagogiques ?

**R** : Cela dépend de votre philosophie pédagogique :
- **SOM uniquement** : Si vous croyez que la moyenne de toutes les performances reflète mieux la compétence
- **PAN uniquement** : Si vous croyez que les meilleures performances reflètent mieux la maîtrise émergente
- **Mode comparatif** : Pour comparer les deux approches empiriquement et affiner votre jugement professionnel

### Q7 : Le mode comparatif affecte-t-il le calcul des notes ?

**R** : Non ! Le mode comparatif affecte uniquement l'**affichage** des données. Les calculs SOM et PAN sont toujours effectués en arrière-plan, quelle que soit votre configuration d'affichage. Les checkboxes contrôlent la **visualisation**, pas le calcul.

---

## Détails techniques (pour développeurs)

### Variables CSS (styles.css)

```css
:root {
    --som-orange: #ff6f00;     /* Couleur SOM */
    --pan-bleu: #0277bd;       /* Couleur PAN */
    --hybride-violet: #9c27b0; /* Réservé pour usage futur */
}
```

### Fonctions principales (tableau-bord-apercu.js)

#### `genererIndicateurPratiqueOuCheckboxes()`
Génère soit un badge informatif (mode normal) soit des checkboxes interactives (mode comparatif).

```javascript
function genererIndicateurPratiqueOuCheckboxes() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};
    const modeComparatif = affichage.afficherSommatif && affichage.afficherAlternatif;

    if (modeComparatif) {
        // Mode comparatif : checkboxes interactives
        return `
            <div class="pratique-checkboxes">
                <label><input type="checkbox" id="toggle-som" checked> SOM</label>
                <label><input type="checkbox" id="toggle-pan" checked> PAN</label>
            </div>
        `;
    } else {
        // Mode normal : badge simple
        const pratique = config.pratique || 'alternative';
        const typePAN = config.typePAN || 'maitrise';
        const typesPAN = {
            'maitrise': 'PAN - Maîtrise',
            'specifications': 'PAN - Spécifications',
            'denotation': 'PAN - Dénotation'
        };

        const texte = pratique === 'sommative' ? 'SOM' : typesPAN[typePAN];
        const couleur = pratique === 'sommative' ? 'var(--som-orange)' : 'var(--pan-bleu)';

        return `<span class="badge-pratique" style="color: ${couleur};">[${texte}]</span>`;
    }
}
```

#### Fonctions helper pour générer les cartes

**`genererCarteMetrique(label, valeurSom, valeurPan, ...)`**
Génère une carte pour les indicateurs globaux (A, C, P) avec valeurs colorées.

**`genererCarteRisque(label, valeurSom, valeurPan, ...)`**
Génère une carte pour le risque d'échec (pourcentage + nombre d'étudiants).

**`genererCartePattern(label, valeurSom, valeurPan, ...)`**
Génère une carte pour les patterns d'apprentissage (sans barres de progression).

**`genererCarteRaI(label, description, valeurSomPct, valeurPanPct, ...)`**
Génère une carte pour le système RàI avec pourcentages et comptes.

**Structure commune** :
```javascript
function genererCarteMetrique(label, valeurSom, valeurPan, afficherSom, afficherPan, modeComparatif) {
    let valeursHTML = '';

    if (modeComparatif) {
        // Mode comparatif : valeurs colorées séparées par pipe
        if (afficherSom && afficherPan) {
            valeursHTML = `
                <span style="color: var(--som-orange);">${valeurSom}</span> |
                <span style="color: var(--pan-bleu);">${valeurPan}</span>
            `;
        } else if (afficherSom) {
            valeursHTML = `<span style="color: var(--som-orange);">${valeurSom}</span>`;
        } else {
            valeursHTML = `<span style="color: var(--pan-bleu);">${valeurPan}</span>`;
        }
    } else {
        // Mode normal : valeur unique non colorée
        const valeur = afficherSom ? valeurSom : valeurPan;
        valeursHTML = `<span>${valeur}</span>`;
    }

    return `
        <div class="statistique-item">
            <span class="label-left">${label}</span>
            <span class="values-right">${valeursHTML}</span>
        </div>
    `;
}
```

#### `genererBadgePratiqueProfil(pratiqueUtilisee)`
**Fichier** : `js/profil-etudiant.js`

Badge simple pour le profil étudiant (pas de mode comparatif dans cette section).

```javascript
function genererBadgePratiqueProfil(pratiqueUtilisee) {
    const couleur = pratiqueUtilisee === 'SOM' ? 'var(--som-orange)' : 'var(--pan-bleu)';
    return `<span class="badge-pratique" style="color: ${couleur};">[${pratiqueUtilisee}]</span>`;
}
```

### Ordre de chargement des scripts

**CRITIQUE** : `portfolio.js` doit être chargé AVANT les modules d'affichage pour que `calculerEtStockerIndicesCP()` soit disponible.

```html
<!-- PRIORITÉ 3: Calcul des indices (AVANT affichage) -->
<script src="js/portfolio.js"></script>
<script src="js/saisie-presences.js"></script>

<!-- PRIORITÉ 4: Modules d'affichage (APRÈS calcul) -->
<script src="js/tableau-bord-apercu.js"></script>
<script src="js/profil-etudiant.js"></script>
```

### Gestion des événements (checkboxes en mode comparatif)

```javascript
// Écouteurs d'événements pour les checkboxes
document.getElementById('toggle-som')?.addEventListener('change', function() {
    if (!this.checked && !document.getElementById('toggle-pan').checked) {
        this.checked = true; // Empêche de tout décocher
        return;
    }
    // Recalculer et réafficher les statistiques
    chargerTableauBordApercu();
});

document.getElementById('toggle-pan')?.addEventListener('change', function() {
    if (!this.checked && !document.getElementById('toggle-som').checked) {
        this.checked = true; // Empêche de tout décocher
        return;
    }
    // Recalculer et réafficher les statistiques
    chargerTableauBordApercu();
});
```

### Style CSS des éléments

```css
/* Badge simple (mode normal) */
.badge-pratique {
    display: inline-block;
    padding: 2px 8px;
    margin-left: 10px;
    font-size: 0.9em;
    font-weight: 600;
    border-radius: 4px;
}

/* Checkboxes (mode comparatif) */
.pratique-checkboxes {
    display: inline-flex;
    gap: 15px;
    margin-left: 15px;
    align-items: center;
}

.pratique-checkboxes label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
}

/* Layout des cartes (label-left, values-right) */
.statistique-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}

.label-left {
    font-weight: 500;
}

.values-right {
    font-weight: 600;
    font-size: 1.1em;
}
```

---

## Historique des versions

### Version 2.0 (26 octobre 2025 - Beta 72)
- **Refonte complète** du système d'affichage SOM-PAN hybride
- **Mode normal** : Badge simple dans le titre, valeurs uniques en noir
- **Mode comparatif** : Checkboxes interactives, valeurs colorées orange/bleu
- **Configuration simplifiée** : Une seule checkbox "Activer le mode comparatif (expérimental)"
- **Nouvelles fonctions helper** : `genererCarteMetrique()`, `genererCarteRisque()`, `genererCartePattern()`, `genererCarteRaI()`
- **Variables CSS** : `--som-orange`, `--pan-bleu`, `--hybride-violet`
- **Layout unifié** : Label à gauche, valeurs colorées à droite
- **Suppression** : Badges redondants "Hybride" dans les sections
- **Validation** : Au moins une pratique doit rester affichée en mode comparatif

### Version 1.0 (24 octobre 2025)
- Implémentation initiale des indicateurs de pratique
- Système avec trois types de badges (SOM, PAN, Hybride)
- Deux checkboxes séparées (afficherSommatif, afficherAlternatif)
- Badges dans Tableau de bord - Aperçu (titre + 4 sections)
- Badge dans Profil étudiant (section Suivi de l'apprentissage)

### Prochaines versions prévues
- v2.1 : Extension du mode comparatif à Liste des étudiants
- v2.2 : Extension du mode comparatif à Évaluations - Aperçu et Liste
- v2.3 : Mode comparatif dans Profil étudiant (si pertinent)

---

## Références

- **CLAUDE.md** : Architecture globale du projet
- **structure-modulaire.txt** : Principe Single Source of Truth
- **noms_stables.json** : Registre des noms protégés
- **Documentation profil-etudiant.md** : Détails du module de profil
- **Documentation Style CSS.md** : Standards visuels

---

**Licence** : Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)
**Contact** : Labo Codex (https://codexnumeris.org/apropos)
