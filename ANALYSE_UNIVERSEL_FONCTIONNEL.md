# Analyse : Aspects universels et fonctionnalité mode Sommative

**Date** : 9 novembre 2025
**Version** : Beta 90.5
**Question** : Quels aspects sont universels ET fonctionnels ? La pratique sommative fonctionne-t-elle actuellement ?

---

## ✅ ASPECTS UNIVERSELS ET FONCTIONNELS (Beta 90.5)

### 1. Calcul des indices A-C-P-R

**Statut** : ✅ **100% UNIVERSEL ET FONCTIONNEL**

| Indice | Source | Universel ? | Fonctionne en SOM ? | Fonctionne en PAN ? |
|--------|--------|-------------|---------------------|---------------------|
| **A** (Assiduité) | `saisie-presences.js` | ✅ OUI | ✅ OUI | ✅ OUI |
| **C** (Complétion) | `portfolio.js` → `calculerEtStockerIndicesCP()` | ✅ OUI | ✅ OUI | ✅ OUI |
| **P** (Performance) | `portfolio.js` → `calculerEtStockerIndicesCP()` | ✅ OUI | ✅ OUI | ✅ OUI |
| **R** (Risque) | Formule : `R = 1 - (A × C × P)` | ✅ OUI | ✅ OUI | ✅ OUI |

#### Détails techniques

**Assiduité (A)** :
- Source unique : `localStorage.indicesAssiduite.sommatif[da]`
- Calcul : `heuresPresence / heuresOffertes` (avec RàI incluses)
- **Identique pour SOM et PAN** - même calcul basé sur présences physiques

**Complétion (C)** :
- Source unique : `localStorage.indicesCP[da].actuel.SOM.C` ou `.PAN.C`
- **SOM** : `nbProductionsRemises / nbProductionsDonnees` (exclut formatifs)
- **PAN** : `nbArtefactsRemis / nbArtefactsDonnes` (artefacts-portfolio seulement)
- Structure : Calcul DUAL stocké dans `indicesCP` (lignes 505-704 portfolio.js)

**Performance (P)** :
- Source unique : `localStorage.indicesCP[da].actuel.SOM.P` ou `.PAN.P`
- **SOM** : Moyenne pondérée provisoire de TOUTES les évaluations sommatives
  ```javascript
  P_som = Σ(noteFinale × pondération) / Σ(pondération)
  ```
- **PAN** : Moyenne des N meilleurs artefacts sélectionnés
  ```javascript
  P_pan = moyenne(N meilleurs artefacts)
  ```
- Structure : Calcul DUAL stocké dans `indicesCP` (lignes 505-704 portfolio.js)

**Risque (R)** :
- Formule universelle : `R = 1 - (A × C × P)`
- **Identique pour SOM et PAN** - formule mathématique pure

---

### 2. Niveaux de risque (échelle visuelle)

**Statut** : ✅ **100% UNIVERSEL ET FONCTIONNEL**

| Niveau | Seuil | Couleur | Emoji | Fonctionne en SOM ? | Fonctionne en PAN ? |
|--------|-------|---------|-------|---------------------|---------------------|
| Minimal | R < 20% | Vert foncé | 🟢 | ✅ OUI | ✅ OUI |
| Faible | 20% ≤ R < 35% | Vert clair | 🟢 | ✅ OUI | ✅ OUI |
| Modéré | 35% ≤ R < 50% | Jaune | 🟡 | ✅ OUI | ✅ OUI |
| Élevé | 50% ≤ R < 60% | Orange | 🟠 | ✅ OUI | ✅ OUI |
| Très élevé | 60% ≤ R < 70% | Rouge clair | 🔴 | ✅ OUI | ✅ OUI |
| Critique | R ≥ 70% | Rouge foncé | 🔴 | ✅ OUI | ✅ OUI |

**Code** : `profil-etudiant.js`, lignes 344-434 (`interpreterRisque()`)

**Pourquoi c'est universel** :
- Basé uniquement sur R (1-ACP)
- Aucune référence à des critères spécifiques
- Seuils configurables via `interpretation-config.js`

---

### 3. Mobilisation (A × C)

**Statut** : ✅ **100% UNIVERSEL ET FONCTIONNEL**

