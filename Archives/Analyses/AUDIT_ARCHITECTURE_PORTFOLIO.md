# Audit Architecture Portfolio - Configuration et Calculs

**Date** : 13 novembre 2025
**Objectif** : Documenter l'architecture actuelle avant migration configuration vers module pratiques

---

## 1. Configuration actuelle : `nombreARetenir`

### 📍 Source unique (Storage)
```
localStorage.productions (Array)
  └─ Portfolio object (type: 'portfolio')
     └─ regles (Object)
        └─ nombreARetenir: 3    // Nombre d'artefacts à retenir pour note finale
        └─ minimumCompletion: 7  // Nombre minimum d'artefacts à remettre
        └─ nombreTotal: 10       // Nombre total d'artefacts prévus
```

**Exemple de structure** :
```json
{
  "id": "PORTFOLIO_123",
  "type": "portfolio",
  "titre": "Portfolio du cours",
  "regles": {
    "nombreARetenir": 5,
    "minimumCompletion": 7,
    "nombreTotal": 10
  }
}
```

### 📖 Lecteurs actuels

#### portfolio.js
- **Ligne 51** : `const nombreARetenir = portfolio.regles.nombreARetenir || 3;`
  - Context : `chargerPortfolioEleveDetail(da)` - Affichage UI
  - Usage : Afficher "N artefacts à retenir pour la note finale"

- **Ligne 640** : `const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;`
  - Context : `calculerEtStockerIndicesCP()` - **CALCUL (duplication)**
  - Usage : Sélection automatique des N meilleurs artefacts

#### pratique-pan-maitrise.js
- **Lignes 305-319** : Fonction `_lireConfiguration()`
  ```javascript
  _lireConfiguration() {
      const productions = JSON.parse(localStorage.getItem('productions') || '[]');
      const portfolio = productions.find(p => p.type === 'portfolio');
      const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;

      return {
          nombreCours: configPAN.nombreCours || 3,
          nombreARetenir: nombreARetenir
      };
  }
  ```
  - Context : Toutes les méthodes de calcul (Performance, Completion, Défis)
  - Usage : **CALCUL selon pratique PAN-Maîtrise**

---

## 2. Duplication de logique : Calcul de Performance (P)

### ❌ PROBLÈME IDENTIFIÉ : Code dupliqué

**portfolio.js (lignes 609-652)** et **pratique-pan-maitrise.js (lignes 55-99)** implémentent la **MÊME LOGIQUE EXACTE** :

| Étape | portfolio.js | pratique-pan-maitrise.js |
|-------|--------------|--------------------------|
| 1. Filtrer évaluations | `evaluations.filter(e => e.etudiantDA === da && artefactsPANDonnes.has(e.productionId))` | `evaluations.filter(e => e.etudiantDA === da && artefactsIds.includes(e.productionId))` |
| 2. Exclure remplacées | `!e.remplaceeParId` | `!e.remplaceeParId` |
| 3. Exclure plagiat/IA | `e.statutIntegrite !== 'plagiat' && e.statutIntegrite !== 'ia'` | (implicite via noteFinale !== null) |
| 4. Filtrer notes valides | `e.noteFinale !== null` | `e.noteFinale !== null && e.noteFinale !== undefined` |
| 5. Trier décroissant | (pas fait, utilise sélection manuelle en priorité) | `evaluationsEleve.sort((a, b) => b.noteFinale - a.noteFinale)` |
| 6. Prendre N meilleurs | `evaluationsPANAvecNote.slice(0, nombreARetenir)` | `meilleurs = evaluationsEleve.slice(0, nombreARetenir)` |
| 7. Calculer moyenne | `somme / evaluationsRetenues.length` | `somme / meilleurs.length` |
| 8. Convertir 0-1 | `Math.round(moyenne)` (garde 0-100) | `moyenne / 100` (convertit en 0-1) |

### 📊 Comparaison ligne par ligne

