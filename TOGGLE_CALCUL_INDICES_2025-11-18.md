# Toggle d'explication du calcul des indices A-C-P

**Date** : 18 novembre 2025
**Version** : Beta 91.0
**Fichier modifié** : `js/etudiants.js`, `index 91.html`
**Cache buster** : `v=2025111803`

---

## 🎯 Objectif

Ajouter un toggle cliquable (📐) dans la liste des étudiants qui affiche une carte explicative détaillant **comment** les indices A, C et P sont calculés. Cela permet de mieux comprendre les relations entre les indices et leur signification selon la pratique active (PAN-Maîtrise vs Sommative).

---

## 📐 Fonctionnalité implémentée

### Emplacement

**Section** : Tableau de bord › Liste des individus
**Position** : Juste au-dessus du tableau, après les filtres

### Interface visuelle

```
[Filtres de recherche et sélection]

📐 Détails de calcul des indices    ← Toggle cliquable
┌─────────────────────────────────────────────────┐
│ Méthodes de calcul des indices (PAN-Maîtrise)  │  ← Carte cachée par défaut
│                                                 │
│ A (Assiduité) : Calculé sur les 12 dernières   │
│   séances. Formule: A = (présent / total) × 100│
│                                                 │
│ C (Complétion) : Calculé sur les 7 meilleurs   │
│   artefacts. Formule: C = (évalués / 7) × 100  │
│                                                 │
│ P (Performance) : Moyenne des 7 meilleurs      │
│   artefacts selon échelle IDME.                │
│                                                 │
│ 💡 Paramètres modifiables dans Réglages        │
└─────────────────────────────────────────────────┘

[Tableau des étudiants avec colonnes A, C, P...]
```

### Comportement

1. **Par défaut** : Carte cachée (display: none)
2. **Premier clic sur 📐** : Carte s'affiche
3. **Deuxième clic sur 📐** : Carte se cache
4. **Contenu dynamique** : Adapté à la pratique active (PAN ou Sommative)

---

## 🔧 Implémentation technique

### 1. Ajout HTML dans `index 91.html`

**Emplacement** : Lignes 2920-2929

```html
<!-- 📐 TOGGLE DÉTAILS DE CALCUL DES INDICES -->
<div style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
    <span class="emoji-toggle" data-target="note-calcul-indices-liste"
          style="cursor: pointer; font-size: 1.2rem;"
          title="Afficher les détails de calcul des indices">📐</span>
    <span style="color: var(--gris-moyen); font-size: 0.9rem;">Détails de calcul des indices</span>
</div>

<!-- Carte Note Détails Calcul (cachée par défaut) -->
<div id="note-calcul-indices-liste" class="carte-info-toggle carte-info-note"
     style="display: none; margin-bottom: 20px;">
    <!-- Contenu généré dynamiquement par JS -->
</div>
```

**Éléments clés** :
- `.emoji-toggle` : Classe standard pour toggles emoji
- `data-target="note-calcul-indices-liste"` : Identifie la carte cible
- `#note-calcul-indices-liste` : Conteneur de la carte explicative

---

### 2. Fonction `genererExplicationCalculIndices()`

**Emplacement** : `js/etudiants.js` (lignes 451-510)

**Rôle** : Génère le HTML de la carte explicative selon la pratique active

**Logique** :

1. **Récupération de la configuration** :
   ```javascript
   const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
   const pratique = config.pratique || 'pan-maitrise';
   const nbArtefacts = config.nombreArtefacts || 7;
   ```

2. **Détection du mode de calcul de A** :
   ```javascript
   const indicesAssiduite = JSON.parse(localStorage.getItem('indicesAssiduiteDetailles') || '{}');
   const utiliseDernier12 = exempleDonnees && exempleDonnees.dernier12 ? true : false;
   ```

3. **Génération HTML conditionnelle** :
   - Si `utiliseDernier12 === true` : "Calculé sur les **12 dernières séances**"
   - Sinon : "Taux global depuis le début du trimestre"

