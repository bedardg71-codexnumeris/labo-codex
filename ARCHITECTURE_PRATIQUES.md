# Architecture du système de pratiques de notation

**Document de référence - Version 1.0 (9 novembre 2025)**

---

## 📌 Vue d'ensemble

Ce document définit l'architecture permettant de supporter **plusieurs pratiques de notation** dans le système de monitorage pédagogique, tout en préservant les fonctionnalités universelles (dépistage A-C-P-R, niveaux RàI).

### Objectifs

1. **Découpler** le code des pratiques spécifiques
2. **Permettre** l'ajout de nouvelles pratiques sans toucher au code existant
3. **Préserver** les fonctionnalités universelles (A-C-P-R, RàI) pour toutes les pratiques
4. **Faciliter** la collaboration entre enseignants ayant des pratiques différentes

---

## 🎯 Problème actuel (Beta 90)

### Code couplé à PAN-Maîtrise

Tout le code de détection des patterns et défis est **hardcodé** pour la pratique PAN-Maîtrise de Grégoire :

- **Échelle IDME** hardcodée (seuils 64%, 75%, 85%)
- **Critères SRPNF** hardcodés (Structure, Rigueur, Plausibilité, Nuance, Français)
- **N derniers artefacts** hardcodé à 3 (devrait lire config)
- **Fonctions non réutilisables** pour d'autres pratiques

### Conséquences

❌ Impossible d'ajouter une pratique sommative sans réécrire le code
❌ Collaborateurs ne peuvent pas brancher leurs pratiques PAN
❌ Maintenance difficile (logique métier dispersée)
❌ Tests impossibles (tout couplé)

---

## 🏗️ Architecture proposée

### Principes fondamentaux

1. **Séparation universelle / spécifique**
   - Ce qui est **universel** : A-C-P-R, niveaux de risque, niveaux RàI
   - Ce qui est **spécifique** : Comment calculer P, comment détecter défis, quelles cibles RàI

2. **Interface de pratique**
   - Chaque pratique implémente le même contrat
   - Le système utilise l'interface, pas l'implémentation directe

3. **Registre de pratiques**
   - Détection automatique de la pratique active
   - Chargement dynamique du bon module

### Structure des fichiers

```
js/
├── pratiques/
│   ├── pratique-interface.js          # Documentation du contrat
│   ├── pratique-registry.js           # Registre et sélection
│   ├── pratique-pan-maitrise.js       # PAN-Maîtrise (Grégoire)
│   ├── pratique-sommative.js          # Sommative traditionnelle
│   ├── pratique-pan-specifications.js # PAN-Spécifications (futur)
│   └── pratique-denotation.js         # Dénotation/Ungrading (futur)
│
└── profil-etudiant.js                 # Utilise l'interface
```

---

## 📋 Contrat d'interface `IPratique`

Chaque pratique **DOIT** implémenter ces méthodes :

### Identité

```javascript
/**
 * Retourne le nom de la pratique
 * @returns {string} - Ex: "PAN-Maîtrise", "Sommative", "PAN-Spécifications"
 */
obtenirNom()

/**
 * Retourne une description courte
 * @returns {string} - Ex: "Notation basée sur la maîtrise des standards (IDME)"
 */
obtenirDescription()

/**
 * Retourne l'identifiant unique
 * @returns {string} - Ex: "pan-maitrise", "sommative", "pan-specifications"
 */
obtenirId()
```

### Calculs de performance

```javascript
/**
 * Calcule l'indice de performance (P) pour un étudiant
 * @param {string} da - Numéro DA
 * @returns {number} - Indice entre 0 et 1
 */
calculerPerformance(da)

/**
 * Calcule l'indice de complétion (C) pour un étudiant
 * @param {string} da - Numéro DA
 * @returns {number} - Indice entre 0 et 1
 */
calculerCompletion(da)
```

### Détection des défis

```javascript
/**
 * Détecte les défis spécifiques selon la pratique
 * @param {string} da - Numéro DA
 * @returns {Object} - {
 *   defis: [
 *     { nom: string, score: number (0-1), description: string }
 *   ],
 *   principalDefi: { nom: string, score: number } | null,
 *   nombreDefis: number
 * }
 */
detecterDefis(da)
```

### Identification des patterns

