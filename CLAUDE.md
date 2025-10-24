# Système de monitorage pédagogique - Application web

## Vue d'ensemble du projet

Application web autonome de suivi des apprentissages convertie depuis un tableur Numbers.
Permet le monitorage pédagogique avec calcul automatique d'indices prédictifs (A-C-P) et génération de diagnostics personnalisés.

**Contrainte principale** : 100% autonome, fonctionnement hors-ligne, données en localStorage uniquement.

---

## Architecture technique

### Stack technologique
- **Frontend** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dépendance externe)
- **Stockage** : localStorage uniquement
- **Compatibilité** : Navigateurs modernes (Safari, Chrome, Firefox, Edge)
- **Système d'exploitation de dev** : macOS Sequoia 15.5 (M3) / iPadOS 18.5 (M1)

### Principe architectural fondamental

**Single Source of Truth** : Chaque donnée a UNE source unique qui la génère et la stocke.
Les autres modules la **lisent** via localStorage, jamais de duplication de logique.

```
MODULE SOURCE (génère/stocke)     MODULE LECTEUR (lit/affiche)
├─ trimestre.js                   ├─ calendrier-vue.js
│  └─ calendrierComplet          │  └─ lit calendrierComplet
│                                │
├─ saisie-presences.js           ├─ tableau-bord-apercu.js
│  └─ indicesAssiduite           │  └─ lit les indices A
│                                │
└─ portfolio.js                  └─ tableau-bord-apercu.js
   └─ indicesCP                     └─ lit les indices C et P
```

**Règle d'or** : Les modules ne se parlent JAMAIS directement. Communication via localStorage uniquement.

---

## Structure des fichiers

```
projet/
├── index 70 (refonte des modules).html   # Point d'entrée actuel
├── css/
│   └── styles.css                        # Styles globaux
├── js/
│   ├── config.js                         # ⚠️ PROTÉGÉ - Configuration globale
│   ├── navigation.js                     # ⚠️ PROTÉGÉ - Gestion navigation
│   ├── main.js                           # Initialisation
│   │
│   ├── trimestre.js                      # ✅ SOURCE - Calendrier complet
│   ├── calendrier-vue.js                 # ✅ LECTEUR - Affichage calendrier
│   ├── saisie-presences.js               # ✅ SOURCE - Indices assiduité (A)
│   ├── tableau-bord-apercu.js            # ✅ LECTEUR - Affichage tableau de bord
│   ├── profil-etudiant.js                # ✅ LECTEUR - Profil individuel complet
│   │
│   ├── etudiants.js                      # Gestion étudiants
│   ├── productions.js                    # À créer - Productions/évaluations
│   ├── portfolio.js                      # À créer - Indices C et P
│   ├── grilles.js                        # Grilles de critères SRPNF
│   ├── echelles.js                       # Échelle IDME (SOLO)
│   ├── cartouches.js                     # Cartouches de rétroaction
│   ├── horaire.js                        # Horaire des séances
│   ├── groupe.js                         # Liste des étudiants
│   ├── cours.js                          # Informations du cours
│   ├── pratiques.js                      # Pratiques de notation (PAN)
│   ├── import-export.js                  # Import/export JSON
│   └── statistiques.js                   # Calculs statistiques
│
├── CLAUDE.md                             # Ce fichier
├── README_PROJET.md                      # Documentation projet
├── COLLAB_RULES.txt                      # Règles de collaboration
├── noms_stables.json                     # Registre des noms protégés
└── structure-modulaire.txt               # Documentation architecture
```

---

## Système de monitorage : concepts pédagogiques

### Les trois indices primaires (A-C-P)

**Assiduité (A)** : Présence en classe
- Mesure l'engagement cognitif
- Source : `saisie-presences.js` → `localStorage.indicesAssiduiteDetailles`

**Complétion (C)** : Remise des travaux
- Mesure la mobilisation
- Source : `portfolio.js` → `localStorage.indicesCP`

**Performance (P)** : Qualité des productions
- Mesure la maîtrise
- Source : `portfolio.js` → `localStorage.indicesCP`

### Critères d'évaluation SRPNF

- **Structure** (15%) : Organisation logique des idées
- **Rigueur** (20%) : Exhaustivité des observations
- **Plausibilité** (10%) : Crédibilité de l'interprétation
- **Nuance** (25%) : Qualité du raisonnement
- **Français** (30%) : Maîtrise linguistique

### Taxonomie SOLO et échelle IDME

| SOLO | IDME | Score | Compréhension |
|------|------|-------|---------------|
| Préstructurel | **I**nsuffisant | < .40 | Incompréhension |
| Unistructurel | **I**nsuffisant | < .64 | Superficielle |
| Multistructurel | **D**éveloppement | .65-.74 | Points pertinents sans liens |
| Relationnel | **M**aîtrisé | .75-.84 | Compréhension globale avec liens |
| Abstrait étendu | **E**tendu | >= .85 | Transfert à autres contextes |

