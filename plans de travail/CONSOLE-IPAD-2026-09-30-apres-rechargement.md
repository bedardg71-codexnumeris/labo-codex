# Console Safari de l'iPad – 30 sept. 2026, après le rechargement (relevée par Grégoire, transmise à Cowork à 5 h 49)

> iPad, Safari 27, 1.170.0, codex réel. Relevée **après** le rechargement qui a tué la mise à jour du codex : elle ne voit pas l'instant de l'échec. Condensée par Cowork (les ~190 lignes « Quota dépassé » pour des vignettes sont résumées, pas recopiées).

```
[Error] Refused to load https://static.cloudflareinsights.com/beacon.min.js/… because it does not appear in the script-src directive of the Content Security Policy.
[Error] Refused to execute a script because its hash, its nonce, or 'unsafe-inline' does not appear in the script-src directive of the Content Security Policy. (app.codexnumeris.org, line 15458)
[Warning] [DB #353] localStorage à 85 % du quota (4335 K car. / 5120 K car., 600 clés). Aucune donnée en danger (durabilité A/B/C) — au-delà du quota les écritures basculent en memoryCache+IDB. Top clés : thumbnail_FT_… (25 K car.) ×5. (rapport-bug.js, line 316)
[Warning] ⚠️ Dates du trimestre manquantes, calendrier non généré (clé purgée)
[Warning]    ⚠️  Calendrier complet non disponible   (×2)
[Warning] [DEMO-INIT] Namespace demo_* initialisé (version 21.1, rafraîchi depuis 20.8)
[Warning] [DB] Quota localStorage dépassé pour "thumbnail_FT_<horodatage>_<n>_<id>" (4 à 25 Ko), utilisation cache mémoire   (≈ 190 lignes, vignettes de mars à septembre 2026)
[Warning] [DB] Quota localStorage dépassé pour "trimestres" (559 bytes), utilisation cache mémoire
[Warning] Canvas graphique-groupe-moyennes non visible (parent display:none) — graphique différé
[Warning] [Trajectoires] Canvas non visible — graphique différé
```

## Lecture de Cowork (inférences, à mesurer)

1. **Les deux refus CSP** : la ligne 15458 est la dernière ligne d'`index.html` (après `</html>`), là où Cloudflare injecte le balisage de Web Analytics. Le script de Cloudflare est refusé par la CSP stricte : sans effet sur l'application ; Cloudflare Web Analytics ne mesure donc rien sur l'app.
2. **Le stockage local est plein** : 85 % du quota, puis environ 190 vignettes et la clé `trimestres` basculent en cache mémoire + IDB. Poids en mémoire : quelques Mo, négligeable devant 1,33 Go ; ce n'est vraisemblablement pas la cause de la mort de l'onglet.
3. **À mesurer, possible défaut distinct** : au chargement, `js/trimestre.js` l. 91-94 ne trouve pas les dates du cadre et écrit `calendrierComplet = {}`, puis deux lecteurs trouvent le calendrier absent. Hypothèse : le cadre (dont la clé `trimestres` débordée) est lu avant que le repli IDB soit chargé. Si c'est vrai, le calendrier (séances, présences, assiduité) pourrait être vide ou faux au démarrage sur l'iPad. Non vérifié à l'écran.
4. **`[DEMO-INIT]` rafraîchit le namespace démo au chargement** dans le stockage réel de Grégoire : à mesurer ce qu'il pèse dans le quota.
