# Affichage des corrélations A-P et C-P dans la liste des étudiants

**Date** : 18 novembre 2025
**Version** : Beta 91.0
**Fichier modifié** : `js/etudiants.js`
**Cache buster** : `v=2025111802`

---

## 🎯 Objectif

Afficher les coefficients de corrélation de Pearson entre les indices A-C et P directement dans les en-têtes du tableau de la liste des étudiants. Cela permet de valider rapidement la valeur prédictive de ces indices pour le groupe actuel.

---

## 📊 Fonctionnalité implémentée

### Calcul automatique

À chaque affichage du tableau (Tableau de bord › Liste des individus), le système calcule automatiquement :

1. **r_AP** : Corrélation entre Assiduité (A) et Performance (P)
2. **r_CP** : Corrélation entre Complétion (C) et Performance (P)

### Affichage dans les en-têtes

Les coefficients sont affichés directement sous le nom de l'indice dans l'en-tête :

```
A
(assiduité)
r=0.75    ← Nouvelle ligne (couleur verte si forte corrélation)
↕
```

```
C
(complétion)
r=0.62    ← Nouvelle ligne (couleur orange si modérée)
↕
```

### Couleurs selon la force de corrélation

Les coefficients sont colorés automatiquement selon leur valeur absolue :

| Valeur absolue |r| | Force | Couleur | Code CSS |
|-----------------|-------|---------|----------|
| |r| ≥ 0.7 | **Forte** | Vert foncé | `#2e7d32` |
| 0.5 ≤ |r| < 0.7 | **Modérée** | Orange | `#f57c00` |
| |r| < 0.5 | **Faible** | Rouge | `#c62828` |

Si la corrélation ne peut pas être calculée (données insuffisantes), un tiret gris s'affiche : `—`

---

## 🔧 Implémentation technique

### 1. Fonction `calculerCorrelationPearson(x, y)`

**Emplacement** : `js/etudiants.js` (lignes 412-442)

**Rôle** : Calcule le coefficient de corrélation de Pearson entre deux séries de données

**Paramètres** :
- `x` : Array de nombres (première série)
- `y` : Array de nombres (deuxième série, même longueur que x)

**Retour** :
- `number` : Coefficient r entre -1 et 1
- `null` : Si calcul impossible (données vides, longueurs différentes, variance nulle)

**Formule mathématique** :

```
r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]
```

Où :
- `x̄` = moyenne de x
- `ȳ` = moyenne de y
- `Σ` = somme sur tous les étudiants

**Interprétation** :
- `r = 1` : Corrélation positive parfaite (quand A ↑, P ↑ proportionnellement)
- `r = 0` : Aucune corrélation linéaire
- `r = -1` : Corrélation négative parfaite (quand A ↑, P ↓)

---

### 2. Fonction `mettreAJourEntetesAvecCorrelations(r_AP, r_CP)`

**Emplacement** : `js/etudiants.js` (lignes 457-497)

**Rôle** : Met à jour les en-têtes HTML des colonnes A et C avec les corrélations calculées

**Paramètres** :
- `r_AP` : Corrélation Assiduité ↔ Performance
- `r_CP` : Corrélation Complétion ↔ Performance

**Fonctionnement** :

1. **Sélection des en-têtes** :
   ```javascript
   const enteteLigneA = document.querySelector('th[onclick*="assiduite"]');
   const enteteLigneC = document.querySelector('th[onclick*="completion"]');
   ```

2. **Formatage des corrélations** :
   - Affiche `r=0.XX` avec 2 décimales
   - Applique la couleur selon |r|
   - Affiche `—` si r = null

3. **Mise à jour HTML** :
   ```javascript
   const htmlA = `A<br><span class="text-xs-normal">(assiduité)</span><br>${formaterCorrelation(r_AP)}<span id="tri-assiduite" class="ml-4">↕</span>`;
   enteteLigneA.innerHTML = htmlA;
   ```

4. **Log console** :
   ```
   📊 Corrélations affichées: A↔P r=0.752, C↔P r=0.618
   ```

---

### 3. Intégration dans `afficherTableauEtudiantsListe()`

