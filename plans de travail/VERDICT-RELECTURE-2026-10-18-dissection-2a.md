# Verdict de relecture – la dissection, lot 2a : créer sa grille en points

> Cowork, dimanche 18 octobre 2026, 08 h 29 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-2a.md` (commit `903e7706`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, avec trois corrections avant le lot 2b (C1 à C3).** Le chemin d'écriture unique, les refus écrits à côté du bouton et l'échec qu'on peut réessayer sont justes. Tes cinq suppositions sont acceptées.

## C1 – l'ordre des réponses (ta trouvaille 1) : décision de Cowork

Ce n'est pas d'abord une question de mots : JavaScript range les clés entières avant les autres, et `JSON.parse` en fait autant, donc l'ordre de l'enseignant est perdu dans l'objet même. Il faut des clés qui ne soient pas des entiers.

**Correction** : quand les points écrits d'une réponse sont un nombre seul, la clé prend l'unité, au singulier sous 2 (« 0 point », « 0,5 point », « 1 point », « 1,5 point », « 2 points »). Les autres écritures (« 3-4 », « /2 ») restent telles quelles. Textes provisoires, inventaire de l'étape 3.

**Preuve** : banc (b), `Object.keys(parNiveau)` dans l'ordre de lecture, avant et après un aller-retour `JSON` ; la spec WebKit les retrouve dans cet ordre dans Grilles de critères. Break-test : sans l'unité, rouge.

Les niveaux nommés par un nombre seul (« 1 », « 2 », « 3 ») ont le même défaut, mais leur nom tel qu'écrit est une décision de Grégoire (7 h 31) : **inscris-le au BACKLOG**, sans le corriger aujourd'hui.

## C2 – « % » sur une grille en points (ta trouvaille 2) : décision de Cowork

« La voir dans Grilles de critères » mène tout droit à « 30% » et « Pond. (%) » : c'est le premier écran que la communauté verra après avoir créé sa grille lundi. Le défaut date de la 1.203, mais il se corrige maintenant.

**Correction, d'affichage seulement** (aucun calcul ne change) : dans Grilles de critères, pour une grille dont **tous** les critères sont `analytique`, le total et la colonne de pondération disent des points, et l'avertissement « ses critères totalisent N %, pas 100 % » ne se lève pas. Une grille mixte garde l'affichage actuel : inscris-la au BACKLOG. Mesure d'abord tous les endroits (Cowork en compte au moins huit dans `grilles.js` : l. 828-830, 913, 1270-1275, 1430, 3352, 3416, 4569-4571, 4790, 4840-4848).

**Preuve** : la spec du lot 2a vérifie qu'aucun « % » ne suit le total de la grille créée ; une grille de l'éditeur en pourcentages garde son « % » (banc existant ou essai neuf). Break-test.

**Si C2 ne passe pas au vert en deux essais**, abandonne-la (rien de commité dans `grilles.js`), inscris-la au BACKLOG et dis-le dans ton rapport : la porte de lundi la montrera.

## C3 – le nom déjà pris (ta trouvaille 3) : décision de Grégoire, 8 h 28

Grégoire a retenu la recommandation de Cowork : **un champ « Nom de ta grille », au-dessus de « Créer ma grille »**, prérempli avec le texte étiqueté Titre, modifiable sur place.

- Tant que l'enseignant n'y a pas touché, le champ suit les étiquettes Titre ; dès qu'il l'a modifié, son texte l'emporte.
- Vide : la raison « un nom pour ta grille » remplace celle du Titre. Déjà pris : la raison existante de `calculs`, à côté du champ, qu'il corrige sur place.
- Le nom passe au modèle par le champ, jamais par du HTML ; `maxlength` à `A.MAX_NOM` ; champ d'au moins 44 px et texte à 16 px au moins (l'iPad ne zoome pas) ; `id` stable.
- Aucun « (2) » ajouté automatiquement : c'est la raison du choix (le nom s'imprime sur le PDF des étudiant·es).
- Libellé et raisons : provisoires, inventaire de l'étape 3.

**Preuve** : spec WebKit, créer l'exemple, puis le recréer : refusé avec la raison, le nom changé dans le champ, créé ; les deux grilles dans Grilles de critères. Vitest : le champ prérempli, le champ qui l'emporte une fois modifié, le champ vide.

## Ta trouvaille 4 (la description au partage)

Commentée, laissée de côté : d'accord.

## Ta trouvaille 5 (« sur 30 »)

À l'étape 3, avec les autres mots.

## La suite

C1, C2 et C3, un commit ; Vitest complet vert ; les specs `materiel-*` et celles de Grilles de critères touchées, vertes dans WebKit. Puis arrête-toi : pas de nouvelle relecture, ton rapport suffit. Le lot 2b suit dans sa propre consigne.
