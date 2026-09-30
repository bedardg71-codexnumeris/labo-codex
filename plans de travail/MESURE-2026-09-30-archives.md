# Mesure – chantier des archives : ce que pèse chaque trimestre, ce que fait « Archiver… », et le mot « archivé »

> Écrite le 30 septembre 2026, vers 12 h 25 (Toronto), par Claude Code, pour Cowork et Grégoire. Exécute `plans de travail/CONSIGNE-SUIVANTE-archives-mesure.md` (10 h 56, ajouts de 12 h 03). `main` à `a9acceeb` (1.171.0).
> **Lecture et mesure seulement** : aucun fichier de `js/` modifié, rien de livré. Chaque constat dit s'il est **mesuré**, **lu** au code, ou **inféré**.
> L'inventaire complet du mot « archive » est à part : `MESURE-2026-09-30-archives-annexe-inventaire.md`.

## Pour Grégoire, en quatre lignes

1. **Le poids** : sur 1,31 Go, tes copies d'H2026 pèsent 1,10 Go (84 %), celles d'A2026 0,20 Go ; A2025 et A2024 n'ont aucune copie. Les données de tous les trimestres pèsent 26 Mo.
2. **« Archiver… » à grande taille, sous Safari** : pour ton plus gros groupe (205 copies, 607 Mo), la page prend 3,4 Go de mémoire et pose 0,6 Go sur le disque avant d'écrire. C'est le mur du codex d'avant ce matin ; sur l'iPad, il ne passerait vraisemblablement pas.
3. **Les trois réponses** : « Ouvrir une archive… » ne rend aucune copie ; « exporté » ne veut pas dire « sans son fichier » (tes 103 copies « exportées » ont toutes encore leur fichier) ; une archive se vérifie aujourd'hui par le compte et les tailles, pas par le contenu de chaque copie.
4. **Le mot** : 41 textes d'écran disent « archivé » pour l'état clos, plus 7 lignes des Nouvelles passées ; 158 désignent le dépôt et gardent leur mot.

**Un constat hors consigne, à lire** (§ 6.1) : au banc, c'est l'appel du partage qui charge le fichier entier en mémoire, deux fois sa taille. C'est une piste pour le délai que tu as vu, et un risque à mesure que le codex grossit.

## 1 · Ce que pèse chaque trimestre dans le codex réel

**Mesuré** sur `codex-601-101-A26-A25H26-2026-09-30-10h34.zip` (iCloud, lecture seule ; ni déplacé, ni ouvert dans l'application ; aucun nom de copie ni d'étudiant·e lu : des comptes, des octets, des identifiants techniques). 1 314 938 226 octets, 503 entrées. Mo et Go décimaux, comme iPadOS.

| Trimestre | Groupe-cours | Copies | Poids des copies | Données |
|---|---|---|---|---|
| H2026 | gr. 00002 | 189 | 493,4 Mo | |
| H2026 | gr. 00008 | 205 | 607,3 Mo | |
| **H2026** | **les deux** | **394** | **1 100,8 Mo** | 7,0 Mo, plus 8,2 Mo de vignettes |
| **A2026** | gr. 00007 | **106** | **204,7 Mo** | 2,0 Mo, plus 1,2 Mo de vignettes |
| A2025 | gr. 00001 | 0 | 0 | 2,8 Mo |
| A2024 | deux groupes | 0 | 0 | 0,3 Mo |
| hors trimestre | | | | 3,2 Mo (clés globales), 0,5 Mo (démo), 1,1 Mo (59 vignettes sans copie) |
| **Total** | | **500** | **1 305,5 Mo** | **26,3 Mo** (9,4 Mo une fois compressées) |

