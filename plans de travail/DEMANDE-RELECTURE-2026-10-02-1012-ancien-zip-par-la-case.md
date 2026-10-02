# Demande de relecture – #1012, suite : l'ancien `.zip` ouvert par la case ne fait plus perdre de copies

> Écrite par Claude Code le 2 octobre 2026 à 7 h 36 (Toronto, mesurée par `date`), sur la consigne de Cowork de 6 h 54.
> Branche locale `fix-1012-ancien-zip-par-la-case`, commit `d49e7100`, partie de `main` à `b5d3770b`. **Ni release, ni push du code.** Version : 1.174.0, inchangée.
> Ce chemin écrit les données de l'usager : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce qui est codé** : quand tu ouvres un ancien fichier `.zip` par « Ouvrir un Codex… » de Réglages › Données et que tu coches « Fichiers travaux », ses copies **s'ajoutent** aux tiennes. Avant, elles prenaient leur place : tes copies disparaissaient de la liste, et « Mettre à jour le codex » écrivait ensuite un codex sans elles, sans rien dire.
- **Ce que j'ai trouvé autour** : dans la même fenêtre, les cases « Annotations », « Notes », « Étudiants » et « Présences » remplacent encore ce que tu as. La plus lourde : avec « Annotations » cochée, les annotations de tes copies sont remplacées par celles du fichier. Mesuré, inscrit, rien n'est corrigé.
- **Ce qui t'attend** : rien avant la relecture de Cowork. Ensuite, la ligne des « Nouvelles » (§ 11). Et un mot à me donner : l'écriture dans `BACKLOG.md` m'a été refusée par le garde de permissions ce matin (§ 1).
- **Ce que j'ai supposé** : que ta transmission de la consigne à 6 h 55 vaut ton « oui » de 6 h 54, rapporté par Cowork ; et que la règle « s'ajoutent, sans rien effacer » posée par Cowork est la tienne (ta limite du 20 septembre).

## 1 · D'abord

