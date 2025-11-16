# Analyse des niveaux RàI - Universel vs Spécifique

**Date** : 9 novembre 2025
**Contexte** : Déterminer si les niveaux RàI 2 et 3 peuvent fonctionner dans d'autres pratiques que PAN-Maîtrise

---

## 🔍 Logique actuelle (profil-etudiant.js, lignes 4104-4415)

### Variables utilisées pour la décision

| Variable | Nom | Source | Universel/Spécifique |
|----------|-----|--------|---------------------|
| **E** | Mobilisation | `interpreterMobilisation(A, C)` | ✅ **UNIVERSEL** |
| **F/G** | Risque | `interpreterRisque(R)` où R = 1-ACP | ✅ **UNIVERSEL** |
| **M** | Pattern | `identifierPatternActuel(performance, aUnDefi)` | ⚠️ **NOM universel, DÉTECTION spécifique** |
| **N** | Défi principal | `diagnostic.principalDefi.nom` | ❌ **SPÉCIFIQUE PAN-Maîtrise** (SRPNF) |
| **I** | Moyenne Français | `indices3Derniers.francaisMoyen` | ❌ **SPÉCIFIQUE PAN-Maîtrise** |

---

## 🎯 Niveau 3 (Intensif) - Conditions

### ✅ Conditions UNIVERSELLES

| Condition | Logique | Applicable à toutes les pratiques ? |
|-----------|---------|-------------------------------------|
| **Décrochage** | `E === 'Décrochage'` | ✅ OUI - Assiduité + Complétion critiques |
| **Risque très élevé** | `F.includes('très élevé')` | ✅ OUI - Risque R (1-ACP) ≥ 70% |

**Impact** : 🟢 Ces conditions fonctionnent pour TOUTES les pratiques (SOM, PAN-Maîtrise, PAN-Specs, etc.)

---

### ❌ Conditions SPÉCIFIQUES PAN-Maîtrise

| Condition | Logique | Pourquoi spécifique ? |
|-----------|---------|----------------------|
| **Blocage critique + Défi Français** | `M === 'Blocage critique' && N === 'Français' && I <= 17` | Critère "Français" n'existe que dans SRPNF |
| **Blocage critique + Défi Structure** | `M === 'Blocage critique' && N === 'Structure' && I <= 17` | Critère "Structure" n'existe que dans SRPNF |
| **Blocage critique + Défi Rigueur** | `M === 'Blocage critique' && N === 'Rigueur' && I <= 17` | Critère "Rigueur" n'existe que dans SRPNF |

**Impact** : 🔴 Ces conditions NE FONCTIONNENT PAS pour d'autres pratiques
- En Sommative : Pas de critères SRPNF fixes
- En PAN-Spécifications : Défis basés sur spécifications, pas sur SRPNF

---

## 🎯 Niveau 2 (Préventif) - Conditions

### ✅ Conditions UNIVERSELLES

| Condition | Logique | Applicable à toutes les pratiques ? |
|-----------|---------|-------------------------------------|
| **Stable + Risque élevé** | `M === 'Stable' && R >= seuilRisqueModere` | ✅ OUI - Plateau problématique |
| **Stable + Risque modéré** | `M === 'Stable' && R >= seuilRisqueFaible` | ✅ OUI - Attention requise |
| **Mobilisation fragile/critique** | `E.includes('fragile') \|\| E.includes('critique')` | ✅ OUI - Risque démotivation |

**Impact** : 🟢 Ces conditions fonctionnent pour TOUTES les pratiques

---

### ❌ Conditions SPÉCIFIQUES PAN-Maîtrise

| Condition | Logique | Pourquoi spécifique ? |
|-----------|---------|----------------------|
| **Blocage émergent + Défi SRPNF** | `M === 'Blocage émergent' && N === 'Structure/Rigueur/...' && I >= 18 && I <= 27` | Critères SRPNF + seuils IDME |
| **Défi spécifique + Défi SRPNF** | `M === 'Défi spécifique' && N === 'Français/Structure/...' && seuils 17/18/21/27%` | Critères SRPNF + seuils IDME |

**Impact** : 🔴 Ces conditions utilisent des seuils et critères spécifiques à PAN-Maîtrise

---

## 🎯 Niveau 1 (Universel) - Conditions

### ✅ Conditions UNIVERSELLES

| Condition | Logique | Applicable à toutes les pratiques ? |
|-----------|---------|-------------------------------------|
| **Stable + Performance satisfaisante** | `M === 'Stable' && N === 'Aucun'` | ✅ OUI - Suivi régulier |

