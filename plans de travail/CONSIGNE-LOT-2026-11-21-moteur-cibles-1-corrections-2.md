Pour Claude Code — secondes corrections du premier geste de « Par standards » (lot 1), d'après la relecture de Grégoire du 21 nov. 2026 à 7 h 42

Branche : lot/moteur-cibles-1-cibles (tête attendue 0d9a408). Même cadre : PR n° 44 en brouillon, rien dans main, aucune release, RELAIS.md de main non touché. Ne commence pas le lot 2.

1. ACCEPTÉS TELS QUELS par Grégoire : G3, G4, G6, G7, G8, et la ligne de Nouvelles (G9 de ma page : « Le badge de la pratique « Par sélection de productions » s'appelle maintenant « SEL » (il disait « STD »), et prend la couleur sarcelle. « STD » désigne désormais la nouvelle pratique « Par standards ». Tes pratiques, tes réglages et tes notes ne changent pas. »). La ligne de Nouvelles reste hors du changelog jusqu'à la release.

2. LA RÈGLE NOUVELLE (remarque de Grégoire, 21 nov., 7 h 42 ; décision à 7 h 44) : « La preuve n'est pas faite que SEL est vraiment une PAN. On dirait une pratique hybride entre PAN et SOM. Demeurons prudent dans l'affirmation. » Donc : l'application n'affirme plus que la pratique « Par sélection de productions » est une PAN, et n'affirme pas non plus qu'elle n'en est pas une, ni qu'elle est hybride. Aucun texte ne doit dire « PAN » de cette pratique. Origine à inscrire : choix de Grégoire, 21 nov. 2026 ; les sources ne tranchent pas.

3. LES TEXTES QUI EN DÉCOULENT.
- Le nom de famille de l'ancienne pratique, partout où il s'affiche (bibliothèque, ligne sous le titre de la fiche, et tout autre endroit que tu mesures) : « Par sélection de productions ». Plus de « PAN-Standards », plus de « (Standards-Based Grading) », plus de préfixe « PAN – ».
- Les textes du renommage du 20 nov. qui portaient le préfixe changent (numéros de claude/renommage-selection-textes, repris dans plans de travail/TEXTES-2026-11-20-selection-de-productions.md) : 8, 10, 17 et 19 deviennent « Par sélection de productions » ; 12 devient « Configuration – Par sélection de productions » ; 18 devient « Par sélection de productions : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » … » (le reste de la phrase inchangé).
- G1 (bulle du badge SEL) : « Par sélection de productions : des niveaux (ex. I-D-M-E) ; la note retient certaines productions. »
- G2 (bulle du badge PAN) : « Pratique alternative de notation. » (sans liste de sigles).
- G5 (bulle de « Type de pratique ») : « SOM = sommative (moyenne pondérée traditionnelle), STD = PAN par standards (un niveau par cible d'apprentissage), SEL = par sélection de productions (la note retient certaines productions), SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation). »

4. À MESURER, SANS Y TOUCHER. Le badge « PAN » s'affiche-t-il aujourd'hui sur une pratique de la famille SEL, et où ? Le retirer serait aussi une affirmation : rends la mesure (les endroits, la condition d'affichage dans le code), et ne change rien à cette logique. Grégoire tranchera.

5. À MESURER AUSSI : tous les endroits AFFICHÉS où l'ancienne pratique est encore dite « PAN » ou « PAN-Standards » (js/etudiants.js, l'aide des indices ; la note de l'Exploration dans js/comparateur-pratiques.js ; js/donnees-v2.js ; le gabarit de grille ; l'aide, le glossaire, le guide pédagogique). Corrige ceux qui nomment la famille à l'écran d'un simple remplacement par « Par sélection de productions » quand la phrase reste juste ; laisse ceux qui demandent une réécriture (définitions du glossaire, fenêtre d'aide, guide pédagogique) et rends-en la liste avec la phrase en cause. Les Nouvelles déjà publiées ne changent pas. Source ou stock : dis ce qui reste dans les données des gens (une pratique déjà nommée « PAN-Standards » chez quelqu'un garde son nom ; rien n'est réécrit).

6. PREUVE ATTENDUE. Bancs complets ; garde des notes rejouée (16/16) ; un essai qui échoue si « PAN » ou « Standards » s'affiche dans le nom de la famille SEL aux endroits que tu as corrigés, avec son break-test ; captures de la bibliothèque et des deux fiches, aux deux tailles et dans les deux thèmes. Dis ce que tu n'as pas pu voir.

7. RAPPORT, même format (COMMITS, CORRIGÉ, LAISSÉ, BANCS, GARDE 0, À G., SURPRIS, NON VU, RELAIS), avec la mesure du badge PAN (point 4) et la liste des phrases laissées (point 5).
