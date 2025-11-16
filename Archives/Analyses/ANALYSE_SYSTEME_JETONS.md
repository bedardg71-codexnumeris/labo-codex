# Analyse : Système de jetons - Universel et configurable

**Date** : 9 novembre 2025
**Contexte** : Le système de jetons peut être implémenté dans toutes les pratiques PAN
**Observation de Grégoire** : "Il suffit de déterminer le nombre et la fonction (délai, reprise...)"

---

## ✅ CE QUI EST DÉJÀ UNIVERSEL ET FONCTIONNEL

### 1. Mécanisme technique des jetons

**Fichier** : `evaluation-jetons.js` (330 lignes)

**Statut** : ✅ **100% UNIVERSEL ET MODULAIRE**

Le système est déjà complètement découplé de toute pratique spécifique :

| Aspect | Implémentation | Universel ? |
|--------|----------------|-------------|
| **Jeton délai** | Propriétés ajoutées à l'évaluation | ✅ OUI |
| **Jeton reprise** | Création nouvelle évaluation + lien | ✅ OUI |
| **Archivage** | Marquage évaluation originale | ✅ OUI |
| **Recalcul indices** | Automatique après application | ✅ OUI |

---

### 2. Types de jetons implémentés

#### Jeton de délai (lignes 21-130)

**Fonction** : Prolonger l'échéance d'une évaluation

**Propriétés ajoutées** :
```javascript
{
    jetonDelaiApplique: true,
    dateApplicationJetonDelai: "2025-11-09T10:30:00.000Z",
    delaiAccorde: true
}
```

**Effet** :
- Marque l'évaluation comme ayant un délai accordé
- Pas de calcul d'échéance automatique (à implémenter)
- Aucune référence à IDME, SRPNF ou autre critère spécifique

**Universalité** : ✅ Fonctionne avec PAN-Maîtrise, PAN-Spécifications, Sommative, toutes pratiques

---

#### Jeton de reprise (lignes 144-317)

**Fonction** : Permettre de refaire une évaluation, remplace l'ancienne

**Propriétés ajoutées** :
```javascript
// Nouvelle évaluation (reprise)
{
    id: "EVAL_1731153600000",
    repriseDeId: "EVAL_1730980800000",  // Lien vers originale
    jetonRepriseApplique: true,
    dateApplicationJetonReprise: "2025-11-09T10:30:00.000Z"
}

// Évaluation originale (archivée)
{
    id: "EVAL_1730980800000",
    remplaceeParId: "EVAL_1731153600000",  // Lien vers reprise
    archivee: true,
    dateArchivage: "2025-11-09T10:30:00.000Z",
    dateRemplacement: "2025-11-09T10:30:00.000Z"
}
```

**Effet** :
- Crée une copie de l'évaluation originale
- Archive ou supprime l'originale (choix utilisateur)
- La nouvelle évaluation remplace l'ancienne dans les calculs
- Liens bidirectionnels pour traçabilité

**Universalité** : ✅ Fonctionne avec toutes pratiques (remplace une note par une autre)

**Logique de remplacement** (lignes 564-615 portfolio.js) :
```javascript
const evaluationsSOM = evaluations.filter(e =>
    e.etudiantDA === da &&
    productionsSOMDonnees.has(e.productionId) &&
    !e.remplaceeParId &&  // ← Exclut les évaluations remplacées par reprise
    e.statutIntegrite !== 'plagiat' &&
    e.statutIntegrite !== 'ia'
);
```

**Universel** : Fonctionne dans calcul SOM ET PAN

---

### 3. Gestion de l'archivage

**Choix utilisateur** (lignes 171-182) :
```javascript
if (archiverOriginale) {
    // Option 1: Archiver (garde historique)
    evaluations[indexOriginal].archivee = true;
} else {
    // Option 2: Supprimer (nettoie historique)
    evaluations.splice(indexOriginal, 1);
}
```

**Universalité** : ✅ Choix pédagogique indépendant de la pratique

---

## ⚠️ CE QUI N'EST PAS ENCORE CONFIGURABLE

### 1. Nombre de jetons disponibles

**Situation actuelle** : Hardcodé à 2/2

**Fichier** : `profil-etudiant.js`, ligne 3294
```javascript
<strong>Jetons disponibles :</strong> 2 / 2
```

**Problème** :
- ❌ Pas de configuration dans `localStorage.modalitesEvaluation`
- ❌ Pas de compteur réel (jetons utilisés vs disponibles)
- ❌ Pas de différenciation délai vs reprise

---

