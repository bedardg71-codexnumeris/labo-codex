#!/bin/bash

# ============================================================================
# SCRIPT DE MISE A JOUR DE VERSION - Monitorage Pedagogique
# ============================================================================
# Usage:
#   ./scripts/update-version.sh build          # Met a jour BUILD_ID seulement
#   ./scripts/update-version.sh minor [X.Y]    # Version mineure (ex: 95.4)
#   ./scripts/update-version.sh major [X]      # Version majeure (ex: 96)
#
# Auteur: Gregoire Bedard / Claude Code
# Date: 9 janvier 2026
# ============================================================================

set -e  # Arreter si erreur

# Couleurs pour affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repertoire racine du projet
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Fichiers cibles
INDEX_HTML="index.html"
SESSION_MD="SESSION.md"

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

# Obtenir la date/heure Toronto
get_toronto_datetime() {
    TZ='America/Toronto' date '+%d %B %Y, %H:%M'
}

get_build_id() {
    TZ='America/Toronto' date '+%m%d-%H%M'
}

get_current_version() {
    grep -o "Beta [0-9]*\.[0-9]*" "$INDEX_HTML" | head -1 | sed 's/Beta //'
}

# ============================================================================
# MISE A JOUR BUILD_ID
# ============================================================================

update_build_id() {
    local new_build_id=$(get_build_id)
    local datetime=$(get_toronto_datetime)

    log_info "Mise a jour BUILD_ID: $new_build_id"

    # Mettre a jour index.html
    sed -i '' "s/const BUILD_ID = '[0-9]*-[0-9]*'/const BUILD_ID = '$new_build_id'/" "$INDEX_HTML"
    log_success "index.html: BUILD_ID mis a jour"

    # Mettre a jour SESSION.md - version build
    local current_version=$(get_current_version)
    sed -i '' "s/Beta $current_version (build [0-9]*-[0-9]*)/Beta $current_version (build $new_build_id)/" "$SESSION_MD"
    log_success "SESSION.md: Build mis a jour"

    # Mettre a jour SESSION.md - timestamp
    # Format: **Derniere mise a jour** : 9 janvier 2026, 12:00 (Toronto)
    local date_fr=$(TZ='America/Toronto' date '+%-d janvier 2026, %H:%M')
    sed -i '' "s/\*\*Derniere mise a jour\*\* : .* (Toronto)/**Derniere mise a jour** : $date_fr (Toronto)/" "$SESSION_MD"
    log_success "SESSION.md: Timestamp mis a jour"

    echo ""
    log_success "BUILD_ID mis a jour: $new_build_id"
}

# ============================================================================
# MISE A JOUR VERSION MINEURE
# ============================================================================

update_minor_version() {
    local new_version="$1"

    if [ -z "$new_version" ]; then
        local current=$(get_current_version)
        local major=$(echo $current | cut -d. -f1)
        local minor=$(echo $current | cut -d. -f2)
        new_version="$major.$((minor + 1))"
    fi

    log_info "Mise a jour version mineure: $new_version"

    # Verifier format
    if ! [[ $new_version =~ ^[0-9]+\.[0-9]+$ ]]; then
        log_error "Format invalide. Utiliser: X.Y (ex: 95.4)"
    fi

    local old_version=$(get_current_version)

    # Mettre a jour index.html - titre
    sed -i '' "s/Beta $old_version/Beta $new_version/g" "$INDEX_HTML"
    log_success "index.html: Version mise a jour ($old_version -> $new_version)"

    # Mettre a jour SESSION.md
    sed -i '' "s/Beta $old_version/Beta $new_version/g" "$SESSION_MD"
    log_success "SESSION.md: Version mise a jour"

    # Mettre a jour BUILD_ID
    update_build_id

    echo ""
    log_warning "Actions manuelles requises:"
    echo "  1. Ajouter section nouveautes dans index.html (ligne ~3208)"
    echo "  2. Mettre a jour Documentation/Changelogs/BETA_${new_version%%.*}_CHANGELOG.md"
    echo "  3. Mettre a jour SESSION.md (backlog, historique)"
    echo ""
    log_success "Version mineure $new_version prete"
}

