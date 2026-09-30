# Demande de relecture – chantier des archives, lot A2 : vérifier une archive

> Écrite le 30 septembre 2026, vers 17 h 05 (Toronto), par Claude Code, pour Cowork. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (16 h 24, mots du § 3 acceptés par Grégoire à 16 h 26). Branche `lot-a2-verifier-archive`, partie de `main` à `2ca29f83` (1.171.1). **Ni poussée ni livrée** : aucune release, aucun numéro de version touché.
> Chaque constat dit s'il est **mesuré**, **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **Ce qui change à l'écran** : dans Réglages › Données › Archives, chaque ligne porte « Non vérifiée » et un bouton « Vérifier ». Le clic relit l'archive copie par copie (dans Chrome, depuis ton dossier des archives ; dans Safari, tu désignes le fichier .zip), puis dit « Archive vérifiée », « Archive incomplète » ou « Archive à refaire », avec tes mots ; la ligne dit ensuite « Vérifiée le 30 septembre 2026 ». Et le dossier choisi dans Chrome est maintenant gardé le temps de la page : il n'est plus redemandé à chaque archivage, et l'écran le nomme.
2. **La preuve** : au banc, chaque défaut de la consigne est dit et aucun ne passe pour « vérifiée », dans les deux modes ; à 607 Mo sous WebKit, la mémoire de la page ne bouge pas (pic 363 → 365 Mo, contre + 552 Mo pour la lecture d'aujourd'hui d'« Ouvrir une archive… ») ; l'état survit à un rechargement et un nouvel archivage le remet à zéro ; 27 mutations, toutes rouges après deux corrections du banc.
3. **Ce qui te revient** : rien à trancher pour livrer. Trois groupes de mots hors de ceux que tu as acceptés (§ 5.1), à relire quand tu veux ; une porte courte sur ton Mac, dans Chrome, une fois le lot en ligne. **Tes données** : rien n'est écrit dans tes trimestres ni dans l'archive ; seule ta liste d'archives note « vérifiée ».

## 1 · Ce qui a changé

| Fichier | Changement |
|---|---|
| `js/reserve-verifier.js` (neuf, 660 lignes) | Les mots (§ 3, un seul objet `MOTS`) ; la lecture d'un ZIP par tranches (`lireRepertoireZip`, l'entrée une à la fois, `DecompressionStream` pour les textes) ; les deux sources (`sourceFichier`, `sourceDossier`) ; `verifierArchive` (copies, données, fichiers en trop, couverture) ; l'état retenu (`retenirResultat`, `etatVerification`) ; le compte rendu ; le geste (`actionVerifier`, sélecteur de fichier ou dossier) |
| `js/reserve-reglages.js` | Colonne « Vérification » (badge « Vérifiée le … » / « Non vérifiée ») et bouton « Vérifier » sur chaque ligne ; aucun mot recopié (lus dans `ReserveVerifier.MOTS`) |
| `js/reserve.js` | § 2.5 de la consigne : le dossier choisi dans Chrome est gardé dans la page (`_handleSession`) ; `statutHandle()` rend `handle` (l'écran lisait un champ jamais rendu) ; garde-fou du mauvais niveau (`_dossierMalChoisi`, erreur `DossierRefuse`, « Archiver… » s'arrête au lieu de basculer en ZIP) ; et le champ `dossier` de `listerGroupesVersables` corrigé (il rendait « a2026-cours-gr00007 » : `_nomDossier` lit `codeCours`, la liste nommait `cours` ; sans lecteur avant ce lot) |
| `styles.css` | Deux badges (`.badge-verif-ok`, `.badge-verif-non`), sur le modèle des badges de mode, sans la variable fantôme `--gris-pale` (le cliquet #595 l'a refusée) |
| `index.html` | Le script neuf avant `reserve-reglages.js` ; jetons `?v=` de `reserve.js`, `reserve-reglages.js`, `styles.css` |
| `docs/architecture/SPEC-RESERVE-V1.md` | § 14 |
| `tests/` | Sentinelle Vitest (41 essais) ; spec WebKit (le vrai bouton, le vrai sélecteur intercepté, la vraie fenêtre, le tableau, le rechargement, le fichier altéré) |
| `BACKLOG.md` | #1003 (corrigé ici), #1004 (mesuré, non corrigé) ; #998 fermé sur la porte de Chrome ; #999 et #1002 annotés |

## 2 · La mesure : la mémoire ne dépend pas du poids de l'archive

**Mesuré** au banc WebKit rebâti (WebKit 26.4 de Playwright, sans interface, profil persistant, le vrai `index.html`, pack démo, le vrai bouton « Vérifier » et le vrai sélecteur de fichier) sur une archive de **607 386 696 octets** fabriquée en Node par le vrai assembleur (`FichierSortant.assemblerZip`) : 205 copies d'octets aléatoires, **607 334 696 octets au total (le total exact du groupe 00008), tailles approchées** (log-normale, de 0,4 à 23,6 Mo ; les tailles copie par copie du banc du lot A1 ne m'étaient plus accessibles), 205 empreintes SHA-256 dans `meta.json`, `unzip -tq` sans erreur. Un navigateur neuf par mesure ; mémoire par `footprint` (courant et pic depuis la naissance du processus).

