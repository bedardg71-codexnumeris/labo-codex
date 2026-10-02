# Demande de relecture – #1014, le codex emporte aussi la corbeille et la Modélisation, et une correction de sécurité

> Écrite par Claude Code le 2 octobre 2026 à 18 h 14 (Toronto, mesurée par `date`), sur la consigne de Cowork de 17 h 56.
> Branche locale `claude/1014-codex-complet` (worktree `.claude/worktrees/1014-codex-complet`), partie de `main` à `e1bb1df6`. **Ni release, ni push du code.** Version : 1.174.5, inchangée.
> Ce chemin écrit et rouvre les données de l'usager : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce que ton codex emporte désormais** : en plus de tes copies, les copies que tu as mises à la corbeille et les fichiers que tu as ouverts dans la Modélisation. Quand tu ouvres ce codex sur un autre appareil, ils reviennent et s'ouvrent ; une copie sortie de la corbeille s'affiche.
- **De combien il grossit** : de la taille exacte de ces fichiers, rien de plus. Sur le pack démo, de 0 octet de fichier (la démo n'en contient aucun). Chez toi, je ne le sais pas : il faut une lecture de ton espace, avec ton accord (§ 5).
- **Ce qui t'attend** : rien avant la relecture de Cowork. Ensuite, la ligne des « Nouvelles » (§ 11), et ton prochain « Mettre à jour le codex » habituel rendra ton codex complet.
- **Ce que j'ai supposé** : qu'un fichier de corbeille ou de Modélisation absent à l'ouverture d'un codex **neuf** doit compter au bilan d'ouverture incomplète (la consigne le dit), mais pas à l'ouverture d'un codex **d'avant ce lot**, qui ne les a jamais emportés. Le manifeste le dit désormais (§ 3).

## 1 · D'abord

Le commit « tels quels » des deux fichiers de consigne de Cowork (`CONSIGNE-DU-JOUR.md`, `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1007-inventaire.md`) a été **refusé par le garde de permissions** (« Modify Shared Resources »), comme le 1er octobre. Je n'ai pas réessayé. Le push des deux commits de documents de `main` (`65f1f8e4`, `e1bb1df6`) n'a pas été tenté : le même garde l'avait refusé le 1er octobre sur une consigne de Cowork. Les deux gestes restent à Grégoire (§ 12). `guide-alignement-actuel.md` et `Claude outputs/` restent non suivis, hors de tout commit.

## 2 · Remesure, par le geste, avant d'ouvrir

Banc `tests/integration/codex-1014-codex-complet.spec.js`, lancé sur le code de `e1bb1df6` avant toute modification de `js/` :

| Cas | Ce que le codex emportait | Ce que l'ouverture rendait sur un espace neuf |
|---|---|---|
| Copie de travail | son fichier | le fichier, lisible |
| Copie mise à la corbeille (`deplacerEnCorbeille`, le geste du bouton) | sa ligne seulement | la ligne, **sans fichier** |
| Fichier de Modélisation | sa ligne seulement | la ligne, **sans fichier** |

Mesuré : le codex ne portait qu'une entrée `travaux/` sur trois ; l'ouverture en rendait un (`nbBlobs: 1`).

**`fichiersModelisation` est globale de fait.** `modelisation.js` l'écrit par `cle('fichiersModelisation')`, mais la clé n'est pas au registre de `trimestres.js` : `cle()` la rend nue (mesuré sur un espace neuf : `"fichiersModelisation"`). Elle est donc partagée entre tous les trimestres et la démo. Le codex l'emporte sous ses deux formes possibles (nue ou préfixée). Trouvaille hors lot : issue 2, inscrite (§ 10).

## 3 · La règle appliquée

- **À l'écriture** (`genererCodex`) : les trois listes (`LISTES_DE_FICHIERS`, constante unique du module, qui remplace aussi la liste locale `CLES_REFERENCANT_BLOBS` du recensement de purge) passent par le même chemin que les copies : référence gardée, rangement par `FichierSortant.assemblerZip`, aucune lecture en mémoire, même dossier `travaux/`. Le manifeste déclare ce qu'il emporte : `contenu.listesDeFichiers`.
- **L'avertissement de 1.174.0 ne change pas** : il ne compte que les copies de travail. Un fichier de corbeille ou de Modélisation manquant ne l'ouvre pas. Aucun mot neuf.
- **À l'ouverture** (`chargerCodex`) : les fichiers des listes que le manifeste déclare reviennent comme les copies (même `validerMagicBytes`, même refus faute d'espace, même marquage `blobStatut: 'manquant'` sur la ligne quand le fichier ne revient pas). Leur échec compte au bilan d'une ouverture incomplète comme celui d'une copie. Un codex d'avant ne déclare rien : seules ses copies de travail sont attendues, il s'ouvre exactement comme avant.
- **La reconnaissance des clés** : les copies gardent leur règle d'avant (toute clé qui contient `fichiersTravaux`, H5). La corbeille et la Modélisation se reconnaissent à leur nom exact, nu ou préfixé, pour ne pas emporter `corbeilleFichiers_backup_v1`, qui aurait compté des fichiers disparus depuis la migration.
- **L'extension d'une entrée** : celle du nom de fichier quand elle n'est faite que de lettres et de chiffres, sinon `bin`. Le nom d'un fichier de Modélisation est celui choisi sur l'appareil ; une extension hors de la liste blanche de l'export (Défense K) aurait bloqué **tout** le codex. Pour les copies, ça ne change que les cas qui bloquaient déjà.

