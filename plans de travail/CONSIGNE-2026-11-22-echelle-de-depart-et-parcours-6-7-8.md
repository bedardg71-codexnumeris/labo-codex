Pour Claude Code (session du cloud), à relayer : l'échelle de départ identique à celle de Grégoire, puis les parcours 7, 8 et 6 (« Je regarde ») dans le moule du 20 nov.

BRANCHE. Pars de `origin/claude/parcours-apres-par-standards-il5v0i` (= `a440e7ae`, PR n° 53). Si `origin/main` a avancé depuis `78e95229`, réunis-le d'abord (`git merge --no-ff origin/main`, mêmes règles de conflit que le 22 nov. au matin). Sur ta propre branche ; PR en brouillon « APERÇU, ne pas fusionner » ; écris dans le rapport l'adresse « Deploy Preview ». Ni fusion dans main, ni release, ni bump, ni changelog. Les commits « BRANCHE SEULEMENT » qui ouvrent les parcours restent. Le dépôt est public : aucun nom réel. Ordre du travail : 1, puis 2, puis 3 à 5. Si le temps manque, livre 1 et 2 complets, puis les parcours dans l'ordre 7, 8, 6, et dis où tu t'arrêtes.

PREMIER COMMIT. Copie cette consigne telle quelle dans `plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md`.

CONVENTIONS DES TEXTES. Tous les textes entre « Début » et « Fin » sont validés par Grégoire le 22 nov. 2026, mot pour mot : aucune retouche. « (petit) » : la ligne en petit au-dessus du titre (l'entrée « Parcours N · Nom · Temps » à la première bulle, la confirmation « C'est fait : … » ensuite). « → » : un geste ; « →→ » : le geste principal, en gras. « Puis : » : la bulle change de forme après le geste. Un texte entre crochets [ ] est à remplir d'après l'écran, selon la consigne donnée. La forme est celle du moule du 20 nov. (ta consigne `CONSIGNE-2026-11-20-essai-parcours.md`, sections A et D) : entrée, phrase de la poignée, objectif à la première bulle, phrase du lieu, explications sans marque, gestes marqués, objectif atteint entre deux filets à la dernière, « Suite suggérée », boutons de même poids.

