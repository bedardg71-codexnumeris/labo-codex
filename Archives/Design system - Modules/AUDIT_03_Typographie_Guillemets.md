# AUDIT 03 : Typographie - Guillemets français
**Priorité :** 🔴 CRITIQUE  
**Durée estimée :** 1 heure  
**Fichiers concernés :** ~20 fichiers

---

## 🎯 Objectif

Remplacer **tous** les guillemets anglais par des **guillemets français avec espaces insécables**.

---

## 📋 Contexte

L'application est en français et doit utiliser systématiquement la typographie française correcte pour :
- Professionnalisme et cohérence linguistique
- Respect des conventions typographiques francophones
- Meilleure lisibilité

### **Règle typographique française**
En français, les guillemets sont **toujours** entourés d'espaces insécables :
- Format HTML : `&laquo;&nbsp;texte&nbsp;&raquo;`
- Rendu visuel : «&nbsp;texte&nbsp;»

---

## ✅ Guillemets CORRECTS

### **Guillemets français («&nbsp;...&nbsp;»)**
```html
<!-- ✅ CORRECT -->
<p>Le mode «&nbsp;Assisté&nbsp;» utilise des données de démonstration.</p>
<h2>Section «&nbsp;Matériel pédagogique&nbsp;»</h2>
<button title="Ouvrir la section «&nbsp;Aide&nbsp;»">?</button>
```

```javascript
// ✅ CORRECT
const message = 'Le fichier «\u00A0exemple.json\u00A0» a été importé.';
const titre = `Section «\u00A0${nomSection}\u00A0»`;
```

---

## ❌ Guillemets INCORRECTS

### **Guillemets anglais (" ")**
```html
<!-- ❌ INCORRECT -->
<p>Le mode "Assisté" utilise des données de démonstration.</p>
<h2>Section "Matériel pédagogique"</h2>
```

### **Guillemets simples (' ')**
```html
<!-- ❌ INCORRECT -->
<p>Le mode 'Assisté' utilise des données de démonstration.</p>
```

### **Guillemets français SANS espaces**
```html
<!-- ❌ INCORRECT - Manque les espaces insécables -->
<p>Le mode «Assisté» utilise des données de démonstration.</p>
```

### **Apostrophes droites**
```html
<!-- ❌ INCORRECT -->
<p>L'application n'utilise pas d'emojis.</p>

<!-- ✅ CORRECT -->
<p>L'application n'utilise pas d'emojis.</p>
```

---

## 🔍 Patterns de recherche

### **Pattern 1 : Guillemets anglais doubles**
```regex
Chercher: "([^"]+)"
Remplacer: «\u00A0$1\u00A0»

OU en HTML :
Chercher: "([^"]+)"
Remplacer: &laquo;&nbsp;$1&nbsp;&raquo;
```

### **Pattern 2 : Guillemets simples (contexte)**
```regex
Chercher: '([^']{3,})'
# Examiner chaque cas individuellement
# Remplacer seulement si c'est une citation, pas du code JavaScript
```

### **Pattern 3 : Guillemets français sans espaces**
```regex
Chercher: «([^»]+)»
Remplacer: «\u00A0$1\u00A0»

OU en HTML :
Chercher: «([^»]+)»
Remplacer: &laquo;&nbsp;$1&nbsp;&raquo;
```

---

## 📁 Fichiers à auditer

### **Priorité 1 - Fichiers HTML**
- [ ] `index.html` (tous les index XX.html)
  - Titres et sous-titres
  - Textes visibles
  - Attributs title, placeholder, aria-label

### **Priorité 2 - JavaScript - Textes d'interface**
- [ ] `primo-accueil.js`
  - Messages de bienvenue
  - Textes des parcours guidés

- [ ] `primo-modal.js`
  - Questions et explications
  - Textes d'aide

- [ ] `navigation.js`
  - Labels de navigation
  - Tooltips

- [ ] `config.js`
  - Messages système
  - Textes de configuration