| | Avant le geste | Après « Vérifier » (le lot) | Témoin : `JSZip.loadAsync` du même fichier (ce que fait « Ouvrir une archive… ») |
|---|---|---|---|
| Mémoire de la page (WebContent), courant | 356 Mo | 318 Mo | 906 Mo |
| Mémoire de la page, pic | 363 Mo | **365 Mo** | **907 Mo** |
| Processus réseau, pic | 27 Mo | 27 Mo | 65 Mo |
| Durée | | **0,8 s** (205 empreintes, 607 Mo) | 0,5 s (lecture seule du répertoire) |
| Résultat | | « Archive vérifiée — Les 205 copies sont présentes et intactes, et les données concordent. » ; retenu : `verifiee`, 205, uuid, empreinte du meta.json | 212 entrées |

**Lu** : la copie la plus grosse (23,6 Mo) est la seule chose lue d'un coup ; son tampon est rendu (`transfer(0)`) avant la suivante. La borne de 2 Go de `validerZipSecurite` ne s'applique pas ici ; **ce qui la remplace** : le répertoire central au plus 64 Mo ; une entrée au plus 1 Go, lue en entier puis rendue ; le gonflage d'un texte s'arrête au premier octet au-delà de la taille déclarée ; les noms suspects (`..`, `/` initial) refusés avant toute lecture ; et rien n'est écrit sur le disque ni dans les données à partir du contenu de l'archive. **Inféré** : le pic de 2 Mo est le répertoire (quelques dizaines de Ko) et le tampon d'une copie ; je n'ai pas séparé les deux.

## 3 · La preuve

