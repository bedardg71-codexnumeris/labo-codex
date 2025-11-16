# Plan de match - Beta 0.90

**Date de création** : 4 novembre 2025
**Version actuelle** : Beta 0.89
**Version cible** : Beta 0.90
**Délai estimé** : 2-3 semaines (mi-novembre 2025)
**Objectif principal** : Suivi longitudinal et consolidation fonctionnalités Phase 1
**Nouvelle décision** : Intégration de Chart.js pour graphiques professionnels

---

## 📊 DÉCISION TECHNIQUE : Intégration de Chart.js

### Contexte

Après analyse des besoins de visualisation (graphiques évolution, aires empilées, trajectoires multiples), **la décision a été prise d'intégrer Chart.js** pour accélérer le développement et améliorer la qualité des graphiques.

### Chart.js - Caractéristiques

- **Licence** : MIT (gratuit, open source, compatible CC BY-NC-SA)
- **Taille** : ~200 KB (chart.min.js minifié)
- **Installation** : Fichier téléchargé localement (pas de CDN, fonctionne hors ligne)
- **Communauté** : 41,000+ stars GitHub, 200+ contributeurs
- **Site officiel** : https://www.chartjs.org/

### Avantages pour le projet

- ✅ **Gain de temps** : 10-15 jours de dev → 2-3 jours pour graphiques complexes
- ✅ **Qualité professionnelle** : Graphiques similaires à Numbers/Excel
- ✅ **Fonctionnalités incluses** : Tooltips, zoom, export PNG, animations, responsive
- ✅ **Maintenance** : Bugs corrigés par la communauté (millions d'utilisateurs)
- ✅ **Autonomie préservée** : Fichier local, aucune dépendance internet
- ✅ **Open source** : Code source public, auditable, modifiable

### Impact sur l'architecture

**Avant (Beta 0.89)** :
```
index 89.html
├── js/config.js
├── js/navigation.js
├── js/main.js
└── ... (27 modules)
```

**Après (Beta 0.90)** :
```
index 90.html
├── libs/chart.min.js  ← NOUVEAU (téléchargé une fois)
├── js/config.js
├── js/navigation.js
├── js/main.js
├── js/snapshots.js    ← NOUVEAU (gestion snapshots)
├── js/graphiques.js   ← NOUVEAU (utilise Chart.js)
└── ... (27 modules existants)
```

### Graphiques maintenant possibles

Avec Chart.js, on peut reproduire **tous les graphiques** du tableur Numbers :

1. ✅ **Évolution performance** : Zones colorées IDME + trajectoires multiples (spaghetti chart)
2. ✅ **Évolution indices** : Aires empilées avec 7 indices (A, C, P, Mobilisation, etc.)
3. ✅ **Comparaison SOM vs PAN** : Courbes simples avec lignes de tendance pointillées
4. ✅ **Risque d'échec individuel** : Trajectoires individuelles à travers zones de risque
5. ✅ **Export PNG** : Sauvegarder graphiques pour rapports/présentations

### Calendrier révisé

**Beta 0.90** (mi-novembre) :
- Graphiques simples A-C-P avec Chart.js (2 jours au lieu de 5)
- Temps gagné réinvesti dans snapshots et cartouches

**Beta 0.95** (décembre) :
- Graphiques avancés (aires empilées, zones colorées, trajectoires multiples)
- Tous les graphiques Numbers reproduits

---

## 🎯 Vision Beta 0.90

### Objectifs prioritaires

La Beta 0.90 marque une étape cruciale vers la version 1.0 en ajoutant la **dimension temporelle** au système de monitorage. Elle permettra de :

1. **Capturer et figer les données** lors d'interventions terminées (snapshots d'interventions)
2. **Suivre l'évolution hebdomadaire** de chaque étudiant (snapshots hebdomadaires)
3. **Reconstruire l'historique passé** pour analyses longitudinales (snapshots rétroactifs)
4. **Compléter les fonctionnalités** partiellement implémentées (cartouches, recommandations)

### Impact pédagogique attendu

- ✅ **Évaluation d'impact** : Identifier les interventions les plus efficaces en comparant snapshots avant/après
- ✅ **Détection de tendances** : Repérer décrochages progressifs ou rebonds après intervention
- ✅ **Justification décisions** : Données historiques objectives pour API ou comités pédagogiques
- ✅ **Amélioration continue** : Apprentissage basé sur l'historique (quelles interventions marchent le mieux ?)

---

## 📅 Fonctionnalités planifiées

### 🎯 PRIORITÉ 1 : Système de snapshots (NOUVELLE - 8-10 jours)

#### 1.1 Snapshots d'interventions terminées

**Objectif** : Figer les données des participants au moment où une intervention est marquée "terminée", permettant de mesurer l'impact des interventions sur l'évolution des étudiants.

**Fonctionnalités** :

