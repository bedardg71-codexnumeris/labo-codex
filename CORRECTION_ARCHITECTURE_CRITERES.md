# CORRECTION MAJEURE : Architecture des critères d'évaluation

**Date** : 9 novembre 2025
**Contexte** : Clarification importante de Grégoire sur les critères SRPNF

---

## ❌ ERREUR DE COMPRÉHENSION INITIALE

### Ce que j'avais compris (FAUX)

```
PAN-Maîtrise = Échelle IDME + Critères SRPNF fixes
                ↓
Tous les profs PAN-Maîtrise utilisent SRPNF
```

**Conséquence** : Architecture qui hardcode SRPNF dans la classe `PratiquePANMaitrise`

---

## ✅ RÉALITÉ CORRIGÉE

### Ce qui est vrai

**Grégoire (littérature)** :
- ✅ Pratique PAN-Maîtrise (échelle IDME)
- ✅ Critères SRPNF **FIXES pour tout le trimestre**
- ✅ Tous les artefacts évalués avec les mêmes 5 critères
- ⚠️ **C'est une pratique TRÈS RARE**

**Autres enseignants PAN-Maîtrise** :
- ✅ Pratique PAN-Maîtrise (échelle IDME)
- ❌ PAS de critères SRPNF
- ✅ Critères **VARIABLES selon les productions**
- ✅ **C'est la majorité des cas**

**Enseignants sommative** :
- ❌ PAS d'échelle IDME
- ❌ PAS de critères fixes
- ✅ Critères **VARIABLES selon les productions**
- ✅ **Très commun**

---

## 🎯 DISTINCTION FONDAMENTALE

### Ce qui définit VRAIMENT PAN-Maîtrise

**PAN-Maîtrise** = 3 caractéristiques :

1. ✅ **Échelle de performance IDME** (Insuffisant, Développement, Maîtrisé, Étendu)
   - Taxonomie SOLO
   - Seuils : < 64%, 65-74%, 75-84%, ≥85%

2. ✅ **Sélection des N meilleurs artefacts** pour note finale
   - Pas moyenne de tout
   - Encourage la progression

3. ✅ **Philosophie de maîtrise** : Ce qui compte = niveau atteint à la fin
   - Pas pénalisation pour erreurs initiales
   - Valorisation de l'apprentissage

**CE QUI N'EST PAS dans la définition** :
- ❌ Critères fixes (SRPNF ou autres)
- ❌ Critères spécifiques à une discipline
- ❌ Nombre fixe de critères

---

### Ce qui est SPÉCIFIQUE à Grégoire (littérature)

**Pratique de Grégoire** = PAN-Maîtrise + SRPNF fixes

- ✅ Échelle IDME (PAN-Maîtrise)
- ✅ N meilleurs artefacts (PAN-Maîtrise)
- ➕ **Critères SRPNF fixes** (SPÉCIFIQUE Grégoire)
- ➕ **Détection défis récurrents** (POSSIBLE car critères fixes)
- ➕ **Cibles RàI basées sur critères** (POSSIBLE car critères fixes)

**Pourquoi c'est rare** :
- La plupart des disciplines ne peuvent pas avoir critères fixes
- En sciences : critères varient (résolution problèmes, démarche expérimentale, calculs, etc.)
- En arts : critères varient (composition, technique, créativité selon le projet)
- **Littérature de Grégoire** : Structure, Rigueur, Plausibilité, Nuance, Français s'appliquent à TOUS les textes analytiques

---

## 🔧 IMPLICATIONS POUR L'ARCHITECTURE

### ❌ Architecture ACTUELLE (incorrecte)

```javascript
class PratiquePANMaitrise {
    detecterDefis(da) {
        // ERREUR : Hardcode SRPNF
        const moyennes = calculerMoyennesCriteresRecents(da);
        const criteres = ['Structure', 'Rigueur', 'Plausibilité', 'Nuance', 'Français'];
        // ...
    }
}
```

**Problème** : Suppose que TOUS les profs PAN-Maîtrise ont critères SRPNF → FAUX

---

### ✅ Architecture CORRIGÉE (Beta 91)

