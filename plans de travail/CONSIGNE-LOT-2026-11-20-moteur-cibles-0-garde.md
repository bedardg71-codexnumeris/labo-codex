Pour Claude Code (relais de Cowork, 20 nov. 2026, 18 h 55) : le LOT 0 du moteur par cibles, la garde. Ton plan `plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md` (dc44bb7) est lu en entier et accepté : la collection à part, la famille à elle, les cinq lots dans ton ordre.

Avant de commencer : si une autre session travaille déjà sur cette machine, prends un arbre à part (git worktree add) et dis-le en tête du rapport. Copie ce relais tel quel dans `plans de travail/CONSIGNE-LOT-2026-11-20-moteur-cibles-0-garde.md`.

DÉCIDÉ PAR GRÉGOIRE (20 nov., 18 h 46 et 18 h 47), à porter en tête de ton plan, dans une courte section datée :
- Il termine son trimestre avec sa pratique et son moteur actuels. Ce moteur reste dans l'application ensuite, tel qu'il est.
- On construit une vraie pratique de notation par standards : le noyau en quatre gestes, puis les couches (pondération par cible, double seuil, notes qualitatives, autres règles de retenue).
- Le prix du noyau est accepté : dans cette pratique, ni complétion, ni dépistage ou rétroaction par critère, ni PDF de synthèse.
- Il expérimentera probablement cette pratique lui-même à l'hiver 2027. Conséquence, confirmée par lui : le pont « un critère de grille alimente une cible » (ta question de didactique n° 4) n'est plus « pas dans ce plan ». Il devient une couche à livrer avant sa rentrée d'hiver, après le noyau. Ne le conçois pas dans ce lot ; corrige seulement ta recommandation n° 4 pour le dire.
Les autres questions de didactique et les mots restent ouverts : Cowork les règle avec lui, une par tour. Le lot 1 attend les mots.

LE LOT 0, tel que ton plan le décrit (§ 6 et § 8). Rien dans js/, index.html ni styles.css.
1. La sentinelle de non-ingérence. Rejoue les cas déjà épinglés (au moins la sommative du golden master, GREG-0 à GREG-2, un cas de spécifications, un cas de dénotation) dans un espace qui contient AUSSI un ensemble de cibles, une pratique par cibles non active et des inscriptions pour les mêmes DA : mêmes chiffres, au centième. Les objets neufs sont posés à la main dans la base de l'essai, dans la forme de ton § 3.
2. Le cliquet de silence. Les fichiers des moteurs existants que tu as listés (§ 6, point 2) ne nomment ni la clé neuve ni la méthode neuve. Arrête ici les deux noms techniques, ils sont à toi : la clé et la méthode. Rappel de ta propre trouvaille : pas le jeton que garde la sentinelle #396.
3. Un break-test pour chacun : muter un moteur existant pour qu'il lise la clé neuve fait rougir l'essai ; dis lequel et montre le rouge.
4. Le sens inverse (la pratique par cibles ne lit pas les évaluations) ne peut pas s'épingler avant que le moteur existe : inscris-le comme essai à écrire au lot 4, dans le plan.
Des noms manifestement fictifs ; aucun nom réel ; aucun collègue nommé.

MESURE. Vitest seulement, depuis tests/, un seul worker. Aucun navigateur, aucun verdict complet : ce lot n'ajoute que des essais. Donne le compte avant et après.

LIVRAISON. Une branche à toi, `lot/moteur-cibles-0-garde`, partie de main, avec le plan retouché et la consigne. Aucune fusion : elle partira vers main dans un groupe, avec son verdict. Si le hook refuse le push pour une raison hors de ce mandat, ne contourne pas et dis-le.

RAPPORT : un bloc de code de dix lignes au plus, pour la conversation du Projet. Le commit ; les cas rejoués et leurs chiffres ; les deux noms arrêtés ; le break-test et son rouge ; le compte des essais avant et après ; ce qui t'a surpris.
