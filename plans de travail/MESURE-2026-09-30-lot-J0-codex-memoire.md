# Mesure – lot J0 : ce que coûte la fabrication du fichier du codex, en mémoire et en disque (#988)

> Mesuré le 30 septembre 2026, entre 5 h 35 et 6 h 15 (Toronto), par Claude Code. Répond au § 2.1 de la consigne du jour et au complément de Cowork de 5 h 33 (mémoire ET disque). Chaque chiffre vient d'une exécution de la session ; ce qui est inféré est marqué.

## En bref

| À la taille du codex réel (1,3 Go de copies) | Avant (1.170.0) | Après (lot J0) |
|---|---|---|
| Pic de mémoire de la page | **6,5 Go** | **0,3 Go** |
| Pic de mémoire du processus réseau de WebKit | 2,5 Go | 0,05 Go |
| Écrit sur le disque avant toute écriture du fichier | **1,25 Go** (fichier temporaire) | **rien** |
| Durée de la préparation | 47 s | 7 s |
| Taille du fichier | 1 306,9 Mo (banc) | 1 306,5 Mo (banc) ; **+ 3,3 % attendu sur le codex réel** |

Avant, le pic de la page vaut environ 5,1 fois la taille des copies. Après, il ne dépend plus de la taille (mesuré jusqu'à 3,9 Go de copies).

## 1 · L'instrument

- **Mémoire** : `/usr/bin/footprint` de macOS, qui lit pour un processus le registre du noyau : `phys_footprint` et `phys_footprint_peak` (le maximum depuis la naissance du processus). C'est le compteur que le système d'iPadOS juge quand il tue un onglet. `performance.memory` n'existe pas sous WebKit (vérifié : `undefined`).
- **Un navigateur neuf par mesure** : le pic « de la naissance à la mort » ne couvre que le geste mesuré. Quatre processus relevés (page, réseau, interface, GPU) ; l'interface (25 Mo) et le GPU (130 Mo) ne bougent pas et sont omis des tableaux.
- **Disque** : l'occupation du volume par `df` (il voit aussi un fichier ouvert puis délié), `du` sur le profil du navigateur et sur le dossier temporaire de l'utilisateur, et `lsof` pour nommer les fichiers de plus de 50 Mo ouverts par WebKit. Bruit de `df` relevé à vide : jusqu'à 20 Mo.
- **Le banc** : WebKit 26.4 de Playwright (build 2287), sans interface, sur le Mac de Grégoire (16 Go, macOS 27), le vrai `index.html`, le vrai `Codex.generer`. Profil persistant (un profil éphémère refuse les Blobs en IndexedDB). 500 copies fictives en IndexedDB, **aux tailles réelles** des copies du codex du 29 sept. (octets aléatoires, donc incompressibles), plus 26 clés de remplissage pour un `donnees.json` de 20 Mo.
- Scripts jetables, non versés (posés sous `tests/` le temps de l'exécution, puis retirés).

## 2 · Ce que contient le 1,33 Go

Lu dans le répertoire central du fichier réel du 29 sept. à 14 h 19 (`unzip -lv`, lecture seule, tailles et extensions seulement, aucun nom relevé) : 1 272 513 946 octets sur le disque.

| Type | Entrées | Brut (octets) | Compressé (octets) | Gain de DEFLATE |
|---|---|---|---|---|
| PDF | 368 | 1 262 381 738 | 1 220 043 495 | 3,4 % |
| JPEG (`.jpeg`, `.jpg`) | 123 | 40 121 622 | 40 042 325 | 0,2 % |
| HEIC | 8 | 2 634 900 | 2 631 944 | 0,1 % |
| PNG | 1 | 335 117 | 334 996 | 0,0 % |
| `donnees.json` | 1 | 26 317 805 | 9 368 694 | 64,4 % |
| Manifeste | 1 | 45 983 | 12 058 | 73,8 % |
| **Total** (503 entrées, dossier compris) | | **1 331 837 165** | **1 272 433 512** | 4,5 % |

Les 500 copies font **98,0 %** du codex. Les compresser ne rapportait que 42,4 Mo (3,25 %). Plus grosse copie : 23,6 Mo ; médiane : 1,35 Mo. Le brut (1 331 837 165) recoupe la « taille estimée » du rapport de l'iPad du 30 sept. (1 331 788 225).

## 3 · Avant : le code de 1.170.0 (`0502e0f8`)

| Copies | Pic de la page | Pic du réseau | Durée |
|---|---|---|---|
| 0 Mo | 307 Mo | 49 Mo | 1 s |
| 191 Mo (100 copies) | 1 131 Mo | 394 Mo | 8 s |
| 508 Mo (250 copies) | 2 723 Mo | 1 029 Mo | 20 s |
| 1 245 Mo (500 copies) | 6 568 Mo, puis 6 454 Mo (deux passes) | 2 506 Mo | 47 s |

La page au repos, avant le geste : 157 Mo. Le pic croît d'environ 5,1 Mo par Mo de copies (191 Mo : 5,1 ; 508 Mo : 5,05 ; 1 245 Mo : 5,15).

**Disque, à 1 245 Mo** : pendant la compression, + 489 Mo au plus ; à la fin, **+ 1 256 Mo**. `lsof` nomme le fichier : `…/T/com.apple.WebKit.Networking+org.webkit.Playwright/BlobRegistryFiles-…/mapping-file-2.blob`, 1 246 Mo, ouvert par le processus réseau. **WebKit pose donc le Blob de sortie entier dans un fichier temporaire, dès sa création, avant que l'application n'écrive quoi que ce soit.**

Sur le Mac, la page ne meurt pas (aucun plafond par onglet, 16 Go).

## 4 · Les pistes, à 1 245 Mo de copies

| Piste | Pic de la page | Pic du réseau | Disque avant écriture | Durée | Verdict |
|---|---|---|---|---|---|
| Actuel (tout à JSZip, DEFLATE) | 6 568 Mo | 2 506 Mo | + 1 256 Mo | 47 s | |
| A · `STORE` pour les copies, le reste inchangé | 5 258 Mo | 2 507 Mo | + 1 246 Mo | 6 s | ne part pas : gagne du temps, pas de mémoire |
| B · `generateInternalStream`, Blob par morceaux de 8 Mo | 1 641 à 1 762 Mo | 41 à 251 Mo | + 1 248 Mo | 44 s | ne part pas seule |
| A + B | 1 501 à 1 564 Mo | 63 à 219 Mo | + 1 248 Mo | 4 s | insuffisant : le plancher est la taille des copies |
| **C · les copies rangées par référence (retenue)** | **256 à 307 Mo** | **49 Mo** | **+ 3 Mo (bruit)** | **7 s** | **part** |

Pourquoi A + B plafonne : JSZip lit chaque copie en mémoire dès qu'on la lui dépose, et garde toutes les copies jusqu'à la fin (lu dans JSZip 3.10.1, `prepareContent` ; confirmé par la mesure : le plancher vaut la taille des copies). « Relâcher les références aux sources », troisième piste de la consigne, n'est pas faisable à travers JSZip : la seule façon est de ne plus lui confier les copies. C'est la piste C.

**Chaque piste qui passe par JSZip pose aussi une fois le codex sur le disque** (fichier temporaire du processus réseau) ; seule C n'y pose rien.

## 5 · Après : le lot J0

Le fichier est assemblé ainsi : JSZip compresse les textes (données, manifeste) ; chaque copie est lue une fois par tranches de 4 Mo pour son CRC, chaque tranche rendue aussitôt ; le Blob final **référence** les copies du stockage, il ne les recopie pas.

| Copies | Pic de la page | Pic du réseau | Disque avant écriture | Durée |
|---|---|---|---|---|
| 0 Mo | 320 Mo | 49 Mo | bruit | 1 s |
| 191 Mo | 310 Mo | 49 Mo | 0 à 2 Mo | 2 s |
| 508 Mo | 255 Mo | 49 Mo | 2 à 4 Mo | 4 s |
| 1 245 Mo | 306 Mo, 256 Mo, 307 Mo (trois passes) | 49 Mo | 3 Mo | 7 s |
| 2 490 Mo (copies relistées deux fois) | 256 Mo | 50 Mo | | 12 s |
| 3 926 Mo | 296 Mo | 50 Mo | | 19 s |

Le pic est celui du cas sans copie : ce sont les textes (lecture des clés, JSON, DEFLATE) qui le font.

**Un état intermédiaire écarté par la mesure.** Sans rendre chaque tranche aussitôt lue (`ArrayBuffer.transfer(0)`), les tranches s'empilaient en attendant le ramasse-miettes : 559 à 784 Mo à 1 245 Mo de copies, 1 374 Mo à 2 490 Mo, 2 441 Mo à 3 926 Mo. Avec le rendu immédiat : les chiffres du tableau. ⚠ `transfer` existe depuis Safari 17.4 ; sur un Safari plus ancien, le repli est cet état intermédiaire (toujours quatre à dix fois sous l'avant).

**L'écriture par téléchargement** (stratégie 3 de l'application, la seule que le banc sache faire) : après le téléchargement du fichier de 1,3 Go, le pic de la page reste à 256 Mo et celui du réseau à 49 Mo. Le disque prend le fichier lui-même, rien de plus côté WebKit (avant le lot : le fichier, plus le temporaire de 1,25 Go).

