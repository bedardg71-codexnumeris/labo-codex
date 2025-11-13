# Architecture modulaire pour les pratiques de notation

**Date** : 12 novembre 2025  
**Version** : 1.0  
**Contexte** : Développement Beta 90 → Beta 91+  
**Référence** : Article "Une note qui reflète le niveau global d'atteinte des cibles" (Bruno V. & François A.-H., Nov 2025)

---

## 📋 CONTEXTE

L'application doit supporter **3 familles de pratiques alternatives de notation (PAN)** en plus de la notation sommative traditionnelle, selon la taxonomie présentée dans l'article de référence.

**État actuel (Beta 90)** :
- Architecture monolithique avec calculs hardcodés
- Support PAN-Maîtrise (3 meilleurs artefacts) - pratique de Grégoire
- Support Sommative traditionnelle (moyenne pondérée)
- Les deux pratiques coexistent mais code non modulaire

**Objectif Beta 90-91** :
- Extraire la logique métier dans des modules dédiés
- Créer une architecture extensible via interface `IPratique`
- Permettre l'ajout de nouvelles pratiques sans modifier le code existant

---

## 🎯 LES 3 FAMILLES DE PAN

Selon l'article de Bruno V., il existe 3 grandes familles de PAN, chacune avec ses propres variantes :

### Famille 1 : Notation basée sur les standards

**Principe** : La note finale dépend du degré d'atteinte des cibles d'apprentissage (standards). Le niveau utilisé pour construire la note est celui jugé le plus représentatif.

**Variantes identifiées** :

1. **Moyenne pondérée des niveaux**
   - Moyenne des niveaux atteints pour chaque standard
   - Pondération égale ou inégale possible
   - Distance entre niveaux paramétrable
   - Condition anti-compensation possible

2. **Maîtrise dominante**
   - Note finale = niveau médian ou modal
   - Simple et résistant à la compensation
   - Peu de variété de notes finales (4 notes possibles)

3. **Grille de conversion globale**
   - Tableau de correspondance niveaux → note
   - Permet d'éviter compensation avec variété de notes
   - Plus complexe mais très flexible

4. **PAN-Maîtrise** (pratique actuelle de Grégoire)
   - Variante de "moyenne pondérée" basée sur les 3 meilleurs artefacts
   - Fenêtre glissante configurable (2, 3, 4, 5 artefacts)
   - Utilise échelle IDME (4 ou 5 niveaux)

### Famille 2 : Notation par spécifications

**Principe** : Lien indirect entre apprentissage et note. La note correspond à un ensemble de productions réalisées selon des spécifications préétablies.

**Caractéristiques** :
- Évaluation dichotomique (conforme / non conforme)
- Peut déroger à la dichotomie (3+ niveaux possibles)
- Tableau de conversion : productions adéquates → note finale
- Exemple : Quiz conforme + Analyse conforme + Dissertation conforme = 80%

**Structure de données différente** :
```javascript
{
  "production": "Quiz de logique",
  "conforme": true,  // Au lieu de niveaux par critères
  "specifications": ["Tous items réussis", "Temps respecté"]
}
```

### Famille 3 : Dénotation

**Principe** : Pas de notes pendant le cours, uniquement rétroaction qualitative. Note finale établie globalement au terme de la session.

**Caractéristiques** :
- Traces qualitatives des apprentissages
- Rétroaction continue sans chiffres
- Jugement global en fin de session
- Note finale collaborative (enseignant + étudiant) ou unilatérale
- Grille globale optionnelle pour guider le jugement

**Structure de données différente** :
```javascript
{
  "retroactions": [
    {
      "date": "2025-11-15",
      "artefact": "Analyse 1",
      "commentaire": "Ta thèse est claire, mais...",
      "traces": ["fichier.pdf"]
    }
  ],
  "jugementFinal": {
    "date": "2025-12-15",
    "note": 80,
    "justification": "Atteinte constante des cibles..."
  }
}
```

---

## 🏗️ ARCHITECTURE PROPOSÉE

### Principe : Single Source of Truth avec Stratégie Pattern

Chaque pratique est un module indépendant implémentant l'interface `IPratique`. Un registre central détecte automatiquement quelle pratique utiliser selon la configuration du cours.

### Interface IPratique (Core)

