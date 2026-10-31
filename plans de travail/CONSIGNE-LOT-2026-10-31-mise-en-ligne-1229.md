# Consigne – Mettre en ligne la 1.229 : la réponse du groupe, les couleurs de l'Aperçu, l'annotation (31 octobre 2026)

> Écrite par Cowork le samedi 31 octobre 2026 à 14 h 06 (Toronto, mesuré par `date`), sur `main` = `06c98ae0` (27 commits d'avance sur `origin/main` = `eb08f1af`). **Au signal de Grégoire, le soir, quand sa journée est finie : le coller est son signal** (cadence du 11 oct.), et vaut validation du texte du § 1, mot pour mot (validé à 14 h 06).
> Relectures, toutes **acceptées** : `VERDICT-RELECTURE-2026-10-30-barres-apercu.md`, `-orange-brule-et-passage-symetrique.md`, `-jaune-signale.md` ; `TEXTES-2026-10-31-reglage-axe-barres.md` ; `VERDICT-RELECTURE-2026-10-31-reponse-du-groupe.md` et `TEXTES-2026-10-31-reponse-du-groupe.md` ; `TEXTES-2026-10-31-note-actuelle-sommative.md` ; `VERDICT-RELECTURE-2026-10-31-palettes-annotation.md` ; `VERDICT-RELECTURE-2026-10-31-copie-demo-bibliotheque.md`.

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`. Les fichiers non commités d'autres lots restent hors des commits : mets-les de côté le temps du verdict s'il le faut, sans les supprimer, puis remets-les.
- **Commit de docs seul d'abord** : ce fichier.
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.

## 1. Les Nouvelles : une entrée, 1.229

Texte validé par Grégoire le 31 oct. à 14 h 06, mot pour mot. Insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. Couleur : la tienne, selon la règle du fichier (une fonction neuve, la réponse du groupe).

- Titre : « La réponse du groupe, et une annotation plus fluide sur l'iPad »
1. « Nouveau et facultatif : dans Labo › Outils d'observation, « Voir ce que mes seuils donnent » montre la répartition de ton groupe. Si tu coches « Afficher la réponse du groupe », une carte de l'Aperçu la met en regard du repère de la RàI. La phrase sur la moyenne du groupe, sous la barre RàI, est retirée. »
2. « Les barres de l'Aperçu passent d'une couleur à l'autre par un dégradé. Pour A et C, tu peux choisir un axe en deux segments, dans Labo › Outils d'observation. »
3. « Sous le seuil, l'orange brûlé remplace le rouge dans les barres, la liste et les pastilles. Le jaune s'en distingue mieux pour les personnes daltoniennes. »
4. « En pratique sommative, le profil et le PDF de l'élève disent « Note actuelle du cours ». Dans toutes les pratiques, la ligne de calcul ne dit plus « Note finale » avant que tes notes soient finalisées. »
5. « Annotation : un tampon se pose du premier toucher, deux doigts déplacent la page et un long bloc de texte s'ouvre en entier. La palette est plus compacte, et ses catégories de tampons se replient. »
6. « Annotation : la touche d'un code est son numéro. Le pointillé et la vague s'appliquent au cercle, au rectangle et au nouveau polygone, jusque dans le PDF de l'élève. Les boutons des palettes passent dans la barre d'outils, l'étiquette de l'élève ouvre son profil, et la fenêtre « Aperçu rétroaction » est retirée. »
7. « En démo, une copie de grille peut te suivre : « Garder dans ma bibliothèque » la ramène dans tes vrais trimestres. »
8. « La note du cours ne change pas. »

Si un mot se révèle faux à la mesure, **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.229.0), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur (vérifie-le), sans veille.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork.

## 4. Après le push

Les gestes à vérifier, à dire à Grégoire tels quels :

1. Sur l'iPad (rechargé jusqu'à 1.229.0) : la porte terrain des palettes d'annotation (`plans de travail/PORTES-TERRAIN-2026-10-31-palettes-annotation.md`) ; vider lui-même les raccourcis X et S.
2. Dans Labo › Outils d'observation : « Voir ce que mes seuils donnent » sur son groupe, avant de décider s'il coche « Afficher la réponse du groupe ».
3. Le PDF d'un·e élève en sommative, s'il en a une : « Note actuelle du cours » et sa ligne de calcul.
