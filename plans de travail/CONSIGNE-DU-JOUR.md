# Consigne du jour – lot J0, suite : release 1.170.1 après relecture (#988)

> Écrite le 30 septembre 2026 à 6 h 30 (Toronto) par Cowork. Suit `VERDICT-RELECTURE-2026-09-30-lot-J0-codex-ipad.md` : **le lot part, sans correction**. Lis ce verdict d'abord.
> **Condition de départ** : branche `lot-j0-codex-ipad-memoire` à `4cbcdc12`, arbre propre côté code.

## Ce que tu fais

1. **Une ligne de commentaire** au-dessus de `morceaux.push(enTete, blob)` (`js/codex.js`) : le fichier n'est lu qu'à l'écriture, une copie retirée du stockage entre-temps ferait échouer l'écriture (remarque 1 du verdict). Rien d'autre dans le code.
2. **Deux inscriptions au BACKLOG** (table « Dispositions » du verdict) : « Exporter une sélection » à l'ancienne fabrication (sans priorité) ; le codex de plus de 2 Go qui ne se rouvre pas (priorité haute, avec l'extrapolation et sa réserve).
3. **Release en correctif : 1.170.1, sans entrée aux Nouvelles.** Si `scripts/release.mjs` exige une entrée pour un correctif, arrête-toi et dis-le : n'en compose pas une.
4. **Verdict Playwright complet** sur le commit de release, sous `caffeinate`.
5. Fusion dans `main`, push, « en ligne » lu chez Netlify, `RELAIS.md` rempli.
6. Dans `PORTES-TERRAIN-2026-09-30-lot-J0-codex-ipad.md`, inscris **1.170.1** à la rangée 0.1.

## Ce que tu ne fais pas

- Aucune ligne aux Nouvelles : elle attend la porte passée sur l'iPad.
- #988 reste aux bugs ouverts jusqu'à la porte.
- Rien sur « Exporter une sélection », rien sur la borne de 2 Go, rien sur #990 : inscrits, pas corrigés.

## Ce que tu rends à Grégoire

Trois lignes : le numéro de version en ligne, le verdict Playwright, et « la porte peut se faire ».
