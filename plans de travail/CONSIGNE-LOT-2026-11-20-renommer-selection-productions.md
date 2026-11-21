Pour Claude Code, sur le Mac (relais de Cowork, session coordonnatrice, 20 nov. 2026, 20 h 50) : APPLIQUER le renommage de la pratique actuelle. L'arbre principal porte `lot/gel-etape-7` : prends un arbre à part et dis-le en tête du rapport. Copie ce relais tel quel dans `plans de travail/CONSIGNE-LOT-2026-11-20-renommer-selection-productions.md`.

CE QUI A CHANGÉ DEPUIS TON INVENTAIRE (`INVENTAIRE-2026-11-20-renommer-productions-retenues.md`, fbd3f73e).
- Ton constat sur le nom commun a porté : Grégoire a abandonné « Par productions retenues ». Le nom est « Par sélection de productions » (20 h 02).
- Cette pratique cessera d'être proposée aux nouveaux utilisateurs le jour où la vraie pratique « Par standards » existera ; son calcul n'est jamais retiré tant qu'un codex s'en sert (20 h 03). Le renommage se limite donc à vingt textes : là où on la choisit et là où on la nomme. Le reste de l'aide, du glossaire et des parcours ne se touche pas dans ce lot.
- Grégoire a lu les vingt textes et les a tous acceptés, mot pour mot (20 h 44). Ne les reformule pas.
- Sa pratique de l'automne se rend jusqu'au bout telle qu'elle est annoncée dans son plan de cours : AUCUN calcul, aucun identifiant, aucune donnée ne change. Le badge « STD » reste. Le préfixe « PAN – » reste. La colonne « Pratique (code) » de l'export reste `STD`.

LES VINGT TEXTES, avec les repères de ton inventaire. « … » : le reste de la phrase ne change pas.
V1 : « Choisis un modèle, par sélection de productions ou par spécifications, et la règle qui construit la note. »
V2 : « … n'est ni par sélection de productions ni par spécifications se suit en vue étendue. »
V3 (titre du modèle, donc nom de la pratique créée) : « Par sélection de productions »
V4 (bouton) : « Choisir ce modèle »
V5 : « … n'est ni par sélection de productions ni par spécifications : elle se règle en vue étendue. »
V6 : « Le tableau sert aux pratiques par sélection de productions et par spécifications. … »
T1 : « Le tableau de notation sert aux pratiques par sélection de productions et par spécifications. … »
A1 (nom) : « PAN – Sélection de productions »
A1 (description, ta ligne D4) : « Tu évalues chaque production par niveaux (ex. : I-D-M-E). La note se construit à partir des productions que ta règle retient, pas de la moyenne de toutes. »
A2 (nom, sans code entre parenthèses) : « PAN – Sélection de productions »
A2 (description, ta ligne D5) : « Des niveaux (ex. I-D-M-E) ; la note retient certaines productions. »
A3 : « Configuration PAN – Sélection de productions »
A4 : « Cette pratique s'appuie sur le portfolio : … »
A5 : « Ici, la note repose sur plusieurs productions : à l'étape suivante, tu choisis lesquelles elle retient … »
A6 : « Par sélection de productions, la note se construit sur le portfolio ; … »
M1 : « … avant de créer cette pratique par sélection de productions. … »
F3 (menu « Type », lu aussi par l'étape « Méthode ») : « PAN – Sélection de productions »
F4 : « **PAN – Sélection de productions** : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » … »
F10, P1, P2, donc E1 (nom affiché quand la pratique n'a pas de nom à elle) : « PAN – Sélection de productions »
M5 : « Seule l'évaluation terminale a une note. Par sélection de productions, la note du cours s'appuie aussi sur les productions retenues … »

À NE PAS TOUCHER. « Mes standards sont très élevés à ton égard … » ; les Nouvelles déjà publiées ; tout texte hors de cette liste, même s'il dit « standards » ; les noms des pratiques déjà créées chez les gens (le stock reste, tu le dis au rapport).

LA LIGNE DES NOUVELLES, acceptée par Grégoire, à garder pour la release (ne l'écris pas dans `js/changelog-data.js` dans ce lot) : « La pratique « Standards » s'appelle maintenant « Par sélection de productions ». Le nom dit ce que fait le calcul : chaque production reçoit un niveau et la note se construit à partir de celles que ta règle retient. Tes pratiques, tes réglages et tes notes ne changent pas. Une pratique que tu avais nommée toi-même garde son nom. »

DÉCIDÉ PAR COWORK (technique).
- Les bancs et sentinelles qui épinglent ces vingt textes suivent, avec un break-test. Si une sentinelle relit un fichier de textes validés, crée le nouveau fichier de textes validés au lieu de retoucher l'ancien.
- La sentinelle du lot 0 (`lot/moteur-cibles-0-garde`, 567f251a) n'est pas sur main : si tu peux la rejouer sur cette branche sans la fusionner, fais-le et donne les chiffres ; sinon dis-le.
- En tête de ton inventaire, ajoute trois lignes : le nom retenu, la portée réduite à vingt textes, et que le reste de l'inventaire attend.
- Sur `lot/standards-conception`, le skill annonce que la famille change de nom : le nom exact y sera aligné quand les branches se rejoindront. N'y touche pas d'ici.

MESURE. Vitest depuis tests/, un seul worker, puis les bancs Playwright qui portent ces textes, sous WebKit, un navigateur à la fois, sur secteur. Le verdict complet se prendra plus tard, pour le groupe.

LIVRAISON. Une branche à toi, `lot/renommer-selection-productions`, partie de main. Aucune fusion. Si le hook refuse le push pour une raison hors de ce mandat, ne contourne pas et dis-le.

RAPPORT : un bloc de code de douze lignes au plus, pour la session coordonnatrice. Le commit ; les vingt textes posés, et tout écart au mot près ; ce que tu as trouvé en chemin sans y toucher ; les bancs suivis et leur break-test ; les chiffres de la garde si tu as pu la rejouer ; ce qu'une personne verra encore dire « standards » pour cette pratique.