**Mots qui mentent, relevés sans y toucher** : le bilan d'ouverture incomplète dit « 1 copie sur 3 » même quand c'est un fichier de Modélisation qui manque. Un fichier de Modélisation n'est pas une copie d'élève. Et `contenu.nombreFichiersTravaux` (affiché « N fichiers travaux » dans « Détails ») compte désormais les trois listes.

## 4 · Les autres chemins qui assemblent ou relisent un codex

| Chemin | Fabrique ou rouvre un codex ? | Fait |
|---|---|---|
| « Exporter une sélection » (`actionExporterSelection`) | fabrique | **suit** : mêmes trois listes, avertissement inchangé, manifeste déclaratif. |
| « Fusionner » / import partiel (`_fusionnerTravaux`, l. 2641) | ni l'un ni l'autre : il fusionne | **inchangé**. Les fichiers de corbeille et de Modélisation d'un codex neuf sont dans `travaux/` : la fusion les propose et les valide comme des copies. Mais elle ne regarde que la **première** clé `fichiersTravaux` (`find`), locale comme externe (l. 2642 et 3601) : antérieur au lot, inscrit (§ 10). |
| Archive d'un groupe (`reserve.js`) | non | **inchangée**. Même trou : elle emporte les lignes de la corbeille (`CLES_FILTRER_PAR_GC`), pas leurs fichiers (l. 803, seulement `fichiersTravaux`). Inscrit (§ 10). |
| « Comparer » | relit sans écrire | inchangé, il ne lit pas de fichiers. |

`_filtrerTravauxPourExport` (l. 2620 et autour) n'a plus aucun appelant (mesuré par `grep` sur `js/` et `tests/`). Code mort antérieur au lot, issue 2 (§ 10).

## 5 · La taille

- **Pack démo** : aucune des trois listes n'y figure (`grep` sur `js/demo-*.js` et `js/pack-demo-10.js` : rien). Le codex de la démo ne grossit que de la ligne `listesDeFichiers` du manifeste, une centaine d'octets.
- **Chez Grégoire** : le codex grossira de la somme des tailles des fichiers de sa corbeille et de sa Modélisation (une copie de la corbeille est purgée après 30 jours). Pour le chiffrer, une lecture **en lecture seule**, avec son accord, comme le 1er octobre à 17 h 03 : onglet sur l'origine de l'application sans démarrer l'application, `indexedDB.databases()` d'abord, puis, en transaction `readonly`, le nombre de lignes de chaque clé `*_corbeilleFichiers` et de `fichiersModelisation` dans `keyvalue`, et la somme des `blob.size` de leurs ids dans le magasin `fichiers`. Ne sortir que des comptes et des tailles.

## 6 · Source et stock

Ce lot tarit la source. Le stock, c'est le codex actuel de Grégoire, sans ces fichiers : il deviendra complet à sa prochaine mise à jour habituelle, depuis l'appareil qui a ces fichiers. Rien à réparer. **Une limite à dire** : un codex ouvert sur un appareil qui n'avait pas ces fichiers ne peut pas les inventer ; seul l'appareil d'origine les a.

## 7 · La correction de sécurité (B)

