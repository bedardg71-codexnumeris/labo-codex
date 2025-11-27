# Système de monitorage pédagogique - Beta 91.5b

**Version** : Beta 91.5b - Correctif ordre chargement scripts
**Date** : 27 novembre 2025
**Auteur** : Grégoire Bédard
**Licence** : Creative Commons BY-NC-SA 4.0

---

## ⚠️ **IMPORTANT : Correctif critique**

Cette version **Beta 91.5b** corrige un bug bloquant de la version Beta 91.5 initiale :

**Bug corrigé** : `PratiqueConfigurable is not defined`
- Erreur JavaScript empêchant le chargement de l'application
- Ordre de chargement des scripts pratiques corrigé
- **Tous les utilisateurs de Beta 91.5 doivent mettre à jour vers 91.5b**

---

## 🚀 Démarrage rapide

### Étape 1: Ouvrir l'application
```bash
# Double-cliquer sur "index 91.5b.html" ou
open "index 91.5b.html"  # macOS
```

### Étape 2: Configurer la grille de référence (IMPORTANT)
1. Allez dans **Réglages → Pratique de notation**
2. Scrollez jusqu'à **"Grille de critères pour le dépistage"**
3. Sélectionnez votre grille principale
4. Cliquez sur **"Sauvegarder les modalités"**

**Pourquoi ?** Cette configuration permet d'afficher les barres SRPNF dans les profils étudiants.

---

## 🔧 Migration depuis Beta 91.5

Si vous utilisez déjà Beta 91.5 :

1. **Vos données sont conservées** (stockées dans IndexedDB)
2. Remplacez simplement `index 91.5.html` par `index 91.5b.html`
3. Rafraîchissez votre navigateur (Cmd+Shift+R ou Ctrl+Shift+R)
4. **Aucune perte de données**

---

## ✨ Fonctionnalités Beta 91.5 (rappel)

### Bugs corrigés (version initiale)
1. ✅ Ancienne interface du tableau de bord (cartes séparées)
2. ✅ Carte "Indicateurs globaux" vide
3. ✅ Erreur JavaScript "Cannot access uninitialized variable"
4. ✅ Barres SRPNF affichant "NaN%"
5. ✅ Sélecteur de grille de référence vide
6. ✅ Erreur SyntaxError dans pratique-configurable.js

### Bugs corrigés (Beta 91.5b)
7. ✅ Ordre chargement scripts (PratiqueConfigurable is not defined)
8. ✅ Page blanche dans Microsoft Edge (CSS externe manquant)

### Nouvelles fonctionnalités
- ✅ Wizard Primo : Création de pratiques personnalisées en 8 étapes
- ✅ 7 pratiques prédéfinies prêtes à l'emploi
- ✅ Système multi-objectifs d'apprentissage
- ✅ Import/export enrichi avec métadonnées CC BY-NC-SA 4.0
- ✅ Architecture IndexedDB pour stockage étendu

---

## 📁 Structure du package

```
Beta_91.5b_Correctif/
├── index 91.5b.html         # Point d'entrée de l'application (CORRIGÉ)
├── logo-codex-numeris.png   # Logo Codex Numeris
├── js/                      # Code JavaScript (41 modules)
│   ├── pratiques/           # Système de pratiques configurables
│   │   ├── pratique-configurable.js
│   │   ├── pratique-registre.js  (ordre chargement corrigé)
│   │   ├── pratiques-predefines.js
│   │   └── ...
│   └── ...
├── css/                     # Feuilles de style (si présentes)
├── BETA_91.5b_CHANGELOG.md  # Notes de version avec détails bug
├── LICENSE.md               # Licence CC BY-NC-SA 4.0
└── README.md                # Ce fichier
```

---

## 🔍 Vérification du correctif

### Tests rapides
1. Ouvrir `index 91.5b.html` dans **Safari, Chrome, Firefox ou Edge**
2. Ouvrir la console JavaScript (Cmd+Option+C)
3. **Vérifier** : Aucune erreur "PratiqueConfigurable is not defined"
4. **Vérifier** : Messages de chargement pratiques affichés
5. Naviguer vers **Réglages → Pratique de notation → Pratiques configurables**
6. **Vérifier** : Liste des pratiques s'affiche correctement

### Console attendue
```
✅ Module pratique-registre.js chargé
✅ [SOM] Pratique Sommative enregistrée avec succès
✅ [PAN] Pratique PAN-Maîtrise enregistrée avec succès
✅ [SPEC] Pratique PAN-Spécifications enregistrée avec succès
✅ Wizard Primo initialisé
```

---

## 🆘 Problèmes connus

### L'erreur "PratiqueConfigurable is not defined" persiste
**Solution** : Assurez-vous d'utiliser `index 91.5b.html` et pas `index 91.5.html`.

### Le sélecteur de grille est vide
**Solution** : Créez d'abord des grilles de critères dans **Matériel → Critères d'évaluation**.

### Les barres SRPNF n'apparaissent pas
**Solution** : Configurez la grille de référence dans **Réglages → Pratique de notation**.

---

## 📞 Support

**Email** : labo@codexnumeris.org
**Site** : https://codexnumeris.org
**Teams** : LABO CODEX DE L'AQPC-PAN

---

## 📄 Licence

Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)

Vous êtes libre de :
- ✅ Partager : Copier et redistribuer le matériel
- ✅ Adapter : Remixer, transformer et créer à partir du matériel

Selon les conditions suivantes :
- 📝 Attribution : Vous devez créditer l'auteur original
- 🚫 Pas d'utilisation commerciale : Usage éducatif uniquement
- 🔄 Partage dans les mêmes conditions : Même licence pour vos adaptations

Voir **LICENSE.md** pour le texte complet.

---

## 🙏 Remerciements

Merci à **Bruno V.** (Cégep Laurendeau) pour avoir signalé le bug permettant cette correction rapide.

---

**Bon monitorage pédagogique !** 🎓