### 2. Règles d'utilisation des jetons

**Situations à configurer** :

| Règle | Actuellement | Devrait être configurable |
|-------|--------------|---------------------------|
| **Nombre jetons délai** | Hardcodé 2 | Configuration par pratique |
| **Nombre jetons reprise** | Hardcodé 2 | Configuration par pratique |
| **Jetons par trimestre ou par production** | Non défini | Choix enseignant |
| **Délai maximal accordé** | Non calculé | Ex: +7 jours, +14 jours |
| **Reprises limitées par production** | Non limité | Ex: 1 reprise max par production |
| **Jetons transférables** | Non | Ex: Délai → Reprise si non utilisé |

---

### 3. Calcul automatique des échéances

**Jeton délai actuellement** :
- ✅ Marque l'évaluation comme ayant un délai
- ❌ Ne calcule PAS la nouvelle échéance automatiquement
- ❌ Pas d'affichage de la date limite prolongée

**Ce qui devrait exister** :
```javascript
{
    jetonDelaiApplique: true,
    dateApplicationJetonDelai: "2025-11-09T10:30:00.000Z",
    delaiAccorde: true,
    delaiJours: 7,  // ← NOUVEAU : Durée du délai
    echeanceOriginale: "2025-11-08",  // ← NOUVEAU
    echeanceProlongee: "2025-11-15"   // ← NOUVEAU : +7 jours
}
```

---

## 🎯 ARCHITECTURE PROPOSÉE POUR BETA 91

### Configuration des jetons dans modalitesEvaluation

```javascript
{
    pratique: 'alternative',  // ou 'sommative'

    // ========== JETONS (UNIVERSEL pour toutes pratiques) ==========
    configJetons: {
        actif: true,  // Activer/désactiver le système

        // Types de jetons disponibles
        typesDisponibles: ['delai', 'reprise'],

        // Jetons de délai
        jetonsDelai: {
            nombre: 2,           // Nombre de jetons par trimestre
            dureeJours: 7,       // Durée du délai accordé
            parProduction: false // false = par trimestre, true = par production
        },

        // Jetons de reprise
        jetonsReprise: {
            nombre: 2,           // Nombre de jetons par trimestre
            maxParProduction: 1, // Max 1 reprise par production
            archiverOriginale: true  // true = archiver, false = supprimer
        },

        // Règles avancées (optionnel)
        regles: {
            transferables: false,     // Délai non utilisé → Reprise ?
            cumulative: false,        // Jetons non utilisés reportés au prochain trimestre ?
            prerequisAssiduité: null  // Ex: Assiduité ≥ 80% requise pour jetons
        }
    },

    // ========== CONFIG PAN (spécifique PAN-Maîtrise) ==========
    configPAN: {
        nombreCours: 3,
        criteresFixes: [ /* ... */ ]
    },

    // ========== CONFIG SOM (spécifique Sommative) ==========
    configSOM: {
        typesProdDefis: ['examens', 'travaux']
    }
}
```

---

### Fonctions à créer

#### 1. Compteur de jetons utilisés

```javascript
/**
 * Compte les jetons utilisés par un étudiant
 * @param {string} da - Numéro DA
 * @param {string} type - 'delai' ou 'reprise'
 * @returns {number} Nombre de jetons utilisés
 */
function compterJetonsUtilises(da, type) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');

    if (type === 'delai') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonDelaiApplique === true
        ).length;
    }

    if (type === 'reprise') {
        return evaluations.filter(e =>
            e.etudiantDA === da &&
            e.jetonRepriseApplique === true
        ).length;
    }

    return 0;
}
```

---

#### 2. Vérification disponibilité jetons

```javascript
/**
 * Vérifie si un étudiant peut utiliser un jeton
 * @param {string} da - Numéro DA
 * @param {string} type - 'delai' ou 'reprise'
 * @returns {Object} { disponible: boolean, utilises: number, total: number, raison: string }
 */
function verifierDisponibiliteJeton(da, type) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const configJetons = config.configJetons;

    if (!configJetons || !configJetons.actif) {
        return {
            disponible: false,
            utilises: 0,
            total: 0,
            raison: 'Système de jetons désactivé'
        };
    }

    const utilises = compterJetonsUtilises(da, type);
    const total = type === 'delai'
        ? configJetons.jetonsDelai.nombre
        : configJetons.jetonsReprise.nombre;

    if (utilises >= total) {
        return {
            disponible: false,
            utilises: utilises,
            total: total,
            raison: `Tous les jetons ${type} utilisés (${utilises}/${total})`
        };
    }

    // Vérifier règles avancées (assiduité minimale, etc.)
    if (configJetons.regles?.prerequisAssiduité) {
        const indices = calculerTousLesIndices(da);
        if (indices.A < configJetons.regles.prerequisAssiduité * 100) {
            return {
                disponible: false,
                utilises: utilises,
                total: total,
                raison: `Assiduité insuffisante (${indices.A}% < ${configJetons.regles.prerequisAssiduité * 100}%)`
            };
        }
    }

    return {
        disponible: true,
        utilises: utilises,
        total: total,
        raison: `Jetons disponibles : ${total - utilises} restants`
    };
}
```

