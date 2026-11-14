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
# Ce script renverse l'ordre : le jugement d'abord, la connexion ensuite.
#
# LE JUGE A CHANGÉ LE 14 NOV. 2026 (décision de Grégoire, qui revient sur celle du
# 10 oct.). Ce script ne lance plus la suite entière sur le Mac (111 min le 13 nov.,
# machine immobilisée). Le jugement d'un commit tient en deux parts :
#   1. le verdict du NUAGE — GitHub, 20 machines, une demi-heure, lancé sur la
#      branche une fois poussée (scripts/verdict-nuage.mjs --lancer, ou du téléphone).
#      Ici, il est seulement RELEVÉ pour le commit qui part ;
#   2. le COMPLÉMENT du Mac — scripts/complement-mac.mjs : ce que Linux ne juge pas,
#      quelques minutes, lancé ici s'il n'est pas déjà vert pour ce commit.
# Deux cas, donc :
#   · une branche de LOT part AVANT son verdict (GitHub juge ce qu'il a reçu) : ce
#     script la pousse et dit comment la faire juger ;
#   · `main` ne reçoit par ce script qu'un commit JUGÉ : sans verdict du nuage vert
#     pour ce SHA, rien ne part. On juge la branche, puis on avance `main` dessus.
# Le verdict complet du Mac reste possible (node scripts/verdict-en-morceaux.mjs) et
# le crochet l'accepte à lui seul ; plus rien ne l'exige.
#
# USAGE
#   scripts/pousser.sh              # pousse la branche courante vers origin
#   scripts/pousser.sh origin main  # arguments passés tels quels à git push ; « main »
#                                   # doit être la branche courante (#980)
#
# Le jugement n'est demandé que si le lot emporte du code observable au
# navigateur ; un push documentaire part directement.

set -eu

# LA GARDE DE CHARGE — SES SEUILS, ET LA MESURE QUI LES JUSTIFIE (#685, 19 sept. 2026)
# -----------------------------------------------------------------------------------
# Mesure : plans de travail/MESURE-2026-09-19-specs-au-second-essai.md (machine à 8 cœurs,
# 10 passes par spec, --retries=0, charge 1 min relevée avant chaque passe).
#
#   · Au repos (charge 2 à 4) : triptyque 10/10, planif-toolbar 10/10. Le 18 sept., un même
#     SHA rouge au verdict lancé à charge 48 était vert 3/3 à charge 3, et la suite entière
#     verte à charge 2,6.
#   · Sous charge, ce qui rougit n'est PAS une assertion : c'est le plafond de 30 s par
#     essai (« Tearing down "context" exceeded the test timeout »). planif-toolbar, 6,5 s
#     par essai au repos, en met 22 à 37 sous charge 78–186 (9/10). Un verdict rendu sous
#     charge ne dit donc rien du code — et un « vert au second essai » non plus.
#   · Le Vitest complet, à lui seul, porte la charge 1 min à 78 ; elle repasse sous 4 en
#     4 à 6 min (mesuré deux fois : 230 s et 320 s).
#
# CHARGE_SEUIL = 8, le nombre de cœurs : au-dessus, des processus attendent leur tour.
#   Volontairement prudent — des passes ont été vertes bien plus haut, mais attendre coûte
#   quelques minutes, et un verdict faussé en a coûté 70 le 18 sept.
# CHARGE_PLAFOND_S = 900 : deux à trois fois le temps que met la charge d'un Vitest à
#   retomber. Ce qui dure plus longtemps (une sauvegarde Time Machine) ne se règle pas en
#   attendant : on NE LANCE PAS, on le dit, et on revient.
# CHARGE_PAS_S = 30 : un relevé, une ligne.
#
# ⚠ NON ÉPROUVÉ : la charge DISQUE. La contre-épreuve du 19 fabriquait une charge
#   processeur ; la sauvegarde Time Machine du 18 (charge 93, six specs au second essai)
#   pèse sur le disque, et l'application se charge par file://. La charge moyenne la voit
#   monter (93 ce jour-là), mais rien ne prouve que ce seuil-ci la juge bien.
# ⚠ La garde juge le LANCEMENT, pas la durée du complément : une charge qui arrive
#   pendant qu'il tourne n'est pas vue (#987 : mesure du 29 sept., sur la suite entière).
#
# Les trois variables LABO_* servent à la sentinelle et à la démonstration sous charge
# fabriquée. Lever le seuil pour forcer un lancement est un geste explicite, jamais un défaut.
CHARGE_SEUIL="${LABO_CHARGE_SEUIL:-8}"
CHARGE_PLAFOND_S="${LABO_CHARGE_PLAFOND_S:-900}"
CHARGE_PAS_S="${LABO_CHARGE_PAS_S:-30}"

ROUGE='\033[0;31m'
VERT='\033[0;32m'
JAUNE='\033[0;33m'
RAZ='\033[0m'

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