`ouvrirModalRapportsArchives` (`js/rapport-bug.js`) : le prénom, la description (coupée à 100 caractères **avant** l'échappement, pour ne pas couper une entité), la date formatée et l'id (dans les deux `data-param`) passent par `echapperHtml()`. Toute la fonction parcourue : `r.type` n'est que comparé, les couleurs et l'opacité sont des constantes. Le dispatcher relit `dataset.param`, que le navigateur décode : les boutons rendent l'id d'origine. Correction « maintenant » (issue 1) : ces archives voyagent dans le codex.

## 8 · La preuve

- **Banc A** (`codex-1014-codex-complet.spec.js`, WebKit, 6 essais verts) : une copie jetée par le geste et un fichier de Modélisation partent dans le codex et reviennent lisibles dans un espace neuf (autre contexte, vide vérifié) ; la copie sortie de la corbeille s'ouvre ; l'avertissement ne bouge pas (et son témoin : une copie de travail manquante l'ouvre, comptée seule) ; un codex d'avant s'ouvre comme avant ; un fichier de Modélisation déclaré et absent compte au bilan ; « Exporter une sélection » emporte les trois listes.
- **Essai B** (`rapport-bug-archives-echappees.spec.js`, WebKit, vert) : un prénom `<img src=x onerror=…>`, une description piégée et un id qui tente de refermer son attribut. Aucun élément créé, aucun gestionnaire exécuté, aucun attribut ajouté, texte lu tel quel.
- **Mutations, 9 sur 9 rouges**, chacune par l'assertion qui la vise, fichiers restaurés par copie et empreinte : écriture sans les deux listes ; avertissement qui compte tout ; ouverture qui ignore le manifeste (le témoin « codex d'avant » rougit) ; ouverture sans les deux listes ; manifeste sans déclaration ; sélection sans les deux listes ; prénom, description, id bruts.
- **Sentinelle #614 adaptée** : elle exigeait les trois noms en toutes lettres dans la fonction de purge ; elle exige maintenant que la purge lise `LISTES_DE_FICHIERS` et que la constante les nomme. Retirer `corbeilleFichiers` de la constante la fait rougir (et trois essais de comportement de la purge avec elle).
- **Vitest complet** : 673 fichiers, 7 938 essais verts, aucune ligne « Errors » ni « Unhandled ».
- **Specs voisines du codex** : 46 vertes, 1 instable au second essai (§ 9).
- **Pas de verdict Playwright complet** : il viendra avec la release, après la relecture.

## 9 · Specs voisines

RÉSULTAT_VOISINES

## 10 · Inscriptions dues à `BACKLOG.md`

Je ne les écris pas : l'écriture dans `BACKLOG.md` a été refusée par le garde de permissions ce matin. Texte proposé, sous #1014 :

- **#1014, lot codé** (branche `claude/1014-codex-complet`) : le codex et la sélection emportent `corbeilleFichiers` et `fichiersModelisation`, l'ouverture les rend ; manifeste `contenu.listesDeFichiers`. En relecture.
- **`fichiersModelisation` est globale de fait** : passée à `cle()` mais absente du registre de `trimestres.js`, elle est partagée entre trimestres et démo. La namespacer touche le stock : migration à décider.
- **Le bilan d'ouverture dit « copie » pour un fichier de Modélisation** ; « Détails » dit « N fichiers travaux » pour les trois listes.
- **La fusion ne lit que la première clé `fichiersTravaux`** (l. 2642 et 3601, `find`) : en multi-trimestre, les listes des autres trimestres ne sont ni comparées ni fusionnées.
- **L'archive d'un groupe emporte les lignes de la corbeille sans leurs fichiers** (`reserve.js`, l. 126 et 803).
- **`_filtrerTravauxPourExport` sans appelant** (code mort).
- **Playwright planifié sur GitHub annulé depuis le 26 sept.** (7 runs `cancelled`, coupés à 60 min ; relevé par l'audit d'ouverture).

## 11 · Proposition pour les Nouvelles (à accepter par Grégoire)

Release `patch` (1.174.6) ; la ligne entre dans l'entrée 1.174 :

> **Ton codex emporte maintenant aussi ta corbeille et ta Modélisation.** Les copies que tu as mises à la corbeille et les fichiers ouverts en Modélisation partent dans le codex, et reviennent quand tu l'ouvres sur un autre appareil.

La correction de sécurité ne demande pas de ligne : rien ne change à l'écran pour un rapport ordinaire.

## 12 · Ce qui reste à Grégoire

1. Commiter les deux fichiers de consigne de Cowork : `! git add "plans de travail/CONSIGNE-DU-JOUR.md" "plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1007-inventaire.md" && git commit -m "docs(consigne): fichiers de Cowork commités tels quels"`
2. Dire s'il faut pousser les commits de documents de `main`.
3. Accorder, ou non, la lecture de son espace pour chiffrer la taille (§ 5).
