#!/bin/zsh
# Joue chaque cause tardive : injecte, joue le seul test visé sans reprise, restaure.
cd /Users/kuekatsheu/Documents/GitHub/labo-codex/.claude/worktrees/pauses-les-plus-lourdes/tests
D=${0:A:h}; S=$(mktemp -d); git diff > $S/apres-lot.diff
OUT=${2:-$D/resultats/res-tardives.tsv}; : > $OUT
node -e "import('$D/causes.mjs').then(({CAUSES})=>{for(const [f,l] of Object.entries(CAUSES)) l.forEach((_,r)=>console.log(f+' '+r))})" | grep -- "${1:-.}" > $S/tardives-liste.txt
while read f r; do
  cp integration/$f $S/orig-$f
  info=$(node $D/injecter.mjs $f $r); ligne=${info%%$'\t'*}
  npx playwright test integration/$f:$ligne --retries=0 --reporter=line > $S/log-tardive-$f-$r.txt 2>&1; rc=$?
  cp $S/orig-$f integration/$f
  res=$(grep -Eo '[0-9]+ (passed|failed|skipped|flaky|did not run)' $S/log-tardive-$f-$r.txt | tr '\n' ' ')
  echo "$f\t$r\t$info\t$rc\t$res" >> $OUT
done < $S/tardives-liste.txt
cmp -s <(git diff) <(cat $S/apres-lot.diff) && echo "RESTAURÉ" >> $OUT || echo "ÉCART DE RESTAURATION" >> $OUT
echo FINI >> $OUT