**Exemple de sortie (PAN-Maîtrise)** :

```html
<strong>Méthodes de calcul des indices (pratique active : PAN-Maîtrise)</strong><br><br>

<strong style="color: var(--bleu-principal);">A (Assiduité)</strong> :
Calculé sur les <strong>12 dernières séances</strong> (ou global si moins de 12 séances tenues).
Formule : <code>A = (heures présentes / heures totales) × 100</code>

<br><br>

<strong style="color: var(--bleu-principal);">C (Complétion)</strong> :
Calculé sur les <strong>7 meilleurs artefacts</strong> (PAN-Maîtrise).
Formule : <code>C = (artefacts évalués / 7 attendus) × 100</code>

<br><br>

<strong style="color: var(--bleu-principal);">P (Performance)</strong> :
Moyenne des <strong>7 meilleurs artefacts</strong> selon l'échelle IDME (PAN-Maîtrise).
Les niveaux IDME (Insuffisant, Développement, Maîtrisé, Étendu) sont convertis en pourcentages.

<br><br>

<em style="color: var(--gris-moyen); font-size: 0.9rem;">💡 Ces paramètres peuvent être modifiés dans <strong>Réglages › Pratique de notation</strong></em>
```

**Exemple de sortie (Sommative)** :

```html
<strong>Méthodes de calcul des indices (pratique active : Sommative)</strong><br><br>

<strong style="color: var(--bleu-principal);">A (Assiduité)</strong> :
Taux global depuis le début du trimestre.
Formule : <code>A = (heures présentes / heures totales) × 100</code>

<br><br>

<strong style="color: var(--bleu-principal);">C (Complétion)</strong> :
Proportion d'évaluations remises parmi <strong>toutes les évaluations</strong> (Sommative).
Formule : <code>C = (évaluations remises / évaluations totales) × 100</code>

<br><br>

<strong style="color: var(--bleu-principal);">P (Performance)</strong> :
Moyenne pondérée de <strong>toutes les évaluations</strong> (Sommative).
Formule : <code>P = Σ(note × pondération) / Σ(pondérations)</code>

<br><br>

<em style="color: var(--gris-moyen); font-size: 0.9rem;">💡 Ces paramètres peuvent être modifiés dans <strong>Réglages › Pratique de notation</strong></em>
```

---

### 3. Fonction `mettreAJourExplicationCalculIndices()`

**Emplacement** : `js/etudiants.js` (lignes 516-524)

**Rôle** : Met à jour le contenu de la carte explicative

**Code** :
```javascript
function mettreAJourExplicationCalculIndices() {
    const carteNote = document.getElementById('note-calcul-indices-liste');
    if (!carteNote) {
        return;
    }

    const contenuHTML = genererExplicationCalculIndices();
    carteNote.innerHTML = contenuHTML;
}
```

**Appelée dans** : `afficherTableauEtudiantsListe()` (ligne 878)

---

### 4. Réattachement des événements toggle

**Emplacement** : `js/etudiants.js` (lignes 880-883)

**Code** :
```javascript
// Réattacher les événements des toggles emoji (pour le toggle 📐)
if (typeof reattacherEvenementsToggles === 'function') {
    reattacherEvenementsToggles();
}
```

**Fonction externe** : `reattacherEvenementsToggles()` définie dans `profil-etudiant.js` (ligne 6235)

**Nécessité** : Les événements doivent être réattachés après chaque mise à jour du tableau (innerHTML efface les listeners)

---

## 📊 Variations selon la configuration

### Configuration 1 : PAN-Maîtrise, 7 artefacts, A sur 12 séances

```
A (Assiduité) : Calculé sur les 12 dernières séances
C (Complétion) : Calculé sur les 7 meilleurs artefacts (PAN-Maîtrise)
P (Performance) : Moyenne des 7 meilleurs artefacts selon échelle IDME
```

### Configuration 2 : PAN-Maîtrise, 12 artefacts, A global

