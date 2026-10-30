# Consigne – Mettre en ligne la 1.226 : le codex de l'iPad, la fenêtre de fusion, le lot 5 des standards (30 octobre 2026)

> Écrite par Cowork le vendredi 30 octobre 2026 à 5 h 42 (Toronto, mesuré par `date`), sur `main` = `df8cf722` (12 commits d'avance sur `origin/main` = `c176cb84`). **Au signal de Grégoire : le coller est son signal**, et vaut validation du texte du § 1, mot pour mot.
> Relectures, toutes **acceptées** : `VERDICT-RELECTURE-2026-10-29-codex-copies-aux-archives.md` (#1184), `VERDICT-RELECTURE-2026-10-29-fenetre-de-fusion.md` et `VERDICT-RELECTURE-2026-10-30-fenetre-de-fusion-retouche-et-standards-lot-5.md` (#1186, #1178 lot 5).

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`. Les fichiers non commités d'autres lots (verdict du lot 4, `plans de travail/captures/`) restent hors des commits : mets-les de côté le temps du verdict s'il le faut, sans les supprimer, puis remets-les.
- **Commit de docs seul d'abord** : ce fichier, le verdict du 30 oct., et `CONSIGNE-DEMARRAGE-COWORK.md` (document de Cowork : il part tel quel, sans que tu y touches). Inscris au BACKLOG la trouvaille du § 1.1 du verdict du 30 oct. (un seul séparateur de chemin, « › »).
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.

## 1. Les Nouvelles : une entrée, 1.226

Texte validé par Grégoire, mot pour mot, quand il a collé cette consigne. Insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. `couleur: 'bleu'`.

- Titre : « Une fenêtre de fusion lisible, et un codex qui garde sa taille »
1. « Fusionner avec un codex : deux colonnes, « Ici » et « L'autre codex », chacune nommée par son appareil. Chaque différence montre ce qui change de chaque côté ; rien n'est choisi pour toi, et « Fusionner » attend que chaque ligne ait sa version. »
2. « Le codex ne transporte plus les copies envoyées aux archives, même quand un autre appareil les a encore : il garde sa taille d'un appareil à l'autre. »
3. « Standards sans artefact : l'assistant et la fiche de la pratique parlent de productions, et le récit de la note dit « productions retenues ». Avec des artefacts, rien ne change. »
4. « Le rapport de bug reconnaît les PC Windows, Edge, Android et les Chromebooks. »

Si un mot se révèle faux à la mesure, **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.226.0), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur (vérifie-le), sans veille.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork.

## 4. Après le push

Les deux gestes à vérifier, à dire à Grégoire tels quels :

1. Sur l'iPad (rechargé jusqu'à 1.226.0) : ouvrir le dernier codex écrit par le Mac (après sa fusion, il a tout), puis « Mettre à jour le codex » : l'aperçu annonce environ 355 Mo, plus 1,5 Go.
2. À la prochaine fusion : la fenêtre en deux colonnes, rien de choisi d'office.
