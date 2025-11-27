# Beta 91.5 - Correctifs et améliorations

**Version** : Beta 91.5
**Date** : 27 novembre 2025
**Auteur** : Grégoire Bédard
**Statut** : Stable - Prêt pour distribution

---

## 🎯 Objectif de cette version

Cette version corrige les bugs critiques découverts dans Beta 91.2 et améliore la stabilité générale de l'application. Tous les bugs empêchant l'utilisation normale de l'application ont été résolus.

---

## 🐛 Bugs corrigés

### Bug #1 : Ancienne interface du tableau de bord
**Symptôme** : Le tableau de bord affichait l'ancienne interface avec des cartes séparées pour SOM/PAN au lieu des barres de distribution modernes.

**Cause** : Ancien HTML statique (48 lignes) encore présent dans le fichier, empêchant l'affichage du contenu dynamique généré par JavaScript.

**Correction** :
- Suppression de l'ancien HTML statique (lignes 2807-2855)
- Remplacement par un commentaire indiquant la génération dynamique
- Fichier modifié : `index 91.5.html`

---

### Bug #2 : Carte "Indicateurs globaux" vide
**Symptôme** : La carte "Indicateurs globaux du groupe" s'affichait vide sans barres de distribution.

**Cause** : Erreur de manipulation DOM - le code sauvegardait des références à des éléments DOM, vidait le conteneur avec `innerHTML = ''` (détruisant ces éléments), puis tentait de les réinsérer avec `appendChild()`.

**Correction** :
- Sauvegarde de `outerHTML` (chaînes de caractères) au lieu de références DOM
- Reconstruction avec ces chaînes après vidage du conteneur
- Fichier modifié : `js/tableau-bord-apercu.js` (lignes 868-879)

---

### Bug #3 : Erreur JavaScript "Cannot access uninitialized variable"
**Symptôme** : Erreur JavaScript bloquant le chargement de l'application.
```
ReferenceError: Cannot access uninitialized variable.
    (fonction anonyme) (portfolio.js:635)
```

**Cause** : Temporal Dead Zone - La variable `modalites` était utilisée à la ligne 639 mais déclarée seulement à la ligne 664.

**Correction** :
- Déplacement de `const modalites = db.getSync('modalitesEvaluation', {})` au début du forEach (ligne 620)
- Suppression de la déclaration dupliquée ligne 664
- Fichier modifié : `js/portfolio.js`
- Cache buster : `v=2025112701`

---

### Bug #4 : Barres SRPNF affichant "NaN%"
**Symptôme** : Les barres SRPNF dans le profil étudiant affichaient "NaN%" pour tous les critères.

**Cause** : Validation incomplète des scores. Le code vérifiait `score === null` mais pas `score === undefined`, causant `Math.round(undefined * 100)` → `NaN`.

**Corrections** :
1. Validation stricte : `if (typeof score !== 'number' || isNaN(score)) return ''`
2. Vérification pour mode comparatif : `if (pourcentageSOM === null && pourcentagePAN === null) return ''`
3. Ajout de messages informatifs :
   - Si grille non configurée : "Configuration requise" avec instructions
   - Si pas de données : "Aucune donnée disponible"
- Fichier modifié : `js/profil-etudiant.js` (lignes 6365-6493)
- Cache busters : `v=2025112702`, `v=2025112703`

---

### Bug #5 : Sélecteur de grille de référence vide
**Symptôme** : Le sélecteur de grille dans Réglages → Pratique de notation restait vide malgré la présence de grilles créées.

**Cause** : Problème de timing - `chargerGrillesDisponibles()` était appelé avant la synchronisation complète des données IndexedDB vers localStorage.

**Correction** :
- Ajout d'un écouteur d'événement `db-ready` qui recharge les grilles après synchronisation
- Les grilles sont maintenant chargées au bon moment
- Fichier modifié : `js/pratiques.js` (lignes 101-105)
- Cache buster : `v=2025112704`

---

### Bug #6 : Erreur SyntaxError dans pratique-configurable.js
**Symptôme** : `SyntaxError: Cannot destructure to a parameter name 'eval' in strict mode.`

