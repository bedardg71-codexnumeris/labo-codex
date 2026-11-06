#!/bin/zsh
# Une cassure directe par spec : mute js/, joue la spec entière sans reprise, restaure js/ par git.
cd /Users/kuekatsheu/Documents/GitHub/labo-codex/.claude/worktrees/pauses-les-plus-lourdes/tests
D=${0:A:h}; S=$(mktemp -d)
OUT=${2:-$D/resultats/res-mutations.tsv}; : > $OUT
for f in $(cat $1); do
  fic=$(node $D/muter.mjs $f) || { echo "$f\tERREUR-MUTATION" >> $OUT; continue; }
  npx playwright test integration/$f --retries=0 --reporter=line > $S/log-mutation-$f.txt 2>&1; rc=$?
  git -C .. checkout -- $fic
  res=$(grep -Eo '[0-9]+ (passed|failed|skipped|flaky|did not run)' $S/log-mutation-$f.txt | tr '\n' ' ')
  echo "$f\t$fic\t$rc\t$res" >> $OUT
done
[ -z "$(git -C .. status --porcelain -- js)" ] && echo "JS PROPRE" >> $OUT || echo "JS MODIFIÉ" >> $OUT
echo FINI >> $OUT