```javascript
/**
 * Interface que toute pratique de notation doit implémenter
 */
class IPratique {
  // Identité
  obtenirNom()          // Ex: "PAN-Maîtrise", "Sommative traditionnelle"
  obtenirId()           // Ex: "pan-maitrise", "sommative"
  obtenirDescription()  // Description complète pour l'utilisateur
  obtenirFamille()      // "standards", "specifications", "denotation"
  
  // Calculs (retournent des objets avec valeur + métadonnées)
  calculerPerformance(dossiersApprenant)   // Indice P
  calculerCompletion(dossiersApprenant)    // Indice C
  
  // Diagnostic
  detecterDefis(dossiersApprenant)         // Liste des défis identifiés
  identifierPattern(dossiersApprenant)     // Pattern d'apprentissage
  genererCibleIntervention(dossiersApprenant) // Cible RàI
  
  // Configuration (optionnel)
  obtenirOptions()      // Options configurables de la pratique
  validerConfiguration(config) // Valide une configuration
}
```

### Registre de pratiques

```javascript
/**
 * Registre central qui gère toutes les pratiques disponibles
 * /js/pratiques/pratique-registre.js
 */
class PratiqueRegistry {
  constructor() {
    this.pratiques = new Map();
  }
  
  // Enregistre une pratique
  enregistrerPratique(id, instance) {
    this.pratiques.set(id, instance);
  }
  
  // Obtient la pratique active pour un cours
  obtenirPratiqueActive() {
    const config = chargerModalitesEvaluation();
    const pratiqueId = config.pratique || 'pan-maitrise'; // Défaut
    
    if (!this.pratiques.has(pratiqueId)) {
      console.error(`Pratique non trouvée: ${pratiqueId}`);
      return this.pratiques.get('pan-maitrise'); // Fallback
    }
    
    return this.pratiques.get(pratiqueId);
  }
  
  // Liste toutes les pratiques disponibles
  listerPratiquesDisponibles() {
    return Array.from(this.pratiques.values()).map(p => ({
      id: p.obtenirId(),
      nom: p.obtenirNom(),
      famille: p.obtenirFamille(),
      description: p.obtenirDescription()
    }));
  }
}

// Instance globale
const registrePratiques = new PratiqueRegistry();
```

---

## 📦 MODULES À CRÉER

### Structure de dossiers

```
/js/pratiques/
├── pratique-interface.js          # Interface IPratique documentée
├── pratique-registre.js           # Registre central
│
├── /standards/                    # Famille 1
│   ├── pratique-pan-maitrise.js   # ✅ Priorité 1 - Beta 90
│   ├── pratique-standards-moyenne.js
│   ├── pratique-standards-dominante.js
│   └── pratique-standards-grille.js
│
├── /sommative/
│   └── pratique-sommative.js      # ✅ Priorité 1 - Beta 90
│
├── /specifications/               # Famille 2
│   └── pratique-specifications.js # Priorité 2 - Beta 92+
│
└── /denotation/                   # Famille 3
    └── pratique-denotation.js     # Priorité 3 - Beta 95+
```

---

## 🎯 PRIORITÉS DE DÉVELOPPEMENT

### Phase 1 : Beta 90 (Novembre 2025)

**Objectif** : Infrastructure + 2 pratiques de base

#### 1.1 - Créer l'infrastructure

- [ ] `/js/pratiques/pratique-interface.js`
  - Documenter toutes les méthodes obligatoires
  - Exemples de retour pour chaque méthode
  - Définir structures de données

- [ ] `/js/pratiques/pratique-registre.js`
  - Implémentation du registre
  - Détection automatique selon `modalitesEvaluation.pratique`
  - Gestion des erreurs

#### 1.2 - Extraire PAN-Maîtrise

- [ ] `/js/pratiques/standards/pratique-pan-maitrise.js`
  - Isoler toute la logique actuelle dans module dédié
  - Implémenter interface `IPratique`
  - Méthodes spécifiques :
    * `calculerPerformance()` : moyenne des 3 meilleurs artefacts
    * `detecterDefis()` : défis SRPNF spécifiques
    * `identifierPattern()` : patterns basés sur SRPNF
    * `genererCibleIntervention()` : cibles RàI avec critères SRPNF

#### 1.3 - Créer Sommative

- [ ] `/js/pratiques/sommative/pratique-sommative.js`
  - Nouvelle implémentation propre
  - `calculerPerformance()` : moyenne pondérée de TOUTES les évaluations
  - `detecterDefis()` : défis génériques (pas SRPNF)
  - `identifierPattern()` : patterns basés sur tendance notes
  - `genererCibleIntervention()` : cibles génériques

#### 1.4 - Migration modules existants

- [ ] Adapter tous les modules qui calculent P ou C
  - `/js/statistiques.js`
  - `/js/profil-etudiant.js`
  - `/js/interventions.js`
  - `/js/pratiques.js`
  - etc.