**Cause** : Utilisation du mot réservé `eval` comme nom de paramètre dans une fonction fléchée (ligne 118).

**Correction** :
- Renommage du paramètre `eval` → `evaluation`
- Fichier modifié : `js/pratiques/pratique-configurable.js` (ligne 118)
- Cache buster : `v=2025112705`

---

## ✨ Améliorations

### Interface utilisateur
- Messages informatifs clairs quand la grille de référence n'est pas configurée
- Messages informatifs quand il n'y a pas encore de données d'évaluation
- Meilleure expérience utilisateur avec des instructions précises

### Robustesse
- Validation stricte des données numériques avant affichage
- Gestion appropriée des cas `null` et `undefined`
- Rechargement automatique des grilles après synchronisation IndexedDB

---

## 📁 Fichiers modifiés

### HTML
- `index 91.5.html` - Titre, date, suppression ancien HTML, cache busters

### JavaScript
- `js/tableau-bord-apercu.js` - Correction manipulation DOM
- `js/portfolio.js` (v=2025112701) - Correction Temporal Dead Zone
- `js/profil-etudiant.js` (v=2025112703) - Validation scores + messages informatifs
- `js/pratiques.js` (v=2025112704) - Écouteur db-ready pour grilles
- `js/pratiques/pratique-configurable.js` (v=2025112705) - Renommage paramètre

---

## 🧪 Tests effectués

### Navigateurs testés
- ✅ Safari (macOS) - Navigateur principal
- ✅ Chrome - Recommandé pour utilisateurs

### Fonctionnalités vérifiées
- ✅ Tableau de bord : Barres de distribution A-C-P-E affichées
- ✅ Profil étudiant : Barres SRPNF avec moyennes calculées
- ✅ Sélecteur de grille : 3 grilles disponibles et sélectionnables
- ✅ Import/export : Données de démo importables sans erreur
- ✅ Console : Aucune erreur JavaScript critique

### Scénarios utilisateur testés
1. ✅ Configuration de la grille de référence
2. ✅ Consultation des profils étudiants avec données réelles
3. ✅ Navigation entre sections
4. ✅ Affichage des indicateurs globaux

---

## 🚀 Migration depuis Beta 91.2

### Compatibilité
- ✅ **Totalement compatible** avec les données de Beta 91.2
- ✅ Aucune perte de données
- ✅ Aucune action requise de l'utilisateur

### Étapes de migration
1. Télécharger Beta 91.5
2. Ouvrir `index 91.5.html` dans votre navigateur
3. Vos données existantes seront automatiquement chargées depuis IndexedDB
4. **Important** : Configurer la grille de référence dans Réglages → Pratique de notation

---

## 📋 Nouvelles configurations requises

### Grille de référence pour le dépistage
Après la mise à jour, vous devez configurer une grille de référence :

1. Allez dans **Réglages → Pratique de notation**
2. Scrollez jusqu'à **"Grille de critères pour le dépistage"**
3. Sélectionnez votre grille principale (ex: "Grille SRPNF")
4. Cliquez sur **"Sauvegarder les modalités"**

**Pourquoi ?** Cette configuration permet au système de calculer les moyennes par critère (Structure, Rigueur, Plausibilité, Nuance, Français) et d'afficher les barres SRPNF dans les profils étudiants.

**Quelle grille choisir ?** Si vous utilisez plusieurs grilles (avec/sans français, holistique/algorithmique), choisissez votre grille la plus complète. Le système s'adaptera automatiquement aux évaluations qui utilisent d'autres grilles.

---

## 📞 Support

**Email** : labo@codexnumeris.org
**Site** : https://codexnumeris.org
**Licence** : Creative Commons BY-NC-SA 4.0

---

## 🙏 Remerciements

Merci à la communauté d'enseignant·es testeurs pour les retours qui ont permis d'identifier et corriger ces bugs rapidement.

---

**Version suivante prévue** : Beta 92 (Pratiques configurables et wizard)
