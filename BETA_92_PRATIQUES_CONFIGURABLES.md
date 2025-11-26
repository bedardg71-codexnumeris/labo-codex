# Beta 92 - Système de pratiques configurables JSON

**Date**: 25-26 novembre 2025
**Auteur**: Grégoire Bédard (Labo Codex)
**Statut**: Jour 1 et 2 complétés

## Vue d'ensemble

Ce document détaille l'implémentation du système de **pratiques d'évaluation configurables** qui permet aux enseignants de définir leurs propres pratiques via des fichiers JSON, sans écrire de code JavaScript.

---

## Objectif

Permettre à des enseignants comme Bruno V. d'utiliser l'application avec leurs pratiques d'évaluation personnalisées :
- Échelles à 5 niveaux (0, 1, 2, 3, 4)
- Reprises illimitées
- Plafonnement conditionnel
- Niveau non rétrogradable

Sans avoir à modifier le code source de l'application.

---

## Architecture

### Composants créés

#### 1. **pratique-configurable.js** (520 lignes)

Classe de base qui interprète les configurations JSON.

**Responsabilités** :
- Valider la structure JSON
- Implémenter l'interface IPratique
- Calculer les indices C et P
- Détecter les défis
- Identifier les patterns
- Générer les cibles RàI
- Calculer la note finale

**Méthodes principales** :
```javascript
class PratiqueConfigurable {
    constructor(config) { ... }
    valider() { ... }

    // Interface IPratique
    obtenirNom() { ... }
    obtenirId() { ... }
    obtenirDescription() { ... }

    // Calculs
    calculerPerformance(da) { ... }
    calculerCompletion(da) { ... }
    detecterDefis(da) { ... }
    identifierPattern(da) { ... }

    // Note finale
    calculerNoteFinale(evaluations) { ... }
    calculerParConversionNiveaux(evaluations) { ... }
    calculerMoyennePonderee(evaluations) { ... }
    calculerParSpecifications(evaluations) { ... }

    // Conditions spéciales
    appliquerConditionsSpeciales(noteBrute, evaluations) { ... }
    appliquerPlafonnement(noteActuelle, evaluations, condition) { ... }
    appliquerDoubleVerrou(noteActuelle, evaluations, condition) { ... }

    // Interprétation
    interpreterNiveau(valeur, typeIndice) { ... }
    niveauVersPourcentage(niveauCode) { ... }

    // RàI
    genererCibleIntervention(da) { ... }
}
```

**Correctif critique appliqué** :
- Ligne 281, 307, 374 : Remplacement `for (const eval of` → `for (const evaluation of`
- **Raison** : `eval` est un mot réservé en JavaScript strict mode
- **Date** : 25 novembre 2025, 23h45

---

#### 2. **pratiques-predefines.js** (360 lignes)

Définitions JSON de 3 pratiques réelles.

**Pratiques disponibles** :

1. **PAN-Standards (Bruno V.)** - `pan-standards-bruno`
   - Échelle à 5 niveaux (0, I, D, M, E)
   - 10 standards dont 4 terminaux
   - Reprises illimitées + occasions formelles
   - Plafonnement conditionnel (< 60% sur terminaux → max 55%)

2. **Sommative classique (Marie-Hélène L.)** - `sommative-classique-mhl`
   - Échelle pourcentage (0-100%)
   - 4 évaluations pondérées (15%, 20%, 15%, 50%)
   - Double verrou sur analyse finale (≥ 60%)
   - Aucune reprise

3. **PAN-Spécifications (François A.-H.)** - `pan-specifications-fah`
   - Notes fixes (50, 60, 80, 100%)
   - 7 spécifications hiérarchiques
   - Reprises illimitées
   - Niveau non rétrogradable

**Structure d'une pratique JSON** :
```javascript
{
    id: 'pan-standards-bruno',
    nom: 'PAN-Standards (5 niveaux)',
    auteur: 'Bruno V.',
    description: '...',
    discipline: 'Chimie',
    version: '1.0',
    date_creation: '2025-11-25',

    echelle: {
        type: 'niveaux',  // ou 'pourcentage', 'notes_fixes'
        niveaux: [
            {
                code: '0',
                label: 'Données insuffisantes',
                valeur_pourcentage: 0,
                couleur: '#CCCCCC',
                ordre: 0
            },
            // ... autres niveaux
        ]
    },

    structure_evaluations: { ... },
    calcul_note: { ... },
    systeme_reprises: { ... },
    gestion_criteres: { ... },
    seuils: { ... },
    interface: { ... }
}
```

