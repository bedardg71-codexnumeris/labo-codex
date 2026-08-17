Exécute le **rituel de fin de session** de Labo Codex en suivant
le skill `fin-de-session-labo-codex` (§1 → §6), appuyé sur
le skill `verification-adverse` (§4 break-test, §8 checklist de sortie).

NE te contente PAS de « la suite est verte » :

1. **§1 Inventaire** — `git status --porcelain` + `git diff --name-only HEAD` ; périmètre par dossier.
2. **§2 Audit sécurité statique** sur le diff — innerHTML sans `echapperHtml`, handlers inline `on…=`, `eval`/`new Function`, `console.log`. Signaler, ne pas corriger.
3. **§3 Tests** — `cd tests && npm run test:unit` (Playwright non lançable en cloud → le noter, CI). Reporter passés/échoués.
4. **§4 VÉRIFICATION ADVERSE (le cœur)** — pour CHAQUE sentinelle/test neuf ou modifié couvrant un correctif **données / sécurité / SSOT / garde-fou** : le faire **ROUGIR** (break-test : retirer le correctif ou réintroduire l'ablation → rouge attendu → restaurer, arbre propre) AVANT de lui faire confiance. Puis confronter chaque **affirmation chiffrée/de complétude** au diff/grep réel (récit↔code). Passe « connexions » : tous les écrivains de l'invariant partagé sont-ils couverts ?
5. **§5 Version** — bump via `node scripts/release.mjs <intention>` seulement si nécessaire (`major` = confirmer avec Grégoire).
6. **§6 Rapport** au format de la skill + **checklist de sortie (§8 du parent)** : chaque coche = un artefact factuel (sortie de test rouge, ligne de grep), jamais une opinion.

Lecture seule : ne RIEN corriger, ne RIEN committer/pousser sans demande explicite.
