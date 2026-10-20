# Consigne – Revenir à sa dissection après « Créer ma grille » (#1119)

> Écrite par Cowork le mardi 20 octobre 2026 à 7 h 08 (Toronto, mesuré par `date`), sur `main` à `44ba73c2` (non poussé). Fiche #1119 du BACKLOG ; plan `plans de travail/PLAN-2026-10-19-bareme.md`, « Le retour à la dissection » (premier lot du chantier du barème, aucune question ouverte). Symptôme vécu par Grégoire le 19 oct. au soir : après avoir créé la grille de la démo Journal de lecture, il a dû reconstituer tout son travail pour la modifier. **Aucune porte terrain** : une machine répond à tout ce qui suit.

## Ce que l'enseignant fait à la fin de ce lot

Il dissèque une grille dans « Apporter mon matériel » et touche « Créer ma grille ». Sur l'écran « Ta grille « … » est créée », un bouton secondaire « Revenir à ma dissection » (mots provisoires) rouvre la dissection telle qu'il l'a laissée (coupes, étiquettes, rattachements, nom saisi), avec le mot qui existe déjà : « Dissection reprise telle que tu l'as laissée. » Il corrige, touche de nouveau « Créer ma grille » : une **seconde** grille est créée. La première ne change pas.

## Ce que la mesure a établi (Cowork, lecture seule)

- Depuis le lot 11, le brouillon (`<trim>_brouillonDissection`) s'écrit à chaque geste et **reste** après « Créer ma grille ». Il porte aussi le nom saisi (`materiel-dissection-lecture.js`, `brouillon`, l. 452-477).
- Les deux écrans de confirmation (`materiel.js`, `confirmationHtml` l. 44, et `confirmationPointsHtml` l. 95) n'offrent que « Aller aux productions », les cartes « La voir dans… » et « Coller une autre grille », qui efface le brouillon (`recommencer` → `oublierBrouillon`).
- La réouverture existe déjà : `materielDissection.reprendre()` (`materiel-dissection.js`, l. 1065) rend `'reprise'`, `'aucun'` ou `'illisible'`, et `materiel.js` a son mot pour l'illisible (`MESSAGE_BROUILLON_ILLISIBLE`). Aujourd'hui, `reprendreDissection` ne l'appelle qu'à l'ouverture de l'onglet, et seulement depuis l'accueil.
- Le nom d'une grille n'est jamais dédoublé d'office (« Aucun « (2) » ajouté : le nom s'imprime sur le PDF des étudiant·es », décision de Grégoire du 18 oct., `champNom`). Rien n'empêche aujourd'hui deux grilles de porter le même nom.

## Ce qu'il faut

1. **Le bouton**, dans les deux confirmations, à côté des gestes existants et sous la forme d'un bouton secondaire (skill `design-interface` ; cible de 44 × 44 px sur iPad). Il n'est rendu que si un brouillon existe ; il appelle `reprendre()` par le chemin existant, sans recopier sa logique. `'illisible'` : le mot existant, l'accueil, et le brouillon reste. Construis-le à partir de ce qui existe (règle de Grégoire du 17 oct. : bâtir sur l'existant).
2. **La seconde création** passe par `materielCreation.creer` comme la première et produit une autre grille (et une autre échelle quand la grille a des niveaux). **La grille déjà créée ne change pas**, ni son échelle, ni ses cartouches. Le champ « Nom de ta grille » montre ce que l'enseignant avait saisi ; aucun nom changé d'office.
3. **Le brouillon** : « Revenir à ma dissection » ne l'efface pas ; seul « Coller une autre grille » l'efface, comme aujourd'hui.
4. **Mac et iPad**, séparément : le bouton se touche au doigt, la confirmation garde sa mise en page à la largeur de l'iPad.

## Les textes

« Revenir à ma dissection » : provisoire, listé dans la demande. Aucun autre texte neuf attendu ; s'il en faut un, il est provisoire et listé.

## Les bancs

- **Vitest** : les deux confirmations rendent le bouton quand un brouillon existe, et pas sans brouillon ; le bouton passe par `data-action`, aucun handler inline.
- **WebKit** : disséquer, créer, revenir → la dissection est telle qu'elle était (étiquettes et nom saisi), avec le mot de la reprise ; créer de nouveau → deux grilles, la première identique à l'octet près à ce qu'elle était avant le retour. Un second cas : « Coller une autre grille » efface toujours le brouillon, et le bouton disparaît.
- **Break-test** : un retour qui efface le brouillon, puis une seconde création qui écrase la première → rouge chaque fois. Code restauré.
- Vitest complet vert ; les specs `materiel-dissection-*` touchées vertes en WebKit. Le verdict complet tourne ce soir.

## Ce qu'il ne faut pas

- Modifier ou remplacer la grille déjà créée, son échelle ou ses cartouches.
- Ajouter « (2) » ou changer un nom d'office.
- Toucher `navigation.js` ou `config.js` (zones protégées).
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne ; le verdict `plans de travail/VERDICT-RELECTURE-2026-10-20-solo-suit-le-reglage-corrections.md` et le BACKLOG (Cowork y a ajouté une ligne à #1118, non commitée), puis la fiche #1119 cochée avec sa phrase « vérifié comment » ; les bancs ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-retour-a-la-dissection.md`. Ajoute les fichiers par leur chemin, jamais `git add -A`. **Puis arrête-toi.**
