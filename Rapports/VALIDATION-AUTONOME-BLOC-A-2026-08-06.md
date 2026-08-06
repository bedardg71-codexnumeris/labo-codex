# Validation AUTONOME du bloc A — vague 1.31.14 → 1.31.22 (6 août 2026, session cloud)

> **Mandat** : exécution autonome du bloc A du `plans de travail/PLAN-JOURNEE-2026-08-07.md`
> (consigne `VALIDATION-TERRAIN-2026-08-07-consigne.md`), demandée par Grégoire le 6 août.
> **Cadre honnête** : session Claude Code cloud, **sans** le codex réel h2026, **sans** Safari
> ni iPad. Banc = app servie statiquement + **Chromium headless** (Playwright, profil
> persistant) + **corpus DÉMO** (20 étudiants, ~200 évaluations, snapshots reconstruits).
> Ce que cette passe PROUVE : les contrats fonctionnels de la vague (cohérence STD,
> purge, zone « À vérifier », dates locales, listeners) et les gains mesurables en A/B
> sur banc identique. Ce qu'elle NE remplace PAS : les chiffres absolus sur le corpus
> réel (75 étu, 5,2 Mo), le ressenti Safari/iPad, et l'œil de Grégoire sur ses données.
> **Règle de la consigne respectée** : les écarts sont NOTÉS, rien n'a été réparé.
> Aucune écriture hors banc local (les seules écritures = données démo du profil
> Chromium jetable du conteneur ; test « non constructible » fait puis nettoyé).

## 0. Rituel de début de session (exécuté)

- Branche `claude/plan-journee-2026-08-07-csllh9` = tip d'`origin/main` (`0c90005`), arbre propre.
- **Vitest 1415/1415** en 29,6 s — conforme à la prémisse (§11 de la consigne).
- `version.json` : **1.31.22 / build 0805-1739** — conforme. Playwright WebKit non exécutable en cloud (limite connue) → CI à la PR.
- Écart de prémisse : aucun.

## 1. Méthode du banc

- App servie sur `http://localhost:8123` (python http.server), Chromium `/opt/pw-browsers`,
  profil persistant (localStorage/IDB survivent aux rechargements, comme un vrai poste).
- Mode démo activé par `activerModeDemo()` (le geste du toggle UI).
- **A/B pré/post-#401** : worktree au commit `a502163` (1.31.20) servi sur le même
  port/origine → mêmes données, même navigateur, seule la version du code change.
- **V6** : Chromium relancé avec fuseau `America/Toronto` et horloge fixée au
  **6 août 21h30 EDT** (= 7 août 01:30 UTC) — la fenêtre exacte du bug #398.
- Scripts jetables au scratchpad du conteneur, rien dans l'arbre git.

## 2. Grille §10 (adaptée au banc — colonnes « avant » = références terrain de la consigne)