```javascript
class PratiquePANMaitrise {
    constructor(configCriteres = null) {
        this.nom = 'PAN-Maîtrise';
        this.id = 'pan-maitrise';

        // NOUVEAU : Critères configurables
        this.criteresFixes = configCriteres || null;
        this.aCriteresFixes = (configCriteres !== null);
    }

    detecterDefis(da) {
        // Si critères fixes configurés → détection possible
        if (this.aCriteresFixes) {
            return this.detecterDefisAvecCriteresFixes(da);
        }

        // Sinon → détection basée sur performance seule
        return this.detecterDefisBasiques(da);
    }

    detecterDefisAvecCriteresFixes(da) {
        // Logique actuelle (SRPNF ou autres critères fixes)
        const moyennes = this.calculerMoyennesCriteres(da);
        const defis = [];

        this.criteresFixes.forEach(critere => {
            if (moyennes[critere.nom] < critere.seuilDefi) {
                defis.push({
                    nom: critere.nom,
                    score: moyennes[critere.nom]
                });
            }
        });

        return {
            defis: defis,
            principalDefi: defis[0] || null,
            nombreDefis: defis.length
        };
    }

    detecterDefisBasiques(da) {
        // Détection basée sur performance globale uniquement
        const performance = this.calculerPerformance(da);

        if (performance < 0.64) {
            return {
                defis: [{ nom: 'Performance globale insuffisante', score: performance }],
                principalDefi: { nom: 'Performance globale insuffisante', score: performance },
                nombreDefis: 1
            };
        }

        return {
            defis: [],
            principalDefi: null,
            nombreDefis: 0
        };
    }
}
```

---

### Configuration des critères fixes

**Dans localStorage.modalitesEvaluation** :

```javascript
{
    pratique: 'alternative',

    configPAN: {
        nombreCours: 3,         // 3, 7, ou 12 cours
        nombreARetenir: 3,      // N meilleurs artefacts

        // NOUVEAU : Critères fixes (optionnel)
        criteresFixes: [
            { nom: 'Structure', poids: 15, seuilDefi: 0.70 },
            { nom: 'Rigueur', poids: 20, seuilDefi: 0.70 },
            { nom: 'Plausibilité', poids: 10, seuilDefi: 0.70 },
            { nom: 'Nuance', poids: 25, seuilDefi: 0.70 },
            { nom: 'Français', poids: 30, seuilDefi: 0.70 }
        ]
    }
}
```

**Si `criteresFixes` est `null` ou absent** :
- Pas de détection de défis par critère
- Détection basée sur performance globale seulement
- Patterns basés sur IDME et performance

---

## 📊 MATRICE : Qui peut détecter quels défis ?

| Pratique | Critères | Défis détectables | Exemple |
|----------|----------|-------------------|---------|
| **Grégoire (PAN-Maîtrise + SRPNF)** | Fixes | ✅ Défis par critère (Rigueur, Structure, etc.) | "Défi en Rigueur (65%)" |
| **Prof maths (PAN-Maîtrise)** | Variables | ⚠️ Défis génériques | "Performance insuffisante (62%)" |
| **Prof arts (PAN-Maîtrise)** | Variables | ⚠️ Défis génériques | "Performance en développement (68%)" |
| **Prof sciences (Sommative)** | Variables | ⚠️ Défis génériques ou par type | "Examens faibles (55%)" |

**Légende** :
- ✅ Défis par critère : Détection précise de défis récurrents sur critères nommés
- ⚠️ Défis génériques : Détection basée sur performance globale ou types de productions

---

## 💡 SOLUTIONS POUR CHAQUE CAS

### Cas 1 : Grégoire (PAN + critères SRPNF fixes)

**Ce qui fonctionne actuellement** : ✅ TOUT
- Détection défis SRPNF
- Patterns basés sur IDME + défis
- Cibles RàI basées sur critères
- Section "Développement habiletés" complète

**Aucun changement requis** pour Beta 90.5 (19 nov)

---

### Cas 2 : Prof PAN-Maîtrise sans critères fixes

**Exemple** : Prof de maths avec productions variées

