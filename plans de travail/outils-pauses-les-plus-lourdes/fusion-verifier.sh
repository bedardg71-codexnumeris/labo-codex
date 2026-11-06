#!/bin/zsh
# 6 nov. : dans le worktree de fusion, les 3 specs venues de main dont la pause après ouverture devient
# attendreApplication : une fois chacune, puis une cassure directe chacune (mutation, spec, restauration git).
# usage : fusion-verifier.sh <racine du worktree> <sortie.tsv>
R=$1; OUT=$2; D=${0:A:h}; S=$(mktemp -d); : > $OUT
cd $R/tests
for f in notifications-pile-1224.spec.js reunir-en-une-copie-1231.spec.js ajouter-pages-photo-droite.spec.js; do
  npx playwright test integration/$f --retries=0 --reporter=line > $S/log-$f.txt 2>&1; rc=$?
  echo "$f\tsaine\t$rc\t$(grep -Eo '[0-9]+ (passed|failed|skipped|flaky)' $S/log-$f.txt | tr '\n' ' ')" >> $OUT
done
for f in notifications-pile-1224.spec.js reunir-en-une-copie-1231.spec.js ajouter-pages-photo-droite.spec.js; do
  fic=$(node -e "
    const fs=require('fs'); const M=JSON.parse(fs.readFileSync('$D/mutations-fusion.json','utf8')); const m=M.find(x=>x.spec==='$f');
    const p='$R/'+m.fichier; const s=fs.readFileSync(p,'utf8'); if (s.split(m.ancien).length!==2) { console.error('ancien non unique'); process.exit(1); }
    fs.writeFileSync(p, s.replace(m.ancien, ()=>m.nouveau)); console.log(m.fichier);") || { echo "$f\tERREUR-MUTATION" >> $OUT; continue; }
  npx playwright test integration/$f --retries=0 --reporter=line > $S/log-mut-$f.txt 2>&1; rc=$?
  git -C $R checkout -- $fic
  echo "$f\tcassee ($fic)\t$rc\t$(grep -Eo '[0-9]+ (passed|failed|skipped|flaky)' $S/log-mut-$f.txt | tr '\n' ' ')" >> $OUT
done
[ -z "$(git -C $R status --porcelain -- js styles.css)" ] && echo "CODE PROPRE" >> $OUT || echo "CODE MODIFIÉ" >> $OUT
echo "journaux : $S" >> $OUT; echo FINI >> $OUT
