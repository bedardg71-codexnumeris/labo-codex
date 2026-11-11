#!/bin/zsh
# Série WebKit du second essai (11 nov. 2026) : une course à la fois, la mémoire lue avant chacune.
cd "$(dirname "$0")/../../tests"
D="../plans de travail/diag-2026-11-11-second-essai"
for f in parcours-fleches-2026-11-10 assistance-refus-2026-11-11 parcours-1-et-2-2026-11-08 parcours-2-ma-classe-2026-11-09 parcours-3-evaluer-2026-11-09 parcours-4-recevoir-et-rendre-2026-11-09 parcours-5-monter-ton-cours-2026-11-09 parcours-6-donnees-a-l-abri-2026-11-09 parcours-7-lire-ta-classe-2026-11-09 parcours-8-commentaires-2026-11-09 parcours-9-notation-alternative-2026-11-09; do
  echo "$f · $(memory_pressure | tail -1 | sed 's/System-wide memory free percentage: /mémoire libre /') · $(date +%H:%M:%S)" >> "$D/serie.log"
  npx playwright test "integration/$f.spec.js" --reporter=line --output="$D/res-$f" > "$D/$f.log" 2>&1
  grep -E '^\s+[0-9]+ (passed|failed|skipped|flaky)' "$D/$f.log" | tr '\n' ' ' >> "$D/serie.log"; echo >> "$D/serie.log"
done
for k in 1 2 3 4 5 6; do
  echo "parcours-2 ×$k · $(memory_pressure | tail -1 | sed 's/System-wide memory free percentage: /mémoire libre /') · $(date +%H:%M:%S)" >> "$D/serie.log"
  npx playwright test integration/parcours-2-ma-classe-2026-11-09.spec.js --reporter=line --output="$D/res-p2-$k" > "$D/p2-$k.log" 2>&1
  grep -E '^\s+[0-9]+ (passed|failed|skipped|flaky)' "$D/p2-$k.log" | tr '\n' ' ' >> "$D/serie.log"; echo >> "$D/serie.log"
done
echo "fin · $(date +%H:%M:%S)" >> "$D/serie.log"