**Emplacement** : `js/etudiants.js` (lignes 729-738)

**Ajout après l'enrichissement des données** :

```javascript
// 🆕 BETA 91: Calculer les corrélations A-P et C-P pour afficher dans l'en-tête
const valeursA = etudiantsFiltres.map(e => e.indicesCalcules.A);
const valeursC = etudiantsFiltres.map(e => e.indicesCalcules.C);
const valeursP = etudiantsFiltres.map(e => e.indicesCalcules.P);

const r_AP = calculerCorrelationPearson(valeursA, valeursP);
const r_CP = calculerCorrelationPearson(valeursC, valeursP);

// Mettre à jour les en-têtes avec les corrélations
mettreAJourEntetesAvecCorrelations(r_AP, r_CP);
```

**Timing** :
- Calculé APRÈS le filtrage des étudiants (respect des filtres actifs)
- Calculé AVANT le tri (corrélations basées sur les données visibles)
- Recalculé à chaque rafraîchissement du tableau

---

## 📐 Seuils d'interprétation (Cohen, 1988)

### Conventions statistiques

| |r| | Qualificatif | Interprétation pédagogique |
|-----|--------------|---------------------------|
| < 0.3 | **Très faible** | Indice peu prédictif pour ce groupe |
| 0.3-0.5 | **Faible** | Relation présente mais limitée |
| 0.5-0.7 | **Modérée** | Indice utile, mais pas suffisant seul |
| 0.7-0.9 | **Forte** | Indice fortement prédictif |
| ≥ 0.9 | **Très forte** | Relation quasi-déterministe (rare) |

### Notes importantes

1. **Corrélation ≠ Causalité** :
   - r élevé ne signifie pas que A *cause* P
   - Peut indiquer un facteur commun sous-jacent

2. **Interprétation contextuelle** :
   - Seuils conventionnels, ajuster selon le contexte pédagogique
   - Un r = 0.55 peut être très significatif en éducation
   - Taille de l'échantillon influence la fiabilité (n ≥ 30 recommandé)

3. **Utilité pédagogique** :
   - r_AP faible → A seul ne prédit pas P, chercher autres facteurs
   - r_CP fort → Complétion des travaux excellent indicateur
   - r négatif → Relation inverse (rare, investiguer)

---

## 🎨 Exemples visuels

### Cas 1 : Forte corrélation A-P (r = 0.82)

```
A
(assiduité)
r=0.82    ← VERT FONCÉ (#2e7d32)
↕
```

**Interprétation** : L'assiduité est fortement corrélée à la performance. Les étudiants assidus tendent à bien performer.

---

### Cas 2 : Corrélation modérée C-P (r = 0.58)

```
C
(complétion)
r=0.58    ← ORANGE (#f57c00)
↕
```

**Interprétation** : La complétion est modérément corrélée. Utile mais à combiner avec d'autres indices.

---

### Cas 3 : Faible corrélation (r = 0.32)

```
A
(assiduité)
r=0.32    ← ROUGE (#c62828)
↕
```

**Interprétation** : Faible relation. L'assiduité seule ne prédit pas bien la performance dans ce groupe.

---

### Cas 4 : Données insuffisantes

```
C
(complétion)
—    ← GRIS (#999)
↕
```

**Interprétation** : Pas assez d'étudiants ou variance nulle. Besoin de plus de données.

---

## 🔄 Comportement dynamique

### Recalcul automatique

Les corrélations sont recalculées **automatiquement** dans les situations suivantes :

1. **Changement de filtre** :
   - Filtre par groupe → corrélations recalculées pour groupe sélectionné
   - Filtre par programme → corrélations pour ce programme uniquement
   - Filtre par RàI/Pattern → corrélations pour sous-groupe filtré

2. **Modification des données** :
   - Ajout/suppression présence → recalcul lors prochain affichage
   - Nouvelle évaluation → recalcul au retour à la liste
   - Import de données → recalcul automatique

3. **Changement de pratique** :
   - Basculer SOM ↔ PAN → nouvelles corrélations (P différent)
   - Mode comparatif → affiche corrélations pratique active

### Performance

