# Demande de relecture – préparer la clôture de l'hiver 2026 et l'archivage de ses copies

> Claude Code, 14 octobre 2026, 10 h 57 (mesuré par `date`). Consigne de Cowork de 10 h 41 ; décision de Grégoire de 10 h 39.
> Sur `main`, au-dessus du lot « À propos » (`92f63708`). **Non poussé, pas de release, pas de verdict Playwright.** Aucun geste sur les données de Grégoire : la mesure du § 1 lit un codex sur disque, rien d'autre.

## 1 · Mesure, en lecture seule : ce que pèsent les copies

**Source** : son dernier codex sur disque, du 8 oct. 21 h 08 (iCloud › Téléchargements, 1,36 Go, écrit par « Mac — Chrome », version 1.192.0). J'ai seulement lu la table des entrées du ZIP et `donnees.json` en mémoire, par un script Python. Le fichier n'a été ni copié ni ouvert dans l'application. Aucun nom n'est imprimé : les sommes sont faites par trimestre.

| Trimestre | Liste | Copies | Poids (décompressé) |
|---|---|--:|--:|
| h2026 | copies | 394 | **1 100,8 Mo** |
| a2026 | copies | 106 | 204,7 Mo |
| a2026 | corbeille | 10 | 46,5 Mo |
| | `donnees.json` | | 26,2 Mo |
| **Total** | | 510 | **1 378,1 Mo** |