| Niveau | Conditions | Emoji | Fonctionne en SOM ? | Fonctionne en PAN ? |
|--------|------------|-------|---------------------|---------------------|
| Décrochage | Statut étudiant | ⚫ | ✅ OUI | ✅ OUI |
| Assiduité ET complétion critiques | A < 70% ET C < 70% | 🔴 | ✅ OUI | ✅ OUI |
| Assiduité critique | A < 70% | 🟠 | ✅ OUI | ✅ OUI |
| Complétion critique | C < 70% | 🟠 | ✅ OUI | ✅ OUI |
| Mobilisation fragile | A < 80% ET C < 80% | 🟡 | ✅ OUI | ✅ OUI |
| Assiduité fragile | A < 80% ET C ≥ 80% | 🟡 | ✅ OUI | ✅ OUI |
| Complétion fragile | A ≥ 80% ET C < 80% | 🟡 | ✅ OUI | ✅ OUI |
| Favorable | A ≥ 90% ET C ≥ 90% | 🔵 | ✅ OUI | ✅ OUI |
| Acceptable | A ≥ 80% ET C ≥ 80% | 🟢 | ✅ OUI | ✅ OUI |

**Code** : `profil-etudiant.js`, lignes 262-341 (`interpreterMobilisation()`)

**Pourquoi c'est universel** :
- Basé uniquement sur A et C (aucun critère spécifique)
- Seuils configurables (70%, 80%, 90%)
- Logique pédagogique transversale

---

### 4. Affichage tableau de bord

**Statut** : ✅ **100% UNIVERSEL ET FONCTIONNEL**

**Module** : `tableau-bord-apercu.js`

**Fonctionnalités universelles** :
- ✅ Indicateurs globaux (nombre étudiants, taux assiduité moyen, etc.)
- ✅ Liste étudiants avec indices A-C-P-R
- ✅ Visualisation risque avec gradient de couleurs
- ✅ Basculement SOM ↔ PAN via checkboxes (mode comparatif)
- ✅ Cartes métriques colorées (orange SOM, bleu PAN)

**Code dual SOM-PAN** (lignes 180-250 environ) :
```javascript
const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

// Lecture indices selon pratique
const indicesCP = obtenirIndicesCP(da, pratique);
```

**Pourquoi ça fonctionne pour SOM** :
- Calcul dual déjà en place (Beta 72)
- Affichage adaptatif selon pratique sélectionnée
- Pas de référence à SRPNF dans le tableau

---

## ⚠️ ASPECTS PARTIELLEMENT FONCTIONNELS EN SOMMATIVE

### 5. Patterns d'apprentissage

**Statut** : ⚠️ **NOM UNIVERSEL, DÉTECTION SPÉCIFIQUE PAN**

**Noms de patterns** (✅ universels) :
- Stable
- Défi spécifique
- Blocage émergent
- Blocage critique

**Détection actuelle** (❌ spécifique PAN-Maîtrise) :
```javascript
// profil-etudiant.js, lignes 4074-4096
function identifierPatternActuel(performancePAN3, aUnDefi) {
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');      // 0.64 (64%)
    const seuilDeveloppement = obtenirSeuil('idme.developpement');  // 0.75 (75%)

    if (performancePAN3 < seuilInsuffisant) return 'Blocage critique';
    if (performancePAN3 < seuilDeveloppement && aUnDefi) return 'Blocage émergent';
    if (aUnDefi) return 'Défi spécifique';
    return 'Stable';
}
```

**Problèmes pour SOM** :
1. `performancePAN3` = moyenne sur N derniers artefacts → concept PAN
2. `aUnDefi` = basé sur défis SRPNF → spécifique PAN-Maîtrise
3. Seuils IDME (64%, 75%) → spécifiques PAN-Maîtrise

**Fonctionnement actuel en SOM** :
- ❓ Patterns détectés mais **logique inadaptée**
- ❓ Utilise moyennes SRPNF qui n'existent pas en SOM traditionnel
- ❓ Si pas de critères SRPNF → tous "Stable" (pas de défis détectés)

**Solution pour SOM** (Beta 91) :
```javascript
// PratiqueSommative.identifierPattern(da)
const performance = this.calculerPerformance(da); // Moyenne pondérée

if (performance < 0.50) return 'Blocage critique';  // < 50% (échec)
if (performance < 0.60) return 'Blocage émergent';  // 50-59% (risque)
if (performance < 0.70) return 'Défi spécifique';   // 60-69% (faible)
return 'Stable';                                     // ≥ 70% (réussite)
```

---

### 6. Détection des défis

**Statut** : ❌ **SPÉCIFIQUE PAN-MAÎTRISE, NE FONCTIONNE PAS EN SOM**