- [ ] **Capture automatique lors du changement de statut** (interventions.js)
  - Lors clic sur "Marquer comme terminée" dans une intervention
  - Pour chaque participant (étudiant ayant participé à l'intervention) :
    * Niveau RàI actuel (0, 1, 2, ou 3)
    * Risque d'échec (calculé avec formule 1 - A×C×P)
    * Indices A, C, P (valeurs actuelles au moment de l'intervention)
    * Détails SRPNF (forces, défis identifiés)
    * Tendance actuelle (amélioration, stable, baisse)
  - Stockage dans champ `participantsSnapshot` de l'intervention

- [ ] **Structure de données** (localStorage.interventions)
  ```javascript
  intervention: {
    id: "intervention-1730123456789",
    titre: "Rencontre CAF - Groupe A",
    type: "rencontre-individuelle",
    statut: "completee",  // "planifiee", "en-cours", "completee", "annulee"
    dateDebut: "2025-11-05",
    dateTerminee: "2025-11-12",  // Date à laquelle marquée comme terminée
    participantsActuels: ["1234567", "2345678"],  // Liste DAs actuels
    participantsSnapshot: {  // NOUVEAU - Fige les données au moment de complétion
      "1234567": {
        dateCapture: "2025-11-12",
        niveauRaI: 2,
        risqueEchec: 0.35,
        indices: { A: 0.72, C: 0.68, P: 0.65 },
        srpnf: {
          forces: ["Nuance"],
          defis: ["Structure", "Français"],
          moyennes: { S: 62, R: 68, P: 70, N: 75, F: 58 }
        },
        tendance: "stable"  // "amelioration", "stable", "baisse"
      },
      "2345678": { /* ... */ }
    },
    notes: "Intervention très productive..."
  }
  ```

- [ ] **Interface visualisation de l'impact** (nouvelle section Analyse d'impact)
  - Onglet "Analyse d'impact" dans la page de consultation d'une intervention terminée
  - Tableau comparatif : État au moment de l'intervention vs État actuel
  - Colonnes : Étudiant | RàI avant | RàI maintenant | Évolution | Risque avant | Risque maintenant | Δ Risque
  - Indicateurs visuels : 📈 (amélioration), ➡️ (stable), 📉 (détérioration)
  - Calcul automatique du taux de réussite de l'intervention :
    * % étudiants améliorés (RàI diminué ou risque réduit de > 10%)
    * % étudiants stables (pas de changement significatif)
    * % étudiants détériorés (RàI augmenté ou risque accru de > 10%)

- [ ] **Filtres et analyses** (section Accompagnement › Interventions)
  - Filtre "Interventions les plus efficaces" (trier par % amélioration)
  - Filtre "Type d'intervention" (rencontre, atelier, suivi, etc.) + affichage taux réussite moyen par type
  - Alerte si intervention avec 0% amélioration (suggérer révision stratégie)

#### 1.2 Snapshots hebdomadaires automatiques

**Objectif** : Créer un portrait hebdomadaire complet de chaque étudiant pour permettre analyses longitudinales et détection de tendances.

**Fonctionnalités** :

- [ ] **Structure de données** (nouveau localStorage.snapshotsHebdomadaires)
  ```javascript
  snapshotsHebdomadaires: {
    "2025-11-04": {  // Date du snapshot (format YYYY-MM-DD, toujours un lundi)
      "1234567": {  // DA étudiant
        dateCapture: "2025-11-04T14:30:00",  // Timestamp exact
        typeCapture: "automatique",  // "automatique", "manuel", "reconstruit"
        semaine: 10,  // Numéro de semaine depuis début trimestre
        indices: {
          A: 0.75,
          C: 0.68,
          P: 0.72
        },
        risqueEchec: 0.28,
        niveauRaI: 1,
        srpnf: {
          moyennes: { S: 68, R: 72, P: 70, N: 75, F: 65 },
          forces: ["Nuance", "Plausibilité"],
          defis: ["Structure"]
        },
        tendance: "amelioration",  // Calculée par comparaison avec semaine précédente
        details: {
          nbPresences: 8,
          nbAbsences: 2,
          nbArtefactsRemis: 3,
          nbArtefactsAttendus: 4,
          nbEvaluationsCompletes: 3,
          moyenneGenerale: 72.5
        }
      },
      "2345678": { /* ... */ }
    },
    "2025-10-28": { /* snapshots semaine précédente */ },
    "2025-10-21": { /* ... */ }
  }
  ```

- [ ] **Déclencheurs de capture automatique**
  - Option 1 (recommandée) : Bouton manuel "Créer snapshot hebdomadaire" dans Réglages › Trimestre
    * L'enseignant déclenche manuellement chaque lundi (ou fin de semaine)
    * Évite captures inutiles si enseignant n'utilise pas l'outil pendant plusieurs jours
  - Option 2 (future) : Capture automatique lors du premier chargement un lundi
    * Détection : Si dernier snapshot < 7 jours ET jour actuel = lundi → capturer
    * Évite captures multiples si chargement plusieurs fois le même jour

- [ ] **Fonction de capture** (nouveau fichier js/snapshots.js)
  ```javascript
  function creerSnapshotHebdomadaire() {
    const dateSnapshot = obtenirLundiSemaineCourante();  // Toujours un lundi
    const etudiants = JSON.parse(localStorage.getItem('etudiants') || '[]');
    const snapshots = JSON.parse(localStorage.getItem('snapshotsHebdomadaires') || '{}');

    if (snapshots[dateSnapshot]) {
      const confirmer = confirm('Un snapshot existe déjà pour cette semaine. Écraser ?');
      if (!confirmer) return;
    }

    snapshots[dateSnapshot] = {};

    etudiants.forEach(etudiant => {
      const da = etudiant.da;
      const indices = obtenirIndicesCP(da);  // Depuis portfolio.js
      const indicesA = obtenirIndiceAssiduiteEtudiant(da);  // Depuis saisie-presences.js
      const srpnf = calculerMoyennesSRPNF(da);  // À créer
      const risque = calculerRisqueEchec(da);  // 1 - A×C×P
      const niveauRaI = determinerNiveauRaI(risque);  // 0, 1, 2, ou 3
      const tendance = calculerTendance(da, dateSnapshot);  // Comparer avec semaine précédente

      snapshots[dateSnapshot][da] = {
        dateCapture: new Date().toISOString(),
        typeCapture: 'automatique',
        semaine: calculerNumeroSemaine(dateSnapshot),
        indices: {
          A: indicesA.actuel || 0,
          C: indices.actuel.C || 0,
          P: indices.actuel.P || 0
        },
        risqueEchec: risque,
        niveauRaI: niveauRaI,
        srpnf: srpnf,
        tendance: tendance,
        details: obtenirDetailsEtudiant(da)
      };
    });

    localStorage.setItem('snapshotsHebdomadaires', JSON.stringify(snapshots));
    console.log(`Snapshot hebdomadaire créé pour le ${dateSnapshot}`);
  }
  ```

- [ ] **Interface de gestion** (section Réglages › Trimestre)
  - Nouveau bouton "📸 Créer snapshot hebdomadaire" en haut de la section Trimestre
  - Liste des snapshots existants avec dates et nombre d'étudiants capturés
  - Bouton "Voir" pour chaque snapshot (affiche tableau récapitulatif)
  - Bouton "Supprimer" pour nettoyer snapshots erronés ou tests
  - Badge indicateur : "Dernier snapshot : il y a X jours" (alerte si > 7 jours)

- [ ] **Visualisation des snapshots** (profil étudiant)
  - Nouvelle sous-section "Évolution hebdomadaire" dans Suivi de l'apprentissage
  - Tableau : Semaine | A | C | P | Risque | RàI | Tendance | Évolution
  - Graphique linéaire simple (SVG custom) : Évolution A-C-P sur les 8 dernières semaines
  - Détection automatique de patterns :
    * 🔴 Décrochage progressif : 3+ semaines consécutives en baisse
    * 🟢 Rebond : Baisse suivie d'amélioration significative (> 15%)
    * 🟡 Instabilité : Alternance amélioration/baisse (volatilité élevée)

#### 1.3 Reconstruction rétroactive de snapshots

**Objectif** : Permettre de créer des snapshots pour les semaines passées en recalculant les indices à partir des données historiques existantes (presences, evaluations).

**Fonctionnalités** :

- [ ] **Détection des données disponibles**
  - Analyser `localStorage.presences` pour dates de saisie disponibles
  - Analyser `localStorage.evaluations` pour dates d'évaluations disponibles
  - Identifier les lundis des semaines passées avec suffisamment de données

- [ ] **Interface de reconstruction** (Réglages › Trimestre)
  - Bouton "🔄 Reconstruire snapshots passés"
  - Modal affichant :
    * Liste des semaines détectées (ex: "Semaine du 14 oct - Données disponibles : ✅ Présences, ✅ Évaluations")
    * Checkboxes pour sélectionner semaines à reconstruire
    * Avertissement : "Snapshots reconstruits = approximation (données modifiées/supprimées non prises en compte)"
  - Bouton "Reconstruire X semaines sélectionnées"
  - Barre de progression pendant reconstruction (peut être long si 10+ semaines)

- [ ] **Logique de reconstruction** (snapshots.js)
  ```javascript
  function reconstruireSnapshotRetroactif(dateSnapshot) {
    const etudiants = JSON.parse(localStorage.getItem('etudiants') || '[]');
    const presences = JSON.parse(localStorage.getItem('presences') || '{}');
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    const snapshots = JSON.parse(localStorage.getItem('snapshotsHebdomadaires') || '{}');

    snapshots[dateSnapshot] = {};

    etudiants.forEach(etudiant => {
      const da = etudiant.da;

      // Filtrer données jusqu'à dateSnapshot (incluse)
      const presencesJusqua = filtrerPresencesJusqua(presences, dateSnapshot);
      const evaluationsJusqua = filtrerEvaluationsJusqua(evaluations, da, dateSnapshot);

      // Recalculer indices avec données filtrées
      const indicesA = calculerIndiceARetroactif(da, presencesJusqua);
      const indicesCP = calculerIndicesCPRetroactif(da, evaluationsJusqua);
      const risque = 1 - (indicesA * indicesCP.C * indicesCP.P);
      const niveauRaI = determinerNiveauRaI(risque);

      snapshots[dateSnapshot][da] = {
        dateCapture: new Date().toISOString(),
        typeCapture: 'reconstruit',  // IMPORTANT : Marquer comme reconstruit
        semaine: calculerNumeroSemaine(dateSnapshot),
        indices: {
          A: indicesA,
          C: indicesCP.C,
          P: indicesCP.P
        },
        risqueEchec: risque,
        niveauRaI: niveauRaI,
        tendance: calculerTendanceRetroactive(da, dateSnapshot, snapshots),
        details: calculerDetailsRetroactifs(da, presencesJusqua, evaluationsJusqua)
      };
    });

    localStorage.setItem('snapshotsHebdomadaires', JSON.stringify(snapshots));
  }
  ```

- [ ] **Distinction visuelle reconstruit vs temps réel** (profil étudiant)
  - Badge 🔄 "Reconstruit" sur les lignes de snapshots reconstruits
  - Tooltip explicatif : "Données recalculées à partir de l'historique. Peut différer de la réalité si données modifiées après coup."
  - Badge 📸 "Temps réel" sur les snapshots capturés automatiquement/manuellement

- [ ] **Validation et tests**
  - Scénario 1 : Reconstruire semaine du 21 oct, vérifier que les indices correspondent aux données de cette date
  - Scénario 2 : Modifier une évaluation du 15 oct, reconstruire snapshot du 21 oct → snapshot ne reflète PAS la modification (données d'origine)
  - Scénario 3 : Comparer snapshot temps réel vs reconstruit pour même semaine → différences documentées et expliquées

---

### 🎯 PRIORITÉ 2 : Cartouches de rétroaction contextuels (4-5 jours)

**Report de PHASE 1.2** : Cette fonctionnalité était prévue mais non implémentée. Elle devient critique pour améliorer la qualité des rétroactions.

**Fonctionnalités** :

- [ ] **Intégration dans formulaire d'évaluation**
  - Lors de l'évaluation d'un artefact, afficher boutons "💬 Insérer cartouche" pour chaque critère SRPNF
  - Filtrer cartouches disponibles selon :
    * Niveau IDME sélectionné (I, D, M, E)
    * Critère concerné (Structure, Rigueur, Plausibilité, Nuance, Français)
  - Modal de sélection avec aperçu texte complet de chaque cartouche
  - Option "Éditer avant insertion" pour personnaliser le commentaire
  - Insertion automatique dans champ commentaire du critère

- [ ] **Suggestions intelligentes**
  - Analyser défis identifiés dans profil étudiant (ex: "Structure" = défi récurrent)
  - Proposer cartouches pertinentes en haut de liste avec badge "⭐ Suggéré pour cet étudiant"
  - Ordre de tri : Cartouches suggérées → Cartouches même niveau → Autres cartouches

- [ ] **Historique des cartouches utilisées**
  - Nouveau champ dans `localStorage.evaluations` : `cartouchesUtilisees`
    ```javascript
    evaluation: {
      // ... champs existants
      cartouchesUtilisees: [
        { critere: "Structure", niveau: "D", texte: "Ton texte manque...", date: "2025-11-10" },
        { critere: "Français", niveau: "I", texte: "Plusieurs erreurs...", date: "2025-11-10" }
      ]
    }
    ```
  - Section "Rétroactions récentes" dans profil étudiant (affiche 5 dernières)
  - Détection rétroactions répétitives : Si même cartouche utilisée 3+ fois → alerte "Blocage persistant détecté"

- [ ] **Interface utilisateur**
  - Bouton "💬 Insérer cartouche" à droite de chaque champ commentaire critère
  - Modal avec :
    * Filtre niveau (I, D, M, E) - auto-sélectionné selon niveau choisi
    * Liste cartouches avec texte intégral
    * Bouton "Éditer" ouvrant textarea pré-remplie
    * Bouton "Insérer tel quel" sans modification
  - Animation insertion (texte apparaît progressivement dans champ)

**Fichiers concernés** : `cartouches.js`, `evaluation.js` (à créer), `profil-etudiant.js`

---

### 🎯 PRIORITÉ 3 : Correctifs bugs Beta 89 (1-2 jours)

**Bugs connus à corriger** :

- [ ] **Niveau "--" dans anciennes évaluations**
  - **Problème** : Évaluations créées avant Beta 89 conservent `niveauFinal: "--"` dans localStorage
  - **Solution** : Script de migration automatique lors du chargement de l'application
    ```javascript
    function migrerAnciennesEvaluations() {
      const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
      let nbMigrees = 0;

      evaluations.forEach(eval => {
        if (eval.niveauFinal === '--' && eval.noteFinale !== null && eval.noteFinale !== undefined) {
          // Recalculer niveau avec échelle sélectionnée
          const niveau = calculerNiveauDepuisNote(eval.noteFinale, eval.echelleId);
          eval.niveauFinal = niveau;
          nbMigrees++;
        }
      });

      if (nbMigrees > 0) {
        localStorage.setItem('evaluations', JSON.stringify(evaluations));
        console.log(`${nbMigrees} évaluations migrées vers nouveau format de niveau`);
      }
    }
    ```
  - Appeler `migrerAnciennesEvaluations()` au chargement de `main.js`

- [ ] **Page blanche lors du chargement depuis la liste**
  - **Problème** : Cliquer sur "Consulter" depuis la liste des évaluations affiche parfois une page blanche
  - **Hypothèse** : Erreur JavaScript non catchée, probablement évaluation incomplète ou échelle manquante
  - **Solution** :
    * Ajouter try-catch dans fonction de chargement évaluation
    * Logger erreurs dans console pour debugging
    * Afficher message utilisateur explicite si erreur : "Impossible de charger cette évaluation. Erreur : [détails]"
    * Fallback : Bouton "Réessayer" ou "Retour à la liste"

**Fichiers concernés** : `evaluation.js`, `main.js`

---

### 🎯 PRIORITÉ 4 (si temps disponible) : Recommandations personnalisées (2-3 jours)

**Report de PHASE 1.3** : Amélioration des recommandations RàI déjà existantes.

**Améliorations prévues** :

- [ ] **Intégration statut SA**
  - Ajouter dans recommandations : "⚠️ Statut SA actif - Vérifier accommodements en vigueur et adaptations nécessaires"
  - Lien direct vers fiche étudiant (statut SA, accommodements configurés)

- [ ] **Historique interventions**
  - Ne pas suggérer une intervention déjà effectuée récemment (< 2 semaines)
  - Afficher "Déjà tenté : Rencontre CAF (5 nov)" avec indicateur d'impact (amélioration / neutre / détérioration)

- [ ] **Ton adapté au risque**
  - Risque critique (> 70%) : Ton urgent, actions immédiates ("URGENT - Rencontre immédiate requise")
  - Risque élevé (50-70%) : Ton préoccupé, suivi rapproché ("Suivi hebdomadaire recommandé")
  - Risque modéré (30-50%) : Ton encourageant, accompagnement ("Accompagnement léger conseillé")

- [ ] **Ressources concrètes**
  - Liens cliquables vers capsules vidéo (Structure, Français, Rigueur)
  - Documents PDF téléchargeables (grilles SRPNF explicatives)
  - Exercices ciblés selon défi (ex: "Exercice Structure niveau 1.pdf")

**Fichiers concernés** : `profil-etudiant.js`, `interventions.js`

---

## 📂 Nouveaux fichiers à créer

### libs/chart.min.js (librairie externe)

**Source** : https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js

**Installation** :
1. Télécharger chart.min.js depuis le site officiel ou CDN
2. Placer dans nouveau dossier `libs/` à la racine du projet
3. Inclure dans index 90.html : `<script src="libs/chart.min.js"></script>`

**Taille** : ~200 KB (minifié)
**Licence** : MIT (open source)

### js/graphiques.js (nouveau module)

**Rôle** : Création et gestion de tous les graphiques de l'application avec Chart.js.

**Fonctions principales** :
- `creerGraphiqueEvolutionACP(da, conteneurId)` : Graphique évolution A-C-P (3 courbes)
- `creerGraphiqueRisque(da, conteneurId)` : Courbe risque d'échec 1-(A×C×P)
- `creerGraphiqueSRPNF(da, conteneurId)` : Barres performance par critère
- `creerGraphiqueComparaisonSomPan(conteneurId)` : Comparaison groupe SOM vs PAN
- `creerGraphiqueSpaghetti(conteneurId, type)` : Trajectoires multiples (performance/risque)
- `creerGraphiqueAiresEmpilees(conteneurId)` : Aires empilées 7 indices
- `ajouterMarqueurIntervention(chartInstance, date, label)` : Marqueur événement sur graphique
- `exporterGraphiquePNG(chartInstance, filename)` : Export image PNG

**Configuration Chart.js commune** :
```javascript
const configBase = {
  responsive: true,
  maintainAspectRatio: false,
  locale: 'fr-CA',
  plugins: {
    legend: { display: true, position: 'top' },
    tooltip: { enabled: true, mode: 'index', intersect: false },
    title: { display: true, font: { size: 16 } }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { callback: (value) => value + '%' }
    }
  }
};
```

**Exports** :
```javascript
window.creerGraphiqueEvolutionACP = creerGraphiqueEvolutionACP;
window.creerGraphiqueRisque = creerGraphiqueRisque;
window.exporterGraphiquePNG = exporterGraphiquePNG;
// ... autres exports
```

### js/snapshots.js (nouveau module)

**Rôle** : Gestion centralisée de tous les snapshots (interventions et hebdomadaires).

**Fonctions principales** :
- `creerSnapshotHebdomadaire()` : Capture snapshot pour lundi actuel
- `reconstruireSnapshotRetroactif(dateSnapshot)` : Reconstruction données passées
- `obtenirSnapshotsEtudiant(da)` : Récupère tous snapshots d'un étudiant
- `obtenirSnapshot(da, dateSnapshot)` : Récupère snapshot spécifique
- `calculerTendance(da, dateSnapshot)` : Compare avec semaine précédente
- `analyserImpactIntervention(interventionId)` : Compare snapshots avant/après intervention
- `detecterPatterns(da)` : Identifie décrochage, rebond, instabilité
- `filtrerPresencesJusqua(presences, date)` : Filtre présences ≤ date (pour rétroactif)
- `filtrerEvaluationsJusqua(evaluations, da, date)` : Filtre évaluations ≤ date (pour rétroactif)

**Exports** :
```javascript
window.creerSnapshotHebdomadaire = creerSnapshotHebdomadaire;
window.reconstruireSnapshotRetroactif = reconstruireSnapshotRetroactif;
window.obtenirSnapshotsEtudiant = obtenirSnapshotsEtudiant;
// ... autres exports
```

### js/evaluation.js (nouveau module - si temps disponible)

**Rôle** : Formulaire complet d'évaluation avec matrice SRPNF (prévu PHASE 2, mais squelette utile pour cartouches).

**Fonctions principales (squelette)** :
- `afficherFormulaireEvaluation(productionId, etudiantDA)` : Affiche matrice évaluation
- `insererCartouche(critere, niveau)` : Intégration cartouches dans formulaire
- `calculerNoteProvisoire()` : Calcul temps réel pendant saisie
- `sauvegarderEvaluation()` : Sauvegarde complète avec cartouches utilisées

**Note** : Version minimale pour Beta 90, version complète en PHASE 2.

---

## 📊 Architecture des données

### Nouvelles clés localStorage

1. **`snapshotsHebdomadaires`** : Object
   - Clés : Dates (YYYY-MM-DD, lundis uniquement)
   - Valeurs : Object avec DAs étudiants comme clés

2. **Modifications `interventions`** : Ajout champ `participantsSnapshot`
   - Capturé automatiquement lors changement statut → "completee"

3. **Modifications `evaluations`** : Ajout champ `cartouchesUtilisees` (array)
   - Stocke historique cartouches insérées par critère

---

## 🧪 Plan de tests

### Tests snapshots interventions

- [ ] **Test 1** : Créer intervention, ajouter 3 participants, marquer terminée
  - ✅ Vérifier : `participantsSnapshot` contient données des 3 étudiants
  - ✅ Vérifier : Données figées (modifier indices après, snapshot inchangé)

- [ ] **Test 2** : Consulter intervention terminée, onglet "Analyse d'impact"
  - ✅ Vérifier : Tableau comparatif avant/après affiché
  - ✅ Vérifier : Indicateurs 📈/➡️/📉 corrects

- [ ] **Test 3** : Filtrer "Interventions les plus efficaces"
  - ✅ Vérifier : Tri par % amélioration descendant

### Tests snapshots hebdomadaires

- [ ] **Test 4** : Clic "Créer snapshot hebdomadaire" un lundi
  - ✅ Vérifier : Snapshot créé avec date = lundi courant
  - ✅ Vérifier : Tous étudiants capturés avec indices A-C-P corrects

- [ ] **Test 5** : Visualiser évolution dans profil étudiant
  - ✅ Vérifier : Tableau évolution hebdomadaire affiché
  - ✅ Vérifier : Graphique linéaire A-C-P affiché (8 dernières semaines)

- [ ] **Test 6** : Détection pattern "Décrochage progressif"
  - ✅ Scénario : Créer 3 snapshots avec baisse continue indices
  - ✅ Vérifier : Alerte 🔴 "Décrochage progressif détecté"

### Tests snapshots rétroactifs

- [ ] **Test 7** : Reconstruire snapshots pour 3 semaines passées
  - ✅ Vérifier : Snapshots créés avec `typeCapture: 'reconstruit'`
  - ✅ Vérifier : Badge 🔄 "Reconstruit" affiché dans interface

- [ ] **Test 8** : Modifier évaluation du 15 oct, reconstruire snapshot du 21 oct
  - ✅ Vérifier : Snapshot reflète données ORIGINALES du 21 oct (pas la modification)

- [ ] **Test 9** : Comparer snapshot temps réel vs reconstruit (même semaine)
  - ✅ Documenter : Différences observées et causes

### Tests cartouches contextuels

- [ ] **Test 10** : Évaluer artefact niveau D, critère Structure
  - ✅ Clic "💬 Insérer cartouche"
  - ✅ Vérifier : Cartouches filtrées (Structure + niveau D uniquement)
  - ✅ Vérifier : Badge "⭐ Suggéré" si étudiant a défi Structure

- [ ] **Test 11** : Insérer cartouche, éditer texte, sauvegarder
  - ✅ Vérifier : Cartouche modifiée insérée dans champ commentaire
  - ✅ Vérifier : `cartouchesUtilisees` contient entrée avec texte personnalisé

- [ ] **Test 12** : Utiliser même cartouche 3 fois pour un étudiant
  - ✅ Vérifier : Alerte "Blocage persistant détecté" affichée dans profil

### Tests correctifs bugs

- [ ] **Test 13** : Charger application avec anciennes évaluations (niveau "--")
  - ✅ Vérifier : Script migration s'exécute automatiquement
  - ✅ Vérifier : Console log "X évaluations migrées"
  - ✅ Vérifier : Niveaux recalculés et affichés correctement

- [ ] **Test 14** : Clic "Consulter" sur évaluation incomplète/corrompue
  - ✅ Vérifier : Pas de page blanche, message erreur explicite affiché
  - ✅ Vérifier : Bouton "Retour à la liste" fonctionnel

### Tests graphiques Chart.js

- [ ] **Test 15** : Visualiser profil étudiant avec 8 semaines de snapshots
  - ✅ Vérifier : Graphique évolution A-C-P s'affiche correctement
  - ✅ Vérifier : 3 courbes colorées (A bleu foncé, C bleu moyen, P vert)
  - ✅ Vérifier : Tooltips affichent valeurs au survol
  - ✅ Vérifier : Légende affichée avec labels clairs
  - ✅ Vérifier : Axe Y en pourcentages (0-100%), axe X avec semaines

- [ ] **Test 16** : Export graphique PNG
  - ✅ Clic sur bouton "Exporter PNG"
  - ✅ Vérifier : Fichier téléchargé avec nom approprié
  - ✅ Vérifier : Image de qualité suffisante pour rapport

---

## 📅 Calendrier de développement

### Semaine 1 (4-10 novembre)

**Focus** : Snapshots interventions + Snapshots hebdomadaires (base)

- [ ] **Jour 1-2** : Structure données snapshots + fonction capture intervention
- [ ] **Jour 3-4** : Interface visualisation impact interventions
- [ ] **Jour 5** : Fonction capture snapshot hebdomadaire + tests

**Livrables semaine 1** :
- ✅ Snapshots interventions fonctionnels
- ✅ Capture manuelle snapshots hebdomadaires opérationnelle
- ✅ Tests validation snapshots interventions

### Semaine 2 (11-17 novembre)

**Focus** : Snapshots rétroactifs + Cartouches contextuels

- [ ] **Jour 1-2** : Logique reconstruction rétroactive + interface
- [ ] **Jour 3-4** : Intégration cartouches dans formulaire évaluation
- [ ] **Jour 5** : Historique cartouches + détection blocages persistants

**Livrables semaine 2** :
- ✅ Reconstruction rétroactive fonctionnelle
- ✅ Cartouches contextuels intégrés
- ✅ Tests validation snapshots rétroactifs

### Semaine 3 (18-24 novembre)

**Focus** : Graphiques Chart.js + Correctifs bugs + Documentation

- [ ] **Jour 1** : Installation Chart.js + module graphiques.js (squelette)
- [ ] **Jour 2** : Graphique évolution A-C-P dans profil étudiant
- [ ] **Jour 3** : Script migration anciennes évaluations + correctif page blanche
- [ ] **Jour 4** : Tests utilisateurs complets (tous scénarios)
- [ ] **Jour 5** : Documentation (`NOTES_VERSION_0.90.md`, `GUIDE_TESTEURS.md`)

**Livrables semaine 3** :
- ✅ Chart.js intégré et opérationnel
- ✅ Graphique évolution A-C-P fonctionnel
- ✅ Tous bugs Beta 89 corrigés
- ✅ Documentation complète Beta 90
- ✅ Package distribution `Monitorage_Beta_0.90.zip`

---

## 🎯 Critères de succès Beta 0.90

### Fonctionnalités essentielles (must-have)

- ✅ **Snapshots interventions** : Capture automatique lors "Marquer comme terminée"
- ✅ **Analyse impact** : Tableau comparatif avant/après intervention
- ✅ **Snapshots hebdomadaires** : Capture manuelle fonctionnelle
- ✅ **Évolution temporelle** : Graphique Chart.js évolution A-C-P (8 dernières semaines)
- ✅ **Reconstruction rétroactive** : Interface + logique de reconstruction
- ✅ **Chart.js intégré** : Librairie installée et module graphiques.js opérationnel
- ✅ **Bugs Beta 89 corrigés** : Migration niveaux + page blanche

### Fonctionnalités souhaitables (nice-to-have)

- 🟡 **Cartouches contextuels** : Intégration dans formulaire évaluation
- 🟡 **Détection patterns** : Décrochage, rebond, instabilité (avec indicateurs visuels)
- 🟡 **Export PNG** : Sauvegarder graphiques pour rapports
- 🟡 **Recommandations SA** : Intégration statut SA dans recommandations

### Métriques de qualité

- ⚡ **Performance** : Reconstruction 10 semaines < 5 secondes
- ⚡ **Graphiques** : Rendu < 1 seconde pour 8 semaines de données
- 🛡️ **Robustesse** : Aucune erreur console lors des tests
- 📚 **Documentation** : Notes techniques complètes + guide testeurs
- ✅ **Tests** : 16 scénarios validés avec succès (incluant 2 tests Chart.js)

---

## 📝 Notes importantes

### Contraintes techniques

- **LocalStorage limite** : Snapshots hebdomadaires peuvent devenir volumineux (30 étudiants × 15 semaines = 450 entrées)
  - Solution : Compression JSON ou nettoyage snapshots > 1 an
- **Reconstruction rétroactive** : Peut être lente si beaucoup d'évaluations à filtrer
  - Solution : Barre de progression + traitement par lots (5 semaines à la fois)

### Dépendances

- **portfolio.js** : `obtenirIndicesCP(da)` et `calculerEtStockerIndicesCP()`
- **saisie-presences.js** : `obtenirIndiceAssiduiteEtudiant(da)`
- **interventions.js** : Modification fonction changement statut intervention

### Compatibilité ascendante

- ✅ Anciennes données compatibles (ajout de champs, pas de suppression)
- ✅ Migration automatique des anciennes évaluations (niveau "--" → niveau calculé)
- ✅ Snapshots optionnels (pas d'impact si utilisateur ne les utilise pas)

---

## 🚀 Après Beta 0.90

### Prochaine version (Beta 0.95 - décembre 2025)

**Priorités PHASE 2** :

1. **Graphiques avancés Chart.js** (2-3 jours grâce à Chart.js)
   - Aires empilées : Évolution des 7 indices (A, C, P, Mobilisation, Engagement, Rendement, Risque)
   - Spaghetti chart : Trajectoires multiples performance/risque (tous étudiants sur un graphique)
   - Zones colorées IDME : Background avec niveaux Insuffisant/Réussite/Étendu
   - Comparaison SOM vs PAN : Courbes avec lignes de tendance pointillées
   - Marqueurs d'événements : Interventions RàI, jetons utilisés sur timeline
   - Export PNG haute qualité : Pour rapports et présentations

2. **Matrice d'évaluation complète** (8-10 jours)
   - Formulaire évaluation avec grille SRPNF interactive
   - Sélection niveaux par clic (radio buttons visuels)
   - Calcul automatique score pondéré en temps réel
   - Intégration cartouches contextuels par critère

3. **Gestion présences avancée** (4-5 jours)
   - Statuts granulaires (Présent, Absent, Retard, Départ anticipé, Justifié)
   - Motifs configurables et justifications
   - Export PDF liste présences pour signature

**Estimation PHASE 2** : 3-4 semaines (au lieu de 6-8 semaines grâce à Chart.js)

Voir `PLAN_DE_MATCH_2025-10-30.md` pour roadmap complète vers version 1.0.

---

**Plan créé par** : Claude Code
**Date de création** : 4 novembre 2025
**Date révision Chart.js** : 4 novembre 2025 (intégration Chart.js décidée)
**Prochaine révision** : Fin Beta 0.90 (mi-novembre 2025)
**Contact** : labo@codexnumeris.org

---

## 📌 Historique des révisions

### 4 novembre 2025 - Révision 2 : Intégration Chart.js

**Décision majeure** : Adoption de Chart.js pour graphiques professionnels

**Changements** :
- ✅ Ajout section "DÉCISION TECHNIQUE : Intégration de Chart.js"
- ✅ Nouveau fichier : `libs/chart.min.js` (librairie MIT)
- ✅ Nouveau module : `js/graphiques.js` (8 fonctions graphiques)
- ✅ Calendrier révisé : Semaine 3 inclut développement graphiques
- ✅ Tests ajoutés : Test 15 (graphique A-C-P), Test 16 (export PNG)
- ✅ Critères succès mis à jour : Chart.js intégré comme critère essentiel
- ✅ PHASE 2 accélérée : 3-4 semaines au lieu de 6-8 semaines

**Gain estimé** : ~10 jours de développement sur l'ensemble du projet

### 4 novembre 2025 - Révision 1 : Plan initial

**Objectif** : Système de snapshots et suivi longitudinal
**Priorités** : Snapshots interventions, snapshots hebdomadaires, reconstruction rétroactive, cartouches contextuels
