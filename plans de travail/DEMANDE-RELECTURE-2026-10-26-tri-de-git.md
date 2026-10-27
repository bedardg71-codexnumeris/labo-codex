# Demande de relecture – Le tri de Git (26 octobre 2026, soir)

> Écrite par Claude Code sur la branche `tri-git` (copie `.claude/worktrees/tri-git`, partie de `85d35ed9`), en parallèle de la session du dossier principal. Consigne : `plans de travail/CONSIGNE-LOT-2026-10-26-tri-de-git.md`.
> Commits : `646ad3ce` (la consigne déplacée), `290c9a67` (A), `a5815268` (B), puis celui de ce fichier. **Ni push, ni release, ni fusion.** Aucun essai Playwright lancé ; Vitest ciblé seulement.

## Vue d'ensemble

| Volet | Ce qui est fait | Ce qui reste ouvert |
|---|---|---|
| A. GitHub juge de nouveau | Cause des morceaux coupés mesurée (c'est `apt`, pas la suite) ; étape apt bornée dans `tests.yml` ; 13 rouges classées ; baseline Linux +3 / −2 | La correction n'est éprouvée sur aucun runner ; 6 rouges « instables » feront encore rougir le verdict GitHub si elles reviennent |
| B. Verdict du Mac outillé | `scripts/verdict-en-morceaux.mjs` (dix morceaux + `--reporter`), 22 essais Vitest, 5 break-tests | Première vraie course : la vérification du soir, au signal de Grégoire |
| C. Ménage des branches | 2 branches locales supprimées (contenu entier dans `main`) | 3 copies de travail et leurs branches, 1 branche distante, 10 PR de dependabot : proposés |

## A. Que GitHub juge de nouveau

### A.1 La cause des morceaux coupés : l'étape apt, pas les specs

**Fait** (journaux des 48 morceaux des runs 40128243995, 40326337181 et 40412553265) : l'étape « Dépendances système de WebKit » (`npx playwright install-deps webkit`) prend 0,4 à 0,9 min d'ordinaire – 117 Mo en 16 s. Sur **8 des 32 morceaux** des deux runs non jugés, elle a pris 13,8 à 18,2 min (« Fetched 117 MB in 17min 31s (111 kB/s) ») ou n'a **jamais fini** : morceaux 4 et 6 de la 1.220, 6 et 8 de la 1.219.1 – 30 min dans `apt`, aucun essai joué. Le miroir en tête de `/etc/apt/apt-mirrors.txt` du runner est `azure.archive.ubuntu.com`.

| Run | Morceaux coupés | Temps dans apt | Le plus long morceau, hors apt |
|---|---|---|---|
| 40128243995 (1.217.0, complet) | aucun | 0,4 à 0,8 min | 19 min (morceau 1) |
| 40326337181 (1.219.1) | 6, 8, 12 | ∞, ∞, 13,8 min | 23 min (morceau 2) |
| 40412553265 (1.220.0) | 3, 4, 5, 6 | 17,8, ∞, 18,2, ∞ min | 22 min (morceau 13) ; le 10 a fini à 28,4 min après 16,5 min d'apt |

**Inférence** : la suite tient sous le plafond de 30 min ; le plafond et le nombre de morceaux ne sont pas en cause. Plus de morceaux voudrait dire plus de tirages au miroir.

**Correction** (`tests.yml`, point (10) du journal en tête) : l'étape apt est bornée à 3 min par essai (`timeout --kill-after=30 180` ; le plus long apt sain mesuré : 2,2 min), trois essais ; après un essai raté, le miroir d'Azure est retiré de `/etc/apt/apt-mirrors.txt` (apt passe à `archive.ubuntu.com`) ; plafond de l'étape : 11 min. Un essai raté coûte ~3,5 min : avec le morceau le plus lourd (23 min), on reste sous 30. Plafond du job (30) et `total=16` inchangés, conformément à la règle du point (4a). Sentinelle : `sentinelle-ci-paths-ignore.test.js`, essai « point 10 » ; break-test fait (la borne retirée → rouge).

⚠ **Non éprouvé** : aucun runner n'a encore traversé cette étape. Le premier run poussé dira si elle tient ; les essais se lisent dans son journal (`::warning::install-deps, essai N`). Deux essais ratés sur un morceau lourd dépassent encore 30 min : le morceau serait coupé et le verdict dirait NON JUGÉ, comme aujourd'hui. ⚠ Le message du commit `290c9a67` dit « le plus long morceau dure 20,6 min » et « 4 min par essai » : recalés dans le commit suivant (23 min, toutes courses confondues ; 3 min).

### A.2 Une cause pour chaque rouge neuve

Règle appliquée : **environnement** = rouge dans les deux runs, verte sur le Mac ; **instable** = rouge dans un seul run, ou rattrapée au second essai dans l'autre ; **régression** = seulement si le verdict du Mac du même commit la montre rouge. Le Mac a été vert sur `403c39cc` (1 027 essais) et sur `1473b15a`, reporté sur `10b7093d` : **aucune régression**. Troisième point, quand il existe : le run complet de la 1.217.0 (40128243995).

| Spec | 1.219.1 | 1.220.0 | 1.217.0 | Cause | Issue |
|---|---|---|---|---|---|
| `bibliotheque-liste-1159` › les trois fenêtres tiennent dans la largeur… | rouge (délai, 2/2) | rouge (délai, 2/2) | spec absente | environnement | ajoutée à la baseline Linux |
| `exporter-des-travaux-une-carte-895` › « Par étudiant·e », sans compression… | rouge (délai, 2/2) | rouge (délai, 2/2) | vert | environnement | ajoutée (famille #895 déjà dans la baseline) |
| `lot-a-anonymisation-enregistre` › (c)(d) intervention en anonymisation… | rouge (2/2) | rouge (2/2) | vert | environnement | ajoutée – ⚠ le champ qui échoue change d'un essai à l'autre (`#interventionTitre`, `#interventionDescription`) : signe de course plus que de géométrie |
| `bibliotheque-liste-1159` › les groupes-cours : « Mettre de côté »… | rouge (délai) | vert au 2ᵉ essai | spec absente | instable | hors baseline |
| `lot-e3-creer-ou-modifier` › (I-a) intervention complétée modifiée… | rouge | vert au 2ᵉ essai | vert | instable | hors baseline |
| `lot-e3-creer-ou-modifier` › (I-b) passage à « Complétée »… | rouge | vert | vert | instable | hors baseline |
| `comptes-erreurs-stock-1142` › H2026 (et A2025) ne sont pas mesurés… | vert | rouge (2/2) | vert | instable | hors baseline |
| `comptes-erreurs-stock-1142` › la réparation est refusée sans codex à jour… | vert au 2ᵉ essai | vert | – | instable | ne bloquait pas |
| `nettoyage-sans-perte-892` › aucune copie exportée… | vert | rouge (délai, 2/2) | rouge puis vert | instable | hors baseline |
| `statut-incomplet-travail-en-cours` › remplacer la copie garde le statut… | non jouée (morceau 6 coupé) | rouge (délai, 2/2) | spec absente | instable, **une seule observation** | hors baseline ; à reclasser au premier run complet |

Les deux familles `lot-e3` et `lot-a` passent par le même formulaire d'intervention ; « champ introuvable » y vise un champ différent à chaque essai. **Inférence** : le formulaire n'est pas prêt quand la spec le lit, sous un runner lent. Hors périmètre (#1115, #1116, réparer les specs).

**Conséquence à assumer** : avec la baseline retouchée, chacun des deux runs garderait **3 rouges neuves**, toutes « instables ». Le verdict GitHub peut donc rester rouge pour de l'instabilité, ce qui pèse sur le critère de bascule de #1114 (trois pushs d'affilée égaux à la baseline). Ce lot ne le règle pas ; il le rend visible.

### A.3 La baseline Linux (`scripts/playwright-baseline-linux.json`, 32 → 33)

- **Ajoutées (3)** : les trois « environnement » du tableau.
- **Retirées (2)** : `materiel-1119` ×2, vertes et **jouées** dans les deux runs.
- **Gardées**, bien qu'annoncées « redevenues vertes » dans `RELAIS.md` (18 au run de la 1.220) : **14 n'avaient pas été jouées** (leurs morceaux étaient coupés : 1007 ×3, lot-i-bis ×2, lot-j0-bis, dissections 2a ×3, 2b ×2, 5, 7, planif 929) ; `materiel-dissection-11` et `planif-modele-ia-963` étaient rouges au run de la 1.219.1. `bareme-1` ×3, `lot-i-bis` (1) et `planif-menu-vue` ×2, vertes dans un seul run, restent aussi.

**Trouvaille, issue « inscrire et continuer »** (code étranger, aucun symptôme dans la CI) : `comparerALaBaseline` (`scripts/rapport-playwright.mjs`) appelle « redevenue verte » toute entrée **absente du rapport**, jouée ou non. Dans la CI, c'est sans effet : un rapport incomplet n'atteint jamais le juge (compte des morceaux). Mais un jugement à la main sur 12 rapports sur 16 a produit 18 « vertes », dont 14 non jouées. Proposition à Cowork : ne compter « redevenue verte » qu'une entrée **présente et verte** dans le rapport. Non inscrit au BACKLOG (règle du 24 août : pas de symptôme vécu par Grégoire) ; Cowork décide.

## B. Le verdict du Mac en dix morceaux, outillé

**Le script** : `scripts/verdict-en-morceaux.mjs`.

- `node scripts/verdict-en-morceaux.mjs` : les dix morceaux l'un après l'autre (répartition en alternance, `fichiersDuMorceau` de la CI), un dossier blob par morceau (le rapport blob de Playwright 1.60 **vide son dossier** avant d'écrire, mesuré dans `_prepareOutputFile`), fusion par `merge-reports`, jugement contre `playwright-baseline.json` par les règles de `rapport-playwright.mjs`, jeton au format de `verifier-playwright.mjs`. `--morceaux N` pour un autre découpage.
- **Gardes** : éveil (`caffeinate -d -i -s`, `jugerEveil`) au départ ; mémoire avant chaque morceau (seuil de lancement de #1008, 10 Go d'échange) ; aucun fichier OBSERVABLE modifié hors commit (sinon la suite jugerait autre chose que le commit) ; HEAD inchangé après chaque morceau ; dix rapports sur dix ; aucune spec prévue absente du rapport fusionné. Chaque refus écrit un jeton code 2 qui nomme la garde.
- `--reporter` : reporte le jeton vert sur HEAD aux trois conditions de la consigne du 26 oct. Condition 1 **plus stricte** que la consigne (supposition nommée) : dans `tests/`, seuls les `tests/integration/*.spec.js` et `tests/unit/` sont permis ; `playwright.config.js`, les aides partagées et le lock changent la façon dont toutes les specs tournent, et la suite entière repasse. Conditions 2 et 3 : chaque spec touchée (encore présente à HEAD) est rejouée en entier, seule, et doit être **verte** (aucune baseline au rejeu) ; il n'y en a pas d'autre. Refus : code 3, aucun jeton.
- **Inchangés** : le juge, `lire-verdict.mjs`, le crochet pré-push, `verifier-playwright.mjs`, `pousser.sh`. `morceau-playwright.mjs` exporte désormais `filtreDe` (sortie comparée avant/après sur les morceaux 1, 7 et 16 : identique).

**Les essais** : `tests/unit/sentinelle-verdict-en-morceaux.test.js`, 22 essais, effets en doublures, aucun navigateur. Le jeton produit est lu par le vrai `lire-verdict.mjs` (0 pour son SHA, 3 pour un autre).

| Break-test | Essais rouges |
|---|---|
| Garde des specs prévues absentes retirée | A.c, E.c |
| `cheminReportable` accepte tout `tests/` | C.c |
| Compte des rapports retiré | D.b |
| Contrôle du sommet après chaque morceau retiré | D.c |
| Rejeu des specs touchées sauté | E.a, E.b, E.c |

Chaque fois, le script restauré : `shasum` identique. **Essai réel sans navigateur** : `--reporter` avec un jeton factice sur `85d35ed9` refuse (copie sale, puis diff hors des tests), code 3. Avec les sentinelles voisines (`ci-paths-ignore`, `ci-verdict-morceaux`, `756`, `533`, `1008`, `858`, `547`, `lint-securite`) : 156 essais verts.

**Pas joué ce soir**, comme demandé. **À faire après la fusion** (non fait ici, hors du lot) : nommer le script dans le skill `fin-de-session` (§ 4.5) et dans la consigne de mise en ligne, à la place de la procédure à la main.

## C. Le ménage des branches

**Écart avec la consigne** : aucune copie de travail n'est `prunable` ce soir – leurs dossiers existent, propres. `git worktree prune --dry-run -v` ne rend rien ; le prune n'a donc pas été lancé. Une copie détachée sur `85d35ed9` vit dans le bloc-notes d'une autre session de Claude Code (`/private/tmp/.../3b53dc93-…/scratchpad/base`) : pas touchée.

| Nom | Contenu absent de `main` (`git cherry`) | Date, ce qu'elle portait | Geste | Fait ou proposé |
|---|---|---|---|---|
| `feat/sous-criteres-condensation` | aucun (ancêtre de `main`) | 20 oct., F1 des sous-critères | `git branch -d` | **fait** |
| `lot-accueil-textes-cartes` | aucun | 19 oct., textes des cartes de l'accueil | `git branch -d` | **fait** |
| `fix/anonymisation-travail-affiche` + copie `fix-anonymisation` | aucun ; copie propre, 78 Mo | 20 oct., #1122 | `git worktree remove`, puis `git branch -d` | proposé (la copie existe : hors du geste permis) |
| `fix/tampons-doigt-1123` + copie `tampons-doigt` | aucun ; copie propre, 76 Mo | 20 oct., #1123-#1124 | idem | proposé |
| `ci/verdict-morceaux-2` + copie `verdict-morceaux-2` | aucun ; copie propre, 74 Mo | 16 oct., verdict GitHub en morceaux | idem, et la branche distante | proposé |
| `origin/ci/verdict-morceaux-2` | aucun | 16 oct. | `git push origin --delete` | proposé |
| 10 PR de dependabot (#1 à #10) | une montée de version chacune | 16 et 26 oct. | voir ci-dessous | proposé |

**Dependabot.** Cinq actions GitHub (checkout 7, setup-node 7, cache 6, upload-artifact 7, download-artifact 8), trois paquets mineurs (acorn, esbuild, jszip), et deux qui **changent le banc** : `@playwright/test` 1.60 → 1.64 et `vitest` 2.1.9 → 5.0.5 (le run Vitest de cette PR est rouge, 40306344295). **Fait** : une PR ne lance jamais Playwright (le job `decision` est sauté sur `pull_request`) ; la PR de Playwright n'a donc été jugée que par Vitest. **Fait** : chaque journal de morceau avertit « Node.js 20 is deprecated… forced to run on Node.js 24 » pour les actions en v4 ; les cinq PR d'actions y répondent. Proposition : les actions d'abord, sur une branche, avec un run complet à la demande ; Playwright et Vitest chacun à part, hors d'une soirée où une autre session teste.

## Ce que je demande à la relecture

1. La règle de classement (A.2) et ses trois ajouts : d'accord, ou `lot-a` (c)(d) en « instable » vu le champ qui change ?
2. La condition 1 du report, plus stricte que la consigne : à garder ?
3. Les gestes proposés en C : lesquels Grégoire autorise.