**Impact** : 🟢 Condition de base fonctionne pour TOUTES les pratiques

---

### ⚠️ Conditions PARTIELLEMENT SPÉCIFIQUES

| Condition | Logique | Pourquoi partiellement spécifique ? |
|-----------|---------|-------------------------------------|
| **Stable + Défis mineurs** | `M === 'Stable' && N === 'Structure/Rigueur/...' && I >= 21` | Utilise critères SRPNF mais logique transposable |

**Impact** : 🟡 Concept universel (encourager exploration), critères spécifiques (SRPNF)

---

## 📊 Synthèse : Qu'est-ce qui est universel vs spécifique ?

### ✅ UNIVERSEL (fonctionne pour toutes les pratiques)

**Entrées utilisées** :
- Assiduité (A)
- Complétion (C)
- Performance (P) - valeur numérique 0-1
- Risque (R = 1-ACP)
- Pattern (NOM seulement : Stable, Défi spécifique, Blocage émergent, Blocage critique)

**Conditions de niveau RàI** :
- **Niveau 3** : Décrochage, Risque très élevé
- **Niveau 2** : Stable + Risque modéré/élevé, Mobilisation fragile/critique
- **Niveau 1** : Stable + Aucun défi + Risque faible

**Pourcentage de la logique** : ~40% des conditions sont universelles

---

### ❌ SPÉCIFIQUE PAN-Maîtrise (ne fonctionne pas ailleurs)

**Entrées utilisées** :
- Critères SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
- Seuils IDME (17%, 18%, 21%, 25%, 27%)
- Moyenne d'un critère spécifique (I = Français)
- Défi principal basé sur SRPNF

**Conditions de niveau RàI** :
- **Niveau 3** : Blocage critique + Défi SRPNF spécifique + Seuil IDME
- **Niveau 2** : Blocage émergent/Défi spécifique + Défi SRPNF + Seuils IDME

**Pourcentage de la logique** : ~60% des conditions sont spécifiques PAN-Maîtrise

---

## 🔧 Comment rendre cela universel ?

### Stratégie : Interface `IPratique.genererCibleIntervention()`

Chaque pratique devrait implémenter sa propre logique de génération des cibles RàI.

#### Exemple : PAN-Maîtrise

```javascript
genererCibleIntervention(da, pattern, defis) {
    const moyennes = this.calculerMoyennesCriteresRecents(da);
    const defiPrincipal = defis.principalDefi;
    const francaisMoyen = moyennes.Francais * 100;

    // Niveau 3 : Blocage critique + Défi SRPNF grave
    if (pattern === 'Blocage critique' && defiPrincipal) {
        if (defiPrincipal.nom === 'Français' && francaisMoyen <= 17) {
            return {
                cible: 'Rencontre individuelle | CAF | Dépistage SA',
                niveau: 3,
                couleur: '#dc3545',
                emoji: '🔴'
            };
        }
        // ... autres critères SRPNF
    }

    // Niveau 2 : Défi spécifique + Seuils IDME
    if (pattern === 'Défi spécifique' && defiPrincipal) {
        if (defiPrincipal.nom === 'Rigueur' && francaisMoyen >= 18) {
            return {
                cible: 'Pratique guidée en Rigueur',
                niveau: 2,
                couleur: '#ffc107',
                emoji: '🟡'
            };
        }
        // ... autres critères SRPNF
    }

    // Niveau 1 : Stable
    if (pattern === 'Stable') {
        return {
            cible: 'Suivi régulier | Performance stable',
            niveau: 1,
            couleur: '#28a745',
            emoji: '🟢'
        };
    }

    // Fallback
    return { cible: 'À clarifier', niveau: 1, couleur: '#666', emoji: '💬' };
}
```

---

#### Exemple : Sommative traditionnelle

```javascript
genererCibleIntervention(da, pattern, defis) {
    const indices = this.calculerIndices(da);
    const performance = indices.P;

    // Niveau 3 : Blocage critique (échec imminent)
    if (pattern === 'Blocage critique') {
        return {
            cible: 'Rencontre urgente | Révision concepts de base | Services d\'aide',
            niveau: 3,
            couleur: '#dc3545',
            emoji: '🔴'
        };
    }

    // Niveau 2 : Blocage émergent ou Défi spécifique
    if (pattern === 'Blocage émergent' || pattern === 'Défi spécifique') {
        if (performance < 0.60) {
            return {
                cible: 'Tutorat recommandé | Révision ciblée',
                niveau: 2,
                couleur: '#ff9800',
                emoji: '🟠'
            };
        } else {
            return {
                cible: 'Encourager pratique supplémentaire',
                niveau: 2,
                couleur: '#ffc107',
                emoji: '🟡'
            };
        }
    }

    // Niveau 1 : Stable
    if (pattern === 'Stable') {
        return {
            cible: 'Suivi régulier | Maintenir l\'effort',
            niveau: 1,
            couleur: '#28a745',
            emoji: '🟢'
        };
    }

    return { cible: 'À clarifier', niveau: 1, couleur: '#666', emoji: '💬' };
}
```