**Ce qui fonctionne** :
- ✅ Indices A-C-P-R (universel)
- ✅ Échelle IDME (PAN-Maîtrise)
- ✅ N meilleurs artefacts (PAN-Maîtrise)
- ✅ Niveaux de risque (universel)

**Ce qui ne fonctionne PAS** :
- ❌ Détection défis par critère (critères variables)
- ❌ Section "Développement habiletés" (pas de critères fixes)

**Solution Beta 91** :
- Patterns basés sur IDME + performance globale
- Défis génériques : "Performance insuffisante", "Performance en développement"
- Cibles RàI basées sur niveau IDME : "Révision concepts de base", "Pratique supplémentaire"
- Section "Développement habiletés" masquée OU liste chronologique des évaluations

---

### Cas 3 : Prof Sommative

**Exemple** : Prof de sciences avec critères variables

**Ce qui fonctionne** :
- ✅ Indices A-C-P-R (universel)
- ✅ Niveaux de risque (universel)
- ✅ Moyenne pondérée provisoire (sommative)

**Ce qui ne fonctionne PAS** :
- ❌ Échelle IDME (pas sommative)
- ❌ Détection défis par critère (critères variables)
- ❌ Patterns basés sur IDME
- ❌ Section "Développement habiletés"

**Solution Beta 91** :
- Patterns basés sur performance globale : < 50% = Blocage critique, 50-59% = Blocage émergent, etc.
- Défis par type de production : "Examens faibles", "Travaux pratiques faibles" (optionnel)
- Cibles RàI basées sur performance : "Rencontre urgente | Tutorat", "Révision ciblée"
- Section "Développement habiletés" masquée OU moyennes par type de production

---

## 🎯 POUR LA PRÉSENTATION DU 19 NOVEMBRE

### Message corrigé à communiquer

**❌ Ne PAS dire** :
> "La PAN-Maîtrise utilise les critères SRPNF"

**✅ Dire plutôt** :
> "Je pratique la PAN-Maîtrise avec l'échelle IDME. Dans mon cours de littérature, j'utilise des critères fixes (SRPNF) pour tous les artefacts, ce qui me permet de détecter les défis récurrents de mes étudiants.
>
> Cette approche fonctionne bien en littérature car les mêmes critères (Structure, Rigueur, Plausibilité, Nuance, Français) s'appliquent à tous les textes analytiques.
>
> D'autres disciplines avec des critères variables peuvent utiliser le système de dépistage universel (A-C-P-R, risque, mobilisation) sans nécessairement avoir de critères fixes."

---

### Démonstration suggérée

**Mettre en avant** :
1. **Universel** : Indices A-C-P-R, niveaux de risque (fonctionne pour tous)
2. **PAN-Maîtrise** : Échelle IDME, N meilleurs artefacts (votre pratique)
3. **Spécifique littérature** : Critères SRPNF fixes, détection défis (votre bonus)

**Insister sur** :
- Flexibilité du système
- Adaptation à différentes pratiques
- SRPNF n'est pas obligatoire pour bénéficier du dépistage

---

## 🚀 ARCHITECTURE RÉVISÉE POUR BETA 91

### Hiérarchie des pratiques

```
IPratique (interface)
│
├─ PratiquePANMaitrise
│  ├─ Avec critères fixes (Grégoire littérature)
│  │  → Détection défis par critère
│  │  → Section "Développement habiletés" complète
│  │
│  └─ Sans critères fixes (autres profs PAN)
│     → Détection défis basiques (performance globale)
│     → Section "Développement habiletés" masquée
│
├─ PratiqueSommative
│  ├─ Avec types de productions (optionnel)
│  │  → Défis par type : "Examens", "Travaux", etc.
│  │
│  └─ Basique
│     → Défis génériques (performance globale)
│
└─ PratiquePANSpecifications
   └─ Défis basés sur spécifications non satisfaites
```

---

### Configuration flexible

