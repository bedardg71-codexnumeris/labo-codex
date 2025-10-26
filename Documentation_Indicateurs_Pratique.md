# Guide utilisateur : Indicateurs de pratique d'évaluation

**Version** : 1.0
**Date** : 26 octobre 2025
**Module** : Système de monitorage SOM-PAN hybride

---

## Vue d'ensemble

Les **indicateurs de pratique** sont des badges visuels qui identifient la source des données affichées dans l'application. Ils permettent de distinguer instantanément si les métriques, diagnostics et analyses proviennent de la pratique :

- **SOM** (Sommative traditionnelle - moyenne pondérée)
- **PAN** (Pratique Alternative de Notation - portfolio)
- **Hybride** (affichage comparatif des deux pratiques)

---

## Pourquoi ces indicateurs sont essentiels

Dans une application qui supporte **deux systèmes d'évaluation simultanés**, il est critique que l'utilisateur sache à tout moment quelle pratique génère les données affichées. Les décisions pédagogiques (interventions, RàI, diagnostics) dépendent directement de cette information.

### Exemple de confusion évitée

Sans indicateur, un enseignant pourrait :
- Voir un risque d'échec de 85% et croire qu'il s'agit de la pratique PAN, alors qu'il s'agit de SOM
- Comparer des indices C/P entre deux vues différentes sans réaliser qu'ils proviennent de pratiques différentes
- Interpréter les patterns d'apprentissage selon le mauvais cadre de référence

---

## Types d'indicateurs et leur signification

### 1. Badge principal (Vue d'ensemble)

Apparaît dans le titre principal des sections pour indiquer le **mode de fonctionnement global**.

#### Badge "Mode Hybride (SOM + PAN)"
- **Couleur** : Violet (`#9c27b0`)
- **Signification** : L'application affiche les données des DEUX pratiques simultanément
- **Usage** : Comparaison expérimentale pour analyser les différences entre les approches
- **Configuration** : `affichageTableauBord.afficherSommatif = true` ET `affichageTableauBord.afficherAlternatif = true`

```
Vue d'ensemble [Mode Hybride (SOM + PAN)]
```

#### Badge "Sommative traditionnelle (SOM)"
- **Couleur** : Orange (`#ff6f00`)
- **Signification** : Seules les données SOM sont affichées
- **Calcul** : Moyenne pondérée provisoire des évaluations
- **Configuration** : `pratique = 'sommative'` OU uniquement `affichageTableauBord.afficherSommatif = true`

```
Vue d'ensemble [Sommative traditionnelle (SOM)]
```

#### Badge "Alternative - PAN Maîtrise" (ou Spécifications/Dénotation)
- **Couleur** : Bleu (`#0277bd`)
- **Signification** : Seules les données PAN sont affichées
- **Calcul** : Sélection des N meilleurs artefacts selon le type PAN
- **Configuration** : `pratique = 'alternative'` avec `typePAN` spécifié

```
Vue d'ensemble [Alternative - PAN Maîtrise]
```

---

### 2. Badges de section (Source de données)

Apparaissent dans les **titres de chaque section** pour identifier la provenance des métriques affichées.

#### Badge "Hybride"
- **Couleur** : Violet (`#9c27b0`)
- **Signification** : Cette section affiche les données des deux pratiques côte à côte
- **Exemple** : Cartes d'indicateurs globaux avec "C (SOM): 75% | C (PAN): 82%"

```
Indicateurs globaux du groupe [Hybride]
```

#### Badge "Source : SOM"
- **Couleur** : Orange (`#ff6f00`)
- **Signification** : Cette section affiche uniquement les données calculées selon la pratique sommative
- **Exemple** : Risque d'échec basé sur les moyennes pondérées

```
Risque d'échec [Source : SOM]
```

#### Badge "Source : PAN"
- **Couleur** : Bleu (`#0277bd`)
- **Signification** : Cette section affiche uniquement les données calculées selon la pratique alternative
- **Exemple** : Patterns d'apprentissage basés sur les meilleurs artefacts

```
Répartition des patterns d'apprentissage [Source : PAN]
```

---

## Emplacements des indicateurs

### Tableau de bord - Aperçu

**Badge principal** : Titre "Vue d'ensemble"
- Indique le mode de fonctionnement global (Hybride/SOM/PAN)

**Badges de section** :
1. **Indicateurs globaux du groupe** : Badge "Hybride" uniquement en mode comparatif
2. **Risque d'échec** : Badge "Source : SOM/PAN/Hybride"
3. **Répartition des patterns d'apprentissage** : Badge "Source : SOM/PAN/Hybride"
4. **Système de Réponse à l'intervention (RàI)** : Badge "Source : SOM/PAN/Hybride"