---

## Standards de code CRITIQUES

### ⚠️ ZONES STRICTEMENT PROTÉGÉES

**INTERDICTION ABSOLUE de modifier** (sauf commentaires) :

1. **config.js** : Configuration navigation, variables globales, `configurationsOnglets`
2. **navigation.js** : Logique de navigation sections/sous-sections
3. **Noms dans noms_stables.json** : IDs, classes CSS, fonctions listées

### Conventions de nommage (à respecter)

**Fonctions** :
```javascript
// ✅ BON - Préfixes descriptifs cohérents
genererCalendrierComplet()      // Génère des données
obtenirInfosJour(date)          // Récupère des données
calculerIndicesAssiduité()      // Calcule des valeurs
afficherTableauBord()           // Affichage visuel
formaterDateTrimestreYMD(date)  // Formatage avec contexte

// ❌ MAUVAIS - Conflits de noms génériques
formaterDate()  // Trop générique, conflits entre modules
getInfo()       // Non descriptif
process()       // Ambigu
```

**Variables localStorage** :
```javascript
// Format : nomModule + TypeDonnees
localStorage.calendrierComplet            // trimestre.js
localStorage.indicesAssiduiteDetailles    // saisie-presences.js
localStorage.indicesCP                     // portfolio.js (à créer)
localStorage.seancesCompletes             // horaire.js (futur)
```

**Classes CSS** :
```javascript
// Réutiliser les classes existantes
.item-carte                  // Conteneur carte
.item-carte-header          // En-tête de carte
.item-carte-body            // Corps de carte
.statut-badge               // Badge de statut
.statistique-item           // Item statistique
```

### Workflow de modification

**AVANT toute modification** :
1. ✅ Sauvegarder (commit Git ou copie manuelle)
2. ✅ Vérifier `noms_stables.json`
3. ✅ Lire la doc du module concerné
4. ✅ Identifier la zone `<!-- LLM:OK_TO_EDIT -->`

**PENDANT la modification** :
1. ✅ Patch minimal uniquement
2. ✅ Respecter le style existant
3. ✅ Pas de renommage d'éléments existants
4. ✅ Commenter les ajouts importants

**APRÈS la modification** :
1. ✅ Test immédiat dans Safari/Chrome
2. ✅ Vérifier la console (erreurs JS)
3. ✅ Tester le flux complet utilisateur
4. ✅ Commit si succès, rollback si échec

---

## État actuel du projet (octobre 2025)

### ✅ Fonctionnalités complétées

**MODULE trimestre.js** (Commit 1 - complété)
- Génération du `calendrierComplet` (124 jours)
- API : `obtenirCalendrierComplet()` et `obtenirInfosJour(date)`
- Gestion congés prévus/imprévus et reprises
- Calcul automatique des semaines (5 jours cours = 1 semaine)
- Interface admin complète

**MODULE calendrier-vue.js** (Commit 2 - complété)
- Lecture seule de `calendrierComplet`
- Affichage visuel du calendrier
- Suppression du code mort (recalculs)

**MODULE saisie-presences.js** (Session 20 octobre - complété)
- Calcul des indices A (assiduité)
- Stockage dans `indicesAssiduiteDetailles`
- Périodes configurables (3, 7, 12 derniers artefacts)

**MODULE tableau-bord-apercu.js** (Session 20 octobre - complété)
- Affichage des indices A
- Lecture depuis `indicesAssiduiteDetailles`
- Rechargement automatique

**MODULE profil-etudiant.js** (Session 24 octobre - refonte complète)
- Layout 2 colonnes : sidebar de navigation + zone de contenu principale
- Navigation Précédent/Suivant entre étudiants (boutons centrés)
- 3 sections structurées :
  1. Suivi de l'apprentissage (indices R, RàI, échelle de risque visuelle)
  2. Développement des habiletés et compétences (performance SRPNF)
  3. Mobilisation (assiduité, complétion, artefacts)
- Système d'interprétation harmonisé (seuils A/C/M : 70%, 80%, 85%)
- Échelle de risque avec gradient 6 niveaux et indicateur de position
- Toggles uniformes pour détails techniques et formules
- Badges épurés sans icônes redondantes
- Recommandations RàI selon niveau de risque
- Diagnostic SRPNF avec forces et défis identifiés

**MODULE styles.css** (Session 24 octobre - améliorations accessibilité)
- État `.btn:disabled` avec opacité et curseur appropriés
- Pseudo-classe `:hover:not(:disabled)` sur tous les boutons
- Amélioration accessibilité navigation (boutons désactivés visuellement distincts)

