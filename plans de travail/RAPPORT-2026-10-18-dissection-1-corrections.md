# Rapport – la dissection, corrections C1 et C2 du lot 1

> Claude Code, dimanche 18 octobre 2026, 8 h 05 (Toronto). Répond à `VERDICT-RELECTURE-2026-10-18-dissection-1.md` (Cowork, 7 h 58). Un commit local sur `main`, non poussé. Pas de version, pas de verdict, pas de push.

## État mesuré

- **Vitest complet** : 772 fichiers et 9 151 essais, tous verts. Le compte n'a pas bougé : C1 et C2 se prouvent dans WebKit.
- **WebKit, specs touchées** : `materiel-dissection-1` (3), `materiel-bandeau-construction` (1) et `materiel-lot1-onglet` (2), soit 6 essais verts.
- **Break-tests** (restaurés, et `diff` vide après restauration) :
  - **C2** : sans la garde de `collerAutre`, le bouton ne passe jamais à « Confirmer : coller une autre grille ». Rouge.
  - **C1** : avec l'ancienne règle remise (la palette au-dessus sous 1 024 px de fenêtre), « 820 × 1180 : la palette est à gauche du canevas » attend `true` et reçoit `false`. Rouge.
- **Capture à 820 × 1180**, en mode sombre, l'étiquette « Descripteur » en main sur l'exemple fictif : `plans de travail/CAPTURE-2026-10-18-dissection-820.png`. La spec en dépose aussi une à chaque passage (`dissection-820.png`, dans `test-results/`).

## C1 – la palette reste à gauche

**Requêtes de conteneur.** La mise en page ne dépend plus de la largeur de la fenêtre, mais de celle de `.dissection` (`container-type: inline-size`), qui est la largeur utile dans l'onglet.

| Largeur utile | Palette |
|---|---|
| 900 px et plus | 220 px à gauche, comme avant. |
| 662 à 899 px | 170 px à gauche. Chaque étiquette garde son nom, son aide et son compte ; la précision n'y est plus. |
| Moins de 662 px (170 + 12 + 480) | Au-dessus du canevas (un téléphone). |

**La palette défile dans son propre cadre.** Elle partage la hauteur du canevas par une variable commune (`--dis-hauteur`). Si l'étiquette en main sort du cadre en défilant, ses flèches partent du bord de la palette.

**Le bandeau du surligneur sort de l'atelier.** Il est maintenant placé au-dessus de l'atelier et reste toujours visible :

- sans étiquette en main, il affiche la consigne « Touche une étiquette dans la palette : elle devient ton surligneur. » ;
- avec une étiquette en main, il affiche son nom, sa **précision** et « Terminer ».

Sa hauteur est réservée (64 px au minimum), pour que la grille ne saute pas quand on prend une étiquette. Les flèches, dessinées dans l'atelier, ne peuvent plus le traverser.

**Preuve, dans WebKit, à 820 × 1180 puis à 1180 × 820** :

- la palette est à gauche du canevas ;
- l'écart entre leurs hauts est inférieur à 100 px ;
- le canevas mesure au moins 480 px de large ;
- la palette ne dépasse pas la hauteur du canevas ;
- la page n'a aucun défilement horizontal ;
- les étiquettes et « Terminer » mesurent au moins 44 px.

## C2 – « Coller une autre grille » à deux temps

Le bouton appelle maintenant `materielDissection.collerAutre`, au lieu de `materiel.recommencer` directement.

- **Sans étiquette posée** : retour à l'accueil au premier toucher, comme avant.
- **Avec au moins une étiquette** : le premier toucher arme le bouton (« Confirmer : coller une autre grille ») et le second revient à l'accueil.

La mécanique à deux temps est maintenant commune aux deux boutons (`DEUX_TEMPS`, `confirme`, `desarmer`). « Retirer les étiquettes » la partage.

## Ce que j'ai supposé

- **Tout autre geste désarme les deux boutons** : prendre une étiquette, surligner, ouvrir une autre grille. La spec le vérifie. Sans cela, un bouton armé resterait piégé pour un toucher distrait dix minutes plus tard.
- **La précision quitte la palette seulement dans la colonne étroite.** Sur le Mac (220 px), elle reste aussi dans la palette, comme dans l'ébauche ; le bandeau l'affiche partout quand l'étiquette est en main. Si tu préfères qu'elle ne vive qu'au bandeau, c'est une ligne de CSS.

## Textes neufs (inventaire de l'étape 3, tous provisoires)

- « Confirmer : coller une autre grille ».
- La consigne du bandeau au repos, « Touche une étiquette dans la palette : elle devient ton surligneur. », reprise de la première consigne de l'ébauche.
- La forme « Nom : précision » dans le bandeau.

## Hors lot

- **Mémoire de Claude Code corrigée** : la fusion du chantier CI se fera le lundi 19 après-midi, après la rencontre, et la date peut encore glisser. Le fichier de mémoire est renommé en conséquence.
- **Le worktree `verdict-morceaux`** : non touché. Il part à la fusion, selon ton verdict.
