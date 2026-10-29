# Consigne – Le codex de l'iPad emporte les copies déjà aux archives (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 14 h 29 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `d2f43d38` (1.224.0 en ligne). Ne remplace aucune autre consigne. Un seul lot qui écrit à la fois : vérifie qu'aucune autre instance n'écrit dans `js/`.
> **Retour testeur** de Grégoire (`BUG_grégoire_2026-10-29_14-15-21.txt`, 1.223.0, Safari 27.2, iPad ; gravité « gênant ») : « j'ai importé le codex créé sur mon Mac dans mon iPad, j'ai poursuivi quelques évaluations, puis en enregistrant sur l'iPad je suis passé de 355 Mo à 1,45 Go ». Le rapport n'est pas dans le dépôt : il est cité ici.

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Inscrire le bug dans `Retours des testeurs/SUIVI-BUGS.md` (prochain numéro libre) et sa fiche au `BACKLOG.md` (prochain numéro libre).
- Inscrire aussi, **sans la corriger** (issue 2), la trouvaille vue sur sa capture de 14 h 12 : pendant la fenêtre « Téléchargement lancé », le bandeau rouge « Codex non mis à jour : le fichier (environ 1,5 Go) n'a pas été enregistré. Tes données restent dans l'application. » reste affiché. Il vient du partage annulé juste avant (`AbortError` à 14:12:10 dans le rapport) ; le repli en téléchargement direct a pris la suite et a réussi (« téléchargement confirmé par l'usager »). Les deux messages se contredisent à l'écran.
- Commit de docs seul : ce fichier et ces inscriptions.

## 1. Ce que Cowork a mesuré (les témoins)

Sur les fichiers de Grégoire (iCloud Drive › Téléchargements), en lecture seule : `unzip -Z1` pour les entrées, `unzip -p … codex-manifeste.json` et `donnees.json` lus par `python3`.

| Fichier | Fait sur | Copies dans le ZIP | Clés | Taille |
|---|---|---|---|---|
| `codex-601-101-A26-A25H26-2026-10-29-14h08.zip` | Mac — Chrome, 1.224.0 | 177 | 661 | 355,6 Mo |
| `codex-601-101-A26-A25H26-2026-10-29-14h11.zip` | iPad — Safari, 1.223.0 | 571 | 1 057 | 1,46 Go |

- Les 394 copies en plus sont **toutes** celles de `h2026_fichiersTravaux`, et **toutes** marquées dans `_copiesAuxArchives` du codex du Mac (trimestre `h2026`, 394 ids, marque posée le 14 oct. 2026 à 23:24Z). Elles pèsent 1 101 Mo : l'écart entier.
- Le codex de l'iPad porte aussi les 394 `thumbnail_<id>` de ces copies (le Mac les a retirées avec les fichiers). Il ne porte **ni `_copiesAuxArchives` ni `_manifesteReserve`**.
- L'iPad avait ouvert à 10 h 35 `codex-…-2026-10-27-15h30.zip` (Mac, 1.221.0), qui **portait** la marque.
- Tailles des codex dans le même dossier : 1,36 Go le 8 oct., 255 Mo le 14 oct. (copies d'H2026 envoyées aux archives), ~355 Mo depuis. **Inférence** : l'iPad garde les fichiers d'H2026 depuis un codex ouvert avant le 14 oct.

## 2. Les deux causes (lues au code)

1. **L'ouverture laisse tomber la marque.** `chargerCodex` n'écrit aucune clé qui commence par `_` (`js/codex.js:858`). `_copiesAuxArchives` voyage donc dans le codex mais ne s'installe jamais sur l'appareil qui l'ouvre. L'en-tête de `js/reserve-copies.js` (« Elle voyage dans le codex […] un codex ouvert ailleurs sait que ces copies sont aux archives ») n'est vrai qu'au moment de l'ouverture (`idsDansDonnees`, `codex.js:~920`), plus après.
2. **L'écriture emporte toute copie trouvée.** `genererCodex` (`codex.js:~525`) met dans le ZIP chaque fichier que `recupererBlob` rend, sans regarder la marque. Et l'ouverture d'un codex ne retire pas les fichiers que ce codex n'apporte pas : ceux d'H2026 sont restés sur l'iPad.

## 3. Les décisions de Cowork (techniques)

1. **L'ouverture installe la marque du codex.** Une exception nommée pour `_copiesAuxArchives` à `codex.js:858`, pas pour toutes les clés `_` (`_manifesteReserve` décrit le dossier d'archives d'un appareil : il reste chez lui). Quand le codex porte une marque, elle **remplace** la marque locale (ouvrir, c'est prendre l'espace du codex) ; quand il n'en porte pas (codex d'avant #1028), la marque locale ne bouge pas. Mesure : (a) ce que l'ouverture fait aujourd'hui des autres clés absentes du codex, et dis dans la demande si ce choix leur est cohérent ; (b) ce que `lever` (`reserve-copies.js:~237`) laisse quand plus rien n'est marqué (marque `{}` ou clé retirée) : une marque levée sur le Mac (« Faire revenir ») doit lever celle de l'iPad à la prochaine ouverture.
2. **L'écriture n'emporte plus une copie marquée aux archives**, même si son fichier est sur l'appareil, ni sa vignette `thumbnail_<id>`. La marque se lit dans les données qu'on écrit (`ReserveCopies.idsDansDonnees(donnees)`, comme l'ouverture). C'est sans risque : la marque n'est posée que sur une copie dont l'archive, relue, rend le même fichier (`reserve-copies.js`, « La règle »). Une copie sautée ainsi n'est **jamais comptée manquante** : `_creerCompteDesCopies` (`codex.js:~1290`) passe aujourd'hui par `estAuxArchives`, qui suppose le fichier absent ; sur l'iPad il est présent. Le manifeste compte ce que le ZIP contient vraiment, taille estimée comprise.
3. **Le stock reste, et c'est assumé** (« tarir n'est pas réparer ») : l'iPad garde dans Safari les 394 fichiers d'H2026 (1,1 Go) et leurs vignettes. Ce lot ne retire rien d'aucun appareil : retirer est un geste sur les données de Grégoire, Cowork le lui soumettra à part. Ces fichiers ne voyageront plus, c'est tout.
4. **La fusion (`actionFusionner`) n'est pas dans ce lot.** Elle fera l'objet d'une autre consigne ; n'y touche pas ici.
5. Mets à jour l'en-tête de `reserve-copies.js` (le paragraphe « La marque ») pour qu'il dise ce qui est vrai après ce lot.

## 4. Les tests

- Un essai Playwright ciblé (WebKit), on attend l'élément, jamais `waitForTimeout` :
  - une copie marquée aux archives qui a encore son fichier et sa vignette → « Mettre à jour le codex » → le ZIP ne contient ni le fichier ni la vignette ; l'avertissement des copies manquantes ne paraît pas ; le manifeste compte juste. Une copie non marquée part toujours.
  - ouvrir un codex qui porte la marque → la marque est dans le stockage ; ouvrir un codex sans marque → la marque locale ne change pas.
- **Break-test** (arbre restauré par sha256) : sans l'exception de la l. 858 → le cas d'ouverture rougit ; sans le saut à l'écriture → le cas d'écriture rougit ; sans le saut de la vignette → son assertion rougit.
- Vitest depuis `tests/` si une fonction pure en sort.

## 5. Clôture

Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-codex-copies-aux-archives.md` : les deux endroits du code, le choix « remplacer / ne pas toucher » pour la marque et ce que `lever` laisse, ce que devient le compte des copies manquantes, le stock assumé. Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.

**Geste à vérifier à l'écran après la mise en ligne** : sur l'iPad, ouvrir un codex écrit par le Mac, puis menu Codex › « Mettre à jour le codex » : la fenêtre d'aperçu annonce environ 355 Mo, plus 1,5 Go.
