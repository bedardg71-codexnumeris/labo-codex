# Notes de version - Beta 0.83

**Date de publication** : 31 octobre 2025
**Nom de code** : Seuils configurables

---

## 🎯 Objectif de cette version

Beta 0.83 introduit la **configuration des seuils d'interprétation** pour les indices A-C-P-R, permettant aux enseignant·es de personnaliser les niveaux d'alerte selon leur contexte pédagogique. Cette version améliore également l'affichage de la section **Mobilisation** avec un format épuré et l'utilisation des descriptions de productions.

---

## ✨ Nouveautés principales

### 1. Seuils configurables pour interprétation des indices (NOUVELLE FONCTIONNALITÉ)

**Localisation** : Réglages › Pratique de notation › Seuils d'interprétation

- ✅ **Configuration des seuils** pour tous les indices (A, C, P, R)
- ✅ **Trois niveaux d'alerte** personnalisables :
  - Niveau 1 (Fragile) : seuil par défaut 70%
  - Niveau 2 (Acceptable) : seuil par défaut 80%
  - Niveau 3 (Bon) : seuil par défaut 85%
- ✅ **Validation en temps réel** : empêche les seuils incohérents (Fragile ≥ Acceptable ≥ Bon)
- ✅ **Réinitialisation rapide** : bouton pour revenir aux valeurs par défaut
- ✅ **Application immédiate** : recalcul automatique de tous les diagnostics et niveaux RàI