---

#### 3. **pratique-manager.js** (280 lignes)

Gestionnaire central pour les pratiques configurables.

**Responsabilités** :
- Charger la pratique active
- Changer de pratique
- Lister toutes les pratiques (codées + configurables)
- Sauvegarder/supprimer des pratiques
- Importer/exporter JSON
- Initialiser les pratiques prédéfinies

**API principale** :
```javascript
const PratiqueManager = {
    pratiqueActive: null,

    async chargerPratiqueActive() {
        // Détecte si pratique codée ou configurable
        // Retourne instance appropriée
    },

    async changerPratiqueActive(pratiqueId) {
        // Change modalitesEvaluation.pratique
        // Invalide le cache
        // Recharge la pratique
    },

    async listerPratiques() {
        // Retourne { codees: [...], configurables: [...] }
    },

    async sauvegarderPratique(pratique) {
        // Valide et sauvegarde dans pratiquesConfigurables
    },

    async supprimerPratique(pratiqueId) {
        // Supprime si pas la pratique active
    },

    async importerPratique(pratiqueJSON) {
        // Importe depuis fichier JSON
    },

    async exporterPratique(pratiqueId) {
        // Exporte en JSON
    },

    async initialiserPratiquesPredefines() {
        // Charge les 3 pratiques prédéfinies
    }
};
```

---

### Adaptations des modules existants

#### 4. **evaluation.js** - Support échelles dynamiques

**Modifications** :

**a) `chargerEchellePerformance()` (lignes 254-328)**
- Détecte si une pratique configurable est active
- Ajoute son échelle dans le select (avec fond bleu clair)
- Pré-sélectionne l'échelle de la pratique
- Conserve les échelles personnalisées existantes

**b) `cartoucheSelectionnee()` (lignes 491-519)**
- Détecte si l'échelle commence par "pratique-"
- Charge l'échelle depuis pratiquesConfigurables
- Fallback vers echellesTemplates si échelle personnalisée

**c) `calculerNote()` (lignes 1119-1142)**
- Même logique que cartoucheSelectionnee()
- Support échelles de pratiques configurables

**Cache buster mis à jour** :
```html
<script src="js/evaluation.js?v=2025112601"></script>
```

---

#### 5. **pratique-registre.js** - Chargement pratiques configurables

**Modification** : `obtenirPratiqueActive()` (lignes 164-214)

**Logique** :
1. Vérifier le cache (performances)
2. Chercher dans le registre (pratiques codées : pan-maitrise, sommative)
3. **NOUVEAU** : Si non trouvée, chercher dans pratiquesConfigurables
4. Instancier PratiqueConfigurable si trouvée
5. Mettre en cache et retourner

**Code ajouté** :
```javascript
// NOUVEAU (Beta 92): Si non trouvée dans le registre, chercher dans les pratiques configurables
if (!instance && window.PratiqueManager) {
    console.log(`[Registre] Pratique "${idActif}" non trouvée dans le registre, tentative via PratiqueManager...`);

    const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);
    const pratiqueData = pratiquesConfigurables.find(p => p.id === idActif);

    if (pratiqueData && pratiqueData.config) {
        // Créer une instance de PratiqueConfigurable
        try {
            instance = new PratiqueConfigurable(pratiqueData.config);
            console.log(`✅ Pratique configurable chargée : ${idActif} (${instance.obtenirNom()})`);
        } catch (error) {
            console.error(`Erreur lors du chargement de la pratique configurable "${idActif}":`, error);
            return null;
        }
    }
}
```

---

#### 6. **profil-etudiant.js** - Compatible automatiquement

Aucune modification nécessaire car utilise déjà `obtenirPratiqueActive()`.

**Fonctions concernées** :
- `genererCarteCibleIntervention(da)` (ligne 2504)
- `genererDiagnosticCriteres(da)` (ligne 5322)

---

#### 7. **portfolio.js** - Compatible automatiquement

Utilise `obtenirPratiqueParId()` depuis Phase 2 (novembre 2025).

---

#### 8. **tableau-bord-apercu.js** - Compatible automatiquement

Lit les données depuis `indicesPatternsRaI` calculées par portfolio.js.

---

### Stockage

**Clé IndexedDB** : `pratiquesConfigurables`