BRANCHE=$(git rev-parse --abbrev-ref HEAD)
DISTANTE="origin/$BRANCHE"

# #980 — une référence qui n'est pas la branche courante est refusée : le verdict jouerait
# l'arbre de travail, pas ce qui part (scripts/ref-poussee.sh).
. "$REPO_ROOT/scripts/ref-poussee.sh"
ref_poussee_conforme "$BRANCHE" "$@" || exit 1

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
. "$REPO_ROOT/scripts/garde-charge.sh"

LANCER=0
if [ -z "$FICHIERS" ]; then
    LANCER=1
elif printf '%s\n' "$FICHIERS" | lot_observable; then
    LANCER=1
fi

JUGER_APRES=0
if [ $LANCER -eq 1 ]; then
    # 1. Le verdict du NUAGE, relevé pour le commit qui part. Aucune suite n'est lancée
    #    ici : le script interroge GitHub et écrit sa part du jeton, que le hook lira.
    #    `set -e` ne doit pas tuer le script sur un code non nul : c'est nous qui décidons.
    printf "${VERT}→ Verdict du nuage pour ce commit, AVANT d'ouvrir la connexion...${RAZ}\n"
    set +e
    node "$REPO_ROOT/scripts/verdict-nuage.mjs"
    CODE_NUAGE=$?
    set -e

    if [ $CODE_NUAGE -eq 1 ]; then
        printf "\n${ROUGE}✗ Le nuage a jugé ce commit ROUGE — rien n'a été poussé.${RAZ}\n"
        exit 1
    fi

    if [ $CODE_NUAGE -ne 0 ]; then
        # Pas de verdict vert pour ce SHA (pas lancé, en cours, ou illisible d'ici).
        if [ "$BRANCHE" = "main" ]; then
            printf "\n${ROUGE}✗ main ne reçoit qu'un commit jugé : aucun verdict du nuage vert pour ce SHA — rien n'a été poussé.${RAZ}\n"
            printf "  Juge la branche du lot (poussée), puis avance main dessus :\n"
            printf "      ${VERT}node scripts/verdict-nuage.mjs --lancer${RAZ}   (du téléphone : Actions ▸ Tests ▸ Run workflow ▸ la branche)\n"
            exit 3
        fi
        # Une branche de lot part AVANT son verdict : GitHub juge ce qu'il a reçu.
        printf "${JAUNE}→ Branche de lot : elle part avant son verdict.${RAZ}\n"
        JUGER_APRES=1
    else
        # 2. Le COMPLÉMENT du Mac : ce que Linux ne juge pas. Il se tait s'il est déjà
        #    vert pour ce commit. La garde de charge passe AVANT : un essai joué sous
        #    charge ne juge pas le code (seuils et mesure en tête de ce script). Plafond
        #    atteint : on ne lance pas, on ne pousse pas — aucun lancement par défaut.
        set +e
        attendre_charge_basse
        CODE_CHARGE=$?
        set -e
        if [ $CODE_CHARGE -ne 0 ]; then
            exit 3
        fi

        printf "${VERT}→ Complément du Mac, AVANT d'ouvrir la connexion (quelques minutes)...${RAZ}\n"
        set +e
        node "$REPO_ROOT/scripts/complement-mac.mjs"
        CODE_PW=$?
        set -e

        if [ $CODE_PW -eq 1 ]; then
            printf "\n${ROUGE}✗ Rougeur au complément du Mac — rien n'a été poussé.${RAZ}\n"
            exit 1
        fi
        # Un complément non jugé (essai de la liste non joué, arbre faussé) n'est pas un
        # vert : comme la garde de charge, on ne pousse pas ; le hook, lui, laisserait passer.
        if [ $CODE_PW -ne 0 ]; then
            printf "\n${ROUGE}✗ Complément du Mac non jugé (raison ci-dessus) — rien n'a été poussé.${RAZ}\n"
            exit 3
        fi
    fi
else
    printf "${VERT}✓ Sentinelle Playwright : sans objet (aucun code observable dans ce lot).${RAZ}\n"
fi

printf "${VERT}→ Push (le hook enchaîne Vitest, puis lit le jugement)...${RAZ}\n"

if [ $# -gt 0 ]; then
    git push "$@"
else
    git push origin "$BRANCHE"
fi

printf "${VERT}✓ Poussé.${RAZ}\n"

if [ $JUGER_APRES -eq 1 ]; then
    printf "\n${JAUNE}Cette branche n'est pas encore jugée. Avant de la fusionner dans main :${RAZ}\n"
    printf "      ${VERT}node scripts/verdict-nuage.mjs --lancer${RAZ}   le verdict du nuage (une demi-heure, Mac libre)\n"
    printf "        (du téléphone : application GitHub ▸ Actions ▸ Tests ▸ Run workflow ▸ %s)\n" "$BRANCHE"
    printf "      ${VERT}node scripts/complement-mac.mjs${RAZ}          ce que Linux ne juge pas (quelques minutes)\n"
fi