#### portfolio.js (lignes 609-652)
```javascript
// CALCUL PRATIQUE PAN
const evaluationsPAN = evaluations.filter(e =>
    e.etudiantDA === da &&
    artefactsPANDonnes.has(e.productionId) &&
    !e.remplaceeParId &&
    e.statutIntegrite !== 'plagiat' &&
    e.statutIntegrite !== 'ia'
);

const artefactsPANRemis = new Set(evaluationsPAN.map(e => e.productionId));
const nbPANRemis = artefactsPANRemis.size;
const C_pan = nbArtefactsPANDonnes === 0 ? 0 : Math.round((nbPANRemis / nbArtefactsPANDonnes) * 100);

let P_pan = 0;
let notesPAN = [];
let artefactsPANRetenus = [];

if (portfolio && selectionsPortfolios[da]?.[portfolio.id]) {
    // Sélection manuelle
    artefactsPANRetenus = selectionsPortfolios[da][portfolio.id].artefactsRetenus || [];
    const evaluationsRetenues = evaluationsPAN.filter(e =>
        artefactsPANRetenus.includes(e.productionId) && e.noteFinale !== null
    );
    if (evaluationsRetenues.length > 0) {
        notesPAN = evaluationsRetenues.map(e => e.noteFinale);
        const somme = notesPAN.reduce((sum, note) => sum + note, 0);
        P_pan = Math.round(somme / evaluationsRetenues.length);
    }
} else {
    // Sélection automatique des N meilleurs
    const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;
    const evaluationsPANAvecNote = evaluationsPAN
        .filter(e => e.noteFinale !== null)
        .sort((a, b) => b.noteFinale - a.noteFinale)
        .slice(0, nombreARetenir);

    if (evaluationsPANAvecNote.length > 0) {
        artefactsPANRetenus = evaluationsPANAvecNote.map(e => e.productionId);
        notesPAN = evaluationsPANAvecNote.map(e => e.noteFinale);
        const somme = notesPAN.reduce((sum, note) => sum + note, 0);
        P_pan = Math.round(somme / evaluationsRetenues.length);
    }
}
```

#### pratique-pan-maitrise.js (lignes 55-99)
```javascript
calculerPerformance(da) {
    if (!da || da.length !== 7) {
        console.warn('[PAN] DA invalide:', da);
        return null;
    }

    // Lire configuration
    const config = this._lireConfiguration();
    const nombreARetenir = config.nombreARetenir;

    // Lire les évaluations et productions
    const evaluations = this._lireEvaluations();
    const artefactsIds = this._lireArtefactsPortfolio();

    // Filtrer les évaluations de cet étudiant sur les artefacts portfolio
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsIds.includes(e.productionId) &&
        !e.remplaceeParId &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined
    );

    if (evaluationsEleve.length === 0) {
        console.log('[PAN] Aucune évaluation pour DA', da);
        return null;
    }

    // Trier par note décroissante (meilleures d'abord)
    evaluationsEleve.sort((a, b) => b.noteFinale - a.noteFinale);

    // Prendre les N meilleurs
    const meilleurs = evaluationsEleve.slice(0, nombreARetenir);

    // Calculer la moyenne
    const somme = meilleurs.reduce((acc, e) => acc + e.noteFinale, 0);
    const moyenne = somme / meilleurs.length;

    // Convertir en indice 0-1
    const indiceP = moyenne / 100;

    console.log(`[PAN] Performance DA ${da}: ${(indiceP * 100).toFixed(1)}% (${meilleurs.length}/${nombreARetenir} artefacts)`);

    return indiceP;
}
```

### 🔴 Différences notables

| Aspect | portfolio.js | pratique-pan-maitrise.js | Impact |
|--------|--------------|--------------------------|--------|
| **Sélection manuelle** | Prioritaire (lit `portfoliosEleves`) | Non supportée | portfolio.js gère 2 scénarios |
| **Statut intégrité** | Filtre explicite plagiat/IA | Implicite via note !== null | Même résultat |
| **Format retour** | 0-100 (entier) | 0-1 (décimal) | Conversion nécessaire |
| **Calcul C** | Inclus dans même fonction | Méthode séparée `calculerCompletion()` | Architecture plus propre |
| **Logging** | Aucun | Logs détaillés avec `[PAN]` | Meilleur debugging |

### ⚠️ Implications de la duplication

1. **Maintenance** : Toute modification doit être faite à 2 endroits
2. **Risque d'incohérence** : Si on corrige un bug dans un seul module
3. **Violation SRP** : portfolio.js fait à la fois data collection ET calculation
4. **Difficulté testing** : Impossible de tester la logique de calcul indépendamment
5. **Bloquer l'évolution** : Impossible d'ajouter d'autres pratiques sans refactoriser

