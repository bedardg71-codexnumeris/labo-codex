# Demande de relecture – E1, archiver un trimestre clos entier (#1022)

> Écrite par Claude Code le 4 octobre 2026 à 16 h 50 (Toronto, mesurée par `date`), sur la branche `claude/e1-archiver-trimestre` (`0ac20dba`, partie de `main` à `2838ee8b`). Consigne de Cowork de 16 h 27, points 2 à 6. **Ni push du lot, ni release, ni verdict complet.** Rien n'a été écrit dans les données de Grégoire : tout est mesuré sur des jeux fictifs. Marques : *mesuré* (banc, avec son témoin), *lu* (code), *inféré*.

## Pour Grégoire, en deux lignes

- **L'archive d'un trimestre emporte** tout ce qui porte son nom (ses élèves, ses évaluations, ses copies, y compris celles de la corbeille) et les séances vivantes de ses groupes, chaque pièce avec son empreinte.
- **Elle laisse** tout ce qui est partagé avec les autres trimestres (cours, réglages, profil, registre longitudinal, bibliothèques), pour que son retour (E2) ne puisse rien écraser ailleurs.

## 1 · Ce que l'archive contient, et le témoin

Le geste vit dans la bibliothèque des trimestres, au menu ⋮ d'une carte **close** seulement. La carte en cours et la carte active ne l'offrent pas. La garde est aussi dans la fonction : un trimestre non clos est refusé, sans rien télécharger ni inscrire (*mesuré*, Vitest (e)).

