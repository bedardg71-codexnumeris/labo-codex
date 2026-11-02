# Consigne – Les tampons par défaut reviennent, et la bibliothèque perd les images SVG (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 19 h 35 (Toronto, mesuré par `date`), sur `main` = `a29bd19f`.
> **Retour de Grégoire, 19 h 32** (priorité absolue, avant la mise en ligne du soir) : « J'ai créé de nouveaux tampons. Et je voudrais les transférer dans la bibliothèque avec les formats SVG que j'ai téléchargés. Mais on dirait qu'ils ne s'enregistrent pas. On dirait que les tampons par défaut ont préséance sur ceux que je viens de personnaliser. »
> **`CONSIGNE-LOT-2026-11-01-mise-en-ligne-1230.md` attend ce lot** : ne la lance pas ici.
> Ni Cowork ni toi ne lisez ses données réelles. Tout se reproduit au banc, noms fictifs.

## 0. Avant tout

- Commit de docs seul : cette consigne.
- Inscris une fiche au BACKLOG (symptôme vécu) ; son numéro va au rapport.

## 0 bis. Ce que montrent ses captures (ajout de Cowork, 19 h 50) — à reproduire avant tout correctif

Trois captures, **sur l'iPad, dans Safari, sur `app.codexnumeris.org`** (donc la 1.229.0 en ligne), 19 h 41 à 19 h 44. Ses données de travail sont donc dans le Safari de l'iPad.

- **La fenêtre de personnalisation des tampons** (19 h 41) : `obs-hoc`, `obs-mecanisme`, `obs-procede` s'y nomment « HOC », « Mécanisme », « Procédé ».
- **La bibliothèque, colonne « Dans ta palette »** (19 h 42) : les mêmes noms, « Intégré », sans image visible. **Ses tampons créés n'apparaissent dans aucune des deux colonnes** (ses mots, 19 h 44 : « Il semblerait que je ne puisse pas enregistrer mes tampons »).
- **La palette d'Annoter** : les noms **par défaut** (« Id. directrice », « Id. principale », « Id. secondaire »), alors que ses tampons créés y sont, **avec** leur image SVG : « À réviser » et « Cible » en fin d'Observations, et une catégorie à lui, « Rendu » (Incomplet, Incertain, Inexact).

La palette et la fenêtre ne disent donc pas la même chose, et des tampons visibles dans la palette manquent à la bibliothèque. **Mesure d'abord tout le cycle**, WebKit à 1180 × 820, avec une personnalisation à son image : trois tampons intégrés renommés, une catégorie à soi avec trois tampons, deux tampons créés dans Observations avec une image SVG (l'une avec `width`/`height`, l'autre avec seulement un `viewBox`), des images de taille réelle. Enregistrer, puis lire la palette, puis les deux colonnes de la bibliothèque, puis **recharger**, puis relire la palette et la fenêtre. Pour chaque élément perdu ou revenu au défaut : à quelle étape, dans quelle clé (`tamponsPersonnalises`, `personnalisationObservations`, `elementsMasques`, `categoriesMasquees`), et où elle vit (localStorage ou IndexedDB, taille). Le tableau va en tête du rapport.

Pistes lues par Cowork, aucune prouvée :
1. le nettoyage des masques à chaque chargement (§ 1) ;
2. la fenêtre ne rend pas les catégories masquées (`catsMasquees`), et l'enregistrement ne recueille que les rangées rendues : ses tampons créés dans une catégorie masquée sortiraient de `tamponsPersonnalises` à chaque enregistrement ;
3. une `personnalisationObservations` lourde (images en base64) vivrait dans IndexedDB et serait lue par `appliquerPersonnalisations` au chargement du module, avant que la base soit prête : les noms reviendraient au défaut jusqu'au prochain enregistrement ;
4. la colonne « Dans ta palette » lit `AUTOCOLLANTS` : cherche pourquoi des tampons de la palette n'y sont pas.

Corrige ce qui se reproduit, à la source. **Rien n'écrit dans ses données** ; le rapport dit ce qu'il devra refaire, s'il y a lieu.

## 1. La cause probable, lue par Cowork dans le code (pas reproduite)

