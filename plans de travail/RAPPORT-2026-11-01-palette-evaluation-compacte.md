# Rapport – La palette Évaluation en version compacte (1er novembre 2026)

> Pour Cowork, en relecture. Commits sur `main` : `99728dae` (docs de la consigne), `6dd40044` (le lot). **Pas de push, pas de release, pas de verdict complet.**
> Base mesurée : `225965ff`, 10 615 essais Vitest verts avant le lot.

## En tête : ce qu'il faut regarder

- **Les quatre nombres.** Grille des ébauches (quatre lignes, un critère algorithmique), 1180 × 820, critères entiers visibles sans défiler :

| | Hors plein écran | Plein écran |
|---|---|---|
| Descriptions | **2** | **4** |
| Compacte | **4** | **5** |

  Hors plein écran, la compacte double le compte, mais le critère algorithmique et la note demandent encore de défiler : la zone a 416 px. Ces nombres dépendent de la longueur des descriptions de la grille.
- **Un écart avec la consigne, à trancher au besoin : Évaluation s'ouvre à 316 pt, pas à 280.** La règle de 280 pt gagne bien pour Paramètres. Mais à 280, « Plausibilité (15 %) » ne tient plus à côté d'un menu de 120 pt ; les trois ébauches, à l'échelle 1 : 1, sont à 316. Même largeur en descriptions et en compacte : rien ne saute à la bascule.
- **Le prix de la largeur, sur l'iPad.** À l'ouverture, à 1180 pt, la copie libre entre les palettes passe de **468 pt à 272 pt** (Paramètres 12–292, Évaluation 564–880, Rétroaction 968–1168 ; avant : 12–212, 680–880, 968–1168). C'est ce que demande la consigne, mais c'est une perte visible. Voir la trouvaille 1.
- **Le contraste ne se reproduit pas au banc.** Sous WebKit sur Mac, en sombre, les champs Erreurs et Mots étaient à fond `rgb(30, 30, 30)` et texte blanc, donc lisibles : ce sont les couleurs du navigateur, faute de `background` déclaré. Blanc sur blanc se mesure seulement pendant les 0,3 s de la transition, juste après le passage au sombre. Le défaut vu sur la capture de l'iPad n'a donc **pas** été observé ici. *Inférence* : l'iPad choisit d'autres couleurs par défaut. Le correctif déclare les jetons `--surface-input` et `--texte-principal`, ce qui retire le navigateur de l'équation. **Seule la porte terrain dira si c'est réglé.**

## Ce que j'ai mesuré dans le code

- **Les gabarits.** `cartoucheSelectionnee` sert la palette quand une cartouche est choisie (il porte les `.eval-aide`), `afficherCriteresDepuisGrille` sinon (il n'en a pas) : un essai couvre chacun. Un **troisième** existe, que la consigne ne nomme pas : `_afficherCriteresDepuisEvaluation` (`js/evaluation.js:976`, grille d'origine introuvable). Sa carte a reçu une règle pour tenir sur une ligne ; **lu, pas exécuté**, cette fonction n'est pas exposée au banc.
- **Le formulaire hors annotation** rend les mêmes gabarits dans la même liste, sans palette. **Il ne suit pas** : il a la place, et aucun bouton pour choisir. Tout le CSS compact est scopé à `#travaux-palette-eval-droite.evaluation-compacte`.
- **La bulle générale du nom** se déclenche au survol, au focus, et au doigt par un appui de 400 ms (`js/accompagnement.js`), dans un seul élément, `#tooltip-bulle`. Deux bulles sont donc impossibles par construction, et ce mécanisme porte la description : aucun second mécanisme n'est écrit.

## Décisions prises seul