```javascript
/**
 * Identifie le pattern d'apprentissage selon la pratique
 * @param {string} da - Numéro DA
 * @returns {Object} - {
 *   pattern: 'Stable' | 'Défi spécifique' | 'Blocage émergent' | 'Blocage critique',
 *   raison: string,
 *   details: object
 * }
 */
identifierPattern(da)
```

### Cibles d'intervention

```javascript
/**
 * Génère la cible d'intervention RàI selon la pratique
 * @param {string} da - Numéro DA
 * @param {string} pattern - Pattern détecté
 * @param {Object} defis - Défis détectés
 * @returns {Object} - {
 *   cible: string,
 *   description: string,
 *   niveau: 1 | 2 | 3,
 *   couleur: string,
 *   emoji: string
 * }
 */
genererCibleIntervention(da, pattern, defis)
```

### Configuration

```javascript
/**
 * Retourne les paramètres configurables de la pratique
 * @returns {Object} - Configuration spécifique
 */
obtenirParametres()

/**
 * Valide si la pratique peut fonctionner avec les données actuelles
 * @returns {Object} - {
 *   valide: boolean,
 *   erreurs: [string],
 *   avertissements: [string]
 * }
 */
validerConfiguration()
```

---

## 🔧 Implémentation de référence : PAN-Maîtrise

### Spécificités PAN-Maîtrise (Grégoire)

- **Échelle de performance** : IDME (Insuffisant, Développement, Maîtrisé, Étendu)
- **Seuils IDME** : <64%, 65-74%, 75-84%, ≥85% (configurables)
- **Critères d'évaluation** : SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
- **Fenêtre temporelle** : N derniers artefacts (3, 7, ou 12 cours = 6, 14, ou 24 artefacts)
- **Type de production** : Artefacts de portfolio

### Détection des défis (PAN-Maîtrise)

Un **défi** est détecté si :
- Un critère SRPNF a un score **< 70%** (seuil configurable)
- **Récurrence** : Dans les N derniers artefacts (pas moyenne globale)

**Exemple** :
```
Étudiant : Maïka
Critère Rigueur dans les 6 derniers artefacts : [68%, 65%, 62%, 70%, 64%, 66%]
→ Moyenne récente : 65.8% < 70%
→ DÉFI DÉTECTÉ : Rigueur
```

### Identification des patterns (PAN-Maîtrise)

Basée sur :
1. **Performance** sur N derniers artefacts
2. **Présence de défis** SRPNF récurrents
3. **Seuils IDME** configurables

Logique :
```javascript
if (performanceRecente < seuilIDME.insuffisant) {
    return 'Blocage critique';  // < 64%
}
if (performanceRecente < seuilIDME.developpement && aUnDefi) {
    return 'Blocage émergent';  // < 75% + défi
}
if (aUnDefi) {
    return 'Défi spécifique';   // Défi présent
}
return 'Stable';                // Pas de défi
```

### Cibles d'intervention (PAN-Maîtrise)

Exemples :
- **Défi Français** (score < 17%) : "Rencontre individuelle | CAF | Dépistage SA"
- **Défi Structure** (score 18-27%) : "Remédiation en Structure"
- **Défi Rigueur** (score 18-27%) : "Remédiation en Rigueur"

---

## 🔧 Implémentation de référence : Sommative

### Spécificités Sommative traditionnelle

- **Échelle de performance** : Pourcentage ou note sur 100
- **Moyenne** : Pondérée provisoire (toutes les évaluations)
- **Pas de critères fixes** : Varient selon les productions
- **Fenêtre temporelle** : Cumulative (depuis le début du trimestre)

### Détection des défis (Sommative)

**Difficulté** : Les critères varient selon les productions, impossible de détecter des défis récurrents comme en PAN-Maîtrise.

**Solution proposée** :
- Détecter des défis **génériques** basés sur types de productions
- Ex: "Examens écrits faibles" si moyenne examens < 60%
- Ex: "Travaux pratiques faibles" si moyenne travaux < 60%

Ou :
- **Pas de détection de défis** pour la sommative (retourner liste vide)
- Les patterns se basent uniquement sur la performance globale

### Identification des patterns (Sommative)

Basée uniquement sur la **performance globale** (moyenne pondérée) :

```javascript
if (performance < 0.50) {
    return 'Blocage critique';  // < 50% (échec)
}
if (performance < 0.60) {
    return 'Blocage émergent';  // 50-59% (risque d'échec)
}
if (performance < 0.70) {
    return 'Défi spécifique';   // 60-69% (faible)
}
return 'Stable';                // ≥ 70% (réussite)
```