### **Priorité 3 - JavaScript - Modules fonctionnels**
- [ ] `productions.js`
  - Textes des formulaires
  - Messages de confirmation

- [ ] `grilles.js`
  - Labels et descriptions

- [ ] `echelles.js`
  - Noms des niveaux
  - Descriptions

- [ ] `cartouches.js`
  - Textes de rétroaction
  - Messages

- [ ] `objectifs.js`
  - Descriptions d'objectifs
  - Textes d'aide

- [ ] `liste-evaluations.js`
  - En-têtes de colonnes
  - Messages de statut

- [ ] `profil-etudiant.js`
  - Titres de sections
  - Messages informatifs

### **Priorité 4 - Notifications et alertes**
- [ ] Tous les fichiers contenant :
  - `alert()`
  - `confirm()`
  - `afficherNotification()`
  - `afficherNotificationSucces()`
  - `afficherNotificationErreur()`

---

## ⚠️ CAS PARTICULIERS

### **1. Code JavaScript (guillemets simples/doubles)**
**NE PAS MODIFIER** les guillemets qui délimitent des chaînes de caractères :
```javascript
// ✅ NE PAS TOUCHER - Délimiteurs de chaînes
const variable = "valeur";
const objet = { cle: 'valeur' };
```

**MODIFIER** les guillemets à l'intérieur des chaînes :
```javascript
// ❌ AVANT
const message = "Le mode "Assisté" est actif";

// ✅ APRÈS
const message = "Le mode «\u00A0Assisté\u00A0» est actif";
```

### **2. Attributs HTML**
```html
<!-- ❌ AVANT -->
<input type="text" placeholder="Entrez le nom de l'étudiant">
<button title="Ouvrir la section "Aide"">?</button>

<!-- ✅ APRÈS -->
<input type="text" placeholder="Entrez le nom de l'étudiant">
<button title="Ouvrir la section «&nbsp;Aide&nbsp;»">?</button>
```

### **3. JSON / données structurées**
**NE PAS MODIFIER** les guillemets dans les structures de données :
```json
{
  "nom": "Production 1",
  "description": "Analyse littéraire"
}
```

---

## 🔤 Codes de caractères

### **HTML**
```html
« = &laquo;
» = &raquo;
  (espace insécable) = &nbsp;

Guillemet complet : &laquo;&nbsp;texte&nbsp;&raquo;
```

### **JavaScript**
```javascript
« = \u00AB
» = \u00BB
  (espace insécable) = \u00A0

Guillemet complet : '\u00AB\u00A0texte\u00A0\u00BB'
```

### **Raccourcis clavier (Mac)**
```
« = Option + \
» = Option + Shift + \
  (espace insécable) = Option + Espace
```

### **Raccourcis clavier (Windows)**
```
« = Alt + 0171
» = Alt + 0187
  (espace insécable) = Alt + 0160
```

---

## ✅ Exemples de corrections

### **Exemple 1 : HTML - Texte visible**
```html
<!-- ❌ AVANT -->
<h2>Section "Matériel pédagogique"</h2>
<p>Le mode "Assisté" permet de tester l'application.</p>
<p>L'onglet "Productions étudiantes" affiche la liste.</p>

<!-- ✅ APRÈS -->
<h2>Section «&nbsp;Matériel pédagogique&nbsp;»</h2>
<p>Le mode «&nbsp;Assisté&nbsp;» permet de tester l'application.</p>
<p>L'onglet «&nbsp;Productions étudiantes&nbsp;» affiche la liste.</p>
```

### **Exemple 2 : JavaScript - Messages**
```javascript
// ❌ AVANT
afficherNotificationSucces('Fichier "donnees.json" importé avec succès');
alert('La section "Aide" n\'est pas disponible');
const titre = `Ouvrir "${nomFichier}"`;

// ✅ APRÈS
afficherNotificationSucces('Fichier «\u00A0donnees.json\u00A0» importé avec succès');
alert('La section «\u00A0Aide\u00A0» n\'est pas disponible');
const titre = `Ouvrir «\u00A0${nomFichier}\u00A0»`;
```