---

#### 3. Calcul automatique échéance prolongée

```javascript
/**
 * Calcule la nouvelle échéance après application jeton délai
 * @param {string} evaluationId - ID de l'évaluation
 * @returns {Object} { echeanceOriginale, echeanceProlongee, delaiJours }
 */
function calculerEcheanceProlongee(evaluationId) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const delaiJours = config.configJetons?.jetonsDelai?.dureeJours || 7;

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) return null;

    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const production = productions.find(p => p.id === evaluation.productionId);

    if (!production || !production.dateRemise) {
        return {
            echeanceOriginale: null,
            echeanceProlongee: null,
            delaiJours: delaiJours
        };
    }

    const dateOriginale = new Date(production.dateRemise);
    const dateProlongee = new Date(dateOriginale);
    dateProlongee.setDate(dateProlongee.getDate() + delaiJours);

    return {
        echeanceOriginale: production.dateRemise,
        echeanceProlongee: dateProlongee.toISOString().split('T')[0],
        delaiJours: delaiJours
    };
}
```

---

#### 4. Mise à jour appliquerJetonDelai()

```javascript
function appliquerJetonDelai(evaluationId) {
    // ... code existant ...

    // NOUVEAU : Calculer échéances
    const echéances = calculerEcheanceProlongee(evaluationId);

    // Appliquer le jeton avec nouvelles propriétés
    evaluation.jetonDelaiApplique = true;
    evaluation.dateApplicationJetonDelai = new Date().toISOString();
    evaluation.delaiAccorde = true;

    // NOUVEAU : Ajouter échéances
    if (echéances) {
        evaluation.delaiJours = echéances.delaiJours;
        evaluation.echeanceOriginale = echéances.echeanceOriginale;
        evaluation.echeanceProlongee = echéances.echeanceProlongee;
    }

    // ... reste du code ...
}
```

---

### Affichage dans profil étudiant

**Remplacer** (ligne 3294) :
```javascript
<strong>Jetons disponibles :</strong> 2 / 2
```

**Par** :
```javascript
function afficherCompteurJetons(da) {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const configJetons = config.configJetons;

    if (!configJetons || !configJetons.actif) {
        return '<p class="text-muted"><em>Système de jetons désactivé</em></p>';
    }

    const disponibiliteDelai = verifierDisponibiliteJeton(da, 'delai');
    const disponibiliteReprise = verifierDisponibiliteJeton(da, 'reprise');

    return `
        <div class="jetons-compteur">
            <div class="jeton-type">
                <strong>Jetons délai :</strong>
                <span class="badge ${disponibiliteDelai.disponible ? 'bg-success' : 'bg-secondary'}">
                    ${disponibiliteDelai.total - disponibiliteDelai.utilises} / ${disponibiliteDelai.total}
                </span>
            </div>
            <div class="jeton-type">
                <strong>Jetons reprise :</strong>
                <span class="badge ${disponibiliteReprise.disponible ? 'bg-success' : 'bg-secondary'}">
                    ${disponibiliteReprise.total - disponibiliteReprise.utilises} / ${disponibiliteReprise.total}
                </span>
            </div>
        </div>
    `;
}
```

---

## 📊 COMPATIBILITÉ PAR PRATIQUE

### PAN-Maîtrise

**Jetons délai** : ✅ Parfaitement compatible
- Prolonger échéance d'un artefact
- Philosophie de maîtrise : laisser le temps nécessaire
- Commun en PAN

**Jetons reprise** : ✅ Parfaitement compatible
- Refaire un artefact pour améliorer la maîtrise
- Philosophie centrale de la PAN : ce qui compte = niveau atteint
- Très commun en PAN

**Configuration typique PAN-Maîtrise** :
```javascript
configJetons: {
    actif: true,
    jetonsDelai: { nombre: 2, dureeJours: 7 },
    jetonsReprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
}
```

---

