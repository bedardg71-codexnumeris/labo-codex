# CHANTIER — Purger l'historique git des données personnelles

**Ouvert le 7 septembre 2026.** Décidé par Grégoire, préparé et vérifié, **non exécuté**.
**Ce document est autoportant** : la session qui le reprend n'a pas besoin de la conversation
d'origine. Le travail préparé (copie réécrite, bundle de sauvegarde) vivait dans le conteneur
d'une session web et **n'existe plus** : tout est à refaire, et tout est ici.

> ⚠ **Rien de ce chantier n'est urgent au point d'être bâclé.** Le dépôt est **privé**
> (vérifié le 7 sept. par l'API Netlify, `public_repo: false`). Le risque est réel mais confiné
> à qui a accès au dépôt.

---

## 0. CONSIGNE D'EXÉCUTION — à lire EN ENTIER avant la première commande

> **Écrite le 7 septembre 2026 au soir, à la demande de Grégoire, pour une reprise À FROID.**
> La session qui exécute n'a pas la conversation d'origine et n'en a pas besoin.
> Le pendant côté Grégoire est `plans de travail/PORTES-TERRAIN-2026-09-07-purge-historique.md`,
> et son artefact : https://claude.ai/code/artifact/75c9b6eb-667a-4c26-96e5-43c99656dd8d

### Les cinq arrêts durs — aucun ne se contourne

1. ⛔ **Le `git push --force` n'a lieu que sur un signal EXPLICITE de Grégoire, donné DANS la
   session qui exécute.** Un accord d'une session précédente ne vaut pas : il a tranché la
   portée en septembre, pas la date. Si le signal n'est pas là, on prépare tout et on s'arrête.
2. ⛔ **Le fichier de listes ne devient JAMAIS un fichier suivi.** Ni `git add`, ni copié dans un
   document versionné, ni recopié dans un message. Il vit hors du dépôt et meurt avec la session.
   Le 7 sept., ce chantier a dû retirer de son propre plan les 19 DA qu'il transportait : ne pas
   refaire ça.
3. ⛔ **Aucune vérification sans TÉMOIN.** Une vérification qui ne sait pas rendre « différent »
   ne prouve rien. La plus importante du chantier avait d'abord été écrite comme une tautologie
   (§5). Chaque contrôle du §5 porte son témoin : l'exécuter aussi, et le dire.
4. ⛔ **La sauvegarde doit SORTIR du conteneur.** Le premier travail préparé est mort avec lui
   (bundle et copie réécrite). Tant que Grégoire n'a pas le bundle sur son Mac, on ne déclenche
   rien.
5. ⛔ **Si un contrôle du §5 échoue, on s'arrête et on rapporte.** On ne pousse pas « pour voir ».

### L'ordre, et rien d'autre

| # | Geste | Où c'est écrit |
|---|---|---|
| 1 | Lire ce document en entier, puis la porte terrain jumelle | — |
| 2 | **Recevoir le fichier de listes** de Grégoire, hors du dépôt | §1, format ci-dessous |
| 3 | `git fetch --unshallow` — **le clone du conteneur ne voit que ~60 commits sur 4625** | §4.1 |
| 4 | Mesure d'ENTRÉE : le balayage des DA sur le dépôt d'origine (c'est le témoin du §5 C) | §5 C |
| 5 | Bundle de sauvegarde → **le faire descendre chez Grégoire** | §4.2 |
| 6 | Travailler sur une COPIE, jamais sur le clone de session | §4.3 |
| 7 | Générer les deux fichiers de règles depuis sa liste | §4.4 |
| 8 | Réécrire (`git filter-repo`) | §4.5 |
| 9 | Les quatre vérifications A, B, C, D — **avec leurs témoins** | §5 |
| 10 | **Demander son signal.** S'il ne vient pas : rapporter et s'arrêter | §6 |
| 11 | Force-push, puis suppression des 128 branches distantes sauf `main` | §6 |
| 12 | Lui dire ce qui reste dû : recloner, et la question du support GitHub | §6, §7 |

### Ce qu'il faut lui redemander avant de déclencher — même s'il a déjà répondu

- **A-t-il du travail non commité dans son clone ?** La manœuvre le rend irréconciliable.
- **Confirme-t-il encore la perte des 65 branches non fusionnées ?** Il l'a acceptée le
  7 septembre ; du temps a pu passer, et c'est une perte sèche.
- **Veut-il que le chantier tourne depuis son Mac plutôt que depuis un conteneur ?** C'est là
  que vit sa liste, et c'est là qu'il devra recloner de toute façon.

---

## 0 bis. CE QUI EST DÉJÀ FAIT — ne pas le refaire

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
élèves : les exports de `backups-donnees/` portent un tout autre ensemble, plus large.

▣ **BALAYAGE COMPLET DE LA BASE D'OBJETS — 7 sept. au soir, 36 066 objets en 37 s.**
**197 blobs** portent au moins un des 19 DA, sur **10 chemins** seulement :

| blobs | chemin |
|---|---|
| **182** | `BACKLOG.md` |
| 5 | `js/travaux-import.js` |
| 2 + 2 + 1 + 1 + 1 + 1 | six fichiers de `tests/` |
| 1 | `BACKLOG-ARCHIVE.md` |
| 1 | ce fichier-ci |

⚠⚠ **`backups-donnees/` n'apparaît PAS dans cette liste — pas un seul blob.** Les 19 DA ne sont
donc **pas** ceux des exports : ce sont ceux qui ont fui dans les documents. **92 % du travail
de réécriture, pour ces 19, porte sur l'historique du seul `BACKLOG.md`.**
⮕ **Ce que ça change** : le tableau du §1 laisse croire que le gros du risque est dans les
exports. Pour les DA identifiés, c'est faux. Les exports restent à retirer (§4.4,
`chemins-a-retirer.txt`) et ils portent bien davantage d'élèves — **mais on ne connaît pas leurs
DA**, et aucune règle de remplacement ne les couvre. C'est exactement ce que les listes de
Grégoire viendront combler.
⚠ Compté sur l'inventaire d'objets pris **avant** les retraits du 7 sept. au soir : c'est la
photo d'origine, celle qui sert de témoin (§5 C).

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

**⚠ 2. Le patronyme ‹NOM› est AUSSI un mot qui existe ailleurs — mais le cadrage d'origine
était faux, et il rendait la règle inopérante.** ↻ **Repris le 7 sept. au soir, sur correction
de Grégoire : « il n'y a aucune référence à la langue bretonne, c'est un vrai nom de famille ».**

▣ **CE QUI A ÉTÉ MESURÉ, fichier par fichier.** Le mot n'apparaît qu'**UNE fois** dans tout
l'arbre : `libs/jspdf.umd.min.js`, sous la forme `br:"…"`, entre `bs:"Bosnian"` et
`bg:"Bulgarian"` — la table ISO-639 de jsPDF, code tiers *vendorisé* (en-tête `@license`), que
personne ici n'a écrit. ⮕ **Grégoire a raison sur ce qui compte** : le projet ne parle nulle
part de cette langue. **Tout ce que nos sessions ont écrit avec ce mot désignait l'élève.**

⛔⛔ **ET LA CONSÉQUENCE EST GRAVE POUR LA RÈGLE.** Le plan prescrivait quatre regex ancrées
(`‹NOM›_<da>_`, `nom: '‹NOM›'`, `nom: "‹NOM›"`, `"nom":"‹NOM›"`) pour ne pas toucher jsPDF.
**Aucune des quatre n'attrape le nom écrit en PROSE** — et c'est précisément là qu'il dormait :
mesuré dans `BACKLOG.md`, à l'intérieur d'une phrase. La règle ancrée aurait laissé le nom dans
l'historique du BACKLOG en croyant l'avoir purgé. **Une ancre qui protège une bibliothèque
protège aussi ce qu'on cherche à effacer.**

⮕ **RÈGLE À RETENIR, plus simple et plus sûre** : remplacement **littéral** du nom, sans ancre.
Son seul effet de bord est de renommer une étiquette de langue dans jsPDF — inerte
fonctionnellement (une valeur d'affichage dans une table), mais le fichier diffère alors de
l'amont. Deux issues, au choix, à décider au moment d'exécuter :
  a) restaurer `libs/jspdf.umd.min.js` depuis son blob d'origine après la réécriture ;
  b) assumer l'écart d'un mot, en le notant pour la prochaine remise à jour de la bibliothèque.

