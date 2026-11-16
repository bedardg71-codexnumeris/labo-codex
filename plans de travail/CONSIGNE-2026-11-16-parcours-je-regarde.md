# Consigne du 16 nov. 2026 — les parcours « Découvrir » et « Mettre ta classe en place » (Je regarde)

> Relais de Cowork, reçu par Claude Code le 16 nov. 2026, recopié tel quel. La sentinelle
> `tests/unit/sentinelle-parcours-je-regarde-2026-11-16.test.js` relit les textes des bulles ICI : ne pas retoucher
> ce fichier sans retoucher le code, ni l'inverse.

Pour Claude Code, à relayer — les parcours « Découvrir » et « Mettre ta classe en place » (Je regarde), réécrits avec Grégoire le 16 nov. 2026, sur lot/deux-temps-modeles

AVANT TOUT : si une autre session travaille déjà dans l'arbre principal du Mac (celle des retouches de lot/verdict-nuage, par exemple), ouvre un arbre à part (git worktree add) et dis-le en tête de ton rapport.

BRANCHE. lot/deux-temps-modeles (6a57e81bd, PR n° 23). Elle reprend main (5735b41e3, 1.248.2). Sur main, les parcours restent fermés. Sur cette branche seulement, tu les rouvres (PARCOURS_OUVERTS à true dans js/assistance.js, et côté tests ce que RELAIS.md décrit à l'entrée du 15 nov., 21 h 39). Rien ne part vers main.

CE QUE GRÉGOIRE A DÉCIDÉ CE MATIN (8 h 47 à 9 h 46)

1. La perspective. Toutes les bulles adoptent le ton de la carte « À propos » de la 1.248.2 : on part d'un geste que l'enseignant·e fait déjà, on dit ce que l'application en garde en mémoire. Aucune phrase ne laisse entendre qu'il ou elle ne sait pas déjà faire son métier.

2. Le vocabulaire des deux temps. Sous chaque parcours qui a ses deux temps, deux boutons côte à côte : « Je regarde » et « Nous faisons ». Sous chacun, en petit, « Modélisation » et « Pratique guidée ». Sous cela, l'état : « À faire », « Étape 3 sur 8 » ou « Fait ». Ces libellés remplacent ceux du 15 nov.

3. Les quatre lignes du panneau « Assistance », mot pour mot :
1. J'explore la démo et son groupe fictif, par moi-même.
2. Je regarde un modèle, avec le matériel de la démo.
3. Nous faisons le parcours ensemble, avec mon propre matériel.
4. Je fais, en autonomie, avec l'aide dans les pages au besoin.

4. Le bouton de la bulle s'appelle « Remplir » (il remplace « Remplir avec l'exemple »). Sa consigne : « Regarde l'exemple se remplir : touche « Remplir » ». Les boutons de la page gardent leurs vrais noms.

5. L'étudiant fictif s'appelle « Suricate Loyal » (animal, puis qualité), comme dans js/pack-demo-10.js. js/parcours-decouvrir.js écrit « Loyal Suricate » à deux endroits : corrige.

6. La dernière bulle de chaque parcours rappelle l'objectif et dit qu'il est atteint.

CE QUE LE MOTEUR DOIT FAIRE (demandes de Grégoire du 15 nov., jamais relayées)

a. La première bulle d'un parcours porte son objectif, sous le titre, avant les lignes.
b. À chaque étape, la page ouvre la bonne section (Trimestre, Cours et services, Enseignant·e, Étudiant·es, Horaire, Groupe-cours) et y défile par une transition visible. La bulle ne paraît qu'ensuite, à côté de la section, jamais dessus. Défauts vus le 15 : la bulle « Une liste d'étudiant·es » posée sur le formulaire du cours resté ouvert en « Mode modification » ; « Un cours » ouvert avec la section Trimestre en haut.
c. Le nom de la section dont parle la bulle est encadré (le même halo que celui des entrées du menu).
d. Un triangle à côté du compteur « n sur N » montre si la liste des étapes est ouverte ou fermée.
e. Chaque bulle, sauf la première, s'ouvre sur une ligne qui confirme le geste précédent en le nommant (« C'est fait : … »). Ce n'est pas un éloge.
f. Une seule page par bulle. Si un texte ci-dessous ne tient pas à 820 px de large, ne le coupe pas : dis-le dans ton rapport, avec la hauteur mesurée.