### Cibles d'intervention (Sommative)

Exemples génériques :
- **Performance < 50%** : "Rencontre urgente | Révision des concepts de base | Services d'aide"
- **Performance 50-59%** : "Tutorat recommandé | Révision ciblée"
- **Performance 60-69%** : "Encourager la pratique supplémentaire"

---

## 🚀 Feuille de route d'implémentation

### Phase 1 : Documentation et architecture (ACTUEL)
- [x] Créer ARCHITECTURE_PRATIQUES.md
- [ ] Créer GUIDE_AJOUT_PRATIQUE.md
- [ ] Valider architecture avec Grégoire

### Phase 2 : Extraction PAN-Maîtrise (1-2 jours)
- [ ] Créer `js/pratiques/pratique-interface.js` (documentation)
- [ ] Créer `js/pratiques/pratique-registry.js` (registre)
- [ ] Extraire code actuel → `js/pratiques/pratique-pan-maitrise.js`
- [ ] Adapter `profil-etudiant.js` pour utiliser l'interface
- [ ] Tester que PAN-Maîtrise fonctionne toujours

### Phase 3 : Implémentation Sommative (1 jour)
- [ ] Créer `js/pratiques/pratique-sommative.js`
- [ ] Implémenter logique basique
- [ ] Tester avec données démo en mode sommative

### Phase 4 : Tests et validation (1 jour)
- [ ] Tester basculement entre pratiques
- [ ] Vérifier dépistage A-C-P-R fonctionne pour les deux
- [ ] Valider niveaux RàI cohérents

### Phase 5 : Documentation utilisateur (0.5 jour)
- [ ] Mettre à jour section Aide
- [ ] Documenter comment choisir sa pratique
- [ ] Créer exemples pour collaborateurs

---

## 📖 Concepts clés

### Universel vs Spécifique

| Concept | Universel | Spécifique à la pratique |
|---------|-----------|-------------------------|
| **Indices A-C-P-R** | ✅ Formules de calcul | ⚙️ Comment calculer P |
| **Niveaux de risque** | ✅ Seuils % | - |
| **Niveaux RàI (1-2-3)** | ✅ Niveaux | ⚙️ Cibles d'intervention |
| **Patterns** | ✅ Noms (Stable, Défi, Blocage) | ⚙️ Logique de détection |
| **Défis** | - | ⚙️ Quels critères, seuils |
| **Portfolios** | ✅ Structure | ⚙️ Sélection artefacts |
| **Cartouches** | ✅ Système | ⚙️ Contenu |

### Glossaire

- **Pratique de notation** : Approche pédagogique pour évaluer les apprentissages (ex: sommative, PAN, dénotation)
- **PAN** : Pratique Alternative de Notation
- **PAN-Maîtrise** : PAN basée sur la maîtrise des standards (IDME)
- **PAN-Spécifications** : PAN basée sur des spécifications pass/fail
- **Dénotation (Ungrading)** : Pratique sans notes chiffrées
- **IDME** : Insuffisant, Développement, Maîtrisé, Étendu (taxonomie SOLO)
- **SRPNF** : Structure, Rigueur, Plausibilité, Nuance, Français (critères d'évaluation)

---

## 🎓 Pour les développeurs

### Ajouter une nouvelle pratique

1. Créer `js/pratiques/pratique-[nom].js`
2. Implémenter l'interface `IPratique`
3. Enregistrer dans `pratique-registry.js`
4. Tester avec données démo
5. Documenter dans section Aide

Voir `GUIDE_AJOUT_PRATIQUE.md` pour les détails.

### Principes de design

- **DRY** : Le code universel (A-C-P-R) n'est écrit qu'une fois
- **Open/Closed** : Ouvert à l'extension (nouvelles pratiques), fermé à la modification (code existant)
- **Dependency Inversion** : Le code dépend de l'interface, pas de l'implémentation
- **Single Responsibility** : Chaque pratique gère SA logique

---

## 📞 Contact et collaboration

**Auteur original** : Grégoire Bédard (Labo Codex Numeris)
**Pratique de référence** : PAN-Maîtrise
**Documentation** : https://codexnumeris.org

Pour ajouter votre pratique ou contribuer, consultez `GUIDE_AJOUT_PRATIQUE.md`.

---

**Version** : 1.0 (9 novembre 2025)
**Dernière mise à jour** : 2025-11-09
**Statut** : En cours de développement (Phase 1)