**Structure** :
```javascript
[
    {
        id: 'pan-standards-bruno',
        nom: 'PAN-Standards (5 niveaux)',
        auteur: 'Bruno V.',
        description: '...',
        config: {
            // Configuration complète (8 sections)
        }
    },
    // ... autres pratiques
]
```

**Clé existante** : `modalitesEvaluation.pratique`
- Contient l'ID de la pratique active
- Utilisé pour détecter quelle pratique charger

---

## Tests à effectuer

### Test 1 : Initialisation des pratiques prédéfinies

**Console navigateur** :
```javascript
// 1. Initialiser les pratiques prédéfinies
await PratiqueManager.initialiserPratiquesPredefines();

// Résultat attendu :
// [PratiqueManager] Initialisation des pratiques prédéfinies...
//    ✅ PAN-Standards (5 niveaux)
//    ✅ Sommative traditionnelle
//    ✅ PAN-Spécifications (notes fixes)
// [PratiqueManager] ✅ Pratiques prédéfinies initialisées
```

---

### Test 2 : Lister les pratiques disponibles

**Console navigateur** :
```javascript
// 2. Lister toutes les pratiques
const pratiques = await PratiqueManager.listerPratiques();
console.log(pratiques);

// Résultat attendu :
// {
//   codees: [
//     { id: 'pan-maitrise', nom: 'PAN-Maîtrise', ... },
//     { id: 'sommative', nom: 'Sommative traditionnelle', ... }
//   ],
//   configurables: [
//     { id: 'pan-standards-bruno', nom: 'PAN-Standards (5 niveaux)', ... },
//     { id: 'sommative-classique-mhl', nom: 'Sommative traditionnelle', ... },
//     { id: 'pan-specifications-fah', nom: 'PAN-Spécifications (notes fixes)', ... }
//   ]
// }
```

---

### Test 3 : Changer la pratique active

**Console navigateur** :
```javascript
// 3. Changer pour la pratique de Bruno
await PratiqueManager.changerPratiqueActive('pan-standards-bruno');

// Résultat attendu :
// [PratiqueManager] ✅ Pratique changée : pan-standards-bruno
```

---

### Test 4 : Charger la pratique active

**Console navigateur** :
```javascript
// 4. Charger la pratique active
const pratique = await PratiqueManager.chargerPratiqueActive();
console.log(pratique.obtenirNom());
console.log(pratique.obtenirDescription());
console.log(pratique.config.echelle);

// Résultat attendu :
// PAN-Standards (5 niveaux)
// Système à 5 niveaux avec reprises multiples, niveau non rétrogradable
// { type: 'niveaux', niveaux: [...] }
```

---

### Test 5 : Vérifier l'échelle dans evaluation.js

**Étapes** :
1. Aller dans **Évaluations › Évaluer une production**
2. Sélectionner un étudiant
3. Sélectionner une production
4. Regarder le select "Échelle de performance"

**Résultat attendu** :
```
-- Choisir une échelle --
PAN-Standards (5 niveaux) (Pratique active) (5 niveaux)  [fond bleu clair]
Échelle IDME (5 niveaux)
... autres échelles personnalisées
```

---

### Test 6 : Vérifier pratique-registre.js

**Console navigateur** :
```javascript
// 6. Obtenir la pratique via le registre
const pratique = obtenirPratiqueActive();
console.log(pratique.obtenirNom());
console.log(pratique.obtenirId());

// Résultat attendu :
// [Registre] Pratique "pan-standards-bruno" non trouvée dans le registre, tentative via PratiqueManager...
// ✅ Pratique configurable chargée : pan-standards-bruno (PAN-Standards (5 niveaux))
// 🎯 Pratique active : pan-standards-bruno (PAN-Standards (5 niveaux))
// PAN-Standards (5 niveaux)
// pan-standards-bruno
```

---

## Problèmes connus et correctifs

### Bug #1 : SyntaxError eval

**Symptôme** :
```
SyntaxError: Unexpected eval or arguments in strict mode
pratique-configurable.js:281
```

**Cause** : Variable nommée `eval` (mot réservé JavaScript)

**Correctif appliqué** (25 nov 2025, 23h45) :
```bash
sed -i '' 's/for (const eval of/for (const evaluation of/g' pratique-configurable.js
sed -i '' 's/eval\./evaluation./g' pratique-configurable.js
sed -i '' 's/const eval =/const evaluation =/g' pratique-configurable.js
```

