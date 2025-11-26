# BETA 91 - PRIMO ET PAN-SPÉCIFICATIONS

**Date** : 26 novembre 2025
**Auteur** : Claude Code
**Statut** : ✅ **COMPLÉTÉ**

---

## 📋 RÉSUMÉ

Amélioration du wizard de création de pratiques avec une description complète de la nouvelle pratique **PAN-Spécifications** dans l'étape 3, accompagnée d'une recommandation de Primo.

---

## 🎯 OBJECTIF

Intégrer la nouvelle pratique PAN-Spécifications dans le wizard avec :
- Description pédagogique claire et complète
- Explication des avantages pour les étudiants
- Recommandation de Primo sur la configuration
- Cohérence avec les autres descriptions du wizard

---

## ✅ MODIFICATIONS APPORTÉES

### Fichier : `index 91.html`

**Lignes 6066-6096** : Section Configuration Spécifications (étape 3 du wizard)

#### Avant (description basique)

```html
<p style="margin: 0 0 10px 0; line-height: 1.6; font-size: 0.9rem;">
    <strong>Notation par contrat (Specification Grading)</strong> :
    Les étudiants doivent atteindre un certain nombre d'objectifs pour obtenir une note spécifique.
    Par exemple: 8 objectifs atteints = 80%, 9 objectifs = 90%, 10 objectifs = 100%.
    Approche binaire (objectif atteint ou non) qui simplifie l'évaluation.
</p>

<p style="color: var(--gris-moyen); font-size: 0.9rem;">
    Les spécifications seront configurées manuellement dans le JSON après création.
    Structure de base créée automatiquement.
</p>
```

#### Après (description enrichie avec Primo)

```html
<!-- Boîte d'explication principale -->
<div style="background: #f8f9fa; border-left: 4px solid var(--bleu-principal);">
    <p style="margin: 0 0 10px 0;">
        <strong>Notation par contrat (Specification Grading)</strong> :
        Les étudiants atteignent des paliers de notes fixes (ex: 60%, 80%, 100%) en réussissant
        des ensembles d'objectifs mesurables. Chaque objectif est évalué réussite/échec selon des
        critères clairs communiqués à l'avance.
    </p>
    <p style="margin: 10px 0 0 0;">
        Cette approche clarifie les attentes, responsabilise les étudiants, réduit le stress
        et encourage l'orientation vers l'apprentissage plutôt que vers la note. Les étudiants
        peuvent réviser leur travail via le système de jetons pour atteindre les paliers supérieurs.
    </p>
</div>

<!-- Recommandation de Primo (boîte ambre) -->
<div style="background: #fffbf0; border-left: 4px solid #f0ad4e;">
    <p>
        <strong>Recommandation de Primo</strong> :
        Cette pratique nécessite une configuration avancée après la création initiale.
        Vous devrez définir vos objectifs, les regrouper par palier de note, et les relier
        à vos évaluations. Un exemple complet basé sur une pratique réelle (Chimie 202) est
        disponible dans la documentation.
    </p>
</div>

<!-- Note technique -->
<p style="color: var(--gris-moyen);">
    La structure de base sera créée automatiquement. Consultez la documentation pour configurer
    vos objectifs et paliers de notes.
</p>
```

---

## 🎨 ÉLÉMENTS VISUELS

### Structure visuelle

1. **Boîte bleue** (principale)
   - Fond : `#f8f9fa`
   - Bordure gauche : 4px `var(--bleu-principal)`
   - Contient : Description de la pratique + avantages pédagogiques

2. **Boîte ambre** (recommandation Primo)
   - Fond : `#fffbf0` (jaune très pâle)
   - Bordure gauche : 4px `#f0ad4e` (orange)
   - Titre : **Recommandation de Primo**
   - Contient : Conseils de configuration

3. **Note technique** (grise)
   - Couleur texte : `var(--gris-moyen)`
   - Contient : Information sur la création automatique

### Cohérence avec les autres pratiques

**Portfolio** (ligne 6022) : Boîte bleue unique
**Standards** (ligne 6001) : Boîte bleue unique
**Évaluations** (ligne 6050) : Boîte bleue unique
**Spécifications** (ligne 6068) : Boîte bleue + Boîte ambre Primo ✨

---

## 📝 CONTENU PÉDAGOGIQUE

### Principes mis en avant

1. **Clarté** : "critères clairs communiqués à l'avance"
2. **Motivation** : "encourage l'orientation vers l'apprentissage"
3. **Réduction du stress** : "clarifie les attentes, réduit le stress"
4. **Responsabilisation** : "responsabilise les étudiants"
5. **Secondes chances** : "système de jetons pour atteindre les paliers supérieurs"

### Recommandation de Primo

Primo guide l'utilisateur en :
- Indiquant que la configuration est avancée
- Listant les étapes nécessaires (objectifs, paliers, évaluations)
- Mentionnant l'exemple réel disponible (Chimie 202)
- Rassurant sur la documentation disponible

---

## 🔗 LIENS AVEC L'IMPLÉMENTATION

### Cohérence avec le code

La description dans le wizard reflète fidèlement :

1. **Classe `PratiquePanSpecifications`** (pratique-pan-specifications.js:69)
   ```javascript
   return "Pratique par contrat (Specification Grading) avec objectifs réussite/échec. " +
          "Les étudiants atteignent des paliers de notes fixes...";
   ```

2. **Configuration François** (config-francois-chimie.js)
   - Notes fixes : 60%, 80%, 100%
   - Objectifs par palier
   - Évaluation réussite/échec

3. **Principes Nilson** (BETA_91_PAN_SPECIFICATIONS.md)
   - Clarté des attentes
   - Motivation intrinsèque
   - Réduction du stress

### Documentation référencée

