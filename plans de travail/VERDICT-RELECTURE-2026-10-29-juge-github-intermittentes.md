# Verdict – Le juge de GitHub : les intermittentes de Linux (`67b1644d`)

> Cowork, jeudi 29 octobre 2026, 05 h 04 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire (5 h 03) ; le diff de `scripts/rapport-playwright.mjs` ; la demande (la table, les quatre retirées) ; les deux baselines (Mac : 0 entrée ; Linux : 22 connues, 28 intermittentes). Pas relancé par Cowork.

## Verdict : accepté, avec une retouche d'une ligne

Conforme : les deux listes, `nouveaux` hors des deux, `reparees` jouée et verte seulement, `nonJouees` à part, les intermittentes qui ne bloquent pas ; les trois juges audités ; le reclassement sur trois runs complets ; aucune spec intermittente modifiée entre les trois soirs (ce qui confirme l'environnement).

**Supposition 1** (une connue verte au second essai compte « jouée verte », donc « à retirer ») : **refusée**. Une connue qui échoue au premier essai et passe au second est, par définition, intermittente : la retirer des connues la ferait rougir comme « nouvelle » au soir suivant. **Retouche** : `reparees` ne prend qu'une connue verte **au premier essai** (`expected`) ; une connue verte au second essai se dit « à passer aux intermittentes ». Rejoue la règle sur les quatre retirées (`lot-i-bis` (1) et (3), `materiel-dissection-11`, `-2a` C1) : il suffit qu'une d'elles ait été verte au second essai dans un des trois runs pour qu'elle aille aux intermittentes au lieu de sortir ; dis lesquelles. Essai Vitest et son break-test.

**Supposition 2** (`--ecrire` garde les intermittentes, vu à la lecture) : **acceptée**. `--ecrire` n'écrit que la baseline du Mac, qui n'a pas d'intermittentes.

## La trouvaille des identités en double : une condition de la bascule

Mesuré : la baseline du Mac est vide ; une identité en double n'y masque donc rien aujourd'hui. Sous Linux, une rouge neuve peut se cacher derrière une connue ou une intermittente du même nom, et 28 intermittentes élargissent ce risque. GitHub ne juge pas le push : **inscrire et continuer** reste juste, mais avec une condition écrite à #1114 : **la bascule attend que l'identité porte le nom du bloc** (et les deux baselines rekeyées). Les trois pushs conformes peuvent se compter d'ici là.

## Clôture

Un commit pour le script et le test, un pour les docs (ce verdict ; la condition de la bascule à #1114). Pas de release, de verdict ni de push sans le signal de Grégoire.

## Suite donnée (Claude Code, 29 oct. 2026)

- **Retouche** : *faite*. `comparerALaBaseline` reçoit les `instables` ; `reparees` ne prend qu'une connue verte au premier essai, une verte au second essai va à `aPasserAuxIntermittentes`, dite par les trois juges. Sentinelle : E.e réécrit, E.i et E.j neufs ; break-tests — la garde retirée de `reparees` → E.e et E.i rouges ; `instables` retiré de l'appel du juge de GitHub → E.i et E.j rouges ; arbre restauré, sha256 vérifié.
- **Les quatre retirées, rejouées** (rapports fusionnés des trois runs, 16 sur 16) : `lot-i-bis` (1) et (3), `materiel-dissection-11` (« chaque geste s'enregistre »), `-2a` C1 — `expected` aux trois runs, 12 essais sur 12. Aucune ne passe aux intermittentes ; elles restent sorties. Aucune connue actuelle n'est verte au second essai dans ces runs ; le juge retouché rend code 0 sur les trois.
- **Condition de la bascule** : *inscrite* à #1114 (le critère de bascule).

