#!/bin/zsh
# usage : jouer.sh <fichier-liste> <etiquette> ; joue chaque spec seule, sans reprise, note durée et statut
cd /Users/kuekatsheu/Documents/GitHub/labo-codex/.claude/worktrees/pauses-les-plus-lourdes/tests
S=/private/tmp/claude-501/-Users-kuekatsheu-Documents-GitHub-labo-codex/642a25fe-927b-4f46-be68-5043c453a8dc/scratchpad
OUT=$S/res-$2.tsv; : > $OUT
for f in $(cat $1); do
  t0=$(perl -MTime::HiRes=time -e 'printf "%.1f", time')
  npx playwright test integration/$f --retries=0 --reporter=line > $S/log-$2-$f.txt 2>&1; rc=$?
  t1=$(perl -MTime::HiRes=time -e 'printf "%.1f", time')
  res=$(grep -Eo '[0-9]+ (passed|failed|skipped|flaky)' $S/log-$2-$f.txt | tr '\n' ' ')
  echo "$f\t$rc\t$(echo "$t1 - $t0" | bc)\t$res" >> $OUT
done
echo FINI >> $OUT
