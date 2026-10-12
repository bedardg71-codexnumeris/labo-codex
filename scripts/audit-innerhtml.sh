#!/usr/bin/env bash
#
# Audit de la dette innerHTML dans le code Labo Codex.
# Implémente l'étape 1 de la Défense E (cf. MODELE-MENACES.md §I-01, §8.2).
#
# Pour chaque fichier .js du projet, classifie les `.innerHTML = ` et
# `.innerHTML += ` en quatre catégories :
#
#   - secure    : utilise echapperHtml() ou escapeHtml() sur la même ligne (sain)
#   - static    : pas d'interpolation détectée (sain — contenu littéral)
#   - suspect   : interpolation détectée SANS echapperHtml (à auditer
#                 manuellement — peut être un faux positif si la variable
#                 est elle-même issue d'une fonction qui échappe)
#   - autre     : ne tombe dans aucune catégorie (à inspecter)
#
# Usage :
#   ./scripts/audit-innerhtml.sh                  # rapport synthétique stdout
#   ./scripts/audit-innerhtml.sh --details        # ajoute les lignes suspects
#   ./scripts/audit-innerhtml.sh --md > rapport.md  # sortie markdown
#
# Limites :
# - Heuristique sur une seule ligne. Un innerHTML construit sur plusieurs
#   lignes via une variable intermédiaire passe en « static » à tort.
# - Faux positifs : un innerHTML qui interpole une variable déjà sûre par
#   construction (constante, ID interne) est marqué « suspect ».
# - Ne couvre pas insertAdjacentHTML, outerHTML, document.write —
#   à ajouter si la dette se déplace.

set -u

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
JS_DIR="$ROOT_DIR/js"
MODE_DETAILS=0
MODE_MD=0

for arg in "$@"; do
    case "$arg" in
        --details) MODE_DETAILS=1 ;;
        --md) MODE_MD=1 ;;
    esac
done

# Modules d'affichage prioritaires (cf. MODELE-MENACES.md §8.2 défense E).
PRIORITAIRES="grilles.js echelles.js cartouches.js pratiques.js productions.js tampons-bibliotheque.js evaluation.js evaluations-apercu.js wizard-pratique-v2.js bibliotheque-ui.js"

# Patterns d'interpolation : ${...}, ' +, " +, + ', + "
PATTERN_INTERP='\$\{|'\''[[:space:]]*\+|"[[:space:]]*\+|\+[[:space:]]*'\''|\+[[:space:]]*"'

audit_fichier() {
    local f="$1"
    local total=0 secure=0 static=0 suspect=0 autre=0
    local lignes_suspect=""

    # Liste les lignes contenant .innerHTML = ou += (pas innerHTML lu seul).
    while IFS= read -r ligne; do
        [ -z "$ligne" ] && continue
        local n=$(printf '%s' "$ligne" | cut -d: -f1)
        local contenu=$(printf '%s' "$ligne" | cut -d: -f2-)
        total=$((total + 1))

        # Bloc de contexte : la ligne courante + 4 lignes suivantes
        # (le template literal qui suit `.innerHTML = '...' +` peut contenir
        # echapperHtml/escapeHtml sur les lignes suivantes).
        local extrait
        extrait=$(sed -n "${n},$((n + 4))p" "$f")

        local a_interp=0
        local a_echappe=0

        if printf '%s' "$extrait" | grep -qE "$PATTERN_INTERP"; then a_interp=1; fi
        # Détecter les deux variantes : echapperHtml (français) et escapeHtml
        # (anglaise, dans export-pdf.js et donnees-v2.js — implémentation
        # équivalente via createElement+textContent).
        if printf '%s' "$extrait" | grep -qE 'echapperHtml|escapeHtml'; then a_echappe=1; fi

        if [ $a_echappe -eq 1 ]; then
            secure=$((secure + 1))
        elif [ $a_interp -eq 1 ]; then
            suspect=$((suspect + 1))
            lignes_suspect="${lignes_suspect}${n}|${contenu}|"
        elif [ $a_interp -eq 0 ]; then
            static=$((static + 1))
        else
            autre=$((autre + 1))
        fi
    done < <(grep -nE '\.innerHTML[[:space:]]*[+]?=' "$f" 2>/dev/null)

    # Sortie : nom_fichier total secure static suspect lignes_suspect_pipe_separated
    printf '%s\t%d\t%d\t%d\t%d\t%s\n' "$(basename "$f")" "$total" "$secure" "$static" "$suspect" "$lignes_suspect"
}

# Collecte tous les fichiers .js et accumule les compteurs.
TOTAL_GLOBAL=0
SECURE_GLOBAL=0
STATIC_GLOBAL=0
SUSPECT_GLOBAL=0

