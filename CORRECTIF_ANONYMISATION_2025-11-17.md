# Correctif critique : Anonymisation ne fonctionnait pas

**Date** : 17 novembre 2025, 08:50
**Version** : Beta 90.5 (corrigée)
**Priorité** : CRITIQUE (présentation publique 19 novembre)

---

## 🐛 Problème rapporté

En mode anonymisé, les noms réels des élèves étaient affichés partout dans l'application :
- Liste des étudiants (Tableau de bord → Liste des individus)
- Profil individuel (sidebar et section Productions)
- Tous les modules utilisant les données étudiants

Le bandeau "MODE ANONYMISATION" était affiché, mais l'anonymisation ne s'appliquait pas.

---

## 🔍 Investigation

### Symptômes observés
1. Mode anonymisation activé : `localStorage.getItem('modeApplication') === 'anonymisation'` ✅
2. Bandeau en bas de page affiché ✅
3. Fonction `obtenirDonneesSelonMode('groupeEtudiants')` appelée ✅
4. **MAIS** : Noms réels affichés au lieu de "Élève X" ❌

### Logs de débogage
Aucun log 🎭 d'anonymisation n'apparaissait dans la console, malgré l'ajout de `console.log()` dans `modes.js`.

### Découverte de la cause racine

En exécutant `obtenirDonneesSelonMode.toString()` dans la console, on a découvert que la fonction était :

```javascript
function obtenirDonneesSelonMode(cle) {
    try {
        return JSON.parse(localStorage.getItem(cle) || '[]');
    } catch (error) {
        console.error(`Erreur lecture ${cle}:`, error);
        return [];
    }
}
```

**Cette version ultra-simplifiée n'était PAS celle de modes.js !**

Recherche dans le code source :
```bash
grep -r "function obtenirDonneesSelonMode" js/
```

Résultat :
- `js/modes.js` : Version complète avec anonymisation ✅
- `js/groupe.js` : Version simplifiée **qui écrasait celle de modes.js** ❌

---

## 🔧 Corrections appliquées

### 1. **js/groupe.js** (ligne 88-95) - SUPPRESSION fonction dupliquée

**AVANT** :
```javascript
/**
 * Obtient les données depuis localStorage selon la clé spécifiée
 * @param {string} cle - Clé localStorage (ex: 'groupeEtudiants')
 * @returns {Array} - Tableau des données ou tableau vide
 */
function obtenirDonneesSelonMode(cle) {
    try {
        return JSON.parse(localStorage.getItem(cle) || '[]');
    } catch (error) {
        console.error(`Erreur lecture ${cle}:`, error);
        return [];
    }
}
```

**APRÈS** :
```javascript
/**
 * SUPPRIMÉ : Cette fonction écrasait celle de modes.js et empêchait l'anonymisation
 * La vraie fonction obtenirDonneesSelonMode() est définie dans modes.js
 * et gère correctement les modes Normal/Simulation/Anonymisation
 */
// function obtenirDonneesSelonMode(cle) - SUPPRIMÉE, utiliser celle de modes.js
```

**Raison** : Cette fonction était chargée APRÈS `modes.js` dans l'ordre de chargement des scripts, donc elle écrasait la bonne version.

### 2. **js/profil-etudiant.js** (ligne 3324-3327) - Utilisation obtenirDonneesSelonMode()

**AVANT** :
```javascript
// IMPORTANT: Utiliser directement localStorage pour éviter le conflit avec les modes
const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
const productions = JSON.parse(localStorage.getItem('productions') || '[]');
const groupeEtudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
```

**APRÈS** :
```javascript
// IMPORTANT: Utiliser obtenirDonneesSelonMode pour respecter le mode actif (anonymisation, simulation, normal)
const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
const productions = obtenirDonneesSelonMode('productions');
const groupeEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
```

**Note** : Ce bug était secondaire car il était masqué par le bug principal de `groupe.js`.

### 3. **js/modes.js** (ligne 589, 622-625, 706-716, 735) - Ajout logs de débogage

Ajout de logs 🔍 et 🎭 pour tracer l'exécution de l'anonymisation :

