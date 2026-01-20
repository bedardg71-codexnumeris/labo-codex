# AUDIT 01 : Modes d'affichage
**Priorité :** 🔴 CRITIQUE  
**Durée estimée :** 45 minutes  
**Fichiers concernés :** ~10 fichiers

---

## 🎯 Objectif

Renommer **toutes** les références à "Simulation" par "Assisté" pour refléter la nouvelle terminologie du mode d'affichage avec données de démonstration.

---

## 📋 Contexte

L'application possède 3 modes d'affichage :
1. **Mode Normal** : Données réelles (bleu)
2. **Mode Assisté** : Données de démonstration (sarcelle) - **ANCIENNEMENT "Simulation"**
3. **Mode Anonymisation** : Protection des données (gris-bleu)

Le mode "Simulation" a été renommé "Assisté" mais de nombreuses références obsolètes subsistent dans le code.

---

## 🔍 Patterns à rechercher

### **Pattern 1 : Attributs HTML**
```regex
Chercher: data-mode="simulation"
Remplacer: data-mode="assisté"

Chercher: \[data-mode="simulation"\]
Remplacer: [data-mode="assisté"]
```

### **Pattern 2 : Texte visible**
```regex
Chercher: Mode Simulation
Remplacer: Mode Assisté

Chercher: mode Simulation
Remplacer: mode Assisté

Chercher: mode simulation
Remplacer: mode assisté
```

### **Pattern 3 : Variables JavaScript**
```regex
Chercher: modeSimulation
Remplacer: modeAssisté

Chercher: 'simulation'
Remplacer: 'assisté'

Chercher: "simulation"
Remplacer: "assisté"
```

### **Pattern 4 : Commentaires CSS**
```regex
Chercher: Mode Simulation
Remplacer: Mode Assisté

Chercher: /\* Simulation
Remplacer: /* Assisté
```

---

## 📁 Fichiers à auditer

### **Priorité 1 - CSS**
- [ ] `styles.css`
  - Lignes 166-191 : Conversion variables mode
  - Commentaires avec "Simulation"
  - Classes `.mode-simulation` (si présentes)

### **Priorité 2 - JavaScript core**
- [ ] `config.js`
  - Variable `modeApplication`
  - Fonctions de détection du mode
  - Textes d'interface

- [ ] `primo-accueil.js`
  - Initialisation mode assisté
  - Textes du modal Primo
  - Variables de configuration

- [ ] `primo-modal.js`
  - Références au mode dans les questions
  - Textes d'explication

### **Priorité 3 - Modules interface**
- [ ] `navigation.js`
  - Labels des boutons de mode
  - Gestion du switch entre modes

- [ ] `tableau-bord-apercu.js`
  - Détection du mode actif
  - Affichage conditionnel

- [ ] `liste-evaluations.js`
  - Comportement selon le mode

- [ ] `profil-etudiant.js`
  - Affichage adapté au mode

### **Priorité 4 - HTML**
- [ ] `index.html` (tous les index XX.html)
  - Attributs data-mode
  - Textes visibles
  - Commentaires HTML

---

## ✅ Exemples de corrections

### **Exemple 1 : CSS**
```css
/* ❌ AVANT */
[data-mode="simulation"] {
    --bleu-principal: var(--sarcelle-principal);
}

/* Mode Simulation - Sarcelle/vert */
body[data-mode="simulation"] .entete {
    background: linear-gradient(135deg, #1a5266 0%, #0d3540 100%);
}

/* ✅ APRÈS */
[data-mode="assisté"] {
    --bleu-principal: var(--sarcelle-principal);
}

/* Mode Assisté - Sarcelle/vert */
body[data-mode="assisté"] .entete {
    background: linear-gradient(135deg, #1a5266 0%, #0d3540 100%);
}
```

### **Exemple 2 : JavaScript**
```javascript
// ❌ AVANT
const modeApplication = localStorage.getItem('modeApplication') || 'simulation';

if (modeApplication === 'simulation') {
    chargerDonneesDemo();
}

// Texte interface
const labelMode = 'Mode Simulation';

// ✅ APRÈS
const modeApplication = localStorage.getItem('modeApplication') || 'assisté';

if (modeApplication === 'assisté') {
    chargerDonneesDemo();
}

// Texte interface
const labelMode = 'Mode Assisté';
```

