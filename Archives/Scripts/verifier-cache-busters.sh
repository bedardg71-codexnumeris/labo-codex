#!/bin/bash
# Script de vérification des cache busters - Beta 91.5
# Date: 27 novembre 2025

echo "🔍 Vérification des cache busters dans index 91.5.html"
echo "======================================================="
echo ""

INDEX_FILE="index 91.5.html"

if [ ! -f "$INDEX_FILE" ]; then
    echo "❌ Fichier '$INDEX_FILE' introuvable !"
    exit 1
fi

echo "📋 Cache busters trouvés :"
echo ""

# Extraire tous les cache busters
grep -o 'src="[^"]*\.js?v=[0-9]*"' "$INDEX_FILE" | \
    sed 's/src="//g' | \
    sed 's/"//g' | \
    sort | \
    while read line; do
        filename=$(echo "$line" | cut -d'?' -f1)
        version=$(echo "$line" | cut -d'=' -f2)
        echo "  ✓ $filename → v=$version"
    done

echo ""
echo "📊 Statistiques :"
echo ""

# Compter les versions
total=$(grep -o '\.js?v=[0-9]*' "$INDEX_FILE" | wc -l | tr -d ' ')
echo "  Total de fichiers JS avec cache buster : $total"

# Trouver les versions uniques
echo ""
echo "  Versions utilisées :"
grep -o 'v=[0-9]*' "$INDEX_FILE" | sort -u | while read ver; do
    count=$(grep -o "$ver" "$INDEX_FILE" | wc -l | tr -d ' ')
    echo "    $ver : $count fichiers"
done

echo ""
echo "🎯 Fichiers modifiés dans Beta 91.5 (attendus) :"
echo ""

# Vérifier les fichiers spécifiques modifiés dans Beta 91.5
declare -A expected_files=(
    ["js/portfolio.js"]="2025112701"
    ["js/profil-etudiant.js"]="2025112703"
    ["js/pratiques.js"]="2025112704"
    ["js/pratiques/pratique-configurable.js"]="2025112705"
)

all_correct=true

for file in "${!expected_files[@]}"; do
    expected="${expected_files[$file]}"
    found=$(grep "$file" "$INDEX_FILE" | grep -o 'v=[0-9]*' | head -1 | cut -d'=' -f2)

    if [ "$found" == "$expected" ]; then
        echo "  ✅ $file → v=$found (OK)"
    else
        echo "  ❌ $file → v=$found (attendu: v=$expected)"
        all_correct=false
    fi
done

echo ""
echo "🔍 CSS cache buster :"
css_version=$(grep 'styles\.css' "$INDEX_FILE" | grep -o 'v=[0-9]*' | cut -d'=' -f2)
echo "  ✓ styles.css → v=$css_version"

echo ""
if [ "$all_correct" = true ]; then
    echo "✅ Tous les cache busters des fichiers modifiés sont corrects !"
    exit 0
else
    echo "⚠️  Certains cache busters ne correspondent pas aux versions attendues."
    exit 1
fi