LES TEXTES DE « DÉCOUVRIR » (huit bulles, mot pour mot ; les tirets sont des lignes de liste)

1 sur 8 — Ta classe d'un coup d'œil
À la fin de ce parcours, tu seras en mesure de repérer qui a besoin de toi sans attendre une main levée et de nommer précisément son défi.
Tu es dans « Suivi », à l'onglet « Groupe ». La classe est fictive : dix étudiant·es, un trimestre complet.
– Chaque point blanc est un·e étudiant·e
– Sa place dit son assiduité (tu prends déjà les présences ; ici, l'application les garde en mémoire, séance après séance)
– Un point s'écarte des autres
– Touche « Détails » pour mettre un nom sur chaque point

2 sur 8 — Qui s'écarte ?
Tu viens d'ouvrir « Détails » : chaque point a maintenant un nom.
– Le point à l'écart, c'est Suricate Loyal
– Son assiduité est de 84 % ; celle des autres, de 93 % ou plus
– Un pourcentage ne dit pas pourquoi
– Touche son « A 84 % » (A pour assiduité) : son profil rassemble ce que l'application a gardé de lui

3 sur 8 — Ce qui le met à l'écart
Tu viens d'ouvrir le profil de Suricate Loyal.
– Assiduité : cinq absences ou retards
– Complétion : deux productions non remises
– Une production, c'est tout ce que tu demandes de faire, que ce soit formatif ou certificatif : un plan de rédaction, un exposé oral, un laboratoire, une prise de sang, une mesure sur le terrain
– Non remise, elle ne s'évalue pas, mais elle dit quelque chose
– Ces deux signaux, tu les aurais avant d'entrer en classe, sans qu'il ait rien demandé
– Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire

4 sur 8 — De quoi il a besoin
Tu viens d'ouvrir « Accompagnement ».
– Son niveau de besoin : 2 sur 3, « préventif » (une aide ciblée, avant que la difficulté s'installe)
– Son défi principal : la nuance, l'un des critères sur lesquels ses productions ont été évaluées (l'application peut le nommer parce qu'elle garde ses résultats d'une production à l'autre)
– Ses absences y sont peut-être pour quelque chose : l'application ne l'affirme pas, elle met les deux sous tes yeux
– Le niveau indique l'intensité de l'aide requise par ton étudiant·e ; le défi dit où porter cette aide, concrètement
– Mais l'intervention, c'est toi qui la décides et c'est toi qui la prépares
– Touche « Continuer »

5 sur 8 — D'où viennent ces signaux
– Tu viens de repérer qui a besoin de toi et de nommer son défi, sans qu'il ait levé la main
– L'application n'a rien deviné : elle a gardé en mémoire des gestes que tu fais déjà (prendre les présences, évaluer les productions)
– Remontons à ces gestes : tu verras ce qu'il te faudra faire pour obtenir la même chose avec ta classe
– Touche « Évaluation », en haut

6 sur 8 — Évaluer
Tu es dans « Évaluation », à l'onglet « Préparer ».
– Ici, tu reçois les productions de tes étudiant·es, puis tu les évalues, comme tu en as l'habitude
– La différence : l'application garde chaque geste en mémoire
– Chaque production reçue compte pour la complétion ; chaque évaluation, pour la performance (les résultats obtenus, critère par critère)
– L'assiduité, elle, vient des présences que tu prends dans « Suivi »
– Pour évaluer, il te faut tes outils : touche « Conception »

7 sur 8 — Concevoir
Tu es dans « Conception », à l'onglet « Mon matériel ».
– Tes outils, ce sont d'abord les productions que tu demandes : pour chacune, les consignes que tu donnes, les tâches que l'étudiant·e doit effectuer et l'objectif qu'elle cherche à atteindre
– Ce sont aussi tes grilles : la liste de tes critères (ce que tu regardes dans une production) et ce que vaut chacun
– Ce sont tes critères qui permettent à l'application de nommer un défi, comme la nuance tout à l'heure
– Tu ne pars pas de zéro : tu apportes la grille que tu utilises déjà, elle dit déjà ce que tu juges important
– Tout cela s'inscrit dans un cadre : touche « Cadre »

8 sur 8 — Poser ton cadre
Tu es dans « Cadre », à l'onglet « Trimestre ».
– Tout repose ici : ton trimestre, tes cours, tes groupes
– Tu viens de faire le chemin à rebours. Avec ta classe, tu le feras à l'endroit : « Cadre », « Conception », « Évaluation »
– Les champs marqués d'un astérisque rouge suffisent pour un premier résultat : dès ta première prise de présences, ta classe apparaît, un point par étudiant·e
– Le reste, tu le remplis à ton rythme : plus tu précises tes consignes, tes critères et tes rétroactions, plus ce que l'application te rend est fin et utile
– À force de t'en servir, ton acuité s'affine : cette mémoire rend visible et explicite ce qui, dans ta classe, reste parfois sous-entendu et silencieux
– Objectif atteint : tu es en mesure de repérer qui a besoin de toi sans attendre une main levée et de nommer précisément son défi
– Chaque parcours a son objectif. C'est toi qui choisis la suite
Trois boutons de même poids, aucun mis en avant : « Explorer la démo par moi-même », « Voir le parcours suivant » (il lance « Je regarde » de « Mettre ta classe en place »), « Commencer avec ma classe » (il lance son « Nous faisons »).

LES TEXTES DE « METTRE TA CLASSE EN PLACE », « JE REGARDE » (huit bulles, mot pour mot). Les bulles à bouton « Remplir » ont deux états : avant, puis après.

1 sur 8 — Un cours
À la fin de ce parcours, tu seras en mesure d'expliquer ce que l'application te demande pour mettre une classe en place et ce qu'elle en tire.
Tu es dans « Cadre », à la section « Cours et services » : c'est là que tu dis quel cours tu donnes.
Dans la démo, tu montes un deuxième groupe avec le matériel de l'exemple. Rien ne touche à tes données.
– Regarde l'exemple se remplir : touche « Remplir »
Après :
– Le code du cours, tel qu'il paraît à ton plan de cours
– Sa pondération (elle sert à calculer les heures de cours)
– Sa discipline (elle sert à identifier le matériel que tu partageras)
– Touche « Créer le cours »

2 sur 8 — Une liste d'étudiant·es
C'est fait : le cours est créé.
Tu es dans la section « Étudiant·es » : c'est là que tu apportes la liste de ton groupe.
– Regarde l'exemple se remplir : touche « Remplir »
Après :
– Dix étudiant·es fictif·ves, une ligne par personne
– Son DA, le numéro de dossier (il l'identifie partout dans l'application)
– Son numéro de groupe (il servira à l'horaire et au groupe-cours)
– Son nom et son prénom
– Avec ta classe, cette liste viendra du système de gestion scolaire de ton collège
– Touche « Prévisualiser »

3 sur 8 — Le cours de la liste
C'est fait : l'aperçu est ouvert. Rien n'est encore importé.
– L'aperçu montre les dix personnes telles qu'elles seront importées (c'est le moment de vérifier)
– Il reste à dire dans quel cours elles sont inscrites
– Regarde l'exemple se remplir : touche « Remplir »
Après :
– Leur cours : celui que tu viens de créer
– Touche « Importer 10 étudiant·es »

4 sur 8 — Un horaire
C'est fait : les dix étudiant·es sont importé·es.
Tu es dans la section « Horaire » : c'est là que tu dis quand ton groupe se rencontre.
– Regarde l'exemple se remplir : touche « Remplir »
Après :
– Le groupe (l'horaire lui est lié)
– Le nom de l'horaire : « Mar-Ven »
– Deux séances par semaine : le mardi et le vendredi, de 8 h à 10 h
– 2 périodes par séance (le nombre s'écrit d'après les heures)
– Avec les dates du trimestre, cet horaire donne le calendrier de tes séances : c'est là que s'inscriront tes présences
– Touche « Créer l'horaire »

5 sur 8 — Un groupe-cours
C'est fait : l'horaire est créé.
Tu es dans la section « Groupe-cours » : c'est là que tu réunis ce que tu viens de créer.
– Regarde l'exemple se remplir : touche « Remplir »
Après :
– Un groupe-cours, c'est une classe : un cours, un groupe, un horaire, un·e enseignant·e
– Le cours que tu viens de créer
– Le groupe de la liste
– L'horaire « Mar-Ven »
– L'enseignant de la démo, Primo Primavera
– C'est à ce groupe-cours que se rattachera tout ce que l'application gardera : présences, productions, évaluations
– Touche « Créer le groupe-cours » (il apparaîtra dans l'en-tête de l'application)

6 sur 8 — D'un groupe à l'autre
C'est fait : le groupe-cours est créé. La mise en place est terminée.
– Ton deuxième groupe est dans l'en-tête de l'application, à côté de celui de la démo
– Tout ce que tu verras ensuite, dans « Suivi » ou dans « Évaluation », concerne le groupe choisi ici
– Tu donnes plusieurs groupes ? C'est ici que tu passeras de l'un à l'autre
– Choisis dans l'en-tête le groupe que tu viens de créer

7 sur 8 — Prendre les présences
C'est fait : tu es dans ton deuxième groupe.
Tu es dans « Suivi », à l'onglet « Présences ». Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi.
– Regarde l'exemple se remplir : touche « Remplir »
Après :
– La séance : la première du groupe
– Deux absences et un retard sont notés (tout le monde est présent par défaut, tu ne notes que les exceptions)
– Tu prends déjà les présences ; ici, chaque séance s'ajoute à la mémoire de ta classe
– Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)

8 sur 8 — Le groupe d'un coup d'œil
C'est fait : la séance est verrouillée.
Tu es dans « Suivi », à l'onglet « Groupe ». Reviens-y avant chaque séance.
– Chaque point blanc est un·e des dix étudiant·es ; la bande « Assiduité » le place selon ses présences
– Trois points sont à l'écart : les deux absences et le retard de la séance
– Une seule séance et la classe se dessine déjà. Séance après séance, tu verras qui s'éloigne, sans attendre une main levée
– Objectif atteint : tu es en mesure d'expliquer ce que l'application te demande pour mettre une classe en place et ce qu'elle en tire
– Chaque parcours a son objectif. C'est toi qui choisis la suite
– Pour revoir une étape, touche « 8 sur 8 »
Trois boutons de même poids : « Le refaire avec ma classe », « Voir le parcours suivant », « Terminer ».

À VÉRIFIER À L'ÉCRAN, PUIS À CORRIGER TOI-MÊME EN LE DISANT
- Les lignes « Tu es dans « X », à l'onglet « Y » » : j'ai écrit les noms d'après le code et l'accueil, sans les voir. Mets les noms exacts du menu. Aux bulles 3 et 4 de « Découvrir », ajoute cette ligne si la page a changé.
- « 2 sur 3 » à la bulle 4 de « Découvrir » : je suppose trois niveaux. Si l'écran en montre un autre nombre, corrige.
- Les valeurs de l'exemple que les lignes ne nomment pas (code du cours, numéro de groupe) : laisse la flèche les montrer.

HORS DE CE RELAIS
- « Nous faisons » de « Mettre ta classe en place » : garde ses textes actuels, ils seront revus avec Grégoire.
- « Évaluer une première production » et les six autres parcours : n'y touche pas, sauf pour les nouveaux libellés des boutons et le nom « Remplir ».
- Pas de fusion, pas de release, pas de verdict complet.

CE QUE J'ATTENDS
Vitest complet ; la sentinelle des textes mise à jour ; un passage WebKit ciblé sur ces deux parcours et sur le panneau ; un break-test par règle de moteur (a à e). Push de la branche : l'aperçu de la PR n° 23 se met à jour. Rapport court : le commit, le build de l'aperçu, ce que tu as supposé, ce que tu as corrigé d'après l'écran, les bulles qui dépassent une page à 820 px. Et une porte pour Grégoire, en gestes d'utilisateur, sur l'iPad, sans identifiants.