### **Exemple 3 : HTML**
```html
<!-- ❌ AVANT -->
<body data-mode="simulation">
    <button onclick="activerModeSimulation()">Mode Simulation</button>
</body>

<!-- ✅ APRÈS -->
<body data-mode="assisté">
    <button onclick="activerModeAssisté()">Mode Assisté</button>
</body>
```

---

## ⚠️ Points d'attention

### **Variables localStorage**
Si des données sont stockées avec la clé `'simulation'`, prévoir une migration :
```javascript
// Migration automatique
if (localStorage.getItem('modeApplication') === 'simulation') {
    localStorage.setItem('modeApplication', 'assisté');
}
```

### **Noms de fonctions**
Renommer systématiquement :
- `activerModeSimulation()` → `activerModeAssisté()`
- `estModeSimulation()` → `estModeAssisté()`
- `basculerVersSimulation()` → `basculerVersAssisté()`

### **Commentaires de code**
Ne pas oublier les commentaires :
```javascript
// ❌ AVANT : Initialisation mode simulation
// ✅ APRÈS : Initialisation mode assisté
```

---

## 🧪 Tests de validation

### **Test 1 : Recherche exhaustive**
```bash
# Dans le terminal, depuis la racine du projet
grep -r "simulation" --include="*.js" --include="*.css" --include="*.html"
```
**Résultat attendu :** Aucune occurrence (ou seulement dans les fichiers de documentation)

### **Test 2 : Vérification visuelle**
1. Ouvrir l'application en mode Normal
2. Basculer vers le mode Assisté
3. Vérifier que tous les textes affichent "Assisté" (pas "Simulation")
4. Inspecter l'élément `<body>` : doit avoir `data-mode="assisté"`

### **Test 3 : localStorage**
```javascript
// Console navigateur
console.log(localStorage.getItem('modeApplication'));
// Doit afficher : "assisté" (pas "simulation")
```

### **Test 4 : Styles CSS**
1. En mode Assisté, inspecter un élément coloré
2. Vérifier dans DevTools que les variables sarcelle sont appliquées
3. Confirmer qu'aucune classe `.simulation` n'est présente

---

## 📊 Checklist de progression

### **Phase 1 : Recherche**
- [ ] Recherche globale "simulation" effectuée
- [ ] Liste complète des occurrences documentée
- [ ] Fichiers prioritaires identifiés

### **Phase 2 : Corrections CSS**
- [ ] `styles.css` corrigé et testé
- [ ] Aucune occurrence "simulation" dans les CSS

### **Phase 3 : Corrections JavaScript**
- [ ] Variables renommées
- [ ] Fonctions renommées
- [ ] Textes d'interface corrigés
- [ ] Migration localStorage implémentée (si nécessaire)

### **Phase 4 : Corrections HTML**
- [ ] Attributs data-mode corrigés
- [ ] Textes visibles mis à jour
- [ ] Commentaires HTML nettoyés

### **Phase 5 : Validation**
- [ ] Tests de recherche passés (0 occurrence)
- [ ] Tests visuels validés
- [ ] Tests fonctionnels OK (basculement entre modes)
- [ ] Aucune régression détectée

---

## 🚀 Commit recommandé

```bash
git add .
git commit -m "fix(design): [AUDIT_01] Renommer 'Simulation' → 'Assisté' dans toute l'application

- Correction data-mode='simulation' → 'assisté'
- Renommage variables et fonctions JavaScript
- Mise à jour textes interface et commentaires
- Migration localStorage automatique

Fichiers modifiés : styles.css, config.js, primo-*.js, navigation.js, index.html
Closes #XX"
```

---

## 📝 Notes complémentaires

- Cette correction est **rétroactive** : les utilisateurs ayant `'simulation'` en localStorage doivent être migrés automatiquement
- Conserver la palette sarcelle (couleurs inchangées)
- Le comportement du mode reste identique, seul le nom change
- Documenter cette migration dans le CHANGELOG

---

**Statut :** ⬜ À faire  
**Dernière mise à jour :** 1er janvier 2026
