# Diagnostic du système d'anonymisation

**Date** : 17 novembre 2025
**Version** : Beta 90.5
**Problème rapporté** : Les noms réels des élèves sont affichés en mode anonymisé

---

## 🔍 Tests de diagnostic

### Étape 1 : Vérifier que les données de démonstration sont chargées

1. Ouvrir `index 90 (architecture).html` dans Safari ou Chrome
2. Ouvrir la console du navigateur (⌥⌘J sur Mac, F12 sur Windows)
3. Taper cette commande dans la console :

```javascript
JSON.parse(localStorage.getItem('groupeEtudiants') || '[]').length
```

**Résultat attendu** : Un nombre supérieur à 0 (ex: 30 étudiants)
**Si 0** : Aller dans Réglages → Import/Export → Importer `donnees-demo.json`

---

### Étape 2 : Vérifier le mode actuel

Dans la console, taper :

```javascript
localStorage.getItem('modeApplication')
```

**Résultats possibles** :
- `"anonymisation"` ✅ Mode anonymisation actif
- `"normal"` ou `null` ⚠️ Mode normal (pas d'anonymisation)
- `"simulation"` ℹ️ Mode simulation

**Si pas en mode anonymisation** : Utiliser le sélecteur en haut de la page pour choisir "Anonymisé"

---

### Étape 3 : Forcer l'anonymisation et vérifier

Dans la console, taper ces commandes **une à la fois** :

```javascript
// 1. Forcer le mode anonymisation
localStorage.setItem('modeApplication', 'anonymisation');

// 2. Régénérer le mapping
localStorage.removeItem('mapping_anonymisation');

// 3. Recharger la page
location.reload();
```

**Après rechargement**, le sélecteur de mode devrait afficher "Anonymisé"

---

### Étape 4 : Vérifier que l'anonymisation fonctionne

**Test A : Console logs**

Ouvrir la console et chercher ces messages (avec l'icône 🎭) :
```
🎭 Chargement de modes.js...
🎭 DOM prêt, initialisation du système de modes...
✅ Mode actif: Mode Anonymisation
```

**Test B : Vérifier le mapping**

Dans la console, taper :

```javascript
const mapping = JSON.parse(localStorage.getItem('mapping_anonymisation'));
console.log('Mapping anonymisation:', mapping);
console.log('Nombre d\'étudiants mappés:', Object.keys(mapping).length);
console.log('Exemple:', Object.values(mapping)[0]);
```

**Résultat attendu** :
```javascript
{
  nom: "",
  prenom: "Élève 17",  // Numéro aléatoire
  nomComplet: "Élève 17",
  numero: 17,
  ordreAffichage: 5  // Ordre aléatoire
}
```

**Test C : Vérifier les données anonymisées**

Dans la console, taper :

```javascript
// Simuler l'appel de obtenirDonneesSelonMode
const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
console.log('Étudiants AVANT anonymisation:', etudiants.slice(0, 3));
```

Puis recharger la page et aller dans **Réglages → Groupe**. Les noms affichés devraient être "Élève 1", "Élève 2", etc.

---

### Étape 5 : Test avec logs de débogage activés

Les logs de débogage ont été ajoutés à `js/modes.js`. Pour les voir :

1. Ouvrir la console
2. Rafraîchir la page
3. Aller dans **Réglages → Groupe** ou **Étudiants → Liste**
4. Chercher dans la console les messages :

```
🎭 [ANONYMISATION] Mode actif, anonymisation de "groupeEtudiants"...
🎭 [anonymiserDonnees] Appelé pour clé: "groupeEtudiants", type: tableau
🎭 [anonymiserDonnees] Mapping généré: 30 étudiants, afficherDAReel: true
🎭 [anonymiserDonnees] Étudiants anonymisés: 30 étudiants. Exemple: {da: "1234567", nom: "", prenom: "Élève 17"}
🎭 [ANONYMISATION] groupeEtudiants anonymisé: 30 éléments
```

**Si ces messages n'apparaissent PAS** : Le mode anonymisation n'est pas actif

**Si ces messages apparaissent MAIS les noms réels sont affichés** : Il y a un problème dans le code d'affichage

---

### Étape 6 : Vérifier un fichier spécifique (etudiants.js)

Si l'anonymisation fonctionne en console mais pas dans l'interface :

Dans la console, taper :

```javascript
// Vérifier que etudiants.js utilise bien obtenirDonneesSelonMode
console.log('Fonction obtenirDonneesSelonMode existe?', typeof obtenirDonneesSelonMode);

// Simuler l'appel
const etudiantsAnonymes = obtenirDonneesSelonMode('groupeEtudiants');
console.log('Premier étudiant anonymisé:', etudiantsAnonymes[0]);
```

**Résultat attendu** :
```javascript
{
  da: "1234567",
  nom: "",
  prenom: "Élève 17",
  daAffichage: "1234567",  // ou "ANONYME" selon l'option
  groupe: "AN.101",
  ordreAffichage: 5
}
```

---

## 🐛 Scénarios de problèmes identifiés

### Problème 1 : Mode pas activé
**Symptôme** : Pas de bandeau "MODE ANONYMISATION" en bas de page
**Solution** : Utiliser le sélecteur de mode pour choisir "Anonymisé"

### Problème 2 : Mapping pas généré
**Symptôme** : Console affiche "Mapping anonymisation: null"
**Solution** : Recharger la page, le mapping se génère automatiquement

### Problème 3 : Ancien format de mapping
**Symptôme** : Noms fictifs au lieu de "Élève X"
**Solution** : Exécuter dans la console :
```javascript
localStorage.removeItem('mapping_anonymisation');
location.reload();
```

### Problème 4 : Code d'affichage lit directement localStorage
**Symptôme** : Logs montrent anonymisation OK, mais interface affiche noms réels
**Cause** : Un fichier JS lit `localStorage.getItem('groupeEtudiants')` au lieu d'utiliser `obtenirDonneesSelonMode('groupeEtudiants')`
**Solution** : Identifier le fichier fautif et corriger

---

## 📋 Checklist finale

- [ ] Données de démonstration importées (>0 étudiants)
- [ ] Mode anonymisation activé (sélecteur + localStorage)
- [ ] Mapping généré avec format "Élève X"
- [ ] Logs 🎭 visibles dans la console
- [ ] Bandeau "MODE ANONYMISATION" affiché en bas
- [ ] obtenirDonneesSelonMode() retourne données anonymisées
- [ ] Interface affiche "Élève X" au lieu des vrais noms

---

## 🔧 Actions correctives possibles

Si après tous ces tests l'anonymisation ne fonctionne toujours pas :

1. **Vider le cache du navigateur** et recharger
2. **Essayer un autre navigateur** (Safari vs Chrome)
3. **Réimporter les données démo** depuis zéro
4. **Vérifier la version des fichiers** :
   - `js/modes.js` doit contenir les logs 🎭
   - `js/etudiants.js` doit utiliser `obtenirDonneesSelonMode`
   - `index 90 (architecture).html` doit charger `modes.js` en priorité 1

---

## 📞 Rapport de bug

Si le problème persiste, préparer ce rapport :

**Navigateur** : Safari / Chrome / Firefox / Edge (version X.X)
**Système** : macOS / Windows / Linux
**Résultats des tests** :
- Étape 1 : [ ] Réussi / [ ] Échoué
- Étape 2 : [ ] Réussi / [ ] Échoué
- Étape 3 : [ ] Réussi / [ ] Échoué
- Étape 4 : [ ] Réussi / [ ] Échoué
- Étape 5 : [ ] Réussi / [ ] Échoué
- Étape 6 : [ ] Réussi / [ ] Échoué

**Captures d'écran console** : (coller les logs ici)

**Observations** : (décrire ce qui se passe exactement)