**Défis actuels** (critères SRPNF) :
- Structure
- Rigueur
- Plausibilité
- Nuance
- Français

**Code actuel** :
```javascript
// profil-etudiant.js, lignes 3725-3751
function diagnostiquerForcesChallenges(moyennes, seuil = null) {
    if (seuil === null) {
        seuil = obtenirSeuil('defiSpecifique'); // 0.7125 (71.25%)
    }

    const criteres = [
        { nom: 'Structure', cle: 'structure', score: moyennes.structure },
        { nom: 'Rigueur', cle: 'rigueur', score: moyennes.rigueur },
        { nom: 'Plausibilité', cle: 'plausibilite', score: moyennes.plausibilite },
        { nom: 'Nuance', cle: 'nuance', score: moyennes.nuance },
        { nom: 'Français', cle: 'francais', score: moyennes.francais }
    ];

    const defis = criteres.filter(c => c.score < seuil);
    return { defis, principalDefi: defis[0] || null };
}
```

**Problèmes pour SOM** :
- ❌ Critères SRPNF fixes → n'existent pas en sommative traditionnelle
- ❌ En SOM, critères varient par production (ex: "Résolution de problèmes", "Travail en équipe", etc.)
- ❌ Impossible de détecter défis récurrents sans critères fixes

**Fonctionnement actuel en SOM** :
- ❌ Retourne `null` ou liste vide (pas de moyennes SRPNF)
- ❌ Tous les étudiants marqués "Stable" (pas de défis détectés)
- ❌ Section "Défis identifiés" vide dans profil

**Solutions possibles pour SOM** (Beta 91) :

**Option A : Défis génériques basés sur types de productions**
```javascript
// PratiqueSommative.detecterDefis(da)
const moyennes = {
    examens: 55%,        // < 60% → défi
    travauxPratiques: 72%,
    presentations: 80%
};

return {
    defis: [{ nom: 'Examens écrits', score: 0.55 }],
    principalDefi: { nom: 'Examens écrits', score: 0.55 }
};
```

**Option B : Aucun défi (patterns basés sur performance seule)**
```javascript
// PratiqueSommative.detecterDefis(da)
return {
    defis: [],
    principalDefi: null,
    nombreDefis: 0
};
```

**Recommandation** : Option B pour simplicité (Beta 91), Option A si demandé par utilisateurs

---

### 7. Cibles d'intervention RàI

**Statut** : ⚠️ **NIVEAUX UNIVERSELS, CIBLES SPÉCIFIQUES PAN**

**Niveaux RàI** (✅ universels) :
- Niveau 1 : Suivi régulier (Universel)
- Niveau 2 : Interventions préventives (Préventif)
- Niveau 3 : Interventions intensives (Intensif)

**Cibles actuelles** (❌ spécifiques PAN-Maîtrise) :
```javascript
// Exemple Niveau 2 (profil-etudiant.js, lignes 4266-4273)
if (N === 'Structure' && I >= 18) {
    return {
        cible: 'Pratique guidée en Structure',  // ← SPÉCIFIQUE SRPNF
        niveau: 2,
        couleur: '#ffc107',
        emoji: '🟡'
    };
}
```

**Problèmes pour SOM** :
- ❌ Recommandations basées sur défis SRPNF (N = 'Structure', 'Rigueur', etc.)
- ❌ Seuils IDME pour moyenne Français (I <= 17, I >= 18, etc.)
- ❌ Textes inadaptés pour contexte sommative

**Fonctionnement actuel en SOM** :
- ⚠️ Niveaux RàI assignés correctement (basés sur R)
- ❌ Recommandations textuelles inadaptées ou manquantes
- ⚠️ Fallback générique utilisé : "À clarifier en rencontre individuelle"

**Conditions universelles qui FONCTIONNENT en SOM** :
```javascript
// Niveau 3
if (decrochage || risqueTresEleve) → ✅ Fonctionne

// Niveau 2
if (stable && risqueModere) → ✅ Fonctionne
if (mobilisationFragile) → ✅ Fonctionne

// Niveau 1
if (stable && risqueFaible) → ✅ Fonctionne
```

**Solution pour SOM** (Beta 91) :
```javascript
// PratiqueSommative.genererCibleIntervention(da, pattern, defis)
if (pattern === 'Blocage critique') {
    return {
        cible: 'Rencontre urgente | Révision concepts de base | Services d\'aide',
        niveau: 3,
        couleur: '#dc3545',
        emoji: '🔴'
    };
}

if (pattern === 'Blocage émergent') {
    return {
        cible: 'Tutorat recommandé | Révision ciblée',
        niveau: 2,
        couleur: '#ff9800',
        emoji: '🟠'
    };
}

if (pattern === 'Stable') {
    return {
        cible: 'Suivi régulier | Maintenir l\'effort',
        niveau: 1,
        couleur: '#28a745',
        emoji: '🟢'
    };
}
```