**MODULE portfolio.js** (Session 24 octobre - implémentation Single Source of Truth)
- Calcul et stockage des indices C (Complétion) et P (Performance)
- Structure `localStorage.indicesCP` avec historique longitudinal
- API : `calculerEtStockerIndicesCP()`, `obtenirIndicesCP(da)`, `obtenirHistoriqueIndicesCP(da)`
- Déclencheurs automatiques lors des évaluations et sélections d'artefacts
- Sélection automatique des N meilleurs artefacts (PAN)
- Adaptation des lecteurs (profil-etudiant.js, tableau-bord-apercu.js)

**CORRECTIONS IMPORTANTES** (Session 24 octobre)
- ✅ Harmonisation des seuils d'interprétation A/C/M (incohérence "75% = bon vs fragile" corrigée)
- ✅ Réduction redondance affichage indice C (3 occurrences → 1)
- ✅ Suppression bouton "Retour à la liste" dupliqué dans index 71
- ✅ Mise à jour Documentation profil-etudiant.md (1218 → 3696 lignes)
- ✅ Mise à jour Documentation Style CSS.md (Beta 0.50 → 0.55)

### 🔴 Prochaines priorités

1. **MODULE horaire.js** - À refondre
   - Générer `seancesCompletes` comme source unique
   - Gestion des reprises (ex: "Horaire du lundi" le jeudi)
   - API : `obtenirSeancesCompletes()`

2. **MODULE productions.js** - À créer
   - Gestion des artefacts/productions
   - Évaluations selon critères SRPNF
   - Lien avec grilles.js et echelles.js

---

## Commandes bash courantes

```bash
# Test local
open "index 70 (refonte des modules).html"   # macOS

# Voir localStorage dans console Safari
localStorage.getItem('calendrierComplet')
localStorage.getItem('indicesAssiduiteDetailles')

# Debug - Vérifier existence données
!!localStorage.getItem('calendrierComplet')  # true/false
JSON.parse(localStorage.getItem('calendrierComplet'))  # Voir contenu
```

---

## Format de demande standardisé pour Claude Code

```markdown
CONTEXTE : [Module concerné et sa fonction]
OBJECTIF : [Une seule tâche précise]
ZONES AUTORISÉES : [Fichier et lignes modifiables]
NOMS STABLES : [Référencer noms_stables.json si pertinent]
EXTRAIT : [40-100 lignes de code pertinentes]
ATTENDU : [Comportement visible souhaité]
FORMAT : [Patch minimal / diff / code complet si nouveau module]
```

---

## Problèmes connus et solutions

### "Invalid Date" dans le calendrier
**Cause** : Conflit de noms de fonctions entre modules
**Solution** : Préfixer les fonctions par leur contexte (ex: `formaterDateTrimestreYMD`)

### Calendrier vide après rechargement
**Cause** : `calendrierComplet` pas généré ou corrompu
**Solution** : Aller dans Réglages → Trimestre → Régénérer le calendrier

### Indices A non calculés
**Cause** : Présences pas saisies ou module non initialisé
**Solution** : Vérifier ordre de chargement dans index 70, aller dans Présences → Saisie

### Données perdues
**Cause** : localStorage effacé (navigation privée, nettoyage navigateur)
**Solution** : Utiliser Import/Export régulièrement pour backup JSON

---

## Debug général

```javascript
// Console navigateur - Vérifier données
console.log('calendrierComplet existe?', !!localStorage.getItem('calendrierComplet'));
console.log('Nombre de jours:', Object.keys(JSON.parse(localStorage.getItem('calendrierComplet'))).length);

console.log('Indices A existent?', !!localStorage.getItem('indicesAssiduiteDetailles'));
console.log('Contenu indices:', JSON.parse(localStorage.getItem('indicesAssiduiteDetailles')));

// Vérifier APIs disponibles
console.log('API calendrier:', typeof obtenirCalendrierComplet);
console.log('API infos jour:', typeof obtenirInfosJour);
```

---

## Licence et partage

**Licence** : Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)
- ✅ Partage et adaptation autorisés (sans usage commercial)
- ✅ Attribution requise
- ✅ Redistribution sous même licence

**Ressources** :
- Guide de monitorage complet : Labo Codex (https://codexnumeris.org/apropos)
- Articles publiés : Revue Pédagogie collégiale (printemps-été 2024, hiver 2025)

---

## Notes importantes pour Claude Code

1. **Ce projet est complexe** : Prendre le temps de comprendre l'architecture avant de modifier
2. **Tester immédiatement** : Ouvrir dans Safari après chaque modification
3. **Pas de fantaisie** : Respecter strictement le style existant
4. **Documenter** : Ajouter des commentaires pour les modifications importantes
5. **Questions bienvenues** : Demander des clarifications plutôt que supposer

**L'objectif pédagogique** : Faire mentir les prédictions de risque par des interventions proactives !