Pour Claude Code, sur le Mac (relais de Cowork, session coordonnatrice, 20 nov. 2026, 21 h 25) : LE LOT 1 de la pratique « Par standards » : dire les cibles du cours. Session de nuit possible : tranche le technique sans attendre ; ce qui revient à Grégoire, laisse-le, note-le et continue. Si une autre session travaille sur la machine, prends un arbre à part et dis-le en tête. Copie ce relais tel quel dans `plans de travail/CONSIGNE-LOT-2026-11-20-moteur-cibles-1-cibles.md`.

OÙ ON EN EST. Grégoire a lu le modèle tiré de ta fiche `CONCEPTION-2026-11-20-pratique-par-standards.md` et l'a approuvé (20 h 32). Cowork a sondé cinq pages du rapport contre la fiche (p. 98, 99, 102, 103, 108) : exactes. Sa pratique de l'automne ne change pas ; tout ceci est un moteur neuf, à côté.

DÉCISIONS DE GRÉGOIRE DEPUIS TON PLAN, à porter en tête de `PLAN-2026-11-20-moteur-par-objectifs.md`, dans une section datée, puis à répercuter dans les lots.
- Le modèle : une cible a une étiquette, un énoncé, des critères dont certains essentiels, un poids, et elle est terminale ou non. L'échelle a un niveau nommé pour l'absence de données valables, qui vaut 0 %. Inscrire un niveau est un jugement. Le niveau retenu est le meilleur démontré. La note est une moyenne pondérée. Le double seuil fait partie du cœur (fiche, É1 à É4).
- Un niveau déjà communiqué ne redescend jamais, même pour une cible jugée sur un ensemble de traces : répondu de vive voix par l'auteur principal des sources, rapporté par Grégoire. Ta question 2 est donc réglée ; « le meilleur » vaut dans tous les cas ; la couche « retenue par jugement » est retirée.
- Chaque niveau inscrit peut porter une note brève : c'est la rétroaction, pas un champ accessoire (lot 2).
- Une cible sans donnée : pendant la session, aucune note chiffrée et la liste des cibles en attente (choix de Grégoire, sans source) ; à l'arrêt des notes, 0 % (rapport, p. 103). À l'écran, elle porte le nom du niveau « sans donnée » de l'échelle, pas un vide.
- Le poids de chaque cible se règle par l'enseignant·e. Se conformer au plan-cadre est son affaire : l'application ne le vérifie pas.
- Les mots : « cible », et « cible d'apprentissage » à la première mention, sur les écrans de l'enseignant·e. Le mot que lit l'étudiant·e n'est pas tranché. La pratique s'appelle « Par standards ». La pratique actuelle devient « Par sélection de productions » (lot à part, en cours) ; elle cessera d'être proposée quand celle-ci existera, sans que son calcul soit retiré.
- Un relevé par cible pour l'étudiant·e suit le cœur de près. Puis un pont entre les critères d'une grille et les cibles, avant l'hiver 2027 : ne le conçois pas.
Les lots deviennent : 1 les cibles et l'échelle ; 2 inscrire un niveau ; 3 le niveau retenu ; 4 la note, avec pondération et double seuil ; 5 le relevé de l'étudiant·e.

LA BRANCHE. `lot/moteur-cibles-1-cibles`, partie de `lot/moteur-cibles-0-garde` (567f251a). Réunis-y `lot/standards-conception` (la fiche et le skill). Si `lot/renommer-selection-productions` est livrée, réunis-la aussi ; sinon dis-le, et l'assistant montrera deux « standards » sur cette branche en attendant. RIEN ne se fusionne dans main avant que les quatre gestes existent et que Grégoire les ait essayés. Ouvre une PR « APERÇU : Par standards, lot 1, ne pas fusionner », pour l'adresse Netlify.

