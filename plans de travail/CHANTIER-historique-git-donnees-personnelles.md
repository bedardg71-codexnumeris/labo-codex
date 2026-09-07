# CHANTIER — Purger l'historique git des données personnelles

**Ouvert le 7 septembre 2026.** Décidé par Grégoire, préparé et vérifié, **non exécuté**.
**Ce document est autoportant** : la session qui le reprend n'a pas besoin de la conversation
d'origine. Le travail préparé (copie réécrite, bundle de sauvegarde) vivait dans le conteneur
d'une session web et **n'existe plus** : tout est à refaire, et tout est ici.

> ⚠ **Rien de ce chantier n'est urgent au point d'être bâclé.** Le dépôt est **privé**
> (vérifié le 7 sept. par l'API Netlify, `public_repo: false`). Le risque est réel mais confiné
> à qui a accès au dépôt.

---

## 0. CE QUI EST DÉJÀ FAIT — ne pas le refaire

**Commit `41fe67a8` (7 sept. 2026) : l'ARBRE COURANT est propre.** Les identités réelles qui
traînaient dans des fixtures de test et dans l'aide de l'application en ont été retirées.
Ce chantier-ci ne concerne plus que l'**historique**.

Ce que ce commit a corrigé, pour mémoire :
- un DA et un nom confirmés réels, portés par 31 occurrences, dont `js/accompagnement-contenu-popup.js`
  (l'aide affichée aux utilisateurs) et les deux BACKLOG ;
- sept autres DA à 7 chiffres non synthétiques dans quatre fichiers de test.

---

## 1. CE QUE L'HISTORIQUE CONTIENT — mesuré le 7 septembre 2026

Aucun de ces fichiers n'existe dans l'arbre courant : ils ont tous été retirés à l'époque,
et seul l'historique les garde.

| Ce que c'est | Ampleur |
|---|---|
| `backups-donnees/export-monitorage-*.json` | **19 exports complets de l'application**, oct.–déc. 2025, ~2 Mo chacun. Dump de `localStorage` : chaque valeur est du JSON **encodé en chaîne** (un `grep` de `"da":` ne les voit pas — il faut décoder). Chacun porte **30 élèves réels** : nom, prénom, DA, programme, drapeau services adaptés, plus notes, présences et rétroactions. |
| `docs/A2024/etape1-structure.js`, `import-a2024.js` | **56 élèves** de l'automne 2024 : nom, prénom, DA, un courriel. |
| `Documents de travail (obsolètes)/` | 6 fichiers portent des DA à préfixe réel, dont `ANALYSE_RAI_RISQUE_COMPLETE.md` (114 occurrences). |
| `IMG_3171.jpg` | Photo de la feuille de présences réelle. Déjà signalée au BACKLOG en août. |
| `Archives/Captures modèles/` (53 png), `Audit UX/` (35), `Archives/Bugs/` (2) | Captures d'écran. **Échantillonnées** : celles vues montrent du mode démonstration et des agrégats, pas de noms. Retirées quand même — elles sont déjà hors de l'arbre, leur suppression ne coûte rien. |

### Les DA réels identifiés — **19**, et la liste ne vit plus ici

⛔ **La liste elle-même a été RETIRÉE de ce document le 7 septembre 2026 au soir, sur décision
de Grégoire.** Motif, mesuré le jour même : après le nettoyage `41fe67a8`, ces 19 DA
n'apparaissaient plus **nulle part dans l'arbre courant — sauf ici**. Un document de purge qui
transporte ce qu'il purge est le dernier endroit qui le publie, et le premier que quiconque
ouvrirait. La question s'est posée en pesant un passage du dépôt en **public** : le gain
serait des minutes d'Actions, le coût serait ce bloc.

⚠ **Ce retrait ne touche que l'ARBRE.** Les révisions antérieures de ce fichier gardent la
liste : c'est la réécriture (§4) qui l'emporte, pas ce commit. « Tarir n'est pas réparer »
vaut ici comme ailleurs.

**Ce que sont ces 19** : les DA à 7 chiffres qui avaient fui **dans le code et dans la prose**
(fixtures de test, aide de l'application, BACKLOG, RELAIS). Ce n'est **pas** le registre des
élèves : les exports de `backups-donnees/` en portent bien davantage, et c'est le §1 qui les
dénombre.

**Où retrouver la liste au moment d'exécuter le chantier**, dans cet ordre :

1. **Chez Grégoire.** Il a proposé le 7 sept. de fournir les listes complètes de ses cohortes —
   c'est la meilleure source : elle porte les NOMS autant que les DA, et le §7 dit pourquoi les
   noms sont l'angle mort qui reste. ⛔ **Le fichier qu'il fournit vit HORS du dépôt** (par
   exemple `~/purge-identites.txt`), n'est jamais `git add`é, et n'est jamais recopié dans un
   document versionné — ce serait refaire exactement ce que ce retrait vient de défaire.
2. **À défaut, en les reconstruisant depuis l'historique**, avant la réécriture :

```bash
# les DA que le nettoyage de l'arbre a retirés (sous-ensemble)
git show 41fe67a8 | grep '^-' | grep -oE '\b[0-9]{7}\b' | sort -u
# et, pour le compte complet, un balayage de tous les blobs (cf. §5 C)
```
   ⚠ La première commande ne rend qu'une PARTIE des 19 : elle ne voit que ce que ce commit-là
   a touché. Le balayage du §5 C est la source qui fait foi.

---

## 2. LES DÉCISIONS DE GRÉGOIRE — prises le 7 septembre, à ne pas reposer

1. **Portée maximale**, captures comprises.
2. **Les 129 branches distantes : toutes supprimées sauf `main`.** Sans cela le nettoyage est
   illusoire — une branche non réécrite retient tous les anciens objets. Mesuré ce jour-là :
   64 branches entièrement fusionnées dans `main` (leur contenu y est déjà), **65 portant des
   commits jamais fusionnés** (travail abandonné, dont `audit/2026-mai` à +68 commits). Il a
   accepté de perdre les 65.
3. **Le force-push attend son signal explicite.** Il n'a pas été donné.

---

## 3. LES QUATRE PIÈGES — chacun a été rencontré, aucun n'est théorique

**⚠ 1. « Primo Primavera » est l'enseignant FICTIF de la démonstration.** Il sert aussi de valeur
de repli à l'audit d'attribution Creative Commons (`REPLIS_HISTORIQUES_CONNUS`,
`scripts/audit-attribution-cc.mjs`). Le remplacer casse la démo et l'audit. **Ne pas y toucher.**
Un premier jet l'avait fait, annulé.

**⚠ 2. `libs/jspdf.umd.min.js` contient `br:"‹NOM›"`** — la langue bretonne dans une table de
langues, pas une personne. Un remplacement littéral de « ‹NOM› » **corrompt une bibliothèque
tierce**. Toute règle sur ce nom doit être ancrée sur un contexte (`‹NOM›_<da>_`, `nom: '‹NOM›'`).
↻ **Le nom est masqué en « ‹NOM› » depuis le 7 sept. au soir** : c'est À LA FOIS le patronyme
d'un élève réel ET la langue bretonne. C'est exactement ce qui le rend indétectable — et
c'est pourquoi il ne pouvait pas rester écrit ici. Il se relit dans le fichier hors dépôt (§1).

**⚠ 3. Un remplacement de noms est plus dangereux qu'il n'en a l'air.** « Léa » est le nom du
portail Omnivox, présent partout dans le dépôt. « Roy », « Tremblay », « Jo », « Sam » sont des
noms de banc légitimes. **Ne remplacer que les DA en littéral** (7 chiffres, sans ambiguïté), et
les noms uniquement par regex ancrée.

**⚠ 4. `Exemples de feedback pour Claude/` NE DOIT PAS être supprimé.** C'est le seul de ces
dossiers **encore vivant** dans l'arbre, et ses 14 captures ont été **ouvertes et vérifiées** :
portes terrain et interface Claude, aucune donnée d'élève.

---

## 4. LA MÉTHODE — commandes exactes

`git-filter-repo` n'est pas installé par défaut : `pip install git-filter-repo`.

### 4.1 Le clone du conteneur est SUPERFICIEL

Une session web voit `main` tronqué à quelques dizaines de commits. L'historique réel en compte
~4600, depuis le 20 octobre 2025. **Sans cette étape, on réécrit un historique qu'on n'a pas.**

```bash
git fetch --unshallow --tags
git rev-parse --is-shallow-repository   # doit rendre « false »
git rev-list --count main               # ~4600, pas ~60
```

### 4.2 Sauvegarder

```bash
git bundle create /chemin/hors-du-depot/sauvegarde.bundle --all
git bundle verify /chemin/hors-du-depot/sauvegarde.bundle   # « records a complete history »
```

⚠ Dans une session web, le scratchpad **meurt avec le conteneur**. Pour une sauvegarde qui
survit, demander à Grégoire de la conserver sur son Mac avant de déclencher.

### 4.3 Travailler sur une COPIE

```bash
git clone --no-local /home/user/Monitorage_v6 /chemin/copie
cd /chemin/copie
```

### 4.4 Les deux fichiers de règles

`chemins-a-retirer.txt` — noter que `Exemples de feedback pour Claude/` n'y est PAS (piège 4) :

```
backups-donnees/
docs/A2024/
Documents de travail (obsolètes)/
IMG_3171.jpg
Archives/Captures modèles/
Audit UX/
Archives/Bugs/
```

`regles-texte.txt` — **à GÉNÉRER hors du dépôt, jamais à versionner** (cf. §1 : la table littérale a été retirée d'ici le 7 sept. au soir).

Une ligne par DA réel, chacun vers un substitut synthétique de même forme — c'est ce qui
préserve la lisibilité des diffs anciens au lieu de les trouer :

```bash
# depuis le fichier hors dépôt fourni par Grégoire (un DA à 7 chiffres par ligne)
awk 'NF {printf "%s==>90000%02d\n", $1, NR}' ~/purge-identites.txt > /chemin/hors-du-depot/regles-texte.txt
wc -l /chemin/hors-du-depot/regles-texte.txt   # doit rendre 19 pour les DA connus au 7 sept.
```

⚠ **Le bloc d'origine portait aussi quatre règles pour UN nom de famille réel — retirées ici
le 7 sept. au soir, pour le même motif que les DA : elles le nommaient en clair, quatre fois.**
En voici la FORME, à reconstruire depuis le fichier hors dépôt. `‹NOM›` est le nom réel,
`‹SUBSTITUT›` un patronyme inventé de longueur voisine :

```
regex:‹NOM›_(\d{7})_==>‹SUBSTITUT›_\1_
regex:nom: '‹NOM›'==>nom: '‹SUBSTITUT›'
regex:nom: "‹NOM›"==>nom: "‹SUBSTITUT›"
regex:"nom":"‹NOM›"==>"nom":"‹SUBSTITUT›"
```

▣ **Pourquoi quatre règles et pas une**, et c'est le cœur du piège 2 : ce nom est AUSSI une
langue dans `libs/jspdf.umd.min.js` (`br:"…"`). Les quatre motifs sont donc **ancrés** — suivis
d'un DA, ou précédés de la clé `nom:` sous ses trois graphies. Un `‹NOM›==>‹SUBSTITUT›` nu
corromprait la bibliothèque tierce. Toute règle ajoutée pour un autre nom doit être ancrée de
la même façon, et **éprouvée sur une copie avant d'être lancée**.

⛔ **Les noms ne passent PAS par un remplacement littéral** — pièges 2 et 3 : « ‹NOM› »
est une langue dans `jspdf`, « Primo Primavera » est l'enseignant fictif de la démo. Les noms
que Grégoire fournira demandent une regex ancrée, écrite et éprouvée cas par cas.


### 4.5 Réécrire

```bash
git filter-repo --invert-paths --paths-from-file chemins-a-retirer.txt \
                --replace-text regles-texte.txt --force
```

Résultat obtenu le 7 sept. : **4613 → 4610 commits**, `.git` **158 Mo → 107 Mo**, ~93 secondes.

---

## 5. LES VÉRIFICATIONS — et leurs témoins

> ⚠⚠ **La vérification la plus importante a d'abord été écrite comme une TAUTOLOGIE** : elle
> comparait l'arbre du dépôt réécrit avec lui-même, et rendait « identique » par construction.
> **Toute vérification ici doit être écrite contre le dépôt d'origine, et accompagnée d'un
> témoin qui prouve qu'elle sait rendre « différent ».**

**A. L'arbre courant est-il intact ?** C'est la vérification qui compte : la réécriture ne doit
rien retirer du présent.

```bash
orig=$(cd /depot/original && git rev-parse HEAD^{tree})
reec=$(cd /chemin/copie   && git rev-parse HEAD^{tree})
[ "$orig" = "$reec" ] && echo IDENTIQUE || echo DIFFERENT
# TÉMOIN : la même comparaison contre HEAD~1 de l'original DOIT rendre « différent »
```
Attendu : identique, et les mêmes 1781 fichiers (`git ls-tree -r --name-only HEAD | sort`,
comparé par `diff`).

**B. Les chemins ont-ils disparu de tout l'historique ?**
`git rev-list --objects --all` puis chercher chaque chemin de la liste. Attendu : zéro.

**C. Les DA réels ont-ils disparu ?** Parcourir tous les blobs texte
(`git cat-file --batch`) et chercher les 19 DA — **liste prise dans le fichier hors dépôt du
§1, jamais recopiée ici**. Attendu : zéro.
**TÉMOIN obligatoire** : le même scan sur le dépôt **original** doit les trouver. Mesuré le
7 sept. : **l'un des 19** était présent dans **97 blobs** de l'original, **0** dans la copie.
(Le DA témoin n'est plus nommé ici — il se relit dans le fichier hors dépôt du §1.)

**D. Intégrité** : `git fsck` sans erreur.

---

## 6. LE DÉCLENCHEMENT — sur signal explicite de Grégoire, jamais avant

```bash
cd /chemin/copie
git remote add origin https://github.com/bedardg71-codexnumeris/Monitorage_v6.git
git push --force origin main
git push --force --tags origin
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune
for b in $(git branch -r --format='%(refname:short)' | grep -v HEAD | grep -v '^origin/main$'); do
  git push origin --delete "${b#origin/}"
done
```

⚠ **Avant de déclencher, demander à Grégoire s'il a du travail non commité dans son clone.**
La manœuvre rend son clone irréconciliable.

### Ce que Grégoire devra faire sur son Mac, ensuite

Son clone `~/Documents/GitHub/Monitorage_v6` sert **à la fois** d'arbre de travail et de source
`file://` à son application. Après la réécriture, il ne peut pas être réconcilié : le plus sûr
est de **recloner**.

1. Renommer le dossier actuel en `Monitorage_v6_ancien` — **ne pas l'effacer tout de suite**.
2. Cloner à neuf depuis GitHub Desktop.
3. Ouvrir l'application et vérifier le numéro en bas de page.
4. **Une fois rassuré, supprimer `Monitorage_v6_ancien`** : c'est lui qui contient encore
   l'ancien historique avec les données.

---

## 7. CE QUE CE CHANTIER NE FERA PAS — à dire à Grégoire, pas à taire

- **GitHub garde un temps les anciens objets** accessibles par leur hash. Une purge complète se
  demande au support GitHub, en citant le dépôt et la date de réécriture.
- **Toute copie déjà faite** du dépôt (clone, fork, cache, sauvegarde) garde tout.
- **La prose de l'historique n'a pas été balayée.** Les BACKLOG, SESSION.md et rapports peuvent
  porter des noms isolés, sans DA. Un remplacement littéral y était jugé trop risqué (pièges 2
  et 3). C'est un angle mort assumé, pas un oubli.

---

## 8. ÉTAT

- [x] Audit de l'historique — 7 sept. 2026
- [x] Nettoyage de l'arbre courant — commit `41fe67a8`
- [x] Réécriture préparée et vérifiée sur une copie (perdue avec le conteneur)
- [x] Décisions de Grégoire prises (§2)
- [x] **Liste des 19 DA retirée de ce document** — 7 sept. au soir, sur sa décision (§1)
- [x] **Nom d'élève réel retiré des règles (§4.4) et du piège 2 (§3)** — trouvé en vérifiant
      le retrait des DA : le témoin trouvait encore le fichier. Un seul balayage n'a pas suffi.
- [ ] **Ses listes de cohortes reçues, dans un fichier HORS du dépôt** (noms + DA)
- [ ] **Sauvegarde conservée hors du conteneur, chez Grégoire**
- [ ] **Réécriture rejouée** (§4)
- [ ] **Vérifications avec leurs témoins** (§5)
- [ ] **Déclenchement, sur son signal** (§6)
- [ ] Son clone recloné, l'ancien supprimé (§6)
- [ ] Décider s'il faut écrire au support GitHub (§7)
