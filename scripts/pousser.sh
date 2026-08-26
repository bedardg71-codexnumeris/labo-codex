#!/usr/bin/env bash
#
# Pousser Labo Codex — le chemin normal vers origin.
#
# POURQUOI CE SCRIPT EXISTE (#533, 26 août 2026)
# ----------------------------------------------
# `git push` ouvre la connexion vers le serveur AVANT d'exécuter le hook
# pré-push. Tant que la sentinelle Playwright tournait DANS le hook, la session
# restait muette six minutes et GitHub la fermait :
#
#     Connection to github.com closed by remote host.
#     Transferred: sent 3620, received 19832 bytes, in 360.5 seconds
#     ✓ Sentinelle Playwright : aucune rougeur nouvelle (1 échec connu, inchangé).
#
# Le verdict était juste, vert, et arrivé après la fermeture. Trois pushs de
# suite ont échoué ainsi le 26 août, sans que rien ne soit cassé — le genre
# d'échec qui apprend à taper --no-verify par réflexe, et fait perdre la garde
# entière pour un problème de calendrier.
#
# Ce script renverse l'ordre : la garde lourde d'abord, la connexion ensuite.
# Chaque suite ne tourne qu'une fois — Playwright ici, Vitest dans le hook.
#
# USAGE
#   scripts/pousser.sh              # pousse la branche courante vers origin
#   scripts/pousser.sh origin main  # arguments passés tels quels à git push
#
# La suite Playwright n'est lancée que si le lot emporte du code observable au
# navigateur ; un push documentaire part directement.

set -eu

ROUGE='\033[0;31m'
VERT='\033[0;32m'
JAUNE='\033[0;33m'
RAZ='\033[0m'

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

BRANCHE=$(git rev-parse --abbrev-ref HEAD)
DISTANTE="origin/$BRANCHE"

# Un travail non commité ne part pas — et le verdict porterait sur autre chose
# que ce qui est poussé. Mieux vaut le dire que le découvrir après.
if [ -n "$(git status --porcelain)" ]; then
    printf "${JAUNE}⚠ Des modifications ne sont pas commitées :${RAZ}\n\n"
    git status --short | sed 's/^/    /'
    printf "\n  Elles ne partiront pas. Le verdict porte sur le dernier commit.\n\n"
fi

# Quels fichiers ce push emporte-t-il ? Si la branche n'existe pas encore chez
# origin, aucune plage n'est calculable : on juge, plutôt que de se taire — une
# branche fraîche est justement le cas où une régression passe.
if git rev-parse --verify --quiet "$DISTANTE" >/dev/null; then
    FICHIERS=$(git diff --name-only "$DISTANTE" HEAD)
    NB_COMMITS=$(git rev-list --count "$DISTANTE..HEAD")
    if [ "$NB_COMMITS" -eq 0 ]; then
        printf "${VERT}✓ Rien à pousser : %s est déjà à jour.${RAZ}\n" "$DISTANTE"
        exit 0
    fi
    printf "${VERT}→ %s commit(s) à pousser vers %s.${RAZ}\n" "$NB_COMMITS" "$DISTANTE"
else
    FICHIERS=''
    printf "${JAUNE}→ Branche neuve chez origin — la garde complète s'applique.${RAZ}\n"
fi

. "$REPO_ROOT/scripts/lot-observable.sh"

LANCER=0
if [ -z "$FICHIERS" ]; then
    LANCER=1
elif printf '%s\n' "$FICHIERS" | lot_observable; then
    LANCER=1
fi

if [ $LANCER -eq 1 ]; then
    printf "${VERT}→ Sentinelle Playwright, AVANT d'ouvrir la connexion (~4 min)...${RAZ}\n"
    # Le script dépose son verdict dans scripts/.verdict-playwright.json ; le
    # hook pré-push le lira. `set -e` ne doit pas tuer le script sur un code
    # non nul : c'est nous qui décidons quoi en faire.
    set +e
    node "$REPO_ROOT/scripts/verifier-playwright.mjs"
    CODE_PW=$?
    set -e

    if [ $CODE_PW -eq 1 ]; then
        printf "\n${ROUGE}✗ Rougeur nouvelle — rien n'a été poussé.${RAZ}\n"
        exit 1
    fi
else
    printf "${VERT}✓ Sentinelle Playwright : sans objet (aucun code observable dans ce lot).${RAZ}\n"
fi

printf "${VERT}→ Push (le hook enchaîne Vitest, puis lit le verdict)...${RAZ}\n"

if [ $# -gt 0 ]; then
    git push "$@"
else
    git push origin "$BRANCHE"
fi

printf "${VERT}✓ Poussé.${RAZ}\n"