---

## 3. Diagramme de dépendances actuel

```
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIGURATION STORAGE                          │
│                                                                  │
│  localStorage.productions → Portfolio                            │
│    └─ regles.nombreARetenir                                     │
│    └─ regles.minimumCompletion                                  │
│    └─ regles.nombreTotal                                        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                   ┌──────────────────────┐
│  portfolio.js    │                   │  pratique-pan-       │
│                  │                   │  maitrise.js         │
├──────────────────┤                   ├──────────────────────┤
│ 📖 Read config   │                   │ 📖 Read config       │
│ ⚙️ Calculate C   │◄──DUPLICATION──►  │ ⚙️ Calculate C       │
│ ⚙️ Calculate P   │                   │ ⚙️ Calculate P       │
│ 💾 Store results │                   │ ↩️ Return results    │
│                  │                   │                      │
│ calculeEtStocker │                   │ calculerPerformance()│
│ IndicesCP()      │                   │ calculerCompletion() │
└────────┬─────────┘                   └──────────────────────┘
         │                                        │
         │ writes                                 │ used by
         ▼                                        ▼
┌─────────────────┐                     ┌────────────────────┐
│  indicesCP      │────reads───────────►│ profil-etudiant.js │
│  (localStorage) │                     │ tableau-bord.js    │
└─────────────────┘                     └────────────────────┘
```

### 🔄 Flux de données actuel (PROBLÉMATIQUE)

```
User Action: Évaluation créée ou artefact sélectionné
    ↓
portfolio.js: calculerEtStockerIndicesCP() [appelé automatiquement]
    ↓
├─ Lit configuration: portfolio.regles.nombreARetenir
├─ Filtre évaluations (logique PAN)
├─ Trie par note
├─ Prend N meilleurs
├─ Calcule moyenne
└─ Sauvegarde dans localStorage.indicesCP
    ↓
profil-etudiant.js: afficherProfilComplet(da)
    ↓
Lit localStorage.indicesCP
    ↓
Affiche performance à l'utilisateur
```

**Pendant ce temps** : `pratique-pan-maitrise.js` existe mais **N'EST JAMAIS UTILISÉ** pour le calcul réel !

---

## 4. Architecture cible (Separation of Concerns)

### 📐 Principe : Single Responsibility

```
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIGURATION STORAGE                          │
│                                                                  │
│  localStorage.modalitesEvaluation.configPAN                      │
│    └─ portfolio.nombreARetenir                                  │
│    └─ portfolio.minimumCompletion                               │
│    └─ portfolio.nombreTotal                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                   ┌──────────────────────┐
│  portfolio.js    │                   │  pratique-pan-       │
│                  │                   │  maitrise.js         │
├──────────────────┤                   ├──────────────────────┤
│ 📦 Data          │                   │ ⚙️ Calculation       │
│ Collection       │                   │ Logic                │
│ ONLY             │                   │ ONLY                 │
│                  │                   │                      │
│ · Store eval     │                   │ · calculerPerform()  │
│ · Store selection│                   │ · calculerCompletion │
│ · UI display     │                   │ · detecterDefis()    │
│                  │                   │ · identifierPattern()│
└──────────────────┘                   └──────────┬───────────┘
                                                  │
                                                  │ called by
                                                  ▼
                              ┌────────────────────────────────┐
                              │  profil-etudiant.js            │
                              │  (ORCHESTRATOR)                │
                              ├────────────────────────────────┤
                              │ 1. Get active practice         │
                              │ 2. Call practice methods       │
                              │ 3. Display results             │
                              └────────────────────────────────┘
```

### 🎯 Responsabilités claires

