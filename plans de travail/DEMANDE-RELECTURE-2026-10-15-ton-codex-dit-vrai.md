# Demande de relecture – « Ton codex dit vrai » (#994, #993, #1020)

> Écrite par Claude Code le 15 octobre 2026 à 9 h 38 (Toronto, mesurée par `date`). Consigne : `CONSIGNE-DU-JOUR.md` (Cowork, 9 h 25). Décisions : `DECISIONS-2026-10-15-ton-codex-dit-vrai.md`. Commit : voir la ligne « Commit » en bas.
> **Aucun push, aucune release, aucun verdict Playwright** : en attente du signal du soir.

## En bref

| Partie | Fait | Prouvé par |
|---|---|---|
| #994 | L'échec d'écriture du codex dit la cause d'espace seulement sur `QuotaExceededError`. Mise à jour et codex à part. | Banc neuf, vraie écriture du codex (`codex.js` monté), 7 essais dont 3 break-tests |
| #993 | Une seule fonction, `window.TailleFichier.dire` (nouveau `js/taille-fichier.js`). Une quinzaine d'écrans la prennent ; `tailleEnviron`, `Reserve.formaterTaille`, `travauxStockage.formaterTaille` et `_formaterTaille` de `codex.js` sont retirés. | Même banc, 9 essais dont 3 break-tests de mutation et un break-test manuel du verrou statique |
| #1020 | La phrase de la fenêtre « Avant de supprimer, un codex à part » ; commentaire daté du 15 oct., 9 h 23. | Même banc, 2 essais dont 1 break-test |

Vitest complet depuis `tests/` : **8 786 sur 8 786 verts, 752 fichiers**, aucun « Errors » ni « Unhandled ». Playwright non lancé (consigne). Trois specs Playwright citaient les anciens mots et sont mises aux nouveaux sans avoir été exécutées : `1007-codex-a-part-avant-suppression.spec.js` (la phrase et le message d'échec), `lot-g-codex-ipad-echec-se-dit.spec.js` (le message d'échec). Elles seront jugées au verdict du soir.

## Suppositions que j'ai faites (à corriger en dix secondes si fausses)

1. **Où se place la phrase d'espace.** La décision dit qu'elle « s'ajoute ». Je l'ai mise juste après la première phrase :
   - mise à jour : « Le fichier (…) n'a pas été enregistré. Ton appareil manque d'espace : libères-en, puis réessaie. Tes données restent dans l'application. Si ça se répète, utilise « Signaler un bug » : le détail y sera. »
   - codex à part : « Le fichier (…) n'a pas été enregistré : rien n'a été supprimé. Ton appareil manque d'espace : libères-en, puis réessaie. Si ça se répète, utilise « Signaler un bug » : le détail y sera. »
2. **La virgule décimale partout.** Décision de Grégoire du 5 oct. pour les archives ; je l'ai étendue à tous les écrans, puisqu'il n'y a plus qu'une fonction. Le codex, l'import et les copies disaient « 1.5 Mo » ; ils disent « 1,5 Mo ».
3. **Sous la base, en octets.** « 512 o » partout. Avant : `tailleEnviron` disait au moins « environ 1 Ko », le codex data disait « 0 Ko », les copies « 512.0 o ». Aucun codex ni archive ne pèse moins de 1 Ko.
4. **L'unité suit la taille.** Les messages d'import forçaient le Mo (« 1500.0 Mo ») ; ils passent au Go au-delà de 1 Go. L'aperçu d'export n'avait pas de Go (« 1100.0 Mo ») ; il en a. La liste des doublons ne disait que des Ko ; elle passe aux Mo au-delà de 1 Mo (une décimale).
5. **La précision de chaque écran est gardée** (sauf les cas 3 et 4) : elle passe en option (`decimales`). Une valeur qui s'arrondirait à la base passe à l'unité suivante (plus de « 1024 Mo », le défaut cosmétique noté au lot G).

## #994 – ce que `sauvegarderVersDestination` peut rendre, chemin par chemin (mesuré au code)

