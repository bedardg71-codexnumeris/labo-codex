#!/usr/bin/env bash
#
# Installateur des hooks git Labo Codex.
#
# Pointe git sur scripts/hooks/ via core.hooksPath. Idempotent :
# réexécution sûre.
#
# Désinstallation :
#   git config --unset core.hooksPath

set -eu

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/scripts/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
    printf 'Erreur : %s introuvable.\n' "$HOOKS_DIR" >&2
    exit 1
fi

# Rendre les hooks exécutables.
chmod +x "$HOOKS_DIR"/*

# Pointer git vers ce dossier.
git config core.hooksPath scripts/hooks

printf '✓ Hooks installés.\n'
printf '  core.hooksPath = scripts/hooks\n'
printf '  Hooks actifs   : %s\n' "$(ls "$HOOKS_DIR" | tr '\n' ' ')"
printf '\n'
printf 'Désinstallation : git config --unset core.hooksPath\n'
