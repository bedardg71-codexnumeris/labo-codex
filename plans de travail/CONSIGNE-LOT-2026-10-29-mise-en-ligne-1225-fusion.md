# Consigne – Mettre en ligne la fusion copie par copie, en 1.225 (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 15 h 37 (Toronto, mesuré par `date`), sur `main` = `6cae32aa` (3 commits d'avance sur `origin/main` = `d2f43d38`). **Au signal de Grégoire : le coller est son signal**, et vaut validation du texte du § 1, mot pour mot. Mise en ligne en urgence, à sa demande (il est bloqué : ses évaluations sont réparties entre deux appareils) ; il travaille sur l'iPad pendant le verdict.
> Relecture : `VERDICT-RELECTURE-2026-10-29-fusion-copie-par-copie.md`, **accepté**.

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`.
- Ne touche pas aux fichiers d'autres lots (verdict modifié du lot 4, textes du lot 5…) : mets-les de côté le temps du verdict s'il le faut, sans les supprimer, puis remets-les.
- **Commit de docs seul d'abord**, fichiers nommés : ce fichier, le verdict de relecture, `CONSIGNE-LOT-2026-10-29-codex-copies-aux-archives.md`. Inscris au BACKLOG la trouvaille du § 2 du verdict (la palette des tampons coupée en deux familles), avec son témoin.
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.

## 1. Les Nouvelles : une entrée, 1.225

Texte validé par Grégoire, mot pour mot, quand il a collé cette consigne (29 oct. 2026). Insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. `couleur: 'orange'`.

- Titre : « Fusionner deux codex sans rien perdre »
1. « Corrigé : « Fusionner avec un codex » réunit maintenant deux codex copie par copie. Les évaluations et les annotations faites sur deux appareils s'additionnent ; avant, celles d'un des deux pouvaient disparaître sans avertissement. »
2. « Une fusion n'efface rien : ce qui n'existe que d'un côté est gardé. Quand une même copie diffère des deux côtés, la fusion te montre sa date de modification de chaque côté et te laisse choisir. »

Si un mot se révèle faux à la mesure, **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.225.0), skill `release-et-changelog`. Mineure plutôt que correctif : la fusion a sa propre entrée, que le lot des copies aux archives rejoindra en 1.225.x. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur, sans veille.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork.

## 4. Après le push

Le geste à vérifier, à dire à Grégoire tel quel : sur le Mac (Chrome, après un rechargement qui montre 1.225.0), menu Codex › « Mettre à jour le codex » d'abord ; puis « Fusionner avec un codex… » avec **le dernier codex fait sur l'iPad**. Ne pas choisir « 1. Garder la version d'ici pour tous » : Cowork le guidera conflit par conflit.
