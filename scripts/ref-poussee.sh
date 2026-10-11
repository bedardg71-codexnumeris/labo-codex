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
# Relecture de Cowork (11 oct.) : TOUS les arguments qui ne sont pas des options sont lus. Le
# premier est le dépôt distant ; chacun des suivants est une référence (`src` ou `src:dst`), et
# chacune doit désigner la branche courante : source = branche ou HEAD, destination = branche
# (ou HEAD, qui y renvoie). `origin --force lot-x` et `origin main lot-x` sont refusés.
# Sans référence nommée (aucun argument, ou seulement le dépôt) : git pousse la branche
# courante, rien à refuser. Sinon écrit pourquoi sur la sortie d'erreur et rend 1.
ref_poussee_conforme() {
    _branche="$1"; shift
    _depot=''
    for _arg in "$@"; do
        case "$_arg" in -*) continue ;; esac
        if [ -z "$_depot" ]; then _depot="$_arg"; continue; fi
        _src="${_arg%%:*}"
        case "$_arg" in *:*) _dst="${_arg#*:}" ;; *) _dst="$_src" ;; esac
        _src="${_src#+}"; _src="${_src#refs/heads/}"; _dst="${_dst#refs/heads/}"
        if { [ "$_src" = "$_branche" ] || [ "$_src" = "HEAD" ]; } && { [ "$_dst" = "$_branche" ] || [ "$_dst" = "HEAD" ]; }; then
            continue
        fi
        printf '✗ pousser.sh juge l’arbre de travail, posé sur « %s » ; la référence demandée est « %s ».\n' "$_branche" "$_arg" >&2
        printf '  Le verdict porterait sur un autre code que celui qui part. Pousse « %s » depuis un worktree posé sur elle.\n' "$_dst" >&2
        return 1
    done
    return 0
}
