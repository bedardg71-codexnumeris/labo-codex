# scripts/lot-observable.sh — fragment SOURCÉ (jamais exécuté directement).
#
# Un seul endroit décide de ce qui est « observable au navigateur ». Le hook
# pré-push et scripts/pousser.sh posent la même question à propos du même lot ;
# deux copies de ce motif finiraient par diverger, et la divergence se verrait
# le jour où l'une des deux laisserait passer un lot que l'autre aurait retenu.
#
# Usage :
#   . "$REPO_ROOT/scripts/lot-observable.sh"
#   printf '%s\n' "$FICHIERS" | lot_observable && echo "il faut Playwright"

MOTIF_OBSERVABLE='^(js/|index\.html|styles\.css|tests/integration/|scripts/verifier-playwright\.mjs|scripts/playwright-baseline\.json)'

# Lit une liste de chemins sur stdin. Code 0 si au moins un est observable.
lot_observable() {
    grep -qE "$MOTIF_OBSERVABLE"
}
