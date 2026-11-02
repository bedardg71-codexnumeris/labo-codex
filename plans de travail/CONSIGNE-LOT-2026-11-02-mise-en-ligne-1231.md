# Consigne – Mettre en ligne la 1.231.0 : les palettes, une même famille (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 14 h 52 (Toronto, mesuré par `date`), sur `main` = `80165d33`. **Le coller est le signal de Grégoire** (« on fait la release maintenant », 14 h 50). Le texte du § 1 est **validé par Grégoire à 14 h 51**, mot pour mot.
> Relectures acceptées : `VERDICT-RELECTURE-2026-11-02-palettes-une-famille.md` (Cowork, 14 h 50) ; le lot de la Rétroaction plus large (`RAPPORT-2026-11-02-retroaction-plus-large.md`), accepté par Cowork à 11 h 45.

## 0. Avant tout

- Aucune autre session ne tourne. Commit de docs seul : ce fichier et le verdict de relecture.
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.
- **Ne fusionne pas** `origin/lot/pauses-apres-ouverture` dans cette mise en ligne : elle se fusionne après, à part (décision de Cowork : le verdict de ce soir juge les essais tels qu'ils sont).

## 1. Les Nouvelles : une entrée 1.231

Nouvelle entrée en tête de `js/changelog-data.js`, `version: '1.231'`, `couleur: 'vert'`, mot pour mot (insécables en `&nbsp;`, apostrophes typographiques, commentaire de validation comme pour la 1.230) :

Titre : « Des palettes d'une même famille, et une palette Annotation au doigt »

1. « Annoter : la palette Annotation a une version étendue, en tuiles nommées comme les Tampons, qui se manie au doigt sur l'iPad. Annuler, Supprimer, Rétablir et Effacer la page sont en bas, loin des outils. »
2. « Toutes les palettes ont le même en-tête : un seul bouton passe de la version étendue à la version compacte, et ton choix est retenu. La disposition en bandeau est retirée. »
3. « Tampons : une version compacte, les icônes seules, avec le nom du tampon touché sous la grille. Plus aucun nom n'est coupé : il passe sur deux lignes. »
4. « Un seul bouton de verrou, « Verrouiller » ou « Déverrouiller », en haut de la palette de gauche, dans Annoter comme dans Évaluer. »
5. « Évaluer : la palette Rétroaction s'ouvre plus large, pour lire d'un trait le texte que l'élève recevra. »
6. « Avec cette version, les palettes s'ouvrent une fois à leur place et à leur taille par défaut. »

L'entrée 1.230 dit encore « un bouton aux quatre carrés la bascule » : c'est l'histoire de la 1.230, n'y touche pas.

## 2. La version, le relais, la porte terrain

- `node scripts/release.mjs minor` (1.231.0).
- `RELAIS.md` : remets son en-tête à l'état réel (1.231.0, et la branche `lot/pauses-apres-ouverture` qui attend sa fusion).
- Skill `portes-terrain` : écris `PORTES-TERRAIN-2026-11-02-mise-en-ligne-1231.md`, avec les cinq gestes du § 5 de `RAPPORT-2026-11-02-palettes-une-famille.md` et celui de la Rétroaction (en Évaluer, elle s'ouvre large, environ 50 caractères par ligne, les trois boutons sur une rangée). Cowork en publie l'artefact jumeau.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs`. **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur, sans veille. Vert (les rouges déjà connus exceptés, nommés) : `git push`. Rouge neuf : ne pousse pas, rapport à Cowork.

## 4. Après le push

Dis à Grégoire : « La 1.231.0 est en ligne : recharge l'iPad. » Puis rends à Cowork le résultat du verdict et le chemin de la porte terrain.
