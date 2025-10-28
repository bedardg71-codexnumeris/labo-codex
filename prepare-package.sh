#!/bin/bash

################################################################################
# Script de préparation du package de distribution
# Système de Monitorage Pédagogique - Beta 0.74
# Auteur: Grégoire Bédard
# Contact: labo@codexnumeris.org
# Date: 27 octobre 2025
################################################################################

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION="Beta_0.74"
PACKAGE_NAME="Monitorage_${VERSION}"
DIST_DIR="dist"
TEMP_DIR="${DIST_DIR}/${PACKAGE_NAME}"
ZIP_FILE="${DIST_DIR}/${PACKAGE_NAME}.zip"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Préparation du package de distribution${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

################################################################################
# ÉTAPE 1 : Vérifications préalables
################################################################################

echo -e "${YELLOW}[1/6] Vérifications préalables...${NC}"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "index 74 (moteur recherche Aide).html" ]; then
    echo -e "${RED}❌ ERREUR: Fichier principal introuvable.${NC}"
    echo -e "${RED}   Assurez-vous d'exécuter ce script depuis le répertoire racine du projet.${NC}"
    exit 1
fi

# Vérifier que donnees-demo.json existe
if [ ! -f "donnees-demo.json" ]; then
    echo -e "${RED}⚠️  AVERTISSEMENT: Le fichier donnees-demo.json n'existe pas.${NC}"
    echo -e "${YELLOW}   Vous devez le créer en suivant les instructions de README_DONNEES_DEMO.md${NC}"
    echo -e "${YELLOW}   avant de distribuer le package.${NC}"
    echo ""
    read -p "Continuer quand même ? (o/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo -e "${RED}❌ Annulation.${NC}"
        exit 1
    fi
fi

# Vérifier que le répertoire js/ existe
if [ ! -d "js" ]; then
    echo -e "${RED}❌ ERREUR: Répertoire js/ introuvable.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Vérifications préalables complétées.${NC}"
echo ""

################################################################################
# ÉTAPE 2 : Nettoyage
################################################################################

echo -e "${YELLOW}[2/6] Nettoyage des anciens packages...${NC}"

# Supprimer l'ancien répertoire dist s'il existe
if [ -d "$DIST_DIR" ]; then
    rm -rf "$DIST_DIR"
    echo -e "${GREEN}✅ Ancien répertoire dist/ supprimé.${NC}"
fi

# Créer le nouveau répertoire dist
mkdir -p "$TEMP_DIR"
echo -e "${GREEN}✅ Nouveau répertoire créé: ${TEMP_DIR}${NC}"
echo ""

################################################################################
# ÉTAPE 3 : Copie des fichiers essentiels
################################################################################

echo -e "${YELLOW}[3/6] Copie des fichiers essentiels...${NC}"

# Copier le fichier HTML principal
cp "index 74 (moteur recherche Aide).html" "$TEMP_DIR/"
echo "  ✓ index 74 (moteur recherche Aide).html"

# Copier styles.css
cp "styles.css" "$TEMP_DIR/"
echo "  ✓ styles.css"

# Copier le répertoire js/ complet
mkdir -p "$TEMP_DIR/js"
rsync -a --exclude='*.backup' --exclude='*.bak' --exclude='.DS_Store' --exclude='*.txt' js/ "$TEMP_DIR/js/"
JS_COUNT=$(find "$TEMP_DIR/js" -name "*.js" -type f | wc -l | tr -d ' ')
echo "  ✓ js/ (${JS_COUNT} fichiers .js)"

# Compter et afficher les fichiers exclus
EXCLUDED_COUNT=0
if [ -f "js/.DS_Store" ]; then
    EXCLUDED_COUNT=$((EXCLUDED_COUNT + 1))
fi
BACKUP_COUNT=$(find js -name "*.backup" -o -name "*.bak" | wc -l | tr -d ' ')
TXT_COUNT=$(find js -name "*.txt" | wc -l | tr -d ' ')
TOTAL_EXCLUDED=$((EXCLUDED_COUNT + BACKUP_COUNT + TXT_COUNT))

if [ $TOTAL_EXCLUDED -gt 0 ]; then
    echo -e "  ${BLUE}ℹ️  Fichiers dev exclus: ${TOTAL_EXCLUDED} (.DS_Store, *.backup, *.bak, *.txt)${NC}"
fi

# Copier donnees-demo.json si disponible
if [ -f "donnees-demo.json" ]; then
    cp "donnees-demo.json" "$TEMP_DIR/"
    echo "  ✓ donnees-demo.json"
else
    echo -e "  ${YELLOW}⚠️  donnees-demo.json non inclus (fichier manquant)${NC}"
fi

echo -e "${GREEN}✅ Fichiers essentiels copiés.${NC}"
echo ""

################################################################################
# ÉTAPE 4 : Copie de la documentation
################################################################################

echo -e "${YELLOW}[4/6] Copie de la documentation...${NC}"

# Copier LISEZMOI.txt (guide d'installation rapide)
cp "LISEZMOI.txt" "$TEMP_DIR/"
echo "  ✓ LISEZMOI.txt"

