# Système de monitorage pédagogique - Beta 91.5

**Version** : Beta 91.5 - Correctifs et améliorations
**Date** : 27 novembre 2025
**Auteur** : Grégoire Bédard
**Licence** : Creative Commons BY-NC-SA 4.0

---

## 🚀 Démarrage rapide

### Étape 1: Ouvrir l'application
```bash
# Double-cliquer sur "index 91.5.html" ou
open "index 91.5.html"  # macOS
```

### Étape 2: Configurer la grille de référence (IMPORTANT)
1. Allez dans **Réglages → Pratique de notation**
2. Scrollez jusqu'à **"Grille de critères pour le dépistage"**
3. Sélectionnez votre grille principale
4. Cliquez sur **"Sauvegarder les modalités"**

**Pourquoi ?** Cette configuration permet d'afficher les barres SRPNF dans les profils étudiants.

---

## ✨ Nouveautés de cette version

### Bugs corrigés
1. ✅ Ancienne interface du tableau de bord (cartes séparées)
2. ✅ Carte "Indicateurs globaux" vide
3. ✅ Erreur JavaScript "Cannot access uninitialized variable"
4. ✅ Barres SRPNF affichant "NaN%"
5. ✅ Sélecteur de grille de référence vide
6. ✅ Erreur SyntaxError dans pratique-configurable.js

### Améliorations
- Messages informatifs si grille non configurée
- Validation stricte des données
- Rechargement automatique des grilles

---

## 📁 Structure du package

```
Beta_91.5_Correctifs/
├── index 91.5.html          # Point d'entrée de l'application
├── css/                     # Feuilles de style
│   └── styles.css
├── js/                      # Code JavaScript
│   ├── *.js                 # Modules principaux
│   └── pratiques/           # Système de pratiques
├── BETA_91.5_CHANGELOG.md   # Notes de version détaillées
├── README.md                # Ce fichier
└── LICENSE.md               # Licence CC BY-NC-SA 4.0
```

---

## 🔍 Vérification

### Tests rapides
1. Ouvrir `index 91.5.html` dans Safari ou Chrome
2. Ouvrir la console JavaScript (Cmd+Option+C)
3. Vérifier qu'il n'y a pas d'erreurs rouges
4. Naviguer dans les sections principales
5. Configurer la grille de référence

### Console attendue
```
✅ Module pratique-registre.js chargé
✅ [SOM] Pratique Sommative enregistrée avec succès
✅ [PAN] Pratique PAN-Maîtrise enregistrée avec succès
✅ X grille(s) chargée(s) dans le sélecteur de référence
```

---

## 🆘 Problèmes connus

### Le sélecteur de grille est vide
**Solution** : Vous devez d'abord créer des grilles de critères dans **Matériel → Critères d'évaluation**.

### Les barres SRPNF n'apparaissent pas
**Solution** : Configurez la grille de référence dans **Réglages → Pratique de notation**.

### Avertissement "Valeur non-JSON détectée"
**Statut** : Avertissement non critique, n'affecte pas le fonctionnement.

---

## 📞 Support

**Email** : labo@codexnumeris.org
**Site** : https://codexnumeris.org

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

**Bon monitorage pédagogique !** 🎓