1. L'« ÉCHELLE DE DÉPART (IDME) » DEVIENT IDENTIQUE À CELLE DE GRÉGOIRE (remplace la section B de ta consigne du 22 nov. au matin ; décision de Grégoire, 22 nov., 12 h 27, d'après ton rapport, § B0.4, piste a).
1.1 À la source seulement (`niveauxDefaut`, `js/echelles.js`) : le premier niveau devient « 0 – Aucun », le non recevable, bâti comme le niveau « 0 » de l'échelle « IDME et niv 0 » de la démo (aucun pourcentage ne le donne) ; « I » commence à 0 % au lieu de 40 %. Le niveau « PS – Préstructurel » n'est plus semé. Ne changent pas : les noms des quatre autres niveaux, leurs autres bornes, leurs valeurs (40, 65, 75, 100), leurs couleurs. Conséquence connue et acceptée par Grégoire : dans un trimestre neuf, un critère à 30 % reçoit « I » (valeur 40) au lieu de « PS » (valeur 0).
1.2 AUCUN CALCUL N'EST MODIFIÉ. Les sept endroits qui écartent le code « 0 » et les deux qui lisent « PS » restent tels quels : un trimestre déjà installé garde « PS – Préstructurel » et ses comptes. Garde : rejoue la garde des notes (`lot/moteur-cibles-0-garde`) et vérifie qu'aucune échelle déjà semée n'est réécrite (tarir, pas réparer). Si un effet déborde le semis d'un trimestre neuf, arrête-toi pour ce point et rapporte.
1.3 Ce que « I » dit de lui-même dans l'échelle semée (sa description, son palier SOLO) : mesure ce qu'il porte aujourd'hui (« Unistructurel ») et ce que porte le « I » de la démo ; ne change rien, rapporte les deux, c'est un mot de Grégoire.
1.4 Les cinq textes, validés le 22 nov., inchangés depuis ta consigne du matin : B1 (description de l'échelle : « Cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu. ») ; B2 (carte d'aide, première rangée : « 0 – Aucun » et, en face, « L'évaluation n'est pas possible (aucune donnée, plagiat, usage interdit de l'IA). ») ; B3 (guide SOLO : « I ↔ Unistructurel, D ↔ Multistructurel, M ↔ Relationnel, E ↔ Abstrait étendu. Le niveau 0, « Aucun », sert quand l'évaluation n'est pas possible. ») ; B4 (définition du terme : « « 0 – Aucun » en tête ») ; B5 (« Cartouche de départ » : la colonne « PS » devient la colonne « 0 », ses quatre commentaires deviennent « L'évaluation n'est pas possible. » ; les quatre retirés sont déjà dans ton rapport du matin).
1.5 Fais suivre les bancs qui citent « PS » ou « Préstructurel » pour l'échelle de départ d'un trimestre neuf. Vérifie que la bulle 4 du « Nous faisons » du parcours 3 dit maintenant ce que l'écran affiche.

2. MESURES À L'ÉCRAN, DANS LA DÉMO, AVANT DE CODER LE PARCOURS 7 (au navigateur, deuxième groupe, après les modèles des parcours 2, 3 et 4, puis une évaluation D, I, I, I posée sur la production de Tapir Doux : Structure D, Rigueur I, Plausibilité I, Nuance I). Rapporte chaque réponse, avec ce que l'écran affiche mot pour mot.
M1. Sur la bande « Performance (P) », le point de Tapir Doux paraît-il, et est-il à l'écart des autres ?
M2. Dans le panneau des noms : son P est-il le plus bas du groupe, son A et son C au plus haut ? Les bandes s'appellent-elles « Assiduité (A) » et « Complétion (C) » ?
M3. Dans son profil, « Engagement ACP » : que disent Assiduité et Complétion ?
M4. Dans « Accompagnement », la carte « Modèle de la Réponse à l'intervention (RàI) » : quel niveau, quelle phrase sous le niveau, et que dit « Défi principal : » (paraît-il) ?
M5. « + Nouvelle intervention » : quel niveau la fiche propose-t-elle, quels critères coche-t-elle d'avance, son nom est-il déjà coché ?
M6. La case qui reporte les présences d'une intervention « Complétée » : que fait-elle exactement ?
Règle pour les bulles : là où une bulle validée affirme un de ces faits et que l'écran dit autre chose, NE RÉÉCRIS PAS la bulle : code-la telle quelle, et liste l'écart dans le rapport sous « Les mots qui ne tiennent pas à l'écran ». Le plan de Grégoire est au niveau 3 et cible la rigueur : si la fiche propose autre chose, « Remplir » pose quand même son plan.

3. PARCOURS 7, « LIRE TA CLASSE ET INTERVENIR » (`js/parcours-lire-ta-classe.js`). Deux temps neufs ; les neuf textes du 8 nov. et leur sentinelle sont remplacés.

3.1 « JE REGARDE », huit bulles, dans la démo, sur le deuxième groupe. Refus du panneau sans les modèles des parcours 2, 3 et 4 (propose les mots du refus dans le rapport, sur le modèle de celui d'« Évaluer » ; pose-les dans l'aperçu). « Remplir » de la bulle 1 pose l'évaluation D, I, I, I de Tapir Doux (DA 9900005), rattachée à sa production déjà importée si c'est possible, sinon dis-le. « Remplir » de la bulle 6 pose le plan ci-dessous. Tout reste dans la démo ; défaire retire l'évaluation et l'intervention ; break-test du confinement.

Début.
BULLE 1 sur 8 · « Ta classe d'un coup d'œil »
(petit) Parcours 7 · Lire ta classe et intervenir · Je regarde
À la fin de ce parcours, tu seras en mesure d'expliquer comment tu passes, dans l'application, d'un signal dans ta classe à une intervention que tu décides et que tu prépares.
Tu es dans « Suivi », à l'onglet « Groupe » : c'est là que tu vois où en est chaque étudiant·e de ton groupe.
Dans la démo, tu regardes ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données.
Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », le suivi de tes cibles viendra dans une prochaine version.
Tu sais déjà, en rendant des productions évaluées, qui a eu de la difficulté. Ici, l'application garde ces résultats en mémoire et les met sous tes yeux avant le prochain cours.
Chaque point blanc est un·e étudiant·e. Dans ce parcours, on regarde surtout la bande « Performance (P) » : elle vient des évaluations.
Tapir Doux t'a remis sa production, mais elle n'est pas encore évaluée : il n'a pas de point sur cette bande.
→→ Regarde l'exemple se remplir : touche « Remplir »
Puis :
L'exemple vient d'évaluer la production de Tapir Doux : D pour la structure, I pour les trois autres critères.
Sur la bande « Performance (P) », son point vient d'apparaître, à l'écart des autres.
→→ Touche « Détails » pour mettre un nom sur chaque point

BULLE 2 sur 8 · « Qui s'écarte ? »
(petit) C'est fait : chaque point a maintenant un nom.
À côté de chaque nom, trois pastilles : A pour l'assiduité, C pour la complétion (les productions remises), P pour la performance.
Ce sont des indices : des pourcentages que l'application calcule à partir de ce que tu saisis.
Une pastille colorée signale un indice sous un seuil. Les seuils de la démo sont déjà posés ; avec ta classe, c'est toi qui les règles.
Regarde la ligne « Doux, Tapir » : son A et son C sont au plus haut, son P est le plus bas du groupe.
Repérer ainsi qui pourrait avoir besoin d'une première aide sans l'avoir demandée, c'est ce qu'on appelle le dépistage.
→→ Touche le P de Tapir Doux : son profil rassemble ce que l'application a gardé de lui

BULLE 3 sur 8 · « Ce qui l'écarte »
(petit) C'est fait : le profil de Tapir Doux est ouvert.
Tu es dans « Suivi », à l'onglet « Profils » : c'est là que tu retrouves ce que l'application garde sur chaque étudiant·e.
Le profil s'ouvre sur « Engagement ACP » : A, C et P, les mêmes lettres que les pastilles.
Assiduité : aucune absence, aucun retard.
Complétion : toutes les productions sont remises.
Tapir Doux vient au cours et remet ce que tu demandes. Ce n'est pas son engagement qui l'écarte : c'est ce que sa production montre.
Sans son évaluation gardée en mémoire, rien ne l'aurait signalé : il est présent, il remet son travail, il ne demande rien.
→→ Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire

BULLE 4 sur 8 · « De quoi il a besoin »
(petit) C'est fait : tu as ouvert « Accompagnement ».
La carte « Contexte d'apprentissage » résume son assiduité et sa complétion : rien ne l'arrête de ce côté.
La carte « Modèle de la Réponse à l'intervention (RàI) » dose l'aide en trois niveaux : au niveau 1, ton enseignement en classe suffit ; au niveau 2, une aide préventive s'ajoute, souvent en petit groupe ; au niveau 3, l'aide devient intensive et souvent individuelle.
Elle situe Tapir Doux au [niveau affiché] : [la phrase que la carte affiche].
« Défi principal : [le critère affiché] ». Le défi, c'est le critère de la grille où ses résultats sont les plus bas.
Le niveau indique l'intensité de l'aide requise par ton étudiant·e ; le défi dit où porter cette aide, concrètement.
Mais l'intervention, c'est toi qui la décides et c'est toi qui la prépares.
→→ Touche « Continuer »
(Les deux lignes à crochets : remplis-les avec ce que M4 a montré, mot pour mot, et rapporte-les ; Grégoire les relira. Si « Défi principal : » ne paraît pas, retire cette ligne dans l'aperçu et dis-le.)

BULLE 5 sur 8 · « Ouvrir l'intervention »
(petit) C'est fait : tu as lu son niveau et son défi.
Une intervention, c'est ce que tu fais de plus pour un·e étudiant·e : une rencontre à ton bureau, une reprise en petit groupe. Tu en fais déjà ; ici, tu peux en garder la trace.
La noter est facultatif : tu peux utiliser l'application sans le faire.
Notée, elle te rend deux services : elle garde ce que tu as fait et elle fige un « avant » de ses résultats, pour que tu voies ensuite s'ils ont bougé.
Sous les cartes, « HISTORIQUE » rassemblera ses interventions. Pour l'instant, il n'y en a aucune.
→→ Touche « + Nouvelle intervention »

BULLE 6 sur 8 · « Ton plan »
(petit) C'est fait : une fiche est ouverte, « Planifier une intervention ».
Tu es dans « Suivi », à l'onglet « Interventions » : c'est là que tu prépares tes interventions et que tu les retrouves.
Sous « Marquer les présences et notes individuelles », Tapir Doux est déjà coché.
La date d'aujourd'hui est déjà inscrite ; avec ta classe, tu y mets le jour de la rencontre.
→→ Regarde l'exemple se remplir : touche « Remplir »
Puis :
« Titre : » : « Rencontre individuelle : de la lecture à l'interprétation ».
« Niveau RàI : » : « Niveau 3 – Intensif, individuel », pour une période. Le niveau d'une intervention, c'est toi qui le choisis.
« Description (optionnel) : » : le plan de la rencontre, un constat puis cinq étapes.
« Critères ciblés » : seule la rigueur reste cochée. On n'agit pas sur tout à la fois : l'exemple choisit un seul critère.
« Objectif visé » : ce que tu espères voir changer.
→ Lis le plan
→→ Touche « Créer l'intervention »

BULLE 7 sur 8 · « Après l'intervention »
(petit) C'est fait : l'intervention est créée. Son statut est « En préparation ».
Ce qui suit, tu le feras après la rencontre. Dans la démo, on le lit sans le faire.
Tu rouvres la fiche (à l'onglet « Interventions », par le bouton « Ouvrir »), tu coches sa présence et tu notes ce que tu as observé sous « Observations générales ».
Tu choisis ensuite « Complétée » : le « Bilan post-intervention » apparaît. Pour chaque critère ciblé, il compare ses résultats avant et après.
Une remontée n'est qu'un signe : qui part du plus bas remonte souvent un peu, même sans intervention.
→→ Touche « Continuer »

BULLE 8 sur 8 · « La suite »
(petit) C'est fait : tu as vu ce qui suit une intervention.
L'application n'a rien décidé à ta place : elle a gardé des gestes que tu fais déjà et les a mis sous tes yeux, du point à l'écart jusqu'au plan pour une personne.
Elle rend visible et explicite ce qui est parfois sous-entendu et silencieux.
Objectif atteint : tu es en mesure d'expliquer comment tu passes, dans l'application, d'un signal dans ta classe à une intervention que tu décides et que tu prépares.
Suite suggérée : le parcours 8, « Automatiser tes commentaires ». Boutons : « Le refaire avec ma classe », « Voir le parcours 8 », « Terminer ».
Fin.

CE QUE « REMPLIR » ÉCRIT DANS LA FICHE (bulle 6), plan de Grégoire validé le 15 nov., mot pour mot. Titre : « Rencontre individuelle : de la lecture à l'interprétation ». Niveau 3. Tapir Doux seul. Durée : une période. Critère ciblé : Rigueur seulement. Objectif visé : « Appliquer trois stratégies de lecture à « Deux-Rives » et en tirer une HOC formulée en une phrase. » Description, chaque ligne numérotée sur sa propre ligne : « Constat : il surligne de longs passages sans rien écrire, n'applique que deux stratégies et réagit au texte plutôt que de l'interpréter. 1. Reprendre un passage qu'il a surligné en entier (le portrait d'Aurore-Délia) : quels traits du personnage y lit-on ? Écrire chacun dans la marge. 2. Changer une réaction en observation : devant « Personne en pose », il a écrit « triste :( ». Qu'est-ce qui, dans la phrase, produit cet effet ? 3. Appliquer la stratégie qui manque, la temporalité : que disent le calendrier de novembre 2011 et « depuis douze ans » sur la vie d'Aurore-Délia ? 4. Rapprocher deux observations : il a vu « beaucoup de novembre » ; que révèle ce motif quand on le relie aux bottes jamais déplacées ? 5. Formuler son HOC en une phrase complète, à partir de ce qu'il a relevé : « L'auteur cherche à… » »

3.2 « NOUS FAISONS », neuf bulles (huit quand une grille de dépistage est déjà désignée : la bulle 5 est sautée, le compteur reste « sur 9 »). Sur le groupe-cours de la personne ; aucun « Remplir ». Les refus du panneau restent ceux du code. Ce qui fait avancer chaque bulle reste ce que le code fait aujourd'hui pour l'étape correspondante.

Début.
BULLE 1 sur 9 · « Ta classe d'un coup d'œil »
(petit) Parcours 7 · Lire ta classe et intervenir · Nous faisons
À la fin de ce parcours, tu seras en mesure d'utiliser le suivi de ta classe pour planifier une intervention auprès d'un·e étudiant·e qui a besoin de toi.
Tu es dans « Suivi », à l'onglet « Groupe » : c'est là que tu vois où en est chaque étudiant·e de ton groupe.
Cette fois, c'est ta propre classe : ce que tu vois vient de tes présences et de tes évaluations, et l'intervention que tu créeras restera dans ton application.
Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », le suivi de tes cibles viendra dans une prochaine version.
Chaque point blanc est un·e de tes étudiant·es. Sa place sur une bande dit où il ou elle en est.
La bande « Assiduité (A) » vient de tes présences. Les deux autres, « Complétion (C) » et « Performance (P) », se remplissent à mesure que tu reçois des productions et que tu les évalues.
Les zones de couleur viennent de tes propres seuils.
→→ Touche « Détails » pour mettre un nom sur chaque point

BULLE 2 sur 9 · « Qui s'écarte ? »
(petit) C'est fait : chaque point a maintenant un nom.
À côté de chaque nom, trois pastilles : A pour l'assiduité, C pour la complétion, P pour la performance. Ce sont des indices : des pourcentages que l'application calcule à partir de ce que tu saisis.
Une pastille colorée signale un indice sous l'un de tes seuils.
Pour ne garder que les personnes qui s'écartent, touche un filtre : « A ou C < … » pour l'assiduité ou la complétion, « P < … » pour la performance (le pourcentage affiché est ton seuil). Elles remontent en tête de la liste.
Repérer ainsi qui pourrait avoir besoin d'une première aide sans l'avoir demandée, c'est ce qu'on appelle le dépistage.
→ Choisis une personne que tu veux regarder de plus près
→→ Touche son A, son C ou son P : son profil s'ouvre
(Avis quand la personne choisie n'a aucune donnée, texte du code validé le 9 nov., inchangé : « Son profil n'a encore aucune donnée que l'Accompagnement puisse lire : choisis une autre personne. »)

BULLE 3 sur 9 · « Ce qui l'écarte »
(petit) C'est fait : son profil est ouvert.
Tu es dans « Suivi », à l'onglet « Profils » : c'est là que tu retrouves ce que l'application garde sur chaque étudiant·e.
Le profil s'ouvre sur « Engagement ACP » : A, C et P, les mêmes lettres que les pastilles.
Sous Assiduité, chaque absence ou retard porte sa date. Si tu as donné un contenu à tes séances, son titre s'affiche aussi : tu sais ce qu'il ou elle a manqué.
Sous Complétion, tu vois les productions qui manquent.
Ces deux signaux arrivent avant la première évaluation : ils te permettent d'agir tôt.
Si rien n'y paraît, ce sont ses évaluations qui l'écartent.
→→ Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire

BULLE 4 sur 9 · « De quoi il ou elle a besoin »
(petit) C'est fait : tu as ouvert « Accompagnement ».
La carte « Contexte d'apprentissage » résume son assiduité et sa complétion en une phrase, avec une piste. Quand l'une ou l'autre est basse, une rencontre peut aider à comprendre ce qui se passe.
La carte « Modèle de la Réponse à l'intervention (RàI) » dose l'aide en trois niveaux : au niveau 1, ton enseignement en classe suffit ; au niveau 2, une aide préventive s'ajoute, souvent en petit groupe ; au niveau 3, l'aide devient intensive et souvent individuelle.
Elle situe ton étudiant·e à l'un de ces niveaux, d'après ses évaluations et ton seuil minimal de réussite. La phrase sous le niveau dit pourquoi.
« Défi principal : » nomme le critère de ta grille où ses résultats sont les plus bas.
Si ses productions ne montrent pas encore de difficulté, le niveau reste au 1 ou « En attente » : c'est alors le contexte qui parle.
Le niveau indique l'intensité de l'aide requise par ton étudiant·e ; le défi dit où porter cette aide, concrètement.
Mais l'intervention, c'est toi qui la décides et c'est toi qui la prépares.
→→ Touche « Continuer »

BULLE 5 sur 9 · « Ta grille de dépistage » (seulement si aucune grille n'est désignée)
(petit) C'est fait : tu as lu son niveau.
Son profil ne nomme aucun défi : l'application ne sait pas encore à quels critères comparer ses résultats.
Il lui faut ta grille de dépistage : celle dont les critères reviennent le plus souvent dans tes évaluations.
L'application reconnaît un critère à son nom : dans tes autres grilles, elle ne retient que les critères qui portent le même nom qu'un critère de celle-ci.
→→ Touche « Régler les outils d'observation »
Puis :
Tu es dans « Labo », à l'onglet « Observation » : c'est là que tu règles ce que l'application observe pour toi.
Chaque réglage s'enregistre dès que tu le changes.
→→ Choisis ta grille dans « Grille de critères pour le dépistage » (tu reviendras ensuite à son profil)

BULLE 6 sur 9 · « Ouvrir l'intervention »
(petit) C'est fait : tu as lu son niveau et son défi. (Après la bulle 5, à la place : « C'est fait : ta grille de dépistage est choisie. », suivie de la phrase du lieu « Tu es revenu·e dans « Suivi », à l'onglet « Profils ». »)
Une intervention, c'est ce que tu fais de plus pour un·e étudiant·e ou pour quelques-un·es : une rencontre à ton bureau, une reprise en petit groupe. Tu en fais déjà ; ici, tu peux en garder la trace.
La noter est facultatif : tu peux utiliser l'application sans le faire.
Notée, elle te rend deux services : elle garde ce que tu as fait et elle fige un « avant » de ses résultats, pour que tu voies ensuite s'ils ont bougé.
Sous les cartes, « HISTORIQUE » rassemblera ses interventions.
→→ Touche « + Nouvelle intervention »

BULLE 7 sur 9 · « Ton plan »
(petit) C'est fait : une fiche est ouverte, « Planifier une intervention ».
Tu es dans « Suivi », à l'onglet « Interventions » : c'est là que tu prépares tes interventions et que tu les retrouves.
Sous « Marquer les présences et notes individuelles », son nom est déjà coché.
→ Donne un titre à ton intervention, sous « Titre : »
→ Mets le jour prévu sous « Date : » (la date d'aujourd'hui y est déjà)
→ Choisis son niveau, sous « Niveau RàI : » : « Niveau 2 – Préventif, en groupe ciblé » ou « Niveau 3 – Intensif, individuel » (l'application en propose un d'après son profil ; c'est toi qui choisis)
→ Écris ton plan sous « Description (optionnel) : » : ce que tu comptes faire, en quelques lignes
→ Sous « Critères ciblés », garde cochés ceux sur lesquels tu veux agir (ce sont eux que le bilan comparera, avant et après)
→ Écris sous « Objectif visé » ce que tu espères voir changer
→→ Touche « Créer l'intervention » (ensuite, la fiche s'enregistre d'elle-même à chaque changement)
Au niveau 2, tu peux cocher d'autres étudiant·es qui partagent ce besoin, et « Contexte de l'intervention : » te demande si elle se tient pendant le cours ou dans une séance de rattrapage.
Ton intervention porte plutôt sur ses absences ou sur ses remises ? Les critères ne sont pas nécessaires : décoche-les et écris ton objectif.

BULLE 8 sur 9 · « Après l'intervention »
(petit) C'est fait : ton intervention est créée. Son statut est « En préparation ».
Ce qui suit, tu le feras une fois l'intervention donnée.
Tu rouvres la fiche (à l'onglet « Interventions », par le bouton « Ouvrir », ou depuis son profil), tu coches les personnes présentes et tu notes ce que tu as observé sous « Observations générales ».
Tu choisis ensuite « Complétée ». Une case t'offre alors de reporter ces présences dans ta saisie : c'est toi qui décides si la présence à l'intervention compense une absence au cours.
Le « Bilan post-intervention » apparaît : pour chaque critère ciblé, les résultats avant et après, puis « Objectif atteint ? » et « Suite envisagée ».
Une remontée n'est qu'un signe : qui part du plus bas remonte souvent un peu, même sans intervention.
→→ Touche « Continuer »

BULLE 9 sur 9 · « La suite »
(petit) C'est fait : tu sais ce qui t'attend après l'intervention.
Ta première intervention est notée. L'application garde pour toi les signaux, l'historique et l'« avant » de chaque intervention.
Avant chaque cours, un coup d'œil à l'onglet « Groupe » te dit qui a besoin de toi.
Objectif atteint : tu es en mesure d'utiliser le suivi de ta classe pour planifier une intervention auprès d'un·e étudiant·e qui a besoin de toi.
Suite suggérée : le parcours 8, « Automatiser tes commentaires ». Boutons : « Voir le parcours 8 », « Terminer ».
Fin.

4. PARCOURS 8, « AUTOMATISER TES COMMENTAIRES » (`js/parcours-commentaires.js`). Deux temps neufs ; les douze textes actuels et leur sentinelle sont remplacés.

4.1 « JE REGARDE », huit bulles, dans la démo, deuxième groupe, après les modèles des parcours 2, 3 et 4 (refus sinon ; propose ses mots). L'exemple ajoute un cinquième critère, « Français écrit », à la « Grille générale à 4 critères ». MESURE D'ABORD l'effet de cet ajout sur les évaluations déjà posées sur cette grille dans la démo (leurs notes, leurs rétroactions, le total des pondérations) : si une évaluation existante change ou devient incohérente, fais travailler le modèle sur une COPIE de la grille reliée à la production pour la suite du modèle, et dis-le. Ce que « Remplir » pose : à la bulle 1, le nom « Français écrit » ; à la bulle 2, « erreur », « erreurs », « mot », « mots » (si l'application préremplit déjà ces formes pour un critère nommé « Français écrit », retire ce « Remplir » dans l'aperçu et dis-le) ; à la bulle 4, la pondération 20 % pour « Français écrit » et les quatre autres ramenés à Structure 16, Rigueur 24, Plausibilité 12, Nuance 28 ; à la bulle 5, la limite de 30 erreurs pour 900 mots ; à la bulle 7, les quatre niveaux d'Antilope Vaillante : Structure M, Rigueur M, Plausibilité E, Nuance M. Le nombre de mots de la bulle 7 : compte-le sur le texte de la production fictive d'Antilope Vaillante et écris-le à la place de [nombre]. Tout reste dans la démo ; « Refaire » retire le cinquième critère, les codes posés et l'évaluation d'Antilope Vaillante ; Tapir Doux reste intact pour le parcours 7 ; break-test du confinement.

Début.
BULLE 1 sur 8 · « Ta grille »
(petit) Parcours 8 · Automatiser tes commentaires · Je regarde
À la fin de ce parcours, tu seras en mesure d'expliquer comment les codes que tu poses sur une production deviennent une note et des commentaires.
Tu es dans « Conception », à l'onglet « Grilles » : c'est là que tu composes tes grilles.
Dans la démo, tu reprends la grille de ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données.
Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », les commentaires par cible viendront dans une prochaine version.
Tu comptes déjà certaines choses quand tu corriges : des erreurs de français, ou des unités oubliées dans des calculs. Ici, l'application garde ce compte et en tire la note d'un critère.
Ce critère est dit algorithmique : sa note se calcule à partir de ce que tu comptes, selon une règle que tu fixes une seule fois. Les autres critères, eux, reçoivent le niveau que tu choisis.
Il écrit aussi le commentaire qui convient à chaque compte. C'est ce que veut dire « automatiser tes commentaires ».
→→ Dans le menu en haut de la page, choisis « Grille générale à 4 critères »
Puis :
Ses quatre critères s'évaluent par niveaux. Le critère algorithmique s'ajoute à côté d'eux.
→ Au bas de la liste des critères, touche « + Ajouter un critère »
→ Regarde l'exemple se remplir : touche « Remplir » (le nom du critère s'écrit : « Français écrit »)
→→ Dans le menu « Type » de ce critère, choisis « Algorithmique »

BULLE 2 sur 8 · « Ce que tu comptes »
(petit) C'est fait : le critère « Français écrit » est algorithmique. Son atelier s'est ouvert.
L'atelier règle le critère en cinq étapes, à faire dans l'ordre. Elles sont en haut : une coche marque celles qui sont réglées.
La première, « Ce que tu relèves et comptes », demande deux noms : ce que tu comptes dans une production, puis ce à quoi tu rapportes ce compte. Douze erreurs ne disent pas la même chose dans 300 mots que dans 900.
Chaque nom s'écrit au singulier et au pluriel, parce que l'étudiant·e les lira dans une phrase : « Ta production contient 12 erreurs pour 600 mots. »
Dans une autre discipline, ce serait par exemple « unité manquante » et « calcul ».
→→ Regarde l'exemple se remplir : touche « Remplir » (« erreur », « erreurs », « mot », « mots »)

BULLE 3 sur 8 · « Tes codes »
(petit) C'est fait : l'application sait ce que tu comptes (des erreurs) et ce à quoi tu le rapportes (des mots).
Tu es à l'étape « Codes utilisés ». Un code est une catégorie de ce que tu relèves. Il porte un nom et un numéro : c'est ce numéro que tu poseras sur la production.
Tu écris peut-être déjà un chiffre ou une abréviation dans la marge ; ici, l'application compte chaque code que tu poses.
Pour le français écrit, une liste de dix codes est prête. Dans une autre discipline, tu écrirais les tiens, un à la fois.
→→ Touche « Partir de la liste du français écrit (codes 1 à 10) »
Puis :
Chaque rangée est un code : son numéro, son nom et sa pondération. La pondération d'un code dit ce que vaut un code posé dans le compte : 1 au départ, 0,5 pour le compter à moitié.
Sous chaque code, son « Observation » : la phrase que l'étudiant·e lira quand ce code revient souvent dans sa production.
→ Ouvre l'« Observation » du code 1 et lis-la
→→ Touche « Continuer »

BULLE 4 sur 8 · « Ta note »
(petit) C'est fait : ton critère a ses dix codes.
Tu es à l'étape « Note calculée ». Deux réglages font la note de ce critère.
Le premier est sa pondération, dans l'en-tête du critère, à côté de son type : ce que pèse le critère dans le résultat de la production.
Le second est le calcul. Trois sont prêts. L'exemple garde celui qui est choisi au départ, « Pénalité proportionnelle à la longueur » : le même nombre d'erreurs coûte moins dans une production plus longue.
→ Regarde l'exemple se remplir : touche « Remplir » (la pondération s'écrit : 20 %)
La carte montre aussitôt la note d'une production fictive. Change son nombre d'erreurs : la note suit.
→→ Touche « Continuer »

BULLE 5 sur 8 · « Ce que l'étudiant·e lit »
(petit) C'est fait : la note de ton critère a sa règle.
Tu es à l'étape « Cas d'interprétation ». Un compte seul ne dit pas si c'est beaucoup.
Tu as sans doute un repère en tête : au-delà d'un certain nombre d'erreurs, tu t'inquiètes. Ici, ce repère s'appelle une limite. Elle tient en deux nombres : une longueur de référence et la tolérance sur cette longueur.
Avec une limite, l'application situe chaque production dans un palier. L'étudiant·e lit la phrase du palier où tombe sa production.
→ Touche « Fixer une limite »
→ Regarde l'exemple se remplir : touche « Remplir » (au plus 30 erreurs pour 900 mots)
→→ Lis les phrases des paliers, puis touche « Continuer »
Puis, à l'étape « Ce que l'étudiant·e lit » :
Voici les phrases que l'application écrira à ta place sur chaque production.
La première donne le compte : « Ta production contient… ». Elle paraît sous le critère et dans le PDF de l'étudiant·e.
Les deux autres vont dans son bilan : l'une quand la note de ce critère tombe à 0, l'autre quand tous les critères de la grille sont maîtrisés.
Les blocs colorés, comme le compte, se remplissent à l'évaluation. Le reste se réécrit avec tes mots.
→→ Lis les trois phrases, puis touche « Continuer »

BULLE 6 sur 8 · « Poser tes codes »
(petit) C'est fait : ton critère est réglé. La grille s'est enregistrée d'elle-même.
Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.
Cette grille est celle de la production « Artefact 1 ». Celle d'Antilope Vaillante est déjà reçue et n'est pas encore évaluée.
→→ Sur la ligne d'Antilope Vaillante, touche « Actions › Annoter »
Puis :
La palette « Codes » porte les dix codes de ta grille.
Ici, on expérimente l'application, pas la correction : pose tes codes au hasard, sans lire le texte.
→ Touche un code dans la palette, puis un endroit de la production : son numéro s'y pose
→ Recommence jusqu'à six codes (suggestion pour suivre l'exemple : trois fois le code 1, deux fois le code 4, une fois le code 10)
Le nombre de codes posés paraît dans la palette : le compte se fait seul.
→→ En haut de la production, touche « Annoter ▾ », puis choisis « Évaluer »

BULLE 7 sur 8 · « Ta rétroaction s'écrit seule »
(petit) C'est fait : six codes sont posés. Tu es en mode Évaluer.
Dans la palette « Évaluation », « Français écrit » porte déjà son compte : 6 erreurs.
Il lui manque ce à quoi tu rapportes ce compte : la longueur de cette production.
→ Écris le nombre de mots : [nombre] (la note du critère se calcule aussitôt)
→ Regarde l'exemple se remplir : touche « Remplir » (les quatre autres critères reçoivent leur niveau, comme au parcours 3)
Dans la palette « Rétroaction », sous « Français écrit » : la phrase du compte, puis celle du palier. Dans la vue « Spécifique » : les codes les plus fréquents, chacun avec son observation.
Tu n'as écrit aucune de ces phrases pour cette production : elles viennent toutes de tes règles.
→ Lis la rétroaction comme Antilope Vaillante la lira
→→ Touche le cadenas « Verrouiller », en haut de la palette « Paramètres »

BULLE 8 sur 8 · « Et pour tes prochaines productions »
(petit) C'est fait : l'évaluation d'Antilope Vaillante est verrouillée.
Chaque production évaluée avec cette grille recevra sa rétroaction de la même façon : tu poses tes codes, l'application compte et écrit.
Le réglage se fait une fois. Tu peux y revenir quand tu veux, dans l'atelier du critère.
Objectif atteint : tu es en mesure d'expliquer comment les codes que tu poses sur une production deviennent une note et des commentaires.
Suite suggérée : le parcours 9 (son nom lu dans le panneau, comme pour les autres). Boutons : « Le refaire avec ma classe », « Voir le parcours 9 », « Terminer ».
Fin.

4.2 « NOUS FAISONS », dix bulles sur le chemin complet ; les bulles 6 et 7 sont sautées dans les cas où le code saute aujourd'hui « Ta production » et « Tes productions » ; la variante sans fichier remplace les bulles 8 et 9 après « Rien à importer ». Aucun « Remplir ». Ce qui fait avancer chaque bulle reste ce que le code fait aujourd'hui pour l'étape correspondante ; les étapes « Tes cas » et « Ce que l'étudiant·e lit » d'aujourd'hui deviennent les deux formes de la bulle 5.

Début.
BULLE 1 sur 10 · « Ta grille »
(petit) Parcours 8 · Automatiser tes commentaires · Nous faisons
À la fin de ce parcours, tu seras en mesure de régler un critère algorithmique dans ta grille et de l'appliquer à une première production.
Tu es dans « Conception », à l'onglet « Grilles » : c'est là que tu composes tes grilles.
Cette fois, c'est ton propre matériel : ta grille et les productions de ton groupe.
Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », les commentaires par cible viendront dans une prochaine version.
Tu comptes déjà certaines choses quand tu corriges : des erreurs de français, ou des unités oubliées dans des calculs. Un critère algorithmique garde ce compte, en tire sa note et écrit le commentaire qui convient.
Il prend place dans une grille, seul ou à côté de tes autres critères.
Prends la grille d'une production que tu n'as pas encore évaluée. Les évaluations déjà enregistrées garderaient leur note sans ce critère : tes étudiant·es ne seraient pas tou·tes évalué·es sur les mêmes critères.
→→ Choisis cette grille dans le menu en haut de la page, ou touche « + Nouvelle grille »
Puis :
→ Touche « + Ajouter un critère »
→ Écris son nom (ce que tu relèves, par exemple « Français écrit » ou « Unités de mesure »)
→→ Dans le menu « Type » de ce critère, choisis « Algorithmique »

BULLE 2 sur 10 · « Ce que tu comptes »
(petit) C'est fait : ton critère est algorithmique. Son atelier s'est ouvert.
L'atelier règle le critère en cinq étapes, à faire dans l'ordre. Elles sont en haut : une coche marque celles qui sont réglées, un point d'exclamation celles qui t'attendent.
La première, « Ce que tu relèves et comptes », demande deux noms : ce que tu comptes dans une production, puis ce à quoi tu rapportes ce compte. Des erreurs sur des mots, des unités manquantes sur des calculs, ou ce qui convient à ta discipline.
Écris chaque nom au singulier et au pluriel : l'étudiant·e les lira dans la phrase qui lui donne son compte et dans son PDF.
→→ Écris les quatre formes

BULLE 3 sur 10 · « Tes codes »
(petit) C'est fait : l'application sait ce que tu comptes et ce à quoi tu le rapportes.
Tu es à l'étape « Codes utilisés ». Un code est une catégorie de ce que tu relèves. Il porte un nom et un numéro : c'est ce numéro que tu poseras sur la production.
Tu écris peut-être déjà un chiffre ou une abréviation dans la marge ; ici, l'application compte chaque code que tu poses.
→ Touche « + Ajouter un sous-critère » et nomme ton premier code
Sa pondération dit ce que vaut un code posé dans le compte : 1 au départ, 0,5 pour le compter à moitié.
→ Ouvre son « Observation » et écris ce que l'étudiant·e lira quand ce code revient souvent dans sa production
→ Ajoute tes autres codes de la même façon
Tu enseignes le français écrit ? « Partir de la liste du français écrit (codes 1 à 10) » crée dix codes d'un coup, que tu modifies ensuite.
→→ Touche « Continuer »
(Sous « Continuer », tant qu'il n'y a aucun code : « Pour continuer, ajoute un premier code : touche « + Ajouter un sous-critère ». »)

BULLE 4 sur 10 · « Ta note »
(petit) C'est fait : ton critère a ses codes.
Tu es à l'étape « Note calculée ». Deux réglages font la note de ce critère.
→ Écris sa pondération, dans l'en-tête du critère, à côté de son type (ce que pèse le critère dans le résultat de la production)
Si ta grille a d'autres critères, l'étape « Pondération », en tête de la fiche, te dit si le total tombe juste.
Trois calculs sont prêts. « Pénalité proportionnelle à la longueur » : le même compte coûte moins dans une production plus longue. « Rapport visé » : un rapport que tu fixes donne la note entière, par exemple une occurrence à chaque 60 mots. « Pénalité fixe » : chaque occurrence retire les mêmes points.
→ Choisis ton calcul et ajuste son réglage (la carte montre aussitôt la note d'une production fictive)
→→ Touche « Continuer »

BULLE 5 sur 10 · « Ce que l'étudiant·e lit »
(petit) C'est fait : la note de ton critère a sa règle.
Tu es à l'étape « Cas d'interprétation ». Un compte seul ne dit pas si c'est beaucoup.
Tu as peut-être un repère en tête. Ici, il s'appelle une limite et tient en deux nombres : une longueur de référence et la tolérance sur cette longueur, par exemple au plus 4 unités manquantes pour 12 calculs.
Avec une limite, l'application situe chaque production dans un palier. L'étudiant·e lit la phrase du palier où tombe sa production.
→ Si tu as un repère, touche « Fixer une limite », écris ses deux nombres, puis réécris les phrases des paliers avec tes mots
Pas de repère ? Laisse l'étape telle quelle : la phrase du compte suffit.
→→ Touche « Continuer »
Puis, à l'étape « Ce que l'étudiant·e lit » :
Voici les phrases que l'application écrira à ta place sur chaque production.
La première donne le compte : « Ta production contient… ». Les deux autres vont dans le bilan : l'une quand la note de ce critère tombe à 0, l'autre quand tous les critères de la grille sont maîtrisés.
Les blocs colorés, comme le compte, se remplissent à l'évaluation. Le reste se réécrit avec tes mots ; « Revenir au modèle » remet la phrase de départ.
→ Relis tes phrases
Ta grille est nouvelle ? Donne-lui un nom (il s'imprime dans le PDF de tes étudiant·es).
→→ Touche « Continuer », ou « Créer la grille » pour une grille nouvelle

BULLE 6 sur 10 · « Ta production » (sautée si la grille est déjà celle d'une production)
(petit) C'est fait : ton critère est réglé et ta grille est enregistrée.
Tu es dans « Conception », à l'onglet « Productions » : c'est là que tu décris ce que tu demandes à tes étudiant·es.
Ta grille ne sert qu'une fois reliée à la production qu'elle évaluera.
→ Choisis ta prochaine production dans le menu en haut de la page, ou touche « + Nouvelle production »
→ Dans « Grille de critères d'évaluation », choisis la grille que tu viens de régler
Garde son échelle de performance : elle traduit la note de ce critère en niveau, comme pour tes autres critères.
→→ Pour une production nouvelle, touche « Créer la production »

BULLE 7 sur 10 · « Leurs productions » (sautée si des productions sont déjà reçues pour elle)
(petit) C'est fait : ta grille est reliée à ta production.
Tu es dans « Évaluation », à l'onglet « Préparer » : c'est là que tu reçois les productions de tes étudiant·es.
Pour poser tes codes, il te faut leurs productions dans l'application. Tu l'as fait au parcours 4 ; les gestes sont les mêmes.
→ Dépose leurs fichiers dans la zone
→ Sous « Inspecteur », choisis la production à laquelle tu viens de relier ta grille
→→ Touche « Importer », puis « Oui, importer »
Ta production est sur papier, ou c'est un exposé, une performance ? Touche « Rien à importer » : tu écriras ton compte à l'évaluation.

BULLE 8 sur 10 · « Poser tes codes »
(petit) C'est fait : les productions de ton groupe sont reçues.
Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.
→→ Sur la ligne d'une production reçue, touche « Actions › Annoter »
Puis :
La palette « Codes » porte les codes de ta grille.
→ Touche un code, puis l'endroit de la production où tu l'observes : son numéro s'y pose
Sur un clavier, la touche de son numéro le choisit aussi (0 pour le code 10). Le nombre de codes posés paraît dans la palette : le compte se fait seul.
Un code relève ; il ne commente pas. Pour un commentaire sur la production, prends l'outil « Texte ». Le « Stylo » sert à encercler ou à tracer une flèche.
→→ Quand tu as fini, touche « Annoter ▾ », en haut de la production, puis choisis « Évaluer »

BULLE 9 sur 10 · « Ta rétroaction s'écrit seule »
(petit) C'est fait : tes codes sont posés. Tu es en mode Évaluer.
Dans la palette « Évaluation », ton critère algorithmique porte déjà le compte de tes codes.
→ Écris ce à quoi tu le rapportes, par exemple le nombre de mots ou de calculs de cette production (la note se calcule aussitôt)
→ Évalue tes autres critères comme d'habitude
Dans la palette « Rétroaction », sous ton critère : la phrase du compte et, si tu as fixé une limite, celle du palier. Dans la vue « Spécifique » : les codes les plus fréquents, chacun avec son observation.
Tu n'as écrit aucune de ces phrases pour cette production : elles viennent toutes de tes règles.
→ Relis la rétroaction comme ton étudiant·e la lira (un mot personnel s'écrit dans « Un mot pour ton étudiant·e »)
→→ Touche le cadenas « Verrouiller », en haut de la palette « Paramètres »

LA VARIANTE SANS FICHIER (remplace les bulles 8 et 9)
(petit) C'est fait : pas de fichier à importer.
Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.
→→ Sur la ligne d'un·e étudiant·e, touche « Actions › Évaluer »
Puis :
Sans fichier, il n'y a pas de codes à poser : tu comptes de ton côté.
→ Dans le panneau « Critères », écris tes deux nombres : ton compte et ce à quoi tu le rapportes
→ Évalue tes autres critères comme d'habitude
La rétroaction, à côté, porte la phrase du compte et, si tu as fixé une limite, celle du palier. Elle ne nomme pas tes codes : l'application ne sait pas lesquels reviennent.
→→ Relis-la, puis touche le cadenas « Verrouiller »

BULLE 10 sur 10 · « Et pour tes prochaines productions »
(petit) C'est fait : l'évaluation est verrouillée.
Chaque production que tu évalueras avec cette grille recevra sa rétroaction de la même façon : tu poses tes codes, l'application compte et écrit.
Le réglage est fait. Tu peux y revenir quand tu veux, dans l'atelier du critère.
Objectif atteint : tu es en mesure de régler un critère algorithmique dans ta grille et de l'appliquer à une première production.
Suite suggérée : le parcours 9 (son nom lu dans le panneau). Boutons : « Voir le parcours 9 », « Terminer ».
Fin.

5. PARCOURS 6, « METTRE TES DONNÉES À L'ABRI », « JE REGARDE » (`js/parcours-donnees.js`) : cinq bulles neuves, une VISITE du menu « Codex » dans la démo. La personne ne touche que le bouton « Codex » (bulle 1) ; elle avance ensuite par « Continuer », dans la bulle. Pendant la visite, RIEN ne répond dans le menu : « Mettre à jour le codex », « Mettre à jour dans un autre fichier… », « Ouvrir un codex… », « Nouveau codex », le renommage par le nom en haut du menu (étends la garde qui existe déjà pour « Ouvrir un codex… ») ; aucun fichier ne s'écrit ; break-test. Le menu reste ouvert des bulles 2 à 5, y compris quand on touche la bulle, sa poignée ou « Continuer ». Les flèches vont : bulles 2 et 3, à « Mettre à jour le codex » ; bulle 4, au haut du menu ; bulle 5, à « Ouvrir un codex… » ; sans la pulsation qui veut dire « ce que tu toucheras ». Le « Nous faisons » ne change pas.

Début.
BULLE 1 sur 5 · « Pourquoi un codex »
(petit) Parcours 6 · Mettre tes données à l'abri · Je regarde
À la fin de ce parcours, tu seras en mesure d'expliquer où demeurent tes données et de décrire comment ton codex les met à l'abri.
Dans la démo, tu visites le menu « Codex » sans rien y lancer : aucun fichier ne s'écrit. Rien ne touche à tes données.
Tes notes et les productions de tes étudiant·es, tu les gardes déjà quelque part : dans un classeur ou dans un dossier de ton ordinateur.
Labo Codex, lui, les garde dans le navigateur de cet appareil, le logiciel qui t'affiche cette page : il ne les envoie nulle part.
Elles peuvent donc se perdre si tu effaces les données de sites, ou si tu changes de navigateur ou d'ordinateur.
Ton codex en est une copie complète, productions de tes étudiant·es comprises, dans un seul fichier que tu rouvres sur n'importe quel appareil.
→→ Touche « Codex », en haut de l'écran

BULLE 2 sur 5 · « Mettre à jour »
(petit) C'est fait : le menu Codex est ouvert.
Mettre ton codex à jour, c'est rassembler tes données et les fichiers des productions de tes étudiant·es en un seul fichier.
Ce fichier ne change que quand tu le mets à jour : l'application ne le fait jamais à ta place.
Avec ta classe, ce geste se refait chaque semaine et après chaque travail important : une saisie de présences ou une série d'évaluations.
Dans cette visite, « Mettre à jour le codex » ne répond pas : tu le feras avec ta classe, en « Nous faisons ».
→→ Touche « Continuer »

BULLE 3 sur 5 · « Un lieu protégé »
(petit) C'est fait : tu as vu « Mettre à jour le codex ».
Avec ta classe, ce bouton ouvre d'abord un aperçu : il te montre ce que le fichier contiendra et rien ne s'écrit avant ton accord.
Ton codex contient les noms, les DA et les productions de tes étudiant·es, et il n'est pas chiffré : quiconque a le fichier peut le lire.
Sa place est dans un lieu protégé : une clé USB chiffrée, ou un dossier synchronisé avec un infonuage chiffré, protégé par un mot de passe solide et une double authentification.
Ton appareil, lui, devrait avoir un mot de passe et un disque chiffré.
→→ Touche « Continuer »

BULLE 4 sur 5 · « Où en est ton codex »
(petit) C'est fait : tu as vu où ranger ton codex.
Le haut du menu parle de ton codex à toi, même dans la démo.
Tant que tu n'en as pas, il dit « Pas encore de codex ».
Ensuite, il te dit où tu en es : « Ton codex est à jour », ou « Ton codex n'a pas tes derniers changements ».
Une fois ton codex créé, une pastille paraît à côté du mot « Codex », dans l'en-tête : verte quand il est à jour, orange quand il n'a pas tes derniers changements.
Et si tu oublies, le rappel « Mets ton codex à jour » reviendra toutes les deux semaines, ou au rythme que tu choisis.
→→ Touche « Continuer »

BULLE 5 sur 5 · « Quand le rouvrir »
(petit) C'est fait : tu as vu où lire l'état de ton codex.
Ton codex te servira dans deux cas : pour travailler sur un autre appareil, ou pour retrouver tes données si ce navigateur les perd.
Tu l'ouvriras alors par « Ouvrir un codex… », ici, dans le menu.
Attention : ouvrir un codex remplace tout ce qui est dans l'application par le contenu du fichier. C'est donc toujours ton codex le plus récent qu'il faut ouvrir.
Dans cette visite, « Ouvrir un codex… » ne répond pas.
Objectif atteint : tu es en mesure d'expliquer où demeurent tes données et de décrire comment ton codex les met à l'abri.
Suite suggérée : le parcours 7, « Lire ta classe et intervenir ». Boutons : « Le refaire avec ma classe », « Voir le parcours 7 », « Terminer ».
Fin.

6. TESTS. Vitest complet. Les sentinelles des parcours 6, 7 et 8 relisent les sections 3 à 5 de cette consigne, dans les deux sens. Un banc Playwright Chromium de bout en bout par parcours et par temps, aux deux tailles (1180 × 820 et 820 × 1180), avec son break-test ; le confinement de chaque modèle (aucune clé hors de la démo ne change). Les rouges déjà là sur la base : vérifie-les sur l'arbre de la base et marque-les.

7. RAPPORT. `plans de travail/RAPPORT-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md` : ce qui est fait, mesuré, supposé, non vérifié (Safari, l'iPad) ; pour 1, la garde et son verdict, ce que porte « I » (1.3) ; les réponses à M1 à M6, mot pour mot ; les deux lignes à crochets de la bulle 4 du parcours 7 telles que posées ; le nombre de mots compté ; le choix fait pour la grille du parcours 8 (ajout ou copie) et ce qui l'a décidé ; les mots des refus proposés ; « les mots qui ne tiennent pas à l'écran » ; ce qui fait avancer chaque bulle ; toute trouvaille avec l'une des trois issues ; l'adresse de l'aperçu. Une porte terrain en markdown pour l'essai de Grégoire sur l'iPad.