↻ Le nom lui-même est masqué en « ‹NOM› » ici depuis le 7 sept. — il se relit dans le fichier
hors dépôt (§1).

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
Retours des testeurs/bruno/
Retours des testeurs/elise/
Retours des testeurs/jean-françois/
Retours des testeurs/jordan/
Retours des testeurs/mathieu/
Retours des testeurs/olivier/
Retours des testeurs/stephane/
Archives/Retours des testeurs/
Autres pratiques de notation/
Archives/Autres pratiques de notation/
Archives/Beta-95-2/js/pratiques/config-francois-chimie.js
Archives/Beta-95-2026-01-04/js/pratiques/config-francois-chimie.js
dist/Beta_91.2_Complet/js/pratiques/config-francois-chimie.js
dist/Beta_91.2_Utilisateurs/js/pratiques/config-francois-chimie.js
dist/Beta_91.5_Correctifs/js/pratiques/config-francois-chimie.js
dist/Beta_91.5b_Correctif/js/pratiques/config-francois-chimie.js
dist/Beta_91.5c_Correctif/js/pratiques/config-francois-chimie.js
dist/Beta_91.5d_Primo/js/pratiques/config-francois-chimie.js
dist/Beta_92_Primo/js/pratiques/config-francois-chimie.js
dist/Monitorage_Beta_0.92/js/pratiques/config-francois-chimie.js
js/pratiques/config-francois-chimie.js
```

⮕ **Ajouté le 15 oct. 2026 au soir** (consigne `CONSIGNE-LOT-2026-10-15-avant-la-purge.md`, décisions de Grégoire de 14 h 51 à 15 h 08) : les sept dossiers de retours de collègues, l'ancien emplacement `Archives/Retours des testeurs/` (12 chemins), le répertoire « Autres pratiques de notation » aux deux emplacements (110 chemins, 56 fichiers distincts, rendus à Grégoire hors du dépôt le 15 oct.), et les copies de la configuration de pratique nommée d'après un collègue (11 chemins, trouvés par mesure des noms de chemin de l'historique). ⚠ **`Retours des testeurs/grégoire/`** (avec accent ; 2 entrées : une capture d'écran ajoutée le 10 sept., retirée le 12) n'y est PAS encore : elle montre le journal de bord d'un élève réel, nom compris. **À trancher par Grégoire** avant la purge ; si elle part, ajouter la ligne ici.

`regles-texte.txt` — **à GÉNÉRER hors du dépôt, jamais à versionner** (cf. §1 : la table littérale a été retirée d'ici le 7 sept. au soir).

Une ligne par DA réel, chacun vers un substitut synthétique de même forme — c'est ce qui
préserve la lisibilité des diffs anciens au lieu de les trouer :

**Le format des listes de Grégoire — ↻ REVU LE 7 SEPT. AU SOIR, SUR SES LISTES RÉELLES.**
Il en a **dix** (cohortes de l'hiver 2025 à l'automne 2026, y compris un H25 où il n'a enseigné
que deux ou trois semaines — les élèves y sont quand même). Le format est celui de l'export du
collège, **séparé par des points-virgules** :

```
No de DA;Groupe;Nom de l'étudiant;Prénom de l'étudiant;Prog.;Services adaptés;
```

⮕ **NE RIEN LUI FAIRE REFORMATER.** Un dossier, les dix fichiers déposés tels quels :

```
~/purge-identites/          ← un DOSSIER, pas un fichier
```

⛔⛔ **PAS dans `Documents`, PAS sur le Bureau, PAS dans le dépôt.** macOS sait synchroniser
`Documents` et `Bureau` vers iCloud, et cette option est souvent active sans qu'on y pense :
la liste partirait alors chez Apple — **une copie de plus, exactement ce que ce chantier
cherche à supprimer.** Le dossier personnel lui-même (`/Users/<nom>/`) n'est pas synchronisé.
⮕ Dans le Finder : **Aller ▸ Départ** (`⌘⇧H`), puis créer le dossier là.
⚠ **Le nom s'écrit sans accent et sans espace** — `purge-identites` — sinon les commandes
deviennent fragiles.
⮕ **Et il se supprime une fois le chantier fini** (rangée 2.5 de la porte terrain).

**Pourquoi un dossier et non un document unique** : concaténer dix exports à la main, c'est dix
occasions d'abîmer une ligne, et la provenance se perd. Le script lit le dossier, détecte le
séparateur, saute les lignes d'en-tête, et **déduplique par DA** (un élève inscrit deux
trimestres apparaît deux fois).

⚠ **L'encodage peut être du Latin-1** (un export ouvert dans Excel puis réenregistré) : les
accents arrivent alors abîmés. **Qu'il ne se batte pas avec** — le script détecte et convertit.
Se battre avec un encodage à la main, c'est perdre un « é » et rater un nom.

▣ **Les colonnes `Prog.` et `Services adaptés` ne sont PAS à purger** : un code de programme
n'identifie personne, et le drapeau des services adaptés devient anonyme dès que le nom et le
DA sont partis. La colonne `Groupe`, elle, sert à départager les cohortes et à repérer les
doublons.

⚠ **Fichier hors dépôt, jamais `git add`é.** Un élève absent des listes survivra à la purge sans
que rien ne le signale : **c'est la seule pièce que la machine ne peut pas deviner.**

```bash
# depuis le fichier hors dépôt fourni par Grégoire (colonne 1 : le DA)
awk -F'\t' '$1 ~ /^[0-9]{7}$/ {printf "%s==>90000%02d\n", $1, NR}' ~/purge-identites.txt > /chemin/hors-du-depot/regles-texte.txt
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