## 6 · Le fichier produit

- **À taille réelle** : le fichier de 1 306 505 056 octets écrit par le banc passe `unzip -tq` (Info-ZIP vérifie les CRC des 503 entrées) : « No errors detected ».
- **Épreuve croisée dans WebKit, sur les deux applications** (l'arbre du lot et un worktree de `0502e0f8`, 40 copies fictives à en-têtes valides, 124 Mo) : le fichier du lot ouvert dans 1.170.0, le fichier de 1.170.0 ouvert dans le lot, et les deux témoins ; **quatre empreintes identiques à la source** (données `b6c6eeed…`, copies `7c5ec519…`, 40 copies sur 40, bilan « incomplet : false »). Fichier du lot : 41 entrées rangées, 2 compressées ; fichier de 1.170.0 : 1 rangée, 42 compressées.
- **Taille** : au banc (octets aléatoires), le fichier du lot est plus petit de 0,4 Mo. Sur le codex réel, les PDF se compressaient de 3,4 % : le fichier passera d'environ 1 272 Mo à environ 1 315 Mo (+ 42,4 Mo, calculé sur le répertoire central réel, non mesuré sur l'iPad).

## 7 · Mémoire ou disque : ce qui est départagé, ce qui ne l'est pas

**Établi sur le Mac.** À l'étape « compression », le code de 1.170.0 fait les deux à la fois : 6,5 Go de mémoire dans la page, et 1,25 Go écrit sur le disque au moment où la compression finit. Les deux hypothèses désignent la même étape ; le rapport de l'iPad (« étape atteinte : compression, 0 essai d'écriture ») ne les sépare pas.

**Pour la mémoire** (inférence) : 6,5 Go dépassent vraisemblablement ce qu'un iPad donne à un onglet (le modèle de l'iPad de Grégoire et sa mémoire vive ne sont pas relevés). Contre : la mise à jour du 29 sept. à 15 h 03 a réussi à taille presque égale, ce que ce chiffre n'explique pas.