```
A (Assiduité) : Taux global depuis le début du trimestre
C (Complétion) : Calculé sur les 12 meilleurs artefacts (PAN-Maîtrise)
P (Performance) : Moyenne des 12 meilleurs artefacts selon échelle IDME
```

### Configuration 3 : Sommative, toutes évaluations, A global

```
A (Assiduité) : Taux global depuis le début du trimestre
C (Complétion) : Proportion d'évaluations remises (toutes les évaluations)
P (Performance) : Moyenne pondérée de toutes les évaluations (Sommative)
```

---

## 🎓 Utilité pédagogique

### Pour comprendre les corrélations

Lorsque les corrélations A-P et C-P sont affichées dans les en-têtes, cette carte permet de comprendre **pourquoi** certaines corrélations peuvent être différentes :

**Exemple** :

```
A (assiduité)          C (complétion)
r=0.45 (faible)        r=0.78 (forte)
```

**Sans le toggle** : L'enseignant peut se demander pourquoi A est peu corrélé à P.

**Avec le toggle activé** :
```
A : Calculé sur les 12 dernières séances
C : Calculé sur les 7 meilleurs artefacts
P : Moyenne des 7 meilleurs artefacts
```

**Interprétation** : A mesure la présence récente (12 séances), mais P mesure la qualité des meilleurs travaux. Un étudiant peut avoir été absent au début mais excellent récemment, d'où la faible corrélation.

---

### Pour ajuster les paramètres

Si l'enseignant observe :
- r_AP faible avec A sur 12 séances
- Il peut basculer vers A global (toutes séances) pour voir si la corrélation s'améliore
- Indication que le problème est dans les absences récentes vs anciennes

---

## 🔄 Comportement dynamique

### Recalcul automatique

Le contenu de la carte est **recalculé à chaque affichage** du tableau :

1. **Changement de pratique** (PAN ↔ Sommative) :
   - Texte mis à jour automatiquement
   - Nouvelle description de C et P

2. **Modification du nombre d'artefacts** (Réglages) :
   - "7 meilleurs artefacts" → "12 meilleurs artefacts"
   - Recalcul immédiat lors du retour à la liste

3. **Changement de mode de calcul A** :
   - Si passage 12 séances → global
   - Texte mis à jour automatiquement

---

## 🧪 Tests recommandés

### Test 1 : Toggle de base

1. Aller dans Tableau de bord › Liste des individus
2. Cliquer sur 📐
3. **Attendu** : Carte s'affiche avec détails de calcul
4. Cliquer à nouveau sur 📐
5. **Attendu** : Carte se cache

---

### Test 2 : Contenu PAN-Maîtrise

1. Aller dans Réglages › Pratique de notation
2. Sélectionner "PAN-Maîtrise"
3. Nombre d'artefacts : 7
4. Retourner à Tableau de bord › Liste
5. Cliquer sur 📐
6. **Attendu** :
   - "pratique active : PAN-Maîtrise"
   - "7 meilleurs artefacts" (2 fois)
   - Mention "échelle IDME"

---

### Test 3 : Contenu Sommative

1. Aller dans Réglages › Pratique de notation
2. Sélectionner "Sommative"
3. Retourner à Tableau de bord › Liste
4. Cliquer sur 📐
5. **Attendu** :
   - "pratique active : Sommative"
   - "toutes les évaluations" (2 fois)
   - "Moyenne pondérée"
   - Formule avec Σ

---

### Test 4 : Variation nombre d'artefacts

1. Réglages › Pratique de notation
2. PAN-Maîtrise, 12 artefacts
3. Retourner à la liste, cliquer 📐
4. **Attendu** : "12 meilleurs artefacts"
5. Retourner aux réglages, choisir 3 artefacts
6. Retourner à la liste, cliquer 📐
7. **Attendu** : "3 meilleurs artefacts"

---

### Test 5 : Mode de calcul A