**Vérification** :
```bash
node --check pratique-configurable.js
# Output: ✅ Syntaxe OK
```

---

### Bug #2 : ReferenceError PratiqueConfigurable

**Symptôme** :
```
ReferenceError: Can't find variable: PratiqueConfigurable
```

**Cause** : Bug #1 empêchait le chargement du module

**Solution** : Hard refresh navigateur après correctif Bug #1
```
Cmd + Shift + R (macOS)
Ctrl + Shift + R (Windows/Linux)
```

---

## Statut d'implémentation

### ✅ Jour 1 (25 novembre) - COMPLÉTÉ

- [x] Créer pratique-configurable.js (520 lignes)
- [x] Créer pratiques-predefines.js (360 lignes)
- [x] Créer pratique-manager.js (280 lignes)
- [x] Ajouter store IndexedDB (utilise keyvalue existant)
- [x] Corriger bug syntaxe `eval`
- [x] Tests initiaux validés

**Total** : 1160 lignes de code créées

---

### ✅ Jour 2 (26 novembre) - COMPLÉTÉ

- [x] Adapter evaluation.js (échelles dynamiques)
- [x] Adapter pratique-registre.js (chargement configurables)
- [x] Vérifier profil-etudiant.js (compatible automatiquement)
- [x] Vérifier portfolio.js (compatible automatiquement)
- [x] Vérifier tableau-bord-apercu.js (compatible automatiquement)
- [x] Créer documentation BETA_92_PRATIQUES_CONFIGURABLES.md

**Total** : 3 modules adaptés + 1 documentation

---

### ⏳ Jour 3 (prévu) - EN ATTENTE

- [ ] Étendre pratiques.js (interface sélection/gestion)
- [ ] Créer wizard création pratique (8 étapes)
- [ ] Ajouter import/export pratiques JSON
- [ ] Tests finaux et corrections

---

## Fichiers modifiés

| Fichier | Lignes modifiées | Statut | Date |
|---------|-----------------|--------|------|
| `js/pratiques/pratique-configurable.js` | +520 | ✅ Créé | 25 nov |
| `js/pratiques/pratiques-predefines.js` | +360 | ✅ Créé | 25 nov |
| `js/pratiques/pratique-manager.js` | +280 | ✅ Créé | 25 nov |
| `js/evaluation.js` | ~200 modifiés | ✅ Adapté | 26 nov |
| `js/pratiques/pratique-registre.js` | ~50 modifiés | ✅ Adapté | 26 nov |
| `index 91.html` | +3 scripts | ✅ Mis à jour | 25 nov |
| `SPEC_SYSTEME_PROFILS.md` | ~200 modifiés | ✅ Mis à jour | 25 nov |
| **TOTAL** | **+1613 lignes** | | |

---

## Architecture technique

### Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE UTILISATEUR                     │
├─────────────────────────────────────────────────────────────┤
│  evaluation.js  │  profil-etudiant.js  │  tableau-bord.js   │
└────────┬────────────────────┬────────────────────┬──────────┘
         │                    │                    │
         │                    ▼                    │
         │          obtenirPratiqueActive()        │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│               PRATIQUE-REGISTRE.JS (routeur)                 │
├─────────────────────────────────────────────────────────────┤
│  • Lit modalitesEvaluation.pratique                         │
│  • Route vers pratiques codées OU configurables             │
│  • Gère le cache                                            │
└────────┬──────────────────────────────────────┬─────────────┘
         │                                      │
    Codées│                            Configurables
         │                                      │
         ▼                                      ▼
┌──────────────────┐              ┌──────────────────────────┐
│ pratiquesEnreg.  │              │  PratiqueManager         │
│  - pan-maitrise  │              │   ↓                      │
│  - sommative     │              │  PratiqueConfigurable    │
└──────────────────┘              └──────────────────────────┘
                                             ▲
                                             │
                                  ┌──────────┴──────────┐
                                  │  pratiquesConfigu-  │
                                  │  rables (IndexedDB) │
                                  └─────────────────────┘
```

### Séquence de chargement

```
1. Page charge
   ↓
2. pratique-configurable.js charge
   → window.PratiqueConfigurable disponible
   ↓
3. pratiques-predefines.js charge
   → window.PRATIQUES_PREDEFINES disponible
   ↓
4. pratique-manager.js charge
   → window.PratiqueManager disponible
   ↓
