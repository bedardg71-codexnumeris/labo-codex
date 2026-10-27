# Verdict de relecture – L'Aide, lot 2b : la Conception (#1152)

> Cowork, mardi 27 octobre 2026, 17 h 39 (Toronto, mesuré par `date`), sur `main` = `434012ce`. Lu : la demande de relecture, `TEXTES-2026-10-27-aide-critere-algorithmique.md`, les tests modifiés, deux captures (`sous-criteres`, `solo`, 1 440 px). Les 10 entrées contre-vérifiées au code du HEAD par une lecture indépendante ; ses deux « faux » revérifiés par Cowork (aucun rendu PDF ne lit le nom d'un palier : `grep palier` nul dans `js/synthese-retroaction-*.js`, `js/travaux-export-pdf.js`, `js/export-pdf.js` ; la ligne du PDF est `ligneCalculAlgo`, `js/synthese-retroaction-rendu.js:351, 402` ; aucun réglage du travail non remis dans la branche sommative de l'assistant).

## Verdict : accepté, avec une retouche

Deux affirmations sont fausses, une dizaine imprécises ; la retouche les corrige. Elle passe **après les réponses de Grégoire** sur les points du § 2.

Ce qui tient sans retouche : la forme (10 entrées, `idme` absente) ; la sentinelle neuve (break-test 13/13) ; `lecons`, `creer-echelles` et `creer-cartouches` exactes ; les valeurs de l'échelle de départ (32 ; 69,5 ; 79,5 ; 92,5) ; l'écart à la consigne sur `creer-grilles` (le message à l'enregistrement existe : bien mesuré) ; D8 dit la règle de l'écran.

**Deux choix de Claude Code, acceptés** (décisions de Cowork) :
- `sentinelle-detachement-clone` porte maintenant sur l'aide « i » de la carte, qui nomme les deux chemins : le geste reste gardé là où l'audit l'a laissé.
- La cible de mots (2 698 au lieu d'environ 2 100) : l'écart vient des textes validés de `sous-criteres`, que leurs phrases d'écran reprennent par construction (mêmes fichiers `TEXTES-…`), et du contenu neuf que la consigne demande. Le compte de toute l'Aide se refait à la fin des lots 2.

## 1. La retouche (Claude Code)

1. **`pratique`**, les « À régler », mesurés famille par famille dans l'assistant et l'éditeur : Sommative, « le traitement d'un travail non remis » est **faux** (la branche sommative offre double verrou, portfolio ou aucune règle, `js/wizard-pratique-v2.js:465-588`) ; Spécifications, un seul « Seuil d'acceptabilité (%) » pour la pratique (`index.html:5966-5973`), les types n'ont que nom et description ; Dénotation, la garde est fixe, aucun champ ne la règle (`js/pratiques/construction-attributs.js:427`) ; Standards, « les occasions de reprise […] et les cibles » : aucun champ de ce nom, mesure et dis ce qui se règle, ou retire. Chaque « À régler » ne nomme que ce qu'un champ règle.
2. **`creer-productions`** : « l'« Activité d'apprentissage » est recommandée » se lit comme un type ; c'est un champ texte, marqué recommandé (`index.html:4760`). Dis-le.
3. **`creer-grilles`** : le message ne paraît qu'à « Créer la grille » ; une grille existante s'enregistre seule, sans message (`js/grilles.js:813-834`). Dis-le.
4. **`apporter-grille`** : « Aller plus loin avec ta grille » ne propose des pistes que selon la grille ; deux cas n'ont que la phrase commune (`js/materiel.js:80-84`).
5. **`bareme`** : « quand aucune tranche ne couvre les points, le chiffre seul » ; le commentaire de cartouche du critère s'imprime aussi, avec ou sans tranche (`js/synthese-retroaction-rendu.js:404-423`). Dis « sans texte de tranche ».
6. **`sous-criteres`** : les réponses de Grégoire au § 2 (points 2 à 4), qui portent les corrections de Cowork :
   - D7, « Son PDF imprime aussi le nom court de son palier » est **faux** : retiré ;
   - D2e, « dit ce que vaut alors la note » : pour un calcul qui sert les phrases, ce menu dit ce que vaut le calcul (`js/evaluation-formules.js:199`) ;
   - D7a, « Chaque palier a un seuil » : « Rien de compté » et « Au-delà du dernier seuil » n'en ont pas (`js/atelier-algo.js:122-123`).
7. **`solo`** : « Cochée, […] le dépistage surveille les critères multistructurels » ; mesuré par la lecture indépendante, seul le suivi des fondations (IPB) s'y limite, le reste du dépistage lit tout critère qui n'est pas « Aucun » (`js/profil-etudiant-helpers.js:923-927, 960-964`). **Remesure-le** et dis ce qui est vrai, avec et sans l'option. Et la phrase D2 : la réponse de Grégoire au § 2, point 5.

Laissés tels quels : D2b et D6 (textes validés ; l'écran dit déjà que la copie sans occurrence se règle et que les codes vont au premier critère algorithmique) ; « à côté de la Simulation » (un tiroir sous 760 px, hors du Mac et de l'iPad) ; la ligne de la note remise absente des trimestres fermés (on ne rouvre pas A2025 ni H2026).

Tests : les bancs suivent les mots corrigés ; `critere-algorithmique-mots` lit les textes réglés de `TEXTES-2026-10-27-aide-critere-algorithmique.md`, dont l'en-tête passe à « validés » avec l'heure des réponses de Grégoire.

## 2. Pour Grégoire (Cowork les lui soumet, un à la fois)

1. **`creer-grilles`**, la définition D5 : « Sous un critère holistique ou analytique, « + Ajouter un sous-critère » en ajoute un : un élément observable du critère, ce que tu regardes dans toutes les copies pour en juger. Dans un critère algorithmique, un sous-critère devient une catégorie de ce que tu comptes (voir « Les critères algorithmiques »). »
2. **`sous-criteres`, le calcul** (D0, D2, D2e corrigé, D2d).
3. **`sous-criteres`, les cas et les tables** (D7a corrigé, D7b).
4. **`sous-criteres`, ce que lit l'étudiant·e et la copie déjà évaluée** (D7 corrigé, D8).
5. **`solo`, la phrase D2** : « Dans cet exemple, la maîtrise commencerait à M, le niveau relationnel, soit 75 %. Ce n'est pas une règle de l'application : elle lit où commence la maîtrise dans le repère « Maîtrisé à partir de » de ton échelle. » La seconde phrase est trop large : le repère sert aux zones de rétroaction, mais le dépistage et les bilans d'intervention gardent des seuils fixes (64, 75, 85 %, `js/interpretation-config.js:42-46` ; D3, #551). Recommandation de Cowork : garder la première phrase, retirer la seconde ; l'en-tête « Un exemple de configuration, adaptable à ton contexte » dit déjà que c'est un exemple.

Réponses de Grégoire, point par point :

- Point 1 (D5, `creer-grilles`) : **gardée telle quelle** (27 oct., 17 h 40, « oui »).
- Point 2 (`sous-criteres`, le calcul) : **D0, D2 et D2d gardés tels quels ; D2e gardé avec la correction de Cowork**, sa dernière phrase devenant « « Quand une donnée de la copie vaut 0 » dit ce que vaut alors le calcul. » (27 oct., 17 h 41, « oui »).
- Point 3 (`sous-criteres`, les cas et les tables) : **D7b gardé tel quel ; D7a gardé avec la correction de Cowork**, sa troisième phrase devenant « Chaque palier a un nom court et ce que l'étudiant·e lit ; tous, sauf « Rien de compté » et « Au-delà du dernier seuil », ont un seuil en pourcentage de la limite. » (27 oct., 17 h 42, « oui »).
- Point 4 (`sous-criteres`, ce que lit l'étudiant·e et la copie déjà évaluée) : **D8 gardé tel quel ; D7 gardé avec la correction de Cowork**, sa deuxième phrase devenant « Son PDF imprime aussi la ligne du calcul : « 7 erreurs (5 après pondération) sur 400 mots → 13,75/20 (68,8 %) ». » (27 oct., 17 h 43, « oui »).
- Point 5 (`solo`, la phrase D2) : **la première phrase gardée, la seconde retirée** (27 oct., 17 h 48, « oui »).
- Demandes neuves de Grégoire (27 oct., 17 h 48) : dans l'entrée `solo`, les valeurs ponctuelles de l'échelle IDME deviennent I = 40, D = 65, M = 75, E = 100 ; et les icônes de la taxonomie SOLO paraissent pour chaque niveau. Les quatre icônes sont déjà dans `icons/` (`solo-uni-couleur.svg`, `solo-multi-couleur.svg`, `solo-relationnel-couleur.svg`, `solo-etendu-couleur.svg`, non suivies par git, identiques à celles qu'il a jointes : sha256 vérifié par Cowork). Question posée à Grégoire : ces valeurs vont-elles aussi dans l'« Échelle de départ (IDME) » que l'application installe (`js/echelles.js:79-119`) ?
- Réponse de Grégoire (27 oct., 17 h 49) : **oui, « c'est important »** : l'échelle installée prend aussi ces valeurs. Les échelles déjà présentes dans un trimestre ne bougent pas, les siennes comprises (dit par Cowork avant la réponse, mesuré : le semis vérifie la présence de `ECHELLE_IDME_DEPART` à l'écriture, `js/echelles.js:395-399`).

## 3. Trouvé en relecture (inscrire au tableau « Trouvé hors de la section Aide », lot 5)

- L'atelier dit « Le nom court s'imprime dans la rangée des paliers de son PDF » (`js/atelier-algo.js:108`) ; aucun rendu PDF ne l'imprime. Ce que lit l'étudiant·e : la correction (imprimer le nom, ou changer la phrase) revient à Grégoire.
- La pratique affiche « Système de jetons » (« Jetons de reprise », « Reprise ciblée ») pour toute famille (`index.html:6042` et suivantes), alors que le moteur Standards n'a pas de jetons (`js/pratiques/construction-attributs.js:126`) : à mesurer, avec le constat déjà inscrit sur « Reprise ciblée » (#563).
- Vu, pour la porte de l'Aide (non inscrit) : les encadrés de l'Aide (« Exemple », « Règle les pondérations… », « Autres échelles possibles ») gardent une bordure gauche plus large, que le design system n'emploie plus (règle de Grégoire du 24 oct.) ; antérieur au lot, commun à toute l'Aide.

## 4. Les demandes neuves de Grégoire (27 oct., 17 h 48-17 h 49), dans la même retouche

1. **Les valeurs ponctuelles de l'« Échelle de départ (IDME) »** : I = 40, D = 65, M = 75, E = 100, au lieu de 32 ; 69,5 ; 79,5 ; 92,5. Ce sont les valeurs de son échelle (un commentaire de `js/portfolio.js:230` les cite déjà).
   - **Autorisé par Grégoire** : `valeurCalcul` de `niveauxDefaut` (`js/echelles.js`, l. ~85-118), malgré « NE PAS MODIFIER » ; le commentaire cite sa décision. Rien d'autre ne change dans la constante (bornes, codes, noms, paliers SOLO, couleurs).
   - **Mesure d'abord tous les lecteurs** de `niveauxDefaut` et toute copie en dur de 32 / 69,5 / 79,5 / 92,5 qui sert d'échelle IDME par défaut (le repli I/D/M/E d'`afficherCriteresDepuisGrille`, `js/evaluation-chargement.js` ; `js/interventions.js:364` ; `js/pratiques/pratiques-predefines.js:404, 426, 519, 746` ; le pack démo). **Seul le semis change.** Un site qui recalculerait une note déjà enregistrée (un repli lu par une évaluation existante) : ne le change pas, arrête-toi sur ce point et dis-le ; c'est une donnée de Grégoire. Les pratiques prédéfinies et la démo : ne les change pas, liste-les dans la demande de relecture.
   - **Tarir, pas réparer** : une échelle de départ déjà semée garde ses valeurs. Un essai le prouve (un trimestre qui a `ECHELLE_IDME_DEPART` avec les anciennes valeurs les garde après le semis ; un trimestre neuf reçoit les nouvelles).
   - Le tableau de `solo` suit (la sentinelle du lot 2b le compare au semis). Bloc de jetons d'`index.html` à jour pour `js/echelles.js`.
   - Une ligne des Nouvelles sera due à la prochaine version : ses mots reviennent à Grégoire.
2. **Les icônes SOLO** dans l'entrée `solo` : `icons/solo-uni-couleur.svg`, `solo-multi-couleur.svg`, `solo-relationnel-couleur.svg`, `solo-etendu-couleur.svg` (non suivies : commite-les). Décidé par Cowork : devant le nom de chaque niveau, dans les deux tableaux (« Niveau SOLO » et « Palier SOLO ») ; décoratives (`alt=""`), le nom les suit ; à la hauteur du texte ; regarde-les en clair et en sombre (capture des deux), et dis si une couleur se lit mal.

3. **Le niveau 0, préstructurel, partout** (Grégoire, 27 oct., 17 h 56 : « Oui, procédons aux changements partout » ; ses valeurs, 17 h 57 : « oui » à la proposition de Cowork). Son niveau à lui : aucune compréhension, aucune identification, aucune relation ; l'étudiant·e ne répond pas à ce qui est demandé.
   - **L'« Échelle de départ (IDME) »** (`niveauxDefaut`, même autorisation que le § 4.1) passe à cinq niveaux. Neuf, en tête : code « 0 », nom « Préstructurel », description « Préstructurel », palier SOLO `prestructurel`, plage 0 à 39,99 %, valeur ponctuelle 0, une couleur prise dans les variables existantes de `styles.css` (dis laquelle). Le niveau I devient : plage 40 à 64,99 %, description « Unistructurel » (au lieu de « Préstructurel, unistructurel ») ; le reste ne change pas. Le commentaire du 26 août sur le « I » composite suit.
   - **Le zéro est une valeur** (le piège connu, commentaire de `js/echelles.js` vers la l. 2525) : un niveau dont le code est « 0 » et la valeur ponctuelle 0 ne doit nulle part être pris pour une absence (`0 || x`, `if (!v)`, une clé « 0 » écartée). Fais passer une copie au niveau 0 par la note de chaque famille de pratique qui lit l'échelle, la Liste des évaluations, le profil et le PDF : elle vaut 0, elle compte, elle s'affiche « 0 – Préstructurel ».
   - **Mesure d'abord** tout ce qui lit les codes I, D, M, E en dur (le dépistage, la RàI et ses bornes fixes, les pratiques prédéfinies et leurs tables de conversion, les replis) : ce qu'un niveau « 0 » y devient. Rien ne doit recalculer une note déjà enregistrée ; si un lecteur se brise ou invente une valeur pour « 0 », arrête-toi sur ce point et dis-le. Les pratiques prédéfinies et la démo ne changent pas : liste-les.
   - **Le stock** : comme au § 4.1, une échelle de départ déjà semée ne change pas ; l'essai du § 4.1 couvre aussi le cinquième niveau.
   - **L'Aide** : le tableau SOLO de `solo` gagne la rangée « Préstructurel » en tête, avec la description que l'application emploie déjà (« Aucun aspect pertinent n'est traité », `js/echelles.js`, `NIVEAUX_SOLO_ECHELLE`) ; le tableau de l'échelle de départ gagne la rangée « 0 – Préstructurel », 0 à 39,99 %, 0 (la sentinelle du lot 2b le compare au semis). La phrase d'introduction du tableau SOLO ne dit plus quatre niveaux, si elle les compte.
   - **Le guide SOLO intégré** (`js/guides-pedagogiques.js:96`) : « <strong>0</strong> (Non recevable) ↔ Préstructurel » devient « <strong>0</strong> (Préstructurel) ↔ Préstructurel », ou sa forme la plus courte qui garde la correspondance : le nom « Non recevable » désigne déjà, à l'évaluation, une copie qui sort du calcul (décision de Grégoire, 17 h 57, sur le motif de Cowork).
   - **L'icône** : un point plein (« un simple bullet », Grégoire), `icons/solo-pre-couleur.svg`, même gabarit que `solo-uni-couleur.svg` (viewBox 18 × 70, centré verticalement sur les barres), rouge (supposé par Cowork pour prolonger la gamme orange, jaune, vert, bleu ; ex. `#CC0000`), placé comme les quatre autres.
   - La ligne des Nouvelles du § 4.1 couvre aussi le niveau 0 ; ses mots reviennent à Grégoire.

## 5. Clôture de la retouche

- Un commit pour la retouche de l'Aide (§ 1, § 2), un commit à part pour l'échelle de départ (§ 4.1, code), les icônes avec l'Aide.
- Les inscriptions du § 3 au tableau de l'audit.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-aide-lot-2b-retouche.md` (point par point ; les lecteurs mesurés de l'échelle par défaut ; l'essai du stock ; les captures des icônes).
- Pas de release, de verdict ni de push sans le signal de Grégoire.