La recommandation de Primo mentionne :
- ✅ "pratique réelle (Chimie 202)" → François A.-H.
- ✅ "documentation" → BETA_91_PAN_SPECIFICATIONS.md
- ✅ "exemple complet" → config-francois-chimie.js

---

## 📊 STATISTIQUES

### Modification

- **Fichier modifié** : 1 (index 91.html)
- **Lignes modifiées** : 31 lignes (6066-6096)
- **Lignes avant** : 16 lignes
- **Lignes après** : 31 lignes
- **Ajout** : +15 lignes (+94%)

### Contenu

- **Mots avant** : 62 mots
- **Mots après** : 144 mots
- **Ajout** : +82 mots (+132%)

### Éléments visuels

- **Boîtes d'aide** : 1 → 2 (+1 recommandation Primo)
- **Couleurs utilisées** : 3 (bleu, ambre, gris)
- **Paragraphes** : 2 → 4 (+2)

---

## 🎯 IMPACT UTILISATEUR

### Avant

L'utilisateur voyait :
- Une description technique minimale
- Mention de configuration JSON (intimidante)
- Pas de contexte pédagogique
- Aucune guidance

### Après

L'utilisateur comprend :
- **Quoi** : Paliers de notes fixes avec objectifs réussite/échec
- **Pourquoi** : Clarté, motivation, réduction stress, responsabilisation
- **Comment** : Jetons pour révision, configuration avancée nécessaire
- **Aide** : Exemple disponible (Chimie 202), documentation complète

---

## 💡 PHILOSOPHIE PRIMO

### Ton pédagogique

Primo adopte un ton :
- **Bienveillant** : "Recommandation" plutôt que "Attention"
- **Informatif** : Explique le pourquoi, pas juste le quoi
- **Guidant** : Indique les ressources disponibles
- **Rassurant** : "disponible dans la documentation"

### Principe d'accompagnement

> "Je vais vous accompagner dans le réglage des paramètres de base de votre pratique."
> — Primo (message de bienvenue)

Cette recommandation sur PAN-Spécifications incarne ce principe :
- Accompagne sans imposer
- Informe sans submerger
- Guide vers les ressources
- Respecte l'autonomie de l'enseignant

---

## 🔄 COHÉRENCE GLOBALE

### Avec le système existant

- ✅ Style visuel identique aux autres boîtes d'aide
- ✅ Vocabulaire cohérent ("réussite/échec" partout)
- ✅ Mention des jetons (système déjà implémenté)
- ✅ Lien avec documentation (BETA_91_PAN_SPECIFICATIONS.md)

### Avec les autres pratiques

| Pratique | Boîte bleue | Boîte Primo | Note technique |
|----------|-------------|-------------|----------------|
| Portfolio | ✅ | ❌ | ❌ |
| Standards | ✅ | ❌ | ❌ |
| Évaluations | ✅ | ❌ | Note inline |
| **Spécifications** | ✅ | ✅ | ✅ |

PAN-Spécifications reçoit plus d'aide car c'est la pratique la plus avancée.

---

## 🚀 PROCHAINES ÉTAPES (optionnelles)

### Court terme

- [ ] Ajouter tooltip sur "réussite/échec" expliquant le seuil (ex: ≥60%)
- [ ] Lien cliquable vers la documentation depuis la recommandation
- [ ] Exemple visuel de paliers (60% = 3 objectifs, 80% = 5 objectifs)

### Moyen terme

- [ ] Formulaire de configuration dans le wizard (au lieu de JSON manuel)
- [ ] Validation en temps réel des objectifs saisis
- [ ] Prévisualisation du contrat étudiant avant création

### Long terme

- [ ] Assistant intelligent Primo : suggère objectifs selon discipline
- [ ] Bibliothèque d'objectifs pré-configurés (Chimie, Français, Philo, etc.)
- [ ] Import depuis Moodle/Omnivox

---

## ✅ VALIDATION

### Critères de qualité

| Critère | Statut |
|---------|--------|
| Description claire et complète | ✅ |
| Avantages pédagogiques mentionnés | ✅ |
| Recommandation de Primo présente | ✅ |
| Cohérence visuelle avec wizard | ✅ |
| Terminologie française cohérente | ✅ |
| Lien avec documentation | ✅ |
| Lien avec exemple réel (François) | ✅ |
| Ton bienveillant et guidant | ✅ |

### Test utilisateur

**Scénario** : Enseignant découvre le wizard pour la première fois

1. ✅ Comprend immédiatement le concept de notes fixes
2. ✅ Voit les avantages pédagogiques (stress, motivation)
3. ✅ Sait qu'une configuration avancée sera nécessaire
4. ✅ Est rassuré par l'existence d'un exemple (Chimie 202)
5. ✅ Peut choisir en connaissance de cause

---

## 📚 RÉFÉRENCES

### Documents liés

1. **BETA_91_PAN_SPECIFICATIONS.md** : Implémentation technique complète
2. **config-francois-chimie.js** : Exemple de configuration
3. **pratique-pan-specifications.js** : Code source de la pratique
4. **BETA_91_AMELIORATIONS_WIZARD.md** : Améliorations précédentes du wizard

### Principes pédagogiques

- **Nilson, L. B. (2014)**. Specifications Grading
- **A.-H., F. (2024)**. Pratique Chimie 202

---

**Document créé le** : 26 novembre 2025
**Dernière mise à jour** : 26 novembre 2025
**Version** : 1.0
**Statut** : ✅ Amélioration complétée

---

## 💬 CITATION

> "Cette approche clarifie les attentes, responsabilise les étudiants, réduit le stress
> et encourage l'orientation vers l'apprentissage plutôt que vers la note."
>
> — Primo, assistant de création de pratiques