# ============================================================================
# MISE A JOUR VERSION MAJEURE
# ============================================================================

update_major_version() {
    local new_major="$1"

    if [ -z "$new_major" ]; then
        local current=$(get_current_version)
        local major=$(echo $current | cut -d. -f1)
        new_major="$((major + 1))"
    fi

    local new_version="$new_major.0"
    local old_version=$(get_current_version)
    local old_major="${old_version%%.*}"

    log_info "Mise a jour version majeure: $old_version -> $new_version"

    # Archiver version precedente
    log_info "Archivage Beta $old_major..."
    local archive_dir="Archives/Beta-$old_major-x"
    mkdir -p "$archive_dir"
    cp "$INDEX_HTML" "$archive_dir/"
    cp "styles.css" "$archive_dir/"
    cp -r "js/" "$archive_dir/"
    cp "$SESSION_MD" "$archive_dir/"
    log_success "Archive creee: $archive_dir/"

    # Creer nouveau changelog
    local new_changelog="Documentation/Changelogs/BETA_${new_major}_CHANGELOG.md"
    if [ ! -f "$new_changelog" ]; then
        cat > "$new_changelog" << EOF
# Changelog Beta $new_major

## Beta $new_version ($(date '+%d %B %Y'))

### Nouveautes
- [A completer]

### Corrections
- [A completer]

### Notes de migration
- [A completer si applicable]
EOF
        log_success "Nouveau changelog cree: $new_changelog"
    fi

    # Mettre a jour version
    sed -i '' "s/Beta $old_version/Beta $new_version/g" "$INDEX_HTML"
    sed -i '' "s/Beta $old_version/Beta $new_version/g" "$SESSION_MD"
    log_success "Version mise a jour dans tous les fichiers"

    # Mettre a jour BUILD_ID
    update_build_id

    echo ""
    log_warning "Actions manuelles requises:"
    echo "  1. Revoir et nettoyer les nouveautes dans index.html"
    echo "  2. Completer $new_changelog"
    echo "  3. Reinitialiser SESSION.md (backlog, historique)"
    echo "  4. Communiquer aux testeurs (version majeure)"
    echo ""
    log_success "Version majeure $new_version prete"
}

# ============================================================================
# AFFICHAGE AIDE
# ============================================================================

show_help() {
    echo "Usage: $0 <commande> [options]"
    echo ""
    echo "Commandes:"
    echo "  build           Met a jour BUILD_ID et timestamps"
    echo "  minor [X.Y]     Version mineure (auto-increment si pas specifie)"
    echo "  minor 95.4      Version mineure specifique"
    echo "  major [X]       Version majeure avec archivage"
    echo "  major 96        Version majeure specifique"
    echo "  status          Affiche version actuelle"
    echo "  help            Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 build        # Met a jour BUILD_ID"
    echo "  $0 minor        # 95.3 -> 95.4"
    echo "  $0 major        # 95.x -> 96.0"
}

show_status() {
    local version=$(get_current_version)
    local build_id=$(grep "const BUILD_ID" "$INDEX_HTML" | grep -o "'[^']*'" | tr -d "'")

    echo ""
    echo "=== Etat actuel ==="
    echo "Version: Beta $version"
    echo "Build ID: $build_id"
    echo "Fichiers:"
    echo "  - $INDEX_HTML"
    echo "  - $SESSION_MD"
    echo ""
}

# ============================================================================
# POINT D'ENTREE
# ============================================================================

case "$1" in
    build)
        update_build_id
        ;;
    minor)
        update_minor_version "$2"
        ;;
    major)
        update_major_version "$2"
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Commande inconnue: $1\nUtiliser '$0 help' pour l'aide."
        ;;
esac