- **Temps de calcul** : O(n) où n = nombre d'étudiants filtrés
- **Impact** : Négligeable (<10ms pour 100 étudiants)
- **Optimisation** : Aucune mise en cache (données volatiles)

---

## 🧪 Tests recommandés

### Test 1 : Groupe complet

1. Aller dans Tableau de bord › Liste des individus
2. Vérifier que r_AP et r_CP s'affichent
3. Valider que les couleurs correspondent aux seuils
4. Comparer avec `analyse-correlations.html` (validation croisée)

### Test 2 : Filtrage

1. Appliquer filtre "Groupe 01"
2. Vérifier recalcul des corrélations (valeurs changent)
3. Appliquer filtre "RàI 3"
4. Vérifier nouvelles corrélations (sous-groupe à risque)

### Test 3 : Cas limites

1. **Groupe avec 1 étudiant** : Devrait afficher `—`
2. **Tous A = 100%** : Variance nulle → `—`
3. **Groupe vide (filtré)** : Tableau masqué (pas de corrélation affichée)

### Test 4 : Cohérence

1. Noter les valeurs de r_AP et r_CP affichées
2. Ouvrir Console navigateur, taper :
   ```javascript
   const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants'));
   const A = etudiants.map(e => /* calculer A */);
   const P = etudiants.map(e => /* calculer P */);
   calculerCorrelationPearson(A, P);
   ```
3. Comparer avec valeur affichée (devrait être identique)

---

## 📝 Logs console

Lors de l'affichage du tableau, vous verrez dans la console :

```
👥 Initialisation du module Liste des Étudiants
Nombre total d'étudiants: 30
Nombre d'étudiants après filtrage: 30
📊 Corrélations affichées: A↔P r=0.752, C↔P r=0.618
✅ Liste des étudiants affichée avec 30 étudiant(s)
```

Si les en-têtes ne sont pas trouvés :

```
⚠️ En-têtes A ou C introuvables pour afficher les corrélations
```

---

## 🎓 Utilité pédagogique

### Pour l'enseignant

1. **Validation des hypothèses** :
   - Confirmer ou infirmer que "assiduité = réussite"
   - Identifier facteurs clés de performance dans son groupe

2. **Adaptation des interventions** :
   - r_AP faible → Travailler qualité présence (engagement cognitif)
   - r_CP fort → Encourager complétion des travaux
   - r négatif → Investiguer phénomène inhabituel

3. **Communication avec étudiants** :
   - "Dans notre groupe, la complétion des travaux est fortement liée à la performance (r=0.78)"
   - Données concrètes pour motiver comportements

### Pour la recherche

1. **Données empiriques** :
   - Corréler théorie (A-C-P) avec pratique (données réelles)
   - Identifier variations selon programmes, sessions, pratiques

2. **Amélioration continue** :
   - Comparer corrélations entre groupes
   - Ajuster système de monitorage selon résultats observés

---

## 🔮 Évolutions futures possibles

### Court terme (Beta 91)
- [ ] Ajouter tooltip explicatif au survol de "r=0.XX"
- [ ] Exporter corrélations dans rapport PDF
- [ ] Historique des corrélations (évolution session)

### Moyen terme (Beta 92+)
- [ ] Graphique de régression A vs P (nuage de points)
- [ ] Calcul intervalle de confiance (significativité statistique)
- [ ] Corrélation partielle (A-P en contrôlant C)
- [ ] Corrélation E-P (engagement vs performance)

### Long terme (Version 1.0)
- [ ] Comparaison inter-groupes (benchmarking)
- [ ] Tests statistiques (p-value, significativité)
- [ ] Modèles prédictifs (régression multiple)

---

## 📚 Références

**Statistiques** :
- Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2e éd.). Routledge.
- Pearson, K. (1895). "Notes on regression and inheritance in the case of two parents". *Proceedings of the Royal Society of London*, 58, 240-242.

**Pédagogie** :
- Bédard, G. (2024). "Monitorage pédagogique : indices A-C-P pour dépister les risques d'échec". *Pédagogie collégiale*, Vol. 37, No. 3.

---

**Dernière mise à jour** : 18 novembre 2025
**Prochaine révision** : Après tests utilisateurs Beta 91
