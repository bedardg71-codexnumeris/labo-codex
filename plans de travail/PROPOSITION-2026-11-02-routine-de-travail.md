# Proposition : une routine qui ne te tient pas en garde

Écrit par Cowork le 2 nov. 2026 au soir, d'après `MESURE-2026-11-02-routine-de-travail.md` et notre conversation de ce soir. **Rien n'est appliqué.** Chaque changement attend ton accord, un à la fois.

## Le critère

Chaque changement se juge d'abord sur deux questions : combien de fois par jour dois-tu intervenir ? Peux-tu partir une heure sans que rien ne s'arrête ? La vitesse du code vient ensuite.

Point de départ, en ordre de grandeur (inférence : un document de coordination suppose à peu près un passage par toi) : du 19 au 29 oct., entre 13 et 44 consignes, demandes de relecture et verdicts de relecture par jour. Les 28 et 29 oct., plus de 40.

## Ce qui ne change pas

- Ce qui remonte jusqu'à toi, selon ta règle du 1er sept. : la didactique, tes données réelles, les mots que lisent tes élèves, ce qui t'engage publiquement.
- Ton rôle, tel que tu l'as dit ce soir : la mémoire du projet, la destination, et ce qui garde l'application un outil d'enseignant.
- La relecture croisée par Cowork pour ce qui ne se reprend pas : tes données réelles, les formats d'échange, les zones protégées.
- Aucun effacement irréversible. Une vérification complète avant chaque mise en ligne.

## Les changements, dans l'ordre où je les ferais

### 1. Finir la vérification chez GitHub (déjà décidée par toi le 19 oct.)

Fait : le 19 oct., GitHub a fait toute la suite en 22 min, sur 16 machines en parallèle ; ton Mac la fait en 1 h 30 à 1 h 50, sur une machine. Le préalable technique est rempli depuis le 1er nov. ; reste ton critère : trois verdicts de GitHub d'affilée qui concordent avec le Mac. Des trois lots qui retirent les pauses inutiles des essais, deux sont faits, le troisième reprend demain.

Pour toi : le Mac reste libre, plus de « ferme Chrome, Safari et Cowork ». Ton Mac ne garderait que la cinquantaine d'essais que Linux ne sait pas juger (gestes du pointeur, iPad) : quelques minutes, selon une projection. Le délai entre un correctif fini et ton iPad passerait d'environ 1 h 50 à une demi-heure (estimation).

Ce qu'il te demande : rien, c'est le chantier en cours.

### 2. Une boucle sans relais pour les petits correctifs (ta première décision)

Ce qui y entre : un correctif d'ergonomie ou de comportement qui ne touche ni tes données réelles, ni un format d'échange, ni une zone protégée, ni les mots que lisent tes élèves. C'est l'essentiel de ce que tu remontes en évaluant.

Comment :
- Tu déposes tes retours comme aujourd'hui (rapport de bug de l'application, ou un mot à Cowork).
- Les consignes vont dans une file, un fichier du dépôt. Tu lances Claude Code une fois : « Traite la file ».
- Pour chaque lot, Claude Code code, fait relire par un agent qui n'a pas vu le travail, corrige, commite. Une question qui surgit en cours de route met le lot de côté ; la file continue ; la question t'attend dans la page du tri.
- La file finie : une seule vérification, la mise en ligne, puis ta porte terrain sur l'iPad.
- Cowork relit l'ensemble une fois par jour, après coup, plutôt que lot par lot.

Pour toi : au lieu d'un passage à chaque étape de chaque lot, deux moments par jour. Déposer tes retours ; faire la porte terrain.

Ce que ça coûte : une relecture moins fine que celle de Cowork, qui connaît le projet. Une erreur peut passer en ligne et se corriger le lendemain. Pour des correctifs réversibles, en bêta, devant des usagers qui savent que « ça fait partie du contrat », je juge ce prix acceptable ; pour le reste, rien ne change.

Comment on saura si ça marche : chaque fois que Claude Code a besoin de toi, il l'écrit sur une ligne datée. Au bout d'une semaine, on compte.

### 3. Remettre les documents d'accord avec la pratique (sans toi, sauf une relecture)

- `CLAUDE.md` : la lecture obligatoire pointe vers un état court, d'une page, au lieu de `OU-EN-EST-ON.md`.
- `OU-EN-EST-ON.md` devient un journal, renommé ; rien n'est effacé.
- `PROTOCOLE.md` décrit les deux modes que l'on pratique : le chantier (règle 7, un verdict le soir) et la correction au fil de l'usage (la boucle du point 2).
- La page du tri : les catégories (rapides, intermédiaires, laborieuses, en attente de toi) se sont arrêtées le 22 oct. Je recommande de les réserver au mode chantier : tes retours vont droit dans la file, sans être classés.

Ce qu'il te demande : relire le nouveau `PROTOCOLE.md`, une page. Le reste est technique.

### 4. Freiner la croissance des essais Playwright (technique, tranché par Cowork)

Fait : les essais ont été multipliés par 5,7 depuis le 31 août, le code a grossi de 17 %. Règle proposée : ce qui se vérifie sans navigateur se vérifie avec Vitest ; un essai Playwright seulement pour ce qui exige l'écran (pointeur, mise en page, iPad).

Pour toi : rien. C'est ce qui empêche la vérification de ré-enfler après la bascule vers GitHub.

### 5. Savoir ce que les autres font de l'application (ta décision : elle t'engage publiquement)

Fait : les rapports Cloudflare voient qui ouvre l'application, jamais ce qu'on y fait, parce que les données restent dans le navigateur de chacun. La seule façon de savoir, c'est de leur demander.

Recommandation : une question courte, une fois, à ceux qui reviennent (« Qu'as-tu fait dans l'application cette semaine, et où as-tu bloqué ? »), par la communauté de pratique ou directement. Ce que ça change : parer ce qu'ils vivent plutôt que tout parer. Le texte se rédige avec toi, quand tu voudras.

## Ce que je te demande, un à la fois

Ta première décision : essayer le point 2 pendant une semaine. Les points 1 et 4 avancent sans toi. Le point 3 suit le point 2, pour que le protocole décrive ce qu'on aura essayé. Le point 5, quand tu voudras.

## Décision

Validé par Grégoire le 3 nov. 2026 à 6 h 52 : « c'est un plan de match que je valide ». La boucle du point 2 est à l'essai du 3 au 10 nov. : `BOUCLE-SANS-RELAIS.md`, `FILE-DES-CORRECTIFS.md`, `JOURNAL-DES-INTERVENTIONS.md`.