# Fichier temporaire pour stocker le rapport par fichier.
TMP_RAPPORT=$(mktemp -t labo-codex-audit-innerhtml.XXXXXX)
trap 'rm -f "$TMP_RAPPORT"' EXIT

for f in "$JS_DIR"/*.js; do
    [ -f "$f" ] || continue
    line=$(audit_fichier "$f")
    nom=$(printf '%s' "$line" | cut -f1)
    total=$(printf '%s' "$line" | cut -f2)
    secure=$(printf '%s' "$line" | cut -f3)
    static=$(printf '%s' "$line" | cut -f4)
    suspect=$(printf '%s' "$line" | cut -f5)

    if [ "$total" -gt 0 ]; then
        printf '%s\n' "$line" >> "$TMP_RAPPORT"
        TOTAL_GLOBAL=$((TOTAL_GLOBAL + total))
        SECURE_GLOBAL=$((SECURE_GLOBAL + secure))
        STATIC_GLOBAL=$((STATIC_GLOBAL + static))
        SUSPECT_GLOBAL=$((SUSPECT_GLOBAL + suspect))
    fi
done

# === Sortie ===

if [ $MODE_MD -eq 1 ]; then
    # ---- Sortie Markdown ----
    cat <<EOF
# Audit innerHTML — $(date +%Y-%m-%d)

> Rapport généré automatiquement par \`scripts/audit-innerhtml.sh\`. Implémente l'étape 1 de la Défense E (cf. \`MODELE-MENACES.md\` §I-01, §8.2).

## Méthodologie

Pour chaque fichier \`js/*.js\`, recense les \`.innerHTML = \` et \`.innerHTML += \`. Classifie chaque ligne en :

- **secure** : contient \`echapperHtml\` ou \`escapeHtml\` sur la ligne courante OU dans les 4 lignes suivantes (template literal multi-ligne). Deux fonctions équivalentes coexistent dans le code, créées via \`createElement+textContent\`.
- **static** : pas de pattern d'interpolation détecté (\`\${...}\`, \`' +\`, \`" +\`, \`+ '\`, \`+ "\`).
- **suspect** : interpolation détectée SANS échappement (ni \`echapperHtml\` ni \`escapeHtml\`) — à auditer manuellement.

**Limites** : (1) heuristique sur 5 lignes (la ligne courante + 4 suivantes) — un \`innerHTML\` dont le payload est construit via une variable assainie BIEN AVANT est marqué « suspect » à tort. (2) Un \`innerHTML\` qui interpole une variable sûre par construction (URL blob, ID interne, nombre calculé) est aussi marqué « suspect » — faux positif.

## Synthèse globale

| Métrique | Valeur |
|---|---|
| Fichiers audités | $(ls "$JS_DIR"/*.js 2>/dev/null | wc -l | tr -d ' ') |
| Fichiers contenant au moins un innerHTML | $(wc -l < "$TMP_RAPPORT" | tr -d ' ') |
| Total \`.innerHTML =\`/\`+= \` | $TOTAL_GLOBAL |
| Sécurisé (echapperHtml) | $SECURE_GLOBAL |
| Statique (sans interpolation) | $STATIC_GLOBAL |
| **Suspect (interpolation sans echapperHtml)** | **$SUSPECT_GLOBAL** |

## Détail par fichier (modules avec innerHTML)

| Fichier | Total | Sécurisé | Statique | **Suspect** |
|---|---:|---:|---:|---:|
EOF
    # Trier par nombre de suspects décroissant
    sort -t$'\t' -k5,5 -nr "$TMP_RAPPORT" | while IFS=$'\t' read -r nom total secure static suspect lignes_suspect; do
        if [ "$suspect" -gt 0 ]; then
            printf '| %s | %s | %s | %s | **%s** |\n' "$nom" "$total" "$secure" "$static" "$suspect"
        else
            printf '| %s | %s | %s | %s | %s |\n' "$nom" "$total" "$secure" "$static" "$suspect"
        fi
    done

    cat <<EOF

## Modules prioritaires

Selon \`MODELE-MENACES.md\` §8.2 défense E, ces modules sont les plus exposés (rendent du contenu utilisateur partagé) :

EOF
    for p in $PRIORITAIRES; do
        ligne=$(grep -E "^$p"$'\t' "$TMP_RAPPORT" 2>/dev/null || true)
        if [ -n "$ligne" ]; then
            total=$(printf '%s' "$ligne" | cut -f2)
            secure=$(printf '%s' "$ligne" | cut -f3)
            static=$(printf '%s' "$ligne" | cut -f4)
            suspect=$(printf '%s' "$ligne" | cut -f5)
            if [ "$suspect" -gt 0 ]; then
                printf -- '- ⚠ **%s** : %s suspect / %s total (sécurisé %s, statique %s)\n' "$p" "$suspect" "$total" "$secure" "$static"
            else
                printf -- '- ✓ **%s** : %s total (sécurisé %s, statique %s, suspect 0)\n' "$p" "$total" "$secure" "$static"
            fi
        else
            printf -- '- — **%s** : aucun innerHTML\n' "$p"
        fi
    done

    if [ $SUSPECT_GLOBAL -gt 0 ]; then
        cat <<EOF

## Cas suspects à inspecter manuellement

EOF
        sort -t$'\t' -k5,5 -nr "$TMP_RAPPORT" | while IFS=$'\t' read -r nom total secure static suspect lignes_suspect; do
            if [ "$suspect" -gt 0 ]; then
                printf '\n### %s (%s cas)\n\n' "$nom" "$suspect"
                # Découper les lignes (séparées par '|')
                printf '%s' "$lignes_suspect" | tr '|' '\n' | while IFS= read -r entree; do
                    [ -z "$entree" ] && continue
                    # Lignes par paires : numero, contenu — cf. format dans audit_fichier
                    if printf '%s' "$entree" | grep -qE '^[0-9]+$'; then
                        printf -- '- `%s:%s` ' "$nom" "$entree"
                    else
                        # Tronquer à 120 chars pour la lisibilité
                        echo " — \`$(printf '%s' "$entree" | cut -c1-120)\`"
                    fi
                done
            fi
        done
    fi

    cat <<EOF

## Recommandations

1. **Si Suspect global > 0** : auditer chaque cas listé ci-dessus. Distinguer les vrais XSS potentiels (interpolation de données utilisateur externes) des faux positifs (interpolation de constantes ou d'IDs internes).
2. **Pour chaque vrai cas** : convertir en \`textContent\` (si texte simple) ou en construction DOM (\`createElement + appendChild\`, si structure). \`echapperHtml()\` reste un pansement acceptable en transition.
3. **Modules prioritaires** : traiter en premier ceux qui rendent du contenu de bibliothèque partagée (grilles, échelles, cartouches, pratiques, productions, tampons-bibliotheque, bibliotheque-ui).
4. **Re-exécuter ce script** après chaque vague de migration pour mesurer la progression.

## Référence

Modèle de menaces : \`docs/securite/MODELE-MENACES.md\` §I-01 (mécanique XSS), §8.2 défense E (plan de migration).
EOF
else
    # ---- Sortie console synthétique ----
    printf '\n=== Audit innerHTML — Labo Codex ===\n'
    printf 'Date : %s\n\n' "$(date +%Y-%m-%d\ %H:%M)"
    printf 'Total .innerHTML : %d\n' "$TOTAL_GLOBAL"
    printf '  ✓ Sécurisé (echapperHtml) : %d\n' "$SECURE_GLOBAL"
    printf '  · Statique (sans interpolation) : %d\n' "$STATIC_GLOBAL"
    printf '  ⚠ Suspect (interpolation sans echapperHtml) : %d\n\n' "$SUSPECT_GLOBAL"

    printf 'Top fichiers par nombre de suspects :\n\n'
    printf '%-40s %6s %6s %6s %6s\n' 'Fichier' 'Total' 'Sec.' 'Stat.' 'Susp.'
    printf '%-40s %6s %6s %6s %6s\n' '----' '-----' '----' '-----' '-----'
    sort -t$'\t' -k5,5 -nr "$TMP_RAPPORT" | head -20 | while IFS=$'\t' read -r nom total secure static suspect _; do
        printf '%-40s %6s %6s %6s %6s\n' "$nom" "$total" "$secure" "$static" "$suspect"
    done

    if [ $MODE_DETAILS -eq 1 ] && [ $SUSPECT_GLOBAL -gt 0 ]; then
        printf '\n=== Cas suspects ===\n'
        sort -t$'\t' -k5,5 -nr "$TMP_RAPPORT" | while IFS=$'\t' read -r nom total secure static suspect lignes_suspect; do
            if [ "$suspect" -gt 0 ]; then
                printf '\n--- %s ---\n' "$nom"
                printf '%s' "$lignes_suspect" | tr '|' '\n' | while IFS= read -r entree; do
                    [ -z "$entree" ] && continue
                    if printf '%s' "$entree" | grep -qE '^[0-9]+$'; then
                        printf '  L%s : ' "$entree"
                    else
                        printf '%s\n' "$entree" | cut -c1-150
                    fi
                done
            fi
        done
    fi
    printf '\n'
fi