LE LOT 1 : CE QUE L'ENSEIGNANT·E VOIT.
- Dans l'assistant de pratique, un choix de plus : « Par standards ».
- Une étape où il ou elle dit les cibles du cours. Pour chaque cible : une étiquette courte ; un énoncé ; ses critères, un par ligne, chacun pouvant être marqué « essentiel » ; un poids ; une case « terminale ». On ajoute, on retire, on monte, on descend. Les poids sont égaux d'office et leur total se lit.
- Le choix de l'échelle, et la désignation du niveau qui veut dire « sans donnée ». Propose une échelle de départ à cinq niveaux dont les valeurs suivent le rapport (0, 25, 50, 75, 100), avec des noms à faire valider par Grégoire.
- La fiche de la pratique montre les cibles. Un groupe-cours peut recevoir cette pratique.
- Elle ne calcule encore rien : la note dit pourquoi, en mots.

LE LOT 1 : DANS LE CODE (décidé par Cowork, corrige-moi au rapport si la mesure dit autre chose).
- Un type et une méthode à elle (tes noms du lot 0), hors de la famille actuelle ; la liste de contrôle des onze fichiers de ton plan.
- L'ensemble de cibles : rangé par trimestre, rattaché au cours, inscrit à tous les registres nominatifs. Chaque cible et chaque critère ont une identité permanente. Forme d'une cible : identité, étiquette, énoncé, critères (identité, texte, essentiel), poids, terminale.
- La pratique désigne son ensemble, son échelle et le niveau « sans donnée ». Refus, avec le motif en mots : aucune cible ; aucune échelle ; aucun niveau « sans donnée » désigné ; un poids nul ou négatif.
- Le composant des cibles de la dénotation est réemployé et étendu ; les cibles de la dénotation ne bougent pas.
- Les retraits que ton plan prévoyait (l'écran orphelin des ensembles d'objectifs, la fonction sans appelant, le gabarit s'il n'est offert nulle part) : dans un commit à part. Aucune donnée d'utilisateur n'est effacée ni réécrite, pas même l'ancienne clé des ensembles.
- Aucune entrée de navigation neuve.

LES TEXTES. Tout mot affiché est une PROPOSITION : rassemble-les dans `plans de travail/TEXTES-2026-11-20-par-standards-lot-1.md`, un par ligne, avec l'endroit où on le lit. Grégoire les recevra en une page à corriger ; ils vivent sur l'aperçu d'ici là. Imposés : « cible », « cible d'apprentissage », « Par standards », « critère essentiel ». Ne dis nulle part que cette pratique est « la vraie » ni que l'autre est fausse : le skill reste pluraliste.

L'ORIGINE DE CHAQUE RÈGLE. Dans le plan révisé, chaque règle didactique du lot renvoie au numéro de ta fiche (C1 à C8, E1 à E6) ou porte « choix de Grégoire ».

MESURE. Vitest, un seul worker, avec un break-test par sentinelle ; la sentinelle du lot 0 rejouée, chiffres au rapport ; les modèles existants de l'assistant s'écrivent comme avant, octet pour octet. Puis les écrans neufs sous WebKit, un navigateur à la fois, sur secteur. Captures à 1180 × 820 et à 820 × 1180, en clair et en sombre, noms manifestement fictifs. Skills à charger : `pratiques-notation`, `design-interface`.

LIVRAISON. La branche poussée, la PR d'aperçu ouverte, aucune fusion. Si le hook refuse le push pour une raison hors de ce mandat : c'est une branche d'aperçu, contourne et nomme les rouges.

RAPPORT : un bloc de code de quinze lignes au plus, pour la session coordonnatrice. Le commit et l'adresse de l'aperçu ; ce que tu as réuni sur la branche ; la forme retenue et ce que tu as corrigé dans mes décisions ; les refus et leurs mots ; le nombre de textes proposés ; les bancs, leurs break-tests, les chiffres de la garde ; ce qui remonte à Grégoire ; ce qui t'a surpris.