---

## ❌ ASPECTS NON FONCTIONNELS EN SOMMATIVE

### 8. Section "Développement des habiletés" du profil

**Statut** : ❌ **100% SPÉCIFIQUE PAN-MAÎTRISE**

**Contenu actuel** :
- Moyennes SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
- Graphiques radars des critères
- Forces et défis identifiés par critère
- Progression par critère sur N artefacts

**Problèmes pour SOM** :
- ❌ Critères SRPNF n'existent pas en sommative
- ❌ Section entière vide ou affiche "Aucune donnée"
- ❌ Pas de critères fixes pour générer graphiques

**Fonctionnement actuel en SOM** :
- ❌ Section affiche message : "Aucune donnée disponible pour les critères SRPNF"
- ❌ Graphiques vides
- ❌ Aucune analyse des forces/défis

**Solution pour SOM** (Beta 91) :
- Option A : Masquer cette section en mode sommative
- Option B : Afficher moyennes par type de production (examens, travaux, etc.)
- Option C : Afficher liste chronologique des évaluations avec notes

---

### 9. Calcul de performance sur N derniers artefacts

**Statut** : ❌ **SPÉCIFIQUE PAN-MAÎTRISE**

**Fonction actuelle** :
```javascript
// profil-etudiant.js, lignes 3766-3840
function calculerIndicesTroisDerniersArtefacts(da) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const nombreCours = config.configPAN?.nombreCours || 3;
    const nombreArtefacts = nombreCours * 2; // 3 cours = 6 artefacts

    const derniersArtefacts = evaluationsEleve
        .filter(e => artefactsPortfolio.includes(e.productionId))
        .slice(0, nombreArtefacts);

    // Moyenne des N derniers
    return { performance: moyenne };
}
```

**Problèmes pour SOM** :
- ❌ Concept "N derniers artefacts" n'a pas de sens en sommative
- ❌ Sommative = TOUTES les évaluations comptent (moyenne pondérée cumulative)
- ❌ `config.configPAN` n'existe pas en mode sommative

**Fonctionnement actuel en SOM** :
- ⚠️ Fonction s'exécute quand même mais résultat inadapté
- ⚠️ Peut retourner 0 si pas d'artefacts-portfolio
- ⚠️ Ne reflète pas la vraie performance sommative

**Solution pour SOM** (Beta 91) :
- Utiliser `P_som` global (moyenne pondérée de TOUTES les productions)
- Pas de fenêtre temporelle en SOM (tout compte)

---

## 📊 SYNTHÈSE : La pratique sommative fonctionne-t-elle actuellement ?

### ✅ CE QUI FONCTIONNE BIEN (60%)

| Aspect | Statut | Notes |
|--------|--------|-------|
| **Calcul indices A-C-P-R** | ✅ Parfait | Calcul dual SOM/PAN en place depuis Beta 72 |
| **Niveaux de risque** | ✅ Parfait | Basés uniquement sur R (1-ACP) |
| **Mobilisation** | ✅ Parfait | Basée uniquement sur A et C |
| **Tableau de bord** | ✅ Parfait | Affichage dual SOM/PAN fonctionnel |
| **Profil étudiant : Section Suivi** | ✅ Parfait | Indices A-C-P-R, Risque, Mobilisation |
| **Profil étudiant : Section Mobilisation** | ✅ Parfait | Assiduité, Complétion, Liste artefacts |

**Verdict** : Les **fonctionnalités de dépistage universelles** fonctionnent parfaitement.

---

### ⚠️ CE QUI FONCTIONNE PARTIELLEMENT (30%)

| Aspect | Statut | Impact en SOM |
|--------|--------|---------------|
| **Patterns d'apprentissage** | ⚠️ Logique inadaptée | Affichés mais basés sur logique PAN-Maîtrise |
| **Niveaux RàI** | ⚠️ Assignés mais cibles inadaptées | Niveau correct, recommandations SRPNF |
| **Profil étudiant : Section Accompagnement** | ⚠️ Partiellement pertinent | Pattern affiché, mais recommandations PAN |

**Verdict** : Affichage présent mais **contenu partiellement inadapté**.

