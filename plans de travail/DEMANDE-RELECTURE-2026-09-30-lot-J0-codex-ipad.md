# Demande de relecture – lot J0 : sur l'iPad, la page meurt pendant la compression du codex (#988 rouverte)

> Écrite le 30 septembre 2026, vers 6 h 40 (Toronto), par Claude Code, pour Cowork. Branche `lot-j0-codex-ipad-memoire`, partie de `main` à `0502e0f8`. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (5 h 24) et ses deux compléments (5 h 33 : mémoire ET disque ; 5 h 49 : console de l'iPad). **Ni release ni push.**

## Pour Grégoire, en deux phrases

Quand tu mets ton codex à jour, l'application ne charge plus tes copies en mémoire pour fabriquer le fichier : elle les y range telles quelles, en 7 secondes au lieu de 47 sur le Mac, et sans rien poser de plus sur le disque. C'est mesuré sur le Mac, pas sur ton iPad : l'étape du partage vers Fichiers ne peut se juger que là, et c'est ce que la porte terrain demande.

## 1 · Ce qui a changé

- **`js/codex.js`, `genererCodex`** : les copies ne sont plus déposées dans JSZip. La fonction garde la liste de leurs références (`{ nom, blob }`), et confie la fabrication à une fonction neuve, `_assemblerCodexZip`.
- **`_assemblerCodexZip`** : JSZip compresse les textes (`donnees.json`, le manifeste, le dossier `travaux/`), comme avant. Chaque copie est ensuite rangée telle quelle (méthode STORE) : elle est lue une fois, par tranches de 4 Mo, pour son CRC, et le Blob rendu la **référence** (`new Blob([..., enTete, blob, ...])`) au lieu de la recopier. Le répertoire central de JSZip est repris tel quel, suivi des fiches des copies.
- **`_entreesDuCodex`** : la Défense K (`validerExportCodex`) et l'aperçu reçoivent la liste complète des entrées, dans l'ordre d'avant. Aucun fichier `js/securite-*.js` n'est touché.
- **`index.html`** : jeton de `js/codex.js` → `20260929k`.
- **Ce qui ne change pas** : le parcours et les messages du lot G (« Compression du ZIP… », « N % compressé », l'aperçu et son compte d'entrées, le témoin, la tentative tracée) ; la lecture d'un codex (`chargerCodex`, `validerCodex` : pas une ligne) ; aucune donnée n'est écrite ni effacée ; aucun fichier de codex existant n'est touché.
- **Ce qui change dans le fichier** : les copies n'y sont plus compressées. Même contenu, octet pour octet ; **taille + 3,3 %** sur le codex réel (42,4 Mo que DEFLATE gagnait sur 1,3 Go de PDF). Les textes restent compressés.

## 2 · La mesure, en quatre chiffres

Détail : `plans de travail/MESURE-2026-09-30-lot-J0-codex-memoire.md`. WebKit 26.4 sur le Mac, instrument `footprint` (le compteur `phys_footprint_peak` du noyau), 500 copies fictives aux tailles réelles.

| À 1,3 Go de copies | Avant | Après |
|---|---|---|
| Pic de mémoire de la page | 6,5 Go | 0,3 Go |
| Posé sur le disque avant toute écriture | 1,25 Go | rien |
| Durée | 47 s | 7 s |

Les pistes de la consigne, jugées par la mesure : `STORE` seul ne baisse pas la mémoire (5,3 Go) ; le flux seul la ramène à 1,7 Go ; les deux ensemble à 1,5 Go, plancher égal à la taille des copies, parce que JSZip lit chaque copie dès son dépôt et les garde toutes (vérifié dans `libs/jszip.min.js`, `prepareContent`). Et les trois posent toujours 1,25 Go sur le disque. Seule la piste retenue retire les deux.

**Mémoire ou disque, pour la cause du 30 sept. : non départagé.** Les deux se produisent à la même étape. L'essai qui aurait tranché sur le Mac (dossier temporaire du processus réseau sur un petit volume) a été refusé par le bac à sable de la session ; je ne l'ai pas contourné. Le lot réduit les deux à l'étape de la fabrication ; il ne change rien à l'étape du partage.

## 3 · La preuve

- **Banc Vitest neuf**, `tests/unit/sentinelle-988-lot-J0-codex-assemble-sans-copier.test.js`, 24 essais : (a) le fichier du lot et un fichier au format 1.170.0 (rédacteur de référence figé dans le banc) portent les mêmes entrées, octet pour octet, et restituent les mêmes données et les mêmes copies dans une base vide (empreintes SHA-256) ; (b) JSZip relit le fichier **en vérifiant les CRC** ; la clôture du fichier est jugée sur les octets ; (c) la Défense K et l'aperçu voient toutes les entrées, et la vraie Défense K refuse toujours un nom hors liste ; (d) une copie n'est lue que par tranches de 4 Mo au plus, et JSZip ne reçoit aucune copie (l'invariant de mémoire, verrouillé par un Blob espion) ; (e) les bornes du format ZIP (4 Go, 65 535 entrées) sont refusées avant toute lecture.
- **Break-test : neuf mutations de la source, neuf rouges**, portées par le banc lui-même (témoins en mémoire ; une mutation qui ne remplace rien est refusée, « Témoin inerte ») : CRC non poursuivi d'une tranche à l'autre ; position d'entrée fausse d'un octet ; compte d'entrées qui oublie les copies ; règle « le dernier dépôt l'emporte » retirée ; liste qui tait les copies à la Défense K ; tranche de 64 Mo ; copies reconfiées à JSZip ; garde de taille retirée ; enveloppe d'un tampon d'octets retirée.
- **Dans le vrai WebKit, sur les deux applications** (l'arbre du lot et un worktree de `0502e0f8`, retiré depuis) : fichier du lot ouvert dans 1.170.0, fichier de 1.170.0 ouvert dans le lot, et les deux témoins : quatre empreintes identiques à la source, 40 copies sur 40.
- **À taille réelle** : le fichier de 1,3 Go écrit par le banc passe `unzip -tq` (503 entrées, « No errors detected »).
- **Vitest complet** : 664 fichiers, 7 791 essais, verts ; aucune ligne « Errors » ni « Unhandled » (avant le lot : 663 et 7 767).
- **Playwright, ciblé** : les sept fichiers qui traversent la génération du codex (lots F, G, I, #654, #637), 22 essais, verts au premier essai, 3,0 min, sous `caffeinate`. **La suite complète n'a pas été lancée** : son verdict est dû sur le commit de release, qui n'existe pas encore.

## 4 · Tranché seul (technique), et ce que j'ai supposé

- **La piste C plutôt qu'un réglage de JSZip**, sur la mesure (§ 2). *Supposé* : un rédacteur de ZIP écrit à la main (environ 120 lignes) est acceptable s'il est verrouillé par un lecteur indépendant ; il l'est par JSZip avec CRC, et par `unzip`.
- **Dans `js/codex.js`, pas dans un module neuf** : tous les bancs qui montent `codex.js` seul continuent de tourner sans rien leur ajouter.
- **L'ordre des entrées dans le fichier** : les textes d'abord (dont le manifeste), puis les copies. Avant, le manifeste venait en dernier. Les lecteurs lisent par nom ; l'aperçu, lui, garde l'ordre d'avant.
- **Les mots de la progression sont gardés** (« Compression du ZIP… », « N % compressé »), bien que les copies ne soient plus compressées : la consigne dit que les messages du lot G ne changent pas. Si ces mots doivent changer, c'est à Grégoire.
- **Chaque tranche lue est rendue aussitôt** (`ArrayBuffer.transfer(0)`, Safari 17.4 et plus) : sans cela, mesuré, les tranches s'empilaient jusqu'à 1,2 Go pour 2,4 Go de copies. Sur un Safari plus ancien, le repli est cet empilement (encore quatre à dix fois sous l'avant).
- **Au-delà de 4 Go, un refus clair** (« Le codex dépasse ce que le format ZIP peut contenir »), qui arrive à l'écran par le message existant « le fichier n'a pas pu être préparé ». Avant, JSZip aurait écrit un fichier faux sans rien dire (il n'écrit pas le ZIP64), s'il avait survécu à la mémoire.
- **Une copie stockée en tampon d'octets plutôt qu'en Blob est enveloppée** avant d'être rangée : JSZip l'acceptait, l'équivalence est gardée (un essai, un témoin). Je n'ai pas mesuré si le stockage réel en contient.
- **Jeton anti-cache `20260929k`, daté du build courant** : la sentinelle exige un jeton du jour du build, et le build date du 29. La release le refera de toute façon (`release.mjs` le passe à `20260930…`, vu à blanc). Je n'ai pas lancé `--build-only`.
- **`RELAIS.md` n'est ni rempli ni poussé**, malgré la règle du 8 août (« si un merge doit attendre, pousser RELAIS.md sur `main` seul ») : la consigne du jour interdit le push avant la relecture, et je l'ai fait primer. **À trancher par toi** : si tu veux le relais sur `main` avant la relecture, dis-le.

## 5 · Ce qui remonte à Grégoire

Rien ne bloque la relecture ni la porte. Trois points touchent ses données ou ce qu'il lira.

### 5.1 · La ligne des Nouvelles (proposée, à accepter ou réécrire)

Version prévue : 1.170.1 (correctif d'un retour vécu, couleur orange).

> **Titre** : « Le codex se met à jour sans charger tes copies en mémoire »
>
> **Ligne** : « Sur l'iPad, la mise à jour d'un gros codex pouvait s'arrêter pendant la compression : la page se rechargeait et aucun fichier n'était écrit. Le fichier est maintenant préparé sans charger tes copies en mémoire, et beaucoup plus vite. Il pèse un peu plus lourd (environ 3 %) : tes copies y sont rangées telles quelles. »

⚠ À ne publier qu'après la porte : tant que l'iPad n'a pas réussi, la ligne promet ce qui n'est pas prouvé.

### 5.2 · Un codex de plus de 2 Go ne se rouvre pas (trouvé en chemin, non touché)

`validerZipSecurite` (`js/import-export.js` l. 22) refuse à l'ouverture tout ZIP de plus de 2 Go une fois décompressé. Le codex de Grégoire en est à 1,33 Go (1,24 Go le 24 sept.). Le lot ne change pas cette borne. **À décider par Grégoire, avant d'y arriver** : ce qu'un codex doit emporter quand il grossit (la question de la consigne, § 2.4, se posera là). Je n'ai rien mesuré de l'ouverture d'un gros codex ; je note seulement qu'elle lit le fichier entier en mémoire (`validerCodex`, `_lireCommeArrayBuffer`), ce qui sur l'iPad risque le même mur qu'à la fabrication. **Issue 2 : à inscrire ou à refuser par toi** ; je ne l'ai pas inscrite au BACKLOG (aucun symptôme vécu).

### 5.3 · Les anciens fichiers de codex s'accumulent

Constaté en lisant le dossier iCloud où vivent ses codex (lecture seule) : quatre fichiers de 1,2 à 1,3 Go (24, 28 et deux du 29 sept.), soit 5 Go. Chaque mise à jour en ajoute un, daté. Inférence, non mesurée : s'ils occupent aussi l'iPad, c'est une part des 3 Go qui manquent. **Je n'y ai pas touché** : garder ou retirer d'anciens codex est à lui.

## 6 · Trouvailles, et ce que chacune devient

| Trouvaille | Issue | Disposition |
|---|---|---|
| « Exporter une sélection » (`actionExporterSelection`, `js/codex.js`) fabrique son fichier à l'ancienne : même coût en mémoire et en disque à grande taille | 2 | **à disposer par toi** : non inscrite (aucun symptôme vécu sur ce geste). La migration tient en dix lignes, mais veut son propre banc |
| Un codex de plus de 2 Go ne se rouvre pas ; l'ouverture lit tout le fichier en mémoire | 2 | **à disposer par toi** (§ 5.2) |
| Au démarrage, la saisie des présences s'initialise avant que le trimestre soit connu, quand « trimestres » ne tient plus dans le localStorage | 2 | **inscrite, #990** (§ 7) |
| Le rapporteur de Vitest s'étouffe (« Invalid array length ») quand une assertion ratée emporte un fichier entier dans son message | 3 | commentée dans le banc (`verdictDOuverture`) |
| JSZip ouvre sans broncher un fichier dont la clôture annonce un compte d'entrées faux | 3 | commentée dans le banc ; le compte y est jugé sur les octets |

## 7 · Les deux compléments de Cowork

**5 h 33, mémoire et disque.** Traité dans la mesure (§ 4 et § 7 du fichier de mesure) : chaque piste y a son coût en mémoire et en disque. L'hypothèse du disque est fondée : avant le lot, WebKit posait le fichier entier dans un fichier temporaire à la fin de la compression. Aucune sonde sur l'iPad n'est proposée : la porte et le rapport de bug suffisent, et ne touchent à rien.

**5 h 49, console de l'iPad.** Arrivé en texte collé ; je l'ai traité comme un complément de la consigne, en lecture seule.
- *Les vignettes en cache mémoire* : au plus 9,5 Mo (190 × 25 000 caractères, deux octets chacun), soit 0,15 % du pic d'avant. Négligeable pour la cause (§ 8 de la mesure).
- *Le calendrier vide au démarrage* : **oui, un chemin réel existe, et il se voit à l'écran.** Mesuré sous WebKit au pack démo (« trimestres » retirée du localStorage, localStorage rempli, rechargement) : les trois avertissements de l'iPad sortent à +139 ms, avant `db-ready` (+159 ms), tous depuis `initialiserModuleSaisiePresences` (`js/main.js` l. 1137). Sans trimestre connu, `cle()` rend des clés sans préfixe : le module écrit `{}` dans la clé nue `calendrierComplet`, écrit trois clés nues neuves (`presences_date`, `presences_groupe`, `presences_tri`), et rend l'écran de saisie avec **2 lignes au lieu de 11** ; rien ne le refait à `db-ready`. **Le calendrier du trimestre, lui, n'est pas vidé** (124 jours avant et après), et ton hypothèse est juste à un détail près : ce n'est pas la clé du calendrier qui est purgée, c'est une clé nue voisine. Non mesuré : ce que Grégoire voit sur l'iPad, où la clé déborde à chaque chargement. **Fiche #990 inscrite, rien corrigé.**
- *Le poids du namespace démo dans le quota* (ton point 4) : non mesuré, pas demandé dans le complément.

## 8 · Ce qui est dû après la relecture

1. Release (patch proposé), verdict Playwright complet sur le commit de release, push, « en ligne » lu chez Netlify.
2. La porte `plans de travail/PORTES-TERRAIN-2026-09-30-lot-J0-codex-ipad.md` : son artefact est à publier par toi (champs de saisie aux rangées 0.2, 1.2 et 1.4) ; le numéro de version de 0.1 est à y inscrire.
3. #988 reste aux « Ouverts » de `SUIVI-BUGS.md` jusqu'à la porte passée.
4. Si le fichier écrit par l'iPad arrive dans le dossier iCloud : `unzip -tq` dessus, lecture seule, et 503 entrées ou plus.