# Copier GUIDE_TESTEURS.md
if [ -f "GUIDE_TESTEURS.md" ]; then
    cp "GUIDE_TESTEURS.md" "$TEMP_DIR/"
    echo "  ✓ GUIDE_TESTEURS.md"
fi

# Copier LICENSE.md
if [ -f "LICENSE.md" ]; then
    cp "LICENSE.md" "$TEMP_DIR/"
    echo "  ✓ LICENSE.md"
fi

# Copier README_DONNEES_DEMO.md (optionnel - pour référence)
if [ -f "README_DONNEES_DEMO.md" ]; then
    cp "README_DONNEES_DEMO.md" "$TEMP_DIR/"
    echo "  ✓ README_DONNEES_DEMO.md (référence)"
fi

echo -e "${GREEN}✅ Documentation copiée.${NC}"
echo ""

################################################################################
# ÉTAPE 5 : Vérification du contenu
################################################################################

echo -e "${YELLOW}[5/6] Vérification du contenu du package...${NC}"

# Compter les fichiers
TOTAL_FILES=$(find "$TEMP_DIR" -type f | wc -l | tr -d ' ')
JS_FILES=$(find "$TEMP_DIR/js" -name "*.js" | wc -l | tr -d ' ')
DOC_FILES=$(find "$TEMP_DIR" -maxdepth 1 -type f \( -name "*.txt" -o -name "*.md" \) | wc -l | tr -d ' ')

echo ""
echo -e "${BLUE}Contenu du package:${NC}"
echo "  • Fichier HTML principal: 1"
echo "  • Fichiers CSS: 1"
echo "  • Modules JavaScript: ${JS_FILES}"
echo "  • Fichiers de documentation: ${DOC_FILES}"
if [ -f "$TEMP_DIR/donnees-demo.json" ]; then
    echo "  • Données de démonstration: 1"
else
    echo -e "  • Données de démonstration: ${YELLOW}0 (à créer)${NC}"
fi
echo "  ${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  ${GREEN}Total: ${TOTAL_FILES} fichiers${NC}"

if [ $TOTAL_EXCLUDED -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Fichiers de développement exclus:${NC}"
    echo "  • Fichiers .DS_Store, *.backup, *.bak, *.txt dans js/"
    echo "  ${BLUE}Total exclus: ${TOTAL_EXCLUDED} fichiers${NC}"
fi
echo ""

# Afficher l'arborescence
echo -e "${BLUE}Arborescence:${NC}"
tree -L 2 "$TEMP_DIR" 2>/dev/null || find "$TEMP_DIR" -maxdepth 2 -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'
echo ""

################################################################################
# ÉTAPE 6 : Création de l'archive ZIP
################################################################################

echo -e "${YELLOW}[6/6] Création de l'archive ZIP...${NC}"

# Se déplacer dans le répertoire dist pour créer le ZIP
cd "$DIST_DIR"

# Créer le ZIP
zip -r -q "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}"

# Retourner au répertoire racine
cd ..

# Vérifier que le ZIP a été créé
if [ -f "$ZIP_FILE" ]; then
    ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Archive ZIP créée: ${ZIP_FILE}${NC}"
    echo -e "${GREEN}   Taille: ${ZIP_SIZE}${NC}"
else
    echo -e "${RED}❌ ERREUR: Impossible de créer l'archive ZIP.${NC}"
    exit 1
fi

echo ""

################################################################################
# ÉTAPE 7 : Récapitulatif final
################################################################################

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Package prêt pour distribution !${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}Fichier créé:${NC}"
echo -e "  📦 ${ZIP_FILE}"
echo -e "  📂 Taille: ${ZIP_SIZE}"
echo ""
echo -e "${BLUE}Prochaines étapes:${NC}"
echo ""

if [ ! -f "$TEMP_DIR/donnees-demo.json" ]; then
    echo -e "${YELLOW}1. ⚠️  IMPORTANT: Créer donnees-demo.json${NC}"
    echo "   • Suivre les instructions de README_DONNEES_DEMO.md"
    echo "   • Réexécuter ce script après création"
    echo ""
fi

echo -e "${GREEN}2. ✅ Tester le package${NC}"
echo "   • Décompresser le ZIP dans un nouveau dossier"
echo "   • Ouvrir index 74 (moteur recherche Aide).html"
echo "   • Importer donnees-demo.json"
echo "   • Vérifier que tout fonctionne"
echo ""

echo -e "${GREEN}3. ✅ Créer le formulaire Microsoft Forms${NC}"
echo "   • Utiliser le template FORMULAIRE_MICROSOFT_FORMS.md"
echo "   • Ajouter le lien dans GUIDE_TESTEURS.md (ligne 213)"
echo "   • Recréer le package avec le guide mis à jour"
echo ""

echo -e "${GREEN}4. ✅ Distribuer aux testeurs${NC}"
echo "   • Envoyer ${ZIP_FILE}"
echo "   • Inclure le lien du formulaire de feedback"
echo "   • Email de contact: labo@codexnumeris.org"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Bonne distribution ! 🎓${NC}"
echo -e "${BLUE}========================================${NC}"