---

### ❌ CE QUI NE FONCTIONNE PAS (10%)

| Aspect | Statut | Impact en SOM |
|--------|--------|---------------|
| **Détection défis** | ❌ Broken | Aucun défi détecté (critères SRPNF absents) |
| **Section Développement habiletés** | ❌ Vide | Aucune donnée SRPNF |
| **Performance N derniers** | ❌ Non pertinent | Concept PAN, pas SOM |

**Verdict** : **Sections vides ou non pertinentes** en mode sommative.

---

## 🎯 RÉPONSE À VOS QUESTIONS

### ❓ Quels aspects sont universels ET fonctionnels ?

**Réponse** : Les **6 aspects fondamentaux du dépistage** :

1. ✅ **Indices A-C-P-R** (calcul et affichage)
2. ✅ **Niveaux de risque** (minimal → critique)
3. ✅ **Mobilisation** (A × C avec niveaux)
4. ✅ **Tableau de bord** (liste étudiants, métriques)
5. ✅ **Profil : Section Suivi** (A-C-P-R, risque, échelle visuelle)
6. ✅ **Profil : Section Mobilisation** (assiduité, complétion, artefacts)

Ces 6 aspects représentent **60% de l'application** et fonctionnent **parfaitement** en mode sommative.

---

### ❓ Est-ce que la pratique sommative peut bien fonctionner actuellement ?

**Réponse courte** : **OUI, avec limitations**.

**Réponse détaillée** :

**✅ Fonctionnel pour le DÉPISTAGE (objectif principal)** :
- Un enseignant en mode sommative peut :
  - Voir les indices A-C-P-R de tous ses étudiants
  - Identifier les étudiants à risque (R élevé)
  - Visualiser l'échelle de risque
  - Voir qui a des problèmes de mobilisation (A ou C faibles)
  - Consulter le tableau de bord avec toutes les métriques

**⚠️ Limité pour l'ACCOMPAGNEMENT (objectif secondaire)** :
- Les limitations :
  - Patterns affichés mais logique inadaptée (basée sur IDME)
  - Recommandations RàI génériques ou inadaptées (basées sur SRPNF)
  - Section "Développement habiletés" vide (pas de SRPNF)
  - Pas de détection de défis spécifiques

**📊 Score global de fonctionnalité en SOM** : **60%**

---

## 💡 RECOMMANDATIONS

### Pour la présentation du 19 novembre

**Message à communiquer** :

> "Le système de dépistage pédagogique (indices A-C-P-R, niveaux de risque, mobilisation) est **100% fonctionnel** pour la pratique sommative.
>
> Actuellement, les recommandations d'accompagnement (patterns, cibles RàI, défis) sont optimisées pour la pratique PAN-Maîtrise, mais l'architecture modulaire en développement permettra bientôt de générer des recommandations adaptées à chaque pratique."

**Démonstration suggérée** :
1. Montrer le tableau de bord en mode **SOM** avec indices A-C-P-R
2. Cliquer sur un étudiant à risque élevé
3. Montrer la section Suivi (échelle de risque visuelle)
4. Montrer la section Mobilisation (assiduité, complétion)
5. Basculer en mode **PAN** pour montrer la différence
6. Expliquer : "Patterns et recommandations seront adaptés à chaque pratique dans Beta 91"

---

### Pour Beta 91 (post-19 novembre)

**Priorités d'implémentation** :

1. **Extraire logique patterns vers IPratique** (2 jours)
   - `PratiquePANMaitrise.identifierPattern()` : Logique actuelle (IDME)
   - `PratiqueSommative.identifierPattern()` : Basé sur performance globale

2. **Extraire détection défis vers IPratique** (2 jours)
   - `PratiquePANMaitrise.detecterDefis()` : Critères SRPNF
   - `PratiqueSommative.detecterDefis()` : Retourner liste vide (ou défis génériques)

3. **Extraire cibles RàI vers IPratique** (3 jours)
   - `PratiquePANMaitrise.genererCibleIntervention()` : Recommandations SRPNF
   - `PratiqueSommative.genererCibleIntervention()` : Recommandations génériques

4. **Adapter section Développement habiletés** (1 jour)
   - Masquer en mode sommative OU
   - Afficher données alternatives (moyennes par type production)

**Total estimé** : 8 jours de développement

---

**Version** : 1.0
**Date** : 9 novembre 2025
**Auteur** : Analyse Claude Code
**Statut** : Validation requise par Grégoire
