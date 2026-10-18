# Consigne – la dissection, lot 7 : « Rattacher » un morceau à celui dont il est la suite

> Écrite par Cowork le dimanche 18 octobre 2026 à 16 h 45 (Toronto, mesuré par `date`). Née de la porte de Grégoire sur la 1.205.0 (capture de 16 h 43). **Décision de Grégoire, 16 h 44** : « on lance Rattacher », ce soir, sous le filet de la vérification de nuit (si elle échoue, la 1.205.0 reste en ligne). Nom et aide de l'outil, acceptés avec la décision : « Rattacher » · « Joint un morceau à celui dont il est la suite ». Règles 2 et 7 de `PROTOCOLE.md`.

## Ce qui manque (mesuré sur sa capture)

Sa grille écrit le nom d'un critère sur plusieurs lignes d'une même case, entrecoupées de cases à cocher : « Idées secondaires », « / 24 », « [ ] [ ] explication absente… », puis « (explications, procédés, », « [ ] [ ] explication pas assez… », « preuves) ». Après ses coupes, « (explications, procédés, » et « preuves) » sont étiquetés Critère et deviennent des critères à part. « Suite » ne les sauve pas : elle complète le dernier texte lu juste avant elle, ici une case à cocher.

## Ce que l'enseignant fait à la fin de ce lot

Il prend « Rattacher » dans « Le reste », touche « (explications, procédés, », puis « Idées secondaires » : l'application lit « Idées secondaires (explications, procédés, » comme un seul nom ; il refait le geste pour « preuves) ». Le critère se crée sous le nom entier. Rien n'est déplacé dans sa grille à l'écran ; rien n'est deviné.

## Ce qu'il faut

1. **Le lien, en fonctions pures, testées** (`materiel-dissection-lecture.js`) : des rattachements `{ idB: idA }` (B est la suite de A). Dans `comprendre`, le texte lu de A devient A suivi de ses B, **dans l'ordre de lecture du document** (pas dans l'ordre des gestes), séparés par une espace ; chaque B sort de l'ordre de lecture et ne compte plus comme morceau à part. L'étiquette de A vaut pour le texte entier. Le texte de chaque morceau reste intact dans le document : rien ne se perd, et défaire le lien le rend tel quel.
2. **Les refus, dits sur la ligne d'état** (aucun lien créé) : rattacher un morceau à lui-même ; à un morceau qui est lui-même rattaché (« Ce morceau est déjà la suite de « … » : rattache plutôt à celui-là. ») ; un lien qui ferait une boucle.
3. **L'outil dans la palette**, groupe « Le reste », après « Couper », même traitement que « Couper » (pas de couleur d'étiquette, rien à compter). En main, deux touchers : le premier choisit la suite (B, marqué comme choisi, le bandeau dit de toucher maintenant le morceau qu'il continue), le second choisit A et crée le lien. Retoucher B avant le second toucher annule le choix ; Échap et « Terminer » aussi. Avec l'outil en main, **retoucher un morceau déjà rattaché défait son lien** (comme on retire une étiquette). Événements de pointeur, cibles de 44 px, `touch-action` comme pour « Couper ».
4. **Ce qui se voit** : un morceau rattaché garde une marque visible en tout temps (trait en pointillé et petit symbole, pas seulement la couleur) ; l'outil en main, une flèche va de chaque B vers son A. La lecture du bas montre le nom entier.
5. **L'étiquette d'un B** : à la création du lien, si B portait une étiquette, elle est retirée (son texte appartient à A) ; l'étiquetter ensuite ne change rien tant qu'il est rattaché, et la ligne d'état le dit.
6. **Avec les autres gestes** : annuler une coupe défait d'abord les liens qui touchent ses deux parties ; « Retirer les étiquettes » garde les liens (comme les coupes) ; « Coller une autre grille » demande confirmation dès qu'il y a une étiquette, une coupe **ou** un lien.
7. **Les bancs.** La grille fictive (d), complétée d'une case de la forme de la sienne (un nom de critère sur trois lignes, entrecoupé de cases à cocher), **jamais son texte**. Vitest : le lien, l'ordre de lecture, l'étiquette retirée de B, les trois refus, défaire, la coupe annulée qui défait d'abord le lien, l'aller-retour qui ne perd rien ; (d) coupée, rattachée, étiquetée → le critère créé porte le nom entier. WebKit : les deux touchers par des événements de pointeur, la marque et la flèche, la création, le critère retrouvé sous son nom entier dans Grilles de critères ; à 820 px, pas de défilement de côté. Break-tests : l'ordre des gestes au lieu de l'ordre de lecture ; B qui compte encore comme critère à part ; un lien en boucle accepté.
8. **Au passage** : le commentaire de la raison « aucun critère dans sa rangée ; une ligne de total prend l'étiquette « Total » » se marque « validé G. 18 oct. 13 h 48 » (c'est le texte K13 de sa page, accepté tel quel).

## Les textes

« Rattacher » et son aide : validés (16 h 44). Tous les autres textes neufs (bandeau, ligne d'état, refus, constat éventuel) : provisoires, sur le modèle de ceux de « Couper » que Grégoire a validés ; liste-les dans la demande de relecture, il les tranchera avant la version.

## Ce qu'il ne faut pas

- Déplacer un morceau dans le document, ou écrire quoi que ce soit dans les données avant « Créer ma grille ».
- Deviner un lien : l'application n'en crée jamais d'elle-même.
- Un numéro de version : la release suivra la relecture et les mots de Grégoire.

## Livrer

Un commit sur `main` (avec `VERDICT-RELECTURE-2026-10-18-version-1.205.0.md`, en attente depuis le push, et cette consigne, la consigne du jour et son archive) ; Vitest complet vert ; `materiel-*` vertes dans WebKit ; la demande de relecture courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-7-rattacher.md`. **Puis arrête-toi.**