1. Si données présentes avec `dernier12`
2. **Attendu** : "Calculé sur les 12 dernières séances"
3. Si seulement données globales
4. **Attendu** : "Taux global depuis le début du trimestre"

---

## 🎨 Cohérence visuelle

### Classes CSS réutilisées

```css
.emoji-toggle {
    cursor: pointer;
    font-size: 1.2rem;
    /* Défini dans styles.css */
}

.carte-info-toggle {
    /* Défini dans styles.css */
    /* Styles de base pour cartes toggleables */
}

.carte-info-note {
    background: var(--bleu-tres-pale);
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid var(--bleu-principal);
    /* Défini dans styles.css */
}
```

### Style cohérent avec Aperçu

Le toggle 📐 utilise **exactement le même mécanisme** que :
- Tableau de bord › Aperçu › Indicateurs globaux (📐)
- Tableau de bord › Aperçu des présences (📐)
- Tableau de bord › Aperçu des évaluations (📐)
- Profil étudiant › Sections diverses (ℹ️)

**Bénéfice** : Expérience utilisateur cohérente, apprentissage unique de l'interaction.

---

## 🔮 Évolutions futures possibles

### Court terme (Beta 91)
- [ ] Sauvegarder l'état du toggle dans localStorage (ouvert/fermé)
- [ ] Ajouter animation de transition (slide down/up)
- [ ] Tooltip sur 📐 avec aperçu rapide

### Moyen terme (Beta 92+)
- [ ] Liens directs vers Réglages › Pratique de notation
- [ ] Afficher les seuils IDME dans la carte
- [ ] Afficher fenêtre de patterns (3/7/12 artefacts)
- [ ] Graphique illustrant les périodes de calcul

### Long terme (Version 1.0)
- [ ] Mode "Aide contextuelle" avec tutoriels intégrés
- [ ] Export PDF de la carte explicative
- [ ] Historique des changements de configuration

---

## 📚 Documentation liée

**Fichiers connexes** :
- `CORRELATIONS_ACP_2025-11-18.md` : Calcul des corrélations A-P et C-P
- `ARCHITECTURE_PRATIQUES.md` : Système de pratiques modulaire
- `GUIDE_AJOUT_PRATIQUE.md` : Ajouter une nouvelle pratique de notation

**Fonctions réutilisées** :
- `reattacherEvenementsToggles()` : Définie dans `profil-etudiant.js`
- Classes CSS `.emoji-toggle`, `.carte-info-toggle`, `.carte-info-note`

---

## 🎯 Impact utilisateur

### Avant cette fonctionnalité

**Utilisateur** : "Pourquoi A est corrélé à 0.45 avec P alors que C est à 0.78 ?"

**Problème** : Impossible de savoir comment les indices sont calculés sans lire la documentation externe.

---

### Après cette fonctionnalité

**Utilisateur** : Clique sur 📐

**Carte affichée** :
```
A : Calculé sur les 12 dernières séances
C : Calculé sur les 7 meilleurs artefacts
P : Moyenne des 7 meilleurs artefacts
```

**Compréhension** : "Ah! C et P portent sur les mêmes 7 artefacts, normal qu'ils soient très corrélés. A mesure la présence récente, pas forcément liée aux meilleurs travaux."

---

## 📝 Notes techniques

### Ordre de chargement critique

1. `afficherTableauEtudiantsListe()` est appelée
2. Tableau HTML généré
3. `mettreAJourExplicationCalculIndices()` appelée → innerHTML de la carte
4. `reattacherEvenementsToggles()` appelée → événement click sur 📐

**IMPORTANT** : L'ordre 3 → 4 est critique. Si inversé, l'événement est attaché avant que le toggle existe dans le DOM.

---

### Performance

- **Temps de génération** : < 1ms (lecture localStorage + concaténation strings)
- **Impact sur affichage tableau** : Négligeable
- **Optimisation future** : Mise en cache si configuration ne change pas

---

**Dernière mise à jour** : 18 novembre 2025
**Prochaine révision** : Après tests utilisateurs Beta 91