**Fait** (`b5d3770b`, sur `main`, non poussé) : le résultat de la porte est inscrit dans `PORTES-TERRAIN-2026-10-01-1012-avertissement.md` (§ 5), `RELAIS.md` et `OU-EN-EST-ON.md` ; les deux fichiers de Cowork qui traînaient sont commités tels quels (la consigne de 6 h 54, l'ancienne consigne archivée, identique à celle commitée hier, par `diff`).

**⚠ Dû, non fait** : les inscriptions sous #1012 dans `BACKLOG.md`. L'écriture dans ce fichier a été **refusée par le garde de permissions** à 6 h 57 (« Modify Shared Resources »). Je n'ai rien contourné. Le texte des lignes dues est au § 10, prêt à poser. Les deux autres fichiers ont été écrits sans refus.

## 2 · Le défaut, remesuré avant de corriger

**Lu sur `main`** (`js/import-export.js`, l. 2932 à 2940) : le défaut vivait bien là. Pour chaque clé de liste de copies du fichier, `await db.set(cleFT, fichiersTravaux)`.

**Reproduit par le geste**, sur le code non corrigé, par le banc neuf (rouge, deux passes) : le codex A ouvert en entier par le menu, donc tenu, trois copies ; puis la case « Ouvrir un Codex… », l'ancien `.zip` de la fixture de 1.172.0 (une copie), tout coché ; puis « Mettre à jour le codex ».

| | Avant le correctif (mesuré) | Après (mesuré) |
|---|---|---|
| Liste des copies de l'espace après l'import | 1 entrée : celle du fichier | 4 entrées : les 3 de A, intactes, puis celle du fichier |
| Fichiers au magasin | 4 (les 3 de A sans rien qui les désigne) | 4, tous désignés |
| « Mettre à jour le codex » | écrit dans A, sans fenêtre : **1 copie** | écrit dans A, sans fenêtre : **4 copies** |

## 3 · La règle appliquée

**Les copies du fichier s'ajoutent à celles de l'espace. Aucune copie déjà là ne perd son entrée, et aucune entrée déjà là n'est réécrite.**

**Une copie dont l'identifiant existe déjà.** Ce que le code faisait (**mesuré par le geste**, banc (3) sur le code non corrigé, un `.zip` dérivé de la fixture portant les trois identifiants de A) :

- **l'entrée** de l'espace était remplacée par celle du fichier (autre nom, autre élève, autre production) ;
- **le fichier au magasin** était remplacé par celui du `.zip` (même identifiant, le dépôt écrase) ; le fichier revenu était rangé sous l'élève et la production du fichier ;
- une copie « exporte » de l'espace retrouvait une entrée et un fichier venus du `.zip`.
- **Lu, non exécuté** : si le `.zip` ne portait pas le fichier, l'entrée venue du fichier était marquée « manquant », alors que le fichier de l'espace était toujours au magasin.

**La règle retenue : l'espace l'emporte.** L'entrée n'est pas réécrite ; le fichier au magasin n'est pas remplacé.

**Une seule exception, et elle ne détruit rien** : le magasin n'a **pas** de fichier pour cette copie, son entrée n'est pas « exporte », et le `.zip` en porte un. Le fichier entre alors, rangé sous l'élève et la production de l'espace, et un statut « manquant » redevient « present » (ce que fait déjà le geste « Re-déposer », `js/travaux-import.js`, l. 1613). Rien d'autre de l'entrée ne bouge.

**Pourquoi l'exception** (décision de moi, à relire) : sans elle, la règle « ne rien toucher » retirait une chose qui marchait. Avant ce lot, une copie dont le fichier s'était perdu pouvait le retrouver en rouvrant par la case un ancien `.zip` qui le portait. Avec l'exception, elle le peut toujours. L'autre choix (ne jamais rien déposer pour un identifiant déjà là) est plus court d'une vingtaine de lignes ; si tu le préfères, il se pose en retirant la boucle `sansFichier`.

**Les garde-fous de l'exception** : une copie « exporte » n'est jamais recomblée (elle a quitté l'application, c'est voulu) ; si le magasin ne répond pas pour une copie, rien n'est déposé (dans le doute, on ne remplace pas) ; « revenu » se lit au magasin après le dépôt, pas dans le compte de la restauration.

**Pas `fusionnerParIdentite`** (#448) : devant un même identifiant au contenu différent, elle renomme l'entrant et garde les deux. Pour une copie, l'identifiant est aussi la clé de son fichier au magasin : une entrée renommée n'aurait pas de fichier.

**Aucun mot neuf à l'écran.** Les phrases du bilan sont celles d'avant ; leurs nombres disent maintenant ce qui est entré, pas ce que le fichier contenait.

## 4 · Ce qui change dans le code

Un seul fichier de `js/` : `js/import-export.js` (et son jeton dans `index.html`).

| Pièce | Rôle |
|---|---|
| `fusionnerCopiesImportees(copiesEspace, copiesFichier)` (neuve, pure, exposée pour ses essais) | rend la liste de l'espace, intacte et dans son ordre, puis les copies neuves ; rend à part les entrées **de l'espace** dont l'identifiant est aussi dans le fichier |
| `_ajouterCopiesImportees(listesDuFichier, zipTravaux)` (neuve) | pour chaque clé : fusionne, n'écrit la liste que si une copie neuve entre ; choisit les fichiers à déposer (les neuves, et les « déjà là » sans fichier au magasin) ; redit « present » pour un fichier revenu |
| `_entreesZipDeLaCopie(zip, id)` (neuve) | l'expression qui trouve le fichier d'une copie dans le `.zip`, extraite de `_restaurerBlobsDepuisZip`, qui l'emploie aussi |
| `executerImportSelectif`, bloc de la case | passe par `_ajouterCopiesImportees` ; n'écrit plus la liste du fichier ; ne compte un import que si une copie ou un fichier est entré |
| `_restaurerBlobsDepuisZip` | inchangée dans ce qu'elle rend (la sentinelle #613 tient sa forme) ; son commentaire d'en-tête nommait un appelant qui n'existe pas (`executerImport()`), corrigé |

## 5 · Autour : ce que les autres cases de cet import remplacent (point 3 ; rien n'est corrigé)

**Mesuré par le geste** (sonde jetable à 7 h 10, retirée ; un espace semé, l'ancien `.zip` de la fixture, tout coché) pour les quatre premières lignes ; **lu** pour les autres.

| Case | Ce qu'elle fait | Ce qui devient orphelin ou se perd |
|---|---|---|
| **Annotations** | remplace la liste des annotations du trimestre (`db.set`) | **mesuré** : les 2 annotations des copies de l'espace n'y sont plus, il reste celle du fichier. Depuis ce lot, les copies de l'espace restent : elles restent **sans leurs annotations**. La mise à jour du codex écrit ensuite cet état dans le fichier tenu. |
| **Notes** | remplace trois familles de clés (`evaluations`, `evaluationsSauvegardees`, `notesEtudiants`) | **mesuré** : l'évaluation de l'espace n'y est plus. **Lu** : une copie porte l'identifiant de son évaluation (`evaluationId`) ; elle pointe alors sur rien. |
| **Étudiants** | remplace la liste du groupe | **mesuré** : l'élève de l'espace absent du fichier n'a plus d'entrée ; sa copie reste, attachée à un élève qui n'est plus dans le groupe. |
| **Présences** | remplace l'objet entier du trimestre | **mesuré** : après l'import, les dates sont celles du fichier. **Lu** : une date de l'espace absente du fichier disparaît. |
| Configuration du cours | remplace modalités, infos du cours, liste des cours, trimestres | l'écran le dit (« Attention : cette option remplacera ta configuration actuelle »). **Lu.** |
| Groupe-cours, Horaires, Enseignants | remplacent | **lu** : une copie porte l'identifiant de son groupe-cours. |
| Cadre du trimestre | remplace | l'écran le dit (« remplace bornes, journées sans cours et séances »). **Lu.** |
| Grilles, échelles, cartouches, productions, pratiques | **s'ajoutent** (fusion par identité, #448) | rien. **Lu.** |

**Les mots de l'aperçu et du résumé, pour la case des copies** : aucun ne dit « remplace ». L'aperçu dit « Fichiers travaux », « N fichier(s) PDF + N blob(s) dans le ZIP », « Indispensable pour consulter les travaux annotés dans la visionneuse ». Rien à relever de ce côté. **Deux relevés de mots, sans y toucher** : (a) l'aperçu compte les copies du fichier, le bilan compte celles qui sont entrées : pour un fichier dont les copies sont déjà là, l'un dit « 3 fichier(s) », l'autre ne dit rien ; (b) quand un fichier revient sans qu'aucune copie neuve entre, le bilan dit « 0 fichier(s) travaux + 1 PDF restauré(s) » : c'est juste, et c'est maladroit.

**Deux autres lectures, hors de la question posée (lues, non exécutées)** :

- **Les copies d'un collègue ne sont pas retenues comme ses élèves.** Devant le fichier d'un collègue, les cases Étudiants, Présences et Notes sont retirées (« Partage impossible ») ; la section « Fichiers travaux » et « Annotations », elle, s'affiche dès que le fichier en porte (`js/import-export.js`, section de la fenêtre), et l'import des copies ne lit pas ce blocage. Des copies d'élèves d'un collègue pourraient donc entrer.
- **`executerImportLocalStorageBrut` remplace toutes les clés de l'espace, liste des copies comprise, et je ne lui trouve aucun bouton** : il n'est appelé que par `executerImportConfigComplete` quand le format est « localStorage-brut », et ce format ouvre l'autre fenêtre, dont le bouton est `executerImportSelectif`. Code dormant, par lecture seulement.

## 6 · Source et stock (point 4)

**Ce lot tarit la source. Il ne touche pas le stock.** Chez qui a déjà fait cet import, les copies de l'espace d'alors sont au magasin sans entrée ; rien n'est réparé d'office.

**Peut-on les reconnaître ? Oui, en partie.** Un fichier du magasin dont l'identifiant ne figure dans aucune des trois familles de listes qui désignent des fichiers (`fichiersTravaux`, `corbeilleFichiers`, `fichiersModelisation`) est sans entrée ; le recensement existe déjà après l'ouverture d'un codex (`js/codex.js`, `CLES_REFERENCANT_BLOBS`, `blobsOrphelins`). Chaque fichier du magasin garde avec lui le numéro de l'élève, l'identifiant de la production et la date du dépôt (`db.storeBlob`). Ce qui est perdu avec l'entrée : le nom du fichier, son type, son groupe-cours, son lien à une évaluation.
**Ce qu'on ne peut pas dire** : qu'un fichier sans entrée vient de **cet** import plutôt que d'une autre cause. Rien ne le marque.

**Les dix fichiers sans liste trouvés chez Grégoire le 1er octobre à 17 h 03** : je ne sais pas s'ils en sont, et je n'ai pas relu son espace. La sonde d'hier les a comparés aux listes de copies seulement ; elle les supposait dans la corbeille ou la modélisation (inféré, non compté). **Ce qu'il faudrait pour le savoir**, en lecture seule, avec son accord : (1) refaire le compte contre les trois familles de listes : ceux qui sont dans la corbeille ou la modélisation ne sont pas orphelins ; (2) pour ceux qui restent, lire au magasin le numéro d'élève, la production et la date du dépôt, des nombres et des dates seulement ; (3) lui demander s'il a déjà ouvert par la case un ancien `.zip` avec « Fichiers travaux » cochée : sans ce geste, la cause n'est pas celle-ci ; (4) si oui, chercher ces identifiants dans la liste d'un ancien fichier à lui : un identifiant listé là et absent de son espace signerait le remplacement.

## 7 · La preuve

**Les essais.**

| Banc | Ce qu'il tient |
|---|---|
| `tests/integration/codex-1012-ancien-zip-par-la-case.spec.js` (neuf, 3 essais, par le geste : la case, la fenêtre aux cases, le menu Codex) | (1) A tenu, l'ancien `.zip`, tout coché : les trois entrées de A intactes, celle du fichier entrée, un seul dépôt au magasin, le bilan compte une copie ; le même fichier rouvert ne double rien ; « Mettre à jour le codex » écrit dans A, sans fenêtre, quatre copies et quatre entrées. (2) témoins : l'ancien `.json` sans copies, puis l'ancien `.zip` avec la case des copies décochée, ne touchent ni la liste ni le magasin ; la mise à jour écrit trois copies. (3) un identifiant déjà là, sur un `.zip` dérivé de la fixture à l'exécution : la copie qui a son fichier ne bouge pas ; la copie « manquant » retrouve son fichier et redevient « present », rangée sous l'élève de l'espace ; la copie « exporte » ne bouge pas ; un fichier absent du `.zip` ou refusé faute d'espace ne change rien ; seule la case des copies cochée, c'est un import réussi et compté ; le magasin qui ne répond pas, rien n'est déposé. |
| `tests/unit/import-1012-copies-ajoutees.test.js` (neuf, 8 essais) | la règle pure (`fusionnerCopiesImportees`) : rien de l'espace ne sort, l'entrée de l'espace est la même, pas une copie ; un doublon du fichier n'entre qu'une fois ; listes absentes. Et le verrou de structure : la case passe par `_ajouterCopiesImportees`, qui n'écrit une liste que par la fusion (tranches bornées à la fonction suivante, garde de non-vide). |

**Les mutations** de `js/import-export.js`, une à la fois, par un pilote ; restauration par copie, empreinte identique après chacune (`c99fffee44d9d09a`) ; chaque rouge lu sur son assertion.

| État muté | Rouge sur |
|---|---|
| M1 – la case remplace de nouveau la liste (le code d'avant) | (1), la liste et le codex écrit ; le verrou de structure |
| M2 – devant un même identifiant, l'entrée du fichier remplace celle de l'espace | (3), la copie 1 ; l'essai unitaire |
| M3 – le fichier d'une copie déjà là est remplacé même quand le magasin l'a | (3), « le fichier de l'espace n'est pas remplacé » |
| M4 – un fichier absent du magasin ne revient jamais | (3), la copie 2 |
| M5 – le fichier revient même pour une copie « exporte » | (3), la copie 3 |
| M6 – le fichier revient, le statut reste « manquant » | (3), le statut de la copie 2 |
| M7 – le statut redevient « present » sans que le fichier soit revenu | (3), « la copie 2 reste manquant » |
| M8 – une copie déjà là est marquée par un `.zip` qui ne porte pas son fichier | (3), « la copie 1 n'est pas marquée » |
| M9 – les copies du fichier n'entrent pas dans la liste | (1) ; cinq essais unitaires |
| M10 – le bilan compte les copies du fichier, pas celles qui sont entrées | (1), au second import ; (3), les deux bilans |
| M11 – la case des copies décochée importe quand même | (2) |
| M12 – le fichier revenu est rangé sous l'élève du fichier | (3) ; l'essai unitaire |
| M13 – dans le doute, le fichier est remplacé | (3), « aucun dépôt » |
| M14 – un même identifiant deux fois dans le fichier entre deux fois | l'essai unitaire |
| M15 – un fichier revenu seul ne compte pas comme un import | (3), le bilan entier |
| M16 – le bilan dit « 0 fichier(s) travaux » quand rien n'est entré | (1), au second import |

Seize mutations, vingt et un états jugés, vingt et un rouges. **Un rouge ne jugeait rien** au premier passage : M8 était rouge par un chargement de page expiré (`page.goto`, 15 s, machine chargée à 7 de moyenne). Le chargement du banc a reçu son propre budget (60 s) et M8 a été rejouée seule : rouge sur son assertion.

**Le contrôle final**, sur le fichier restauré à l'empreinte de référence :

- Playwright, sans reprise, sept bancs : celui du lot et ses six voisins (`lot-i-bis-anciens-fichiers-s-ouvrent`, `lot-i-bis-la-case-ouvre-un-codex`, `codex-1012-avertissement`, `codex-1012-fichier-d-origine`, `codex-1011-ouvert-sans-espace`, `import-cartouche-renommee-654`) : **32 essais verts**. Les trois bancs du dépôt qui passent par l'import par cases y sont (`grep -rl "executerImportSelectif\|import-fichiersTravaux" tests/integration` en rend trois). Le banc des anciens fichiers tient ses empreintes de 1.172.0 : sur un espace vide, l'ancien `.zip` restitue les mêmes données, clé par clé, et le même bilan.
- **Vitest complet : 670 fichiers, 7 901 essais verts**, aucune erreur hors essai (`grep "Errors\|Unhandled"` : rien). Avant le lot : 669 fichiers, 7 893 essais.
- `index.html` : le jeton anti-cache de `js/import-export.js` (`20261002a`), exigé par le hook de commit.

**Audit statique des 116 lignes ajoutées à `js/`** (`git diff HEAD -- js/ | grep "^+"`) : aucun `innerHTML`, aucun gestionnaire en ligne, aucun `eval`, aucun `console.log`. Deux écritures au stockage, toutes deux dans `_ajouterCopiesImportees` : la liste fusionnée, et la liste relue pour redire « present ». Les blobs du `.zip` passent toujours par `validerMagicBytes` (dans `_restaurerBlobsDepuisZip`, inchangée). Aucun nom d'élève réel : le jeu est fictif.

## 8 · Écarts avec la consigne

- **`BACKLOG.md` non écrit** (§ 1) : refus du garde de permissions.
- **La règle pour un identifiant déjà là porte une exception** (le fichier absent du magasin revient) que la consigne ne nommait pas ; elle est sans perte, dite au § 3, et se retire en un geste.
- **Le témoin de la consigne** (« l'import d'un fichier sans copies ne touche pas la liste ») est tenu deux fois : l'ancien `.json`, et l'ancien `.zip` avec la case des copies décochée.
- **La sentinelle #613** fixe au caractère près la forme du bilan de `_restaurerBlobsDepuisZip`. Ma première écriture y ajoutait un champ : Vitest l'a refusée (1 rouge sur 7 901). Je n'ai pas réancré la sentinelle : j'ai retiré le champ, et « revenu » se lit au magasin.

## 9 · Ce qui reste inféré, ce qui n'est pas fait

- **Chrome** : le banc tourne dans WebKit, avec une fausse poignée de fichier et un magasin de copies en mémoire. Que « Mettre à jour le codex » écrive bien les quatre copies dans le vrai fichier de Chrome n'est pas exécuté.
- **Le vrai magasin** (IndexedDB, ou le dossier sur disque quand il est actif) : la lecture « ce fichier est-il au magasin ? » passe par `travauxStockage.recupererBlob`, la même que celle de la génération du codex ; elle n'est pas exécutée sur un vrai magasin.
- **Une copie « present » sans fichier, dont le dépôt échoue faute d'espace** : `_restaurerBlobsDepuisZip` la marque « manquant » (son comportement depuis #613). C'est vrai, et c'est une entrée de l'espace dont le statut change. Lu, non exécuté pour ce statut-là (le banc l'exécute pour une copie déjà « manquant »).
- **La suite Playwright complète** : non prise (elle se prend au verdict, avant un push).
- **La release, le changelog, la porte terrain** : non faits.
- **Les cases Annotations, Notes, Étudiants, Présences** : mesurées, non corrigées.
- **Un fichier neuf de Cowork est apparu dans l'arbre pendant le lot** (`plans de travail/CONSIGNE-SUIVANTE-2026-10-02-1012-selection.md`, écrit à 7 h 22) : son en-tête dit qu'il ne s'ouvre qu'une fois ce lot fusionné sur `main`. Je ne l'ai ni exécuté ni commité.

## 10 · Inscriptions dues à `BACKLOG.md`, sous #1012 (texte prêt ; écriture refusée ce matin)

1. **La porte de l'avertissement n'a pas pu voir la fenêtre (2 oct. 2026, 6 h 50 ; rapporté par la consigne de Cowork de 6 h 54, sur la capture de Grégoire).** En fenêtre privée de Chrome, son codex (1,22 Go, écrit le 1er à 18 h 50) s'est ouvert en entier : « Recharger la page », sans le mot « incomplet ». La porte n'a pas échoué ; ses rangées 1.2 à 1.4 attendent un cas réel ; la rangée 2.1 reste à voir, sans échéance. Trace : § 5 de la porte.
2. **La fenêtre d'une ouverture complète dit encore « fichier ZIP » (relevé de Cowork sur la capture ; issue 2).** « Le fichier ZIP d'origine reste dans Fichiers — tu peux le supprimer pour récupérer de l'espace » (`js/codex.js`, l. 3131 ; une seule occurrence par `grep "ZIP d'origine reste"`). Des mots : décision de Grégoire, plus tard.
3. **L'ancien `.zip` par la case : codé sur la branche `fix-1012-ancien-zip-par-la-case`, 2 oct. 2026 ; ni release ni push** (cette demande).
4. **Les cases « Annotations », « Notes », « Étudiants » et « Présences » du même import remplacent ce que l'espace a (mesuré par le geste, 2 oct. 2026, 7 h 10 ; issue 2 ; non vécu).** Le détail est au § 5. La plus lourde : « Annotations » remplace les annotations des copies de l'espace.
5. **Les copies d'un collègue ne sont pas retenues comme ses élèves (lu, non exécuté ; issue 2).** § 5.
6. **`executerImportLocalStorageBrut` : aucun bouton trouvé (lu ; issue 3, ou retrait dans un lot du chantier).** § 5.
7. **Deux relevés de mots au bilan de l'import** (§ 5) : décision de Grégoire, plus tard.

## 11 · Proposition pour les Nouvelles (à accepter par Grégoire)

> **Un ancien fichier ouvert dans Réglages ne fait plus perdre de copies.** Quand tu ouvres un ancien fichier `.zip` par « Ouvrir un Codex… » et que tu coches « Fichiers travaux », ses copies s'ajoutent maintenant aux tiennes au lieu de prendre leur place. Ton codex, à sa prochaine mise à jour, les contient toutes.
