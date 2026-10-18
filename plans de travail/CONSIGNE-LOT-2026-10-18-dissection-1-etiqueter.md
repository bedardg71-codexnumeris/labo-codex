# Consigne – la dissection, lot 1 : étiqueter sa grille dans l'onglet

> Écrite par Cowork le dimanche 18 octobre 2026 à 7 h 17 (Toronto, mesuré par `date`). Lis d'abord `PLAN-2026-10-18-la-dissection-pour-lundi.md`, puis ouvre le prototype dans un navigateur et essaie-le. Règles 2 et 7 de `PROTOCOLE.md`.

## Ce que l'enseignant fait à la fin de ce lot

Conception › « Apporter mon matériel ». Il colle sa grille : un tableau de Word ou de Pages, ou le texte brut d'un PDF. Il la voit telle qu'il l'a écrite, chaque ligne de chaque case devenue un morceau qu'on peut toucher. Il touche une étiquette de la palette (elle devient son surligneur), puis touche les morceaux qu'elle désigne, ou glisse dessus pour en surligner plusieurs ; il retouche un morceau surligné pour le retirer. Des flèches partent de l'étiquette en main vers ses morceaux. Sous la grille, « Ta grille, telle que l'application la comprendrait » se refait à chaque geste, avec la logique lue (des points, des niveaux, ou les deux). **Rien n'est créé à ce lot** : « Créer ma grille » vient au lot 2.

## Ce qu'il faut

1. **La lecture, en fonctions pures, testées.** Porte `comprendre` du prototype, même comportement, dans un module pur (ni DOM ni stockage). Pour le collage, **mesure d'abord ce qui existe** : `materielLecture.lirePressePapiers`, `lireHtml`, `lireTexte`, `deplier`. Il faut, pour chaque cellule, sa rangée, sa colonne et ses fusions, et ses lignes (un morceau par paragraphe, puce ou saut de ligne) ; pour un texte brut, ses lignes dans l'ordre. Si un lecteur existant les donne, réutilise-le ; sinon porte `lireCollage` du prototype. Dis lequel tu as retenu.
   **Bancs Vitest, sur des grilles FICTIVES de même forme que les deux grilles réelles, jamais leur texte :**
   (a) des sections dont la rangée porte les noms des niveaux, des points par niveau, un total : 3 sections, 6 critères, 4 niveaux, somme des pondérations = total, « les deux logiques » ;
   (b) des réponses en lignes avec leurs points ; un critère nommé, puis une section avec des critères sans nom, coupés là où les points remontent ; une phrase coupée en deux rangées (« Suite ») ; une pondération « /2 » : aucun morceau sans place ;
   (c) un texte brut : rattachement par l'ordre.
   Et les cas limites que la lecture rend nouveaux : des « Points » sans réponse, une « Suite » sans rien avant elle, un « Descripteur » sans critère quand des niveaux sont nommés. Chacun finit « sans place », avec sa raison, jamais en erreur.
2. **L'interface, dans `#conception-materiel`, à la place des sept étapes.** L'accueil (la zone de collage) reste l'entrée ; après un collage, la dissection s'affiche. Palette à gauche (nom, description, précision, compte des morceaux), canevas au centre (la grille telle quelle, son propre défilement ; la page ne défile jamais de côté), bandeau « Surligneur « … » » avec « Terminer » (et Échap), flèches SVG pour la seule étiquette en main, lecture en bas. Le bandeau « En construction » reste. Les sept étapes sont **débranchées, pas supprimées** (leur retrait est inscrit pour après lundi). « Essayer avec un exemple » ouvre une grille fictive dans la dissection. « Taper ma grille à la main » : retire le bouton, ou mène vers Grilles de critères ; dis lequel.
3. **L'iPad.** Les gestes passent par les événements de pointeur (pas de glisser-déposer HTML5). `touch-action: none` sur les morceaux seulement quand une étiquette est en main, pour que le canevas défile au doigt le reste du temps. Cibles d'au moins 44 px pour les étiquettes et « Terminer ».
4. **La sécurité, non négociable.** Tout texte venu du collage s'écrit par `textContent` ou passe par `echapperHtml` ; aucun handler inline (dispatcher `data-action` de `main.js`) ; le HTML collé n'est jamais inséré, seulement lu (`DOMParser`). Un banc colle un `<img onerror>` dans une cellule ; break-test.
5. **Une spec Playwright** : coller un tableau fictif, poser deux étiquettes par les événements DOM (ni clic à l'aveugle ni `waitForTimeout`), lire la grille comprise ; à la largeur de l'iPad (820), la page ne défile pas de côté.

## Ce qu'il ne faut pas

- Rien n'est écrit dans les données : la dissection en cours vit dans la page.
- Aucune zone protégée : la sous-section existe déjà, `config.js` et `navigation.js` restent tels quels.
- Pas de numéro de version : la release est l'étape 4 du plan.

## Livrer

Commit sur `main` ; Vitest complet vert ; la demande de relecture courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-1.md` : ce que tu as réutilisé et ce que tu as écrit à neuf, les textes d'écran que tu as dû écrire (l'inventaire de l'étape 3), et ce que tu as supposé. **Puis arrête-toi.**
