# Demande de relecture – carte d'alignement, #963 à #966, rebasée sur `main`

> Écrite le 28 septembre 2026 par Claude Code, pour Cowork. Branche locale **`carte-alignement-963-966`**, worktree `.claude/worktrees/carte-alignement`, tête `975e4c6e` (plus le commit de cette demande). Partie de `claude/carte-alignement-fusion-963-966` (`a4bb0570`, qui porte R1 à R4), rebasée sur `main` (`185eba31`, 1.164.0 + la porte du lot E1). Relecture d'origine : `RELECTURE-2026-09-27-carte-alignement-963-a-966.md` (ton texte intégral, versé ici tel quel) ; `RELECTURE-2026-09-28-…-963-966.md` en est le résumé relayé, avec les dispositions de la session infonuagique.

## 1 · Ce qui a changé depuis ta relecture

Rien dans le code ni dans les tests du chantier. Le rebase ne touche que ce que `main` avait aussi modifié.

| Fichier | État après le rebase |
|---|---|
| `js/planification-carte.js`, `js/planification-export.js`, `styles.css`, les 4 specs et les 7 fichiers Vitest du chantier, les 4 demandes de lot | **identiques octet pour octet à `a4bb0570`** (mesuré fichier par fichier : `git diff a4bb0570 HEAD` vide ; `main` ne les a pas touchés depuis `df359bfe`) |
| `index.html` | jetons seulement (voir § 2) |
| `BACKLOG.md`, `SUIVI-BUGS.md`, deux demandes de lot | renumérotation (voir § 3) |
| `RELAIS.md` | le bloc de la carte en tête, celui du lot E1 en « relais précédent » |

**Comment** : rebase linéaire (les deux commits de fusion disparaissent ; les neuf commits du chantier sont rejoués dans l'ordre). Conflits : `BACKLOG.md` (ligne d'en-tête), `index.html` (jetons, à cinq commits), `RELAIS.md` (dernier commit). Les conflits d'`index.html` ont été résolus côté `main`, par un script qui **refusait toute différence hors jeton** entre les deux côtés. Les commits intermédiaires ont été faits avec `LABO_ANTICACHE_SKIP=1` : leurs jetons sont provisoires et ne seront jamais servis. Le dernier commit (`975e4c6e`) pose les jetons définitifs **sans dérogation** : le garde les a acceptés.

## 2 · R5 – les jetons

| Fichier | Jeton | Pourquoi cette lettre |
|---|---|---|
| `styles.css` | `20260927k` | `a` à `j` déjà servies (dont `h` par `70dfb20b`, avec un autre contenu) |
| `js/planification-carte.js` | `20260927f` | `a` à `e` déjà servies — dont **`e`**, contrairement à la disposition R5 de la session infonuagique, qui la disait jamais servie |
| `js/planification-export.js` | `20260927f` | `a`, `b`, `e` servies ; `c` évitée (ton essai de fusion) |

Jour du build en cours (`0927-2108`), comme l'exige `sentinelle-anticache-fichiers-modifies`. Relevé fait sur tout l'historique d'`index.html` (`git log --all -p`).

## 3 · Une collision de numéros, renumérotée

**#967** était pris deux fois : sur `main`, « Écraser » un homonyme laisse des références orphelines (lot E1, **déjà poussé**) ; sur la branche, « l'export du plan tait l'objectif qu'un bloc sert dans une autre leçon » (constat 1 de la consigne #963, inscrit au suivi des bugs). Le numéro poussé reste. Le constat de la carte devient **#974**, dans `SUIVI-BUGS.md` (sa ligne dit son ancien numéro), dans l'en-tête du BACKLOG (« Dernier ID utilisé : #974 ») et dans les demandes #963 (§ constats) et #964 (§ 6). #968 à #973 : pas de collision.

## 4 · Preuves sur l'arbre rebasé

- **Vitest complet** : **649 fichiers, 7 573 / 7 573** (la fusion seule en comptait 7 567 ; les 6 de plus sont les essais du lot E1 venus de `main`).
- **WebKit, bancs `planif-*`** : **27 / 27**, sur le Mac. La session infonuagique ne les avait passés que sous Chromium. Les 6 essais neufs du chantier en font partie (#963 : 2, #964 : 2, #965 : 1, #966 : 1).
- **Pas de nouvelle mutation** : R1 à R4 n'ont pas bougé depuis leurs dispositions (mutations rouges, `RELECTURE-2026-09-28-…`, fin du fichier). Je ne les ai pas rejouées : le code et les tests qu'elles visent sont identiques octet pour octet.
- Le **verdict WebKit complet** reste le dernier geste avant le push (`scripts/pousser.sh`).

## 5 · À Grégoire avant le push : R6

L'infobulle `planif-design-apprentissages` (`js/accompagnement-contenu-hover.js`, l. 622) devient fausse avec #964. **Non touchée** : ses mots attendent Grégoire.

| | Texte |
|---|---|
| Aujourd'hui | « Vérification : l'évaluation ferme la boucle — relie-la à ce qu'elle vérifie (idées maîtresses, connaissances ou activités). Le menu de son en-tête choisit sa visée : formative ou certificative. Tant que tu n'as rien choisi, tes exports écrivent « Évaluation », comme avant. » |
| Proposé par Cowork | « Vérification : l'évaluation ferme la boucle — coche dans son Inspecteur les objectifs qu'elle vérifie, ceux de sa leçon ou d'une leçon placée avant elle. » + la suite, inchangée (« Le menu de son en-tête choisit sa visée… ») |

Ta liste « À Grégoire » (§ fin de ta relecture) reste ouverte dans le même ordre : les mots de #964 et le titre « Pastille de l'évaluation » (#965) ; la page 5 du guide et la définition de « Leçon » ; la leçon sans semaine (✓ par défaut ou pastille distincte) ; les couleurs à l'écran. Rien de cela n'est tranché dans le dépôt.

## 6 · Ce que je te demande de relire

1. **Le rebase n'a rien changé au chantier** : le tableau du § 1 (un `git diff a4bb0570 975e4c6e -- js tests styles.css` suffit).
2. **Les jetons** (§ 2), et la correction de la disposition R5 sur la lettre `e`.
3. **La renumérotation** #967 → #974 (§ 3).
4. **`RELAIS.md`** : le bloc de la carte, réécrit pour l'état rebasé.

## 7 · La suite, dans l'ordre

Ta relecture → R6 (et, si Grégoire le veut, les autres mots) → **une seule release `minor`** pour les quatre lots, Nouvelles à écrire et à faire accepter → verdict WebKit complet → fusion dans `main` (avance rapide) → push. Puis retirer les cinq branches distantes `claude/carte-alignement-*` (les quatre lots et la fusion), la branche locale et son worktree. À la fusion, la copie non suivie de ta relecture sur `main` (même nom que celle versée ici) est à retirer, sinon elle bloque.

## 8 · Trouvailles en chemin

- **La relecture versée par la session infonuagique n'est pas « telle quelle »** (son en-tête le dit) : c'est un résumé. Les mesures et le détail des mutations n'existaient que dans ta copie non suivie. **Corrigé** : ton texte intégral est versé à côté, sous son nom d'origine.
- **Le worktree n'avait pas de `tests/node_modules`** : lien vers celui de l'arbre principal (non suivi). Sans lui, Vitest échoue sans rien compter.