- [ ] Remplacer appels directs par :
```javascript
// Avant (hardcodé)
const P = calculerPerformancePAN(da);

// Après (via registre)
const pratique = registrePratiques.obtenirPratiqueActive();
const resultat = pratique.calculerPerformance(da);
const P = resultat.valeur;
```

#### 1.5 - Tests et validation

- [ ] Tests avec données démo (30 étudiants)
- [ ] Vérifier que résultats PAN-Maîtrise identiques
- [ ] Vérifier que Sommative donne résultats différents
- [ ] Valider mode comparatif SOM/PAN

**Livrables Beta 90** :
- ✅ Architecture modulaire fonctionnelle
- ✅ 2 pratiques opérationnelles (PAN-Maîtrise, Sommative)
- ✅ Aucune régression fonctionnelle
- ✅ Code propre et documenté

---

### Phase 2 : Beta 91-92 (Décembre 2025 - Mars 2026)

**Objectif** : Variantes Standards (si demandées dans sondage)

#### 2.1 - PAN-Moyenne pondérée

- [ ] `/js/pratiques/standards/pratique-standards-moyenne.js`
  - Moyenne de tous les niveaux (pas juste 3 meilleurs)
  - Options de pondération (égale/inégale)
  - Condition anti-compensation configurable

#### 2.2 - PAN-Maîtrise dominante

- [ ] `/js/pratiques/standards/pratique-standards-dominante.js`
  - Calcul médiane ou mode des niveaux
  - 4 notes finales possibles seulement
  - Résiste naturellement à la compensation

#### 2.3 - PAN-Grille de conversion

- [ ] `/js/pratiques/standards/pratique-standards-grille.js`
  - Tableau de correspondance personnalisé
  - Pondération différente par standard
  - Standard terminal obligatoire

**Livrables Beta 91-92** :
- ✅ Famille Standards complète (4 variantes)
- ✅ Interface de sélection de pratique
- ✅ Documentation utilisateur par pratique

---

### Phase 3 : Beta 95+ (Avril-Mai 2026)

**Objectif** : Spécifications (si adoption > 15% dans sondage)

#### 3.1 - Nouveau modèle de données

- [ ] Ajouter support évaluation dichotomique
```javascript
{
  "evaluations": [
    {
      "id": "P1-quiz",
      "production": "Quiz de logique",
      "conforme": true,  // Au lieu de niveaux
      "specifications": ["Items réussis", "Temps respecté"]
    }
  ]
}
```

#### 3.2 - Module Spécifications

- [ ] `/js/pratiques/specifications/pratique-specifications.js`
  - `obtenirTableauConversion()` : productions requises par note
  - `calculerPerformance()` : selon nombre conformes
  - `evaluerConformite()` : vérifie spécifications

#### 3.3 - Interface d'évaluation adaptée

- [ ] Toggle "Conforme / Non conforme"
- [ ] Liste des spécifications à cocher
- [ ] Calcul automatique conformité

**Livrables Beta 95** :
- ✅ Support Spécifications fonctionnel
- ✅ Compatibilité avec évaluations existantes
- ✅ Documentation complète

---

### Phase 4 : Beta 97+ (Été 2026)

**Objectif** : Dénotation (si adoption > 10% dans sondage)

#### 4.1 - Mode sans notation

```javascript
{
  "retroactions": [
    {
      "date": "2025-11-15",
      "artefact": "Analyse 1",
      "commentaire": "Ta thèse est claire, mais...",
      "traces": ["fichier.pdf"]
    }
  ]
}
```

#### 4.2 - Jugement final

```javascript
{
  "jugementFinal": {
    "date": "2025-12-15",
    "note": 80,
    "justification": "Atteinte constante des cibles...",
    "tracesConsiderees": ["id1", "id2", "id3"]
  }
}
```

#### 4.3 - Option collaborative

```javascript
{
  "jugementFinal": {
    "propositionEtudiant": 85,
    "propositionEnseignant": 80,
    "noteFinal": 82,
    "negociation": "Discussion le 2025-12-14..."
  }
}
```

**Livrables Beta 97** :
- ✅ Mode dénotation complet
- ✅ Interface de jugement final
- ✅ Option négociation note

---

## 🔧 CONSIDÉRATIONS TECHNIQUES

### 1. Coexistence des modèles

Différentes pratiques = différents modèles de données. Stratégie :

```javascript
// Détection automatique du modèle
function chargerEvaluation(id) {
  const eval = localStorage.getItem(id);
  
  if (eval.niveaux) {
    // Modèle Standards
    return new EvaluationStandards(eval);
  } else if (eval.conforme !== undefined) {
    // Modèle Spécifications
    return new EvaluationSpecifications(eval);
  } else if (eval.retroaction) {
    // Modèle Dénotation
    return new TraceDenotation(eval);
  }
}
```

