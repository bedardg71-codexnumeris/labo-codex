# Rapport – seconde réécriture de `labo-codex` : arrêt avant le poussé

> Claude Code, 16 octobre 2026, de 9 h 25 à 10 h 20 (Toronto). Consigne : `CONSIGNE-2026-10-16-reecriture-noms-collegues.md`.
> Ce rapport ne recopie aucun nom, aucune adresse et aucun DA. Les collègues sont désignés par leur rang, comme dans le balayage.
> **Rien n'est poussé, et rien n'est commité dans `labo-codex`.** Ce rapport attend la relecture de Cowork (`PROTOCOLE.md`, règle 2), puis le geste de Grégoire.

## En une ligne

La copie réécrite est prête dans `~/purge-travail/reecriture2.git`. Toutes les vérifications sont vertes et chacune a son témoin. **Des demandes de fusion sont ouvertes, donc la voie de poussé passe par un dépôt recréé.**

## 0. Mesure côté GitHub (avant toute écriture)

| Mesure | Résultat |
|---|---|
| `gh pr list --state all` | **9 demandes de fusion, toutes ouvertes** (n° 1 à 9, Dependabot, ouvertes le 16 oct. vers 7 h 14). Le distant porte `refs/pull/1..9/head` et `/merge`. |
| Branches distantes | `main` et 9 branches Dependabot |
| Étiquettes | 22 (17 légères, 5 annotées), les mêmes en local |
| Releases | aucune |
| Dépôt | privé, 0 fork |
| `main` | local = distant = `efffe795` |

## 1. Sauvegarde

`~/purge-travail/sauvegarde-labo-codex-2026-10-16-avant-reecriture2.bundle` (307 Mo, `--all`, hors iCloud). `git bundle verify` dit « records a complete history ».

## 2. Réécriture

Elle a été faite sur un clone miroir neuf, `~/purge-travail/reecriture2.git`, jamais dans le dossier de travail. Les 11 références distantes du miroir ont été retirées avant la réécriture. Il reste `main` et les 22 étiquettes.

L'outil est `git filter-repo` (venv de la purge), avec trois réglages :
- `--invert-paths --paths-from-file chemins-a-retirer.txt` : 54 → **62 entrées**, avec les 8 chemins `dist/*.zip` ajoutés ; l'ancienne liste est gardée sous `chemins-a-retirer-2026-10-16-avant-reecriture2.txt` ;
- `--replace-text` et `--replace-message` avec `~/purge-travail/regles-reecriture2.txt` (hors dépôt, `chmod 600`, 3 règles littérales).

Résultat : 6 041 → 6 041 commits (aucun ne devient vide) et 22 étiquettes, en 25 s.

| Point | Ce qui part | Remplacé par |
|---|---|---|
| 1. Collègue n° 9 | Son adresse, où le nom de famille est collé au prénom | Le nom collé devient son initiale. L'adresse obtenue est **invalide** (un point juste avant le `@`), elle ne peut donc tomber sur la boîte de personne. |
| 2. Collègue n° 3 | `creerEnsemble‹Prénom›‹Nom›` | `creerEnsembleCalculDiff`. Ce nom était absent de tout l'historique (`git log -S` : 0). Il suit l'identifiant voisin, `objectifs-…-calcul-diff`. |
| 3. Zip de bêtas | 8 chemins `dist/*.zip` | retirés |
| 4. Gmail | champ `email` de `.claude-plugin/marketplace.json` | `labo@codexnumeris.org` |

**Point 5, la recherche élargie.** J'ai cherché les jetons collés (sans espace) qui portent un nom de famille, pour les 10 rangs. La recherche couvre tous les blobs texte, les 6 063 messages de commit et d'étiquette, et les 4 942 chemins. Elle ne rend que les trois formes ci-dessus, plus une touche au **rang 0** : un nom de fichier PDF qui cite un article publié, dans un skill archivé. **Gardé**, selon la décision du 15 octobre sur les auteurs publiés dans leur contexte de citation. Aucune autre forme n'est à ajouter.

## 3. Vérifications, chacune avec son témoin

### Les 17 vérifications de la purge – **17/17 VERT**

L'original témoin est l'historique `Monitorage_v6` d'avant la purge, restauré depuis `sauvegarde-monitorage-2026-10-16.bundle`. Le verdict complet est dans `~/purge-travail/verification-2026-10-16-reecriture2.txt`. La vérification A a été adaptée : l'arbre attendu n'est plus celui de l'original, mais celui de `efffe795` moins les lignes réécrites.

