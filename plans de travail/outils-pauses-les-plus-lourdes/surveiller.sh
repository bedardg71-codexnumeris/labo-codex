#!/bin/zsh
# Relève chaque minute la charge, le swap, la pression mémoire et les 10 plus gros processus.
# Écrit ligne à ligne (sans tampon) : la trace survit si le Mac sature.
# usage : surveiller.sh <sortie.log>   — s'arrête avec kill.
OUT=$1
while true; do
  {
    echo "=== $(date '+%Y-%m-%d %H:%M:%S')"
    uptime
    sysctl -n vm.swapusage
    memory_pressure -Q 2>/dev/null | tail -1
    ps -Ao pid,rss,%cpu,comm -m | head -11 | awk 'NR==1{print;next}{printf "%s %7.0f Mo %s ", $1, $2/1024, $3; $1=$2=$3=""; sub(/^ +/,""); n=split($0,a,"/"); print a[n]}'
  } >> $OUT
  sync
  sleep 60
done