| Chemin | Erreurs possibles | Ce que dit la fenêtre |
|---|---|---|
| Fichier tenu (mise à jour simple, Chrome ou Edge) | Toute erreur de `createWritable`, `write` ou `close` est **avalée** : le fichier n'est plus tenu, et l'application ouvre la fenêtre de choix. | Selon ce que rend ensuite la fenêtre de choix. **La cause du premier échec ne parvient jamais au message**, même `QuotaExceededError`. |
| Fenêtre de choix (Chrome, Edge) | `AbortError` est traité comme une annulation (aucun message). `SecurityError` (toucher expiré, #995), `NotAllowedError` et toute erreur d'écriture deviennent un échec qui porte son erreur. | Neutre, ou avec l'espace si l'erreur s'appelle `QuotaExceededError`. |
| Partage (iPad) | `AbortError` (feuille fermée ou refus du système, indiscernables), `NotAllowedError` (toucher expiré), `TypeError` ou `DataError` (fichier refusé). Aucune ne nomme l'espace. | Toujours neutre. |
| Téléchargement dit absent (« Il n'y est pas ») | Aucune erreur : l'usager répond. | Toujours neutre. |
| Exception levée par la fonction elle-même | Attrapée dans `_ecrireLeCodexPrepare` (stratégie « inconnue »), avec son erreur. | Même règle. |

Aucun autre nom ne dit l'espace dans le code : je n'en ai ajouté aucun à la règle.

Ce que je n'ai pas mesuré : le nom que Chrome rend vraiment sur un disque plein, par la fenêtre de choix. La décision le dit déjà pour Safari et Chrome, et le message neutre reste vrai dans ce cas. Conséquence à connaître : **sur l'iPad (partage), la phrase d'espace ne s'affichera jamais.**

Le témoin (`_direNonMisAJour`) et les boutons « Réessayer » et « Télécharger à la place » ne changent pas. Le banc le vérifie.

**Trouvaille, issue 2 (inscrire et continuer), non inscrite au BACKLOG.** Sur le chemin « fichier tenu », un `QuotaExceededError` est avalé avant d'atteindre la règle (première ligne du tableau). Je ne l'ai pas inscrite, faute de symptôme vécu (règle du 24 août). C'est à toi de juger si la ligne vaut une fiche.

## #993 – la fonction

`js/taille-fichier.js` est chargé dans `index.html` avant `securite-export-preview.js`, donc avant tout module qui dit une taille.

- **Détection du système** : `navigator.userAgentData.platform` quand le navigateur le donne (Chrome et Edge), sinon « Windows » dans `navigator.userAgent`. Tout le reste compte en base 1000.
- **Sur un iPad**, Safari se déclare « Macintosh » et n'a pas `userAgentData` : base 1000, comme iPadOS. Le banc le vérifie avec l'agent de Safari.
- Linux compte aussi en base 1000.

254 700 000 octets, à la précision de chaque écran :

| Précision (écrans) | Hors Windows | Sous Windows |
|---|---|---|
| Par défaut, Ko 1, Mo 1, Go 2 (codex : progression, chargement, mise à jour ; archives ; aperçu d'export ; export des copies) | 254,7 Mo | 242,9 Mo |
| « environ », Ko 0, Mo 0, Go 1 (fenêtres « Ton codex est prêt », « Téléchargement lancé », échec ; archive) | environ 255 Mo | environ 243 Mo |
| Une décimale (copies, quota, messages d'import, codex data) | 254,7 Mo | 242,9 Mo |
| Entiers (limites, paquet de partage) | 255 Mo | 243 Mo |
| Ko 0, Mo 1, Go 2 (fichiers choisis du codex data, doublons) | 254,7 Mo | 242,9 Mo |

**« environ »** est resté là où il était, et seulement là. `tailleEnviron` est devenu l'option `environ: true`. Les « environ » écrits dans le texte des archives et le « ~ » de l'estimation d'archive ne changent pas.

### Les limites (valeur en octets inchangée ; texte dit par la fonction, en entiers)

| Limite | Valeur | Hors Windows | Sous Windows | Avant |
|---|---|---|---|---|
| ZIP décompressé (`import-export.js`) | 2 × 1024³ | 2 Go | 2 Go | « 2 Go » en dur |
| ZIP importé (`import-export.js`) | 1024³ | 1 Go | 1 Go | « 1024 Mo » |
| JSON importé (deux écrans, `import-export.js`) | 50 × 1024² | **52 Mo** | 50 Mo | « 50 Mo », dont un en dur |
| Codex data (`codex-data.js`, deux messages) | 100 × 1024² | **105 Mo** | 100 Mo | « 100 Mo » |
| Paquet de partage (`partage-import.js`, trois messages) | 10 × 1024² | 10 Mo | 10 Mo | « 10 Mo » en dur |
| Fichier de tampons (`tampons-bibliotheque.js`) | 5 × 1024² | 5 Mo | 5 Mo | « 5 Mo » |
| Entrée d'archive (`reserve-verifier.js`) | 1024³ | 1 Go | 1 Go | « 1 Go » en dur |
| Format ZIP (`fichier-sortant.js`) | 0xFFFFFFFF | 4 Go | 4 Go | « 4 Go » en dur |

Hors Windows, deux limites changent de nombre affiché (52 Mo et 105 Mo). C'est la règle appliquée telle quelle : la valeur réelle n'a pas bougé.

### Les écrans qui passent par la fonction

`codex.js` (13 sites), `fichier-sortant.js`, `reserve.js` et les cinq modules d'archives (`-trimestre`, `-verifier`, `-reglages`, `-renvoyer`, `-copies`), `securite-export-preview.js`, `codex-data-ui.js`, `codex-data.js`, `import-export.js`, `partage-import.js`, `tampons-bibliotheque.js`, `travaux-stockage.js` (quota, statistiques), `travaux-ui.js` (7 sites), `travaux-import.js`, `liste-evaluations.js`, `profil-etudiant-sections-affichage.js`, `travaux-doublons-ui.js`.

Dans `travaux-resolution.js`, le champ `tailleKo` est remplacé par `tailleOctets` : l'écran des doublons le dit par la fonction. Dans `reserve-reglages.js`, `_tailleOuTiret` garde le « — » des tailles inconnues.

### Les sites laissés, et pourquoi (verrouillés par le banc)

| Site | Motif |
|---|---|
| `db.js` (« K car. », seuils, budget) | Des caractères, pas des octets. Hors champ, selon la consigne. |
| `import-export.js`, `tailleKo` (« ~X Ko » de l'aperçu d'import) | Une estimation en caractères × 2 des données, pas la taille d'un fichier. |
| `registre-longitudinal.js`, `poidsOctets` | La longueur d'un JSON, donc des caractères. |
| `trimestres.js`, `tailleMo` | Un outil de console (`listerTrimestresOrphelins`), qu'aucun écran n'affiche. |
| `partage-validation.js` (« X > Y octets ») | Des octets exacts, sans conversion d'unité. |
| `index.html` et l'aide (« 5–30 Mo », « Plusieurs Go ») | Une prose d'ordre de grandeur, pas une mesure. |

Les trois sites de calcul sont mis à l'écart par leur nom de fichier dans le verrou statique, ce qui le rend aveugle à une nouvelle division ajoutée dans ces trois fichiers. Le verrou s'en tient là.

## Source ou stock

Source seulement : des mots et un calcul d'affichage. Rien n'est écrit dans les données de personne. Le champ `tailleKo` des doublons n'est jamais stocké : il est calculé à l'affichage.

## Les bancs (`tests/unit/sentinelle-ton-codex-dit-vrai-993-994-1020.test.js`, 18 essais)

- **#993** :
  - 254 700 000 octets, à chaque précision, sur un Mac et sous Windows ;
  - la détection (userAgentData, agent, iPad, Linux, sans navigateur) ;
  - les sept limites ;
  - l'arrondi qui change d'unité ;
  - un vrai message d'écran (`validerZipSecurite`) sur un Mac et sous Windows ;
  - le verrou statique (aucune division par 1024 hors des sites laissés, et `tailleEnviron` absent).
  - Break-tests :
    - base figée à 1000 : rouge sous Windows ;
    - base figée à 1024 : rouge sur le Mac ;
    - arrondi sans changement d'unité : « 1000 Ko » ;
    - à la main, une ligne `/ 1024` ajoutée à `tampons-bibliotheque.js` : verrou rouge. Le fichier a été restauré par copie, empreinte identique.
- **#994**, par le vrai `codex.js` (fenêtre de choix qui accepte, écriture refusée par une `DOMException`) :
  - mise à jour et codex à part, chacun avec et sans `QuotaExceededError`, mots complets, boutons, témoin.
  - Break-tests :
    - espace supposé d'office : la phrase apparaît sur `NotAllowedError` ;
    - erreur jamais lue : la phrase disparaît sur `QuotaExceededError`, pour la mise à jour et pour le codex à part.
- **#1020** :
  - la fenêtre entière (première phrase, puis la phrase du 15 oct.).
  - Break-test : l'ancienne promesse rendue, l'essai la voit.

Bancs existants ajustés aux nouveaux nombres : 80 × 1024 octets font « 81,9 Ko » (et non plus « 80,0 Ko ») dans `1028`, `e1` et `e3` ; l'archive de banc fait « environ 10 Mo » (et non plus « environ 9 Mo ») dans `A1` ; l'essai « une seule fonction » d'`e3` vise maintenant `TailleFichier` et vérifie que `Reserve.formaterTaille` n'existe plus. Les harnais `chargerScript` et `monterFichierSortant` montent le vrai `taille-fichier.js`, comme l'ordre de chargement d'`index.html`.

## La ligne des Nouvelles (proposée)

> Les tailles de fichier s'affichent comme sur ton appareil : en base 1000 sur Mac et iPad, en base 1024 sous Windows. Quand ton codex ne s'enregistre pas, le message ne suppose plus un manque d'espace : il le nomme seulement si ton appareil le signale. Avant une suppression, la fenêtre du codex à part dit ce que fera sa réouverture.

## BACKLOG

- #994 et #993 sont cochées ; #1020 reste ouverte.
- Les trois lignes de la consigne sont posées telles quelles, chacune sous sa fiche.

## Commit

`69fdd026` (le lot), sur `main`, non poussé. Jetons anti-cache posés dans `index.html` par le garde (#547), au jour du build (20261014).