`js/travaux-outils.js`, vers 886-898 : une « migration » du 18 mars (`a3ade786`) remet `elementsMasques` à `null` **à chaque chargement**, dès que `tamponsPersonnalises` n'est pas vide et que plus de 10 éléments sont masqués. Le commentaire dit « Nettoyer une fois », mais aucun drapeau ne l'arrête. Il y a 38 éléments intégrés (35 tampons, 3 symboles) : un·e enseignant·e qui crée ses tampons et retire plus de 10 tampons par défaut les voit tous revenir au rechargement suivant.

- **Mesure d'abord** (WebKit et Chromium) : un tampon créé, 11 tampons intégrés retirés dans la fenêtre de personnalisation, enregistrer, recharger. Attendu aujourd'hui : les 11 reviennent. Écris le résultat au rapport, avant toute correction.
- **Correctif** : retirer ce bloc. Le défaut qu'il nettoyait (le drapeau `_aDesCustoms`) n'existe plus depuis `a3ade786`. Audite les autres écrivains de `elementsMasques` (`grep`) : aucun autre ne doit l'effacer hors d'un geste de l'usager (« Réinitialiser », import d'une personnalisation).
- **Source ou stock** : la source se tarit. Le stock est perdu : les masques effacés à son dernier chargement ne se retrouvent pas. Grégoire retirera ses tampons par défaut une fois de plus, après la mise en ligne ; Cowork le lui dira. Rien n'écrit dans ses données.

## 2. La bibliothèque et les images SVG

Son geste : « Garder dans ma bibliothèque » pour des tampons dont l'image est un SVG téléchargé. `partagerTampon` capture l'image par `_capturerImageBase64`, qui exige `naturalWidth > 0`. *Hypothèse de Cowork* : un SVG sans `width` ni `height` (seulement un `viewBox`, fréquent dans les téléchargements) donne 0 ; la capture rend `''`. Mesure trois cas, en Chromium (son Chrome) et en WebKit :

- **a.** Un tampon créé, image SVG avec `width`/`height`, puis sans (seulement `viewBox`) : après « Garder → », l'entrée de la bibliothèque a-t-elle son `imageBase64`, et l'aperçu la montre-t-il ?
- **b.** Un tampon intégré dont l'image a été remplacée par un SVG : même question. Si la capture échoue, l'aperçu retombe sur `fichier`, l'image par défaut : c'est peut-être ce qu'il appelle la préséance.
- **c.** Un tampon intégré gardé dans la bibliothèque **avant** d'être personnalisé : la rangée dit « Aussi dans ta bibliothèque » et n'offre rien ; la bibliothèque garde l'ancienne image. Mesure et décris ; **ne construis pas** de chemin de mise à jour : c'est un choix d'interface, Cowork le proposera à Grégoire.

**Correctif de a et b, s'ils se reproduisent** : la capture garde l'image, et **reste une PNG** passée par le canevas (`SCHEMAS_IMPORT.tampon` et la Défense O l'exigent : une bibliothèque s'exporte et se partage, un SVG y porterait du balisage). Sans dimensions propres, dessine à une taille de repli tirée du `viewBox`, ou carrée. Attends le chargement de l'image plutôt que d'exiger `complete`.

`#1166` (« ← Utiliser dans ma palette » perd l'image) est voisin : hors de son geste, il reste inscrit, sauf si ta mesure le trouve sur le chemin de a ou b.

## 3. Les tests

- Playwright WebKit **et** Chromium : les masques survivent au rechargement (11, puis 20) ; a et b, avec un SVG sans dimensions. Vitest pour la capture si elle se teste seule.
- Contre-épreuves (skill `verification-adverse`), dont : remettre le bloc retiré, l'essai des masques rougit.
- Règle 5 de sécurité si tu touches au chemin d'import.

## 4. Fin

Commit, Vitest entier, specs touchées. **Pas de release ni de verdict** : ils partent avec la mise en ligne de ce soir. Rapport `RAPPORT-2026-11-01-tampons-masques-et-bibliotheque.md` à Cowork, avec les mesures d'avant correction, le cas c décrit, et ce que Grégoire devra refaire une fois.