- **Vitest** (`tests/unit/sentinelle-lot-A2-verifier-archive.test.js`, 41 essais) : le vrai `Reserve.verserGroupeCours` fabrique l'archive dans les deux modes (le ZIP du mode fichier, le faux dossier du mode dossier) ; puis (a) saine → vérifiée dans les deux modes (et le ZIP tiré du dossier, textes DEFLATE et copies STORE) ; (b) tronquée, altérée d'un octet à taille égale, absente, en trop, `donnees.json` altéré, fiche non couverte → chacune dite par son nom, état `incomplete`, dans les deux modes ; un ZIP coupé, un répertoire hors du fichier, un nom suspect → refusés ; (c) sans empreintes → `a_refaire` avec compte et taille, dans les deux modes (dont un ZIP tout en DEFLATE comme 1.171.0) ; (d) l'état retenu (état, date, version, nombre, uuid, empreinte du meta.json), relu par un banc neuf sur le même stockage ; un nouvel archivage (« Il y est » ou dossier) le remet à « Non vérifiée » ; le fichier d'une autre archive n'est ni jugé ni retenu ; le geste complet (barre « N copies sur M », fenêtres, notification d'erreur) ; (e) le fichier n'est jamais lu en entier (un Blob qui refuse `arrayBuffer()` et `stream()`, chaque tranche au plus une copie, `JSZip.loadAsync` piégé, et `reserve-verifier.js` ne nomme jamais JSZip) ; (f) les mots du § 3 dans `MOTS`, et aucun recopié dans `reserve-reglages.js` ; (g) le dossier de Chrome gardé (un seul sélecteur pour deux archivages puis « Vérifier »), vu par `statutHandle`, oublié par « Effacer la liaison », le mauvais niveau refusé sans qu'aucun ZIP parte, un dossier vide au bon niveau accepté.
- **WebKit** (`tests/integration/lot-a2-verifier-archive.spec.js`, 1 essai, 13 s) : trois copies posées sous le premier groupe de la démo, archive faite en mode fichier et écrite sur le disque ; la ligne dit « Non vérifiée » et « Vérifier » ; clic scripté sur le vrai bouton (dispatcher `data-action`), sélecteur intercepté, le fichier ; fenêtre « Archive vérifiée » et son texte exact ; « Vérifiée le … » ; rechargement : toujours là ; un octet altéré dans une copie du fichier → « Archive incomplète », « 1 copies sur 3 … », « 1 altérées », « Non vérifiée ».
- **Mutations** : 27 contre Vitest, sur les trois fichiers (chaque comparaison, chaque défaut ignoré, l'état non retenu, la liste qui dirait « vérifiée » à tort, le fichier lu en entier, une tranche entière, les mots, le dossier non gardé, le statut sans handle, le mauvais niveau accepté, le refus qui redevient `null`, le champ `dossier` faux, un mot recopié) : **25 rouges, 2 survivantes au premier passage** — M14 (la garde « répertoire hors du fichier » retirée) : la lecture des fiches attrapait déjà le cas, la garde était redondante, **je l'ai retirée du code** ; M20 (le résultat « autre archive » retenu à tort) : mon banc ne regardait pas la liste après ce geste, **corrigé**, rouge ensuite. 2 contre la spec WebKit (l'empreinte jamais comparée ; la liste qui ne dit jamais « Vérifiée le ») : **2 rouges**. Tout restauré par copie, empreintes égales.
- **Vitest complet** : 666 fichiers, 7 868 essais verts, aucune erreur hors essai (la seule rouge du premier passage, le cliquet des variables CSS fantômes, tenait à mon badge : corrigé). **Playwright ciblé** (4 specs des archives et de l'aide, 10 essais) : vert, aucune reprise. **Le verdict complet n'est pas rendu** : il est dû sur le commit de release.

## 4 · Tranché seul (technique), et ce que j'ai supposé

1. **Un module neuf** (`js/reserve-verifier.js`) plutôt que 470 lignes de plus dans `reserve.js` (1 800 lignes). Il dépend de `Reserve` (liste, dossier), pas l'inverse.
2. **Le mode suit l'archive, pas le navigateur** : `mode_archive` de la ligne (`fsapi` → dossier, `zip` → fichier). Un Chrome qui liste une archive faite dans Safari demandera le fichier. **Supposé** : c'est ce que « dans les deux modes » voulait dire.
3. **« De la bonne taille »** : en mode fichier, la tranche lue est celle que le répertoire du ZIP déclare (une entrée qui déborde du fichier est « tronquée ») ; dans les deux modes, une copie dont l'empreinte diffère est dite « tronquée » si sa taille diffère du `tailleFichier` de sa fiche dans `donnees.json`, « altérée » sinon. **L'empreinte juge d'abord** : une fiche dont `tailleFichier` serait périmé ne peut pas faire échouer une copie intacte.
4. **La couverture se mesure sur les fiches d'aujourd'hui**, par l'`id` (sans l'extension : l'éditeur de pages peut changer `.jpg` en `.pdf`, réponse du lot A1). Une fiche retirée de l'application depuis l'archivage ne manque à rien ; une fiche ajoutée depuis est « non couverte ». Si le groupe n'est plus dans l'application (trimestre supprimé), la couverture est dite « non mesurée » et l'archive peut être vérifiée : il n'y a plus rien à couvrir.
5. **⚠ Conséquence de la règle de la consigne (§ 4 : une fiche non couverte ⇒ pas « vérifiée »)** : un groupe qui a une fiche **sans fichier dans l'application** (marquée « manquante » à l'archivage) ne se vérifiera jamais, puisque l'archive ne peut pas porter cette copie. Je l'ai appliquée telle quelle. **À savoir pour tes données** : la seule fiche « manquante » d'H2026 a son fichier (#997), et Cowork a compté 205 copies sur 205 pour le groupe 00008 : il devrait se vérifier. Si la règle doit s'assouplir (« couverte » = « couverte ou sans fichier »), c'est une ligne.
6. **Le résultat est retenu dans les trois cas** (`verifiee`, `incomplete`, `a_refaire`), avec sa date ; la liste ne dit que deux choses (« Vérifiée le … » / « Non vérifiée »), comme le § 3. Le lot A4 lira l'état complet. Un fichier d'un autre uuid et une archive illisible ne retiennent rien.
7. **L'identité de l'archive** : `uuid` de `meta.json` (déjà dans la ligne depuis l'archivage) plus le SHA-256 du texte de `meta.json`. « Vérifiée le … » exige que l'uuid retenu soit celui de la ligne : une entrée fusionnée d'ailleurs (un manifeste reçu) ne peut pas emporter une vérification d'une autre archive.
8. **Le dossier gardé le temps de la page** (§ 2.5) : trois causes mesurées (#1003) ; la petite est corrigée ici. Ce qui **reste vrai par conception** : d'une session à l'autre, Chrome redemande le dossier tant que « Mémoriser le dossier … entre les sessions » (Défense D-03, Réglages › Préférences › Sécurité) n'est pas activée. Je n'ai pas touché à ce défaut : c'est le modèle de menaces, pas un bug.
9. **Le garde-fou du mauvais niveau** refuse `trimestres`, `travaux`, ou un dossier qui contient `meta.json` ou `donnees.json`, et **arrête le geste** (une erreur `DossierRefuse` remonte à « Archiver… », qui rend `null`, comme un aperçu annulé) : rendre `null` aurait fait basculer « Archiver… » en mode ZIP dans Chrome. Le `manifeste-archives.json` isolé de 16 h 17 reste sur le disque de Grégoire : rien n'y est touché.
10. **#998 fermé** sur la porte de Chrome (mode dossier, 205 sur 205 recalculées par Cowork), avec la réserve écrite : chemin Safari et iPad non prouvés. C'était « ouvert jusqu'à la porte » ; la porte est passée. Si Cowork préfère le garder ouvert jusqu'à une archive dans Safari, c'est une case.
11. **La progression** est celle des copies (« N copies sur M ») ; les textes et la couverture ne sont pas comptés : ils pèsent moins d'une copie.
12. **`DecompressionStream`** (Safari 16.4+, Chrome 80+, WebKit du banc, Node 24) gonfle les textes. Sans lui, le geste dit « Ce navigateur ne sait pas lire les textes compressés de l'archive ». Pas de repli : un second chemin aurait été un second banc.

## 5 · Ce qui remonte à Grégoire

### 5.1 · Les mots hors du § 3 (non soumis, tous dans `ReserveVerifier.MOTS` et `MOTS_DOSSIER`)

- **Le détail sous « Archive incomplète »**, une ligne par sorte, après ta phrase : « 1 absentes », « 1 tronquées », « 1 altérées », « 1 illisibles », « 2 fichiers en trop dans l'archive », « 1 fiches du groupe sans copie dans l'archive », « les données de l'archive ne concordent pas avec leur empreinte », « couverture non mesurée : ce groupe n'est plus dans l'application ». (Le pluriel est fixe : « 1 absentes ». À toi si ça gêne.) Quand seul le détail s'applique (aucune copie fautive, mais un fichier en trop ou une fiche non couverte), ta phrase « N copies sur M manquent… » n'est pas dite, seul le détail l'est.
- **Sous « Archive à refaire »**, une ligne de plus : « 205 copies, 579,2 Mo (compte et taille seulement, sans valoir vérification). »
- **Le fichier d'une autre archive** : titre « Ce n'est pas cette archive », texte « Le fichier choisi est l'archive d'un autre groupe ou d'une autre date. Choisis le fichier de cette ligne. »
- **Une archive illisible** (pas un ZIP, ZIP64, répertoire trop lourd ou hors du fichier, entrée de plus de 1 Go, meta.json absent…) : notification « Archive illisible » avec la cause en une phrase (dix phrases, dans `MOTS.erreurs`).
- **Le garde-fou de Chrome** (`reserve.js`) : « Dossier à choisir de nouveau » — « Choisis le dossier qui contient « trimestres » (la racine de tes archives), pas « trimestres » lui-même ni le dossier d'une archive. »
- **Le titre du bouton** (infobulle) : « Relire cette archive, copie par copie ».

### 5.2 · La ligne des Nouvelles (proposée, version mineure ; couvre aussi le lot A1)

> **Titre** : « Vérifier une archive, copie par copie »
> **Ligne** : « Dans Réglages › Données › Archives, « Vérifier » relit une archive et dit si chaque copie y est, intacte, et si les données concordent ; la liste garde la date. Une archive faite avant cette version est à refaire : depuis 1.171.1, « Archiver… » range chaque copie avec son empreinte, sans charger le groupe en mémoire, et n'inscrit l'archive à ta liste qu'une fois que tu as confirmé que le fichier est là. »

## 6 · Trouvailles, et ce que chacune devient

| | Trouvaille | Statut | Issue |
|---|---|---|---|
| T1 | `listerGroupesVersables().dossier` rendait « a2026-cours-gr00007 » (champ nommé `cours`, lu comme `codeCours`) ; sans lecteur avant ce lot | mesuré (banc) | **Corrigée** : elle bloquait la couverture |
| T2 | Le dossier de Chrome : trois causes (#1003) | mesuré (code) | **Corrigée** ici (§ 4.8, 4.9) ; #1003 inscrit et fermé |
| T3 | Chrome a servi 1.170.2 : `index.html` revalidé, scripts immuables, `version.json` relu toutes les 5 min mais rien ne recharge ; un onglet ouvert avant 11 h 45 garde l'ancienne version | mesuré (code, `netlify.toml`) ; cause **inférée** | **Inscrite** : #1004, à mesurer dans le Chrome de Grégoire, non corrigée (consigne) |
| T4 | L'aide contextuelle de la carte Archives ne nomme pas « Vérifier » ; l'encadré dit « Archiver dans les archives… » | lu | **Inscrite** : ajoutée à #1002 (les mots) |
| T5 | Le cliquet #595 refuse `--gris-pale` ; le badge d'à côté (`.badge-mode-inconnu`) l'emploie encore, avec repli | mesuré | **Commenté dans le code** : sans conséquence observable (le repli s'applique) |
| T6 | Dans le tableau, la démo affiche « gr0demo » pour le groupe (`_normaliserGroupe('demo')`) | mesuré (spec) | **Commentée ici, sans suite** : démo seulement |
| T7 | La spec WebKit passe le panneau des Réglages par un clic scripté sur le bouton, sans ouvrir la section (le tableau est rendu par `rafraichir()`) | lu | Sans suite : la porte fait le geste à la main |

## 7 · Ce que je n'ai pas vérifié

- **Un vrai Chrome, un vrai dossier** : le mode dossier est jugé sur un faux dossier en mémoire (Vitest) ; le vrai `showDirectoryPicker`, la permission en lecture au clic, et `entries()` d'un vrai `FileSystemDirectoryHandle` sont **inférés** de l'API. C'est l'objet de la porte.
- **Le vrai Safari** : le sélecteur de fichier est celui de WebKit intercepté par Playwright ; un vrai clic dans Safari sur le Mac ou l'iPad n'est pas rejoué (#995 pour Chrome : le sélecteur part du clic, avant tout `await`).
- **Les tailles réelles copie par copie** du groupe 00008 : total exact, distribution approchée.
- **Une copie tronquée à l'intérieur d'un ZIP intact** (le répertoire dit N octets, le fichier en a moins pour cette entrée seule) : seul le ZIP coupé en queue est joué en mode fichier ; la copie tronquée est jouée en mode dossier et dans un ZIP refait à partir de lui.
- **`DecompressionStream` dans le Safari de Grégoire** : supposé présent (16.4+).

## 8 · Ce qui est dû après la relecture

1. La relecture de Cowork ; les mots du § 5.1, à Grégoire quand il veut (rien ne bloque).
2. La release (`minor`), la ligne des Nouvelles (§ 5.2), le verdict WebKit complet sur son commit, le push, la fusion vers `main`.
3. La porte sur le Mac, dans Chrome : `plans de travail/PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md` (Cowork publie l'artefact ; le numéro en ligne est à y inscrire à la release).
4. `OU-EN-EST-ON.md` : une ligne à la livraison, pas avant.
