# scripts/ref-poussee.sh — fragment SOURCÉ par scripts/pousser.sh (jamais exécuté directement).
#
# #980 (11 oct. 2026) — pousser.sh JUGE L'ARBRE DE TRAVAIL : le verdict Playwright joue le code
# posé là, et la plage de fichiers se calcule contre origin/<branche courante>. Mesuré le
# 28 sept. : `scripts/pousser.sh origin main`, lancé depuis l'arbre posé sur la branche d'un lot,
# a jugé le lot (≈ 15 min de WebKit) pour un push de `main` qui ne portait que RELAIS.md.
# Une référence qui n'est pas la branche courante est donc REFUSÉE : le verdict porterait sur
# un autre code que celui qui part. Pour pousser une autre branche : un worktree posé sur elle
# (ou `git push origin <ref>` quand un verdict du même SHA est déjà là).
#
# Usage :
#   . "$REPO_ROOT/scripts/ref-poussee.sh"
#   ref_poussee_conforme "$BRANCHE" "$@" || exit 1
#
# Rend 0 si les arguments ne nomment pas de référence (aucune après les options), ou si la
# référence nommée (source ET destination d'un `a:b`) est la branche courante (ou HEAD en
# source). Sinon écrit pourquoi sur la sortie d'erreur et rend 1.
ref_poussee_conforme() {
    _branche="$1"; shift
    # Les options en tête (`-u`, `--force`…) ne nomment rien : on les passe.
    while [ $# -gt 0 ]; do case "$1" in -*) shift ;; *) break ;; esac; done
    [ $# -ge 2 ] || return 0
    case "$2" in -*) return 0 ;; esac
    _src="${2%%:*}"
    case "$2" in *:*) _dst="${2#*:}" ;; *) _dst="$_src" ;; esac
    _src="${_src#refs/heads/}"; _dst="${_dst#refs/heads/}"
    if { [ "$_src" = "$_branche" ] || [ "$_src" = "HEAD" ]; } && { [ "$_dst" = "$_branche" ] || { [ "$_src" = "$_branche" ] && [ "$_dst" = "$_src" ]; }; }; then
        return 0
    fi
    printf '✗ pousser.sh juge l’arbre de travail, posé sur « %s » ; la référence demandée est « %s ».\n' "$_branche" "$2" >&2
    printf '  Le verdict porterait sur un autre code que celui qui part. Pousse « %s » depuis un worktree posé sur elle.\n' "$_dst" >&2
    return 1
}
