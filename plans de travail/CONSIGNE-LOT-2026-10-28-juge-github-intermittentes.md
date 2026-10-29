# Consigne – Le juge de GitHub : les intermittentes de Linux (#1114) (28 octobre 2026)

> Écrite par Cowork le mercredi 28 octobre 2026 à 21 h 52 (Toronto), sur `main` = `ed25c12f` (8 commits non poussés). Ne remplace aucune autre consigne.
> Source : `VERDICT-RELECTURE-2026-10-28-rouge-github-1223.md` (la décision, points 1 à 5). Fiche : #1114 (`BACKLOG.md:241`), trouvailles (a) et (b).
> **`scripts/` et `tests/` seulement** : aucun fichier de `js/`, d'`index.html` ni de `styles.css`. Aucune porte terrain. **À finir avant la prochaine mise en ligne du soir**, pour que son run soit le premier jugé par la règle neuve.

## 0. Avant tout

- `main` à jour, aucune suite qui tourne.
- Commit de docs seul, fichiers nommés : ce fichier et `CONSIGNE-DEMARRAGE-COWORK.md` (racine). Le texte de l'accueil et les deux icônes, dans l'arbre, ne sont pas de ce lot : n'y touche pas.

## 1. Ce que ça change

Rien pour l'utilisateur. Le jugement de GitHub cesse de courir après le bruit : trois runs complets montrent une bande d'essais qui changent de côté chaque soir sous Linux (verdict, § « Ce que montrent les trois runs complets »). Le Mac reste le juge du push.

## 2. Le mandat

1. **Le juge** (`scripts/rapport-playwright.mjs`, `comparerALaBaseline`), règles du verdict :
   - la baseline peut porter une seconde liste, `echecsIntermittents` (le nom évite la confusion avec les « instables » du juge, les verts au second essai) ; absente, elle vaut `[]` ;
   - **`nouveaux`** : un échec absent des deux listes (seul cas qui fait échouer) ;
   - **`reparees`** : une entrée d'`echecsConnus` **jouée et verte** dans le rapport, seulement (trouvaille (a)). Une entrée absente du rapport se dit à part, « non jouée », sans conclusion ;
   - une intermittente ne bloque ni rouge ni verte ; le juge dit seulement combien sont rouges ce soir.
   - Il faut donc les essais joués et verts du rapport : une fonction à côté d'`echecsDuRapport`, même `identite`.
2. **Les appelants** : `juger-rapport-playwright.mjs` (GitHub), `verifier-playwright.mjs` et `verdict-en-morceaux.mjs` (le Mac). Audite chacun : la baseline du Mac n'a pas d'intermittentes, son comportement ne change que par (a), qui vaut aussi pour lui (un morceau ne joue pas toute la suite). `--ecrire` garde la structure. Si un appelant ne peut pas suivre sans changer ce qu'il bloque, arrête-toi et dis-le.
3. **La baseline Linux** (`scripts/playwright-baseline-linux.json`), reclassée sur les trois runs complets : 40553224586 (1.221.0), 40610692581 (1.222.0), 40784135640 (1.223.0), rapports téléchargés (`gh run download`) :
   - rouge aux trois → `echecsConnus` ;
   - rouge à au moins un et **joué vert** à au moins un → `echecsIntermittents` ;
   - joué vert aux trois → sort ;
   - jamais joué dans les trois → garde sa place.
   Les 18 neuves du 28 et les 7 « redevenues vertes » passent par la même règle. `_lisezMoi`, `source` et les totaux à jour. Si un run n'est plus téléchargeable, classe sur ceux qui le sont et dis-le.
4. **#1114** : le critère de bascule devient « trois pushs d'affilée où le run complet de GitHub n'a aucune rouge hors des deux listes, et où le Mac est vert ; une intermittente ne compte ni pour ni contre » ; après la bascule, les intermittentes restent jugées par le Mac, sur leur seule liste. (a) corrigée, (b) tranchée (le verdict). Compteur : 0 push conforme sur 3, le prochain est le premier jugé par la règle neuve.

## 3. Les tests

- Vitest (`tests/unit/`, depuis `tests/`) sur `comparerALaBaseline` : une rouge hors des deux listes est nouvelle ; une intermittente rouge ou verte ne l'est pas ; une connue jouée verte est réparée ; une connue absente du rapport ne l'est pas ; une baseline sans `echecsIntermittents` juge comme avant. Mets à jour `sentinelle-ci-verdict-morceaux.test.js` si elle lit l'ancien sens de `reparees`.
- Le juge rejoué sur le rapport fusionné du 28 avec la baseline reclassée : « aucune rougeur nouvelle », code 0 ; le même rapport avec une rouge ajoutée hors des listes : code 1.
- Break-test (arbre restauré par sha256) : l'ancienne règle de `reparees` rougit l'essai de l'entrée absente ; sans `echecsIntermittents`, l'essai de l'intermittente rougit.

## 4. Clôture

- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-juge-github-intermittentes.md` (la table de reclassement, spec par spec, ses trois états et sa liste ; les appelants audités ; les tests ; la sortie du juge sur le 28).
- Un commit pour les scripts et les tests, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
