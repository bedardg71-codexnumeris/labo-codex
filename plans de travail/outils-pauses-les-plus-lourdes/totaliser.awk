# usage : LC_ALL=C awk -F'\t' -f totaliser.awk res-*.tsv — moyenne des « avant » et des « après » par spec, puis les totaux.
# Écarte un passage marqué en échec (code ≠ 0) : une durée sous saturation ou un rouge ne mesure pas la pause.
NF >= 4 && ($2 == "avant" || $2 == "apres") {
  if ($3 != 0) { ecartes = ecartes sprintf("  écarté : %s %s %.1f s (code %s, %s)\n", $1, $2, $4, $3, $5); next }
  s[$1, $2] += $4; n[$1, $2]++; f[$1] = 1
}
END {
  for (k in f) {
    if (!n[k, "avant"] || !n[k, "apres"]) { printf "%-60s incomplet\n", k; continue }
    a = s[k, "avant"] / n[k, "avant"]; p = s[k, "apres"] / n[k, "apres"]; A += a; P += p; N++
    printf "%-60s %7.1f %7.1f %6.1f\n", k, a, p, a - p
  }
  printf "TOTAL (%d specs) %.1f s -> %.1f s, %.1f %%\n", N, A, P, (P - A) / A * 100
  printf "%s", ecartes
}