| Vérification | Copie | Témoin |
|---|---|---|
| A arbre | 3 fichiers diffèrent de `efffe795`, une ligne chacun, ceux attendus ; 2 809 / 2 809 fichiers | `efffe795~1` → 8 fichiers diffèrent |
| B chemins (62 entrées) | 0 | 503 chemins dans l'original |
| C DA / paires / collègues réécrivables | 0 / 0 / 0 blobs | 1 042 / 997 / 3 302 blobs |
| C images porteuses | 0 | 5 |
| C messages | 0 / 0 / 0 | 8 / 2 / 17 |
| C chemins | 0 porteur | 265 sur 265 noms fictifs reconnus |
| D `git fsck --full --strict` | code 0 | – |

Les témoins comptent un peu moins que ce matin (par exemple 1 042 contre 1 058). Ce matin, l'original était le dossier de travail de `Monitorage_v6`, avec ses références distantes. Ce dossier est vide aujourd'hui ; l'original est donc lu depuis le bundle. Les témoins restent non nuls, et chaque vérification sait encore rendre « différent ».

### Le balayage relancé (points 1 à 5)

| Mesure | Original `labo-codex` (témoin) | Copie |
|---|---|---|
| Adresse du collègue n° 9 (blobs / messages) | 3 / 0 | **0 / 0** |
| Identifiant du collègue n° 3 (commits qui l'introduisent ou le retirent / messages) | 13 / 1 | **0 / 0** |
| Gmail (blobs / messages) | 2 / 0 | **0 / 0** |
| Mentions de `dist/*.zip` dans l'historique | 16 | **0** |
| Binaires porteurs de noms de collègues (`binaires.py`) | 8 (les 8 zip) | **0** |
| Formes collées (`colles.py`), rangs 3 et 9 | présents | **absents** |
| Jetons collés, tous rangs | 4 formes | 1 (la citation du rang 0, gardée) |
| DA, paires, secrets forts | 0 | 0 |

Dans les deux dépôts, `colles.py` touche aussi les rangs 0, 1, 5 et 8. Ce sont des chevauchements de mots, ou les auteurs publiés, déjà triés à la main ce matin. Les comptes de l'original et de la copie sont dans la section 6.

Il reste une seule image non lue par l'OCR : un PNG de 1 × 1 pixel, le même que ce matin.

**Vitest sur l'arbre réécrit** (clone de la copie, `tests/node_modules` lié) : 763 fichiers sur 763 et 8 917 essais sur 8 917 sont verts.

## 4. La voie de poussé – le dépôt recréé

Les demandes de fusion ouvertes imposent cette voie. Un poussé forcé laisserait leurs commits dans `refs/pull/*`, où GitHub les garde et où personne ne peut les effacer.

1. **Grégoire** supprime `labo-codex` sur GitHub (Settings ▸ Danger Zone ▸ Delete). Les 9 demandes de fusion, les 9 branches Dependabot et les `refs/pull/*` disparaissent avec le dépôt.
2. **Grégoire** recrée `labo-codex` **vide** (sans README, sans licence, sans `.gitignore`), **privé**, sous le même compte et le même nom.
3. **Claude Code**, sur son signal, lance depuis `~/purge-travail/reecriture2.git` :
   `git push git@github.com:bedardg71-codexnumeris/labo-codex.git main` puis `git push … --tags`. Il vérifie ensuite que `git ls-remote` montre 1 branche, 22 étiquettes et aucun `refs/pull/`.
4. **Grégoire** relie de nouveau Netlify au dépôt (Site configuration ▸ Build & deploy ▸ Link repository), puis vérifie le numéro de version en ligne.
5. Dependabot rouvrira ses demandes de fusion sur le nouvel historique. C'est attendu, et c'est sans risque.

Après le poussé, le dossier de travail suivra le nouvel historique. Les fichiers non suivis seront préservés, `core.hooksPath` restera en place, et Vitest sera relancé. Ensuite viennent la mise à jour de la fin du balayage et celle du plan, puis les commits README / LICENSE.

## 5. Ce qui reste dû, une fois tout fini

- Effacer dans `~/purge-travail/` ce qui porte encore les données : `original-monitorage-temoin.git` (l'historique d'avant la purge), `verif-arbre-r2/` et, après la bascule, le bundle d'avant la réécriture. Il faut y ajouter les restes déjà listés dans `RELAIS-PURGE.md`.
- La question du support GitHub (`CHANTIER-historique-git-donnees-personnelles.md`, § 7) reste ouverte. Supprimer le dépôt la rend moins pressante, sans la régler.

## 6. Formes collées (`colles.py`) : comptes de l'original et de la copie

`colles.py` cherche le nom de famille sans aucune frontière de mot ; il touche donc aussi des chevauchements de mots. Il compte les chemins de l'historique, puis ceux de l'arbre.

| Rang | Original `labo-codex` | Copie | Lecture |
|---|---|---|---|
| 0 | 75 (22 dans l'arbre) | 75 (22) | inchangé : auteur publié et chevauchements, triés ce matin |
| 1 | 59 (8) | 59 (8) | inchangé, même motif |
| 3 | 7 (3) | **0** | parti (point 2) |
| 5 | 314 (221) | 314 (221) | inchangé : chevauchements de mots courants |
| 8 | 1 (1) | 1 (1) | inchangé : chevauchement |
| 9 | 2 (0) | **0** | parti (point 1) |

Les rangs inchangés gardent exactement les mêmes comptes : la réécriture n'a touché que les rangs 3 et 9, comme prévu.


## Relecture de Cowork (10 h 26, 16 octobre 2026) – accord pour la voie du dépôt recréé

Relu en entier, puis remesuré de mon côté sur \`~/purge-travail/reecriture2.git\` (accès en lecture seule accordé par Grégoire), sans la liste hors dépôt :

- **Références** : \`main\` et 22 étiquettes, rien d'autre ; 6 041 commits ; aucun chemin \`dist/*.zip\`.
- **Arbre de \`main\`** : 2 809 fichiers, comme \`efffe795\` ; 3 fichiers diffèrent, une ligne chacun (\`.claude-plugin/marketplace.json\`, le plan archivé, le banc), exactement les lignes attendues.
- **Tous les objets** (46 411, messages compris) **et les entrées des 9 zip restants** : 0 occurrence des noms de famille des collègues n° 3 et n° 9, 0 de l'ancien identifiant. Les adresses Gmail qui restent sont celles des auteurs de \`libs/jspdf.umd.min.js\` (attributions de la bibliothèque) ; celle de Grégoire est partie.
- **Ce qui reste, voulu** : le nom entier d'un auteur publié et remercié (un des rangs 0 ou 1) dans la page des remerciements, l'À propos d'\`index.html\`, \`BACKLOG.md\`, \`OU-EN-EST-ON.md\` et quelques documents d'attribution, conformément à la décision du 15 octobre (attributions et remerciements épargnés). Ses mentions dans les zip de \`dist/\` sont parties avec eux.

Accord avec la voie du dépôt recréé : les 9 demandes de fusion ouvertes la rendent obligatoire. Prochain geste : Grégoire supprime et recrée \`labo-codex\` vide et privé.

## Après le poussé (Claude Code, 16 octobre 2026, 10 h 50)

- **Poussé**, sur le signal de Grégoire, vers `labo-codex` recréé vide et privé (14 h 35 UTC) : `main` (`1f46a2ce`) et les 22 étiquettes.
- **Vérifié sur le distant** : les références sont identiques à la copie vérifiée (`git ls-remote` comparé à `for-each-ref`). On y trouve 1 branche, 22 étiquettes, aucun `refs/pull/`, 0 demande de fusion, et le dépôt est privé. Témoin : l'ancien `main`, `efffe795`, ne figure pas sur le distant ; il figure bien dans le bundle d'avant la réécriture.
- **Dossier de travail** : il est réaligné sur `origin/main`. Les étiquettes locales sont remplacées et identiques à la copie, les branches Dependabot élaguées. L'ancien historique est purgé du `.git` local (`reflog expire` puis `gc --prune=now`) : `efffe795` y est absent, et les trois motifs réécrits comptent 0 objet. `CONSIGNE-DU-JOUR.md` modifiée et les 8 fichiers non suivis sont intacts ; `core.hooksPath` vaut `scripts/hooks`.
- **Vitest** (depuis `tests/`) : 763 fichiers sur 763 et 8 917 essais sur 8 917 sont verts.
- **Reste à Grégoire** : relier Netlify au dépôt recréé, puis vérifier le numéro de version en ligne.
