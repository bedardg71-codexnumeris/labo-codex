# Consigne – Les chaînes d'étapes, lot 3a : le composant commun, l'option « Afficher les chaînes d'étapes », la chaîne des grilles (#1149)

> Écrite par Cowork le samedi 24 octobre 2026 à 19 h 15 (Toronto), sur `main` = `c320a977`. Plan : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 3, première moitié (3a). Les lots 1 et 2 (menus déroulants) sont acceptés.
> **Les étapes de la chaîne des grilles sont validées par Grégoire** (24 oct., 19 h 04 : « tel quel »). Les chaînes des autres outils (échelles, cartouches, productions, pratiques) attendent sa validation : elles feront le lot 3b.

## 0. Avant tout — d'autres sessions travaillent en même temps

- Ce lot touche `index.html` et `styles.css`, que d'autres lots du jour touchent aussi (la refonte de l'Aide, #1152 ; la consigne `CONSIGNE-LOT-2026-10-24-noms-reels-tests.md`). **Un seul lot à la fois** : ne commence que lorsque le lot en cours est commité, sur un `main` à jour, et qu'aucune suite ne tourne (règles du travail en parallèle, `PROTOCOLE.md`). Si tu trouves dans les fichiers nommés au § 3 des changements non commités d'une autre session, arrête et dis-le.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, la ligne du plan, `BACKLOG.md` (la note de #1149).
- **Les fichiers de ce lot sont ceux du § 3.** Un autre fichier à toucher : dis lequel et pourquoi dans la demande de relecture.

## 1. Ce que le lot livre, en gestes

1. **Réglages › Préférences › Expérience visuelle** : une case **« Afficher les chaînes d'étapes »**, cochée par défaut, sous « Informations contextuelles (graphiques) ». Sa ligne d'aide (mots de Cowork, à valider par Grégoire à la relecture) : **« Montre, en haut de chaque outil, les étapes qui le rendent prêt à servir. »** Décochée, aucune chaîne ne s'affiche, **celle du Trimestre comprise** ; recochée, elles reviennent, sans recharger la page. Le choix survit au rechargement.
2. **Cadre › Trimestre** : la barre des étapes (`#barreConvergence`) ne change ni d'apparence ni de comportement (le clic ouvre l'accordéon et y descend). Elle est seulement dessinée par le composant commun (§ 2).
3. **Conception › Grilles de critères** : quand une grille est ouverte, ou en création, **entre la rangée de sélection et la fiche**, la chaîne de la grille, au dessin de la barre du Trimestre :

