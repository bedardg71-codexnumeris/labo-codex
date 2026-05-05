#!/usr/bin/env bash
#
# Migration #259 — Réserve → Archives.
#
# Ce script renomme :
# - Le dossier ~/Documents/Reserve_LaboCodex/ → ~/Documents/Archives_LaboCodex/
# - Tous les fichiers manifeste-reserve.json → manifeste-archives.json
# - Toutes les clés JSON internes (versements/date_versement/mode_versement)
#   vers leurs équivalents (archives/date_archive/mode_archive).
#
# À exécuter UNE FOIS après mise à jour à Beta 99.36+.
#
# Usage : bash migrer-reserve-vers-archives.sh
#
# Idempotent : peut être ré-exécuté sans danger.

set -euo pipefail

CIBLE_AVANT="$HOME/Documents/Reserve_LaboCodex"
CIBLE_APRES="$HOME/Documents/Archives_LaboCodex"

echo "=== Migration #259 — Réserve → Archives ==="
echo

# --- Étape 1 : renommage du dossier racine ---
if [[ -d "$CIBLE_AVANT" ]] && [[ ! -d "$CIBLE_APRES" ]]; then
    mv "$CIBLE_AVANT" "$CIBLE_APRES"
    echo "✅ Dossier renommé : $CIBLE_AVANT → $CIBLE_APRES"
elif [[ -d "$CIBLE_APRES" ]] && [[ ! -d "$CIBLE_AVANT" ]]; then
    echo "→ Le dossier $CIBLE_APRES existe déjà, $CIBLE_AVANT absent : déjà migré."
elif [[ -d "$CIBLE_AVANT" ]] && [[ -d "$CIBLE_APRES" ]]; then
    echo "❌ Les deux dossiers existent (Reserve_LaboCodex et Archives_LaboCodex)."
    echo "   Vérifie manuellement et fusionne ou supprime le doublon avant de relancer."
    exit 1
else
    echo "→ Aucun dossier Reserve_LaboCodex ni Archives_LaboCodex à la racine."
    echo "   Si tu n'as jamais fait d'archive, c'est normal — fin du script."
    exit 0
fi

# --- Étape 2 : renommage des manifeste-reserve.json ---
nb_manifestes=0
while IFS= read -r f; do
    nouveau="$(dirname "$f")/manifeste-archives.json"
    if [[ ! -e "$nouveau" ]]; then
        mv "$f" "$nouveau"
        echo "  → $f → manifeste-archives.json"
        nb_manifestes=$((nb_manifestes + 1))
    fi
done < <(find "$CIBLE_APRES" -name "manifeste-reserve.json" -type f 2>/dev/null)

if [[ $nb_manifestes -gt 0 ]]; then
    echo "✅ $nb_manifestes fichier(s) manifeste-reserve.json renommé(s)."
else
    echo "→ Aucun manifeste-reserve.json trouvé (déjà migré ou inexistant)."
fi

# --- Étape 3 : renommage des manifeste-reserve-patch.json ---
nb_patches=0
while IFS= read -r f; do
    nouveau="$(dirname "$f")/manifeste-archives-patch.json"
    if [[ ! -e "$nouveau" ]]; then
        mv "$f" "$nouveau"
        echo "  → $f → manifeste-archives-patch.json"
        nb_patches=$((nb_patches + 1))
    fi
done < <(find "$CIBLE_APRES" -name "manifeste-reserve-patch.json" -type f 2>/dev/null)

if [[ $nb_patches -gt 0 ]]; then
    echo "✅ $nb_patches fichier(s) manifeste-reserve-patch.json renommé(s)."
fi

# --- Étape 4 : conversion des clés JSON internes (versements, date_versement, mode_versement) ---
echo
echo "→ Conversion des clés JSON internes (versements/date_versement/mode_versement) :"

JSON_FILES=()
while IFS= read -r f; do
    JSON_FILES+=("$f")
done < <(find "$CIBLE_APRES" \( -name "manifeste-archives.json" -o -name "manifeste-archives-patch.json" -o -name "meta.json" \) -type f 2>/dev/null)

nb_json=0
for f in "${JSON_FILES[@]:-}"; do
    if [[ -z "${f:-}" ]]; then continue; fi
    # Vérifier si le fichier contient les anciennes clés
    if grep -qE '"versements"|"date_versement"|"mode_versement"' "$f"; then
        # Backup avant édition
        cp "$f" "$f.bak"
        # Substitutions sed (POSIX, double commands)
        sed -i '' \
            -e 's/"versements"/"archives"/g' \
            -e 's/"date_versement"/"date_archive"/g' \
            -e 's/"mode_versement"/"mode_archive"/g' \
            "$f"
        rm "$f.bak"
        echo "  ✓ $f"
        nb_json=$((nb_json + 1))
    fi
done

if [[ $nb_json -gt 0 ]]; then
    echo "✅ $nb_json fichier(s) JSON converti(s)."
else
    echo "→ Aucun fichier JSON à convertir (déjà migré ou inexistant)."
fi

# --- Étape 5 : nettoyage du handle FSAPI persisté côté navigateur ---
echo
echo "═══════════════════════════════════════════════════════════════════"
echo "ℹ️  ÉTAPE NAVIGATEUR (manuelle)"
echo "═══════════════════════════════════════════════════════════════════"
echo
echo "Si tu utilises Chrome/Edge avec un handle FSAPI persistant, tu dois"
echo "re-lier le dossier dans l'app après la migration :"
echo
echo "   Réglages > Données > carte 'Archives stockées' > '✕ Délier'"
echo "   puis 'Choisir un dossier' et sélectionne ~/Documents/Archives_LaboCodex/"
echo
echo "Sur Safari (mode ZIP), aucune action navigateur requise."
echo
echo "✅ Migration #259 terminée."