### PAN-Spécifications

**Jetons délai** : ✅ Compatible
- Prolonger échéance pour atteindre spécifications
- Utile si étudiant proche de satisfaire

**Jetons reprise** : ✅ Très compatible
- Refaire pour satisfaire spécifications non atteintes
- Logique pass/fail encourage reprises
- Peut-être plus de reprises que PAN-Maîtrise

**Configuration typique PAN-Spécifications** :
```javascript
configJetons: {
    actif: true,
    jetonsDelai: { nombre: 1, dureeJours: 5 },
    jetonsReprise: { nombre: 3, maxParProduction: 2, archiverOriginale: false }
}
```

---

### Sommative traditionnelle

**Jetons délai** : ⚠️ Moins commun mais possible
- Dépend de la politique enseignant
- Certains acceptent retards avec pénalité réduite
- Peut être utilisé pour circonstances exceptionnelles

**Jetons reprise** : ❌ Généralement incompatible
- Philosophie sommative : chaque évaluation compte
- Reprises rare en sommative (sauf examens de reprise officiels)
- Peut créer iniquité perçue

**Configuration typique Sommative** :
```javascript
configJetons: {
    actif: false  // Généralement désactivé en sommative
}

// OU si activé (rare)
configJetons: {
    actif: true,
    jetonsDelai: { nombre: 1, dureeJours: 3 },
    jetonsReprise: { nombre: 0 }  // Pas de reprises
}
```

---

## 💡 RECOMMANDATIONS

### Pour Beta 90.5 (19 novembre)

**Fonctionnalités actuelles** :
- ✅ Jetons délai : Fonctionnel
- ✅ Jetons reprise : Fonctionnel
- ⚠️ Compteur : Hardcodé 2/2 (pas critique pour démo)
- ❌ Configuration : Pas encore implémentée

**Message pour présentation** :
> "Le système de jetons (délai et reprise) est déjà implémenté et universel. Il fonctionne avec toute pratique PAN.
>
> Actuellement, chaque étudiant a 2 jetons de chaque type. La configuration du nombre et des règles sera ajoutée dans Beta 91 pour permettre à chaque enseignant d'adapter selon sa pratique."

**Démonstration** :
1. Montrer application jeton délai sur une évaluation
2. Montrer application jeton reprise
3. Montrer que l'ancienne évaluation est archivée
4. Montrer que les indices sont recalculés automatiquement

---

### Pour Beta 91 (post-19 novembre)

**Priorités d'implémentation** :

1. **Configuration jetons** (1 jour)
   - Ajouter `configJetons` dans `modalitesEvaluation`
   - Interface de configuration dans Réglages
   - Valeurs par défaut selon pratique

2. **Compteur dynamique** (1 jour)
   - Fonction `compterJetonsUtilises()`
   - Fonction `verifierDisponibiliteJeton()`
   - Affichage dans profil étudiant

3. **Calcul échéances** (0.5 jour)
   - Fonction `calculerEcheanceProlongee()`
   - Mise à jour `appliquerJetonDelai()`
   - Affichage date limite prolongée

4. **Règles avancées** (1 jour)
   - Max reprises par production
   - Prérequis assiduité
   - Jetons par production vs par trimestre

**Total estimé** : 3.5 jours de développement

---

## ✅ CONCLUSION

### Réponse à l'observation de Grégoire

**Question** : "Le système de jetons peut sans doute être implémenté dans d'autres PAN que la mienne. Il suffit de déterminer le nombre et la fonction (délai, reprise...)."

**Réponse** : ✅ **ABSOLUMENT CORRECT**

Le système de jetons est **déjà 100% universel** techniquement :
- Mécanisme découplé de toute pratique spécifique
- Fonctionne avec PAN-Maîtrise, PAN-Spécifications, et même Sommative (si souhaité)
- Aucune référence à IDME, SRPNF ou autres critères spécifiques

**Ce qui manque** (Beta 91) :
- Configuration du nombre de jetons
- Configuration des règles d'utilisation
- Compteur dynamique (jetons utilisés/disponibles)
- Calcul automatique des échéances prolongées

**Universalité** : 🟢 **ÉLEVÉE**
- PAN-Maîtrise : ✅✅✅ Très adapté
- PAN-Spécifications : ✅✅✅ Très adapté
- Sommative : ⚠️ Délai oui, Reprise rare

---

**Version** : 1.0
**Date** : 9 novembre 2025
**Auteur** : Analyse suite observation Grégoire
**Impact** : Confirmation universalité jetons + roadmap configuration Beta 91