| Ce qui part | D'où (*lu*, `js/reserve-trimestre.js`) | Témoin (*mesuré*) |
|---|---|---|
| Toutes les clés `<trimestre>_*`, **entières** (aucun filtre de groupe ni d'élève) | `db.keys()` filtré par préfixe | Vitest (a) : chaque valeur égale à la source ; le doubleur et les deux groupes présents |
| Les séances vivantes `seancesCompletes_gc_<id>` | les ids de `<trimestre>_groupesCours` | Vitest (a) ; WebKit étape 3 |
| Les fichiers des copies : `fichiersTravaux` **et** `corbeilleFichiers` | le magasin `fichiers`, une copie à la fois | Vitest (a) : 4 fichiers dont la corbeille ; WebKit : 3 dont la corbeille |
| Une empreinte par fichier (`travaux_sha256`), par clé (`cles_sha256`), et celle de `donnees.json` | SHA-256 ; une clé = l'empreinte de `JSON.stringify(valeur)` | Vitest (b) : toutes recalculées par Node, égales |
| Le manifeste : version, trimestre, nom, date, liste des clés, comptes | `meta.json` | Vitest (c) |

**Le banc Vitest** (`tests/unit/sentinelle-e1-archiver-trimestre.test.js`, 20 essais) utilise un trimestre fictif clos, `h2032`, avec deux groupes, trois élèves dont un doubleur, trois copies plus une à la corbeille, et deux séances vivantes. À côté, il pose un trimestre en cours (`a2032`, avec le même doubleur, une copie et une séance), dix clés globales et une clé piège, `h2032x_bruit`. L'archive est relue par JSZip, CRC vérifiés.

**Le banc WebKit** (`tests/integration/e1-archiver-trimestre.spec.js`) fait le vrai trajet, à la largeur d'un iPad en portrait (820 px) : le menu ⋮, la fenêtre, « Archiver », la liste, puis « Vérifier » par le vrai bouton et le vrai sélecteur. L'entrée du menu tient dans l'écran et mesure au moins 32 px de haut ; la page ne déborde pas en largeur. Avant et après le geste, toutes les clés sont relues : **une seule a changé, `_manifesteReserve`**.

**« Vérifier »** (*mesuré*) :
- archive intacte : « Archive vérifiée » ;
- un octet changé dans la copie de la corbeille : « Archive incomplète », « 1 copie altérée » ;
- une note changée dans `donnees.json` : « 1 clé altérée » ;
- une clé glissée dans les données : « 1 clé en trop » ;
- une fiche née après l'archive : « 1 fiche du trimestre sans copie » ;
- une archive sans empreintes de clés : « à refaire ».

**Mutations démontrées rouges sur le disque** (fichier restauré par copie, empreinte identique avant et après) :
- **une clé globale qui entre** (`cours`) : 10 essais rouges ; le premier dit `clé en trop : cours` ;
- **une copie de la corbeille oubliée** : 11 essais rouges ; le premier dit `fichier absent : FT_hc.pdf` ;
- **l'offre retirée du menu** : le banc WebKit rougit à l'étape 1 (`toHaveCount(1)`, reçu 0).

Deux autres témoins vivent dans le banc lui-même : une séance vivante oubliée, et une vérification qui ne compare plus les clés.

**L'archive d'un groupe n'a pas bougé** : le dépôt (étape 4 de `verserGroupeCours`) est sorti dans `_deposerArchive`, que les deux archives partagent. Le banc A1 compare l'archive d'un groupe, octet pour octet, à un rédacteur figé de 1.171.0, et il reste vert. Les sentinelles A2, A3 et #1002 restent vertes elles aussi.

## 2 · Ce qu'elle n'emporte pas, et pourquoi

- **Aucune clé globale dans `donnees.json`** : `cours`, `listeCours`, `enseignants`, `profilEnseignant`, `trimestres`, le registre longitudinal, les bibliothèques, `cartouches_*` et `fichiersModelisation`. Motif : E2 réécrira `donnees.json`. Une seule clé globale suffirait à écraser celle d'un autre trimestre (la mesure du 4 oct., § 3 : la fiche du cours 601-101 sert H2026 et A2026).
- **J'ai tranché « pour mémoire »** : `meta.json` porte une section `pour_memoire`. Elle contient l'entrée du trimestre dans le registre, ainsi que le code et le nom des cours de ses groupes, pour qu'on puisse lire l'archive seule. Elle n'est pas dans `donnees.json`, et E2 devra l'ignorer.
- **Les séances vivantes d'un groupe « ancien régime »** (`listeCours`, sans `<trimestre>_groupesCours`) : rien ne les rattache à un trimestre, elles ne partent pas (*lu*). *Inféré* : aucune chez Grégoire depuis 95.2, non mesuré.
- **Les vignettes des copies** (magasin à part) : elles se refont depuis la copie (*lu*, `genererMiniature*`).

## 3 · La mémoire, mesurée

Le banc : WebKit 26.4 de Playwright, profil persistant jetable, vrai `index.html`. **394 copies réellement rangées dans le magasin `fichiers`** (1 102 Mo, dont 10 à la corbeille ; 390 de 2,6 Mo et 4 de 22 Mo), semées dans un premier navigateur. Puis un navigateur neuf fait le geste en mode fichier. Le pic est relevé par `footprint`, depuis la naissance du processus.

| Processus | Après le démarrage (pic) | Après le geste (pic) |
|---|---|---|
| Page (WebContent) | 161 Mo | **215 Mo** |
| Réseau (Networking) | 28 Mo | 28 Mo |
| GPU | 118 Mo | 118 Mo |

Le ZIP fait 1,16 Go, avec 394 copies trouvées et aucune manquante. **Durée du geste : 5,4 s.** La hausse de 54 Mo est de l'ordre de la plus grosse copie (22 Mo), lue en entier pour son empreinte puis rendue. Sonde jetable, posée sous `tests/` puis retirée dans la même commande.

**Pas mesuré** :
- le disque posé pendant l'assemblage. Le lot A1 l'avait mesuré à 2 Mo pour la même pièce ; ce n'est pas refait ici ;
- l'iPad ;
- le mode dossier (Chrome) en vrai : jugé seulement sur un faux dossier en mémoire (Vitest (f)) ;
- un vrai téléchargement sous Safari.

## 4 · Ce qui reste pour E2, et les points à juger

- **E2 lira** `donnees.json`, les clés seulement, jamais `pour_memoire`. Il refusera une archive dont `cles_sha256` ne concorde pas ; il passe déjà par « Vérifier ».
- **Ré-archiver le même trimestre en mode dossier** écrit dans le même dossier `trimestres/<trimestre>-trimestre/`. Un fichier d'une archive précédente, dont la copie a disparu entre-temps, y resterait, et « Vérifier » le dirait « en trop » (*lu* : même règle que pour un groupe, `_ecrireVersementDirect`). Pour un trimestre clos, les copies ne devraient pas changer (*inféré*). C'est à surveiller pour E3.
- **« Faire revenir »** est caché sur la ligne d'un trimestre. L'action elle-même ne refuse pas une archive de trimestre : elle ne peut être appelée que par le bouton (issue 3, commentée dans le code).
- **Une fiche dont la copie manque déjà** à l'archivage n'arrête pas le geste. Elle est comptée « manquante », et « Vérifier » dit alors l'archive incomplète. C'est la même règle que pour un groupe ; voir #997 pour H2026.

## 5 · Les trois boutons « Exporter les données » (#1006) : un constat qui change la question

*Mesuré* : ces trois boutons sont rendus par `afficherListeTrimestreGestion` dans le conteneur `#listeTrimestreGestion`. **Ce conteneur n'existe pas dans `index.html`** : `grep` ne trouve aucune ligne, et le banc WebKit en compte zéro (étape 0). Ils ne s'affichent donc sur aucun écran. Le seul autre appelant de `exporterTrimestreArchive`, la clôture, a été retiré en 1.182.0.

**Recommandation : retirer** `afficherListeTrimestreGestion`, ses trois boutons et `exporterTrimestreArchive`. L'usager ne verrait aucun changement : c'est du code mort, et E1 fait ce que ce fichier promettait. Le stock ne change pas : les fichiers déjà téléchargés restent illisibles, comme aujourd'hui. Il faudra adapter deux sentinelles (#361 et #622), qui appellent la fonction directement. **La décision revient à Grégoire** (consigne, point 6).

## Les mots, tous provisoires (rangés dans `ReserveTrimestre.MOTS` et `ReserveVerifier.MOTS.trimestre`)

> **Menu ⋮** : « Archiver le trimestre… » (infobulle : « Déposer une copie complète de ce trimestre hors du navigateur »)
>
> **Fenêtre** : « Archiver Hiver 2032 ? » — « L'archive emporte tout le trimestre : 3 étudiants, 2 groupes, 3 copies (dont 1 à la corbeille), environ 188.5 Ko. Rien n'est retiré de l'application : le trimestre reste là, clos. » — boutons « Annuler » / « Archiver »
>
> **Après** : « Trimestre archivé » (dossier) ou « Trimestre archivé : fichier téléchargé » (fichier) ; en cas d'échec, « Trimestre non archivé »
>
> **Refus** : « Seul un trimestre clos peut être archivé. Clos-le d'abord. »
>
> **Liste des archives**, colonne « Cours » : « Trimestre entier »
>
> **Vérifier** : « Les N copies et les K clés de données sont présentes et intactes. » ; « N copies sur M manquent ou ne concordent pas. Archive de nouveau ce trimestre. » ; « n clé(s) absente(s) / altérée(s) », « n clé(s) en trop dans l'archive », « n fiche(s) du trimestre sans copie dans l'archive »

⚠ La taille s'écrit « 188.5 Ko », avec un point : c'est l'usage de l'écran Archives existant (`toFixed`), que je n'ai pas changé.

## Ce que j'ai supposé

- `pour_memoire` dans `meta.json` (tranché, § 2).
- Le nom du dossier, `<trimestre>-trimestre`.
- Une copie manquante n'arrête pas le geste.
- Le geste est offert dans la bibliothèque des trimestres (la modale), pas dans la liste morte.

## Trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| Les trois boutons « Exporter les données » ne sont montés sur aucun écran (*mesuré*) | **Inscrire** : ajouté à #1006, avec la recommandation (§ 5) |
| Ré-archiver en mode dossier laisse les fichiers d'une archive précédente (*lu*) | **Inscrire et continuer** : à reprendre avec E3 (§ 4) ; non vécu |
| « Faire revenir » n'a pas de garde contre une archive de trimestre dans l'action (*lu*) | **Commenter** : bouton caché, aucun autre appelant |

## Méthode

- **Vitest complet** depuis `tests/` : 678 fichiers, 8 094 essais verts, aucune ligne « Errors » ni « Unhandled ».
- **WebKit ciblé** : 23 essais verts en 3,2 min (E1, A2, A3, lot F, #637, #1007, #622). La suite complète n'a pas été lancée.
- **Sécurité** : aucun `console.log`, aucun `innerHTML` neuf, aucun gestionnaire inline ; le libellé de la liste passe par `echapperHtml`.
- **Format** documenté dans `docs/architecture/SPEC-RESERVE-V1.md`, § 15.
