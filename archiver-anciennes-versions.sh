#!/bin/bash

# ================================================================
# Script d'archivage des anciennes versions de index.html
# Usage: ./archiver-anciennes-versions.sh
# ================================================================

# Couleurs pour l'affichage
VERT='\033[0;32m'
BLEU='\033[0;34m'
JAUNE='\033[1;33m'
ROUGE='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLEU}================================================${NC}"
echo -e "${BLEU}  Archivage des anciennes versions de index.html${NC}"
echo -e "${BLEU}================================================${NC}"
echo ""

# Créer le dossier Archives s'il n'existe pas
if [ ! -d "Archives" ]; then
    mkdir -p "Archives"
    echo -e "${VERT}✓${NC} Dossier Archives/ créé"
fi

# Trouver tous les fichiers index*.html
fichiers=(index*.html)

# Vérifier s'il y a des fichiers
if [ ${#fichiers[@]} -eq 0 ] || [ ! -e "${fichiers[0]}" ]; then
    echo -e "${JAUNE}⚠${NC} Aucun fichier index*.html trouvé"
    exit 0
fi

# Trouver le fichier avec le numéro le plus élevé
dernier_numero=0
dernier_fichier=""

for fichier in "${fichiers[@]}"; do
    # Extraire le numéro (ex: "index 85 (interventions).html" -> 85)
    if [[ $fichier =~ index[[:space:]]+([0-9]+) ]]; then
        numero="${BASH_REMATCH[1]}"
        if [ "$numero" -gt "$dernier_numero" ]; then
            dernier_numero=$numero
            dernier_fichier="$fichier"
        fi
    fi
done

echo -e "${BLEU}Version actuelle :${NC} $dernier_fichier (version $dernier_numero)"
echo ""

# Compter les fichiers à archiver
nb_archives=0

# Déplacer tous les autres fichiers vers Archives/
for fichier in "${fichiers[@]}"; do
    # Ne pas archiver le fichier le plus récent
    if [ "$fichier" != "$dernier_fichier" ]; then
        # Vérifier si le fichier existe déjà dans Archives
        if [ -f "Archives/$fichier" ]; then
            echo -e "${JAUNE}⚠${NC} $fichier existe déjà dans Archives/ (ignoré)"
        else
            mv "$fichier" "Archives/"
            echo -e "${VERT}✓${NC} $fichier → Archives/"
            ((nb_archives++))
        fi
    fi
done

echo ""
if [ $nb_archives -eq 0 ]; then
    echo -e "${BLEU}Aucune version à archiver${NC}"
else
    echo -e "${VERT}================================================${NC}"
    echo -e "${VERT}✓ $nb_archives fichier(s) archivé(s) avec succès !${NC}"
    echo -e "${VERT}================================================${NC}"
fi
