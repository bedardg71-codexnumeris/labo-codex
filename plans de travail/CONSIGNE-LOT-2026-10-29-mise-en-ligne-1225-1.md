# Consigne – Mettre en ligne la retouche de la fusion, en 1.225.1 (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 18 h 44 (Toronto, mesuré par `date`), sur `main` = `4b87128d` (2 commits d'avance sur `origin/main` = `746426c2`). **Au signal de Grégoire : le coller est son signal.** Urgent, à sa demande : il attend cette version pour fusionner.
> Relecture : `VERDICT-RELECTURE-2026-10-29-fusion-retouche-valeurs-indefinies.md`, **accepté**.

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`. Les fichiers des lots 4 et 5 non commités restent hors des commits : mets-les de côté le temps du verdict s'il le faut, sans les supprimer, puis remets-les.
- Commit de docs seul d'abord : ce fichier et le verdict de relecture.
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.

## 1. Les Nouvelles

**Aucune entrée neuve, aucun mot changé** : l'entrée 1.225 dit déjà ce que la fusion doit faire ; 1.225.1 la fait. Si le rituel exige un commentaire, il dit seulement la retouche (« faux conflits », #1182).

## 2. La version

`node scripts/release.mjs patch` (1.225.1), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur, sans veille (ce midi il était sur batterie : vérifie-le avant de lancer).

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le commit fautif ; le rapport va à Cowork.

## 4. Après le push

À dire à Grégoire tel quel : sur le Mac (Chrome, rechargé jusqu'à 1.225.1), « Fusionner avec un codex… » avec le dernier codex fait sur l'iPad. **Six conflits attendus** (trois copies, trois réglages). S'il en voit beaucoup plus, il tape 4 (annuler) et prévient Cowork.