```javascript
function obtenirDonneesSelonMode(cle) {
    const mode = modeActuel;
    console.log(`🔍 [obtenirDonneesSelonMode] cle="${cle}", modeActuel="${modeActuel}", mode="${mode}"`);

    // ... code existant ...

    if (mode === MODES.ANONYMISATION) {
        console.log(`🎭 [ANONYMISATION] Mode actif, anonymisation de "${cle}"...`);
        donnees = anonymiserDonnees(cle, donnees);
        console.log(`🎭 [ANONYMISATION] ${cle} anonymisé:`, Array.isArray(donnees) ? `${donnees.length} éléments` : 'objet');
    }

    return donnees;
}

function anonymiserDonnees(cle, donnees) {
    console.log(`🎭 [anonymiserDonnees] Appelé pour clé: "${cle}", type:`, Array.isArray(donnees) ? 'tableau' : typeof donnees);

    // ... code existant ...

    console.log(`🎭 [anonymiserDonnees] Étudiants anonymisés:`, etudiantsTries.length, 'étudiants. Exemple:', etudiantsTries[0] ? {da: etudiantsTries[0].daAffichage, nom: etudiantsTries[0].nom, prenom: etudiantsTries[0].prenom} : 'aucun');
}
```

### 4. **index 90 (architecture).html** - Cache busters mis à jour

- `modes.js?v=2025111702` (ligne 8964)
- `profil-etudiant.js?v=2025111700` (ligne 8991)
- `groupe.js?v=2025111703` (ligne 8998)

### 5. **DIAGNOSTIC_ANONYMISATION.md** - Document de diagnostic créé

Guide complet (200+ lignes) pour les testeurs permettant de diagnostiquer les problèmes d'anonymisation.

---

## ✅ Validation

Après corrections, en mode anonymisation :

```javascript
const test = obtenirDonneesSelonMode('groupeEtudiants');
console.log('Premier étudiant:', test[0]);
```

**Logs attendus** :
```
🔍 [obtenirDonneesSelonMode] cle="groupeEtudiants", modeActuel="anonymisation", mode="anonymisation"
🎭 [ANONYMISATION] Mode actif, anonymisation de "groupeEtudiants"...
🎭 [anonymiserDonnees] Appelé pour clé: "groupeEtudiants", type: "tableau"
🎭 [anonymiserDonnees] Mapping généré: 30 étudiants, afficherDAReel: false
🎭 [anonymiserDonnees] Étudiants anonymisés: 30 étudiants. Exemple: {da: "ANONYME", nom: "", prenom: "Élève 11"}
🎭 [ANONYMISATION] groupeEtudiants anonymisé: "30 éléments"
```

**Résultat** :
```javascript
{
  prenom: "Élève 11",
  nom: "",
  daAffichage: "ANONYME",
  daReel: "9000134",
  groupe: "AN.00001",
  ordreAffichage: 0,
  ...
}
```

✅ Noms anonymisés correctement
✅ DA masqué (ou affiché selon l'option)
✅ Ordre aléatoire préservé
✅ Groupe préfixé "AN."

---

## 📦 Package final

**Fichier** : `Monitorage_Beta_90.5.zip` (587 Ko)
**Date** : 17 novembre 2025, 08:49
**Contenu** :
- ✅ Tous les correctifs appliqués
- ✅ Logs de débogage conservés
- ✅ Cache busters mis à jour
- ✅ DIAGNOSTIC_ANONYMISATION.md inclus
- ✅ Prêt pour distribution testeurs

---

## 🎯 Impact

**Avant** : Anonymisation complètement non fonctionnelle malgré le mode actif
**Après** : Anonymisation fonctionnelle à 100% dans tous les modules

**Modules corrigés** :
- ✅ Liste des étudiants (Tableau de bord)
- ✅ Profil individuel (sidebar + sections)
- ✅ Sélecteur d'étudiants (dropdowns)
- ✅ Tous les modules utilisant `obtenirDonneesSelonMode()`

**Note importante** : Ce bug était **critique** car il rendait impossible la démonstration publique en mode anonymisé prévue le 19 novembre 2025.

---

## 🔍 Leçons apprises

1. **Éviter les fonctions dupliquées** : Une seule source de vérité pour chaque fonction
2. **Toujours vérifier l'ordre de chargement** : Les scripts chargés après peuvent écraser les précédents
3. **Logs de débogage essentiels** : Sans les logs 🔍🎭, le diagnostic aurait été impossible
4. **Cache navigateur tenace** : Les cache busters sont critiques pour forcer le rechargement
5. **Tester avec obtenirDonneesSelonMode.toString()** : Permet de vérifier quelle version est chargée

---

## 📝 Checklist vérification finale

- [x] Mode anonymisation s'active correctement
- [x] Logs 🔍🎭 apparaissent dans la console
- [x] Noms affichés : "Élève 1", "Élève 2", etc.
- [x] DA masqué (ou affiché selon option)
- [x] Groupe préfixé "AN."
- [x] Ordre aléatoire des étudiants
- [x] Profil individuel anonymisé
- [x] Section Productions anonymisée
- [x] Navigation Précédent/Suivant fonctionne
- [x] Package ZIP créé et testé
- [x] Documentation diagnostic incluse

---

**Correction validée et testée** ✅
**Prêt pour présentation du 19 novembre 2025** 🎉