### Profil étudiant

**Badge de section** : Titre "Suivi de l'apprentissage"
- Affiche "SOM" ou "PAN" selon la pratique active pour cet étudiant
- Permet d'identifier rapidement quelle pratique génère les indices R (Risque) et RàI

```
Suivi de l'apprentissage [PAN]
```

### Liste des étudiants *(à venir)*

**Badge d'en-tête de tableau**
- Identifie la pratique utilisée pour les colonnes C, P et Risque

### Évaluations - Aperçu *(à venir)*

**Badge de titre**
- Précise quelle pratique est utilisée pour les statistiques affichées

### Évaluations - Liste *(à venir)*

**Badge de titre**
- Indique la pratique de référence pour la liste d'évaluations

---

## Configuration des indicateurs

Les indicateurs se génèrent automatiquement selon la configuration stockée dans `localStorage.modalitesEvaluation` :

```javascript
{
  "pratique": "sommative",           // ou "alternative"
  "typePAN": "maitrise",             // ou "specifications", "denotation"
  "affichageTableauBord": {
    "afficherSommatif": true,
    "afficherAlternatif": false
  }
}
```

### Scénarios de configuration

#### Scénario 1 : Pratique SOM pure
```javascript
{
  "pratique": "sommative",
  "affichageTableauBord": {
    "afficherSommatif": true,
    "afficherAlternatif": false
  }
}
```
**Résultat** : Badge "Sommative traditionnelle (SOM)" + badges "Source : SOM"

#### Scénario 2 : Pratique PAN pure (Maîtrise)
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
**Résultat** : Badge "Alternative - PAN Maîtrise" + badges "Source : PAN"

#### Scénario 3 : Mode Hybride (comparaison expérimentale)
```javascript
{
  "pratique": "alternative",         // Pratique "officielle"
  "typePAN": "denotation",
  "affichageTableauBord": {
    "afficherSommatif": true,       // Afficher SOM pour comparaison
    "afficherAlternatif": true       // Afficher PAN
  }
}
```
**Résultat** : Badge "Mode Hybride (SOM + PAN)" + badges "Hybride"

---

## Interprétation pédagogique

### En mode Hybride

Les indicateurs permettent de **comparer empiriquement** les deux pratiques :

- **Indices C (Complétion)** : Souvent similaires entre SOM et PAN
- **Indices P (Performance)** : Peuvent diverger significativement
  - SOM : Reflète la moyenne de TOUS les travaux
  - PAN : Reflète les MEILLEURS artefacts (trajectoire de progression)

**Exemple** :
```
Étudiant X
├─ C (SOM): 85% | C (PAN): 87%  ← Légère différence
└─ P (SOM): 62% | P (PAN): 78%  ← Divergence importante !
```

**Interprétation** : L'étudiant a produit des travaux très inégaux. SOM pénalise les travaux faibles initiaux, PAN valorise la progression vers la maîtrise.

### En mode PAN pur

Les badges "Source : PAN" rappellent que :
- Les indices reflètent une **trajectoire de développement**
- La sélection des N meilleurs artefacts simule le principe de l'évaluation cumulative
- Le risque d'échec est basé sur la **capacité actuelle**, pas la moyenne historique

### En mode SOM pur

Les badges "Source : SOM" indiquent que :
- Les indices reflètent une **moyenne pondérée provisoire**
- Chaque évaluation impacte la moyenne selon son poids relatif
- Le risque d'échec est basé sur la **performance moyenne**, incluant les échecs antérieurs

---

## Questions fréquentes

### Q1 : Pourquoi le badge affiche "Hybride" mais certaines sections affichent "Source : SOM" ?

**R** : Cela ne devrait pas arriver. Si le badge principal affiche "Mode Hybride", TOUTES les sections devraient afficher le badge "Hybride". Si ce n'est pas le cas, vérifier la configuration dans `modalitesEvaluation`.

### Q2 : Le badge change-t-il automatiquement si je modifie mes réglages ?

**R** : Oui, les badges se génèrent dynamiquement à chaque chargement de page selon la configuration actuelle dans localStorage.

### Q3 : Puis-je cacher les badges ?

**R** : Non, les badges sont **essentiels** pour éviter les erreurs d'interprétation des données. Ils font partie intégrante de l'interface en mode SOM-PAN hybride.

### Q4 : Quelle pratique devrais-je utiliser pour mes interventions pédagogiques ?

**R** : Cela dépend de votre philosophie pédagogique :
- **SOM** : Si vous croyez que la moyenne des performances reflète mieux la compétence actuelle
- **PAN** : Si vous croyez que les meilleures performances reflètent mieux le potentiel et la maîtrise émergente
- **Hybride** : Pour comparer les deux approches et affiner votre jugement professionnel