| Étape | Réglée quand | Sous l'étape |
|---|---|---|
| **Critères** | la grille a au moins un critère dont le nom n'est pas vide | « 5 critères » ; « 1 critère » ; « aucun » |
| **Pondération** | les pondérations totalisent 100 % ; une grille entièrement en points (`GabaritsUtils.grilleEntierementEnPoints`) est réglée | « 100 % » ; « 85 % » ou « 110 % » **dans la couleur du total affiché** (non réglée, § 2.6) ; « en points » |
| **Production** (point d'arrivée : le nœud plus grand, comme « Groupe-cours ») | au moins une production du trimestre actif a cette grille (`grilleId`) | « 2 prod. » ; « 1 prod. » ; « aucune » |

   - Aucune grille ouverte : aucune chaîne.
   - **La chaîne suit la saisie** : ajouter ou retirer un critère, changer une pondération la met à jour au même moment que le total affiché (`#totalPonderationAffichage`).
   - **Le clic** : « Critères » descend à la liste des critères ; « Pondération » descend au total ; « Production » ouvre Conception › Productions étudiantes par la navigation existante (`window.afficherSousSection`). **`js/navigation.js` est une zone protégée : on l'appelle, on ne le modifie pas.** Si ouvrir les productions exigeait de le modifier, l'étape « Production » n'est pas cliquable ; dis-le.

## 2. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **Un seul composant**, nouveau fichier à ton choix (par exemple `js/chaine-etapes.js`). Il reçoit un conteneur, la liste des étapes (`id`, libellé, info, réglée, en attention, point d'arrivée) et l'action du clic ; il dessine les classes de la barre du Trimestre (`.barre-convergence`, `.bc-*`, styles.css l. ~5828-6017). **La barre du Trimestre passe par lui** (zéro dette) : son HTML statique d'`index.html` devient le conteneur, `mettreAJourBarreContexte` (`js/trimestre-v2.js` l. ~549) lui passe ses six étapes, et **le gestionnaire de clic posé sur tout le document** (`trimestre-v2.js` l. ~610, `e.target.closest('.bc-etape')`) entre dans le composant : laissé là, il attraperait les clics de la chaîne des grilles.
2. **Un état neuf, « en attention »** : seulement pour la pondération différente de 100 %. L'info passe en orange (`--orange-accent`) ; le nœud reste non réglé. Contraste vérifié dans les deux modes.
3. **L'option** : la préférence `afficherChainesEtapes`, `true` par défaut (`js/preferences.js`, les défauts l. ~60-75), lue et écrite par `js/preferences-v2.js` comme sa voisine `afficherContexteGraphiques` (l. ~130, ~337). Appliquée au démarrage et à chaque changement par une classe sur `<body>` qui masque toutes les `.barre-convergence`. ⚠ **#806** : `sauvegarderPreferencesV2` écrit tout le panneau à chaque changement ; la nouvelle case est synchronisée avec la préférence avant toute écriture, comme ses voisines.
4. Les liaisons : vertes entre deux étapes réglées, la dernière en pointillé tant que le point d'arrivée n'est pas réglé, comme au Trimestre.
5. Lecteur d'écran : `aria-label` du conteneur « Étapes de la grille » ; chaque étape dit son libellé, son info, et « réglée » ou « à régler ».
6. **La pondération : une seule règle pour la chaîne et pour le total** (ajout de relecture, Cowork, 19 h 20, mesuré en lecture sur `51ea3312`). Aujourd'hui, `js/grilles.js` additionne les pondérations à quatre endroits, de deux façons (`parseInt` aux l. ~831, ~1308, ~5487 ; somme brute dans `mettreAJourTotalTemp`, l. ~5223), et colore le total de trois façons (l. ~1468 : vert, orange sous 100, rouge au-dessus ; l. ~5228 : vert ou orange ; l. ~5494 : vert, orange sous 100, rouge au-dessus). La chaîne ne doit pas dire autre chose que le total affiché juste en dessous. Une seule fonction pure rend l'état (total, réglée, en dessous, au-dessus, en points) ; le total et la chaîne la lisent tous les deux, avec **orange sous 100 %, rouge au-dessus** (la règle majoritaire). La somme est celle de l'avertissement à l'enregistrement (l. ~831). Mesure si une pondération décimale peut se saisir : si oui, dis ce que `parseInt` en fait, sans changer la règle dans ce lot. C'est le lot qui touche ces chemins (la chaîne suit le total au même moment) : ce n'est pas une trouvaille.
7. **Le contraste de l'orange en mode clair** : `--orange-accent` y vaut `#ff6b35` (`styles.css` l. ~609), soit environ 2,5:1 sur le bleu pâle de la rangée (calculé par Cowork). Il échoue pour un texte de cette taille. Prends la teinte orange du design system qui passe 4,5:1 dans les deux modes, et dis laquelle. Même vérification pour le rouge.

## 3. Où (mesuré par Cowork en lecture, à revérifier)

- `index.html` : `#barreConvergence` (l. ~6164) ; la case des préférences, à côté de `#v2-pref-contexte-graphiques` (l. ~9236) ; l'écran des grilles, entre la `.rangee-selection` et `#conteneurEditionGrille` (l. ~5054).
- `js/trimestre-v2.js` (l. ~541-630) ; `js/preferences.js` ; `js/preferences-v2.js` ; `js/grilles.js` (ouverture, création et fermeture d'une grille : les sites de `MenuSelection.marquer`, l. ~3384, ~5817, ~5937 ; les mises à jour du total, l. ~3377, ~5224, ~5477) ; le nouveau fichier du composant.
- `styles.css` : `.barre-convergence` et `.bc-*` (l. ~5828-6017), l'état « en attention », la classe qui masque.
- En lecture seule : `js/gabarits-utils.js`, `getCleProductions`.

## 4. Pièges connus

1. **Les sessions en parallèle** : voir § 0.
2. La barre du Trimestre a ses essais (`barre-convergence-suit-les-enregistrements-918.spec.js`, et un `grep` de `barreConvergence` et `bc-etape`) : ils restent verts sans être réécrits, sauf ce que le passage par le composant oblige ; dis lesquels.
3. Une grille **en création**, pas encore enregistrée : la chaîne lit le formulaire, pas le stockage.
4. Une grille d'exemple en lecture seule : la chaîne s'affiche et se lit ; ses clics descendent quand même.
5. Le compte des productions : celles du trimestre actif seulement, avec les filtres d'affichage des autres écrans (mode démo) ; mesure-les.
6. iPad 820 px : la barre défile à l'horizontale comme celle du Trimestre ; 44 px au doigt.
7. Sécurité : les infos passent par `textContent` (règle 1) ; aucun gestionnaire en ligne (règle 2).
8. **Stock** : une préférence neuve ; absente, elle vaut `true`. Rien à migrer : dis-le.
9. Les nombres : « 85 % » avec l'espace insécable de la norme française (#1137), par le formateur commun.

## 5. Preuve exigée

- **Vitest** : le composant (dessin, réglée, en attention, point d'arrivée, liaisons, `aria-label`, une info piégée rendue en texte) ; la fonction qui tire les trois étapes d'une grille et des productions (fonction pure), avec ces cas : aucun critère, un critère sans nom, 85 %, 110 %, 100 %, en points, zéro, une et deux productions. Break-test.
- **Playwright (WebKit)** : la barre du Trimestre inchangée (états et ouverture de l'accordéon) ; Grilles : la grille ouverte montre ses trois étapes et leurs infos ; changer une pondération passe à l'orange puis au vert sans recharger ; ajouter un critère change le compte ; « Production » ouvre les productions (ou n'est pas cliquable, § 1) ; la case décochée efface toutes les chaînes (Trimestre et Grilles), recochée les rend, et le choix survit au rechargement ; iPad 820 px pour Grilles.
- **Captures** : Grilles (une grille réglée, une à 85 %), Trimestre, Préférences ; 1440 et 820 px ; modes clair et sombre.
- Portes terrain : skill `portes-terrain`.

## 6. Ce qui n'entre pas

Les chaînes des échelles, cartouches, productions et pratiques (lot 3b, après validation de leurs étapes par Grégoire) ; le critère algorithmique (lot 4) ; la Carte d'alignement.

## 7. Clôture

- #1149 **reste ouverte** : la fiche note « 3a fait (commit) ».
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-chaines-etapes-3a.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
