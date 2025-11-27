#!/bin/bash
# Script de préparation du package Beta 91.5
# Date: 27 novembre 2025

VERSION="Beta_91.5_Correctifs"
DATE=$(date +"%Y-%m-%d")

echo "📦 Préparation du package $VERSION"
echo "=========================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "index 91.5.html" ]; then
    echo "❌ Erreur: Fichier 'index 91.5.html' introuvable !"
    echo "   Assurez-vous d'exécuter ce script depuis le répertoire du projet."
    exit 1
fi

# Créer le répertoire de distribution
DIST_DIR="dist/$VERSION"
echo "📁 Création du répertoire de distribution: $DIST_DIR"

if [ -d "$DIST_DIR" ]; then
    echo "⚠️  Le répertoire existe déjà. Suppression..."
    rm -rf "$DIST_DIR"
fi

mkdir -p "$DIST_DIR"

echo ""
echo "📋 Copie des fichiers nécessaires..."

# Copier le fichier HTML principal
echo "  ✓ index 91.5.html"
cp "index 91.5.html" "$DIST_DIR/"

# Copier le logo Codex Numeris
if [ -f "logo-codex-numeris.png" ]; then
    echo "  ✓ logo-codex-numeris.png"
    cp "logo-codex-numeris.png" "$DIST_DIR/"
else
    echo "  ⚠️  logo-codex-numeris.png non trouvé"
fi

# Copier les répertoires CSS et JS
if [ -d "css" ]; then
    echo "  ✓ css/"
    cp -r css "$DIST_DIR/"
fi

echo "  ✓ js/"
cp -r js "$DIST_DIR/"

# Copier les fichiers de documentation
echo ""
echo "📚 Copie de la documentation..."

if [ -f "BETA_91.5_CHANGELOG.md" ]; then
    echo "  ✓ BETA_91.5_CHANGELOG.md"
    cp "BETA_91.5_CHANGELOG.md" "$DIST_DIR/"
fi

if [ -f "LICENSE.md" ]; then
    echo "  ✓ LICENSE.md"
    cp "LICENSE.md" "$DIST_DIR/"
fi

# Créer un README pour le package
echo ""
echo "📝 Création du README..."
cat > "$DIST_DIR/README.md" << 'EOF'
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
EOF

echo "  ✓ README.md créé"

# Copier les données de démo si disponibles
if [ -f "donnees-demo.json" ]; then
    echo ""
    echo "📊 Copie des données de démonstration..."
    echo "  ✓ donnees-demo.json"
    cp "donnees-demo.json" "$DIST_DIR/"
fi

# Créer l'archive ZIP
echo ""
echo "🗜️  Création de l'archive ZIP..."

ARCHIVE_NAME="${VERSION}_${DATE}.zip"
cd dist

if [ -f "$ARCHIVE_NAME" ]; then
    echo "⚠️  L'archive existe déjà. Suppression..."
    rm "$ARCHIVE_NAME"
fi

zip -r -q "$ARCHIVE_NAME" "$VERSION"

cd ..

echo "  ✓ Archive créée: dist/$ARCHIVE_NAME"

# Calculer la taille
SIZE=$(du -h "dist/$ARCHIVE_NAME" | cut -f1)
echo "  📏 Taille: $SIZE"

# Afficher le résumé
echo ""
echo "✅ Package prêt pour distribution !"
echo "=========================================="
echo ""
echo "📦 Fichier: dist/$ARCHIVE_NAME"
echo "📁 Dossier: dist/$VERSION/"
echo "📏 Taille: $SIZE"
echo ""
echo "📋 Contenu du package:"
find "$DIST_DIR" -type f | wc -l | xargs echo "   Fichiers:"
find "$DIST_DIR" -type d | wc -l | xargs echo "   Dossiers:"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Tester le package (extraire et ouvrir index 91.5.html)"
echo "   2. Vérifier la checklist TESTS_BETA_91.5.md"
echo "   3. Distribuer l'archive: dist/$ARCHIVE_NAME"
echo ""