---

## Détails techniques (pour développeurs)

### Fonctions de génération des badges

#### `genererBadgePratique()`
**Fichier** : `js/tableau-bord-apercu.js` (lignes 35-77)

```javascript
function genererBadgePratique() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratique = config.pratique || 'alternative';
    const typePAN = config.typePAN || 'maitrise';
    const affichage = config.affichageTableauBord || {};

    let texte = '';
    let couleur = '';
    let description = '';

    if (affichage.afficherSommatif && affichage.afficherAlternatif) {
        texte = 'Mode Hybride (SOM + PAN)';
        couleur = '#9c27b0'; // Violet
        description = 'Comparaison expérimentale des deux pratiques';
    } else if (pratique === 'sommative') {
        texte = 'Sommative traditionnelle (SOM)';
        couleur = '#ff6f00'; // Orange
        description = 'Moyenne pondérée provisoire';
    } else {
        const typesPAN = {
            'maitrise': 'PAN Maîtrise',
            'specifications': 'PAN Spécifications',
            'denotation': 'PAN Dénotation'
        };
        texte = `Alternative - ${typesPAN[typePAN] || 'PAN'}`;
        couleur = '#0277bd'; // Bleu
        description = 'N meilleurs artefacts';
    }

    return `<span style="...CSS inline...">${texte}</span>`;
}
```

#### `genererBadgeSourceDonnees()`
**Fichier** : `js/tableau-bord-apercu.js` (lignes 84-118)

```javascript
function genererBadgeSourceDonnees() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const affichage = config.affichageTableauBord || {};

    let texte = '';
    let couleur = '';

    if (affichage.afficherSommatif && affichage.afficherAlternatif) {
        texte = 'Hybride';
        couleur = '#9c27b0';
    } else if (affichage.afficherSommatif) {
        texte = 'Source : SOM';
        couleur = '#ff6f00';
    } else {
        texte = 'Source : PAN';
        couleur = '#0277bd';
    }

    return `<span style="...CSS inline...">${texte}</span>`;
}
```

#### `genererBadgePratiqueProfil(pratiqueUtilisee)`
**Fichier** : `js/profil-etudiant.js` (lignes 84-104)

```javascript
function genererBadgePratiqueProfil(pratiqueUtilisee) {
    let texte = pratiqueUtilisee; // 'SOM' ou 'PAN'
    let couleur = pratiqueUtilisee === 'SOM' ? '#ff6f00' : '#0277bd';

    return `<span style="...CSS inline...">${texte}</span>`;
}
```

### Injection des badges dans le DOM

Les badges sont injectés dynamiquement lors du chargement des modules :

```javascript
// Tableau de bord - Aperçu (js/tableau-bord-apercu.js, lignes 174-207)
function chargerTableauBordApercu() {
    // ... génération du contenu ...

    // 🏷️ Badge principal
    const titre = document.querySelector('#tableau-bord-apercu h2');
    if (titre) {
        titre.innerHTML = `Vue d'ensemble ${genererBadgePratique()}`;
    }

    // 🏷️ Badges de section
    const badgeSource = genererBadgeSourceDonnees();
    const h3Elements = document.querySelectorAll('#tableau-bord-apercu .carte h3');
    h3Elements.forEach(h3 => {
        const span = h3.querySelector('span');
        if (span && span.textContent.includes("Risque d'échec")) {
            span.innerHTML = `Risque d'échec ${badgeSource}`;
        }
        // ... autres sections ...
    });
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

### Style CSS des badges

Les badges utilisent du CSS inline pour garantir la cohérence visuelle :

```css
/* Badge principal (grand format) */
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4px 12px;
background: [couleur]15;        /* 15 = opacité 9% */
border: 1.5px solid [couleur];
border-radius: 20px;
font-size: 0.85rem;
font-weight: 600;
color: [couleur];
margin-left: 12px;

/* Badge de section (format compact) */
display: inline-block;
padding: 3px 10px;
background: [couleur]15;
border: 1px solid [couleur];
border-radius: 12px;
font-size: 0.75rem;
font-weight: 700;
color: [couleur];
margin-left: 8px;
vertical-align: middle;
```

---

## Historique des versions

### Version 1.0 (26 octobre 2025)
- Implémentation initiale des indicateurs de pratique
- Badges dans Tableau de bord - Aperçu (titre + 4 sections)
- Badge dans Profil étudiant (section Suivi de l'apprentissage)
- Documentation utilisateur complète

### Prochaines versions prévues
- v1.1 : Badges dans Liste des étudiants
- v1.2 : Badges dans Évaluations - Aperçu et Liste
- v1.3 : Automatisation des statistiques Matériel - Aperçu

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
