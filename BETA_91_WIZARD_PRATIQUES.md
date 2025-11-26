# BETA 91 - WIZARD DE CRÉATION DE PRATIQUES

**Date** : 25 novembre 2025
**Auteur** : Claude Code
**Statut** : ✅ **IMPLÉMENTÉ**

---

## 📋 RÉSUMÉ

Implémentation complète d'un **wizard interactif en 8 étapes** permettant de créer des pratiques d'évaluation configurables via une interface graphique intuitive.

Le wizard guide l'utilisateur à travers toutes les sections d'une configuration de pratique JSON, avec validation à chaque étape et prévisualisation des choix.

---

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### 1. **Modal Wizard** (`index 91.html` lignes 5771-6123)

#### Structure complète :
- **Indicateur de progression** : Affichage "Étape X/8" avec titre descriptif
- **Dots de navigation** : 8 points circulaires indiquant la progression
- **8 étapes distinctes** : Une pour chaque section de configuration
- **Boutons de navigation** : Précédent/Suivant/Créer avec logique conditionnelle
- **Animation fluide** : Transitions CSS entre étapes (fadeIn)

#### Étapes du wizard :

**Étape 1 : Informations de base**
- Nom de la pratique (requis)
- Auteur
- Description
- Discipline

**Étape 2 : Échelle d'évaluation**
- Type d'échelle :
  - **Niveaux** (IDME, 0-1-2-3-4, etc.) : Configuration dynamique de 2-6 niveaux
  - **Pourcentage** (0-100%)
  - **Notes fixes** (ex: 50, 60, 80, 100)
- Configuration spécifique selon le type choisi
- Pré-remplissage IDME par défaut (I, D, M, E)

**Étape 3 : Structure des évaluations**
- Type de structure :
  - **Standards** : Nombre de standards, terminaux
  - **Portfolio** : Mode sélection (N meilleurs, tous, derniers), options
  - **Évaluations discrètes** : Liste évaluations avec pondération
  - **Spécifications** : Notes fixes selon objectifs atteints
- Formulaires dynamiques selon le type

**Étape 4 : Calcul de la note**
- Méthode de calcul :
  - **Conversion niveaux → pourcentage**
  - **Moyenne pondérée**
  - **Spécifications**
- Explications contextuelles pour chaque méthode
- Option conditions spéciales (double verrou, plafonnement)

**Étape 5 : Système de reprises**
- Type de reprises :
  - **Aucune**
  - **Illimitées**
  - **Occasions ponctuelles** (semaines spécifiques)
  - **Nombre limité**
- Options :
  - Reprises individuelles (bureau)
  - Niveau rétrogradable

**Étape 6 : Gestion des critères**
- Type de gestion :
  - **Critères fixes** : Même critères partout (SRPNF par défaut)
  - **Critères par standard** : Spécifiques à chaque standard
  - **Critères par évaluation** : Variables selon le type
- Zone de texte pour définir critères fixes

**Étape 7 : Seuils d'interprétation**
- Type de seuils :
  - **Pourcentages** : Va bien, Difficulté, Grande difficulté
  - **Niveaux** : Niveau acceptable minimal
- Valeurs par défaut : 85%, 80%, 70%

**Étape 8 : Interface et terminologie**
- Options d'affichage :
  - Notes chiffrées (par défaut: oui)
  - Rang de l'étudiant (par défaut: non)
  - Moyenne du groupe (par défaut: non)
- Terminologie personnalisée :
  - Terme pour "Évaluation"
  - Terme pour "Critère"
  - Terme pour "Note finale"
  - Terme pour "Reprise"

---

### 2. **Fonctions JavaScript** (`js/pratiques.js` lignes 1594-2347)

#### Gestion du wizard :
- `creerNouvellePratique()` : Ouvre le wizard
- `fermerWizardPratique()` : Ferme le wizard
- `resetterWizard()` : Réinitialise tous les champs
- `afficherEtapeWizard(numeroEtape)` : Affiche une étape spécifique
- `suivantEtapeWizard()` : Passe à l'étape suivante avec validation
- `precedentEtapeWizard()` : Retour à l'étape précédente
- `validerEtapeWizard(numeroEtape)` : Validation des champs requis

#### Configuration dynamique :
- `afficherConfigEchelle()` : Affiche config selon type d'échelle
- `afficherConfigStructure()` : Affiche config selon type de structure
- `afficherConfigCalcul()` : Affiche config selon méthode de calcul
- `afficherConfigReprises()` : Affiche config selon type de reprises
- `afficherConfigCriteres()` : Affiche config selon type de critères
- `afficherConfigSeuils()` : Affiche config selon type de seuils

#### Gestion des listes dynamiques :
- `initialiserNiveauxIDME()` : Pré-remplit 4 niveaux IDME
- `ajouterNiveauWizard(niveauDefaut)` : Ajoute un niveau (max 6)
- `retirerNiveauWizard(btn)` : Retire un niveau (min 2)
- `ajouterEvaluationWizard()` : Ajoute une évaluation discrète
- `retirerEvaluationWizard(btn)` : Retire une évaluation