**Où vivent ces copies.** Dans le navigateur (magasin IndexedDB `fichiers`), et le codex les emporte toutes : il récupère chaque fichier par `travauxStockage.recupererBlob`. Une copie aux archives (#1028) n'a plus de fichier dans le navigateur : elle sort du codex, sans compter comme « manquante » (`_creerCompteDesCopies` l'ignore), ce que le banc confirme. Le dossier des archives sur disque n'entre pas dans le codex. **L'archivage des copies allège donc le codex de ces 1 101 Mo**, et l'espace du navigateur d'autant.

**Marge.**
- Borne : `TAILLE_MAX_DECOMPRESSEE` = 2 Gio = 2 147 Mo (`js/import-export.js` l. 22).
- Après le geste : ≈ 277 Mo, plus les dépôts faits depuis le 8 oct. ; marge ≈ 1 870 Mo.
- Sans le geste : marge ≈ 769 Mo.
- **Rythme** : 1 234 Mo le 24 sept. → 1 361 Mo le 8 oct., soit ≈ 64 Mo par semaine. Il repose sur **sept codex sur deux semaines**, mais en paliers : rien n'a bougé du 3 au 8 oct. (510 copies dans les deux).
- **Extrapolation** : ≈ 12 semaines de marge sans le geste, plus de six mois avec. Ce chiffre corrige celui de #992 (« début à mi-novembre », sur deux points) : le rythme mesuré sur sept points est plus lent.

## 2 · Le chemin complet, au banc

`tests/integration/clore-et-alleger-un-trimestre.spec.js` (neuf, WebKit, largeur iPad, noms fictifs). Il passe par les vrais menus et les vraies fenêtres pour « Clore », « Archiver les copies… » et « Rouvrir ». Il appelle directement E1 (`ReserveTrimestre.archiverTrimestre`) et le bouton « Vérifier » de la ligne de l'archive, avec le même montage que la spec #1028.

| Étape | Ce qui s'écrit | Refus (et pourquoi) | Ce que l'écran dit |
|---|---|---|---|
| Codex de départ | — | — | 4 copies emportées |
| **Clore** | `trimestres` (`archive`, `dateFin` = jour, `statistiquesFinales`, `snapshotRessources`) et `snapshot_<id>_<horodatage>`, **rien d'autre** (relevé par différence de toutes les clés) | trimestre actif (« Impossible de clore le trimestre actif. Change de trimestre d'abord. ») ; déjà clos ; `creerSnapshotRessources` → cartouches non migrées (2ᵉ essai du banc : refus dit, **aucune clé changée**) | fenêtre « Clore le trimestre "…" ? », puis « Trimestre "…" clos. » ; la bibliothèque se redessine |
| **Archiver le trimestre** (E1) | l'archive (dossier ou ZIP) ; une entrée de `_manifesteReserve` | pas clos ; copies aux archives ; aucune donnée | « Trimestre archivé… » |
| **Vérifier** | `verification` dans l'entrée du manifeste | — | « Archive vérifiée » / « Les 3 copies et les données du trimestre sont présentes et intactes. » |
| **Archiver les copies** | `_copiesAuxArchives[<id>]` ; fichiers et vignettes retirés ; les listes `<id>_fichiersTravaux` intactes | `refusImmediat` : pas clos, actif, sans archive, archive non vérifiée, changée depuis | fenêtre et bilan (« 3 copies retirées. Ton prochain codex sera plus léger d'environ 188,5 Ko. ») |
| **Codex mis à jour** | — | — | 1 copie, **aucun avertissement** ; 204 300 → 12 132 octets |
| **Rouvrir** (Annuler d'abord : rien ne bouge) | `trimestres` (`archive=false`, `dateFin` retiré) ; la marque et l'absence des fichiers restent | « Trimestre non clos » | fenêtre « Rouvrir le trimestre "…" ? », puis « … rouvert. » |
| **Clore de nouveau** | comme la première fois, et un **second** `snapshot_` | — | « … clos. » ; codex toujours à 1 copie |

**`trimestre.dateFin`** : aucun écran ni calcul ne le lit comme fin du trimestre. Les lecteurs de `.dateFin` lisent `cadreCalendrier.dateFin` (`trimestres.js` ~l. 2177), des instantanés hebdomadaires (`snapshots.js`, `graphiques-progression.js`) ou des variables locales. Le champ du registre n'est que recopié dans `pour_memoire` par E1, puis réinscrit par « Emprunter », sans y être lu. Cowork avait raison.

**Ce qui pourrait empêcher la clôture chez lui**, lu au code et mesuré sur le codex du 8 oct. :
- **Actif** : h2026 ne l'est pas (actif : a2026).
- **Déjà clos** : non.
- **Cartouches non migrées** : 0 des 6 grilles de h2026 dans ce cas. Drapeau de migration posé ; 6 clés nues `cartouches_*`, dont 1 non vide, mais aucune n'appartient à une grille de h2026.
- **Limite trouvée** : le message de ce refus dit « Recharge l'application » ; or, le drapeau posé, recharger ne relance plus la migration. Issue **3** : commentaire au point du message (`js/trimestres.js`), sans effet chez lui aujourd'hui. La porte dit à Grégoire de s'arrêter là s'il voit ce refus.

## 3 · Ce qui est corrigé sans lui

**« Clore » et « Rouvrir »** (`js/trimestre-v2-liste.js`) passent par `uiDialogues.confirmerAction` et `notifications`, **avec les mots d'avant, sans retouche** (titres, messages, « Trimestre non trouvé », « Erreur: … »). Le fichier n'a plus aucun `alert`, `confirm` ni `prompt`.

**Ce que j'ai décidé, à corriger au besoin :**
1. **« Rouvrir » passe de nouveau par sa confirmation.** Mesuré : le bouton de la carte close menait à `desarchiverTrimestre` directement. Il rouvrait sans rien demander, sans rien dire, et la carte restait « Clos » jusqu'à la réouverture de la bibliothèque ; `confirmerDesarchivage` n'avait aucun appelant. Cowork croyait « Rouvrir » sur `confirm()`. Je l'ai rebranché plutôt que de retirer sa confirmation comme du code mort. **C'est une fenêtre de plus sur le chemin de Grégoire : à trancher si tu préfères l'inverse.**
2. **Le bouton de chaque fenêtre porte le nom du geste du menu** (« Clore », « Rouvrir ») au lieu de « Confirmer », comme « Supprimer… ». Ce sont des mots déjà à l'écran.
3. **La bibliothèque se redessine après le geste** (même code que « Supprimer… », extrait dans `rafraichirBibliothequeTrimestres`).
4. **`archiverTrimestreActif` est retiré** : aucun appelant dans `js/` ni `index.html`, et son seul geste (clore l'actif) est toujours refusé (#1018).
5. Un refus de « Clore » pour cartouches non migrées s'affiche **deux fois** : une par `archiverTrimestre`, une par `confirmerArchivage`. Avant, c'était une notification et une boîte grise. Issue **3**, laissé tel quel ; le banc l'épingle.

**La copie de sauvegarde que rien ne relit (#622)** : le `snapshot_<id>_<horodatage>`. Remesuré : aucun lecteur. Chaque « Clore » en pose une de plus, et « Rouvrir » la laisse. Le stock actuel chez Grégoire est de 0 clé ; la clôture de l'hiver 2026 en posera une d'au plus 768 Ko. Issue **3** : commentaire au point d'écriture. Je ne la retire pas, parce que le refus des cartouches vit dans la même fonction et que Grégoire s'en sert ce soir.

## 4 · Tests

**Vitest complet** depuis `tests/` : 751 fichiers, **8 765 verts, 1 rouge attendu**. C'est l'anti-cache (`?v=20261014a` sur un build 1012) : il tombera à la release, comme au lot « À propos ». Les jetons de `trimestre-v2-liste.js` et `trimestres.js` sont changés, et aucun n'avait servi.

**Playwright, ciblé** (pas de verdict complet) : `clore-et-alleger-un-trimestre`, `1028-archiver-copies` (« Rouvrir » passe par sa fenêtre), `trimestres-1018-clore-pas-sur-l-actif`, `cartouches-namespacees-par-trimestre-623` : **13 verts**.

**Break-tests**, avec empreintes restaurées :

| Mutation dans `js/trimestre-v2-liste.js` | Vitest `sentinelle-1037` | Banc Playwright |
|---|---|---|
| M1 « Rouvrir » remis sur `desarchiverTrimestre` | 1 rouge | rouge |
| M2 un mot de « Clore » changé | 1 rouge | — |
| M3 « Clore » ne redessine plus | 1 rouge | — |
| M4 refus de « Rouvrir » remis en `alert` | 2 rouges | — |
| M5 bouton sans nom | 1 rouge | — |
| M6 « Rouvrir » rouvre même annulé | 1 rouge | rouge (après ajout de l'« Annuler » au banc ; vert avant, ce que je note) |

Les tests ajustés à l'ancien comportement sont `sentinelle-1002-mots-clos` (épingle de « Rouvrir », refus par notification), `sentinelle-678` (plus d'`alert` dans ce fichier), `refactor-trimestre-v2` (l'export retiré) et la spec 1028.

## 5 · Livrable pour Grégoire

`plans de travail/PORTE-2026-10-14-clore-et-alleger-l-hiver-2026.md`. Elle se passe sur le Mac, dans Chrome, **après la mise en ligne du soir**. Les cinq gestes sur ses données sont dans l'ordre, chacun avec ce qu'il doit voir et ce qui l'arrête. **Cowork publie l'artefact jumeau.**

## 6 · Ligne de changelog proposée (les mots reviennent à Grégoire)

> **Clore et rouvrir un trimestre passent par les fenêtres de l'application.** Les mêmes mots qu'avant ; « Rouvrir » demande maintenant confirmation, et la bibliothèque se met à jour aussitôt.

## 7 · Ce qui monte, et ce que je n'ai pas fait

- **BACKLOG** : aucune fiche neuve, puisque les trois trouvailles relèvent de l'issue 3. Pour #622, ligne due après la porte de Grégoire, à poser par qui en a le droit : « moratoire levé pour h2026 le 14 oct. 2026 (décision de Grégoire) ; Clore/Rouvrir sous fenêtres de l'application (lot du 14 oct.) ; snapshot sans lecteur, laissé (issue 3) ».
- **Source ou stock** : source seulement. Aucune donnée déjà écrite n'est réécrite.
- Le dossier `plans de travail/observation/` n'est pas touché.