| # | Étape | Avant (référence terrain) | Mesuré / constat (banc autonome) | ✓/✗ |
|---|---|---|---|---|
| 1 | V1 boot ×3 | 1057/962/729 ms (Safari, réel) | **Non concluant sur ce banc** : corpus démo trop petit pour voir le gain getAll (A/B pré/post dans le bruit : médianes ~480 vs ~520 ms de `db-ready`, outlier conteneur 6 s). **Aucune régression.** Le one-liner déclenche ~160 recalculs dépistage en cascade par itération (obs. O2) qui dominent la mesure. | ≈ (terrain dû) |
| 2 | V2 modal ×2 | 473/488 ms | **96/97 ms** sur 1.31.22 vs **457 ms** (1ʳᵉ ouverture) sur 1.31.20, banc identique → **×4,8**. 62 clés listées, **0 « ? Ko »**, toutes en Ko chiffrés. | ✓ |
| 3a | Recalcul assiduité ×2 | ~460 ms (audit, 75 étu) | **33/45 ms** (20 étu). Console muette pendant le run. | ✓ |
| 3b | Purge historique | — | **0/21 entrées** avec `historique` après recalcul. | ✓ |
| 4 | Cohérence STD | 82,67 vs 74,29 possible | **20/20 étudiants** : riche ≈ simulé = stocké (à l'arrondi d'affichage près), `noteConstructible` identique des deux côtés. Ex. DEMO001 : 67,16 / 67 / 67. | ✓ |
| 4b | Non constructible → « — » | affichait un nombre | Étudiant temporaire sans artefacts (ajout réversible, nettoyé) : stocké = enrichi = simulé = `{P:0, noteConstructible:false}` ; rendu « P — » garanti par `_badgeIndiceSuivi` (tableau-bord-apercu.js:390-392) + sentinelles #394. | ✓ |
| 5 | Zone « À vérifier » | n'existait pas | Patron conforme : avec terminale typée, la jetable « TEST-terminale » (travail, 15 %) reçoit le message **pondérée non participante SANS bouton** ; sans terminale typée (cas non ambigu), le bouton « Typer comme terminale » apparaît. Rendu DOM correct, échappé. ⚠ Zone **non muette sur corpus démo** : 9 avertissements légitimes (artefacts semés avec pondération 6,67 %) — obs. O4. | ✓ (2 obs.) |
| 6 | Dates en soirée | bascule à 20 h | Soirée **simulée** (21h30 EDT, fuseau Toronto) : `dateLocaleYMD()` = **2026-08-06** (aujourd'hui) ; l'ancien chemin UTC aurait dit 2026-08-07. | ✓ |
| 7 | Sidebar calendrier | 15 sem · 75 j (réel) | Démo : « Trimestre : 15 semaines • 30 jours de cours (aucun congé) » — cohérent avec le cadre démo. Golden #368 vert en suite. Chiffres officiels de Grégoire = coup d'œil terrain. | ✓ (léger) |
| 8 | Listeners nets | ~3×rendus (~30 après 10 bascules) | **0 listener net après 10 bascules A/C/P**, sur un graphique réellement rendu (20 courbes × 30 points, snapshots démo). C'était LA mesure « post-données » attendue à #400. | ✓ |
| 9 | iPad | — | Non exerçable en cloud. | terrain |

**Console pendant la passe** : aucun warning inattendu pendant V3/V4/V5/V8 hors
observations ci-dessous. 404 unique = `favicon.ico` (artefact du serveur statique local, bénin).

## 3. Observations consignées (rien réparé — triage au bloc C)

- **O1 — Flood « Pas de grille de référence - calcul moyennes critères récents impossible » sur corpus démo** (profil-etudiant-calculs.js:263, famille #354). ~160 warnings par recalcul en cascade, 284 au boot démo. Le jeu de démo n'a pas de grille de référence dépistage. Double impact : bruit console permanent en démo + friction pour le test onboarding (bloc B verra peut-être ce flood). Préexistant à la vague (pas une régression).
- **O2 — Le one-liner V1 déclenche des recalculs dépistage en cascade** (~8 × 20 étudiants par itération de `db.flush()`+`db.keys()`+`syncToLocalStorageCache()`). Page au repos : 0 warning en 6 s ; chaque itération V1 : 40-160. Les itérations 2+ de V1 mesurent donc AUSSI ces recalculs. À garder en tête pour interpréter les chiffres terrain V1 de Grégoire (sa 1ʳᵉ itération est la plus propre). Cause exacte non investiguée (hors mandat).
- **O3 — Entrée `indicesCP` orpheline non purgée** : après retrait d'un étudiant du groupe, `calculerEtStockerIndicesCP()` conserve son entrée. Résidu inoffensif (aucun lecteur ne l'affiche), probablement préexistant. Candidat entretien #402.
- **O4 — Zone « À vérifier » bruyante sur le corpus démo** : 9 lignes quasi identiques (« Artefact N est un artefact du pool : sa pondération (6.67 %) n'est pas utilisée »). Les avertissements sont FACTUELLEMENT corrects (règle 3a bis) — c'est le jeu de démo qui sème des pondérations sur les artefacts. Deux pistes distinctes : (a) nettoyer les pondérations d'artefacts du seed démo ; (b) 📐 regrouper les avertissements identiques (« 9 artefacts du pool portent une pondération inutilisée »).
- **O5 — Warnings de boot « [Migration] Aucun cours actif, impossible de migrer les étudiants/productions/présences »** vus à UN boot avec démo persistée (reproduits une seule fois). Possiblement un ordre d'init (migrations avant restauration des pointeurs démo). Non bloquant, à garder à l'œil.

## 4. Porte de sortie du bloc A (verdict de la passe autonome)

**Aucun ✗ bloquant sur tout ce qui est testable en autonome.** Les contrats de la
vague tiennent : cohérence STD 20/20, purge historique 0 résidu, patron « À vérifier »
conforme (bouton seulement sur cas non ambigu), dates locales correctes dans la fenêtre
du bug, 0 fuite de listeners, modal export ×4,8 avec Ko chiffrés.

**Reste dû au terrain (Grégoire, quand il le souhaite — la passe autonome ne les remplace pas)** :
1. **V1 chiffres réels** (boot re-sync sur le codex 5,2 Mo, Safari) — seule mesure où mon banc est non concluant ;
2. **V4 sur corpus h2026 réel** (3 étudiants contrastés, profil + tableau de bord + Exploration à l'œil) ;
3. **V5 sur son corpus** (zone muette attendue chez lui : terminale typée, conteneur pondéré, artefacts sans pondération) ;
4. **Étape 9 iPad** (boot, saisie présences, profil, 2 modes).

→ Selon la porte de sortie du plan : **le bloc B (test Catherine) peut s'ouvrir** —
rien de douteux détecté sur l'app. Nota : O1/O4 toucheront peut-être le test
onboarding (la démo est bruyante en console et la zone « À vérifier » parle beaucoup) ;
ce sont des frictions de SEED démo, pas des régressions de la vague.

## 5. Traçabilité

- Banc : scripts au scratchpad du conteneur (jetables) ; A/B via worktree `a502163` (retiré après mesure) ; arbre git propre à la clôture.
- Tests : Vitest 1415/1415 au début de la passe ; aucun code de l'app modifié pendant la passe.
