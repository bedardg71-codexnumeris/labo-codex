# Fragment sourcé par scripts/pousser.sh — la garde de charge (#685, 19 sept. 2026).
#
# CE QU'IL FAIT
# -------------
# Avant de lancer la sentinelle Playwright, on relève la charge de la machine.
# Au-dessus du seuil on ATTEND, en redisant la charge à chaque relevé. Si le
# plafond de temps est atteint sans que la charge soit redescendue, on NE LANCE
# PAS : code 3, une ligne qui dit la charge relevée et la durée attendue.
# Il n'y a aucun lancement par défaut — c'est le défaut de la boucle improvisée
# en session le 18 sept., qui abandonnait après 5 min « et lançait quand même ».
#
# Les seuils ne vivent PAS ici : ils sont en tête de pousser.sh, nommés, avec la
# mesure qui les justifie. Ce fragment lit CHARGE_SEUIL, CHARGE_PLAFOND_S et
# CHARGE_PAS_S.
#
# La charge PENDANT la suite n'est pas jugée ici : l'éveil, les veilles et la
# mémoire de la suite sont gardés dans verifier-playwright.mjs (#1008).
#
# Un fragment à part pour la même raison que lot-observable.sh : une sentinelle
# peut le sourcer et remplacer `lire_charge`, sans toucher à la machine.

# Charge moyenne sur 1 min, point décimal. Rien si elle est illisible.
# macOS rend « { 3,78 12,41 10,81 } » — virgule comprise, selon la langue.
lire_charge() {
    local brut=''
    if [ -r /proc/loadavg ]; then
        brut=$(cut -d' ' -f1 /proc/loadavg)
    else
        brut=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}')
    fi
    printf '%s' "$brut" | tr ',' '.'
}

_charge_est_un_nombre() {
    printf '%s' "$1" | grep -qE '^[0-9]+(\.[0-9]+)?$'
}

_charge_sous_le_seuil() {
    awk -v c="$1" -v s="$2" 'BEGIN { exit !(c + 0 < s + 0) }'
}

# Rend 0 : on peut lancer. Rend 3 : plafond atteint, on ne lance pas.
attendre_charge_basse() {
    local attendu=0 charge pas="$CHARGE_PAS_S"
    # Un pas nul ferait une boucle qui n'avance jamais vers son plafond.
    [ "$pas" -ge 1 ] 2>/dev/null || pas=1

    while :; do
        charge=$(lire_charge)

        # Illisible n'est pas « trop haute » : on ne sait pas, et on le dit.
        # Bloquer tout push sur une machine qu'on ne sait pas lire apprendrait
        # à contourner le script ; ce cas n'est PAS le plafond atteint.
        if ! _charge_est_un_nombre "$charge"; then
            printf "${JAUNE:-}⚠ Charge de la machine illisible — la garde de charge ne juge pas, le verdict part sans elle.${RAZ:-}\n"
            return 0
        fi

        if _charge_sous_le_seuil "$charge" "$CHARGE_SEUIL"; then
            if [ "$attendu" -gt 0 ]; then
                printf "${VERT:-}✓ Charge %s, sous le seuil de %s après %s s d'attente.${RAZ:-}\n" "$charge" "$CHARGE_SEUIL" "$attendu"
            else
                printf "${VERT:-}✓ Charge %s, sous le seuil de %s.${RAZ:-}\n" "$charge" "$CHARGE_SEUIL"
            fi
            return 0
        fi

        if [ "$attendu" -ge "$CHARGE_PLAFOND_S" ]; then
            printf "${ROUGE:-}✗ Verdict NON LANCÉ, rien n'a été poussé : charge %s après %s s d'attente (seuil %s, plafond %s s). Relancer quand la machine est au repos.${RAZ:-}\n" \
                "$charge" "$attendu" "$CHARGE_SEUIL" "$CHARGE_PLAFOND_S"
            return 3
        fi

        printf "${JAUNE:-}… charge %s, au-dessus du seuil de %s — on attend (%s s sur %s).${RAZ:-}\n" \
            "$charge" "$CHARGE_SEUIL" "$attendu" "$CHARGE_PLAFOND_S"
        sleep "$pas"
        attendu=$((attendu + pas))
    done
}
