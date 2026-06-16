#!/bin/bash
#
# SessionStart hook — Labo Codex.
#
# But : que la vérification de fin de session se déclenche de façon FIABLE en
# session cloud, sans dépendre d'une annonce manuelle. À l'ouverture de chaque
# session, on (1) installe les deps de test si absentes (Vitest lançable) et
# (2) active les git-hooks existants du projet (scripts/hooks/, Défense I/J) :
#   - pre-commit : bloque un innerHTML interpolé sans echapperHtml ;
#   - pre-push   : exécute la suite Vitest, bloque le push si rouge.
# Ainsi un commit/push fait en cloud passe le même filet mécanique que sur le
# Mac de Grégoire. On NE réinvente rien : on réutilise install-hooks.sh.
#
# Mode SYNCHRONE (pas d'async) : garantit que tout est prêt avant le 1er tour.
# Idempotent, non interactif, fail-open (n'échoue jamais le démarrage).

set -uo pipefail

RACINE="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$RACINE" ] && cd "$RACINE" || exit 0

# 1. Dépendances de test (Vitest) — seulement si absentes (cache conteneur).
if [ -d tests ] && [ ! -d tests/node_modules ]; then
    ( cd tests && npm install --no-audit --no-fund >/dev/null 2>&1 ) \
        || echo "session-start: npm install (tests) a échoué — Vitest pourrait ne pas tourner." >&2
fi

# 2. Activer les git-hooks du projet (Défense I/J). Idempotent.
if [ -f scripts/install-hooks.sh ]; then
    bash scripts/install-hooks.sh >/dev/null 2>&1 \
        || echo "session-start: install-hooks.sh a échoué — hooks git non activés." >&2
fi

exit 0
