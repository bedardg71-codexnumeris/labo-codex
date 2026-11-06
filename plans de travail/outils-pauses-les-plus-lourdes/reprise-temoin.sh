#!/bin/zsh
# 6 nov. : après le correctif du témoin dans attendreRepos, les 4 specs à horizon ≥ 2 s :
# mesure avant/après, cassure directe, cause tardive de 961. Une étape à la fois.
D=${0:A:h}; R=$D/resultats
$D/mesurer.sh $D/specs-temoin.txt 503ab091 $R/res-mesure-2026-11-06-temoin.tsv
$D/muter.sh $D/specs-temoin.txt $R/res-mutations-2026-11-06-temoin.tsv
$D/tardives.sh evaluation-961 $R/res-tardives-2026-11-06-temoin.tsv