#### portfolio.js (Data Collection)
- ✅ Afficher le portfolio d'un étudiant
- ✅ Permettre la sélection des artefacts
- ✅ Sauvegarder les sélections dans `portfoliosEleves`
- ❌ ~~Calculer la performance~~ (déléguer à pratique)
- ❌ ~~Calculer la complétion~~ (déléguer à pratique)
- ❌ ~~Stocker indicesCP~~ (responsabilité de l'orchestrateur)

#### pratique-pan-maitrise.js (Calculation Logic)
- ✅ Lire configuration depuis `modalitesEvaluation.configPAN`
- ✅ Lire évaluations depuis `evaluationsSauvegardees`
- ✅ Lire sélections depuis `portfoliosEleves`
- ✅ Calculer performance selon règles PAN
- ✅ Calculer complétion selon règles PAN
- ✅ Détecter défis SRPNF
- ✅ Identifier patterns d'apprentissage

#### profil-etudiant.js (Orchestrator)
- ✅ Détecter pratique active (`obtenirModePratique()`)
- ✅ Appeler les méthodes de la pratique
- ✅ Afficher les résultats
- ✅ Gérer le cache (optionnel, pour performance)

---

## 5. Migration Strategy (Proposition)

### Phase 1 : Déplacer configuration (1-2h)

**Objectif** : Centraliser configuration dans `modalitesEvaluation.configPAN`

**Étapes** :
1. ✅ Créer nouvelle structure dans `pratiques.js`
   ```javascript
   modalitesEvaluation.configPAN = {
       nombreCours: 3,
       portfolio: {
           actif: true,
           nombreARetenir: 5,
           minimumCompletion: 7,
           nombreTotal: 10,
           methodeSelection: 'automatique' // ou 'manuelle'
       },
       jetons: { ... }
   }
   ```

2. ✅ Migration des données existantes
   - Lire `productions` → portfolio → regles
   - Écrire dans `modalitesEvaluation.configPAN.portfolio`
   - Script de migration one-time dans pratiques.js

3. ✅ Adapter les lecteurs
   - `portfolio.js` : Lire depuis `modalitesEvaluation.configPAN.portfolio.nombreARetenir`
   - `pratique-pan-maitrise.js` : Déjà compatible (utilise `_lireConfiguration()`)

**Test** : Vérifier que l'affichage UI fonctionne toujours

### Phase 2 : Déléguer calculs à la pratique (2-3h)

**Objectif** : portfolio.js ne calcule plus, il délègue

**Étapes** :
1. ✅ Créer fonction wrapper dans `portfolio.js`
   ```javascript
   function declencherRecalculIndices() {
       // Détecte pratique active
       const pratique = obtenirPratiqueActive(); // depuis registry

       if (!pratique) {
           console.error('Aucune pratique active');
           return;
       }

       // Parcourt tous les étudiants
       const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
       const indicesCP = {};

       etudiants.forEach(etudiant => {
           const da = etudiant.da;
           const C = pratique.calculerCompletion(da);
           const P = pratique.calculerPerformance(da);

           indicesCP[da] = {
               actuel: {
                   date: new Date().toISOString(),
                   C: Math.round(C * 100),
                   P: Math.round(P * 100),
                   details: { /* ... */ }
               }
           };
       });

       sauvegarderDonneesSelonMode('indicesCP', indicesCP);
       console.log('✅ Indices recalculés via pratique:', pratique.obtenirNom());
   }
   ```

2. ✅ Remplacer appels à `calculerEtStockerIndicesCP()`
   - Rechercher tous les appels dans le projet
   - Remplacer par `declencherRecalculIndices()`

3. ✅ Archiver ancien code
   - Commenter `calculerEtStockerIndicesCP()` avec marqueur `// DEPRECATED - voir pratique-pan-maitrise.js`
   - Ne pas supprimer immédiatement (rollback safety)

**Test** : Vérifier que performance calculée = même résultat qu'avant

### Phase 3 : Support multi-pratiques (1-2h)

**Objectif** : Gérer SOM et PAN avec leurs pratiques respectives

**Étapes** :
1. ✅ Modifier `declencherRecalculIndices()` pour calculer les deux
   ```javascript
   function declencherRecalculIndices() {
       const pratiqueSOM = obtenirPratique('sommative');
       const pratiquePAN = obtenirPratique('pan-maitrise');

       const indicesCP = {};

       etudiants.forEach(etudiant => {
           const da = etudiant.da;

           indicesCP[da] = {
               actuel: {
                   date: new Date().toISOString(),
                   SOM: {
                       C: Math.round(pratiqueSOM.calculerCompletion(da) * 100),
                       P: Math.round(pratiqueSOM.calculerPerformance(da) * 100),
                       details: { /* ... */ }
                   },
                   PAN: {
                       C: Math.round(pratiquePAN.calculerCompletion(da) * 100),
                       P: Math.round(pratiquePAN.calculerPerformance(da) * 100),
                       details: { /* ... */ }
                   }
               }
           };
       });

       sauvegarderDonneesSelonMode('indicesCP', indicesCP);
   }
   ```

2. ✅ Implémenter `pratique-sommative.js`
   - Méthodes `calculerPerformance()` et `calculerCompletion()`
   - Logique moyenne pondérée pour SOM

**Test** : Vérifier mode comparatif affiche bien SOM vs PAN

### Phase 4 : Nettoyage et documentation (30min)

1. ✅ Supprimer code dupliqué commenté
2. ✅ Mettre à jour `CLAUDE.md`
3. ✅ Mettre à jour `ARCHITECTURE_PRATIQUES.md`
4. ✅ Créer commit avec message descriptif

---

## 6. Risques et Mitigations

### ⚠️ Risques identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Régression calculs** | 🔴 Élevé | 🟡 Moyen | Tests unitaires avant/après migration |
| **Perte de données** | 🔴 Élevé | 🟢 Faible | Script de migration + backup localStorage |
| **Performance dégradée** | 🟡 Moyen | 🟡 Moyen | Profiling avant/après, cache si nécessaire |
| **Sélection manuelle cassée** | 🟡 Moyen | 🟡 Moyen | Préserver lecture `portfoliosEleves` |
| **Incompatibilité Beta 89** | 🟠 Faible | 🟢 Faible | Migration one-time au premier chargement |

### ✅ Plan de rollback

1. **Git branch** : Créer `backup-architecture-portfolio-avant-migration`
2. **LocalStorage backup** : Script export complet avant migration
3. **Tests validation** : Checklist avec cas de test spécifiques
4. **Rollback rapide** : Si problème détecté, revenir au commit précédent

---

## 7. Tests de validation

### ✅ Checklist avant migration

- [ ] Export localStorage complet (backup)
- [ ] Git commit propre avec message clair
- [ ] Créer branche de backup
- [ ] Lire ce document d'audit en entier

### ✅ Checklist après chaque phase

**Phase 1 (Configuration)** :
- [ ] Configuration présente dans `modalitesEvaluation.configPAN.portfolio`
- [ ] UI affiche "N artefacts à retenir" (valeur correcte)
- [ ] Console : Aucune erreur de lecture configuration
- [ ] LocalStorage : Ancienne config préservée dans `productions` (backward compat)

**Phase 2 (Délégation calculs)** :
- [ ] Performance calculée = même valeur qu'avant (±0.1%)
- [ ] Complétion calculée = même valeur qu'avant
- [ ] Sélection manuelle d'artefacts fonctionne
- [ ] Sélection automatique des N meilleurs fonctionne
- [ ] Console : Logs `[PAN]` visibles lors calcul
- [ ] Profil étudiant affiche performance correcte

**Phase 3 (Multi-pratiques)** :
- [ ] Mode SOM affiche calcul SOM
- [ ] Mode PAN affiche calcul PAN
- [ ] Mode comparatif affiche les deux
- [ ] Changer de pratique recalcule automatiquement
- [ ] Console : Logs indiquent quelle pratique est utilisée

**Phase 4 (Nettoyage)** :
- [ ] Code dupliqué supprimé
- [ ] Documentation mise à jour
- [ ] Aucune console.warn ou console.error
- [ ] Tests manuels dans 3 profils étudiants différents

---

## 8. Conclusion

### 📋 Résumé exécutif

**Problème identifié** : `portfolio.js` duplique la logique de calcul qui existe déjà dans `pratique-pan-maitrise.js`, violant le principe de Single Responsibility et rendant impossible l'ajout d'autres pratiques de notation.

**Solution proposée** : Migration en 4 phases (6-8h total) pour déléguer les calculs à la pratique active via le système de registry existant.

**Bénéfices attendus** :
- ✅ Séparation claire data collection vs calculation logic
- ✅ Réutilisabilité du code de calcul
- ✅ Facilite ajout de nouvelles pratiques (PAN-Spécifications, Dénotation)
- ✅ Tests unitaires possibles sur logique de calcul
- ✅ Maintenance simplifiée (un seul endroit à modifier)

**Prochaine étape** : Présenter ce rapport à l'utilisateur et obtenir validation avant de commencer la migration.

---

**Rédigé par** : Claude Code
**Révisé par** : À valider par Grégoire Bédard
**Version** : 1.0 (13 novembre 2025)