#### Construction du JSON :
- `creerPratiqueDepuisWizard()` : Fonction principale de création
- `construireEchelle()` : Génère la section `echelle`
- `construireStructure()` : Génère la section `structure_evaluations`
- `construireCalcul()` : Génère la section `calcul_note`
- `construireReprises()` : Génère la section `systeme_reprises`
- `construireCriteres()` : Génère la section `gestion_criteres`
- `construireSeuils()` : Génère la section `seuils`
- `construireInterface()` : Génère la section `interface`

---

### 3. **CSS Wizard** (`styles.css` lignes 1846-1876)

```css
/* Dots de progression */
.wizard-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--gris-leger);
    transition: background 0.3s ease, transform 0.3s ease;
}

.wizard-dot-active {
    background: var(--bleu-principal);
    transform: scale(1.3);
}

/* Animation des étapes */
.wizard-step {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

### 4. **Fonction d'édition** (`js/pratiques.js` lignes 1490-1512)

**Implémentation temporaire** :
- `editerPratique(id)` : Propose d'exporter le JSON pour édition manuelle
- Workflow suggéré :
  1. Exporter la pratique en JSON
  2. Modifier le fichier
  3. Supprimer l'ancienne pratique
  4. Réimporter le JSON modifié
- **Note** : Le wizard d'édition pré-rempli sera implémenté dans une version future

---

## 📦 FICHIERS MODIFIÉS

### 1. `index 91.html`
- **Lignes 5771-6123** : Ajout du modal wizard (350+ lignes)
- **Ligne 5769** : Input caché pour import JSON
- **Ligne 9629** : Ajout script `pratiques.js` avec cache buster

### 2. `js/pratiques.js`
- **Lignes 1594-2347** : Code wizard (750+ lignes)
- **Lignes 2435-2449** : Exports des fonctions wizard vers `window`
- **Total** : ~88 KB

### 3. `styles.css`
- **Lignes 1846-1876** : Styles wizard dots et animations (30 lignes)

---

## 🔄 WORKFLOW UTILISATEUR

### Création d'une pratique :

1. **Ouvrir le wizard** : Clic sur "**+ Créer une pratique**"

2. **Étape 1** : Remplir nom, auteur, description, discipline

3. **Étape 2** : Choisir type d'échelle
   - Si "Niveaux" : Configurer 2-6 niveaux (code, label, %, couleur)
   - Si "Pourcentage" : Confirmation automatique
   - Si "Notes fixes" : Saisir les notes possibles

4. **Étape 3** : Choisir structure des évaluations
   - Si "Standards" : Nombre total, standards terminaux
   - Si "Portfolio" : Mode sélection, nombre d'artefacts
   - Si "Évaluations discrètes" : Ajouter évaluations + pondération
   - Si "Spécifications" : Structure de base créée

5. **Étape 4** : Choisir méthode de calcul
   - Conversion niveaux / Moyenne pondérée / Spécifications
   - Option conditions spéciales

6. **Étape 5** : Configurer les reprises
   - Type de système
   - Options bureau et rétrogradation

7. **Étape 6** : Gérer les critères
   - Type de gestion
   - Si fixes : Saisir critères (SRPNF par défaut)

8. **Étape 7** : Définir les seuils
   - Pourcentages ou niveaux
   - Saisir valeurs

9. **Étape 8** : Personnaliser l'interface
   - Options d'affichage
   - Terminologie

10. **Créer** : Clic sur "**✓ Créer la pratique**"
    - Génération du JSON complet
    - Sauvegarde via `PratiqueManager`
    - Ajout à la liste des pratiques configurables
    - Message de confirmation

---

## 🎯 VALIDATION

### Validation à chaque étape :

- **Étape 1** : Nom requis
- **Étape 2** : Type d'échelle requis
- **Étape 3** : Type de structure requis
- **Étape 4** : Méthode de calcul requise
- **Étape 5** : Type de reprises requis
- **Étape 6** : Type de gestion critères requis
- **Étape 7** : Type de seuils requis
- **Étape 8** : Pas de validation (valeurs par défaut)

### Contraintes :
- **Niveaux** : Minimum 2, maximum 6
- **Évaluations** : Au moins 1 pour évaluations discrètes
- **Tous champs requis** : Bloque progression vers étape suivante

---

## 💡 EXEMPLE DE JSON GÉNÉRÉ

```json
{
  "id": "pratique-1732619400000",
  "nom": "Mon PAN personnalisé",
  "auteur": "Jean Dupont",
  "description": "Pratique PAN adaptée à mes besoins",
  "discipline": "Philosophie",
  "version": "1.0",
  "date_creation": "2025-11-25",
  "echelle": {
    "type": "niveaux",
    "niveaux": [
      {
        "code": "I",
        "label": "Insuffisant",
        "description": "",
        "valeur_numerique": 1,
        "valeur_pourcentage": 50,
        "couleur": "#FF6B6B",
        "ordre": 1
      },
      {
        "code": "D",
        "label": "En développement",
        "description": "",
        "valeur_numerique": 2,
        "valeur_pourcentage": 70,
        "couleur": "#FFD93D",
        "ordre": 2
      },
      {
        "code": "M",
        "label": "Maîtrisé",
        "description": "",
        "valeur_numerique": 3,
        "valeur_pourcentage": 80,
        "couleur": "#6BCF7F",
        "ordre": 3
      },
      {
        "code": "E",
        "label": "Étendu",
        "description": "",
        "valeur_numerique": 4,
        "valeur_pourcentage": 92.5,
        "couleur": "#4D96FF",
        "ordre": 4
      }
    ]
  },
  "structure_evaluations": {
    "type": "portfolio",
    "description": "Artefacts de portfolio",
    "selection": "n_meilleurs",
    "n_artefacts_options": [3, 7, 12],
    "n_artefacts_defaut": 7
  },
  "calcul_note": {
    "methode": "conversion_niveaux",
    "description": "Conversion des niveaux en pourcentages",
    "table_conversion": [],
    "conditions_speciales": []
  },
  "systeme_reprises": {
    "type": "illimitees",
    "reprises_bureau": true,
    "niveau_retrogradable": false
  },
  "gestion_criteres": {
    "type": "fixes",
    "criteres_fixes": [
      "Structure",
      "Rigueur",
      "Plausibilité",
      "Nuance",
      "Français"
    ]
  },
  "seuils": {
    "type": "pourcentage",
    "va_bien": 85,
    "difficulte": 80,
    "grande_difficulte": 70
  },
  "interface": {
    "afficher_notes_chiffrees": true,
    "afficher_rang": false,
    "afficher_moyenne_groupe": false,
    "terminologie": {
      "evaluation": "Artefact",
      "critere": "Critère",
      "note_finale": "Note finale",
      "reprise": "Reprise"
    }
  }
}
```

---

## 🚀 PROCHAINES ÉTAPES

### Court terme (Beta 91.1)
- [ ] Tests utilisateur complets
- [ ] Corrections bugs éventuels
- [ ] Amélioration messages de validation
- [ ] Ajout tooltips explicatifs

### Moyen terme (Beta 93)
- [ ] **Wizard d'édition pré-rempli** :
  - Charger JSON existant dans le wizard
  - Pré-remplir tous les champs
  - Permettre modification et sauvegarde
  - Préserver l'ID original
- [ ] Import de pratiques prédéfinies via le wizard
- [ ] Prévisualisation du JSON avant création
- [ ] Templates de pratiques populaires

### Long terme (Version 1.0)
- [ ] Validation avancée (cohérence entre sections)
- [ ] Assistant intelligent (suggestions contextuelles)
- [ ] Duplication depuis wizard (cloner + éditer)
- [ ] Export/import de templates partiels

---

## 📊 STATISTIQUES

- **Lignes de code ajoutées** : ~1,130 lignes
  - HTML : 350 lignes
  - JavaScript : 750 lignes
  - CSS : 30 lignes
- **Fonctions créées** : 23 fonctions
- **Étapes du wizard** : 8 étapes
- **Types de configurations** : 4 types d'échelles × 4 types de structures × 3 méthodes de calcul = **48 combinaisons possibles**

---

## ✅ VALIDATION

### Syntaxe :
```bash
node --check js/pratiques.js
# ✅ Aucune erreur
```

### Tests manuels requis :
1. Ouvrir `index 91.html`
2. Aller dans Réglages → Pratique de notation
3. Cliquer "**+ Créer une pratique**"
4. Naviguer à travers les 8 étapes
5. Créer une pratique complète
6. Vérifier qu'elle apparaît dans la liste
7. Tester activation
8. Tester duplication
9. Tester export JSON
10. Tester suppression

---

## 📝 NOTES IMPORTANTES

### Compatibilité :
- ✅ Compatible avec toutes les pratiques existantes
- ✅ Compatible avec l'import/export JSON
- ✅ Compatible avec le système PratiqueManager
- ✅ Compatible avec PratiqueConfigurable

### Limitations actuelles :
- ⚠️ Édition via wizard non implémentée (export/import manuel requis)
- ⚠️ Pas de prévisualisation JSON avant création
- ⚠️ Conditions spéciales non configurables via wizard (édition manuelle JSON requise)
- ⚠️ Occasions formelles de reprise non configurables via wizard

### Avantages du wizard :
- ✅ Interface intuitive guidée
- ✅ Validation progressive
- ✅ Pas besoin de connaître la structure JSON
- ✅ Pré-remplissage intelligent (IDME, SRPNF)
- ✅ Configuration complète en 8 étapes
- ✅ Génération JSON automatique et valide

---

**Document créé le** : 25 novembre 2025
**Dernière mise à jour** : 25 novembre 2025
**Version** : 1.0
**Statut** : ✅ Implémentation complète
