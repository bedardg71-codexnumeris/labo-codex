#!/bin/zsh
# Pour chaque spec : avant, après, après, avant — une à la fois, sans reprise.
# usage : mesurer.sh <fichier-liste> [ref-avant] [sortie.tsv]
#   « avant » = la spec à <ref-avant> (défaut 503ab091, le commit qui précède le lot) ;
#   « après » = la spec du répertoire de travail. Seule la spec change : l'aide du banc reste celle du lot.
cd /Users/kuekatsheu/Documents/GitHub/labo-codex/.claude/worktrees/pauses-les-plus-lourdes/tests
AVANT=${2:-503ab091}
OUT=${3:-$PWD/../plans\ de\ travail/outils-pauses-les-plus-lourdes/resultats/res-mesure.tsv}
S=$(mktemp -d); : > $OUT
git diff > $S/apres-lot.diff
for f in $(cat $1); do
  cp integration/$f $S/apres-$f
  git show ${AVANT}:tests/integration/$f > $S/avant-$f
  [ -s $S/avant-$f ] || { echo "$f\tAVANT VIDE : arrêt" >> $OUT; break; }
  for v in avant apres apres avant; do
    cp $S/$v-$f integration/$f
    t0=$(perl -MTime::HiRes=time -e 'printf "%.2f", time')
    npx playwright test integration/$f --retries=0 --reporter=line > $S/log-mesure-$v-$f.txt 2>&1; rc=$?
    t1=$(perl -MTime::HiRes=time -e 'printf "%.2f", time')
    res=$(grep -Eo '[0-9]+ (passed|failed|skipped|flaky)' $S/log-mesure-$v-$f.txt | tr '\n' ' ')
    echo "$f\t$v\t$rc\t$(echo "$t1 - $t0" | bc)\t$res" >> $OUT
  done
  cp $S/apres-$f integration/$f
done
cmp -s <(git diff) $S/apres-lot.diff && echo RESTAURÉ >> $OUT || echo "ÉCART DE RESTAURATION" >> $OUT
echo "journaux : $S" >> $OUT
echo FINI >> $OUT
