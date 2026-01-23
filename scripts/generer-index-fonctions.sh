#!/bin/bash
# Génère un index des fonctions JavaScript du projet
# Usage: ./scripts/generer-index-fonctions.sh [fichier_specifique]
#
# Sans argument : indexe tous les fichiers js/
# Avec argument : indexe seulement le fichier spécifié

OUTPUT_FILE="/tmp/INDEX-FONCTIONS.txt"

echo "=== INDEX DES FONCTIONS ===" > "$OUTPUT_FILE"
echo "Généré le: $(date '+%Y-%m-%d %H:%M')" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ -n "$1" ]; then
    # Fichier spécifique
    FILES="$1"
else
    # Tous les fichiers JS (sans les backups et archives)
    FILES=$(find js -maxdepth 1 -name "*.js" ! -name "*.backup" | sort)
fi

for file in $FILES; do
    if [ -f "$file" ]; then
        echo "## $(basename $file)" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        # Extraire les fonctions avec leur numéro de ligne
        grep -n "^function \|^async function " "$file" | while read line; do
            num=$(echo "$line" | cut -d: -f1)
            func=$(echo "$line" | sed 's/.*function //' | sed 's/(.*$//')
            echo "- $func (ligne $num)" >> "$OUTPUT_FILE"
        done

        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "---" >> "$OUTPUT_FILE"
echo "Total: $(grep -c "^- " "$OUTPUT_FILE") fonctions" >> "$OUTPUT_FILE"

cat "$OUTPUT_FILE"
