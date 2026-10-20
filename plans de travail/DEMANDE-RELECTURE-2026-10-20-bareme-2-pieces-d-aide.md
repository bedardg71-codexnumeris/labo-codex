# Demande de relecture – Le barème, lot 2 : les pièces d'aide (#1120)

> Claude Code, mardi 20 octobre 2026 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-bareme-2-pieces-d-aide.md` ; textes : `TEXTES-2026-10-20-bareme.md` (35, validés G. 9 h 23). Pour Cowork (`PROTOCOLE.md`, règle 2). Un commit sur `main`, **non poussé**, après `34382028` (le jeton de #1121, commité seul). Ni verdict complet, ni version.

## Ce qui est posé, tel quel

- **Lexique** (`accompagnement-contenu-terme.js`) : A1 `bareme` et A2 `tranche` (Structure, `Conception > Grilles`, sur le modèle de `points`) ; A3 et A4 remplacent `echelle-de-performance` et `type-de-critere`.
- **Aide « i »** `grille-bareme` (`accompagnement-contenu-popup.js`) : B1 titre ; B2, B3 en `texte` ; B4 en `exemple` (première ligne en `titre`, les trois autres jointes par `<br>`) ; B5 `conseil` ; B6 = les trois clés, dont les titres font B6. Icône `primo-aide` à côté du titre « Barème » (`grilles.js`).
- **Les trois types** : C1 (trois lignes, `<strong>Type</strong> :`), C2 (bulle `cn-grille-type-critere`).
- **D1 à D10** : identiques, mot pour mot (vérifié par le banc, sur le rendu et sur `bareme.REFUS`) ; leurs mentions « provisoires » deviennent « validé G. 20 oct. 9 h 23 ».
- **Bulles E1 à E6** : clés `bareme-tranche-nom`, `-points`, `-texte`, `bareme-ajouter-tranche`, `bareme-a-completer`, `bareme-hors-bareme` ; la marque posée après coup (points effacés) reçoit aussi la sienne.
- **Onglet Aide** : la carte `accordeon-aide-bareme`, juste après « Apporter une grille que tu as déjà » ; F3 en `table.tableau` dans `.u-overflow-x-auto`, une rangée par intitulé (`th scope="row"`).

## À regarder

1. **G1 attend**, sans mécanisme neuf. Mesuré : la flèche didactique (`accompagnement.js`) se montre une fois (`estVue`), mais elle part de `sectionAffichee`, à l'ouverture de Grilles de critères, **avant** qu'une grille et son barème soient rendus (sa cible n'existe pas encore), et son message passe par `textContent` : il ne peut pas porter le lien vers l'aide « i ». Poser G1 demanderait d'étendre ce mécanisme (un déclenchement après le rendu, un lien) : à décider.
2. **L'intitulé de rangée du tableau** : `.tableau th` (deux règles) le peignait en `--bleu-moyen` ; ici, texte sombre sur bleu, illisible (capture du banc). Une règle ciblée (`#aide-bareme-tableau tbody th`) lui rend le fond de sa rangée et la couleur des cases. Mesuré en mode clair seulement ; le mode sombre n'est pas éprouvé.
3. **D9 sans nom** : le texte validé suppose une tranche nommée (« de la tranche « ‹Nom› » (‹3 à 4›) »). Une tranche sans nom donne « de la tranche 3 à 4 : … » (lot 1), une forme que le fichier ne valide pas.
4. **Deux textes déjà validés disent encore les réponses** (rien n'y est touché) : la carte « Apporter une grille que tu as déjà » (« corriger une réponse, changer ses points, en ajouter ou en retirer une ») et le terme « Points » (« Ce que vaut une réponse, en chiffres. »), que le plan voulait nuancer. Pour une prochaine page de validation.
5. **L'icône « i »** suit le patron des autres « i » de l'éditeur : visible en mode aide seulement (`gererVisibilitePrimoSelonMode`).

## Les bancs

- **Vitest** `tests/unit/bareme-2-pieces-d-aide.test.js`, 14 cas : il **lit le fichier des textes** (35 entrées, A1 à G2) et compare chaque texte posé, mot pour mot, là où il est posé (catalogues, rendu de l'éditeur, `bareme.REFUS`, carte de l'Aide) ; chaque `data-tooltip` et `data-target` du barème a son entrée ; G1 et G2 ne sont posés nulle part.
- **WebKit** `tests/integration/bareme-2-aide.spec.js`, 2 cas : l'aide « i » ouverte depuis un critère analytique (titre, exemple, conseil, trois « Voir aussi ») et la bulle du champ « Points » au survol ; la section trouvée par « barème » et « tranche », sans débord à 820 px, ses intitulés lisibles.
- **Ajustés** : `bareme-1-editeur.test.js` G.h (le titre suivi de l'icône) et I.a (les trois catalogues nomment `bareme` par leurs clés : des textes, aucun calcul).
- **Break-tests** : B2 retouché d'un caractère, E4 retouché d'un caractère, la règle de l'intitulé retirée : rouges ; restaurés.
- Vitest complet 9 262 / 9 262 ; WebKit `bareme-*` 5 / 5, `materiel-aide-accompagnement`, `type-grille-lot1`, `materiel-dissection-2a/2b`, `grille-critere-ajoute-enregistrer-957` verts.