**Impact** : Les seuils personnalisés affectent :
- Couleurs des indicateurs dans le Tableau de bord
- Niveaux de risque dans les Profils étudiants
- Recommandations RàI (Réponse à l'Intervention)
- Alertes de patterns comportementaux

---

### 2. Affichage épuré de la section Mobilisation

**Localisation** : Consultation › Profil étudiant › Section Mobilisation

#### Productions remises
- ✅ **Descriptions au lieu de noms** : Affiche "Carte mentale" au lieu de "Artefact 3"
- ✅ **Notes épurées** : `52.5` au lieu de `52.5/100`
- ✅ **Format cohérent** : Niveau IDME + note entre parenthèses

**Avant** : `Artefact 3 (M) (75.5/100)`
**Après** : `Carte mentale (M) (75.5)`

#### Absences
- ✅ **Format fraction simplifié** : `2/3` au lieu de `(2h manquées)`
- ✅ **Uniformisation** : Même format pour absences complètes et partielles

**Avant (absence complète)** : `14 oct. 2025 (2h manquées)`
**Après** : `14 oct. 2025 2/3`

**Avant (absence partielle)** : `21 oct. 2025 (2/3h)`
**Après** : `21 oct. 2025 2/3`

---

### 3. Descriptions de productions partout

**Impact global** : Toutes les sections affichant des productions utilisent maintenant les descriptions

- ✅ **Profil étudiant** : Section Performance (meilleures productions)
- ✅ **Profil étudiant** : Section Mobilisation (productions remises/non remises)
- ✅ **Portfolio** : Sélection des artefacts retenus
- ✅ **Productions** : Formulaire d'ajout au portfolio
- ✅ **Détails de calcul** : Liste des artefacts retenus pour l'indice P

---

## 🔄 Changements techniques

### Fichiers modifiés

1. **index 83 (seuils configurables).html**
   - Ajout de l'interface de configuration des seuils
   - Mise à jour des numéros de version (Beta 0.83)
   - Mise à jour de la date (31 octobre 2025)

2. **js/profil-etudiant.js**
   - Utilisation des descriptions de productions (6 emplacements)
   - Format épuré des notes (2 emplacements)
   - Format épuré des heures d'absence (3 emplacements)
   - Ajout du champ `description` dans les mappings d'artefacts

3. **js/portfolio.js**
   - Utilisation des descriptions dans l'interface de sélection (2 emplacements)
   - Suppression de la duplication description/titre

4. **js/productions.js**
   - Utilisation des descriptions dans les checkboxes (1 emplacement)

---

## 📊 Impact sur les données

### Pas de migration requise

- ✅ Les seuils par défaut (70%, 80%, 85%) sont appliqués automatiquement
- ✅ Les descriptions de productions existantes sont utilisées immédiatement
- ✅ Fallback sur le titre si la description n'existe pas
- ✅ Compatibilité totale avec les versions précédentes

### Nouveau localStorage

```javascript
// Nouvelle clé ajoutée
localStorage.seuilsInterpretation = {
    assiduiteFragile: 70,
    assiduiteAcceptable: 80,
    assiduiteBon: 85,
    completionFragile: 70,
    completionAcceptable: 80,
    completionBon: 85,
    performanceFragile: 70,
    performanceAcceptable: 80,
    performanceBon: 85,
    risqueFragile: 70,
    risqueAcceptable: 80,
    risqueBon: 85
}
```

---

## 🎨 Améliorations UX

1. **Configuration intuitive** : Interface claire avec validation visuelle
2. **Feedback immédiat** : Les couleurs des badges changent en direct lors de l'ajustement
3. **Prévention d'erreurs** : Impossible de sauvegarder des seuils incohérents
4. **Affichage épuré** : Moins de texte redondant, focus sur l'information essentielle
5. **Descriptions parlantes** : Les productions sont identifiées par leur nature, pas leur numéro

---

## 📝 Documentation mise à jour

### Section Aide enrichie

- ✅ Nouvelle carte "Seuils d'interprétation" dans Référence
- ✅ Explication détaillée du système de niveaux (Fragile/Acceptable/Bon)
- ✅ Impact sur les couleurs et recommandations
- ✅ Exemples de personnalisation selon le contexte

---

## 🔧 Workflow de personnalisation

### Utilisation typique

1. **Accéder aux réglages** : Réglages › Pratique de notation › Seuils d'interprétation
2. **Ajuster selon le contexte** :
   - Groupe faible : seuils plus bas (60%, 70%, 80%)
   - Groupe fort : seuils plus élevés (75%, 85%, 90%)
   - Contexte pandémique : seuils adaptés (65%, 75%, 82%)
3. **Valider** : Vérifier la cohérence (message d'erreur si incohérent)
4. **Sauvegarder** : Recalcul automatique de tous les diagnostics
5. **Vérifier** : Consulter le Tableau de bord pour voir l'impact

---

## ⚠️ Notes importantes

### Recommandations pédagogiques

- **Ne pas abuser** : Des seuils trop bas peuvent masquer des difficultés réelles
- **Documenter les choix** : Noter les raisons des personnalisations pour la session suivante
- **Réévaluer régulièrement** : Ajuster en cours de session si nécessaire
- **Cohérence départementale** : Coordonner avec les collègues pour harmonisation

### Limitations actuelles

- Les seuils sont globaux (même configuration pour tous les étudiants)
- Pas de seuils différents entre pratiques sommative et alternative (pour le moment)
- Les seuils ne s'appliquent pas rétroactivement aux données historiques

---

## 📦 Contenu du package

### Fichiers inclus

```
Monitorage_Beta_0.83/
├── index 83 (seuils configurables).html  ← Point d'entrée
├── styles.css
├── js/
│   ├── config.js
│   ├── navigation.js
│   ├── main.js
│   ├── profil-etudiant.js           ← Affichage épuré
│   ├── portfolio.js                 ← Descriptions
│   ├── productions.js               ← Descriptions
│   ├── pratiques.js                 ← Seuils configurables
│   ├── [... autres modules ...]
├── donnees-demo.json
├── etudiants-demo.txt
├── etudiants-demo-groupe9999.txt
├── NOTES_VERSION_0.83.md            ← Ce fichier
├── CLAUDE.md
└── README_PROJET.md
```

### Fichiers de démonstration

- ✅ `donnees-demo.json` : Jeu complet avec 30 étudiants + matériel pédagogique
- ✅ `etudiants-demo.txt` : Import rapide (groupe TEST)
- ✅ `etudiants-demo-groupe9999.txt` : Import alternatif (groupe 9999)

---

## 🚀 Prochaines étapes (PHASE 1.2)

### Priorités pour Beta 0.84

1. **Fenêtre glissante configurable** : Permettre de choisir 2, 3 ou 5 artefacts
2. **Seuils par pratique** : Seuils différents pour SOM vs PAN
3. **Graphiques d'évolution** : Visualisation temporelle des indices A-C-P
4. **Export des seuils** : Partage de configurations entre collègues

---

## 📊 Statistiques du projet

| Métrique | Valeur |
|----------|--------|
| **Taille package** | ~325 Ko |
| **Fichiers JavaScript** | 17 modules |
| **Lignes de code JS** | ~18 500 lignes |
| **Fichiers CSS** | 1 fichier (styles.css) |
| **Lignes de CSS** | ~3 200 lignes |
| **Clés localStorage** | 23 clés |
| **Sections d'aide** | 5 sous-sections |
| **Cartes dans Aide** | 47 cartes |

---

## 🙏 Remerciements

Merci aux testeurs de Beta 0.81-0.82 pour leurs retours sur :
- La nécessité de personnaliser les seuils selon les contextes
- L'importance d'afficher les descriptions de productions
- La demande de simplification de l'affichage des notes

---

## 📞 Support et feedback

**Problèmes connus** : Aucun bug bloquant identifié

**Rapporter un bug** : Via le bouton "Soutenir le projet" ou par courriel

**Documentation complète** : Consultez la section Aide › Introduction › Guide de démarrage

---

**Fichier mis à jour le** : 31 octobre 2025 (Beta 0.83 - seuils configurables)
