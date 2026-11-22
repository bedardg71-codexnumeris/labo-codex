Pour Claude Code (session du cloud), à relayer : les parcours après « Par standards », neuf corrections de mots et « 0 – Aucun ».

BRANCHE. Pars de `origin/claude/essai-parcours-20-nov-k85n8g` (= `c5ab529a`, les corrections de l'essai du 20 nov., PR n° 43). Sur ta propre branche, fais d'abord `git merge --no-ff origin/main` (= `78e95229`, la 1.254.0). Conflits attendus : les lignes de jetons `?v=` d'`index.html` et `BACKLOG.md` ; même règle que le 20 nov. (garder les deux côtés, un jeton neuf par fichier, rien de retiré). PR en brouillon intitulée « APERÇU, ne pas fusionner », aperçu Netlify. Écris dans le rapport l'adresse « Deploy Preview » que Netlify pose dans la PR. Ni fusion dans main, ni release, ni bump, ni changelog. Les commits « BRANCHE SEULEMENT » qui ouvrent les parcours restent tels quels : ils seront annulés avant toute fusion. Le dépôt est public : aucun nom réel.

PREMIER COMMIT. Copie cette consigne telle quelle dans `plans de travail/CONSIGNE-2026-11-22-parcours-apres-par-standards.md`.

CONTEXTE. Depuis la 1.252.0, la pratique qui s'appelait « Standards » s'appelle « Par sélection de productions », sigle « SEL ». « STD » et « Par standards » vont à une pratique neuve, où l'on inscrit des niveaux sur des cibles. Les bulles du parcours 3 (« Évaluer une première production ») ont été écrites avant : quatre phrases sont devenues fausses. Les textes ci-dessous sont validés par Grégoire le 22 nov. 2026, mot pour mot : aucune retouche.

A. PARCOURS 3, QUATRE PHRASES (`js/parcours-evaluer.js`).

A1. Bulle 2, dans les deux temps (« Je regarde » et « Nous faisons », voie « Partir d'un modèle »). « Le code à côté du nom dit sa famille : SOM pour la sommative, STD pour les standards ; les autres codes désignent d'autres pratiques alternatives. » devient : « Le code à côté du nom dit sa famille : SOM pour la sommative, SEL pour la sélection de productions, STD pour les standards ; les autres codes désignent d'autres pratiques. »

A2. « Je regarde », bulle 2. « L'exemple prend « N meilleures évaluations », par standards : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10 » devient : « L'exemple prend « N meilleures évaluations », par sélection de productions : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10 »

A3. « Je regarde », bulle 2, au récapitulatif. « Le récapitulatif dit sa famille et ce qu'elle fait : « PAN – Standards » (PAN : pratique alternative de notation) » devient : « Le récapitulatif dit sa famille et ce qu'elle fait : « Par sélection de productions » ». Fais juger par le banc que le récapitulatif affiche bien ces mots pour « N meilleures évaluations ». S'il affiche autre chose, ne change pas la bulle : rapporte ce qu'il affiche.

A4. « Je regarde », bulle 3. « Par standards, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau » devient : « Avec cette pratique, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau »

Après la fusion de main, rejoue les bancs des deux temps du parcours 3 et celui de « Recevoir » (il dépend du modèle) : l'écran « Choisis un modèle » porte maintenant une carte de plus (« Modèle par standards ») et le sigle « SEL ». Les sentinelles des textes suivent A1 à A4. Le parcours 9 (« notation alternative ») n'est pas touché : il sera réécrit plus tard.

B. « 0 – AUCUN » DANS L'« ÉCHELLE DE DÉPART (IDME) » (le G1 du rapport du 20 nov., que tu avais mesuré sans le faire). Décision de Grégoire, 22 nov. : le premier niveau « PS – Préstructurel » devient « 0 – Aucun », et le renommage ne change aucun calcul : ce niveau reste rangé avec « I » au tableau de bord (`js/tableau-bord-apercu.js`, vers l. 977) et reste compté à part dans l'archive d'un trimestre (`js/trimestres.js`, vers l. 2622), exactement comme « PS ». À la source seulement : les échelles déjà installées chez les gens gardent « PS – Préstructurel » et leurs calculs ne bougent pas.

B0. GARDE, À MESURER AVANT D'ÉCRIRE. Ton rapport du 20 nov. note que l'échelle « IDME et niv 0 » de la démo a déjà un niveau « 0 – Aucun », que ces deux calculs ne comptent pas avec « I ». D'autres échelles portent aussi un code « 0 » : celles que des enseignant·es ont créées, et l'« Échelle de départ – Par standards » (« 0 – Données insuffisantes »). La décision ne vaut que pour l'« Échelle de départ (IDME) ». Mesure comment les deux calculs reconnaissent le niveau (par son code, par l'échelle, par sa position). Si tu ne peux pas borner la règle à l'« Échelle de départ (IDME) » sans changer ce que ces calculs rendent pour une autre échelle qui porte un code « 0 », ARRÊTE-TOI là pour B : ne touche à rien de B, et rapporte les effets, échelle par échelle. Aucun compte existant ne doit bouger.

B1. Description de l'échelle (`js/echelles.js`, vers l. 403). « Cinq niveaux — Préstructurel, Incomplet, Développement, Maîtrise, Étendu. » devient : « Cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu. » La suite de la description ne change pas.

B2. Carte d'aide, première rangée du tableau qui relie l'échelle aux paliers SOLO (`index.html`, vers l. 10607). « PS – Préstructurel » devient « 0 – Aucun » ; en face, à la place du palier SOLO et de son icône : « L'évaluation n'est pas possible (aucune donnée, plagiat, usage interdit de l'IA). » Les quatre autres rangées ne changent pas. L'autre tableau de la carte (les paliers SOLO eux-mêmes, vers l. 10570) ne change pas.

B3. Guide pédagogique SOLO (`js/guides-pedagogiques.js`, vers l. 96). « PS ↔ Préstructurel, I ↔ Unistructurel, D ↔ Multistructurel, M ↔ Relationnel, E ↔ Abstrait étendu. » devient : « I ↔ Unistructurel, D ↔ Multistructurel, M ↔ Relationnel, E ↔ Abstrait étendu. Le niveau 0, « Aucun », sert quand l'évaluation n'est pas possible. » Le début du paragraphe et la phrase qui suit ne changent pas ; les ↔ gardent leur forme actuelle.

B4. Définition du terme (`js/accompagnement-contenu-terme.js`, vers l. 118). « « PS – Préstructurel » en tête » devient « « 0 – Aucun » en tête ». Le reste ne change pas.

B5. « Cartouche de départ » (`js/cartouches.js`, vers l. 173 à 200). Sa colonne « PS » devient la colonne « 0 » ; ses quatre commentaires deviennent, aux quatre critères : « L'évaluation n'est pas possible. » Recopie les quatre commentaires retirés dans ton rapport, mot pour mot : Grégoire veut pouvoir les réemployer.

Une fois B fait, vérifie que la bulle 4 du « Nous faisons » du parcours 3 (« à cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu ») dit ce que l'écran affiche dans un trimestre neuf. Fais suivre les bancs qui citent « PS » ou « Préstructurel » pour l'échelle de départ.

C. DEUX MESURES, EN LECTURE SEULE, SANS RIEN CORRIGER (elles préparent une branche des parcours pour les cibles, à concevoir plus tard avec Grégoire).
C1. Dans le « Nous faisons » du parcours 3, bulle 2, que se passe-t-il quand la personne choisit « Modèle par standards » ? L'assistant ouvre l'étape des cibles : la bulle la couvre-t-elle, que dit-elle, sur quoi avance-t-elle, et que deviennent les bulles 3 à 10 ?
C2. Dans un groupe dont la pratique est « Par standards », que montre la bulle 10 (« Le point qui s'allume », bande « Performance (P) ») après une évaluation verrouillée d'une production ? Et les autres parcours se lancent-ils sans refus ?

D. TESTS. Vitest complet. Playwright Chromium, aux deux tailles, pour les bancs touchés ; un break-test pour A (un mot changé dans une des quatre phrases fait rougir la sentinelle) et un pour B (le niveau « 0 » de l'échelle de départ sorti du rang de « I » fait rougir). Les rouges déjà là sur la base : vérifie-les sur l'arbre de la base et marque-les comme tels.

E. RAPPORT. `plans de travail/RAPPORT-2026-11-22-parcours-apres-par-standards.md` : ce qui est fait, ce qui est mesuré, ce qui est supposé, ce qui n'est pas vérifié (Safari, l'iPad) ; les conflits de la fusion et comment ils sont tranchés ; la garde B0 et son verdict ; les réponses à C1 et C2 ; les quatre commentaires retirés en B5 ; l'adresse de l'aperçu ; toute trouvaille avec l'une des trois issues. Les codex de départ (`departs/`) ne sont pas à refabriquer dans ce lot : dis seulement s'ils sont encore à l'ancienne.