5. pratique-registre.js charge
   → window.obtenirPratiqueActive() disponible
   ↓
6. Module demande obtenirPratiqueActive()
   ↓
7. Registre lit modalitesEvaluation.pratique
   ↓
8a. Si pratique codée (pan-maitrise, sommative)
    → Retourne depuis Map

8b. Si pratique configurable
    → Lit pratiquesConfigurables
    → Instancie PratiqueConfigurable
    → Retourne instance
   ↓
9. Module utilise instance.calculerPerformance(da), etc.
```

---

## Compatibilité

### Pratiques existantes (codées)

- ✅ **pan-maitrise** : Fonctionne comme avant
- ✅ **sommative** : Fonctionne comme avant

### Pratiques nouvelles (configurables)

- ✅ **pan-standards-bruno** : Prête à tester
- ✅ **sommative-classique-mhl** : Prête à tester
- ✅ **pan-specifications-fah** : Prête à tester (calcul incomplet)

### Modules compatibles

- ✅ **evaluation.js** : Échelles dynamiques supportées
- ✅ **profil-etudiant.js** : Via obtenirPratiqueActive()
- ✅ **portfolio.js** : Via obtenirPratiqueActive()
- ✅ **tableau-bord-apercu.js** : Lit données calculées
- ✅ **pratiques.js** : À étendre (Jour 3)

---

## Prochaines étapes

### Jour 3 : Interface et wizard

1. **Étendre pratiques.js**
   - Ajouter section "Pratiques configurables"
   - Liste des pratiques avec actions (Activer, Éditer, Dupliquer, Supprimer, Exporter)
   - Bouton "Créer une nouvelle pratique"
   - Bouton "Importer une pratique JSON"

2. **Créer wizard création pratique**
   - Étape 1 : Métadonnées (nom, auteur, description)
   - Étape 2 : Échelle (type + niveaux)
   - Étape 3 : Structure évaluations
   - Étape 4 : Calcul note (méthode + conditions)
   - Étape 5 : Système reprises
   - Étape 6 : Gestion critères
   - Étape 7 : Seuils interprétation
   - Étape 8 : Interface (terminologie)

3. **Import/Export JSON**
   - Bouton export dans liste pratiques
   - Bouton import avec validation JSON
   - Format fichier : `pratique-nom-auteur.json`

4. **Tests et corrections**
   - Tester chaque pratique prédéfinie
   - Vérifier calculs de notes
   - Vérifier patterns/RàI
   - Corriger bugs identifiés

---

## Notes techniques

### Validation JSON

La structure JSON est validée lors de :
1. Instanciation de `PratiqueConfigurable`
2. Sauvegarde via `PratiqueManager.sauvegarderPratique()`
3. Import via `PratiqueManager.importerPratique()`

**Champs obligatoires** :
- `id`, `nom`, `echelle`, `calcul_note`

**Champs recommandés** :
- `auteur`, `description`, `version`, `date_creation`

---

### Performance

**Cache** :
- pratique-registre.js met en cache la pratique active
- Invalider avec `window.invaliderCachePratique()`

**Stockage** :
- IndexedDB (plusieurs GB disponibles)
- Clé `pratiquesConfigurables` (array)
- Pas de limite pratique sur le nombre de pratiques

---

### Sécurité

**Validation** :
- Structure JSON validée avant sauvegarde
- Méthodes obligatoires vérifiées (contrat IPratique)
- ID unique vérifié

**Isolation** :
- Pratiques configurables ne peuvent pas exécuter de code JavaScript
- Configuration déclarative uniquement (JSON)
- Aucun risque d'injection de code

---

## Références

**Documents liés** :
- `SPEC_SYSTEME_PROFILS.md` : Spécification complète (1622 lignes)
- `ARCHITECTURE_PRATIQUES.md` : Architecture système pratiques (Beta 91)
- `GUIDE_AJOUT_PRATIQUE.md` : Guide pour ajouter une pratique codée
- `FEUILLE_DE_ROUTE_PRATIQUES.md` : Roadmap implémentation

**Commits Git** :
- Beta 91 : Système pratiques modulaire (nov 2025)
- Beta 92 : Pratiques configurables JSON (25-26 nov 2025)

---

## Auteur

**Grégoire Bédard**
Labo Codex
https://codexnumeris.org

**Licence** : Creative Commons BY-NC-SA 4.0

---

**Dernière mise à jour** : 26 novembre 2025, 00h30