### ⛔⛔ LES PRÉNOMS NE SE REMPLACENT PAS COMME LES NOMS — mesuré le 7 sept. au soir

**C'est le piège le plus coûteux du chantier, et il n'avait pas été vu.** Un remplacement
littéral convient à un nom de famille ; appliqué à un prénom, **il détruit le dépôt**. Mesuré
sur l'arbre courant, en cherchant des prénoms courants au hasard :

| jeton | occurrences | ce que c'est en réalité |
|---|---|---|
| **Léa** | **214** | **la plateforme du collège** — « Reporter dans Léa », l'export, la porte terrain du 7 sept. |
| Alice | 66 | l'élève FICTIVE des bancs (« Assidu, Alice ») |
| Rose | 57 | une **couleur** de `styles.css` (`#ff6f91`) |
| Camille | 24 | le pack de démonstration |
| Olivier | 23 | un **collègue testeur** (`Retours des testeurs/olivier/`) |

⮕ **Si une seule élève de Grégoire s'appelle Léa, un remplacement littéral casse 214 mentions
de la plateforme.** Aucun test ne l'attraperait : ce sont des documents.

**La règle, en trois temps :**
1. **Les DA** — remplacement littéral, sans réserve. Sept chiffres, aucune ambiguïté possible.
2. **Les noms de famille** — remplacement littéral, **mais après comptage** (voir ci-dessous).
3. **Les prénoms — JAMAIS littéralement.** Seulement ancrés à un contexte qui prouve qu'il
   s'agit d'une personne : `prenom: '‹PRÉNOM›'`, `‹NOM›_‹PRÉNOM›_<da>`, `"prenom":"‹PRÉNOM›"`.
   ▣ **Et le plus souvent, ne rien faire suffit** : une fois le nom de famille et le DA partis,
   un prénom seul n'identifie personne dans un cégep de plusieurs milliers d'élèves.

