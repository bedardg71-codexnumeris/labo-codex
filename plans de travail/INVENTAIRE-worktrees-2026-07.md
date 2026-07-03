# INVENTAIRE — 5 worktrees à trier (juillet 2026)

> **Produit le 2 juillet 2026 (vague 2, Claude Code CLOUD), LECTURE SEULE.**
> Rien n'a été supprimé, committé ni modifié dans les worktrees. Le triage
> lui-même reste à Grégoire en août.
>
> **⚠ Limite structurelle de cet inventaire** : les worktrees vivent sur le
> Mac de Grégoire ; cette session cloud n'y a pas accès. Ce document croise
> (a) ce que les branches DISTANTES permettent de vérifier factuellement, et
> (b) ce que `SESSION.md`/les mémoires de sessions ont consigné. Les diffs
> NON COMMITTÉS d'un worktree (cas `wonderful`) sont invisibles d'ici — le
> protocole local en fin de document permet de compléter en ~5 minutes.

---

## 1. Ce qui est vérifiable depuis le dépôt distant (fait, 2 juillet)

| Worktree | Branche distante | Constat factuel |
|---|---|---|
| `distracted-swanson` | `claude/distracted-swanson-eedddb` | **ABSORBÉ** — vérifié : le tip (`29652566`, merge de main dans la branche) est ANCÊTRE de `origin/main` ; `git log origin/main..branche` = 0 commit ; diff vs main = vide. Contenu = chantier #362 (appariement par couverture scopée + `critereId` + tests adverses), mergé dans main via PR #74. **Recommandation : jeter le worktree (après vérif locale qu'il n'y a pas de fichiers non committés).** |
| `wonderful-galileo` | aucune | Invisible d'ici. `SESSION.md` (28 juin) : « modifs prod Brique C non commitées, diffèrent de main ». **Recommandation : EXAMINER EN PREMIER en local (seul worktree avec du travail potentiellement unique ET non committé) — committer sur une branche dédiée ou jeter en connaissance de cause.** |
| `zen-lichterman` | aucune | Invisible d'ici. `SESSION.md` (28 juin) : « `workers:1` UNIQUE et utile — isole les tests file:// ». C'est une CONFIG de worktree (playwright.config), pas du code produit. **Recommandation : récupérer la config `workers:1` dans une note/commit si encore utile, puis jeter le worktree.** |
| `bold-wilson` | aucune | Invisible d'ici — aucune branche distante ne porte ses « 20 commits » (signet SESSION.md du 29 juin). Sans push, impossible de dire s'ils sont absorbés. **Recommandation : en local, `git log main..HEAD --oneline` dans le worktree ; si des commits uniques subsistent, pousser la branche AVANT tout triage.** |
| `lucid-lovelace` | aucune | Invisible d'ici (1 commit d'après le signet du 29 juin). **Recommandation : même protocole que bold-wilson (1 commit à vérifier puis pousser ou jeter).** |

## 2. Protocole local (Grégoire, août — ~5 min, lecture seule)

Depuis le dépôt principal :

```bash
git worktree list                          # chemins réels des 5 worktrees
# pour CHAQUE worktree :
cd <chemin-du-worktree>
git status --short                         # fichiers non committés ? (cas wonderful attendu)
git log --oneline main..HEAD | head -25    # commits que main n'a pas
git diff main --stat | tail -5             # ampleur du diff committé
```

Grille de décision (proposée, cohérente zéro-dette) :
- `status` propre + `log main..HEAD` vide → **jeter** (`git worktree remove <chemin>`).
- Commits uniques → **pousser la branche** (`git push -u origin <branche>`) puis décider (PR ou abandon explicite).
- Fichiers non committés (wonderful) → lire le diff ; si pertinent, committer sur une
  branche dédiée `claude/wonderful-brique-C-recuperation` et pousser ; sinon jeter en
  le notant dans SESSION.md.

## 3. Rappels

- `distracted-swanson` est le seul cas TRANCHABLE depuis le cloud (absorbé, preuve git).
- Ne PAS supprimer `wonderful-galileo` sans avoir lu son diff non committé (Brique C).
- Après triage : consigner le sort des 5 dans SESSION.md et retirer la mention
  « 5 worktrees à trier » du signet persistant.
