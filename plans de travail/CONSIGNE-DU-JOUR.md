# Consigne du jour – carte d'alignement : la palette des raccourcis revient, le menu « Vue » tient dans sa largeur

> Écrite par Cowork le 8 octobre 2026 à 20 h 52 (Toronto, mesurée par `date`). Remplace la consigne de la release 1.192, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-carte-release-1192.md`.

## Où on en est

1.192.0 en ligne depuis 20 h 41 (7c808584). À 20 h 49, Grégoire a ouvert le menu « Vue » dans Chrome sur son Mac, et l'affichage ne fonctionne pas. Sa capture montre :
- un menu trop étroit pour son contenu : la colonne des libellés des raccourcis est réduite à quelques lettres (« Recer / carte », « Loupe / sans … / le zoc ») ;
- la dernière pastille de chaque rangée de « Fond du canevas » coupée ;
- une barre de défilement horizontale au bas du menu, et un menu qu'il faut faire défiler verticalement pour atteindre les raccourcis.

Les bancs vérifiaient la taille des cibles au doigt, pas que le contenu tienne dans le menu. C'est ton lot : il n'est pas fini.

## Décision de Grégoire (20 h 52, recommandation de Cowork acceptée)

1. **La palette flottante des raccourcis revient**, comme avant le lot 1 : déplaçable par sa barre, repliable (−/+), avec sa croix de fermeture, au premier plan quand on la touche. Reprends son balisage, son JS et son CSS au parent de 7745b1c7, sans réécrire ce qui marchait.
2. **Son contenu vient de `RACCOURCIS_CARTE`**, la source unique (pas de table écrite à la main dans `index.html`), avec les libellés validés aujourd'hui. Le verrou liste ↔ essais de `planif-menu-vue.spec.js` reste.
3. **Elle s'ouvre par une ligne « Raccourcis clavier » au bas du menu « Vue »**, à la place de la table actuelle. **Pas d'icône dans la barre** : la barre reste désencombrée, c'est le but du lot 1. La ligne referme le menu et ouvre la palette ; une seconde fois, elle la referme.
4. **Le menu « Vue » tient dans sa largeur** : les douze pastilles visibles en entier, aucun défilement horizontal, ni dans le menu ni dans la palette, dans Chrome et dans WebKit, à la largeur de fenêtre de la capture (environ 1 800 px de page) comme à celle d'un iPad Air en paysage (1 180 px).

## Tests

- Au navigateur : `scrollWidth <= clientWidth` pour le menu ouvert et pour la palette ouverte ; chaque pastille entièrement dans le rectangle du menu ; chaque libellé de raccourci sur une largeur d'au moins 12 caractères (pour qu'un libellé tassé à quelques lettres échoue). Chromium ET WebKit.
- La ligne « Raccourcis clavier » ouvre et referme la palette ; la palette se déplace, se replie, se ferme.
- Break-test de chacun ; specs `planif-*` sous WebKit, Vitest complet.

## Une preuve à l'œil, pour Cowork

Ce défaut est passé parce que personne n'a regardé. Après tes tests, prends quatre captures, menu « Vue » ouvert puis palette ouverte, sous Chromium à 1 800 × 1 100 et sous WebKit à 1 180 × 820, en démo. Range-les dans `plans de travail/captures-2026-10-08-menu-vue/`.

## Puis arrête-toi

Un commit pour le correctif, puis `node scripts/release.mjs patch` (1.192.1) et son commit, sur `main` local. **Pas de verdict ni de push** : Cowork regarde d'abord les captures. La ligne des Nouvelles de 1.192 reste telle quelle (« en bas, tous les raccourcis clavier » reste vrai : on y accède par le bas du menu) ; 1.192.1 y est consolidé sans ligne. Grégoire t'autorise, en te transmettant cette consigne, à commiter cette consigne, son archive et les captures.

## Ton rapport à Grégoire

Court : ce qui change à l'écran ; ce que tu as supposé, une ligne par supposition.