---

#### Exemple : PAN-Spécifications

```javascript
genererCibleIntervention(da, pattern, defis) {
    const specNonSatisfaites = defis.defis; // Liste de spécifications échouées

    // Niveau 3 : Blocage critique (> 50% specs échouées)
    if (pattern === 'Blocage critique') {
        return {
            cible: 'Rencontre individuelle | Révision complète des objectifs',
            niveau: 3,
            couleur: '#dc3545',
            emoji: '🔴'
        };
    }

    // Niveau 2 : Défi spécifique (specs récurrentes non satisfaites)
    if (pattern === 'Défi spécifique' && specNonSatisfaites.length > 0) {
        const specPrincipale = specNonSatisfaites[0].nom;
        return {
            cible: `Remédiation ciblée : ${specPrincipale}`,
            niveau: 2,
            couleur: '#ffc107',
            emoji: '🟡'
        };
    }

    // Niveau 1 : Stable
    if (pattern === 'Stable') {
        return {
            cible: 'Suivi régulier | Objectifs satisfaits',
            niveau: 1,
            couleur: '#28a745',
            emoji: '🟢'
        };
    }

    return { cible: 'À clarifier', niveau: 1, couleur: '#666', emoji: '💬' };
}
```

---

## 💡 Recommandation

### ✅ GARDER dans le code universel (profil-etudiant.js)

**Conditions basiques basées uniquement sur** :
- Décrochage (mobilisation)
- Risque très élevé (R ≥ 70%)
- Stable + Risque modéré/élevé
- Mobilisation fragile/critique

**Code simplifié** :
```javascript
function determinerNiveauRaIUniversel(da) {
    const indices = calculerTousLesIndices(da);
    const mobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100);
    const risque = interpreterRisque(indices.R);

    // Niveau 3 universel
    if (mobilisation.niveau === 'Décrochage') return 3;
    if (risque.niveau.includes('très élevé')) return 3;

    // Niveau 2 universel
    if (risque.niveau.includes('élevé') || risque.niveau.includes('modéré')) return 2;
    if (mobilisation.niveau.includes('fragile') || mobilisation.niveau.includes('critique')) return 2;

    // Niveau 1 par défaut
    return 1;
}
```

---

### ✅ DÉLÉGUER à chaque pratique

**Génération des cibles d'intervention spécifiques** via `IPratique.genererCibleIntervention()` :
- Recommandations textuelles précises
- Utilisation de défis spécifiques à la pratique
- Seuils et critères propres à la pratique
- Ressources et stratégies d'intervention contextualisées

---

## 🎯 Conclusion

### ❓ Question initiale : Les niveaux RàI 2 et 3 sont-ils possibles dans d'autres pratiques ?

**Réponse** : **OUI, MAIS...**

✅ **Les NIVEAUX RàI (1-2-3) sont UNIVERSELS** :
- Basés sur le risque R (1-ACP)
- Basés sur la mobilisation (A et C)
- Fonctionnent pour toutes les pratiques

❌ **Les CIBLES D'INTERVENTION sont SPÉCIFIQUES** :
- Actuellement hardcodées pour PAN-Maîtrise (SRPNF)
- Doivent être générées par chaque pratique
- Nécessitent l'architecture modulaire (Beta 91)

---

### 🚀 Plan d'action

**Pour le 19 novembre (Beta 90.5)** :
- ✅ Garder logique actuelle (fonctionne pour PAN-Maîtrise)
- ✅ Documenter clairement les parties spécifiques
- ✅ Présenter comme "système RàI universel avec cibles PAN-Maîtrise"

**Post-19 novembre (Beta 91)** :
- 🔧 Extraire logique universelle dans code principal
- 🔧 Déplacer cibles spécifiques vers `PratiquePANMaitrise.genererCibleIntervention()`
- 🔧 Implémenter `PratiqueSommative.genererCibleIntervention()`
- 🔧 Tester cohérence entre pratiques

---

**Version** : 1.0
**Date** : 9 novembre 2025
**Auteur** : Analyse Claude Code
**Statut** : Validation requise par Grégoire