### 2. Extension de l'interface (Phases 3-4)

Pour Spécifications et Dénotation, l'interface devra s'étendre :

```javascript
class IPratiqueEtendue extends IPratique {
  // Capacités de la pratique
  supporte() {
    return {
      notationContinue: boolean,      // Standards, Sommative
      notationDichotomique: boolean,  // Spécifications
      notationDifferee: boolean       // Dénotation
    };
  }
  
  // Pour spécifications
  evaluerConformite?(production, specifications)
  
  // Pour dénotation
  accepterRetroaction?(trace)
  genererJugementFinal?(traces)
}
```

### 3. Migration douce

Principe : ne jamais casser les données existantes

```javascript
// Script de migration optionnel
function migrerVersPratique(pratiqueCible) {
  const etudiants = chargerEtudiants();
  
  etudiants.forEach(etudiant => {
    etudiant.evaluations.forEach(eval => {
      if (pratiqueCible.peutMigrer(eval)) {
        eval = pratiqueCible.convertir(eval);
      } else {
        console.warn("Évaluation non migrable", eval.id);
      }
    });
  });
}
```

---

## 📊 DÉCISIONS BASÉES SUR DONNÉES

**Après sondage du 19 novembre 2025**, prioriser selon adoption réelle :

| Pratique | Complexité | Priorité si adoption |
|----------|------------|---------------------|
| PAN-Maîtrise | Fait | ✅ Beta 90 |
| Sommative | Fait | ✅ Beta 90 |
| Standards-Moyenne | Faible | > 20% → Beta 92 |
| Standards-Dominante | Faible | > 5% → Beta 93 |
| Standards-Grille | Moyenne | > 10% → Beta 93 |
| Spécifications | Élevée | > 15% → Beta 95 |
| Dénotation | Très élevée | > 10% → Beta 97 |

**Principe** : Implémenter uniquement ce qui est **réellement utilisé**.

---

## ✅ CRITÈRES DE SUCCÈS

### Beta 90 (Infrastructure + 2 pratiques)

- ✅ Interface `IPratique` claire et documentée
- ✅ Registre fonctionnel avec détection auto
- ✅ PAN-Maîtrise extrait et modulaire
- ✅ Sommative implémentée proprement
- ✅ Tous modules migrés vers architecture
- ✅ Aucune régression fonctionnelle
- ✅ Tests passants
- ✅ Code clean et documenté

### Betas suivantes

- ✅ Nouvelles pratiques ajoutées sans modifier code existant
- ✅ Interface de sélection intuitive
- ✅ Documentation utilisateur par pratique
- ✅ Migrations de données sans perte
- ✅ Performance maintenue

---

## 🚀 COMMENCER PAR QUOI ?

### Ordre de développement recommandé

1. **Créer `/js/pratiques/pratique-interface.js`**
   - Documenter l'interface complète
   - Exemples pour chaque méthode

2. **Créer `/js/pratiques/pratique-registre.js`**
   - Implémentation du registre
   - Tests avec pratique factice

3. **Extraire PAN-Maîtrise**
   - Copier logique existante
   - Adapter pour implémenter IPratique
   - Tester que résultats identiques

4. **Créer Sommative**
   - Nouvelle implémentation
   - Vérifier différence avec PAN

5. **Migrer modules un par un**
   - Commencer par `/js/statistiques.js`
   - Tester après chaque migration
   - Commit entre chaque module

---

## 📝 NOTES POUR CLAUDE CODE

### Ce qui existe déjà (Beta 90)

- Architecture localStorage (migration IndexedDB en cours)
- Calculs P-C-A hardcodés pour PAN-Maîtrise
- Support parallèle SOM/PAN (calculs séparés)
- Interface utilisateur complète
- 17 modules JavaScript
- ~18,500 lignes de code

### Ce qui doit changer

- Extraire logique métier dans modules pratiques
- Remplacer appels directs par appels via registre
- Garder compatibilité données existantes
- Maintenir toutes fonctionnalités actuelles

### Contraintes importantes

- Ne pas casser les données existantes
- Pas de régression fonctionnelle
- Code propre et bien documenté
- Tests à chaque étape

### Philosophie

**Single Source of Truth** : Chaque donnée a UNE source autoritaire. Les autres modules lisent, ne recalculent pas.

**Extensibilité** : Ajouter une pratique = créer un module, pas modifier l'existant.

**Migration douce** : Nouvelles structures coexistent avec anciennes.

---

**Document vivant** - Mise à jour selon résultats du sondage du 19 novembre 2025