**⚠ ÉTAPE OBLIGATOIRE AVANT DE GÉNÉRER LES RÈGLES — le comptage des collisions.** Pour chaque
nom et chaque prénom de ses listes, compter les occurrences dans le dépôt, et **présenter à
Grégoire tout jeton qui dépasse une poignée d'occurrences** avant d'écrire la moindre règle :

```bash
# hors dépôt : un rapport de collisions, à lire AVANT de purger
while IFS=';' read -r da grp nom prenom reste; do
  n=$(git grep -o -w -F "$nom" 2>/dev/null | wc -l)
  p=$(git grep -o -w -F "$prenom" 2>/dev/null | wc -l)
  [ "$n" -gt 3 ] && echo "NOM      $nom : $n occurrences — À VÉRIFIER"
  [ "$p" -gt 3 ] && echo "PRÉNOM   $prenom : $p occurrences — À VÉRIFIER"
done < <(cat ~/purge-identites/*)
```
⮕ Ce rapport ne se lit pas en diagonale : c'est lui qui distingue un patronyme rare d'un mot
que le projet emploie tous les jours.


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
**TÉMOIN obligatoire, étendu le 15 oct. 2026** : le même balayage sur le dépôt **original** doit trouver chacun des chemins ajoutés ce jour-là. Mesuré sur l'original le 15 oct. (`git log --all --name-only --format=`, chemins distincts) : 24 sous les sept dossiers de `Retours des testeurs/` ; 12 sous `Archives/Retours des testeurs/` ; 56 sous `Autres pratiques de notation/` et 54 sous `Archives/Autres pratiques de notation/` ; 11 copies de `config-*-chimie.js`. Sur la copie réécrite, chacun de ces comptes doit tomber à 0 ; sur l'original, il doit rester le même (sinon le balayage ne sait pas trouver).

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
- [x] **Balayage complet de la base d'objets** — 7 sept. : 197 blobs, 10 chemins, 182 dans BACKLOG.md (§1)
- [x] **Piège 2 recadré** sur correction de Grégoire : la règle ancrée était inopérante (§3)
- [ ] **Sauvegarde conservée hors du conteneur, chez Grégoire**
- [ ] **Réécriture rejouée** (§4)
- [ ] **Vérifications avec leurs témoins** (§5)
- [ ] **Déclenchement, sur son signal** (§6)
- [ ] Son clone recloné, l'ancien supprimé (§6)
- [ ] Décider s'il faut écrire au support GitHub (§7)