- **Ce que l'archivage rend** : retirer les copies d'H2026 ramène le codex à environ 0,23 Go. La borne de 2 Go (#992) s'éloigne d'autant ; ce qui grossit ensuite, ce sont les copies d'A2026.
- **H2026 n'est pas clos dans l'application** : dans `trimestres`, seul A2025 porte `archive: true`. Selon l'ordre de vie que tu as arrêté (en cours → clos → archivé → allégé), H2026 est encore à la première étape.
- **Les états des copies** : 395 « présent », **103 « exporté »** (80 en A2026, toutes du 25 sept. 2026 ; 23 en H2026, de février et mars), 1 « manquant », 1 « facsimilé ». **Les 500 fiches ont leur fichier dans le codex**, y compris les 103 « exportées » et la « manquante » (23,6 Mo).

## 2 · Ce que « Archiver… » fait aujourd'hui sous Safari, à grande taille

**Mesuré** au banc du lot J0 rebâti : WebKit 26.4 de Playwright, sans interface, profil persistant, le vrai `index.html`, le vrai `Reserve.verserGroupeCours`, pack démo, 205 copies fictives **aux tailles des 205 copies de ton plus gros groupe** (octets aléatoires). Un navigateur neuf par mesure ; mémoire par `footprint` (pic depuis la naissance du processus), disque par `df`. L'aperçu est accepté d'office.

| Mesure | « Archiver… », 205 copies, 607 Mo | Rappel : le codex d'avant le lot J0, 500 copies, 1,3 Go |
|---|---|---|
| Mémoire de la page (pic) | **3 426 Mo** (5,6 fois les copies) | 6 500 Mo (5 fois) |
| Mémoire du processus réseau (pic) | 1 228 Mo | non relevé ici |
| Disque posé avant l'écriture | **environ 610 Mo** (le fichier entier) | 1 250 Mo |
| Durée | 23 s, dont 21 s de compression | 47 s |
| Fichier produit | 607 590 781 octets, 212 entrées, `unzip -tq` sans erreur | |

L'hypothèse de Cowork est confirmée : **même mur**, même cause (`new JSZip()`, les copies confiées à JSZip, `generateAsync` avec DEFLATE, qui ne gagne rien sur des copies). Inférence : pour le groupe 00002 (493 Mo), environ 2,8 Go de mémoire.

**L'issue de l'écriture** (lu au code, puis mesuré) :

- **Il n'y a pas de partage.** Sous Safari, l'archive part par un lien de téléchargement (`<a download>`), pas par `navigator.share`. Le refus du toucher expiré (lot J0 bis) ne la concerne donc pas.
- **L'adresse du fichier est libérée 35 ms après le clic** (`URL.revokeObjectURL` aussitôt). C'est le défaut que le lot G a corrigé pour le codex (« Safari pouvait ne plus rien avoir à écrire pour un gros fichier »). Au banc, le téléchargement aboutit quand même, entier et sain. **Non mesuré** : ce que fait Safari sur l'iPad.
- **La réussite est annoncée sans être vérifiée** : « Groupe archivé : fichier téléchargé », et l'archive est inscrite à la liste, dès le clic.
- **Le fichier temporaire de 0,6 Go reste sur le disque** au moins 30 s après la fin ; il part à la fermeture de la page.

## 3 · Les trois questions

### 3.1 · « Ouvrir une archive… » sait-elle rendre des copies ? Non.

- **Lu** (`js/reserve-ouvrir.js`) : elle réimporte des grilles, des échelles, des productions, des cartouches, des pratiques et des tampons. Les copies sont **comptées** (`nbFichiersTravaux`), jamais restaurées ; l'en-tête du module les range « hors scope ».
- **Essai** (l'archive de 608 Mo du § 2) : l'étape de sélection affiche « Fichiers travaux 205 » comme un compteur, sans case à cocher ; les fiches de copie du trimestre sont inchangées. Ouverture en 0,6 s, **800 Mo de mémoire** : le fichier entier est lu (`JSZip.loadAsync`), et la borne de 2 Go de `validerZipSecurite` s'y applique aussi.

**Ce qu'il faut pour qu'une archive rende ses copies à un trimestre dont les données n'ont pas bougé** (ta décision de 12 h 03). Les pièces existent, lues au code :

- **Le rapprochement par identifiant est direct** : dans l'archive, chaque copie s'appelle `travaux/<id>.<ext>`, et `<id>` est l'`id` de sa fiche restée dans l'application.
- **Le geste qui remet un fichier sous une fiche existe** : `travauxStockage.stockerBlob(id, …)`, puis `blobStatut = 'present'` (c'est ce que fait « remplacer le fichier » dans `js/travaux-import.js`, et l'ouverture d'un codex, avec le contrôle du type de fichier).
- **Ce qui manque** : (a) un état « fiche gardée, fichier aux archives » (voir 3.2) ; (b) une lecture de l'archive qui ne charge pas tout en mémoire ; (c) le geste et son écran.

### 3.2 · Qu'est-ce qui pose « exporté », et ce geste est-il atteignable ? Oui, mais il ne veut pas dire ce que le cadrage suppose.

- **Lu** : `travauxStockage.marquerExporte` pose `blobStatut: 'exporte'` et `dateExport`. Cinq appelants : l'export du PDF d'une copie, du dossier d'un·e étudiant·e et depuis l'aperçu (`js/travaux-export-pdf.js`), et les deux exports d'« Exporter et archiver » (`js/travaux-archivage.js`).
- **Atteignable : oui, et vécu.** Tes 80 copies d'A2026 ont été marquées le 25 sept. 2026.
- **« Exporté » veut dire « un fichier est sorti », pas « le fichier n'est plus là ».** Le fichier reste dans l'application (mesuré : 103 sur 103).
- **Le seul geste qui retire des copies retire aussi leur fiche** : « Libérer de l'espace » (#892) efface le fichier, la vignette et la fiche. Aujourd'hui il te proposerait les 80 copies d'A2026 (165,9 Mo), et aucune d'H2026 (leurs marques datent d'avant le 16 sept., jugées peu fiables).
- **Donc l'état « fiche sans fichier » n'est produit par aucun geste.** L'ouverture d'un codex le tolère (une copie « exportée » sans fichier n'est pas signalée manquante), mais rien ne le fabrique. Tes évaluations d'A2025 ne vivent pas « ainsi » : A2025 n'a aucune fiche de copie.
- **Conséquence pour ton plan** : réutiliser « exporté » pour dire « aux archives » mélangerait deux sens, et 103 copies le portent déjà avec leur fichier. Il faut un état à part. Son nom à l'écran est à toi.

### 3.3 · Une archive peut-elle être vérifiée copie par copie avec ce qui existe ? En partie.

| Ce que l'archive porte aujourd'hui | Ce que ça permet de vérifier |
|---|---|
| `meta.json` : empreinte SHA-256 de `donnees.json` | les données, intactes ou non |
| `meta.json` : nombre de copies, poids total des copies | le compte et le total |
| `donnees.json` : la fiche de chaque copie (`id`, `tailleFichier`) | la présence et la taille de **chaque** copie |
| Le ZIP lui-même : un CRC-32 par entrée | le contenu de chaque copie, **en mode ZIP seulement** ; « Ouvrir une archive… » ne le contrôle pas |
| Rien | le contenu de chaque copie en mode dossier (Chrome, Edge) |

**Réponse** : présence et taille, oui, sans rien ajouter. Le contenu de chaque copie, non : il faut **ajouter une empreinte par copie** (dans `meta.json` ou un fichier voisin) pour une vérification qui vaille dans les deux modes. Ta condition du retrait (« relue et vérifiée par l'application ») la demande.

## 4 · L'inventaire du mot « archivé »

**Méthode** : toutes les chaînes des fichiers de `js/` (commentaires exclus) et tous les textes d'`index.html` qui contiennent « archiv », extraits par script, puis classés à la main. 422 occurrences, dont 167 techniques (noms de classes, identifiants, styles) que l'usager ne lit pas.

| Ce que le texte désigne | Textes lus par l'usager |
|---|---|
| **L'état clos** (à renommer) | **41**, plus 7 lignes des Nouvelles passées |
| **Le dépôt aux archives** (garde son mot) | 158 |
| Un troisième sens : « Exporter et archiver » les copies (sortir des PDF) | 23 |
| Un quatrième : l'évaluation originale « archivée » après un jeton | 9 |
| Divers (rapports de bug archivés, programme « 411 Archives médicales », sens courant) | 16 |
| À trancher : « l'archive d'un trimestre » (`registre-longitudinal.js`, l. 94) | 1 |

**Deux sens de plus que les deux que tu as nommés.** « Exporter et archiver » et l'évaluation « archivée » après un jeton emploient le même mot pour autre chose. Ils ne sont pas dans la consigne ; je les signale.

### Les 41 textes de l'état clos, et une proposition pour chacun

Les propositions ne changent que le mot. **Rien n'est modifié** : la table est à corriger par toi.

| Fichier, ligne | Texte actuel | Proposition |
|---|---|---|
| `index.html` 4002 | LECTURE SEULE — Trimestre archivé | LECTURE SEULE — Trimestre clos |
| `index.html` 11171 | Qu'est-ce que l'archivage d'un trimestre ? | Qu'est-ce que clore un trimestre ? |
| `index.html` 11175 | L'archivage permet de préserver un trimestre terminé tout en libérant l'espace pour un nouveau trimestre de travail. | Clore un trimestre le préserve une fois terminé, et te laisse en commencer un nouveau. ⚠ « libérant l'espace » est faux : clore ne libère rien |
| `index.html` 11178 | Que se passe-t-il lors de l'archivage ? | Que se passe-t-il quand tu clos un trimestre ? |
| `index.html` 11188 | Quand archiver ? | Quand clore ? |
| `index.html` 11189 | Archive un trimestre lorsque : | Clos un trimestre lorsque : |
| `index.html` 11199 (deux textes) | L'archivage est réversible. Tu peux désarchiver un trimestre si nécessaire, ce qui le remet en mode édition. | Clore est réversible. Tu peux rouvrir un trimestre si nécessaire, ce qui le remet en mode édition. |
| `index.html` 11202 | Comment archiver : | Comment clore : |
| `index.html` 11205 | Clique sur Archiver à côté du trimestre souhaité | Clique sur Clore à côté du trimestre souhaité |
| `cartouches.js` 4472, 4515 | Import impossible : le trimestre actif est archivé (consultation). Active un trimestre courant pour importer des cartouches. | … le trimestre actif est clos (consultation)… |
| `grilles.js` 2584, 2627 | le même, « … pour importer des grilles. » | le même, avec « clos » |
| `pratiques-gestion.js` 727, 758 | le même, « … pour importer des pratiques. » | le même, avec « clos » |
| `donnees-v2.js` 1213 | Ce trimestre est archivé : remplacer cette échelle toucherait …, dont des notes déjà remises. | Ce trimestre est clos : … |
| `echelles.js` 3425 | Ce trimestre est archivé : remplacer l'échelle « … » toucherait …, dont des notes déjà remises. Rien n'a été modifié. | Ce trimestre est clos : … |
| `trimestre-v2-liste.js` 130, 294 | Archivé (badge, état de la carte) | Clos |
| `trimestre-v2-liste.js` 151, 299 | Désarchiver (bouton) ; « Désarchiver pour permettre les modifications » (infobulle) | Rouvrir ; « Rouvrir pour permettre les modifications » |
| `trimestre-v2-liste.js` 163, 304, 310 | Archiver (bouton) ; « Archiver ce trimestre (lecture seule) » (infobulle) | Clore ; « Clore ce trimestre (lecture seule) » |
| `trimestre-v2-liste.js` 209 | Archiver le trimestre "…" ? | Clore le trimestre "…" ? |
| `trimestre-v2-liste.js` 210 | Un trimestre archivé passe en lecture seule et ne peut plus être modifié. | Un trimestre clos passe en lecture seule et ne peut plus être modifié. |
| `trimestre-v2-liste.js` 212 | Cette action est réversible via le bouton "Désarchiver". | Cette action est réversible par le bouton « Rouvrir ». |
| `trimestre-v2-liste.js` 218 | Trimestre "…" archivé avec succès. Un fichier d'export a été téléchargé. | Trimestre "…" clos. Un fichier d'export a été téléchargé. |
| `trimestre-v2-liste.js` 239 | Désarchiver le trimestre "…" ? | Rouvrir le trimestre "…" ? |
| `trimestre-v2-liste.js` 246 | Trimestre "…" désarchivé. | Trimestre "…" rouvert. |
| `trimestre-v2-liste.js` 334 | Trimestres archivés | Trimestres clos |
| `trimestre-v2-liste.js` 341 | Activez, archivez ou restaurez vos trimestres. | Active, clos ou rouvre tes trimestres. (le vouvoiement est là aussi) |
| `trimestre-v2-liste.js` 373 | Aucun trimestre actif à archiver. | Aucun trimestre actif à clore. |
| `trimestre-v2-liste.js` 402 | Active un autre trimestre d'abord, ou utilise l'archivage pour le conserver en lecture seule. | Active un autre trimestre d'abord, ou clos-le pour le conserver en lecture seule. |
| `trimestre-v2-liste.js` 409 | Contrairement à l'archivage (lecture seule, données conservées), la suppression EFFACE toutes les données de ce trimestre… | Contrairement à la clôture (lecture seule, données conservées), la suppression EFFACE… |
| `trimestres.js` 686 | Trimestre déjà archivé | Trimestre déjà clos |
| `trimestres.js` 691 | Impossible d'archiver le trimestre actif. Changez de trimestre d'abord. | Impossible de clore le trimestre actif. Change de trimestre d'abord. |
| `trimestres.js` 930 | Archivage refusé : les cartouches de N grille(s) (…) n'ont pas encore été migrées. Recharge l'application, puis réessaie. | Clôture refusée : … |
| `trimestres.js` 1289 | Trimestre non archivé | Trimestre non clos |
| `trimestres.js` 1481 | `trimestre-<id>-archive-<date>.json` (nom du fichier téléchargé à la clôture) | `trimestre-<id>-clos-<date>.json` ; ⚠ à peser : un nom de fichier voyage |

**Les 7 lignes des Nouvelles passées** (`js/changelog-data.js`, l. 397, 407, 830, 944, 945, 1683, 1713) disent « trimestre archivé », « archiver un trimestre », « désarchivage ». Proposition : ne pas réécrire des Nouvelles déjà lues. À toi.

**Où les noms internes prêtent à confusion** (non renommés, consigne) : `archiverTrimestre`, `desarchiverTrimestre`, `trimestre.archive`, `mode-archive`, `bandeau-archive`, `exporterTrimestreArchive` désignent l'état clos ; `Reserve.verserGroupeCours`, `ReserveOuvrir`, `manifeste-archives.json` désignent le dépôt ; `travaux-archivage.js`, `nettoyerFichiersArchives` désignent l'export des copies. Trois familles pour un mot.

## 5 · Les ajouts de 12 h 03

### 5.1 · Le poids de l'application elle-même

**Mesuré** (fichiers cités par `index.html`, plus les icônes, bibliothèques et images chargées à la demande) :

| Part | Fichiers | Sur le disque | En transit (gzip, estimé) |
|---|---|---|---|
| Scripts de l'application | 197 | 10,3 Mo | 2,8 Mo |
| Bibliothèques | 10 | 3,6 Mo | 1,1 Mo |
| `index.html` | 1 | 1,1 Mo | 0,2 Mo |
| Feuilles de style | 2 | 0,8 Mo | 0,2 Mo |
| Icônes, images, autocollants, logo | environ 210 | 1,0 Mo | moins |
| **Total** | | **environ 17 Mo** | **moins de 5 Mo** |

Cowork avait raison : quelques dizaines de Mo au plus, loin de 1 Go. Le 1,3 Go de « Données de sites » est ton codex, pas l'application.

### 5.2 · Le reste laissé par le partage ou le téléchargement d'un fichier de 1,3 Go

**Mesuré** au banc (500 copies fictives, fichier de 1 305,6 Mo préparé en 7 s) :

| Geste | Disque, en plus du fichier lui-même | Mémoire de la page |
|---|---|---|
| Préparation du fichier (lot J0) | rien | 170 Mo |
| **Partage** (`navigator.share`) | rien de mesurable | **monte à 2 790 Mo, et y reste** |
| Téléchargement direct, sans partage | rien ; le fichier téléchargé seulement | 210 Mo au pic |

- **Pour le téléchargement** : rien n'est laissé que le fichier lui-même.
- **Pour le partage, le banc ne peut pas répondre sur le disque** : WebKit sans interface n'a pas de feuille de partage, l'appel se résout en 0,8 s sans rien écrire. Les 2,78 Go de Safari sur ton iPad ne s'expliquent donc pas ici. La relecture du lendemain, que Cowork propose, reste la bonne mesure.
- Bruit de `df` : jusqu'à 250 Mo dans une des passes (autre activité sur le volume).

## 6 · Trouvailles, et ce que je propose pour chacune

Aucune n'est inscrite au BACKLOG : la consigne est de mesure. **À disposer par Cowork.**

| | Trouvaille | Statut | Proposition |
|---|---|---|---|
| 6.1 | **Au banc, le partage charge le fichier entier en mémoire : 2,6 Go pour 1,3 Go**, et ne les rend pas dans les 40 s. La construction du `File` ne coûte rien ; le téléchargement direct non plus | mesuré (deux passes, et une passe témoin sans partage) | Issue 2. C'est peut-être le délai vu par Grégoire, et le prochain mur à mesure que le codex grossit. **Inféré, pas mesuré** : que l'iPad fasse de même (il a réussi deux fois à 1,31 Go). À mesurer sur l'iPad avant de bâtir l'archive sur le partage |
| 6.2 | « Archiver… » libère l'adresse du fichier aussitôt et annonce la réussite sans la vérifier | lu, mesuré au banc | Issue 2, dans l'étape 2 du chantier (« fabriquer l'archive comme le codex ») |
| 6.3 | « Exporté » ne veut pas dire « sans fichier » ; aucun geste ne produit une fiche sans fichier | lu, mesuré sur le codex réel | Corrige le § 3 du cadrage ; un état neuf est à prévoir |
| 6.4 | Une copie d'H2026 est marquée « manquante » alors que son fichier est là (23,6 Mo) | mesuré sur le codex réel | Issue 2 : lu, rien ne remet « présent » quand un fichier manquant revient par l'ouverture d'un codex. **Tes données : je n'y ai pas touché** |
| 6.5 | 59 vignettes sans copie (1,1 Mo) | mesuré | Issue 3 : sans conséquence |
| 6.6 | L'aide de la clôture dit qu'elle « libère l'espace » | lu | Avec les mots du § 4 |

## 7 · Méthode, et ce que je n'ai pas vérifié

- **Le codex réel** : `zipfile` de Python sur le fichier d'iCloud. ⚠ Il n'était pas descendu sur le Mac ; ma lecture l'a fait descendre (1,3 Go de plus sur le disque du Mac).
- **Le banc** : scripts jetables posés sous `tests/` le temps de l'exécution, puis retirés, avec le profil semé et l'archive produite. Le groupe de la démo n'a pas d'étudiant·es réel·les : l'archive du banc dit « 0 étudiant ».
- **Pas vérifié** : l'iPad, pour tout le § 2 et le § 5.2 (WebKit 26.4 du Mac, 16 Go, aucun plafond par onglet) ; « Archiver… » en mode dossier (Chrome, Edge) ; le geste « exporté » rejoué au banc (le stock réel du 25 sept. en tient lieu) ; des copies réelles (octets aléatoires, tailles réelles).
- **Cowork était ouvert** pendant les mesures : la mémoire est relevée par processus, elle n'en dépend pas ; la durée, un peu.
