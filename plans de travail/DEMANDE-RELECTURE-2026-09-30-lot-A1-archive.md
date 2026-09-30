# Demande de relecture – chantier des archives, lot A1 : une archive fabriquée comme le codex de ce matin

> Écrite le 30 septembre 2026, vers 13 h 30 (Toronto), par Claude Code, pour Cowork. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (12 h 39). Branche `lot-a1-archive-sans-copier`, partie de `main` à `e92f2001` (1.171.0). **Ni poussée ni livrée** : aucune release, aucun numéro de version touché.
> Chaque constat dit s'il est **mesuré**, **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **Ce qui change à l'écran** : « Archiver… » sous Safari ne dit plus « Groupe archivé » dès le clic. Après la barre, la fenêtre du codex téléchargé apparaît (« Téléchargement lancé », « Il y est » ou « Il n'y est pas ») ; l'archive n'entre dans ta liste qu'après ton « Il y est ».
2. **La mesure, avant et après** (banc du Mac, 205 copies aux tailles de ton plus gros groupe, 607 Mo) : mémoire de la page 3 262 Mo → 228 Mo ; disque posé avant l'écriture 607 Mo → 2 Mo ; du geste au téléchargement 22 s → 4,6 s.
3. **Ce qui te revient** : relire les mots de la fenêtre « Groupe non archivé » (§ 5.1, repris de ceux du codex) ; puis, une fois le lot en ligne, une porte courte sur ton Mac. **Tes données** : rien n'est écrit ni effacé dans tes trimestres ; seul le registre des archives reçoit une ligne, après ta confirmation.

## 1 · Ce qui a changé

| Fichier | Changement |
|---|---|
| `js/fichier-sortant.js` (neuf) | Reçoit, déplacées telles quelles de `js/codex.js` : l'assemblage sans copier les copies (`assemblerZip`, ex-`_assemblerCodexZip`), la liste des entrées pour la Défense K et l'aperçu (`entreesDuZip`), le téléchargement à libération différée (`telecharger`), la fenêtre « Téléchargement lancé » (`confirmerTelechargement`) et la taille dite à l'usager (`tailleEnviron`) |
| `js/codex.js` | Appelle `window.FichierSortant` ; les cinq pièces et leurs constantes en sont retirées (241 lignes de moins). Aucun changement de comportement voulu |
| `js/reserve.js` | Mode fichier : copies rangées par référence ; boucle téléchargement → confirmation → registre. Les deux modes : une empreinte SHA-256 par copie dans `meta.json` |
| `index.html` | Le script neuf, avant `reserve.js` ; jetons `?v=` de `reserve.js` et `codex.js` relevés |
| `docs/architecture/SPEC-RESERVE-V1.md` | § 13 : ce que le lot ajoute au format |
| `tests/` | Sentinelle neuve (32 essais) ; bancs du codex adaptés au module commun ; deux specs WebKit adaptées, l'une étendue |
| `BACKLOG.md` | #996 à #1002 (consigne § 5) ; #991 et #993 complétés |

## 2 · La mesure, avant et après

**Mesuré** au banc de ce midi, rebâti : WebKit 26.4 de Playwright, sans interface, profil persistant, le vrai `index.html`, le vrai `Reserve.verserGroupeCours`, pack démo, 205 copies fictives aux tailles réelles du groupe 00008 d'H2026 (octets aléatoires, 607 334 696 octets). Un navigateur neuf par mesure ; mémoire par `footprint` (pic depuis la naissance du processus), disque par `df`. Une passe de chaque côté ; l'« avant » de midi, même banc, donnait 3 426 Mo.

| | Avant (1.171.0, `e92f2001`) | Après (la branche) |
|---|---|---|
| Mémoire de la page, pic | **3 262 Mo** | **228 Mo** (elle part de 180 Mo environ) |
| Mémoire du processus réseau, pic | 1 229 Mo | 29 Mo |
| Disque posé avant l'écriture | **607 Mo** (le fichier entier) | **2 Mo** |
| Du geste au clic du téléchargement | **22 s**, dont 21 s de compression | **4,6 s** : collecte avec empreintes 1,1 s (0,7 s avant le lot), assemblage 1,7 s, le reste en préparation et en pause d'affichage |
| Fichier rangé par le navigateur | à 23 s | à 5,5 s |
| Fichier | 607 589 162 octets, 212 entrées | 607 412 285 octets, 212 entrées |
| Adresse du fichier libérée | aussitôt (au clic) | pas pendant le geste (minuterie de 5 min) |
| Inscrite au registre, « Groupe archivé » | dès le clic | seulement après « Il y est » |

## 3 · La preuve

- **Le fichier, à taille réelle** (mesuré) : `unzip -tq` sans erreur ; relu par JSZip avec contrôle des CRC ; 205 copies en STORE, 4 textes en DEFLATE ; **205 empreintes portées, 205 recalculées égales** ; mêmes 212 noms d'entrées que l'archive d'avant, mêmes octets pour les 205 copies. `meta.json` : les champs de 1.171.0, plus `integrite.travaux_sha256`.
- **Le format, au banc Vitest** (`tests/unit/sentinelle-lot-A1-archive-sans-copier.test.js`, 32 essais) : rédacteur de référence figé (1.171.0) contre le lot, mêmes entrées octet pour octet ; empreintes dans les deux modes (le mode dossier sur un faux dossier en mémoire, `meta.json` écrit en dernier) ; Défense K et aperçu reçoivent les 12 entrées dans l'ordre d'avant ; la vraie Défense K refuse un nom hors liste avant toute écriture.
- **L'ouverture croisée, sous WebKit** (mesuré, archives de 607 Mo) : l'archive du lot s'ouvre dans 1.171.0 (copie de `e92f2001`), l'archive de 1.171.0 s'ouvre dans le lot ; mêmes six sections, « Fichiers travaux 205 », aucune notification d'erreur. Témoin : l'archive de 1.171.0 dans 1.171.0 rend la même chose.
- **La confirmation** : au banc Vitest et dans la spec WebKit `lot-f-rappel-et-reserve` (étendue) : tant que l'usager n'a rien dit, registre inchangé, aucune réussite annoncée, adresse non libérée ; « Il n'y est pas » puis « Fermer » : groupe non archivé ; « Réessayer » : le même fichier repart.
- **Mutations sur le disque** : 17 contre les sentinelles Vitest, **17 rouges** ; 4 contre la spec WebKit, 3 rouges au premier passage et **une survivante**, corrigée (voir § 7, T2), rouge ensuite.
- **Vitest complet** : 665 fichiers, 7 825 essais verts, aucune erreur hors essai. **Playwright ciblé** (9 specs de l'archive et du codex, 26 essais) : vert. **Le verdict complet n'est pas rendu** : il est dû sur le commit de release.

## 4 · Tranché seul (technique), et ce que j'ai supposé

1. **Le partage de la pièce du lot J0 : un module commun, `js/fichier-sortant.js`.** `reserve.js` reste sans dépendance à `codex.js` (spécification d'avril), sans doublon. Coût : trois bancs du codex montent maintenant ce module avant `codex.js` (un assistant commun, `tests/unit/_helpers/monter-fichier-sortant.js`).
2. **J'y ai aussi mis le téléchargement, sa fenêtre de confirmation et la taille dite**, pas seulement l'assemblage : l'archive les réemploie tous les trois, et les laisser dans `codex.js` aurait obligé à les recopier. **C'est un élargissement de ce que la consigne nommait** ; il touche le trajet du codex (mêmes lignes, déplacées), couvert par les bancs des lots F, G, I, J0 et J0 bis, tous verts.
3. **L'empreinte vit dans `meta.json`**, pas dans un fichier voisin : aucun chemin neuf (la Défense K et un lecteur d'avant n'ont rien à apprendre), et en mode dossier `meta.json` reste écrit en dernier. Clé : le nom du fichier sous `travaux/`.
4. **L'empreinte est calculée pendant la collecte**, sous le message existant « Collecte des fichiers travaux… » : aucun mot neuf à l'écran, un seul site pour les deux modes. Chaque copie est lue en entier, une à la fois, puis son tampon est rendu (plus grosse copie réelle : 23,6 Mo). Elle est donc lue deux fois (empreinte, puis CRC) ; à 607 Mo les deux passes tiennent en 2,8 s, je ne les ai pas fusionnées.
5. **Une copie présente mais illisible fait échouer l'archivage** (comme avant, où JSZip échouait) ; elle n'est pas comptée « manquante ».
6. **Sans `crypto.subtle`**, l'archive part quand même et porte `travaux_sha256: null` (même règle que l'empreinte des données). **Supposé** : le lot A2 refusera de dire « vérifiée » une archive sans empreintes.
7. **« Il n'y est pas »** ouvre une fenêtre avec « Réessayer » (le même fichier repart, sans le refabriquer). **Supposé** : c'est ce que « reprends le parcours du codex téléchargé » voulait dire.
8. **L'étape « Téléchargement… » (99 %) de la barre est retirée** : la barre finit sur « Archive prête ! », puis la fenêtre prend le relais.
9. **Les messages d'erreur de l'assembleur sont devenus neutres** (« Le fichier dépasse ce que le format ZIP peut contenir (4 Go). ») : pour l'archive ils s'affichent dans « Groupe non archivé » ; pour le codex ils ne vont qu'au rapport de bug.

## 5 · Ce qui remonte à Grégoire

### 5.1 · Les mots du parcours : aucun mot neuf, mais un réemploi à accepter

Tout est repris de mots déjà acceptés ou déjà à l'écran. À confirmer, surtout la seconde fenêtre.

- **Fenêtre « Téléchargement lancé »** (mots du codex, lot G, inchangés) : « L'application ne peut pas savoir si le téléchargement s'est terminé. Attends qu'il le soit, puis vérifie que le fichier « archive-…zip » (environ 579 Mo) se trouve dans tes Téléchargements. » Boutons : « Il y est », « Il n'y est pas ».
- **Fenêtre « Groupe non archivé »** (titre : celui de la notification d'erreur existante ; phrase : celle de « Codex non mis à jour ») : « Le fichier (environ 579 Mo) n'a pas été enregistré. Si ton appareil manque d'espace, libères-en, puis réessaie. Tes données restent dans l'application. » Boutons : « Réessayer », « Fermer ».
- **Notification de réussite**, inchangée, mais après la confirmation : « Groupe archivé : fichier téléchargé ».

**Question fermée pour Grégoire** : la fenêtre « Groupe non archivé » (a) telle quelle ; (b) sans la phrase sur l'espace (elle nomme l'espace quelle que soit la cause : c'est #994, que cette fenêtre hérite) ; (c) autres mots, à lui.

### 5.2 · La ligne des Nouvelles (proposée, pour la release)

> **Titre** : « Archiver un gros groupe sans saturer la mémoire »
> **Ligne** : « Sous Safari, archiver un groupe qui a beaucoup de copies ne charge plus toutes les copies en mémoire. L'archive n'est ajoutée à ta liste qu'une fois que tu as confirmé que le fichier est bien dans tes Téléchargements. »

## 6 · La question du plan : une copie peut-elle changer après son import ? Oui.

**Lu au code** (tous les appelants de `travauxStockage.stockerBlob` avec un identifiant existant) :

| Geste | Ce qu'il fait à la copie | Trace sur la fiche |
|---|---|---|
| **Éditeur de pages**, « Enregistrer » (`sauvegarderEdition`, `js/travaux-ui.js`) : pivoter, réordonner, supprimer ou ajouter des pages, fusionner | Réassemble un PDF et le range **sous le même identifiant**. Une image devient un PDF : le nom du fichier dans l'archive change (`<id>.jpg` → `<id>.pdf`) | `dateModification`, `tailleFichier`, `typeMIME`, `nomFichier` |
| **« Ré-importer »** (`reimporterFichier`, `js/travaux-import.js`), offert seulement sur une copie « fac-similé » | Remplace le fichier sous le même identifiant | `dateModification`, `blobStatut: 'present'` |
| **Ouvrir un codex, fusionner, importer une copie de secours** (`js/codex.js`, `js/import-export.js`) | Réécrit les fichiers sous leurs identifiants, avec le contenu du fichier ouvert | aucune |
| Annoter | **Rien** : les annotations vivent dans les données (`annotationsTravaux`), pas dans le fichier | sans objet |

**Conséquence pour le lot A4** : une archive vérifiée hier ne vaut pas pour une copie modifiée depuis, et le troisième geste ne laisse aucune date. Le retrait doit donc comparer, **au moment du geste**, l'empreinte de la copie du navigateur à celle que l'archive porte ; et retrouver la copie par son identifiant, pas par son nom de fichier (l'extension peut avoir changé). Noté dans #1001.

## 7 · Trouvailles, et ce que chacune devient

| | Trouvaille | Statut | Issue |
|---|---|---|---|
| T1 | L'archive dit sa taille en unités binaires : « environ 579 Mo » pour un fichier que le Finder donne à 607,4 Mo. Grégoire lira les deux à la porte | mesuré | **Inscrite** : ajoutée à #993 ; la porte le prévient |
| T2 | Dans ma première version de la spec WebKit, « aucune réussite annoncée » se jugeait par une assertion qui réessaie, sur une notification qui ne reste que 3 s : elle finissait toujours par passer. Vue par la mutation M12, corrigée (les annonces sont consignées) | mesuré | **Corrigée** : c'était mon lot. Non mesuré : d'autres specs avec le même défaut |
| T3 | Deux archives du même état, faites à deux ouvertures de la page, diffèrent par une clé de données (`indicesPatternsRaI`, réécrite au démarrage) | mesuré | **À disposer par Cowork** : le lot A2 ne peut pas exiger que les données de l'archive égalent celles du navigateur |
| T4 | `nombre_fichiers_travaux` compte deux fois une copie citée deux fois, alors que le fichier n'en porte qu'une (comportement d'avant, conservé) | lu, banc | **À disposer par Cowork** : le « 205 sur 205 » du lot A2 doit compter les noms, pas les dépôts. Non mesuré : si le stock réel a de tels doublons |
| T5 | `SPEC-RESERVE-V1.md` est périmée ailleurs (noms de fichiers, « pas de FSAPI ») ; je n'y ai ajouté que le § 13 | lu | **À disposer par Cowork** |
| T6 | L'aide d'« Archiver » porte des fautes (« tes archives personnelle locale », « un archive archivée ») | lu | Avec les mots du lot A5 (#1002) |
| T7 | Les passages planifiés de GitHub au navigateur : aucun vert depuis le 21 sept. (audit de début de session) | mesuré | Déjà #979 |

## 8 · Ce que je n'ai pas vérifié

- **Safari réel**, sur le Mac comme sur l'iPad : le banc est le WebKit de Playwright, sans interface. **Inféré, non mesuré** : que Safari accepte un téléchargement lancé quelques secondes après le dernier clic (il le faisait avant le lot, après 22 s ; « Réessayer » part d'un clic frais). C'est l'objet de la porte.
- **Des copies réelles** : octets aléatoires, tailles réelles.
- **Le mode dossier dans un vrai Chrome ou Edge** : jugé en Vitest sur un faux dossier ; seule l'empreinte y change.
- **La libération à 5 minutes** : la minuterie est jugée (délai, et c'est bien elle qui libère), pas l'attente réelle.
- **Le « tampon rendu avant la copie suivante »** : deux essais sautent sous Node 20 (le runner), qui n'a pas `ArrayBuffer.prototype.transfer` ; ils tournent sur le Mac (Node 24).
- **La mutation « copies reconfiées à JSZip »** rougit dans Node parce que JSZip n'y lit pas un Blob ; le coût en mémoire, lui, est mesuré par le banc WebKit, pas par cette mutation.
- La copie de 1.171.0 servie au banc n'avait pas ses images de tampons (extraction partielle) : des erreurs d'images à la console, sans rapport avec l'ouverture.

## 9 · Ce qui est dû après la relecture

1. Les mots (§ 5.1) et la ligne des Nouvelles (§ 5.2), par Grégoire.
2. La release (`minor`), le verdict WebKit complet sur son commit, le push, puis la fusion vers `main`.
3. La porte sur le Mac : `plans de travail/PORTES-TERRAIN-2026-09-30-lot-A1-archive.md` (Cowork publie l'artefact). **Elle ne peut se faire qu'une fois le lot en ligne.**
4. `OU-EN-EST-ON.md` : une ligne à la livraison, pas avant.