| Décision | Motif |
|---|---|
| `paletteEvaluationCompacte`, un booléen, et non une troisième valeur de disposition comme aux Codes | Le § 2 applique la compacte en bandeau : elle ne peut pas exclure ↔. |
| **Le geste diffère donc des Codes sur un point** : ↔ garde la compacte. ↕ la quitte (son libellé dans l'ébauche : « verticale, avec les descriptions »). Le bouton compact bascule dans les deux sens. | Consigne et ébauche. |
| Un bouton sans texte **recouvre** le nom, et n'existe qu'en compacte. Le nom lui-même ne reçoit plus le toucher. | Pas de double du nom dans le DOM (`#1215` lit le texte de l'en-tête), pas de synchronisation à chaque rendu, rien de focalisable en descriptions. |
| La bulle ouverte tient contre le survol et la fin de survol ; le défilement de la palette, Échap et tout toucher ailleurs la ferment. | Toucher ailleurs passe par `pointerdown` : **sur iPad, un élément non cliquable n'émet pas de `click`**. |
| Critère sans description : ni soulignement, ni bouton, ni bulle, pas même l'aide générale. | Consigne. |
| Couleur de la bulle : le bleu de l'ébauche, par les jetons `--surface-element` et `--bleu-clair`, pas l'orange des aides. | Ce n'est pas une aide. |
| **Critère analytique sans barème** : une ligne, le champ et « sur N » dans les 120 pt du menu. **Avec barème** : un bloc ; le nom et les points de chaque tranche restent, c'est la saisie ; le texte d'une tranche nommée part ; « Ou tape les points » dessous. | Demandé par le § 2. Une tranche sans nom garde son texte, sinon rien ne la désigne. |
| **Catégorisation : le champ des codes et celui des mots ont chacun leur rangée**, l'étiquette à gauche. **Écart** avec « côte à côte » : l'étiquette « Codes d'erreurs → séparer par ; » laissait 14 pt au champ (mesuré). | La règle demandée n'est pas tenable ici. |
| Menus compacts à 32 pt : apparence du système retirée, chevron dessiné, comme aux menus de la table de cas. | WebKit ignore la hauteur d'un menu natif (20 pt mesurés). |
| Poignée de redimensionnement masquée en compacte. La taille enregistrée n'est ni lue ni réécrite, elle revient avec les descriptions. | La hauteur suit le contenu, comme aux Codes. |

## Ce que j'ai supposé

- **La ligne du résultat garde « | Niveau : E »**, absent de l'ébauche, et passe donc sur deux lignes. *Motif* : l'ébauche dessine aussi la version d'aujourd'hui sans cette mention, alors qu'elle existe. Et c'est le seul endroit qui dit le niveau calculé quand le menu affiche « Utiliser le niveau calculé ».
- **La formule chiffrée (#667) ne s'affiche pas en compacte** : la consigne ne la nomme pas, et c'est une justification, pas une saisie. Une ligne de CSS à retirer si Grégoire la veut.

## Source ou stock

Aucune donnée n'est écrite ni relue autrement. Aucune migration, rien dans le calcul. Une largeur de 200 px déjà enregistrée dans `travaux-palette-eval-droite-pos` reste telle quelle dans le stock : le plancher de 316 l'emporte à l'écran, et ce stock est assumé.

## Les trouvailles et leur issue

1. **`paletteD.style.right = '300px'` présume une Rétroaction de 280 pt ; elle reste à 200**, par sa règle d'id que ce lot n'a pas touchée. Il en résulte 88 pt vides entre Évaluation et Rétroaction, alors que la copie n'a que 272 pt. *Issue 2, inscrire et continuer* : à trancher au lot de la Rétroaction, qui touche sa largeur. Pas de fiche au BACKLOG tant que personne ne l'a vécu.
2. **Les menus de niveau, en descriptions, portent encore les couleurs du navigateur en sombre** (`rgb(30, 30, 30)` au banc). Même famille que les champs, sans symptôme signalé. *Issue 3.* Si l'iPad les montre clairs eux aussi, la porte terrain le dira.
3. **Relevé par l'audit de début de session** : `RELAIS.md` s'arrête au 31 oct. et ne nomme pas les commits du 1er nov. ni les trois branches `lot/` ouvertes, dont `lot/pauses-les-plus-lourdes` et ses 29 fichiers non commités. *Issue 2* : pour la mise en ligne de ce soir.

## Les tests

- **Vert par exécution, WebKit, sur le code du commit** : `palette-evaluation-compacte.spec.js` (16 essais, au doigt, 1180 × 820). Avec elle, deux passages sur 12 specs voisines : `palette-evaluation-un-defilement-1214`, `bareme-2-aide`, `materiel-aide-accompagnement`, `materiel-dissection-2b`, `critere-algorithmique-presentation`, `copie-non-recevable-note-28-oct` (41 essais avec la spec du lot : 40 passés, 1 sauté) ; `barre-outils-compacte`, `evaluer-relit-la-grille-1215`, `evaluation-rendu`, `palette-barre-boutons-clic-644`, `palette-annotation-disposition`, `evaluer-868-avec-ou-sans-copie` (72 essais : 71 passés, 1 sauté). Un seul essai, sans nouvelle tentative (`--retries=0`). Je n'ai pas lu quels essais étaient sautés.
- **Vitest entier** : 10 615 / 10 615.
- **Suite Playwright complète : non lancée**, elle appartient au verdict du soir (règle 7). **Rien n'a tourné sur un vrai iPad.**
- **Contre-épreuves** : 21 mutations, fichier restauré après chacune. **18 rouges du premier coup ; 3 restaient vertes et ont révélé trois essais faibles**, renforcés puis rejoués rouges :
  - le survol d'une autre aide : l'essai annulait le survol avant son délai ;
  - le badge : à 316 pt il ne pouvait plus être coupé, l'essai porte maintenant un nom d'un seul long mot ;
  - la hauteur du bandeau : l'essai se juge maintenant en plein écran, où il y a la place.
- **Deux bancs existants changés, à relire** :
  - `tests/unit/_helpers/charger-script.js` donne le **vrai** `echapperAttribut` à `evaluation-chargement.js`, sa nouvelle dépendance. Sans lui, 12 essais rougissaient sur une `ReferenceError` ; aucune assertion n'est touchée.
  - `AU_DESSUS_DE_15` passe de 440 à 439 : la sentinelle exige qu'il suive quand le compte descend, et l'en-tête et le menu tiennent maintenant en un seul gabarit.
- **Jetons** : la sentinelle anti-cache exige le jour du build (`20261031`) ; le `20261101a` de ma première passe a été refusé.

## À vérifier sur l'iPad

`plans de travail/PORTES-TERRAIN-2026-11-01-palette-evaluation-compacte.md`, après la mise en ligne. L'artefact revient à Cowork, réuni avec les deux autres lots.
