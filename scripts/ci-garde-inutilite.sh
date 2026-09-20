#!/usr/bin/env bash
# scripts/ci-garde-inutilite.sh — LA GARDE D'INUTILITÉ du run quotidien de Playwright.
#
# Depuis le 20 septembre 2026, la suite au navigateur ne tourne plus à chaque
# push sur GitHub : elle tourne UNE FOIS PAR JOUR (`schedule`) et à la demande
# (`workflow_dispatch`) — voir le point (7) du journal de
# .github/workflows/tests.yml. Un run quotidien sur un dépôt immobile paierait
# 35 à 55 minutes pour rien : le défaut même que ce lot corrige. Cette garde
# répond, AVANT que le job `playwright` n'installe quoi que ce soit :
# « depuis le dernier SHA jugé par un run planifié, quelque chose d'observable
# au navigateur a-t-il bougé ? »
#
# La règle d'« observable » n'est pas recopiée : c'est `lot_observable`
# (scripts/lot-observable.sh), qui LIT la liste `OBSERVABLE` du workflow — la
# même que `pousser.sh` et le hook pre-push (#756). Une liste, trois lecteurs.
#
# Entrées (variables d'environnement) :
#   EVENEMENT  `schedule`, `workflow_dispatch`… (github.event_name)
#   DERNIER    SHA du dernier run planifié qui a CONCLU (success ou failure) ;
#              vide si inconnu. Le workflow le demande à `gh` ; ce script ne
#              parle pas au réseau, c'est ce qui le rend éprouvable
#              (tests/unit/sentinelle-ci-paths-ignore.test.js, bloc 2).
#   REPO_ROOT  racine du dépôt (défaut : `git rev-parse --show-toplevel`).
#
# Sortie : UNE ligne, `oui<TAB>raison` ou `non<TAB>raison`. Code 0 toujours.
# ⚠ DANS LE DOUTE, ON JUGE. Base inconnue, introuvable, liste illisible : `oui`.
# Sauter un verdict sans avoir pu lire la règle, c'est le silence de #756.

set -uo pipefail

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null)}"
EVENEMENT="${EVENEMENT:-}"
DERNIER="${DERNIER:-}"

# shellcheck source=scripts/lot-observable.sh
. "$REPO_ROOT/scripts/lot-observable.sh"

rendre() { printf '%s\t%s\n' "$1" "$2"; exit 0; }

if [ "$EVENEMENT" != "schedule" ]; then
    rendre oui "lancé à la demande ($EVENEMENT) : on juge, sans garde"
fi

if [ -z "$DERNIER" ]; then
    rendre oui "aucun run planifié conclu n'est connu : on juge tout"
fi

if ! git -C "$REPO_ROOT" cat-file -e "$DERNIER^{commit}" 2>/dev/null; then
    rendre oui "le dernier SHA jugé ($DERNIER) est introuvable dans l'historique : on juge tout"
fi

COURT=$(printf '%s' "$DERNIER" | cut -c1-8)
FICHIERS=$(git -C "$REPO_ROOT" diff --name-only "$DERNIER" HEAD 2>/dev/null) \
    || rendre oui "le diff depuis $COURT a échoué : on juge tout"

if [ -z "$FICHIERS" ]; then
    rendre non "main n'a pas bougé depuis le dernier run planifié conclu ($COURT)"
fi

if printf '%s\n' "$FICHIERS" | lot_observable; then
    rendre oui "du code observable au navigateur a bougé depuis $COURT"
fi

rendre non "$(printf '%s\n' "$FICHIERS" | grep -c .) fichier(s) changé(s) depuis $COURT, aucun observable au navigateur"