### **Exemple 3 : HTML - Attributs**
```html
<!-- ❌ AVANT -->
<button title='Ouvrir "Primo"'>Assistant</button>
<input placeholder="Nom de la "production"">

<!-- ✅ APRÈS -->
<button title="Ouvrir «&nbsp;Primo&nbsp;»">Assistant</button>
<input placeholder="Nom de la «&nbsp;production&nbsp;»">
```

### **Exemple 4 : Commentaires**
```javascript
// ❌ AVANT
// Fonction pour ouvrir le modal "Bibliothèque"
/* Section "Matériel pédagogique" */

// ✅ APRÈS
// Fonction pour ouvrir le modal «Bibliothèque»
/* Section «Matériel pédagogique» */
```

---

## 🧪 Tests de validation

### **Test 1 : Recherche globale guillemets anglais**
```bash
# Dans VS Code : Cmd/Ctrl + Shift + F
Chercher : "[^"]+"
Filtres : *.html, *.js (exclure *.json)
```
**Résultat attendu :** Uniquement délimiteurs de chaînes JavaScript, pas de citations

### **Test 2 : Recherche guillemets français sans espaces**
```bash
Chercher : «[^»]+»
```
**Résultat attendu :** Aucune occurrence

### **Test 3 : Vérification visuelle**
1. Ouvrir l'application
2. Parcourir toutes les sections
3. Vérifier visuellement que tous les textes utilisent «&nbsp;...&nbsp;»

### **Test 4 : Copier-coller test**
1. Sélectionner un texte avec guillemets dans l'interface
2. Le copier dans un éditeur
3. Vérifier que les espaces insécables sont présents

---

## 📊 Checklist de progression

### **Phase 1 : Préparation**
- [ ] Recherche globale des guillemets effectuée
- [ ] Cas particuliers identifiés (code, JSON, etc.)
- [ ] Stratégie de remplacement définie

### **Phase 2 : Corrections HTML**
- [ ] Tous les index.html corrigés
- [ ] Attributs title/placeholder/aria-label corrigés
- [ ] Commentaires HTML mis à jour

### **Phase 3 : Corrections JavaScript - Interface**
- [ ] Messages de notifications corrigés
- [ ] Alertes et confirmations mises à jour
- [ ] Textes d'interface dynamiques corrigés

### **Phase 4 : Corrections JavaScript - Modules**
- [ ] Primo et parcours guidés corrigés
- [ ] Modules matériel pédagogique mis à jour
- [ ] Modules évaluation corrigés

### **Phase 5 : Vérification**
- [ ] Recherche "..." retourne 0 (hors code)
- [ ] Recherche '...' vérifiée (cas par cas)
- [ ] Recherche «...» (sans espaces) retourne 0
- [ ] Tests visuels validés

### **Phase 6 : Validation finale**
- [ ] Aucune régression fonctionnelle
- [ ] Copier-coller test validé
- [ ] Application complète revue

---

## 🚀 Commit recommandé

```bash
git add .
git commit -m "fix(typo): [AUDIT_03] Remplacer guillemets anglais par guillemets français

- Remplacement systématique \" \" par «\u00A0...\u00A0»
- Ajout espaces insécables dans tous les guillemets français
- Correction dans HTML, JavaScript (textes interface, messages, alertes)
- Respect des conventions typographiques françaises

Fichiers modifiés : [liste]
Closes #XX"
```

---

## 📝 Notes complémentaires

### **Ordre de priorité des corrections**
1. Textes visibles par l'utilisateur (interface)
2. Messages système et notifications
3. Commentaires de code (moins critique)

### **Outils utiles**
- Extension VS Code "French Quotes" pour faciliter la saisie
- Script de remplacement automatique (avec prudence)

### **Documentation**
- Ajouter cette règle dans le guide de contribution
- Former les collaborateurs sur cette convention

---

**Statut :** ⬜ À faire  
**Dernière mise à jour :** 1er janvier 2026
