# Consigne – la seconde purge de l'historique (6 novembre 2026)

> Écrite par Cowork le 6 nov. 2026 à 10 h 57 (Toronto). Décision de Grégoire (10 h 07) : retirer de l'historique de GitHub les informations confidentielles d'élèves avant la prochaine mise en ligne. **Le protocole est celui de `plans de travail/CHANTIER-historique-git-donnees-personnelles.md` § 0 : ses cinq arrêts durs valent ici tels quels.** Ce fichier ne porte que ce qui diffère.
>
> ⛔ Ce fichier ne contient et ne contiendra **aucun nom ni aucun DA**. Rien de ce qui suit ne doit en faire entrer un dans un fichier suivi, un message de commit ou un rapport.

## 1. Ce que Cowork a mesuré ce matin (dépôt public, `--remotes=origin --tags`)

- **La purge du 15 oct. a tenu** : les exports, la liste d'A2024 et la photo des présences ne sont dans aucune révision, ni sur GitHub ni en local.
- **Les dix listes de Grégoire** (`~/Documents/Cowork H26 App Labo Codex/purge-identites/`, 10 fichiers, format du collège, champs `="…"`) : **aucun DA et aucun nom complet** (« Prénom Nom », « Nom Prénom », « Nom, Prénom ») dans les 29 428 textes de l'historique public. Témoin : la même recherche sur un blob connu rend bien ses formes (ci-dessous).
- **Ce qui reste** : les élèves que le commit `5cf30f9a7` (22 sept.) a retirés des fichiers de l'époque, et que l'historique garde **sous d'autres formes** : « Prénom N. » (6 élèves dans `5cf30f9a7^:BACKLOG.md`, 4 dans `SESSION.md`), le prénom seul, le nom de famille seul. Les 30 jetons que ce commit retire : 15 sont des noms de famille des listes, 13 des prénoms, 3 dans aucune. Les jetons absents de `main` aujourd'hui (27) sont dans **1 266 versions de 24 chemins** (BACKLOG 568, SESSION 387, RELAIS 260, `js/evaluation-calcul.js` 13, quatre sentinelles, `Retours des testeurs/SUIVI-BUGS.md`, deux rapports de `Rapports/`, un brouillon de `docs/orthopedagogie/`, …) et dans **22 lignes de messages de commit**.
- **Un DA** retiré le 22 sept. (« ligne Omnivox recopiée ») : **absent des dix listes**, présent dans 8 commits de l'historique.
- **Images, PDF, ZIP** : 492 images lues par OCR (témoin : un nom et un DA fictifs à 11 px sont lus), 8 PDF et 8 ZIP extraits : aucun des 27 jetons, aucun DA à 7 chiffres commençant par 2. L'OCR ne lit pas l'écriture manuscrite.
- **L'arbre actuel et les 19 commits non poussés** : propres (aucun des jetons spécifiques, aucun DA des listes, aucune image ajoutée).
- Sur GitHub : 10 demandes de fusion (`refs/pull/*`, en lecture seule, que la réécriture n'atteint pas), 22 étiquettes, branches `dependabot/*` et `lot/*`.

## 2. Les règles de remplacement (hors du dépôt)

Dans `~/purge-seconde/` (dossier personnel : **ni Documents, ni Bureau**, qui peuvent se synchroniser vers iCloud), jamais suivi, jamais recopié.

1. **La correspondance du 22 sept.** : de `git show 5cf30f9a7` et `git show 04a33dcbd` (le lot du même jour qui a aussi remplacé des noms), les paires de lignes −/+ donnent, au niveau du mot, chaque forme réelle et sa forme fictive. **Mêmes noms fictifs que les fichiers actuels** : l'historique réécrit concorde avec l'arbre.
2. **« Prénom N. »** pour chaque élève des dix listes, vers la forme fictive de (1) si l'élève y est, sinon vers un nom fictif stable neuf (règle 6 de `CLAUDE.md` : manifestement fictif).
3. **Le DA isolé** vers un substitut synthétique de même forme (CHANTIER § 4.4).
4. ⚠ **Prénom seul et nom de famille seul : seulement dans les chemins où `5cf30f9a7` et `04a33dcbd` les ont remplacés.** Un remplacement global toucherait des coïncidences légitimes (rosters de démonstration, noms de banc, l'étiquette de langue de jsPDF, un verbe : liste des « non touchés » du message de `5cf30f9a7`). Technique au choix de Claude Code (`--file-info-callback` de `git filter-repo` ou équivalent).
5. Les mêmes règles sur les **messages de commit** (`--replace-message`).

## 3. Les vérifications, chacune avec son témoin

- **A. L'arbre ne bouge pas.** L'arbre actuel est déjà propre : `HEAD^{tree}` de la copie réécrite doit être **identique** à celui de l'original (même empreinte). Témoin : une règle volontairement fautive sur un mot de l'arbre fait différer l'empreinte.
- **B. Plus rien à trouver.** Le balayage de sortie (les jetons du 22 sept., les « Prénom N. » des listes, les noms complets et DA des listes, le DA isolé, blobs ET messages) rend **0** sur la copie réécrite. Témoin : le même balayage sur l'original rend les comptes du § 1.
- **C. Rien d'autre n'a changé.** Pour chaque commit, la liste des chemins touchés est la même avant et après ; le nombre de commits aussi.
- **D. Les coïncidences légitimes sont intactes** : les rosters de démonstration et `libs/` sont identiques octet pour octet dans les révisions où ils existent.

Si une vérification échoue : arrêt, rapport, rien n'est poussé.

## 4. L'ordre

1. Commiter d'abord les fichiers de Cowork encore non suivis ou modifiés dans l'arbre de Grégoire (`CONSIGNE-DEMARRAGE-COWORK.md`, `plans de travail/…`), pour qu'aucun travail ne soit perdu à la réécriture ; `.claude/settings.json` reste hors du commit.
2. Bundle de sauvegarde de l'original (`git bundle create ~/purge-seconde/avant-purge.bundle --all`), vérifié (`git bundle verify`).
3. Copie : `git clone --mirror` du dépôt local dans `~/purge-seconde/`, jamais sur le clone de travail.
4. Mesure d'entrée (§ 3 B, témoin), règles (§ 2), réécriture, vérifications A à D.
5. **Rapport à Cowork** (comptes seulement, aucun nom), puis **arrêt** : la suite attend le signal explicite de Grégoire dans ta session.
6. À son signal, ce soir : `main` local remplacé par le `main` réécrit ; verdict complet sur ce `main` (il remplace le verdict prévu) ; s'il est vert, push forcé de toutes les branches et étiquettes réécrites ; les branches distantes `lot/*` supprimées (fusionnées) ; worktrees retirés.
7. Après le push : nombre de forks du dépôt (`gh api repos/bedardg71-codexnumeris/labo-codex --jq .forks_count`) ; « First Changed Commit(s) » de la sortie de `filter-repo` ; Cowork rédige la demande au support de GitHub (10 demandes de fusion, vues en cache).
8. Fin : ce qui reste chez Grégoire (le dossier des listes dans Documents, `~/purge-seconde/`) se supprime **sur sa décision**.
