# scripts/lot-observable.sh — fragment SOURCÉ (jamais exécuté directement).
#
# Un seul endroit décide de ce qui est « observable au navigateur ». Le hook
# pré-push et scripts/pousser.sh posent la même question à propos du même lot ;
# deux copies de ce motif finiraient par diverger, et la divergence se verrait
# le jour où l'une des deux laisserait passer un lot que l'autre aurait retenu.
#
# ↻ #756 (7 sept. 2026) — CET ENDROIT N'EST PLUS ICI : c'est la liste
# `OBSERVABLE` de .github/workflows/tests.yml (env du workflow depuis le
# 20 sept. 2026, du job `vitest` avant), que ce fragment LIT. Le motif vivait ici en dur et ne comptait que `js/`, `index.html`,
# `styles.css`, `tests/integration/` et deux scripts, là où la CI compte aussi
# `css/`, `icons/`, `img/`, `libs/`, `version.js`, `version.json`,
# `noms_stables.json`, `scripts/`, TOUT `tests/` et le workflow lui-même.
# Mesuré sur le push d5f911b0 (un banc Vitest neuf) : le hook a dit
# « Sentinelle Playwright : sans objet », la CI a lancé Playwright (run
# 34028716398). Un hook qui rassure à tort vaut moins que pas de hook.
# ⚠ Conséquence assumée : le verdict Playwright est désormais exigé pour des
# lots qui en étaient dispensés (un banc Vitest seul, un script, une icône) —
# exactement ceux sur lesquels le runner le rend déjà.
#
# Usage :
#   . "$REPO_ROOT/scripts/lot-observable.sh"
#   printf '%s\n' "$FICHIERS" | lot_observable && echo "il faut Playwright"

_SOURCE_OBSERVABLE="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null)}/.github/workflows/tests.yml"

# Construit le motif grep depuis la liste de la CI. Une entrée qui finit par
# `/` couvre le dossier ; sinon c'est un fichier exact (`chemin == entrée`).
# Depuis le 20 sept. 2026, la CI ne porte plus de copie de cette règle : sa
# garde (scripts/ci-garde-inutilite.sh) appelle `lot_observable` elle aussi.
_motif_observable() {
    local liste entree echappee motif=''
    liste=$(sed -n 's/^[[:space:]]*OBSERVABLE:[[:space:]]*"\(.*\)"[[:space:]]*$/\1/p' \
        "$_SOURCE_OBSERVABLE" 2>/dev/null | head -1)
    [ -n "$liste" ] || return 1
    for entree in $liste; do
        echappee=$(printf '%s' "$entree" | sed 's/\./\\./g')
        case "$entree" in
            */) motif="$motif|^$echappee" ;;
            *)  motif="$motif|^$echappee\$" ;;
        esac
    done
    printf '(%s)' "${motif#|}"
}

MOTIF_OBSERVABLE=$(_motif_observable) || MOTIF_OBSERVABLE=''

# Lit une liste de chemins sur stdin. Code 0 si au moins un est observable.
# ⚠ Liste illisible (workflow déplacé, dépôt partiel) : on répond OUI. Conclure
# « rien d'observable » sans avoir pu lire la règle, c'est sauter le verdict en
# silence — le défaut même que #756 corrige.
lot_observable() {
    if [ -z "$MOTIF_OBSERVABLE" ]; then
        cat >/dev/null
        return 0
    fi
    grep -qE "$MOTIF_OBSERVABLE"
}
