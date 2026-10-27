# Consigne – Le tri de Git, en parallèle, dans une copie de travail à part

> Écrite par Cowork le lundi 26 octobre 2026 à 21 h 28 (Toronto, mesuré par `date`), sur `main` = `85d35ed9` (1.220.0 en ligne).
> **Demande de Grégoire** (21 h 20 et 21 h 24) : une session en arrière-plan qui fait le tri de Git, pendant qu'une autre session code. Point 2 de la page du tri (#1114).
> **Supposé par Cowork** : « le tri de Git » couvre GitHub (les rouges non jugés, l'outil du verdict en morceaux) ET le ménage des branches. Grégoire peut retrancher une partie.

## 0. Avant tout : tu n'es pas seule

- **Une autre session de Claude Code code en ce moment dans le dossier principal** (la chaîne d'étapes de la Carte d'alignement, #1172, puis l'étape 4 du critère algorithmique). `main` et le dossier principal sont à elle.
- **Dans le dossier principal, tu n'écris rien** : ni checkout, ni stash, ni add, ni commit, ni merge. Rituel de début de session en lecture seule, **sans lancer de tests**.
- Crée ta copie : `git worktree add .claude/worktrees/tri-git -b tri-git 85d35ed9`. Tout ton travail se fait là.
- Première action : **déplace** ce fichier (`mv`, pas `cp`) du dossier principal vers le même chemin dans ta copie, et commite-le seul sur `tri-git`. Le dossier principal redevient propre pour l'autre session.
- **Aucun essai Playwright sur le Mac, même ciblé** : une seule session lance des essais (les specs partagent le stockage de `file://`), et la mémoire du Mac n'en tient pas deux. Vitest ciblé seulement, depuis `tests/` de ta copie.
- Tu ne touches ni `js/`, ni `index.html`, ni `styles.css`, ni `tests/integration/`.
- Ni push, ni release, ni fusion dans `main`.

## 1. Ce qui est établi (`RELAIS.md`, 26 oct., 19 h 03)

- Run **40412553265** (1.220.0, `10b7093d`) : **NON JUGÉ**, 12 rapports sur 16 (morceaux 3 à 6 coupés à 30 min). Jugés à la main contre `scripts/playwright-baseline-linux.json` : **6 rouges neuves, toutes vertes sur le Mac** ; **18 entrées de la baseline Linux redevenues vertes** (liste dans `RELAIS.md`).
- Le run du push de la **1.219.1** : 7 rouges neuves sous Linux seulement, vertes sur le Mac. Retrouve-le par `gh run list`.
- La vérification du Mac se joue **en dix morceaux, sans outil** : Claude Code a écrit le jeton à la main deux fois le 26, et a reporté à la main un verdict sur un commit qui ne changeait que des tests (`CONSIGNE-LOT-2026-10-26-verdict-rouge-1220-retouche.md`, ses trois conditions).

## 2. Le mandat, dans l'ordre

**A. Que GitHub juge de nouveau.**
1. Mesure, dans les journaux, pourquoi des morceaux dépassent 30 min (quelles specs, combien de temps). Corrige sur ta branche, dans `tests.yml` (répartition, plafond ou nombre de morceaux, `total=`). Lis d'abord l'historique en commentaire du fichier : des options y ont été écartées, et les minutes ne sont plus facturées (l. ~183).
2. Donne une cause à chaque rouge neuve des deux runs : **environnement Linux**, **instable**, ou **régression** (seulement si le verdict du Mac du même commit la montre rouge aussi ; ne la rejoue pas sur le Mac).
3. La baseline Linux : ajoute les rouges classées « environnement » ; retire les entrées **vertes dans les deux runs** (une verte dans un seul run peut être instable : elle reste).

**B. Le verdict du Mac en dix morceaux, outillé.**
Un script dans `scripts/` qui fait ce que Claude Code fait aujourd'hui à la main : jouer les dix morceaux l'un après l'autre, fusionner, juger, écrire le jeton ; et reporter un verdict quand le diff ne touche que `tests/` et `plans de travail/`, aux trois conditions de la consigne citée plus haut. **Le juge ne change pas** : le Mac reste le juge du push (décision de Grégoire, 10 oct.), le crochet pré-push aussi. Éprouve le script par Vitest sur des rapports factices, avec break-test. **Ne le joue pas ce soir** : sa première vraie course sera la vérification du soir, au signal de Grégoire, après la fusion.

**C. Le ménage des branches : mesurer, puis le seul geste sûr.**
- Inventaire : `git worktree list` (trois marquées `prunable`), les branches locales (`feat/sous-criteres-condensation`, `fix/anonymisation-travail-affiche`, `fix/tampons-doigt-1123`, `lot-accueil-textes-cartes`, `ci/verdict-morceaux-2`), les branches dependabot distantes. Pour chacune : les commits dont le contenu manque à `main` (`git cherry`, pas seulement l'ancêtre), la date, ce qu'elle portait.
- **Permis** : `git worktree prune` (leurs dossiers n'existent plus) ; supprimer une branche locale dont **tout** le contenu est dans `main`.
- **Proposé seulement** : une branche qui porte un commit absent de `main` ; toute branche distante ; les mises à jour de dependabot (Playwright et Vitest changent le banc d'essai : pas pendant qu'une autre session teste).

## 3. Ce qui n'entre pas

Réparer les specs rouges sous Linux (#1115, #1116) ; changer le juge du push ; fusionner dans `main` ; le code de l'application.

## 4. Clôture

- Sur ta branche : `plans de travail/DEMANDE-RELECTURE-2026-10-26-tri-de-git.md`, avec (A) un tableau par rouge (spec ; run ; cause ; issue), les entrées ajoutées et retirées de la baseline, la cause des morceaux coupés et ta correction ; (B) le script, ses essais et leur break-test ; (C) le tableau des branches (nom ; contenu absent de `main` ; geste ; fait ou proposé).
- **La fusion de `tri-git` dans `main` attend que l'autre session ait clos son lot.** Cowork dira quand, après son verdict de relecture.