```javascript
// Grégoire (PAN + SRPNF fixes)
{
    pratique: 'alternative',
    configPAN: {
        nombreCours: 3,
        criteresFixes: [
            { nom: 'Structure', poids: 15, seuilDefi: 0.70 },
            { nom: 'Rigueur', poids: 20, seuilDefi: 0.70 },
            { nom: 'Plausibilité', poids: 10, seuilDefi: 0.70 },
            { nom: 'Nuance', poids: 25, seuilDefi: 0.70 },
            { nom: 'Français', poids: 30, seuilDefi: 0.70 }
        ]
    }
}

// Prof maths (PAN sans critères fixes)
{
    pratique: 'alternative',
    configPAN: {
        nombreCours: 7,
        criteresFixes: null  // ← Pas de critères fixes
    }
}

// Prof sciences (Sommative)
{
    pratique: 'sommative',
    configSOM: {
        typesProdDefis: ['examens', 'travaux', 'laboratoires']  // Optionnel
    }
}
```

---

## 📝 CORRECTIONS À APPORTER AUX DOCUMENTS

### ARCHITECTURE_PRATIQUES.md

**Section à corriger** : "Spécificités PAN-Maîtrise (Grégoire)"

**Ancien texte** :
```markdown
- **Critères d'évaluation** : SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
```

**Nouveau texte** :
```markdown
- **Critères d'évaluation** : Variables selon l'enseignant
  - Grégoire (littérature) : SRPNF fixes (Structure, Rigueur, Plausibilité, Nuance, Français)
  - Autres disciplines : Critères variables selon productions
- **Détection des défis** : Possible SEULEMENT si critères fixes configurés
```

---

### GUIDE_AJOUT_PRATIQUE.md

**Ajouter section** : "Critères fixes vs variables"

```markdown
## Critères d'évaluation : Fixes vs Variables

### Critères fixes (rare)

**Quand utiliser** :
- Vous utilisez les MÊMES critères pour TOUTES les productions du trimestre
- Ex: Littérature (SRPNF pour tous les textes analytiques)
- Ex: Écriture créative (Style, Originalité, Cohérence pour toutes les nouvelles)

**Avantages** :
- Détection précise des défis récurrents par critère
- Analyse longitudinale par critère
- Section "Développement habiletés" complète

**Configuration** :
```javascript
configPAN: {
    criteresFixes: [
        { nom: 'Critère 1', poids: 20, seuilDefi: 0.70 },
        { nom: 'Critère 2', poids: 30, seuilDefi: 0.70 },
        // ...
    ]
}
```

---

### Critères variables (commun)

**Quand utiliser** :
- Critères changent selon les productions
- Ex: Maths (résolution problèmes, calculs, démarche selon le type de problème)
- Ex: Sciences (démarche expérimentale, analyse, calculs selon le labo)

**Détection des défis** :
- Basée sur performance globale IDME
- Défis génériques : "Performance insuffisante (< 64%)"

**Configuration** :
```javascript
configPAN: {
    criteresFixes: null  // Pas de critères fixes
}
```
```

---

## ✅ CONCLUSION

### Réalité corrigée

1. **PAN-Maîtrise** = Échelle IDME + N meilleurs artefacts
2. **SRPNF** = Spécifique à Grégoire (littérature)
3. **Critères fixes** = Rare (permet défis par critère)
4. **Critères variables** = Commun (défis génériques seulement)

### Architecture flexible requise

- ✅ Supporter PAN-Maîtrise avec ET sans critères fixes
- ✅ Supporter Sommative avec critères variables
- ✅ Permettre configuration optionnelle des critères fixes
- ✅ Adapter affichage selon configuration (masquer sections non pertinentes)

### Pour Beta 90.5 (19 nov)

- ✅ Fonctionne parfaitement pour Grégoire (PAN + SRPNF)
- ⚠️ Clarifier dans présentation que SRPNF est spécifique littérature
- ⚠️ Insister sur universalité du dépistage A-C-P-R

### Pour Beta 91 (post-19 nov)

- 🔧 Rendre critères configurables (fixes ou variables)
- 🔧 Adapter détection défis selon configuration
- 🔧 Masquer/adapter section "Développement habiletés"
- 🔧 Implémenter défis génériques pour critères variables

---

**Version** : 1.0
**Date** : 9 novembre 2025
**Auteur** : Correction suite clarification Grégoire
**Impact** : MAJEUR - Architecture à réviser pour Beta 91
