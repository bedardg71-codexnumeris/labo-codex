# Verdict de relecture – les palettes d'annotation (parties A à H)

> Cowork, samedi 31 octobre 2026, 12 h 26 (Toronto), sur `main` local à `3163e26e` (dix commits depuis `e3a018c0`, non poussés). Relecture ciblée, pas ligne à ligne : 20 fichiers de code, 1 147 lignes ajoutées.

## Verdict : rien de bloquant

Mesuré sur le diff `e3a018c0..HEAD` :

- Règles de sécurité : aucun `console.log`, aucun handler en ligne, aucun `innerHTML` ni `eval` ajouté. Le HTML neuf des tampons (titre de catégorie, carré de couleur, tuiles) échappe noms, couleurs et identifiants personnalisables.
- Retraits complets (zéro dette) : plus aucune trace d'`afficherRetroaction`, de `travaux-badge-retro`, de `travaux-annot-label-etudiant` ni de `travaux-annot-identite` dans `js/`, `index.html` et `styles.css`.
- Données qui voyagent : aucun filtre de type de forme dans `import-export.js`, `codex.js`, `travaux-stockage.js` ni les modules de sécurité ; `trait` et les sommets du polygone voyagent tels quels. L'effet sur une version antérieure est mesuré et écrit au rapport (polygone absent, sans erreur).
- Partie E : `toucheDuCode` est une fonction pure ; `obtenirItemParTouche` donne la priorité au code et ignore les entrées `errfr_*` ; `definirRaccourci` ne les vide plus. Stock intact, conforme à la décision de Grégoire.
- Partie A2 : la largeur ne s'écrit plus que si la poignée la change ; plus de `select()`, curseur en fin de texte.

## Réserves, sans correctif demandé

1. Les 4 specs rouges connues (#1181) s'arrêtent avant la barre d'Annoter : à 1024 et 1180 px, le recouvrement de la bande des palettes par le témoin d'échec reste non prouvé. À regarder à la porte terrain.
2. Le toucher réel (deux doigts, polygone au crayon, tampon d'un toucher) n'est éprouvé que sur l'iPad. Les seuils de la partie B (6 %, 500 ms) et la tolérance du polygone (14 px) sont des choix de Claude Code, à ajuster au besoin après l'essai.

## Suite

- **Pas de push** : Grégoire, 12 h 25, « avant de publier ces correctifs, il y a d'autres chantiers dans une autre instance qu'il faut terminer ».
- Grégoire : mots du rapport validés à 12 h 27 (`TEXTES-2026-10-31-palettes-annotation.md`) ; il reste à vider lui-même les raccourcis X et S.
- La porte terrain et son artefact jumeau : à la mise en ligne.
