# Verdict – Le rouge de GitHub sur la 1.223.0 (run 40784135640)

> Cowork, mercredi 28 octobre 2026, 20 h 15 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire (19 h 40) et `ace09fa2` (`RELAIS.md`, les trois soirs du 27 et du 28) ; #1114 (`BACKLOG.md:241`) ; `scripts/playwright-baseline-linux.json` (33 entrées, générée le 26). Pas relancé par Cowork ; les rapports de GitHub non relus (aucun accès au dépôt GitHub depuis ce shell) : les listes ci-dessous sont celles de `RELAIS.md`.

## Ce qui est jugé

**Aucune régression.** Les 18 neuves passent sur le Mac ; aucune n'est dans une spec touchée le 28.

**Les « quatre nouvelles » ne le sont pas.** `bibliotheque-liste-1159` (groupes-cours, « Mettre de côté ») était rouge le 26 et le 27 à midi ; `lot-e3-creer-ou-modifier` (I-a, I-b) l'était le 25 (`VERDICT-RELECTURE-2026-10-25-rouge-github-1217.md`). Le 27, #1114 (b) les nommait, avec `comptes-erreurs-stock-1142`, parmi les instables attendues à chaque run, **avant** les lots du 28.

## Ce que montrent les trois runs complets

Trois runs sont allés au bout : 40553224586 (1.221.0, 27 oct. midi), 40610692581 (1.222.0, 27 oct. soir), 40784135640 (1.223.0, 28 oct. soir). Chacun donne de 10 à 18 neuves **et** de 7 à 10 entrées de la baseline redevenues vertes, et ce ne sont pas les mêmes d'un soir à l'autre :

- `critere-algorithmique-calculs-4c` (7) : rouge, verte, rouge ;
- `bibliotheque-liste-1159` : rouge, absente, rouge ;
- `bareme-1` (3), `materiel-dissection-2a`, `-2b`, `-11`, `lot-i-bis` : vertes le 27, deux soirs ou un, toujours dans la baseline.

Une bande d'une quinzaine à une vingtaine d'essais change de côté chaque soir sous Linux. **Conséquence** : le critère de bascule de #1114 (« la liste de GitHub égale à la baseline Linux, trois pushs d'affilée ») ne peut pas être atteint, et recaler la baseline chaque soir court après le bruit.

## La décision (Cowork ; technique, et #1114 (b) la confiait à Cowork au premier run complet)

1. **La baseline Linux tient deux listes.** `echecsConnus` : rouge à chacun des trois runs complets ; elle doit rester rouge, et jouée verte, elle est « à retirer ». `instables` : rouge à au moins un run, jouée verte à au moins un ; ni son rouge ni son vert ne bloquent.
2. **Une entrée n'est « redevenue verte » que jouée et verte dans le rapport** (trouvaille (a) de #1114, `comparerALaBaseline`, `scripts/rapport-playwright.mjs:70`). Corrigée dans le même lot : c'est le lot qui touche le juge.
3. **Le critère de bascule devient** : trois pushs d'affilée où le run complet de GitHub n'a aucune rouge hors des deux listes, et où le Mac est vert. Une instable ne compte ni pour ni contre.
4. **Après la bascule, les specs `instables` restent jugées par le Mac**, comme ce qui ne se juge que dans Safari : un verdict réduit à cette liste, pas la suite entière. Chaque instable reste à réparer (#1116, la famille codex) ; la liste doit rétrécir.
5. **Le classement se fait sur les trois runs complets**, rapports téléchargés, par Claude Code. Une spec jamais jouée dans les trois garde sa place actuelle.

## Le lot

Un lot à part, `scripts/` seulement (le juge et la baseline), sans toucher `js/` : consigne à écrire par Cowork, **après le lot 1 des standards** (urgent pour Grégoire) et **avant la prochaine mise en ligne du soir**, pour que son run soit le premier jugé par la règle neuve. Aucune porte terrain.

## La réserve du rapport

Les `waitForTimeout` fixes des specs du 28 (`copie-non-recevable-note-28-oct` ×6, `construction-de-la-note-correctifs-28-oct`, `aide-lot-2c`, `-2c-bis`, `-2d`) : **inscrire et continuer**, rattaché à #1114 (une attente fixe est une source d'instables sous Linux). La ligne du BACKLOG est portée par la consigne du lot 1 des standards (§ 4).