**Pour le disque** (inférence) : environ 3 Go libres le 30 sept. ; la fabrication en prenait 1,25 Go avant toute écriture, et la réussite du 29 avait elle-même posé un fichier de 1,27 Go de plus sur l'appareil.

**Non départagé.** L'essai qui aurait tranché (poser le dossier temporaire du processus réseau sur un volume de 400 Mo et regarder si la page meurt) n'a pas pu se faire : le bac à sable de la session refuse de déplacer ce dossier, et WebKit ignore `TMPDIR`. Je n'ai pas contourné ce refus.

**Ce que le lot réduit** : les deux, à l'étape de la fabrication (mémoire : 6,5 Go → 0,3 Go ; disque : 1,25 Go → rien).
**Ce que le lot ne change pas** : l'étape du partage vers Fichiers. Non mesurable au banc. Inférence : la feuille de partage a besoin du fichier au moins une fois en espace libre (1,3 Go), et peut-être d'une copie de passage en plus ; la mémoire qu'elle prend est inconnue. Si la porte échoue, la trace du lot G dira « étape : enregistrement du fichier », ce qui désignera le partage, et « Télécharger à la place » reste offert (mesuré : ni mémoire ni disque en plus du fichier).

**Aucune sonde à faire tourner sur l'iPad n'est proposée** : la porte terrain et la section « DERNIÈRE MISE À JOUR DU CODEX » du rapport de bug suffisent, et ne touchent à aucune donnée.

## 8 · Les vignettes et la clé « trimestres » en cache mémoire (complément de 5 h 49)

Console de l'iPad : environ 190 vignettes de 4 à 25 Ko et la clé `trimestres` (559 octets) basculent en cache mémoire. Borne haute : 190 × 25 000 caractères = 4,75 millions de caractères, soit au plus 9,5 Mo en mémoire (deux octets par caractère). C'est 0,15 % du pic d'avant (6,5 Go) et 3 % du pic d'après (0,3 Go). Ces vignettes voyagent aussi dans `donnees.json` (26,3 Mo au codex réel), que le banc représente par 20 Mo de remplissage : elles sont donc déjà dans les chiffres. **Négligeable pour la cause ; non négligeable pour rien d'autre dans ce lot.**

## 9 · Limites de cette mesure

- Le Mac n'est pas l'iPad : WebKit 26.4 contre Safari 27, 16 Go contre un plafond par onglet inconnu. Les ordres de grandeur se transportent ; les seuils, non.
- Octets aléatoires, pas de vrais PDF : la mémoire de DEFLATE sur de vrais PDF peut différer un peu (avant le lot seulement ; après, les copies ne sont plus compressées).
- La page du banc pèse 157 Mo au repos ; celle de Grégoire, avec ses données, pèse davantage (non mesuré).
- Le partage de l'iPad n'est pas mesuré (§ 7).
