Pour Claude Code — corrections du premier geste de « Par standards » (lot 1), d'après la relecture de Grégoire du 21 nov. 2026

Branche : lot/moteur-cibles-1-cibles (tête attendue 7f6fe45). Travaille dessus, pousse, garde la PR n° 44 en brouillon. Rien dans main, aucune release, RELAIS.md de main non touché.

CONTEXTE. Grégoire a relu les 80 textes et les 4 questions de « plans de travail/TEXTES-2026-11-20-par-standards-lot-1.md ». Tous sont acceptés tels quels, sauf ce qui suit. Ses décisions du 21 nov. portent leur origine : « choix de Grégoire, 21 nov. 2026 ».

1. LES SIGLES (décision de Grégoire, 6 h 56). Le sigle suit le nom. À l'écran, « STD » désigne désormais la nouvelle pratique « Par standards » ; la pratique « Par sélection de productions » s'affiche « SEL ». « CIB » ne s'affiche nulle part. C'est un changement d'AFFICHAGE seulement : aucune donnée d'utilisateur n'est réécrite, les clés et identifiants internes des deux familles restent ce qu'ils sont (tu choisis la façon la plus sûre de séparer l'identifiant interne du sigle affiché, et tu le dis en une ligne). Mesure d'abord tous les endroits où le sigle de l'ancienne famille s'affiche (badges, bulles, cartes de l'assistant, fiche, bibliothèque, Comparateur, Exploration, aide, glossaire, exports) et rends la liste dans ton rapport, avec ce que tu as changé et ce que tu as laissé. Aucun endroit ne doit montrer « STD » pour l'ancienne pratique une fois le lot fini ; si l'aide ou le glossaire sortent du périmètre, dis lesquels.

2. LES COULEURS (décision de Grégoire, 6 h 59). « Par standards » (badge STD) garde la couleur actuelle du badge STD : pour lui, STD reste pareil à l'écran, c'est le moteur derrière qui change. « Par sélection de productions » (badge SEL) prend la sarcelle #0e9384 (--cib-sarcelle, à renommer si le nom de la variable devient trompeur). Vérifie le contraste dans les deux thèmes.

3. LES TEXTES QUI CHANGENT.
- A4 (description de la carte « Comment calcules-tu la note finale ? »), version de Grégoire : « Tu inscris, pour chaque cible du cours, le niveau que l'étudiant·e a démontré. La note vient des niveaux de chaque cible. »
- A5 : « Choisis directement ta famille de pratique (SOM, STD, SEL, SPE ou DEN) et passe à sa configuration. »
- E1 (badge du récapitulatif) : « STD ».
- F3 (bulle du badge STD), sans tiret cadratin : « Par standards : un niveau par cible d'apprentissage du cours ; la note viendra du meilleur niveau démontré pour chaque cible. »
- Les textes du renommage déjà acceptés (lot/renommer-selection-productions) ne changent pas, sauf là où un sigle s'affiche : il devient « SEL ».

4. CE QUI EST CONFIRMÉ, pour que tu n'y reviennes pas. L'échelle de départ à cinq niveaux reste, comme point de départ facultatif et modifiable ; ses noms sont acceptés (« Ça y est presque » sans point d'exclamation) ; l'enseignant·e reste libre de choisir n'importe quelle échelle, son nombre de niveaux et ses noms : rien n'est codé en dur, vérifie-le par un essai avec une échelle à trois niveaux et une à six. Les plages à mi-chemin sont acceptées. Une cible sans critère est acceptée (texte F8). Les options vides des menus gardent leurs tirets, comme ailleurs dans l'application.

5. TROIS POINTS TECHNIQUES, tranchés par Cowork.
- Le banc des noms réels rougit sur le nom d'une coautrice du rapport PAREA cité dans la fiche de conception. Ne touche pas au banc : dans la fiche et partout où ce nom fait rougir, cite « Cormier et al. (2026) ». Le banc doit revenir au vert sans --no-verify.
- Une fixture d'étudiant·e porte le prénom d'un collègue de Grégoire (« Bruno ») dans des bancs : remplace-la par un nom manifestement fictif.
- Les 24 erreurs non gérées « db is not defined », antérieures au lot : inscris-les (issue 2 de CLAUDE.md), ne les corrige pas ici.

6. PREUVE ATTENDUE. Bancs complets ; la garde des notes actuelles rejouée (16/16, aucune note existante ne bouge) ; un essai qui échoue si « STD » s'affiche pour l'ancienne famille ou si « CIB » s'affiche quelque part, avec son break-test ; captures aux deux tailles et dans les deux thèmes de la carte de l'assistant, du récapitulatif, de la fiche et de la bibliothèque avec une pratique de chaque famille. Dis ce que tu n'as pas pu voir (WebKit, Safari).

7. RAPPORT, dans le même format que celui du lot 1 (lignes COMMITS, FORME, CORRIGÉ, BANCS, GARDE 0, À G., SURPRIS, NON VU, RELAIS), avec en plus : la liste mesurée des endroits où un sigle s'affiche ; ce que tu as supposé ; une ligne de Nouvelles PROPOSÉE pour le changement de sigle de l'ancienne pratique (une personne qui avait un badge « STD » verra « SEL »), à faire valider par Grégoire, non écrite dans le changelog.

Ne commence pas le lot 2 (inscrire un niveau) : son mandat suivra.
